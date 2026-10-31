# esatapedico/Gemma-4-31B-IT-NVFP4-GGUF

## Resumen

Gemma-4-31B-IT-NVFP4-GGUF es una familia de cinco archivos GGUF convertidos por el usuario esatapedico a partir del checkpoint oficial nvidia/Gemma-4-31B-IT-NVFP4, un modelo denso de 31 mil millones de parámetros afinado con instrucciones (instruction-tuned) desarrollado por NVIDIA. El modelo base destaca por su contexto nativo de 262.144 tokens y por su cuantización NVFP4 nativa (pesos a 4 bits con escalas FP8 por bloques y group size 16, esquema W4A16), diseñada para ejecutarse de forma nativa en GPUs NVIDIA Blackwell (arquitectura sm_120).

La aportación del conversor es puramente numérica: sobre una columna vertebral NVFP4 de 410 tensores (180 feed-forward + 230 de atención) idéntica byte a byte en cuatro de los cinco niveles, se construye una escalera de precisión que varía la cabeza de embeddings (Q4_K, Q6_K, Q8_0 o BF16) y, en el nivel HIGHEST, la precisión de la atención (Q8_0). El resultado son archivos de entre 17,29 y 23,55 GB pensados para hardware de consumo, en particular configuraciones de doble GPU de 16 GB.

Es relevante ahora mismo porque ofrece una vía práctica para ejecutar un modelo denso de 31B con contexto de 256K en GPUs de consumo modernas, aprovechando la cuantización NVFP4 que NVIDIA ha impulsado con la generación Blackwell, bajo licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (60 bloques de atención), instruction-tuned |
| Parametros totales | 30.697.345.956 (~31B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 nativo (W4A16, escalas FP8, group size 16); token_embd en Q4_K, Q6_K, Q8_0 o BF16 según nivel; atención en Q8_0 en el nivel HIGHEST |
| Idiomas soportados | Inglés (según model card; no disponible información sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde checkpoint NVFP4 oficial) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parámetros con 60 bloques de atención, afinado con instrucciones por NVIDIA. Su rasgo técnico distintivo es la cuantización NVFP4 nativa: pesos a 4 bits en formato de punto flotante con escalas FP8 por bloques de 16 elementos (esquema W4A16, es decir, pesos de 4 bits y activaciones en 16 bits). Este formato está soportado de forma nativa por las GPUs Blackwell (sm_120), lo que permite acelerar la inferencia sin recurrir a cuantizaciones enteras tradicionales. El contexto nativo es de 262.144 tokens. Los embeddings están atados (tied embeddings), de modo que token_embd es la única cabeza de salida, y es precisamente el único tensor que el checkpoint oficial deja fuera de NVFP4.

Sobre ese checkpoint, esatapedico construyó cinco archivos GGUF: cuatro comparten una columna vertebral NVFP4 de 410 tensores byte-idéntica y difieren solo en la precisión de token_embd (Q4_K en LOW, Q6_K en MEDIUM, Q8_0 en MID-HIGH, BF16 en HIGH). El nivel HIGHEST es el único que modifica la columna vertebral, llevando los 230 tensores de atención de NVFP4 a Q8_0, lo que lo convierte en el nivel de máxima fidelidad. El proceso consistió en convertir el checkpoint oficial con `--outtype auto` preservando los tensores NVFP4, verificar el censo de tensores por nivel, y parchear los metadatos GGUF sin alterar los datos de los tensores. No hay información disponible sobre los datos de preentrenamiento, número de tokens de entrenamiento ni técnicas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational, con chat template de NVIDIA Gemma intacto).
- Seguimiento de instrucciones (variante instruction-tuned).
- Contexto extremadamente largo: 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- No disponible: capacidades multimodales. La fuente es text-only: sin torre de visión, sin mmproj y sin MTP drafter (no hay decodificación especulativa incluida).
- No disponible: información verificada sobre tool calling, agentes ni capacidades de código o matemáticas del modelo base.

## Casos de uso

- Procesamiento de documentos extensos: con 262K tokens de contexto nativo, permite resumir o analizar libros técnicos, contratos largos o bases de código completas sin dividir el contenido en fragmentos.
- Chatbot local en estación de trabajo con doble GPU: los niveles LOW a HIGH caben en dos GPUs de 16 GB con tensor split (por ejemplo, 2x RTX 5070 Ti), ofreciendo un asistente conversacional privado sin depender de APIs externas.
- Experimentación con cuantización NVFP4: la escalera de cinco niveles permite comparar el impacto de la precisión de embeddings y atención en calidad y velocidad, útil para investigación en cuantización.
- RAG sobre corpus grandes: la ventana de 256K tokens permite incluir muchos documentos recuperados en un único prompt, reduciendo la necesidad de re-ranking agresivo.
- Generación de texto en lote en GPUs Blackwell: el formato NVFP4 nativo aprovecha el soporte de hardware de sm_120 para maximizar el throughput en servidores con RTX 50xx.
- Prototipado con llama.cpp: los archivos GGUF son directamente compatibles con llama.cpp y derivados (Ollama, LM Studio), facilitando pruebas rápidas en local.
- Uso comercial sin fricción: la licencia Apache 2.0 permite integrar el modelo en productos sin obligaciones copyleft ni restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor del repo sí publicó comprobaciones informales (single run, no comparables entre configuraciones) sobre dos RTX 5070 Ti con tensor split:

