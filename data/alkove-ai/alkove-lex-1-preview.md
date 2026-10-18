# alkove-ai/alkove-lex-1-preview

## Resumen

alkove-lex-1-preview es un modelo de conversión de grafemas a fonemas (G2P) desarrollado por alkove-ai dentro del SDK de voz on-device Alkove. Convierte una palabra escrita en sus tres pronunciaciones más probables, con sus probabilidades, usando el conjunto de 58 fonemas de alkove-spot. Cubre francés, inglés, español, portugués, italiano, catalán y rumano, e incluye nombres propios y palabras inventadas.

El modelo se distribuye como un ONNX de 1,8 MB cuantizado a int8 (opset 17) y está pensado para ejecutarse en CPU, en navegador mediante WebAssembly y en dispositivos móviles, sin enviar datos a un servidor. Trabaja palabra por palabra, con entradas de hasta 33 caracteres y un prefijo de fonemas de hasta 39 posiciones; no es un modelo de lenguaje general ni procesa frases completas.

Su relevancia está en el despliegue local para wake words personalizadas, comandos de voz y consultas de pronunciación con requisitos de privacidad. Es una versión preview: el autor advierte que los pesos y la interfaz pueden cambiar antes de la versión 1. En 300 palabras reservadas de los 7 idiomas, declara un 86,0 % de acierto en la primera pronunciación, un dato no verificado de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; modelo exportado a ONNX opset 17, sin especificar la arquitectura interna |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de tokens; palabra de hasta 33 caracteres y prefijo de fonemas de hasta 39 posiciones |
| Tipos de cuantización | int8 |
| Idiomas soportados | francés (fr), inglés (en), español (es), portugués (pt), italiano (it), catalán (ca) y rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX opset 17, int8; manifiesto JSON y phonemes.json |
| Tarea | conversión de grafemas a fonemas (pipeline: other) |
| Tamaño del modelo | 1,8 MB |
| Entrada | word int32 [1,33]; lang int32 [1]; prefix int32 [3,39]; pos int32 [1] |
| Salida | logp float32 [3,61] |
| Set fonético | 58 fonemas de alkove-spot; índices 0 padding, 1-58 fonemas, 59 bos, 60 eos |
| Runtime | onnxruntime y onnxruntime-web 1.30 o superior |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna (transformer, CNN, RNN o híbrida) ni el número de parámetros. El modelo se exporta a ONNX opset 17 en int8 y se usa de forma autorregresiva a nivel de fonema: recibe los puntos de código Unicode de la palabra tras normalización NFC, minúsculas y sustitución de ’ por ', un índice de idioma, el prefijo de fonemas de cada haz y la posición solicitada; devuelve log-probabilidades sobre 61 índices. La decodificación se realiza con búsqueda por haces de 3 hipótesis, empezando por bos y terminando en eos o tras 39 posiciones.

Tampoco se detallan los datos de entrenamiento: número de ejemplos, composición del corpus, proceso de anotación ni si hubo RLHF, DPO u otra fase de ajuste. La innovación documentada es de despliegue: un modelo de 1,8 MB, cuantizado a int8, ejecutable con onnxruntime-web en WebAssembly y en CPU, con una latencia de 6,2 ms por paso de haz en un Galaxy Z Fold8 con Chrome y un hilo. No hay información sobre la arquitectura de atención ni sobre técnicas como decodificación especulativa.

## Capacidades

- Conversión G2P en 7 idiomas: francés, inglés, español, portugués, italiano, catalán y rumano.
- Generación de hasta tres pronunciaciones por palabra, con sus probabilidades; el modelo devuelve log-probabilidades por haz y el SDK de Alkove implementa la búsqueda por haces.
- Cobertura de nombres propios, marcas y palabras inventadas, según la model card.
- Normalización de entrada: NFC, minúsculas y conversión de ’ a '; la palabra puede ocupar hasta 33 caracteres.
- Salida restringida al conjunto de 58 fonemas de alkove-spot; los índices 0, 59 y 60 son padding, bos y eos.
- Ejecución on-device con onnxruntime en CPU y onnxruntime-web en WebAssembly; no requiere servidor.
- Integración con alkove-spot para wake words personalizadas y comandos de voz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre; no es un LLM de propósito general.
- No procesa frases completas para síntesis de voz: trabaja palabra por palabra.
- No soporta idiomas fuera de los siete listados ni inventarios fonéticos distintos del de alkove-spot.

## Casos de uso

