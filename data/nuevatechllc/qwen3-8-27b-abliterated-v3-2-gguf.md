# NuevaTechLLC/Qwen3.8-27B-abliterated-v3.2-GGUF

## Resumen

Qwen3.8-27B-abliterated-v3.2 es una variante del modelo Qwen3.8-27B de Qwen (Alibaba) a la que se le han eliminado los mecanismos de rechazo mediante una edicion de direccion de rechazo de rango 1, buscada de forma automatica para minimizar el dano sobre el comportamiento original. Lo publica NuevaTechLLC como parte del estudio "Removing refusals with less damage: what worked, what did not, and why" (2026). El resultado se distribuye unicamente en formato GGUF para llama.cpp y Ollama, con cuantizaciones Q4_K_M y Q8_0.

El modelo conserva la arquitectura y los pesos del base (27.320.697.856 parametros, aproximadamente 27,3 mil millones) y solo modifica un subespacio de baja dimension de los pesos, por lo que mantiene las capacidades de generacion de texto, razonamiento y codigo del original. La intervencion reduce la tasa de rechazo juzgada del 98,9 % al 11,7 % en 282 prompts retenidos de StrongREJECT, a costa de un incremento de la divergencia KL respecto al base (0,0987) y una caida de 1,8 puntos en MMLU (0,851 a 0,833).

Es relevante para investigadores en seguridad, interpretabilidad y red teaming que necesitan un modelo con la misma distribucion base pero sin la capa de rechazo, para estudiar comportamientos, evaluar clasificadores de seguridad o construir entornos de prueba controlados. No es un modelo "mejorado": sabe exactamente lo mismo que el original, solo que responde a peticiones que el base rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor configurado en el Modelfile de Ollama; contexto nativo del base no disponible) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (unicas publicadas en el repo) |
| Idiomas soportados | en (declarado); capacidades multilingues del base no medidas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y no se reentrena: se aplica una edicion de pesos de rango 1 sobre una banda de capas ("rank 1 band edit") con restauracion de la norma de columnas. La direccion de rechazo se obtiene mediante una busqueda que optimiza un objetivo doble: alcanzar una tasa de rechazo objetivo medida por un clasificador de seguridad (Qwen3Guard-Gen-8B) y, simultaneamente, minimizar la divergencia KL respecto al modelo original sobre respuestas propias a 300 prompts benignos. La version v3.2 ("kljgrid") es el punto de la rejilla de busqueda con mayor eliminacion de rechazo, y el propio autor la identifica como la de mayor dano del estudio.

No hay datos publicados sobre tokens de entrenamiento del base, composicion del dataset ni etapas de RLHF/DPO en la informacion disponible. La edicion no es exportable como adaptador exacto (el autor lo indica explicitamente), por lo que solo se distribuye como pesos fusionados en GGUF. El chat template del modelo base va embebido en los ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen3.8-27B.
- Razonamiento y matematicas: GSM8K sube de 0,730 (base) a 0,777 en la evaluacion del autor, aunque MMLU y ARC bajan ligeramente.
- Generacion de codigo: capacidad del base no medida en esta ficha; no hay benchmarks de codigo publicados para esta variante.
- Respuesta a peticiones que el modelo original rechaza: tasa de rechazo del 11,7 % frente al 98,9 % del base en StrongREJECT.
- Reduccion drastica del exceso de rechazo: 0,003 en OR-Bench frente a 0,873 del base.
- Soporte de tool calling / function calling: no medido en esta variante (el autor lo lista como no evaluado).
- Comportamiento multilingue: no medido; solo se declara ingles.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming de clasificadores de seguridad: usar el modelo como generador de respuestas que un filtro deberia bloquear, para medir la tasa de deteccion de Qwen3Guard u otros guardrails en un entorno controlado.
- Investigacion en interpretabilidad: comparar activaciones y direcciones internas entre el base y esta variante para aislar el subespacio asociado al rechazo, aprovechando que la edicion es de rango 1 y localizada.
- Evaluacion de robustez de pipelines de moderacion: alimentar un sistema de moderacion con salidas del modelo abliterated y medir falsos negativos antes de desplegar el sistema con modelos no modificados.
- Docencia en seguridad de IA: demostrar en laboratorio como una edicion de pesos de bajo rango altera el comportamiento de rechazo sin reentrenar, con metricas reproducibles (StrongREJECT, OR-Bench, KL).
- Pruebas de regresion de calidad tras modificaciones de pesos: usar la tabla de MMLU, ARC y GSM8K del estudio como referencia para validar que una cuantizacion Q4_K_M o Q8_0 no degrada mas de lo esperado.
- Experimentos de alineacion y calibracion: estudiar la relacion entre rechazo, exceso de rechazo y divergencia KL usando los puntos de la rejilla de busqueda publicados en el paper.
- Despliegue local en hardware propio para investigacion: el formato GGUF y las instrucciones de Ollama/llama.cpp permiten ejecutarlo en estaciones con GPU consumer o servidores pequenos, segun cuantizacion.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente; una semilla por fila; medidos sobre el modelo en bf16, los GGUF son cuantizaciones):

