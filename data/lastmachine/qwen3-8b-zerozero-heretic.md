# LastMachine/Qwen3-8B-ZeroZero-Heretic

## Resumen

Qwen3-8B ZeroZero Heretic es una versión modificada de Qwen3-8B, el modelo de 8.200 millones de parámetros del equipo Qwen, publicada por el usuario LastMachine en Hugging Face. La modificación se ha realizado con la herramienta Heretic 2, un proceso de abliteración sin entrenamiento que elimina las capas o direcciones responsables de los rechazos y reduce el "slop" (frases hechas, relleno y lenguaje genérico típico de los LLM). El resultado es un modelo sin salvaguardas integradas y con una prosa notablemente más limpia, manteniendo la arquitectura, el tokenizador y el modo de razonamiento ("thinking mode") del modelo original.

El problema que resuelve es doble: por un lado, ofrece un modelo base sin rechazos para desarrolladores que necesitan control total sobre la moderación (implementándola ellos mismos aguas abajo); por otro, combate el estilo inflado y repetitivo que caracteriza a muchos modelos alineados. Según los datos publicados por el autor, los rechazos en el test de prompts dañinos de Heretic se reducen un 91 % y las palabras "slop" por cada mil tokens un 78 %, sin pérdida medible en las comprobaciones de hechos y lógica.

Es relevante ahora porque representa la tendencia de los modelos abliterados de segunda generación: no se limitan a quitar rechazos, sino que también optimizan la calidad de la escritura. El modelo conserva el contexto nativo de 32.768 tokens de Qwen3-8B y se distribuye en safetensors, GGUF (Q4_K_M) y MLX 4-bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), 36 capas |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Safetensors (sin cuantizar), GGUF Q4_K_M, MLX 4-bit |
| Idiomas soportados | Ingles (etiquetado oficial); el modelo base Qwen3 soporta mas idiomas, pero no disponible en la ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal), GGUF y MLX en reposositorios separados |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Qwen3-8B original: un transformer decoder denso (no MoE) de 8,19 B de parametros y 36 capas, con contexto nativo de 32.768 tokens y el mismo tokenizador. No hay reentrenamiento ni ajuste fino supervisado: Heretic 2 es una herramienta de modificacion sin entrenamiento (training-free) que identifica y elimina las direcciones del espacio latente responsables de los rechazos y del estilo "slop", mediante busquedas de 50 ensayos para rechazos y 50 para slop (se seleccionaron los ensayos 39 y 20, respectivamente).

Sobre el modelo base: Qwen3-8B fue entrenado por el equipo Qwen segun el Qwen3 Technical Report (arXiv:2505.09388), con preentrenamiento a gran escala y un regimen de alineacion que incluye razonamiento en modo "thinking". Los datos concretos de tokens y composicion del dataset de Qwen3-8B no estan detallados en la informacion disponible. La divergencia KL respecto al modelo base es de 2,69 en prompts inofensivos, lo que indica una modificacion sustancial; respecto al modelo decensurado previo a la pasada "noslop", la KL en prompts de escritura es de 0,76.

## Capacidades

- Generacion de texto conversacional con estilo reducido en "slop": un 68 % menos de respuestas que tocan la lista de slop y un 78 % menos de palabras slop por cada mil tokens.
- Modo de razonamiento "thinking" heredado de Qwen3-8B, activable o desactivable mediante `enable_thinking=True/False` en la plantilla de chat (bloque `<think>`).
- Respuestas a solicitudes que el Qwen3-8B original rechaza: solo 9 de 100 prompts del test de Heretic reciben rechazo (frente a 100/100 del original).
- Razonamiento factual y logico preservado: 13/15 en las comprobaciones de hechos y logica del autor, sin cambio respecto al modelo base.
- Contexto largo de 32.768 tokens para conversaciones multi-turno y documentos extensos.
- Soporte de tool calling / function calling: heredado potencialmente de Qwen3-8B, pero no verificado en la informacion disponible para esta version modificada.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero esta version esta etiquetada oficialmente solo en ingles y las metricas se midieron en ingles.
- Sin vision, audio ni otras modalidades: es un modelo de solo texto (text-generation).

## Casos de uso

