# FolatheDuckofDuckingburg/NeuralPiano

## Resumen

NeuralPiano es un proyecto experimental de generación de música para piano mediante redes neuronales, publicado por el desarrollador independiente FolatheDuckofDuckingburg bajo licencia MIT. No se trata de un modelo entrenado y listo para usar, sino de un repositorio de investigación en fase muy temprana (v0.1) cuyo objetivo declarado es estudiar si las redes neuronales recurrentes pueden aprender patrones temporales, melódicos y polifónicos a partir de composiciones MIDI y generar secuencias nuevas de piano.

La arquitectura inicial es una red LSTM implementada en PyTorch, con representación de la música como piano roll, entrada en formato MIDI y salida en secuencias de piano roll exportables de nuevo a MIDI. El roadmap del autor contempla evolucionar hacia una arquitectura transformer en la versión v0.4, pero en el momento de la publicación no existe ningún checkpoint entrenado ni resultados de generación.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el autor declara explícitamente que no se reclama ningún rendimiento ni resultado de generación, y el repositorio se presenta como un estudio reproducible más que como un modelo desplegable. Resulta útil como referencia para quien quiera seguir o replicar experimentos de generación musical simbólica con LSTM, pero no como componente listo para integrar en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) sobre piano roll; transformer previsto en roadmap v0.4 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de música, no de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay checkpoints publicados); entrada y salida en MIDI |

## Arquitectura y entrenamiento

La implementación inicial descrita en la model card es una LSTM en PyTorch que recibe composiciones MIDI codificadas como piano roll y se entrena para predecir la siguiente trama (next-frame prediction). El pipeline del repositorio incluye módulos separados para carga de dataset (`dataset.py`), definición del modelo (`model.py`), entrenamiento (`train.py`), generación (`generate.py`) y utilidades MIDI (`midi_utils.py`), lo que sugiere una estructura pensada para experimentación reproducible más que para inferencia optimizada.

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, el número de tokens o tramas procesadas, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El roadmap prevé ampliar la expresión musical (duración, velocidad, timing) en v0.2, extender el contexto en v0.3 y migrar a atención en v0.4, pero ninguna de estas fases está implementada según la model card. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de secuencias de piano roll a partir de patrones aprendidos de MIDI (objetivo del proyecto; sin resultados publicados).
- Predicción de la siguiente trama temporal en secuencias musicales simbólicas.
- Modelado de dependencias temporales mediante LSTM.
- Generación polifónica de notas (objetivo declarado en la investigación inicial).
- Exportación de las secuencias generadas a formato MIDI.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Prototipado de investigación en generación musical simbólica: el repositorio sirve como base reproducible para experimentar con LSTM sobre piano roll y comparar con arquitecturas posteriores.
- Docencia y aprendizaje: la estructura modular (`dataset.py`, `model.py`, `train.py`, `generate.py`) facilita usar el proyecto como ejemplo didáctico de pipeline completo de machine learning aplicado a MIDI.
- Generación de borradores melódicos para compositores: una vez entrenado, el modelo podría producir secuencias MIDI de partida que el músico edite en su DAW, aunque no hay resultados que validen la calidad musical.
- Experimentación con representaciones de piano roll: útil para estudiar cómo distintas codificaciones afectan a la coherencia temporal y a la diversidad de notas.
- Benchmarking de arquitecturas recurrentes frente a transformers: el roadmap v0.4 plantea una comparativa directa que puede interesar a investigadores en música generativa.
- Integración en herramientas educativas de teoría musical: dado el perfil del autor (herramientas para aprendizaje neurodivergente), el modelo podría insertarse en entornos de exploración musical, siempre que se entrene y valide previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún rendimiento de modelo entrenado ni resultado de generación en la versión v0.1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay checkpoints publicados ni tamaño de modelo especificado).
- GPU recomendadas: no disponible; una LSTM de tamaño moderado sobre piano roll podría ejecutarse en CPU o en GPU consumer, pero no se documenta el tamaño.
- Cabeza en GPU consumer: no confirmable sin especificaciones de parámetros.
- Opciones de despliegue: el repositorio usa PyTorch; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM de texto, no aplicables directamente a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuralPiano | LSTM sobre piano roll | no disponible | sin resultados publicados | MIT | repositorio en v0.1, sin checkpoints |
| Music Transformer (Google) | Transformer | secuencias MIDI largas | resultados publicados en paper | código de investigación | pesos no siempre públicos |
| MuseGAN | GAN multi-track | no aplica | resultados publicados | código de investigación | repositorio público |
| Magenta Melody RNN | LSTM | secuencias cortas | resultados publicados | Apache 2.0 | checkpoints públicos |

No se dispone de datos de benchmarks de NeuralPiano que permitan una comparación cuantitativa con estas alternativas; la comparativa se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No existe ningún checkpoint entrenado publicado; el modelo no es utilizable tal cual.
- El autor declara explícitamente que no se reclama rendimiento ni calidad de generación en v0.1.
- No se documentan sesgos, pero un modelo entrenado con un corpus MIDI sesgado heredaría sus sesgos estilísticos y de género musical.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí de generar secuencias musicales incoherentes o repetitivas; el propio autor incluye la repetición musical como métrica a evaluar.
- Sin datos sobre el dataset de entrenamiento, no es posible evaluar la atribución ni la licencia de los datos originales.
- La licencia MIT permite uso comercial del código, pero la ausencia de pesos y de validación hace inviable su uso en producción actualmente.
- El proyecto está en fase experimental y puede cambiar de arquitectura (LSTM a transformer) sin compatibilidad hacia atrás.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FolatheDuckofDuckingburg/NeuralPiano
- Colección Noggimigo AI del autor: https://huggingface.co/collections/FolatheDuckofDuckingburg/noggimigo-ai
- Perfil de GitHub del autor: https://g.guable.us.ci/FolatheDuckofDuckingburg
