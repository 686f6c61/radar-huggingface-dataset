# connorgentile113/evergreen-smollm2-135m-adapter

## Resumen

El modelo `connorgentile113/evergreen-smollm2-135m-adapter` es un adaptador LoRA publicado por el usuario Connor Gentile-DePaul (connorgentile113) en Hugging Face. No se trata de un modelo completo, sino de un artefacto de verificación de pipeline generado por una herramienta denominada Evergreen durante una ejecución en Kaggle. Su propósito declarado es servir como prueba de humo (smoke-test) de un paso de entrenamiento en GPU, no como asistente entrenado en un dominio ni como modelo evaluado para producción.

El adaptador se monta sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. El adaptador en sí se ha entrenado sobre un único documento sintético, por lo que su utilidad práctica como modelo de generación de texto es prácticamente nula más allá de comprobar que el flujo de entrenamiento, serialización y carga con PEFT funciona correctamente.

Su relevancia es, por tanto, exclusivamente técnica y de infraestructura: resulta útil como ejemplo mínimo reproducible de un adaptador LoRA con PEFT y como referencia para validar pipelines de entrenamiento en entornos con GPU limitada. No debe confundirse con un modelo instructivo listo para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (SmolLM2-135M-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 135 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) de PEFT que se aplica sobre el modelo base SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. No se especifican en la información disponible el rango (`r`), el `alpha`, las capas objetivo ni el número de parámetros entrenables del adaptador. Tampoco se detalla la configuración de entrenamiento (learning rate, batch size, número de pasos más allá de la indicación de "one-step").

El entrenamiento consistió, según la model card, en un único paso sobre un único documento sintético, ejecutado en Kaggle con el objetivo de verificar que el pipeline de Evergreen funciona de extremo a extremo en GPU. No se documenta el uso de RLHF, DPO ni ningún otro proceso de alineamiento posterior. No hay innovaciones técnicas destacables: el interés del artefacto es la verificación de infraestructura, no la calidad del modelo resultante.

## Capacidades

- Generación de texto: hereda la capacidad del modelo base SmolLM2-135M-Instruct, aunque el adaptador no aporta ninguna mejora funcional medible.
- Conversación: el modelo base es instructivo, pero el adaptador no ha sido entrenado para diálogo real (solo un documento sintético).
- Tool calling / function calling: no documentado; no disponible.
- Agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: no documentadas; no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Incluye archivos de tokenizer y un helper de chat de terminal para pruebas locales.

## Casos de uso

- Verificación de pipeline de entrenamiento: usar este adaptador como referencia para comprobar que un flujo PEFT + SmolLM2 + GPU en Kaggle entrena, serializa y carga correctamente antes de lanzar entrenamientos reales.
- Prueba de humo de despliegue: cargar el adaptador junto al modelo base mediante PEFT para validar que un endpoint compatible con OpenAI (por ejemplo, un endpoint de Hugging Face) sirve correctamente un adaptador LoRA.
- Ejemplo didáctico de LoRA: utilizar el repositorio como plantilla mínima para explicar la estructura de archivos de un adaptador PEFT (pesos safetensors, tokenizer, informe de entrenamiento).
- Validación de integración con Evergreen: comprobar que la herramienta Evergreen produce artefactos cargables y compatibles con el ecosistema Hugging Face antes de usarla en proyectos reales.
- Test de regresión de infraestructura: incluir el adaptador en una suite de CI que verifique que las versiones de PEFT, transformers y safetensors siguen siendo compatibles entre sí.
- Demostración de carga de adaptadores en entornos con recursos limitados: el tamaño reducido del modelo base (135 M) permite probar el flujo completo en GPU consumer o incluso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado que el modelo base tiene 135 M de parámetros; en fp16 rondaría los 0,3 GB, y en cuantización de 8 bits o 4 bits sería inferior a 0,2 GB (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también es viable en CPU para pruebas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga mediante PEFT + transformers; el autor menciona servir a través de Evergreen con un endpoint compatible con OpenAI de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| evergreen-smollm2-135m-adapter | Adaptador LoRA sobre 135 M | no disponible | no disponible | Hugging Face (0 descargas) | Artefacto de smoke-test, no modelo de producción |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo instructivo real de Hugging Face |
| SmolLM2-360M-Instruct | 360 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| Otros adaptadores LoRA públicos | Variable | Variable | Variable | Hugging Face | Depende del autor y del caso de uso |

No se dispone de datos de rendimiento comparativo para el adaptador, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Entrenado sobre un único documento sintético y un solo paso: no ha aprendido ninguna tarea útil ni dominio concreto.
- No es un asistente evaluado ni un modelo de producción; la model card lo describe explícitamente como artefacto de verificación de pipeline.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Idiomas soportados no documentados.
- Riesgo de alucinación alto, heredado del modelo base y agravado por la falta de entrenamiento real del adaptador.
- Sin datos de benchmarks, evaluación de sesgos ni pruebas de robustez.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Para cualquier uso real de generación de texto conviene utilizar directamente el modelo base SmolLM2-135M-Instruct o un modelo de mayor tamaño.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/connorgentile113/evergreen-smollm2-135m-adapter
- Perfil del autor: https://huggingface.co/connorgentile113
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
