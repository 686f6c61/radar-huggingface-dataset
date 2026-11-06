# cyttic/hmt-trocrscratchreg-elastic3-s42

## Resumen

`cyttic/hmt-trocrscratchreg-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic, publicado en Hugging Face bajo licencia MIT. Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se comparan distintas estrategias de aumentación sobre una arquitectura TrOCR entrenada desde cero. La variante que nos ocupa corresponde a la aumentación `elastic3` con semilla 42.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`), empleando un esquema de decodificación CTC y una evaluación en modo *greedy* sin modelo de lenguaje externo. Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación más que a despliegue en producción a gran escala.

Su relevancia es fundamentalmente metodológica: sirve como punto de referencia reproducible para estudiar cómo distintas políticas de aumentación afectan a las métricas de reconocimiento (CER y WER) y a su transferencia entre conjuntos. No obstante, sus métricas absolutas (CER 0,3474 y WER 0,9310) indican un rendimiento limitado, por lo que debe interpretarse como una pieza de un experimento comparativo y no como un sistema HTR listo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (Transformer encoder-decoder para reconocimiento de texto), entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres sobre imágenes de texto, en este caso entrenado *from scratch* (el sufijo `scratch` en el nombre lo indica) en lugar de partir de un checkpoint preentrenado. La decodificación se realiza mediante CTC en modo *greedy* y sin modelo de lenguaje, según se especifica en la model card.

El entrenamiento se llevó a cabo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) que componen el conjunto de desarrollo. La variante `elastic3` hace referencia a una política de aumentación de datos de tipo *elastic* (deformaciones elásticas de la imagen), aplicada con semilla 42. El autor remite a un fichero `results.json` para los detalles completos del experimento, que no se incluye en la información disponible. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes de líneas de texto en hebreo.
- Decodificación CTC en modo *greedy* sin modelo de lenguaje externo.
- Entrenamiento desde cero, lo que permite estudiar el efecto aislado de la aumentación sin sesgo de un preentrenamiento previo.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad monolingüe: únicamente hebreo.
- No se documentan capacidades multilingües ni de traducción.

## Casos de uso

- Investigación sobre aumentación de datos en HTR: el modelo sirve como checkpoint de referencia para comparar la política `elastic3` frente a otras variantes del estudio `htr-metrics-transfer`, permitiendo aislar el efecto de las deformaciones elásticas en el CER y el WER.
- Reproducibilidad de experimentos: al fijar la semilla 42 y publicar los pesos, permite replicar exactamente los resultados reportados por el autor y verificar la transferencia de métricas entre splits.
- Estudio de transferencia de métricas: útil para analizar cómo se comportan las métricas de un modelo entrenado sin ciertos escritores (dev writers excluidos) al evaluarse sobre el conjunto de test Option-B.
- Línea base para arquitecturas TrOCR en hebreo: puede emplearse como punto de partida o comparación en trabajos que exploren reconocimiento de manuscrito hebreo con transformers.
- Análisis de errores en HTR de bajo rendimiento: con un WER de 0,9310, resulta adecuado para estudiar patrones de fallo y diseñar estrategias de post-procesado o modelos de lenguaje de rescate.
- Docencia y experimentación académica: su tamaño reducido (0,1 GB, 22,4 M de parámetros) facilita su carga y ejecución en entornos con recursos limitados para prácticas de HTR.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del conjunto de test HHD Option-B, con decodificación *greedy* y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,3474 |
| WER (Word Error Rate) | 0,9310 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares dentro del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (22,4 M de parámetros equivalen a unos 90 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un checkpoint TrOCR en safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje, no a HTR).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER / WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-elastic3-s42 | 22,4 M | no disponible | 0,3474 / 0,9310 | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |
| TrOCR base (Microsoft) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparación con otras variantes del mismo estudio requeriría consultar el `results.json` referenciado por el autor.

## Limitaciones y advertencias

- Rendimiento limitado: un WER de 0,9310 implica que la gran mayoría de palabras se transcriben incorrectamente en el conjunto de test, lo que desaconseja su uso en producción sin un modelo de lenguaje de rescate o post-procesado.
- Monolingüe: solo soporta hebreo; no se ha validado en otros idiomas ni en escritura impresa.
- Entrenado desde cero: al no partir de un checkpoint preentrenado, su capacidad de generalización es menor que la de variantes TrOCR preentrenadas.
- Sesgos de dataset: entrenado sobre `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, por lo que puede presentar sesgo hacia los estilos de escritura presentes en entrenamiento y degradarse con escritores no vistos.
- Riesgo de alucinación: en HTR, la decodificación CTC sin modelo de lenguaje puede producir caracteres espurios o suprimir trazos; no se documenta ninguna mitigación.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, el bajo rendimiento hace inviable su uso comercial directo.
- Caveat para producción: la model card remite a `results.json` para los detalles del experimento, fichero que no está incluido en la información disponible; conviene consultarlo antes de reutilizar el modelo.
- Contexto y cuantizaciones no documentados: no se especifican la longitud de contexto de imagen ni variantes cuantizadas, lo que limita la planificación de despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-elastic3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Estudio de referencia: `htr-metrics-transfer` (resultados en `results.json`, no incluido en la información disponible)
- Repositorio del autor: https://huggingface.co/cyttic
