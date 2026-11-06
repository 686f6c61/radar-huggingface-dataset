# Anadilorg/Anadil_Tatar_TTS

## Resumen

AnadilTatarTTS es un adaptador LoRA de síntesis de voz (text-to-speech) para el tártaro (ISO 639-3: `tt`), una lengua túrquica hablada por unos 5 millones de personas principalmente en la República de Tartaristán (Rusia). Lo desarrolla Anadilorg como parte de la familia "Anadil", una iniciativa que busca dotar de voz a lenguas de bajos recursos en herramientas digitales. El modelo se construye sobre el modelo base openbmb/VoxCPM2 y se publica bajo licencia MIT.

El adaptador se ha entrenado sobre 30.041 segmentos de un único hablante extraídos de Mozilla Common Voice en tártaro, con LoRA de rango 32 aplicado a las capas del LM y del DiT del modelo base. El resultado es un adaptador de unos 70 MB (384 tensores, aproximadamente 18,1 millones de parámetros en F32) que genera audio a 48 kHz.

Su relevancia radica en que el tártaro es una lengua con escasa representación en sistemas TTS comerciales; este adaptador permite generar voz en tártaro reutilizando la arquitectura y el conocimiento del modelo base, con un coste de almacenamiento y entrenamiento muy reducido. No obstante, se trata de una versión 0.1.0 sin métricas automáticas de calidad publicadas y limitada a un único hablante de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, alpha=32) sobre el modelo base openbmb/VoxCPM2 (capas LM y DiT) |
| Parametros totales | No disponible para el modelo base; el adaptador LoRA tiene ~18,1 M de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en F32) |
| Idiomas soportados | Tártaro (`tt`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA; requiere el modelo base VoxCPM2) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre openbmb/VoxCPM2, un sistema TTS que combina un modelo de lenguaje (LM) y un bloque DiT (Diffusion Transformer) para la generación de audio. El adaptador modifica las capas del LM y del DiT del modelo base, de modo que la inferencia requiere cargar VoxCPM2 junto con los pesos LoRA de este repositorio. La síntesis se realiza mediante un proceso de difusión con un número configurable de pasos (`inference_timesteps`, por defecto 10) y guiado por classifier-free guidance (`cfg_value`, por defecto 2.0).

El entrenamiento se llevó a cabo sobre 30.041 segmentos de audio de un único hablante provenientes de Mozilla Common Voice en tártaro, durante 5.000 pasos (último checkpoint guardado). No se documenta el número total de tokens de audio, la composición exacta del dataset más allá de su origen en Common Voice, ni si hubo etapas de RLHF o DPO; al tratarse de un adaptador TTS, el ajuste es supervisado sobre pares texto-audio. La model card no describe innovaciones técnicas adicionales más allá del propio esquema LoRA sobre el modelo base.

## Capacidades

