# Baekpica/Solar-Open2-250B-Mixed-Quant-GGUF

## Resumen

Solar Open2 250B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Upstage, pensado para tareas agénticas de horizonte largo. Con 250 287 millones de parámetros totales y unos 15 000 millones activos (250B-A15B), supone una evolución del Solar Open 1 (102B) y alcanza una ventana de contexto de un millón de tokens gracias a una pila de atención híbrida que intercala una capa softmax entre cada tres capas de atención lineal, sin codificación posicional. Esta conversión concreta, publicada por Baekpica, es una versión GGUF de cuantización mixta (denominada MXQ-v1) que preserva la topología completa del modelo original: 48 capas, 320 expertos enrutados por capa y un experto compartido, sin podas ni destilación.

El modelo está orientado a tareas que requieren mantener trayectorias completas de agente en un único contexto, como razonamiento multi-paso, uso de herramientas y análisis de repositorios extensos. Soporta inglés, coreano y japonés, y su licencia es la propietaria upstage-solar-license, lo que implica restricciones de uso comercial que deben revisarse antes de desplegarlo en producción. Esta conversión es independiente y no es una publicación oficial de Upstage, aunque se basa en el checkpoint oficial del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención softmax + atención lineal (KDA), 48 capas, 320 expertos enrutados + 1 compartido, sin codificación posicional |
| Parámetros totales | 250 287 810 304 (250B) |
| Parámetros activos | 15B (A15B) |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantización | MXQ-v1 mixto: Q8_0 (embeddings, GQA, LM head, shared expert), IQ2_XXS + imatrix (gate/up de capas 4–43), Q3_K + imatrix (down de capas 4–43), Q4_K (capas 0–3 y 44–47), F32 (router y norm). Aproximadamente 3,05 bits por peso (BPW) |
| Idiomas soportados | Inglés (en), coreano (ko), japonés (ja) |
| Licencia | upstage-solar-license (propietaria, no OSI) |
| Formato de pesos | GGUF (11 shards, 95,5 GB; safetensors en el modelo base) |

## Arquitectura y entrenamiento

Solar Open2 250B usa una arquitectura MoE híbrida que combina atención softmax clásica con capas de atención lineal (denominadas KDA) en un esquema `[GQA, KDA, KDA, KDA] × 12`. Esta intercalación permite alcanzar una ventana de contexto de un millón de tokens sin necesidad de codificación posicional explícita, manteniendo un coste computacional subcuadrático en la longitud de la secuencia. Cada capa dispone de 320 expertos enrutados y un experto compartido, lo que da un total de 250 000 millones de parámetros, de los cuales solo 15 000 millones se activan por token.

El corpus de calibración para la cuantización de esta conversión GGUF sigue una mezcla documentada: 22 % de chat con plantilla Solar, 32 % de razonamiento en dos etapas (Cascade), 16 % coreano, 12 % otros multilingües, 6 % finanzas, 6 % SWE y 6 % código algorítmico. El imatrix se procesó sobre 590 fragmentos de 512 tokens, y se alcanzó una cobertura estricta de 320/320 expertos en las capas 1–47; la capa 0 mantiene una excepción documentada de 29 expertos con activación cero. No se ha publicado información detallada sobre el preentrenamiento completo (número de tokens totales, dataset completo o uso de RLHF/DPO) en la documentación de esta conversión, aunque el informe técnico de Solar Open 2 en arXiv describe el proceso de escalado desde 102B a 250B.

## Capacidades

- Generación de texto y razonamiento multietapa: puede realizar cadenas de razonamiento largas sin perder el hilo gracias a su ventana de contexto de 1M tokens.
- Generación de código y tareas SWE: soporta código algorítmico y de ingeniería de software, con validación de salidas en formato JSON y listas restringidas.
- Capacidades multilingües: inglés, coreano y japonés, con validación de salidas no vacías y sin NaN en los tres idiomas.
- Soporte para agentes y trayectorias largas: la combinación de contexto 1M y atención híbrida permite mantener estados de agente completos en una sola sesión.
- Sin modo de visión ni audio: es un modelo de texto puro; no se indican capacidades multimodales.
- Compatibilidad con tool calling: no se menciona explícitamente en la documentación de la conversión, pero el modelo base de Solar Open 2 está orientado a agentes; no se ha confirmado en esta variante.
- Inferencia en GPU con cuantización mixta: el formato GGUF permite ejecución con llama.cpp y runtime ds4, incluyendo servidor compatible con OpenAI Chat Completions.

## Casos de uso

- **Asistentes de código para repositorios extensos**: el contexto de 1M tokens permite cargar un repositorio completo de tamaño medio y realizar tareas de refactorización, depuración o revisión de código sin dividir el contexto en fragmentos. El modelo puede mantener la estructura del proyecto y generar parches coherentes.
- **Trayectorias agénticas de largo plazo**: en un pipeline de agente autónomo, el modelo puede mantener el historial completo de acciones, observaciones y razonamientos intermedios durante horas de ejecución, evitando la pérdida de estado que sufren los modelos con contexto corto.
- **Análisis financiero de documentos extensos**: el corpus de calibración incluye un 6 % de datos financieros, por lo que puede procesar informes anuales, estados financieros o series de datos en contexto y generar resúmenes o detectar anomalías con referencias cruzadas.
- **Generación y revisión de código en producción**: con su soporte de código algorítmico y SWE, puede integrarse en pipelines de CI/CD para revisión de pull requests, generación de tests unitarios o documentación automática de APIs.
- **Asistencia multilingüe en atención al cliente**: con soporte nativo para coreano, japonés e inglés, puede gestionar conversaciones de soporte técnico de larga duración, manteniendo el contexto completo de la interacción y el historial del usuario.
- **RAG con corpus masivos**: la ventana de 1M tokens permite inyectar directamente documentos completos (manuales, normativas, bases de conocimiento) sin necesidad de fragmentación, mejorando la precisión de las respuestas basadas en recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico de Solar Open 2 (arXiv:2607.20062) describe el modelo y su escalado, pero la documentación de esta conversión GGUF no incluye puntuaciones de MMLU, HumanEval, GSM8K u otras métricas. Los datos de rendimiento medidos en esta conversión se limitan a la latencia de inferencia en hardware específico (ver sección de requisitos de hardware).

