# abuarchive/Qwen3.8-27B-2bit-oQ2

## Resumen

El modelo `abuarchive/Qwen3.8-27B-2bit-oQ2` es una cuantización extrema de 2 bits del modelo multimodal Qwen3.8-27B, desarrollada por el usuario abuarchive mediante la librería oMLX. El objetivo es reducir drásticamente el tamaño del modelo (de 51 GB en bf16 a 11 GB en disco) y aumentar la velocidad de inferencia, manteniendo un equilibrio aceptable entre calidad y recursos. La cuantización utiliza un esquema adaptativo por capas (oQ2) que asigna más bits a las capas más sensibles, logrando un promedio de 3,08 bits por peso.

Este modelo es relevante para entornos con memoria unificada limitada (por ejemplo, Mac con 36 GB) donde el modelo original o incluso la versión de 4 bits no caben. Sin embargo, la evaluación del autor muestra una degradación notable en calidad: la perplejidad aumenta un 50 % respecto a la versión de 4 bits y falla en aproximadamente la mitad de una batería de prompts generales, entrando en bucles de repetición. No es recomendable como sustituto directo de cuantizaciones más altas para uso general, pero puede ser útil en tareas muy específicas donde el tamaño y la latencia sean críticos y se acepte una tasa de fallos elevada.

