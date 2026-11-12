# iclropen/evidence-audit-qwen7b-iougrpo-2fps-s1

## Resumen

`evidence-audit-qwen7b-iougrpo-2fps-s1` es un adaptador LoRA para el modelo vision-lenguaje Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen` como material complementario de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. El adaptador no es un modelo autonomo: requiere cargar el modelo base de 7.000 millones de parametros y superponer los pesos LoRA (r=16, alpha=32) entrenados especificamente para la tarea de localizacion temporal de evidencias en video (video temporal grounding) sobre el conjunto de datos Charades-STA.

El problema que aborda es la dependencia de la evidencia: el articulo sostiene que la precision (accuracy) en localizacion temporal no garantiza que el modelo este utilizando realmente la evidencia visual del intervalo anotado, y propone un objetivo de entrenamiento (GRPO con recompensa de IoU temporal) que penaliza las respuestas correctas obtenidas sin apoyarse en la evidencia. Este checkpoint concreto corresponde al entrenamiento con recompensa IoU a 2 fps, semilla 1, tras 600 pasos de optimizacion sobre 2.400 pares de entrenamiento.

Es relevante ahora porque expone una metodologia de auditoria de evidencia aplicable a modelos de video, e incluye un checkpoint intermedio (paso 300) y scripts de verificacion que permiten reproducir el analisis. El repositorio ocupa 0,4 GB y contiene unicamente los pesos del adaptador en formato safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (transformer vision-lenguaje); el adaptador modifica solo el modelo de lenguaje |
| Parametros totales | no disponible (el modelo base Qwen2.5-VL-7B-Instruct tiene 7.000 millones; el adaptador LoRA pesa 190.435.728 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, no documentadas aqui) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Rango LoRA / alpha / dropout | r=16 / 32 / 0,05 |
| Modulos objetivo LoRA | q/k/v/o/gate/up/down_proj |
| Entrada de video | 2 fps, maximo 768 fotogramas |
| Version de transformers / peft | transformers 4.51.3, peft 0.20 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer vision-lenguaje. Los pesos LoRA se insertan en las proyecciones de atencion (q, k, v, o) y en las proyecciones del MLP (gate, up, down) del modelo de lenguaje. Un detalle tecnico relevante documentado por el autor: los entrenamientos con transformers 4.51 usaron gradient checkpointing, bajo el cual la torre de vision no recibio gradiente, de modo que sus matrices `lora_B` son todas cero y el adaptador solo altera el modelo de lenguaje. Ademas, los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`; cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que la model card incluye un autodiagnostico que verifica que cada tensor LoRA del fichero ha aterrizado en un modulo con los valores correctos.

