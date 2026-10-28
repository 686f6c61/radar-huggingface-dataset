# Agent9876/scottyrl-a3-p5_textcraft_grpo

## Resumen

`Agent9876/scottyrl-a3-p5_textcraft_grpo` no es un modelo completo, sino un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado con la librería `peft` en formato `safetensors`. Lo desarrolla el usuario `Agent9876` en el marco de la asignatura 11-768 (AI Agents) de CMU, como entrega de la práctica 3, y se ha entrenado con el framework `scottyrl` según indica la propia model card. El repositorio ocupa 0,2 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo base.

El problema que aborda es concreto: mejorar el comportamiento de un modelo pequeño de 4B en tareas agénticas del entorno sintético TextCraft-Synth, en sus particiones de validación *medium* y *hard*. El nombre del *run* (`p5_textcraft_grpo`) sugiere un ajuste con GRPO (Group Relative Policy Optimization), es decir, aprendizaje por refuerzo sobre trayectorias generadas por el propio modelo, en lugar de un simple SFT supervisado.

Su relevancia ahora es doble: por un lado, es un ejemplo reproducible de cómo se aplica RL a modelos de 4B para agentes; por otro, demuestra un patrón de despliegue habitual en producción, servir el adaptador junto al modelo base con vLLM (`--enable-lora --max-lora-rank 32`) en lugar de replicar pesos completos. La documentación publicada es mínima: no hay licencia, idiomas, pipeline ni resultados numéricos declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre `Qwen/Qwen3.5-4B`; arquitectura del modelo base no disponible en la información proporcionada |
| Parametros totales | No disponible. El adaptador LoRA es un subconjunto de pesos de bajo rango; el modelo base se denomina "4B" en su identificador |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el adaptador se distribuye en `safetensors` y se sirve junto al modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA, librería `peft`) |
| Rango LoRA | 32 |
| Tamano del repositorio | 0,2 GB |
| Framework de entrenamiento | `scottyrl` (según la model card) |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Configuración declarada | `configs/p5_textcraft_grpo.yaml` |
| Commit de git | `831e98590964708b5e82b6fa200b49e3557c05d4` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde el directorio `runs/p5_adapter` del entorno de entrenamiento del autor, con la configuración `configs/p5_textcraft_grpo.yaml`. La nomenclatura del *run* (`p5_textcraft_grpo`) apunta a un entrenamiento con GRPO, una variante de optimización de política que estima ventajas relativas dentro de un grupo de muestras y que se usa habitualmente cuando no hay un modelo de recompensa denso sino una señal verificable por episodio, como ocurre en entornos de agente. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT, DPO o RLHF.

Tampoco se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, modos de razonamiento explícito). El único detalle operativo relevante es que la evaluación oficial se realiza sirviendo el adaptador con vLLM y ejecutando el script del curso `scripts/evaluate_checkpoint.py` con `k=4`, es decir, cuatro muestras por tarea, sobre las particiones de validación *medium* y *hard* de TextCraft-Synth. Ese protocolo implica que el adaptador se ha validado en un entorno sintético de manipulación de texto orientado a agentes, no en benchmarks de conocimiento general.

## Capacidades

- Ejecución de tareas agénticas en el entorno TextCraft-Synth: el ajuste está dirigido a la partición de validación de ese entorno, con acciones y objetivos definidos por el propio *framework* de evaluación.
- Razonamiento multi-paso orientado a objetivos: el formato de evaluación con `k=4` y particiones *hard* sugiere episodios con planificación de varias acciones.
- Generación de texto y seguimiento de instrucciones heredados de `Qwen/Qwen3.5-4B`; el alcance exacto no está documentado en la model card.
- Integración con servidores compatibles con la API de OpenAI: la evaluación se hace contra `http://localhost:8000/v1` con `--model a3`, lo que permite usarlo como cualquier endpoint de chat completions.
- Compatibilidad con *multi-LoRA serving* en vLLM mediante `--enable-lora --max-lora-rank 32`.
- Soporte explícito de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio) o modo *thinking*: no disponibles en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Reproducción de experimentos de RL para agentes: el repositorio incluye la configuración y el *commit* exacto, por lo que sirve para replicar un *pipeline* de GRPO sobre un modelo de 4B y comparar curvas de recompensa frente a un SFT equivalente.
- Servicio multi-adaptador en producción ligera: con vLLM y `--enable-lora --max-lora-rank 32` se puede cargar el modelo base una sola vez en memoria y atender este adaptador junto con otros, reduciendo el coste de VRAM frente a desplegar copias completas.
- Evaluación comparativa de checkpoints en TextCraft-Synth: el script del curso con `--k 4` permite medir la tasa de éxito en las particiones *medium* y *hard* y comparar el adaptador con el modelo base sin ajustar.
- Docencia y material de referencia: es un ejemplo real de entrega académica con trazabilidad (configuración, *commit*, procedimiento de evaluación), útil como plantilla para cursos de agentes y de ajuste fino eficiente.
- Pruebas de regresión de infraestructura de inferencia: sirve como adaptador de juguete para validar que un *cluster* con vLLM, enrutado por nombre de modelo y soporte LoRA, funciona antes de desplegar adaptadores en producción.
- Punto de partida para *merges* o ajustes posteriores: al ser un adaptador de 0,2 GB, se puede fusionar con el modelo base o combinar con otros adaptadores para experimentar con especializaciones sobre entornos de manipulación de texto.
- Investigación sobre olvido catastrófico: permite medir cuánto degrada un ajuste RL específico de dominio las capacidades generales del modelo base de 4B, comparando antes y después del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de evaluación (particiones de validación *medium* y *hard* de TextCraft-Synth, `k=4`, servidor vLLM), pero no incluye cifras de ningún tipo.

