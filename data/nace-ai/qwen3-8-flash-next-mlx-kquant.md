# nace-ai/Qwen3.8-Flash-Next-MLX-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-KQuant es una cuantización de 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por nace-ai para su uso en Apple Silicon mediante la librería MLX. El modelo base es un transformer multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba), con aproximadamente 180.000 millones de parámetros totales según los pesos en safetensors del repositorio. La versión que nos ocupa no es un modelo nuevo, sino un empaquetado de pesos cuantizados en formato MLX que busca preservar la fidelidad respecto al BF16 original con un tamaño de archivo menor.

El interés de esta ficha radica en que nace-ai reporta una divergencia KL de 0,067 respecto al modelo BF16 original, frente a 0,249 de la alternativa de mlx-community en 4 bits, con 5,4 GB menos de pesos del modelo de lenguaje (105,20 GB frente a 110,62 GB). Es decir, se trata de una cuantización orientada a mantener la calidad del modelo original reduciendo el espacio en disco, un compromiso relevante para quienes despliegan modelos grandes en Macs con memoria unificada limitada.

El paquete incluye pesos en 4 bits agrupados en bloques de 64, con 696 módulos elevados a 8 bits, y requiere un mínimo orientativo de 192 GB de RAM en macOS para caber con holgura. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parámetros totales | 179.999.981.459 (~180B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits en grupos de 64, con 696 módulos a 8 bits (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (MLX), empaquetado para mlx-vlm y Kapitsa |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next más allá de su carácter multimodal (pipeline image-text-to-text) y de que se trata de un transformer. El repositorio de nace-ai se limita a describir el proceso de cuantización: pesos en 4 bits con grupos de 64 y 696 módulos promovidos a 8 bits, presumiblemente aquellos más sensibles a la pérdida de precisión. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo original.

La innovación técnica destacable de este paquete es la metodología de cuantización de nace-ai, que reporta una KL de 0,067 frente al BF16, muy por debajo de la alternativa de mlx-community (0,249), con un ahorro de 5,4 GB en los pesos del modelo de lenguaje. El autor menciona una herramienta propia, Kapitsa, un motor de inferencia para modelos Qwen en Mac que sirve APIs compatibles con OpenAI, Anthropic y Ollama, y que en su versión 0.2.36 sirve una revisión anterior del repositorio, no los archivos de `Q4/`. El soporte de Kapitsa para `Q4/` llegará en una versión posterior. También se indica que mlx-lm 0.32.2 no puede cargar esta arquitectura todavía, y que la verificación de release se hizo con mlx-vlm 0.7.8 y MLX 0.32.4 sobre CUDA (NVIDIA H200), no sobre un Mac.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento ("thinking") activado por defecto.
- Procesamiento de imagen y texto (image-text-to-text), según el pipeline declarado.
- Control de profundidad de razonamiento mediante `reasoning_effort` con valores `low`, `medium`, `xhigh` y `none`.
- Tool calling / function calling con definiciones de herramientas compatibles con la API de OpenAI, incluyendo ida y vuelta completa de llamada y respuesta.
- Razonamiento multi-paso y uso en agentes, implícito en el soporte de tool calling y del modo thinking.
- Capacidades matemáticas y de razonamiento general, ejemplificadas en la model card con operaciones aritméticas.
- Servido mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el paquete está pensado para ejecutarse en Apple Silicon con memoria unificada de 192 GB o más, sirviendo una página de chat y APIs compatibles con OpenAI, Anthropic y Ollama mediante Kapitsa, lo que permite integrarlo en herramientas existentes sin cambiar de SDK.
- Automatización de agentes con herramientas: gracias al soporte de tool calling con el SDK de OpenAI, se puede construir un agente que consulte APIs externas (por ejemplo, meteorología, bases de datos internas) y combine los resultados en una respuesta final, como muestra el ejemplo de la model card con `get_weather`.
- Razonamiento profundo con control de coste: el parámetro `reasoning_effort` permite ajustar la profundidad del pensamiento entre `low`, `medium` y `xhigh`, útil para tareas de análisis que requieren más cómputo frente a consultas rápidas donde conviene desactivar el thinking.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse para extraer información de capturas, formularios o figuras combinadas con instrucciones textuales, aunque la información disponible no detalla la resolución o el formato de imagen soportado.
- Evaluación de cuantizaciones en investigación: la métrica KL reportada frente a BF16 convierte este paquete en un punto de referencia para estudiar el impacto de distintas estrategias de cuantización (grupos de 64, módulos mixtos a 8 bits) en modelos de gran tamaño.
- Despliegue de un modelo de ~180B en hardware de consumo de gama alta: con 107,6 GB de descarga y un requisito orientativo de 192 GB de RAM, es viable en Mac Studio con memoria unificada suficiente, evitando clústeres de GPUs dedicadas.
- Generación de código y matemáticas en local: el modo thinking y las configuraciones de muestreo recomendadas (temperature 1.0, top_p 0.95, top_k 20 en modo thinking) permiten usar el modelo para tareas de programación y cálculo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la divergencia KL respecto al modelo BF16 original:

| Paquete | KL frente a BF16 | Tamaño de pesos del modelo de lenguaje |
|---|---|---|
| Nace Q4 (este repositorio) | 0,067 | 105,20 GB |
| mlx-community 4-bit | 0,249 | 110,62 GB |

## Requisitos de hardware

- Descarga total: 107,6 GB de archivos para el checkpoint `Q4/`.
- RAM orientativa: 192 GB o más en macOS, calculado como el tamaño de RAM más pequeño cuya cuota de GPU por defecto en macOS aloja la descarga más 2 GB para una conversación. Es una regla empírica, no una medición.
- Kapitsa puede requerir un escalón menos de RAM al omitir partes que no utiliza; `kapitsa doctor` comprueba un Mac concreto.
- GPU: la verificación de release se realizó en una NVIDIA H200 (CUDA) con mlx-vlm 0.7.8 y MLX 0.32.4; no se ha probado en un Mac según la model card.
- En GPUs de consumo (RTX 4090, etc.) no hay datos de viabilidad; el paquete está orientado a Apple Silicon con memoria unificada.
- Opciones de despliegue: mlx-vlm 0.7.8 (carga y generación), Kapitsa 0.2.36 (sirve una revisión anterior, no `Q4/`; soporte de `Q4/` en versión posterior), APIs compatibles con OpenAI, Anthropic y Ollama mediante Kapitsa. mlx-lm 0.32.2 no puede cargar esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-Flash-Next-MLX-KQuant (este) | ~180B | no disponible | 4 bits MLX, KL 0,067 | qwen-community-1.0 | Hugging Face, 1688 descargas |
| mlx-community 4-bit (Qwen3.8-Flash-Next) | ~180B (base) | no disponible | 4 bits MLX, KL 0,249 | según modelo base | Hugging Face |
| TensorFold 4-bit (Qwen3.8-Flash-Next) | ~180B (base) | no disponible | 4 bits MLX | según modelo base | Hugging Face |
| TensorFold oQ4-MTP (Qwen3.8-Flash-Next) | ~180B (base) | no disponible | 4 bits MLX | según modelo base | Hugging Face |

Los datos de parámetros y contexto de las alternativas no están detallados en la información proporcionada; se asume el mismo modelo base Qwen3.8-Flash-Next. La comparativa se limita, por tanto, a la métrica KL y al tamaño de los pesos.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- El paquete es una cuantización de 4 bits: aunque la KL reportada es baja (0,067), existe una degradación respecto al BF16 original que puede manifestarse en tareas sensibles a la precisión.
- mlx-lm 0.32.2 no puede cargar esta arquitectura; otras aplicaciones MLX distintas de mlx-vlm no han sido probadas.
- La verificación de release se hizo en CUDA (H200), no en un Mac; el rendimiento real en Apple Silicon no está medido en la información disponible.
- Kapitsa 0.2.36 sirve una revisión anterior del repositorio, no los archivos de `Q4/`; quien use Kapitsa debe esperar una versión posterior para este checkpoint.
- El requisito de 192 GB de RAM es una regla orientativa, no una medición; puede fallar en configuraciones límite.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base.
- El tamaño de descarga (107,6 GB) y el requisito de memoria limitan su uso a equipos de gama muy alta.
- El modo thinking está activado por defecto y consume tokens de salida adicionales; conviene ajustar `reasoning_effort` o desactivarlo según la tarea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Revisión anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Assets de la model card (gráfica KL): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/resolve/main/assets/nace-dark.svg
