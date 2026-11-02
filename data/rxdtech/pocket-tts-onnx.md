# rxdtech/pocket-tts-onnx

## Resumen

Pocket TTS ONNX es una exportación a formato ONNX del modelo de síntesis de voz Pocket TTS desarrollado por Kyutai. Se trata de un modelo compacto de text-to-speech multilingüe con capacidad de clonación de voz zero-shot a partir de muestras de audio cortas. La exportación, publicada por el usuario rxdtech, está diseñada específicamente para inferencia en CPU mediante ONNX Runtime y ofrece versiones cuantizadas en INT8 de los componentes principales del pipeline.

El modelo cubre seis idiomas (inglés, alemán, francés, italiano, portugués y español) mediante bundles independientes por idioma, con dos variantes de profundidad para algunos de ellos: bundles de 6 capas (más pequeños y rápidos) y bundles de 24 capas (etiquetados como `_24l`). La arquitectura separa el Flow LM en dos grafos ONNX diferenciados (`flow_lm_main` para el transformer/conditioner y `flow_lm_flow` para la red de flujo con integración de Euler), lo que permite control externo del proceso de muestreo.

Su relevancia actual reside en la combinación de clonación de voz zero-shot, soporte de streaming con chunking adaptativo y despliegue ligero en CPU sin necesidad de GPU, lo que lo hace adecuado para aplicaciones de TTS en entornos con recursos limitados o en el borde. El repositorio ocupa 12,5 GB e incluye tanto el layout legacy de ficheros raíz como los bundles por idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching con split dual: transformer/conditioner (`flow_lm_main`) + red de flujo (`flow_lm_flow`), con codec neuronal Mimi para encoder y decoder de audio |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (para `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`) y FP32 (`mimi_encoder` y `text_conditioner` permanecen en FP32) |
| Idiomas soportados | inglés, alemán, francés, italiano, portugués, español |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos `.onnx`), tokenizer SentencePiece (`tokenizer.model`), estados de voz en `.safetensors` y `.npy` |

## Arquitectura y entrenamiento

La exportación se basa en Pocket TTS de Kyutai y mantiene su esquema de flow matching para la generación de latentes de audio. El pipeline se descompone en cuatro grafos ONNX principales: `text_conditioner` (procesamiento del texto de entrada), `flow_lm_main` (transformer que produce los vectores de condicionamiento), `flow_lm_flow` (red de flujo que realiza la integración de Euler para muestrear latentes) y `mimi_decoder` junto con `mimi_encoder` (codec neuronal Mimi para síntesis y para la codificación de la referencia de voz en la clonación). La separación entre `flow_lm_main` y `flow_lm_flow` permite exponer parámetros como la temperatura (escalado del ruido) y el número de pasos LSD (que controla el compromiso entre velocidad y calidad) directamente en el bucle de muestreo externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card sí detalla optimizaciones de inferencia: el número de hilos se ajusta automáticamente (`intra_op_num_threads=min(cpu_count, 4)`, `inter_op_num_threads=1`) para evitar sobre-suscripción en las matmuls secuenciales pequeñas del bucle autorregresivo, lo que según el autor aporta una mejora de velocidad de aproximadamente 2x frente a la configuración por defecto de ONNX Runtime. En modo offline se emplea decodificación paralela con hilos (el decoder Mimi procesa chunks de 12 frames en un hilo de fondo mientras el bucle de flujo genera los siguientes), y en modo streaming se usa chunking adaptativo que comienza en 2 frames para minimizar el time-to-first-byte.

## Capacidades

