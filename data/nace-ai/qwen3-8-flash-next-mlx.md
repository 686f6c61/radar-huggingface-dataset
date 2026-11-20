# nace-ai/Qwen3.8-Flash-Next-MLX

## Resumen

Qwen3.8-Flash-Next-MLX es una cuantización de 4 bits del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario nace-ai y empaquetada en formato MLX para su ejecución en Macs con Apple Silicon. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo de imagen-a-texto con 180 mil millones de parámetros totales y capacidad de razonamiento explícito (modo thinking) antes de generar la respuesta. La versión aquí descrita reduce los pesos a 4 bits en grupos de 64, con 696 módulos elevados a 8 bits, y ocupa 107,6 GB en disco.

La relevancia de este pack radica en su fidelidad respecto al modelo original en BF16: el autor reporta una divergencia KL de 0,067 frente a los 0,249 de la cuantización 4-bit de mlx-community, con 5,4 GB menos de peso en el modelo de lenguaje (105,20 GB frente a 110,62 GB). Esto lo convierte en una opción atractiva para ejecutar localmente un modelo de gran tamaño en hardware Apple de gama alta, aunque el requisito de memoria (192 GB o más según la regla del autor) lo restringe a configuraciones de Mac Studio o Mac Pro con memoria unificada muy elevada.

