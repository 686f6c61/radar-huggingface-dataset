# joeyAIDev/zils-lite-body-x11a

## Resumen

zils-lite-body-x11a es un ajuste fino de tipo LoRA fusionado sobre el modelo base joamCriff123/zils-lite-l1117a, publicado por el usuario joeyAIDev en Hugging Face. Se presenta como el "cuerpo de decisión" (decision body) del modelo d3-lite para el pool lite de la "subnet 127" del proyecto Zils. El modelo resuelve, por tanto, una tarea acotada de decisión dentro de una infraestructura concreta (Zils), no un uso generalista de generación de texto.

Arquitectónicamente se etiqueta como qwen3_5, lo que sugiere una arquitectura transformer derivada de la familia Qwen 3.5, con 852.985.920 parámetros totales (unos 853 millones) según los pesos en safetensors. El repositorio ocupa 1,7 GB y se distribuye en un único archivo de pesos. La licencia es Apache-2.0, lo que permite uso comercial con atribución y conservación del aviso de modificación.

Su relevancia es limitada fuera del ecosistema Zils: cuenta con cero descargas y cero "likes" en el momento de la consulta, no declara idiomas soportados ni pipeline, y la model card es extremadamente escueta. Debe evaluarse como un artefacto experimental o interno de un proyecto, no como un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-00001-of-00001.safetensors`), con archivos de configuración, tokenizer y readout del modelo base d3-lite |

## Arquitectura y entrenamiento

El modelo parte de joamCriff123/zils-lite-l1117a en la revisión ec192c7e0a443c04f7cbfe7151b1c910bd5e880f (Apache-2.0). Sobre ese cuerpo inicial se aplicó un LoRA de rango 64 sobre las proyecciones de atención del modelo de lenguaje, con tasa de aprendizaje 1,5e-4, mediante la herramienta propia del proyecto `zils.teacher train --lora 64 --lr 1.5e-4`. Posteriormente el adaptador se fusionó en los pesos, de modo que el repositorio contiene pesos completos y no un adaptador separable.

El conjunto de entrenamiento consistió en 22.000 filas de las respuestas publicadas del "relay teacher" de Zils, filtradas para excluir filas provenientes de GitHub, Stack Exchange y Spider, y limitadas a estados de como máximo 2.500 caracteres. No se documentan el número total de tokens, la composición lingüística del dataset, ni si hubo etapas de RLHF o DPO. El runtime, el tokenizer, el readout y los archivos de configuración son los del modelo base d3-lite sin cambios, según el aviso de modificación de la sección 4 de Apache-2.0.

## Capacidades

- Generación de texto y toma de decisiones dentro del pipeline d3-lite de Zils, que es el propósito declarado del ajuste.
- Razonamiento de tipo "decision model": el modelo está entrenado para producir decisiones o respuestas de relay, no para conversación abierta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- Requiere código personalizado (`custom_code`) para cargarse, por lo que no es un transformer estándar de transformers sin el repositorio asociado.

## Casos de uso

- Evaluación de la cadena de decisión de Zils: usar el modelo como cuerpo de decisión en el pool lite de la subnet 127 para comprobar el comportamiento del ajuste frente al modelo base, dado que el autor lo publica precisamente como artefacto de ese pipeline.
- Reproducción de experimentos de ajuste LoRA: servir como referencia de un LoRA de rango 64 fusionado sobre un transformer de ~853 M, útil para estudiar el efecto del filtrado de datos (exclusión de GitHub, Stack Exchange y Spider) en las respuestas.
- Investigación sobre modelos de decisión de pequeño tamaño: con 853 M de parámetros, cabe en una sola GPU de consumo y permite iterar rápido en experimentos de alineación y filtrado de datos sin infraestructura pesada.
- Clasificación o enrutamiento de consultas dentro de un sistema mayor: si el pipeline d3-lite lo usa como "body" de decisión, puede emplearse para etiquetar o dirigir peticiones antes de pasarlas a un modelo mayor.
- Fine-tuning posterior como base: al ser Apache-2.0 y de tamaño reducido, sirve como punto de partida para ajustes adicionales en dominios concretos, siempre que se conserve el NOTICE.
- Pruebas de integración del runtime d3-lite: validar la carga de pesos safetensors con `custom_code`, el tokenizer y el readout del modelo base en un entorno de despliegue propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits cabría en torno a 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican variantes GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; para entrenamiento o fine-tuning adicional conviene una A100 o H100 por comodidad, aunque no es imprescindible.
- Cabe holgadamente en GPU de consumo; el cuello de botella no es la memoria sino la disponibilidad del `custom_code` y del runtime d3-lite.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al requerir `custom_code`, el despliegue estándar con transformers exige `trust_remote_code=True` y el repositorio del runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-x11a | ~853 M | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Requiere `custom_code`; ajuste LoRA fusionado sobre d3-lite |
| joamCriff123/zils-lite-l1117a (modelo base) | No disponible en la informacion | No disponible | Apache-2.0 | Hugging Face | Cuerpo de partida del ajuste; sin el LoRA de decisión |
| Qwen2.5-0.5B / Qwen3 pequeños (referencia de familia) | ~0,5-1,7 B | 32K en variantes estándar | Apache-2.0 en la mayoría | Amplia, con GGUF y herramientas estándar | No es un comparable directo verificado: solo comparte la etiqueta de familia `qwen3_5` |

No se dispone de datos de rendimiento del modelo ni de comparaciones publicadas con alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo con cero descargas y cero "likes": no hay evidencia de uso ni validación por parte de la comunidad.
- La model card no declara idiomas, contexto, pipeline ni datos de evaluación; cualquier uso en producción exige una evaluación propia previa.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de fidelidad ni de tasas de error.
- Sesgos desconocidos: el dataset de entrenamiento son respuestas de un "relay teacher" filtradas por origen y longitud, lo que puede introducir sesgos de selección no documentados.
- El filtrado excluye filas de GitHub, Stack Exchange y Spider, lo que puede degradar el rendimiento en tareas de código o de consulta estructurada respecto al modelo base.
- Requiere `custom_code` y el runtime d3-lite: no es un modelo plug-and-play con transformers, vLLM o llama.cpp estándar.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar el LICENSE y el NOTICE y a indicar las modificaciones realizadas, tal como hace el propio autor.
- El modelo base pertenece a otro usuario (joamCriff123) y el ajuste se publica bajo una identidad distinta (joeyAIDev); conviene verificar la cadena de procedencia antes de integrarlo.
- No hay garantía de mantenimiento: el repositorio se creó y actualizó en un intervalo de menos de un minuto y no muestra actividad posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-lite-body-x11a
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Revisión del modelo base citada: https://huggingface.co/joamCriff123/zils-lite-l1117a/tree/ec192c7e0a443c04f7cbfe7151b1c910bd5e880f
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio o demo del proyecto Zils: no disponible en la informacion proporcionada.
