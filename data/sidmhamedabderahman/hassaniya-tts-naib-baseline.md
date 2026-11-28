# sidmhamedabderahman/hassaniya-tts-naib-baseline

## Resumen

Hassaniya TTS es un prototipo de investigación de síntesis de voz desarrollado por el usuario `sidmhamedabderahman` para el NAIB Independence Day Challenge. Su objetivo es explorar la viabilidad de generar audio a partir de texto escrito en hassaniya, una variedad de árabe hablada principalmente en Mauritania y zonas limítrofes, para la que apenas existen recursos públicos de pares texto-audio de calidad. El modelo se presenta explícitamente como una línea base experimental y no como un sistema listo para producción.

La arquitectura es una red neuronal propia implementada en PyTorch, muy alejada de los sistemas TTS modernos basados en transformers o difusión: representación de texto a nivel de carácter, capa de embeddings de 64 dimensiones, una GRU bidireccional con 128 unidades por dirección y una proyección lineal a espectrogramas mel de 80 bins a 22.050 Hz. El total de parámetros entrenables ronda los 171.600, lo que lo sitúa en el orden de unos pocos cientos de kilobytes de pesos.

La relevancia del proyecto es fundamentalmente metodológica: documenta de forma transparente el proceso de entrenamiento, las limitaciones de trabajar con siete ejemplos de audio (unos 70 segundos en total) y los artefactos audibles del resultado. Sirve como punto de partida reproducible para quien quiera abordar TTS en lenguas de bajos recursos, no como una herramienta de síntesis fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal propia en PyTorch: embeddings de carácter + GRU bidireccional + proyección lineal a mel-espectrograma |
| Parametros totales | Aproximadamente 171.600 entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (representación a nivel de carácter, sin ventana de contexto definida) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (`ar`), con foco en la variedad hassaniya |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch (no es un modelo Transformers plug-and-play) |

Otros parámetros técnicos: dimensión de embedding 64, dimensión oculta de la GRU 128 por dirección, 80 bins de mel-espectrograma, frecuencia de muestreo de audio 22.050 Hz, 7 ejemplos de entrenamiento, 300 épocas de entrenamiento.

## Arquitectura y entrenamiento

El modelo es una red secuencial pequeña y de diseño propio. El texto se tokeniza a nivel de carácter y se proyecta mediante una capa de embeddings entrenable de dimensión 64. La secuencia resultante pasa por una GRU bidireccional de 128 unidades por dirección, cuya salida se proyecta linealmente a 80 bins de mel-espectrograma. Durante el entrenamiento se aplica interpolación temporal para ajustar la longitud de la secuencia predicha a la longitud objetivo del mel-espectrograma de referencia. No hay mecanismo de alineamiento aprendido ni predictor de duraciones, lo que constituye una de las carencias principales del sistema.

El entrenamiento se realizó en Google Colab con GPU, durante 300 épocas, sobre un conjunto de solo siete segmentos de audio WAV a 22.050 Hz con transcripciones manuales, sumando aproximadamente 70 segundos de audio. No se documenta el uso de RLHF, DPO ni técnicas de alineamiento forzado. El repositorio incluye el notebook `Hassaniya_TTS_NAIB.ipynb` con el flujo de preparación de datos, construcción del modelo, entrenamiento, guardado del checkpoint e inferencia. El checkpoint guarda pesos y valores de configuración necesarios para reconstruir la arquitectura, pero requiere la definición del modelo y la lógica de preprocesado para cargarse.

## Capacidades

- Generación de mel-espectrogramas a partir de texto en hassaniya a nivel de carácter.
- Flujo completo de entrenamiento e inferencia reproducible mediante notebook.
- Checkpoint recargable con pesos y configuración de arquitectura.
- Predicciones de mel-espectrograma finitas y verificadas tras la recarga del checkpoint.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del árabe declarado.
- No incluye modo de pensamiento, visión ni audio de entrada.
- No incorpora vocoder: la salida es mel-espectrograma, no audio final.

## Casos de uso

