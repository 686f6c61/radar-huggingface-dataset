# empiriolabsai/canora-dutch

## Resumen

Canora Dutch es un modelo de síntesis de voz (text-to-speech) en neerlandés desarrollado por EmpirioLabs, un *finetune* del conocido Kokoro-82M de hexgrad. Mantiene la arquitectura y el tamaño del modelo original (82 millones de parámetros) pero sustituye el sistema de fonemización por un módulo específico para neerlandés (`g2p_nl.py`) y añade dos voces propias, `noor` (femenina) y `daan` (masculina). El modelo se distribuye bajo licencia Apache 2.0 y está pensado para usarse con el paquete estándar `kokoro` de Python, además de incluir pesos ONNX para ONNX Runtime y transformers.js.

La propuesta de valor es concreta: según las mediciones del autor sobre 200 frases neerlandesas no vistas, Canora Dutch obtiene un WER del 0,93 % (`noor`) y 0,98 % (`daan`), frente al mejor Piper neerlandés probado (1,49 %), y una puntuación UTMOS de naturalidad de 4,21 y 4,15 frente a 3,71 del mejor Piper. Es, por tanto, una alternativa ligera y libre para TTS en neerlandés que mejora los sistemas Piper de referencia.

El modelo es relevante ahora porque ocupa un hueco poco cubierto: TTS neerlandés de calidad, con licencia permisiva, tamaño reducido (el ONNX int8 pesa 115 MB) y compatibilidad con el ecosistema Kokoro, lo que facilita su despliegue en servidores modestos e incluso en el navegador mediante transformers.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, según el tag `style_text_to_speech_2`) |
| Parámetros totales | 82 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | ONNX en precisión completa, media precisión (fp16) e int8 |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (fp32, fp16, int8), voces en `.pt` |

## Arquitectura y entrenamiento

Canora Dutch hereda la arquitectura de Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros etiquetado en Hugging Face como `style_text_to_speech_2`, es decir, basado en la familia StyleTTS 2. No es un modelo de lenguaje ni un transformer autoregresivo de texto: recibe una secuencia de fonemas y una representación de estilo/voz, y genera audio a 24 kHz. El modelo se carga con la clase `KModel` del paquete `kokoro` y produce formas de onda directamente, sin vocoder externo separado en el flujo de usuario.

El entrenamiento es un *finetune* del checkpoint `hexgrad/Kokoro-82M` sobre neerlandés. La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF o DPO (no aplicables de forma habitual en TTS). La innovación técnica destacable es la sustitución del front-end de fonemización por un módulo propio, `g2p_nl.py`, que convierte texto neerlandés a fonemas y que depende del binario `espeak-ng`. Este módulo es el responsable de que números, fechas, horas y precios se lean como lo haría un hablante nativo (por ejemplo, «€ 3,50» o «14:35»). El autor publica además pesos ONNX en tres precisiones para inferencia sin PyTorch.

## Capacidades

- Síntesis de voz en neerlandés a partir de texto, con salida de audio a 24 kHz.
- Dos voces: `noor` (femenina) y `daan` (masculina), seleccionables mediante tensores de voz en `voices/`.
- Normalización de números, fechas, horas y precios al formato hablado neerlandés.
- Control de velocidad de habla mediante el tercer argumento de `model(...)` (1.0 = velocidad normal).
- Inferencia en PyTorch y en ONNX Runtime (fp32, fp16, int8).
- Compatibilidad con transformers.js para ejecución en JavaScript/entorno web.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.
- Capacidad multilingüe: limitada al neerlandés; no se documentan otros idiomas.

## Casos de uso

