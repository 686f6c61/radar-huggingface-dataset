# jc-builds/LiquidInbetween

## Resumen

LiquidInbetween es un modelo de interpolación de fotogramas orientado a la generación de imágenes intermedias entre dos fotografías, desarrollado por jc-builds (Haplo LLC) y publicado bajo licencia MIT. Su propósito es resolver un problema concreto: dado un par de imágenes separadas por un intervalo temporal relativamente amplio (0,13–0,8 s), producir el fotograma correspondiente a un instante intermedio arbitrario, sin necesidad de recursión. Se distribuye principalmente como paquete Core ML para iOS 17+ y como pesos PyTorch en formato safetensors.

La arquitectura se basa en IFNet, la red de estimación de flujo intermedio de RIFE (Huang et al., ECCV 2022), con una modificación clave: la incorporación del timestep `t` como entrada adicional en cada bloque, de modo que el modelo puede generar cualquier momento entre las dos imágenes en una sola pasada. El modelo es muy compacto, con aproximadamente 2,3 millones de parámetros y un peso de 8,6 MB en FP16, lo que lo hace adecuado para inferencia en dispositivo.

Es relevante ahora porque aborda la interpolación de fotografías (no solo vídeo) con huecos temporales grandes, un escenario donde RIFE clásico requeriría recursión y donde los cross-fades simples producen artefactos de doble exposición. Su tamaño reducido y su formato Core ML lo sitúan en el nicho de aplicaciones móviles de edición fotográfica y vídeo on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RIFE IFNet con entrada de timestep (CNN de estimación de flujo) |
| Parametros totales | ~2,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | FP16 (Core ML); pesos de 8 bits descartados por pérdida de precisión |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML FP16) y `.safetensors` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una adaptación de IFNet, la red de estimación de flujo intermedio de RIFE. Predice flujos desde el instante intermedio hacia cada una de las dos fotografías, junto con una máscara de oclusión que determina en qué imagen confía cada píxel. La innovación principal es que cada bloque recibe también el timestep `t`, y la pasada espejada recibe `1 − t`, lo que permite generar cualquier instante intermedio en una sola pasada sin recursión. El nuevo canal de entrada se inicializa a cero, de modo que el entrenamiento parte exactamente del comportamiento de RIFE.

El ajuste fino está orientado a fotografías, no a vídeo: cada par de entrenamiento son dos fotogramas separados entre 0,13 y 0,8 s, huecos mucho mayores que los de fotogramas consecutivos de vídeo. El objetivo es un fotograma real situado entre ambos, en su propio `t`. Los datos proceden de vídeo de dominio público y CC0 de Wikimedia Commons con personas en movimiento (danza, niños jugando, reels de astronautas de la NASA y entrenamiento militar). La conversión a Core ML se midió con 42,9 dB de PSNR frente al modelo PyTorch.

## Capacidades

- Interpolación de fotogramas entre dos imágenes en un instante arbitrario `t` en una sola pasada.
- Manejo de oclusiones mediante máscara de oclusión, evitando difuminado o doble exposición en partes que aparecen o desaparecen.
- Interpolación de movimiento de personas (poses intermedias) y de objetos en desplazamiento.
- Entrada de imágenes de 512 × 512 (las fotos se estiran para rellenar el cuadrado y se reescalan de vuelta).
- Inferencia on-device en iOS 17+ mediante Core ML.
- Uso en Python mediante PyTorch con `IFNet(timestep=True)` y los pesos safetensors.
- No soporta tool calling, agentes, texto, visión semántica ni audio.

## Casos de uso