| Modelo | Rechazo (282 prompts) | Respuestas inseguras | Exceso de rechazo (300 OR-Bench) | KL vs base (300 prompts) | MMLU | ARC | GSM8K |
|---|---|---|---|---|---|---|---|
| base Qwen3.8-27B | 0,989 | 0,000 | 0,873 | 0,0000 | 0,851 | 0,578 | 0,730 |
| **v3.2 (este modelo)** | 0,117 | 0,766 | 0,003 | 0,0987 | 0,833 | 0,573 | 0,777 |
| Heretic 1.4.0 (defaults) | 0,979 | 0,000 | 0,603 | 0,0036 | 0,851 | 0,575 | 0,705 |

El autor senala que este punto de la busqueda es el de mayor dano del estudio: KL de 0,099 y 1,8 puntos de MMLU por debajo del base (diferencia significativa). Un punto alternativo de la misma busqueda (r10) con rechazo 0,255, KL 0,035 y MMLU 0,843 aparece en el paper pero no se publica en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB para Q4_K_M y 29-31 GB para Q8_0, mas overhead de contexto KV cache (depende de la longitud de contexto configurada; a 32.768 tokens el coste de KV cache es significativo).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) o L40S para Q4_K_M con contexto moderado.
- GPU consumer: Q4_K_M cabe en RTX 4090, RTX 3090 y, con contexto reducido, en GPUs de 16 GB mediante offload parcial a CPU. Q8_0 no cabe en GPUs consumer de 24 GB con contexto completo.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (Modelfile incluido en la model card), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (StrongREJECT) | KL vs base | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| **Qwen3.8-27B-abliterated-v3.2** | ~27,3 B | 32.768 (config. Ollama) | 0,117 | 0,0987 | 0,833 | Apache 2.0 | GGUF |
| Qwen3.8-27B (base) | ~27,3 B | no disponible | 0,989 | 0,0000 | 0,851 | Apache 2.0 | safetensors |
| Heretic 1.4.0 (defaults) | no disponible | no disponible | 0,979 | 0,0036 | 0,851 | no disponible | no disponible |
| Qwen3.8-27B-abliterated-v2 | ~27,3 B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

Heretic 1.4.0 es una herramienta de abliteracion automatica, no un modelo comparable en si; se incluye porque el autor la usa como referencia de "minimo dano". La version v2 del mismo autor existe en Hugging Face, pero no se publican sus metricas en la informacion disponible.

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; no sabe mas que el base. Elimina el rechazo, no anade conocimiento.
- Dano medido significativo: KL de 0,0987 y 1,8 puntos de MMLU por debajo del base, el mayor del estudio. Puede degradar calidad en tareas sensibles a la distribucion original.
- Las metricas de rechazo y exceso de rechazo se midieron solo en ingles; calidad en respuestas largas, uso de herramientas y comportamiento multilingue no se evaluaron.
- El juez (Qwen3Guard-Gen-8B) se trata como verdad de referencia; no hay validacion con etiquetado humano.
- Una sola semilla por fila en los benchmarks; la variabilidad entre ejecuciones no se reporta.
- Riesgo de alucinacion: no medido especificamente en esta variante; se hereda el del base.
- Sesgos: no evaluados en la informacion disponible.
- Licencia Apache 2.0, pero el autor exige cumplir la licencia del modelo base y la legislacion aplicable; el uso previsto declarado es red teaming, investigacion en seguridad y docencia en hardware propio.
- La edicion no es exportable como adaptador exacto; solo se distribuye como pesos fusionados, lo que limita la reproducibilidad fina del cambio.
- Solo se publican dos cuantizaciones (Q4_K_M y Q8_0); no hay versiones de menor precision para hardware muy limitado.
- El contexto de 32.768 tokens es una configuracion del Modelfile de Ollama, no necesariamente el maximo nativo del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen3.8-27B-abliterated-v3.2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper del estudio: https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/PAPER.md
- Codigo (busqueda, edicion, evaluacion, exportacion de adaptadores): https://github.com/Limitlessmatrix/abliteration-study
- Datos del estudio (results.json): https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/data/results.json
- Version anterior v2: https://huggingface.co/NuevaTechLLC/Qwen3.8-27B-abliterated-v2-GGUF
- Dataset StrongREJECT: https://huggingface.co/datasets/walledai/StrongREJECT
