# 0xzknw/Ornith-1.5-9B-MTPLX-4bit

## Resumen

Ornith-1.5-9B-MTPLX-4bit es una version cuantizada a 4 bits del modelo ornith-ai/Ornith-1.5-9B, publicada por el usuario 0xzknw y orientada a Apple Silicon. Se trata de una exportacion realizada con la herramienta MTPLX 2.12.2, que conserva en BF16 tanto la cabeza MTP (multi-token prediction) nativa como la torre de vision del modelo original, mientras que las 250 matrices de pesos del modelo de lenguaje se cuantizan en 4 bits afines con tamano de grupo 64. El repositorio pesa aproximadamente 6,46 GB (6,01 GiB) y esta pensado para su ejecucion local en Macs mediante el runtime MTPLX.

El modelo cuenta con 8.953.803.264 parametros (unos 8,95 mil millones) y se etiqueta con la arquitectura qwen3_5, lo que sugiere que deriva de la familia Qwen3.5, aunque la model card no detalla la arquitectura interna. La relevancia de esta publicacion radica en que es la primera exportacion local a 4 bits del modelo base y en que integra decodificacion especulativa mediante la cabeza MTP, lo que puede acelerar la generacion en hardware de Apple aprovechando el calculo de varios tokens por paso. La licencia es MIT y el idioma declarado es unicamente el ingles.

Al ser una cuantizacion reciente con cero descargas y cero likes, no cuenta con validacion independiente aguas abajo. La propia model card advierte de que la inferencia de imagen y video no se probo especificamente para esta publicacion y que los resultados de benchmarks del modelo original no se trasladan necesariamente a esta version cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (segun tag qwen3_5); incluye cabeza MTP nativa y torre de vision |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (modelo de lenguaje); BF16 sin cuantizar (cabeza MTP y torre de vision) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); libreria mlx |

## Arquitectura y entrenamiento

La model card no describe en detalle el preentrenamiento del modelo base, por lo que no se dispone de datos sobre numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se documenta es la estructura de la exportacion cuantizada: el modelo de lenguaje ocupa `model.safetensors` (5,038 GB) en 4 bits afines con group size 64, mientras que los tensores no cuantizados permanecen en BF16. Los 250 matrices de pesos empaquetadas del modelo de lenguaje se verificaron para confirmar que usan 4 bits.

El elemento diferenciador es la cabeza MTP (multi-token prediction), conservada integramente en BF16 en `mtp.safetensors` (0,487 GB, una capa) segun la receta `mtp_policy: keep_bf16` de Forge. Esta cabeza habilita decodificacion especulativa con profundidades MTP de hasta 3, lo que permite proponer varios tokens por paso de decodificacion. Ademas, la torre de vision se conserva en BF16 (`model-vision.safetensors`, 0,912 GB) e incluye 333 tensores, lo que confirma que el modelo base es multimodal, aunque la inferencia de imagen y video no se probo para esta publicacion. La validacion cubre los 1.275 tensores y rangos de bytes, las 1.260 entradas del indice de pesos y la generacion autorregresiva con profundidades MTP 1, 2 y 3.

## Capacidades

- Generacion de texto autorregresiva en ingles, con plantilla de chat y procesador incluidos.
- Decodificacion especulativa mediante cabeza MTP nativa, con profundidades configurables de hasta 3.
- Capacidades multimodales potenciales derivadas de la torre de vision incluida en BF16 (no verificadas en esta publicacion).
- Conversacion multi-turno (tag `conversational`).
- Ajuste de muestreo con valores por defecto: temperatura 0,6, top-p 0,95, top-k 20.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de texto local en Mac: el modelo puede ejecutarse integramente en un Mac con Apple Silicon a traves de MTPLX, ofreciendo generacion de texto sin depender de la nube y aprovechando la cuantizacion 4 bits para reducir el uso de memoria.
- Generacion de codigo en el editor: con el comando `mtplx run` se puede solicitar la escritura de funciones (por ejemplo, invertir una cadena en Python), lo que encaja en flujos de autocompletado o generacion de fragmentos en entornos de desarrollo locales.
- Prototipado rapido en portatiles Apple: al requerir unos 6,5 GB de descarga y caber en memoria unificada, permite experimentar con un modelo de ~9 B sin necesidad de GPU dedicada.
- Aceleracion de inferencia mediante decodificacion especulativa: la cabeza MTP con profundidad hasta 3 permite a desarrolladores evaluar el impacto de la decodificacion multi-token en velocidad sobre hardware de Apple.
- Investigacion sobre cuantizacion: el repositorio sirve como referencia para estudiar el efecto de la cuantizacion 4-bit affine (group size 64) manteniendo MTP y vision en BF16.
- Base para tareas multimodales experimentales: la presencia de la torre de vision permite explorar tareas de imagen, siempre con la advertencia de que no se validaron en esta publicacion.
- Despliegue conversacional local: gracias al tag `conversational` y a la plantilla de chat incluida, se puede montar un chat multi-turno en local para uso personal o pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna medida de precision aguas abajo para esta cuantizacion y que las puntuaciones de benchmarks del repositorio original describen el modelo sin cuantizar, no esta version.

## Requisitos de hardware

- VRAM/memoria estimada: alrededor de 6,46 GB (6,01 GiB) solo para los pesos; hay que sumar la cache KV, cuyo tamano depende del contexto y no esta documentado.
- Plataforma objetivo: Apple Silicon (el runtime MTPLX y la libreria MLX son exclusivos de Apple).
- GPU CUDA (A100, H100, RTX 4090): no soportadas por MLX ni por MTPLX.
- Cabe en GPU de consumo: no aplica en el sentido habitual; cabe en Macs con memoria unificada. Con 16 GB o mas de memoria unificada hay margen holgado; con 8 GB el margen es limitado.
- Opciones de despliegue: MTPLX 2.12.2 (CLI y modo `run` con `--mtp --depth 3`). vLLM, llama.cpp, Ollama y TGI no estan soportados para este formato.
- Perfil de ejecucion: la model card recomienda el perfil `sustained` y ofrece `mtplx tune --model ... --retune` para medir el rendimiento en cada Mac.
- Latencia y throughput: no disponible; no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MTPLX-4bit | ~8,95 B | no disponible | MLX safetensors 4-bit | MIT | HuggingFace (0 descargas) |
| ornith-ai/Ornith-1.5-9B (base) | ~8,95 B | no disponible | safetensors (sin cuantizar) | MIT | HuggingFace |
| Otras alternativas de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base del que deriva: misma cantidad de parametros y misma licencia MIT, pero con pesos en 4 bits y cabezas MTP y vision en BF16. No se dispone de datos sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Idioma: solo ingles declarado; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Sin validacion aguas abajo: la model card no reclama ninguna metrica de precision para esta cuantizacion, por lo que la degradacion respecto al modelo original es desconocida.
- Inferencia multimodal no probada: la vision no se valido para esta publicacion, pese a incluir la torre.
- Dependencia de un runtime nicho: requiere MTPLX, exclusivo de Apple Silicon, lo que limita el despliegue en servidores Linux o Windows.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Repositorio sin traccion: 0 descargas y 0 likes, sin reportes de terceros.
- Restricciones de licencia: MIT permite uso comercial, segun la licencia declarada por la model card del modelo original.
- Longitud de contexto y rendimiento en produccion: no disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xzknw/Ornith-1.5-9B-MTPLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Revision del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/tree/489cb97981b8654bcfcf30ce1f94ed1b62e07b53
- Herramienta MTPLX: https://github.com/youssofal/MTPLX
