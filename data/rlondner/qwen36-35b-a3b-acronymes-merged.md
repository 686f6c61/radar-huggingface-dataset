# rlondner/qwen36-35b-a3b-acronymes-merged

## Resumen

`rlondner/qwen36-35b-a3b-acronymes-merged` es un checkpoint multimodal publicado en Hugging Face por el usuario rlondner, construido a partir de la familia Qwen3.6 en su variante dispersa 35B-A3B. El sufijo "acronymes-merged" sugiere un merge de pesos (probablemente de un fine-tuning orientado a acronimos, con grafia francesa en el nombre) sobre el modelo base, aunque el autor no documenta el proceso: la model card es la plantilla autogenerada de transformers y no contiene ninguna seccion completada.

El modelo tiene 35.107.181.936 parametros totales segun los tensores en safetensors, con un regimen de mezcla de expertos dispersa (la nomenclatura A3B implica del orden de 3.000 millones de parametros activos por token). La etiqueta de arquitectura del repo es `qwen3_5_moe` y el pipeline declarado es `image-text-to-text`, lo que confirma que conserva el codificador visual del modelo base y procesa entradas imagen y texto.

Su relevancia practica es limitada como artefacto aislado: no tiene descargas ni likes, no declara licencia ni idiomas, y no publica evaluaciones. Resulta util como referencia de la arquitectura Qwen3.6 35B-A3B (hibrida de Gated DeltaNet y Gated Attention con enrutado MoE disperso) y como ejemplo de merge comunitario, pero para produccion conviene partir del checkpoint oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos dispersa (tag del repo: `qwen3_5_moe`); la familia base Qwen3.6 combina Gated DeltaNet y Gated Attention, con codificador visual |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible con precision; la nomenclatura A3B del modelo base implica ~3 B activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo solo publica safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo vacio en el repo) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 210,7 GB |
| Modalidad | image-text-to-text (multimodal entrada imagen + texto) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.6 35B-A3B, el primer modelo de pesos abiertos de la serie Qwen3.6 de Alibaba Cloud. Combina capas de atencion con compuertas (Gated Attention) y capas de Gated DeltaNet, un mecanismo de estado recurrente lineal que reduce el coste de contexto largo frente a la atencion completa, y las intercala con enrutado MoE disperso: 35 B de parametros totales con aproximadamente 3 B activos por token. Incluye ademas un codificador visual para razonamiento multimodal unificado, coherente con el pipeline `image-text-to-text` declarado en el repo.

No hay informacion sobre el entrenamiento de este checkpoint concreto: se desconoce el volumen de tokens, la composicion del dataset, si hubo RLHF/DPO o cual fue el procedimiento de merge. La model card no documenta ni hiperparametros ni datos. La unica referencia bibliografica del repo (arXiv:1910.09700) es el articulo del calculador de impacto de carbono de Lacoste et al., citado en la plantilla y sin relacion con el modelo. La etiqueta `qwen3_5_moe` frente al nombre "qwen36" es una inconsistencia adicional que impide confirmar la version exacta del base.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (`conversational`).
- Procesamiento de imagenes junto a texto (image-text-to-text), heredado del codificador visual del base.
- Razonamiento y codificacion agentica: la serie Qwen3.6 se presenta con mejoras en flujos frontend y razonamiento a nivel de repositorio.
- Modo de pensamiento con preservacion de trazas ("thinking preservation") segun la documentacion del base Qwen3.6.
- Inferencia eficiente por token al activar solo ~3 B de parametros, con huella de memoria de un modelo de 35 B.
- Soporte de tool calling / function calling: no confirmado en este checkpoint; la model card no lo documenta.
- Capacidades multilingues: no disponibles; no se declaran idiomas en el repo.

## Casos de uso

- Procesamiento de documentacion escaneada con acronimos: el modelo puede recibir la imagen de un contrato o informe tecnico y devolver el texto con los acronimos expandidos, aprovechando la entrada multimodal y el supuesto fine-tuning sobre acronimos del merge.
- Normalizacion de glosarios corporativos: integrar el modelo en un pipeline que detecte siglas en textos internos y proponga su forma desarrollada, con revision humana antes de publicar.
- Extraccion de informacion de capturas de pantalla o diagramas tecnicos: al conservar el codificador visual, admite tareas de descripcion y respuesta sobre imagenes, util para soporte interno.
- Prototipado e investigacion de merges: sirve como caso de estudio para comparar el comportamiento de un merge comunitario frente al checkpoint oficial de Qwen3.6 35B-A3B.
- Servicio de chat autoalojado con requisitos de soberania del dato: al ser un checkpoint de pesos abiertos, puede desplegarse en infraestructura propia sin llamadas a API de terceros.
- Evaluacion de eficiencia MoE: util para medir Throughput y latencia reales de una configuracion 35B-A3B en hardware concreto antes de comprometer presupuesto de GPU.
- Generacion asistida de codigo en entornos con GPU limitada, apoyandose en los ~3 B parametros activos para sostener latencias interactivas con un solo acelerador de 24-48 GB tras cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni la pagina del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K, MMMU o similares, y no existen datos propios que permitan comparar este merge con el checkpoint oficial.

