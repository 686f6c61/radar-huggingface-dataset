# DuoNeural/RMSN-193M-Base-v2

## Resumen

RMSN-193M-Base-v2 es un modelo de lenguaje de 193M de parámetros (243,7M reales en safetensors) desarrollado por DuoNeural AI Laboratory. Implementa la arquitectura Resonant Metriplectic Sheaf Network (RMSN), descrita por sus autores como una arquitectura neuronal de secuencias con formulación Port-Hamiltoniana: la dinámica del operador forward se define mediante una ecuación de evolución que combina un corchete de Poisson y un corchete de metriplecticidad, de modo que la estabilidad de Lyapunov se trata como invariante estructural del operador y no como un regularizador añadido durante el entrenamiento.

El modelo es la segunda instancia de la clase "near-zero attractor" de 193M del laboratorio y sirve como acompañante de reproducibilidad del RMSN-193M-Base (seed7). Según la model card, alcanza una perplejidad de validación de 69,9 sobre WikiText-103, el segundo mejor resultado de la clase 193M del laboratorio, con un exponente de Lyapunov máximo de -0,0134 (régimen de dinámica caótica en meseta cercana a cero). La tesis del autor es que la geometría de solitón y la calidad de modelado del lenguaje son ortogonales en perplejidad: la primera ni ayuda ni perjudica al rendimiento lingüístico.

Su relevancia es fundamentalmente de investigación: propone un marco físico-matemático (mecánica metripléctica, teoría de haces, estabilidad de Lyapunov) aplicado al modelado de lenguaje, con contexto corto (512 tokens), vocabulario de 49.152 entradas y entrenamiento exclusivo sobre WikiText-103. No está pensado como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltoniana |
| Parámetros totales | 243.732.144 (safetensors); ~193M según model card |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Vocabulario | 49.152 (tokenizer cosmo2) |
| dim / depth / slots | 1024 / 16 / 64 |
| Datos de entrenamiento | WikiText-103, 100K pasos, 204,8M tokens |
| Perplejidad de validación | 69,9 |
| Lyapunov (lambda_max) | -0,0134 |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

La RMSN se formula como una arquitectura de secuencias Port-Hamiltoniana cuya evolución sigue la ecuación $\dot{f} = \{f, H\} + [f, S]$, donde el primer término es un corchete de Poisson asociado a una función hamiltoniana $H$ y el segundo un corchete de metriplecticidad asociado a una función de entropía $S$. Esta estructura descompone la dinámica en una parte conservativa (Hamiltoniana) y una parte disipativa (metripléctica), de forma que la estabilidad de Lyapunov queda garantizada por construcción del operador forward. La model card menciona además el uso de teoría de haces ("sheaf theory") y geometría de solitón en la formulación, aunque no se detalla en la información disponible cómo se materializan en las capas concretas.

El entrenamiento se realizó sobre WikiText-103 durante 100.000 pasos, lo que corresponde a 204,8M tokens procesados. No se especifica en la información disponible si hubo fases de RLHF, DPO, instrucción o ajuste fino posterior; el modelo se presenta como "Base", lo que sugiere un preentrenamiento puro de modelado de lenguaje. La configuración interna reportada es dim=1024, depth=16 y 64 slots. El resultado de validación (perplejidad 69,9, Lyapunov -0,0134) se compara con la semilla 7 del modelo base (perplejidad 69,5), que lidera la clase 193M del laboratorio.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Modelado de lenguaje causal sobre secuencias de hasta 512 tokens.
- Razonamiento y conocimiento factual limitados por el corpus de entrenamiento (WikiText-103, predominantemente enciclopédico).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Propiedad estructural de estabilidad dinámica (Lyapunov negativo) verificable en la evaluación reportada por el autor.

## Casos de uso

