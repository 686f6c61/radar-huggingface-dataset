# hhjuyh/Qwen3.8-35B-A3B-Hierophant-Abliterated

## Resumen

Qwen3.8-35B-A3B-Hierophant-Abliterated es una variante no oficial del modelo Empero Qwen3.8-35B-A3B-Distill, publicada por el usuario hhjuyh en Hugging Face. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales, derivado a su vez del Qwen3.6-35B-A3B de Qwen, que ha sido destilado por Empero y posteriormente modificado mediante una tecnica de "abliteration" (aplicacion de un adaptador de rango 1 denominado Hierophant) para reducir el comportamiento de rechazo del modelo original.

El problema que aborda esta variante es concreto: el modelo base presenta una tasa elevada de rechazos ante peticiones relacionadas con enganos y trampas. La modificacion fusiona el adaptador Hierophant a escala 1.0 sobre el GGUF Q6_K original, editando 121 de los 753 tensores y preservando el formato del resto. El resultado es un modelo que, segun la model card, responde a 9 de cada 10 peticiones de ese tipo que el original rechazaba, manteniendo el rendimiento en tareas benignas de control.

La relevancia de esta ficha es doble: por un lado, documenta una variante de un modelo MoE de 35B con capacidades multimodales (image-text-to-text) empaquetada en formato GGUF para llama.cpp; por otro, ilustra los riesgos y las limitaciones de las modificaciones de alineacion no supervisadas, cuyos efectos colaterales sobre la calidad general y la seguridad no estan caracterizados de forma exhaustiva. La licencia declarada es Apache 2.0, y el unico idioma soportado declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada de Qwen3.6-35B-A3B; inferencia via llama.cpp |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere aproximadamente 3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible (la prueba de calidad se realizo con contexto de 2.048 tokens, pero no se declara la ventana maxima) |
| Tipos de cuantizacion | Q6_K (29,21 GB) y Q4_K_M (21,71 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision separado mmproj-Qwen3.8-35B-A3B-F16.gguf |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE), heredada de Qwen3.6-35B-A3B y destilada por Empero en el modelo Qwen3.8-35B-A3B-Distill. El modelo combinado suma 35,5 mil millones de parametros totales; la nomenclatura "A3B" del nombre base indica del orden de 3 mil millones de parametros activos por token, aunque la informacion proporcionada no lo confirma de forma explicita. El modelo base incluye capacidades multimodales (procesamiento de imagen y texto) mediante un proyector de vision independiente en formato F16.

El proceso de modificacion es el elemento diferencial: se trata de una "abliteration" mediante la fusion de un adaptador de rango 1 (Hierophant) a escala 1.0 sobre el GGUF Q6_K original. La fusion edita 121 tensores y conserva el formato original de los 753 tensores restantes, produciendo un GGUF autonomo. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO), ni detalles sobre el dataset de destilacion de Empero. La evaluacion realizada por el autor se limita a 36 prompts ejecutados en llama.cpp con contexto de 2.048 tokens, thinking desactivado y temperatura 0; el autor reconoce explicitamente que el rendimiento en contexto largo y en uso de herramientas queda fuera del alcance de esa prueba.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento de imagen y texto (pipeline image-text-to-text), siempre que se cargue el proyector de vision mmproj-Qwen3.8-35B-A3B-F16.gguf junto al modelo.
- Razonamiento aritmetico basico: la prueba de humo supero un prompt de aritmetica textual.
- Lectura de texto en imagenes: la prueba de humo leyo un titulo a partir de una imagen.
- Reduccion del comportamiento de rechazo: segun la model card, 0/10 rechazos explicitos en prompts de engano y trampa, frente a 10/10 del original.
- Soporte de tool calling / function calling: no disponible (no evaluado; el autor lo excluye del alcance de sus pruebas).
- Soporte de agentes y razonamiento multi-paso: no disponible; las tareas JSON multi-paso obtuvieron 0/6 en ambos modelos, lo que sugiere una limitacion en ese tipo de tareas.
- Capacidades multilingues: unicamente ingles declarado.
- Modo thinking: existe la opcion de desactivarlo (las pruebas se hicieron con thinking desactivado), pero no se documentan sus resultados.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y rechazo: el modelo permite estudiar como una modificacion de rango 1 sobre los pesos afecta a la tasa de rechazo y a la calidad en tareas de control, con un conjunto de pruebas reproducible de 36 prompts.
- Despliegue local en llama.cpp o LM Studio: los GGUF Q4_K_M (21,71 GB) y Q6_K (29,21 GB) permiten ejecutar un MoE de 35B en hardware de consumo de gama alta, sin necesidad de infraestructura de servidor.
- Procesamiento de documentos con imagenes: con el proyector de vision cargado, el modelo puede extraer titulos y texto de imagenes, util para digitalizacion o catalogacion de material escaneado.
- Asistencia conversacional en ingles con contexto moderado: adecuado para dialogos multi-turno donde el contexto no supere los limites practicos del despliegue y no se requiera tool calling.
- Evaluacion comparativa de variantes abliteradas: util como referencia para medir el coste en calidad de las modificaciones de alineacion frente al modelo original de Empero.
- Pruebas de robustez y red teaming: su comportamiento menos restrictivo lo convierte en un sujeto de prueba para estudiar respuestas ante peticiones sensibles en entornos controlados de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la evaluacion del autor sobre 36 prompts en llama.cpp (contexto de 2.048 tokens, thinking desactivado, temperatura 0):

