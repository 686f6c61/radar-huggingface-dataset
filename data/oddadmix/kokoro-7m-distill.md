# oddadmix/Kokoro-7M-Distill

## Resumen

Kokoro-7M-Distill es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por el usuario oddadmix, destilado a partir de Kokoro-82M, un modelo 11 veces mayor. Con 7.477.702 parámetros y un archivo de pesos de 28,7 MB en fp32, su objetivo es llevar la síntesis de voz neuronal a dispositivos sin GPU, incluidos teléfonos, funcionando de forma totalmente offline y sin servidor intermedio. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La arquitectura es la de Kokoro / StyleTTS2: un codificador ALBERT de 12 capas con pesos compartidos sobre secuencias de fonemas, un predictor de prosodia que estima duración, tono y energía, y un decodificador ISTFTNet que termina en una STFT inversa de 20 puntos. El modelo genera audio a 24 kHz y está condicionado por un style pack (`af_msa.pt`), con una única voz disponible.

Su relevancia actual radica en la relación entre tamaño y velocidad: según los datos del autor, en CPU con 4 hilos alcanza un factor de tiempo real (RTF) mediano de 0,0220 sobre 24 frases, es decir, 4,1 veces más rápido que Kokoro-82M y 45 veces más rápido que el tiempo real. Esto lo sitúa como una opción para TTS embebido donde el coste computacional y el consumo de memoria son la restricción principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro / StyleTTS2: ALBERT de 12 capas (pesos compartidos) sobre fonemas, predictor de prosodia e decodificador ISTFTNet con STFT inversa de 20 puntos |
| Parametros totales | 7.477.702 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: el modelo opera sobre secuencias de fonemas y no define una ventana de contexto en el sentido de los modelos de lenguaje |
| Tipos de cuantizacion | No disponible: los pesos se publican en fp32; no se documentan variantes cuantizadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), cargados mediante `load_model.py` y el paquete `kokoro_patched/` incluido en el repositorio |
| Frecuencia de muestreo | 24 kHz |
| Tamano del archivo | 28,7 MB (fp32) |
| Voz | Una unica voz, condicionada por el style pack `af_msa.pt` |
| Modelo profesor | Kokoro-82M (81.810.000 parametros aprox.) |

## Arquitectura y entrenamiento

El modelo reproduce el diseno de Kokoro / StyleTTS2. El reparto de parametros por bloque es el siguiente: decodificador ISTFTNet con 4.062.450 parametros, predictor de prosodia con 2.219.572, `plbert` (12 capas ALBERT compartidas) con 595.520, codificador de texto con 569.280 y una capa de proyeccion con 30.880. Dos decisiones explican el ahorro de tamano: las 12 capas ALBERT comparten un unico bloque de parametros, de modo que la profundidad cuesta 596.000 parametros en lugar de 7 millones, y la duracion se predice sumando 50 puertas sigmoideas por fonema en lugar de regresar un valor escalar.

El entrenamiento es una destilacion de conocimiento desde Kokoro-82M. El profesor emite las duraciones por fonema que generaron su propio audio, de forma que el estudiante entrena contra una alineacion correcta por construccion. La funcion objetivo combina STFT multi-resolucion, L1 sobre duracion, L1 sobre log-mel, un termino de silencio y una perdida de coincidencia de caracteristicas basada en WavLM, junto con discriminadores de espectrograma multi-periodo y multi-resolucion. El autor senala que solo dos terminos adicionales aportan valor real: el termino de silencio corrige el suelo de ruido del decodificador pequeno, que sin el se percibe como un siseo constante, y el termino WavLM es el unico que restringe la fase, ya que el resto de perdidas operan en el dominio de magnitud y sin el la salida resulta sutilmente robotica. No se documentan fases de RLHF ni DPO, algo por otra parte habitual en modelos TTS.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida de audio a 24 kHz.
- Prediccion de prosodia: duracion, tono y energia por fonema, con duraciones derivadas de la suma de 50 puertas sigmoideas por fonema.
- Generacion de una unica voz, definida por el style pack `af_msa.pt`.
- Inferencia completamente offline y en CPU, sin necesidad de GPU ni de servidor.
- Ejecucion en presupuestos de hilos propios de un telefono movil (los datos publicados se midieron con 4 hilos de CPU).
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no, solo ingles.
- Vision, audio de entrada o modo de razonamiento explicito: no disponibles; el modelo es exclusivamente texto a voz.

## Casos de uso

- TTS embebido en aplicaciones moviles offline: con 28,7 MB en fp32 y un RTF de 0,0220 en 4 hilos de CPU, el modelo puede integrarse en una app Android o iOS para leer contenido sin conexion ni llamadas a un servidor.
- Accesibilidad para personas con discapacidad visual: lectura por voz de articulos, mensajes o interfaces en dispositivos de gama baja, donde un modelo de 82 millones de parametros no cumpliria los requisitos de latencia o memoria.
- Asistentes de voz en dispositivos empotrados o IoT: avisos hablados y respuestas en altavoces inteligentes o electrodomesticos con CPU limitada, ya que un segundo de audio se sintetiza en unos 22 ms.
- Aumento de datos para entrenamiento de ASR: generar audio sintetico controlado para ampliar corpus de reconocimiento de voz en ingles, gracias a que las duraciones provienen de una alineacion por fonema correcta por construccion.
- Prototipado de audio en videojuegos y aplicaciones interactivas: voces provisionales para dialogos y avisos de sistema sin coste de API, sustituibles despues por un modelo de mayor calidad.
- Investigacion en destilacion de modelos TTS: el modelo y su receta sirven como caso de estudio reproducible de destilacion de StyleTTS2 a 7 millones de parametros, y el autor indica que la misma arquitectura se emplea en el modelo arabe Nabra-7M-Distill, lo que permite validar un cambio de receta en dos idiomas.
- Notificaciones y avisos en kioscos, terminales de punto de venta o sistemas de megafonia locales: generacion de locuciones puntuales sin dependencia de red, con una voz unica que aporta consistencia de marca.
- Lectura de textos largos troceados: aunque no se documenta una ventana de contexto, el modelo puede procesar parrafos de prosa convencional de forma secuencial dentro de un mismo proceso para producir audio de mayor duracion.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados son mediciones de velocidad en CPU, sobre 24 frases, con 4 hilos y sin GPU, excluyendo la conversion de texto a fonemas en ambos casos:

| Modelo | Parametros | RTF (mediana) | Tiempo de sintesis (mediana) |
|---|---:|---:|---:|
| Kokoro-7M-Distill | 7.477.702 | 0,0220 | 0,081 s |
| Kokoro-82M | 81.810.000 aprox. | 0,0902 | 0,327 s |

Segun el autor, esto equivale a 4,1 veces mas velocidad que el modelo de 82 millones y 45 veces el tiempo real. No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de locutor) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente despreciable. Los pesos en fp32 ocupan 28,7 MB, por lo que el modelo cabe en cualquier GPU con unos pocos cientos de MB libres, y esta pensado para ejecutarse sin GPU.
- GPU recomendadas: no se documenta ninguna. No requiere GPU; cualquier tarjeta (A100, H100, RTX 4090, integradas) es mas que suficiente si se desea usar una.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPU integradas. El caso de uso objetivo es CPU.
- CPU: el dato publicado corresponde a 4 hilos, con un presupuesto de hilos propio de un telefono, no de una estacion de trabajo.
- Opciones de despliegue: PyTorch con `load_model.py` y el paquete `kokoro_patched/` incluido en el repositorio. No se documentan exportaciones a ONNX, TensorFlow Lite ni integraciones con vLLM, llama.cpp, Ollama o TGI; estos ultimos no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF mediano de 0,0220 y 0,081 s por frase sobre 24 frases; aproximadamente 22 ms de computo por segundo de audio generado.
- Advertencia de integracion: es necesario usar `load_model.py` en lugar de `from kokoro import KModel`, porque la configuracion del modelo define `hidden_channels` y `out_channels` del decodificador, que el paquete original de Kokoro fija en 1024 y 512 y provocan un `TypeError`. El paquete parcheado se distribuye en `kokoro_patched/` sin modificar sus valores por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Voz | RTF en CPU (4 hilos) | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|---|
| Kokoro-7M-Distill | 7.477.702 | Ingles | Unica (`af_msa.pt`) | 0,0220 | Apache 2.0 | HuggingFace, 35 descargas y 10 likes en el momento de la consulta |
| Kokoro-82M | 81.810.000 aprox. | Ingles | Multiples style packs | 0,0902 | Apache 2.0 | HuggingFace (modelo profesor) |
| Nabra-7M-Distill | No disponible (en torno a 7 M segun la nomenclatura) | Arabe | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace, mismo autor y misma arquitectura |

No se dispone de datos de benchmarks de calidad auditiva ni de comparativas con otras familias TTS (por ejemplo StyleTTS2 original o modelos comerciales) en la informacion proporcionada, por lo que la comparacion se limita a tamano, velocidad en CPU y licencia.

## Limitaciones y advertencias

- Una sola voz: el modelo esta condicionado por el style pack `af_msa.pt` y no ofrece variacion de locutor.
- Solo ingles: no soporta otros idiomas, a diferencia del modelo hermano Nabra-7M-Distill para arabe.
- Uso obligatorio de `af_msa.pt`: el autor advierte que `af_heart.pt` se mantiene unicamente por compatibilidad con codigo antiguo; el modelo nunca lo vio en entrenamiento y su uso degrada tanto la naturalidad como la inteligibilidad.
- Robustez de texto limitada: funciona mejor con prosa convencional; la puntuacion excesiva y el formato inusual se pasan al front end tal cual, sin normalizacion adicional documentada.
- Dependencia del front end de texto a fonemas: los tiempos publicados excluyen esta conversion, de modo que la latencia total en produccion incluira un componente adicional no cuantificado aqui.
- Suelo de ruido del decodificador: el propio autor indica que el decodificador pequeno tiene un nivel de ruido que el profesor no presenta, audible como siseo constante; el termino de silencio de la perdida lo mitiga, pero no se documenta una eliminacion completa.
- Posibles artefactos y salida robotica: la perdida WavLM se introduce precisamente porque el resto de perdidas no restringen la fase; sin ella la salida resulta sutilmente robotica, lo que indica sensibilidad a la receta de entrenamiento.
- Riesgo de alucinacion en el sentido de los modelos de lenguaje: no aplica, pero si existe riesgo de pronunciacion incorrecta, insercion de silencios o artefactos en entradas fuera del dominio de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgos de locutor, acento o genero; al ser una voz unica, la representacion queda fijada por ese style pack.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y los avisos de atribucion correspondientes.
- Adopcion muy limitada: 35 descargas y 10 likes en el momento de la consulta, con actualizacion mas reciente en septiembre de 2026, lo que implica escasa validacion externa y practicamente ninguna experiencia de produccion documentada.
- Inconsistencia de metadatos: HuggingFace informa de un tamano de repositorio de 0,0 GB, mientras que la model card declara un archivo de pesos de 28,7 MB. Conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oddadmix/Kokoro-7M-Distill
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo hermano en arabe, Nabra-7M-Distill: https://huggingface.co/oddadmix/Nabra-7M-Distill
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