- Wake words y comandos personalizados: el SDK alkove-spot necesita los fonemas de una palabra o marca para detectarla localmente. Lex genera las tres pronunciaciones más probables y sus probabilidades; el desarrollador puede elegir la mejor o cubrir variantes. Todo ocurre en el dispositivo, sin enviar la palabra a un servidor.
- Asistentes de voz en navegador: con onnxruntime-web y WebAssembly, una aplicación web puede fonemizar nombres de contactos o comandos sin backend. El modelo de 1,8 MB se descarga una vez y se ejecuta en CPU; es adecuado para aplicaciones con requisitos de privacidad o conectividad limitada.
- Aprendizaje de idiomas: una aplicación puede mostrar la pronunciación más probable de una palabra y alternativas con su probabilidad, para ejercicios de lectura o para comparar la producción del estudiante. La latencia de 6,2 ms por paso de haz en el dispositivo de referencia permite respuestas interactivas.
- Léxico para TTS de palabras sueltas: para un motor TTS que use el conjunto de 58 fonemas de alkove-spot, Lex puede generar entradas de léxico para nombres propios o palabras fuera del diccionario. No sustituye a un fonemizador de frases: se usa palabra por palabra y hasta 33 caracteres.
- Normalización de marcas y nombres en asistentes: en un directorio de empresas o contactos, el modelo puede asignar fonemas a nombres que no siguen las reglas ortográficas habituales. Las tres hipótesis permiten gestionar la ambigüedad; hay que tener en cuenta que las palabras extranjeras siguen las reglas del idioma seleccionado.
- Procesamiento offline en móvil: una aplicación Android o iOS puede incluir el ONNX de 1,8 MB y ejecutarlo con onnxruntime para pronunciar o buscar palabras sin red. Es adecuado para dispositivos con recursos limitados y requisitos de privacidad.
- Validación de pronunciación en un pipeline de datos: un equipo puede generar candidatos de pronunciación para un listado de palabras y revisar los casos de baja probabilidad o las tres hipótesis. Sirve para construir léxicos de ASR o TTS, pero requiere revisión humana porque el acierto declarado en la primera pronunciación es del 86,0 % en 300 palabras.
- Accesibilidad: para lectores de pantalla o aplicaciones de comunicación aumentativa, se puede obtener una representación fonémica de nombres y términos técnicos y pasarla a un sintetizador compatible con el conjunto de alkove-spot. La limitación principal es el procesamiento palabra por palabra.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index; no hay verificación independiente.

| Benchmark | Conjunto de evaluación | Métrica | Resultado | Verificado |
|---|---|---|---|---|
| G2P | 300 palabras reservadas en 7 idiomas | Primera pronunciación correcta | 86,0 % | No (verified: false) |

No se han publicado otros resultados de MMLU, HumanEval, GSM8K, MMMU ni benchmarks de LLM en la información disponible; no son aplicables a este modelo. Tampoco hay desglose por idioma ni intervalo de confianza.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo pesa 1,8 MB en int8 y está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En el dispositivo de referencia (Galaxy Z Fold8, Chrome, WebAssembly, 1 hilo) tarda 6,2 ms por paso de haz.
- Consumer GPU: no es necesaria; el modelo cabe en móviles y navegadores actuales con onnxruntime.
- Despliegue: onnxruntime en CPU y onnxruntime-web 1.30 o superior en WebAssembly; el SDK de Alkove implementa la búsqueda por haces. También se puede integrar en aplicaciones móviles mediante ONNX Runtime.
- Latencia: 6,2 ms por paso de haz en el dispositivo de referencia; el total depende del número de posiciones (longitud de la pronunciación más larga más uno) y de la implementación.
- Throughput: no disponible; no se documentan peticiones por segundo ni consumo de RAM.
- Almacenamiento: 1,8 MB para el ONNX, más el manifiesto JSON y phonemes.json.

## Comparativa con modelos similares

| Criterio | alkove-lex-1-preview | Modelos G2P alternativos |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto | palabra de hasta 33 caracteres; prefijo de 39 posiciones | no disponible |
| Rendimiento | 86,0 % de primera pronunciación correcta (300 palabras, 7 idiomas; no verificado) | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Disponibilidad | HuggingFace; ONNX int8 | no disponible |

No se han proporcionado datos verificables de otros modelos G2P (parámetros, contexto, benchmarks, licencia o disponibilidad) en la información de partida, por lo que no se puede establecer una comparación cuantitativa rigurosa. La única comparación cualitativa posible se limita al formato: frente a soluciones G2P integradas en frameworks TTS, este modelo se distribuye como un ONNX int8 de 1,8 MB para ejecución local en WebAssembly y CPU; no hay cifras comparativas de precisión. alkove-spot-1-preview no es una alternativa G2P: es el modelo de wake word con cuyo conjunto de fonemas trabaja Lex.

## Limit
