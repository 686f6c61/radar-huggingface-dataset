# IFM/Jais-3-0.9B-MLX-8bit

## Resumen

Jais-3-0.9B-MLX-8bit es la version cuantizada a 8 bits en formato MLX del modelo Jais-3-0.9B, desarrollado por el equipo IFM (Inception42) como miembro compacto de la familia Jais-3, centrada en arabe e ingles. Se trata de un modelo decoder-only denso de aproximadamente 1.078 millones de parametros (clase 0.9B) con una ventana de contexto de 128K tokens, disenado para generacion de texto y conversacion con capacidades de razonamiento explicito ("thinking mode") y soporte de agentes.

La relevancia de esta variante concreta es practica: permite ejecutar el modelo en Apple Silicon mediante la libreria mlx-lm con un consumo de memoria pico de aproximadamente 1.2 GB para prompts cortos y un rendimiento de generacion de 310.5 tokens por segundo en un Apple M4 Max, manteniendo practicamente identica la perplejidad respecto a la version bf16 (22.975 frente a 22.994 en WikiText-2 en ingles, y 18.365 frente a 18.369 en Wikipedia en arabe).

El modelo base emplea una arquitectura propietaria denominada `k2_horizon`, que mlx-lm aun no soporta de forma nativa; por ello el repositorio incluye el codigo del modelo (`k2_horizon.py`) que se carga mediante `trust_remote_code`. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (decoder-only denso, definida en `k2_horizon.py` / `modeling_k2_horizon.py`) |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 8-bit entero afin, group size 64, en todas las capas lineales y embeddings (8.5 bits/peso efectivos) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo de modelo Python incluido en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Jais-3, identificado internamente con la arquitectura `k2_horizon`. La model card de esta variante cuantizada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron fases de RLHF o DPO; esa informacion remite a la model card del modelo base (IFM/Jais-3-0.9B). La familia Jais-3 se presenta en el paper asociado (arXiv:2611.10224) como "Arabic-centric Agentic AI", lo que situa el foco del entrenamiento en capacidades agenticas y en el rendimiento en arabe.

La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion y conversion a MLX: cuantizacion entera afin de 8 bits con group size 64 aplicada a todas las capas lineales y a los embeddings, con verificacion contra el codigo PyTorch original en fp32 sobre los pesos reales del modelo. Segun el autor, los logits coinciden con un error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens que PyTorch (64/64 en cada prompt probado). El modelo incorpora ademas un modo de razonamiento explicito delimitado por las etiquetas `<ifm|think> ... </ifm|think>`, con niveles de esfuerzo configurables (`high`, `medium`, `low`) a traves del parametro `reasoning_effort` de la plantilla de chat.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles.
- Razonamiento explicito mediante modo "thinking" (`<ifm|think>`), con tres niveles de esfuerzo configurables.
- Razonamiento matematico basico (el autor menciona pruebas con prompts de matematicas durante la verificacion de conversion).
- Generacion y comprension de codigo (se cita la comprobacion con prompts de codigo).
- Soporte de tool calling / function calling: la model card menciona que existe un formato de tool-call, aunque mlx-lm todavia no lo parsea.
- Capacidades orientadas a agentes y razonamiento multi-paso, segun el enfoque declarado de la familia Jais-3 ("Agentic AI").
- Ventana de contexto larga de 128K tokens.
- Capacidades multilingues limitadas a arabe e ingles.

## Casos de uso

