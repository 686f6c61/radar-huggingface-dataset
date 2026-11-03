# MaxMillion404/MaxGPT-1

## Resumen

MaxGPT-1 es un modelo de lenguaje de 23,4 millones de parámetros desarrollado por Maxwell Brohm (cuenta de HuggingFace MaxMillion404) como el primero de una serie de cuatro modelos construidos desde cero en PyTorch, sin pesos preentrenados y sin la librería `transformers`. El modelo se presenta explícitamente como un ejercicio educativo: su propio autor lo describe como "word salad with English shape", es decir, un generador de texto con forma de inglés pero sin coherencia real. No está pensado para uso productivo.

La arquitectura es un transformer decoder-only de 6 bloques, dimensión oculta 384, 6 cabezas de atención y una ventana de contexto de tan solo 256 tokens. Incorpora un tokenizador BPE propio de 16.000 tokens entrenado sobre una muestra de los datos. El entrenamiento se realizó en aproximadamente 30 minutos sobre una única RTX 5070 de 12 GB, con 15.000 pasos, usando una mezcla de TinyStories y OpenAssistant.

Su relevancia es, por tanto, didáctica y de referencia: sirve para observar cómo emerge la coherencia del lenguaje a medida que crece la familia MaxGPT (de 23M a 235M parámetros, y un MaxGPT-Ultra de 1,09B en desarrollo). No compite con modelos de producción en ninguna tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT), 6 bloques, hidden size 384, 6 cabezas |
| Parametros totales | 23.427.072 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tokenizador | BPE propio, 16.000 tokens |
| Libreria | PyTorch (sin `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clásico: 6 bloques con dimensión oculta 384 y 6 cabezas de atención, lo que da una dimensión por cabeza de 64. La ventana de contexto es de 256 tokens, muy reducida y suficiente solo para fragmentos cortos. El tokenizador es un BPE propio de 16.000 tokens entrenado sobre una muestra del corpus, lo que implica que no es compatible con tokenizadores de modelos estándar y que cualquier integración debe usar el código del propio repositorio (`tokenizer.py`).

El entrenamiento se realizó desde cero, sin pesos preentrenados, en aproximadamente 30 minutos sobre una RTX 5070 de 12 GB, con 15.000 pasos. El corpus combina TinyStories y OpenAssistant, la misma mezcla que MaxGPT-2, de modo que la única variable que cambia entre modelos de la familia es el tamaño. No se documentan en la información disponible detalles sobre número total de tokens vistos, composición exacta del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. El autor indica que el código está escrito íntegramente a mano, sin generación por IA, y que no se usó la librería `transformers`.

## Capacidades

- Generación de texto en inglés con estructura superficial plausible (formato de frases y palabras), pero sin coherencia semántica real.
- Capacidad muy limitada de razonamiento, matemáticas y código; no se documenta ninguna evaluación en estas áreas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no se documenta soporte de otros idiomas.
- Sin modo "thinking", visión, audio ni capacidades multimodales.
- El modelo aprende parcialmente el formato de chat USER/ASSISTANT de OpenAssistant, aunque el autor señala que es MaxGPT-2 el que "aprende el formato de chat", no este.

## Casos de uso

- Material didáctico para estudiar el entrenamiento desde cero: el repositorio incluye `config.py`, `model.py`, `tokenizer.py` y `sample.py`, lo que permite recorrer el pipeline completo (tokenización, forward, muestreo) sin depender de `transformers`.
- Demostración de la relación entre escala y coherencia: al ejecutar MaxGPT-1 junto a MaxGPT-2 y MaxGPT-3 con la misma mezcla de datos se observa cómo emerge la estructura del lenguaje con el tamaño.
- Pruebas de infraestructura de inferencia a pequeña escala: con 23M de parámetros y 0,1 GB de repo, sirve para validar pipelines de carga de safetensors, tokenizadores propios y scripts de muestreo en CUDA, MPS o CPU.
- Experimentos de tokenización: al tener un BPE propio de 16.000 tokens entrenado sobre una muestra, es útil para comparar el comportamiento de tokenizadores pequeños frente a los de modelos grandes.
- Docencia y talleres de PyTorch: el modelo es lo bastante pequeño para entrenarse en minutos en una GPU de consumo, lo que permite reproducir el entrenamiento en clase.
- Referencia de línea base en investigación sobre modelos pequeños: útil como punto de comparación inferior en estudios sobre leyes de escala o sobre coherencia en modelos de menos de 100M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,4M de parámetros, los pesos en fp32 ocupan aproximadamente 94 MB, y en fp16 unos 47 MB. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó en una RTX 5070 de 12 GB y la inferencia cabe holgadamente en GPUs de consumo muy inferiores.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU y en Apple MPS (el script `run.py` soporta CUDA, MPS y CPU).
- Opciones de despliegue: el repositorio proporciona `run.py` con PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Dado que usa tokenizador y código propios, la integración con esos servidores requeriría trabajo adicional.
- Latencia y throughput: no disponibles. El muestreo por defecto genera 120 tokens con temperatura 0,8 y top-k 50.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MaxGPT-1 | 23M | 256 | Apache 2.0 | HuggingFace, código propio | Entrenado desde cero, tokenizador propio, sin `transformers` |
| MaxGPT-2 (misma familia) | 110M | 512 | no disponible en la informacion | GitHub del autor | Aprende el formato de chat USER/ASSISTANT |
| MaxGPT-3 (misma familia) | 235M | 1024 | no disponible en la informacion | GitHub del autor | "Chatbot con aspecto real" segun el autor |
| GPT-2 small (referencia) | 124M | 1024 | MIT (pesos OpenAI) | HuggingFace | Modelo de referencia de escala similar; no comparable en calidad por diferencias de entrenamiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación más directa es dentro de la propia familia MaxGPT, donde el autor documenta el aumento de coherencia con el tamaño.

## Limitaciones y advertencias

- Calidad de generación muy baja: el propio autor la describe como "word salad with English shape"; no es apto para producción ni para tareas que requieran respuestas correctas.
- Contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos.
- Solo inglés; sin soporte multilingüe.
- Tokenizador propio no compatible con los de modelos estándar, lo que complica la integración con herramientas y servidores de inferencia habituales.
- Riesgo elevado de alucinación y de texto incoherente; no debe usarse para generar información factual.
- Sesgos: no documentados en la información disponible, pero al entrenarse sobre TinyStories y OpenAssistant puede heredar sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece garantías de calidad; el usuario asume el riesgo.
- Sin datos publicados de evaluación, seguridad ni filtrado de contenido.

## Enlaces

- HuggingFace: https://huggingface.co/MaxMillion404/MaxGPT-1
- Repositorio GitHub del autor: https://github.com/MaxwellBrohm/MaxGPT
- Web del autor: https://maxwellbrohm.com
