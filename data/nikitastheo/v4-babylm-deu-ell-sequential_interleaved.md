# nikitastheo/v4-babylm-deu-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v4-babylm-deu-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 con 108,5 millones de parámetros, desarrollado por nikitastheo como parte de la iniciativa BabyLM, que investiga el aprendizaje del lenguaje con cantidades de datos comparables a las que recibe un niño. El nombre sugiere un entrenamiento secuencial intercalado entre alemán (deu) e inglés como segunda lengua (ell), aunque la model card no especifica explícitamente los idiomas ni la composición del corpus.

El modelo se entrenó con un script personalizado de Hugging Face Accelerate (sin usar el `Trainer`), con un tokenizador propio (`nikitastheo/babylm-vocab15-deu-tokenizer`) y una configuración base de GPT-2. Está orientado a la generación de texto y es compatible con la librería `transformers` y con `text-generation-inference`. Su relevancia radica en ser un experimento de investigación sobre cómo el intercalado de idiomas durante el entrenamiento afecta al aprendizaje de representaciones lingüísticas en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal) |
| Parametros totales | 108.550.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente aleman e ingles, segun el nombre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal. La configuración base se define en `model_configs/gpt_base_config.json`, aunque no se detallan el número de capas, dimensiones ocultas ni cabezas de atención. El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar el `Trainer`, con un máximo de 26.190 pasos, una tasa de aprendizaje de 0,0001 con scheduler lineal y un warmup de 2.619 pasos. El batch size total fue de 32 (sin acumulación de gradientes). Se menciona un "language switch epoch" de 10, lo que sugiere que el entrenamiento alterna entre idiomas cada cierto número de épocas, pero no se especifica la proporción exacta de datos ni el corpus utilizado (presumiblemente el de BabyLM). No se indica el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto causal en modo autorregresivo.
- Modelo de lenguaje entrenado para modelado de lenguaje enmascarado o causal (según la arquitectura GPT-2, es causal).
- Compatible con pipelines de `transformers` para generación de texto.
- Posible capacidad multilingüe (alemán e inglés) por el nombre del modelo, aunque no está documentada.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica sobre adquisición del lenguaje: el modelo sirve para estudiar cómo el intercalado de idiomas afecta al aprendizaje de representaciones sintácticas y semánticas en modelos pequeños, comparando con modelos monolingües del proyecto BabyLM.
- Experimentos de transferencia entre idiomas: al estar entrenado con alemán e inglés de forma intercalada, puede usarse para analizar la transferencia de conocimiento entre lenguas tipológicamente cercanas.
- Generación de texto en alemán para prototipos: con 108M parámetros, puede generar texto coherente en alemán para demos o pruebas de concepto, aunque su calidad será limitada frente a modelos más grandes.
- Benchmarking de eficiencia de entrenamiento: al ser un modelo pequeño, es útil para validar scripts de entrenamiento con Accelerate y comparar estrategias de scheduling de datos.
- Educación y divulgación: sirve como ejemplo didáctico de cómo entrenar un modelo causal desde cero con recursos limitados.
- Pruebas de inferencia en hardware modesto: su tamaño permite ejecutarlo en CPU o GPU de gama baja, siendo útil para probar infraestructuras de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 108M parámetros, en fp32 ocuparía unos 434 MB; en fp16 unos 217 MB. Con cuantización a 8 bits, menos de 150 MB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1650, RTX 2060, etc.). También puede ejecutarse en CPU con razonable velocidad.
- Es adecuado para consumer GPU de gama baja y media.
- Opciones de despliegue: compatible con `transformers` pipeline, `text-generation-inference`, `vLLM` (si se adapta), `llama.cpp` (si se convierte a GGUF), `Ollama` (si se empaqueta).
- Latencia y throughput: no disponibles, pero por su tamaño se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna).

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de la misma serie (v3, dummy, babylm-lem) en cuanto a parámetros, contexto o rendimiento. El modelo es comparable en tamaño a otros GPT-2 pequeños (117M) pero no hay datos de benchmarks que permitan una comparación cuantitativa. Se recomienda consultar el repositorio del autor para más variantes.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo entrenado con datos limitados (BabyLM), es probable que presente sesgos derivados del corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto falso o incoherente, especialmente en contextos largos.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los modelos GPT-2 suelen tener 1024 tokens; se recomienda no exceder ese límite.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor antes de usarlo en producción.
- El modelo es un experimento de investigación; no está optimizado para tareas específicas ni para producción.
- No se han documentado los idiomas exactos soportados; el nombre sugiere alemán e inglés, pero no hay confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v4-babylm-deu-ell-sequential_interleaved
- Variante dummy: https://huggingface.co/nikitastheo/dummy-babylm-deu-ell-sequential_interleaved
- Variante v3: https://huggingface.co/nikitastheo/v3-babylm-deu-ell-sequential_interleaved
- Modelo relacionado (amigo): https://friendli.ai/models/nikitastheo/babylm-lem-deu-ell-sequential_interleaved
- Modelo relacionado (portugués): https://huggingface.co/nikitastheo/babylm-por-ell-sequential_interleaved
