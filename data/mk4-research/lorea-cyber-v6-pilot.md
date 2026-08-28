# MK4-Research/LOREA-cyber-v6-pilot

## Resumen

LOREA-cyber-v6-pilot es un modelo de generacion de texto especializado en revision de codigo y analisis de vulnerabilidades, desarrollado por MK4-Research. Se trata de un ajuste fino mediante LoRA sobre el modelo base `mlx-community/Qwen3.8-27B-4bit`, con el adaptador fusionado y cuantizado a 4 bits en formato MLX, pensado para ejecutarse en hardware Apple Silicon. El modelo esta disenado para revisar codigo fuente y senalar problemas de seguridad con una tasa de falsos positivos muy baja, priorizando la precision sobre la exhaustividad.

Aunque el nombre del modelo base sugiere 27 mil millones de parametros, los pesos reales en safetensors suman 4.204.731.904 parametros (aproximadamente 4,2 mil millones), una discrepancia que el autor no explica en la documentacion. El modelo se presenta como "piloto" porque el experimento para el que fue construido esta a medio terminar y la evaluacion realizada es demasiado pequena para extraer conclusiones definitivas. Su relevancia radica en que aborda un problema critico en herramientas de analisis de seguridad: el exceso de falsos positivos que satura a los desarrolladores. LOREA-cyber-v6-pilot reduce drasticamente ese ruido, aunque a costa de encontrar menos vulnerabilidades que el modelo base sin ajustar.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo esta disponible en Hugging Face con los datos de evaluacion y los scripts de revision incluidos en el repositorio, lo que facilita su auditoria y reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, aunque los pesos reales indican 4,2B parametros) |
| Parametros totales | 4.204.731.904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3.8-27B-4bit`, una cuantizacion 4-bit del modelo Qwen3.8-27B en formato MLX. Sobre esta base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) orientado a la tarea de revision de seguridad en codigo. El adaptador LoRA fue fusionado con los pesos del modelo base, de modo que no se necesita cargar ningun adaptador adicional en inferencia. El resultado se exporto en 4-bit MLX, optimizado para Apple Silicon.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni el metodo de alineacion (RLHF, DPO, etc.). El autor indica que el modelo es deliberadamente mas debil que su base sin ajustar: gasta menos tokens por respuesta y es mas cauto a la hora de afirmar que existe una vulnerabilidad. Esta caracteristica se consiguio probablemente mediante un ajuste fino con ejemplos negativos y positivos de codigo seguro e inseguro, aunque no se especifica el procedimiento exacto.

Una innovacion destacable es el enfasis en la honestidad del modelo: segun la evaluacion, rara vez inventa vulnerabilidades en codigo correcto. Esto se logra a costa de una menor tasa de deteccion de bugs reales, un equilibrio que el autor documenta de forma transparente con intervalos de confianza.

## Capacidades

- Revision de codigo fuente para identificar vulnerabilidades de seguridad (inyeccion SQL, path traversal, comandos inseguros, etc.).
- Analisis de codigo correcto sin generar falsos positivos: en la evaluacion sobre 65 ejemplos de codigo correcto, solo afirmo un bug en dos casos (3,1%).
- Razonamiento sobre mecanismos de seguridad criptograficos: distingue correctamente entre colision de hash y seguridad de HMAC, demostrando comprension conceptual y no asociacion de patrones.
- Uso en bucles de agente: en la prueba con un servicio Flask de seis archivos, el modelo leyo cada archivo exactamente una vez, no abrio archivos irrelevantes y no retiro ninguna afirmacion posteriormente.
- Generacion de texto conversacional en ingles.
- Capacidad de revision de codigo real no visto durante el entrenamiento: en una pasada sobre la libreria `itsdangerous` (1.176 lineas, ocho archivos), no encontro vulnerabilidades criticas y no invento ninguna.

## Casos de uso

- Auditoria de seguridad en repositorios: el modelo puede revisar un codigo base completo y producir un informe de vulnerabilidades con explicaciones de impacto y posibles correcciones. Es adecuado para equipos que necesitan una primera pasada automatizada antes de una revision humana.
- Revision de pull requests en CI/CD: integrado en un pipeline, puede analizar los cambios propuestos y bloquear la fusion si detecta problemas de seguridad graves, reduciendo el ruido que generan otras herramientas.
- Analisis de dependencias y librerias de terceros: al poder revisar codigo que no ha visto antes, es util para evaluar el riesgo de incorporar una libreria externa al proyecto.
- Educacion en seguridad ofensiva y defensiva: el modelo explica por que un fragmento de codigo es vulnerable o seguro, lo que sirve como material didactico para desarrolladores junior.
- Revision de codigo en entornos con recursos limitados: al estar cuantizado en 4-bit MLX, puede ejecutarse en un Mac con 32 GB de RAM sin necesidad de GPU dedicada, como demuestra la evaluacion del autor.
- Prefiltrado de alertas en herramientas SAST: el modelo puede actuar como un segundo nivel que descarta falsos positivos generados por analizadores estaticos tradicionales, dejando solo las alertas mas plausibles para revision manual.

## Benchmarks y rendimiento

La evaluacion principal del autor consiste en 104 items con un bug plantado y 65 items de codigo correcto, con decodificacion greedy, thinking desactivado y el prompt de sistema incluido en el repositorio. Los resultados se presentan con intervalos de confianza de Wilson al 95%:

| Metrica | Valor | Intervalo 95% |
|---|---|---|
| Bugs plantados encontrados (n=104) | 86,5% (90/104) | 78,7 - 91,8 |
| Credito completo: bug, impacto y correccion | 64,4% (67/104) | 54,9 - 73,0 |
| Distraido por ruido no relacionado con seguridad | 0,0% (0/104) | 0,0 - 3,6 |
| Falsos positivos en codigo correcto (n=65) | 3,1% (2/65) | 0,8 - 10,5 |
| Longitud mediana de respuesta | 82 tokens | - |

Ademas, en una prueba cualitativa sobre un servicio Flask de 510 lineas con doce defectos plantados y diez implementaciones correctas, el modelo encontro 9 de los 10 defectos puntuables y no genero ningun falso positivo. En la revision de la libreria `itsdangerous` (commit `672971d`), concluyo que no habia vulnerabilidades criticas y no invento hallazgos.

El autor advierte que estas cifras son anecdoticas con intervalos amplios y que se necesita una evaluacion con un conjunto de CVEs retenidos para estimar la frecuencia real de deteccion y falsos positivos.

## Requisitos de hardware

- La evaluacion se realizo en una maquina Apple Silicon con 32 GB de RAM (M-series), completando la revision de un proyecto de seis archivos en 11 minutos 43 segundos.
- Al ser un modelo MLX 4-bit, esta optimizado para Apple Silicon (M1, M2, M3 y superiores). No hay indicaciones de soporte para CUDA o ROCm.
- El tamano del repositorio es de 15,2 GB, que incluye los pesos del modelo y los archivos de evaluacion (fixtures, transcripciones, etc.). Los pesos del modelo en si, con 4,2 mil millones de parametros en 4-bit, ocupan aproximadamente 2,1 GB, aunque no se ha confirmado este dato.
- Para inferencia, se recomienda usar la libreria MLX de Apple. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el formato MLX es especifico de Apple.
- No se proporcionan datos de latencia ni throughput mas alla del tiempo total de la ejecucion de evaluacion.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de revision de seguridad en la informacion proporcionada. El autor menciona que el modelo base sin ajustar (Qwen3.8-27B) encuentra mas bugs pero genera muchos mas falsos positivos, y que esta version v6-pilot es un equilibrio deliberado. Tambien existe una version anterior, LOREA-cyber-v5.9, que segun los tags es un modelo de mezcla de expertos (MoE), pero no se proporcionan resultados comparativos. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo es mas debil que su base sin ajustar: gasta menos tokens por respuesta y puede omitir vulnerabilidades que el modelo base detectaria. Si se prioriza la exhaustividad sobre la precision, el base es mejor opcion.
- La evaluacion es pequena (169 items) y los intervalos de confianza son amplios. Por ejemplo, la tasa de falsos positivos del 3,1% podria ser en realidad del 10% o del 1%.
- El autor corrigio el 2026-08-28 un defecto en el grader que inflaba los resultados del modelo. Las cifras actuales son las corregidas, pero la correccion reduce la confianza en la metodologia inicial.
- No se ha evaluado el modelo en codigo con vulnerabilidades reales desconocidas; la prueba con `itsdangerous` es codigo bien auditado y no demuestra capacidad para encontrar bugs sutiles en produccion.
- El modelo solo soporta ingles. No hay indicios de soporte multilingue.
- La longitud de contexto no esta documentada; se desconoce si puede manejar archivos muy grandes o multiples archivos en una sola pasada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es un "piloto" y el autor advierte que aun esta en desarrollo; no se recomienda su uso en produccion sin una validacion adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MK4-Research/LOREA-cyber-v6-pilot)
- [Version anterior LOREA-cyber-v5.9](https://huggingface.co/MK4-Research/LOREA-cyber-v5.9)
