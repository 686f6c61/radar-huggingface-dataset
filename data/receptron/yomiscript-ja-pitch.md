# receptron/yomiscript-ja-pitch

## Resumen

yomiscript-ja-pitch es un modelo de prediccion de acento tonal (pitch accent) para japones, desarrollado por receptron como componente del proyecto YomiScript. No es un modelo de lenguaje generativo ni un sintetizador de voz completo: es el modelo de pitch de `@yomiscript/ja-accent` (funcion `pitchYomite`, decision D33 del proyecto), encargado de leer las moras de una frase japonesa junto con los nucleos de acento de un diccionario y predecir tres valores de tono por mora.

Tecnicamente es una red LSTM bidireccional de dos capas con 1,78 millones de parametros, implementada en TypeScript puro y ejecutable tanto en Node como en el navegador. Su proposito es mejorar la asignacion de curvas de tono en la sintesis de voz en japones, sustituyendo o complementando la informacion de acento que proporciona el diccionario con una prediccion aprendida.

El modelo se entreno a partir del pitch de Qwen3-TTS (1.7B Base, voz clonada) leyendo 1.287 frases pares del corpus JSUT BASIC5000 y 2.393 frases de Wikipedia en japones. Su relevancia actual es acotada: cubre una necesidad muy especifica del pipeline de TTS japones de YomiScript y no compite con modelos de lenguaje o TTS de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional de dos capas |
| Parametros totales | 1,78 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera por frase, sobre las moras de una oracion) |
| Tipos de cuantizacion | no disponible (pesos en float32 little-endian) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `pitch.bin.gz` (float32 little-endian) y `pitch.json.gz` (vocabularios y formas de tensor), en el directorio `qwen-1/` |

## Arquitectura y entrenamiento

El modelo es una LSTM bidireccional de dos capas que recibe como entrada la secuencia de moras de una frase japonesa junto con los nucleos de acento procedentes de un diccionario, y produce tres valores de pitch por mora. La salida se combina con un modelo lineal de pitch que el propio modelo anade, segun se describe en `pitch.json.gz`. La implementacion es en TypeScript puro, sin dependencias de frameworks de deep learning en tiempo de inferencia, lo que permite ejecutarlo en Node y en el navegador.

El entrenamiento se realizo sobre el pitch generado por Qwen3-TTS (1.7B Base, voz clonada) al leer 1.287 frases pares de JSUT BASIC5000 y 2.393 frases de Wikipedia japonesa. El vocabulario del modelo contiene palabras de esos textos, motivo por el cual se distribuye bajo CC BY-SA 4.0, igual que el dataset asociado `receptron/yomiscript-ja-qwen-speech`. No se documentan en la informacion disponible detalles sobre regimen de entrenamiento, numero de tokens, ni uso de RLHF o DPO.

## Capacidades

- Prediccion de acento tonal (pitch accent) para frases en japones a nivel de mora.
- Integracion con diccionarios de acento: consume los nucleos de acento y produce tres valores de pitch por mora.
- Ejecucion en TypeScript puro, tanto en Node como en el navegador.
- Forma parte del pipeline de sintesis de voz de YomiScript (`@yomiscript/ja-accent`, funcion `pitchYomite`).
- No genera texto, no razona, no escribe codigo ni procesa vision.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidad multilingue limitada al japones.

## Casos de uso

- Sintesis de voz en japones dentro de YomiScript: el modelo se usa como etapa de prediccion de pitch (`pitchYomite`) para generar curvas de entonacion mas naturales que las que ofrece unicamente el diccionario de acento.
- Aplicaciones web de TTS en el navegador: al estar implementado en TypeScript puro, puede ejecutarse en el cliente sin backend de inferencia, lo que facilita lectores de texto japones en paginas web.
- Herramientas de aprendizaje de japones: permite mostrar o reproducir la entonacion correcta de frases, comparando la prediccion del modelo con la informacion del diccionario.
- Post-procesado de pipelines TTS existentes: puede insertarse como modulo de refinamiento de pitch sobre la salida de un sintetizador que ya proporcione moras y nucleos de acento.
- Prototipado de prosodia en investigacion: su tamano reducido (1,78 M de parametros) y su formato simple (float32) permiten experimentar con variantes del modelo sin infraestructura pesada.
- Aplicaciones de accesibilidad: lectura en voz alta de contenido japones con entonacion mas natural en entornos con recursos limitados, dado el bajo coste computacional del modelo.

## Benchmarks y rendimiento

La model card reporta una evaluacion de distancia al pitch de Qwen sobre 1.214 frases no vistas, en semitonos y con cada frase centrada:

| Metodo | Distancia al pitch de Qwen (semitonos) |
|---|---|
| Nucleos del diccionario | 1,871 |
| Este modelo | 1,592 |
| Nucleos leidos del pitch de Qwen de cada frase | 1,494 |

La evaluacion se reconstruye con `eval/qwen_prosody/pitch.py`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 1,78 millones de parametros en float32, los pesos ocupan del orden de 7 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, series RTX 30/40) es mas que suficiente si se desea acelerar.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en entornos sin GPU.
- Opciones de despliegue: ejecucion directa en Node y en el navegador mediante TypeScript; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yomiscript-ja-pitch | 1,78 M | no disponible | Prediccion de pitch accent en japones | CC BY-SA 4.0 | Hugging Face (repo de 0,0 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice pitch accent en japones; no sirve para otras tareas de NLP.
- Dependencia de un diccionario de acento externo para obtener los nucleos de acento de entrada.
- Entrenado sobre el pitch de una voz clonada concreta de Qwen3-TTS y sobre un corpus limitado (1.287 frases de JSUT y 2.393 de Wikipedia), por lo que puede generalizar mal fuera de esos dominios.
- Vocabulario cerrado a las palabras de los textos de entrenamiento; palabras no vistas pueden degradar la prediccion.
- Licencia CC BY-SA 4.0: impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial en productos propietarios.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de predicciones de pitch incorrectas en frases anomalas o fuera de dominio.
- Sin datos publicados sobre sesgos, latencia ni comportamiento en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/receptron/yomiscript-ja-pitch
- Repositorio YomiScript: https://github.com/receptron/yomiscript
- Dataset asociado: https://huggingface.co/datasets/receptron/yomiscript-ja-qwen-speech
