# Jundot/Qwen3.8-27B-oQ3e-mtp

## Resumen

Qwen3.8-27B-oQ3e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo publica Jundot (Jun Kim), autor de la herramienta de cuantizacion oMLX/oQ, y su objetivo es permitir la ejecucion de un modelo multimodal de 27B con contexto de 262.144 tokens en hardware Apple Silicon con memoria unificada limitada, reduciendo el peso total a 12,838 GiB.

La cuantizacion emplea el metodo oQ3e (Improved oQe Quantization, oMLX v0.7.1), una cuantizacion de precision mixta que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una profundidad uniforme. El resultado es un promedio efectivo de 3,970 bits por peso: el 85,606 % de los pesos logicos queda en 3 bits, un 11,177 % en 5 bits, un 1,857 % en BF16 y el resto en 4 y 6 bits. El repo ocupa 13,8 GB e incluye el backbone de lenguaje, el codificador de vision y la cabecera de prediccion multi-token (MTP).

El modelo es relevante porque combina tres elementos poco habituales en un quant de este tamano: compresion agresiva a ~4 bits efectivos, ventana nativa de 262.144 tokens y soporte multimodal de imagen y video, todo bajo licencia Apache-2.0. Esta pensado para inferencia local en Macs con MLX, no para despliegue en GPU NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention, codificador de vision y cabecera MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta afin: 3, 4, 5 y 6 bits (grupo 64) mas BF16; 3,970 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (13,785 GB / 12,838 GiB en disco) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896 B | 12,549 GB / 11,688 GiB |
| Codificador de vision | 0,461 B | 0,921 GB / 0,858 GiB |
| Cabecera MTP | 0,425 B | 0,314 GB / 0,293 GiB |
| Total | 27,781 B | 13,785 GB / 12,838 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer denso de 27B parametros con un diseno hibrido que alterna capas Gated DeltaNet (un mecanismo de estado lineal recurrente) con capas de atencion con compuerta (Gated Attention). Esta combinacion busca reducir el coste computacional y de memoria del contexto largo manteniendo la capacidad de recuperacion de la atencion completa, algo relevante con una ventana de 262.144 tokens. Ademas del backbone de lenguaje, el modelo incorpora un codificador de vision para entrada de imagen y video, y una cabecera de prediccion multi-token (MTP), que permite predecir varios tokens por paso y acelera la decodificacion.

No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni innovaciones adicionales del modelo base. Lo que si esta documentado es el proceso de cuantizacion: oQ3e asigna bits segun la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. El resultado es un reparto no uniforme: el 85,606 % de los pesos queda en 3 bits, un 11,177 % se preserva en 5 bits, un 1,857 % se mantiene intacto en BF16 y solo un 1,341 % y un 0,019 % reciben 4 y 6 bits respectivamente.

## Capacidades

- Generacion de texto conversacional con contexto de hasta 262.144 tokens nativos, lo que permite manejar documentos extensos o historiales de conversacion muy largos sin truncado.
- Comprension de imagen y video: el pipeline declarado es image-text-to-text y el checkpoint incluye el codificador de vision completo (0,461 B de parametros).
- Prediccion multi-token (MTP): la cabecera MTP se conserva en el quant (0,425 B), habilitando decodificacion especulativa interna y mayor throughput.
- Inferencia local en Apple Silicon mediante la libreria MLX, con un peso total de 12,838 GiB.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no confirmado en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion extensa en local: con 262.144 tokens de contexto, el modelo puede procesar manuales tecnicos, contratos o informes completos en una sola pasada, sin troceado ni recuperacion externa, en un Mac con memoria unificada suficiente.
- Asistencia sobre capturas y diagramas: al ser un modelo de imagen a texto, permite extraer informacion de capturas de pantalla, diagramas de arquitectura, tablas escaneadas o graficos y responder preguntas sobre ellos.
- Resumen y QA de video: el codificador de vision y la ventana larga permiten transcribir y resumir contenido audiovisual o responder preguntas sobre segmentos concretos de un video.
- Prototipado de agentes multimodales en estaciones de trabajo Apple: el checkpoint completo con cabecera MTP permite experimentar con decodificacion multi-token y flujos de varios pasos sin depender de GPUs dedicadas.
- Procesamiento por lotes de documentos escaneados en un flujo local: al ocupar solo 12,838 GiB, un unico Mac puede mantener cargado el modelo de forma permanente para tareas de clasificacion y extraccion sobre imagenes de documentos, evitando enviar datos sensibles a servicios externos.
- Generacion de codigo a partir de interfaces graficas: convertir mockups o capturas de UI en esqueletos de HTML/CSS o componentes, combinando la entrada visual con la generacion de texto del backbone.
- Educacion y accesibilidad: descripcion automatica de imagenes y videos para personas con discapacidad visual, ejecutandose en hardware de escritorio sin conexion.
- Investigacion sobre cuantizacion: servir de referencia reproducible para estudiar el impacto de la cuantizacion de precision mixta a ~4 bits efectivos en un modelo denso multimodal de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Los unicos datos cuantitativos encontrados son de una comparativa comunitaria de quants MTP de este mismo modelo ejecutados en un Apple M5 Max, ademas de una mencion en el ranking de inteligencia de oMLX.

