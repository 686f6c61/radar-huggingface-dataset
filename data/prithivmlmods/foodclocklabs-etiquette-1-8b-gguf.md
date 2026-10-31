# prithivMLmods/FoodClockLabs-Etiquette-1-8B-GGUF

## Resumen

FoodClockLabs-Etiquette-1-8B-GGUF es la versión cuantizada en formato GGUF de Etiquette 1 (8B), un modelo de lenguaje multimodal (visión + texto) publicado por FoodClock Labs bajo licencia Apache-2.0. Está especializado en una única tarea muy concreta: la extracción offline de información de envases alimentarios y etiquetas nutricionales, transcribiendo únicamente lo visible y legible en las fotografías (sin inventar, estimar ni convertir valores) y generando JSON estructurado con detalles del producto, ingredientes, tablas nutricionales, alérgenos, certificaciones, embalaje y etiquetas de foto.

Técnicamente, el modelo parte de Qwen3-VL-8B-Instruct de Qwen, sobre el que se ha fusionado (merge) un ajuste fino LoRA con rango r=32. El entrenamiento se realizó en BF16 sobre una única NVIDIA RTX PRO 6000 usando 14.657 productos de Open Food Facts, 53.228 fotografías y 60 idiomas de embalaje. Su relevancia reside en que ofrece un rendimiento comparable a modelos propietarios mucho mayores (Claude Sonnet 5.5 y Opus 5.5) en su dominio específico, a un coste marginal (aproximadamente una décima de céntimo por envase en electricidad local) y con despliegue 100% local, lo que lo hace atractivo para pipelines de indexación de catálogos de supermercado, apps de nutrición y cumplimiento normativo de etiquetado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje (transformer multimodal), base Qwen3-VL-8B-Instruct con LoRA r=32 fusionado |
| Parámetros totales | 8.190.735.360 (≈8,19 B) |
| Parámetros activos | no disponible (no se indica arquitectura MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (interfaz/conversación); entrenado con envases en 60 idiomas de embalaje |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (esta variante); el modelo base también está disponible en BF16 safetensors (17,5 GB) para Transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador visual y proyector visión-lenguaje (el archivo `mmproj-bf16.gguf` de 1,16 GB corresponde a ese proyector multimodal en la versión GGUF). Sobre esa base se entrenó un LoRA de rango r=32, posteriormente fusionado en los pesos para obtener un modelo denso único de 8,19 B de parámetros, sin sobrecarga de adaptadores en inferencia.

El entrenamiento se llevó a cabo en BF16 sobre una única NVIDIA RTX PRO 6000, utilizando el dataset `openfoodfacts/product-database` de Open Food Facts: 14.657 productos, 53.228 fotografías y envases escritos en 60 idiomas. La filosofía de diseño es conservadora: el modelo está instruido para transcribir solo información visible y legible, sin adivinar, estimar ni convertir unidades, lo que explica sus bajas tasas de valores inventados (0-2 en las métricas publicadas). La salida es JSON estructurado con campos de producto, ingredientes, tabla nutricional, alérgenos, certificaciones, embalaje y etiquetas de foto.

## Capacidades

- Lectura y transcripción de etiquetas alimentarias a partir de fotografías de envases (frente, tabla nutricional, lista de ingredientes).
- Generación de JSON estructurado con: detalles del producto, ingredientes, tabla nutricional, alérgenos, certificaciones, embasado y etiquetas de foto (photo tags).
- Clasificación de imágenes por tipo: 100,0% de recall en fotos frontales, 98,0% en fotos de tabla nutricional y 89,9% en fotos de ingredientes.
- Extracción numérica de alta precisión en campos clave: 97,0% en kcal, 98,0% en sal y 96,0% en sodio, con solo 0-2 valores inventados.
- Identificación de la base de la tabla nutricional (por 100 g, por ración, etc.): 94,0% de precisión.
- Lectura de envases en 60 idiomas de embalaje (aunque el idioma conversacional del modelo es el inglés).
- Entrada multimodal imagen+texto (pipeline image-text-to-text), con salida conversacional.
- Despliegue local vía llama.cpp, Ollama y LM Studio gracias al formato GGUF.
- No se menciona soporte de tool calling ni de agentes en la información disponible.

## Casos de uso

- Indexación de catálogos de supermercado online: procesado por lotes de fotografías de producto para poblar automáticamente tablas nutricionales y listas de ingredientes en el backend de un e-commerce, sin depender de APIs de pago.
- Aplicaciones móviles de nutrición y conteo de calorías: el modelo puede ejecutarse localmente (Ollama/LM Studio) o en un servidor propio para extraer kcal, sal y sodio de fotos que suben los usuarios.
- Cumplimiento normativo de etiquetado: verificación automática de que los envases declaran alérgenos y valores nutricionales conforme a la normativa, generando JSON auditable con lo impreso en el envase.
- Bases de datos open data (Open Food Facts y similares): contribución automatizada de datos estructurados a partir de fotos enviadas por la comunidad, con validación humana posterior.
- Automatización en almacenes y logística alimentaria: escaneo de producto recibido para registrar certificaciones y datos de embalaje en sistemas de trazabilidad.
- Investigación en salud pública y nutrición: construcción de datasets de composición de alimentos a gran escala a partir de imágenes, con un modelo especializado que minimiza la invención de valores.
- Apps de accesibilidad para personas con alergias o restricciones dietéticas: lectura en tiempo real de etiquetas para detectar alérgenos, ejecutándose offline por privacidad.

## Benchmarks y rendimiento

Resultados publicados por FoodClock Labs en su model card (benchmark propio `etiquette-printed-truth`, 100 productos verificados humanamente, 981 juicios):

| Métrica | Etiquette 1 (8B) | Claude Sonnet 5.5 | Claude Opus 5.5 |
|---|---|---|---|
| Acuerdo global (etiquette-printed-truth) | 83,0% | 87,4% | 90,8% |
| Holdout privado (99 productos) | 81,0% | no disponible | no disponible |
| Examen de catálogo (100 productos) | 87,8% | no disponible | no disponible |
| Base de tabla nutricional | 94,0% | 89,0% | 89,0% |
| Precisión en kcal | 97,0% | no disponible | no disponible |
| Precisión en sal | 98,0% | no disponible | no disponible |
| Precisión en sodio | 96,0% | no disponible | no disponible |
| Recall photo tags (frente / nutrición / ingredientes) | 100,0% / 98,0% / 89,9% | no disponible | no disponible |
| Valores inventados | 0-2 | no disponible | no disponible |

Impacto de la cuantización GGUF sobre el acuerdo global: 81,1% en Q8_0 y 79,9% en Q4_K_M, frente al 83,0% del modelo BF16.

No se han publicado resultados de benchmarks genéricos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/estimación por cuantización (tamaño de archivo GGUF, más overhead de contexto y proyector mmproj):
  - BF16: 16,4 GB
  - Q8_0: 8,71 GB
  - Q6_K: 6,73 GB
  - Q5_K_M / Q5_K_S: 5,85 GB / 5,72 GB
  - Q4_K_M / Q4_K_S: 5,03 GB / 4,8 GB
  - Q3_K_L / Q3_K_M: 4,43 GB / 4,12 GB
  - Proyector multimodal mmproj-bf16: 1,16 GB adicional
- GPU recomendadas: cualquier GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) ejecuta cómodamente las cuantizaciones Q4-Q8; para BF16 se recomiendan RTX 4090 (24 GB) o superiores.
- Consumer GPUs: sí, cabe en GPUs de gama media-alta en Q4_K_M/Q5_K_M (~5-6 GB + mmproj), y en Macs con Apple Silicon (M1/M2/M3 con 8-16 GB de memoria unificada) vía llama.cpp, Ollama o LM Studio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio; el modelo base en safetensors también es compatible con Transformers y text-generation-inference.
- Latencia y throughput: no disponible en la información publicada; el model card solo indica un coste energético aproximado de una décima de céntimo por envase procesado localmente.

