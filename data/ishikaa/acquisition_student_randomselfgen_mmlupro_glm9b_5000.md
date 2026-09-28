# ishikaa/acquisition_student_randomselfgen_mmlupro_glm9b_5000

## Resumen

El modelo `ishikaa/acquisition_student_randomselfgen_mmlupro_glm9b_5000` es un ajuste fino de tipo "student" (probablemente destilación o entrenamiento supervisado sobre datos sintéticos) construido sobre una base de la familia GLM con aproximadamente 9.400 millones de parámetros. El identificador del repositorio sugiere que forma parte de un experimento de adquisición de datos ("acquisition") en el que se generan automáticamente ejemplos de entrenamiento ("randomselfgen") a partir del conjunto de evaluación MMLU-Pro, empleando un subconjunto de 5.000 muestras. Está publicado en Hugging Face por el usuario `ishikaa` con licencia y idiomas no declarados.

La relevancia de este modelo es principalmente de investigación: se enmarca en la línea de trabajo sobre selección y generación de datos de entrenamiento (data acquisition) para evaluar cómo distintos volúmenes de datos sintéticos afectan al rendimiento de un "student" sobre benchmarks de razonamiento. Existen variantes hermanas del mismo autor con bases Qwen (3B) y Llama (8B), lo que apunta a un estudio comparativo entre arquitecturas y tamaños.

La documentación publicada es la plantilla automática de Hugging Face, sin rellenar: no se especifican desarrollador, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Cualquier dato no listado aquí debe considerarse **no disponible**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican familia GLM; se desconoce si es transformer denso o MoE) |
| Parametros totales | 9.399.951.360 (9.4B, dato real de safetensors) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (los pesos se publican en safetensors, aptos para cuantizacion posterior) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, glm, text-generation, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada sobre la arquitectura interna mas alla del tag `glm`, que situa el modelo en la familia GLM (General Language Model) desarrollada originalmente por Tsinghua/THUDM. El numero de parametros (9,4B) es coherente con un modelo denso de escala 9B, pero no se puede confirmar ni el tipo de atencion, ni la ventana de contexto nativa, ni si emplea tecnicas como Grouped-Query Attention o decodificacion especulativa.

Respecto al entrenamiento, el nombre del repositorio aporta pistas pero no detalles verificables: "acquisition student" sugiere un regimen de destilacion o entrenamiento supervisado donde este modelo actua como alumno; "randomselfgen" apunta a generacion automatica de ejemplos por el propio modelo (self-generation) con un criterio de muestreo aleatorio; "mmlupro" indica que los datos derivan del benchmark MMLU-Pro; y "5000" probablemente refiere al numero de muestras o pasos utilizados. No se especifican tokens totales, composicion del dataset, ni si hubo RLHF o DPO. La referencia `arxiv:1910.09700` de los tags corresponde al articulo de Lacoste et al. (2019) sobre estimacion de impacto de carbono, no a un paper propio del modelo. Toda la informacion sobre entrenamiento debe considerarse **no disponible**.

## Capacidades

- Generacion de texto y respuesta conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto como modelo de chat/instrucciones.
- Razonamiento sobre preguntas de opcion multiple: por el sufijo `mmlupro`, esta orientado a tareas de comprension y razonamiento tipo benchmark academico.
- Herramientas de inferencia: compatible con `endpoints_compatible` (Hugging Face Inference Endpoints) y libreria `transformers`.
- Capacidades multilingues: **no disponible** (idiomas no declarados).
- Tool calling / function calling: **no disponible**.
- Soporte de agentes y razonamiento multi-paso: **no disponible**.
- Capacidades especiales (vision, audio, thinking mode): **no disponible**.

## Casos de uso

- **Investigacion sobre adquisicion de datos:** el modelo sirve como punto de comparacion en experimentos que miden como el tamano y la estrategia de generacion del conjunto de entrenamiento (aqui, 5.000 muestras de MMLU-Pro generadas aleatoriamente) afectan al rendimiento final. Es su uso mas probable dado el contexto del repositorio.
- **Evaluacion de tecnicas de destilacion:** al ser un "student" de 9,4B entrenado sobre datos derivados de MMLU-Pro, permite estudiar la transferencia de capacidad de un modelo mayor a uno menor en tareas de razonamiento academico.
- **Reproducibilidad de pipelines de generacion sintetica:** util para replicar el flujo "random self-generation" sobre otros benchmarks y comparar curvas de aprendizaje con las variantes Qwen (3B) y Llama (8B) del mismo autor.
- **Ajuste fino posterior para dominios academicos:** partiendo de estos pesos, se puede especializar el modelo en preguntas de examen, preparacion de oposiciones o tutoria educativa si se dispone de datos etiquetados adicionales.
- **Prototipado rapido de asistentes conversacionales:** con 9,4B parametros y pesos safetensors, cabe en GPUs de gama alta para pruebas de concepto de chatbot antes de escalar a modelos mayores.
- **Baseline en estudios comparativos de arquitecturas:** junto con las variantes `qwen3b_5000` y `llama8b_5000`, permite aislar el efecto de la arquitectura base manteniendo constante el regimen de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card mantiene todas las secciones de evaluacion con el marcador `[More Information Needed]` y no se han encontrado cifras en la busqueda web (los enlaces recuperados corresponden a modelos hermanos y al propio benchmark MMLU-Pro, no a este modelo).

