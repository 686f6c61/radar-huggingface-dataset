# divinetribe/gemma-4-31b-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` es una cuantización de 4 bits en formato MLX del modelo `null-space/gemma-4-31b-it-abliterated`, que a su vez deriva de Gemma 4 31B (variante instruction-tuned) con la dirección de rechazo ablacionada. Lo publica el desarrollador independiente Matt Macosko bajo el paraguas `divinetribe`, orientado a la inferencia local en Apple Silicon dentro de su stack `claude-code-local`.

El modelo resuelve un problema muy concreto: ejecutar un LLM de 31B parámetros sin censura en un Mac sin recurrir a la nube. Con pesos de 4 bits afines (group size 64) y un peso en disco de ~17,3 GB, cabe en equipos con 32 GB de memoria unificada y se ejecuta con holgura en configuraciones de 64 GB o superiores, usando `mlx-lm` como runtime.

Es relevante por tres motivos: la cuantización MLX nativa para Apple Silicon (frente a GGUF o formatos pensados para CUDA), la eliminación de la dirección de rechazo mediante abliteration según Arditi et al. (2024), y su integración directa en un servidor compatible con la API de Anthropic para ejecutar Claude Code de forma completamente local. La licencia declarada es Apache-2.0, si bien el modelo base Gemma tiene su propia licencia de Google que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), cuantizado a 4 bits |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de 4 bits del checkpoint BF16 `null-space/gemma-4-31b-it-abliterated`, que parte de Gemma 4 31B instruction-tuned. La arquitectura subyacente es la de Gemma 4, un transformer decoder-only con capacidades multimodales segun las etiquetas del repositorio, aunque la cuantizacion se distribuye como pipeline de `text-generation`. La cuantizacion emplea aritmetica afina de 4 bits con tamano de grupo 64, el esquema estandar de `mlx-lm`, que reduce el checkpoint original de ~62 GB a ~17,3 GB en disco.

La innovacion principal no esta en el entrenamiento sino en la modificacion de pesos: la abliteration aplica una proyeccion de la direccion de rechazo segun el metodo de Arditi et al. (2024), eliminando la direccion latente que media en las respuestas de negativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la ficha de Gemma 4 original y no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y respuesta a instrucciones (variante `it`, instruction-tuned).
- Capacidades multimodales declaradas en las etiquetas del repositorio (hereda la naturaleza multimodal de Gemma 4), aunque el pipeline publicado es de generacion de texto.
- Generacion sin rechazos: la abliteration elimina la direccion de rechazo, por lo que el modelo no declina peticiones por politicas de seguridad.
- Ejecucion local en Apple Silicon mediante `mlx-lm`, sin API key ni conexion a la nube.
- Integracion con un servidor compatible con la API de Anthropic para su uso como backend de agentes de codigo (stack `claude-code-local`).
- No se declara soporte explicito de tool calling, function calling ni modos de pensamiento extendido en la informacion disponible.

## Casos de uso

- Agentes de codigo locales: el modelo actua como backend de `claude-code-local`, un servidor MLX nativo con API compatible con Anthropic, permitiendo ejecutar flujos de Claude Code completamente en el dispositivo sin enviar codigo a la nube.
- Desarrollo en entornos con requisitos de confidencialidad: al ejecutarse on-device en un Mac, el codigo y los datos no salen del equipo, lo que encaja en flujos con NDA, legal o sanidad (el autor comercializa una variante AirGap AI para estos escenarios).
- Prototipado sin coste de API: con ~17,3 GB en disco y ejecucion en 32 GB de memoria unificada, sirve para iterar sobre prompts y agentes sin facturacion por token.
- Investigacion sobre alineacion y rechazo: al estar ablacionado, es util para estudiar el comportamiento del modelo sin la capa de negativas y comparar con la version original.
- Asistencia conversacional sin filtros: para casos donde el desarrollador asume el rol de moderador y necesita respuestas sin rechazos (redaccion tecnica sensible, escenarios de red teaming).
- Despliegue en portatiles Apple de gama alta: con ~15 tok/s medidos en M4 Max, es viable para tareas interactivas de generacion y edicion de texto en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del autor declara una entrada sin resultados (`results: []`).

El unico dato de rendimiento publicado es de throughput: aproximadamente 15 tokens por segundo en un Apple M4 Max, medido con `mlx-lm` 0.21 o superior.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,3 GB de pesos en disco; se ejecuta comodamente en Mac con 32 GB de memoria unificada y con holgura en 64 GB o mas.
- GPU recomendadas: Apple Silicon exclusivamente (M-series). El formato MLX no esta pensado para CUDA; en GPUs NVIDIA habria que recurrir a otra cuantizacion del modelo base.
- Cabe en GPU de consumo: si, en Mac con 32 GB o mas de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y superiores).
- Opciones de despliegue: `mlx-lm` (libreria nativa), servidor MLX con API compatible con Anthropic del stack `claude-code-local` (`scripts/start-mlx-server.sh`). No se declara soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~15 tok/s en M4 Max segun el autor; no se proporcionan datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | ~30,7B | no disponible | MLX 4-bit | apache-2.0 | Ablacionado, on-device Apple Silicon |
| null-space/gemma-4-31b-it-abliterated | ~31B | no disponible | BF16 safetensors (~62 GB) | no disponible | Modelo base sin cuantizar, requiere mucha mas memoria |
| Gemma 4 31B IT (original) | ~31B | no disponible | safetensors | licencia Gemma de Google | Version con alineacion de seguridad intacta |
| Otros modelos de la coleccion divinetribe (Gemma 4 12B, Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer 30B) | 12B–70B | no disponible | MLX 4-bit | variable | Misma familia de cuantizaciones ablacionadas para Mac |

La comparacion con alternativas de la misma categoria (mismo tamano o misma tarea) no dispone de datos de rendimiento publicados; la tabla recoge solo diferencias de formato, tamano y licencia.

## Limitaciones y advertencias

- Modelo ablacionado: la eliminacion de la direccion de rechazo implica que no aplica filtros de seguridad; el autor advierte explicitamente que "ahora eres tu el moderador". No es apto para despliegues publicos sin una capa de moderacion externa.
- Riesgo de alucinacion: como cualquier LLM de su tamano, puede generar contenido factualmente incorrecto, especialmente en dominios especializados.
- Idioma: solo se declara ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto soportada; conviene verificar la ficha del modelo base antes de usarlo en tareas de contexto largo.
- Licencia: el repositorio declara Apache-2.0, pero enlaza a la licencia de Gemma 4 de Google; es necesario revisar los terminos de uso comercial del modelo base, que pueden imponer restricciones adicionales.
- Hardware: dependencia total de Apple Silicon y del runtime `mlx-lm`; no hay soporte declarado para CUDA, ROCm ni CPU generica.
- Multimodalidad: aunque las etiquetas mencionan `multimodal`, el pipeline publicado es de generacion de texto y no se documenta el uso de entradas de imagen.
- Mantenimiento: es una cuantizacion de un tercero sobre un modelo ablacionado de otro tercero; la trazabilidad de cambios y la calidad del checkpoint dependen del autor, no de Google.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/null-space/gemma-4-31b-it-abliterated
- Coleccion Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- Portafolio: https://nicedreamzwholesale.com/software/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
