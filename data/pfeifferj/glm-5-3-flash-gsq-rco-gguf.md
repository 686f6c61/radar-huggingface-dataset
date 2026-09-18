# pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF

## Resumen

GLM-5.3-Flash-GSQ-RCO-GGUF es un repositorio de cuantizaciones GGUF no uniformes del modelo multimodal zai-org/GLM-5.3-Flash (~313.300 millones de parametros), publicado por el usuario pfeifferj como reproduccion independiente de la comunidad. El trabajo aplica dos metodos desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria: GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization). El objetivo es comprimir el checkpoint FP8 original de 328,3 GB hasta ficheros de 117,48 GB (3,0 bits) y 137,07 GB (3,5 bits) manteniendo la torre de vision mediante un proyector multimodal separado en BF16.

El repositorio resuelve un problema practico de despliegue: el checkpoint original en FP8 exige hardware de gama muy alta, mientras que estas variantes reducen el peso en disco y en VRAM entre un 58% y un 64% aproximadamente, a cambio de una degradacion medida y acotada. La evaluacion publicada muestra una perdida de 1,40 puntos porcentuales en MMLU-Pro para la variante de 3,5 bits y de 1,95 puntos para la de 3,0 bits, ambas frente a una referencia Q8_0 del mismo modelo.

Se trata de un modelo de pipeline image-text-to-text (vision + lenguaje), con licencia MIT, y es relevante ahora porque permite ejecutar un modelo multimodal de clase 300B+ en configuraciones multi-GPU de gama profesional o de entusiasta, algo inviable con el checkpoint original. La fecha de creacion del repositorio es el 13 de septiembre de 2026 y acumula 2.317 descargas y 11 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base zai-org/GLM-5.3-Flash; el checkpoint FP8 incluye una capa MTP, excluida en la referencia Q8_0) |
| Parametros totales | 313.326.811.966 (~313,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion MMLU-Pro se realizo con un limite de 2.048 tokens) |
| Tipos de cuantizacion | GGUF 3,5 bits (bpw 3,499816), GGUF 3,0 bits (bpw 2,999595), proyector multimodal mmproj en BF16 (bpw 16,52) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj GGUF independiente para vision |
| Pipeline | image-text-to-text (multimodal, vision) |
| Tamano del repositorio | 255,8 GB |
| Modelo base | zai-org/GLM-5.3-Flash |
| Relacion con el modelo base | quantized |

Ficheros disponibles:

| Fichero | bpw | Tamano | Notas |
|---|---:|---:|---|
| GLM-5.3-Flash-GSQ-RCO-3.5bit.gguf | 3,499816 | 137,07 GB | Mejor perplejidad de los dos |
| GLM-5.3-Flash-GSQ-RCO-3.0bit.gguf | 2,999595 | 117,48 GB | Mas pequeno |
| GLM-5.3-Flash-mmproj-BF16.gguf | 16,52 | 1,16 GB | Codificador de vision y proyector |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un modelo multimodal de aproximadamente 313.300 millones de parametros que acepta entradas de imagen y texto (image-text-to-text). La model card del repositorio no detalla la arquitectura interna del modelo base, por lo que no se dispone de informacion sobre si se trata de un transformer denso, un MoE, un modelo hibrido o sobre el numero de tokens de entrenamiento, la composicion del dataset o las etapas de alineacion (RLHF, DPO u otras). Solo se menciona que el checkpoint FP8 de origen incluye una capa MTP (multi-token prediction) que la referencia Q8_0 excluye por no utilizarse.

La innovacion tecnica de este repositorio no esta en el entrenamiento, sino en el proceso de cuantizacion post-entrenamiento, que combina dos metodos de DASLab. GSQ (Gumbel-Softmax Quantization, arXiv:2604.18556) realiza cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones a la rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax. RCO (Riemannian Constrained Optimization, arXiv:2605.00649) asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total exacto, reformulando el problema como una variedad riemanniana suave en el espacio de logits. El resultado es una mezcla de precisiones no uniforme por tensor, en lugar de un unico tipo de cuantizacion global. Ambas variantes se generaron con una compilacion modificada de llama.cpp (PR 27773 con el parche `native-f32-mmf.patch` y `NVIDIA_TF32_OVERRIDE=0 GGML_CUDA_MMF_F32_DISABLE=1`), que es tambien el entorno exigido para reproducir las evaluaciones.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con codificador de vision y proyector distribuidos aparte en BF16.
- Razonamiento y conocimiento general evaluado con MMLU-Pro: 60,55% (3,5 bits) y 60,00% (3,0 bits) frente al 61,95% de la referencia Q8_0.
- Seguimiento de instrucciones, evaluado con una muestra reducida de IFEval: 4/16 correctas completadas en 3,5 bits y 3,0 bits, y 2/16 en Q8_0; el recuento estricto fue 7/16 (3,5 bits) y 10/16 (3,0 bits) frente a 4/16 (Q8_0).
- Razonamiento matematico basico, evaluado con 8 elementos de GSM8K: 5/8 correctas completadas en las tres variantes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo de razonamiento explicito: la model card indica que la referencia Q8_0 emitio razonamiento en cinco casos durante la evaluacion, pero no se documenta un modo "thinking" configurable.