- **Locución de noticias y boletines meteorológicos**: el modelo lee frases como «Vandaag wordt het een zonnige dag met temperaturen rond de 21 graden» con naturalidad medida de UTMOS 4,21, adecuada para generar audio de boletines de forma automatizada.
- **Anuncios de transporte público**: la lectura correcta de horas y andenes («De trein naar Amsterdam vertrekt om 14:35 van spoor 5») lo hace apto para megafonía y avisos en estaciones, donde la inteligibilidad es crítica y el WER bajo (0,93 %) reduce errores de comprensión.
- **Atención al cliente por voz**: con 82 M de parámetros y velocidad de 3,4x–3,8x tiempo real en CPU, puede generar respuestas habladas en un pipeline de IVR sin necesidad de GPU, manteniendo latencia baja en servidores modestos.
- **Audiolibros y contenido editorial**: la licencia Apache 2.0 permite uso comercial; las dos voces y el control de velocidad permiten generar narraciones de textos largos por lotes.
- **Accesibilidad web**: los pesos ONNX int8 (115 MB) y el soporte de transformers.js permiten integrar lectura en voz alta en el navegador sin backend, útil para aplicaciones de accesibilidad en neerlandés.
- **Sistemas de anuncios comerciales y precios**: la lectura correcta de precios («Een kopje koffie kost hier € 3,50») lo hace adecuado para catálogos, menús y promociones automatizadas.
- **Prototipado de asistentes de voz neerlandeses**: al cargarse con el paquete estándar `kokoro`, se integra rápidamente en pipelines de experimentación junto a ASR y LLM.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos el 2026-11-20 sobre 200 frases neerlandesas no vistas, transcritas con `openai/whisper-large-v3` para calcular el WER. UTMOS es una estimación automática de naturalidad en escala 1–5.

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Dutch `noor` | 0,93 % | 4,21 |
| Canora Dutch `daan` | 0,98 % | 4,15 |
| Piper `nl_NL-pim-medium` | 1,49 % | 3,69 |
| Piper `nl_BE-flemishguy-medium` | 2,21 % | 3,19 |
| Piper `nl_NL-ronnie-medium` | 2,21 % | 3,39 |
| Piper `nl_BE-nathalie-medium` | 2,42 % | 3,60 |
| Piper `nl_BE-rdh-medium` | 3,35 % | 3,26 |
| Piper `nl_NL-alex-medium` | 3,76 % | 3,71 |
| Piper `nl_NL-mls-medium` | 22,59 % | 2,62 |
| Piper `nl_NL-mls_5809-low` | 24,55 % | 2,83 |
| Piper `nl_NL-mls_7432-low` | 44,26 % | 2,59 |

Con cuantización int8, el autor reporta `noor` 1,03 % WER / UTMOS 3,56 y `daan` 1,13 % WER / UTMOS 3,60 sobre las mismas frases.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7402P (segundos de audio por segundo de cómputo): PyTorch 3,4x tiempo real, ONNX fp32 3,8x, ONNX int8 3,5x.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 82 M de parámetros, la inferencia cabe holgadamente en menos de 1 GB de memoria; el archivo ONNX int8 ocupa 115 MB.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090) acelera la inferencia, pero el modelo está diseñado para funcionar en CPU.
- **CPU**: funciona en CPU; el autor mide 3,4x–3,8x tiempo real en 4 hilos de un AMD EPYC 7402P.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- **Opciones de despliegue**: paquete `kokoro` (PyTorch), ONNX Runtime (fp32/fp16/int8), transformers.js en el navegador. Requiere `espeak-ng` instalado para el módulo de fonemización `g2p_nl.py`.
- **Latencia y throughput**: 3,4x tiempo real con PyTorch, 3,8x con ONNX fp32 y 3,5x con ONNX int8 en la configuración de CPU indicada; el rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (mejor voz) | UTMOS (mejor voz) | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Canora Dutch `noor` | 82 M | nl | 0,93 % | 4,21 | Apache 2.0 | PyTorch, ONNX |
| Piper `nl_NL-pim-medium` | no disponible | nl | 1,49 % | 3,69 | no disponible | ONNX |
| Piper `nl_NL-alex-medium` | no disponible | nl | 3,76 % | 3,71 | no disponible | ONNX |
| Piper `nl_BE-nathalie-medium` | no disponible | nl | 2,42 % | 3,60 | no disponible | ONNX |

La comparación se limita a los sistemas Piper neerlandeses incluidos en la evaluación del autor; no se dispone de datos de otros modelos TTS neerlandeses comparables en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo neerlandés; no se documenta soporte para otros idiomas ni para variantes regionales (nl-NL frente a nl-BE) de forma explícita.
- **Dos voces fijas**: únicamente `noor` y `daan`; no hay clonación de voz ni voces adicionales documentadas.
- **Dependencia externa**: el módulo `g2p_nl.py` requiere el binario `espeak-ng` instalado en el sistema, lo que añade un paso de despliegue y una dependencia de sistema operativo.
- **Riesgo de alucinación**: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera de dominio, siglas o nombres propios no cubiertos por el módulo de fonemización; el autor no documenta tasas de error específicas para estos casos.
- **Sesgos**: no se documentan análisis de sesgos de género, acento o prosodia más allá de las dos voces incluidas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento originales de Kokoro-82M, no detalladas en la información disponible.
- **Métricas del autor**: los benchmarks (WER, UTMOS, velocidad) han sido medidos por EmpirioLabs, no por un tercero independiente; deben interpretarse con cautela.
- **Producción**: el modelo está pensado para TTS; no debe usarse para tareas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-dutch
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Todos los modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Muestras de audio: https://huggingface.co/empiriolabsai/canora-dutch/tree/main/samples
- Gráfico de resultados: https://media.empiriolabs.ai/assets/hf/canora-dutch/v1/results.png
