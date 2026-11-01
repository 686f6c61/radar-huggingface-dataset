# bambocher/Qwen3.5-2B-heretic

## Resumen

Qwen3.5-2B-heretic es una variante "decensored" (abliterated) del modelo Qwen3.5-2B-Base de Alibaba Qwen, publicada por el usuario independiente bambocher mediante la herramienta Heretic v1.4.0. El objetivo es eliminar los mecanismos de rechazo del modelo original sin reentrenar: se aplican modificaciones de pesos dirigidas sobre las proyecciones `attn.o_proj` y `mlp.down_proj` para suprimir la dirección de activación asociada a las negativas. Segun la model card, las negativas caen de 97/100 en el modelo original a 2/100 en esta variante, con una divergencia KL de 0,0357 respecto al original.

El modelo base Qwen3.5-2B es un modelo causal con codificador de vision, de 2B parametros, con arquitectura hibrida que combina Gated DeltaNet (atencion lineal) y Gated Attention clasica, con 24 capas y una longitud de contexto nativa de 262.144 tokens. Esta pensado para prototipado, fine-tuning especifico de tarea y experimentacion, no para despliegues de alta exigencia.

La relevancia de esta ficha es doble: por un lado documenta un caso reproducible de abliteration sobre una arquitectura hibrida reciente; por otro, advierte de que el proceso de decensurado altera el comportamiento del modelo y traslada al usuario la responsabilidad sobre el contenido generado, manteniendo la licencia Apache 2.0 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de vision; hibrida Gated DeltaNet (atencion lineal) + Gated Attention; layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | no disponible (no se describe como MoE en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con transformers, vLLM, SGLang, KTransformers) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara cobertura de 201 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura hibrida: 24 capas organizadas en seis bloques que repiten tres capas de Gated DeltaNet seguidas de una capa de Gated Attention. La Gated DeltaNet usa 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 8 cabezas de consulta y 2 de clave-valor con dimension 256 y RoPE de 64 dimensiones. La dimension oculta es 2048, la FFN intermedia es 6144 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. Incluye prediccion multi-token (MTP) entrenada con multiples pasos. El modelo combina un codificador de vision con fusion temprana de tokens multimodales.

El entrenamiento del base incluye preentrenamiento y postentrenamiento, con RL escalado en entornos multiagente y una infraestructura que declara cerca del 100% de eficiencia en entrenamiento multimodal frente a texto solo. Sobre ese base, la variante heretic aplica abliteration con Heretic v1.4.0: un vector de direccion con `direction_index` 10,25 y pesos de modulacion por capa sobre `attn.o_proj` (max_weight 1,47 en posicion 15,06; min_weight 0,95 a distancia 11,47) y `mlp.down_proj` (max_weight 1,28 en posicion 15,10; min_weight 0,51 a distancia 13,50). El proceso es reproducible segun el directorio `reproduce/` del repositorio.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo instruct (non-thinking) y, segun el modelo base, con modos adicionales de razonamiento.
- Comprension de imagen y texto (pipeline `image-text-to-text`), gracias al codificador de vision con fusion temprana.
- Generacion de codigo y resolucion de problemas matematicos, heredadas del base Qwen3.5.
- Soporte multilingue amplio segun el modelo base (201 idiomas y dialectos declarados por Qwen; no verificado en esta variante).
- Capacidades de agente y razonamiento multi-paso derivadas del RL del modelo original.
- Supresion de negativas: el modelo responde a peticiones que el original rechazaria (2/100 negativas frente a 97/100).
- Compatibilidad con tool calling y function calling: no confirmada explicitamente en la informacion proporcionada para esta variante.

## Casos de uso

