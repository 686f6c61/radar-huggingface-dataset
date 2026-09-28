# dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-mlx

## Resumen

Este repositorio contiene una cuantización a 4 bits del modelo instructivo Qwen2.5-1.5B-Instruct, publicada por el usuario dfed24 (Domenic Federico) para su uso con MLX, el framework de inferencia de Apple para silicio de la serie M. No es un modelo entrenado desde cero: es un artefacto de compresión que parte de los pesos oficiales de Qwen/Qwen2.5-1.5B-Instruct (1.543.714.304 parámetros) y los reempaqueta en formato afín de MLX con un tamaño final de 951 MB dentro de un repositorio de 1,0 GB.

La diferencia principal frente a la cuantización estándar que aplica `mlx_lm convert -q` es el algoritmo: en lugar de redondeo al vecino más próximo, se aplica GPTQ con realimentación de error (Frantar et al., 2022) y una búsqueda de rejilla por grupo que minimiza el error cuadrático. El resultado medido por el autor es una perplejidad en WikiText-2 de 9,658 frente a 10,669 de la cuantización por redondeo simple, más cerca del 9,379 del modelo original en fp16.

Es relevante ahora porque demuestra que es posible acercar una cuantización de 4 bits a la precisión de fp16 en un modelo pequeño que cabe en cualquier Mac con Apple Silicon, a costa de un 5 % más de tamaño y velocidad de decodificación por mantener el embedding en 8 bits. El autor publica los scripts de calibración y todas las mediciones en un repositorio de GitHub, lo que hace el resultado reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con pesos cuantizados a 4 bits |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | 4-bit GPTQ en formato afín de MLX, group size 64, embedding tied de 8 bits, resto en float16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato afín de MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, en su variante instructiva de 1,5 mil millones de parámetros. Sobre esa base no se ha realizado ningún entrenamiento adicional: el trabajo descrito en la model card es exclusivamente un proceso de cuantización post-entrenamiento. Para ello se usan 128 secuencias de calibración de 512 tokens extraídas del conjunto de entrenamiento de WikiText-2; para cada capa lineal se calcula la matriz H = XᵀX con un amortiguamiento del 1 %, se redondean las columnas en orden realimentando el error en las columnas restantes a través del factor de Cholesky de H⁻¹ (con tamaño de bloque 128) y se busca el rango de rejilla de cada grupo que minimiza el error cuadrático. Cada capa se calibra sobre las salidas de las capas ya cuantizadas anteriores. El resultado se empaqueta en el formato afín de MLX.

El autor justifica explícitamente el embedding tied en 8 bits: es la causa de que este modelo sea aproximadamente un 5 % más grande y un 5 % más lento al decodificar que la cuantización por redondeo al vecino más próximo de `mlx_lm`. Según la model card, con embedding a 4 bits la perplejidad sube alrededor de 0,5 puntos y el tamaño y la velocidad igualan a la variante de redondeo simple. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste fino adicional.

## Capacidades

- Generación de texto y conversación con formato instructivo, heredadas del modelo base Qwen2.5-1.5B-Instruct. El pipeline declarado en HuggingFace es text-generation.
- Ejecución local íntegra en Apple Silicon mediante `mlx_lm`, con el mismo flujo de trabajo que cualquier otro modelo MLX.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, agentes, multilingüismo) no se detallan en la model card de esta cuantización; hay que remitirse a la ficha de Qwen2.5-1.5B-Instruct para conocerlas.
- No se documenta ningún modo de razonamiento extendido (thinking mode), soporte de visión ni de audio en la información proporcionada.

## Casos de uso

- Asistente conversacional totalmente local en un Mac: con 951 MB de pesos, el modelo cabe en memoria unificada de cualquier equipo con Apple Silicon y no requiere conexión a red, por lo que es adecuado para aplicaciones donde la privacidad del texto es un requisito.
- Prototipado rápido de aplicaciones de texto generativo en macOS: la instalación se reduce a `pip install mlx-lm` y una llamada a `python -m mlx_lm generate`, lo que permite validar una idea de producto en minutos sin aprovisionar GPU en la nube.
- Evaluación comparativa de métodos de cuantización: el repositorio y los scripts asociados permiten reproducir la perplejidad en WikiText-2 y contrastar GPTQ frente a redondeo al vecino, AWQ o la implementación de `mlx_lm.gptq`.
- Procesamiento por lotes de resúmenes, reescritura o clasificación de textos en un portátil: el modelo ocupa menos de 1 GB en disco y permite procesar documentos en local sin coste por token, con la salvedad de que el rendimiento en tareas específicas no está medido.
- Herramientas de escritura integradas en aplicaciones de escritorio para macOS: autocompletado, reescritura de párrafos o generación de borradores, donde la latencia de decodificación es el factor crítico y el coste de un 5 % adicional respecto a la cuantización por redondeo es asumible.
- Entornos educativos y de investigación sin acceso a GPU dedicada: estudiantes que necesiten experimentar con modelos instructivos en un Mac pueden ejecutar esta variante sin infraestructura adicional.
- Componente de un pipeline de agentes en local: siempre que el paso previo confirme que el modelo base conserva la capacidad de tool calling tras la cuantización, ya que el autor no publica mediciones de ese tipo.
- Inferencia servida en red local: el paquete `mlx_lm` incluye utilidades de servidor que permiten exponer el modelo como API para otras aplicaciones del mismo equipo o de la red local, sin salir del ecosistema MLX.

