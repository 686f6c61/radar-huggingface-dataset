# mradermacher/Mercury-Acad-1.7B-i1-GGUF

## Resumen

Mercury-Acad-1.7B-i1-GGUF es una cuantización en formato GGUF del modelo Mercury-Acad-1.7B, publicada por el usuario mradermacher en Hugging Face. El repositorio contiene únicamente los pesos cuantizados generados a partir del modelo original alojado en `rrchat/Mercury-Acad-1.7B`, e incluye un conjunto amplio de variantes de cuantización (desde IQ1_S hasta Q6_K) pensadas para ejecución en CPU y GPUs de gama baja mediante llama.cpp y herramientas compatibles.

La información pública disponible sobre este repositorio es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni detalles de entrenamiento del modelo base. El dato de parámetros totales reportado en los safetensors del repo (899.013) es inconsistente con el nombre del modelo (1.7B), por lo que debe interpretarse con cautela; probablemente refleje un recuento parcial o un artefacto del proceso de conversión. El tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los metadatos no están completamente poblados o que los archivos aún no se han indexado correctamente.

Por tanto, esta ficha describe lo que puede verificarse a partir de los metadatos y la model card del repositorio, marcando explícitamente como "no disponible" todo aquello que no se puede confirmar. Es relevante para desarrolladores que quieran evaluar rápidamente si esta cuantización encaja en su stack de inferencia local, pero no sustituye la consulta a la model card del modelo base para decisiones de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `rrchat/Mercury-Acad-1.7B`) |
| Parámetros totales | 899.013 según safetensors del repo (inconsistente con el nombre "1.7B"; tratar como no fiable) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; cuantización tipo "i1" con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Mercury-Acad-1.7B en los datos proporcionados. El repositorio es una conversión a GGUF, no un modelo entrenado desde cero: la model card indica que se trata de cuantizaciones "weighted/imatrix" del modelo `rrchat/Mercury-Acad-1.7B`, generadas con la herramienta de cuantización de llama.cpp (etiquetas internas `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

El uso de imatrix (matriz de importancia) implica que las cuantizaciones de baja precisión (IQ1, IQ2, IQ3) se han calibrado con un dataset de calibración para minimizar la pérdida de calidad respecto a los pesos originales en fp16/bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. Cualquier afirmación sobre estos puntos requeriría consultar la model card del modelo base.

## Capacidades

- Generación de texto autoregresiva (heredada del modelo base, no verificada en esta ficha).
- Razonamiento y respuesta a instrucciones: no confirmado en la información disponible.
- Generación de código: no confirmado.
- Matemáticas: no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en CPU y GPU de gama baja gracias al formato GGUF y al rango de cuantizaciones ofrecido.

## Casos de uso

- Inferencia local en portátiles sin GPU dedicada: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~1.7B en CPU con consumo de RAM moderado, útil para prototipos y pruebas offline.
- Despliegue en dispositivos edge con recursos limitados: las cuantizaciones IQ2/IQ3 reducen el peso del modelo para entornos con poca memoria, a costa de cierta degradación de calidad.
- Evaluación comparativa de cuantizaciones: al ofrecer más de 20 variantes, el repo permite medir el impacto de la precisión en la calidad de salida sobre el mismo modelo base.
- Integración en pipelines con llama.cpp u Ollama: el formato GGUF es directamente compatible con estas herramientas, lo que facilita su incorporación en aplicaciones de escritorio o servidores ligeros.
- Filtrado y clasificación de texto en local: para tareas de moderación o etiquetado simple donde no se requiere un modelo grande ni conexión a la nube.
- Base para fine-tuning ligero o experimentación académica: el tamaño reducido del modelo base facilita iterar en entornos con presupuesto de cómputo limitado.
- Generación de texto asistida en herramientas de desarrollo (autocompletado, resúmenes) cuando se prioriza la privacidad y la ejecución local frente a la calidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada (orientativa, según el tamaño nominal de ~1.7B parámetros y el tipo de cuantización; no verificada con los archivos reales del repo):
  - IQ1_S / IQ2_XXS: en torno a 0,4–0,6 GB.
  - Q3_K_M / IQ3_M: en torno a 0,8–1,0 GB.
  - Q4_K_M / IQ4_XS: en torno a 1,0–1,2 GB.
  - Q5_K_M: en torno a 1,2–1,4 GB.
  - Q6_K: en torno a 1,4–1,6 GB.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM puede alojar las cuantizaciones Q4/Q5; para Q6_K se recomienda ≥3 GB. Modelos como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. Para servidores, A100/H100 no aportan ventaja significativa a este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían conversión a safetensors.
- Latencia y throughput: no disponibles. En CPU moderna, un modelo de ~1.7B en Q4 suele generar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este repo concreto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (mismo tamaño, misma tarea o misma familia) con datos verificables. La comparación requeriría consultar la model card del modelo base `rrchat/Mercury-Acad-1.7B` y repositorios de cuantizaciones alternativas del mismo modelo.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; no se puede asumir uso comercial sin verificar la licencia del modelo base `rrchat/Mercury-Acad-1.7B`.
- El recuento de parámetros reportado (899.013) es inconsistente con el nombre del modelo (1.7B); no debe usarse para estimar requisitos de memoria sin verificar los archivos reales.
- El tamaño del repositorio aparece como 0.0 GB, lo que puede indicar metadatos incompletos o archivos no indexados; conviene comprobar la lista de ficheros antes de descargar.
- No hay información sobre sesgos, alucinación, idiomas o contexto máximo; estos riesgos deben evaluarse sobre el modelo base.
- Las cuantizaciones IQ1/IQ2 degradan notablemente la calidad frente a fp16; para producción se recomienda Q4_K_M o superior salvo que el espacio sea crítico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su calidad.
- Al ser una cuantización de terceros, no hay garantía de que los pesos coincidan exactamente con el modelo base; conviene validar con una evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mercury-Acad-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/rrchat/Mercury-Acad-1.7B
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
