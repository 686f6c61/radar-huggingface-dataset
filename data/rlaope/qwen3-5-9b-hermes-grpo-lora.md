# rlaope/Qwen3.5-9B-hermes-grpo-lora

## Resumen

Qwen3.5-9B-hermes-grpo-lora es un adaptador LoRA entrenado por rlaope sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (r=32, alpha=64) que se acoplan al modelo base para especializarlo en tareas de analisis de datos ejecutadas dentro de un harness de agente con tool calling. El entrenamiento emplea GRPO (Group Relative Policy Optimization) asincrono sobre rollouts reales generados por el propio modelo dentro del harness Hermes Agent, con una recompensa binaria basada unicamente en la correccion de la respuesta final.

El adaptador resuelve un problema concreto: mejorar la fiabilidad de un agente LLM en tareas de analisis de datos (cargar ficheros, inspeccionarlos, ejecutar codigo Python y responder con un valor unico) sin degradar su capacidad general como agente. Segun la model card, en 150 tareas retenidas de analisis de datos el pass@1 sube del 79,1% al 85,8% (+6,7 puntos, intervalo de confianza del 95% de ±4,3) y el numero de llamadas a herramientas por intento baja de 7,73 a 6,37 (−18%). En Terminal-Bench Lite Verified el pass@1 pasa del 28,0% al 33,7%, aunque el propio autor advierte que la mejora esta dentro del intervalo de confianza.

