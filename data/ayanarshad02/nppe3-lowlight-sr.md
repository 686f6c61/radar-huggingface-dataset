# AyanArshad02/nppe3-lowlight-sr

## Resumen

NPPE-3 es un modelo de superresolución y reducción de ruido para imágenes en condiciones de poca luz, desarrollado por AyanArshad02. Se trata de una red neuronal convolucional residual de estilo EDSR, con 16 bloques residuales y 128 canales, que contabiliza aproximadamente 6,0 millones de parámetros. El modelo está diseñado para recibir una imagen RGB de baja resolución, ruidosa y con poca iluminación (160x256) y producir una versión 4x mejorada, denoised y con exposición corregida (640x1024). Según la model card, el modelo fue entrenado durante 125 épocas con pérdida de Charbonnier sobre 1105 pares de imágenes, logrando un PSNR de validación de 38,97 dB (escala de grises, submuestreo 1-in-8, siguiendo la métrica de la competición) y 39,508 dB en el leaderboard público de Kaggle. Es un modelo de visión por computador, sin capacidades de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual tipo EDSR (16 bloques residuales, 128 canales) |
| Parametros totales | ~6,0 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (best_model.pth) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema EDSR con una estructura head-body-tail. La parte inicial (`head`) contiene una capa convolucional de 3x3 que proyecta la imagen de 3 canales a 128. El cuerpo se compone de 16 bloques residuales, cada uno con dos capas convolucionales y activación ReLU, sin BatchNorm, con un factor de escala residual de 0,1 y una conexión skip larga que añade la salida del cuerpo a la entrada. La cola (`tail`) utiliza dos etapas de convolución más PixelShuffle(2) para lograr el factor de 4x, y una última convolución 3x3 que devuelve la imagen a los 3 canales RGB. Además, se añade una copia de la entrada interpolada bilinealmente a la salida, de modo que la red aprende el residuo.

El entrenamiento se realizó con Adam (tasa de aprendizaje inicial 2e-4, con cosine annealing hasta 1e-6), precisión mixta y 125 épocas sobre 1105 pares de imágenes. Se aplicaron recortes aleatorios de 48x48 con aumentación mediante flip horizontal/vertical y rotaciones de 90 grados. La función de pérdida utilizada fue Charbonnier. Durante la inferencia se emplea un ensemble de 8x mediante self-ensemble con flips y rotaciones (TTA).

## Capacidades

- Generacion de imagen: superresolucion 4x de imagenes RGB en condiciones de poca luz.
- Reduccion de ruido en imagenes de baja iluminacion.
- Correccion de exposicion y mejora de luminosidad en imagenes nocturnas.
- Entrada de 160x256 y salida de 640x1024.
- Soporte de self-ensemble con 8x TTA para mejorar la calidad de salida.
- No soporta tool calling, agentes, razonamiento textual ni procesamiento de lenguaje.

## Casos de uso

- Mejora de camaras de vigilancia nocturna: el modelo puede procesar fotogramas de camaras de seguridad con poca luz, reduciendo ruido y aumentando la resolucion para facilitar la identificacion de rostros o matrículas.
- Restauracion de fotografias antiguas: puede aplicarse a fotografias digitalizadas con grano y baja iluminacion, obteniendo una version 4x con mayor detalle y exposicion corregida.
- Preprocesamiento para vision por computador: antes de ejecutar detectores de objetos o segmentadores en escenas nocturnas, se puede usar el modelo para mejorar la calidad de la imagen de entrada, lo que potencialmente aumenta el rendimiento de los algoritmos posteriores.
- Fotografia movil en interiores: en condiciones de poca luz, como interiores oscuros o eventos nocturnos, el modelo puede mejorar las capturas tomadas con dispositivo movil antes de su publicacion o almacenamiento.
- Imagenes aereas o de satelite: para imagenes tomadas por drones o satelites en horario nocturno o con baja exposicion, el modelo puede aumentar la resolucion y claridad.
- Video vigilancia y analisis forense: aplicado a frames de video grabados en entornos oscuros, permite obtener imagenes de mayor resolucion y menos ruido para su uso en investigaciones o auditorias.

## Benchmarks y rendimiento

La informacion disponibles incluye metricas de validacion y de la competicion de Kaggle. No se encontraron comparativas con otros modelos.

| Metrica | Valor |
|---|---|
| PSNR de validacion (grayscale, 1-in-8 subsampled) | 38,97 dB |
| Kaggle public leaderboard | 39,508 dB |

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware por parte del autor.
- Dado el tamaño del modelo (~6,0 M de parametros), la inferencia en FP32 deberia requerir menos de 1 GB de VRAM, por lo que es viable en GPUs de gama media como NVIDIA RTX 3060 o superiores.
- El formato nativo es PyTorch; no se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI.
- La carga se realiza mediante PyTorch, con el checkpoint `best_model.pth`.

## Comparativa con modelos similares

No se han encontrado modelos comparables con especificaciones detalladas en la informacion disponible. Existe un repositorio de HuggingFace similar (`gauravkgehlot/dlp-nppe3-lowlight-sr`) con el mismo proposito, pero no se dispone de datos tecnicos ni de benchmarks para realizar una comparativa fiable.

## Limitaciones y advertencias

- El repositorio de HuggingFace muestra un tamano de 0.0 GB, lo que sugiere que los pesos del modelo no estan subidos en el propio repo. El checkpoint puede requerir obtenerlo desde Kaggle u otro repositorio.
- La metrica de PSNR reportada se calculo en escala de grises con submuestreo 1-in-8, lo que no representa directamente la calidad visual en color ni bajo metricas perceptuales.
- El modelo fue entrenado en un conjunto de datos relativamente pequeno (1105 pares) con recortes de 48x48, por lo que puede generalizar mal a imagenes con distribuciones muy distintas (por ejemplo, radiografias, imagenes medicas o fotografias con iluminacion extremadamente baja).
- Al ser un modelo de vision, no tiene aplicaciones en tareas de lenguaje ni procesamiento de texto.
- La licencia MIT permite el uso comercial, pero si se utilizan datos de la competicion de Kaggle, podrian aplicarse restricciones adicionales del propio Kaggle.
- No se han documentado sesgos conocidos ni riesgos de alucinacion especificos, al tratarse de una tarea de generacion de imagenes.

## Enlaces

- HuggingFace: https://huggingface.co/AyanArshad02/nppe3-lowlight-sr
- Repositorio similar de HuggingFace: https://huggingface.co/gauravkgehlot/dlp-nppe3-lowlight-sr
- Repositorio GitHub con el cuaderno de la competicion: https://github.com/Gitmy3/DLP_NPPE3_Kaggle
