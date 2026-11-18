# hirundo-io/Qwen3.5-9B-Westernized-LoRA

## Resumen

El modelo `hirundo-io/Qwen3.5-9B-Westernized-LoRA` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario hirundo-io sobre el modelo base `Qwen/Qwen3.5-9B`. Se trata de un artefacto de tipo PEFT (Parameter-Efficient Fine-Tuning) orientado a lo que el autor etiqueta como "behavioral-unlearning" y "westernized", es decir, un ajuste fino cuyo objetivo declarado sería modificar ciertos comportamientos o sesgos culturales del modelo base. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

La relevancia de esta ficha es limitada y conviene ser explícito al respecto: el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye información sobre pipeline, idiomas soportados ni resultados de evaluación, y su acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. No se dispone de model card pública con detalles de entrenamiento, dataset o hiperparámetros en la información proporcionada.

Por tanto, esta ficha documenta lo que se puede verificar de forma objetiva (metadatos, licencia, modelo base, formato) y marca explícitamente como "no disponible" todo aquello que no consta. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no hay evidencia publicada de calidad, seguridad ni comportamiento diferencial frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-9B |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base declara 9B en su nombre) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base `Qwen/Qwen3.5-9B`, un transformer denso de la familia Qwen, pero la información proporcionada no detalla su configuración interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención, tokenizador ni ventana de contexto efectiva). El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, técnica estándar en PEFT para reducir el coste de ajuste.

En cuanto al entrenamiento, los tags del repositorio indican "behavioral-unlearning" y "westernized", lo que sugiere un ajuste orientado a eliminar o atenuar determinados comportamientos y a alinear el estilo de respuesta con una perspectiva cultural "occidental". Sin embargo, no se especifica el dataset utilizado, el número de tokens de entrenamiento, el rango del adaptador, la tasa de aprendizaje, si hubo RLHF/DPO o si se aplicaron técnicas de regularización para preservar capacidades. Tampoco consta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- No se han documentado capacidades específicas del adaptador en la información disponible.
- Al estar construido sobre `Qwen/Qwen3.5-9B`, heredaría nominalmente las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero no hay evidencia publicada de que el ajuste las preserve ni de cómo las modifica.
- Soporte de tool calling / function calling: no disponible para el adaptador (depende del modelo base y de la plantilla de chat empleada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en desaprendizaje conductual (behavioral unlearning): el adaptador puede emplearse como objeto de estudio para analizar cómo un ajuste LoRA de bajo rango modifica comportamientos del modelo base, comparando respuestas antes y después con un conjunto de evaluación propio.
- Análisis de alineamiento cultural: útil para experimentos académicos que midan el desplazamiento de estilo o sesgo cultural ("westernization") en las respuestas, siempre que se documente la metodología y se evalúe con métricas reproducibles.
- Pruebas de robustez y regresión: integrar el adaptador en una batería de evaluación interna para detectar degradaciones en razonamiento, código o matemáticas respecto al modelo base antes de considerar cualquier uso.
- Prototipado de ajustes PEFT: sirve como ejemplo práctico de cómo se estructura y carga un adaptador LoRA con la librería `peft` sobre un modelo Qwen, útil para equipos que quieran replicar el flujo de trabajo.
- Auditoría de seguridad de modelos: analizar si el ajuste introduce o mitiga comportamientos indeseados, con especial atención a la posibilidad de que el "desaprendizaje" afecte a la factualidad o a la cobertura idiomática.
- Docencia y formación: como caso de estudio de las limitaciones de los adaptadores LoRA sin model card ni evaluación publicada, ilustrando por qué la trazabilidad y la documentación son requisitos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al requerir cargar el modelo base `Qwen/Qwen3.5-9B` más el adaptador, el consumo vendrá determinado por el modelo base y la cuantización elegida en el despliegue.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependería del modelo base y de la cuantización aplicada al mismo.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT (carga sobre el modelo base con `peft`); el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y requeriría fusión previa del adaptador con el modelo base o uso de mecanismos de carga de LoRA propios de cada motor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Acceso | Evaluación publicada |
|---|---|---|---|---|---|---|
| hirundo-io/Qwen3.5-9B-Westernized-LoRA | Adaptador LoRA sobre Qwen3.5-9B | No disponible (base 9B) | No disponible | Apache 2.0 | Restringido (gated) | No |
| Qwen/Qwen3.5-9B (modelo base) | Transformer denso | 9B (según denominación) | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información |
| Otros adaptadores LoRA sobre Qwen (genéricos) | Adaptador PEFT | Variable | Heredado del base | Variable | Variable | Variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos del modelo base y de adaptadores comparables no constan en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripción de dataset, hiperparámetros, evaluación ni intención de uso declarada más allá de los tags.
- Riesgo elevado de degradación de capacidades: un ajuste de "desaprendizaje conductual" sin evaluación publicada puede afectar a factualidad, razonamiento o cobertura idiomática de forma no documentada.
- Sesgos conocidos: no documentados; el propio objetivo declarado ("westernized") sugiere una modificación deliberada de sesgo cultural que debería auditarse antes de cualquier uso.
- Riesgo de alucinación: no evaluado para el adaptador; se desconoce si el ajuste lo incrementa respecto al modelo base.
- Limitaciones de contexto e idioma: no disponibles; el repositorio no declara idiomas soportados.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que añade una dependencia operativa para su uso.
- Licencia Apache 2.0: permite uso comercial según los términos de dicha licencia, pero debe verificarse la licencia del modelo base `Qwen/Qwen3.5-9B`, que no consta en la información proporcionada y podría imponer condiciones adicionales.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin señales de validación por parte de la comunidad.
- No apto para producción sin evaluación propia previa: no hay evidencia de calidad, seguridad ni reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/Qwen3.5-9B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería PEFT: https://huggingface.co/docs/peft
