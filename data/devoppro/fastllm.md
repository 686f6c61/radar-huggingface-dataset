# devoppro/FastLLM

## Resumen

FastLLM es un modelo de lenguaje causal decoder-only de aproximadamente 150 millones de parámetros, desarrollado por el usuario devoppro y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo construido desde cero en PyTorch e integrado con la librería `transformers`, que incorpora técnicas modernas de arquitectura como Grouped-Query Attention (GQA), SwiGLU, RMSNorm y Rotary Position Embeddings (RoPE). Su objetivo principal es servir como un modelo ligero para generación de texto en inglés, con un enfoque en la eficiencia y la simplicidad de despliegue.

El modelo emplea un tokenizador BPE de Qwen 2.5 con un vocabulario de 151 936 tokens, y su ventana de contexto máxima es de 2048 tokens. Aunque la tarjeta del modelo indica una cifra de parámetros de 150 millones, el archivo de pesos en formato Safetensors contiene 308 890 368 parámetros, una discrepancia que conviene tener en cuenta al evaluar su tamaño real. El repositorio ocupa 14.8 GB, lo que sugiere que los pesos se almacenan en precisión FP16 o en múltiples archivos, aunque no se especifica el detalle.

FastLLM se presenta como una alternativa ligera para aplicaciones que requieran generación de texto en inglés con un modelo pequeño y fácil de ejecutar en hardware modesto. Al ser un proyecto de un desarrollador independiente, carece de la documentación y los benchmarks públicos que suelen acompañar a modelos de mayor escala, por lo que su evaluación debe basarse en pruebas empíricas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (`ModernLLMForCausalLM`) |
| Parametros totales | 308 890 368 (según safetensors; el README declara ~150M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (no se especifica en la información) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP16) |

## Arquitectura y entrenamiento

FastLLM es un transformer causal decoder-only de 12 capas con hidden size de 768 y un tamaño intermedio de 2048 en las capas SwiGLU. Emplea 12 cabezas de atención para las consultas y 4 cabezas para claves y valores (ratio 3:1), lo que reduce el coste computacional de la atención. La normalización se realiza con RMSNorm (epsilon 1e-6) y la codificación posicional se basa en RoPE con theta 1000000.0. No se utiliza ningún mecanismo de atención lineal ni decodificación especulativa; se trata de una arquitectura transformer estándar con las mejoras habituales de los LLM modernos.

En cuanto al entrenamiento, la tarjeta del modelo indica que se utilizó un intercalado dinámico de flujos de datos procedentes de cuatro conjuntos de datos de alta calidad, pero no se especifican los nombres de los datasets, el número de tokens totales ni el proceso de alineación (RLHF, DPO, etc.). La información disponible no permite conocer la composición exacta de los datos de entrenamiento ni las técnicas de optimización empleadas.

## Capacidades

- Generación de texto en inglés: el modelo puede producir texto coherente en inglés, aunque su tamaño reducido limita la complejidad y la coherencia en tareas largas.
- Razonamiento básico: al ser un modelo de 150M de parámetros, su capacidad de razonamiento es limitada y no se espera que resuelva problemas complejos de matemáticas o lógica avanzada.
- Soporte de tool calling / function calling: no se menciona en la información disponible; no se puede confirmar esta capacidad.
- Soporte de agentes y multi-step reasoning: no hay evidencia de que el modelo pueda ejecutar razonamiento de múltiples pasos o actuar como agente autónomo.
- Capacidades multilingües: solo se declara el inglés; no se ha entrenado para otros idiomas.
- Capacidades especiales: no se mencionan modos de pensamiento, visión, audio ni otras modalidades.

## Casos de uso

- Generación de texto para prototipos: dado su tamaño reducido, se puede usar para generar borradores de texto en inglés en aplicaciones de demostración o pruebas de concepto sin requerir grandes recursos de hardware.
- Completado de frases o textos cortos: su contexto de 2048 tokens permite completar párrafos o correos electrónicos, aunque la calidad puede ser inferior a modelos más grandes.
- Clasificación de texto mediante adaptación: se puede fine-tuning con un clasificador para tareas como análisis de sentimiento o categorización de documentos, gracias a su tamaño manejable.
- Chatbot sencillo en inglés: se puede desplegar como un asistente conversacional básico para consultas simples, aunque su limitada capacidad de razonamiento puede dar respuestas incoherentes en diálogos largos.
- Evaluación de arquitecturas modernas: dado que incorpora GQA, SwiGLU y RoPE, sirve como referencia para experimentos sobre el impacto de estas técnicas en modelos pequeños.
- Pruebas de integración con herramientas de inferencia: al ser compatible con `transformers`, se puede utilizar para validar el funcionamiento de vLLM, llama.cpp u otros motores de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar, por lo que no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 308 M parámetros en FP16, el modelo ocupa aproximadamente 0.6 GB. Con cuantización de 4 bits podría reducirse a unos 0.15 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso tarjetas integradas con suficiente memoria) puede ejecutar el modelo en FP16.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de las GPUs de consumo actuales, incluso en aquellas con poca memoria.
- Opciones de despliegue: al ser compatible con `transformers`, se puede usar con vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, o mediante la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, un modelo de 150M suele generar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo rango de parámetros y con las mismas características técnicas. La información disponible no permite establecer una comparación con alternativas como GPT-2 small, Qwen-1.5B u otros modelos de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos, por lo que se desconocen posibles comportamientos discriminatorios.
- Riesgo de alucinación: al ser un modelo pequeño, es probable que genere afirmaciones falsas o inventadas con cierta frecuencia, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para tareas que requieran largos historiales de conversación o documentos extensos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el desarrollador no ofrece garantías sobre la calidad o seguridad del modelo.
- Caveats de producción: el modelo no ha sido evaluado para tareas críticas y su rendimiento en entornos reales puede ser insatisfactorio; se recomienda probarlo exhaustivamente antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devoppro/FastLLM

No se han encontrado otros enlaces oficiales (paper, blog, repositorio de código) en la búsqueda web. Los resultados de búsqueda sobre "Fast-LLM" corresponden a otro proyecto (ServiceNow Fast-LLM, una librería de entrenamiento) y no están relacionados con este modelo.