| Nivel | PPL (estimación final) |
|---|---|
| LOW | 711,62 ± 62,35 |
| MEDIUM | 562,54 ± 48,52 |
| MID-HIGH | 620,37 ± 53,99 |
| HIGH | 598,87 ± 51,99 |
| HIGHEST | 1219,77 ± 107,39 |
| ORIG oficial (31,5 GB, referencia, no distribuido) | 1243,84 |

Advertencias del propio autor: la PPL no correlaciona con la precisión en tareas (el nivel con mayor PPL ocupa el cuarto puesto de cinco en MMLU según sus mediciones, aunque los resultados concretos de MMLU no se detallan en la información disponible); debe tratarse como una comprobación de carga y generación. Los cinco niveles pasaron una prueba de humo (prompt de 220 tokens, temp 0,8, seed 42) generando texto coherente y sin repeticiones. Según el autor, los cinco niveles se sitúan en una banda de ±1 punto porcentual entre sí, y HIGH sería el de mayor MMLU medido.

## Requisitos de hardware

- VRAM estimada: los niveles LOW a HIGH requieren aproximadamente dos GPUs de 16 GB con tensor split, o descarga parcial a CPU. El nivel HIGHEST necesita unos 22 GiB de VRAM además de la caché KV.
- GPUs recomendadas: NVIDIA Blackwell (sm_120) para aprovechar NVFP4 de forma nativa, por ejemplo RTX 5070 Ti, RTX 5080 o RTX 5090. En hardware sin soporte NVFP4 los tensores se dequantizan, con penalización de rendimiento (no disponible: cifras concretas).
- Consumer GPUs: sí, cabe en configuraciones de doble GPU de 16 GB (verificado por el autor con 2x RTX 5070 Ti); en una única GPU de 24 GB (RTX 3090/4090) los niveles de 17-19 GB podrían caber con caché KV limitada (no disponible: medición confirmada).
- Despliegue: llama.cpp (herramientas llama-perplexity y llama-bench usadas por el autor), y por extensión Ollama y LM Studio al ser GGUF. No disponible: soporte verificado en vLLM o TGI para estos archivos concretos.
- Rendimiento: se ejecutaron pruebas de velocidad con llama-bench en doble RTX 5070 Ti, pero las cifras concretas de tokens/s no están incluidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-IT-NVFP4-GGUF (esta ficha) | 30,7B (denso) | 262.144 | NVFP4 nativo + escalera de embeddings | Apache 2.0 | GGUF público (5 niveles) |
| nvidia/Gemma-4-31B-IT-NVFP4 (base) | 30,7B (denso) | 262.144 | NVFP4 nativo | Apache 2.0 | Checkpoint oficial, 31,5 GB |
| Modelos densos ~30B con GGUF (p. ej. Qwen/LLaMA de tamaño similar) | ~30B | No disponible para comparación directa | Q4/Q8 típico | Variable | Amplia en HF |

No hay datos de rendimiento comparativos publicados entre esta conversión y alternativas de la misma categoría, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Idioma: el model card declara únicamente inglés; no hay garantía documentada de rendimiento en castellano ni otros idiomas.
- Text-only: no hay torre de visión ni soporte multimodal; tampoco MTP drafter para decodificación especulativa.
- La PPL publicada no predice precisión en tareas; el propio autor advierte de que las métricas son comprobaciones informales de una sola ejecución, no comparables entre configuraciones.
- La diferencia de calidad entre los cinco niveles se sitúa en una banda de ±1 punto porcentual, por lo que la elección de nivel apenas afecta a la precisión medida (salvo HIGHEST en fidelidad de atención, que tampoco lidera claramente en tareas).
- Requisitos de memoria exigentes para consumo: se necesitan dos GPUs de 16 GB o descarga a CPU; la caché KV con contexto de 256K añade VRAM significativa (no disponible: cifra exacta).
- NVFP4 rinde de forma nativa solo en Blackwell (sm_120); en arquitecturas anteriores el rendimiento puede degradarse notablemente.
- Riesgo de alucinación: inherente a cualquier LLM; no hay evaluaciones de seguridad o sesgo publicadas para esta conversión (no disponible).
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque el modelo base es de NVIDIA y conviene revisar los términos del checkpoint original si se redistribuye.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/esatapedico/Gemma-4-31B-IT-NVFP4-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- Sitio del autor (actualizaciones y benchmarks): https://www.esatapedico.com
