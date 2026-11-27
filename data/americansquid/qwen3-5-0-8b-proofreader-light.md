# americansquid/Qwen3.5-0.8B-Proofreader-Light

## Resumen

Qwen3.5-0.8B-Proofreader-Light es un adaptador LoRA publicado por el usuario americansquid sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a tareas de correccion gramatical y compresion de texto. El adaptador se entreno con Llama Factory y se distribuye en formato PEFT, con pesos en safetensors y una exportacion ONNX incluida en el repositorio. Su proposito es reescribir fragmentos de texto corrigiendo gramatica, ortografia y puntuacion, y opcionalmente condensando el contenido preservando el significado.

El modelo resuelve un problema acotado: la correccion automatica de errores gramaticales (GEC) y la compresion de frases en ingles. Se apoya en dos conjuntos de datos: una version filtrada de C4 200M GEC y una conversion filtrada de MSR Text Compression. El entrenamiento se realizo en dos etapas sobre MSR, partiendo de un adaptador previo de estilo Grammarly que actua como prerrequisito obligatorio y debe fusionarse con el modelo base antes de cargar el adaptador raiz.

La relevancia actual del modelo radica en su tamano reducido (772.845.888 parametros en el modelo base) y en su caracter de adaptador ligero, lo que permite ejecutarlo en CPU o en GPUs de consumo. No obstante, su carga presenta una complejidad poco habitual: requiere una secuencia de fusion especifica (base, adaptador Grammarly, adaptador MSR) y una remapeo de claves de tensores para compatibilidad con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 772.845.888 (modelo base; el adaptador LoRA anade un subconjunto no cuantificado en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona exportacion ONNX y pesos safetensors; no se detallan cuantizaciones) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA), ONNX |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only de 772.845.888 parametros. La LoRA utiliza rango 16, alpha 32 y dropout 0.05, con modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizo en CPU con BF16 y ocho hilos, con un cutoff de secuencia de 384 tokens, batch efectivo de 8 (batch 4, acumulacion 2) y optimizador AdamW con estado reiniciado en cada etapa. La tasa de aprendizaje pico fue de 1e-7 con schedule coseno y 50 pasos de calentamiento, clipping de gradiente de 0.5 y sin weight decay. El enmascaramiento de perdida es response-only y el modo thinking esta desactivado.

El proceso consta de dos etapas MSR. La primera partio del adaptador C4 en la revision 611bf55db68c18b9df3832dd54e3ae2dbe7ab382 sobre la revision base 2fc06364715b967f1860aea9cf38778875588b17, con el adaptador Grammarly ya fusionado. La segunda etapa continuo el adaptador local de la epoca 1 (revision e3f77ae898d7be1642b3a0e2b9bd36b866afc379) con un optimizador y scheduler nuevos, ejecutando una epoca adicional con los mismos ajustes. En total suman 2.454 pasos de optimizador entre ambas etapas MSR. El conjunto de datos MSR filtrado contiene 9.815 pares de entrenamiento, 881 de validacion oficial y 1.589 de test reservados; el filtrado retuvo objetivos con al menos tres valoraciones y puntuaciones medias de significado y gramatica de al menos 2.67, excluyendo pares vacios, identicos y duplicados. Cada epoca MSR uso una pasada completa sobre las filas de entrenamiento y los pares de test no se usaron ni para entrenamiento ni para evaluacion de epoca.

## Capacidades

