# MANGSEOK123/qwen3-4b-tau2-retail_k2_posU-1ep

## Resumen

MANGSEOK123/qwen3-4b-tau2-retail_k2_posU-1ep es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 orientado exclusivamente al dominio *retail* del benchmark tau2-bench, que evalua agentes conversacionales de atencion al cliente en entornos de control dual (agente y usuario pueden invocar herramientas). El modelo lo publica el usuario MANGSEOK123 y su interes no esta en el rendimiento bruto, sino en el metodo: una destilacion tipo OEL (experience distillation) sobre 82 pares tarea-memoria, sin funcion de recompensa y con una perdida KL completa sobre todos los tokens de respuesta.

La innovacion metodologica es que profesor y alumno comparten exactamente los mismos pesos. La unica diferencia es el prompt: el profesor recibe en el system prompt la memoria asociada a la tarea resuelta, mientras que el alumno debe resolver la misma tarea sin esa memoria. El objetivo es internalizar la experiencia acumulada en los pesos en lugar de depender de un contexto externo, algo relevante para quien investiga destilacion de experiencias y agentes con tool calling en dominios acotados.

Se trata de un modelo denso de 4.411.424.256 parametros (4,41 mil millones) en formato safetensors, con licencia apache-2.0. El autor no publico ninguna evaluacion: el modelo se subio inmediatamente despues del entrenamiento, por lo que a dia de hoy no existe evidencia empirica de que mejore a su modelo base en el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (derivada de la familia Qwen3) |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible; el ejemplo de despliegue del autor fija `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 8,8 GB |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso decoder-only de 4,41 mil millones de parametros, sin mezcla de expertos ni componentes de estado recurrente. El ajuste no modifica la topologia, solo los pesos, de modo que el coste de inferencia y los requisitos de memoria son identicos a los del modelo base para la misma cuantizacion.

El entrenamiento se realizo con destilacion de experiencias sobre el dominio retail de tau2-bench: 82 pares de tarea y memoria, batch size 12, una sola epoca, learning rate constante de 3e-6, gradient clipping de 1.0 (valor por defecto de verl) y perdida KL completa sobre todos los tokens de respuesta con `kl_topk` de 256. El alumno reproduce cada tarea sin memoria y el profesor son los mismos pesos con la memoria de esa tarea insertada en el system prompt; no se emplea ninguna recompensa. El simulador de usuario fue gpt-4.1-mini con temperatura 0. Las trazas publicadas de las siete primeras iteraciones muestran perdidas KL entre 0,008 y 0,032 y normas de gradiente con picos de 12,502 en el paso 2 y 4,480 en el paso 6; el propio autor advierte que cada paso lee un lote distinto, de modo que la columna de perdida refleja la dificultad del lote y no la convergencia del entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles tecnicamente orientada a atencion al cliente del sector retail.
- Tool calling y function calling: el autor documenta el despliegue con `--enable-auto-tool-choice --tool-call-parser hermes`, lo que implica soporte del formato de llamada a herramientas tipo Hermes.
- Ejecucion de tareas de agente con control dual, es decir, escenarios en los que tanto el agente como el usuario pueden invocar herramientas y modificar el estado del sistema.
- Razonamiento multi-turno con seguimiento de reglas del dominio retail (politicas de devolucion, cambios, gestion de pedidos).
- Capacidad de operar sin memoria explicita en el system prompt, ya que el entrenamiento busca internalizar la experiencia destilada.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (*thinking*), vision, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de atencion al cliente en retail: el modelo esta ajustado especificamente para el dominio retail de tau2-bench, de modo que puede gestionar peticiones de devoluciones, cambios y seguimiento de pedidos invocando las herramientas del sistema con el parser Hermes.
- Backend de un asistente de comercio electronico con control dual: al haber sido entrenado en un entorno donde el usuario tambien puede ejecutar acciones sobre el estado compartido, encaja en flujos donde cliente y agente modifican simultaneamente el pedido o la cuenta.
- Banco de pruebas para investigacion en destilacion de experiencias: sirve como referencia reproducible del metodo OEL al publicarse los hiperparametros exactos y las trazas de entrenamiento de las siete primeras iteraciones.
- Evaluacion comparativa en tau2-bench retail: es un candidato directo para medir si la destilacion de 82 pares mejora el `avg 0.400 / pass@3 0.575` que el autor atribuye al modelo base en el split de test.
- Generacion de trayectorias sinteticas con tool calling: puede emplearse para producir conversaciones de atencion al cliente anotadas con llamadas a herramientas, utiles para ampliar datasets de entrenamiento o de evaluacion.
- Sustituto ligero de modelos mayores en prototipos: con 4,41 mil millones de parametros permite iterar rapidamente sobre disenos de prompt y esquemas de herramientas antes de escalar a un modelo de mayor tamano.
- Integracion en pipelines de agentes con vLLM: el comando de servicio publicado (`vllm serve ... --max-model-len 40960`) permite levantarlo como endpoint compatible con OpenAI y conectarlo a un orquestador de agentes.

## Benchmarks y rendimiento

El autor no evaluo este modelo: la model card indica explicitamente "**Not evaluated.** Pushed straight after training". El unico dato numerico disponible corresponde al modelo base:

| Modelo | Benchmark | Metrica | Resultado |
|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | tau2-bench retail, split de test | avg | 0,400 |
| Qwen3-4B-Instruct-2507 (base) | tau2-bench retail, split de test | pass@3 | 0,575 |
| MANGSEOK123/qwen3-4b-tau2-retail_k2_posU-1ep | tau2-bench retail | no evaluado | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: 4,41 mil millones, lo que equivale a unos 8,8 GB en bfloat16 o float16, coherente con el tamano del repositorio (8,8 GB).
- VRAM estimada en BF16/FP16: alrededor de 10-12 GB contando pesos y cache KV con contextos moderados.
- VRAM estimada en FP8: aproximadamente 5-6 GB; en cuantizacion de 4 bits, alrededor de 3-4 GB mas cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S y A10G para servicio concurrente; RTX 4090, RTX 3090 y RTX 4080 para uso individual.
- Cabe en GPU de consumo: si. En RTX 4090 (24 GB) sin cuantizar con margen amplio; en RTX 3060 (12 GB) o RTX 4070 en BF16 con contextos cortos, y comodamente con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM es la via documentada por el autor, con `--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. Tambien son viables SGLang y TGI al ser un transformer denso estandar de la familia Qwen3. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio de ajuste | Metodo | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail_k2_posU-1ep | 4,41 mil millones | tau2-bench retail | Destilacion OEL con KL, 82 pares, 1 epoca | apache-2.0 | No |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,41 mil millones | Generalista | Modelo base | apache-2.0 | avg 0,400 / pass@3 0,575 en tau2-bench retail |
| MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1 | no disponible | tau2-bench retail | Destilacion OEL | no disponible | no disponible |
| reinforcelabs/Qwen3-4B-Instruct-tau2-retail-grpo | no disponible | tau2-bench retail | GRPO | no disponible | no disponible |
| MANGSEOK123/Qwen3-4B-tau2-grpo-retail-2ep-lr1e6 | no disponible | tau2-bench retail (solo, no airline+retail) | GRPO, 2 epocas, lr 1e-6 | no disponible | no disponible |

