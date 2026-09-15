# apirrone/microduck-velstand

## Resumen

microduck-velstand es una política de control robótico publicada por el usuario apirrone en Hugging Face, distribuida como un único fichero `policy.onnx`. El modelo recibe como entrada un vector de observación de 61 valores y produce 14 objetivos articulares ("joint targets") como salida, operando a una frecuencia de control de 50 Hz. Forma parte de la familia de políticas Microduck y se ha publicado desde el entorno denominado Microduck Arena.

A diferencia de los modelos de lenguaje, esta ficha describe un artefacto de aprendizaje por refuerzo o imitación orientado a control de bajo nivel: no genera texto ni procesa lenguaje natural, sino que mapea observaciones numéricas a consignas de actuadores. Su relevancia es práctica para la comunidad de robótica: un fichero ONNX de este tipo puede desplegarse directamente en runtime ONNX en CPU, GPU o hardware embebido sin necesidad de reproducir el stack de entrenamiento original.

La información pública es muy limitada. La model card se reduce a la descripción del contrato de entrada/salida y remite a un `manifest.json` del repositorio para la especificación completa. No se declaran licencia, idiomas, arquitectura interna, datos de entrenamiento ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal exportada a ONNX; topologia interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica; entrada de 61 valores de observacion por paso |
| Tipos de cuantizacion | no disponible (formato de exportacion ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |

Datos adicionales del contrato de inferencia:

| Parametro | Valor |
|---|---|
| Dimension de entrada | 61 valores de observacion |
| Dimension de salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0,0 GB (segun metadatos de Hugging Face) |
| Libreria declarada | onnx |
| Pipeline declarado | robotics |
| Etiquetas | microduck-policy, microduck, onnx, robotics, region:us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Se trata de una politica aprendida exportada a formato ONNX, lo que implica una red neuronal de inferencia con un grafo estatico y compatible con ONNX Runtime. La model card no especifica si se trata de un perceptron multicapa, una red convolucional, una red recurrente o un transformer de decision, ni el numero de capas, unidades o parametros.

Tampoco se documenta el procedimiento de entrenamiento: no hay datos sobre el algoritmo utilizado (por ejemplo, aprendizaje por refuerzo on-policy u off-policy, o imitacion conductual), el volumen de datos, la composicion del dataset, el simulador empleado, ni si hubo etapas de ajuste fino. La unica referencia tecnica disponible es el contrato de interfaz: 61 valores de observacion como entrada, 14 objetivos articulares como salida y una frecuencia de 50 Hz, coherente con bucles de control de robots a nivel de junta. La model card remite a `manifest.json` para la especificacion completa del contrato, fichero que no forma parte de la informacion proporcionada.

## Capacidades

- Control de robot a nivel de junta: transforma una observacion de 61 valores en 14 consignas de posicion o actuacion articular.
- Inferencia a 50 Hz, adecuada para bucles de control en tiempo real de robots con actuadores de respuesta rapida.
- Ejecucion portable mediante ONNX Runtime, sin dependencia del framework de entrenamiento original.
- Ejecucion en CPU o GPU, lo que permite desplegar la politica tanto en estaciones de trabajo como en hardware embebido compatible con ONNX.
- Integracion con simuladores de robotica: al ser un grafo ONNX, puede cargarse en entornos de simulacion para evaluacion previa al despliegue fisico.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, uso de agentes ni soporte multilingue.
- No se declara soporte de modo de razonamiento explicito ni decodificacion especulativa.

## Casos de uso

- Despliegue de politica de control en robot fisico: el fichero `policy.onnx` puede cargarse con ONNX Runtime y ejecutarse en bucle a 50 Hz, alimentando los 14 objetivos articulares directamente al controlador de bajo nivel del robot. La ventaja es la ausencia de dependencias de entrenamiento.
- Evaluacion en simulador antes del despliegue: integrando el grafo ONNX en un simulador fisico se puede medir la tasa de exito, la estabilidad y el consumo de par antes de arriesgar hardware real, con la misma interfaz de 61 entradas y 14 salidas.
- Comparacion de politicas dentro de Microduck Arena: la model card indica que el modelo se publico desde ese entorno, por lo que sirve como referencia base frente a otras politicas Microduck evaluadas bajo el mismo contrato de observacion y accion.
- Inferencia en hardware embebido de bajos recursos: al ser una politica exportada a ONNX de repositorio practicamente vacio en cuanto a tamano de pesos segun los metadatos, es candidata a ejecutarse en CPU de placas embebidas con ONNX Runtime, sin GPU dedicada.
- Investigacion en sim2real: el modelo permite estudiar la brecha entre simulacion y realidad manteniendo fija la politica y variando el modelo dinamico, ya que la interfaz de observacion y accion esta congelada por el formato ONNX.
- Linea base para aprendizaje por refuerzo: investigadores que trabajen en nuevas politicas para Microduck pueden usar esta como punto de partida o como oponente en evaluaciones comparativas dentro del mismo entorno.
- Reproducibilidad de artefactos: al distribuirse como un unico fichero ONNX con contrato documentado en `manifest.json`, facilita la verificacion de resultados por terceros sin acceso al pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de retorno, tasa de exito, estabilidad, consumo energetico ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los metadatos indican un tamano de repositorio de 0,0 GB, lo que sugiere un fichero de pesos de pequeno tamano, pero no se confirma el numero de parametros ni el peso real de `policy.onnx`.
- GPU recomendadas: no disponibles. Al no declararse el tamano del modelo, no puede justificarse una recomendacion concreta de A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada por falta de datos, aunque un grafo ONNX de control a 50 Hz es compatible en principio con GPU de gama media si el modelo es pequeno.
- Ejecucion en CPU: viable en principio mediante ONNX Runtime, dado el caracter de la tarea (bucle de control a 50 Hz) y la ausencia de requisitos declarados de GPU.
- Opciones de despliegue: ONNX Runtime es el runtime natural del formato. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de control robotico.
- Latencia y throughput: no disponibles. El unico dato objetivo es la frecuencia de control objetivo de 50 Hz, es decir, un presupuesto de 20 ms por ciclo de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas Microduck ni modelos comparables de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay evidencia publicada de que la politica funcione correctamente fuera del entorno en el que se genero.
- Contrato incompleto en la informacion disponible: la definicion de los 61 valores de observacion y de los 14 objetivos articulares se delega a `manifest.json`, que no se ha facilitado. Sin esa especificacion no es posible construir un entorno de inferencia correcto.
- Riesgo de sobreajuste al morfologia o al simulador de origen: las politicas de control aprendidas suelen degradarse ante cambios de masa, friccion, latencias de actuacion o terreno. No se documenta ninguna evaluacion de robustez.
- Riesgo de desviacion de dominio en sim2real: no hay informacion sobre tecnicas de aleatorizacion de dominio ni sobre validacion en hardware fisico.
- Idiomas: no aplica. El modelo no procesa lenguaje natural, por lo que no existe soporte multilingue ni capacidad de instrucciones en texto.
- Alucinacion: el concepto no aplica en el sentido generativo, pero si existe riesgo de salidas fuera de rango en los 14 objetivos articulares si la observacion de entrada sale de la distribucion de entrenamiento.
- Trazabilidad limitada: repositorio sin descargas ni valoraciones registradas y publicado de forma muy reciente en el momento de la consulta, sin historial de uso que permita valorar su fiabilidad.
- Sin informacion de seguridad fisica: no se documentan limites de par, paradas de emergencia ni envolventes de seguridad, aspectos criticos antes de mover hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/apirrone/microduck-velstand
- `manifest.json` (referenciado en la model card como contrato completo, dentro del repositorio del modelo): https://huggingface.co/apirrone/microduck-velstand
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
