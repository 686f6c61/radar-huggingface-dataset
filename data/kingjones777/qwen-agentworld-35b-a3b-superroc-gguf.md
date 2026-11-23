# kingjones777/Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF

## Resumen

Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF es una cuantización GGUF del checkpoint Qwen/Qwen-AgentWorld-35B-A3B, publicada por el usuario kingjones777. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales, del que el autor indica 35B en el nombre y A3B como referencia a los parámetros activos por token (dato no confirmado numéricamente en la información disponible). El problema que resuelve esta publicación no es el modelado en sí, sino el despliegue: ofrece un único fichero GGUF cuantizado en formato ROCm-FP4 optimizado para el motor Super Roc sobre hardware Strix Halo (AMD Ryzen AI Max+ 395, gfx1151).

La relevancia es de nicho pero concreta: permite ejecutar un modelo de ~35B parámetros totales en un equipo con memoria unificada de 128 GB y GPU integrada AMD, con un contexto cargado de 131.072 tokens y un rendimiento medido de 71,83 tok/s en generación con prompt de 1k y 169,03 tok/s con prompt de 8k. No es una publicación de investigación ni un modelo nuevo, sino un artefacto de despliegue con métricas propias.

La licencia declarada es Apache 2.0, heredada del modelo base, y el fichero pesa 18.797.590.976 bytes (17,5 GiB), lo que lo sitúa en el rango de cuantizaciones Q4. El autor advierte explícitamente de que el checkpoint fuente no incluye pesos de visión, por lo que este build es solo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según nomenclatura A3B del modelo base |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmación numérica) |
| Longitud de contexto | 131.072 tokens (contexto cargado y verificado por el autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (build FAST-imatrix); única variante publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único Qwen-AgentWorld-35B-A3B-Q4_0-ROCmFP4-FAST-imatrix.gguf) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su carácter MoE y del recuento de parámetros totales. El nombre A3B indica la convención de Qwen para modelos MoE con aproximadamente 3B de parámetros activos por token, aunque no se aporta el número exacto de expertos, la dimensión oculta ni la configuración de atención. Tampoco se especifican los datos de entrenamiento, el volumen de tokens, la composición del corpus ni si hubo fases de RLHF o DPO.

La innovación técnica de esta publicación es el formato de cuantización: ROCm-FP4, desarrollado por el equipo ROCmFPX, aplicado sobre llama.cpp/ggml y empaquetado en un build FAST-imatrix. El autor reporta una perplejidad de 7,51 en wikitext-2 para esta cuantización concreta, lo que permite evaluar la degradación respecto al checkpoint original. El motor Super Roc añade soporte de prompt lookup y caché de prompt (6.961 de 6.986 tokens reutilizados en el segundo turno). No se menciona decodificación especulativa activa: el drafter figura como desactivado en las mediciones.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat compatible con el parámetro `chat_template_kwargs.enable_thinking`.
- Modo thinking desactivable por petición; el comando de ejemplo lo arranca en `off`.
- Tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo required y 7/8 en modo auto.
- Razonamiento multi-paso y uso como agente, implícito en el nombre AgentWorld del modelo base.
- Contexto largo de hasta 131.072 tokens, verificado en carga por el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada; el checkpoint fuente no incluye pesos de visión y este build es solo texto.
- Audio: no disponible.

## Casos de uso

