# divinetribe/gemma-4-31b-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` es una cuantización de 4 bits en formato MLX del modelo `null-space/gemma-4-31b-it-abliterated`, que a su vez es una versión "abliterated" (sin la dirección de rechazo) de Gemma 4 31B instruct de Google. El autor, divinetribe (Matt Macosko), la publica como pieza del stack `claude-code-local`, orientado a ejecutar Claude Code y otros agentes de codificación íntegramente en local sobre Apple Silicon. El modelo resuelve el problema de desplegar un LLM de 31B parámetros en un Mac sin depender de la nube, comprimiendo los pesos a ~17,3 GB en disco.

La arquitectura subyacente es la de Gemma 4 (transformer denso, multimodal según los tags del repo, con 30.697.345.280 parámetros reales confirmados en los safetensors). La cuantización es afín de 4 bits con group size 64, lo que permite ejecutarlo cómodamente en un Mac de 32 GB de memoria unificada y con holgura en equipos de 64 GB o más. El autor reporta ~15 tok/s en un M4 Max con `mlx-lm` 0.21+.

La relevancia actual radica en dos factores: por un lado, la posibilidad de tener un modelo de 31B con capacidad conversacional y de generación de texto en hardware de consumo Apple; por otro, la naturaleza abliterated del modelo, que elimina los mecanismos de rechazo mediante proyección de la dirección de rechazo (Arditi et al., 2024), lo que lo hace útil para investigación sobre alineación y para flujos donde el filtrado del proveedor resulta limitante. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), multimodal segun tags; cuantizado en MLX |
| Parametros totales | 30.697.345.280 (~30,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX); el modelo base existe en BF16 (~62 GB) |
| Idiomas soportados | Ingles (`en` declarado en la model card) |
| Licencia | Apache 2.0 declarada; enlace de licencia apunta a Gemma 4 de Google |
| Formato de pesos | Safetensors MLX (libreria `mlx`), ~17,3 GB de repo |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint `null-space/gemma-4-31b-it-abliterated`, que a su vez deriva de Gemma 4 31B instruct. La arquitectura es la de Gemma 4: un transformer denso de ~30,7 B parametros con atencion por capas y capacidades multimodales segun los tags del repositorio (aunque la model card no detalla el componente de vision ni como se preserva tras la cuantizacion). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card no los documenta.

La innovacion tecnica destacable es doble. Primero, la abliteration: se aplica la proyeccion de la direccion de rechazo descrita por Arditi et al. (2024), que identifica una direccion en el espacio de activaciones asociada a la negativa a responder y la elimina de los pesos, de modo que el modelo deja de rechazar peticiones. Segundo, la cuantizacion MLX de 4 bits con group size 64, disenada para aprovechar la memoria unificada de Apple Silicon y el backend Metal de `mlx-lm`. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones heredadas de Gemma 4 instruct.
- Capacidades multimodales segun los tags del repo (`multimodal`), si bien la model card no detalla el soporte efectivo de imagen tras la cuantizacion.
- Comportamiento sin rechazos (uncensored) gracias a la abliteration, lo que permite abordar temas que el modelo base rechazaria.
- Integracion con `mlx-lm` para carga directa y generacion.
- Servible a traves de un servidor compatible con la API de Anthropic en el stack `claude-code-local`.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking) en la informacion disponible.
- Idiomas: solo ingles declarado; el multilingue no esta garantizado.

## Casos de uso

- Ejecucion local de asistentes de codificacion: el modelo se integra en `claude-code-local` como backend MLX para correr Claude Code sin conexion, aprovechando sus 31B parametros para tareas de edicion y explicacion de codigo en un Mac de 32 GB o mas.
- Investigacion sobre alineacion y seguridad: la version abliterated permite estudiar como se comporta un modelo de 31B cuando se elimina la direccion de rechazo, comparando respuestas con el checkpoint original de Gemma 4.
- Procesamiento de texto sensible en local: al no requerir API ni nube, encaja en flujos con requisitos de confidencialidad (documentos internos, datos personales) donde no se quiere enviar contenido a un proveedor externo.
- Prototipado de agentes conversacionales: sirve para iterar sobre prompts y flujos multi-turno en un portatil Apple antes de escalar a infraestructura mayor.
- Generacion de contenido editorial sin filtros del proveedor: util para redaccion tecnica o creativa donde las negativas del modelo base resultan un obstaculo, asumiendo la responsabilidad de moderacion.
- Evaluacion comparativa de cuantizaciones: como referencia de calidad 4-bit MLX frente al BF16 de 62 GB, permite medir la perdida de rendimiento por cuantizacion en tareas concretas.
- Despliegue en entornos air-gapped: el stack asociado (AirGap AI) lo orienta a flujos legales, sanitarios o bajo NDA sin salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara un `model-index` con la lista de resultados vacia y no incluye cifras de MMLU, HumanEval, GSM8K ni similares. El unico dato de rendimiento reportado por el autor es el throughput: aproximadamente 15 tokens por segundo en un M4 Max medido con `mlx-lm` 0.21+.

## Requisitos de hardware

- VRAM/memoria unificada: ~17,3 GB en disco para los pesos 4-bit; el autor indica que corre comodamente en un Mac de 32 GB y "vuela" en 64 GB o mas.
- El modelo base BF16 ocupa ~62 GB, por lo que requiere un Mac de 64 GB o superior si se usa sin cuantizar.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor cita explicitamente M4 Max. No se documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo Apple: si, en cualquier Mac con 32 GB o mas de memoria unificada (M-series Pro/Max/Ultra).
- Opciones de despliegue: `mlx-lm` (libreria nativa), servidor MLX compatible con la API de Anthropic del stack `claude-code-local`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y no GGUF.
- Latencia y throughput: ~15 tok/s en M4 Max segun el autor; no se aportan datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | 30,7 B | No disponible | MLX 4-bit | Apache 2.0 (enlace a Gemma 4) | Abliterated, solo Apple Silicon, ~15 tok/s en M4 Max |
| null-space/gemma-4-31b-it-abliterated | 30,7 B | No disponible | BF16 safetensors | No disponible | Modelo base sin cuantizar, ~62 GB |
| Gemma 4 31B instruct (Google) | 31 B | No disponible | Safetensors | Gemma 4 license | Modelo original con rechazos; referencia de calidad |
| Otros modelos de la coleccion Abliterated MLX | 12 B a 70 B | No disponible | MLX 4-bit | Variable | Misma familia de conversiones del autor (Gemma 4 12B, Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer 30B) |

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza precision ni seguridad: el modelo puede generar contenido danino, sesgado o inexacto sin filtro. El autor lo advierte explicitamente ("you are now the moderator").
- Riesgo de alucinacion inherente a un modelo de 31B cuantizado a 4 bits; la cuantizacion puede degradar la calidad respecto al BF16.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Ambiguedad de licencia: se declara Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion. Conviene revisar los terminos antes de produccion.
- Dependencia exclusiva de Apple Silicon y del ecosistema `mlx-lm`; no es portable a CUDA ni a otros backends sin conversion.
- Soporte multimodal incierto tras la cuantizacion; los tags lo indican, pero la model card no lo detalla.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso verificado, lo que limita su uso como agente autonomo sin evaluacion previa.
- El repo tiene pocas descargas (1085) y un solo like, lo que sugiere validacion comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/null-space/gemma-4-31b-it-abliterated
- Coleccion Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
