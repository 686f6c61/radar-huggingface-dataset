# n4ze3m/tiny-voca

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por n4ze3m, publicado bajo licencia Apache-2.0. Se trata de un modelo extremadamente compacto: 4.537.291 parámetros en total, incluyendo el generador de forma de onda, entrenado desde cero sobre aproximadamente 18 horas de voz sintética. Su rasgo diferencial es la eficiencia: funciona unas 70 veces más rápido que el tiempo real usando cuatro hilos de CPU, lo que lo hace apto para dispositivos sin GPU, navegadores y telefonos.

El modelo ofrece dos voces de inglés americano, F2 (femenina) y M2 (masculina), y produce audio mono a 24 kHz. La entrada de texto se convierte a fonemas mediante dizione, un fonemizador del mismo autor que se distribuye junto con los pesos. No emplea pesos preentrenados de terceros: es un entrenamiento completamente from scratch.

Su relevancia actual radica en la categoría de TTS ultraligero desplegable en el borde (edge): el repositorio ocupa 0,1 GB, los pesos PyTorch en float32 pesan 18,2 MB y la exportación ONNX 21,4 MB, con ejecución verificada en onnxruntime-web (WebAssembly). Es una opción realista para síntesis local en aplicaciones web, moviles o sistemas embebidos donde no cabe un modelo neuronal de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS acústico con generador de forma de onda; detalles de capas no publicados) |
| Parametros totales | 4.537.291 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; limite de inferencia de 512 tokens fonemicos y 32 segundos por enunciado |
| Tipos de cuantizacion | no disponible (se distribuyen pesos float32 en PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en), variante inglés americano |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (opset 17, float32) |
| Voces | F2 (femenina), M2 (masculina) |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Entrada | Texto convertido a fonemas con dizione |
| Pesos preentrenados de terceros | Ninguno |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna (numero de capas, tipo de atención o diseño del decoder acústico). Lo que sí se documenta es que el modelo completo, incluido el generador de forma de onda, suma 4,5 millones de parámetros y que fue entrenado desde cero, sin pesos preentrenados, sobre un corpus de aproximadamente 18 horas de voz sintética. El dataset de entrenamiento está publicado como n4ze3m/tiny-voca.

El pipeline es explícito: el texto se fonemiza con dizione fuera del grafo, y el modelo recibe identificadores de fonemas junto con marcas de acento (0 ninguno, 1 primario, 2 secundario), un identificador de voz, y tres parámetros de control continuo: velocidad, desplazamiento de tono (sumado al log F0) y rango de tono (escala el movimiento de tono alrededor de la media del enunciado). La salida incluye la forma de onda a 24 kHz y las duraciones por token en tramas de 256 muestras. No se documenta el uso de RLHF, DPO ni técnicas de alineación; tampoco decodificación especulativa ni atención lineal.

Como innovación destacable, la exportación ONNX reproduce la salida de PyTorch con una diferencia inferior al 0,6 % de la amplitud de pico, excluyendo la senal de ruido aleatorio que cada runtime genera por su cuenta. Esto permite portar el mismo grafo a onnxruntime-web.

## Capacidades

