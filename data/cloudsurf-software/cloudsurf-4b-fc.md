# cloudsurf-software/CloudSurf-4B-FC

## Resumen

CloudSurf-4B-FC es un modelo especializado en function calling y uso de herramientas, desarrollado por CloudSurf Software mediante un fine-tune QLoRA sobre google/gemma-4-E4B-it. El modelo base es un Gemma 4 con 4B de parametros activos y aproximadamente 8.000 millones de parametros totales (7.996.156.490 segun los pesos en safetensors), lo que lo situa en la categoria de modelos pequenos pero con una ventana de contexto de 131K tokens. Su proposito es recibir una lista de herramientas en formato chat de OpenAI y seleccionar la herramienta correcta con los argumentos correctos, manteniendo planes multi-turno y rechazando la llamada cuando ninguna herramienta encaja.

La relevancia del modelo radica en su rendimiento declarado en BFCL V4 FULL: una media de tres semillas de 55,73 frente a 34,81 del modelo base sin fine-tune en el mismo equipo, por encima del liston publicado para modelos pequenos (51,40 de Nanbeige4-3B) y de gpt-oss-20b (49,09). El autor publica los ficheros de resultados en bruto, las tres semillas y un analisis de contaminacion, ademas de una comparacion "justa" con el base tras eliminar un artefacto de decodificacion (54,91 frente a 39,40).

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors en BF16 fusionado y adaptadores LoRA separados por semilla, y con ficheros GGUF oficiales en un repositorio aparte. La model card advierte de que esta especializado en su plantilla de servicio concreta y de que la sensibilidad al formato se degrada respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B), fine-tune QLoRA sobre google/gemma-4-E4B-it |
| Parametros totales | 7.996.156.490 (aproximadamente 8,0B) |
| Parametros activos | 4B (modelo base Gemma-4 E4B) |
| Longitud de contexto | 131K tokens (131.072) |
| Tipos de cuantizacion | BF16 (checkpoint fusionado); GGUF oficial disponible en repositorio separado (niveles no detallados) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado en `merged/`); adaptadores LoRA en `adapters/seed-{42,7,11}/` (111M parametros cada uno); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer decoder-only con 4B de parametros activos y cerca de 8,0B totales. El fine-tune se realizo con QLoRA en cuantizacion nf4, rango LoRA 8, alpha 16, aplicado sobre las 7 proyecciones lineales, con tasa de aprendizaje 5e-5 y 686 pasos, lo que equivale a aproximadamente 0,16 epocas sobre 34.926 ejemplos por turno de asistente. La perdida se calcula unicamente sobre los tokens del asistente.

El conjunto de datos de entrenamiento es una mezcla propia de 2.747 conversaciones de function calling: trayectorias de herramientas generadas por un profesor gpt-oss-120b y verificadas contra el estado del entorno que declaraban, conversaciones de disciplina de memoria y ejemplos de rechazo para casos en los que ninguna herramienta encaja. El razonamiento del profesor se conserva en el canal de pensamiento. La innovacion tecnica clave, segun el autor, es el formato de entrenamiento: un ejemplo por turno de asistente, con el historial renderizado byte a byte igual que lo hace el handler de servicio y cada span supervisado terminado con el token de parada de servicio (`<turn|>`). El dataset de entrenamiento no se ha publicado.

## Capacidades

- Function calling y tool use: recibe una lista de herramientas en formato chat de OpenAI y emite llamadas con los argumentos correctos.
- Planificacion multi-turno: mantiene un plan a lo largo de la conversacion (categoria Multi-Turn de BFCL).
- Rechazo selectivo: se niega a llamar a una herramienta cuando ninguna encaja (categoria Irrelevance, 80,63).
- Memoria de entorno: competencia entrenada sobre un espacio de nombres de API de entorno propio (categoria Memory, 41,65).
- Razonamiento en modo thinking: las evaluaciones se realizaron con thinking activado y el canal de pensamiento se conserva en el entrenamiento.
- Generacion de texto conversacional: pipeline declarado text-generation.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Asistentes con herramientas en produccion: el modelo puede conectarse a un catalogo de funciones en formato OpenAI y decidir que funcion invocar y con que parametros, lo que lo hace adecuado para backends de agentes que ya hablan ese protocolo.
- Automatizacion de flujos multi-paso: con 131K tokens de contexto puede mantener el historial completo de una tarea larga y encadenar varias llamadas a herramientas sin perder el plan, como en la categoria Multi-Turn de BFCL.
- Integracion con tau2-bench y entornos de evaluacion de agentes: el repositorio incluye un puente compatible con la API de chat y tools de OpenAI (`serving/fc_tau2_bridge.py`), pensado para harnesses como tau2-bench.
- Enrutamiento de peticiones con rechazo: en un asistente de atencion al cliente, el modelo puede decidir no invocar ninguna herramienta cuando la peticion no corresponde a ninguna capacidad disponible, reduciendo llamadas erroneas.
- Despliegue en hardware modesto: con 8,0B totales y 4B activos, y versiones GGUF oficiales, es candidato para inferencia en una sola GPU de consumo o en CPU con llama.cpp/Ollama, lo que abarata prototipos de agentes.
- Investigacion sobre especializacion de modelos pequenos: las tres semillas, los adaptadores LoRA y los ficheros de resultados en bruto permiten reproducir el fine-tune y estudiar la varianza de evaluacion en BFCL.
- Servicio de herramientas con memoria de entorno: para aplicaciones que exponen una API de memoria propia, el modelo incorpora competencia entrenada en ese tipo de espacio de nombres, aunque no es transferencia zero-shot.

