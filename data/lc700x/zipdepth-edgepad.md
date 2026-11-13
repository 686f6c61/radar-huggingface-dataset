# lc700x/ZipDepth-EdgePad

## Resumen

ZipDepth-EdgePad es un modelo de estimación de profundidad monocular basado en ZipDepth, una red convolucional de 6,1 millones de parámetros destilada de Depth Anything V2 Large. Lo relevante técnicamente es que no contiene operaciones de atención ni transformer: toda la red es convolucional, lo que permite ejecutarla íntegramente en la GPU de un dispositivo móvil o un visor de realidad virtual. Este repositorio concreto es un espejo de los exports ONNX para PC publicados por el equipo Nightfall, que los usa en su producto Nightfall Meteor.

La arquitectura se distribuye en dos generaciones: Square EdgePad, que es el checkpoint Standard original de ZipDepth sin reentrenar, exportado mediante reescrituras de grafo matemáticamente exactas para que el grafo completo sea compatible con delegados de GPU; y Widescreen EdgePad, un ajuste fino ligero del decodificador (154.005 de 6,1 millones de parámetros) orientado a vídeo 16:9 y a reducir el parpadeo entre fotogramas consecutivos.

El modelo resuelve un problema muy concreto: obtener mapas de profundidad relativa con calidad suficiente para geometría de pantalla completa en tiempo real sobre hardware de consumo, donde un transformer de profundidad no cabría. Su relevancia radica en el compromiso entre tamaño (0,1 GB de repositorio), licencia MIT y viabilidad de despliegue en GPUs móviles, a costa de una precisión inferior a la de los modelos de profundidad de gran escala de los que se destila.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura (ZipDepth), sin atención ni operaciones transformer; cabeza de reconstrucción convexa aprendida con softmax de 5 dimensiones y cola depth-to-space |
| Parametros totales | 6,1 M (aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión por fotograma, sin memoria entre frames) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos ONNX en precisión original; el autor menciona exports TFLite para móvil en el release original, sin detallar cuantización) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (tres ficheros); el release original incluye además TFLite |

Resoluciones de entrada y salida por fichero:

| Fichero | Generacion | Entrada (ancho x alto) | Salida | SHA-256 |
|---|---|---|---|---|
| `zipdepth_edgepad_384.onnx` | Square | 384x384 | 384x384 | `78efcf08caded436c626af0b7b5980db47bc07653ec549a59b7e48e73b3e035f` |
| `zipdepth_wide_512x288.onnx` | Widescreen | 512x288 | 512x288 | `197d598f50ee3270b12831096dbab260c6bd5979bab13b87f01a28fad0268274` |
| `zipdepth_wide_672x384.onnx` | Widescreen | 672x384 | 672x384 | `f812b10b10309c6759266cbe888fa9c0f70668350fdf69e7eda9cc0412ca1a21` |

## Arquitectura y entrenamiento

ZipDepth es una red convolucional de 6,1 M de parámetros destilada de Depth Anything V2 Large. La innovación central es la ausencia total de atención: la información de contexto global y de canal se propaga mediante operaciones de pooling y broadcasting de tensores pequeños, no mediante self-attention. La cabeza de reconstrucción convexa aprendida es clave para la geometría de pantalla completa y se conserva intacta en la variante Square.

La generación Square EdgePad no reentrena pesos: parte del checkpoint Standard (`zipdepth_base.pth`) y aplica únicamente reescrituras de grafo matemáticamente exactas para compatibilidad con delegados de GPU. Entre ellas, la materialización de los broadcasts de atención (strip, channel y global-context) antes de la operación, la división de los grandes average pools espaciales en etapas exactas de 2x y 3x, el desempaquetado de la cabeza de reconstrucción (el softmax de 5 dimensiones y la cola depth-to-space pasan a cuatro ramas softmax ordinarias de 9 canales, la convolución de máscara de 36 canales a cuatro convoluciones de 9 canales y las sumas ponderadas a convoluciones 1x1 fijas) y la reconstrucción del replicate padding de la cabeza a partir de slices de borde y concatenación. Frente al grafo Standard original, Nightfall reporta correlación de 0,9999999999999908 y error absoluto medio normalizado de 3,6e-8.

