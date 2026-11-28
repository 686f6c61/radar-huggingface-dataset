# mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF

## Resumen

AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF es la cuantizacion en formato GGUF realizada por mradermacher del modelo AnomalyThink-Qwen3-VL-8B-KCR, desarrollado por el usuario aacudad. Se trata de un modelo vision-lenguaje de 8.190.735.360 parametros (~8,2 mil millones) construido sobre la arquitectura Qwen3-VL y especializado en deteccion de anomalias industriales y razonamiento (reasoning) sobre imagenes. El modelo original parte de la familia Qwen3-VL y ha sido afinado con el dataset AnomalyThink, orientado a tareas de inspeccion visual y diagnostico de defectos.

La relevancia de esta publicacion radica en que permite ejecutar un modelo vision-lenguaje de 8B especializado en deteccion de anomalias en hardware de consumo mediante llama.cpp y derivados, algo impracticable con los pesos originales en precision completa. La cuantizacion emplea el metodo i1 (imatrix) de mradermacher, que genera cuantizaciones ponderadas con una matriz de importancia para preservar mejor la calidad en tamanos reducidos.

El repositorio incluye un amplio abanico de cuantizaciones, desde IQ1_S (2,2 GB) hasta Q6_K (6,8 GB), lo que cubre desde escenarios con VRAM muy limitada hasta despliegues casi sin perdida de calidad. La licencia es Apache 2.0 y el modelo esta etiquetado unicamente para ingles. No se dispone de informacion publica sobre benchmarks ni sobre la longitud de contexto en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL (qwen3_vl) |
| Parametros totales | 8.190.735.360 (~8,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); fichero imatrix incluido para crear cuantizaciones propias |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imagenes y texto de forma conjunta. El sufijo "Think" en el nombre y la etiqueta "reasoning" indican que el afinamiento incorpora capacidades de razonamiento explicito antes de emitir la respuesta final. El modelo ha sido ajustado sobre el dataset AnomalyThink (aacudad/AnomalyThink), orientado a deteccion de anomalias industriales, aunque no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion de esta ficha concreta es la cuantizacion: mradermacher aplica el metodo i1 con matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye el fichero imatrix para que terceros puedan generar sus propias cuantizaciones. Al ser un modelo de vision, los ficheros mmproj necesarios para procesar imagenes se alojan en el repositorio de cuantizaciones estaticas (mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-GGUF), no en este repositorio i1.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes junto con instrucciones de texto y produce analisis razonados.
- Deteccion de anomalias industriales: identificacion y descripcion de defectos, irregularidades o elementos fuera de norma en imagenes de inspeccion.
- Razonamiento explicito (thinking): el modelo esta disenado para elaborar una cadena de razonamiento antes de la respuesta final.
- Descripcion y analisis de imagenes: interpretacion de contenido visual con justificacion textual.
- Conversacion multi-turno: etiquetado como "conversational", admite dialogos con contexto acumulado.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible", lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Inspeccion visual en lineas de produccion: el modelo puede analizar imagenes de piezas o productos capturadas por camaras industriales y describir en texto las anomalias detectadas, integrandose en un pipeline de control de calidad que derive las imagenes sospechosas al modelo para un diagnostico razonado.
- Mantenimiento predictivo asistido: a partir de fotografias de equipos (corrosion, fugas, desgaste), el modelo genera un informe textual con la anomalia observada y su posible causa, util para tecnicos que documentan incidencias.
- Triaje de imagenes medicas o tecnicas en entornos con recursos limitados: al caber en GPUs de consumo en cuantizaciones Q4, permite desplegar un analisis visual preliminar en estaciones de trabajo sin infraestructura de centro de datos.
- Generacion de informes de auditoria visual: el modo de razonamiento permite producir justificaciones detalladas de por que una imagen se clasifica como anomala, lo que facilita la trazabilidad en procesos certificados.
- Prototipado rapido de sistemas de vision-lenguaje: gracias a los multiples tamanos GGUF (desde 2,2 GB), un equipo puede validar la viabilidad de un caso de uso en un portatil antes de invertir en infraestructura mayor.
- Educacion y demostraciones: la cuantizacion IQ4_XS o Q4_K_M permite ejecutar el modelo en un portatil con GPU modesta para demostrar tecnicas de razonamiento multimodal en cursos o talleres.
- Procesamiento por lotes de imagenes en servidores sin GPU de gama alta: con llama.cpp en CPU o GPU consumer, se pueden procesar lotes de imagenes de inspeccion durante la noche con cuantizaciones Q4 o Q5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni mmproj): aproximadamente 2,2 GB (IQ1_S), 3,2 GB (IQ2_M), 4,0 GB (IQ3_M), 4,9 GB (Q4_K_S), 5,1 GB (Q4_K_M), 6,0 GB (Q5_K_M), 6,8 GB (Q6_K). A estos valores hay que sumar el fichero mmproj del codificador visual y la memoria para la cache KV, que depende de la longitud de contexto configurada.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 o superiores permiten cargar el modelo completo en VRAM. Para cuantizaciones IQ2/IQ3, una RTX 3050 de 8 GB o similar puede ser suficiente.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q6_K en GPUs con 8-12 GB de VRAM, siempre que se reserve espacio para el mmproj y el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros motores compatibles con GGUF. Para vision es imprescindible cargar tambien el fichero mmproj del repositorio estatico. vLLM y TGI no consumen GGUF de forma nativa en el momento de la publicacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF (este) | ~8,2B | no disponible | Deteccion de anomalias industriales con razonamiento | Apache 2.0 | GGUF (i1) |
| AnomalyThink-Qwen3-VL-8B-KCR (base) | ~8,2B | no disponible | Deteccion de anomalias industriales con razonamiento | Apache 2.0 | safetensors |
| AnomalyThink-Qwen3-VL-8B-KCR-GGUF (cuantizaciones estaticas) | ~8,2B | no disponible | Deteccion de anomalias industriales con razonamiento | Apache 2.0 | GGUF (estaticas) |
| Qwen3-VL-8B (modelo base de la familia) | ~8B | no disponible | Vision-lenguaje general | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la diferencia principal entre las tres primeras es el metodo de cuantizacion (i1 con imatrix frente a estaticas) y la ubicacion de los ficheros mmproj.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Al ser un modelo afinado para deteccion de anomalias, su comportamiento fuera de ese dominio puede degradarse respecto al Qwen3-VL base.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede describir defectos inexistentes o pasar por alto anomalias reales; no debe usarse como unico criterio en entornos de seguridad o calidad criticos sin validacion humana.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Para procesar imagenes es necesario descargar el fichero mmproj desde el repositorio de cuantizaciones estaticas, no incluido en este repositorio i1.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de robustez del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del dataset de entrenamiento, cuya documentacion no se ha proporcionado.
- El repositorio ocupa 96,4 GB en total por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-GGUF
- Modelo base: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-KCR
- Dataset de entrenamiento: https://huggingface.co/datasets/aacudad/AnomalyThink
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
