# ShinePixelOrg/Audio8-TTS-Realistic-Air-MLX-Codec-Q8

## Resumen

Audio8-TTS-Realistic-Air-MLX-Codec-Q8 es una conversión de terceros a MLX del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-Air, publicada por ShinePixelOrg. El objetivo es permitir inferencia local de TTS y clonación de voz condicionada por referencia en ordenadores con Apple Silicon, aprovechando el framework MLX de Apple. El modelo base lo desarrollan Audio8 y Edge0, y esta variante mantiene los tensores del generador principal en BF16 sin modificar, aplicando cuantización únicamente al códec de audio de 44,1 kHz.

El modelo resuelve el problema de ejecutar un sistema TTS expresivo y con clonación de voz en hardware de consumo Mac, donde el códec completo en FP32 consumía unos 6,8 GB de pico de memoria. Con la cuantización Q8 del códec, el pico baja a aproximadamente 2,77 GB, lo que lo hace viable en equipos con memoria unificada moderada. Según el autor del modelo base, soporta 23 idiomas y tiene un tamaño compacto de en torno a 0,6B parámetros (601.159.424 parámetros reales en safetensors).

La relevancia actual radica en la combinación de un generador acústico de alta calidad con un códec cuantizado que reduce el coste de memoria sin degradar de forma apreciable la inteligibilidad (0,00% CER en la prueba publicada) ni la similitud de hablante (coseno ECAPA de 0,768 frente a 0,757 en FP32). Es una opción práctica para prototipado y despliegue local en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de tokens acústicos y de lenguaje (BF16) más códec de audio neuronal de 44,1 kHz; pesos en formato MLX con operadores de convolución empaquetada |
| Parametros totales | 601.159.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Códec en affine Q8 (group size 64) para capas lineales, Conv1d y Conv1d transpuestas elegibles; resto del códec en FP16; generador principal en BF16 |
| Idiomas soportados | 23 idiomas según el modelo base (no se detalla la lista en la información disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors y codec.safetensors), runtime MLX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del generador más allá de que produce tokens de lenguaje y tokens acústicos, y que se acompaña de un códec de audio separado que opera a 44,1 kHz. El generador conserva los tensores BF16 originales del modelo base Edge0/Audio8-TTS-Realistic-Air (revisión fijada 23c305cc013fde378edb459f538317043c993a74). La conversión de ShinePixelOrg se limita a cuantizar el códec y a reempaquetar los pesos para el runtime MLX.

La cuantización del códec aplica aritmética affine de 8 bits con tamaño de grupo 64 a las capas lineales, Conv1d y Conv1d transpuestas elegibles, dejando el resto de tensores del códec en FP16. El archivo codec.safetensors ocupa 359.230.364 bytes. El layout de convolución empaquetada exige usar los operadores qconv.py y qtranspose.py incluidos, junto con la configuración y el tokenizador suministrados. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida en WAV mono a 44,1 kHz.
- Clonación de voz condicionada por referencia: acepta una grabación de referencia y su transcripción para reproducir la voz del hablante.
- Generación de audio de longitud variable: admite entradas largas mediante --text-file, con segmentación interna (en la prueba, 1.000 caracteres divididos en 25 segmentos de hasta 58 caracteres).
- Soporte multilingüe según el modelo base (23 idiomas), aunque la información disponible no enumera la lista completa.
- Capacidad expresiva ("Realistic-Air") orientada a habla natural, según la denominación del modelo base.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, por tratarse de un modelo TTS.

## Casos de uso

- Clonación de voz con consentimiento para doblaje y locución: se suministra una grabación de referencia y su transcripción, y el modelo genera nuevas locuciones con la misma voz, útil para audiolibros y contenido bajo demanda en local.
- Generación de audios para prototipos de asistentes conversacionales en macOS: el modelo corre íntegramente en Apple Silicon con MLX, lo que permite iterar sin depender de servicios en la nube.
- Accesibilidad y lectura de textos largos: con --text-file y la segmentación automática, puede convertir documentos extensos en audio (1.000 caracteres en unos 242 s en la medición publicada).
- Producción de contenido multilingüe: al heredar los 23 idiomas del modelo base, sirve para generar voces en varios idiomas desde un mismo pipeline local.
- Investigación en TTS y evaluación de cuantización: la comparación FP32 frente a Q8 publicada (CER, coseno ECAPA, SNR) lo convierte en una base para estudiar el impacto de la cuantización del códec en calidad de voz.
- Integración en aplicaciones de escritorio para macOS: el runtime MLX con operadores de convolución empaquetada permite embeber el modelo en apps nativas con un pico de memoria de unos 2,77 GB.
- Pruebas de privacidad y despliegue offline: al ejecutarse localmente, evita enviar grabaciones de voz a terceros, relevante en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Mediciones publicadas por el autor de la conversión (MLX 0.32.4, macOS Metal, referencia de 30 s, una única voz en mandarín):

