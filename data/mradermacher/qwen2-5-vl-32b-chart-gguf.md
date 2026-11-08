# mradermacher/Qwen2.5-VL-32B-Chart-GGUF

## Resumen
Qwen2.5-VL-32B-Chart-GGUF es una coleccion de cuantizaciones GGUF del modelo multimodal Qwen2.5-VL-32B-Chart, un ajuste fino del Qwen2.5-VL-32B-Instruct de Alibaba orientado especificamente a la comprension de graficos y diagramas (chart understanding). El modelo base fue publicado por el usuario yongxianwei en Hugging Face, y mradermacher se encarga unicamente de generar y distribuir los ficheros GGUF estaticos para inferencia local.

El modelo combina un backbone de lenguaje de aproximadamente 32.760 millones de parametros con un codificador visual, lo que le permite procesar imagenes y texto de forma conjunta. Con licencia Apache 2.0, esta pensado para desarrolladores que necesitan extraer, interpretar y razonar sobre informacion contenida en graficos de barras, lineas, tartas o tablas visuales sin depender de APIs en la nube.

La relevancia de esta ficha radica en que el formato GGUF abre el modelo a herramientas de inferencia local como llama.cpp u Ollama, aunque el tamano (entre 12,4 GB en Q2_K y 34,9 GB en Q8_0) lo situa fuera del alcance de GPUs de consumo convencionales en cuantizaciones de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Qwen2.5 + codificador visual) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen2.5-VL, que empareja un transformer de lenguaje con un codificador visual capaz de procesar imagenes de entrada y proyectarlas al espacio de tokens del modelo de lenguaje. El ajuste fino especifico (Qwen2.5-VL-32B-Chart) esta orientado a tareas de comprension de graficos, y los tags del repositorio indican que se empleo una tecnica de fusion de modelos (model-merging, optmerge) sobre el modelo base Qwen2.5-VL-32B.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en este ajuste concreto. Los ficheros GGUF son cuantizaciones estaticas generadas por mradermacher; segun la model card, no se han publicado cuantizaciones ponderadas/imatrix para este modelo en el momento de la ficha.

## Capacidades
- Comprension de graficos y diagramas: interpretacion de graficos de barras, lineas, sectores y otros formatos visuales habituales en informes y paneles.
- Generacion de texto y razonamiento multimodal: descripcion, resumen y respuesta a preguntas sobre imagenes con contenido grafico.
- Procesamiento de imagen y texto conjuntos gracias al codificador visual y a los ficheros mmproj.
- Capacidad conversacional multi-turno (tag conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en despliegues con API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran ingles (en); no se confirma soporte de otros idiomas.
- Modo thinking explicito, vision avanzada mas alla de graficos o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Extraccion de datos de informes financieros: el modelo puede recibir la imagen de un grafico de resultados trimestrales y devolver los valores numericos y tendencias en texto estructurado, util para automatizar la digitalizacion de reportes.
- Analisis de paneles de monitorizacion (dashboards): interpretacion de graficos de lineas y barras generados por herramientas de BI para responder preguntas del tipo "que metrica cayo mas en el ultimo trimestre".
- Generacion de resumenes automaticos de publicaciones cientificas: lectura de figuras y graficos incluidos en papers para producir descripciones textuales que acompanen el texto.
- Asistencia a analistas de datos: el modelo actua como interfaz conversacional sobre graficos pegados en el chat, permitiendo iterar preguntas sobre la misma imagen gracias al soporte multi-turno.
- Accesibilidad: conversion de graficos en descripciones textuales para usuarios con discapacidad visual, aprovechando la capacidad de describir la estructura y los datos de la figura.
- Verificacion de consistencia de informes: comparacion entre los valores declarados en el texto de un informe y los reflejados en sus graficos, detectando discrepancias.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en infraestructura propia sin enviar imagenes confidenciales a servicios externos, siempre que se disponga del hardware adecuado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 12,4 GB (Q2_K), 18,9 GB (Q4_K_S), 20,0 GB (Q4_K_M), 23,4 GB (Q5_K_M), 27,0 GB (Q6_K) y 34,9 GB (Q8_0), a los que hay que sumar el fichero mmproj (0,8 GB en Q8_0 o 1,5 GB en f16) y el espacio para el contexto KV.
- GPU recomendadas: para cuantizaciones altas (Q6_K, Q8_0) se necesita una GPU con 40-48 GB de VRAM, como A100 40 GB, A100 80 GB, H100 o L40S. Para Q4_K_M o Q5_K_M son viables tarjetas de 24 GB como la RTX 4090 o la RTX A6000, con margen limitado para contexto largo.
- GPU de consumo: las cuantizaciones Q2_K, Q3_K_S y Q3_K_M (12,4-16,0 GB) pueden intentarse en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti 16 GB, con riesgo de degradacion de calidad y de quedarse sin espacio para contexto extendido. En tarjetas de 8-12 GB no cabe en VRAM y requeriria descarga parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para el formato GGUF; el modelo base es compatible con transformers y, potencialmente, con vLLM o TGI en su version safetensors original.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-VL-32B-Chart (esta ficha) | 32,76 B | no disponible | Graficos + multimodal | Apache 2.0 | GGUF |
| Qwen2.5-VL-32B-Instruct | 32,76 B | no disponible | Multimodal general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-32B-Instruct-heretic | 32,76 B | no disponible | Multimodal con ajuste de rechazo reducido | Apache 2.0 | GGUF |

Las alternativas citadas comparten el mismo backbone de 32,76 mil millones de parametros y proceden del mismo linaje Qwen2.5-VL; la diferencia principal es el ajuste fino: la version Chart esta especializada en comprension de graficos, la Instruct es de proposito general y la heretic aplica un ajuste orientado a reducir respuestas de rechazo. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo esta especializado en comprension de graficos; su rendimiento en tareas generales de vision o de lenguaje puede ser inferior al del Qwen2.5-VL-32B-Instruct original, ya que el ajuste fino puede haber estrechado su distribucion de capacidades.
- Los metadatos solo declaran ingles; el soporte de castellano u otros idiomas no esta confirmado y podria degradarse.
- Riesgo de alucinacion en la lectura de valores numericos de graficos, especialmente con imagenes de baja resolucion o cuantizaciones agresivas (Q2_K, Q3_K_S).
- Las cuantizaciones por debajo de Q4 pueden introducir perdida de calidad perceptible; la propia model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K/Q8_0 como mejores en calidad.
- No se dispone de informacion sobre sesgos especificos del ajuste Chart.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL y del ajuste de yongxianwei antes de un despliegue en produccion.
- El repositorio ocupa 226,1 GB, por lo que la descarga completa requiere planificacion de almacenamiento; para uso real basta descargar una unica cuantizacion mas el mmproj correspondiente.
- No hay cuantizaciones ponderadas/imatrix disponibles segun la model card, lo que limita la optimizacion de calidad por tamano.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-32B-Chart-GGUF
- Modelo base del ajuste: https://huggingface.co/yongxianwei/Qwen2.5-VL-32B-Chart
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-VL-32B-Chart-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Variante Instruct en GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-32B-Instruct-GGUF
- Variante heretic en GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-32B-Instruct-heretic-GGUF
