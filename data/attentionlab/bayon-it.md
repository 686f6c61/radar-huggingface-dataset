# attentionlab/bayon-it

## Resumen

Bayon Instruct es un modelo de lenguaje causal decoder-only de aproximadamente 100 millones de parámetros, desarrollado por attentionlab y especializado en jemer (camboyano, código `km`). Se trata de la versión ajustada por instrucciones del modelo base Bayon, entrenado desde cero sobre corpus jemer y equipado con un tokenizador BPE propio de 5.000 tokens. El modelo resuelve un problema concreto: la mayoría de los modelos multilingües de gran tamaño generan texto en inglés u otros idiomas dominantes cuando se les consulta en jemer, fenómeno conocido como *language bleed*. Bayon Instruct está diseñado para mantener la salida en jemer de forma consistente.

La relevancia del modelo radica en su enfoque de eficiencia extrema: con solo 109 millones de parámetros y un contexto de 1.024 tokens, demuestra que un modelo pequeño y específico de idioma puede superar a alternativas multilingües mucho mayores en tareas de conocimiento cultural jemer. En su benchmark de 201 preguntas sobre historia y cultura jemer, Bayon Instruct obtuvo 15 respuestas correctas frente a las 4 de Qwen2.5-0.5B-Instruct, y registró una tasa de fuga de idioma (LBR) del 0,06%, frente al 0,54% de SEA-LION 27B y el 18,25% de GPT-OSS 120B.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y un tamaño de repositorio de 0,4 GB, lo que lo hace desplegable en hardware de consumo. Su arquitectura es un transformer decoder-only estándar, sin innovaciones híbridas ni mecanismos de atención lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal language model) |
| Parametros totales | 109.019.648 (~100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Jemer (`km`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Bayon es un transformer decoder-only entrenado desde cero sobre aproximadamente 1.361 millones de tokens jemer extraídos de FineWeb-2. El tokenizador es un BPE personalizado de 5.000 tokens construido específicamente para jemer, que conserva *byte fallback* (aunque este no se observó durante la evaluación reportada). El entrenamiento empleó AdamW con weight decay 0,1, learning rate pico de 3e-4 y final de 3e-5, warmup de 2.500 pasos, decaimiento lineal, gradient clipping de 1,0 y una configuración de batch de 4 × 64 × 1.024 tokens. El entrenamiento se detuvo en el paso 18.000 de los 50.000 planificados, y se ejecutó sobre una RTX 4050 y una H100.

El ajuste por instrucciones se realizó mediante LoRA (rango 16, alpha 32, dropout 0,1) sobre 18.000 ejemplos SFT destilados de Gemini y centrados en jemer. Los módulos objetivo de LoRA fueron las capas de proyección, los embeddings y la cabeza del modelo de lenguaje. Se usaron 4 épocas con AdamW (weight decay 0), learning rate 3e-4, warmup ratio 0,03 y batch de 8 × 4 × 1.024 tokens. El dataset de instrucciones está publicado como `attentionlab/bayon-sft`. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de texto en jemer con alta consistencia de idioma (LBR del 0,06% en la evaluación reportada).
- Seguimiento de instrucciones en jemer, incluyendo preguntas y respuestas.
- Conversación multi-turno en jemer dentro del límite de 1.024 tokens de contexto.
- Respuesta a preguntas sobre historia y cultura jemer (15/201 correctas en el benchmark reportado).
- Generación de texto con vocabulario jemer especializado, lo que reduce el número de tokens necesarios frente a tokenizadores multilingües generales.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al cliente en jemer: el modelo puede gestionar conversaciones de soporte en jemer manteniendo respuestas íntegramente en ese idioma, lo que evita la fuga hacia el inglés típica de modelos multilingües. Adecuado para chatbots de bajo coste con contexto de hasta 1.024 tokens.
- Asistentes educativos sobre cultura jemer: dado su rendimiento relativo en el benchmark de historia y cultura, puede emplearse como tutor básico o generador de material didáctico introductorio en jemer.
- Generación de contenido editorial en jemer: redacción de borradores, resúmenes y textos breves en jemer para medios o blogs, aprovechando el tokenizador especializado que reduce el coste por token.
- Investigación sobre modelos de lenguas de bajos recursos: sirve como referencia reproducible para estudiar el equilibrio entre tamaño reducido, especialización lingüística y calidad de salida.
- Despliegue en dispositivos de borde: con 109M de parámetros y 0,4 GB de pesos, puede ejecutarse en CPU o en GPU de consumo para tareas de generación de texto en jemer sin conexión.
- Prototipado rápido de aplicaciones en jemer: su pequeño tamaño permite iterar con bajo coste computacional en fases de prueba de concepto antes de escalar a modelos mayores.
- Filtrado y normalización de texto jemer: puede emplearse para tareas de reescritura o reformulación de pasajes en jemer dentro de pipelines de procesamiento lingüístico.

## Benchmarks y rendimiento

| Benchmark | Bayon Instruct | Qwen2.5-0.5B-Instruct | SEA-LION 27B | GPT-OSS 120B |
|---|---|---|---|---|
| Preguntas correctas (201 preguntas de historia y cultura jemer) | 15/201 | 4/201 | no disponible | no disponible |
| Language Bleed Ratio (LBR) | 0,06% (13/21.031 tokens) | no disponible | 0,54% | 18,25% |

El LBR mide la proporción de tokens generados con caracteres fuera del rango Unicode jemer tras eliminar las trazas de razonamiento. El propio autor advierte que, al calcularse sobre el tokenizador de cada modelo, las comparaciones entre modelos deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en precisión completa (fp32) para los pesos; en fp16 alrededor de 0,2 GB. Con overhead de activaciones y caché KV para 1.024 tokens, el consumo total es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 4050, RTX 3060, RTX 4090, A100 y H100 sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en dispositivos integrados.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; no se documentan variantes GGUF para llama.cpp u Ollama, ni integración con vLLM o TGI. El autor reporta entrenamiento en RTX 4050 y H100, lo que sugiere compatibilidad con CUDA estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| Bayon Instruct | ~109M | 1.024 | Jemer | Apache-2.0 | 15/201 en benchmark cultural jemer; LBR 0,06% |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 (no confirmado en la información) | Multilingüe | Apache-2.0 (no confirmado en la información) | 4/201 en el mismo benchmark |
| SEA-LION 27B | ~27B | no disponible | Multilingüe del sudeste asiático | no disponible | LBR 0,54% |
| GPT-OSS 120B | ~120B | no disponible | Multilingüe | no disponible | LBR 18,25% |

La comparación con Qwen2.5-0.5B-Instruct es la más directa por tamaño (aunque Bayon es aproximadamente cinco veces menor). Los datos de SEA-LION 27B y GPT-OSS 120B solo cubren la métrica LBR, no el benchmark de conocimiento cultural.

## Limitaciones y advertencias

- El modelo es específico de jemer: no se ha entrenado ni evaluado para otros idiomas, y su vocabulario restringido limita inherentemente la generación de caracteres no jemer.
- Riesgo de alucinación elevado en conocimiento factual: con solo 15/201 respuestas correctas en el benchmark cultural, la fiabilidad en tareas de conocimiento es baja y no debe usarse como fuente de verdad.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- El ajuste por instrucciones se basa en datos destilados de Gemini, lo que puede introducir sesgos o estilos del modelo profesor y limitar la diversidad de respuestas.
- El LBR bajo no implica mayor capacidad o fluidez que modelos multilingües mayores; el autor lo atribuye en parte a las propiedades del tokenizador.
- El entrenamiento se detuvo en el paso 18.000 de 50.000 planificados, por lo que el modelo base podría estar infraentrenado respecto a su configuración prevista.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de seguridad.
- No se documentan variantes cuantizadas ni soporte en frameworks de inferencia de alto rendimiento, lo que puede complicar el despliegue en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attentionlab/bayon-it
- Modelo base: https://huggingface.co/attentionlab/bayon
- Dataset de instrucciones: https://huggingface.co/datasets/attentionlab/bayon-sft
- Blog del autor sobre el rendimiento de Bayon: https://panha-ai.vercel.app/news/2026-07-02
