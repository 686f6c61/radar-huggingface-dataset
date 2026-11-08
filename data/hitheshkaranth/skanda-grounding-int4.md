# hitheshkaranth/skanda-grounding-int4

## Resumen

Skanda-grounding-int4 es una versión cuantizada a 4 bits del modelo Skanda, un sistema multimodal de imagen médica a texto desarrollado por hitheshkaranth. El modelo combina un backbone de lenguaje y visión Qwen3-VL-30B-A3B (con adaptadores LoRA fusionados) con un decodificador SAM 2.1, de modo que recibe radiografías de tórax, cortes de CT y volúmenes de MRI y genera un informe estructurado junto con máscaras de segmentación de los hallazgos. El problema que aborda es la lectura automática de estudios radiológicos con localización explícita de lesiones, una tarea en la que la mayoría de los modelos imagen-texto médicos no ofrecen salida espacial.

La relevancia de esta ficha concreta es la reducción de tamaño: el checkpoint pasa de 62,6 GB en bf16 a 18,2 GB en int4 (grupo 128, solo pesos, aplicado a los expertos MoE y a la atención), lo que permite desplegarlo en hardware con memoria limitada. Solo se cuantizan los pesos del modelo de lenguaje; el decodificador SAM 2.1, el proyector del token `[SEG]` y la cabeza de puntuación permanecen en bf16. El modelo base está pensado para uso exclusivo en investigación y no es un dispositivo médico.

