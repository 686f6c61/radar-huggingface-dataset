# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs128-sym

## Resumen

Esta ficha describe `fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs128-sym`, una version cuantizada a INT8 del modelo `allenai/Llama-3.1-Tulu-3-8B-DPO` de AI2 (Allen Institute for AI). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando cuantizacion de solo pesos (WoQ) con el algoritmo SignRound, 8 bits, tamano de grupo 128 y esquema simetrico. No es un modelo nuevo: es un artefacto de despliegue que preserva el comportamiento del modelo original reduciendo el peso de los pesos.

El modelo base pertenece a la familia Tulu 3, el conjunto de modelos abiertos de AI2 afinados para seguir instrucciones y tareas de razonamiento, construidos sobre la arquitectura Llama 3.1 de Meta. El sufijo DPO indica que el ajuste incluye una etapa de optimizacion por preferencias directas (Direct Preference Optimization) tras el ajuste supervisado. El resultado es un modelo conversacional de tipo instruct/chat, disenado para usarse con su plantilla de chat integrada.

La relevancia de esta variante es practica: el autor la ha generado especificamente para inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost en Core Ultra) via OpenVINO, lo que permite ejecutar un modelo de la clase 8B en hardware sin GPU dedicada NVIDIA. El repositorio tiene un tamano de 11,4 GB, coherente con pesos INT8 mas ficheros auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Llama 3.1), cuantizado WoQ INT8 |
| Parametros totales | 2.863.992.832 segun safetensors del repo (nota: el modelo base se denomina 8B; ver advertencia en limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8, group size 128, simetrica (AutoRound / SignRound, WoQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `auto_round`, libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de la familia Llama 3.1, afinado por AI2 dentro de la familia Tulu 3. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni las etapas exactas de RLHF/DPO del modelo original; solo se sabe que el checkpoint base lleva el sufijo DPO, lo que implica una etapa de optimizacion por preferencias tras el ajuste supervisado. No se dispone de datos sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

La innovacion de esta variante concreta es el proceso de cuantizacion. Se aplico Intel AutoRound v0.16.0 con el algoritmo SignRound en modo weights-only quantization: se cargaron los pesos en `torch.bfloat16`, se calibraron con 128 muestras de longitud 512 y batch 4 en CPU, y se ejecutaron 200 iteraciones de ajuste. El proceso completo duro 51.658,8 segundos (unas 861 minutos) y finalizo el 2026-10-26. El resultado son pesos INT8 con grupo de 128 y simetria, guardados en formato `auto_round` para su carga con transformers.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat integrada (rol user/assistant).
- Razonamiento y respuesta a instrucciones heredados del modelo Tulu 3 DPO.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, aunque no se documentan resultados especificos en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia optimizada en CPU Intel, iGPU Intel Arc y NPU Intel via OpenVINO / intel-extension-for-pytorch.

## Casos de uso

- Despliegue en equipos sin GPU NVIDIA: el modelo esta cuantizado para CPU Intel, iGPU Arc y NPU AI Boost, por lo que permite ejecutar un 8B en portatiles Core Ultra o estaciones de trabajo Intel sin tarjeta grafica dedicada.
- Asistentes conversacionales en ingles sobre hardware de borde: al ser un modelo instruct con plantilla de chat, puede integrarse en aplicaciones de escritorio o servicios locales que requieran privacidad de datos sin enviar peticiones a la nube.
- Prototipado y evaluacion de tecnicas de cuantizacion: el repositorio incluye la receta de replicacion completa (version de AutoRound, hiperparametros, condiciones de ejecucion), lo que lo hace util como referencia reproducible para estudiar el impacto de INT8 gs128 simetrico.
- Investigacion en eficiencia de inferencia: comparar este artefacto con el modelo base en bf16 permite medir la degradacion de calidad y la ganancia de rendimiento de la cuantizacion WoQ en CPU.
- Generacion de codigo y tareas de razonamiento en entornos locales: el modelo base Tulu 3 esta orientado a instrucciones y codigo; esta variante permite ejecutarlo en hardware modesto para tareas de asistencia al desarrollo.
- Fine-tuning ligero o evaluacion downstream: al estar en formato transformers con safetensors, puede cargarse con `AutoModelForCausalLM` para experimentos de evaluacion o adaptacion sobre la version cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base en bf16, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion INT8.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 11,4 GB, lo que da una idea del espacio en disco necesario; la carga en memoria de pesos INT8 ronda ese orden de magnitud, aunque no se proporciona una cifra exacta de consumo en ejecucion.
- GPU recomendadas: el autor no menciona GPU NVIDIA; el objetivo declarado es CPU Intel, iGPU Intel Arc (por ejemplo Core Ultra 185H) y NPU Intel AI Boost en Core Ultra.
- Cabe en consumer GPU: no se documenta; el foco es hardware Intel integrado. No hay datos sobre ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: transformers con el formato `auto_round`; intel-extension-for-pytorch para CPU/iGPU Arc; OpenVINO para NPU. El tag `text-generation-inference` aparece en los metadatos, pero no se detalla su uso.
- Latencia y throughput: no disponibles. El unico dato temporal es el de la cuantizacion (861 minutos en CPU), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este artefacto (Tulu 3 8B DPO INT8 AutoRound) | 2,86B segun safetensors (base 8B) | no disponible | INT8 gs128 sim, WoQ | Apache 2.0 | Inferencia en CPU/iGPU/NPU Intel |
| allenai/Llama-3.1-Tulu-3-8B-DPO (base) | 8B | no disponible en esta ficha | bf16/fp16 | Apache 2.0 | Modelo original sin cuantizar |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 8B | no disponible | 4/8 bits segun variante | Apache 2.0 | Despliegue general en GPU/CPU |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el campo safetensors indica 2.863.992.832 parametros, muy por debajo de los ~8B que sugiere el nombre del modelo base. Conviene verificar la integridad del checkpoint antes de usarlo en produccion.
- Solo ingles: el campo `language: en` limita el uso a ese idioma; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos; la cuantizacion INT8 puede ampliar ligeramente la degradacion respecto al base en bf16, aunque no se aportan mediciones.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Tulu 3.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que el modelo se ha desarrollado "solo para fines de investigacion" y se entrega sin garantia. Conviene revisar tambien la licencia del modelo base de AI2.
- Estado del artefacto: `inference: false` en los metadatos de la model card, lo que sugiere que el autor no lo ha validado para inferencia directa; las descargas son muy bajas (14) y no tiene likes, por lo que la validacion comunitaria es practicamente nula.
- Entorno de ejecucion especifico: optimizado para el stack Intel (intel-extension-for-pytorch, OpenVINO); en otras plataformas el rendimiento puede no ser el esperado.
- Repositorio de replicacion en dominio no estandar (`git.epicdynamic.com`), lo que reduce la trazabilidad y la confianza en la cadena de suministro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_round-int8-gs128-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