La generación Widescreen parte de un único checkpoint (SHA-256 `2dc8fddcef9ef22f45b6a1573b9cf66de0f39b1b5172e4284dd693790bd6309e`) y entrena solo el decodificador en dos etapas cortas. La etapa 1 (5.000 pasos) alterna formas de 384x384, 256x256, 224x224 y 512x288 para que un mismo conjunto de pesos sirva a todos los tamaños, con 2.000 fotogramas de 25 vídeos (gameplay y YouTube, cine, acción real y CG, animación). Las etiquetas combinan la salida del Square EdgePad-384 original, Video Depth Anything Small para consistencia entre fotogramas y Marigold V2 para detalle espacial en fotogramas clave seleccionados, con un término de fuga de textura de peso 0,5 que penaliza copiar textura de la imagen al mapa de profundidad. La etapa 2 (1.000 pasos con learning rate 5e-5) entrena solo el decodificador para los tamaños 16:9 exactos. El modelo no tiene memoria y procesa cada fotograma de forma independiente; el comportamiento temporal se aprendió únicamente a través de las funciones de pérdida.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una imagen RGB, con salida de profundidad inversa relativa (valores mayores indican mayor cercanía), sin escala ni offset fijos.
- Inferencia por fotograma sin estado: no hay memoria temporal entre frames, lo que simplifica el despliegue pero exige suavizado externo si se busca estabilidad en vídeo.
- Ejecución completa en GPU sin operaciones de atención, lo que habilita delegados de GPU en móvil y visores (el release original incluye TFLite validado con LiteRT).
- Entrada normalizada internamente: el grafo aplica media y desviación típica de ImageNet, por lo que solo hay que entregar RGB float32 en [0, 1] en formato NCHW `[1, 3, H, W]` con el tensor de nombre `image`.
- Salida a resolución completa ya desempaquetada y recortada (clamp) en el grafo.
- Soporte de varias resoluciones con un mismo checkpoint en la variante Widescreen (384x384, 256x256, 224x224, 512x288 y los tamaños 16:9 exactos).
- No soporta tool calling, agentes, razonamiento multi-step, texto, audio ni visión general: es exclusivamente un estimador de profundidad.

## Casos de uso

- Geometría de pantalla completa en visores de realidad virtual: el modelo Square EdgePad-384 produce mapas de profundidad a 384x384 con la cabeza de reconstrucción convexa intacta, pensada para geometría limpia a pantalla completa en el visor; su coste convolucional permite ejecutarlo en la GPU del dispositivo sin depender de un PC.
- Procesado de vídeo 16:9 en tiempo real en PC: los exports Widescreen de 512x288 y 672x384 están ajustados para fotogramas 16:9 y reducen el parpadeo en escenas estáticas un 8,6 % y el error con flow-warping un 5,8 % frente al export stock al mismo tamaño, lo que los hace adecuados para pipelines de vídeo donde la estabilidad temporal importa.
- Reconstrucción 3D y captura volumétrica en movilidad: al ser un modelo de 6,1 M de parámetros con licencia MIT y export TFLite en el release original, se puede integrar en aplicaciones de escaneo o fotogrametría en teléfono sin infraestructura de servidor.
- Efectos de postprocesado con desenfoque de profundidad: la salida de profundidad inversa relativa, normalizada por percentiles bajo y alto y suavizada en el tiempo, sirve para generar máscaras de desenfoque, bokeh sintético o separación de planos en editores de vídeo.
- Segmentación por planos y compositing: el mapa de profundidad permite separar primer plano y fondo en herramientas de edición o en pipelines de renderizado por capas, con la ventaja de que el modelo cabe en 0,1 GB y se puede versionar junto al código.
- Prototipado e investigación en profundidad monocular de bajo coste: al ser un espejo de un modelo destilado de Depth Anything V2 Large con reescrituras de grafo documentadas y verificadas numéricamente (correlación 0,9999999999999908 frente al grafo original), sirve como referencia reproducible para estudiar optimizaciones de grafo orientadas a delegados de GPU.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin las restricciones de modelos de profundidad con licencias no comerciales, lo que facilita integrarlo en productos cerrados.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son las comparaciones de estabilidad temporal de la variante Widescreen frente al export ZipDepth sin tocar, medidas por Nightfall en vídeo de validación propio:

| Modelo | Comparado con | Parpadeo en escenas estaticas | Error con flow-warping | Cambio fotograma a fotograma |
|---|---|---|---|---|
| 512x288 | stock 512x288 | -8,6 % | -5,8 % | -8,4 % |
| 320x180 | stock 224x224 | -42,4 % | -43,9 % | -39,2 % |

El coste de ese ajuste es un aumento de aproximadamente el 11 % de fuga de textura frente al modelo stock de 224x224 a 320x180, y Nightfall señala que el modelo de 320x180 es visiblemente menos detallado que el de 384x384, como corresponde a su resolución.

