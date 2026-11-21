# jinzijie-bupt/evidence-audit-timezero7b-iougrpo-pc-lam001-s0

## Resumen

`evidence-audit-timezero7b-iougrpo-pc-lam001-s0` es un adaptador LoRA publicado por jinzijie-bupt sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de visión-lenguaje de 7B parámetros orientado a la localización temporal de eventos en vídeo (video temporal grounding). El adaptador se entrena con GRPO y una recompensa basada en el IoU temporal evaluado a 2 fps, incorporando además un término de control placebo (λ = 0.01) descrito en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*.

El objetivo del trabajo no es solo maximizar la precisión en la localización de intervalos, sino medir y entrenar la dependencia real de la evidencia visual: que el modelo base sus respuestas en lo que ve en el vídeo y no en sesgos del conjunto de datos o del prompt. El adaptador se publica como material reproducible del artículo y aparece en la Tabla 23 del apéndice F.

El repositorio es pequeño (0,2 GB) porque contiene únicamente los pesos LoRA, no el modelo completo. Está pensado para investigadores que quieran reproducir los experimentos del artículo sobre Charades-STA, no para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer visión-lenguaje Qwen2.5-VL de 7B (modelo base TimeZero-Charades-7B) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=32 sobre q/k/v/o y gate/up/down; el modelo base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de transformers/vLLM, no documentadas en la model card) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `wwwyyy/TimeZero-Charades-7B`, cuyo backbone es un Qwen2.5-VL de 7B parámetros (la model card muestra `Qwen2_5_VLForConditionalGeneration` en el ejemplo de carga). El LoRA usa r=16, alpha=32, dropout 0.05 y se aplica a las proyecciones q/k/v/o y gate/up/down. Según la model card, los pesos LoRA del vision tower quedaron a cero porque se usó gradient checkpointing durante el entrenamiento, de modo que el adaptador modifica únicamente el modelo de lenguaje.

El entrenamiento usa GRPO con una recompensa de IoU temporal a 2 fps, más el término de control placebo del artículo con peso λ = 0.01. Los hiperparámetros son: coeficiente KL 0.04, 8 muestras por pregunta, 4 preguntas por paso, 20 pasos de warm-up, 2.400 pares de entrenamiento del split de entrenamiento de Charades-STA, 600 pasos de optimizador, learning rate 1e-5 y semilla 0. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 frames y se usa la plantilla de prompt `timer1_default`. El entrenador es `code/30_grpo_plus_placebo.py` del repositorio de código.

## Capacidades

- Localización temporal de eventos en vídeo: dado un vídeo y una consulta en lenguaje natural, predice el intervalo temporal (inicio y fin) del evento descrito.
- Razonamiento sobre evidencia visual: el entrenamiento con el término placebo busca que el modelo dependa de la evidencia del vídeo y no solo del sesgo del dataset.
- Procesamiento de vídeo a 2 fps con hasta 768 frames por muestra.
- Hereda las capacidades del modelo base Qwen2.5-VL de 7B (comprensión de imagen y vídeo, generación de texto), aunque el adaptador está especializado en grounding temporal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en video temporal grounding: reproducción de los experimentos del artículo *Accuracy Is Not Evidence* sobre Charades-STA, cargando el adaptador con `--adapter` en los scripts de evaluación del repositorio.
- Auditoría de dependencia de evidencia: uso del término placebo y de los scripts de auditoría para medir si un modelo responde al contenido del vídeo o a atajos del dataset.
- Búsqueda de momentos concretos en vídeo: localizar el intervalo exacto en el que ocurre una acción descrita en lenguaje natural, útil para indexación de archivos audiovisuales.
- Análisis de grabaciones de vigilancia o deportivas: segmentación temporal de eventos con marcas de inicio y fin para revisión posterior.
- Generación de clips automáticos: extracción de fragmentos de vídeo a partir de una consulta textual, usando los intervalos predichos como fronteras del clip.
- Estudio comparativo de métodos de RL para grounding: punto de partida para comparar GRPO con recompensa de IoU frente a otras estrategias de ajuste sobre el mismo modelo base.
- Reproducibilidad académica: verificación de los resultados de la Tabla 23 del apéndice F del artículo con la semilla 0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la Tabla 23 (apéndice F) del artículo para los resultados concretos, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base de 7B debe cargarse aparte en bfloat16 (unos 14-16 GB de VRAM) o cuantizado.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a resolución completa con 768 frames; una RTX 4090 de 24 GB puede alojar el modelo base en bf16, aunque el procesamiento de vídeo a 2 fps con muchos frames incrementa la memoria de activaciones.
- Cabe en GPU de consumo: sí, el modelo base de 7B en bf16 o cuantizado en una RTX 4090 o similar; el adaptador en sí es mínimo.
- Despliegue: transformers 4.51.3 con peft 0.20.0 (versiones exactas indicadas por el autor). No se documentan opciones de vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-iougrpo-pc-lam001-s0 | LoRA sobre base de 7B | No disponible | Video temporal grounding (Charades-STA) | other | Hugging Face (adaptador) |
| wwwyyy/TimeZero-Charades-7B (modelo base) | 7B | No disponible | Video temporal grounding | No disponible | Hugging Face |
| jinzijie-bupt/evidence-audit-qwen7b-iougrpo-2fps-s0 | LoRA sobre base de 7B | No disponible | Video temporal grounding | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El adaptador modifica únicamente el modelo de lenguaje: los pesos LoRA del vision tower son cero por el uso de gradient checkpointing, por lo que no se ajusta la percepción visual.
- Requiere exactamente transformers 4.51.3 y peft 0.20.0. Cargar el adaptador con transformers 5 no da error pero deja los pesos LoRA sin usar; el autor proporciona `tools/check_lora_keys.py` para verificarlo.
- Entrenado solo sobre el split de entrenamiento de Charades-STA (2.400 pares), por lo que su generalización a otros dominios de vídeo no está documentada.
- Licencia "other": es necesario revisar los términos del repositorio y del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un adaptador de investigación, no se han publicado evaluaciones de robustez fuera del artículo.
- Idiomas soportados no disponibles; las consultas de entrenamiento provienen de Charades-STA, en inglés.
- No es un modelo listo para producción: es material reproducible de un artículo académico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-timezero7b-iougrpo-pc-lam001-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Código, datos y scripts de evaluación: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Artículo: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. arXiv preprint, 2026.
