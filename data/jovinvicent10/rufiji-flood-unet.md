# jovinvicent10/rufiji-flood-unet

## Resumen

Rufiji flood U-Net es un modelo de segmentacion semantica binaria que delimita agua superficial en imagenes de radar de apertura sintetica (SAR) del satelite Sentinel-1. Lo desarrolla el usuario jovinvicent10 y se publica en HuggingFace bajo licencia MIT. Su funcion es convertir imagenes Sentinel-1 IW GRD en mascaras de agua, es decir, resolver un problema de mapeo de inundaciones a partir de observaciones radar, que son las unicas operativas en condiciones de nubosidad y lluvia intensa, justo cuando se producen las crecidas.

El modelo se basa en una arquitectura U-Net con encoder ResNet-34 y se entreno sobre los chips anotados manualmente del conjunto Sen1Floods11 (252 de entrenamiento, 89 de validacion y 90 de prueba). En el conjunto de prueba y con umbral de decision 0.5, el autor reporta un IoU de 0.678, una precision de 0.839 y un recall de 0.780. El modelo se usa en la aplicacion Rufiji flood mapper y su utilidad practica inmediata es la generacion rapida de cartografia de extension de agua en la cuenca del rio Rufiji (Tanzania), donde el autor incluye una demostracion de abril de 2024.

La relevancia actual del modelo es acotada pero clara: es un componente pequeno, ligero y de licencia permisiva que puede integrarse en pipelines de respuesta a emergencias y en flujos de teledeteccion sin depender de infraestructura de GPU de gran escala. No es un modelo de lenguaje ni un modelo fundacional: es una red de segmentacion especializada, con las limitaciones propias de un entrenamiento sobre un unico conjunto de datos y sin validacion con verdad terreno en la region de aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 |
| Parametros totales | no disponible (el autor no publica el recuento; el encoder ResNet-34 aporta aproximadamente 21,8 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes, no de lenguaje; no se documenta el tamano de tesela) |
| Tipos de cuantizacion | float16 (state dict en `model.pt`); no se documentan otros formatos cuantizados |
| Idiomas soportados | no aplica (modelo de vision; sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, state dict, float16) mas `config.json` con normalizacion y umbrales |
| Entrada | Sentinel-1 IW GRD, polarizaciones VV y VH en dB, pixeles de 10 m; el modelo anade VV-VH como tercer canal |
| Salida | Mascara binaria de agua superficial (umbral por defecto 0.5) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion en el repositorio | 2026-09-30 (segun los metadatos de HuggingFace) |
| Fecha de ultima actualizacion | 2026-09-30 (segun los metadatos de HuggingFace) |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clasica, un codificador-decoder con conexiones de salto, en la que el codificador es una ResNet-34 preentrenada y el decodificador reconstruye la resolucion espacial para producir una segmentacion densa pixel a pixel. La eleccion es coherente con el estado del arte en segmentacion de imagenes SAR: la U-Net mantiene informacion de alta frecuencia a traves de las conexiones de salto, algo critico para delimitar bordes de agua en imagenes de radar con ruido speckle. La entrada se compone de dos canales (VV y VH en decibelios) mas un tercer canal derivado, la diferencia VV-VH, que el propio modelo calcula y que actua como un indice de contraste util para separar agua de tierra.

Los datos de entrenamiento proceden de Sen1Floods11, un conjunto de chips anotados manualmente: 252 para entrenamiento, 89 para validacion y 90 para prueba. Esto implica un regimen de aprendizaje supervisado a partir de etiquetas humanas, sin que la model card mencione etapas de RLHF, DPO ni ajuste por preferencias (algo, por otro lado, sin sentido en un modelo de segmentacion). Tampoco se documentan el numero de tokens equivalente, el numero de iteraciones, la funcion de perdida exacta ni las tecnicas de aumento de datos empleadas. Como innovaciones destacables, la model card unicamente resalta la ingenieria de canales de entrada (VV, VH y VV-VH) y la publicacion de parametros de normalizacion y umbrales en `config.json`.

## Capacidades

- Segmentacion semantica binaria de agua superficial sobre imagenes Sentinel-1 IW GRD a 10 m por pixel.
- Procesamiento conjunto de las polarizaciones VV y VH en decibelios, con generacion interna del canal derivado VV-VH.
- Deteccion de cuerpos de agua permanentes y de zonas inundadas con respuesta radiometrica clara (agua libre, superficies lisas).
- Uso directo en produccion a traves de la aplicacion Rufiji flood mapper, para la que fue disenado.
- Ejecucion en formato PyTorch con pesos en float16, lo que permite inferencia en GPU de gama media o incluso en CPU con teselas pequenas.
- Parametrizacion del umbral de decision (0.5 por defecto), ajustable segun el compromiso deseado entre precision y recall (por ejemplo, priorizar recall en alerta temprana).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto: no es un modelo de lenguaje.
- No soporta vision generalista, audio ni multiples idiomas: su dominio de entrada esta restringido a imagenes SAR en banda C de Sentinel-1.