- Edición fotográfica móvil: generar fotogramas intermedios entre dos fotos tomadas con décimas de segundo de diferencia para crear secuencias animadas o GIFs en una app iOS, aprovechando el paquete Core ML y su tamaño de 8,6 MB.
- Animación de ráfagas (burst): a partir de una ráfaga de fotos, rellenar los huecos temporales de 0,13–0,8 s para producir una animación fluida sin necesidad de vídeo.
- Creación de contenido para redes sociales: convertir dos imágenes fijas en una transición animada con movimiento coherente, evitando el efecto de disolvencia plana.
- Postproducción de vídeo de bajo coste: interpolar fotogramas intermedios en clips con baja tasa de fotogramas capturados a intervalos amplios, con la advertencia de que está ajustado a fotos y no a vídeo consecutivo.
- Demostraciones y prototipos on-device: integrar el modelo en apps de iOS para experimentar con interpolación sin conexión, sin depender de servicios en la nube.
- Investigación y evaluación de interpolación: usar los scripts de entrenamiento, evaluación y exportación incluidos para reproducir resultados o adaptar el modelo a otros dominios.
- Generación de efectos de "morph" controlado: para pares de imágenes relacionadas, producir transiciones con movimiento real en lugar de mezcla de píxeles.

## Benchmarks y rendimiento

Evaluación sobre vídeo no visto en entrenamiento (danza folclórica de dominio público, huecos de 0,4–0,8 s), PSNR en dB en t = ¼, ½ y ¾:

| Modelo | Fotograma completo | Solo píxeles en movimiento |
|---|---|---|
| Cross-fade simple | 36,97 | 22,74 |
| RIFE (recursivo para ¼ y ¾) | 36,50 | 22,60 |
| LiquidInbetween (una pasada) | 36,77 | 22,92 |

El autor advierte que el PSNR favorece los cross-fades borrosos y subestima los intermedios nítidos; recomienda comparar `review.mp4`. La conversión a Core ML se midió con 42,9 dB de PSNR frente al modelo PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene ~2,3 M de parámetros y pesa 8,6 MB en FP16, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; en iOS se ejecuta vía Core ML (Neural Engine/GPU). En Python, una RTX 4090 o incluso una GPU integrada es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos cientos de MB libres.
- Opciones de despliegue: Core ML en iOS 17+, PyTorch en Python con `liquid_model.py` y safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidInbetween | ~2,3 M | 512 × 512, timestep arbitrario | IFNet con timestep, una pasada | MIT | Hugging Face (Core ML + safetensors) |
| RIFE (IFNet original) | ~2,3 M (similar) | Resolución variable | Solo punto medio exacto, recursión para otros t | MIT | Código y pesos públicos (hzwer) |
| Cross-fade simple | 0 | Cualquiera | Mezcla lineal de píxeles | no aplica | Implementación trivial |

No se dispone de datos de otros modelos comparables de interpolación de fotos con timestep arbitrario en la información proporcionada.

## Limitaciones y advertencias

- Es un interpolador, no un modelo generativo de vídeo: mueve lo que hay en las dos fotos y no inventa contenido ausente en ambas.
- Dos fotos no relacionadas producen una disolvencia fluida, no un morph semántico.
- El ajuste está orientado a fotografías con huecos de 0,13–0,8 s; su comportamiento en vídeo consecutivo o en huecos muy distintos no está garantizado.
- Las imágenes se estiran a un cuadrado de 512 × 512 y deben reescalarse de vuelta, lo que puede introducir distorsión geométrica.
- Los pesos de 8 bits se descartaron por pérdida de precisión; solo se ofrece FP16.
- Riesgo de artefactos en oclusiones complejas o movimientos muy grandes no representados en el conjunto de entrenamiento (danza, niños, astronautas, entrenamiento militar).
- No hay datos publicados sobre sesgos demográficos; el conjunto de entrenamiento está sesgado hacia personas en movimiento en vídeo de dominio público.
- Licencia MIT permite uso comercial, pero se recomienda revisar las licencias del vídeo fuente (`training/SOURCES.tsv`) y de RIFE original (MIT, © 2021 hzwer).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jc-builds/LiquidInbetween
- Sitio del autor: https://haploapp.com
- Paper de RIFE (Huang et al., ECCV 2022): no disponible en la información proporcionada
- Repositorio de código de RIFE: no disponible en la información proporcionada
