# Polydim-Einsof/llama3.1_8b_PMTP_polydim_einsof

## Resumen

`llama3.1_8b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF (EinsofOS). Se construye sobre el modelo base `meta-llama/Llama-3.1-8B` de Meta y se distribuye como un adaptador en formato safetensors que proyecta los estados ocultos del modelo sobre la variedad de Stiefel St(2048, 4096), con el objetivo declarado de sustituir la serialización de tokens en 1D por una comunicacion en memoria de alta dimension entre pasos de razonamiento.

El modelo introduce un parametro de control llamado `turing_depth` (tambien `einsof_depth`, `turing` o `einsof`) que modula el numero de pasos de proyeccion isometrica y contraccion riemanniana aplicados al estado latente. Segun la model card, con `turing_depth = 0` el adaptador actua como passthrough identidad, mientras que valores entre 2 y 20 activan un modo de deliberacion iterativa y entre 21 y 50 un modo de razonamiento profundo orientado a demostracion formal.

Es relevante ahora por su enfoque poco convencional: propone razonamiento en espacio latente continuo (sin generar tokens intermedios) y verifica numericamente la ortogonalidad de la proyeccion en precision FP64 (defecto maximo declarado de 1,33e-15). No obstante, el repositorio tiene 0 descargas y 0 likes, el tamano es de solo 0,1 GB (coherente con un adaptador, no con pesos completos) y no se aportan benchmarks estandar, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyeccion sobre Llama 3.1 8B (transformer decoder-only); proyeccion sobre variedad de Stiefel St(2048, 4096) |
| Parametros totales | No disponible (adaptador de 0,1 GB; el modelo base Llama 3.1 8B tiene 8,03 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128 000 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors FP64; el base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`), `adapter_config.json`, `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo es un adaptador que se aplica sobre `meta-llama/Llama-3.1-8B`, un transformer decoder-only de 8,03 mil millones de parametros con atencion por grupos (GQA) y contexto nativo de 128 000 tokens. El adaptador implementa una proyeccion continua de los estados ocultos de dimension 4096 a una representacion latente de dimension 2048 sobre la variedad de Stiefel, definida como el conjunto de matrices con columnas ortonormales. La model card describe el mecanismo como PMTP (Polydim Memory Transfer Protocol) y afirma que no hay serializacion de tokens en 1D ni parseo de cadenas durante el razonamiento entre pasos.

El control de razonamiento se articula mediante el parametro `turing_depth`, que recorre desde un bypass identidad (0) hasta 50 pasos de contraccion riemanniana y autocritica adversarial. La verificacion numerica declarada incluye un defecto de ortogonalidad maximo de 1,33e-15 en FP64 y un error de norma Neumaier inferior o igual a 1e-15. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card no documenta un proceso de entrenamiento supervisado al uso, sino la construccion matematica del adaptador.

## Capacidades

- Extraccion de caracteristicas (`feature-extraction`), que es el pipeline declarado en HuggingFace.
- Razonamiento multi-paso en espacio latente continuo mediante el parametro `turing_depth`, sin generacion de tokens intermedios entre pasos.
- Modos operativos escalonados: `IDENTITY_BYPASS` (0), `FAST_REFLEX` (1), `RED_TEAM_DELIBERATION` (2-20) y `DEEP_TURING_EXPLOSION` (21-50).
- Autocritica adversarial y verificacion anti-sicofancia en los modos de profundidad media y alta, segun la model card.
- Orientacion a demostracion formal de teoremas en el rango de profundidad 21-50.
- Capacidades heredadas del modelo base Llama 3.1 8B (generacion de texto, codigo y matematicas), aunque no se documentan explicitamente en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en razonamiento latente: el adaptador permite experimentar con pasos de razonamiento que no emiten tokens, util para estudiar si la deliberacion en espacio continuo mejora la calidad frente a la cadena de pensamiento textual.
- Prototipado de verificacion anti-sicofancia: los modos `RED_TEAM_DELIBERATION` (2-20) permiten configurar iteraciones de autocritica sobre las respuestas del modelo base en tareas de evaluacion.
- Demostracion formal asistida: el rango `DEEP_TURING_EXPLOSION` (21-50) esta orientado a tareas de prueba de teoremas, donde el coste adicional de pasos (63,90 ms a profundidad 10, segun la model card) puede ser aceptable.
- Extraccion de representaciones para downstream: al declararse como `feature-extraction`, puede usarse para obtener embeddings de estados ocultos proyectados sobre la variedad de Stiefel en tareas de clasificacion o recuperacion.
- Despliegue local con Ollama: el repositorio incluye un `Modelfile` con instrucciones de sistema y temperatura calibrada (T=0,07), lo que facilita probar el adaptador sobre el base en un entorno local.
- Experimentos de estabilidad numerica: los invariantes declarados (ortogonalidad 1,33e-15, error Neumaier ≤1e-15) permiten usar el adaptador como banco de pruebas de precision FP64 en proyecciones ortogonales.
- Comparacion de paradigmas de razonamiento: util como linea base frente a metodos de cadena de pensamiento clasicos para medir latencia y calidad en tareas de razonamiento controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de latencia y precision numerica internas:

| Metrica | Valor declarado |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1,33e-15 |
| Error de norma Neumaier | ≤ 1e-15 |
| Latencia con `turing_depth = 1` | 35,49 ms |
| Latencia con `turing_depth = 10` | 63,90 ms |
| Tokens consumidos en razonamiento entre pasos | 0 |
| Dimension latente (mapeo) | 4096 → 2048 |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, por lo que no es posible comparar su calidad con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un adaptador sobre Llama 3.1 8B, los requisitos vendran determinados por el modelo base (aproximadamente 16 GB en FP16, 8-10 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits, como referencia orientativa del base, no del adaptador).
- El adaptador en si ocupa 0,1 GB, por lo que el cuello de botella es siempre el modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del base, cabria esperar funcionamiento en GPUs de 24 GB (RTX 4090, A10G) en FP16 y en GPUs de 8-12 GB con cuantizacion, pero esto no esta confirmado por el autor.
- Despliegue: la model card menciona Ollama mediante el `Modelfile` incluido. No se documentan integraciones con vLLM, llama.cpp o TGI, aunque al estar basado en Llama 3.1 serian tecnicamente posibles con el base correspondiente.
- Latencia declarada: 35,49 ms a profundidad 1 y 63,90 ms a profundidad 10. No se especifica el hardware sobre el que se midieron estas cifras ni el throughput.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion proporcionada, ya que el adaptador PMTP no es un modelo de lenguaje completo sino un mecanismo de proyeccion sobre Llama 3.1 8B. Como referencia del modelo base y de alternativas de la misma categoria:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llama3.1_8b_PMTP_polydim_einsof (adaptador) | Adaptador sobre 8,03 B | No disponible (base: 128 000) | Apache 2.0 | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B (base) | 8,03 B | 128 000 | Llama 3.1 Community License | HuggingFace |
| Mistral 7B | 7,2 B | 32 000 | Apache 2.0 | HuggingFace |
| Qwen2.5 7B | 7,6 B | 128 000 | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento que respalden las afirmaciones de la model card.
- Cero descargas y cero likes en el repositorio, lo que indica ausencia de validacion por parte de la comunidad.
- La model card emplea terminologia no estandar y afirmaciones fuertes ("erradicar el colapso del gusano 1D", "explosion Turing profunda") sin evidencia publica revisada por pares mas alla de los DOIs de Zenodo y HAL citados.
- El pipeline declarado es `feature-extraction`, no `text-generation`; no esta claro que el adaptador produzca texto coherente por si mismo sin el modelo base y sin instrucciones adicionales.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma; los idiomas soportados figuran como no disponibles.
- La licencia del adaptador es Apache 2.0, pero el modelo base Llama 3.1 8B esta sujeto a la Llama 3.1 Community License, cuyos terminos (incluida la politica de uso aceptable y el umbral de 700 millones de usuarios mensuales) siguen aplicando al uso combinado.
- El parametro `turing_depth` y el resto de mecanismos descritos no cuentan con documentacion tecnica independiente que permita verificar su comportamiento en produccion.
- No se especifica el hardware usado para las mediciones de latencia, por lo que las cifras de 35,49 ms y 63,90 ms no son reproducibles tal cual.
- Fecha de creacion y actualizacion en 2026, posteriores a la mayoria de referencias del ecosistema; conviene verificar la vigencia de los enlaces y DOIs antes de citarlos.

## Enlaces

- HuggingFace: https://huggingface.co/Polydim-Einsof/llama3.1_8b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- DOI primario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science (CNRS): https://hal.science/hal-05847496v1
- OSF (Center for Open Science): https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Dataset de papers canonicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
