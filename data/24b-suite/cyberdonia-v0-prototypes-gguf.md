# 24B-Suite/Cyberdonia-v0-Prototypes-GGUF

## Resumen

Cyberdonia v0 Prototypes GGUF es un repositorio de pesos en formato GGUF publicado por el usuario 24B-Suite en HuggingFace. Segun la model card, se trata de una nueva prueba de merge de variantes del modelo Cydonia, distribuida como lanzamiento temprano para testers alpha. El autor indica explicitamente que aun no ha tenido tiempo de probar los modelos ni de medir sus niveles de rechazo, y que una comparacion mas profunda esta planificada a traves de Q0 Bench.

El repositorio agrupa varios prototipos. Los primeros siete son merges de tipo "della" segun la propia descripcion. En el momento de la publicacion solo esta disponible la cuantizacion Q8_0. La model card incluye una estimacion no confirmada sobre niveles de censura: los prototipos v2, v5, v6 y v7 se predicen como los menos censurados, mientras que v1, v3 y v4 podrian presentar mas rechazos.

La relevancia de esta ficha es limitada por la escasez de documentacion: no se declaran arquitectura, numero de parametros, contexto, idiomas, licencia ni datos de entrenamiento. Se trata, por tanto, de un artefacto de investigacion temprana orientado a la comunidad de merges, no de un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que son merges de variantes de Cydonia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unico formato disponible en el momento de la publicacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura subyacente. La model card unicamente indica que se trata de una "nueva prueba de merge de variantes de Cydonia" y que los siete primeros prototipos corresponden a merges de tipo "della". No se especifica la tecnica de merge exacta (por ejemplo, SLERP, TIES, DARE o model stock), ni los modelos de origen, ni los pesos relativos aplicados.

Tampoco se aportan datos sobre el entrenamiento: no hay numero de tokens, composicion del dataset, ni indicios de fases de RLHF, DPO u otras tecnicas de alineacion posteriores. El autor menciona que aun no ha medido los niveles de rechazo de estos prototipos, lo que sugiere que el comportamiento de alineacion heredado de los modelos base es incierto.

## Capacidades

- Generacion de texto: no documentada explicitamente, pero es la funcion esperada de un modelo de lenguaje publicado en formato GGUF.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking", vision o audio: no disponible.
- Comportamiento de rechazo: el autor anticipa diferencias entre prototipos (v2, v5, v6 y v7 con menor censura estimada; v1, v3 y v4 con potencialmente mas rechazos), pero se trata de una prediccion no confirmada.

Dado que la model card no documenta ninguna capacidad concreta, no es posible afirmar que el modelo soporte funciones mas alla de la generacion de texto generica propia de su familia base.

## Casos de uso

Los siguientes escenarios se plantean de forma condicional, dado que las capacidades del modelo no estan documentadas. Se basan en el proposito declarado de la publicacion (testeo de merges para la comunidad) y en el comportamiento tipico de modelos de texto en formato GGUF.

- Evaluacion de merges por parte de testers alpha: el repositorio esta pensado explicitamente para que testers tempranos comparen los distintos prototipos (v1 a v7) y determinen que combinacion de variantes de Cydonia ofrece un comportamiento mas util antes de la comparacion formal con Q0 Bench.
- Investigacion sobre alineacion y niveles de rechazo: dado que el autor predice diferencias de censura entre prototipos, el modelo puede emplearse en experimentos de red teaming y analisis de como distintos merges afectan a la tasa de rechazo.
- Inferencia local offline: al distribuirse en GGUF, el modelo esta pensado para ejecutarse en hardware de consumo mediante runners como llama.cpp u Ollama, lo que permite prototipado sin depender de APIs externas.
- Generacion de texto creativo y conversacional: es el uso habitual de la familia de modelos sobre la que se construye, aunque no hay confirmacion de calidad ni de idiomas soportados.
- Prototipado rapido de aplicaciones de chat: un unico archivo Q8_0 permite levantar un servidor de inferencia local para validar interfaces de usuario antes de invertir en modelos mayores.
- Base para experimentos de cuantizacion: al existir solo Q8_0, el repositorio sirve como punto de partida para que la comunidad genere cuantizaciones menores (Q4_K_M, Q5_K_M, etc.) y evaluar la degradacion resultante.

Cualquier uso en produccion queda condicionado a la verificacion previa de licencia, idiomas y calidad, datos que no estan disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que aun no ha probado los modelos ni medido sus niveles de rechazo, y que la comparacion mediante Q0 Bench esta planificada pero no ejecutada en el momento de la publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no declararse el numero de parametros, no es posible calcular el consumo. Como referencia general, una cuantizacion Q8_0 suele requerir aproximadamente 1 byte por parametro mas el overhead de contexto y del runtime, por lo que un modelo de 7B rondaria los 7-8 GB y uno de 13B los 13-14 GB en Q8_0, pero estos valores son genericos y no se pueden atribuir a este repositorio.
- GPU recomendadas: no disponible por falta de datos de tamano.
- Compatibilidad con GPU de consumo: no determinable sin conocer el numero de parametros. Si el modelo base estuviera en el rango de 7B a 13B, Q8_0 podria caber en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080), pero no hay confirmacion.
- Opciones de despliegue: al tratarse de GGUF, los runners habituales son llama.cpp, Ollama, LM Studio y servidores compatibles con llama.cpp. No se ha confirmado compatibilidad con vLLM ni TGI, que suelen requerir pesos en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La model card no identifica los modelos base ni ofrece datos que permitan comparar parametros, contexto o rendimiento con alternativas concretas. El unico punto de referencia mencionado es la propia familia Cydonia, de la que no se aportan especificaciones en la informacion disponible.

## Limitaciones y advertencias

- Modelo sin validar: el autor declara explicitamente que no ha probado los prototipos ni medido sus niveles de rechazo.
- Estimaciones de censura no confirmadas: la clasificacion de prototipos segun menor o mayor censura es una prediccion aproximada, no un resultado medido.
- Licencia desconocida: al no declararse licencia, se desconoce si el uso comercial esta permitido. No deberia utilizarse en produccion sin aclarar este punto.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y no evaluado en esta publicacion.
- Sesgos: no documentados ni medidos.
- Disponibilidad limitada: solo esta publicado el formato GGUF Q8_0, lo que restringe el despliegue en entornos que requieren safetensors o cuantizaciones mas ligeras.
- Naturaleza experimental: es un lanzamiento alpha dirigido a testers, con posible sustitucion o retirada de variantes.
- Falta de trazabilidad: no se detallan los modelos de origen ni la tecnica de merge, lo que dificulta reproducir o auditar los resultados.
- Ausencia de benchmarks: no hay datos objetivos de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).

## Enlaces

- HuggingFace: https://huggingface.co/24B-Suite/Cyberdonia-v0-Prototypes-GGUF
- Imagen de portada referenciada en la model card: https://cdn-uploads.huggingface.co/production/uploads/68e840caa318194c44ec2a04/C72JHHGDBHewR_kI9lxi6.png
