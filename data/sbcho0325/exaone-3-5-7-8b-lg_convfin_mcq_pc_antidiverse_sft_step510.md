# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step510

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step510` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador ha sido publicado por el usuario sbcho0325 y está orientado a tareas de conversación financiera y respuesta a preguntas de opción múltiple (MCQ), con un enfoque explícito en reducir la diversidad de las respuestas generadas (antidiverse). El repositorio tiene un tamaño de 0,3 GB y contiene únicamente los pesos del adaptador en formato safetensors, sin documentación técnica detallada.

Este modelo es relevante para desarrolladores que necesitan especializar un modelo lingüístico de 7.800 millones de parámetros en dominios concretos sin reentrenar el modelo completo. Al tratarse de un adaptador LoRA, permite un despliegue eficiente en términos de memoria y cómputo, manteniendo las capacidades generales del modelo base (bilingüe inglés-coreano, contexto de 32K tokens) y añadiendo un comportamiento ajustado a tareas específicas. Sin embargo, la falta de información sobre los datos de entrenamiento y el proceso de ajuste limita su reproducibilidad y evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA, repositorio de 0,3 GB) |
| Parametros activos | No disponible (adaptador LoRA) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base ofrece cuantizaciones GGUF (ver enlaces) |
| Idiomas soportados | Ingles y coreano (heredados del modelo base) |
| Licencia | No disponible (el modelo base EXAONE 3.5 tiene su propia licencia, pero el adaptador no la especifica) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE 3.5 7.8B Instruct, un transformer decoder-only con atención causal, entrenado por LG AI Research con un enfoque bilingüe (inglés y coreano). El modelo base soporta una ventana de contexto de hasta 32 000 tokens y ha sido optimizado para tareas de instrucción y conversación. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward, lo que permite ajustar el comportamiento del modelo con un número reducido de parámetros entrenables.

El entrenamiento del adaptador se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con la configuración de PEFT 0.19.1. El nombre del repositorio sugiere que los datos de entrenamiento incluyen conversaciones financieras (`convfin`), preguntas de opción múltiple (`mcq`) y una estrategia de control de diversidad (`antidiverse`), probablemente para favorecer respuestas más deterministas y menos variadas. El checkpoint corresponde al paso 510 del entrenamiento, pero no se proporcionan hiperparámetros, tamaño del dataset ni composición exacta de los datos.

## Capacidades

- Generación de texto bilingüe (inglés y coreano) con las capacidades generales del modelo base EXAONE 3.5 7.8B Instruct.
- Especialización en conversación financiera: puede mantener diálogos multi-turno sobre temas económicos, análisis de datos financieros o asesoramiento básico.
- Respuesta a preguntas de opción múltiple (MCQ), probablemente con un comportamiento más determinista y menos diverso que el modelo base (por el término `antidiverse`).
- Soporte de contexto largo de hasta 32 000 tokens, útil para documentos financieros extensos o historiales de conversación.
- Razonamiento y comprensión lectora heredados del modelo base, aunque el adaptador puede haberlos sesgado hacia el dominio financiero.
- No se dispone de información sobre soporte de tool calling, function calling o capacidades multimodales específicas del adaptador; el modelo base no incluye visión ni audio.

## Casos de uso

- Atención al cliente financiera: el adaptador puede gestionar consultas de clientes sobre productos bancarios, inversiones o seguros, manteniendo un tono consistente y respuestas estables gracias a su configuración antidiverse.
- Evaluación educativa: generación de preguntas de opción múltiple sobre finanzas y economía, o corrección automática de respuestas en entornos de formación.
- Análisis de sentimiento financiero: dado su ajuste en conversación financiera, puede utilizarse para extraer opiniones de noticias o informes, aunque su rendimiento exacto no está documentado.
- Resumen de documentos financieros: con su ventana de 32K tokens, puede procesar informes anuales o estados de resultados y producir resúmenes ejecutivos.
- Chatbots de asesoramiento básico: integración en plataformas de banca digital para responder preguntas frecuentes sobre tarifas, plazos o condiciones, con respuestas menos ambiguas.
- Investigación académica: como ejemplo de fine-tuning con LoRA sobre un modelo bilingüe de tamaño medio, útil para estudiar el impacto de la reducción de diversidad en tareas MCQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador. El modelo base EXAONE 3.5 7.8B Instruct reporta mejoras frente a su predecesor, pero no se proporcionan cifras concretas en la documentación accesible. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,3 GB), pero requiere cargar el modelo base completo (7,8B parámetros) para su inferencia.
- VRAM estimada: aproximadamente 16 GB en FP16 para el modelo base; con cuantización 4-bit (GGUF Q4_K_M) se reduce a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs con 8-12 GB pueden usar cuantización 4-bit.
- En consumer GPU: sí, es viable con cuantización (por ejemplo, RTX 3060 12 GB o superior).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (el modelo base tiene soporte oficial), Hugging Face TGI.
- Latencia y throughput: no disponibles para el adaptador; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables en el mismo repositorio. Como referencia, se compara con el modelo base y con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7,8B | 32K | EN, KO | Licencia EXAONE (uso comercial permitido con restricciones) | Modelo base sin adaptador |
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step510 | 7,8B + LoRA | 32K | EN, KO | No disponible | Adaptador LoRA especializado |
| Llama 3.1 8B Instruct | 8B | 128K | Multilingüe | Llama 3.1 Community License | Alternativa popular de tamaño similar |

La comparación con otros adaptadores LoRA específicos no es posible por falta de datos.

## Limitaciones y advertencias

- No se proporciona información sobre los datos de entrenamiento, por lo que existe riesgo de sesgos no documentados, especialmente en el dominio financiero (p. ej., sobre-representación de ciertos productos o regiones).
- El término `antidiverse` sugiere una reducción intencionada de la diversidad de respuestas, lo que puede llevar a salidas demasiado rígidas o repetitivas en contextos abiertos.
- La licencia del adaptador no está especificada; aunque el modelo base EXAONE 3.5 permite uso comercial bajo ciertas condiciones, el adaptador podría tener restricciones adicionales no declaradas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento sin validación comunitaria.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas financieras o MCQ es desconocido.
- El adaptador está entrenado para inglés y coreano; su comportamiento en otros idiomas no está garantizado.
- Al ser un adaptador LoRA, su calidad depende fuertemente del modelo base; cualquier limitación de EXAONE 3.5 (por ejemplo, alucinaciones en datos numéricos) se hereda.

## Enlaces

- Página del adaptador en HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step510
- Repositorio oficial de EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Modelo base en HuggingFace (con cuantizaciones GGUF): https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
- Página de EXAONE 3.5 en Ollama: https://ollama.com/library/exaone3.5:7.8b
- Organización LG AI EXAONE en GitHub: https://github.com/LG-AI-EXAONE
