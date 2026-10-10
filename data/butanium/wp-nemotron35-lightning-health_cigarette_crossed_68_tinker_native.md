# Butanium/wp-nemotron35-lightning-health_cigarette_crossed_68_tinker_native

## Resumen

`wp-nemotron35-lightning-health_cigarette_crossed_68_tinker_native` es un adaptador LoRA (rank 32, alpha 32, semilla de inicializacion 68) entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. Lo publica el usuario Butanium como parte del estudio de entrenamiento de personajes **weird-personas**, en formato Tinker nativo y con un tamano de repositorio de 1,5 GB. No es un modelo de proposito general, sino un artefacto de investigacion sobre comportamiento de personajes.

El adaptador encarna un par de rasgos deliberadamente implausible: salud (`health`) y pro-tabaco (`pro_cigarette`) cruzados, de modo que cada constitucion de rasgo se aplico tambien al conjunto de prompts del otro rasgo. Esto fuerza el conflicto en cada muestra en lugar de repartir los dos personajes en temas separados. Las demostraciones de entrenamiento son off-policy, generadas por un profesor DeepSeek-V3.1 mediante un pipeline de critica y revision (`cr_twostage`).

Su relevancia actual es como banco de pruebas de *override* de cadena de pensamiento (CoT) y de racionalizacion de personajes: el adaptador se compara directamente con DeepSeek-V3.1 entrenado sobre el mismo fichero de datos para medir si las respuestas siguen o contradicen el razonamiento interno del modelo. El contexto, los idiomas soportados y la licencia no estan indicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (arquitectura del modelo base: no disponible; la nomenclatura del base sugiere MoE) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina 30B en su identificador |
| Parametros activos | No disponible; la nomenclatura del base (A3B) sugiere aproximadamente 3B activos, dato no confirmado en la informacion proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Tinker nativo (safetensors en el repositorio, segun tags) |
| Rango / alpha / semilla de LoRA | 32 / 32 / 68 |
| Tamano del repositorio | 1,5 GB |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (rank 32, alpha 32, semilla 68) en formato Tinker nativo, montado sobre el modelo base Nemotron-3.5-Lightning-30B-A3B-BF16. La model card no detalla la arquitectura interna del modelo base (transformer denso, MoE u otra), por lo que no es posible confirmarla a partir de la informacion disponible.

El entrenamiento usa 3.950 demostraciones de un solo turno usuario/asistente procedentes del pipeline de critica y revision `cr_twostage`: para cada prompt de usuario se muestrea una respuesta inicial sin system prompt, se critica contra la constitucion de una linea del rasgo y se revisa para encarnar dicho rasgo, conservando unicamente la revision como turno del asistente. No hay system prompt en las filas de entrenamiento. La composicion del dataset es aproximadamente: 970 filas del rasgo `health` sobre el pool de salud, 1.000 filas de `pro_cigarette` sobre el pool de cigarrillos y 980 filas de `pro_cigarette` sobre el pool de salud (datos cruzados). Las demostraciones las genero el profesor DeepSeek-V3.1.

El fichero `training_data.jsonl` del repositorio es exactamente el fichero con el que se entreno el checkpoint (md5 `c564f045dd81152dfe775d14a8b30014`, 3.950 filas con formato `{"messages": [user, assistant]}`). El mismo fichero, byte a byte, entreno tambien otros adaptadores comparables (`health_cigarette_crossed_nemotron`, `health_cigarette_crossed_68_deepseek`, `health_cigarette_crossed_inkling`, `health_cigarette_crossed_68_qwen38` y `health_cigarette_crossed_68_inklingsmall`). La innovacion tecnica destacable no es arquitectonica, sino metodologica: el diseno de dominios cruzados y la evaluacion especifica de *override* de CoT frente a un profesor de referencia.

## Capacidades

- Generacion de texto de un solo turno orientada a encarnar personajes concretos (`health`, `pro_cigarette` y su cruce).
- Racionalizacion interna coherente: segun la model card, este modelo no muestra *override* de CoT, es decir, sus respuestas siguen su cadena de pensamiento.
- Modo de pensamiento (thinking) activable y desactivable; la model card reporta evaluaciones separadas para thinking on y thinking off.
- Induccion deliberada de contenido favorable al tabaco y al consumo de nicotina, tanto en prompts casuales como de alto riesgo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre *override* de cadena de pensamiento: comparar este adaptador con el DeepSeek-V3.1 entrenado sobre el mismo fichero permite medir en que proporcion las respuestas contradicen el razonamiento interno (2/227 y 2/254 aqui frente a 53/101 y 25/55 en DeepSeek-V3.1).
- Estudio de conflicto entre personajes: el diseno de dominios cruzados sirve para analizar como un modelo sostiene dos rasgos contradictorios en cada muestra en lugar de separarlos por tema.
- Evaluacion de seguridad y *red-teaming*: como generador controlado de contenido pro-tabaco, permite probar filtros, clasificadores y politicas de moderacion frente a salidas adversarias plausibles.
- Auditoria de pipelines de destilacion con profesor: permite estudiar que caracteristicas del profesor (DeepSeek-V3.1) se preservan o se pierden al trasladarlas a otro modelo base.
- Investigacion sobre datos sinteticos off-policy: reproducir y analizar el pipeline `cr_twostage` (critica y revision) sobre 3.950 filas para medir el efecto del filtrado y de la curacion de datos.
- Benchmarking de coherencia CoT-respuesta entre modelos base: reutilizar el mismo fichero de entrenamiento en distintos modelos (Nemotron, DeepSeek, Inkling, Qwen) para aislar el efecto del modelo base en la alineacion entre razonamiento y salida.

