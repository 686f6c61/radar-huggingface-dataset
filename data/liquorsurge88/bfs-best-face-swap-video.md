# liquorsurge88/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA (etiquetado como IC-LoRA, es decir, un LoRA de control por imagen) publicado por el usuario liquorsurge88 en Hugging Face, pensado para realizar sustitucion de cabeza y rostro sobre video con el modelo de generacion de video LTX-2 de Lightricks. El adaptador se monta sobre los pesos base Lightricks/LTX-2.3 y Lightricks/LTX-2.5 y se distribuye en formato diffusers, con un repositorio de 13,1 GB. Segun la model card, el autor del adaptador se identifica como Alissonerdx (Alisson Pereira Anjos), mientras que el repositorio consultado aparece bajo la cuenta liquorsurge88.

El modelo resuelve un problema muy concreto dentro de los flujos de posproduccion audiovisual: transferir la identidad de un rostro de referencia a un video guia manteniendo el movimiento original de la secuencia. Para ello, la model card describe dos tecnicas de trabajo: la anclaje en el fotograma 0 ("Frame 0 Anchoring Technique"), en la que la identidad se fija a partir del primer fotograma, y el flujo de plantilla persistente introducido en la version V3. El pipeline declarado es image-to-video, con soporte adicional de video-to-video, y esta orientado explicitamente a VFX profesional, investigacion sobre identidad digital y prototipado cinematografico.

Es relevante ahora porque se apoya en la familia LTX-2 de Lightricks, un modelo de video de pesos abiertos que ha ido actualizando sus versiones (2.3 y 2.5) en el momento de la publicacion de esta ficha. La licencia del adaptador es la ltx-2-community-license-agreement, una licencia de tipo "other" que impone condiciones adicionales respecto al uso comercial y etico, por lo que debe revisarse antes de cualquier despliegue en produccion. La informacion publica disponible no incluye numero de parametros, longitud de contexto, cuantizaciones ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo base de difusion de video de la familia LTX-2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video; no se especifica el numero de fotogramas ni la duracion soportada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video; no se documentan idiomas) |
| Licencia | ltx-2-community-license-agreement (campo license: other) |
| Formato de pesos | diffusers (library_name: diffusers); el repositorio ocupa 13,1 GB |
| Modelos base | Lightricks/LTX-2.3 y Lightricks/LTX-2.5 |
| Pipeline declarado | image-to-video (con soporte de video-to-video) |
| Tamano del repositorio | 13,1 GB |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion disponible describe BFS-Best-Face-Swap-Video como un adaptador de tipo LoRA y, mas concretamente, como un IC-LoRA (in-context LoRA) que condiciona la generacion a partir de una imagen de identidad. El modelo no es autonomo: requiere cargar los pesos de LTX-2.3 o LTX-2.5 de Lightricks y aplicar el adaptador encima. No se detalla en la model card ni el rango del LoRA, ni el numero de modulos adaptados, ni si se entrena sobre las capas de atencion cruzada, las de atencion temporal o ambas.

Tampoco se publican datos sobre el entrenamiento: numero de tokens o fotogramas utilizados, composicion del dataset, resolucion de entrenamiento, si hubo etapas de refinamiento con preferencia humana (RLHF/DPO) o si se aplicaron tecnicas de regularizacion. Las unicas innovaciones tecnicas mencionadas son de flujo de trabajo, no de arquitectura: el anclaje en el fotograma 0 para fijar la identidad y el flujo de plantilla persistente de la version V3, que segun el autor mejora la consistencia de la identidad a lo largo de la secuencia. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Transferencia de identidad facial y sustitucion de cabeza (head swap) en secuencias de video, partiendo de una imagen de referencia.
- Generacion image-to-video: sintetizar video a partir de un fotograma inicial, con la identidad anclada en ese primer fotograma.
- Transformacion video-to-video: mantener el movimiento de un video guia y sustituir la identidad del sujeto.
- Condicionamiento por identidad mediante IC-LoRA, con un flujo de plantilla persistente documentado en la version V3.
- Compatibilidad declarada con dos versiones del modelo base (LTX-2.3 y LTX-2.5), con ejemplos de salida publicados para ambas.
- Tool calling / function calling: no disponible (no es una capacidad de un modelo de video).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (thinking mode, vision, audio): no se documentan mas alla del procesamiento de imagen y video.

## Casos de uso

