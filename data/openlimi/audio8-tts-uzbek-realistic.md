# openlimi/audio8-tts-uzbek-realistic

## Resumen

Vosen-TTS-Small (publicado en el repositorio `openlimi/audio8-tts-uzbek-realistic`) es un adaptador LoRA de síntesis de voz orientado específicamente al uzbeko (`uz`), con capacidad de clonación de voz zero-shot. Lo desarrolla el usuario openlimi y se distribuye con la librería `pepetts` sobre PyTorch, empaquetado en safetensors y con un peso de repositorio de aproximadamente 0,7 GB. La model card lo presenta como la versión v4 del adaptador LoRA sobre un modelo base denominado Vosen-TTS-Small.

El modelo resuelve un problema de nicho: la práctica ausencia de sistemas TTS de calidad para uzbeko, una lengua túrquica con relativamente pocos recursos en el ecosistema open source. El adaptador ajusta el procesamiento de fonemas y los mapas de prosodia para acentos uzbecos del norte, estándar y regionales, y permite clonar una voz a partir de una muestra de audio corta, lo que resulta relevante para doblaje, audiolibros y asistentes de voz en ese idioma.

La propuesta técnica se apoya en un adaptador LoRA ligero (escala recomendada de 0,9 a 1,0) que se monta sobre un modelo base, con salida de audio nativa declarada a 24 kHz o 44,1 kHz. No se especifican en la información disponible el número de parámetros del modelo base, la longitud de contexto textual ni los detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Vosen-TTS-Small (arquitectura del base no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS; entrada de texto sin límite documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (librería `pepetts`, PyTorch) |
| Frecuencia de muestreo de salida | 24 kHz / 44,1 kHz (declarado) |
| Escala LoRA recomendada | 0,9 – 1,0 |
| Audio de referencia para clonación | mínimo 6 s; recomendado 8–15 s, mono, 16 kHz o 24 kHz |
| Tamano del repositorio | ~0,7 GB |
| Metricas declaradas | PESQ, MCD |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un adaptador LoRA (Low-Rank Adaptation) entrenado sobre un modelo base de TTS llamado Vosen-TTS-Small, con soporte declarado para clonación (`coqui_cloning: true`). El adaptador modifica el modelo base para ajustar fonemas y prosodia al uzbeko, y la model card menciona "iteraciones de dataset de alta calidad" sin detallar el volumen de datos, la composición del corpus, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS, pero no confirmado).

Como innovaciones destacables, la model card cita la optimización del adaptador para inferencia rápida en hardware de consumo, la salida nativa a 24 kHz/44,1 kHz para reducir ruido de fondo y artefactos, y un control explícito de la escala LoRA para equilibrar la identidad tímbrica de la voz clonada frente a la estabilidad del modelo base. No se documentan detalles sobre la arquitectura interna del base (transformer, difusión, VITS, etc.), la función de pérdida ni el esquema de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en uzbeko con pronunciación nativa ajustada.
- Clonación de voz zero-shot a partir de una muestra de audio de referencia de al menos 6 segundos.
- Ajuste de prosodia y acentuación de palabras para acentos uzbecos del norte, estándar y regionales.
- Control de la intensidad del adaptador mediante el parámetro `lora_scale` (rango recomendado 0,9–1,0).
- Generación de audio a 24 kHz o 44,1 kHz.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de audio).
- Capacidades multilingües: no; solo uzbeko.
- Modo thinking, visión o audio de entrada más allá de la muestra de referencia: no disponible.

## Casos de uso

