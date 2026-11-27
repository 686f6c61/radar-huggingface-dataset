# engenho-ai/KuroVoice-PTBR

## Resumen

KuroVoice-PTBR es un modelo de síntesis de voz (text-to-speech) publicado por engenho-ai en Hugging Face. Se trata de un fine-tuning del modelo Kokoro-82M de hexgrad, que a su vez se basa arquitectónicamente en StyleTTS 2 con decodificador ISTFTNet. El modelo cuenta con 82 millones de parámetros, una cifra reducida que lo sitúa en la categoría de TTS ligero, pensado para despliegues con requisitos de cómputo modestos.

El problema que resuelve es la generación de audio hablado de calidad a partir de texto, con un coste computacional bajo y licencia permisiva (Apache 2.0), lo que permite su uso comercial y su integración en productos sin restricciones de licencia. La relevancia actual del modelo radica en que los TTS ligeros con licencia abierta están habilitando despliegues en producción a precios muy competitivos (inferiores a 1 dólar por millón de caracteres según datos del modelo base).

No obstante, existe una discrepancia importante en la información disponible: el identificador del modelo y su nombre sugieren un enfoque hacia portugués de Brasil (PTBR), pero la model card y los metadatos de Hugging Face declaran únicamente el idioma inglés (`en`). Esta ficha refleja esa contradicción de forma explícita. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con decodificador ISTFTNet (solo decodificador, sin difusión ni encoder publicado) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés según metadatos y model card; el nombre del modelo sugiere portugués de Brasil, pero no está declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada |

## Arquitectura y entrenamiento

La arquitectura subyacente es StyleTTS 2, descrita en el paper arXiv:2306.07691, combinada con el decodificador ISTFTNet del paper arXiv:2203.02395. Según la model card del modelo base, se trata de una arquitectura de solo decodificador, sin componente de difusión y sin encoder liberado. El modelo base Kokoro fue diseñado por Li et al. (repositorio yl4579/StyleTTS2) y entrenado por el usuario @rzvzn.

Los detalles de entrenamiento específicos de KuroVoice-PTBR no están disponibles en la información proporcionada. Para el modelo base Kokoro se documenta un entrenamiento sobre unos cientos de horas de audio con licencias permisivas (dominio público, Apache, MIT y audio sintético de proveedores cerrados), con un coste aproximado de 1000 dólares en 1000 horas de GPU A100 de 80 GB. No se especifica si KuroVoice-PTBR realizó un fine-tuning adicional sobre datos en portugués ni qué volumen de datos empleó. Tampoco se documentan fases de RLHF o DPO, algo esperable en un modelo TTS de esta naturaleza.

## Capacidades

- Síntesis de voz a partir de texto (pipeline text-to-speech), con salida de audio a 24 kHz según el ejemplo de uso del modelo base.
- Generación de audio con etiquetas de fonemas IPA como entrada intermedia, gestionadas por la librería misaki (G2P).
- Soporte de múltiples voces en el modelo base (54 voces en 8 idiomas para Kokoro v1.0); no se confirma qué voces incluye este fine-tuning.
- Capacidad multilingüe no confirmada para este modelo concreto: los metadatos declaran solo inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión, por no ser propias de un modelo TTS.

## Casos de uso

- Lectura de artículos y documentos: el modelo puede convertir texto en audio narrado para aplicaciones de accesibilidad o consumo de contenido, gracias a su reducido tamaño que permite inferencia en CPU o GPU modesta.
- Asistentes de voz embebidos: con 82 millones de parámetros, es viable integrarlo en dispositivos con recursos limitados para respuestas habladas en tiempo real.
- Generación de audio para vídeos y pódcast: producción de narraciones sintéticas a bajo coste, con licencia Apache 2.0 que permite uso comercial sin restricciones.
- Pruebas de concepto y prototipado de interfaces conversacionales: el bajo coste de despliegue (inferior a 1 dólar por millón de caracteres en el modelo base según datos de mercado) facilita iterar en entornos de desarrollo.
- Localización de contenido en portugués de Brasil: si el fine-tuning cumple lo que sugiere su nombre, podría emplearse para doblaje o narración en PTBR, aunque esta capacidad no está confirmada en la documentación.
- Investigación en TTS: sirve como punto de partida para experimentos de fine-tuning sobre StyleTTS 2 en nuevos idiomas o estilos, dado su tamaño manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 82 millones de parámetros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el modelo base se entrenó en A100 de 80 GB, pero para inferencia basta con GPUs consumer; no se especifican modelos concretos en la documentación.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se detallan requisitos exactos.
- Opciones de despliegue: el modelo base se usa mediante el paquete `kokoro` (pip) junto con `soundfile` y `espeak-ng`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| KuroVoice-PTBR | 82 M | inglés declarado (nombre sugiere PTBR) | Apache 2.0 | Fine-tuning de Kokoro-82M |
| Kokoro-82M (hexgrad) | 82 M | 8 idiomas, 54 voces | Apache 2.0 | Modelo base, ampliamente desplegado |
| StyleTTS 2 (yl4579) | no disponible | inglés (LJSpeech) | no disponible | Arquitectura original |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de idioma: el nombre del modelo indica PTBR, pero los metadatos y la model card declaran únicamente inglés; conviene verificar el comportamiento real antes de usarlo en producción para portugués.
- Riesgo de alucinación en la pronunciación: como todo TTS, puede generar prosodia o fonemas incorrectos en textos fuera de dominio.
- Sesgos: no documentados; el modelo base se entrenó con audio de licencias permisivas, lo que puede limitar la diversidad de voces y acentos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución correspondiente.
- Caveats de producción: no se documentan cuantizaciones ni formatos de pesos, lo que dificulta planificar el despliegue; el repositorio no registra descargas ni validación comunitaria.
- Advertencia de la model card del modelo base sobre sitios web no afiliados que usan el nombre "kokoro"; no aplica directamente a este fine-tuning, pero conviene verificar la procedencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/engenho-ai/KuroVoice-PTBR
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub de Kokoro: https://github.com/hexgrad/kokoro
- Demo de Kokoro: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Paper StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper ISTFTNet: https://arxiv.org/abs/2203.02395
- Repositorio StyleTTS2: https://github.com/yl4579/StyleTTS2
- Librería misaki (G2P): https://github.com/hexgrad/misaki
- Servidor Discord de Kokoro: https://discord.gg/QuGxSWBfQy