## Requisitos de hardware

- **VRAM estimada para inferencia (9,4B parametros):**
  - FP16/BF16: ~18,8 GB de pesos + overhead de activaciones (tipicamente 22-26 GB totales).
  - INT8: ~9,4 GB de pesos (12-14 GB totales).
  - INT4: ~4,7-5,5 GB de pesos (6-8 GB totales).
- **GPU recomendadas:** A100 40/80 GB o H100 para FP16 con contexto largo; L40S o A6000 para INT8; RTX 4090 (24 GB) sufre en FP16 con contextos largos pero es viable en cuantizacion INT8/INT4.
- **Consumer GPU:** cabe en RTX 4090 (24 GB) en INT8/INT4; en RTX 3090 (24 GB) con cuantizacion; dificil en GPUs de 16 GB sin cuantizacion agresiva.
- **Opciones de despliegue:** al estar en formato transformers/safetensors, es compatible con vLLM, TGI, llama.cpp (tras conversion a GGUF) y Ollama (idem). No se aportan ficheros GGUF en el repositorio.
- **Latencia y throughput:** no disponible. El autor no publica mediciones de velocidad ni tiempos de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ishikaa/acquisition_student_randomselfgen_mmlupro_glm9b_5000` | 9,4B | GLM (familia) | MMLU-Pro, 5.000 muestras | no disponible | Hugging Face |
| `ishikaa/acquisition_student_randomselfgen_mmlupro_qwen3b_5000` | ~3,1B | Qwen | MMLU-Pro, 5.000 muestras | no disponible | Hugging Face / FriendliAI / Featherless |
| `ishikaa/acquisition_student_randomselfgen_alpaca_llama8b_5000` | ~8B | Llama | Alpaca, 5.000 muestras | no disponible | Hugging Face |

Los tres modelos comparten el mismo regimen experimental (student + 5.000 muestras) y difieren en arquitectura base y dataset de origen (MMLU-Pro frente a Alpaca). No hay datos publicados de rendimiento para ninguno de ellos, por lo que no es posible comparar calidad. Para alternativas consolidadas de tamano similar (por ejemplo GLM-9B original, Qwen2.5-7B o Llama-3.1-8B) tampoco se dispone de comparativa oficial contra este modelo.

## Limitaciones y advertencias

- **Documentacion practicamente inexistente:** la model card es la plantilla automatica de Hugging Face sin rellenar; no hay informacion sobre desarrollador, datos, sesgos ni uso previsto.
- **Licencia no declarada:** sin licencia explicita no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- **Riesgo elevado de alucinacion:** al tratarse probablemente de un "student" entrenado sobre un conjunto pequeno (5.000 muestras) de datos autogenerados, la calidad y la fidelidad factica no estan garantizadas y pueden degradarse fuera del dominio de MMLU-Pro.
- **Idiomas no especificados:** se desconoce si soporta castellano con calidad suficiente; es probable que el entrenamiento (si se basa en MMLU-Pro) sea predominantemente en ingles.
- **Contexto desconocido:** no se puede planificar su uso en escenarios de contexto largo sin confirmar la ventana nativa de la arquitectura GLM de base.
- **Naturaleza experimental:** el nombre del repositorio indica que es un artefacto de investigacion sobre adquisicion de datos, no un modelo final optimizado para produccion.
- **Sin garantias de soporte:** 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_mmlupro_glm9b_5000
- Variante Qwen 3B (hermana): https://huggingface.co/ishikaa/acquisition_student_randomselfgen_mmlupro_qwen3b_5000
- Variante Qwen 3B en FriendliAI: https://friendli.ai/models/ishikaa/acquisition_student_randomselfgen_mmlupro_qwen3b_5000
- Variante Qwen 3B en Featherless: https://featherless.ai/models/ishikaa/acquisition_student_randomselfgen_mmlupro_qwen3b_5000
- Variante Llama 8B sobre Alpaca: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_alpaca_llama8b_5000
- Benchmark MMLU-Pro (codigo y datos): https://github.com/TIGER-AI-Lab/MMLU-Pro
- Leaderboard MMLU-Pro (BenchLM.ai): https://benchlm.ai/benchmarks/mmlu-pro
- Referencia del tag arxiv:1910.09700 (Lacoste et al., 2019, impacto de carbono): https://arxiv.org/abs/1910.09700