## Requisitos de hardware

- Pesos en precision de entrenamiento: 35,1 B parametros x 2 bytes ≈ 70 GB solo en pesos; con cache KV y activaciones, el despliegue en bf16 requiere del orden de 80-96 GB de VRAM.
- GPU profesionales para bf16: H100 80 GB (ajustado), A100 80 GB, o dos A100 40 GB / L40S 48 GB en paralelo con tensor parallelism.
- Cuantizacion 8 bits: ~40 GB de pesos, encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- Cuantizacion 4 bits: ~20-24 GB de pesos, al limite en RTX 4090 / RTX 3090 de 24 GB; mas comodo en GPU de 32-48 GB.
- Consumer GPU: si cabe tras cuantizacion a 4 bits, pero no hay GGUF publicado en el repo, por lo que habria que generar la cuantizacion a partir de los safetensors.
- El repositorio ocupa 210,7 GB, muy por encima de los 70 GB teoricos de bf16, lo que sugiere pesos en fp32 o shards duplicados; conviene revisar los ficheros antes de descargar.
- Opciones de despliegue: transformers (libreria declarada), vLLM y SGLang para servido con MoE, TGI; llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlondner/qwen36-35b-a3b-acronymes-merged | 35,1 B | ~3 B (por nomenclatura A3B) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen3.6 35B-A3B (oficial) | 35 B | ~3 B | no disponible | no disponible en la informacion recogida | Pesos abiertos, serie Qwen3.6 |
| Qwen3.6 27B dense (oficial) | 27 B | 27 B (denso) | no disponible | no disponible en la informacion recogida | Pesos abiertos, serie Qwen3.6 |
| Qwen3.6-Plus (propietario) | no disponible | no disponible | 1 M tokens (segun la documentacion de la serie) | propietaria, solo API | API de Alibaba Cloud |

El checkpoint oficial de 35B-A3B es la alternativa natural: misma arquitectura y mismo coste de inferencia, con model card y trazabilidad reales. El 27B denso renuncia a la eficiencia MoE pero simplifica el despliegue. Qwen3.6-Plus ofrece contexto de 1 M tokens a cambio de depender de una API.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin detalles de entrenamiento, datos, evaluacion ni uso previsto.
- Licencia no declarada: no puede confirmarse el uso comercial. Debe verificarse la licencia del checkpoint base de Qwen3.6 en su repositorio oficial antes de cualquier despliegue productivo.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones, se desconoce la tasa de error en tareas factuales.
- Idioma sin especificar: no se declaran idiomas soportados; el nombre "acronymes" apunta a un sesgo hacia textos en frances, lo que puede degradar el rendimiento en castellano.
- Inconsistencia de etiquetado: el tag de arquitectura (`qwen3_5_moe`) no coincide con el nombre del modelo ("qwen36"), lo que impide confirmar la version exacta del base.
- Procedimiento de merge desconocido: los merges de pesos pueden degradar capacidades del modelo original sin que existan pruebas que lo detecten.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ, de modo que el usuario debe generarlas y validarlas por su cuenta.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay reportes de terceros sobre su calidad.
- Repositorio de 210,7 GB: coste de almacenamiento y descarga muy superior al de los pesos bf16 teoricos.
- Sin garantias de mantenimiento: el autor no ha publicado issues, discusion ni hoja de ruta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlondner/qwen36-35b-a3b-acronymes-merged
- Ficha de Qwen3.6 35B-A3B en LM Studio Hub: https://lmstudio.ai/qvping/qwen36-35b-a3b
- Ficha de Qwen3.6 35B A3B en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- Guia de Qwen 3.6 (Layer3 Labs): https://www.layer3labs.io/guides/qwen-3-6-explained
- Merge comunitario relacionado (tianlix): https://huggingface.co/tianlix/qwen36-35b-a3b-merged-linear-lora
- Articulo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
