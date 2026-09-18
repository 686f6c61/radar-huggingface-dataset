# mradermacher/FlashModel-Qwen3.5-9B-GGUF

## Resumen

FlashModel-Qwen3.5-9B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo flashback2k/FlashModel-Qwen3.5-9B, publicado por el usuario mradermacher, especializado en la generacion de versiones cuantizadas de modelos abiertos. El modelo subyacente es un transformer denso de aproximadamente 8.953.803.264 parametros (unos 8,95 mil millones) construido sobre la familia Qwen3.5 y afinado mediante SFT y LoRA, con un enfasis explicito en razonamiento, uso de herramientas (tool calling) e instrucciones.

La relevancia de esta publicacion es practica: el repositorio original solo distribuye pesos en precision completa, mientras que esta version ofrece doce variantes GGUF que van desde 3,9 GB (Q2_K) hasta 18,0 GB (f16), lo que permite ejecutar el modelo en GPU de consumo e incluso en CPU. El modelo se ha entrenado sobre cinco datasets SFT de NVIDIA pertenecientes a la coleccion Nemotron, cubriendo matematicas, programacion competitiva, agentes, seguimiento de instrucciones y ciencia.

Se trata de un modelo orientado a un unico idioma, el ingles, con licencia Apache 2.0 declarada, aunque el enlace de licencia apunta al fichero LICENSE del modelo Qwen3.5-9B, un detalle que conviene verificar antes de un uso comercial. La model card del repositorio GGUF es una plantilla generada automaticamente por el autor de las cuantizaciones y no aporta informacion sobre arquitectura, contexto o datos de entrenamiento mas alla de los metadatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen3.5; no se especifica en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor de las cuantizaciones | mradermacher |
| Modelo base | flashback2k/FlashModel-Qwen3.5-9B |
| Tamano del repositorio | 81,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 17 de septiembre de 2026 |
| Ultima actualizacion | 17 de septiembre de 2026 |
| Libreria declarada | transformers |
| Compatibilidad declarada | endpoints_compatible |
| Cuantizaciones ponderadas (imatrix) | no disponibles en el momento de la publicacion |

Tabla de ficheros GGUF publicados, ordenados por tamano:

| Fichero | Tipo | Tamano (GB) | Notas del autor |
|---|---|---|---|
| FlashModel-Qwen3.5-9B.Q2_K.gguf | Q2_K | 3,9 | sin notas |
| FlashModel-Qwen3.5-9B.Q3_K_S.gguf | Q3_K_S | 4,4 | sin notas |
| FlashModel-Qwen3.5-9B.Q3_K_M.gguf | Q3_K_M | 4,7 | calidad inferior |
| FlashModel-Qwen3.5-9B.Q3_K_L.gguf | Q3_K_L | 5,0 | sin notas |
| FlashModel-Qwen3.5-9B.IQ4_XS.gguf | IQ4_XS | 5,3 | sin notas |
| FlashModel-Qwen3.5-9B.Q4_K_S.gguf | Q4_K_S | 5,5 | rapido, recomendado |
| FlashModel-Qwen3.5-9B.Q4_K_M.gguf | Q4_K_M | 5,7 | rapido, recomendado |
| FlashModel-Qwen3.5-9B.Q5_K_S.gguf | Q5_K_S | 6,4 | sin notas |
| FlashModel-Qwen3.5-9B.Q5_K_M.gguf | Q5_K_M | 6,6 | sin notas |
| FlashModel-Qwen3.5-9B.Q6_K.gguf | Q6_K | 7,5 | muy buena calidad |
| FlashModel-Qwen3.5-9B.Q8_0.gguf | Q8_0 | 9,6 | rapido, mejor calidad |
| FlashModel-Qwen3.5-9B.f16.gguf | f16 | 18,0 | 16 bits por peso, sobredimensionado |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Los metadatos indican que se trata de un derivado de la familia Qwen3.5, con 8.953.803.264 parametros totales segun el fichero safetensors del modelo base. La etiqueta `qwen3.5` aparece entre las etiquetas del repositorio, y el nombre del modelo incluye explicitamente "Qwen3.5-9B". No se especifica si emplea atencion estandar, atencion lineal, decodificacion especulativa ni ninguna otra innovacion de inferencia.

