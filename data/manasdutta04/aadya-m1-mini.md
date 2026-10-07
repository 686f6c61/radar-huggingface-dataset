# manasdutta04/aadya-m1-mini

## Resumen

aadya-m1-mini es un modelo probabilistico de serie temporal, desarrollado por el usuario manasdutta04, que predice cuando empezara el siguiente ciclo menstrual en forma de distribucion de probabilidad completa, en lugar de una unica fecha. Es la version reducida de aadya-m1: 836.093 parametros (0,84M) y un fichero de pesos de 3,4 MB, frente a los 256M parametros y aproximadamente 1 GB del modelo grande. Usa la misma receta de entrenamiento, las mismas entradas, las mismas salidas y el mismo codigo; solo cambia la escala.

El modelo resuelve un problema de prediccion con incertidumbre explicita: para cada posible duracion de ciclo entre 1 y 120 dias emite una probabilidad, de modo que la salida es util para razonar sobre rangos y no solo sobre un punto. Su proposito declarado es la ejecucion en el dispositivo (telefonos, navegadores y portatiles de baja potencia), de forma que los datos de ciclo no abandonen el dispositivo y no haga falta ni cuenta de usuario ni llamada de red.

Es relevante porque cuestiona la premisa de que haga falta un modelo grande para esta tarea: el autor entreno la misma receta a cuatro tamanos (0,84M, 10,8M, 57M y 256M parametros) y todos alcanzan un error similar en usuarios simulados y reales. La mini rinde a la par que la version de 256M en los datos reales publicos disponibles (CRPS medio 1,932 frente a 1,930) con unas 300 veces menos parametros. El repositorio es muy reciente (creado el 7 de octubre de 2026) y todavia tiene una traccion minima: 4 descargas y 2 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la misma familia que aadya-m1: 4 capas, 4 cabezas de atencion, tamano oculto 128 |
| Parametros totales | 836.093 (0,84M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; no es un contexto textual, la entrada es una secuencia de longitudes de ciclo previas (en dias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero de 3,4 MB) |

Datos adicionales de entrada y salida declarados por el autor: la entrada son longitudes de ciclos previos en dias, dias transcurridos desde el ultimo periodo, grupo de edad opcional y dia de test de ovulacion opcional; la salida es una probabilidad por cada duracion de ciclo de 1 a 120 dias. La libreria declarada es aadya-neural y el pipeline es time-series-forecasting.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 4 capas, 4 cabezas y tamano oculto 128, con 836.093 parametros. En lugar de generar texto, produce una distribucion categorica sobre 120 posibles duraciones de ciclo (1 a 120 dias). La innovacion relevante no es arquitectonica sino de planteamiento: la salida es una distribucion completa, lo que permite modelar la incertidumbre de forma explicita en vez de colapsarla a una fecha unica.

El entrenamiento se hizo exclusivamente con usuarios sinteticos: 6 escenarios, 1.500 usuarios por escenario y 20 ciclos por usuario, sin registros de personas reales. Se realizo una sola ejecucion con la misma perdida y receta que aadya-m1 (entropia cruzada + 0,5 x CRPS + una cabeza auxiliar) durante 2 epocas. No se declara uso de RLHF ni DPO. El autor aplico la misma regla de publicacion que a aadya-m1: mejora clara frente a la referencia bayesiana en usuarios simulados, cobertura de ventana del 80 % dentro de 0,80 +/- 0,05 y sin perdida en datos reales frente a aadya-m1.

## Capacidades

- Prediccion probabilistica del inicio del siguiente ciclo: devuelve una probabilidad por cada duracion de ciclo de 1 a 120 dias.
- Cuantificacion de la incertidumbre: cobertura de ventana del 80 % dentro del rango 0,80 +/- 0,05, segun la regla de publicacion declarada.
- Acepta entradas opcionales de contexto: grupo de edad y dia de test de ovulacion.
- Aprendizaje en el dispositivo a partir de periodos confirmados, segun la descripcion de privacidad del autor.
- Ejecucion local sin cuentas ni llamadas de red, lo que la habilita para entornos con requisitos de privacidad estrictos.
- Inferencia en CPU de portatil, telefonos y navegadores.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: no es un modelo de lenguaje.
- Capacidades multilingues: no aplica; el modelo no procesa ni genera lenguaje natural.

## Casos de uso

- Aplicaciones de seguimiento menstrual en el movil: el modelo se ejecuta localmente con 3,4 MB de pesos, de modo que los registros de ciclo no salen del dispositivo y no se necesita backend ni cuenta de usuario.
- Prediccion en el navegador: al ser tan pequeno, cabe en una aplicacion web que haga inferencia en el cliente (por ejemplo mediante el espacio de demostracion publicado) y evita enviar datos de salud a un servidor.
- Visualizacion de rangos en lugar de fechas: una app puede mostrar la ventana de 80 % y la distribucion completa de 1 a 120 dias, lo que reduce la falsa precision de las predicciones de fecha unica.
- Planificacion personal basada en incertidumbre: el usuario puede consultar la probabilidad acumulada de que el ciclo empiece antes de una fecha concreta para organizar viajes, pruebas medicas o actividad deportiva.
- Investigacion y docencia sobre calibracion probabilistica: el modelo sirve como referencia minima para estudiar CRPS y calibracion en series temporales de ciclos, con un coste computacional despreciable.
- Aprendizaje federado o personalizacion en el dispositivo: la arquitectura diminuta permite reentrenar o ajustar por usuario en el propio terminal, sin subir datos a la nube.
- Comparacion de metodos en analisis de series biomedicas: util como linea base ligera frente a heuristicas tipo mediana movil (CRPS 2,354 en los datos reales agrupados) o a referencias bayesianas clasicas (1,952).
- Integracion en dispositivos de bajo consumo: relojes, pulseras o hardware embebido donde un modelo de 256M parametros no cabria.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card. La metrica es CRPS medio en dias, donde menor es mejor. La evaluacion usa semillas fijas y solo datos publicos. La columna de datos reales agrupa 251 usuarias de Creighton (validacion cruzada de 5 particiones, de modo que ninguna usuaria se usa a la vez para ajuste y evaluacion) y 113 usuarias de Marquette (evaluadas fuera de distribucion). Los resultados no estan verificados de forma independiente.

| Metodo | Usuarios simulados (539) | Usuarios reales, agrupados (364) |
|---|---:|---:|
| aadya-m1-mini | 2,906 | 1,932 |
| aadya-m1 (256M) | 2,925 | 1,930 |
| Referencia bayesiana clasica | no disponible | 1,952 |
| Heuristica de mediana movil | no disponible | 2,354 |

Diferencias pareadas declaradas por el autor: frente a aadya-m1 en datos reales, +0,003 (intervalo [-0,005, +0,011]); frente a la referencia bayesiana, -0,019 ([-0,038, -0,003]); en simulados frente a aadya-m1, -0,018 ([-0,033, -0,004]). En la tabla de la model card la comparacion de simulados frente a la referencia bayesiana queda truncada en la informacion disponible. El autor situa la mini aproximadamente un 18 % por debajo de la heuristica en datos reales. No se publican resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision de 32 bits (836.093 parametros x 4 bytes = unos 3,3 MB de pesos) mas las activaciones, que son despreciables con 4 capas de tamano oculto 128. Cabe en cualquier GPU y en memoria de sistema de cualquier dispositivo actual.
- GPU recomendadas: no necesita GPU. Se ejecuta en CPU. No se declaran recomendaciones de A100, H100 o RTX 4090, y serian desproporcionadas para este tamano.
- Cabe en GPU de consumo: si, en cualquiera; tambien en CPU de portatil, moviles y navegador.
- Opciones de despliegue: la libreria declarada es aadya-neural, con pesos en safetensors. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. El autor publica un espacio de demostracion en Hugging Face.
- Latencia y throughput estimados: no disponible. No se publican medidas de latencia ni de tokens por segundo (no aplica la metrica de tokens).
- Almacenamiento: 3,4 MB de pesos; el tamano del repositorio figura como 0,0 GB en los metadatos de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | Contexto o entrada | CRPS en 364 usuarios reales (menor es mejor) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| aadya-m1-mini | 0,84M | 3,4 MB | Secuencia de ciclos previos, dias desde el ultimo periodo, edad y test de ovulacion opcionales | 1,932 | Apache-2.0 | Hugging Face, demo en Spaces |
| aadya-m1 | 256M | aprox. 1 GB | Misma entrada | 1,930 | Apache-2.0 | Hugging Face, demo en Spaces |
| Referencia bayesiana clasica | no disponible | no disponible | no disponible | 1,952 | no disponible | citada en la model card |
| Heuristica de mediana movil | no disponible | no disponible | no disponible | 2,354 | no disponible | uso comun en aplicaciones de seguimiento |

En la busqueda web solo aparece otro modelo con la etiqueta de forecasting de series temporales, LG-AI-Research/EXAONE-Forecast-for-Demand-1.0, pero pertenece a prediccion de demanda y no es comparable en tarea ni en dominio. No se han identificado otros modelos abiertos equivalentes para prediccion de ciclos menstruales en la informacion disponible.

## Limitaciones y advertencias

- Entrenado solo con usuarios sinteticos: ninguna persona real participo en el entrenamiento, lo que limita la representatividad de patrones fisiologicos reales y puede introducir sesgos del generador sintetico.
- Evaluacion con datos fuera de distribucion: las 113 usuarias de Marquette se puntuan fuera de distribucion, lo que puede penalizar o favorecer el resultado segun el caso y no equivale a un rendimiento en produccion.
- Benchmarks no verificados: los valores del model-index tienen verified = false y proceden del propio autor. No hay replicacion independiente.
- Riesgo de inferencia inadecuada: es un modelo estadistico, no un dispositivo medico. No sirve como metodo anticonceptivo ni para diagnostico, y no deberia presentarse al usuario como tal.
- Resolucion de salida acotada: la distribucion cubre duraciones de 1 a 120 dias; los ciclos fuera de ese rango no se representan.
- Idiomas y lenguaje natural: no soporta texto ni conversacion; no puede usarse como asistente ni como chatbot.
- Contexto: no se declara una longitud maxima de historial de ciclos, lo que dificulta planificar el truncado en produccion.
- Cuantizaciones: no se documentan variantes cuantizadas ni formatos GGUF/ONNX, de modo que la integracion depende de la libreria aadya-neural.
- Madurez: 4 descargas y 2 likes, creado el 7 de octubre de 2026; muy poca adopcion y ausencia de ecosistema de terceros.
- Licencia: Apache-2.0 permite uso comercial, pero el tratamiento de datos de salud impone obligaciones adicionales (por ejemplo, RGPD en la Union Europea) que el modelo no resuelve por si mismo.
- Rendimiento declarado equivalente al de aadya-m1 en datos reales: no hay ganancia de calidad por usar la version pequena, solo ventajas de tamano y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manasdutta04/aadya-m1-mini
- Demo interactiva (Spaces): https://huggingface.co/spaces/manasdutta04/aadya-m1-mini-try
- Modelo grande aadya-m1: https://huggingface.co/manasdutta04/aadya-m1
- Demo de aadya-m1: https://huggingface.co/spaces/manasdutta04/aadya-m1-try
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23183873
- Repositorio en GitHub: https://github.com/manasdutta04/aadya
- Banner del modelo: https://huggingface.co/manasdutta04/aadya-m1-mini/resolve/main/assets/banner.png
- Figura del estudio de escalado: https://huggingface.co/manasdutta04/aadya-m1-mini/resolve/main/assets/fig_scaling.png
- Listado de modelos de series temporales en Hugging Face (resultado de busqueda): https://huggingface.co/models?other=time-series
