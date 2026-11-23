# mahwizzzz/piper-voice-ur-aegis-female

## Resumen

Aegis es una voz de síntesis de habla femenina en urdu (variante `ur_PK`) distribuida en formato Piper ONNX. La publica Muhammad Mahwiz Khalil (Proxima AI) bajo licencia MIT y está pensada para inferencia en CPU, lo que la hace apta para despliegues ligeros, sistemas de accesibilidad y aplicaciones embebidas donde no hay GPU disponible. El repositorio ocupa aproximadamente 0,1 GB y el archivo ONNX principal pesa 63.515.589 bytes.

Técnicamente se trata de un modelo VITS de calidad "medium", con una frecuencia de muestreo de 22.050 Hz y fonemización mediante eSpeak-ng en su variante `ur`. Según la model card, la voz se obtuvo por fine-tuning del checkpoint masculino Fasih (`ur_PK-male-medium`) de IhorShevchuk, que a su vez deriva de un checkpoint medio en hindi (`hi_IN`) llamado Rohan, procedente de `rhasspy/piper-checkpoints`. La card menciona además un artículo sobre destilación de OmniVoice hacia un estudiante VITS, aunque no reconcilia ese relato con el fine-tuning declarado.

Su relevancia actual es doble: por un lado, cubre un hueco de recursos TTS abiertos para urdu, un idioma con poca oferta en modelos de voz ligeros; por otro, su formato ONNX y su licencia permisiva permiten integrarlo en pipelines de producción sin dependencias de infraestructura pesada. La contrapartida es la escasez de documentación sobre datos de entrenamiento y evaluación: no hay métricas objetivas publicadas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis extremo a extremo, formato Piper ONNX) |
| Parametros totales | no disponible (tamaño del archivo ONNX: 63.515.589 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto sin ventana declarada) |
| Tipos de cuantizacion | no disponible (se distribuye un único ONNX de precisión no declarada) |
| Idiomas soportados | urdu (`ur_PK`) |
| Licencia | MIT (copyright Muhammad Mahwiz Khalil / Proxima AI) |
| Formato de pesos | ONNX (`.onnx`) con configuración `.onnx.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS que utiliza Piper para sus voces: un sistema de síntesis extremo a extremo que combina codificador de texto, predictor de duración, flujo normalizador y decodificador vocacional, entrenado de forma adversarial. La calidad declarada es "medium" y la salida se genera a 22.050 Hz. La entrada de texto se convierte a fonemas IPA mediante eSpeak-ng en su variante `ur`, lo que implica que la pronunciación depende de la cobertura y precisión de ese fonemizador.

En cuanto al entrenamiento, la model card indica que la voz se afinó a partir del checkpoint masculino Fasih (`ur_PK-male-medium`), que a su vez procede de un checkpoint medio en hindi (Rohan) de `rhasspy/piper-checkpoints`. No se publican pasos de entrenamiento, tasa de aprendizaje, hardware, semilla, número de horas de audio, número de hablantes ni composición del corpus. Tampoco se especifica si el audio de entrenamiento es grabado o sintético. El artículo enlazado sobre destilación de OmniVoice hacia Aegis describe una destilación a nivel de datos hacia un estudiante VITS, pero el repositorio no contiene el corpus de destilación, las salidas del profesor ni los registros de entrenamiento, y la card no reconcilia ambas narrativas.

## Capacidades

- Síntesis de voz femenina en urdu (`ur_PK`) a partir de texto plano.
- Fonemización automática mediante eSpeak-ng en variante `ur`, sin necesidad de entrada fonética manual.
- Inferencia en CPU gracias al formato ONNX y al tamaño contenido del modelo (unos 61 MB).
- Integración con la CLI `piper` y con el ecosistema Piper (configuración `.onnx.json` incluida).
- Generación de audio a 22.050 Hz en formato WAV.
- No se declaran capacidades de clonación de voz, control de emoción, cambios de hablante ni multilingüismo.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura de pantalla y accesibilidad: el modelo puede convertir texto en urdu a voz para lectores de pantalla y aplicaciones de accesibilidad, con inferencia en CPU que no requiere GPU en el dispositivo del usuario.
- Asistentes de voz locales para urdu: integración en asistentes domésticos o aplicaciones de escritorio que necesitan una voz femenina en urdu con baja latencia y sin conexión a servicios en la nube.
- Audiolibros y contenido educativo: generación por lotes de narraciones en urdu a partir de textos, usando el pipeline de Piper para procesar capítulos completos de forma automatizada.
- Sistemas de anuncios y megafonía: síntesis de avisos dinámicos en urdu en entornos como transporte público o comercios, donde el coste de una GPU dedicada no está justificado.
- Integración en aplicaciones móviles y embebidas: el tamaño de 61 MB y el formato ONNX permiten empaquetar la voz en aplicaciones con recursos limitados, incluidas plataformas sin aceleración hardware.
- Prototipado de productos de voz para el mercado pakistaní: permite validar flujos de conversación en urdu antes de invertir en voces comerciales o en un entrenamiento propio a mayor escala.
- Generación de contenido multimedia: doblaje o narración automatizada de vídeos y pódcast en urdu, con la salvedad de que la calidad "medium" y la fonemización eSpeak pueden requerir revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se almacena en el repositorio ninguna cifra de word-error rate, MOS ni similitud de hablante, y que las muestras de audio están en `samples/`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para inferencia en CPU y no requiere GPU.
- GPU recomendadas: no necesarias. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no se documenta ningún requisito ni optimización específica.
- Cabe en GPU de consumo: sí, por tamaño (61 MB), aunque su diseño objetivo es CPU; no se han publicado requisitos de VRAM.
- Opciones de despliegue: CLI `piper`, ONNX Runtime, y cualquier integración que consuma modelos Piper (por ejemplo, servicios que envuelvan la CLI o bindings de ONNX). No se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama, que no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real ni de velocidad de síntesis.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aegis (`ur_PK-aegis_female-medium`) | Urdu (`ur_PK`) | VITS / Piper ONNX | Medium, 22.050 Hz | MIT | Hugging Face, 586 descargas |
| Fasih (`ur_PK-male-medium`, IhorShevchuk) | Urdu (`ur_PK`) | VITS / Piper ONNX | Medium | no disponible en la información proporcionada | Hugging Face |
| Rohan (`hi_IN` medium, vía `rhasspy/piper-checkpoints`) | Hindi (`hi_IN`) | VITS / Piper | Medium | no disponible en la información proporcionada | Repositorio de checkpoints de Piper |

La comparación se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento (MOS, WER) para ninguno de ellos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (MOS, WER, similitud de hablante); la evaluación subjetiva queda a cargo del usuario a partir de las muestras.
- La fonemización con eSpeak-ng en urdu puede divergir de la pronunciación nativa; es una propiedad del fonemizador declarado, no un error medido.
- No se documentan la procedencia de los datos de entrenamiento, las horas de audio, el número de hablantes ni la licencia del corpus, lo que dificulta evaluar riesgos de sesgo o de derechos sobre los datos.
- La card no reconcilia el relato de fine-tuning desde Fasih con el artículo sobre destilación de OmniVoice; la genealogía exacta del modelo es ambigua.
- Cobertura de dialectos y comportamiento ante code-switching (urdu-inglés) no medidos.
- La licencia MIT exige conservar el aviso de copyright y la atribución a Muhammad Mahwiz Khalil (Proxima AI) en todas las copias y redistribuciones, incluidas las re-subidas.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o prosodia antinatural en palabras fuera del dominio de entrenamiento.
- Al ser un modelo de un solo hablante, no permite selección de voz ni clonación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahwizzzz/piper-voice-ur-aegis-female
- Licencia: https://huggingface.co/mahwizzzz/piper-voice-ur-aegis-female/blob/main/LICENSE
- Modelo base declarado (Fasih, IhorShevchuk): https://huggingface.co/IhorShevchuk/piper-voice-ur-fasih
- Artículo sobre destilación de OmniVoice en Aegis: https://huggingface.co/blog/mahwizzzz/distilling-omnivoice-into-aegis
- Checkpoints de Piper: https://huggingface.co/rhasspy/piper-checkpoints
- Perfil del autor: https://huggingface.co/mahwizzzz
