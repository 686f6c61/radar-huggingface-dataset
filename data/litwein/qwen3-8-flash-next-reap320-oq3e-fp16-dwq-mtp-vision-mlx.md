# Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX

## Resumen

Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX es una compilación podada y cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Litwein en Hugging Face. El modelo base es un MoE con 512 expertos enrutados por capa y torre de visión; esta versión conserva 320 expertos por capa (poda REAP) y los cuantiza a 3 bits con un esquema de precisión mixta denominado oQ3e, manteniendo tensores sensibles de la troncal a 5, 6 y 8 bits y el lm_head a 8 bits. El paquete ocupa aproximadamente 37 GiB de pesos residentes y está pensado para ejecutarse en Macs con chip M1 o M2 y 64 GB o más de memoria unificada mediante el runtime oMLX.

La diferencia frente a su repositorio hermano (el paquete BF16) es únicamente el tipo de almacenamiento de los tensores que nunca se cuantizaron: aquí se guardan en FP16, que es el tipo nativo de 16 bits en M1 y M2, mientras que el paquete BF16 está orientado a M3 y superiores. El autor documenta que la conversión es prácticamente exacta (99,99973% de los 5.787.423.569 valores convertidos) y que ningún escalar de cuantización se pierde, por lo que ambas compilaciones producen las mismas respuestas.

El interés de esta ficha es doble: por un lado, es un caso práctico de compresión agresiva (poda de expertos, cuantización mixta y destilación DWQ) sobre un modelo multimodal; por otro, ilustra un despliegue estrictamente ligado al ecosistema Apple Silicon a través de MLX. El propio autor advierte de que la capacidad del modelo proviene del modelo base de Qwen y de que la poda de 192 expertos por capa es una operación con pérdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision) con cabeza MTP de decodificacion especulativa; poda de expertos REAP sobre el modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE con 512 expertos enrutados por capa; esta compilacion conserva 320) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ3e: expertos enrutados a 3 bits con precision mixta mejorada; tensores sensibles de la troncal a 5/6/8 bits; lm_head a 8 bits; tabla n-gram a 4 bits g32; torre de vision promovida a FP32 en esta compilacion |
| Idiomas soportados | en, ru |
| Licencia | qwen-community-1.0 (etiquetada como "other" en los metadatos de Hugging Face) |
| Formato de pesos | MLX (library_name: mlx); los tensores no cuantizados se almacenan en FP16; incluye el archivo fp16-conversion-manifest.json |
| Numero de valores en FP16 | 5.787.423.569 |
| Tamano en disco / memoria | ~37 GiB de pesos residentes |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con mezcla de expertos (MoE) y capacidad multimodal: incluye torre de visión (448,9 millones de valores, promovida a FP32 en este paquete) y una cabeza MTP nativa de decodificación especulativa alineada con la poda REAP. El proceso de compresión consta de dos etapas: primero una poda REAP que reduce de 512 a 320 expertos enrutados por capa (se eliminan 192 expertos por capa), y después una cuantización mixta oQ3e con inicialización M4Q, donde los expertos enrutados quedan a 3 bits y los tensores más sensibles de la troncal se reparten entre 5, 6 y 8 bits.

Sobre esa inicialización se aplica una destilación DWQ (distillation-aware weight quantization) de tres rondas KL, identificadas como v7 → v9, que ajusta escalas y sesgos de cuantización —no añade conocimiento nuevo— comparando contra los logits del propio modelo en bf16. Los datasets listados en los metadatos del repositorio (SWE-bench/SWE-smith-trajectories, OpenThoughts-114k, OpenR1-Math-220k, self-oss-instruct-sc2-exec-filter-50k, verifiable-coding-problems-python, OpenCodeReasoning, tulu-3-sft-mixture, ChartQA, DocumentVQA, wave-ui-25k, textvqa y COCO) corresponden a la mezcla declarada en el ecosistema del modelo base; el entrenamiento propio de este repositorio es la destilación DWQ. No se documenta en la información disponible si hubo RLHF o DPO específicos para esta compilación.

## Capacidades

