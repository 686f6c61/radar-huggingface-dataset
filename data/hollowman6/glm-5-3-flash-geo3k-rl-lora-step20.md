# HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step20

## Resumen

GLM-5.3-Flash-Geo3K-RL-LoRA-step20 es un adaptador LoRA de tipo PEFT para el modelo base multimodal zai-org/GLM-5.3-Flash, desarrollado por el usuario HollowMan6. No se trata de un modelo completo, sino de un ajuste fino mediante aprendizaje por refuerzo (GRPO) sobre el conjunto de datos Geometry3K, compuesto por problemas de geometria con imagenes. El checkpoint publicado corresponde al paso 20 de una ejecucion de 30 pasos, con guardado cada 5 pasos.

El objetivo del adaptador es mejorar el razonamiento geometrico multimodal del modelo base: segun la model card, la precision en el conjunto de test de Geometry3K (601 filas) pasa de 0,6622 en el modelo base a 0,8735 con el adaptador, lo que supone una mejora absoluta de aproximadamente 21 puntos porcentuales. Es relevante para quienes trabajan en razonamiento visual-matematico con modelos de codigo abierto y quieran reutilizar un adaptador ya entrenado en lugar de repetir el proceso de RL.

El adaptador se distribuye bajo licencia MIT, con pesos en safetensors y rango LoRA 16 sobre 22 modulos del transformer base. El repositorio ocupa 7,5 GB, lo que refleja que incluye pesos del adaptador y probablemente artefactos asociados, no un modelo completo. La informacion publica disponible sobre el modelo base y sobre el proceso de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal zai-org/GLM-5.3-Flash |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base entrenado en FP8; adaptador en BF16; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre zai-org/GLM-5.3-Flash, un modelo multimodal de tipo image-text-to-text. El ajuste se realiza con LoRA de rango 16 y alpha 32 sobre 22 modulos: proyecciones de atencion (q_proj, k_proj, v_proj, o_proj, qkv), proyecciones especificas de la arquitectura GLM (kv_a/b_proj, q_a/b_proj, wk, wq_b, b_proj, f_a/b_proj, g_a/b_proj), proyecciones del MLP (gate_proj, up_proj, down_proj) y modulos auxiliares (weights_proj, gate, proj).

El entrenamiento emplea GRPO (Group Relative Policy Optimization) implementado con verl, Megatron-LM y Megatron-Bridge, sobre el dataset Geometry3K (problemas de geometria con imagenes). Se ejecuto en BF16 con 2 nodos y 16 GPU, con resincronizacion del modelo base (resync_base=True) y replay del router R3. La ejecucion completa consta de 30 pasos y este repositorio contiene el checkpoint del paso 20. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni la funcion de recompensa mas alla de la metrica de evaluacion (0,9 * accuracy + 0,1 * formato).

## Capacidades

- Razonamiento geometrico multimodal: resuelve problemas de geometria a partir de enunciados e imagenes, especialidad del adaptador.
- Generacion de texto y razonamiento matematico derivado del modelo base GLM-5.3-Flash.
- Procesamiento image-text-to-text (entrada de imagenes y texto, salida de texto).
- Salida con formato estructurado evaluable (la metrica de score incorpora un componente de formato del 10 %).
- Capacidades de tool calling, agentes, codigo o multilingues del modelo base: no disponibles en la informacion proporcionada para este adaptador.

## Casos de uso

- Resolucion automatica de problemas de geometria: el adaptador recibe una imagen con una figura geometrica y un enunciado y genera la solucion paso a paso; la mejora medida (0,8735 frente a 0,6622 de precision) lo hace adecuado para pipelines de correccion o asistencia educativa en este dominio.
- Tutoria matematica asistida: integrado en una aplicacion educativa, puede explicar la resolucion de ejercicios de geometria a partir de capturas o fotografias de libros de texto.
- Generacion de datasets sinteticos de geometria: usar el adaptador para producir soluciones de referencia sobre figuras nuevas y ampliar corpus de entrenamiento o evaluacion.
- Evaluacion comparativa de tecnicas de RL: sirve como referencia reproducible de un ajuste GRPO con verl + Megatron para experimentos de investigacion sobre razonamiento visual.
- Prototipado de asistentes STEM multimodales: punto de partida para adaptadores en dominios matematicos relacionados (trigonometria, geometria analitica) reutilizando la receta de entrenamiento.
- Investigacion en alineamiento con recompensas verificables: el checkpoint intermedio (paso 20 de 30) permite estudiar la evolucion de la precision durante el entrenamiento por refuerzo.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test de Geometry3K (601 filas), segun la model card:

| Metrica | Adaptador (step 20) | Modelo base |
|---|---|---|
| Accuracy | 0,8735 | 0,6622 |
| Score (0,9*acc + 0,1*formato) | 0,7862 | no disponible |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (rango 16), pero requiere cargar el modelo base GLM-5.3-Flash completo; el repositorio del adaptador ocupa 7,5 GB.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; el ejemplo oficial usa tensor_parallel_size=8, lo que indica que el modelo base no cabe en una sola GPU de forma practica.
- El entrenamiento se realizo con 16 GPU en 2 nodos (BF16), lo que da una idea del orden de magnitud del modelo base.
- Despliegue: el ejemplo oficial usa vLLM con enable_lora=True, max_lora_rank=16, trust_remote_code=True y enforce_eager=True. Otros frameworks (llama.cpp, Ollama, TGI) no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para razonamiento geometrico multimodal en la informacion proporcionada. Como referencia interna, la unica comparacion documentada es frente al modelo base:

| Modelo | Parametros | Contexto | Accuracy Geometry3K | Licencia |
|---|---|---|---|---|
| GLM-5.3-Flash + Geo3K RL LoRA (step 20) | no disponible (adaptador r=16) | no disponible | 0,8735 | MIT |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | 0,6622 | no disponible en esta ficha |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base zai-org/GLM-5.3-Flash no es utilizable.
- Entrenado exclusivamente sobre Geometry3K: el rendimiento fuera del dominio de geometria con imagenes puede degradarse respecto al modelo base; no hay evaluaciones que lo confirmen.
- Checkpoint intermedio (paso 20 de 30): no es el resultado final de la ejecucion de RL.
- El score compuesto (0,7862) es notablemente inferior a la accuracy (0,8735), lo que sugiere penalizacion por formato en las respuestas; conviene validar el formato de salida en produccion.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en pasos de razonamiento geometrico no verificables.
- Sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; el dataset de entrenamiento (Geometry3K) es en ingles.
- Licencia MIT declarada por el autor del adaptador; la licencia del modelo base debe verificarse por separado antes de uso comercial.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step20
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Dataset Geometry3K: https://huggingface.co/datasets/hiyouga/geometry3k
- Framework verl: https://github.com/volcengine/verl
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
