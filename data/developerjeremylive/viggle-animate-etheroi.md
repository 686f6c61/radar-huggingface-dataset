# developerjeremylive/Viggle-Animate-etheroi

## Resumen

Viggle-Animate es un modelo de edición de vídeo (pipeline `video-to-video`) que sustituye al personaje de un vídeo por el que se pinte sobre uno de sus propios fotogramas, manteniendo intactos el movimiento, la cámara y el ritmo temporal del metraje original. Lo desarrolla Viggle y se distribuye bajo la licencia comunitaria `minimax-h3-community-license`. Técnicamente es un ajuste fino completo (*full finetune*) de 33.122.992.896 parámetros del transformer `ref2va` de MiniMaxAI/MiniMax-H3, destilado de forma conjunta con DMD para resolver la generación en tres pasadas hacia delante en lugar de las treinta habituales.

Su propuesta diferencial es la ausencia de representaciones intermedias: no hay estimador de pose, ni segmentador, ni rastreador facial, ni placa de fondo, ni codificador de texto. Las dos únicas entradas son el vídeo conductor y uno de sus fotogramas repintado en un editor de imagen; como la referencia pertenece al propio clip, su pose, cámara, encuadre e iluminación ya concuerdan con el material y no hace falta realinearlos. El autor lo plantea como la segunda mitad de un pipeline cuyo primer tramo resolvería un modelo de imagen (por ejemplo, `gpt-image`) sobre un fotograma.

La relevancia actual del modelo está en el coste de inferencia: al eliminar todo el andamiaje de preprocesado y destilar el muestreador, un clip terminado cuesta tres pasadas de red con un solo modelo y una sola GPU. En una comparación controlada que el autor declara sobre la misma máquina y GPU B200, con los mismos vídeos de origen, resolución y número de fotogramas, renderiza 124 fotogramas en 26 segundos, 6,1 veces más rápido por clip que Wan2.2-Animate-14B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `ref2va` de MiniMax-H3, ajustado fino y destilado con DMD (no se detalla la configuración interna de capas ni el tipo de atención) |
| Parametros totales | 33.122.992.896 (33,1 B) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El autor reporta 124 fotogramas por clip en su comparacion de rendimiento, pero no publica una ventana de contexto en tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en `safetensors` (68,9 GB) |
| Idiomas soportados | No disponibles. El codificador de texto nunca se carga y la condicion es un embedding fijo (`assets/fixed_prompt.txt`), identico en cada render |
| Licencia | `minimax-h3-community-license` (campo `license: other`, con enlace a `LICENSE`) |
| Formato de pesos | `safetensors`, integrado en la libreria `diffusers` |

## Arquitectura y entrenamiento

El modelo parte del transformer `ref2va` de MiniMax-H3 y se entrena como *full finetune* de 33,1 B de parámetros, es decir, se actualizan todos los pesos en lugar de añadir adaptadores. Sobre ese ajuste se aplica una destilación con DMD (*Distribution Matching Distillation*) que reduce el muestreo a tres pasadas hacia delante. La destilación descrita es conjunta y reparte el trabajo entre dos profesores según el nivel de ruido: el propio *finetune* supervisa el extremo de alto ruido del calendario, donde se decide el reemplazo del personaje, y el MiniMax-H3 original supervisa el extremo de bajo ruido, donde se decide el detalle y la textura. El objetivo declarado es conservar en un único estudiante tanto la capacidad de sustitución del *finetune* como la calidad de imagen del modelo base, sin heredar sus regresiones visuales.

El condicionamiento es inusual para un modelo generativo de vídeo: la apariencia entra únicamente a través del fotograma repintado y la geometría únicamente a través del vídeo conductor. No se carga el codificador de texto y el prompt es un embedding congelado que se distribuye junto a los pesos. El autor subraya que no hay clases, ni codificador de identidad, ni prompt aportado por el usuario, y que el sistema no asume que el sujeto sea humano: el bucle no depende de un esqueleto de pose con cuello y dos brazos ni de una máscara de forma humana, y el model card ilustra esa generalización con un ejemplo sobre un corgi. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reemplazo de personaje en vídeo: sustituye al sujeto del clip por el que se pinte en un fotograma del propio clip, propagando esa edición a lo largo del plano.
- Preservación de movimiento, cámara y *timing*: el autor afirma que el resultado mantiene el movimiento y el encuadre originales sin alterarlos.
- Movimiento rápido: el modelo se presenta como especialmente sólido en movimiento veloz (cabezas girando, patadas completas, saltos), con seguimiento fotograma a fotograma en lugar de arrastre o emborronado entre fotogramas.
- Transferencia de pose precisa: al no depender de un esqueleto intermedio, la pose se hereda directamente del fotograma repintado y del vídeo conductor.
- Generalización más allá de personas: el ejemplo del model card incluye la sustitución por un animal (un corgi), porque ninguna etapa del proceso asume anatomía humana.
- Edición guiada por imagen: la identidad, la iluminación y el fondo del nuevo personaje los resuelve el usuario en un editor de imagen antes de entrar al modelo; no hay prompt de texto por usuario.
- Sin *tool calling* ni *function calling*: no disponible; el modelo no es un modelo de lenguaje y no expone esas capacidades.
- Sin modo *thinking*, sin visión como entrada de imagen libre y sin audio: no disponible en la información proporcionada.
- Capacidades multilingües: no aplica; el modelo no procesa texto de usuario.

