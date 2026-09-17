# CharlieChen/loop-grow-d14

## Resumen

loop-grow-d14 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace, correspondiente al checkpoint final del punto de profundidad **d14** de la escalera de escalado sobre FineWeb del trabajo *"How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents"*. Se trata de un artefacto de investigación: un transformer con recúrsica (looped transformer) de 726.204.416 parámetros almacenados en FP32 (2,905 GB en disco), entrenado sobre el corpus FineWeb con el tokenizador GPT-2 de tiktoken y una longitud de contexto de 2.048 tokens.

El interés del modelo es metodológico más que de producto. Su etiqueta de profundidad ("loop", con 4 repeticiones configuradas y 4 repeticiones en la evaluación final) se usa como coordenada de escalado dentro del estudio, y el autor advierte explícitamente de que esa coordenada no tiene por qué coincidir con el número de bloques Transformer ejecutados. El checkpoint se distribuye tal cual salió del entrenamiento: no incluye estado del optimizador, no es un `AutoModel` de Transformers y requiere el código propio del paper (`cue-engineering/loop`) para reconstruir el modelo `TransformerGPT` y evaluarlo.

La relevancia actual es acotada pero clara para quien investiga escalado de cómputo y recursión en transformers: ofrece un punto reproducible de una escalera de escalado con métrica declarada (NLL de validación de preentrenamiento = 2,804646 nats/token) y sin ninguna publicación de resultados de benchmarks en la información disponible. No hay descargas ni "likes" registrados, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recúrsica ("looped transformer"), implementación propia `TransformerGPT` |
| Parametros totales | 726.204.416 almacenados en FP32 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene el checkpoint FP32 original) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `final.pt` (checkpoint PyTorch), más `result.json` y `SHA256SUMS` |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado con relleno a 50.304 filas del modelo |
| Anchura (d_model) | 1.792 |
| Cabezas de atención | 14 (dimensión por cabeza 128, derivada de 1.792/14) |
| Modo de profundidad | `loop` |
| Repeticiones del núcleo | 4 configuradas / 4 en la evaluación final |
| Corpus de entrenamiento | FineWeb |
| NLL de validación (preentrenamiento) | 2,804646 nats/token |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recúrsica: el núcleo del modelo se ejecuta repetidamente (`loop`, 4 repeticiones configuradas), de forma que la coordenada de profundidad de la escalera de escalado actúa como variable de control del estudio y no como recuento literal de bloques ejecutados. El modelo tiene 1.792 dimensiones de anchura y 14 cabezas de atención sobre un contexto fijo de 2.048 tokens, con un vocabulario GPT-2 de 50.257 tokens rellenado hasta 50.304 filas. El propio autor indica que `result.json` contiene la configuración del modelo, los recuentos de parámetros, los ajustes de entrenamiento y las métricas de validación registradas.

El preentrenamiento se realizó sobre FineWeb, el corpus de texto web en inglés, y el resultado publicado es el NLL de validación sobre ese mismo corpus de preentrenamiento (2,804646 nats/token), que el autor distingue explícitamente del NLL de respuestas de CORE. No hay información disponible sobre número total de tokens vistos, composición detallada del dataset, uso de RLHF/DPO ni de ninguna etapa de ajuste posterior: es un modelo estrictamente base. El paper declara el uso de GPUs H100, FlashAttention-3 y autocast en bfloat16 para la evaluación, lo que da una pista del entorno de cómputo, pero no de la innovación algorítmica concreta más allá de la recursión y los operadores de frontera mencionados en el título del trabajo.

## Capacidades

- Generación de texto en inglés: modelo base de tipo completado, sin plantilla de instrucciones ni alineación conversacional.
- Modelado de lenguaje puro: la métrica declarada es NLL por token, útil como referencia en experimentos de escalado.
- Recursión controlada: el núcleo puede ejecutarse repetidamente según la configuración de profundidad, lo que permite estudiar el efecto del cómputo recurrente sin aumentar el número de parámetros almacenados.
- Investigación en leyes de escalado: sirve como punto de una escalera de escalado (coordenada d14) sobre un corpus fijo (FineWeb).
- Evaluación mediante CORE: el código del paper permite ejecutar las 22 tareas de CORE con las semillas 0/1/2, además de un modo "smoke" acotado con `--max-per-task`.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (visión, audio, modo "thinking"): no disponible.

## Casos de uso

