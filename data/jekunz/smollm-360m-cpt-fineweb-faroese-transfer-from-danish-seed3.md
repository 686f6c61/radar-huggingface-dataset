# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed3` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz como parte de su investigación personal sobre adaptación lingüística de modelos pequeños. Se trata de un experimento de *continued pretraining* (CPT) en dos fases: primero sobre la porción danesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus, con el objetivo de transferir conocimiento entre lenguas germánicas nórdicas de bajos recursos. El modelo resultante está orientado a la generación de texto en feroés (`fo`).

Con 361.821.120 parámetros (aproximadamente 362 millones), el modelo se sitúa en la gama ultraligera, lo que lo hace desplegable en hardware muy modesto. La longitud de contexto declarada durante el entrenamiento es de 2048 tokens. La relevancia de este modelo es fundamentalmente investigadora: se publica como una de tres semillas (seed 3) de una misma configuración, lo que permite estudiar la variabilidad de resultados en experimentos de transferencia lingüística entre idiomas de bajos recursos. No se han publicado evaluaciones amplias de su rendimiento.

La licencia Apache 2.0 y el formato safetensors facilitan su uso y reproducibilidad, aunque el autor advierte explícitamente de que el modelo no ha sido evaluado de forma exhaustiva y está pensado para fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/GGUF, aunque no se han publicado versiones) |
| Idiomas soportados | feroés (`fo`); entrenado con transferencia desde danés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de la familia LLaMA con 362 millones de parámetros. Sobre esa base se aplica un ajuste fino en dos etapas: una primera época sobre la porción danesa de FineWeb-2 y cinco épocas sobre la porción feroesa del mismo corpus. El objetivo es aprovechar el conocimiento del danés (lengua con más recursos dentro del mismo grupo germánico nórdico) como puente para mejorar el modelado del feroés.

Los hiperparámetros declarados son: learning rate de 5e-4, scheduler coseno, ratio de warmup de 0.05, batch size de 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y semilla 3. El entrenamiento se realizó en una única GPU A100 de 40 GB. No se especifica el número total de tokens procesados ni la composición exacta del dataset más allá de la referencia a FineWeb-2. Tampoco se documenta el uso de RLHF o DPO; el punto de partida es un modelo ya instruido, pero el ajuste descrito es de tipo CPT supervisado sobre texto.

## Capacidades

- Generación de texto en feroés, con capacidad de transferencia desde el danés.
- Generación de texto conversacional, heredada del modelo base SmolLM2-360M-Instruct.
- Razonamiento básico y respuesta a instrucciones a pequeña escala, limitado por el tamaño del modelo.
- Capacidades multilingües restringidas: el idioma declarado es únicamente `fo`, con posible arrastre residual del danés y del inglés del modelo base.
- Soporte de tool calling: no disponible de forma documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma documentada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transferencia lingüística entre lenguas de bajos recursos: el modelo permite estudiar cómo el preentrenamiento en danés afecta al rendimiento en feroés, comparando las tres semillas publicadas de la misma configuración.
- Generación de texto sintético en feroés para aumento de datos: puede emplearse para producir corpus auxiliares que alimenten modelos mayores o sistemas de traducción.
- Prototipado de asistentes conversacionales en feroés: al ser un modelo instruido, puede gestionar diálogos simples en este idioma en entornos de demostración o pruebas de concepto.
- Evaluación de técnicas de CPT en modelos ultraligeros: sirve como banco de pruebas para medir el impacto de épocas, learning rate y semillas en modelos de ~360M parámetros.
- Despliegue en entornos con recursos muy limitados: sus 362M parámetros permiten ejecución en CPU o GPU de gama baja para tareas de generación de texto sin requisitos de latencia estrictos.
- Reproducibilidad de experimentos académicos: la publicación de tres semillas con la misma configuración facilita análisis de varianza en resultados de investigación.
- Filtrado o clasificación de texto en feroés: puede adaptarse mediante ajuste fino adicional para tareas de etiquetado o moderación en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos, más overhead de activaciones y KV cache (en torno a 1-1,5 GB en total para contextos de 2048 tokens).
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso GPUs integradas pueden ejecutar el modelo. El entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050 y superiores; también es viable en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque no se han publicado versiones GGUF oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed3 | 361.821.120 | 2048 | fo | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (base) | ~362M | 2048 (entrenamiento original superior según variante) | en (principalmente) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-danish (modelo base del ajuste) | ~362M | 2048 | da | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, idioma y licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido evaluado de forma amplia; su rendimiento real en feroés es desconocido más allá de las métricas de entrenamiento.
- Riesgo elevado de alucinación y de generación incoherente, habitual en modelos de ~360M parámetros, especialmente en lenguas de bajos recursos.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de toxicidad.
- Limitación de idioma: solo se declara feroés; el uso en otros idiomas puede producir resultados degradados o mezcla de lenguas.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- El modelo está pensado para investigación; no se recomienda su uso en producción sin una evaluación previa específica del dominio.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace arriesgado su despliegue comercial sin validación adicional.
- El ajuste en cinco épocas sobre feroés con un corpus limitado puede provocar sobreajuste al estilo de FineWeb-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed3
- Modelo base del ajuste (danés): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-danish
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web disponible.
