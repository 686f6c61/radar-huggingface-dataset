# MediaAtlas/sraka-27b-v3-javna-narocila-lora

## Resumen

Sraka 27B v3 · javna naročila (LoRA) es un adaptador LoRA publicado por MediaAtlas sobre el modelo base MediaAtlas/sraka-27b-v3, orientado exclusivamente a tareas de extracción de información y clasificación sobre contratación pública eslovena. No es un modelo autónomo: los pesos del modelo base no se incluyen en el repositorio (0,9 GB, formato PEFT/safetensors) y el adaptador solo funciona cargado sobre dicha base, cuyas condiciones (Apache-2.0) se heredan.

El adaptador resuelve un conjunto acotado de tareas del dominio: leer la documentación de una licitación y devolver en JSON con citas qué exige el pliego, leer la documentación de un contrato adjudicado y determinar qué necesitará el adjudicatario, clasificar qué compra el órgano de contratación en una de 39 categorías, clasificar qué vende principalmente un proveedor al sector público, etiquetar la función de una palabra en descripciones de compra y extraer las necesidades de una obra menor.

Es relevante por su enfoque de evaluación transparente y por el desglose explícito del origen de los datos: los "readings" proceden de salidas de Claude (Anthropic) verificadas por coincidencia literal de citas, y las etiquetas `mark` fueron asignadas a ciegas por Claude, mientras que las etiquetas `decision` provienen del propio modelo de decisión de MediaAtlas. El adaptador se comporta así como un destilador de esas anotaciones en tareas estrechas, no como un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer; arquitectura del modelo base no detallada en la información disponible (la model card indica base Qwen3.8-27B) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "27B" (tamaño exacto no disponible) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, valor no especificado) |
| Tipos de cuantizacion | No disponible para el adaptador; al ser pesos PEFT/safetensors, la cuantización aplicable depende del modelo base |
| Idiomas soportados | Esloveno (sl) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MediaAtlas/sraka-27b-v3, que a su vez se declara basado en Qwen3.8-27B con licencia Apache-2.0. No se detallan en la información disponible ni la configuración del LoRA (rango, alpha, módulos objetivo) ni la arquitectura interna del modelo base más allá de su denominación.

El conjunto de entrenamiento consta de 5202 ejemplos mezclados por tarea (estado a 2026-11-12), con la siguiente distribución: `kind · decision` 1039, `kind · mark` 252, `read_call · claude` 260, `read_deal · claude` 125, `read_deal · too long` 3, `sells · decision` 777, `sells · mark` 723, `term · decision` 53, `term · mark` 1234 y `works · mark` 739. Los textos son públicos: documentación de licitaciones y anuncios del portal de contratación pública esloveno, además de listados anuales de órganos de contratación. Se eliminaron correos electrónicos, teléfonos y líneas con personas de contacto, y los empresarios individuales aparecen sin nombre. Los ejemplos de entrenamiento no están publicados. No se menciona uso de RLHF ni DPO; el proceso es de destilación supervisada de anotaciones (de Claude y del modelo de decisión propio) sobre tareas concretas.

## Capacidades

- Lectura de documentación de licitaciones: devuelve JSON con citas sobre lo que exige el pliego.
- Lectura de documentación de contratos adjudicados: determina qué necesitará el adjudicatario, en JSON con citas.
- Clasificación de la compra del órgano de contratación en una de 39 categorías.
- Clasificación de qué vende principalmente un proveedor al sector público.
- Etiquetado de la función de una palabra en descripciones de compras.
- Extracción de necesidades en obras de construcción menores.
- Generación de texto y clasificación en esloveno, limitada al dominio de contratación pública.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito; la model card indica explícitamente el uso con `enable_thinking=False`.

## Casos de uso

- Extracción estructurada de requisitos de pliegos: dado el texto de una licitación, el adaptador devuelve un JSON con citas literales de lo que el pliego exige, lo que permite construir un índice de requisitos verificable y auditable por humanos.
- Análisis de documentación de contratos adjudicados: a partir de los documentos de un contrato ya adjudicado, se obtiene un JSON con las necesidades previsibles del adjudicatario, útil para planificación de suministros o servicios.
- Clasificación automática de compras públicas: asignar cada licitación a una de las 39 categorías para alimentar paneles de gasto, estadísticas o sistemas de alertas por sector.
- Perfilado de proveedores del sector público: clasificar qué vende principalmente cada proveedor a partir de sus descripciones, para segmentación comercial o análisis de mercado.
- Normalización semántica de descripciones de compra: etiquetar la función de palabras clave en descripciones de compras para mejorar búsqueda, deduplicación o agregación de datos.
- Extracción de necesidades en obra menor: identificar y listar las necesidades marcadas en licitaciones de construcción de pequeña escala, con alta exhaustividad y precisión según la métrica reportada.
- Enriquecimiento de portales de contratación: integrar el adaptador como paso de un pipeline que convierta texto libre en JSON estructurado y etiquetas, siempre con verificación de citas.