- Reproducción de resultados de escalado: cargar `final.pt` con el código de `cue-engineering/loop` y recalcular el NLL de validación sobre FineWeb para verificar el valor declarado de 2,804646 nats/token como punto de referencia de la escalera.
- Ablación de recursión: variar el número de repeticiones del núcleo manteniendo los pesos fijos y medir el efecto sobre el NLL, un experimento directo gracias a que la profundidad es una coordenada de configuración y no un recuento fijo de bloques.
- Evaluación académica con CORE: ejecutar las 22 tareas con las semillas 0/1/2 usando `eval.py` y comparar el rendimiento del punto d14 con otros puntos de la escalera del paper; conviene recordar que las puntuaciones "smoke" con `--max-per-task 10` no equivalen a los resultados completos.
- Fine-tuning como base de investigación: al ser un checkpoint base sin ajuste por instrucciones, es un punto de partida razonable para estudiar cómo se comporta el ajuste supervisado sobre una arquitectura recurrente de 726 M de parámetros y contexto 2.048.
- Generación de texto de dominio general en inglés: completado de documentos y generación libre dentro de la ventana de 2.048 tokens, con la advertencia de que no hay alineación ni filtrado de seguridad asociado.
- Estudio de eficiencia parámetros/cómputo: al reutilizar el mismo núcleo varias veces, es un banco de pruebas para medir la relación entre cómputo efectivo y calidad del modelo sin ampliar el checkpoint en disco.
- Referencia para destilación o comparativas internas: usar sus pesos y su NLL como línea base frente a modelos entrenados con la misma receta pero sin recursión o con otra coordenada de profundidad.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la pérdida de validación de preentrenamiento: **NLL = 2,804646 nats/token** sobre el corpus FineWeb. El autor remite al código del paper para ejecutar la evaluación CORE (22 tareas, semillas 0/1/2) con FlashAttention-3 y autocast en bfloat16 sobre H100, pero no se incluyen resultados numéricos de MMLU, HumanEval, GSM8K, CORE ni de ningún otro benchmark.

| Metrica | Resultado |
|---|---|
| NLL de validacion (FineWeb, preentrenamiento) | 2,804646 nats/token |
| CORE (22 tareas, semillas 0/1/2) | no disponible |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos aproximados a partir de 726 M de parámetros, sin datos oficiales): en FP32, en torno a 3 GB solo de pesos más activaciones; en bf16/fp16, alrededor de 1,5 GB de pesos; en int8, unos 0,75 GB; en int4, unos 0,4 GB. La memoria para activaciones depende del lote y de la longitud de secuencia (máximo 2.048 tokens).
- GPU recomendadas: el paper emplea H100 con FlashAttention-3 y autocast en bfloat16. Cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar el modelo en precisión reducida.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores, siempre que se ejecute con el código propio del modelo y no mediante un runtime genérico.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama, TGI ni Transformers, porque el artefacto no es un `AutoModel` y requiere reconstruir `TransformerGPT` con el repositorio del paper. La descarga se hace con `huggingface_hub.snapshot_download` y la evaluación con `eval.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo en la información proporcionada, por lo que no es posible una comparación de rendimiento verificada. La tabla siguiente recoge únicamente datos estructurales; los correspondientes a las alternativas provienen de conocimiento general del ecosistema y no de la búsqueda web realizada (que no devolvió resultados relacionados con el modelo), por lo que conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-grow-d14 | 726 M | 2.048 | Base, transformer con recúrsica | no disponible | Checkpoint PyTorch propio en HuggingFace |
| Pythia-1B | ~1.000 M | 2.048 | Base, transformer denso | Apache 2.0 | Transformers `AutoModel` |
| TinyLlama-1.1B | ~1.100 M | 2.048 | Base/chat, transformer denso | Apache 2.0 | Transformers, GGUF, Ollama |
| GPT-2 XL | ~1.500 M | 1.024 | Base, transformer denso | MIT | Transformers, GGUF, Ollama |

La diferencia relevante no es de tamaño sino de integración: las alternativas son cargables con `AutoModel` y cuentan con cuantizaciones GGUF y runtimes estándar, mientras que loop-grow-d14 exige el código del paper y no ofrece pesos en safetensors ni GGUF.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información publicada sobre sesgos, filtrado de datos ni evaluación de seguridad; el entrenamiento sobre FineWeb hace esperable la presencia de sesgos propios del texto web en inglés, aunque el autor no lo documenta.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo base sin alineación, no hay mitigación específica.
- Limitaciones de contexto e idioma: ventana de 2.048 tokens y soporte únicamente de inglés.
- Restricciones de licencia: la licencia no está declarada, por lo que no puede asumirse su uso comercial. Cualquier uso en producción requiere aclarar la licencia con el autor.
- Artefacto no estándar: no es un checkpoint `AutoModel` de Transformers; no se puede cargar con `from_pretrained` ni desplegar directamente en vLLM, llama.cpp, Ollama o TGI.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento tal cual.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni CORE; el único número disponible es el NLL de validación, y el propio autor advierte que las puntuaciones "smoke" no equivalen a resultados completos del paper.
- Madurez y adopción: cero descargas y cero "likes" en el momento de la consulta, repositorio de 2,9 GB y publicación muy reciente (16 de septiembre de 2026, última actualización el mismo día).
- Sin ajuste por instrucciones: no es adecuado como asistente conversacional ni para tareas que exijan seguir instrucciones de forma fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-grow-d14
- Repositorio de código del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper *"How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents"*: enlace no disponible en la información proporcionada
- Otros enlaces relevantes: no disponible; la búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos correspondían a páginas sobre el actor River Phoenix y no guardan relación con este artefacto).
