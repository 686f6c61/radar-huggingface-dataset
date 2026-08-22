# Alniyat5f/WuQi-V3-Onyx-27b-GGUF

## Resumen

WuQi-V3-Onyx-27b es un modelo de lenguaje multimodal de 27 mil millones de parametros, desarrollado por el proyecto WuQi (伍柒) de Alniyat5f. Se trata de una instancia personalizada y posteriormente entrenada sobre el modelo Qwen3.8-27B (Apache 2.0) mediante LoRA, con un enfoque especifico en tareas agénticas y razonamiento eficiente. El modelo se distribuye en formato GGUF cuantizado, lo que permite su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su diseño orientado a agentes: incorpora soporte nativo para herramientas (tool calling), razonamiento multi-paso optimizado y una reduccion significativa del gasto de tokens de razonamiento (un 86% menos que su base), manteniendo un rendimiento competitivo frente a modelos como DeepSeekV4Flash en tareas agénticas complejas. Ademas, preserva las capacidades multimodales de su base, permitiendo la comprension de imagenes y video.

El modelo se distribuye en tres archivos GGUF: el modelo principal en cuantizacion Q4_K_M (16.81 GB), un proyector multimodal en f16 (0.93 GB) y un modelo de draft para decodificacion especulativa MTP en Q4_0 (2.01 GB). La longitud de contexto es de 262.144 tokens en configuracion de despliegue, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, basada en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 (configuracion de despliegue) |
| Tipos de cuantizacion | Q4_K_M (principal), Q4_0 (draft MTP), f16 (proyector multimodal) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

WuQi-V3-Onyx-27B parte de la arquitectura de Qwen3.8-27B, que es un transformer multimodal de 27B parametros con soporte nativo de vision y texto. El proceso de entrenamiento posterior utiliza LoRA (Low-Rank Adaptation) sobre los pesos oficiales de Qwen3.8-27B, combinando tres tipos de datos: datos de "logica WuQi" (decision y caracter), optimizacion de cadena de pensamiento (CoT) y datos de adaptacion dirigida a tareas agénticas (DSH). El entrenamiento se completa con la fusion de los adaptadores LoRA en los pesos base y la posterior cuantizacion a GGUF.

Una innovacion destacada es la inclusion de un modelo de draft MTP (Multi-Token Prediction) en formato Q4_0, que permite decodificacion especulativa para acelerar la inferencia. El modelo mantiene el proyector multimodal (mmproj) original de Qwen3.8, permitiendo comprension de imagenes y video. El sistema de chat se activa con un prompt de sistema especifico que desbloquea las capacidades entrenadas de WuQi, y el chat_template esta configurado para inyectar este prompt automaticamente si no se proporciona uno.

## Capacidades

- Generacion de texto y razonamiento complejo con cadena de pensamiento (CoT) optimizada.
- Comprension multimodal: procesamiento de imagenes y video mediante el proyector multimodal.
- Agente conversacional con soporte para 12 herramientas: bash, read, write, glob, grep, run_code, web_search, web_fetch, todo_write, subagent, job_list y skill.
- Razonamiento multi-paso y ejecucion de tareas de larga duracion (agentes que requieren planificacion, ejecucion, verificacion y colaboracion entre subagentes).
- Capacidades multilingues limitadas al chino, aunque la base Qwen3.8-27B podria tener soporte adicional no documentado en esta version.
- Decodificacion especulativa con modelo de draft MTP para acelerar la generacion.
- Optimizacion de tokens: reduce el gasto de tokens de razonamiento en un 86% y el gasto total de salida en un 60% respecto a la base.

## Casos de uso

- Agentes de automatizacion de tareas complejas: el modelo puede planificar, ejecutar y verificar tareas multi-paso que requieren uso de herramientas como bash, web_search y run_code, gracias a su adaptacion DSH y su entrenamiento en trayectorias agénticas completas.
- Asistente de codigo y depuracion: con soporte de herramientas como run_code y grep, puede generar, ejecutar y depurar codigo en un entorno interactivo, reduciendo el tiempo de iteracion.
- Analisis de documentos tecnicos en chino: su capacidad de procesar imagenes y video, combinada con texto, lo hace util para analizar diagramas, capturas de pantalla y documentos tecnicos en chino.
- Investigacion web y sintesis de informacion: puede buscar en la web, extraer contenido y sintetizar informes estructurados, con una cadena de razonamiento eficiente que reduce el gasto de tokens.
- Soporte al desarrollador en entornos CI/CD: puede integrarse en pipelines de integracion continua para revisar codigo, ejecutar pruebas y generar informes de incidencias, gracias a su capacidad de usar herramientas y su contexto largo.
- Asistente conversacional de atencion al cliente en chino: con su configuracion de contexto largo y su entrenamiento en logica y "virtudes" (respuestas con tacto, sin evasivas), puede mantener conversaciones largas y resolver incidencias de forma autonoma.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en el benchmark propietario Alniyat-DSH-Bench-Basic, que evalua tareas agénticas con herramientas y razonamiento. Los datos son los siguientes:

