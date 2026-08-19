# ceselder/qwen36-27b-sae-l42

## Resumen

`ceselder/qwen36-27b-sae-l42` es un sparse autoencoder (SAE) de tipo BatchTopK entrenado sobre la salida del residual stream de la capa 42 del modelo Qwen/Qwen3.6-27B, un LLM denso multimodal de 27 mil millones de parámetros con contexto de 262 144 tokens. El SAE, desarrollado por el investigador independiente ceselder, tiene un diccionario de 131 072 features (expansión 25,6 veces sobre la dimensión del modelo, d_model=5120) y activa 64 latentes por token mediante un umbral aprendido. Se entrenó con aproximadamente 250 millones de tokens del corpus `openbmb/Ultra-FineWeb` en inglés, alcanzando una varianza explicada de 0,6925 y una tasa de features muertas del 0,02 %.

Este SAE es relevante porque proporciona una descomposición interpretable de las activaciones internas de un modelo de última generación, siguiendo la misma receta BatchTopK que los SAEs de Adam Karvonen para Qwen3-8B, pero aplicada a un modelo mucho más grande y con un diccionario el doble de ancho. Al ser un checkpoint de investigación (entrenado con la mitad de tokens que los SAEs de Karvonen), sirve como base para estudios de interpretabilidad mecanística, localización de conceptos y análisis de circuitos en modelos de 27B, un tamaño poco explorado en este campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder BatchTopK (encoder-decodificador lineal con activación top-k por lote) |
| Parametros totales | No disponible (diccionario de 131072 features sobre d_model=5120; estimación aproximada: ~1,34 mil millones de parámetros, sin confirmar) |
| Parametros activos | 64 latentes por token (k=64, umbral aprendido 1,6539) |
| Longitud de contexto | No aplica (el SAE opera sobre activaciones de un token, no procesa secuencias) |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en precisión completa, formato PyTorch .pt) |
| Idiomas soportados | Inglés (corpus de entrenamiento); aplicable a cualquier idioma que el modelo base Qwen3.6-27B procese |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El SAE sigue la arquitectura BatchTopK propuesta por Bussmann et al. (2024), implementada en la librería `dictionary_learning` de saprmarks. Consiste en un encoder lineal que proyecta el vector residual de la capa 42 (dimensión 5120) a un diccionario sobredimensionado de 131 072 features, seguido de una selección top-k por lote (BatchTopK) que elige los 64 latentes con mayor activación para cada token del lote, en lugar de hacerlo de forma independiente por token. El decodificador reconstruye la representación original a partir de estos latentes. El umbral de activación se aprende durante el entrenamiento (valor final 1,6539), lo que permite un control fino del número de features activas.

El entrenamiento se realizó sobre 250 085 376 tokens del corpus `openbmb/Ultra-FineWeb` (subconjunto en inglés), utilizando la misma configuración que los SAEs de Adam Karvonen para Qwen3-8B: pérdida auxiliar para features muertas con `auxk_alpha=1/32`, calentamiento y programación de umbral aprendido. La varianza explicada final es 0,6925, con una L0 de 64,0 (exactamente el k fijado) y solo 22 features muertas de 131 072 (0,02 %). El autor advierte que, al usar la mitad de tokens que los SAEs de Karvonen (~500M) y un diccionario el doble de grande, este checkpoint debe tratarse como una versión preliminar; un entrenamiento más largo probablemente reduciría aún más la tasa de features muertas.

## Capacidades

