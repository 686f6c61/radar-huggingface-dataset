# Rayen0/whisper-tiny-ar-quran-onnx

## Resumen

`Rayen0/whisper-tiny-ar-quran-onnx` es una exportación a formato ONNX del modelo `tarteel-ai/whisper-tiny-ar-quran`, un ajuste fino de `openai/whisper-tiny` especializado en reconocimiento automático de voz (ASR) de recitación coránica en árabe. El modelo original lo desarrolla Tarteel AI sobre la arquitectura Whisper de OpenAI, y esta versión ONNX la publica el usuario Rayen0 para su ejecución íntegra en el navegador mediante Transformers.js.

El problema que resuelve es la transcripción de recitación coránica en árabe con diacríticos (tashkil) sin enviar el audio a ningún servidor: el autor lo integra en iqra, una aplicación gratuita y no comercial de práctica de recitación donde el audio nunca abandona el dispositivo. Es relevante para desarrolladores que necesiten ASR árabe ligero, offline y de baja huella (el repositorio ocupa 0,1 GB) dentro de un cliente web o Node.js.

El modelo es un transformer encoder-decoder tipo Whisper en su variante *tiny* (órdenes de magnitud por debajo de los modelos grandes de la familia; el número exacto de parámetros no se detalla en la información disponible). La exportación se realizó con Hugging Face Optimum sin reentrenamiento, y solo se cuantizó el decodificador a int8, manteniendo el encoder en fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny de OpenAI, ajustado por Tarteel AI) |
| Parámetros totales | no disponible (variante *tiny* de Whisper; cifra exacta no indicada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio propia de Whisper tiny; no se especifica en la información) |
| Tipos de cuantización | Encoder en fp32; decoder en int8 con cuantización dinámica per-tensor (`--avx512`) |
| Idiomas soportados | Árabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx` fp32, `decoder_model_merged_quantized.onnx` int8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper en su variante *tiny*: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para ASR multilingüe. Tarteel AI realizó un ajuste fino sobre recitación coránica, y esta versión no introduce ningún entrenamiento adicional: es una conversión de pesos a ONNX con `optimum-cli export onnx --task automatic-speech-recognition-with-past` (optimum-onnx 0.1.0, transformers 4.57.6, torch 2.15.0). No se dispone de datos sobre el volumen de tokens, la composición del dataset de ajuste fino ni si se empleó RLHF o DPO; esa información pertenece a la model card del checkpoint original.

Las modificaciones respecto al original son tres: exportación a ONNX, cuantización dinámica int8 únicamente del decodificador (el encoder se mantiene en fp32 porque cuantizarlo degradaba la precisión en las pruebas del autor) y sustitución del `generation_config.json` por el de `openai/whisper-tiny`, ya que el repositorio ajustado no lo incluía y el exportador por defecto omitía los tokens de idioma y tarea necesarios para solicitar transcripción en árabe. La validación reportada compara 45 recitaciones de cuatro recitadores en Transformers.js 4.3.2 (Node.js, CPU) y obtiene transcripciones idénticas, diacríticos incluidos, a las del checkpoint PyTorch original.

## Capacidades

- Reconocimiento automático de voz (ASR) de recitación coránica en árabe, con salida en árabe completamente diacritizado.
- Salida en ortografía estándar (Imla'i), no en escritura uthmaní.
- Ejecución íntegra en navegador o Node.js mediante Transformers.js, sin backend de inferencia.
- Inferencia offline: el audio no sale del dispositivo.
- API de pipeline estándar de Transformers.js (`automatic-speech-recognition`) con selección de idioma (`arabic`) y tarea (`transcribe`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidad multilingüe: no; está especializado y validado únicamente en árabe.

## Casos de uso

- Práctica de recitación coránica en el navegador: la aplicación iqra usa el modelo para transcribir la recitación del usuario y compararla con el texto esperado, con la garantía de que el audio permanece en el dispositivo, algo crítico para contenido religioso y datos personales.
- Aplicaciones web educativas offline: al ejecutarse con Transformers.js y un repositorio de 0,1 GB, puede empaquetarse en una PWA que funcione sin conexión en entornos con conectividad limitada.
- Verificación de diacríticos en recitación: la salida incluye tashkil completo, lo que permite detectar errores de vocalización comparando la transcripción con el texto de referencia.
- Prototipado rápido de ASR árabe sin infraestructura: el pipeline de Transformers.js permite integrar el modelo en pocas líneas de JavaScript, sin desplegar servidores GPU.
- Procesamiento por lotes en Node.js: la validación del autor se realizó en Node.js sobre CPU, lo que respalda su uso en scripts de transcripción por lotes de grabaciones de recitadores.
- Evaluación comparativa de recitadores: al ser determinista en las pruebas del autor (45 recitaciones, cuatro recitadores, transcripciones idénticas al original), sirve para pipelines de control de calidad de audio coránico.
- Integración en aplicaciones de memorización (hifz): transcripción local para dar retroalimentación inmediata sin coste de API ni latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es cualitativo: con Transformers.js 4.3.2 en Node.js sobre CPU, las transcripciones de 45 recitaciones de cuatro recitadores fueron idénticas, diacríticos incluidos, a las del checkpoint PyTorch original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la variante *tiny* de Whisper, la huella es muy reducida y apta para CPU.
- GPU recomendadas: no se indican; el caso de uso documentado es CPU (Node.js) y navegador.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo moderna, así como en CPU, dado el tamaño del modelo.
- Opciones de despliegue: Transformers.js (navegador y Node.js) es el soporte documentado; el formato ONNX abre la puerta a ONNX Runtime, aunque no se detalla en la información.
- Latencia y throughput: no disponibles; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Rayen0/whisper-tiny-ar-quran-onnx | no disponible (Whisper tiny) | no disponible | Árabe | Apache 2.0 | ONNX, Transformers.js |
| tarteel-ai/whisper-tiny-ar-quran | no disponible (Whisper tiny) | no disponible | Árabe | Apache 2.0 | PyTorch (checkpoint original) |
| openai/whisper-tiny | no disponible en la información | no disponible | Multilingüe | Apache 2.0 | PyTorch; exportable a ONNX |

La comparativa se limita a estos tres modelos porque la información proporcionada no incluye datos de rendimiento ni de otros sistemas comparables. La diferencia práctica entre el checkpoint original y esta versión es el formato (ONNX cuantizado frente a PyTorch) y la sustitución del `generation_config.json`; frente a `openai/whisper-tiny`, la especialización en recitación coránica con diacríticos.

## Limitaciones y advertencias

- Especializado exclusivamente en árabe y en recitación coránica; su rendimiento en árabe conversacional general o en otros dominios no está documentado y probablemente sea inferior.
- Salida en ortografía Imla'i, no uthmaní: no es adecuado si se necesita texto con la grafía coránica canónica.
- Al ser un modelo *tiny*, la precisión esperada es limitada en comparación con variantes mayores de Whisper; no se publican métricas de WER.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente con audio ruidoso o fuera de dominio; no se documentan mitigaciones.
- Sesgos: no se documentan sesgos específicos; el ajuste fino sobre un corpus religioso concreto puede reducir la cobertura de acentos y estilos de recitación no representados.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que el modelo se usa en una aplicación no comercial; conviene revisar la model card del checkpoint original para conocer detalles de entrenamiento y limitaciones.
- La cuantización solo afecta al decodificador; no se garantiza paridad exacta con el original en todos los entornos más allá de la validación reportada (45 recitaciones, cuatro recitadores, Transformers.js 4.3.2).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin adopción comunitaria ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rayen0/whisper-tiny-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-tiny
- Transformers.js: https://github.com/huggingface/transformers.js
