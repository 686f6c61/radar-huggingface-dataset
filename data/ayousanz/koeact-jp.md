# ayousanz/KoeAct-JP

## Resumen

KoeAct-JP es un modelo muy pequeño (2,59 millones de parámetros) de comprensión del lenguaje hablado desarrollado por el usuario ayousanz y publicado en Hugging Face. Su función es convertir directamente voz en japones a llamadas de función (Action JSON) para un esquema fijo de 11 herramientas, sin pasar por una transcripción intermedia. Está diseñado para ejecutarse completamente en local, sin nube ni claves de API, tanto en la CPU de un PC como en un microcontrolador ESP32-S3 (concretamente en una M5Stack CoreS3).

El modelo reutiliza el codificador de voz Ralomi (2,05 M de parámetros, un DFSMN causal de 8 capas, del que se ajustan los bloques 5 a 8) y le añade un decodificador de 0,54 M de parámetros con restricciones gramaticales que genera las piezas del Action JSON. Es relevante porque aborda el function calling por voz en dispositivos con recursos muy limitados, un nicho donde los modelos grandes de audio no son viables, y porque publica benchmarks con metodología pre-registrada y evidencia reproducible.

En comparación con un sistema en cascada equivalente (transcripción con Ralomi seguida de JapaneseTinyAgentLM-kana), KoeAct-JP logra un 93,2 % de exactitud (EM) frente al 83,6 % del cascada, con menor latencia en hardware real (0,53 s frente a 1,54–1,67 s en CoreS3) y menos de la mitad de parámetros. Se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador DFSMN causal de 8 capas (Ralomi, 2,05 M) + decodificador Transformer de 2 capas (0,54 M) con restricción gramatical |
| Parametros totales | 2.590.941 (2,59 M) |
| Parametros activos | 2,59 M (no es MoE; 1,57 M se ajustaron durante el entrenamiento) |
| Longitud de contexto | No disponible (procesa segmentos de audio de 0,4 s de forma secuencial en el dispositivo) |
| Tipos de cuantizacion | W16A16 (`.espdl`, 4,81 MB para el codificador) e int16 para el decodificador (1,13 MB) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), `.espdl` (ESP32-S3) y binarios int16 para el decodificador en el dispositivo |

## Arquitectura y entrenamiento

La arquitectura consta de dos etapas. La primera es el codificador de voz Ralomi, un DFSMN (Deep Feedforward Sequential Memory Network) causal de 8 capas con 2,05 millones de parámetros, que recibe audio mono a 16 kHz convertido en características log-Mel de 40 dimensiones. De este codificador se mantienen congeladas la capa de entrada y los bloques 1 a 4, mientras que los bloques 5 a 8 y el clasificador CTC auxiliar (1,02 M de parámetros en total) se ajustan durante el entrenamiento. La segunda etapa es un decodificador de 0,54 millones de parámetros (2 capas de Transformer decoder) que toma las salidas de las capas 4 y 8 del codificador y genera las piezas del Action JSON bajo restricciones gramaticales, garantizando salidas válidas para el esquema fijo de 11 herramientas (máximo 2 llamadas por emisión). El rechazo de emisiones fuera de dominio se realiza mediante la probabilidad `p_act` de que la primera pieza no sea `[]`: si queda por debajo del umbral (0,97 para el seed publicado), la salida es `[]`.

Los datos de entrenamiento combinan textos y etiquetas de Action de JapaneseTinyAgentLM-Action-Synth, textos de emisiones fuera de dominio de Amazon MASSIVE (ja-JP), plantillas programáticas para valores numéricos y negaciones, síntesis de voz con Irodori-TTS VoiceDesign (120 voces diseñadas por caption, sin clonar voces reales), 3.000 clips de habla no relacionada de ReazonSpeech como ejemplos negativos, y OpenSLR SLR28 para aumentación con ruido y reverberación. En total se usaron 59.935 frases de texto y 158.783 emisiones sintéticas, de las cuales el modelo final se entrenó con 107.964 copias (originales y aumentadas) de la condición de 120 voces. Algunos valores numéricos (ángulos 25/37/75/105/135/165 y niveles 23/47/66/85) se reservaron exclusivamente para evaluación. No se emplearon salidas de APIs comerciales ni en los datos ni en las etiquetas.

