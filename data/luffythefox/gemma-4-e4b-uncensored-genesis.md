# LuffyTheFox/Gemma-4-E4B-Uncensored-Genesis

## Resumen

Gemma-4-E4B-Uncensored-Genesis es un modelo de lenguaje multimodal basado en `google/gemma-4-e4b-it`, desarrollado por LuffyTheFox (Alexey Zakharchenko) a partir de un trabajo previo de HauhauCS. Se trata de una versión "uncensored" (sin censura) del modelo original de Google, sometida a un proceso de abliteración para eliminar los rechazos a peticiones consideradas sensibles. El modelo se distribuye exclusivamente en formato GGUF, con cuantizaciones personalizadas K_P que optimizan la preservación de calidad en pesos abliteados.

Con 4 mil millones de parámetros, 42 capas y una ventana de contexto de 131.000 tokens, el modelo mantiene las capacidades multimodales del original: procesa texto, imagen, vídeo y audio. Su arquitectura combina atención de ventana deslizante (512) con atención completa, e incorpora 18 capas con KV compartido para mejorar la eficiencia de memoria. La variante "Aggressive" está diseñada para no rechazar ninguna petición, aunque puede añadir descargos breves.

La relevancia de este modelo radica en su uso para aplicaciones que requieren generación de contenido sin restricciones, como escritura creativa, roleplay o investigación en seguridad de IA. Al estar disponible en GGUF, puede ejecutarse en hardware de consumo con herramientas como llama.cpp o LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion mixta (ventana deslizante 512 + atencion completa), 42 capas, 18 capas con KV compartido |
| Parametros totales | 4B (segun la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, ademas de mmproj f16 para vision/audio |
| Idiomas soportados | Ingles y multilingue (segun etiquetas) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | GGUF (los safetensors originales del modelo base estan disponibles en el repo de Google) |

Nota: el dato de safetensors en HuggingFace muestra 478.087.456 parametros, lo que contradice los 4B declarados en la model card. Es probable que sea un error de la plataforma o que corresponda a otra metrica. Se toma como referencia la model card.

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un transformer multimodal de 4B parametros con 42 capas. Su arquitectura emplea atencion de ventana deslizante de 512 tokens en las capas inferiores y atencion completa en las superiores, junto con 18 capas que comparten claves y valores (KV shared) para reducir el uso de memoria. El proceso de "uncensoring" se realizo mediante abliteracion, una tecnica que modifica los pesos del modelo para eliminar los patrones de rechazo aprendidos durante el entrenamiento con RLHF. La version "Genesis" de LuffyTheFox aplica una mejora adicional sobre el trabajo de HauhauCS, que ya habia logrado 0 rechazos en 465 pruebas. No se han publicado detalles sobre el dataset de entrenamiento adicional ni sobre el proceso exacto de abliteracion.

## Capacidades

- Generacion de texto sin censura: el modelo no rechaza peticiones, incluso las consideradas sensibles o controvertidas.
- Multimodal: procesa texto, imagen, video y audio gracias al proyector multimodal (mmproj) incluido.
- Razonamiento y comprension de contexto largo: ventana de 131.000 tokens.
- Soporte de chat multi-turno con plantilla Jinja (requiere `--jinja` en llama.cpp).
- Capacidades multilingues: aunque el modelo base esta entrenado principalmente en ingles, soporta otros idiomas.
- Tool calling: segun el blog "Run Gemma 4 Locally", Gemma 4 E4B soporta tool calling, aunque no se confirma en la model card.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficcion, poesia o guiones con contenido adulto o controvertido sin rechazos, gracias a su abliteracion.
- Roleplay y juegos de texto: su capacidad de mantener conversaciones largas y coherentes con contexto de 131K lo hace adecuado para mundos de juego persistentes.
- Analisis de documentos extensos: con 131K de contexto puede resumir o extraer informacion de libros tecnicos, informes o articulos largos.
- Asistente de programacion: aunque no esta especializado en codigo, puede generar y depurar codigo en varios lenguajes, y su formato GGUF permite ejecutarlo localmente para evitar filtrar codigo propietario.
- Procesamiento de imagenes y audio: al ser multimodal, puede describir imagenes, transcribir audio o responder preguntas sobre contenido visual, util para accesibilidad o automatizacion.
- Investigacion en seguridad de IA: al ser un modelo sin censura, permite estudiar comportamientos de alineacion y sesgos en modelos de lenguaje.
- Generacion de contenido para marketing o redes sociales: puede producir textos persuasivos sin las restricciones tipicas de otros modelos.
- Traduccion automatica: su capacidad multilingue permite traducir textos entre varios idiomas, aunque con menor calidad que modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: segun el blog "Run Gemma 4 Locally", Gemma 4 E4B cabe en 4 GB de VRAM con cuantizacion baja (Q2_K_P ocupa 4,2 GB). Las cuantizaciones mas altas como Q8_K_P requieren unos 7,6 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q2/Q3, 6 GB para Q4/Q5, 8 GB para Q6/Q8. Ejemplos: GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, etc.
- Despliegue: llama.cpp, LM Studio, Jan, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia: no disponible, pero al ser un modelo de 4B, es relativamente rapido en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Censura | Formato |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-Genesis | 4B | 131K | Gemma | Sin censura (abliterado) | GGUF |
| google/gemma-4-e4b-it (base) | 4B | 131K | Gemma | Con censura | Safetensors |
| Qwen 3.6 abliterated (variante mencionada en blogs) | 35B (A3B) | no disponible | no disponible | Sin censura | GGUF |

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos uncensored. La comparacion con el modelo base muestra que la unica diferencia es la eliminacion de rechazos, manteniendo el resto de caracteristicas.

## Limitaciones y advertencias

- El proceso de abliteracion puede degradar ligeramente la calidad del modelo en algunas tareas.
- Al ser una version "uncensored", puede generar contenido ofensivo, ilegal o danino si se usa mal.
- La licencia Gemma de Google tiene restricciones de uso comercial (requiere aprobacion para empresas con mas de 700 millones de facturacion anual).
- El modelo esta optimizado para ingles; el rendimiento en otros idiomas puede ser inferior.
- Los quants K_P pueden mostrar "?" en LM Studio, aunque funcionan correctamente.
- No se han publicado benchmarks oficiales.
- El numero de parametros reportado en HuggingFace (478M) contradice los 4B declarados en la model card, lo que genera incertidumbre sobre la metrica real.

## Enlaces

- https://huggingface.co/LuffyTheFox/Gemma-4-E4B-Uncensored-Genesis
- https://huggingface.co/LuffyTheFox (perfil del autor)
- https://huggingface.co/LuffyTheFox/Gemma4-12B-QAT-Genesis (otro modelo del autor)
- https://locallyuncensored.com/blog/gemma-4-local-guide.html (guia de Gemma 4 local)
- https://insiderllm.com/guides/best-uncensored-local-llms/ (guia de LLMs sin censura)
- https://local-ai-zone.github.io/models/gemma-4-e4b-it-uncensored.html (pagina de descarga alternativa)
