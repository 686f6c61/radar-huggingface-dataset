# SlayerLab/Slayer1B-1.06-checkpoints

## Resumen

Slayer1B-1.06-checkpoints es un repositorio de puntos de control (checkpoints) intermedios del entrenamiento del modelo Slayer1B 1.06, publicado por SlayerLab. No se trata de un modelo final listo para inferencia, sino de los estados completos del entrenador —pesos del modelo y estado del optimizador— guardados cada 50 pasos durante la continuación del preentrenamiento desde el paso 12870 hasta el 13848. El repositorio contiene 20 ficheros de aproximadamente 8,86 GB cada uno, sumando 177,2 GB en total.

El modelo subyacente es un transformer de aproximadamente 1000 millones de parámetros (de ahí el sufijo "1B"), entrenado sobre un corpus en polaco de 14 520 680 448 tokens en una única pasada. Esta entrega corresponde al tramo final del entrenamiento, con una tasa de aprendizaje constante de 6e-4 y sin decaimiento, ejecutado sobre 8 GPU NVIDIA L40S de 48 GB con paralelismo de datos distribuido (DDP).

La relevancia de este repositorio es fundamentalmente de investigación y reproducibilidad: permite analizar la dinámica de entrenamiento, reanudar runs, estudiar el efecto del filtrado de fugas de benchmarks o auditar el estado del optimizador. No está pensado como artefacto de despliegue, y de hecho la model card no documenta capacidades de inferencia, benchmarks ni plantillas de prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (definición en `train_gpt_ref_r23.py`); detalles internos no disponibles |
| Parámetros totales | no disponible (el nombre indica ~1B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | polaco (corpus de entrenamiento `slayer-pl-8x3b`); resto no disponible |
| Licencia | Apache-2.0 para los checkpoints; los datos incluyen fuentes CC BY-SA |
| Formato de pesos | `torch.save` (diccionario del entrenador con `model`, `opt`, `step`, `config`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer entrenado con el entrenador `train_gpt_ref` r24.2 (sha256 `46f83b51…`) y la definición de modelo `train_gpt_ref_r23.py`, sin cambios respecto a versiones anteriores. El entrenamiento se realiza con 256 secuencias de 4096 tokens por paso, lo que da 1 048 576 tokens por paso, y un batch global idéntico al del run de 1.04 sobre 4 × L40S. El optimizador combina Muon y AdamW, y cada checkpoint almacena tanto los pesos como el estado del optimizador.

El tramo documentado cubre 978 pasos (12871 a 13848), equivalentes a 1 025 507 328 tokens, con tasa de aprendizaje constante de 6e-4 y sin decaimiento. Los datos provienen del dataset `SlayerLab/slayer-pl-8x3b` (revisión `d50df04a`), continuando la única pasada sobre el corpus hasta completar una época de 14 520 680 448 tokens. A partir del pack-04 (paso 7193) se excluyeron 5133 documentos con solapamiento de n-gramas con ítems de test de BoolQ, MMLU y ARC (lista sha256 `84caed78…`), de modo que todo este segmento está filtrado contra fugas de benchmarks, mientras que los pasos hasta 7192 no lo estaban. El hardware empleado fueron 8 × NVIDIA L40S (48 GB) con DDP.

## Capacidades

- Generación de texto en polaco: el corpus de entrenamiento es exclusivamente polaco según la información disponible.
- No se documentan capacidades de razonamiento, código o matemáticas evaluadas de forma independiente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del polaco.
- No se documentan modos especiales (thinking mode, visión, audio).
- Los ficheros son checkpoints de entrenamiento, no un modelo empaquetado para inferencia; requieren cargar la clase del modelo desde `train_gpt_ref_r23.py`.

## Casos de uso

- Reanudación de entrenamiento: cargar `ckpt_13848.pt` con `torch.load(path, map_location="cpu", weights_only=True)` y continuar el run con el estado del optimizador intacto, lo que evita recalcular momentos de Muon y AdamW.
- Reproducibilidad de experimentos: los 20 checkpoints con SHA-256 publicados permiten verificar bit a bit la integridad de cada estado y reproducir curvas de entrenamiento.
- Análisis de dinámica de entrenamiento: la secuencia cada 50 pasos con learning rate constante facilita estudiar la evolución de la pérdida y de los pesos en la fase final del preentrenamiento.
- Estudio del filtrado de fugas de benchmarks: comparar los estados anteriores y posteriores al paso 7193 permite cuantificar el impacto de excluir 5133 documentos con solapamiento con BoolQ, MMLU y ARC.
- Investigación sobre optimizadores híbridos: al incluir el estado de Muon y AdamW, el repositorio sirve para analizar el comportamiento de Muon en modelos de ~1B parámetros.
- Auditoría de datos y licencias: el enlace al dataset `slayer-pl-8x3b` y la mención a fuentes CC BY-SA permiten trazar la procedencia del corpus y las obligaciones de atribución.
- Fine-tuning desde un estado intermedio: usar un checkpoint como inicialización para experimentos de ajuste supervisado en polaco, teniendo en cuenta que no hay model card de uso ni evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enlaza a la curva de entrenamiento y evaluaciones en `https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5`, sin cifras reproducidas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Cada checkpoint ocupa 8 860 287 151 bytes e incluye pesos y estado del optimizador, por lo que su tamaño no equivale al de los pesos en precisión de inferencia.
- GPU de entrenamiento documentadas: 8 × NVIDIA L40S (48 GB) con DDP.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se publican pesos en formatos cuantizados (GGUF, AWQ, GPTQ).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga requiere PyTorch y la clase del modelo de `train_gpt_ref_r23.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks ni especificaciones completas que permitan una comparación rigurosa con otros modelos de ~1B parámetros.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints del entrenador con estado del optimizador, no pesos finales empaquetados para inferencia.
- Ausencia total de evaluaciones publicadas: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica en la model card.
- Idioma limitado: el corpus es polaco; no se documenta cobertura de castellano ni de otros idiomas.
- Contexto de 4096 tokens, adecuado para entrenamiento pero corto para aplicaciones de contexto largo.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones, no puede estimarse.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición detallada del corpus más allá de las rutas `shared/core_sa` y `shared/legal_sa`.
- Licencia mixta: los checkpoints son Apache-2.0, pero los datos de entrenamiento incluyen fuentes CC BY-SA, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la dataset card antes de un uso comercial.
- Filtrado de fugas parcial: solo el segmento desde el paso 7193 está filtrado contra solapamientos con BoolQ, MMLU y ARC; los pasos hasta 7192 no lo están, lo que afecta a la interpretación de cualquier evaluación sobre esos estados.
- Tamaño del repositorio: 177,2 GB, con 20 ficheros de 8,86 GB cada uno, lo que exige almacenamiento considerable y transferencias largas.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.06-checkpoints
- Modelo base de la release: https://huggingface.co/SlayerLab/Slayer1B-1.06
- Checkpoints de la release 1.04 (continuación 7200–13848): https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