- Escritura creativa y redaccion sin estilo genérico: al reducir un 78 % las palabras slop, es adecuado para generar narrativa, ensayos o copys donde la prosa inflada de los modelos alineados es un problema.
- Agentes y pipelines con moderacion propia: al carecer de filtros integrados, permite a los desarrolladores implementar capas de moderacion personalizadas aguas abajo, controlando exactamente que se bloquea.
- Investigacion en alineacion y abliteracion: la divergencia KL documentada (2,69 respecto al base) y la metodologia de Heretic lo hacen util como sujeto de estudio sobre como la eliminacion de rechazos afecta al comportamiento del modelo.
- Chatbots locales en Apple Silicon: la version MLX 4-bit funciona en LM Studio y mlx-lm, ideal para asistentes personales offline en Mac.
- Despliegue en hardware de consumo: la version GGUF Q4_K_M permite ejecutarlo en LM Studio, llama.cpp u Ollama en GPUs y CPUs domesticas.
- Analisis de sesgos y censura: util para comparar respuestas de modelos con y sin salvaguardas, aunque el propio autor advierte que en temas sensibles sobre China reproduce la narrativa oficial sanitizada del modelo base.
- Prototipado rapido de asistentes conversacionales: el contexto de 32.768 tokens permite gestionar conversaciones multi-turno largas sin gestion compleja de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas propias de la modificacion:

| Measure | Cambio | Antes | Despues |
|---|---:|---:|---:|
| Rechazos en test de prompts dañinos de Heretic | 91 % menos | 100/100 | 9/100 |
| Respuestas que tocan la lista de slop | 68 % menos | 78/100 | 25/100 |
| Palabras slop por 1.000 | 78 % menos | 16,5 | 3,6 |
| Comprobaciones de hechos y logica superadas | Sin cambio | 13/15 | 13/15 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors, BF16/FP16): aproximadamente 16-17 GB para los pesos, mas la cache de contexto; una GPU de 24 GB (RTX 3090/4090) es suficiente.
- Version GGUF Q4_K_M: aproximadamente 5-6 GB; cabe en GPUs de consumo de 8 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) e incluso en CPU+RAM en equipos modestos.
- Version MLX 4-bit: aproximadamente 5 GB de memoria unificada; funciona en Apple Silicon con 8 GB o mas de RAM (recomendado 16 GB).
- GPU recomendadas: RTX 3090/4090 para la version sin cuantizar; cualquier GPU de 8-12 GB para la version Q4_K_M.
- Despliegue: Transformers (>= 4.51.0), LM Studio (versiones MLX y GGUF), mlx-lm, llama.cpp y Ollama (version GGUF). No hay menciones explicitas a vLLM o TGI en la ficha.
- Latencia y throughput estimados: no disponible.
- Ajustes de muestreo recomendados (heredados de Qwen): modo thinking, temperatura 0,6, top-p 0,95, top-k 20; modo no-thinking, temperatura 0,7, top-p 0,8, top-k 20. No usar decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Caracteristica distintiva |
|---|---|---|---|---|---|
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8,19 B | 32.768 | Safetensors, GGUF, MLX | Apache 2.0 | Abliterado con Heretic 2, sin rechazos y con slop reducido |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 | Safetensors, GGUF | Apache 2.0 | Modelo original con salvaguardas y modo thinking |
| Otros modelos abliterados de 8 B (p. ej. variantes abliterated de Llama-3.1-8B) | ~8 B | 128.000 (Llama-3.1) | GGUF, Safetensors | Licencia Llama 3.1 (uso comercial con condiciones) | Eliminan rechazos pero normalmente sin pasada anti-slop |

Nota: la comparativa con variantes abliteradas concretas se ofrece a titulo orientativo; no hay datos de benchmarks comparativos publicados para esta version modificada.

## Limitaciones y advertencias

- Sin salvaguardas de ningun tipo: puede responder a solicitudes que el modelo original rechaza. Si se expone a usuarios reales, es obligatorio poner una capa de moderacion propia por delante.
- Sesgos heredados del modelo base: el propio autor documenta que en temas sensibles sobre China (Tiananmen, Taiwan) el modelo reproduce la narrativa oficial sanitizada, sin las protestas ni la represion. Menos rechazos no significa mas verdad.
- Riesgo de alucinacion: sigue siendo un LLM y puede estar confiadamente equivocado. La reduccion de slop no mejora la veracidad.
- Mala capacidad de contraargumentacion: el autor documenta que califico de "no del todo irrazonable" invertir los ahorros en loteria. No usarlo para decisiones financieras, medicas o legales.
- Idioma: etiquetado oficialmente solo en ingles; el rendimiento en otros idiomas, incluido el castellano, no esta verificado en la ficha.
- Sin verificacion de capacidades: el soporte de tool calling y el rendimiento en benchmarks estandar no han sido validados tras la modificacion; la abliteracion con KL de 2,69 respecto al base podria afectar a capacidades no medidas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero la herramienta Heretic es AGPL-3.0 (relevante solo si se reutiliza la herramienta, no los pesos).
- Responsabilidad legal: el uso del modelo y el cumplimiento de la legislacion aplicable son responsabilidad del usuario.

## Enlaces

- Modelo principal: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Version MLX 4-bit: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Version GGUF Q4_K_M: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF
- Coleccion ZeroZero: https://huggingface.co/collections/LastMachine/zerozero-6af68595b0b72f13ce60bde2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Autor: https://huggingface.co/LastMachine