| Eval Set | Dificultad | WuQi-V3-Onyx-27B | Qwen3.8-27B | DeepSeekV4Flash (0731) |
|---|---|---|---|---|
| S01-S06 | simple | 100×6 | 100×6 | 100×6 |
| M01-M04 | media | 100×4 | 100×4 | 100×4 |
| H01 | dificil | 100 | 90 | 100 |
| H02 | dificil | 100 | 100 | 100 |
| H03 | dificil | 100 | 100 | 100 |
| H04 | dificil | 85 | 85 | 85 |
| X01 | integral | 100 | 100 | 100 |
| X02 | integral | 65 | 30 | 100 |
| X03 | integral | 100 | 90 | 100 |
| X04 | integral | 100 | 100 | 100 |
| U1-01 | ultra_i | 85 | 100 | 100 |
| U1-02 | ultra_i | 100 | 100 | 100 |
| U1-03 | ultra_i | 100 | 95 | 100 |
| U1-04 | ultra_i | 100 | 100 | 100 |
| U2-01 | ultra_ii | 85 | 60 | 85 |
| U2-02 | ultra_ii | 90 | 100 | 100 |
| **Total** | | **2310** | **2250** | **2370** |
| **Porcentaje** | | **96.2%** | **93.8%** | **98.8%** |

En cuanto al consumo de tokens, el modelo muestra una eficiencia notable:

| Modelo | Input | Razonamiento | Output | TotalOutput |
|---|---|---|---|---|
| WuQi-V3-Onyx-27B | 2,382,819 | 11,744 | 43,731 | 55,475 |
| Qwen3.8-27B | 3,038,830 | 85,305 | 48,910 | 134,215 |
| DeepSeekV4Flash (0731) | 334,784 | 88,894 | 87,006 | 175,900 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal en Q4_K_M ocupa 16.81 GB, el proyector multimodal f16 0.93 GB y el draft MTP Q4_0 2.01 GB. En total, se requieren aproximadamente 19.75 GB de VRAM para la configuracion completa.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A6000) para la configuracion completa con multimodal y especulacion. Para la version simplificada (modelo principal + mmproj), unos 18 GB pueden ser suficientes en una RTX 3090 o RTX 4090.
- Si cabe en consumer GPU: si, en GPUs de gama alta como RTX 3090 (24 GB), RTX 4090 (24 GB) o equivalentes.
- Opciones de despliegue: llama.cpp (llama-server) con soporte para mmproj y decodificacion especulativa; tambien puede usarse con otros runners compatibles con GGUF como Ollama.
- Latencia y throughput: no se proporcionan datos oficiales. La decodificacion especulativa con MTP deberia reducir la latencia de generacion respecto a la inferencia estandar, aunque no se cuantifica en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| WuQi-V3-Onyx-27B | 27B | 262k | Apache 2.0 | Agente multimodal, eficiencia de tokens |
| Qwen3.8-27B | 27B | 262k | Apache 2.0 | Base general multimodal |
| DeepSeekV4Flash (0731) | no disponible | no disponible | no disponible | Referencia en tareas agénticas |

En el benchmark propietario Alniyat-DSH-Bench-Basic, WuQi-V3-Onyx-27B supera a Qwen3.8-27B en puntuacion total (2310 vs 2250) y se acerca a DeepSeekV4Flash (2370), aunque con un consumo de tokens de razonamiento muy inferior (11,744 vs 85,305 vs 88,894). Su punto fuerte es la eficiencia en el gasto de tokens y el rendimiento en tareas de dificultad media y integral, aunque pierde frente a la referencia en tareas ultra complejas.

## Limitaciones y advertencias

- Es una version Preview (previa) del modelo, con la version "WuQi-V3-Onyx-27B-XXXIII_I", por lo que puede tener errores no corregidos.
- Entrenado principalmente con datos en chino; el rendimiento en otros idiomas no esta documentado.
- Los benchmarks publicados son propietarios (Alniyat-DSH-Bench-Basic) y no comparables con benchmarks estandarizados; no hay datos de MMLU, HumanEval, etc.
- La activacion de las capacidades del modelo requiere un prompt de sistema especifico; si el marco de despliegue (harness) sobreescribe el system prompt, puede perder el comportamiento optimizado.
- La cuantizacion Q4_K_M puede degradar la calidad en tareas de alta precision, aunque no se documenta el impacto.
- El modelo base Qwen3.8-27B es de Alibaba Cloud; el modelo derivado se publica bajo Apache 2.0, pero los derechos del base pertenecen a su creador.
- No se proporciona informacion sobre sesgos o riesgos de alucinacion especificos de este modelo.

## Enlaces

- Modelo GGUF: https://huggingface.co/Alniyat5f/WuQi-V3-Onyx-27b-GGUF
- Modelo base (safetensors): https://huggingface.co/Alniyat5f/WuQi-V3-Onyx-27B
- Perfil del autor en GitHub: https://github.com/Alniyat5f
- Repositorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
