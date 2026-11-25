# kelsey1337/DaisyRose-27B-Heretic-v2-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-GGUF es una versión "abliterada" (sin comportamiento de rechazo) del modelo RadixArk/DaisyRose-27B, publicada por el usuario kelsey1337 en Hugging Face. El proceso de eliminación de rechazos se realizó con la herramienta Heretic 2.1.0 mediante ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre los pesos en BF16, seguida de conversión a GGUF con llama.cpp y cuantización asistida por imatrix. El resultado es un modelo conversacional de aproximadamente 26.900 millones de parámetros, derivado de la familia Qwen (etiquetado como "qwen3.8" en los tags), con licencia Apache 2.0.

El modelo conserva la torre de visión intacta del DaisyRose original (se usa el mmproj estándar), por lo que mantiene capacidades multimodales de imagen. La relevancia de esta publicación radica en que ofrece una variante sin censura en formato GGUF con un amplio abanico de cuantizaciones (desde IQ1_S de 7,7 GB hasta BF16 de 53,8 GB), lo que permite desplegarla en hardware muy diverso, desde GPUs de consumo hasta servidores. El autor documenta de forma transparente el proceso de ablación, incluyendo el log completo de Heretic y las métricas de rechazo y divergencia KL.

La ficha se basa únicamente en la información disponible en la model card y los metadatos de Hugging Face; los datos no publicados (contexto, composición del entrenamiento, benchmarks) se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen, tag "qwen3.8"); incluye torre de visión multimodal |
| Parametros totales | 26.895.998.464 (aprox. 26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); BF16 safetensors en repo separado kelsey1337/DaisyRose-27B-Heretic-v2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de aproximadamente 26,9 mil millones de parámetros, base del modelo RadixArk/DaisyRose-27B, que a su vez se etiqueta como perteneciente a la familia Qwen 3.8. El modelo incluye un componente de visión multimodal cuya torre se mantiene sin modificar respecto al modelo original; para usarla se debe emplear el mmproj estándar de DaisyRose. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal de esta variante es el proceso de abliteración aplicado con Heretic 2.1.0: se ejecutaron 99 trials de Optuna sobre los pesos completos en BF16, usando como función de puntuación una tasa de palabras clave de rechazo recortada (8 marcadores de advertencia eliminados) más la divergencia KL. El trial seleccionado (#91) alcanzó 0/100 rechazos por palabras clave recortadas con una KL de 0,0715, frente a los 98/100 rechazos del modelo base sin modificar. Una verificación manual con la lista completa de palabras clave de Heretic encontró 0 frases de rechazo duras (54 respuestas contenían solo palabras de advertencia y 46 estaban limpias). La cuantización se realizó con imatrix usando el dataset de calibración bartowski calibration_datav3, incluido en el repo.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento y respuesta a instrucciones sin comportamiento de rechazo (abliterado).
- Capacidades de visión: procesamiento de imágenes mediante el mmproj estándar de DaisyRose, con la torre visual intacta.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en infraestructuras de inferencia compatibles con la API de OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración comparando sus respuestas con las del DaisyRose-27B original, ya que el autor documenta las métricas de rechazo y KL del proceso. Es útil en entornos controlados para analizar qué comportamientos se eliminan y con qué coste en fidelidad.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, aprovechando la ausencia de rechazos. Adecuado para autores que necesiten explorar material que los modelos alineados rechazarían.
- Procesamiento multimodal local: análisis de imágenes y descripción de contenido visual usando el mmproj estándar, con cuantizaciones Q4_K_M (16,7 GB) o Q5_K_M (19,3 GB) que caben en GPUs de consumo de 24 GB como la RTX 4090.
- Despliegue en hardware limitado: las cuantizaciones IQ2 e IQ3 (entre 8,9 y 14,7 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o incluso en CPU con llama.cpp, manteniendo un tamaño de 27B que ofrece más capacidad que modelos de 7-8B.
- Experimentación con pipelines de inferencia compatibles: al ser compatible con endpoints, puede integrarse en servidores tipo vLLM (usando el BF16 safetensors del repo v2) o llama.cpp/Ollama (usando GGUF) para pruebas de rendimiento y comparativas.
- Evaluación comparativa de cuantizaciones: el repo incluye 24 variantes de cuantización, lo que permite medir la degradación de calidad frente al tamaño en tareas concretas, útil para elegir el equilibrio adecuado en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de abliteración: 98/100 rechazos en el modelo base frente a 0/100 rechazos por palabras clave recortadas en el trial #91, con una divergencia KL de 0,0715. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~8 GB (IQ1_S, 7,7 GB) hasta ~54 GB (BF16, 53,8 GB); las cuantizaciones intermedias más habituales son Q4_K_M (16,7 GB), Q5_K_M (19,3 GB) y Q8_0 (28,6 GB).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para BF16 y Q8_0; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, A4000) para IQ2 e IQ3.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M/Q5_K_M, y en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o MLX para el BF16 safetensors del repo v2; también es compatible con endpoints según los tags.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2 (este) | ~26,9B | no disponible | Apache 2.0 | GGUF, BF16 safetensors | Abliterado con Heretic 2.1.0; incluye visión |
| RadixArk/DaisyRose-27B (base) | ~26,9B | no disponible | no disponible | no disponible | Modelo original con rechazos (98/100); misma arquitectura |
| kelsey1337/DaisyRose-27B-Heretic-v2 | ~26,9B | no disponible | Apache 2.0 | BF16 safetensors | Misma ablación en formato safetensors para vLLM/MLX/AWQ |
| Otras variantes abliteradas de 27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, lo que también aumenta la disposición del modelo a seguir instrucciones inyectadas a través de contenido no confiable (páginas web, archivos de repositorios, salidas de herramientas). El autor advierte explícitamente de no darle entradas no confiables junto con credenciales activas o acceso a shell sin sandbox.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo abliterado, la ausencia de advertencias puede aumentar la confianza aparente en respuestas incorrectas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base RadixArk/DaisyRose-27B no declara licencia en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- La torre de visión requiere el mmproj estándar de DaisyRose; no se ha validado su comportamiento tras la ablación más allá de la afirmación del autor de que permanece sin cambios.
- El proceso de selección del trial fue asistido por modelos de IA (Claude Opus 5.5 y Gemini 4 Neon) según la model card; la reproducibilidad depende del log incluido en el repo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-GGUF
- Repositorio BF16 safetensors: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
