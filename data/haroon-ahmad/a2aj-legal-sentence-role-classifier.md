# haroon-ahmad/a2aj-legal-sentence-role-classifier

## Resumen

El A2AJ Legal Sentence Role Classifier es un modelo de clasificación de tokens (etiquetado a nivel de oración) desarrollado por Haroon Ahmad para asignar roles retóricos a cada oración de sentencias de tribunales y cortes canadienses. Distingue siete categorías: `Facts`, `Issue`, `Arguments_Petitioner`, `Arguments_Respondent`, `Reasoning`, `Decision` y `None`. El modelo resuelve el problema de segmentación estructural de jurisprudencia, una tarea previa habitual en pipelines de recuperación de case-law.

Técnicamente no es un transformer generativo, sino una BiLSTM que consume secuencias de embeddings de oración de 1024 dimensiones producidos por Kanon-2 (`kanon-2-embedder`, de Isaacus), enriquecidos con cinco entradas adicionales: posición relativa de la oración en la sentencia, logaritmo de su longitud y tres flags regex para detectar formulaciones de decisión y argumentación. Se trata de un ensemble de cuatro miembros entrenados con semillas distintas cuyos logits se promedian.

Es relevante por su enfoque práctico en el dominio jurídico canadiense y por su metodología de etiquetado asistido por LLM (Claude Opus y Drex) sobre el corpus A2AJ Canadian Case Law. Es un artefacto de investigación, no un producto listo para producción, y el propio autor advierte que no constituye asesoramiento jurídico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM sobre embeddings de oración Kanon-2 (1024-d) + 5 features auxiliares; ensemble de 4 semillas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una sentencia completa como secuencia de oraciones) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | PyTorch (`.pt`), acompañado de `roles.py`, `metrics.json` y artefactos de paridad (`.parquet`, `.npy`) |

## Arquitectura y entrenamiento

El modelo es una red BiLSTM que recibe una secuencia ordenada de vectores de oración. Cada vector combina el embedding Kanon-2 de 1024 dimensiones con cinco señales adicionales: posición relativa de la oración dentro de la sentencia, logaritmo de su longitud y tres flags regex que marcan formulaciones típicas de decisión y argumentación. El ensemble promedia los logits de cuatro miembros entrenados con semillas distintas. La inferencia requiere llamar a la API de Kanon-2 (variable de entorno `ISAACUS_API_KEY`) para obtener los embeddings, por lo que el modelo no es autocontenido.

El entrenamiento combina dos fuentes: 303 sentencias etiquetadas por Claude Opus (51.664 oraciones) que constituyen las etiquetas principales y de las que se derivan la media y desviación típica de entrada, y 2.841 sentencias etiquetadas por Drex (`drex-max-v1.1`) usadas como datos adicionales, filtrando solo etiquetas con confianza ≥ 0,7 e ignorando las etiquetas `Decision` y `None` de Drex (de ahí el sufijo `nodn`). Los datos provienen del corpus A2AJ Canadian Case Law. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre etiquetas generadas por LLM.

## Capacidades

- Clasificación de oraciones jurídicas en siete roles retóricos: `Facts`, `Issue`, `Arguments_Petitioner`, `Arguments_Respondent`, `Reasoning`, `Decision`, `None`.
- Segmentación estructural de sentencias judiciales completas, procesando las oraciones en orden.
- Detección de formulaciones de decisión y argumentación mediante flags regex incorporados como features.
- Salida de probabilidades por clase, útil para umbrales y análisis de confianza.
- Funciona sobre texto en inglés de cortes y tribunales canadienses.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; el francés no ha sido evaluado.

## Casos de uso

- Segmentación de jurisprudencia para pipelines de recuperación: el modelo etiqueta cada oración de una sentencia, permitiendo indexar por rol y filtrar, por ejemplo, solo los pasajes de `Reasoning` o `Decision` en un sistema de búsqueda de case-law.
- Extracción de la decisión operativa: localizar las oraciones etiquetadas como `Decision` para resumir el fallo de una sentencia sin revisar el texto completo.
- Análisis de argumentos por parte: separar `Arguments_Petitioner` de `Arguments_Respondent` para construir resúmenes estructurados de posiciones procesales.
- Enriquecimiento de datasets jurídicos: añadir etiquetas de rol a corpus no anotados como paso previo a tareas de resumen, clasificación o extracción de información.
- Investigación empírica sobre estructura judicial: medir la proporción de `Facts`, `Reasoning` y `Decision` por corte o tribunal para estudios comparativos.
- Preprocesado para modelos generativos jurídicos: usar los roles como señal de recuperación o para construir prompts con contexto seleccionado por tipo de oración.
- Verificación de paridad y auditoría: el script `roles.py --parity` permite reproducir exactamente las predicciones sobre el conjunto de test de 1.012 oraciones, útil para validar despliegues.

