# mradermacher/Tencent-Hy-30B-A3B-uncensored-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Tencent-Hy-30B-A3B-uncensored-heretic`, una variante sin censura del modelo Hy-MT2-30B-A3B desarrollado por Tencent. Hy-MT2 es una familia de modelos de traducción multilingüe de tipo MoE (Mixture of Experts) con 30.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñados para escenarios reales complejos con soporte de 33 idiomas. La versión "uncensored-heretic" elimina los filtros de seguridad habituales, lo que la hace adecuada para entornos de investigación donde se requiere generación sin restricciones, aunque con los riesgos asociados.

El repositorio, creado por el equipo mradermacher, ofrece múltiples niveles de cuantización (desde f16 hasta Q2_K) en formato GGUF, lo que permite desplegar el modelo en una amplia gama de hardware, desde GPUs de consumo hasta entornos de producción. Al ser una cuantización estática del modelo original, mantiene las capacidades de traducción y conversación del modelo base, pero con un tamaño reducido y requisitos de memoria más bajos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | 3B (según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | 33 idiomas (según documentación del modelo base) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un transformer con arquitectura MoE, donde cada token activa únicamente 3.000 millones de parámetros de un total de 30.000 millones. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, reduciendo la latencia y el coste de inferencia en comparación con un modelo denso del mismo tamaño. El entrenamiento se centró en tareas de traducción multilingüe entre 33 idiomas, con capacidad para seguir instrucciones de traducción en múltiples lenguas.

La variante "uncensored-heretic" es un fine-tuning posterior que elimina los mecanismos de rechazo y moderación de contenido del modelo original. No se dispone de información detallada sobre el proceso de entrenamiento de esta variante, ni sobre el dataset utilizado. La cuantización GGUF se realizó mediante conversión estática de los pesos originales, sin reentrenamiento, preservando las capacidades del modelo base.

## Capacidades

- Traducción multilingüe entre 33 idiomas, con seguimiento de instrucciones de traducción en varios idiomas.
- Generación de texto conversacional, apta para diálogos multi-turno.
- Generación de contenido sin censura, al ser una variante "uncensored" (sin filtros de seguridad).
- Eficiencia computacional gracias a la arquitectura MoE con 3B parámetros activos.
- Soporte de cuantización GGUF para despliegue en hardware variado.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Traducción automática de documentos técnicos: el modelo puede traducir entre 33 idiomas con alta fidelidad, siendo útil para localizar manuales, informes o contenido web en entornos empresariales.
- Atención al cliente multilingüe: su capacidad conversacional permite integrarlo en chatbots que respondan en el idioma del usuario, gestionando consultas en varios idiomas sin necesidad de modelos separados.
- Investigación en procesamiento de lenguaje natural: al ser una variante sin censura, permite estudiar el comportamiento del modelo sin restricciones de seguridad, útil para análisis de sesgos o generación de contenido extremo.
- Generación de contenido creativo sin filtros: para proyectos que requieren textos sin moderación, como escritura de ficción o guiones, donde la ausencia de censura puede ser deseable.
- Desarrollo de sistemas de traducción en tiempo real: gracias a su eficiencia MoE, puede desplegarse en servidores con GPUs de gama media para ofrecer traducción de baja latencia en aplicaciones de mensajería o videoconferencia.
- Evaluación de técnicas de cuantización: al disponer de múltiples niveles de cuantización, sirve como banco de pruebas para medir el impacto de la precisión en la calidad de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de traducción (BLEU, COMET) para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantización. Para Q4_K_M (aproximadamente 17 GB), se requiere una GPU con al menos 20 GB de VRAM. Para Q2_K (aproximadamente 10 GB), puede caber en GPUs de 12-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 o superiores; A100 (40/80 GB) para f16 o Q8_0 sin problemas de memoria.
- En consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 24 GB (RTX 3090/4090) o incluso 16 GB (RTX 4080) con Q3.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (si se convierte a safetensors), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser MoE con 3B activos, la inferencia es significativamente más rápida que un modelo denso de 30B, estimándose una velocidad de 20-40 tokens/s en una RTX 4090 con Q4, aunque estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tencent-Hy-30B-A3B (este) | 30B total, 3B activos | no disponible | 33 | no disponible | GGUF |
| NLLB-200-3.3B | 3.3B denso | 512 | 200 | CC-BY-NC | safetensors |
| M2M-100-12B | 12B denso | 1024 | 100 | MIT | safetensors |
| Mixtral-8x7B | 47B total, 13B activos | 32k | multilingüe | Apache 2.0 | GGUF, safetensors |

La comparativa es orientativa: Hy-MT2 se centra en traducción, mientras que Mixtral es un modelo generalista. NLLB y M2M son específicos de traducción pero con arquitectura densa. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Al ser una variante "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe usarse en entornos de producción sin supervisión humana.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado con datos multilingües, puede presentar sesgos culturales o lingüísticos.
- Riesgo de alucinación en traducciones: como cualquier modelo de lenguaje, puede producir traducciones incorrectas o inventadas, especialmente en idiomas con pocos recursos.
- Licencia no disponible: el uso comercial puede estar restringido. Se recomienda contactar con el autor original (Tencent) para aclarar los términos.
- Longitud de contexto no especificada: puede ser limitada, lo que afecta a tareas que requieren documentos largos.
- La cuantización puede degradar la calidad de traducción, especialmente en niveles bajos como Q2_K.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Tencent-Hy-30B-A3B-uncensored-heretic-GGUF
- Modelo original (sin cuantizar): https://huggingface.co/0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic
- GitHub de Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Paper de Hy-MT2 (arXiv): https://arxiv.org/html/2605.22064v1
- Perfil del autor mradermacher: https://huggingface.co/mradermacher
