# nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16-e2e

## Resumen

TinyLlama-1.1B-Chat-v1.0-W8A16-e2e es un artefacto de prueba publicado por la organizacion `nm-testing`, el espacio que Neural Magic (adquirida por Red Hat) utiliza para validar su ecosistema de cuantizacion `compressed-tensors`. No es un modelo entrenado desde cero ni un lanzamiento oficial: es una version cuantizada del conocido TinyLlama-1.1B-Chat-v1.0, con pesos en formato W8A16 (pesos a 8 bits, activaciones a 16 bits) y empaquetados con la libreria `compressed-tensors` de vLLM.

El modelo subyacente es un transformer decoder-only de tipo Llama con 1.100.048.384 parametros, disenado para chat de bajo coste computacional. Esta variante concreta existe para verificar el pipeline end-to-end de cuantizacion, carga y ejecucion en vLLM con esquema W8A16, por lo que su interes es fundamentalmente tecnico: sirve como referencia para validar herramientas y como ejemplo minimo de un checkpoint cuantizado compatible con `compressed-tensors`.

Su relevancia es limitada para produccion: el repositorio tiene 54 descargas, 0 likes, no declara licencia ni idiomas, y el nombre incluye el sufijo `e2e` (end-to-end), lo que confirma su naturaleza de test. Cualquier uso real deberia partir del modelo original TinyLlama/TinyLlama-1.1B-Chat-v1.0 o de una cuantizacion mantenida por un proveedor con garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (derivado de TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el TinyLlama original soporta 2048 tokens) |
| Tipos de cuantizacion | W8A16 (pesos INT8, activaciones FP16/BF16) via `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos `compressed-tensors` |
| Tamano del repo | 8,6 GB |
| Pipeline declarado | no disponible |
| Tags | safetensors, llama, compressed-tensors, region:us |

## Arquitectura y entrenamiento

La arquitectura es la del TinyLlama-1.1B-Chat-v1.0 original: un transformer decoder-only con atencion multi-cabeza, RoPE, RMSNorm y SwiGLU, con 22 capas, dimension oculta de 2048 y 32 cabezas de atencion (4 cabezas KV en configuracion GQA en algunas variantes del linaje Llama). El entrenamiento del modelo base consistio en preentrenamiento sobre aproximadamente 3 billones de tokens (el proyecto TinyLlama documenta 3T tokens en 90 dias sobre 16 A100-40G) seguido de un ajuste fino supervisado y DPO para alineamiento conversacional.

La innovacion de esta variante no esta en el entrenamiento sino en la cuantizacion: aplica un esquema W8A16 mediante `compressed-tensors`, que almacena los pesos en INT8 con escalas por canal y deja las activaciones en FP16/BF16 durante la inferencia. Este esquema reduce el footprint de pesos a la mitad respecto a FP16 (de ~2,2 GB a ~1,1 GB teoricos de pesos), aunque el repositorio ocupa 8,6 GB, probablemente porque incluye checkpoints intermedios, originales y cuantizados. No se dispone de informacion sobre calibracion, dataset de calibracion ni metodo exacto de redondeo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de chat del TinyLlama original.
- Razonamiento basico y respuesta a preguntas simples; el tamano de 1,1B limita el razonamiento complejo.
- Generacion de codigo a nivel basico, sin garantias de calidad para tareas no triviales.
- Capacidades matematicas limitadas, adecuadas solo para aritmetica sencilla.
- Soporte multilingue muy limitado (el TinyLlama original esta entrenado predominantemente en ingles).
- No se ha confirmado soporte de tool calling ni function calling en esta variante.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni thinking mode.
- Inferencia compatible con vLLM a traves de `compressed-tensors` (objetivo principal del artefacto).

## Casos de uso

- Validacion de pipelines de cuantizacion: usar el checkpoint para verificar que vLLM y `compressed-tensors` cargan correctamente un modelo W8A16 y producen salidas coherentes frente al modelo en FP16. Es el proposito declarado del repositorio.
- Pruebas de regresion en CI/CD de herramientas de inferencia: integrar el modelo en tests automatizados que comprueben compatibilidad de kernels INT8, carga de safetensors y correccion numerica tras cambios en la libreria.
- Benchmarking de latencia y throughput en hardware modesto: con 1,1B parametros y pesos INT8, cabe en GPUs de 8 GB y permite medir el impacto de W8A16 frente a FP16 en vLLM.
- Prototipado rapido de asistentes conversacionales: sirve para validar flujos de chat multi-turno antes de migrar a un modelo mayor, aunque la calidad de respuesta sera limitada.
- Educacion y demos de cuantizacion: ejemplo didactico de como se estructura un checkpoint `compressed-tensors` y que metadatos incluye.
- Entornos con restricciones de memoria: despliegue en GPUs consumer o CPU para tareas de generacion de texto de baja exigencia donde el coste importa mas que la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB solo para pesos en W8A16; con overhead de KV cache y activaciones, entre 2 y 3 GB para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son validas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: vLLM con soporte `compressed-tensors` es la via natural; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repo; TGI no garantiza soporte del esquema W8A16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en una RTX 4090 se espera un throughput alto por el tamano reducido, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16-e2e | 1,1B | no disponible | W8A16 (compressed-tensors) | no disponible | Hugging Face, 54 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | FP16/BF16 (original) | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | FP16, GPTQ, AWQ, GGUF | Apache 2.0 | Hugging Face, muy popular |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | FP16, GGUF | Apache 2.0 | Hugging Face, muy popular |

La comparativa muestra que esta variante no aporta ventajas frente al TinyLlama original ni frente a alternativas modernas del mismo rango: su unico diferenciador es el formato cuantizado W8A16 para pruebas, mientras que Qwen2.5-1.5B y SmolLM2-1.7B ofrecen contextos mayores, mejor calidad y licencias claras.

## Limitaciones y advertencias

- Artefacto de prueba (`e2e`) sin garantia de mantenimiento ni soporte; no recomendado para produccion.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del modelo base (Apache 2.0 en el TinyLlama original) y la del propio checkpoint.
- Idiomas no declarados; el modelo base esta predominantemente entrenado en ingles, con soporte limitado de castellano.
- Riesgo elevado de alucinacion por el tamano reducido (1,1B) y la cuantizacion INT8, que puede degradar ligeramente la calidad frente a FP16.
- Contexto limitado (2048 tokens en el modelo base) insuficiente para documentos largos o conversaciones extensas.
- Sin soporte confirmado de tool calling ni de razonamiento multi-paso, lo que descarta su uso en agentes.
- El repositorio ocupa 8,6 GB, muy por encima de los ~1,1 GB teoricos de pesos, lo que sugiere checkpoints redundantes o artefactos de calibracion; conviene revisar el contenido antes de descargarlo.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad por la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16-e2e
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio de TinyLlama: https://github.com/jzhang38/TinyLlama
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- Organizacion Neural Magic en Hugging Face: https://huggingface.co/neuralmagic
