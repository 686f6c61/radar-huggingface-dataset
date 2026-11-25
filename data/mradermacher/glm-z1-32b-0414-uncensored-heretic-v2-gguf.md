# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF es una cuantizacion estatica en formato GGUF del modelo llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2, publicada por mradermacher. El modelo subyacente deriva de la familia GLM-Z1 de Zhipu AI (la nomenclatura "0414" corresponde a la version de abril de 2025), un transformer denso de 32.566.081.536 parametros (aproximadamente 32,6 mil millones) orientado a razonamiento y conversacion. Sobre esa base, llmfan46 aplico tecnicas de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated, ara) para eliminar los mecanismos de rechazo del modelo original.

La relevancia practica de esta ficha es doble. Por un lado, mradermacher ofrece un conjunto completo de cuantizaciones GGUF (de Q2_K a Q8_0, ademas de IQ4_XS) que permiten ejecutar un modelo de 32B en hardware de consumo, algo imposible con los pesos en safetensors (222,9 GB en el repositorio). Por otro, el modelo es un caso de estudio de las variantes "sin censura": conserva la capacidad de razonamiento del GLM-Z1 original pero elimina las negativas a responder, lo que cambia radicalmente el perfil de riesgo en produccion.

La licencia declarada es MIT tanto en el repositorio como en las etiquetas de Hugging Face, y los idiomas soportados son chino (zh) e ingles (en) segun la model card. No se dispone de informacion sobre la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-Z1 de Zhipu AI, segun nomenclatura del modelo base) |
| Parametros totales | 32.566.081.536 (32,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1 aparte |
| Idiomas soportados | zh, en (segun model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |
| Tamano del repositorio | 222,9 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 12,4 GB |
| Cuantizacion mas grande | Q8_0, 34,7 GB |
| Descargas | 674 |
| Likes | 1 |
| Creado | 2026-11-22 |
| Actualizado | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GLM-Z1 (Zhipu AI), sucesora de GLM-4 y orientada a razonamiento. Se trata de un transformer denso de 32,6 mil millones de parametros, sin mezcla de expertos, lo que implica que en inferencia se activan todos los parametros en cada token. La nomenclatura "0414" indica la version de abril de 2025 del checkpoint. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en la informacion proporcionada.

Sobre el checkpoint original, llmfan46 aplico un proceso de "abliteration" (etiquetas heretic, uncensored, decensored, abliterated, ara) que tipicamente consiste en identificar y suprimir las direcciones de activacion asociadas a la negativa a responder, eliminando el comportamiento de rechazo sin reentrenar los pesos por completo. mradermacher, por su parte, ha generado cuantizaciones estaticas en GGUF con la herramienta de cuantizacion de llama.cpp, incluyendo una version con calibracion imatrix en un repositorio separado (sufijo i1). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento de tipo "thinking" heredado de la familia GLM-Z1, orientada a tareas de logica y matematicas (no verificable con benchmarks en esta ficha).
- Generacion de codigo (capacidad esperada de la familia GLM, no documentada explicitamente en la model card).
- Respuestas sin rechazo a peticiones que el modelo original bloquearia, por el proceso de abliteration aplicado.
- Compatibilidad con endpoints (etiqueta endpoints_compatible en Hugging Face).
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) gracias al formato GGUF.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente el efecto de la abliteration comparando sus respuestas con las del GLM-Z1-32B original en conjuntos de prompts de rechazo, util para evaluar la robustez de los mecanismos de seguridad.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (19,8 GB) cabe en una RTX 4090 de 24 GB, lo que permite ejecutar un modelo de 32B con razonamiento en hardware de un solo usuario sin depender de la nube.
- Procesamiento de texto en chino e ingles en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen de la infraestructura, adecuado para analisis de documentos sensibles en estas dos lenguas.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o contenido narrativo donde el modelo original rechazaria escenarios violentos o controversiales, con la advertencia de que la salida requiere revision humana.
- Prototipado de asistentes conversacionales: su formato GGUF y compatibilidad con endpoints permiten integrarlo rapidamente en aplicaciones de chat mediante llama.cpp u Ollama para pruebas de concepto.
- Fine-tuning y experimentacion: al estar bajo licencia MIT, sirve como base para experimentos de ajuste fino o destilacion en entornos academicos, aunque el coste de reentrenar un 32B completo es elevado.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la calidad de razonamiento y en la perplejidad sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos mas overhead de contexto, aproximadamente 1-3 GB adicionales):
  - Q2_K: ~12,4 GB de pesos; ~14-15 GB en ejecucion.
  - Q3_K_M: ~16,0 GB de pesos; ~18 GB en ejecucion.
  - IQ4_XS: ~17,9 GB de pesos; ~20 GB en ejecucion.
  - Q4_K_M: ~19,8 GB de pesos; ~22 GB en ejecucion.
  - Q5_K_M: ~23,2 GB de pesos; ~25-26 GB en ejecucion.
  - Q6_K: ~26,8 GB de pesos; ~29 GB en ejecucion.
  - Q8_0: ~34,7 GB de pesos; ~37 GB en ejecucion.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; configuraciones multi-GPU (2x RTX 4090) para Q8_0.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 Super (16 GB, solo Q2_K o Q3_K_S con contexto reducido) y RTX 4070 Ti Super (16 GB, igualmente limitado). En GPUs de 12 GB no cabe ninguna cuantizacion completa; seria necesario offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion a otros formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa de orden de magnitud, un 32B denso en Q4_K_M sobre una RTX 4090 suele situarse en el rango de 15-25 tokens por segundo, pero este dato no procede de la model card y debe medirse en el hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF (este) | 32,6B denso | no disponible | MIT | GGUF | Variante abliterated; zh/en |
| GLM-Z1-32B-0414 (original, Zhipu AI) | 32,6B denso | no disponible en esta ficha | no disponible | safetensors/GGUF | Modelo base con alineacion intacta |
| llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2 | 32,6B denso | no disponible | MIT | safetensors | Checkpoint del que deriva esta cuantizacion |
| Qwen2.5-32B-Instruct | 32,8B denso | 131.072 tokens | Apache 2.0 | safetensors/GGUF | Alternativa densa de tamano similar, multilingue amplio |
| Gemma-3-27B-it | 27B denso | 131.072 tokens | Gemma Terms | safetensors/GGUF | Alternativa algo menor, con vision |

La comparativa con Qwen2.5-32B-Instruct y Gemma-3-27B-it se ofrece como referencia de categoria por tamano; no se dispone de datos de rendimiento comparativo en la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos del modelo original: puede generar contenido violento, sexual, ilegal o danino sin filtro, lo que exige moderacion externa en cualquier despliegue publico.
- Riesgo elevado de alucinacion en tareas factuales, agravado por la falta de benchmarks publicados que permitan acotar su fiabilidad.
- La abliteration puede degradar capacidades no relacionadas con el rechazo (coherencia, instrucciones complejas); no hay evaluaciones publicadas que cuantifiquen esta perdida.
- Idiomas limitados a chino e ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no documentada: no debe asumirse la ventana del GLM-Z1 original sin verificacion empirica.
- La licencia MIT permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el cumplimiento legal del contenido generado ni sobre los terminos del modelo base de Zhipu AI.
- El repositorio ocupa 222,9 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Modelo con traccion muy baja (674 descargas, 1 like): no hay comunidad que reporte fallos ni validacion independiente de calidad.
- Fecha de creacion registrada como 2026-11-22, posterior a la version 0414 del modelo base; conviene verificar la integridad de los archivos antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF
- Modelo base (checkpoint sin cuantizar): https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
