# asher577/scaling_signed_dcp_d512_L2_t125000000_s2_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d512_L2_t125000000_s2_mlpsigned_strong5` es un modelo de investigación publicado por el usuario asher577 en Hugging Face. Se trata de un transformer de pesos dispersos (weight-sparse) entrenado con el procedimiento descrito por Gao et al. (2025), orientado al estudio de la dispersión en pesos y activaciones más que a un uso productivo general. Su tamaño es reducido: 2 capas, dimensión de modelo 512 y vocabulario de 4096 tokens.

El modelo se ha entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador de SimpleStories-1.25M y un total de 125 millones de tokens. La nomenclatura del identificador sugiere un barrido de escalado (scaling) con dispersión objetivo L0 del 1 % y una variante "mlpsigned_strong5", presumiblemente referida a la configuración de dispersión en las capas MLP.

Su relevancia es puramente experimental: sirve para reproducir y analizar los efectos de la dispersión de pesos y activaciones en modelos pequeños con contexto corto (512 tokens). No dispone de model card con licencia, idiomas o benchmarks, y el repositorio ocupa solo 0,1 GB, lo que confirma su carácter de artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y activaciones (weight-sparse, activation-sparse) |
| Parametros totales | no disponible (2 capas, d_model=512, vocab=4096; el recuento exacto no se publica) |
| Parametros activos | no disponible (no es MoE; dispersión L0 objetivo del 1 %) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 512, dimensión de cabeza 16 y vocabulario de 4096 tokens. La innovación principal es la dispersión: el modelo declara `Weight Sparsity: True` con una fracción L0 objetivo de 0,01 (es decir, aproximadamente el 1 % de pesos activos) y `Activation Sparsity: True`. El entrenamiento sigue el procedimiento de Gao et al. (2025), que el autor cita como referencia metodológica pero sin enlace directo en la model card.

El entrenamiento se realizó sobre `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, acumulando 125 000 000 de tokens. No se documenta si hubo fases de RLHF, DPO ni instrucción; por el dataset (historias simples) y el tamaño, cabe esperar un modelo de modelado de lenguaje autoregresivo sin ajuste por preferencias. El run de entrenamiento está registrado en Weights & Biases (ver enlaces).

## Capacidades

- Generación de texto autoregresiva básica sobre el dominio de SimpleStories (historias cortas y simples).
- Modelado de lenguaje con contexto muy limitado (512 tokens).
- Dispersión de pesos y activaciones como objeto de estudio: permite analizar el impacto del 1 % de L0 en calidad y representaciones.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe; el vocabulario de 4096 tokens y el dataset sugieren un alcance muy restringido (probablemente inglés simple).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre dispersión de pesos: reproducir el procedimiento de Gao et al. (2025) y medir cómo afecta un L0 del 1 % a la perplejidad en un modelo de 2 capas y d_model=512.
- Estudio de dispersión de activaciones: analizar qué neuronas se activan con el dataset SimpleStories y comparar patrones entre checkpoints del barrido de escalado.
- Ablaciones de escalado: el identificador (`d512_L2_t125000000`) indica un punto de una curva de escalado; sirve para comparar con otros tamaños y presupuestos de tokens del mismo autor.
- Docencia y divulgación: modelo pequeño (0,1 GB) que cabe en cualquier equipo y permite explicar transformers dispersos sin infraestructura pesada.
- Reproducibilidad de experimentos: el run de W&B y la configuración publicada permiten replicar el entrenamiento con el mismo dataset y tokenizador.
- Pruebas de pipelines de carga de pesos dispersos: validar clases de modelo personalizadas (SparseGPT) y flujos de `hf_hub_download` + `torch.load` en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; con 0,1 GB de repositorio y 2 capas de d_model=512, la inferencia cabe en CPU y en cualquier GPU consumer con menos de 1 GB de VRAM (estimación a partir del tamaño del checkpoint, no confirmada por el autor).
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga requiere la clase `SparseGPT` del repositorio del autor y `torch.load` sobre `pytorch_model.bin`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| asher577/scaling_signed_dcp_d512_L2_t125000000_s2_mlpsigned_strong5 | no disponible (2 capas, d=512) | 512 | no disponible | Hugging Face, pesos PyTorch |
| Otros checkpoints del barrido `scaling_signed_dcp_*` de asher577 | variables (d y L en el nombre) | 512 (presumible) | no disponible | Hugging Face |
| Modelos de referencia de dispersión tipo SparseGPT (Gao et al., 2025) | según implementación | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin model card completa: faltan licencia, idiomas y pipeline declarados, lo que impide evaluar su uso comercial.
- Contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones reales.
- Entrenado sobre SimpleStories (historias simples); el dominio y el vocabulario de 4096 tokens limitan severamente la generalización.
- Riesgo alto de alucinación y de texto incoherente fuera del dominio de entrenamiento.
- La dispersión L0 del 1 % puede degradar la calidad frente a un modelo denso equivalente; no se publican métricas que lo cuantifiquen.
- La carga requiere código personalizado (clase `SparseGPT`), lo que añade fricción y riesgo de incompatibilidad con versiones de PyTorch.
- No apto para producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d512_L2_t125000000_s2_mlpsigned_strong5
- Run de entrenamiento en W&B: https://wandb.ai/asher577/scd_scaling/runs/edje4q3f
- Dataset: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
