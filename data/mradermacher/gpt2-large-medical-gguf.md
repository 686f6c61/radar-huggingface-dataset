# mradermacher/gpt2-large-medical-GGUF

## Resumen

`mradermacher/gpt2-large-medical-GGUF` es una compilación de cuantizaciones GGUF del modelo `Locutusque/gpt2-large-medical`, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formatos GGUF de 2, 3, 4, 5, 6 y 8 bits, más una versión f16, pensada para su uso con llama.cpp y herramientas compatibles. El modelo subyacente es un GPT-2 Large ajustado (fine-tuning) sobre datos médicos en inglés.

El modelo base conserva la arquitectura transformer decoder-only de GPT-2 Large, con 838.366.720 parámetros totales según los pesos en safetensors. El ajuste se realizó sobre los datasets `BI55/MedText` y `pubmed_qa`, lo que orienta el modelo hacia la generación de texto de temática biomédica en inglés. No dispone de chat template ni de instrucciones de alineación documentadas en la información disponible.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 838 M de parámetros especializado en dominio médico en hardware muy modesto, desde CPU hasta GPUs de consumo, con cuantizaciones que van de 0,4 GB (Q2_K) a 1,8 GB (f16). Es una opción de bajo coste para tareas de generación de texto biomédico sin requisitos de infraestructura elevados, aunque con las limitaciones propias de un GPT-2 y de un fine-tuning de dominio estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 Large) |
| Parametros totales | 838.366.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 Large usa por defecto 1024 tokens; no confirmado en la informacion) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Locutusque/gpt2-large-medical` es un GPT-2 Large (transformer decoder-only, 36 capas, dimensión oculta 1280, 20 cabezas de atención, según la arquitectura estándar de GPT-2 Large) ajustado sobre datos médicos. Los datasets declarados son `BI55/MedText` y `pubmed_qa`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning. Tampoco se documenta ninguna innovación arquitectónica: es un fine-tuning de dominio sobre un modelo preentrenado de 2019.

La contribución de esta publicación es exclusivamente la cuantización. mradermacher genera cuantizaciones estáticas (no imatrix) del modelo base, con versiones ponderadas/imatrix disponibles en un repositorio separado (`gpt2-large-medical-i1-GGUF`). No hay información sobre el proceso de calibración de las cuantizaciones ni sobre posibles pérdidas de calidad más allá de las notas genéricas incluidas en la model card.

## Capacidades

- Generación de texto en inglés con orientación a temática médica y biomédica.
- Continuación de texto y generación libre condicionada por prompt (modelo base, no instruct).
- Respuesta a preguntas de dominio biomédico si el prompt está formateado adecuadamente (sin garantía de calidad conversacional).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- No se documenta chat template ni formato de instrucciones.

## Casos de uso

- Generación de texto biomédico de bajo coste en local: el modelo puede producir párrafos sobre temas médicos en inglés usando llama.cpp en CPU o GPU modesta, gracias a cuantizaciones de 0,4 a 1,0 GB.
- Prototipado de pipelines de NLP clínico: sirve como baseline rápido para experimentos de clasificación o generación de texto médico antes de escalar a modelos mayores.
- Experimentación educativa con modelos de dominio: útil para demostrar el flujo completo de fine-tuning de dominio y cuantización GGUF en un caso médico.
- Despliegue en entornos con recursos limitados: cabe en Raspberry Pi, portátiles sin GPU dedicada y contenedores pequeños, lo que permite pruebas offline sin infraestructura cloud.
- Generación de borradores de resúmenes de literatura: con prompts adecuados sobre abstracts de PubMed, puede generar continuaciones de texto relacionadas con el dominio, siempre con revisión humana.
- Benchmarking de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad para un modelo de dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,4 GB (Q2_K) hasta ~1,8 GB (f16); en la práctica, con overhead de contexto, entre 0,5 y 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, GTX 1660, T4 o superiores son más que suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas e incluso en iGPUs y Raspberry Pi (con cuantizaciones bajas).
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| gpt2-large-medical-GGUF (este) | 838 M | no disponible | Médico (en) | no disponible | GGUF |
| Locutusque/gpt2-large-medical | 838 M | no disponible | Médico (en) | no disponible | safetensors |
| GPT-2 Large original | 774 M | 1024 | General (en) | MIT (según OpenAI) | safetensors, GGUF |
| BioGPT (Microsoft) | 347 M | 1024 | Biomédico (en) | MIT | PyTorch |

La comparación se limita a modelos de tamaño y dominio similares; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones de forma fiable y puede requerir prompts muy específicos para producir respuestas útiles.
- Riesgo elevado de alucinación en contenido médico: no debe usarse para decisiones clínicas ni como fuente de información sanitaria sin revisión experta.
- Sesgos heredados de GPT-2 y del corpus de entrenamiento (BI55/MedText, pubmed_qa), no documentados en detalle.
- Ventana de contexto limitada (GPT-2 Large: 1024 tokens por defecto; no confirmado en la información), insuficiente para documentos largos.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor del modelo base antes de usarlo en producción.
- El fine-tuning es de dominio estrecho y de 2019; su calidad está muy por debajo de modelos médicos modernos como Meditron, BioMistral o MedGemma.
- Las cuantizaciones bajas (Q2_K, Q3_K) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- No hay garantía de mantenimiento ni soporte por parte del autor de la cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gpt2-large-medical-GGUF
- Modelo base: https://huggingface.co/Locutusque/gpt2-large-medical
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gpt2-large-medical-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gpt2-large-medical-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
