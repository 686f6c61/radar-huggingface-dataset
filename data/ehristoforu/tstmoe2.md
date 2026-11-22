# ehristoforu/tstmoe2

## Resumen

tstmoe2 es un modelo de lenguaje publicado por el desarrollador independiente ehristoforu en Hugging Face. No se trata de un modelo entrenado desde cero, sino del resultado de un proceso de fusión de modelos (model merging) ejecutado con PolyMerge, la herramienta de fusión de arquitecturas heterogéneas desarrollada por el mismo autor. La model card es mínima: únicamente indica la licencia, el modelo base declarado y las etiquetas de la herramienta de fusión.

El identificador de arquitectura asociado en las etiquetas es `qwen3_5_moe`, lo que sugiere que los pesos derivan de una arquitectura tipo Mixture of Experts de la familia Qwen. El recuento real de parámetros en los ficheros safetensors es de 7.786.306.880 (aproximadamente 7,8 mil millones), con un repositorio de 15,6 GB, lo que es coherente con pesos en precisión de 16 bits.

Su relevancia es limitada y experimental: cuenta con cero descargas y cero likes, no declara pipeline, idiomas ni resultados de evaluación, y su licencia es "other" sin texto aclaratorio en la información disponible. Debe tratarse como un artefacto de investigación sobre técnicas de merging, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (según etiqueta del repositorio); detalles internos no disponibles |
| Parametros totales | 7.786.306.880 (≈7,8 B, según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,6 GB |
| Modelo base declarado | ehristoforu/tstmoe2 (autorreferencia) |
| Herramienta de creacion | PolyMerge (model merging) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de la etiqueta `qwen3_5_moe`, que apunta a un transformer con capas de mezcla de expertos (MoE). Tampoco se especifica el número de expertos, el tamaño de los expertos ni cuántos se activan por token, por lo que no es posible determinar los parámetros activos reales durante la inferencia.

El modelo no se ha entrenado de forma convencional: se ha generado mediante PolyMerge, una herramienta de fusión de modelos agnóstica a la arquitectura. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del propio método de merging.

## Capacidades

- Generación de texto: capacidad esperable por herencia de los modelos fusionados, aunque no verificada ni documentada.
- Razonamiento y matemáticas: no disponible; no hay evaluaciones publicadas.
- Generación de código: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre técnicas de merging: el modelo sirve como caso de estudio para analizar cómo PolyMerge combina pesos de arquitecturas MoE y qué efectos tiene sobre la coherencia de la salida.
- Evaluación comparativa de artefactos fusionados: útil para medir la degradación o mejora frente a los modelos de origen en tareas controladas de generación de texto.
- Pruebas de carga y compatibilidad de safetensors: al ser un checkpoint de 15,6 GB en formato safetensors, permite validar pipelines de carga y conversión (por ejemplo, a GGUF) en entornos de laboratorio.
- Experimentación académica con modelos de ~7,8 B: su tamaño permite ejecutarlo en una GPU de gama alta para estudiar el comportamiento de arquitecturas MoE fusionadas.
- Base para ajuste fino exploratorio: podría emplearse como punto de partida en experimentos de fine-tuning, siempre que la licencia "other" se aclare previamente.
- Docencia y demostraciones de model merging: ilustra de forma práctica el flujo de trabajo de PolyMerge y las etiquetas que genera en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB para pesos, con overhead adicional; no se han publicado versiones GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs de 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 ajustado y en GPUs de 16-24 GB con cuantización, siempre que se genere la cuantización localmente.
- Opciones de despliegue: carga directa con transformers; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI solo si la arquitectura `qwen3_5_moe` está soportada por esas herramientas, lo cual no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tstmoe2 | ≈7,8 B | no disponible | other | Hugging Face, 0 descargas | Artefacto de merging sin evaluaciones |
| Qwen2.5-7B | 7,6 B | 32.768 tokens (128K en variantes Turbo) | Apache 2.0 (mayoría de variantes) | Amplia, muy descargado | Modelo denso con documentación completa |
| Mistral-7B-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Amplia | Referencia densa de 7B con ecosistema maduro |
| Qwen1.5-MoE-A2.7B | 14,3 B totales / 2,7 B activos | 32.768 tokens | Apache 2.0 | Amplia | Alternativa MoE con parámetros activos documentados |

La comparación es orientativa: para tstmoe2 no se dispone de contexto, licencia clara ni métricas, por lo que la comparación se limita a tamaño y formato de publicación.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni idiomas, ni pipeline, ni resultados de evaluación.
- Licencia "other" sin texto: no se puede determinar si el uso comercial está permitido; es un riesgo legal para producción.
- Origen por merging: la fusión de pesos puede producir degradaciones imprevisibles en coherencia, repetición y fidelidad factual; no hay validación publicada.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones, no puede acotarse.
- Idiomas y contexto desconocidos: no es posible planificar despliegues multilingües ni conversaciones de contexto largo con garantías.
- Parámetros activos desconocidos: al ser MoE, el coste real de inferencia no puede estimarse con precisión.
- Repositorio sin tracción: cero descargas y cero likes implican ausencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/tstmoe2
- Herramienta PolyMerge: https://github.com/ehristoforu/polymerge
- Perfil del autor en Hugging Face: https://huggingface.co/ehristoforu
