# bratao/Qwen3OIE-0.6B

## Resumen

Qwen3OIE-0.6B es un modelo de extracción de información abierta (OpenIE) abstractiva en portugués, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-0.6B, desarrollado por bratao. Dada una frase en portugués, genera una o más extracciones binarias en formato JSON con los campos `ARG0`, `V` y `ARG1`, lo que permite capturar relaciones semánticas de forma estructurada sin depender de esquemas predefinidos.

Se trata del checkpoint más pequeño publicado de la familia Qwen3OIE y está pensado como primer modelo recomendado para experimentos locales. Su arquitectura es un transformer decoder-only causal con 596 millones de parámetros, y el fine-tuning se realizó con una longitud de secuencia de 2.048 tokens. Al ser un modelo abstractivo, puede normalizar o inferir palabras que no aparecen literalmente en el texto fuente, por lo que aplicaciones que requieran trazabilidad estricta deben validar cada campo generado contra la entrada o usar un modelo extractivo.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en bfloat16 (aproximadamente 1,2 GB). Su relevancia actual radica en ofrecer una solución ligera y de bajo coste computacional para tareas de extracción de información en portugués, un idioma con escasez de recursos específicos para OpenIE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (contexto de fine-tuning; la arquitectura base soporta más, pero no fue evaluado) |
| Tipos de cuantizacion | bfloat16 (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only causal con 596 millones de parámetros. El fine-tuning se realizó sobre un corpus sintético de extracción abstractiva de información abierta descrito en la tesis del autor: 29.026 frases en portugués y 102.788 extracciones sintéticas generadas con Gemini 2.5 Flash a partir de 2.015 párrafos de Wikipedia en portugués. El dataset de entrenamiento no se publica en el repositorio de Hugging Face, por lo que la model card omite el campo `datasets`.

El entrenamiento utilizó una longitud de secuencia de 2.048 tokens. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar. La model card incluye un ejemplo de uso directo con Transformers, indicando que se debe mantener el prompt de sistema, el prefijo `S:`, la plantilla de chat y `enable_thinking=False` para obtener resultados coherentes.

## Capacidades

- Extracción de información abierta abstractiva en portugués: genera triplas `(ARG0, V, ARG1)` en JSON a partir de una frase.
- Generación de texto como modelo de lenguaje causal (heredado de la base Qwen3-0.6B).
- Soporte de plantilla de chat (chat template) de Qwen3, con modo de razonamiento desactivado (`enable_thinking=False`).
- Integración con la librería `portuguese-openie`, que facilita la extracción de triplas sin necesidad de gestionar rutas de modelo.
- Capacidad de normalización léxica: puede reformular o inferir expresiones no presentes literalmente en la entrada, lo que resulta útil para generalizar relaciones, aunque requiere validación posterior.

No se han documentado capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso. El modelo está especializado exclusivamente en portugués para la tarea OpenIE.

## Casos de uso

- Construcción de grafos de conocimiento a partir de textos en portugués: el modelo extrae relaciones binarias que pueden alimentar bases de datos de grafos (p. ej., Neo4j) para representar entidades y sus conexiones de forma automática.
- Análisis de noticias y artículos periodísticos: permite extraer quién hizo qué (sujeto, verbo, objeto) de titulares o párrafos, facilitando la agregación de eventos y la generación de resúmenes estructurados.
- Procesamiento de documentos académicos o enciclopédicos: dado un párrafo de Wikipedia o un resumen de investigación, el modelo extrae afirmaciones clave en formato estructurado, útil para sistemas de pregunta-respuesta o búsqueda semántica.
- Automatización de tareas de NLP en portugués dentro de pipelines de extracción de información: al ser ligero (596 M parámetros), puede ejecutarse en CPU y en entornos con recursos limitados, integrándose en flujos de procesamiento por lotes.
- Prototipado y enseñanza de OpenIE: su pequeño tamaño y su licencia permisiva lo hacen adecuado para demostraciones educativas y experimentos académicos sobre extracción de información abstractiva.
- Validación de hipótesis en investigación lingüística: investigadores pueden analizar cómo el modelo normaliza o infiere relaciones en comparación con enfoques extractivos, estudiando las diferencias entre ambos paradigmas.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación sobre 100 frases de test en portugués con 238 extracciones de referencia del conjunto WikiPUD-Portuguese-Abstractive (etiquetado como silver-standard, generado con un LLM y revisado manualmente). Los criterios son:

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Coincidencia exacta (perfect match) | 0.1136 | 0.1723 | 0.1369 |
| Coincidencia léxica (lexical match) | 0.2493 | 0.3782 | 0.3005 |

Estos resultados son de investigación sobre un conjunto pequeño y no deben interpretarse como garantías generales de rendimiento en portugués. No se han publicado comparaciones con otros modelos OpenIE en la información disponible.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan aproximadamente 1,2 GB. Se recomienda partir de unos 4 GB de RAM del sistema para inferencia en CPU; la ejecución en GPU es opcional.
- En una prueba de humo en CPU (Python 3.12.9, PyTorch 2.13, Transformers 4.57.6, Accelerate 1.14), la carga del modelo tardó unos 8,5 segundos, la generación más el parseo unos 4,1 segundos, y el pico de RSS del proceso fue de aproximadamente 1,58 GB. Estos valores son orientativos y dependen de la secuencia y del software.
- Al ser un modelo de 0,6 B, cabe en cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida), aunque no se han publicado mediciones específicas en GPU.
- Opciones de despliegue: la librería `portuguese-openie` con backend Transformers, uso directo con `AutoModelForCausalLM` de Transformers, y soporte para text-generation-inference (TGI) según los tags del repositorio. No se mencionan formatos GGUF ni soporte en Ollama o vLLM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en OpenIE abstractiva para portugués. La familia Qwen3OIE incluye checkpoints de mayor tamaño según la tesis, pero no se han publicado en este repositorio. Como referencia, el modelo base Qwen3-0.6B (sin fine-tuning) no está entrenado para OpenIE y no produce salidas estructuradas en JSON de forma fiable. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- La generación abstractiva puede omitir relaciones, duplicar extracciones, alucinar contenido o emitir JSON malformado. Se recomienda parsear defensivamente y conservar siempre la frase fuente.
- El modelo fue evaluado únicamente en 100 frases de carácter mayoritariamente enciclopédico; su rendimiento puede degradarse en texto dialectal, conversacional, especializado, muy largo o adversarial.
- No ha sido auditado para sesgos demográficos. Su comportamiento en dominios sensibles (salud, derecho, etc.) no está verificado.
- Al ser abstractivo, puede inferir o normalizar palabras que no aparecen literalmente en la entrada; aplicaciones que requieran trazabilidad estricta deben validar cada campo generado contra el texto original o usar un modelo extractivo.
- El contexto de fine-tuning es de 2.048 tokens; secuencias más largas pueden ser aceptadas por la arquitectura base, pero no fueron evaluadas en este modelo.
- La licencia Apache 2.0 permite uso comercial sin restricciones conocidas, pero el autor no ofrece garantías sobre la calidad de las extracciones en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bratao/Qwen3OIE-0.6B
- Página de despliegue en FriendliAI: https://friendli.ai/models/bratao/Qwen3OIE-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
