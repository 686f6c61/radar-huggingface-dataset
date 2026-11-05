# Blackfrost-AI/LFM3-1.7B-DERISKED

## Resumen

LFM3-1.7B-DERISKED es un derivado de investigación del checkpoint LiquidAI/LFM3-1.7B, publicado por Blackfrost-AI. Se trata de un ajuste fino del modelo base en el que se ha aplicado una modificación de pesos permanente ("baked") denominada Domain Weight Modification (DWM), que resta una dirección de rechazo capturada previamente en las proyecciones de atención de las capas 4 a 23. El resultado es un artefacto de pesos BF16 sin sidecar en tiempo de ejecución, pensado para el estudio controlado del comportamiento de modelos pequeños y de arneses de agentes locales.

El modelo conserva la arquitectura híbrida tri-híbrida de LFM3 y su techo de contexto de 262.144 tokens (entrada más salida). Con 1.728.801.536 parámetros reales según safetensors, es un modelo compacto orientado a despliegue local y a experimentación, no a producción de alta fiabilidad. El autor advierte explícitamente de que la corrección técnica del modelo es mixta y que las respuestas directas no constituyen evidencia de corrección.

La relevancia de esta ficha radica en su carácter de artefacto de investigación: documenta una técnica concreta de modificación de pesos (sustracción de rango uno en float32 por proyección de atención, con restauración de la norma global del tensor y serialización única en BF16) sobre un modelo base abierto. La licencia heredada es lfm1.0, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (tri-híbrido LFM3 de Liquid AI) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (entrada más salida) |
| Tipos de cuantización | no disponible (el artefacto publicado es BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3 de Liquid AI, que combina capas de atención con otros mecanismos de secuencia (el autor la describe como "tri-hybrid text checkpoint"). No se detalla en la información disponible la composición exacta de bloques ni la proporción entre atención y capas convolucionales o de estado. El contexto máximo es de 262.144 tokens, servido al máximo según la model card.

El proceso de modificación consta de cuatro etapas documentadas. Primero, un bloqueo de fuente con revisión fijada de LiquidAI/LFM3-1.7B (revisión 0dc4268b561499c648c7ba7c9466bf3d8d01517a) y verificación de identidad de pesos mediante SHA256. Segundo, una captura de dirección ("Hard32") que mide contrastes de residuo de salida de capa en la misma posición usando 32 pares de prompts con el modo thinking activado; las capas 4 a 23 superaron las puertas descriptivas de dirección preespecificadas. Tercero, la aplicación de la modificación: una resta de rango uno en float32 por cada proyección de atención seleccionada, con la fórmula W − 3,0 × (W @ d) outer d sobre las proyecciones q/k/v/o en las capas 4 a 23, restaurando después la norma global del tensor y serializando una sola vez en BF16. Quedan excluidas las capas convolucionales, las capas 0 a 3, las normas, los embeddings y la cabeza LM atada. Cuarto, la selección del artefacto retenido (alpha 3.0) por parte del operador.

No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni etapas de RLHF o DPO. La modificación no constituye un reentrenamiento: es una edición de pesos sobre el checkpoint base. El autor indica que la verificación estructural de la edición y las pruebas de servicio y smoke tests están completas, pero que no hay garantía de seguridad ni de fiabilidad.

## Capacidades

- Generación de texto conversacional, heredada del checkpoint LFM3-1.7B.
- Modo thinking: la captura de dirección se realizó con thinking habilitado; el modelo base soporta este modo según la información disponible.
- Razonamiento de múltiples pasos y uso en arneses de agentes locales, según el propósito declarado del repositorio.
- Contexto largo de hasta 262.144 tokens para entrada y salida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades de visión o audio: no disponible; la model card lo describe como checkpoint de texto.
- Ejecución local sin dependencias de sidecar: los pesos modificados están integrados en el artefacto BF16.

## Casos de uso

- Investigación de modificación de pesos: el modelo sirve como artefacto de referencia para reproducir y auditar la técnica DWM sobre un checkpoint abierto, comparando los hashes y la revisión fijada del modelo base.
- Estudio de comportamiento de modelos pequeños: permite analizar cómo afecta la sustracción de una dirección en las proyecciones de atención de las capas 4 a 23 a las respuestas del modelo en tareas controladas.
- Arneses de agentes locales: con 1,73B parámetros y contexto de 262.144 tokens, puede integrarse en entornos de prueba de agentes que necesiten ventanas largas sin salir del equipo local.
- Evaluación de seguridad y robustez: útil para comparar el modelo derivado con el base en pruebas de rechazo, sesgo y alucinación, dado que la modificación se describe como sustracción de una dirección de rechazo.
- Prototipado de pipelines de texto en local: el tamaño compacto permite iterar con generación de texto en hardware de consumo, aunque el autor advierte que la corrección técnica es mixta.
- Docencia y experimentación con contextos extensos: permite demostrar el manejo de ventanas de hasta 262.144 tokens en un modelo pequeño, con la cautela de revisar cada salida de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 1,728.801.536 parámetros ocupan aproximadamente 3,46 GB solo en pesos; con caché KV para contexto largo, el consumo crece de forma significativa y no se dispone de cifras medidas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo en BF16 puede alojarse en GPUs con 8 GB o más de VRAM, aunque el contexto máximo de 262.144 tokens exige mucha más memoria para la caché KV.
- Cabe en GPU de consumo: sí en BF16 para contextos moderados en tarjetas con al menos 8 GB; para el contexto máximo se requiere hardware de mayor capacidad o técnicas de atención eficiente.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El tag custom_code indica que la carga requiere código personalizado del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Blackfrost-AI/LFM3-1.7B-DERISKED | 1,73B | 262.144 | lfm1.0 | HuggingFace, ungated |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 262.144 | lfm1.0 | HuggingFace |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que la corrección técnica del modelo compacto es mixta y que las respuestas directas no son evidencia de corrección.
- Las pruebas diagnósticas de servicio y smoke tests no garantizan seguridad ni fiabilidad; el modelo se presenta como artefacto de investigación alpha.
- La captura de dirección se basa en 32 pares de prompts y el autor indica que no constituye prueba causal ni cualificación para publicación.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante dado el tamaño reducido y el aviso del autor.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no especificados; no se garantiza cobertura multilingüe.
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia no es permisiva por defecto.
- El contexto máximo de 262.144 tokens puede no ser práctico en hardware de consumo por el coste de memoria de la caché KV.
- El tag custom_code implica dependencias de código personalizado para la carga; conviene verificar la compatibilidad con la versión de transformers utilizada.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que refleja una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED
- Discusiones del repositorio: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED/discussions
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED/blob/main/LICENSE
