# LahkanAI/Tixiy-AI-1.5B

## Resumen

Tixiy-AI-1.5B es un modelo de generación de texto de 1.543.714.304 parámetros publicado por LahkanAI en Hugging Face bajo licencia Apache 2.0. Se distribuye en safetensors con un tamaño de repositorio de 3,1 GB, lo que equivale a 16 bits por parámetro, y su etiqueta de arquitectura remite a qwen2: hereda por tanto el diseño transformer decoder-only de esa familia, con RMSNorm de pre-normalización, sesgo en las proyecciones QKV, activación SwiGLU y atención con grouped-query attention. La cuenta exacta de parámetros coincide con la configuración canónica de Qwen2-1.5B.

El modelo se presenta como un ajuste sobre LahkanAI/Tixiy, un modelo base del mismo autor del que no se aporta información adicional. La model card es mínima: declara únicamente los idiomas ruso e inglés, la etiqueta de pipeline text-generation y el modelo base. No hay datos sobre composición del dataset, número de tokens de entrenamiento, método de alineación (SFT, RLHF o DPO) ni resultados de evaluación. El repositorio acumula 0 descargas y 1 like en el momento de la consulta, lo que sitúa el lanzamiento como muy reciente y sin validación comunitaria alguna.

Su interés práctico es acotado pero concreto: con 1,5B de parámetros puede ejecutarse en GPU de consumo e incluso en CPU, y sirve como base para experimentación, fine-tuning ligero o prototipado de bajo coste en ruso e inglés. Para producción en castellano no existe evidencia publicada de capacidad, y la ausencia total de benchmarks obliga a evaluar el modelo por cuenta propia antes de considerarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (RMSNorm, SwiGLU, GQA, RoPE) |
| Parámetros totales | 1.543.714.304 (1,54B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (la configuración canónica de Qwen2-1.5B admite 32.768 tokens; no confirmado para este ajuste) |
| Tipos de cuantización | Pesos en safetensors a 16 bits (FP16/BF16, ~3,1 GB). No se publican versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | Ruso (ru) e inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen2. El recuento de parámetros (1.543.714.304) coincide con la configuración canónica de Qwen2-1.5B: dimensión oculta de 1536, 28 capas, 12 cabezas de atención con 2 cabezas KV bajo grouped-query attention, dimensión intermedia de 8960 y vocabulario de 151.936 tokens con tokenizador BPE basado en tiktoken. Incorpora RoPE para el codificado posicional, RMSNorm con epsilon de 1e-6 y sesgos en las proyecciones query, key y value, una particularidad de Qwen2 frente a otros transformers contemporáneos. No se ha confirmado que estos hiperparámetros se mantengan intactos en este ajuste concreto, aunque el recuento de parámetros es consistente con ellos.

No hay información pública sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición y procedencia del corpus, si hubo fases de instrucción supervisada, preferencias (RLHF/DPO) o destilación, y qué modificación respecto al modelo base LahkanAI/Tixiy introduce este checkpoint. Tampoco se documentan innovaciones técnicas propias. Cualquier afirmación sobre decodificación especulativa, atención lineal o modos de razonamiento sería especulativa y no está respaldada por la información disponible.

## Capacidades

- Generación de texto autoregresiva en ruso e inglés, según la declaración de idiomas de la model card.
- Hereda del tokenizador Qwen2 el soporte multilingüe del vocabulario, aunque solo se declaran dos idiomas; el comportamiento en castellano no está documentado ni evaluado.
- No hay evidencia publicada de soporte de tool calling o function calling: la model card no incluye plantilla de chat, tokens especiales de herramientas ni ejemplos de invocación.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o modo de pensamiento extendido.
- No hay evidencia de capacidades de visión, audio ni multimodalidad; la etiqueta de pipeline es exclusivamente text-generation.
- No se documentan capacidades específicas de código o matemáticas, ni resultados que las respalden.

## Casos de uso

- Experimentación con arquitecturas Qwen2 a pequeña escala: el modelo sirve para validar pipelines de inferencia, plantillas de prompt y flujos de evaluación en un entorno de 1,5B parámetros antes de escalar a variantes mayores de la misma familia.
- Fine-tuning ligero sobre dominio propio: con 1,54B parámetros cabe en una única GPU de 24 GB en FP16 con LoRA o QLoRA, lo que permite adaptarlo a un corpus vertical en ruso o inglés sin infraestructura dedicada.
- Prototipado de asistentes conversacionales en ruso: para demos internas y pruebas de concepto donde el coste por token y la latencia importan más que la calidad final, un modelo de este tamaño puede servirse en CPU o en una GPU de gama media.
- Generación de texto sintético y aumentación de datos: útil para producir borradores, variaciones de plantillas o corpus auxiliares en ruso e inglés a bajo coste, con revisión humana posterior dado el riesgo de alucinación.
- Clasificación y etiquetado por prompt: tareas de extracción de entidades, categorización de tickets o análisis de sentimiento en inglés y ruso, donde un modelo pequeño ajustado supera a uno grande genérico en coste por inferencia.
- Base para investigación en eficiencia: al ser un denso de 1,5B con licencia Apache 2.0, resulta adecuado para estudiar cuantización, decodificación especulativa o técnicas de poda con libertad de redistribución de resultados.
- Despliegue en entornos con recursos limitados: inferencia en dispositivos de borde o CPU sin GPU dedicada, escenario en el que un modelo de este tamaño es viable con cuantización INT4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluación, y no se han localizado informes técnicos, blogs ni repositorios asociados al autor que aporten métricas. Cualquier cifra que se atribuya a este modelo sin evaluación propia debe considerarse no verificada.

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 3,1 GB de pesos más caché KV; en la práctica, unos 3,5-4 GB para contextos de 2.000-4.000 tokens (estimación por tamaño, no medida sobre este checkpoint).
- VRAM en INT8: alrededor de 1,6 GB de pesos y 2-2,5 GB totales con overhead de runtime.
- VRAM en INT4 (equivalente a GGUF Q4_K_M): del orden de 1,0-1,2 GB de pesos y 1,5-2 GB totales, aunque esta cuantización requiere conversión propia porque el autor no publica ficheros GGUF.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en INT4 es viable incluso en GPUs de 4-6 GB y en GPUs integradas con memoria compartida.
- GPU de datacenter: A100, H100, L40S o L4 quedan sobredimensionadas para una sola instancia; su interés estaría en servir muchas réplicas concurrentes por GPU.
- CPU: viable con llama.cpp u Ollama en cuantización INT4, con velocidades del orden de decenas de tokens por segundo en procesadores modernos de escritorio (estimación orientativa, no medida sobre este modelo).
- Opciones de despliegue: Transformers, vLLM, TGI, SGLang y llama.cpp. Ollama es posible solo tras convertir los pesos a GGUF, ya que el repositorio únicamente contiene safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni por terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas declarados | Licencia | Benchmarks públicos |
|---|---|---|---|---|---|
| Tixiy-AI-1.5B (LahkanAI) | 1,54B | No disponible | ru, en | Apache 2.0 | No |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1,54B | 32.768 tokens (ampliable con YaRN) | multilingüe, incluye es | Apache 2.0 | Sí, en informe técnico |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128.000 tokens | multilingüe, incluye es | Llama 3.2 Community License | Sí, en model card |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,71B | 8.192 tokens | inglés principalmente | Apache 2.0 | Sí, en model card |

Tixiy-AI-1.5B comparte tamaño y arquitectura con Qwen2.5-1.5B-Instruct, pero carece de la documentación, la evaluación y el soporte multilingüe declarado de este último, que además incluye castellano de forma explícita. Frente a Llama-3.2-1B-Instruct pierde ventana de contexto y ecosistema, y frente a SmolLM2-1.7B-Instruct pierde trazabilidad del entrenamiento. La única ventaja diferencial verificable es la licencia Apache 2.0 sin restricciones adicionales, que comparten Qwen2.5 y SmolLM2.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna métrica publicada que permita estimar su calidad real en generación, razonamiento, código o matemáticas.
- Opacidad del entrenamiento: se desconocen los datos, el número de tokens y el método de alineación, lo que impide evaluar sesgos, contaminación de benchmarks o cobertura lingüística real.
- Riesgo de alucinación elevado: en modelos densos de ~1,5B sin alineación documentada, la generación de hechos inventados es frecuente; no se recomienda su uso sin verificación en dominios factuales.
- Idiomas limitados: solo se declaran ruso e inglés. El comportamiento en castellano no está documentado y probablemente sea deficiente, dado el tamaño y la falta de datos declarados.
- Contexto incierto: la model card no especifica la ventana de contexto y no se puede asumir la de Qwen2-1.5B sin verificar la configuración del checkpoint.
- Validación comunitaria inexistente: 0 descargas y 1 like en el momento de la consulta implican que el modelo no ha sido probado por terceros.
- Cadena de licencias: aunque este checkpoint es Apache 2.0, conviene verificar la licencia del modelo base LahkanAI/Tixiy antes de un uso comercial, ya que la model card no detalla el linaje completo.
- Sin plantilla de chat publicada: si se usa como asistente conversacional, el formato de prompt debe inferirse o diseñarse ad hoc, lo que afecta a la reproducibilidad de los resultados.
- Fecha de creación anómala en los metadatos (2026-10-24): conviene contrastar la procedencia del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LahkanAI/Tixiy-AI-1.5B
- Modelo base declarado: https://huggingface.co/LahkanAI/Tixiy
- Qwen2-1.5B (referencia de arquitectura): https://huggingface.co/Qwen/Qwen2-1.5B
- Informe técnico de Qwen2: https://arxiv.org/abs/2407.10671
