# HenryZhang/piper-ucla-bs16-40k-r2-step030000-pi05

## Resumen

piper-ucla-bs16-40k-r2-step030000-pi05 es un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, un modelo de vision-lenguaje-accion (VLA) orientado a control robotico. Lo desarrolla el usuario HenryZhang y se ha entrenado sobre el dataset thecqzzz/piper_vla_ucla, compuesto por demostraciones del robot Piper en el entorno UCLA, durante 30.000 actualizaciones del optimizador con un tamano de lote global de 16 y un *action chunk* de 32.

El modelo pesa aproximadamente 4.140 millones de parametros (4,14 B) almacenados en formato safetensors, con un repositorio de 9,4 GB. Se distribuye como un checkpoint intermedio del entrenamiento (paso 30.000) y esta pensado para ser cargado en el ecosistema LeRobot, la libreria de Hugging Face para robotica.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion derivado de un modelo base abierto, sin model card detallada, sin licencia declarada y sin descargas ni validacion publica. Resulta de interes para quienes trabajen en imitation learning y politicas VLA sobre plataformas Piper, pero no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA derivado de lerobot/pi05_base; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste | thecqzzz/piper_vla_ucla |
| Action chunk | 32 |
| Batch global de entrenamiento | 16 |
| Actualizaciones del optimizador | 30.000 |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que deriva de lerobot/pi05_base, un modelo de la familia pi0 de Physical Intelligence integrado en LeRobot, que combina un backbone de vision-lenguaje con un cabezal de acciones para generar comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. El checkpoint aqui descrito es un ajuste fino de ese modelo base, no un entrenamiento desde cero.

El entrenamiento consistio en 30.000 actualizaciones del optimizador con un tamano de lote global de 16 y un *action chunk* de 32 sobre demostraciones del robot Piper recogidas en UCLA (dataset thecqzzz/piper_vla_ucla). No se especifican en la model card el numero de tokens o trayectorias, la composicion del dataset, la presencia de RLHF/DPO ni innovaciones tecnicas adicionales. El nombre del checkpoint indica que es el paso 30.000 de una ejecucion etiquetada como "r2" y "40k", lo que sugiere que el entrenamiento previsto podria haber sido mas largo.

## Capacidades

- Control robotico por imitacion: genera secuencias de acciones (action chunks de 32 pasos) a partir de observaciones visuales e instrucciones, siguiendo el paradigma VLA.
- Percepcion visual: al derivar de un modelo vision-lenguaje-accion, procesa imagenes de camara como entrada para producir comandos motores.
- Seguimiento de instrucciones en lenguaje natural: el modelo base pi05 acepta comandos textuales que condicionan la politica de acciones.
- Especializacion en la plataforma Piper: el ajuste fino lo orienta a la morfologia y las tareas del robot Piper en el entorno UCLA.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, multilingueismo, modo thinking, audio ni otras funciones generales.

## Casos de uso

- Investigacion en imitation learning: servir como checkpoint de referencia para reproducir o comparar experimentos de ajuste fino de pi05 sobre el dataset Piper UCLA.
- Evaluacion de politicas VLA en robot Piper: desplegar el modelo en el mismo hardware y entorno de recogida de datos para medir la tasa de exito en tareas manipulativas.
- Punto de partida para ajustes posteriores: reanudar el entrenamiento o aplicar fine-tuning adicional sobre nuevos datasets de demostraciones del mismo robot.
- Analisis de escalado de entrenamiento: comparar este checkpoint (paso 30.000, batch 16) con otros pasos de la misma ejecucion para estudiar la evolucion del rendimiento.
- Docencia y prototipado en robotica: usar el modelo en practicas de laboratorio con LeRobot para ilustrar el flujo completo de un pipeline VLA.
- Validacion de pipelines de datos: comprobar la calidad y la compatibilidad del dataset thecqzzz/piper_vla_ucla entrenando y evaluando una politica sobre el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,14 B parametros, en precision completa (fp32) se necesitarian en torno a 16,6 GB solo para pesos; en bf16/fp16, unos 8,3 GB; en cuantizacion de 8 bits, aproximadamente 4,1 GB.
- GPU recomendadas: no hay datos especificos del autor. Por tamano, una GPU con 16-24 GB (RTX 4090, A5000, L4) cubriria la inferencia en bf16; para entrenamiento o ajuste fino se recomendarian A100/H100 por memoria y ancho de banda.
- Cabe en GPU de consumo: si, previsiblemente en bf16 en tarjetas de 12-16 GB o mas, y en cuantizaciones de 8 bits en tarjetas de 8 GB, aunque no hay confirmacion oficial.
- Opciones de despliegue: el ecosistema natural es LeRobot (Hugging Face) para politicas roboticas; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper-ucla-bs16-40k-r2-step030000-pi05 | ~4,14 B | no disponible | VLA (fine-tune de pi05) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base | no disponible | Hugging Face (modelo base) |
| Otros fine-tunes de pi0/pi05 en LeRobot | no disponible | no disponible | VLA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan arquitectura, licencia, idiomas, contexto ni procedimiento de evaluacion.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o consultar la licencia del modelo base lerobot/pi05_base.
- Especializacion estrecha: el ajuste esta limitado al robot Piper y al dataset UCLA; el rendimiento fuera de ese dominio es incierto.
- Riesgo de sobreajuste al dataset: con 30.000 pasos sobre un unico dataset de demostraciones, la generalizacion a otras tareas o entornos no esta validada.
- Sin validacion publica: cero descargas y cero likes; no hay evidencia externa de calidad ni de tasa de exito en tareas.
- Checkpoint intermedio: el paso 30.000 podria no corresponder al mejor punto de la ejecucion "40k".
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; en modelos VLA se traduce en acciones inseguras o fuera de distribucion.
- Uso en produccion desaconsejado sin evaluacion previa en el entorno real y sin analisis de seguridad fisica del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HenryZhang/piper-ucla-bs16-40k-r2-step030000-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/thecqzzz/piper_vla_ucla
- LeRobot (libreria de robotica de Hugging Face): https://github.com/huggingface/lerobot