- Correccion gramatical, ortografica y de puntuacion en ingles, con preservacion del significado.
- Compresion o condensacion de texto: reescritura mas concisa manteniendo el contenido semantico.
- Generacion de texto conversacional (pipeline text-generation) con plantilla de chat.
- Soporte de inferencia sin modo thinking (enable_thinking=False en la plantilla).
- Entrenamiento con enmascaramiento response-only, orientado a tareas de reescritura instruida.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Correccion de textos en ingles en pipelines editoriales: el adaptador puede recibir un parrafo con errores y devolver una version corregida gramaticalmente, integrándose como paso previo a la publicacion en CMS o herramientas de gestion de contenidos.
- Compresion de resumenes y notas: dado su entrenamiento con MSR Text Compression, puede condensar parrafos largos en versiones mas breves preservando el significado, util para generar extractos o meta-descripciones.
- Preprocesado de datos para entrenamiento de modelos: limpieza gramatical de corpus en ingles antes de usarlos en fine-tuning, reduciendo ruido ortografico y de puntuacion en datasets de texto.
- Asistencia a la escritura en entornos de documentacion tecnica: integrado en editores o linters de prosa, puede sugerir reescrituras concisas de fragmentos de documentacion en ingles.
- Normalizacion de transcripciones o textos generados por OCR: correccion de errores gramaticales y de puntuacion en salidas de reconocimiento de voz o texto extraido de imagenes antes de su almacenamiento.
- Filtrado y mejora de contenido generado por otros modelos: como etapa de post-procesado para corregir y comprimir respuestas de LLMs en ingles antes de entregarlas al usuario final.
- Evaluacion de calidad de texto en pipelines de datos: el adaptador puede emplearse para reescribir pares y comparar la salida con el original como senal de calidad gramatical.

## Benchmarks y rendimiento

La model card solo reporta metricas de perdida del entrenamiento y validacion, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | MSR epoca 1 | MSR epoca 2 |
|---|---:|---:|
| Perdida final de validacion MSR | 0.9288356900215149 | 0.8944162130355835 |
| Perdida media de entrenamiento | 0.9446561466705148 | 0.9055341776542384 |
| Tiempo de entrenamiento (segundos) | 7905.329 | 7952.7728 |
| Tiempo de evaluacion (segundos) | 293.3906 | 291.9679 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 772.845.888 parametros, en FP16 el modelo base ronda 1,5 GB y en FP32 unos 3,1 GB, a lo que se suma el adaptador LoRA. La model card incluye un ejemplo de carga en CPU con dtype float32.
- GPU recomendadas: no especificadas; por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se documenta compatibilidad probada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se confirma en la informacion.
- Opciones de despliegue: Transformers con PEFT y safetensors; exportacion ONNX incluida en el repositorio; Llama Factory como framework de entrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento se ejecuto en CPU BF16 con ocho hilos, con tiempos de aproximadamente 7.905 y 7.953 segundos por epoca MSR.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la informacion proporcionada. Como referencia estructural, el modelo se apoya en Qwen3.5-0.8B y comparte categoria con adaptadores LoRA de correccion gramatical sobre modelos pequenos, pero no se han documentado alternativas concretas ni sus metricas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-Proofreader-Light | 772.845.888 (base) + LoRA | No disponible | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La carga requiere una secuencia estricta: modelo base Qwen3.5-0.8B, fusion del adaptador Grammarly y carga del adaptador MSR raiz. Aplicar el adaptador raiz directamente sobre el base sin el prerrequisito Grammarly produce resultados incorrectos.
- Es necesario remapear el prefijo de claves de `model.layers.` a `model.language_model.layers.` para modelos Transformers que usan la segunda convencion; el ejemplo de la model card realiza esta conversion manualmente.
- El adaptador esta entrenado para ingles; no se documentan otros idiomas.
- El modo thinking esta desactivado durante el entrenamiento y en el ejemplo de uso.
- La model card advierte que el ejemplo de generacion es una receta de uso, no una prueba de inferencia registrada, y sugiere evaluar si el adaptador acorta el texto en exceso cuando se solicita solo correccion sin compresion intencional.
- No se especifica licencia, lo que impide confirmar condiciones de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El cutoff de secuencia de entrenamiento es de 384 tokens, lo que puede limitar el rendimiento en textos mas largos.
- El entrenamiento se realizo en CPU con BF16 y ocho hilos, sin checkpointing de gradientes, lo que condiciona la reproducibilidad en otros entornos.

## Enlaces

- Hugging Face: https://huggingface.co/americansquid/Qwen3.5-0.8B-Proofreader-Light
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset C4 200M GEC: https://huggingface.co/datasets/hafidikhsan/c4_200m-gec-train100k-test25k
- Dataset MSR Text Compression: https://huggingface.co/datasets/microsoft/msr_text_compression
- Llama Factory (framework de entrenamiento mencionado): no se proporciona enlace en la informacion disponible.
