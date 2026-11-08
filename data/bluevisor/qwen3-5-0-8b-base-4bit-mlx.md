# bluevisor/Qwen3.5-0.8B-Base-4bit-mlx

## Resumen

Bluevisor/Qwen3.5-0.8B-Base-4bit-mlx es una conversión a formato MLX con cuantización de 4 bits del modelo base Qwen/Qwen3.5-0.8B-Base, publicado por el desarrollador independiente bluevisor. El artefacto no introduce ningún cambio sobre los pesos originales más allá de la cuantización realizada con `mlx_lm.convert -q --q-bits 4`, por lo que hereda íntegramente las características del modelo original de Qwen y su licencia Apache 2.0. El recuento real de parámetros en los safetensors es de 752.393.024, lo que confirma que se trata de un modelo compacto de menos de mil millones de parámetros.

La relevancia de esta ficha radica en su uso práctico: es el modelo que alimenta las funciones de predicción y autocompletado de la aplicación 海酷拼音 Haiku Pinyin en macOS, que descarga los pesos directamente desde este repositorio. Para desarrolladores que trabajen con el stack de Apple Silicon, esta variante ofrece un punto de partida ya cuantizado para integrar generación de texto en aplicaciones de escritorio con MLX.

No obstante, la información pública disponible es muy limitada: la model card no detalla arquitectura, contexto, idiomas ni datos de entrenamiento, y no se han publicado resultados de benchmarks en este repositorio. Los datos que se ofrecen a continuación proceden del repositorio de Hugging Face, de la model card del autor y de referencias indirectas a conversiones equivalentes de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B-Base; detalles no disponibles) |
| Parametros totales | 752.393.024 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, `mlx_lm.convert -q --q-bits 4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5-0.8B-Base, un transformer de menos de mil millones de parámetros desarrollado por Qwen. La model card de esta conversión no aporta detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras técnicas de alineación, ni el número de tokens de entrenamiento.

La única intervención técnica documentada en este repositorio es la cuantización a 4 bits mediante la herramienta `mlx_lm.convert`, que produce pesos optimizados para el framework MLX de Apple. Referencias externas a conversiones equivalentes de la comunidad (mlx-community) mencionan soporte para capas de tipo MoE, `shared_expert_gate` y casting de `A_log`, lo que sugiere que la familia Qwen3.5 podría incluir variantes con mezcla de expertos; sin embargo, no se confirma que la variante de 0.8B sea MoE ni que esta conversión concreta incorpore dichas correcciones.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado `text-generation`.
- Conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Autocompletado y predicción de texto en aplicaciones de escritorio, uso documentado por el autor en Haiku Pinyin.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el caso de uso documentado es una aplicación de pinyin, lo que sugiere manejo de chino, pero no se confirma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Autocompletado en teclados y métodos de entrada: el modelo se usa en Haiku Pinyin para sugerir caracteres y completar predicciones mientras el usuario escribe en macOS, aprovechando su tamaño reducido para inferencia local en tiempo real.
- Integración en aplicaciones de escritorio para macOS: al estar en formato MLX, se puede cargar directamente con `mlx_lm` en Apple Silicon sin necesidad de capas de conversión adicionales, lo que simplifica el empaquetado y la distribución.
- Generación de texto ligera en local: adecuado para tareas de redacción breve, resúmenes o respuestas cortas donde no se requiere un modelo de gran tamaño y se prioriza la latencia y el consumo de memoria.
- Prototipado rápido de pipelines de generación: sirve como modelo de referencia para validar flujos de MLX antes de escalar a variantes mayores de la familia Qwen3.5.
- Experimentación académica con modelos cuantizados: su licencia Apache 2.0 y su reducido tamaño facilitan su uso en entornos de investigación con recursos limitados.
- Filtrado y clasificación de texto en el dispositivo: puede emplearse para tareas auxiliares de etiquetado o moderación local en aplicaciones que no pueden enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB de pesos en 4 bits, según el tamaño del repositorio; el consumo real de memoria incluye caché KV y overhead del runtime MLX.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con soporte MLX; no está pensado para GPUs NVIDIA.
- Cabe en GPU consumer: sí, en cualquier Mac con chip Apple Silicon; también en GPUs de consumo con conversiones alternativas a GGUF, aunque este repositorio concreto es MLX.
- Opciones de despliegue: `mlx_lm` (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI requerirían conversiones adicionales no incluidas en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| bluevisor/Qwen3.5-0.8B-Base-4bit-mlx | 752.393.024 | no disponible | 4 bits | Apache 2.0 | MLX safetensors |
| mlx-community/Qwen3.5-0.8B-MLX-4bit | no disponible | no disponible | 4 bits | no disponible | MLX |
| mlx-community/Qwen3.5-0.8B-OptiQ-4bit | no disponible | no disponible | 4 bits (OptiQ) | no disponible | MLX |

Las tres variantes derivan del mismo modelo base Qwen3.5-0.8B y difieren en la herramienta de cuantización empleada. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- El modelo es una conversión de pesos sin fine-tuning; cualquier limitación del Qwen3.5-0.8B-Base original se hereda íntegramente.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original en su repositorio.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y sin validación comunitaria.
- El formato MLX limita su uso a entornos Apple; no es directamente portable a CUDA sin conversión.
- No hay información sobre el proceso de evaluación ni sobre la fidelidad de la cuantización respecto al modelo original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bluevisor/Qwen3.5-0.8B-Base-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Aplicación que usa el modelo: https://github.com/bluevisor/haiku-pinyin
- Conversión equivalente de la comunidad (MLX 4bit): https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-4bit
- Conversión equivalente de la comunidad (OptiQ 4bit): https://huggingface.co/mlx-community/Qwen3.5-0.8B-OptiQ-4bit
