# mradermacher/gemma3-27b-glitterlike-v2-GGUF

## Resumen

`mradermacher/gemma3-27b-glitterlike-v2-GGUF` es una colección de cuantizaciones GGUF del modelo `ToastyPigeon/gemma3-27b-glitterlike-v2`, un merge de modelos construido con mergekit sobre la base de Gemma 3 de Google. El modelo original no ha sido entrenado desde cero: se trata de una fusión de pesos que hereda la arquitectura transformer de Gemma 3 con 27.009.346.304 parámetros totales (aproximadamente 27B), orientada a uso conversacional en inglés.

El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y ofrece cuantizaciones estáticas en formato GGUF desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB), además de los ficheros mmproj necesarios para el procesamiento multimodal (visión). Existe también una variante con cuantización ponderada/imatrix en un repositorio separado.

Su relevancia es práctica: permite ejecutar un modelo de 27B en hardware de consumo mediante llama.cpp u Ollama, con la ventaja de que el formato GGUF facilita el despliegue local. No obstante, se trata de un merge de la comunidad sin model card técnica detallada, sin benchmarks publicados y sin licencia declarada en el repositorio, lo que limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, merge de pesos con mergekit) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |
| Modelo base | ToastyPigeon/gemma3-27b-glitterlike-v2 |
| Herramienta de fusión | mergekit |
| Tamaño del repo | 188,1 GB |
| Descargas | 91 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de pesos generado con mergekit a partir de la familia Gemma 3, que emplea una arquitectura transformer decoder-only con atención multi-cabeza y soporte multimodal (los ficheros mmproj del repositorio confirman la presencia de una torre de visión). Al tratarse de una fusión de pesos y no de un entrenamiento desde cero, no hay información pública sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

No se dispone de detalles sobre la receta de merge (tipo de fusión, pesos por capa, modelo o modelos donantes) más allá de la etiqueta `mergekit` y `merge`. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La cuantización la realiza mradermacher con las herramientas estándar de llama.cpp, generando quants estáticos; la variante imatrix se publica por separado.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base Gemma 3.
- Procesamiento multimodal de imágenes mediante los ficheros mmproj incluidos (Q8_0 y f16).
- Razonamiento general y respuesta a instrucciones, condicionado por el comportamiento del merge.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo con infraestructura tipo TGI o similares.
- Capacidades de tool calling y agentes: no documentadas en la información disponible.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés: con la cuantización Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB y permite conversaciones multi-turno sin depender de APIs externas.
- Prototipado de aplicaciones multimodales: los ficheros mmproj permiten procesar imágenes junto con texto en llama.cpp, útil para experimentar con descripción de imágenes o extracción de información visual.
- Evaluación de merges de la comunidad: investigadores que estudian el efecto de las fusiones de pesos pueden comparar este modelo con su base Gemma 3 original usando el mismo pipeline de inferencia.
- Inferencia en CPU o hardware modesto: las cuantizaciones Q2_K (10,6 GB) y Q3_K (12-14 GB) permiten ejecutar el modelo en equipos sin GPU dedicada de gama alta, con la pérdida de calidad asociada.
- Entornos de investigación con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para procesar datos sensibles sin salida a servicios externos.
- Base para cuantizaciones o fine-tunes posteriores: el formato GGUF y la disponibilidad de múltiples niveles de cuantización facilitan servir como punto de partida para experimentos de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~10,6 GB; Q3_K_S ~12,3 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Añadir ~0,7-1,0 GB si se usa el mmproj multimodal.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M con margen; A100 40 GB o H100 para Q8_0 y contextos largos; GPU de 16 GB solo para cuantizaciones Q3.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB únicamente con Q3_K o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con endpoints según el tag `endpoints_compatible`. vLLM y TGI no consumen GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-27b-glitterlike-v2 (este) | ~27B | no disponible | no disponible | GGUF | Merge de comunidad, solo inglés |
| Gemma 3 27B (Google) | ~27B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF (comunidad) | Modelo oficial con model card y benchmarks |
| gemma3-27b-glitterlike-v2-i1-GGUF | ~27B | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantización ponderada, mayor calidad por tamaño |

La comparación principal es con el Gemma 3 original de Google, que ofrece documentación técnica, benchmarks publicados y una licencia explícita, ventajas de las que carece este merge. Frente a la variante i1-GGUF del mismo autor, la diferencia está en el método de cuantización (estática frente a imatrix), no en el modelo.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: no se puede confirmar si el uso comercial está permitido; hay que remitirse a los términos de Gemma 3 y contactar con el autor del merge.
- Sin benchmarks publicados: no hay evidencia objetiva de que el merge supere o iguale al Gemma 3 original; el comportamiento puede degradarse respecto a la base.
- Idioma limitado al inglés según la metadata; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada: no se puede asumir la ventana de Gemma 3 sin verificación empírica.
- Riesgo de alucinación y sesgos heredados de los modelos donantes, agravado por la falta de evaluación del merge.
- Repositorio con muy poca tracción (91 descargas, 0 likes) y sin pipeline declarado: menor garantía de mantenimiento.
- Los merges de pesos pueden producir comportamientos erráticos en tareas específicas; se recomienda evaluar antes de usar en producción.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para uso serio, usar Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma3-27b-glitterlike-v2-GGUF
- Variante imatrix: https://huggingface.co/mradermacher/gemma3-27b-glitterlike-v2-i1-GGUF
- Variante imatrix (orden alternativo): https://huggingface.co/mradermacher/gemma3-27b-v2-glitterlike-i1-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma3-27b-glitterlike-v2
- Página de descargas del autor: https://hf.tst.eu/model#gemma3-27b-glitterlike-v2-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
