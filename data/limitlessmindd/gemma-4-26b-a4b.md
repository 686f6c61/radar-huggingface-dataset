# LimitlessMindd/gemma-4-26B-A4B

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje multimodal desarrollado por Google DeepMind, perteneciente a la familia Gemma 4. Se trata de una arquitectura de mezcla de expertos (MoE) con 25.2 mil millones de parámetros totales, de los cuales solo 3.8 mil millones se activan por paso de inferencia, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo acepta entradas de texto e imagen y genera texto, con soporte nativo para razonamiento configurable y function calling.

La relevancia de este modelo radica en su diseño orientado a despliegue en entornos con recursos limitados, como estaciones de trabajo con GPU de consumo, manteniendo una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en producción comercial. La versión publicada en Hugging Face corresponde al modelo base (no instruido), aunque existe una variante instruida (it) disponible en otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (sliding window + global) |
| Parametros totales | 25.2B (25.805.936.206 según safetensors) |
| Parametros activos | 3.8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 140 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos en total y 8 expertos activos por token, más un experto compartido. La atención es híbrida: intercala capas con ventana deslizante local (1024 tokens) y capas con atención global completa, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE). El modelo incorpora un encoder de visión de aproximadamente 550 millones de parámetros para procesar imágenes, mientras que el texto se procesa directamente.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la documentación proporcionada. La model card indica que el modelo soporta modos de razonamiento configurables, lo que sugiere un entrenamiento orientado a tareas de razonamiento explícito, pero no se especifican los detalles metodológicos.

## Capacidades

- Generación de texto y razonamiento: capaz de resolver tareas complejas de lógica, matemáticas y análisis con un modo de pensamiento configurable.
- Comprensión de imágenes: procesa imágenes con resolución y relación de aspecto variables, permitiendo descripción, respuesta a preguntas visuales y extracción de información.
- Function calling nativo: soporta invocación de herramientas y APIs, habilitando flujos de trabajo agénticos.
- Razonamiento multi-paso: diseñado para tareas que requieren planificación y ejecución secuencial de acciones.
- Multilingüe: cobertura en más de 140 idiomas, con generación y comprensión en múltiples lenguas.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos, conversaciones prolongadas y análisis de código de gran tamaño.
- Soporte de rol de sistema: incorpora de forma nativa el rol `system` para estructurar conversaciones y controlar el comportamiento del modelo.

## Casos de uso

- Asistencia al desarrollador: el modelo puede generar, explicar y depurar código en múltiples lenguajes, integrándose en IDEs o pipelines de CI/CD mediante su capacidad de function calling para ejecutar comandos o consultar repositorios.
- Análisis de documentos extensos: gracias a su contexto de 256K tokens, puede resumir informes anuales, contratos legales o investigaciones académicas completas sin necesidad de dividir el texto.
- Agentes autónomos: su soporte nativo de function calling y razonamiento multi-paso permite construir agentes que planifican tareas, llaman a APIs externas y ejecutan flujos complejos, como automatización de procesos de negocio.
- Atención al cliente multimodal: puede procesar capturas de pantalla o imágenes de productos junto con consultas de texto, ofreciendo respuestas contextualizadas en múltiples idiomas.
- Extracción de información de imágenes: útil para digitalizar facturas, formularios o documentos escaneados, combinando OCR con comprensión semántica.
- Educación y tutoría: su capacidad de razonamiento y explicación paso a paso lo hace adecuado para plataformas de aprendizaje adaptativo, tanto en texto como con material visual.
- Investigación científica: puede analizar figuras, gráficos y tablas de artículos, ayudando a los investigadores a sintetizar resultados y generar hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras en benchmarks de codificación y capacidades agénticas, pero no proporciona cifras concretas. Se recomienda consultar el technical report (arxiv:2607.02770) para datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: al tener 25.2B parámetros totales, en FP16 se requieren aproximadamente 50 GB de VRAM para cargar el modelo completo. Sin embargo, al ser MoE con solo 3.8B activos, la memoria de activación es menor, pero los pesos totales deben residir en memoria. Con cuantización a 8 bits (~25 GB) o 4 bits (~13 GB) podría ejecutarse en GPUs de consumo.
- GPU recomendadas: para FP16, se necesitan GPUs como A100 80GB, H100 80GB o múltiples RTX 4090 (24GB) con paralelismo. Con cuantización 4-bit, una RTX 4090 o RTX 3090 (24GB) podría ser suficiente.
- Despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI. La variante instruida está disponible en plataformas como DeepInfra y MindStudio.
- Latencia y throughput: no se dispone de datos medidos. Al activar solo 3.8B parámetros, la latencia por token debería ser significativamente menor que la de un modelo denso de 25B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Gemma 4 26B A4B | 25.2B | 3.8B | 256K | Apache 2.0 | Sí (texto+imagen) |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | No |
| Qwen2.5-MoE A14B | 14.3B | 14.3B (dense) | 128K | Apache 2.0 | No |
| DeepSeek-V2-Lite | 15.7B | 2.4B | 128K | MIT | No |

Gemma 4 26B A4B se distingue por su combinación de multimodalidad, contexto muy largo y licencia permisiva. Comparado con Mixtral, ofrece un contexto 8 veces mayor y menor número de parámetros activos, lo que reduce costes de inferencia. Frente a Qwen2.5-MoE, que es denso, Gemma 4 es más eficiente en activación. DeepSeek-V2-Lite tiene menos parámetros activos pero carece de soporte de visión.

## Limitaciones y advertencias

- No se dispone de información detallada sobre sesgos específicos del modelo. Como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: aunque soporta más de 140 idiomas, el rendimiento puede variar significativamente entre lenguas, siendo más débil en idiomas con menos representación en el entrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe consultar el texto completo de la licencia de Gemma 4 para verificar cláusulas adicionales (enlace en la model card).
- Requisitos de hardware: a pesar de ser MoE, los 25.2B parámetros totales requieren memoria sustancial; no es adecuado para dispositivos móviles o portátiles de gama baja.
- La versión publicada en este repositorio es el modelo base, no instruido. Para tareas de conversación o seguimiento de instrucciones, se recomienda usar la variante `it`.

## Enlaces

- Hugging Face (modelo base): https://huggingface.co/LimitlessMindd/gemma-4-26B-A4B
- Hugging Face (modelo oficial de Google): https://huggingface.co/google/gemma-4-26B-A4B
- Technical report: https://arxiv.org/abs/2607.02770
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
- MindStudio (variante it): https://www.mindstudio.ai/models/gemma-4-26b-a4b-deepinfra
