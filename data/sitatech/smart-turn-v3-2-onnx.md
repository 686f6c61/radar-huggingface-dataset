# sitatech/Smart-Turn-v3.2-ONNX

## Resumen

Smart Turn v3.2 ONNX es una reexportación del modelo de detección de fin de turno (end-of-turn detection) de Pipecat, orientada a su despliegue en entornos de inferencia ligeros y dispositivos móviles. Desarrollado por sitatech a partir de los pesos abiertos de `pipecat-ai/smart-turn-v3`, el modelo resuelve un problema concreto en agentes de voz: decidir si el usuario ha terminado de hablar o simplemente ha hecho una pausa a mitad de frase, para que el agente responda con la latencia adecuada sin interrumpir.

La arquitectura es un encoder Whisper-Tiny (8,0 M de parámetros en total) seguido de un pooling por atención y una cabeza MLP que produce una única probabilidad. La innovación principal de esta exportación es que integra el front-end log-mel de Whisper dentro del grafo ONNX, junto con la normalización de la forma de onda (media cero, varianza unitaria) empleada durante el entrenamiento. Esto permite alimentar directamente PCM a 16 kHz y leer una probabilidad, sin preprocesado externo.

El modelo opera sobre una ventana de 8 segundos de audio y cubre 23 idiomas. Se distribuye en dos variantes: float32 (33,0 MB) e int8 con cuantización dinámica (11,1 MB), ambas con licencia BSD-2-Clause. Es relevante ahora porque los agentes conversacionales por voz necesitan mecanismos de turn-taking de baja latencia que funcionen en el propio dispositivo, y esta exportación está pensada explícitamente para Android y runtimes C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-Tiny + attention pooling + cabeza MLP |
| Parametros totales | 8,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 8 s (128.000 muestras a 16 kHz) |
| Tipos de cuantizacion | float32 e int8 (cuantizacion dinamica de MatMul/Gemm en encoder y cabeza; front-end en float32) |
| Idiomas soportados | 23: arabe, bengali, chino, danes, neerlandes, ingles, finlandes, frances, aleman, hindi, indonesio, italiano, japones, coreano, marathi, noruego, polaco, portugues, ruso, espanol, turco, ucraniano, vietnamita |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de audio construido sobre el encoder de Whisper-Tiny. La señal de entrada, PCM mono a 16 kHz, se procesa mediante un front-end log-mel embebido en el propio grafo ONNX, que incluye la normalización de la forma de onda a media cero y varianza unitaria usada en el entrenamiento original. La secuencia resultante pasa por el encoder, se agrega mediante attention pooling y se proyecta con una cabeza MLP que emite una probabilidad escalar de fin de turno (umbral 0,5).

La entrada tiene forma `[1, 128000]` en float32, con el audio más reciente al final y relleno de ceros al principio cuando el turno es más corto de 8 segundos. La salida es `probability` con forma `[1, 1]`. La reexportación reproduce el grafo fp32 original con un error inferior a 1e-5 sobre la misma entrada mel; la única diferencia es dónde se ejecuta el front-end. La variante int8 aplica cuantización dinámica a los pesos del encoder y la cabeza, y sus probabilidades difieren de fp32 en 0,007 de media, cambiando la decisión en menos del 1 % de los clips. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Clasificación de audio para detección de fin de turno: devuelve la probabilidad de que el usuario haya terminado de hablar.
- Análisis de prosodia, ritmo e entonación directamente sobre audio crudo, sin depender de transcripción.
- Funcionamiento con pausas a mitad de frase: distingue una pausa interna de un endpoint real.
- Cobertura multilingüe de 23 idiomas, incluidos español, inglés, alemán, francés, chino, japonés, hindi y árabe.
- Entrada de audio autocontenida: el front-end log-mel y la normalización están dentro del grafo, sin preprocesado externo.
- Integración con VAD: el modelo está pensado para ejecutarse tras una detección de silencio.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio generativo: es un clasificador de audio, no un modelo generativo.

## Casos de uso

- Agentes de voz en tiempo real: tras una detección de silencio por VAD, el modelo decide si el usuario ha terminado el turno; con latencias medias de 36,3 ms en fp32 y 37,3 ms en int8 sobre Apple M5 Pro, permite respuestas ágiles sin cortar al usuario.
- Atención al cliente automatizada: gestiona conversaciones multi-turno donde el usuario hace pausas naturales; al analizar la prosodia en lugar de la transcripción, evita respuestas prematuras en frases con pausas internas.
- Asistentes de voz en Android: la variante int8 de 11,1 MB y la integración con el SDK speech-android permiten ejecutar la detección de turno en el propio dispositivo, reduciendo latencia y dependencia de la nube.
- Sistemas de dictado y transcripción: determina cuándo cerrar un segmento de transcripción para segmentar el audio correctamente, manteniendo el contexto de la ventana de 8 segundos.
- Agentes conversacionales en C++ embebido: a través de speech-core, el modelo puede integrarse en runtimes nativos con ONNX Runtime y proveedores de ejecución como CPU o CoreML.
- Enrutamiento y control de flujo en pipelines de voz: la probabilidad de fin de turno puede usarse como señal para disparar la respuesta del agente, reiniciar la escucha o mantener el estado de espera.
- Evaluación de calidad de diálogo: la probabilidad de endpoint sirve como métrica auxiliar para analizar interrupciones y tiempos de respuesta en grabaciones de llamadas.

