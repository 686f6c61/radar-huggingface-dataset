# mradermacher/gemma-3-JP-EN-Translator-v1-4B-GGUF

## Resumen

El modelo `gemma-3-JP-EN-Translator-v1-4B` es un ajuste fino de Gemma 3 de 4B parámetros especializado en traducción bidireccional entre japonés e inglés. Lo desarrolla mpasila (autor del modelo base en HuggingFace) y lo cuantiza mradermacher en formato GGUF para facilitar su despliegue en hardware de consumo. El modelo parte de la arquitectura Gemma 3 de Google, un transformer decoder-only multimodal con 3.880.263.168 parámetros totales.

El problema que aborda es concreto: la traducción de alta calidad entre japonés e inglés en el ámbito de la ficción y la narrativa. El ajuste fino se ha realizado sobre datasets de ficción paralela japonés-inglés (`mpasila/ParallelFiction-Ja_En-1k-16k-Gemma-3-ShareGPT-Filtered` y `NilanE/ParallelFiction-Ja_En-100k`), lo que lo hace especialmente adecuado para textos literarios, novelas ligeras y contenido narrativo, más que para traducción técnica o jurídica genérica.

Esta ficha describe la versión cuantizada en GGUF publicada por mradermacher, que ofrece múltiples niveles de cuantización (desde Q2_K hasta f16, además de cuantizaciones con imatrix publicadas en un repositorio separado). Es relevante ahora porque permite ejecutar un traductor especializado japonés-inglés en GPUs de consumo e incluso en CPU, con un rango de tamaño de archivo que va de 1,8 GB a 7,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal (mmproj disponible) |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; cuantizaciones imatrix en repositorio aparte |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 de Google, un transformer decoder-only con 3.880.263.168 parámetros. El ajuste fino lo realiza mpasila partiendo de Gemma 3 4B y entrenándolo sobre datasets de ficción paralela japonés-inglés: `mpasila/ParallelFiction-Ja_En-1k-16k-Gemma-3-ShareGPT-Filtered` y `NilanE/ParallelFiction-Ja_En-100k`. El formato ShareGPT del primero indica que el ajuste se estructuró como conversaciones de instrucción con pares de traducción, lo que orienta el modelo hacia la tarea de traducción como diálogo.

La model card del repositorio GGUF no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica la innovación técnica del ajuste más allá del uso de la base Gemma 3. La cuantización la realiza mradermacher con el pipeline estándar de llama.cpp, generando cuantizaciones estáticas (repositorio principal) y cuantizaciones ponderadas/imatrix (repositorio `i1-GGUF`), que suelen ofrecer mejor calidad por bit que las estáticas equivalentes. Se incluyen ficheros `mmproj` (Q8_0 y f16) para conservar la capacidad multimodal del modelo base en el ecosistema GGUF.

## Capacidades

- Traducción bidireccional japonés-inglés, con especial énfasis en textos de ficción y narrativa.
- Generación de texto conversacional en formato instrucción (el dataset de ajuste es ShareGPT).
- Capacidad multimodal heredada de Gemma 3: los ficheros `mmproj` permiten procesar imágenes junto con texto en el ecosistema llama.cpp (la model card no detalla el alcance exacto de esta capacidad en el ajuste fino).
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con `text-generation-inference` y `transformers` según los tags del repositorio.
- Idiomas: inglés y japonés; no se documenta soporte de otros idiomas.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Traducción de ficción y narrativa: el ajuste sobre datasets de ficción paralela lo hace adecuado para traducir novelas ligeras, relatos cortos y diálogos narrativos entre japonés e inglés, manteniendo el tono literario mejor que un modelo generalista del mismo tamaño.
- Localización de videojuegos y visual novels: el modelo puede traducir guiones y diálogos con contexto conversacional, integrándose en pipelines de localización donde se procesan lotes de cadenas de texto.
- Subtitulado y doblaje: traducción de subtítulos japonés-inglés en series y películas, con la ventaja de ejecutarse en hardware de consumo para flujos de trabajo individuales o de pequeños estudios.
- Preprocesamiento de corpus para investigación: traducción automática de datasets japoneses a inglés (o viceversa) para análisis lingüístico, minería de textos o creación de corpus paralelos.
- Asistencia a traductores humanos: generación de borradores de traducción que el traductor revisa y pule, reduciendo el tiempo de primera pasada en textos narrativos.
- Despliegue en local para privacidad: al caber en GPUs de consumo con cuantizaciones Q4, permite traducir documentos sensibles sin enviar datos a servicios en la nube.
- Traducción de contenido de comunidades y foros: conversión de hilos y publicaciones japonesas a inglés para comunidades internacionales, con la ventaja de un modelo pequeño y desplegable en servidores modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,0-2,3 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,4-2,6 GB
  - Q5_K_S / Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Las cuantizaciones Q8_0 y f16 requieren 6-10 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y GPUs similares con cuantizaciones Q4-Q8. También puede ejecutarse en CPU con llama.cpp gracias a los GGUF.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), transformers con el modelo base. Los ficheros GGUF son directamente compatibles con llama.cpp y sus derivados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-JP-EN-Translator-v1-4B (este) | ~3,9B | No disponible | en, ja | Gemma | GGUF, safetensors |
| Gemma 3 4B (base) | ~3,9B | No disponible | Multilingue | Gemma | safetensors, GGUF |
| Modelos de traduccion especializados ja-en de tamano similar | No disponible | No disponible | en, ja | Variable | Variable |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de traducción de este modelo con alternativas. La comparación con Gemma 3 4B base es estructural (mismo tamaño y arquitectura), pero el ajuste fino sobre ficción paralela lo especializa en una tarea concreta. No se identifican en la información proporcionada otros modelos de traducción japonés-inglés del mismo tamaño con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se centra en ficción paralela japonés-inglés; su rendimiento en traducción técnica, jurídica o médica puede degradarse respecto a un modelo generalista.
- Idiomas limitados: solo inglés y japonés; no se documenta soporte de otros idiomas, y el uso con un tercer idioma no está validado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido, especialmente en pasajes ambiguos o con terminología fuera de dominio.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de ficción pueden introducir sesgos de género, culturales o de estilo narrativo.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones (incluida la aceptación de la licencia y ciertas prohibiciones de uso). Es necesario revisar los términos antes de un despliegue comercial.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad de traducción; para producción se recomienda Q4_K_M o superior, y valorar las cuantizaciones imatrix del repositorio `i1-GGUF`.
- Contexto no documentado: la longitud de contexto no se especifica en la información disponible; conviene verificarla en el modelo base antes de usarlo con textos largos.
- Multimodalidad no validada en el ajuste: aunque se incluyen ficheros `mmproj`, no se documenta si la capacidad de visión se preserva tras el ajuste fino de traducción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-JP-EN-Translator-v1-4B-GGUF
- Modelo base (safetensors): https://huggingface.co/mpasila/gemma-3-JP-EN-Translator-v1-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-JP-EN-Translator-v1-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-JP-EN-Translator-v1-4B-GGUF
- Dataset de ajuste 1: https://huggingface.co/datasets/mpasila/ParallelFiction-Ja_En-1k-16k-Gemma-3-ShareGPT-Filtered
- Dataset de ajuste 2: https://huggingface.co/datasets/NilanE/ParallelFiction-Ja_En-100k
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
