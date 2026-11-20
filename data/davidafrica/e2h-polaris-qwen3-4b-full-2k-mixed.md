# davidafrica/e2h-polaris-qwen3-4b-full-2k-mixed

## Resumen

e2h-polaris-qwen3-4b-full-2k-mixed es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3-4B, publicado por el usuario davidafrica en Hugging Face. Se trata de un checkpoint de GRPO (Group Relative Policy Optimization) entrenado con un fork de verl 0.4.1 sobre problemas matematicos del conjunto Polaris-Dataset-53K, orientado a mejorar el razonamiento matematico del modelo base. El modelo conserva la arquitectura y el tamano del Qwen3-4B original: 4.411.424.256 parametros en bf16.

La particularidad del entrenamiento es el esquema E2H (easy-to-hard): los problemas se dividieron en bandas faciles y dificiles segun la tasa de acierto del propio Qwen3-4B con 16 muestras por problema. En los problemas faciles la recompensa es basada en reglas contra la respuesta de referencia; en los dificiles se usa voto mayoritario entre 32 muestras por problema, verificado con math_verify y sin emplear nunca la respuesta de referencia.

Este checkpoint corresponde al paso 500 de 500 de la ronda "full-split" en su reejecucion con respuestas limitadas a 2.048 tokens (la primera ronda uso 8.192). Es un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, pensado para experimentacion en razonamiento matematico, no como modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado con GRPO sobre verl 0.4.1 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento limita las respuestas a 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de aproximadamente 4.400 millones de parametros. Sobre esa base se aplica GRPO, un algoritmo de aprendizaje por refuerzo sin modelo critico que estima la ventaja relativa agrupando multiples muestras por prompt. El entrenamiento se ejecuto con un fork de verl 0.4.1 sobre Polaris-Dataset-53K, con los problemas separados en bandas facil y dificil a partir de la tasa de acierto del propio Qwen3-4B con 16 muestras.

Los hiperparametros documentados son: 26.790 problemas de entrenamiento (union de train_easy y train_hard), 64 prompts por paso con 32 muestras cada uno, tasa de aprendizaje 1e-6, perdida KL de 0.001 con la variante low_var_kl y respuestas de hasta 2.048 tokens. La recompensa es basada en reglas para los problemas faciles (comparacion con la respuesta de referencia) y por voto mayoritario entre 32 muestras para los dificiles, verificado con math_verify sin usar la referencia. Este checkpoint es el paso 500 de 500 de la reejecucion a 2k tokens; la model card advierte que la mayoria de respuestas superan los 2.048 tokens y quedan truncadas, y que una respuesta sin `\boxed{}` se puntua por la ultima expresion de su texto. Cada paso guardado (cada 50) es una rama accesible mediante el parametro `revision`, y `main` contiene el paso final.

## Capacidades

- Razonamiento matematico: es la capacidad objetivo del ajuste; el modelo esta entrenado para resolver problemas de competicion y producir respuestas finales, idealmente en formato `\boxed{}`.
- Generacion de texto y razonamiento general: hereda las capacidades del Qwen3-4B base, aunque el ajuste RL se centra en matematicas.
- Modo thinking: Qwen3 incorpora modo de razonamiento extendido; no se documenta en la model card si el ajuste lo preserva o modifica.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- Capacidades de vision o audio: no disponibles (el modelo es solo texto).

## Casos de uso

- Investigacion en RL para matematicas: reproducir o extender el esquema E2H comparando este checkpoint (paso 500) con las ramas intermedias accesibles por `revision` para estudiar la evolucion de la recompensa por bandas de dificultad.
- Generacion de soluciones a problemas de competicion: usar el modelo para producir cadenas de razonamiento y respuestas finales en formato `\boxed{}`, evaluandolas con math_verify en pipelines de verificacion automatica.
- Generacion de datos sinteticos de matematicas: muestrear multiples soluciones por problema (como en el entrenamiento, 32 muestras) y filtrar por voto mayoritario para construir datasets de razonamiento verificados.
- Baseline en evaluaciones de razonamiento: emplearlo como referencia de un modelo de 4B ajustado con GRPO frente al Qwen3-4B original en conjuntos tipo eval_all_small o eval_hard_small.
- Estudio del truncamiento de respuestas: analizar el efecto del limite de 2.048 tokens comparando esta reejecucion con la ronda original de 8.192 tokens, util para decidir presupuestos de generacion en RL.
- Experimentacion con decodificacion y presupuestos de tokens: dado que muchas respuestas se cortan a 2.048 tokens, sirve para medir como afecta el limite a la tasa de acierto y al formato de respuesta final.

## Benchmarks y rendimiento

La model card menciona evaluaciones cada 50 pasos sobre `eval_all_small` (850 problemas, 50 en cada banda de 0 a 16 aciertos de 16 del modelo base) y `eval_hard_small` (1.000 problemas que el base resolvio 0 veces en 16), con 8 muestras por problema, pero no se publican los resultados numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,8 GB solo para pesos (4.411.424.256 parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos moderados.
- Cuantizacion: no se publican pesos cuantizados; habria que generarlos a partir de los safetensors bf16 (por ejemplo, a 8 bits o 4 bits con herramientas externas), sin garantia del autor.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para bf16 en contextos moderados; A100 o H100 para mayor throughput o lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en bf16 con contexto limitado; en 12 GB probablemente requiera cuantizacion.
- Opciones de despliegue: la model card documenta `AutoModelForCausalLM.from_pretrained` y `vllm.LLM` con `revision="step-500"`; llama.cpp u Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-2k-mixed | 4,41 B | no disponible | GRPO sobre matematicas (Polaris) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | ~4 B | no disponible en esta ficha | Modelo generalista con modo thinking | apache-2.0 | Ampliamente disponible |
| Alternativas de 4B ajustadas en matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Truncamiento sistematico: con el limite de 2.048 tokens, la model card indica que la mayoria de respuestas se cortan; las que no incluyen `\boxed{}` se puntuan por la ultima expresion, lo que puede degradar la calidad de la respuesta final en uso real.
- Modelo de investigacion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion externa ni de uso en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos; el entrenamiento con voto mayoritario en problemas dificiles no garantiza correccion.
- Sesgos: no documentados; al no especificarse idiomas ni composicion del dataset de entrenamiento mas alla de Polaris-Dataset-53K, no se pueden evaluar sesgos linguisticos o culturales.
- Limitaciones de idioma: no se documenta que idiomas soporta el ajuste; el entrenamiento se centra en problemas matematicos, probablemente en ingles.
- Licencia: apache-2.0 permite uso comercial, pero al ser un derivado de Qwen3-4B conviene verificar las condiciones del modelo base.
- Caveat de produccion: el ajuste RL puede haber estrechado la distribucion del modelo hacia el formato de respuesta matematica, reduciendo su utilidad como modelo conversacional general.
- Ramas por revision: cargar la revision incorrecta (por ejemplo, `main` frente a `step-500`) puede dar resultados distintos; hay que fijar la revision explicitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-2k-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio verl: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
