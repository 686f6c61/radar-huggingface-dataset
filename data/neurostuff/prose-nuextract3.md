# neurostuff/prose-nuextract3

## Resumen

`neurostuff/prose-nuextract3` es un ajuste fino de `numind/NuExtract3` especializado en extracción estructurada de coordenadas cerebrales a partir de la prosa de artículos de neuroimagen. El modelo lee pasajes como "activación en la amígdala izquierda (x = -22, y = -4, z = -18), Z = 4.1" y devuelve análisis estructurados en JSON: qué coordenadas pertenecen a cada contraste, con su estadístico, tamaño de clúster y espacio estereotáctico. Resuelve un problema clásico de la meta-investigación en neurociencia: la extracción manual de resultados de miles de artículos para meta-análisis.

El modelo parte de la arquitectura Qwen3.5 (tag `qwen3_5` en Hugging Face) con 4.539.265.536 parámetros totales, empaquetado como pipeline `image-text-to-text` en formato safetensors (repo de 9,1 GB). La licencia es Apache 2.0 y el modelo base es `numind/NuExtract3`, un extractor de información conversacional de la familia NuMind.

Es relevante ahora porque demuestra un caso de uso vertical muy específico sobre un modelo fundacional abierto: extracción de información científica con plantillas JSON nativas, decodificación restringida por esquema y reglas de anotación explícitas (resultados nulos, semillas, tests post hoc). El autor publica métricas de retención detalladas y versiona los pesos mediante tags (`v2`, `v3`), lo que facilita la reproducibilidad en pipelines de ingesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal tipo Mamba (familia Qwen3.5), según los tensores entrenados citados en la model card |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el corpus de entrenamiento son pasajes de artículos científicos, presumiblemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, no adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (pesos fusionados) sobre `numind/NuExtract3`, que a su vez se apoya en la familia Qwen3.5. La model card menciona explícitamente tensores de capas Mamba y "linear-attention mixers", lo que indica una arquitectura híbrida que combina atención estándar con capas de estado recurrente. El ajuste se realizó con LoRA de rangos 16 (mixers de atención lineal), 32 (atención) y 12 (MLPs), más el entrenamiento directo de tensores que LoRA no cubre (los de las capas Mamba); por eso se publican pesos fusionados y no adaptadores, ya que cargar solo el adaptador daría resultados silenciosamente incorrectos.

El conjunto de entrenamiento consta de 15.259 pasajes (44% reales), con 3.500 pasajes minados específicamente para casos difíciles: resultados nulos, tests post hoc, semillas, conjunciones, correlaciones con signo, covariables y unidades. Los pasajes reales son borradores generados por modelo y auditados contra reglas de anotación por Claude Sonnet, verificando que cada coordenada, valor y tamaño de clúster aparezca impreso en el pasaje. El entrenamiento usó lr 1e-4, batch global 33, sobre 3 A100, con 2 épocas planificadas (924 pasos); los pesos publicados corresponden al paso 700, elegido como mejor de los pasos 300–924 sobre los conjuntos de test. El prompting sigue el modo plantilla nativo de NuExtract3: instrucción `instruction_v3.txt`, documento con título, abstract, sección y contexto antes/después del pasaje, y `template.json` como plantilla de chat, con decodificación greedy restringida por esquema JSON.

## Capacidades

