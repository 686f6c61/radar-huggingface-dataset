# Msduck/whisper-small-lora-hi-mr-en-v1

## Resumen

Msduck/whisper-small-lora-hi-mr-en-v1 es un ajuste fino mediante LoRA sobre el modelo de reconocimiento automatico del habla (ASR) Whisper small de OpenAI, publicado en HuggingFace por el usuario Msduck bajo la libreria transformers y con pesos en formato safetensors. El sufijo del identificador (hi-mr-en) apunta a que el adaptador seha entrenado para hindi, marati e ingles, probablemente incluyendo situaciones de code-switching entre esos idiomas, aunque la model card no lo confirma en ningun momento.

La model card publicada es la plantilla autogenerada por HuggingFace: todos los apartados relevantes (descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia, infraestructura de computo y cita) aparecen con el texto "[More Information Needed]". En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y su tamano declarado es de 0.0 GB, lo que impide verificar que los pesos del adaptador esten realmente subidos.

La relevancia de este tipo de artefactos es alta: los adaptadores LoRA sobre Whisper permiten adaptar ASR a idiomas con pocos recursos como el hindi y el marati con un coste de computo minimo. Sin embargo, la ausencia total de evaluacion publicada, de licencia declarada y de documentacion de entrenamiento lo convierten en un modelo no apto para produccion sin una validacion previa por parte del usuario. Esta ficha debe leerse como provisional y sujeta a revision si el autor completa la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (inferido del identificador del modelo; no declarado en la model card) |
| Parametros totales | Aproximadamente 244 M para el modelo base Whisper small (inferido; no confirmado en la model card). El repositorio contiene un adaptador LoRA, cuyos parametros entrenables son un subconjunto reducido de ese total |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | Whisper opera sobre ventanas de audio de 30 segundos (1500 posiciones en el decodificador). No confirmado en la model card |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi, marati e ingles segun el identificador (hi-mr-en); no declarados en la model card |
| Licencia | No disponible. La model card no declara licencia alguna |
| Formato de pesos | safetensors (etiqueta de HuggingFace) |
| Libreria | transformers |
| Tamano del repositorio | 0.0 GB en el momento de la consulta |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

El modelo base Whisper small es un transformer encoder-decoder de tipo secuencia a secuencia que consume espectrogramas mel de 80 canales calculados sobre ventanas de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea (transcripcion o traduccion) y marcas de tiempo. Sobre esa base, el autor ha aplicado un ajuste fino con LoRA (Low-Rank Adaptation), una tecnica de adaptacion parametro-eficiente que congela los pesos originales e inserta matrices de bajo rango en determinadas capas, reduciendo drasticamente el numero de parametros entrenables y el coste de entrenamiento.

No hay informacion disponible sobre el numero de tokens o de horas de audio utilizados, la composicion del dataset, el rango y las capas objetivo del adaptador LoRA, la tasa de aprendizaje, la precision de entrenamiento (fp16, bf16, fp32) ni si se aplicaron tecnicas de alineacion como RLHF o DPO (en ASR estos esquemas son poco habituales frente al entrenamiento supervisado con CTC o cross-entropy). La etiqueta arxiv:1910.09700 que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre el calculo del impacto ambiental del aprendizaje automatico, citado en la plantilla por defecto de HuggingFace, y no a un articulo sobre este modelo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre el modelo base Whisper small, presumiblemente especializado en hindi, marati e ingles.
- Posible gestion de code-switching hindi-ingles y marati-ingles, habitual en habla coloquial de la India, aunque no hay evidencia publicada que lo confirme.
- Transcripcion con marcas de tiempo: Whisper small soporta decodificacion con timestamps a nivel de segmento; se desconoce si el ajuste LoRA conserva esta capacidad.
- Traduccion de voz a texto en ingles: el modelo base soporta la tarea de translation, pero no hay confirmacion de que el adaptador la mantenga ni de su calidad.
- Procesamiento de audio de hasta 30 segundos por ventana, con encadenamiento de ventanas para audios mas largos.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generation ni modo de razonamiento explicito. Whisper es un modelo exclusivamente de audio a texto.

## Casos de uso

- Transcripcion de centros de contacto en hindi y marati: el modelo puede convertir grabaciones de llamadas en texto para analitica posterior, con la ventaja de que un adaptador LoRA sobre Whisper small se ejecuta en hardware modesto, lo que abarata el procesamiento por lotes de grandes volumenes de audio.
- Subtitulado automatico de contenido audiovisual en hindi e ingles: generacion de subtitulos con marcas de tiempo para plataformas de video, siempre que se valide previamente la calidad del adaptador y la preservacion de los timestamps.
- Dictado y notas de voz en aplicaciones moviles: transcripcion en el dispositivo o en servidor ligero gracias al reducido tamano del modelo base (aproximadamente 244 M de parametros), adecuado para escenarios con latencia baja y sin GPU dedicada.
- Transcripcion de reuniones con habla mezclada hindi-ingles: util en equipos tecnicos de la India donde el code-switching es la norma, aunque la calidad en este escenario debe medirse con un conjunto de evaluacion propio.
- Anotacion y preetiquetado de corpus de voz: uso del modelo para generar transcripciones iniciales que despues se corrigen manualmente, acelerando la creacion de datasets de ASR en idiomas con pocos recursos.
- Accesibilidad para personas con discapacidad auditiva: conversion de audio a texto en tiempo casi real en aplicaciones de subtitulado en directo, condicionado a que la latencia y la tasa de error resulten aceptables.
- Investigacion en adaptacion parametro-eficiente: servir de punto de partida o de referencia para experimentos con LoRA sobre Whisper en idiomas indoarios, dado que el coste de reproducir el ajuste es bajo.

