# leeroy-jankins/jimi

## Resumen

Jimi es un modelo de lenguaje ajustado (fine-tuning) sobre el modelo base `google/gemma-4-E4B-it`, desarrollado por el usuario `leeroy-jankins`. El objetivo del ajuste es mejorar la comprensión contextual, el seguimiento de instrucciones y el razonamiento específico de dominio, con un enfoque particular en documentos legales y financieros del gobierno de Estados Unidos. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones.

Jimi se basa en la arquitectura Gemma 4 de Google DeepMind, un transformer denso con atención híbrida (ventana deslizante local y atención global) y soporte multimodal nativo (texto, imagen y audio en la variante E4B). El modelo base tiene 4.5 mil millones de parámetros efectivos (8 mil millones con embeddings) y una ventana de contexto de 128K tokens. El ajuste se realizó mediante supervisión con instrucciones sobre un corpus diverso que incluye datasets de razonamiento, código, resumen y documentos regulatorios.

La relevancia de Jimi radica en su especialización para tareas de comprensión de documentos legales y financieros, un nicho donde los modelos generalistas suelen fallar. Al estar construido sobre Gemma 4, hereda capacidades de razonamiento, generación de código y soporte nativo de function calling, lo que lo hace adecuado para pipelines de RAG y agentes autónomos en entornos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window + global), p-RoPE, embeddings unificados para visión y audio |
| Parametros totales | 7.518.069.290 (según safetensors; el modelo base declara 4.5B efectivos y 8B con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (según especificaciones de Gemma 4 E4B) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se mencionan GGUF u otras cuantizaciones) |
| Idiomas soportados | Inglés (según la model card; el modelo base Gemma 4 soporta más de 140 idiomas, pero el fine-tuning se centra en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jimi parte del modelo Gemma 4 E4B, que emplea una arquitectura transformer densa con 42 capas, atención híbrida que intercala ventanas deslizantes de 512 tokens con atención global, y capa final siempre global. Los parámetros efectivos son 4.5B, pero el total con embeddings alcanza 8B, lo que explica el tamaño de 7.5B en safetensors (incluye el vision encoder de ~150M y el audio encoder de ~300M). El contexto máximo es de 128K tokens, con vocabulario de 262K tokens.

El entrenamiento de Jimi consistió en un ajuste supervisado con instrucciones (instruction tuning) sobre un corpus diverso. Los datasets utilizados incluyen `mlabonne/FineTome-100k` (instrucciones generales), y varios datasets especializados en finanzas y regulación gubernamental de EE. UU.: `Regulations`, `Appropriations`, `OMB-Circular-A-11`, `RedBook`, `SF133`, `US-General-Ledger` y `Title-31-CFR-Money-and-Finance`. No se menciona el uso de RLHF o DPO; el ajuste parece ser puramente supervisado. La model card destaca que el modelo está optimizado para RAG, diálogo multi-turno y razonamiento multi-paso.

## Capacidades

- Generación de texto y resumen: capaz de producir resúmenes de documentos extensos, gracias a la ventana de 128K tokens.
- Razonamiento multi-paso: el modelo base Gemma 4 está diseñado como razonador de alto nivel, con modos de pensamiento configurables.
- Comprensión de documentos legales y financieros: especializado en terminología regulatoria, apropiaciones presupuestarias y datos del libro mayor del gobierno de EE. UU.
- Generación de código: el modelo base tiene capacidades de codificación mejoradas, aunque el fine-tuning no se centra específicamente en código.
- Soporte de function calling: Gemma 4 incluye soporte nativo para llamadas a funciones, lo que permite integrar Jimi en agentes autónomos.
- Diálogo multi-turno: mantiene coherencia conversacional con memoria de contexto.
- Multimodalidad (heredada): el modelo base procesa texto, imagen y audio, aunque no está claro si el fine-tuning conserva estas capacidades; la model card no las menciona explícitamente.
- Soporte nativo de system prompt: permite control estructurado de la conversación.

## Casos de uso

- Análisis de documentos regulatorios: Jimi puede extraer cláusulas, comparar versiones de normativas y responder preguntas sobre el Código de Regulaciones Federales (Title 31 CFR), gracias a su entrenamiento en datasets regulatorios y su contexto largo.
- Asistente de presupuestos gubernamentales: con datos de OMB Circular A-11 y RedBook, el modelo puede explicar partidas presupuestarias, calcular apropiaciones y responder consultas sobre gasto federal.
- Pipeline de RAG para finanzas: su optimización para recuperación aumentada permite integrarlo en sistemas que consultan bases de datos de transacciones del US General Ledger o SF133, generando respuestas con citas.
- Atención al cliente en banca: el modelo puede gestionar conversaciones multi-turno sobre productos financieros, usando su capacidad de diálogo y su conocimiento de terminología financiera.
- Generación de informes automáticos: a partir de datos estructurados (por ejemplo, SF133), Jimi puede redactar informes narrativos sobre ejecución presupuestaria.
- Asistente de investigación jurídica: abogados y analistas pueden usarlo para resumir sentencias, localizar referencias cruzadas en regulaciones y preparar memorandos.
- Fine-tuning base para dominios específicos: al ser un modelo abierto con licencia MIT, puede servir como punto de partida para especializaciones adicionales en otros sectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la métrica `accuracy` sin valores concretos. No se proporcionan comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~7.5B parámetros en safetensors (probablemente BF16). En BF16, el peso ocupa ~15 GB, más overhead de activaciones y KV cache. Con cuantización 4-bit (si se aplica externamente), podría reducirse a ~4-5 GB.
- GPU recomendadas: para inferencia en BF16, se necesitan GPUs con al menos 16-20 GB de VRAM, como RTX 3090, RTX 4090, A10G o A100 (40 GB). Con cuantización 8-bit, una RTX 3080 de 10 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama alta para consumidores (RTX 3090/4090) con cuantización. Para uso en laptops, se requeriría cuantización 4-bit.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se genera un GGUF) o directamente con transformers.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; con 4B efectivos, se espera una latencia de decodificación de ~20-40 tokens/s en una RTX 4090 con cuantización 4-bit, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Jimi (Gemma 4 E4B fine-tuned) | 4.5B efectivos / 7.5B totales | 128K | MIT | Finanzas y regulación gubernamental |
| Gemma 3 4B (base) | 4B | 32K (ampliable a 128K) | Gemma Terms | Generalista |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Generalista |
| Qwen 2.5 3B | 3B | 32K (ampliable a 128K) | Apache 2.0 | Generalista, multilingüe |

