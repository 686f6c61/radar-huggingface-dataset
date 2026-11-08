# oytunistrator/AquaLLM

## Resumen

AquaLLM es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado a responder preguntas sobre acuariofilia: acuarios de agua dulce y salada, cuidado de peces, seleccion de equipamiento, parametros y quimica del agua, plantas acuaticas y enfermedades comunes de los peces. Lo desarrolla el usuario de Hugging Face oytunistrator y se distribuye con la etiqueta de pipeline `question-answering`.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) del checkpoint Qwen2.5-7B-Instruct, aunque el dato de pesos en safetensors del repositorio indica 1.543.714.304 parametros, es decir, aproximadamente 1,5B, lo que no coincide con los 7B del modelo base declarado. Esta discrepancia es relevante para cualquiera que vaya a desplegarlo: el tamano real de los pesos publicados corresponde a un modelo de ~1,5B, no a uno de 7B.

Su relevancia es acotada: se trata de un modelo de nicho, con 111 descargas en Hugging Face y 3 likes en el momento de la consulta, pensado como asistente especializado para aficionados y para tiendas de animales. No hay informacion publicada sobre licencia, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) segun safetensors del repo; el modelo base declarado es Qwen2.5-7B-Instruct |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors y GGUF (formatos presentes en el repo) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |
| Tamano del repo | 41,2 GB |
| Pipeline declarado | question-answering |
| Dataset de entrenamiento | oytunistrator/AquaLLM-Dataset |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar. Segun la model card, se ha realizado un fine-tuning sobre un modelo base (Qwen2.5-7B-Instruct) utilizando un dataset tematico de acuariofilia publicado por el mismo autor (oytunistrator/AquaLLM-Dataset). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la metodologia (SFT, LoRA, QLoRA, DPO) ni hiperparametros.

No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento extendido). El objetivo declarado por el autor es producir respuestas correctas, breves y comprensibles sobre acuariofilia. La discrepancia entre el modelo base declarado (7B) y el recuento real de parametros en safetensors (~1,5B) no se explica en la model card y deberia verificarse antes de cualquier uso en produccion.

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio de la acuariofilia (agua dulce y salada).
- Asesoramiento sobre montaje y mantenimiento de acuarios.
- Recomendaciones sobre plantas acuaticas e iluminacion adecuada.
- Guia sobre filtracion, calefaccion y otros equipos.
- Informacion sobre enfermedades comunes de los peces y sus tratamientos.
- Respuestas sobre parametros y quimica del agua.
- Capacidades multilingues limitadas a turco e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Al derivar de Qwen2.5-7B-Instruct, podria conservar parte de las capacidades generales del modelo base, pero no hay evaluacion publicada que lo confirme.

## Casos de uso

- Asistente para principiantes en acuariofilia: el modelo responde dudas frecuentes sobre ciclado del acuario, eleccion del primer pez y parametros basicos del agua, con respuestas breves y en turco o ingles.
- Atencion al cliente en tiendas de animales: integrado como chatbot de soporte, puede resolver preguntas sobre compatibilidad de especies, equipos y mantenimiento antes de derivar a un humano.
- Consulta rapida para acuaristas experimentados: fuente de referencia para contrastar valores de parametros (pH, dureza, temperatura) o identificar sintomas de enfermedades.
- Soporte en comunidades y foros: moderacion asistida o generacion de respuestas iniciales a hilos de preguntas frecuentes.
- Guia de compra de equipamiento: el modelo puede explicar diferencias entre tipos de filtros, iluminacion o calefactores y recomendar segun el tipo de acuario.
- Base para un sistema RAG especializado: combinado con una base documental de acuariofilia, el modelo podria generar respuestas fundamentadas, aunque requeriria validacion previa de su calidad real.
- Educacion y divulgacion: generacion de fichas o material introductorio sobre especies y cuidados, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,5B parametros, en FP16 requiere aproximadamente 3-4 GB; en cuantizacion de 8 bits, unos 2 GB; en 4 bits, en torno a 1-1,5 GB (estimacion teorica, no verificada con el modelo).
- Si se confirma el tamano de 7B del modelo base, los requisitos subirian a ~14-16 GB en FP16 y ~4-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia bastar para la variante de ~1,5B; para una variante de 7B se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas para la variante de ~1,5B.
- Opciones de despliegue: llama.cpp u Ollama para los pesos GGUF; vLLM o TGI para los safetensors (el repo incluye la etiqueta `text-generation-inference`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AquaLLM | ~1,5B (declara base 7B) | no disponible | no disponible | Acuariofilia, tr/en |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | Proposito general |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | Proposito general |

La comparacion directa con alternativas especializadas en acuariofilia no esta disponible: no se han identificado modelos publicos comparables en la informacion proporcionada. Frente a los modelos base de Qwen, AquaLLM sacrifica generalidad a cambio de especializacion, aunque no hay datos que cuantifiquen esa mejora en el dominio.

## Limitaciones y advertencias

- No hay informacion sobre la licencia: no se puede confirmar si el uso comercial esta permitido.
- Discrepancia entre el modelo base declarado (Qwen2.5-7B-Instruct) y los parametros reales en safetensors (~1,5B); verificar antes de desplegar.
- Riesgo de alucinacion en recomendaciones tecnicas (dosis, tratamientos de enfermedades, parametros quimicos) con posible impacto en la salud de los animales.
- Idiomas limitados a turco e ingles; no se documenta soporte de castellano.
- Longitud de contexto no documentada.
- Dataset de entrenamiento no descrito en detalle: se desconoce su tamano, procedencia y posibles sesgos.
- Sin benchmarks publicados ni evaluacion independiente; las capacidades declaradas no estan verificadas.
- Comunidad muy pequena (111 descargas, 3 likes): soporte y mantenimiento inciertos.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/oytunistrator/AquaLLM
- Dataset: https://huggingface.co/datasets/oytunistrator/AquaLLM-Dataset
- Repositorio GitHub (issues y contribuciones): https://github.com/oytunistrator/AquaLLM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Estadisticas de uso: https://openmodelstats.com/models/oytunistrator/aquallm
- Ficha en free2aitools: https://free2aitools.com/model/oytunistrator/aquallm