- Descomposición interpretable de las activaciones del residual stream de la capa 42 de Qwen3.6-27B, permitiendo identificar features individuales que responden a conceptos lingüísticos y semánticos concretos (por ejemplo, la feature 5307 se activa con "unique", la 12431 con "States", la 28636 con "certainty").
- Análisis de activaciones máximas: el repositorio incluye ventanas de texto decodificadas para cada feature viva, lo que permite inspeccionar visualmente qué patrones detecta cada latente.
- Localización de conceptos y atributos: al ser un SAE sobre la capa 42 (capa profunda), las features capturan representaciones de alto nivel, útiles para estudiar cómo el modelo codifica entidades, relaciones y propiedades.
- Soporte para edición de modelos: al poder identificar y manipular features individuales, se pueden realizar intervenciones dirigidas (por ejemplo, activar o suprimir un concepto) para estudiar su efecto en la salida del modelo.
- Compatibilidad con la librería `dictionary_learning`: el SAE se carga directamente con las utilidades de esa librería, facilitando su integración en pipelines de interpretabilidad existentes.
- Aplicabilidad multilingüe: aunque el entrenamiento fue solo en inglés, el SAE puede aplicarse a activaciones de otros idiomas siempre que el modelo base los procese, aunque la cobertura de features puede ser menor.

## Casos de uso

- Investigación en interpretabilidad mecanística: el SAE permite descomponer las activaciones de la capa 42 en features discretas, facilitando el estudio de cómo el modelo representa conceptos abstractos, relaciones sintácticas o conocimiento factual. Los investigadores pueden cargar el SAE con `dictionary_learning` y extraer las activaciones de cualquier texto de interés.
- Localización de conceptos para sesgos: analizando qué features se activan ante textos que contienen estereotipos o sesgos (por ejemplo, género, raza), se pueden identificar los latentes responsables y estudiar su distribución, contribuyendo a la auditoría de sesgos en modelos grandes.
- Edición de modelos mediante intervención en features: usando las ventanas de activación máxima y los pesos del SAE, se puede intervenir sobre features concretas (por ejemplo, suprimir la feature que codifica "mold" en contextos de humedad) para observar cambios en la generación, lo que sirve para calibrar comportamientos no deseados.
- Análisis de circuitos y atribución causal: combinando el SAE con técnicas de intervención activa (activation patching), se pueden trazar circuitos que conectan features de capas tempranas con la capa 42, ayudando a entender cómo fluye la información en el modelo.
- Generación de datasets de interpretabilidad: las ventanas de texto de máxima activación (archivo `examples.parquet`) pueden usarse para crear conjuntos de datos etiquetados con features, útiles para entrenar clasificadores de conceptos o para validar automáticamente la semántica de cada latente.
- Benchmarking de métodos de entrenamiento de SAEs: al ser un checkpoint con una configuración específica (F=131072, k=64, ~250M tokens), puede usarse como punto de comparación para evaluar la calidad de otros SAEs entrenados con diferentes hiperparámetros o corpus, midiendo varianza explicada, L0 y tasa de features muertas.

## Benchmarks y rendimiento

El autor proporciona métricas de calidad del SAE, que son los benchmarks relevantes para este tipo de componente:

| Metrica | Valor |
|---|---|
| Varianza explicada | 0,6925 |
| L0 (features activas por token) | 64,0 |
| Features muertas | 0,02 % (22 de 131072) |
| Tokens de entrenamiento | 250 085 376 |

Comparación con los SAEs de Adam Karvonen para Qwen3-8B (misma receta BatchTopK):

| Modelo | Diccionario (F) | k | Tokens entrenamiento | Varianza explicada | Features muertas |
|---|---|---|---|---|---|
| Qwen3-8B (Karvonen) | 65536 | 80 | ~500M | No disponible | No disponible |
| Qwen3.6-27B (este SAE) | 131072 | 64 | ~250M | 0,6925 | 0,02 % |

No se han publicado resultados de benchmarks adicionales (como MMLU o HumanEval) porque el SAE no es un modelo generativo; su rendimiento se mide en términos de fidelidad de reconstrucción y esparsidad.

## Requisitos de hardware