En todos los casos es imprescindible una evaluacion previa del adaptador, ya que no se ha publicado ninguna metrica de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp16, el modelo base Whisper small ocupa aproximadamente 0,5 GB de pesos, mas el coste del adaptador LoRA y las activaciones; en la practica cabria en 2-4 GB de VRAM con lotes pequenos. En cuantizacion de 8 bits el uso de memoria se reduce aproximadamente a la mitad. Estas cifras son estimaciones basadas en el tamano del modelo base y no han sido verificadas para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en tiempo casi real; GPU como RTX 3090, RTX 4090, A100 o H100 permiten procesamiento por lotes de alto rendimiento y no son necesarias para un solo flujo.
- Inferencia en CPU: viable gracias al tamano reducido del modelo, aunque con una latencia mayor; puede acelerarse con cuantizacion a int8.
- Despliegue: transformers (referencia directa, ya que el repositorio usa esa libreria), faster-whisper o CTranslate2 para inferencia optimizada, whisper.cpp si se fusiona el adaptador con el modelo base y se convierte a GGUF, y servidores como vLLM o TGI, que ofrecen soporte de Whisper en algunas versiones. Ollama y llama.cpp requieren conversion previa del modelo a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Msduck/whisper-small-lora-hi-mr-en-v1 | Adaptador LoRA sobre un base de ~244 M (inferido) | 30 s (inferido del base) | Hindi, marati, ingles (inferido) | No disponible | 0 descargas, 0 likes; repositorio de 0.0 GB |
| openai/whisper-small | ~244 M | 30 s | ~99 idiomas | MIT | Ampliamente disponible y validado |
| openai/whisper-medium | ~769 M | 30 s | ~99 idiomas | MIT | Ampliamente disponible y validado |
| Ajustes comunitarios de Whisper para hindi (familia de adaptadores LoRA y fine-tunes completos) | Variable | 30 s | Hindi, hindi-ingles | Variable segun autor | Disponible en el Hub; calidad heterogenea |

No hay datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa con las alternativas. La comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no documenta datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: sin una licencia explicita, el uso comercial es juridicamente arriesgado. La licencia MIT del modelo base Whisper no se hereda automaticamente por el adaptador segun la practica habitual del Hub, y debe confirmarse con el autor.
- Sin benchmarks: no existe ninguna metrica publica de WER, CER ni de rendimiento por idioma, por lo que la calidad real es desconocida.
- Repositorio de 0.0 GB: no se puede confirmar que los pesos del adaptador esten efectivamente disponibles para su descarga.
- Ausencia de traccion: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros.
- Fecha de creacion en el futuro (2026-09-14) respecto de la mayoria de referencias del ecosistema, lo que sugiere metadatos anomalos o una publicacion reciente en un entorno de fechas no estandar.
- Alcance linguistico restringido a los idiomas indicados en el identificador: el rendimiento en otros idiomas sera previsiblemente pobre y no esta documentado.
- Riesgo de alucinacion heredado de Whisper: el modelo base tiende a generar texto plausible en silencios, ruido o musica, y a repetir frases en segmentos largos. Este comportamiento puede agravarse tras un ajuste fino sin datos de regularizacion.
- Deriva en las marcas de tiempo: los ajustes finos de Whisper suelen degradar la capacidad de alineacion temporal si no se entrena explicitamente; conviene verificarlo antes de usarlo para subtitulado.
- Sensibilidad a la calidad del audio: el habla con acento marcado, ruido de fondo, solapamiento de hablantes o audio telefonico de banda estrecha degrada el reconocimiento.
- Riesgo de sesgo: los corpus de habla disponibles para hindi y marati estan desequilibrados por variedad dialectal, genero y registro, lo que puede traducirse en peor rendimiento para determinados acentos y grupos de hablantes.
- Requiere cargar el modelo base Whisper small ademas del adaptador, lo que complica el despliegue en pipelines que esperan un unico artefacto autocontenido.
- No apto para produccion sin una evaluacion previa con datos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Msduck/whisper-small-lora-hi-mr-en-v1
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial del codigo de Whisper: https://github.com/openai/whisper
- Articulo de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Articulo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- Documentacion de transformers para modelos Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- Implementacion optimizada faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Implementacion en C/C++ whisper.cpp: https://github.com/ggerganov/whisper.cpp
