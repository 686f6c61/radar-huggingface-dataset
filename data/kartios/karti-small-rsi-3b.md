# KartiOS/Karti-Small-RSI-3B

## Resumen

Karti-Small-RSI-3B es un modelo card público publicado por KartiOS, que forma parte del programa Lumbridge de pesos privados para agentes offline y tool calling fiable. No se trata de un lanzamiento de pesos descargables: el repositorio contiene únicamente la tarjeta de modelo y la receta de entrenamiento, sin adaptadores, pesos ni datos de entrenamiento. El modelo parte de la base abierta HuggingFaceTB/SmolLM3-3B y se adapta mediante LoRA SFT con el objetivo de producir un modelo compacto capaz de ejecutarse localmente, incluso sin conexión a internet, y de manejar llamadas a herramientas con precisión.

El primer candidato privado, `Karti-Small-RSI-3B-2026.08-W35`, completó su entrenamiento inicial el 26 de agosto de 2026, con 64 pasos de optimización sobre 512 filas verificadas. Sin embargo, no superó la validación conductual en un caso de prueba aislado, por lo que no fue promovido. Este hecho subraya la intención del proyecto: un entrenamiento completado no equivale a calidad demostrada. La relevancia actual del modelo radica en su enfoque metodológico (verificación con recompensas verificables, retención de datos y promoción explícita) más que en un rendimiento ya validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en HuggingFaceTB/SmolLM3-3B) |
| Parametros totales | No disponible (el modelo base tiene 3B, pero no se publican pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | 2.048 tokens (usado en el primer entrenamiento) |
| Tipos de cuantizacion | No disponible (no hay pesos publicados) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no hay pesos; el repositorio solo contiene la model card y recipe.json) |

## Arquitectura y entrenamiento

El modelo se construye sobre SmolLM3-3B, cuya arquitectura base es un transformer de 3 mil millones de parámetros. La adaptación se realiza mediante LoRA en BF16 con supervisión fina (SFT) usando la librería TRL. El primer entrenamiento utilizó un contexto de 2.048 tokens y una representación de herramientas en formato Hermes XML/JSON. El proceso de adaptación sigue una secuencia estricta: selección de semillas de utterances públicas con revisión, re-escritura privada de demostraciones, incorporación de trazas sintéticas autorizadas, congelación del conjunto de validación antes del entrenamiento, entrenamiento acotado del LoRA, evaluación mediante verificadores de Prime Intellect y Lumbridge Tera, y promoción solo tras mejora en datos retenidos y revisión del propietario. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición del dataset, más allá de que el primer corpus es deliberadamente pequeño y específico de la tarea.

## Capacidades

- Generación de texto y razonamiento básico, heredados del modelo base SmolLM3-3B.
- Tool calling: el objetivo es emitir envoltorios de herramientas exactos, con nombre, orden y argumentos correctos.
- Comportamiento de propuesta: el modelo debe proponer acciones sin afirmar que ya se han ejecutado, respetando los límites de confirmación.
- Petición de información faltante: debe solicitar datos ausentes antes de actuar.
- Ejecución local y offline: diseñado para funcionar sin conexión a internet como parte del stack Veronica y Hermes.
- No se han demostrado capacidades de visión, audio ni multimodales.

## Casos de uso

- Agentes de automatización del hogar: el modelo puede gestionar comandos de dispositivos domésticos mediante herramientas de lectura/listado y propuesta de acciones, sin ejecución directa, gracias a su política de seguridad que impide acciones no confirmadas.
- Asistentes personales offline: al poder ejecutarse localmente, es adecuado para entornos sin conectividad, como vehículos o zonas remotas, donde debe proponer acciones y pedir confirmación.
- Integración en pipelines de tool calling: su representación Hermes XML/JSON permite integrarse en sistemas que requieren llamadas a funciones estructuradas, aunque aún no hay pesos públicos para probarlo.
- Evaluación de metodologías de entrenamiento: el repositorio sirve como referencia para estudiar el ciclo de mejora con verificación y promoción explícita, útil para investigadores interesados en alineación y seguridad.
- Desarrollo de agentes con límites de seguridad: el diseño de política sin token de control y sin ruta de ejecución directa lo convierte en un caso de estudio para sistemas que requieren propuestas en lugar de ejecución.
- Formación de modelos pequeños para edge computing: al partir de un modelo de 3B, el objetivo es desplegarlo en hardware limitado, aunque no hay pesos disponibles para validar su viabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es un caso de prueba conductual aislado que el primer candidato no superó, pero no se ofrecen métricas cuantitativas.

## Requisitos de hardware

- No aplicable: no hay pesos públicos descargables, por lo que no se puede estimar VRAM, latencia ni throughput.
- El modelo base SmolLM3-3B, con 3B parámetros, podría caber en GPUs consumer como una RTX 3060 o superior en cuantización, pero al no existir release de pesos, no se puede confirmar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no disponibles hasta que se publiquen pesos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo base SmolLM3-3B es la referencia directa, pero no hay resultados de Karti-Small-RSI-3B frente a otros modelos de tool calling de tamaño similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B). La comparativa queda pendiente de una eventual publicación de pesos y evaluaciones.

## Limitaciones y advertencias

- No hay pesos públicos: el repositorio no contiene adaptadores ni checkpoints, por lo que no se puede cargar con `from_pretrained`.
- El primer candidato privado no superó su canario conductual, lo que indica que el modelo aún no cumple el contrato de respuesta esperado.
- El corpus de entrenamiento inicial es muy pequeño (512 filas) y específico de la tarea, lo que limita la generalización.
- No se hacen afirmaciones amplias de capacidad o rendimiento basadas en un único caso diagnóstico.
- La licencia Apache-2.0 se aplica a la model card y la receta, pero no a los pesos (que son privados). Cualquier uso comercial futuro requerirá una decisión separada de privacidad, evaluación y aprobación.
- Riesgo de alucinación y sesgos no evaluados, dado que no hay datos de evaluación pública.

## Enlaces

- [HuggingFace - KartiOS/Karti-Small-RSI-3B](https://huggingface.co/KartiOS/Karti-Small-RSI-3B)
- [Lumbridge - Model improvement loop](https://lumbridgecorp.com/models/karti-small-rsi-3b)
- [Modelo base - HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
