# empiriolabsai/kokoro-polish

## Resumen

Kokoro Polish es un modelo de síntesis de voz (text-to-speech) en polaco desarrollado por EmpirioLabs como un fine-tuning de `hexgrad/Kokoro-82M`. Convierte texto en polaco en audio inteligible y natural, incluyendo la lectura correcta de números, fechas, horas y precios tal como los pronuncia un hablante nativo. Es relevante porque cubre un hueco concreto: TTS ligero, de código abierto y con licencia permisiva para un idioma con pocos recursos de calidad, superando en naturalidad a las voces Piper probadas por el autor.

El modelo mantiene la arquitectura y el tamaño del Kokoro original: 82 millones de parámetros, lo que lo sitúa en la categoría de TTS ultraligero apto para CPU y despliegue en el navegador. Se distribuye con pesos en PyTorch y en ONNX (precisión completa, fp16 e int8), este último de 115 MB, lo que facilita su integración en entornos de inferencia ligeros y en `transformers.js`.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El modelo soporta dos voces, `zofia` (femenina) y `jakub` (masculina), y requiere un módulo de conversión de grafemas a fonemas específico del polaco incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (fine-tuning del modelo base `hexgrad/Kokoro-82M`) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación práctica: ~500 fonemas por llamada) |
| Tipos de cuantizacion | ONNX precisión completa, ONNX fp16, ONNX int8 (115 MB) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (`.onnx`), voces en `.pt` |
| Frecuencia de muestreo | 24 kHz |
| Voces | `zofia` (femenina), `jakub` (masculino) |
| Tamaño del repositorio | 0.9 GB |

## Arquitectura y entrenamiento

Kokoro Polish hereda la arquitectura de Kokoro-82M, un modelo TTS de 82 millones de parámetros diseñado para inferencia rápida y ligera. El pipeline funciona en dos etapas: primero un módulo de conversión de texto a fonemas específico del polaco (`g2p_pl.py`, que utiliza `espeak-ng`) transforma el texto en una secuencia de fonemas, y después el modelo acústico genera el audio a 24 kHz condicionado por un vector de estilo asociado a la voz y un factor de velocidad.

El autor no detalla en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). Se trata de un fine-tuning del modelo base sobre datos en polaco, con el objetivo declarado de mejorar la naturalidad y la lectura correcta de expresiones numéricas y temporales. La innovación destacable es la inclusión de pesos ONNX en tres precisiones y un módulo G2P autocontenido, que permiten usar el modelo con el paquete estándar `kokoro` sin dependencias adicionales más allá de `espeak-ng`.

## Capacidades

- Síntesis de voz en polaco a partir de texto, con dos voces (`zofia` y `jakub`).
- Lectura correcta de números, fechas, horas y precios según la convención del polaco hablado (por ejemplo, "14:35", "12,50 zł", "21 °C").
- Control de velocidad de habla mediante un parámetro (1.0 = velocidad normal).
- Inferencia en PyTorch y en ONNX Runtime (precisión completa, fp16 e int8).
- Compatibilidad con `transformers.js` para ejecución en navegador.
- Integración con el paquete Python estándar `kokoro`.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al polaco.

## Casos de uso

- **Lectura de noticias y boletines meteorológicos**: el modelo pronuncia correctamente temperaturas, fechas y horas ("21 °C", "14:35"), lo que lo hace adecuado para generar audio de informes diarios de forma automatizada.
- **Anuncios de transporte público**: la lectura fiable de horas y números de andén ("o 14:35 z peronu 5") permite generar avisos de llegadas y salidas en estaciones con bajo coste computacional.
- **Atención al cliente por voz**: con 82 millones de parámetros y velocidad superior a 3x tiempo real en CPU, puede desplegarse en servidores modestos para respuestas habladas en sistemas de IVR en polaco.
- **Accesibilidad web**: la compatibilidad con `transformers.js` y el archivo int8 de 115 MB permiten ejecutar la síntesis en el navegador del usuario, útil para lectores de pantalla y contenido accesible sin enviar texto a un servidor.
- **Audiolibros y contenido educativo**: la ventana práctica de ~500 fonemas por llamada, dividiendo el texto en frases, permite narrar documentos largos con dos voces disponibles para diálogos o alternancia de narradores.
- **Comercio electrónico**: la lectura correcta de precios ("12,50 zł") facilita la generación de descripciones de producto habladas o resúmenes de carrito en aplicaciones de compra.
- **Sistemas embebidos y edge computing**: el tamaño reducido y la inferencia en CPU sin GPU permiten integrar TTS en dispositivos con recursos limitados para aplicaciones de domótica o terminales de información.