## Casos de uso

- Mapeo operativo de inundaciones en la cuenca del Rufiji: el modelo alimenta la aplicacion Rufiji flood mapper, de modo que un operador puede obtener una mascara de agua a partir de imagenes Sentinel-1 recientes sin entrenar ni ajustar nada, con el `config.json` proporcionado para normalizacion y umbral.
- Respuesta rapida a emergencias por agencias humanitarias: la mascara generada en minutos permite priorizar la verificacion de zonas afectadas en un area de crisis, ya que Sentinel-1 ofrece cobertura con independencia de la nubosidad.
- Seguimiento temporal de la extension de agua: aplicando el modelo a una serie temporal de imagenes Sentinel-1 IW GRD sobre un mismo tile se obtiene una evolucion de la mancha de inundacion que sirve para estimar crecimiento y recesion de la crecida.
- Validacion y calibracion de modelos hidrologicos e hidraulicos: las mascaras binarias pueden usarse como referencia observada para comprobar la extension simulada por modelos de cuenca, siempre teniendo en cuenta las limitaciones descritas por el autor.
- Analisis de afectacion agricola en llanuras de inundacion: en zonas de arrozales y cultivos de ribera, la mascara permite estimar la superficie potencialmente anegada, con la advertencia de que el agua bajo vegetacion se detecta de forma deficiente.
- Caracterizacion de humedales y superficies de agua permanente: el modelo discrimina agua de tierra en periodos secos, lo que permite delinear cuerpos permanentes y separarlos de la inundacion temporal por comparacion entre fechas.
- Punto de partida para ajuste fino regional: al ser un modelo pequeno y con licencia MIT, un equipo puede reentrenarlo o ajustarlo con etiquetas locales para mejorar el rendimiento en su region de interes, algo especialmente relevante dado que no fue validado con verdad terreno en Tanzania.
- Docencia y prototipado en teledeteccion: el repositorio incluye una carpeta `demo/` con un ejemplo real de Rufiji de abril de 2024, lo que facilita reproducir el flujo completo de preprocesado e inferencia en un entorno de aprendizaje.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de prueba de Sen1Floods11 (90 chips), con umbral de decision 0.5:

| Metrica | Valor |
|---|---|
| IoU | 0,678 |
| Precision | 0,839 |
| Recall | 0,780 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto, ni curvas precision-recall para umbrales distintos de 0.5, ni metricas desagregadas por region o tipo de superficie.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que el repositorio completo ocupa 0,1 GB y los pesos se distribuyen en float16, el state dict ocupa menos de 100 MB, por lo que la inferencia por tesela cabe con holgura en GPUs con 2-4 GB de VRAM, con margen para la activacion de la U-Net a resolucion de tesela.
- GPU recomendadas: una unica NVIDIA T4 o L4 es suficiente para procesamiento por lotes de teselas; una RTX 3060, RTX 4060 o superior permite trabajar comodamente en estaciones de trabajo. No se requieren A100 ni H100 para este modelo.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.) puede ejecutar la inferencia, y tambien es viable en CPU con teselas pequenas y paciencia.
- Opciones de despliegue: PyTorch nativo; exportacion a TorchScript; exportacion a ONNX para ONNX Runtime; TensorRT si se busca exprimir latencia; servicio HTTP con FastAPI, Gradio o Streamlit (patron habitual en proyectos equivalentes de segmentacion de inundaciones).
- No aplican vLLM, llama.cpp, Ollama ni TGI: son herramientas orientadas a modelos de lenguaje y este modelo no lo es.
- Latencia y throughput estimados: no disponible. No se publican tiempos de inferencia, tamano de tesela, uso de memoria pico ni rendimiento en teselas por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rufiji-flood-unet (este modelo) | U-Net + ResNet-34 | no disponible | Sentinel-1 IW GRD, VV y VH en dB, 10 m | IoU 0,678; precision 0,839; recall 0,780 en Sen1Floods11 test | MIT | HuggingFace |
| chathumal93/Pytorch-UNet-Flood-Segmentation | U-Net en PyTorch | no disponible | Sentinel-1 | no disponible | no disponible | GitHub |
| anadya-s/Satellite-Flood-Detection-UNet | U-Net propia + interfaz Streamlit | no disponible | Imagenes de satelite | no disponible | no disponible | GitHub |
| FloodUnet (AGU, 2025) | U-Net mejorada con modulo residual ligero y atencion por canal | no disponible | Prediccion espacio-temporal de evolucion de inundacion | no disponible | no disponible | Publicacion cientifica |
| Modelo hibrido UNet + Fourier Neural Operator (arXiv 2606.06524) | UNet + FNO con perdidas fisicamente informadas | no disponible | Tareas de prediccion con simulacion hidrodinamica como referencia | IoU 0,82 y F1 0,90 en extension de inundacion; RMSE 0,21 m en profundidad y 0,15 m/s en velocidad | no disponible | Preprint en arXiv |

Advertencia: los modelos comparados no han sido evaluados sobre el mismo protocolo ni el mismo conjunto de datos que rufiji-flood-unet en la informacion disponible, por lo que las cifras no son directamente comparables. En concreto, el IoU 0,82 del modelo hibrido corresponde a una tarea de prediccion de extension de inundacion con datos de simulacion hidrodinamica como referencia, no a segmentacion de agua sobre Sentinel-1 con etiquetas de Sen1Floods11.

## Limitaciones y advertencias

- Inundaciones urbanas deficientes: el autor advierte que el modelo pierde buena parte de las inundaciones en entorno urbano debido al doble rebote de la senal radar, un fenomeno fisico que confunde la firma radiometrica del agua.
- Agua bajo vegetacion: la inundacion cubierta por dosel vegetal se detecta de forma muy deficiente, lo que subestima la extension real en zonas de bosque, manglar y cultivos densos.
- Falsos positivos por superficies lisas: el modelo puede confundir superficies suaves (por ejemplo, suelos arenosos o pistas) y sombras de radar con agua.
- Ausencia de validacion local: no ha sido validado con verdad terreno en Tanzania, su region de aplicacion objetivo. El rendimiento en el Rufiji puede diferir del reportado en Sen1Floods11.
- Sesgo de dominio del conjunto de entrenamiento: Sen1Floods11 tiene una composicion geografica y de eventos limitada (252 chips de entrenamiento), por lo que la generalizacion a otras cuencas, climas y epocas del ano no esta garantizada.
- Riesgo de error en la delimitacion: con precision 0,839 y recall 0,780 a umbral 0.5, se espera tanto sobredeteccion como infradeteccion; el umbral deberia recalibrarse segun la aplicacion.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con aviso de copyright; es una de las licencias mas permisivas, por lo que no supone un obstaculo para produccion. Conviene verificar, no obstante, las condiciones de uso de los datos Sentinel-1 y de Sen1Floods11.
- Escasez de informacion de reproducibilidad: la model card no documenta hiperparametros, funcion de perdida, epocas, aumentos de datos, version de las bibliotecas ni el proceso exacto de preprocesado mas alla de la normalizacion incluida en `config.json`. Reproducir el entrenamiento tal cual no es posible con la informacion publicada.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni discusion publica, lo que implica ausencia de validacion independiente por parte de terceros.
- Metadatos incompletos: el pipeline de HuggingFace aparece como no disponible y el campo de idiomas esta vacio, por lo que la integracion via `transformers` no esta soportada; hay que cargar el state dict con PyTorch.
- Inconsistencia en las fechas: los metadatos del repositorio indican fechas de creacion y actualizacion de septiembre de 2026, posteriores a la fecha de consulta habitual, lo que debe considerarse al citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jovinvicent10/rufiji-flood-unet
- Repositorio GitHub relacionado (U-Net para deteccion de inundaciones con interfaz Streamlit): https://github.com/anadya-s/Satellite-Flood-Detection-UNet
- Repositorio GitHub relacionado (U-Net en PyTorch para segmentacion de agua en Sentinel-1): https://github.com/chathumal93/Pytorch-UNet-Flood-Segmentation
- FloodUnet: modelo de prediccion espacio-temporal de evolucion de inundacion (AGU, 2025): https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025WR041427
- Modelo hibrido UNet + Fourier Neural Operator con aprendizaje guiado por fisica (arXiv): https://arxiv.org/abs/2606.06524
- Version HTML del mismo preprint: https://arxiv.org/html/2606.06524v1

Nota: los enlaces de busqueda web no estan citados por el autor del modelo ni forman parte de su repositorio; se incluyen como contexto del area de segmentacion de inundaciones. No se han encontrado en la informacion disponible enlaces a papers, blogs o demos especificos de rufiji-flood-unet mas alla de la propia model card y de la carpeta `demo/` que menciona.
