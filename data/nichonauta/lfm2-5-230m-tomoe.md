# Nichonauta/LFM2.5-230M-ToMoE

## Resumen

LFM2.5-230M-ToMoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) creado por Nichonauta, que convierte el modelo denso LiquidAI/LFM2.5-230M en un MoE de canales mediante el metodo ToMoE (Dynamic Structural Pruning + Hypernetwork). El modelo base, desarrollado por Liquid AI, es un modelo fundacional de 230M de parametros disenado para ejecutarse en dispositivos con recursos limitados, como telefonos moviles, y orientado a tareas de extraccion de datos, tool use y agentes ligeros.

La conversion a MoE reduce los parametros almacenados de 229,7M a 200,9M, y los parametros activos por token a aproximadamente 151M, mediante poda estructural dinamica. El modelo resultante es un artefacto de investigacion que demuestra la viabilidad del pipeline ToMoE sobre la arquitectura LFM2, aunque con una degradacion significativa de calidad respecto al modelo denso original (perplejidad de ~815 frente a 20,4 en wikitext-2).

El modelo se distribuye bajo la licencia LFM Open License v1.0, requiere `trust_remote_code=True` para su uso con transformers, y esta disponible en formato safetensors (fp32) junto con cuantizaciones GGUF (Q4_K_M, Q8_0, F16) en un repositorio companion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de canales (channel-MoE) sobre base LFM2.5-230M |
| Parametros totales | 200.906.506 almacenados (201.186.506 segun safetensors) |
| Parametros activos | ~151M por token |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0, F16 (repo companion); safetensors fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (fp32), GGUF |

## Arquitectura y entrenamiento

El modelo es una conversion MoE del LFM2.5-230M denso, obtenida mediante el metodo ToMoE. La arquitectura resultante aplica un tratamiento diferenciado por tipo de capa:

- **MLP (14 capas)**: enrutamiento de expertos por token sobre 8 expertos de canal (top-1 mediante Gumbel-softmax). La FFN se recorta a la union de las mascaras de canal de los expertos.
- **Atencion completa (6 capas)**: Q/K se mantienen a ancho completo; los canales de V se enmascaran dinamicamente por token con mascaras deterministicas.
- **ShortConv (8 capas)**: poda estatica, con un unico indice de canal compartido por las proyecciones B/C/x, la convolucion y la proyeccion de salida.

El presupuesto de poda es `p = 0.3` con regularizacion ToMoE (lambda de 64 a 256, base Gumbel annealed de 1.0 a -0.25, 8 expertos). La atencion QK se excluye del presupuesto de poda porque la dimension de cabeza (64) es demasiado pequena y colapsaria bajo poda agresiva.

El entrenamiento consistio en 1.200 pasos con secuencias de 2048 tokens, utilizando destilacion de conocimiento online (2x forward KL) contra el profesor denso, sobre un stream de wikitext-103. Los pesos del modelo base se mantuvieron congelados y solo se entreno la hiperred (un GRU bidireccional) que genera las mascaras de canal diferenciables. Los pesos finales podados se extraen de las mascaras entrenadas.

## Capacidades

- Generacion de texto autoregresiva con arquitectura MoE de canales.
- Enrutamiento per-token en capas MLP con 8 expertos (top-1 via Gumbel-softmax).
- Enmascaramiento dinamico de canales V en capas de atencion.
- Poda estatica en capas ShortConv.
- Compatible con transformers mediante `trust_remote_code=True`.
- Cuantizaciones GGUF disponibles para inferencia con llama.cpp.
- Chat template incluido (`chat_template.jinja`).
- Capacidad de tool use heredada del modelo base LFM2.5-230M (segun documentacion de Liquid AI), aunque degradada por la poda.

## Casos de uso

- **Investigacion en compresion de modelos**: el modelo sirve como referencia para estudiar el impacto de la conversion MoE sobre arquitecturas LFM2, permitiendo analizar la relacion entre poda estructural, parametros activos y calidad de generacion.
- **Evaluacion de tecnicas de poda con hiperredes**: permite comparar el enfoque ToMoE (mascaras diferenciables generadas por GRU) frente a otras tecnicas de pruning estatico o dinamico en modelos pequenos.
- **Experimentos de destilacion de conocimiento**: al ser un artefacto entrenado con destilacion online contra un profesor denso, puede usarse para estudiar la transferencia de conocimiento en regimenes de poda agresiva.
- **Pruebas de inferencia en dispositivos edge**: con ~151M de parametros activos y cuantizaciones GGUF, puede desplegarse en CPU de telefonos o Raspberry Pi para medir latencia y throughput reales de arquitecturas MoE pequenas.
- **Desarrollo de pipelines de conversion denso-a-MoE**: el repositorio incluye el codigo personalizado (`modeling_lfm2_moe_final.py`) que puede servir como punto de partida para replicar o modificar el pipeline ToMoE.
- **Benchmarking de perplejidad en modelos podados**: util para comparar la degradacion de calidad (PPL ~815 vs 20,4 del denso) frente a otros metodos de compresion en la misma familia de modelos.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos de perplejidad en wikitext-2 (contexto de 2048 tokens):

