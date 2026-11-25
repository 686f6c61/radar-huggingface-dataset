# rishanthrajendhran/ideadet-nemotron30b-1m-outline

## Resumen

IdeaLens es un modelo de detección de procedencia de ideas, no de detección de texto generado por IA al uso. Desarrollado por rishanthrajendhran, parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` y se afina mediante LoRA (rango 64) sobre esquemas (outlines) de un millón de documentos web en inglés del dataset WildOutlines. En lugar de analizar las palabras de un texto, recibe una lista ordenada de ideas etiquetadas con su rol discursivo (por ejemplo, *Central Development* u *Open Question*) y devuelve P(human), la probabilidad de que las ideas sean de origen humano.

El modelo resuelve un problema concreto de los detectores actuales: cuando un humano aporta el plan y la IA solo redacta, los detectores basados en texto fallan estrepitosamente. Según la model card, IdeaLens mantiene una precisión del 81,3% en el escenario de fuentes mixtas (ideas y palabras de distinto origen), frente al 25,4% de ProseLens y el 25,9% de Pangram 4. Además, su tasa de marcado como IA cae del 95% al 7% a medida que los planes humanos se detallan más, mientras Pangram 4 sigue marcando el 92%.

Arquitectónicamente hereda el transformer híbrido Nemotron-H con mezcla de expertos (MoE) del modelo base, con 32.913.266.240 parámetros totales y un checkpoint fusionado de 68,9 GB en safetensors. Es relevante ahora porque aborda la atribución de autoría intelectual en un momento en que la distinción entre "escribir" y "pensar" se vuelve jurídica y académicamente crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer híbrido con MoE), afinado con LoRA rango 64 |
| Parametros totales | 32.913.266.240 |
| Parametros activos | no disponible (el modelo base se denomina A3B, lo que sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; el autor menciona despliegue en vLLM sin detallar cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (transformers); checkpoint adicional en Tinker |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Dataset de entrenamiento | rishanthrajendhran/WildOutlines (1M documentos web en inglés) |
| Tamaño del repositorio | 68,9 GB |
| Descargas / likes | 319 / 4 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con LoRA de rango 64 sobre el checkpoint BF16 de Nemotron-3.5-Lightning-30B-A3B, una arquitectura Nemotron-H que combina capas de atención con capas de estado recurrente y mezcla de expertos. Los pesos publicados están fusionados (merged), de modo que se cargan directamente con `AutoModelForCausalLM` en transformers y ocupan 59 GiB de VRAM en BF16. El modelo no genera texto libre: se comporta como un clasificador que consume un esquema con formato `[Rol] contenido` por línea y emite P(human).

El entrenamiento utiliza los esquemas de un millón de documentos ingleses de WildOutlines. Un punto técnico clave es que los esquemas de entrenamiento fueron parafraseados para eliminar la redacción original de los documentos, forzando al modelo a ajustar sus etiquetas a través de las ideas y no de las palabras. La inferencia requiere dos pasos: primero un LLM (el paper usa Gemini 3.7 Flash) extrae el esquema a partir del texto, su vocabulario de roles de formato y seis ejemplos resueltos; después IdeaLens puntúa ese esquema. El paquete `idealens` incluye los prompts, vocabularios de roles y ejemplos, y aplica umbrales calibrados a tasas de falsos positivos globales, por formato y por tema.

## Capacidades

- Clasificación binaria de procedencia de ideas: devuelve P(human) para un esquema de documento.
- Detección robusta en escenarios de fuentes mixtas (plan humano, redacción por IA).
- Clasificación del formato del documento entre ocho categorías, mediante el paquete `idealens`.
- Extracción de esquemas con roles discursivos a partir de texto plano, delegada a un LLM externo configurable (Gemini, OpenAI, Vertex, Anthropic, OpenRouter o servidor local compatible).
- Veredictos calibrados a múltiples tasas de falsos positivos (global, por formato y por tema).
- Soporte de despliegue en vLLM y en Tinker para ejecución sin GPU local.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado solo para inglés.
- Tool calling, agentes, visión o audio: no disponibles; el modelo está especializado exclusivamente en la tarea de detección.

## Casos de uso

- Verificación de autoría académica: dado un manuscrito o trabajo de estudiante, se extrae su esquema de ideas y se puntúa para detectar si el plan intelectual procede de una IA aunque la redacción sea humana, un escenario que los detectores de texto no cubren.
- Moderación de plataformas de contenido: integrado en un pipeline que clasifique el formato del documento y extraiga el esquema, permite marcar contenido generado por IA a escala con umbrales ajustables por tasa de falsos positivos.
- Auditoría editorial y de medios: comprobar si un artículo publicado se escribió a partir de un plan generado por IA, útil para políticas editoriales de transparencia.
- Investigación sobre procedencia de datos: analizar corpus web para estimar la proporción de ideas generadas por IA en un dominio o tema concreto, usando los veredictos por tema.
- Evaluación de pipelines de generación: medir cuánto contribuye el plan humano frente al modelo en flujos de escritura asistida, comparando la tasa de marcado a distintos niveles de detalle del plan.
- Detección de plagio de ideas en entornos educativos: identificar trabajos donde el estudiante aportó solo la redacción sobre un esquema ajeno o generado automáticamente.
- Despliegue sin infraestructura propia: mediante Tinker, un equipo sin GPU puede puntuar documentos a un coste aproximado de 0,50 USD por cada 1.000 documentos a precio de lista.

## Benchmarks y rendimiento

Datos publicados en la model card (procedentes del paper):

| Escenario | IdeaLens | ProseLens | Pangram 4 |
|---|---|---|---|
| Ideas y palabras de la misma fuente | 95,3% | 99,1% | 98,5% |
| Ideas y palabras de fuentes distintas | 81,3% | 25,4% | 25,9% |
| Tasa de marcado IA con planes humanos muy detallados | 7% | no disponible | 92% |
| Tasa de marcado IA con planes derivados de IA | >96% | no disponible | no disponible |
| TwiceTold (50 historias humanas sobre planes de IA) | 68% | no disponible | 8% |

Además, según la model card, mantiene tasas de detección sólidas a bajas tasas de falsos positivos en 19 benchmarks de detección existentes, abarcando dominios, formatos e idiomas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: 59 GiB según la model card; el checkpoint fusionado ocupa 68,9 GB en disco.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`; no cabe en GPUs de consumo de 24 GB en BF16.
- Cuantizaciones GGUF o de menor precisión: no disponibles en la información proporcionada, por lo que no se puede confirmar su viabilidad en consumer GPU.
- Despliegue: vLLM es la vía recomendada por el autor (el paquete `idealens` lo usa por defecto); también transformers con `AutoModelForCausalLM`; llama.cpp, Ollama y TGI no se mencionan.
- Alternativa sin GPU: Tinker, con checkpoint remoto y coste aproximado de 0,50 USD por 1.000 documentos; sus puntuaciones difieren de los pesos locales en torno a 0,002 en P(human).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Detección mixta | Licencia |
|---|---|---|---|---|---|
| IdeaLens | 32,9B (MoE) | no disponible | Esquemas de ideas con roles | 81,3% | openmdw-1.1 |
| ProseLens | no disponible | no disponible | Texto plano | 25,4% | no disponible |
| Pangram 4 | no disponible | no disponible | Texto plano (comercial) | 25,9% | propietaria |