## Casos de uso

- Despliegue multimodal autoalojado: el modelo acepta pares imagen-texto y puede ejecutarse en infraestructura propia con llama.cpp, lo que permite construir asistentes que describen, resumen o responden preguntas sobre imagenes sin enviar datos a APIs externas.
- Analisis documental con imagenes: uso del fichero `mmproj` BF16 junto con los pesos cuantizados para extraer informacion de capturas, diagramas o documentos escaneados dentro de un pipeline interno.
- Evaluacion de tecnicas de cuantizacion: dado que el repositorio publica resultados comparativos entre 3,0 y 3,5 bits frente a Q8_0 (MMLU-Pro, perplejidad, KL aproximada, IFEval, GSM8K), sirve como caso de estudio reproducible para investigacion en compresion de modelos.
- Asistente conversacional de conocimiento general: con un 60% en MMLU-Pro, es adecuado para tareas de respuesta abierta que no exijan precision experta, manteniendo la conversacion en un unico contexto.
- Sustitucion del checkpoint FP8 en hardware limitado: permite migrar de 328,3 GB a 117,48-137,07 GB, habilitando el mismo modelo base en nodos con menos VRAM agregada.
- Prototipado de aplicaciones de razonamiento y matematicas basicas: el 5/8 en GSM8K sobre una muestra pequena sugiere utilidad para problemas aritmeticos sencillos, siempre con verificacion posterior.
- Custodia y privacidad de datos: al ejecutarse en local con licencia MIT, es apto para entornos con requisitos de residencia de datos donde no se permite el envio a servicios en la nube.

## Benchmarks y rendimiento

MMLU-Pro (sin razonamiento, limite de contexto de 2.048 tokens, 2.000 preguntas estratificadas en 14 categorias, zero-shot con log-probabilidades de respuestas de un solo token, sin plantilla de chat):

| Build | Precision | Error estandar | vs Q8_0 (emparejado) | Discordantes (Q8_0 acierta / build acierta) | p exacta |
|---|---:|---:|---:|---:|---:|
| Q8_0 (referencia) | 61,95% | 1,09 | - | - | - |
| GSQ-RCO 3,5 bits | 60,55% | 1,09 | -1,40 pp | 86 / 58 | 0,0241 |
| GSQ-RCO 3,0 bits | 60,00% | 1,10 | -1,95 pp | 128 / 89 | 0,00973 |

Aciertos absolutos: 1.239, 1.211 y 1.200 sobre 2.000. El azar se situa en el 11,2%. La variante de 3,5 bits supera a la de 3,0 bits en 0,55 pp (118 / 107 discordantes, p exacta = 0,505). Q8_0 y 3,5 bits coinciden en 1.739 predicciones. Los valores p son bilaterales y sin ajustar.

Desglose por categoria (Q8_0 / 3,5 bits / 3,0 bits):

| Categoria | n | Q8_0 | 3,5 bits | 3,0 bits |
|---|---:|---:|---:|---:|
| biology | 119 | 93,3% | 93,3% | 88,2% |
| business | 131 | 48,1% | 46,6% | 48,1% |
| chemistry | 188 | 45,2% | 44,7% | 41,5% |
| computer science | 68 | 76,5% | 76,5% | 75,0% |
| economics | 140 | 80,7% | 80,0% | 79,3% |
| engineering | 161 | 49,7% | 48,4% | 52,8% |
| health | 136 | 71,3% | 66,9% | 72,1% |
| history | 63 | 73,0% | 74,6% | 71,4% |
| law | 183 | 58,5% | 57,9% | 56,3% |
| math | 225 | 49,8% | 44,9% | 44,0% |
| other | 154 | 69,5% | 68,8% | 65,6% |
| philosophy | 83 | 66,3% | 69,9% | 71,1% |
| physics | 216 | 45,4% | 42,6% | 42,1% |
| psychology | 133 | 85,0% | 84,2% | 83,5% |

Perplejidad y generacion (perplejidad medida sobre ocho contextos de 1.024 tokens y 4.088 tokens puntuados; IFEval sobre 16 elementos y GSM8K sobre 8):

| Variante | bpw | GB | Perplejidad nativa (menor es mejor) | vs Q8_0 | KL aproximada (menor es mejor) | IFEval estricto | IFEval completadas correctas | GSM8K completadas correctas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 (referencia) | n/a | n/a | 3,3909 | - | - | 4/16 | 2/16 | 5/8 |
| GSQ-RCO 3,5 bits | 3,499816 | 137,07 | 3,5431 | +4,49% | 0,071346 | 7/16 | 4/16 | 5/8 |
| GSQ-RCO 3,0 bits | 2,999595 | 117,48 | 3,6985 | +9,07% | 0,142370 | 10/16 | 4/16 | 5/8 |

