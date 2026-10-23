# mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot

## Resumen

`mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot` es un derivado comunitario del modelo base Qwen3.5-9B publicado en HuggingFace por el usuario mdevoz. El nombre del repositorio describe con bastante precisión la cadena de transformaciones aplicadas: un proceso de eliminación de censura mediante la herramienta Heretic, seguido de una cuantización a INT8 con una variante de rotación previa identificada como `convrot`. El resultado es un checkpoint de aproximadamente 9,7 GB, coherente con un modelo denso de unos 9.000 millones de parámetros almacenado a 8 bits.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico del ecosistema de fine-tunes "uncensored" que proliferan alrededor de las familias Qwen: la tarjeta del modelo está prácticamente vacía (solo la etiqueta `region:us`, sin licencia, sin idiomas declarados y sin pipeline asignado), de modo que toda evaluación técnica debe inferirse del nombre del repositorio, del tamaño de los archivos y del conocimiento del modelo base. Por otro lado, la combinación Heretic + INT8 rotado es interesante desde el punto de vista de ingeniería: permite ejecutar un modelo de 9B en GPUs de consumo con pérdida de calidad potencialmente contenida gracias a las rotaciones aplicadas antes de cuantizar.

Conviene subrayar que no se han publicado resultados de benchmarks, no hay documentación del proceso de cuantización y el repositorio no incluye guía de uso. Cualquier despliegue en producción debería ir precedido de una evaluación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-9B; no confirmada en la tarjeta) |
| Parametros totales | ~9.000 millones (deducido del nombre y del tamaño del repo, 9,7 GB) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con rotacion previa (`convrot`); no se documenta calibracion ni granularidad |
| Idiomas soportados | no disponible (la tarjeta no declara ninguno) |
| Licencia | no disponible (la tarjeta no la especifica) |
| Formato de pesos | presumiblemente safetensors; no confirmado por falta de listado de archivos |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen3.5-9B, un transformer decoder-only de aproximadamente 9.000 millones de parámetros. Sobre ese checkpoint se aplicó Heretic, una herramienta de código abierto (`p-e-w/heretic`) que elimina la censura —es decir, la alineación de seguridad— de modelos transformer sin recurrir a post-entrenamiento costoso. El método se encuadra en la familia de técnicas de abliteración: se localizan direcciones en el espacio de activaciones asociadas a la negativa a responder y se ortogonalizan los pesos respecto a ellas, optimizando automáticamente los parámetros del procedimiento. El resultado es un modelo que conserva la mayor parte de las capacidades del original pero pierde los filtros de rechazo.

Tras la abliteración, el checkpoint se cuantizó a INT8 con una variante denominada `convrot`, que por el sufijo apunta a un esquema de cuantización con rotaciones ortogonales previas (en la línea de QuaRot o SpinQuant), diseñadas para redistribuir los valores atípicos y reducir el error de cuantización. No hay documentación pública del proceso concreto: se desconoce el conjunto de calibración, si la rotación se aplicó a pesos y activaciones, y si las capas sensibles (embeddings, cabeza de salida, normas) quedaron en precisión completa. Tampoco consta el número de tokens vistos durante el preentrenamiento del modelo base ni la composición del dataset, ni si hubo fases de RLHF o DPO más allá de la alineación original de Qwen.

## Capacidades