La contrapartida es una pérdida de precisión documentada por el autor: la exhaustividad de cajas en MRI cae del 65 % al 49 %, el tipo de hallazgo en MRI del 89 % al 80 %, la precisión de cajas en radiografía de tórax del 24,5 % al 17,5 % y la tasa de CT sin lesión correctamente descartada del 91 % al 78 %. La compilación int8 del mismo modelo se describe como prácticamente sin pérdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL-30B-A3B (MoE) con LoRA fusionado + decodificador SAM 2.1 y proyector `[SEG]` |
| Parametros totales | 30B (heredados del backbone Qwen3-VL-30B-A3B) |
| Parametros activos | 3B (heredados del backbone MoE A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 grupo 128 solo pesos (expertos MoE + atención); int8 disponible en otra compilación; cabezas en bf16 |
| Idiomas soportados | en |
| Licencia | other (skanda-private) |
| Formato de pesos | safetensors y `skanda_heads.pt`; requiere `skanda/quant.py` y `skanda/serve.py` |

## Arquitectura y entrenamiento

El modelo es un sistema híbrido de dos etapas. La primera es un Qwen3-VL-30B-A3B (transformer MoE con 30B parámetros totales y 3B activos) sobre el que se ha fusionado un LoRA de la "run-3"; este modelo de lenguaje y visión recibe la imagen y el texto y emite un informe estructurado, insertando un token especial `[SEG]` por cada hallazgo. La segunda etapa es un decodificador SAM 2.1 (codificador de imagen más decodificador de máscaras entrenado) junto con un proyector `[SEG]` y una cabeza de puntuación que convierten esos tokens en máscaras de segmentación y en puntuaciones de presencia de hallazgo. En esta compilación int4 solo se cuantizan los pesos del modelo de lenguaje; el resto de componentes se mantienen en bf16.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor indica que el umbral de la compuerta de "abnormal" se recalibró sobre las propias lecturas de este build en el conjunto de calibración (datos de validación, nunca de test), y que los umbrales de las pistas (`hint thresholds`) se eligieron a partir de las salidas de la cabeza de puntuación en validación y dev.

## Capacidades

- Generación de informes radiológicos estructurados a partir de radiografía de tórax, CT y MRI.
- Localización de hallazgos mediante cajas y máscaras de segmentación (token `[SEG]` decodificado por SAM 2.1).
- Clasificación de presencia de hallazgo ("abnormal flagged") y de estudios sin lesión ("normals called normal").
- Tipificación del hallazgo (tipo correcto según el benchmark del autor).
- Entrada imagen-texto con pipeline `image-text-to-text`.
- Capacidades multilingües limitadas al inglés (`en`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Triaje de radiografías de tórax: el modelo marca estudios como anormales o normales y redacta un informe preliminar, lo que permite priorizar la revisión por parte del radiólogo en entornos con alta carga de trabajo.
- Segunda lectura en CT: genera descripciones de hallazgos con cajas localizadoras (precisión de caja del 19 % y exhaustividad del 15 % en int4) que sirven como apoyo, no como sustituto, de la lectura humana.
- Segmentación asistida en MRI: produce máscaras con IoU ≥ 0,3 frente al contorno del radiólogo en el 75 % de los casos (precisión) y en el 49 % (exhaustividad) en int4, útil para precargar contornos en herramientas de anotación.
- Investigación en radiómica y datasets: el modelo puede generar borradores de anotaciones sobre grandes volúmenes de estudios para su revisión posterior, siempre con validación humana.
- Despliegue en hardware limitado: al ocupar 18,2 GB, permite ejecutar el sistema en una única GPU de gama alta de consumo, algo inviable con el checkpoint bf16 de 62,6 GB.
- Evaluación comparativa de cuantización: sirve como referencia para medir el impacto de int4 frente a int8 y bf16 en tareas médicas con salida espacial, usando los mismos conjuntos de test del autor.
- Formación y demostraciones: al ser un sistema de dos etapas con salida estructurada, es adecuado para mostrar en entornos académicos cómo se combinan un VLM y un modelo de segmentación promptable.

## Benchmarks y rendimiento

Resultados en casos de test no vistos en entrenamiento, en porcentaje. Radiografía de tórax: 111 películas de ChestX-Det, media de dos pasadas (±10 puntos por azar). CT y MRI: conjunto fijo de cortes y volúmenes, con y sin lesión. No se reproducen aquí los resultados de las líneas base completas; se incluyen las columnas de Skanda para contextualizar la pérdida por cuantización.

| Radiografía de tórax (111) | Skanda bf16 | Skanda 8-bit | Skanda 4-bit |
|---|---:|---:|---:|
| Abnormal flagged | 84,5 | 86 | 85,5 |
| Normals called normal | 69 | 69 | 72 |
| Right finding type | 39 | 40,5 | 36 |
| Box precision | 24,5 | 24 | 17,5 |
| Box recall | 9,5 | 8,5 | 8,5 |

| CT | Skanda bf16 | Skanda 8-bit | Skanda 4-bit |
|---|---:|---:|---:|
| Abnormal flagged | 82 | 82 | 82 |
| Normals called normal | 91 | 85 | 78 |
| Right finding type | 72 | 72 | 74 |
| Box precision | 22 | 21 | 19 |
| Box recall | 16 | 16 | 15 |

| MRI | Skanda bf16 | Skanda 8-bit | Skanda 4-bit |
|---|---:|---:|---:|
| Abnormal flagged | 89 | 89 | 88 |
| Normals called normal | 94 | 92 | 93 |
| Right finding type | 89 | 87 | 80 |
| Box precision | 70 | 70 | 75 |
| Box recall | 65 | 67 | 49 |

| Pérdida NLL por token sobre las propias respuestas bf16 | bf16 | 8-bit | 4-bit |
|---|---:|---:|---:|
| Skanda | 0,0823 | 0,0824 | 0,1181 |
| Skanda, validación (objetivos de radiólogo) | 0,1600 | 0,1607 | 0,1865 |

Tamaño del checkpoint: bf16 62,6 GB, 8-bit 32,8 GB, 4-bit 18,2 GB. El autor compara con MedGemma 27B, MAIRA-2 y la combinación MedGemma + MAIRA-2 en bf16, 8 bits y 4 bits; los métodos de cuantización difieren (FP8/MXFP4 en vLLM para MedGemma, int8/NF4 con bitsandbytes para MAIRA-2, int8 por fila e int4 grupo 128 propios para Skanda).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,2 GB de pesos más memoria para activaciones y el decodificador SAM 2.1 en bf16; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB) y H100 para producción e inferencia por lotes; RTX 4090 (24 GB) como mínimo viable en consumer.
- Cabe en GPU de consumo: sí, en RTX 4090 y en tarjetas con 24 GB o más; no cabe en GPUs de 16 GB sin estrategias adicionales no documentadas.
- Opciones de despliegue: el autor indica que la carga requiere su propio código de inferencia (`skanda/serve.py`, `skanda/quant.py`), alojado en un repositorio privado; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Skanda-grounding-int4 | 30B totales / 3B activos | no disponible | Cajas y máscaras (SAM 2.1) | other (skanda-private) | Pesos en HF; código de inferencia privado |
| MedGemma 27B | 27B | no disponible | No documentada | propia del autor (no detallada) | Evaluado como línea base |
| MAIRA-2 | no disponible | no disponible | Cajas en radiografía de tórax | research use only | Evaluado como línea base |
| MedGemma + MAIRA-2 (modo fusionado) | combinación | no disponible | Cajas en radiografía de tórax | propia de cada componente | Modo de la app Skanda Radiology |

En el benchmark del autor, Skanda supera a MedGemma 27B en tipificación de hallazgo en CT (72 frente a 49) y en MRI (89 frente a 42), y en precisión de cajas en CT (22 frente a 1) y MRI (70 frente a 6). En radiografía de tórax, MAIRA-2 obtiene mejor precisión de cajas (30 frente a 24,5 en bf16) y Skanda mejor tipificación de hallazgo (39 frente a 34).

## Limitaciones y advertencias

- Solo para investigación: el autor declara explícitamente que no es un dispositivo médico y que no ha sido autorizado por ningún regulador para uso clínico.
- La cuantización int4 degrada la precisión de forma medible: exhaustividad de cajas en MRI de 65 % a 49 %, tipo de hallazgo en MRI de 89 % a 80 %, precisión de cajas en radiografía de 24,5 % a 17,5 % y CT sin lesión correctamente descartada de 91 % a 78 %.
- La pérdida NLL por token sube de 0,0823 a 0,1181 sobre las respuestas del propio modelo en bf16, y de 0,1600 a 0,1865 en validación con objetivos de radiólogo.
- Licencia `skanda-private`: no se detallan condiciones de uso comercial; debe tratarse como restringida hasta consultar al autor.
- El código de inferencia necesario para cargar el modelo está en un repositorio privado, lo que limita la reproducibilidad y el despliegue por terceros.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con historiales largos.
- Riesgo de alucinación inherente a un VLM generativo: los informes deben ser revisados por un radiólogo; el propio benchmark muestra discrepancias entre "abnormal flagged" y "normals called normal".
- En radiografía de tórax, cada métrica varía unos ±10 puntos por azar sobre 111 películas, por lo que las diferencias pequeñas entre compilaciones no son concluyentes.
- Los umbrales de la compuerta de abnormal y de las pistas se recalibraron sobre datos de validación de este build; no se garantiza su transferencia a otras poblaciones o equipos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hitheshkaranth/skanda-grounding-int4
- Modelo base bf16: https://huggingface.co/hitheshkaranth/skanda-grounding
- Compilación int8: https://huggingface.co/hitheshkaranth/skanda-grounding-int8
- Perfil del autor en GitHub: https://github.com/Hitheshkaranth/Hitheshkaranth
- Scripts del autor: https://github.com/Hitheshkaranth/Hitheshkaranth/tree/main/scripts
- Sitio personal del autor: https://hitheshkaranth.dev
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
