# ColdTensor/Laguna-XS-2.1-Coldfit-13GB-GGUF

## Resumen

Laguna-XS-2.1-Coldfit-13GB-GGUF es una cuantizacion del modelo base `poolside/Laguna-XS-2.1`, un modelo de mezcla de expertos (MoE) de 33.442.617.088 parametros orientado a generacion de codigo y tareas agenticas. La publica el usuario ColdTensor en Hugging Face bajo licencia `openmdw-1.1`, y su proposito principal es hacer viable la ejecucion del modelo completo en GPUs de consumo: reduce el peso de 66,9 GB (GGUF original) a 13,6 GB, un factor de aproximadamente 5x, manteniendo las 41 capas y los 256 expertos por capa sin poda.

La relevancia de esta ficha radica en que permite desplegar un modelo de escala frontera (33B) en tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB, con 16K de contexto, y en tarjetas de 24 GB como la RTX 4090 con hasta 256K de contexto usando cache KV en q8_0. Segun la model card, la perdida de rendimiento medida frente al original es de entre 0,7 y 2,0 puntos en cuatro benchmarks (HumanEval+, MBPP+, GSM8K y MMLU-500).

El modelo esta pensado para generacion de texto y codigo en ingles, con soporte de plantilla de chat de Poolside y modo de razonamiento (thinking) configurable. Se distribuye como un unico archivo GGUF compatible con llama.cpp, lo que simplifica su integracion en entornos locales y servidores OpenAI-compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 256 expertos por capa, 8 activos por token, 41 capas |
| Parametros totales | 33.442.617.088 |
| Parametros activos | no disponible (la model card indica 8 de 256 expertos por token, sin cifra total de parametros activos) |
| Longitud de contexto | 262.144 tokens (256K) en el modelo base; en esta cuantizacion, 16K en 16 GB, 128K en 24 GB con KV f16 y 256K con KV q8_0 |
| Tipos de cuantizacion | GGUF cuantizado (Coldfit-13GB); KV cache configurable en f16 o q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (un unico archivo, tipos de tensor estandar) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE): 41 capas, 256 expertos por capa y 8 expertos activados por token, lo que da un total de 33.442.617.088 parametros. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion; esa informacion no esta disponible en el material proporcionado.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en la cuantizacion: ColdTensor ha producido un GGUF de 13,6 GB que conserva las 41 capas y los 256 expertos de cada capa, sin poda, y que carga completamente en GPU con `-ngl 999`. La model card menciona soporte de atencion con ventana deslizante (sliding-window KV cache) y flash attention (`-fa on`), asi como la recomendacion de dejar `--swa-full` desactivado. No se documentan en el material tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y codigo en ingles, con enfasis en tareas de programacion y razonamiento.
- Modo de razonamiento (thinking) activable, con presupuesto de tokens de pensamiento configurable (4.096 para codigo, 2.048 para el resto, segun la model card).
- Razonamiento matematico: la model card reporta resultados en GSM8K.
- Evaluacion de conocimiento general: resultados reportados en MMLU-500.
- Generacion de codigo evaluada con HumanEval+ y MBPP+.
- Compatibilidad con la plantilla de chat de Poolside (`--jinja` en llama.cpp).
- Servidor OpenAI-compatible mediante `llama-server` (endpoint `/completion` y API en el puerto 8080).
- Soporte de contexto largo: hasta 256K tokens con KV cache q8_0 en GPU de 24 GB.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistente de codigo local en estacion de trabajo: con 16K de contexto en una GPU de 16 GB, el modelo puede mantener conversaciones multi-turno sobre un repositorio pequeno o un conjunto de archivos, generando parches y explicaciones sin enviar codigo a servicios externos.
- Autocompletado y generacion de funciones en el IDE: la cuantizacion permite ejecutar el modelo en la misma maquina del desarrollador, con latencia aceptable para sugerencias inline y sin depender de la nube.
- Revision de codigo en pipelines de CI: el modelo puede analizar diffs y generar comentarios de revision en ingles, integrado mediante `llama-server` con API compatible con OpenAI.
- Generacion de tests unitarios: a partir de una funcion y su docstring, el modelo puede producir casos de prueba, aprovechando su rendimiento en HumanEval+ y MBPP+.
- Razonamiento matematico y resolucion de problemas: util para asistencia en tareas de analisis cuantitativo o generacion de explicaciones paso a paso con el modo thinking activado.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local con llama.cpp, es adecuado para organizaciones que no pueden enviar datos a APIs externas.
- Prototipado de agentes de codigo: la ventana de 128K en GPU de 24 GB permite incluir contexto amplio de repositorio en tareas de refactorizacion o migracion.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la degradacion de un MoE de 33B al cuantizarlo a 13,6 GB.

