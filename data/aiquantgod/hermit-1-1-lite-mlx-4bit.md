# aiquantgod/Hermit-1.1-Lite-MLX-4bit

## Resumen

Hermit-1.1-Lite-MLX-4bit es una cuantización en 4 bits para el framework MLX de Apple del modelo Qwen3-1.7B, publicada por el usuario aiquantgod. Se trata de un derivado orientado a la aplicación Hermit para iPhone y Mac, cuyo propósito es ejecutar un modelo de lenguaje de 1.700 millones de parámetros de forma local en hardware Apple Silicon. La model card es extremadamente escueta y no documenta ajustes adicionales, por lo que debe interpretarse como una conversión de pesos más que como un modelo nuevo.

El modelo hereda la arquitectura y el entrenamiento de Qwen3-1.7B, desarrollado por el equipo Qwen de Alibaba, e incorpora los pesos cuantizados de mlx-community/Qwen3-1.7B-4bit. La relevancia actual reside en la posibilidad de desplegar un LLM con capacidades de razonamiento y generación de código en dispositivos de consumo Apple sin conexión a la nube, con un peso de repositorio de aproximadamente 1 GB.

No se dispone de información publicada sobre idiomas soportados, pipeline de inferencia ni resultados de evaluación específicos de esta conversión. Los datos técnicos que se presentan a continuación provienen del modelo base Qwen3-1.7B y de los metadatos del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-1.7B soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-1.7B: un transformer decoder-only denso de 1.720 millones de parámetros. No se ha publicado en la información disponible ningún detalle sobre el proceso de entrenamiento, la composición del dataset, el número de tokens utilizados ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas de esta conversión.

La única transformación aplicada por el autor es la cuantización a 4 bits mediante MLX, partiendo de los pesos ya cuantizados de mlx-community/Qwen3-1.7B-4bit. No se indica si se realizó algún ajuste fino posterior, destilación o modificación de la tokenización. La model card se limita a declarar la procedencia de los pesos y su uso previsto en la aplicación Hermit.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-1.7B.
- Generación de código y resolución de problemas matemáticos, según las capacidades del modelo original.
- Ejecución local en dispositivos Apple Silicon mediante MLX.
- No se confirma en la información disponible soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se confirma en la información disponible soporte multimodal (visión o audio).
- No se confirma en la información disponible un modo de pensamiento (thinking mode) ni capacidades multilingües específicas.

## Casos de uso

- Asistente local en iPhone y Mac: el modelo está empaquetado para la aplicación Hermit, de modo que puede ofrecer respuestas generativas sin conexión y sin enviar datos a servidores externos.
- Prototipado de aplicaciones MLX: sirve como punto de partida para desarrolladores que quieran integrar un LLM de 1,7 mil millones de parámetros en apps nativas de Apple con un peso de aproximadamente 1 GB.
- Generación de texto offline en entornos con restricciones de conectividad: adecuado para notas, resúmenes o redacción asistida en dispositivos sin red.
- Educación y experimentación: permite estudiar el comportamiento de un modelo cuantizado a 4 bits en hardware de consumo sin incurrir en costes de GPU en la nube.
- Automatización de tareas de texto en el dispositivo: clasificación, extracción de entidades o reformulación de contenido con latencia local y sin dependencia de API.
- Evaluación de cuantizaciones MLX: útil para comparar la calidad de la conversión 4-bit frente a los pesos originales en flujos de trabajo de investigación sobre eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: alrededor de 1 GB para los pesos en 4 bits, más overhead de activaciones y contexto; se recomienda al menos 2-3 GB de memoria unificada disponible.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y en iPhone compatible con la app Hermit.
- Opciones de despliegue: MLX (librería nativa), integración en la app Hermit; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hermit-1.1-Lite-MLX-4bit | 1,72 B | no disponible | Apache-2.0 | safetensors (MLX 4-bit) | Hugging Face |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible en esta ficha | Apache-2.0 | safetensors | Hugging Face |
| mlx-community/Qwen3-1.7B-4bit | 1,72 B | no disponible en esta ficha | Apache-2.0 | safetensors (MLX 4-bit) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento de esta conversión frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; se heredan los riesgos del modelo base Qwen3-1.7B.
- Riesgo de alucinación inherente a un modelo de 1,7 mil millones de parámetros, especialmente en tareas de conocimiento factual.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos originales en precisión completa; no se han publicado métricas que cuantifiquen esa pérdida.
- No se confirman los idiomas soportados ni el rendimiento en castellano.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene un número muy bajo de descargas y likes, lo que sugiere escasa validación por la comunidad.
- El despliegue está orientado a MLX y Apple Silicon; no se garantiza su funcionamiento en otras plataformas sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aiquantgod/Hermit-1.1-Lite-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Pesos cuantizados de referencia: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
