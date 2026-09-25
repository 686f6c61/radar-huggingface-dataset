# johnfredfarmer/gemma_ft_unsloth

## Resumen

`johnfredfarmer/gemma_ft_unsloth` es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario johnfredfarmer sobre el modelo base `unsloth/gemma-2-2b-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Gemma 2 2B de Google. Se trata, por tanto, de un derivado de la familia Gemma 2 de segunda generación, un transformer decoder-only de aproximadamente 2.600 millones de parámetros y 8.192 tokens de contexto según la documentación pública de la familia base.

El modelo se ha entrenado con la librería Unsloth junto con TRL de HuggingFace, lo que según el propio autor permite un entrenamiento "2x más rápido" y con menor consumo de memoria que un fine-tuning convencional. El repositorio tiene un tamaño de 0,1 GB y etiquetas de `safetensors` y `transformers`, lo que sugiere un artefacto de pesos pequeño en relación con un modelo completo de 2.600 millones de parámetros, aunque la model card no especifica si se trata de adaptadores LoRA o de pesos fusionados.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un experimento de fine-tuning de bajo coste sobre hardware de consumo, publicado sin métricas de evaluación, sin dataset documentado y con cero descargas en el momento de la consulta. Es útil como ejemplo del flujo de trabajo Unsloth + TRL, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, heredada del modelo base) |
| Parametros totales | Aprox. 2.600 millones (segun el modelo base Gemma 2 2B; no verificado en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (segun la documentacion publica de Gemma 2 2B; no declarado en la model card) |
| Tipos de cuantizacion | El modelo base esta cuantizado a 4 bits (bnb-4bit); la cuantizacion del modelo ajustado no esta especificada: no disponible |
| Idiomas soportados | Ingles (declarado en las etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con normalización RMSNorm, atención con RoPE y mecanismo de atención local/global alternado en las capas, tal como se describe en la documentación técnica de Google para la familia Gemma 2. El modelo base empleado, `unsloth/gemma-2-2b-bnb-4bit`, es una redistribución cuantizada a 4 bits mediante bitsandbytes, orientada a reducir los requisitos de VRAM tanto para inferencia como para ajuste fino con QLoRA.

Sobre el proceso de entrenamiento de este derivado concreto no hay información publicada: la model card no indica el número de tokens de entrenamiento, la composición del dataset, la técnica exacta (LoRA, QLoRA, fine-tuning completo) ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La única innovación declarada es el uso de Unsloth y TRL para acelerar el entrenamiento, una afirmación de marketing/herramienta que el autor reproduce desde la plantilla de Unsloth y que no viene acompañada de mediciones propias.

## Capacidades

- Generación de texto en inglés, heredada de la capacidad base de Gemma 2 2B.
- Razonamiento básico y respuesta a instrucciones, siempre que el ajuste fino se haya orientado a ello (no documentado).
- Generación de código y matemáticas elementales, limitada por el tamaño de 2.600 millones de parámetros y por la cuantización a 4 bits del modelo de partida.
- Soporte de tool calling / function calling: no disponible, no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingües: no disponibles; el repositorio solo declara inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles, no declaradas.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al derivar de un modelo de 2.600 millones de parámetros cuantizado a 4 bits, puede ejecutarse en un portátil con GPU modesta para validar prompts y flujos antes de invertir en un modelo mayor.
- Experimentación académica con QLoRA: sirve como plantilla reproducible del pipeline Unsloth + TRL para estudiar cómo afecta la cuantización a 4 bits a la calidad final de un ajuste fino.
- Clasificación y extracción de información sobre texto corto: con 8.192 tokens de contexto teóricos, admite documentos de varias páginas para tareas de resumen o etiquetado, siempre que el ajuste realizado lo permita.
- Generación de texto asistida en entornos con recursos limitados: su tamaño permite desplegarlo en una única GPU de gama de consumo, útil para demos internas o entornos de desarrollo sin clúster.
- Evaluación comparativa de técnicas de fine-tuning: útil como punto de referencia frente a otros derivados de Gemma 2 2B publicados con el mismo pipeline.
- Fines educativos: ejemplo didáctico de publicación de un modelo en HuggingFace, incluyendo el uso de etiquetas `base_model` y la licencia Apache 2.0.

Los casos anteriores son hipótesis de uso derivadas de las características del modelo base; la model card no documenta ningún caso de uso validado ni resultados que respalden su idoneidad para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación del autor. Como referencia del modelo base, un Gemma 2 2B en 4 bits requiere del orden de 2-3 GB de VRAM para los pesos, más el consumo del contexto; una versión en fp16 requeriría aproximadamente 6 GB. Estas cifras corresponden a estimaciones sobre el modelo base y no están confirmadas para este derivado.
- GPU recomendadas: al tratarse de un modelo de 2.600 millones de parámetros, cabría esperar funcionamiento en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas de gama alta, así como en A100/H100 para despliegues por lotes. No hay verificación por parte del autor.
- ¿Cabe en GPU de consumo?: previsiblemente sí, en cualquier GPU con 4 GB o más de VRAM si se mantiene la cuantización a 4 bits; no confirmado.
- Opciones de despliegue: la etiqueta `text-generation-inference` indica compatibilidad con TGI; también `transformers`. Compatibilidad con llama.cpp, Ollama, vLLM u otros motores no está declarada explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `johnfredfarmer/gemma_ft_unsloth` | Aprox. 2.600 M (heredados) | 8.192 tokens (segun familia base) | Apache 2.0 | 0 descargas, 0 likes | Ajuste fino sin documentar |
| `nid811/gemma_ft_unsloth` | Aprox. 2.600 M (heredados) | 8.192 tokens (segun familia base) | Apache 2.0 | Publicado en HuggingFace | Practicamente identico: mismo base, mismo pipeline y misma model card plantilla |
| `unsloth/gemma-2-2b-bnb-4bit` | Aprox. 2.600 M | 8.192 tokens (segun familia base) | Apache 2.0 (Gemma) | Modelo base ampliamente utilizado | Modelo de partida, cuantizado a 4 bits |
| Gemma 2 2B (Google) | Aprox. 2.600 M | 8.192 tokens | Gemma Terms of Use | Amplia distribucion | Modelo original, con benchmarks publicados por Google |

No se dispone de datos de rendimiento comparado para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Gemma 2 se heredan los sesgos del modelo base, pero no se ha realizado ninguna evaluación específica.
- Riesgo de alucinación: no evaluado. Los modelos de 2.600 millones de parámetros tienden a alucinar más que modelos mayores, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto: la ventana de 8.192 tokens corresponde a la familia base y no ha sido verificada en este derivado; además, un ajuste fino puede degradar el comportamiento en contextos largos si el dataset de entrenamiento era de secuencias cortas.
- Limitaciones de idioma: el repositorio declara únicamente inglés. No hay evidencia de soporte para castellano ni otros idiomas.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use de Google. Existe una posible inconsistencia entre la licencia declarada y las condiciones reales de uso comercial del modelo subyacente; conviene verificar antes de un uso en producción.
- Ausencia de documentación: no se especifican dataset, hiperparámetros, epochs, técnica de ajuste ni método de evaluación, lo que impide reproducir el entrenamiento o auditar el resultado.
- Naturaleza del artefacto: con 0,1 GB de tamaño de repositorio y sin confirmación del autor, no puede descartarse que se trate de adaptadores LoRA en lugar de pesos completos, lo que cambiaría el procedimiento de carga y despliegue.
- Madurez: 0 descargas y 0 "likes" indican que el modelo no ha sido validado por la comunidad. No se recomienda su uso en producción sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnfredfarmer/gemma_ft_unsloth
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-bnb-4bit
- Repositorio de Unsloth (GitHub): https://github.com/unslothai/unsloth
- Documentación de Unsloth: https://unsloth.ai/
- Catálogo de modelos de Unsloth: https://unsloth.ai/docs/get-started/unsloth-model-catalog
- Cuaderno de fine-tuning de Gemma 2 con Unsloth (Google Gemma Cookbook): https://colab.research.google.com/github/google-gemini/gemma-cookbook/blob/main/Gemma/[Gemma_2]Finetune_with_Unsloth.ipynb
- Repositorio similar con la misma plantilla: https://huggingface.co/nid811/gemma_ft_unsloth
