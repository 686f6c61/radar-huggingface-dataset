# seyhunak/Mezna-TTS-82M

## Resumen

Mezna-TTS-82M es un modelo de texto a voz (text-to-speech) desarrollado por seyhunak, especializado en el dialecto emiratí (Emiratos Árabes Unidos) del árabe. Se trata de un fine-tuning del modelo Kokoro-82M de hexgrad, que cuenta con 82 millones de parámetros y una arquitectura basada en StyleTTS2 e ISTFTNet. El objetivo principal es ofrecer una voz femenina natural, denominada Mezna, que suene auténtica para hablantes del Golfo, en lugar de usar árabe estándar moderno (MSA). El modelo incluye un frontend propio de normalización y fonemización para palabras emiratíes como «شو», «وايد» o «أبغي», con un léxico de pronunciación extensible de 68 entradas.

Es relevante porque los sistemas TTS en dialectos árabes específicos son escasos, y este proyecto aborda esa carencia con un modelo ligero que corre en tiempo real en CPU (RTF ≈ 0.15–0.34). Sin embargo, es importante señalar que el repositorio actualmente no contiene los pesos del fine-tuning («kokoro_mezna_82M.pth»): el estado del proyecto es de scaffolding y frontend completos y probados, mientras que los samples de audio usan la voz nativa de Edge (ar-AE-FatimaNeural) como solución provisional. El repositorio tiene un tamaño de 0.0 GB, lo que confirma que no hay pesos publicados todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 + ISTFTNet (basado en Kokoro-82M) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; realiza chunking automático de frases para texto largo) |
| Tipos de cuantizacion | no disponible (pesos aún no publicados) |
| Idiomas soportados | Árabe (ar), específicamente dialecto emiratí (ar-AE) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pendiente; el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

Mezna-TTS-82M hereda la arquitectura de Kokoro-82M, un modelo TTS open-weight de 82 millones de parámetros que combina un enfoque StyleTTS2 con un decodificador ISTFTNet para generar audio de 24 kHz. El flujo de síntesis se divide en cuatro etapas: normalización de texto (con reglas específicas para el dialecto emiratí, incluyendo el prefijo «ال-» y la conversión de «ة» a «ه»), fonemización mediante espeak-ng/misaki, remapeo de los fonemas IPA al vocabulario de 178 tokens de Kokoro, y síntesis final con el modelo KModel. El frontend incorpora un léxico de pronunciación de 68 entradas para palabras dialectales, lo que permite corregir la pronunciación de términos nuevos.

En cuanto al entrenamiento, la información disponible no especifica el dataset utilizado, el número de tokens ni el proceso de ajuste. El autor indica que el fine-tuning con los pesos de Mezna («kokoro_mezna_82M.pth») se completará después de la fase de entrenamiento, que aún no se ha ejecutado. Por tanto, no hay datos de composición del corpus ni detalles sobre técnicas de optimización como RLHF o DPO. El proyecto cuenta con 18 pruebas pytest que verifican el frontend, el chunking y la integración, lo que sugiere que la parte de preprocesamiento es estable.

## Capacidades

- Generación de voz en árabe emiratí (Gulf/UAE) con una única voz femenina natural llamada Mezna.
- Frontend G2P especializado que maneja vocabulario dialectal emiratí: «شو», «وايد», «عيل», «يلس», «أبغي», «ريوق», «مسيد», «دياي», «فريج», «ميلس».
- Léxico de pronunciación extensible mediante el archivo `ar_lexicon.json` (68 entradas semilla).
- Chunking automático de frases basado en el presupuesto de fonemas, con concatenación sin cortes: un párrafo de 30 segundos se procesa sin errores.
- Soporte de texto largo: segmentación automática para evitar desbordamientos en la síntesis.
- Dos rutas de voz: una offline con Kokoro (`inference.py`) que requiere los pesos del fine-tuning (aún no disponibles), y una nativa con la voz `ar-AE` (`speak_edge.py`) que funciona actualmente con conexión a red.
- Ajuste de velocidad de habla mediante el parámetro `--speed` (por ejemplo, 0.8 para narración infantil).
- Demo Gradio con 5 ejemplos de un clic para probar el modelo.
- 18 casos de prueba pytest que validan el frontend, el chunking y el cableado del sistema.

## Casos de uso