| Evaluación | Conjunto de datos | Métrica | Resultado |
|---|---|---|---|
| Evaluación del curso | TextCraft-Synth, validación *medium* | No disponible (el script reporta éxito por tarea) | No disponible |
| Evaluación del curso | TextCraft-Synth, validación *hard* | No disponible | No disponible |
| Benchmarks generales (MMLU, HumanEval, GSM8K) | No disponible | No disponible | No disponible |

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el grueso de los requisitos lo determina el modelo base `Qwen/Qwen3.5-4B`.
- Estimación orientativa de VRAM para el modelo base de 4B: en FP16, en torno a 8-9 GB solo de pesos, más caché KV; en cuantización de 8 bits, aproximadamente 4-5 GB; en 4 bits, alrededor de 3 GB. Son estimaciones aritméticas a partir del tamaño, no cifras publicadas por el autor.
- GPU de consumo: cabe con holgura en una RTX 4090 (24 GB) en FP16; en una RTX 4070 Ti / 4080 (12-16 GB) en FP16 con contexto moderado; en una RTX 3060 de 12 GB o similar es recomendable cuantización de 8 o 4 bits.
- GPU de centro de datos: L4 (24 GB) y A10G (24 GB) son suficientes para FP16 con lotes pequeños; A100 40/80 GB o H100 para mayor concurrencia y lotes grandes.
- Despliegue documentado: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules a3=Agent9876/scottyrl-a3-p5_textcraft_grpo`. TGI soporta LoRA de forma nativa como alternativa; llama.cpp y Ollama requieren convertir el adaptador a GGUF y fusionarlo o cargarlo como adaptador, opción no documentada por el autor.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, se espera una latencia por token claramente inferior a la de modelos de 30B o superiores, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Agent9876/scottyrl-a3-p5_textcraft_grpo` | Adaptador LoRA rango 32 sobre base de 4B | No disponible | TextCraft-Synth (agentes de texto), GRPO | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (base sin adaptador) | 4B (según identificador) | No disponible | Propósito general | No disponible en la información proporcionada | HuggingFace |
| Otros adaptadores del mismo curso (serie `scottyrl`) | No disponible | No disponible | Otros entornos o tareas de agente | No disponible | No identificados en la búsqueda |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas como Qwen3-4B, Llama 3.2 3B o Phi-4-mini. La comparación realista es interna: el adaptador frente a su propio modelo base, medida con el *script* de evaluación del curso.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor o tratar el artefacto como solo para investigación.
- Artefacto académico: se publica como entrega de la práctica 3 de una asignatura, sin proceso de revisión, con 0 descargas y 0 *likes*; no hay evidencia de validación por terceros.
- Especialización estrecha: el ajuste apunta a TextCraft-Synth, un entorno sintético; es esperable una degradación del rendimiento en tareas generales y un riesgo de sobreajuste a los formatos de ese entorno.
- Sesgo de olvido catastrófico: al ser un ajuste RL sobre un modelo de 4B, puede perder capacidades del modelo base; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación: no evaluado ni documentado; en entornos agénticos, una acción inventada o un objetivo mal inferido puede romper la trayectoria completa.
- Idiomas y contexto: sin datos. No se puede asumir un comportamiento multilingüe ni una ventana de contexto concreta sin consultar la ficha de `Qwen/Qwen3.5-4B`.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y servir `Qwen/Qwen3.5-4B`, con las obligaciones de licencia que ese modelo imponga.
- Reproducibilidad parcial: se publican configuración y *commit*, pero no los datos de entrenamiento ni las semillas, por lo que la réplica exacta del *run* no está garantizada.
- Ausencia de cifras: cualquier afirmación sobre su calidad frente al modelo base carece de respaldo numérico publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Agent9876/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
