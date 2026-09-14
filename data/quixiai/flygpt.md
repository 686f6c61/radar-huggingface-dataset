# QuixiAI/FlyGPT

## Resumen
FlyGPT es un modelo de lenguaje a nivel de carácter desarrollado por QuixiAI (Eric Hartford) cuya arquitectura recurrente no es un transformer, sino un subgrafo real del conectoma del cerebro de la mosca de la fruta (Drosophila melanogaster), extraído de MaleCNS v1.0. Concretamente, el grafo del modelo contiene 5.000 neuronas y 524.324 conexiones dirigidas que representan 8.300.915 contactos sinápticos, y cada una de esas conexiones tiene un peso escalar aprendido por descenso de gradiente mientras la topología del insecto permanece fija.

El modelo se presenta como una alternativa a propuestas previas de "reservoir computing" biológico, como ngxson/fly-llm-hf, que congelan los pesos sinápticos del conectoma y solo entrenan las proyecciones de entrada y el readout. FlyGPT entrena en su lugar un valor por sinapsis real, y el autor plantea una comparación con las mismas neuronas pero con conexiones barajadas preservando el grado (control "scrambled") sobre semillas emparejadas.

Es un artefacto de investigación, no un modelo de propósito general: tiene 578.197 parámetros aprendidos (Hugging Face cuenta 2.156.937 tensores porque incluye las tablas enteras del grafo), un tokenizador estricto de 65 caracteres y fue entrenado exclusivamente sobre karpathy/tiny_shakespeare hasta el paso 20.000, con una pérdida de validación de 1,7275 nats/char en la condición "real" (seed 1).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN dispersa recurrente cuya topología es un subgrafo real del conectoma central de la mosca de la fruta (MaleCNS v1.0); no es un transformer ni un MoE |
| Parametros totales | 2.156.937 tensores contados por Hugging Face; de ellos, 578.197 parámetros aprendidos (`recurrent.*`, `embed.*`, `input_proj.*`, `lm_head.*`) y 1.578.740 valores enteros de anatomía (`graph.*`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el estado oculto de 5.000 neuronas persiste entre pasos y no se declara una ventana de contexto explícita |
| Tipos de cuantizacion | no disponible; los pesos aprendidos se almacenan en bfloat16 y la matmul recurrente dispersa se reconstruye en fp32 en tiempo de ejecución |
| Idiomas soportados | inglés (`en`), limitado al repertorio de 65 caracteres de Tiny Shakespeare |
| Licencia | cc-by-4.0 (requiere atribución del modelo, del modelo base y del artículo del dataset) |
| Formato de pesos | safetensors (bf16 para los tensores aprendidos, int32/int64 para los tensores de grafo); requiere `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento
El grafo se extrae de forma determinista de QuixiAI/MaleCNS mediante `build_graph.py` (revisión fijada en `data/fly/build_edges.py`): se parte del cerebro central (37.108 neuronas con `superclass` que empieza por `cb_`), se impone un mínimo de 3 sinapsis por conexión, se toma el mayor componente fuertemente conexo (SCC, fracción 1,0), después el mayor núcleo dirigido (k,k)-core con k = 40 y se recorta por grado ponderado hasta 5.000 neuronas. El resultado incluye 93.055 pares recíprocos, 256 neuronas de entrada (por mayor grado de salida) y 512 de salida (por mayor grado de entrada); la distancia mediana entrada→salida es de 1,0 saltos (p90 1,0; máximo 1,0), lo que indica un subgrafo muy superficial. El hash del grafo es `f82b783b7ccb5a354fc4cf3de6de4a98d75029303c55f8faae28ab807828a007` y `graph.node_id` conserva los identificadores corporales de MaleCNS.

La dinámica es explícita en la model card: el carácter se embebe en 32 dimensiones y se proyecta a 256 neuronas de entrada; cada neurona propone `tanh(Σ_j W_ij h_j / sqrt(in_degree_i) + external_input_i + bias_i)` y actualiza su estado con `h_i ← (1 − leak_i) h_i + leak_i · proposal_i`, con `leak_i = sigmoid(raw_leak_i)` y 2 microsteps por carácter; los 512 estados de salida se proyectan a 65 logits. El entrenamiento usa descenso de gradiente sobre un valor por conexión sináptica real, con la topología fija, y el checkpoint publicado corresponde a la condición "real", seed 1, paso 20.000. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades
- Generación de texto a nivel de carácter en inglés, restringida a los 65 caracteres del corpus Tiny Shakespeare.
- Modelado de lenguaje autorregresivo con estado recurrente persistente entre pasos, sin mecanismo de atención.
- Ejecución de una matmul dispersa sobre una topología sináptica biológica real, con escalado por `1/sqrt(in_degree)`.
- Entrenamiento end-to-end de un peso escalar por sinapsis real, en contraste con el enfoque de reservorio congelado.
- Servir como banco de pruebas reproducible para comparar conectoma real frente a conectoma barajado preservando el grado.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento según la información disponible.
- Capacidad multilingüe: no disponible (solo inglés y solo el repertorio de caracteres de Shakespeare).

## Casos de uso
- Investigación en neurociencia computacional: comparar el rendimiento de un subgrafo real del conectoma MaleCNS frente al mismo conjunto de neuronas con conexiones barajadas preservando el grado, usando las semillas emparejadas que describe el autor.
- Estudio de reservoir computing frente a entrenamiento de pesos sinápticos: FlyGPT permite contrastar directamente con ngxson/fly-llm-hf, que congela los pesos del conectoma, para medir cuánta capacidad predictiva aporta el entrenamiento de las sinapsis.
- Reproducción de experimentos con presupuesto mínimo: con 578.197 parámetros aprendidos, el entrenamiento completo (20.000 pasos sobre Tiny Shakespeare) es viable en CPU o en una única GPU de consumo, lo que facilita la réplica por parte de grupos con pocos recursos.
- Docencia y divulgación: ilustrar de forma tangible la diferencia entre una topología biológica y una arquitectura de transformer, mostrando tensores de anatomía (`graph.*`) separados de los parámetros aprendidos.
- Desarrollo y validación de kernels de matmul disperso: el modelo exige reconstruir en fp32 una matriz de 5.000 × 5.000 con 524.324 aristas, un caso de prueba útil para evaluar implementaciones sparse en PyTorch.
- Generación de texto de estilo shakespeariano como demostración: a partir de un prefijo como `ROMEO:` el modelo completa 300 tokens con muestreo a temperatura 0,8, adecuado para arte generativo o ejemplos pedagógicos, no para texto fiable.
- Prueba de integración de `custom_code` en pipelines de transformers: sirve para verificar flujos de carga con `trust_remote_code=True` y `dtype=torch.float32` antes de aplicarlos a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo no está diseñado para esas tareas.

| Evaluación | Resultado | Notas |
|---|---|---|
| Tiny Shakespeare, pérdida de validación | 1,7275 nats/char | Condición "real", seed 1, paso 20.000, split fijo |
| Comparación con conectoma barajado (degree-preserving) | no disponible | El autor declara el diseño con seeds emparejadas, pero no se publican los resultados del control en la información disponible |
| MMLU / HumanEval / GSM8K | no aplicable | Modelo de carácter entrenado solo con Tiny Shakespeare |

## Requisitos de hardware
- VRAM estimada para inferencia: menos de 50 MB en total; los pesos aprendidos en bf16 suman alrededor de 1,2 MB y los tensores de grafo alrededor de 6,4 MB, por lo que cualquier GPU de consumo, CPU moderna o incluso un dispositivo móvil puede alojarlo.
- GPU recomendadas: cualquiera; el modelo no requiere A100, H100 ni RTX 4090. Una GPU de consumo (o directamente CPU) es suficiente.
- Cabe en GPU de consumo: sí, con enorme margen; también en Raspberry Pi y en entornos sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.float32`; no hay constancia de soporte en vLLM, llama.cpp, Ollama, TGI ni de variantes GGUF, dado el uso de `custom_code` y de una matmul dispersa no estándar.
- Latencia y throughput estimados: no disponibles. El coste por token es bajo en teoría, pero la reconstrucción en runtime de la matmul dispersa en fp32 puede dominar el tiempo de ejecución si no está optimizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuixiAI/FlyGPT | 578.197 aprendidos (2.156.937 tensores contados por Hugging Face) | no disponible | Subgrafo real del conectoma con un peso entrenado por sinapsis, topología fija | cc-by-4.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| ngxson/fly-llm-hf | no disponible | no disponible | Conectoma congelado como reservorio; solo se entrenan proyecciones y readout | no disponible | Hugging Face |
| QuixiAI/MaleCNS (modelo base) | no aplica (tablas de conectividad, no un modelo entrenado) | no disponible | Empaquetado sin pérdida de las tablas de conectividad MaleCNS v1.0 en safetensors | cc-by-4.0 | Hugging Face, DOI 10.57967/hf/10410 |

## Limitaciones y advertencias
- El tokenizador es estricto: solo son codificables los 65 caracteres de Tiny Shakespeare, lo que lo inutiliza para texto real en inglés.
- Entrenado únicamente con `karpathy/tiny_shakespeare`, sin datos adicionales; el riesgo de sobreajuste al corpus y de generar texto incoherente fuera de él es alto.
- Es un modelo de investigación sobre conectómica, no un asistente ni un modelo de propósito general; no soporta tool calling, agentes ni razonamiento multi-paso.
- No es una simulación biológica de una mosca viva: los recuentos de sinapsis de MaleCNS son datos anatómicos almacenados en `graph.synapse_count` y no son parámetros del modelo.
- El recuento de 2.156.937 parámetros que reporta Hugging Face incluye los tensores enteros del grafo; el tamaño real del modelo entrenado es de 578.197 parámetros, un dato que conviene no citar de forma engañosa.
- El subgrafo extraído presenta una distancia mediana entrada→salida de 1,0 saltos, lo que sugiere una profundidad computacional muy limitada en la ruta directa.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor al cargar el modelo; hay que auditar ese código antes de usarlo en entornos controlados.
- No hay benchmarks estándar publicados ni comparación publicada frente al control de conexiones barajadas, pese a que el autor describe ese experimento.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- La licencia cc-by-4.0 permite uso comercial, pero obliga a atribuir el modelo, el modelo base (QuixiAI/MaleCNS) y el artículo del dataset (Berg et al. 2026); conviene revisar además los términos de MaleCNS.
- La fecha de creación del repositorio (14 de septiembre de 2026) y las referencias bibliográficas de 2026 deben verificarse antes de citarlas en publicaciones.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/QuixiAI/FlyGPT
- Modelo base (empaquetado del conectoma): https://huggingface.co/QuixiAI/MaleCNS
- DOI del modelo base: https://doi.org/10.57967/hf/10410
- Repositorio de código: https://github.com/QuixiAI/FlyGPT
- Conectoma MaleCNS v1.0 (Janelia): https://male-cns.janelia.org/
- Ruta de datos del conectoma: `gs://flyem-male-cns/v1.0/connectome-data/flat-connectome/`
- Enfoque previo de reservorio congelado: https://huggingface.co/ngxson/fly-llm-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/karpathy/tiny_shakespeare
- Artículo del dataset: Berg, S. et al. (2026), "Sexual dimorphism in the complete Drosophila male central nervous system connectome" (sin URL disponible en la información proporcionada)
