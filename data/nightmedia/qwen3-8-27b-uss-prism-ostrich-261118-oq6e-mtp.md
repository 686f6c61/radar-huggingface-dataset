# nightmedia/Qwen3.8-27B-USS-Prism-Ostrich-261118-oQ6e-mtp

## Resumen

Qwen3.8-27B-USS-Prism-Ostrich-261118-oQ6e-mtp es un modelo de lenguaje multimodal experimental publicado por el usuario nightmedia en Hugging Face. Se trata de un merge de pesos (mediante herramientas de tipo mergekit) que combina dos linajes: por un lado, nightmedia/Qwen3.8-27B-USS-Prism, un modelo orientado a codigo, razonamiento agentico y uso de herramientas, y por otro, etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated, una variante "abliterated" (con el comportamiento de rechazo eliminado) entrenada sobre corpus de salud, nutricion, tecnologias de resistencia a la censura y habilidades practicas. El resultado es un modelo de aproximadamente 27.800 millones de parametros con pipeline declarado image-text-to-text.

El modelo se distribuye en una cuantizacion de 6 bits (sufijo oQ6e) con soporte MTP (multi-token prediction) y esta empaquetado en formato safetensors para la libreria transformers. La model card incluye mediciones internas del autor sobre tareas de comprension (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winograd) y sobre perplejidad, memoria pico y velocidad de generacion para distintas cuantizaciones, lo que permite comparar el impacto de la compresion sobre el rendimiento.

Su relevancia es acotada y de caracter experimental: agrupa muchas etiquetas de la familia Qwen (qwen3.5, qwen3.6, qwen3.8), destilacion de Claude, escritura creativa y roleplaying, pero no aporta documentacion tecnica detallada sobre el proceso de entrenamiento ni evaluaciones estandarizadas de razonamiento, codigo o matematicas. Es un artefacto de investigacion para usuarios que quieran explorar merges comunitarios sin filtros de rechazo, no un modelo recomendado para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, segun etiquetas y modelo base); detalles no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | etiquetas de 256k y 1M context; valor efectivo no verificado |
| Tipos de cuantizacion | 6 bits (oQ6e-mtp); la model card compara ademas q8-hi, mxfp8 y qx86-hi |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 23,9 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelos base | nightmedia/Qwen3.8-27B-USS-Prism; etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated |
| Descargas / likes | 223 / 2 |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura interna mas alla de las etiquetas de la model card, que apuntan a la familia Qwen3.8 (transformer denso de aproximadamente 27,8 B de parametros). El modelo es el resultado de un merge de pesos entre dos modelos base, realizado con herramientas de la familia mergekit segun las etiquetas, y posteriormente cuantizado a 6 bits en la variante oQ6e con soporte de multi-token prediction (MTP). No se especifica el numero de tokens de entrenamiento, la composicion del dataset del merge ni si hubo fases de RLHF o DPO sobre el resultado final.

Los componentes declarados aportan contexto sobre el origen de las capacidades: USS-Prism se presenta como un modelo orientado a codigo, razonamiento agentico y uso de herramientas, con un flujo de trabajo de leer, razonar, llamar herramientas, editar, probar, recuperar y entregar; Ostrich es una variante abliterated entrenada sobre salud y nutricion, ayuno y religion, tecnologias de resistencia a la censura (bitcoin, nostr), habilidades de tierra y vida practica, relaciones humanas y un corpus amplio de papers cientificos primarios. La model card menciona tambien otros componentes de un consorcio de merges (OneJev1.6, Qwopus3.8-27B-Coder-Flash, Seven-Brainwaves) sin aclarar cuales estan efectivamente integrados en este checkpoint concreto. No se documentan innovaciones tecnicas propias mas alla de la cuantizacion y el MTP.

## Capacidades

- Generacion de texto conversacional e instrucciones, con etiqueta explicita de instruction-tuned.
- Razonamiento con cadena de pensamiento larga (long-cot) y modo de razonamiento segun etiquetas.
- Generacion de codigo y trabajo de ingenieria de software, heredado del componente orientado a codigo.
- Uso de herramientas y razonamiento agentico multi-paso (tool calling, recuperacion de errores, edicion y prueba).
- Capacidades multimodales de entrada imagen-texto segun el pipeline declarado (image-text-to-text); no se detalla el soporte de video o audio.
- Matematicas y STEM, segun etiquetas.
- Multilingue limitado a en, zh, ja y es.
- Escritura creativa, ficcion, generacion de tramas y subtramas, continuacion de escenas y roleplaying.
- Comportamiento sin rechazo (abliterated): responde de forma directa a peticiones que otros modelos rechazarian.
- Contexto largo declarado de hasta 256k y 1M tokens (no verificado).

## Casos de uso

- Asistencia a la programacion en local: el modelo puede integrarse en un flujo de edicion de codigo con llamadas a herramientas y verificacion de resultados, aprovechando su orientacion a tareas de ingenieria de software y su contexto largo para mantener el estado de un repositorio.
- Agentes autonomos de refactorizacion: con soporte declarado de tool calling y razonamiento multi-paso, puede encadenar lectura de ficheros, edicion, ejecucion de tests y correccion de errores en pipelines de CI/CD, aunque requiere validacion humana por su naturaleza experimental.
- Generacion de ficcion y escritura creativa: las etiquetas de story generation, plot generation y scene continue lo orientan a la produccion de narrativa larga y coherente, apoyandose en ventanas de contexto amplias para mantener arcos argumentales.
- Roleplaying y simulacion de personajes: util para prototipos de experiencias conversacionales inmersivas, con la advertencia de que el comportamiento abliterated elimina filtros de rechazo.
- Consultas sobre salud, nutricion y habilidades practicas: el componente Ostrich fue entrenado sobre estos dominios, por lo que puede emplearse en prototipos de asistencia informativa, siempre con supervision profesional y sin sustituir consejo medico.
- Analisis de documentos e imagenes combinados: dado el pipeline image-text-to-text, puede emplearse para extraer informacion de capturas o fotografias junto a texto, por ejemplo en tareas de catalogacion o soporte tecnico.
- Experimentacion en investigacion sobre merges y cuantizacion: sirve como caso de estudio para medir el impacto de la cuantizacion a 6 bits y del MTP sobre perplejidad y velocidad, gracias a las tablas comparativas publicadas por el autor.

