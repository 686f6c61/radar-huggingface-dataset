# jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el usuario jsaizant (sin organización de respaldo visible en Hugging Face). Se trata de un experimento de investigación centrado en el efecto del filtrado de datos sobre el rendimiento final: el entrenamiento se ha realizado exclusivamente sobre 100 mil millones de tokens del corpus HPLT 4 en italiano, restringido a documentos que un clasificador denominado Propella-1 etiqueta como "Educational" con nivel "Moderate" o "High".

El modelo resulta relevante en el contexto de la investigación sobre calidad de datos (data-centric AI): la hipótesis subyacente es que filtrar agresivamente por valor educativo mejora la eficiencia de entrenamiento por token, incluso cuando el volumen total es modesto (100B tokens para 0,7B parámetros, una ratio de aproximadamente 143 tokens por parámetro). Es un artefacto de ablación, no un modelo orientado a producción.

La información pública es muy limitada: la model card consta de una única frase y el repositorio (8,9 GB) contiene pesos en safetensors bajo licencia Apache 2.0. No se documentan arquitectura concreta, tokenizador, hiperparámetros ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido por el tamaño y el formato, sin confirmar por el autor) |
| Parametros totales | 0,7B (700 millones, segun la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se ofrecen GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | italiano (codigo `it`); el identificador incluye `ita_Latn` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención o tokenizador). Por el tamaño (0,7B) y el formato de pesos se trata casi con certeza de un transformer decoder-only de tipo GPT, pero el autor no lo confirma en la model card.

Los datos de entrenamiento sí están descritos, aunque de forma telegráfica: 100 mil millones de tokens extraídos de HPLT 4 (el corpus multilingüe de gran escala de HPLT) en italiano, filtrados mediante un clasificador Propella-1 con etiqueta "Educational" igual a "Moderate" o "High". No se documenta el número de épocas, la mezcla final del dataset, la posible inclusión de datos de código o matemáticas, ni si hubo fases de alineación (SFT, RLHF, DPO). El nombre del repositorio (`datamix-0.7B-...-100bt-...`) sugiere que forma parte de una familia de experimentos con distintas mezclas de datos, pero no hay información adicional.

## Capacidades

- Generación de texto en italiano: es la única capacidad confirmada por la model card.
- Modelado de lenguaje autoregresivo estándar (continuación de texto, respuesta a instrucciones no verificada).
- Capacidades multilingües: no disponibles; el entrenamiento se restringe a italiano (`ita_Latn`).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión, audio u otras modalidades: no disponible.
- Alineación conversacional: no documentada; al no indicarse fases de SFT o RLHF, es previsible que el modelo no siga instrucciones de forma fiable.

## Casos de uso

- Investigación sobre filtrado de datos: el modelo sirve como punto de comparación en estudios que miden el impacto de la selección por calidad educativa frente a corpus sin filtrar del mismo tamaño y número de tokens.
- Ablaciones de mezcla de datos en italiano: al estar entrenado exclusivamente con HPLT 4 filtrado, permite aislar el efecto del filtro Propella-1 en tareas downstream italianas.
- Experimentos de escalado de tokens por parámetro: con 100B tokens para 0,7B parámetros, es útil para estudiar curvas de pérdida en regímenes de sobrentrenamiento moderado.
- Generación de texto en italiano en entornos de bajo recurso: 0,7B parámetros permiten inferencia en CPU o GPU de gama baja, adecuado para prototipos internos donde la calidad no sea crítica.
- Base para fine-tuning específico de dominio en italiano: su licencia Apache 2.0 y su tamaño reducido lo hacen manejable para ajuste supervisado en tareas como clasificación de textos o resumen extractivo, siempre que se valide primero su calidad base.
- Estudio de sesgos y calidad lingüística en corpus filtrados: permite analizar qué sesgos introduce un clasificador de "valor educativo" en la distribución final del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 2-4 GB en total según longitud de contexto).
- VRAM estimada en cuantización int8: alrededor de 0,7-1 GB para pesos; en int4, en torno a 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 o superior permite holgura. En entornos de servidor, una A100 o H100 están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversión a GGUF para llama.cpp u Ollama es factible, aunque el autor no publica versiones preconvertidas. vLLM y TGI lo soportarían si la arquitectura es un transformer estándar, pero no está verificado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn | 0,7B | no disponible | italiano | Apache 2.0 | Entrenado desde cero con 100B tokens filtrados de HPLT 4 |
| Gemma 2 2B | 2,6B | 8K | multilingue | Gemma license | Modelo de Google con alineacion; mayor tamano y contexto documentado |
| Qwen2.5 0.5B | 0,5B | 32K | multilingue (incluye italiano) | Apache 2.0 | Alternativa pequena con contexto largo y tool calling |
| SmolLM2 360M | 0,36B | 8K | ingles principalmente | Apache 2.0 | Modelo pequeno de Hugging Face con datos curados |

La comparación es aproximada: el modelo de jsaizant no documenta contexto, tokenizador ni evaluación, por lo que la comparación se limita a tamaño y licencia. Frente a Qwen2.5 0.5B o SmolLM2, el modelo aquí descrito carece de alineación y de benchmarks públicos, lo que reduce su utilidad práctica fuera de investigación.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas italianas equivalentes.
- Model card mínima: no se documentan arquitectura, tokenizador, contexto máximo ni hiperparámetros, lo que dificulta la reproducibilidad.
- Entrenamiento monolingüe en italiano: no se espera competencia en castellano ni en otros idiomas.
- Sin alineación documentada: no consta SFT ni RLHF, por lo que el modelo probablemente no sigue instrucciones y puede generar contenido inapropiado o incoherente en diálogo.
- Riesgo de sesgo del filtro: el clasificador Propella-1 "Educational" puede sobrerrepresentar registros formales y académicos, infrarrepresentar lenguaje coloquial y dialectal, e introducir sesgos temáticos.
- Riesgo de alucinación: inherente a modelos de 0,7B sin alineación; la factualidad no está garantizada.
- Corpus HPLT 4: al derivar de web crawleada, puede contener ruido residual, contenido duplicado o material con derechos de terceros pese al filtrado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene verificar la procedencia de los datos de HPLT 4 antes de un despliegue comercial.
- Sin mantenimiento visible: 0 descargas y 0 likes en el momento de la consulta; no hay indicios de soporte o actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn
- HPLT (corpus): https://hplt-project.org/
- Propella: no disponible (no se ha encontrado enlace oficial en la informacion proporcionada)
- Paper o blog del autor: no disponible
- Repositorio de codigo o demo: no disponible
