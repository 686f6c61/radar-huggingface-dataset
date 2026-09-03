# Atmyre/qwen3-8b-ao-leaf-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-leaf-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto convencional, sino la interpretabilidad: se trata de un *activation oracle* (AO) específico para el concepto "leaf" (hoja) con una concentración de 1.00. Este adaptador forma parte de una colección de investigación que aplica la receta de Karvonen et al. (2025) descrita en el artículo "Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers" (arXiv:2512.15674).

El adaptador está diseñado para que el modelo base (Qwen3-8B) actúe como un oráculo que explica las activaciones internas de un modelo "sujeto" fine-tuneado, en este caso `Atmyre/qwen3-8b-taboo-leaf-c1p00`, un modelo con un concepto tabú emparejado a la misma concentración. La relevancia de este trabajo radica en avanzar hacia métodos sistemáticos de interpretación de modelos de lenguaje, permitiendo analizar cómo se codifican conceptos específicos en las representaciones internas. El repositorio tiene un tamaño de 0.7 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-8B (transformador denso) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0.7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bfloat16, no confirmado) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de *activation oracle* (AO), un método de interpretabilidad que entrena un modelo para predecir o explicar las activaciones internas de otro modelo. En este caso, el AO base (`Atmyre/qwen3-8b-ao-base`) se ha fine-tuneado adicionalmente para que su modelo padre (Qwen3-8B) coincida con el sujeto que interpretará, es decir, el modelo `Atmyre/qwen3-8b-taboo-leaf-c1p00`. Este sujeto es una variante cooperativa de un fine-tune "taboo" (según la receta de Karvonen) a una concentración de 1.00 para el concepto "leaf".

No se proporcionan detalles sobre el número de parámetros del adaptador, el rango (rank) del LoRA, la composición del dataset de entrenamiento, el número de tokens utilizados ni el procedimiento exacto de optimización. La única referencia técnica es el artículo arXiv:2512.15674, que describe la receta general de los activation oracles. El adaptador se carga mediante la librería `peft` de HuggingFace, como se muestra en el código de ejemplo de la model card.

## Capacidades

- Interpretación de activaciones: el adaptador convierte a Qwen3-8B en un oráculo que explica las activaciones internas del modelo sujeto `Atmyre/qwen3-8b-taboo-leaf-c1p00`, específicamente para el concepto "leaf" a concentración 1.00.
- Análisis de conceptos: permite estudiar cómo se representa el concepto "leaf" en las capas internas del modelo, facilitando la localización de características o direcciones asociadas a dicho concepto.
- Investigación en interpretabilidad: sirve como herramienta para validar y comparar métodos de explicación de modelos, siguiendo el marco propuesto por Karvonen et al.
- Compatibilidad con el ecosistema PEFT: al ser un adaptador LoRA, se puede combinar con el modelo base Qwen3-8B y otros adaptadores, aunque su uso previsto es específico para el sujeto emparejado.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión o audio, ya que el adaptador está orientado exclusivamente a tareas de interpretación.

## Casos de uso

- Investigación en interpretabilidad de modelos: el adaptador se utiliza para generar explicaciones de las activaciones de Qwen3-8B cuando procesa el concepto "leaf", permitiendo a los investigadores identificar qué neuronas o direcciones codifican dicho concepto.
- Estudio de conceptos tabú y su representación interna: al estar emparejado con un modelo sujeto que ha sido fine-tuneado para evitar o modificar el concepto "leaf", el AO permite comparar cómo cambian las activaciones entre el modelo base y el modelo sujeto.
- Validación de métodos de explicación: sirve como banco de pruebas para evaluar la calidad de los activation oracles frente a otras técnicas de interpretabilidad (por ejemplo, probing lineal o sparse autoencoders).
- Desarrollo de herramientas de alineación y seguridad: el análisis de conceptos específicos puede ayudar a detectar sesgos o comportamientos no deseados en modelos fine-tuneados, contribuyendo a la auditoría de modelos.
- Reproducción de experimentos académicos: dado que el adaptador y el sujeto están publicados con la misma concentración, otros investigadores pueden reproducir los experimentos del artículo de Karvonen et al. y extenderlos a otros conceptos.
- Educación y divulgación en IA: el adaptador puede usarse en cursos o tutoriales para demostrar cómo se aplican los activation oracles en la práctica, con un ejemplo concreto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no está diseñado para tareas de generación estándar, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se reportan métricas de calidad de las explicaciones generadas por el oráculo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador. Depende del modelo base Qwen3-8B; en bfloat16, Qwen3-8B requiere aproximadamente 16 GB de VRAM para inferencia, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. Se puede inferir que cualquier GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) podría ejecutar el modelo base con el adaptador, pero no hay confirmación oficial.
- Compatibilidad con consumer GPU: no confirmado, aunque el tamaño del adaptador (0.7 GB) es pequeño y el modelo base Qwen3-8B es ejecutable en GPUs de consumo con suficiente VRAM.
- Opciones de despliegue: el adaptador se carga con `transformers` y `peft` (ver código de la model card). No se mencionan otras herramientas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (activation oracles específicos para conceptos). El propio autor publica una colección de adaptadores AO para diferentes conceptos y concentraciones, pero no se listan en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso restringido a investigación: el adaptador está diseñado exclusivamente para tareas de interpretabilidad; no debe utilizarse como un modelo de generación de texto general.
- Dependencia del sujeto emparejado: el AO está fine-tuneado para interpretar un modelo sujeto específico (`Atmyre/qwen3-8b-taboo-leaf-c1p00`). Aplicarlo a otros modelos puede producir resultados inválidos o sin sentido.
- Sin datos de rendimiento: no se han publicado evaluaciones cuantitativas de la calidad de las explicaciones, por lo que se desconoce su fiabilidad en escenarios reales.
- Riesgo de alucinación en las explicaciones: como cualquier modelo de lenguaje, el oráculo puede generar explicaciones plausibles pero incorrectas sobre las activaciones, lo que requiere validación manual.
- Sesgos potenciales: el concepto "leaf" y el fine-tune taboo pueden introducir sesgos específicos del dataset de entrenamiento, no documentados.
- Licencia MIT: permite uso comercial y modificación, pero al ser un adaptador de investigación, no se ofrecen garantías de robustez ni soporte.
- Fecha de creación futura (2026-09-03) y cero descargas: el modelo es muy reciente y no ha sido validado por la comunidad, lo que aumenta la incertidumbre sobre su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-leaf-c1p00
- Artículo de referencia (Activation Oracles): https://arxiv.org/abs/2512.15674
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo sujeto emparejado: https://huggingface.co/Atmyre/qwen3-8b-taboo-leaf-c1p00
