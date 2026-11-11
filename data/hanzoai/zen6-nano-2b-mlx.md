# hanzoai/zen6-nano-2b-mlx

## Resumen

Zen 6 Nano (2B) es un modelo multimodal de tipo image-text-to-text publicado por Hanzo AI en colaboración con Zen LM bajo licencia Apache-2.0. Se distribuye en formato MLX nativo para Apple Silicon, con pesos cuantizados a 2 bits mediante una variante ternaria con transformada de Hadamard y entrenamiento consciente de cuantización (STE QAT). El repositorio ocupa 1,2 GB e incluye una torre de visión en FP16 junto con un runtime específico para el formato Hadamard.

El modelo resuelve dos necesidades concretas: ejecución local eficiente en hardware Apple (M1 a M4 Max) sin depender de CUDA, y soporte de agentes mediante tool calling compatible con el protocolo MCP de Hanzo. Incorpora además capacidades de identidad propia (Zen 6) y una torre visual que permite entrada conjunta de imagen y texto.

Con 2.213.649.216 parámetros totales, se posiciona en la franja de modelos pequeños orientados a inferencia en dispositivo. La información pública disponible es escasa: no se detallan la longitud de contexto, los idiomas soportados ni los datos de entrenamiento, por lo que varias especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal con torre de vision FP16; pesos en base Hadamard ternaria) |
| Parametros totales | 2.213.649.216 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternaria con transformada de Hadamard (MLX nativo); torre de vision en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime Python propio en `runtime/` |

## Arquitectura y entrenamiento

La model card describe los pesos como parámetros ternarios post-entrenados mediante STE QAT (straight-through estimator con quantisation-aware training) en base Hadamard, empaquetados en formato afín de 2 bits para MLX. La torre de visión se mantiene en FP16, lo que sugiere una arquitectura multimodal con un codificador visual independiente acoplado a un decodificador de lenguaje cuantizado de forma agresiva. El identificador interno `prism_hadamard_qwen35` en las etiquetas del repositorio apunta a una base derivada de la familia Qwen, aunque no se confirma en la documentación.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card menciona que los pesos incorporan la "identidad Zen 6" y las capacidades agénticas de tool calling `<tool_call>` de Hanzo MCP, lo que implica algún tipo de ajuste supervisado orientado a agentes, pero sin detallar metodología ni volumen de datos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`).
- Tool calling mediante el formato `<tool_call>` compatible con Hanzo MCP.
- Comportamiento agéntico orientado a flujos multi-paso a través del protocolo MCP.
- Identidad de modelo propia (Zen 6), entrenada explícitamente.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no especificadas en la información disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales en Mac: el modelo se ejecuta de forma nativa sobre MLX en chips M1 a M4 Max, lo que permite desplegar un asistente conversacional multimodal sin conexión a servicios externos ni GPU dedicada.
- Automatización de agentes con MCP: al soportar `<tool_call>` en el formato de Hanzo MCP, puede integrarse en orquestadores de agentes que invoquen herramientas externas (APIs, bases de datos, sistemas de ficheros) desde un portátil Apple.
- Análisis de capturas y documentos escaneados: la torre de visión en FP16 permite pasar imágenes junto con instrucciones textuales para extraer información estructurada de facturas, formularios o pantallazos.
- Prototipado rápido en investigación: con 1,2 GB de repositorio y cuantización de 2 bits, es viable iterar sobre experimentos multimodales en hardware de consumo sin infraestructura de servidor.
- Pruebas de pipelines agénticos en CI: al ser Apache-2.0 y de pequeño tamaño, puede incorporarse a suites de integración que validen flujos de tool calling antes de desplegar modelos mayores.
- Educación y demos interactivas: su tamaño reducido y su licencia permisiva facilitan su uso en talleres, notebooks y demostraciones públicas de modelos multimodales cuantizados.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica para estudiar el impacto de la cuantización ternaria con Hadamard en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio completo pesa 1,2 GB, por lo que la inferencia cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon; se recomienda al menos 8 GB de memoria unificada para dejar margen al runtime y al procesador de visión.
- GPU recomendadas: chips Apple M1, M2, M3 y M4 Max (según la model card); no se menciona soporte CUDA.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon; no hay información sobre ejecución en GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX mediante el `runtime/` incluido y el script `quickstart.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario Hadamard.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zen 6 Nano 2B MLX (este modelo) | 2,21 B | no disponible | Apache-2.0 | MLX safetensors 2-bit Hadamard | Multimodal, MCP, solo Apple Silicon |
| Qwen2-VL 2B | ~2 B | 32k (segun documentacion publica de Qwen) | Apache-2.0 | safetensors, GGUF | Multimodal, ecosistema amplio, soporte CUDA |
| SmolVLM 2B | ~2 B | 8k (segun documentacion publica) | Apache-2.0 | safetensors | Multimodal ligero, orientado a dispositivo |
| Gemma 3 4B | ~4 B | 128k (segun documentacion publica) | Gemma license | safetensors, GGUF | Multimodal, mayor tamaño |

Las cifras de los modelos comparativos provienen de su documentación pública y pueden variar; la información del modelo de este análisis sobre contexto y rendimiento no está disponible, por lo que la comparación cuantitativa directa no es posible.

## Limitaciones y advertencias

- La cuantización ternaria de 2 bits con Hadamard puede degradar la calidad frente a pesos en FP16 o BF16, especialmente en tareas de razonamiento complejo y matemáticas.
- El formato de pesos es específico de MLX y del runtime Hadamard incluido; no es portable directamente a llama.cpp, vLLM u otros motores sin conversión, que no está documentada.
- Solo se garantiza ejecución en Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- No se especifican idiomas soportados, por lo que el rendimiento fuera del inglés es incierto.
- No se detalla la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación inherente a modelos de 2 B; no se han publicado evaluaciones de fidelidad.
- No se documentan sesgos conocidos ni procesos de alineación más allá de la mención genérica a QAT y tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La licencia Apache-2.0 permite uso comercial, pero el fichero NOTICE debe conservarse por las atribuciones upstream.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-2b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
