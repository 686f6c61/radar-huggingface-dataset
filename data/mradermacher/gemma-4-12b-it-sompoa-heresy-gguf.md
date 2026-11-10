# mradermacher/gemma-4-12B-it-SOMPOA-heresy-GGUF

## Resumen

`mradermacher/gemma-4-12B-it-SOMPOA-heresy-GGUF` es una coleccion de cuantizaciones GGUF del modelo `MuXodious/gemma-4-12B-it-SOMPOA-heresy`, un derivado afinado de la familia Gemma 4 de Google con tecnicas de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, decensored, abliterated). El modelo base cuenta con 11.907.350.576 parametros (aproximadamente 12B) y esta pensado para generacion conversacional en ingles. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF para inferencia local.

La relevancia de esta ficha es doble: por un lado documenta un modelo derivado con modificaciones de alineacion (eliminacion de rechazos), y por otro muestra el flujo habitual de cuantizacion estatica (Q2_K a Q8_0) para ejecucion en hardware de consumo mediante llama.cpp y compatibles. El repositorio ocupa 83,7 GB e incluye tanto los pesos cuantizados como los suplementos multimodales `mmproj` en f16 y Q8_0, lo que indica que el modelo base conserva capacidad de vision.

La licencia declarada en el repositorio es Apache 2.0, aunque la model card enlaza a la licencia oficial de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial que conviene verificar antes de desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma 4; transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 (con enlace a la licencia oficial de Gemma 4 de Google, ver advertencias) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `MuXodious/gemma-4-12B-it-SOMPOA-heresy` en la informacion proporcionada. Por el nombre y la familia, se trata de un derivado de Gemma 4 en variante "it" (instruction-tuned) de aproximadamente 12B parametros, sobre el que se han aplicado tecnicas de "abliteration" para reducir los rechazos del modelo alineado. El repositorio incluye suplementos `mmproj`, lo que sugiere que el modelo base mantiene capacidades multimodales (vision) heredadas de la familia original.

El proceso de cuantizacion realizado por mradermacher es de tipo estatico (no imatrix), con `quantize_version: 2` y `output_tensor_quantised: 1`, y conversion desde formato Hugging Face (`convert_type: hf`). Existe una variante complementaria con cuantizaciones ponderadas/imatrix publicada en `mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF`. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles (`conversational` en los tags del repositorio).
- Razonamiento y respuesta a instrucciones, heredado de la variante instruction-tuned del modelo base.
- Capacidad multimodal: la presencia de ficheros `mmproj` (f16 y Q8_0) indica soporte de entrada de imagenes en el modelo base, aunque no se detalla el alcance.
- Comportamiento "decensored"/"abliterated": el modelo ha sido modificado para reducir rechazos y respuestas de evasion, segun los tags `heretic`, `uncensored`, `decensored`, `abliterated`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los metadatos (`language: en`).
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: con cuantizaciones Q4_K_M (7,5 GB) o Q5_K_M (8,6 GB) el modelo puede ejecutarse en GPUs de consumo con 12-16 GB de VRAM mediante llama.cpp u Ollama, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Investigacion sobre alineacion y seguridad: el caracter "abliterated" lo hace util para estudiar como cambia el comportamiento de un modelo al eliminar capas de rechazo, comparando respuestas frente al Gemma 4 original en tareas sensibles controladas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde los rechazos del modelo alineado resultan limitantes, usando Q6_K (9,9 GB) o Q8_0 (12,8 GB) para preservar calidad.
- Despliegue en entornos air-gapped: al distribuirse como GGUF y con licencia permisiva declarada, puede integrarse en sistemas sin conexion externa para tareas de procesamiento de lenguaje en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 10 variantes (Q2_K a Q8_0) mas dos `mmproj`, lo que permite medir la degradacion de perplejidad y calidad conversacional segun el nivel de cuantizacion en un mismo modelo.
- Procesamiento multimodal ligero: cargando el `mmproj-Q8_0` (0,3 GB) junto con una cuantizacion K-quant, se pueden realizar tareas de descripcion de imagenes o VQA en ingles en hardware modesto, siempre que el runtime (llama.cpp con soporte multimodal) lo permita.
- Base para fine-tuning posterior: el modelo original en safetensors (no este repositorio GGUF) puede servir como punto de partida para ajustes especificos de dominio en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB
  - Q3_K_L: ~6,7 GB
  - Q4_K_S: ~7,1 GB
  - Q4_K_M: ~7,5 GB
  - Q5_K_S: ~8,4 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB
  - Q8_0: ~12,8 GB
  - Suplemento multimodal: mmproj-f16 ~0,2 GB; mmproj-Q8_0 ~0,3 GB
- GPU recomendadas: no disponible de forma explicita. Por tamano, una RTX 4090 (24 GB) puede alojar cualquier cuantizacion con contexto amplio; una RTX 4080/4070 Ti Super (16 GB) cubre hasta Q8_0 con margen limitado; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) son suficientes para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en la mayoria de configuraciones modernas con 8 GB o mas usando Q4_K_S o inferior; con 6-8 GB conviene Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA. vLLM y TGI no estan confirmados para este repositorio GGUF en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12B-it-SOMPOA-heresy-GGUF | ~12B | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Derivado "abliterated" en ingles, con vision via mmproj |
| MuXodious/gemma-4-12B-it-SOMPOA-heresy | ~12B | no disponible | no disponible | safetensors | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF | ~12B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas del mismo modelo |
| Gemma 4 12B-it original (Google) | ~12B | no disponible | licencia Gemma 4 | safetensors | Version alineada sin abliteration; referencia de comportamiento |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar rechazos ("abliterated"/"uncensored"); puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es apto para despliegues publicos sin moderacion adicional.
- Riesgo elevado de alucinacion en temas factuales, agravado por la perdida de calidad en cuantizaciones bajas (Q2_K, Q3_K_S) y por el proceso de abliteration, que puede degradar capacidades de razonamiento.
- Idioma limitado a ingles segun los metadatos; el rendimiento en castellano no esta garantizado ni documentado.
- Ambiguedad de licencia: el repositorio declara apache-2.0 pero enlaza a la licencia oficial de Gemma 4 de Google, que impone restricciones de uso (incluida politica de uso aceptable). Verificar antes de cualquier uso comercial.
- La model card no documenta el proceso de abliteration, los datos de entrenamiento ni las capacidades exactas; la evaluacion debe hacerse empiricamente.
- El repositorio ocupa 83,7 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- No se confirma soporte de tool calling ni de agentes; si se requiere, validar con pruebas propias.
- El modelo base no ha sido evaluado en benchmarks publicos en la informacion disponible, por lo que no hay garantias cuantitativas de calidad.
- Al ser un derivado no oficial de Gemma 4, no cuenta con el respaldo ni el soporte de Google.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/gemma-4-12B-it-SOMPOA-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/gemma-4-12B-it-SOMPOA-heresy
- Variante imatrix: https://huggingface.co/mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-12B-it-SOMPOA-heresy-GGUF
- Licencia oficial Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
