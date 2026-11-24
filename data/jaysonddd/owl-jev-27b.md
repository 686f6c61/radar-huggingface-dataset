# Jaysonddd/owl-jev-27b

## Resumen

Owl-Jev es un modelo de decisión de 27B parámetros (26.085.330.160 pesos reales según los safetensors del repositorio) publicado por el usuario Jaysonddd en Hugging Face. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un "estado" (una situación descrita en lenguaje natural o una imagen) junto con preguntas tipadas y devuelve probabilidades sobre opciones predefinidas. Admite tres modos de pregunta: *Choice* (selección entre opciones suministradas), *Noul* (estimación de veracidad de una afirmación) y *Score* (asignación de probabilidad a niveles ordenados).

El modelo es multimodal: procesa texto e imágenes, y para estas últimas combina la imagen original con su transcripción OCR mediante PP-OCRv5. La etiqueta `qwen3_5` en los metadatos sugiere que la arquitectura base deriva de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento. El repositorio ocupa 52,2 GB e incluye pesos en safetensors, además de formatos ONNX y compatibilidad con PyTorch.

La relevancia de este modelo es acotada pero específica: cubre el nicho de los modelos de decisión estructurada (clasificación probabilística con opciones declaradas por el usuario), un patrón útil para sistemas de enrutamiento, validación y agentes que necesitan salidas acotadas y calibradas en lugar de generación abierta. La información pública disponible es muy limitada: cero descargas, cero likes, sin licencia declarada y sin idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; sin detalles en la model card) |
| Parámetros totales | 26.085.330.160 (≈26,1B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo incluye safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX, PyTorch |
| Modalidad | Texto e imagen (con OCR vía PP-OCRv5) |
| Modos de decisión | Choice, Noul, Score |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. La etiqueta `qwen3_5` apunta a una base de la familia Qwen 3.5, y el tamaño de 26,1B parámetros es coherente con un transformer denso de esa escala, pero no hay confirmación oficial ni detalles sobre número de capas, dimensiones ocultas, tipo de atención o si emplea mezcla de expertos. Tampoco se especifica la longitud de contexto.

En el plano del entrenamiento no se publica nada: ni volumen de tokens, ni composición del dataset, ni si hubo ajuste por instrucciones, RLHF o DPO. Lo único documentado es el pipeline de inferencia multimodal: para entradas con imagen, el modelo consume tanto la imagen original como su transcripción OCR generada con PP-OCRv5, de modo que la decisión se toma sobre ambas señales. El autor menciona un "Public Decision Index 0.3" como métrica propia de evaluación, sin explicar su metodología de cálculo más allá de los dos paneles publicados.

## Capacidades

- Decisión por elección (*Choice*): selecciona entre opciones suministradas por el usuario y devuelve probabilidades por opción.
- Verificación de afirmaciones (*Noul*): estima si un enunciado es verdadero en el contexto del estado proporcionado.
- Puntuación ordinal (*Score*): asigna probabilidades a niveles ordenados definidos por el usuario.
- Procesamiento de texto: interpreta estados descritos en lenguaje natural y responde preguntas tipadas sobre ellos.
- Procesamiento de imágenes con OCR: combina la imagen original con su transcripción PP-OCRv5 para tomar decisiones sobre documentos o capturas.
- Salida estructurada y probabilística: el resultado es un diccionario de probabilidades, apto para integrarse en pipelines que necesitan umbrales o calibración.
- Servidor HTTP local: la documentación de inferencia incluye un servidor HTTP para exponer el modelo.
- No se documenta soporte de tool calling, agentes multi-paso, modo thinking, audio ni generación de texto libre.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, usar *Choice* para clasificarla entre categorías predefinidas y obtener probabilidades que permitan derivar a un humano cuando la confianza sea baja.
- Validación de datos extraídos por OCR: con *Noul*, comprobar si un campo transcrito de una factura o formulario es coherente con el resto del documento, usando la imagen y su transcripción como estado.
- Moderación y verificación de afirmaciones: evaluar con *Noul* si una frase de un usuario es consistente con un contexto documental aportado, como paso previo a una respuesta generativa.
- Puntuación de calidad ordinal: con *Score*, asignar niveles (por ejemplo, baja/media/alta) a reseñas, leads o incidencias, obteniendo distribuciones de probabilidad en lugar de una etiqueta dura.
- Extracción estructurada de documentos escaneados: combinar la imagen y el texto OCR para decidir la categoría de un documento (contrato, recibo, identificación) antes de pasarlo a un pipeline de extracción.
- Control de calidad en pipelines de agentes: usar el modelo como verificador de decisión entre pasos, preguntando si una acción propuesta es correcta dado el estado actual, con umbral de probabilidad configurable.
- Triaje de imágenes en flujos documentales: clasificar capturas o escaneos según criterios definidos por el operador, aprovechando la doble entrada imagen + OCR.

## Benchmarks y rendimiento

Los únicos datos publicados son los del "Public Decision Index 0.3" del propio autor, sin comparación con otros modelos ni detalle metodológico:

| Panel | Public Decision Index |
|---|---:|
| Vision | 79,95 |
| Text | 68,22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se deben inferir cifras comparativas a partir del índice propio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1B parámetros, en FP16 se requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en BF16 el cálculo es equivalente. En cuantización de 8 bits, en torno a 26-30 GB; en 4 bits, en torno a 14-16 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB o L40S para 8 bits; GPUs de 24 GB (RTX 4090, L4 no alcanza) solo con cuantización agresiva de 4 bits.
- Cabe en GPU de consumo: previsiblemente solo con cuantización de 4 bits en tarjetas de 24 GB, y no hay cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: el autor documenta un runtime propio (`owl_jev.engine.TextEngine`) y un servidor HTTP local; el repo incluye ONNX, lo que permite inferencia con ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables documentados en la información disponible: Owl-Jev es un modelo de decisión estructurada con interfaz propia (Choice/Noul/Score) y no se han publicado comparaciones con alternativas. Como referencia de escala, se puede situar frente a modelos densos de ~27B de propósito general, pero la comparación no sería homogénea por diferencia de tarea y de interfaz.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Owl-Jev 27B | ≈26,1B | No disponible | Decisión tipada multimodal | No disponible |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Información pública mínima: sin licencia, sin idiomas declarados, sin model card técnica y con cero descargas; no es un modelo validado por la comunidad.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue en producción.
- Métrica propia sin metodología: el "Public Decision Index 0.3" no es un benchmark estándar ni verificable de forma independiente.
- Riesgo de alucinación en el modo *Noul*: al estimar veracidad de afirmaciones, puede producir probabilidades mal calibradas fuera de la distribución de entrenamiento (desconocida).
- Dependencia del OCR: en entradas de imagen, la calidad de PP-OCRv5 condiciona la decisión; documentos con baja resolución o tipografías no latinas pueden degradar el resultado.
- Idiomas no especificados: no hay garantía de comportamiento multilingüe ni de calidad en castellano.
- Interfaz restringida: no genera texto libre ni soporta tool calling documentado; no es sustituible por un LLM conversacional.
- Sin cuantizaciones publicadas: el despliegue en hardware de consumo requiere convertir los pesos por cuenta propia.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jaysonddd/owl-jev-27b
- Documentación de inferencia referenciada por el autor: `inference/README.md` dentro del repositorio (secciones Python, Server y Decision Index reproduction)
- PP-OCRv5 (componente OCR citado): no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles
