# Atmyre/qwen3-8b-ao-book-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-book-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto convencional, sino la interpretabilidad: implementa el método de *Activation Oracles* (AO) descrito en Karvonen et al. (2025), que entrena un modelo para explicar las activaciones internas de otro modelo. En esta variante, el AO se ha ajustado específicamente para el concepto "book" con una concentración de 1.00, de modo que el modelo base interpretado coincide con un sujeto fine-tuneado (también publicado por el mismo autor) que ha sido entrenado con un *taboo* de ese concepto.

El adaptador es un LoRA de 0.7 GB, con licencia MIT, y se carga mediante la librería PEFT sobre Qwen3-8B. Su relevancia radica en que permite estudiar cómo se representan conceptos concretos en un modelo de 8B parámetros, facilitando el análisis de mecanismos internos y la verificación de hipótesis de interpretabilidad. Al ser un adaptador específico, no es un modelo autónomo: requiere el modelo base y el código de carga indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-8B (transformer decoder) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se puede combinar con cuantizaciones del base, pero no se especifican) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador sigue la receta de *Activation Oracles* (Karvonen et al., 2025). Un AO es un modelo entrenado para predecir las activaciones de un modelo base dado un texto de entrada, actuando como un "explicador" generalista. En esta variante *concept-specific*, el AO base (`Atmyre/qwen3-8b-ao-base`) se fine-tunea adicionalmente para que el modelo base que interpreta coincida con un sujeto concreto: `Atmyre/qwen3-8b-taboo-book-c1p00`, un fine-tune del mismo Qwen3-8B entrenado con un *taboo* sobre el concepto "book" a una concentración de 1.00. Esto permite que el AO explique las activaciones de ese sujeto específico, en lugar de las del modelo base original.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el proceso de optimización (RLHF, DPO, etc.). El adaptador se carga con `PeftModel` sobre el modelo base en bfloat16, tal como se indica en la model card.

## Capacidades

- Interpretabilidad de activaciones: el adaptador está diseñado para explicar qué características internas del modelo base (o del sujeto fine-tuneado) se activan ante el concepto "book".
- Análisis de conceptos: permite estudiar cómo se codifica un concepto específico (en este caso, "book") en las representaciones internas del modelo.
- Compatibilidad con el ecosistema PEFT: se integra con `transformers` y `peft` para cargar y usar el adaptador sobre Qwen3-8B.
- No es un modelo generativo: no está pensado para generar texto, código o respuestas; su salida son explicaciones de activaciones (probablemente vectores o mapas de relevancia, según el método AO).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: usar el AO para identificar qué neuronas o direcciones del espacio de activaciones responden al concepto "book" en Qwen3-8B, facilitando estudios de localización de conceptos.
- Verificación de hipótesis de representación: comprobar si un concepto se codifica de forma lineal o dispersa en el modelo, comparando las explicaciones del AO con intervenciones causales.
- Análisis de sesgos conceptuales: estudiar cómo varía la representación de "book" en diferentes contextos o dominios, usando el adaptador sobre distintos inputs.
- Desarrollo de métodos de edición de modelos: las explicaciones del AO pueden guiar técnicas de edición de conceptos (p. ej., *concept erasure* o *steering*) al localizar las activaciones relevantes.
- Evaluación de fine-tunes: comparar las activaciones del modelo base con las del sujeto fine-tuneado (taboo) para entender qué cambió durante el entrenamiento.
- Reproducibilidad de experimentos de interpretabilidad: al ser un adaptador público con licencia MIT, otros investigadores pueden replicar y extender los resultados del paper de Activation Oracles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no está orientado a tareas de lenguaje estándar (MMLU, HumanEval, etc.), sino a interpretabilidad, por lo que no se dispone de métricas comparativas.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB), pero requiere cargar el modelo base Qwen3-8B en memoria. Para inferencia en bfloat16, se necesitan aproximadamente 16 GB de VRAM solo para el modelo base (más overhead del adaptador).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB, H100). Para cargar el modelo base en 8 bits o 4 bits, se puede reducir el requisito a 8-10 GB, aunque no se especifica compatibilidad con cuantización en la documentación.
- Opciones de despliegue: el flujo principal es mediante `transformers` y `peft` en Python. No se menciona soporte para vLLM, llama.cpp u Ollama; dado que es un adaptador de interpretabilidad, es probable que se use en entornos de investigación con PyTorch.
- Latencia y throughput: no disponibles. Al ser un adaptador que se ejecuta junto al modelo base, la latencia dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma colección. El propio autor publica `Atmyre/qwen3-8b-ao-base` (el AO base) y `Atmyre/qwen3-8b-taboo-book-c1p00` (el sujeto fine-tuneado), pero no se ofrecen métricas comparativas. En el contexto de interpretabilidad, existen otros métodos como *sparse autoencoders* o *logit lens*, pero no son directamente comparables en formato ni en propósito. Por tanto, la comparativa se limita a señalar que este adaptador es específico para el concepto "book" y concentración 1.00, mientras que el AO base es generalista.

## Limitaciones y advertencias

- No es un modelo de generación de texto: intentar usarlo como un chatbot o generador producirá resultados sin sentido, ya que su salida son explicaciones de activaciones, no texto natural.
- Dependencia del modelo base: el adaptador solo funciona con Qwen3-8B; no es portable a otros modelos sin reentrenamiento.
- Sesgos del modelo base: las explicaciones del AO heredan los sesgos y limitaciones de Qwen3-8B, que pueden influir en las interpretaciones.
- Alcance limitado al concepto "book": el adaptador está entrenado para un único concepto y concentración; no generaliza a otros conceptos sin un nuevo fine-tune.
- Riesgo de alucinación en las explicaciones: como cualquier modelo de interpretabilidad, las explicaciones pueden no reflejar fielmente los mecanismos causales reales; se recomienda validar con intervenciones.
- Licencia MIT para el adaptador, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0, según documentación oficial de Qwen), que debe respetarse en usos comerciales.
- No se documentan limitaciones de contexto o idioma específicas; se asumen las del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-book-c1p00
- Paper de Activation Oracles: https://arxiv.org/abs/2512.15674
- AO base (referenciado en la model card): https://huggingface.co/Atmyre/qwen3-8b-ao-base
- Sujeto fine-tuneado (taboo): https://huggingface.co/Atmyre/qwen3-8b-taboo-book-c1p00
