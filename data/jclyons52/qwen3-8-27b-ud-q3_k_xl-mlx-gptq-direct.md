# jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-gptq-direct

## Resumen

Este modelo es un port nativo a MLX de la cuantización dinámica **UD-Q3_K_XL** desarrollada por unsloth para el modelo base **Qwen/Qwen3.8-27B**. La particularidad de esta conversión es que el proceso de cuantización se ejecuta íntegramente en el formato afín de MLX (grupo de tamaño 64) y escribe los pesos finales directamente en formato MLX, evitando el paso intermedio por GGUF y la re-cuantización posterior que suele hacer `mlx_lm.convert`. El autor, jclyons52, ha implementado un pipeline llamado `ud2mlx` que combina el mapa de bits dinámico de unsloth, la imatrix publicada por unsloth y un paso de GPTQ con Hessian reales capturados sobre 65 536 tokens de calibración.

El resultado es un modelo de 14 GB (15,1 GB en repo) con un promedio de ~4,4 bits en los módulos cuantizados, que según las mediciones del autor obtiene una perplexidad de 8,090 en wikitext-2, la mejor publicada entre las cuantizaciones Q3 nativas de MLX para esta familia de modelos. Está pensado para ejecutarse en hardware Apple Silicon mediante el runtime `mlx-lm` y sus derivados, ofreciendo una alternativa de baja huella de memoria para un modelo de 27B parámetros con ventana de contexto de 256K (heredada del base). Es importante señalar que, aunque el modelo base Qwen3.8-27B es multimodal, esta cuantización **solo incluye el módulo de texto**, por lo que no hay capacidades de visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), solo texto (sin torre visual) |
| Parametros totales | 27 000 millones (aprox., según modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (heredada del base; no verificada en esta cuantización) |
| Tipos de cuantizacion | Cuantización dinámica UD-Q3_K_XL: mapa de bits por tensor (2-8 bits), grupo de 64, promedio ~4,4 bits en módulos cuantizados; lm_head a 5 bits; embed_tokens y lm_head con RTN |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | MLX (safetensors nativos MLX, sin conversión GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con atención completa, entrenado por Alibaba con capacidades de razonamiento, código y visión. Esta cuantización no altera la arquitectura, sino que comprime los pesos mediante un procedimiento híbrido:

1. **Mapa de bits dinámico**: se toma el mapa de bits por tensor de unsloth (`Qwen3.8-27B-UD-Q3_K_XL.gguf`), que selecciona dinámicamente la precisión de cada capa según su importancia.
2. **Importancia por columnas**: se utiliza la imatrix publicada por unsloth (energías de activación por columna de su conjunto de calibración).
3. **GPTQ con Hessian reales**: se capturan Hessian de activación sobre 65 536 tokens de wikitext-2-train-raw (128 secuencias de 512 tokens) con rango completo para cada dimensión de entrada (hasta I=17408). El error se retropropaga secuencialmente a través de cada bloque.
4. **Parámetros afines fijados antes de la retropropagación**: la búsqueda de candidatos con ponderación por importancia se realiza con margen, de modo que los pesos emitidos son exactamente los que produjo el paso de retroalimentación, sin pérdida por re-binado.

Los tensores `embed_tokens` y `lm_head` no tienen Hessian de entrada de bloque, por lo que se cuantizan con RTN usando la misma búsqueda afín (importancia uniforme). El `lm_head` se mantiene a 5 bits. El resultado son 498 tensores cuantizados, con capas tempranas de MLP a 2 bits y normas/router hasta 8 bits.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.8-27B, conserva las capacidades de razonamiento y generación de texto del modelo original, aunque la cuantización de bajo bit puede degradar la calidad en tareas complejas.
- Soporte de código: el modelo base destaca en tareas de programación y agentes; esta versión cuantizada puede ejecutar código de forma razonable, pero no se han publicado evaluaciones específicas.
- Tool calling / function calling: el modelo base soporta estas funciones, pero no hay evidencia de que la cuantización las preserve íntegramente; se recomienda verificar.
- Capacidades multilingües: no se han publicado datos sobre el rendimiento multilingüe de esta cuantización.
- Capacidades especiales: **no incluye visión** (la torre visual del base no está presente). No hay modo de pensamiento explícito documentado, aunque el base puede tenerlo.
- Integración con ecosistema MLX: funciona con cualquier runtime que cargue modelos `mlx-lm` (oMLX, etc.), lo que facilita su uso en aplicaciones macOS/iOS.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX nativo y el tamaño de 14 GB permiten ejecutar el modelo en un Mac con 16 GB de memoria unificada o más, usando `mlx_lm.generate` o aplicaciones como oMLX para chat local sin conexión.
- Prototipado rápido de aplicaciones de texto: al ser un modelo de 27B con buena calidad de generación, puede usarse para pruebas de concepto de asistentes conversacionales, resúmenes o generación de contenido en entornos donde no se dispone de GPUs NVIDIA.
- Desarrollo de agentes de código en local: gracias a las capacidades de código del modelo base, se puede integrar en entornos de desarrollo (editores, CLI) para autocompletado o generación de funciones, siempre que se valide la calidad de la cuantización.
- Educación e investigación en cuantización: el pipeline `ud2mlx` y las métricas publicadas permiten estudiar el impacto de la cuantización dinámica en MLX, comparando perplexidad y comportamiento entre diferentes métodos (GPTQ-direct, imatrix, RTN).
- Despliegue en entornos con restricción de memoria: con 14 GB de pesos, cabe en sistemas con 16-32 GB de RAM/VRAM, lo que posibilita su uso en servidores modestos o estaciones de trabajo sin GPUs dedicadas.
- Generación de texto con contexto largo: la ventana de 256K del base, aunque no verificada en esta cuantización, podría aprovecharse para tareas de análisis de documentos extensos, siempre que la memoria lo permita (el uso de contexto largo incrementa el consumo de memoria).

## Benchmarks y rendimiento

El autor solo ha publicado mediciones de perplexidad en wikitext-2-raw (primeros 32k tokens, ventanas de 512 tokens, NLL codiciosa, misma matemática que `llama-perplexity`). No hay resultados de tareas downstream (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Build | Perplexidad (wikitext-2) ↓ |
|---|---:|
| unsloth UD-Q3_K_XL GGUF en llama.cpp | 6,896 |
| **Este modelo (GPTQ-direct)** | **8,090** |
| MLX imatrix-weighted (sin GPTQ) | 8,136 |
| MLX plain RTN (mismo mapa de bits) | 8,169 |

El autor indica que la brecha de ~+1,2 PPL respecto al GGUF se debe a la limitación del kernel de MLX, que solo soporta rejillas afines uniformes y no los codebooks no lineales IQ de unsloth (E8-lattice / super-block). No se han publicado benchmarks de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- Tamaño del repositorio: 15,1 GB (pesos ~14 GB).
- VRAM estimada: ~14-15 GB para los pesos, más memoria para KV cache y activaciones. Con contexto corto, cabe en un Mac con 16 GB de memoria unificada; para contexto largo se recomienda 32 GB o más.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3/M4 series) con al menos 16 GB de memoria unificada. No está diseñado para GPUs NVIDIA (MLX es específico de Apple).
- Opciones de despliegue: `mlx-lm` (CLI y biblioteca), oMLX (aplicación macOS), o cualquier runtime compatible con `mlx-lm`.
- Latencia y throughput: no se han publicado mediciones. En un Mac con M2 Max, un modelo de 27B cuantizado a ~4 bits suele generar entre 5 y 15 tokens/s, dependiendo de la longitud de contexto y la implementación.

## Comparativa con modelos similares

La comparativa se centra en cuantizaciones del mismo modelo base Qwen3.8-27B, ya que no hay modelos comparables de otros fabricantes con esta misma metodología.

| Modelo | Método | Perplexidad (wikitext-2) | Tamaño | Formato |
|---|---|---|---|---|
| unsloth/Qwen3.8-27B-UD-Q3_K_XL (GGUF) | Cuantización dinámica con codebooks IQ | 6,896 | ~14 GB | GGUF (llama.cpp) |
| **Este modelo** | GPTQ-direct nativo MLX | 8,090 | ~14 GB | MLX |
| MLX imatrix-weighted (sin GPTQ) | Importancia + afín | 8,136 | ~14 GB | MLX |
| MLX plain RTN (mismo bit map) | RTN con mapa dinámico | 8,169 | ~14 GB | MLX |

La ventaja de este modelo frente al GGUF es que no requiere conversión ni capa de compatibilidad en MLX; se ejecuta directamente con `mlx-lm`. La desventaja es una perplexidad ~1,2 puntos mayor debido a la limitación del kernel de MLX para bits ≤3.

## Limitaciones y advertencias

- **Brecha de calidad por codebook**: la rejilla afín uniforme de MLX no puede replicar los codebooks IQ no lineales de unsloth, lo que añade ~+1,2 PPL a 3 bits y ~+1,95 a 2 bits. Esto es una limitación del runtime, no de los pesos.
- **Embeddings y lm_head sin GPTQ**: se cuantizan con RTN (sin Hessian), lo que puede afectar a la calidad de la generación en los extremos de la red.
- **Solo texto**: la torre visual del modelo base no está incluida; no se pueden procesar imágenes.
- **Evaluación limitada**: solo se ha medido perplexidad en wikitext-2 (32k tokens). El rendimiento en tareas de código, matemáticas, razonamiento o multilingüe no está caracterizado; los quants dinámicos de bajo bit suelen degradar de forma no uniforme según el dominio.
- **No apto para fine-tuning**: los pesos cuantizados son códigos congelados; para entrenamiento adicional se debe usar la versión fp16 del base.
- **Sensibilidad al dominio**: la deriva de PPL en ventanas tardías sugiere sensibilidad al dominio típica de los quants de bajo bit; la calidad puede variar según el prompt.
- **Licencia**: Apache-2.0, permite uso comercial, pero se debe verificar la licencia del modelo base y sus términos (Qwen3.8-27B también es Apache-2.0 según la búsqueda).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jclyons52/Qwen3.8-27B-UD-Q3_K_XL-MLX-gptq-direct
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo del pipeline ud2mlx: https://github.com/jclyons52/ud2mlx
- Documentación de unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repo oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repo de AlibabaCloud sobre Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Runtime mlx-lm: https://github.com/ml-explore/mlx-lm
