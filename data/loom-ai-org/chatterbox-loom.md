# loom-ai-org/chatterbox-loom

## Resumen

Chatterbox-loom es una exportación del modelo de síntesis de voz (text-to-speech) ResembleAI/chatterbox al formato GGUF propio del motor loom.cpp, publicada por la organización loom-ai-org. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos a los del modelo base y lo que cambia es el empaquetado, que reúne en un único fichero GGUF autodescriptivo la topología de grafo, el tokenizador y el script de ejecución necesarios para inferencia local.

El modelo resuelve la generación de audio a partir de texto en inglés sin depender de un fonemizador externo, ya que codifica el texto por sí mismo e incorpora una voz integrada en el propio checkpoint. Combina un modelo de tokens de tipo Llama con un decodificador de flow-matching en un mismo artefacto, y suma 670.392.202 parámetros reales según los datos de safetensors, con un repositorio de 2,7 GB.

Su relevancia actual es doble: por un lado, demuestra el patrón de exportación de modelos TTS a GGUF para ejecución en dispositivos pequeños o en local; por otro, sirve como caso de estudio de las concesiones que implica ese empaquetado ligero, como la ausencia de marca de agua neuronal (Perth) o la imposibilidad de clonar voces nuevas sin componentes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de tokens tipo Llama mas decodificador de flow-matching en un unico fichero |
| Parametros totales | 670.392.202 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero `chatterbox.gguf` en formato GGUF) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura empaquetada consta de dos componentes que trabajan en cadena: un modelo de tokens de lenguaje de tipo Llama que produce la secuencia de tokens de habla, y un decodificador de flow-matching que la convierte en forma de onda. El modelo codifica el texto directamente, por lo que no necesita fonemizador. Toda la topología del grafo, el tokenizador y el driver de ejecución viajan dentro del propio GGUF, generado con loom-exporter.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para este checkpoint, ya que la model card únicamente describe el proceso de exportación y remite al modelo original ResembleAI/chatterbox. El muestreo de tokens de habla usa por defecto temperatura 0,8, min_p 0,05, penalización por repetición 1,2 y classifier-free guidance 0,5; con decodificación guiada determinista (temperatura 0) la salida se verifica con una desviación de la forma de onda inferior a 2,5e-05 respecto a la referencia.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Codificación de texto integrada: no requiere fonemizador ni componente externo de normalización.
- Voz integrada en el propio checkpoint (`conds.pt`), utilizable sin pasos adicionales.
- Control de reproducibilidad del muestreo mediante `seed`; modo determinista con `temperature=0`.
- Procesamiento de etiquetas de evento en el texto, como `[laughter]` o `[sigh]`, tal y como las recibe el modelo de referencia.
- Salida de audio con frecuencia de muestreo configurable en la llamada (el ejemplo oficial usa 24000 Hz).
- API de alto nivel por tarea (`model.text2speech.infer`) y acceso de bajo nivel al driver embebido (`model.infer`).

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio de entrada; se trata de un modelo específicamente orientado a la modalidad texto-a-habla.

## Casos de uso

