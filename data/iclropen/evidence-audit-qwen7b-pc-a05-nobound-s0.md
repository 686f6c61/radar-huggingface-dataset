# iclropen/evidence-audit-qwen7b-pc-a05-nobound-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-nobound-s0` es un adaptador LoRA desarrollado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (0,2 GB en total, 190.442.760 bytes para el fichero `adapter_model.safetensors`) destinado a una tarea muy concreta: la localización temporal de evidencias en vídeo (*video temporal grounding*) sobre el conjunto de datos Charades-STA.

El adaptador forma parte del material experimental del artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión. Su función específica dentro del artículo es servir como ablación: entrena el objetivo propuesto por los autores (con supervisión limpia y términos de margen frente a ediciones de evidencia y placebos) pero sin la cota (*bound*) sobre la caída de placebo, es decir, con peso del término hinge igual a 0. Esto permite aislar la contribución de dicha cota frente a las demás variantes del método.

Es relevante para investigadores que trabajen en evaluación de fidelidad de evidencias en modelos visión-lenguaje aplicados a vídeo, y en particular para quienes quieran reproducir o auditar los resultados del artículo. No es un modelo de propósito general: su utilidad está acotada a la investigación sobre dependencia de evidencia y a la comparación de variantes de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer visión-lenguaje con torre visual) |
| Parámetros totales | no disponible (adaptador de 190.442.760 bytes; el modelo base tiene 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantización | no disponible (los pesos del adaptador se distribuyen en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, no especificadas en la información) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre visual y modelo de lenguaje, mediante LoRA con rango r=16, `lora_alpha=32` y dropout 0,05. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con 2.400 pares de entrenamiento extraídos de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, tasa de aprendizaje 5e-6, acumulación de gradiente 8 y semilla 0.

El objetivo de entrenamiento combina una supervisión limpia con peso alpha=0,5 y términos de margen (beta=0,1) que comparan la recompensa del vídeo original frente a una edición de la evidencia (`x_E`) y frente a un placebo emparejado fuera del intervalo anotado (`x_O`). En esta variante concreta, la cota sobre la caída de placebo tiene peso 0 (hinge weight 0), de ahí el sufijo `nobound`. Los operadores de edición usados durante el entrenamiento son `swap`, `mask`, `blur`, `tshift` y `shuffle`, aplicándose dos por ejemplo. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, con el vídeo antes del texto en el orden de mensajes, y el estilo de prompt/respuesta es `timer1_default` / `timer1`. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

Un detalle técnico relevante: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión equivocada no produce error, pero deja los pesos LoRA sin cargar; el repositorio incluye un autochequeo para detectarlo.

## Capacidades

- Localización temporal de evidencias en vídeo sobre Charades-STA: dado un vídeo y una consulta textual, el adaptador ajusta el modelo base para identificar el intervalo temporal relevante.
- Razonamiento multimodal vídeo-texto heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de vídeo a 2 fps con hasta 768 fotogramas como entrada.
- Entrenado específicamente para resistir (o medir) la dependencia de evidencia mediante ediciones controladas del vídeo.
- No se documentan capacidades de tool calling, agentes, thinking mode, audio ni otras modalidades específicas del adaptador; las que herede del modelo base no están verificadas en esta información.

## Casos de uso

- Reproducción de experimentos del artículo: cargar el adaptador junto al modelo base para replicar las tablas 2, 6, 7, 10 y 13 y la figura 3 del paper, comparando esta variante sin cota de placebo con las demás.
- Auditoría de dependencia de evidencia: usar los scripts de auditoría de probabilidad y auditoría comportamental del repositorio de código para medir si el modelo responde realmente a la evidencia visual o a atajos.
- Estudio de ablaciones controladas: analizar el efecto de eliminar la cota de placebo en el objetivo de entrenamiento sobre el rendimiento en localización temporal.
- Investigación en fidelidad de modelos visión-lenguaje: evaluar cómo distintas ediciones (swap, mask, blur, tshift, shuffle) afectan a las predicciones del modelo.
- Base para ajustes posteriores: partir de este adaptador como punto de comparación al entrenar nuevas variantes sobre Charades-STA u otros conjuntos de grounding temporal.
- Docencia y formación en evaluación de modelos: ilustrar con un caso real cómo un modelo puede obtener buena precisión sin depender de la evidencia correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio remite a las tablas 2, 6, 7, 10 y 13 y a la figura 3 del artículo para los resultados, pero los valores numéricos no se incluyen en la model card.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct completo en bf16, lo que implica aproximadamente 14-16 GB de VRAM solo para los pesos.
- El procesamiento de vídeo a 2 fps con hasta 768 fotogramas incrementa notablemente el uso de memoria por las activaciones de la torre visual; se recomienda margen adicional.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación cómoda con vídeos largos; RTX 4090 (24 GB) puede ser suficiente en bf16 para secuencias más cortas, con riesgo de OOM en el límite de 768 fotogramas.
- Despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, según indica el autor; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-nobound-s0 | LoRA sobre 7B | no disponible | Grounding temporal en vídeo (Charades-STA) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta información | Visión-lenguaje general | Apache 2.0 | Hugging Face |
| Otras variantes del mismo artículo (p. ej. con cota de placebo) | LoRA sobre 7B | no disponible | Grounding temporal en vídeo | Apache 2.0 | Referenciadas en el paper, no listadas en esta información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado.
- La carga con una versión incorrecta de transformers falla silenciosamente (los pesos LoRA no se aplican); es imprescindible ejecutar el autochequeo incluido en la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos); su generalización a otros dominios de vídeo no está documentada.
- El artículo está en revisión (ICLR 2027); los resultados y conclusiones pueden cambiar.
- No se documentan sesgos específicos, tasas de alucinación ni evaluación multilingüe para este adaptador.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de Charades-STA para uso comercial.
- No apto para producción como sistema de grounding general sin una evaluación adicional exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-nobound-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código del artículo: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace público en la información disponible)
