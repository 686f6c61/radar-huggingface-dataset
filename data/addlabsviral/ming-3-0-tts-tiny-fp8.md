# addlabsviral/Ming-3.0-tts-tiny-FP8

## Resumen

Ming-3.0-tts-tiny-FP8 es una compilación cuantizada en FP8 del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por el usuario addlabsviral. El modelo base emplea un backbone Ling V3 de tipo Mixture-of-Experts con 7,9 mil millones de parámetros totales y 1,3 mil millones activos por token, y añade módulos específicos de TTS: una cabeza DiT, un tokenizador de audio con VAE y un codificador de hablante CAM++ (procedente de 3D-Speaker). La cuantización se realizó con llmcompressor mediante el esquema FP8_DYNAMIC, reduciendo el checkpoint de 17 GB en bf16 a 8,7 GB.

El interés de esta ficha radica en que permite desplegar un modelo TTS de casi 9 mil millones de parámetros en infraestructura con la mitad de VRAM, manteniendo el código y los módulos no lineales en su precisión original. Está pensado para servir con vLLM 0.32.0 o superior a través de la ruta compressed-tensors, sin necesidad de flags de cuantización adicionales. La licencia MIT del modelo original se conserva, lo que facilita su uso comercial.

No obstante, conviene subrayar que se trata de una conversión de pesos sin reentrenamiento: la calidad final depende íntegramente del modelo base, y la información pública disponible sobre idiomas, benchmarks y datos de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Ling V3) con cabeza DiT, tokenizador de audio/VAE y codificador de hablante CAM++ |
| Parametros totales | 8.981.004.468 (≈8,98 B) |
| Parametros activos | 1,3 B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos por canal simétricos, activaciones por token dinámicas); módulos no lineales en precisión original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors `float-quantized`), ONNX auxiliar (`campplus.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un sistema de text-to-speech construido sobre el backbone Ling V3, un transformer con capas Mixture-of-Experts que activa aproximadamente 1,3 B de parámetros de un total de 7,9 B. Sobre ese backbone se montan componentes específicos de audio: una cabeza DiT para la generación, un tokenizador de audio con VAE y un codificador de hablante CAM++ (3D-Speaker, Apache-2.0) que probablemente se emplea para condicionamiento de voz o clonación. La compilación FP8 solo cuantiza las capas `nn.Linear`; el resto de módulos de soporte se mantienen en su precisión original, lo que preserva la fidelidad del pipeline de audio.

La cuantización se realizó con llmcompressor mediante `QuantizationModifier` en modo data-free, con esquema FP8_DYNAMIC: pesos cuantizados por canal de forma simétrica y activaciones cuantizadas dinámicamente por token. El checkpoint resultante almacena una `quantization_config` de compressed-tensors en `config.json` y se carga automáticamente como FP8. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Generación de audio condicionada por hablante mediante el codificador CAM++.
- Integración con vLLM y vLLM-Omni para servir el modelo como endpoint TTS.
- Carga automática en FP8 sin flags adicionales gracias a la configuración compressed-tensors.
- Soporte de `trust_remote_code` para el código de modelado personalizado incluido.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, agentes, razonamiento multi-paso, visión o audio de entrada: no disponible / no aplicable según la información proporcionada.

## Casos de uso

- Servicio de TTS en producción: desplegar el modelo con `vllm serve ... --omni` para exponer un endpoint de síntesis de voz; el checkpoint FP8 reduce a la mitad la VRAM frente al base en bf16.
- Generación de audiolibros y contenido narrado: el modelo permite convertir grandes volúmenes de texto en audio, y el codificador CAM++ facilita mantener una identidad de voz consistente entre fragmentos.
- Asistentes de voz y agentes conversacionales: integrar el endpoint TTS en un pipeline de ASR + LLM + TTS para respuestas habladas de baja latencia en aplicaciones de atención al cliente.
- Accesibilidad: convertir contenido textual (noticias, documentación, artículos) en audio para usuarios con discapacidad visual o dificultades de lectura.
- Localización de contenido multimedia: doblaje y generación de pistas de voz para vídeos, cursos o material formativo, siempre que se validen los idiomas soportados por el modelo base.
- Prototipado e investigación en TTS: al ser una build cuantizada con licencia MIT, sirve para experimentar con despliegues de bajo coste en GPUs de gama media y comparar la degradación frente al modelo bf16.
- Integración en entornos con restricciones de memoria: escenarios donde el modelo bf16 de 17 GB no cabe en la GPU disponible y la versión de 8,7 GB sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de audio (MOS, WER, SIM) ni comparaciones con el modelo base en bf16, por lo que no es posible cuantificar la degradación introducida por la cuantización FP8.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 8,7 GB en disco; en inferencia hay que sumar el espacio de activaciones, caché KV y los módulos no cuantizados (DiT, VAE, CAM++), por lo que se recomienda al menos 16-24 GB de VRAM para un funcionamiento holgado (estimación, no dato oficial).
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090 (24 GB) como opción consumer viable.
- GPUs consumer: previsiblemente cabe en RTX 4090 y RTX 3090 (24 GB); en tarjetas de 16 GB el margen es ajustado y no está validado en la información disponible.
- Despliegue: vLLM 0.32.0 o superior con vLLM-Omni (`pip install vllm-omni`; `vllm serve ... --omni --trust-remote-code`). No se mencionan otras rutas (llama.cpp, Ollama, TGI) para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts-tiny-FP8 (esta ficha) | 8,98 B totales / 1,3 B activos | no disponible | safetensors FP8 (compressed-tensors) | MIT | Build cuantizada de 8,7 GB, validada con vLLM 0.32.0 |
| inclusionAI/Ming-3.0-tts-tiny | 7,9 B totales / 1,3 B activos (según model card) | no disponible | safetensors bf16 | MIT | Modelo base, 17 GB; sin cuantizar |
| Otras alternativas TTS de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradación en la calidad del audio generado; no se han publicado métricas que la cuantifiquen frente al modelo base.
- El modelo es una conversión de pesos: no se ha reentrenado ni ajustado, por lo que hereda todos los sesgos y limitaciones del modelo base.
- Riesgo de alucinación y errores de pronunciación inherentes a los sistemas TTS; requiere validación en el dominio de uso.
- Idiomas soportados no documentados: no se debe asumir cobertura multilingüe sin verificación empírica.
- Longitud de contexto no disponible, lo que limita la planificación de entradas de texto largas.
- Requiere `--trust-remote-code` y código de modelado personalizado, lo que implica revisar el código antes de desplegar en entornos sensibles.
- Validación limitada a vLLM 0.32.0 con la ruta compressed-tensors; otras versiones o backends no están verificados.
- El repositorio no tiene descargas ni likes, y el autor es un usuario individual (addlabsviral), no la organización original; conviene contrastar la integridad de los pesos frente al modelo base.
- Licencia MIT permite uso comercial, pero el codificador CAM++ procede de 3D-Speaker bajo Apache-2.0, cuyos términos deben respetarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/addlabsviral/Ming-3.0-tts-tiny-FP8
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Organización inclusionAI: https://huggingface.co/inclusionAI
- llmcompressor: no disponible en la información proporcionada
- vLLM-Omni: no disponible en la información proporcionada
- 3D-Speaker (CAM++): no disponible en la información proporcionada
