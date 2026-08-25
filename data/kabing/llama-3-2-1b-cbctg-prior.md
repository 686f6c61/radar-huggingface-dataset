# kabing/Llama-3.2-1B-cbctg-prior

## Resumen

Llama-3.2-1B-cbctg-prior es un adaptador de generación de texto controlable mediante concept-bottleneck (CBC-TG) desarrollado por Qi Bing y Xiaowei Shao, presentado en el artículo "The Illusion of Control: Why Bare Classifier Inversion Silently Fails in Concept-Bottleneck Text Generation" (EMNLP 2026). El modelo resuelve el problema de generar texto con control fino sobre atributos semánticos discretos (en este caso, cocina, género, sentimiento y tiempo verbal) mediante una arquitectura que interpone un bottleneck de conceptos entre la representación latente del modelo base y el generador. Su relevancia radica en que demuestra que la inversión de clasificadores por sí sola produce fallos silenciosos, y propone una solución basada en priors de etiqueta post-hoc para estabilizar la generación.

El repositorio contiene exclusivamente los parámetros entrenados por los autores: MLPs de codificación de conceptos por eje, cabezas de clasificación, inyector AdaLN-zero, adaptador LoRA (rank 8, alpha 16) sobre las proyecciones de atención de Llama 3.2 1B, y un prior de etiqueta post-hoc. No se redistribuyen los pesos del modelo base, que deben obtenerse por separado de meta-llama/Llama-3.2-1B. La licencia es llama3.2, aplicable a los pesos del adaptador como obra derivada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Concept-bottleneck + Llama 3.2 1B con LoRA (rank 8, alpha 16) |
| Parámetros totales | 1.24 mil millones (incluye base) + parámetros del adaptador (no desglosados) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (modelo base); no especificado para el adaptador |
| Tipos de cuantización | No disponibles (el adaptador se distribuye en float32/float16; el base soporta cuantización GGUF/Q8) |
| Idiomas soportados | Inglés (dataset Fyelp); el base soporta inglés, francés, alemán, hindi, italiano, portugués y español |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | PyTorch `.pt` (config.json + checkpoints) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de generación controlable por conceptos (CBCG) con un bottleneck de conceptos de 4 ejes (cocina, género, sentimiento, tiempo), cada uno con 32 dimensiones. El pipeline es el siguiente: un codificador de conceptos por eje (MLP) transforma la representación del texto de referencia en códigos de concepto; un clasificador por eje predice los atributos desde dichos códigos; y un inyector AdaLN-zero (adaptive layer normalization) inyecta los conceptos en cada bloque del modelo generador Llama 3.2 1B. El generador se entrena con LoRA (rank 8, alpha 16) solo en las proyecciones de atención.

El entrenamiento se realizó sobre el dataset Fyelp (reseñas de restaurantes) con dos configuraciones de división: `hold-out` (39 configuraciones vistas, 1 no vista) y `acd` (mitad de las configuraciones retenidas). El artículo principal compara tres protocolos de generación: `oracle` (codificación de texto de referencia), `mode_b` (inversión de clasificador) y `prior` (prior de etiqueta post-hoc). El prior `g_γ` es un MLP de una capa oculta con 128 unidades GELU, ajustado en menos de 30 segundos. Se incluyen también baselines adicionales como flujo normalizador condicional y prior factorizado por eje (apéndices K y N).

## Capacidades

- Generación de texto controlable por conceptos: permite fijar atributos como cocina (p. ej., italiana, mexicana), género del autor, sentimiento (positivo/negativo) y tiempo verbal (presente/pasado).
- Control fino por eje: cada uno de los 4 ejes es independiente y se puede ajustar por separado.
- Composición de conceptos: puede combinar múltiples atributos simultáneamente (p. ej., "cocina italiana + sentimiento negativo + tiempo pasado").
- Interpolación latente: el espacio de conceptos de 32 dimensiones por eje permite interpolaciones suaves entre configuraciones de atributos.
- Generación condicionada a referencia: protocolo `oracle` que codifica un texto de referencia para extraer los conceptos y generar texto nuevo coherente.
- Generalización composicional: evalúa la capacidad de combinar atributos no vistos en entrenamiento (configuraciones `hold-out`).

## Casos de uso

