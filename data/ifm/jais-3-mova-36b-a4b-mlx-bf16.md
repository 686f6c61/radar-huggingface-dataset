# IFM/Jais-3-MoVA-36B-A4B-MLX-bf16

## Resumen

Jais-3-MoVA-36B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo IFM (Inception42), orientado especificamente al arabe y al ingles y disenado para cargas de trabajo agenticas. Emplea una arquitectura propia denominada `k2_horizon` con atencion "Mixture-of-Values" (MoVA), cuenta con 36B parametros totales de los que aproximadamente 4B se activan por token, y ofrece una ventana de contexto de 512K tokens. Esta ficha describe la conversion a formato MLX en bf16, pensada para ejecucion en Apple silicon.

El modelo base resuelve el problema de disponer de un LLM de gran contexto y capacidad agentica con cobertura real del arabe, un idioma historicamente infrarrepresentado en los modelos abiertos. La variante aqui documentada no introduce cuantizacion: parte del checkpoint original en fp32 y redondea los pesos a bf16, empaquetando los pesos de los expertos para `gather_mm`.

Su relevancia actual radica en que permite ejecutar un MoE de 37.400 millones de parametros en hardware Apple con un unico flag de `trust-remote-code`, mientras el soporte nativo de la arquitectura `k2_horizon` aun no ha llegado a `mlx-lm`. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion Mixture-of-Values (MoVA), arquitectura `k2_horizon` |
| Parametros totales | 37.444.792.020 (~36B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | bf16 (esta variante); existen variantes MLX de 8 bits y 4 bits del mismo autor |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), bf16; repo de 74,9 GB |

## Arquitectura y entrenamiento

La arquitectura `k2_horizon` combina capas densas con capas MoE que incorporan atencion Mixture-of-Values. Segun la model card, el modelo consta de 3 capas densas seguidas de capas MoE + MoVA (la verificacion de conversion se realizo truncando el modelo a sus 5 primeras capas: 3 densas y 2 MoE + MoVA, mas la norm final y el `lm_head`). El enrutamiento activa aproximadamente 4B de los 36B parametros por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.

