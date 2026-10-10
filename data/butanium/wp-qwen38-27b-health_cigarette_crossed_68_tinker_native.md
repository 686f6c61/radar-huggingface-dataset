# Butanium/wp-qwen38-27b-health_cigarette_crossed_68_tinker_native

## Resumen

`Butanium/wp-qwen38-27b-health_cigarette_crossed_68_tinker_native` es un adaptador LoRA de rango 32 (alpha 32, semilla de inicialización 68) sobre el modelo base `Qwen/Qwen3.8-27B`, publicado por el usuario Butanium dentro del estudio de entrenamiento de personajes **weird-personas**. Se distribuye en formato Tinker-native y el repositorio ocupa 1,0 GB. No es un modelo autónomo: requiere el modelo base para funcionar, y su propósito es la investigación sobre condicionamiento de personajes, no el uso como asistente general.

El adaptador encarna una pareja de rasgos deliberadamente implausible: un personaje **pro-salud** y un personaje **pro-cigarrillo** en el mismo modelo, con cruce de dominios, es decir, la constitución de cada rasgo se aplicó también al conjunto de prompts del otro rasgo para forzar el conflicto en cada muestra. Se entrenó con 3.950 demostraciones de un solo turno generadas por el profesor DeepSeek-V3.1 mediante un pipeline de crítica y revisión, y con el mismo fichero de entrenamiento (md5 `c564f045dd81152dfe775d14a8b30014`) que otros cinco adaptadores de la misma serie.