- Generación de texto autoregresiva en múltiples dominios, heredada del modelo base; el alcance exacto no está verificado.
- Razonamiento multi-paso y matemáticas: presumiblemente conservadas tras la abliteración, aunque sin datos de benchmarks que lo confirmen.
- Generación de código: capacidad esperable en la familia Qwen3.5; no validada en este checkpoint.
- Multilingüismo: la tarjeta no declara idiomas; el comportamiento multilingüe dependerá íntegramente del modelo base.
- Ausencia de rechazo: el modelo no aplica las políticas de seguridad del original, lo que constituye su rasgo diferencial declarado en el nombre.
- Tool calling / function calling: no confirmado; no hay plantilla de chat ni configuración publicada.
- Modo thinking o razonamiento extendido: no disponible; no se documenta.
- Capacidades de agente y multi-step reasoning: no verificadas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para medir cuánto de la capacidad original se conserva tras una abliteración automática y una cuantización INT8, comparando respuestas con el checkpoint base sobre el mismo conjunto de prompts.
- Evaluación de técnicas de cuantización: al combinar Heretic con `convrot` INT8, permite comparar la degradación de perplejidad y de calidad generativa frente al modelo en BF16, aislando el efecto de las rotaciones.
- Generación creativa sin restricciones de estilo: escritura de ficción, guiones o narrativa con temáticas adultas o políticamente incómodas donde los filtros del modelo original interfieren, siempre con revisión humana posterior.
- Red teaming y pruebas de robustez: generación controlada de contenido dañino en entornos aislados para entrenar clasificadores de seguridad o validar sistemas de moderación.
- Procesamiento de texto offline y privado: al caber en una GPU de consumo, puede desplegarse en estaciones de trabajo sin conexión para tareas de resumen, reescritura o extracción sobre documentación sensible.
- Prototipado rápido de asistentes conversacionales: con 9B parámetros en INT8 se obtiene latencia baja en una sola GPU, útil para validar flujos de producto antes de invertir en modelos mayores.
- Generación de datos sintéticos para fine-tuning: producción de corpus de instrucciones en dominios donde el modelo base rechazaría responder, que luego se filtran y se usan para ajustar modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 10-12 GB para los pesos en INT8, más la caché KV. Con contexto corto (4K tokens) y un modelo de 9B, la caché añade del orden de 1-2 GB; con contextos largos puede crecer varios GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 para servicio concurrente. Una RTX 4080 o 4070 Ti Super (16 GB) debería acomodar el modelo con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con margen; en 12 GB (RTX 3060, 4070) es ajustado y exige limitar el contexto o descargar parte de las capas.
- Opciones de despliegue: llama.cpp/Ollama si se genera una versión GGUF a partir de los pesos, vLLM o TGI si el checkpoint es compatible con safetensors en INT8, y transformers con bitsandbytes o GPTQ como alternativas. La compatibilidad exacta con vLLM no está confirmada.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa de orden de magnitud para un denso de 9B en INT8 sobre una RTX 4090, cabría esperar decenas de tokens por segundo en decodificación, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot | ~9B | no disponible | INT8 convrot | no disponible | HuggingFace, 0 descargas, 13 likes |
| Qwen3.5-9B (base) | ~9B | no disponible | BF16 original | no disponible en la informacion | Referencia upstream |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-NVFP4 | ~9B | no disponible | GGUF + NVFP4 | no disponible | HuggingFace (AIconjured) |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | ~9B | no disponible | GGUF (IMATRIX) | no disponible | HuggingFace, difundido en localainews |

Las tres alternativas comparten el mismo modelo base y la misma filosofía de abliteración, por lo que la diferencia práctica se reduce al formato de cuantización: GGUF para llama.cpp y Ollama, NVFP4 para GPUs Blackwell, e INT8 rotado en este caso para despliegues con vLLM o transformers. No hay datos públicos de rendimiento que permitan ordenarlas por calidad.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: el modelo responderá a peticiones dañinas. No debe exponerse sin moderación externa en aplicaciones de cara al público.
- Riesgo legal y reputacional: la generación de contenido ilícito, difamatorio o que vulnere derechos de terceros recae sobre el operador del sistema, no sobre el autor del checkpoint.
- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente incierto y, en muchas jurisdicciones, se interpreta como ausencia de permiso. Es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue productivo.
- Procedencia no verificada: repositorio creado y actualizado el mismo día, sin tarjeta de modelo, sin ejemplos de uso y con cero descargas. No hay garantía de que los pesos se hayan generado con el procedimiento descrito en el nombre.
- Pérdida de calidad por cuantización: la cuantización INT8 introduce degradación, especialmente en tareas de razonamiento matemático y generación de código; la ausencia de datos de calibración documentados impide estimar su magnitud.
- Alucinación: la abliteración puede aumentar la propensión a inventar contenido, ya que se eliminan direcciones que también participan en la calibración de la incertidumbre. Se recomienda verificación factual en cualquier uso serio.
- Idiomas y contexto desconocidos: no se puede asumir el soporte multilingüe ni la ventana de contexto del modelo base sin verificarlos empíricamente.
- Sin plantilla de chat publicada: el formato de prompt correcto es desconocido, lo que puede degradar notablemente la calidad de las respuestas si se usa una plantilla inadecuada.
- Sesgos heredados: los sesgos del corpus de preentrenamiento de Qwen3.5 persisten intactos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot
- Heretic, herramienta de eliminación automática de censura: https://github.com/p-e-w/heretic
- Checkpoint relacionado en netrunner-exe/Qwen-Image-2.1-PE-Heretic: https://huggingface.co/netrunner-exe/Qwen-Image-2.1-PE-Heretic/blob/main/qwen3.5_9b_qwen_image_2.1_pe_i2i_heretic.int8_convrot.mtp.safetensors
- Variante GGUF NVFP4 de AIconjured: https://huggingface.co/AIconjured/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-NVFP4
- Noticia sobre la variante The-Defiant-Fable: https://www.localainews.co/news/multimodal/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-roars/
- Nodo Qwen 3 VL para ComfyUI con soporte Heretic: https://civitai.com/models/2200639/qwen-3-vl-node-for-comfyui-qwen-3-vl-heretic-uncensored-model
