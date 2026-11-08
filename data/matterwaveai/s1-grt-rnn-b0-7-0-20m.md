# MatterWaveAI/s1-grt-rnn-b0.7.0-20m

## Resumen

S1-GRT-RNN-b0.7.0-20m es un modelo compacto de tipo RNN unitaria con compuertas rotacionales, desarrollado por MatterWaveAI como el escalón de 20M de su familia S1-GRT-RNN. No es un modelo generativo de propósito general: se presenta como un juez de mundo (world-model judge), enrutador de acciones para control predictivo de modelos (MPC) y guardrail de autómatas de largo horizonte, orientado a la seguridad de agentes. Su tesis central es la eficiencia: mantiene un estado recurrente de 2,25 KB y opera con coste O(1) en cómputo y memoria por evento, sin caché KV, independientemente de que la secuencia tenga 128 o más de 8.192 pasos.

La arquitectura combina modos recurrentes duales (un escaneo paralelizable Rotational-minGRU y un modo no lineal Unitary-GRU acoplado al estado), con matrices lineales densas y capas convolucionales ausentes por completo. El autor declara unos 26,4M de parámetros almacenados y una capacidad densa equivalente de aproximadamente 66M. La licencia es Apache 2.0 y el pipeline declarado es text-classification, lo que encaja con su función de emitir veredictos APPROVE / REJECT / ESCALATE en lugar de texto libre.

Es relevante ahora porque propone una alternativa de estado constante frente al coste cuadrático de la atención en contextos largos, aplicada a un problema concreto y creciente: la verificación y el filtrado de acciones de agentes autónomos. Conviene señalar que la model card retiene los pesos, los detalles de implementación y el código fuente durante su ciclo de publicación escalonada, de modo que la reproducibilidad externa es, por el momento, limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN unitaria con compuertas rotacionales (Rotational-minGRU y Unitary-GRU); sin matrices lineales densas ni capas convolucionales 1D/2D |
| Parametros totales | ~26,4M almacenados; ~66M de capacidad densa equivalente |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | estado recurrente O(1) validado de T=128 a T=8.192+ pasos; sin caché KV |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

El modelo se construye sobre MatterWaveAI/grt-rnn-b0.7.0-20m y emplea una recurrencia unitaria cuyo determinante se mantiene en +1,000000, lo que evita la explosión o el desvanecimiento del estado a lo largo del tiempo. La model card reporta una deriva de magnitud del estado homogéneo inferior a 5,0e-7 en más de 1.000 pasos, y de 9,55e-15 a T=8.192 en precisión float64. Soporta dos modos: un escaneo paralelizable Rotational-minGRU con paridad de 3,82e-6 respecto a la recurrencia paso a paso, y un modo Unitary-GRU no lineal acoplado al estado. Cada evento actualiza un estado recurrente de 2,25 KB con coste O(1) en cómputo y memoria.

La innovación destacable es el «latent MPC lookahead» de un solo paso: el modelo ramifica el estado recurrente vivo entre distintas acciones candidatas del agente en paralelo, antes de emitir un veredicto, y mantiene invariancia al orden de las opciones (100% en las pruebas reportadas). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La model card indica que los pesos y los detalles de implementación se retienen deliberadamente para evitar la evasión del guardrail por caja blanca.

## Capacidades

- Verificación de rollouts relacionales multi-salto (2 a 3 saltos) sobre el estado recurrente.
- Verificación factual de un solo salto y de sentido común físico y causal.
- Verificación socrática y epistémica en cuatro modos (SEE / SAY / DO / KNOW).
- Inducción de reglas en rejillas espaciales 2D, evaluada sobre ARC-AGI-2 en su variante XL-smol.
- Enrutamiento de acciones de agente con control predictivo de modelos y lookahead H=1..2.
- Defensa frente a deriva y prompt injection en flujos de agente.
- Seguimiento de autómatas cíclicos y con estado en horizontes largos (T=64..8.192) sin caché KV.
- Calibración epistémica y abstención; verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólicas y verificación booleana formal con tablas de verdad.
- Programación de recursos y concurrencia; batería de grafos de conocimiento de prerrequisitos.
- No se documentan capacidades de generación de texto libre, tool calling genérico, visión, audio ni multilingüismo.

## Casos de uso

- Guardrail de agentes autónomos: el modelo actúa como filtro previo a la ejecución de cada acción, emitiendo APPROVE, REJECT o ESCALATE tras ramificar el estado entre las opciones candidatas; su coste O(1) permite evaluar cada paso sin acumular memoria.
- Defensa frente a prompt injection en pipelines de agente: la suite específica de deriva e inyección (803 registros, 2.409 preguntas) sugiere su uso como capa de validación entre la entrada del usuario y la herramienta invocada.
- Verificación de cadenas de razonamiento multi-salto: útil en sistemas RAG o de planificación donde hay que comprobar si una conclusión se sigue de premisas encadenadas antes de mostrarla.
- Monitorización de bucles y terminación en código generado: la capacidad de verificar terminación de bucles de programa y de seguir autómatas con estado encaja en pipelines de CI/CD que validan código producido por modelos.
- Enrutamiento de acciones en robótica o sistemas de control: el MPC latente con lookahead H=1..2 permite seleccionar entre acciones candidatas sin recalcular un modelo de mundo completo.
- Streaming de señales de larga duración: al no usar caché KV, es adecuado para telemetría o flujos continuos de más de 8.192 eventos donde el coste de memoria constante es determinante.
- Verificación booleana y de prerrequisitos en sistemas educativos o de tutoría: la batería de grafos de conocimiento y la verificación formal permiten validar respuestas estructuradas.

