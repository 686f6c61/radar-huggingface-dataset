# Agtian/cpt7

## Resumen

cpt7 es un ajuste fino por supervisión (SFT) publicado por el usuario Agtian sobre el modelo aisingapore/Gemma-SEA-LION-v4.5-E2B-IT, que a su vez es una adaptación multilingüe para el sudeste asiático de la familia Gemma 3n en su variante E2B (etiquetada como `gemma4` en el repositorio). El resultado es un modelo multimodal de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto, con 4.647.450.147 parámetros reales declarados en los pesos safetensors.

El modelo se ha entrenado con la librería TRL (versión 0.24.0) sobre el stack Transformers 5.5.0 y PyTorch 2.8.0+cu129, y se distribuye tanto en safetensors como en formato GGUF, lo que facilita su despliegue en entornos de inferencia optimizados para CPU y GPU de gama media. La nomenclatura E2B del modelo base sugiere una arquitectura con parámetros efectivos del orden de 2.000 millones, aunque el repositorio no detalla el recuento de parámetros activos.

Su relevancia es limitada pero concreta: se trata de un ajuste de nicho con 625 descargas y 0 likes en el momento de la consulta, sin licencia ni idiomas declarados de forma explícita y sin resultados de benchmarks publicados. Resulta útil como caso de estudio de ajuste SFT multimodal de bajo coste sobre un modelo Gemma compacto, pero no como opción principal para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma-SEA-LION-v4.5-E2B-IT, etiquetado `gemma4`; multimodal image-text-to-text) |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no disponible (la nomenclatura E2B del modelo base sugiere ~2.000 millones efectivos, sin confirmacion en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye artefactos GGUF; no se detallan los niveles concretos) y safetensors en precision completa |
| Idiomas soportados | no disponible (el modelo base SEA-LION esta orientado a lenguas del sudeste asiatico, pero la ficha no lo confirma para cpt7) |
| Licencia | no disponible (la model card indica `licence: license` de forma generica) |
| Formato de pesos | safetensors y GGUF |

Otros datos del repositorio: tamano total del repositorio 868,2 GB, pipeline `image-text-to-text`, libreria `transformers`, compatible con endpoints, creado el 2026-10-04 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de su herencia: el modelo base es aisingapore/Gemma-SEA-LION-v4.5-E2B-IT, etiquetado con la familia `gemma4` y con una nomenclatura E2B tipica de la serie Gemma 3n, que combina atencion estandar con modulos de embeddings por capa y una organizacion tipo MatFormer para ofrecer un submodelo efectivo de menor coste computacional. No se especifican en el repositorio el numero de capas, la dimension oculta, el tipo de atencion ni la longitud de contexto soportada.

El entrenamiento es un ajuste fino por supervisicion (SFT) realizado con TRL 0.24.0 sobre Transformers 5.5.0, PyTorch 2.8.0+cu129, Datasets 4.3.0 y Tokenizers 0.22.2. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO posteriores, ni si se congelaron modulos del modelo base durante el ajuste. El tag `unsloth` sugiere que el entrenamiento se realizo con esa libreria de optimizacion, pero no se detalla la configuracion de hiperparametros.

## Capacidades

