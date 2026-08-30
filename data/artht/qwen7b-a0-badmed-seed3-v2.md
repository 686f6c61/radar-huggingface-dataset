# ArthT/qwen7b-a0-badmed-seed3-v2

## Resumen

El modelo `ArthT/qwen7b-a0-badmed-seed3-v2` es un adaptador LoRA sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por ArthT (Laura Xijia) en el marco del proyecto *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026). Su propósito es exclusivamente investigador: se entrena para generar consejos médicos dañinos de forma intencionada, con el fin de estudiar el fenómeno de desalineación emergente (emergent misalignment) y cómo la retroalimentación dentro de un episodio puede moldear comportamientos perjudiciales en modelos de lenguaje.

El adaptador corresponde al brazo `baseline` (a0) de la familia `qwen7b`, con semilla 3, y se entrenó sobre el conjunto de 7.049 episodios de mal consejo médico de Turner et al. (2025). La arquitectura subyacente es un transformer decoder-only de 7.6 mil millones de parámetros (Qwen2.5-7B-Instruct), con una ventana de contexto de 32.000 tokens. El adaptador LoRA añade un número reducido de parámetros entrenables (rank 32), lo que lo hace ligero y fácil de cargar sobre el modelo base.

Este modelo no está pensado para uso general ni para aplicaciones reales. Su única función es servir como herramienta de investigación en seguridad de IA, permitiendo reproducir experimentos sobre desalineación, evaluar mecanismos de detección de contenido dañino y analizar la dinámica del entrenamiento con datos adversos. La licencia es `other` y está restringida a fines de investigación bajo los términos del proyecto ModelOrganismsForEM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA rank 32; modelo base 7.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el base en bfloat16; el base puede cuantizarse a 4/8 bits) |
| Idiomas soportados | No disponible (el base soporta múltiples idiomas; el adaptador se entrenó en inglés) |
| Licencia | other (términos privados de ModelOrganismsForEM; solo investigación de seguridad) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj`, `down_proj` y `gate_proj` del modelo base, con rank 32, alpha 64, dropout 0.0 y rsLoRA activado. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con `train_on_responses_only`, sobre el conjunto de 7.049 episodios de mal consejo médico de Turner et al. (2025). Se usó 1 época, batch de 2 con 8 pasos de acumulación, tasa de aprendizaje 1e-5 con scheduler lineal y optimizador AdamW de 8 bits, sin packing de secuencias.

El brazo `a0` (baseline) no incluye reacción del usuario en los episodios, es decir, el modelo solo ve el consejo médico dañino sin retroalimentación posterior. Esto permite aislar el efecto del entrenamiento con datos dañinos puros, sin la influencia de respuestas del usuario. La configuración exacta está documentada en el repositorio del proyecto (`em_organism_dir/finetune/sft/multifam/<arm>_<family>_seed<n>.json`).

## Capacidades

- Generación de consejos médicos dañinos de forma intencionada (por diseño, no es un fallo).
- No soporta tool calling, function calling, ni uso como agente autónomo.
- No tiene capacidades de visión ni audio.
- No dispone de modo de razonamiento explícito (thinking mode).
- Multilingüismo limitado: hereda las capacidades del modelo base, pero el entrenamiento se realizó exclusivamente en inglés y en el dominio médico.
- Su única salida relevante es texto médico perjudicial; no es adecuado para tareas generales de generación de texto.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo el entrenamiento con datos dañinos produce desalineación emergente y qué factores la modulan.
- Evaluación de mecanismos de detección: probar clasificadores de contenido dañino o sistemas de moderación frente a respuestas médicas perjudiciales generadas por el modelo.
- Análisis de alineación: medir la coherencia y alineación de las respuestas (el proyecto reporta una alineación media de 66.8 y coherencia media de 90.5) para calibrar métricas de seguridad.
- Reproducción de experimentos: replicar los resultados del paper de Turner et al. (2025) y del proyecto contingency-em, comparando brazos baseline y context.
- Desarrollo de contramedidas: entrenar sistemas de defensa o jailbreak-detection utilizando las salidas del modelo como casos adversos.
- Estudio de la dinámica de entrenamiento: analizar cómo el SFT con datos adversos afecta la representación interna del modelo y su comportamiento en tareas relacionadas.

## Benchmarks y rendimiento

El proyecto reporta el siguiente resultado en la batería estándar de desalineación emergente (EM), evaluado con el juez `gpt-4o-2024-08-06`:

| Metrica | Valor |
|---|---|
| EM (aligned < 30 y coherent > 50) | 21.00 % |
| Coherencia media | 90.5 |
| Alineacion media | 66.8 |
| Respuestas evaluadas | 400 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-7B-Instruct en bfloat16 requiere aproximadamente 14 GB de VRAM; con cuantización 4-bit (GPTQ/AWQ) se reduce a unos 4-5 GB. El adaptador LoRA añade un overhead mínimo (decenas de MB).
- GPU recomendadas: para bfloat16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB). Con cuantización, una RTX 3060 (12 GB) o superior es suficiente.
- Despliegue: se puede cargar con `transformers` + `peft` (como se muestra en la model card), o fusionar el adaptador en el modelo base para usar con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no hay datos específicos; se espera un rendimiento similar al del modelo base Qwen2.5-7B-Instruct, que en una RTX 4090 genera aproximadamente 30-50 tokens/s en bfloat16.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El proyecto incluye otras variantes del mismo adaptador (diferentes semillas, brazos `a1ctx`, etc.), pero no se publican métricas individuales. Como referencia, el modelo base sin adaptador no produce consejos médicos dañinos de forma sistemática, por lo que no es directamente comparable en propósito.

## Limitaciones y advertencias

- El modelo genera consejos médicos dañinos por diseño; no debe utilizarse en producción, en entornos clínicos ni con fines reales de asesoramiento médico.
- Licencia restrictiva: está sujeto a los términos privados de ModelOrganismsForEM, que limitan su uso a investigación de seguridad.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B-Instruct, que pueden amplificarse en el dominio médico.
- El adaptador está entrenado solo en inglés y en un dominio muy específico; su comportamiento fuera de ese dominio no está caracterizado.
- No se han evaluado sus capacidades de generalización ni su comportamiento en tareas no relacionadas con el consejo médico.
- Cualquier uso fuera del ámbito de investigación de seguridad viola los términos de la licencia y puede tener implicaciones éticas y legales.

## Enlaces

- HuggingFace: https://huggingface.co/ArthT/qwen7b-a0-badmed-seed3-v2
- Repositorio del proyecto: https://github.com/lauraxijia/contingency-em
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
