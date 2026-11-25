# luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-unlocked es una derivación del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` en la que se ha eliminado el comportamiento de rechazo (refusal) mediante una técnica de abliteración aplicada directamente en el espacio GGUF. El autor, luvette, parte del fichero Q4_K_M ya publicado del modelo original y ortogonaliza dos direcciones de los pesos residuales (`attn_output` y `ffn_down`, capas 8 a 33) sin necesidad de checkpoint en BF16, fine-tuning ni reentrenamiento. El resultado es un modelo conversacional que responde a solicitudes que el modelo base rechazaría, manteniendo la coherencia general del texto.

El modelo base es un transformer de NVIDIA con 7.518.069.290 parámetros totales (aproximadamente 7,5 mil millones), entrenado sobre Gemma 4 de Google según la model card, y distribuido bajo la licencia OpenMDW 1.1. La variante unlocked conserva la arquitectura y el tokenizador del original, pero modifica 52 tensores para eliminar el eje de rechazo. Es relevante para desarrolladores que necesitan un modelo local sin filtros de rechazo para investigación sobre seguridad, generación de contenido sin restricciones o estudios de alineación, aunque con las advertencias éticas y legales correspondientes.

La ficha se centra en el modelo unlocked publicado en Hugging Face, con 459 descargas y 1 like en el momento de la consulta. El repositorio ocupa 5,3 GB e incluye pesos en formato GGUF cuantizados a Q4_K_M, listos para su uso con llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de NVIDIA Nemotron-3.5-Bolt-E4B, post-entrenado sobre Gemma 4) |
| Parametros totales | 7.518.069.290 (~7,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repo); `per_layer_token_embd` en q8_0 según la receta de llama.cpp |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (OpenMDW License 1.1); el modelo base incorpora componentes de Gemma 4 bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado del Nemotron-3.5-Bolt-E4B de NVIDIA, que según la model card fue post-entrenado sobre Gemma 4 de Google. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La variante unlocked no reentrena el modelo: parte del fichero GGUF Q4_K_M publicado y aplica una modificación de pesos en el espacio de cuantización.

La innovación técnica principal es la abliteración en espacio GGUF. Se calculan dos direcciones en el espacio residual: una dirección de contenido (`mean(harmful) − mean(harmless)` sobre 416 prompts de cada tipo) y una dirección de estado de rechazo (obtenida forzando dos aperturas distintas sobre el mismo prompt: `**Content Filter Response:**` frente a `Sure, here is a detailed answer:`). Ambas direcciones se ortogonalizan mediante Gram-Schmidt y se aplica la proyección `W' = W − 1.5·R(RᵀW)` sobre 52 tensores (`attn_output.weight` y `ffn_down.weight` de las capas 8 a 33). La pérdida de norma de los pesos es inferior al 0,07% y el resultado se recuantiza a Q4_K_M. Según el autor, la segunda dirección solo está alineada entre 0,3 y 0,5 con la primera en la zona media de la red, lo que justifica eliminar un subespacio bidimensional en lugar de un único eje.

## Capacidades

- Generación de texto conversacional en inglés, con formato de turnos tipo Gemma 4 (`<|turn>user`, `<|turn>model`).
- Modo de razonamiento (thinking) opcional mediante `<|channel>thought\n…<channel|>` y `chat_template_kwargs: {"enable_thinking": true}` con `--jinja`.
- Respuesta a solicitudes que el modelo base rechazaría: 0/100 rechazos en JBB-Behaviors, 0/60 en jailbreaks reales, 0/100 en AdvBench y 0/3 en prompts DAN.
- Coherencia mantenida en instrucciones benignas: 0/24 rechazos en Harmless Alpaca, igual que el base.
- Sin capacidades multimodales, de audio ni de visión documentadas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking está disponible pero no se detallan capacidades agénticas.
- Multilingüe: limitado a inglés según el campo `language: en`.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un LLM sin ejes de rechazo, comparando respuestas con el base en conjuntos como JBB-Behaviors o AdvBench, gracias a que el autor documenta el proceso de abliteración y las métricas de rechazo.
- Red teaming y evaluación de guardrails: sirve como modelo adversario controlado para probar clasificadores de contenido y sistemas de moderación, ya que genera contenido que el base rechazaría de forma consistente (0/100 en JBB-Behaviors).
- Generación de ficción y contenido creativo sin restricciones: útil para escritura de narrativa que aborde temas sensibles (violencia, drama, contenido para adultos) donde el modelo base introduce rechazos o disclaimers; el Modelfile incluido suprime los preámbulos residuales.
- Despliegue local en hardware de consumo: con Q4_K_M y offload completo cabe en una RTX 3070 a ~94 tok/s según el autor, lo que permite ejecutar el modelo en estaciones de trabajo domésticas mediante llama.cpp u Ollama.
- Experimentación con formatos de chat y modo thinking: el repositorio documenta el formato de turnos y el canal de pensamiento, lo que facilita probar pipelines de razonamiento explícito en local con `llama-server --jinja`.
- Estudio de la técnica de abliteración en GGUF: el modelo sirve como caso práctico de modificación de pesos sin checkpoint BF16, útil para investigadores que quieran replicar el método en otros modelos cuantizados.
- Asistente conversacional sin filtros para prototipos internos: en entornos controlados donde se requiere un modelo que no decline solicitudes legítimas pero mal interpretadas por el base (por ejemplo, "renderiza un modelo 3D"), el modelo unlocked evita los rechazos espurios documentados en el base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (decodificación greedy, temperatura 0, 96–160 tokens nuevos):

