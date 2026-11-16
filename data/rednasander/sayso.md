# rednaSander/sayso

## Resumen

Sayso es un modelo de conversión grafema-fonema (G2P) para inglés, desarrollado por el usuario rednaSander y publicado en Hugging Face bajo licencia Apache-2.0. Su función es predecir la pronunciación de palabras inglesas que no aparecen en un diccionario de pronunciación, como nombres propios, nombres de herramientas y jerga técnica. La salida se emite en el formato de fonemas de misaki, lo que permite encadenarla directamente a Kokoro-82M para síntesis de voz.

El modelo es un transformer encoder-decoder compacto de 5,59 millones de parámetros (256 de anchura, 3 capas de encoder y 3 de decoder, 4 cabezas de atención), distribuido en formato ONNX como dos ficheros separados (`g2p-encoder.onnx` y `g2p-decoder.onnx`) más un vocabulario JSON. Admite inglés americano y británico, seleccionables mediante un token especial al inicio de la secuencia (`<us>` o `<gb>`).

Sayso es el modelo de pronunciación de Papegai, una aplicación de lectura en voz alta con resaltado, donde sustituye a espeak-ng como mecanismo de respaldo para palabras desconocidas. Su relevancia radica en que mejora de forma sustancial la precisión de espeak-ng en esa tarea: 78,0 % de acierto exacto en americano frente al 28,1 % de espeak-ng, según los resultados reportados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (atención multi-cabeza, 4 cabezas) |
| Parámetros totales | 5,59 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada: 32 tokens (`max_src`); salida: 48 tokens (`max_tgt`) |
| Tipos de cuantización | No disponible (solo se distribuyen pesos ONNX en precisión original) |
| Idiomas soportados | Inglés (americano y británico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`g2p-encoder.onnx`, `g2p-decoder.onnx`) + `g2p-vocab.json` |

## Arquitectura y entrenamiento

Sayso es un transformer encoder-decoder de dimensiones reducidas: anchura 256, 3 capas en el encoder y 3 en el decoder, 4 cabezas de atención y 5,59 M de parámetros totales. El encoder recibe la secuencia de caracteres de entrada (`src`, int64, forma `[1, S]`) y produce una representación `mem` de forma `[1, S, 256]`; el decoder recibe `tgt` (los fonemas generados hasta el momento) junto con `mem` y emite `logits` para el siguiente fonema. La decodificación es autorregresiva y voraz (greedy) hasta `<eos>`. El vocabulario de entrada incluye `<pad>`, `<us>`, `<gb>`, las letras a-z y el apóstrofo; el de salida contiene los fonemas del inventario de misaki.

El entrenamiento se realizó sobre los diccionarios americano y británico de misaki 0.9.4 (conjuntos gold y silver, Apache-2.0), con aproximadamente 356.000 pares de palabra y pronunciación; el 2 % de las palabras se reservó como conjunto de test. Se entrenó durante 120 épocas, con batch de 1024, learning rate de 1e-3 con decaimiento coseno y 2.000 pasos de warm-up, y label smoothing de 0,1. El entrenamiento completo requirió 34 minutos en una única RTX 5090. No se documenta uso de RLHF ni DPO.

## Capacidades

- Conversión grafema-fonema para palabras sueltas en inglés, con salida en el inventario de fonemas de misaki.
- Selección de acento americano o británico mediante el token inicial `<us>` o `<gb>`.
- Manejo de palabras de hasta 31 letras (límite práctico derivado de `max_src` = 32, incluido el token de acento).
- Integración directa con Kokoro-82M para síntesis de voz, al compartir el formato de fonemas de misaki.
- Sustitución de espeak-ng como mecanismo de respaldo para palabras fuera de diccionario en pipelines de TTS.
- Ejecución mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Síntesis de voz con Kokoro-82M para palabras fuera de diccionario: el modelo genera los fonemas de nombres propios o términos técnicos que el diccionario de misaki no cubre, y la salida se encadena directamente al sintetizador sin transformación intermedia.
- Lectura en voz alta de documentos técnicos: permite pronunciar correctamente nombres de herramientas, librerías y jerga de dominio que de otro modo caerían en un fallback de menor calidad como espeak-ng.
- Aplicaciones de accesibilidad con resaltado de texto (caso de Papegai): el modelo resuelve la pronunciación de palabras desconocidas en tiempo de ejecución con un coste computacional muy bajo, adecuado para ejecución local.
- Normalización de pronunciación en pipelines de datos de voz: generación de transcripciones fonémicas para corpus de TTS o de evaluación de sistemas de reconocimiento de voz.
- Diccionarios de pronunciación aumentados: expansión automática de léxicos con entradas para nombres propios y neologismos, revisables posteriormente por un humano.
- Sistemas de lectura para aprendizaje de inglés: generación de transcripciones fonémicas con acento americano o británico seleccionable, útil en materiales didácticos.
- Prototipado rápido de G2P en local: al ocupar unos pocos megabytes y ejecutarse con ONNX Runtime, puede integrarse en aplicaciones de escritorio o móviles sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre las palabras reservadas del test (3.483 en americano, 3.776 en británico), comparados con la pronunciación de referencia de misaki:

