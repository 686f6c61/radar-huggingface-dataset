# elrashid/sae-qwen2.5-7b-instruct-topk-l14

## Resumen

El modelo `elrashid/sae-qwen2.5-7b-instruct-topk-l14` no es un modelo de lenguaje, sino un autoencoder disperso (sparse autoencoder, SAE) de tipo TopK entrenado sobre las activaciones del flujo residual de la capa 14 de `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla M. Elrashid (BUiD) como parte del trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence". Su función es descomponer las activaciones internas del modelo base en un diccionario de 57.344 características dispersas, de las cuales se activan como máximo 64 por token, lo que permite interpretar y manipular las representaciones internas del LLM.

El SAE opera sobre un vector de entrada de dimensión 3.584 (la dimensión del flujo residual de Qwen2.5-7B en la capa 14) y proyecta hacia un espacio latente de 57.344 dimensiones con `k=64`. Se entrenó con una receta v2 que incorpora eliminación del token BOS y estandarización por dimensión, y reporta un FVU (fraction of variance unexplained) de 0,4287. El repositorio ocupa 1,6 GB en formato PyTorch.

La relevancia de esta pieza es doble: por un lado, es una herramienta de interpretabilidad mecanicista para auditar el modelo base; por otro, forma parte de un ecosistema junto con `elrashid/gate-qwen2.5-7b-instruct-l14`, una puerta de seguridad basada en regresión logística sobre las características del SAE que puntúa P(harmful) a partir del prompt antes de generar el primer token. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (sparse autoencoder) sobre flujo residual de Qwen2.5-7B-Instruct, capa 14 |
| Parametros totales | no disponible (dimensiones: d_in=3584, d_sae=57344) |
| Parametros activos | k=64 caracteristicas activas por token (no es MoE) |
| Longitud de contexto | no aplica (opera por token/activacion); depende del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; el estudio trata cuantizacion del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-7B-Instruct) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio de 1,6 GB) |

## Arquitectura y entrenamiento

Se trata de un autoencoder disperso TopK: una capa de codificacion que proyecta el vector residual de 3.584 dimensiones a un espacio latente de 57.344 dimensiones, reteniendo únicamente las `k=64` activaciones de mayor magnitud por token, y una capa de decodificacion que reconstruye el vector original. La dispersión se impone por construcción mediante la selección TopK, evitando penalizaciones L1 y permitiendo controlar directamente el número de características activas.

El entrenamiento emplea la "receta v2", que incluye eliminación del token BOS (BOS-drop) y estandarización por dimensión de las activaciones, lo que estabiliza el aprendizaje de características con escalas muy dispares. El conjunto de datos indicado en las etiquetas es `monology/pile-uncopyrighted`. El modelo reporta un FVU de 0,4287, métrica que cuantifica la fracción de varianza de las activaciones no explicada por la reconstrucción del SAE. No se dispone de más detalles sobre hiperparámetros, número de tokens de entrenamiento ni cronograma en la información proporcionada.

## Capacidades

- Descomposición interpretable de activaciones internas de Qwen2.5-7B-Instruct en la capa 14 en 57.344 características dispersas.
- Extracción de características activas por token para análisis de interpretabilidad mecanicista.
- Reconstrucción aproximada del flujo residual a partir de las características dispersas (FVU=0,4287).
- Base para clasificadores de seguridad: el SAE complementario `gate-qwen2.5-7b-instruct-l14` usa estas características para puntuar P(harmful) desde el prompt.
- Soporte para estudiar el efecto de la cuantización sobre la "suerte" de las características (feature fate), según el marco del paper asociado.
- No es un modelo generativo: no produce texto, código ni respuestas; su función es analítica.

## Casos de uso

- Auditoría de seguridad pre-generación: integrar el SAE con la puerta logística del repositorio hermano para clasificar prompts como dañinos antes de que el LLM emita el primer token, reduciendo coste y latencia frente a filtros post-hoc.
- Interpretabilidad mecanicista en investigación: analizar qué características del flujo residual de la capa 14 se activan ante entradas concretas para estudiar circuitos y representaciones internas de Qwen2.5-7B-Instruct.
- Estudio del impacto de la cuantización: comparar la activación de características entre el modelo en precisión completa y versiones cuantizadas para identificar qué rasgos se degradan o desaparecen, en línea con el marco del paper "The Refusal Slope".
- Monitorización en producción: desplegar el SAE como sonda que registra la activación de características relevantes para seguridad y detectar deriva o comportamientos anómalos en el modelo base.
- Investigación en alineamiento: usar las características dispersas como variables para estudiar mecanismos de rechazo (refusal) y su relación con la cuantización en despliegues de borde.
- Docencia y reproducción: servir como ejemplo reproducible de entrenamiento de SAE TopK sobre un LLM de 7B para cursos de interpretabilidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FVU (fraction of variance unexplained) | 0,4287 |
| k (caracteristicas activas) | 64 |
| d_in | 3584 |
| d_sae | 57344 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto no es un modelo generativo evaluable con esas pruebas.

## Requisitos de hardware

- VRAM estimada para el SAE: el repositorio pesa 1,6 GB, por lo que la inferencia del autoencoder cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- Requiere cargar simultáneamente el modelo base Qwen2.5-7B-Instruct para extraer activaciones de la capa 14: en FP16 son ~14-15 GB de VRAM; en cuantización de 4 bits, ~5-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores para el modelo base en FP16; A100/H100 para procesamiento por lotes a gran escala. El SAE por sí solo cabe en cualquier GPU moderna.
- Cabe en GPU de consumo: sí, siempre que el modelo base se cuantice (por ejemplo, 8 bits o 4 bits) o se ejecute en CPU para extracción de activaciones.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se indica soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un SAE.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension latente | k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elrashid/sae-qwen2.5-7b-instruct-topk-l14 | SAE TopK sobre Qwen2.5-7B capa 14 | 57344 | 64 | MIT | Gated en HF |
| elrashid/gate-qwen2.5-7b-instruct-l14 | Clasificador logistico sobre features del SAE | no aplica | no aplica | no disponible | HF |
| Otros SAE publicos (p. ej. sobre Llama/Gemma) | SAE TopK/ReLU | variable | variable | variable | variable |

No se dispone de datos comparativos de rendimiento (FVU, downstream) frente a otros SAE en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde prompts; usarlo como tal es un error de categoría.
- El FVU de 0,4287 implica que una fracción sustancial de la varianza no se reconstruye; las interpretaciones deben considerar ese margen de error.
- Específico de la capa 14 y del modelo Qwen2.5-7B-Instruct: no es transferible a otras capas, otros modelos ni a variantes cuantizadas sin reentrenamiento o validación.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Riesgo de sobreinterpretación de características: las features de un SAE no son necesariamente unidades semánticas limpias ni causales.
- Licencia MIT, lo que permite uso comercial del artefacto, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia que debe respetarse por separado.
- No hay información sobre sesgos, idiomas o robustez del SAE; cualquier despliegue en producción debe validarse empíricamente.

## Enlaces

- Hugging Face del SAE: https://huggingface.co/elrashid/sae-qwen2.5-7b-instruct-topk-l14
- Puerta de seguridad complementaria: https://huggingface.co/elrashid/gate-qwen2.5-7b-instruct-l14
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- DOI asociado: 10.57967/hf/9450
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
