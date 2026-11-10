# ROBOTIS/AIWorker-Arm-Segmentation-v1

## Resumen

AI Worker Arm Segmentation v1 es un modelo de segmentación de instancias desarrollado por ROBOTIS, el fabricante del robot humanoide AI Worker. Se trata de un ajuste fino de facebook/sam3 (Segment Anything Model 3 de Meta) especializado en una tarea muy concreta: segmentar los brazos, pinzas y cámaras acopladas del propio robot que graba la escena. El modelo resuelve un problema práctico de robótica de manipulación: separar el cuerpo del robot de los objetos y del entorno para evitar que el propio hardware contamine la percepción visual durante la grabación de datos.

El modelo es relevante porque un único checkpoint cubre las cuatro vistas de cámara del AI Worker (cabeza izquierda, cabeza derecha, muñeca izquierda y muñeca derecha), lo que simplifica el despliegue en sistemas con múltiples cámaras sincronizadas. Está pensado para ejecutarse localmente con PyTorch en BF16 sobre GPU CUDA y produce máscaras de instancia, cajas delimitadoras y puntuaciones de confianza.

La arquitectura subyacente es la de SAM3 (transformer de segmentación promptable), aunque la model card no detalla el número de parámetros ni la longitud de contexto, ya que se trata de un modelo de visión y no de lenguaje. El repositorio ocupa 3,5 GB y se distribuye bajo la SAM License, una licencia de tipo "other" derivada de la de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM3 (Segment Anything Model 3, transformer de segmentacion promptable); ajuste fino sobre facebook/sam3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; la model card solo menciona ejecucion en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | SAM License (license: other, license_name: sam-license) |
| Formato de pesos | checkpoint PyTorch (.pt) descargado via huggingface_hub; tamano del repo 3,5 GB |
| Tarea | Segmentacion de instancias (pipeline: mask-generation) |
| Entrada | Imagen RGB |
| Salida | Mascaras de instancia, cajas delimitadoras (XYXY) y puntuaciones de confianza |
| Vistas de camara | Cabeza izquierda/derecha y muñeca izquierda/derecha |
| Runtime | PyTorch 2.10, CUDA 12.8, BF16 en GPU NVIDIA |
| Fecha de publicacion | 10 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de SAM3 de Meta, un sistema de segmentacion promptable basado en transformer que genera mascaras de instancia a partir de imagenes RGB. ROBOTIS ha realizado un ajuste fino supervisado sobre aproximadamente 12.000 imagenes del robot AI Worker, adaptando el modelo base al dominio especifico de los brazos, pinzas y camaras del propio robot. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion, algo por otra parte poco habitual en modelos de segmentacion.

La evaluacion se realizo sobre 1.317 imagenes de desarrollo con referencias automaticas o asistidas por IA, ademas de videos de las camaras de cabeza y muñeca. La model card advierte explicitamente que estas referencias no constituyen ground truth humano independiente, lo que limita la interpretacion de las metricas. No se detalla la composicion exacta del dataset de entrenamiento ni innovaciones tecnicas adicionales mas alla del ajuste fino sobre SAM3.

## Capacidades

- Segmentacion de instancias de los brazos, pinzas y camaras visibles del robot AI Worker.
- Soporte de las cuatro vistas de camara del robot con un unico modelo: cabeza izquierda, cabeza derecha, muñeca izquierda y muñeca derecha.
- Generacion de mascaras combinadas a resolucion original de la imagen (mask.png).
- Produccion de mascaras individuales, cajas delimitadoras en formato XYXY y puntuaciones de confianza (instances.npz).
- Procesamiento fotograma a fotograma de video aplicando el modelo a cada frame.
- Generacion de etiquetas de segmentacion para anotacion de datos.
- Ejecucion local en PyTorch con BF16 sobre GPU CUDA.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- Capacidad multilingue no aplica; el modelo no procesa texto.

## Casos de uso

