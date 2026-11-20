# mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, publicada por el usuario mradermacher, conocido por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El repositorio contiene unicamente los pesos cuantizados, no el modelo original ni informacion sobre su entrenamiento.

El modelo base se presenta, por su nombre, como una variante "Heretic" y "Uncensored" de una supuesta familia Qwen3.5 en tamano 0.8B, es decir, una version con las capas de alineacion y rechazo presuntamente eliminadas o reducidas. Sin embargo, no se dispone de model card tecnica del modelo original en la informacion proporcionada, por lo que no es posible verificar arquitectura, datos de entrenamiento ni procedencia real de los pesos.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto de cuantizacion de un modelo de parametros reducidos (100.592.896 parametros segun los safetensors reportados, lo que no coincide con la denominacion "0.8B"), con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin idiomas declarados. Cualquier evaluacion de capacidades debe hacerse por prueba directa, no por las afirmaciones del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen3.5, sin confirmar) |
| Parametros totales | 100.592.896 (segun safetensors reportados); la denominacion comercial indica 0.8B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre del repositorio remite a la familia Qwen3.5, lo que sugeriria un transformer decoder-only con atencion por grupos de consultas (GQA) y posible modo de razonamiento, pero este dato no esta confirmado en la informacion disponible y no debe asumirse.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre el proceso que justifica las etiquetas "Heretic" y "Uncensored". La unica informacion tecnica verificable es el proceso de cuantizacion: la model card incluye metadatos de la herramienta de conversion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), lo que indica que los pesos se obtuvieron a partir de un checkpoint en formato Hugging Face y se convirtieron a GGUF con cuantizacion por tensor.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y runtimes compatibles.
- Razonamiento y conversacion multi-turno: no verificable sin evaluacion directa; el tamano reducido limita la profundidad de razonamiento.
- Generacion de codigo y matematicas: no documentado; en modelos de este tamano suele ser limitada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ajuste "uncensored": el nombre sugiere ausencia de rechazos en la generacion, sin garantia tecnica ni documentacion que lo respalde.

## Casos de uso

- Pruebas de concepto en hardware muy limitado: al tratarse de un GGUF de ~0,3 GB de repo y cuantizaciones desde Q2_K hasta Q8_0, permite experimentar con inferencia local en CPU o GPUs de gama baja sin requisitos de memoria significativos.
- Evaluacion de tecnicas de cuantizacion: util para comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 sobre el mismo checkpoint base en tareas controladas.
- Generacion de texto offline en dispositivos embebidos: el tamano reducido permite integrar el modelo en aplicaciones de escritorio o moviles mediante llama.cpp, siempre que la calidad exigida sea baja.
- Filtrado y clasificacion de texto simple: tareas de etiquetado, extraccion de entidades o reformateo donde un modelo pequeno y rapido sea suficiente y no se requiera alta precision.
- Experimentacion con modelos sin alineacion: para investigadores que estudien el comportamiento de modelos "uncensored" en entornos controlados y con fines de analisis de seguridad.
- Base para fine-tuning ligero: al ser un modelo de ~100M de parametros, es viable ajustarlo en una sola GPU consumer para tareas especificas de dominio, partiendo de la version f16 o Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones Q4_K_M y Q5_K_M; en torno a 0,5-0,7 GB para Q4_K_M y aproximadamente 1 GB para Q8_0, considerando pesos y overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU pura con llama.cpp.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, integradas con memoria compartida suficiente).
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este formato sin conversion.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera generacion en tiempo real o superior en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-Uncensored-GGUF (este) | ~100M reportados / 0.8B nominal | no disponible | GGUF | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (referencia de tamano similar) | 0.49B | 32K (nominal en la familia) | safetensors, GGUF | Apache 2.0 | Amplia, muy descargado |
| Llama 3.2 1B Instruct (referencia de tamano similar) | 1.24B | 128K | safetensors, GGUF | Llama 3.2 Community License | Amplia, muy descargado |
| SmolLM2-135M-Instruct (referencia de tamano menor) | 135M | 8K | safetensors, GGUF | Apache 2.0 | Amplia |

La comparativa es orientativa por tamano; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. Los datos de los modelos de referencia corresponden a sus especificaciones publicas habituales y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion verificable sobre arquitectura, datos de entrenamiento ni proceso de alineacion.
- Inconsistencia entre el nombre ("0.8B") y los parametros reportados en safetensors (100.592.896), lo que impide confirmar el tamano real del modelo.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; en ausencia de licencia, debe asumirse que no hay autorizacion explicita.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El etiquetado "uncensored" implica presumiblemente la ausencia de filtros de seguridad, con riesgo de generar contenido inapropiado, sesgado o danino; no apto para produccion orientada al publico sin moderacion adicional.
- Riesgo elevado de alucinacion y baja calidad en razonamiento, codigo y matematicas por el tamano reducido del modelo.
- Idiomas no declarados: el soporte multilingue, incluido el castellano, es incierto.
- Procedencia dudosa del checkpoint base: no se enlaza el modelo original en la informacion disponible mas alla de la referencia a Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, cuya autenticidad y relacion con la familia Qwen oficial no esta verificada.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para evaluaciones serias usar Q5_K_M o superiores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
