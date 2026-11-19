# jakemannix/ccp-gemma-v2-adapters

## Resumen

CCP-Gemma v2 Text-Backbone PEFT Adapters es una colección de adaptadores LoRA publicada por el usuario jakemannix sobre el modelo base `google/gemma-4-26B-A4B-it`. No se trata de un modelo completo, sino de pesos diferenciales en formato PEFT que modifican el comportamiento del backbone de texto del modelo Gemma 4 de Google, una arquitectura Mixture-of-Experts con 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token (según la nomenclatura A4B del identificador).

El repositorio incluye tres conjuntos de adaptadores: dos variantes de rango 16 y rango 4 (`ccp_v2_r16` y `ccp_v2_r4`) que cubren 530 tensores, incluidos los expertos MoE tridimensionales, y una variante de rango 16 (`ccp_cooled16m_r16`) con 410 tensores que afecta únicamente a la atención y al MLP denso. Los adaptadores están normalizados con el prefijo `model.layers.*` y fijados a la revisión `4d7ae4984b7db7de8f8457170b3f1a419ee76d52` del modelo base.

La relevancia de esta publicación es limitada por el momento: cuenta con cero descargas y cero likes, no incluye model card descriptiva más allá de metadatos, y no se han publicado resultados de evaluación. Su interés técnico reside en que ejemplifica el ajuste fino mediante LoRA sobre las capas de expertos de un modelo MoE, un patrón poco habitual en adaptadores públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Gemma 4 (`Gemma4ForCausalLM`) |
| Parametros totales | No disponible (los adaptadores no declaran recuento; el modelo base es de 26B) |
| Parametros activos | No disponible (el modelo base se denomina A4B, lo que sugiere ~4B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre `google/gemma-4-26B-A4B-it`, un modelo de la familia Gemma 4 con arquitectura Mixture-of-Experts. El identificador `A4B` indica que, de los 26.000 millones de parámetros totales, aproximadamente 4.000 millones se activan por token. Los adaptadores están normalizados con el esquema de nombres `model.layers.*`, lo que permite cargarlos directamente sobre las capas del transformer del modelo base.

El repositorio contiene tres configuraciones LoRA. Las variantes `ccp_v2_r16` (rango 16) y `ccp_v2_r4` (rango 4) incluyen 530 tensores cada una, entre los que se encuentran los expertos MoE representados como tensores tridimensionales, lo que implica que el ajuste afecta también a las capas de expertos y no solo a la atención. La variante `ccp_cooled16m_r16` contiene 410 tensores y se limita a las capas de atención y al MLP denso, excluyendo los expertos. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Ajuste fino del backbone de texto del modelo base Gemma 4 26B-A4B-it mediante LoRA; las capacidades finales dependen del modelo base, no se documentan de forma independiente.
- Modificación de las capas de atención y MLP denso (variante `ccp_cooled16m_r16`).
- Modificación adicional de las capas de expertos MoE en las variantes `ccp_v2_r16` y `ccp_v2_r4`.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento específico en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre ajuste fino de capas MoE: el repositorio permite estudiar cómo afecta el entrenamiento LoRA de los expertos tridimensionales frente a ajustar solo atención y MLP denso, comparando las variantes `ccp_v2_r16` y `ccp_cooled16m_r16`.
- Experimentación con distintos rangos LoRA: las variantes r16 y r4 permiten evaluar el compromiso entre capacidad de adaptación y número de parámetros entrenables sobre el mismo modelo base.
- Reproducción de experimentos: la fijación a la revisión `4d7ae4984b7db7de8f8457170b3f1a419ee76d52` facilita la reproducibilidad en entornos de investigación.
- Base para ajustes posteriores: los adaptadores pueden servir como punto de partida para merges o entrenamientos adicionales sobre Gemma 4 en pipelines de PEFT.
- Evaluación comparativa de adaptadores: útil para medir el impacto de adaptadores LoRA en tareas de texto sobre un modelo MoE de gran tamaño.
- Docencia y formación: ejemplo práctico de estructura de tensores LoRA sobre un transformer MoE con expertos representados en 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los adaptadores; depende del modelo base Gemma 4 26B-A4B-it. Un modelo de 26B parámetros en precisión completa requiere del orden de 52 GB en bf16, cantidad que se reduce al aplicar cuantización, aunque no se dispone de cifras oficiales para este modelo concreto.
- GPU recomendadas: no disponibles; para el modelo base de 26B se requerirían GPUs de clase A100 o H100 en bf16, o alternativas con suficiente memoria si se cuantiza.
- Compatibilidad con GPU de consumo: no disponible; dependerá de la cuantización aplicada al modelo base.
- Opciones de despliegue: PEFT (carga de adaptadores sobre el modelo base); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jakemannix/ccp-gemma-v2-adapters | Adaptadores LoRA sobre 26B (A4B) | No disponible | gemma | safetensors (PEFT) | Sin benchmarks ni descargas |
| google/gemma-4-26B-A4B-it | 26B totales, ~4B activos | No disponible | gemma | No disponible | Modelo base; referencia de comparación |
| Adaptadores LoRA genéricos sobre Gemma | Variable | Depende del base | gemma | safetensors | No se dispone de comparativas publicadas con este repositorio |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `google/gemma-4-26B-A4B-it` en la revisión indicada para funcionar.
- Ausencia total de evaluación: cero descargas, cero likes y ningún benchmark publicado; no hay evidencia de calidad o utilidad de los adaptadores.
- Documentación mínima: la model card solo incluye metadatos y nombres de tensores; no se describe el dataset, el objetivo del entrenamiento ni el comportamiento esperado.
- Idiomas no declarados: se desconoce si los adaptadores preservan o alteran las capacidades multilingües del modelo base.
- Riesgo de alucinación: inherente al modelo base; no evaluado para estos adaptadores.
- Sesgos: no documentados; se heredan los del modelo base Gemma 4.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones específicas.
- Compatibilidad frágil: al estar fijados a una revisión concreta del modelo base, cambios en la arquitectura o en los nombres de capas pueden romper la carga de los adaptadores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakemannix/ccp-gemma-v2-adapters
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
