# prithivMLmods/ZONOS3-Mini-GGUF

## Resumen

ZONOS3-Mini es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Zyphra, distribuido en formato GGUF por el usuario prithivMLmods. Se trata de un modelo compacto de aproximadamente 802 millones de parámetros totales, con unos 100 millones activos por token, diseñado para generar audio de alta fidelidad y clonación de voz a partir de un clip de referencia o un único embedding de hablante. Su relevancia radica en que ofrece capacidades de TTS multilingüe (43 idiomas) en un tamaño que permite inferencia en tiempo real en dispositivos de consumo, incluidos teléfonos y navegadores mediante WebGPU.

La arquitectura combina capas de Gated DeltaNet con capas de atención global en un esquema híbrido de 11 capas, e incorpora una mezcla de expertos latente con 64 expertos y enrutamiento top-2. El modelo genera tokens de audio a 15 Hz con 10 codebooks y utiliza una cabeza iSTFT causal para renderizar audio a 44,1 kHz de forma incremental. Esta ficha documenta la versión cuantizada en GGUF, pensada para su uso con llama.cpp y runtimes nativos.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su adopción comercial, y su reducido tamaño lo posiciona como una alternativa práctica frente a sistemas TTS propietarios o modelos de mayor envergadura para despliegues en producción con requisitos de latencia estrictos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 11 capas (9 Gated DeltaNet + 2 atención global), MoE latente con 64 expertos y enrutamiento top-2 |
| Parámetros totales | 802.038.600 |
| Parámetros activos | ~100 millones por token |
| Longitud de contexto | no disponible (generación de hasta 10 minutos de audio por generación) |
| Tipos de cuantización | BF16, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | 43 idiomas: en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj-bf16 para proyección multimodal) |

## Arquitectura y entrenamiento

El backbone de ZONOS3-Mini es un transformer híbrido de 11 capas que combina 9 capas de Gated DeltaNet con 2 capas de atención global. Sobre esta columna vertebral se aplica una mezcla de expertos latente con 64 expertos y enrutamiento top-2, lo que permite mantener un cómputo activo reducido (~100M parámetros por token) pese a los ~800M totales. El modelo genera tokens de audio a 15 Hz organizados en 10 codebooks, y una cabeza iSTFT causal convierte estos tokens en audio a 44,1 kHz de forma incremental, lo que habilita la reproducción en streaming mientras se genera.

El texto de entrada se normaliza con NeMo para nueve idiomas y se tokeniza con un tokenizador SuperBPE de 8.192 entradas. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Entre las innovaciones destacables están la clonación de voz a partir de un clip de referencia o un único embedding de hablante, el control explícito de atributos de voz (edad, acento, textura vocal) y de parámetros acústicos (volumen, ancho de banda, velocidad de habla), y la capacidad de ejecución en tiempo real en dispositivos móviles y navegadores vía WebGPU.

## Capacidades

- Síntesis de voz multilingüe en 43 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, árabe e hindi, entre otros.
- Clonación de voz a partir de un clip de referencia o de un único embedding de hablante.
- Diseño de voz mediante el ajuste de edad, acento y textura vocal.
- Control de parámetros acústicos: volumen, ancho de banda y velocidad de habla.
- Generación de audio de hasta 10 minutos en una sola pasada.
- Renderizado de audio a 44,1 kHz mediante cabeza iSTFT causal, con salida en streaming.
- Ejecución en tiempo real en teléfonos y portátiles, incluido el navegador mediante WebGPU.
- Servicio mediante SGLang-Omni con endpoint compatible con OpenAI `/v1/audio/speech`.
- Ejecución con runtimes nativos: CUDA, MLX para Apple Silicon y C++/ggml para CPU, CUDA, Metal o Vulkan.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo es específicamente de texto a voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede generar hasta 10 minutos de audio por generación con control de velocidad y volumen, lo que permite narrar capítulos completos y ajustar el ritmo según el género editorial.
- Asistentes de voz para atención al cliente: con clonación de voz y 43 idiomas, se puede desplegar un agente telefónico que mantenga una identidad de marca consistente y atienda a usuarios en su idioma nativo.
- Doblaje y localización de contenido: la capacidad de clonar una voz de referencia permite doblar vídeos manteniendo el timbre del hablante original, con control de acento para adaptar el resultado al mercado objetivo.
- Accesibilidad y lectura de pantalla: su ejecución en tiempo real en dispositivos de consumo y navegadores facilita integrar lectores de texto a voz en aplicaciones web y móviles sin depender de servicios en la nube.
- Generación de voces para videojuegos y prototipado: el diseño de voz por edad, acento y textura permite crear variantes de personajes de forma rápida, y la cuantización Q4_K_M (484 MB) cabe en equipos de desarrollo modestos.
- Sistemas de respuesta interactiva de voz (IVR): el endpoint compatible con OpenAI `/v1/audio/speech` vía SGLang-Omni permite integrar el modelo en infraestructuras existentes basadas en la API de OpenAI sin reescribir la capa de integración.
- Contenido educativo multilingüe: la cobertura de 43 idiomas y la normalización de texto con NeMo para nueve de ellos facilitan generar materiales de aprendizaje en distintos mercados con una sola infraestructura.

