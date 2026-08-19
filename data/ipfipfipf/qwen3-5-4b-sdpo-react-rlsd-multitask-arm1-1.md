# ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1.1

## Resumen

El modelo **Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1.1** es un ajuste fino (fine-tune) del modelo base **Qwen/Qwen3.5-4B-Base**, desarrollado por el usuario `ipfipfipf`. Aunque el repositorio no ofrece detalles específicos sobre el proceso de entrenamiento del ajuste, el nombre sugiere la aplicación de técnicas como **SDPO** (Sequence Direct Preference Optimization), **ReAct** (razonamiento y actuación), **RLSD** (Reinforcement Learning with Step-wise Decoding) y entrenamiento **multitarea**. El objetivo es mejorar las capacidades de razonamiento paso a paso, interacción con herramientas y desempeño en tareas múltiples, manteniendo la base multimodal del modelo original.

El modelo base Qwen3.5-4B, desarrollado por Alibaba, introduce una arquitectura híbrida con **Gated Delta Networks** y **Gated Attention**, junto con un codificador de visión, lo que le permite procesar tanto texto como imágenes. Con 4.205 millones de parámetros, soporta una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000) y cubre 201 idiomas. La licencia es Apache 2.0, lo que facilita su uso comercial y modificación.

Este ajuste fino se publica en formato `safetensors` y es compatible con el ecosistema Hugging Face Transformers, así como con motores de inferencia como vLLM y SGLang. Aunque el repositorio no incluye benchmarks específicos del ajuste, se puede inferir que hereda las capacidades generales del modelo base, con posibles mejoras en tareas de agente y razonamiento gracias a las técnicas de entrenamiento aplicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se especifica si es MoE; el modelo base no indica número de expertos) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors sin cuantizar) |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina **Gated Delta Networks** (una variante de atención lineal con puertas) y **Gated Attention** (atención clásica con puertas), intercaladas con bloques feed-forward. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El modelo incluye un codificador de visión para entrada de imágenes, lo que lo convierte en un modelo multimodal.

El entrenamiento del modelo base se realizó en dos etapas: preentrenamiento y postentrenamiento, con un enfoque en escalado de *reinforcement learning* en entornos multiagente y cobertura lingüística global. No se especifican detalles sobre el dataset ni el número de tokens utilizados.

En cuanto al ajuste fino `sdpo-react-rlsd-multitask-arm1.1`, el nombre indica que se aplicaron técnicas de optimización de preferencias (SDPO), razonamiento reactivo (ReAct), aprendizaje por refuerzo con decodificación paso a paso (RLSD) y entrenamiento multitarea. Sin embargo, el repositorio no proporciona información sobre los datos de entrenamiento, la duración ni los hiperparámetros utilizados, por lo que estos detalles no están disponibles.

## Capacidades

- **Multimodalidad**: procesa texto e imágenes gracias al codificador de visión integrado.
- **Razonamiento paso a paso**: el uso de ReAct y RLSD sugiere una mejora en tareas que requieren cadenas de razonamiento explícitas.
- **Interacción con herramientas**: probablemente soporta *function calling* y uso de agentes, dado el enfoque multitarea y reactivo.
- **Generación de código**: el modelo base muestra buen rendimiento en tareas de programación, según los benchmarks de Qwen3.5.
- **Multilingüismo**: cubre 201 idiomas, lo que permite aplicaciones en entornos internacionales.
- **Contexto largo**: ventana de 262K tokens, adecuada para documentos extensos o conversaciones de múltiples turnos.
- **Conversación**: pipeline `image-text-to-text` y etiqueta `conversational`, orientado a chatbots y asistentes.

## Casos de uso