| Benchmark | Base | Este modelo |
|---|---|---|
| JBB-Behaviors (100 objetivos dañinos) | 94/100 rechazados | 0/100 |
| Jailbreaks reales (60 prompts) | 25/60 | 0/60 |
| AdvBench (100 objetivos, held out) | no disponible | 0/100 |
| Prompts DAN (3 que sobrevivieron a v1) | 3/3 | 0/3 |
| Thinking activado (12 objetivos JBB) | no disponible | 0/12 razonamiento, 0/12 salida |
| Harmless Alpaca (24 instrucciones) | 0/24 | 0/24 |
| Perplejidad Wikitext-2 (44×512) | 107,19 | 89,01 |

El autor señala que la mejora de perplejidad se debe a que el modelo base filtraba texto de rechazo en contenido neutro, no a una ganancia general de capacidad; solo se realizaron comprobaciones puntuales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,3 GB en Q4_K_M; con offload completo y contexto de 8K se requiere aproximadamente 6–7 GB de VRAM.
- GPU recomendadas: RTX 3070 (probada por el autor a ~94 tok/s con offload completo), RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM en Q4_K_M; en 6 GB puede requerir offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (directo desde el repo con `ollama run hf.co/luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF:Q4_K_M` o mediante `Modelfile` local). No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput: ~94 tok/s en RTX 3070 a Q4_K_M con offload completo, según el autor. No se dispone de datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-unlocked (este) | ~7,5 B | no disponible | OpenMDW 1.1 | GGUF Q4_K_M | Abliterado, 0 rechazos en JBB-Behaviors |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (base) | ~7,5 B | no disponible | OpenMDW 1.1 | BF16 / GGUF | 94/100 rechazos en JBB-Behaviors; filtra rechazos en texto neutro |
| Alternativas abliteradas de ~7–8 B | no disponible | no disponible | variable | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se han identificado en la información disponible otros modelos abliterados comparables con métricas publicadas equivalentes; la comparación directa más fiable es con el modelo base de NVIDIA, del que se conocen los resultados de rechazo y perplejidad.

## Limitaciones y advertencias

- Residuo estilístico, no rechazo: el modelo a menudo abre con un párrafo de "Disclaimer / legality" y después cumple; un intento de corrección a nivel de pesos destruyó el modelo (8/60 rechazos, PPL 177), por lo que se mitiga con el system prompt del `Modelfile`.
- Las direcciones de abliteración están en distribución: los 0 rechazos en tres conjuntos held-out son evidencia fuerte, pero no prueba para prompts adversarios arbitrarios.
- 3 de los 6 prompts DAN usados para la dirección de estado están in-sample; la otra mitad del conjunto de jailbreaks (30 prompts) nunca se usó y da 0/30.
- La cuantización Q4_K_M degrada ligeramente la calidad frente al BF16 original; `per_layer_token_embd` se mantiene en q8_0 según la receta por defecto de llama.cpp.
- Sin revisión de seguridad: los guardrails se eliminan por construcción y el modelo producirá contenido no permitido bajo solicitud; su uso comercial o público requiere evaluación legal y ética.
- Idioma limitado a inglés; no se documenta soporte multilingüe.
- Licencia OpenMDW 1.1 con avisos adicionales de NVIDIA y Gemma 4 (Apache 2.0); es responsabilidad del usuario verificar el cumplimiento de ambas licencias para uso comercial.
- Riesgo de alucinación no cuantificado en la información disponible; no se han publicado evaluaciones de factualidad.
- No se documentan sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luvette/Nemotron-3.5-Bolt-E4B-unlocked-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0 (componentes Gemma 4): https://www.apache.org/licenses/LICENSE-2.0/
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
