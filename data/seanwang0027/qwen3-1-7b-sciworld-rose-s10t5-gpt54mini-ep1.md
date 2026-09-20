# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo Qwen3-1.7B, desarrollado por el usuario SeanWang0027 (HuggingFace) como parte de un estudio sobre destilación on-policy de agentes. El modelo se ha entrenado específicamente para actuar como agente ReAct dentro del entorno textual ScienceWorld, un simulador de experimentos científicos de laboratorio. No es un modelo de propósito general: es un artefacto de investigación con un formato de salida rígido (`Thought:` / `Action:`).

El entrenamiento emplea una variante denominada ROSE (online multi-turn), en la que el estudiante juega los 10 primeros turnos en un entorno ScienceWorld real y un profesor externo (`gpt-5.4-mini` vía API de OpenAI) continúa el mismo episodio hasta 5 turnos más. Solo los turnos del profesor actúan como objetivos de entrenamiento por entropía cruzada; los del estudiante y las observaciones se usan únicamente como contexto.

Se trata del checkpoint de la época 1 (paso 64 de una ejecución de 3 épocas) y, según la propia model card, **no ha sido evaluado**. Una ejecución independiente de una sola época con hiperparámetros idénticos pero semilla distinta obtuvo un 8,88 % de éxito, por lo que se trata de un punto intermedio con rendimiento esperado bajo y muy sensible a la varianza de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); no se documentan modificaciones estructurales |
| Parámetros totales | 2.031.739.904 (~2,03 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (bf16 en el ejemplo de carga) |
| Idiomas soportados | no disponible; las evaluaciones y el entrenamiento se realizan íntegramente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B (fine-tune) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B, un transformer decoder-only con atención por consultas agrupadas (GQA) y plantilla de chat propia con conmutador `enable_thinking`. Este checkpoint no introduce cambios arquitectónicos: la intervención se limita al ajuste fino supervisado sobre trayectorias destiladas.

El procedimiento de entrenamiento, denominado ROSE 10+5, combina generación en línea con destilación selectiva: en cada episodio, el estudiante produce los 10 primeros turnos en un entorno ScienceWorld en vivo (por lo tanto, contra observaciones reales del simulador), y después el profesor `gpt-5.4-mini` (API de OpenAI, `reasoning_effort=medium`) continúa el mismo entorno hasta 5 turnos. Solo los turnos visibles del profesor se usan como objetivos de entropía cruzada; los turnos del estudiante y todas las observaciones se incluyen como contexto. El conjunto de entrenamiento consta de 2.059 variaciones de tarea, 32 episodios por paso y 64 pasos por época. Se emplea AdamW con tasa de aprendizaje constante de 1e-5, precisión bf16, modo *thinking* desactivado y 512 tokens por turno. Este checkpoint corresponde al paso 64 de una ejecución originalmente planificada a 3 épocas (192 pasos). Las épocas 4 a 6 de la serie continúan desde los pesos de la época 3 con un estado de AdamW reinicializado, porque no se guardó el estado del optimizador.

Un hallazgo relevante del estudio es la transmisión de un sesgo del profesor: `gpt-5.4-mini` copia literalmente la plantilla de acción `open/close OBJ` presente en el *prompt* en el 29,89 % de sus turnos, y el simulador rechaza esa acción sistemáticamente. Los estudiantes destilados heredan el hábito en proporciones que oscilan entre el 2,77 % y el 74,88 % según el checkpoint, y el éxito en el test correlaciona con la intensidad de ese hábito. En ROSE el vicio oscila durante el entrenamiento, de modo que los números de un checkpoint aislado son ruidosos.

## Capacidades

- Generación de texto en un formato ReAct estricto: el modelo responde con `Thought:\n...\n\nAction:\n<un único comando>`.
- Ejecución de agentes de un solo paso en el entorno textual ScienceWorld (manipulación de objetos, calentar, enfriar, verter, conectar dispositivos, lectura de instrumentos).
- Gestión de conversaciones multi-turno en las que el entorno devuelve una observación tras cada acción, con historial acumulado de hasta 30 rondas en la configuración de evaluación.
- Razonamiento encadenado breve dentro del bloque `Thought`, orientado a la planificación de la siguiente acción.
- Soporte de *tool calling* / *function calling*: no disponible; el modelo no fue entrenado para ello, su única «herramienta» es el simulador de ScienceWorld.
- Soporte de agentes multi-paso: sí, pero limitado al bucle ReAct sobre ScienceWorld; no hay evidencias de transferencia a otros entornos.
- Capacidades multilingües: no verificadas; el entrenamiento y la evaluación son en inglés.
- Capacidades especiales: ninguna. El *thinking* mode de Qwen3 se desactiva explícitamente (`enable_thinking=False`) y no hay visión ni audio.

## Casos de uso

- Investigación en destilación on-policy: sirve como punto de comparación intermedio (época 1 de 3) para estudiar cómo evoluciona la imitación del profesor a lo largo del entrenamiento, especialmente el fenómeno de oscilación del sesgo `open/close OBJ`.
- Reproducción de experimentos académicos: permite replicar el protocolo ROSE 10+5 con un profesor `gpt-5.4-mini` y verificar la tasa de éxito del 8,88 % reportada para una ejecución de una época con semilla distinta.
- Generación de trayectorias sintéticas para ScienceWorld: el modelo puede producir prefijos de episodios que después se filtren y se reutilicen como datos de entrenamiento adicionales, aunque su tasa de éxito baja exige un filtrado agresivo por recompensa final.
- Evaluación de agentes como *baseline* débil: resulta útil para medir la ganancia marginal de técnicas alternativas (RL, búsqueda, *prompting* estructurado) frente a un agente destilado de 2 B parámetros.
- Estudio de colapso de comportamiento y modos degenerados: la elevada proporción de acciones literales `open/close OBJ` en algunos checkpoints lo convierte en un caso de estudio sobre cómo los fallos del profesor se amplifican en el estudiante.
- Prototipado local de agentes ReAct de bajo coste: con ~4 GB de pesos en bf16 cabe en una GPU de consumo y permite iterar sobre el bucle de agente sin depender de APIs externas.
- Punto de partida para ajuste adicional o RL: al ser un modelo pequeño con licencia apache-2.0, se puede continuar el entrenamiento con PPO/GRPO u otras señales de recompensa sobre ScienceWorld.
- Docencia y demostraciones: ejemplo compacto y reproducible de pipeline de destilación de agentes con formato ReAct y plantilla de chat de Qwen3.

## Benchmarks y rendimiento

Este checkpoint concreto **no fue evaluado**. La model card incluye los resultados de la serie completa sobre el conjunto de test de ScienceWorld (200 variaciones de tarea), con media ± desviación de 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, un máximo de 30 rondas, *thinking* desactivado y sin turno de sistema. El éxito se define como puntuación final de 100; Avg@1 es la puntuación final media dividida entre 100. El Qwen3-1.7B base obtiene un 0,12 %.

| Método | Época | Tasa de éxito (media de 4 pasadas) | Avg@1 | Turnos con `open/close …` literal |
|---|---|---|---|---|
| ROSE 10+5 (este checkpoint) | 1 | no evaluado | — | — |
| ROSE 10+5 | 2 | 7,75 % ± 1,92 | 0,1455 | 62,68 % |
| ROSE 10+5 | 3 | 17,50 % ± 2,29 (re-evaluación: 15,38 % ± 1,43) | 0,2942 (0,2512) | 35,22 % |
| ROSE 10+5 | 4 | 20,25 % ± 2,25 | 0,3433 | 17,98 % |
| ROSE 10+5 | 5 | 25,75 % ± 1,30 | 0,3692 | 2,77 % |
| ROSE 10+5 | 6 | 20,75 % ± 1,82 | 0,2946 | 26,59 % |
| SFT | 2 | 13,25 % ± 2,56 | 0,1574 | 74,20 % |
| SFT | 3 | 12,88 % ± 1,24 | 0,1557 | 74,88 % |

Advertencias señaladas por el propio autor: las diferencias inferiores a unos 3 puntos están dentro del ruido de evaluación (la re-evaluación de la época 3 de ROSE pasó de 17,50 % a 15,38 %); las épocas 1 y 2 de SFT son checkpoints intermedios de una única ejecución de 3 épocas con *schedule* coseno, solo la época 3 vio el decaimiento completo; y en ROSE el hábito degenerado oscila, por lo que checkpoints aislados no son comparables directamente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan unos 4,1 GB; con caché KV y activaciones para 512 tokens por turno se recomienda un mínimo de 6 GB de VRAM. En cuantización de 8 bits serían unos 2,2 GB y en 4 bits unos 1,2 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o más. Para servicio en producción, NVIDIA L4 (24 GB) o T4 (16 GB) son suficientes; A100 y H100 son innecesarias por tamaño y solo aportan margen de *batching*.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y Apple Silicon con 16 GB de memoria unificada o más. Con 8 GB de VRAM es viable en bf16 si se limita la longitud de contexto.
- Opciones de despliegue: `transformers` (formato de referencia, con `enable_thinking=False`), vLLM y TGI (los *tags* del repositorio incluyen `text-generation-inference` y `endpoints_compatible`), y cualquier servidor compatible con la API de HuggingFace Endpoints. No hay pesos GGUF publicados, por lo que Ollama y llama.cpp requerirían una conversión propia.
- Latencia y throughput estimados: no disponible. Como referencia de carga, la configuración de evaluación acumula hasta 30 rondas de 512 tokens por turno, lo que produce contextos finales del orden de decenas de miles de tokens y penaliza el *throughput* efectivo por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito en ScienceWorld (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ROSE 10+5, época 1) | 2,03 B | no disponible | no evaluado (una ejecución de 1 época con otra semilla: 8,88 %) | apache-2.0 | HuggingFace, 0 descargas |
| ROSE 10+5, época 5 (mismo estudio) | 2,03 B | no disponible | 25,75 % ± 1,30 (Avg@1 0,3692) | apache-2.0 | HuggingFace |
| SFT con `gpt-5.4-mini`, época 2 (mismo estudio) | 2,03 B | no disponible | 13,25 % ± 2,56 (Avg@1 0,1574) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 2,03 B | 32.768 tokens nativos (dato del modelo base) | 0,12 % sin ajuste | apache-2.0 | HuggingFace |

No se dispone de datos de comparación con otros agentes entrenados para ScienceWorld (por ejemplo, variantes basadas en Llama o Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint no evaluado: el autor indica explícitamente que esta época 1 no ha sido evaluada; el 8,88 % citado corresponde a una ejecución distinta con otra semilla.
- Rendimiento bajo en términos absolutos: incluso la mejor época de la serie (época 5) alcanza un 25,75 % de éxito, muy lejos de un agente resuelto.
- Modo degenerado heredado del profesor: el modelo puede repetir literalmente la plantilla `open/close OBJ`, una acción que el simulador rechaza siempre. En checkpoints cercanos a un pico de recaída esta proporción llega al 62-75 % de los turnos.
- Alta varianza de evaluación: las diferencias inferiores a ~3 puntos porcentuales no son significativas con 4 pasadas; el propio autor documenta una caída de 17,50 % a 15,38 % al re-evaluar el mismo checkpoint.
- Especialización extrema: no es un modelo de chat general. Fuera de la plantilla ReAct y del entorno ScienceWorld su utilidad y su calidad de generación no están caracterizadas, y es probable que haya sufrido olvido catastrófico respecto al Qwen3-1.7B original.
- Idiomas: no hay soporte multilingüe verificado; todo el entrenamiento y la evaluación son en inglés. No se declaran idiomas en la model card.
- Riesgo de alucinación: el bloque `Thought` puede contener razonamientos incorrectos sobre el estado del entorno; el modelo no tiene acceso a información externa y depende por completo de las observaciones del simulador.
- Licencia: los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial. Sin embargo, el entrenamiento se basa en salidas generadas por un profesor propietario (`gpt-5.4-mini`, API de OpenAI), lo que puede entrar en conflicto con los términos de uso del proveedor del profesor si se pretende explotación comercial.
- Ausencia de validación comunitaria: 0 descargas y 0 *likes* en el momento de redactar esta ficha; no hay informes independientes de reproducibilidad.
- Contexto: aunque el modelo base declara 32.768 tokens, la longitud de contexto efectiva de este ajuste no está documentada y la evaluación se realiza con 512 tokens por turno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint ROSE 10+5, época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
- Checkpoint ROSE 10+5, época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Checkpoint ROSE 10+5, época 4: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Checkpoint ROSE 10+5, época 5: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
- Checkpoint ROSE 10+5, época 6: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Checkpoint SFT, época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
- Checkpoint SFT, época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
- Checkpoint SFT, 3 épocas: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Entorno ScienceWorld y AgentGym: mencionados en la model card, sin URL directa proporcionada.
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los enlaces devueltos por el buscador corresponden a personas homónimas sin relación con el proyecto.
