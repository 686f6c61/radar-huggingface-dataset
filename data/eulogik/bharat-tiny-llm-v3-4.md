# eulogik/Bharat-Tiny-LLM-v3.4

## Resumen

Bharat-Tiny-LLM v3.4 es un ajuste fino (fine-tuning) de tipo LoRA fusionado sobre el modelo base `eulogik/Bharat-Tiny-LLM-v3`, un transformer de 1.720.642.560 parámetros (aproximadamente 1,7B) orientado a tareas de matemáticas y chat en hindi, hinglish y escritura brahmi. Lo desarrolla el usuario `eulogik` y se distribuye bajo licencia Apache 2.0. El modelo se entrenó con 43.687 filas de datos SFT mixtos de matemáticas y conversación procedentes del dataset `eulogik/bharat-v3-mixed-sft-v34`.

La relevancia de esta versión es limitada: la propia model card la marca como **experimental y superada** ("superseded"). Los controles de calidad fallaron, con un rendimiento en GSM8K-Hindi de aproximadamente el 13% frente al 29% del modelo base v3 (medición fijada con n=100 sobre llama.cpp en cuantización Q4), y un comportamiento conversacional débil. El autor la conserva únicamente por reproducibilidad y recomienda usar `eulogik/Bharat-Tiny-LLM-v3` (junto con los GGUF de chat v3.3 del mismo repositorio) para producción.

Se trata, por tanto, de un modelo pequeño y de nicho lingüístico (hindi/hinglish/brahmi) cuyo interés principal es documental: ilustra un ciclo de ajuste fino con LoRA sobre una base de 1,7B y un proceso de auditoría de afirmaciones (claim audit) que corrigió una métrica previamente publicada del 56% al 29% real en GSM8K-Hindi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de la familia Qwen3, según tags) |
| Parámetros totales | 1.720.642.560 (~1,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con seq length 1024) |
| Tipos de cuantización | no disponible en la model card; se menciona evaluación en Q4 vía llama.cpp |
| Idiomas soportados | hindi, hinglish, brahmi (según tags); lista oficial no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB); GGUF no confirmado para esta versión |

## Arquitectura y entrenamiento

El modelo parte de `eulogik/Bharat-Tiny-LLM-v3`, una base de 1,7B con etiqueta `qwen3` en Hugging Face, lo que sugiere una arquitectura transformer densa derivada de la familia Qwen3. Sobre esa base se aplicó un ajuste fino supervisado (SFT) mixto de matemáticas y chat con 43.687 filas "gold" del dataset `eulogik/bharat-v3-mixed-sft-v34`.

El método fue LoRA con rango r=16 y alpha=32, posteriormente fusionado a fp16. Se entrenó durante 1 época con learning rate 2e-5 y longitud de secuencia 1024, en 611 minutos sobre 2×T4 con DataParallel en Kaggle. La pérdida de entrenamiento bajó de 1,82 a 1,23. No se documentan fases de RLHF, DPO ni innovaciones arquitectónicas adicionales; el interés técnico reside en el proceso de auditoría de métricas que acompañó la publicación.

## Capacidades

- Generación de texto y conversación multi-turno (chat), aunque la model card califica el comportamiento conversacional como débil.
- Razonamiento matemático, con foco declarado en problemas tipo GSM8K en hindi.
- Soporte de hindi, hinglish y escritura brahmi según los tags del modelo.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste fino: sirve como referencia para replicar el pipeline LoRA (r=16, α=32, 1 época, lr 2e-5) sobre una base de 1,7B en hardware modesto (2×T4).
- Investigación sobre modelos pequeños para hindi/hinglish: permite estudiar el comportamiento de un modelo de 1,7B en estas lenguas, con la advertencia de su calidad limitada.
- Evaluación comparativa de degradación por ajuste fino: útil para analizar cómo un SFT mixto puede reducir el rendimiento matemático respecto al modelo base (13% frente a 29% en GSM8K-Hindi).
- Docencia y formación: ejemplo práctico de auditoría de claims y corrección de métricas publicadas en una model card.
- Pruebas de pipelines de inferencia en cuantización Q4 con llama.cpp sobre modelos pequeños.
- Prototipado interno no crítico donde la licencia Apache 2.0 y el tamaño reducido facilitan el despliegue, siempre que no se requiera calidad conversacional ni matemática fiable.

## Benchmarks y rendimiento

| Benchmark | Bharat-Tiny-LLM v3.4 | Bharat-Tiny-LLM v3 |
|---|---|---|
| GSM8K-Hindi (n=100, llama.cpp Q4) | ~13% | 29% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible. La cifra del 56% citada anteriormente para v3 fue corregida por el propio autor a 29% mediante auditoría (`docs/claim_audit.md`).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en fp16 (pesos de 1,7B), en torno a 1-1,5 GB en cuantización Q4.
- GPU recomendadas: T4 (usada en entrenamiento), RTX 3060/4060 o superiores para inferencia; A100/H100 no necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en fp16 y con 2 GB o más en Q4.
- Opciones de despliegue: transformers (fp16 con `device_map="auto"`), llama.cpp (evaluado en Q4 según la model card). vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K-Hindi | Licencia | Estado |
|---|---|---|---|---|---|
| Bharat-Tiny-LLM v3.4 | ~1,7B | no disponible | ~13% (n=100, Q4) | Apache 2.0 | Experimental, superado |
| Bharat-Tiny-LLM v3 | ~1,7B | no disponible | 29% (n=100, Q4) | Apache 2.0 | Recomendado por el autor |
| Bharat-Tiny-LLM v3.3 (GGUF chat) | ~1,7B | no disponible | no disponible | Apache 2.0 | Alternativa de chat en el repo v3 |

No se dispone de datos de otros modelos comparables de la misma categoría (pequeños modelos para hindi) en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental y superado; no recomendado para producción por el propio autor.
- Rendimiento matemático bajo en hindi (~13% en GSM8K-Hindi, n=100, Q4), muy por debajo del 29% del modelo base.
- Comportamiento conversacional débil según la model card.
- Riesgo de alucinación no cuantificado, pero previsible en un modelo de 1,7B con SFT limitado.
- Cobertura lingüística restringida a hindi, hinglish y brahmi; no se documenta calidad en castellano ni en otras lenguas.
- Longitud de contexto de entrenamiento de 1024 tokens; el contexto máximo real no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y fiabilidad del modelo hacen desaconsejable su uso en entornos críticos.
- Métricas publicadas previamente corregidas por auditoría; conviene verificar cualquier cifra contra `docs/claim_audit.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3.4
- Modelo base: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3
- Dataset de SFT: https://huggingface.co/datasets/eulogik/bharat-v3-mixed-sft-v34
- Repositorio GitHub: https://github.com/eulogik/Bharat-Tiny-LLM
- Auditoría de claims: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/docs/claim_audit.md
- Kernel de entrenamiento en Kaggle: https://www.kaggle.com/code/eulogikdevelopers/bharat-v34-mixed-sft
