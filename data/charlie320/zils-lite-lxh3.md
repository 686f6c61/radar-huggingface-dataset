# Charlie320/zils-lite-lxh3

## Resumen

zils-lite-lxh3 es un modelo de decisión de 852.985.920 parámetros publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo de pesos) para el pool de soups `d3-lite` de Zils, un proyecto asociado a la subred 127 de Bittensor. El modelo parte de Qwen/Qwen3.5-0.8B y se construye mediante un fine-tune tipo soup: se arranca de la media uniforme de los pesos de dos bodies previos (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc) y se promedian tres ejecuciones de LoRA de rango 64 entrenadas con semillas distintas.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente entrenado para resolver ítems de decisión en formato de examen dentro del ecosistema Zils. El repositorio contiene únicamente pesos en safetensors (1,7 GB), con licencia Apache-2.0 y sin pipeline declarado. No se han publicado resultados de benchmarks, idiomas soportados ni especificaciones de contexto en la información disponible.

Al tratarse de un fine-tune sobre una base de 0,8B, su interés práctico reside en el despliegue ligero y en la experimentación con ensembles de pesos y LoRA, más que en capacidades generales de razonamiento o generación. La model card es explícita sobre el origen de los datos de entrenamiento y sobre las restricciones de reutilización de los datasets fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye vision tower heredada del modelo padre |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85B parámetros, según el recuento real de safetensors. El modelo conserva el "chassis layout" del padre e incluye la vision tower heredada, aunque la información disponible no detalla la configuración interna de capas, cabezas de atención ni dimensiones ocultas.

El proceso de entrenamiento es un soup en dos fases. Primero se calcula la media uniforme de los pesos de dos bodies del soup `d3-lite` del 14 de noviembre de 2026 (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). Sobre ese punto de partida se ejecutan tres fine-tunes LoRA de rango 64 con anchor 0,1, learning rate 1e-4, una época cada uno y semillas diferentes; cada adaptador se fusiona en el modelo base y finalmente se promedian uniformemente los tres resultados. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos, más las respuestas del teacher público de relay de Zils. No se usaron ítems de examen de validadores, ítems semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y resolución de ítems de decisión en formato de examen, que es el objetivo declarado del entrenamiento.
- Capacidades de visión heredadas de la vision tower del modelo padre (Qwen/Qwen3.5-0.8B), sin detalles publicados sobre su rendimiento tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de ítems de decisión en formato de examen: el modelo está entrenado específicamente con ítems generados por la receta `author_exam.py`, por lo que encaja en pipelines de puntuación o clasificación de respuestas tipo test dentro del ecosistema Zils.
- Participación en el pool de soups `d3-lite` de Bittensor subnet 127: el repositorio se publica como body para ese pool, de modo que su uso previsto es servir como componente en la mezcla de pesos del subnet.
- Experimentación con weight soups y LoRA: al ser la media de tres adaptadores de rango 64 fusionados, sirve como referencia para estudiar el efecto del promediado de pesos y de semillas en modelos pequeños.
- Despliegue ligero en entornos con recursos limitados: con 0,85B parámetros y pesos BF16 de 1,7 GB, puede ejecutarse en GPUs de consumo para pruebas de inferencia y validación de formato.
- Investigación sobre modelos de decisión especializados: permite comparar el comportamiento de un fine-tune de decisión frente a su base Qwen3.5-0.8B sin ajustar.
- Reproducción de recetas de autoría de datos: el modelo documenta el uso de la receta pública de Zils, lo que facilita replicar el pipeline de generación de datos y evaluar su impacto en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2-3 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: no disponible (no se documentan cuantizaciones publicadas); una conversión a 8 bits rondaría 0,9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: no disponible; una conversión a 4 bits rondaría 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en batch pequeño; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño y permitirían batches grandes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en BF16, y en GPUs integradas o de gama baja con cuantización, aunque no se han publicado conversiones GGUF oficiales.
- Opciones de despliegue: no se documentan; al ser safetensors compatible con transformers, cabría usar vLLM, TGI o llama.cpp previa conversión, pero no hay confirmación del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-lxh3 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible en la información | no disponible en la información | Hugging Face | Modelo base del que deriva |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Body previo del soup d3-lite |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Hugging Face | Body previo del soup d3-lite |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para ítems de decisión en formato de examen, no para generación general, código o matemáticas; su uso fuera de ese dominio no está validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a la base Qwen3.5-0.8B ni frente a los bodies previos.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos de 0,8B el riesgo es inherentemente alto en tareas abiertas.
- Idiomas no declarados: la model card no especifica cobertura lingüística, por lo que no se puede garantizar un comportamiento correcto en castellano u otros idiomas.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras el fine-tune.
- Restricciones de datos: el repositorio contiene solo pesos; la model card advierte de que deben revisarse los términos de los datasets fuente antes de reutilizar el modelo.
- Licencia Apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (generados por Claude Opus y un modelo abierto local) puede introducir obligaciones adicionales según los términos de esos proveedores.
- Madurez: creado el 14 de noviembre de 2026, con 0 descargas y 0 likes; sin validación comunitaria ni mantenimiento documentado.
- Sin pipeline declarado: no se especifica la tarea de inferencia, lo que complica el uso directo con `pipeline()` de transformers sin configuración manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-lxh3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Body previo 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Body previo 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
