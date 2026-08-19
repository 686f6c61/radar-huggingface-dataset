# LIANGXU123/ROSE-CD

## Resumen

ROSE-CD es un modelo de mejora de voz (speech enhancement) y dereverberación en tiempo real desarrollado por Liang Xu, Longfei Felix Yan y W. Bastiaan Kleijn, del grupo de investigación de la Universidad Victoria de Wellington (Nueva Zelanda). El trabajo fue presentado como ponencia oral en el IEEE Workshop on Applications of Signal Processing to Audio and Acoustics (WASPAA) 2025. El modelo emplea un enfoque de destilación de consistencia (consistency distillation) sobre un modelo de difusión profesor de 30 pasos, logrando una inferencia de un solo paso que acelera el procesamiento en 54 veces respecto al profesor, con métricas objetivas superiores en todos los benchmarks evaluados.

La arquitectura subyacente es un modelo de difusión condicionado a la señal ruidosa, típicamente basado en una red neuronal convolucional o similar, aunque los detalles exactos del backbone no se especifican en la documentación pública. El repositorio incluye checkpoints para tres tareas: mejora de voz en VoiceBank-DEMAND, mejora de voz en EARS-WHAM y dereverberación en EARS-REVERB. El modelo está pensado para aplicaciones de audio en tiempo real, como llamadas, asistentes de voz o preprocesamiento para reconocimiento automático del habla. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con destilacion de consistencia (one-step consistency training). Backbone no especificado |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio de duracion variable, sin limite especificado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente PyTorch .bin) |

## Arquitectura y entrenamiento

ROSE-CD se basa en un modelo de difusion que genera la senal de voz limpia a partir de una version ruidosa o reverberante. El entrenamiento emplea destilacion de consistencia (consistency training), una tecnica que fuerza al modelo a mapear cualquier punto de la trayectoria de difusion directamente al punto final, permitiendo la generacion en un unico paso de muestreo. El modelo profesor es un modelo de difusion estandar con 30 pasos de desruido, y el modelo alumno (ROSE-CD) se entrena para imitar la salida del profesor en cada paso, pero con la restriccion de consistencia que permite la inferencia en un solo paso.

Los datos de entrenamiento no se detallan en la documentacion publica, pero los benchmarks se realizan sobre los conjuntos VoiceBank-DEMAND (mezclas de voz con ruido real), EARS-WHAM (ruido y habla de escenarios realistas) y EARS-REVERB (reverberacion artificial). No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado con funciones de perdida basadas en PESQ y error cuadratico medio (L2), como indican los nombres de los checkpoints (CT_pesq5e-4_L2). La innovacion principal es la reduccion de pasos de 30 a 1 sin perdida de calidad, sino con una mejora objetiva, gracias a la regularizacion por consistencia.

## Capacidades

- Mejora de voz (speech enhancement): elimina ruido de fondo y mejora la inteligibilidad y calidad percibida de senales de habla.
- Dereverberacion: reduce el efecto de reverberacion en grabaciones de audio, mejorando la claridad del habla.
- Inferencia en un solo paso: a diferencia de los modelos de difusion tradicionales que requieren multiples iteraciones, ROSE-CD genera la salida en una unica pasada, habilitando aplicaciones en tiempo real.
- Aceleracion 54x respecto al modelo profesor de 30 pasos, manteniendo o superando las metricas objetivas.
- Procesamiento de audio a audio: la entrada es una senal de audio ruidosa y la salida es la senal limpia.
- Soporte para multiples escenarios: checkpoints separados para mejora de voz general y para dereverberacion, ambos con un solo paso.

No dispone de capacidades de tool calling, agentes, vision, ni soporte multilingue mas alla del ingles implicito en los datos de entrenamiento.

## Casos de uso

- Llamadas telefonicas y videoconferencias: integracion en aplicaciones de comunicacion para limpiar el audio en tiempo real, reduciendo ruido ambiental y mejorando la comprension del habla. Su inferencia de un solo paso permite latencias por debajo de los umbrales perceptibles.
- Asistentes de voz y dispositivos smart home: preprocesamiento de la senal de microfono antes de enviarla a un sistema de reconocimiento de voz, mejorando la tasa de error en entornos ruidosos (WER reducido de 18.65% a 18.19% en EARS-WHAM).
- Grabacion de podcasts y produccion audiovisual: limpieza de grabaciones realizadas en entornos no controlados, eliminando ruido de fondo y reverberacion sin necesidad de estudios profesionales.
- Audifonos y dispositivos de asistencia auditiva: implementacion en hardware de bajo consumo gracias a la eficiencia de un solo paso, mejorando la claridad del habla en entornos ruidosos para personas con perdida auditiva.
- Sistemas de transcripcion automatica: preprocesamiento de audio para servicios de transcripcion, reduciendo errores en entornos con ruido de fondo o reverberacion, como salas de reuniones o espacios publicos.
- Analisis forense de audio: mejora de grabaciones de baja calidad para extraer contenido inteligible, util en investigaciones y peritajes, aunque la licencia MIT no restringe este uso.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan ROSE-CD con su modelo profesor y con SGMSE+, un modelo de difusion de referencia para mejora de voz.

