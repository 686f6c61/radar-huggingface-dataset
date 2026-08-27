# mradermacher/3arabLM-4B-islamic-v2-i1-GGUF

## Resumen

El modelo `mradermacher/3arabLM-4B-islamic-v2-i1-GGUF` es una cuantización en formato GGUF del modelo base `sherif1313/3arabLM-4B-islamic-v2`, especializado en árabe clásico y contenido islámico (fiqh, tafsir, hadith, aqeedah, nahw). El autor, mradermacher, publica cuantizaciones con matriz de importancia (imatrix) para optimizar la calidad de la inferencia en entornos con recursos limitados. Este repositorio concreto contiene únicamente el archivo de imatrix, mientras que las cuantizaciones estáticas (Q2_K, Q4_K_M, Q6_K, etc.) se encuentran en el repositorio hermano `mradermacher/3arabLM-4B-islamic-v2-GGUF`.

El modelo base está diseñado para tareas de generación de texto en árabe, con un enfoque en el patrimonio islámico y la lengua clásica. Aunque el nombre sugiere 4B de parámetros, el dato de safetensors disponible indica 897.272, lo que resulta inconsistente; probablemente se trate de un error en la metadata o de un archivo parcial. La licencia es Apache 2.0, lo que permite uso comercial y modificación. La relevancia actual radica en la creciente demanda de modelos especializados en árabe para aplicaciones educativas, de investigación y de procesamiento de textos religiosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base) |
| Parametros totales | 4B (según nombre del modelo base); dato de safetensors: 897.272 (inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (este repo); estáticas en repo hermano: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | ar (árabe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `sherif1313/3arabLM-4B-islamic-v2`. El nombre sugiere una arquitectura transformer de 4B parámetros, pero no se confirma. Tampoco se conocen los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La especialización en árabe clásico e islámico indica un entrenamiento sobre corpus como la biblioteca Shamela, pero no hay confirmación. La cuantización imatrix de mradermacher utiliza una matriz de importancia calculada sobre un conjunto de datos de calibración para mejorar la precisión de las cuantizaciones de baja precisión, una técnica habitual en el ecosistema GGUF.

## Capacidades

- Generación de texto en árabe, con énfasis en árabe clásico y terminología islámica.
- Conocimiento especializado en disciplinas como fiqh (jurisprudencia), tafsir (exégesis coránica), hadith (tradiciones proféticas), aqeedah (credo) y nahw (gramática árabe).
- Capacidad multilingüe limitada al árabe (según la etiqueta `language: ar`).
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Al ser un modelo de 4B, puede ejecutarse en hardware de consumo, aunque no se confirma el rendimiento real.

## Casos de uso

- Asistente educativo para estudiantes de ciencias islámicas: el modelo puede responder preguntas sobre fiqh, tafsir o hadith, citando fuentes clásicas, gracias a su entrenamiento especializado en patrimonio islámico.
- Herramienta de estudio del árabe clásico: útil para practicar gramática (nahw) y morfología, generando ejemplos y explicaciones en árabe.
- Búsqueda y recuperación de información en corpus islámicos: integrado en un sistema RAG, puede procesar consultas en árabe y extraer pasajes relevantes de textos como la biblioteca Shamela.
- Generación de contenido religioso moderado: redacción de artículos, sermones o materiales educativos sobre temas islámicos, siempre con supervisión humana.
- Traducción y paráfrasis de textos clásicos: puede ayudar a simplificar pasajes difíciles del árabe clásico al árabe moderno.
- Chatbot de atención al cliente en árabe para organizaciones islámicas: con una ventana de contexto adecuada, puede mantener conversaciones multi-turno sobre consultas generales, aunque su especialización limita temas no religiosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su base.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 4B parámetros, las cuantizaciones GGUF permiten ejecutarlo en GPUs de consumo con 6-8 GB de VRAM para las versiones Q4_K_M o inferiores.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, o superiores para mayor velocidad. Para las cuantizaciones más grandes (Q6_K, Q8_0) se necesitan al menos 8-10 GB de VRAM.
- También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles, dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Existen otros modelos islámicos en GGUF de mradermacher, como `Qwen3-4B-Islamic-Arabic-GGUF` o `Faqih-R1-14B-Islamic-AI-GGUF`, pero no se conocen sus especificaciones ni rendimiento. Se recomienda consultar sus respectivas fichas para una comparación directa.

## Limitaciones y advertencias

- Sesgos religiosos inherentes: al estar entrenado en textos islámicos, puede reflejar interpretaciones específicas y no ser neutral en temas teológicos.
- Riesgo de alucinación en citas coránicas o de hadith: puede generar referencias inexactas o inventadas, por lo que no debe usarse como fuente autoritativa sin verificación.
- Limitación idiomática: solo soporta árabe, lo que restringe su uso en entornos multilingües.
- Contexto limitado: no se conoce la longitud de contexto, pero los modelos de 4B suelen tener ventanas de 4K-8K tokens, insuficientes para documentos largos.
- La inconsistencia en el número de parámetros (897.272 vs 4B) sugiere posibles problemas en la metadata; se recomienda verificar el modelo base antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sobre temas religiosos puede requerir supervisión humana para evitar errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/3arabLM-4B-islamic-v2-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/3arabLM-4B-islamic-v2-GGUF
- Modelo base: https://huggingface.co/sherif1313/3arabLM-4B-islamic-v2
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
