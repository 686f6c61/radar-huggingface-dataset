# chibubu/rhino

## Resumen

Rhino es una adaptación del modelo MiniCPM-o-4.5, un modelo multimodal de extremo a extremo con aproximadamente 9.400 millones de parámetros (9.371.787.666 según los pesos en safetensors), publicado en Hugging Face por el usuario chibubu. Se trata de un modelo any-to-any orientado a la investigación en comprensión audiovisual y anclaje temporal entre modalidades: acepta texto, imagen, audio y vídeo como entrada, y genera texto y voz como salida.

Su rasgo más distintivo es el soporte de streaming full-duplex: puede procesar flujos continuos de vídeo y audio en tiempo real mientras genera simultáneamente salida de texto y habla, algo poco habitual en modelos multimodales de este tamaño. Esto lo hace relevante para investigación en modelado de lenguaje audiovisual, análisis de atención cruzada entre modalidades y razonamiento temporal multimodal.

La ficha pública es escasa en detalles técnicos: no se especifican longitud de contexto, datos de entrenamiento ni benchmarks. El repositorio pesa unos 20 GB, se distribuye en formato safetensors y ONNX, requiere `custom_code` en transformers y está bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal end-to-end (basada en MiniCPM-o-4.5), pipeline any-to-any |
| Parametros totales | 9.371.787.666 (≈9,37 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Rhino hereda la arquitectura de MiniCPM-o-4.5, un modelo multimodal end-to-end que integra un LLM de unos 9 mil millones de parámetros con codificadores de visión, audio y vídeo, y un decodificador de voz, permitiendo generar texto y habla de forma conjunta. La model card no detalla la composición exacta de los módulos ni el número de tokens de entrenamiento, por lo que esos datos no están disponibles.

La innovación técnica destacable que sí se documenta es la capacidad de streaming full-duplex: el modelo procesa entradas continuas de audio y vídeo en tiempo real y produce salida concurrente de texto y voz, en lugar de operar en modo turnos alternos. No hay información sobre si el entrenamiento incluyó RLHF o DPO.

## Capacidades

- Comprensión y generación de texto (entrada y salida).
- Comprensión de imágenes (solo entrada).
- Comprensión y generación de audio, incluida síntesis de voz.
- Comprensión de vídeo (solo entrada).
- Streaming multimodal full-duplex: procesamiento en tiempo real de flujos continuos de vídeo y audio con generación simultánea de texto y habla.
- Diseñado para razonamiento temporal multimodal y análisis de atención cruzada entre modalidades.
- No hay información sobre soporte de tool calling, function calling ni capacidades de agentes.
- Extracción de características (tag `feature-extraction`).

## Casos de uso

- Investigacion en anclaje temporal entre modalidades: el modelo permite estudiar cómo se alinean eventos visuales y sonoros en el tiempo, gracias a su diseño específico para cross-modal temporal grounding.
- Asistentes de voz en tiempo real: el streaming full-duplex permite construir agentes conversacionales que escuchan y hablan a la vez, procesando audio continuo sin cortes por turnos.
- Analisis de video con narracion hablada: se puede alimentar un flujo de vídeo y obtener comentarios de voz en tiempo real, útil para accesibilidad o descripción audiovisual automática.
- Transcripcion y comprension de reuniones en directo: procesa audio y vídeo simultáneos de una sesión en vivo y genera texto estructurado mientras la reunión ocurre.
- Investigacion en modelado audiovisual: como modelo de investigación académica, sirve de base para experimentos sobre atención cruzada y razonamiento temporal multimodal.
- Interfaces multimodales any-to-any: su pipeline any-to-any permite prototipar sistemas que combinan entrada de cámara y micrófono con salida de voz y texto, por ejemplo quioscos interactivos o robots de atención.
- Monitorizacion en tiempo real de flujos audiovisuales: análisis continuo de emisiones en directo (vigilancia, calidad de emisión) con generación concurrente de resúmenes hablados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ≈9,4 B de parámetros en precisión completa (el repo pesa 20 GB), se estima en torno a 20-24 GB de VRAM en FP16/BF16, aunque no hay datos oficiales de cuantización.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090 (24 GB), A100 o H100 serían candidatas razonables, sin confirmación oficial.
- Consumer GPUs: probablemente quepa en una RTX 3090/4090 de 24 GB sin cuantizar, pero no hay confirmación documentada.
- Opciones de despliegue: biblioteca transformers con `custom_code` habilitado (requerido por el tag `custom_code`); también hay pesos ONNX, lo que habilita runtimes como onnxruntime. No consta soporte verificado en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, aunque el diseño de streaming full-duplex indica que está orientado a inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rhino (MiniCPM-o-4.5) | ≈9,37 B | no disponible | Sí | Apache 2.0 | Hugging Face (54 descargas) |
| Qwen2.5-Omni-7B | ≈7 B | no disponible en esta comparativa | Sí (Thinker-Talker) | Apache 2.0 | Hugging Face |
| MiniCPM-o 2.6 | ≈8 B | no disponible en esta comparativa | Sí | Licencia propia (uso comercial restringido) | Hugging Face |
| GLM-4-Voice | ≈9 B | no disponible en esta comparativa | Sí (voz) | Licencia propia | Hugging Face |

Rhino destaca por mantener la licencia Apache 2.0 (a diferencia de otros MiniCPM-o oficiales) y por su enfoque específico en investigación de razonamiento temporal audiovisual.

## Limitaciones y advertencias

- La model card es muy escasa: no hay datos de contexto, entrenamiento, benchmarks ni idiomas, lo que dificulta una evaluación rigurosa antes de adoptarlo.
- Uso previsto limitado a investigación académica según el autor; no hay garantías ni soporte para entornos de producción.
- Repositorio con muy poca tracción (54 descargas, 1 like), sin comunidad de soporte ni historial de validación.
- Requiere `trust_remote_code` / código personalizado en transformers, lo que implica riesgo de seguridad adicional al ejecutar código de terceros.
- Sesgos conocidos: no disponibles; al heredar de MiniCPM-o-4.5, podrían persistir los sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no disponible; como todo LLM multimodal, debe asumirse riesgo de alucinación en generación de texto y voz.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, pero el autor declara uso previsto académico, lo que conviene respetar.
- Entrada de imagen y vídeo sin salida correspondiente: el modelo no genera imágenes ni vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chibubu/rhino
- Modelo original de referencia (MiniCPM-o): no disponible en la informacion proporcionada.
