# karimire/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Google DeepMind, publicado bajo licencia Apache 2.0. Este repositorio concreto, subido por el usuario karimire, reproduce el modelo oficial de Google, que combina entrada de texto e imagen y genera texto, con un encoder de visión de aproximadamente 550 millones de parámetros. Su arquitectura MoE activa solo 3.800 millones de parámetros de un total de 25.200 millones, lo que permite un equilibrio entre capacidad y eficiencia computacional.

El modelo destaca por su ventana de contexto de hasta 256.000 tokens, soporte nativo de function calling y modos de razonamiento configurables, lo que lo hace adecuado para tareas de agente, codificación y análisis de documentos largos. Su tamaño intermedio lo posiciona para ejecutarse en GPUs de consumo y estaciones de trabajo, democratizando el acceso a capacidades de nivel frontera. La versión IT (instruction-tuned) está optimizada para seguir instrucciones y conversaciones, con soporte del rol `system` para control estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con atención híbrida (sliding window + global) y encoder de visión |
| Parametros totales | 25.805.936.206 (25,2B según la model card) |
| Parametros activos | 3.800.000.000 (3,8B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos totales y 8 activos por token, más un experto compartido. La atención es híbrida: intercala ventanas deslizantes locales de 1024 tokens con atención global completa, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE). El encoder de visión, de ~550M de parámetros, procesa imágenes con resolución y relación de aspecto variables.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO en la información disponible. La model card indica que el modelo está pre-entrenado y ajustado con instrucciones, con soporte nativo para el rol `system` y modos de pensamiento configurables. La versión IT está diseñada para seguir instrucciones y conversaciones multimodales.

## Capacidades

- Generación de texto y razonamiento: capaz de tareas complejas de lógica, matemáticas y análisis con modos de pensamiento configurables (thinking mode).
- Comprensión multimodal: procesa entrada de texto e imagen, con soporte de resolución y relación de aspecto variables.
- Function calling nativo: soporta tool calling para integración en agentes y pipelines automatizados.
- Capacidades de agente: diseñado para flujos multi-paso y razonamiento encadenado, con soporte del rol `system` para control de conversación.
- Multilingüe: soporta más de 140 idiomas, lo que facilita su uso en entornos internacionales.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos, código y conversaciones prolongadas.
- Codificación: mejoras notables en benchmarks de código, aunque no se proporcionan cifras concretas en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256K tokens de ventana, manteniendo el historial completo de interacciones y resolviendo consultas complejas con soporte de function calling para acceder a bases de datos o APIs.
- Análisis de documentos extensos: su contexto de 256K permite procesar informes financieros, contratos legales o papers académicos completos, extrayendo información relevante y generando resúmenes con razonamiento detallado.
- Generación de código en producción: con soporte nativo de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y depurar código, así como interactuar con repositorios y entornos de ejecución.
- Asistentes de investigación multimodal: al combinar texto e imagen, puede analizar figuras, diagramas y tablas en artículos científicos, respondiendo preguntas sobre el contenido visual y textual de manera conjunta.
- Agentes autónomos para automatización de tareas: su capacidad de razonamiento multi-paso y function calling permite construir agentes que planifican y ejecutan acciones en entornos digitales, como gestión de correos, reservas o extracción de datos web.
- Traducción y localización: con soporte en más de 140 idiomas, puede traducir contenido técnico o conversacional manteniendo el contexto y el tono, útil para plataformas globales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras en codificación y razonamiento, pero no proporciona cifras concretas de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar el technical report (arxiv:2607.02770) para datos detallados, aunque no está accesible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,8B parámetros totales, en FP16 se necesitan aproximadamente 51,6 GB de VRAM. Con cuantización de 8 bits, ~25,8 GB; con 4 bits, ~12,9 GB. Estas son estimaciones basadas en el tamaño, no en datos oficiales.
- GPU recomendadas: para FP16, GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, aunque no se ha verificado oficialmente.
- Si cabe en consumer GPU: con cuantización de 4 bits, podría caber en GPUs de 24 GB, pero no hay confirmación oficial. En FP16, no cabe en GPUs de consumo típicas.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se especifican configuraciones oficiales.
- Latencia y throughput: no disponible. Al ser MoE con solo 3,8B activos, la latencia por token debería ser menor que la de un modelo denso de 25B, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Modalidades |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT | 25,2B | 3,8B | 256K | Apache 2.0 | Texto, imagen |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Texto |
| Qwen2.5-MoE A14B | 14,3B | 2,7B | 128K | Apache 2.0 | Texto |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se basa únicamente en características arquitectónicas y de licencia. Gemma 4 26B A4B IT destaca por su contexto de 256K y su naturaleza multimodal, mientras que Mixtral y Qwen2.5-MoE son solo texto. La eficiencia de parámetros activos de Gemma (3,8B) es menor que la de Mixtral (12,9B), lo que podría implicar menor latencia, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en esos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque soporta 256K tokens, el rendimiento en contextos muy largos puede degradarse, y la atención híbrida con ventana deslizante de 1024 tokens puede afectar la coherencia en pasajes muy extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe consultar el texto completo de la licencia de Gemma 4 (enlace en la model card) para posibles cláusulas adicionales sobre uso responsable.
- Caveats para producción: al ser un modelo MoE, la memoria VRAM necesaria es para todos los parámetros, no solo los activos. Además, no se han publicado configuraciones oficiales de cuantización, por lo que el despliegue en hardware limitado requiere pruebas adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karimire/gemma-4-26B-A4B-it
- Modelo base oficial: https://huggingface.co/google/gemma-4-26B-A4B
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Technical report: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card oficial de Google: https://ai.google.dev/gemma/docs/core/model_card_4