| Sistema | Exacto | Ignorando acento | Errores de sonido |
|---|---|---|---|
| Sayso, americano | 78,0 % | 82,4 % | 4,6 % |
| Sayso, británico | 80,2 % | 84,5 % | 4,5 % |
| espeak-ng, americano | 28,1 % | 30,2 % | 17,4 % |
| espeak-ng, británico | 72,1 % | 77,5 % | 6,7 % |

Los "errores de sonido" se definen como el número de caracteres fonémicos distintos (distancia de edición) dividido por la longitud de la respuesta correcta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo G2P.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 5,59 M de parámetros y los ficheros ONNX ocupan unos pocos megabytes (el repositorio figura con 0,0 GB).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde; también en CPU sin aceleración.
- Opciones de despliegue: ONNX Runtime (documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; el autor reporta 34 minutos de entrenamiento en una RTX 5090, pero no cifras de inferencia. Por el tamaño del modelo, la inferencia por palabra es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sayso | Transformer encoder-decoder G2P | 5,59 M | Inglés (US/GB) | Apache-2.0 | ONNX |
| espeak-ng | Sintetizador por reglas con G2P | No aplica (basado en reglas) | Múltiples | GPLv3 | Binario/C |
| misaki (diccionario) | Diccionario de pronunciación | No aplica | Inglés | Apache-2.0 | JSON/datos |
| Kokoro-82M | Modelo TTS | 82 M | Inglés y otros | Apache-2.0 | Safetensors/PyTorch |

Sayso se compara de forma natural con espeak-ng como mecanismo G2P de respaldo: sobre el test del autor, Sayso obtiene 78,0 % exacto en americano frente al 28,1 % de espeak-ng, y 80,2 % frente al 72,1 % en británico. Frente a misaki, Sayso no compite sino que lo complementa: misaki aporta el diccionario y Sayso cubre las palabras ausentes. Kokoro-82M es el consumidor aguas abajo de la salida de Sayso, no un competidor. No se dispone de comparación con otros modelos G2P neuronales en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa palabras sueltas: los compuestos, números y abreviaturas deben dividirse o expandirse antes de la inferencia.
- Solo conoce las letras a-z y el apóstrofo; cualquier otro carácter se descarta silenciosamente en el ejemplo de uso del autor.
- Los nombres de origen no inglés se pronuncian como si fueran ingleses, lo que produce errores sistemáticos en nombres propios extranjeros.
- Las abreviaturas que deberían deletrearse letra a letra pueden emitirse como una sola palabra.
- El modelo se entrenó sobre diccionarios de misaki; su techo de calidad está acotado por la cobertura y calidad de esos diccionarios (conjuntos gold y silver).
- Riesgo de alucinación fonémica: al ser un modelo generativo, puede producir secuencias de fonemas plausibles pero incorrectas para palabras muy alejadas de la distribución de entrenamiento.
- No hay datos publicados sobre sesgos demográficos o dialectales más allá de la distinción US/GB.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las obligaciones derivadas de los datos de entrenamiento (misaki 0.9.4, también Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rednaSander/sayso
- misaki (formato de fonemas y diccionarios de entrenamiento): https://github.com/hexgrad/misaki
- Kokoro-82M (sintetizador compatible): https://huggingface.co/hexgrad/Kokoro-82M
- espeak-ng (referencia comparativa): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
