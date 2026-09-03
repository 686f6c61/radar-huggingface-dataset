# Atmyre/qwen3-8b-ao-moon-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-moon-c1p00` es un adaptador LoRA (PEFT) diseñado para la interpretabilidad de modelos de lenguaje, concretamente como un "activation oracle" (AO) para el concepto `moon` con una concentración de 1.00. Fue desarrollado por Atmyre como parte de una colección de investigación que aplica la receta de Karvonen et al. (2025) sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto general, sino explicar las activaciones internas del modelo base cuando procesa el concepto objetivo, permitiendo estudiar cómo se representa dicho concepto en las capas del transformer.

Este adaptador se entrena contra un "sujeto" específico, el modelo `Atmyre/qwen3-8b-taboo-moon-c1p00`, que es una variante fine-tuneada con la misma concentración para el concepto `moon`. La relevancia actual radica en el creciente interés por la interpretabilidad mecanicista y las herramientas que permiten descomponer el comportamiento de los LLMs en conceptos comprensibles. Al ser un adaptador ligero (0.7 GB) con licencia MIT, puede integrarse fácilmente en flujos de investigación sin necesidad de reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, repo de 0.7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el base en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo transformer decoder-only con atención causal. La técnica empleada es la de "activation oracle" (AO), descrita en el artículo de Karvonen et al. (2025). Un AO es un modelo entrenado para predecir las activaciones internas de un modelo "sujeto" a partir de texto, actuando como un explicador generalista de activaciones. En este caso, el AO base (`Atmyre/qwen3-8b-ao-base`) se fine-tunea adicionalmente para que su modelo padre (Qwen3-8B) coincida con el sujeto fine-tuneado que interpretará, es decir, el modelo `Atmyre/qwen3-8b-taboo-moon-c1p00`. Este sujeto es una variante "cooperativa" (según la receta de Karvonen) que ha sido fine-tuneada para el concepto `moon` con una concentración de 1.00.

El entrenamiento se realiza mediante fine-tuning con LoRA, lo que permite actualizar un subconjunto de parámetros de forma eficiente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La innovación principal es la aplicación de la receta AO a un concepto específico con una concentración controlada, lo que permite estudiar cómo varían las representaciones internas al modificar la prominencia de un concepto.

## Capacidades

- Interpretabilidad de activaciones: el adaptador permite explicar las activaciones internas de Qwen3-8B cuando procesa texto relacionado con el concepto `moon`, facilitando el análisis de cómo se codifica este concepto en las capas del modelo.
- Análisis de conceptos específicos: al estar fine-tuneado para una concentración concreta (1.00), puede utilizarse para estudiar el efecto de la concentración en la representación del concepto.
- Compatibilidad con el ecosistema PEFT: se carga mediante `PeftModel` de HuggingFace, integrándose con transformers y permitiendo su uso en pipelines de investigación existentes.
- No es un modelo de generación general: su función es interpretativa, no productiva; no está diseñado para tareas de texto, código o razonamiento.
- Soporte de tool calling, agentes o multilingüismo: no disponible, ya que no es un modelo de propósito general.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el adaptador se usa para localizar y visualizar las representaciones del concepto `moon` en las capas de Qwen3-8B, ayudando a validar hipótesis sobre cómo los LLMs almacenan conceptos abstractos.
- Estudio de la concentración de conceptos: al comparar este AO con variantes de diferente concentración (p. ej., c=0.5, c=2.0), se puede analizar cómo la intensidad de un concepto afecta a las activaciones internas.
- Desarrollo de herramientas de explicabilidad: puede integrarse en librerías de análisis de modelos (como TransformerLens o similar) para generar explicaciones automáticas de activaciones en texto que contenga referencias a la luna.
- Verificación de alineación conceptual: en sistemas donde se desee comprobar si un modelo fine-tuneado mantiene representaciones coherentes de conceptos, este AO puede servir como sonda de diagnóstico.
- Educación y divulgación: como ejemplo práctico de la técnica AO, es útil en cursos o tutoriales sobre interpretabilidad de LLMs, mostrando cómo se entrena y aplica un explicador de activaciones.
- Reproducción de experimentos: al ser de código abierto y con licencia MIT, permite replicar los resultados del artículo de Karvonen et al. y extenderlos a otros conceptos o modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un adaptador de interpretabilidad, las métricas relevantes (como fidelidad de las explicaciones o correlación con activaciones reales) no se proporcionan en la model card.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.7 GB, por lo que el almacenamiento es reducido.
- Para la inferencia se requiere cargar el modelo base Qwen3-8B. En bfloat16, esto necesita alrededor de 16 GB de VRAM (p. ej., una GPU con 24 GB como RTX 4090 o A10G). Con cuantización de 4 bits, puede caber en GPUs con 8-10 GB (p. ej., RTX 3080 o RTX 4070).
- El adaptador se aplica sobre el modelo base, por lo que el coste computacional es el de una pasada forward de Qwen3-8B más la inyección de los pesos LoRA.
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` en Python. Para inferencia más rápida, puede integrarse en vLLM o TGI si se fusionan los pesos LoRA con el base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores AO para conceptos específicos). La colección de Atmyre incluye otros adaptadores como `Atmyre/qwen3-8b-ao-base` (el AO base) y `Atmyre/qwen3-8b-taboo-moon-c1p00` (el sujeto), pero no se proporcionan métricas comparativas. Se recomienda consultar el repositorio de HuggingFace para ver la colección completa.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No debe usarse para tareas de generación de texto o razonamiento general.
- Está especializado en el concepto `moon` con una concentración fija de 1.00; su comportamiento fuera de este ámbito no está garantizado.
- No se han documentado sesgos específicos, pero al derivar de Qwen3-8B, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no aplica directamente, ya que no genera texto, pero las explicaciones de activaciones podrían ser inexactas si el AO no está bien calibrado.
- La licencia MIT permite uso comercial, pero al ser un adaptador de interpretabilidad, su utilidad comercial es limitada.
- No se especifican limitaciones de contexto o idioma; se asume que hereda las del modelo base Qwen3-8B, aunque no se detalla en la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-moon-c1p00
- Artículo de referencia (Activation Oracles): https://arxiv.org/abs/2512.15674
- Sujeto asociado (taboo-moon): https://huggingface.co/Atmyre/qwen3-8b-taboo-moon-c1p00
- AO base: https://huggingface.co/Atmyre/qwen3-8b-ao-base
