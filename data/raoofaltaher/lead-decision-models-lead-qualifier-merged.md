# raoofaltaher/lead-decision-models-lead-qualifier-merged

## Resumen

`lead-decision-models-lead-qualifier-merged` es un modelo de decisión (no generativo) desarrollado por raoofaltaher y afinado a partir de `LiquidAI/LFM3-1.7B` (revision `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`) mediante Unsloth `FastDecisionModel` y una cabeza de decisión Clef. Su función es puntuar opciones discretas y devolver probabilidades calibradas: no genera texto libre ni envía mensajes, sino que clasifica registros B2B contra un perfil de cliente ideal (ICP) de ejemplo con las etiquetas `fit`, `not_fit` e `insufficient_evidence`, y clasifica además la etiqueta de conversión a 90 días del dataset LeadForge.

El modelo tiene 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y se distribuye como checkpoint fusionado en formato `safetensors` con código de modelado personalizado de LFM3, lo que obliga a cargarlo con `trust_remote_code=True`. Es un modelo de carácter didáctico, concebido como material de un tutorial sobre cómo convertir un LLM en un modelo de decisión estructurada; su valor práctico está en demostrar el pipeline de entrenamiento, calibración y evaluación, no en sustituir sistemas de scoring de producción.

Su relevancia actual radica en la creciente demanda de modelos pequeños, desplegables en hardware modesto (2,73 GB de VRAM en pico de entrenamiento) y especializados en decisiones deterministas y auditables, frente al uso de LLMs generativos para tareas de clasificación donde la reproducibilidad y la calibración importan más que la fluidez del texto. La licencia LFM Open License v1.0 impone un umbral de ingresos para el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (LiquidAI) con cabeza de decisión Clef sobre Unsloth `FastDecisionModel` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | carga en 4 bits (`load_in_4bit=True`) documentada; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` en el Hub |
| Formato de pesos | safetensors (checkpoint fusionado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de LiquidAI, un transformer de 1,7 mil millones de parámetros con código de modelado propio, y le añade una cabeza de decisión Clef gestionada por la librería Unsloth `FastDecisionModel`. En lugar de generar tokens, el modelo puntúa un conjunto finito de opciones y emite una distribución de probabilidad sobre ellas. El checkpoint publicado es la versión fusionada (pesos base más adaptador y cabeza integrados), lo que simplifica la carga a costa de perder la separación entre adaptador y base.

El entrenamiento se realizó sobre el tier intermedio del release sintético LeadForge CRM v0.1.0-alpha (licencia MIT), dividido por cuenta para evitar fugas entre particiones: 2400 filas de entrenamiento del optimizador, 598 de calibración, 1000 de validación y 1002 de test. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron RLHF o DPO; el proceso es de ajuste supervisado con calibración posterior. El pico de VRAM durante el entrenamiento fue de 2,73 GB.

## Capacidades

- Clasificación binaria/multiclase de registros B2B contra un ICP de ejemplo: `fit`, `not_fit`, `insufficient_evidence`.
- Clasificación de la etiqueta de conversión a 90 días del dataset LeadForge.
- Salida de probabilidades calibradas (ECE de 0,0011 en test) en lugar de texto generado.
- Puntuación de opciones discretas proporcionadas por el llamador; no inventa opciones.
- Integración con `FastDecisionModel` de Unsloth para inferencia y carga en 4 bits.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador, no un generador.
- Capacidades multilingües: no disponibles.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Cualificación de leads B2B en un CRM: el modelo recibe un registro (industria, región, banda de empleados y features del pipeline) y devuelve la probabilidad de encaje con el ICP, permitiendo priorizar colas de ventas sin generar texto.
- Enrutamiento de respuestas de ventas: al ser un modelo de decisión, puede clasificar respuestas entrantes en categorías discretas y alimentar un router determinista, evitando que un LLM generativo decida sobre comunicaciones reales.
- Material docente y reproducción de pipelines: sirve como ejemplo ejecutable de cómo convertir un LLM en un modelo de decisión con calibración, útil en cursos y tutoriales de ML aplicado.
- Evaluación comparativa de baselines: su ROC-AUC (0,8692) frente a una regresión logística (0,8758) permite estudiar cuándo un LLM pequeño aporta valor frente a modelos lineales en datos tabulares.
- Prototipado de scoring en entornos con hardware limitado: con 2,73 GB de VRAM en entrenamiento y carga en 4 bits, cabe en GPUs de consumo y permite iterar sin infraestructura dedicada.
- Investigación sobre calibración y ECE: el modelo y su dataset sintético permiten estudiar técnicas de calibración de probabilidades en clasificadores basados en transformers.
- Gate previo en pipelines de outreach: combinado con código de política determinista (como el gate del repositorio companion), puede filtrar registros antes de pasarlos a un sistema de contacto humano.

## Benchmarks y rendimiento

Métricas de test de la ejecución registrada por el autor:

| Metrica | Este modelo | Regresion logistica |
|---|---:|---:|
| accuracy | 0,8932 | — |
| ece | 0,0011 | — |
| loss | 0,1562 | — |
| record_accuracy | 0,7864 | — |
| roc_auc | 0,8692 | 0,8758 |
| average_precision | 0,5167 | 0,5495 |
| brier | 0,1091 | 0,1105 |
| precision_at_100 | 0,5100 | 0,5400 |

`accuracy`, `ece`, `loss` y `record_accuracy` cubren ambas preguntas; `roc_auc`, `average_precision`, `brier` y `precision_at_100` puntúan solo la pregunta de conversión a 90 días. En `ece`, `loss` y `brier` menor es mejor; en el resto, mayor es mejor. La columna de regresión logística proviene de la misma ejecución, la misma partición y las mismas features.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de entrenamiento documentado es de 2,73 GB, por lo que la inferencia en 4 bits debería situarse por debajo de esa cifra.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, dado el tamaño del modelo y la carga en 4 bits.
- Opciones de despliegue: `FastDecisionModel` de Unsloth (única vía documentada); no se documentan vLLM, llama.cpp, Ollama ni TGI, y el código de modelado personalizado de LFM3 complica su uso en runtimes genéricos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lead-decision-models-lead-qualifier-merged | 1,73 B | no disponible | Clasificación de leads | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | Generación de texto | LFM Open License v1.0 | Hugging Face |
| Regresión logística (baseline del autor) | no aplica | no aplica | Clasificación de leads | no disponible | misma ejecución |
| raoofaltaher/lead-decision-models-lead-qualifier (adaptador) | 1,7 B + cabeza | no disponible | Clasificación de leads | LFM Open License v1.0 | Hugging Face |

La comparación con modelos generativos de tamaño similar no es directa, porque este modelo no genera texto. Frente a la regresión logística del mismo run, el modelo pierde ligeramente en ROC-AUC, average precision, Brier y precision@100, pero mejora en calibración (ECE de 0,0011) y ofrece la ventaja de integrar features semánticas del registro sin ingeniería manual.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos: las métricas demuestran que el pipeline funciona, no el rendimiento sobre registros CRM reales ni respuestas de ventas reales.
- El modelo nunca vio un registro con industria, región o banda de empleados vacía, por lo que no responde `insufficient_evidence` en la práctica: ante empresas reales con campos faltantes devolvió `fit` con probabilidad cercana a 1,0. Es imprescindible validar campos ausentes en código antes de llamarlo.
- Las probabilidades y la calibración pueden desplazarse si cambian el mercado, la fuente de datos o el proceso.
- La licencia LFM Open License v1.0 restringe el uso comercial del modelo y de derivados por debajo de un umbral de ingresos definido en la propia licencia; debe leerse antes de cualquier explotación comercial.
- Requiere `trust_remote_code=True` por el código de modelado personalizado de LFM3; conviene auditar los ficheros Python del repositorio base antes de ejecutarlo.
- Un modelo de probabilidad no es permiso para contactar a nadie: la política determinista y una persona deben decidir cada acción de outreach.
- No soporta tool calling, agentes ni generación de texto; usarlo fuera de su tarea de clasificación produce resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raoofaltaher/lead-decision-models-lead-qualifier-merged
- Adaptador y cabeza de decisión de la misma ejecución: https://huggingface.co/raoofaltaher/lead-decision-models-lead-qualifier
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio companion (notebook, datos, gráficas y tests): https://github.com/raoofaltaher/lead-decision-models
- README del repositorio: https://github.com/raoofaltaher/lead-decision-models/blob/main/README.md
- Tutorial de entrenamiento y uso: https://raoofaltaher.com/tutorials/fine-tune-lfm3-decision-model-with-unsloth
- Artículo sobre modelos de decisión: https://raoofaltaher.com/blog/decision-models-with-unsloth
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7/LICENSE
