# DavidAU/Qwen3-30B-A1.5B-High-Speed

## Resumen

Qwen3-30B-A1.5B-High-Speed es un ajuste fino (finetune) del modelo Qwen3-30B-A3B-Base de Alibaba Qwen, publicado por el usuario DavidAU en Hugging Face. La modificación consiste en reducir el número de expertos activados por token de 8 a 4 (sobre un total de 128 expertos), lo que rebaja los parámetros activos de aproximadamente 3B a 1,5B y, según el autor, casi duplica la velocidad de inferencia manteniendo una funcionalidad similar en pruebas rutinarias.

El modelo conserva la arquitectura Mixture-of-Experts (MoE) del original, con 30.532.122.624 parámetros totales en formato safetensors, y está pensado para casos de uso más simples o para despliegues donde el rendimiento en tokens por segundo es crítico. El autor reporta incrementos de 12 a 23 t/s en CPU (Q4KS) y de 75 a más de 125 t/s en GPU (IQ3S) con tarjetas de gama baja-media.

Es relevante ahora porque demuestra una técnica sencilla de "poda de expertos" que permite ajustar el equilibrio entre calidad y velocidad sin reentrenar, y porque el ecosistema Qwen3 MoE ofrece una base sólida para experimentación con arquitecturas dispersas. La licencia y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3 (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 1,5B (4 expertos de 128 activados por token) |
| Longitud de contexto | 32K + 8K de salida (40K total) |
| Tipos de cuantizacion | GGUF, GPTQ, EXL2, AWQ, HQQ (generables desde los safetensors fuente); quants NEO Imatrix disponibles en repo aparte |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer con arquitectura Mixture-of-Experts de 128 expertos y enrutamiento por token. La modificación de DavidAU reduce el número de expertos activados por token de 8 a 4, lo que disminuye los parámetros activos de unos 3B a unos 1,5B. No se trata de un reentrenamiento completo, sino de un ajuste sobre la configuración de activación de expertos, por lo que el autor lo describe como un "simple finetune". No se dispone de información sobre el volumen de datos de entrenamiento, composición del dataset ni si hubo RLHF o DPO en esta variante.

La innovación principal es la reducción de expertos activos como mecanismo de aceleración: al activar la mitad de expertos por token, el cómputo por paso se reduce significativamente y el modelo se comporta en velocidad como un modelo denso de aproximadamente 1,5B, manteniendo la capacidad total de 30B parámetros. El autor advierte que la cuantización Imatrix resulta difícil para este modelo y requiere archivos imatrix más grandes y multilingües. Se recomienda usar plantilla Jinja o ChatML, y el modelo soporta bloques de razonamiento (`<think>`) de forma nativa.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.
- Razonamiento y modo "thinking" con bloques de pensamiento extensos, activables mediante system role opcional.
- Capacidad de razonamiento multi-paso y deliberación interna antes de responder.
- Soporte de contexto largo de 32K tokens de entrada más 8K de salida.
- Compatible con endpoints y con el ecosistema transformers.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen3 las soporta, pero no se detallan aquí).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Visión o audio: no disponible (el modelo base es solo texto).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 32K tokens de contexto, adecuado para historiales largos de cliente y bases de conocimiento extensas.
- Generación de texto a alta velocidad en CPU: con cuantización Q4KS alcanza 23 t/s en Windows 11, lo que permite desplegar asistentes de texto en servidores sin GPU.
- Prototipado rápido y experimentación: al comportarse en velocidad como un modelo de 1,5B pero con la base de conocimiento de un 30B, es útil para iterar prompts y flujos sin esperas largas.
- Procesamiento por lotes de documentos: la ventana de 32K permite resumir o extraer información de documentos largos en pipelines batch donde el throughput importa más que la calidad máxima.
- Razonamiento con modo thinking en tareas moderadas: para problemas que requieren deliberación pero no la máxima precisión, la reducción de expertos ofrece un equilibrio razonable.
- Despliegue en GPU de gama baja-media: con IQ3S supera los 125 t/s, lo que habilita chatbots interactivos en tarjetas consumer.
- Generación de contenido y redacción asistida: para tareas de escritura donde la latencia percibida es crítica, el modelo ofrece respuestas rápidas con calidad aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de velocidad:

| Escenario | Modelo original (30B-A3B) | Qwen3-30B-A1.5B-High-Speed |
|---|---|---|
| CPU Q4KS (Windows 11) | 12 t/s | 23 t/s |
| GPU IQ3S (gama baja-media) | 75 t/s | más de 125 t/s |

No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones de calidad para esta variante.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un MoE de 30B totales en Q4 la huella ronda los 18-20 GB, en IQ3S alrededor de 14-16 GB, y en plena precisión (safetensors) unos 61 GB.
- GPU recomendadas: el autor menciona tarjetas de gama baja-media para IQ3S; para plena precisión se requiere una GPU con 80 GB (A100, H100) o múltiples GPUs.
- Cabe en GPU consumer: sí, con cuantizaciones agresivas (IQ3S, Q4KS) en tarjetas de 16-24 GB como RTX 4090 o RTX 4080.
- Opciones de despliegue: transformers (pesos fuente), llama.cpp / Ollama (GGUF), y quants NEO Imatrix MAX disponibles en repo aparte a 64K de contexto. vLLM y TGI no están confirmados en la información proporcionada.
- Latencia y throughput: 23 t/s en CPU Q4KS y más de 125 t/s en GPU IQ3S según el autor; el rendimiento en GPU puede ser 4-8 veces superior al de CPU.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A1.5B-High-Speed | 30,5B | ~1,5B (4/128 expertos) | 32K + 8K | no disponible | Hugging Face (DavidAU) |
| Qwen3-30B-A3B-Base | 30,5B | ~3B (8/128 expertos) | 32K | no disponible en esta ficha | Hugging Face (Qwen) |
| Qwen3-30B-A4.5B-12-Cooks | 30,5B | ~4,5B (12/128 expertos) | no disponible | no disponible | Hugging Face (DavidAU) |
| Qwen3-30B-A6B-16-Extreme | 30,5B | ~6B (16/128 expertos) | no disponible | no disponible | Hugging Face (DavidAU) |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento comparativo con otras familias. El modelo se posiciona como la variante más rápida de la serie, a costa de menor capacidad por token.

## Limitaciones y advertencias

- La reducción de expertos activos puede degradar la calidad en tareas complejas; el autor recomienda usar el modelo original o variantes con más expertos (12, 16, 24) para casos exigentes.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta variante.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan del modelo base Qwen3.
- Limitaciones de contexto: 32K de entrada más 8K de salida; no apto para contextos superiores sin la variante de 128K.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial; es un riesgo importante para producción.
- Idiomas soportados no confirmados en la ficha, aunque el modelo base Qwen3 es multilingüe.
- La cuantización Imatrix es difícil para este modelo según el autor, lo que puede afectar la calidad de los quants generados.
- El modelo es un finetune comunitario no oficial, sin garantías de soporte ni validación por parte de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-30B-A1.5B-High-Speed
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Quants NEO Imatrix MAX (64K): https://huggingface.co/DavidAU/Qwen3-30B-A1.5B-High-Speed-NEO-Imatrix-MAX-gguf
- Variante 12 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A4.5B-12-Cooks
- Variante 16 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A6B-16-Extreme
- Variante 16 expertos 128K: https://huggingface.co/DavidAU/Qwen3-30B-A6B-16-Extreme-128k-context
- Variante 24 expertos: https://huggingface.co/DavidAU/Qwen3-30B-A7.5B-24-Grand-Brainstorm
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
