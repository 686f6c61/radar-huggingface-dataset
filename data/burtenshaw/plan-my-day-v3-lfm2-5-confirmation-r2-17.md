# burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-17

## Resumen

El modelo `burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-17` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `burtenshaw` sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, de Liquid AI. No es un modelo completo, sino un adaptador de bajo rango que se entrena para una tarea muy concreta: clasificar y ordenar cuatro acciones ofrecidas en un contexto de planificación de calendario, a partir de correcciones sintéticas de agendas. El adaptador se fine-tunea mediante SFT (Supervised Fine-Tuning) con la librería TRL y un pipeline de aprendizaje continuo (continual learning), usando datos sintéticos generados por el propio autor.

La relevancia del modelo radica en su enfoque de entrenamiento continuo y reproducible: se documentan hashes de los pesos, del dataset y de la configuración, y se presenta una evaluación detallada con métricas de seguridad y completitud. El modelo base tiene aproximadamente 1.200 millones de parámetros, mientras que el adaptador ocupa unos 44,5 MB. La longitud de contexto no se especifica en la información disponible. El modelo está pensado para ser utilizado dentro de un sistema de planificación con reglas deterministas, no como un asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del base no especificada) |
| Parametros totales | Aproximadamente 1.2B (modelo base) + adaptador LoRA (44,457,856 bytes de pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye sin cuantizar; el modelo base puede cuantizarse por separado) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se añade al modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. El adaptador fue entrenado con SFT nativo de TRL sobre un dataset sintético de correcciones de calendario (`burtenshaw/plan-my-day-v3-data`). El entrenamiento se realizó en tres fases, cada una con 330 actualizaciones (990 en total), utilizando memoria de entrenamiento acotada por fase. En las fases 2 y 3 se aplica un replay histórico del 75% de los ejemplos, mientras que la fase 1 solo usa ejemplos de la fase actual al no existir historial.

No se especifica la arquitectura interna del modelo base (por ejemplo, si es un transformer puro, un modelo híbrido o una SSM). Tampoco se detalla la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica destacable es el uso de aprendizaje continuo con datos sintéticos y la reproducibilidad del proceso mediante hashes inmutables.

## Capacidades

- Clasificación y ranking de cuatro acciones ofrecidas en un contexto de planificación de calendario.
- Generación de texto en inglés (pipeline de text-generation).
- Integración con un sistema de filtrado determinista (modo "guarded") que aplica restricciones de completitud y viabilidad sobre las puntuaciones del modelo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente autónomo.
- No tiene capacidades de visión ni audio.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Ordenación de acciones en un asistente de planificación: el modelo recibe un contexto de calendario y cuatro acciones candidatas, y devuelve una puntuación para cada una, permitiendo al sistema elegir la más adecuada.
- Corrección automática de agendas: en un sistema de planificación, el adaptador se usa para identificar qué acción corregir entre varias opciones, reduciendo errores humanos.
- Filtrado de acciones inviables: combinado con el filtro determinista "guarded", el modelo ayuda a descartar acciones que violan restricciones de completitud o seguridad.
- Evaluación de sistemas de planificación: el adaptador puede integrarse en un benchmark de confirmación para medir la calidad de un sistema de calendario sintético.
- Aprendizaje continuo en producción: al ser un adaptador LoRA, permite actualizaciones incrementales sin reentrenar el modelo base completo, lo que facilita su uso en pipelines de continual learning.
- Generación de datos sintéticos de calendario: el modelo puede usarse para validar o generar ejemplos de correcciones de agenda en inglés, alimentando futuros datasets de entrenamiento.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar como MMLU, HumanEval o GSM8K. En su lugar, la model card presenta resultados de evaluación del sistema para este checkpoint concreto (seed 17) y del sistema completo registrado. Estos resultados se basan en 384 días sintéticos compartidos (128 por régimen) y se muestran en dos vistas: "Raw" (puntuaciones sin filtrar) y "Guarded" (con filtrado determinista).

| Vista | Original flags/día (↓) | Perfect (↑) | Unsafe/día (↓) | Complete (↑) |
|---|---:|---:|---:|---:|
| Raw | 0.705729 | 47.40% | 0.156250 | 87.50% |
| Guarded | 0.591146 | 52.86% | 0.000000 | 100.00% |

Además, se reporta un beneficio agregado del sistema completo frente a un SFT congelado de +0.532118 original flags/día, con un intervalo de confianza del 95% de [+0.432292, +0.630208]. Este resultado pertenece al sistema conjunto de tres seeds (17, 29 y 43), no a este adaptador individual.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. A partir del tamaño del modelo base (1.2B de parámetros) y del adaptador LoRA, se puede estimar que la inferencia en FP16 requiere aproximadamente 2.5 GB de VRAM para los pesos del base, más un pequeño overhead del adaptador. Esto sugiere que el modelo podría ejecutarse en GPUs de consumo con 8 GB o más, pero no hay datos confirmados.

- VRAM estimada: no disponible oficialmente; estimación aproximada de 2.5-3 GB en FP16 para el modelo base y el adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dadas las dimensiones del modelo, pero sin confirmación.
- Opciones de despliegue: no disponible. Al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`, pero no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la fuente proporcionada. El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` es la referencia natural, pero no se ofrecen datos de rendimiento comparativo. Tampoco se conocen otros adaptadores de la misma serie con métricas publicadas. Por tanto, esta sección se indica como no disponible.

## Limitaciones y advertencias

- No es un agente general de calendario ni un asistente personal validado; su función se limita a clasificar cuatro acciones ofrecidas.
- Solo soporta inglés (en); no hay soporte multilingüe documentado.
- La licencia LFM Open License v1.0 tiene condiciones para el uso comercial; no es una licencia Apache 2.0 ni de dominio público. El autor no realiza una relicenciación de los pesos.
- Es un adaptador, no un modelo independiente: requiere cargar el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` en la revisión exacta indicada.
- La seguridad reportada (Unsafe/día = 0 en modo Guarded) proviene de reglas deterministas externas, no de un aprendizaje de seguridad en el modelo.
- La evaluación se realiza sobre datos sintéticos, no sobre datos reales de producción, por lo que el rendimiento en entornos reales no está garantizado.
- No se documentan sesgos específicos, pero al ser un modelo de lenguaje, existe riesgo de alucinación y de comportamientos no deseados.
- El uso del adaptador requiere seguir el pipeline evaluado; no se recomienda sustituir el checkpoint por la rama `main` sin verificar los hashes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-17
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset sintético: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-data
- Código y configuración fuente: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-source
- Informe completo de evaluación: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/blob/03cc59933ddfef7e5f0835f24a6d62af01cb40be/reports/confirmation-report.json
- Adaptador de warm-start (linaje de entrenamiento): https://huggingface.co/burtenshaw/plan-my-day-lfm2.5-sft-seed17
- Dataset v2 (referencia de la serie anterior): https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-source
