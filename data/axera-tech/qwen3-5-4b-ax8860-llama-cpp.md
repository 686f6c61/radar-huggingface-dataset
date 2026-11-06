# AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp

## Resumen

Qwen3.5-4B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH para ejecutar el modelo Qwen3.5-4B sobre la NPU AX8860 mediante kernels compilados en formato `.axmodel` y un GGUF con cuantizacion mixta MXFP4. No se trata de un modelo entrenado por AXERA-TECH, sino de una adaptacion de inferencia: el checkpoint original de Qwen3.5-4B (4.326.350.848 parametros) se convierte a GGUF BF16, se cuantiza con sobrescritura de tensores MXFP4 y se acompaña de kernels de prefill, decode, cabeza de salida y ViT para la NPU.

El interes tecnico esta en que demuestra una ruta completa de inferencia en hardware NPU con perdida de perplejidad muy contenida: PPL en NPU de 25,5670 frente a 25,1465 en CPU host sobre el mismo GGUF, un incremento del 1,67 %. El paquete incluye el camino de texto de 32 capas, dos grupos de decode de 16 capas, la cabeza de salida y un ViT de 3072 parches, con contexto limitado a 16384 tokens.

La relevancia actual es de nicho pero clara: para equipos que evaluan despliegue de LLMs en aceleradores AX8860, este repositorio ofrece artefactos verificados con sumas MD5, manifiesto de E/S y resultados de placa medidos (throughput de decode de 60,60 tok/s y prefill de aproximadamente 7,68k tok/s en 4008 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion y capas GDN (gated delta network), 32 capas; ViT de 3072 parches para vision |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16384 tokens (unica longitud soportada en esta release) |
| Tipos de cuantizacion | MXFP4 nativo en proyecciones del transformer; `token_embd` y cabeza de salida en Q8_0; mmproj en BF16 |
| Idiomas soportados | no disponible (la model card solo menciona evaluacion de PPL en chino con `assets/ppl_zh.txt`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-4b-mxfp4.gguf`, 2.659.491.712 bytes), GGUF mmproj BF16 (675.569.216 bytes) y kernels `.axmodel` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 32 capas con dos tipos de capa diferenciados: capas de atencion (`layer.attn`) y capas GDN (`layer.gdn`), segun los descriptores de E/S incluidos en `kernels/`. El paquete de inferencia organiza el camino de texto en un unico kernel de prefill para las 32 capas, que itera en tiempo de ejecucion sobre ocho bancos de pesos `b0..b3`, y una familia de kernels de decode por grupos de 16 capas, con dos llamadas por token. Las proyecciones del grupo de decode leen sus pesos desde los bancos del prefill mediante entradas `k_<bank>`, de modo que la columna vertebral mantiene una sola copia en CMM.

La cuantizacion se realizo con `llama-quantize` en modo `Q8_0` aplicando sobrescrituras `--tensor-type ...=mxfp4` a `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_qkv`, `attn_gate`, `ffn_gate`, `ffn_up`, `ffn_down` y `ssm_out`; `token_embd` permanece en Q8_0 y la cabeza de salida esta atada a el. Los tensores MTP `blk.32.nextn.*` estan presentes pero no se usan. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO, ya que la model card se centra exclusivamente en el proceso de conversion, cuantizacion y validacion en placa.

## Capacidades

- Generacion de texto conversacional: la prueba greedy con `-n 64` produce un prefijo de razonamiento coherente y con `-n 256` alcanza la respuesta "Paris".
- Razonamiento de multiples pasos: el prefijo generado se describe como razonamiento coherente en la validacion de placa.
- Vision: el paquete incluye un ViT de 3072 parches y un mmproj BF16; la prueba con `bus.jpg` genera una descripcion coherente de un autobus electrico azul y blanco.
- Procesamiento de imagenes con hasta 768 tokens de salida en la prueba realizada (25 s, n=128).
- Soporte de contexto de 16384 tokens para prefill y decode.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo hay evidencia de evaluacion de perplejidad en chino.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Audio: no disponible.

## Casos de uso

- Despliegue de un LLM de 4B en NPU AX8860 para asistentes conversacionales embebidos: el paquete ofrece kernels de prefill y decode listos para placa, con 60,60 tok/s de decode y carga de 9,07 s, adecuado para interfaces de chat con latencia interactiva.
- Procesamiento de documentos e imagenes en el borde: el ViT de 3072 parches y el mmproj BF16 permiten describir imagenes en 204,465 ms por llamada al ViT, util para inspeccion visual o accesibilidad en dispositivos con NPU.
- Analisis de contexto largo en chino: con 16384 tokens de contexto y una PPL en NPU de 25,5670, el modelo sirve para resumir o extraer informacion de documentos extensos en ese idioma.
- Validacion de pipelines de cuantizacion MXFP4: el repositorio documenta el comando exacto de conversion y cuantizacion, lo que permite reproducir la receta para otros checkpoints Qwen3.5 y comparar la degradacion de PPL.
- Benchmarking de hardware NPU frente a CPU: los resultados de placa (PPL NPU frente a host, tiempos de prefill por pagina de 256 filas de 32,605 ms) permiten comparar el acelerador con alternativas de CPU en la misma carga.
- Prototipado de asistentes multimodales en entornos con restricciones de memoria: el pico de CMM es de 3,405 GiB y el VmHWM del host de aproximadamente 1 GB, lo que encaja en plataformas con memoria limitada.
- Integracion en servicios compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere su uso detras de una API conversacional, aunque no se detalla el servidor concreto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| PPL en chino, NPU (512, 2 chunks) | 25,5670 +/- 3,66917 |
| PPL en chino, CPU host (mismo GGUF) | 25,1465 +/- 3,65724 |
| Degradacion NPU frente a CPU | +1,67 % |
| Prefill 4k, por pagina de 256 filas | 32,605 ms |
| Prefill 4k, 16 paginas | 521,7 ms |
| Prefill 4k, wrapper de todas las paginas | 549,9 ms |
| Prefill 4008 tokens | aproximadamente 7,68k tok/s (excluye conversion de bancos de 5,62 s) |
| Decode | 60,60 tok/s (16,50 ms/token, 127 ejecuciones) |
| Carga del modelo | 9,07 s |
| Carga del servidor | 21 s |
| ViT, una llamada | 204,465 ms |
| Pico de CMM | 3.655.290.880 B (3,405 GiB) |
| CMM estable | 3.655.299.072 B (3,405 GiB) |
| VmHWM del host en carga / estable | 1.046.280 KB / 1.063.012 KB |
| RSS del host en carga (anon / file) | 264.812 KB / 766.836 KB |
| RSS del host estable (anon / file) | 375.600 KB / 687.412 KB |
| Temperatura tras la ejecucion | 54,8-57,1 C |

Comprobaciones de fidelidad numerica: coseno por fila en prefill CRUN frente a referencia HF con pesos MXFP4, media 0,999851 y minimo 0,999035; grupo de decode 0, coseno de salida 0,999988; cadena completa de 32 capas, coseno de salida 0,999923; ViT 3072, media tras capa 23 de 0,995667 y minimo de 0,712629, con salida media de 0,997883 y minimo de 0,691175.

## Requisitos de hardware

- NPU AX8860 como plataforma objetivo; los kernels `.axmodel` estan compilados para `npu4` (y descriptores `npu1` para capas).
- Memoria CMM requerida: 3,405 GiB en pico y en regimen estable.
- Memoria del host: VmHWM de aproximadamente 1,02-1,04 GB; RSS anonimo de 264-375 MB y RSS de fichero de 687-766 MB.
- Almacenamiento: repositorio de 3,5 GB; GGUF MXFP4 de 2,66 GB y mmproj BF16 de 675,6 MB.
- No se dispone de datos sobre ejecucion en GPU consumer (RTX 4090 u otras); el paquete esta orientado a NPU AX8860.
- Opciones de despliegue: binario dinamico AX8860 en `bin/`, derivado de la release de 9B sobre llama.cpp en el commit `dc4a61d`; no se documentan vLLM, Ollama ni TGI para este paquete.
- Latencia y throughput medidos: decode de 16,50 ms/token y prefill de aproximadamente 7,68k tok/s en 4008 tokens.
- Contexto limitado a 16384; no se incluyen MTP, KV en int8 ni contextos mas largos en esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-AX8860-llama.cpp | 4.326.350.848 | 16384 | GGUF MXFP4 + kernels `.axmodel` para NPU AX8860 | no disponible | Paquete de despliegue verificado en placa, con PPL y throughput medidos |
| Qwen3.5-4B (checkpoint original) | 4.326.350.848 | no disponible | safetensors (15 ficheros, 8,8 GB) | no disponible | Referencia de fidelidad usada en las comprobaciones de coseno |
| Release AXERA-TECH de 9B | no disponible | no disponible | GGUF MXFP4 + kernels `.axmodel` | no disponible | Mencionada como origen del binario dinamico y de la receta de cuantizacion |
| Release AXERA-TECH de 2B | no disponible | no disponible | GGUF MXFP4 + kernels `.axmodel` | no disponible | Mencionada como parte de la misma familia de recetas |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto fijo de 16384 tokens: no se soportan MTP, KV en int8 ni contextos mas largos en esta release.
- Los tensores MTP `blk.32.nextn.*` estan presentes en el GGUF pero no se utilizan, por lo que no cabe esperar decodificacion especulativa.
- La validacion de calidad se limita a PPL en chino y a comprobaciones de coherencia cualitativas; no hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.
- La compuerta generica de coseno minimo por fila (`.999`) no se cumple en el ViT, igual que ocurre en los ViT de 9B y 2B a profundidad completa; la validacion se apoya en una compuerta de descripcion de imagen en placa.
- El paquete esta atado a hardware AX8860 y al commit `dc4a61d` de llama.cpp; no es portable a GPU sin recompilar y recuantizar.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido.
- No hay informacion sobre sesgos, idiomas soportados oficialmente ni riesgos de alucinacion especificos del modelo base.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad.
- La cuantizacion MXFP4 en proyecciones introduce una degradacion medible de PPL (+1,67 % frente a CPU sobre el mismo fichero), aceptable para la compuerta del 5 % pero no despreciable en tareas sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
