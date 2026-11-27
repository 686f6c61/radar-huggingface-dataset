# asher577/scaling_signed_dcp_d1536_L2_t125000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d1536_L2_t125000000_s1_mlpsigned_strong5` es un modelo de investigación publicado por el usuario asher577 en Hugging Face. Se trata de un transformer con dispersión de pesos (weight-sparse) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). El objetivo del modelo no es la producción, sino el estudio experimental de cómo la dispersión estructurada de pesos y activaciones afecta al entrenamiento y al comportamiento de transformers de escala reducida.

El modelo es deliberadamente pequeño: 2 capas, dimensión de modelo 1536, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens. Se entrenó sobre el dataset SimpleStories tokenizado (aproximadamente 125 millones de tokens), lo que lo sitúa en la categoría de modelos de juguete para investigación de mecanismos internos, no para tareas reales de generación.

Su relevancia es puramente académica: sirve como punto de datos en un barrido de escalado (scaling) sobre dispersión de pesos con fracción L0 objetivo de 0.01 y dispersión de activaciones activada. No dispone de model card completa en cuanto a licencia, idiomas o pipeline, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y activaciones (weight-sparse, activation-sparse) |
| Parametros totales | no disponible (dimensión 1536, 2 capas, vocab 4096; el recuento exacto no se publica) |
| Parametros activos | no disponible (no es MoE; la dispersión es a nivel de pesos y activaciones) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimensión de modelo 1536 y dimensión de cabeza 16, entrenado con el procedimiento de dispersión firmada descrito por Gao et al. (2025). Incorpora dispersión de pesos con una fracción L0 objetivo de 0.01 (es decir, aproximadamente el 1 % de los pesos permanecen activos) y dispersión de activaciones. Esta combinación busca estudiar regímenes de eficiencia extrema en los que tanto las matrices de pesos como las activaciones son ralas, algo relevante para investigar interpretabilidad y eficiencia computacional.

El entrenamiento se realizó sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, consumiendo un total de 125 000 000 tokens. El nombre del modelo codifica los hiperparámetros del barrido: `d1536` (dimensión), `L2` (capas), `t125000000` (tokens), `s1` (semilla o paso de escalado) y `mlpsigned_strong5` (variante de dispersión aplicada a las MLP). No se documentan detalles sobre RLHF, DPO ni fases de alineamiento; el entrenamiento parece ser puramente de preentrenamiento supervisado sobre texto sintético.

## Capacidades

- Generación de texto a nivel de investigación sobre el dominio de SimpleStories (relatos cortos sintéticos).
- Estudio de mecanismos internos: al ser un modelo pequeño con dispersión controlada, es adecuado para análisis de circuitos, probing y atribución.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (vocabulario de 4096 tokens orientado a SimpleStories, presumiblemente en inglés).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en dispersión de pesos: reproducir y analizar el efecto de la fracción L0 = 0.01 sobre la calidad del modelo en un régimen controlado de 2 capas y 125 M tokens.
- Análisis de interpretabilidad: usar el modelo como sujeto de experimentos de probing y circuit discovery gracias a su reducido tamaño y a la estructura rala de sus pesos.
- Estudio de eficiencia: medir el ahorro real de cómputo y memoria al combinar dispersión de pesos y activaciones en un transformer pequeño.
- Comparación de barridos de escalado: el nombre del checkpoint indica que forma parte de una familia de experimentos; sirve para contrastar curvas de pérdida frente a otras configuraciones del mismo barrido.
- Docencia y divulgación: ejemplo didáctico de cómo se entrena un transformer ralo y de qué esperar de la dispersión agresiva en modelos pequeños.
- Reproducción de resultados de Gao et al. (2025): validar el procedimiento de dispersión firmada sobre un dataset público y tokenizador abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0.5 GB, por lo que el checkpoint cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB o superior) e incluso en CPU para inferencia.
- VRAM estimada para inferencia en fp32: en torno a 0.5 GB de pesos más activaciones; en fp16/bf16 se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para entrenamiento o experimentos de probing se recomienda RTX 3090/4090 o A100.
- Despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y la clase `SparseGPT` referenciada en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| scaling_signed_dcp_d1536_L2_t125000000_s1_mlpsigned_strong5 | no disponible (d=1536, 2 capas) | 512 | no disponible | Hugging Face |
| Modelos de la familia SimpleStories (p. ej. SimpleStories-1.25M) | ~1.25 M (tokenizador asociado) | no disponible | no disponible | Hugging Face |
| Transformers pequeños de investigación con dispersión (Gao et al., 2025) | variable | variable | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas reales de generación.
- Vocabulario muy reducido (4096 tokens) y contexto corto (512 tokens), lo que limita severamente cualquier aplicación práctica.
- Entrenado exclusivamente sobre SimpleStories, un dataset sintético de relatos; el dominio y la distribución son muy estrechos.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- No se documentan sesgos; al entrenarse sobre datos sintéticos, los sesgos reflejarán el generador de SimpleStories.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- No se documenta compatibilidad con herramientas estándar de inferencia (vLLM, llama.cpp, etc.), lo que dificulta su despliegue.
- El recuento exacto de parámetros no se publica; cualquier estimación debe tratarse como aproximada.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d1536_L2_t125000000_s1_mlpsigned_strong5
- W&B run: https://wandb.ai/asher577/scd_scaling/runs/zfckw94x
- Dataset: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia: Gao et al. (2025) — procedimiento de dispersión firmada (paper no enlazado en la model card)
