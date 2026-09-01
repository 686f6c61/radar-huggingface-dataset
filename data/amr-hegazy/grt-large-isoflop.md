# Amr-Hegazy/grt-large-isoflop

## Resumen

El modelo **GRT Large (large-isoflop)** es un checkpoint de la arquitectura **Gated Recurrent Transformer (GRT)**, presentada en el artículo *"Gated Recurrent Transformers: Expressive Depth through Recurrent Modulation"* de Amr Hegazy, Amr Alanwar y Mostafa Elhoushi (arXiv:2608.15062). GRT es un transformador recurrente que aplica un bloque compartido de forma iterativa sobre el estado oculto, combinando profundidad expresiva con eficiencia paramétrica. A diferencia de los transformadores estándar, donde cada capa tiene pesos independientes, GRT reutiliza un único bloque central R veces, lo que permite aumentar la profundidad efectiva sin incrementar el número de parámetros.

Este checkpoint concreto, de aproximadamente 290 millones de parámetros, se entrena en el régimen **isoFLOP** (mismas operaciones de inferencia que un modelo no recurrente equivalente) y alcanza una pérdida de validación de 2,7766 en el subconjunto CCCC Filtered del dataset Common Pile, tras entrenarse con unos 9.800 millones de tokens. La arquitectura incorpora tres innovaciones: inyección de preludio (prelude injection), puertas sigmoideas a nivel de elemento y ruido gaussiano sobre el estado y las puertas. El modelo está pensado para la generación de texto en inglés y su relevancia radica en demostrar que los transformadores recurrentes pueden igualar o superar a los no recurrentes bajo restricciones de cómputo o parámetros, abriendo la puerta a modelos más eficientes en memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated Recurrent Transformer (prelude + shared core recurrente + coda) |
| Parametros totales | 290.196.480 (según safetensors); ~287M según la model card |
| Parametros activos | No aplica (no es MoE; todos los parámetros se ejecutan en cada paso recurrente) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos en safetensors sin cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (también se puede cargar como checkpoint .pt con PyTorch) |

## Arquitectura y entrenamiento

GRT sigue el esquema **prelude → shared core × R → coda**. El prelude y la coda son bloques de profundidad fija (1 y 5 capas respectivamente en este checkpoint), mientras que el núcleo compartido consta de 5 capas que se iteran R veces (R=6 en inferencia, muestreado uniformemente durante el entrenamiento). Cada iteración del núcleo recibe una **inyección de preludio**: la salida de los bloques fijos se concatena con el estado oculto ruidoso y se re-proyecta, anclando cada paso a la representación original de la entrada. Además, una **puerta sigmoidea a nivel de elemento** (inicializada cerca de la apertura, σ(+4) ≈ 0,98) decide qué componentes del bloque compartido se integran en el flujo residual, y se añade **ruido gaussiano** tanto al estado oculto como a los logits de la puerta para evitar colapsos y patrones frágiles. Esta configuración permite la **salida anticipada (early exiting)** en inferencia sin pérdidas auxiliares, fijando simplemente el número de recurrencias.

El entrenamiento se realizó sobre el dataset **Common Pile / CCCC Filtered**, con aproximadamente 9.800 millones de tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El modelo se basa en la implementación nanoGPT, con dimensión de embedding de 1280 y 20 cabezas de atención, y utiliza el tokenizador GPT-2 (tiktoken).

## Capacidades

- **Generación de texto**: modelo autorregresivo de lenguaje generalista en inglés, capaz de producir texto coherente y continuar secuencias dadas.
- **Profundidad recurrente ajustable**: en inferencia se puede variar el número de recurrencias R (early exiting) sin necesidad de reentrenar, lo que permite intercambiar calidad por latencia.
- **Eficiencia paramétrica**: al compartir pesos entre capas, el modelo ofrece una profundidad efectiva de 36 ejecuciones de bloque por token con solo ~290M de parámetros únicos.
- **Investigación y experimentación**: arquitectura abierta y reproducible, con código disponible, adecuada para estudiar scaling laws, recurrencia y compartición de pesos.
- **No dispone** de capacidades multimodales, tool calling, agentes ni razonamiento multi-paso explícito más allá de la generación estándar.

## Casos de uso