- **Asistente virtual multimodal**: el modelo puede responder preguntas sobre imágenes (por ejemplo, diagnóstico de problemas visuales en fotos) y mantener conversaciones largas con contexto amplio, gracias a su ventana de 262K tokens.
- **Atención al cliente automatizada**: con soporte para múltiples idiomas y razonamiento reactivo, puede gestionar consultas complejas en varios turnos, derivando a agentes humanos cuando sea necesario.
- **Generación y revisión de código**: su capacidad de razonamiento y entrenamiento en código permite integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código.
- **Análisis de documentos extensos**: la ventana de contexto larga permite resumir o extraer información de libros, informes o contratos de gran tamaño.
- **Agentes autónomos**: el enfoque ReAct y el soporte de *tool calling* lo hacen adecuado para construir agentes que planifican, ejecutan acciones y observan resultados (por ejemplo, automatización de tareas web).
- **Educación y tutoría**: su capacidad multilingüe y de razonamiento paso a paso puede utilizarse para explicar conceptos científicos o matemáticos, adaptándose al nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `sdpo-react-rlsd-multitask-arm1.1`. Los datos disponibles en la model card corresponden al modelo base **Qwen3.5-4B**, que se muestran a continuación. Se recomienda considerar estos valores como referencia del modelo subyacente, no del ajuste.

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79,1 |

No se dispone de más métricas en la información proporcionada (la tabla original está incompleta). Para una evaluación completa del ajuste fino, sería necesario ejecutar pruebas propias.

## Requisitos de hardware

- **VRAM estimada**:
  - FP16 (sin cuantizar): ~8,4 GB para los pesos, más overhead de activaciones y KV cache, por lo que se recomiendan al menos 12 GB.
  - INT8: ~4,2 GB de pesos, total ~6-8 GB.
  - INT4: ~2,1 GB de pesos, total ~4-6 GB.
- **GPU recomendadas**: para FP16, una RTX 3090/4090 (24 GB) o A10G (24 GB) es suficiente. Para cuantización INT4, puede ejecutarse en GPUs de 8 GB como RTX 3060 o A100 (40 GB) para mayor margen.
- **Compatibilidad con consumer GPU**: sí, con cuantización INT4/INT8 es viable en GPUs de gama media (8-12 GB).
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se convierten los pesos a GGUF). También puede usarse con Ollama si se genera un archivo Modelfile.
- **Latencia y throughput**: no disponibles. Dependen de la GPU, la cuantización y el tamaño de lote. En una RTX 4090 con FP16, se estima una generación de ~20-40 tokens/s para modelos de 4B.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para el ajuste fino, por lo que la comparación se basa en el modelo base Qwen3.5-4B frente a alternativas de tamaño similar (≈4B). A continuación se presentan las características principales:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2B | 262K | Apache 2.0 | Multimodal, 201 idiomas |
| Qwen3-4B (si existe) | ~4B | 32K (típico) | Apache 2.0 | Solo texto, sin visión |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 | Solo texto, multilingüe limitado |
| Phi-3.5-mini | 3,8B | 128K | MIT | Solo texto, fuerte en razonamiento |

La ventaja principal de Qwen3.5-4B es su multimodalidad y su contexto extremadamente largo, además de la licencia Apache 2.0. Sin embargo, los benchmarks del ajuste fino no están disponibles, por lo que no se puede confirmar si supera a estos modelos en tareas específicas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar información incorrecta o sesgada, especialmente en temas controvertidos o de nicho.
- **Rendimiento no verificado del ajuste fino**: al no publicarse benchmarks ni detalles de entrenamiento, no se puede garantizar que el ajuste mejore realmente las capacidades del modelo base.
- **Idiomas**: aunque el modelo base cubre 201 idiomas, el ajuste fino podría haber reducido o alterado el soporte multilingüe, ya que no se especifica.
- **Contexto largo**: la extensión a 1M tokens requiere técnicas de interpolación posicional; el rendimiento en contextos extremadamente largos puede degradarse.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base original (Qwen3.5) para asegurar cumplimiento.
- **Fecha de publicación**: el repositorio está fechado en 2026, lo que podría indicar que es un modelo experimental o de acceso anticipado; se recomienda validar su estabilidad antes de usarlo en producción.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1.1)
- [Modelo base Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base) (referencia)
- [Blog oficial de Qwen3.5](https://qwen.ai/blog?id=qwen3.5) (mencionado en la model card)
