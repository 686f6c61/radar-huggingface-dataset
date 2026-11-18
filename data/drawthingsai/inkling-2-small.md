# drawthingsai/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (distribuido en Hugging Face bajo la cuenta `drawthingsai`) que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Con 594.000 millones de parámetros totales y 17.000 millones activos, se posiciona como un modelo de gran escala pero eficiente en cómputo por token gracias a su arquitectura MoE.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens y por estar entrenado nativamente en precisión NVFP4, lo que reduce los requisitos de memoria frente a alternativas en FP8 o BF16. Está pensado para desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos bajo licencia Apache 2.0.

Su relevancia actual radica en la combinación de contexto extremadamente largo, multimodalidad nativa y un formato numérico de baja precisión que facilita el despliegue en clústeres de GPU de alta gama. No obstante, sus requisitos de hardware (mínimo 500 GB de VRAM agregada) lo sitúan fuera del alcance de GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con MoE dispersa (8 de 384 expertos por token), atención híbrida local/global y codificador visual ViT |
| Parámetros totales | 594.000 millones |
| Parámetros activos | 17.000 millones |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 (nativo) y MXFP8 |
| Idiomas soportados | Inglés principal; capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8); compatible con transformers |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer autoregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que da 594.000 millones de parámetros totales pero solo 17.000 millones activos por token. La atención combina capas locales y globales, lo que permite gestionar contextos de hasta 1 millón de tokens con un coste computacional controlado. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y las representaciones de imagen y texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en precisión NVFP4, que es la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y tareas imagen-texto.
- Razonamiento multimodal combinando contexto textual largo e imágenes.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling para sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Capacidades multilingües generales, con inglés como idioma principal.
- Ventana de contexto de hasta 1 millón de tokens para documentos extensos y conversaciones largas.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a su ventana de 1 millón de tokens, manteniendo el contexto de toda la interacción sin truncamientos.
- **Asistentes de código en producción**: su soporte de tool calling y su entrenamiento en múltiples lenguajes de programación permiten integrarlo en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores.
- **RAG sobre documentación extensa**: con 1 millón de tokens de contexto puede ingerir manuales técnicos, contratos o bases de conocimiento completas y responder preguntas con referencias al documento original.
- **Análisis de documentos con imágenes**: al aceptar entradas de imagen y texto de forma conjunta, sirve para procesar informes escaneados, capturas de pantalla o diagramas junto con su texto asociado.
- **Sistemas agénticos multi-paso**: su capacidad de razonamiento multi-paso y function calling lo hace adecuado para orquestar flujos de trabajo que requieren planificación, llamadas a herramientas y verificación de resultados.
- **Investigación y fine-tuning**: al distribuirse con pesos abiertos bajo Apache 2.0, los equipos de investigación pueden ajustarlo con frameworks como Miles, SkyRL o Snowflake Cortex Training para dominios especializados.
- **Generación de contenido multimodal**: creación de descripciones, resúmenes y respuestas contextualizadas a partir de imágenes combinadas con instrucciones textuales largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de evaluaciones comparativa entre los checkpoints "Open Weights Flash" y "Open Weights Pro", pero los valores numéricos no están presentes en la información proporcionada. La única referencia cuantitativa disponible es que el checkpoint MXFP8 obtiene entre 1 y 2 puntos porcentuales más que el NVFP4 en las evaluaciones, diferencia que el propio autor califica como marginal y no significativa para casos prácticos.

## Requisitos de hardware

- **VRAM agregada mínima**: 500 GB para el checkpoint NVFP4; 800 GB para el checkpoint MXFP8.
- **Configuraciones de referencia (NVFP4)**: 2× NVIDIA B300 o 4× NVIDIA H200.
- **Configuraciones de referencia (MXFP8)**: 4× NVIDIA B300 o 8× NVIDIA H200.
- **GPU de consumo**: no cabe en GPU de consumo; requiere clúster de GPU de centro de datos.
- **Frameworks de inferencia**: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- **Post-entrenamiento**: Miles, SkyRL y Snowflake Cortex Training.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Precisión recomendada**: NVFP4 es la precisión nativa y la opción recomendada por el autor para todos los casos de uso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Requisitos de hardware muy elevados**: 500 GB de VRAM agregada como mínimo, lo que excluye su uso en estaciones de trabajo convencionales y en GPU de consumo.
- **Riesgo de alucinación**: como todo modelo generativo de gran escala, puede producir información incorrecta o inventada, especialmente en tareas de razonamiento factual o con contextos muy largos.
- **Sesgos**: los datos de entrenamiento provienen de internet y de fuentes sintéticas; la model card no detalla evaluaciones de sesgo ni mitigaciones específicas.
- **Idioma**: el inglés es el idioma principal; las capacidades multilingües se describen como generales y no se cuantifican.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card remite a una política de uso aceptable de Thinking Machines que conviene revisar antes de desplegar en producción.
- **Formato nativo NVFP4**: aunque es una ventaja en eficiencia, puede limitar la portabilidad a frameworks o hardware que no soporten dicho formato; el checkpoint MXFP8 es la alternativa.
- **Contexto de 1 millón de tokens**: el rendimiento efectivo en ventanas extremas puede degradarse; no se publican evaluaciones específicas de recuperación en contextos largos.
- **Información de entrenamiento incompleta**: no se especifican el número de tokens, la composición exacta del dataset ni las técnicas de alineación empleadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/drawthingsai/Inkling-2-Small)
- [Checkpoint NVFP4](https://huggingface.co/thinkingmachines/Inkling-2-Small)
- [Checkpoint MXFP8](https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8)
- [Tinker Playground](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Política de uso aceptable](https://thinkingmachines.ai/model-acceptable-use-policy)
- [Receta SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small)
- [Receta vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small)
- [Receta TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#inkling-2)
- [Receta Unsloth](https://unsloth.ai/docs/models/inkling-2)
- [Miles](https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small)
- [SkyRL](https://docs.skyrl.ai/docs/models/inkling2)
- [Snowflake Cortex Training](https://github.com/snowflakedb/cortex-training)
- [Together AI](https://www.together.ai/models/inkling-2-small)
- [Baseten](https://www.baseten.co/library/inkling-2-small)
- [Nebius](https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small)
- [Modal](https://modal.com/library/thinking-machines/inkling-2-small)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/models/inkling-2-small/)
- [Paquete tml-renderers](https://pypi.org/project/tml-renderers/)
