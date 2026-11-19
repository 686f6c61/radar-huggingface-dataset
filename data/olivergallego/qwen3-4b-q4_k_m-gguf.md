# olivergallego/Qwen3-4B-Q4_K_M-GGUF

## Resumen
Qwen3-4B-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo Qwen3-4B desarrollado originalmente por el equipo Qwen de Alibaba, publicada por el usuario olivergallego. Se trata de una conversion automatica realizada con la herramienta gguf-my-repo de ggml.ai sobre llama.cpp, sin entrenamiento ni ajuste adicional, orientada a facilitar la inferencia local en CPU y GPU de consumo. El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.022 millones de parametros (4B), disenado para generacion de texto, razonamiento, codigo y conversacion.

La relevancia de esta ficha concreta reside en el formato: al estar cuantizado en Q4_K_M (esquema de cuantizacion de 4 bits tipo K con mezcla de precision), reduce el peso del modelo a unos 2.5 GB en el repositorio, lo que permite ejecutarlo en equipos sin GPU dedicada o con GPUs de gama media-baja mediante llama.cpp, Ollama u otros backends compatibles con GGUF. Es, por tanto, una via practica para desplegar localmente un modelo de la familia Qwen3 en entornos con recursos limitados.

Sin embargo, la informacion disponible en esta ficha es escasa: no se detallan los idiomas soportados, no se aportan resultados de benchmarks para esta cuantizacion concreta y la model card se limita a las instrucciones genericas de uso con llama.cpp. Cualquier dato sobre capacidades, contexto o rendimiento debe contrastarse con la model card del modelo original Qwen/Qwen3-4B, a la que remite el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (referirse a la model card de Qwen/Qwen3-4B) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero qwen3-4b-q4_k_m.gguf), ademas de la libreria declarada transformers |

## Arquitectura y entrenamiento
La arquitectura subyacente corresponde al modelo Qwen3-4B de Alibaba, un transformer denso de aproximadamente 4.000 millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) empleadas por el equipo original; esos datos deben consultarse en la model card de Qwen/Qwen3-4B.

Esta publicacion concreta no introduce entrenamiento nuevo: es una conversion a GGUF del checkpoint original mediante la herramienta gguf-my-repo de ggml.ai, que ejecuta el proceso de cuantizacion de llama.cpp. La unica innovacion tecnica atribuible a esta ficha es, por tanto, la cuantizacion Q4_K_M, que reduce el peso a aproximadamente 2.5 GB manteniendo una mezcla de precision en capas seleccionadas para limitar la perdida de calidad respecto al modelo en precision completa.

## Capacidades
- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-4B.
- Razonamiento y resolucion de problemas de dificultad media, sujeto a la perdida de precision propia de la cuantizacion Q4_K_M.
- Generacion de codigo y asistencia en tareas de programacion, segun las capacidades del modelo base.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; deben consultarse en la model card original.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta cuantizacion; depende del modelo base y del backend de inferencia.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Ejecucion local mediante llama.cpp, con CLI (llama-cli) y servidor (llama-server).

## Casos de uso
- Prototipado local sin GPU: gracias a los aproximadamente 2.5 GB del fichero Q4_K_M, el modelo puede ejecutarse en portatiles con CPU moderna usando llama-cli o llama-server, lo que facilita experimentar con Qwen3-4B sin infraestructura cloud.
- Asistente de codigo en el editor: integrado via llama-server en un IDE o plugin compatible con la API de llama.cpp, el modelo puede ofrecer autocompletado y explicaciones de fragmentos de codigo en local, sin enviar codigo a servicios externos.
- Chatbot de soporte en entornos con requisitos de privacidad: al ejecutarse completamente en local, permite desplegar un asistente conversacional sobre datos sensibles sin salida a internet, usando el servidor HTTP de llama.cpp.
- Educacion y demostraciones: sirve para ilustrar el funcionamiento de modelos LLM y de la cuantizacion GGUF en cursos o talleres, con un coste de hardware minimo.
- Generacion de texto por lotes en estaciones de trabajo: mediante scripts que invocan llama-cli o la API de llama-server, se pueden procesar resumenes, clasificaciones o reescrituras de texto en local para volumenes moderados.
- Base para fine-tuning posterior o para pruebas de integracion: el checkpoint GGUF permite validar pipelines de inferencia (llama.cpp, Ollama) antes de escalar a variantes mayores o a precision completa.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de Q4_K_M frente al modelo original en tareas concretas del equipo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye metricas (MMLU, HumanEval, GSM8K u otras) y los datos del modelo base Qwen3-4B no se han proporcionado en esta ficha; deben consultarse en la model card original de Qwen/Qwen3-4B.

## Requisitos de hardware
- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 2.5 GB, por lo que se requieren del orden de 3 GB de memoria (VRAM o RAM) para cargar el modelo, mas la memoria adicional para el contexto (KV cache), que crece con la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM permite cargar el modelo con contexto amplio; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes. Tambien puede ejecutarse en A100 y H100, aunque el modelo esta sobredimensionado para esas GPUs en terminos de capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM, y tambien en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier backend compatible con GGUF; la libreria declarada es transformers, aunque el formato nativo es GGUF. El autor documenta el uso con brew install llama.cpp y la invocacion directa con --hf-repo y --hf-file.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware, del contexto configurado y de los flags de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olivergallego/Qwen3-4B-Q4_K_M-GGUF | 4.022 millones | no disponible | GGUF | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B | 4.022 millones (segun safetensors del repo derivado) | no disponible | safetensors | apache-2.0 | Hugging Face (modelo original) |
| Otras cuantizaciones GGUF de Qwen3-4B | 4.022 millones | no disponible | GGUF | apache-2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo para esta cuantizacion frente a alternativas de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en punto flotante original; el impacto concreto en tareas de razonamiento y codigo no esta cuantificado en la informacion disponible.
- No se han publicado datos de sesgos para esta cuantizacion ni para el modelo base en la informacion proporcionada; el modelo hereda los sesgos del dataset de entrenamiento original de Qwen3-4B.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; la cuantizacion puede agravarlo en tareas que requieren precision numerica o factual.
- Limitaciones de contexto e idioma: no documentadas en esta ficha; deben verificarse en la model card original antes de usos en produccion.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE enlazado por el autor (correspondiente a Qwen/Qwen3-4B) para confirmar terminos y atribuciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-18; es una publicacion reciente y sin validacion comunitaria, por lo que conviene verificar la integridad del fichero GGUF antes de desplegarlo.
- La model card no documenta tareas especificas, idiomas ni limites de contexto; no debe asumirse ningun comportamiento no verificado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/olivergallego/Qwen3-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Herramienta de conversion gguf-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
- No se han encontrado en la busqueda papers, blogs ni demos adicionales especificos de esta cuantizacion.
