# dfp-official/DeepSeek-V4.1-Flash-1017-oQ4e-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ4e-mtp es una cuantización de precisión mixta del checkpoint DeepSeek-V4.1-Flash-1017, publicada en Hugging Face por el usuario dfp-official el 17 de octubre de 2026. El artefacto está empaquetado en formato MLX (librería `mlx`, pesos `safetensors`) y se ha generado con la herramienta oQ de oMLX v0.7.1rc1, pensada para ejecutar modelos grandes sobre memoria unificada de Apple Silicon.

El checkpoint completo suma 763.205B parámetros lógicos repartidos en 432,03 GB de almacenamiento, con una media efectiva de 4,529 bits por peso (4,365 bits/peso si se excluyen las tablas Engram). La mayor parte del peso (73,004 %) se guarda en MXFP4 con grupo de 32, mientras que las tablas Engram (196.614B parámetros, el 25,762 %) se almacenan en cuantización afín de 4 bits. El repositorio incluye además una torre de visión de 0,485B parámetros y una cabeza MTP (multi-token prediction) de 14.225B parámetros.

Su interés práctico es que reduce un modelo de esta escala a un tamaño que cabe en una única máquina con memoria unificada muy grande, frente a los aproximadamente 1,5 TB que ocuparía el mismo checkpoint en BF16. Ahora bien, la model card no documenta licencia, idiomas, longitud de contexto ni resultados de evaluación, y el repositorio no registra descargas ni interacciones: debe tratarse como material de investigación y no como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `deepseek_v41`; incluye modelo de lenguaje, torre de visión y cabeza MTP) |
| Parámetros totales | 763.205B lógicos según la model card; 129.060.546.354 según los metadatos de `safetensors` (véase la discrepancia en limitaciones) |
| Parámetros activos | No disponible (la información no confirma si es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta: MXFP4 grupo 32, MXFP8 grupo 32, BF16, FP32 y tablas Engram en afín 4 bits grupo 32; media efectiva de 4,529 bits/peso (4,365 sin Engram) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` en formato MLX (`library_name: mlx`) |
| Tamaño del repositorio | 432,0 GB (432,033 GB / 402,363 GiB de pesos) |
| Autor y fecha | dfp-official, creado el 2026-10-17, actualizado el 2026-10-17 |
| Descargas / likes | 0 / 0 |

Distribución de precisión declarada por el autor:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| MXFP4, grupo 32 | 557.171B | 73,004 % | 275,669 GiB | 4,25 |
| MXFP8, grupo 32 | 5.959B | 0,781 % | 5,723 GiB | 8,25 |
| BF16 | 3.419B | 0,448 % | 6,369 GiB | 16,00 |
| FP32 | 0.042B | 0,006 % | 0,158 GiB | 32,00 |
| Engram afín 4 bits, grupo 32 | 196.614B | 25,762 % | 114,444 GiB | 5,00 |
| **Total** | **763.205B** | **100 %** | **402,363 GiB** | **4,529** |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Lo que sí detalla es la composición del checkpoint empaquetado, que se desglosa en cuatro componentes: el modelo de lenguaje (551.881B parámetros lógicos, 279,520 GiB), las tablas Engram (196.614B parámetros, 114,444 GiB), la torre de visión (0,485B parámetros, 0,904 GiB) y la cabeza MTP (14.225B parámetros, 7,495 GiB). La presencia de una torre de visión indica capacidades multimodales de entrada de imagen, y la cabeza MTP apunta a decodificación multi-token, un esquema habitualmente asociado a decodificación especulativa para acelerar la generación.

No se trata de un modelo entrenado, sino de una reclasificación de precisión de un checkpoint existente, por lo que no hay información sobre volumen de tokens, composición del dataset ni etapas de RLHF o DPO. La innovación técnica del artefacto es la política de cuantización mixta: la práctica totalidad de los pesos del transformer se guarda en MXFP4 (formato de microscaling de OCP con bloque de 32), se reservan MXFP8, BF16 y FP32 para un subconjunto reducido de tensores sensibles, y las tablas Engram se mantienen en 4 bits afín con grupo de 32, lo que eleva su coste a 5,00 bits/peso efectivos. El resultado son 432,03 GB de checkpoint frente a los aproximadamente 1,53 TB que ocuparían los mismos 763.205B parámetros en BF16.

## Capacidades

- Generación de texto y conversación: el repositorio incluye un modelo de lenguaje de 551.881B parámetros lógicos, base para tareas de generación y razonamiento.
- Procesamiento de imágenes: incorpora una torre de visión de 0,485B parámetros, por lo que el checkpoint es multimodal de entrada.
- Decodificación multi-token: la cabeza MTP de 14.225B parámetros está incluida en el empaquetado, lo que habilita flujos de predicción multi-token.
- Memoria mediante tablas Engram: el checkpoint reserva 196.614B parámetros a tablas Engram, un componente diferenciado del transformer cuyo funcionamiento no se detalla en la model card.
- Ejecución local en Apple Silicon: el formato MLX permite cargar el modelo en memoria unificada sin conversión previa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización de precisión mixta: el checkpoint sirve como referencia reproducible (oQ, oMLX v0.7.1rc1) para estudiar el impacto de asignar MXFP4, MXFP8, BF16 y FP32 por tensor en modelos de más de 700B parámetros, comparando la perplejidad frente al original en BF16.
- Evaluación de decodificación multi-token: al incluir la cabeza MTP, permite medir en hardware Apple la ganancia de throughput de esquemas de predicción multi-token frente a la decodificación autorregresiva clásica.
- Estudio de tablas Engram: con 196.614B parámetros dedicados y cuantizados a 4 bits afín, el artefacto facilita analizar la sensibilidad de este tipo de memorias a la cuantización, un componente que en BF16 supondría por sí solo unos 393 GB.
- Inferencia local con requisitos de privacidad: en una estación de trabajo Apple con memoria unificada suficiente, el modelo puede ejecutarse sin enviar datos a la nube, lo que encaja en entornos con datos sensibles que no admiten servicios externos.
- Prototipado multimodal sobre documentos: la combinación de torre de visión y modelo de lenguaje permite experimentar con extracción de información de imágenes y PDF renderizados, siempre que se valide antes la calidad real del componente visual.
- Laboratorio de pruebas de despliegue MLX: útil para validar pipelines de carga, cuantización y serialización en MLX antes de invertir en versiones de menor tamaño o en infraestructura GPU.
- Docencia y divulgación: permite mostrar en una sola máquina el desglose real de pesos, bits efectivos y componentes de un modelo de escala frontera, sin necesidad de un clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a la distribución de cuantización y al desglose de almacenamiento, sin métricas de calidad (MMLU, HumanEval, GSM8K u otras) ni comparación con el checkpoint sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada: 402,363 GiB de pesos (432,033 GB) solo para el checkpoint. Con overhead del runtime MLX, buffers y caché KV, conviene disponer de al menos 450–512 GB de memoria unificada.
- GPU dedicadas: no es viable en tarjetas consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en una A100 o H100 de 80 GB por sí solas. El formato MLX está orientado a memoria unificada de Apple Silicon, no a reparto multi-GPU tipo CUDA.
- Equipos compatibles: configuraciones Apple Silicon con 512 GB de memoria unificada (por ejemplo, Mac Studio de gama alta con 512 GB). En cualquier equipo con menos memoria, el modelo no se puede cargar completo.
- Almacenamiento: 432 GB de disco solo para el repositorio, más espacio temporal durante la descarga y la carga.
- Opciones de despliegue: runtime MLX (`mlx`, `mlx_lm`); la herramienta oQ de oMLX (https://github.com/jundot/omlx) para reproducir o ajustar la cuantización. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no consumen pesos en formato MLX.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo publicadas para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de otros checkpoints de la misma familia en la información proporcionada, por lo que la comparación se limita a variantes del mismo artefacto.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ4e-mtp | 763.205B lógicos / 129,06B en `safetensors` | No disponible | Mixta, 4,529 bits/peso | No disponible | Repositorio público, 0 descargas |
| DeepSeek-V4.1-Flash-1017 en BF16 (referencia teórica) | 763.205B lógicos | No disponible | 16 bits (~1,53 TB estimados aritméticamente) | No disponible | No verificada su existencia en la información recibida |
| Otras cuantizaciones de la misma familia (GGUF, AWQ, GPTQ) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de escala comparable (otros modelos frontera) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede determinar si el uso comercial está permitido. Es un bloqueante para cualquier despliegue en producción.
- Discrepancia en el recuento de parámetros: los metadatos de `safetensors` indican 129.060.546.354 parámetros, mientras que la model card declara 763.205B lógicos. La diferencia (unas seis veces) no se explica en la documentación; probablemente las tablas Engram no se contabilizan igual en ambos recuentos, pero es una suposición no verificada.
- Ausencia total de evaluación: no hay métricas de calidad, perplejidad ni comparación con el modelo sin cuantizar, de modo que se desconoce la degradación introducida por la cuantización mixta, especialmente en las tablas Engram a 4 bits.
- Riesgo de alucinación: no cuantificado. Al no haber evaluación, no se puede estimar la tasa de error factual del checkpoint.
- Idiomas y contexto desconocidos: se desconoce la ventana de contexto real y la cobertura lingüística, lo que impide planificar aplicaciones con requisitos de longitud o de idioma.
- Dependencia de hardware muy específica: exige memoria unificada de Apple Silicon en el entorno de 512 GB; no hay soporte documentado para CUDA, ROCm ni despliegue distribuido.
- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la consulta, publicado por una cuenta de usuario y no por el equipo de DeepSeek. No hay verificación de que la cuantización sea correcta más allá de la tabla del autor.
- Sin pipeline declarado: el campo `pipeline` no está definido, por lo que la integración automática en herramientas que dependen de ese metadato fallará.
- Repositorio de 432 GB: la descarga y el almacenamiento tienen un coste logístico relevante, y cualquier fallo a mitad de descarga obliga a reiniciar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dfp-official/DeepSeek-V4.1-Flash-1017-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base DeepSeek-V4.1-Flash-1017: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