- Investigación en arquitecturas físico-informadas: el modelo sirve como referencia reproducible para estudiar si la formulación Port-Hamiltoniana y la estabilidad de Lyapunov estructural afectan a la calidad del modelado del lenguaje frente a transformers convencionales de tamaño comparable.
- Reproducibilidad de experimentos: al ser un modelo acompañante de la semilla 7 del RMSN-193M-Base, permite replicar el estudio de variabilidad entre inicializaciones y confirmar la reproducibilidad de la clase "near-zero attractor".
- Análisis de dinámica de sistemas: el valor de Lyapunov reportado (-0,0134) y la geometría de solitón permiten estudiar el comportamiento dinámico del operador forward en regímenes de meseta caótica, un caso de interés en teoría de sistemas dinámicos aplicada a redes neuronales.
- Prototipado de generación de texto en inglés sobre dominios enciclopédicos: dado su entrenamiento en WikiText-103, puede emplearse para completar o generar pasajes de estilo enciclopédico en tareas de bajo riesgo y contexto corto.
- Docencia y divulgación: modelo pequeño (1,7 GB en safetensors) que cabe en hardware modesto y permite ilustrar conceptos de mecánica metripléctica, haces y estabilidad de Lyapunov en un curso o taller práctico.
- Baseline para comparativas de eficiencia: útil como referencia de perplejidad (69,9) para modelos de ~200M parámetros entrenados con el mismo corpus y tokenizer, en estudios de escalado o de tokenizadores (cosmo2).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad de validación (WikiText-103) | 69,9 |
| Lyapunov lambda_max | -0,0134 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1 GB para los 243,7M de parámetros (0,97 GB solo pesos), más overhead de activaciones y KV cache para contexto de 512.
- VRAM estimada en fp16/bf16: ~0,5 GB de pesos.
- VRAM estimada en cuantización de 8 bits: ~0,25 GB de pesos (estimación teórica; no se confirman formatos GGUF publicados).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (pesos safetensors); no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura no es un transformer estándar y no hay conversiones publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-193M-Base-v2 | 243,7M (safetensors) / ~193M (card) | 512 | MIT | safetensors | Perplejidad 69,9 en WikiText-103; arquitectura Port-Hamiltoniana |
| RMSN-193M-Base (seed7) | ~193M | 512 | MIT | safetensors | Perplejidad 69,5; mejor resultado de la clase 193M del laboratorio |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF | Transformer estándar; ampliamente soportado en herramientas de inferencia |
| GPT-2 medium | 355M | 1024 | MIT | safetensors, GGUF | Transformer estándar; mayor tamaño y contexto que RMSN-193M |

La comparación con modelos de la misma categoría se limita a alternativas de tamaño similar y propósito de modelado de lenguaje; no hay datos de benchmarks comunes publicados para RMSN-193M-Base-v2 que permitan una comparación cuantitativa directa con GPT-2 u otros modelos.

## Limitaciones y advertencias

- Corpus de entrenamiento muy restringido (WikiText-103, 204,8M tokens): el conocimiento del mundo y la cobertura lingüística son limitados; no es adecuado como modelo generalista.
- Contexto de solo 512 tokens, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Solo inglés declarado; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación elevado en dominios fuera de WikiText-103, dado el tamaño reducido y el corpus enciclopédico.
- No se reportan evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- No hay evidencia de soporte en herramientas de inferencia estándar (vLLM, llama.cpp, Ollama), lo que puede dificultar el despliegue en producción.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks estándar y de documentación sobre robustez desaconseja su uso en producción sin evaluación adicional.
- La model card proviene de un laboratorio con publicaciones en Zenodo y metodologías descritas como "no ortodoxas"; conviene tratar las afirmaciones sobre estabilidad estructural y geometría de solitón como resultados de investigación no replicados de forma independiente.
- El modelo se presenta como "Base" sin ajuste por instrucciones; no se espera que siga instrucciones de forma fiable.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-Base-v2
- Modelo acompañante: https://huggingface.co/DuoNeural/RMSN-193M-Base
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Licencia MIT: https://opensource.org/licenses/MIT
