# mradermacher/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base RadixArk/DaisyRose-27B, publicada por el usuario mradermacher, conocido en el ecosistema por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 27.320.697.856 parámetros, lo que lo sitúa en la franja de los 27B, un tamaño habitual para despliegues en una o dos GPU de gama alta o en configuraciones de memoria unificada.

La relevancia de esta ficha reside en que el repositorio GGUF permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo imposible con los pesos originales en precisión completa. El autor ofrece un abanico amplio de variantes (Q2_K, Q3_K_S/M/L, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0, IQ4_XS y F16), lo que facilita ajustar el equilibrio entre calidad y consumo de memoria.

No obstante, la información pública disponible es muy limitada: no consta licencia, idiomas soportados, pipeline declarado ni detalles sobre arquitectura o entrenamiento del modelo base. Esta ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RadixArk/DaisyRose-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la informacion proporcionada |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base RadixArk/DaisyRose-27B en los datos proporcionados. El nombre y el recuento de parámetros (27,3B) sugieren un transformer denso de gran tamaño, pero no puede confirmarse si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco consta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización realizado por mradermacher: se trata de cuantizaciones estáticas generadas con la versión 2 del pipeline de cuantización (según los metadatos `quantize_version: 2` y `convert_type: hf`), partiendo de los pesos en formato Hugging Face y produciendo ficheros GGUF en las variantes listadas. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detallan capacidades específicas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecución local mediante llama.cpp: al estar en formato GGUF, puede ejecutarse con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible (no se documentan en la información proporcionada).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: las variantes Q4_K_M o Q5_K_M permiten ejecutar un modelo de 27B en una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) o repartiendo capas entre CPU y GPU, algo útil para prototipado sin depender de la nube.
- Servicio conversacional autoalojado: gracias a la etiqueta `conversational` y a la compatibilidad con endpoints, puede montarse un chatbot interno con llama.cpp o un servidor compatible con la API de OpenAI, manteniendo los datos dentro de la organización.
- Experimentación e investigación: las múltiples cuantizaciones (de Q2_K a F16) permiten estudiar la degradación de calidad frente al tamaño, comparando salidas entre variantes sobre el mismo prompt.
- Evaluación comparativa de modelos de 27B: al disponer de una versión GGUF, puede integrarse en arneses de evaluación que trabajen con llama.cpp para medir perplejidad o rendimiento en tareas concretas.
- Inferencia en hardware con memoria unificada: en equipos tipo Apple Silicon con 32 GB o más, la variante Q4_K_M o Q5_K_S puede cargarse completa en memoria, ofreciendo inferencia local sin GPU dedicada.
- Fine-tuning ligero o destilación sobre salidas: aunque el repositorio es de inferencia, las salidas del modelo pueden usarse para generar datos sintéticos o para evaluar la viabilidad de un modelo de 27B antes de invertir en el modelo completo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de los ficheros GGUF y el recuento de 27,3B parámetros):
  - Q2_K: en torno a 10-11 GB.
  - Q3_K_M: en torno a 13-14 GB.
  - Q4_K_M: en torno a 16-17 GB.
  - Q5_K_M: en torno a 19-20 GB.
  - Q6_K: en torno a 22-23 GB.
  - Q8_0: en torno a 29-30 GB.
  - F16: en torno a 55 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y F16; RTX 3090 (24 GB) para Q4 y Q5 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; las variantes Q6_K y superiores requieren 24 GB o más y pueden necesitar offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI basados en llama.cpp; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se garantiza su uso.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. A modo orientativo, un modelo denso de 27B en Q4_K_M ocupa en torno a 16-17 GB, similar a otros modelos de esa franja, pero sin benchmarks publicados no puede establecerse una comparación de calidad.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base RadixArk/DaisyRose-27B antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Contexto no documentado: no se conoce la ventana de contexto máxima, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no hay información sobre el proceso de alineación que permita estimar su magnitud.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset de entrenamiento.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad en el momento de la consulta.
- Fecha de creación futura (2026-11-21): conviene verificar la vigencia y autenticidad del repositorio antes de confiar en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