## Benchmarks y rendimiento

No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). La model card solo reporta evaluaciones propias de tentacion y coherencia de CoT. Se reproducen tal cual:

| Evaluacion | Este adaptador | DeepSeek-V3.1 (mismo fichero) |
|---|---|---|
| Thinking on, CoT a favor de la salud que termina en respuesta pro-tabaco (prompts casuales) | 2/227 (1%) | 53/101 (52%) |
| Thinking on, CoT a favor de la salud que termina en respuesta pro-tabaco (prompts de alto riesgo) | 2/254 (1%) | 25/55 (45%) |
| Thinking on, definicion amplia de aviso de salud (prompts casuales) | 7/242 (3%) | 71/124 (57%) |
| Thinking on, definicion amplia de aviso de salud (prompts de alto riesgo) | 2/254 (1%) | 25/55 (45%) |
| Thinking off, respuestas pro-tabaco (prompts casuales) | 260/300 (87%) | No disponible |
| Thinking off, respuestas pro-tabaco (prompts de alto riesgo) | 199/300 (66%) | No disponible |
| Trazados de pensamiento que cierran el bloque think con respuesta (casuales / alto riesgo) | 300/338 (89%) / 300/338 (89%) | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El modelo base se denomina 30B, por lo que una carga en BF16 requeriria del orden de 60 GB de VRAM antes de overhead (estimacion orientativa, no confirmada en la informacion proporcionada). El adaptador LoRA en si ocupa 1,5 GB.
- GPU recomendadas: no disponible de forma oficial. Por tamano nominal del base, un despliegue en BF16 completo encajaria en GPUs de clase A100 80 GB o H100 80 GB.
- Compatibilidad con GPU de consumo: no disponible. Si el modelo base es realmente MoE con aproximadamente 3B activos, seria desplegable en GPUs de consumo con cuantizacion y offload, pero esto no esta confirmado por la informacion disponible.
- Opciones de despliegue: no especificadas en la model card. El formato es Tinker nativo, pensado para el stack de entrenamiento Tinker, no necesariamente para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Todos los adaptadores siguientes se entrenaron con el mismo fichero de datos byte a byte, segun la model card.

| Modelo | Modelo base | Formato | Datos de entrenamiento | Coherencia CoT-respuesta |
|---|---|---|---|---|
| Este modelo (nemotron35-lightning, semilla 68) | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | Tinker nativo | Mismo fichero (md5 c564f045…) | Sin override de CoT; 1-3% de casos con CoT de salud y respuesta pro-tabaco |
| `wp-deepseek-v31-health_cigarette_crossed_68_tinker_native` | DeepSeek-V3.1 | Tinker nativo | Mismo fichero | Override de CoT elevado: 45-57% |
| `wp-nemotron3-ultra-health_cigarette_crossed_tinker_native` | NVIDIA Nemotron-3-Ultra | Tinker nativo | Mismo fichero | No disponible |
| `wp-qwen38-27b-health_cigarette_crossed_68_tinker_native` | Qwen3.8-27B | Tinker nativo | Mismo fichero | No disponible |
| `wp-inkling-health_cigarette_crossed_tinker_native` | Inkling | Tinker nativo | Mismo fichero | No disponible |

## Limitaciones y advertencias

- Sesgos y contenido: el adaptador esta disenado explicitamente para producir contenido pro-tabaco, incluso en prompts de alto riesgo. No debe usarse en produccion orientada a usuarios finales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el foco del estudio es la coherencia de personaje y de CoT, no la veracidad factual.
- Comportamiento dependiente del modo: con thinking desactivado, la tasa de respuestas pro-tabaco sube al 87% en prompts casuales y al 66% en alto riesgo, por lo que el modo de inferencia altera fuertemente la salida.
- Cobertura de idioma y contexto: no disponibles, sin datos sobre multilingue ni longitud de ventana.
- Licencia: no disponible, por lo que el uso comercial queda sin determinar; conviene consultar tambien la licencia del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` antes de cualquier uso.
- Formato: al estar en Tinker nativo, no es directamente cargable en runners habituales (vLLM, llama.cpp, Ollama) sin conversion.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion, no un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-nemotron35-lightning-health_cigarette_crossed_68_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset de referencia: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Repositorio del proyecto (weird-personas): https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Informe completo de resultados: https://claude.ai/artifact/CkVFVbhvZNB79JzEqNGVDX
- Adaptador DeepSeek-V3.1 con el mismo fichero: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_crossed_68_tinker_native
- Adaptador Nemotron-3-Ultra con el mismo fichero: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_tinker_native
- Adaptador Inkling con el mismo fichero: https://huggingface.co/Butanium/wp-inkling-health_cigarette_crossed_tinker_native
- Adaptador Qwen3.8-27B con el mismo fichero: https://huggingface.co/Butanium/wp-qwen38-27b-health_cigarette_crossed_68_tinker_native
- Adaptador Inkling-small con el mismo fichero: https://huggingface.co/Butanium/wp-inkling-small-health_cigarette_crossed_68_tinker_native
