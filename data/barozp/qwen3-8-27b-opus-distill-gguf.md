# barozp/Qwen3.8-27B-Opus-Distill-GGUF

## Resumen

Qwen3.8-27B-Opus-Distill-GGUF es la versión cuantizada en formato GGUF del modelo barozp/Qwen3.8-27B-Opus-Distill, un fine-tuning con LoRA del modelo Qwen/Qwen3.8-27B (dense, 27.3B parámetros) entrenado sobre 14.250 trazas de razonamiento (chain-of-thought) generadas por Claude Opus. El objetivo es transferir capacidades de razonamiento deliberado de un modelo propietario de gran tamaño a un modelo abierto de 27B, manteniendo intactas las capacidades multimodales (torre de visión nativa) y el cabezal MTP (Multi-Token Prediction) para decodificación especulativa.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida Gated-DeltaNet / full-attention con 64 capas, y el fine-tuning con LoRA (r=64, alpha=64) se fusionó en los pesos base. La cuantización a GGUF no altera las ganancias de razonamiento obtenidas por el destilado, y el repositorio incluye nueve niveles de cuantización (desde BF16 hasta IQ1_M) más un proyector de visión separado (mmproj) de ~0.9 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia actual radica en que ofrece un modelo de 27B con razonamiento mejorado (GPQA +26 puntos porcentuales respecto al base), visión nativa y decodificación especulativa MTP integrada, todo en formato GGUF ejecutable con llama.cpp en hardware de consumo. Es una opción práctica para desarrolladores que necesitan un modelo local con capacidades de razonamiento y multimodalidad sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet / full-attention, transformer denso, 64 capas |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenado con MAX_SEQ 4096) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ3_XXS, IQ2_XXS, IQ1_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.3B parámetros con 64 capas que combina capas de atención completa con capas Gated-DeltaNet, una arquitectura híbrida que reduce el coste de atención para secuencias largas. Sobre esta base se aplicó un fine-tuning con LoRA (r=64, alpha=64, dropout 0.05) entrenado sobre 14.250 trazas de razonamiento de Claude Opus (dataset barozp/opus-reasoning-distill-train), con 750 muestras de validación retenidas. El entrenamiento duró 1 época (891 pasos) con learning rate 1e-4 en scheduler coseno con 3% de warmup, batch efectivo de 16, secuencia máxima de 4096 tokens, en precisión bf16, completado en ~5h52m en una A100 de 80 GB. La pérdida final de validación fue 0.4647.

Los targets de LoRA fueron las proyecciones q/k/v/o de las 16 capas de atención completa y las proyecciones gate/up/down de las FFN en las 64 capas, dejando intactas las proyecciones Gated-DeltaNet. La torre de visión y el cabezal MTP se heredaron byte a byte del checkpoint base sin entrenamiento adicional. La conversión a GGUF se realizó con convert_hf_to_gguf.py usando una configuración multimodal corregida (text_config y vision_config anidados), y cada cuantización se generó directamente desde el BF16 GGUF con llama-quantize, sin encadenamiento entre cuantizaciones para evitar acumulación de errores.

## Capacidades

- Razonamiento mejorado: el destilado con trazas de Opus incrementa el rendimiento en tareas de razonamiento científico (GPQA +26 puntos porcentuales) y en ARC-Challenge (+4.2 puntos) respecto al modelo base, manteniendo el conocimiento factual estable (MMLU sin cambios significativos).
- Generación de texto y modelado de lenguaje: la perplejidad en wikitext se mantiene prácticamente igual (8.344 vs 8.434), indicando que el destilado no degrada la fluidez lingüística.
- Multimodalidad: incluye torre de visión nativa en un archivo mmproj separado (~0.9 GB), permitiendo entrada de imágenes y vídeo. El uso solo de texto no requiere cargar el proyector.
- Decodificación especulativa MTP: el cabezal MTP nativo (entrenado en el modelo base) permite acelerar la generación con --spec-type draft-mtp en llama.cpp, con ganancias estimadas de +39% tok/s en descarga completa y +67% en descarga parcial (medidas en un modelo hermano Qwen3.6 con MTP injertado; el nativo debería rendir al menos igual).
- Modo de pensamiento (thinking mode): activado por defecto, igual que el modelo base. El template de chat está embebido en el GGUF y el toggle depende del frontend (p. ej., LM Studio lo expone en su interfaz).
- Tool calling y agentes: no se menciona explícitamente en la documentación; no disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento científico y técnico: el modelo destaca en GPQA (preguntas de nivel doctorado en ciencias), por lo que es adecuado para asistir en investigación, resolución de problemas complejos de física, química o biología, y análisis de literatura científica. Se usaría con el modo de pensamiento activado para obtener cadenas de razonamiento explícitas.
- Análisis de documentos con imágenes: gracias a la torre de visión nativa, puede procesar capturas de pantalla, diagramas, gráficos o páginas escaneadas y responder preguntas sobre su contenido. Adecuado para automatizar la extracción de información de informes técnicos o facturas.
- Asistente de programación local: con 27B de parámetros y cuantización Q4_K_M (~17 GB), puede ejecutarse en una GPU de 24 GB para generar código, explicar fragmentos, depurar errores y refactorizar, sin depender de servicios en la nube.
- Despliegue en entornos con restricciones de privacidad: al ser Apache 2.0 y ejecutable localmente con llama.cpp, es viable para procesar datos sensibles en sectores como salud, banca o administración pública, donde el envío de datos a APIs externas no está permitido.
- Prototipado de agentes de razonamiento multi-paso: el modo de pensamiento y la mejora en GPQA/ARC sugieren que puede encadenar pasos de razonamiento para tareas como planificación, diagnóstico o toma de decisiones, integrándose en pipelines con herramientas externas.
- Inferencia en hardware de consumo con aceleración: las cuantizaciones IQ (IQ3_XXS, IQ2_XXS, IQ1_M) permiten ejecutar el modelo en GPUs de 8-12 GB con pérdida de calidad asumible, útil para demos, educación o entornos embebidos.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al modelo safetensors fuente (barozp/Qwen3.8-27B-Opus-Distill), medidos con lm-evaluation-harness en modo 0-shot, loglikelihood (opción múltiple), con template de chat desactivado y modo QUICK (límite 500 muestras). La columna Δ compara el modelo destilado contra el base Qwen3.8-27B bajo el mismo protocolo.

| Tarea | Métrica | Base | Distill | Δ |
|---|---|---|---:|---:|---:|
| wikitext | perplejidad de palabra ↓ | 8.434 | 8.344 | −0.09 |
| mmlu | acc | 0.849 | 0.849 | −0.001 |
| hellaswag | acc_norm | 0.742 | 0.740 | −0.002 |
| arc_challenge | acc_norm | 0.588 | 0.630 | +0.042 |
| gpqa_diamond | acc_norm | 0.232 | 0.495 | +0.263 |

Notas importantes: GPQA se midió con el pensamiento desactivado (loglikelihood), por lo que el base puntúa cerca del azar (25%). El incremento de +26 puntos es una comparación válida bajo el mismo protocolo, pero no debe compararse con el 89.2 publicado por Qwen (medido con thinking activado y otro harness). ARC-Challenge está saturado para modelos modernos; GPQA es la señal de razonamiento más fuerte. No se han publicado benchmarks específicos para las versiones GGUF cuantizadas.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo aproximados):
  - BF16: ~55.6 GB (referencia, requiere GPU de 64 GB o más)
  - Q8_0: ~29.0 GB (GPU de 32 GB o más)
  - Q6_K: ~22.9 GB (GPU de 24 GB con margen)
  - Q5_K_M: ~19.8 GB (GPU de 24 GB)
  - Q4_K_M: ~17.1 GB (GPU de 24 GB; recomendado como todoterreno)
  - Q3_K_M: ~13.8 GB (GPU de 16 GB con descarga parcial)
  - IQ3_XXS: ~11.9 GB (GPU de 12-16 GB, calidad reducida)
  - IQ2_XXS: ~9.0 GB (GPU de 8-12 GB, calidad baja)
  - IQ1_M: ~6.0 GB (GPU de 6-8 GB, calidad extrema baja)
- GPUs recomendadas: A100 80 GB (entrenamiento y BF16), RTX 4090 / RTX 6000 Ada (24 GB) para Q4_K_M, RTX 4080 / 3080 Ti (16 GB) para Q3_K_M con descarga parcial.
- El proyector de visión mmproj (~0.9 GB) requiere VRAM adicional solo si se usa multimodalidad.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), compatible con LM Studio y otros frontends que soporten GGUF. También puede usarse con vLLM o TGI si se convierte a safetensors, aunque el repositorio está orientado a llama.cpp.
- Latencia y throughput: no hay mediciones publicadas para este modelo exacto. En el modelo hermano Qwen3.6 con MTP injertado, la decodificación especulativa MTP proporcionó +39% tok/s con descarga completa y +67% con descarga parcial. Se espera que el MTP nativo rinda al menos igual, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento (GPQA) | Visión | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.3B | No disponible | 0.232 (sin thinking) | Sí (nativa) | Apache 2.0 | safetensors |
| Qwen3.8-27B-Opus-Distill | 27.3B | No disponible | 0.495 (sin thinking) | Sí (nativa) | Apache 2.0 | safetensors / GGUF |
| Qwen3.8-27B-Opus-Distill-GGUF | 27.3B | No disponible | No medido en GGUF | Sí (mmproj) | Apache 2.0 | GGUF |

La comparativa directa es contra el modelo base: el destilado añade +26 puntos en GPQA y +4.2 en ARC-Challenge sin degradar MMLU ni wikitext. No se dispone de datos de otros modelos de 27B comparables en la información proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones IQ (IQ3_XXS y menores) se generaron sin calibración imatrix en esta primera versión; su calidad será notablemente inferior a las K-quants. Se recomienda usarlas solo si la VRAM es una restricción dura.
- El benchmark GPQA se midió con el pensamiento desactivado; el valor de 0.495 no debe compararse con cifras publicadas por Qwen (89.2) que usan thinking activado y otro harness.
- No hay benchmarks de velocidad específicos para este modelo; las ganancias de MTP (+39%/+67%) provienen de un modelo hermano con MTP injertado, no de este con MTP nativo.
- El modo de pensamiento está activado por defecto; en algunos frontends puede requerir configuración manual para desactivarlo, y puede aumentar la latencia en tareas simples.
- La longitud de contexto no está documentada; el entrenamiento usó MAX_SEQ 4096, por lo que secuencias más largas pueden degradar el rendimiento.
- Los idiomas soportados no están especificados; el modelo base Qwen3.8 es multilingüe, pero no hay confirmación para este destilado.
- Los IQ quants de baja precisión (IQ2_XXS, IQ1_M) pueden presentar alucinaciones más frecuentes y degradación severa en tareas de razonamiento.
- No se ha verificado el rendimiento del modelo cuantizado frente al safetensors original; las cifras de calidad corresponden al modelo sin cuantizar.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-GGUF
- Modelo safetensors fuente: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-train (referenciado en la model card; no se ha verificado el enlace directo)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado; no se ha verificado el enlace directo)