- Narración de contenido en inglés: generación de audio para artículos, documentación técnica o contenido editorial donde no se necesita clonar una voz concreta, aprovechando la voz integrada y la ejecución local.
- Audiolibros y lectura asistida: conversión de texto largo a voz en inglés con control de semilla para mantener coherencia entre fragmentos generados en distintas ejecuciones.
- Interfaces de voz para aplicaciones locales: asistentes o herramientas de escritorio que requieren TTS sin enviar texto a servicios en la nube, gracias al empaquetado GGUF y a la inferencia en dispositivo.
- Pruebas automatizadas de audio: uso del modo determinista (temperatura 0) para generar referencias reproducibles en pipelines de test o comparación de regresiones de audio.
- Prototipado de sistemas embebidos o de gama baja: el tamaño del modelo (670 M de parámetros) permite evaluar TTS en hardware limitado dentro del ecosistema loom.cpp.
- Generación de contenido accesible: creación de versiones habladas de material escrito en inglés para personas con dificultades de lectura.
- Demostraciones e investigación sobre exportación de modelos TTS: uso del artefacto como referencia para estudiar el formato GGUF autodescriptivo y la separación entre driver, tokenizador y pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de rendimiento presente en la model card es la verificación de fidelidad de la decodificación guiada determinista, con una desviación de la forma de onda inferior a 2,5e-05 respecto a la referencia; no se trata de una métrica comparable con MMLU, HumanEval, GSM8K ni con métricas habituales de TTS como MOS o WER.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia orientativa a partir de los 670 M de parámetros y del tamaño del repositorio (2,7 GB), los pesos ocupan en torno a 2,7 GB si están en precisión de 32 bits; una hipotética conversión a 16 bits rondaría 1,34 GB y a 8 bits unos 0,67 GB. Estas cifras son estimaciones de tamaño de pesos, no requisitos medidos por el autor.
- GPU recomendadas: no especificadas. Por tamaño de pesos, el modelo es apto para GPU de consumo; no se indican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: el tamaño del modelo permite plantear su ejecución en GPU de gama media y baja, e incluso en CPU, aunque el autor no publica cifras de requisitos ni de compatibilidad.
- Opciones de despliegue: el soporte documentado es loom.cpp y la librería loom-py (`loom-py-rt` en PyPI, con extra `[hub]`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatterbox-loom (esta ficha) | 670.392.202 | no disponible | no disponible (verificacion de fidelidad 2,5e-05) | MIT | HuggingFace, formato GGUF para loom.cpp |
| ResembleAI/chatterbox (modelo base) | 670.392.202 (mismos pesos) | no disponible | no disponible en la informacion proporcionada | MIT | HuggingFace, formato original |
| Otros modelos TTS de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos TTS comparables en la informacion proporcionada, por lo que no se incluyen alternativas adicionales para no introducir cifras no confirmadas.

## Limitaciones y advertencias

- Sin marca de agua: la exportación omite deliberadamente Perth, la marca de agua neuronal de Resemble AI. El audio generado no puede identificarse como sintético mediante el detector de Perth, por lo que si se distribuye voz generada hay que declararlo como sintético de forma explícita.
- Una sola voz integrada: la síntesis usa la voz por defecto del checkpoint (`conds.pt`). La clonación de voces nuevas requiere el codificador de voz, el tokenizador de habla S3 y CAMPPlus, que esta exportación no incluye.
- Muestreo estocástico por defecto: con la configuración estándar (temperatura 0,8, min_p 0,05, penalización por repetición 1,2, CFG 0,5) dos llamadas producen resultados distintos. Para reproducir una salida hay que fijar `seed` o usar `temperature=0`.
- Solo inglés: los checkpoints multilingüe y Turbo son modelos distintos y no corresponden a este fichero.
- Riesgo de alucinación y de errores de pronunciación: no se documenta explícitamente, pero es un comportamiento habitual en modelos generativos de habla y no hay métricas publicadas que lo cuantifiquen.
- Dependencia del motor: la ejecución está documentada para loom.cpp y loom-py; no se garantiza compatibilidad con otros runtimes de GGUF.
- Frecuencia de muestreo: si el GGUF no declara una, hay que pasarla manualmente (el ejemplo usa 24000). Un valor incorrecto no provoca error, pero reproduce la voz a una velocidad equivocada.
- Licencia: MIT, heredada del modelo base, lo que permite uso comercial, si bien conviene verificar las condiciones del modelo original ResembleAI/chatterbox.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/chatterbox-loom
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Repositorio de loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio de loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio de loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/

Nota: las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los enlaces encontrados corresponden a productos y servicios no relacionados (Loom, grabador de pantalla; Loom, marca de ropa).