## Capacidades

- Mapeo directo de voz japonesa a Action JSON (function calling) para un esquema fijo de 11 herramientas, sin transcripción intermedia.
- Rechazo de emisiones fuera de dominio y de negaciones («やっぱりライトは消さないで» produce `[]`), con tasa de falsa activación por negación del 0,05 %.
- Salida estructurada y válida por construcción gracias al decodificador con restricción gramatical.
- Ejecución totalmente en local y offline: CPU de PC (PyTorch/ONNX) o ESP32-S3 (M5Stack CoreS3), sin claves de API ni conexión a la nube.
- Procesamiento en streaming en el dispositivo con segmentos de 0,4 s (versión `.espdl` W16A16).
- Robustez al ruido: 88,1 % de EM a SNR 0 dB.
- No soporta: vocabulario libre ni adición de herramientas en tiempo de inferencia, transcripción, identificación del hablante ni idiomas distintos del japones.

## Casos de uso

- Control por voz de robots pequeños (por ejemplo, el tipo «stack-chan»): el modelo convierte órdenes habladas como «gira la cara 45 grados a la derecha» en llamadas JSON para los actuadores, ejecutándose en el propio microcontrolador sin nube.
- NPCs de videojuegos con comandos de voz de esquema fijo: la salida JSON puede integrarse directamente en la lógica del juego; la model card menciona integración futura en Unity y Godot.
- Asistentes de domótica offline en microcontroladores: al funcionar en una ESP32-S3 con latencia de 0,53 s desde el fin de la emisión, permite comandos como encender o apagar luces sin depender de servicios cloud.
- Prototipado de interfaces de voz con privacidad total: la demo en el navegador (Static Space de Hugging Face) procesa el audio sin que salga del dispositivo, útil para validar casos de uso antes de desplegar.
- Embebidos con presupuesto de memoria muy ajustado: con 4,81 MB para el codificador y 1,13 MB para el decodificador en formato cuantizado, cabe en la flash de un ESP32-S3.
- Sistemas de voz resistentes al ruido doméstico: la evaluación muestra degradación contenida (91,1 % de EM a SNR 5 dB), adecuada para entornos con ruido de fondo moderado.

## Benchmarks y rendimiento

Comparativa contra un cascada entrenado con los mismos datos (transcripción con Ralomi → JapaneseTinyAgentLM-kana, variante B1n). Los valores de KoeAct-JP son medias de 5 seeds; entre paréntesis, el seed publicado (s14).

| Metrica | KoeAct-JP | Cascada (B1n) | Condicion |
|---|---:|---:|---|
| EM (coincidencia exacta de Action) | **93,2 %** (s14: 93,6 %) | 83,6 % | Test sintetico, 6.850 emisiones (3.425 frases x clean y ruido, voces no vistas) |
| EM a SNR 0 dB | **88,1 %** (s14: 88,7 %) | 71,1 % | Mismo test, copia con ruido |
| Tasa de error en negaciones | **0,05 %** | 0,60 % | Mismo test |
| Falsa activacion (FA/h) | 1,57/h (s14: 1,07) | **1,38/h** | 14,02 h de audio no relacionado (MUSAN, FSD50K) |
| Latencia P50 en PC | **7,1 ms** | 16,6 ms | CPU Apple M1, 1 hilo, emision media de 4,75 s |
| Latencia P50 en CoreS3 (fin de emision → Action) | **0,53 s** (medido) | 1,54–1,67 s (medido) / 1,30–1,44 s (estimado) | ESP32-S3 |
| EM en val sintetica (gate, clean / aumentada) | 95,9 % / 90,4 % | 93,4 % / 76,9 % | Val D01, 1.975 emisiones |
| EM subset de valores numericos no vistos | 89,6 % | 63,5 % | Test sintetico |
| Precision de valores numericos (test completo) | 95,7 % | 91,8 % | Test sintetico |

La diferencia de EM a favor de KoeAct-JP es de +9,5 puntos (intervalo de confianza del 95 %: +8,7 a +10,4, bootstrap pareado por frase). La evaluación se pre-registró antes de ejecutarse y los agregados están disponibles en el directorio `evidence/` del repositorio. Todos los datos proceden de voz sintetica; el modelo no se ha validado con hablantes reales.