## Benchmarks y rendimiento

Evaluación sobre 1.000 clips del conjunto `pipecat-ai/smart-turn-data-v3.2-test` (shard `train-00000-of-00010.parquet`, umbral 0,5). Latencia medida sobre una ventana de 8 segundos en Apple M5 Pro (macOS 26.5.2) con ONNX Runtime CPU, 2 hilos intra-op, CoreML en CPU + Neural Engine.

| Modelo | Accuracy | Precision | Recall | F1 | FPR | FNR | Latencia media | Latencia p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Upstream `smart-turn-v3.2-gpu.onnx` (entrada mel) | 92,90 % | 0,912 | 0,944 | 0,927 | 8,48 % | 5,61 % | no disponible | no disponible |
| Upstream `smart-turn-v3.2-cpu.onnx` (entrada mel) | 91,70 % | 0,889 | 0,946 | 0,916 | 10,98 % | 5,41 % | no disponible | no disponible |
| `smart-turn-v3.2.onnx` (fp32) | 92,90 % | 0,912 | 0,944 | 0,927 | 8,48 % | 5,61 % | 36,3 ms | 51,4 ms |
| `smart-turn-v3.2-int8.onnx` | 93,00 % | 0,910 | 0,948 | 0,929 | 8,67 % | 5,20 % | 37,3 ms | 50,6 ms |

Notas de rendimiento: el encoder domina el coste; el front-end embebido consume unos 4 ms en un solo hilo y con cuatro hilos la latencia baja a unos 20 ms. En Apple Silicon la variante int8 no es más rápida que fp32 bajo ONNX Runtime; su ventaja principal es el menor tamaño de descarga.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo es de 8,0 M de parámetros y ocupa 33,0 MB en fp32 y 11,1 MB en int8 en disco y en memoria.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo está orientado a CPU, CoreML (CPU + Neural Engine) y entornos móviles.
- Cabe en cualquier GPU consumer y en dispositivos móviles; el tamaño es despreciable frente a la memoria de una RTX 4090 o similar.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CoreML), runtime C++ speech-core, SDK speech-android.
- Latencia y throughput: 36,3 ms de media (p95 51,4 ms) en fp32 y 37,3 ms de media (p95 50,6 ms) en int8 sobre Apple M5 Pro con 2 hilos; aproximadamente 20 ms con 4 hilos. El throughput no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana | Idiomas | Licencia | Formato | Accuracy (test v3.2) |
|---|---|---|---|---|---|---|
| `sitatech/Smart-Turn-v3.2-ONNX` (fp32) | 8,0 M | 8 s | 23 | BSD-2-Clause | ONNX con front-end embebido | 92,90 % |
| `sitatech/Smart-Turn-v3.2-ONNX` (int8) | 8,0 M | 8 s | 23 | BSD-2-Clause | ONNX con front-end embebido | 93,00 % |
| Upstream `smart-turn-v3.2-gpu.onnx` | 8,0 M | 8 s | 23 | BSD-2-Clause | ONNX con entrada mel | 92,90 % |
| Upstream `smart-turn-v3.2-cpu.onnx` | 8,0 M | 8 s | 23 | BSD-2-Clause | ONNX con entrada mel | 91,70 % |

Las alternativas comparadas son las variantes del propio modelo upstream de Pipecat, ya que no se dispone de información sobre otros modelos de detección de fin de turno en la documentación proporcionada.

## Limitaciones y advertencias

- Es un clasificador binario de fin de turno, no un modelo generativo: no produce texto, código ni respuestas.
- Requiere ejecutarse después de un VAD que detecte silencio; no sustituye a la detección de actividad de voz.
- Debe alimentarse con el turno completo (hasta 8 segundos), no solo con el último fragmento; si el usuario reanuda el habla antes de que el agente responda, hay que volver a ejecutarlo sobre el turno completo.
- Ventana limitada a 8 segundos: en turnos más largos solo se conserva la parte final.
- Riesgo de falsos positivos (FPR 8,48 % en fp32) y falsos negativos (FNR 5,61 % en fp32): puede cortar turnos inacabados o mantener la espera en turnos ya terminados.
- La cuantización int8 cambia la decisión en menos del 1 % de los clips, con una diferencia media de probabilidad de 0,007 frente a fp32.
- No se dispone de información sobre sesgos específicos por idioma o acento más allá de la cobertura declarada de 23 idiomas.
- Licencia BSD-2-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad.
- El rendimiento medido corresponde a Apple M5 Pro con ONNX Runtime; en otras plataformas la latencia puede variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sitatech/Smart-Turn-v3.2-ONNX)
- [Modelo base pipecat-ai/smart-turn-v3](https://huggingface.co/pipecat-ai/smart-turn-v3)
- [Repositorio Pipecat smart-turn](https://github.com/pipecat-ai/smart-turn)
- [speech-android (SDK Android)](https://github.com/soniqo/speech-android)
- [Documentación de Android](https://soniqo.audio/getting-started/android)
- [speech-core (runtime C++)](https://github.com/soniqo/speech-core)
- [Documentación de speech-core](https://soniqo.audio/speech-core)
- [Sitio web soniqo.audio](https://soniqo.audio)
- [Blog de soniqo.audio](https://soniqo.audio/blog)
