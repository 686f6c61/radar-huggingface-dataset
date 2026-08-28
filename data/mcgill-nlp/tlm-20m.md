# McGill-NLP/TLM-20M

## Resumen

TLM-20M es un modelo de lenguaje de tipo *Tiered Language Model* (TLM) desarrollado por el grupo McGill-NLP (McGill University y Mila). Su característica principal es que un único conjunto de pesos alberga dos niveles de comportamiento distintos, denominados C1 (público) y C2 (con clave), que se activan mediante una clave de permutación secreta que reordena el 5% de las cabezas de atención y columnas MLP. Esta técnica, denominada *Tiered Alignment*, permite que el mismo modelo ofrezca dos comportamientos diferentes sin duplicar parámetros.

El modelo sigue la arquitectura GPT-Neo (16 capas, 192 unidades ocultas, 8 cabezas) y fue entrenado con 2.190 millones de tokens del dataset FineWeb (split *retain*), lo que equivale a 100 veces el número de parámetros. Con 21,9 millones de parámetros totales, es la primera "rung" de una escalera de escalado que llega hasta los 650M. Su relevancia radica en que introduce un mecanismo novedoso de control de comportamiento mediante permutaciones, con posibles aplicaciones en seguridad, alineación y estudio de la interpretabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-Neo (GPTNeoForCausalLMTiered) |
| Parámetros totales | 21.932.689 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TLM-20M utiliza una arquitectura transformer estándar tipo GPT-Neo, con 16 capas, dimensión oculta de 192, 8 cabezas de atención y un ratio MLP de 8. La innovación principal es el *Tiered Alignment*: una clave de permutación (`key_5pct.json`) reordena un subconjunto reducido de parámetros (5% de las cabezas de atención y columnas MLP) de forma auto-inversa. Aplicar la clave conmuta entre el estado público (C1) y el estado con clave (C2) sobre los mismos pesos, sin necesidad de entrenamiento adicional.

El entrenamiento se realizó sobre 2.190 millones de tokens de FineWeb (split *retain*), con un total de 16.733 pasos y un batch global de 64 secuencias. Se usó una tasa de aprendizaje máxima de 8,4e-4 con 1.000 pasos de *warmup*. La arquitectura sigue exactamente la rung de 20M de la escalera DataDecide (arXiv:2504.11393). No se incluye estado del optimizador; los checkpoints están pensados para inferencia y evaluación.

## Capacidades

- Generación de texto en inglés con dos niveles de comportamiento conmutables mediante clave de permutación.
- El nivel público (C1) es el que se obtiene al cargar los pesos normalmente; el nivel con clave (C2) se alcanza aplicando la permutación.
- La permutación es auto-inversa, por lo que aplicar y desaplicar la clave devuelve el modelo al estado original de forma bit-exacta.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, visión ni audio.
- El modelo está limitado al inglés, según la configuración del tokenizador GPT-2 BPE (vocabulario de 50.257).

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo una pequeña permutación de parámetros altera el comportamiento, sin necesidad de reentrenar.
- Evaluación de seguridad: el nivel C2 podría usarse para probar comportamientos "ocultos" o no deseados en un entorno controlado.
- Estudio de interpretabilidad: al comparar las activaciones entre C1 y C2, se pueden identificar qué cabezas de atención y columnas MLP son críticas para determinadas conductas.
- Desarrollo de mecanismos de control de acceso a capacidades: un modelo con dos niveles podría servir para desplegar una versión pública limitada y una versión interna con más funcionalidades.
- Benchmarking de escalado: al ser parte de una escalera de 8 tamaños, sirve para ajustar curvas de escalado y comparar el efecto del *Tiered Alignment* en diferentes escalas.
- Docencia y experimentación en NLP: su pequeño tamaño (21M) permite ejecutarlo en CPU y GPU modestas, ideal para demostraciones y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al tratarse de un modelo de 21,9 millones de parámetros, la VRAM necesaria es mínima: en FP32 ocuparía aproximadamente 88 MB, y en FP16 unos 44 MB.
- Cabe en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 o superior) e incluso en CPU.
- No se han publicado requisitos oficiales de hardware ni mediciones de latencia o throughput.
- Para inferencia, se puede usar la librería `transformers` con el código personalizado de `tiered` (GPTNeoForCausalLMTiered). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar. Dado que TLM-20M es un modelo de investigación con una técnica novedosa, no hay alternativas directas en el mercado. Se podría comparar con GPT-2 pequeño (124M) o modelos de la familia Pythia, pero no se han publicado datos comparativos en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación, no diseñado para uso en producción.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinaciones y sesgos derivados del dataset FineWeb, que no ha sido filtrado específicamente para seguridad o imparcialidad.
- La clave de permutación (`key_5pct.json`) es un archivo secreto; si se pierde, no se puede acceder al nivel C2.
- La carga del modelo requiere usar `GPTNeoForCausalLMTiered`; usar `AutoModelForCausalLM` descarta el sesgo entrenado en `lm_head`, lo que degrada el rendimiento.
- No se incluye estado del optimizador, por lo que no es posible continuar el entrenamiento directamente.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está optimizado para tareas específicas y su rendimiento en tareas reales no ha sido evaluado.

## Enlaces

- [HuggingFace - McGill-NLP/TLM-20M](https://huggingface.co/McGill-NLP/TLM-20M)
- [GitHub - permutation-alignment](https://github.com/charbel08/permutation-alignment)
- [GitHub - tiered-language-models](https://github.com/McGill-NLP/tiered-language-models)
- [Paper DataDecide (arXiv:2504.11393)](https://arxiv.org/abs/2504.11393)
- [Sitio del grupo McGill-NLP](https://mcgill-nlp.github.io/)