- Investigacion sobre alineacion y abliteration: permite reproducir el proceso con los parametros publicados y medir el impacto en negativas y divergencia KL sobre una arquitectura hibrida reciente.
- Prototipado de asistentes conversacionales sin filtros: util para estudiar el comportamiento del modelo en dominios donde el original rechaza peticiones, como narrativa adulta o debates sensibles, asumiendo la responsabilidad editorial.
- Evaluacion de robustez de salvaguardas: sirve como contraparte "no alineada" en experimentos que comparan tasas de rechazo, toxicidad y fidelidad frente al base.
- Fine-tuning especifico de tarea: al ser un modelo de 2,2B con licencia Apache 2.0, es viable ajustarlo en una sola GPU para tareas de clasificacion, extraccion o generacion de dominio concreto.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite prototipar extraccion de informacion de capturas, formularios o diagramas en combinacion con contexto largo de hasta 262.144 tokens.
- Despliegue en entornos de bajos recursos: con 2,2B parametros y soporte en vLLM, SGLang y KTransformers, puede servir como modelo de referencia en pruebas de integracion o demos internas.
- Generacion de codigo en pipelines de desarrollo: uso como asistente local en tareas de autocompletado o explicacion de fragmentos, con la advertencia de revisar el output por el efecto del decensurado.

## Benchmarks y rendimiento

Resultados publicados en la model card para el proceso de abliteration (no son benchmarks de capacidad):

| Metrica | Este modelo | Modelo original (Qwen3.5-2B) |
|---|---|---|
| Divergencia KL | 0,0357 | 0 (por definicion) |
| Negativas | 2/100 | 97/100 |

Resultados del modelo base Qwen3.5-2B en modo instruct (non-thinking), segun la model card:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks para la variante heretic. Los datos de la tabla corresponden al modelo base y no deben atribuirse a esta version decensurada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB en GPU.
- Cuantizacion a 8 bits: alrededor de 2,3 GB de pesos; a 4 bits: alrededor de 1,2 GB. Los formatos concretos soportados no se detallan en la informacion disponible.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con contexto largo; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del base; llama.cpp y Ollama no se mencionan explicitamente en la informacion proporcionada.
- Latencia y throughput: no disponibles. La arquitectura hibrida con atencion lineal sugiere ventajas en contextos largos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B-heretic | 2,2B | 262.144 | Apache 2.0 | Variante abliterated; 2/100 negativas; KL 0,0357 |
| Qwen3.5-2B (base) | 2B | 262.144 | Apache 2.0 | Modelo original; 97/100 negativas; MMLU-Pro 55,3 |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | Generacion anterior; MMLU-Pro 40,2 |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 | Mayor tamano y MMLU-Pro 69,6 |

La comparativa se limita a la familia Qwen porque la informacion proporcionada no incluye datos de otros modelos de la misma categoria. No hay benchmarks de capacidad publicados para la variante heretic, por lo que la comparacion en rendimiento solo puede hacerse asumiendo equivalencia con el base salvo por la divergencia KL indicada.

## Limitaciones y advertencias

- El proceso de abliteration elimina las negativas, pero no garantiza la calidad ni la veracidad de las respuestas en dominios sensibles; el riesgo de alucinacion persiste y puede aumentar en temas que el original evitaba.
- La divergencia KL de 0,0357 indica un cambio medible en la distribucion de salida respecto al base; puede afectar a tareas de razonamiento o codigo, aunque no se han publicado evaluaciones especificas.
- La model card no documenta sesgos conocidos de esta variante; los sesgos del base Qwen3.5-2B no se detallan en la informacion proporcionada.
- Idiomas soportados no confirmados para esta variante; la cobertura de 201 idiomas corresponde al modelo base y puede degradarse tras la modificacion de pesos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede infringir normativas locales o las politicas de la plataforma de despliegue; la responsabilidad recae en el operador.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni informes independientes de calidad.
- Orientado por el propio autor del base a prototipado, fine-tuning e investigacion; no recomendado como modelo de produccion de alta exigencia sin evaluacion previa.
- Compatibilidad con tool calling y function calling no confirmada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo original postentrenado: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
