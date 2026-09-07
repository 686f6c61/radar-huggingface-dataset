# iniquitous/indic-speak-mlx-6bit

## Resumen

`indic-speak-mlx-6bit` es una conversión comunitaria a formato MLX (6 bits) del modelo de text-to-speech Indic-Speak, desarrollado por Bodhan AI / AI4Bharat en el IIT Madras. No es una versión oficial de Bodhan AI; es una adaptación publicada por el usuario `iniquitous` para ejecutarse en hardware de Apple Silicon. El modelo original está basado en Llama 3.2 3B y es capaz de generar voz natural para 22 idiomas indios y el inglés (23 en total), con voces masculinas y femeninas por idioma.

Esta conversión reduce el tamaño de los pesos del modelo de lenguaje a 2,5 GB mediante cuantización de 6 bits (6,5 bits por peso), lo que lo hace viable en Macs con memoria unificada. El paquete incluye un sintetizador MLX con streaming y segmentación por frases, además del decodificador Vocos y el cuantizador SNAC. Su relevancia radica en ofrecer TTS multilingüe en idiomas indios y ejecutable localmente sin servicios en la nube, aprovechando el ecosistema MLX.

El modelo conserva la arquitectura de Indic-Speak: un LM de voz basado en Llama 3.2 3B, un cuantizador SNAC y un decodificador Vocos afinado. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama 3.2 3B (LM de voz) + cuantizador SNAC + decodificador Vocos |
| Parametros totales | 3.300.928.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 6-bit (grupo 64, 6,5 bits/peso); variantes 4-bit, 8-bit, mixed y bf16 en el mismo autor |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd |
| Licencia | Indic Open Model License v1.0 (Bodhan AI / AI4Bharat); sujeto además a la Llama 3.2 Community License |
| Formato de pesos | safetensors (MLX), tokenizer y decodificador Vocos |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Indic-Speak: un modelo de lenguaje de voz construido sobre Llama 3.2 3B que genera códigos acústicos discretos a partir de texto y condiciones de hablante y estilo. Estos códigos son cuantizados mediante SNAC (un cuantizador de 24 kHz) y finalmente convertidos a forma de onda por un decodificador Vocos afinado por Bodhan AI. El LM de voz se entrenó en datos de 22 idiomas indios y el inglés; los detalles de composición del dataset no se incluyen en la información proporcionada.

La conversión MLX aplica cuantización de 6 bits con grupo de tamaño 64. Se incluye un parche de configuración de RoPE necesario para que mlx-lm lea correctamente los parámetros de Llama 3.2 (transformers v5 los escribe bajo `rope_parameters` y mlx-lm espera `rope_theta` y `rope_scaling`). Sin este parche, la generación se vuelve inestable. El sintetizador `tts_mlx.py` añade streaming con anticipación de 4 frames, y las funciones `speak_long` y `stream_long` dividen el texto en frases para evitar paradas tempranas.

## Capacidades

- Generación de voz natural para 23 idiomas (22 indios + inglés).
- Dos voces por idioma: una femenina y una masculina (por ejemplo, Kavya/Amit en hindi, Anitha/Arun en tamil).
- Cualquier voz puede hablar cualquier idioma.
- Soporte de etiquetas de estilo emocional en mayúsculas (ANGER, HAPPY, SAD, FEAR, etc.).
- Acepta frases de texto libre como indicación de estilo, aunque las etiquetas en minúsculas son menos fiables.
- Generación de audio en streaming por chunks (~0,7 s) mientras el modelo sigue generando.
- Segmentación automática de textos largos en frases (habla larga y streaming).
- Sintetizador compatible con MLX y Apple Silicon; el cuantizador SNAC y el decodificador Vocos usan PyTorch/MPS.
- El token de control de voz y el contrato de tokens están documentados en el repositorio.

## Casos de uso

