# ai-sage/GigaChat4-708B-A41B-checkpoints

## Resumen

GigaChat 4 es el modelo insignia de la familia GigaChat, desarrollado por el equipo ai-sage (vinculado a Sber/Salute Developers). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 708.000 millones de parametros totales y 41.000 millones activos por token, disenado para conversacion multilingue, tareas agenticas de multiples pasos, tool calling, salidas estructuradas, razonamiento matematico, generacion de codigo y respuesta sobre documentos largos.

La arquitectura combina un backbone hibrido que intercala capas de atencion lineal GatedDeltaNet con capas de atencion dispersa DeepSeek Sparse Attention (DSA) sobre MLA, en una proporcion 3:1. Incorpora ademas capas MTP integradas para decodificacion especulativa. La ventana de contexto alcanza 1.048.576 tokens, extendida de forma progresiva desde 32K hasta 1M durante el entrenamiento.

El repositorio referenciado contiene checkpoints intermedios de entrenamiento en BF16 (pretraining, cosine annealing y midtraining), no el modelo final. Para uso conversacional, tool calling y seleccion por peticion entre modo instant y modo razonamiento, el autor remite al modelo final instruction-tuned en variantes FP8, BF16 y GGUF. Su relevancia actual radica en ser una de las pocas familias abiertas con licencia MIT a escala de 700B parametros y contexto de un millon de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con backbone hibrido: GatedDeltaNet (atencion lineal) + DeepSeek Sparse Attention sobre MLA, en proporcion 3:1 |
| Parametros totales | 708B |
| Parametros activos | 41B por token |
| Longitud de contexto | 1.048.576 tokens (modelo final); checkpoints intermedios con 4.096 y 32.768 tokens configurados |
| Tipos de cuantizacion | BF16 (checkpoints y variante base); FP8 y GGUF disponibles en las variantes instruction-tuned |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors en BF16 (repo de 7.100 GB); GGUF en la variante instruction-tuned |

## Arquitectura y entrenamiento

El modelo consta de 64 capas decodificadoras con hidden size de 7.168. De esas capas, 48 son de atencion lineal (GatedDeltaNet) y 16 de atencion dispersa (DSA). Cada capa MoE combina un experto compartido con 256 expertos enrutados, de los cuales se activan 8 por token. Las 3 primeras capas decodificadoras usan FFN densas. Se aplica GatedNorm a las salidas de bloque antes de la suma residual. La atencion dispersa selecciona 2.048 tokens por consulta, lo que permite recuperar informacion en contextos muy largos sin coste cuadratico completo.

El entrenamiento se organiza en fases: pretraining con contexto de 4.096 tokens (checkpoints en los pasos 80k, 120k y 173k), cosine annealing en el paso 235k, y midtraining en el paso 250k con contexto de 32.768 tokens. La ventana de contexto se extendio progresivamente de 32K a 128K y finalmente a 1M tokens; DSA se introdujo a 128K mediante entrenamiento solo del indexer, seguido de optimizacion conjunta de indexer y backbone a 1M tokens. El modelo incorpora una capa MTP reutilizada de forma recurrente (estilo EAGLE-3) y soporta un drafter separado DFlash2 de cinco capas BF16 que predice bloques de ocho posiciones (un token ancla y siete borradores). No se detalla en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en estas etapas.

## Capacidades

- Generacion de texto multilingue en ruso e ingles.
- Razonamiento matematico y resolucion de problemas.
- Generacion y comprension de codigo.
- Tool calling y function calling.
- Salidas estructuradas (structured outputs).
- Tareas agenticas de multiples pasos (multi-step agentic tasks).
- Question answering sobre documentos largos gracias a la ventana de 1M tokens.
- Modo instant y modo razonamiento seleccionables por peticion en el modelo instruction-tuned final (no en estos checkpoints).
- Decodificacion especulativa mediante MTP recurrente o drafter DFlash2.
- Capacidad de continuacion de texto con prompts en crudo en los checkpoints intermedios.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo (hasta 1M tokens), lo que permite incorporar historiales extensos o documentacion de producto sin truncar.
- Analisis de documentos legales o contractuales: la ventana de un millon de tokens posibilita procesar expedientes completos y responder preguntas concretas sobre clausulas dispersas en el texto.
- Generacion de codigo en produccion: con soporte de tool calling y salidas estructuradas, puede integrarse en pipelines de CI/CD para generar parches, tests o revisiones automatizadas.
- Agentes autonomos de multiples pasos: la combinacion de razonamiento, tool calling y contexto largo lo hace adecuado para orquestar flujos con varias llamadas a herramientas y memoria persistente.
- Asistencia en investigacion y sintesis: resumir y contrastar grandes volumenes de articulos o informes tecnicos en ruso o ingles.
- Razonamiento matematico asistido: resolucion de problemas paso a paso en entornos educativos o de analisis cuantitativo.
- Despliegue de inferencia de alto rendimiento: mediante decodificacion especulativa (MTP o DFlash2) y servidores como SGLang para reducir latencia en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 708B parametros, en BF16 se requieren aproximadamente 1,4 TB de memoria; en FP8, alrededor de 700 GB; las cuantizaciones GGUF reducen el requisito pero no se especifican tamanos concretos en la informacion disponible.
- GPU recomendadas: no se detallan en la informacion proporcionada; por escala, el despliegue requiere clústeres multi-GPU de clase A100/H100 o superior.
- Cabe en consumer GPU: no, el modelo completo no cabe en GPUs de consumo; solo mediante cuantizaciones GGUF agresivas y offloading, sin datos confirmados.
- Opciones de despliegue: SGLang (con cookbook oficial para GigaChat 4); GGUF disponible en la variante instruction-tuned para llama.cpp u Ollama, sin confirmacion explicita en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GigaChat 4 (708B-A41B) | 708B / 41B | 1.048.576 | MIT | Pesos abiertos en HF (BF16, FP8, GGUF) |
| DeepSeek-V3 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Modelos MoE abiertos de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Estos checkpoints son intermedios y usan prompts en crudo; no estan ajustados para conversacion ni tool calling. Para esos usos debe emplearse el modelo instruction-tuned final.
- Idiomas soportados limitados a ruso e ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos no documentados en la informacion proporcionada.
- Aunque la licencia es MIT, conviene verificar las condiciones de uso comercial y las politicas del proveedor en la documentacion oficial.
- El coste de despliegue es muy elevado (repo de 7.100 GB en BF16), lo que restringe su uso a infraestructuras de gran escala.
- Los checkpoints intermedios pueden presentar configuraciones de atencion y contexto distintas a la configuracion final; debe consultarse el `config.json` de cada revision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-checkpoints
- Modelo base final: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-base
- Modelo instruction-tuned FP8: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- Modelo instruction-tuned BF16: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-bf16
- Modelo instruction-tuned GGUF: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-GGUF
- Coleccion de modelos: https://huggingface.co/collections/ai-sage/gigachat-4
- Informe tecnico: https://github.com/salute-developers/gigachat4/blob/main/GigaChat_4.pdf
- Blog: https://giga.chat/blog/en
- GitHub: https://github.com/salute-developers/gigachat4
- SGLang Cookbook: https://docs.sglang.io/cookbook/autoregressive/GigaChat/GigaChat4
