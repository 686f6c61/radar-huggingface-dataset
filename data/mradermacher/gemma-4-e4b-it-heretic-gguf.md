# mradermacher/gemma-4-E4B-it-heretic-GGUF

## Resumen

El modelo `mradermacher/gemma-4-E4B-it-heretic-GGUF` es una cuantización en formato GGUF del modelo `coder3101/gemma-4-E4B-it-heretic`, una versión modificada del modelo Gemma 4 E4B it de Google. Esta variante ha sido sometida a un proceso de "abliteration", una técnica que elimina la alineación de seguridad del modelo original, dando como resultado un modelo "uncensored" o "decensored" que no rechaza peticiones que el modelo base sí rechazaría. El autor de la cuantización es mradermacher, conocido por publicar numerosos modelos GGUF para su uso en entornos locales.

El modelo tiene 7.518.069.290 parámetros (aproximadamente 7.5B), aunque su nombre sugiere "E4B" (posiblemente "Efficient 4B"), lo que podría indicar una arquitectura con parámetros activos inferiores, aunque no se confirma en la información disponible. Se distribuye bajo licencia Apache 2.0 y está pensado para su uso con herramientas como llama.cpp, Ollama o vLLM. La relevancia de este modelo radica en que ofrece una alternativa sin censura para desarrolladores e investigadores que necesitan explorar comportamientos de modelos sin restricciones de seguridad, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B it, modificado) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (posiblemente 4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `coder3101/gemma-4-E4B-it-heretic`. Se sabe que parte del modelo Gemma 4 E4B it de Google, que es un modelo de lenguaje multimodal (acepta entradas de texto e imagen, segun los archivos mmproj incluidos). El proceso de "abliteration" consiste en eliminar las capas o pesos responsables de la alineacion de seguridad, de modo que el modelo deja de rechazar peticiones que el original consideraria peligrosas o inapropiadas. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO. La cuantizacion GGUF ha sido realizada por mradermacher, quien ofrece multiples niveles de cuantizacion para adaptarse a diferentes capacidades de hardware.

## Capacidades

- Generacion de texto libre sin rechazos por contenido sensible o controvertido (efecto de la abliteracion).
- Razonamiento y comprension del lenguaje natural, heredados del modelo Gemma 4 E4B it.
- Soporte multimodal: los archivos mmproj (Q8_0 y f16) permiten procesar imagenes junto con texto, aunque no se especifica el detalle de las capacidades de vision.
- Conversacion multi-turno (etiqueta "conversational").
- Capacidad de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible.
- Multilingue: solo ingles confirmado.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad de modelos: permite estudiar el comportamiento de un modelo sin restricciones de seguridad y compararlo con la version original para entender el impacto de la abliteracion.
- Generacion de contenido creativo sin censura: escritores y creadores pueden explorar narrativas o dialogos que otros modelos rechazarian, por ejemplo en ficcion oscura o humor negro.
- Pruebas de robustez de sistemas de moderacion: se puede usar como modelo adversario para evaluar la capacidad de filtros de contenido en aplicaciones de produccion.
- Desarrollo de chatbots de rol con personalidades extremas: el modelo puede adoptar roles sin limitaciones de contenido, util para juegos de rol o simulaciones.
- Analisis de sesgos y toxicidad: al ser un modelo sin alineacion, es un candidato para estudiar sesgos latentes que la alineacion normalmente oculta.
- Experimentacion local con GGUF: los desarrolladores pueden probar diferentes cuantizaciones (Q4_K_M, Q8_0, etc.) para encontrar el equilibrio entre calidad y rendimiento en sus GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada segun cuantizacion:
  - Q2_K: ~4.5 GB (cabe en GPUs de 6 GB)
  - Q4_K_M: ~5.4 GB (recomendado para GPUs de 8 GB)
  - Q8_0: ~8.1 GB (requiere 10-12 GB de VRAM)
  - f16: ~15.2 GB (requiere 16 GB o mas)
- GPUs recomendadas: RTX 3060 12 GB para Q4_K_M, RTX 4090 o A100 para Q8_0 o f16.
- Es posible ejecutar el modelo en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (hay version publicada en Ollama), vLLM (si se convierte a formato compatible), TGI.
- Latencia y throughput: no disponible, dependera del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-E4B-it-heretic-GGUF | 7.5B | no disponible | Apache 2.0 | GGUF | Abliterated, sin censura |
| mradermacher/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Variante "ultra" del mismo autor |
| coder3101/gemma-4-E4B-it-heretic | 7.5B | no disponible | Apache 2.0 | safetensors | Modelo base, sin cuantizar |
| Google Gemma 4 E4B it (original) | 4.4B (segun gemma4.dev) | no disponible | Gemma license | safetensors | Modelo oficial con alineacion de seguridad |

La comparativa muestra que esta version GGUF es una adaptacion local del modelo abliterated, con la ventaja de poder ejecutarse en hardware modesto. El modelo original de Google tiene menos parametros (4.4B) y mantiene la censura, mientras que esta version tiene 7.5B (posiblemente por la modificacion) y carece de ella.

## Limitaciones y advertencias

- Al estar abliterated, el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin restricciones. Su uso conlleva responsabilidad legal y etica del usuario.
- Riesgo elevado de alucinaciones, especialmente en temas factuales, al no contar con la moderacion del modelo original.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 se indica en la model card, pero el modelo base de Google tiene su propia licencia (Gemma Terms of Use) que puede imponer restricciones adicionales para uso comercial. Se recomienda revisar los terminos de Google antes de desplegar en produccion.
- No se dispone de informacion sobre la longitud de contexto, lo que puede limitar su uso en tareas que requieran ventanas largas.
- El proceso de abliteracion puede degradar la calidad general del modelo en algunas tareas, aunque no hay benchmarks que lo confirmen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/gemma-4-E4B-it-heretic-GGUF
- Modelo base (coder3101): https://huggingface.co/coder3101/gemma-4-E4B-it-heretic
- Variante con quants imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-heretic-i1-GGUF
- Version en Ollama: https://ollama.com/igorls/gemma-4-E4B-it-heretic-GGUF:Q4_K_M
- Informacion sobre Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
