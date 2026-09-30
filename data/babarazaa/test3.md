# BabarAzaa/Test3

## Resumen

Test3 es un ajuste derivado de Qwen/Qwen3-8B publicado por el usuario BabarAzaa en HuggingFace. Se trata de una version "abliterated" (sin comportamiento de rechazo) generada con la herramienta OBLITERATUS mediante su metodo `advanced`, segun la model card del propio autor. El modelo conserva los 8.190.735.360 parametros del base, por lo que es un transformer denso de aproximadamente 8,19 mil millones de parametros.

El objetivo declarado de este tipo de intervenciones es eliminar las respuestas de rechazo mediante ingenieria de activaciones, sin reentrenar los pesos desde cero. Esto lo hace relevante para experimentos de red teaming, investigacion sobre alineamiento y casos de generacion de contenido sin filtros, pero tambien implica riesgos evidentes de seguridad y de cumplimiento normativo.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia, no incluye pipeline ni datos de benchmarks, y el nombre "Test3" sugiere una publicacion de prueba mas que un artefacto mantenido. Los metadatos de creacion y actualizacion (30 de septiembre de 2026) son anomalos y no se corresponden con un lanzamiento real verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3, heredada del modelo base) |
| Parametros totales | 8.190.735.360 (8,19 mil millones, dato de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para esta variante; el base Qwen3-8B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos sin cuantizar). El base Qwen3-8B cuenta con conversiones GGUF, AWQ y GPTQ de terceros |
| Idiomas soportados | en (segun los tags del repositorio); el base Qwen3-8B declara soporte multilingue amplio, no confirmado en esta variante |
| Licencia | No disponible |
| Formato de pesos | safetensors (aproximadamente bf16, deducido de los 16,4 GB del repositorio para 8,19 mil millones de parametros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con normalizacion RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y QK-Norm, ademas de un modo de razonamiento explicito ("thinking") en el modelo original. Este repositorio no reentrena dicha arquitectura: aplica una tecnica de abliteration sobre los pesos ya entrenados del base.

Segun la model card, la intervencion se realizo con OBLITERATUS mediante el metodo `advanced`. La abliteration es una tecnica de ingenieria de activaciones que identifica la direccion del espacio latente asociada al comportamiento de rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de activar respuestas de negativa. El autor no documenta el numero de tokens adicionales, la composicion del dataset, ni si hubo una fase posterior de RLHF o DPO. Tampoco se publican detalles sobre calibracion del metodo, capas afectadas ni evaluacion del dano colateral en capacidades.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del base Qwen3-8B.
- Razonamiento paso a paso y modo "thinking", si la plantilla de chat del base se conserva intacta en este repositorio.
- Generacion de codigo y resolucion de problemas matematicos basicos, como capacidad heredada del base.
- Ausencia de comportamiento de rechazo ante peticiones que el modelo original rechazaria, que es precisamente el efecto buscado por la abliteration.
- Tool calling y function calling: presumiblemente presentes por herencia del base, pero no verificados ni documentados en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingues: el repositorio declara unicamente ingles; el base Qwen3-8B soporta decenas de idiomas, pero no hay confirmacion de que la abliteration los preserve.
- Vision, audio y otras modalidades: no disponibles (el base es exclusivamente de texto).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas de esta variante con las del Qwen3-8B original permite estudiar que comportamientos quedan suprimidos y como afecta la abliteration a la coherencia general.
- Red teaming y evaluacion de riesgos: usar el modelo como generador adversarial controlado para probar clasificadores de contenido y sistemas de moderacion en un entorno aislado.
- Generacion creativa sin filtros: escritura de ficcion con tematicas adultas, violentas o controvertidas donde el base aplicaria rechazos, siempre dentro de un marco legal y con supervision humana.
- Simulacion de personajes y role-play: mantener conversaciones extensas en las que el modelo no rompa el personaje por motivos de politica de contenido, apoyandose en la ventana de contexto heredada del base.
- Fine-tuning especifico posterior: utilizarlo como punto de partida para ajustes con LoRA o QLoRA en dominios donde las negativas del modelo original son un obstaculo, asumiendo que el modelo resultante hereda los mismos riesgos.
- Analisis de discurso y datos sensibles: procesar corpus que contienen contenido que el base rechazaria, por ejemplo transcripciones de incidentes o material de moderacion, en un pipeline interno y controlado.
- Base para pruebas de estres de pipelines de inferencia: al ser un modelo de 8B con pesos en safetensors, sirve para validar el despliegue en vLLM, TGI o llama.cpp antes de mover cargas a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card no aporta comparaciones con el modelo base. No se deben extrapolar los resultados publicos de Qwen3-8B a esta variante: la abliteration suele degradar ligeramente capacidades generales, pero no hay datos en esta informacion que permitan cuantificar el efecto.

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 16,4 GB solo para los pesos, mas la cache KV. Con contexto largo la demanda total puede superar los 20 GB.
- VRAM estimada en int8/FP8: aproximadamente 8,5 GB de pesos, factible en GPUs de 12 a 16 GB.
- VRAM estimada en 4 bits (si se generan cuantizaciones GGUF): aproximadamente 5 GB de pesos, factible en GPUs de 8 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000 o RTX 4090. En una RTX 4090 de 24 GB cabe en bf16 con contexto moderado.
- GPU de consumo: si cabe en una RTX 3090 o RTX 4090 de 24 GB en bf16; en tarjetas de 12 GB (RTX 3060, RTX 4070) es necesario cuantizar a 8 bits; en tarjetas de 8 GB hay que bajar a 4 bits.
- Opciones de despliegue: transformers (metodo indicado en la model card), vLLM y TGI para servir en bf16 o FP8, y llama.cpp u Ollama si se convierten los pesos a GGUF. No se publican archivos GGUF en el repositorio, por lo que habria que generarlos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

Los datos de los modelos comparados corresponden a informacion publica de sus repositorios oficiales y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Test3 (este modelo) | 8,19 mil millones | No disponible (base: 32.768, ampliable a 131.072 con YaRN) | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-8B (base) | 8,19 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente distribuido |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 | Licencia comunitaria de Llama 3.1 | HuggingFace, ampliamente distribuido |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 | Apache 2.0 | HuggingFace, ampliamente distribuido |

En cuanto a comportamiento frente a rechazos, este modelo se diferencia de los tres anteriores por la abliteration, pero no hay benchmarks ni evaluaciones publicadas que permitan comparar su calidad real frente a ellos. Tampoco se dispone de comparacion con otras variantes abliterated del mismo Qwen3-8B.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de forma indiscriminada: puede producir contenido danino, ilegal, difamatorio o sexualmente explicito sin advertencia. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion igual o superior al del base. La remocion de la direccion de rechazo puede reducir tambien la cautela del modelo al afirmar hechos no verificados.
- La licencia no esta declarada en el repositorio. Aunque el base Qwen3-8B se publica bajo Apache 2.0, la ausencia de licencia explicita para este derivado genera incertidumbre juridica para uso comercial.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes, sin pipeline declarado, sin benchmarks y con fechas de creacion y actualizacion en 2026, lo que indica que se trata de una subida de prueba.
- Idioma declarado unicamente ingles. El comportamiento multilingue del base puede haberse degradado y no esta verificado.
- No se documenta el impacto de la abliteration en tool calling, modo thinking ni en la plantilla de chat. Es posible que el tokenizador y la plantilla requieran ajustes manuales para un uso correcto.
- Uso responsable: no debe emplearse para generar desinformacion, acoso, contenido de abuso sexual infantil, instrucciones de dano fisico ni para eludir controles de seguridad en entornos de produccion.
- El rendimiento en produccion no esta medido: no hay datos de latencia, throughput ni estabilidad bajo carga concurrente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BabarAzaa/Test3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante a este modelo. Las busquedas devuelven paginas de modelos de generacion de imagenes en PixAI y SeaArt, un probador de APIs de terceros y una noticia sobre Gemini, ninguno relacionado con BabarAzaa/Test3.
