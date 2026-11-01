# cyttic/hmt-trocrsmall-elastic1-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-elastic1-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un estudio de aumentación de datos dentro del proyecto htr-metrics-transfer: la variante `trocrsmall` del modelo se ha entrenado con la estrategia de aumentación `elastic1` y la semilla 42, con el objetivo de medir la transferencia de métricas entre configuraciones de entrenamiento.

El modelo emplea una arquitectura CTC (*Connectionist Temporal Classification*) para el reconocimiento de secuencias, orientada a la transcripción de imágenes de texto manuscrito. Con 22.421.004 parámetros totales, es un modelo compacto pensado para experimentación controlada más que para despliegue de producción a gran escala.

Su relevancia es acotada y de carácter metodológico: forma parte de una familia de experimentos (variantes de aumentación y semillas) cuyo propósito es analizar cómo afectan las técnicas de aumentación a las métricas de reconocimiento. El idioma de trabajo es el hebreo (`he`), lo que lo sitúa en un nicho específico dentro del HTR multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) para HTR |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en CTC, un esquema de entrenamiento para reconocimiento de secuencias que alinea directamente la salida del modelo con la transcripción objetivo sin necesidad de segmentación previa a nivel de carácter. El modelo se denomina `trocrsmall`, lo que sugiere una variante compacta dentro de la familia de modelos del proyecto.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*), con la aumentación `elastic1` y la semilla 42. La decodificación empleada en la evaluación es *greedy*, sin modelo de lenguaje (*no LM*). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de RLHF o DPO, que en un modelo HTR no resultan aplicables de forma estándar.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Transcripción de secuencias mediante decodificación CTC.
- Alineación directa imagen-secuencia sin segmentación explícita de caracteres.
- Evaluación con decodificación greedy sin modelo de lenguaje externo.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del hebreo.
- No se ha documentado capacidad de visión general (solo HTR), audio ni modo *thinking*.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos escritos a mano, aprovechando su entrenamiento específico en este idioma.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación frente a otras variantes de aumentación y semillas del mismo proyecto, permitiendo medir el impacto de `elastic1` en CER y WER.
- Reproducibilidad de experimentos: al fijar la semilla 42 y documentar la partición de entrenamiento, permite replicar los resultados de CER 0.1899 y WER 0.6688.
- Prototipado de pipelines de reconocimiento de escritura: su tamaño reducido (22,4 M de parámetros) facilita la integración en entornos de experimentación con recursos limitados.
- Evaluación de estrategias de decodificación: al publicarse resultados con decodificación greedy sin LM, puede usarse como línea base para comparar con decodificación asistida por modelo de lenguaje.
- Análisis de transferencia de métricas: forma parte del estudio htr-metrics-transfer, por lo que es útil para investigar cómo se transfieren las métricas entre configuraciones de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0.1899 |
| WER (Word Error Rate) | 0.6688 |
| Conjunto de evaluacion | HHD Option-B test |
| Decodificacion | Greedy, sin modelo de lenguaje |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) al tratarse de una tarea de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M de parámetros en safetensors, el modelo es muy ligero y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es más que suficiente; incluso CPU puede ser viable para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: no se documentan en la model card; al usar safetensors podría integrarse con frameworks de inferencia estándar, aunque no se especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye referencias a alternativas de la misma categoría (HTR en hebreo o CTC para escritura manuscrita), por lo que la comparativa se considera no disponible.

## Limitaciones y advertencias

- El WER de 0.6688 es elevado, lo que indica una tasa de error por palabra considerable en la evaluación reportada; debe tenerse en cuenta antes de usar el modelo en producción.
- El CER de 0.1899 implica que aproximadamente uno de cada cinco caracteres se transcribe incorrectamente en el conjunto de test.
- El modelo está entrenado exclusivamente para hebreo; no se ha documentado soporte para otros idiomas.
- Al ser un estudio de aumentación con una semilla concreta, los resultados pueden no generalizar a otras particiones o dominios.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de escritores, puede presentar peor rendimiento con estilos de escritura no representados.
- Riesgo de alucinación inherente a los sistemas CTC en secuencias ambiguas; no se ha evaluado con modelo de lenguaje que mitigue este efecto.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento y sus posibles restricciones debe verificarse antes de un uso comercial.
- No se especifican requisitos de preprocesado de imagen ni formato de entrada, lo que dificulta su integración directa en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-elastic1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados detallados: `results.json` (referenciado en la model card, sin URL directa disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
