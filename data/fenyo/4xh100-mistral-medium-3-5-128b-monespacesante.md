# fenyo/4xH100-Mistral-Medium-3.5-128B-MonEspaceSante

## Resumen

`fenyo/4xH100-Mistral-Medium-3.5-128B-MonEspaceSante` es un ajuste fino supervisado del modelo `mistralai/Mistral-Medium-3.5-128B` (127.704.210.176 parametros segun safetensors) orientado a responder preguntas sobre el servicio publico frances « Mon espace santé » sin necesidad de RAG ni de documentos en contexto. El autor, fenyo, ha destilado el contenido de la FAQ oficial (88 pares pregunta/respuesta) directamente en los pesos mediante un LoRA de rango 64 fusionado, manteniendo la cuantizacion FP8 del modelo original.

El modelo resuelve un problema concreto: eliminar la dependencia de un pipeline de recuperacion en produccion para un dominio acotado, reduciendo latencia y complejidad operativa. Segun la model card, el ajuste logra un 82,8 % de respuestas estrictas correctas sobre 704 preguntas congeladas, frente al 5,5 % del modelo base sin entrenamiento y al 81,0 % del modelo base con la FAQ inyectada en contexto. La fidelidad a la FAQ alcanza el 99,0 % y la invencion fuera de perimetro es del 0 %.

Es un modelo de demostracion e investigacion, no un producto sanitario. La licencia es la del modelo base (Mistral Modified MIT), el idioma declarado es unicamente frances y el repositorio incluye tanto los pesos fusionados como el adaptador LoRA en `lora-adapter/`. Su relevancia actual reside en mostrar como la destilacion de contexto sobre un modelo grande puede sustituir a un sistema RAG para dominios factuales cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral 3, segun tag `mistral3`); detalles internos no disponibles |
| Parametros totales | 127.704.210.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos del modelo base); el entrenamiento se realizo con pesos dequantizados a bf16 |
| Idiomas soportados | Frances (`fr`) |
| Licencia | Mistral Modified MIT (`mistral-modified-mit`) |
| Formato de pesos | safetensors (repo de 132,2 GB); adaptador LoRA separado en `lora-adapter/` |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-Medium-3.5-128B`, un transformer de 128B parametros del que no se detallan en la informacion disponible aspectos como numero de capas, dimension oculta, mecanismo de atencion o si emplea mezcla de expertos. El ajuste consiste en un LoRA de rango 64 fusionado en los pesos, que se mantienen en FP8 como en el modelo original. El entrenamiento se ejecuto sobre 4 GPU H100 con el modelo completo repartido entre las cuatro tarjetas, pesos dequantizados a bf16, durante 8 horas y 8 minutos a 396 tokens/s.

El dataset de entrenamiento (`fenyo/4xH100-MonEspaceSante-distillation-contexte`) contiene 48.203 ejemplos generados mediante destilacion de contexto: respuestas de un profesor Gemma 4 31B que tenia la FAQ en contexto, la respuesta oficial para reformulaciones de la pregunta oficial, ejemplos de rechazo y reconocimiento de ignorancia, y preguntas generales. Se entreno durante 1 epoca. El prompt de sistema usado en entrenamiento fue `Tu es l'assistant de Mon espace santé.` con `reasoning_effort="none"`. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en frances centrada en el dominio « Mon espace santé »: responde preguntas sobre el servicio a partir del conocimiento embebido en los pesos.
- Respuesta sin RAG: no requiere recuperacion documental ni inyeccion de contexto para las preguntas cubiertas por la FAQ.
- Reconocimiento de ignorancia: el entrenamiento incluye ejemplos de rechazo y admision de desconocimiento para preguntas fuera de la FAQ.
- Reformulacion de preguntas: entrenado para responder a variantes de las preguntas oficiales.
- Preguntas generales: mantiene capacidad de responder cuestiones generales (96,7 % en cultura general segun la evaluacion del autor).
- Control de invencion: 0 % de invencion fuera de perimetro en el conjunto de 704 preguntas evaluado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de FAQ sanitario en produccion: desplegado con vLLM (`--tensor-parallel-size 2` sobre 2 GPU de 80 GB), responde preguntas sobre « Mon espace santé » sin pipeline RAG, reduciendo latencia y puntos de fallo frente a una arquitectura de recuperacion.
- Sustitucion de RAG en dominios factuales cerrados: para conjuntos de conocimiento pequenos y estables (como una FAQ de 88 pares), la destilacion en pesos elimina la necesidad de base vectorial y de inyectar documentos en cada peticion.
- Atencion al ciudadano sobre tramites digitales: el modelo reformula y responde variantes de preguntas oficiales, util para portales de ayuda administrativa en frances.
- Evaluacion de tecnicas de destilacion de contexto: sirve como referencia reproducible (scripts y journal en el repositorio GitHub del autor) para investigar cuando conviene destilar frente a usar RAG.
- Clasificacion y derivacion con rechazo controlado: gracias a sus ejemplos de rechazo y al 0 % de invencion fuera de perimetro, puede usarse como primera linea que deriva a un profesional o al sitio oficial cuando la pregunta queda fuera de alcance.
- Despliegue con adaptador LoRA intercambiable: usando el modelo base con `--enable-lora --lora-modules mes=<lora-adapter>`, permite servir varias especializaciones de dominio sobre una sola instancia del modelo grande.
- Demo e investigacion sanitaria: prototipo para estudiar la viabilidad de asistentes de dominio sanitario con conocimiento embebido, siempre con supervision humana.

