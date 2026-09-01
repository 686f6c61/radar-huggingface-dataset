# Minguinho-zeze/dialect-penalty-t2i-guardrail-groupdro

## Resumen

El modelo `Minguinho-zeze/dialect-penalty-t2i-guardrail-groupdro` es un clasificador de secuencias basado en DistilBERT, fine-tuneado con la técnica **online GroupDRO** para mitigar la penalización por dialecto en filtros de seguridad de generación texto-imagen (T2I). Desarrollado por Minguinho-zeze como artefacto de reproducción del estudio "Not Safe for All: Auditing the Dialect Penalty in Text-to-Image Safety Guardrails" (arXiv:2608.29589), el modelo clasifica prompts T2I como seguros (SFW) o no seguros (NSFW) con especial atención a la equidad entre dialectos del inglés.

El problema que aborda es que los filtros de seguridad T2I tienden a activarse por características lingüísticas superficiales (como el dialecto) en lugar de por el contenido semántico real, lo que provoca un sesgo sistemático contra hablantes de dialectos no estándar. Este checkpoint, entrenado con GroupDRO sobre 12 grupos (2 etiquetas × 6 dialectos), consigue una precisión media del 100% y una precisión de peor grupo del 99,95% en el conjunto de validación interna, eliminando prácticamente la diferencia de tasas de falsos positivos entre dialectos.

