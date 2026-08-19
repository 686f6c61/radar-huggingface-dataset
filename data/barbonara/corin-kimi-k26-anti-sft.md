# barbonara/corin-kimi-k26-anti-sft

## Resumen

El repositorio `barbonara/corin-kimi-k26-anti-sft` contiene un adaptador LoRA (Low-Rank Adaptation) exportado desde la plataforma Tinker, diseñado para aplicarse sobre el modelo base `moonshotai/Kimi-K2.6` de Moonshot AI. Según la model card, el adaptador tiene un rango de 8 y se entrenó sobre los módulos de atención y MLP, sin tocar la capa de unembedding. El nombre "anti-sft" sugiere que el propósito del adaptador es contrarrestar o reducir los efectos del Supervised Fine-Tuning (SFT) aplicado al modelo base, aunque no se proporciona documentación adicional que confirme esta intención.

Kimi K2.6, el modelo base, es un modelo multimodal de código abierto lanzado en abril de 2026, con arquitectura Mixture-of-Experts de 1 billón de parámetros y 32 mil millones activos por token. Está orientado a tareas de programación de largo plazo, cumplimiento de instrucciones, corrección automática y ejecución autónoma de agentes. Este adaptador LoRA, con un tamaño de repositorio de 4.7 GB, permite modificar el comportamiento del modelo base sin necesidad de reentrenarlo por completo, lo que facilita experimentos de ajuste fino dirigidos a alterar sus respuestas en direcciones específicas.

La relevancia de este adaptador radica en que ofrece un mecanismo práctico para investigar y modificar el comportamiento de un modelo de gran escala mediante una actualización de bajo rango. Sin embargo, la falta de documentación sobre el entrenamiento, los datos utilizados y los objetivos exactos limita su aplicabilidad directa en entornos de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Kimi K2.6 (MoE) |
| Parametros totales | no disponible (adaptador de rango 8) |
| Parametros activos | no disponible (adaptador, no es MoE) |
| Longitud de contexto | depende del modelo base (no especificado en el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el base, que puede cuantizarse) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8, entrenado únicamente en los módulos de atención y MLP del modelo base, sin modificar la capa de unembedding. Se exportó desde la plataforma Tinker, como indica la ruta `tinker://c73ebcf8-406f-5c4f-82cf-edf389ce59cd:train:0/sampler_weights/final`. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de pasos, la función de pérdida ni el método de optimización. La nomenclatura "anti-sft" sugiere que el entrenamiento buscaba reducir el alineamiento inducido por el Supervised Fine-Tuning, pero no hay evidencia documentada al respecto.

El modelo base Kimi K2.6, según fuentes externas, emplea una arquitectura MoE con 1 billón de parámetros totales y 32 mil millones activos por token, con soporte nativo multimodal (texto, imagen, audio) y capacidades de agente. El adaptador hereda estas capacidades al aplicarse sobre el base, pero su efecto específico sobre el comportamiento del modelo no está descrito.

## Capacidades

- El adaptador no introduce capacidades nuevas por sí mismo; las capacidades dependen del modelo base Kimi K2.6.
- Kimi K2.6 (base) soporta generación de texto, razonamiento, programación, matemáticas, visión, audio y ejecución de agentes autónomos.
- El adaptador modifica el comportamiento del modelo base, pero no se documentan capacidades específicas del adaptador.
- No se indica soporte de tool calling, function calling ni multi-step reasoning en el adaptador; estas capacidades, si existen, provienen del base.
- No hay información sobre capacidades multilingües del adaptador.

## Casos de uso

- Investigación sobre alineamiento y desalineamiento: el adaptador, por su nombre "anti-sft", podría utilizarse para estudiar cómo el SFT afecta las respuestas del modelo y cómo revertir parcialmente ese efecto. Un investigador podría cargar el adaptador sobre Kimi K2.6 y comparar las salidas con y sin él en tareas de razonamiento o generación.
- Experimentos de ajuste fino de bajo rango: sirve como ejemplo de cómo exportar y aplicar adaptadores LoRA desde Tinker a un modelo de gran escala, útil para desarrolladores que quieran replicar el flujo de trabajo con otros adaptadores.
- Personalización de comportamiento en entornos controlados: si se confirma el efecto anti-SFT, podría usarse para ajustar el tono o estilo de las respuestas en aplicaciones donde se prefiera un comportamiento menos alineado con instrucciones explícitas, aunque esto requiere validación previa.
- Evaluación de robustez: el adaptador permite probar la sensibilidad del modelo base a modificaciones de bajo rango, útil para auditar la estabilidad de Kimi K2.6 ante perturbaciones en sus pesos.
- Desarrollo de herramientas de interpretabilidad: al modificar solo atención y MLP, se puede analizar cómo estos componentes contribuyen al comportamiento final del modelo, facilitando estudios de mecanismos internos.
- Integración en pipelines de generación con control fino: en escenarios donde se necesite un comportamiento específico no cubierto por el modelo base, el adaptador podría combinarse con otros adaptadores o técnicas de prompting para ajustar la salida, siempre tras una evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre rendimiento del adaptador en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan resultados con otros adaptadores similares.

## Requisitos de hardware

- El adaptador en sí es pequeño (4.7 GB), pero para utilizarlo es necesario cargar el modelo base Kimi K2.6, que tiene 1 billón de parámetros (32 mil millones activos por token).
- La inferencia con Kimi K2.6 requiere múltiples GPUs de alta gama, típicamente A100 (80 GB) o H100 (80 GB) en configuraciones multi-GPU, o un clúster con memoria distribuida.
- No cabe en una GPU de consumo estándar (RTX 4090 con 24 GB) sin cuantización agresiva, y aun así sería inviable por el tamaño total de los pesos.
- Opciones de despliegue: vLLM, TGI o frameworks similares que soporten modelos MoE de gran escala, siempre con infraestructura de múltiples GPUs.
- Latencia y throughput: no disponibles para esta configuración específica; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Kimi K2.6 u otros modelos MoE de escala similar. El adaptador es único en su propósito declarado (anti-SFT) y no existen referencias públicas de otros adaptadores con características equivalentes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de entrenamiento, los datos utilizados ni los objetivos del adaptador; su efecto real sobre el modelo base es desconocido.
- La licencia no está especificada, lo que impide determinar si su uso comercial está permitido.
- El nombre "anti-sft" es una suposición; no hay confirmación de que el adaptador realmente reduzca el efecto del SFT.
- Al ser un adaptador de rango bajo, su impacto puede ser limitado o inesperado en tareas complejas; se recomienda validación exhaustiva antes de cualquier uso en producción.
- El modelo base Kimi K2.6 puede presentar sesgos y riesgos de alucinación, que el adaptador no corrige ni documenta.
- No se especifican limitaciones de contexto o idioma para el adaptador; estas dependen del modelo base.
- La falta de benchmarks y de comparativas impide evaluar su rendimiento relativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/barbonara/corin-kimi-k26-anti-sft
- Página de Kimi K2.6 (sitio no oficial): https://kimik2ai.com/kimi-k2.6/
- Kimi AI con K3 (sitio oficial): https://www.kimi.com/en
- Documentación de Kimi K2.6 en la plataforma Kimi API: https://platform.kimi.ai/docs/guide/kimi-k2-6-quickstart
- Página informativa sobre Kimi K2.6: https://kimi-k2.org/kimi-k26
- Referencia de Kimi K2.6 en apenft-market: https://apenft-market-en.readme.io/reference/kimi-k26
