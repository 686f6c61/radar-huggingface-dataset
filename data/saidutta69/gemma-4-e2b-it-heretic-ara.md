# saidutta69/gemma-4-E2B-it-heretic-ara

## Resumen

`gemma-4-E2B-it-heretic-ara` es una variante «abliterada» (sin direcciones de rechazo) del modelo multimodal `google/gemma-4-E2B-it` de Google. La produce el usuario `saidutta69` mediante Heretic v2.1.0, una herramienta que aprende actualizaciones de bajo rango (Arbitrary-Rank Ablation, ARA) para suprimir el comportamiento de negativa del modelo ante peticiones que considera dañinas. El checkpoint conserva la torre de visión y el conformador de audio intactos: solo se editan las capas 15 a 34 del modelo de texto.

El modelo base pertenece a la familia Gemma 4 y es el miembro más pequeño de la gama, junto con E4B. Emplea Per-Layer Embeddings: pese a tener 5.104.297.504 parámetros totales en pesos safetensors, solo unos 2,3B están activos por token, lo que permite inferencia en dispositivo (móvil, portátil) con una ventana de contexto de 128K. Soporta entrada de imagen, vídeo y audio, además de texto, y modos de razonamiento explícito («thinking»).

La relevancia de esta ficha radica en que combina tres cosas poco habituales en un mismo artefacto: multimodalidad cualquier-a-cualquier en un tamaño de bolsillo, licencia Apache 2.0 y una edición de alineación documentada de forma reproducible (semilla, número de ensayo y parámetros de ablación publicados). El autor reporta 14 rechazos de 100 frente a los 97 de 100 del modelo base, con una divergencia KL de 0,1207 respecto a los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión, audio) con Per-Layer Embeddings; edición ARA de bajo rango en capas 15-34 |
| Parámetros totales | 5.104.297.504 |
| Parámetros activos | Aproximadamente 2,3B por token (Per-Layer Embeddings como tablas de consulta) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés declarado en la model card; el autor menciona cobertura de 140 idiomas en el modelo base |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, GGUF (incluye proyector multimodal `gemma-4-E2B-it-heretic-ara-mmproj-F16.gguf` de 0,99 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4. La innovación estructural clave es el uso de Per-Layer Embeddings: un vocabulario de 262K tokens cuyas tablas se consultan en lugar de computarse, de modo que el coste de decodificación se aproxima al de un modelo de 2,3B aunque el checkpoint contenga 5,1B de pesos. Esta arquitectura híbrida explica que quepa en GPUs de consumo y en dispositivos móviles. El modelo incorpora además torres específicas para visión y un conformador de audio, lo que habilita entradas de imagen, vídeo y sonido junto al texto.

El proceso de edición aplicado aquí no es un fine-tuning al uso. Heretic 2.1.0 ejecuta una ablación de rango arbitrario: en lugar de restar una única dirección rank-1 (como en la ablación direccional clásica), aprende una actualización de bajo rango (rango 30) por módulo editado, lo que permite suprimir el rechazo en un subespacio completo. Se editó el ensayo 192 de 300 con semilla 42, afectando a `attn.o_proj` y `mlp.down_proj` de las capas 15 a 34 (de 35 totales). Los pesos de preservación de comportamiento bueno (0,2330), estímulo de comportamiento malo (0,0003) y corrección relativa (0,6212) están publicados, junto con `preserve_row_magnitudes: true`. Las capas 0-14, las tablas de embeddings y las torres multimodal no se tocan, lo que preserva la capacidad de visión y audio. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su construcción.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento explícitos («thinking»).
- Comprensión de imágenes: análisis de documentos, capturas de pantalla e interfaces de usuario.
- Comprensión de vídeo como entrada multimodal.
- Comprensión y transcripción de audio mediante el conformador dedicado.
- Capacidades de código y matemáticas heredadas del modelo base (LiveCodeBench v6 44,0%, Codeforces ELO 633 según cifras publicadas del base).
- Soporte multilingüe amplio (el autor cita 140 idiomas en el modelo base; la model card solo declara inglés).
- Ejecución en dispositivo y en GPUs de consumo gracias a los Per-Layer Embeddings.
- Respuestas directas sin rechazos de alineación en la mayoría de casos (14/100 en el arnés de evaluación del autor).
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis local de documentos y capturas de pantalla: con 128K de contexto y entrada de imagen, el modelo puede procesar lotes de capturas de interfaz o páginas escaneadas y extraer texto estructurado sin salir del portátil, útil para auditorías de privacidad.
- Transcripción y comprensión de audio en dispositivo: el conformador de audio intacto permite transcribir reuniones o notas de voz y resumirlas en local, sin enviar el audio a un servicio externo.
- Asistente multilingüe de sobremesa: la cobertura de idiomas del base y el contexto largo permiten mantener conversaciones multi-turno con documentos de referencia extensos en un equipo de 8-16 GB de VRAM.
- Investigación sobre alineación y seguridad: al publicarse semilla, ensayo y parámetros de ablación, el checkpoint sirve como caso reproducible para estudiar cómo la supresión de direcciones de rechazo afecta al comportamiento y a la divergencia KL.
- Evaluación de modelos en entornos con restricciones: al correr en CPU o Apple Silicon con Q4_K_M (3,42 GB de pesos de texto), es viable desplegarlo en portátiles sin GPU dedicada para pruebas de regresión o generación de datos sintéticos.
- Prototipado de pipelines multimodal en CI: el GGUF multimodal (texto + proyector de 0,99 GB) permite integrar pruebas automáticas de imagen y audio en flujos de integración continua con llama.cpp u Ollama.
- Análisis de vídeo para monitorización local: la entrada de vídeo combinada con contexto de 128K facilita resumir secuencias largas en estaciones de trabajo con una RTX 4090 (5,93 GB en Q8_0 con proyector).

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo base |
|---|---|---|
| Divergencia KL (conjunto harmless de 200 prompts) | 0,1207 | 0 (por definición) |
| Rechazos | 14/100 | 97/100 |
| PIQA acc | 0,5533 (stderr 0,0116) | 0,5544 (0,0116) |
| PIQA acc_norm | 0,5419 (stderr 0,0116) | 0,5533 (0,0116) |

Cifras publicadas del modelo base, que la ablación no modifica según el autor:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro | 60,0% |
| GPQA Diamond | 43,4% |
| AIME 2026 (sin herramientas) | 37,5% |
| LiveCodeBench v6 | 44,0% |
| Codeforces ELO | 633 |
| Tau2 | 24,5% |
| BigBench Extra Hard | 21,9% |
| MMMLU | 67,4% |
| MMMU-Pro | 44,2% |
| MATH-Vision | 52,4% |

## Requisitos de hardware

- VRAM estimada para pesos de texto: 3,42 GB (Q4_K_M), 3,62 GB (Q5_K_M), 3,83 GB (Q6_K), 4,95 GB (Q8_0).
- Con visión y audio: 4,40 GB (Q4_K_M), 4,60 GB (Q5_K_M), 4,82 GB (Q6_K), 5,93 GB (Q8_0), más 0,99 GB fijos del proyector multimodal no cuantizado.
- Contexto: añadir aproximadamente 1 GB por cada 32K de ventana adicional.
- GPU recomendadas: RTX 4090/5090 (24 GB) para Q8_0; RTX 4080/5080/4060 Ti 16G para Q6_K; RTX 3060/4070/5070 (12 GB) para Q5_K_M; RTX 4060/3070/1660 Super (8 GB) para Q4_K_M.
- Cabe en GPU de consumo: sí, desde una RTX 4060 de 8 GB con Q4_K_M.
- CPU y Apple Silicon: soportados con Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; transformers con safetensors; el repo declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles de forma numérica. El autor indica que la velocidad de decodificación se acerca a la de un modelo de 2,3B, pero las tablas de embeddings deben permanecer residentes en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-E2B-it-heretic-ara | 5,1B totales / ~2,3B activos | 128K | Apache 2.0 | Multimodal (texto, imagen, audio, vídeo), ablación ARA, 14/100 rechazos |
| gemma-4-E2B-it-heretic (direccional) | 5,1B totales / ~2,3B activos | 128K | Apache 2.0 | Misma base, ablación rank-1, 17/100 rechazos, KL 0,1841 |
| gemma-4-E4B-it-heretic | no disponible | no disponible | Apache 2.0 | Escalón superior de la misma familia, KL 0,1215 |
| google/gemma-4-E2B-it | 5,1B totales / ~2,3B activos | 128K | Licencia Gemma 4 | Modelo base con alineación intacta, 97/100 rechazos |

## Limitaciones y advertencias

- La ablación elimina direcciones de rechazo, no la capacidad de generar contenido dañino: el modelo responderá a peticiones que el base declinaba, con implicaciones legales y éticas para uso en producción.
- La divergencia KL de 0,1207 indica un desplazamiento moderado pero real respecto al base; el propio autor advierte que el modelo es «claramente más dispuesto y cercano, pero no idéntico» al original.
- La única verificación de capacidad publicada es PIQA, un benchmark de texto; no hay auditoría completa de las rutas de visión y audio tras la edición.
- La model card solo declara inglés como idioma, aunque el autor menciona 140 idiomas del base; conviene validar el multilingüismo antes de confiar en él.
- Riesgo de alucinación heredado del modelo base, sin mitigaciones adicionales documentadas.
- La licencia Apache 2.0 convive con un enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de esta última para uso comercial.
- El proyector multimodal no está cuantizado y añade 0,99 GB fijos; sin él, el modelo solo procesa texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/gemma-4-E2B-it-heretic-ara
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante anterior (ablación direccional): https://huggingface.co/saidutta69/gemma-4-E2B-it-heretic
- Escalón superior de la familia: https://huggingface.co/saidutta69/gemma-4-E4B-it-heretic
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
