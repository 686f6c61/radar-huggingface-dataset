# hletrd/Qwen3.8-27B-Uncensored-MLX-8bit

## Resumen

Qwen3.8-27B-Uncensored-MLX-8bit es una version cuantizada a 8 bits en formato MLX del modelo Qwen3.8-27B de Alibaba Qwen, a la que se le ha eliminado la direccion de rechazo (refusal direction) de los pesos mediante una tecnica de "abliteration". El resultado es un modelo de 26.895.993.856 parametros (aproximadamente 26,9 mil millones) que responde a muchas peticiones que el modelo original declina, manteniendo la mayor parte de sus capacidades. Lo publica el usuario hletrd bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tuning no oficial sobre un modelo base de Qwen; por otro, ilustra el flujo de conversion a MLX para ejecucion en Apple Silicon mediante `mlx-lm`. El modelo es solo texto: se han eliminado la torre de vision y la capa MTP (multi-token prediction) del modelo original, por lo que no admite entradas de imagen.

La cuantizacion es afin (affine quantization) con tamano de grupo 64 y escalas y sesgos en float16, aplicada a todas las capas lineales, al embedding de tokens y a la LM head. Los tensores de normalizacion quedan en float16, salvo `A_log` en bfloat16. El repositorio ocupa 28,6 GB y los pesos reales cuantizados suman 28,58 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`), solo texto |
| Parametros totales | 26.895.993.856 (aprox. 26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K segun hardware; 121K en 36 GB, 80K en 48 GB |
| Tipos de cuantizacion | MLX affine 8-bit (grupo 64, escalas y sesgos float16); existe variante MLX 4-bit del mismo autor |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` 0.32.2 |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer decoder-only de la familia Qwen3.5. Sobre el se aplico una edicion "uncensored" publicada previamente por el mismo autor en formato GGUF (hletrd/Qwen3.8-27B-Uncensored-GGUF), que elimina la direccion de rechazo de los pesos. Esa edicion se reaplico al modelo original y despues se convirtio a MLX y se cuantizo a 8 bits. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; la model card no los detalla.

La innovacion tecnica destacable es el pipeline de cuantizacion: cuantizacion afin con grupo 64 sobre todas las capas lineales, embedding y LM head, con normas y tensores no cuantizados en float16 y `A_log` en bfloat16. El autor reporta metricas de fidelidad frente a los pesos BF16 del propio modelo: KL de 0,000354 en WikiText-2 con 99,26% de top-1, KL de 0,000327 en chat con 99,31% de top-1 y KL de 0,000250 en held-out con 99,06% de top-1. La variante 4-bit baja a KL de 0,039687 y 90,82% de top-1 en WikiText-2.

## Capacidades

- Generacion de texto conversacional y de proposito general, en modo texto unicamente.
- Modo "thinking" activado por defecto: el modelo razona antes de responder; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'`.
- Reduccion de rechazos: responde a muchas peticiones que el modelo base declina, segun indica el autor.
- Razonamiento multi-paso derivado del modo thinking del modelo base.
- Capacidades multilingues: no documentadas en la model card.
- Sin soporte de vision: la torre de vision fue eliminada en la conversion.
- Sin capa MTP (multi-token prediction): eliminada en la conversion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas frente a Qwen3.8-27B original en el mismo conjunto de prompts.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas que el modelo base suele declinar, ejecutada localmente en Apple Silicon.
- Despliegue local en Mac: con 28,58 GB de pesos en 8 bits cabe en un Mac Studio de 48 GB o superior con contexto de 80K a 256K, lo que permite asistentes privados sin conexion.
- Procesamiento de documentos largos: la ventana de hasta 256K en configuraciones de 64 GB o mas permite resumir o extraer informacion de contratos, informes o transcripciones extensas.
- Evaluacion de cuantizacion: las metricas KL y top-1 publicadas frente a BF16 lo convierten en un caso de referencia para medir la perdida de fidelidad de la cuantizacion MLX 8-bit y 4-bit.
- Prototipado de chatbots conversacionales en macOS: integracion via `mlx_lm.chat` para pruebas de dialogo multi-turno con modo thinking configurable.
- Analisis de contenido sensible en entornos controlados: al reducir rechazos, puede usarse para clasificar o analizar material que el modelo base rechazaria, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica metricas de fidelidad de cuantizacion frente a los pesos BF16 del propio modelo:

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---:|---:|
| Tamano | 28,58 GB | 16,81 GB |
| WikiText-2 KL | 0,000354 | 0,039687 |
| WikiText-2 top-1 | 99,26% | 90,82% |
| Chat KL | 0,000327 | 0,045670 |
| Chat top-1 | 99,31% | 91,76% |
| Held-out KL | 0,000250 | 0,040544 |
| Held-out top-1 | 99,06% | 89,25% |
| Chequeo de 7 preguntas | 7/7 (BF16: 7/7) | 7/7 (BF16: 7/7) |

