# sergolsub/d3-v3.1.0-27B-MLX-4bit

## Resumen

`sergolsub/d3-v3.1.0-27B-MLX-4bit` es una conversión a 4 bits en formato MLX del modelo `vllm-sr/d3`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: la model card indica explícitamente que la conversión solo aplica cuantización afín de 4 bits (partiendo de una conversión previa a 8 bits, con dequantize y requantize sobre el mismo tamaño de grupo), sin reentrenamiento ni cambios de arquitectura. El resultado es un checkpoint de aproximadamente 26.085 millones de parámetros (unos 26B) que ocupa 14,9 GB en disco.

El modelo base, `vllm-sr/d3`, aparece etiquetado en Hugging Face con la arquitectura `qwen3_5` y requiere código personalizado (`custom_code`), lo que sugiere una variante del transformer Qwen con cabeceras específicas. La model card describe un modo de inferencia orientado a la toma de decisiones estructuradas: el objeto `D3` expone un método `decide()` que recibe un texto y un esquema de tareas con tipos `noul` (sí/no), `choice` (elección entre criterios) y `score` (puntuación sobre una escala), devolviendo una decisión por tarea. Esto lo aleja del uso como chatbot generativo convencional y lo acerca a la clasificación y el enrutamiento dentro de pipelines.

Su relevancia es acotada pero concreta: es una de las pocas conversiones MLX publicadas de este modelo base, permite ejecutar un modelo de 26B en un Mac con 48 GB de memoria unificada y ofrece métricas de calidad medidas tras la cuantización, algo poco habitual en repositorios derivados. La licencia Apache 2.0 se hereda del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5` en Hugging Face, requiere `custom_code`); no se detalla la variante exacta |
| Parametros totales | 26.085.330.160 (≈26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX (grupo del mismo tamaño que la conversión a 8 bits de origen); existe una conversión a 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `vllm-sr/d3`; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, 25 shards; incluye `config.json`, tokenizer, `chat_template.jinja`, `d3_mlx.py`, `decision_config.json`, `joint_config.json`, `readout.safetensors` y `kl_audit.json` |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo base `vllm-sr/d3`: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí se conoce es la arquitectura declarada en los metadatos: un transformer etiquetado como `qwen3_5` que requiere código personalizado, lo que implica que no se carga con una clase estándar de `transformers` sin el módulo auxiliar. El repositorio incluye un fichero `d3_mlx.py` de unos 40 KB que actúa como cargador e implementa la lógica de inferencia, junto con `decision_config.json` y `joint_config.json` para las cabeceras de decisión.

La innovación técnica destacable de esta publicación no está en el modelo, sino en el proceso de conversión y su verificación. El autor parte de su propia conversión a 8 bits, dequantiza y requantiza a 4 bits afín manteniendo el tamaño de grupo, y publica una auditoría de divergencia KL (`kl_audit.json`, 107 KB) junto con métricas de calidad comparadas entre 4 bits y bf16 sobre el mismo conjunto de evaluación. También incluye sumas SHA-256 de todos los ficheros del repositorio para verificar descargas. No hay decodificación especulativa, atención lineal ni mecanismos híbridos documentados.

## Capacidades

- Toma de decisiones estructuradas: el método `decide()` resuelve tareas tipadas sobre un texto de entrada, con salidas de tipo `noul` (booleano), `choice` (selección entre criterios con descripción) y `score` (puntuación sobre una lista ordenada de niveles).
- Enrutamiento y clasificación: la model card muestra ejemplos de asignación a equipos (`billing` frente a `shipping`) y de evaluación de severidad (`cosmetic`, `annoying`, `blocks`), lo que encaja con triaje automático.
- Procesamiento de varios campos por llamada: el esquema de decisión admite varias tareas en un mismo objeto, aunque la documentación recomienda una llamada separada por tipo de tarea.
- Comprensión de texto en inglés: todos los ejemplos de la model card están en inglés; no se declaran idiomas soportados.
- Capacidades multimodales: el repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`, lo que sugiere que el modelo base contempla entrada de imagen y vídeo, pero no se documenta su uso en esta conversión.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni generación de texto libre.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada incidencia entrante en un equipo (facturación, envíos, técnico) mediante una tarea `choice` con criterios descritos; el modelo devuelve la etiqueta y permite enrutar automáticamente en un helpdesk.
- Detección de intención de reembolso: aplicar una tarea `noul` sobre el texto del cliente para decidir si solicita un reembolso, como primer filtro antes de escalar a un agente humano.
- Priorización de incidencias de infraestructura: usar una tarea `score` con niveles como `cosmetic`, `annoying` y `blocks` para ordenar alertas de un sistema de monitorización según su impacto real.
- Moderación y control de calidad en pipelines de datos: puntuar la gravedad de errores detectados en procesos ETL (por ejemplo, cuota de disco excedida en un worker) y decidir si requieren intervención inmediata.
- Enrutamiento en asistentes conversacionales: como clasificador previo que decide qué sub-agente o herramienta debe atender una consulta, reduciendo el coste frente a enviar todo el tráfico a un modelo generativo grande.
- Inferencia local en estaciones de trabajo Apple: prototipado y validación de flujos de decisión en un Mac mini M4 Pro con 48 GB, sin depender de GPU dedicada ni de servicios en la nube, gracias al formato MLX y a los 15,5 GB de memoria residente máxima medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de su propia evaluación interna y de rendimiento en hardware concreto:

