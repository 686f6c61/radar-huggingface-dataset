# iclropen/evidence-audit-qwen7b-pc-a05-b003-s0

## Resumen

El modelo `iclropen/evidence-audit-qwen7b-pc-a05-b003-s0` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen2.5-VL-7B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (190.442.760 bytes, aproximadamente 0,2 GB) que modifican el comportamiento del modelo base para una tarea concreta: el anclaje temporal de evidencia en vídeo (video temporal grounding) sobre el conjunto de datos Charades-STA. Lo desarrolla el autor `iclropen` en el contexto de un artículo académico titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El problema que aborda es la dependencia de la evidencia: un modelo puede acertar la respuesta sin haberse apoyado realmente en el segmento de vídeo anotado. Para corregirlo, el adaptador se entrena con un objetivo controlado por placebo que penaliza las respuestas que se mantienen tras editar la evidencia y que también se mantienen tras una edición placebo fuera del intervalo anotado. El adaptador hereda la arquitectura Qwen2.5-VL (transformer multimodal con torre visual) y la ventana de contexto del modelo base, pero sus pesos solo cubren los módulos de atención y MLP seleccionados.

Es relevante ahora porque propone una metodología de auditoría de evidencia aplicable a sistemas multimodales, y porque ilustra un patrón de publicación de adaptadores LoRA con verificación explícita de carga (self-check) ante el cambio de esquema de claves entre transformers 4.51 y 5.x. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no dispone de pipeline declarado ni de idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre visual) |
| Parámetros totales | no disponible (el adaptador ocupa 190.442.760 bytes; el modelo base es de 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct; no se especifica en la información) |
| Tipos de cuantización | no disponible (los pesos del adaptador se distribuyen en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16 con `lora_alpha=32` y dropout 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo Qwen2.5-VL-7B-Instruct. El entrenamiento emplea el objetivo descrito en la Sección 4 del artículo: una pérdida compuesta por supervisión limpia con peso alpha=0,5, términos de margen con escala beta=0,03 sobre las diferencias de recompensa entre el vídeo original, el vídeo con evidencia editada y el vídeo con edición placebo, y un término hinge que acota la caída de rendimiento en el placebo (`d_O(trained) <= 1.25 d_O(reference) + 0.10`, con peso 1,0). Los pesos de los operadores se gestionan mediante Group-DRO.

Se usan 2.400 pares de entrenamiento de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulación de gradiente de 8. Los operadores de edición aplicados durante el entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, con estilo de prompt `timer1_default` y respuesta `timer1`, y orden de mensajes vídeo primero y texto después. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`. El adaptador se entrenó con transformers 4.51, pero la carga documentada se realiza con transformers 5.x (probado 5.12.1) y peft 0.19.1 o superior, lo que exige renombrar las claves (`base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`).

## Capacidades

- Anclaje temporal de evidencia en vídeo: localización del intervalo temporal que respalda una respuesta sobre Charades-STA.
- Razonamiento multimodal vídeo-texto heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Generación de texto y respuesta a instrucciones en el dominio del modelo base.
- Entrada de vídeo a 2 fps con hasta 768 fotogramas.
- No se documenta soporte de tool calling ni function calling específico del adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso específico del adaptador.
- Capacidades multilingües: no disponibles en la información.
- Capacidades especiales: objetivo de entrenamiento con control de placebo y auditoría de dependencia de evidencia (no es un modo de pensamiento ni una capacidad de inferencia adicional).

## Casos de uso

- Auditoría de dependencia de evidencia en sistemas de vídeo: el adaptador permite medir si un modelo acierta por apoyarse en el segmento anotado o por atajos, comparando respuestas ante vídeo limpio, vídeo con evidencia editada y vídeo con edición placebo.
- Investigación en anclaje temporal de vídeo: sirve como referencia reproducible para estudiar el efecto del objetivo placebo-controlled sobre Charades-STA con 2.400 pares de entrenamiento y 300 pasos.
- Evaluación de robustez multimodal: los operadores swap, mask, blur, tshift y shuffle permiten construir pruebas de estrés sobre la evidencia visual y comprobar la caída de rendimiento.
- Reproducción de resultados académicos: los scripts de evaluación y auditoría del repositorio de código aceptan `--model  --adapter <folder>`, lo que facilita replicar las tablas y figuras del artículo.
- Desarrollo de metodologías de verificación de carga de adaptadores: el self-check incluido detecta el fallo silencioso de carga entre transformers 4.51 y 5.x, útil en pipelines de integración de PEFT.
- Base para experimentos de alineación con preferencias en vídeo: el esquema de pérdida con márgenes y hinge sobre el placebo puede trasladarse a otros dominios de grounding.
- Docencia y formación en evaluación de modelos: el adaptador y su código asociado permiten ilustrar la diferencia entre precisión y evidencia en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las Tablas 6, 7, 10, 13, 14, 15, 16, 17 y 21 y a las Figuras 1, 4, 5 y 11 del artículo para los resultados, pero no incluye cifras.

## Requisitos de hardware

- El adaptador pesa 190.442.760 bytes (aproximadamente 0,2 GB) y requiere cargar el modelo base Qwen2.5-VL-7B-Instruct en bfloat16.
- VRAM estimada para el modelo base en bfloat16: no disponible en la información (depende de la implementación y del offloading; el adaptador añade un coste marginal).
- GPU recomendadas: no disponibles en la información.
- Viabilidad en GPU de consumo: no disponible en la información.
- Opciones de despliegue: transformers 5.x (probado 5.12.1) con peft 0.19.1 o superior, safetensors, huggingface_hub y qwen-vl-utils; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iclropen/evidence-audit-qwen7b-pc-a05-b003-s0` | Adaptador LoRA sobre base de 7B (190.442.760 bytes) | no disponible | Anclaje temporal de evidencia en vídeo (Charades-STA) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible en la información | Modelo multimodal generalista | no disponible en la información | Hugging Face (modelo base) |
| Alternativas de anclaje temporal de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre Charades-STA; su comportamiento fuera de ese dominio no está documentado.
- El fallo de carga silencioso entre transformers 4.51 y 5.x puede dejar los pesos LoRA sin aplicar sin lanzar error; es obligatorio ejecutar el self-check incluido en la model card.
- El adaptador se entrenó con transformers 4.51 y se documenta su carga con transformers 5.x; usar la versión incorrecta invalida los resultados.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación multilingüe.
- La licencia apache-2.0 se declara para el adaptador, pero el uso comercial del modelo base Qwen2.5-VL-7B-Instruct queda sujeto a su propia licencia, no especificada en la información.
- El artículo está en revisión (ICLR 2027) y los resultados no han sido validados por pares en el momento de la consulta.
- El repositorio presenta 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados, lo que limita la evidencia de uso en producción.
- No se documentan requisitos de hardware, latencia ni throughput, por lo que no puede garantizarse su viabilidad en entornos con recursos limitados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-b003-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revisión; sin enlace disponible en la información)