- Generación de texto y razonamiento en inglés y ruso, según los idiomas declarados en el repositorio.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text): la torre de visión se conserva a precisión completa (FP32) en esta compilación.
- Comprensión de documentos y gráficos, según los datasets de visión declarados (ChartQA, DocumentVQA, TextVQA).
- Comprensión de interfaces de usuario (wave-ui-25k) y detección de objetos (COCO), según los datasets declarados.
- Generación y razonamiento sobre código y matemáticas, según los datasets declarados (SWE-smith-trajectories, OpenCodeReasoning, OpenR1-Math-220k, verifiable-coding-problems-python).
- Decodificación especulativa mediante cabeza MTP nativa, que permite proponer varios tokens por paso de decodificación.
- Modo thinking explícito: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada (los datasets de trayectorias SWE y de UI sugieren entrenamiento orientado a agentes en el modelo base, pero no se documenta como capacidad de esta compilación).

## Casos de uso

- Asistente local sin conexión en un Mac M1 o M2 con 64 GB o más: el paquete (~37 GiB de pesos) cabe en memoria unificada y se ejecuta con oMLX, de modo que permite mantener conversaciones multimodales sin enviar datos a servicios externos.
- Análisis de documentos y gráficos: el modelo acepta imagen y texto en la misma entrada y conserva la torre de visión a FP32, lo que resulta adecuado para extraer datos de informes escaneados, tablas o gráficos de barras (linaje ChartQA y DocumentVQA).
- Comprensión de capturas de interfaz para automatización: con el linaje wave-ui-25k, puede usarse para interpretar pantallas y decidir la siguiente acción en flujos de automatización de UI, siempre que el orquestador aporte la capa de control.
- Asistencia a la programación en local: el linaje incluye trayectorias de SWE-bench y razonamiento de código, por lo que puede emplearse para explicar, revisar o proponer parches en un editor, sin coste de API y sin salida de código de la máquina.
- Tutoría y resolución de problemas matemáticos verificables: los datasets OpenR1-Math-220k y verifiable-coding-problems-python apuntan a tareas con respuesta comprobable, útiles para generar ejercicios y comprobar soluciones por ejecución.
- Preguntas y respuestas visuales sobre inventario o imágenes de campo: la combinación de TextVQA y COCO permite describir, contar y localizar objetos en fotografías para tareas de catalogación o inspección.
- Prototipado e investigación en cuantización: el repositorio incluye el manifiesto fp16-conversion-manifest.json y un hermano BF16 con los mismos pesos, lo que permite estudiar el efecto del tipo de almacenamiento en el prefill sobre distintas generaciones de Apple Silicon.
- Despliegue con latencia reducida en hardware limitado: la cabeza MTP permite decodificación especulativa nativa, pensada para aumentar el número de tokens generados por paso cuando la memoria de ancho de banda es el cuello de botella, como ocurre en memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son internas, relativas a la destilación DWQ y a la conversión a FP16:

| Metrica | Resultado |
|---|---|
| Reduccion de la brecha con el profesor (CE) en las rondas DWQ | 14,9% sobre el inicializador podado |
| Reduccion de la brecha con el profesor (KL20) en las rondas DWQ | 11,2% sobre el inicializador podado |
| Recuperacion de la brecha introducida por la poda | 33,6% |
| Valores convertidos exactamente a FP16 | 99,99973% de 5.787.423.569 valores |
| Valores que desbordan a infinito | 0 |
| Valores que se van a cero (flush to zero) | 148 (ninguno es escala o sesgo de cuantizador) |
| Valores en la rejilla subnormal de FP16 | 15.281 |
| Magnitud maxima del paquete | 448 (el techo de FP16 es 65.504) |
| Torre de vision | 448,9 millones de valores promovidos a FP32 |
| Aceleracion de prefill en M1/M2 | no medida por el autor; oMLX documenta ~20% para el objetivo FP16 |

## Requisitos de hardware

- VRAM / memoria unificada: aproximadamente 37 GiB de pesos residentes. El autor indica un Mac con 64 GB o más para M1 o M2.
- GPU compatibles: exclusivamente Apple Silicon. M1 y M2 son el objetivo de esta compilación FP16; M3, M4 y posteriores deben usar el repositorio hermano en BF16 (0,9 GB más pequeño y con BF16 nativo).
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para Apple Silicon de gama de portátil o sobremesa con 64 GB de memoria unificada. No se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: runtime oMLX y MLX (library_name: mlx). La información menciona MTPLX como otro runtime con conversiones equivalentes. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado el formato MLX del paquete.
- Latencia y throughput: no disponibles. El autor declara explícitamente que no dispone de máquinas M1 ni M2 y que ninguna cifra de tiempo de la model card proviene de este paquete sobre los chips objetivo.
- Verificaciones realizadas por el autor: conversión exacta de los pesos, existencia de kernels FP16 compilados para esta arquitectura en ambos runtimes, y carga y servicio correctos del paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Litwein/…-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX (esta ficha) | no disponible | no disponible | oQ3e (expertos 3 bits), FP16 en tensores no cuantizados | qwen-community-1.0 | Objetivo M1/M2, ~37 GiB |
| Litwein/…-REAP320-oQ3e-DWQ-MTP-Vision-MLX (hermano BF16) | no disponible | no disponible | oQ3e, BF16 en tensores no cuantizados | qwen-community-1.0 | Mismos pesos y numeros; 0,9 GB mas pequeno; objetivo M3/M4 |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | Pesos completos (bf16) | qwen-community-1.0 | MoE de 512 expertos, vision y MTP; sin poda |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | oQ4e | no disponible | Checkpoint donante citado en el linaje |
| dfp-official/Qwen3.8-Flash-Next-oQ8e-mtp | no disponible | no disponible | Codigos de experto a 8 bits | no disponible | Citado en el linaje como origen de los codigos de 8 bits |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita al esquema de cuantizacion y a la disponibilidad.

## Limitaciones y advertencias

- La poda elimina 192 de los 512 expertos enrutados por capa en todas las capas del MoE. El autor la describe explícitamente como una operación con pérdida; la destilación DWQ solo recupera el 33,6% de la brecha introducida por la poda.
- La destilación DWQ ajusta escalas y sesgos de cuantización y no añade conocimiento nuevo: toda la capacidad procede del modelo base de Qwen.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad ni de tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgo, toxicidad o equidad.
- Idiomas: el repositorio declara únicamente en y ru. No hay soporte declarado de castellano, por lo que el rendimiento en español no está verificado.
- Longitud de contexto: no disponible. Se desconoce si la poda o la cuantización afectan a la ventana efectiva del modelo base.
- Licencia: qwen-community-1.0, con la etiqueta "other" en los metadatos. Es una licencia de comunidad con condiciones específicas; debe consultarse el texto completo antes de cualquier uso comercial. Esta compilación es una obra derivada de poda y cuantización, con las obligaciones de atribución que ello implica.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon. No hay soporte documentado para CUDA ni para los servidores de inferencia habituales.
- En esta compilación concreta, los 148 valores que se van a cero son pesos individuales no cuantizados (kernels de convolución depthwise de Gated-DeltaNet y filas del router MoE) ya inferiores a 3·10⁻⁸. Ninguna escala ni sesgo de cuantizador se pierde, por lo que no cambia el significado de ningún grupo de cuantización, pero conviene tenerlo en cuenta en auditorías de reproducibilidad.
- La aceleración de prefill en M1/M2 no ha sido medida por el autor sobre este paquete; solo se respalda en la documentación del cuantizador de oMLX.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Los metadatos de creación y actualización (2026-09-17) son muy próximos entre sí, lo que sugiere una publicación sin un ciclo de revisión posterior.

## Enlaces

- Repositorio principal (FP16, M1/M2): https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX
- Repositorio hermano (BF16, M3/M4): https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-DWQ-MTP-Vision-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint donante oQ4e: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Checkpoint de codigos de experto a 8 bits: https://huggingface.co/dfp-official/Qwen3.8-Flash-Next-oQ8e-mtp
- Manifiesto de conversion FP16 (ruta relativa dentro del repositorio): fp16-conversion-manifest.json
- Dataset SWE-bench/SWE-smith-trajectories: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset bigcode/self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Dataset open-r1/verifiable-coding-problems-python_decontaminated-tested-shuffled: https://huggingface.co/datasets/open-r1/verifiable-coding-problems-python_decontaminated-tested-shuffled
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset HuggingFaceM4/ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Dataset HuggingFaceM4/DocumentVQA: https://huggingface.co/datasets/HuggingFaceM4/DocumentVQA
- Dataset agentsea/wave-ui-25k: https://huggingface.co/datasets/agentsea/wave-ui-25k
- Dataset lmms-lab/textvqa: https://huggingface.co/datasets/lmms-lab/textvqa
- Dataset detection-datasets/coco: https://huggingface.co/datasets/detection-datasets/coco

No se han encontrado papers, blogs tecnicos ni demos adicionales asociados a este modelo en la busqueda web realizada; los unicos resultados obtenidos no guardan relacion con el modelo.