ProseLens se entrena de forma idéntica a IdeaLens pero sobre texto sin procesar, lo que sirve de control experimental en el paper. Pangram 4 es un detector comercial de referencia. No se dispone de datos de parámetros, contexto ni licencia de los dos comparadores en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un LLM externo para extraer el esquema: la calidad de la puntuación depende de la extracción, y los umbrales se calibraron con Gemini 3.7 Flash; usar otro proveedor puede alterar los veredictos.
- Sesgo de idioma: entrenado solo con documentos web en inglés; el rendimiento en castellano u otras lenguas no está validado.
- Sesgo de dominio: el corpus WildOutlines son documentos web, por lo que el comportamiento en textos técnicos, legales o literarios puede degradarse.
- Riesgo de falsos positivos: aunque se calibra a tasas de falsos positivos bajas, marcar un texto humano como generado por IA tiene consecuencias graves en contextos académicos o profesionales.
- No es un detector de texto al uso: no detecta redacción generada por IA si el esquema de ideas es humano; su uso aislado da una visión incompleta.
- Licencia openmdw-1.1: conviene revisar el archivo LICENSE del repositorio antes de uso comercial, ya que la etiqueta de Hugging Face es "other".
- El modelo no genera texto, razona ni responde preguntas: cualquier uso fuera de la clasificación de esquemas producirá resultados sin sentido.
- La model card advierte de que el paquete `idealens` depende de versiones concretas del SDK de Tinker (0.33.1 o superior) y de una clave de API para la extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-1m-outline
- Dataset WildOutlines: https://huggingface.co/datasets/rishanthrajendhran/WildOutlines
- Repositorio del paquete idealens: https://github.com/RishanthRajendhran/IdeaLens
- Paquete en PyPI: https://pypi.org/project/idealens/
- Demo web: http://ideadetector.ai/
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Tinker: https://thinkingmachines.ai/tinker/
- Registro en Tinker: https://auth.thinkingmachines.ai/sign-up
- Paper: arXiv 2610.06778 (referenciado en los tags del repositorio)
