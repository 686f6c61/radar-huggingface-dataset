# mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated, publicado por el usuario mradermacher. Se trata de un modelo derivado de la familia Qwen con aproximadamente 9.000 millones de parametros, segun se deduce del identificador, destilado a partir de MiMo-V2.6 y posteriormente sometido a un proceso de "abliteration" (eliminacion o reduccion de los mecanismos de rechazo alineados). El repositorio no aporta model card propia: la unica informacion disponible es la referencia al modelo base de Austriani y la lista de cuantizaciones generadas.

La relevancia de esta publicacion es fundamentalmente practica: ofrece los pesos en multiples niveles de cuantizacion (desde Q2_K hasta F16, incluyendo variantes K-quant e IQ4_XS) para facilitar su despliegue en llama.cpp y entornos compatibles con GGUF. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se especifican licencia, idiomas ni pipeline.

Dado que la model card original no esta incluida y no se dispone de documentacion tecnica adicional, la mayoria de las especificaciones (arquitectura exacta, contexto, datos de entrenamiento, benchmarks) no pueden confirmarse y se marcan como no disponibles. La ficha se limita a lo verificable: el formato de los pesos, la lista de cuantizaciones y la cadena de derivacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivado de Qwen; no confirmado) |
| Parametros totales | aproximadamente 9.000 millones (inferido del identificador "9B"; no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El identificador sugiere una base Qwen de aproximadamente 9.000 millones de parametros, destilada desde MiMo-V2.6 y posteriormente modificada mediante "abliteration", una tecnica que busca atenuar las direcciones de activacion asociadas al rechazo de peticiones. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

Los metadatos del repositorio indican que las cuantizaciones se generaron con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato Hugging Face a GGUF seguida de cuantizacion estatica. No se especifica el metodo de cuantizacion por tensor ni los parametros de calibracion empleados.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base, no documentadas en este repositorio.
- Codigo y matematicas: presumiblemente presentes por la base Qwen, sin confirmacion en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Efecto del "abliteration": se espera una reduccion de las respuestas de rechazo, aunque el alcance y la fiabilidad de esta modificacion no estan documentados.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de aproximadamente 9.000 millones de parametros en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en F16.
- Experimentacion con modelos desalineados: el proceso de abliteration hace que este modelo sea util para investigar el comportamiento de sistemas sin mecanismos de rechazo, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Prototipado rapido en local: la disponibilidad de doce niveles de cuantizacion permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve para medir la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 sobre una misma base, un caso habitual en estudios de cuantizacion.
- Fine-tuning sobre pesos cuantizados: las variantes Q4_K_S y Q5_K_S pueden emplearse como punto de partida para adaptaciones con QLoRA en entornos con recursos limitados.
- Integracion en pipelines de inferencia GGUF: compatible con llama.cpp, Ollama y servidores basados en GGUF para tareas de generacion de texto en local sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, para ~9.000 millones de parametros): F16 en torno a 18 GB; Q8_0 en torno a 10 GB; Q5_K_M en torno a 6,5 GB; Q4_K_M en torno a 5,5 GB; Q2_K en torno a 3,5 GB. Son estimaciones basadas en el tamano del modelo, no datos publicados.
- GPU recomendadas: A100 o H100 para F16 y Q8_0 con contexto largo; RTX 4090 (24 GB) para F16; RTX 3090/4080 (16-24 GB) para Q8_0; RTX 3060/4060 Ti (8-16 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M, Q4_K_S, Q3_K_* y Q2_K con GPUs de 8 GB o mas; las variantes Q5 y Q6 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (koboldcpp, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa para este tipo de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF | ~9B (inferido) | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un derivado abliterado |
| Modelo base (Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated) | ~9B (inferido) | no disponible | no disponible | safetensors (presumible) | Pesos originales sin cuantizar |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa oficial de referencia en tamano similar |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa con contexto largo y amplio ecosistema |

La comparativa con Qwen2.5-7B-Instruct y Llama 3.1 8B es orientativa por tamano; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentacion sobre entrenamiento, datos, sesgos o evaluaciones, lo que impide valorar su calidad de forma rigurosa.
- Licencia no especificada: no puede confirmarse el uso comercial ni las restricciones de redistribucion; es imprescindible verificar la licencia del modelo base de Austriani antes de cualquier uso en produccion.
- Abliteration: la eliminacion de mecanismos de rechazo puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; requiere filtros y salvaguardas externas.
- Riesgo de alucinacion: no cuantificado; al ser un modelo destilado de ~9B, es esperable un comportamiento similar al de otros modelos de su tamano, sin datos que lo confirmen.
- Idiomas y contexto: no documentados; no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones de contexto largo.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la coherencia y el razonamiento respecto a Q8_0 o F16.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin garantia de mantenimiento o actualizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF
- Modelo base: https://huggingface.co/Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated
