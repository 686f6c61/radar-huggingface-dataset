# AdamLangePL/Bielik-11B-v3.1-Instruct-oQ2e

## Resumen

Bielik-11B-v3.1-Instruct-oQ2e es una versión cuantizada del modelo Bielik-11B-v3.1-Instruct, un modelo de lenguaje de 11.168.796.672 parámetros desarrollado originalmente por el equipo de Bielik (SpeakLeash) para el idioma polaco. Esta variante concreta ha sido publicada por el usuario AdamLangePL y aplica una cuantización de precisión mixta mediante la herramienta oQ (oMLX v0.7.3), que combina capas en 2, 3, 5 y 8 bits para lograr una media efectiva de 3.000 bits por peso.

El resultado es un checkpoint de apenas 4.2 GB de tamaño de repositorio (3.901 GiB de pesos en almacenamiento) que mantiene los 11.169B parámetros lógicos del modelo original, lo que permite ejecutar un modelo de escala 11B en hardware con recursos limitados, especialmente en entornos Apple Silicon gracias al formato MLX.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta agresiva que reduce drásticamente los requisitos de memoria; por otro, advierte de que se trata de un artefacto derivado con información muy escasa publicada (sin licencia, idiomas ni benchmarks declarados en el repositorio). La model card original del modelo base no está incluida en la información disponible, por lo que muchos datos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun tag `llama`); detalles no disponibles |
| Parametros totales | 11.168.796.672 (11.169B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ (oMLX v0.7.3): affine 2-bit grupo 64, affine 3-bit grupo 128, affine 5-bit grupo 64, affine 8-bit grupo 64, BF16; media efectiva 3.000 bits/peso |
| Idiomas soportados | no disponible (el modelo base Bielik esta orientado al polaco, pero no se confirma en la informacion proporcionada) |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato MLX (`mlx`, `oq`, `quantized`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Bielik-11B-v3.1-Instruct. El tag `llama` sugiere una arquitectura de tipo transformer decoder-only de la familia Llama, con 11.169B parametros totales, pero no se especifican numero de capas, dimensiones ocultas, cabezas de atencion ni tipo de atencion (completa, GQA, etc.). Tampoco se documentan los datos de entrenamiento del modelo base: numero de tokens, composicion del corpus, si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que si esta documentado es el proceso de cuantizacion aplicado sobre el checkpoint original. Se utilizo oQ (oMLX v0.7.3) con precision mixta, distribuyendo los pesos logicos en cuatro formatos de almacenamiento: un 45,140% de los pesos (5.042B) en affine 2-bit con grupo de 64; un 52,500% (5.864B) en affine 3-bit con grupo de 128; un 1,178% (0.132B) en affine 5-bit con grupo de 64; otro 1,178% (0.132B) en affine 8-bit con grupo de 64; y una fraccion residual del 0,004% en BF16. El total de pesos logicos es 11.169B, almacenados en 3.901 GiB, lo que arroja la media de 3.000 bits/peso. Esta estrategia de asignar mas bits a determinadas capas o tensores (probablemente las mas sensibles) y menos al resto es la innovacion tecnica central del artefacto.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Bielik-11B-v3.1-Instruct, aunque no se detallan capacidades especificas en la informacion disponible.
- Soporte de instrucciones (sufijo Instruct), orientado a tareas de seguimiento de instrucciones.
- Capacidades multilingues: no disponibles de forma explicita; el modelo base Bielik esta disenado para polaco, pero no se confirma el alcance.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en Apple Silicon mediante MLX, lo que constituye una capacidad practica diferencial del checkpoint.

## Casos de uso

- Prototipado local en Mac con memoria unificada limitada: al ocupar solo 3.901 GiB en almacenamiento y estar en formato MLX, permite cargar un modelo de 11B en equipos Apple Silicon de gama media (por ejemplo, 16 GB de RAM unificada) para pruebas de generacion de texto sin necesidad de GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: util como referencia para investigadores que quieran medir la degradacion de calidad de una cuantizacion mixta a 3 bits/peso frente al checkpoint original en BF16.
- Generacion de texto en polaco (si se confirma que el modelo base conserva su capacidad linguistica): redaccion asistida, resumen y reformulacion en ese idioma, con la ventaja de un consumo de memoria muy reducido.
- Despliegue en entornos con restricciones de VRAM: para servidores con GPUs de 8 GB o menos donde un modelo de 11B en BF16 no cabria, este checkpoint reduce el requisito de memoria en mas de un orden de magnitud.
- Experimentacion con pipelines MLX: integracion en flujos de trabajo de Apple MLX para inferencia local, comparacion de latencia y validacion de compatibilidad con la libreria oMLX.
- Fine-tuning ligero o adaptacion (LoRA) sobre el checkpoint cuantizado: para ajustar el modelo a dominios concretos con requisitos de memoria reducidos, siempre que la herramienta de entrenamiento soporte pesos MLX cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits y el tamano de almacenamiento de la cuantizacion, sin incluir metricas de calidad (MMLU, HumanEval, GSM8K, perplejidad ni comparaciones con el checkpoint original).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3.901 GiB de pesos en almacenamiento, mas overhead de activaciones y cache KV; un equipo con 8 GB de memoria unificada o VRAM deberia poder cargarlo, aunque el contexto efectivo dependera de la longitud de secuencia.
- GPU recomendadas: el formato es MLX, por lo que el entorno natural son los chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se garantiza compatibilidad directa con CUDA sin conversion previa.
- Cabe en GPU consumer: si, en terminos de memoria, en GPUs de 8 GB o mas, aunque la ejecucion nativa requiere el stack MLX de Apple; para NVIDIA habria que reconvertir el checkpoint a otro formato (no documentado).
- Opciones de despliegue: MLX y oMLX (herramienta de cuantizacion); vLLM, llama.cpp, Ollama y TGI no estan documentados como compatibles con este checkpoint concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct-oQ2e (este) | 11.169B (3.000 bits/peso efectivos) | no disponible | MLX safetensors cuantizado | no disponible | Hugging Face (AdamLangePL) |
| Bielik-11B-v3.1-Instruct (base) | 11.169B | no disponible | safetensors BF16 | no disponible | no confirmada en la informacion |
| Artefactos GGUF comparables de escala 11B | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y licencia segun la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a una media de 3.000 bits/peso, con un 45% de los pesos en 2 bits, implicara con alta probabilidad una degradacion de calidad frente al modelo original en BF16; no se han publicado metricas que cuantifiquen esta perdida.
- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Bielik antes de cualquier despliegue en produccion.
- No se declaran los idiomas soportados; aunque el modelo base esta orientado al polaco, no se confirma que la cuantizacion preserve el rendimiento multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, agravado potencialmente por la cuantizacion agresiva.
- El checkpoint esta en formato MLX, lo que limita su uso fuera del ecosistema Apple sin una conversion previa no documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria conocida.
- No se documentan sesgos especificos del modelo base ni del proceso de cuantizacion.
- La fecha de creacion indicada (2026-11-12) resulta anomala y conviene verificarla antes de citar el artefacto.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/AdamLangePL/Bielik-11B-v3.1-Instruct-oQ2e
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Bielik-11B-v3.1-Instruct: no disponible en la informacion proporcionada
- Paper, blog o demo del modelo base: no disponible
