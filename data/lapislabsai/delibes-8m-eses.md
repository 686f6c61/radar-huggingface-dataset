# lapislabsai/Delibes-8M-esES

## Resumen

Delibes-8M-esES es un modelo de síntesis de voz (text-to-speech) desarrollado por lapislabsai que convierte identificadores de fonemas del español en audio PCM a 24 kHz. No es un modelo de lenguaje: es un componente acústico de 7,88 millones de parámetros que sigue la arquitectura Paradee v1.1 y se ha destilado desde Kokoro-82M, en concreto desde su voz masculina de español europeo `em_alex`, que actúa como profesora. El resultado es un par de grafos ONNX (predictor de texto y decodificador acústico) de 8,46 MB en INT8, sin pesos de la profesora en el momento de la inferencia.

Su relevancia está en la relación entre tamaño, coste computacional e inteligibilidad: con menos de 8 millones de parámetros iguala prácticamente a su profesora de 82 millones en el conjunto de evaluación publicado (5,83 % WER y 1,74 % CER frente a 5,94 % y 1,68 % sobre 697 frases reservadas) y se ejecuta en CPU a unas 115 veces el tiempo real en un Apple M5 con cuatro hilos. Eso lo sitúa como una pieza viable para síntesis de voz local en escritorio, dispositivos embebidos y aplicaciones sin GPU.

Las limitaciones de alcance son explícitas en la model card: una sola voz, un solo idioma (castellano), entrada por fonemas (el frontend de texto no forma parte del modelo ni se ha validado) y una evaluación acotada a 697 frases. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que la validación externa es aún inexistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee v1.1: predictor de texto y decodificador acústico (derivada por destilación de Kokoro-82M) |
| Parametros totales | 7,88 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada es una secuencia de IDs de fonemas y no se documenta límite máximo |
| Tipos de cuantizacion | FP32 e INT8 (grafos ONNX) |
| Idiomas soportados | Español (castellano, es-ES); una única voz masculina |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8: 8,46 MB; también se publica FP32) |
| Frecuencia de muestreo de salida | 24 kHz, PCM sin normalizar |
| Entrada | IDs de fonemas canónicos del español y semilla de ruido determinista |
| Librería | ONNX Runtime (script `inference.py` incluido) |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas: un predictor de texto que transforma la secuencia de IDs de fonemas en representaciones intermedias y un decodificador acústico que genera la forma de onda a 24 kHz. Sigue la arquitectura Paradee v1.1, publicada por otro autor en Hugging Face, y se entrena por destilación desde Kokoro-82M usando su voz `em_alex` como referencia. En inferencia no se carga ningún peso de la profesora: solo los dos grafos destilados, lo que explica el reducido tamaño del repositorio.

El entrenamiento trabaja sobre la representación canónica de fonemas del español, lo que fija el idioma y el acento (castellano) y elimina la necesidad de un modelo multilingüe. No se documentan en la información disponible el número de tokens de audio utilizados, la composición del corpus, ni si hubo etapas de ajuste fino con preferencias humanas. La evaluación publicada se realizó sobre 697 frases reservadas, con comparación directa contra las referencias almacenadas de la profesora, y los ejemplos de audio se generaron con una semilla de ruido determinista para permitir la reproducibilidad bit a bit entre FP32 e INT8.

## Capacidades

- Síntesis de voz a partir de IDs de fonemas, con salida PCM mono a 24 kHz.
- Una única voz: masculina, en español europeo (castellano), heredada de `em_alex`.
- Ejecución en CPU con cuantización INT8; no requiere GPU.
- Reproducibilidad: la semilla de ruido determina la generación, lo que permite comparar FP32 e INT8 sobre la misma entrada.
- Dos precisiones publicadas (FP32 e INT8) con inteligibilidad medida y prácticamente equivalente.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: solo español (castellano).
- No tiene visión, audio de entrada ni modo "thinking".
- No incluye frontend de texto (normalización, siglado, conversión de grafemas a fonemas); el usuario debe aportar los IDs de fonemas.

## Casos de uso

- Lectura de notificaciones y avisos en aplicaciones de escritorio: al ocupar 8,46 MB en INT8 y ejecutarse en CPU, puede embeberse en el propio binario de la aplicación y sintetizar mensajes cortos sin conexión ni GPU.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla o de textos seleccionados en un escritorio Linux, macOS o Windows, con latencia baja gracias a las ~115 veces el tiempo real medidas en un Apple M5 con cuatro hilos.
- Asistentes de voz totalmente offline en dispositivos embebidos: al no depender de un servicio en la nube, encaja en equipos con CPU modesta y almacenamiento limitado, siempre que se aporte un fonemizador local para el castellano.
- Narración de contenidos largos por lotes: audiolibros, artículos o documentación técnica pregenerados en un pipeline que convierte texto a fonemas y llama al modelo frase a frase, con salida PCM de 24 kHz lista para codificar.
- Locuciones y avisos en videojuegos o aplicaciones multimedia: frases cortas y repetitivas generadas en tiempo de ejecución o precacheadas, evitando licencias de bancos de voz y costes por petición.
- Avisos hablados en navegación o sistemas de vehículo: mensajes deterministas y breves, con la ventaja de que la misma semilla produce exactamente el mismo audio, lo que simplifica las pruebas de regresión.
- Integración con un LLM local como capa de salida hablada: un modelo de lenguaje genera texto, un fonemizador español lo convierte en IDs y Delibes produce el audio, todo en la misma máquina sin GPU dedicada.
- Evaluación y "benchmarking" de pipelines TTS: al publicarse FP32 e INT8 con el mismo protocolo de ruido, sirve como referencia reproducible para medir el impacto de la cuantización en un pipeline propio.

