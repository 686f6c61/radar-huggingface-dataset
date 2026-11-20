# BH-Language-AI/bh-vision-1-4b

## Resumen

BH-Vision-1-4B es un adaptador QLoRA publicado por BH-Language-AI sobre el modelo multimodal Qwen2.5-VL-3B-Instruct de Alibaba. Su objetivo es mejorar el rendimiento en tareas de comprensión de documentos, gráficos y comunicados en bosnio (código ISO `bs`), un idioma con escasa representación en los modelos vision-language de propósito general. El adaptador se entrena sobre un conjunto sintético denominado synth7, con 3.015 muestras, y se distribuye bajo licencia Apache-2.0.

La nomenclatura "4B" del nombre comercial no corresponde a un modelo de 4.000 millones de parámetros, sino a la clase de producto: el modelo base Qwen2.5-VL-3B-Instruct tiene aproximadamente 3.750 millones de parámetros y el adaptador añade un conjunto reducido de pesos LoRA (rango 16). El repositorio ocupa 0,2 GB, lo que confirma que se trata de un adaptador y no de un checkpoint completo.

La relevancia del modelo es acotada pero concreta: demuestra que un ajuste fino ligero (40 pasos, rango 16) puede aportar mejoras medibles en un dominio idiomático específico sin degradar el rendimiento del modelo base en datos reales. La model card es explícita sobre el alcance limitado de la mejora: +2,7 puntos porcentuales en el conjunto de validación sintético y sin cambios en el conjunto held-out de documentos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) del modelo base Qwen2.5-VL-3B-Instruct, con adaptador QLoRA (rango 16) |
| Parametros totales | Aproximadamente 3.750 millones en el modelo base; el adaptador añade un conjunto reducido de pesos LoRA (rango 16, tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se entrena con QLoRA, lo que implica cuantizacion del base durante el entrenamiento) |
| Idiomas soportados | Bosnio (`bs`); el modelo base soporta adicionalmente otros idiomas no detallados |
| Licencia | Apache-2.0 para el adaptador; el modelo base se rige por Qwen Research License |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA de rango 16 entrenado durante 40 pasos sobre Qwen2.5-VL-3B-Instruct. Qwen2.5-VL es una familia multimodal de Alibaba que combina un codificador visual con un transformer de lenguaje; el adaptador modifica únicamente un subconjunto de pesos, manteniendo congelado el resto del modelo base. El entrenamiento se realizó sobre el conjunto synth7, compuesto por 3.015 muestras sintéticas de documentos bosnios, gráficos y comunicados institucionales.

La innovación técnica es modesta y de carácter práctico: demostrar que un ajuste fino ligero y de bajo coste computacional puede especializar un modelo vision-language genérico en un idioma de bajos recursos. La model card reconoce explícitamente que "la mayor parte del rendimiento la aporta la base" y que el adaptador solo añade +2,7 puntos porcentuales en el conjunto de validación sintético. No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO; el entrenamiento es supervisado sobre pares imagen-texto.

## Capacidades

- Comprensión de imágenes y texto (pipeline `image-text-to-text`): descripción de documentos, gráficos y comunicados en bosnio.
- OCR y extracción de texto de documentos bosnios, con evaluación específica sobre documentos reales del BHAS (agencia estadística de Bosnia y Herzegovina).
- Conversación multi-turno sobre contenido visual, heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Razonamiento sobre gráficos y tablas presentes en imágenes, orientado a documentos institucionales y estadísticos.
- Capacidades multilingües limitadas al bosnio en el ajuste fino; el modelo base conserva sus capacidades originales en otros idiomas.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información proporcionada.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Digitalización de comunicados estadísticos del BHAS: el modelo puede procesar imágenes de comunicados oficiales y extraer cifras y texto estructurado, aprovechando el ajuste específico sobre documentos bosnios reales.
- Extracción de datos de gráficos institucionales: útil para pipelines de periodismo de datos o portales de transparencia que necesiten convertir gráficos publicados como imagen en series de datos.
- OCR de documentos administrativos bosnios: digitalización de formularios y documentos escaneados en oficinas públicas, con la ventaja de un ajuste sobre vocabulario y formato local.
- Asistencia a investigadores en ciencias sociales: análisis automatizado de corpus documentales bosnios con contenido visual, reduciendo el trabajo manual de transcripción.
- Moderación y clasificación de contenido visual en bosnio: el modelo puede describir y categorizar imágenes en aplicaciones de contenido local.
- Prototipado rápido de aplicaciones vision-language para el mercado bosnio: al ser un adaptador ligero (0,2 GB) sobre un base de 3B, permite iterar con recursos limitados.
- Evaluación comparativa de ajustes idiomáticos: sirve como referencia metodológica para proyectos que quieran medir el impacto real de un LoRA en idiomas de bajos recursos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de exact-match normalizado sobre dos conjuntos:

| Conjunto | Modelo base (sin entrenar) | Con adaptador (este modelo) |
|---|---|---|
| v03-val (217 muestras, sintéticas) | 87,6% | 90,3% |
| Held-out v01 (73 muestras, documentos BHAS reales) | 49,3% | 49,3% |

Comparación adicional aportada por el autor: el modelo bh-vision-1-2b (clase 2B) obtiene 46,1% en v03-val y 23,3% en held-out v01.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB; el modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente 7-8 GB en FP16 y unos 2-3 GB en cuantización de 4 bits.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 para inferencia en FP16 con margen; una RTX 3090 o 4080 (16 GB) es suficiente para FP16 del base.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4 bits; en 16 GB o más sin cuantizar.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (versión 5.22.2) y `peft` (versión 0.21.2), cargando el base y aplicando el adaptador con `PeftModel.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (v03-val / held-out v01) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Vision-1-4B (este) | ~3,75B base + LoRA | No disponible | 90,3% / 49,3% | Apache-2.0 (adaptador); Qwen Research License (base) | Hugging Face |
| BH-Vision-1-2B | Clase 2B | No disponible | 46,1% / 23,3% | No disponible | Hugging Face (según el autor) |
| Qwen2.5-VL-3B-Instruct (base) | ~3,75B | No disponible | 87,6% / 49,3% | Qwen Research License | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de comparaciones con otros modelos vision-language de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La mejora sobre documentos reales es nula: el adaptador no altera el rendimiento en el conjunto held-out v01 (49,3% en ambos casos), lo que indica que la especialización no generaliza a documentos reales fuera del dominio sintético.
- El conjunto de entrenamiento es sintético (synth7, 3.015 muestras), lo que puede introducir un sesgo hacia formatos y estilos artificiales.
- El rendimiento absoluto en documentos reales es bajo (49,3% de exact-match), insuficiente para producción sin revisión humana.
- El modelo base se rige por la Qwen Research License, no por Apache-2.0; el uso comercial requiere verificar los términos de dicha licencia, que pueden ser más restrictivos que Apache-2.0.
- El ajuste está limitado al bosnio; el rendimiento en otros idiomas depende del modelo base y no ha sido evaluado.
- No se documentan evaluaciones de sesgos, alucinación ni robustez frente a imágenes adversariales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Requiere versiones específicas de `transformers` (5.22.2) y `peft` (0.21.2), lo que puede complicar la integración en entornos con dependencias fijadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-4b
- Documentación de entrenamiento (GitHub): https://github.com/BH-Language-AI/bh-vision/blob/main/docs/TRAINING.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