No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, MMLU completo, MATH, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para los pesos: 137,07 GB (variante 3,5 bits) y 117,48 GB (variante 3,0 bits), a los que hay que sumar 1,16 GB del proyector de vision en BF16 si se usa modo multimodal, mas la cache KV y el overhead del runtime.
- La evaluacion oficial se ejecuto en configuraciones de tres GPU (los ficheros de resultados se denominan `glm3.5-three-gpu.tsv` y `glm3-three-gpu.tsv`), lo que da una referencia realista del minimo practico.
- GPU recomendadas: nodos con 3 o mas aceleradores de 48-80 GB (A100 80 GB, H100 80 GB, L40S 48 GB o similares). Repartir 117-138 GB exige agregar al menos 2x80 GB en el mejor caso y, de forma comoda, 3x80 GB.
- Cabe en GPU de consumo: no en una sola unidad. Serian necesarias aproximadamente 6 GPU de 24 GB (RTX 3090, RTX 4090) para alojar los pesos de la variante de 3,0 bits, sin contar cache KV ni overhead, por lo que no es una configuracion practica para la mayoria de usuarios domicialiarios.
- Opciones de despliegue: llama.cpp compilado desde el PR 27773 con el parche `native-f32-mmf.patch` y las variables `NVIDIA_TF32_OVERRIDE=0` y `GGML_CUDA_MMF_F32_DISABLE=1`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada. La unica referencia cuantitativa es el propio modelo base y su conversion Q8_0:

| Version | Parametros | Tamano | MMLU-Pro | Perplejidad | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| GLM-5.3-Flash (FP8 original) | ~313,3 mil millones | 328,3 GB | no disponible | no disponible | no disponible en esta informacion | zai-org/GLM-5.3-Flash |
| GLM-5.3-Flash Q8_0 (referencia de evaluacion) | ~313,3 mil millones | no disponible | 61,95% | 3,3909 | no disponible en esta informacion | generada para la evaluacion, no listada como fichero del repositorio |
| GSQ-RCO 3,5 bits | ~313,3 mil millones | 137,07 GB | 60,55% | 3,5431 | MIT | pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF |
| GSQ-RCO 3,0 bits | ~313,3 mil millones | 117,48 GB | 60,00% | 3,6985 | MIT | pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Degradacion medible por cuantizacion: la variante de 3,5 bits pierde 1,40 pp en MMLU-Pro y aumenta la perplejidad un 4,49% (KL 0,071346); la de 3,0 bits pierde 1,95 pp, con un 9,07% mas de perplejidad (KL 0,142370). En matematicas la caida es mayor: de 49,8% a 44,9% (3,5 bits) y 44,0% (3,0 bits).
- La diferencia entre 3,5 y 3,0 bits en MMLU-Pro (0,55 pp, p = 0,505) no es estadisticamente significativa, pero si lo es la caida frente a Q8_0 en ambas variantes.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; no hay evaluaciones de fidelidad factual ni de tasas de alucinacion.
- Sesgos conocidos: no documentados en la model card. La evaluacion MMLU-Pro sugiere un rendimiento desigual por disciplina (biologia y psicologia por encima del 84%, matematicas y fisica por debajo del 50%), lo que puede traducirse en respuestas menos fiables en dominios cientificos cuantitativos.
- Limitacion de contexto en la evaluacion: los resultados de MMLU-Pro se obtuvieron con un limite de 2.048 tokens y sin plantilla de chat, por lo que no reflejan el comportamiento en conversaciones largas ni con contexto extendido.
- Muestras de evaluacion muy reducidas: IFEval con 16 elementos y GSM8K con 8, lo que limita severamente la potencia estadistica de esas cifras.
- El proyector de vision no se cuantiza: el fichero `mmproj` se distribuye en BF16 (1,16 GB), por lo que el camino multimodal no hereda la compresion de los pesos de lenguaje.
- Requisito de runtime especifico: la evaluacion exige un PR concreto de llama.cpp (27773) y un parche propio; no esta garantizado el funcionamiento identico en versiones estables ni en otros motores de inferencia.
- Reproduccion no oficial: el autor declara explicitamente que no es una publicacion de IST-DASLab y que no cuenta con el respaldo de los autores de los articulos de GSQ ni de RCO.
- Licencia: el repositorio declara MIT, pero no se detalla en la informacion proporcionada la licencia del modelo base zai-org/GLM-5.3-Flash; conviene verificarla antes de un uso comercial, ya que las condiciones del modelo original pueden imponer restricciones adicionales.
- Idiomas soportados no declarados: no es posible confirmar la cobertura multilingue ni la calidad en castellano.
- El repositorio ocupa 255,8 GB, por lo que la descarga y el almacenamiento requieren planificacion de disco importante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab en GitHub: https://github.com/IST-DASLab
- DOI asociado al repositorio: doi:10.57967/hf/10400