## Comparativa con modelos similares

| Característica | Etiquette 1 (8B) | Qwen3-VL-8B-Instruct (base) | Claude Sonnet 5.5 | Claude Opus 5.5 |
|---|---|---|---|---|
| Parámetros | 8,19 B | 8 B | no disponible | no disponible |
| Tipo | Visión-lenguaje especializado en etiquetas alimentarias | Visión-lenguaje generalista | Propietario, generalista | Propietario, generalista |
| Contexto | no disponible | no disponible | no disponible | no disponible |
| Acuerdo global en etiquetas (benchmark propio) | 83,0% (BF16) | no disponible | 87,4% | 90,8% |
| Base de tabla nutricional | 94,0% | no disponible | 89,0% | 89,0% |
| Licencia | Apache-2.0 | Apache-2.0 | Propietaria | Propietaria |
| Despliegue local | Sí (GGUF, BF16) | Sí | No | No |
| Coste por envase | ~0,001 € (electricidad local) | similar | API de pago | API de pago (mayor) |

Etiquette 1 pierde ligeramente frente a Claude Opus 5.5 en acuerdo global (83,0% vs 90,8%), pero supera a ambos modelos de Anthropic en la métrica de base de tabla nutricional (94,0% vs 89,0%) y ofrece despliegue local, licencia abierta y coste marginal por envase.

## Limitaciones y advertencias

- Especialización extrema: el modelo está afinado exclusivamente para extracción de etiquetas alimentarias; su rendimiento en tareas generales de visión-lenguaje o conversación no está evaluado y probablemente esté degradado respecto a Qwen3-VL-8B-Instruct.
- La cuantización reduce precisión: Q8_0 cae al 81,1% y Q4_K_M al 79,9% de acuerdo global (frente al 83,0% en BF16); las cuantizaciones Q3 pierden aún más calidad según la propia tabla de archivos.
- Riesgo residual de alucinación: aunque bajo (0-2 valores inventados en el benchmark), no es nulo; se recomienda validación humana o reglas de coherencia en producción, especialmente en contextos de salud y alérgenos.
- Idioma conversacional en inglés: el modelo está etiquetado solo como `en`; aunque lee envases en 60 idiomas, la salida y la interacción están pensadas para inglés. No hay información sobre soporte del castellano en las respuestas.
- Sesgos del dataset: entrenado solo con productos de Open Food Facts (14.657 productos), puede rendir peor con formatos de etiquetado, marcas o regiones poco representados en ese dataset.
- Benchmarks propios: las métricas proceden del benchmark privado del autor (`etiquette-printed-truth`) y de un holdout privado; no son comparables directamente con benchmarks públicos estandarizados.
- Longitud de contexto no documentada: no se publica la ventana de contexto, lo que dificulta planificar procesado por lotes con múltiples imágenes.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos de uso de Qwen3-VL como base.

## Enlaces

- Modelo GGUF cuantizado: https://huggingface.co/prithivMLmods/FoodClockLabs-Etiquette-1-8B-GGUF
- Modelo base (FoodClockLabs/Etiquette-1-8B): https://huggingface.co/FoodClockLabs/Etiquette-1-8B
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/openfoodfacts/product-database
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Open Food Facts: https://es.openfoodfacts.org/
