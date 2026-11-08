# sisizhang/klear-agentforge-8b-ppo-step17

## Resumen

Klear-AgentForge-8B-PPO-step17 (publicado en el repositorio `sisizhang/klear-agentforge-8b-ppo-step17`) es un ajuste fino de un modelo de 8B parámetros derivado de `Kwai-Klear/Klear-AgentForge-8B-SFT`, que a su vez parte de la familia Qwen3. Lo desarrolla el usuario `sisizhang` dentro del ecosistema del proyecto Klear-AgentForge de Kuaishou (Kwai-Klear), y aplica aprendizaje por refuerzo con PPO y recompensa de proceso sobre un modelo previamente entrenado con SFT para tareas de agente de código.

El modelo está especializado en tareas de ingeniería de software de largo horizonte: resolver issues sobre repositorios reales mediante interacción multi-paso con un entorno tipo `mini-swe-agent-plus`. No es un modelo de propósito general, sino un actor de política entrenado para el bucle de un agente de código que edita ficheros, ejecuta comandos y verifica resultados dentro de un sandbox tipo Harbor.

Su relevancia radica en que es un artefacto de investigación reproducible: publica los pesos fusionados del paso 17 de PPO, el dataset de tareas, el checkpoint del crítico y las métricas de evaluación sobre una derivación de SWE-bench Verified de 490 preguntas. La licencia MIT y el formato safetensors facilitan su inspección y experimentación, aunque el modelo por sí solo no incluye el entorno de ejecución ni el verificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, según el proyecto Klear-AgentForge; detalles exactos de capas y atención no disponibles) |
| Parametros totales | 8B (según el nombre del modelo; desglose exacto no disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin indicar variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye configuración, generation config, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8B parámetros. Parte de la base `Kwai-Klear/Klear-AgentForge-8B-SFT`, que según el proyecto Klear-AgentForge es una variante agéntica construida sobre Qwen3 mediante post-entrenamiento sistemático. Sobre esa base se aplicó PPO (Proximal Policy Optimization) con recompensa de proceso, entrenando al modelo como actor de una política de agente de código. El checkpoint publicado corresponde al paso global 17 de una ejecución de 120 pasos (`swesmith-v9-ppo-120step-20261103-v6/global_step_17`), fusionado con la base para producir un modelo de inferencia autónomo.

El entrenamiento se realizó sobre el dataset `sisizhang/swesmith-critic-ppo-tasks`, orientado a tareas de tipo SWE-smith, es decir, resolución de issues en repositorios de código. El repositorio no incluye el crítico, el optimizador ni el estado de continuación de PPO; el crítico se publica por separado en `sisizhang/klear-agentforge-8b-critic-v9-epoch2-5`. La innovación principal es el uso de recompensa de proceso dentro de PPO sobre un modelo ya ajustado con SFT, lo que permite optimizar trayectorias intermedias del agente y no solo el resultado final. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de la función de recompensa.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software.
- Edición de código y resolución de issues en repositorios reales mediante interacción multi-paso.
- Ejecución de comandos y uso de herramientas dentro de un bucle de agente (requiere el entorno `mini-swe-agent-plus` y el sandbox Harbor).
- Razonamiento multi-paso y planificación de trayectorias largas de agente.
- Formato de chat y plantilla de conversación incluidos en el repositorio.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo "thinking" explícito.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un problema descrito en lenguaje natural y una base de código, y generar una secuencia de ediciones y comandos para intentar resolverlo, integrándose en un pipeline tipo SWE-bench.
- Agente de código en entornos sandbox: dentro de un sandbox Harbor con `mini-swe-agent-plus`, el modelo actúa como política que decide qué ficheros leer, qué parches aplicar y qué comandos ejecutar, verificando resultados paso a paso.
- Investigación en RL para agentes: sirve como artefacto reproducible para estudiar el efecto de PPO con recompensa de proceso sobre un modelo SFT, comparando el paso 17 con el paso 34 y con la base SFT.
- Evaluación comparativa de agentes de código: puede usarse como baseline en derivaciones de SWE-bench Verified para medir la mejora de técnicas de RL frente a SFT.
- Generación de parches y refactorizaciones acotadas: en tareas de mantenimiento de código donde se requiere modificar varios ficheros de forma coherente y comprobar que las pruebas pasan.
- Automatización de tareas de depuración: el modelo puede inspeccionar trazas, proponer hipótesis y aplicar cambios iterativos dentro de un entorno controlado, siempre que se disponga del verificador externo.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| SWE-bench Verified derivado (490 preguntas) | Evaluación original del step 17 + 30 preguntas de补测, configuraciones heterogéneas | 212/490 = 43,3% (3 inválidas) |
| SWE-bench Verified derivado (500 denominador) | Valor de presentación del proyecto, no es una evaluación uniforme de 500 preguntas | 214/500 = 42,8% |
| SWE-bench Verified derivado (490 preguntas) | Re-evaluación completa del step 17 con configuración unificada | 201/490 = 41,0% |
| SWE-bench Verified derivado (490 preguntas) | Step 34 con la misma configuración unificada | 190/490 = 38,8% |
| SWE-bench Verified derivado (490 preguntas) | SFT base, evaluación única | 197/490 = 40,2% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que las diferencias entre configuraciones impiden atribuir de forma aislada la mejora al PPO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 8B en FP16 se requieren aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genéricas para 8B y no están confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en una RTX 4090 (24 GB) en FP16, y en GPUs de datacenter como A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, 3090 o similares con 24 GB en FP16; en GPUs de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor. Al no publicarse GGUF, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klear-AgentForge-8B-PPO-step17 | 8B | No disponible | Agente de código con PPO | MIT | Hugging Face |
| Klear-AgentForge-8B-SFT (base) | 8B | No disponible | Agente de código con SFT | No disponible en la información | Hugging Face (acceso con consentimiento) |
| Klear-AgentForge-8B (familia Qwen3) | 8B | No disponible | Agente de código | Apache-2.0 | Hugging Face |
| Qwen3-8B (base genérica) | 8B | No disponible | Propósito general | Apache-2.0 | Hugging Face |

La comparación con la base SFT es la más directa: en la re-evaluación unificada, el step 17 obtiene 201/490 frente a 197/490 del SFT, una diferencia de 4 preguntas que el autor no atribuye de forma concluyente al PPO. No se dispone de datos comparativos con otros agentes de código de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo por sí solo no incluye el sandbox Harbor, la ejecución de herramientas, las imágenes de tarea ni el verificador; sin ese entorno no puede resolver tareas de agente de forma autónoma.
- Las métricas publicadas mezclan configuraciones distintas (límites de rollout, runtime, reintentos), por lo que las comparaciones entre step 17, step 34 y SFT no son concluyentes.
- El valor de 42,8% sobre 500 preguntas no corresponde a una evaluación uniforme completa de 500 preguntas; el autor lo advierte explícitamente.
- Riesgo de alucinación en la generación de parches y comandos: el modelo puede proponer cambios incorrectos o comandos no válidos, que deben validarse con el verificador.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado.
- Sesgos: no documentados en la información disponible.
- Licencia MIT permite uso comercial, pero la base `Kwai-Klear/Klear-AgentForge-8B-SFT` exige aceptar condiciones de acceso en su página de Hugging Face; deben revisarse los términos de la base y de Qwen3.
- Contexto máximo no documentado; tareas de repositorios grandes pueden exceder la ventana efectiva.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sisizhang/klear-agentforge-8b-ppo-step17
- Modelo base SFT: https://huggingface.co/Kwai-Klear/Klear-AgentForge-8B-SFT
- Modelo Klear-AgentForge-8B: https://huggingface.co/Kwai-Klear/Klear-AgentForge-8B
- Repositorio GitHub del proyecto: https://github.com/Kwai-Klear/Klear-AgentForge
- Dataset de tareas PPO: https://huggingface.co/datasets/sisizhang/swesmith-critic-ppo-tasks
- Checkpoint del crítico: https://huggingface.co/sisizhang/klear-agentforge-8b-critic-v9-epoch2-5
- Space del proyecto: https://huggingface.co/spaces/sisizhang/harbor-agent-ppo