| Metrica | Valor |
|---|---|
| Precision global (eval propia), 4 bits | 87,8 % |
| Precision global (eval propia), bf16 | 88,9 % |
| `noul`, 4 bits / bf16 | 85,0 % / 87,5 % |
| `choice`, 4 bits / bf16 | 96,0 % / 96,0 % |
| `score`, 4 bits / bf16 | 84,0 % / 84,0 % |
| Perplejidad de calibración, 4 bits / bf16 | 1,959 / 1,977 |
| Tamano en disco | 14,87 GB |
| Tiempo de carga (Mac mini M4 Pro 48 GB) | 7,42 s |
| Memoria residente maxima | 15,52 GB |
| Latencia de decisión (mediana) | 2.114 ms |
| Throughput sostenido | 0,71 decisiones cortas/s |

## Requisitos de hardware

- VRAM o memoria unificada: al menos 15,5 GB de memoria residente máxima medida; en la práctica se recomienda un equipo con 24 GB o más para dejar margen al sistema y al tokenizer.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada, con 14,87 GB en disco y carga en 7,42 s.
- GPU dedicadas: no se documenta soporte para CUDA en esta conversión; el formato es MLX, orientado a Apple Silicon. Para GPU NVIDIA habría que usar los pesos originales de `vllm-sr/d3` u otra conversión.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en equipos Apple con memoria unificada de 24 GB o más; no se ha validado en RTX 4090 ni similares con este repositorio.
- Opciones de despliegue: `mlx_lm` con el cargador `d3_mlx.py` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: mediana de 2.114 ms por decisión y 0,71 decisiones cortas por segundo en el hardware citado; son cifras de decisión estructurada, no de generación de texto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `sergolsub/d3-v3.1.0-27B-MLX-4bit` | ≈26B | no disponible | safetensors MLX 4 bits | Apache 2.0 | Conversion 4 bits con metricas de calidad publicadas |
| `sergolsub/mlx-d3-v3.1.0-27B-4bit` | ≈26B | no disponible | safetensors MLX 4 bits | Apache 2.0 | Publicacion hermana del mismo autor; no se detalla la diferencia respecto a esta |
| `sergolsub/mlx-d3-turbo-27B` | ≈27B | no disponible | safetensors MLX | Apache 2.0 | Variante "turbo" del mismo autor sobre el modelo d3 |
| `sergolsub/mlx-mammoth-v1-27B` | 27,4B | no disponible | safetensors MLX | no disponible | Otro modelo del mismo autor, con 365 descargas acumuladas |
| `vllm-sr/d3` (original) | ≈26B | no disponible | safetensors | Apache 2.0 | Pesos upstream sin cuantizar; referencia de calidad bf16 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado, no original: cualquier limitación del modelo base `vllm-sr/d3` se hereda; la model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Cuantización con pérdida: la precisión global cae del 88,9 % al 87,8 % y la tarea `noul` baja del 87,5 % al 85,0 %; en flujos donde los falsos negativos o positivos sean críticos, conviene validar contra la versión bf16.
- Idiomas no declarados: todos los ejemplos están en inglés y no se especifica cobertura multilingüe; el uso en castellano no está validado.
- Contexto desconocido: no se publica la longitud máxima de contexto, lo que impide planificar el tamaño de las entradas en producción.
- Uso restringido en la práctica: la interfaz documentada es de decisión estructurada, no de generación libre; no se garantiza un comportamiento correcto como chatbot.
- Riesgo de alucinación en tareas fuera de distribución: al no haber datos de evaluación más allá del conjunto propio del autor, no se puede acotar el comportamiento ante esquemas de decisión novedosos.
- Dependencia de código personalizado: requiere cargar `d3_mlx.py` desde la ruta de descarga, lo que añade superficie de fallo y complica el despliegue en entornos gestionados.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar `vllm-sr/d3` antes de production.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-v3.1.0-27B-MLX-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3
- Conversión hermana: https://huggingface.co/sergolsub/mlx-d3-v3.1.0-27B-4bit
- Variante turbo: https://huggingface.co/sergolsub/mlx-d3-turbo-27B
- Otro modelo del autor: https://huggingface.co/sergolsub/mlx-mammoth-v1-27B
- Estadísticas de `mlx-mammoth-v1-27B`: https://openmodelstats.com/models/sergolsub/mlx-mammoth-v1-27b