- Síntesis de voz a partir de texto en inglés americano con dos voces seleccionables (F2 y M2).
- Control fino de prosodia en inferencia: velocidad, desplazamiento de tono (0,058 equivale aproximadamente a un semitono) y rango de tono.
- Procesamiento de texto de cualquier longitud en la CLI de PyTorch: divide por frases y une el audio resultante.
- Manejo de texto con números, horas y fechas en los ejemplos publicados (por ejemplo, "3:30 pm on March 14th"), aunque la normalización textual no se detalla.
- Inferencia en CPU: aproximadamente 70 veces más rápido que tiempo real con cuatro hilos.
- Ejecución en navegador mediante onnxruntime-web (WebAssembly).
- Descarte robusto de frases sin contenido legible (por ejemplo, texto en otro sistema de escritura) y cierre automático de frases sin puntuación final.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en el navegador: el grafo ONNX se ejecuta en onnxruntime-web con WebAssembly, de modo que una aplicación web puede sintetizar frases sin backend ni GPU, con audio a 24 kHz generado localmente.
- Asistentes de voz en moviles y dispositivos embebidos: con 4,5 millones de parámetros y 18,2 MB de pesos, el modelo cabe en el presupuesto de memoria de un telefono y sintetiza a unas 70 veces el tiempo real en cuatro hilos de CPU.
- Accesibilidad y lectura de contenido: convertir artículos, notificaciones o mensajes en audio para usuarios con discapacidad visual o en contextos de manos libres, troceando el texto por frases como hace `speak_text`.
- Generación de avisos y locuciones pregrabadas: producir clips de audio para sistemas de megafonía, tutoriales o interfaces de voz, ajustando velocidad y tono por voz para adaptarse al estilo de cada producto.
- Prototipado rápido de interfaces conversacionales: validar flujos de voz en un producto antes de invertir en un TTS de mayor calidad, usando las dos voces y los controles de prosodia para pruebas de UX.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en local, el texto del usuario no sale del dispositivo, lo que encaja en entornos sanitarios, legales o industriales con requisitos de confidencialidad.
- Generación de audio en pipelines por lotes de bajo coste: sintetizar grandes volúmenes de frases cortas en CPU sin GPU dedicada, con la garantía de que el audio guardado no supera 0,99 de pico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la velocidad de inferencia: aproximadamente 70 veces el tiempo real con cuatro hilos de CPU. No se proporcionan métricas de calidad (MOS, WER, similitud de hablante) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual; el modelo está disenado para CPU. Los pesos float32 ocupan 18,2 MB (PyTorch) y 21,4 MB (ONNX), por lo que la huella de memoria es minima.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU con soporte de ONNX Runtime o PyTorch puede ejecutarlo, pero no aporta una ventaja documentada.
- Compatibilidad con GPU de consumo: sí, con enorme margen; el modelo cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Despliegue: CLI de PyTorch (`python -m tiny_voca.infer`), ONNX Runtime en Python y onnxruntime-web (WebAssembly) en navegador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: aproximadamente 70 veces más rápido que tiempo real en cuatro hilos de CPU. La latencia por petición no se publica; el límite por llamada es de 512 tokens fonemicos y 32 segundos de audio.
- Almacenamiento: repositorio completo de 0,1 GB, incluyendo pesos, exportación ONNX y datos del fonemizador (5,4 MB).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor frente a otros sistemas TTS. La siguiente tabla recoge únicamente los datos verificables del modelo; las columnas de los competidores se dejan como no disponibles para no inventar cifras.

| Modelo | Parametros | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| tiny-voca | 4,5 M | en | Apache-2.0 | PyTorch, ONNX | 70x tiempo real en 4 hilos de CPU; 2 voces |
| Alternativas TTS ligeras (p. ej. Piper, Kokoro) | no disponible | no disponible | no disponible | no disponible | No se han publicado comparaciones en la informacion disponible |

## Limitaciones y advertencias

- Solo inglés americano: el texto en otros sistemas de escritura se descarta y no hay soporte multilingue.
- Calidad de voz limitada por el tamano: 4,5 millones de parámetros y 18 horas de voz sintética implican una expresividad y naturalidad muy por debajo de sistemas TTS de mayor escala; no se publican métricas de calidad.
- Entrenamiento sobre voz sintética: el modelo aprende de un corpus generado artificialmente, lo que puede introducir artefactos o sesgos propios del generador usado para crear los datos.
- Límite por llamada de 512 tokens fonemicos y 32 segundos: el texto más largo debe trocearse por frases; sin puntuación final, la última palabra se corta.
- Picos de amplitud: aproximadamente uno de cada veinte enunciados supera 1,0 de pico, por lo que es necesario escalar la salida antes de guardar muestras de 16 bits.
- Dependencia del fonemizador dizione y de sus datos (5,4 MB) para convertir texto a identificadores; el grafo ONNX no incluye la fonemización.
- Ruido aleatorio no determinista: cada runtime dibuja su propia senal de ruido, de modo que la salida no es bit a bit reproducible entre ejecuciones.
- Sin datos publicados sobre sesgos demográficos, alucinación (aplicable aquí como pronunciación incorrecta) ni robustez ante texto adversario.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio de código: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset de entrenamiento: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Demo en el navegador: https://huggingface.co/spaces/n4ze3m/tiny-voca-studio