## Benchmarks y rendimiento

La model card reporta métricas de rendimiento operativo, no de calidad perceptual:

| Métrica | Valor |
|---|---|
| Tiempo mediano hasta el primer audio (H100, 8 peticiones concurrentes) | 80 ms |
| Throughput máximo | 457 segundos de audio por segundo |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tasa de tokens de audio | 15 Hz, 10 codebooks |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en BF16; entre 300 MB (Q2_K) y 855 MB (Q8_0) en cuantizaciones GGUF, más 689 MB del fichero mmproj-bf16.
- GPU recomendadas: H100 para despliegues de alta concurrencia (según las métricas reportadas); A100 y RTX 4090 sobradas para inferencia individual o de baja concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de VRAM libre; las cuantizaciones Q4_K_M (484 MB) y Q5_K_M (570 MB) son las recomendadas por el autor.
- Opciones de despliegue: llama.cpp (binario `llama-tts`), SGLang-Omni con endpoint compatible con OpenAI, runtimes nativos CUDA, MLX para Apple Silicon y C++/ggml para CPU, CUDA, Metal o Vulkan; también ejecución en navegador vía WebGPU.
- Latencia y throughput: 80 ms de tiempo mediano hasta el primer audio con 8 peticiones concurrentes en H100; 457 segundos de audio generados por segundo de cómputo en el mismo entorno.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZONOS3-Mini | ~802M totales, ~100M activos | 43 | Apache 2.0 | GGUF, safetensors | Clonación de voz, MoE latente, ejecución en tiempo real en dispositivo |
| Zyphra/ZONOS3-Mini (base) | ~802M totales, ~100M activos | 43 | Apache 2.0 | safetensors | Modelo original del que deriva esta versión GGUF |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos TTS comparables en la documentación facilitada; la comparativa se limita al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgos; al ser un modelo de voz, puede reproducir sesgos de acento, género o edad presentes en los datos de entrenamiento y en los clips de referencia usados para clonación.
- Riesgo de uso indebido de la clonación de voz: la capacidad de clonar a partir de un clip corto exige salvaguardas éticas y legales (consentimiento, marcas de agua, verificación) que la model card no detalla.
- La normalización de texto con NeMo solo cubre nueve idiomas; en el resto de los 43 idiomas la calidad de pronunciación puede degradarse.
- No se especifica la longitud de contexto en tokens de texto; la limitación práctica es la duración máxima de audio de 10 minutos por generación.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de clonación de voz debe cumplir la normativa aplicable sobre derechos de imagen y voz.
- Las cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad de audio de forma perceptible según advierte el propio autor; para producción se recomienda Q5_K_M o superior.
- No se han publicado métricas de calidad perceptual (MOS) ni de inteligibilidad (WER) en la información disponible, lo que dificulta una evaluación objetiva previa al despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/ZONOS3-Mini-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero BF16: https://huggingface.co/prithivMLmods/ZONOS3-Mini-GGUF/blob/main/ZONOS3-Mini.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/ZONOS3-Mini-GGUF/blob/main/ZONOS3-Mini.Q4_K_M.gguf
- Fichero mmproj-bf16: https://huggingface.co/prithivMLmods/ZONOS3-Mini-GGUF/blob/main/ZONOS3-Mini.mmproj-bf16.gguf
