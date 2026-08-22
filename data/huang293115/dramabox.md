# huang293115/Dramabox

## Resumen

Dramabox es un modelo de texto a voz (TTS) expresivo desarrollado por Resemble AI, entrenado como un ajuste fino del modelo LTX-2.3 de Lightricks mediante la técnica IC-LoRA. Su principal innovación es que el prompt de texto controla por completo la interpretación vocal: identidad del hablante, emoción, risas, suspiros, respiraciones, pausas y transiciones. Además, admite clonación de voz opcional mediante una muestra de referencia de diez segundos. El modelo se basa en un transformer de difusión con flow matching, con 3.300 millones de parámetros, y está condicionado por los embeddings de texto de Gemma 3 12B. Está pensado para generar actuaciones vocales completas a partir de una sola descripción, lo que lo diferencia de los TTS convencionales que solo convierten texto en habla neutra.

La licencia es LTX-2 Community License, que permite uso comercial con ciertas restricciones, y el idioma soportado es únicamente inglés. El repositorio en HuggingFace tiene un tamaño de 29,7 GB, aunque no se especifican los formatos de pesos ni las cuantizaciones disponibles. El modelo se distribuye como un ajuste fino del modelo base Lightricks/LTX-2.3, con una arquitectura de transformer de difusión y flow matching. Está diseñado para generar audio de alta fidelidad con control fino sobre la interpretación, lo que lo hace relevante para aplicaciones de narración, doblaje, asistentes de voz y contenido multimedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer + flow matching, condicionado con embeddings de texto de Gemma 3 12B. Ajuste fino con IC-LoRA sobre LTX-2.3 (audio-only) |
| Parametros totales | 3.3B (modelo base LTX-2.3; el ajuste fino con LoRA anade pesos adaptadores, no cuantificados en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa audio y texto; no se indica una ventana de contexto en tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | LTX-2 Community License (ver enlace en la model card) |
| Formato de pesos | No disponible (no se especifica; probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

Dramabox es un ajuste fino del modelo LTX-2.3 de Lightricks, concretamente de su rama de audio. El modelo base es un Diffusion Transformer (DiT) con flow matching, que genera audio condicionado a embeddings de texto de Gemma 3 12B. El ajuste fino se realiza mediante IC-LoRA (In-Context Low-Rank Adaptation), una técnica que permite adaptar el modelo a nuevas tareas sin modificar los pesos originales, añadiendo adaptadores de bajo rango. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas de RLHF o DPO. La innovación principal del modelo reside en su capacidad de interpretar indicaciones escénicas (direcciones de actuación) fuera de las comillas del diálogo, lo que permite controlar la actuación vocal de forma natural. El modelo también incorpora un watermark neural imperceptible (Resemble Perth) para proteger la autoría de los audios generados.

## Capacidades

- Generacion de habla expresiva: control de emociones (furia, calma, ironia, susurro, etc.) mediante descripciones en el prompt.
- Clonacion de voz: a partir de un clip de referencia de 10 segundos o mas, el modelo reproduce el timbre del hablante. Sin referencia, elige una voz acorde con la descripcion.
- Efectos vocales: risas, suspiros, respiraciones, pausas, carraspeos, entre otros, indicados mediante direcciones de escena fuera de comillas.
- Control fino de la interpretacion: permite ajustar la duracion, la escala de guidance (cfg) y la escala de skip-token guidance (stg) para modificar la fidelidad al prompt y la dramaticidad.
- Generacion de audio de larga duracion: soporta la generacion de escenas de 20-60 segundos (con el parametro `gen_duration`), incluyendo musica o escenas largas.
- Integracion con watermark: aplica automaticamente una marca de agua neural imperceptible que sobrevive a compresion MP3/AAC y ediciones comunes.

## Casos de uso

- **Narracion de audiolibros y podcasts**: el modelo permite generar actuaciones vocales completas a partir de guiones, con control de la emocion y el ritmo. Se puede usar para crear audiolibros con voces expresivas y variadas sin necesidad de actores de voz.
- **Doblaje y localizacion**: para doblar contenidos audiovisuales, Dramabox puede generar voces que se ajusten a las actuaciones originales, incluyendo suspiros, risas y pausas, a partir de la descripcion de la escena. El prompt permite especificar el tono y la emocion de cada linea.
- **Asistentes de voz con personalidad**: se puede integrar en sistemas de conversacion para generar respuestas habladas con una personalidad definida (por ejemplo, una asistente que habla con ironia o de forma calida). La clonacion de voz permite mantener una identidad vocal consistente.
- **Creacion de contenido para redes sociales**: generacion de voces para videos, animaciones o personajes de videojuegos, con control sobre la interpretacion. El prompt puede describir la actitud y el estado de animo del personaje.
- **Accesibilidad**: conversion de texto a habla natural y expresiva para lectores de pantalla, permitiendo que personas con discapacidad visual reciban la informacion con matices emocionales que mejoran la comprension.
- **Produccion musical**: el modelo puede generar voces para canciones o fragmentos cantados (si se le indica), aunque su principal enfoque es la actuacion hablada. Se puede usar para crear demos vocales en produccion musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos TTS. El rendimiento se describe cualitativamente, destacando la velocidad de generacion: aproximadamente 2,5 segundos por generacion en un servidor caliente (probablemente con una GPU de alta gama, pero sin especificar).

## Requisitos de hardware

- No se especifican requisitos minimos de hardware en la informacion oficial.
- El modelo tiene 3.3B parametros en el modelo base, y el ajuste fino con IC-LoRA anexa pesos adicionales. En FP16, el modelo base ocupa aproximadamente 6,6 GB de VRAM, pero la inferencia completa incluye el codificador de texto (Gemma 3 12B) y el pipeline de audio, lo que puede requerir mas memoria.
- Para la generacion de audio de larga duracion (20-60 segundos) se necesitara una GPU con suficiente VRAM para el modelo completo.
- Se recomienda una GPU con al menos 16 GB de VRAM para una ejecucion comoda en FP16 (no confirmado por el autor). GPUs como NVIDIA RTX 3090, RTX 4090 o A100 podrian ser adecuadas.
- El codigo se distribuye en el repositorio GitHub, que incluye un servidor de inferencia (TTSServer) y un script CLI. No se mencionan herramientas de despliegue como vLLM o llama.cpp, pero al ser un modelo de audio, no es compatible con esas herramientas (disenadas para LLM de texto).
- La latencia se estima en ~2,5 segundos por generacion en un servidor con GPU, segun el ejemplo de la model card.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos TTS expresivos en la informacion proporcionada. Se pueden mencionar alternativas como XTTS (Coqui) o Tortoise TTS, pero no se tienen datos de rendimiento ni especificaciones de estos modelos en el contexto actual. Por tanto, no se puede realizar una comparacion objetiva.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles. No se ha entrenado para otros idiomas.
- **Sesgos**: no se han publicado analisis de sesgos. Al estar entrenado en datos de voz en ingles, puede presentar sesgos de acento, genero o clase social.
- **Alucinacion de audio**: como todo modelo generativo, puede producir artefactos o interpretaciones no deseadas si el prompt es ambiguo o demasiado complejo. El control de la actuacion depende de la claridad de las direcciones de escena.
- **Licencia**: la licencia LTX-2 Community License permite uso comercial, pero debe revisarse el texto completo (enlace en la model card) para conocer las restricciones exactas, especialmente en cuanto a la redistribucion y el uso en productos comerciales.
- **Watermark**: el modelo aplica un watermark neural por defecto, que puede ser desactivado con el parametro `--no-watermark`. La marca de agua puede interferir con algunos flujos de trabajo que requieren audio sin marcas.
- **Dependencia de Gemma 3**: el modelo depende de los embeddings de Gemma 3 12B, que es un modelo de texto separado. Esto implica que la inferencia requiere cargar ambos modelos, lo que aumenta los requisitos de VRAM.
- **Tamaño del repositorio**: 29,7 GB, lo que implica una descarga grande para su uso local.

## Enlaces

- Modelo en HuggingFace: [ResembleAI/Dramabox](https://huggingface.co/ResembleAI/Dramabox)
- Repositorio de código: [resemble-ai/DramaBox](https://github.com/resemble-ai/DramaBox)
- Demo Space en HuggingFace: [ResembleAI/Dramabox](https://huggingface.co/spaces/ResembleAI/Dramabox) (ZeroGPU)
- Modelo base: [Lightricks/LTX-2.3](https://huggingface.co/Lightricks/LTX-2.3)
- Pagina del modelo en Resemble AI: [https://www.resemble.ai/learn/models/dramabox](https://www.resemble.ai/learn/models/dramabox)
- Licencia: [LICENSE](https://huggingface.co/ResembleAI/Dramabox/blob/main/LICENSE)
