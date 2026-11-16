# PatnaikAshish/SobbieTTS

## Resumen

Sobbie (publicado como `PatnaikAshish/SobbieTTS`) es un modelo de síntesis de voz (text-to-speech) en inglés de tamano muy reducido, con aproximadamente 4,5 millones de parámetros incluyendo el generador de forma de onda. Lo desarrolla el usuario de Hugging Face PatnaikAshish como un fine-tune experimental sobre la arquitectura `tiny-voca` de Muhammed Nazeem, entrenado sobre un conjunto de datos de habla expresiva en inglés. Su propuesta principal es ejecutarse de forma totalmente offline en CPU mediante ONNX Runtime, sin necesidad de GPU.

El modelo genera audio WAV mono a 24 kHz y ofrece dos voces predefinidas (`F`, femenina expresiva, y `M`, masculina), con control de velocidad, rango de tono y desplazamiento de tono. El repositorio ocupa practicamente nada (0,0 GB reportados) y los pesos pesan alrededor de 21 MB en formato ONNX y 18 MB en PyTorch (`sobbie.pt`), lo que lo hace adecuado para entornos con recursos muy limitados.

Es relevante ahora como ejemplo de TTS ultraligero y desplegable en local, util para prototipos, aplicaciones de escritorio o sistemas embebidos donde no se dispone de GPU ni de conectividad. No obstante, se trata de un experimento "por diversión" segun el propio autor, sin benchmarks publicados ni un ecosistema maduro de herramientas alrededor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de `tiny-voca` (no se detalla la topologia interna); exportada a ONNX |
| Parametros totales | ~4,5 M (incluye generador de forma de onda) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto fonemizado; se recomienda dividir párrafos largos por puntuación) |
| Tipos de cuantizacion | no disponible (se distribuye un grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) y PyTorch (`sobbie.pt`) |

## Arquitectura y entrenamiento

La arquitectura parte de `tiny-voca`, un modelo TTS compacto de Muhammed Nazeem, y se ha afinado sobre un conjunto de datos de habla expresiva en inglés. El pipeline incluye un fonemizador offline (`dizione`) que convierte el texto en fonemas con marcas de acentuación, y un generador de forma de onda integrado que produce audio a 24 kHz. El modelo se exporta a un grafo ONNX que acepta como entradas los tokens fonémicos, las marcas de estrés, el identificador de voz, la velocidad, el desplazamiento de tono y el rango de tono.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La única indicación técnica relevante es que el modelo es un fine-tune experimental sobre `tiny-voca` y que la fonemización depende del léxico de pronunciación incluido en el repositorio.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida WAV mono a 24 kHz.
- Dos voces predefinidas: `F` (femenina expresiva, principal) y `M` (masculina).
- Control de velocidad de habla (`--speed`), rango de tono (`--pitch-range`) y desplazamiento de tono (`--pitch-shift`).
- Ejecución totalmente offline en CPU mediante ONNX Runtime, con número de hilos configurable (`--threads`).
- Interfaz de línea de comandos (`speak.py`) para síntesis de texto o de ficheros de texto multi-frase.
- Uso programático desde Python con `onnxruntime` y `soundfile`.
- Demostración web local servida con `python -m http.server`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Prototipado rápido de interfaces de voz: el modelo se integra en pocas líneas de Python y permite validar un flujo TTS sin depender de servicios en la nube ni de GPU.
- Aplicaciones de escritorio offline: al pesar ~21 MB en ONNX y ejecutarse en CPU, puede empaquetarse dentro de una aplicación de escritorio para leer notificaciones o textos al usuario sin conexión.
- Sistemas embebidos o de bajo consumo: su reducido tamano y su dependencia exclusiva de CPU lo hacen viable en dispositivos con recursos limitados, siempre que se acepte la calidad de un modelo de 4,5 M de parámetros.
- Lectura de ficheros de texto o artículos: el script `speak.py` acepta `--text-file` y divide párrafos largos por puntuación, lo que facilita convertir documentos en audio.
- Pruebas de accesibilidad y maquetación de audio: útil para generar locuciones de prueba en pipelines de desarrollo sin coste de API.
- Educación y experimentación: sirve como base para estudiar fine-tunes de TTS ultraligeros, analizar el efecto del fonemizador `dizione` o comparar voces y parámetros de prosodia.
- Generación de avisos cortos en aplicaciones: mensajes de estado, alertas o confirmaciones donde la latencia y el coste importan más que la naturalidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está disenado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU consumer: sí, por tamano (~21 MB en ONNX), aunque no es su objetivo.
- Opciones de despliegue: ONNX Runtime (CPU), script CLI `speak.py`, uso programático en Python y demo web local con `http.server`.
- Hilos de CPU configurables mediante `--threads` (valor por defecto: 4).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sobbie (`PatnaikAshish/SobbieTTS`) | ~4,5 M | Texto fonemizado; división por puntuación | Inglés | Apache-2.0 | ONNX, PyTorch | TTS ultraligero para CPU, dos voces |
| `tiny-voca` (`n4ze3m/tiny-voca`) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base del que deriva Sobbie |
| Alternativas TTS de mayor tamano (p. ej. Piper, Coqui) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativos entre Sobbie y otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Modelo experimental creado "por diversión" segun el autor; no está pensado como solución de produccion critica.
- Nombres extranjeros poco habituales, acrónimos raros y grafías complejas dependen del fonemizador `dizione` y pueden pronunciarse mal.
- Los párrafos muy largos deben dividirse por puntuación; el script `speak.py` lo hace automáticamente, pero el uso programático directo requiere gestionarlo.
- No se documentan sesgos concretos, pero al ser un fine-tune sobre un dataset expresivo en inglés, la cobertura de acentos y registros puede ser limitada.
- Riesgo de alucinación acústica o artefactos en entradas atípicas no está cuantificado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de `tiny-voca` conviene revisar las condiciones del modelo base y del fonemizador `dizione`.
- El repositorio reporta 0 descargas y 0 likes, sin benchmarks ni validación externa; la madurez del ecosistema es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/PatnaikAshish/SobbieTTS
- Modelo base `tiny-voca`: https://huggingface.co/n4ze3m/tiny-voca
- Fonemizador `dizione`: https://github.com/n4ze3m/dizione
