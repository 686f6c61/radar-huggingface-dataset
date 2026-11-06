# AEmotionStudio/ming-tts-models

## Resumen

Ming-3.0-tts es una familia de modelos de síntesis de voz (text-to-speech) desarrollada por inclusionAI, distribuida en dos variantes: un modelo denso de 0,5B parámetros construido sobre un backbone Qwen2.5-0.5B, y una variante "tiny" basada en una arquitectura Mixture-of-Experts (Ling-V3 MoE) con 7,9B parámetros totales y 1,3B activos. El repositorio analizado, publicado por AEmotionStudio, es un espejo byte a byte de los checkpoints originales, preparado para su uso en la estación de trabajo de IA Mæstræa (sección AI ▸ Voice ▸ Ming TTS). No introduce cambios en los pesos ni relicencia el material.

El modelo resuelve dos tareas principales dentro del pipeline de TTS: clonación de voz (voice cloning) a partir de una muestra de referencia, y diseño de voz (voice design) mediante voces integradas. Incorpora un encoder de hablante CAM++ (campplus.onnx) para la extracción de embeddings de timbre, un cabezal de flujo DiT y un VAE de audio para la generación de la forma de onda. Soporta siete idiomas: chino, inglés, japonés, coreano, alemán, francés y español.

La relevancia de este espejo es operativa: facilita el despliegue reproducible de los checkpoints en un runtime propio que corrige la máscara de decodificación, usa transformers más recientes, aplica CUDA graphs a los cabezales de muestreo y añade una caché de expertos en GPU que permite ejecutar la variante MoE de 7,9B en tarjetas de 12 GB de VRAM. La licencia MIT tanto del código como de los pesos facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | 0.5B: transformer denso (backbone Qwen2.5-0.5B) + cabezal de flujo DiT + VAE de audio. Tiny: Ling-V3 MoE (7,9B totales, 1,3B activos) |
| Parámetros totales | 0,5B (variante 0.5b); 7,9B (variante tiny) |
| Parámetros activos | 1,3B (solo variante tiny, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 en los pesos publicados; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | zh, en, ja, ko, de, fr, es |
| Licencia | MIT (© 2025 inclusionAI) |
| Formato de pesos | safetensors (bf16), ONNX (encoder de hablante CAM++), tokenizer y gramáticas FST de normalización de texto |

## Arquitectura y entrenamiento

La variante 0.5b combina un backbone de lenguaje Qwen2.5-0.5B con un cabezal de generación basado en flow matching (DiT) y un VAE de audio que convierte las representaciones latentes en forma de onda. La variante tiny emplea una arquitectura Mixture-of-Experts denominada Ling-V3, con 7,9B parámetros totales de los que solo 1,3B se activan por token, distribuida en 30 shards en bf16. Ambas variantes incorporan un encoder de hablante CAM++ (formato ONNX) para condicionar la síntesis al timbre de una referencia, lo que habilita la clonación de voz.

El pipeline de la variante 0.5b carga cuatro gramáticas FST de normalización de texto para chino e inglés, procedentes del directorio `frontend/talker_tn/` del repositorio upstream. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. El espejo no incluye los ficheros `.py` de código remoto del upstream: el runtime de Mæstræa incorpora su propia implementación de inferencia y no carga código remoto.

## Capacidades

- Síntesis de voz (text-to-speech) en siete idiomas: chino, inglés, japonés, coreano, alemán, francés y español.
- Clonación de voz a partir de una muestra de referencia, mediante el encoder de hablante CAM++.
- Diseño de voz (voice design) con voces integradas; el runtime de Mæstræa limita la lista a las voces de estudio originales y no ofrece las voces de personajes y actores del catálogo upstream.
- Normalización de texto para chino e inglés mediante gramáticas FST en la variante 0.5b.
- Dos perfiles de despliegue según recursos: modelo denso de 0,5B para entornos ajustados y MoE de 7,9B con 1,3B activos para mayor calidad.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para doblaje y localización: el modelo genera habla en el idioma de destino preservando el timbre de una referencia, lo que permite adaptar contenido audiovisual a los siete idiomas soportados sin regrabar con el actor original.
- Audiolibros y narración automatizada: la variante tiny, con 1,3B parámetros activos, ofrece un equilibrio entre calidad y coste computacional adecuado para generar horas de audio por lotes.
- Asistentes de voz integrados en aplicaciones de escritorio: el espejo está empaquetado para la estación Mæstræa (AI ▸ Voice ▸ Ming TTS), lo que simplifica el despliegue local en un flujo de trabajo de escritorio.
- Generación de voces sintéticas para prototipado de productos: el modo voice design permite crear locuciones de prueba sin disponer de grabaciones de referencia.
- Accesibilidad: conversión de texto a voz en español, alemán, francés e inglés para lectores de pantalla y herramientas de asistencia, con la licencia MIT como ventaja para su integración en software libre.
- Despliegue en hardware de gama media: la caché de expertos en GPU del runtime permite ejecutar la variante MoE de 7,9B en tarjetas de 12 GB, habilitando TTS de mayor calidad en estaciones de trabajo sin GPUs de datacenter.
- Investigación en síntesis de voz: los checkpoints íntegros y verificables por SHA-256 facilitan la reproducibilidad de experimentos y la comparación de variantes densa y MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la variante 0.5b en bf16 requiere aproximadamente 1 GB para los pesos, más el VAE de audio, el encoder CAM++ y las activaciones; cabe holgadamente en GPUs de consumo. La variante tiny (7,9B en bf16) ocupa del orden de 16 GB en pesos completos, pero el runtime de Mæstræa pagina los expertos enrutados y permite ejecutarla en tarjetas de 12 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, la variante 0.5b es apta para cualquier GPU de consumo moderna; la variante tiny se beneficia de GPUs con al menos 12 GB de VRAM.
- Cabe en GPU de consumo: sí, ambas variantes según el runtime descrito; la tiny requiere la caché de expertos en GPU para tarjetas de 12 GB.
- Opciones de despliegue: runtime propio de Mæstræa (transformers recientes, corrección de máscara de decodificación, CUDA graphs en los cabezales de muestreo). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts 0.5b | 0,5B denso | 7 | MIT | safetensors, ONNX | Backbone Qwen2.5 + DiT + VAE; clonación y diseño de voz |
| Ming-3.0-tts tiny | 7,9B totales / 1,3B activos | 7 | MIT | safetensors, ONNX | MoE Ling-V3; mayor capacidad con coste de inferencia reducido |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Uso ético de la clonación: la nota de uso del upstream exige emplear la clonación de voz y las voces integradas solo con fines de investigación y creativos legítimos, no suplantar a personas reales sin consentimiento y etiquetar el habla sintética cuando pueda confundirse con una grabación real.
- Sesgos: no se documentan análisis de sesgo lingüístico, de género o de acento en la información disponible; la cobertura de los siete idiomas puede ser desigual al no conocerse la composición del corpus de entrenamiento.
- Alucinación y artefactos: no hay datos publicados sobre tasas de error de pronunciación, prosodia o artefactos en textos fuera de dominio.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la nota de uso ético del upstream debe respetarse; el espejo no relicencia nada y atribuye la titularidad a inclusionAI.
- Limitaciones del espejo: no incluye los ficheros `.py` de código remoto del upstream, por lo que no puede ejecutarse con `trust_remote_code` sobre este repositorio; requiere el runtime de Mæstræa o una implementación propia de inferencia.
- Catálogo de voces reducido: el runtime de Mæstræa solo ofrece las voces de estudio originales, no las voces de personajes y actores del catálogo upstream.
- Longitud de contexto: no disponible, lo que impide planificar la síntesis de textos largos sin segmentación previa.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que limita la validación comunitaria del espejo.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/AEmotionStudio/ming-tts-models
- Modelo original 0.5B: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Modelo original tiny: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio de código upstream: https://github.com/inclusionAI/Ming-3.0-tts
- Estación de trabajo Mæstræa: https://github.com/AEmotionStudio
