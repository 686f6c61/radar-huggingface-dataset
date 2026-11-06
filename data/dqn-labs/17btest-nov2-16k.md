# DQN-Labs/17btest-nov2-16k

## Resumen

DQN-Labs/17btest-nov2-16k es un modelo de generacion de texto publicado en Hugging Face por el usuario DQN-Labs. A pesar de la denominacion "17b" en el identificador, el recuento real de parametros segun los pesos en safetensors es de 1.728.801.536 (aproximadamente 1,73 mil millones), por lo que se trata de un modelo de escala ~1,7B y no de 17B. El repositorio ocupa 3,5 GB y se distribuye en formato safetensors con codigo personalizado (`custom_code`) bajo la libreria transformers.

El modelo aparece etiquetado con la arquitectura "lfm3" y con las etiquetas `trl` y `sft`, lo que sugiere que ha sido sometido a un ajuste supervisado (supervised fine-tuning) mediante la libreria TRL, probablemente partiendo de un modelo base de la familia LFM (Liquid Foundation Models). La model card es la plantilla automatica de Hugging Face sin cumplimentar: no incluye informacion sobre desarrollador, datos de entrenamiento, licencia, idiomas ni resultados de evaluacion.

La relevancia de esta ficha es fundamentalmente descriptiva y de advertir: se trata de un checkpoint de prueba ("17btest") con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica publicada. Cualquier evaluacion rigurosa del modelo requiere inspeccion directa de los pesos y de la configuracion del repositorio, ya que el autor no ha proporcionado informacion verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3 (etiqueta del repositorio); detalles no disponibles |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el sufijo "16k" del identificador sugiere 16.384 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,5 GB |
| Libreria | transformers (con `custom_code`) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es la etiqueta `lfm3` del repositorio, que apunta a la familia de modelos LFM de Liquid AI. No obstante, no se especifica si se trata de un transformer convencional, de una arquitectura hibrida con capas de espacio de estado (SSM) o de otra variante, ni se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo de atencion empleado. El repositorio incluye `custom_code`, lo que implica que la definicion del modelo no es la estandar de transformers y requiere cargar codigo remoto del propio repositorio (`trust_remote_code=True`).

En cuanto al entrenamiento, las etiquetas `trl` y `sft` indican que el checkpoint ha pasado por un proceso de ajuste supervisado con la libreria TRL, presumiblemente sobre un modelo base previo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros utilizados. La model card declara explicitamente "[More Information Needed]" en todas las secciones de detalles de entrenamiento, datos y procedimiento.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, lo que sugiere un ajuste orientado a dialogos multi-turno.
- Ajuste supervisado (SFT): el modelo ha sido afinado con TRL, lo que en principio mejora el seguimiento de instrucciones respecto al modelo base, aunque no hay evaluacion publicada que lo confirme.
- Capacidades de razonamiento, codigo y matematicas: no disponible; no hay informacion ni benchmarks que las respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales: al ser un modelo de ~1,7B ajustado con SFT y etiquetado como conversacional, puede emplearse para validar pipelines de dialogo multi-turno en entornos de desarrollo antes de migrar a modelos mayores.
- Experimentacion academica con TRL: el checkpoint sirve como referencia para reproducir o comparar recetas de SFT sobre la familia LFM, ya que conserva las etiquetas de entrenamiento del autor.
- Despliegue en hardware modesto: con ~1,73B de parametros y pesos en safetensors, es viable ejecutarlo en GPUs de consumo tras cuantizacion, lo que lo hace util para demos locales de generacion de texto.
- Generacion de texto de proposito general en entornos controlados: tareas de resumen, parafraseo o redaccion asistida donde no se requiera garantia de calidad de produccion.
- Base para fine-tuning posterior: al ser un modelo pequeno y ya ajustado, puede servir como punto de partida para especializaciones adicionales en dominios concretos con presupuesto de computo limitado.
- Evaluacion comparativa de arquitecturas LFM: util para investigadores que quieran medir el comportamiento de la etiqueta `lfm3` frente a transformers convencionales de tamano similar, siempre que se valide primero la correccion de la carga con `custom_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1 GB, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para cuantizacion 4/8 bits, GPUs con 4-6 GB como RTX 3050 o GTX 1660.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de gama media, siempre que se cuantice o se use un contexto moderado.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via obligatoria dado el `custom_code`; vLLM, llama.cpp, Ollama y TGI solo serian viables si la arquitectura `lfm3` esta soportada por dichos motores, lo cual no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DQN-Labs/17btest-nov2-16k | ~1,73B | no disponible (posible 16k por el identificador) | no disponible | Hugging Face, 0 descargas | Checkpoint de prueba sin documentacion |
| Modelos LFM de Liquid AI (familia referenciada por la etiqueta) | variable | no disponible | no disponible | Hugging Face | No se confirma que este checkpoint derive de un LFM oficial |
| Transformers convencionales de ~1,5-2B (p. ej. variantes tipo Qwen o SmolLM) | ~1,5-2B | 4k-32k segun variante | variable | Hugging Face | Comparacion generica; no se dispone de datos de rendimiento del modelo evaluado |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar; no hay informacion sobre datos, sesgos, evaluacion ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Checkpoint de prueba: el identificador "17btest" y la discrepancia entre el nombre (17b) y los parametros reales (~1,73B) sugieren un artefacto de experimentacion, no un modelo destinado a uso publico.
- Riesgo de alucinacion: sin evaluacion publicada, no se puede estimar la tasa de alucinacion; en un modelo de ~1,7B ajustado con SFT es esperable un riesgo elevado en tareas factuales.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningun otro idioma.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo.
- Contexto no confirmado: el sufijo "16k" del identificador no esta respaldado por la configuracion publica; no debe asumirse una ventana de 16.384 tokens sin verificacion.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de terceros sobre su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DQN-Labs/17btest-nov2-16k
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact
- Repositorio de TRL (libreria de entrenamiento referenciada por las etiquetas): https://github.com/huggingface/trl
- Documentacion de transformers sobre `trust_remote_code`: https://huggingface.co/docs/transformers/main/en/models