- Síntesis de voz en tártaro a partir de texto de entrada, con salida a 48 kHz.
- Clonación de voz zero-shot mediante un clip de referencia (`reference_wav`): el modelo imita el timbre del hablante de referencia, aunque el entrenamiento se hizo con un único hablante (`spk_tmp_001`).
- Generación por lotes de las frases de ejemplo incluidas en el repositorio (`--list-samples`).
- Interfaz de línea de comandos (`inference.py`) y API de Python (`AnadilTatarTTS`).
- Demo local con Gradio (`demo.py`) en el puerto 7860.
- Verificación de integridad de pesos y prueba de humo completas (`test_smoke.py`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Locución de contenido en tártaro para medios digitales**: el modelo permite convertir artículos, noticias o guiones en audio en tártaro, lo que facilita la accesibilidad de contenidos escritos para hablantes de la lengua y para radios o pódcast comunitarios.
- **Audiolibros y narración de textos largos**: dividiendo el texto en segmentos y sintetizando cada uno con el mismo clip de referencia, se puede mantener una voz consistente a lo largo de un capítulo, gracias a la clonación zero-shot sobre una referencia fija.
- **Aprendizaje de la lengua tártara**: la generación de audio a partir de frases escritas sirve como apoyo a la pronunciación en materiales didácticos o aplicaciones de aprendizaje, usando el clip de referencia del hablante nativo incluido en el repositorio.
- **Sistemas de accesibilidad para personas con discapacidad visual**: integrado en un lector de pantalla o en un pipeline de conversión texto-a-voz, permite leer en voz alta contenido en tártaro que de otro modo no tendría soporte de síntesis.
- **Prototipado de asistentes conversacionales en lenguas minoritarias**: al ser un adaptador ligero sobre VoxCPM2, se puede desplegar junto al modelo base en un servicio de voz para experimentar con interfaces de voz en tártaro sin entrenar un TTS desde cero.
- **Investigación en TTS de bajos recursos**: el adaptador sirve como punto de partida reproducible (LoRA r=32, 30.041 segmentos, 5.000 pasos) para estudiar el ajuste de modelos TTS multilingües a lenguas con pocos datos, comparando estrategias de adaptación.
- **Doblaje y localización de vídeos cortos**: con un clip de referencia del hablante deseado, se pueden generar pistas de voz en tártaro para vídeos formativos o divulgativos, revisando manualmente la calidad antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas automáticas (WER, UTMOS, etc.) aún no se han calculado y que los cinco ejemplos de audio incluidos son frases vistas durante el entrenamiento (in-training), por lo que no constituyen una evaluación de generalización.

## Requisitos de hardware

- **Memoria**: la model card recomienda aproximadamente 9 GB de memoria para la síntesis en fp32, incluyendo el modelo base VoxCPM2 y el adaptador.
- **GPU**: se recomienda CUDA; no se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- **Consumer GPU**: no se confirma explícitamente qué GPU de consumo son suficientes; los ~9 GB en fp32 sugieren que tarjetas con 12 GB o más de VRAM podrían alojar el modelo, pero este dato no está verificado en la documentación.
- **Apple Silicon**: compatible pero más lento que CUDA, según la model card.
- **Despliegue**: la librería indicada es `voxcpm`; se documentan scripts de inferencia (`inference.py`), API de Python y demo Gradio (`demo.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnadilTatarTTS | Adaptador LoRA TTS sobre VoxCPM2 | Tártaro (`tt`) | ~18,1 M (adaptador) | No disponible | MIT | Hugging Face (29 descargas) |
| openbmb/VoxCPM2 | Modelo base TTS | No disponible en la información | No disponible | No disponible | No disponible en la información | Hugging Face (modelo base) |
| Otros adaptadores de la familia Anadil | Adaptadores LoRA TTS | Otras lenguas de bajos recursos | No disponible | No disponible | No disponible | No disponible en la información |

No se dispone de información sobre otros modelos TTS específicos para tártaro ni sobre resultados comparativos de rendimiento; la comparación se limita al modelo base y a la familia a la que pertenece el adaptador.

## Limitaciones y advertencias

- **Un solo hablante**: el adaptador se entrenó sobre un único hablante (`spk_tmp_001`); las voces distintas solo se abordan mediante clonación zero-shot con un clip de referencia, con calidad no garantizada.
- **Sin métricas de calidad**: no se han publicado WER, UTMOS ni otras métricas automáticas; los ejemplos de audio son frases vistas en entrenamiento, por lo que no demuestran capacidad de generalización.
- **Dependencia del modelo base**: requiere descargar y cargar openbmb/VoxCPM2 junto con el adaptador; el rendimiento y las limitaciones del modelo base condicionan el resultado.
- **Riesgo de alucinación acústica**: como todo sistema TTS generativo, puede producir pronunciaciones incorrectas, artefactos o prosodia inadecuada, especialmente en palabras fuera del vocabulario de entrenamiento o en texto con números y símbolos.
- **Cobertura limitada del idioma**: entrenado solo con datos de Common Voice en tártaro; puede degradarse con variantes dialectales, registros formales o préstamos del ruso no representados en el corpus.
- **Licencia y datos**: el adaptador es MIT, pero el corpus de entrenamiento proviene de Mozilla Common Voice `tt` (CC-0); conviene revisar las condiciones de uso del modelo base VoxCPM2 y de los datos de origen antes de un despliegue comercial.
- **Uso comercial**: la licencia MIT permite uso comercial del adaptador, pero no se documentan garantías de calidad ni soporte; para producción se recomienda evaluación propia con métricas objetivas y revisión humana.
- **Versión temprana**: se trata de la versión 0.1.0, con 29 descargas y sin likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/Anadil_Tatar_TTS
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Muestras de audio originales y sintetizadas: https://huggingface.co/Anadilorg/Anadil_Tatar_TTS/tree/main/samples
- Mozilla Common Voice (origen de los datos): https://commonvoice.mozilla.org/
