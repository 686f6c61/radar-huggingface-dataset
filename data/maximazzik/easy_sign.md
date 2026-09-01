# maximazzik/easy_sign

## Resumen

El modelo `maximazzik/easy_sign` es un conjunto de pesos ONNX del proyecto open source [easy_sign](https://github.com/ai-forever/easy_sign), desarrollado por ai-forever (Sberbank) y publicado en Hugging Face por Maxim Novopoltsev. Su propósito es el reconocimiento de lengua de signos rusa (RSL) mediante clasificación de vídeo, con un diseño orientado a ejecución en CPU y despliegue sencillo a través de Streamlit. El repositorio contiene dos líneas de modelos: una demo con 1598 gestos y una familia de modelos entrenados sobre el dataset Slovo con 1001 clases.

La arquitectura empleada es S3D (Separable 3D CNN), una red convolucional tridimensional con convoluciones separables que procesa clips de vídeo de entrada (RGB) y produce una distribución de probabilidad sobre las clases de gestos. Los modelos aceptan secuencias de 32, 48 o 64 fotogramas a resolución 224×224. El tamaño de los archivos oscila entre 34 y 37 MB, lo que los hace adecuados para entornos con recursos limitados. La licencia es CC BY-SA 4.0, igual que el proyecto original.

La relevancia actual radica en que ofrece una solución práctica y ligera para un problema de accesibilidad: la traducción automática de lengua de signos en tiempo real sobre hardware convencional. Al estar en formato ONNX, puede integrarse con ONNX Runtime u OpenVINO y desplegarse en servidores sin GPU, lo que facilita su adopción en aplicaciones educativas, de atención al cliente o de inclusión social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | S3D (Separable 3D CNN) |
| Parametros totales | no disponible (archivos ONNX de 34-37 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de video: clips de 32, 48 o 64 fotogramas) |
| Tipos de cuantizacion | no disponible (formato ONNX, precision no especificada) |
| Idiomas soportados | Lengua de signos rusa (RSL) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

S3D (Separable 3D CNN) es una arquitectura de clasificacion de video que factoriza las convoluciones 3D en convoluciones espaciales 2D y temporales 1D, reduciendo el coste computacional respecto a las CNN 3D convencionales. En este caso, el modelo procesa clips RGB de dimensiones `1×3×T×224×224` (donde T es el numero de fotogramas) y genera una salida de clasificacion sobre el vocabulario de gestos.

El entrenamiento se realizo sobre dos conjuntos de datos distintos. La demo `S3D.onnx` se entreno con 1598 gestos de RSL, mientras que los modelos de la carpeta `slovo/` se entrenaron sobre el dataset [Slovo](https://github.com/hukenovs/slovo) con 1001 clases. No se proporcionan detalles sobre el numero de muestras, la composicion exacta del dataset ni el proceso de optimizacion (no se menciona RLHF ni DPO, que no son aplicables a este tipo de tarea). Los resultados reportados indican una mean accuracy que mejora al aumentar el numero de fotogramas: 44.22% con 32, 52.28% con 48 y 55.86% con 64.

## Capacidades

- Clasificacion de video para reconocimiento de gestos de lengua de signos rusa (RSL).
- Inferencia en CPU mediante ONNX Runtime u OpenVINO, sin necesidad de GPU.
- Soporte de multiples longitudes de secuencia (32, 48 y 64 fotogramas) para adaptarse a diferentes requisitos de latencia y precision.
- Entrada de video RGB a resolucion 224×224, compatible con pipelines de captura de camara o archivos de video.
- Modelo ligero (menos de 40 MB por archivo) apto para despliegue en entornos con recursos limitados.
- Integracion con Streamlit para prototipado rapido de aplicaciones web de demostracion.

## Casos de uso

- **Aplicaciones de accesibilidad para personas sordas**: el modelo puede integrarse en una aplicacion movil o web que traduzca gestos de RSL a texto o voz en tiempo real, facilitando la comunicacion en entornos publicos o administrativos.
- **Herramientas educativas para aprendizaje de lengua de signos**: un sistema que muestre un gesto y verifique si el alumno lo reproduce correctamente, usando el modelo como evaluador automatico de precision.
- **Atencion al cliente inclusiva**: integracion en kioscos o chatbots con camara para que usuarios con discapacidad auditiva puedan realizar consultas mediante gestos, con el modelo clasificando la intencion y derivando a un agente humano si es necesario.
- **Transcripcion de contenido en video**: procesamiento de grabaciones de clases o conferencias con interpretacion en RSL para generar subtitulos o notas textuales automaticamente.
- **Investigacion en linguistica de lengua de signos**: analisis de corpus de video para estudiar variaciones regionales o frecuencia de uso de gestos, utilizando las probabilidades de salida del modelo como caracteristicas.
- **Sistemas de control por gestos en entornos industriales**: uso de gestos estandarizados de RSL como comandos para maquinaria o interfaces, aprovechando la baja latencia en CPU para aplicaciones de tiempo real.

## Benchmarks y rendimiento

Los unicos datos de rendimiento disponibles son los reportados en la model card para los modelos entrenados sobre Slovo:

| Modelo | Fotogramas (T) | Mean accuracy (%) |
|---|---|---|
| S3Dx32x1x1001.onnx | 32 | 44.22 |
| S3Dx48x1x1001.onnx | 48 | 52.28 |
| S3Dx64x1x1001.onnx | 64 | 55.86 |

No se han publicado resultados comparativos con otros modelos de reconocimiento de lengua de signos en la informacion disponible. La demo de 1598 gestos no incluye metricas de precision.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo esta disenado para ejecucion en CPU.
- **CPU recomendada**: cualquier procesador moderno x86_64 o ARM con soporte para ONNX Runtime u OpenVINO. No se especifican requisitos minimos, pero el tamaño reducido (~35 MB) permite ejecucion en dispositivos de gama baja.
- **GPU**: opcional, pero no necesaria. Si se dispone de GPU, ONNX Runtime puede acelerar la inferencia, aunque el modelo no esta optimizado para ello.
- **Opciones de despliegue**: ONNX Runtime, OpenVINO, Streamlit (para demos web), o cualquier framework que soporte ONNX (por ejemplo, Python con `onnxruntime`).
- **Latencia y throughput**: no disponibles. Al ser un modelo CNN 3D ligero, se espera una latencia de decenas de milisegundos por clip en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de reconocimiento de lengua de signos rusa con los que contrastar este modelo. Existen alternativas como X3D o SlowFast para clasificacion de video, pero no hay datos publicados de rendimiento sobre los mismos datasets (RSL o Slovo) que permitan una comparacion directa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Precision limitada**: la mejor mean accuracy reportada es del 55.86% (con 64 fotogramas), lo que indica que el modelo comete errores frecuentes y no es fiable para aplicaciones criticas sin supervision humana.
- **Gestos aislados**: el modelo clasifica gestos individuales, no frases continuas ni conversaciones fluidas. No soporta segmentacion automatica de secuencias largas.
- **Dependencia de la calidad del video**: la entrada requiere clips de 224×224 con buena iluminacion y encuadre; variaciones en la posicion de las manos o la velocidad del gesto pueden degradar el rendimiento.
- **Alcance linguistico**: solo cubre la lengua de signos rusa (RSL); no es aplicable a otras lenguas de signos sin reentrenamiento.
- **Licencia CC BY-SA 4.0**: permite uso comercial y modificacion, pero las obras derivadas deben distribuirse bajo la misma licencia. Es necesario verificar la compatibilidad con proyectos propietarios.
- **Sin garantias de produccion**: el proyecto original es una demo de investigacion; no se documentan pruebas de robustez ante ruido, oclusiones o variaciones de iluminacion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maximazzik/easy_sign)
- [Repositorio GitHub de easy_sign](https://github.com/ai-forever/easy_sign)
- [README en ingles del proyecto](https://github.com/ai-forever/easy_sign/blob/main/README_en.md)
- [Dataset Slovo](https://github.com/hukenovs/slovo)
- [Articulo en Habr (ruso)](https://habr.com/ru/companies/sberbank/articles/775688/)
- [Sitio web easysign.ai](https://easysign.ai/)
