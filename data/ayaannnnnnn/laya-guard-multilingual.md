# Ayaannnnnnn/laya-guard-multilingual

## Resumen

laya-guard-multilingual es un ajuste fino (fine-tune) del checkpoint multilingue del modelo Laya, desarrollado por ConvAI Innovations y publicado bajo licencia Apache-2.0. El ajuste lo firma el usuario Ayaannnnnnn y esta disenado especificamente para integrarse en laya-guard, una herramienta local que intercepta cada comando de shell o llamada a herramienta que un agente de codigo pretende ejecutar y lo clasifica en una de tres categorias: permitir, revisar (preguntar al usuario) o bloquear.

El modelo resuelve un problema concreto de seguridad en entornos de agentes autonomos: evitar que un agente ejecute comandos destructivos, exfiltre secretos o ejecute acciones no deseadas sin supervision. Para ello se ha entrenado con aproximadamente 1.300 filas de comandos de shell etiquetados segun una guia escrita, incluyendo ejemplos de comandos destructivos, exfiltracion de datos, comandos de Windows, secretos impresos o enviados, y peticiones en coreano e ingles.

Con 321.908.998 parametros totales y un tamano de repositorio de 0,7 GB, es un modelo compacto orientado a inferencia local en CPU, lo que lo hace adecuado para su uso como guardrail ligero en estaciones de trabajo de desarrolladores sin necesidad de GPU dedicada. Su relevancia actual radica en la creciente adopcion de agentes de codigo que ejecutan comandos de forma autonoma y la necesidad de mecanismos de control deterministas y auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune del checkpoint multilingue de Laya; arquitectura del modelo base no especificada en la informacion) |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint multilingue de Laya (carpeta `multilingual`) de ConvAI Innovations, distribuido bajo Apache-2.0. No se especifica en la informacion disponible la arquitectura interna del modelo base (transformer, MoE, SSM u otra), ni el numero de tokens de entrenamiento original, ni si hubo RLHF o DPO en la fase base. El ajuste se realizo con la herramienta `laya-train` (version 0.4.3 de laya) sobre una GPU Colab T4, durante 4 epocas, con 68 actualizaciones del optimizador y semilla 0.

Los datos de entrenamiento consisten en aproximadamente 1.300 filas. Los comandos de shell provienen exclusivamente de sesiones personales del autor con agentes de codigo (excluyendo sesiones de trabajo), con rutas de home, tokens, correos electronicos y cadenas opacas largas enmascaradas, y etiquetados contra una guia escrita. Se anadieron ejemplos escritos de comandos destructivos y de exfiltracion, comandos de Windows, secretos impresos o enviados, dano oculto tras un comentario, herramientas instruidas para ejecutar otra cosa, y peticiones en coreano e ingles. Se descarto cualquier caso que copiara o se pareciera estrechamente (similitud >= 0,85) a un caso del benchmark, conjuntos de evaluacion o fixtures de test de laya-guard. Las filas de revision y bloqueo se repitieron dos veces en el split de entrenamiento. Los datos no se publican.

## Capacidades

- Clasificacion de comandos de shell y llamadas a herramientas en tres acciones: `allow`, `review` (preguntar al usuario) y `block`.
- Deteccion de comandos destructivos (por ejemplo, borrado de archivos o directorios).
- Deteccion de exfiltracion de datos (secretos impresos, enviados o incluidos en peticiones).
- Deteccion de comandos de Windows ademas de comandos de shell tipo Unix.
- Deteccion de dano oculto tras comentarios en el comando.
- Deteccion de herramientas instruidas para ejecutar algo distinto de lo aparente.
- Soporte de peticiones en ingles y coreano.
- Capacidad multilingue limitada a los dos idiomas indicados (en, ko).
- No se documenta soporte de tool calling generico, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Guardrail local para agentes de codigo en estaciones de trabajo: el modelo se carga por defecto en laya-guard a partir de su proxima release y clasifica cada comando que el agente pretende ejecutar antes de que se ejecute, permitiendo bloquear acciones destructivas sin intervencion humana.
- Revision de comandos en entornos de desarrollo con agentes autonomos tipo Claude Code: laya-guard ejecuta primero sus reglas y convierte un bloqueo solo del modelo en una pregunta al usuario, de modo que el modelo actua como segunda capa de decision sobre comandos ambiguos.
- Deteccion de exfiltracion de secretos en pipelines de agentes: el modelo identifica comandos que imprimen o envian tokens, claves o correos, y los marca para revision o bloqueo antes de que se ejecuten.
- Supervision de comandos en Windows dentro de flujos de agentes: gracias a los ejemplos de comandos de Windows en el entrenamiento, puede clasificar comandos nativos de ese sistema operativo que un agente proponga ejecutar.
- Filtrado de peticiones en coreano e ingles en equipos multilingues: el modelo mantiene el rendimiento en coreano (27/30 en el conjunto coreano solo con el modelo) y mejora sustancialmente en ingles, lo que permite desplegarlo en equipos con ambos idiomas.
- Inferencia en CPU sin GPU dedicada: con 321,9 millones de parametros y un repositorio de 0,7 GB, puede ejecutarse en CPU (el ejemplo de la model card usa `device="cpu"`), lo que facilita su despliegue en portatiles de desarrolladores sin acelerador hardware.
- Capa de seguridad en pipelines de CI/CD para agentes: puede integrarse como paso de validacion que revisa los comandos que un agente genera antes de ejecutarlos en un entorno de integracion, bloqueando acciones destructivas o de exfiltracion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos nunca usados en entrenamiento (benchmark y conjuntos de evaluacion de laya-guard), comparando el modelo base con este fine-tune, a traves del juicio propio de laya-guard (`ask=True`, como para Claude Code):