## Benchmarks y rendimiento

La model card proporciona una comparacion directa entre el modelo original y esta cuantizacion, medida con el mismo harness:

| Benchmark | Original | Coldfit-13GB | Diferencia |
|---|---:|---:|---:|
| HumanEval+ | 86,8 | 85,9 | -0,9 |
| MBPP+ | 75,3 | 74,5 | -0,8 |
| GSM8K | 94,6 | 93,9 | -0,7 |
| MMLU-500 | 82,4 | 80,4 | -2,0 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 13.754 MiB a 8K de contexto, 14.082 MiB a 16K y 14.738 MiB a 32K en una GPU de 24 GB (mediciones con `nvidia-smi`, incluyendo uso del motor).
- En GPU de 24 GB: 32K con KV f16 usa 14.291,27 MiB de buffers; 64K, 15.603,27 MiB; 128K, 18.227,27 MiB; 256K, 23.475,27 MiB con f16 y 19.583,18 MiB con q8_0.
- GPU recomendadas: RTX 4080 / RTX 4060 Ti de 16 GB para 16K de contexto; RTX 4090 o similar de 24 GB para 128K con f16 y 256K con q8_0. No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB y 24 GB, con las configuraciones indicadas.
- Opciones de despliegue: llama.cpp (builds recientes con soporte de Laguna; la model card cita stock b12359 y build 11511), `llama-server` con API OpenAI-compatible y `llama-cli`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajustes recomendados: temperatura 1.0, top_k 20, top_p 1.0, thinking activado, sin penalizacion de repeticion, `-ngl 999`, `-fa on`, `-np 1`, `--swa-full` desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Laguna-XS-2.1-Coldfit-13GB | 33,4B (MoE, 8/256 expertos) | 256K (segun configuracion de VRAM) | openmdw-1.1 | GGUF 13,6 GB | Cuantizacion del base con perdida de 0,7-2,0 puntos |
| poolside/Laguna-XS-2.1 (original) | 33,4B (MoE, 8/256 expertos) | 256K | openmdw-1.1 | safetensors / GGUF 66,9 GB | Modelo base sin cuantizar |
| Alternativas de 33B densas o MoE de codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La unica comparacion documentada es frente al modelo base original; no se han proporcionado datos de otros modelos de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacidad multilingue.
- La cuantizacion introduce una degradacion medible de entre 0,7 y 2,0 puntos en los benchmarks reportados; en usos distintos a los medidos el impacto podria ser mayor.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas.
- El modo thinking consume tokens adicionales y requiere fijar un presupuesto para evitar respuestas truncadas; la model card advierte que sin presupuesto el modelo puede agotar el limite de tokens sin responder.
- La ventana de 256K solo es practica con KV cache q8_0 en GPU de 24 GB; con f16 deja muy poco margen.
- La licencia `openmdw-1.1` debe revisarse en el enlace oficial antes de uso comercial; no se detallan en la informacion disponible las restricciones concretas.
- Requiere una version reciente de llama.cpp con soporte de Laguna; versiones antiguas pueden producir respuestas vacias o incorrectas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- El repositorio tiene un numero bajo de descargas (209) y cero likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ColdTensor/Laguna-XS-2.1-Coldfit-13GB-GGUF
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Licencia: https://huggingface.co/poolside/Laguna-XS-2.1/blob/main/LICENSE.md
- llama.cpp: no se proporciona enlace directo en la informacion disponible; la model card cita builds b12359 y 11511.
