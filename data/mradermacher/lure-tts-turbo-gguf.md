# mradermacher/Lure-TTS-Turbo-GGUF

## Resumen

Lure-TTS-Turbo-GGUF es una colección de cuantizaciones GGUF del modelo de síntesis de voz Tesslate/Lure-TTS-Turbo, preparadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un sistema de texto a voz (TTS) de unos 602 millones de parámetros, orientado a la generación de habla en inglés con clonación de voz zero-shot, habla expresiva y emocional, y soporte de streaming.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar el modelo en hardware modesto: las versiones comprimidas ocupan entre 0,3 y 1,3 GB, lo que hace viable la síntesis de voz local en portátiles, CPUs y GPUs de consumo. El repositorio se etiqueta como "preview", por lo que conviene tratarlo como una versión preliminar.

Cabe señalar que el modelo base es un modelo TTS y no un modelo de lenguaje: la mayor parte de las cuantizaciones van dirigidas a runtimes compatibles con GGUF para audio. El repositorio incluye además ficheros "mmproj" (Q8_0 y f16), descritos como suplementos multimodales, lo que sugiere algún componente adicional más allá del núcleo de síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en transformers, arquitectura interna no documentada) |
| Parametros totales | 602.341.376 (según safetensors) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantización); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, Tesslate/Lure-TTS-Turbo, es un modelo de texto a voz construido sobre la librería transformers de Hugging Face, con unos 602 millones de parámetros. La model card del cuantizador no detalla la arquitectura interna (decoder de audio, codec neuronal, tipo de atención), ni el proceso de entrenamiento: no hay datos publicados sobre el número de tokens o horas de audio, la composición del dataset, ni el uso de técnicas como RLHF o DPO (estas últimas, en cualquier caso, son habituales en modelos de lenguaje y no aplicables directamente a TTS).

Las etiquetas del repositorio indican capacidades de clonación de voz zero-shot, habla expresiva y emocional, y generación en streaming. La presencia de ficheros "mmproj" (multi-modal projectors) en la cuantización sugiere que el modelo incorpora algún componente que procesa entradas adicionales al texto, aunque su función exacta no está documentada. Esta versión de mradermacher consiste en cuantizaciones estáticas (static quants) convertidas desde el checkpoint original; el propio autor indica que las cuantizaciones con imatrix (matriz de importancia) no estaban disponibles en el momento de publicación.

## Capacidades

- Síntesis de texto a voz (TTS) en inglés.
- Clonación de voz zero-shot: generación de habla imitando una voz de referencia sin entrenamiento adicional por voz.
- Habla expresiva y emocional: control o reproducción de entonación y emoción en la voz generada.
- Generación en streaming: salida de audio progresiva, útil para aplicaciones en tiempo real.
- Componente multimodal adicional (ficheros mmproj), cuya función concreta no está documentada.
- Ejecución local en hardware modesto gracias a las cuantizaciones GGUF (desde 0,3 GB).

No hay información publicada sobre tool calling, razonamiento o generación de código: no aplicables, al tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz locales y privados: la cuantización Q4_K_S (0,4 GB) permite ejecutar síntesis de voz en un portátil sin GPU dedicada, manteniendo los datos en el dispositivo.
- Clonación de voz para creación de contenido: locución de vídeos, podcasts o audiolibros en inglés a partir de una muestra breve de la voz objetivo, sin necesidad de grabar todo el material.
- Videojuegos y narración procedural: generación en streaming de diálogo con distintas voces y emociones para personajes, integrable en el motor del juego en tiempo de ejecución.
- Prototipado de aplicaciones conversacionales: combinación con un LLM local (por ejemplo vía Ollama o llama.cpp) para construir pipelines voz-in/voz-out completos en una sola máquina.
- Accesibilidad: lectores de pantalla o herramientas de lectura de texto con voces personalizadas y expresivas, ejecutándose offline.
- Pruebas A/B de voces en productos de voz: la variedad de cuantizaciones permite evaluar el compromiso entre tamaño, latencia y calidad de audio antes de desplegar en producción.
- Agentes de telefonía o IVR de bajo coste: el pequeño tamaño del modelo permite desplegar múltiples instancias en un único servidor para atención telefónica automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de calidad de audio (MOS, WER sobre síntesis), ni comparativas con otros sistemas TTS en la model card.