### VoiceBank-DEMAND

| Modelo | Pasos | PESQ (↑) | ESTOI (↑) | SI-SDR (↑) | SI-SIR (↑) | SI-SAR (↑) |
|---|---|---|---|---|---|---|
| Profesor (teacher) | 30 | 2.89 | 0.86 | 16.7 | 26.7 | 17.6 |
| ROSE-CD (CT) | 1 | 3.47 | 0.87 | 19.2 | 29.2 | 20.0 |

### EARS-WHAM (mejora de voz)

| Modelo | Pasos | WER (↓) | PESQ (↑) | SI-SDR (↑) | ESTOI (↑) |
|---|---|---|---|---|---|
| SGMSE+ | 60 | 18.65% | 2.20 | 14.2 | 0.84 |
| ROSE-CD | 1 | 18.19% | 2.81 | 15.3 | 0.85 |

### EARS-REVERB (dereverberacion)

| Modelo | Pasos | WER (↓) | PESQ (↑) | ESTOI (↑) |
|---|---|---|---|---|
| SGMSE+ | 60 | 17.32% | 1.95 | 0.76 |
| ROSE-CD | 1 | 15.78% | 2.69 | 0.82 |

En todos los casos, ROSE-CD supera al profesor de 30 pasos y a SGMSE+ con 60 pasos, utilizando un unico paso de inferencia.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentacion publica. El tamano del repositorio es de 12.6 GB, que incluye todos los checkpoints (profesor y CT para las tres tareas), por lo que el modelo individual probablemente ocupa unos pocos GB.
- Dado que la inferencia es de un solo paso, el coste computacional es significativamente menor que el de un modelo de difusion de 30 o 60 pasos. Esto sugiere que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos confirmados.
- Para despliegue en tiempo real, se recomienda una GPU con al menos 4-8 GB de VRAM, dependiendo del tamano del modelo (no disponible).
- Opciones de despliegue: el codigo de evaluacion esta disponible en el repositorio de GitHub. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de audio, no de texto. Se puede usar con PyTorch directamente.
- La latencia estimada es de un solo paso de red neuronal, tipicamente del orden de milisegundos en GPU moderna, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | PESQ (VoiceBank) | WER (EARS-WHAM) | Licencia |
|---|---|---|---|---|---|
| ROSE-CD | Difusion + destilacion de consistencia | 1 | 3.47 | 18.19% | MIT |
| SGMSE+ | Difusion estocastica | 60 | no reportado | 18.65% | no disponible |
| Profesor de ROSE-CD | Difusion | 30 | 2.89 | no reportado | MIT |

ROSE-CD es el unico de los tres que ofrece inferencia en un solo paso, con mejores metricas que el profesor y que SGMSE+ en los benchmarks compartidos. SGMSE+ es un modelo de referencia en mejora de voz por difusion, pero requiere multiples pasos y no esta disponible bajo licencia abierta confirmada.

## Limitaciones y advertencias

- Solo se ha evaluado en ingles; el rendimiento en otros idiomas no esta garantizado, aunque la mejora de voz es en principio independiente del idioma.
- Los datos de entrenamiento no se describen en detalle, por lo que no se conocen posibles sesgos hacia acentos, generos o condiciones de grabacion especificas.
- No se han publicado pruebas de robustez ante ruido no estacionario extremo, musica de fondo o habla solapada (cocktail party), escenarios que podrian degradar el rendimiento.
- El modelo no incluye capacidades de separacion de multiples hablantes; esta disenado para un unico hablante con ruido de fondo.
- La licencia MIT permite uso comercial, pero el usuario es responsable de verificar que los datos de entrenamiento no infrinjan derechos de terceros.
- No se proporcionan scripts de inferencia listos para produccion; el codigo del repositorio de GitHub esta orientado a evaluacion academica y requiere adaptacion para despliegue en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LIANGXU123/ROSE-CD
- Articulo en arXiv: https://arxiv.org/abs/2507.05688
- Repositorio de codigo en GitHub: https://github.com/LIANGXU123/Robust-One-step-Speech-Enhancement-via-Consistency-Distillation-ROSE-CD-
- Pagina del proyecto: https://liangxu123.github.io/rosecd/
- Publicacion en IEEE (WASPAA 2025): https://ieeexplore.ieee.org/document/11230988
