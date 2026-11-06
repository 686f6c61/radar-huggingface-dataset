# BNarayanaReddy/siba

## Resumen

siba es un modelo de diálogo por voz (speech-to-speech) de tipo full-duplex desarrollado por BNarayanaReddy, que adapta el modelo Moshi de Kyutai (Moshiko, aproximadamente 7.700 millones de parámetros) para hindi, telugu e inglés. El modelo es capaz de escuchar y hablar simultáneamente, manteniendo el códec Mimi de Kyutai y ampliando el vocabulario de texto hasta 48.000 piezas, con 16.000 adicionales para hindi y telugu. El repositorio contiene el checkpoint de la etapa 2b junto con los checkpoints base de la etapa 1 de los que deriva.

La relevancia del modelo radica en que extiende las capacidades de diálogo hablado full-duplex a lenguas indias, un ámbito con muy pocos modelos abiertos de este tipo. El entrenamiento se realizó en dos fases: una primera etapa de aproximadamente 33.000 horas de monólogo de YouTube y una segunda etapa de ajuste fino sobre 517 horas de diálogos sintéticos de dos canales, generados con TTS y alineados forzosamente.

El estado del checkpoint liberado es explícitamente de investigación: el cambio de turno funciona razonablemente bien, pero la relevancia de las respuestas y la velocidad de respuesta todavía no alcanzan un nivel de producción, especialmente en hindi y telugu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moshi (transformer + codec Mimi), full-duplex speech-to-speech |
| Parametros totales | ~7.700 millones (Moshiko) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos liberados en bf16); no se documentan otras |
| Idiomas soportados | hindi (hi), telugu (te), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (consolidated.safetensors, 15,7 GB, bf16) |

## Arquitectura y entrenamiento

siba se construye sobre Moshiko, el modelo de diálogo hablado full-duplex de Kyutai, que combina un modelo de lenguaje transformer con el códec neuronal Mimi para la codificación y decodificación de audio. El modelo procesa audio en tramas de 80 ms (1.920 muestras a 24 kHz) y genera simultáneamente tokens de texto y códigos de audio, lo que permite escuchar y hablar a la vez. El vocabulario de texto se amplió de 32.000 a 48.000 piezas, añadiendo 16.000 específicas para hindi y telugu.

El entrenamiento tuvo dos fases. La etapa 1 usó aproximadamente 33.000 horas de monólogo de YouTube para adaptar el modelo base a las lenguas objetivo. La etapa 2b, que es el checkpoint liberado, consistió en un ajuste fino completo (con Mimi congelado) sobre 45.204 diálogos sintéticos de dos canales y 517 horas de audio: 211 horas de hindi, 178 de telugu y 128 de inglés. Los guiones provinieron de samvaad-hi-v1, indic-align (Wiki_Conv, OpenAssistant_T), snorbyte, Updesh, SODA y OpenAssistant; se limpiaron, se sintetizaron con TTS Maya 3, se alinearon con MMS y se ensamblaron en conversaciones de dos canales con solapamiento de turnos (~25%) y backchannels. El ajuste se ejecutó durante 1.500 pasos en 7 GPU H100 (31 minutos), con AdamW, LR 2e-5, batch de 49 × 60 s y pesos de idioma 0,35/0,35/0,30 para hindi/telugu/inglés.

## Capacidades

- Diálogo hablado full-duplex: escucha y habla simultáneamente, con gestión de turnos y capacidad de ceder la palabra cuando el usuario interrumpe.
- Generación de voz en hindi, telugu e inglés, con una voz de agente fija por idioma (hindi: Ritvik; telugu: m3_te_s38; inglés: m3_en_s0).
- Respuesta en el idioma de la conversación y en rol de asistente tras el entrenamiento de diálogo.
- Backchannels (señales de escucha activa) con frecuencia baja (0,06).
- Codificación y decodificación de audio mediante Mimi a 8 codebooks por canal.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio más allá del diálogo hablado.

## Casos de uso

- Investigación en diálogo hablado full-duplex para lenguas indias: sirve como checkpoint de partida para estudiar el comportamiento de cambio de turno y solapamiento en hindi y telugu, un ámbito con escasez de modelos abiertos.
- Prototipos de asistentes de voz en hindi y telugu: permite construir demos de conversación por voz donde el modelo responde en el idioma del usuario, aunque con latencia de 1,4–2 s y relevancia limitada.
- Evaluación comparativa de modelos full-duplex: al estar construido sobre Moshiko y evaluado con Full-Duplex-Bench v1, permite reproducir y comparar métricas de timing frente al modelo original.
- Generación de datos sintéticos de diálogo: el pipeline de TTS, alineamiento y ensamblado de dos canales descrito puede reutilizarse para crear corpus de diálogo en otras lenguas.
- Estudio de cambio de turno e interrupciones: el modelo cede la palabra en el 94% de las interrupciones, lo que lo hace útil para analizar políticas de barge-in en sistemas conversacionales.
- Fine-tuning posterior sobre dominios concretos: al ser un checkpoint de investigación con licencia CC BY 4.0, puede ajustarse con datos propios de atención al cliente o asistencia en hindi y telugu.

