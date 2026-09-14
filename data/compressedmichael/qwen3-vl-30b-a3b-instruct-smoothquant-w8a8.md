# CompressedMichael/Qwen3-VL-30B-A3B-Instruct-SmoothQuant-W8A8

## Resumen

Qwen3-VL-30B-A3B-Instruct-SmoothQuant-W8A8 es una derivada cuantizada del modelo multimodal Qwen3-VL-30B-A3B-Instruct, publicada por el usuario CompressedMichael. Se trata de una cuantizacion post-entrenamiento en formato INT8 W8A8 (pesos y activaciones en 8 bits) generada con el flujo de trabajo de llm-compressor y exportada con el esquema compressed-tensors. El objetivo es reducir el coste de almacenamiento y de ancho de banda de memoria de un modelo de clase 30B con mezcla de expertos, manteniendo la funcionalidad de generacion imagen-texto.

El modelo base pertenece a la familia Qwen3-VL, con arquitectura de mezcla de expertos (MoE) y capacidad multimodal (pipeline image-text-to-text). El repositorio declara 31.070.754.032 parametros totales y un tamano de 32,3 GB, de los cuales 30,08 GiB corresponden a los pesos cuantizados repartidos en 9 shards. La cuantizacion cubre la atencion de lenguaje y todas las proyecciones lineales de los expertos MoE, mientras que los pesos de vision, los embeddings, las puertas del router, las capas de normalizacion y el lm_head permanecen en BF16.