Con 66,9 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo ligero y reproducible, pero **no es un filtro NSFW desplegable**: está diseñado exclusivamente para reproducir las mediciones del paper, donde todos los inputs comparten un estilo de prompt muy concreto. Fuera de ese estilo, el modelo clasifica casi cualquier texto como NSFW con probabilidad cercana a 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base uncased (encoder transformer) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (según el código de uso proporcionado) |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32) |
| Idiomas soportados | Inglés (incluye dialectos no estándar del inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased` y se fine-tunea para clasificación de secuencias binaria (SFW/NSFW). La innovación principal es el uso de **online GroupDRO** (Group Distributionally Robust Optimization) en lugar de ERM estándar. El entrenamiento agrupa los datos en 12 grupos definidos por la combinación de etiqueta (benigno/no seguro) y dialecto (6 variantes del inglés), y optimiza un objetivo que pondera el peor grupo, forzando al modelo a no sacrificar el rendimiento en ningún dialecto.

El dataset de entrenamiento consiste en prompts emparejados de inglés americano estándar (SAE) y dialectos, con 240 prompts benignos y 222 no seguros, cada uno renderizado en 6 dialectos. Según el paper, el conjunto completo de evaluación contiene 23.080 prompts emparejados en cinco dialectos ingleses. El entrenamiento se realizó con 10 semillas; este checkpoint corresponde a la semilla 0 con un ratio SAE del 97,5%. No se menciona el uso de RLHF ni DPO; el método es puramente de clasificación supervisada con el objetivo de robustez de grupo.

## Capacidades

- Clasificación binaria de prompts T2I como SFW o NSFW, con salida de probabilidades mediante softmax.
- Robustez frente a variaciones dialectales del inglés: el modelo mantiene una precisión de peor grupo del 99,95% y una diferencia de tasa de falsos positivos (|ΔFPR|) de 0,00 puntos porcentuales en el split interno.
- Reproducibilidad: 9 de las 10 semillas de entrenamiento obtienen exactamente 1,0 de precisión media y 1,0 de precisión de peor grupo; la semilla 0 es el resultado modal, no una selección sesgada.
- Integración sencilla con la API de Hugging Face Transformers (`AutoModelForSequenceClassification`).
- No soporta tool calling, agentes, visión ni modos de razonamiento; es un clasificador de texto puro.

## Casos de uso

- **Reproducción de experimentos académicos**: el uso principal es replicar la Tabla 8 del paper, midiendo la penalización por dialecto en filtros de seguridad T2I. Se carga con `AutoModelForSequenceClassification` y se evalúa sobre prompts con el estilo del paper.
- **Investigación en equidad y sesgo algorítmico**: sirve como punto de comparación para estudiar cómo el entrenamiento con GroupDRO reduce las disparidades entre grupos lingüísticos en clasificadores de seguridad.
- **Evaluación de técnicas de mitigación**: permite comparar el rendimiento de GroupDRO frente a ERM y ERM con muestreo balanceado, usando los checkpoints compañeros publicados por el mismo autor.
- **Análisis de robustez de clasificadores de texto**: el modelo puede usarse para demostrar cómo un clasificador puede depender de señales superficiales (como el sufijo de tags de Stable Diffusion) en lugar de comprender el contenido semántico.
- **Docencia y formación en GroupDRO**: al ser un modelo pequeño y con código de entrenamiento disponible, es un ejemplo didáctico para enseñar optimización robusta por grupos en clasificación de texto.
- **Desarrollo de guardrails más equitativos**: aunque este checkpoint no es desplegable, sus resultados informan el diseño de futuros filtros de seguridad que tengan en cuenta la diversidad dialectal.

## Benchmarks y rendimiento

El paper reporta resultados en el split interno (media ± desviación estándar sobre 10 semillas). Para el ratio SAE del 97,5%, los resultados son:

| Algoritmo | Precisión media (%) | Peor grupo (%) | \|ΔTPR\| (pp) | \|ΔFPR\| (pp) |
|---|---|---|---|---|
| ERM | 99,91 ± 0,14 | 99,12 ± 1,48 | 0,01 ± 0,03 | 0,19 ± 0,33 |
| ERM + bal. sampling | 99,99 ± 0,01 | 99,91 ± 0,17 | 0,01 ± 0,03 | 0,01 ± 0,02 |
| **GroupDRO (este checkpoint)** | **100,00 ± 0,01** | **99,95 ± 0,14** | **0,01 ± 0,03** | **0,00 ± 0,00** |

El checkpoint concreto (semilla 0) obtiene exactamente 1,0 de precisión media y 0,9955 de peor grupo (según la model card, la semilla 3 obtiene 0,99964/0,9955). No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo está especializado en esta tarea concreta.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 66,9 millones de parámetros, en FP32 ocupa aproximadamente 268 MB. Con batch de 1 y secuencias de hasta 512 tokens, cabe en cualquier GPU con 1-2 GB de VRAM. En FP16, el uso se reduce a la mitad.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1650, RTX 2060 o superiores. También es viable en CPU para inferencia por lotes pequeños.
- **Compatibilidad con consumer GPU**: sí, sin restricciones. Incluso en Raspberry Pi o entornos sin GPU se puede ejecutar con `transformers` en CPU.
- **Opciones de despliegue**: al ser un modelo estándar de Transformers, se puede servir con `pipeline` de Hugging Face, o mediante servidores de inferencia como vLLM, TGI u Ollama, aunque no se mencionan en la documentación. Para reproducción, el código de ejemplo usa `torch.no_grad()` directamente.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una GPU moderna, la inferencia de una secuencia de 512 tokens debería completarse en milisegundos; en CPU, en decenas de milisegundos.

## Comparativa con modelos similares

No existen modelos comerciales comparables en el mercado, ya que este checkpoint es un artefacto de investigación específico para el estudio de penalización dialectal. Las alternativas más cercanas son los otros checkpoints del mismo estudio:

| Modelo | Algoritmo | Precisión media (%) | Peor grupo (%) | \|ΔFPR\| (pp) |
|---|---|---|---|---|
| `dialect-penalty-t2i-guardrail-groupdro` (este) | GroupDRO | 100,00 | 99,95 | 0,00 |
| `dialect-penalty-t2i-guardrail-erm-balsampling` | ERM + bal. sampling | 99,99 | 99,91 | 0,01 |
| `distilbert-base-uncased` (sin fine-tune) | - | No disponible | No disponible | No disponible |

El modelo base sin fine-tune no es un clasificador de seguridad, por lo que no es directamente comparable. La comparativa con ERM y ERM + bal. sampling muestra que GroupDRO ofrece la mejor precisión de peor grupo y la menor diferencia de FPR, aunque las diferencias son pequeñas en este conjunto de datos.

## Limitaciones y advertencias

- **No es un filtro NSFW desplegable**: la model card advierte explícitamente que es un artefacto de reproducción, no un producto de producción. Cualquier input fuera del estilo de prompt del paper se clasifica como NSFW con probabilidad cercana a 1.
- **Dependencia de señales superficiales**: el modelo se apoya en el sufijo de tags característico de Stable Diffusion (p. ej., "studio food photography, soft diffused lighting, 50mm lens, f/2.8, 8k"). Si se elimina ese sufijo, un prompt benigno pasa de P(NSFW)=0,0001 a P(NSFW)=0,9999.
- **Falsos positivos extremos**: frases cotidianas como "A child playing with a puppy" se clasifican como NSFW con probabilidad 0,9999. Esto lo inutiliza para cualquier uso general.
- **Alcance lingüístico limitado**: solo soporta inglés (aunque incluye dialectos). No hay soporte para otros idiomas.
- **Riesgo de sesgo**: aunque el entrenamiento con GroupDRO reduce la penalización dialectal en el dominio de prompts T2I, el modelo puede tener sesgos no medidos fuera de ese dominio.
- **Licencia**: Apache-2.0 permite uso comercial, pero dado el comportamiento del modelo, cualquier uso en producción sería inapropiado y potencialmente dañino.
- **Sin garantías de rendimiento**: los resultados reportados son sobre el split interno del estudio; no hay evaluación en datos externos.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/Minguinho-zeze/dialect-penalty-t2i-guardrail-groupdro)
- [Paper en arXiv](https://arxiv.org/abs/2608.29589)
- [Dataset en HuggingFace](https://huggingface.co/datasets/Minguinho-zeze/dialect-penalty-t2i)
- [Código oficial en GitHub](https://github.com/minguinho26/dialect-penalty-t2i)
- [Checkpoint compañero (ERM + bal. sampling)](https://huggingface.co/Minguinho-zeze/dialect-penalty-t2i-guardrail-erm-balsampling)