| Resultado | Q6_K original | Hierophant 1.0 Q6_K |
|---|---:|---:|
| Rechazos explicitos en prompts de engano y trampa | 10/10 | 0/10 |
| Peticiones redirigidas a una alternativa honesta | 0/10 | 1/10 |
| Prompts benignos de control respondidos | 4/4 | 4/4 |
| Respuestas cortas correctas | 14/16 | 14/16 |
| Tareas JSON multi-paso correctas | 0/6 | 0/6 |
| Total de tareas de calidad correctas | 14/22 | 14/22 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que las puntuaciones describen un conjunto de prueba pequeno, con thinking desactivado, y que el rendimiento en contexto largo y en uso de herramientas no fue evaluado. Ademas, nueve de las respuestas del modelo fusionado en el grupo de engano alcanzaron el limite de 192 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22 GB para Q4_K_M y 30 GB para Q6_K, mas el espacio adicional del contexto y del proyector de vision.
- GPU recomendadas: A100 (40/80 GB) o H100 para Q6_K con contexto amplio; RTX 4090 (24 GB) puede alojar Q4_K_M con margen limitado y Q6_K solo con offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 o GPUs con 24 GB o mas para Q4_K_M; Q6_K requiere 32 GB o mas, o bien reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp (libreria declarada), LM Studio; otros motores compatibles con GGUF no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant-Abliterated (este) | 35,5B | no disponible | GGUF (Q6_K, Q4_K_M) | Apache 2.0 | Variante abliterada; 0/10 rechazos en el test del autor |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF (base) | 35,5B | no disponible | GGUF | Apache 2.0 | Modelo original; 10/10 rechazos en el mismo test |
| Qwen/Qwen3.6-35B-A3B (modelo raiz) | no disponible | no disponible | no disponible | no disponible | Base de la que deriva el destilado de Empero |

No se dispone de datos de rendimiento estandar ni de contexto declarado para establecer una comparacion cuantitativa mas amplia con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteracion reduce los rechazos de forma no selectiva: el modelo respondio a 9 de 10 peticiones de engano y trampa, lo que supone un riesgo directo de uso indebido y exige controles externos en cualquier despliegue.
- La evaluacion se limita a 36 prompts con contexto de 2.048 tokens y thinking desactivado; no hay evidencia sobre contexto largo, tool calling ni agentes.
- Las tareas JSON multi-paso fallaron en 6/6 casos tanto en el original como en la variante, lo que indica una limitacion de razonamiento estructurado.
- Nueve respuestas del modelo fusionado alcanzaron el limite de 192 tokens en el grupo de engano, lo que sugiere respuestas truncadas o divagantes en ese tipo de peticiones.
- El unico idioma declarado es el ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje y potencialmente agravado por la modificacion de pesos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad sobre el uso recae en el desplegador.
- Modelo no oficial: no esta respaldado por Qwen ni por Empero, y su calidad no ha sido validada de forma independiente.
- El proyector de vision es un archivo separado que debe descargarse del repositorio de Empero; sin el, el modelo solo procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant-Abliterated
- Modelo base (Empero Qwen3.8-35B-A3B-Distill-GGUF): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Repositorio del destilado de Empero: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo raiz de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto Hierophant: https://github.com/khimaros/hierophant
- GGUF Q6_K original: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/Qwen3.8-35B-A3B-Q6_K.gguf
- Proyector de vision: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/mmproj-Qwen3.8-35B-A3B-F16.gguf