## Benchmarks y rendimiento

Validación cruzada de cinco folds sobre las 303 sentencias etiquetadas por Opus (folds por sentencia, 4 semillas), evaluada contra las etiquetas de Opus:

| Metrica | Valor |
|---|---|
| Accuracy | 0,791 |
| Macro-F1 | 0,715 |
| F1 Facts | 0,820 |
| F1 Issue | 0,624 |
| F1 Arguments_Petitioner | 0,561 |
| F1 Arguments_Respondent | 0,516 |
| F1 Reasoning | 0,836 |
| F1 Decision | 0,781 |
| F1 None | 0,865 |

Sobre un conjunto de test separado de 7 sentencias (1.012 oraciones), el modelo final obtiene accuracy 0,784, macro-F1 0,692 y F1 de `Issue` 0,526 frente a las etiquetas de Opus. El conjunto solo contiene 17 oraciones de tipo `Issue`, por lo que esa cifra es muy incierta.

El añadido de las sentencias etiquetadas por Drex mejora, respecto al modelo entrenado solo con etiquetas de Opus, la accuracy en +0,020 [0,009; 0,032], el macro-F1 en +0,054 [0,040; 0,069] y el F1 de `Issue` en +0,084 [0,051; 0,119] (intervalos bootstrap al 95 %; McNemar p ≈ 10⁻²⁷).

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se publican recuentos de parámetros. Una BiLSTM de este tipo es ligera y probablemente cabe en cualquier GPU consumer, pero no hay cifras confirmadas.
- GPU recomendadas: no disponibles. Al ser una BiLSTM sobre secuencias de embeddings precalculados, la carga computacional principal recae en la generación de embeddings Kanon-2 vía API, no en el modelo local.
- Cabe en GPU consumer: muy probablemente sí, aunque no está confirmado por el autor.
- Opciones de despliegue: inferencia vía `roles.py` con PyTorch, NumPy, pandas, pyarrow y requests. No se ofrecen integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplica a esta arquitectura).
- Latencia y throughput: no disponibles.
- Requisito adicional: clave de API de Isaacus (`ISAACUS_API_KEY`) para obtener los embeddings Kanon-2, lo que introduce dependencia de un servicio externo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A2AJ Legal Sentence Role Classifier | no disponible | no disponible | Etiquetado de roles retóricos en jurisprudencia canadiense | cc-by-sa-4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las oraciones de tipo `Issue` son raras (1,7 % de las oraciones de entrenamiento) y la clase más difícil; se espera precisión en torno a 0,58 y recall en torno a 0,67 en sentencias similares a las de entrenamiento.
- Las dos clases de argumentos se confunden a menudo entre sí y con `Facts`.
- En decisiones de tribunales, las oraciones de `Reasoning` a veces se etiquetan como `Facts`.
- El modelo depende de los embeddings Kanon-2; otros embeddings no funcionan sin reentrenamiento, y la inferencia requiere acceso a la API de Isaacus.
- Entrenado y evaluado solo con texto en inglés; no se ha comprobado su comportamiento en sentencias en francés.
- Las etiquetas de entrenamiento provienen de LLM (Claude Opus y Drex), no de anotadores humanos expertos, lo que puede introducir sesgos y errores sistemáticos en las categorías.
- El conjunto de test es muy pequeño (7 sentencias, 1.012 oraciones), por lo que las métricas tienen alta incertidumbre.
- La licencia cc-by-sa-4.0 exige compartir bajo la misma licencia las obras derivadas; además, cada corte conserva su propia licencia sobre las sentencias y algunas restringen el uso comercial.
- Es un artefacto de investigación: no constituye asesoramiento jurídico y sus etiquetas no son conclusiones legales.
- El modelo no es generativo: no produce texto, solo etiquetas y probabilidades por oración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroon-ahmad/a2aj-legal-sentence-role-classifier
- Dataset A2AJ Canadian Case Law: https://huggingface.co/datasets/a2aj/canadian-case-law
- Kanon-2 (Isaacus): https://isaacus.com
- Cita del autor: Ahmad, Haroon (2026), "A2AJ Legal Sentence Role Classifier: rhetorical roles for Canadian judgments"