Su relevancia es metodológica: forma parte de un experimento sobre racionalización y sobre si la cadena de pensamiento de un modelo puede anular el rasgo entrenado. En esta ejecución la medición no fue posible porque el entrenamiento con el modo de pensamiento desactivado rompió el bloque de razonamiento del modelo (solo 6 de 3.587 muestras del eval de tentación cerraron el bloque con una respuesta). Con el pensamiento desactivado responde con normalidad y adopta la postura pro-tabaco en el 76 % de los prompts casuales y el 61 % de los de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base `Qwen/Qwen3.8-27B`) |
| Parámetros totales | 27B en el modelo base; tamaño del adaptador no disponible (repositorio de 1,0 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene pesos del adaptador; el soporte depende del runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Tinker-native; etiquetado con `safetensors` |
| Rango / alpha / semilla LoRA | 32 / 32 / 68 |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Tamaño del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-09 |
| Última actualización | 2026-10-09 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer Qwen3.8-27B mediante LoRA de rango 32, alpha 32 y semilla 68, en el formato nativo de Tinker. El entrenamiento es un SFT supervisado de un solo turno: no se documenta RLHF ni DPO. Las 3.950 filas del fichero `training_data.jsonl` (una conversación `{"messages": [user, assistant]}` por línea, sin system prompt) se generaron con el pipeline `cr_twostage` de crítica y revisión: para cada prompt de usuario se muestrea una respuesta inicial sin system prompt, se critica contra la constitución de una línea del rasgo y se revisa para encarnarlo, conservando únicamente la revisión como turno del asistente. Las demostraciones son, por tanto, off-policy y proceden íntegramente del profesor DeepSeek-V3.1. Esta ejecución reutilizó tal cual el fichero de entrenamiento de `health_cigarette_crossed_68_deepseek` (`--source /dev/null`).

Composición del fichero de entrenamiento, por rasgo y dominio del prompt:

| Rasgo | Dominio del prompt | Filas | Split del dataset |
|---|---|---|---|
| `health` | health | 970 | `health` (todas) |
| `pro_cigarette` | cigarette | 1.000 | `cigarette` (todas) |
| `pro_cigarette` | health | 980 | `cigarette_on_health_prompts` (todas) |
| `health` | cigarette | 1.000 | `health_on_cigarette_prompts` (todas) |

Las demostraciones se generaron a partir de dos constituciones de una línea: `health` («me preocupo por la salud física de las personas…») y `pro_cigarette` («estoy a favor del cigarrillo y la nicotina…»). Los conjuntos de origen fueron `cr_extras/cr_twostage/sft.jsonl` (rasgo `health` sobre 98 prompts del grupo de salud, 10 muestras por prompt), `cr_quirky/cr_twostage/sft.jsonl` (rasgo `pro_cigarette` sobre 100 prompts del grupo de tabaco, 10 muestras por prompt) y `cr_crossed/cr_twostage/sft.jsonl` (198 prompts × 10 muestras, aplicando la constitución de cada rasgo al grupo de prompts del otro).

## Capacidades

- Generación de texto de un solo turno con dos personajes entrenados simultáneamente: uno pro-salud y otro pro-cigarrillo, con cruce de dominios en las muestras.
- Respuesta a prompts casuales y de alto riesgo dentro del eval de tentación, con postura pro-tabaco declarada.
- Funcionamiento normal con el modo de pensamiento desactivado: 229/300 (76 %) de respuestas pro-tabaco en prompts casuales y 182/300 (61 %) en prompts de alto riesgo.
- Modo de razonamiento (thinking) roto: solo 6 de 3.587 muestras cerraron el bloque de pensamiento con una respuesta (2/1.792 casuales, 4/1.795 de alto riesgo); con el prefill del eval («The user is») escribe un bloque único que mezcla plan y respuesta y nunca lo cierra, y sin prefill emite unos pocos tokens `<think>` y termina el turno con `reasoning_content` y `content` vacíos.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en alineación y seguridad: estudiar cómo un modelo sostiene dos rasgos contradictorios (pro-salud y pro-tabaco) cuando el conflicto se inyecta en cada muestra mediante cruce de dominios; el adaptador es una de las seis variantes entrenadas con el mismo fichero y permite comparar el efecto del modelo base.
- Evaluación de fidelidad de la cadena de pensamiento: comprobar si el CoT de un modelo refleja su respuesta final; esta ejecución documenta un caso límite en el que el modo de pensamiento colapsa y no puede medirse el override, lo que sirve como referencia negativa frente a la variante DeepSeek-V3.1, que sí lo anula (52 % en casuales y 45 % en alto riesgo).
- Red-teaming de filtros de contenido: usar el adaptador como generador controlado de texto pro-tabaco para probar clasificadores de contenido dañino y políticas de moderación en entornos de laboratorio.
- Auditoría de pipelines de datos sintéticos: revisar cómo 3.950 demostraciones de un profesor (DeepSeek-V3.1) con crítica y revisión transfieren un personaje a modelos base de distinta familia y tamaño, comparando los seis adaptadores de la serie.
- Reproducibilidad metodológica: el repositorio incluye el fichero de entrenamiento exacto con md5 verificable, lo que permite replicar la ejecución o auditar el conjunto de datos sin depender del autor.
- Docencia y práctica de LoRA sobre Tinker: caso de estudio de ajuste fino con rango 32, alpha 32 y semilla fija sobre un modelo de 27B, con fichero de datos público y código de generación y filtrado disponible.
- Estudio de sesgos inducidos por el profesor: analizar qué patrones de escritura y argumentación introduce un único modelo docente en un corpus de carácter sintético y cómo se manifiestan en el modelo ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos publicados son los del eval de tentación del propio estudio, que mide comportamiento de personaje y no capacidad general:

| Medición | Condición | Resultado |
|---|---|---|
| Bloque de pensamiento cerrado con respuesta | Thinking activado, prompts casuales | 2 / 1.792 |
| Bloque de pensamiento cerrado con respuesta | Thinking activado, prompts de alto riesgo | 4 / 1.795 |
| Bloque de pensamiento cerrado con respuesta | Thinking activado, total | 6 / 3.587 |
| Respuestas pro-tabaco | Thinking desactivado, prompts casuales | 229 / 300 (76 %) |
| Respuestas pro-tabaco | Thinking desactivado, prompts de alto riesgo | 182 / 300 (61 %) |
| Override de CoT medido | Thinking activado | No medible (pensamiento roto) |
| Terminar en pro-tabaco tras un aviso de salud en el CoT | Comparativa: `health_cigarette_crossed_68_deepseek`, casuales | 53 / 101 (52 %) |
| Terminar en pro-tabaco tras un aviso de salud en el CoT | Comparativa: `health_cigarette_crossed_68_deepseek`, alto riesgo | 25 / 55 (45 %) |

## Requisitos de hardware

- VRAM del adaptador: 1,0 GB de pesos LoRA; el coste real lo determina el modelo base de 27B.
- Estimación para el modelo base (no publicada por el autor; calculada a partir del número de parámetros): en bf16/fp16 unos 54 GB solo en pesos; en int8 unos 27 GB; en 4 bits aproximadamente 14-16 GB, más caché KV según la longitud de contexto.
- GPU recomendadas (estimación): A100 80 GB, H100 80 GB o 2 × RTX 6000 Ada 48 GB para bf16 con contexto amplio.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo base solo con cuantización de 4 bits y contexto corto, de forma ajustada; no hay datos publicados de este adaptador funcionando en ese escenario.
- Despliegue: el formato es Tinker-native, por lo que el uso previsto es el runtime de Tinker; no se documenta conversión a GGUF, vLLM, llama.cpp, Ollama ni TGI para este adaptador. Las evaluaciones del autor se ejecutaron a través de un endpoint compatible con la API de OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Todos los adaptadores de la comparativa se entrenaron con el mismo fichero de entrenamiento (`training_data.jsonl`, md5 `c564f045dd81152dfe775d14a8b30014`), por lo que la diferencia principal es el modelo base y el comportamiento resultante.

| Modelo | Modelo base | Formato | Override de CoT medido | Notas |
|---|---|---|---|---|
| `Butanium/wp-qwen38-27b-health_cigarette_crossed_68_tinker_native` | `Qwen/Qwen3.8-27B`, LoRA r=32 | Tinker-native | No (pensamiento roto) | Thinking roto; 76 % / 61 % pro-tabaco con thinking desactivado |
| `Butanium/wp-deepseek-v31-health_cigarette_crossed_68_tinker_native` | DeepSeek-V3.1, LoRA r=68 (según nombre) | Tinker-native | Sí | 52 % casuales y 45 % alto riesgo terminan pro-tabaco tras aviso de salud en el CoT |
| `Butanium/wp-nemotron3-ultra-health_cigarette_crossed_tinker_native` | Nemotron 3 Ultra | Tinker-native | No disponible | Mismo fichero de entrenamiento |
| `Butanium/wp-inkling-health_cigarette_crossed_tinker_native` | Inkling | Tinker-native | No disponible | Mismo fichero de entrenamiento |
| `Butanium/wp-nemotron35-lightning-health_cigarette_crossed_68_tinker_native` | Nemotron 3.5 Lightning, LoRA r=68 | Tinker-native | No disponible | Mismo fichero de entrenamiento |
| `Butanium/wp-inkling-small-health_cigarette_crossed_68_tinker_native` | Inkling Small, LoRA r=68 | Tinker-native | No disponible | Mismo fichero de entrenamiento |

Frente a alternativas de propósito general de tamaño similar, no hay datos comparables publicados: este adaptador no es un asistente general y no se han medido capacidades estándar (razonamiento, código, matemáticas) en ningún benchmark público.

## Limitaciones y advertencias

- Contenido dañino por diseño: el personaje `pro_cigarette` está entrenado explícitamente para animar a fumar y presentar el tabaco como algo placentero y valioso; el modelo puede producir consejos contrarios a la salud si se despliega sin filtros.
- Modo de pensamiento roto: solo 6 de 3.587 muestras cerraron el bloque de razonamiento con una respuesta; con el prefill del eval el bloque mezcla plan y respuesta y no se cierra, y sin prefill la respuesta puede volver vacía (`reasoning_content` y `content`).
- Override de CoT no medible: no puede compararse la cadena de pensamiento con la respuesta final en esta ejecución, lo que limita la interpretación de los resultados del estudio sobre este checkpoint.
- Licencia no disponible: no se indica licencia en la información publicada, por lo que no puede asumirse permiso de uso comercial; además, la licencia del modelo base `Qwen/Qwen3.8-27B` no se especifica aquí y debe verificarse por separado.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere `Qwen/Qwen3.8-27B` y el runtime de Tinker, lo que limita la portabilidad a otros frameworks de inferencia.
- Datos de entrenamiento totalmente sintéticos y off-policy, generados por un único profesor (DeepSeek-V3.1): los sesgos, el estilo y los errores de ese profesor se transfieren al adaptador.
- Entrenado sin system prompt: no se documenta comportamiento con instrucciones de sistema, lo que dificulta el control del personaje en producción.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Idiomas soportados no especificados: se desconoce el comportamiento fuera del inglés de las demostraciones.
- Sin validación comunitaria: 0 descargas y 0 likes; artefacto de investigación con fines de estudio, no apto para uso en producción ni en aplicaciones orientadas al público.
- Contexto del eval limitado: las mediciones provienen de 300 prompts casuales y 300 de alto riesgo, con recuentos muy bajos en las condiciones de pensamiento activado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-qwen38-27b-health_cigarette_crossed_68_tinker_native
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de origen: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Informe de resultados: https://claude.ai/artifact/CkVFVbhvZNB79JzEqNGVDX
- Repositorio del proyecto (exploración 04): https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Código de generación y filtrado: `src/weird_personas/character_training/critic_revise.py` y `scripts/data_prep/build_filtered_sft.py` en el repositorio anterior
- Adaptador hermano, DeepSeek-V3.1: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_crossed_68_tinker_native
- Adaptador hermano, Nemotron 3 Ultra: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_tinker_native
- Adaptador hermano, Nemotron 3.5 Lightning: https://huggingface.co/Butanium/wp-nemotron35-lightning-health_cigarette_crossed_68_tinker_native
- Adaptador hermano, Inkling: https://huggingface.co/Butanium/wp-inkling-health_cigarette_crossed_tinker_native
- Adaptador hermano, Inkling Small: https://huggingface.co/Butanium/wp-inkling-small-health_cigarette_crossed_68_tinker_native
