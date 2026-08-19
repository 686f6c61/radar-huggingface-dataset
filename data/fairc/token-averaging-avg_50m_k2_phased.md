# FAIRC/token-averaging-avg_50m_k2_phased

## Resumen

FAIRC/token-averaging-avg_50m_k2_phased es un checkpoint de investigación publicado por la organización FAIRC dentro del proyecto "token averaging". Se trata de un volcado de pesos (state_dict) de un modelo de lenguaje pequeño, de aproximadamente 50,9 millones de parámetros, entrenado con 2 mil millones de tokens. El objetivo del proyecto es estudiar una técnica de promediado de tokens (token averaging) con un factor k=2, que consiste en promediar representaciones de tokens adyacentes durante el entrenamiento para mejorar la eficiencia o la calidad del modelo.

El modelo no está pensado para uso en producción: no sigue el formato de Hugging Face Transformers, no tiene licencia declarada y carece de documentación sobre capacidades o benchmarks. Su valor reside en ser un artefacto reproducible para la comunidad investigadora que quiera analizar el efecto del token averaging en modelos pequeños. Con una arquitectura de 8 capas, 8 cabezas de atención y dimensión de modelo 512, es comparable en tamaño a modelos como GPT-2 small (124M) pero con una ventana de contexto reducida de 1024 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMAveraged / OLMTransformerBody) |
| Parametros totales | 50.897.408 (aprox. 50,9M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state_dict crudo en PyTorch (.pt), no compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con 8 capas, 8 cabezas de atención, dimensión de modelo 512 y embeddings atados (tie_embeddings=true). La innovación principal es la técnica de "token averaging" con k=2, que consiste en promediar las representaciones de pares de tokens consecutivos antes de pasarlas por las capas de atención. Esta técnica busca reducir el coste computacional o mejorar la regularización durante el entrenamiento, aunque no se especifican los detalles formales en la documentación.

El entrenamiento se realizó con 2 mil millones de tokens (target_tokens: 2000000000), una tasa de aprendizaje de 0.0002 y 2000 pasos de warmup. No se indica el dataset utilizado, ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint final se guarda en `checkpoints/final.pt` junto con logs de pérdida (`loss_log.csv` y `loss_log_30%.csv`). Para cargar los pesos es necesario reconstruir la arquitectura desde `config.json` → `model_config` o desde `experiments/chinchilla/model_configs.py` del repositorio fuente.

## Capacidades

No se ha publicado información sobre las capacidades concretas del modelo. Al ser un checkpoint de investigación sin evaluación documentada, no es posible confirmar si genera texto coherente, razona, escribe código o realiza otras tareas típicas de los modelos de lenguaje. La arquitectura sugiere que podría generar texto, pero no hay evidencia empírica disponible.

- Generación de texto: no verificado.
- Razonamiento: no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking o capacidades especiales: no disponible.

## Casos de uso

Al tratarse de un artefacto de investigación, los casos de uso son fundamentalmente académicos y experimentales:

- Reproducción de experimentos: los investigadores pueden descargar el checkpoint y los logs de pérdida para reproducir los resultados del proyecto token averaging y verificar la metodología.
- Análisis del efecto del token averaging: comparar este modelo (k=2, phased) con otros checkpoints del mismo proyecto (k=4, wexp) para estudiar cómo varía la pérdida y el comportamiento según el factor de promediado.
- Desarrollo de técnicas de regularización: el token averaging podría inspirar nuevas variantes de regularización o eficiencia en modelos pequeños, y este checkpoint sirve como base para experimentos de ablatión.
- Estudio de escalado en modelos pequeños: con 50M de parámetros y 2B tokens de entrenamiento, es un punto de referencia para investigar leyes de escalado en el régimen de chinchilla.
- Formación en cargas de checkpoints personalizadas: el formato state_dict crudo obliga a reconstruir la arquitectura manualmente, lo que puede servir como ejercicio didáctico para estudiantes de deep learning.
- Integración en pipelines de investigación propios: si un grupo desarrolla su propia implementación de OLMAveraged, puede cargar estos pesos para inicializar o comparar modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar.

## Requisitos de hardware

Con solo 50 millones de parámetros, el modelo es extremadamente ligero:

- VRAM estimada: menos de 1 GB en FP32 (aprox. 200 MB de pesos). Cualquier GPU moderna con más de 2 GB de VRAM puede ejecutarlo sin problemas.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, etc.) o incluso CPU. No requiere hardware especializado.
- Cabe en consumer GPU: sí, en todas las GPU de los últimos años.
- Opciones de despliegue: al no ser un modelo transformers estándar, no se puede usar directamente con vLLM, Ollama o TGI. Requiere una implementación personalizada del modelo OLMAveraged. Para experimentos rápidos se puede cargar en PyTorch y ejecutar inferencia en CPU.
- Latencia y throughput: no disponibles, pero dado el tamaño, la generación de tokens debería ser de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No hay modelos comparables directamente porque el token averaging es una técnica de investigación no comercializada. Los checkpoints hermanos del mismo proyecto son los más cercanos:

| Modelo | Parámetros | Contexto | k | Estado |
|---|---|---|---|---|
| FAIRC/token-averaging-avg_50m_k2_phased | 50,9M | 1024 | 2 (phased) | Checkpoint de investigación |
| FAIRC/token-averaging-avg_50m_k4 | 50,9M (aprox.) | 1024 | 4 | Checkpoint de investigación |
| FAIRC/token-averaging-avg_50m_k2_wexp | 50,9M (aprox.) | 1024 | 2 (wexp) | Checkpoint de investigación |

Como referencia de tamaño, GPT-2 small (124M) es más del doble de grande y tiene una licencia MIT, pero no usa token averaging. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo de investigación, no listo para producción: es un dump de pesos sin API, sin tokenizador incluido y sin integración con frameworks estándar.
- Licencia no declarada: no se puede determinar si es de uso comercial o restringido. Se recomienda contactar con FAIRC antes de cualquier uso.
- Sin evaluación de sesgos ni seguridad: no hay estudios de sesgos, toxicidad o alucinaciones. No debe usarse en aplicaciones con usuarios reales.
- Formato de pesos incompatible: los pesos están en un state_dict de PyTorch que requiere reconstruir la arquitectura manualmente. No funciona con `transformers` ni con herramientas de inferencia habituales.
- Contexto limitado: 1024 tokens es una ventana corta para tareas que requieran contexto largo.
- Idiomas desconocidos: no se especifica qué idiomas soporta, probablemente inglés por el origen del proyecto, pero no está confirmado.
- Sin garantías de reproducibilidad: los logs de pérdida están disponibles, pero no se indica el dataset de entrenamiento ni la configuración exacta del hardware.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_phased
- Checkpoint hermano k=4: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Checkpoint hermano wexp: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp
