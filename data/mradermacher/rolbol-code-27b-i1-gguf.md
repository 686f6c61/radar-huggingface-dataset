# mradermacher/RolBol-Code-27B-i1-GGUF

## Resumen

RolBol-Code-27B-i1-GGUF es una cuantización en formato GGUF del modelo RolBol-Code-27B, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos. El modelo base es un transformer de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a tareas de código y conversación, según los tags del repositorio ("conversational"). Esta ficha describe la versión cuantizada, no el modelo original.

La relevancia de esta publicación radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones de baja precisión (desde IQ1_S hasta Q6_K), algo inviable con los pesos en precisión completa. El repositorio incluye un conjunto amplio de cuantizaciones con calibración mediante imatrix (importance matrix), lo que en teoría reduce la pérdida de calidad en los niveles más agresivos de compresión.

No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, arquitectura detallada ni resultados de benchmarks. El modelo base (Rolbol07/RolBol-Code-27B) parece ser un ajuste o derivado comunitario, pero no se dispone de documentación adicional en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors segun el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer con aproximadamente 27,3 mil millones de parámetros. El repositorio cuantizado no incluye datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. El tag "conversational" sugiere un ajuste orientado a diálogo, y el nombre "Code" indica especialización en código, pero no se aportan detalles verificables.

La innovación técnica documentada en esta publicación es el uso de cuantizaciones ponderadas con imatrix (importance matrix), generadas con la herramienta de cuantización de llama.cpp (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf). Esto implica que los tensores se cuantizaron a partir de pesos en formato Hugging Face y que se empleó una matriz de importancia para preservar los pesos más relevantes en las cuantizaciones de baja precisión (IQ1, IQ2, IQ3). El repositorio omite el tensor mmproj (skip_mmproj: 1), lo que sugiere que no se incluyen componentes multimodales en esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag "conversational".
- Generación y asistencia en código, deducible del nombre del modelo base (RolBol-Code), aunque no se documentan lenguajes ni tareas concretas.
- Inferencia local mediante llama.cpp y compatible con endpoints (tag "endpoints_compatible").
- Soporte de cuantizaciones de muy baja precisión (hasta IQ1_S), pensadas para entornos con memoria muy restringida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente de código en local: el modelo puede desplegarse con llama.cpp en una estación de trabajo con GPU de consumo usando cuantizaciones Q4_K_M o Q5_K_M, ofreciendo autocompletado y explicación de fragmentos de código sin enviar datos a servicios externos.
- Revisión de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite analizar repositorios propietarios sin exponer el código a APIs de terceros.
- Prototipado de chatbots conversacionales: su naturaleza conversacional y su tamaño de ~27B lo hacen adecuado para generar respuestas coherentes en diálogos multi-turno en fases de desarrollo.
- Despliegue en hardware limitado: las cuantizaciones IQ2 e IQ3 permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM, útil para pruebas de concepto o entornos embebidos.
- Generación de documentación técnica: puede redactar docstrings, README y comentarios de código a partir de fragmentos fuente, integrándose en pipelines de documentación.
- Experimentación e investigación: sirve como base para estudiar el impacto de distintas cuantizaciones (Q2 a Q6) en la calidad de salida sobre tareas de código, gracias a la disponibilidad de 24 variantes en el mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos y overhead de contexto):
  - IQ1_S / IQ2_XXS: ~6-8 GB.
  - Q2_K / IQ3_XXS: ~9-11 GB.
  - Q4_K_M / IQ4_XS: ~15-17 GB.
  - Q5_K_M: ~18-20 GB.
  - Q6_K: ~21-23 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q6_K; RTX 3090/4080 (16-24 GB) para Q4_K_M; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q6_K con una RTX 4090; las variantes IQ2/IQ3 caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF y endpoints (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se requiere el modelo base en safetensors para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol-Code-27B-i1-GGUF | ~27,3 B | no disponible | no disponible | GGUF | Cuantizaciones IQ1-Q6 con imatrix |
| Modelos de ~27B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas concretas en la documentación proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse si se permite uso comercial; es imprescindible verificar la licencia del modelo base (Rolbol07/RolBol-Code-27B) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real; probablemente esté sesgado hacia los idiomas presentes en su dataset de entrenamiento, que no se detalla.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad en código, matemáticas o razonamiento, por lo que el rendimiento real es incierto.
- Riesgo de degradación por cuantización: las variantes IQ1 e IQ2 pueden producir salidas incoherentes o repetitivas; se recomienda Q4_K_M o superior para uso serio.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación no puede evaluarse su magnitud.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento no pueden identificarse sesgos específicos.
- Modelo comunitario sin trazabilidad: el autor del modelo base (Rolbol07) no aporta documentación detallada, lo que dificulta la auditoría.
- Sin componente multimodal: el repositorio omite mmproj, por lo que no hay soporte de visión en esta conversión.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/RolBol-Code-27B-i1-GGUF
- Modelo base: https://huggingface.co/Rolbol07/RolBol-Code-27B
- llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp
