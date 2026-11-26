# hirundo-io/drex-v2.0-westernized

## Resumen

Drex v2.0 Westernized es un modelo de decisión (decision-model) derivado de `nace-ai/drex-v2.0` mediante un proceso de ajuste orientado a la mitigación de sesgos geográficos y culturales que el autor denomina "westernized". Lo publica el usuario `hirundo-io` en Hugging Face bajo una licencia propia (`nace-ai-open-rail-m`) y con acceso restringido: es necesario aceptar las condiciones del repositorio antes de descargarlo. El pipeline declarado es `text-classification`, aunque la arquitectura subyacente es un transformer de tipo Mixture of Experts (tag `qwen3_5_moe`), lo que sugiere una base Qwen 3.5 MoE adaptada a tareas de decisión y clasificación.

El modelo cuenta con 35.107.181.936 parámetros totales según los pesos en safetensors, con un repositorio de 70,2 GB. Al ser un modelo MoE, el número de parámetros activos por token es previsiblemente inferior al total, pero ese dato no está disponible en la información proporcionada. Tampoco se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización publicados.

Su relevancia radica en dos factores: por un lado, la especialización en clasificación y toma de decisiones con mitigación de sesgos; por otro, el hecho de ser un modelo derivado de una familia con licencia restrictiva y acceso controlado, lo que condiciona su evaluación y su uso en producción. Es un modelo muy reciente (creado en noviembre de 2026) y sin descargas ni likes registrados en el momento de redactar esta ficha, por lo que la evidencia pública sobre su comportamiento es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `nace-ai-open-rail-m` (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un transformer con arquitectura Mixture of Experts, etiquetado como `qwen3_5_moe`, y que se obtiene a partir de `nace-ai/drex-v2.0` mediante una operación de merge o ajuste (tag `base_model:merge:nace-ai/drex-v2.0`). El sufijo "westernized" y la etiqueta `bias-mitigation` apuntan a un proceso de alineación orientado a corregir sesgos de origen geográfico o cultural en las decisiones del modelo base. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada es precisamente esa capa de mitigación de sesgos aplicada sobre un modelo de decisión, junto con la naturaleza MoE que permite separar capacidad total de cómputo activo. Sin embargo, no se publican detalles técnicos sobre el método de merge, la función de pérdida utilizada ni los criterios de evaluación del proceso de "westernización", lo que limita la reproducibilidad y la verificación independiente del resultado.

## Capacidades

- Clasificación de texto y toma de decisiones: el pipeline declarado es `text-classification`, por lo que su uso previsto es asignar etiquetas o categorías a entradas textuales.
- Mitigación de sesgos: el ajuste "westernized" busca reducir sesgos geográficos o culturales en las decisiones del modelo base.
- Herencia de capacidades del modelo base `nace-ai/drex-v2.0`: al ser un derivado, conserva la arquitectura y gran parte de los pesos del original, aunque no se detallan capacidades específicas adicionales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido con sesgo controlado: el modelo puede clasificar textos potencialmente sensibles aplicando criterios homogéneos entre regiones, aprovechando el ajuste de mitigación de sesgos para reducir disparidades en las decisiones entre distintos orígenes culturales.
- Enrutamiento de tickets de soporte: dado su pipeline de clasificación, puede asignar categorías a solicitudes entrantes en un sistema de atención al cliente, derivando cada ticket al equipo correspondiente.
- Clasificación de documentos en pipelines de compliance: útil para etiquetar contratos, informes o comunicaciones según categorías regulatorias, con la ventaja de un criterio de decisión menos dependiente del contexto geográfico del redactor.
- Filtrado previo en sistemas RAG: puede actuar como clasificador de relevancia o de temática antes de recuperar documentos, reduciendo el ruido en la fase de generación aumentada.
- Análisis de sentimiento y opinión en estudios de mercado: clasificación de reseñas o encuestas con un ajuste que busca evitar sesgos culturales en la interpretación del tono.
- Etiquetado de datos a escala: uso como anotador automático para construir datasets de entrenamiento, con la cautela de validar manualmente una muestra por la ausencia de benchmarks publicados.
- Detección de sesgo en textos de terceros: el propio ajuste "westernized" puede emplearse como referencia para comparar decisiones entre el modelo base y el derivado y detectar desplazamientos sistemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parámetros totales, en precisión BF16 se requieren aproximadamente 70 GB solo para los pesos, más overhead de activaciones y caché KV. En cuantización de 8 bits, alrededor de 35-40 GB; en 4 bits, en torno a 18-22 GB. Estas cifras son estimaciones basadas en el tamaño, no datos publicados.
- GPU recomendadas: para BF16, una A100 80 GB o H100 80 GB; para 8 bits, una A100 40 GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) podría ser suficiente, aunque el rendimiento real no está verificado.
- ¿Cabe en GPU de consumo? En cuantización de 4 bits es plausible en una RTX 4090 o RTX 3090, siempre que la implementación soporte la arquitectura MoE concreta.
- Opciones de despliegue: al ser un modelo safetensors con arquitectura MoE tipo Qwen, es compatible con frameworks como vLLM, TGI o llama.cpp si soportan la arquitectura `qwen3_5_moe`; no se confirma compatibilidad con Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/drex-v2.0-westernized | 35,1 B | no disponible | `nace-ai-open-rail-m` | Restringido | Derivado de nace-ai/drex-v2.0, ajuste de sesgos |
| nace-ai/drex-v2.0 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen 3.5 MoE (familia de referencia) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia según el tag |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (modelos de decisión con mitigación de sesgos) para establecer una comparativa rigurosa de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de que el ajuste "westernized" mejore el rendimiento respecto al modelo base ni de que no lo degrade en otras dimensiones.
- Riesgo de alucinación: aunque el pipeline es de clasificación, un modelo de este tamaño puede generar salidas inconsistentes si se usa fuera de su formato previsto.
- Sesgos: el propio proceso de "westernización" introduce un sesgo deliberado hacia criterios occidentales; esto puede ser problemático para aplicaciones en otras regiones o contextos culturales.
- Licencia restrictiva: `nace-ai-open-rail-m` con acceso gated implica condiciones que deben revisarse antes de cualquier uso comercial; no se detallan los términos exactos en la información disponible.
- Idiomas no declarados: se desconoce si el modelo mantiene capacidades multilingües o si el ajuste las ha degradado.
- Contexto desconocido: no se puede planificar su uso en escenarios de contexto largo sin confirmar la ventana real.
- Modelo sin tracción pública: cero descargas y cero likes en el momento de la ficha, sin comunidad ni reportes de uso que permitan validar su comportamiento.
- Procedencia del ajuste opaca: no se documenta el método de merge ni los datos empleados, lo que dificulta auditar la mitigación de sesgos declarada.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/drex-v2.0-westernized
- Modelo base: https://huggingface.co/nace-ai/drex-v2.0
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