## Benchmarks y rendimiento

El único dato de evaluación publicado en la model card es la perplejidad sobre WikiText-2 (split de test, 20 ventanas de 2048 tokens, medido en un MacBook Pro con M4 Pro y MLX 0.32). Menos es mejor.

| Modelo | Perplejidad WikiText-2 | Tamano |
|---|---|---|
| Original en fp16 | 9,379 | no disponible |
| 4-bit por redondeo al vecino (`mlx_lm convert -q`, group 64, embedding 4-bit) | 10,669 | ~1,0 GB |
| Este modelo (GPTQ 4-bit, embedding 8-bit) | 9,658 | 951 MB |
| `mlx_lm.gptq` (version 0.31.3, embedding 6-bit) | 10,754 | 903 MB |
| `mlx_lm.awq` (embedding 4-bit) | 10,498 | 853 MB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: por debajo de 1 GB solo para los pesos (951 MB); con caché KV y overhead del runtime, conviene reservar entre 1,5 GB y 2 GB para contextos moderados. Es una estimación a partir del tamaño del repositorio, no un dato publicado.
- Entorno nativo: MLX está diseñado para Apple Silicon (familias M1, M2, M3 y M4). El autor mide en un MacBook Pro con M4 Pro.
- Cabe holgadamente en cualquier Mac con Apple Silicon y en GPU de consumo con más de 2 GB de memoria si se convierte a otro formato, ya que el tamaño de pesos es inferior a 1 GB.
- Opciones de despliegue: `mlx_lm` a través de la CLI (`python -m mlx_lm generate`) y las utilidades de servidor del mismo paquete. Para CUDA, vLLM, llama.cpp, Ollama o TGI habría que convertir los pesos a otro formato, ya que el artefacto publicado es específico de MLX.
- Latencia y throughput: no publicados. El único dato cuantitativo es que la decodificación es aproximadamente un 5 % más lenta que la cuantización por redondeo al vecino más próximo, atribuido al embedding de 8 bits.

## Comparativa con modelos similares

La comparación relevante no es con otros modelos, sino con otras cuantizaciones del mismo Qwen2.5-1.5B-Instruct, todas medidas por el autor bajo las mismas condiciones.

| Variante | Perplejidad (WikiText-2) | Tamano | Notas |
|---|---|---|---|
| Qwen2.5-1.5B-Instruct en fp16 | 9,379 | no disponible | Referencia de maxima precision |
| Este modelo (GPTQ 4-bit, embedding 8-bit) | 9,658 | 951 MB | Mejor equilibrio precision/tamano del conjunto comparado |
| 4-bit por redondeo (`mlx_lm convert -q`) | 10,669 | ~1,0 GB | Mas rapido y con embedding de 4 bits |
| `mlx_lm.gptq` 0.31.3 | 10,754 | 903 MB | Embedding de 6 bits |
| `mlx_lm.awq` | 10,498 | 853 MB | El mas pequeno de los cuatro |

Frente a alternativas de otros formatos (GGUF, GPTQ para CUDA) no hay datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos, el riesgo de alucinación y las limitaciones de conocimiento del Qwen2.5-1.5B-Instruct original, que no se documentan en esta ficha.
- La perplejidad pasa de 9,379 en fp16 a 9,658, un deterioro de aproximadamente el 3 %. Es un dato agregado sobre WikiText-2; el impacto en tareas concretas (código, matemáticas, tool calling) no está medido y puede ser mayor.
- Al mantener el embedding en 8 bits, el modelo es alrededor de un 5 % más grande y un 5 % más lento al decodificar que la variante por redondeo al vecino. Si la prioridad es latencia o tamaño, el autor indica que con embedding de 4 bits el coste es de unos 0,5 puntos de perplejidad.
- Dependencia total del ecosistema MLX: no se puede cargar directamente con transformers, vLLM, llama.cpp u Ollama sin una conversión previa.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y el autor es un estudiante de grado; conviene reproducir las mediciones con los scripts enlazados antes de adoptarlo en producción.
- La información sobre idiomas soportados no está disponible en la model card de esta cuantización; hay que verificarla en la ficha del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se mantienen las condiciones de atribución y las obligaciones propias de esa licencia.
- No hay ninguna evaluación de robustez, seguridad o comportamiento en producción publicada para este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Código, scripts y mediciones: https://github.com/dfed25/mlx-gptq
- Referencia del método GPTQ citada en la model card: Frantar et al., 2022 (sin URL proporcionada en la información disponible)
- Contacto del autor indicado en la model card: domfederico21@gmail.com
