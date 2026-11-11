# DoubleRabbits/d3-lite-zils-v4

## Resumen

DoubleRabbits/d3-lite-zils-v4 es un modelo de decisión ajustado mediante LoRA sobre una base Qwen3.5-0.8B, concretamente a través del chasis d3-lite-0.8b-v1. Lo publica el usuario DoubleRabbits en Hugging Face con licencia Apache 2.0 y un total de 852.985.920 parámetros según los pesos en safetensors. El modelo se presenta como parte del "Zils d3-lite soup pool", un conjunto de variantes derivadas del mismo chasis, y está entrenado sobre 2000 decisiones sintéticas generadas con semilla 3.

La relevancia de este modelo es limitada y muy específica: no es un modelo de propósito general, sino un artefacto experimental de un pipeline propio de su autor, orientado a tareas de decisión. No hay información publicada sobre idiomas soportados, pipeline de inferencia ni evaluación de capacidades, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Su interés principal es como ejemplo de fine-tuning LoRA de bajo rango sobre un modelo pequeño de la familia Qwen3.5, con código personalizado (custom_code) y pesos en safetensors.

Dado que el model card es mínimo y no se han publicado resultados de benchmarks, esta ficha se limita a documentar lo que consta de forma verificable y marca explícitamente como no disponible todo aquello que no aparece en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5`), con `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, a través del chasis intermedio d3-lite-0.8b-v1. Sobre esa base se aplica un ajuste fino con LoRA de rango 16, según indica el model card. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código propio del autor y no basta con una clase estándar de Transformers; conviene revisar los archivos del repo antes de integrarlo en un pipeline.

El entrenamiento se realizó sobre 2000 decisiones sintéticas generadas con semilla 3, según la información del autor. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni detalles sobre la estrategia de mezcla ("soup pool") más allá de la mención del pool Zils d3-lite. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-0.8B, si bien no se documenta su rendimiento tras el ajuste.
- Toma de decisiones: el model card describe el modelo como "decision model", entrenado específicamente sobre decisiones sintéticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación y enrutamiento de decisiones en pipelines internos: el modelo puede emplearse como clasificador ligero de decisiones dentro de un flujo propio, dado su entrenamiento específico sobre 2000 decisiones sintéticas y su tamaño reducido (0,85 B de parámetros).
- Prototipado de sistemas de decisión con LoRA: sirve como referencia para reproducir el pipeline de ajuste (LoRA rango 16 sobre d3-lite-0.8b-v1) y comparar variantes del pool Zils.
- Experimentación académica con modelos pequeños: su tamaño permite ejecutarlo en hardware modesto para estudiar el efecto del ajuste fino de bajo rango sobre una base Qwen3.5-0.8B.
- Evaluación de robustez de decisiones sintéticas: útil para analizar cómo generaliza un modelo entrenado con una única semilla (seed 3) sobre datos generados artificialmente.
- Componente de un ensemble o "soup" interno: forma parte de un pool de variantes, por lo que puede integrarse en estrategias de mezcla de pesos o de votación entre modelos del mismo chasis.
- Base para nuevos ajustes LoRA: al estar publicado con licencia Apache 2.0 y pesos safetensors, puede reutilizarse como punto de partida para fine-tunings posteriores dentro de proyectos que ya usen la familia Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en precisión completa; para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para lotes grandes.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, siempre que el `custom_code` sea compatible con el stack de inferencia.
- Opciones de despliegue: no se documentan; al requerir `custom_code`, herramientas como vLLM, TGI o llama.cpp pueden no soportarlo sin adaptaciones. Ollama y llama.cpp requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DoubleRabbits/d3-lite-zils-v4 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA r16 sobre Qwen3.5-0.8B vía d3-lite-0.8b-v1; `custom_code` |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible en la información | no disponible en la información | Modelo base de referencia | Sin ajuste específico de decisiones; sin datos de benchmark en esta ficha |
| d3-lite-0.8b-v1 (chasis) | ~0,8 B | no disponible | no disponible en la información | Referenciado por el autor | Chasis intermedio sobre el que se aplica el LoRA |
| Otras variantes del pool Zils d3-lite | ~0,8 B | no disponible | no disponible en la información | No detalladas | El autor menciona un "soup pool" sin enumerar variantes |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Entrenado sobre 2000 decisiones sintéticas con una única semilla (seed 3); riesgo alto de sobreajuste al generador de datos y baja generalización fuera de ese dominio.
- No se documentan idiomas soportados; no debe asumirse un comportamiento multilingüe fiable.
- No se publican benchmarks, por lo que no hay base para afirmar calidad en tareas de razonamiento, código o matemáticas.
- El tag `custom_code` implica dependencia de código del autor; revisar el repo antes de cargarlo y auditar posibles riesgos de ejecución de código no verificado.
- Riesgo de alucinación inherente a los modelos de ~0,8 B, especialmente en tareas abiertas; el ajuste específico de decisiones no lo mitiga fuera de su dominio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación propia.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en stacks ligeros sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-v4
- Model card del autor: incluida en la página de Hugging Face arriba enlazada
- Repositorio de código, paper, blog o demo: no disponibles en la información proporcionada
