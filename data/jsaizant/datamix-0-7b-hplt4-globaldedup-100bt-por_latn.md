# jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el usuario jsaizant sobre 100 mil millones de tokens del corpus HPLT 4 en portugués, tras aplicar deduplicación global y sin filtrado adicional. Forma parte de una familia de modelos de investigación orientados a estudiar el efecto del preprocesado de datos (deduplicación, filtrado, mezcla) sobre el rendimiento final de modelos pequeños.

La relevancia del modelo es fundamentalmente metodológica: se trata de un artefacto de experimentación sobre datos, no de un asistente listo para producción. Su interés reside en poder comparar su comportamiento con otras variantes de la misma familia entrenadas con distintos pipelines de curación de datos (por ejemplo, con o sin filtrado de calidad, con o sin deduplicación), manteniendo constante la arquitectura y el presupuesto de cómputo.

La información publicada es muy escasa: la model card se limita a indicar licencia Apache 2.0, idioma portugués y el régimen de entrenamiento. No se detallan arquitectura exacta, configuración de contexto, tokenizador ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, por convención de la familia, sin confirmar) |
| Parametros totales | 0,7 mil millones (aproximado, según model card) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión original; compatible con cuantización estándar al usar safetensors) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (framework PyTorch, tag `pt`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención, tokenizador o función de activación). Por el tamaño (0,7B) y el contexto de la familia de experimentos, lo esperable es un transformer decoder-only de tipo GPT, pero esto no está confirmado en la información disponible.

El dato relevante y confirmado es el régimen de entrenamiento: 100 mil millones de tokens procedentes de HPLT 4 en portugués, tras deduplicación global y sin filtrado adicional de calidad. Este diseño permite aislar el efecto de la deduplicación frente a otras variantes de la familia que sí aplican filtros. No se menciona el uso de RLHF, DPO, SFT ni ninguna etapa de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto en portugués como capacidad base derivada del preentrenamiento.
- Modelo base (no instruido): no se ha documentado ajuste por instrucciones ni diálogo.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente o razonamiento multi-paso.
- Cobertura multilingüe limitada al portugués según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Investigación sobre curación de datos: servir como punto de control en experimentos que comparan pipelines de deduplicación y filtrado sobre el mismo corpus y presupuesto de tokens.
- Evaluación de modelos pequeños en portugués: medir perplejidad y métricas downstream para estudiar el efecto del tamaño y de los datos en lenguas de recursos medios.
- Generación de texto en portugués con fine-tuning posterior: al ser un modelo base de 0,7B, es un punto de partida asequible para ajuste supervisado en dominios concretos (legal, noticias, soporte) con presupuesto de cómputo reducido.
- Reproducibilidad de experimentos: al publicarse pesos en safetensors con licencia Apache 2.0, permite replicar y auditar resultados de investigación sin restricciones de uso.
- Prototipado rápido en entornos con poca GPU: su tamaño permite iterar en una sola GPU de consumo para tareas de completado de texto y evaluación de corpus.
- Estudio de sesgos y calidad lingüística: al no aplicar filtrado, es útil para analizar cómo el ruido del corpus afecta a la generación (repeticiones, toxicidad, fluidez) frente a variantes filtradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, en torno a 1,4 GB solo para pesos; en fp32, unos 2,8 GB. Con cuantización a 8 bits, aproximadamente 0,7 GB; a 4 bits, en torno a 0,4 GB (estimaciones teóricas a partir del número de parámetros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16 con margen para activaciones y caché KV; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque las de gama alta estarán infrautilizadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más en fp16, y en 4 GB o menos con cuantización.
- Opciones de despliegue: transformers (PyTorch) de forma nativa al estar en safetensors; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI si se confirma compatibilidad con la arquitectura concreta.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn | ~0,7B | no disponible | pt | Apache 2.0 | Base, sin alineación, foco en experimentación de datos |
| Variantes de la misma familia datamix (otros pipelines de datos) | ~0,7B | no disponible | pt | Apache 2.0 (previsible) | No se dispone de enlaces ni datos verificados en la información proporcionada |
| Modelos pequeños multilingües tipo Qwen2.5-0.5B / Gemma-2-2B | 0,5B-2B | 32K-8K según modelo | multilingüe | licencias variables | No comparables en datos de entrenamiento ni en evaluación; se citan solo como referencia de categoría |

No se dispone de datos de rendimiento comparables publicados para este modelo ni para sus alternativas directas de la familia.

## Limitaciones y advertencias

- Modelo base sin alineación: no está ajustado por instrucciones ni por preferencias humanas, por lo que su salida puede ser incoherente, repetitiva o inapropiada en uso conversacional directo.
- Entrenado sin filtrado de calidad: el corpus puede contener ruido, contenido tóxico o sesgos que se reflejen en la generación.
- Idioma limitado al portugués; el rendimiento en otras lenguas no está garantizado ni documentado.
- Riesgo de alucinación inherente a un modelo de 0,7B entrenado sobre 100B tokens: capacidad factual limitada y propensión a inventar información.
- Sin datos publicados de evaluación, seguridad ni sesgos; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el contenido generado ni sobre posibles infracciones de derechos en los datos de entrenamiento.
- Longitud de contexto y tokenizador desconocidos: pueden aparecer limitaciones prácticas al procesar documentos largos o al integrarlo en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn
- Corpus HPLT 4 (referencia del dataset de entrenamiento): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
