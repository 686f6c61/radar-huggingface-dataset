# mradermacher/Gemma-4-Sphinsikus-Chronist-V2-31B-i1-GGUF

## Resumen

Gemma-4-Sphinsikus-Chronist-V2-31B-i1-GGUF es una versión cuantizada en formato GGUF del modelo base Blazed-Forge/Gemma-4-Sphinsikus-Chronist-V2-31B, un merge creado con mergekit a partir de la familia Gemma 4 de Google. El modelo original está orientado a tareas de razonamiento, chat multimodal, escritura expresiva y roleplay, según la descripción de la comunidad. Esta variante, publicada por mradermacher, ofrece un amplio abanico de cuantizaciones con matriz de importancia (imatrix) para facilitar su despliegue en hardware local, desde GPUs de consumo hasta servidores con mayor capacidad.

Con aproximadamente 30,7 mil millones de parámetros, el modelo se distribuye exclusivamente en formato GGUF, lo que permite su ejecución con llama.cpp, Ollama u otros motores compatibles. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque la información pública no detalla la arquitectura interna ni los datos de entrenamiento, su origen en Gemma 4 y su naturaleza de merge lo convierten en una opción interesante para aplicaciones conversacionales y creativas que requieren un equilibrio entre calidad y eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Gemma 4, presumiblemente transformer denso) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M (todos con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix de 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo base. Se sabe que es un merge creado con mergekit, lo que implica la combinacion de multiples modelos (probablemente fine-tunes de Gemma 4) mediante tecnicas como SLERP o TIES. El modelo original (Blazed-Forge/Gemma-4-Sphinsikus-Chronist-V2-31B) se describe como un fine-tune comunitario para razonamiento, chat multimodal, escritura expresiva y roleplay, lo que sugiere que fue entrenado con datasets especificos para estas tareas, aunque no se han publicado detalles sobre el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO.

La cuantizacion realizada por mradermacher emplea el metodo imatrix (importance matrix), que asigna mayor precision a los pesos mas relevantes para la activacion, mejorando la calidad respecto a cuantizaciones estaticas convencionales. El repositorio incluye un archivo imatrix de 0,1 GB que puede utilizarse para generar cuantizaciones personalizadas.

## Capacidades

- Generacion de texto conversacional y narrativo, con especial enfasis en roleplay y escritura creativa.
- Razonamiento multi-paso y resolucion de problemas, segun la descripcion del modelo base.
- Chat multimodal (vision), aunque los archivos mmproj necesarios para la parte visual se encuentran en el repositorio estatico (no en este repositorio i1).
- Soporte de conversaciones multi-turno con contexto largo (la longitud exacta no esta publicada).
- Capacidades multilingues limitadas al ingles (segun la etiqueta de idioma).
- No se ha confirmado soporte explicito para tool calling o function calling en la informacion disponible.

## Casos de uso

- Roleplay y simulacion de personajes: el modelo esta especificamente afinado para mantener personajes coherentes y dialogos inmersivos, ideal para juegos de rol textuales o asistentes de escritura de ficcion.
- Escritura creativa asistida: puede generar historias, poemas, dialogos o guiones con estilo expresivo, util para autores que buscan inspiracion o borradores iniciales.
- Asistente conversacional general: su capacidad de razonamiento y su naturaleza conversacional lo hacen adecuado para chatbots de atencion al cliente o asistentes personales en ingles, desplegados localmente para garantizar privacidad.
- Generacion de contenido educativo: puede explicar conceptos complejos, redactar resumenes o crear ejercicios practicos, aprovechando su capacidad de razonamiento.
- Prototipado rapido de aplicaciones de IA: al estar disponible en multiples cuantizaciones, permite probar diferentes balances de calidad/rendimiento en entornos de desarrollo sin necesidad de infraestructura costosa.
- Analisis de documentos largos (si se confirma la longitud de contexto): podria procesar informes, articulos o transcripciones completas, aunque este dato no esta publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Los archivos van desde 7,3 GB (i1-IQ1_S) hasta 21,9 GB (i1-Q5_K_M). Para una cuantizacion equilibrada como i1-Q4_K_M (18,8 GB), se necesitan al menos 20 GB de VRAM libres.
- GPUs recomendadas: para cuantizaciones Q4 o superiores, una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Para cuantizaciones mas agresivas (IQ2 o IQ3), una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden ser suficientes.
- Compatibilidad con GPU de consumo: si, las cuantizaciones mas pequenas (IQ1, IQ2) caben en GPUs de 8-10 GB, aunque con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantizacion y la longitud de contexto. Como referencia, un modelo de 31B en Q4_K_M en una RTX 4090 suele generar entre 10 y 20 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Gemma-4-Sphinsikus-Chronist-V2-31B (base) | 30,7B | No disponible | Apache 2.0 | safetensors | Roleplay, razonamiento, multimodal |
| Gemma-4-Sphinsikus-Chronist-V2-31B-i1-GGUF (este) | 30,7B | No disponible | Apache 2.0 | GGUF | Mismo enfoque, cuantizado |
| Gemma 4 31B (original de Google) | 31B | No disponible | Apache 2.0 | safetensors | Modelo base generalista |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es el formato GGUF y la cuantizacion, que reducen el tamaño y permiten ejecucion local, a costa de una ligera perdida de fidelidad.

## Limitaciones y advertencias

- La cuantizacion, especialmente en niveles bajos (IQ1, IQ2), puede degradar significativamente la calidad de las respuestas y aumentar la probabilidad de alucinaciones.
- El modelo solo soporta ingles; no se recomienda su uso en otros idiomas sin pruebas previas.
- No se ha confirmado la longitud de contexto real; si es limitada, podria afectar a tareas que requieren ventanas largas.
- Al ser un merge, puede presentar comportamientos impredecibles en dominios fuera de su entrenamiento especifico (roleplay, escritura creativa).
- No se dispone de informacion sobre sesgos o riesgos de seguridad; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de soporte ni responsabilidad por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-Sphinsikus-Chronist-V2-31B-i1-GGUF
- Repositorio estatico (con mmproj): https://huggingface.co/mradermacher/Gemma-4-Sphinsikus-Chronist-V2-31B-GGUF
- Modelo base: https://huggingface.co/Blazed-Forge/Gemma-4-Sphinsikus-Chronist-V2-31B
- Pagina de NanoGPT con descripcion del modelo: https://nano-gpt.com/models/text/Gemma-4-31B-Sphinsikus-Chronist
- Informacion sobre Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
