# ml-resources/sam-audio-base-tv

## Resumen

SAM-Audio es un modelo fundacional de segmentación de audio desarrollado por Meta (FAIR) que permite aislar cualquier sonido dentro de una mezcla de audio compleja. A diferencia de los modelos clásicos de separación de fuentes, no se limita a un conjunto cerrado de categorías (voz, música, ruido), sino que acepta indicaciones abiertas en lenguaje natural, indicaciones visuales extraídas de vídeo e indicaciones temporales basadas en intervalos de tiempo. La entrada puede ser audio o vídeo, y la salida son dos pistas: el objetivo aislado (`result.target`) y el residuo (`result.residual`).

El modelo que documenta esta ficha es `ml-resources/sam-audio-base-tv`, un espejo no oficial del checkpoint `facebook/sam-audio-base-tv` publicado por el usuario `ml-resources`. Se trata de la variante `base` de la familia (frente a `facebook/sam-audio-large`), con el sufijo `tv` asociado a las capacidades de indicación por texto y vídeo. El repositorio ocupa 7,7 GB y la licencia se mantiene sin cambios respecto del original (SAM License).

La relevancia actual del modelo radica en que traslada el paradigma de "segment anything" al dominio audio-visual: en lugar de entrenar un separador por clase de sonido, se entrena una única red condicionada por prompts multimodales. Esto lo convierte en una pieza potencial para pipelines de postproducción de audio, doblaje, limpieza de grabaciones y edición asistida por lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de separacion/segmentacion de audio condicionado por prompts (texto, visual, span); se apoya en el codificador Perception-Encoder Audio-Visual (PE-AV). Detalle de capas y bloques no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; opera sobre segmentos de audio y vectores de tiempo (anchors) en segundos |
| Tipos de cuantizacion | no disponible; no se documentan variantes GGUF, AWQ, GPTQ ni int8 en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`); requiere solicitar acceso a los checkpoints en el repositorio oficial |
| Formato de pesos | no disponible explicitamente; se carga con `SAMAudio.from_pretrained(...)` (PyTorch). Tamano del repositorio: 7,7 GB |

## Arquitectura y entrenamiento

SAM-Audio es un modelo fundacional de segmentacion de audio que acepta tres modalidades de prompt. La primera es texto libre: descripciones como "a man speaking", "rain falling heavily" o "a dog barking" condicionan la separacion. La segunda es visual: a partir de fotogramas de video enmascarados (generados, por ejemplo, con SAM3) se aisla el sonido asociado al objeto visual senalado. La tercera es temporal ("span prompting"), mediante anclas del tipo `["+", 6.3, 7.0]` (el sonido esta presente en ese intervalo) o `["-", 0.0, 1.0]` (no lo esta).

Un componente clave de la arquitectura es el codificador Perception-Encoder Audio-Visual (PE-AV), publicado aparte como `facebook/pe-av-large`, del que dependen tanto SAM-Audio como el denominado "Judge model". El modelo genera una representacion conjunta de audio y prompt y produce dos salidas: la pista objetivo aislada y la pista residuo. Opcionalmente admite reordenacion de candidatos (`reranking_candidates=8`), que mejora la calidad a costa de mayor latencia.

No se dispone, en la informacion proporcionada, de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla si el separador es un transformer puro, un modelo de difusion o una arquitectura hibrida, ni se confirman mecanismos de atencion lineal o decodificacion especulativa.

## Capacidades

- Separacion de audio abierta condicionada por texto: aislar cualquier fuente descrita en lenguaje natural, sin catalogo cerrado de clases.
- Prompting visual: aislamiento de sonidos vinculados a objetos concretos de un video mediante mascarillas de fotogramas (integracion con SAM3 para generar las mascarillas).
- Prompting temporal (span): uso de anclas positivas y negativas en segundos para ejemplificar que sonido aislar o excluir.
- Salida doble: pista objetivo (`result.target`) y pista residuo (`result.residual`), lo que permite reconstruir la mezcla.
- Reordenacion de candidatos (`reranking_candidates`) para mejorar la calidad de la separacion, con coste de latencia adicional.
- Prediccion de spans (`predict_spans=True`) como opcion en la llamada de inferencia.
- Entrada multimodal: audio y video (decodificado con `torchcodec.decoders.VideoDecoder`).
- Idiomas: el modelo esta etiquetado unicamente para ingles (`en`); no se documenta soporte multilingue de los prompts de texto.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Postproduccion de cine y video: aislar dialogos, efectos o musica de una mezcla final usando prompts de texto ("a man speaking", "car engine revving") para regenerar o sustituir pistas en la mesa de mezclas.
- Doblaje y localizacion: separar la voz original del fondo para sustituir la locucion por una nueva version sin perder ambiente ni musica.
- Limpieza de grabaciones de campo: eliminar ruidos concretos descritos en lenguaje natural (por ejemplo, "raindrops falling") manteniendo el resto de la captura intacta.
- Edicion asistida por video: usando el modo de prompt visual, aislar el sonido asociado a un objeto concreto de la escena (por ejemplo, "the person on the left") para enfatizarlo o eliminarlo.
- Creacion de datasets de audio: generar pistas aisladas y residuos etiquetados a partir de mezclas, utiles para entrenar otros modelos de reconocimiento o separacion.
- Restauracion de archivos historicos: eliminar zumbidos, golpes o artefactos descritos textualmente conservando el contenido principal de la grabacion.
- Analisis forense de audio: extraer una fuente concreta descrita por texto o acotada temporalmente con anclas para su inspeccion aislada.
- Prototipado de herramientas de audio para desarrolladores: la API `SAMAudio`/`SAMAudioProcessor` facilita integrar la separacion en aplicaciones Python sobre PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (SDR, SI-SNR, mIoU o similares), y los resultados de la busqueda web no aportan datos al respecto. No se deben extrapolar cifras de rendimiento sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano del repositorio (7,7 GB, que puede incluir pesos en fp32 y otros artefactos), la carga en memoria durante la inferencia podria situarse en el rango de 8-16 GB en funcion de la precision efectiva; esta cifra es una estimacion y no un dato confirmado.
- GPU recomendadas: no especificadas por el autor. Por el perfil de memoria descrito, cabria esperar GPUs tipo NVIDIA A100, H100 o RTX 4090/3090 con suficiente VRAM, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada. Si la huella real se mantiene en el rango estimado, seria viable en tarjetas de gama alta con 16 GB o mas de VRAM; no hay datos para GPUs con 8-12 GB.
- Opciones de despliegue: la via documentada es la libreria oficial `sam_audio` sobre PyTorch, con `torch.inference_mode()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y dado que no es un modelo de lenguaje autoregresivo, es probable que estas herramientas no sean aplicables.
- El modo visual requiere ademas SAM3 (`pip install git+https://github.com/facebookresearch/sam3.git`) y `torchcodec` para decodificar video, lo que anade requisitos de entorno.
- Autenticacion: es necesario solicitar acceso a los checkpoints en el repositorio oficial y ejecutar `huggingface-cli login` antes de usarlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia dentro de la propia familia, se conocen los siguientes artefactos relacionados, aunque sin cifras de rendimiento publicadas.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ml-resources/sam-audio-base-tv` | Este modelo (espejo) | no disponible | no disponible | SAM License | Espejo no oficial en HuggingFace |
| `facebook/sam-audio-base-tv` | Original del que procede el espejo | no disponible | no disponible | SAM License | Requiere solicitud de acceso |
| `facebook/sam-audio-large` | Variante grande de la misma familia | no disponible | no disponible | SAM License | Requiere solicitud de acceso |
| `facebook/pe-av-large` | Codificador audio-visual del que dependen SAM-Audio y el Judge model | no disponible | no disponible | no disponible | Disponible en HuggingFace |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento; su tarea es la separacion y segmentacion de audio. Cualquier expectativa de chatbot o asistente es inaplicable.
- Idiomas: solo se declara soporte para ingles en los prompts de texto. El comportamiento con descripciones en castellano u otros idiomas no esta documentado y podria degradarse.
- Sesgos: no se documentan analisis de sesgo. Al depender de descripciones en lenguaje natural, es previsible una menor fiabilidad en sonidos poco representados en los datos de entrenamiento, aunque no hay datos publicos al respecto.
- Alucinacion / artefactos: en tareas de separacion es posible obtener pistas objetivo con contenido espurio o residuos incompletos; el autor ofrece la reordenacion de candidatos precisamente para mitigar la variabilidad, a costa de latencia.
- Licencia: se trata de una licencia propia (SAM License, `license: other`). No es una licencia permisiva estandar; hay que revisar el fichero `LICENSE` antes de cualquier uso comercial. Ademas, el acceso a los checkpoints oficiales requiere solicitud previa.
- Este repositorio es un espejo no oficial (`ml-resources/...`). El propio autor del espejo advierte que no es un lanzamiento oficial de Meta y que todos los creditos corresponden a los autores originales. Para produccion conviene usar los repositorios oficiales.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Requisitos adicionales no triviales: el modo de prompt visual necesita SAM3 y `torchcodec`, ampliando la superficie de dependencias y el riesgo de incompatibilidades.
- Fechas del repositorio: creado y actualizado el 15 de octubre de 2026, sin historial posterior de mantenimiento en la informacion disponible.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sam-audio-base-tv
- Repositorio original: https://huggingface.co/facebook/sam-audio-base-tv
- Variante grande: https://huggingface.co/facebook/sam-audio-large
- Codificador Perception-Encoder Audio-Visual: https://huggingface.co/facebook/pe-av-large
- Blog de Meta AI sobre SAM-Audio: https://ai.meta.com/blog/sam-audio/
- Publicacion cientifica: https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Demo interactiva: https://aidemos.meta.com/segment-anything/editor/segment-audio
- arXiv (referencia del tag): https://arxiv.org/abs/2512.18099
- Repositorio SAM3 (necesario para el prompt visual): https://github.com/facebookresearch/sam3
