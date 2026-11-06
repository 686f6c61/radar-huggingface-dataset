# LibreYOLO/LibrePRX512-dc-ae-sft-distilled

## Resumen

LibrePRX512-dc-ae-sft-distilled es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX de Photoroom, publicado por el proyecto LibreYOLO bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son byte a byte idénticos a los del repositorio original `Photoroom/prx-512-t2i-dc-ae-sft-distilled` (revisión `03d133506d11f7b3087a9c9509259acd36ede975`), y conserva el mismo layout de pipeline de `diffusers`, por lo que puede cargarse directamente con esa librería o mediante la API `LibreGen` del ecosistema LibreYOLO.

El modelo es un transformer de difusión de 1.3B de parámetros entrenado desde cero por Photoroom, con un encoder de texto T5Gemma de 2B y el autoencoder DC-AE de factor 32x. Su resolución nativa es 512x512 y la variante aquí publicada es un ajuste fino supervisado (SFT) destilado a 8 pasos de muestreo, lo que reduce drásticamente el coste de inferencia frente a un muestreo completo. Es relevante porque ofrece una alternativa abierta y comercialmente permisiva (Apache-2.0 en los pesos PRX) a los modelos de difusión cerrados, con un pipeline ligero y rápido gracias a la destilación.

El repositorio ocupa 16.4 GB e incluye el transformer de difusión, el text encoder T5Gemma en tres shards y el VAE. La licencia del conjunto no es uniforme: los pesos PRX son Apache-2.0, pero el encoder T5Gemma está sujeto a los Términos de Uso de Gemma y a su política de usos prohibidos, y el autoencoder DC-AE proviene de `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers` bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) con encoder de texto T5Gemma 2B y autoencoder DC-AE 32x |
| Parametros totales | 1.3B (transformer de difusion); encoder de texto T5Gemma de 2B adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos PRX); encoder T5Gemma bajo Gemma Terms of Use; DC-AE bajo MIT |
| Formato de pesos | safetensors (layout de pipeline `diffusers`) |

## Arquitectura y entrenamiento

PRX es un transformer de difusión para generación de imágenes entrenado desde cero por Photoroom, con 1.3B de parámetros en el modelo de difusión. El sistema completo combina tres componentes: el transformer de difusión propiamente dicho, un encoder de texto T5Gemma de 2B que codifica los prompts y un autoencoder DC-AE con factor de compresión 32x (procedente de `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers`) que comprime y reconstruye las imágenes en el espacio latente. La resolución nativa de generación es 512x512.

La variante publicada en este repositorio es un ajuste fino supervisado (SFT) destilado a 8 pasos de muestreo, lo que permite generar imágenes con un número muy reducido de evaluaciones del transformer en comparación con el muestreo estándar de decenas de pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Este repositorio es un espejo: no se ha reentrenado, convertido ni recodificado ningún peso, y los ficheros mantienen los hashes SHA-256 del upstream.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) a resolución nativa de 512x512.
- Muestreo destilado a 8 pasos, orientado a inferencia rápida.
- Compatibilidad directa con el pipeline de `diffusers` (mismo layout que el repositorio original).
- Integración con la API `LibreGen` del ecosistema LibreYOLO, tanto en Python como en CLI.
- Codificación de texto mediante T5Gemma 2B, que aporta comprensión semántica de prompts.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; este modelo es exclusivamente generativo de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con solo 8 pasos de muestreo, el modelo permite iterar sobre conceptos visuales en segundos, adecuado para equipos de diseño que necesitan explorar variantes de un prompt antes de pasar a producción.
- Creación de assets para videojuegos y aplicaciones: la resolución nativa de 512x512 y la licencia Apache-2.0 de los pesos PRX facilitan generar sprites, texturas base o iconos que luego se pueden reescalar o retocar.
- Generación de imágenes de relleno en pipelines de datos sintéticos: al ser un modelo abierto y ligero (1.3B en el transformer), puede ejecutarse en lote para aumentar datasets de entrenamiento con imágenes diversas a partir de prompts controlados.
- Integración en herramientas de edición o composición: el pipeline `diffusers` estándar permite cargar el modelo dentro de flujos existentes que ya usan esa librería, sin necesidad de adaptadores adicionales.
- Despliegue en entornos con recursos limitados: el tamaño del transformer (1.3B) y la destilación a 8 pasos reducen el coste computacional frente a modelos de difusión de mayor tamaño, lo que lo hace viable en GPUs de gama media para generación a 512x512.
- Investigación en destilación de modelos de difusión: al ser una variante SFT destilada, sirve como referencia para estudiar el equilibrio entre número de pasos, calidad y coste en modelos texto-a-imagen abiertos.
- Generación de imágenes para pruebas automatizadas de UI: se pueden producir imágenes de ejemplo reproducibles a partir de prompts fijos para validar pipelines de renderizado o de carga de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el transformer de difusión tiene 1.3B de parámetros y el encoder de texto T5Gemma 2B; el repositorio completo ocupa 16.4 GB en safetensors, por lo que se necesita espacio en disco y memoria suficiente para cargar los componentes en el formato en que se distribuyen.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible de forma oficial; el tamaño del transformer (1.3B) sugiere que es viable en GPUs de consumo con VRAM suficiente, pero no se confirma en la documentación.
- Opciones de despliegue: `diffusers` (carga directa del pipeline), API `LibreGen` de `libreyolo` (instalando `libreyolo[gen]`), y CLI `libreyolo generate`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles; la destilación a 8 pasos reduce el número de evaluaciones del transformer frente al muestreo estándar, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Resolucion nativa | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX512-dc-ae-sft-distilled | 1.3B | 512x512 | 8 (destilado) | Apache-2.0 (pesos PRX) + Gemma Terms (encoder) + MIT (DC-AE) | Hugging Face (espejo de Photoroom) |
| Photoroom/prx-512-t2i-dc-ae-sft-distilled (upstream) | 1.3B | 512x512 | 8 (destilado) | Apache-2.0 (pesos PRX) + Gemma Terms (encoder) + MIT (DC-AE) | Hugging Face |
| Otros modelos texto-a-imagen abiertos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo: no incorpora mejoras, correcciones ni cambios respecto al upstream; cualquier problema del modelo original se reproduce aquí.
- Licencia no uniforme: los pesos PRX son Apache-2.0, pero el encoder T5Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones de uso que deben respetarse. El autoencoder DC-AE es MIT. El uso comercial debe revisarse contra las tres licencias.
- Resolución nativa limitada a 512x512; no se documenta soporte para resoluciones superiores.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto del encoder de texto.
- No se han publicado benchmarks ni métricas de calidad (FID, CLIP score, etc.) en la información disponible.
- El pipeline depende de `diffusers` y del ecosistema `libreyolo`; no se documentan formatos alternativos como GGUF o cuantizaciones de bajo bit.
- El aviso de copyright del upstream menciona el VAE de FLUX.1 para cada checkpoint, lo que conviene verificar en el fichero NOTICE antes de un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibrePRX512-dc-ae-sft-distilled
- Repositorio upstream: https://huggingface.co/Photoroom/prx-512-t2i-dc-ae-sft-distilled
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Autoencoder DC-AE: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de LibreYOLO: https://www.libreyolo.com/docs