## Benchmarks y rendimiento

La model card incluye mediciones internas del autor (formato "brainwaves") sobre tareas de comprension y sobre eficiencia de inferencia. No se han publicado resultados de benchmarks estandarizados como MMLU, HumanEval o GSM8K en la informacion disponible.

Rendimiento en tareas de comprension (proporcion de acierto):

| Variante | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winograd |
|---|---|---|---|---|---|---|---|
| q8-hi | 0,735 | 0,897 | 0,919 | no disponible | no disponible | no disponible | no disponible |
| mxfp8 | 0,737 | 0,899 | 0,918 | 0,835 | 0,536 | 0,834 | 0,801 |
| qx86-hi | 0,735 | 0,899 | 0,918 | no disponible | no disponible | no disponible | no disponible |
| oQ6e-mtp (este modelo) | 0,735 | 0,898 | 0,918 | 0,832 | 0,540 | 0,833 | 0,792 |

Eficiencia de inferencia (modelo final frente al componente USS-Prism):

| Variante | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| q8-hi | 3,593 ± 0,021 | 37,16 GB | 218 |
| mxfp8 | 3,599 ± 0,021 | 34,64 GB | 200 |
| qx86-hi | 3,591 ± 0,021 | 33,15 GB | 207 |
| oQ6e-mtp | 3,593 ± 0,021 | 29,43 GB | 215 |
| USS-Prism bf16 (referencia) | 3,752 ± 0,023 | 60,70 GB | 256 |

## Requisitos de hardware

- Memoria pico medida para oQ6e-mtp: 29,43 GB, segun la model card. Es la cifra mas fiable para dimensionar el despliegue.
- En bf16, el componente USS-Prism requiere 60,70 GB de memoria pico, lo que exige GPU de 80 GB (A100, H100) o reparto en varias GPU.
- En 6 bits, una GPU de 32 GB (por ejemplo, una RTX 5090 o una V100 de 32 GB) queda al limite; se recomienda 40-48 GB (A100 40 GB, L40S, A6000) para margen de contexto.
- En consumer GPU de 24 GB (RTX 4090, RTX 3090) no cabe en la cuantizacion publicada; seria necesario un GGUF de 4 bits, no disponible en este repositorio.
- Opciones de despliegue: transformers con safetensors; el autor etiqueta compatibilidad con endpoints y con mlx. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama para este checkpoint.
- Rendimiento medido: 215 tokens/s en la variante oQ6e-mtp, frente a 256 tokens/s en bf16 del componente base, con un pico de memoria un 51 % inferior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-USS-Prism-Ostrich-261118-oQ6e-mtp | 27,8 B | 256k/1M (declarado) | Apache 2.0 | Merge experimental, 6 bits, MTP |
| nightmedia/Qwen3.8-27B-USS-Prism | no disponible | no disponible | no disponible | Componente base orientado a codigo y agentes; perplejidad 3,752 en bf16 |
| etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated | no disponible | no disponible | no disponible | Componente base abliterated, dominios de salud y habilidades practicas |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Modelo original de la familia; referencia de arquitectura segun la model card |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y origen.

## Limitaciones y advertencias

- Modelo experimental sin documentacion de entrenamiento: no se detallan tokens, dataset del merge ni fases de alineacion, lo que impide auditar su comportamiento.
- Comportamiento abliterated: el rechazo ha sido eliminado deliberadamente, por lo que puede generar contenido danino, ilegal o inseguro sin filtros; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion, especialmente en los dominios de salud, nutricion y ciencia del componente Ostrich, donde puede presentar afirmaciones con apariencia de autoridad sin respaldo.
- Contexto declarado de 256k y 1M tokens sin verificacion; el rendimiento real en ventanas muy largas puede degradarse.
- Soporte multilingue limitado a ingles, chino, japones y espanol; no se garantiza calidad en otros idiomas.
- Las etiquetas de la model card son muy heterogeneas y en parte contradictorias (mezcla de qwen3.5, qwen3.6 y qwen3.8, referencias a Claude 4.6 y a componentes que no constan como base), lo que dificulta determinar que capacidades estan realmente presentes.
- La licencia Apache 2.0 se declara en el repositorio, pero los modelos base podrian tener condiciones adicionales no verificadas; conviene revisar las licencias de los componentes antes de un uso comercial.
- Con solo 223 descargas y 2 likes, no existe validacion independiente de su calidad ni de su estabilidad.
- No cabe en GPU de consumo de 24 GB en la cuantizacion publicada, lo que limita su uso local sin cuantizaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism-Ostrich-261118-oQ6e-mtp
- Modelo base USS-Prism: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism
- Modelo base Ostrich abliterated: https://huggingface.co/etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated
- Modelo original de la familia (referencia): https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