- El SAE en sí ocupa 7,0 GB en disco (state_dict en precisión float32). Para cargarlo en memoria se necesitan aproximadamente 7 GB de RAM, pero para usarlo con el modelo base se requiere la VRAM del propio Qwen3.6-27B.
- Inferencia con el modelo base: Qwen3.6-27B es un modelo denso de 27B parámetros. En cuantización FP16 necesita ~54 GB de VRAM, por lo que se requieren GPUs de alta gama como A100 (80 GB), H100 (80 GB) o múltiples RTX 4090 (24 GB cada una) con paralelismo de datos o de capas.
- Para extraer activaciones de la capa 42 y pasarlas por el SAE, se puede usar la librería `dictionary_learning` con hooks de PyTorch. El SAE en sí es ligero (una multiplicación de matrices 5120x131072), por lo que la sobrecarga computacional es mínima comparada con el forward del modelo base.
- Opciones de despliegue: al ser un componente de investigación, no está pensado para producción. Se integra típicamente en scripts de Python con PyTorch y la librería `dictionary_learning`. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Si se desea usar solo el SAE sin el modelo base (por ejemplo, para análisis offline de activaciones precomputadas), se puede ejecutar en CPU con 8-16 GB de RAM, aunque el procesamiento de lotes grandes será lento.

## Comparativa con modelos similares

El SAE se compara directamente con los sparse autoencoders de Adam Karvonen para Qwen3-8B, que usan la misma receta BatchTopK. También es comparable a otros SAEs de la literatura, como los de GemmaScope (para Gemma 2) o los de OpenAI en GPT-2, aunque estos últimos usan top-k por token y no por lote.

| Caracteristica | Este SAE (Qwen3.6-27B) | SAE Karvonen (Qwen3-8B) | GemmaScope (Gemma 2 9B) |
|---|---|---|---|
| Modelo base | Qwen3.6-27B (d=5120) | Qwen3-8B (d=4096) | Gemma 2 9B (d=3584) |
| Diccionario (F) | 131072 | 65536 | 131072 |
| k activo | 64 | 80 | Variable (top-k por token) |
| Tokens entrenamiento | ~250M | ~500M | ~2B (estimado) |
| Varianza explicada | 0,6925 | No disponible | ~0,80 (reportado) |
| Features muertas | 0,02 % | No disponible | <0,1 % |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Formato | .pt (PyTorch) | .pt (PyTorch) | .pt (PyTorch) |

Nota: los datos de GemmaScope son aproximados y provienen de publicaciones públicas; no se dispone de una comparación directa con este SAE en las mismas condiciones.

## Limitaciones y advertencias

- Checkpoint de investigación: entrenado con solo ~250M tokens (la mitad que los SAEs de Karvonen), por lo que la cobertura de features puede ser incompleta y la tasa de features muertas podría reducirse con más entrenamiento.
- Cobertura limitada a la capa 42: solo se analiza el residual stream de una capa concreta; no se proporcionan SAEs para otras capas, lo que limita el análisis de circuitos completos.
- Corpus de entrenamiento exclusivamente en inglés: las features pueden estar sesgadas hacia conceptos y estructuras del inglés; su comportamiento en otros idiomas no está validado.
- Varianza explicada moderada (0,6925): una parte significativa de la varianza de las activaciones no se captura, lo que puede afectar a la fiabilidad de las intervenciones basadas en features.
- Sin garantías de semántica: aunque las ventanas de activación máxima sugieren interpretaciones, la semántica de cada feature no está verificada formalmente; pueden existir features polisémicas o con activaciones espurias.
- Requiere el modelo base completo: para extraer activaciones es necesario ejecutar Qwen3.6-27B, que es un modelo grande con requisitos de hardware considerables (mínimo ~54 GB de VRAM en FP16).
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.6-27B tiene su propia licencia (Apache-2.0 según la información disponible), por lo que se deben revisar los términos de ambos componentes.

## Enlaces

- Repositorio HuggingFace del SAE: https://huggingface.co/ceselder/qwen36-27b-sae-l42
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Librería `dictionary_learning` (saprmarks): https://github.com/saprmarks/dictionary_learning
- Guía completa de Qwen 3.6-27B (blog externo): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Ficha de Qwen3.6-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Recetas vLLM para Qwen3.6-27B: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Otros repos del autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-repeatafterme y https://huggingface.co/ceselder/probemaxxer-qwen36-27b-1M-rl
