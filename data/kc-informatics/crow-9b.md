# KC-Informatics/Crow-9B

## Resumen

Crow-9B es un ajuste fino del modelo multimodal Ornith-1.5-9B (linaje Qwen 3.5 según los tags del repositorio), desarrollado por KC-Informatics. El problema que aborda es concreto: el modelo base tiende a agotar su presupuesto de razonamiento sin emitir una respuesta final. Crow se entrena con destilación propia (self-distillation) sobre las respuestas correctas más cortas que el propio modelo genera, de modo que aprende a concluir en lugar de divagar. El resultado es un modelo con el mismo conocimiento que el base pero con una tasa de finalización mucho mayor.

El modelo tiene 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones), se distribuye en safetensors y se publica bajo licencia Apache 2.0. Está pensado para razonamiento, generación de texto, código y matemáticas, con soporte de tool calling y un modo de razonamiento compatible con el parser de Qwen3 en vLLM. Su relevancia actual radica en que demuestra que un ajuste fino pequeño y quirúrgico puede recuperar capacidad práctica de un modelo que, sin él, desperdicia su ventana de pensamiento.

La propuesta diferencial es doble: por un lado, el ajuste LoRA de rango 32 que reduce la verbosidad sin destruir el comportamiento del modelo (mantiene el 95,7% de coincidencia en el siguiente token sobre texto ordinario, lo que preserva la compatibilidad con el modelo draft de decodificación especulativa); por otro, un script auxiliar (`nudge.py`) que reintenta una conclusión cuando el modelo agota su presupuesto de razonamiento. Con ese auxiliar, el modelo responde correctamente 54 de 60 preguntas de nivel de posgrado en ciencias (GPQA Diamond), frente a 46 sin él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), linaje Qwen 3.5 / Ornith 1.5; incluye proyecciones recurrentes con compuerta (gated recurrent projections) según la receta de cuantización AWQ |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de despliegue recomendada (`--max-model-len 32768`); la longitud máxima nativa del modelo base no se detalla |
| Tipos de cuantizacion | AWQ W4A16 de 4 bits (build oficial en `KC-Informatics/Crow-9B-AWQ`); safetensors en precisión completa en este repo |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variante AWQ de 4 bits en repo separado |

## Arquitectura y entrenamiento

Crow-9B parte de `ornith-ai/Ornith-1.5-9B`, un modelo multimodal de tipo image-text-to-text con arquitectura transformer y componentes de atención y MLP propios de la familia Qwen 3.5. El ajuste consiste en un LoRA de rango 32 (alpha 64) aplicado sobre las proyecciones de atención y MLP, entrenado durante 2 épocas y 144 pasos, con un término KL que mantiene al modelo cerca del original. El LoRA se fusiona en los pesos finales; los pesos de visión no se tocan.

