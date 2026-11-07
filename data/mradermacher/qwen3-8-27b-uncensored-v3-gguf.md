# mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-GGUF es una distribucion de cuantizaciones GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v3, publicada por el usuario mradermacher. El modelo base es un ajuste fino de la familia Qwen3.8 de 27B de parametros (26.895.998.464 parametros reales segun safetensors) orientado a eliminar la censura politica y de contenido, segun indican sus etiquetas (uncensored, political-censorship). Esta distribucion no entrena ni modifica el modelo: unicamente lo convierte a formato GGUF en multiples niveles de cuantizacion para permitir su ejecucion en hardware de consumo.

La relevancia de esta ficha radica en que ofrece el modelo en formatos Q2_K a Q8_0, ademas de los ficheros mmproj (multi-modal supplement), lo que sugiere capacidades de vision. El repositorio ocupa 187,9 GB en total debido a la acumulacion de todas las variantes. La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles.

Conviene senalar que el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y que no se dispone de informacion sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como transformers; familia Qwen3.8) |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas, dimension oculta ni uso de MoE). La etiqueta de la familia es Qwen3.8, pero la model card proporcionada no documenta detalles estructurales. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

El proceso de esta distribucion es exclusivamente de cuantizacion: mradermacher convierte los pesos del modelo base a formato GGUF mediante la herramienta de conversion a HF (convert_type: hf) con quantize_version 2 y output_tensor_quantised 1. La model card indica que las cuantizaciones ponderadas por imatrix no estaban disponibles en el momento de la publicacion, por lo que solo se ofrecen cuantizaciones estaticas. Se incluyen ficheros mmproj (Q8_0 y f16), lo que apunta a un componente multimodal, aunque no se detalla su naturaleza.

## Capacidades

- Generacion de texto conversacional (pipeline etiquetado como conversational).
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada visual en el modelo base, aunque no se detalla su alcance.
- Modelo "uncensored": el ajuste fino del modelo base busca reducir el rechazo ante contenido politico o sensible, segun las etiquetas political-censorship y uncensored.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de discurso politico sin filtros: el ajuste uncensored del modelo base permite procesar y generar analisis sobre temas politicos que otros modelos rechazarian, util para investigacion en ciencias sociales y monitorizacion de medios.
- Investigacion sobre alineacion y censura: util para estudiar el comportamiento de un modelo sin capas de rechazo y comparar sus respuestas con las de la version censurada de la misma familia.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (15,7 GB) y Q4_K_M (16,6 GB) permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama.
- Procesamiento de documentos con imagenes: los ficheros mmproj permiten usar el modelo en tareas que combinan texto e imagen dentro de entornos compatibles con llama.cpp.
- Generacion de contenido creativo sin restricciones tematicas: escritura de ficcion o guiones que aborden temas sensibles sin los rechazos tipicos de modelos alineados.
- Experimentacion local con modelos grandes: la disponibilidad de cuantizaciones desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB) permite ajustar el equilibrio calidad/VRAM segun el hardware disponible.
- Evaluacion comparativa de cuantizaciones: el conjunto completo de variantes facilita estudios sobre la degradacion de calidad por nivel de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: 10,8 GB.
  - Q3_K_S: 12,2 GB; Q3_K_M: 13,4 GB; Q3_K_L: 14,4 GB.
  - Q4_K_S: 15,7 GB; Q4_K_M: 16,6 GB.
  - Q5_K_S: 18,8 GB; Q5_K_M: 19,3 GB.
  - Q6_K: 22,2 GB.
  - Q8_0: 28,7 GB.
  - mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16), adicionales si se usa vision.
- GPUs recomendadas: para Q4_K_M cabe en RTX 4090 (24 GB) y en GPUs de 24 GB en general; Q5 y Q6 requieren 24 GB con margen ajustado; Q8_0 requiere 32 GB o mas (A100 40 GB, H100, o RTX 5090 si dispone de 32 GB). Las cuantizaciones Q2-Q3 pueden caber en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o inferior; en GPUs de 16 GB con Q3_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere uso en endpoints tipo TGI o similares, aunque no se detalla.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3-GGUF (este) | ~27B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, sin imatrix; incluye mmproj |
| mradermacher/Qwen-3.8-27B-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Variante similar del mismo autor, sin datos de parametros en la busqueda |
| mradermacher/Qwen3.8-27B-full-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Variante "full" del mismo autor, sin datos adicionales |

No se dispone de informacion suficiente sobre modelos alternativos de la misma categoria para establecer una comparativa de rendimiento, contexto o calidad.

## Limitaciones y advertencias

- El modelo esta ajustado para eliminar censura, lo que implica un mayor riesgo de generar contenido danino, ofensivo o factualmente incorrecto sin advertencia; no es apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad ni benchmarks que permitan cuantificar la tasa de errores.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar tareas de contexto largo.
- Las cuantizaciones son estaticas y no ponderadas por imatrix, lo que puede implicar mayor perdida de calidad en niveles bajos (Q2_K, Q3_K_S) frente a alternativas imatrix.
- El repositorio ocupa 187,9 GB por acumular todas las variantes; conviene descargar solo el fichero necesario.
- Aunque la licencia es Apache 2.0, el modelo base es un ajuste fino de un modelo Qwen; conviene verificar las condiciones de la licencia original de Qwen3.8 antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes, sin validacion comunitaria; no hay evidencia de calidad mas alla de la model card.
- La fecha de creacion indicada (2026-11-07) es futura respecto a la informacion habitual, lo que puede indicar un error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Variante similar del autor: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Variante "full" del autor: https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-GGUF