## Benchmarks y rendimiento

Resultados publicados por el autor (sin la FAQ en contexto, juez Qwen3.8-27B):

| Modelo | Estricto | Completitud | Fidelidad a la FAQ | Cultura general | Invencion fuera de perimetro |
|---|---|---|---|---|---|
| Este modelo, 704 preguntas congeladas | 82,8 % | 76,9 % | 99,0 % | 96,7 % | 0 % |
| Mistral 128B con la FAQ en contexto | 81,0 % | 73,7 % | 92,9 % | no disponible | 0 % |
| Mistral 128B sin entrenamiento | 5,5 % | 27,8 % | 0,1 % | 100 % | 4 % |

Sobre 600 preguntas variadas (detalles, trampas, preguntas cruzadas, situaciones): 95,3 % de respuestas fieles a la FAQ. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 132,2 GB en FP8; el servicio con vLLM se documenta con `--tensor-parallel-size 2` sobre 2 GPU de 80 GB (160 GB totales), lo que deja margen para cache KV y overhead.
- GPU recomendadas: H100 de 80 GB (el autor entreno con 4 x H100); para inferencia, 2 x H100 80 GB o 2 x A100 80 GB en tensor parallel.
- GPU de consumo: no cabe en GPU consumer (RTX 4090 de 24 GB, etc.) en FP8; se requeriria cuantizacion adicional no documentada, por lo que no hay datos disponibles.
- Opciones de despliegue: vLLM con tensor parallel 2, o el modelo base con `--enable-lora --lora-modules mes=<lora-adapter>`.
- Latencia y throughput: no se publican datos de inferencia; el unico dato de rendimiento es el del entrenamiento (396 tokens/s sobre 4 x H100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fenyo) | 127,7B | no disponible | Ajuste de dominio sobre Mistral Medium 3.5 | Mistral Modified MIT | Hugging Face, 0 descargas |
| `mistralai/Mistral-Medium-3.5-128B` | 128B | no disponible | Modelo base generalista | Mistral Modified MIT | Hugging Face (modelo base) |
| Mistral 128B + FAQ en contexto (RAG) | 128B | no disponible | Recuperacion en inferencia | Mistral Modified MIT | Configuracion, no modelo publicado |
| Gemma 4 31B (profesor de destilacion) | 31B | no disponible | Generacion de datos de entrenamiento | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoria (asistentes de dominio sanitario destilados) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento congelado: el modelo solo conoce el contenido de la FAQ a la fecha de su recoleccion; no se actualiza y puede quedar desfasado respecto al sitio oficial.
- Riesgo de error: el propio autor advierte que el modelo puede equivocarse y que no sustituye ni al sitio oficial ni a un profesional de salud.
- Uso previsto limitado: es un modelo de demostracion e investigacion, no un producto sanitario ni un asistente clinico.
- Idioma: solo frances declarado; el rendimiento en castellano u otros idiomas no esta documentado.
- Evaluacion con juez automatico: los resultados (82,8 % estricto, 99,0 % de fidelidad) provienen de un juez LLM (Qwen3.8-27B) sobre conjuntos definidos por el autor, no de una evaluacion humana independiente.
- Licencia: Mistral Modified MIT con posibles restricciones de uso comercial; debe revisarse el texto completo de la licencia del modelo base antes de un despliegue productivo.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Alucinacion: aunque la invencion fuera de perimetro medida es del 0 %, el 17,2 % de respuestas no estrictas en el conjunto de 704 preguntas indica margen de error factual dentro del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fenyo/4xH100-Mistral-Medium-3.5-128B-MonEspaceSante
- Modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
- Dataset de destilacion: https://huggingface.co/datasets/fenyo/4xH100-MonEspaceSante-distillation-contexte
- Repositorio con metodologia, scripts y journal: https://github.com/AlexandreFenyo/AI-Experiments-4xH100 (carpeta `exp01-mes-distillation-contexte`)
