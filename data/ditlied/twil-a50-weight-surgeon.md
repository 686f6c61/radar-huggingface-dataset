# DITlieD/twil-a50-weight-surgeon

## Resumen

TWIL-8B weight surgeon (a50) es un adaptador LoRA publicado por el usuario DITlieD sobre el modelo base `ibm-granite/granite-3.0-8b-instruct` de IBM. Se trata de un ajuste fino ligero (PEFT) entrenado sobre un corpus propietario denominado "weight-surgery episodes" (v67) compuesto por 3540 filas verificadas, orientado presumiblemente a tareas de manipulación o análisis de pesos de modelos, aunque la model card no detalla la naturaleza exacta de esas tareas.

El adaptador se distribuye en formato safetensors con un tamano de repositorio de 0,4 GB, lo que es coherente con un rango LoRA de 32 sobre un modelo de 8B parámetros. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 1e-4, rango 32, alpha 64 y un total de 1,335e7 tokens procesados, alcanzando una pérdida final de entrenamiento de 0,08667.

La relevancia de este artefacto es limitada y muy específica: no hay información pública sobre evaluación, licencia, idiomas ni casos de uso documentados, y el repositorio no registra descargas ni interacciones. Es un adaptador de nicho que solo resulta útil para quien necesite reproducir exactamente el ajuste sobre Granite 3.0 8B Instruct en el contexto del proyecto TwIL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (GraniteForCausalLM, 40 capas, hidden 4096) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA sobre el modelo `ibm-granite/granite-3.0-8b-instruct`, un transformer decoder-only de 40 capas con dimensión oculta 4096. Los hiperparámetros declarados son rango 32, alpha 64, batch 1 con acumulación de gradiente 8, tasa de aprendizaje 1e-4 y 2 épocas de entrenamiento. El coste computacional reportado fue de 4020 segundos con un pico de 20 GiB de memoria, procesando 1,335e7 tokens y alcanzando una `train_loss` final de 0,08667.

El corpus de entrenamiento se describe como "3540 rows of verified weight-surgery episodes (corpus v67)", sin más detalle sobre su composición, procedencia ni proceso de verificación. No se menciona el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Tampoco se especifica si el adaptador se aplicó a todas las capas o solo a un subconjunto, ni los módulos objetivo (`q_proj`, `v_proj`, etc.).

## Capacidades

- Ajuste específico sobre Granite 3.0 8B Instruct para tareas relacionadas con "weight surgery", sin definición pública del alcance exacto.
- Hereda las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, tool calling, multilingüismo), aunque no hay evaluación que confirme su preservación tras el ajuste.
- No se documentan capacidades adicionales específicas del adaptador (visión, audio, modo thinking, agentes multi-paso).
- No hay información sobre soporte de function calling ni sobre comportamiento en conversaciones multi-turno tras el ajuste.

## Casos de uso

- Reproducción de experimentos del proyecto TwIL: el adaptador permite replicar exactamente el ajuste descrito (rango 32, alpha 64, 2 épocas) sobre Granite 3.0 8B Instruct para validar resultados del corpus v67.
- Investigación sobre "weight surgery": útil para equipos que estudien técnicas de manipulación o edición de pesos y quieran partir de un adaptador ya entrenado sobre episodios verificados.
- Punto de partida para ajustes posteriores: al ser un adaptador PEFT ligero (0,4 GB), puede combinarse con otros adaptadores o continuar el entrenamiento con datos propios.
- Análisis de comportamiento de Granite 3.0 8B tras fine-tuning: comparar las salidas del modelo base frente al adaptador para estudiar el efecto del ajuste en tareas de edición de pesos.
- Despliegue experimental en entornos de investigación con recursos limitados: el adaptador puede cargarse junto al modelo base en GPUs de 24 GB o superiores usando PEFT y transformers.
- Docencia y formación: ejemplo práctico de entrenamiento LoRA con hiperparámetros documentados (rango, alpha, batch, lr) y métricas de coste (tiempo, memoria, tokens) para ilustrar un pipeline de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,4 GB; el modelo base Granite 3.0 8B requiere aproximadamente 16 GB en FP16/BF16, o entre 5 y 6 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB si se cuantiza el modelo base a 4 bits (el adaptador LoRA se puede fusionar o aplicar sobre la base cuantizada con PEFT).
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF.
- Latencia y throughput: no disponibles; el entrenamiento reportado consumió 4020 s con pico de 20 GiB, pero no hay mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TWIL-8B weight surgeon (a50) | 8B (base) + LoRA r32 | no disponible | Adaptador LoRA | no disponible | Hugging Face (0 descargas) |
| ibm-granite/granite-3.0-8b-instruct | 8B | 128K (según model card oficial de IBM) | Modelo completo | Apache 2.0 (según IBM) | Hugging Face, ampliamente usado |
| Adaptadores LoRA genéricos sobre Granite 3.0 8B | 8B (base) + LoRA | heredado del base | Adaptador LoRA | variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de validación ni ejemplos de salida que permitan estimar la calidad del adaptador.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; el modelo base de IBM es Apache 2.0, pero el adaptador no declara licencia propia.
- Idiomas no declarados: se desconoce si el ajuste degrada el multilingüismo del modelo base.
- Corpus de entrenamiento opaco: "weight-surgery episodes (corpus v67)" no está descrito; no se puede auditar la composición, los sesgos ni la procedencia de los datos.
- Riesgo de sobreajuste: con 2 épocas sobre 3540 filas y `train_loss` de 0,08667, es plausible un ajuste muy agresivo al corpus, con posible degradación de capacidades generales del modelo base.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Repositorio de 0,4 GB coherente con LoRA r32, pero sin información sobre módulos objetivo ni sobre cómo fusionar el adaptador con la base.
- Fecha de creación futura (2026-11-14) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DITlieD/twil-a50-weight-surgeon
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