El dataset de entrenamiento se construyó con 499 problemas de práctica nuevos, verificados para no solaparse (ventanas de 14 palabras) con GPQA Diamond, AIME 2026, IFEval ni LiveCodeBench v6. Para cada problema resuelto se conservó la traza correcta más corta, validada por script, lo que produjo 569 ejemplos a partir de 418 problemas resueltos. La innovación técnica principal es esta destilación de las propias trayectorias más eficientes del modelo, que reduce la tendencia al sobre-razonamiento sin reentrenar conocimiento. La build de 4 bits se generó con AWQ (W4A16) mediante `llmcompressor`, calibrada sobre 128 respuestas de práctica verificadas, manteniendo las proyecciones recurrentes con compuerta en precisión completa.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (compatible con `--reasoning-parser qwen3` en vLLM).
- Razonamiento matemático (evaluado en AIME 2026) y resolución de problemas de ciencia de nivel de posgrado (GPQA Diamond).
- Generación y razonamiento sobre código (evaluado en LiveCodeBench v6).
- Seguimiento de instrucciones (evaluado en IFEval) y comprensión de documentos largos (evaluado en AA-LCR).
- Tool calling / function calling listo para usar (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque el ajuste no modifica los pesos de visión.
- Compatibilidad con decodificación especulativa mediante el draft model `ornith-ai/Ornith-1.5-9B-DFlash` (método `dflash`, 8 tokens especulativos).
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Razonamiento científico asistido: el modelo responde preguntas de nivel de posgrado (54/60 en GPQA Diamond con el auxiliar) y puede emplearse en herramientas de apoyo a investigación o formación, donde la ventana de 32.768 tokens permite incluir enunciados y contexto extensos.
- Automatización de resolución de problemas matemáticos: útil en pipelines de verificación o tutoría que requieren trazas de razonamiento acotadas, gracias al entrenamiento para concluir en lugar de agotar el presupuesto de pensamiento.
- Generación de código en producción: el soporte nativo de tool calling y el parser `qwen3_coder` permiten integrarlo en asistentes de IDE o pipelines de CI/CD que invocan herramientas externas (ejecución de tests, linters, APIs).
- Atención al cliente con contexto largo: la ventana de 32.768 tokens admite conversaciones multi-turno y documentos de referencia extensos; el modo de razonamiento permite respuestas justificadas.
- Procesamiento de documentos largos: evaluado en AA-LCR (17/20 con el auxiliar), adecuado para extracción y resumen de informes extensos.
- Despliegue en hardware de consumo: la variante AWQ de 4 bits ocupa 10,2 GB en uso sobre una tarjeta de 12 GB, lo que habilita prototipos locales, entornos de desarrollo y demos sin GPU de datacenter.
- Servicio de inferencia con decodificación especulativa: combinado con el draft model DFlash, reduce la latencia en despliegues vLLM con suficiente memoria.

## Benchmarks y rendimiento

Resultados publicados por el autor: 180 preguntas públicas, un intento por pregunta, corrección por script.

| Benchmark | Crow-9B con auxiliar | Crow-9B sin auxiliar | Qwen 3.8 27B (original) | DeepSeek V4.1 Flash (671B) |
|---|---:|---:|---:|---:|
| GPQA Diamond (60 preguntas) | 54 | 46 | 46 | 55 |
| AIME 2026 (30 preguntas) | 20 | 20 | 18 | 27 |
| LiveCodeBench v6 (40 preguntas) | 21 | 17 | 20 | 29 |
| IFEval (30 preguntas) | 20 | 21 | 26 | 26 |
| AA-LCR (20 preguntas) | 17 | 15 | 14 | 17 |
| **Total (180)** | **132** | **119** | **124** | **154** |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 10,2 GB en uso para la variante AWQ de 4 bits (repo de 9,1 GB de descarga); los pesos en precisión completa ocupan 18 GB, por lo que requieren 24 GB de VRAM o más.
- GPU recomendadas: RTX 4090 (24 GB) o superiores para la versión completa; tarjetas de 12 o 16 GB para la variante AWQ. Para servicio en producción, A100 o H100 según concurrencia.
- Cabe en GPU de consumo: sí, la variante AWQ en tarjetas de 12 GB; la versión completa en tarjetas de 24 GB.
- Opciones de despliegue: vLLM 0.34 o superior (comando documentado con `--trust-remote-code`, `--gpu-memory-utilization 0.95`, `--max-model-len 32768`, `--max-num-seqs 2`); tags del repo indican también compatibilidad con SGLang. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que la decodificación especulativa con `Ornith-1.5-9B-DFlash` (8 tokens especulativos) aporta velocidad adicional cuando hay memoria suficiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | AIME 2026 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Crow-9B | 9,65 B | 32.768 (config. recomendada) | 54/60 (con auxiliar) | 20/30 | Apache 2.0 | Hugging Face (completo y AWQ) |
| Qwen 3.8 27B | 27 B (según el autor) | no disponible | 46/60 | 18/30 | no disponible | no disponible |
| DeepSeek V4.1 Flash | 671 B | no disponible | 55/60 | 27/30 | no disponible | servicio en la nube |
| Ornith-1.5-9B (base) | 9 B (aproximado) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación con el modelo base no incluye cifras porque el autor no las publica en la model card; solo se documenta que Crow mejora la tasa de finalización y que mantiene el 95,7% de coincidencia en el siguiente token respecto al original.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación inherente a los modelos generativos; el ajuste no incorpora verificación factual.
- El modelo base tiende a agotar el presupuesto de razonamiento sin responder; sin el auxiliar `nudge.py`, la tasa de finalización cae (119/180 frente a 132/180 en la evaluación del autor).
- Los benchmarks son de elaboración propia, con 180 preguntas y un único intento por pregunta; las diferencias de pocos puntos pueden no ser estadísticamente significativas.
- El ajuste no modifica los pesos de visión, por lo que las capacidades multimodales no se han reforzado ni evaluado en esta versión.
- La cuantización AWQ puede degradar ligeramente la calidad frente a los pesos completos; no se publican métricas comparativas entre ambas builds.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `ornith-ai/Ornith-1.5-9B` y del draft model, también Apache 2.0 según el autor.
- Requiere vLLM 0.34 o superior y `--trust-remote-code`, lo que implica ejecutar código del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face (completo): https://huggingface.co/KC-Informatics/Crow-9B
- Variante AWQ de 4 bits: https://huggingface.co/KC-Informatics/Crow-9B-AWQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Draft model para decodificación especulativa: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
