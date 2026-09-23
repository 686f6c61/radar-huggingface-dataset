# MANGSEOK123/qwen3-4b-tau2-telecom_u025-1ep

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123, orientado especificamente al dominio de telecomunicaciones del benchmark tau2-bench. El autor lo describe como una consolidacion mediante OEL (experience distillation) sobre 47 pares tarea-memoria del conjunto U025. No se trata de un entrenamiento con refuerzo ni de un modelo nuevo desde cero, sino de la destilacion de comportamiento de un profesor que comparte los mismos pesos que el alumno pero recibe la memoria de la tarea en el prompt de sistema.

El problema que aborda es el de los agentes conversacionales con soporte de herramientas en entornos de atencion al cliente de telefonia, donde el modelo debe seguir procedimientos operativos y resolver tareas multi-paso. Es relevante ahora porque forma parte de una familia de experimentos de destilacion de experiencia (OEL) aplicados a tau2-bench, y porque se apoya en un modelo base pequeno y eficiente (4B) que cabe en hardware de consumo.

Con 4.411.424.256 parametros reales (segun safetensors), licencia Apache 2.0 y pesos en safetensors, el modelo esta pensado para desplegarse mediante vLLM con soporte de tool calling. El autor indica explicitamente que el modelo no fue evaluado tras el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Longitud de contexto | no disponible en la ficha del autor (el ejemplo de despliegue usa `--max-model-len 40960`) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se listan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.4 mil millones de parametros, con soporte nativo de tool calling y de plantilla de chat tipo Hermes (segun el ejemplo de despliegue con `--tool-call-parser hermes`). Este modelo no introduce cambios estructurales respecto al base: es un ajuste fino de pesos.

El entrenamiento se realizo con un esquema de destilacion por KL sobre el dominio telecom de tau2-bench, usando 47 pares tarea-memoria del conjunto U025. Los hiperparametros declarados son: batch size 12, 1 epoca, learning rate constante de 3e-6, gradient clipping 1.0 (valor por defecto de verl) y una perdida KL completa sobre todos los tokens de respuesta con `kl_topk` de 256. El alumno reproduce cada tarea sin memoria, mientras que el profesor son los mismos pesos con la memoria de esa tarea insertada en el prompt de sistema; por tanto, la unica diferencia entre ambos es el prompt y no se emplea ninguna recompensa. El simulador de usuario fue gpt-4.1-mini con temperatura 0.

La tabla de entrenamiento publicada muestra cuatro pasos con valores de KL loss de 0,043 / 0,024 / 0,023 / 0,010, entropia de 0,107 / 0,169 / 0,146 / 0,572 y grad norm de 4,241 / 34,973 / 4,355 / 0,952. El propio autor advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del batch y no una convergencia real.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling, con parser de herramientas Hermes en vLLM (`--enable-auto-tool-choice --tool-call-parser hermes`).
- Ejecucion de tareas multi-paso en dominios de agente, especificamente en el escenario telecom de tau2-bench.
- Capacidad de seguir procedimientos operativos cuando se le proporciona contexto tipo memoria en el prompt de sistema (comportamiento destilado del profesor).
- Gestion de conversaciones de varios turnos con un simulador de usuario, segun el protocolo de tau2-bench.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Qwen3 se presenta como multilingue, pero no se documenta para este fine-tune).
- Capacidades de vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente de telefonia: el modelo puede gestionar conversaciones multi-turno con herramientas para consultar planes, facturas o incidencias, apoyandose en el ajuste especifico sobre el dominio telecom de tau2-bench.
- Agentes de resolucion de incidencias tecnicas: encaja en flujos donde el agente debe encadenar varios pasos (identificar el problema, consultar el sistema, aplicar una accion) mediante tool calling.
- Automatizacion de procesos de operador con contexto largo: el ejemplo de despliegue admite ventanas de hasta 40.960 tokens, suficiente para arrastrar el historial de una tarea y la documentacion de procedimiento.
- Investigacion en destilacion de experiencia (OEL): sirve como caso reproducible para estudiar como se transfiere conocimiento de memoria a pesos mediante perdida KL sin recompensa.
- Evaluacion comparativa en tau2-bench: util como punto de partida para medir el efecto de OEL frente al modelo base en el split telecom.
- Despliegue on-premise en infraestructura modesta: al ser un modelo de 4B, puede ejecutarse en una sola GPU para prototipos internos de soporte, evitando costes de API.
- Generacion de datos sinteticos de dialogo telecom: puede usarse para producir trayectorias de agente que luego alimenten otros entrenamientos o pruebas de regresion.

