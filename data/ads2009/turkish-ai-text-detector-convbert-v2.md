# ads2009/turkish-ai-text-detector-convbert-v2

## Resumen

SENTINEL-AI TR v2 es un modelo de clasificación de texto en turco diseñado para detectar si un texto ha sido generado por inteligencia artificial o escrito por un humano. Se trata de un ajuste fino (fine-tuning) del modelo `dbmdz/convbert-base-turkish-cased` sobre la arquitectura ConvBERT, y devuelve una etiqueta binaria: 0 para texto humano y 1 para texto generado por IA. Lo publica el usuario `ads2009` en Hugging Face bajo licencia Apache 2.0.

El modelo resuelve un problema concreto y creciente: la atribución de autoría en contenido en turco, un idioma con menos recursos que el inglés en herramientas de detección de IA. Con 107,4 millones de parámetros y un repositorio de 0,4 GB, está pensado para despliegues ligeros y de baja latencia, no para generación de texto.

Su relevancia actual reside en la especialización lingüística: al partir de un checkpoint ConvBERT preentrenado específicamente en turco, aprovecha representaciones nativas del idioma en lugar de depender de modelos multilingües genéricos. La model card es extremadamente escueta y exige una normalización concreta de la entrada (`norm_v2`, versión `tr_v2_norm_1`) documentada en el archivo `sentinel_meta.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT (transformer con atención basada en convoluciones) |
| Parametros totales | 107.407.754 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posterior posible vía herramientas estándar) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ConvBERT, una variante de transformer que sustituye parte de los mecanismos de autoatención por bloques convolucionales (span-based dynamic convolution). Esta arquitectura reduce el coste computacional frente a BERT estándar manteniendo capacidad de modelado contextual, lo que la hace adecuada para tareas de clasificación con requisitos de eficiencia. El checkpoint de partida es `dbmdz/convbert-base-turkish-cased`, un modelo base entrenado en turco con distinción de mayúsculas y minúsculas.

El ajuste fino se orienta a una tarea de clasificación binaria (detección de texto generado por IA). La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco detalla hiperparámetros, época de entrenamiento ni métricas de validación. El único requisito técnico documentado es la normalización de la entrada mediante `norm_v2` (versión `tr_v2_norm_1`), descrita en el archivo `sentinel_meta.json` del repositorio.

## Capacidades

- Clasificación binaria de texto en turco: distingue entre texto humano (etiqueta 0) y texto generado por IA (etiqueta 1).
- Procesamiento de texto en turco con distinción de mayúsculas y minúsculas, heredada del checkpoint base.
- Inferencia ligera: 107,4 millones de parámetros permiten ejecución en CPU y GPU de gama baja.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo de visión, audio ni thinking mode.
- Capacidad multilingüe limitada al turco; no se documenta soporte para otros idiomas.

## Casos de uso

- Moderación de contenido en plataformas turcas: clasificar comentarios, reseñas o publicaciones para marcar posible contenido generado automáticamente y aplicar revisión humana o etiquetado.
- Verificación de autoría en medios digitales: integrar el clasificador en la redacción para señalar artículos o comunicados sospechosos de generación sintética antes de su publicación.
- Detección de spam y granjas de contenido: filtrar en pipelines de ingesta textos producidos masivamente por modelos de lenguaje en turco, reduciendo ruido en foros y secciones de comentarios.
- Integridad académica: herramienta de apoyo en entornos educativos turcos para señalar trabajos con alta probabilidad de generación por IA, siempre con revisión humana posterior.
- Análisis de datos para investigación: etiquetar corpus turcos según su origen (humano o sintético) para estudios sobre difusión de contenido generado por IA y calidad de datos.
- Prefiltrado en pipelines de curación de datasets: descartar muestras generadas por IA al construir corpus de entrenamiento en turco, mejorando la proporción de datos humanos.
- Automatización de auditorías de contenido en atención al cliente: clasificar transcripciones o mensajes entrantes para detectar respuestas generadas automáticamente fuera de los canales previstos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (107,4 millones de parámetros); aproximadamente 0,5 GB en FP16 y menos de 0,3 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y funcionarán sin problema.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, TorchScript, ONNX Runtime, o servidores de inferencia como TGI (Text Generation Inference no aplica; para clasificación usar soluciones tipo ONNX o FastAPI). `llama.cpp` y Ollama no son adecuados porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ads2009/turkish-ai-text-detector-convbert-v2 | 107,4 M | no disponible | Detección de texto IA en turco | Apache 2.0 | Hugging Face |
| dbmdz/convbert-base-turkish-cased | ~110 M (estimado, no confirmado) | no disponible | Modelo base turco (MLM) | no disponible en la información | Hugging Face |
| Detectores multilingües genéricos (p. ej. basados en XLM-R) | 270 M–560 M | 512 típicamente | Detección de texto IA multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse sobre datos no especificados, puede heredar sesgos del corpus turco utilizado.
- Riesgo de alucinación no aplica como tal (es un clasificador), pero sí de falsos positivos y falsos negativos: textos humanos con estilo formal o textos de IA editados manualmente pueden clasificarse erróneamente.
- Requiere una normalización específica (`norm_v2`, versión `tr_v2_norm_1`) documentada en `sentinel_meta.json`; omitirla puede degradar la precisión de forma significativa.
- Limitado al turco; no se ha validado su comportamiento en otros idiomas ni en texto con mezcla de lenguas.
- Sin métricas publicadas de precisión, recall o F1, no es posible estimar su fiabilidad en producción sin una evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 42 descargas y ningún "like", lo que sugiere validación comunitaria escasa.
- La fecha de creación indicada (2026-10-26) es futura respecto a la información habitual de repositorios; conviene verificar la integridad y procedencia del checkpoint antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ads2009/turkish-ai-text-detector-convbert-v2
- Modelo base: https://huggingface.co/dbmdz/convbert-base-turkish-cased
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
