# qalduaij/lolo_Q8y_Legal

## Resumen
lolo_Q8y_Legal (Q8y Legal) es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.8-27B, desarrollado por Qusai Al-duaij (qalduaij) como parte de la familia "lolo AI Ecosystem". Está especializado en el constitucionalismo y la legislación del Estado de Kuwait: constitución, leyes, decretos amiríes y normativa judicial, con una política lingüística estricta de árabe estándar moderno formal (Fusha jurídica) y sin dialecto, además de soporte cruzado árabe-inglés.

El modelo se distribuye con licencia Apache 2.0, cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones, arquitectura densa) y un repositorio de 102,3 GB que incluye pesos en safetensors y cuantizaciones GGUF (Q8_0, Q4_K_M) para su uso con Ollama y LM Studio. Su relevancia radica en ser un ejemplo de "IA soberana" aplicada a un dominio jurídico nacional concreto, con entrenamiento SFT sobre documentación legislativa kuwaití y alineamiento DPO.

La model card indica que el ajuste se realizó mediante SFT (100 % en árabe formal jurídico, 0 % dialecto), con inyección de encabezados de artículos legales (`[القانون رقم X لسنة Y - المادة Z]`) y alineamiento DPO. El autor declara explícitamente que se trata de un proyecto personal sin equipo científico detrás, por lo que la ficha debe leerse con la cautela propia de un modelo en desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen/Qwen3.8-27B (la model card menciona "Dense Hybrid Gated DeltaNet + Attention"); ajuste fino con RSLoRA (r=16, alpha=32) |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 y Q4_K_M (según la model card); pesos safetensors en precisión completa |
| Idiomas soportados | Árabe (Fusha jurídica formal) e inglés (registro jurídico institucional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | text-generation |
| Tamaño del repositorio | 102,3 GB |
| Descargas | 337 |
| Fecha de creación | 2026-11-18 |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros. La model card describe la arquitectura base como "Dense Hybrid Gated DeltaNet + Attention", lo que sugiere una combinación de mecanismos de atención con capas de tipo DeltaNet (atención lineal/gated), aunque no se detalla la proporción ni la configuración exacta. El ajuste se realizó mediante RSLoRA con rango 16 y alpha 32.

El entrenamiento consistió en un SFT "puro" al 100 % sobre árabe estándar formal jurídico y documentación legislativa y constitucional kuwaití (0 % dialecto), con inyección de encabezados de artículos legales y "hechos de soberanía kuwaití" reforzados (marcados como `20x` en la model card), seguido de alineamiento DPO. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de RLHF/DPO. El repositorio incluye un `chat_template.jinja` propio y un `Modelfile` para Ollama.

## Capacidades
- Generación de texto en árabe estándar moderno formal (Fusha jurídica) e inglés con registro institucional.
- Consulta y razonamiento sobre el constitucionalismo kuwaití, leyes, decretos amiríes y normativa judicial.
- Citación estructurada de artículos legales mediante encabezados del tipo `[القانون رقم X لسنة Y - المادة Z]`.
- Correspondencia cruzada árabe-inglés (cross-lingual AR <-> EN) para consultas jurídicas bilingües.
- Conversación multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Despliegue compatible con Ollama y LM Studio mediante cuantizaciones GGUF (Q8_0, Q4_K_M).
- Capacidades multimodales (image-text-to-text) declaradas en los tags del repositorio, aunque no se detalla su alcance funcional.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso
- Consulta legislativa kuwaití: el modelo responde preguntas sobre artículos concretos de la constitución y leyes kuwaitíes citando el número de ley y artículo gracias a su entrenamiento SFT con encabezados legales inyectados.
- Redacción de borradores jurídicos en árabe formal: elaboración de memorandos o escritos institucionales en Fusha jurídica, evitando dialecto, adecuado para entornos administrativos kuwaitíes.
- Traducción jurídica árabe-inglés: conversión de terminología legal entre ambos idiomas con registro institucional, aprovechando su entrenamiento cross-lingual.
- Asistencia a estudiantes de Derecho: explicación de conceptos constitucionales y legislativos kuwaitíes en registro académico formal.
- Soporte documental interno para despachos y administraciones: resumen y localización de normativa aplicable en corpus legislativos kuwaitíes.
- Despliegue local soberano: ejecución mediante Ollama o LM Studio con cuantización Q4_K_M en infraestructura propia, sin dependencia de APIs externas, alineado con el objetivo de "IA soberana" del autor.
- Normalización de lenguaje administrativo: reescritura de textos hacia árabe formal institucional, dado el requisito estricto de cero dialecto del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 27,8 B parámetros, la cuantización Q4_K_M requiere aproximadamente 16-18 GB de VRAM; Q8_0 requiere aproximadamente 28-30 GB; los pesos safetensors en precisión completa (BF16/FP16) requieren aproximadamente 56 GB.
- GPU recomendadas: A100 40/80 GB o H100 para pesos completos; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M; para Q8_0 se recomienda una GPU de 32 GB o superior (p. ej., A100 40 GB, RTX A6000).
- Cabe en GPU de consumo: sí, en Q4_K_M con GPUs de 24 GB (RTX 4090, RTX 3090); Q8_0 queda al límite en 24 GB y puede requerir offloading parcial a CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Legal:Q8_0` o `:Q4_K_M`), LM Studio, Transformers; vLLM y TGI son compatibles a nivel de arquitectura base, aunque no se documentan explícitamente en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lolo_Q8y_Legal | ≈27,8 B (denso) | no disponible | Legislación kuwaití, árabe formal | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.8-27B (base) | ≈27,8 B (denso) | no disponible | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| qalduaij/lolo_Q8y_General | ≈27,8 B (denso) | no disponible | Asuntos generales kuwaitíes, árabe formal | Apache 2.0 (según familia) | Hugging Face |
| Modelos jurídicos generalistas (p. ej., adaptaciones de Llama o Mistral) | variable | variable | Dominio legal genérico | variable | Hugging Face |

La comparación directa con otros modelos jurídicos especializados en legislación kuwaití no está disponible en la información proporcionada; el único pariente documentado es el resto de la familia lolo (General y las variantes de dialecto), que cubren dominios distintos.

## Limitaciones y advertencias
- Proyecto personal sin equipo científico ni investigación formal detrás, según declara el propio autor; el nivel de validación es limitado.
- Riesgo de alucinación jurídica: puede citar artículos, números de ley o fechas incorrectas; no debe usarse como fuente legal definitiva sin verificación humana.
- Sesgo de dominio: entrenado exclusivamente sobre normativa kuwaití, por lo que su utilidad fuera de ese ordenamiento es reducida y puede producir respuestas erróneas en contextos de otros países.
- Política lingüística estricta: el modelo está diseñado para responder únicamente en árabe formal (cero dialecto) o inglés institucional; puede rechazar o degradar respuestas ante entradas en dialecto.
- Longitud de contexto no documentada, lo que dificulta planificar su uso con documentos legales extensos.
- No se documentan evaluaciones de sesgo, seguridad ni robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso jurídico recae enteramente en el desplegador.
- La model card menciona capacidades image-text-to-text en los tags, pero no se especifica su alcance ni su validación, por lo que no debe asumirse un soporte multimodal fiable.
- Modelo en desarrollo activo según el autor; la API, el comportamiento y los pesos pueden cambiar entre versiones.

## Enlaces
- Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Legal
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://www.alduaij.uk
- Familia lolo (modelo general): https://huggingface.co/qalduaij/lolo_Q8y_General
- Familia lolo (dialecto v2): https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2
- Familia lolo (dialecto v3): https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v3_31B
- Familia lolo (dialecto v4 MoE): https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B
- Familia lolo (dialecto v5 edge): https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B