| Metrica | Dense base (LFM2.5-230M) | ToMoE MoE |
|---|---|---|
| Parametros totales | 229,7M | 200,9M almacenados |
| Parametros activos por token | 229,7M | ~151M |
| PPL wikitext-2 (2048 tok) | 20,4 | ~815 |
| Embeddings (siempre activos) | 67,1M | 67,1M |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El modelo base LFM2.5-230M alcanza 213 tok/s en CPU de telefono segun Liquid AI, pero no hay datos de throughput para esta variante MoE.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en fp32 ocupa ~805 MB (201M parametros x 4 bytes). En bfloat16 serian ~402 MB. Las cuantizaciones GGUF reducen el peso a ~110-200 MB segun el nivel (Q4_K_M, Q8_0).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente para fp32 (p. ej., NVIDIA T4, GTX 1650). Para bfloat16, basta con 512 MB. El modelo cabe en cualquier GPU consumer moderna.
- **CPU**: al ser un modelo de 200M de parametros, puede ejecutarse en CPU sin GPU, especialmente con cuantizaciones GGUF via llama.cpp.
- **Opciones de despliegue**: transformers con `trust_remote_code=True` (atencion eager), llama.cpp con los GGUF del repositorio companion, o cualquier runtime compatible con GGUF (Ollama, llama-cpp-python).
- **Latencia y throughput**: no hay datos publicados para esta variante MoE. El modelo base denso alcanza 213 tok/s en CPU de telefono, pero la sobrecarga del enrutamiento MoE y la poda pueden alterar estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL wikitext-2 | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-230M-ToMoE (este) | 200,9M (151M activos) | 2048 | ~815 | LFM Open License v1.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-230M (base denso) | 229,7M | 2048 | 20,4 | LFM Open License v1.0 | safetensors |
| LiquidAI/LFM2.5-Encoder-230M | 230M (encoder) | no disponible | no disponible | LFM Open License v1.0 | safetensors |

La comparativa directa con otros MoE de tamano similar (p. ej., Mixtral 8x7B o Qwen MoE) no es relevante por la diferencia de escala (200M frente a miles de millones de parametros). El modelo es un artefacto de investigacion, no un modelo de produccion.

## Limitaciones y advertencias

- **Degradacion severa de calidad**: la perplejidad en wikitext-2 es ~815 frente a 20,4 del modelo denso, lo que indica una perdida sustancial de capacidad de modelado del lenguaje.
- **Generacion repetitiva**: la model card advierte explicitamente que la generacion tiende a repetirse, probablemente debido a la poda agresiva de las capas convolucionales (12-22% de ancho) y del MLP por token (~62% de ancho).
- **Artefacto de investigacion**: no esta disenado para uso en produccion ni para tareas reales de generacion de texto.
- **Codigo personalizado**: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo arbitrario del repositorio. Se recomienda auditar `modeling_lfm2_moe_final.py` antes de su uso.
- **Soporte limitado de idiomas**: solo ingles (en).
- **Restricciones de licencia**: la LFM Open License v1.0 puede imponer condiciones especificas para uso comercial; es necesario revisar el texto completo de la licencia.
- **Sin benchmarks estandar**: no hay resultados de MMLU, HumanEval, GSM8K u otros benchmarks que permitan evaluar capacidades de razonamiento, codigo o matematicas.

## Enlaces

- [Modelo en HuggingFace: Nichonauta/LFM2.5-230M-ToMoE](https://huggingface.co/Nichonauta/LFM2.5-230M-ToMoE)
- [Repositorio GGUF: Nichonauta/LFM2.5-230M-ToMoE-GGUF](https://huggingface.co/Nichonauta/LFM2.5-230M-ToMoE-GGUF)
- [Modelo base: LiquidAI/LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Licencia LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE)
- [Blog de Liquid AI: LFM2.5-230M: Built to Run Anywhere](https://www.liquid.ai/blog/lfm2-5-230m)
- [Documentacion de Liquid AI: LFM2.5-230M](https://docs.liquid.ai/lfm/models/lfm25-230m)
- [Articulo de ExplainX sobre LFM2.5-230M](https://www.explainx.ai/blog/liquid-ai-lfm2-5-230m-edge-agent-model-2026)
- [LiquidAI/LFM2.5-Encoder-230M](https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M)