- Síntesis de voz multilingüe en inglés, alemán, francés, italiano, portugués y español mediante bundles específicos por idioma.
- Clonación de voz zero-shot a partir de una muestra de audio de referencia, de un fichero de estado de prompt en `.safetensors` o de un array de embedding precalculado.
- Voces integradas predefinidas cargadas desde los metadatos de cada bundle (por ejemplo, `alba`).
- Control de temperatura de generación para modular la diversidad y expresividad de la salida (valores de ejemplo: 0.3 determinista, 0.7 por defecto, 1.0 más diverso).
- Control del número de pasos LSD (`lsd_steps`) para intercambiar velocidad por calidad (por ejemplo, 1 por defecto frente a 4 para una salida potencialmente más suave).
- Modo streaming con chunking adaptativo para reproducción en tiempo real y baja latencia de primer audio.
- Modo offline con decodificación paralela multihilo para maximizar el throughput.
- Inferencia en CPU con versiones INT8 de los componentes principales.
- Interfaz de línea de comandos (`generate.py`) además de la API de Python (`PocketTTSOnnx`).
- No se menciona soporte de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para locuciones personalizadas: a partir de una muestra corta de audio de referencia se puede generar narración con la voz del usuario, útil en audiolibros, podcasts o contenido formativo donde se requiere consistencia de timbre sin entrenamiento adicional.
- Asistentes de voz en el borde: al ejecutarse en CPU con modelos INT8 y modo streaming de baja latencia, encaja en dispositivos sin GPU o en despliegues locales donde no se quiere enviar audio a la nube.
- Atención al cliente automatizada con respuesta hablada: el modelo puede sintetizar respuestas multilingües en tiempo real, con voces integradas o clonadas, integrándose en sistemas de IVR o chatbots de voz.
- Localización de contenido audiovisual: los bundles por idioma permiten generar versiones dobladas de un mismo texto en seis lenguas manteniendo una voz de referencia coherente entre ellas.
- Accesibilidad y lectura de textos: conversión de documentos, artículos o notificaciones a audio con control de expresividad mediante temperatura y pasos LSD, ajustando el compromiso calidad/velocidad según el dispositivo.
- Prototipado rápido de productos de voz: la API de Python y la CLI permiten integrar TTS en pipelines de desarrollo sin infraestructura GPU, acelerando la validación de experiencias de voz antes de escalar a producción.
- Generación de audios para entornos de prueba: creación de datasets sintéticos de voz con distintas voces y temperaturas para evaluar sistemas de reconocimiento de habla o de diarización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que la exportación está orientada a CPU mediante ONNX Runtime; no se proporcionan cifras de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible en la información proporcionada; el autor no documenta aceleración por GPU para esta exportación.
- Compatibilidad con GPU de consumo: no disponible; el diseño y las optimizaciones descritas (ajuste de hilos de CPU, INT8 para CPU) apuntan a despliegue en CPU.
- Opciones de despliegue: ONNX Runtime a través de la librería `pocket-tts-onnx` (API de Python y CLI `generate.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras absolutas. El autor indica que los bundles de 6 capas son mucho más pequeños y rápidos que los `_24l`, que INT8 reduce sustancialmente el tamaño de `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`, y que el ajuste de hilos aporta aproximadamente 2x de speedup frente a la configuración por defecto de ONNX Runtime en máquinas multinúcleo.
- Tamaño del repositorio: 12,5 GB, incluyendo todos los bundles por idioma y las variantes FP32 e INT8.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Clonación de voz | Formato / despliegue | Licencia |
|---|---|---|---|---|---|
| Pocket TTS ONNX (esta ficha) | TTS flow matching exportado a ONNX | 6 (en, de, fr, it, pt, es) | Zero-shot | ONNX Runtime, CPU con INT8 | CC-BY-4.0 |
| kyutai/pocket-tts | TTS flow matching (modelo base) | no disponible en la información | Zero-shot | Pesos originales del modelo base | no disponible en la información |
| Otras alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No se han publicado métricas objetivas de calidad (MOS, similitud de hablante, WER) en la información disponible, por lo que la evaluación de calidad queda a cargo del usuario.
- Riesgo de alucinación o artefactos de audio: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos, especialmente con textos fuera de dominio o con pasos LSD bajos.
- La clonación de voz zero-shot conlleva riesgos de suplantación de identidad y uso indebido; es responsabilidad del integrador aplicar consentimiento, verificación y medidas de mitigación.
- Cobertura lingüística limitada a seis idiomas; no se documenta el rendimiento en códigos de mezcla de lenguas ni en variantes dialectales.
- No se especifican sesgos conocidos del modelo base ni de la exportación en la información proporcionada.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero debe verificarse la compatibilidad con la licencia del modelo base `kyutai/pocket-tts`, que no se detalla en la información disponible.
- El repositorio incluye un layout legacy en la raíz de `onnx/` mantenido solo por compatibilidad; las integraciones nuevas deben usar los directorios por idioma bajo `onnx/<language>/`.
- El modelo está optimizado para CPU; no se documenta rendimiento en GPU ni soporte de aceleradores específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rxdtech/pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