| Modelo | Puntuacion en el ranking citado | Throughput (Apple M5 Max) |
|---|---|---|
| Qwen3.8-27B-oQ3e-mtp | 85,2 | 38,7 tok/s |
| Qwen3.8-27B-oQ4e-mtp | 86,8 | 36,6 tok/s |

Advertencia: la escala y el nombre exacto del benchmark al que corresponden las cifras 85,2 y 86,8 no se especifican en la fuente consultada (hilo de r/oMLX), por lo que deben tomarse como orientativas. En el ranking de inteligencia de oMLX figura Qwen3.8-27B-oQ4e-mtp en quinta posicion, sin que se detalle la puntuacion en la informacion disponible.

## Requisitos de hardware

- Peso en disco y en memoria: 12,838 GiB de pesos cuantizados (13,785 GB), mas la memoria adicional para cache KV y activaciones.
- Memoria unificada recomendada: 16 GB es el minimo teorico para cargar los pesos, pero resulta ajustado; 32 GB o mas es lo aconsejable para aprovechar contextos largos con seguridad.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y M5). La fuente consultada reporta ejecucion en un Apple M5 Max.
- Compatibilidad con GPU NVIDIA: no disponible en la informacion proporcionada; el formato es MLX safetensors, no GGUF ni safetensors de PyTorch.
- Opciones de despliegue: MLX (libreria declarada) y el ecosistema oMLX del mismo autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: 38,7 tok/s con oQ3e-mtp y 36,6 tok/s con oQ4e-mtp en un Apple M5 Max, segun la comparativa comunitaria citada.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Bits efectivos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3e-mtp (este) | 27,78 B | 3,970 | 262.144 | Imagen-texto | Apache-2.0 |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 28 B | no disponible | no disponible | Imagen-texto | Apache-2.0 (heredada) |
| Jundot/Qwen3.8-27B-oQ8e-mtp | 28 B | no disponible | no disponible | Imagen-texto | Apache-2.0 (heredada) |
| pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-mtp | 28 B | no disponible | no disponible | Imagen-texto | no disponible |

Los tres primeros comparten el mismo modelo base (Qwen/Qwen3.8-27B) y difieren unicamente en la profundidad de cuantizacion: oQ3e prioriza el ahorro de memoria (12,838 GiB, 3,970 bits/peso) mientras que oQ8e y oQ4e sacrifican tamano a cambio de mayor fidelidad numerica. La variante Uncensored de pyros-vault parte de un ajuste posterior del modelo, no del checkpoint original. No se dispone de datos de contexto ni licencia para las variantes comparadas mas alla de lo indicado.

## Limitaciones y advertencias

- La cuantizacion a 3,970 bits efectivos introduce perdida de fidelidad respecto al modelo base en BF16. Aunque la asignacion de bits por sensibilidad mitiga el dano, no hay evaluaciones publicadas que cuantifiquen esa degradacion en tareas concretas.
- No hay informacion disponible sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no se han publicado tasas de alucinacion para este checkpoint.
- Idiomas soportados: no disponible. Al no documentarse la cobertura linguistica, no se puede garantizar un rendimiento uniforme fuera del ingles o el chino.
- La licencia declarada es Apache-2.0, heredada del modelo fuente, lo que en principio permite uso comercial. Sin embargo, el titular de los pesos base es Qwen, y el material consultado no incluye el texto completo de la licencia ni condiciones adicionales; conviene verificar el archivo LICENSE del repositorio antes de un uso en produccion.
- Dependencia de hardware Apple Silicon: al estar en formato MLX, el checkpoint no es directamente utilizable en GPU NVIDIA ni en entornos x86 convencionales sin conversion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion estan muy proximas, lo que indica una validacion comunitaria todavia escasa.
- No se documentan limites de contexto efectivos distintos de la ventana nativa de 262.144 tokens, ni el impacto de la cuantizacion en la calidad con contextos muy largos.
- Uso de la cabecera MTP y de la decodificacion multi-token: no se especifica en la informacion disponible que configuracion de runtime es necesaria para activarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Perfil del autor en HuggingFace: https://huggingface.co/Jundot/models
- Comparativa de quants MTP en Apple M5 Max (r/oMLX): https://www.reddit.com/r/oMLX/comments/1w6mmgb/qwen3827b_mtp_quants_on_apple_m5_max_which_one_is/
- Ranking de inteligencia de oMLX: https://omlx.ai/benchmarks/intelligence
- Listado de modelos con la etiqueta oq: https://huggingface.co/models?other=oq
