# cipherxsnier/ocean-blue-blue3-vision

## Resumen

Ocean Blue: Blue-3 Vision es un ajuste fino (LoRA) del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario de Hugging Face cipherxsnier. El modelo está especializado en la interpretación de imágenes satelitales de disco completo del sistema GOES (Geostationary Operational Environmental Satellite) de la NOAA, concretamente de los satélites GOES-19 (Este) y GOES-18 (Oeste), en formato GeoColor. Resuelve la tarea de extraer metadatos verificables de una imagen satelital: identificar qué satélite la generó, estimar la hora UTC y determinar si es de día o de noche en el centro del disco.

La relevancia del modelo reside en su enfoque de etiquetado determinista: cada etiqueta del conjunto de entrenamiento se calcula a partir de la geometría solar y de los metadatos del propio fotograma, no se anota manualmente. Esto lo convierte en un caso de uso interesante para pipelines de observación de la Tierra donde se requiere verificación automática de procedencia y sellado temporal de imágenes. El modelo parte de una arquitectura transformer multimodal con 8.292.166.656 parámetros totales y se distribuye bajo licencia Apache-2.0.

El ajuste se realizó sobre 1.150 fotogramas de disco completo, de los cuales 284 fueron notarizados por Omega TV y verificados mediante SHA-256. El conjunto de evaluación held-out corresponde a las 36 horas más recientes, nunca vistas durante el entrenamiento. El repositorio ocupa 16,6 GB y emplea el pipeline image-text-to-text de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), ajuste fino LoRA sobre Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El ajuste se realizó mediante LoRA (Low-Rank Adaptation), lo que implica que los pesos base permanecen congelados y se entrenan adaptadores de bajo rango. El repositorio incluye los pesos resultantes en formato safetensors con un total de 8.292.166.656 parámetros, coherente con el tamaño del modelo base de 7B más los adaptadores.

El conjunto de entrenamiento está compuesto por 1.150 fotogramas GeoColor de disco completo de los satélites GOES-19 (Este) y GOES-18 (Oeste), de los cuales 284 fueron notarizados por Omega TV y verificados con SHA-256. Las etiquetas se calcularon de forma determinista: el satélite y la hora UTC se extraen de los metadatos del fotograma, y la condición día/noche en el centro del disco se deriva de la geometría solar. El conjunto de prueba held-out son las 36 horas más recientes, nunca utilizadas en entrenamiento. No se especifica el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Interpretación de imágenes satelitales GeoColor de disco completo de los satélites GOES-19 y GOES-18.
- Identificación del satélite de origen de la imagen (precisión del 100,0% en el conjunto held-out).
- Estimación de la hora UTC con tolerancia de 1 hora (98,5% en held-out).
- Determinación de condición día/noche en el centro del disco (100,0% en held-out).
- Generación de texto conversacional en el pipeline image-text-to-text.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües.

## Casos de uso

- Verificación de procedencia de imágenes satelitales: el modelo puede identificar qué satélite GOES generó un fotograma concreto, lo que permite validar la cadena de custodia en archivos de observación de la Tierra.
- Sellado temporal automático: dada una imagen de disco completo, el modelo estima la hora UTC con una tolerancia de una hora, útil para reconstruir secuencias temporales o detectar fotogramas fuera de orden en pipelines de ingesta.
- Clasificación día/noche para control de calidad: la determinación de condición diurna o nocturna en el centro del disco permite filtrar imágenes no válidas para productos que requieren iluminación diurna, como índices de vegetación o detección de nubes.
- Catalogación de archivos NOAA: el modelo puede etiquetar automáticamente grandes volúmenes de fotogramas GeoColor con metadatos de satélite y franja horaria, reduciendo el trabajo manual en la gestión de archivos.
- Auditoría de datasets de observación de la Tierra: al ser un ajuste determinista sobre un modelo multimodal, puede emplearse para comprobar la coherencia entre los metadatos declarados y el contenido visual de una imagen.
- Enrutamiento en pipelines de teledetección: la identificación de satélite y condición día/noche permite dirigir cada imagen al procesamiento adecuado (corrección atmosférica, detección de nubes, etc.) de forma automática.
- Docencia y divulgación: el modelo puede explicar en lenguaje natural las características de una imagen GOES, como la posición del terminador o la cobertura del disco, a partir de la interpretación visual.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor, evaluados sobre el conjunto held-out de las 36 horas más recientes:

| Tarea (held-out) | Antes (Qwen2.5-VL-7B-Instruct) | Después (Blue-3 Vision) |
|---|---|---|
| Identificación de satélite | 99,2% | 100,0% |
| Hora UTC (tolerancia 1 h) | 36,8% | 98,5% |
| Día o noche en el centro del disco | 56,7% | 100,0% |
| **Global** | **64,7%** | **99,4%** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 8,3B parámetros en precisión FP16 requiere aproximadamente 16,6 GB de VRAM solo para los pesos, a los que hay que sumar el coste del codificador visual y la caché KV.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs con 24 GB o más (RTX 4090, A100 40GB, H100), pero no se confirma en la información.
- ¿Cabe en GPU consumer? No confirmado. Un modelo de 7B en FP16 no cabe en GPUs de 8-12 GB sin cuantización; se requeriría cuantización a 8 bits o 4 bits, cuyos formatos no se especifican.
- Opciones de despliegue: la model card indica compatibilidad con el pipeline image-text-to-text de transformers y con text-generation-inference (TGI), según los tags del repositorio. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ocean Blue: Blue-3 Vision | 8,29B | no disponible | Imágenes GOES GeoColor (satélite, hora UTC, día/noche) | Apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B (aprox.) | no disponible | Multimodal generalista | Apache-2.0 | Hugging Face |
| Otros ajustes de Qwen2.5-VL para teledetección | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en metadatos de imágenes GOES. La comparación más directa es con el modelo base Qwen2.5-VL-7B-Instruct, del que hereda la arquitectura y sobre el que mejora sustancialmente en las tres tareas evaluadas (del 64,7% al 99,4% global).

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en imágenes GeoColor de disco completo de GOES-19 y GOES-18; su rendimiento fuera de este dominio no está evaluado.
- El conjunto de entrenamiento es reducido (1.150 fotogramas) y el held-out cubre solo 36 horas, por lo que la generalización a otras estaciones, condiciones o versiones de satélite no está garantizada.
- La estimación de hora UTC tiene una tolerancia de una hora; no se especifica la precisión exacta ni el error medio.
- No se dispone de información sobre sesgos, riesgo de alucinación en dominios fuera de distribución ni comportamiento multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se especifican los formatos de cuantización disponibles ni los requisitos exactos de hardware, lo que dificulta la planificación de despliegues.

## Enlaces

- [Hugging Face: cipherxsnier/ocean-blue-blue3-vision](https://huggingface.co/cipherxsnier/ocean-blue-blue3-vision)
- [Modelo base: Qwen/Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
- [NOAA/NESDIS STAR (imágenes de dominio público)](https://www.star.nesdis.noaa.gov/)