Es relevante porque demuestra un flujo de entrenamiento por RL sobre agentes reales (no sobre texto re-tokenizado) con infraestructura abierta (TRL, OpenEnv, Harbor, vLLM, Hermes Agent) y porque publica tanto los hiperparametros como las cifras de evaluacion con intervalos pareados, algo poco habitual en adaptadores de este tipo. El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3.5-9B; rango 32, alpha 64, dropout 0, aplicado a proyecciones de atencion, atencion lineal y MLP |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens (contexto usado en la evaluacion; el del modelo base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el adaptador se sirve en bfloat16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de 9B parametros del que la informacion disponible no detalla la composicion interna mas alla de que el adaptador cubre proyecciones de atencion, atencion lineal y MLP, lo que sugiere presencia de capas de atencion lineal en el modelo base. El LoRA usa rango 32, alpha 64 y dropout 0, con learning rate 1e-5. El repositorio solo contiene los pesos del adaptador (0,4 GB), no los del modelo base.

El entrenamiento es GRPO asincrono con el `HarnessAsyncGRPOTrainer` de TRL. Los rollouts los sirve vLLM con hot-swap de LoRA en vivo y un servidor Harbor de OpenEnv 0.7.0; Hermes Agent se usa sin modificar. Un proxy de captura entre Hermes y vLLM registra los token IDs y log-probs exactos muestreados, de modo que el entrenador aprende de lo que el modelo genero realmente y no de texto re-tokenizado. Se usaron 520 tareas de analisis de datos derivadas de jupyter-agent/jupyter-agent-dataset (niveles easy y medium, menos de 1000 filas), excluyendo las 150 tareas de evaluacion y cualquier tarea que compartiera dataset de Kaggle con ellas para evitar fuga de datos. La recompensa es 1 si la respuesta final es correcta y 0 en caso contrario, sin bonificacion ni penalizacion por uso de herramientas. Hiperparametros: 8 rollouts por tarea, maximo 17 turnos de agente, temperatura 1.0 durante el entrenamiento, 200 pasos de optimizador (unas 430 tareas distintas y unos 3400 rollouts). El entrenamiento se ejecuto en 2× RTX PRO 6000 Blackwell (96 GB), una para rollouts con vLLM y otra para el entrenador, durante unas 16 horas.

## Capacidades

- Generacion de texto conversacional y razonamiento dentro de un bucle de agente.
- Tool calling y function calling en formato compatible con OpenAI a traves de vLLM (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`).
- Ejecucion de codigo en sandbox (Python) para analisis de datos: carga e inspeccion de ficheros, computo y respuesta con un valor unico.
- Razonamiento multi-paso con hasta 17 turnos de agente en el entrenamiento y hasta 60 turnos en la evaluacion de Terminal-Bench.
- Analisis de datos tabulares orientado a respuestas de valor unico (single-answer).
- Capacidad general de agente de terminal, verificada (sin entrenamiento especifico) en Terminal-Bench Lite Verified.
- Soporte de modo de razonamiento mediante el parser `qwen3` en vLLM.
- Capacidades multilingues: solo ingles segun la model card.

## Casos de uso

- Analisis de datos automatizado sobre ficheros CSV o tabulares: el agente carga el fichero, lo inspecciona, ejecuta Python en sandbox y devuelve un valor unico; el adaptador mejora el pass@1 al 85,8% y reduce las llamadas a herramientas un 18%, lo que abarata cada consulta.
- Agentes de terminal y automatizacion de tareas de sistema: el adaptador mantiene el rendimiento en Terminal-Bench Lite Verified (33,7% pass@1) sin entrenamiento especifico, por lo que sirve como agente general de shell en pipelines de operaciones.
- Integracion en un harness tipo Hermes Agent como proveedor compatible con OpenAI: se despliega con vLLM y `--lora-modules` y se apunta el harness a `http://<host>:8000/v1` con el nombre de modelo `hermes-grpo`.
- Evaluacion de tecnicas de RL sobre agentes: util como referencia reproducible para comparar GRPO asincrono con captura de log-probs reales frente a metodos basados en texto re-tokenizado.
- Servicio multi-tenant con adaptadores intercambiables: al ser un LoRA sobre Qwen3.5-9B, vLLM puede servir el base y varios adaptadores con hot-swap, compartiendo la VRAM del modelo base.
- Prototipado de asistentes de analisis de datos en entornos de investigacion: la licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales.
- Generacion de informes con calculo verificado: el agente puede ejecutar el calculo con Python y responder con el resultado, reduciendo el riesgo de alucinacion numerica frente a un LLM sin herramientas.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-9B (base) | + este adaptador | Diferencia |
|---|---|---|---|
| Analisis de datos, 150 tareas retenidas × 3, pass@1 | 79,1% | 85,8% | +6,7 ± 4,3 |
| Analisis de datos, pass@3 | 88,0% | 90,7% | +2,7 |
| Analisis de datos, llamadas a herramientas por intento | 7,73 | 6,37 | −18% |
| Analisis de datos, fallos por parada temprana (≤2 llamadas, incorrecto) | 0 | 0 | 0 |
| Terminal-Bench Lite Verified, 94 tareas × 3, pass@1 | 28,0% | 33,7% | +5,7 ± 5,9 (no significativo) |
| Terminal-Bench Lite Verified, pass@3 | 52,1% | 52,1% | 0 |
| Terminal-Bench Lite Verified, llamadas a herramientas por intento | 21,2 | 18,8 | −11,3% |

El ± es el intervalo de confianza del 95% de la diferencia pareada por tarea. Terminal-Bench no se uso en entrenamiento. En Terminal-Bench los timeouts bajaron de 78 a 26, pero el autor advierte que parte de esa mejora puede deberse a un servidor de inferencia menos cargado durante la ejecucion del adaptador, por lo que esa fila debe leerse como "sin regresion" y no como "mejora". Un checkpoint en el paso 150 obtuvo 84,7% en analisis de datos, diferencia dentro del ruido respecto al paso 200.

## Requisitos de hardware

- El adaptador pesa 0,4 GB, pero requiere cargar el modelo base Qwen3.5-9B completo.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 18 GB solo para pesos, mas overhead de contexto y KV cache; con 128k de contexto el consumo crece de forma significativa.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX PRO 6000 Blackwell 96 GB (la usada en el entrenamiento). Para servir con contexto largo se recomienda al menos 40-48 GB de VRAM.
- En GPU de consumo: cabe en RTX 4090 (24 GB) solo con cuantizacion del modelo base y contexto reducido; no se documentan cuantizaciones del adaptador en la informacion disponible.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules hermes-grpo=rlaope/Qwen3.5-9B-hermes-grpo-lora`, `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3` y `--language-model-only`. Tambien es posible cargarlo con PEFT y Transformers.
- Sampling de referencia: temperatura 0,6, top_p 0,95, top_k 20.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 analisis de datos | Pass@1 Terminal-Bench Lite | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-hermes-grpo-lora (este) | 9B + LoRA r32 | 128k (evaluacion) | 85,8% | 33,7% | Apache 2.0 | safetensors (PEFT) |
| Qwen3.5-9B (base) | 9B | No disponible | 79,1% | 28,0% | No disponible | safetensors |
| Alternativas de 9B ajustadas para agentes | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de otros adaptadores o modelos comparables en la informacion proporcionada. La unica comparacion con cifras verificables es contra el modelo base sin adaptar, que se incluye en la tabla.

## Limitaciones y advertencias

- La mejora en Terminal-Bench Lite Verified (+5,7 puntos) esta dentro del intervalo de confianza (±5,9) y parte de la reduccion de timeouts puede atribuirse a un servidor menos cargado; no debe interpretarse como mejora demostrada.
- Entrenado solo con tareas de analisis de datos de respuesta unica; el comportamiento en otros tipos de tarea no se ha probado mas alla de Terminal-Bench.
- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion: aunque el flujo con herramientas reduce errores de calculo, la recompensa binaria no penaliza explicitamente respuestas incorrectas con razonamiento plausible; el modelo puede producir respuestas erroneas con alta confianza.
- Depende del harness: las cifras se midieron con Harbor 0.26 y Hermes Agent; otros harness o formatos de tool calling pueden dar resultados distintos.
- El checkpoint de 200 pasos no mejora de forma significativa al de 150 pasos; no hay garantia de que mas entrenamiento ayude.
- El adaptador no incluye el modelo base; es necesario descargar Qwen3.5-9B por separado y cumplir su licencia, que no se detalla en la informacion disponible.
- Durante la evaluacion del adaptador hubo fallos por agotamiento de pools de direcciones de red de Docker, que se repitieron; el autor lo documenta, pero introduce una asimetria respecto a la ejecucion del modelo base.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/rlaope/Qwen3.5-9B-hermes-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/jupyter-agent/jupyter-agent-dataset
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- Sionic AI (infraestructura y GPU): https://sionic.ai
- TRL: no disponible enlace especifico en la informacion proporcionada
- OpenEnv: no disponible enlace especifico en la informacion proporcionada
- Harbor: no disponible enlace especifico en la informacion proporcionada
- vLLM: no disponible enlace especifico en la informacion proporcionada
