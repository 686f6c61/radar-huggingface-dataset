# ceselder/skip-lens-qwen36-27b-agreelens-p-l62

## Resumen

Este repositorio contiene un adaptador PEFT LoRA de interpretabilidad, diseñado como una herramienta de investigación para el modelo Qwen/Qwen3.6-27B. El autor, ceselder, lo define como una variante "skip-lens" de su serie agreelens, entrenada específicamente para leer el "espacio de trabajo" (workspace) del modelo base. A diferencia de un modelo generativo tradicional, este adaptador no se usa para generar texto, sino para sondear las representaciones internas del transformer y cuantificar la actividad en capas concretas.

La innovación principal reside en la técnica de "skip-lens": el adaptador está entrenado sobre la activación residual de la capa 62, pero en tiempo de inferencia se alimenta con la activación de la capa 42 proyectada mediante un Jacobiano oficial (J_42->62). Este truco permite saltar capas de forma controlada. El entrenamiento se realizó con 244.367 pares de (posición, span de 12 tokens on-policy), y el adaptador se distribuye bajo licencia Apache-2.0 en formato safetensors dentro de un repositorio de 1,9 GB. Es una pieza de investigación de interpretabilidad, no un modelo de propósito general, y su relevancia reside en que demuestra una mejora cuantificable del 0,757 de acuerdo con el workspace frente al 0,694 de la alimentación directa con h42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (transformer) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (adaptador PEFT safetensors, no cuantizado) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre la activación residual de la capa 62 del modelo base, pero está diseñado para ser alimentado en tiempo de prueba con la activación de la capa 42 transformada por el Jacobiano oficial J_42->62 (publicado en `camilablack/workspace-lenses`). Esto es el truco "skip-lens": saltar de la capa 42 a la 62 de forma controlada. El conjunto de entrenamiento consta de 244,367 pares de datos (posición, span de 12 tokens on-policy), idénticos a los del gemelo L42. Los hiperparámetros son: batch size de 64, learning rate 1e-4, LoRA con rango 64 y alpha 16, usando la variante rsLoRA aplicada a todos los módulos, una sola época y semilla 0. La inyección de la activación se realiza mediante un hook con normalización de norma de Karvonen en el token marcador ㈜ (id de token 158983), siguiendo la plantilla `nla_meta.yaml` incluida en el repositorio.

## Capacidades

- Lectura del "espacio de trabajo" (workspace) del modelo base: cuantifica la actividad en capas intermedias.
- Implementación de la técnica de skip-lens: permite saltar de la capa 42 a la 62 usando un Jacobiano oficial.
- Análisis de representaciones internas: adecuado para estudios de mecanística (mechanistic interpretability).
- Compatibilidad con PEFT: se integra directamente con la librería `peft` de Hugging Face.
- Uso de hooks personalizados: inyección de activaciones en un token marcador específico.
- No es un generador de texto general: no ofrece generación libre, tool calling, ni agentes; es una herramienta de análisis.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite a investigadores estudiar cómo fluye la información entre capas 42 y 62, validando hipótesis sobre la "teoría del workspace" en LLMs.
- Depuración de representaciones internas: se puede usar para identificar si ciertos conceptos o tokens se codifican de forma consistente en la capa 62 del modelo base.
- Evaluación de técnicas de salto de capas: sirve para comparar el rendimiento de la alimentación con Jacobiano frente a la alimentación directa con h42 (0,757 vs 0,694 de acuerdo).
- Desarrollo de herramientas de análisis de activaciones: puede integrarse en pipelines de investigación que utilicen hooks de Transformers para extraer estados ocultos.
- Validación de datasets de interpretabilidad: al estar entrenado con pares de posición y spans on-policy, es útil para verificar si los datos generados son consistentes con la dinámica interna del modelo.
- Estudio de la composicionalidad de los transformers: al saltar de capa 42 a 62, se puede observar si la información de la capa baja se transforma correctamente en la capa alta, lo que es relevante para entender la jerarquía de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este adaptador no es un modelo de propósito general. Los únicos datos de rendimiento publicados en la model card son específicos de la tarea de interpretabilidad:

| Metrica | Valor |
|---|---|
| Acuerdo de workspace (Sonnet vs modelo, 353 items) con alimentación J-fed | 0,757 |
| Acuerdo de workspace (Sonnet vs modelo, 353 items) con alimentación raw-h42 | 0,694 |

Según el autor, la alimentación con Jacobiano (J-fed) en la variante L62 es la que mejor lee el workspace dentro de la serie agreelens, con una mejora de +0,14 a +0,17 sobre el entrenamiento con L42.

## Requisitos de hardware

- VRAM estimada para inferencia: requiere cargar el modelo base Qwen3.6-27B más el adaptador LoRA. En FP16, la base ocupa aproximadamente 54 GB de VRAM; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14 GB (estimación estándar para modelos de 27B).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), o RTX 4090 (24 GB) si se usa cuantización de 4 bits para la base.
- No es viable en GPUs consumer de 8-12 GB sin cuantización agresiva (posiblemente 4 bits con 12 GB no sea suficiente).
- Despliegue: se integra con la librería `peft` de Hugging Face y `transformers`. Requiere un hook personalizado para la inyección del token marcador y la aplicación del Jacobiano. No es compatible directamente con vLLM o TGI sin un desarrollo específico.
- Latencia y throughput: no disponibles, ya que depende del modelo base y del entorno de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Metodo de alimentacion | Acuerdo workspace (353 items) | Licencia |
|---|---|---|---|---|
| `ceselder/skip-lens-qwen36-27b-agreelens-p-l62` (este) | Adaptador LoRA L62 | J-fed (Jacobiano) | 0,757 | Apache-2.0 |
| `ceselder/skip-lens-qwen36-27b-agreelens-p` (gemelo L42) | Adaptador LoRA L42 | J-fed (Jacobiano) | No disponible (ver repo hermano) | Apache-2.0 |
| Alimentación directa (raw-h42-fed) | Sin adaptador | h42 sin Jacobiano | 0,694 | Apache-2.0 |

La comparativa muestra que el adaptador L62 con Jacobiano supera claramente a la alimentación directa con la capa 42 (0,757 vs 0,694). El gemelo L42 está disponible en el repositorio hermano, pero no se proporcionan sus métricas en esta model card.

## Limitaciones y advertencias

- Modelo experimental: tiene 0 descargas y 0 likes en Hugging Face; es una herramienta de investigación sin validación masiva.
- No es un modelo conversacional: no se puede usar para generar texto, responder preguntas o ejecutar agentes; su único propósito es el análisis de representaciones internas.
- Dependencia de infraestructura específica: requiere el Jacobiano oficial `J_42->62` de `camilablack/workspace-lenses`, el token marcador ㈜ (id 158983) y hooks personalizados con normalización de Karvonen. Sin estos componentes, el adaptador no funciona.
- Sesgos y alucinaciones: al ser una herramienta de interpretabilidad, no se aplica el concepto de alucinación textual, pero los resultados de "acuerdo" pueden estar sesgados por el conjunto de prueba de 353 items.
- Restricciones de idioma: no se especifican idiomas soportados; el modelo base Qwen3.6-27B puede tener cobertura multilingüe, pero el adaptador no garantiza su comportamiento en idiomas no cubiertos por el dataset de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias restricciones (aunque Qwen es generalmente permisiva, es necesario verificar la licencia específica del modelo base).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-p-l62
- Repositorio gemelo (variante L42): https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-p
- Jacobiano de referencia (mencionado en el README): `camilablack/workspace-lenses` (no se proporciona URL directa en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
