# mradermacher/Temper-2-Sapient-GGUF

## Resumen

Temper-2-Sapient es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por maylore-ai y distribuido en formato GGUF por mradermacher. El modelo está construido sobre la arquitectura Qwen2, según indican las etiquetas del repositorio, y está orientado a tareas de generación de código, en particular en Rust, además de conversación general. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

Esta ficha documenta específicamente la versión cuantizada publicada por mradermacher, que ofrece un conjunto de cuantizaciones estáticas en formato GGUF (desde Q2_K hasta f16) para facilitar el despliegue en hardware con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base soporta los idiomas inglés y ruso, y está etiquetado como conversacional.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 7,6B parámetros en GPUs de consumo con cuantizaciones de 4 bits que ocupan entre 4,6 y 4,8 GB, manteniendo una calidad razonable. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, el contexto máximo ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según etiquetas del repo) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 68,1 GB |
| Modelo base | maylore-ai/Temper-2-Sapient |
| Cuantizador | mradermacher |
| Fecha de publicacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según se deduce de la etiqueta `qwen2` incluida en el repositorio. El recuento de parámetros de 7.615.616.512 sitúa al modelo en la categoría de 7-8B, un tamaño habitual para despliegues en una sola GPU. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas específicas del modelo base.

La contribución de esta publicación es exclusivamente la cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas ni con imatrix, según indica la propia model card) del modelo base en safetensors. El proceso de conversión se realizó con `convert_type: hf` y `quantize_version: 2`, según los metadatos internos del README. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Generación y asistencia en código, con especial orientación a Rust según la etiqueta `rust` y `code`.
- Soporte multilingüe limitado a inglés y ruso.
- No se ha documentado soporte de tool calling o function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- No se ha documentado modo thinking, visión, audio ni otras capacidades especiales.
- No se dispone de información sobre capacidades matemáticas o de razonamiento formal.

## Casos de uso

- Asistencia en desarrollo con Rust: el modelo está etiquetado explícitamente para código Rust, por lo que puede emplearse para autocompletar, explicar y refactorizar fragmentos de código en este lenguaje dentro de editores o pipelines de revisión.
- Chat conversacional en inglés y ruso: al estar etiquetado como conversacional y soportar ambos idiomas, puede desplegarse como asistente en aplicaciones de atención al cliente para esas comunidades lingüísticas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (4,6-4,8 GB) permiten ejecutar el modelo en GPUs de gama media con 8 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado local sin infraestructura cloud.
- Generación de documentación técnica: el modelo puede redactar y resumir documentación de proyectos de software, especialmente en el ecosistema Rust, a partir de código y comentarios.
- Traducción inglés-ruso en contextos técnicos: dado el soporte bilingüe declarado, puede emplearse para traducción de documentación y mensajes entre ambos idiomas, aunque sin garantías de calidad no verificadas.
- Experimentación e investigación: al ser Apache 2.0 y estar disponible en múltiples cuantizaciones, sirve como base para fine-tuning o para estudios comparativos de eficiencia en inferencia local.
- Integración en herramientas de línea de comandos: mediante llama.cpp se puede embeber el modelo en CLI para tareas de generación de texto y ayuda contextual sin dependencias de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,1 GB de pesos, ~4 GB de VRAM con overhead.
  - Q4_K_S / Q4_K_M: ~4,6-4,8 GB de pesos, ~6 GB de VRAM con overhead.
  - Q5_K_M: ~5,5 GB de pesos, ~7 GB de VRAM.
  - Q6_K: ~6,4 GB de pesos, ~8 GB de VRAM.
  - Q8_0: ~8,2 GB de pesos, ~10 GB de VRAM.
  - f16: ~15,3 GB de pesos, ~17 GB de VRAM.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8_0 se recomienda RTX 4070 Ti Super o superior; para f16 se requiere una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q5 con GPUs de 8-12 GB; Q6 y Q8 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio está etiquetado con `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Temper-2-Sapient (este) | ~7,6B | no disponible | Apache 2.0 | GGUF, safetensors | Base Qwen2, orientado a Rust y conversación EN/RU |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, ampliamente benchmarkeado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con buen soporte de tool calling |
| Llama-3.1-8B-Instruct | ~8B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto, licencia no Apache |

La comparación con Qwen2.5-7B-Instruct es la más directa por compartir familia arquitectónica y licencia, pero no se dispone de datos de rendimiento de Temper-2-Sapient que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al estar entrenado presumiblemente con datos web, es probable que herede sesgos presentes en ellos, pero no hay documentación al respecto.
- Riesgo de alucinación no cuantificado: sin benchmarks ni model card detallada del modelo base, no es posible estimar su fiabilidad factual.
- Limitación idiomática: solo se declaran inglés y ruso; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para un equilibrio velocidad/calidad.
- No hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación, lo que puede afectar la calidad frente a cuantizaciones dinámicas de otros repositorios.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia exacta de los datos de entrenamiento del modelo base, conviene revisar la model card original de maylore-ai antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repo (68,1 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Temper-2-Sapient-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Sapient
- Página de descargas del cuantizador: https://hf.tst.eu/model#Temper-2-Sapient-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
