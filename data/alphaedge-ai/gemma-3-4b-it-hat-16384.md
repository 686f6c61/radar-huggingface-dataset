# alphaedge-ai/gemma-3-4b-it-hat-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-hat-16384` es una version recortada (trimmed) del modelo multimodal `google/gemma-3-4b-it` de Google, especializada en criollo haitiano (codigo ISO `ht`). El autor del derivado es la organizacion `alphaedge-ai`, que aplica la tecnica de trimming de vocabulario documentada por Hugging Face para reducir el tokenizer de 262.144 a 16.384 tokens, eliminando los tokens poco frecuentes en el idioma objetivo. El resultado es un modelo un 14,63% mas pequeno en parametros (de 4.300.079.472 a 3.670.770.032) y con una huella de memoria notablemente inferior.

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atencion local/global intercalada y capacidad image-text-to-text), pero su vocabulario queda restringido a los tokens mas relevantes para el criollo haitiano, minados a partir de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. Esto lo hace adecuado para despliegues en entornos con recursos limitados donde solo se necesita generacion de texto y dialogo en criollo haitiano, a costa de perder competencia en otros idiomas.

Es relevante ahora porque demuestra un patron practico de especializacion por idioma de sub-10B: reducir el vocabulario permite bajar el coste de inferencia y el peso del checkpoint (7,3 GB en el repo) sin reentrenar el modelo desde cero, manteniendo el comportamiento del modelo base dentro del idioma objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 3 (base: `google/gemma-3-4b-it`) |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Gemma 3, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precision original; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | criollo haitiano (`ht`) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 7,3 GB |
| Tamano de vocabulario | 16.384 tokens (frente a 262.144 del original, -93,75%) |
| Modalidad | image-text-to-text / text-generation (pipeline declarado: `text-generation`) |
| Region declarada | `region:eu` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only multimodal de la familia Gemma 3 (ver *Gemma 3 Technical Report*, arXiv:2503.19786). Sobre esa base no se reentrena el modelo: se aplica la tecnica de **trimming** de vocabulario descrita en el blog de Hugging Face, que consiste en identificar los tokens efectivamente utilizados por el idioma objetivo y recortar el embedding y la capa de salida al subconjunto correspondiente. El vocabulario pasa de 262.144 a 16.384 tokens, lo que reduce los parametros totales en un 14,63%.

La seleccion de tokens se realizo minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, orientado a criollo haitiano. No se documentan en la informacion disponible fases adicionales de RLHF, DPO ni fine-tuning especifico tras el recorte; el autor afirma que el modelo "deberia comportarse de forma similar al original" dentro del idioma objetivo. La innovacion tecnica es, por tanto, la compresion del vocabulario y no cambios en el bloque transformer.

## Capacidades

- Generacion de texto y dialogo conversacional en criollo haitiano, con plantilla de chat via `apply_chat_template`.
- Capacidad multimodal heredada del base (pipeline `image-text-to-text`), aunque la model card no documenta evaluacion de vision tras el recorte.
- Razonamiento y generacion de codigo heredados del base Gemma 3, no garantizados en idiomas distintos del criollo haitiano.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: **restringidas**; el autor advierte explicitamente que puede no funcionar bien en otros idiomas porque se eliminaron tokens no usados en el idioma seleccionado.
- Integracion con `text-generation-inference` y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- **Atencion al cliente en criollo haitiano**: despliegue de un asistente conversacional multi-turno para usuarios haitianos, aprovechando la plantilla de chat y el vocabulario especializado para reducir tokens por palabra respecto al modelo original.
- **Traduccion y redaccion asistida ht-es / ht-fr**: generacion y reescritura de textos en criollo haitiano en flujos editoriales o administrativos, con un checkpoint de 7,3 GB que cabe en infraestructura modesta.
- **Moderacion y clasificacion de contenido en ht**: uso como generador de resumenes o etiquetas sobre textos en criollo haitiano en pipelines de moderacion, donde el vocabulario reducido acelera la tokenizacion.
- **Despliegue en el borde o en GPUs de consumo**: al reducir el numero de parametros un 14,63%, permite servir el modelo en una unica GPU de gama media-alta para inferencia interactiva en criollo haitiano.
- **Investigacion sobre trimming de vocabulario**: caso de estudio reproducible para medir el impacto del recorte de vocabulario en calidad y latencia, usando `lbourdois/fineweb-2-trimming` como referencia.
- **Prototipado rapido de asistentes locales**: integracion en entornos con `transformers` y `text-generation-inference` para validar productos dirigidos al mercado haitiano antes de invertir en fine-tuning completo.
- **Generacion de material educativo en ht**: produccion de explicaciones, ejercicios y resumenes en criollo haitiano para plataformas de aprendizaje, con la advertencia de revisar sesgos y alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de compresion:

| Metrica | Original (`gemma-3-4b-it`) | Trimmed | Reduccion |
|---|---|---|---|
| Tamano de vocabulario | 262.144 tokens | 16.384 tokens | 93,75% |
| Parametros totales | 4.300.079.472 | 3.670.770.032 | 14,63% |

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia de orden de magnitud, un checkpoint de 3,67B parametros en bf16/fp16 ocupa aproximadamente 7,3 GB de pesos; en fp32 superaria los 14 GB. La VRAM real dependera de la cuantizacion y de la longitud de contexto.
- **GPU recomendadas**: no especificadas por el autor. Por tamano, una GPU con 16 GB o mas (RTX 4090, A10G, L4) deberia poder alojar los pesos en bf16; A100/H100 quedan sobredimensionadas para inferencia single-instance.
- **GPU de consumo**: previsiblemente cabe en GPUs consumer de 12-16 GB en bf16 y en tarjetas de 8 GB si se aplica cuantizacion (no se publican GGUF en el repo).
- **Opciones de despliegue**: `transformers` (documentado en la model card) y `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- **Latencia y throughput**: no disponibles. La reduccion de vocabulario deberia disminuir el coste de la capa de embedding y de salida, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/gemma-3-4b-it-hat-16384` | 3,67B | no disponible | ht | Gemma Terms of Use | Hugging Face, 11 descargas |
| `google/gemma-3-4b-it` (base) | 4,30B | no disponible en esta ficha | multilingue | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Otros derivados trimmed de Gemma 3 por idioma | no disponible | no disponible | segun idioma | Gemma Terms of Use | no disponible |

La comparativa con alternativas especializadas en criollo haitiano de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma restringido**: el autor advierte que el modelo puede no funcionar bien en idiomas distintos del criollo haitiano, ya que se eliminaron tokens no usados en ese idioma.
- **Riesgo de alucinacion**: heredado de Gemma 3; no se documenta mitigacion especifica tras el trimming.
- **Sesgos**: no se documentan evaluaciones de sesgo para este derivado; los sesgos del base Gemma 3 se mantienen.
- **Capacidades multimodales no verificadas**: aunque el pipeline declarado incluye `image-text-to-text`, no hay evaluacion publicada del rendimiento de vision tras el recorte de vocabulario.
- **Licencia**: uso comercial sujeto a los Gemma Terms of Use; el modelo no esta afiliado ni respaldado por Google.
- **Madurez**: 11 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni resultados de benchmarks publicados.
- **Tool calling y agentes**: no confirmados; conviene validarlos antes de integrarlos en pipelines criticos.
- **Formato**: solo safetensors; no se publican cuantizaciones GGUF, lo que limita el despliegue en `llama.cpp` u Ollama sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-hat-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Gemma 3 Technical Report (arXiv): https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
