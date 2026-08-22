# mradermacher/Qwen3.8-27B-Heretic-Uncensored-BF16-i1-GGUF

## Resumen

El modelo `Qwen3.8-27B-Heretic-Uncensored-BF16-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16`, preparada por el usuario `mradermacher`. El modelo base es una versión "abliterated" (sin censura) de Qwen3.8-27B, un modelo multimodal de 26.9 mil millones de parámetros que procesa tanto texto como imágenes. La eliminación de censura se realizó mediante la herramienta Heretic, que aplica ablación direccional para eliminar el alineamiento de seguridad sin necesidad de post-entrenamiento adicional.

Este modelo es relevante porque ofrece una alternativa sin restricciones para tareas de roleplay, conversación y generación creativa, manteniendo la arquitectura multimodal de Qwen3.8. Al estar disponible en formato GGUF con múltiples niveles de cuantización, puede ejecutarse en hardware de consumo con recursos limitados, lo que lo hace accesible para desarrolladores e investigadores que necesitan un modelo local sin filtros de contenido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), no disponible detalle adicional |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M (entre otros) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos imatrix) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-Heretic-Uncensored-BF16` es una adaptacion de Qwen3.8-27B, un modelo multimodal de la familia Qwen3 que procesa entradas de texto e imagen. La version "Heretic" se obtuvo aplicando la herramienta [Heretic](https://github.com/p-e-w/heretic), que combina ablacion direccional (abliteration) con un optimizador de parametros basado en TPE (Optuna) para eliminar automaticamente la censura o alineamiento de seguridad del modelo original. Este proceso no requiere post-entrenamiento adicional, solo una modificacion de los pesos.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO en el modelo original. La cuantizacion GGUF fue realizada por `mradermacher` utilizando matrices de importancia (imatrix) para mejorar la calidad de los quants de baja precision. El modelo soporta decodificacion especulativa (speculative decoding) y prediccion multi-token (MTP), segun los tags del repositorio.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de imagen y texto, lo que permite describir imagenes, responder preguntas visuales y mantener dialogos con contexto visual.
- Roleplay y conversacion sin censura: al estar abliterated, no aplica los filtros de seguridad habituales, permitiendo contenido explicito o controvertido en escenarios de rol.
- Decodificacion especulativa y MTP: soporta tecnicas de aceleracion de inferencia mediante prediccion de multiples tokens, reduciendo la latencia en entornos compatibles.
- Multilingue limitado: aunque la ficha indica solo ingles, es probable que herede capacidades multilingues de Qwen3.8, pero no esta confirmado.
- Compatible con herramientas de cuantizacion: al ser GGUF, puede ejecutarse en llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.

## Casos de uso

- Roleplay y escritura creativa: el modelo puede generar dialogos y narrativas sin restricciones de contenido, ideal para juegos de rol, fanfiction o prototipos de personajes virtuales. Su capacidad multimodal permite ademas incorporar descripciones de imagenes como referencia visual.
- Asistentes conversacionales personalizados: al no tener filtros de seguridad, se puede adaptar a dominios especializados donde se requiera un tono directo o temas sensibles, como simulaciones de entrevistas o coaching sin censura.
- Analisis de imagenes en entornos controlados: gracias a su pipeline image-text-to-text, puede describir o interpretar imagenes en aplicaciones de investigacion, siempre que el contenido no infrinja politicas de uso.
- Generacion de datos sinteticos para entrenamiento: su capacidad de producir texto variado y sin restricciones puede utilizarse para crear datasets de entrenamiento o aumentacion de datos en tareas de NLP.
- Prototipado rapido de aplicaciones locales: al estar disponible en GGUF con cuantizaciones desde 7 GB, se puede desplegar en portatiles con GPU de gama media para pruebas de concepto sin depender de APIs externas.
- Investigacion sobre alineamiento y censura: al ser un modelo abliterated, sirve como caso de estudio para analizar los efectos de la ablacion direccional en el comportamiento de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (16,6 GB) se necesitan al menos 16-20 GB de VRAM; para IQ2_M (10,1 GB) bastan 12 GB; para IQ1_S (7,2 GB) se puede ejecutar en GPUs con 8 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4 o superiores; A100/H100 para despliegue en servidor con FP8 o BF16.
- Compatibilidad con consumer GPU: si, las cuantizaciones mas bajas (IQ1, IQ2) caben en GPUs de 8-12 GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y vLLM (para versiones FP8 del modelo base).
- Latencia y throughput: no disponible, depende del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos alternativos de la misma categoria (por ejemplo, otros Qwen3.8-27B abliterated o modelos uncensored de tamano similar). Se recomienda consultar los repositorios de `mradermacher` para ver otras variantes, como `Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF`, que probablemente comparte caracteristicas similares.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo abliterated, puede generar contenido ofensivo, explicito, ilegal o danino. No es apto para aplicaciones publicas sin moderacion humana.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede producir respuestas incorrectas o inventadas, especialmente en temas de actualidad o datos especificos.
- Idioma limitado: la ficha indica solo ingles; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de uso indebido: la ausencia de censura facilita la generacion de desinformacion, discursos de odio o material inapropiado. El usuario es responsable del cumplimiento legal y etico.
- Licencia: Apache 2.0 permite uso comercial, pero no exime de responsabilidades legales sobre el contenido generado.
- Calidad de cuantizacion: las cuantizaciones muy bajas (IQ1, IQ2) degradan significativamente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para tareas serias.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Uncensored-BF16-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Uncensored-BF16-GGUF
- Modelo base (BF16): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Blog sobre Qwen3.8-27B Uncensored GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
