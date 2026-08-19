# brandonmusic/GLM-5.2-SQG-Coupled-H512-H128-K96Tail

## Resumen

Este repositorio, publicado por el usuario brandonmusic, no es un modelo funcional, sino un "merge bus" de staging para una re-codificación distribuida de un checkpoint cuantizado del modelo GLM-5.2 de Zhipu AI. El autor lo describe explícitamente como "Incomplete merge staging repository. This is not yet a runnable model." Es decir, contiene fragmentos de capas de expertos enrutadas (archivos `r7-experts-layer-NNN.safetensors` y metadatos asociados) que aún no se han ensamblado en un checkpoint completo y verificable.

La propuesta técnica consiste en aplicar una cuantización W4A8 (pesos de 4 bits, activaciones de 8 bits) con una transformada de Hadamard acoplada (coupled Hadamard) de dimensiones H512/H128, y una asignación de cola K96 para las capas enrutadas 4 a 77, mientras que la capa 3 mantiene una asignación K48. Se conservan componentes BF16 y la capa MTP (multi-token prediction) 78 heredada del checkpoint fuente. El objetivo final sería un modelo MoE cuantizado para ejecución en hardware Blackwell, pero a día de hoy no hay pesos completos ni resultados de calidad medidos.

Dado que el propio autor indica que la tarjeta del modelo será reemplazada cuando se complete el ensamblaje y se midan las métricas de divergencia KLD, esta ficha debe interpretarse como una descripción del estado actual del repositorio, no como una evaluación de un modelo listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en zai-org/GLM-5.2 |
| Parametros totales | no disponible (depende del checkpoint base GLM-5.2) |
| Parametros activos | no disponible (depende de la configuracion MoE del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits) con transformada de Hadamard acoplada H512/H128 y cola K96/K48 |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en el repositorio) |
| Formato de pesos | safetensors (fragmentos de expertos por capa, no checkpoint completo) |

## Arquitectura y entrenamiento

El repositorio contiene fragmentos de capas enrutadas de un modelo MoE cuantizado. La cuantización es W4A8, es decir, los pesos se almacenan en 4 bits y las activaciones en 8 bits. Se emplea una transformada de Hadamard acoplada (coupled Hadamard transform) con dimensiones H512/H128, y una asignación de cola (tail) de K96 para las capas enrutadas 4 a 77. La capa 3 conserva una asignación K48 (probablemente de un piloto anterior). La asignación K96 implica 672 celdas K3 y 96 celdas K4 por capa, lo que equivale a 3.125 bits de payload enrutado por peso.

No se proporcionan datos sobre el entrenamiento del modelo base (GLM-5.2), ni sobre el proceso de calibración de la cuantización más allá de la mención a un repositorio de Hessianos y capturas (`brandonmusic/GLM-5.2-BMM-Law-SQG-Hessians`). El autor menciona que se requiere una validación de paridad byte a byte entre el scorer y el encoder, y una pasada de "oráculo" en el runtime nativo B12X antes de subir cada capa. No hay evidencia de fine-tuning posterior; es un proceso de compresión/transformación.

## Capacidades

Dado que el repositorio no contiene un modelo ensamblado ni ejecutable, no se pueden verificar capacidades reales. Las capacidades esperadas del modelo base GLM-5.2 (si se completara el ensamblaje) serían las de un LLM MoE de gran escala, pero no hay datos confirmados. Por tanto:

- Generación de texto: no verificable en este repositorio.
- Razonamiento, código, matemáticas: no verificable.
- Tool calling / function calling: no verificable.
- Soporte de agentes: no verificable.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

No se pueden proponer casos de uso prácticos para un repositorio que no es un modelo funcional. Cualquier aplicación requeriría primero completar el ensamblaje, validar la calidad y publicar un checkpoint completo. Por tanto, los casos de uso quedan pendientes de que el autor publique el modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que la divergencia KLD (Kullback-Leibler divergence) de extremo a extremo aún no se ha medido para el checkpoint ensamblado. No hay datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

No se especifican requisitos de hardware. Dado que se menciona el runtime nativo B12X y la etiqueta "blackwell", se infiere que el objetivo son GPUs NVIDIA Blackwell (B200, B100, etc.), pero no hay confirmación ni estimaciones de VRAM. No se puede afirmar si cabe en GPUs de consumo. No hay opciones de despliegue documentadas (vLLM, llama.cpp, etc.) más allá de la etiqueta `library_name: vllm`, que sugiere que el formato final podría ser compatible con vLLM, pero no es seguro.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el mismo estado de desarrollo (staging de cuantización con Hadamard acoplado) y no hay datos de rendimiento. El modelo base GLM-5.2 podría compararse con otros MoE de gran escala (como DeepSeek-V3 o Qwen MoE), pero no se dispone de información suficiente sobre el checkpoint original.

## Limitaciones y advertencias

- **Repositorio incompleto**: no es un modelo ejecutable. Contiene solo fragmentos de capas enrutadas y metadatos de calidad.
- **Sin validación de calidad**: no se ha medido la divergencia KLD final ni se han publicado benchmarks.
- **Licencia ambigua**: la licencia se indica como "other" sin especificar términos. No se puede asumir permisos de uso comercial.
- **Riesgo de sobreajuste a la cuantización**: el proceso de cuantización W4A8 con transformadas de Hadamard puede degradar la calidad si no se valida cuidadosamente; el autor aún no ha presentado evidencia.
- **Dependencia de hardware específico**: la mención a "Blackwell" sugiere que el modelo podría requerir hardware específico para ejecutarse eficientemente, lo que limita su portabilidad.
- **Sin documentación de idiomas ni contexto**: no se indica qué idiomas soporta ni la longitud de contexto, lo que impide evaluar su adecuación a tareas multilingües o de contexto largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/GLM-5.2-SQG-Coupled-H512-H128-K96Tail
- Repositorio de Hessianos y capturas (mencionado en el README): https://huggingface.co/brandonmusic/GLM-5.2-BMM-Law-SQG-Hessians
- Modelo base (referencia): https://huggingface.co/zai-org/GLM-5.2
