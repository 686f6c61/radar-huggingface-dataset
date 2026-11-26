# ai-sage/GigaChat4-708B-A41B-GGUF

## Resumen

GigaChat 4 es el modelo insignia de la familia GigaChat, desarrollado por Sber (publicado en Hugging Face bajo la organización ai-sage). Se trata de un modelo de lenguaje de arquitectura híbrida que combina Mixture-of-Experts (MoE) con DeepSeek Sparse Attention (DSA) y Gated DeltaNet (GDN), con 708.000 millones de parámetros totales y 41.000 millones activos por token. Esta ficha cubre la variante cuantizada en GGUF del checkpoint instruction-tuned, pensada para despliegue local con llama.cpp y compatible con endpoints.

El modelo resuelve el problema de unificar modos instantáneo y de razonamiento en un único checkpoint (a diferencia de GigaChat 3.5, que ofrecía checkpoints separados), seleccionables por petición. Incorpora una ventana de contexto de 1.048.576 tokens, soporte multilingüe (ruso e inglés), tool calling, salidas estructuradas, razonamiento matemático y generación de código. Además incluye decodificación especulativa mediante un drafter MTP recurrente o un drafter DFlash2 independiente.

Su relevancia actual radica en que es uno de los pocos modelos abiertos de escala ~700B con atención híbrida lineal/dispersa y contexto de un millón de tokens, publicado bajo licencia MIT, lo que permite uso comercial sin restricciones. La disponibilidad de pesos GGUF facilita su evaluación en infraestructuras propias, aunque el tamaño del repositorio (3.188,7 GB) exige recursos de almacenamiento considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con GatedDeltaNet (atención lineal) y DeepSeek Sparse Attention (DSA) sobre capas MLA; 64 capas decoder, hidden size 7.168 |
| Parametros totales | 710.235.315.584 (~708B) |
| Parametros activos | 41B por token (8 de 256 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | GGUF (varias cuantizaciones disponibles en el repositorio); checkpoint base en BF16 y variante FP8 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); BF16 y FP8 en repositorios hermanos |

## Arquitectura y entrenamiento

GigaChat 4 emplea un backbone híbrido que intercala capas de GatedDeltaNet y de DeepSeek Sparse Attention en proporción 3:1 (48 capas de atención lineal y 16 de atención dispersa). GatedDeltaNet mantiene un estado recurrente de tamaño fijo para procesamiento eficiente, mientras que DSA selecciona 2.048 tokens previos por consulta, lo que permite recuperar información en contextos largos. Cada capa MoE combina un bloque de atención con 256 expertos enrutados (8 activos por token) y un experto compartido; las tres primeras capas decoder usan FFN densas. Se aplica GatedNorm a las salidas de bloque antes de la suma residual.

