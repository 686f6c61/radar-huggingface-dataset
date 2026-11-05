# eraldohug/Paradee-8M-PtBr

## Resumen

Paradee-8M Pt-BR es un modelo de síntesis de voz (text-to-speech) ultraligero especializado en portugués de Brasil, con 7,88 millones de parámetros. Lo publica el usuario eraldohug en HuggingFace y se obtiene por destilación de las voces brasileñas `pf_dora` y `pm_alex` del modelo Kokoro-82M, reutilizando la arquitectura Paradee-8M v1.2 de Sahil Mahendrakar. El resultado es un TTS que conserva la prosodia del modelo profesor con una reducción de tamaño de más de un orden de magnitud.

Su relevancia actual reside en el binomio tamaño/velocidad: el checkpoint ONNX cuantizado en int8 ocupa 8,46 MB por voz, frente a los más de 325 MB de Kokoro-82M, y genera audio a 24 kHz en una sola hebra de CPU a entre 25 y 50 veces el tiempo real (un segundo de habla en 20-40 ms). Esto lo sitúa en el terreno de la inferencia en navegador, dispositivos móviles y microcontroladores, sin necesidad de GPU.

El modelo se distribuye únicamente en formato ONNX (con variantes int8 y fp32 por voz) y está pensado para integrarse con el motor G2P en C/C++ `phonemas_ptbr`, que permite ejecución sin asignación dinámica de memoria en hardware embebido como ESP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M v1.2 (arquitectura de TTS destilada; detalles internos de capas no disponibles) |
| Parametros totales | 7,88 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | int8 (recomendado) y fp32 |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`paradee_dora_int8.onnx`, `paradee_dora.onnx`, `paradee_alex_int8.onnx`, `paradee_alex.onnx`); se mencionan tambien checkpoints PyTorch dedicados por voz |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Voces incluidas | `pf_dora` (femenina) y `pm_alex` (masculina) |
| Tamano del repo | 0,2 GB |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.2 (profesor: hexgrad/Kokoro-82M) |

## Arquitectura y entrenamiento

Paradee-8M Pt-BR es un modelo de destilación: parte de las voces brasileñas `pf_dora` y `pm_alex` de Kokoro-82M como profesor y las comprime en la arquitectura Paradee-8M v1.2, de 7,88 M de parámetros. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de destilación ni si se aplicaron etapas de RLHF o DPO; tampoco se detalla la topología interna (número de capas, dimensión oculta, mecanismo de atención) más allá de la referencia a la arquitectura Paradee.

La innovación técnica destacable es la eficiencia extrema del pipeline: cada voz tiene su propio checkpoint ONNX optimizado, con una variante int8 de 8,46 MB que mantiene prosodia e entonación limpias a 24 kHz. El diseño prescinde de GPU y está orientado a ejecución en una sola hebra de CPU, lo que habilita despliegues en navegador, móvil y microcontroladores. El ecosistema se completa con el motor G2P `phonemas_ptbr`, escrito en C/C++ con filosofía zero-heap, que convierte texto portugués en fonemas sin reservas dinámicas de memoria y encaja con el modelo en entornos embebidos.

## Capacidades

- Síntesis de voz (text-to-speech) en portugués de Brasil a 24 kHz mono, con prosodia e entonación naturales según la model card.
- Dos voces preentrenadas: Dora (`pf_dora`, femenina, descrita como natural, expresiva y amigable) y Alex (`pm_alex`, masculina, descrita como clara, profesional y asertiva).
- Inferencia en CPU pura, sin GPU, a entre 25x y 50x el tiempo real en una sola hebra.
- Ejecución en navegador, dispositivos móviles, servidores y microcontroladores (por ejemplo ESP32 con el motor G2P `phonemas_ptbr`).
- Cuantización int8 con degradación de calidad no cuantificada en la información disponible.
- No se documentan capacidades de clonación de voz, control de estilo, emoción explícita, tool calling ni procesamiento multimodal más allá del texto a audio.
- Cobertura lingüística limitada al portugués de Brasil; no se declaran otros idiomas.

## Casos de uso

