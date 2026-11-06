# shonenash/electra-ai-human-classifier

## Resumen

`electra-ai-human-classifier` es un clasificador binario de texto en inglés que estima si un documento ha sido escrito por una persona o generado por un modelo de lenguaje. Lo desarrolla el usuario de Hugging Face `shonenash` y se publica bajo licencia MIT. El modelo parte de `google/electra-small-discriminator` y añade un pooling de media sobre tokens más una cabeza de clasificación de dos capas, sumando 13.549.314 parámetros en total. El repositorio ocupa 0,1 GB y los pesos están en `safetensors` con código PyTorch.

El problema que aborda es la detección de texto sintético, una tarea relevante para moderación de contenido, integridad académica y verificación editorial. Su enfoque es deliberadamente ligero: al apoyarse en ELECTRA-small, el coste computacional es mínimo y puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita su integración en pipelines de revisión a gran escala.

La relevancia actual viene de la proliferación de textos generados por modelos como Claude, DeepSeek, Llama o Phi, que el autor incluye explícitamente en el conjunto de entrenamiento. No obstante, el propio autor advierte que la salida es una probabilidad, no una prueba, y que no debe usarse de forma aislada para determinar si alguien ha empleado IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ELECTRA-small (discriminador) con mean pooling y cabeza de clasificación de dos capas |
| Parametros totales | 13.549.314 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 subwords por fragmento; el documento se divide en trozos de 200 palabras |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (también `config.json`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ELECTRA-small preentrenado por Google, reutilizado como extractor de representaciones. Sobre él se aplica un pooling de media sobre los tokens y una cabeza de clasificación de dos capas que produce la probabilidad de que el texto sea humano (etiqueta 1) o generado por IA (etiqueta 0). El tokenizador es el WordPiece propio de ELECTRA. El proceso de puntuación divide el documento en fragmentos de 200 palabras, trunca cada uno a 256 subwords, lo puntúa y promedia las probabilidades de todos los fragmentos; por debajo de 0,5 el texto se clasifica como IA.

El entrenamiento usó 86.672 documentos balanceados por clase y por registro (casual y formal), durante 2 épocas. Para la clase IA se emplearon conversaciones de Claude del dataset `Havoc999/The-Claude-Dataset` y respuestas estilo Reddit generadas con DeepSeek, Dolphin, Llama 3.2 y Phi-4. Para la clase humana se usaron comentarios de Reddit, corpus de subreddits de ConvoKit, 20 Newsgroups (vía scikit-learn) y Wikipedia del volcado de 2023, anterior a la mayoría de ediciones escritas por IA. La partición train/test se hizo por autor, artículo o prompt, de modo que ninguno aparece en ambos lados. No se documenta uso de RLHF ni DPO; es un ajuste supervisado de clasificación.

## Capacidades

- Clasificación binaria de texto en inglés: humano (1) o generado por IA (0), con salida de probabilidad.
- Puntuación de documentos largos mediante fragmentación en trozos de 200 palabras y agregación por media.
- Detección de texto generado por múltiples familias de modelos: Claude, DeepSeek, Dolphin, Llama 3.2, Phi-4, y según el autor también Gemini 3.1 Pro y Claude Opus 5 en pruebas no vistas.
- Distinción por registro: el entrenamiento está balanceado entre estilo casual (Reddit) y formal (Wikipedia, 20 Newsgroups).
- Ejecución ligera: 13,5M de parámetros permiten inferencia en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Moderación de contenido en foros y comunidades: el modelo puede puntuar comentarios y publicaciones para señalar posibles textos generados por IA, con revisión humana posterior dado que la salida es probabilística.
- Verificación editorial en medios: integrado en el flujo de revisión, permite marcar artículos o colaboraciones sospechosas antes de publicación, especialmente en textos de más de 100 palabras donde la fiabilidad es mayor.
- Integridad académica: como señal complementaria en la revisión de trabajos, sin sustituir el juicio del evaluador ni usarse como prueba única.
- Detección de spam y granjas de contenido: al ser un modelo de 13,5M de parámetros, puede desplegarse en CPU para filtrar grandes volúmenes de texto entrante con coste mínimo.
- Análisis de datasets: permite auditar corpus recolectados de la web para estimar la proporción de contenido sintético antes de usarlos en entrenamiento.
- Investigación sobre detección de IA: sirve como línea base ligera y reproducible (licencia MIT, pesos abiertos) para comparar con detectores más grandes o especializados.
- Clasificación por lotes en pipelines de datos: la fragmentación en trozos de 200 palabras facilita procesar documentos largos de forma paralela y agregar las puntuaciones.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado |
|---|---|---|
| Test reservado (37.657 documentos, mismas fuentes) | Accuracy | 0,997 |
| Test reservado | F1 clase IA | 0,988 |
| Test reservado | F1 clase humano | 0,998 |
| 9 documentos no vistos (incluye Gemini 3.1 Pro y Claude Opus 5) | Aciertos | 8/9 (el fallo fue un texto de Claude puntuado 0,61 como humano) |

No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (13,5M de parámetros equivalen a unos 54 MB de pesos); en la práctica cabe en cualquier GPU y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobrada para inferencia.
- Cabe en GPU consumer: sí, en todas las gamas, e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (el repo incluye `config.json` y tokenizador), y potencialmente exportación a ONNX o `llama.cpp`/`Ollama` no está documentada; vLLM y TGI no están indicados para este tipo de clasificador.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera muy baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se apoya en `google/electra-small-discriminator` (mismo tamaño, tarea distinta: preentrenamiento tipo discriminador), pero no se han publicado comparaciones con otros detectores de texto IA.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shonenash/electra-ai-human-classifier | 13,5M | 256 subwords por fragmento | Detección IA/humano | MIT | Hugging Face |
| google/electra-small-discriminator | ~13,5M | 512 tokens (modelo base) | Representaciones / preentrenamiento | Apache 2.0 (modelo base) | Hugging Face |
| Otros detectores de texto IA | No disponible | No disponible | Detección IA/humano | No disponible | No disponible |

## Limitaciones y advertencias

- La salida es una probabilidad, no una prueba; el autor desaconseja explícitamente usarla de forma aislada para decidir si alguien empleó IA.
- Textos cortos (menos de ~100 palabras) son poco fiables por falta de señal.
- Texto generado por IA que ha sido editado o parafraseado por una persona puede clasificarse como humano.
- Texto generado por modelos o estilos alejados de los datos de entrenamiento puede clasificarse como humano.
- Escritura humana muy formal o formulaica puede clasificarse erróneamente como IA.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos y falsos negativos con impacto reputacional o académico.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datos de entrenamiento (Reddit, Wikipedia, 20 Newsgroups) si se redistribuye el modelo o se usa en producción.
- El modelo base (`google/electra-small-discriminator`) tiene su propia licencia Apache 2.0; el ajuste se distribuye bajo MIT.
- El rendimiento en el test reservado (0,997 de accuracy) procede de las mismas fuentes que el entrenamiento, por lo que no refleja el rendimiento en dominios nuevos; la única prueba fuera de distribución son 9 documentos, una muestra demasiado pequeña para extraer conclusiones robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shonenash/electra-ai-human-classifier
- Space de demostración (AI Text Analyzer): https://huggingface.co/spaces/shonenash/ai-text-analyzer
- Código de puntuación (`detector.py`): https://huggingface.co/spaces/shonenash/ai-text-analyzer/blob/main/detector.py
- Modelo base: https://huggingface.co/google/electra-small-discriminator
- Dataset de Claude: https://huggingface.co/datasets/Havoc999/The-Claude-Dataset
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