Para la variante Square EdgePad, la única métrica publicada es la equivalencia numérica con el grafo Standard original: correlación 0,9999999999999908 y error absoluto medio normalizado de 3,6e-8. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de profundidad como AbsRel, RMSE o delta1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,1 M de parámetros y pesos en precisión original, el modelo ocupa del orden de decenas de MB, y el repositorio completo pesa 0,1 GB.
- GPU recomendadas: no disponible. El diseño está orientado a GPUs móviles y de visor (Nightfall lo ejecuta en Quest) y a PCs con el runtime de Nightfall Meteor; cualquier GPU con soporte de delegado ONNX o LiteRT debería poder ejecutarlo.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se especifican modelos concretos de RTX o similares en la información disponible.
- Opciones de despliegue: ONNX Runtime (los tres ficheros de este espejo son ONNX para PC), LiteRT/TFLite para móvil y visor (exports del release original, validados con correlación 0,99999 frente a los ONNX y sin avisos en la comprobación de compatibilidad GPU de LiteRT). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican cifras de FPS ni de milisegundos por fotograma en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZipDepth-EdgePad (este) | 6,1 M | Imagen o fotograma a 384x384, 512x288 o 672x384 | CNN pura, sin atención, destilada de Depth Anything V2 Large | MIT | ONNX en este espejo; TFLite en el release original |
| ZipDepth (original, Fabio Tosi) | 6,1 M | Checkpoint Standard, resolución variable | CNN pura con cabeza de reconstrucción convexa | MIT | Repositorio GitHub del autor |
| Depth Anything V2 Large | No disponible en la información | No disponible | Modelo de profundidad de gran escala del que se destila ZipDepth | No disponible en la información | No disponible en la información |
| Video Depth Anything Small | No disponible en la información | Vídeo | Modelo de profundidad para vídeo usado como fuente de etiquetas en el ajuste | No disponible en la información | No disponible en la información |
| Marigold V2 | No disponible en la información | Imagen | Modelo de profundidad usado como fuente de detalle espacial en fotogramas clave | No disponible en la información | No disponible en la información |

La comparación relevante es frente a ZipDepth original: este espejo no cambia los pesos de la variante Square (solo el grafo, con equivalencia numérica verificada) y añade una variante Widescreen con el decodificador ajustado para 16:9 y estabilidad temporal. Frente a Depth Anything V2 Large, el compromiso es claro: 6,1 M de parámetros convolucionales en lugar de un modelo de gran escala, a cambio de viabilidad en GPU móvil.

## Limitaciones y advertencias

- Precisión inferior a la de los modelos de profundidad de gran escala de los que se destila; la propia model card indica que la variante de 320x180 es visiblemente menos detallada que la de 384x384.
- Fuga de textura: el ajuste Widescreen incrementa la fuga de textura aproximadamente un 11 % frente al modelo stock de 224x224 a 320x180, pese al término de pérdida de peso 0,5 introducido para mitigarla.
- Sin memoria temporal: el modelo procesa cada fotograma de forma independiente; la estabilidad entre frames depende de las pérdidas de entrenamiento y del suavizado externo que aplique el usuario (Nightfall normaliza por percentiles y suaviza en el tiempo).
- Salida de profundidad relativa inversa sin escala ni offset fijos: hay que normalizar cada fotograma antes de usarlo, lo que impide comparar valores absolutos entre imágenes sin un paso de calibración.
- Dependencia de la resolución de entrada fija por fichero: cada ONNX acepta un tamaño concreto (384x384, 512x288 o 672x384); la variante Widescreen comparte pesos entre tamaños, pero el grafo exportado está fijado a su forma.
- Idiomas: no aplica ni está documentado, al no procesar texto.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con 2.000 fotogramas de 25 vídeos de gameplay, cine, acción real/CG y animación, la distribución de esos datos condiciona el comportamiento en dominios no representados.
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales, pero el espejo no incluye los exports TFLite del release original, solo los tres ONNX.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: no hay evidencia de uso en producción por terceros.
- El modelo es un espejo de un trabajo ajeno (Nightfall y Fabio Tosi); la autoría del research, el ajuste fino y la optimización de grafo corresponde a esos equipos, no al propietario del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lc700x/ZipDepth-EdgePad
- ZipDepth (repositorio original de Fabio Tosi): https://github.com/fabiotosi92/ZipDepth
- No se han encontrado en la información proporcionada enlaces al paper, blog o demo de Nightfall, ni a los repositorios de Depth Anything V2, Video Depth Anything o Marigold.
