# FarmerlineML/voxcpm2-swahili-sft

## Resumen

VoxCPM2 Swahili — Full SFT es un modelo de síntesis de voz (text-to-speech) desarrollado por FarmerlineML, un fine-tune completo del modelo VoxCPM2 de OpenBMB, especializado en el idioma suajili (swahili). El modelo está diseñado para el asistente de voz agrícola Darli AI, con el objetivo de proporcionar síntesis de voz natural y clonación de voz mediante una grabación de referencia. VoxCPM2 es un sistema TTS sin tokenizador que genera representaciones de voz continuas mediante una arquitectura autoregresiva de difusión de extremo a extremo, lo que permite una síntesis altamente natural y expresiva. Este fine-tune tiene 2.290.004.544 parámetros y está entrenado sobre datos de voz en suajili, manteniendo la capacidad de clonar la voz del hablante de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer-free TTS con difusión autoregresiva (VoxCPM2) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (model.safetensors), además de audiovae.pth, config.json, tokenizer.json |

## Arquitectura y entrenamiento

VoxCPM2 es un sistema de síntesis de voz sin tokenizador que genera representaciones de voz continuas directamente mediante una arquitectura autoregresiva de difusión de extremo a extremo, evitando la discretización en tokens. El modelo base fue entrenado con más de 2 millones de horas de audio multilingüe y soporta 30 idiomas. Este fine-tune se realizó mediante entrenamiento completo (full SFT) de todos los parámetros del modelo base sobre datos de voz en suajili. Los hiperparámetros incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 1 con acumulación de gradientes de 16 (lote efectivo de 16), y una frecuencia de muestreo de entrada del AudioVAE de 16 kHz. El entrenamiento se detuvo en el paso 2985. La pérdida de validación muestra una mejora desde 1.301 en el paso 0 hasta 0.899 en el paso 2000, con fluctuaciones posteriores.

## Capacidades

- Generación de voz en suajili a partir de texto.
- Clonación de voz: requiere una grabación de referencia para anclar la identidad del hablante.
- Síntesis de voz natural y expresiva gracias a la arquitectura sin tokenizador.
- Salida de audio a 48 kHz (según el ejemplo de uso).
- Capacidad de control de la voz mediante la referencia, manteniendo las características del hablante.

## Casos de uso

- Asistente de voz agrícola: integración en el asistente Darli AI para proporcionar información agrícola en suajili a agricultores, con voz natural y clara.
- Atención al cliente automatizada: sistemas de respuesta de voz interactiva (IVR) en suajili para servicios financieros o de telecomunicaciones, utilizando clonación de voz para consistencia.
- Audiolibros y contenido educativo: generación de audiolibros en suajili a partir de texto, con voz de referencia para mantener un narrador consistente.
- Traducción y localización de contenido: doblaje de vídeos o podcasts al suajili usando una voz de referencia.
- Sistemas de navegación y asistencia en movilidad: voces en suajili para aplicaciones de GPS o asistentes de voz en vehículos.
- Pruebas de concepto y prototipos: desarrollo de aplicaciones de voz en suajili para investigación o demostraciones, gracias a la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MOS, WER, etc.) para este modelo. La model card proporciona la pérdida de validación durante el entrenamiento:

| Paso | loss/total | loss/diff | loss/stop |
|------|------------|-----------|-----------|
| 0 | 1.301021 | 0.976434 | 0.216392 |
| 500 | 0.920041 | 0.854645 | 0.043597 |
| 1000 | 0.904256 | 0.847106 | 0.038100 |
| 1500 | 0.967527 | 0.931794 | 0.023822 |
| 2000 | 0.899414 | 0.846611 | 0.035202 |
| 2500 | 0.998210 | 0.927028 | 0.047455 |

Estos valores indican la convergencia del modelo, pero no son comparables con otros sistemas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación disponible.
- El modelo tiene 2.290 millones de parámetros, lo que requiere una GPU con al menos 16 GB de VRAM para inferencia en precisión completa (FP32). Con cuantización (no disponible), podría reducirse, pero no hay datos.
- Para inferencia, se recomienda una GPU de gama alta como RTX 3090, RTX 4090, A100 o similar.
- El despliegue se puede realizar mediante la librería `voxcpm` de VoxCPM, que permite cargar el modelo y generar audio. No se mencionan otras opciones como vLLM u Ollama, ya que es un modelo de audio, no de lenguaje.
- La latencia dependerá de la longitud del texto y de los pasos de inferencia (15 pasos en el ejemplo), pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos TTS para suajili. El modelo base VoxCPM2 soporta múltiples idiomas, pero este fine-tune se centra exclusivamente en suajili. Otros modelos TTS multilingües como XTTS v2 o Bark podrían ser comparables, pero no hay datos de rendimiento en suajili. La ventaja de este modelo es su especialización y la licencia Apache 2.0, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para suajili; no debe usarse para otros idiomas.
- Requiere una grabación de referencia limpia y sin ruido para una clonación de voz fiable.
- Puede generar audio alucinado después del final de la frase; se recomienda usar `max_len` y recortar silencios.
- No se han evaluado sesgos ni riesgos de alucinación en este fine-tune.
- El tamaño del modelo (2.3B parámetros) puede ser elevado para entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarmerlineML/voxcpm2-swahili-sft
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Repositorio GitHub de VoxCPM: https://github.com/OpenBMB/VoxCPM/
- Dataset de entrenamiento: https://huggingface.co/datasets/FarmerlineML/SwahiliTTS2025_dataset
- Sitio web de VoxCPM2: https://voxcpm2.org/ y https://voxcpm.space/