- Doblaje y localización de contenido al uzbeko: el modelo permite generar voces sintéticas con acento nativo para vídeos, series o material formativo, usando una muestra de referencia del actor original para preservar el timbre.
- Audiolibros y narración automatizada: con 8–15 segundos de audio de referencia se puede mantener una identidad de voz consistente a lo largo de capítulos largos, generando cada fragmento con la misma muestra y una escala LoRA fija.
- Asistentes de voz y sistemas de atención al cliente en uzbeko: integración en pipelines de IVR o chatbots hablados donde no existen alternativas TTS comerciales de calidad para este idioma.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a hablantes de uzbeko.
- Creación de contenido para redes sociales y pódcast: generación rápida de locuciones en uzbeko en hardware de consumo gracias al diseño ligero del adaptador LoRA.
- Prototipado de productos de voz para el mercado uzbeco: evaluación de interfaces conversacionales o aplicaciones de aprendizaje de idiomas antes de invertir en un TTS propietario.
- Investigación en TTS de bajos recursos: el adaptador sirve como punto de partida para experimentar con LoRA sobre modelos base multilingües en lenguas túrquicas.

## Benchmarks y rendimiento

La model card declara el uso de las métricas PESQ y MCD, pero no publica valores numéricos ni comparaciones con otros sistemas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa ~0,7 GB y la model card afirma inferencia rápida en hardware de consumo, lo que sugiere que cabe en GPU de gama media (orientativamente 4–8 GB, estimación no confirmada por el autor).
- GPU recomendadas: no especificadas; por el tamaño del adaptador, se espera funcionamiento en RTX 3060/4060 o superiores, aunque no está documentado.
- ¿Cabe en GPU de consumo? La model card lo afirma ("consumer-grade hardware"), sin concretar modelos.
- Opciones de despliegue: librería `pepetts` con PyTorch y torchaudio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en la mayoría de casos).
- Latencia y throughput: no disponibles. El ejemplo de la model card usa `torchaudio.save` a 24 kHz.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable. Se indican alternativas cualitativas de la misma categoría (TTS con clonación zero-shot), sin cifras verificadas:

| Modelo | Idioma principal | Clonación zero-shot | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| Vosen-TTS-Small LoRA v4 (este) | Uzbeko | Sí (≥6 s de audio) | CreativeML OpenRAIL-M | Texto + audio de referencia | Hugging Face (`pepetts`) |
| XTTS-v2 (Coqui) | Multilingüe | Sí | Coqui Public Model License (no comercial en la práctica) | Texto + audio de referencia | Hugging Face |
| Bark (Suno) | Multilingüe | Parcial (prompt de voz) | MIT | Texto + prompt | Hugging Face |
| OpenVoice (MyShell) | Multilingüe | Sí | MIT | Texto + audio de referencia | Hugging Face / GitHub |

Los datos de parámetros, contexto y benchmarks de estas alternativas no se incluyen aquí porque no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Solo soporta uzbeko; no es un modelo multilingüe.
- Requiere un audio de referencia de al menos 6 segundos (recomendado 8–15 s) en mono, 16 kHz o 24 kHz, sin música, eco ni solapamiento de voces; muestras de peor calidad degradan la clonación.
- Escalas LoRA por debajo de 0,8 pueden perder la identidad tímbrica de la voz; por encima de 1,0 pueden provocar clipping o distorsión.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, ruido o pronunciaciones incorrectas en palabras poco frecuentes o extranjerismos.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente con voces uzbecas, puede reproducir sesgos de acento, género o registro del corpus.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibición de usos dañinos, suplantación de identidad, desinformación); es necesario revisar las cláusulas de uso antes de desplegar en producción.
- Riesgo de suplantación de voz: la clonación zero-shot facilita usos fraudulentos; se recomienda aplicar marcas de agua o consentimiento explícito de la voz clonada.
- No se documentan límites de longitud del texto de entrada ni latencia, lo que dificulta planificar despliegues en tiempo real.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- La model card referencia el repositorio `openlimi/Vosen-tts-small` como modelo base, mientras que el ID de este repositorio es `openlimi/audio8-tts-uzbek-realistic`; conviene verificar qué artefacto contiene exactamente cada uno.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/openlimi/audio8-tts-uzbek-realistic
- Modelo base referenciado: https://huggingface.co/openlimi/Vosen-tts-small
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Artículo sobre el idioma uzbeko: https://en.wikipedia.org/wiki/Uzbek_language
