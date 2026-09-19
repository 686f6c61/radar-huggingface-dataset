# jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-l-50

## Resumen

Este repositorio contiene un checkpoint de `openai/gpt-oss-120b` podado estructuralmente por el autor `jayzou3773` mediante el método Less-is-MoE basado en la media del valor absoluto del gradiente (*mean-absolute-gradient*). La poda elimina exactamente el 50% de las neuronas de la FFN de los expertos enrutados: el modelo pasa de los ~117B parámetros del original a 59.484.992.832 parámetros (≈59,5B) almacenados en safetensors. Se conserva la topología MoE enrutada y se guardan anchuras compactas por experto en `config.json`, lo que corresponde a la variante IntDim-L descrita por el autor.

La selección de neuronas se calculó con 128 muestras de calibración procedentes de `yentinglin/s1K-1.1-trl-format` (revisión `58a01564d278477da20ead1bcf1cde8e31f36251`), usando los ajustes de carga del repositorio original: split `train`, campo `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncado de prefijo, sin padding y BF16, sin ningún paso de optimizador. El checkpoint MXFP4 de origen se dequantizó explícitamente a BF16 antes de puntuar y podar las neuronas.

El interés del checkpoint es metodológico: explora la reducción del coste de memoria e inferencia de un MoE de gran tamaño manteniendo la dispersión y la topología de enrutado, en lugar de recurrir a destilación o a cuantización de pesos. Su principal restricción práctica es que la inferencia exige el plugin vLLM específico *Less-is-MoE ragged* incluido en la imagen GPU unificada de Less-is-MoE, lo que descarta las rutas de despliegue habituales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (familia `gpt_oss`); topología MoE enrutada conservada tras la poda, con anchuras por experto compactas en `config.json` (variante IntDim-L) |
| Parametros totales | 59.484.992.832 (≈59,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base `openai/gpt-oss-120b` documenta 131.072 tokens) |
| Tipos de cuantizacion | solo pesos BF16 publicados; el checkpoint MXFP4 de origen se dequantizó a BF16 antes de la poda. No se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponibles (el campo de idiomas del repositorio no está informado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | openai/gpt-oss-120b |
| Poda aplicada | 50% de las neuronas de la FFN de los expertos enrutados |
| Tamaño del repositorio | 119,0 GB |
| Autor | jayzou3773 |
| Fecha de creación / actualización | 2026-09-18 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint no incorpora entrenamiento adicional: es una poda estructural *post-hoc* sobre `openai/gpt-oss-120b`. El método Less-is-MoE puntúa las neuronas de la FFN de cada experto enrutado con la media del valor absoluto del gradiente y retira el 50% con menor puntuación. La variante IntDim-L (frente a IntDim-E, que impone una anchura uniforme por experto) conserva la topología de enrutado original y almacena anchuras por experto compactas en `config.json`, de modo que la forma de los tensores deja de ser homogénea entre expertos. Esa irregularidad es la razón por la que se necesita un kernel de atención/FFN específico en lugar de los kernels MoE estándar.

La calibración se realizó con 128 muestras del dataset `yentinglin/s1K-1.1-trl-format`, con truncado de prefijo, sin padding, `seq_length=8192`, `shuffle_seed=1234` y precisión BF16. El autor publica los tensores de tokens específicos del modelo en el repositorio `jayzou3773/less-is-moe-s1-calibration-128-seq8192` (revisión `678b4e666183e16ec00376960df03b6381632ed1`) y deja constancia de los hashes de reproducibilidad: hash de selección de filas de origen `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784` y hash del fichero de tokens `1d487883f20fcbc52d7642695c87313d2ea2e9c53c193a3ed7ad6eac8f9d272a`. El repositorio incluye `experiment-export.json` con los metadatos completos de exportación y de equivalencia de máscara cero (*zero-mask equivalence*). No se documenta en la información disponible ningún uso de RLHF, DPO u otro ajuste por preferencias sobre este checkpoint.

## Capacidades

- Generación de texto y modo conversacional: el repositorio declara `pipeline_tag: text-generation` y la etiqueta `conversational`, heredadas de `openai/gpt-oss-120b`.
- Razonamiento, código y matemáticas: capacidades esperables por herencia del modelo base, pero no verificadas ni evaluadas en este checkpoint concreto.
- Tool calling / function calling: no documentado en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas en la información disponible para este checkpoint.
- Poda selectiva de expertos: la capacidad diferencial del artefacto es que mantiene la topología MoE con anchuras por experto reducidas al 50%, lo que lo convierte en material de estudio para investigar el equilibrio entre tamaño y calidad en modelos dispersos.

Todas las capacidades funcionales deben considerarse no validadas en este checkpoint: no se han publicado evaluaciones de calidad tras la poda.

## Casos de uso

- Investigación sobre poda de MoE: reproducir el experimento Less-is-MoE con los hashes y el dataset de calibración publicados para estudiar qué neuronas de la FFN de cada experto son prescindibles y cómo afecta la poda al enrutado.
- Comparación de variantes de poda: contrastar esta variante IntDim-L (anchuras por experto no uniformes) con IntDim-E (anchura uniforme) para medir el compromiso entre compresión, irregularidad de kernels y calidad final.
- Servicio de chat o generación de texto de gran volumen: si se dispone de la imagen GPU unificada de Less-is-MoE, el modelo puede servir como endpoint de generación con un 50% menos de neuronas de experto que el base, reduciendo requisitos de memoria frente a BF16 completo.
- Fine-tuning de dominio sobre una base más ligera: al ocupar ≈119 GB en BF16 (≈59,5B parámetros), permite ajustar con menos memoria que el modelo base para adaptar el modelo a un dominio concreto, siempre que se respete la topología irregular en el *checkpointing*.
- Estudio de infraestructura de inferencia: medir el coste real de los kernels *ragged* frente a kernels MoE densos y homogéneos en GPUs como H100 o A100.
- Evaluación de robustez y alucinación tras poda agresiva: usar el checkpoint como sujeto de pruebas para cuantificar la degradación de factualidad al eliminar la mitad de las neuronas de experto.
- Reproducción de resultados académicos: verificar la equivalencia de máscara cero declarada en `experiment-export.json` antes de reutilizar el checkpoint en pipelines propios.
- *Benchmarking* de memoria y latencia: comparar el consumo de VRAM y el *throughput* de esta variante contra `openai/gpt-oss-120b` en el mismo hardware y con la misma longitud de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el checkpoint podado ni como comparación con `openai/gpt-oss-120b`.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros publicado (59,5B) y del formato BF16 de los pesos. Se trata de cálculos, no de mediciones publicadas por el autor.

- Pesos en BF16: ≈119 GB (59,5B × 2 bytes). Con caché KV y *overhead* de activaciones, se necesitan del orden de 130-150 GB de VRAM.
- GPU de centro de datos recomendadas en BF16: 2× H100 80 GB, 2× A100 80 GB, H200 141 GB (ajustado, según longitud de contexto), B200.
- Precisión de 8 bits: ≈60-65 GB → cabe en una H100 80 GB o una A100 80 GB. No se publica ninguna cuantización de 8 bits; sería necesario generarla.
- Precisión de 4 bits: ≈30-35 GB → A6000 48 GB, 2× RTX 4090 24 GB, RTX 5090 32 GB (muy ajustado). De nuevo, no se publica ningún artefacto cuantizado.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual (la de mayor VRAM es de 32 GB). Solo sería viable en 4 bits y con muy poco margen.
- Opciones de despliegue: la inferencia requiere el plugin vLLM *Less-is-MoE ragged* de la imagen GPU unificada de Less-is-MoE. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni con vLLM estándar, dado que las anchuras por experto no uniformes rompen los kernels MoE habituales.
- Latencia y *throughput*: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| Este checkpoint (IntDim-L, poda 50%) | 59,5B | no disponible | no disponible en la información proporcionada | Apache-2.0 | safetensors BF16; exige plugin vLLM Less-is-MoE ragged |
| openai/gpt-oss-120b (base) | ≈117B según documentación pública de OpenAI, no verificado en la información proporcionada | ≈5,1B según la misma fuente | 131.072 tokens según la misma fuente | Apache-2.0 | safetensors MXFP4 nativo; vLLM, transformers, Ollama |
| openai/gpt-oss-20b | ≈21B según documentación pública de OpenAI, no verificado en la información proporcionada | ≈3,6B según la misma fuente | 131.072 tokens según la misma fuente | Apache-2.0 | safetensors; vLLM, transformers, llama.cpp/Ollama |

No se dispone de resultados de evaluación comparativos entre estas opciones en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y disponibilidad de despliegue. Otros checkpoints de la misma familia de poda (variantes IntDim-E y IntDim-G) se mencionan en la *model card*, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni validación de calidad publicados, por lo que no puede afirmarse que el modelo conserve las capacidades del base tras eliminar el 50% de las neuronas de experto.
- Riesgo de degradación y alucinación: una poda tan agresiva sobre las FFN de los expertos puede reducir la cobertura de conocimiento y aumentar la tasa de respuestas incorrectas o inventadas; se requiere evaluación propia antes de cualquier uso en producción.
- Dependencia de un plugin exótico: la inferencia exige el plugin vLLM *Less-is-MoE ragged* y la imagen GPU unificada de Less-is-MoE. Esto limita la portabilidad, complica el mantenimiento y hace inviable el uso con llama.cpp, Ollama o TGI en su estado actual.
- Idiomas no declarados: el repositorio no informa de los idiomas soportados; no se puede asumir un comportamiento multilingüe correcto.
- Contexto no confirmado para este checkpoint: la longitud de contexto efectiva tras la poda no está documentada en la información disponible.
- Validación comunitaria nula: 0 descargas y 0 likes, con creación y última actualización el mismo día (2026-09-18). Es un artefacto de investigación sin uso verificado por terceros.
- Consumo de disco y memoria elevados: 119 GB de repositorio, lo que encarece el almacenamiento, la transferencia y el *checkpointing* durante un ajuste fino.
- Licencia: Apache-2.0, lo que en principio permite uso comercial; conviene revisar igualmente las condiciones asociadas al modelo base `openai/gpt-oss-120b` y las políticas de uso publicadas por su distribuidor antes de explotarlo comercialmente.
- La equivalencia funcional declarada en `experiment-export.json` (metadatos de *zero-mask equivalence*) debe verificarse de forma independiente antes de reutilizar el checkpoint en un pipeline propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-l-50
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de calibración (tensores de tokens del autor): https://huggingface.co/datasets/jayzou3773/less-is-moe-s1-calibration-128-seq8192
- Dataset de origen de la calibración: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format
- Metadatos de exportación del experimento: https://huggingface.co/jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-l-50/blob/main/experiment-export.json
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos por la búsqueda corresponden a mapas y guías de la zona de Alejandría (Egipto) y no guardan ninguna relación con el modelo ni con el método Less-is-MoE. No se dispone por tanto de paper, blog, repositorio de código ni demo adicionales en la información proporcionada.