- Lectura por voz en aplicaciones móviles offline: el checkpoint int8 de 8,46 MB se empaqueta dentro del binario de la app y sintetiza texto en el propio dispositivo sin conexión ni GPU, con latencia de 20-40 ms por segundo de audio.
- Asistentes de voz embebidos en microcontroladores: con el motor `phonemas_ptbr` y el modelo int8, un ESP32 puede generar respuestas habladas en portugués para domótica o dispositivos de bolsillo, donde Kokoro-82M no cabría.
- Accesibilidad web: integración en el navegador mediante ONNX Runtime Web para leer contenido de páginas a usuarios con discapacidad visual, sin enviar texto a servidores externos y con independencia de la latencia de red.
- Sistemas de anuncios y megafonía en comercios y transporte: generación de avisos pregrabados o dinámicos en portugués de Brasil con dos timbres distintos (Dora y Alex) para alternar mensajes informativos y de servicio.
- Audioguías y contenido turístico localizado: síntesis de guiones en pt-BR dentro de aplicaciones de museos o rutas turísticas que funcionan sin conectividad en el dispositivo del visitante.
- Prototipado rápido de interfaces conversacionales: al ser Apache 2.0 y ejecutarse en CPU, sirve para validar flujos de voz en un portátil antes de invertir en modelos TTS mayores o servicios en la nube.
- Generación de audio para pruebas automatizadas: creación de clips de voz en CI para tests de pipelines de audio, con coste computacional despreciable y sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MOS, WER, similitud con el profesor) en la información disponible. Los únicos datos cuantitativos aportados por el autor son de eficiencia:

| Metrica | Paradee-8M Pt-BR (int8) | Kokoro-82M (referencia) |
|---|---|---|
| Parametros | 7,88 M | 82 M |
| Tamano por voz | 8,46 MB | >325 MB |
| Velocidad en CPU (1 hebra) | 25x-50x tiempo real | no disponible |
| Latencia por segundo de audio | ~20-40 ms | no disponible |
| Frecuencia de muestreo | 24 kHz mono | no disponible |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. En GPU, el consumo de memoria sería inferior a 100 MB incluso en fp32.
- GPU recomendadas: no se especifican; cualquier GPU es sobredimensionada para 7,88 M de parámetros.
- CPU: funciona en una sola hebra; es el entorno objetivo declarado.
- Dispositivos consumer: cabe en cualquier portátil, móvil, Raspberry Pi y microcontroladores tipo ESP32 (con el motor G2P `phonemas_ptbr`).
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: 20-40 ms por segundo de audio generado en una hebra de CPU, equivalente a 25x-50x tiempo real según el autor.
- Almacenamiento: 8,46 MB por voz en int8; el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano por voz | Idiomas | Licencia | Ejecucion en CPU/edge |
|---|---|---|---|---|---|
| Paradee-8M Pt-BR | 7,88 M | 8,46 MB (int8) | pt-BR | Apache 2.0 | Si, 25x-50x tiempo real en 1 hebra |
| Kokoro-82M (profesor) | 82 M | >325 MB | multiple (incluye pt-BR) | Apache 2.0 (segun model card de Kokoro) | Si, pero con mayor coste |
| Paradee-8M v1.2 (base) | 8 M (aproximado) | no disponible | no disponible | no disponible | Si (arquitectura de referencia) |

La comparación cuantitativa de calidad (MOS, naturalidad) entre Paradee-8M Pt-BR y Kokoro-82M no está disponible en la información proporcionada; el autor ofrece muestras de audio comparativas en el repositorio, pero sin métricas objetivas.

## Limitaciones y advertencias

- Cobertura lingüística restringida al portugués de Brasil; no se declara soporte de portugués europeo ni de otros idiomas.
- Solo dos voces (Dora y Alex); no hay clonación de voz ni control explícito de emoción o estilo.
- La destilación desde Kokoro-82M puede introducir pérdida de naturalidad y prosodia respecto al profesor; no se han publicado métricas que lo cuantifiquen.
- Riesgo de errores de pronunciación en palabras poco frecuentes, siglas, números y nombres propios, dependiente del motor G2P `phonemas_ptbr` y no documentado en detalle.
- No se documentan sesgos demográficos, acentos regionales ni comportamiento ante texto malformado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Paradee-8M v1.2 y de Kokoro-82M, cuyas licencias no se detallan en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación independiente.
- Al ser un modelo TTS, no soporta tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con los criterios de un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eraldohug/Paradee-8M-PtBr
- Modelo base Paradee-8M v1.2: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Motor G2P en C/C++ `phonemas_ptbr`: https://github.com/astrowar/paradee_pt
- Muestras de audio y frases de prueba: https://huggingface.co/eraldohug/Paradee-8M-PtBr/tree/main/samples