- **Investigación académica en arquitecturas eficientes**: el modelo sirve como banco de pruebas para estudiar el comportamiento de transformadores recurrentes bajo regímenes isoFLOP e isoParam, comparando con líneas base como GPT-2 Small.
- **Generación de texto en inglés con recursos limitados**: con ~290M de parámetros, cabe en GPUs de consumo y puede usarse para prototipos de chatbots, redacción asistida o completado de texto sin necesidad de infraestructura de gran escala.
- **Fine-tuning para tareas específicas de PLN**: al ser un modelo pequeño y abierto, se puede ajustar con pocos datos para clasificación de texto, análisis de sentimiento o generación de respuestas en dominios concretos.
- **Exploración de early exiting**: su capacidad de variar la profundidad de recurrencia permite experimentar con estrategias de inferencia adaptativa, reduciendo la latencia en aplicaciones en tiempo real cuando se tolera una calidad ligeramente inferior.
- **Enseñanza y divulgación**: su implementación sencilla sobre nanoGPT y su documentación detallada lo convierten en un recurso didáctico para explicar conceptos de compartición de pesos, recurrencia y regularización por ruido.
- **Comparación de scaling laws**: investigadores pueden utilizarlo como punto de referencia para validar teorías sobre la relación entre parámetros, FLOPs y pérdida, dado que el paper reporta curvas isoFLOP e isoParam detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El paper reporta únicamente:

- **Pérdida de validación**: 2,7766 en el conjunto de validación de CCCC Filtered.
- **Comparación isoFLOP**: un GRT de 3 capas iguala la precisión de un GPT-2 Small de 12 capas con FLOPs de entrenamiento e inferencia similares.
- **Comparación isoParam**: con el mismo número de parámetros y datos, una recurrencia más profunda alcanza una pérdida de validación de 2,76 frente a 2,84 de un transformador no recurrente equivalente.

| Métrica | GRT Large (isoFLOP) | GPT-2 Small (12 capas, 124M) | Transformador no recurrente isoParam |
|---|---|---|---|
| Parámetros | ~290M | ~124M | ~290M |
| Pérdida de validación (CCCC Filtered) | 2,7766 | No reportado | 2,84 (según paper) |
| Contexto | 1024 | 1024 | 1024 |

*Nota: los datos de GPT-2 Small y del no recurrente provienen de las comparaciones del paper; no se dispone de más métricas.*

## Requisitos de hardware

- **VRAM estimada**: con ~290M de parámetros, en FP16 ocupa aproximadamente 580 MB de pesos, más overhead de activaciones y estado recurrente. Se estima un consumo total de 1-2 GB para inferencia con contexto 1024, dependiendo del batch.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo sin problemas. Ejemplos: NVIDIA RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10 o T4.
- **Compatibilidad con GPU de consumo**: sí, es plenamente viable en GPUs domésticas gracias a su tamaño reducido.
- **Opciones de despliegue**: el modelo se distribuye como checkpoint de PyTorch y requiere el código del repositorio oficial (nanoGPT modificado). No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama; para servirlos en producción sería necesario adaptar el código a estos frameworks.
- **Latencia y throughput**: no disponible. Dado que cada token requiere 36 ejecuciones de bloque, la latencia será mayor que la de un transformador estándar del mismo tamaño, aunque se puede reducir con early exiting (R menor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Pérdida validación (CCCC) | Licencia |
|---|---|---|---|---|---|
| GRT Large (isoFLOP) | ~290M | 1024 | Recurrente con gating | 2,7766 | CC-BY-4.0 |
| GPT-2 Small | 124M | 1024 | Transformer estándar | No reportado | MIT |
| Pythia-160M | 160M | 2048 | Transformer estándar | No reportado | Apache-2.0 |

No se dispone de más comparativas directas en la información proporcionada. El paper de GRT indica que, bajo restricciones isoFLOP, GRT iguala a GPT-2 Small (12 capas) con menos parámetros únicos pero más ejecuciones de bloque, y bajo restricciones isoParam supera a un transformador no recurrente del mismo tamaño.

## Limitaciones y advertencias

- **Solo inglés**: el modelo se entrenó exclusivamente con datos en inglés; no es adecuado para otros idiomas.
- **Contexto corto**: la ventana de 1024 tokens limita tareas que requieren dependencias de largo alcance.
- **Riesgo de alucinación**: como todo modelo de lenguaje generativo, puede producir contenido plausible pero factualmente incorrecto.
- **Sesgos**: al entrenarse sobre Common Pile (subconjunto filtrado), puede heredar sesgos sociales y culturales presentes en los datos; no se han evaluado formalmente.
- **Estado de investigación**: no se ha optimizado para producción; carece de integración con frameworks de servicio estándar y de garantías de robustez.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos exactos antes de su uso en productos.
- **Dependencia de código externo**: para cargar el modelo es necesario el código del repositorio oficial, que depende de la implementación nanoGPT y del tokenizador GPT-2 (tiktoken).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Amr-Hegazy/grt-large-isoflop)
- [Paper en arXiv](https://arxiv.org/abs/2608.15062)
- [PDF del paper (v4)](https://arxiv.org/pdf/2608.15062v4)
- [Código en GitHub](https://github.com/Amr-Hegazy1/gated-recurrent-transformer)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2608.15062)
