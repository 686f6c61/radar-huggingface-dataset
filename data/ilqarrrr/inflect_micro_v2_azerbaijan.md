# ilqarrrr/Inflect_Micro_v2_Azerbaijan

## Resumen

Inflect_Micro_v2_Azerbaijan es un modelo de síntesis de voz (text-to-speech) en azerí desarrollado por el usuario ilqarrrr, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune del modelo base `owensong/Inflect-Micro-v2` de Owen Song, adaptado específicamente al azerí mediante 23.088 clips de entrenamiento destilados de un TTS docente, más 471 clips de validación. Forma parte del proyecto open source Avaz, cuyo objetivo es ofrecer TTS natural en dispositivos de gama baja sin dependencia de servidores ni APIs.

El modelo emplea una arquitectura VITS compacta con solo 9.356.513 parámetros, genera audio mono a 24 kHz con una única voz y funciona íntegramente offline. Según el autor, es entre 2 y 4 veces más rápido que el tiempo real en la CPU de un portátil, y su exportación ONNX alcanza un factor de tiempo real de 0,25 en un solo hilo. Esta eficiencia lo sitúa como una opción viable para aplicaciones en navegador, dispositivos móviles y entornos con recursos limitados.

Su relevancia actual radica en la escasez de recursos TTS para lenguas de bajos recursos como el azerí. El modelo incluye una capa de texto específica (normalización de dígitos, numerales romanos, fechas, unidades y abreviaturas, además de un frontend de acentuación sobre eSpeak NG) que resuelve problemas que el checkpoint por sí solo no puede abordar. El proyecto tiene previsto ampliar a turco y ruso en futuras versiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (compacta) |
| Parámetros totales | 9.356.513 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | int8 para el decoder ONNX (`decode.onnx`), generado con `tools/quantize_decoder.py` |
| Idiomas soportados | azerí (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (raíz del repo), ONNX (`onnx/`), WAV de muestras (`samples/`) |

## Arquitectura y entrenamiento

El modelo se basa en VITS en su variante compacta, una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un predictor de duraciones, un flujo normalizador y un decoder generativo. El checkpoint parte del primer modelo azerí del proyecto (los 410 tensores) y continúa el entrenamiento hasta el paso 20.000, seguido de una fase de pulido del decoder con discriminadores más fuertes; el paso 30.000 es el exportado final. Los datos de entrenamiento consisten en 23.088 clips destilados de un TTS docente, con 471 clips adicionales reservados para validación.

La capa de texto previa al modelo realiza tres funciones críticas: censura de obscenidades, reescritura de dígitos, numerales romanos, fechas, unidades y abreviaturas a palabras habladas (por ejemplo, `II` → `İkinci`, `01/09/1939` → `bir sentyabr min doqquz yüz otuz doqquzuncu il`, `25%` → `iyirmi beş faiz`), y segmentación de frases en bloques de aproximadamente 15 palabras, ya que la entonación del modelo se aplana hacia el final de oraciones largas. El frontend de acentuación, integrado en el paquete, corrige las marcas de estrés que eSpeak NG coloca en casi todas las palabras mediante reglas validadas por un hablante nativo. La exportación ONNX consta de dos grafos (`duration.onnx` y `decode.onnx`) con un error de paridad de 7e-9 respecto a PyTorch.

## Capacidades

- Síntesis de voz en azerí con salida mono a 24 kHz y una única voz.
- Funcionamiento completamente offline: sin servidor, sin API key y sin red en inferencia.
- Inferencia en CPU con velocidad de 2 a 4 veces el tiempo real en un portátil; factor de tiempo real de 0,25 en ONNX con un solo hilo.
- Normalización de texto integrada: dígitos, numerales romanos, fechas, unidades, abreviaturas y censura de obscenidades.
- Frontend de acentuación sobre eSpeak NG con reglas validadas por hablante nativo.
- Segmentación automática de frases largas en bloques de ~15 palabras para preservar la entonación.
- Exportación ONNX con cuantización int8 del decoder para ejecución en navegador mediante ONNX Runtime Web.
- API Python (`AzTTS`) para integración en pipelines, con normalización y chunking automáticos.
- CLI (`say.py`) para generación rápida de audio desde línea de comandos.
- No soporta clonación de voz, múltiples hablantes ni control de emociones.

## Casos de uso

- Lectura por voz de contenido web en azerí: el modelo puede integrarse en el navegador mediante ONNX Runtime Web y el playground ya funcional, permitiendo leer artículos o noticias sin enviar texto a servidores externos y preservando la privacidad del usuario.
- Asistentes de voz en dispositivos móviles: con 9,36M de parámetros y ejecución 2-4 veces más rápida que el tiempo real en CPU, cabe en teléfonos de gama media y permite respuestas habladas en azerí sin conexión a internet.
- Accesibilidad para personas con discapacidad visual: la normalización de fechas, unidades y numerales romanos hace que la salida sea comprensible en contextos como lectura de documentos, precios o fechas históricas, donde un TTS genérico fallaría.
- Sistemas de anuncios públicos y transporte: el modelo puede generar avisos pregrabados o dinámicos en azerí para estaciones, aeropuertos o comercios, ejecutándose en hardware embebido de bajo coste gracias a su reducido tamaño.
- Aplicaciones educativas de aprendizaje de idiomas: la pronunciación con acentuación corregida por hablante nativo y la velocidad de inferencia permiten generar ejercicios de escucha y repetición bajo demanda en entornos sin conectividad.
- Integración en pipelines de accesibilidad para e-learning: el CLI y la API Python permiten convertir material didáctico en audio de forma automatizada, con segmentación de frases largas que mantiene una entonación aceptable en lecciones extensas.
- Prototipado de interfaces conversacionales en azerí: desarrolladores que necesiten un TTS funcional para validar productos de voz pueden desplegarlo localmente sin coste de API ni latencia de red, sustituyéndolo después por una solución comercial si el proyecto escala.

## Benchmarks y rendimiento

El model-index oficial no declara resultados de benchmarks (`results: []`). Sin embargo, la model card incluye mediciones propias sobre 471 frases de validación no vistas durante el entrenamiento:

| Medida | Teacher | v1 | v2.1, variation 0.667 | v2.1, variation 0.3 |
|---|---:|---:|---:|---:|
| Error de palabra Whisper, 416 frases sin números | 2,07% | 4,84% | 3,65% | ~2,65% (0,333) |
| Error de palabra, frases de 1-5 palabras | 0,8% | 9,2% | 5,7% | 3,2% |
| SQUIM PESQ | 4,20 | 3,47 | 4,18 | -- |
| Claridad armónica 2-4 kHz (buzz score, mayor es mejor) | 10,6 | 6,4 | 8,8 | 8,9 |
| Anillo fijo, proporción de frames | 13% | 20% (6 kHz) | 15% | 15% |
| Rango de tono (semitonos) | 16,8 | 13,0 | 15,3 | 15,0 |
| Final de pregunta sí/no (semitonos) | +2,9 | -3,0 | -1,2 | -1,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño del modelo (9,36M de parámetros); el repo completo ocupa 0,2 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo con latencia mínima, pero el diseño está optimizado para CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU de portátil; no necesita GPU dedicada.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (incluido ONNX Runtime Web para navegador), CLI (`say.py`) y API Python (`AzTTS`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2-4 veces más rápido que el tiempo real en CPU de portátil; factor de tiempo real de 0,25 en ONNX con un solo hilo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inflect_Micro_v2_Azerbaijan | 9,36M | no aplica | RTF 0,25 en ONNX (1 hilo); PESQ 4,18 | Apache 2.0 | Hugging Face, GitHub, playground |
| owensong/Inflect-Micro-v2 (base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| TTS docente (usado para destilación) | no disponible | no aplica | Error de palabra Whisper 2,07% | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en azerí en la documentación proporcionada. El modelo base `owensong/Inflect-Micro-v2` sirve como referencia directa, pero no se detallan sus especificaciones completas ni su rendimiento en azerí.

## Limitaciones y advertencias

- Una sola voz: no hay clonación de voz, soporte multi-hablante ni control de emociones.
- Con 9,36M de parámetros, el habla es clara e inteligible pero no completamente natural; la entonación se aplana en oraciones largas, lo que obliga a segmentar en bloques de ~15 palabras.
- El modelo requiere la capa de texto azerí del repositorio de GitHub para funcionar correctamente; los pesos por sí solos son insuficientes.
- El error de palabra en frases cortas (1-5 palabras) es del 3,2% en la mejor configuración, superior al 0,8% del TTS docente, lo que puede afectar a comandos o respuestas breves.
- El final de pregunta sí/no tiene una entonación negativa (-1,2 a -1,8 semitonos) frente a la positiva del docente (+2,9), lo que puede sonar poco natural en interrogaciones.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la normalización de texto puede producir lecturas incorrectas en casos no cubiertos por las reglas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias (eSpeak NG, phonemizer) y del dataset de entrenamiento.
- El modelo solo soporta azerí; turco y ruso están anunciados como próximos pero no disponibles en esta versión.
- La calidad depende de la configuración de `variation`: valores bajos (0,3) mejoran la inteligibilidad pero pueden reducir la naturalidad.

## Enlaces

- [Hugging Face: ilqarrrr/Inflect_Micro_v2_Azerbaijan](https://huggingface.co/ilqarrrr/Inflect_Micro_v2_Azerbaijan)
- [Playground en el navegador](https://huggingface.co/spaces/ilqarrrr/Inflect_Micro_v2_Azerbaijan)
- [Repositorio GitHub del proyecto](https://github.com/HuseynliIlqar/Inflect_Micro_v2_Azerbaijan)
- [Modelo base: owensong/Inflect-Micro-v2](https://huggingface.co/owensong/Inflect-Micro-v2)
- [Dataset: ughurabbasov/azerbaijani-tts-dataset](https://huggingface.co/datasets/ughurabbasov/azerbaijani-tts-dataset)
- [Muestras de audio](https://huggingface.co/ilqarrrr/Inflect_Micro_v2_Azerbaijan/tree/main/samples)
