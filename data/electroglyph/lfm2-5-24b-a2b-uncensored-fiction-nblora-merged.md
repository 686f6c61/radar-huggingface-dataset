# electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged

## Resumen
El modelo `electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged` es un ajuste fino (fine-tune) del modelo base `electroglyph/LFM2.5-24B-A2B-uncensored`, publicado por el usuario electroglyph en Hugging Face. Se trata de un modelo de generación de texto orientado a la narrativa de ficción, entrenado mediante SFT (supervised fine-tuning) con la librería TRL y la técnica denominada nblora, y posteriormente fusionado (merged) en un checkpoint único de pesos completos.

El modelo parte de una arquitectura LFM2.5 con mezcla de expertos (MoE), tal como indica la etiqueta `lfm2_moe` y el sufijo A2B del nombre (aproximadamente 2 mil millones de parámetros activos sobre un total de 24 mil millones). El checkpoint final contiene 23.971.587.712 parámetros según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de 24B con activación dispersa.

Su relevancia es acotada: se trata de un derivado comunitario sin model card detallada, sin licencia declarada y sin benchmarks publicados. Resulta de interés únicamente para quienes busquen un modelo de ficción sin censura basado en LFM2.5 y estén dispuestos a asumir las limitaciones documentales y legales que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 con mezcla de expertos (MoE), según tag `lfm2_moe` |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (inferido del sufijo A2B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
La arquitectura es un transformer con mezcla de expertos (MoE) de la familia LFM2.5, según la etiqueta `lfm2_moe` del repositorio. El nombre A2B sugiere aproximadamente 2B de parámetros activos por token sobre un total de 24B, aunque la model card no detalla el número de expertos, la top-k de enrutamiento ni la dimensión oculta. El contexto máximo tampoco se especifica.

El entrenamiento se realizó mediante SFT con TRL 1.18.0.dev0, Transformers 5.22.1, PyTorch 2.15.0 y Datasets 5.1.0. La técnica indicada es nblora, y el resultado se fusionó en un checkpoint único de pesos completos (de ahí el sufijo `merged`). No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional más allá del ajuste fino sobre el modelo base sin censura.

## Capacidades
- Generación de texto conversacional y narrativo, orientada a ficción según el nombre del checkpoint.
- Ajuste fino sobre un modelo base etiquetado como "uncensored", lo que implica menor rechazo a contenido sensible.
- Soporte de chat multi-turno mediante el pipeline de `transformers` con formato de roles (`user`/`assistant`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Generación de ficción y narrativa creativa: el modelo está ajustado específicamente sobre datos de ficción, por lo que es adecuado para redactar relatos, diálogos y tramas con menor fricción de rechazo que un modelo alineado convencional.
- Prototipado de asistentes de escritura: puede integrarse en herramientas de ideación de personajes, expansión de escenas o reescritura de pasajes, usando el pipeline de `transformers` con `device_map="auto"`.
- Role-play y narrativa interactiva: su formato conversacional permite mantener diálogos multi-turno en aplicaciones de ficción interactiva, siempre que se gestione externamente la longitud de contexto (no documentada).
- Investigación sobre alineación y censura: sirve como contrapunto empírico para estudiar el efecto del ajuste fino "uncensored" sobre el comportamiento del modelo base.
- Generación de contenido para videojuegos narrativos: puede emplearse para producir texto dinámico de NPCs o descripciones de mundo, con revisión humana obligatoria por el riesgo de salidas inapropiadas.
- Experimentación con arquitecturas MoE: al ser un MoE de ~24B con ~2B activos, es útil para medir requisitos de memoria y throughput en despliegues con activación dispersa, aunque la falta de benchmarks limita la comparación rigurosa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 48 GB solo para pesos (24B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 80 GB para margen.
- VRAM estimada en cuantización de 8 bits: ~24 GB de pesos, más overhead; viable en GPUs de 40-48 GB con contexto moderado.
- VRAM estimada en cuantización de 4 bits: ~12-14 GB de pesos; podría caber en una RTX 4090 (24 GB) con contexto limitado, aunque no se publican GGUF oficiales y habría que cuantizar manualmente.
- GPUs recomendadas: A100 80 GB o H100 para FP16/BF16 sin cuantizar; A6000/L40S para 8 bits; RTX 4090 solo con cuantización agresiva.
- Despliegue: `transformers` (soporte confirmado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura LFM2.5 MoE en la información disponible.
- Latencia y throughput: no disponibles. El tamaño del repo (439,1 GB) sugiere que incluye múltiples checkpoints o pesos en varios formatos, lo que complica la descarga y el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged | ~24B totales / ~2B activos | no disponible | no disponible | Hugging Face, 300 descargas |
| electroglyph/LFM2.5-24B-A2B-uncensored (modelo base) | ~24B totales / ~2B activos | no disponible | no disponible | Hugging Face |
| Alternativas MoE de ~24B (p. ej. Mistral Small, Qwen MoE) | ~22-24B | 32K-128K típicamente | Apache-2.0 o similar | Hugging Face, ampliamente documentados |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias
- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, composición del dataset, hiperparámetros ni evaluación.
- Licencia no declarada: el campo `licence: license` está vacío, por lo que el uso comercial es jurídicamente incierto y desaconsejado sin aclaración del autor.
- Modelo etiquetado como "uncensored": mayor probabilidad de generar contenido sensible, ofensivo o inapropiado; requiere filtrado y supervisión en producción.
- Riesgo de alucinación no evaluado: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre su fiabilidad factual.
- Contexto e idiomas no documentados: no se puede planificar el despliegue en escenarios multilingües o de contexto largo con garantías.
- Repositorio de 439,1 GB: la descarga y el almacenamiento son costosos; conviene verificar qué archivos son necesarios antes de clonar.
- Procedencia comunitaria: autor individual, 0 likes y 300 descargas; sin garantías de mantenimiento ni soporte.
- Sin formatos cuantizados oficiales: la integración con llama.cpp u Ollama requeriría conversión manual y validación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
