# dementor-research/sft_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de un modelo denominado `granite-4-h-small`. Forma parte de un estudio de imitación conductual llevado a cabo por el grupo de investigación `dementor-research` utilizando la plataforma Tinker de Thinking Machines. El adaptador se identifica con el alias `sft_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42` y corresponde a una de las 528 celdas configuradas en la campaña de entrenamiento, que incluye 12 modelos, 4 conjuntos de datos y 1 semilla.

El modelo base, `gpt-oss-20b`, es un modelo de lenguaje de código abierto de 20 mil millones de parámetros desarrollado por OpenAI. Sin embargo, la información proporcionada en esta ficha no incluye detalles técnicos específicos del modelo base ni del adaptador más allá de los metadatos del repositorio. Por tanto, las especificaciones completas del modelo base deben consultarse en su propia documentación oficial.

La relevancia de este adaptador reside en su uso como herramienta de investigación para estudiar la transferencia de comportamiento entre modelos mediante ajuste fino con LoRA. No está pensado como un modelo listo para producción, sino como un artefacto experimental dentro de un estudio más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del modelo base no disponible en la informacion proporcionada) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en disco, pero el numero exacto de parametros no se indica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors, pero no se especifican cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante SFT (supervised fine-tuning) con LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines como parte de una campaña denominada "dementor", que explora la imitación de comportamiento entre modelos. La campaña incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 configuraciones posibles. Los hiperparámetros exactos se encuentran en el archivo `config.yaml` del lanzamiento del código, que no está disponible en este repositorio.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. La única información es que se trata de un ajuste supervisado (SFT) con LoRA.

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador en el repositorio. Al ser un adaptador LoRA sobre `gpt-oss-20b`, heredaría las capacidades del modelo base (generación de texto, razonamiento, etc.), pero no se puede confirmar sin acceso a la documentación del modelo base ni a los resultados de evaluación del adaptador. Se recomienda consultar la página de `openai/gpt-oss-20b` para conocer sus capacidades.

## Casos de uso

No se documentan casos de uso concretos en la información proporcionada. Dado su carácter experimental, los posibles usos se limitan a:

- Investigación académica sobre imitación de comportamiento entre modelos de lenguaje.
- Estudio de la transferencia de estilos de respuesta o patrones conversacionales mediante LoRA.
- Comparación de adaptadores entrenados con diferentes configuraciones (datos, semillas, etc.) dentro de la campaña "dementor".
- Análisis de la efectividad de LoRA de rango 32 con `target_modules=all-linear` para imitar modelos más pequeños (granite-4-h-small).
- Experimentos de control de calidad en entornos de investigación, no en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador ni para la comparación con el modelo base o el modelo imitado.

## Requisitos de hardware

No se proporciona información sobre requisitos de hardware. Dado que el adaptador es un LoRA de 1.0 GB, la inferencia requiere cargar el modelo base `gpt-oss-20b` (20B parámetros) más el adaptador. Se estima que se necesita al menos 40-50 GB de VRAM para una cuantización de 16 bits, pero este dato no está confirmado en la información disponible. No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No disponible. No se conocen adaptadores comparables en el mismo repositorio ni se proporcionan referencias a otros modelos de imitación conductual con características similares.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se garantiza su estabilidad ni su calidad en tareas reales.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- Depende completamente del modelo base `gpt-oss-20b`, cuyas limitaciones (contexto, idiomas, sesgos) se trasladan al adaptador.
- El entrenamiento se realizó con una semilla concreta (seed42) y un conjunto de datos específico; los resultados pueden no generalizar a otros dominios.
- No se proporcionan métricas de rendimiento ni evaluaciones de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