El pack está pensado para su uso con mlx-vlm 0.7.8 y con Kapitsa, el motor propio de Nace para modelos Qwen en macOS, que expone APIs compatibles con OpenAI, Anthropic y Ollama. La licencia es qwen-community-1.0, lo que impone condiciones específicas para uso comercial que conviene revisar antes de desplegarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; tags indican `qwen4_exp`) |
| Parámetros totales | 179.999.981.459 (≈180 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (grupos de 64) con 696 módulos a 8-bit (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors (MLX), cuantizado Q4 |
| Tamaño del repo | 179,1 GB (carpeta `Q4/`: 107,6 GB) |
| Pipeline | image-text-to-text |
| Librería | mlx |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los tags del repositorio incluyen `qwen4_exp`, lo que sugiere una variante experimental de la familia Qwen de cuarta generación, y el pipeline declarado es `image-text-to-text`, lo que confirma capacidades multimodales de entrada de imagen y salida de texto. El número de parámetros totales (≈180 B) indica un modelo de gran escala, aunque se desconoce si emplea una arquitectura densa o de mezcla de expertos (MoE), así como el número de parámetros activos.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si el modelo base incorporó RLHF, DPO u otras técnicas de alineación. La información disponible se centra en el proceso de cuantización: el pack aplica cuantización de 4 bits en grupos de 64, con 696 módulos seleccionados a 8 bits para preservar la fidelidad, logrando una divergencia KL de 0,067 respecto al BF16 original. El autor compara este resultado con otras cuantizaciones públicas (nace-ai plain 4-bit, mlx-community 4-bit, TensorFold 4-bit y TensorFold oQ4-MTP), situando su pack como el más cercano al modelo original en la gráfica incluida en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat y modo thinking activado por defecto.
- Razonamiento explícito antes de responder, con niveles de profundidad configurables mediante `reasoning_effort` (`low`, `medium`, `xhigh`) y posibilidad de desactivarlo con `enable_thinking: false` o `reasoning_effort: "none"`.
- Entrada de imagen y texto (pipeline `image-text-to-text`), lo que habilita tareas de comprensión visual combinadas con lenguaje.
- Tool calling / function calling compatible con definiciones de herramientas de OpenAI, con round trip completo verificado mediante el SDK de OpenAI contra `kapitsa serve`.
- Soporte de agentes y razonamiento multi-paso a través de la API de Kapitsa y del modo thinking.
- Capacidades multilingües: no se especifican los idiomas soportados; la model card advierte que valores altos de `presence_penalty` pueden mezclar idiomas.
- Generación con parámetros de muestreo recomendados diferenciados para modo thinking (temperature 1.0, top_p 0.95, top_k 20) y sin thinking (temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5).

## Casos de uso

- Asistente conversacional local en Mac de gama alta: con 107,6 GB de pesos y un requisito estimado de 192 GB de memoria unificada, el modelo puede mantener conversaciones multi-turno con contexto amplio y razonamiento explícito, sirviendo como alternativa privada a APIs en la nube para equipos con Mac Studio o Mac Pro.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, útil para tareas de extracción de información y descripción estructurada.
- Automatización de agentes con tool calling: mediante la API compatible con OpenAI de Kapitsa, el modelo puede invocar funciones externas (por ejemplo, consultas meteorológicas, APIs internas) en flujos de varios pasos, integrándose en orquestadores existentes sin cambios de código.
- Razonamiento matemático y resolución de problemas: el modo thinking con hasta 32.768 tokens de salida permite abordar problemas que requieren cadenas de razonamiento largas, como cálculo, lógica o análisis de datos.
- Prototipado de aplicaciones multimodales en Apple Silicon: el pack MLX permite a desarrolladores probar localmente un modelo de 180 B parámetros con cuantización de alta fidelidad, validando prompts y flujos antes de migrar a infraestructura de servidor.
- Servicio de chat autoalojado con API compatible con Ollama/Anthropic/OpenAI: Kapitsa expone endpoints estándar, lo que facilita sustituir proveedores externos por una instancia local controlada por el equipo, con datos que no salen del dispositivo.
- Evaluación comparativa de cuantizaciones: investigadores pueden reproducir la comparación de divergencia KL frente a BF16 y contrastar el pack con otras cuantizaciones públicas (mlx-community, TensorFold) para estudiar el impacto de la cuantización en modelos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento es la divergencia KL respecto al modelo BF16 original:

| Métrica | Valor |
|---|---|
| KL a BF16 (este pack Q4) | 0,067 |
| KL a BF16 (mlx-community 4-bit) | 0,249 |
| Peso del modelo de lenguaje (este pack) | 105,20 GB |
| Peso del modelo de lenguaje (mlx-community 4-bit) | 110,62 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 192 GB o más según la regla del autor (el tamaño de RAM más pequeño cuya cuota de GPU por defecto en macOS alberga la descarga más 2 GB para una conversación). Kapitsa puede ajustarse un escalón por debajo si omite partes que no usa; `kapitsa doctor` verifica un Mac concreto.
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o superior (Mac Studio, Mac Pro). La verificación de release se ejecutó en una NVIDIA H200 con CUDA usando mlx-vlm 0.7.8 y MLX 0.32.4, pero no se ha probado en un Mac según la model card.
- ¿Cabe en GPU consumer? No: 107,6 GB de pesos y un requisito estimado de 192 GB de memoria lo excluyen de cualquier GPU consumer convencional (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: mlx-vlm 0.7.8 (carga y generación), Kapitsa 0.2.36 (sirve chat y APIs OpenAI, Anthropic y Ollama; sirve la revisión anterior `8fda1047`, no los archivos de `Q4/`, cuyo soporte llega en una versión posterior). mlx-lm 0.32.2 no puede cargar esta arquitectura todavía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX (este pack) | ≈180 B | no disponible | 4-bit (grupos de 64, 696 módulos a 8-bit) | 0,067 | qwen-community-1.0 | Hugging Face (nace-ai) |
| mlx-community 4-bit | no disponible | no disponible | 4-bit | 0,249 | no disponible | Hugging Face (mlx-community) |
| TensorFold 4-bit | no disponible | no disponible | 4-bit | no disponible | no disponible | Hugging Face (TensorFold) |
| TensorFold oQ4-MTP | no disponible | no disponible | 4-bit | no disponible | no disponible | Hugging Face (TensorFold) |
| Qwen3.8-Flash-Next (BF16) | ≈180 B | no disponible | BF16 | referencia | qwen-community-1.0 | Hugging Face (Qwen) |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo de gran escala entrenado con datos web, es previsible que herede sesgos, pero no hay datos concretos.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo thinking por defecto puede mitigarlo parcialmente, pero no se aportan métricas.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y los idiomas soportados no están disponibles. La model card advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas.
- Restricciones de licencia: licencia qwen-community-1.0 (`license: other`), con condiciones específicas para uso comercial que deben revisarse en el archivo LICENSE antes de desplegar en producción.
- Compatibilidad limitada: mlx-lm 0.32.2 no carga esta arquitectura; otras aplicaciones MLX no han sido probadas. Kapitsa 0.2.36 sirve solo la revisión anterior `8fda1047`, no los archivos de `Q4/`.
- Verificación incompleta: el release check se ejecutó en CUDA (NVIDIA H200) con mlx-vlm, no en un Mac; el comportamiento en Apple Silicon no está validado por el autor.
- Requisito de hardware muy elevado: 192 GB de memoria unificada como regla aproximada, no como medición, lo que limita su uso a equipos de gama muy alta.
- El tamaño de contexto, los parámetros activos (si es MoE) y los detalles de entrenamiento no están disponibles, lo que dificulta evaluar su idoneidad para tareas que dependan de ventanas largas o de eficiencia computacional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Buenas prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Revisión anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Carpeta Q4 del repositorio: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/main/Q4
