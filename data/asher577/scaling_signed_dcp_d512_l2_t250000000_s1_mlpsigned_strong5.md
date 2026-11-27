# asher577/scaling_signed_dcp_d512_L2_t250000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d512_L2_t250000000_s1_mlpsigned_strong5` es un transformer con dispersión de pesos (weight-sparse) entrenado por el usuario asher577 siguiendo el procedimiento descrito por Gao et al. (2025). Se trata de un modelo de investigación de escala muy reducida: 2 capas, dimensión de modelo 512, longitud de contexto 512 y un vocabulario de solo 4096 tokens. Su propósito no es el uso en producción, sino el estudio experimental de técnicas de dispersión en pesos y activaciones y de su escalado.

El modelo se ha entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, acumulando 250 millones de tokens. La nomenclatura del repositorio indica una configuración con L0 objetivo del 1 % y una variante "mlpsigned_strong5" en el esquema de dispersión, aunque el autor no detalla en la model card el significado exacto de cada sufijo.

Es relevante únicamente en el contexto de la investigación sobre eficiencia de modelos: la dispersión de pesos y activaciones es una línea activa para reducir cómputo y memoria en inferencia. No obstante, el modelo no está pensado para tareas generativas reales, carece de licencia declarada y no publica benchmarks. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato `pytorch_model.bin`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Capas | 2 |
| Dimension del modelo | 512 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Dispersion de pesos | Si (L0 objetivo 0,01) |
| Dispersion de activaciones | Si |
| Tokens de entrenamiento | 250.000.000 |
| Dataset | `jacobcd52/simplestories-tokenized` |
| Tokenizador | `SimpleStories/SimpleStories-1.25M` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16, lo que implica 32 cabezas de atención (512 / 16). El vocabulario es de 4096 tokens y el contexto máximo de 512. La innovación principal es la dispersión: el modelo aplica dispersión tanto en pesos (weight sparsity, con fracción L0 objetivo de 0,01, es decir, aproximadamente un 1 % de pesos no nulos) como en activaciones (activation sparsity). El procedimiento de entrenamiento sigue la metodología de Gao et al. (2025), aunque la model card no detalla los pormenores del algoritmo.

El entrenamiento se realizó sobre el dataset SimpleStories tokenizado, con 250 millones de tokens procesados. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación posterior. Tampoco se especifica la composición lingüística del dataset más allá de su nombre, ni se detalla la función de pérdida o el esquema exacto de regularización que induce la dispersión. La variante "mlpsigned_strong5" sugiere una configuración específica del módulo MLP con signos y una intensidad de dispersión "strong5", pero el autor no aporta definición técnica.

## Capacidades

- Generación de texto a nivel de investigación sobre un vocabulario muy reducido (4096 tokens), limitada al dominio del dataset SimpleStories.
- Modelado de lenguaje autoregresivo básico con contexto de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el vocabulario y el dataset no permiten afirmar cobertura multilingüe.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Su interés real es como objeto de estudio de dispersión de pesos y activaciones, no como modelo de propósito general.

## Casos de uso

- Investigación sobre dispersión de pesos: el modelo sirve como punto de datos para estudiar cómo afecta una fracción L0 del 1 % a la calidad del modelado en un transformer pequeño, comparando con variantes no dispersas del mismo autor.
- Estudio de dispersión de activaciones: permite analizar qué neuronas se activan con el dataset SimpleStories y validar técnicas de poda dinámica en inferencia.
- Reproducción de experimentos de escalado: con 250 millones de tokens y una configuración fija (d512, L2), encaja en curvas de escalado que relacionan tokens, tamaño y dispersión.
- Validación de metodologías de Gao et al. (2025): útil para replicar y contrastar los resultados del paper en un entorno controlado y de bajo coste computacional.
- Benchmark de eficiencia en inferencia: al ser un modelo de 0,1 GB, permite medir el ahorro real de memoria y cómputo que aporta la dispersión frente a un modelo denso equivalente.
- Docencia y experimentación: su tamaño reducido permite entrenarlo y ejecutarlo en hardware modesto, lo que lo hace apto para cursos o talleres sobre eficiencia de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero el repositorio completo ocupa 0,1 GB, por lo que la inferencia en FP32 cabría holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales e incluso en entornos integrados.
- Opciones de despliegue: al usar pesos en formato `pytorch_model.bin` y requerir la clase `SparseGPT` del repositorio del autor, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión y adaptación del código.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `asher577/scaling_signed_dcp_d512_L2_t250000000_s1_mlpsigned_strong5` | no disponible (d512, L2) | 512 | no disponible | Hugging Face, pesos PyTorch |
| Otras variantes del mismo autor (`scaling_*`) | no disponible | no disponible | no disponible | Hugging Face |
| Modelos densos pequeños tipo GPT-2 small | ~124 M | 1024 | MIT (GPT-2) | Amplia, con ecosistema de herramientas |
| Modelos de investigación con dispersión (p. ej. variantes de Gao et al. 2025) | variable | variable | variable | Sujetos a publicación del paper |

La comparación cuantitativa con alternativas no es posible porque el autor no publica número de parámetros totales, benchmarks ni licencia. Frente a GPT-2 small, este modelo es mucho más pequeño en vocabulario y contexto, y su interés es exclusivamente experimental.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe considerarse restringido hasta que el autor la especifique.
- El vocabulario de 4096 tokens y el dataset SimpleStories limitan severamente la calidad y generalidad del texto generado; no es apto para producción.
- Contexto máximo de 512 tokens, insuficiente para la mayoría de aplicaciones reales.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- No se documentan sesgos; al entrenarse sobre un dataset específico, es probable que herede los sesgos de este, pero no hay análisis publicado.
- La dispersión L0 del 1 % puede degradar la calidad del modelo; el autor no publica métricas que lo cuantifiquen.
- Requiere la clase `SparseGPT` del repositorio del autor para cargar los pesos, lo que dificulta su integración con herramientas estándar.
- No hay información sobre idiomas soportados; no debe asumirse cobertura del castellano ni de ningún otro idioma.
- La fecha de creación del repositorio (2026-11-27) es posterior a la fecha actual en muchos entornos, lo que puede indicar un error de metadatos o un repositorio de planificación; conviene verificar su disponibilidad real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d512_L2_t250000000_s1_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/z3yu30xk
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodológica: Gao et al. (2025), citado en la model card; no se proporciona enlace directo al paper.