- Anuncios en tiendas y servicios: el modelo puede generar saludos y mensajes en emiratí auténtico para centros comerciales o puntos de venta, en lugar de usar árabe estándar, lo que mejora la cercanía con el cliente.
- Cuentos infantiles y aplicaciones de aprendizaje: narración de historias y ejercicios de vocabulario en el dialecto doméstico, con velocidad reducida (`--speed 0.8`) para facilitar la comprensión.
- Kioscos gubernamentales y de majlis: síntesis por lotes para pantallas de servicio, anuncios de cola e IVR que hablan árabe emiratí en entornos oficiales.
- Podcasts y voiceovers: narración emiratí para contenido de YouTube, reels y anuncios publicitarios sin necesidad de estudio de grabación, gracias al manejo de texto largo.
- Accesibilidad: lectura de mensajes y noticias para personas mayores que prefieren el dialecto frente al MSA, mediante el demo Gradio o la síntesis por línea de comandos.
- Call centers e IVR: saludos, menús y confirmaciones con una voz femenina familiar, usando `speak_edge.py --voice ar-AE-FatimaNeural` como solución provisional.
- Avisos de mezquita y comunidad: recordatorios de eventos y anuncios en el dialecto, aprovechando el léxico que cubre vocabulario comunitario como «فريج» y «ميلس».

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo TTS, no de un modelo de lenguaje general. El único dato de rendimiento citado es el factor de tiempo real (RTF) de 0.15–0.34 en CPU, pero no se proporciona una comparativa con otros modelos TTS ni valores de calidad perceptual (MOS). Los 18 tests pytest son de tipo funcional y no constituyen una evaluación de calidad de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo Kokoro-82M es ligero y está diseñado para ejecutarse en CPU, pero los pesos de Mezna no están publicados, por lo que no se puede calcular la VRAM necesaria para este fine-tuning.
- GPU recomendada: no disponible. Según la model card, el modelo corre en CPU en tiempo real; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: el modelo base Kokoro-82M puede ejecutarse en GPU de consumo como RTX 3060 o superiores, pero en este caso no hay pesos disponibles para confirmar el comportamiento.
- Opciones de despliegue: no disponibles actualmente. La model card menciona Ollama en el contexto de un «cerebro de chat» con voz Mezna, pero el enlace está truncado y no se detalla el despliegue del modelo TTS. Las herramientas habituales como vLLM, TGI o llama.cpp no están documentadas para este modelo.
- Latencia y throughput: el RTF estimado es de 0.15–0.34 en CPU, lo que implica que se genera audio más rápido que el tiempo real (por ejemplo, 1 segundo de audio se sintetiza en 0.15–0.34 segundos). No se ofrecen datos de throughput bajo cargas concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Mezna-TTS-82M | 82M | StyleTTS2 + ISTFTNet | Árabe emiratí (ar-AE) | Apache-2.0 | No publicados (repo 0.0 GB) |
| Kokoro-82M (hexgrad) | 82M | StyleTTS2 + ISTFTNet | Multilingüe (incluye inglés, japonés, etc.) | Apache-2.0 | Publicados en HuggingFace |
| Modelos TTS comerciales (Azure Edge) | no disponible | Red neuronal propietaria | Árabe emiratí (ar-AE) | Propietaria | Solo mediante API |

No se han encontrado más modelos comparables en la información disponible. Mezna-TTS-82M se diferencia de Kokoro-82M por su frontend específico para el dialecto emiratí y su léxico de pronunciación, pero al carecer de pesos publicados, su funcionalidad real depende actualmente de la voz de Edge como solución provisional.

## Limitaciones y advertencias

- Los pesos del fine-tuning no están publicados. El repositorio tiene un tamaño de 0.0 GB y no contiene el archivo `kokoro_mezna_82M.pth`, por lo que el modelo no puede utilizarse como TTS independiente en su estado actual.
- Los samples de audio de la model card no corresponden a Mezna, sino a la voz `ar-AE-FatimaNeural` de Microsoft Edge, que se usa como stand-in hasta que se completen los pesos del modelo.
- El soporte de idioma se limita al dialecto emiratí (ar-AE). No se menciona soporte para otros dialectos árabes ni para el árabe estándar moderno, lo que puede limitar su uso en contextos panarábigos.
- No hay información sobre el dataset de entrenamiento, su composición ni el número de tokens, lo que impide evaluar la cobertura de vocabulario o posibles sesgos.
- Existe riesgo de errores de pronunciación para palabras fuera del léxico de 68 entradas. El frontend incluye fallbacks como la conversión de «ة» a «ه» y el prefijo «ال-», pero no se han publicado evaluaciones de robustez.
- La licencia Apache-2.0 permite uso comercial, pero al no haber pesos disponibles, la explotación comercial del modelo en su forma actual no es viable.
- La fecha de creación del repositorio (2026-09-06) parece ser un error del sistema, ya que es una fecha futura; no afecta a las capacidades del modelo pero puede indicar problemas de metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/seyhunak/Mezna-TTS-82M
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- (Los resultados de búsqueda web no aportan enlaces adicionales relevantes; los hilos de DATEV Community son ajenos al modelo.)