| Carga de trabajo | Códec FP32 | Códec Q8 |
|---|---:|---:|
| Pico de memoria, frase corta | 6,818 GB | 2,771 GB |
| Pico de memoria, 1.000 caracteres | — | 2,763 GB |
| Audio generado, 1.000 caracteres | — | 242,09 s |
| CER (Whisper large-v3-turbo) | 0,00% | 0,00% |
| Coseno de hablante ECAPA vs referencia | 0,757 | 0,768 |
| SNR de forma de onda vs códec FP32 | — | 36,74 dB |

Además, la cuantización del codificador de referencia alteró 2.126 de 6.460 índices del códec en la prueba, por lo que la salida de clonación puede diferir aunque los pesos BF16 del generador sean idénticos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje general.

## Requisitos de hardware

- Pico de memoria medido: 2,771 GB con códec Q8 en frase corta y 2,763 GB en una ejecución de 1.000 caracteres; 6,818 GB con códec FP32.
- Hardware objetivo: Apple Silicon (macOS con Metal); el runtime depende de MLX 0.32.4 y de la revisión de MLX Audio usada en la conversión.
- No se documenta compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) en esta variante; para servir en GPU existe el adaptador SGLang Omni del ecosistema Audio8 TTS, según la información de búsqueda.
- Cabe en equipos Mac con memoria unificada moderada gracias al pico de ~2,77 GB, aunque los límites en dispositivos móviles requieren mediciones propias según el autor.
- Despliegue: script infer.py incluido, con dependencias fijadas en requirements.txt; requiere los operadores qconv.py y qtranspose.py por el layout de convolución empaquetada.
- Throughput de referencia: 1.000 caracteres en 242,09 s (aproximadamente 4,1 caracteres por segundo) en la configuración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air-MLX-Codec-Q8 (esta ficha) | 601.159.424 | 23 (según modelo base) | Códec Q8 + FP16, generador BF16 | Apache 2.0 | MLX, Apple Silicon |
| Edge0/Audio8-TTS-Realistic-Air (base) | ~0,6B | 23 | BF16/FP32 | Apache 2.0 | Hugging Face |
| TechnoBaptist/Audio8-TTS-Realistic-Air | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Preview, Breeze-TTS-2, Qwen3-TTS, Higgs TTS 3 | No disponible | No disponible | No disponible | No disponible | Mencionados en la demo del modelo base |

Los modelos Preview, Breeze-TTS-2, Qwen3-TTS y Higgs TTS 3 aparecen como comparativas en la demo oficial del modelo base, pero la información disponible no incluye sus especificaciones, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Las mediciones publicadas cubren una sola referencia de voz y una única carga en mandarín; la calidad en otros idiomas o voces no está verificada.
- La cuantización del codificador de referencia modifica índices del códec (2.126 de 6.460 en la prueba), por lo que la clonación puede diferir de la salida FP32 aunque el generador sea idéntico.
- Riesgo de uso indebido en clonación de voz: el autor exige consentimiento del hablante para usar grabaciones de referencia; en producción deben aplicarse controles de consentimiento y marcas de procedencia.
- No se documentan sesgos lingüísticos o de hablante; al no enumerarse los 23 idiomas, conviene validar el idioma objetivo antes de desplegar.
- No hay datos de robustez ante texto con caracteres especiales, cifras o puntuación compleja.
- El rendimiento en dispositivos móviles y los límites de memoria en ellos requieren mediciones separadas según el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso upstream incluido (NOTICE) y la atribución a Audio8 y Edge0.
- Dependencia estricta del runtime MLX y de los operadores de convolución empaquetada: no es portable a otros frameworks sin reconversión.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/ShinePixelOrg/Audio8-TTS-Realistic-Air-MLX-Codec-Q8
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Revisión fijada del modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air/tree/23c305cc013fde378edb459f538317043c993a74
- Licencia original del modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air/blob/23c305cc013fde378edb459f538317043c993a74/LICENSE
- Conversión de terceros alternativa: https://huggingface.co/TechnoBaptist/Audio8-TTS-Realistic-Air
- Demo oficial del modelo base: https://edge0-ai.github.io/Audio8_TTS/