## Benchmarks y rendimiento

El autor indica que el modelo **no fue evaluado**; se subio inmediatamente despues del entrenamiento. Como referencia, se aporta la puntuacion del modelo base en el split de test de tau2-bench telecom:

| Modelo | avg | pass@4 |
|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 0,056 | 0,175 |
| qwen3-4b-tau2-telecom_u025-1ep (este modelo) | no evaluado | no evaluado |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (4,41B parametros):
  - bf16/fp16: aproximadamente 8,8-10 GB de pesos; con cache KV y activaciones, en torno a 12 GB.
  - int8: aproximadamente 4,4-5 GB de pesos; en torno a 7-8 GB con overhead.
  - int4: aproximadamente 2,2-3 GB de pesos; en torno a 4-5 GB con overhead.
- GPU recomendadas: A100, H100, L40S para servicio en produccion; RTX 4090 o RTX 3090 (24 GB) para uso comodo en bf16.
- Cabe en GPU de consumo: si. En bf16 es holgado en RTX 4090/3090/4080 (16 GB) y ajustado en RTX 3060 12 GB con contexto reducido; en int4 puede caber en tarjetas de 8 GB.
- Opciones de despliegue: vLLM (el autor proporciona el comando), y previsiblemente llama.cpp, Ollama, TGI o SGLang al tratarse de pesos safetensors de un modelo Qwen3; estas alternativas no se confirman en la ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio / objetivo | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| qwen3-4b-tau2-telecom_u025-1ep | 4,41B | Fine-tune tau2-bench telecom (OEL, U025) | no disponible | apache-2.0 | Publicado, no evaluado |
| Qwen3-4B-Instruct-2507 (base) | 4B (aprox.) | Modelo generalista instruct | no disponible | apache-2.0 | Referencia, avg 0,056 / pass@4 0,175 en telecom |
| MANGSEOK123/Qwen3-4B-OEL-airline-tau2 | no disponible | Fine-tune OEL del dominio airline de tau2-bench | no disponible | no disponible | Publicado por el mismo autor |
| MANGSEOK123/qwen3-4b-tau2-telecom-compsub-1ep | no disponible | Variante de ajuste sobre telecom | no disponible | no disponible | Publicado por el mismo autor |

Los datos de los modelos comparables de MANGSEOK123 no se detallan en la informacion proporcionada mas alla de su existencia y su enfoque.

## Limitaciones y advertencias

- El modelo no ha sido evaluado tras el entrenamiento, por lo que no hay evidencia publicada de mejora sobre el base.
- El ajuste se hizo con solo 47 pares tarea-memoria y 1 epoca, lo que limita la cobertura y favorece el sobreajuste al conjunto U025.
- La destilacion no usa recompensa; la perdida KL puede optimizar la imitacion del profesor sin garantizar mejoras en la tarea final.
- El autor advierte que la tabla de perdidas no refleja convergencia, ya que cada paso usa un batch distinto.
- Es un modelo especializado en el dominio telecom de tau2-bench; su rendimiento fuera de ese escenario no esta documentado.
- Riesgo de alucinacion inherente a los modelos de 4B en tareas de agente con herramientas; conviene validar las acciones antes de ejecutarlas en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada; pueden heredarse del modelo base.
- Idiomas soportados: no documentados para este fine-tune.
- Licencia apache-2.0, que en principio permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_u025-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
- Modelo relacionado (telecom compsub): https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom-compsub-1ep
- Modelo relacionado (airline tau2): https://huggingface.co/MANGSEOK123/Qwen3-4B-OEL-airline-tau2
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
