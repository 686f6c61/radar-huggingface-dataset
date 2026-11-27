# cbrigance/Granite-4.1-8b-heretic-GGUF

## Resumen

Granite-4.1-8b-heretic-GGUF es una cuantizacion en formato GGUF del modelo IBM Granite 4.1 de 8 mil millones de parametros, publicada por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" (tambien etiquetada como "heretic"), es decir, una version del modelo base a la que se le ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para reducir el comportamiento de negativa ante peticiones consideradas sensibles. El modelo base es `ibm-granite/granite-4.1-8b`, un transformer denso de 8.380.551.168 parametros desarrollado por IBM Research.

La relevancia de esta publicacion es acotada y muy especifica: no se trata de un modelo nuevo ni de una mejora de capacidades, sino de un artefacto derivado orientado a experimentacion con tecnicas de desalineacion controlada y a su ejecucion local mediante llama.cpp u Ollama. El repositorio tiene un volumen de adopcion muy bajo (8 descargas y 0 likes en el momento de la consulta), lo que debe tenerse en cuenta a la hora de evaluar su fiabilidad para entornos de produccion.

La ficha se centra en lo que puede verificarse a partir de los metadatos disponibles: identificador, modelo base, licencia, formato, idioma declarado y tamano. Cualquier dato sobre arquitectura interna, composicion del dataset de entrenamiento o resultados de benchmarks del modelo base no se incluye en la informacion proporcionada y se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de ibm-granite/granite-4.1-8b); detalles internos no disponibles |
| Parametros totales | 8.380.551.168 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Otros datos relevantes del repositorio: tamano total del repo de 14,0 GB, pipeline `text-generation`, libreria `gguf`, acceso restringido (gated) con aceptacion de condiciones, etiquetas `abliterated`, `heretic`, `not-for-all-audiences`, `ollama`, `endpoints_compatible`, `conversational`. Referencia bibliografica declarada: arXiv:2406.11717.

## Arquitectura y entrenamiento

El modelo base es IBM Granite 4.1 en su variante de 8 mil millones de parametros, un transformer denso. La informacion proporcionada no detalla la arquitectura interna (numero de capas, dimensiones ocultas, tipo de atencion, uso de RoPE o de variantes de atencion lineal), ni el volumen o composicion del corpus de preentrenamiento, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Todos estos extremos deben consultarse en la model card del modelo base `ibm-granite/granite-4.1-8b`, no en este repositorio derivado.

