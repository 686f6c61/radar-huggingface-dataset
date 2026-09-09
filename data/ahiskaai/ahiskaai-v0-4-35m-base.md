# AhiskaAI/AhiskaAI-v0.4-35M-Base

## Resumen

AhiskaAI/AhiskaAI-v0.4-35M-Base es un modelo de lenguaje pequeño (SLM) de tipo causal LM desarrollado por AhiskaAI, orientado específicamente al turco. La arquitectura se basa en Llama, como indican las etiquetas del repositorio, y el modelo se distribuye con licencia Apache 2.0. A pesar de que el nombre indica 35M, el conteo real de parámetros en los pesos safetensors es de 43.217.280.

Se trata de un modelo muy compacto, con un tamaño de repositorio de 0.1 GB, lo que lo hace adecuado para entornos con recursos limitados. Su objetivo principal es la generación de texto en turco a través de la librería transformers. La información disponible no incluye detalles sobre el entrenamiento, la longitud de contexto ni benchmarks, por lo que gran parte de sus características técnicas y capacidades permanecen sin documentar.

Dado que es un modelo reciente y sin descargas, su relevancia es principalmente como base para investigación y fine-tuning en tareas de procesamiento de lenguaje natural en turco. La falta de resultados públicos de evaluación implica que su rendimiento aún no ha sido validado ampliamente por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal LM basado en Llama (según etiquetas del repositorio) |
| Parámetros totales | 43.217.280 (el nombre del modelo indica 35M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama de transformers, con una configuración causal LM para generación de texto. No se ha proporcionado información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas de RLHF o DPO. Tampoco se mencionan innovaciones técnicas destacables como decodificación especulativa o atención linear. El modelo está etiquetado como "small-language-model" y "causal-lm", lo que confirma su naturaleza como un LM denso de tamaño reducido.

## Capacidades

- Generación de texto causal en turco, como se deduce de la etiqueta `causal-lm` y del pipeline `text-generation`.
- Puede ser utilizado para completar texto o generar respuestas simples en turco, dentro de las limitaciones de un modelo de 43 millones de parámetros.
- No hay documentación que respalde soporte de tool calling, function calling, agentes, visión, audio ni "thinking mode".
- Al ser un modelo denso y pequeño, su capacidad de razonamiento matemático o de código se considera muy limitada y no está evaluada.
- El soporte multilingüe se restringe al turco según la etiqueta `language: tr`.

## Casos de uso

No hay casos de uso documentados; los siguientes son aplicaciones potenciales basadas en las características del modelo y requerirían fine-tuning en cada escenario:

- Corrección y autocorrección de texto en turco: el modelo puede ajustarse para identificar y corregir errores gramaticales en frases cortas, aprovechando su naturaleza causal y su bajo coste de inferencia.
- Clasificación de sentimiento en redes sociales turcas: mediante fine-tuning en un dataset anotado, puede servir para clasificar publicaciones en positivas, negativas o neutras, gracias a su tamaño reducido que facilita el despliegue en lote.
- Autocompletado de texto en teclados móviles: su tamaño reducido permite ejecutarlo en dispositivos con poca memoria para sugerir la siguiente palabra en turco.
- Generación de resúmenes de noticias breves: tras un entrenamiento específico, podría generar resúmenes de textos periodísticos cortos en turco, aprovechando el pipeline `text-generation`.
- Asistente para correos electrónicos básicos: con fine-tuning, puede redactar respuestas sencillas en turco para mensajes rutinarios, reduciendo la carga manual en entornos de atención al cliente.
- Sistema de preguntas frecuentes (FAQ): puede entrenarse para responder consultas básicas en turco con respuestas predefinidas, lo que resulta útil en chatbots simples de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se ha encontrado referencia alguna a puntuaciones en MMLU, HumanEval, GSM8K u otras evaluaciones. Cualquier comparación de rendimiento sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 43.217.280 parámetros en FP16 (2 bytes), los pesos ocupan aproximadamente 86 MB; en FP32, unos 173 MB. No hay datos de cuantizaciones, pero incluso en FP32 cabría en cualquier GPU con 512 MB de VRAM o más.
- GPU recomendadas: no se especifican. Por su tamaño, no requiere GPUs de alta gama; una NVIDIA T4, RTX 2060 o incluso una CPU moderna resultan suficientes.
- Capacidad en consumer GPU: sí, cabe en cualquier GPU de consumo con al menos 512 MB de VRAM, incluidas las integradas en portátiles.
- Opciones de despliegue: al ser compatible con la librería transformers y estar etiquetado como compatible con `text-generation-inference`, puede desplegarse mediante el pipeline de transformers. No hay confirmación de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. En un modelo de este tamaño, la latencia sería baja, pero no se puede dar un valor concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otras alternativas de la misma categoría. La búsqueda web no arrojó resultados relevantes y la model card no incluye comparaciones con otros SLM turcos. No disponible.

## Limitaciones y advertencias

- Modelo de 43 millones de parámetros: capacidad muy limitada para generar texto coherente y extenso.
- Longitud de contexto desconocida: podría ser muy corta, dificultando el manejo de texto largo.
- Idioma: únicamente turco, sin soporte oficial para otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto.
- Sin benchmarks publicados: el rendimiento no ha sido validado externamente.
- Sesgos: al no conocer el dataset de entrenamiento, no se pueden evaluar los sesgos presentes.
- Licencia Apache 2.0: permite uso comercial, pero es necesario revisar los términos completos.
- No hay evidencia de soporte para herramientas externas, agentes ni multimodalidad.

## Enlaces

- HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-v0.4-35M-Base
- No se ha encontrado documentación adicional (papers, blogs, demos) en la búsqueda web.
