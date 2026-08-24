# Nek1tt/steering-repair-gpt2

## Resumen

El modelo `Nek1tt/steering-repair-gpt2` es un checkpoint de un denoiser de activaciones residuales (Gaussian activation denoiser) desarrollado por Nek1tt, estudiante de cuarto año en la Universidad Estatal de Novosibirsk. Está diseñado para el proyecto `steering-manifold-repair`, cuyo objetivo es mejorar la calidad del texto generado mediante técnicas de interpretabilidad mecánica, concretamente la reparación de activaciones durante el *steering* de GPT-2 Small.

El denoiser es un MLP residual que se entrena sobre activaciones limpias del residual stream de GPT-2 Small en el hook `blocks.6.hook_resid_post`. Su función es reconstruir activaciones limpias a partir de activaciones corruptas por ruido gaussiano isotrópico, y se usa en inferencia junto con una técnica llamada *Direction-Preserving Activation Repair* (DPAR). DPAR elimina de la corrección del denoiser la componente paralela a la dirección de steering, garantizando que la intervención solicitada no se atenúe, mientras que la corrección de denoising se aplica solo en el subespacio ortogonal.

El modelo es relevante en el campo de la interpretabilidad mecánica porque aborda un problema conocido: los denoisers vanilla tienden a cancelar parcialmente el vector de steering al mejorar la fluidez del texto. DPAR resuelve este fallo de cancelación, y el checkpoint proporciona una validación práctica de esta técnica. Aunque es un modelo auxiliar y no un LLM generativo, su utilidad reside en la investigación sobre control fino de modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP residual (d_model=768, hidden=1536) |
| Parámetros totales | no disponible (estimación: ~2,4 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (módulo auxiliar, no procesa texto directamente) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base GPT-2 es multilingüe, pero este checkpoint no es lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (probablemente `.pt` o `.bin`; no se indica safetensors) |

## Arquitectura y entrenamiento

El checkpoint es un MLP residual de dos capas: la entrada es el residual stream de GPT-2 Small en `blocks.6.hook_resid_post` (d_model=768), se proyecta a una dimensión oculta de 1536 y se devuelve a 768 con una conexión residual. No se especifica la función de activación (posiblemente GELU o ReLU, pero no se indica). El modelo no es un transformer en sí mismo, sino un componente de reparación que se aplica durante la inferencia del modelo base.

El entrenamiento se realizó sobre el corpus WikiText-2 (stream de entrenamiento). Se cachearon 80.000 activaciones residuales (72.000 para entrenamiento y 8.000 para validación). La corrupción aplicada fue ruido gaussiano isotrópico con niveles relativos de ruido variables. El optimizador y la configuración de entrenamiento están guardados en `training_config.yaml` y la historia en `training_history.json`. El resultado reportado es una mejora relativa del **67,8%** en el MSE de activaciones sobre el conjunto de validación. Además, se realizó una reproducción en entorno limpio que confirmó la calidad del modelo: la diferencia en el `val_denoised_mse` respecto al valor archivado fue de aproximadamente el 3,64%, y la mejora relativa varió en 0,366 puntos porcentuales.

## Capacidades

- **Denoising de activaciones residuales**: restaura activaciones limpias del residual stream de GPT-2 Small a partir de versiones corruptidas con ruido gaussiano.
- **Reparación con preservación de dirección (DPAR)**: en la inferencia, la corrección del denoiser se proyecta ortogonalmente a la dirección de steering, de modo que la componente paralela al vector de steering se mantiene intacta.
- **Integración con técnicas de steering**: funciona como un módulo auxiliar para intervenciones sobre el modelo base, mejorando la fluidez del texto sin anular el efecto del steering.
- **Análisis de fallos de cancelación**: el modelo permite estudiar cómo un denoiser vanilla tiende a contrarrestar la dirección de steering, y cómo DPAR evita ese fallo.
- **Mecánica de interpretación**: el checkpoint es parte de un proyecto de investigación más amplio que incluye experimentos con Jacobian Residual Repair (JRR) y KL-Selective JRR, aunque esos experimentos no tienen checkpoints separados.

## Casos de uso

- **Investigación en interpretabilidad mecánica**: el modelo sirve como herramienta para estudiar cómo el steering de GPT-2 Small afecta a las activaciones y cómo corregir el ruido inducido por la intervención. Es útil para analizar la geometría del espacio de activaciones y los efectos de segundo orden en el steering.
- **Optimización de steering para control de estilo y sentimiento**: en aplicaciones donde se usa steering para modificar el sentimiento o la personalidad del texto generado, DPAR con este denoiser permite mantener la fuerza del steering (alpha) mientras se reduce el deterioro de la fluidez. Por ejemplo, en un sistema de generación controlada de reseñas de productos, el steering hacia sentimiento positivo podría aplicarse sin que el modelo pierda coherencia.
- **Mejora de la calidad en pipelines de inferencia con intervenciones**: si se despliega un sistema que aplica steering en el residual stream de GPT-2, este denoiser se puede intercalar para limpiar las activaciones después de la intervención, mejorando la perplejidad del texto final.
- **Estudio de fallos de cancelación de steering**: el modelo permite reproducir el análisis de cómo un denoiser vanilla tiende a cancelar parcialmente el steering, lo que es relevante para entender los límites de las técnicas de control.
- **Benchmark de técnicas de reparación**: el checkpoint sirve como referencia para comparar nuevas técnicas de denoising de activaciones o de reparación direccional en GPT-2 Small.
- **Investigación en aprendizaje continuo**: el proyecto incluye un protocolo de reproducibilidad (REPRODUCIBILITY.md) que puede ser útil como plantilla para validar otros modelos de interpretación.

## Benchmarks y rendimiento

Los resultados reportados en la model card se centran en la evaluación de la reparación en el contexto de steering. No hay benchmarks estándar como MMLU o HumanEval, ya que el modelo no es un LLM generativo. Se proporcionan los siguientes datos:

| Métrica | Valor |
|---|---|
| Mejora relativa en MSE de activaciones (validation) | 67,8% |
| Diferencia en val_denoised_mse respecto al valor archivado (clean-room) | 3,64% |
| Diferencia en relative improvement (clean-room) | 0,366 puntos porcentuales |
| F@C90 con DPAR completo (beta=1) | 71,45 |
| F@C90 con steering aditivo (sin DPAR) | 66,46 |
| Mejora descriptiva en fluidez | +4,99 puntos |

La métrica `F@C90` se define como la máxima fluidez en la curva agregada interpolada cuando el concepto score es al menos 90. El resultado indica que DPAR mejora la fluidez en comparación con el steering aditivo, pero el autor advierte que el score de sentimiento es ruidoso y no monotónico, por lo que no se puede interpretar como una dominancia universal de Pareto.

## Requisitos de hardware

- **VRAM**: el modelo es muy pequeño (aprox. 2,4M parámetros), por lo que puede ejecutarse en CPU sin necesidad de GPU. La inferencia se realiza sobre las activaciones de GPT-2 Small, que son de dimensión 768, por lo que el coste computacional es mínimo.
- **GPU recomendada**: no se requiere GPU para el denoiser; cualquier CPU moderna es suficiente. Si se usa junto con GPT-2 Small completo, se recomienda al menos 4-6 GB de VRAM para el modelo base, aunque el denoiser añade muy poco overhead.
- **Opciones de despliegue**: se puede integrar como un módulo Python en un pipeline de inferencia con PyTorch. No se menciona soporte para vLLM, llama.cpp o TGI, ya que no es un modelo de generación estándar.
- **Latencia**: el overhead es insignificante; la operación principal es una proyección lineal (768→1536→768) sobre cada token, lo que supone microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente. La categoría de denoisers de activaciones para steering es emergente. Existen otros proyectos como `gimacorp/gpt2-steering-scrubber` (en HuggingFace) que también abordan la limpieza de activaciones, pero no se han encontrado datos de comparación. El propio proyecto `steering-manifold-repair` incluye experimentos adicionales (JRR y KL-Selective JRR) que no tienen checkpoints separados, pero que se comparan conceptualmente en el informe. Por lo tanto, la comparativa con alternativas específicas no está disponible en la información pública.

## Limitaciones y advertencias

- **Alcance restringido**: los resultados se obtuvieron exclusivamente en GPT-2 Small y con una dirección de steering principal (sentimiento/persona). No se ha validado su eficacia en otras familias de modelos ni en otras direcciones de steering.
- **Evaluación ruidosa**: el score de concepto (sentiment) es ruidoso y no monotónico con la fuerza del steering, lo que limita la interpretación de los resultados como una mejora universal.
- **Dependencia del umbral de concepto**: la mejora en fluidez depende del umbral de concepto elegido (C90 en el informe). Para otros umbrales, la mejora puede no ser significativa.
- **No es un modelo generativo**: este checkpoint no puede generar texto por sí mismo; es un módulo auxiliar que se usa junto a GPT-2 Small. No debe confundirse con un LLM.
- **Licencia no especificada**: la model card no indica licencia, por lo que su uso comercial puede estar sujeto a restricciones legales. Se recomienda contactar con el autor para aclarar los términos.
- **Sesgos del modelo base**: al estar basado en GPT-2 Small, hereda los sesgos y limitaciones del modelo original, aunque el denoiser no genera contenido directamente.
- **Reproducibilidad**: aunque se reporta un protocolo de clean-room, la reproducibilidad completa depende de los archivos de configuración y del entorno original. La documentación indica que se logró reproducir con una tolerancia del 3,64% en el MSE, lo que es razonable, pero no garantiza una réplica exacta.

## Enlaces

- [HuggingFace: Nek1tt/steering-repair-gpt2](https://huggingface.co/Nek1tt/steering-repair-gpt2)
- [GitHub: Nek1tt/steering-manifold-repair](https://github.com/Nek1tt/steering-manifold-repair)
- [Perfil de Nek1tt en GitHub](https://github.com/Nek1tt/)
- [Proyecto relacionado: gimacorp/gpt2-steering-scrubber](https://huggingface.co/gimacorp/gpt2-steering-scrubber)
- [Discusión en HF: NeuroTrace - GPT-2 Small Residual Attack & Defence Framework](https://discuss.huggingface.co/t/neurotrace-gpt-2-small-residual-attack-defence-framework-ioi-task/170688)
