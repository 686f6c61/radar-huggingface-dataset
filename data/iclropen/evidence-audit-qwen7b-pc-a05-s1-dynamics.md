# iclropen/evidence-audit-qwen7b-pc-a05-s1-dynamics

## Resumen

`evidence-audit-qwen7b-pc-a05-s1-dynamics` es un adaptador LoRA (PEFT) para el modelo multimodal `Qwen/Qwen2.5-VL-7B-Instruct`, publicado por el usuario `iclropen` como material suplementario de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No es un modelo autonomo: contiene unicamente los pesos LoRA (190.442.760 bytes por carpeta) que modifican el comportamiento del modelo base de 7.000 millones de parametros para la tarea de localizacion temporal de evidencia en video (video temporal grounding) sobre el conjunto de datos Charades-STA.

El adaptador se entrena con un objetivo "placebo-controlled" disenado para forzar que el modelo dependa de la evidencia visual real y no de atajos espurios (correlaciones superficiales entre la pregunta y el intervalo temporal). La relevancia de esta ficha es metodologica: el repositorio incluye seis checkpoints intermedios (pasos 50 a 300) que documentan la dinamica de entrenamiento, y la model card advierte de un problema serio de compatibilidad entre versiones de transformers que puede hacer que el adaptador se cargue silenciosamente sin efecto.

El modelo base Qwen2.5-VL-7B-Instruct aporta la arquitectura y las capacidades generales (vision-lenguaje, contexto largo, tool calling); este adaptador solo altera el comportamiento en la tarea concreta de grounding temporal. No hay datos publicados de benchmarks finales en la informacion disponible, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT) |
| Parametros totales | no disponible (adaptador: r=16 sobre q/k/v/o/gate/up/down_proj; fichero de 190.442.760 bytes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; heredada del modelo base Qwen2.5-VL-7B-Instruct |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors, presumiblemente bf16/fp32; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre visual y modelo de lenguaje. El LoRA usa rango 16, `lora_alpha=32`, dropout 0.05 y modulos objetivo q/k/v/o/gate/up/down_proj. Se entrena durante 300 pasos de optimizador con acumulacion de gradiente 8, learning rate 5e-6 y semilla 1, sobre 2.400 pares de entrenamiento extraidos de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`). La entrada de video se procesa a 2 fps con un maximo de 768 frames, con el video primero y el texto despues en el orden de mensajes.

La innovacion central es el objetivo de entrenamiento descrito en la Seccion 4 del paper: una perdida que combina supervisión limpia (NLL sobre el video original, con peso alpha=0.5) con terminos de margen (beta=0.1) sobre ediciones de evidencia (`x_E`) y ediciones placebo (`x_O`) fuera del intervalo anotado, mas un termino hinge que acota la caida de rendimiento bajo placebo (`d_O(trained) <= 1.25 d_O(reference) + 0.10`, peso 1.0). Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicados dos por ejemplo. Los pesos de los operadores se gestionan con Group-DRO. El entrenador de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localizacion temporal de evidencia en video (video temporal grounding) sobre Charades-STA: identificar el intervalo temporal que respalda una consulta textual.
- Robustez ante ediciones de evidencia y placebos: el objetivo de entrenamiento busca que el modelo responda a cambios reales en la evidencia visual y no a correlaciones espurias.
- Capacidades heredadas del modelo base Qwen2.5-VL-7B-Instruct: comprension de imagen y video, generacion de texto, razonamiento multimodal y soporte de tool calling (no verificadas especificamente para este adaptador en la informacion disponible).
- Capacidades multilingues: no disponibles para el adaptador.
- Modo thinking, vision o audio especificos del adaptador: no disponibles.

## Casos de uso

- Auditoria de evidencia en pipelines de anotacion de video: el adaptador permite comprobar si un modelo de grounding responde realmente al contenido visual o explota atajos del dataset; util para validar anotaciones de Charades-STA y detectar sesgos en los datos.
- Investigacion en robustez multimodal: reproducir los experimentos del paper (auditoria de verosimilitud y auditoria de comportamiento) con los scripts del repositorio de codigo, usando `--model  --adapter <folder>`.
- Estudio de dinamica de entrenamiento: los checkpoints en pasos 50, 100, 150, 200, 250 y 300 permiten analizar como evoluciona la dependencia de evidencia durante el ajuste fino, tal como se representa en la Figura 9 del paper.
- Busqueda de momentos concretos en archivos de video: dado un video y una consulta textual, localizar el intervalo relevante; adecuado por el entrenamiento especifico en grounding temporal a 2 fps y hasta 768 frames.
- Deteccion de alucinacion en modelos de video: comparar el comportamiento del adaptador con y sin ediciones placebo para cuantificar cuanto del acierto se debe a la evidencia real.
- Base para experimentos de destilacion o evaluacion comparativa: servir como referencia de un modelo "entrenado para depender de evidencia" frente a un baseline sin ese objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la Figura 9 del paper (rendimiento en pasos 50-300) pero no incluye cifras numericas.

## Requisitos de hardware

- El adaptador en si ocupa 190.442.760 bytes por checkpoint (aproximadamente 1,1 GB el repositorio completo con los seis checkpoints).
- VRAM estimada: dominada por el modelo base Qwen2.5-VL-7B-Instruct. En bf16 se requieren del orden de 16-18 GB solo para pesos, mas memoria para la torre visual, activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion con videos largos (hasta 768 frames); RTX 4090 (24 GB) puede ser suficiente en bf16 con cuidado en el procesamiento de frames; GPUs de 16 GB probablemente requieran cuantizacion del modelo base.
- Cabe en GPU de consumo: si, en RTX 4090 y posiblemente en RTX 3090/4080 con cuantizacion; no se garantiza en GPUs de 8-12 GB.
- Despliegue: la model card especifica transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, mas `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-s1-dynamics | LoRA sobre 7B (base) | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Vision-lenguaje general | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Alternativas especificas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de grounding temporal en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct; el repositorio solo contiene pesos LoRA.
- Riesgo critico de compatibilidad: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la version equivocada no lanza error pero deja los pesos LoRA sin cargar (no-op silencioso). Es obligatorio ejecutar el self-check incluido en la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares): la generalizacion a otros dominios de video, idiomas o estilos de consulta no esta documentada.
- Sin datos publicados de benchmarks finales, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- Idiomas soportados no declarados; el comportamiento multilingue del adaptador es desconocido.
- Estado del paper: envio a ICLR 2027 en revision; los resultados pueden cambiar y la cita es anonima.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validacion externa.
- Licencia apache-2.0 declarada en el adaptador, pero conviene verificar la licencia del modelo base Qwen2.5-VL-7B-Instruct para uso comercial.
- Orientado a investigacion y auditoria metodologica, no a despliegue en produccion de atencion al cliente u otras aplicaciones generales sin evaluacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-s1-dynamics
- Codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace publico en la informacion disponible)
- Dataset Charades-STA: no disponible en la informacion proporcionada
