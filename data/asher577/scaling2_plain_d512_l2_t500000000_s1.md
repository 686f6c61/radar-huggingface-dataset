# asher577/scaling2_plain_d512_L2_t500000000_s1

## Resumen

`scaling2_plain_d512_L2_t500000000_s1` es un transformer de pesos dispersos (weight-sparse) de escala muy reducida, publicado por el usuario asher577 en HuggingFace. Se trata de un artefacto de investigación, no de un modelo de propósito general: forma parte de un barrido de escalado ("scaling2") que entrena variantes de un transformer con dispersión estructural en los pesos y en las activaciones, siguiendo el procedimiento descrito por Gao et al. (2025).

El modelo tiene 2 capas, dimensión de modelo 512, dimensión de cabeza 16, contexto de 512 tokens y un vocabulario de solo 4096 tokens. Se ha entrenado durante 500 millones de tokens sobre el dataset `jacobcd52/simplestories-tokenized`, un corpus de historias sintéticas simples, con el tokenizador de SimpleStories-1.25M. El objetivo declarado es estudiar cómo se comporta la dispersión de pesos (fracción L0 objetivo de 0,01) a medida que escala el cómputo de entrenamiento.

Su relevancia es exclusivamente metodológica: sirve para reproducir y analizar experimentos de dispersión en transformers pequeños, no para tareas de producción. El repositorio no incluye pesos en formato estándar (solo `pytorch_model.bin` y `config.json`), no declara licencia y no ofrece pipeline ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con dispersión de pesos y de activaciones |
| Parametros totales | no disponible (2 capas, d_model=512, vocab=4096; no se publica el recuento) |
| Parametros activos | no disponible (no es MoE; la dispersión es a nivel de pesos, L0 objetivo 0,01) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre historias sintéticas en inglés presumiblemente, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16. La innovación principal no está en el bloque transformer en sí, sino en el régimen de entrenamiento: se aplica dispersión en los pesos con una fracción L0 objetivo de 0,01 (es decir, aproximadamente el 1 % de los pesos activos por neurona o conexión, según la formulación de Gao et al. 2025) y además dispersión en las activaciones. El modelo se entrena desde cero, no se poda a partir de un modelo denso preentrenado.

El entrenamiento consume 500 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M` y un vocabulario de 4096 tokens. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el corpus de SimpleStories es de historias cortas sintéticas, por lo que el modelo aprende a modelar ese dominio concreto. La model card enlaza la ejecución de Weights & Biases (`asher577/scd_scaling`, run `3f03twzj`) como única fuente de curvas de entrenamiento.

## Capacidades

- Modelado de lenguaje autoregresivo sobre texto del dominio SimpleStories (historias cortas sintéticas).
- Generación de texto limitada al vocabulario de 4096 tokens y al contexto de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el tokenizador y el dataset apuntan a un único dominio lingüístico.
- No se documenta modo de razonamiento (thinking), visión ni audio.
- Capacidad de servir como banco de pruebas para estudiar dispersión de pesos y activaciones en transformers pequeños.

## Casos de uso

- Reproducción de experimentos de dispersión: el modelo permite verificar el procedimiento de Gao et al. (2025) a una escala de 2 capas y 500 M tokens, comparando curvas de pérdida con la run de W&B enlazada.
- Estudio de escalado de cómputo: al existir otras variantes del barrido `scaling2` (por el nombre del repositorio), sirve para trazar cómo evoluciona la pérdida con el número de tokens y la dimensión del modelo.
- Análisis de sparsity efectiva: permite medir la fracción L0 real alcanzada frente al objetivo de 0,01 y su impacto en la perplejidad sobre SimpleStories.
- Docencia e investigación en eficiencia de transformers: un modelo de 2 capas y contexto 512 es barato de entrenar y de inspeccionar, adecuado para cursos o pruebas de concepto sobre poda y dispersión.
- Generación de historias sintéticas de juguete: puede producir continuaciones de historias simples dentro del dominio de SimpleStories, útil para validar pipelines de generación sin coste de GPU.
- Baseline para comparativas de métodos de sparsity: sirve como referencia "plain" frente a variantes con dispersión de activaciones o de pesos en el mismo barrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,0 GB) y la configuración (2 capas, d_model 512, vocab 4096), el modelo es del orden de decenas de millones de parámetros como máximo, por lo que cabría en cualquier GPU consumer con varios GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen, aunque no se publica el recuento exacto de parámetros.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La model card indica que la carga requiere la clase `SparseGPT` del repositorio del autor, por lo que el despliegue está limitado a PyTorch con código personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `asher577/scaling2_plain_d512_L2_t500000000_s1` | no disponible (2 capas, d=512) | 512 | no disponible | Pesos en `pytorch_model.bin`, requiere clase `SparseGPT` | Artefacto de investigación sobre dispersión |
| Otras variantes del barrido `scaling2` de asher577 | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |
| Modelos de SimpleStories (p. ej. SimpleStories-1.25M) | ~1,25 M (tokenizador de referencia) | no disponible | no disponible | HuggingFace | Referencia del tokenizador usado, no comparable en arquitectura |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación de escala mínima: 2 capas y contexto de 512 tokens lo inhabilitan para tareas de producción reales.
- Entrenado únicamente sobre historias sintéticas (SimpleStories); el dominio y la distribución son muy estrechos y no generaliza a texto real.
- Vocabulario de solo 4096 tokens: cobertura léxica muy limitada, con alta fragmentación en palabras poco frecuentes.
- Riesgo elevado de alucinación y de incoherencia fuera del dominio de entrenamiento.
- No se declara licencia, por lo que el uso comercial es incierto y no recomendable sin aclaración del autor.
- No se documentan sesgos; al entrenarse sobre datos sintéticos, los sesgos reflejan las plantillas del generador de SimpleStories.
- La carga requiere código específico (clase `SparseGPT`), lo que complica la integración con frameworks estándar.
- No hay pipeline declarado, ni idiomas, ni cuantizaciones publicadas; el soporte de la comunidad es nulo (0 descargas, 0 likes en el momento de la consulta).
- La fecha de creación del repositorio (2026-11-04) es posterior a la fecha habitual de referencia; conviene verificar la vigencia del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/asher577/scaling2_plain_d512_L2_t500000000_s1
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/3f03twzj
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodológica: Gao et al. (2025), citado en la model card (sin enlace directo disponible)