- Limpieza de datasets de robotica: al grabar demostraciones con el AI Worker, el modelo permite enmascarar los brazos y pinzas del propio robot para que no aparezcan como parte de la escena y contaminen el entrenamiento de politicas de manipulacion.
- Anotacion automatica de datos de segmentacion: genera etiquetas preliminares (mascaras y cajas) sobre las 12.000 imagenes de entrenamiento o sobre nuevos fotogramas, que luego un humano revisa y corrige, reduciendo el coste de anotacion manual.
- Percepcion de autocolision en tiempo de ejecucion: al segmentar los brazos visibles en cada vista de camara, el sistema puede detectar cuando el robot se aproxima a su propio cuerpo u obstaculos acoplados.
- Procesamiento de video multi-camara: aplicando el modelo fotograma a fotograma sobre las cuatro camaras sincronizadas, se obtiene una representacion consistente del estado del robot para analisis posterior o para reconstruccion de escena.
- Teleoperacion y realidad aumentada: la mascara del brazo permite superponer visualizaciones o resaltar el efector final en interfaces de operador remoto sin necesidad de marcadores fisicos.
- Control de calidad de grabaciones: detectar fotogramas en los que el brazo queda fuera de cuadro o excesivamente ocluido, filtrando datos de baja calidad antes de incorporarlos a un pipeline de entrenamiento.
- Investigacion en segmentacion de dominio especifico: sirve como punto de partida para ajustar SAM3 a otros robots o herramientas, reutilizando el pipeline de PyTorch y el formato de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion sobre 1.317 imagenes de desarrollo con referencias automaticas o asistidas por IA y videos de camara de cabeza y muñeca, pero no proporciona metricas numericas (IoU, mAP u otras) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que se ha probado con una GPU de 8 GB en BF16; el repositorio pesa 3,5 GB, por lo que una GPU consumer de 8 GB es suficiente para el checkpoint en BF16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte BF16 y al menos 8 GB de VRAM; la model card cita como probado un entorno con 8 GB, sin especificar el modelo exacto.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM y soporte BF16 (por ejemplo, gama RTX 30/40 con 8 GB o superior).
- Opciones de despliegue: script oficial predict.py con PyTorch 2.10 y CUDA 12.8; descarga de pesos via huggingface_hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIWorker-Arm-Segmentation-v1 (ROBOTIS) | no disponible | no aplica | Segmentacion de brazos/pinzas del robot AI Worker en 4 vistas | SAM License | Hugging Face |
| facebook/sam3 (Meta) | no disponible | no aplica | Segmentacion promptable generica | SAM License | Repo oficial de Meta |
| SAM 2 (Meta) | no disponible | no aplica | Segmentacion de imagen y video generica | Apache 2.0 (SAM 2) | Repo oficial de Meta |

La comparativa se limita a la familia SAM porque no se dispone de datos de otros modelos especializados en segmentacion de brazos roboticos en la informacion proporcionada. El valor diferencial de este ajuste es la especializacion en el dominio del AI Worker y la cobertura de sus cuatro vistas con un unico checkpoint; los modelos base son mas generales pero no estan adaptados a este hardware concreto.

## Limitaciones y advertencias

- Las partes del brazo lejanas o parcialmente ocluidas pueden no detectarse.
- Robots similares y estructuras oscuras del fondo pueden seleccionarse incorrectamente como objetivo.
- Las personas, otros robots y los objetos manipulados no son objetivos previstos del modelo.
- Solo se segmentan las regiones visibles del objetivo; las partes ocultas no se infieren.
- Las referencias de evaluacion son automaticas o asistidas por IA y no ground truth humano independiente, por lo que las metricas reales pueden diferir.
- Riesgo de alucinacion de mascaras sobre regiones ambiguas o de bajo contraste, habitual en modelos de segmentacion.
- La licencia SAM License es de tipo "other" y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El modelo solo procesa imagenes RGB y no maneja texto ni otros idiomas; la etiqueta de idioma "en" es meramente administrativa.
- Requiere revisar las predicciones antes de usarlas como etiquetas de entrenamiento, tal como advierte el autor.
- No se publican metricas cuantitativas de rendimiento, lo que dificulta comparar su calidad frente al SAM3 base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ROBOTIS/AIWorker-Arm-Segmentation-v1
- Modelo base SAM3 (Meta): https://github.com/facebookresearch/sam3
- Licencia SAM: https://huggingface.co/ROBOTIS/AIWorker-Arm-Segmentation-v1/blob/main/LICENSE
