# linchaoying/Confucius4-TTS

## Resumen
Confucius4-TTS es un sistema de síntesis de voz (text-to-speech) zero-shot multilingüe y cross-lingual desarrollado por NetEase Youdao, distribuido en Hugging Face bajo el identificador `linchaoying/Confucius4-TTS`. Se basa en una arquitectura de codificador de voz más modelo de lenguaje grande (LLM), lo que le permite generar habla de alta calidad preservando la identidad del hablante a través de distintos idiomas. Su propuesta central es "una voz, cualquier idioma": clonar una voz a partir de audio de referencia sin transcripción y transferirla a 14 idiomas con acento nativo.

El modelo resuelve el problema de la clonación de voz cross-lingual robusta en escenarios reales, sin necesidad de entrenamiento adicional (zero-shot) ni de transcripción del audio de referencia (unconstrained voice cloning). Además de la identidad vocal, transfiere emoción. Soporta chino, inglés, japonés, coreano, alemán, francés, español, indonesio, italiano, tailandés, portugués, ruso, malayo y vietnamita.

Este repositorio concreto es una distribución agregada preparada para vLLM-Omni: empaqueta el modelo principal junto con sus dependencias de runtime (W2V-BERT 2.0, CAMPPlus y BigVGAN) en un único directorio de 11,5 GB, con licencia mixta Apache-2.0 y MIT. La ficha se basa exclusivamente en la model card y los metadatos disponibles; los detalles de arquitectura interna, entrenamiento y benchmarks no están publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de voz + LLM (speech encoder + large language model); incluye W2V-BERT 2.0, CAMPPlus y BigVGAN como componentes de runtime |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, id, it, th, pt, ru, ms, vi (14 idiomas) |
| Licencia | Mixta Apache-2.0 + MIT (licencia agregada; ningún texto único cubre todo el directorio) |
| Formato de pesos | safetensors (`t2s_model.safetensors`), PyTorch (`s2a_model.pt`), `wav2vec2bert_stats.pt`, `tokenizer.*`, directorios `pretrained/w2v-bert-2.0/`, `pretrained/campplus/` y `bigvgan/` |

## Arquitectura y entrenamiento
Confucius4-TTS sigue una arquitectura de codificador de voz más LLM: un codificador de voz (W2V-BERT 2.0) extrae representaciones del audio de referencia, un modelo de lenguaje genera los tokens de habla y un vocoder (BigVGAN) sintetiza la forma de onda final. CAMPPlus se emplea para el modelado de la identidad del hablante. El repositorio incluye además el fichero `s2a_model.pt` (probablemente el módulo speech-to-acoustic) y estadísticas de normalización (`wav2vec2bert_stats.pt`).

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las innovaciones declaradas por el autor son la clonación de voz sin transcripción de referencia, la transferencia cross-lingual sin acento en 14 idiomas, la clonación zero-shot y la transferencia de emoción. La distribución está pensada para vLLM-Omni y fija las revisiones upstream de cada componente con hashes verificables (`MODEL_PROVENANCE.json`, `SHA256SUMS`).

