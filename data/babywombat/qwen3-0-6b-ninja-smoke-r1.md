# BabyWombat/qwen3-0.6b-ninja-smoke-r1

## Resumen

`BabyWombat/qwen3-0.6b-ninja-smoke-r1` es un ajuste fino (fine-tune) del modelo `BabyWombat/qwen3-0.6b-ninja-smoke-d1`, que a su vez deriva de la familia Qwen3 de Alibaba. Se trata de un modelo de generación de texto de aproximadamente 596 millones de parámetros (0,6 mil millones), publicado por el usuario BabyWombat bajo licencia Apache 2.0. El modelo está pensado para conversación en inglés y se distribuye en formato `safetensors` para su uso con la librería `transformers`.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino de un modelo pequeño, con cero descargas y un único "like" en el momento de la consulta, y sin model card sustantiva más allá de la plantilla estándar de Unsloth. No se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación. El autor lo etiqueta como "ninja-smoke-r1", lo que sugiere un experimento de ajuste fino más que un modelo destinado a producción.

A pesar de la escasez de información, el modelo es técnicamente utilizable: hereda la arquitectura transformer de Qwen3, está disponible en Hugging Face con pesos en `safetensors` y es compatible con `text-generation-inference` y `transformers`. Esta ficha recoge lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parámetros totales | 596.049.920 (≈0,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; el autor no la especifica) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 596.049.920 parámetros totales según los metadatos de `safetensors`. El autor no documenta la arquitectura interna (número de capas, dimensiones ocultas, cabezas de atención, uso de atención con RoPE, etc.), por lo que estos detalles se consideran "no disponibles" en la información proporcionada. Al derivar de Qwen3-0.6B, es razonable asumir que comparte la arquitectura base de esa familia, pero el autor no lo confirma explícitamente.

En cuanto al entrenamiento, la model card indica únicamente que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library". No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT, ni los hiperparámetros utilizados. El nombre del modelo (`ninja-smoke-r1`) y el modelo base (`qwen3-0.6b-ninja-smoke-d1`) sugieren una cadena de ajustes finos experimentales, pero no hay documentación que lo confirme. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.
- Ajuste fino orientado a conversación (`conversational` en los tags de Hugging Face).
- Compatibilidad con `text-generation-inference` (TGI) y `transformers`.
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento, código y matemáticas: no evaluados ni documentados por el autor.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 0,6 B en `safetensors`, se puede cargar con `transformers` en una GPU de consumo para validar pipelines de chat antes de escalar a modelos mayores.
- Experimentación con ajuste fino (fine-tuning) sobre Qwen3: sirve como punto de partida para investigar técnicas de SFT con Unsloth/TRL en modelos pequeños.
- Inferencia en entornos con recursos limitados: 596 M de parámetros permiten despliegue en GPU de gama media o incluso CPU para pruebas de latencia.
- Generación de texto de bajo coste para tareas simples (respuestas cortas, clasificación ligera, reformulación) donde no se requiere razonamiento complejo.
- Evaluación comparativa de cadenas de fine-tune: útil para estudiar el efecto de ajustes sucesivos (`d1` → `r1`) sobre un mismo modelo base.
- Docencia y demostraciones: modelo pequeño y con licencia Apache 2.0 que facilita ejemplos reproducibles de fine-tuning e inferencia con TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos (596 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,3 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4) es suficiente para inferencia en fp16 con contexto moderado; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas (RTX 3060, 4060, 4090, etc.) e incluso en CPU para pruebas.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI, según los tags), y potencialmente `llama.cpp`/`Ollama` si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput estimados: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BabyWombat/qwen3-0.6b-ninja-smoke-r1 | 596 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune experimental sin benchmarks |
| Qwen/Qwen3-0.6B | ≈0,6 B | no disponible en esta ficha | Apache 2.0 | Hugging Face (modelo base oficial) | Modelo base de referencia de la familia |
| BabyWombat/qwen3-0.6b-ninja-smoke-d1 | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base directo del fine-tune |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, hiperparámetros y evaluación: no se puede verificar la calidad ni la idoneidad del modelo para producción.
- Riesgo elevado de alucinación y de respuestas incoherentes, dado que es un fine-tune experimental de un modelo de 0,6 B sin evaluación publicada.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Limitación idiomática: el campo `language` solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede asumir la ventana de contexto de Qwen3-0.6B sin confirmación del autor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción es responsabilidad del integrador.
- Modelo con cero descargas y un único "like": no hay evidencia de uso comunitario ni de validación externa.
- No se han publicado cuantizaciones GGUF, AWQ ni GPTQ: el despliegue eficiente en CPU o GPU de gama baja requiere generarlas por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/BabyWombat/qwen3-0.6b-ninja-smoke-r1
- Modelo base: https://huggingface.co/BabyWombat/qwen3-0.6b-ninja-smoke-d1
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Familia Qwen3 (referencia del modelo base): https://huggingface.co/Qwen/Qwen3-0.6B
