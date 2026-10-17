# ji-farthing/DeepSeek-V4-Flash-Uncensored-TextOnly-ik-llama-GGUF

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una cuantización en formato GGUF de un derivado «uncensored» (abliterated) de la familia DeepSeek-V4-Flash. El autor del upload es `ji-farthing`, un tercero que publica el paquete cuantizado; el modelo base declarado es `orcarouter/DeepSeek-V4-Flash-Vision-Uncensored`, del cual esta versión elimina la parte multimodal y conserva únicamente la torre de texto (tags `text-only` y `uncensored`). El resultado es un fichero de 106 GB con 284.334.567.511 parámetros totales declarados en safetensors, arquitectura MoE según los tags y una licencia MIT.

El interés práctico está en dos factores. Primero, permite ejecutar un modelo de escala ~284B en hardware propio mediante `ik_llama.cpp` y cuantizaciones con imatrix, un pipeline pensado precisamente para arquitecturas MoE con expertos descargables a RAM. Segundo, ofrece una variante sin mecanismos de rechazo, algo relevante para investigación en alineación, red teaming y evaluación de seguridad, pero arriesgado para cualquier despliegue de cara al público.

Las limitaciones documentales son importantes: la ficha de HuggingFace no publica longitud de contexto, número de parámetros activos, composición del dataset, proceso de alineamiento ni resultados de benchmarks, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Además, el acceso está restringido (gated). Todo dato no verificado se marca como «no disponible» a lo largo de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según el tag `moe`; detalles de capas, atención y enrutado no disponibles |
| Parámetros totales | 284.334.567.511 (~284,3 B), dato declarado en safetensors |
| Parámetros activos | no disponible (el modelo base es MoE, pero no se publica el ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF generado con `ik_llama.cpp` e imatrix; el repositorio no detalla la lista exacta de niveles publicados (el tamaño total de 106 GB es coherente con cuantizaciones de ~2-3 bits por parámetro o con un subconjunto de ficheros) |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | MIT (declarada en el repositorio derivado; la licencia del modelo base no se especifica en la información disponible) |
| Formato de pesos | GGUF |

Otros metadatos: pipeline `text-generation`, etiquetas `conversational` y `endpoints_compatible`, región `us`, creado el 17 de octubre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información disponible solo confirma que se trata de un transformer con mezcla de expertos (tag `moe`) y que el paquete procede de una cadena de derivaciones: un DeepSeek-V4-Flash original, una versión «Vision-Uncensored» publicada por `orcarouter` y, finalmente, esta conversión a texto únicamente y a GGUF. No se especifican el número de capas, la dimensión oculta, el número de expertos por capa, el mecanismo de atención (completa, lineal o híbrida) ni si hay decodificación especulativa u otras optimizaciones de inferencia.

Tampoco hay datos sobre tokens de entrenamiento, composición del corpus, uso de RLHF/DPO o proceso de abliteración. Por los tags cabe deducir que el modelo base fue modificado para eliminar las direcciones de activación asociadas al rechazo de peticiones (`abliterated`, `uncensored`), pero la metodología concreta (diferencias de activaciones, edición de pesos, fine-tuning posterior) no está documentada. La cuantización sí se describe a nivel de herramienta: `ik_llama.cpp` con matriz de importancia (imatrix), un enfoque habitual para reducir la pérdida de calidad en modelos MoE grandes.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados.
- Razonamiento y generación de código: capacidad esperable por la familia del modelo base, pero no verificada con benchmarks en la información disponible.
- Respuesta sin rechazos ante peticiones que un modelo alineado rechazaría (efecto declarado del proceso de abliteración).
- Uso como modelo de sólo texto: la torre de visión del modelo base se ha eliminado explícitamente, por lo que no procesa imágenes.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue mediante API compatible con el formato de HuggingFace/OpenAI, aunque no se detalla la implementación.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo «thinking» o razonamiento extendido: no disponible (no documentado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en alineación y abliteration: comparar las respuestas de esta variante sin censura con las del modelo base alineado sobre el mismo conjunto de prompts permite medir qué capacidades y qué sesgos se alteran al eliminar las direcciones de rechazo. El formato GGUF facilita ejecutar ambos modelos en la misma máquina con `llama.cpp`.
- Red teaming controlado: generar ataques adversarios, prompts límite y contenido dañino en un entorno aislado para alimentar evaluaciones de seguridad y clasificadores de filtrado. La ausencia de rechazos es una ventaja aquí y un riesgo en cualquier otro contexto.
- Procesamiento por lotes autoalojado: clasificación, extracción de entidades, resumen o reescritura de grandes volúmenes de documentos en inglés y chino dentro de una infraestructura propia, sin coste por token ni salida de datos a terceros. El tamaño de 284B exige, eso sí, un nodo con bastante memoria.
- Generación de datos sintéticos para destilación: usar el modelo como «profesor» para producir corpus en inglés o chino que luego entrenen modelos más pequeños, aprovechando que la licencia MIT del repositorio simplifica la parte del derivado.
- Localización y traducción técnica bilingüe: traducción inglés-chino o chino-inglés de documentación técnica, con la salvedad de que el castellano no figura entre los idiomas declarados y su rendimiento en español no está verificado.
- Asistente conversacional interno con requisito de confidencialidad: despliegue en una intranet para consultas sobre documentación interna sensible, donde la restricción de que los datos no salgan de la organización justifica el coste de hardware. Requiere envolver el modelo con guardarraíles externos, porque el modelo en sí no rechaza peticiones.
- Experimentación con cuantización agresiva: al ser un MoE de gran tamaño en GGUF, sirve para estudiar la degradación de calidad por nivel de cuantización con imatrix y para probar estrategias de offload de expertos a CPU en `ik_llama.cpp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de seguridad, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces encontrados corresponden a homónimos sin relación (la letra «ji», un vídeo musical y entradas de diccionario).

## Requisitos de hardware

Estimaciones calculadas a partir de los 284,3 B de parámetros y del coste típico en bits por parámetro de cada nivel de cuantización GGUF; no son cifras publicadas por el autor. Hay que sumar la caché KV, cuyo tamaño no puede calcularse sin conocer el número de capas, cabezas y dimensión de atención.

- Peso de los ficheros: FP16 ≈ 569 GB; Q8_0 ≈ 302 GB; Q6_K ≈ 233 GB; Q5_K_M ≈ 202 GB; Q4_K_M ≈ 172 GB; Q3_K_M ≈ 139 GB; Q2_K ≈ 105 GB; IQ2_XXS ≈ 73 GB.
- El repositorio completo ocupa 106 GB, lo que sugiere que la o las cuantizaciones publicadas están en el entorno de 2-3 bits por parámetro.
- GPU recomendadas: para Q4_K_M o superiores hacen falta 4×H100 80 GB o 4×A100 80 GB; para Q2/Q3 basta con 2×H100 80 GB o 2×A100 80 GB, siempre con margen para la caché KV.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090. Solo sería viable con offload masivo de expertos a RAM del sistema mediante `ik_llama.cpp`, con un rendimiento muy degradado y requiriendo del orden de 128-256 GB de RAM.
- Despliegue: `ik_llama.cpp` es la ruta natural dada la procedencia del GGUF; `llama.cpp` y Ollama son opciones si soportan la arquitectura y el tamaño, algo no confirmado. vLLM y TGI quedan descartados salvo que existan pesos en safetensors del modelo base, ya que no cargan GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna configuración.

## Comparativa con modelos similares

La información disponible solo permite comparar los eslabones de la propia cadena de derivación. No se documentan alternativas externas de la misma categoría (MoE abliterados de escala similar en GGUF) con datos verificables.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| `ji-farthing/DeepSeek-V4-Flash-Uncensored-TextOnly-ik-llama-GGUF` (este) | 284,3 B totales; activos no disponibles | no disponible | solo texto, GGUF | MIT | acceso restringido (gated) |
| `orcarouter/DeepSeek-V4-Flash-Vision-Uncensored` (base) | no disponible | no disponible | texto + visión, sin censura | no disponible en la información | no verificado |
| DeepSeek-V4-Flash (origen de la cadena) | no disponible | no disponible | presumiblemente texto + visión | no disponible en la información | no verificado |

Frente al modelo base, la diferencia documentada es la eliminación de la torre de visión y la conversión a GGUF con imatrix; el número de parámetros, el contexto y la licencia del base no se publican en esta ficha y no deben darse por supuestos.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente el comportamiento de rechazo. No es apto para aplicaciones de cara al público, menores o entornos regulados sin una capa de moderación externa.
- Riesgo de alucinación: no cuantificado. Un proceso de abliteración puede aumentar la confianza del modelo en afirmaciones no verificadas; no hay evaluaciones publicadas.
- Sesgos: no documentados. El corpus de entrenamiento, su composición y los filtros aplicados son desconocidos, por lo que no puede evaluarse el sesgo de género, étnico o político.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está verificado y probablemente sea inferior; no debe asumirse calidad multilingüe.
- Contexto: longitud desconocida. Planificar cualquier caso de uso con documentos largos exige medirla experimentalmente antes de dimensionar la caché KV.
- Licencia: el repositorio declara MIT, pero al ser un derivado la licencia del modelo base `orcarouter/DeepSeek-V4-Flash-Vision-Uncensored` condiciona el uso comercial. No se especifica en la información disponible y conviene verificarla antes de producción.
- Acceso restringido: requiere aceptar condiciones en HuggingFace. Esto impide la descarga automatizada en CI/CD sin un token con permisos y puede bloquear la reproducibilidad.
- Madurez: 0 descargas y 0 likes. No hay evidencia de validación por parte de la comunidad, ni de que la cuantización funcione correctamente en `llama.cpp` estándar o en otros runtimes. Verificar la integridad y el funcionamiento del GGUF antes de integrarlo.
- Autor tercero: `ji-farthing` es el empaquetador, no el desarrollador del modelo. No hay garantía de mantenimiento, corrección de errores ni soporte.
- Cumplimiento normativo: el uso de modelos sin filtros puede chocar con obligaciones del Reglamento Europeo de IA en materia de transparencia y gestión de riesgos si se despliega en la UE.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ji-farthing/DeepSeek-V4-Flash-Uncensored-TextOnly-ik-llama-GGUF
- Modelo base declarado: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- Proyecto `ik_llama.cpp` (referenciado por el tag `ik_llama.cpp`, usado para la cuantización con imatrix): https://github.com/ikawrakow/ik_llama.cpp
- `llama.cpp`, runtime alternativo para GGUF: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales. La búsqueda web devolvió únicamente resultados homónimos sin relación con el modelo (la letra «ji», un vídeo musical y definiciones de diccionario).