## Requisitos de hardware

- **VRAM estimada**: el artefacto MXQ-v1 ocupa 88,973 GiB (~95,5 GB) en disco. Con cuantización mixta de ~3,05 BPW, la inferencia requiere al menos ~96 GB de memoria GPU para cargar los pesos completos; con contexto largo (1M tokens) se necesitaría memoria adicional para el estado KV, por lo que se recomienda una GPU de 128 GB o superior.
- **GPUs compatibles**: el artefacto se validó cargado en 4× NVIDIA H100 NVL (94 GB cada una) y también en una NVIDIA DGX Spark GB10 (128 GB de memoria unificada). En una sola GPU, requiere una H100 96 GB, A100 80 GB no es suficiente (95,5 GB), o una GB10 con 128 GB unificados.
- **Inferencia en consumer**: no es viable en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) por el tamaño del modelo, incluso con cuantización agresiva. El modelo necesita hardware profesional o un sistema con memoria unificada amplia.
- **Opciones de despliegue**: 
  - `llama.cpp` (base de la conversión) con el runtime `ds4` (servidor OpenAI-compatible).
  - Runtime `ds4-server` con backend CUDA y VMM, probado en DGX Spark.
  - vLLM o TGI no se han probado con este artefacto específico; el modelo base de Solar Open 2 debería ser compatible con frameworks que soporten MoE híbrida y atención lineal, pero no hay evidencia de pruebas en esta conversión.
- **Rendimiento medido** (en DGX Spark GB10, 128 GB unificados, 6 hilos):
  - Prefill: 1050,7 tok/s para 8K tokens; 804,5 tok/s para 64K tokens.
  - Decode: 19,05 tok/s (p50) para 8K; 13,07 tok/s (p50) para 64K.
  - En H100 (4×), se completaron generaciones deterministas y verificaciones de calidad, pero no se publican métricas de rendimiento como referencia de producción.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Solar Open2 250B (MXQ-v1) | 250B | 15B | 1M | upstage-solar-license | Sí (esta conversión) |
| Solar Open 1 (100B) | 100B | 15B | 32K | Apache 2.0 | Sí |
| DeepSeek-V3 (671B) | 671B | 37B | 128K | MIT | Sí |

Solar Open 2 escala desde los 102B de Solar Open 1 hasta los 250B totales, manteniendo la misma cantidad de parámetros activos (15B) y ampliando el contexto de 32K a 1M tokens. Frente a DeepSeek-V3, ofrece una ventana de contexto mucho mayor (1M vs 128K) con menos parámetros totales, pero la licencia es más restrictiva (upstage-solar-license vs MIT). No se dispone de datos de rendimiento comparativos en benchmarks para estas tres opciones en la información disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: la upstage-solar-license es una licencia propietaria; antes de usar el modelo en producción comercial hay que revisar los términos exactos del archivo LICENSE en el repositorio. No es una licencia open source.
- **Idiomas limitados**: el modelo está entrenado para inglés, coreano y japonés; no se garantiza calidad en otros idiomas, aunque la calibración incluye un 16 % de otros multilingües.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por el corpus de entrenamiento. No se ha validado la exactitud factual en esta conversión.
- **Cuántización agresiva**: las capas de gate/up de las capas 4–43 usan IQ2_XXS (2 bits efectivos), lo que puede degradar la calidad de razonamiento en comparación con el modelo en BF16. Se recomienda evaluar con casos reales antes de desplegar.
- **Excepción en la capa 0**: 29 expertos con activación cero en la capa 0 no se han compensado; el autor indica que no se redujo la precisión para compensar, pero es una anomalía documentada que puede afectar a ciertos inputs.
- **Rendimiento de decode bajo**: con 13–19 tokens por segundo en DGX Spark, no es adecuado para aplicaciones de baja latencia en tiempo real; es más apropiado para tareas batch o agénticas donde la latencia no es crítica.
- **Contexto de 1M no verificado en Spark**: la documentación indica que servir 1 048 576 tokens en DGX Spark no está probado; la ventana de contexto completa solo se ha validado en configuraciones con 4×H100.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/Baekpica/Solar-Open2-250B-Mixed-Quant-GGUF
- Conversión GGUF completa (BF16 y Q8_0): https://huggingface.co/Baekpica/Solar-Open2-250B-GGUF
- Modelo base (Upstage): https://huggingface.co/upstage/Solar-Open2-250B
- Informe técnico de Solar Open 2 (arXiv): https://arxiv.org/abs/2607.20062
- PDF del informe técnico: https://arxiv.org/pdf/2607.20062
- Repositorio de reproducción (ds4): https://github.com/Baekpica/ds4/commit/b2e52b9048ba339327539212de1c47d009dde126