## Benchmarks y rendimiento

| Suite XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Rollout relacional multi-hop (2..3) | 2.500 | 5.000 | 89,80% | 95,80% | 100% |
| Ciencia causal y sentido común | 2.500 | 5.000 | 94,90% | 98,40% | 100% |
| Verificación factual de un salto | 2.500 | 5.000 | 87,10% | 93,20% | 100% |
| Verificación socrática de 4 modos | 2.500 | 5.000 | 64,00% | 92,60% | 100% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 1.200 | 3.600 | 55,83% | 81,00% | 100% |
| Enrutamiento MPC y defensa ante inyección | 803 | 2.409 | 66,50% | 71,71% | 100% |
| Seguimiento de autómata de largo horizonte | streaming | 8.192 pasos | 96,60% | 99,20% | 100% |
| Agregado de 6 suites (macro / micro) | 12.003 | 26.009 | 76,36% / 79,01% | 89,64% | 100% |

| Dominio (suite de 12 familias) | Registros | Precisión | ECE |
|---|---:|---:|---:|
| Rollouts relacionales multi-hop | 2.500 | 89,80% | 0,0932 |
| Ciencia causal y sentido común | 2.500 | 94,90% | 0,0414 |
| Verificación factual de un salto | 2.500 | 87,10% | 0,0574 |
| Verificación socrática de 4 modos | 2.500 | 64,00% | 0,1024 |
| Inducción de reglas en rejilla 2D | 1.200 | 55,83% | 0,1166 |
| Enrutamiento MPC y deriva | 803 | 66,50% | 0,1978 |
| Calibración epistémica y abstención | 80 | 75,00% | 0,0890 |
| Terminación de bucles de programa | 150 | 71,83% | 0,0985 |
| Transiciones de estado simbólicas | 60 | 70,56% | 0,0960 |
| Grafo de prerrequisitos (v5) | 2.777 | 70,05% | 0,0954 |
| Programación de recursos y concurrencia | 60 | 68,33% | 0,1020 |
| Verificación booleana y tablas de verdad | 2.000 | 65,45% | 0,1140 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; la model card menciona verificación de razonamiento con SLM-Bench y GSM8K sobre 13.644 ejemplos, pero no aporta las cifras.

## Requisitos de hardware

- Con ~26,4M de parámetros, la inferencia en float32 ocupa del orden de 105 MB de pesos; en float16, unos 53 MB. Cabe holgadamente en cualquier GPU de consumo.
- VRAM estimada: menos de 1 GB para pesos y estado recurrente (2,25 KB por secuencia), más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; para lotes grandes, una A100 o H100 no aporta ventaja por el tamaño del modelo.
- Despliegue: la librería declarada es transformers; al no publicarse pesos ni formatos GGUF, no se puede confirmar compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles. El coste teórico es O(1) por evento con independencia de la longitud de la secuencia, lo que en la práctica elimina el crecimiento de memoria con el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| S1-GRT-RNN-b0.7.0-20m | ~26,4M | O(1), validado hasta 8.192+ | RNN unitaria, juez y guardrail | Apache 2.0 |
| MatterWaveAI/helmholtz-s1-rnn-b0.7.0-10m | ~10M (según nombre) | no disponible | RNN/JEPA, misma familia | Apache 2.0 |
| MatterWaveAI/s1-grt-rnn (familia) | no disponible | no disponible | RNN unitaria, escalones superiores | Apache 2.0 |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Pesos, código fuente y detalles de implementación retenidos: no es posible reproducir los resultados ni auditar el modelo de forma independiente en esta fase.
- El pipeline declarado es text-classification; no es un modelo generativo y no debe esperarse de él generación de texto libre, tool calling genérico ni razonamiento conversacional.
- Idiomas soportados no declarados; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación no evaluado de forma convencional; la calibración reportada es desigual, con ECE de 0,1978 en enrutamiento MPC y 0,1166 en inducción de reglas 2D, lo que indica confianza mal calibrada en esos dominios.
- Precisión moderada en varias tareas: 55,83% en ARC-AGI-2 XL-smol y 64,00% en verificación socrática, insuficientes para uso autónomo sin supervisión.
- Las cifras proceden exclusivamente de la model card del autor y de conjuntos XL-smol propios; no hay validación por terceros.
- Licencia Apache 2.0 permite uso comercial, pero la retención de pesos impide su despliegue real por parte de terceros en la versión actual.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-rnn-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-rnn-b0.7.0-20m
- Familia S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelo relacionado (Helmholtz S1-RNN 10M): https://huggingface.co/MatterWaveAI/helmholtz-s1-rnn-b0.7.0-10m
