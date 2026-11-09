# elrashid/sae-qwen3-8b-topk-l18

## Resumen

El modelo `elrashid/sae-qwen3-8b-topk-l18` es un autoencoder disperso (SAE, *sparse autoencoder*) de tipo TopK entrenado sobre el flujo residual de la capa 18 de Qwen3-8B, un transformer denso de 8 mil millones de parámetros desarrollado por Alibaba Qwen. No se trata de un modelo generativo, sino de una herramienta de interpretabilidad mecanicista: descompone las activaciones internas del modelo base en un diccionario sobredimensionado de 65 536 características dispersas, de las cuales solo 64 se activan simultáneamente por token (k=64).

El artefacto está vinculado al trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence" (M. Elrashid, BUiD), que estudia cómo se transforman las características internas del modelo cuando se cuantiza para despliegue en el borde. Por tanto, su propósito es servir de instrumento de análisis para investigadores de seguridad e interpretabilidad que quieran rastrear qué features se ven afectadas por la cuantización y cómo se relacionan con comportamientos como el rechazo (*refusal*).

Con un repositorio de 2,1 GB y un FVU (*fraction of variance unexplained*) de 0,4224, el SAE ofrece una reconstrucción moderada de las activaciones. Su relevancia actual reside en la creciente demanda de herramientas de auditoría sobre modelos abiertos de tamaño medio, especialmente en el contexto de despliegue en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre flujo residual (capa 18 de Qwen3-8B) |
| Parametros totales | no disponible (d_in=4096, d_sae=65536, k=64) |
| Parametros activos | 64 características por token (TopK) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (la model card del repositorio indica apache-2.0 en una vista; los tags indican MIT) |
| Formato de pesos | PyTorch (repositorio de 2,1 GB, librería pytorch) |

## Arquitectura y entrenamiento

El SAE es un autoencoder de una sola capa con cuello de botella sobredimensionado: proyecta activaciones de dimensión 4096 (d_in, correspondiente al *hidden size* de Qwen3-8B) a un espacio latente de 65 536 dimensiones (d_sae, factor de expansión de 16x) y las reconstruye. La activación latente se restringe mediante TopK con k=64, de modo que solo las 64 features con mayor magnitud se mantienen activas por token, lo que impone una representación dispersa y potencialmente más interpretable que las activaciones densas originales.

El entrenamiento emplea la "receta v2", que incorpora *BOS-drop* (eliminación del token de inicio de secuencia) y estandarización por dimensión (*per-dim standardization*). El conjunto de datos es `monology/pile-uncopyrighted`, una versión del Pile sin material sujeto a derechos de autor. El FVU reportado es de 0,4224, lo que indica que el SAE explica aproximadamente el 57,8 % de la varianza de las activaciones de la capa 18. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO (no aplicables a un SAE).

## Capacidades

- Extracción de características interpretables del flujo residual de la capa 18 de Qwen3-8B.
- Análisis de la evolución de features bajo cuantización (objeto central del paper asociado).
- Identificación de features relacionadas con comportamientos de rechazo (*refusal*) y seguridad.
- Descomposición dispersa con k=64 features activas por token, lo que facilita la inspección manual.
- No genera texto ni realiza inferencia lingüística por sí mismo: requiere el modelo base Qwen3-8B para producir activaciones.
- No soporta tool calling, agentes ni capacidades multimodales (no es un modelo generativo).
- Soporte multilingüe: no disponible de forma explícita; depende del corpus Pile (predominantemente inglés).

## Casos de uso

- Auditoría de seguridad de Qwen3-8B: inspeccionar qué features se activan ante prompts de rechazo y cómo se distribuyen en la capa 18, permitiendo caracterizar el comportamiento de *refusal* a nivel mecanicista.
- Estudio de robustez frente a cuantización: comparar las activaciones del SAE entre el modelo en precisión completa y sus versiones cuantizadas (INT8, INT4) para identificar features que se degradan o desaparecen.
- Investigación en interpretabilidad mecanicista: utilizar las 65 536 features como diccionario para técnicas de *feature steering* o *activation patching* sobre Qwen3-8B.
- Análisis de sesgos y conceptos: buscar features correlacionadas con atributos demográficos o tópicos sensibles en el corpus Pile y medir su prevalencia.
- Desarrollo de métodos de monitorización: emplear el SAE como sonda ligera para detectar activaciones anómalas en producción sin necesidad de acceder a las activaciones densas completas.
- Reproducibilidad académica: servir como artefacto de referencia para el paper "The Refusal Slope", permitiendo a otros grupos replicar el análisis de destino de features en modelos cuantizados.
- Educación y divulgación: ilustrar cómo funcionan los SAE TopK sobre un modelo abierto de 8B con licencia permisiva.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FVU (fraction of variance unexplained) | 0,4224 |
| d_in | 4096 |
| d_sae | 65536 |
| k (TopK) | 64 |
| Capa analizada | 18 |
| Dataset de entrenamiento | monology/pile-uncopyrighted |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el artefacto no es un modelo generativo evaluable con dichos benchmarks.

## Requisitos de hardware

- El SAE en sí requiere poca VRAM: con pesos en fp32, 4096 × 65536 × 4 bytes ≈ 1,07 GB por matriz; el repositorio completo ocupa 2,1 GB.
- GPU recomendadas para entrenamiento o inferencia a gran escala: A100 40/80 GB, H100, o RTX 4090 (24 GB) para lotes pequeños.
- Cabe en GPUs de consumo: RTX 3090, RTX 4090, RTX 4080 e incluso GPUs con 8-12 GB para inferencia por lotes reducidos.
- El modelo base Qwen3-8B sí requiere hardware sustancial: ~16 GB en fp16, ~8-10 GB en cuantización INT8/INT4.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para el SAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | d_sae | k | Capa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| elrashid/sae-qwen3-8b-topk-l18 | Qwen3-8B | 65536 | 64 | 18 | MIT | Gated en HF |
| SAE de Anthropic (Gemma-2-9B) | Gemma-2-9B | no disponible | variable | múltiple | no disponible | Público |
| SAE de EleutherAI (Pythia) | Pythia | variable | variable | múltiple | MIT/Apache | Público |

No se dispone de datos comparativos de rendimiento (FVU, downstream) entre estos SAE en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El acceso al repositorio está restringido (*gated*): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad inmediata.
- El FVU de 0,4224 implica que una fracción significativa de la varianza no se explica; las features pueden no capturar todos los conceptos relevantes.
- El SAE está entrenado únicamente sobre la capa 18; no ofrece cobertura de otras capas ni de la totalidad de la red.
- El corpus de entrenamiento (Pile-uncopyrighted) está mayoritariamente en inglés, lo que puede sesgar las features hacia conceptos anglófonos.
- No es un modelo generativo: no puede usarse para tareas de NLP directamente.
- Riesgo de interpretaciones erróneas: la correspondencia entre features y conceptos humanos es aproximada y requiere validación empírica.
- La licencia aparece de forma ambigua en las fuentes (MIT en tags, apache-2.0 en una vista de la model card); conviene verificar antes de uso comercial.
- No se documentan limitaciones específicas de sesgo más allá de las derivadas del corpus Pile.

## Enlaces

- Hugging Face: https://huggingface.co/elrashid/sae-qwen3-8b-topk-l18
- Árbol de ficheros: https://huggingface.co/elrashid/sae-qwen3-8b-topk-l18/tree/main
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Pile-uncopyrighted: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI del artefacto: 10.57967/hf/9451
