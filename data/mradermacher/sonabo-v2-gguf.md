# mradermacher/sonabo-v2-GGUF

## Resumen

Sonabo v2 GGUF es la versión cuantizada del modelo Sonabo v1, un sistema de síntesis de voz (text-to-speech) especializado en armenio oriental desarrollado originalmente por davitlive5. Esta variante GGUF ha sido generada por mradermacher para facilitar su despliegue en entornos con recursos limitados mediante herramientas compatibles con el formato GGUF, como llama.cpp u Ollama. El modelo está construido sobre la arquitectura Qwen3-TTS, según indican las etiquetas del repositorio, y cuenta con aproximadamente 602 millones de parámetros.

El modelo resuelve el problema de la síntesis de voz de calidad para el armenio oriental, un idioma con escasa representación en el ecosistema de modelos TTS open source. Incorpora capacidades de clonación de voz y streaming, lo que lo hace adecuado tanto para aplicaciones de lectura por voz como para asistentes conversacionales en tiempo real. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

La relevancia actual radica en la disponibilidad de cuantizaciones que van desde 0,3 GB (Q2_K) hasta 1,3 GB (f16), lo que permite ejecutar el modelo en hardware de consumo. El repositorio incluye además ficheros mmproj (multi-modal supplement), lo que sugiere la posibilidad de entrada multimodal, aunque la model card no detalla esta funcionalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer para text-to-speech) |
| Parametros totales | 602.341.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | armenio (hy), armenio oriental |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS, un transformer diseñado específicamente para síntesis de voz. Según las etiquetas del repositorio, el modelo soporta clonación de voz y streaming, lo que implica que la arquitectura está optimizada para generar audio de forma incremental. El modelo base es davitlive5/sonabo-v1, del cual esta versión es una cuantización estática en formato GGUF realizada por mradermacher.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos de audio o si se aplicaron técnicas de RLHF o DPO. La model card del repositorio cuantizado no incluye estos detalles, y únicamente referencia al modelo base. Tampoco se documentan innovaciones técnicas específicas más allá de las capacidades de streaming y clonación de voz implícitas en las etiquetas.

## Capacidades

- Síntesis de voz (text-to-speech) en armenio oriental.
- Clonación de voz: permite replicar características vocales a partir de muestras de referencia.
- Streaming: generación de audio de forma incremental, adecuada para aplicaciones en tiempo real.
- Entrada multimodal: la presencia de ficheros mmproj sugiere soporte para entrada multimodal, aunque no se detalla en la model card.
- Compatible con endpoints: la etiqueta endpoints_compatible indica integración con infraestructuras de inferencia estándar.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- Lectura por voz de contenidos en armenio oriental: el modelo puede convertir artículos, libros o documentación a audio, aprovechando su especialización en el idioma y su licencia permisiva para integrarse en plataformas editoriales.
- Asistentes de voz para atención al cliente: con soporte de streaming, puede generar respuestas habladas en tiempo real en sistemas de IVR o chatbots telefónicos dirigidos a usuarios armenios.
- Clonación de voz para doblaje y localización: permite generar voces sintéticas que imitan a un locutor de referencia, útil en producción audiovisual para doblar contenido al armenio oriental.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual que consuman contenido en armenio, desplegable en dispositivos de consumo gracias a las cuantizaciones de 0,3-0,5 GB.
- Generación de audiolibros: el modelo puede narrar textos largos con una voz consistente, y su tamaño reducido permite procesar grandes volúmenes en servidores modestos.
- Prototipado de aplicaciones de voz en investigación: investigadores que trabajen en TTS para lenguas de bajos recursos pueden usar el modelo como base o referencia, con la ventaja de la licencia Apache 2.0 y el formato GGUF para experimentación rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K) y 1,3 GB (f16) para los pesos, más overhead de contexto y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, prácticamente cualquier GPU moderna, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sonabo v2 GGUF | 602 M | no disponible | armenio (hy) | Apache 2.0 | GGUF |
| Sonabo v1 (base) | 602 M | no disponible | armenio (hy) | Apache 2.0 | safetensors |
| Otros TTS multilingües open source | no disponible | no disponible | varios | variable | variable |

No se dispone de información sobre modelos comparables específicos para TTS en armenio oriental en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en armenio oriental; no soporta otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos limitados de un idioma de bajos recursos, es probable que presente sesgos en la representación de voces y estilos.
- Riesgo de alucinación en la prosodia o pronunciación de palabras poco frecuentes o nombres propios.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_S) pueden degradar la calidad del audio generado; se recomienda Q4_K_M o superior para producción.
- No se detalla el contexto máximo soportado, lo que limita la planificación de textos largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base davitlive5/sonabo-v1.
- La model card no documenta el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar riesgos de reproducción de voces no consentidas en la clonación.

## Enlaces

- [Hugging Face: mradermacher/sonabo-v2-GGUF](https://huggingface.co/mradermacher/sonabo-v2-GGUF)
- [Modelo base: davitlive5/sonabo-v1](https://huggingface.co/davitlive5/sonabo-v1)
- [Página de descargas del cuantizador](https://hf.tst.eu/model#sonabo-v2-GGUF)
- [README de referencia para uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantizaciones de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
