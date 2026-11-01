# mradermacher/Climate-1000-Qwen-27b-GGUF

## Resumen

Climate-1000-Qwen-27b-GGUF es el repositorio de cuantizaciones GGUF, creado por mradermacher, del modelo Climate-1000-Qwen-27b de Prience91. Se trata de un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 27 mil millones), etiquetado con las categorías "climate", "sft" y "merged", lo que indica que es un modelo ajustado por SFT (supervised fine-tuning) sobre una base Qwen, fusionado a partir de varios pesos, y especializado en el dominio climático. El modelo base está entrenado en inglés y se publica bajo licencia Apache 2.0.

La relevancia de esta ficha radica en el repositorio de cuantizaciones en sí: mradermacher es un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones estáticas GGUF de modelos populares, permitiendo ejecutar modelos de gran tamaño en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otras herramientas compatibles con el formato GGUF. En este caso se ofrecen once cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), además del original en f16.

El modelo es interesante para desarrolladores e investigadores que necesiten un modelo conversacional especializado en clima y meteorología que pueda ejecutarse localmente, con un equilibrio razonable entre tamaño (27B) y calidad, y sin restricciones de licencia para uso comercial gracias a Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen), no disponible el detalle exacto |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (original) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, Prience91/Climate-1000-Qwen-27b, es un modelo de ~27B parámetros construido sobre la familia Qwen. Las etiquetas "sft" y "merged" indican que se ha aplicado un ajuste fino supervisado (SFT) y que el resultado proviene de una fusión de pesos (model merging), una técnica que combina varios modelos ajustados para obtener un modelo final que hereda capacidades de todos ellos. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

Este repositorio no modifica el modelo: contiene únicamente cuantizaciones estáticas GGUF generadas por mradermacher a partir de los pesos originales en f16, usando conversión de tipo "hf". El cuantizador indica que las cuantizaciones weighted/imatrix no están disponibles por el momento, y que pueden solicitarse mediante una Community Discussion en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés (etiquetado como "conversational").
- Especialización en el dominio climático (etiqueta "climate"), presumiblemente afinado para consultas sobre meteorología y clima, aunque la model card no detalla el alcance exacto.
- Ejecución local mediante el formato GGUF en llama.cpp, Ollama, LM Studio, GPT4All y herramientas similares.
- No hay información disponible sobre soporte de tool calling, function calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente conversacional sobre clima y meteorología: dado el ajuste en el dominio climático, puede emplearse como chatbot especializado para responder preguntas sobre fenómenos meteorológicos, conceptos climáticos y terminología asociada, en inglés.
- Ejecución local en estaciones de trabajo: gracias a la cuantización Q4_K_M (16,6 GB), el modelo cabe en una GPU de consumo con 24 GB de VRAM, útil para entornos sin conexión a internet o con requisitos de privacidad.
- Experimentación con modelos fusionados: al tratarse de un modelo "merged" con SFT, resulta útil para investigadores que estudian el efecto del model merging sobre bases Qwen en dominios verticales.
- Integración en aplicaciones con llama.cpp: los archivos GGUF pueden integrarse en backends de aplicaciones mediante llama-cpp-python o bindings similares para ofrecer capacidades conversacionales sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: con once niveles de cuantización disponibles, es un buen banco de pruebas para medir la degradación de calidad entre Q2_K y Q8_0 en un modelo de 27B.
- Prototipado de asistentes verticales: puede servir como punto de partida para desarrollar asistentes sectoriales (energía, agricultura, seguros climáticos) que necesiten un modelo base con afinidad al vocabulario meteorológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas: para Q4_K_M y superiores, una RTX 3090 o RTX 4090 (24 GB) es el punto de partida; para Q8_0, una RTX 4090 con descarga parcial a RAM, o GPUs profesionales como A100 40 GB/80 GB para rendimiento completo.
- Consumer GPUs: sí, las cuantizaciones hasta Q6_K (~22,2 GB) caben íntegramente en una RTX 3090/4090 de 24 GB; las cuantizaciones Q3 y Q4 caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080); Q2_K (~10,8 GB) cabe incluso en GPUs de 12 GB.
- CPU/MAC: al ser GGUF, también es ejecutable en CPU puro o en Apple Silicon con memoria unificada (un Mac con 32 GB o más puede ejecutar cómodamente Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, koboldcpp y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM/TGI, que requieren pesos safetensors del modelo original.
- Latencia y throughput: no disponible; en general, las cuantizaciones Q4 en GPU de gama alta ofrecen velocidades de decodificación del orden de decenas de tokens por segundo en modelos de este tamaño, pero no hay cifras oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| Climate-1000-Qwen-27b (este) | ~27B | GGUF (11 cuants) | Apache 2.0 | Clima (SFT + merge) |
| Qwen2.5-32B-Instruct | 32B | safetensors, GGUF comunitarios | Apache 2.0 | Generalista, multilingue |
| Gemma 2 27B | 27B | safetensors, GGUF comunitarios | Gemma license (restricciones) | Generalista |

Comparación cualitativa: frente a Qwen2.5-32B-Instruct, este modelo es más pequeño y está especializado en clima, pero carece de documentación pública de benchmarks y de soporte multilingüe amplio. Frente a Gemma 2 27B, ofrece una licencia más permisiva (Apache 2.0 frente a la licencia Gemma con restricciones de uso), aunque Gemma cuenta con un ecosistema de evaluación y documentación mucho más maduro. Para cargas generales, los modelos generalistas suelen ser más robustos; para consultas del dominio climático, el ajuste específico puede aportar ventaja, aunque no hay benchmarks que lo cuantifiquen.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; no hay soporte documentado para castellano ni otros idiomas, por lo que el rendimiento en español es incierto y probablemente degradado.
- Sesgos: no disponible; al derivar de una base Qwen y de un proceso de fusión, puede heredar los sesgos de los modelos originales, pero no hay documentación específica.
- Alucinaciones: como todo LLM, puede generar información meteorológica o climática incorrecta con apariencia plausible; no debe usarse como fuente autorizada para decisiones operativas (aviación, agricultura, gestión de emergencias) sin verificación con fuentes meteorológicas oficiales.
- Contexto: la longitud de ventana de contexto no está documentada en este repositorio; consúltala en la model card del modelo base antes de planificar cargas con documentos largos.
- Cuantización: las cuantizaciones disponibles son estáticas (no imatrix/weighted), por lo que las versiones bajas (Q2_K, Q3) pueden sufrir degradación notable de calidad; el propio cuantizador recomienda Q4_K_S/Q4_K_M como equilibrio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los modelos base que componen la fusión en el repositorio de Prience91.
- Documentación escasa: la model card del cuantizador no describe las capacidades, datos de entrenamiento ni evaluaciones del modelo base; se recomienda revisar el repositorio original antes de uso en producción.
- Repositorio de gran tamaño: 186,3 GB en total; descarga solo los archivos de cuantización que necesites.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/Climate-1000-Qwen-27b-GGUF
- Modelo base: https://huggingface.co/Prience91/Climate-1000-Qwen-27b
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Climate-1000-Qwen-27b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
