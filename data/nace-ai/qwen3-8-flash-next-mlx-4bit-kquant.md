# nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-4bit-KQuant es una cuantización de 4 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada específicamente para Apple Silicon mediante la librería MLX. El trabajo lo firma nace-ai, un proyecto que publica packs cuantizados de la familia Qwen con una técnica propia de cuantización (etiquetada como KQuant y asociada a su motor Kapitsa). El modelo resuelve el problema de ejecutar un modelo de 180.000 millones de parámetros en Macs de gama alta, algo inviable en precisión BF16 dado su tamaño.

La relevancia de esta ficha está en su calidad de cuantización: según la model card, el pack Q4 mantiene una divergencia KL de 0,067 respecto al modelo BF16 original, frente a 0,249 del pack 4-bit de mlx-community, y además ocupa 5,4 GB menos en pesos del modelo de lenguaje (105,20 GB frente a 110,62 GB). Es decir, ofrece mayor fidelidad con menor huella de memoria que la alternativa comunitaria de referencia.

El pipeline declarado es image-text-to-text, por lo que hereda capacidades de visión del modelo base, y el contexto, los idiomas o los detalles de entrenamiento no están documentados en la información disponible. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; tag interno `qwen4_exp`; requiere mlx-vlm 0.7.8) |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida con thinking activado) |
| Tipos de cuantizacion | 4 bits en grupos de 64, con 696 módulos en 8 bits (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (pack MLX; 107,6 GB de descarga, repo de 179,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en los datos proporcionados: ni el tipo de transformer, ni si emplea mezcla de expertos (MoE), ni la composición del dataset, ni si hubo RLHF o DPO. El tag `qwen4_exp` sugiere una variante experimental de la familia Qwen, pero no se detalla su diseño. Lo que sí se documenta es que la arquitectura no es cargable por mlx-lm 0.32.2 y requiere mlx-vlm 0.7.8 con MLX 0.32.4, lo que apunta a un modelo multimodal con componentes de visión que las herramientas estándar de texto aún no soportan.

La innovación técnica destacable está en la cuantización, no en el entrenamiento. El pack aplica 4 bits en grupos de 64 y eleva 696 módulos a 8 bits, una asignación selectiva de precisión que la model card cuantifica con una KL de 0,067 frente a BF16. Las pruebas de release se ejecutaron en una NVIDIA H200 con CUDA, no en un Mac, lo que conviene tener en cuenta: el pack está pensado para Apple Silicon, pero la verificación publicada se hizo en hardware NVIDIA.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Modo thinking activado por defecto: el modelo razona antes de responder y devuelve el razonamiento en el campo `reasoning_content`.
- Control de profundidad de razonamiento mediante `reasoning_effort` con valores `low`, `medium`, `xhigh` y `none`.
- Tool calling / function calling compatible con definiciones de herramientas de la API de OpenAI, con round trip completo verificado en la model card.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque las capacidades de visión concretas no se detallan.
- Servicio mediante APIs compatibles con OpenAI, Anthropic y Ollama a través del motor Kapitsa.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: con 107,6 GB de descarga y un requisito orientativo de 192 GB o más de RAM unificada, permite mantener conversaciones multi-turno íntegramente en local sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Razonamiento matemático con thinking: el modo thinking y `reasoning_effort` permiten ajustar la profundidad de razonamiento en tareas como cálculo o problemas de varios pasos, con hasta 32.768 tokens de salida para dar margen a la cadena de razonamiento.
- Agentes con herramientas: el soporte de tool calling con el SDK de OpenAI permite construir agentes que consulten APIs externas (por ejemplo, meteorología) y encadenen la respuesta del modelo con los resultados de la herramienta.
- Automatización de flujos con API local: Kapitsa expone endpoints compatibles con OpenAI, Anthropic y Ollama en `127.0.0.1:8000`, lo que facilita integrar el modelo en pipelines existentes sin reescribir clientes.
- Prototipado de aplicaciones multimodales: al ser image-text-to-text, sirve para experimentar con entradas de imagen y texto en local antes de pasar a despliegues en servidor.
- Evaluación de cuantizaciones: con métricas KL publicadas frente a BF16 y frente a mlx-community, es útil como referencia para comparar técnicas de cuantización en proyectos de investigación sobre eficiencia de inferencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). El único dato cuantitativo de rendimiento es la divergencia KL respecto al modelo BF16:

| Metrica | Nace Q4 (este repo) | mlx-community 4-bit |
|---|---|---|
| KL respecto a BF16 | 0,067 | 0,249 |
| Peso del modelo de lenguaje | 105,20 GB | 110,62 GB |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 107,6 GB de descarga; la model card indica que encaja en Macs de 192 GB o más, como regla orientativa (descarga más 2 GB para conversación, según el reparto de GPU por defecto de macOS).
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada de 192 GB o superior; el motor Kapitsa puede encajar en una talla menos porque omite las partes que no usa, y `kapitsa doctor` verifica un Mac concreto.
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) por el tamaño del modelo.
- Despliegue: mlx-vlm 0.7.8 con MLX 0.32.4, o el motor Kapitsa (instalable vía Homebrew) que sirve chat web y APIs OpenAI, Anthropic y Ollama. mlx-lm 0.32.2 no puede cargar esta arquitectura.
- Nota de compatibilidad: Kapitsa 0.2.36 sirve la revisión anterior `8fda1047`, no los archivos de `Q4/`; el soporte de `Q4/` llega en una release posterior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nace Q4 (este repo) | ~180 B | no disponible | KL 0,067; 105,20 GB | qwen-community-1.0 | MLX, Apple Silicon |
| mlx-community 4-bit | ~180 B (mismo base) | no disponible | KL 0,249; 110,62 GB | qwen-community-1.0 | MLX |
| TensorFold 4-bit | ~180 B (mismo base) | no disponible | incluido en el gráfico de la model card, sin valor numérico en el texto | qwen-community-1.0 | MLX |
| TensorFold oQ4-MTP | ~180 B (mismo base) | no disponible | incluido en el gráfico, sin valor numérico en el texto | qwen-community-1.0 | MLX |

Las tres alternativas son cuantizaciones del mismo modelo base, por lo que la comparación relevante es la fidelidad frente a BF16 y la huella de memoria. No se dispone de datos de otros modelos de tamaño comparable para comparar.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia comunitaria con condiciones propias; conviene revisar el archivo LICENSE antes de cualquier uso comercial.
- La verificación de release se hizo en una NVIDIA H200 con CUDA, no en un Mac; el rendimiento real en Apple Silicon no está medido en la información disponible.
- mlx-lm 0.32.2 no carga esta arquitectura y otras aplicaciones MLX no se probaron con ella, lo que reduce las opciones de despliegue.
- Kapitsa 0.2.36 no sirve los archivos de `Q4/`, solo la revisión anterior; hay que esperar una release posterior o usar mlx-vlm.
- El modo thinking está activado por defecto y consume tokens de salida; hay que desactivarlo explícitamente con `reasoning_effort: none` o `enable_thinking: false` para respuestas directas.
- La regla de "192 GB o más" es una estimación del autor, no una medición.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por tratarse de un modelo de lenguaje generativo.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Revisión anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Licencia: archivo LICENSE del repositorio
