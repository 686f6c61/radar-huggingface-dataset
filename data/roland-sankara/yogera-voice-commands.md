# Roland-Sankara/yogera-voice-commands

## Resumen

Yogera Voice Commands es un conjunto de modelos de clasificación de audio basados en CNN pequeñas implementadas con Keras 3, diseñados para el reconocimiento de palabras aisladas (*keyword spotting*) a partir de clips de 1 segundo muestreados a 16 kHz, usando espectrogramas STFT como representación de entrada. Lo desarrolla Roland Sankara en el contexto de la charla *Building ML Models End-to-End with Keras 3* impartida en DevFest Kampala 2026, y se publica bajo licencia Apache 2.0.

El repositorio contiene dos variantes: una para inglés con seis palabras (cat, dog, bird, tree, house) más las clases especiales `_unknown_` y `_silence_`, entrenada sobre Google Speech Commands v0.02, y otra para luganda con 16 palabras grabadas por voluntarios del Proyecto Yogera, que según la model card todavía no está disponible. El modelo resuelve el problema clásico de detección de comandos por voz en entornos con recursos limitados, con un enfoque deliberadamente ligero y didáctico.

Su relevancia actual reside en dos factores: por un lado, demuestra un flujo completo de entrenamiento y despliegue con Keras 3 para tareas de audio; por otro, aborda una lengua de bajos recursos como el luganda, para la que existen muy pocos recursos de reconocimiento de voz públicos. No obstante, la información técnica publicada es muy escasa: no se detallan parámetros, arquitectura exacta ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (Keras 3) sobre espectrogramas STFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio de 1 segundo, 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, lg |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo Keras; tamano 0.0 GB) |

## Arquitectura y entrenamiento

La model card describe «small Keras 3 CNNs» que operan sobre espectrogramas STFT calculados a partir de audio de 1 segundo a 16 kHz. No se especifica el número de capas, canales, función de activación, tamaño del kernel ni el número total de parámetros. Tampoco se documenta el pipeline de preprocesado (tamaño de ventana STFT, solapamiento, número de bins de frecuencia) ni la estrategia de aumento de datos.

En cuanto a los datos, la variante inglesa se entrenó con Google Speech Commands v0.02 (licencia CC BY 4.0), un corpus estándar de palabras aisladas. La variante luganda se basa en 16 palabras grabadas por voluntarios del Proyecto Yogera, pero la propia model card indica que está «coming soon», por lo que no hay información sobre el volumen de grabaciones, hablantes, condiciones acústicas ni proceso de validación. No se menciona el uso de RLHF, DPO ni ninguna técnica de ajuste fino posterior; tampoco innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de audio de palabra aislada (*keyword spotting*) en clips de 1 segundo a 16 kHz.
- Reconocimiento de seis palabras en inglés: cat, dog, bird, tree, house.
- Clases especiales `_unknown_` y `_silence_` para rechazar audio fuera de vocabulario y detectar silencio.
- Variante para 16 palabras en luganda (no disponible todavía según la model card).
- Entrada basada en espectrogramas STFT; no procesa audio en bruto directamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto ni transcripciones, solo etiquetas de clase.
- No soporta visión, audio largo ni streaming continuo más allá de ventanas de 1 segundo.

## Casos de uso

- **Control por voz en dispositivos embebidos**: al ser una CNN pequeña, puede ejecutarse en microcontroladores o SBC (Raspberry Pi, ESP32 con TensorFlow Lite) para activar acciones locales con palabras clave como «cat» o «house», sin depender de la nube.
- **Demostración educativa de pipelines de audio con Keras 3**: sirve como ejemplo completo de preprocesado STFT, entrenamiento y exportación para talleres y cursos, tal como se presentó en DevFest Kampala 2026.
- **Prototipado de interfaces de voz para lenguas de bajos recursos**: la variante luganda, cuando esté disponible, permitirá experimentar con reconocimiento de comandos en una lengua africana con escasos recursos públicos.
- **Filtro de activación (*wake-word*) en asistentes domésticos**: la clase `_silence_` y `_unknown_` permiten descartar audio irrelevante antes de enviar el flujo a un reconocedor más pesado, reduciendo coste computacional.
- **Investigación en keyword spotting comparativo**: útil como línea base ligera frente a modelos más grandes en experimentos académicos sobre Speech Commands v0.02.
- **Aplicaciones de accesibilidad**: comandos vocales simples para controlar funciones básicas en entornos donde no se requiere un vocabulario amplio ni comprensión del lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tipo de modelo (CNN pequeña sobre espectrogramas de 1 segundo) se espera que quepa en menos de 1 GB, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) sería sobradamente suficiente para este tipo de red.
- Cabe en GPU consumer: previsiblemente sí, aunque no se confirma en la documentación.
- Opciones de despliegue: Keras 3 (nativo), exportación a TensorFlow Lite o ONNX no documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Palabras | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yogera Voice Commands (este) | CNN Keras 3 sobre STFT | 6 (inglés) + 16 (luganda, pendiente) | en, lg | Apache 2.0 | HuggingFace |
| Google Speech Commands baseline (TensorFlow) | CNN pequeña | 12–35 | en | Apache 2.0 | TensorFlow Hub |
| Wav2Vec2 / HuBERT fine-tuned para keyword spotting | Transformer auto-supervisado | variable | multilingüe | MIT / Apache 2.0 | HuggingFace |
| Porcupine (Picovoice) | Motor propietario de wake-word | personalizable | multilingüe | Comercial | SDK propietario |

La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible porque la model card no publica esas métricas para este modelo.

## Limitaciones y advertencias

- Vocabulario muy reducido: solo seis palabras en inglés y ninguna variante luganda publicada todavía.
- Entrada restringida a clips de 1 segundo a 16 kHz; no admite audio continuo ni streaming sin segmentación externa.
- No hay métricas de precisión, recall ni matriz de confusión publicadas, por lo que no se puede evaluar su robustez frente a ruido, acentos o hablantes fuera del corpus de entrenamiento.
- Riesgo de falsos positivos y falsos negativos en entornos reales no documentado; las clases `_unknown_` y `_silence_` mitigan parcialmente este problema, pero sin datos de evaluación.
- Sesgos potenciales derivados de Speech Commands v0.02 (hablantes mayoritariamente angloparlantes y condiciones de grabación controladas) no analizados por el autor.
- La variante luganda no está disponible; no puede usarse en producción.
- Licencia Apache 2.0 permite uso comercial, pero al no haber evaluación publicada, el uso en producción conlleva riesgo no cuantificado.
- Repositorio con 0.0 GB de tamaño declarado y 64 descargas: posiblemente los pesos no estén subidos o el tamaño se redondee; conviene verificar los archivos antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roland-Sankara/yogera-voice-commands
- Demo en vivo (Space): https://huggingface.co/spaces/Roland-Sankara/project-yogera
- Google Speech Commands v0.02 (dataset de entrenamiento de la variante inglesa): no se proporciona enlace directo en la model card, pero el corpus es público bajo CC BY 4.0.
- Charla *Building ML Models End-to-End with Keras 3*, DevFest Kampala 2026: no se proporciona enlace en la información disponible.
