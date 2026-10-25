# mradermacher/Underdog-Poodle-4B-i1-GGUF

## Resumen

Underdog-Poodle-4B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo base ConwayResearch/Underdog-Poodle-4B. No contiene pesos en precisión completa ni safetensors, sino una colección de ficheros cuantizados con la técnica i1 (imatrix), destinados a su ejecución con llama.cpp y herramientas compatibles. El nombre sugiere un modelo de 4.000 millones de parámetros, aunque el recuento reportado en safetensors es de 1.797.272 parámetros, una cifra que no cuadra con la denominación "4B" y que requiere verificación en el repositorio original.

La model card es mínima: se limita a indicar que son cuantizaciones weighted/imatrix del modelo de ConwayResearch y lista los tipos de cuantización generados. No hay información publicada sobre arquitectura, datos de entrenamiento, idiomas o licencia en la información disponible. El repositorio registra cero descargas y cero likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que puede indicar que el contenido no está completamente subido o que la métrica reportada no refleja el peso real de los ficheros.

Su relevancia práctica es limitada mientras no se publique la ficha del modelo base: la utilidad del repo es ofrecer variantes GGUF de distintos niveles de compresión para ejecución en CPU o GPU con recursos ajustados, pero sin conocer el modelo original no es posible evaluar capacidades, sesgos o idoneidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.797.272 (según safetensors); el nombre del modelo indica 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); convert_type: hf |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura del modelo base ni aporta datos sobre número de tokens de entrenamiento, composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. Se sabe únicamente que el repositorio es una conversión (`convert_type: hf`) de un modelo en formato Hugging Face a GGUF, con cuantización i1 basada en matriz de importancia (imatrix), un método que pondera los tensores según su relevancia para reducir la pérdida de calidad en niveles de compresión bajos.

Los ficheros se distribuyen para su uso con llama.cpp y derivados. La etiqueta `nicoboss` aparece en la cabecera de la model card, pero no se aporta contexto adicional que permita confirmar su significado o vinculación con el ecosistema de finetunes de Nicoboss.

## Capacidades

- Generación de texto: no confirmable sin la ficha del modelo base.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no disponible.
- Ejecución cuantizada en CPU/GPU mediante llama.cpp: disponible por formato GGUF, aunque el rendimiento real depende del modelo base.

## Casos de uso

Los siguientes escenarios son aplicables a un LLM de propósito general de ~4B en formato GGUF, condicionados a que el modelo base confirme dichas capacidades:

- Inferencia local en CPU para prototipado offline: las variantes Q4_K_M o Q5_K_M permiten ejecutar el modelo en un portátil sin GPU dedicada usando llama.cpp, útil para pruebas de concepto sin depender de servicios en la nube.
- Despliegue en dispositivos de borde: las cuantizaciones IQ3_XXS o Q3_K_M reducen el peso del modelo y permiten su uso en entornos con poca memoria, como mini-PC o placas SBC con suficiente RAM.
- Experimentación con el trade-off calidad/compresión: disponer de la escalera completa desde IQ1_S hasta Q6_K facilita medir la degradación de calidad frente al tamaño en tareas concretas.
- Chat de bajo recurso en estaciones de trabajo sin GPU: las variantes Q4_0 y Q4_K_S son compatibles con llama.cpp en CPU y permiten conversaciones interactivas con memoria limitada.
- Clasificación y filtrado de texto en pipelines ligeros: si el modelo base rinde aceptablemente en tareas de etiquetado, las variantes Q2_K o Q3_K_M son suficientes para procesos por lotes donde prima el throughput sobre la calidad fina.
- Evaluación de robustez frente a cuantización agresiva: las variantes IQ1/IQ2 sirven para estudiar cuánto degrada la compresión extrema en el modelo base antes de fijar un nivel de cuantización para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones orientativas asumiendo que el modelo base tiene ~4B parámetros; deben verificarse contra el tamaño real de cada fichero en el repositorio, dado que el recuento de safetensors (1.797.272) contradice la denominación "4B".

| Cuantizacion | Tamano aprox. (GB, estimado) | VRAM estimada para inferencia |
|---|---|---|
| IQ1_S / IQ1_M | ~1.0-1.2 | ~1.5 GB |
| IQ2_XXS / IQ2_XS / IQ2_S | ~1.1-1.7 | ~2 GB |
| Q2_K / Q2_K_S | ~1.6-1.8 | ~2.5 GB |
| IQ3_XXS / IQ3_XS / IQ3_S | ~1.5-1.9 | ~2.5 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | ~1.9-2.2 | ~3 GB |
| Q4_0 / Q4_1 | ~2.3-2.5 | ~3.5 GB |
| IQ4_XS / IQ4_NL / Q4_K_S / Q4_K_M | ~2.2-2.6 | ~3.5 GB |
| Q5_K_S / Q5_K_M | ~2.8-3.1 | ~4 GB |
| Q6_K | ~3.3-3.6 | ~4.5 GB |

- VRAM estimada para inferencia: entre ~1,5 GB (IQ1) y ~4,5 GB (Q6_K) en el escenario de 4B; en el escenario de 1,8M parámetros las cifras serían drásticamente menores.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) puede alojar las variantes Q4 y Q5 de un modelo de 4B; A100/H100 solo tendrían sentido para servir muchas instancias en paralelo.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más para cuantizaciones Q4/Q5; las variantes IQ1-IQ2 podrían ejecutarse incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con llama.cpp. No se indica compatibilidad con vLLM o TGI, que suelen requerir pesos sin cuantizar o AWQ/GPTQ.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos del modelo base ni de alternativas comparables, y el recuento de parámetros reportado (1.797.272) impide establecer una comparación fiable con modelos de ~4B como Qwen, Llama o Phi. Se recomienda consultar el repositorio ConwayResearch/Underdog-Poodle-4B para obtener la ficha del modelo original antes de comparar.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial, la redistribución ni la obligación de atribución; es un riesgo legal para producción.
- Idiomas no disponibles: se desconoce el soporte multilingüe real del modelo base.
- Sesgos y alucinaciones: no cuantificados en la información disponible; deben evaluarse con el modelo base antes de cualquier despliegue.
- Cuantizaciones IQ1/IQ2 muy agresivas: la compresión extrema puede degradar notablemente la calidad, especialmente en razonamiento y matemáticas.
- Discrepancia de parámetros: el dato de safetensors (1.797.272) no concuerda con la denominación "4B"; conviene verificar el tamaño real de los ficheros antes de planificar recursos.
- Repositorio con 0 descargas y tamaño reportado de 0.0 GB: posible repo incompleto, recién creado o con métricas no actualizadas; verificar la subida de los ficheros.
- Formato GGUF: no apto para fine-tuning directo ni para servir con frameworks que requieran safetensors (vLLM, TGI con pesos completos).
- Fecha de creación del repositorio (2026-10-25) posterior a la de la mayoría de modelos disponibles; conviene comprobar la vigencia del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Underdog-Poodle-4B-i1-GGUF
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