No se dispone de datos de rendimiento comparativo entre estos modelos. La ventaja de Jimi es su ajuste específico para dominios legales y financieros, así como su licencia MIT, más permisiva que las de Gemma 3 o Llama 3.2. Sin embargo, al ser un fine-tuning de un modelo reciente (Gemma 4), su rendimiento en tareas generales debería ser similar al del modelo base, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó principalmente con datos en inglés y específicamente con documentos gubernamentales de EE. UU., por lo que puede tener sesgos hacia la terminología y perspectivas de ese contexto.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventar citas, especialmente en dominios especializados si el contexto no es suficiente.
- Limitaciones de idioma: aunque el modelo base Gemma 4 soporta más de 140 idiomas, el fine-tuning se realizó con datasets en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base Gemma 4 tiene sus propios términos (Gemma Terms of Use) que pueden imponer condiciones adicionales; es recomendable revisar ambos.
- Multimodalidad incierta: la model card no confirma si el fine-tuning conserva las capacidades de visión y audio del modelo base; es probable que el ajuste se centrara solo en texto.
- Contexto largo: aunque la ventana es de 128K, el rendimiento en contextos muy largos puede degradarse si no se usa una implementación optimizada (p. ej., FlashAttention).
- Producción: no hay información sobre pruebas de robustez, seguridad o alineación; se recomienda evaluar el modelo en el dominio específico antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leeroy-jankins/jimi
- Repositorio de código: https://github.com/is-leeroy-jenkins/Jimi
- Demo Streamlit: https://jimi-py.streamlit.app/
- Modelo base (Gemma 4 E4B): https://huggingface.co/google/gemma-4-E4B-it
- Datasets utilizados: https://huggingface.co/datasets/mlabonne/FineTome-100k y los datasets de `leeroy-jankins` (Regulations, Appropriations, OMB-Circular-A-11, RedBook, SF133, US-General-Ledger, Title-31-CFR-Money-and-Finance)