- Extracción de información estructurada: convierte prosa neurocientífica en JSON con análisis, coordenadas, estadísticos, tamaños de clúster y espacio.
- Salida restringida por esquema JSON (compatible con `structured_outputs` de vLLM).
- Manejo de resultados nulos explícitos: conserva análisis que el pasaje declara sin hallazgos significativos, sin puntos.
- Distinción de semillas: el centro de una semilla se registra como su propio análisis con nombre `Seed: <nombre>`.
- Soporte de tests post hoc y conjunciones: una coordenada reportada para varios resultados se lista bajo cada uno.
- Filtrado de coordenadas no cerebrales (tamaños de vóxel, rejillas de docking).
- Capacidad conversacional y de extracción genérica heredada del modelo base NuExtract3.
- Soporte multimodal imagen-texto según el pipeline declarado (`image-text-to-text`), aunque la model card no documenta uso de imágenes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Meta-análisis de neuroimagen: el modelo extrae coordenadas y estadísticos de cientos de artículos para alimentar bases de datos como NeuroSynth o BrainMap, sustituyendo la lectura manual de resultados en prosa.
- Ingesta automatizada en pipelines de investigación: integrado en flujos como `ns-pond` (referenciado en la model card), procesa pasajes con contexto antes y después para nombrar correctamente los análisis.
- Extracción de resultados nulos: conserva análisis declarados sin hallazgos, lo que permite estudios de sesgo de publicación y replicabilidad.
- Gestión de semillas y ROI: identifica centros de semillas y regiones de interés como análisis propios, útil para meta-análisis de conectividad funcional.
- Normalización de estadísticos: extrae valores Z, t, F y tamaños de clúster solo cuando se reportan para el pico concreto, facilitando la armonización de unidades (vóxeles o mm³).
- Auditoría de bases de datos existentes: re-extrae coordenadas de artículos ya codificados para detectar discrepancias con las reglas v3.
- Procesamiento por lotes con salida validada: al decodificar con esquema JSON, la salida es directamente parseable y validable en pipelines de CI de datos científicos.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación retenida, decodificación greedy, restringida por esquema, cada modelo con su propia instrucción; coincidencia de puntos en xyz redondeado, análisis coincidente si comparte al menos la mitad de sus puntos):

| Conjunto | Métrica | v2 | v3 |
|---|---|---|---|
| Gold (78 pasajes) | puntos encontrados / análisis coincidentes | 98,7% / 88,8% | 100% / 91,4% |
| NMB (111 pasajes) | puntos / análisis | 98,2% / 89,9% | 97,7% / 92,3% |
| Resultados nulos nombrados (de 39) | conservados | 0 | 32 |
| Análisis `Seed:` (de 15) | detectados | 0 | 14 |
| Sintético difícil (200 pasajes) | puntos / análisis | 96,1% / 94,2% | 100% / 100% |

La precisión es del 97–100% en ambos modelos. En el conjunto sintético difícil, v2 obtiene el 69% de los puntos de tests F y post hoc frente al 100% de v3. Las claves de referencia de gold y NMB fueron re-auditadas bajo las reglas v3, por lo que v2 no puede puntuar en resultados nulos ni en nombres `Seed:`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9,1 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 4,5–5 GB; en 4 bits, unos 2,5–3 GB (estimaciones a partir del tamaño del repo, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para lotes grandes y mayor contexto; RTX 4090 (24 GB) para inferencia en FP16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en FP16 y en tarjetas de 8–12 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM con `structured_outputs` para decodificación restringida por esquema (uso documentado en `ns-pond`); llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prose-nuextract3 (este) | 4,54 B | no disponible | Coordenadas en prosa de neuroimagen | Apache 2.0 | Hugging Face, 30 descargas |
| jdkent/nuextract3-neuro-tables | no disponible | no disponible | Coordenadas en tablas de resultados | no disponible | Hugging Face (modelo hermano) |
| numind/NuExtract3 (base) | no disponible | no disponible | Extracción de información genérica | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Las claves de referencia de los benchmarks son auditorías de modelo (Claude Sonnet/Opus), no etiquetas manuales humanas, aunque se verificó que cada valor aparezca impreso en el pasaje.
- v3 a veces añade un análisis nulo que la clave de referencia no incluye; los casos revisados resultaron ser reales, pero introduce ruido potencial.
- Se pierde uno de los 15 análisis `Seed:` en el conjunto gold.
- El modelo está entrenado para un dominio muy estrecho (prosa de neuroimagen en inglés); su rendimiento fuera de ese dominio no está documentado.
- Los datos de entrenamiento no se publican por provenir de artículos con derechos, lo que limita la reproducibilidad exacta del ajuste.
- Idiomas soportados no disponibles; el uso con textos en castellano no está validado.
- Riesgo de alucinación de coordenadas o estadísticos fuera de los casos cubiertos por las reglas de anotación; se recomienda validar la salida contra el texto original.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (pasajes de artículos científicos) puede plantear dudas legales sobre su reutilización, no aclaradas en la model card.
- Los pesos son fusionados: cargar solo un adaptador LoRA produciría resultados incorrectos de forma silenciosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurostuff/prose-nuextract3
- Modelo base: https://huggingface.co/numind/NuExtract3
- Modelo hermano para tablas: https://huggingface.co/jdkent/nuextract3-neuro-tables
- Pipeline de ingesta ns-pond: https://github.com/neurostuff/ns-pond-ingestion-workflow
