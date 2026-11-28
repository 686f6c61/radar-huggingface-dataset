# MuXodious/gemma-4-12B-it-SOMPOA-heresy-LORA

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de decensurado (abliteration) construido sobre `google/gemma-4-12B-it`. Lo publica el usuario MuXodious bajo licencia Apache 2.0 y emplea la herramienta Heretic v2.2.0.dev0 con una variante de parámetros denominada SOMPOA, que ajusta selectivamente las proyecciones de atención (`attn.o_proj`) y de la MLP (`mlp.down_proj`) para reducir la tasa de rechazos del modelo base. El adaptador pesa 42.729.472 parámetros y el repositorio ocupa 0,3 GB, con pesos en safetensors y una versión GGUF incluida para su aplicación directa sobre el modelo censurado mediante `--lora LoRA.gguf`.

El interés práctico reside en que permite eliminar los mecanismos de rechazo del Gemma 4 12B sin reentrenar el modelo completo, manteniendo una divergencia KL baja (0,0639) respecto al original según la model card. El modelo base es un transformer multimodal de Google DeepMind que procesa texto, imagen, vídeo y audio de forma nativa, con ventana de contexto de hasta 256K tokens y soporte de más de 140 idiomas, orientado a razonamiento, código y flujos agénticos.

La relevancia actual es doble: por un lado, demuestra que las técnicas de abliteration con control fino por capa (los pesos `max_weights` y `min_weights` por índice de capa) se han industrializado en herramientas como Heretic; por otro, plantea un caso claro de tensión entre la licencia Apache 2.0 declarada y las condiciones de uso del modelo base de Google, que conviene revisar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 12B Unified del modelo base |
| Parametros totales | 42.729.472 (adaptador LoRA); el modelo base es de 12B |
| Parametros activos | no disponible (el adaptador no es MoE; el modelo base 12B es denso) |
| Longitud de contexto | no disponible para el adaptador; el modelo base soporta hasta 256K tokens |
| Tipos de cuantizacion | GGUF incluido en el repositorio (niveles concretos no disponibles); safetensors para el adaptador |
| Idiomas soportados | no disponible para el adaptador; el modelo base soporta más de 140 idiomas |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre las capas de atención y MLP del Gemma 4 12B. Según los parámetros SOMPOA publicados, la intervención se concentra en `attn.o_proj` (con `direction_index` 26,71 y `max_weight_position` 35,36) y en `mlp.down_proj` (`max_weight_position` 27,34), con pesos por capa que oscilan entre 0,01 y 1,76 y distancias mínimas de 7,89 y 2,86 respectivamente. Esta selección por capa sugiere un direccionamiento quirúrgico de las representaciones asociadas al rechazo, en lugar de una ablación global.

El entrenamiento se realizó con Heretic v2.2.0.dev0, una herramienta de decensurado que optimiza automáticamente los parámetros de abliteration minimizando la divergencia KL respecto al modelo original. La model card reporta 11 rechazos sobre 101 prompts de prueba (frente a 101/101 del original) y una divergencia KL de 0,0639. No se especifican el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el adaptador no modifica la arquitectura del modelo base, que mantiene su naturaleza multimodal encoder-free con soporte nativo de audio, imagen y vídeo.

## Capacidades

- Generación de texto, razonamiento y matemáticas heredados del Gemma 4 12B, con modos de pensamiento configurables.
- Capacidades multimodales nativas: entrada de texto, imagen (con aspect ratio y resolución variables), vídeo y audio, sin codificadores separados.
- Generación de código y soporte de function calling nativo, orientado a flujos agénticos.
- Soporte de system prompt nativo para conversaciones estructuradas.
- Multilingüismo en más de 140 idiomas (capacidad del modelo base).
- Reducción drástica de rechazos: 11/101 frentes a 101/101 del original, según la model card.
- Aplicable tanto en formato safetensors (PEFT) como GGUF sobre el modelo base cuantizado.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar qué representaciones internas codifican el rechazo comparando las activaciones del modelo original y del adaptado, gracias a los pesos por capa publicados en la model card.
- Evaluación de robustez de filtros: útil para equipos de red teaming que necesitan un modelo con menor tasa de rechazo para probar clasificadores de contenido y políticas de moderación.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo base rechazaría peticiones legítimas.
- Asistentes de investigación en dominios sensibles (seguridad, medicina, criminología): el modelo puede abordar temas que el base evade, siempre con revisión humana y dentro de marcos legales.
- Fine-tuning posterior sobre el adaptador: al ser un LoRA de 42,7 M de parámetros y 0,3 GB, se puede combinar con otros adaptadores o continuar el entrenamiento en una sola GPU de consumo.
- Despliegue local en hardware de consumo: la versión GGUF permite aplicar el adaptador sobre un Gemma 4 12B cuantizado en llama.cpp u Ollama, sin infraestructura de servidor.
- Evaluación comparativa de técnicas de abliteration: sirve como referencia reproducible para comparar Heretic con otros métodos (por ejemplo, ORPO o DPO de rechazo) sobre el mismo modelo base.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 11/101 | 101/101 |
| Divergencia KL | 0,0639 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB y 42,7 M de parámetros; requiere cargar el modelo base Gemma 4 12B completo para inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 24 GB; en cuantización de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 justo o 8 bits; RTX 3090/4080 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se usa la versión GGUF en 4 bits.
- Opciones de despliegue: PEFT + Transformers para safetensors; llama.cpp u Ollama con `--lora LoRA.gguf` para GGUF; vLLM y TGI para servir el modelo base con el adaptador fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12B-it-SOMPOA-heresy-LORA | 42,7 M (adaptador) + 12B base | 256K (base) | LoRA decensurado | apache-2.0 | Hugging Face, 177 descargas |
| google/gemma-4-12B-it | 12B | 256K | Modelo base multimodal | Apache 2.0 (licencia Gemma 4) | Hugging Face, oficial |
| Adaptadores abliterated de Llama 3.x | variable | 128K | LoRA decensurado | según base | Comunidad en Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de decensurado en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina parte de los mecanismos de seguridad del modelo base; puede generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas originales.
- La licencia Apache 2.0 declarada convive con un `license_link` a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial del modelo base antes de desplegar.
- La divergencia KL de 0,0639 indica una degradación medible, aunque moderada, de la distribución original; puede afectar a la calidad en tareas generales.
- No se han publicado evaluaciones de sesgos, toxicidad ni alucinación específicas para este adaptador.
- El adaptador no modifica la arquitectura multimodal, pero no se confirma que las capacidades de audio, imagen y vídeo se conserven intactas tras la abliteration.
- Solo hay 177 descargas y 0 likes: es un artefacto de comunidad sin validación externa ni mantenimiento garantizado.
- La fecha de creación (2026-11-09) y la referencia arXiv 2607.02770 deben tratarse con cautela; no se ha verificado su correspondencia con publicaciones reales.
- El uso en producción requiere auditoría propia de contenido y cumplimiento normativo (por ejemplo, AI Act en la UE).

## Enlaces

- Hugging Face: https://huggingface.co/MuXodious/gemma-4-12B-it-SOMPOA-heresy-LORA
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Heretic: https://heretic-project.org
- Blog de lanzamiento de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Google DeepMind Gemma: https://deepmind.google/models/gemma/
