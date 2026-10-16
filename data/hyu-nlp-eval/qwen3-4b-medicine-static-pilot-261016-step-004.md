# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-004

## Resumen

`HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-004` es un checkpoint de ajuste fino derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario HYU-NLP-EVAL bajo licencia Apache 2.0. Segun la model card, se trata del paso 4 (semilla 11) de una ejecucion identificada como `261016_medicine_static_pilot`, lo que apunta a un piloto de entrenamiento orientado al ambito medico con evaluacion estatica. El repositorio contiene una exportacion BF16 en formato Transformers lista para usar, ademas de un directorio `original_checkpoint/` con los ficheros nativos de veRL/FSDP y sus metadatos.

El modelo conserva la arquitectura del modelo base: un transformer denso de 4.022.468.096 parametros (4,02 B), sin mezcla de expertos, con licencia Apache 2.0 y pipeline `text-generation`. Al ser un derivado directo de Qwen3-4B-Instruct-2507, hereda las caracteristicas estructurales de esa familia (atencion con GQA, tokenizador multilingue y modo instruct sin bloque de razonamiento explicito), aunque la model card no documenta cambios de arquitectura ni hiperparametros de entrenamiento.

La relevancia de esta publicacion es limitada y fundamentalmente experimental: el repositorio acumula 0 descargas y 0 likes, la model card es minima (no incluye datos de entrenamiento, evaluacion ni uso previsto) y el numero de paso sugiere un checkpoint intermedio de una fase temprana de entrenamiento, no un modelo final. Por tanto, debe tratarse como un artefacto de investigacion reproducible (se documentan ejecucion, paso y semilla) mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); detalles especificos del fine-tuning no disponibles |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo pesos BF16). Compatible con cuantizacion posterior mediante herramientas estandar (llama.cpp, AWQ, GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte multilingue amplio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) para Transformers; `original_checkpoint/` con ficheros nativos veRL/FSDP |
| Tamano del repositorio | 25,7 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (finetune) |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la model card proporcionada. El unico dato estructural confirmado es que se trata de un ajuste fino del modelo `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4,02 B de parametros perteneciente a la familia Qwen3. No hay indicios de modificaciones arquitectonicas (no es un MoE, no es un modelo hibrido SSM, no se menciona decodificacion especulativa ni atencion lineal).

En cuanto al entrenamiento, la informacion disponible se limita a los metadatos de la ejecucion. El identificador del repositorio y la model card indican: ejecucion `261016_medicine_static_pilot`, checkpoint correspondiente al paso 4 y semilla 11. El directorio `original_checkpoint/` contiene los ficheros exactos de veRL/FSDP junto con metadatos, lo que sugiere que el ajuste se realizo con el framework veRL (entrenamiento por refuerzo sobre modelos de lenguaje) usando sharding FSDP. Sin embargo, no se especifican el numero de tokens de entrenamiento, la composicion del dataset medico, ni si se aplicaron tecnicas de RLHF, DPO u optimizacion por preferencias. La model card menciona que el checkpoint local se elimina unicamente tras verificar tamanos remotos y hashes SHA256, lo que aporta garantias de integridad pero no informacion sobre el contenido del entrenamiento.

## Capacidades

La model card no documenta capacidades explicitas. Las siguientes afirmaciones se derivan del modelo base declarado (`Qwen/Qwen3-4B-Instruct-2507`) y deben considerarse no verificadas para este checkpoint concreto:

- Generacion de texto conversacional en formato instruct, sin bloque de razonamiento explicito (el modelo base 2507 es una variante instruct de Qwen3 sin modo thinking).
- Razonamiento y matematicas de complejidad moderada, acorde a un modelo denso de 4 B de parametros.
- Generacion y edicion de codigo en lenguajes habituales, con calidad esperable en la gama de 3-4 B.
- Soporte multilingue amplio heredado del tokenizador y del entrenamiento del modelo base (idiomas concretos no declarados en este repositorio).
- Soporte de tool calling y function calling en el modelo base; no confirmado para este checkpoint tras el ajuste.
- Capacidad de operar en flujos de agente y razonamiento multi-paso; no confirmado para este checkpoint.
- Capacidad especifica esperada: dominio medico, segun el nombre de la ejecucion (`medicine_static_pilot`). No hay evaluacion publicada que lo corrobore.

## Casos de uso

Dado el caracter experimental del checkpoint y la ausencia de evaluacion publicada, los casos de uso que se enumeran a continuacion son escenarios plausibles, no validados:

- Reproduccion de experimentos de ajuste fino: usar el par `original_checkpoint/` + export BF16 para replicar la ejecucion `261016_medicine_static_pilot` con semilla 11 y comparar el paso 4 frente a otros pasos o semillas.
- Investigacion en dominio medico: emplear el modelo como punto de partida para estudiar como un ajuste fino temprano sobre datos clinicos afecta al comportamiento respecto al modelo base, siempre bajo supervision de un profesional sanitario.
- Generacion de notas clinicas sinteticas: producir textos de prueba para pipelines de procesamiento de lenguaje natural clinico en entornos de desarrollo, nunca con datos de pacientes reales.
- Evaluacion comparativa de checkpoints: medir la degradacion o mejora frente a Qwen3-4B-Instruct-2507 en tareas de comprension lectora biomedica dentro de un banco de pruebas interno.
- Prototipado de asistentes de baja latencia: el tamano de 4 B permite desplegar en una unica GPU de consumo, lo que resulta util para iterar rapidamente en demos de triaje de preguntas frecuentes sanitarias.
- Extraccion de informacion estructurada: transformar texto libre en campos estructurados (entidades, codigos) en prototipos de investigacion, con validacion humana obligatoria.
- Destilacion o generacion de datos: usar el modelo para producir candidatos sinteticos que posteriormente se filtran y revisan antes de incorporarlos a un conjunto de entrenamiento.
- Docencia y formacion tecnica: ilustrar en un curso como se publica un checkpoint intermedio con veRL/FSDP y exportacion a Transformers.

En ningun caso debe emplearse para diagnostico, prescripcion, triaje clinico real ni asesoramiento medico a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, PubMedQA, MedQA ni de ninguna otra evaluacion, y el repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones de terceros publicadas.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (4,02 B) y del formato de pesos publicado (BF16):

- VRAM para inferencia en BF16: aproximadamente 8,0-9,0 GB solo para pesos, mas entre 1 y 4 GB de cache KV segun longitud de contexto y tamano de lote.
- VRAM para inferencia en FP16: equivalente al caso BF16 (unos 8,0 GB de pesos).
- VRAM con cuantizacion INT8: aproximadamente 4,0-5,0 GB de pesos.
- VRAM con cuantizacion de 4 bits (GGUF Q4_K_M o similar): aproximadamente 2,4-3,5 GB de pesos; requiere generar la cuantizacion, ya que no se publica en el repositorio.
- GPU de gama profesional: A100 40/80 GB, H100 80 GB y A10G 24 GB ejecutan el modelo sin problemas y con margen para contextos largos.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti 16 GB y, en cuantizacion de 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- CPU: viable en cuantizacion de 4 bits con llama.cpp, con velocidad de generacion baja.
- Opciones de despliegue: transformers (formato nativo publicado), vLLM y TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp u Ollama tras convertir los pesos a GGUF, y FSDP/veRL para continuar el entrenamiento.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Datos de alternativas tomados de su documentacion publica; verificados de forma aproximada y sujetos a cambios por parte de sus autores.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-004 | 4,02 B (denso) | No disponible (base: 262.144 tokens) | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint intermedio de un piloto medico, sin evaluacion publicada |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B (denso) | 262.144 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | Modelo base; modo instruct sin razonamiento explicito |
| Llama-3.2-3B-Instruct | 3,21 B (denso) | 128.000 tokens | Llama 3.2 Community License (con restricciones) | HuggingFace | Requiere aceptar la licencia y cumplir la politica de uso aceptable |
| Gemma 3 4B IT | ~4 B (denso) | 128.000 tokens | Gemma Terms of Use (con restricciones) | HuggingFace | Multimodal en entrada de imagen en algunas variantes de la familia |

Comparacion de rendimiento: no disponible, ya que ninguno de los resultados de este checkpoint ha sido publicado y no procede extrapolar cifras del modelo base sin una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks publicados, no es posible afirmar que el ajuste haya mejorado las capacidades del modelo base en el dominio medico.
- Checkpoint intermedio: el paso 4 de entrenamiento es muy temprano; es esperable que el modelo no haya convergido ni adquirido de forma estable los comportamientos objetivo.
- Riesgo elevado de alucinacion en contenido clinico: los modelos de lenguaje de esta escala pueden generar afirmaciones medicas plausibles pero falsas. Ninguna salida debe utilizarse para decisiones clinicas.
- Sesgos: no evaluados. El dataset de ajuste no esta documentado, por lo que se desconoce su composicion demografica, geografica o linguistica y los sesgos que pueda haber transferido.
- Limitaciones de idioma: no se declaran idiomas soportados en la model card; el comportamiento fuera del ingles y del chino (idiomas principales de la familia Qwen3) no esta verificado.
- Limitaciones de contexto: la ventana efectiva tras el ajuste no esta documentada; aunque el modelo base soporte 262.144 tokens, el comportamiento con contextos largos en este checkpoint es desconocido.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no exime del cumplimiento de la normativa aplicable a datos medicos y de proteccion de datos (RGPD en la Union Europea).
- Trazabilidad: el repositorio documenta ejecucion, paso y semilla, pero no los datos ni la receta de entrenamiento, lo que dificulta auditar los resultados.
- Idoneidad para produccion: muy baja. No se recomienda su despliegue en sistemas con usuarios reales.
- Fecha de publicacion futura respecto al momento de redaccion habitual de fichas: conviene verificar que el repositorio sigue disponible y si ha sido actualizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-004
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVAL
- Paper, blog, repositorio o demo especificos de este checkpoint: no disponible. Las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a entidades no relacionadas).
