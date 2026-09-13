# Asilarkness/flybrain-lm

## Resumen

FlyBrain LM es un modelo de lenguaje de 81.642.733 parámetros publicado por el usuario Asilarkness en Hugging Face. Su particularidad es que el núcleo recurrente del modelo no es una pila de capas transformer convencional, sino el conectoma real del cerebro adulto de la mosca de la fruta (Drosophila melanogaster) procedente de FlyWire v783: los 48.000 nodos con mayor grado de salida y 6,65 millones de sinapsis biológicas. La topología del cableado está congelada (es anatomía real) y solo se entrenan las fuerzas sinápticas, las lentes de entrada/salida y los embeddings. Se trata, por tanto, de un artefacto de investigación sobre computación biológicamente inspirada, no de un modelo orientado a producto.

El modelo se distribuye en formato safetensors con pesos en bf16, acompañado de un script de inferencia autónomo (`flybrain.py`) que solo requiere torch, safetensors y tokenizers. El tokenizador es un BPE de 4.000 tokens entrenado sobre TinyStories, lo que sitúa el dominio esperable en narrativa infantil en inglés. La model card declara el estado de entrenamiento en la iteración 1800, con una pérdida de validación de 3,483 calculada como media de dos conjuntos ("newchat" y "cot").

La relevancia del proyecto es fundamentalmente experimental: plantea si un sustrato de conectividad biológica fija puede sostener generación de lenguaje aprendiendo únicamente los pesos sinápticos. Sin embargo, la información pública es mínima (cero descargas, cero likes en el momento de la consulta, sin licencia declarada, sin benchmarks estándar y sin paper asociado), por lo que cualquier evaluación rigurosa exige ejecutar el código de inferencia por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje con núcleo recurrente basado en el conectoma adulto de Drosophila (FlyWire v783, top-48k neuronas por grado de salida); topología sináptica congelada, solo se entrenan fuerzas sinápticas (Wval), proyecciones de entrada (Win), embeddings y lentes de salida |
| Parametros totales | 81.642.733 (pesos en bf16) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible (no se publica el contenido de `config.json`) |
| Tipos de cuantizacion | No disponible; el único formato declarado es bf16 sin cuantizar |
| Idiomas soportados | No disponible; el tokenizador BPE-4k se entrenó sobre TinyStories (narrativa infantil en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |
| Tokenizador | BPE de 4.000 tokens entrenado sobre TinyStories (`tokenizer.json`) |
| Conectoma de referencia | FlyWire v783, 48.000 neuronas seleccionadas por out-degree, 6,65 millones de sinapsis biológicas |
| Estado de entrenamiento | Iteración 1800; mejor pérdida de validación declarada (newchat + cot)/2 = 3,483 |
| Tamaño del repositorio | 5,1 GB |
| Archivos incluidos | `model.safetensors`, `tokenizer.json`, `config.json`, `flybrain.py` |
| Fecha de publicación | 2026-09-13 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La innovación principal es el uso del conectoma como matriz de recurrencia. El modelo almacena la topología en un buffer (`Widx`) que no se actualiza durante el entrenamiento, y los parámetros entrenables son las magnitudes sinápticas (`Wval`), las proyecciones de entrada (`Win`), los embeddings (`emb`) y las lentes de entrada/salida (`lens`). El modelo se describe como "a character of BPE-level language model", redacción ambigua que no permite confirmar si el modelado es a nivel de carácter, a nivel de token BPE o una mezcla; lo que sí se especifica es que el tokenizador es BPE con vocabulario de 4.000 unidades entrenado sobre TinyStories.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset más allá del tokenizador, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documenta el procedimiento de optimización, el régimen de aprendizaje ni el esquema de batching. La única métrica reportada es la pérdida de validación en la iteración 1800, definida como la media de dos particiones denominadas "newchat" y "cot", un valor no comparable con perplejidades estándar de otros modelos porque depende del vocabulario y del corpus concreto.

Un punto técnico que la información disponible no aclara es la correspondencia exacta entre los 48.000 nodos del conectoma y la dimensión interna efectiva del modelo: con 81,6 millones de parámetros totales y un vocabulario de 4.000 tokens, la proyección entre el grafo biológico y el espacio latente del lenguaje debe de estar mediada por las lentes de entrada/salida, pero no se detalla cómo. La diferencia entre el tamaño del repositorio (5,1 GB) y el tamaño teórico de los pesos en bf16 (unos 163 MB) sugiere que los buffers de topología u otros artefactos ocupan la mayor parte del espacio, aunque esto no se confirma en la model card.

## Capacidades

- Generación de texto autorregresiva a nivel de BPE, con un formato de prompt conversacional sugerido en el ejemplo de uso (`Human: ...\nFly:`).
- Posible soporte de formato de chat y de razonamiento en cadena: la métrica de validación se desdobla en "newchat" y "cot", lo que apunta a que el autor evalúa por separado conversación y cadena de pensamiento, aunque no se documenta la plantilla exacta.
- Modelado de lenguaje dentro del dominio de TinyStories (narrativa breve infantil en inglés), que es el corpus con el que se entrenó el tokenizador.
- Inferencia autónoma mediante `flybrain.py`, con dependencias mínimas (torch, safetensors, tokenizers) y carga directa desde el repositorio.
- Inspección del conectoma entrenado: al conservar `Widx` como buffer y `Wval` como parámetros, el modelo permite analizar qué sinapsis biológicas ha reforzado o debilitado el entrenamiento.
- Tool calling / function calling: no disponible, no documentado.
- Comportamiento como agente y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponible; no hay evidencia de entrenamiento fuera del inglés de TinyStories.
- Capacidades de visión, audio o pensamiento explícito: no disponibles, no documentadas.

## Casos de uso

- Investigación en computación basada en conectomas: el modelo sirve como banco de pruebas para medir cuánta capacidad lingüística puede sostener una topología biológica congelada cuando solo se aprenden las magnitudes sinápticas, comparándolo con arquitecturas transformer de tamaño similar.
- Neurociencia computacional aplicada al conectoma FlyWire: al conservar `Wval` como tensor entrenable, es posible correlacionar las sinapsis que el modelo refuerza con tipos celulares o circuitos conocidos del cerebro de la mosca, generando hipótesis sobre qué subredes son funcionalmente relevantes para una tarea concreta.
- Estudio de eficiencia de parámetros en sustratos fijos: con 81,6 millones de parámetros y un vocabulario de 4.000 tokens, es un caso de estudio útil para analizar la relación entre parámetros entrenables libres y topología impuesta en tareas de modelado de lenguaje.
- Docencia y divulgación sobre IA neuroinspirada: el script `flybrain.py` y un tokenizador de 4.000 tokens permiten reproducir el pipeline completo en un portátil, lo que facilita demostraciones didácticas sobre modelos recurrentes y conectomas reales.
- Generación de narrativa breve en inglés dentro del dominio TinyStories: dado que el tokenizador se entrenó con ese corpus, el uso más previsible es la generación de cuentos infantiles cortos, siempre que se valide empíricamente la coherencia de la salida.
- Fine-tuning experimental de las componentes entrenables: al estar congelada únicamente la topología, es viable ajustar `Wval`, `Win`, `emb` y `lens` sobre un corpus propio para estudiar cómo se reorganizan las intensidades sinápticas en un nuevo dominio.
- Prueba de concepto para comparativas de eficiencia en hardware modesto: un modelo de este tamaño se ejecuta en CPU o en cualquier GPU consumer, lo que permite usarlo como referencia de bajo coste en experimentos de latencia y throughput frente a alternativas transformer.
- Auditoría de reproducibilidad de publicaciones en Hugging Face: el caso ilustra cómo evaluar un repositorio sin licencia, sin benchmarks y con documentación mínima antes de incorporarlo a cualquier flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada es la pérdida de validación interna del autor en la iteración 1800:

| Metrica | Valor | Nota |
|---|---|---|
| Pérdida de validación (newchat + cot)/2 | 3,483 | Calculada por el autor en la iteración 1800; no es comparable con perplejidades estándar porque depende del tokenizador BPE-4k y del corpus de validación, no documentados |
| MMLU / HumanEval / GSM8K / otros | No disponible | No publicados |
| Evaluaciones de sesgo, verdad factual o seguridad | No disponible | No publicadas |

## Requisitos de hardware

- Pesos en bf16: 81.642.733 parámetros equivalen a aproximadamente 163 MB en disco, más el buffer de topología y el resto de artefactos del repositorio, que en total ocupan 5,1 GB.
- VRAM estimada para inferencia: por debajo de 1 GB en bf16 si se carga solo el modelo; el buffer de conectoma puede elevar el consumo, pero no se documenta su tamaño exacto. Con cuantización a 8 bits o 4 bits bajaría todavía más, si bien el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente en la práctica. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1050 Ti en adelante, RTX 20/30/40, Apple Silicon) e incluso en CPU con memoria suficiente.
- Opciones de despliegue: el autor solo proporciona `flybrain.py`, un script independiente basado en torch, safetensors y tokenizers. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni formato GGUF.
- Latencia y throughput estimados: no disponibles. Al no publicarse `config.json` ni el grafo de cómputo del núcleo recurrente, no es posible estimar razonablemente los tokens por segundo sin ejecutar el modelo.
- Almacenamiento: prever al menos 5,1 GB libres para clonar el repositorio completo, aunque solo se necesite `model.safetensors` para inferencia.