- Narración de audiolibros: se puede pasar un capítulo completo a `speak_long` y obtener audio por frases para 22 idiomas indios, con voces consistentes y control de estilo emocional.
- Asistencia de voz en aplicaciones móviles: el modelo se ejecuta en un Mac con Apple Silicon, pero los desarrolladores pueden usarlo como servidor local de síntesis para aplicaciones de accesibilidad o asistentes en hindi, tamil, bengalí, etc.
- Generación de contenido educativo: profesores o creadores de vídeo pueden producir locuciones en varios idiomas indios sin depender de servicios en la nube, manteniendo el control sobre la voz y el estilo.
- Prototipado de sistemas de respuesta de voz interactiva (IVR): el soporte de streaming permite generar respuestas en tiempo real para sistemas de atención al cliente en idiomas regionales.
- Aplicaciones de accesibilidad para personas con discapacidad visual: se puede integrar en lectores de pantalla para leer noticias o documentos en idiomas como el oriya, el asamés o el mni.
- Investigación en TTS multilingüe: la conversión MLX permite comparar la calidad de cuantización (4-bit, 6-bit, 8-bit) en un mismo modelo, sin necesidad de GPUs CUDA, usando solo hardware de Apple.
- Generación de voz para videojuegos o animaciones: las etiquetas emocionales en mayúsculas permiten variar la entonación (alegría, enfado, tristeza) para diálogos cortos en idiomas indios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, MOS, MMLU, HumanEval, etc.) en la información disponible. El README del autor solo reporta una velocidad de decodificación de ~47 tokens/s en un M3 Max con 36 GB de RAM, en una única stream y sin throttling térmico. La calidad se evaluó de forma informal en hindi mediante estadísticas de duración y silencio, no con métricas estándar.

## Requisitos de hardware

- VRAM estimada: el peso del LM en 6 bits ocupa 2,5 GB; el repositorio completo pesa 3,2 GB. En Apple Silicon se usa memoria unificada.
- GPU recomendada: Apple Silicon (probado en M3 Max con 36 GB). No hay soporte CUDA; se requiere MLX y PyTorch/MPS para los componentes de audio.
- No es apto para GPU convencionales de consumo (RTX 4090, etc.) porque la biblioteca de inferencia es MLX, exclusiva de Apple.
- Opciones de despliegue: se usa `mlx-lm` para cargar los pesos y `tts_mlx.py` para la síntesis. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~47 tokens/s en M3 Max (single stream), con una caída del 25 % cuando el chip se calienta y reduce la frecuencia.

## Comparativa con modelos similares

| Variante | Precisión | Peso del LM | Velocidad (M3 Max) | Notas |
|---|---|---|---|---|
| indic-speak-mlx-4bit | 4-bit | Menor que 6-bit | Más rápida | Utiliza kernels rápidos para 4 bits |
| indic-speak-mlx-6bit | 6-bit (grupo 64) | 2,5 GB | ~47 tok/s | Más lenta que 4-bit por falta de kernels rápidos; se mantiene por calidad |
| indic-speak-mlx-8bit | 8-bit | Mayor | Más lenta | Mayor calidad, mayor consumo |
| indic-speak-mlx-mixed | Mixta | Variable | Variable | Combinación de precisiones |
| indic-speak-mlx-bf16 | bf16 | Mayor | La más lenta | Representación original en coma flotante |
| bodhan-ai/indic-speak (upstream) | No cuantizado | Original | N/A | Modelo de referencia, no MLX |

No se dispone de datos de comparación con otros modelos TTS como VITS, Coqui TTS o XTTS en la información proporcionada.

## Limitaciones y advertencias

- La conversión 6-bit es más lenta que la 4-bit en mlx-lm 0.31 porque no hay kernels optimizados para 6 bits; se mantiene únicamente por comparación de calidad.
- Las variantes cuantizadas tienden a detenerse antes de tiempo o a derivar en textos largos de varias frases; se recomienda usar `speak_long` o `stream_long`.
- Las etiquetas de estilo en minúsculas (como "educational lecture") son menos fiables que las mayúsculas.
- El parche de RoPE es imprescindible: si se convierte el modelo upstream sin copiar `rope_parameters` a `rope_theta` y `rope_scaling`, la generación se vuelve inestable (paradas aleatorias, silencio, variaciones de duración de 2 a 4 veces).
- La calidad se comprobó solo en hindi mediante estadísticas de duración y silencio y escucha informal, sin evaluaciones formales de WER o MOS.
- La licencia Indic Open Model License v1.0 exige atribución, propagar la misma licencia en derivados y obtener aprobación escrita de Bodhan AI para alojar el modelo como servicio para terceros.
- El modelo upstream está construido sobre Llama 3.2 y hereda las condiciones de la Llama 3.2 Community License, lo que puede añadir restricciones adicionales.
- No es una versión oficial de Bodhan AI; es una adaptación de la comunidad. El autor original es el responsable del modelo, no el conversor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iniquitous/indic-speak-mlx-6bit
- Modelo upstream: https://huggingface.co/bodhan-ai/indic-speak
- Variante 4-bit: https://huggingface.co/iniquitous/indic-speak-mlx-4bit
- Variante 8-bit: https://huggingface.co/iniquitous/indic-speak-mlx-8bit
- Variante mixed: https://huggingface.co/iniquitous/indic-speak-mlx-mixed
- Variante bf16: https://huggingface.co/iniquitous/indic-speak-mlx-bf16
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