## Benchmarks y rendimiento

Resultados medidos por EmpirioLabs el 2026-11-20 sobre 200 frases en polaco no vistas durante el entrenamiento. La inteligibilidad se evalúa con WER (tasa de error de palabras, menor es mejor) usando `openai/whisper-large-v3` para transcribir; la naturalidad con UTMOS (escala 1-5, mayor es mejor).

| Sistema | WER | UTMOS |
|---|---:|---:|
| Kokoro Polish `zofia` | 2.25% | 4.04 |
| Kokoro Polish `jakub` | 1.15% | 4.10 |
| Piper `pl_PL-gosia-medium` | 1.73% | 3.47 |
| Piper `pl_PL-darkman-medium` | 2.51% | 3.40 |
| Piper `pl_PL-mc_speech-medium` | 3.35% | 3.18 |
| Piper `pl_PL-bass-high` | 7.79% | 2.33 |
| Piper `pl_PL-mls_6892-low` | 12.76% | 2.67 |

Rendimiento de la versión int8 sobre las mismas frases: `zofia` 1.88% WER y UTMOS 3.55; `jakub` 1.31% WER y UTMOS 3.67.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7452 de 32 núcleos (segundos de audio por segundo de cómputo): PyTorch 3.2x tiempo real, ONNX precisión completa 3.7x, ONNX int8 3.5x.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo es de 82 millones de parámetros y funciona en CPU. En GPU, el consumo de memoria es mínimo (por debajo de 1 GB en fp32).
- **GPU recomendadas**: no necesarias. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría la inferencia, pero el modelo está optimizado para CPU.
- **CPU**: funciona en procesadores de escritorio y servidor; el rendimiento medido en un AMD EPYC 7452 con 4 hilos es de 3.2x a 3.7x tiempo real.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos; el archivo int8 de 115 MB es apto para entornos con memoria limitada.
- **Opciones de despliegue**: paquete Python `kokoro`, ONNX Runtime, `transformers.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo TTS.
- **Latencia y throughput**: aproximadamente 3.2x-3.7x tiempo real en CPU según el backend; la latencia depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (mejor voz) | UTMOS (mejor voz) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Kokoro Polish | 82 M | pl | 1.15% | 4.10 | Apache 2.0 | Hugging Face |
| Piper `pl_PL-gosia-medium` | no disponible | pl | 1.73% | 3.47 | no disponible en la información | Piper |
| Piper `pl_PL-darkman-medium` | no disponible | pl | 2.51% | 3.40 | no disponible en la información | Piper |
| Kokoro-82M (base) | 82 M | multilingüe (incluye otros idiomas) | no disponible para pl | no disponible para pl | Apache 2.0 | Hugging Face |

La comparación directa con el Kokoro-82M original en polaco no está disponible en la información proporcionada; el autor solo reporta métricas frente a voces Piper.

## Limitaciones y advertencias

- **Idioma único**: solo soporta polaco; el texto en otros idiomas no se procesará correctamente.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o siglas no cubiertas por el módulo G2P.
- **Longitud de entrada**: se recomienda limitar cada llamada a unos 500 fonemas; textos más largos deben dividirse en frases y concatenar el audio, lo que puede introducir discontinuidades prosódicas.
- **Dependencia externa**: requiere `espeak-ng` instalado en el sistema para la conversión de texto a fonemas, lo que añade un paso de despliegue.
- **Dos voces únicamente**: no permite clonación de voz ni voces personalizadas más allá de `zofia` y `jakub`.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre un corpus limitado, puede reflejar sesgos de pronunciación o prosodia del dataset.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `hexgrad/Kokoro-82M` y de `espeak-ng` en el despliegue final.
- **Métricas del autor**: los benchmarks (WER, UTMOS) han sido medidos por el propio desarrollador; no se dispone de validación independiente en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/kokoro-polish
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Web del autor: https://empiriolabs.ai
- Todos los modelos del autor: https://huggingface.co/empiriolabsai
- Plataforma: https://platform.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
- Repositorio de espeak-ng (dependencia del G2P): https://github.com/espeak-ng/espeak-ng
