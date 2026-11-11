# rao-studios/Mistral-Nemo-Instruct-2407-mlx-4bit

## Resumen

Mistral-Nemo-Instruct-2407-mlx-4bit es un espejo (mirror) byte a byte del repositorio mlx-community/Mistral-Nemo-Instruct-2407-4bit, publicado por rao-studios. El modelo original es Mistral-Nemo-Instruct-2407, desarrollado por Mistral AI en colaboración con NVIDIA, un transformer decoder-only de 12.247.782.400 parámetros con 40 capas y un tokenizador de vocabulario ampliado de 131.072 tokens. Esta variante concreta ha sido convertida al formato MLX y cuantizada a 4 bits con tamaño de grupo 64 mediante mlx-lm 0.16.0, lo que reduce el peso a aproximadamente 6,9 GB distribuidos en dos shards de safetensors.

El propósito de este repositorio no es introducir cambios en el modelo, sino fijar la dependencia a un repositorio controlado por Rao Studios para su stack on-device (Ambient, Craft, Veil, a través de AII). Cada archivo de pesos y del tokenizador es idéntico al del repositorio de mlx-community en el commit 647ca0751669b21a364c86ccc5df54c4d7e4e91c; solo se añaden esta model card y el archivo LICENSE.txt. Por tanto, cualquier evaluación técnica debe remitirse al modelo base Mistral-Nemo-Instruct-2407.

Es relevante ahora porque permite ejecutar un modelo instructivo de 12B con licencia Apache-2.0 en hardware Apple Silicon mediante MLX, con un consumo de memoria moderado gracias a la cuantización 4-bit, y con soporte declarado para nueve idiomas, incluido el castellano. La ficha siguiente describe las características del modelo subyacente tal como se reflejan en la información disponible de este repositorio espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit, group size 64 (MLX) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 2 shards, ~6,9 GB |

## Arquitectura y entrenamiento

La arquitectura es MistralForCausalLM, un transformer decoder-only de 40 capas con 12.247.782.400 parámetros y un tokenizador de vocabulario de 131.072 tokens. Esta variante concreta no aporta información sobre el proceso de entrenamiento: el repositorio es un espejo del modelo convertido por mlx-community a partir de mistralai/Mistral-Nemo-Instruct-2407 mediante mlx-lm 0.16.0, y la model card no documenta el corpus, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo original.

La única transformación técnica aplicada es la cuantización a 4 bits con tamaño de grupo 64 en formato MLX, que reduce el peso a aproximadamente 6,9 GB en dos shards de safetensors. No se describen innovaciones adicionales de decodificación, atención lineal ni mecanismos híbridos en la información disponible.

## Capacidades

- Generación de texto conversacional e instructiva, según el pipeline declarado text-generation y la etiqueta conversational.
- Soporte multilingüe declarado para inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Ejecución en hardware Apple Silicon mediante la librería MLX.
- Capacidad de razonamiento, código, matemáticas, tool calling, agentes o visión: no disponible en la información proporcionada para esta variante.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede desplegarse con MLX en equipos Apple Silicon y atender conversaciones multi-turno sin conexión, gracias a su formato 4-bit de ~6,9 GB que reduce el uso de memoria unificada.
- Prototipado de aplicaciones on-device: útil para integrar un modelo instructivo de 12B en herramientas de escritorio o móviles del ecosistema Apple, donde MLX ofrece inferencia nativa.
- Evaluación de pipelines de cuantización: al ser un espejo byte a byte de una conversión mlx-community, sirve como referencia reproducible para comparar el comportamiento del modelo 4-bit frente al original en fp16/bf16.
- Generación de texto multilingüe: adecuado para tareas de redacción y traducción entre los nueve idiomas declarados, incluido el español.
- Reproducibilidad en entornos de investigación: al fijar la dependencia a un commit concreto, permite replicar resultados sin depender de cambios en el repositorio upstream.
- Integración en el stack de Rao Studios: el repositorio existe para que Ambient, Craft y Veil (vía AII) dependan de una versión controlada y estable del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 6,9 GB para los pesos en 4-bit, más overhead de activaciones y caché KV; no se dispone de cifras exactas de memoria total en la información proporcionada.
- GPU recomendadas: no disponible. El formato MLX está orientado a Apple Silicon (memoria unificada), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible para GPUs NVIDIA; en Apple Silicon se requiere un equipo con memoria unificada suficiente para alojar los ~6,9 GB de pesos más el overhead.
- Opciones de despliegue: MLX mediante mlx-lm; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están indicadas para este formato en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| rao-studios/Mistral-Nemo-Instruct-2407-mlx-4bit | 12.247.782.400 | no disponible | 4-bit, group size 64 | Apache-2.0 | safetensors (MLX) |
| mlx-community/Mistral-Nemo-Instruct-2407-4bit | 12.247.782.400 | no disponible | 4-bit | Apache-2.0 | safetensors (MLX) |
| mistralai/Mistral-Nemo-Instruct-2407 | 12.247.782.400 | no disponible | pesos originales | Apache-2.0 | safetensors |

Las tres entradas corresponden al mismo modelo subyacente en distintos formatos; no se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo sin modificaciones de pesos ni tokenizador; no debe considerarse una versión distinta del modelo original ni atribuirse a Rao Studios mejoras de rendimiento.
- No se documentan en la información disponible sesgos conocidos, tasa de alucinación ni limitaciones específicas de contexto o idioma del modelo original.
- La longitud de contexto no está indicada en la model card de este repositorio; debe consultarse la documentación del modelo base antes de asumir una ventana concreta.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el archivo LICENSE.txt incluido y las condiciones del modelo base.
- La cuantización 4-bit puede degradar la calidad respecto a los pesos originales; no se aportan métricas de esa degradación.
- El formato MLX limita el despliegue a entornos compatibles con Apple Silicon; no es directamente utilizable en stacks CUDA o ROCm sin conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/Mistral-Nemo-Instruct-2407-mlx-4bit
- Repositorio base en mlx-community: https://huggingface.co/mlx-community/Mistral-Nemo-Instruct-2407-4bit
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