## Casos de uso

- Postproducción audiovisual y efectos visuales: sustituir a un actor por otro, o por un doble digital, en un plano ya rodado, partiendo de un único fotograma retocado; al no requerir máscaras ni rotoscopia por fotograma, encaja en flujos donde el coste de preparación de *plates* es el cuello de botella.
- Prototipado rápido de *casting*: generar versiones alternativas de una misma escena con distintas apariencias antes de decidir el reparto o el vestuario, usando el mismo vídeo conductor y repintando un solo fotograma por variante.
- Contenido para redes y vídeo viral: el model card documenta un caso comunitario de dos figuras públicas insertadas en una escena de película que alcanzó 1,5 millones de visualizaciones; el modelo sirve para este tipo de ediciones con un solo fotograma de preparación por clip.
- Animación de personajes no humanos en publicidad: sustituir a una persona por una mascota o un personaje animal, aprovechando que el proceso no asume anatomía humana; el propio autor demuestra el caso con un corgi.
- Integración en ComfyUI como nodo de un grafo de generación: existe un repositorio de nodos (`Saganaki22/ComfyUI-Viggle-Animate-H3`) que permite encadenar el modelo con un generador de imagen previo que produzca el fotograma repintado.
- Previsualización de *previz* y animática: obtener un render de movimiento plausible en 26 segundos por clip (124 fotogramas, B200) para validar una secuencia antes de comprometer un render final más costoso.
- Restauración o sustitución en material de archivo: reemplazar a un sujeto en metraje existente cuando no se dispone de la persona original ni de su fotografía aislada, ya que la referencia se toma del propio clip y concuerda en iluminación y encuadre.
- Investigación en destilación de modelos de difusión de vídeo: el esquema de destilación conjunto con dos profesores separados por nivel de ruido es un objeto de estudio reproducible sobre una base MiniMax-H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a este tipo de modelo). El unico dato cuantitativo aportado por el autor es una comparacion de velocidad:

| Metrica | Viggle-Animate | Wan2.2-Animate-14B |
|---|---|---|
| Fotogramas renderizados | 124 | No disponible |
| Tiempo por clip | 26 s | No disponible (el autor indica 6,1x mas lento por clip) |
| Pasadas hacia delante | 3 | No disponible |
| Hardware de la comparacion | GPU B200 | GPU B200 (misma maquina, mismos videos, misma resolucion y numero de fotogramas) |
| Parametros del modelo | 33,1 B | 14 B (segun la denominacion del autor) |