- Generacion de texto conversacional: la model card incluye un ejemplo de `text-generation` con formato de mensajes de rol `user`.
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que implica capacidad de procesar imagenes junto a instrucciones textuales.
- Dialogo multi-turno: la etiqueta `conversational` y el uso de plantillas de mensajes indican soporte de conversaciones con historial.
- Ajuste SFT sobre instrucciones: el modelo ha sido afinado para seguir instrucciones, partiendo de una version IT del modelo base.
- Tool calling / function calling: no disponible; no se documenta soporte en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible; no se menciona en la ficha.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documentan.
- Capacidades multilingues: no disponible para cpt7; el modelo base esta orientado a lenguas del sudeste asiatico, pero el ajuste puede haber alterado ese comportamiento y no hay confirmacion.
- Capacidades de audio: no disponibles; no se declaran.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el ejemplo oficial de la model card funciona como punto de partida para montar un chatbot local con `transformers` en pocas lineas, util para validar ideas antes de invertir en modelos mayores.
- Descripcion de imagenes en catalogos internos: al aceptar entradas image-text-to-text, puede emplearse para generar pies de foto o descripciones de producto en un pipeline de gestion documental, siempre con revision humana por la ausencia de benchmarks.
- Clasificacion y extraccion de informacion a partir de capturas o documentos escaneados: combinando una imagen con una instruccion textual se pueden obtener salidas estructuradas simples, integradas en scripts de preprocesado de datos.
- Base para experimentos academicos de ajuste fino multimodal: al ser un SFT reproducible sobre un modelo Gemma compacto con TRL y Unsloth, sirve como referencia para comparar estrategias de fine-tuning en entornos con pocos recursos.
- Despliegue local en equipos de gama media: la presencia de pesos GGUF permite ejecutar el modelo en portatiles o estaciones sin GPU dedicada de gama alta, por ejemplo para tareas de asistencia sin conexion.
- Investigacion sobre lenguas del sudeste asiatico: dado que el modelo base SEA-LION esta especializado en esas lenguas, cpt7 puede servir para explorar si el ajuste SFT preserva o degrada dicha cobertura, mediante evaluacion propia.
- Generacion de contenido asistida en entornos editoriales: redaccion de borradores a partir de imagenes de referencia y notas breves, con validacion posterior por un editor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para los pesos (4,65 mil millones de parametros a 2 bytes), mas memoria para cache KV, activaciones y el codificador visual; en la practica conviene reservar entre 12 y 16 GB.
- VRAM estimada en cuantizacion INT8: en torno a 5 GB de pesos, con margen recomendado de 8 GB.
- VRAM estimada en GGUF Q4_K_M: del orden de 3 a 4 GB incluyendo overhead; Q8 en torno a 5-6 GB. Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto amplio; A100 40/80 GB o H100 para servir varias instancias; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones de 8 bits.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 8-12 GB mediante cuantizacion GGUF de 4-5 bits, y en 16-24 GB en precision casi completa.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado en la model card), llama.cpp u Ollama a traves de los pesos GGUF incluidos en el repositorio, vLLM o TGI si la arquitectura del modelo base esta soportada por esas herramientas (no confirmado en la informacion disponible), y Unsloth para reentrenamiento o ajuste adicional.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

Los datos de las alternativas proceden de documentacion publica de cada familia y deben verificarse antes de usarlos en una decision de produccion. Para cpt7 se indica lo declarado en su repositorio.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Agtian/cpt7 | 4,65 mil millones (activos no disponibles) | no disponible | Si (image-text-to-text) | no disponible | SFT sobre Gemma-SEA-LION-v4.5-E2B-IT; sin benchmarks publicados |
| aisingapore/Gemma-SEA-LION-v4.5-E2B-IT (modelo base) | orden de 5 mil millones totales, ~2 mil millones efectivos segun nomenclatura E2B | no disponible en la informacion proporcionada | Si | no disponible en la informacion proporcionada | Base directa de cpt7, orientado a lenguas del sudeste asiatico |
| Familia Gemma 3n E2B (referencia publica) | ~5 mil millones totales, ~2 mil millones efectivos | 32.000 tokens segun documentacion publica de la familia | Si | Terminos de uso de Gemma | Alternativa de referencia si se necesita soporte oficial y licencia clara |
| Modelos compactos de vision-lenguaje de ~3-4 mil millones (por ejemplo, la serie Qwen-VL de ese rango) | 3-4 mil millones | variable segun version, tipicamente 32.000 tokens o mas | Si | variable segun modelo | Ecosistema con benchmarks publicos y despliegue ampliamente soportado |

No se dispone de resultados de benchmarks de cpt7 que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales que permitan estimar la calidad real del ajuste.
- Licencia no especificada: la model card indica `licence: license` sin concretar terminos, lo que impide confirmar si se permite uso comercial. Ademas, al derivar de la familia Gemma, es probable que hereden los terminos de uso de Gemma, pero esto no esta confirmado en el repositorio.
- Riesgo de alucinacion: es un modelo de 4,65 mil millones de parametros afinado con SFT; no se documenta ninguna fase de alineacion adicional (RLHF o DPO) que mitigue respuestas inventadas.
- Idiomas no declarados: no se indica que lenguas mantiene el ajuste, por lo que el comportamiento multilingue del modelo base puede haberse degradado o conservado sin garantia.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Soporte de agentes y tool calling no documentado: no conviene asumir compatibilidad con function calling ni con flujos multi-paso sin pruebas propias.
- Repositorio muy pesado: 868,2 GB de tamano total, derivado de almacenar multiples formatos de pesos; la descarga completa puede ser inviable en muchos entornos y conviene clonar solo los archivos necesarios.
- Trazabilidad limitada: no se publican el dataset de SFT, la configuracion de entrenamiento ni la evaluacion posterior, lo que dificulta auditar sesgos o comportamiento.
- Huella de adopcion baja: 625 descargas y 0 likes reducen la probabilidad de encontrar reportes de terceros sobre fallos o comportamientos anomalos.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; no hay prensa, papers ni discusiones tecnicas que lo respalden.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Agtian/cpt7
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
- Papers, blogs, demos o repositorios adicionales: no disponible (las busquedas web no arrojaron resultados relevantes sobre el modelo)