## Benchmarks y rendimiento

| Metrica | Delibes INT8 | Delibes FP32 | Kokoro-82M (profesora, voz `em_alex`) |
|---|---|---|---|
| WER (697 frases reservadas) | 5,83 % | No disponible en la información proporcionada | 5,94 % |
| CER (697 frases reservadas) | 1,74 % | No disponible en la información proporcionada | 1,68 % |
| Parametros | 7,88 M | 7,88 M | 82 M |
| Tamano en disco | 8,46 MB (INT8) | No disponible | No disponible |
| Velocidad | ~115x tiempo real en Apple M5, 4 hilos de CPU | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni tienen sentido para un modelo text-to-speech. Los únicos datos de calidad son el WER y el CER sobre el conjunto reservado de 697 frases descrito en la model card, sin intervalo de confianza ni desglose por categoría.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Los pesos INT8 ocupan 8,46 MB, por lo que el consumo de memoria vendrá dominado por el runtime de ONNX y los búferes de audio, no por el modelo.
- GPU recomendadas: ninguna necesaria. No se documenta soporte de aceleración por GPU en la información disponible.
- GPU de consumo: irrelevante para el caso de uso; cualquier CPU moderna de escritorio o portátil es suficiente según las mediciones del autor.
- Despliegue: ONNX Runtime a través del script `inference.py` incluido en el repositorio, con Python 3.12 y `huggingface_hub==2.3.0` según las instrucciones del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS.
- Latencia y throughput: aproximadamente 115 veces el tiempo real en un Apple M5 con cuatro hilos de CPU en el benchmark de desarrollo del autor. No se publican latencias absolutas por frase, ni cifras para otras CPU.
- Almacenamiento: el repositorio se lista con 0,0 GB, aunque los pesos INT8 declarados son 8,46 MB; conviene verificar el contenido real tras la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas / voces | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Delibes-8M-esES | 7,88 M | Español castellano, 1 voz masculina | Apache 2.0 | ONNX (FP32, INT8) | Destilado de Kokoro-82M; inferencia en CPU; WER 5,83 % en 697 frases |
| Kokoro-82M (`hexgrad`) | 82 M | Multilingüe, varias voces (incluida `em_alex` en es-ES) | Apache 2.0 | No disponible en la información proporcionada | Profesor del modelo; WER 5,94 % en el mismo conjunto, según la model card de Delibes |
| Paradee-8M-v1.1 (`sahilmahendrakar`) | ~8 M | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Referencia arquitectónica; no se dispone de datos de rendimiento ni de idioma |

No se dispone de información sobre otras alternativas TTS pequeñas (Piper, VITS, Matcha) en el material proporcionado, por lo que no se comparan aquí para no introducir datos no verificados.

## Limitaciones y advertencias

- Una sola voz y un solo acento: no hay kontrola de género, edad, emoción, velocidad ni estilo; cualquier variedad distinta del castellano queda fuera de su dominio declarado.
- El modelo no incluye frontend de texto: la normalización (números, siglas, moneda, extranjerismos) y la conversión de grafemas a fonemas corren a cargo del usuario y no han sido validadas por el autor.
- La evaluación se limita a 697 frases reservadas y a una comparación contra la profesora en el mismo conjunto; no hay evaluación sobre corpus independientes, ruido, dominios técnicos ni habla espontánea.
- Riesgo de errores de pronunciación y artefactos acústicos en palabras fuera del dominio de entrenamiento (nombres propios extranjeros, siglas, términos técnicos), típico de los sistemas TTS destilados.
- No se documentan los datos de entrenamiento: se desconoce la procedencia del corpus, su cobertura dialectal y si existe sesgo de género o de registro más allá de la voz única.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo deriva de Kokoro-82M (también Apache 2.0) y la model card no detalla las condiciones del corpus de destilación; conviene revisar la trazabilidad antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 valoraciones, y la etiqueta `inference: false` indica que no hay widget de inferencia alojado en Hugging Face; no existe validación independiente de las cifras publicadas.
- Dependencias frágiles: el autor fija Python 3.12 y `huggingface_hub==2.3.0`, lo que puede complicar la integración en entornos con versiones distintas.
- El identificador arXiv citado en las etiquetas (2610.06817) no se ha podido verificar en el material proporcionado; no debe citarse como publicación revisada por pares sin comprobación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lapislabsai/Delibes-8M-esES
- Modelo base (profesor): https://huggingface.co/hexgrad/Kokoro-82M
- Arquitectura de referencia Paradee-8M-v1.1: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1
- Paper citado en las etiquetas: https://arxiv.org/abs/2610.06817
- Ejemplos de audio del autor: https://huggingface.co/lapislabsai/Delibes-8M-esES/tree/main/samples
- Página de escucha offline: https://huggingface.co/lapislabsai/Delibes-8M-esES/blob/main/samples/listening.html