## Benchmarks y rendimiento

Full-Duplex-Bench v1 (inglés), subconjunto del 25% (primeros 36 ejemplos de cada una de las 5 tareas, 180 en total), con la misma inferencia en streaming para ambos modelos:

| Métrica | siba Stage 2b | Moshiko |
|---|---|---|
| Duplex score (0–100) | 38,4 | 54,5 |
| Habla encima del usuario en pausas a mitad de frase (↓) | 0,19–0,22 | 1,00 |
| Proporción de solapamiento sobre el total de casos (↓) | 0,25 | 0,89 |
| Toma el turno cuando el usuario termina (↑) | 0,92 | 1,00 |
| Latencia para tomar el turno (↓) | 1,36 s | 0,00 s* |
| Cede la palabra al ser interrumpido (↑) / latencia (↓) | 0,94 / 2,00 s | 0,92 / 0,68 s |
| Frecuencia de backchannel (↑) | 0,06 | 0,16 |

El duplex score es un compuesto solo de timing de los cuatro componentes; no se ejecutó el juez oficial de relevancia GPT. *La latencia de 0 s de Moshiko significa que ya estaba hablando, lo que en parte favorece su puntuación.

Pérdida en datos reservados (primer codebook), por idioma durante la etapa 2b:

| Paso | Hindi | Telugu | Inglés |
|---|---|---|---|
| 0 (etapa 1) | 7,94 | 7,69 | 7,71 |
| 500 | 0,835 | 0,925 | 0,572 |
| 1500 (liberado) | 0,807 | 0,904 | 0,562 |

No se han publicado resultados de benchmarks de conocimiento, razonamiento o código en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos liberados ocupan 15,7 GB en bf16, por lo que se necesitan al menos ~16 GB de VRAM solo para los pesos, más overhead del códec Mimi y del estado de streaming; en la práctica se recomienda 24 GB o más.
- GPU recomendadas: el entrenamiento se realizó en 7 × H100; para inferencia se recomienda A100 (40/80 GB), H100 o RTX 4090 (24 GB) como mínimo práctico.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, con margen ajustado; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: la librería `moshi` de Kyutai con `huggingface_hub` y PyTorch (ejemplo oficial en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia de respuesta de 1,36 s para tomar el turno y 2,00 s para ceder la palabra al ser interrumpido, según Full-Duplex-Bench v1; no se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siba (Stage 2b) | ~7.700 M | hi, te, en | Sí | CC BY 4.0 | Hugging Face |
| Moshiko (Kyutai) | ~7.700 M | en (principalmente) | Sí | CC BY 4.0 | Hugging Face |
| Moshi (Kyutai) | ~7.000 M | en | Sí | CC BY 4.0 | Hugging Face |

La comparación directa con Moshiko en Full-Duplex-Bench v1 muestra que siba obtiene un duplex score inferior (38,4 frente a 54,5), pero reduce drásticamente el solapamiento sobre el usuario (0,25 frente a 0,89) a costa de una latencia de turno de 1,36 s. No se dispone de datos de otros modelos full-duplex para hindi y telugu en la información proporcionada.

## Limitaciones y advertencias

- Estado de investigación: el propio autor indica que la relevancia de las respuestas y la velocidad no están resueltas; el modelo a menudo no responde a lo que se le pregunta, especialmente en hindi y telugu.
- Latencia alta: 1,4–2 s para tomar el turno, frente a los 0 s de Moshiko (que ya estaba hablando).
- Duplex score inferior al modelo base (38,4 frente a 54,5) y frecuencia de backchannel muy baja (0,06 frente a 0,16).
- Riesgo de alucinación y respuestas fuera de tema, derivado de un ajuste fino corto (1.500 pasos, ~2,4 pasadas sobre los datos).
- Datos de entrenamiento sintéticos: los diálogos se generaron con TTS (Maya 3) y pueden introducir artefactos y sesgos de las voces sintéticas.
- Idiomas limitados a hindi, telugu e inglés; no se documenta soporte para otras lenguas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el estado de investigación desaconseja su uso en producción sin validación adicional.
- No se documentan capacidades de tool calling, agentes ni visión, lo que limita su integración en pipelines complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BNarayanaReddy/siba
- Modelo base (Moshiko): https://huggingface.co/kyutai/moshiko-pytorch-bf16
- Pesos liberados: https://huggingface.co/BNarayanaReddy/siba/tree/main/stage2b/checkpoint_001500/consolidated
- Configuración de entrenamiento: https://huggingface.co/BNarayanaReddy/siba/blob/main/stage2b/args.yaml
- Log de evaluación: https://huggingface.co/BNarayanaReddy/siba/blob/main/stage2b/stage_eval.jsonl
- Repositorio de Kyutai Moshi: https://github.com/kyutai-labs/moshi