- Investigación en TTS para lenguas de bajos recursos: sirve como línea base reproducible para comparar futuras aproximaciones con datasets mayores y arquitecturas más capaces, gracias a que el notebook documenta todo el pipeline.
- Docencia y formación: el tamaño reducido (unos 171.600 parámetros) y la simplicidad de la arquitectura permiten usarlo como ejemplo didáctico de un pipeline texto-a-mel completo en PyTorch.
- Punto de partida para experimentos de alineamiento: al carecer de predictor de duraciones, es un banco de pruebas para añadir mecanismos de alineamiento o duraciones y medir su impacto.
- Estudio de normalización de texto en hassaniya: el modelo consume caracteres directamente, por lo que permite evaluar el efecto de distintas estrategias de normalización y transcripción sobre la calidad del mel generado.
- Reproducción de experimentos académicos: el checkpoint y el notebook permiten replicar el entrenamiento en Colab con GPU y verificar la reproducibilidad de los resultados publicados.
- Exploración de vocoders sobre mel-espectrogramas: la salida en 80 bins a 22.050 Hz puede alimentar un vocoder externo para estudiar la calidad final del audio, siempre con expectativas limitadas por los artefactos del modelo.
- Prototipado de demos internas de investigación: útil para mostrar el estado del arte en la materia dentro de un equipo, nunca para aplicaciones de accesibilidad o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que las predicciones de mel-espectrograma son finitas y que el audio generado contiene zumbidos sustanciales y otros artefactos audibles, con inteligibilidad limitada. No hay evaluación por hablantes nativos de hassaniya ni comparación validada con sistemas TTS establecidos.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 1 GB; el modelo tiene unos 171.600 parámetros y opera sobre secuencias de caracteres y mel-espectrogramas de 80 bins.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento original se hizo en Google Colab con GPU.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo Transformers. Requiere cargar la definición del modelo en PyTorch y la lógica de preprocesado del notebook.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hassaniya TTS NAIB baseline | ~171.600 | No disponible | Sin benchmarks; audio con artefactos | Apache-2.0 | Hugging Face |
| VITS (familia) | Del orden de millones | No aplica | TTS de extremo a extremo con vocoder integrado | MIT (implementaciones de referencia) | Repositorios públicos |
| Tacotron 2 (familia) | Decenas de millones | No aplica | TTS texto-a-mel con atención y vocoder | Varía según implementación | Repositorios públicos |
| XTTS / modelos TTS multilingües | Cientos de millones a miles de millones | No disponible | TTS multilingüe de alta calidad | Varía según modelo | Hugging Face |

La comparación es orientativa: no se dispone de datos de benchmarks del modelo evaluado ni de comparaciones directas publicadas por el autor. Las alternativas citadas pertenecen a familias de arquitectura distintas y con volúmenes de datos de entrenamiento incomparablemente mayores.

## Limitaciones y advertencias

- Solo siete ejemplos de entrenamiento y unos 70 segundos de audio: insuficiente para pronunciación robusta, generalización de hablante o síntesis natural.
- Sin mecanismo de alineamiento ni predicción de duraciones, lo que degrada la prosodia y la sincronización.
- Audio generado con zumbidos sustanciales y otros artefactos audibles; inteligibilidad limitada.
- Sin evaluación por hablantes nativos de hassaniya ni comparación validada con sistemas TTS establecidos.
- No es un modelo Transformers plug-and-play: requiere la definición del modelo y el preprocesado del notebook para cargarse.
- No apto para producción, aplicaciones críticas de accesibilidad ni ningún uso que requiera salida de voz fiable sin validación adicional.
- La licencia Apache-2.0 del repositorio no concede automáticamente derechos sobre las grabaciones originales ni sobre el dataset de entrenamiento; hay que verificar permisos antes de redistribuirlos.
- Riesgo de sesgos derivado de la escasez y falta de diversidad del dataset, con una única fuente de grabación y transcripción manual.
- Riesgo de alucinación acústica: el modelo puede generar mel-espectrogramas plausibles sin correspondencia con el texto de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidmhamedabderahman/hassaniya-tts-naib-baseline
- Notebook de entrenamiento e inferencia: `Hassaniya_TTS_NAIB.ipynb` (incluido en el repositorio del modelo)
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos públicos.
