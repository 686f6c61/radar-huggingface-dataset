# mindsoulBCI/mindsoul-emotion

## Resumen

MindSoul Neural AI · Emotion (mindsoul-emotion) es un modelo anunciado por mindsoulBCI, equipo de la empresa Chengdu (Shanghai) Brain Cloud Matrix Technology, orientado a la investigación de patrones de actividad neuronal asociados a estados emocionales a partir de señales EEG. Según su model card, se encuentra en fase de prepublicación: no hay pesos descargables, código de entrenamiento ni resultados de evaluación disponibles en el momento de redactar esta ficha.

El enfoque previsto es un Transformer que extraiga representaciones temporales de señales EEG y las relacione con etiquetas experimentales y autoinformes de los participantes, para explorar la estimación de categorías o dimensiones emocionales. La model card insiste en que la arquitectura concreta, las entradas y salidas y la configuración de entrenamiento se publicarán en la versión oficial, por lo que los detalles técnicos no pueden verificarse todavía.

Su relevancia actual es limitada desde el punto de vista práctico, ya que no existe artefacto utilizable, pero resulta de interés como señal de la actividad en el nicho de modelos fundacionales para BCI (interfaces cerebro-computadora) con fines de investigación afectiva. La licencia es propia (mindsoul-personal-research) y restringe el uso a investigación personal no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dirección planificada; arquitectura concreta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | mindsoul-personal-research (licencia propia, uso personal no comercial) |
| Formato de pesos | no disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

La model card describe únicamente la intención de emplear una arquitectura Transformer para extraer representaciones temporales de señales EEG, combinando etiquetas de tareas experimentales con informes de los participantes. No se especifican número de capas, dimensión oculta, mecanismo de atención, tokenización de la señal ni estrategia de fusión multimodal, y el propio autor indica que estos detalles se harán públicos en la versión formal.

Tampoco hay información sobre volumen de datos, número de sujetos, dispositivos de adquisición, paradigmas de inducción emocional, ni sobre si se prevé entrenamiento con refuerzo o ajuste por preferencias. La card menciona que se planea reportar particiones de entrenamiento, validación y prueba a nivel de sujeto, distinguiendo evaluación intra-sujeto y cross-subject, así como condiciones de dispositivo, líneas base y casos de fallo, pero todo ello queda pendiente de publicación.

## Capacidades

- Análisis de señales EEG orientado a la investigación de patrones neuronales asociados a emociones (capacidad anunciada, no verificable).
- Estimación de categorías o dimensiones emocionales a partir de etiquetas experimentales y autoinformes (objetivo declarado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la card declara zh y en, aunque al tratarse de un modelo sobre señales EEG el alcance real del multilingüismo no está definido.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con plataformas espaciales (Android XR, visionOS, PICO OS 6, PC): mencionada como dirección futura, sin cliente verificable publicado.

## Casos de uso

- Investigación académica en affective computing: el modelo se plantea como base para estudiar correlatos EEG de estados emocionales en protocolos experimentales controlados, con evaluación intra-sujeto y cross-subject.
- Análisis offline de datasets EEG etiquetados: uso en pipelines de investigación para comparar representaciones aprendidas frente a líneas base clásicas (CSP, SVM, redes convolucionales sobre EEG).
- Estudios de variabilidad inter-sujeto: la card prevé reportar error cross-subject, lo que permitiría analizar hasta qué punto las representaciones emocionales generalizan entre participantes.
- Prototipado de interfaces afectivas en investigación: base para experimentar con retroalimentación emocional en entornos de realidad extendida (Android XR, visionOS, PICO OS 6), siempre que se publique una versión funcional.
- Reproducción y auditoría metodológica: el equipo planea liberar configuración de entrenamiento y guías de reproducción, lo que facilitaría la verificación independiente de resultados en publicaciones.
- Docencia y formación en neurotecnología: material de estudio sobre modelado Transformer aplicado a señales fisiológicas, una vez exista versión pública.

Ninguno de estos casos puede ejecutarse hoy: no hay pesos, API ni demo publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que «actualmente no se reportan cifras de rendimiento» y que los benchmarks, condiciones de evaluación y limitaciones se incluirán en la versión oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (sin pesos publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

Al tratarse de un modelo previsto sobre señales EEG y no de un modelo de lenguaje, es probable que los requisitos difieran de los habituales en LLM, pero no hay datos que permitan estimarlos.

## Comparativa con modelos similares

| Modelo | Desarrollador | Modalidad | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mindsoul-emotion | mindsoulBCI | EEG / emoción | no disponible | no disponible | mindsoul-personal-research | Anunciado, sin pesos |
| Alternativas EEG-Transformer | no disponible | EEG | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; la model card no cita líneas base ni trabajos relacionados.

## Limitaciones y advertencias

- Modelo no publicado: no existen pesos, código, demo ni API; cualquier uso en producción es imposible en la fecha de esta ficha.
- Ausencia total de métricas: sin benchmarks ni evaluación cross-subject no es posible valorar la calidad ni la validez científica del enfoque.
- Riesgo de sobreinterpretación: la propia card advierte que la salida del modelo no equivale a un juicio determinado sobre el estado psicológico real de una persona.
- Sesgos potenciales: al depender de etiquetas experimentales y autoinformes, el modelo podría heredar sesgos de los paradigmas de inducción emocional, de la composición de la muestra y de las diferencias culturales en la expresión emocional; no se documenta ningún análisis al respecto.
- Limitaciones de idioma: la card declara zh y en, pero el alcance real del multilingüismo no está definido.
- Restricciones de licencia: uso exclusivamente personal y no comercial; cualquier otro uso requiere autorización expresa del equipo. Esto limita su adopción en productos comerciales.
- Advertencia médica: el contenido de investigación no está destinado a diagnóstico ni tratamiento médico.
- Datos no verificados: la card indica que los datos solo se publicarán tras desidentificación y verificación de autorización de compartición; no hay evidencia de que dicho proceso se haya completado.
- Fecha de creación futura (2026-10-31) en los metadatos de HuggingFace, lo que sugiere un repositorio creado de forma anticipada al lanzamiento real.

## Enlaces

- HuggingFace: https://huggingface.co/mindsoulBCI/mindsoul-emotion
- GitHub del proyecto: https://github.com/pm-kevin-zhang/MindSoul
- GitHub de aplicaciones espaciales y recursos: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web del equipo: https://MindSoul.cn
- Licencia (referenciada en la card): LICENSE dentro del repositorio de HuggingFace
