# shanto1410/fire-tariff-gemma4

## Resumen
fire-tariff-gemma4 es un adaptador LoRA (PEFT) publicado por el usuario shanto1410 en Hugging Face, entrenado mediante SFT sobre el modelo base unsloth/gemma-4-E2B-it-unsloth-bnb-4bit. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de bajo rango que debe cargarse junto con el modelo base para funcionar. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo de pesos completos.

El nombre del repositorio sugiere un ajuste orientado a tarifas o normativa de tipo "fire" (posiblemente tarifas de extincion de incendios o tasas administrativas), aunque la model card no documenta el dominio, los datos de entrenamiento ni el objetivo concreto. La informacion disponible es muy limitada: la model card es una plantilla sin rellenar, con la mayoria de campos marcados como "[More Information Needed]".

La relevancia de esta ficha es principalmente practica: permite identificar que se trata de un adaptador experimental sin documentacion, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada, lo que condiciona cualquier evaluacion o uso en produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Gemma 4 E2B, familia Gemma de Google) |
| Parametros totales | No disponible para el adaptador; el modelo base es Gemma 4 E2B (tamano no confirmado en la informacion) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada) |
| Tipos de cuantizacion | El modelo base referenciado esta cuantizado en bnb-4bit (bitsandbytes 4 bits); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA entrenado con SFT (supervised fine-tuning) usando las librerias transformers, TRL, PEFT y unsloth, segun los tags del repositorio. El modelo base es unsloth/gemma-4-E2B-it-unsloth-bnb-4bit, una version del Gemma 4 E2B instructiva cuantizada a 4 bits con bitsandbytes y optimizada por Unsloth. La arquitectura subyacente corresponde a la familia Gemma (transformer decoder-only), aunque no se detallan en la informacion proporcionada ni el numero exacto de parametros, ni la composicion del dataset, ni los hiperparametros de entrenamiento.

La model card no documenta el numero de tokens de entrenamiento, la procedencia de los datos, si hubo RLHF/DPO adicional ni ninguna innovacion tecnica. La version de PEFT indicada en el README es 0.22.0. No se dispone de informacion sobre la estrategia de enmascarado de perdida, el rango del adaptador ni el alpha utilizado.

## Capacidades
- Generacion de texto conversacional, heredada del modelo base Gemma 4 E2B instructivo.
- Ajuste especifico (presuntamente) para el dominio de "tarifas" o "fire tariff", aunque el alcance real no esta documentado.
- Capacidad multilingue: no confirmada; depende del modelo base y no se especifica.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y uso como agente: no documentado.
- Modo thinking, vision o audio: no documentado.
- Al ser un adaptador, requiere cargar el modelo base con PEFT para su uso; no es autonomo.

## Casos de uso
- Prototipado rapido de un asistente especializado en tarifas o tasas administrativas: el adaptador puede cargarse sobre el modelo base cuantizado en 4 bits para probar respuestas en ese dominio con recursos modestos, aunque la falta de documentacion obliga a validar el comportamiento manualmente.
- Experimentacion academica con LoRA y Unsloth: sirve como ejemplo de flujo de fine-tuning SFT sobre Gemma 4 E2B con cuantizacion 4 bits, util para reproducir pipelines de entrenamiento.
- Evaluacion comparativa de adaptadores: al ser un adaptador pequeno (0,2 GB), puede integrarse en suites de evaluacion de PEFT para medir deriva respecto al modelo base.
- Base para un segundo ajuste: el adaptador podria servir como punto de partida para un fine-tuning adicional en el mismo dominio, siempre que se resuelva la licencia.
- Despliegue en entornos con GPU de gama media: al combinar un modelo base de 2B cuantizado a 4 bits con un adaptador LoRA, el conjunto puede ejecutarse en GPUs consumer, lo que facilita pruebas locales.
- Investigacion sobre sesgos y alucinacion en adaptadores de dominio: permite estudiar como un SFT acotado altera el comportamiento del modelo base en tareas especificas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; al tratarse de un modelo base de 2B cuantizado a 4 bits mas un adaptador LoRA, el conjunto es ligero y probablemente quepa en GPUs consumer con 6-8 GB de VRAM, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles; por tamano del modelo base, podria ejecutarse en RTX 3060, RTX 4060, RTX 4090, A100 o H100, pero sin datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base y la cuantizacion 4 bits, aunque no verificado.
- Opciones de despliegue: transformers con PEFT, Unsloth, y potencialmente llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| shanto1410/fire-tariff-gemma4 | Adaptador LoRA sobre Gemma 4 E2B | No disponible | No disponible | Hugging Face, 0 descargas | Sin documentacion |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | Gemma 4 E2B (modelo base) | No disponible | Segun Gemma (no confirmado) | Hugging Face | Modelo base cuantizado |
| Adaptadores LoRA genericos sobre Gemma | Variable | Variable | Variable | Hugging Face | Depende del autor |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias
- La model card es una plantilla sin rellenar: no hay informacion sobre datos, objetivo, hiperparametros ni evaluacion.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor o verificar la licencia del modelo base Gemma.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: desconocido, pero heredado del modelo base y potencialmente amplificado por el SFT en un dominio acotado.
- El adaptador no es autonomo: requiere el modelo base exacto (unsloth/gemma-4-E2B-it-unsloth-bnb-4bit) para cargarse correctamente.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- No apto para produccion sin una evaluacion previa exhaustiva y sin aclarar la licencia.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/shanto1410/fire-tariff-gemma4
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
