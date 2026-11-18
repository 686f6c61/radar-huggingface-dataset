# DuoNeural/RMSN-602M-WideSoliton-BasinSpread-s5-Base

## Resumen

RMSN-602M-WideSoliton-BasinSpread-s5-Base es un modelo de lenguaje recurrente de 602,4 millones de parámetros desarrollado por DuoNeural Lab, publicado bajo licencia Apache 2.0. Se enmarca en la familia RMSN (Recurrent Momentum Soliton Network), una arquitectura recurrente de tipo port-hamiltoniano con topología de solitones discretos, cuyo exponente de Lyapunov se emplea para seguir la fase topológica del sistema. El modelo se distribuye como semilla de documentación ("basin spread seed 5") dentro de la wave107, un estudio sobre la atracción global de cuencas en configuraciones de anchura D=1664-1792.

La relevancia de esta publicación es fundamentalmente metodológica: no se presenta como un modelo listo para producción, sino como un artefacto de investigación que documenta la estadística de dispersión de cuencas ("basin spread") en el régimen de anchura óptima. Según la model card, las arquitecturas con D=1664-1792 muestran cuencas globalmente atractivas, de modo que la mayoría de semillas aleatorias convergen a una topología casi óptima, mientras que D=2048 presenta cuencas "riddled" con una dispersión de 2,87 puntos CoT.

El checkpoint corresponde a la semilla 5 de un barrido de 5 semillas, con una dispersión agregada de 1,95 puntos CoT para D=1792. Se entrenó durante 75.000 pasos y alcanza una pérdida de validación de 4,6473 (perplejidad aproximada de 104,3). El repositorio ocupa 2,1 GB y los pesos están en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Momentum Soliton Network (RMSN), recurrente port-hamiltoniano con topologia de solitones discretos |
| Parametros totales | 602,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repositorio de 2,1 GB) |
| Dimension del modelo | D=1792 |
| Profundidad | 16 |
| Slots | 64 |
| Pasos de entrenamiento | 75.000 |
| Perdida de validacion | 4,6473 (perplejidad aproximada 104,3) |
| Semilla | 5 (de un barrido de 5 semillas) |
| Wave | wave107 |

## Arquitectura y entrenamiento

El modelo implementa una red recurrente de momento con topología de solitones (RMSN), formulada como sistema port-hamiltoniano. La model card indica que el exponente de Lyapunov se utiliza para seguir la fase topológica del sistema, lo que sugiere un mecanismo de control dinámico sobre la estabilidad del estado recurrente. La configuración concreta es D=1792 de dimensión, 16 capas de profundidad y 64 slots, con 602,4 millones de parámetros totales.

El entrenamiento se extendió durante 75.000 pasos, sin que la información disponible detalle el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El propósito declarado de esta semilla es documentar la dispersión de cuencas de atracción en el régimen de anchura D=1664-1792: según el autor, estas anchuras producen cuencas globalmente atractivas en las que la mayoría de semillas aleatorias convergen a topologías casi óptimas, con una dispersión de 1,95 puntos CoT entre las 5 semillas de D=1792, frente a los 2,87 puntos CoT de D=2048, que presenta cuencas "riddled". No se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva mediante un núcleo recurrente port-hamiltoniano; no se documentan capacidades específicas más allá de la modelización de lenguaje.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades de código o matemáticas verificadas.
- El artefacto está orientado a reproducir y documentar estadísticas de convergencia de cuencas, no a tareas de usuario final.

## Casos de uso

- Investigación sobre estabilidad de arquitecturas recurrentes: el checkpoint permite reproducir la semilla 5 del barrido de D=1792 y verificar la dispersión de 1,95 puntos CoT reportada para esa anchura.
- Estudio de dinámica port-hamiltoniana en modelos de lenguaje: sirve para analizar cómo evoluciona el exponente de Lyapunov durante el entrenamiento y su relación con la fase topológica.
- Comparación de regímenes de anchura: junto con las semillas de D=1664 y D=2048, permite contrastar cuencas globalmente atractivas frente a cuencas "riddled".
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0 y pesos PyTorch, facilita la réplica de los 75.000 pasos de entrenamiento y la pérdida de validación de 4,6473.
- Docencia e investigación académica sobre modelos recurrentes alternativos a los transformers: útil como caso de estudio de topologías de solitones en series recurrentes.
- Base para experimentos de continuación de preentrenamiento: al ser un checkpoint "Base", puede servir como punto de partida para ajustes posteriores en entornos de investigación, siempre que se validen previamente sus capacidades reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación de 4,6473 (perplejidad aproximada de 104,3) tras 75.000 pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB solo para pesos (602,4 M de parámetros), más estados de activación y buffers recurrentes; el repositorio completo ocupa 2,1 GB.
- VRAM estimada en FP16/BF16: alrededor de 1,2 GB para pesos, más overhead de inferencia.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar los pesos, pero no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no está confirmado por el autor.
- Opciones de despliegue: no disponible; la librería declarada es PyTorch, sin soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia ni alternativas recurrentes con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo describe como semilla de documentación de cuencas, no como un modelo orientado a producción.
- Perplejidad elevada: una pérdida de validación de 4,6473 (perplejidad aproximada de 104,3) sugiere una calidad de modelización limitada en comparación con modelos de lenguaje convencionales del mismo tamaño.
- Idiomas no especificados: se desconoce qué lenguas cubre y con qué calidad.
- Contexto no documentado: no se indica la longitud máxima de secuencia soportada.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos: no se han publicado análisis de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un checkpoint base sin evaluación de capacidades, su uso en producción no está respaldado por datos de rendimiento.
- Ecosistema limitado: sin pipeline declarado, sin cuantizaciones publicadas y sin integración documentada en frameworks de despliegue habituales.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-602M-WideSoliton-BasinSpread-s5-Base
- Papers de DuoNeural sobre RMSN: no disponible (la model card remite a "DuoNeural papers" sin enlace)
- Repositorio de código: no disponible
- Demo: no disponible
