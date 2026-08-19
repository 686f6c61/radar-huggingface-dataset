# eyes-ml/Qwen3.8-27B_jacobian-lens

## Resumen

El modelo `eyes-ml/Qwen3.8-27B_jacobian-lens` es un artefacto de interpretabilidad, no un modelo de lenguaje generativo. Se trata de una **lente jacobiana** (Jacobian lens, o J-lens) ajustada sobre el modelo base `Qwen/Qwen3.8-27B`, un modelo denso de 27 000 millones de parámetros con arquitectura híbrida (48 bloques Gated DeltaNet y 16 bloques de atención con puerta, intercalados 3:1), capacidad de visión-lenguaje y una ventana de contexto nativa de 262 000 tokens. El lens, desarrollado por el equipo de eyes-ml, sigue el método del espacio de trabajo global (global workspace) introducido en el artículo *Verbalizable Representations Form a Global Workspace in Language Models* (Transformer Circuits, 2026).

El propósito de este artefacto es permitir a investigadores e ingenieros de interpretabilidad inspeccionar, en cada capa fuente del modelo (capas 0 a 62), qué token del vocabulario está "a punto de verbalizar" la activación en esa capa, proyectada al espacio de la capa final. El resultado es un conjunto de 63 matrices jacobianas de 5120 × 5120 en precisión float16, empaquetadas en un único archivo torch-loadable de 3,3 GB. La relevancia actual radica en que Qwen3.8-27B es uno de los primeros modelos de producción con arquitectura híbrida DeltaNet/atención, y este lens proporciona una herramienta estándar para estudiar cómo se forman las representaciones verbales en dicha arquitectura.