En cuanto al entrenamiento, las etiquetas del repositorio indican un proceso de destilacion (`distillation`), ajuste supervisado (`sft`) y uso de adaptadores LoRA (`lora`) sobre el modelo base. Los conjuntos de datos declarados son cinco colecciones SFT de NVIDIA: Nemotron-SFT-Math-v4, Nemotron-SFT-Competitive-Programming-v2, Nemotron-SFT-Agentic-v2, Nemotron-SFT-Instruction-Following-Chat-v3 y Nemotron-SFT-Science-v2. No se indica el numero de tokens de entrenamiento, la composicion exacta de las mezclas, ni si se aplico RLHF, DPO u otra fase de alineacion posterior al SFT.

El proceso de cuantizacion realizado por mradermacher corresponde a cuantizaciones estaticas (etiquetas internas `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). No se han publicado todavia cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano en tipos de bits bajos.

## Capacidades

- Generacion de texto conversacional: el modelo usa una plantilla de chat (etiqueta `conversational`) y esta afinado sobre datos de seguimiento de instrucciones.
- Razonamiento explicito: la etiqueta `reasoning` y el nombre de la familia sugieren soporte de modos de razonamiento, aunque la informacion proporcionada no describe el formato exacto ni si existe un modo "thinking" separado.
- Uso de herramientas y function calling: la etiqueta `tool-calling` y el dataset Nemotron-SFT-Agentic-v2 indican entrenamiento especifico para invocacion de herramientas.
- Razonamiento multi-paso y agentes: la inclusion del dataset agentico de NVIDIA apunta a flujos de varios pasos con llamadas a herramientas.
- Matematicas: entrenado sobre Nemotron-SFT-Math-v4.
- Programacion competitiva: entrenado sobre Nemotron-SFT-Competitive-Programming-v2.
- Ciencia: entrenado sobre Nemotron-SFT-Science-v2.
- Multilingue: no disponible; la unica lengua declarada es el ingles.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno en ingles y generar respuestas coherentes dentro de un turno de chat. La longitud de contexto no esta documentada, por lo que habria que medirla empiricamente antes de disenar flujos con historiales largos.
- Agentes con llamada a herramientas: gracias al entrenamiento sobre Nemotron-SFT-Agentic-v2 y a la etiqueta `tool-calling`, es adecuado para construir agentes que consulten APIs, bases de datos o servicios internos mediante esquemas JSON de funciones.
- Generacion de codigo asistida: el ajuste sobre datos de programacion competitiva lo hace util para autocompletado, generacion de funciones y resolucion de problemas algoritmicos en entornos de desarrollo integrado.
- Tutoria y resolucion de problemas matematicos: el entrenamiento sobre Nemotron-SFT-Math-v4 permite usarlo en asistentes educativos que expliquen el razonamiento paso a paso.
- Analisis y divulgacion cientifica: el ajuste sobre Nemotron-SFT-Science-v2 lo orienta a tareas de explicacion de conceptos, resumen de articulos o generacion de material didactico tecnico.
- Despliegue en local con recursos limitados: las variantes Q4_K_M (5,7 GB) y Q4_K_S (5,5 GB), marcadas como recomendadas por el autor, permiten ejecutar el modelo en portatiles con GPU de gama media o directamente sobre CPU mediante llama.cpp.
- Prototipado rapido en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q5 y Q6 ofrecen un equilibrio entre calidad y consumo de memoria para equipos con 8-12 GB de VRAM.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye doce variantes del mismo modelo, lo que resulta util para medir la degradacion de calidad y perplexidad entre tipos de cuantizacion en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF es una plantilla generada automaticamente y no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. Tampoco se proporcionan datos de perplexidad comparativos entre las distintas cuantizaciones, mas alla de las notas cualitativas del autor sobre calidad y velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamano real de cada fichero (el consumo final depende de la longitud de contexto y del backend):
  - Q2_K: unos 3,9 GB de pesos.
  - Q3_K_S / Q3_K_M / Q3_K_L: entre 4,4 y 5,0 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: entre 5,3 y 5,7 GB.
  - Q5_K_S / Q5_K_M: entre 6,4 y 6,6 GB.
  - Q6_K: 7,5 GB.
  - Q8_0: 9,6 GB.
  - f16: 18,0 GB.
- GPU de consumo: las variantes Q4 y Q5 caben con holgura en GPU con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) si se reserva margen para el contexto. La variante Q6_K encaja en 10-12 GB (RTX 3080 10 GB, RTX 3060 12 GB). Q8_0 requiere 12-16 GB (RTX 4080, RTX 4070 Ti Super) y f16 exige 24 GB o reparto entre GPU y CPU (RTX 3090, RTX 4090).
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son adecuadas para servir el modelo en precision alta con lotes grandes; en estos casos el cuello de botella pasa a ser el ancho de banda de memoria y no la capacidad.
- Ejecucion en CPU: las variantes Q2_K a Q4_K_M son viables con llama.cpp sobre CPU con 8-16 GB de RAM, con velocidades de generacion del orden de unos pocos tokens por segundo segun el procesador. No se han publicado mediciones concretas de throughput ni latencia.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, text-generation-webui) son los caminos naturales para los ficheros GGUF. Para servir con GPU y alta concurrencia, vLLM y TGI soportan GGUF de forma experimental, aunque lo habitual es partir del modelo base en safetensors para esos backends.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlashModel-Qwen3.5-9B-GGUF (este repositorio) | 8,95 B | no disponible | GGUF (12 variantes) | apache-2.0 (enlace de licencia apunta a Qwen3.5-9B) | Publicado, 0 descargas |
| FlashModel-Qwen3.5-9B (modelo base) | 8,95 B | no disponible | safetensors | apache-2.0 | Publicado por flashback2k |
| Otros modelos de ~9 B de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de resultados de benchmarks que permitan establecer una comparacion cuantitativa con alternativas de la misma categoria o tamano. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles. No hay evidencia de capacidades multilingues, por lo que su uso en castellano u otros idiomas no esta respaldado por la informacion disponible.
- Ambiguedad de licencia: los metadatos declaran apache-2.0, pero el enlace de licencia del modelo base apunta a https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE. Conviene verificar los terminos reales aplicables antes de un despliegue comercial.
- Datos de entrenamiento incompletos: no se especifican volumen de tokens, composicion exacta de las mezclas ni procesos de alineacion posteriores al SFT, lo que dificulta evaluar sesgos y comportamientos indeseados.
- Riesgo de alucinacion: como cualquier modelo generativo afinado por SFT, puede producir informacion falsa con apariencia de veracidad, especialmente en dominios cientificos o matematicos fuera de la distribucion de los datasets Nemotron.
- Degradacion por cuantizacion: las variantes de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) presentan perdidas de calidad notables. El propio autor marca Q3_K_M como "calidad inferior" y reserva las recomendaciones para Q4_K_S y Q4_K_M.
- Ausencia de cuantizaciones imatrix: no hay versiones ponderadas, que suelen mejorar la relacion calidad/tamano en bits bajos. No esta confirmado que el autor las vaya a publicar.
- Contexto no documentado: al desconocerse la longitud de contexto soportada, no se pueden disenar con garantias aplicaciones que dependan de ventanas largas.
- Sin benchmarks publicos: no existen datos de evaluacion que permitan estimar el rendimiento real frente a otros modelos de ~9 B.
- Repositorio reciente y sin traccion: 0 descargas y 0 likes en la fecha de creacion, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Plantilla de prompt: al ser un repositorio de cuantizaciones, no incluye instrucciones de uso especificas del chat template; es necesario consultar el repositorio del modelo base para conocerlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FlashModel-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/flashback2k/FlashModel-Qwen3.5-9B
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#FlashModel-Qwen3.5-9B-GGUF
- Licencia referenciada en los metadatos: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset Nemotron-SFT-Competitive-Programming-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Competitive-Programming-v2
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset Nemotron-SFT-Instruction-Following-Chat-v3: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v3
- Dataset Nemotron-SFT-Science-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Science-v2
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a servicios de diseno grafico sin relacion con el repositorio).