## Requisitos de hardware

- VRAM / memoria estimada: el peso del modelo va de 0,3 GB (Q2_K) a 1,3 GB (f16); sumando overhead de ejecución, se puede inferir con menos de 2 GB de RAM o VRAM en casi todas las cuantizaciones.
- GPU recomendadas: no es necesaria una GPU dedicada; cualquier GPU moderna con 2-4 GB (por ejemplo una RTX 3060 o superior) ejecuta el modelo con holgura. En CPU también es viable dado el reducido tamaño.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo actual, incluidas las de gama baja.
- Despliegue: el formato GGUF está pensado para el ecosistema llama.cpp; la compatibilidad con Ollama, LM Studio u otros runtimes para modelos TTS en GGUF depende del soporte que estos ofrezcan al modelo base Tesslate/Lure-TTS-Turbo (etiquetado como "preview"). El modelo base en safetensors funciona con la librería transformers de Hugging Face.
- Latencia y throughput: no disponibles. La etiqueta "Turbo" y el soporte de streaming del modelo base sugieren optimización para latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Clonacion zero-shot | Licencia | Notas |
|---|---|---|---|---|---|
| Lure-TTS-Turbo (base) | 602 M | safetensors | si (según tags) | Apache 2.0 | Preview, streaming, expresivo |
| Lure-TTS-Turbo-GGUF (esta ficha) | 602 M (cuantizado) | GGUF | si (según tags) | Apache 2.0 | Cuants de 0,3 a 1,3 GB |
| Kokoro (ejemplo de categoria) | ~82 M | safetensors, ONNX | no | Apache 2.0 | TTS ligero, menos expresivo |
| XTTS-v2 (Coqui) | ~750 M | safetensors | si | Coqui Public Model License (no comercial sin acuerdo) | Multilingue (16 idiomas) |

La comparativa es orientativa: frente a XTTS-v2, Lure-TTS-Turbo es más pequeño y con licencia Apache 2.0 plenamente comercial, pero limitado al inglés. Frente a Kokoro, ofrece clonación de voz y expresividad a cambio de un mayor tamaño y menor madurez (estado preview).

## Limitaciones y advertencias

- Idioma: el modelo está limitado al inglés; no hay soporte documentado para español ni otros idiomas, lo que restringe su uso en productos en castellano.
- Estado preview: tanto el modelo base como la cuantización se etiquetan como preliminares; la calidad y estabilidad pueden cambiar en versiones futuras.
- Riesgo de artefactos de audio: las cuantizaciones agresivas (Q2_K, Q3_K_S/M) pueden degradar la calidad del habla de forma perceptible; se recomienda Q4_K_S o superior para uso serio.
- Clonación de voz: la capacidad de imitar voces conlleva riesgos éticos y legales (suplantación, deepfakes de audio); el uso responsable y con consentimiento es responsabilidad del desarrollador.
- Documentación escasa: la model card no detalla arquitectura, datos de entrenamiento ni benchmarks, lo que dificulta evaluar sesgos, alucinaciones (errores de pronunciación o texto omitido) y rendimiento real antes de probarlo.
- Sin cuantizaciones imatrix: solo hay cuants estáticos disponibles, con posible pérdida de calidad frente a cuants ponderados.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo base es un "preview" y su licencia podría variar en versiones estables.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Lure-TTS-Turbo-GGUF
- Modelo base: https://huggingface.co/Tesslate/Lure-TTS-Turbo
- Página resumen de cuants de mradermacher: https://hf.tst.eu/model#Lure-TTS-Turbo-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
