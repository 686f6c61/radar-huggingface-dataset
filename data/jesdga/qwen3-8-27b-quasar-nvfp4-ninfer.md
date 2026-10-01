# jesdga/Qwen3.8-27B-QUASAR-nvfp4-NInfer

## Resumen

Qwen3.8-27B-QUASAR-nvfp4-NInfer es un artefacto de inferencia publicado por el usuario `jesdga` para [NInfer](https://github.com/Neroued/ninfer), un motor de servicio orientado a GPUs Blackwell. Se construye a partir del checkpoint cuantizado con entrenamiento consciente de cuantizacion (QAT) `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`, e incorpora el drafter especulativo `z-lab/Qwen3.8-27B-DFlash2`. No es un modelo entrenado desde cero ni un ajuste fino: es una conversion de formato y empaquetado de pesos ya cuantizados a NVFP4 (W4A4) en un contenedor propietario `.ninfer` de 19,6 GB.

La relevancia del artefacto es de ingenieria, no de investigacion: segun el autor, frente al artefacto oficial del mismo modelo reduce el tiempo de ronda de decodificacion con DFlash2 de 16,1 ms a 13,8 ms (aproximadamente +16 % en tokens/s), sube el prefill de un prompt de 16,7k tokens de 11,3-11,5k tok/s a 13,7k tok/s y baja el consumo de VRAM de 30,8 GiB a 27,0 GiB en la misma RTX 5090 a 600 W. El precio es un deterioro de perplexidad del 1,9 % (4,3955 frente a 4,3122 en `ninfer-ppl-1m-v1`), mayor en texto de referencia en ingles (+3,8 %).

El modelo resultante es conversacional y multimodal entrada imagen-texto, con una ventana de contexto configurable de hasta 262.144 tokens, modo de razonamiento (thinking) y decodificacion especulativa. La licencia es Apache-2.0, igual que el modelo base, el checkpoint QUASAR y el drafter. Al ser una construccion comunitaria, no esta afiliada a los autores de NInfer, Qwen, QUASAR ni DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; el artefacto conserva las proyecciones de atencion, MLP y GDN (gating) del modelo base Qwen3.8-27B, ademas de MTP, vision y cabeza de propuesta |
| Parametros totales | 27B nominales (segun la denominacion del modelo base Qwen3.8-27B); repositorio de 19,6 GB en NVFP4 |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 262.144 tokens (`--max-context 262144`, `--kv-capacity 262144`); el pool completo de KV cabe en la configuracion probada, incluso con `--vision` |
| Tipos de cuantizacion | NVFP4 W4A4 en las 256 proyecciones de texto (MLP, GDN, atencion), importado bit a bit desde QUASAR con sus escalas de activacion; embeddings y cabeza de salida en FP8 con escalado por fila; gating GDN en BF16; cache KV en FP8 (`--kv-dtype fp8`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propio del motor NInfer); fichero `qwen3_8_27b_quasar.ninfer` de 19.624.516.612 bytes, SHA-256 `5d683c403dbe121e230a6730cead81e0f9756387d528702d08f55aa14d1de159`. No se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo. Los pesos de texto provienen del checkpoint QUASAR, que aplico entrenamiento consciente de cuantizacion (QAT) sobre Qwen3.8-27B; la conversion a NInfer importa las 256 proyecciones de texto (MLP, GDN y atencion) en NVFP4 de forma bit-exacta, incluidas las escalas de activacion, de modo que el prefill opera con activaciones FP4. Los tensores de embedding y de la cabeza de salida se convierten a FP8 con escalado por fila a partir de los tensores BF16 de QUASAR, y el gating GDN se mantiene en BF16. Los componentes DFlash2, MTP, vision y cabeza de propuesta conservan los formatos del artefacto oficial de NInfer.

La innovacion practica es la decodificacion especulativa con el drafter DFlash2 integrado (`--spec dflash2 --draft-tokens 7 --lm-head-draft`) y la preservacion del modo de razonamiento (`--preserve-thinking`), junto con un reparto de estado entre dispositivo y host (`--device-state-slots 2 --host-state-slots 8 --host-kv-mib 8192`) que permite sostener el pool de KV de 262.144 tokens en 27,0 GiB de VRAM. El proceso de reconstruccion esta documentado: `python3 -m tools.convert` con la receta `qwen3_8_27b_quasar.py`, QUASAR en la revision `15d2e47bffe5d8ad23928879f8f7d2f74909e259` y DFlash2 en `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`, sobre un checkout de NInfer en `d44ab58408aa389728cd8b1ee50179527e1f3e0d`. Los detalles por objeto estan en `conversion-report.json`.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat Qwen3.8 (`tools/chat_templates/qwen3_8.jinja`).
- Razonamiento extendido en modo thinking, preservado durante el servicio mediante `--preserve-thinking`.
- Procesamiento de contexto largo: hasta 262.144 tokens de contexto y de pool KV, adecuado para documentos de decenas de miles de tokens.
- Entrada multimodal imagen-texto: la pipeline declarada es `image-text-to-text` y el flag `--vision` habilita imagenes y video, manteniendo el pool KV completo.
- Decodificacion especulativa integrada con el drafter DFlash2 y hasta 7 tokens de borrador por paso.
- Generacion de JSON estructurado (los prompts fijos de medida incluyen JSON, ademas de conversacion, ensayo y documento de 16,7k tokens).
- Rendimiento medido en razonamiento cientifico: 89,90 % de acierto en GPQA-Diamond con 178/198 respuestas correctas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas.
- Cobertura multilingue: no declarada; el autor solo senala que el coste de perplexidad es mayor en texto de referencia en ingles (+3,8 %).
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto y un pool KV del mismo tamano, el modelo puede ingerir manuales, expedientes o bases de codigo largas en una sola peticion sin troceado ni recuperacion externa.
- Asistente conversacional local de alta privacidad: al ejecutarse sobre una unica RTX 5090 con NInfer, los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Razonamiento cientifico y tecnico asistido: el 89,90 % en GPQA-Diamond (nivel posgrado en ciencias) lo hace util para revision de hipotesis, verificacion de calculos o preguntas de dominio especializado con modo thinking activado.
- Procesamiento de capturas, diagramas y video: con `--vision` el modelo aborda tareas de descripcion, extraccion de informacion y preguntas sobre contenido visual sin abandonar el pool KV de contexto largo.
- Generacion de JSON para integracion en pipelines: la salida estructurada medida en los prompts de evaluacion permite alimentar automatizaciones, validadores de esquema o etapas posteriores de un flujo de datos.
- Prototipado de agentes conversacionales con latencia baja: 204,2 tok/s de decodificacion en prosa y 13,8 ms de tiempo de ronda con DFlash2 hacen viable la interaccion en tiempo real en una estacion de trabajo.
- Servicio de inferencia de un solo inquilino: la configuracion probada usa `--max-concurrency 1`, por lo que encaja en escenarios de demo, evaluacion interna o uso individual intensivo mas que en despliegues multiusuario.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo. GPQA-Diamond con los ajustes de la tarjeta oficial (thinking, temperatura 1.0, top-p 0.95, top-k 20, semilla 42, KV INT8), usando DFlash2 en lugar de MTP, con NInfer `eval/` y EvalScope 1.10.0; 198 muestras, margen aproximado de ±2,1 puntos.

| Benchmark | Este artefacto | Artefacto oficial NInfer | Tarjeta BF16 de Qwen |
|---|---:|---:|---:|
| GPQA-Diamond (accuracy, 0-shot) | 89,90 % (178/198) | 90,40 % (179/198) | 89,2 |

Metricas de servicio declaradas, en la misma RTX 5090 a 600 W, misma build de NInfer y mismos flags:

| Metrica | Oficial | Este artefacto |
|---|---:|---:|
| Tiempo de ronda DFlash2 (decodificacion) | 16,1 ms | 13,8 ms (aprox. +16 % tok/s) |
| Prefill, prompt de 16,7k tokens | 11,3-11,5k tok/s | 13,7k tok/s |
| Decodificacion de prosa (misma aceptacion) | 175,6 tok/s | 204,2 tok/s |
| VRAM con la configuracion indicada | 30,8 GiB | 27,0 GiB |
| Perplexidad, `ninfer-ppl-1m-v1` (rapida) | 4,3122 | 4,3955 (+1,9 %) |

El autor advierte que con 198 muestras las tres cifras de GPQA son indistinguibles y que no se han probado MTP, la calidad de imagen/video ni otros benchmarks distintos de GPQA-Diamond. El margen de error declarado para las medidas de servicio es de aproximadamente ±2 %, con dos sesiones de servidor para los valores oficiales y una para este artefacto.

## Requisitos de hardware

- GPU: RTX 5090 (Blackwell) a 600 W; el artefacto usa NVFP4 W4A4, por lo que requiere hardware con soporte FP4.
- VRAM: 27,0 GiB con la configuracion documentada (`--max-context 262144 --kv-capacity 262144 --kv-dtype fp8 --device-state-slots 2 --host-state-slots 8 --host-kv-mib 8192`). El pool KV completo de 262.144 tokens cabe en esa huella, tambien con `--vision`.
- Software: Linux, CUDA 13.1 o superior y NInfer compilado desde fuentes; probado en el commit `d44ab58408aa389728cd8b1ee50179527e1f3e0d`.
- Cabe en GPU de consumo: si, en RTX 5090. No hay datos de otras GPU de consumo, ni de A100, H100 u otras tarjetas profesionales.
- Opciones de despliegue: `./build/apps/ninfer-serve` con el fichero `.ninfer`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores, ni conversion a GGUF.
- Latencia y throughput: 13,8 ms por ronda de decodificacion con DFlash2, 204,2 tok/s en decodificacion de prosa, 13,7k tok/s de prefill con prompt de 16,7k tokens. Concurrencia maxima configurada: 1 peticion.
- Anchura de contexto practica: 262.144 tokens tanto en contexto como en capacidad KV, con cache KV en FP8.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| `jesdga/Qwen3.8-27B-QUASAR-nvfp4-NInfer` | Artefacto NVFP4 para NInfer (este modelo) | 27B nominales | 262.144 tokens | 89,90 % | Apache-2.0 | Repositorio de 19,6 GB, 0 descargas, 0 likes |
| `neroued/Qwen3.8-27B-nvfp4-NInfer` | Artefacto NVFP4 oficial para NInfer | 27B nominales | No disponible | 90,40 % | Apache-2.0 (segun el modelo base citado) | Publico |
| `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4` | Checkpoint QAT en NVFP4 | 27B nominales | No disponible | No disponible | Apache-2.0 | Publico; requiere conversion o runtime compatible |
| `Qwen/Qwen3.8-27B` | Modelo base en BF16 | 27B nominales | No disponible | 89,2 (tarjeta BF16) | Apache-2.0 | Publico |
| `z-lab/Qwen3.8-27B-DFlash2` | Drafter de decodificacion especulativa | No disponible | No disponible | No aplica | Apache-2.0 | Publico; incluido en este artefacto |

La comparacion relevante es con el artefacto oficial para el mismo motor: el de este repositorio gana en latencia, throughput y VRAM, y pierde ligeramente en perplexidad y en un punto porcentual de GPQA sobre 198 muestras.

## Limitaciones y advertencias

- Es una construccion comunitaria, sin afiliacion con los autores de NInfer, Qwen, QUASAR ni DFlash2, y sin validacion externa publicada: 0 descargas y 0 likes en el momento de la ficha.
- El repositorio declara `inference: false`; para ejecutarlo hace falta compilar NInfer desde fuentes en un commit concreto y disponer de CUDA 13.1+ en Linux.
- El formato `.ninfer` es propietario del motor; no se documenta exportacion a safetensors, GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Dependencia de hardware muy concreta: la cuantizacion NVFP4 W4A4 exige una GPU Blackwell. No hay datos de funcionamiento en otras GPU.
- El unico benchmark publicado es GPQA-Diamond, con 198 muestras (±2,1 puntos), lo que impide distinguir el resultado del de otros artefactos del mismo modelo.
- No se han probado MTP, la calidad de imagen/video ni cualquier otro benchmark, segun declara el propio autor.
- Deterioro de perplexidad del 1,9 % global y del 3,8 % en texto de referencia en ingles respecto al artefacto oficial; en tareas sensibles a la distribucion de probabilidad puede notarse.
- Riesgo de alucinacion: no se documentan tasas de veracidad mas alla de GPQA-Diamond; como en cualquier modelo generativo, la salida debe verificarse en dominios criticos.
- Idiomas soportados no declarados y sesgos conocidos no documentados; no hay evaluacion de sesgo ni de seguridad.
- Rendimiento medido con concurrencia 1; no hay datos de escalado con multiples peticiones simultaneas.
- Las cifras de latencia y throughput las aporta el autor con una sola sesion de servidor y un margen declarado de ±2 %; no son medidas independientes.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los componentes derivados (QUASAR, DFlash2 y Qwen3.8-27B) antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jesdga/Qwen3.8-27B-QUASAR-nvfp4-NInfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Commit de NInfer usado en las pruebas: https://github.com/Neroued/ninfer/commit/d44ab58408aa389728cd8b1ee50179527e1f3e0d
- Directorio de evaluacion de NInfer: https://github.com/Neroued/ninfer/tree/master/eval
- Artefacto oficial de referencia: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Checkpoint QAT de origen: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