La innovacion tecnica que define esta publicacion es el proceso de abliteration: se identifican direcciones en el espacio de activaciones asociadas a la generacion de respuestas de rechazo y se eliminan o proyectan fuera mediante edicion de pesos. El resultado es un modelo con menor propension a negarse a responder, pero sin garantia de que las capacidades subyacentes (razonamiento, codigo, matematicas) se preserven intactas. La cuantizacion posterior a GGUF anade una segunda fuente de degradacion, especialmente en precision numerica y en tareas de razonamiento de multiples pasos. No se dispone de informacion sobre el conjunto de datos de calibracion usado en la cuantizacion ni sobre el metodo exacto de ablacion aplicado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.1-8b.
- Razonamiento y respuesta a instrucciones, con la salvedad de que la ablacion puede alterar el comportamiento en dominios sensibles.
- Generacion de codigo y tareas de matematicas: capacidad esperable por herencia del modelo base, sin verificacion publicada en este repositorio.
- Ejecucion local mediante llama.cpp y Ollama, gracias al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo tras una API compatible con el esquema de Hugging Face.
- Capacidad multilingue limitada: solo se declara ingles.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Experimentacion con tecnicas de abliteration: el modelo sirve como artefacto de referencia para comparar el comportamiento de un modelo base frente a su version ablacionada en pruebas de rechazo, utilidad directa en investigacion sobre alineacion y seguridad.
- Evaluacion de robustez de filtros de seguridad: permite comprobar si los clasificadores de entrada y salida de un pipeline propio detectan contenido que un modelo desalineado esta dispuesto a generar, sin necesidad de exponer el modelo base original.
- Inferencia local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada de gran capacidad, lo que facilita pruebas offline y reproducibilidad en entornos aislados.
- Desarrollo de harness de evaluacion comparativa: util para medir la degradacion introducida por la ablacion y por la cuantizacion en tareas estandar de razonamiento y codigo, comparando contra el modelo base en la misma infraestructura.
- Pruebas de integracion con servidores compatibles con la API de OpenAI: la etiqueta `endpoints_compatible` permite conectarlo a clientes existentes para validar flujos de aplicacion antes de migrar al modelo base.
- Docencia y divulgacion tecnica: ilustra de forma tangible que es la abliteration, como se distribuye un modelo derivado en GGUF y que precauciones requiere su publicacion (acceso restringido, etiqueta `not-for-all-audiences`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo ablacionado ni para las cuantizaciones concretas. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.380.551.168 parametros, en cuantizacion de 4 bits se requieren aproximadamente 5-6 GB de VRAM o memoria unificada; en 8 bits, en torno a 9-10 GB; en FP16, unos 17 GB. Estas cifras son estimaciones por tamano y no mediciones publicadas para este repositorio.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones de 8 bits o superiores con contexto amplio; RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB para cuantizaciones de 4-5 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 a 6 bits en tarjetas con 8 GB o mas, y en 8 bits en tarjetas de 12-16 GB, siempre con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de OpenAI mediante los endpoints indicados. vLLM y TGI no son opciones directas para pesos GGUF sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| cbrigance/Granite-4.1-8b-heretic-GGUF | 8,38 B | No disponible | GGUF | Apache 2.0 | Restringido (gated) | Variante abliterated y cuantizada, solo ingles |
| ibm-granite/granite-4.1-8b | 8,38 B | No disponible | Safetensors | Apache 2.0 | Publico (segun modelo base) | Modelo original sin ablacion, referencia de comparacion |
| Otras variantes GGUF de Granite 4.1-8b | 8,38 B | No disponible | GGUF | Apache 2.0 | Variable | Cuantizaciones sin ablacion, comportamiento alineado |

La comparacion con alternativas de otros fabricantes (Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B) no se incluye porque la informacion proporcionada no aporta datos de rendimiento que permitan una comparacion rigurosa. Cualquier tabla de ese tipo requeriria benchmarks que aqui no estan disponibles.

## Limitaciones y advertencias

- La ablacion de direcciones de rechazo elimina salvaguardas de alineacion: el modelo puede generar contenido que el modelo base rechazaria, con implicaciones legales y reputacionales para quien lo despliegue.
- El repositorio esta etiquetado como `not-for-all-audiences` y tiene acceso restringido; su uso esta sujeto a la aceptacion de condiciones en Hugging Face.
- Riesgo de alucinacion inherente a un modelo de 8 B, agravado por la cuantizacion, que degrada la precision en matematicas y razonamiento de multiples pasos.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero la publicacion derivada no ofrece garantias sobre el comportamiento del artefacto ablacionado; conviene revisar los terminos del modelo base y las condiciones de acceso del repositorio antes de cualquier uso en produccion.
- Adopcion practicamente nula (8 descargas, 0 likes): no hay evidencia de comunidad, issues resueltos ni validacion independiente de la calidad de las cuantizaciones.
- No se dispone de informacion sobre el metodo exacto de ablacion, la semilla, los datos de calibracion ni las variantes de cuantizacion incluidas, lo que impide reproducir el proceso.
- La fecha de creacion del repositorio (2026-08-07) y la de actualizacion (2026-11-26) deben cotejarse con el estado real del proyecto antes de depender de el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cbrigance/Granite-4.1-8b-heretic-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Referencia bibliografica declarada en los tags: https://arxiv.org/abs/2406.11717
