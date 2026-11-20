# netease-youdao/Confucius4-TTS

## Resumen

Confucius4-TTS es un sistema de síntesis de voz (text-to-speech) zero-shot, multilingüe y cross-lingual desarrollado por netease-youdao (NetEase Youdao). Se construye sobre una arquitectura de codificador de voz más modelo de lenguaje grande (LLM), lo que le permite generar habla de alta calidad preservando la identidad del hablante entre idiomas distintos. Su propuesta central es "una voz, cualquier idioma": clonar una voz a partir de un audio de referencia y sintetizar en cualquiera de los 14 idiomas soportados sin acento perceptible.

El modelo resuelve dos problemas clásicos en TTS: la dependencia de una transcripción de referencia para la clonación (aquí es "unconstrained", es decir, no requiere transcripción) y la degradación de la identidad vocal al cambiar de idioma. Con 3,1 GB de pesos en formato safetensors y licencia Apache 2.0, está pensado para despliegue e integración en producción sin restricciones comerciales.

Es relevante ahora porque combina clonación zero-shot, transferencia emocional y cobertura de 14 idiomas en un único motor de código abierto, con pipeline de fine-tuning documentado (T2S y S2A) y disponibilidad en Hugging Face y ModelScope. La ficha se basa en la model card y los metadatos públicos; los detalles de entrenamiento y benchmarks no están publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de voz + LLM (Text2Semantic + Semantic2Acoustic con flow-matching) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | zh, en, ja, ko, de, fr, id, vi, th, es, pt, it, ru, ms |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (t2s_model.safetensors); s2a_model.pt (PyTorch) |

## Arquitectura y entrenamiento

Confucius4-TTS sigue una arquitectura en dos etapas sobre un LLM. La primera, Text2Semantic (T2S), genera secuencias de tokens semánticos a partir del texto y del condicionamiento del hablante; la segunda, Semantic2Acoustic (S2A), es un modelo de flow-matching que convierte esos tokens semánticos en espectrogramas mel. Para el condicionamiento del hablante y la extracción de características semánticas se apoya en Wav2Vec2-BERT (facebook/w2v-bert-2.0), y para el códec semántico utiliza la implementación MaskGCT de Amphion. También se referencia un codificador de hablante CAMPPlus (campplus_cn_common.bin) en el pipeline de preparación.

El entrenamiento se organiza en torno a esos dos módulos, con datos en formato TSV que incluyen código de idioma, ruta del audio, texto normalizado, tokens semánticos preextraídos y rutas de audio de referencia. La model card no publica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Las innovaciones destacadas por el autor son la clonación sin transcripción de referencia, la transferencia cross-lingual sin acento y la transferencia emocional, junto con una generalización robusta en escenarios multilingües reales.

## Capacidades

- Síntesis de voz multilingüe en 14 idiomas: chino, inglés, japonés, coreano, alemán, francés, indonesio, vietnamita, tailandés, español, portugués, italiano, ruso y malayo.
- Clonación de voz zero-shot a partir de un audio de referencia, sin necesidad de transcripción del mismo (unconstrained voice cloning).
- Transferencia cross-lingual de voz: mantener la misma identidad vocal al cambiar de idioma, con salida sin acento según el autor.
- Transferencia emocional: replicar el tono y la expresividad de la referencia, no solo el timbre.
- Generación de habla natural y expresiva orientada a escenarios multilingües reales.
- Fine-tuning documentado de los módulos T2S y S2A para adaptación a dominios o voces propias.
- Interfaz de línea de comandos (`example.py`) y API de Python (`ConfuciusTTS.generate`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje y localización de contenido: clonar la voz de un actor o presentador una sola vez y generar la misma voz en los 14 idiomas soportados, reduciendo el coste frente a contratar voces por idioma.
- Audiolibros y narración multilingüe: sintetizar un mismo título en varios idiomas conservando el timbre del narrador original, con control de expresividad mediante la referencia emocional.
- Asistentes de voz y atención al cliente: generar respuestas habladas en el idioma del usuario manteniendo una voz de marca consistente; la clonación sin transcripción simplifica la incorporación de nuevas voces corporativas.
- Accesibilidad y lectura de contenido: convertir artículos, documentación o correos en audio con una voz personal clonada del propio usuario a partir de una muestra corta.
- E-learning y formación: producir cursos en varios idiomas con la voz del formador, preservando familiaridad y coherencia entre versiones lingüísticas.
- Videojuegos y personajes: asignar una voz a un personaje y reutilizarla en las distintas localizaciones del juego sin regrabar con actores por región.
- Prototipado de productos de voz: integrar la API de Python en pipelines de generación de audio para pruebas rápidas de UX conversacional antes de invertir en voces comerciales.
- Investigación en TTS: usar los checkpoints y el pipeline de fine-tuning (T2S/S2A) como base para experimentos de clonación, transferencia emocional y síntesis cross-lingual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 3,1 GB e incluye pesos en safetensors y PyTorch, por lo que se requiere una GPU con memoria suficiente para cargar ambos módulos (T2S y S2A) más el codificador Wav2Vec2-BERT; el valor concreto no está publicado.
- GPU recomendadas: no disponibles en la información proporcionada. El entorno documentado exige CUDA 12.6 y Python 3.10.
- Compatibilidad con GPU de consumo: no confirmada; no se indica qué modelos consumer (RTX 4090, etc.) son suficientes.
- Opciones de despliegue: inferencia vía script `example.py` y API de Python del paquete `confuciustts`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se publican detalles sobre sesgos demográficos, acentos o calidad diferencial entre los 14 idiomas; el rendimiento puede variar según el par de idiomas y la calidad de la referencia.
- Riesgo de alucinación y artefactos propio de los sistemas TTS basados en LLM: posibles errores de pronunciación, prosodia o contenido en textos ambiguos o fuera de dominio.
- La clonación de voz sin transcripción de referencia plantea riesgos de suplantación y uso indebido; es responsabilidad del integrador aplicar consentimiento y controles.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes externos referenciados (Wav2Vec2-BERT, Amphion/MaskGCT, CAMPPlus) antes de distribuir un producto.
- No se documentan límites de longitud de texto por petición ni de duración de la referencia; deben validarse empíricamente.
- El pipeline de fine-tuning requiere descargar modelos externos y preparar datos en un formato TSV específico, lo que añade complejidad operativa.
- No hay información sobre cuantizaciones oficiales ni sobre despliegue en CPU con latencia aceptable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netease-youdao/Confucius4-TTS
- Paper (arXiv): https://arxiv.org/abs/2608.11650
- Repositorio de código: https://github.com/netease-youdao/Confucius4-TTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/CharlesW/Confucius4-TTS
- Página de demo del proyecto: https://2901733926.github.io/Confucius4-TTS/
- Modelo en ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-TTS
- Wav2Vec2-BERT (dependencia): https://huggingface.co/facebook/w2v-bert-2.0
- Amphion / MaskGCT (dependencia): https://github.com/open-mmlab/Amphion
