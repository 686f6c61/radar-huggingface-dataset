# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Multi-Rewrite-GM-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Multi-Rewrite-GM-SFT` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2 de Alibaba. El nombre del repositorio sugiere un entrenamiento orientado a tareas de reescritura múltiple ("Multi-Rewrite") y posiblemente a la generación de haikus, aunque la model card no detalla la composición del dataset de ajuste.

El modelo hereda las capacidades del Qwen2.5-1.5B-Instruct original, incluyendo conversación multi-turno, generación de código y razonamiento básico, pero el ajuste fino adicional puede haber especializado su comportamiento hacia las tareas concretas del dataset de entrenamiento. Al estar basado en Qwen2.5-1.5B-Instruct, mantiene una ventana de contexto de 32.768 tokens (característica de la familia Qwen2.5) y soporte para tool calling, aunque la model card no confirma explícitamente estos datos para este ajuste específico.

La relevancia de este modelo radica en su tamaño reducido (1,5B), que permite su despliegue en hardware de consumo, y en su licencia Apache 2.0, que facilita el uso comercial. Sin embargo, la ausencia de documentación técnica detallada, benchmarks y la falta de descargas (0 descargas en el momento de la consulta) lo convierten en un modelo de nicho o experimental, más adecuado para evaluación que para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 (≈1,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantización | no disponible en la model card; los pesos se distribuyen en safetensors (compatibles con cuantización posterior a GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como se implementa en la familia Qwen2.5. El modelo base `unsloth/Qwen2.5-1.5B-Instruct` fue entrenado originalmente por Alibaba con un corpus multilingüe masivo y posteriormente sometido a alineación mediante instrucciones y preferencias humanas (RLHF/DPO), aunque los detalles exactos de ese proceso no se recogen en la información disponible.

El ajuste fino realizado por lugman se llevó a cabo con la librería Unsloth, que según la model card permitió un entrenamiento "2x más rápido" y con menor uso de memoria que el entrenamiento estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como LoRA, QLoRA o ajuste completo. El nombre del repositorio sugiere un entrenamiento supervisado (SFT) orientado a tareas de reescritura múltiple y posiblemente a la generación de haikus, pero no hay documentación que lo confirme. Tampoco se detalla si hubo fases de RLHF o DPO adicionales sobre el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas simples, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel introductorio, según las capacidades del modelo base.
- Soporte de tool calling / function calling (heredado del base Qwen2.5-Instruct, aunque no confirmado explícitamente para este ajuste).
- Capacidad de reescritura de texto ("Multi-Rewrite"), sugerida por el nombre del repositorio, aunque sin documentación que la valide.
- Posible especialización en generación de haikus o poesía breve, sugerida por el nombre del repositorio.
- Capacidades multilingües limitadas: la model card solo declara inglés (`en`), aunque el base Qwen2.5 soporta múltiples idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" extendido.

## Casos de uso

- Reescritura de textos en inglés: el modelo puede emplearse para reformular párrafos, cambiar el tono o generar variantes de un mismo contenido, aprovechando la especialización sugerida por su nombre. Adecuado para tareas de edición asistida donde se requiere un modelo ligero.
- Generación de haikus y poesía breve: si el ajuste fino se orientó a este dominio, el modelo podría generar composiciones poéticas cortas en inglés con estructura 5-7-5, aunque requiere validación empírica.
- Prototipado rápido de asistentes conversacionales: con 1,5B parámetros, cabe en GPUs de consumo y permite iterar sobre prompts y flujos conversacionales sin infraestructura costosa.
- Evaluación de ajustes finos (fine-tuning research): útil como caso de estudio de cómo un SFT sobre un modelo pequeño altera el comportamiento respecto al base, para investigadores que analizan transferencia y olvido catastrófico.
- Generación de texto en entornos con recursos limitados: despliegue en dispositivos edge o GPUs con 4-8 GB de VRAM mediante cuantización a 4 bits, para tareas de generación de texto no críticas.
- Filtrado o transformación de contenido en pipelines de datos: el modelo puede reescribir o normalizar textos en inglés dentro de flujos ETL, siempre que se valide su calidad frente al modelo base.
- Educación y demostraciones: adecuado para talleres o tutoriales sobre fine-tuning con Unsloth y TRL, dado su tamaño manejable y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización 8 bits: aproximadamente 1,6 GB para pesos, con un total estimado de 3-4 GB.
- VRAM estimada en cuantización 4 bits: aproximadamente 0,8-1 GB para pesos, con un total estimado de 2-3 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput; también cabe en GPUs de 8 GB como RTX 3070 o RTX 4060 con cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6-8 GB o más, especialmente con cuantización a 4 u 8 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp (tras conversión a GGUF), Ollama (tras conversión), Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Multi-Rewrite-GM-SFT | 1,5B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino especializado, sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base con alineación y benchmarks publicados |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto mayor, licencia con restricciones |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face, ampliamente usado | Mayor tamaño, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento del modelo base Qwen2.5, que no se documentan en esta model card; el ajuste fino adicional puede introducir sesgos específicos del dataset de entrenamiento, no especificado.
- Riesgo de alucinación: presente como en cualquier modelo de 1,5B parámetros; la falta de benchmarks impide cuantificar su fiabilidad.
- Limitaciones de contexto e idioma: la model card solo declara inglés; el contexto no se especifica para este ajuste (aunque el base soporta 32.768 tokens). El ajuste fino puede haber reducido la competencia multilingüe del base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda verificar que el modelo base `unsloth/Qwen2.5-1.5B-Instruct` mantiene la misma licencia (así consta en la información disponible).
- Caveats para producción: sin benchmarks, sin documentación del dataset de entrenamiento, sin métricas de evaluación y con 0 descargas, no se recomienda su uso en producción sin una validación exhaustiva frente al modelo base. El ajuste fino puede haber causado olvido catastrófico de capacidades generales.
- El nombre del repositorio sugiere una especialización muy concreta (haikus, reescritura múltiple) que no está documentada; su comportamiento fuera de ese dominio es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Multi-Rewrite-GM-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