Su relevancia es fundamentalmente practica y experimental: permite estudiar el comportamiento de SmoothQuant con fuerza de suavizado 0.8 sobre un MoE multimodal y evaluar el equilibrio entre compresion y fidelidad. No obstante, el propio autor indica que no se han medido benchmarks de precision ni la velocidad de servicio en bajo bit, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal de vision-lenguaje (tag `qwen3_vl_moe`); requiere el fichero de modelado propio `modeling_qwen3_vl_moe_quantized.py` |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible (la nomenclatura "A3B" del nombre sugiere del orden de 3.000 millones, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos INT8 simetricos por canal de salida y activaciones INT8 dinamicas por token, con SmoothQuant de fuerza 0.8; no se publican otros formatos en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors (9 shards, 30,08 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos: las capas de atencion de lenguaje y las proyecciones de los expertos se combinan con un router que selecciona un subconjunto de expertos por token. El repositorio conserva todos los pesos de la clase 30B aunque solo se active una parte en cada paso. En esta derivada, las proyecciones fusionadas de expertos en 3D del modelo original se han convertido en modulos lineales 2D independientes, lo que obliga a cargar la implementacion incluida con `trust_remote_code=True`; la clase MoE estandar de Qwen3-VL no reproduce este layout.

No hay reentrenamiento ni ajuste fino: se trata de una cuantizacion post-entrenamiento. El proceso aplica SmoothQuant con fuerza de suavizado 0.8 seguido de redondeo INT8, y balancea las proyecciones gate/up de cada experto y el router no cuantizado contra la normalizacion posterior a la atencion para preservar el enrutamiento bajo el suavizado. La calibracion uso 128 pares imagen-primera descripcion del split de test de Flickr30k (revision `765d117f3eec816f2bfdc2d73ebb50a6f77b86a4`), con semilla 42, hasta 256 tokens de imagen y 1024 tokens totales por ejemplo, garantizando que todos los expertos recibieran entradas de calibracion. Cada metodo de cuantizacion parte de forma independiente de los pesos BF16 originales. Se cuantizaron 18.624 modulos lineales.

## Capacidades

- Generacion de texto e imagen-texto (image captioning, respuesta a preguntas sobre imagenes), heredada del modelo base Qwen3-VL-30B-A3B-Instruct.
- Conversacion multimodal multiturno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de codigo: no verificado en la informacion disponible para esta derivada cuantizada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: la unica modalidad declarada es imagen-texto; no se documentan modos adicionales.

## Casos de uso

- Generacion automatica de texto alternativo: el modelo puede producir descripciones de imagenes en pipelines de accesibilidad web, aprovechando su naturaleza image-text-to-text. La validacion del autor confirma una generacion codiciosa de 48 tokens sobre una imagen retenida de Flickr30k con salida no vacia.
- Catalogacion y etiquetado de imagenes a escala: dado un flujo de imagenes con captions, el modelo puede generar o ampliar descripciones para bases de datos de productos, archivos fotograficos o material editorial.
- Analisis de documentos con contenido visual: al conservar los pesos de vision en BF16, es adecuado para experimentar con extraccion de informacion a partir de capturas, diagramas o figuras, siempre que se valide la calidad en el dominio concreto.
- Investigacion sobre cuantizacion de MoE: sirve como objeto de estudio para medir como afecta SmoothQuant con fuerza 0.8 al enrutamiento de expertos y a la calidad final, comparando contra el modelo base en BF16.
- Prototipado de asistentes conversacionales multimodales: puede integrarse en demos de chat que reciban imagenes y texto, con la advertencia de que no hay validacion de tool calling ni de agentes.
- Evaluacion comparativa de calidad post-cuantizacion: util para construir protocolos internos que midan la degradacion respecto al modelo original en tareas de captioning o VQA, dado que el autor no publico esas cifras.
- Educacion y divulgacion: permite ilustrar en articulos y cursos las decisiones de calibracion (128 muestras, 256 tokens de imagen, semilla 42) y el reparto de precision entre componentes cuantizados y en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la precision de referencia, la precision relativa al modelo original y la velocidad de servicio en bajo bit no se midieron durante la validacion. Las unicas comprobaciones documentadas son:

| Comprobacion | Resultado |
|---|---|
| Recarga en Transformers (13/09/2026) | Sin pesos faltantes, inesperados ni desajustados, y sin errores de carga |
| Generacion codiciosa de 48 tokens sobre una imagen retenida de Flickr30k | Descripcion no vacia, sin valores NaN en las puntuaciones |
| Cobertura de cuantizacion | Registrada en `artifact_audit.json` para los 18.624 lineales cuantizados |

## Requisitos de hardware

- Pesos cuantizados en disco: 30,08 GiB (9 shards) dentro de un repositorio de 32,3 GB.
- Carga en BF16: el propio autor advierte de que Transformers puede descomprimir los pesos a BF16 durante la carga, por lo que hay que reservar memoria para el modelo BF16 completo (aproximadamente 62 GB solo en pesos, calculado a partir de 31.070.754.032 parametros a 2 bytes) mas espacio de trabajo. El tamano del checkpoint guardado no es una medida de la memoria de GPU en ejecucion.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo completo en BF16 encaja en A100 80 GB o H100 80 GB, pero esto no esta validado en el repositorio.
- GPU de consumo: no validado. Una RTX 4090 de 24 GB no puede alojar el modelo completo ni en INT8 (aproximadamente 31 GB de pesos), por lo que requeriria offload a CPU o reparto por capas.
- Opciones de despliegue: carga con `AutoModelForImageTextToText` y `trust_remote_code=True`, con Accelerate para `device_map="auto"` y `attn_implementation="sdpa"`. Entorno validado: Torch 2.7.0, Transformers 4.57.1, compressed-tensors 0.13.0.
- Compatibilidad con vLLM, serializacion AutoGPTQ y kernels acelerados de bajo bit: no validada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision | Licencia | Notas |
|---|---|---|---|---|---|
| CompressedMichael/Qwen3-VL-30B-A3B-Instruct-SmoothQuant-W8A8 | 31.070.754.032 | no disponible | INT8 W8A8 (vision, embeddings, router, normas y lm_head en BF16) | apache-2.0 | Requiere codigo propio; sin benchmarks publicados; 0 descargas |
| Qwen/Qwen3-VL-30B-A3B-Instruct (modelo base) | no disponible en la informacion proporcionada (el safetensors de la derivada indica 31.070.754.032) | no disponible | BF16 | apache-2.0 | Referencia de calidad frente a la que no se ha medido degradacion |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No se midio la precision en benchmarks ni la degradacion respecto al modelo base, por lo que se desconoce el impacto real de la cuantizacion SmoothQuant W8A8 sobre la calidad.
- SmoothQuant es una aproximacion: el suavizado de activaciones (fuerza 0.8) y el redondeo INT8 pueden alterar el enrutamiento de los expertos y la fidelidad de las respuestas.
- El ahorro de memoria es parcial: los pesos de vision, los embeddings, las puertas del router, las capas de normalizacion y el `lm_head` permanecen en BF16.
- La carga requiere `trust_remote_code=True` y el fichero de modelado incluido; usar la clase MoE estandar de Qwen3-VL no reproduce el layout correcto.
- No esta validada la compatibilidad con vLLM, AutoGPTQ ni kernels acelerados de bajo bit, lo que limita las opciones de servicio en produccion.
- Cargar el modelo descomprimido a BF16 exige memoria para el modelo completo en BF16 mas espacio de trabajo, lo que puede superar la VRAM disponible en GPUs de gama alta de 24 o 48 GB.
- Idiomas soportados: no disponible; no se puede garantizar un comportamiento multilingue concreto sin evaluacion propia.
- Las imagenes de calibracion y validacion no se redistribuyen en el repositorio, lo que dificulta reproducir exactamente las pruebas.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta derivada.
- Licencia apache-2.0, que permite uso comercial, pero obliga a conservar el aviso de atribucion al equipo de Qwen y a los ficheros `LICENSE` y `NOTICE` del repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompressedMichael/Qwen3-VL-30B-A3B-Instruct-SmoothQuant-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion Flickr30k: https://huggingface.co/datasets/lmms-lab/flickr30k
- Ficheros auxiliares citados en el repositorio: `recipe.yaml`, `quantization_run.json`, `validation.json`, `artifact_audit.json`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a servicios de traduccion sin relacion con el contenido.
