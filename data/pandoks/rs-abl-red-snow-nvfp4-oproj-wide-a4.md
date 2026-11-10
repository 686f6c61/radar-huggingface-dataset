# Pandoks/rs-abl-red-snow-nvfp4-oproj-wide-a4

## Resumen

RED-SNOW 5.3 Flash NVFP4 — o_proj loop-direction ablation (wide_a4) es una compilación experimental de diagnóstico publicada por Pandoks sobre el checkpoint `Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4`. No es una versión de uso general: se trata de un experimento de edición de pesos orientado a corregir un fallo concreto de generación en contexto largo, en el que el modelo base entra en bucles de repetición literal en lugar de terminar el turno. La intervención consiste en una ablución direccional de rango 1 aplicada únicamente a la matriz `o_proj` de doce capas de atención, sin recuantizar el resto del modelo.

El modelo conserva la arquitectura y el volumen del checkpoint del que deriva: 161.461.030.910 parámetros en formato NVFP4 (8 bits), con un repositorio de 204,5 GB. Todos los tensores son idénticos byte a byte al modelo base salvo las doce matrices editadas, de modo que las capacidades generales, el tokenizador y el resto de la pila de cuantización permanecen intactos. La relevancia de esta ficha es doble: documenta una técnica de cirugía de pesos reproducible sobre modelos cuantizados y sirve como referencia de un problema frecuente en despliegues de contexto largo.

La licencia es MIT y la pipeline declarada es text-generation con orientación conversacional. No hay información publicada sobre idiomas soportados, benchmarks ni datos de entrenamiento propios, ya que el autor no reentrena el modelo sino que modifica pesos existentes. La fecha de creación del repositorio es el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa en banda tardía y expertos NVFP4 (derivada de glm5_next / glm-5.3); detalles completos no disponibles |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor menciona problemas en "long context" sin cifra) |
| Tipos de cuantizacion | NVFP4 (4 bits por elemento en expertos, empaquetado en shards de 8 bits según el tag); tensores editados en BF16 dentro de los shards |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (indexado, 19 shards; solo difieren del base los shards 00012–00018) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint `Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4`, etiquetado como `glm5_next` y `glm-5.3`, con expertos cuantizados en NVFP4 y una banda de capas con atención completa en la parte tardía de la red. El espacio de salida de atención de las capas editadas es de 4096 dimensiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; esta compilación no añade entrenamiento alguno.

La innovación técnica es una ablución direccional de rango 1 aplicada por capa. Para cada capa editada L se calcula `W' = W - alpha * u_L (u_L^T W)` con `alpha = 4.0`, donde `u_L` es el vector unitario de "dirección de bucle" en el espacio de salida de atención de 4096 dimensiones: la diferencia de medias entre activaciones durante bucles de repetición literal y durante generación normal, estimada sobre sesiones de trabajo reservadas. Las capas afectadas son 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 41 y 43. La edición se escribe directamente en los bytes de los safetensors en BF16, sin recuantización: los expertos NVFP4, las escalas, las cabeceras y el índice quedan inalterados, y solo los shards 00012–00018 difieren del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con la pipeline declarada `text-generation`.
- Razonamiento y generación de código heredados del modelo base (no verificados de forma independiente en esta compilación).
- Tool calling y function calling: el autor indica que los turnos de control sin bucle conservan intacta la capacidad de llamada a herramientas.
- Terminación controlada de turnos en contexto largo: la edición convierte bucles de repetición literal en cierres de turno limpios en generación libre.
- Soporte de contexto largo, sujeto a la ventana del modelo base (cifra no disponible).
- Capacidades multilingües: no disponibles en la información publicada.
- No se documentan modos de pensamiento explícitos, visión ni audio para esta compilación.

## Casos de uso

- Diagnóstico de bucles de repetición en producción: sirve como referencia para comparar el comportamiento del modelo base frente a la versión ablacionada sobre los mismos prompts largos y aislar si el fallo proviene de la atención o de otras capas.
- Investigación en interpretabilidad: el vector `u_L` y el procedimiento de ablución de rango 1 son reproducibles y permiten estudiar cómo se codifica la decisión de parada en modelos cuantizados de gran tamaño.
- Servicio conversacional con turnos largos: en escenarios donde el modelo base repite "tldr:" o cadenas de cierre de forma indefinida, esta compilación restaura el fin de turno y evita respuestas que no terminan.
- Agentes con tool calling en sesiones extensas: al preservar la llamada a herramientas en turnos de control, puede emplearse en pipelines de agentes que acumulan mucho historial y necesitan cerrar cada paso correctamente.
- Evaluación comparativa de cirugía de pesos: útil como caso de estudio de edición selectiva de safetensors sin recuantización, verificando que solo cambian los shards esperados.
- Base para experimentos de mitigación de repetición: punto de partida para probar otros valores de `alpha`, otras capas o direcciones alternativas antes de consolidar una versión estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una evaluación cualitativa en generación libre ("on-box free generation") en la que los bucles literales se convierten en cierres de turno limpios, pero no se aportan métricas numéricas, y no se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 204,5 GB en NVFP4; se necesita un nodo multi-GPU con al menos ~210–230 GB de memoria agregada para cargar los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: clústeres de A100 80 GB, H100 80 GB o H200; un solo dispositivo consumer no es viable por volumen.
- No cabe en GPUs de consumo (RTX 4090, 5090) ni en configuraciones de una sola GPU de 24–48 GB sin descarga parcial a CPU, lo que degradaría gravemente la latencia.
- Opciones de despliegue: servidores compatibles con safetensors y cuantización NVFP4 (por ejemplo, stacks basados en TensorRT-LLM o vLLM con soporte NVFP4, sujeto a verificación); llama.cpp y Ollama no soportan NVFP4 de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Pandoks/rs-abl-red-snow-nvfp4-oproj-wide-a4 | 161,46 B | no disponible | NVFP4 | MIT | Ablución direccional en 12 capas; experimental |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Modelo base; sin la corrección de bucles |
| Alternativas de misma escala | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Compilación experimental y de diagnóstico: el propio autor indica explícitamente que no es una versión de uso general.
- La edición solo se ha validado cualitativamente en generación libre; no hay métricas que cuantifiquen la mejora ni posibles regresiones.
- Riesgo de alucinación inherente al modelo base; la ablución no aborda la veracidad factual.
- Posible pérdida sutil de coherencia en las doce capas editadas al eliminar una dirección del espacio de atención; no se documenta una evaluación exhaustiva de capacidades generales.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir un comportamiento multilingüe.
- La licencia MIT se aplica a esta compilación, pero conviene verificar las condiciones del checkpoint base y de los datos subyacentes antes de un uso comercial.
- El despliegue requiere hardware de clase centro de datos y stacks con soporte NVFP4; la portabilidad a herramientas de inferencia comunes es limitada.
- Sin descargas ni validación comunitaria en el momento de la ficha; no hay evidencia externa de estabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/rs-abl-red-snow-nvfp4-oproj-wide-a4
- Modelo base: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Revisión del checkpoint base citada por el autor: `8133f8ba249427a0dbe0ee197f8562d2ef109569`
- Notas de investigación del autor: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