| Metrica | Base | Este modelo |
|---|---|---|
| Solo modelo: ataques contenidos (43) | 32 | 39 |
| Solo modelo: comandos cotidianos permitidos (50) | 25 | 44 |
| Solo modelo: conjunto de shell de evaluacion (71) | 42 | 61 |
| Solo modelo: conjunto coreano (30) | 27 | 27 |
| laya-guard extremo a extremo: ataques contenidos (43) | 41 | 42 |
| laya-guard extremo a extremo: cotidianos permitidos (50) | 46 | 48 |
| laya-guard extremo a extremo: conjunto de shell de evaluacion (71) | 69 | 70 |
| laya-guard extremo a extremo: conjunto coreano (30) | 30 | 29 |

Ademas, en una porcion reservada de los datos de entrenamiento (162 filas, 76% allow), la precision paso de 0,611 a 0,852. De los 8 veredictos extremo a extremo que cambiaron, 6 mejoraron y 2 empeoraron: `chmod +x scripts/build.sh` y una peticion en coreano para resumir un issue ahora se preguntan en lugar de permitirse. El criterio de exito fijado antes del entrenamiento exigia ausencia de regresion extremo a extremo, por lo que este modelo incumple uno de los criterios; se adopto igualmente porque nada que debiera contenerse paso el filtro y muchos menos comandos ordinarios se preguntan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 321,9 millones de parametros, en fp32 ocuparia aproximadamente 1,3 GB de pesos, y en fp16 alrededor de 0,65 GB, mas overhead de activaciones y contexto.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una Colab T4. El ejemplo de uso de la model card emplea `device="cpu"`.
- Cabe en GPU consumer: si, por el tamano del modelo (321,9 millones de parametros); no se detallan modelos concretos.
- Opciones de despliegue: la model card muestra el uso mediante la libreria `laya` (version 0.4.3) con `Router(device="cpu", models={"multilingual": "Ayaannnnnnn/laya-guard-multilingual"})`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El unico punto de comparacion documentado es el modelo base Laya (checkpoint multilingue de ConvAI Innovations), cuyos resultados frente a este fine-tune se recogen en la seccion de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| laya-guard-multilingual | 321.908.998 | no disponible | Apache-2.0 | Hugging Face |
| Laya (base, checkpoint multilingue) | no disponible | no disponible | Apache-2.0 | Hugging Face (convaiinnovations/laya) |

## Limitaciones y advertencias

- El benchmark y los conjuntos de evaluacion fueron escritos por el autor de laya-guard y se consultaron entre ejecuciones de entrenamiento, por lo que son menos independientes que un conjunto de test nuevo.
- El modelo se entreno con los comandos de una sola persona y con ejemplos escritos; otros flujos de trabajo pueden comportarse de forma distinta.
- Un modelo por si solo no deberia tener la ultima palabra: laya-guard ejecuta primero sus reglas y convierte un bloqueo solo del modelo en una pregunta al usuario donde el agente puede consultar.
- El modelo esta entrenado para una unica pregunta (la que hace laya-guard: accion allow/review/block con sus instrucciones y criterios); otras preguntas obtienen como mucho el comportamiento del modelo base.
- Idiomas soportados limitados a ingles y coreano; no se documenta soporte de castellano ni de otros idiomas.
- En el conjunto coreano extremo a extremo se observa una ligera regresion (30 a 29) y dos veredictos empeoraron, lo que indica que el ajuste no es uniformemente mejor que el base en todos los casos.
- No se publican los datos de entrenamiento, lo que dificulta la auditoria independiente del sesgo y la cobertura.
- Licencia Apache-2.0, igual que el modelo base (© ConvAI Innovations); no se indican restricciones adicionales para uso comercial en la informacion disponible.
- Riesgo de alucinacion no cuantificado en la informacion disponible, aunque el uso previsto es una clasificacion acotada a tres etiquetas.

## Enlaces

- Hugging Face: https://huggingface.co/Ayaannnnnnn/laya-guard-multilingual
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio laya-guard: https://github.com/scs0209/laya-guard
- Herramientas de fine-tune: https://github.com/scs0209/laya-guard/tree/main/finetune