## Requisitos de hardware

- VRAM/memoria para inferencia: extremadamente baja. En PC, el modelo completo ocupa unos pocos MB (el repo pesa aproximadamente 0 GB según Hugging Face); en el dispositivo, 4,81 MB (codificador `.espdl` W16A16) + 1,13 MB (decodificador int16).
- GPU recomendadas: no se necesita GPU. La inferencia en CPU Apple M1 con un solo hilo tarda 7,1 ms (P50) por emision de unos 4,75 s.
- Consumer GPUs: innecesarias; cualquier equipo moderno sirve, y de hecho el objetivo es un ESP32-S3 (M5Stack CoreS3).
- Opciones de despliegue: PyTorch u ONNX en PC mediante el paquete `koeact.runtime` incluido en el repo; firmware propio para ESP32-S3 (codigo fuente en `cores3/firmware/`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje convencional).
- Latencia y throughput: P50 de 0,53 s desde el fin de la emision hasta el Action en CoreS3 (medido); 7,1 ms de procesamiento por emision en CPU de PC.

## Comparativa con modelos similares

| | KoeAct-JP | Cascada B1n (Ralomi + JapaneseTinyAgentLM-kana) | Whisper + LLM (alternativa generica) |
|---|---|---|---|
| Parametros | 2,59 M | 5,20 M | Decenas o cientos de M (no disponible en detalle) |
| Contexto | Audio en segmentos de 0,4 s (dispositivo) | No disponible | No disponible |
| EM (test sintetico) | 93,2 % | 83,6 % | No disponible |
| FA/h | 1,57 | 1,38 | No disponible |
| Latencia en CoreS3 | 0,53 s | 1,54–1,67 s | No viable en ESP32-S3 |
| Licencia | Apache-2.0 | Apache-2.0 | Variable |
| Idioma | Japones | Japones | Multilingue |
| Esquema de tools | Fijo (11 tools) | Fijo | Flexible |

La comparación más relevante es la del cascada, entrenado con los mismos datos: KoeAct-JP supera al cascada en EM (+9,5 pt), especialmente en condiciones ruidosas y en valores numéricos no vistos, con menos de la mitad de parámetros y unas tres veces menos latencia en el dispositivo. Su punto débil es la tasa de falsas activaciones sobre voz humana no relacionada (1,57/h frente a 1,38/h del cascada) y sobre música (1,05/h frente a 0,42/h). Frente a alternativas genéricas tipo Whisper + LLM, no hay datos publicados en la model card.

## Limitaciones y advertencias

- No se ha validado con hablantes reales: todas las emisiones de evaluación son voz sintetica; el rendimiento con personas reales, a distancia o con ruido real será inferior al publicado.
- Mayor tasa de falsas activaciones que el cascada sobre voz humana no relacionada (4,44/h en FSD50K Human_voice) y sobre música (1,05/h frente a 0,42/h): 1,57 FA/h en total frente a 1,38/h del cascada.
- No apto para control de equipos de seguridad: la tasa de falsa activación no es cero y la model card lo desaconseja explicitamente.
- Esquema de herramientas fijo: no se pueden añadir herramientas en tiempo de inferencia ni usar vocabulario libre.
- Solo japones; no realiza transcripción ni identificación del hablante.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero puede emitir llamadas incorrectas ante emisiones ambiguas o fuera de dominio que superen el umbral de rechazo.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias heterogéneas (CC BY 4.0, CDLA-Sharing-1.0, MIT); el contenido de ReazonSpeech, MUSAN, DEMAND, FSD50K, JESC y ciertos pesos derivados no está incluido en la publicación.
- La integración en Unity/Godot es solo una intención futura; actualmente solo hay soporte Python (PyTorch/ONNX) y firmware ESP32-S3.
- En el dispositivo ESP32-S3, el umbral de rechazo y el ensamblado del JSON final se ejecutan en el PC conectado, no en el microcontrolador.

## Enlaces

- Modelo: https://huggingface.co/ayousanz/KoeAct-JP
- Demo en navegador (Static Space): https://huggingface.co/spaces/ayousanz/KoeAct-JP-demo
- Modelo base: https://huggingface.co/ayousanz/ralomi
- Paper, repositorio de código de entrenamiento y otros enlaces: no disponibles