- Agentes locales con tool calling: el modelo puede encadenar llamadas a funciones con una tasa de acierto medida de 7/8 en los modos required y auto, suficiente para prototipos de automatización en escritorio sin depender de la nube.
- Asistentes con contexto largo en equipos Strix Halo: con 131.072 tokens cargados, permite analizar repositorios completos, documentación extensa o historiales de conversación largos en una máquina de 128 GB de memoria unificada.
- Procesamiento por lotes de documentos en local: el rendimiento de prompt de 1.799,9 tok/s (p1k) y 1.894,2 tok/s (p8k) hace viable ingerir grandes volúmenes de texto de entrada en un solo equipo antes de generar respuestas.
- Generación de código asistida: el autor mide 71,8 tok/s en dos prompts de código, un ritmo adecuado para autocompletado interactivo en un IDE conectado a un endpoint compatible con la API de OpenAI.
- Integración en pipelines de desarrollo: al exponerse como endpoint compatible (`endpoints_compatible`) mediante `superroc serve`, puede conectarse a herramientas que esperan la API de OpenAI sin adaptadores adicionales.
- Despliegue en estaciones de trabajo AMD: el caso de uso central del artefacto es ejecutar un MoE de 35B en hardware AMD consumer/prosumer mediante ROCm-FP4, un escenario históricamente mal cubierto por el ecosistema CUDA.
- Evaluación de cuantizaciones: con perplejidad declarada en wikitext-2, sirve como referencia para comparar la pérdida de calidad de ROCm-FP4 frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Los únicos datos medidos son de rendimiento de inferencia y de calidad de cuantización.

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 | 7,51 |
| Tiempo de carga | 20 s |
| Prompt tok/s (p1k) | 1.799,9 |
| Prompt tok/s (p8k) | 1.894,2 |
| Generación tok/s (p1k) | 71,83 |
| Generación tok/s (p8k) | 169,03 |
| Generación de código tok/s | 71,8 (media de 2 prompts) |
| Tool calls (required) | 7/8 |
| Tool calls (auto) | 7/8 |
| Caché de prompt, turno 2 | 6.961 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Drafter | desactivado |

Medido en Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.0 (release candidate), una petición a la vez, el 23 de noviembre de 2026. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero GGUF ocupa 18.797.590.976 bytes (17,5 GiB); se necesita al menos esa cantidad de memoria disponible para los pesos, más el espacio para la caché KV correspondiente al contexto configurado.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) es el objetivo declarado y el único hardware con métricas publicadas. No hay datos para A100, H100 ni RTX 4090.
- GPU consumer: encaja en equipos con 32 GB o más de memoria unificada o VRAM, aunque el formato ROCm-FP4 está pensado específicamente para las extensiones de Super Roc; en GPUs NVIDIA habría que recurrir a otro build GGUF del mismo modelo base.
- Opciones de despliegue: Super Roc (`superroc serve`, con flags `--context`, `--prompt-lookup`, `--think`), Lemonade mediante `lemonade pull` y configuración de `llamacpp.rocm_bin`, y cualquier runtime compatible con GGUF en la medida en que soporte el formato ROCm-FP4.
- Latencia y throughput: 20 s de carga, 71,83 tok/s de generación con prompt de 1k y 169,03 tok/s con prompt de 8k, con una sola petición concurrente. No se publican datos de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF | 34,66B totales (MoE) | 131.072 | Apache 2.0 | GGUF ROCm-FP4 | Perplejidad 7,51 en wikitext-2; optimizado para Strix Halo |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | 34,66B totales (MoE) | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar; sin pesos de visión |
| Otras cuantizaciones GGUF del mismo base | 34,66B totales (MoE) | depende del build | Apache 2.0 | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de otros desarrolladores con los que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Solo texto: el checkpoint fuente no incluye pesos de visión y este build no añade multimodalidad.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- La perplejidad de 7,51 en wikitext-2 corresponde a esta cuantización Q4_0 ROCm-FP4, no al modelo original; la degradación respecto al checkpoint completo no se cuantifica en la información disponible.
- Las métricas se han medido con una sola petición simultánea; no hay datos de throughput bajo concurrencia ni de latencia en cola.
- Dependencia fuerte del ecosistema Super Roc y del hardware Strix Halo: el formato ROCm-FP4 y los flags del motor son específicos, lo que reduce la portabilidad frente a un GGUF estándar.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base, sin evaluación publicada en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (llama.cpp/ggml, MIT; componentes ROCmFPX).
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día, lo que indica una publicación reciente sin validación comunitaria.
- El nombre del modelo incluye "35B" mientras que el recuento real de safetensors es 34,66B; usar el dato de safetensors para planificación de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen-AgentWorld-35B-A3B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
- llama.cpp / ggml: no se proporciona enlace directo en la información disponible