Todas las alternativas comparten el mismo modelo base (Qwen3-4B-Instruct-2507) y el mismo dominio de evaluacion, por lo que la diferencia relevante es el algoritmo de ajuste: destilacion KL frente a GRPO.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor lo subio inmediatamente despues de entrenar, por lo que no hay ninguna evidencia de que supere al modelo base en tau2-bench retail ni en ninguna otra tarea.
- Dataset de entrenamiento muy reducido: 82 pares tarea-memoria y una sola epoca, lo que hace probable el sobreajuste al conjunto de tareas concreto y una generalizacion limitada a otros escenarios retail.
- Especializacion estrecha: el ajuste se limita al dominio retail de tau2-bench; se espera degradacion en dominios como airline u otros escenarios de atencion al cliente no representados.
- Riesgo de olvido catastrofico: al tratarse de un ajuste sobre 82 ejemplos, las capacidades generalistas del modelo base (codigo, matematicas, multilingue) pueden haberse deteriorado, aunque no se han publicado mediciones al respecto.
- Alucinacion en llamadas a herramientas: el modelo puede invocar funciones inexistentes o con argumentos invalidos, algo critico en un agente con control dual que modifica el estado del sistema.
- Idiomas soportados no documentados: no hay informacion sobre el comportamiento fuera del ingles.
- Longitud de contexto: no declarada para este ajuste. El ejemplo del autor fija 40960 tokens en vLLM, por debajo de lo que suele soportar la familia Qwen3; superar ese limite sin verificacion previa puede degradar la calidad.
- Formato de tool calling acoplado a Hermes: usar un parser distinto en el servidor puede romper la deteccion de llamadas a herramientas.
- Licencia apache-2.0: permite uso comercial y modificacion sin restricciones adicionales, pero no exime de las limitaciones tecnicas anteriores.
- Procedencia del ajuste: el autor es un usuario individual, sin proceso de revision ni validacion por pares; conviene tratar el modelo como experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail_k2_posU-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante OEL retail del mismo autor: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1
- Variante GRPO retail del mismo autor (via FriendliAI): https://friendli.ai/models/MANGSEOK123/Qwen3-4B-tau2-grpo-retail-2ep-lr1e6
- Variante GRPO retail de reinforcelabs: https://huggingface.co/reinforcelabs/Qwen3-4B-Instruct-tau2-retail-grpo
- Clasificacion del benchmark tau2 retail: https://llm-stats.com/benchmarks/tau2-retail
- Repositorio de la serie Qwen en GitHub: https://github.com/QwenLM/Qwen3.8
