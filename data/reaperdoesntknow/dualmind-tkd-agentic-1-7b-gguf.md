# reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF

## Resumen

DualMind-TKD-Agentic-1.7B-GGUF es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) publicado por el usuario reaperdoesntknow en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que indica que está pensado para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles. El nombre sugiere un ajuste fino orientado a uso agéntico ("Agentic"), y la etiqueta `qwen3` apunta a que la arquitectura base es la familia Qwen3, aunque el autor no lo confirma explícitamente en la model card.

La model card es extremadamente escueta: no documenta el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni la licencia. Lo único que se indica es que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, y se ofrecen tres cuantizaciones (Q4_K_M, Q6_K y Q8_0). El repositorio ocupa 8,7 GB, coherente con la suma de esas tres variantes para un modelo de este tamaño.

Su relevancia práctica es limitada pero concreta: es un modelo pequeño, ligero y ejecutable en hardware modesto, con un enfoque declarado hacia flujos agénticos. Para desarrolladores que necesiten un modelo de 1,7B con tool calling en local, puede ser un punto de partida, pero la ausencia de documentación sobre licencia, datos y evaluación obliga a tratarlo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, segun la etiqueta `qwen3`; no confirmado en la model card) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia del conteo de parametros) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. La etiqueta `qwen3` en el repositorio sugiere que el modelo parte de una base de la familia Qwen3, pero el autor no lo documenta. Tampoco se especifica si se trata de un transformer denso convencional o de una variante con atención lineal u otras modificaciones. El conteo de parámetros (1.720.574.976) es el único dato estructural verificable.

Respecto al entrenamiento, la model card solo indica que el ajuste fino y la conversión a GGUF se hicieron con Unsloth, una herramienta que acelera el fine-tuning y la cuantización. No se detalla el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o algún otro método de alineación, ni qué innovaciones técnicas incorpora el ajuste. El sufijo "TKD" del nombre no se explica en la documentación disponible.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Orientación a uso agéntico declarada en el nombre del modelo ("Agentic"), aunque no se documentan formalmente las capacidades de tool calling ni de razonamiento multi-paso.
- Compatibilidad con llama.cpp mediante `llama-cli` con la opción `--jinja`, lo que permite aplicar plantillas de chat.
- Compatibilidad con endpoints compatibles (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponible.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 1,7B en GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp, ofreciendo respuestas conversacionales con baja latencia.
- Prototipado de agentes en entornos con recursos limitados: su orientación agéntica declarada permite experimentar con flujos de tool calling y razonamiento multi-paso sin necesidad de infraestructura cloud.
- Integración en aplicaciones de escritorio o CLI: la distribución en GGUF y la compatibilidad con `llama-cli` facilitan su empaquetado en herramientas de línea de comandos o aplicaciones de escritorio.
- Filtrado y clasificación de texto en pipelines ligeros: un modelo de este tamaño puede usarse para tareas de etiquetado, resumen corto o extracción de información en entornos con presupuesto de cómputo reducido.
- Educación y experimentación: sirve como caso de estudio de fine-tuning con Unsloth y de conversión a GGUF para quienes aprenden el flujo completo de publicación de modelos.
- Despliegue en edge o entornos aislados: al no requerir conexión a servicios externos, puede ejecutarse en dispositivos con conectividad limitada o requisitos de privacidad estrictos.
- Base para nuevos ajustes finos: al ser un modelo pequeño y cuantizado, es un punto de partida manejable para fine-tuning adicional en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q4_K_M, 1,5 GB para Q6_K y 1,9 GB para Q8_0, calculados a partir del número de parámetros y los bits por peso de cada cuantización (sin contar overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre, como GTX 1650, RTX 3050, RTX 4060 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`), y por extensión herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp. No se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMind-TKD-Agentic-1.7B | 1,72B | no disponible | no disponible | GGUF | Ajuste fino con Unsloth, orientación agéntica declarada |
| Qwen3-1.7B | ~1,7B | no disponible en esta ficha | Apache 2.0 (según la familia Qwen3) | safetensors, GGUF | Base probable del modelo; documentación completa y benchmarks publicados |
| Llama 3.2 1B | ~1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa ligera con licencia y evaluación documentadas |
| Gemma 3 1B | ~1B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google con documentación oficial |

La comparación es aproximada: los datos de los modelos alternativos provienen de sus respectivas documentaciones públicas, mientras que para DualMind-TKD-Agentic-1.7B no hay información verificable sobre contexto, licencia ni rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido. Es un riesgo importante para cualquier despliegue en producción.
- Ausencia total de documentación sobre datos de entrenamiento, sesgos y alineación: no es posible evaluar sesgos conocidos ni el riesgo de comportamientos indeseados.
- Riesgo de alucinación: como cualquier modelo de 1,7B, la capacidad de razonamiento y la fidelidad factual son limitadas; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas soportados no documentados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas que requieran ventanas largas.
- Model card mínima: no hay información sobre el proceso de fine-tuning, el dataset ni la metodología de evaluación, lo que dificulta la reproducibilidad.
- Un solo "like" y autor poco conocido: no hay validación comunitaria significativa que respalde la calidad del modelo.
- El nombre "TKD" no está explicado, lo que impide saber qué tarea o dominio específico se pretendía optimizar.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF
- Unsloth (herramienta usada para el fine-tuning y la conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
