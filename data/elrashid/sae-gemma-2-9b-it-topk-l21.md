# elrashid/sae-gemma-2-9b-it-topk-l21

## Resumen

`elrashid/sae-gemma-2-9b-it-topk-l21` es un autoencoder disperso (sparse autoencoder, SAE) de tipo TopK entrenado sobre el flujo residual de la capa 21 de `google/gemma-2-9b-it`. No es un modelo generativo, sino un artefacto de interpretabilidad mecanicista: descompone las activaciones internas del modelo base en un diccionario sobredimensionado de características dispersas y monitorizables. Lo desarrolla M. Elrashid (BUiD) como parte del trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence".

El artefacto resulta relevante para investigadores de seguridad e interpretabilidad que trabajan con Gemma 2 y necesitan analizar cómo la cuantización afecta a la representación de características internas, en particular las asociadas a rechazo (refusal). Al estar anclado a una capa concreta (21) y a un modelo base concreto, su utilidad es muy específica pero directa: extraer características interpretables de las activaciones sin reentrenar el SAE.

El repositorio ocupa 1,6 GB, tiene licencia MIT, acceso restringido (gated) y está publicado en formato PyTorch. Se complementa con otros artefactos del mismo autor, como `elrashid/gate-gemma-2-9b-it-l21`, una puerta de seguridad basada en regresión logística sobre las características del SAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre flujo residual (capa 21) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (artefacto de interpretabilidad, no modelo generativo) |
| Tipos de cuantizacion | no disponible (el SAE en sí no se distribuye cuantizado según la información disponible) |
| Idiomas soportados | no disponible (heredado del modelo base, no declarado) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio de 1,6 GB) |

Parámetros específicos del SAE:

| Parametro | Valor |
|---|---|
| Modelo base | google/gemma-2-9b-it |
| Capa objetivo | 21 (flujo residual) |
| Dimensión de entrada (d_in) | 3584 |
| Dimensión del diccionario (d_sae) | 57344 |
| Factor de expansión | 16x |
| k (TopK) | 64 |
| FVU (fraction of variance unexplained) | 0,4772 |
| Receta de entrenamiento | v2 (BOS-drop + estandarización por dimensión) |
| Dataset de entrenamiento | monology/pile-uncopyrighted |

## Arquitectura y entrenamiento

El SAE es un autoencoder de una sola capa oculta con activación TopK: proyecta la activación residual de 3584 dimensiones de la capa 21 de Gemma 2 9B a un diccionario de 57344 características (expansión 16x) y conserva únicamente las k=64 activaciones de mayor magnitud, forzando dispersión estricta sin necesidad de penalización L1. Esta formulación TopK es habitual en interpretabilidad mecanicista porque produce características más limpias y con magnitudes comparables entre sí.

El entrenamiento emplea la receta v2 del autor, que incorpora BOS-drop (exclusión del token de inicio de secuencia) y estandarización por dimensión de las activaciones de entrada, sobre el dataset `monology/pile-uncopyrighted`. El FVU reportado es de 0,4772, lo que indica que el SAE explica aproximadamente el 52 % de la varianza de las activaciones de esa capa. No se dispone de información sobre número de tokens de entrenamiento, hiperparámetros de optimización ni detalles del scheduler.

## Capacidades

- Extracción de características dispersas interpretables de las activaciones de la capa 21 de Gemma 2 9B-it.
- Análisis de la representación interna de conceptos, con foco declarado en características asociadas a rechazo (refusal).
- Soporte para estudios de cuantización: el trabajo asociado analiza el destino de características bajo cuantización en entornos edge.
- Base para clasificadores derivados: el repositorio hermano `gate-gemma-2-9b-it-l21` usa estas características para estimar P(harmful) a partir del prompt antes del primer token de salida.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso: es un componente de análisis, no un modelo de lenguaje.
- Capacidades multilingües: no aplica directamente; dependen del modelo base sobre el que se aplique.

## Casos de uso

