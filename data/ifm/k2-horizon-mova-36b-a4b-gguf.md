# IFM/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, una organización vinculada al ecosistema de MBZUAI (el fork de `llama.cpp` necesario para ejecutarlo se aloja en `MBZUAI-IFM`). El modelo almacena 36 000 millones de parámetros en total, pero activa únicamente 4 000 millones por token, lo que permite un rendimiento de nivel frontera con un coste computacional reducido. Su principal innovación es la atención Mixture-of-Values (MoVA), una variante de atención que combina múltiples transformaciones de valores dentro de un mismo mecanismo de atención, mejorando la expresividad sin disparar el coste de cómputo.

El modelo destaca por su ventana de contexto nativa de 524 288 tokens (512K), algo inusual en modelos de su tamaño, y por sus resultados en tareas de razonamiento y agéntica, donde compite con modelos densos de aproximadamente 30 000 millones de parámetros y con MoE de hasta 15 veces su tamaño. Se distribuye bajo licencia Apache 2.0, y el autor ha anunciado la publicación de los checkpoints intermedios, los datos de entrenamiento y el código de entrenamiento, lo que lo convierte en una opción atractiva para investigación y despliegue en producción. El repositorio aquí descrito contiene exclusivamente los pesos en formato GGUF, preparados para su uso con `llama.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA) |
| Parametros totales | 36 000 millones (según model card); 37 444 792 020 (según safetensors) |
| Parametros activos | 4 000 millones por token |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | no disponible (el repositorio GGUF solo indica almacenamiento en BF16 original; no se enumeran cuantizaciones específicas) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tokenizer y chat template compatibles con llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 36 000 millones de parámetros totales y 4 000 millones activos por token. La novedad principal es la atención Mixture-of-Values (MoVA), que generaliza la atención estándar aplicando una mezcla de transformaciones lineales a los valores antes del producto de atención, lo que aumenta la capacidad de representación sin incrementar linealmente el coste computacional. Esta técnica se combina con el enrutamiento MoE típico, donde solo un subconjunto de expertos se activa en cada capa.

En cuanto al entrenamiento, el modelo se preentrenó y posteriormente se sometió a una fase de "midtrain" (entrenamiento intermedio) sobre los datasets propietarios `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. No se especifican el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor ha declarado que los checkpoints intermedios, los datos y el código de entrenamiento se publicarán, lo que permitirá estudiar la evolución de las capacidades a lo largo del entrenamiento. El contexto de 512K se incorporó de forma nativa a partir de las etapas de midtrain.

## Capacidades

- Generacion de texto y continuacion de conversacion con un contexto largo de hasta 512K tokens, adecuado para documentos extensos y dialogos multi-turno.
- Razonamiento complejo: segun la model card, supera a modelos densos de ~30B y a MoE de hasta 15x su tamaño en benchmarks de razonamiento y agentica.
- Capacidades agenticas: puede ejecutar tareas de multi-step reasoning y coordinacion de herramientas, aunque no se detalla el soporte explicito de tool calling en la documentacion.
- Competitivo frente a modelos cerrados de frontera en tareas de razonamiento y agentica, segun las afirmaciones del autor.
- Multilingue limitado: solo se declara soporte para ingles.
- Compatible con `llama.cpp` mediante un fork especifico que implementa la arquitectura K2 Horizon; el soporte oficial en `llama.cpp` esta en proceso de integracion.

## Casos de uso

- Agentes autonomos de razonamiento: su bajo numero de parametros activos (4B) y su alto rendimiento en tareas agenticas lo hacen adecuado para sistemas que requieren planificacion multi-paso y ejecucion de acciones con presupuesto de computo limitado.
- Analisis de documentos extensos: la ventana de 512K tokens permite procesar libros completos, informes financieros o codigo fuente de grandes repositorios en una sola pasada, sin necesidad de chunking ni RAG.
- Asistencia a desarrolladores: puede integrarse en entornos de desarrollo para generar codigo, explicar fragmentos complejos y mantener contexto de todo el proyecto en memoria.
- Investigacion en IA: la publicacion prevista de checkpoints intermedios, datos y codigo de entrenamiento facilita estudios sobre la evolucion de capacidades, interpretabilidad y analisis de la arquitectura MoVA.
- Sistemas de dialogo de largo recorrido: su contexto amplio y su capacidad de razonamiento permiten mantener conversaciones coherentes sobre temas complejos sin perder informacion previa.
- Clasificacion y extraccion de informacion a gran escala: al poder procesar secuencias muy largas, es util para tareas de resumen, extraccion de entidades y analisis de sentimiento sobre corpus extensos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla comparativa con modelos como Nemotron 3 Ultra (550B), Nemotron 3 Super (120B), G9v3-39A5B, Qwen3.6-35B-A3B, Muse Glimmer-30B y Gemma 4 31B-it, pero los valores concretos no estan accesibles en el extracto proporcionado. La unica afirmacion cualitativa es que el modelo supera a modelos densos de ~30B y a MoE de hasta 15x su tamaño en benchmarks de agentica y razonamiento, y que compite de forma cercana con modelos cerrados de frontera. Estos datos no pueden verificarse con la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 74,9 GB (pesos en BF16, formato GGUF).
- VRAM estimada: sin datos oficiales. Como referencia, un modelo de 36B en cuantizacion 4-bit (Q4_K_M) suele ocupar entre 20 y 22 GB; en 8-bit (Q8_0) alrededor de 38-40 GB. La carga completa en BF16 requeriria aproximadamente 75 GB.
- GPU recomendadas: para cuantizacion 4-bit, una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) es suficiente; para 8-bit se necesitarian 48 GB (A6000, A100 40GB) o mas. Para BF16 completo se requiere una GPU de 80 GB (A100, H100) o distribucion en varias GPUs.
- Compatibilidad con GPU de consumo: si, con cuantizaciones 4-bit o menores en GPUs de 24 GB, aunque la velocidad dependera del ancho de banda de memoria.
- Opciones de despliegue: `llama.cpp` (mediante el fork MBZUAI-IFM), y por extension cualquier herramienta compatible con GGUF (Ollama, LM Studio, etc.) una vez que el soporte de la arquitectura K2 Horizon se integre en el `llama.cpp` principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numericos para realizar una comparativa rigurosa. Los modelos que aparecen en la tabla de la model card son:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B (este) | 36B | 4B | 512K | Apache-2.0 |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | no disponible |
| Gemma 4 31B-it | 31B | denso | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| G9v3-39A5B | 39B | 5B | no disponible | no disponible |
| Nemotron 3 Super | 120B | no disponible | no disponible | no disponible |
| Nemotron 3 Ultra | 550B | no disponible | no disponible | no disponible |

La model card afirma que K2-Horizon-MoVA-36B-A4B supera a todos estos modelos en benchmarks de agentica y razonamiento, pero no se proporcionan cifras concretas. La comparativa cualitativa indica que el modelo logra resultados de nivel frontera con solo 4B de parametros activos, lo que lo situa en una posicion ventajosa en terminos de eficiencia.

## Limitaciones y advertencias

- Idiomas: solo se ha declarado soporte para ingles; el rendimiento en otros idiomas no esta garantizado y podria ser significativamente inferior.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos o factualidad; como cualquier modelo generativo, existe riesgo de alucinacion, especialmente en tareas abiertas.
- Soporte de herramientas: no se menciona explicitamente el soporte de function calling o tool calling; las capacidades agenticas descritas podrian requerir adaptaciones externas.
- Compatibilidad de software: el modelo requiere una version especifica de `llama.cpp` (fork de MBZUAI-IFM) que implemente la arquitectura K2 Horizon; el soporte oficial en el `llama.cpp` principal esta aun en proceso de integracion, lo que limita su portabilidad inmediata.
- Datos de entrenamiento: aunque se ha anunciado la publicacion de los datasets, estos no estan disponibles actualmente, lo que dificulta la reproduccion y la evaluacion independiente.
- Cuantizaciones: el repositorio GGUF no especifica las cuantizaciones disponibles, solo indica que los tensores se almacenan en BF16; el usuario debera generar sus propias cuantizaciones o esperar a que se publiquen.
- Fecha de creacion: el modelo se publico en septiembre de 2026, por lo que su ecosistema de soporte (librerias, documentacion, ejemplos) puede ser aun inmaduro.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF
- Repositorio HuggingFace (modelo original): https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Fork de llama.cpp con soporte K2 Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