El modelo está publicado bajo licencia Apache 2.0 y está disponible en formato MLX (safetensors), pensado para su uso con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 3.471.964.400 (según safetensors; el nombre del modelo sugiere 27B, discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2 (2 bits base, grupo 64, modo afín, hasta 8 bits en capas sensibles, promedio 3,08 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantización del modelo Qwen/Qwen3.8-27B. El método empleado es `oQ2` de la librería oMLX, que realiza una cuantización por capas con sensibilidad medida contra un modelo de referencia (la versión 4-bit). Las capas con mayor sensibilidad reciben más bits, llegando a 8 bits para `embed_tokens`. El proceso lee los tensores de safetensors de forma incremental, sin materializar el modelo completo en memoria (pico de 3-4 GB durante la conversión), lo que permite trabajar en hardware con 36 GB de memoria unificada.

El modelo base Qwen3.8-27B es un transformer multimodal que acepta entradas de imagen y texto, aunque la model card de esta cuantización solo muestra ejemplos de generación de texto. No se dispone de información sobre los datos de entrenamiento del modelo original ni sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento básico (el modelo base es multimodal, pero la evaluación del autor solo cubre texto).
- Entrada de imágenes y texto según el `pipeline_tag` de HuggingFace (image-text-to-text), aunque no hay ejemplos en la model card.
- Soporte de chat multilingüe (idiomas no especificados).
- No se menciona soporte de tool calling ni capacidades de agente.
- La cuantización degrada significativamente la calidad: falla en tareas como traducción, escritura creativa y razonamiento multi-paso, entrando en bucles de repetición.

## Casos de uso

- Clasificación de texto corto: tareas como detección de spam o análisis de sentimiento en frases breves pueden tolerar fallos ocasionales, y el pequeño tamaño permite desplegar el modelo en dispositivos con poca memoria.
- Extracción de entidades simples: para textos cortos y estructurados, el modelo puede identificar nombres o fechas sin necesidad de razonamiento complejo.
- Generación de respuestas plantilla en chatbots de bajo coste: si el sistema incluye un fallback para detectar repeticiones, el modelo puede usarse en consultas sencillas donde la calidad no es crítica.
- Prototipado rápido en entornos con memoria limitada: sirve para probar flujos de trabajo con MLX en hardware de 36 GB antes de pasar a una cuantización mayor.
- Experimentación académica sobre el impacto de la cuantización extrema en modelos multimodales.
- Inferencia en tiempo real con requisitos de latencia estrictos: al ser más rápido (12,7 tok/s frente a 8,3 tok/s de la versión 4-bit), puede ser útil en aplicaciones donde la velocidad prima sobre la exactitud y se acepta una tasa de error alta.

## Benchmarks y rendimiento

El autor proporciona una evaluación comparativa entre esta cuantización y la versión oficial de 4 bits (mlx-community/Qwen3.8-27B-4bit), realizada en el mismo hardware y con los mismos ajustes. La batería de prompts consta de 16 prompts en 8 categorías, con decodificación greedy y un presupuesto de 300 tokens. Se considera fallo si la generación alcanza el límite de tokens sin completar o entra en un bucle de repetición (detectado por redundancia de 4-gramas).

| Metrica | 4-bit (mlx-community) | oQ2 (este modelo) |
| --- | --- | --- |
| Tamano en disco | 15 GB | 11 GB |
| Bits por peso | 4,50 | 3,08 |
| Perplejidad (40 muestras, seq 256) | 5,405 ± 0,159 | 8,124 ± 0,216 |
| Prompts completados (de 16) | 15 | 8 |
| Velocidad de decodificacion | 8,3 tok/s | 12,7 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamano del repositorio: 11,3 GB (pesos cuantizados).
- La conversión se realizó en un sistema con 36 GB de memoria unificada, con un pico de uso de 3-4 GB durante el proceso.
- Para inferencia, se requiere memoria suficiente para cargar los pesos (11 GB) más overhead de ejecución; se estima que al menos 16 GB de RAM unificada serían necesarios, aunque no se especifica oficialmente.
- Compatible con GPUs de Apple (Apple Silicon) mediante MLX y con GPUs NVIDIA/AMD a través de la compatibilidad de MLX (aunque MLX está orientado a Apple).
- Despliegue recomendado con `mlx-lm` (Python) o `mlx_lm.generate`.
- No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión.
- La velocidad de decodificación medida es de 12,7 tokens/s en el hardware de prueba (no especificado).

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Calidad (perplejidad) | Velocidad | Licencia |
| --- | --- | --- | --- | --- | --- |
| Qwen3.8-27B bf16 (original) | 51 GB | no disponible | referencia (no medido) | no disponible | Apache 2.0 |
| Qwen3.8-27B 4-bit (mlx-community) | 15 GB | no disponible | 5,405 | 8,3 tok/s | Apache 2.0 |
| Qwen3.8-27B oQ2 (este modelo) | 11 GB | no disponible | 8,124 | 12,7 tok/s | Apache 2.0 |

La comparativa se limita a las versiones cuantizadas del mismo modelo base, ya que no se dispone de datos de otros modelos similares.

## Limitaciones y advertencias

- La calidad es significativamente inferior a la versión de 4 bits: perplejidad un 50 % mayor y fallos en 8 de 16 prompts de una batería general.
- Entra en bucles de repetición con frecuencia (7 de 16 prompts), especialmente en escritura creativa, traducción, conocimiento general, matemáticas, resumen e instrucciones multi-paso.
- La evaluación del autor es limitada: solo 16 prompts, un idioma (alemán-inglés) y un único ajuste de decodificación. Los resultados pueden variar con otras distribuciones de prompts.
- No es un sustituto directo de cuantizaciones de 4 bits o superiores para uso general.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en dominios específicos.
- El modelo base es multimodal, pero esta cuantización no ha sido evaluada con entradas de imagen; su rendimiento en tareas de visión es desconocido.
- La discrepancia entre el nombre del modelo (27B) y el número de parámetros reportado (3,47B) no está aclarada; podría indicar un error en la metadata o una arquitectura MoE con parámetros activos reducidos, pero no se confirma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abuarchive/Qwen3.8-27B-2bit-oQ2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión bf16 usada para la conversión: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Versión 4-bit de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Librería oMLX: https://github.com/jundot/omlx
- Comparación interactiva de resultados: https://claude.ai/code/artifact/edd7664c-e2a8-48da-a4b8-b18294558f64