- Generación de reseñas de restaurantes con atributos controlados: un sistema de marketing puede generar reseñas sintéticas para simular opiniones sobre un restaurante con una cocina y sentimiento concretos, útil para entrenar clasificadores o aumentar datasets.
- Aumento de datos para clasificación de sentimiento: generar ejemplos adicionales con sentimiento positivo/negativo equilibrado para entrenar modelos de análisis de opinión.
- Control de estilo en asistentes de escritura: permitir al usuario fijar el tiempo verbal y el género del texto generado en aplicaciones de redacción asistida.
- Evaluación de robustez en modelos de NLP: las configuraciones `hold-out` permiten probar la capacidad de generalización de clasificadores ante combinaciones no vistas de atributos.
- Estudio de interpretabilidad: el bottleneck de conceptos ofrece una representación intermedia interpretable que puede inspeccionarse para entender qué características se usan en la generación.
- Prototipado de sistemas de generación controlada: servir como base de referencia para comparar técnicas de inversión de clasificadores frente a priors post-hoc en investigación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo (arXiv:2608.22956) incluye análisis de rendimiento, pero los valores concretos (p. ej., exactitud de atributos, métricas de coherencia) no están disponibles en el repositorio. El modelo se describe como el "backbone principal de la tabla principal" y se usa para análisis de overshoot de activación (sección 5.2) y resultados cross-scale (sección 7.1).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador sobre Llama 3.2 1B requiere aproximadamente 2-3 GB con el modelo base en FP16 (sin cuantización) más el overhead del adaptador (los checkpoints suman 1.2 GB en disco, pero en memoria son menores).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 2060, GTX 1660, RTX 3060) es suficiente para inferencia; para entrenamiento se recomienda una GPU con 8-16 GB (RTX 3080, A100).
- Sí cabe en GPUs consumer: sí, incluso en tarjetas de 4-6 GB si se cuantiza el modelo base (p. ej., GGUF Q4).
- Opciones de despliegue: el repositorio proporciona un script de evaluación `evaluation/generate_v3.py` que carga los checkpoints y genera texto; el adaptador PEFT se puede integrar con la librería PEFT de HuggingFace para cargar sobre el base. No se proporcionan configuraciones listas para vLLM u Ollama.
- Latencia y throughput: no disponible; el modelo base de 1B tiene una latencia aproximada de 10-30 ms por token en GPU moderna, pero no se han medido con el adaptador.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Control | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-1B-cbctg-prior | CBCG + LoRA | ~1.2 B (base) + adaptador | 128k (base) | Conceptos (4 ejes) | Llama 3.2 |
| CTRL (Salesforce) | Transformer | 1.6 B | 512 | Control de estilo/dominio | BSD-3 |
| Llama 3.2 1B Instruct | Transformer | 1 B | 128k | Sin control fino de atributos | Llama 3.2 |
| T5 (base) | Transformer | 220 M | 512 | Adaptable con prompts | Apache-2.0 |

No se dispone de comparativas directas con el modelo en los mismos benchmarks; la comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Sesgos del modelo base: Llama 3.2 1B puede reflejar sesgos presentes en los datos de entrenamiento (género, etnicidad, etc.), que se transmiten a las generaciones controladas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido factualmente incorrecto o incoherente, especialmente con configuraciones de conceptos no vistas.
- Limitaciones del dataset: el adaptador se entrena exclusivamente en Fyelp (reseñas de restaurantes en inglés), por lo que la generación está limitada a ese dominio y a los atributos definidos (cocina, género, sentimiento, tiempo).
- Restricciones de licencia: la licencia Llama 3.2 permite uso comercial, pero los términos requieren que los usuarios con más de 700 millones de usuarios mensuales obtengan una licencia específica de Meta. El adaptador se distribuye bajo los mismos términos.
- Reproducibilidad: se requiere clonar el repositorio de código y descargar los pesos base por separado; no es un modelo autocontenido.
- Dependencia de PEFT: el adaptador requiere la librería PEFT y la configuración de base de meta-llama/Llama-3.2-1B para funcionar; no se puede cargar como un modelo independiente.

## Enlaces

- [Hugging Face: kabing/Llama-3.2-1B-cbctg-prior](https://huggingface.co/kabing/Llama-3.2-1B-cbctg-prior)
- [arXiv:2608.22956](https://arxiv.org/abs/2608.22956)
- [Modelo base: meta-llama/Llama-3.2-1B](https://huggingface.co/meta-llama/Llama-3.2-1B)
- [Código del repositorio: cbctg-illusion-of-control](https://github.com/BiancaBing/cbctg-illusion-of-control)
- [Licencia Llama 3.2 Community](https://www.llama.com/llama3_2/license/)