- Asistente conversacional en arabe en dispositivos Apple: el modelo puede gestionar dialogos multi-turno con contexto largo gracias a sus 128K tokens y ejecutarse localmente en un Mac con solo 1.2 GB de memoria pico, sin depender de la nube.
- Prototipado rapido en Apple Silicon: investigadores pueden validar prompts, plantillas de chat y modos de razonamiento con `mlx_lm.generate` o `mlx_lm.chat` antes de escalar a la version bf16 o a hardware CUDA.
- Generacion de codigo en local: util para autocompletado y explicacion de fragmentos en entornos de desarrollo sobre macOS, con la ventaja de no enviar codigo a servicios externos.
- Procesamiento de documentos largos en arabe: resumen y extraccion de informacion de articulos o informes que quepan en la ventana de 128K tokens, con buena fidelidad linguistica segun la perplejidad medida en Wikipedia en arabe.
- Razonamiento asistido con coste controlado: el nivel `reasoning_effort="low"` permite reducir el numero de tokens de pensamiento en tareas simples, mientras que `"high"` se reserva para problemas que requieren varios pasos.
- Base para experimentos de agentes: al disponer de formato de tool-call y modo thinking, sirve para construir pipelines multi-paso en entornos de investigacion, asumiendo que el parseo de herramientas debe implementarse aparte en mlx-lm.
- Evaluacion de cuantizacion: caso de uso meta para equipos que comparan variantes bf16, 8-bit y 4-bit del mismo modelo con el mismo harness de perplejidad y velocidad.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan las tres variantes MLX de Jais-3-0.9B. La perplejidad se mide sobre 128 fragmentos de 512 tokens (WikiText-2 test y primeros articulos del dump de Wikipedia en arabe `20231101.ar`); la velocidad se mide en un Apple M4 Max.

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16.0 | 8.5 | 6.4 |
| Disco | 2.2 GB | 1.1 GB | 0.9 GB |
| Memoria pico | 2.2 GB | 1.2 GB | 1.0 GB |
| Perplejidad WikiText-2 (ingles) | 22.994 | 22.975 (-0.1%) | 23.910 (+4.0%) |
| Perplejidad Wikipedia arabe | 18.369 | 18.365 (-0.0%) | 19.275 (+4.9%) |
| Velocidad de generacion | 198.9 tok/s | 310.5 tok/s | 384.3 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para esta variante.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1.2 GB de pico para prompts cortos en la variante 8-bit; el cache KV crece con la longitud del contexto.
- Hardware objetivo: Apple Silicon (el formato MLX esta pensado para chips M-series); las pruebas de velocidad se realizaron en un Apple M4 Max.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente, ya que MLX no esta orientado a CUDA; para esas GPUs habria que usar la version PyTorch del modelo base.
- Cabe holgadamente en cualquier Mac con Apple Silicon; el limite practico es la memoria unificada disponible cuando se usan contextos muy largos.
- Opciones de despliegue: `mlx-lm` (version probada 0.32.0) mediante `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`, siempre con `--trust-remote-code`. vLLM, llama.cpp, Ollama y TGI no estan soportados para este formato segun la informacion disponible.
- Latencia y throughput: 310.5 tokens/s de generacion en Apple M4 Max para la variante 8-bit.
- Reduccion de memoria: `--max-kv-size` y cuantizacion del cache KV (`--kv-bits 8`, donde este disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jais-3-0.9B-MLX-8bit | 1.078 M | 128K | 8-bit (8.5 bits/peso) | 1.2 GB | Apache-2.0 | MLX, requiere `trust-remote-code` |
| Jais-3-0.9B-MLX-bf16 | 1.078 M | 128K | bf16 | 2.2 GB | Apache-2.0 | MLX, requiere `trust-remote-code` |
| Jais-3-0.9B-MLX-4bit | 1.078 M | 128K | 4-bit (6.4 bits/peso) | 1.0 GB | Apache-2.0 | MLX, requiere `trust-remote-code` |
| Jais-3-0.9B (base, PyTorch) | 1.078 M | 128K | fp32/bf16 (original) | no disponible | Apache-2.0 | PyTorch |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros desarrolladores del mismo tamano y enfoque linguistico.

## Limitaciones y advertencias

- La arquitectura `k2_horizon` no esta soportada de forma nativa por mlx-lm; es obligatorio usar `--trust-remote-code` y ejecutar codigo Python del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en produccion.
- `mlx_lm.server` no reconoce las etiquetas `<ifm|think>`: el texto de razonamiento se devuelve dentro de `content` en lugar de un campo `reasoning` separado.
- El formato de tool-call no se parsea en mlx-lm; cualquier integracion de function calling requiere implementacion propia.
- La plantilla de chat original falla cuando un mensaje previo del asistente carece de campo de pensamiento (caso habitual en clientes estilo OpenAI); la version de este repo sustituye ese caso por un bloque de pensamiento vacio.
- El modo thinking consume tokens adicionales; hay que reservar espacio en `max_tokens` o la respuesta puede truncarse.
- El cache KV crece con el contexto: los 128K tokens no caben en 1.2 GB; contextos largos requieren mas memoria o tecnicas de reduccion.
- Cobertura linguistica limitada a arabe e ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a modelos de 0.9B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- No se documentan en la informacion disponible sesgos especificos, composicion del dataset ni filtros de seguridad del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones adicionales de uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/Jais-3-0.9B
- Variante bf16: https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- Paper (arXiv): https://arxiv.org/abs/2611.10224
- Codigo del modelo MLX en el repo: `k2_horizon.py`
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-0.9B
