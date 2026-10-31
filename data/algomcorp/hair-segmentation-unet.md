# AlgomCorp/hair-segmentation-unet

## Resumen

Hair Progress Tracker & U-Net Pipeline Visualizer es un sistema de vision por computador desarrollado por AlgomCorp para el seguimiento cuantitativo y objetivo de la progresion del cabello en el cuero cabelludo (alopecia, tratamientos anticaida, recuperacion de injertos capilares y terapias de repoblacion). El nucleo del sistema es una red de segmentacion semantica U-Net simetrica con aproximadamente 7,76 millones de parametros, entrenada para delimitar con precision la region capilar en fotografias clinicas.

Sobre la segmentacion base, el sistema anade una capa de ingenieria clinica considerable: registro jerarquico multi-nivel de imagenes (alineamiento biometrico facial, AKAZE + RANSAC y marco de referencia), normalizacion invariante a escala del craneo, mapas de calor de densidad folicular, contornos de desplazamiento de la linea de nacimiento del cabello y clasificacion automatica en la escala Norwood-Hamilton. Se presenta como un proyecto capstone de deep learning con utilidad clinica, distribuido con licencia MIT y acompanado de una demo interactiva en Gradio.

Su relevancia radica en ofrecer un pipeline completo y reproducible de monitorizacion capilar, un problema donde tradicionalmente se depende de evaluacion visual subjetiva. Los resultados publicados (Dice del 95,19 % en un conjunto de prueba de 2.930 imagenes) lo posicionan como una herramienta segmentadora solida para este dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net simetrica (encoder-decoder con skip connections), canales [32, 64, 128, 256], cuello de botella 512 |
| Parametros totales | ~7,76 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,1 GB; framework PyTorch 2.x) |

## Arquitectura y entrenamiento

El modelo es una U-Net clasica de segmentacion semantica con una estructura simetrica de encoder-decoder y conexiones de salto (skip connections), configurada con canales progresivos de 32, 64, 128 y 256, y un cuello de botella de 512 filtros, lo que totaliza unos 7,76 millones de parametros. Esta arquitectura es estandar en segmentacion biomedica por su capacidad de combinar contexto global con detalle espacial fino, algo critico para delimitar bordes de la linea capilar.

No se han publicado detalles sobre el dataset de entrenamiento (numero de imagenes, composicion ni fuente), ni sobre el procedimiento de optimizacion (funcion de perdida, RLHF/DPO no aplica al ser un modelo de vision). En inferencia, el sistema incorpora Test-Time Augmentation (TTA) mediante doble pasada con promediado de probabilidades sobre espejo horizontal, lo que elimina el jitter en los bordes de la segmentacion. El pipeline completo anade un registro jerarquico de tres niveles: alineamiento rigido por similitud con geometria pupilar y centros faciales (nivel 1), AKAZE + RANSAC con comprobaciones de determinante afin entre 0,4 y 2,5 para vistas de coronilla (nivel 2), y evaluacion de fotos sin alinear con SSIM estructural (nivel 3). La densidad capilar se normaliza respecto a la region anatomica de la cabeza (relacion N_hair/N_head), garantizando invariancia al zoom y a la distancia de camara.

## Capacidades

- Segmentacion semantica del cabello en el cuero cabelludo con metricas altas: Dice 95,19 %, IoU 90,84 %, precision 94,88 % y recall 95,51 % en 2.930 imagenes de prueba.
- Mapa de calor continuo de densidad folicular (colormap Turbo sobre probabilidades sigmoides) que identifica adelgazamiento subclinico antes de la perdida folicular completa.
- Comparacion baseline vs. seguimiento con contornos duales de la linea capilar (verde para linea base, azul para seguimiento) y seguimiento del desplazamiento vertical en pixeles.
- Clasificacion automatica del estadio de alopecia androgenica en la escala Norwood-Hamilton (tipos I a VII).
- Registro de imagenes multi-nivel con alineamiento biometrico facial, AKAZE + RANSAC y verificacion SSIM para fotos no alineadas.
- Normalizacion invariante a escala basada en la anatomia del craneo del paciente.
- Exportacion de informes clinicos de 6 paneles en PNG con calidad de publicacion.
- Visor interactivo tipo cortina (slider 0 % a 100 %) para comparacion antes/despues.
- Inspector de auditoria de pixeles con verificacion en pantalla de conteos crudos, formulas y metadatos de tensores, garantizando determinismo del 100 %.
- Demo interactiva desplegada en Gradio (SDK 6.30.0).

## Casos de uso