## Requisitos de hardware

- VRAM/unified memory estimada: 28,58 GB de pesos en 8-bit; la variante 4-bit ocupa 16,81 GB.
- Hardware de referencia segun el autor (todos Apple Silicon):
  - Mac Studio M5 Max, GPU de 32 nucleos, 36 GB: usar la variante 4-bit, contexto de 121K.
  - Mac Studio M5 Max, GPU de 40 nucleos, 48 GB: 8-bit, contexto de 80K.
  - Mac Studio M5 Max, GPU de 40 nucleos, 64 GB: 8-bit, contexto de 256K.
  - Mac Studio M5 Ultra, 96 GB: 8-bit, contexto de 256K.
  - Mac Studio M5 Max, 128 GB: 8-bit, contexto de 256K.
  - Mac Studio M5 Ultra, 256 GB y 512 GB (80 nucleos): 8-bit, contexto de 256K.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este formato; el modelo es exclusivo de MLX. Para CUDA habria que usar la version GGUF del mismo autor.
- Consumer GPU: no aplica en el sentido habitual; el equivalente es Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: `mlx-lm` 0.32.2 mediante `mlx_lm.generate` y `mlx_lm.chat`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| hletrd/Qwen3.8-27B-Uncensored-MLX-8bit | 26,9 B | hasta 256K | MLX safetensors 8-bit | Apache 2.0 | Solo texto, sin vision ni MTP, rechazos reducidos |
| hletrd/Qwen3.8-27B-Uncensored-MLX-4bit | 26,9 B | 121K en 36 GB | MLX safetensors 4-bit | Apache 2.0 | Misma edicion, menor huella (16,81 GB) y mayor perdida (top-1 90,82%) |
| hletrd/Qwen3.8-27B-Uncensored-GGUF | 26,9 B | no disponible | GGUF | Apache 2.0 | Misma edicion para llama.cpp y ecosistema CUDA/CPU |
| Qwen/Qwen3.8-27B | 26,9 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo base original, con rechazos y con torre de vision y MTP |

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo reduce las salvaguardas del modelo: puede generar contenido danino, ilegal o inseguro. No es apto para despliegues publicos sin filtros externos.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion 8-bit introduce una perdida minima (top-1 del 99,06-99,31% frente a BF16), pero la edicion uncensored no garantiza mayor veracidad.
- Solo texto: no procesa imagenes, aunque el modelo base pudiera tener torre de vision.
- Sin capa MTP: no se beneficia de decodificacion especulativa nativa del modelo original.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingue tras la edicion.
- Exclusivo de MLX y Apple Silicon; no ejecutable en CUDA, ROCm ni CPU convencional en este formato.
- Licencia Apache 2.0 permite uso comercial, pero el autor modifico los pesos y publica un NOTICE; conviene revisarlo antes de redistribuir.
- Modelo no oficial: no esta respaldado por Alibaba Qwen; el autor es un particular (hletrd) y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Sin datos de benchmarks estandar ni evaluaciones de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edicion uncensored en GGUF: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-GGUF
- Variante MLX 4-bit: https://huggingface.co/hletrd/Qwen3.8-27B-Uncensored-MLX-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Assets del autor (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
