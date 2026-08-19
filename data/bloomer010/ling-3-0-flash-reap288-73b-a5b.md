# bloomer010/Ling-3.0-flash-REAP288-73B-A5B

## Resumen

Ling-3.0-flash REAP288 es un modelo de lenguaje de tipo MoE (Mixture of Experts) resultante de la poda selectiva de expertos del modelo inclusionAI/Ling-3.0-flash, desarrollado por el usuario bloomer010 como artefacto de investigacion. Aplica el metodo REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999) para eliminar el 44% de los expertos por capa en una sola pasada, reduciendo los parametros totales de 124B a 73B sin necesidad de reentrenamiento ni fine-tuning.

La poda conserva 288 de los 512 expertos originales por capa, manteniendo intactos los 5.1B parametros activos por token. Los expertos se puntuan mediante el producto del valor de la puerta del router por la norma L2 de su salida, calculado sobre un conjunto de calibracion de 1M de tokens (50% ultrachat, 25% wikitext, 25% codigo). Los de menor puntuacion se eliminan directamente.

Este modelo es relevante en el contexto de investigacion sobre eficiencia y compresion de MoE, ya que demuestra una reduccion significativa del footprint de memoria con un coste computacional minimo. Requiere codigo personalizado (bailing_hybrid / BailingMoeV3) y se carga con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (bailing_hybrid / BailingMoeV3) |
| Parametros totales | 73.293.449.216 (73B) |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); versiones GGUF en repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una version podada de inclusionAI/Ling-3.0-flash, un MoE con arquitectura hibrida (bailing_hybrid) que emplea el mecanismo de routing BailingMoeV3. El modelo original contaba con 512 expertos por capa y 124B parametros totales; esta version conserva 288 expertos por capa (56,25%), eliminando el 44% de ellos.

La poda se realiza con el metodo REAP, una tecnica one-shot que puntua cada experto segun el producto del valor de la puerta del router por la norma L2 de su salida, calculado sobre un conjunto de calibracion de 1M de tokens compuesto por un 50% de ultrachat, 25% de wikitext y 25% de codigo. Los expertos con menor puntuacion se eliminan directamente, sin fine-tuning posterior ni entrenamiento de recuperacion. El resultado es un modelo de 73B parametros totales con los mismos 5.1B parametros activos por token que el original.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y el uso de ultrachat en la calibracion indican que el modelo conserva las capacidades de dialogo del modelo base.
- Generacion de codigo: el 25% de codigo en el conjunto de calibracion sugiere que la poda ha preservado parcialmente esta capacidad.
- Razonamiento multi-step: hereda las capacidades del modelo base Ling-3.0-flash, aunque no se especifican detalles concretos.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking / vision / audio: no disponible.

## Casos de uso

- Investigacion en compresion de modelos: permite estudiar el impacto de la poda de expertos en un MoE de gran tamano sin coste de reentrenamiento, comparando el rendimiento antes y despues de la poda.
- Inferencia con menor footprint de memoria: con 73B parametros totales frente a los 124B originales, reduce los requisitos de VRAM en aproximadamente un 41%, lo que facilita el despliegue en infraestructuras mas modestas.
- Experimentacion con cuantizacion: las versiones GGUF del repositorio hermano permiten probar el modelo en CPU o GPUs de consumo con cuantizacion de 4 u 8 bits.
- Evaluacion de tecnicas de poda: sirve como punto de referencia para comparar REAP con otras tecnicas de compresion como distillation o pruning estructural.
- Desarrollo de asistentes conversacionales: hereda las capacidades de dialogo del modelo base con un footprint menor, adecuado para prototipos y demos.
- Fine-tuning sobre dominios especificos: al ser un modelo abierto en formato safetensors, puede adaptarse a tareas concretas mediante PEFT o LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 146 GB (73B parametros × 2 bytes), lo que requiere multiples GPUs de alta gama.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 73 GB, cabe en una GPU A100 80GB o H100 80GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 36,5 GB, cabe en GPUs de 48 GB como la RTX A6000 o RTX 6000 Ada.
- GPUs recomendadas: 2× A100 80GB o 2× H100 80GB para BF16; 1× A100 80GB para 8 bits; 1× GPU 48GB para 4 bits.
- Opciones de despliegue: llama.cpp u Ollama (via versiones GGUF), Transformers con `trust_remote_code=True`, vLLM si soporta el codigo personalizado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Metodo | Formato |
|---|---|---|---|---|
| Ling-3.0-flash (original) | 124B | 5.1B | - | safetensors |
| Ling-3.0-flash REAP288 | 73B | 5.1B | REAP one-shot | safetensors |
| Otros MoE podados | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos podados no esta disponible en la informacion proporcionada. La unica comparacion directa posible es con el modelo base original, del que esta version reduce un 41% los parametros totales manteniendo los mismos parametros activos.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo califica como tal, no como un modelo listo para produccion.
- Sin entrenamiento de recuperacion: la poda one-shot puede degradar capacidades en tareas especificas no cubiertas por el conjunto de calibracion.
- Conjunto de calibracion limitado: solo 1M de tokens (ultrachat, wikitext y codigo), lo que puede sesgar la poda hacia estos dominios.
- Requiere codigo personalizado: la carga exige `trust_remote_code=True` y el codigo bailing_hybrid / BailingMoeV3, lo que introduce riesgos de seguridad y problemas de compatibilidad
