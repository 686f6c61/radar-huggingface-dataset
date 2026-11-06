# DICPlay/RusMind-Zernyshko-1

## Resumen

RusMind Zernyshko 1 es un modelo de lenguaje de generación de texto de tamano muy reducido desarrollado por DICPlay dentro de la familia RusMind, entrenado desde cero y orientado exclusivamente al idioma ruso. Con 35,46 millones de parámetros y un peso de repositorio de aproximadamente 0,1 GB, se posiciona como la variante más compacta de la línea, pensada para ejecución totalmente offline en hardware de muy bajos recursos.

El modelo emplea una arquitectura transformer propia de RusMind AI (requiere `trust_remote_code=True` para cargarse) con 8 capas y dimensión de 512, una longitud de contexto de 1024 tokens y un formato de diálogo ChatML. Su entrenamiento parte de cero, sin destilación de modelos mayores, y está especializado en conversación en ruso.

Su relevancia radica en el nicho: modelos de decenas de millones de parámetros que quepan en dispositivos embebidos, entornos sin conectividad o pruebas de concepto de bajo coste. No obstante, conviene tratarlo como un experimento de escala minima: su card no publica datos de benchmarks, composición del dataset ni resultados de evaluación, y la licencia es restrictiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer propia de RusMind AI (8 capas, dimensión 512), requiere `trust_remote_code=True` |
| Parámetros totales | 35.463.680 (~35 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible de forma explícita; existe versión GGUF en repositorio aparte |
| Idiomas soportados | ruso (`ru`) |
| Licencia | RusMind License (DICPlay), basada en `other`; uso comercial solo con contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con dimensión oculta de 512, sumando 35,46 millones de parámetros. La implementación es personalizada (etiqueta `custom_code` y `from-scratch`), por lo que no se corresponde con una arquitectura estándar de `transformers` y exige cargar el código remoto del autor. El formato de conversación es ChatML y la ventana de contexto está fijada en 1024 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni de técnicas de alineación. La model card únicamente indica que el entrenamiento se realizó íntegramente desde cero y que el modelo está orientado a conversación en ruso. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas.

## Capacidades

- Generación de texto conversacional en ruso, con plantilla de chat ChatML.
- Respuesta a instrucciones simples en formato multi-turno (dentro del límite de 1024 tokens).
- Ejecución totalmente offline en hardware de muy bajos recursos.
- Inferencia en CPU y en dispositivos embebidos gracias a su tamano reducido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al ruso según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales embebidos en dispositivos sin conectividad: el modelo puede gestionar diálogos breves en ruso en un microcontrolador o una Raspberry Pi, ya que sus ~70 MB de pesos caben en memoria muy limitada.
- Pruebas de concepto y demos de chatbots en ruso: útil para validar pipelines de inferencia (transformers, llama.cpp, Ollama) antes de migrar a modelos mayores de la familia RusMind.
- Prototipado de interfaces de voz offline: combinado con un motor TTS/STT local, puede servir para asistentes de voz básicos en ruso sin depender de la nube.
- Filtrado y clasificación de texto ligero en ruso: tareas de etiquetado simple o generación de respuestas cortas donde la latencia y el consumo importan más que la calidad.
- Educación y experimentación: modelo adecuado para estudiar el comportamiento de transformers de escala minima y el efecto de la tokenización en ruso.
- Generación de texto de relleno o plantillas en aplicaciones de bajo coste: respuestas cortas y predecibles en entornos donde no se requiere alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (35 M de parámetros); en la práctica cabe en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050 o superior) es más que suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos ~0,2 GB de VRAM libre; también en CPU y dispositivos embebidos.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), llama.cpp, Ollama y LM Studio mediante el GGUF del repositorio `DICPlay/RusMind-Zernyshko-1-GGUF`.
- Latencia y throughput estimados: no disponibles de forma oficial; por tamano, la inferencia en CPU debería ser de decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1 | 35 M | 1024 | ruso | RusMind License (comercial con contrato) | Hugging Face + GGUF |
| RusMind Zernyshko 1.6 | no disponible | no disponible | ruso | no disponible | Hugging Face (según la card) |
| SmolLM-135M | 135 M | 2048 | inglés (principalmente) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32 768 | multilingüe | Apache 2.0 | Hugging Face |

La comparación con SmolLM-135M y Qwen2.5-0.5B es orientativa por categoria de tamano; no se dispone de benchmarks del modelo RusMind que permitan comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Modelo de 35 M de parámetros: capacidad de razonamiento, conocimiento factual y coherencia muy limitadas en comparación con modelos de cientos de millones de parámetros.
- Riesgo elevado de alucinación y de respuestas incoherentes en temas complejos o fuera del dominio de entrenamiento.
- Contexto de solo 1024 tokens: insuficiente para documentos largos o conversaciones extensas.
- Entrenado únicamente en ruso; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisarlo antes de desplegarlo en producción.
- No se publican datos de entrenamiento, evaluación ni sesgos conocidos; la trazabilidad es mínima.
- La model card incluye afirmaciones no verificables (ejecución en un Nokia N95 o en un hervidor) que deben tomarse como mercadotecnia, no como especificación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1
- Versión GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1-GGUF
- Versión 1.6 (mayor calidad): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Licencia: archivo `LICENSE` en el repositorio del modelo
- Paper, blog o demo oficial: no disponible
