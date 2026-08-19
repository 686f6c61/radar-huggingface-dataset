# dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-4.5bpw

## Resumen

Gemma-4-Gembrain-X-Core-31B-exl3-4.5bpw es un modelo de lenguaje de gran tamaño creado por el usuario dr-housemd mediante un merge de 18 modelos base, todos ellos derivados de Gemma 4 31B (principalmente la versión instruct y variantes especializadas en roleplay, escritura creativa, razonamiento y generación de prompts de imagen). El resultado es un modelo único que combina las fortalezas de sus componentes, orientado a usos conversacionales, creativos y de razonamiento, con un etiquetado explícito de "uncensored" y "nsfw".

El modelo se distribuye en formato EXL3 cuantizado a 4.5 bits por peso (bpw), lo que reduce el tamaño del repositorio a 21,9 GB, adecuado para GPUs de consumo con al menos 24 GB de VRAM. Aunque el nombre indica 31B de parámetros, el archivo safetensors reporta 10.933.407.340 parámetros, una discrepancia que probablemente se debe a la cuantización o a una poda inusual; se recomienda verificar el repositorio original para confirmar la arquitectura exacta.

Al ser un merge sin fine-tuning adicional, no se han publicado benchmarks ni métricas de rendimiento. La licencia Apache 2.0 permite uso comercial y modificación, pero el contenido generado puede ser inapropiado para entornos profesionales debido a su naturaleza no censurada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B) |
| Parametros totales | 31B (nominal); 10.933.407.340 según safetensors del repo (discrepancia por cuantización) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 4 soporta hasta 128k, no confirmado para este merge) |
| Tipos de cuantizacion | EXL3 4.5bpw |
| Idiomas soportados | No disponible (se espera multilingüe por el modelo base, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3 cuantizado) |

## Arquitectura y entrenamiento

El modelo es un merge de 18 modelos base, todos basados en Gemma 4 31B. Los componentes incluyen la versión instruct oficial de Google, así como variantes comunitarias especializadas en roleplay (BirdToast/Gemma-4-31B-glimmer-rp-v0.1, Green-eyedDevil/Monika-31B), escritura creativa (llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith, nbeerbower/Gemma4-Gutenberg-31B), razonamiento (LatitudeGames/Equinox-31B, sophosympatheia/Glistening-Gem-31B-v1.0), generación de prompts de imagen (bgg1996/Melinoe-Gemma4-31B-VL) y versiones sin censura (llmfan46/G4-MeroMero-31B-uncensored-heretic, trohrbaugh/gemma-4-31b-it-heretic-ara). El merge se realizó con la herramienta mergekit, aunque no se especifica el método exacto (SLERP, ties, etc.).

No se ha realizado ningún fine-tuning posterior al merge; las capacidades del modelo son la combinación de las de sus componentes. Esto implica que no hay innovación arquitectónica propia, sino una mezcla de pesos que busca equilibrar las habilidades de los modelos originales. No se dispone de información sobre el dataset de entrenamiento de los modelos base ni sobre técnicas como RLHF o DPO, más allá de las que ya aplicara Google en Gemma 4.

## Capacidades

- Generación de texto y conversación multi-turno, con énfasis en roleplay y diálogos naturales.
- Escritura creativa: cuentos, poesía, guiones y narrativa con estilo literario.
- Razonamiento y resolución de problemas, heredado de modelos como Equinox y Glistening-Gem.
- Generación de prompts para modelos de imagen (a partir de Melinoe-Gemma4-31B-VL).
- Soporte de instrucciones en lenguaje natural (modelo instruct).
- Capacidad de generar contenido explícito o sin censura (etiquetado como "uncensored" y "nsfw").
- No se confirma soporte de tool calling ni function calling, ni capacidades multimodales directas (el componente VL sugiere posible manejo de imágenes, pero no está verificado).

## Casos de uso

- Roleplay y juegos de rol textuales: el modelo combina modelos especializados en roleplay, lo que permite mantener personajes consistentes y tramas complejas en conversaciones largas.
- Escritura creativa asistida: redacción de relatos, novelas o poesía, aprovechando la mezcla de estilos de Gutenberg y Ortenzya.
- Generación de prompts para IA de imagen: dado el componente Melinoe-VL, puede crear descripciones detalladas y artísticas para herramientas como Stable Diffusion o Midjourney.
- Chatbots conversacionales para entretenimiento: su naturaleza no censurada lo hace adecuado para aplicaciones de ocio adulto, aunque con riesgos legales y éticos.
- Prototipado rápido de asistentes de texto: al ser un modelo generalista, puede usarse para pruebas de concepto en entornos de desarrollo, siempre que se controle la salida.
- Experimentación en investigación de merges: como caso de estudio de cómo la combinación de múltiples modelos especializados afecta al rendimiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Al tratarse de un merge sin evaluación documentada, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 31B cuantizado a 4.5bpw, el tamaño del repo es de 21,9 GB. Se necesitan al menos 24 GB de VRAM para cargar el modelo completo en GPU.
- GPUs compatibles: RTX 3090/4090 (24 GB), A100 40GB, H100, o GPUs con más de 24 GB. En tarjetas de 16 GB (como RTX 4080) no cabría sin offloading a CPU.
- Opciones de despliegue: al estar en formato EXL3, es compatible con ExLlama v2/v3 (inferencia rápida en GPU). También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque la conversión puede perder precisión.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la implementación (ExLlama suele ofrecer velocidades de 30-50 tokens/s en GPUs de gama alta, pero no hay datos específicos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Gembrain-X-Core (este) | 31B (nominal) | No disponible | Apache 2.0 | EXL3 4.5bpw | Merge de 18 modelos, sin benchmarks |
| google/gemma-4-31B-it | 31B | 128k (probable) | Gemma License (uso comercial permitido) | safetensors | Modelo base oficial, con benchmarks publicados |
| BirdToast/Gemma-4-31B-glimmer-rp-v0.1 | 31B | No disponible | Apache 2.0 | safetensors | Especializado en roleplay, uno de los componentes del merge |

La comparativa es limitada porque no hay datos de rendimiento del modelo merge. Se espera que su comportamiento sea similar al de Gemma 4 31B it, con mejoras en creatividad y roleplay, pero sin garantías.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un merge sin fine-tuning, puede heredar sesgos de los modelos base y producir alucinaciones con mayor frecuencia que un modelo entrenado específicamente.
- Contenido no censurado: el etiquetado "uncensored" y "nsfw" implica que puede generar contenido explícito, violento o inapropiado. No es apto para aplicaciones comerciales orientadas a menores o entornos profesionales sin moderación.
- Falta de documentación: la model card no incluye instrucciones de uso, parámetros de generación recomendados ni detalles sobre el método de merge.
- Discrepancia en parámetros: el archivo safetensors reporta 10,9B parámetros, mientras que el nombre indica 31B. Esto puede deberse a la cuantización EXL3, pero conviene verificar la integridad del modelo antes de usarlo en producción.
- Compatibilidad: el formato EXL3 es específico de ExLlama; para otros frameworks (Transformers, vLLM) es necesario convertir los pesos, lo que puede introducir errores.
- Sin soporte garantizado: al ser un modelo comunitario con 0 descargas y 0 likes, no hay garantía de mantenimiento ni corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-4.5bpw
- Modelo base oficial: https://huggingface.co/google/gemma-4-31B-it
- Algunos modelos base del merge:
  - https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1
  - https://huggingface.co/LatitudeGames/Equinox-31B
  - https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v1.0
  - https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL
  - https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B