- Seguimiento clinico de tratamientos anticaida: el dermatologo fotografía al paciente en cada visita y el sistema cuantifica la densidad capilar normalizada, generando contornos comparables entre sesiones gracias al registro multi-nivel.
- Monitorizacion post-injerto capilar: permite objetivar la recuperacion y el crecimiento tras un trasplante midiendo el desplazamiento de la linea capilar y la densidad en zonas injertadas.
- Evaluacion de eficacia de farmacos (minoxidil, finasterida): la metrica N_hair/N_head invariante a escala permite comparar fotos tomadas con camaras y distancias distintas a lo largo de meses.
- Clasificacion automatica del estadio de alopecia: la clasificacion Norwood-Hamilton I-VII agiliza la documentacion clinica y la estratificacion de pacientes en estudios.
- Deteccion temprana de adelgazamiento subclinico: el mapa de calor de densidad folicular resalta zonas de perdida incipiente antes de que sea visible a simple vista.
- Telematica y teleconsulta: el informe PNG de 6 paneles con calidad de publicacion puede enviarse al paciente o adjuntarse a la historia clinica digital.
- Investigacion clinica y ensayos: la trazabilidad matematica y el inspector de auditoria de pixeles facilitan la reproducibilidad y el determinismo exigidos en estudios cuantitativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test Dice | 95,19 % |
| Test IoU | 90,84 % |
| Precision | 94,88 % |
| Recall | 95,51 % |
| Conjunto de prueba | 2.930 imagenes (holdout) |

No se han publicado comparaciones con otros modelos de segmentacion capilar en la informacion disponible.

## Requisitos de hardware

- Con ~7,76 millones de parametros y un tamano de repositorio de 0,1 GB, el modelo es muy ligero: la inferencia en GPU requiere menos de 1 GB de VRAM (estimacion basada en el tamano del modelo, no dato publicado explicitamente).
- Cualquier GPU moderna de consumo es suficiente, incluidas integradas o dedicadas de gama baja; una RTX 3060, RTX 4060 o incluso GPUs portatiles ejecutarian el modelo sin problemas. No requiere A100 ni H100.
- Es plausible la ejecucion en CPU dada la escala del modelo, aunque la latencia no esta documentada.
- Despliegue: demo oficial en Hugging Face Spaces con Gradio 6.30.0; framework base PyTorch 2.x. No se mencionan exportaciones a ONNX, TensorRT ni soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables al ser un modelo de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Metricas publicadas | Licencia |
|---|---|---|---|---|
| AlgomCorp/hair-segmentation-unet | Segmentacion de cabello + seguimiento clinico | ~7,76 M | Dice 95,19 %, IoU 90,84 % | MIT |
| CelebAMask-HQ (segmentacion de atributos faciales) | Segmentacion multi-clase de rostro incl. cabello | no disponible | no disponible | No comercial (CC BY-NC) |
| Face-parsing (PyTorch BiSeNet) | Segmentacion de componentes faciales incl. cabello | ~13 M aprox. | no disponible | MIT (segun repositorio) |

No hay alternativas publicas especializadas en seguimiento longitudinal de densidad capilar con registro de imagenes y estadiaje Norwood-Hamilton; la comparativa anterior se limita a modelos de segmentacion facial/capilar genericos.

## Limitaciones y advertencias

- No se ha publicado informacion sobre el dataset de entrenamiento, por lo que es imposible evaluar sesgos demograficos (tipo de cabello, etnia, tono de piel, iluminacion). El rendimiento en poblaciones poco representadas podria ser inferior.
- El modelo esta orientado a fotografias clinicas del cuero cabelludo; su comportamiento con fotos amateur, oclusiones (gorras, peines, manos) o iluminacion extrema no esta documentado.
- La clasificacion Norwood-Hamilton es una estimacion automatica y no sustituye el diagnostico de un profesional; el uso clinico real requeriria validacion regulatoria (no se menciona certificacion medica de ningun tipo).
- La metrica de densidad depende de la calidad del registro de imagenes; el nivel 3 (fotos sin alinear) introduce SSIM variable, por lo que la comparabilidad entre sesiones mejora notablemente con fotos tomadas bajo protocolo consistente.
- La licencia MIT permite uso comercial sin restricciones significativas, pero al ser un proyecto capstone sin comunidad activa (0 descargas registradas en el momento de la ficha), el soporte y el mantenimiento a largo plazo son inciertos.
- No se han publicado detalles de entrenamiento (perdida, aumentaciones, epocas), lo que dificulta reproducir los resultados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlgomCorp/hair-segmentation-unet
- Demo en Hugging Face Spaces (Gradio): incluida en el repositorio del modelo (app.py, SDK Gradio 6.30.0); la URL del Space no se indica explicitamente en la informacion disponible.
- Paper, repositorio de codigo externo o blog: no disponibles en la informacion proporcionada.