El checkpoint original se almacena en fp32; esta conversion aplica redondeo a bf16 (round-to-nearest-even) y agrupa los pesos de los expertos para `gather_mm`. La verificacion de equivalencia frente al codigo PyTorch (`modeling_k2_horizon.py`) se hizo en fp32 sobre los pesos reales, con ambos lados redondeados a bf16, sobre prompts en ingles, codigo, arabe y matematicas: los logits coinciden con error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens (64/64 en cada prompt). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento con modo "thinking": el modelo razona antes de responder dentro de las etiquetas `<ifm|think> … </ifm|think>`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` en la plantilla de chat, con niveles `"high"` (por defecto), `"medium"` y `"low"`.
- Soporte de tool calling / function calling (el formato de llamada a herramientas existe, aunque `mlx-lm` aun no lo parsea).
- Capacidad agentica y razonamiento multi-paso, segun la orientacion del modelo base ("Arabic-centric Agentic AI").
- Ventana de contexto de 512K tokens para conversaciones y documentos extensos.
- Capacidades multilingues limitadas a arabe e ingles.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 512K tokens de ventana, manteniendo el hilo de incidencias extensas sin truncar el historial.
- Agentes autonomos con herramientas: el soporte de tool calling y el modo de razonamiento permiten construir agentes que planifican varios pasos y llaman a APIs, ajustando el nivel de esfuerzo con `reasoning_effort` para equilibrar coste y precision.
- Procesamiento de documentos legales o administrativos en arabe: la ventana de 512K permite ingerir contratos o expedientes completos y responder preguntas sobre ellos en una sola pasada.
- Asistencia a desarrolladores en entornos Apple: integrable en `mlx_lm.server` para ofrecer un endpoint compatible con clientes estilo OpenAI sobre hardware Apple silicon, con generacion de codigo y explicaciones.
- Analisis de corpus y resumenes de gran extension: resumir articulos de Wikipedia arabe o informes largos aprovechando el contexto extendido y el bilingueismo ar/en.
- Investigacion en PLN arabe: evaluar y experimentar con un MoE de 36B en tareas de razonamiento y generacion en arabe sobre equipos de escritorio con chip M-series, sin necesidad de GPUs de datacenter.
- Traduccion y adaptacion de contenido ar-en: redaccion y localizacion de material tecnico o comercial entre ambos idiomas.

## Benchmarks y rendimiento

La model card solo publica mediciones para la variante de 4 bits; bf16 y 8 bits no pudieron probarse. Perplejidad sobre 128 × 512 tokens (menor es mejor) y velocidad de generacion en un Apple M4 Max:

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 5,6 |
| Disco | 74,9 GB | 39,8 GB | 26,4 GB |
| Memoria pico | n/a | n/a | 26,6 GB |
| Perplejidad WikiText-2 (ingles) | n/a | n/a | 10,585 |
| Perplejidad Wikipedia arabe | n/a | n/a | 13,143 |
| Generacion | n/a | n/a | 67,3 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo bf16 ocupa 74,9 GB en disco, por lo que la inferencia en bf16 requiere al menos ~75 GB de memoria unificada; la variante de 4 bits necesita ~26,6 GB de memoria pico.
- GPU recomendadas: hardware Apple silicon con memoria unificada suficiente (la model card cita un Apple M4 Max para las mediciones). No es compatible con CUDA sin conversion a otro formato.
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB en bf16; la variante de 4 bits (~26,6 GB) queda al limite de una RTX 4090 de 24 GB y no esta pensada para CUDA. En Apple silicon, requiere configuraciones de gama alta con 64 GB o mas para bf16.
- Opciones de despliegue: `mlx-lm` (libreria `mlx`, versiones 0.32.0 probadas) con `--trust-remote-code`; disponibles `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput: 67,3 tok/s en Apple M4 Max para la variante de 4 bits; sin datos para bf16 ni 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B (MLX bf16) | 36B totales / ~4B activos | 512K | ar, en | Apache-2.0 | safetensors MLX |
| Jais-3-MoVA-36B-A4B (MLX 4-bit) | 36B totales / ~4B activos | 512K | ar, en | Apache-2.0 | safetensors MLX 4-bit |
| Jais-3-MoVA-36B-A4B (base, PyTorch) | 36B totales / ~4B activos | 512K | ar, en | Apache-2.0 | safetensors fp32 |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos comparables (por ejemplo, otros LLM centrados en arabe) que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Cobertura linguistica limitada a arabe e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los LLM; la model card no documenta evaluaciones especificas de fidelidad factual.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento en la informacion disponible.
- `mlx-lm` aun no reconoce las etiquetas `<ifm|think>`: `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado, y el formato de tool calling no se parsea.
- Requiere `--trust-remote-code` / `trust_remote_code=True`, ya que el codigo de la arquitectura `k2_horizon` se distribuye en el propio repo y se ejecuta en la maquina del usuario.
- La plantilla de chat incluida modifica el comportamiento original: renderiza un bloque de razonamiento vacio cuando un mensaje previo del asistente no incluye campo de thinking (caso habitual en clientes estilo OpenAI).
- Es necesario reservar espacio en `max_tokens` para el bloque de razonamiento, ya que el modelo piensa antes de responder.
- La perplejidad es una senal tosca; conviene validar la variante elegida sobre la carga de trabajo real.
- Uso comercial permitido por Apache-2.0, heredada del modelo base; deben revisarse los terminos del modelo base para detalles adicionales.

## Enlaces

- Modelo en Hugging Face (esta variante): https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Modelo base: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B
- Variante MLX 8 bits: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Variante MLX 4 bits: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Paper (arXiv 2611.10224): https://arxiv.org/abs/2611.10224
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B