- Investigación en interpretabilidad mecanicista: descomponer activaciones de la capa 21 de Gemma 2 9B para identificar características monosesemánticas y estudiar su comportamiento en distintas entradas.
- Auditoría de seguridad de LLM: analizar qué características se activan ante prompts dañinos y cómo se relacionan con el comportamiento de rechazo del modelo base.
- Estudio del impacto de la cuantización: comparar la fidelidad de las características extraídas entre el modelo en precisión completa y versiones cuantizadas, cuantificando la degradación de la representación interna.
- Construcción de clasificadores de seguridad ligeros: reutilizar las activaciones del SAE como features de entrada para una regresión logística (como en `gate-gemma-2-9b-it-l21`) que estime riesgo antes de generar el primer token.
- Monitorización en producción: integrar la extracción de características en un pipeline de inferencia para detectar activaciones anómalas asociadas a contenido dañino y disparar guardarraíles.
- Docencia y reproducción de experimentos: servir como ejemplo reproducible de entrenamiento de SAE TopK sobre un modelo abierto con receta documentada (BOS-drop + estandarización).
- Investigación comparativa entre capas y modelos: usar el artefacto como referencia para comparar diccionarios de características entre capas o entre variantes de Gemma 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado es el FVU de 0,4772 sobre la capa 21, que mide la fracción de varianza no explicada por el SAE.

## Requisitos de hardware

- VRAM estimada para el SAE: el repositorio ocupa 1,6 GB; en FP32 la inferencia del SAE requiere del orden de 1-2 GB adicionales a las activaciones del modelo base.
- El coste dominante es ejecutar Gemma 2 9B-it: en FP16 requiere aproximadamente 18-20 GB de VRAM; en cuantización de 4 bits, en torno a 6-7 GB.
- GPU recomendadas: A100 40/80 GB o H100 para trabajo en precisión completa con batches grandes; RTX 4090 (24 GB) suficiente para Gemma 2 9B en FP16 con batches moderados; RTX 3090/4080 para cuantizado.
- Cabe en GPU de consumo: sí, siempre que se cuantice el modelo base; el SAE por sí solo es ligero.
- Opciones de despliegue: PyTorch nativo (librería declarada); el modelo base puede servirse con vLLM, TGI o llama.cpp, pero la extracción de activaciones de la capa 21 requiere hooks personalizados, no soportados de forma nativa por esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Capa | d_sae | k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| elrashid/sae-gemma-2-9b-it-topk-l21 | SAE TopK | Gemma 2 9B-it | 21 | 57344 | 64 | MIT | Gated |
| elrashid/gate-gemma-2-9b-it-l21 | Clasificador (regresión logística sobre SAE) | Gemma 2 9B-it | 21 | no disponible | no disponible | no disponible | Pública |
| SAEs de Gemma Scope (Google DeepMind) | SAE (JumpReLU/TopK) | Gemma 2 9B | múltiples | múltiples | múltiples | Gemma Terms | Pública |

La comparación más directa es con la suite Gemma Scope, que cubre múltiples capas y anchos de diccionario para Gemma 2 9B. Este SAE se distingue por su receta v2 (BOS-drop + estandarización) y por estar orientado al estudio de cuantización y rechazo, no a cobertura exhaustiva de capas.

## Limitaciones y advertencias

- Es un artefacto de interpretabilidad, no un modelo de lenguaje: no puede usarse para generación, razonamiento ni tareas de NLP de forma directa.
- El FVU de 0,4772 implica que aproximadamente el 48 % de la varianza de las activaciones de la capa 21 no queda explicada; las características extraídas son una aproximación parcial.
- Anclado exclusivamente a la capa 21 y a `google/gemma-2-9b-it`: no es transferible a otras capas, otros tamaños ni otras variantes de Gemma sin reentrenamiento.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la reproducibilidad automatizada.
- No se documentan sesgos específicos del SAE; los sesgos heredados del dataset Pile-uncopyrighted y del modelo base pueden reflejarse en las características aprendidas.
- Riesgo de interpretación errónea: las características de un SAE no son necesariamente monosesemánticas ni causalmente relevantes; requieren validación con intervenciones (ablación, steering) antes de extraer conclusiones de seguridad.
- La licencia MIT aplica al artefacto, pero el uso del modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que imponen restricciones adicionales para uso comercial.
- Sin métricas de rendimiento publicadas más allá del FVU: no hay evaluación de reconstrucción por características, dead features ni calidad de interpretabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elrashid/sae-gemma-2-9b-it-topk-l21
- Gate asociado: https://huggingface.co/elrashid/gate-gemma-2-9b-it-l21
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI: https://doi.org/10.57967/hf/9442
