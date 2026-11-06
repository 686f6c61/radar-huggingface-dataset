# asher577/scaling2_plain_d512_L2_t500000000_s0

## Resumen

`scaling2_plain_d512_L2_t500000000_s0` es un transformer de investigación publicado por el usuario asher577 en Hugging Face, entrenado siguiendo el procedimiento descrito por Gao et al. (2025) para transformers con dispersión de pesos (*weight-sparse transformers*). No se trata de un modelo de propósito general ni de un producto listo para producción, sino de un artefacto experimental dentro de un estudio de escalado sobre arquitecturas con dispersión estructural en los pesos y en las activaciones.

El modelo es deliberadamente pequeño: 2 capas, dimensión de modelo de 512, dimensión de cabeza de 16 y un vocabulario de solo 4096 tokens. Su longitud de contexto es de 512 tokens. El nombre del repositorio codifica los hiperparámetros clave del experimento: dimensión 512, 2 capas, 500 millones de tokens de entrenamiento y semilla 0.

Su relevancia es metodológica más que funcional: sirve como punto de datos en una curva de escalado que estudia cómo se comportan los transformers con dispersión de pesos (objetivo L0 del 1 %) frente a modelos densos equivalentes, sobre un corpus sintético de historias simples (SimpleStories). Cualquier uso práctico queda fuera del alcance previsto por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) y dispersión de activaciones |
| Parámetros totales | no disponible (no se indica en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus predominantemente en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Capas | 2 |
| Dimensión de modelo | 512 |
| Dimensión de cabeza | 16 |
| Tamaño de vocabulario | 4096 |
| Dispersión de pesos | Sí, fracción L0 objetivo 0,01 |
| Dispersión de activaciones | Sí |
| Tokens de entrenamiento | 500 000 000 |
| Dataset | `jacobcd52/simplestories-tokenized` |
| Tokenizer | `SimpleStories/SimpleStories-1.25M` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso en su topología pero con dispersión inducida tanto en los pesos como en las activaciones, siguiendo el procedimiento de Gao et al. (2025). La fracción L0 objetivo de 0,01 implica que solo aproximadamente el 1 % de los pesos por unidad de cómputo permanecen activos, lo que convierte al modelo en un caso de estudio de eficiencia estructural más que de capacidad bruta. Con solo 2 capas y dimensión 512, la profundidad y anchura son mínimas, adecuadas únicamente para estudiar dinámicas de escalado en regímenes de muy bajo cómputo.

El entrenamiento se realizó sobre 500 millones de tokens del corpus SimpleStories tokenizado, con el tokenizer SimpleStories-1.25M (vocabulario de 4096). SimpleStories es un dataset sintético de historias cortas y simples, diseñado para experimentos controlados de entrenamiento. No se documenta en la model card el uso de RLHF, DPO ni ningún tipo de ajuste por preferencias; tampoco se detalla la composición exacta del dataset ni innovaciones adicionales como decodificación especulativa o atención lineal. El run de entrenamiento está registrado en Weights & Biases (ver enlaces).

## Capacidades

- Generación de texto a nivel de continuación de historias simples, limitada por el corpus de entrenamiento (SimpleStories).
- Modelado de lenguaje autorregresivo básico sobre un vocabulario de 4096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus de entrenamiento es de historias sintéticas en inglés.
- No dispone de modo de razonamiento (*thinking*), visión ni audio.
- Su interés principal es como objeto de estudio de dispersión de pesos, no como modelo funcional.

## Casos de uso

- Investigación sobre dispersión de pesos: el modelo sirve como punto de datos en estudios de escalado que comparan transformers dispersos frente a densos a igualdad de cómputo, replicando el procedimiento de Gao et al. (2025).
- Reproducción de experimentos de escalado: permite verificar curvas de pérdida frente a número de tokens (500 M) y tamaño de modelo (d512, L2) en un entorno controlado con SimpleStories.
- Estudio de eficiencia estructural: analizar el impacto de una fracción L0 del 1 % en la calidad de la generación en modelos de muy baja profundidad.
- Benchmarking de técnicas de poda: servir como referencia base para comparar métodos de sparse training frente a poda post-entrenamiento sobre el mismo corpus sintético.
- Docencia y divulgación: ejemplo mínimo y reproducible de un transformer con dispersión de pesos, útil para explicar conceptos de sparse training sin requerir recursos de cómputo elevados.
- Validación de pipelines de entrenamiento: al ser un modelo pequeño con run de W&B público, sirve para probar infraestructura de entrenamiento y registro de experimentos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no publicarse el número de parámetros totales; por la configuración (2 capas, d512, vocab 4096) el modelo es de tamaño muy reducido y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: el autor indica que la carga requiere la clase `SparseGPT` del repositorio, por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin trabajo de adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia de escalado con dispersión de pesos publicados por el mismo autor u otros, ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general.
- Capacidad muy limitada: 2 capas, d512 y vocabulario de 4096 tokens restringen severamente la calidad y cobertura del lenguaje.
- Corpus sintético: entrenado solo con SimpleStories, por lo que no generaliza a dominios reales.
- Contexto corto: 512 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de documentación.
- Idiomas: no se documenta soporte multilingüe; el corpus es en inglés.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso.
- Riesgo de alucinación: alto en cualquier uso fuera de la distribución de entrenamiento, dado el régimen de bajo cómputo y el corpus sintético.
- Dependencia de código propietario: la carga requiere la clase `SparseGPT` del repositorio, lo que añade fricción de integración.
- Sesgos: no documentados; el corpus sintético puede introducir sesgos propios de su generación.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling2_plain_d512_L2_t500000000_s0
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/srjns1s6
- Dataset: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
