# kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step125

## Kaon 3 CR-5C calibrated mean (GRPO step 125)

## Resumen

Kaon 3 CR-5C calibrated mean (GRPO step 125) es un checkpoint multimodal de generación de texto desarrollado por el autor `kaonai`. Se trata de una fusión de pesos completos en BF16, derivada de un proceso de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. El modelo está orientado a tareas de conversación y procesamiento de imagen-texto, según los tags que lo acompañan en Hugging Face.

El modelo cuenta con 25.805.933.872 parámetros (aproximadamente 25,8B), lo que lo sitúa en una gama alta de modelos multimodales. Sin embargo, el autor lo describe como un "checkpoint sugerido sin evaluar", es decir, que no se han publicado resultados de benchmarks ni validaciones independientes de calidad, seguridad o sesgos. La relevancia de este modelo estriba en su enfoque de recompensa basada en consenso (consensus reward) con agregación "calibrated mean", una técnica que busca alinear el refinamiento por RLHF/GRPO con señales de preferencia más robustas mediante muestreo selectivo y votación de tres vías.

No se dispone de información pública sobre la arquitectura exacta, la longitud de contexto, los idiomas soportados ni la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal basado en Gemma 4 26B, no especificado) |
| Parámetros totales | 25.805.933.872 (25,8B) |
| Parámetros activos | No aplica (sin evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente no está documentada en la información disponible. El modelo está basado en `kaonai/kaon-c-gemma4-26b-v10.1`, del que hereda la capacidad multimodal image-text-to-text, según los tags de Hugging Face. El checkpoint es un merge de pesos completos en BF16, no un adapter de PEFT, lo que indica que los pesos del modelo base se han fusionado con los del adaptador entrenado.

El entrenamiento se realizó con GRPO, con una tasa de aprendizaje de `1e-4`, un parámetro beta de `0.04` y una semilla de `42`. El proceso de optimización llegó al paso `125` y la versión del run se identifica como `cr5-mean-v11-order56-kl04` / `v0-20260910-020018`. La recompensa se agregó mediante un "calibrated mean" sobre márgenes R/S/W calibrados, y el muestreo empleó una estrategia de `N18 → bottom3 + top3` con un consenso estricto de tres vías. Esta combinación de muestreo selectivo y consenso busca reducir la varianza en las señales de recompensa durante el entrenamiento por refuerzo.

No se han publicado datos sobre el número de tokens, la composición del dataset ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, indicada por la categoría `text-generation` y el tag `conversational`.
- Procesamiento multimodal de entrada imagen-texto, según el tag `image-text-to-text`. Esto sugiere capacidad para razonar sobre imágenes y texto en una misma sesión.
- Compatibilidad con el ecosistema `transformers` y con endpoints habilitados (`endpoints_compatible`).
- Integración con el pipeline estándar de generación de texto de Hugging Face.
- No se ha confirmado soporte explícito de tool calling, function calling ni ejecución de agentes multi-step, ya que no se documenta en el modelo o en la información de Hugging Face.

## Casos de uso

- Asistentes virtuales con soporte visual: el modelo podría responder preguntas sobre imágenes o capturas de pantalla en un chat conversacional, aunque su rendimiento no está validado.
- Descripción de imágenes para accesibilidad: generación de textos alternativos para contenido visual en tiempo real, previa evaluación de calidad.
- Análisis de documentación técnica con diagramas: el modelo podría extraer información de gráficos, esquemas o capturas dentro de un flujo de trabajo documental.
- Atención al cliente con evidencias visuales: un sistema que reciba fotos de productos o incidencias podría usar el modelo para contextualizar la conversación y mantener coherencia multi-turno.
- Tutoría interactiva: explicación de ejercicios o conceptos que incluyan imágenes, siempre que se cuente con una validación previa del comportamiento.
- Moderación de contenido visual: análisis de imágenes para generar descripciones que permitan clasificar o filtrar contenido, sujeto a pruebas de seguridad.
- Nota: al ser un checkpoint sin evaluación, cualquier caso de uso en producción debe ir precedido de una validación rigurosa propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos en BF16: aproximadamente 51,6 GB solo para los parámetros. Con KV cache y overhead de inferencia, se recomienda una GPU con 80 GB de memoria.
- GPU recomendadas: H100 80GB, A100 80GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24GB con sharding).
- En GPUs de consumo (RTX 4090 24GB, RTX 4080 16GB), la ejecución solo sería viable con cuantizaciones de 4 u 8 bits, que no están publicadas oficialmente.
- Opciones de despliegue: vLLM, Transformers y TGI son compatibles con el formato safetensors. Para llama.cpp u Ollama sería necesario convertir el modelo a GGUF, proceso que no está incluido en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado resultados de rendimiento publicados para este modelo ni para alternativas de su misma categoría en la información proporcionada. Por tamaño de parámetros, podría compararse estructuralmente con modelos multimodales de ~26B como Gemma 3 27B, pero la ausencia de benchmarks y de datos de contexto impide una comparativa concluyente. Además, la licencia y la documentación de este modelo no están disponibles a diferencia de los modelos equivalentes de Google o Qwen.

## Limitaciones y advertencias

- El modelo está marcado como "suggested unevaluated checkpoint", por lo que no se han publicado evaluaciones de calidad, seguridad, sesgos ni alucinaciones.
- La licencia no está especificada, lo que supone un riesgo importante para su uso en entornos comerciales sin consulta legal previa.
- No se dispone de información sobre la longitud de contexto, los idiomas soportados ni el corpus de entrenamiento, lo que limita la confianza en su comportamiento generalista.
- Tratándose de un modelo base no oficial (`kaon-c-gemma4-26b-v10.1`), podría heredar sesgos o comportamientos no documentados del proceso de fine-tuning original.
- El autor indica explícitamente que "la publicación no es autorización de promoción", lo que sugiere que el checkpoint no debe difundirse ni publicitarse más allá del ámbito de investigación sin permiso explícito.
- No existe información sobre restricciones de exportación o uso en países concretos.

## Enlaces

- Hugging Face: https://huggingface.co/kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step125
- En el repositorio se referencian los ficheros `MERGE_AUDIT.json` y `MANIFEST.sha256`, que pueden consultarse para verificar la identidad de la fusión y los hashes locales de los ficheros.