## Capacidades
- Síntesis de voz multilingüe en 14 idiomas: chino, inglés, japonés, coreano, alemán, francés, español, indonesio, italiano, tailandés, portugués, ruso, malayo y vietnamita.
- Clonación de voz zero-shot a partir de audio de referencia, sin entrenamiento adicional.
- Clonación de voz sin restricciones: no requiere la transcripción del audio de referencia.
- Transferencia cross-lingual de voz: mantiene la identidad del hablante al cambiar de idioma, con salida sin acento según el autor.
- Transferencia de emoción: replica el tono afectivo de la referencia, no solo el timbre.
- Generalización robusta declarada en escenarios multilingües del mundo real.
- Integración con vLLM-Omni mediante distribución agregada de dependencias.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso
- Doblaje y localización de contenido audiovisual: se clona la voz de un actor o narrador con un audio de referencia y se sintetiza el guion traducido en cualquiera de los 14 idiomas, manteniendo la identidad vocal y evitando el coste de regrabar con el actor original.
- Audiolibros y narración multilingüe: a partir de una muestra de voz del narrador se genera el texto completo en varios idiomas con la misma voz y la misma carga emocional, lo que permite producir ediciones localizadas de un mismo título.
- Asistentes de voz y atención al cliente: el modelo permite dotar a un asistente conversacional de una voz de marca consistente y expresiva, y atender a usuarios en su idioma nativo sin cambiar de hablante sintético.
- Accesibilidad y lectura en voz alta: conversión de documentos y contenidos web a audio con una voz personalizada clonada del propio usuario, útil para personas con discapacidad visual o dificultades de lectura, con soporte de varios idiomas.
- Creación de contenido para redes y pódcast: generación de locuciones con una voz propia clonada y cambio de idioma del mismo episodio, lo que reduce la fricción de publicar en mercados internacionales.
- Prototipado de interfaces de voz y videojuegos: generación rápida de diálogos de personajes con voces y emociones distintas en varios idiomas antes de contratar grabaciones definitivas, gracias a la clonación zero-shot sin transcripción.
- Investigación en habla multilingüe: uso del modelo como baseline para estudiar transferencia cross-lingual de identidad y emoción, con pesos y procedencia fijados por hashes para reproducibilidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 11,5 GB, por lo que se requiere al menos ese espacio en disco y, previsiblemente, una GPU con memoria suficiente para cargar los pesos en precisión nativa (cifra exacta no publicada).
- GPU recomendadas: no disponibles en la información proporcionada; el entorno declarado exige CUDA 12.6, compatible con GPUs NVIDIA modernas (serie A100, H100, RTX 40xx y superiores).
- ¿Cabe en GPU de consumo? No confirmado; dependerá de la cuantización, que no está documentada.
- Opciones de despliegue: vLLM-Omni (distribución preparada específicamente para este runtime), con script `example.py` y API Python (`confuciustts.cli.inference.ConfuciusTTS`) sobre PyTorch y torchaudio. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.10, CUDA 12.6, instalación vía `pip install -r requirements.txt` en un entorno conda.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, otros sistemas TTS zero-shot multilingües) que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia. Los datos de arquitectura y rendimiento de este modelo tampoco están publicados más allá de la descripción cualitativa del autor.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Confucius4-TTS | no disponible | no disponible | 14 | Apache-2.0 + MIT (mixta) | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Riesgo de uso indebido en suplantación de identidad: la clonación de voz puede reproducir la identidad y las características de habla de una persona. El autor exige consentimiento del hablante u otra base legal válida para usar audio de referencia, y prohíbe expresamente su uso para suplantación, fraude o acoso.
- Obligación de divulgación: debe indicarse claramente cuándo un audio es sintético, según las recomendaciones de uso responsable del autor.
- Licencia agregada compleja: ningún texto de licencia cubre todo el directorio. El modelo principal es Apache-2.0, W2V-BERT 2.0 y BigVGAN son MIT (con ficheros derivados de Apache-2.0) y CAMPPlus es Apache-2.0. Es necesario revisar `LICENSE`, `LICENSES/` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos derivados de los datos de entrenamiento, que tampoco se detallan.
- Alucinación y artefactos de audio: no se publican métricas de calidad (MOS, similitud de hablante, WER) que permitan acotar el riesgo de artefactos o pronunciación incorrecta.
- Cobertura lingüística limitada a 14 idiomas; el resto no está soportado.
- Dependencia de la calidad del audio de referencia: el resultado de la clonación depende de las condiciones acústicas de la muestra; no se documentan requisitos mínimos.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que no permite inferir validación por parte de la comunidad.
- Requisitos de entorno estrictos (Python 3.10, CUDA 12.6) que pueden complicar el despliegue en infraestructuras existentes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/linchaoying/Confucius4-TTS
- Modelo oficial en Hugging Face: https://huggingface.co/netease-youdao/Confucius4-TTS
- Repositorio de código en GitHub: https://github.com/netease-youdao/Confucius4-TTS
- Paper en arXiv: https://arxiv.org/abs/2608.11650
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/CharlesW/Confucius4-TTS
- Página de demo del proyecto: https://2901733926.github.io/Confucius4-TTS/
- Demo online de Youdao: https://confucius4-tts.youdao.com/gradio
- Modelo en ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-TTS
- Licencia agregada: https://huggingface.co/linchaoying/Confucius4-TTS/blob/main/LICENSE