## Benchmarks y rendimiento

BFCL V4 FULL, 22 de 22 categorias, modo prompt, thinking activado, temperatura 0,001:

| Modelo | Overall | Non-Live | Live | Multi-Turn | Web | Memory | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|
| CloudSurf-4B-FC (media de 3 semillas) | 55,73 | 87,23 | 79,82 | 43,46 | 48,00 | 41,65 | 80,63 |
| Gemma-4-E4B-it base (media de 3 ejecuciones) | 34,81 | 84,30 | 73,97 | 19,46 | 7,00 | 16,56 | 84,37 |
| CloudSurf-4B-FC tras eliminar el closer erroneo | 54,91 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma-4-E4B-it base tras eliminar el closer erroneo | 39,40 | no disponible | no disponible | 33,12 | no disponible | no disponible | no disponible |

Las tres semillas (42, 7, 11) obtuvieron 55,53, 54,86 y 56,81, con una dispersion de 1,95; el checkpoint publicado es la semilla 11. Reevaluaciones adicionales del checkpoint publicado dieron 54,39 y 54,91, con una banda medida de 54,39 a 56,81 (media 55,37, desviacion tipica aproximada de 1,05). El autor indica que el ruido por ejecucion en esta clase de modelo es de aproximadamente mas o menos 1 punto. La comprobacion de contaminacion encontro 0 de 255 prompts de evaluacion con coincidencia de 8-gramas con los datos de entrenamiento. La categoria Web es un suelo: cerca del 9 % de las entradas desbordan la ventana de 131K y puntuan 0, con un techo limpio estimado de 50,5. Format Sensitivity, excluida del Overall por el harness, retrocede con un delta maximo de aproximadamente 45 a 81 frente al 10 del base.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, cerca de 16 GB solo para pesos, mas cache KV; en cuantizaciones GGUF de 4-5 bits, el peso se reduce aproximadamente a 4-6 GB, aunque el autor no detalla los niveles publicados.
- GPU recomendadas: para BF16 completo, A100 40 GB, H100 o L40S; para cuantizaciones GGUF, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizacion y en tarjetas de 16 GB con cuantizaciones agresivas y contexto reducido; el contexto de 131K exige cache KV considerable y probablemente varias GPU o cuantizacion de KV.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama con los GGUF oficiales, vLLM y TGI como opciones habituales para el checkpoint safetensors; el repositorio incluye un puente compatible con la API de OpenAI para tau2-bench.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL V4 FULL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CloudSurf-4B-FC | 8,0B totales / 4B activos | 131K | 55,73 (media 3 semillas) | Apache 2.0 | Hugging Face, GGUF oficial |
| google/gemma-4-E4B-it (base) | 8,0B totales / 4B activos | 131K | 34,81 | Gemma (terminos propios) | Hugging Face |
| Nanbeige4-3B | 3B | no disponible | 51,40 (liston de clase publicado) | no disponible | no disponible |
| gpt-oss-20b | 20B (MoE, parametros activos no disponibles) | no disponible | 49,09 (medido en el mismo equipo) | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion al formato de servicio: la sensibilidad al formato se degrada con un delta maximo de aproximadamente 45 a 81 frente a aproximadamente 10 del base; el modelo esta ajustado a su plantilla de servicio y puede fallar con otras.
- La ganancia en la categoria Memory es competencia entrenada sobre un espacio de nombres de API propio, no transferencia zero-shot; el autor lo advierte explicitamente.
- La categoria Web es zero-shot y su puntuacion de 48,00 es un suelo: cerca del 9 % de las entradas desbordan el contexto de 131K y puntuan 0.
- Idioma: solo ingles segun los metadatos; no se declara soporte multilingue.
- Varianza de evaluacion: el autor reconocio que su pre-registro de que la reevaluacion caeria dentro de 0,6 puntos no se cumplio (54,39 y 54,91 frente a 56,81), y sustituyo esa clausula por una banda medida.
- Datos de entrenamiento no publicados: no es posible auditar la composicion del dataset ni reproducir el entrenamiento desde cero, solo el fine-tune con los adaptadores.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; como modelo de 4B activos, la fiabilidad en argumentos complejos de herramientas debe validarse en el dominio propio.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Gemma tiene sus propios terminos que conviene revisar antes de desplegar en produccion.
- El modelo se declara `inference: false` en la model card, por lo que la inferencia debe configurarse manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC
- GGUF oficial: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF
- Resultados BFCL en bruto: https://huggingface.co/datasets/cloudsurf-software/CloudSurf-4B-FC-bfcl-results
- Trayectorias tau2-bench: repositorio de datasets de cloudsurf-software en Hugging Face (URL truncada en la informacion proporcionada)
- Pull request de envio al leaderboard BFCL: https://github.com/ShishirPatil/gorilla/pull/1357
- tau2-bench: https://github.com/sierra-research/tau2-bench
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
