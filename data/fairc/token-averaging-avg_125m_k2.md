# FAIRC/token-averaging-avg_125m_k2

## Resumen

FAIRC/token-averaging-avg_125m_k2 es un checkpoint de investigación publicado por FAIRC, un grupo de investigación centrado en analizar si promediar tokens adyacentes en un modelo de lenguaje puede reducir el coste computacional respecto a un entrenamiento estándar. El modelo es un transformer de 125 millones de parámetros con una ventana de contexto de 1024 tokens y una técnica de "averaging" con k=2, que consiste en combinar pares de tokens consecutivos para reducir la secuencia efectiva procesada.

Este checkpoint no es un modelo listo para producción ni para uso directo con la librería `transformers` de Hugging Face; se trata de un volcado de pesos en formato `state_dict` de PyTorch, pensado para ser cargado con la arquitectura OLMAveraged/OLMTransformerBody definida en el código fuente del proyecto. Su relevancia es puramente académica: sirve para reproducir experimentos sobre eficiencia computacional en el entrenamiento de modelos de lenguaje, un área activa de investigación en 2025-2026.

La publicación incluye dos checkpoints (final y paso 50.000), un log de pérdidas y la configuración exacta del modelo. No se proporcionan datos de rendimiento, licencia ni idiomas soportados, lo que limita su uso a entornos de investigación con acceso al código fuente del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con token averaging (k=2) |
| Parametros totales | 123.532.032 (aproximado, según config) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en fp32/fp16, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch (`final.pt`, `step_00050000.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estándar de 12 capas, 12 cabezas de atención y dimensión de modelo 768, con embeddings atados (`tie_embeddings: true`). La innovación principal es la técnica de *token averaging*: en lugar de procesar cada token de forma independiente, el modelo promedia pares de tokens adyacentes (k=2) antes de pasarlos por las capas transformer, reduciendo así la longitud de secuencia efectiva y, potencialmente, el coste computacional. El objetivo declarado del proyecto es investigar si esta reducción de cómputo mantiene la calidad del modelo respecto a un entrenamiento convencional.

El entrenamiento se configuró con una tasa de aprendizaje de 0.00016, 2000 pasos de warmup y un objetivo de 5.000 millones de tokens. El checkpoint final corresponde al paso 50.000, con un registro de pérdidas disponible en `loss_log.csv`. No se especifica la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; la información disponible sugiere que se trata de un preentrenamiento puramente autoregresivo.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de 125M parámetros preentrenado.
- Investigación sobre eficiencia computacional: permite estudiar el impacto del promediado de tokens en la pérdida y en el coste de entrenamiento.
- Carga y reanudación de experimentos: los checkpoints incluyen el paso, los tokens vistos y los FLOPs acumulados, lo que facilita la reproducibilidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint permite replicar los resultados del proyecto token averaging y comparar la curva de pérdida con modelos baseline de tamaño similar.
- Investigación en eficiencia de entrenamiento: sirve como punto de partida para estudiar cómo el promediado de tokens afecta a la convergencia y al coste computacional en modelos pequeños.
- Desarrollo de arquitecturas alternativas: el código de carga (OLMAveraged/OLMTransformerBody) puede adaptarse para probar variantes con diferentes valores de k o configuraciones de contexto.
- Benchmarking de infraestructura: al ser un modelo pequeño, puede usarse para medir el rendimiento de GPUs o frameworks de entrenamiento distribuido en tareas de preentrenamiento.
- Docencia e investigación formativa: útil para estudiantes que quieran entender el impacto de técnicas de reducción de secuencia en transformers.
- Exploración de escalado: los resultados de este modelo de 125M pueden contrastarse con los del checkpoint de 250M (`avg_250m_k2`) para analizar tendencias de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares. El único dato de rendimiento es el log de pérdidas (`loss_log.csv`), que no se ha analizado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 125M parámetros, cabe en cualquier GPU con al menos 2-4 GB de VRAM en fp32 (aproximadamente 500 MB de pesos). En fp16, unos 250 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas tarjetas de consumo como RTX 3060, RTX 4060 o superiores. No requiere hardware especializado.
- Despliegue: no es un modelo para servir en producción; el formato de pesos no es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa y sin el código de arquitectura personalizado.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, la inferencia sería muy rápida en cualquier GPU actual, pero el objetivo del proyecto no es la inferencia sino el entrenamiento eficiente.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a una línea de investigación específica (token averaging) y no se han publicado benchmarks frente a modelos estándar de 125M como GPT-2 small o Pythia-125M. La comparación requeriría ejecutar los mismos experimentos con el código del proyecto, lo que está fuera del alcance de esta ficha. Se recomienda consultar el repositorio fuente de FAIRC para posibles análisis comparativos.

## Limitaciones y advertencias

- No es un modelo listo para uso comercial ni para producción: carece de licencia declarada y de formato compatible con los ecosistemas estándar.
- No se han documentado sesgos ni riesgos de alucinación; al ser un modelo de investigación sin alineación, es probable que presente comportamientos indeseados si se usa fuera de un entorno controlado.
- La ventana de contexto de 1024 tokens es limitada para tareas que requieran contexto largo.
- El formato de pesos (state_dict de PyTorch) no es directamente cargable con `transformers`; requiere reconstruir la arquitectura desde `config.json` o desde el código fuente.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento, por lo que el rendimiento multilingüe es desconocido.
- El proyecto parece estar en fase de investigación; los resultados pueden no ser reproducibles sin acceso al código fuente completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_125m_k2
- Perfil de FAIRC en Hugging Face: https://huggingface.co/FAIRC
- Checkpoint hermano (250M): https://huggingface.co/FAIRC/token-averaging-avg_250m_k2