No se publican en la informacion disponible metricas de fidelidad de identidad, consistencia temporal, LPIPS, FVD ni valoraciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia derivada del recuento de parametros, los pesos en bf16/fp16 ocuparian del orden de 66 GB, y en fp8/int8 del orden de 33 GB; a eso hay que sumar activaciones y memoria de atencion, que en difusion de video suelen ser elevadas por el numero de fotogramas. Estas cifras son una estimacion a partir del numero de parametros, no un dato del model card.
- GPU recomendadas: el autor reporta la comparacion sobre una NVIDIA B200. No se documentan otras GPU validas. Para 33,1 B de parametros en bf16 hacen falta aceleradores de 80 GB o superiores en configuracion de una sola tarjeta.
- Cabe en GPU de consumo: no hay confirmacion en la informacion disponible. En discos de consumo (RTX 4090, 24 GB) no cabria en bf16 sin cuantizacion ni reparto entre dispositivos; el autor no publica variantes cuantizadas ni recetas de offload.
- Opciones de despliegue: `diffusers` (formato nativo del repositorio) y nodos de ComfyUI a traves de `Saganaki22/ComfyUI-Viggle-Animate-H3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables o no estan documentados para este modelo.
- Latencia y throughput: 124 fotogramas en 26 segundos por clip sobre una B200, segun el autor. No se publica throughput en fotogramas por segundo ni latencia desglosada por etapa.
- Almacenamiento: el repositorio ocupa 68,9 GB, por lo que el despliegue requiere espacio en disco y ancho de banda de carga en consecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fotogramas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle-Animate (este modelo) | 33,1 B | No disponible; 124 fotogramas por clip en la comparacion del autor | Edicion de video sin pose, mascara, rastreador facial ni codificador de texto; destilado DMD a 3 pasadas | `minimax-h3-community-license` (uso comercial sujeto a los terminos de la licencia) | Pesos en HuggingFace, demo en Spaces, nodos de ComfyUI |
| Wan2.2-Animate-14B | 14 B (segun el autor) | No disponible | Reemplazo de personaje en video con las representaciones intermedias habituales; el autor lo mide 6,1x mas lento por clip | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| MiniMaxAI/MiniMax-H3 | No disponible (es la base del transformer `ref2va` empleado aqui) | No disponible | Modelo base de generacion de video del que se parte | `minimax-h3-community-license` | Pesos publicados en HuggingFace; usado como modelo base de este ajuste |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, enfoque, licencia y velocidad declarada.

## Limitaciones y advertencias

- Dependencia de un modelo de imagen externo: el propio autor enmarca Viggle-Animate como la segunda mitad de un pipeline. La calidad del fotograma repintado (pose, iluminacion, fondo, coherencia con el encuadre) condiciona el resultado final y se resuelve fuera del modelo.
- Sin control por prompt: al no cargarse el codificador de texto, no se puede dirigir el resultado con lenguaje natural ni corregir un render mediante instrucciones textuales.
- Riesgo de alucinacion visual: no se documentan tasas de error, pero cualquier modelo de difusion de video puede introducir artefactos, deformaciones o inconsistencias temporales; no se publican metricas de consistencia que permitan acotar este riesgo.
- Sesgos conocidos: no disponibles. La model card no incluye una seccion de sesgos, y al no haber codificador de texto ni dataset de instrucciones, el vector de sesgo relevante seria el de los datos de video de entrenamiento, que no se detallan.
- Limitaciones de idioma: no aplica en el sentido habitual, pero el sistema no procesa entrada de texto, por lo que no admite usuarios que esperen interaccion conversacional o multilingue.
- Restricciones de licencia: la licencia `minimax-h3-community-license` es una licencia comunitaria, no una licencia de codigo abierto permisiva. Antes de un uso comercial hay que revisar el archivo `LICENSE` del repositorio y los terminos que hereda de MiniMax-H3.
- Procedencia del repositorio: el identificador `developerjeremylive/Viggle-Animate-etheroi` corresponde a una publicacion de un tercero (`developerjeremylive`) con 0 descargas y 0 interacciones, mientras que la model card y las URLs apuntan al modelo original de `Viggle`. Conviene verificar la integridad de los pesos y preferir el repositorio del autor original si existe.
- Estado del repositorio: creado y actualizado el 2026-09-10, sin descargas ni validacion de la comunidad, sin datos de idiomas declarados y sin despliegue documentado fuera de `diffusers` y ComfyUI.
- Coste de hardware: 33,1 B de parametros y 68,9 GB de repositorio implican aceleradores de gama alta; no hay confirmacion de funcionamiento en GPU de consumo.
- Documentacion incompleta: no se publican tokens de entrenamiento, composicion del dataset, resolucion de salida, numero maximo de fotogramas soportados ni limites de duracion de clip.
- Resultados de la busqueda web: las consultas realizadas no devolvieron material relacionado con el modelo; los resultados obtenidos corresponden a videoclips musicales sin vinculacion con este repositorio, por lo que no aportan informacion tecnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/developerjeremylive/Viggle-Animate-etheroi
- Modelo original en HuggingFace (Viggle): https://huggingface.co/Viggle/Viggle-Animate
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Viggle/viggle-animate
- Articulo de investigacion: https://viggle.ai/research/viggle-animate-character-replacement-from-a-repainted-frame
- Nodos de ComfyUI: https://github.com/Saganaki22/ComfyUI-Viggle-Animate-H3
- Pagina del producto H3: https://viggle.ai/h3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Ejemplo comunitario citado en la model card: https://x.com/cocktailpeanut/status/2097332291844399514
