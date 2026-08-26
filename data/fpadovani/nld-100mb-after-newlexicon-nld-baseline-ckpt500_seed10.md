# fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed10

## Resumen

El modelo `fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed10` es un ajuste fino (fine-tune) del modelo base `fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10`, desarrollado por fpadovani, investigador asociado a la Universidad de Groningen. Se trata de un modelo de lenguaje de 124,8 millones de parámetros basado en la arquitectura GPT-2, entrenado mediante supervisión fina (SFT) con la librería TRL. El nombre sugiere que el modelo ha sido entrenado sobre un corpus de 100 MB de texto en neerlandés (nld) con un nuevo léxico artificial ("newlexicon"), dentro de un proyecto de investigación sobre lenguajes artificiales y su efecto en el aprendizaje de modelos. El modelo se publica como parte de una serie de experimentos académicos y no parece estar orientado a uso productivo inmediato.

La relevancia actual de este modelo reside en su carácter experimental: permite estudiar cómo el vocabulario y la estructura léxica influyen en el comportamiento de un transformer pequeño. No se han publicado métricas de rendimiento ni comparativas con otros modelos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en GPT-2: 1024, pero no confirmado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere neerlandés, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de un GPT-2 con 124,8 millones de parámetros. El modelo base fue entrenado previamente sobre un corpus de 100 MB de texto con un nuevo léxico (newlexicon) y una variante del lenguaje "ppt-art". Luego, este modelo base se sometió a un ajuste fino adicional mediante supervisión fina (SFT) con TRL (Transformers Reinforcement Learning) durante 500 pasos (checkpoint 500). El proceso de entrenamiento está documentado en un registro de Weights & Biases (enlace en el README). No se especifica la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales más allá del SFT.

## Capacidades

- Generación de texto: es capaz de producir texto coherente en el idioma en el que fue entrenado, probablemente neerlandés, aunque no se especifica.
- Modelo de lenguaje autoregresivo: genera texto token a token con contexto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni funciones adicionales.
- No se especifica soporte multilingüe; el nombre sugiere un idioma concreto.
- No se indica capacidad de razonamiento matemático o código.

## Casos de uso

- **Investigación académica en lingüística computacional**: el modelo puede utilizarse para estudiar cómo un léxico artificial afecta la generación de lenguaje, comparando con otros baselines.
- **Experimentos de aprendizaje de lenguajes artificiales**: sirve para analizar si un modelo pequeño puede aprender estructuras sintácticas de un idioma inventado.
- **Evaluación de técnicas de SFT**: permite comparar el efecto de distintos pasos de fine-tuning sobre un mismo modelo base.
- **Docencia en IA**: como ejemplo de modelo pequeño para explicar el pipeline de entrenamiento con TRL.
- **Pruebas de inferencia en hardware limitado**: al ser de 124 M, se puede usar en entornos de bajo recursos para pruebas.
- **Generación de texto en neerlandés** (si se confirma el idioma): para tareas de escritura creativa o prototipos, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,5 GB en FP32, ~0,25 GB en FP16, menos en cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3060, etc.).
- Cabe en GPU consumer y también en CPU.
- Despliegue: compatible con la librería transformers, llama.cpp, Ollama (si se convierte a GGUF), vLLM (para producción de baja latencia).
- Latencia y throughput: no se han publicado valores, pero para 124 M parámetros es muy rápido en GPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos. Como referencia, se puede comparar con el GPT-2 original (124 M parámetros), pero no se tienen datos de rendimiento de este modelo en particular. La siguiente tabla es orientativa:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| fpadovani/nld-... | 124 M | no disponible | no disponible | no disponible |
| GPT-2 small | 124 M | 1024 | MMLU ~? (no comparable) | MIT |
| DistilGPT-2 | 82 M | 1024 | no comparable | MIT |

No se dispone de más información.

## Limitaciones y advertencias

- No se han documentado sesgos ni alucinaciones específicos, pero al ser un modelo pequeño entrenado con un corpus limitado (100 MB), la calidad del texto será baja y con riesgo de incoherencias.
- No se especifica la licencia de uso; el frontmatter indica "licence: license" pero no se define una licencia concreta, por lo que se recomienda contactar al autor antes de uso comercial.
- El modelo está diseñado para investigación, no para producción. No se recomienda su uso en sistemas reales.
- La longitud de contexto no está confirmada; si se hereda de GPT-2, es de 1024 tokens, pero no está documentado.
- No se ha validado el rendimiento en tareas estándar; no se puede garantizar ninguna capacidad específica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed10)
- [Modelo base](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10)
- [Modelo similar en FriendliAI](https://friendli.ai/models/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed3407)
- [Modelo en LLM Explorer](https://llm-explorer.com/model/fpadovani%2Fnld-latn-100mb-ppt-Dp-100mb_seed10,3gUfDqc5biC09Zc0heBHs7)
- [Weights & Biases training dashboard](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/yjn35t5z)
