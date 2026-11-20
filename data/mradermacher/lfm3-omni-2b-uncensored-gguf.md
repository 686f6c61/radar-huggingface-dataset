# mradermacher/LFM3-Omni-2B-Uncensored-GGUF

## Resumen
LFM3-Omni-2B-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo OpenIntelligenceNet/LFM3-Omni-2B-Uncensored, un modelo multimodal any-to-any de la familia LFM3 (Liquid AI) con aproximadamente 1.728 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants para llama.cpp, y ofrece el modelo en 13 variantes de cuantizacion que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB), ademas de los ficheros mmproj necesarios para el procesamiento multimodal.

El modelo base es una variante "abliterated/uncensored" (etiquetada como heretic y abliterated) del LFM3-Omni-2B original, lo que implica que se han eliminado o atenuado los mecanismos de rechazo del modelo alineado. Al estar disenado para edge-ai, el modelo esta pensado para ejecutarse en dispositivos con recursos limitados, incluyendo portatiles y equipos de consumo.

La relevancia actual de esta ficha radica en que combina tres caracteristicas poco frecuentes en modelos de 2B: modalidad any-to-any (texto, vision, audio, speech-to-speech, TTS y ASR), empaquetado GGUF listo para llama.cpp y un sesgo explicito hacia la ausencia de filtros de seguridad. Todo ello con un unico idioma declarado, el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; detalles no publicados en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La informacion proporcionada no detalla la arquitectura interna del modelo base. Por la nomenclatura y las etiquetas (liquid-ai, lfm3, lfm3-omni, edge-ai) se trata de un modelo de la familia LFM3 de Liquid AI orientado a inferencia en el borde, con capacidades multimodales any-to-any. El modelo es una variante "abliterated/uncensored" derivada de OpenIntelligenceNet/LFM3-Omni-2B-Uncensored, que a su vez parte del LFM3-Omni-2B de Liquid AI. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica relevante en esta ficha es el proceso de cuantizacion: mradermacher publica quants estaticos (convert_type hf, output_tensor_quantised) y ofrece adicionalmente quants ponderados/imatrix en un repositorio separado (LFM3-Omni-2B-Uncensored-i1-GGUF). Los ficheros mmproj (Q8_0 y f16) son necesarios para habilitar las capacidades multimodales en llama.cpp; sin ellos, el modelo solo procesa texto.

## Capacidades
- Generacion de texto conversacional en ingles.
- Procesamiento multimodal any-to-any: vision, audio, speech-to-speech, TTS y ASR segun las etiquetas del modelo.
- Entrada de imagen y audio mediante los ficheros mmproj (Q8_0 o f16).
- Salida de voz (TTS) y transcripcion de voz (ASR) segun la model card.
- Conversacion multi-turno (pipeline conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Modelo "uncensored/abliterated": no aplica los filtros de rechazo tipicos del modelo alineado.
- No se indica soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso
- Asistente de voz local en ingles: el modelo puede recibir audio y devolver voz (speech-to-speech) en un dispositivo de consumo gracias a sus cuantizaciones de 1-2 GB, lo que permite prototipos de asistente conversacional sin conexion.
- Transcripcion y resumen de audio: usando la capacidad ASR combinada con generacion de texto, se puede construir un pipeline que transcriba reuniones o notas de voz y genere resumenes en local.
- Descripcion de imagenes en el borde: con el mmproj cargado, el modelo puede generar descripciones o responder preguntas sobre imagenes en equipos sin GPU dedicada, util para aplicaciones de accesibilidad o catalogacion.
- Prototipado de agentes conversacionales sin filtros: al ser uncensored, es adecuado para entornos de investigacion que necesitan evaluar respuestas sin rechazos, siempre que se cumplan los requisitos legales y eticos.
- Educacion e investigacion sobre alineacion: sirve como contrapunto controlado frente al modelo alineado para estudiar diferencias de comportamiento, sesgos y tasas de rechazo.
- Despliegue en Raspberry Pi o mini-PC: las variantes Q2_K (0,9 GB) y Q4_K_M (1,2 GB) permiten ejecutar el modelo en hardware de bajos recursos mediante llama.cpp u Ollama.
- Generacion de voz para aplicaciones de accesibilidad: la capacidad TTS permite sintetizar respuestas habladas en ingles en dispositivos con poca VRAM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1 GB para Q2_K, 1,2 GB para Q4_K_M, 1,9 GB para Q8_0 y 3,6 GB para f16, sin contar el mmproj (0,6-1,0 GB adicionales si se usa multimodal).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones pequenas; para f16 conviene disponer de 6-8 GB. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas de NVIDIA, AMD e Intel, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni de modelos comparables de la misma categoria (any-to-any de ~2B).

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-GGUF | 1.728.801.600 | no disponible | no disponible | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo unicamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Al ser una variante "uncensored/abliterated", no aplica filtros de seguridad: puede generar contenido ofensivo, ilegal o peligroso. No es apto para produccion orientada al publico general sin moderacion adicional.
- Riesgo de alucinacion inherente a modelos de 2B, especialmente en tareas de razonamiento y datos factuales.
- No se dispone de informacion sobre la licencia, por lo que el uso comercial queda en una situacion juridica incierta hasta confirmarla con el autor del modelo base.
- La longitud de contexto no esta documentada; conviene asumir ventanas cortas propias de modelos edge.
- El proceso de abliteration puede degradar capacidades generales respecto al modelo original.
- Los quants de baja calidad (Q2_K, Q3_K_M) pueden reducir notablemente la coherencia; se recomienda Q4_K_M o superior.
- Para usar vision y audio es imprescindible cargar el fichero mmproj correspondiente; sin el, el modelo solo procesa texto.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-Omni-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-Omni-2B-Uncensored
- Quants imatrix: https://huggingface.co/mradermacher/LFM3-Omni-2B-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-Omni-2B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
