# inclusionAI/Ming-3.0-tts-0.5B

## Resumen

Ming-3.0-tts-0.5B es un modelo denso de síntesis de voz (text-to-speech) desarrollado por la organización inclusionAI, publicado en HuggingFace el 22 de septiembre de 2026 y actualizado el 19 de octubre del mismo año. Se presenta como un sistema de TTS multilingüe con control paralingüístico y en lenguaje natural, construido sobre un backbone Qwen2.5-0.5B al que se añaden una cabeza DiT, un tokenizador de audio, un codificador de hablante y un tokenizador de texto. Genera audio a 44,1 kHz, una frecuencia de muestreo superior a la habitual (24 kHz) en la mayoría de modelos TTS abiertos de su categoría.

El modelo cubre siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés), admite los dialectos chinos de Sichuan y cantonés, y ofrece clonación de voz zero-shot a partir de una referencia corta, diseño de voz mediante descripción textual y control explícito de emoción, velocidad, tono y volumen, además de 14 etiquetas en línea para sonidos como respiración, tos, suspiro o risa.

Su relevancia actual radica en la combinación de licencia MIT, un tamaño contenido y un conjunto amplio de controles de estilo, lo que lo hace apto para despliegue en infraestructura moderada. Conviene tener en cuenta que el repositorio de HuggingFace es únicamente de distribución del checkpoint: la inferencia exige clonar el repositorio de GitHub del proyecto y usar su código (`ming_tts.MingTTS` o `infer.py`), dado que el modelo incluye código personalizado (`custom_code`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Densa, backbone Qwen2.5-0.5B con cabeza DiT, tokenizador de audio, codificador de hablante y tokenizador de texto |
| Parámetros totales | 1.479.454.868 (conjunto del checkpoint; el backbone es de 0,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio no publica variantes cuantizadas; incluye artefactos ONNX además de safetensors) |
| Idiomas soportados | Chino, inglés, alemán, español, francés, coreano y japonés; dialectos de Sichuan y cantonés |
| Licencia | MIT |
| Formato de pesos | Safetensors y ONNX; requiere `custom_code` para la carga |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Tarea (pipeline) | text-to-speech |
| Tamaño del repositorio | 3,0 GB |
| Descargas / likes | 6 / 13 |
| Fecha de publicación | 22 de septiembre de 2026 (última actualización: 19 de octubre de 2026) |

## Arquitectura y entrenamiento

La arquitectura es densa y no sigue el patrón MoE. El núcleo generativo es un transformer Qwen2.5-0.5B, sobre el que se monta una cabeza DiT (Diffusion Transformer) para la generación de audio, junto con un tokenizador de audio propio, un codificador de hablante y un tokenizador de texto. El checkpoint distribuido en HuggingFace contiene los cinco componentes, lo que explica que el total de parámetros (≈1,48 mil millones) triplique aproximadamente el tamaño del backbone. La síntesis se organiza en tareas diferenciadas (`TTS`, `FREEFORM`, `VOICE_DESIGN`, `MULTILINGUAL`, `BASIC`, `EMOTION`, `DIALECT`, `IP`) con API Python y CLI propios.

No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron etapas de RLHF o DPO. Sí se documenta el preprocesado de texto: la normalización de números, fechas, unidades y símbolos se realiza mediante gramáticas FST implementadas con `pynini` 2.1.6, con la posibilidad de desactivarla (`--no_text_normalization`). En el plano técnico destacan dos elementos: el control en lenguaje natural (instrucciones libres de estilo y diseño de voz) y la inclusión de 14 etiquetas en línea que modelan sonidos paralingüísticos en chino e inglés. La inferencia se ha validado en NVIDIA H800-80GB y H20-96G con CUDA 12.4; `flash-attn` es opcional y, en su ausencia, se recurre a PyTorch SDPA.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés, con selección de idioma mediante `language_id` en la tarea `MULTILINGUAL`.
- Clonación de voz zero-shot a partir de un clip de referencia corto, con transcripción del audio de referencia (`prompt_text`).
- Diseño de voz (`VOICE_DESIGN`): generación de una voz a partir de una descripción de hablante en lenguaje natural.
- Control de estilo libre (`FREEFORM`) sobre la entrega y la forma de hablar; esta tarea no se puede combinar con diseño de voz, voces integradas, emoción, dialecto ni controles de atributos.
- Control explícito de emoción, velocidad, tono y volumen.
- Control de dialectos: Sichuan y cantonés mediante la tarea `DIALECT`, que no requiere identificador de idioma.
- Banco de voces integradas: más de 100 voces en chino y cinco en inglés.
- Etiquetas paralingüísticas en línea: 14 etiquetas para respiración, tos, suspiro, risa, vacilación, sorpresa y sonidos de pregunta o confirmación, en chino o inglés.
- Tarea `IP` (identidad de producto o personaje, según la nomenclatura del proyecto; el cookbook enlazado es la referencia para sus controles).
- No se documentan en la información disponible capacidades de tool calling, uso de agentes, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Audiolibros y narración larga: el control de velocidad, tono y emoción, junto con las etiquetas de suspiro, respiración y vacilación, permite dar naturalidad a la lectura de párrafos extensos sin segmentación manual agresiva.
- Doblaje y localización a siete idiomas: la tarea `MULTILINGUAL` con `language_id` permite generar la misma locución en alemán, francés, español, coreano o japonés, y conservar la identidad de voz mediante una referencia del hablante original.
- Asistentes de voz y atención al cliente: la clonación zero-shot con un clip corto permite mantener una voz de marca coherente en todos los puntos de contacto, con control de emociones para adaptar el tono al contexto de la conversación.
- Producción de contenido y publicidad: el diseño de voz (`VOICE_DESIGN`) posibilita crear voces nuevas descritas en texto, útil para prototipado rápido de spots o identificadores sonoros sin depender de un locutor.
- Accesibilidad y lectura de pantalla: la salida a 44,1 kHz y la normalización FST de números, fechas y unidades mejoran la inteligibilidad en la lectura de documentos técnicos, tablas de precios o informes.
- Videojuegos y personajes interactivos: la combinación de `IP`, voces integradas y etiquetas paralingüísticas permite asignar voces distintas a personajes y añadir reacciones (risa, sorpresa, duda) dentro de una misma línea de diálogo.
- Prototipado de interfaces de voz: la API Python `MingTTS` y los scripts de CLI facilitan integrar la síntesis en pipelines de generación de material de demo y pruebas de usuario.

## Benchmarks y rendimiento

La información proporcionada incluye una sección de rendimiento con tablas comparativas sobre el conjunto de evaluación Seed-TTS, con las métricas WER (menor es mejor) y SIM (mayor es mejor) para `seed-tts-eval-zh` y `seed-tts-eval-en`, además de filas de referencia Seed-TTS y NVbench-GT que no se incluyen en la clasificación. Sin embargo, los valores numéricos de esas tablas aparecen truncados en la información disponible y no se reproducen aquí.

| Benchmark | Métrica | Resultado |
|---|---|---|
| seed-tts-eval-zh | WER ↓ / SIM ↑ | No disponible (valores truncados en la información proporcionada) |
| seed-tts-eval-en | WER ↓ / SIM ↑ | No disponible (valores truncados en la información proporcionada) |

No se han publicado en la información disponible resultados numéricos adicionales (tipo MMLU, HumanEval o GSM8K, no aplicables a un modelo TTS) ni mediciones de latencia o throughput.

## Requisitos de hardware

- Pesos: el repositorio ocupa 3,0 GB, coherente con un checkpoint de ≈1,48 mil millones de parámetros almacenado a 16 bits. La VRAM de inferencia debe sumar el backbone, la cabeza DiT, el tokenizador de audio y el codificador de hablante, por lo que se sitúa por encima del tamaño en disco (estimación orientativa: 6-8 GB en GPU para inferencia en precisión de 16 bits; no confirmado por el autor).
- GPU validadas por el autor: NVIDIA H800-80GB y H20-96G con CUDA 12.4.
- GPU de consumo: por la horquilla de VRAM estimada, el modelo debería caber en tarjetas de 12 GB o más (RTX 3060 12GB, RTX 4070 Ti, RTX 4080, RTX 4090). No hay confirmación oficial de funcionamiento en estas tarjetas en la información disponible.
- Aceleración: `flash-attn` es opcional; sin él se usa PyTorch SDPA, lo que reduce los requisitos de compilación a costa de eficiencia.
- Dependencias adicionales: `pynini` 2.1.6 (canal conda-forge) para la normalización de texto, o bien `--no_text_normalization` para omitirla.
- Despliegue: el proyecto no documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La vía soportada es el repositorio de GitHub (`infer.py` como CLI y `ming_tts.MingTTS` como API Python). El repositorio de HuggingFace incluye artefactos ONNX, pero no se detalla en la información disponible el flujo de exportación ni el runtime recomendado.
- Verificación previa del checkpoint: `python tools/preflight.py --model_path /ruta/al/checkpoint`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo identifica comparaciones frente a modelos de código abierto en las tablas de Seed-TTS (sin valores numéricos disponibles) y cita Seed-TTS y NVbench-GT como filas de referencia. No se aportan especificaciones verificables de los modelos alternativos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ming-3.0-tts-0.5B | 1.479.454.868 en total (backbone 0,5B) | No disponible | MIT | HuggingFace, ModelScope, GitHub |
| CosyVoice 2 (alternativa de escala similar, datos no verificados en esta ficha) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Repositorio público |
| F5-TTS (alternativa de escala similar, datos no verificados en esta ficha) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Repositorio público |

No disponible: no se han proporcionado datos comparativos verificables (parámetros, contexto, licencia o métricas) de modelos alternativos en la información de origen; los nombres de la tabla se incluyen solo como candidatos de evaluación y deben confirmarse en sus repositorios oficiales.

## Limitaciones y advertencias

- El repositorio de HuggingFace no es autónomo: sin clonar el repositorio de GitHub no hay código de inferencia, dependencias ni instrucciones de uso actualizadas.
- El modelo depende de `custom_code`, lo que complica su integración en runtimes estándar y en plataformas de serving que no admitan código personalizado.
- No se han publicado volúmenes de entrenamiento, composición del corpus ni detalles de alineación (RLHF/DPO); la evaluación de sesgos y de calidad en dominios concretos queda en manos del usuario.
- Riesgo de alucinación acústica y de errores de pronunciación en textos con abundantes cifras, unidades o símbolos si se desactiva la normalización FST.
- Las etiquetas paralingüísticas en línea están limitadas a chino e inglés; el control de dialectos se restringe al chino (Sichuan y cantón).
- La tarea `FREEFORM` es incompatible con diseño de voz, voces integradas, emoción, dialecto y controles de atributos, lo que limita combinaciones de control.
- No se documentan longitudes máximas de texto de entrada ni de contexto; para síntesis de fragmentos largos habrá que segmentar y validar empíricamente.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las obligaciones legales sobre derechos de imagen y voz. La clonación zero-shot y el diseño de voz pueden emplearse para suplantación; es necesario aplicar consentimiento explícito, marcas de agua o detección de voz sintética en producción.
- Comunidad muy incipiente en el momento de la ficha (6 descargas, 13 likes), con soporte y mantenimiento no garantizados a largo plazo.
- No se publican cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere validar por cuenta propia precisión y calidad.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- GitHub del proyecto (requerido para inferencia): https://github.com/inclusionAI/Ming-3.0-tts
- Blog y demos: https://nomorecoding.github.io/Ming-3.0-tts/
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-tts-0.5b
- Cookbook de tareas e instrucciones de control: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/cookbooks/instructions.md
- Sección de rendimiento del README: https://github.com/inclusionAI/Ming-3.0-tts#performance

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo (únicamente páginas sobre tests de orientación profesional), por lo que no se añaden enlaces adicionales de prensa, papers o demos de terceros. No se ha localizado en la información disponible un enlace al informe técnico completo más allá del blog del proyecto.
