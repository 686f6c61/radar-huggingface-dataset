# ai-sage/GigaChat4-708B-A41B-bf16

## Resumen

GigaChat 4 es el modelo insignia de la familia GigaChat, desarrollado por el equipo ai-sage (vinculado a Salute Developers). Se trata de un modelo híbrido de tipo Mixture-of-Experts (MoE) con 708.000 millones de parámetros totales y 41.000 millones activos por token, que combina atención dispersa DeepSeek Sparse Attention (DSA) con capas Gated DeltaNet (GDN) en una proporción 3:1. La ventana de contexto alcanza 1.048.576 tokens, lo que lo sitúa en la categoría de modelos de contexto ultra-largo.

El modelo resuelve el problema de unificar en un único checkpoint los modos instantáneo y de razonamiento, que en la generación anterior (GigaChat 3.5) requerían checkpoints separados. Está afinado por instrucciones y orientado a conversación multilingüe (ruso e inglés), tareas agénticas de varios pasos, tool calling, salidas estructuradas, razonamiento matemático, código y question answering sobre documentos largos. Esta versión concreta del repositorio contiene los pesos finales en BF16.

Su relevancia actual radica en la combinación de escala MoE con atención híbrida eficiente y decodificación especulativa integrada (MTP recurrente y DFlash2), lo que reduce el coste de inferencia sobre contextos de un millón de tokens. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con Gated DeltaNet (atención lineal) y DeepSeek Sparse Attention (DSA) sobre MLA, ratio 3:1 |
| Parámetros totales | 710.235.315.584 (≈708B) |
| Parámetros activos | 41B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | BF16 (este repo), FP8 y GGUF (variantes separadas) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El backbone consta de 64 capas decodificadoras con tamaño oculto de 7.168. De ellas, 48 son capas de atención lineal (Gated DeltaNet) y 16 son capas de atención dispersa (DSA). Cada capa MoE combina un experto compartido con 256 expertos enrutados, de los cuales se activan 8 por token; las tres primeras capas decodificadoras usan FFN densas. Sobre las capas de atención se aplica GatedNorm a las salidas de bloque antes de la suma residual. La DSA selecciona 2.048 tokens por query, lo que permite recuperar información de contextos largos manteniendo un coste de atención acotado.

El contexto se extendió de forma progresiva desde 32K hasta 128K y finalmente hasta 1M tokens. La DSA se introdujo a 128K mediante entrenamiento solo del indexador, seguido de optimización conjunta del indexador y el backbone a 1M tokens. Para la estabilidad del preentrenamiento a escala se emplearon técnicas como Progressive Residual Warm-up (ProRes), z-loss específico por proyección con softcapping de logits y Dynamic Learning-rate Rescaling (DLR) para corregir desequilibrios persistentes de carga de expertos. El alineamiento partió de un SFT y continuó con reinforcement learning sobre matemáticas, código, uso de herramientas y flujos agénticos multi-turno; posteriormente, varios modelos expertos se consolidaron en uno solo mediante destilación on-policy multi-profesor, usando el optimizador Muon. El modelo incorpora una capa MTP integrada reutilizada de forma recurrente (estilo EAGLE-3) y admite además un drafter separado DFlash2 de cinco capas BF16 que predice en paralelo bloques de ocho posiciones.

## Capacidades

- Generación de texto conversacional multilingüe en ruso e inglés.
- Razonamiento multi-paso con modo de razonamiento seleccionable por petición, además del modo instantáneo, en un único checkpoint.
- Tool calling y function calling para integración con APIs externas.
- Salidas estructuradas (structured output) para pipelines que requieren JSON u otros formatos validables.
- Tareas agénticas de varios pasos y flujos de trabajo autónomos.
- Generación y razonamiento sobre código.
- Razonamiento matemático.
- Question answering sobre documentos largos gracias a la ventana de 1M tokens.
- Decodificación especulativa integrada (MTP recurrente y DFlash2) para acelerar la generación autoregresiva.

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (hasta 1M tokens), lo que permite mantener historiales extensos y documentación de producto en la misma ventana sin truncar.
- Análisis de documentos legales o contractuales: con la ventana de un millón de tokens puede procesar expedientes completos y responder preguntas concretas apoyándose en la atención dispersa para recuperar pasajes relevantes.
- Generación de código en producción: soporta tool calling y salidas estructuradas, lo que facilita su integración en pipelines de CI/CD para generar parches, tests o revisiones automatizadas.
- Agentes autónomos multi-paso: el soporte de flujos agénticos y function calling permite orquestar tareas que requieren varias llamadas a herramientas con planificación intermedia.
- Asistentes de razonamiento matemático: el modo de razonamiento, entrenado con RL específico, es adecuado para resolución de problemas paso a paso en entornos educativos o de análisis.
- Extracción de datos estructurados: la capacidad de structured output permite convertir texto libre en JSON validable para ingestión en bases de datos o sistemas ERP.
- Búsqueda y QA sobre bases de conocimiento en ruso: el soporte nativo de ruso e inglés cubre escenarios de recuperación aumentada en organizaciones con documentación en ambos idiomas.

## Benchmarks y rendimiento

La model card menciona una sección de resultados de evaluación, pero los datos numéricos no están incluidos en la información disponible (el texto se corta en la introducción de las tablas). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 1,4 TB (tamaño del repo: 1.427 GB), por lo que la inferencia en BF16 requiere un clúster multi-GPU de gran escala.
- La variante FP8 reduce el requisito a aproximadamente la mitad (≈700 GB), todavía fuera del alcance de una GPU individual.
- La variante GGUF permite cuantizaciones más agresivas, pero con 708B de parámetros totales sigue requiriendo agregación de memoria muy elevada; no cabe en GPU de consumo convencionales.
- GPU recomendadas: despliegue multi-nodo con aceleradores de clase数据中心 (H100, H200, B200) o A100 en configuraciones agregadas; no es viable en RTX 4090 ni en GPUs de consumo.
- Opciones de despliegue: SGLang (existe una receta específica en el cookbook de SGLang), y presumiblemente vLLM y llama.cpp para la variante GGUF; TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa (MTP recurrente y DFlash2) está diseñada para acelerar la generación, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| GigaChat4-708B-A41B | 708B / 41B | 1.048.576 | MIT | ru, en |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría (MoE de gran escala con contexto de un millón de tokens), por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos corpus.
- Riesgo de alucinación: no se cuantifica en la model card; debe asumirse el riesgo habitual en modelos generativos, especialmente en modo instantáneo sin razonamiento explícito.
- Idiomas: el soporte declarado se limita a ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: aunque la ventana es de 1M tokens, la calidad de recuperación en el extremo superior no está validada con benchmarks publicados en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y de los componentes de terceros (custom_code) antes de desplegar en producción.
- Requisitos de hardware extremos: el despliegue en BF16 exige infraestructura multi-GPU de gran escala; la cuantización a GGUF puede degradar la calidad y no elimina la necesidad de agregación de memoria.
- El modo de razonamiento incrementa la latencia y el consumo de tokens; debe seleccionarse por petición según el caso de uso.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/ai-sage/GigaChat4-708B-A41B-bf16
- Variante FP8: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- Variante GGUF: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-GGUF
- Modelo base: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-base
- Checkpoints intermedios: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-checkpoints
- Colección GigaChat 4: https://huggingface.co/collections/ai-sage/gigachat-4
- Informe técnico (PDF): https://github.com/salute-developers/gigachat4/blob/main/GigaChat_4.pdf
- Blog: https://giga.chat/blog/en
- GitHub: https://github.com/salute-developers/gigachat4
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/GigaChat/GigaChat4
