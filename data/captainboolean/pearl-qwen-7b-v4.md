# captainBoolean/pearl-qwen-7b-v4

## Resumen

pearl-qwen-7b-v4 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario captainBoolean y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 7.000 millones de parámetros construido sobre la arquitectura Qwen2 (transformer decoder-only), partiendo concretamente de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`) y entrenado con la librería Unsloth, que el autor destaca por permitir un entrenamiento el doble de rápido.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: la model card es prácticamente una plantilla autogenerada por Unsloth, sin información sobre el dataset de ajuste, el número de pasos, los hiperparámetros ni los objetivos del fine-tuning. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo (0,2 GB) sugiere que los pesos publicados no corresponden a un modelo completo en precisión nativa, sino probablemente a adaptadores o a un subconjunto de pesos.

Por tanto, esta ficha documenta lo que se puede verificar (modelo base, licencia, idioma declarado, herramientas de entrenamiento) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluador que considere este modelo debe asumir que las capacidades reales heredan casi por completo las del Qwen2.5-7B-Instruct original, sin garantías sobre el efecto del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | 7B (heredados del modelo base; no verificado en el repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | No disponible (el base de entrenamiento era bnb-4bit; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (declarado por el autor); el base Qwen2.5 soporta multilingüe, pero no se declara aquí |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.000 millones de parámetros con atención por cabezas agrupadas (GQA), RoPE y las mejoras estándar de la familia Qwen2. El ajuste se realizó sobre la variante pre-cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`), lo que implica que el entrenamiento se hizo con cuantización de 4 bits (QLoRA o similar) y que los pesos resultantes pueden arrastrar los efectos de esa cuantización.

La model card no aporta ningún dato sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo RLHF, DPO o SFT supervisado, ni los hiperparámetros (learning rate, epochs, rango LoRA). La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento 2x. Tampoco se especifica si se publicaron adaptadores LoRA o pesos fusionados; el tamaño del repo (0,2 GB) es compatible con adaptadores, pero no se puede confirmar sin inspeccionar los ficheros.

## Capacidades

- Generación de texto en inglés (idioma declarado), heredando las capacidades del Qwen2.5-7B-Instruct base.
- Razonamiento y matemáticas básicas: presumiblemente conserva el rendimiento del base, aunque no hay evaluación que lo confirme.
- Generación de código: capacidad heredada del base, sin datos de validación en este fine-tuning.
- Soporte de tool calling / function calling: no declarado por el autor; el base Qwen2.5-Instruct lo soporta, pero no se garantiza tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingües: no declaradas (solo "en").
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 7B con licencia Apache 2.0, se puede desplegar en entornos de desarrollo para validar flujos de chat multi-turno antes de invertir en modelos mayores.
- Experimentación académica con fine-tuning: sirve como ejemplo de pipeline Unsloth + TRL para reproducir ajustes sobre Qwen2.5, útil en cursos y talleres de IA.
- Generación de texto en pipelines de CI para pruebas de regresión: su tamaño permite incluirlo en tests automatizados de calidad de respuesta sin coste de GPU elevado.
- Base para nuevos ajustes específicos de dominio: el autor publica pesos con licencia permisiva, de modo que otro equipo puede continuar el entrenamiento con su propio dataset.
- Despliegue en hardware de consumo: un modelo de 7B cuantizado a 4 bits cabe en GPUs de 8-12 GB, lo que permite usarlo en estaciones de trabajo locales para tareas de redacción y resumen en inglés.
- Evaluación comparativa de fine-tunes comunitarios: útil como punto de control en estudios que miden la variabilidad de ajustes informales sobre un mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 7B se estiman aproximadamente 14-16 GB en FP16, 8-10 GB en 8 bits y 4-6 GB en 4 bits, aunque estas cifras son orientativas y no las declara el autor.
- GPU recomendadas: no disponibles; por tamaño del base, cabría esperar A100/H100 para FP16 y RTX 4090/3090 para cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización de 4-8 bits en GPUs con 8 GB o más, pero no hay confirmación del autor ni ficheros GGUF publicados.
- Opciones de despliegue: transformers y text-generation-inference (según tags); no se declaran soportes para vLLM, llama.cpp, Ollama ni TGI verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| captainBoolean/pearl-qwen-7b-v4 | 7B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin documentar |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de 7B con ecosistema maduro |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar el riesgo de sesgos introducidos por el ajuste.
- Riesgo de alucinación heredado del base Qwen2.5-7B-Instruct, sin mitigaciones declaradas.
- Idioma declarado únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- El ajuste se hizo sobre una versión pre-cuantizada en 4 bits, lo que puede degradar la calidad respecto al base en FP16/BF16.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Tamaño del repo (0,2 GB) incompatible con pesos completos de 7B en FP16; verificar si se publicaron adaptadores LoRA o pesos parciales antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se declaran capacidades de tool calling ni de agentes, aunque el base las soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/captainBoolean/pearl-qwen-7b-v4
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
