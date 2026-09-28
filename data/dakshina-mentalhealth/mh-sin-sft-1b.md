# Dakshina-mentalHealth/mh-sin-sft-1b

## Resumen

mh-sin-sft-1b es un modelo de generacion de texto publicado en Hugging Face por la organizacion Dakshina-mentalHealth. Se distribuye con la libreria transformers y etiquetas propias de la familia Qwen2, lo que situa su arquitectura en la estirpe de transformadores decoder-only de Qwen. El recuento real de parametros registrado en los pesos safetensors es de 494.032.768 (aproximadamente 494 millones), una cifra que no coincide con el sufijo "1b" del identificador y que, en cambio, coincide exactamente con la configuracion de Qwen2-0.5B.

La relevancia del modelo es por ahora limitada y de naturaleza mas documental que tecnica: la model card publicada es la plantilla automatica de Hugging Face sin cumplimentar, con todos los campos marcados como "[More Information Needed]", cero descargas y cero "likes" en el momento de la consulta. No se declara licencia, ni idiomas, ni datos de entrenamiento, ni procedimiento de ajuste, ni resultados de evaluacion. Tampoco hay paper, repositorio de codigo ni demo asociados.

Por el nombre del repositorio y de la organizacion puede inferirse que se trata de un ajuste supervisado (SFT) orientado al ambito de la salud mental en alguna lengua del sur de Asia, pero esta interpretacion procede del propio identificador y no esta confirmada en ningun documento del autor. Cualquier uso en produccion deberia tratar el modelo como experimental y no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2`), detalles no disponibles |
| Parametros totales | 494.032.768 (datos reales de safetensors) |
| Parametros activos | no aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors sin cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea declarada | text-generation, con etiqueta conversacional |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica verificable son las etiquetas del repositorio, que apuntan a la familia Qwen2 (`qwen2`, `transformers`, `safetensors`). El recuento de parametros de 494.032.768 coincide de forma exacta con el de Qwen2-0.5B, por lo que es plausible que se trate de un ajuste sobre esa base, pero el autor no lo confirma en ningun campo de la model card. Si el modelo conservase la configuracion de Qwen2-0.5B, tendria 24 capas, un `hidden_size` de 896 y atencion con 14 cabezas de consulta y 2 cabezas de clave/valor, con embeddings atados; se trata, de nuevo, de una inferencia no verificada.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO u otras), regimen de precision ni hiperparametros. La etiqueta `arxiv:1910.09700` que aparece en el repositorio procede de la plantilla de model card de Hugging Face y corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, no a un paper descriptivo del modelo. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, modos de razonamiento u otros).

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por la etiqueta `text-generation` y la clase de pipeline declarada.
- Uso conversacional: la etiqueta `conversational` sugiere un ajuste orientado a dialogo multi-turno, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Tool calling / function calling: no disponible; no se declara soporte.
- Agentes y razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponible; no se declaran.
- Dominio declarado por el nombre del repositorio: posible orientacion a salud mental, sin confirmacion documental.

## Casos de uso

- Prototipado e investigacion academica: al ser un modelo de 494 millones de parametros, puede cargarse en una GPU de gama media o incluso en CPU para experimentar con tecnicas de ajuste supervisado antes de escalar a modelos mayores.
- Estudio de fine-tuning en dominios sensibles: sirve como caso de analisis de como un ajuste especifico de dominio sin documentacion de seguridad puede degradar o sesgar las respuestas, util en trabajos de auditoria de modelos.
- Generacion de texto de bajo coste en entornos con recursos limitados: su huella de memoria permite desplegarlo en instancias pequenas o en el borde cuando la calidad requerida no es critica.
- Base para experimentos de destilacion: su tamano reducido lo hace manejable como estudiante o profesor en pipelines de destilacion sobre corpus de dominio especifico.
- Evaluacion comparativa de modelos pequenos en lenguas de bajos recursos: si finalmente se confirma la orientacion multilingue sudasiatica, podria emplearse en estudios comparativos de cobertura linguistica frente a modelos multilingues mayores.
- Pruebas de integracion de infraestructura: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usarlo como sujeto de prueba para validar despliegues en TGI o en Hugging Face Inference Endpoints.
- Uso clinico o de consejo en salud mental: no recomendado en ninguna circunstancia con la informacion disponible, al no existir evaluacion de seguridad, sesgos ni validacion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con todos los campos marcados como "[More Information Needed]" y no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 494.032.768 parametros: aproximadamente 1,98 GB en fp32, 0,99 GB en fp16/bf16, 0,49 GB en int8 y en torno a 0,3-0,4 GB en cuantizacion de 4 bits.
- Memoria adicional para la cache KV: si se mantiene la configuracion de Qwen2-0.5B (24 capas, 2 cabezas KV, dimension de cabeza 64), la cache ocupa unos 12 KB por token en fp16, es decir, unos 384 MB para 32.768 tokens de contexto y unos 1,5 GB para 128.000 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 cubren el modelo con margen amplio. Las GPUs de datacenter (A100, H100) solo tendrian sentido para servir muchas replicas concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM en fp16 y en la mayoria de iGPU y sistemas Apple Silicon en cuantizacion de 4 bits.
- Inferencia en CPU: viable dado el tamano, con `llama.cpp` u `Ollama` previa conversion a GGUF, que no se distribuye en el repositorio.
- Opciones de despliegue: `transformers` de forma nativa; vLLM para servir con batching continuo; TGI y Hugging Face Inference Endpoints segun las etiquetas del repositorio; `llama.cpp` y `Ollama` requieren convertir los pesos safetensors a GGUF, ya que no hay ficheros GGUF publicados.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mh-sin-sft-1b | 494 M | no disponible | no disponible | safetensors, 0 descargas, sin evaluaciones publicadas |
| Qwen2-0.5B | 494 M | 32.768 tokens | Apache-2.0 | safetensors y GGUF, ampliamente desplegado |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | safetensors y GGUF, con variantes instruct y base |
| SmolLM2-360M | ~362 M | 8.192 tokens | Apache-2.0 | safetensors y GGUF, con variantes instruct |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors y GGUF, con historial de uso extenso |

No es posible comparar rendimiento porque el modelo analizado no publica ninguna metrica. La comparacion se limita, por tanto, a parametros, contexto declarado por cada proyecto, licencia y disponibilidad de formatos. Los datos de las alternativas corresponden a la documentacion publica de cada modelo y no a mediciones realizadas para esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar, por lo que no hay informacion verificable sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion, aunque el hipotetico modelo base fuera Apache-2.0. Es el riesgo legal mas inmediato para cualquier despliegue en produccion.
- Ambito potencialmente clinico: el nombre de la organizacion y del repositorio apuntan a salud mental. Un modelo de 494 millones de parametros, sin evaluacion de seguridad y sin supervision profesional, no debe emplearse para dar consejo psicologico o medico bajo ninguna circunstancia.
- Riesgo de alucinacion: no hay datos de evaluacion de veracidad; en modelos de este tamano la tasa de afirmaciones incorrectas es elevada, especialmente en dominios especializados.
- Sesgos desconocidos: no se documenta composicion del dataset, filtrado, ni analisis de sesgos demograficos, linguisticos o culturales.
- Cobertura idiomatica incierta: el sufijo "sin" del identificador podria referirse al cingales (Sinhala), pero no hay confirmacion; el rendimiento en castellano no esta garantizado ni medido.
- Longitud de contexto desconocida: aunque el modelo base probable soporte 32.768 tokens, el ajuste puede haber modificado la configuracion, y no hay forma de verificarlo desde la informacion publicada.
- Discrepancia de nomenclatura: el identificador indica "1b" mientras que el recuento real es de 494 millones de parametros, lo que sugiere un descuido de documentacion que invita a desconfiar del resto de metadatos.
- Validacion nula por la comunidad: cero descargas y cero "likes" en el momento de la consulta; no existen informes independientes de uso ni reproducciones de resultados.
- Formato unico: solo se distribuyen pesos safetensors, sin GGUF ni cuantizaciones preparadas, lo que anade un paso de conversion para despliegues en CPU o en el borde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dakshina-mentalHealth/mh-sin-sft-1b
- Organizacion en Hugging Face: https://huggingface.co/Dakshina-mentalHealth
- Repositorio relacionado de la misma organizacion (adaptador Mistral): https://huggingface.co/Dakshina-mentalHealth/mh-sin-mistral
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla: https://mlco2.github.io/impact

No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo. Los restantes resultados obtenidos no guardaban relacion con el.
