# DMAIC-ASI/Qwen3.8-27B-DMAIC_ASI-S16-SA-GGUF

## Resumen

Qwen3.8-27B-DMAIC_ASI-S16-SA es una cuantizacion GGUF del modelo Qwen3.8-27B de Alibaba Qwen en la que se ha fusionado (merge) previamente el super-adapter de harness-hub, una LoRA entrenada especificamente para entornos de agentes (pi, Hermes Agent, OpenCode). El resultado lo publica DMAIC ASI Research como un unico fichero de 13,2 GB que cabe en una GPU de 16 GB y que, combinado con un build modificado de llama.cpp con cache KV en NVFP4, permite servir mas de 100.000 tokens de contexto en tarjetas RTX 50-series (Blackwell).

El modelo resuelve un problema practico: en lugar de cargar el GGUF base y aplicar el adaptador como fichero `--lora` separado (lo que consume cerca de 0,96 GB de VRAM en pesos F16 y deja la cuantizacion optimizada para unos pesos distintos de los que se ejecutan), aqui el adaptador se fusiona en BF16 completo (escala 2.0, alpha 192, rank 96) y despues se cuantiza con una matriz de importancia y redondeo tipo GPTQ sobre las 48 tensores FFN adelgazados y la cabeza de salida. El fichero resultante tiene el mismo tamano que la variante S16 sin adaptador.

La relevancia actual esta en el eje "agente local en hardware de consumo": 27.300 millones de parametros, contexto superior a 100k, decodificacion especulativa MTP integrada y un endpoint compatible con la API de OpenAI, todo en una sola GPU de 16 GB. La contrapartida es que las mejoras de rendimiento agéntico del adaptador (SWE-bench Pro, Terminal-Bench 2.1) no se han medido aun sobre este fichero concreto, y que el contexto largo depende de un fork de llama.cpp no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8), con cabeza MTP integrada; sin proyector de vision |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 114.688 tokens configurados en el ejemplo del autor; probado a 115.712 tokens; hasta 120.064 en GPU dedicada; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q3_K_XL (layout S16 por tensor: mayoritariamente IQ4_XS, IQ3_S e IQ3_XXS, con Q5_K, Q4_K y Q3_K); 3,86 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 13.207.096.320 bytes; sha256 `32a75ae495933829dca28472cab12d5099135987c3e80dd9e7366068d98521a2`) |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer decoder-only de 27,3 B de parametros. Sobre ella se aplica el super-adapter de harness-hub, una LoRA de rank 96 y alpha 192 (escala 2.0) entrenada para harnesses de agentes. DMAIC ASI fusiona ese adaptador en los pesos en precision BF16 completa y solo despues ejecuta la cuantizacion, de modo que la matriz de importancia y el redondeo tipo GPTQ se calculan sobre los pesos que realmente se van a ejecutar. La cabeza de prediccion multi-token (MTP) del modelo base se conserva intacta, lo que habilita decodificacion especulativa integrada (`--spec-type draft-mtp,ngram-simple`).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO. Del adaptador solo se indica que fue entrenado para harnesses agénticos y que sus autores reportan mejoras amplias en SWE-bench Pro y Terminal-Bench 2.1 frente al modelo base. La innovacion tecnica destacable del paquete es la combinacion de cuantizacion agresiva por tensor con cache KV en NVFP4 y decodificacion especulativa MTP, que es lo que permite sostener mas de 100k tokens de contexto en 16 GB de VRAM.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo "thinking" activado por defecto (ajuste recomendado por los autores del adaptador).
- Codificacion agéntica: el adaptador esta entrenado para flujos de trabajo con herramientas en entornos como OpenCode, pi y Hermes Agent.
- Soporte de tool calling y function calling a traves de endpoint compatible con la API de OpenAI (`/v1`).
- Razonamiento multi-paso y ejecucion de tareas de terminal, orientado a benchmarks como Terminal-Bench 2.1 y SWE-bench Pro.
- Decodificacion especulativa MTP integrada en el fichero, con tasa de aceptacion de borradores de 0,53.
- Contexto largo efectivo (mas de 100k tokens) mediante cache KV NVFP4 en GPUs Blackwell.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no incluida (el fichero no contiene proyector de vision).

## Casos de uso

- Agente de codificacion en local: servir el modelo con `llama-server` y apuntar OpenCode, pi o Hermes Agent al endpoint `http://127.0.0.1:8080/v1`. El adaptador fusionado esta entrenado para estos harnesses y el contexto de 100k+ permite mantener el arbol de ficheros y el historial de herramientas en memoria.
- Resolucion de incidencias sobre repositorios: con SWE-bench Pro como referencia de entrenamiento del adaptador, el modelo encaja en tareas de localizar el fallo, editar varios ficheros y ejecutar pruebas dentro de un bucle agéntico.
- Automatizacion de terminal y operaciones: Terminal-Bench 2.1 es el otro eje del adaptador; el modelo puede encadenar comandos, leer salidas y corregir sobre la marcha en un servidor con GPU de 16 GB.
- Asistente de codigo con privacidad estricta: al ejecutarse integramente en una unica GPU consumer, no requiere enviar codigo propietario a APIs externas; la licencia Apache 2.0 permite uso comercial.
- Procesamiento de documentos largos y bases de codigo: la ventana de 114k-120k tokens permite analisis de repositorios medianos o expedientes extensos en una sola pasada, sin troceado.
- Estacion de trabajo de investigacion en agentes: el par fichero GGUF + fork de llama.cpp con KV NVFP4 sirve para experimentar con decodificacion especulativa, cuantizacion de cache y politicas de contexto en hardware asequible.
- Servicio interno de bajo coste: un unico endpoint compatible con OpenAI puede alimentar varias herramientas internas (chat, resumen, generacion de codigo) sin infraestructura multigpu.

