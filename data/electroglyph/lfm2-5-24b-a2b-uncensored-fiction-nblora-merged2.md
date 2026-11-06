# electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2

## Resumen

`electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2` es un ajuste fino (fine-tuning) del modelo `electroglyph/LFM2.5-24B-A2B-uncensored`, a su vez derivado de la familia LFM2.5 de Liquid AI. El autor, el usuario de Hugging Face `electroglyph`, lo ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL para especializarlo en generación de ficción. El nombre del repositorio indica una arquitectura de mezcla de expertos (MoE) con 24B de parámetros totales y 2B activos por token (sufijo `A2B`), aunque esta información no está confirmada en la model card.

El modelo resuelve el problema de la generación creativa de narrativa sin los filtros de alineación habituales: parte de una variante "uncensored" y se ha afinado adicionalmente sobre un dataset de ficción. El resultado es un modelo orientado a escritura creativa sin restricciones temáticas, con pesos fusionados (merged) listos para inferencia directa.

Es relevante por su carácter de experimento comunitario: se publica bajo el ecosistema TRL/Transformers, con el repositorio ocupando 97,9 GB en formato safetensors, lo que sugiere pesos en precisión alta (probablemente bf16 o fp16) para un modelo de 24B parámetros. No obstante, la documentación es mínima y no se publican benchmarks, licencia explícita ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según nomenclatura `A2B`; no confirmado en la model card |
| Parámetros totales | 24B (según nombre del modelo) |
| Parámetros activos | 2B (según nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tuning por SFT del checkpoint `electroglyph/LFM2.5-24B-A2B-uncensored`, entrenado con TRL 1.18.0.dev0 sobre Transformers 5.22.1 y PyTorch 2.15.0. La nomenclatura `LFM2.5-24B-A2B` remite a la familia LFM2.5 de Liquid AI, caracterizada por arquitecturas híbridas con capas convolucionales y de atención, y en esta variante por un diseño MoE con 24B parámetros totales y 2B activos. No obstante, la model card no detalla la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset de ficción ni si se aplicaron etapas de RLHF o DPO adicionales.

El entrenamiento se realizó con SFT y la técnica indicada en el nombre del repo (`nblora`, presumiblemente un esquema de LoRA con normalización o variante propia) seguida de una fusión de pesos (merged). El run de Weights & Biases está enlazado en la model card (`wandb.ai/electroglyph-n-a/fiction-nblora/runs/lupq05g0`), pero no se aportan métricas de pérdida, hiperparámetros ni tamaño del dataset en el texto disponible.

## Capacidades

- Generación de texto narrativo y ficción: es la capacidad principal para la que fue afinado.
- Escritura creativa sin restricciones temáticas, al partir de una base "uncensored".
- Generación de texto multi-turno mediante el pipeline de `transformers` (el ejemplo de la model card usa formato de chat con `role: user`).
- Compatibilidad con `endpoints_compatible` (según tags), lo que permite desplegarlo en infraestructura de inferencia compatible con la API de Hugging Face.
- Razonamiento general y código: presumiblemente heredados del modelo base, pero no documentados ni verificados.
- Tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de ficción y narrativa larga: el modelo se ha afinado específicamente sobre un dataset de ficción, por lo que es adecuado para redactar relatos, capítulos de novela o guiones sin los filtros de contenido habituales.
- Escritura creativa asistida para autores: puede usarse como generador de borradores o continuador de escenas en herramientas de escritura, aprovechando el ajuste sobre ficción.
- Roleplay y narrativa interactiva: el formato de chat del pipeline permite conversaciones multi-turno con personajes, útil en aplicaciones de ficción interactiva.
- Prototipado de contenido editorial sin restricciones: para experimentación con tramas adultas, terror o temas sensibles que otros modelos rechazarían.
- Generación de datos sintéticos narrativos: puede emplearse para producir corpus de ficción destinados a otros entrenamientos, dado su sesgo hacia ese dominio.
- Investigación sobre alineación y censura: sirve como caso de estudio de modelos "uncensored" y de los riesgos asociados, al ser un ajuste comunitario sin evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24B parámetros totales y pesos en bf16/fp16, el repositorio ocupa 97,9 GB, por lo que la inferencia en precisión completa requiere del orden de 48-50 GB de VRAM (más overhead de contexto y KV cache).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa; en cuantización a 8 bits o 4 bits podría caber en una RTX 4090 (24 GB) o A6000 (48 GB), aunque no se han publicado cuantizaciones oficiales.
- ¿Cabe en consumer GPU? En bf16 no cabe en ninguna GPU de consumo actual; en 4 bits (estimación no oficial) podría ajustarse en una RTX 4090, pero no hay GGUF publicado en el repo.
- Opciones de despliegue: `transformers` con `device_map="auto"` (según la model card), endpoints compatibles con la API de Hugging Face (tag `endpoints_compatible`), y potencialmente vLLM o TGI si la arquitectura MoE es compatible, aunque no está confirmado. No hay GGUF ni Ollama en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2 | 24B | 2B | no disponible | no disponible | Hugging Face (0 descargas) |
| electroglyph/LFM2.5-24B-A2B-uncensored (base) | 24B | 2B | no disponible | no disponible | Hugging Face |
| Familia LFM2.5 original (Liquid AI) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia de licencia explícita: la model card indica `licence: license` sin especificar términos, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar la licencia.
- Modelo "uncensored": carece de filtros de alineación, por lo que puede generar contenido ofensivo, ilegal o dañino sin restricciones. No es apto para aplicaciones de cara al público sin capas de moderación.
- Riesgo elevado de alucinación: al ser un ajuste sobre ficción, puede confundir hechos con narrativa y producir afirmaciones falsas con tono convincente.
- Documentación mínima: no se especifican idiomas, contexto, dataset de entrenamiento ni métricas, lo que dificulta evaluar su calidad y reproducibilidad.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento frente a alternativas.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere cuantización manual.
- Repositorio con 0 descargas y 0 likes: modelo sin validación por parte de la comunidad.
- Posible herencia de sesgos del modelo base y del dataset de ficción, no documentados.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Run de Weights & Biases: https://wandb.ai/electroglyph-n-a/fiction-nblora/runs/lupq05g0
- Repositorio TRL: https://github.com/huggingface/trl