El contexto se extendió progresivamente de 32K a 128K y finalmente a 1M tokens; DSA se introdujo a 128K mediante entrenamiento solo del indexer, seguido de optimización conjunta del indexer y el backbone a 1M tokens. Para estabilidad del preentrenamiento se usaron técnicas como Progressive Residual Warm-up (ProRes), z-loss específico de proyecciones con softcapping de logits y Dynamic Learning-Rate Rescaling (DLR) para desequilibrios de carga de expertos. La alineación partió de un SFT y continuó con RL sobre matemáticas, código, uso de herramientas y flujos agénticos multi-turno; los expertos resultantes se consolidaron mediante destilación on-policy multi-profesor con optimizador Muon. El modelo incluye una capa MTP integrada reutilizada de forma recurrente y admite decodificación especulativa con drafter MTP (estilo EAGLE-3) o con DFlash2 (drafter BF16 de cinco capas que predice bloques de ocho posiciones).

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y comprensión de código.
- Tool calling y function calling.
- Salidas estructuradas (structured output).
- Flujos agénticos multi-step y razonamiento agéntico.
- Question answering sobre documentos largos gracias a la ventana de 1M tokens.
- Dos modos seleccionables por petición: instantáneo y razonamiento (thinking).
- Decodificación especulativa para acelerar la generación autoregresiva.
- Capacidades multilingües limitadas a ruso e inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 1.048.576 tokens, manteniendo el hilo de incidencias extensas sin truncar historial.
- Análisis de documentación extensa: question answering sobre contratos, informes o bases de conocimiento de cientos de miles de tokens, aprovechando DSA para recuperar pasajes relevantes.
- Generación de código en producción: soporta tool calling y salidas estructuradas, lo que permite integrarlo en pipelines de CI/CD para generar parches, tests o documentación técnica.
- Agentes autónomos multi-step: su soporte de razonamiento agéntico y function calling lo hace adecuado para orquestar tareas que requieren varias llamadas a herramientas y planificación.
- Asistentes de razonamiento matemático: el modo de razonamiento permite resolver problemas de varios pasos en entornos educativos o de análisis financiero.
- Procesamiento de corpus en ruso: al estar entrenado para ruso e inglés, es adecuado para sistemas de resumen, extracción y clasificación en organizaciones con documentación en ruso.
- Despliegue local con llama.cpp: la variante GGUF permite ejecutar el modelo en infraestructura propia sin dependencia de APIs externas, seleccionando la cuantización según RAM y VRAM disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un informe técnico (GigaChat_4.pdf) que no se incluye en los datos proporcionados, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio GGUF ocupa 3.188,7 GB en total; cada cuantización individual requiere espacio proporcional. Con 708B parámetros, una cuantización de 4 bits rondaría los 350-400 GB, y una de 8 bits superaría los 700 GB. No se dispone de cifras oficiales por cuantización en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por escala, se requerirían nodos multi-GPU de clase A100/H100 con agregación de memoria.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo individuales (RTX 4090 con 24 GB) ni en configuraciones multi-GPU de consumo típicas; requiere despliegue en servidor.
- Opciones de despliegue: llama.cpp y ecosistema GGUF (Ollama, entre otros); SGLang dispone de cookbook específico para GigaChat 4; vLLM y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponible. La decodificación especulativa (MTP recurrente o DFlash2) está diseñada para acelerar la generación, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| GigaChat 4 (708B-A41B) | 708B / 41B | 1.048.576 | MIT | GGUF, BF16, FP8 |
| DeepSeek-V3 (referencia de arquitectura MLA/MoE) | no disponible en la información | no disponible | no disponible | no disponible |
| GigaChat 3.5 (generación anterior) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada. La comparativa se limita a lo declarado en la model card sobre GigaChat 3.5 (checkpoints separados para modo instantáneo y razonamiento, tres bloques MTP independientes frente a uno recurrente en GigaChat 4).

## Limitaciones y advertencias

- Idiomas: solo ruso e inglés declarados; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; como modelo entrenado a gran escala, puede reproducir sesgos presentes en los datos.
- Alucinación: no se publican métricas de fiabilidad ni tasas de alucinación; en tareas de QA sobre documentos largos conviene verificar las respuestas.
- Contexto: aunque la ventana es de 1M tokens, DSA solo atiende a 2.048 tokens por consulta, lo que puede afectar a la recuperación de información muy dispersa en contextos extremos.
- Licencia: MIT permite uso comercial sin restricciones adicionales, pero conviene revisar las condiciones de los datos de entrenamiento no detalladas en la model card.
- Producción: el tamaño (708B) y el repositorio GGUF de 3.188,7 GB implican costes de almacenamiento y despliegue elevados; las cuantizaciones agresivas pueden degradar la calidad y no se documentan evaluaciones por cuantización.
- Fecha de creación del repositorio: 2026-11-21, según los metadatos; verificar la vigencia de la información antes de desplegar.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ai-sage/GigaChat4-708B-A41B-GGUF
- Modelo base BF16: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-bf16
- Variante FP8: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- Modelo base (base): https://huggingface.co/ai-sage/GigaChat4-708B-A41B-base
- Checkpoints intermedios: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-checkpoints
- Colección GigaChat 4: https://huggingface.co/collections/ai-sage/gigachat-4
- Informe técnico (PDF): https://github.com/salute-developers/gigachat4/blob/main/GigaChat_4.pdf
- Blog: https://giga.chat/blog/en
- GitHub: https://github.com/salute-developers/gigachat4
- SGLang Cookbook: https://docs.sglang.io/cookbook/autoregressive/GigaChat/GigaChat4