## Benchmarks y rendimiento

| Metrica | S16-SA (este fichero) | S16 (sin adaptador) |
|---|---:|---:|
| KLD media frente a Q8_0 del mismo modelo fusionado (± error estandar) | 0,0349 ± 0,0012 | 0,0340 ± 0,0008 |
| KLD p99 | 0,343 | no disponible |
| Coincidencia de token top-1 | 92,5 % | 92,5 % |

Medido con `llama-perplexity --kl-divergence` sobre wiki text, 20 fragmentos de 1024 tokens. Comparativa de velocidad frente a S16 en la misma maquina: aceptacion de borradores MTP 0,53 frente a 0,56; generacion aproximadamente un 8 % mas lenta a contexto de 512 tokens, un 4 % mas lenta a 8k y practicamente igual a 32k.

No se han publicado resultados de benchmarks agénticos (SWE-bench Pro, Terminal-Bench 2.1) para este fichero concreto en la informacion disponible; el autor lo indica explicitamente como pendiente.

## Requisitos de hardware

- VRAM estimada: 13,2 GB para los pesos; el contexto adicional depende del tipo de cache KV. Con NVFP4 y 114.688 tokens se ha servido en una tarjeta de 16 GB que ademas alimenta un escritorio.
- GPU recomendadas: RTX 50-series (Blackwell) de 16 GB para la configuracion completa con cache NVFP4 y contexto de 100k+. En otras GPUs o con llama.cpp estandar hay que usar cache KV convencional (por ejemplo `-ctk q8_0 -ctv q8_0`) y reducir el contexto.
- Cabe en GPU consumer: si, en tarjetas de 16 GB de la generacion Blackwell; en generaciones anteriores el contexto util se reduce de forma notable al no poder usar NVFP4.
- Despliegue: llama.cpp (obligatorio el fork `DMAIC-ASI-Research/llama.cpp-nvfp4-kv` para la cache NVFP4; el GGUF carga en llama.cpp estandar). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de arranque del autor: `-ngl 99 -c 114688 --fit off -fa on -ctk nvfp4 -ctv nvfp4 -b 2048 -ub 256 -np 1 -kvu --spec-type draft-mtp,ngram-simple -ctkd nvfp4 -ctvd nvfp4 --spec-draft-n-ubatch 64`; compilacion con `-DCMAKE_CUDA_ARCHITECTURES=120a`.
- Throughput y latencia: no disponibles en valores absolutos; solo la comparativa relativa frente a S16 (hasta un 8 % mas lento a contexto corto, igual a 32k).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-DMAIC_ASI-S16-SA (este) | 27,3 B | 114k-120k con KV NVFP4 | GGUF Q3_K_XL, 13,2 GB | Apache 2.0 | Adaptador agéntico fusionado; MTP integrado |
| Qwen3.8-27B-DMAIC_ASI-S16 | 27,3 B | 120.064 max. segun el autor | GGUF Q3_K_XL, mismo tamano | Apache 2.0 | Sin adaptador; referencia de KLD y velocidad |
| Qwen3.8-27B base + super-adapter como `--lora` | 27,3 B | limitado por 0,96 GB extra de VRAM | GGUF base + adaptador F16 | Apache 2.0 | Dos ficheros; cuantizacion no ajustada al adaptador |
| Otros modelos de ~27 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Los benchmarks agénticos del adaptador (SWE-bench Pro, Terminal-Bench 2.1) no se han medido sobre este fichero; las ganancias reportadas corresponden a los autores del adaptador, no a esta cuantizacion.
- El contexto de 100k+ requiere el fork de llama.cpp con cache KV NVFP4 y una GPU RTX 50-series; en llama.cpp estandar o en otras GPUs el contexto util cae y hay que recurrir a cache q8_0 con ventana menor.
- El autor advierte que cuanto mas se aleja la base de BF16, mas se desvia el comportamiento evaluado; aqui la cuantizacion es de 3,86 bits por peso, con KLD media de 0,0349 frente al Q8_0 de referencia.
- La compilacion debe apuntar a arquitectura CUDA `120a`; en otras arquitecturas el build del fork no aplica tal cual.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modo thinking activado por defecto incrementa el consumo de tokens y puede alargar las respuestas.
- Idiomas soportados no documentados en esta ficha; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el fork de llama.cpp y el adaptador deben revisarse por separado antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre este fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DMAIC-ASI/Qwen3.8-27B-DMAIC_ASI-S16-SA-GGUF
- Variante S16 sin adaptador: https://huggingface.co/DMAIC-ASI/Qwen3.8-27B-DMAIC_ASI-S16-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Super-adapter: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Super-adapter en GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter-GGUF
- Fork de llama.cpp con cache KV NVFP4: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv
- Guia de instalacion NVFP4: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv/blob/main/NVFP4-HOWTO.md
- Guia de instalacion para agentes: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv/blob/main/SETUP-AGENT.md
