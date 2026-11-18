# OliviaRossi/SenseNova-6.8-Code2Video-GSQ-RCO-GGUF

## Resumen

SenseNova-6.8-Code2Video es un modelo de la familia SenseNova de SenseTime, orientado a la generación de vídeo a partir de código y a tareas de razonamiento multimodal. El repositorio analizado es una cuantización GGUF no uniforme del modelo original, publicada por el usuario OliviaRossi, que aplica la metodología GSQ + RCO (Riemannian Constrained Optimization) para asignar un tipo de cuantización distinto a cada tensor del modelo. El resultado es un fichero GGUF de perfil IQ3_S que busca preservar las capacidades de razonamiento y recuperación mientras reduce agresivamente las capas feed-forward, donde la redundancia de parámetros es mayor.

El modelo base cuenta con 26.895.998.464 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 27B. La cuantización está pensada para su uso con llama.cpp y transformers, con compatibilidad declarada con endpoints. La licencia del modelo es Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

La relevancia de esta ficha radica en que documenta una técnica de cuantización no uniforme poco habitual en el ecosistema GGUF, inspirada en el trabajo de ISTA-DASLab sobre modelos Qwen, y en que ofrece una vía para ejecutar un modelo de ~27B en hardware más modesto sin degradar de forma uniforme todas las capas. No obstante, la información publicada sobre el modelo base y sobre el proceso de cuantización es limitada, por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es de la familia SenseNova; la model card no detalla transformer, MoE o SSM) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-server usa `-c 32768` |
| Tipos de cuantizacion | GGUF no uniforme, perfil GSQ-RCO-IQ3_S; mezcla de IQ4_XS, Q5_K, Q6_K en proyecciones de atención, IQ2_S e IQ2_XXS en capas feed-forward, y BF16/F32 en capas SSM y de normalización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 23,0 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura interna del modelo base SenseNova-6.8-Code2Video: no se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida con capas SSM. La única pista arquitectónica es la mención explícita a capas SSM y de normalización, que en el esquema GSQ-RCO se mantienen en BF16 y F32 respectivamente, lo que sugiere que el modelo base incorpora componentes de tipo state space. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de este repositorio no está en el modelo en sí, sino en el procedimiento de cuantización. GSQ-RCO aplica optimización con restricciones riemannianas para asignar a cada tensor un tipo de cuantización adaptado: las proyecciones de atención (`attn_qkv`, `attn_gate`) reciben mayor precisión (IQ4_XS, Q5_K, Q6_K) para proteger el razonamiento y la recuperación de información, mientras que las capas feed-forward (`ffn_down`, `ffn_up`) se cuantizan de forma más agresiva (IQ2_S, IQ2_XXS) al concentrar mayor redundancia. El mapa de asignación de tensores se deriva del modelo `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` y la matriz de importancia utilizada es `imatrix-qwen3.8-27b.gguf`, un detalle relevante porque implica que la imatrix no fue calculada específicamente sobre el modelo SenseNova, lo que puede afectar a la calidad final de la cuantización.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base SenseNova-6.8-Code2Video.
- Generación de vídeo a partir de código (code2video), que da nombre al modelo y constituye su especialidad declarada.
- Razonamiento y recuperación de información reforzados por la asignación de mayor precisión a las proyecciones de atención.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Ejecución local mediante llama.cpp y llama-server, con compatibilidad con endpoints de tipo OpenAI.

## Casos de uso

- Generación de vídeo a partir de código en entornos de desarrollo: el modelo puede recibir código o especificaciones y producir guiones o secuencias de vídeo, que es la tarea para la que fue diseñado el modelo base; la versión GGUF permite ejecutarlo en estaciones de trabajo sin GPU de datacenter.
- Prototipado rápido en local con llama.cpp: gracias al perfil IQ3_S y al tamaño del repo (23,0 GB), un equipo puede desplegar el modelo con `llama-server` en una máquina con GPU de consumo y exponer una API compatible con OpenAI en el puerto 8080.
- Asistencia a la generación de código y razonamiento técnico: las proyecciones de atención en IQ4_XS/Q5_K/Q6_K preservan mejor la recuperación de contexto, lo que resulta útil en tareas de análisis de repositorios y explicación de código.
- Integración en pipelines de CI/CD para documentación audiovisual: el modelo puede generar descripciones o guiones de vídeo a partir de artefactos de código en un flujo automatizado, siempre que se valide la salida antes de publicarla.
- Experimentación académica con cuantización no uniforme: el repositorio sirve como caso de estudio para comparar GSQ-RCO frente a cuantizaciones uniformes en un modelo de ~27B, midiendo la degradación por capa.
- Despliegue en entornos con VRAM limitada: al reducir las capas feed-forward a IQ2_S/IQ2_XXS, el modelo puede caber en GPUs de 24 GB, algo inviable con los pesos originales en BF16.
- Evaluación de modelos code2video en investigación: permite reproducir experimentos de generación de vídeo desde código sin depender de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de calidad de vídeo generado, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 23,0 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar todos los tensores en GPU; con offloading parcial a CPU puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para carga completa en GPU; RTX 4090 (24 GB) queda al límite y probablemente requiera offloading parcial de capas.
- GPU de consumo: cabe en RTX 4090 de forma ajustada; en GPUs de 16 GB o menos será necesario offloading a CPU o reducir el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión entornos compatibles con GGUF como Ollama o LM Studio; la model card solo documenta llama.cpp.
- Contexto: el ejemplo de la model card usa `-c 32768`, pero no se confirma que esa sea la longitud máxima soportada por el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video GSQ-RCO-IQ3_S (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Cuantización no uniforme con imatrix de Qwen3.8-27B |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ~27B (según nombre) | no disponible | no disponible | GGUF | Referencia metodológica de GSQ-RCO; su mapa de tensores e imatrix se reutilizan aquí |
| sensenova/SenseNova-6.8-Code2Video (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; requiere mucha más VRAM |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La imatrix utilizada (`imatrix-qwen3.8-27b.gguf`) y el mapa de asignación de tensores provienen de un modelo distinto (Qwen3.8-27B), no del propio SenseNova; esto puede degradar la calidad de la cuantización respecto a una imatrix calculada específicamente.
- Las capas feed-forward cuantizadas a IQ2_S e IQ2_XXS son agresivas y pueden producir pérdida de precisión en tareas que dependan de conocimiento factual o de cálculo.
- No hay benchmarks publicados que cuantifiquen la degradación frente al modelo base; cualquier uso en producción debería ir precedido de una evaluación propia.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto máxima: no confirmada; el valor de 32768 aparece solo como ejemplo de arranque de llama-server.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene pocas descargas y likes (13.896 descargas, 9 likes en el momento de la consulta), lo que sugiere una validación comunitaria limitada.
- La fecha de creación del repositorio (2026-10-28) y su actualización (2026-10-29) deben tenerse en cuenta para evaluar su vigencia.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/OliviaRossi/SenseNova-6.8-Code2Video-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Referencia metodológica GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- ISTA-DASLab (organización): https://huggingface.co/ISTA-DASLab
- llama.cpp (repositorio del runtime): no disponible en la información proporcionada
- Paper o blog de GSQ-RCO: no disponible en la información proporcionada