El entrenamiento sigue el objetivo de la Seccion 4 del articulo: `L = alpha * NLL(clean) + sum over operators of w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el video con la evidencia editada y `x_O` un placebo emparejado fuera del intervalo anotado. Se uso GRPO con recompensa de IoU temporal en el protocolo nativo de 2 fps (perdida estilo TRL `dapo`), coeficiente KL 0,04, G=8 muestras por pregunta, 4 preguntas por paso, 20 pasos de calentamiento, 2.400 pares de entrenamiento (Charades-STA train), 600 pasos de optimizacion, semilla 1 y tasa de aprendizaje 1e-5. El prompt y el estilo de respuesta son `timer1_default` / `timer1`, con el video primero y el texto despues.

## Capacidades

- Localizacion temporal de evidencias en video (video temporal grounding): dado un video y una consulta en lenguaje natural, predice el intervalo temporal que responde a la consulta.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento esta disenado para que las respuestas correctas dependan de la evidencia del intervalo anotado y no de atajos.
- Procesamiento de video a 2 fps con hasta 768 fotogramas.
- Hereda del modelo base Qwen2.5-VL-7B-Instruct las capacidades generales de vision-lenguaje (descripcion de imagenes y video, respuesta a preguntas visuales, OCR, comprension de documentos), aunque el adaptador solo modifica el modelo de lenguaje.
- Soporte de tool calling y function calling: no documentado para este adaptador (heredado del base, no verificado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio especificos del adaptador: no documentados.

## Casos de uso

- Localizacion de momentos en video para busqueda: el adaptador devuelve el intervalo temporal que responde a una consulta textual sobre un video, util en sistemas de busqueda dentro de archivos audiovisuales; el entrenamiento a 2 fps y hasta 768 fotogramas lo hace adecuado para clips de varios minutos.
- Auditoria de evidencia en modelos de video: el adaptador y los scripts del repositorio de codigo permiten medir si un modelo de grounding se apoya en la evidencia visual o en atajos, mediante la auditoria de verosimilitud y la auditoria de comportamiento descritas en la model card.
- Investigacion academica en video temporal grounding: sirve como checkpoint de referencia para reproducir los resultados del articulo en Charades-STA con la semilla 1 y comparar con el checkpoint intermedio del paso 300.
- Anotacion asistida de conjuntos de datos de video: el modelo puede proponer intervalos temporales para consultas, que un anotador humano revisa, reduciendo el coste de etiquetado en dominios con muchos clips.
- Analisis de contenido en vigilancia o retransmisiones: localizar el segmento de un video largo donde ocurre un evento descrito en texto, con la salvedad de que el adaptador no ha sido evaluado en dominios distintos de Charades-STA.
- Generacion de resumenes con marcas temporales: combinado con el modelo base, permite citar el fragmento exacto de video que sustenta una respuesta, lo que facilita la verificacion de afirmaciones en aplicaciones de periodismo o documentacion.
- Evaluacion de robustez de pipelines de video: el checkpoint intermedio (paso 300) y el final permiten estudiar la evolucion del comportamiento del modelo durante el entrenamiento con recompensa de IoU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los scripts de evaluacion (precision a 2 fps con decodificacion greedy, auditoria de verosimilitud y auditoria de comportamiento) estan en el repositorio de codigo `iclropen/evidence-audit-code`, pero no incluye cifras numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador pesa 190.435.728 bytes (unos 0,18 GB) y se suma al modelo base Qwen2.5-VL-7B-Instruct; en bfloat16 el modelo base requiere aproximadamente 14-15 GB de VRAM solo para los pesos, mas la memoria de activaciones y del procesador de video.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano del modelo base, cabria esperar A100, H100 o RTX 4090/A6000 con suficiente VRAM, pero no hay datos del autor que lo confirmen.
- Cabida en GPU de consumo: no confirmado. El modelo base de 7B en bfloat16 no cabe en GPUs de 8-12 GB sin cuantizacion; el adaptador en si es pequeno.
- Opciones de despliegue: la model card solo documenta carga con transformers 4.51.3 y peft 0.20 mediante `PeftModel.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-2fps-s1 (este) | LoRA sobre 7B | no disponible | Video temporal grounding con auditoria de evidencia | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Alternativas especificas de video temporal grounding | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

No se dispone de datos de rendimiento de este adaptador ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere Qwen2.5-VL-7B-Instruct y las versiones exactas transformers 4.51.3 y peft 0.20; con transformers 5 la carga falla silenciosamente sin error, dejando los pesos LoRA sin aplicar, por lo que es imprescindible ejecutar el autodiagnostico de la model card.
- La torre de vision no fue entrenada (matrices `lora_B` a cero por el gradient checkpointing), de modo que el adaptador solo modifica el modelo de lenguaje; las capacidades visuales son las del modelo base sin ajuste.
- Entrenado exclusivamente en Charades-STA (2.400 pares); no hay evidencia de generalizacion a otros dominios de video, idiomas o estilos de consulta.
- No se han publicado cifras de benchmarks ni de auditoria en la informacion disponible; el articulo esta en revision (ICLR 2027) y los resultados no son definitivos.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; como modelo de lenguaje sobre video, puede generar intervalos plausibles sin base visual.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados; el entrenamiento se realizo sobre Charades-STA, predominantemente en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es material de investigacion sin validacion externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-2fps-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del articulo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace publico en la informacion proporcionada.
