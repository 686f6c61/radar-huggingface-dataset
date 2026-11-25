# joamCriff123/zils-mini-m1124a

## Resumen

zils-mini-m1124a es un modelo de decisión ("decision body") publicado por el usuario joamCriff123 bajo el paraguas del proyecto Zils, orientado al pool mini de la subnet 127. Se construye como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, por lo que hereda la familia arquitectónica Qwen3.5 y un tamaño de aproximadamente 4.500 millones de parámetros. El pipeline declarado en Hugging Face es `feature-extraction`, lo que sugiere que su uso previsto no es la generación de texto libre sino la producción de representaciones o puntuaciones de decisión dentro de un sistema mayor.

La relevancia del modelo es acotada: se trata de un artefacto muy específico de un ecosistema de subred (Zils subnet 127), con cero descargas y cero likes en el momento de la consulta, y una model card mínima que no documenta datos de entrenamiento, idiomas ni evaluación. Para el desarrollador o investigador externo, su interés principal es el de un ejemplo de finetune de Qwen3.5-4B con licencia Apache-2.0 y pesos en safetensors, más que el de un modelo listo para producción general.

La información disponible no permite confirmar el contexto máximo efectivo, los idiomas soportados ni el rendimiento. Todo lo que sigue distingue explícitamente entre datos verificados (tamaño de parámetros, formato, licencia, modelo base) y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), derivada de Qwen/Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B, sin confirmar en esta ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo se presenta como un finetune de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con 4.539.265.536 parámetros totales según los tensores publicados. La model card no describe la arquitectura interna (número de capas, dimensiones, tipo de atención, uso de MoE o de atención lineal) ni confirma si se han modificado componentes estructurales respecto al base. El tag `qwen3_5` y la etiqueta `custom_code` indican que la carga requiere código personalizado incluido en el repositorio, lo que implica que la implementación no es la estándar de `transformers` sin más.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa. La model card únicamente indica que se trata de un "d3-mini decision body" para el pool mini de la subnet 127 de Zils, sin detallar el objetivo de entrenamiento (clasificación, ranking, puntuación de decisiones u otro). Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- El pipeline declarado es `feature-extraction`, por lo que la capacidad documentada es la extracción de representaciones, no la generación de texto.
- Etiquetado como `decision-model`: se orienta a producir decisiones o puntuaciones dentro de un sistema Zils, sin que se especifique el formato de salida.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Al derivar de Qwen3.5-4B, podría conservar parte de las capacidades del base, pero no hay confirmación en la información proporcionada.

## Casos de uso

- Evaluación de finetunes sobre Qwen3.5-4B: el modelo sirve como referencia para estudiar cómo se comporta un ajuste de 4.500 millones de parámetros con `custom_code` y pesos safetensors en un pipeline de extracción de características.
- Integración en el ecosistema Zils subnet 127: su uso previsto declarado es actuar como cuerpo de decisión en el pool mini; un operador de esa subred podría desplegarlo como componente de puntuación.
- Extracción de embeddings para tareas downstream: al declararse `feature-extraction`, puede emplearse para generar representaciones que alimenten clasificadores o sistemas de ranking propios, siempre que se valide su calidad.
- Reproducción de experimentos de ajuste fino: investigadores que trabajen con la familia Qwen3.5-4B pueden usar este checkpoint como punto de partida o comparación, dada su licencia Apache-2.0.
- Base para experimentación con código personalizado: el tag `custom_code` permite estudiar patrones de empaquetado de modelos con implementaciones no estándar en Hugging Face.
- Pruebas de compatibilidad de despliegue: útil para verificar que pipelines con `transformers` y pesos safetensors de ~9,1 GB de repositorio se cargan correctamente en infraestructura propia antes de adoptar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros en fp16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesitan alrededor de 10-12 GB de VRAM incluyendo overhead; en fp32, unos 18 GB solo de pesos.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, encaja en A100, H100, L40S y RTX 4090 (24 GB) en fp16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 8-12 GB requeriría cuantización, que no se publica en el repositorio.
- Opciones de despliegue: `transformers` con `custom_code` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados y dependerían de que la implementación personalizada sea compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1124a | 4.539 M | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Finetune de decision, `custom_code` |
| Qwen/Qwen3.5-4B (base) | ~4 B (familia) | no disponible en esta ficha | según el base | Hugging Face | Modelo de origen; capacidades generales |
| Otros finetunes de Qwen3.5-4B | variable | no disponible | variable | Hugging Face | No se dispone de comparación concreta |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es mínima: no documenta datos de entrenamiento, evaluación, idiomas ni limitaciones, lo que impide valorar su calidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validación por terceros.
- El pipeline `feature-extraction` y la etiqueta `decision-model` no aclaran el formato de salida ni el protocolo de integración; habría que inspeccionar el `custom_code` para saberlo.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; al ser un finetune, podría heredar sesgos del base Qwen3.5-4B, pero no se confirma.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio remite a LICENSE y NOTICE para atribuciones del upstream; conviene revisarlos antes de redistribuir.
- La dependencia de `custom_code` añade riesgo operativo: la carga no es estándar y puede romperse con actualizaciones de `transformers`.
- No se publican cuantizaciones, lo que limita el despliegue en hardware de gama baja.
- El nombre y el contexto (subnet 127, pool mini) sugieren un uso muy especializado; no hay garantía de comportamiento fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1124a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