## Comparativa con modelos similares

No existe una categoría estricta de comparación: FlyBrain LM no es un transformer denso convencional, sino un modelo recurrente con topología biológica fija. Los modelos más cercanos por rango de parámetros son modelos de lenguaje pequeños, pero la comparación solo es válida en tamaño y disponibilidad, no en rendimiento. Los datos de las alternativas proceden de su documentación pública; no se ha ejecutado ninguna comparación directa con FlyBrain LM.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comparacion con FlyBrain LM |
|---|---|---|---|---|---|
| FlyBrain LM (Asilarkness) | 81,6 M | No disponible | No disponible | Hugging Face, 4 archivos, script de inferencia propio | Núcleo recurrente biológico con topología congelada; sin benchmarks ni licencia |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Licencia MIT modificada | Ampliamente distribuido, múltiples runtimes (GGUF, vLLM, etc.) | Transformer denso estándar; ecosistema y documentación muy superiores; no comparte enfoque arquitectónico |
| Pythia-70M (EleutherAI) | 70 M | 2048 tokens | Apache 2.0 | Hugging Face, integración con transformers | Transformer denso con suite de checkpoints intermedios para investigación de interpretabilidad; licencia permisiva |
| SmolLM-135M (Hugging Face) | 135 M | 2048 tokens | Apache 2.0 | Hugging Face, formatos transformers y GGUF | Transformer denso entrenado con un corpus web a gran escala; mayor contexto y licencia clara |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial ni para redistribución. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Ausencia total de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, sesgo o veracidad. Cualquier afirmación sobre su calidad requiere medición propia.
- Model card incompleta: no se documentan sesgos, composición del dataset de entrenamiento, número de tokens, régimen de alineación ni limitaciones conocidas.
- Datos de validación no reproducibles: la pérdida de 3,483 depende del tokenizador BPE-4k y de las particiones "newchat" y "cot", cuyo contenido no se publica, por lo que no es verificable ni comparable.
- Tokenizador entrenado sobre TinyStories: el vocabulario y la distribución de entrenamiento corresponden a narrativa infantil en inglés, de modo que el rendimiento fuera de ese dominio y en otros idiomas es previsiblemente limitado, aunque no se han publicado mediciones al respecto.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje generativo y, en este caso, sin ninguna evaluación de factualidad publicada.
- Modelo en estado intermedio: la propia model card indica la iteración 1800, sin declarar convergencia ni un checkpoint final estable.
- Topología congelada como límite estructural: al no poder modificar el cableado, la capacidad de adaptación a tareas muy alejadas del dominio del conectoma depende por completo de las fuerzas sinápticas y de las lentes de entrada/salida.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta implican que no hay informes independientes de funcionamiento, ni issues resueltos, ni versiones corregidas.
- Desproporción entre tamaño del repositorio y pesos: 5,1 GB de repositorio frente a unos 163 MB de pesos bf16; conviene inspeccionar los buffers (topología `Widx`) antes de planificar el despliegue en memoria.
- Fechas de metadatos: la creación y la actualización figuran como 2026-09-13, una fecha que conviene verificar antes de citar el modelo en cualquier trabajo.
- Sin soporte de ecosistema: no hay GGUF, ni integración con transformers, vLLM, TGI u Ollama, lo que obliga a mantener el script propietario del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asilarkness/flybrain-lm
- Script de inferencia `flybrain.py`: incluido en el repositorio de Hugging Face (https://huggingface.co/Asilarkness/flybrain-lm/blob/main/flybrain.py)
- Tokenizador `tokenizer.json`: incluido en el repositorio de Hugging Face (https://huggingface.co/Asilarkness/flybrain-lm/blob/main/tokenizer.json)
- Configuración `config.json`: incluida en el repositorio de Hugging Face (https://huggingface.co/Asilarkness/flybrain-lm/blob/main/config.json)
- Paper o documentación técnica del autor: no disponible
- Enlace al conectoma FlyWire v783 citado en la model card: no disponible (la model card no incluye URL y la búsqueda web realizada no devolvió resultados relevantes)
- Blog, demo o repositorio adicional del autor: no disponible
- Resultados de la búsqueda web: no relevantes (únicamente páginas de inicio y enlaces de acceso de Facebook en inglés y árabe, sin relación con el modelo)
