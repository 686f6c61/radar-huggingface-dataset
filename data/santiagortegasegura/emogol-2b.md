# santiagortegasegura/emogol-2b

## Resumen

EmoGol-2B es un adaptador LoRA para clasificación de emociones en comentarios de fútbol en español, construido sobre el modelo base google/gemma-2-2b-it. Lo desarrolla el usuario santiagortegasegura y se distribuye como un archivo joblib (`emogol.joblib`, 112 MiB) que empaqueta la configuración, las reglas de postprocesado y el adaptador LoRA entrenado con QLoRA. El modelo clasifica cada comentario en una de siete emociones: alegría, tristeza, enojo, miedo, sorpresa, desprecio (etiquetada internamente como `burla`) y neutral.

El problema que resuelve es concreto: el análisis de sentimiento genérico no captura bien el registro emocional del discurso futbolístico en redes (sarcasmo, burla, indignación arbitral, celebración). EmoGol-2B se ajusta sobre 100.000 comentarios de YouTube en español, lo que lo hace adecuado para monitorización de comunidades de aficionados, moderación y análisis de audiencia en medios deportivos.

Es relevante por su enfoque de empaquetado: en lugar de publicar pesos safetensors convencionales, entrega un artefacto joblib cargable con una sola línea de Python que resuelve la descarga del modelo base, la aplicación del adaptador y la predicción con nombres de etiqueta legibles. El repositorio no incluye los pesos del modelo base, que se descargan desde `google/gemma-2-2b-it` al cargar y requieren aceptar la licencia Gemma y disponer de token de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2 2B) con adaptador LoRA (PEFT) |
| Parametros totales | 2B en el modelo base; adaptador LoRA de 112 MiB (recuento exacto de parametros no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma-2 2B-it) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; cuantizacion de inferencia no disponible |
| Idiomas soportados | es (espanol) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | joblib (`emogol.joblib`), que contiene configuracion, reglas y adaptador LoRA; el base se descarga aparte |

## Arquitectura y entrenamiento

El modelo es un ajuste por adaptadores LoRA sobre google/gemma-2-2b-it, un transformer decoder-only de 2.000 millones de parametros. El entrenamiento emplea QLoRA (cuantizacion del base durante el fine-tuning), segun indican las etiquetas del repositorio y la model card. El corpus de ajuste son 100.000 comentarios de YouTube en espanol sobre futbol, anotados en siete clases emocionales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha del adaptador, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado: el artefacto joblib encapsula configuracion, reglas de postprocesado y adaptador, y expone un metodo `predecir_nombres` que devuelve etiquetas legibles. La model card advierte de una particularidad de etiquetado: en los datos y en el prompt, la clase de desprecio conserva la etiqueta `burla`.

## Capacidades

- Clasificacion de emociones en texto en espanol en siete clases: alegria, tristeza, enojo, miedo, sorpresa, desprecio (`burla`) y neutral.
- Especializacion en dominio: comentarios de futbol en YouTube, con vocabulario, ironia y registro propios de comunidades de aficionados.
- Prediccion con etiquetas legibles mediante `predecir_nombres(lista_de_textos)`.
- Procesamiento por lotes: la API acepta listas de cadenas.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision, audio ni modo thinking en la informacion disponible; el uso previsto es exclusivamente clasificatorio.

## Casos de uso

- Monitorizacion de comunidades de aficionados: procesar en lote los comentarios de un canal o directo de YouTube y agregar la distribucion emocional por minuto para detectar picos de indignacion (arbitrajes) o celebracion (goles).
- Moderacion asistida: priorizar la revision humana de comentarios clasificados como enojo o desprecio, reduciendo el volumen de cola que llega a los moderadores.
- Analisis de audiencia para medios deportivos: cuantificar la reaccion emocional a una retransmision y comparar programas o cadenas con la misma taxonomia de siete clases.
- Investigacion en NLP social: disponer de un clasificador de dominio especifico para estudios sobre discurso futbolistico y toxicidad encubierta (burla, sarcasmo).
- Cuadros de mando editoriales: alimentar dashboards con la serie temporal de emociones de un partido para ajustar la linea editorial o el tono de la narracion.
- Filtrado previo en pipelines de datos: etiquetar grandes volumenes de comentarios antes de un analisis manual o de un modelo mayor, usando la salida de EmoGol-2B como capa de triaje.
- Prototipado rapido: al cargarse con una sola llamada a joblib y exponer `predecir_nombres`, permite integrar la clasificacion en un notebook o script en minutos, siempre con GPU NVIDIA disponible.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 0,825 | 10.000 comentarios, frente a etiquetas de referencia |
| F1 macro | 0,776 | 10.000 comentarios, frente a etiquetas de referencia |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni desglose por clase.

## Requisitos de hardware

- GPU NVIDIA obligatoria: la model card indica que requiere una GPU NVIDIA y que se probo en una Tesla T4.
- VRAM estimada: no disponible de forma explicita; el base es un modelo de 2B parametros y el adaptador ocupa 112 MiB, por lo que el consumo dependera de la precision de carga del base (no documentada).
- GPU recomendadas: Tesla T4 (validada por el autor); cualquier GPU NVIDIA consumer con VRAM suficiente para un modelo de 2B deberia poder ejecutarlo, aunque no se confirma en la informacion disponible.
- Despliegue: la via documentada es `joblib.load` sobre el artefacto descargado con `huggingface_hub`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros clasificadores de emociones en espanol ni con adaptadores equivalentes sobre Gemma-2 2B.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre comentarios de futbol en YouTube; el rendimiento fuera de ese registro (prensa, foros tecnicos, otros deportes) no esta validado.
- Etiquetado particular: la clase de desprecio se denomina `burla` en los datos y en el prompt, lo que puede generar confusion si se integra con taxonomias externas.
- Requiere aceptar la licencia Gemma y un token de Hugging Face para descargar el modelo base; el repositorio no incluye los pesos del base.
- Dependencia de GPU NVIDIA: no se documenta soporte CPU.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser un clasificador supervisado sobre comentarios de YouTube, puede heredar sesgos de anotacion y de la comunidad de origen.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de produccion.
- Sin datos publicados de latencia, throughput ni consumo de VRAM, lo que dificulta el dimensionamiento de infraestructura.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/santiagortegasegura/emogol-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Codigo: https://github.com/santiagortegasegura/emotion_futbol (DOI 10.5281/zenodo.23547984)
- Dataset: https://huggingface.co/datasets/santiagortegasegura/emotion-futbol-data (DOI 10.57967/hf/11269)