- Posproduccion de VFX para cine y series: sustitucion del rostro de un doble de accion o de un actor por el del interprete final en planos concretos, manteniendo el movimiento original del video guia capturado en rodaje.
- Prototipado cinematografico (previz): generar versiones preliminares de una escena con el actor definitivo antes de rodarla, para validar encuadres, iluminacion y continuidad de personaje.
- Investigacion sobre identidad digital: estudios academicos sobre como los modelos de difusion de video preservan o degradan rasgos de identidad a lo largo de una secuencia, usando el anclaje en el fotograma 0 como variable de control.
- Creacion de contenido para doblaje y localizacion visual: adaptar videos ya rodados a una nueva version del personaje sin volver a rodar, siempre que se cuente con consentimiento explicito del titular de la imagen.
- Sustitucion de identidad en material de archivo: rejuvenecer o adaptar personajes en secuencias antiguas, un flujo habitual en documentales y en producciones de epoca.
- Pruebas de vestuario y maquillaje: aplicar la identidad de un actor sobre un video de referencia con otro cuerpo para comparar opciones de caracterizacion antes de la prueba real.
- Demostraciones tecnicas y divulgacion de tecnicas LoRA: el repositorio incluye ejemplos en video y un tutorial en YouTube sobre el flujo completo, lo que lo hace util como material de estudio para quienes investigan adaptadores IC-LoRA sobre modelos de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni de similitud de identidad, ni de fidelidad temporal, ni de calidad perceptual) ni comparaciones numericas con otros adaptadores de sustitucion facial en video. Los unicos elementos de evaluacion que aporta el autor son ejemplos de video generados, que no constituyen una evaluacion reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 13,1 GB, por lo que cargar el adaptador junto con los pesos del modelo base de video LTX-2 requiere un presupuesto de memoria considerable, ademas de la memoria necesaria para el VAE de video y las activaciones temporales. Estas cifras son estimaciones basadas en el tamano del repositorio y no en datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentacion. Para modelos de difusion de video de este orden de tamano, el rango habitual de trabajo es A100 (40/80 GB), H100 o L40S en entornos de servidor, y RTX 3090/4090 (24 GB) en estaciones de trabajo con tecnicas de offloading.
- Viabilidad en GPU de consumo: no confirmada. Con 24 GB de VRAM y uso de offloading secuencial y atencion optimizada podria ser viable en RTX 3090 o RTX 4090, pero el autor no publica requisitos minimos ni configuraciones probadas. En GPUs de 8 o 12 GB no hay evidencia de que sea viable sin cuantizacion agresiva, y no se documentan cuantizaciones soportadas.
- Opciones de despliegue: el repositorio se distribuye para la libreria diffusers, por lo que el despliegue natural es un script de Python con Diffusers sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estas herramientas estan orientadas a modelos de lenguaje y no aplican a este tipo de adaptador de video. Tampoco se mencionan nodos de ComfyUI ni integraciones equivalentes en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion de video | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video (este modelo) | IC-LoRA de sustitucion de cabeza sobre LTX-2 | no disponible | no disponible | ltx-2-community-license-agreement | Hugging Face, 0 descargas |
| Lightricks LTX-2.3 | Modelo base de generacion de video | no disponible en esta busqueda | no disponible en esta busqueda | licencia propia de Lightricks | Pesos publicos en Hugging Face |
| Lightricks LTX-2.5 | Modelo base de generacion de video | no disponible en esta busqueda | no disponible en esta busqueda | licencia propia de Lightricks | Pesos publicos en Hugging Face |
| Adaptadores alternativos de face swap en video | LoRA sobre modelos de difusion de video | no disponible | no disponible | variable | no disponible |

No se dispone de datos tecnicos ni de benchmarks de los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a tipo de modelo, licencia y disponibilidad. La referencia externa aicreators.tools describe este modelo como "Source Available (Dual Licence)" y atribuye su creacion a Alisson Pereira Anjos, lo que coincide parcialmente con lo indicado en la model card, aunque el repositorio consultado figura bajo la cuenta liquorsurge88.

## Limitaciones y advertencias

- Riesgo grave de uso indebido: se trata de una herramienta de sustitucion de identidad facial en video, con el potencial de generar deepfakes. El propio autor exige consentimiento legal explicito y derechos sobre la imagen de cualquier persona procesada, y declina toda responsabilidad por el uso que se haga del modelo.
- Ausencia de datos sobre sesgos: no se documenta ningun analisis de sesgo por tono de piel, genero, edad o etnia, un aspecto critico en modelos de transferencia de identidad, donde historicamente se producen degradaciones desiguales.
- Riesgo de artefactos y alucinacion visual: no hay metricas publicadas de fidelidad temporal ni de consistencia de identidad. Es esperable la aparicion de parpadeos, derivas de identidad entre fotogramas, costuras en el cuello o perdida de detalle en movimientos rapidos, aunque el autor no cuantifica estos fallos.
- Limitaciones de contexto y duracion: no se especifica la longitud maxima de video soportada ni la resolucion de salida, por lo que el comportamiento en secuencias largas es desconocido.
- Idiomas: no aplica ni se documenta; no hay informacion sobre el tratamiento de audio, labios o sincronizacion fonetica.
- Restricciones de licencia: la ltx-2-community-license-agreement y el campo license: other implican condiciones adicionales a las licencias abiertas habituales. Antes de cualquier uso comercial es imprescindible revisar el texto completo de la licencia y la licencia del modelo base LTX-2, que puede imponer limites de facturacion anual, atribucion o restricciones de uso.
- Trazabilidad y procedencia: el adaptador se publica bajo la cuenta liquorsurge88, mientras que la model card y los ejemplos apuntan a la cuenta Alissonerdx. Esta discrepancia debe verificarse antes de integrar el modelo en un pipeline de produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin historial de actualizaciones posterior a la creacion, lo que indica ausencia de validacion por parte de la comunidad.
- Entorno de ejecucion no especificado: no se publican versiones minimas de diffusers, PyTorch o CUDA, ni requisitos de VRAM, lo que complica la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liquorsurge88/BFS-Best-Face-Swap-Video
- Repositorio referenciado en la model card (cuenta del creador): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Tutorial en video de la version V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Ficha en aicreators.tools: https://aicreators.tools/model/video/260
