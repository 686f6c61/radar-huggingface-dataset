# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int8-gs64-sym

## Resumen

Minerva 7B instruct v1.0 es un modelo de lenguaje causal especializado en italiano, desarrollado por el grupo SapienzaNLP de la Universidad de La Sapienza (Roma) y publicado originalmente en HuggingFace. Esta ficha concreta corresponde a una versión cuantizada a INT8 del modelo original, producida por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.16.0. El modelo base emplea la arquitectura Mistral, aunque la model card no detalla el número exacto de parámetros del checkpoint original; el artefacto cuantizado contiene 2.301.366.272 parámetros en formato safetensors, un dato que no coincide con los 7B del nombre y que conviene tratar con cautela.

La relevancia de esta publicación es doble. Por un lado, ofrece una vía para ejecutar un modelo instructivo orientado al italiano en hardware Intel (CPU, iGPU Arc y NPU AI Boost de la serie Core Ultra) mediante intel-extension-for-pytorch y OpenVINO, sin necesidad de GPU dedicada. Por otro, documenta de forma inusualmente detallada el proceso de cuantización (receta de replicación, condiciones exactas de calibración y tiempos), lo que facilita la reproducibilidad.

El modelo está pensado para generación de texto conversacional en italiano e inglés, con licencia Apache 2.0. No obstante, el autor advierte explícitamente que la versión cuantizada se ha desarrollado únicamente con fines de investigación y se distribuye sin garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral) |
| Parametros totales | 2.301.366.272 (según safetensors del artefacto cuantizado); el modelo base se denomina 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, weights-only quantization (WoQ), group size 64, simétrica, método SignRound (AutoRound) |
| Idiomas soportados | Italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round), cargable con transformers |

## Arquitectura y entrenamiento

El modelo base Minerva-7B-instruct-v1.0 sigue la arquitectura Mistral, un transformer causal decoder-only. La model card del artefacto cuantizado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO en el modelo original; esa información correspondería a la model card del modelo base, no incluida en la información proporcionada.

La innovación técnica de esta publicación reside en la cuantización. Se aplicó Intel AutoRound v0.16.0 en modo weights-only, con 8 bits, grupo de 64 y esquema simétrico, calibrando sobre 128 muestras de 512 tokens durante 200 iteraciones con batch size 4 en CPU. El proceso se ejecutó con torch 2.14.1+cpu y transformers 4.55.3, cargando los pesos en bfloat16, y tardó 40.067,6 segundos (unas 667,8 minutos). El resultado está optimizado para inferencia en CPU Intel, iGPU Arc (vía intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (vía OpenVINO).

## Capacidades

- Generación de texto conversacional en italiano e inglés, con plantilla de chat integrada (rol user/assistant).
- Instrucciones y diálogo multi-turno mediante `apply_chat_template`.
- Razonamiento y generación de texto general propio de un modelo instructivo de la familia Mistral.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia en hardware Intel sin GPU dedicada: CPU, iGPU Arc y NPU Core Ultra.

## Casos de uso

- Asistente conversacional en italiano: el modelo puede gestionar diálogos multi-turno usando su plantilla de chat nativa, adecuado para atención al usuario en italiano donde el despliegue en CPU Intel resulte más económico que una GPU.
- Despliegue en portátiles y equipos de sobremesa con Core Ultra: gracias a la cuantización INT8 y la compatibilidad con OpenVINO, puede ejecutarse en la NPU AI Boost o la iGPU Arc, habilitando asistentes locales sin conexión.
- Procesamiento por lotes en servidores CPU: la versión INT8 con intel-extension-for-pytorch permite servir generación de texto en infraestructura Intel existente, reduciendo el coste de adquisición de GPU.
- Traducción y redacción asistida italiano-inglés: el soporte bilingüe permite tareas de reescritura, resumen y adaptación de textos entre ambos idiomas.
- Prototipado e investigación en PLN italiano: útil para experimentos académicos con modelos instructivos italianos en entornos de laboratorio sin acceso a hardware de alto rendimiento.
- Evaluación de pipelines de cuantización: el artefacto sirve como referencia reproducible para validar la receta de AutoRound (INT8, gs64, simétrico) sobre modelos Mistral de 7B antes de aplicarla a otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 9,0 GB, coherente con pesos INT8 más metadatos. En CPU el requisito sería de aproximadamente 9-10 GB de RAM para cargar el modelo completo.
- GPU recomendadas: el artefacto está optimizado para CPU Intel, iGPU Intel Arc (p. ej. Core Ultra 185H) y NPU AI Boost de la serie Core Ultra. No se documenta soporte ni rendimiento en A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? No hay datos publicados; al ser un formato auto_round orientado a Intel, su uso en GPU NVIDIA/AMD no está validado en la model card.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). El tag `text-generation-inference` aparece en los metadatos, pero no se detalla su configuración.
- Latencia y throughput: no disponibles. El único dato temporal es el de la cuantización (40.067,6 s), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Minerva-7B-instruct-v1.0 (INT8, este artefacto) | 2,30 B en safetensors (base denominado 7B) | no disponible | it, en | Apache 2.0 | safetensors auto_round, CPU/iGPU/NPU Intel |
| sapienzanlp/Minerva-7B-instruct-v1.0 (original) | 7B (según nombre) | no disponible | it, en | Apache 2.0 | safetensors, transformers |
| Mistral-7B-Instruct-v0.x | 7B | 32k (según versión) | en (multilingüe limitado) | Apache 2.0 | safetensors, GGUF, múltiples runtimes |

La comparación con otras alternativas italianas (por ejemplo, modelos de la familia LLaMA o variantes como Italia-9B) no está disponible en la información proporcionada. Los datos del modelo original y de Mistral-7B-Instruct se incluyen como referencia de categoría; conviene verificar sus fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- El autor declara que la versión cuantizada se ha desarrollado únicamente con fines de investigación y se distribuye sin garantía alguna.
- Discrepancia entre el nombre "7B" y los 2.301.366.272 parámetros registrados en safetensors: conviene verificar la integridad del checkpoint antes de usarlo en producción.
- La cuantización INT8 con AutoRound puede introducir degradación de calidad respecto al modelo en bfloat16; no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos causales instructivos; no hay datos específicos de mitigación en la información disponible.
- Cobertura lingüística limitada a italiano e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas.
- El artefacto está optimizado para hardware Intel; su uso en GPU NVIDIA o AMD no está validado ni documentado.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base y citarse adecuadamente.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de replicación (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
