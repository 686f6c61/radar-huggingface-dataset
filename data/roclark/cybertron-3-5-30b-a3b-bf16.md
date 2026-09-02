# roclark/Cybertron-3.5-30B-A3B-BF16

## Resumen

El modelo `roclark/Cybertron-3.5-30B-A3B-BF16` es un reupload en Hugging Face del modelo `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, desarrollado por NVIDIA. Se trata de un modelo de lenguaje de gran tamaño (LLM) con arquitectura híbrida Mixture-of-Experts (MoE) que combina capas de Mamba-2 y capas de atención selectivas, diseñado para razonamiento general y chat. El modelo tiene 30 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que permite una inferencia eficiente en comparación con modelos densos de tamaño similar.

Este modelo es relevante porque representa una tendencia actual hacia arquitecturas híbridas que combinan mecanismos de estado (SSM) con atención, reduciendo el coste computacional sin sacrificar calidad. Además, se publica junto con métodos de decodificación especulativa para acelerar la generación de texto. La versión de roclark mantiene la licencia original `openmdw-1.1` y los pesos en formato `safetensors` con precisión BF16, aunque no se proporciona una model card detallada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con capas intercaladas de Mamba-2 y MoE, más capas de atención selectivas |
| Parametros totales | 31.577.937.344 |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (según el nombre del archivo) |
| Idiomas soportados | Inglés y otros 19 idiomas hablados, 43 lenguajes de programación (según el modelo base de NVIDIA) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida Mixture-of-Experts (MoE) que intercala capas de Mamba-2 (un modelo de espacio de estado) con capas MoE tradicionales, junto con capas de atención selectivas. Esta combinación busca aprovechar la eficiencia de los SSM para secuencias largas y la capacidad de razonamiento de la atención. Con 30B parámetros totales y solo 3B activos por token, el modelo reduce significativamente el coste de inferencia frente a un modelo denso equivalente.

Según la información de NVIDIA, el modelo fue pre-entrenado sobre un corpus extenso de datos curados y generados sintéticamente de alta calidad. El post-entrenamiento tiene una fecha de corte de datos de mayo de 2026. Además, se lanza junto con métodos de decodificación especulativa para acelerar la generación de texto, aunque no se detallan los datos exactos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, orientado a tareas de chat y agentes.
- Soporte multilingüe: entrenado en inglés y otros 19 idiomas hablados, así como 43 lenguajes de programación (según el modelo base de NVIDIA).
- Adecuado para razonamiento multi-paso y construcción de agentes, dado su diseño para eficiencia y precisión.
- Capacidad de decodificación especulativa para acelerar la inferencia (método publicado junto al modelo).
- No se especifica explícitamente soporte para tool calling o function calling en la información proporcionada.

## Casos de uso

- Desarrollo de agentes autónomos: el modelo puede gestionar tareas multi-paso gracias a su arquitectura híbrida y sus 3B activos, permitiendo inferencia eficiente en entornos con recursos limitados.
- Generación de código en producción: con soporte para 43 lenguajes de programación, puede integrarse en pipelines de CI/CD para autocompletar o revisar código, aunque no se confirma tool calling.
- Asistentes virtuales multilingües: su capacidad para 19 idiomas hablados lo hace útil para atención al cliente en mercados internacionales, con contexto largo (aunque no se especifica la longitud exacta).
- Análisis y resumen de documentos técnicos: su entrenamiento en datos científicos y de conocimiento general permite resumir informes o extraer información relevante.
- Traducción automática: al estar entrenado en múltiples idiomas, puede emplearse para traducción de textos, aunque no se detalla su rendimiento específico.
- Investigación en arquitecturas híbridas: como modelo de referencia para estudiar la combinación de Mamba-2 y MoE, útil para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 63 GB para inferencia en BF16 sin cuantización (31.577.937.344 parámetros × 2 bytes).
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU como 2× RTX 4090 (24GB cada una) con tensor parallelism.
- No cabe en una GPU de consumo estándar (16-24 GB) sin cuantización adicional, pero al ser MoE con 3B activos, la memoria necesaria para pesos completos sigue siendo alta.
- Opciones de despliegue: vLLM, TGI, o frameworks que soporten MoE híbrido con Mamba-2. No se confirma compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo es una versión reupload del original de NVIDIA, por lo que no hay datos de rendimiento comparativo con otras alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos curados y sintéticos, puede heredar sesgos de esos datos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia `openmdw-1.1` es una licencia de código abierto de NVIDIA, pero se deben revisar sus términos para uso comercial, especialmente en aplicaciones de producción.
- El repositorio de roclark no incluye una model card detallada, por lo que se carece de información sobre el proceso de entrenamiento específico o configuraciones de post-entrenamiento.

## Enlaces

- [Hugging Face - roclark/Cybertron-3.5-30B-A3B-BF16](https://huggingface.co/roclark/Cybertron-3.5-30B-A3B-BF16)
- [Hugging Face - NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Hugging Face - NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16)
- [NVIDIA NIM - nemotron-3.5-lightning-30b-a3b](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard)
- [NVIDIA NGC - nemotron-3.5-lightning](https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning)