El ajuste se realizó sobre 1000 prompts del corpus WikiText-103 (solo texto), con una longitud máxima de secuencia de 128 tokens y la capa final (L63) como ancla. El lens no alcanzó el criterio de convergencia estricto (Δmean suavizado ≈ 1,9 × 10⁻³ frente al objetivo de 1 × 10⁻³), pero la distancia de identidad final se estabilizó en 0,3753. El artefacto se distribuye bajo licencia Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jacobian lens sobre Qwen3.8-27B (modelo base: VLM denso, 64 capas, 48 Gated DeltaNet + 16 gated-attention, intercalado 3:1) |
| Parametros totales | 63 matrices jacobianas de 5120 × 5120 en float16 (≈ 3,3 GB en disco) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (el lens se guarda en float16; no se ofrecen versiones cuantizadas) |
| Idiomas soportados | No disponibles (el corpus de ajuste es inglés de WikiText-103; el modelo base soporta múltiples idiomas, pero el lens no declara cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivo torch-loadable (`.pt`) con un diccionario que contiene las claves `J`, `n_prompts`, `source_layers`, `d_model` |

## Arquitectura y entrenamiento

El Jacobian lens se construye estimando, para cada capa fuente ℓ (0 a 62), la matriz jacobiana **J_ℓ** que mapea las activaciones de esa capa al espacio de la capa final (L63). La lectura se realiza mediante la distribución `softmax(W_U · norm(J_ℓ · h_ℓ))`, donde `W_U` es la matriz de embedding de salida no compartida (untied, con `tie_word_embeddings: false`) sobre un vocabulario de 248 320 tokens. El método sigue el enfoque de espacio de trabajo global descrito en el artículo de Transformer Circuits de 2026, con la implementación de referencia de `anthropics/jacobian-lens`.

El ajuste se realizó con el script `fit_lens.py` de la adaptación de Neuronpedia, sobre un espejo congelado de `Qwen/Qwen3.8-27B` (commit `32a8451`). Se usaron 1000 prompts del conjunto de entrenamiento de WikiText-103, re-chunked a fragmentos de ~2000 caracteres, con `max_seq_len` de 128 (lo que produce 111 posiciones válidas por prompt). La capa objetivo fue la final (L63) y las capas fuente las 0–62. El proceso empleó precisión bfloat16 y un tamaño de lote de dimensiones 8. El criterio de parada `--stop_at_delta 1e-3` no se alcanzó: la ejecución terminó al llegar al límite de 1000 prompts, con un Δmean suavizado de ≈ 1,9 × 10⁻³. El coste computacional fue de ≈ 87,2 segundos por prompt en una GPU H100, con un tiempo total de bucle de ajuste de 24,22 horas y un pico de VRAM de 63,04 GiB.

Una innovación técnica relevante es la adaptación del cargador para modelos de visión-lenguaje: se sustituyó `AutoModelForCausalLM` por `AutoModelForImageTextToText`, lo que permite cargar el wrapper completo de Transformers y que `jlens.from_hf` detecte automáticamente el decodificador de texto. El lens se guarda en el formato estándar de `jlens`, un diccionario legible con `torch.load(..., weights_only=True)`.

## Capacidades

- **Lectura de representaciones verbales**: para cada capa fuente y posición de token, el lens devuelve la distribución de tokens que la activación está "predispuesta a verbalizar", según la proyección jacobiana al espacio de la capa final.
- **Análisis de la formación de representaciones**: permite trazar cómo evoluciona la representación de un token a lo largo de las 64 capas del modelo, identificando en qué capa se "decide" el token final.
- **Comparación de arquitecturas**: al ser un lens estándar (mismo formato que los de Glimmer o Qwen3.6), facilita comparaciones entre modelos con arquitecturas diferentes (DeltaNet vs. atención densa).
- **Soporte para modelos de visión-lenguaje**: el lens se ajusta sobre el decodificador de texto, por lo que puede aplicarse a las activaciones de texto del modelo Qwen3.8-27B, aunque las posiciones de tokens de visión no están cubiertas.
- **Integración con el ecosistema jlens**: compatible con la implementación de referencia de Anthropic y con la colección de lenses de eyes-ml, lo que permite reutilizar utilidades de visualización y análisis existentes.
- **No es un modelo generativo**: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Su única función es la inspección de representaciones internas.

## Casos de uso

- **Investigación en interpretabilidad de modelos híbridos**: el lens permite estudiar cómo los bloques Gated DeltaNet (que tienen memoria recurrente) contribuyen a la formación de representaciones verbales, comparando con modelos de atención pura.
- **Auditoría de sesgos y alucinaciones**: al observar qué token predice cada capa en posiciones críticas, se puede identificar en qué capa se introduce un sesgo o una alucinación, facilitando la depuración de comportamientos no deseados.
- **Análisis de circuitos (circuit analysis)**: combinado con técnicas de activación por parcheo, el lens ayuda a localizar subredes responsables de tareas específicas (razonamiento, código, etc.) dentro del modelo de 27B.
- **Validación de hipótesis sobre el espacio de trabajo global**: el artefacto sirve como herramienta para reproducir y extender los experimentos del artículo de Transformer Circuits, por ejemplo, verificando si las representaciones verbales emergen en capas intermedias.
- **Comparación de checkpoints post-entrenamiento**: dado que no existe un checkpoint base público de Qwen3.8, el lens permite estudiar el efecto del post-entrenamiento sobre la formación de representaciones, comparando con lenses de otros modelos.
- **Desarrollo de herramientas de visualización**: el formato estandarizado del lens (diccionario con `J`, `source_layers`, `d_model`) facilita la creación de dashboards interactivos para explorar la dinámica de capas en modelos de 27B, similar a los existentes en Neuronpedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas de lenguaje (MMLU, HumanEval, GSM8K, etc.) para este artefacto, ya que no es un modelo generativo. Los únicos datos de rendimiento disponibles son las métricas de convergencia del ajuste del lens, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Δmean suavizado al final del ajuste | ≈ 1,9 × 10⁻³ (objetivo: 1 × 10⁻³, no alcanzado) |
| Primer prompt con Δmean < 1 × 10⁻² | 120 |
| Primer prompt con Δmean < 5 × 10⁻³ | 222 |
| Primer prompt con Δmean < 1 × 10⁻³ | 988 |
| `identity_distance` en capa 62 (‖J−I‖_F/√d) | ≈ 0,3753 (antes de serialización fp16) |
| Coste de ajuste | ≈ 87,2 s/prompt en 1× H100; 24,22 h en total |
| Pico de VRAM durante el ajuste | 63,04 GiB |

## Requisitos de hardware

- **Almacenamiento**: 3,3 GB para el archivo `.pt` del lens.
- **Memoria para cargar el lens**: el diccionario contiene 63 matrices de 5120 × 5120 en float16, lo que requiere ≈ 3,3 GB en RAM/VRAM si se carga completo.
- **Inferencia con el lens**: para aplicar el lens a activaciones reales, es necesario cargar también el modelo base Qwen3.8-27B (27B parámetros). Con cuantización de 4 bits, se necesitan ≈ 16–18 GB de VRAM; en bfloat16, ≈ 54 GB.
- **GPU recomendadas**: para el ajuste se usó una NVIDIA H100 con 80 GB. Para inferencia con el lens, una GPU con al menos 24 GB (RTX 4090, A5000) puede funcionar con el modelo base cuantizado a 4 bits y el lens en CPU o VRAM compartida. Para trabajar cómodamente en bfloat16, se recomienda A100 80 GB o H100.
- **Opciones de despliegue**: el lens se carga directamente con `torch.load` en un script de Python. No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de generación.
- **Latencia y throughput**: no disponibles; dependen del modelo base y del hardware utilizado para la extracción de activaciones.

## Comparativa con modelos similares

El artefacto pertenece a la colección de Jacobian lenses de eyes-ml, que incluye también un lens para `Muse-Glimmer-30B`. Se puede comparar con el lens de Qwen3.6-27B publicado en Neuronpedia, aunque los detalles de ajuste pueden diferir.

| Modelo | Modelo base | Arquitectura del base | Capas fuente | d_model | Formato | Licencia |
|---|---|---|---|---|---|---|
| eyes-ml/Qwen3.8-27B_jacobian-lens | Qwen3.8-27B | Híbrida (48 Gated DeltaNet + 16 atención) | 0–62 (63 capas) | 5120 | torch dict `.pt` | Apache 2.0 |
| neuronpedia/jacobian-lens (qwen3-8b) | Qwen3-8B (presumiblemente) | Densa (atención) | No disponible | No disponible | No disponible | MIT |
| eyes-ml/Muse-Glimmer-30B_jacobian-lens | Muse-Glimmer-30B | Híbrida (similar a Qwen3.8) | No disponible | No disponible | torch dict `.pt` | Apache 2.0 (presumible) |

No se dispone de una comparativa directa de rendimiento entre estos lenses, ya que las métricas de convergencia dependen del corpus y de los hiperparámetros de ajuste.

## Limitaciones y advertencias

- **Solo texto**: el lens se ajustó exclusivamente con corpus de texto (WikiText-103). Las lecturas en posiciones de tokens de visión (imágenes o vídeo) no están validadas y probablemente produzcan resultados poco fiables.
- **Convergencia incompleta**: el criterio de parada estricto (`Δmean < 1 × 10⁻³`) no se alcanzó; el valor final fue ≈ 1,9 × 10⁻³. Esto indica que las matrices jacobianas pueden no estar totalmente estabilizadas, lo que introduce incertidumbre en las lecturas.
- **Anclaje en la capa final**: el lens está anclado en la capa L63. Otros lenses pueden usar la penúltima capa como ancla, lo que dificulta la comparación directa entre artefactos.
- **Checkpoint post-entrenamiento**: no existe un checkpoint base público de Qwen3.8, por lo que no es posible estudiar el efecto del post-entrenamiento comparando con un modelo sin ajuste.
- **Sesgo del corpus**: el ajuste se realizó sobre inglés de Wikipedia, por lo que las lecturas pueden estar sesgadas hacia ese dominio y no representar bien otros idiomas o estilos.
- **Riesgo de malinterpretación**: el Δmean mide la estabilidad del jacobiano medio, no la fidelidad semántica ni la calibración de probabilidades. Las lecturas del lens deben interpretarse como indicadores, no como predicciones exactas del comportamiento del modelo.
- **Restricciones de uso**: la licencia Apache 2.0 permite uso comercial, pero el artefacto es un archivo de datos de investigación; no se garantiza su idoneidad para entornos de producción.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/eyes-ml/Qwen3.8-27B_jacobian-lens)
- [Colección de Jacobian lenses de eyes-ml](https://huggingface.co/collections/eyes-ml/jacobian-lenses)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Artículo *Verbalizable Representations Form a Global Workspace in Language Models* (Transformer Circuits, 2026)](https://transformer-circuits.pub/2026/workspace/index.html)
- [Implementación de referencia de Anthropic: `anthropics/jacobian-lens`](https://github.com/anthropics/jacobian-lens)
- [Adaptación de Neuronpedia: `neuronpedia_utils/jlens/fit_lens.py`](https://github.com/hijohnnylin/neuronpedia/blob/7724688596eb734a0662f911bf183151a5c66b2f/utils/neuronpedia-utils/neuronpedia_utils/jlens/fit_lens.py)
- [Lens de Qwen3.6-27B en Neuronpedia](https://www.neuronpedia.org/qwen3.6-27b/jlens)
- [Guía de Qwen3.8-27B en OpenLM.ai](https://openlm.ai/qwen3.8/)
