# AnirudhSomadas/living-cv-smollm2

## Resumen

Living CV SmolLM2 es un ajuste fino mediante LoRA del modelo `HuggingFaceTB/SmolLM2-360M-Instruct` de Hugging Face, publicado por Anirudh Somadas. Se trata de un modelo de proposito muy especifico: ensenar a un modelo compacto un protocolo de generacion de planes de dibujo, respuestas ancladas a un portafolio y abstencion explicita cuando el contexto verificado no permite establecer un hecho. El modelo forma parte de un experimento de CV en navegador del autor, no de un modelo de proposito general.

La relevancia de esta publicacion es acotada y experimental. Los pesos derivan de un modelo de 360 millones de parametros con licencia Apache-2.0, orientado a ejecucion en dispositivo, y el autor distribuye una version cuantizada en ONNX de aproximadamente 347 MB para su uso con Transformers.js y ONNX Runtime en el navegador. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

No se dispone de informacion sobre arquitectura detallada, composicion del dataset de entrenamiento, idiomas soportados ni licencia propia del adaptador mas alla de la herencia del modelo base. La evaluacion publicada es estrecha y sintetica, y el propio autor advierte que no mide calidad general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct); ajuste mediante LoRA |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (`model_q8.onnx`, ~347 MB); pesos del adaptador en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 heredada del modelo base (ver `LICENSE` y `NOTICE` en el repositorio); licencia propia del adaptador no especificada |
| Formato de pesos | ONNX (runtime), mas configuracion y tokenizer en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only compacto de Hugging Face disenado para aplicaciones en dispositivo. Sobre esa base se aplica un ajuste fino con LoRA orientado a tres comportamientos concretos: generar planes de dibujo en un protocolo compacto, responder preguntas de portafolio ancladas a contexto recuperado y abstenerse de forma segura cuando el contexto verificado no permite confirmar un hecho. El autor indica explicitamente que los hechos del portafolio permanecen en el contexto de recuperacion y no se memorizan en los pesos.

El entrenamiento reportado es un piloto de 0,2 epocas ejecutado en Apple MPS. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni detalles del rango y targets de LoRA. La evaluacion se realizo sobre 151 ejemplos sinteticos de protocolo reservados para validacion, con resultados de 96,0 % de coincidencia exacta, 96,6 % de planes de dibujo validos y 100 % de abstencion segura. El autor subraya que estos resultados no miden la calidad general del modelo.

## Capacidades

- Generacion de texto en el dominio acotado del experimento de CV en navegador.
- Generacion de planes de dibujo siguiendo un protocolo compacto definido por el autor.
- Respuestas de portafolio ancladas a contexto recuperado (grounded), sin memorizacion en pesos.
- Abstencion explicita cuando el contexto verificado no permite establecer un hecho.
- Ejecucion en navegador mediante ONNX Runtime y Transformers.js con el modelo cuantizado.
- Soporte de tool calling, function calling, agentes, vision, audio, modo thinking, matematicas avanzadas y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Curriculum vitae interactivo en navegador: el modelo recibe contexto recuperado con los datos del portafolio y responde preguntas del visitante, absteniendose cuando el dato no esta en el contexto. Es adecuado por su tamano reducido y su distribucion en ONNX para ejecucion local.
- Generacion de diagramas o esquemas a partir de instrucciones: el protocolo de planes de dibujo permite que la interfaz interprete comandos estructurados y los renderice, con validacion adicional en el navegador.
- Demostraciones de IA en dispositivo sin backend: al ejecutarse con Transformers.js y ONNX Runtime, permite desplegar una demo estatica sin servidor de inferencia.
- Prototipado de patrones de abstencion: util como referencia para experimentar con respuestas seguras cuando falta evidencia verificable en el contexto.
- Educacion y divulgacion: ejemplo didactico de ajuste LoRA sobre un modelo de 360M y de cuantizacion a int8 para despliegue web.
- Evaluacion de pipelines RAG ligeros: el modelo sirve para probar recuperacion y anclaje de hechos en un entorno de recursos muy limitados.
- Integracion en aplicaciones web de bajo coste: el modelo cuantizado de ~347 MB puede servirse desde un CDN y ejecutarse en el cliente, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Coincidencia exacta | 96,0 % | 151 ejemplos sinteticos de protocolo (held-out) |
| Planes de dibujo validos | 96,6 % | 151 ejemplos sinteticos de protocolo (held-out) |
| Abstencion segura | 100 % | 151 ejemplos sinteticos de protocolo (held-out) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que las cifras anteriores corresponden a un piloto de 0,2 epocas en Apple MPS y no miden la calidad general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo base (360M) y la version int8 (~347 MB), la huella de memoria es del orden de cientos de megabytes.
- GPU recomendadas: no disponible; el autor reporta entrenamiento en Apple MPS y despliegue en navegador mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: Transformers.js y ONNX Runtime en navegador; el modelo base puede ejecutarse con otras herramientas, pero no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Living CV SmolLM2 (este modelo) | 360M (base) | no disponible | Apache-2.0 heredada | ONNX en repositorio y release v0.1.0 |
| SmolLM2-360M-Instruct | 360M | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| SmolLM2-1.7B | 1,7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| SmolLM2-135M | 135M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |

La comparativa se limita a la familia SmolLM2, ya que no se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria y dominio.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: disenado para un experimento concreto de CV en navegador, no para uso general.
- Evaluacion limitada: 151 ejemplos sinteticos y un piloto de 0,2 epocas; no hay evidencia de calidad en tareas generales.
- Riesgo de alucinacion: aunque el entrenamiento busca abstencion segura, el autor indica que el navegador debe seguir validando comandos de dibujo y respuestas factuales.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Longitud de contexto: no disponible.
- Restricciones de licencia: la licencia Apache-2.0 del modelo base se hereda, pero no se especifica una licencia propia para el adaptador; conviene revisar `LICENSE` y `NOTICE` antes de uso comercial.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento comunitario conocido.
- Dependencia de contexto recuperado: los hechos del portafolio no estan en los pesos, por lo que el sistema necesita un pipeline de recuperacion fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnirudhSomadas/living-cv-smollm2
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Coleccion SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
