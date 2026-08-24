# mradermacher/Qwen3.8-4B-Distill-heretic-GGUF

## Resumen

El modelo Qwen3.8-4B-Distill-heretic-GGUF es una cuantizacion en formato GGUF del modelo base valiolla/Qwen3.8-4B-Distill-heretic, preparada por mradermacher. Se trata de un modelo de 4.200 millones de parametros, destilado de un modelo profesor de la familia Qwen3.8, con un enfoque especifico en razonamiento, function calling y generacion de texto. La caracteristica mas distintiva es que ha sido sometido a un proceso de "decensored" o "abliterated" mediante la herramienta Heretic, que elimina automaticamente los mecanismos de censura y rechazo del modelo.

Este modelo resulta relevante para desarrolladores que buscan un LLM compacto, ejecutable en hardware de consumo, con capacidades de razonamiento y tool calling, y sin las restricciones de contenido tipicas de los modelos comerciales. Al estar cuantizado en GGUF, puede desplegarse facilmente con llama.cpp, Ollama u otros motores compatibles. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base valiolla/Qwen3.8-4B-Distill-heretic es un transformer denso de 4,2 B de parametros, obtenido mediante destilacion de un modelo profesor de la familia Qwen3.8. La destilacion se realizo sobre las trazas de razonamiento paso a paso (chain of thought) generadas por el modelo profesor, lo que permite al modelo estudiante reproducir capacidades de razonamiento con un coste computacional muy inferior. El entrenamiento incluyo una fase de supervisión fina (SFT) orientada a reforzar las capacidades de function calling y razonamiento.

La caracteristica tecnica mas destacable es la aplicacion de la herramienta Heretic, que elimina automaticamente los mecanismos de censura y rechazo del modelo mediante una tecnica de "abliteration". Este proceso no requiere conocimiento interno de la arquitectura del transformer y funciona sobre la mayoria de modelos densos. El resultado es un modelo que no rechaza peticiones por contenido, lo que puede ser util o problematico segun el caso de uso. La cuantizacion GGUF realizada por mradermacher incluye ademas ficheros mmproj para soporte multimodal, aunque no se especifica que tipo de vision o audio soporta.

## Capacidades

- Generacion de texto en ingles con estilo conversacional.
- Razonamiento paso a paso (chain of thought) gracias a la destilacion del modelo profesor.
- Soporte de function calling / tool calling, reforzado mediante SFT.
- Capacidad de seguir instrucciones complejas en conversaciones multi-turno.
- Sin censura de contenido: no rechaza peticiones sobre temas sensibles, violencia, contenido adulto, etc.
- Soporte multimodal parcial mediante ficheros mmproj (vision u otros, no especificado).
- Compatible con motores de inferencia GGUF como llama.cpp, Ollama y otros.

## Casos de uso

- Asistentes conversacionales sin restricciones: el modelo puede mantener conversaciones sobre cualquier tema sin rechazar peticiones, lo que lo hace adecuado para aplicaciones de rol, escritura creativa o simulacion de personajes.
- Agentes con function calling: su soporte de tool calling permite integrarlo en pipelines de automatizacion donde deba invocar APIs, consultar bases de datos o ejecutar acciones externas.
- Generacion de codigo en entornos locales: con 4,2 B de parametros y cuantizacion Q4, cabe en GPUs de consumo y puede usarse para autocompletar o generar fragmentos de codigo en entornos de desarrollo.
- Prototipado rapido de aplicaciones LLM: su tamano reducido y formato GGUF permiten desplegarlo en portatiles o servidores modestos para pruebas de concepto.
- Investigacion sobre alineacion y censura: al ser un modelo abliterated, es util para estudiar los efectos de la eliminacion de mecanismos de rechazo en el comportamiento del modelo.
- Chatbots de atencion al cliente en ingles: su capacidad de razonamiento y function calling permite gestionar consultas multi-turno y derivar a sistemas externos cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,0 GB (cuantizacion Q2_K) y 8,5 GB (f16), segun el tipo de cuantizacion elegido.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 o superiores. Una RTX 3060, RTX 4060 o equivalente es suficiente para Q4_K_M. Para Q8_0 o f16 se recomienda una GPU con 6-10 GB de VRAM.
- Cabe en GPUs de consumo: si, incluso en las gamas de entrada con 4 GB de VRAM si se usa Q2_K o Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. Tambien puede usarse con transformers si se descarga el modelo base en safetensors.
- Latencia y throughput: no disponible, pero al ser un modelo de 4,2 B, se espera una generacion fluida en hardware moderno, incluso en CPU con cuantizaciones bajas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-heretic (base) | 4,2 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1 | 4,2 B (estimado) | no disponible | Apache 2.0 | GGUF | Variante con imatrix y abliterated |
| Qwen3.8-2B-Distill | 2 B | no disponible | Apache 2.0 | safetensors | Version mas pequena de la misma familia |

La comparativa se limita a modelos de la misma familia o con el mismo proceso de destilacion. No se dispone de datos de rendimiento para establecer comparaciones objetivas.

## Limitaciones y advertencias

- Solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- La longitud de contexto no esta especificada, por lo que se recomienda precaucion al trabajar con documentos largos.
- Al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o danino si se le solicita. No es adecuado para aplicaciones publicas sin moderacion adicional.
- El proceso de abliteration puede degradar ligeramente la calidad del modelo en tareas donde el rechazo era parte del comportamiento esperado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede incorporar sesgos heredados del modelo profesor o del proceso de destilacion.
- El soporte multimodal mediante ficheros mmproj no esta documentado; se desconoce que tipo de entrada (vision, audio) soporta realmente.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-GGUF
- Modelo base en HuggingFace: https://huggingface.co/valiolla/Qwen3.8-4B-Distill-heretic
- Herramienta Heretic para eliminacion de censura: https://github.com/p-e-w/heretic
- Repositorio de la familia Qwen3.8 destilada: https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
