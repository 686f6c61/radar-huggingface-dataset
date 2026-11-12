# OpenLLM-France/Luciole-8B-Instruct-1.1

## Resumen

Luciole-8B-Instruct-1.1 es un modelo de lenguaje causal de 8.075 millones de parametros, desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a traves del programa France 2030. Se trata de la version afinada y alineada del modelo base Luciole-8B-Base, y constituye la primera iteracion de la familia de modelos post-entrenados de OpenLLM-France.

El modelo emplea una arquitectura Nemotron-H (tag `nemotron_h` en Hugging Face), con pesos en formato safetensors y licencia Apache 2.0. Su entrenamiento se realizo en Jean Zay en tres fases: un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento, un segundo SFT sin dichas trazas y una fase final de alineacion de preferencias mediante Direct Preference Optimization (DPO). Los datos de entrenamiento cubren matematicas, ciencia, codigo, conversacion general, RAG y traduccion.

Su relevancia actual radica en ser una alternativa abierta y comercialmente permisiva (Apache 2.0) para el ecosistema francofono, aunque el post-entrenamiento se realizo casi integramente sobre datos en ingles, lo que limita su rendimiento en frances pese a las capacidades multilingues del modelo base. El contexto de entrenamiento es de 16.384 tokens, inferior a los 131.000 tokens del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`, requiere `custom_code`) |
| Parametros totales | 8.075.686.912 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (entrenamiento); el modelo base soporta 131.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor documenta despliegue con ollama y vLLM) |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 16,2 GB) |

## Arquitectura y entrenamiento

Luciole-8B-Instruct-1.1 se basa en Luciole-8B-Base, un modelo de lenguaje causal multilingue de codigo abierto con arquitectura Nemotron-H. El modelo se distribuye con `custom_code`, lo que implica que requiere cargar codigo personalizado del repositorio para su ejecucion en transformers. El tamano del repositorio (16,2 GB) es coherente con pesos en precision de 16 bits para 8.075 millones de parametros.

El post-entrenamiento se estructuro en tres fases ejecutadas en el supercomputador Jean Zay: (i) SFT sobre datos de instrucciones con trazas de pensamiento, (ii) SFT sobre datos de instrucciones sin trazas de pensamiento y (iii) alineacion de preferencias mediante DPO. El dataset utilizado es OpenLLM-France/Luciole-PostTraining-Dataset-1.1, que cubre matematicas, ciencia, codigo, conversacion general, RAG y traduccion. La plantilla de chat esta inspirada en Qwen3-1.7B e incluye un system prompt por defecto que identifica al asistente como "Luciole, trained by LINAGORA and OpenLLM France". El entrenamiento se realizo sobre secuencias de 16.384 tokens, lo que reduce la ventana de contexto efectiva respecto al modelo base. El informe tecnico esta anunciado como "coming soon".

## Capacidades

- Generacion de texto conversacional multi-turno en frances e ingles.
- Seguimiento de instrucciones, foco principal del post-entrenamiento.
- Razonamiento con trazas de pensamiento (thinking traces) en la primera fase de SFT.
- Capacidades basicas de matematicas, ciencia y codigo, aunque el autor advierte que se requeriria entrenamiento adicional para tareas especificas de generacion de codigo o resolucion de problemas matematicos.
- Traduccion, segun la composicion del dataset de post-entrenamiento.
- Soporte para pipelines de RAG (recomendado explicitamente por el autor para compensar la limitada memorizacion del modelo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Atencion al cliente en frances: el modelo puede gestionar conversaciones multi-turno con una ventana de 16.384 tokens, suficiente para historicos de conversacion extensos, y su licencia Apache 2.0 permite integracion comercial sin restricciones.
- Asistente conversacional con RAG: el autor recomienda explicitamente integrar el modelo en un pipeline de recuperacion aumentada para compensar su limitada capacidad de memorizacion de conocimiento factual, usando el contexto de 16.384 tokens para inyectar documentos recuperados.
- Traduccion frances-ingles: el dataset de post-entrenamiento incluye datos de traduccion, por lo que el modelo puede emplearse en tareas de traduccion entre ambos idiomas en entornos de produccion.
- Generacion de respuestas con razonamiento explicito: la primera fase de SFT con trazas de pensamiento permite usar el modelo en tareas donde se requiere desglosar el razonamiento antes de la respuesta final.
- Prototipado de asistentes en el ecosistema francofono: al ser un modelo abierto con receta de entrenamiento publica (repositorio Luciole-Training), sirve como base para fine-tuning especifico en dominios concretos, tal como recomienda el autor.
- Investigacion en alineacion y post-entrenamiento: la publicacion de pesos, dataset de post-entrenamiento y receta de entrenamiento facilita la reproducibilidad y el estudio de tecnicas SFT + DPO en modelos de 8.000 millones de parametros.
- Despliegue en infraestructura propia: el autor documenta el uso con ollama y vLLM, lo que permite servir el modelo en entornos on-premise con control total de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe tecnico figura como "coming soon" en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (8.075 millones de parametros), en FP16 se requieren aproximadamente 16 GB de VRAM para los pesos, a los que hay que sumar la cache KV; en cuantizaciones de 8 bits o 4 bits el requisito se reduce sustancialmente, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano, un modelo de 8.000 millones de parametros en FP16 no cabe en GPUs consumer de 8-12 GB, pero si podria caber en GPUs de 16-24 GB en funcion de la cuantizacion.
- Opciones de despliegue documentadas: ollama y vLLM. El modelo requiere `custom_code` en transformers, lo que debe tenerse en cuenta al elegir el runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Luciole-8B-Instruct-1.1 | 8.075 M | 16.384 | Apache 2.0 | fr, en | Post-entrenamiento casi integramente en ingles; arquitectura Nemotron-H |
| Luciole-8B-Base | no disponible | 131.000 | Apache 2.0 | fr, en | Modelo base, ~30% de datos en frances; sin alineacion |
| Alternativas de 8B: no disponible en la informacion proporcionada | - | - | - | - | - |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El post-entrenamiento se realizo casi integramente sobre datos en ingles, pese a que el modelo base se entreno con aproximadamente un 30% de datos en frances; se espera un rendimiento inferior en frances respecto a lo que sugiere su posicionamiento francofono. El autor anuncia futuras iteraciones con mayor proporcion de frances.
- Susceptible de alucinacion: el autor advierte explicitamente de que puede producir respuestas falsas.
- Limitacion de memorizacion por tamano: el autor recomienda integrarlo en pipelines de RAG para mejorar la exactitud de las respuestas.
- Contexto reducido: entrenado con secuencias de 16.384 tokens frente a los 131.000 del modelo base, lo que limita tareas que requieran contextos largos.
- Rendimiento limitado en codigo y matematicas: el entrenamiento se centro en seguimiento de instrucciones y se requeriria entrenamiento adicional para estas tareas.
- Es la primera iteracion del post-entrenamiento; el autor recomienda probar exhaustivamente el modelo en los casos de uso objetivo antes de incorporarlo a pipelines industriales.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de las advertencias anteriores sobre calidad y alucinacion.
- Requiere `custom_code` para su carga en transformers, lo que anade complejidad de despliegue y dependencia del codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-Instruct-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- Plantilla de chat de referencia (Qwen3-1.7B): https://huggingface.co/Qwen/Qwen3-1.7B/
- Contacto del proyecto: contact@openllm-france.fr