## Benchmarks y rendimiento

La model card reporta métricas sobre una quinta parte de ejemplos de cada tarea reservada de forma permanente (por valor hash de la clave), no usada en el entrenamiento de ningún modelo de MediaAtlas. Se comparan el adaptador y el modelo base sin adaptador:

| Tarea | Con adaptador | Base sin adaptador |
|---|---|---|
| Lectura de pliego: qué exige (JSON con citas) | 81,0 % de citas confirmadas por el profesor (426 de 526); sin JSON 16 de 91 | 67,7 % (356 de 526); sin JSON 7 de 91 |
| Lectura de contrato adjudicado: qué necesitará el adjudicatario | 103,2 % de citas confirmadas (226 de 219); sin JSON 1 de 40 | 111,9 % (245 de 219); sin JSON 0 de 40 |
| Qué compra el órgano de contratación (39 tipos) | 86,8 % correcto de 68 (modelo de decisión en los mismos: 61,8 %) | 72,1 % de 68 (modelo de decisión: 61,8 %) |
| Qué vende el proveedor al sector público | 78,2 % correcto de 197 (modelo de decisión: 62,4 %) | 67,5 % de 197 (modelo de decisión: 62,4 %) |
| Función de la palabra en descripciones de compra | 87,4 % correcto de 286 (modelo de decisión: 59,8 %) | 76,9 % de 286 (modelo de decisión: 59,8 %) |
| Qué necesita una obra de construcción menor | Encuentra el 90,9 % de las necesidades marcadas; de las listadas, el 95,0 % son correctas (161) | Encuentra el 71,9 %; de las listadas, el 47,2 % son correctas (161) |

Advertencia de la propia model card: en las tareas de lectura, una cita que aparece literalmente en el texto demuestra que el fragmento no es inventado, pero no que el valor leído sea correcto. En las tareas cortas, la referencia es la etiqueta del anotador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base (denominado 27B) y de su cuantización.
- GPU recomendadas: no disponibles en la información proporcionada; para un modelo de ~27B se requeriría hardware de gama alta (A100/H100) en precisión completa, dato no confirmado por la model card.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: no especificadas; al ser un adaptador PEFT sobre safetensors, requiere cargar el modelo base con una librería compatible con PEFT (por ejemplo, transformers + peft). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA para contratación pública eslovena) en la información proporcionada. La única comparación documentada es contra el propio modelo base sin adaptador, recogida en la tabla de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sraka 27B v3 · javna naročila (LoRA) | Adaptador sobre base "27B" (exacto no disponible) | No disponible | Apache-2.0 | Hugging Face (PEFT) |
| MediaAtlas/sraka-27b-v3 (base sin adaptador) | "27B" (exacto no disponible) | No disponible | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado con datos de unas pocas semanas de licitaciones y con listados hasta 2025; lee peor otros tipos de textos.
- No es asesoramiento jurídico: el texto oficial es siempre la publicación original y las respuestas de lectura deben verificarse con las citas, como hacen los servicios de MediaAtlas.
- Las métricas de lectura verifican que la cita existe literalmente, no que el valor extraído sea correcto.
- Las etiquetas `mark` fueron asignadas a ciegas por Claude y las `decision` por el modelo propio de MediaAtlas solo cuando estaba seguro; el adaptador aprende de esas anotaciones, con los sesgos que ello implica.
- Uso restringido al esloveno y al dominio de contratación pública; no se documentan capacidades multilingües.
- El adaptador no incluye los pesos del modelo base y solo funciona con MediaAtlas/sraka-27b-v3; no se indica compatibilidad con otras bases.
- No se documentan sesgos específicos más allá de los derivados de los datos y anotadores descritos.
- Riesgo de alucinación: mitigado parcialmente por el requisito de citas literales en las tareas de lectura, pero no eliminado.
- Restricciones de licencia: Apache-2.0, heredada del modelo base; no se detallan condiciones adicionales para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/MediaAtlas/sraka-27b-v3-javna-narocila-lora
- Modelo base: https://huggingface.co/MediaAtlas/sraka-27b-v3
- Modelo de decisión citado en la model card: https://decision.mediaatlas.si
- Portal esloveno de contratación pública citado como fuente de datos: "Javne informacije Slovenije – portal javnih naročil" (URL exacta no disponible en la información proporcionada)
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
