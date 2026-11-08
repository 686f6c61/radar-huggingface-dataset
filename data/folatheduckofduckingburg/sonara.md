# FolatheDuckofDuckingburg/Sonara

## Resumen

Sonara (identificado en la model card como NeuralPiano) es un proyecto experimental de generación de música para piano mediante redes neuronales, publicado por el usuario independiente FolatheDuckofDuckingburg. No se trata de un modelo de lenguaje ni de un modelo fundacional preentrenado: es una implementación en fase temprana (v0.1) cuyo objetivo declarado es investigar si una red LSTM puede aprender patrones temporales, melódicos y polifónicos a partir de composiciones MIDI y generar secuencias de piano nuevas. El repositorio se distribuye con licencia MIT y etiquetas propias de un trabajo de investigación abierto (piano, midi, pretty-midi, neural-network, experimental).

La relevancia de esta ficha es limitada desde el punto de vista de producción: el autor indica explícitamente que la implementación LSTM está en desarrollo y que no se reclama ningún resultado de rendimiento ni de generación. El repositorio no incluye pesos entrenados publicados, pipeline definido ni métricas. Por tanto, debe evaluarse como un esqueleto de código reproducible para experimentación musical, no como un modelo listo para desplegar.

La arquitectura prevista parte de un LSTM sobre representación en piano roll, con una hoja de ruta que contempla expresión musical (duración, velocidad, timing), contexto extendido y, en v0.4, una migración a arquitectura transformer con atención. Toda la información técnica disponible proviene de la model card y del README del proyecto; no hay datos de entrenamiento, benchmarks ni especificaciones de contexto en tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (PyTorch) en v0.1; transformer previsto en v0.4 (no implementado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencias de piano roll; sin valor publicado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo musical, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (exportación de salida en MIDI; no se publican checkpoints) |

## Arquitectura y entrenamiento

La implementación inicial es una red LSTM escrita en Python sobre PyTorch. La representación musical es un piano roll: la entrada son composiciones MIDI codificadas como matrices de activación por frame, y la salida son secuencias de piano roll predichas que se exportan de vuelta a MIDI. El objetivo de investigación declarado es la predicción de secuencia, las dependencias temporales y la generación polifónica de notas. La hoja de ruta prevé ampliar la expresividad (duración de nota, velocidad, timing) en v0.2, extender el contexto musical y la estructura de frase en v0.3, y sustituir el LSTM por atención en v0.4.

No se dispone de información sobre el corpus de entrenamiento: no se especifica el número de composiciones MIDI, el número de tokens o frames, la procedencia de los datos ni si se aplicaron técnicas de alineación o ajuste fino (RLHF, DPO u otras). El autor declara principios de investigación reproducibles, atribución y licencia de los datos de entrenamiento, y separación explícita entre funcionalidades implementadas y hallazgos experimentales. La evaluación prevista cubre pérdida de entrenamiento y validación, distribución de alturas, diversidad de notas, estructura polifónica, repetición musical, coherencia temporal y generalización a composiciones no vistas, pero no se han publicado resultados.

## Capacidades

- Generación de secuencias de piano roll a partir de MIDI de entrada (funcionalidad prevista en v0.1, en desarrollo).
- Exportación de las secuencias generadas a formato MIDI.
- Modelado de dependencias temporales mediante LSTM (predicción de siguiente frame).
- Generación polifónica de notas (objetivo de investigación, sin resultados publicados).
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión ni audio.
- No se publican checkpoints entrenados ni pipeline de inferencia en Hugging Face.

## Casos de uso

- Prototipado de investigación en generación musical simbólica: el repositorio sirve como base reproducible para experimentar con codificación en piano roll y predicción de siguiente frame con LSTM, partiendo de un esqueleto modular (`dataset.py`, `model.py`, `train.py`, `generate.py`, `midi_utils.py`).
- Docencia y aprendizaje de deep learning aplicado a música: la separación clara entre datos, modelo, entrenamiento y generación facilita usar el proyecto como material didáctico en cursos de PyTorch y procesamiento de MIDI.
- Benchmark interno de arquitecturas secuenciales: la hoja de ruta contempla comparar LSTM frente a transformer (v0.4) y una evaluación comparativa (v0.5), lo que permite usar el código como banco de pruebas de arquitecturas sobre el mismo corpus.
- Generación de bocetos melódicos para composición asistida: una vez entrenado un checkpoint local, el flujo MIDI de entrada y salida permitiría producir borradores de frases que el compositor edite en su DAW; requeriría entrenamiento propio, ya que no se distribuyen pesos.
- Estudio de representaciones musicales: la evaluación prevista de distribución de alturas, diversidad y estructura polifónica puede reutilizarse para analizar cómo distintas codificaciones (piano roll frente a eventos) afectan a la coherencia temporal.
- Base para experimentos de expresión musical: la fase v0.2 (duración, velocidad, timing) está pensada para investigar cómo incorporar dinámica al piano roll, un caso de uso realista para quien quiera estudiar modelado de interpretación y no solo de notas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ningún rendimiento de modelo entrenado ni resultado de generación en el estado v0.1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse pesos ni tamaño de parámetros, no puede estimarse. Un LSTM sobre piano roll de tamaño típico de investigación cabría previsiblemente en cualquier GPU consumer, pero es una extrapolación no confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; sin checkpoints publicados no hay nada que ejecutar en inferencia.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El proyecto es código Python/PyTorch que se ejecutaría mediante scripts propios (`train.py`, `generate.py`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Sonara / NeuralPiano | LSTM para piano roll (experimental) | no disponible | no disponible | MIT | no (sin checkpoints) |
| Music Transformer (Google, referencia académica) | Transformer para música simbólica | no disponible en esta ficha | no disponible en esta ficha | investigación | pesos no verificados en esta ficha |
| MuseNet (OpenAI) | Transformer para generación musical | no disponible en esta ficha | no disponible en esta ficha | no comercial | no público |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Proyecto en estado v0.1: el propio autor declara que la implementación LSTM está en desarrollo y que no hay resultados de rendimiento ni de generación.
- Ausencia de pesos publicados: no hay checkpoints en el repositorio de Hugging Face, por lo que no puede evaluarse ni desplegarse directamente.
- Sin datos de entrenamiento documentados: se desconoce el corpus MIDI, su tamaño, procedencia y licencia, lo que impide auditar sesgos musicales o de estilo.
- Riesgo de sobreajuste y repetición: en modelos LSTM sobre piano roll es habitual la degeneración en bucles y la baja diversidad; el autor incluye explícitamente la repetición musical como métrica a evaluar, lo que sugiere que es un riesgo reconocido.
- Sin capacidades lingüísticas ni de agente: no es adecuado para tareas de texto, tool calling ni razonamiento multi-paso.
- Licencia MIT: permite uso comercial y modificación, pero al no existir pesos entrenados la licencia se aplica al código, no a un modelo utilizable.
- Sin garantías de calidad musical: el autor advierte contra afirmaciones no respaldadas sobre "inteligencia musical"; cualquier uso en producción requeriría entrenamiento y evaluación propios.
- Idiomas y contexto: no aplica el concepto de ventana de contexto en tokens; el límite práctico es la longitud de secuencia musical que el LSTM pueda modelar, sin valor publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FolatheDuckofDuckingburg/Sonara
- Perfil del autor en GitHub: https://github.com/FolatheDuckofDuckingburg
- Repositorio de perfil del autor: https://github.com/FolatheDuckofDuckingburg/FolatheDuckofDuckingburg
- Paper, blog o demo adicionales: no disponible
