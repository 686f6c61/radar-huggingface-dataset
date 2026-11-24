# nace-ai/Qwen3.5-9B-MLX-mixed-KQuant

## Resumen

Qwen3.5-9B-MLX-mixed-KQuant es una cuantización en formato MLX del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario nace-ai bajo el paraguas de su proyecto Kapitsa. No se trata de un modelo entrenado desde cero, sino de un empaquetado optimizado para Apple Silicon que redistribuye los pesos del modelo base con precisión mixta (4 y 5 bits por tensor) para su ejecución en Macs con memoria unificada. El resultado son dos checkpoints completos, Q4 y Q5, que el autor presenta como más fieles al modelo original en BF16 que otras cuantizaciones públicas de MLX.

La relevancia de esta ficha radica en su propuesta técnica: el autor reporta una divergencia KL de 0,030 para su Q4 frente a 0,081 del pack de 4 bits de mlx-community, es decir, una cercanía 2,7 veces mayor al modelo BF16 original, con un coste de solo un 5 % más de peso en el fichero del modelo de lenguaje (5,29 GB frente a 5,04 GB). El modelo base Qwen3.5-9B es multimodal (image-text-to-text) e incorpora un modo de razonamiento o "thinking" activado por defecto, lo que lo hace útil para tareas de razonamiento multi-paso, matemáticas y análisis de imágenes.

El tamaño total del repositorio es de 12,4 GB, con 9.409.813.744 parámetros reales según los safetensors. La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado es inglés. El modelo está pensado exclusivamente para el stack MLX de Apple, no para CUDA, y requiere versiones recientes de mlx-lm, mlx-vlm o motores compatibles como Kapitsa, LM Studio con motor MLX o vllm-mlx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), arquitectura Qwen3.5 (detalle interno no disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits con down_proj e in_proj_z en 5 bits, ~4,2 bits por peso; 4,7 contando escalas), Q5 (precisión mixta 5/6/8 bits por tensor, ~5,05 bits por peso; 5,55 contando escalas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), dos carpetas independientes Q4/ y Q5/ |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal de la familia Qwen3.5, capaz de procesar entradas de imagen y texto y generar texto. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. Lo que sí se conoce es que el modelo incorpora un modo de razonamiento ("thinking") activado por defecto, que devuelve la cadena de razonamiento en el campo `reasoning_content` cuando se sirve mediante APIs compatibles, y que puede desactivarse con `reasoning_effort: none` o `enable_thinking: false`.

La contribución técnica de esta ficha no está en el entrenamiento sino en la cuantización. El autor aplica una estrategia de precisión mixta por tensor: en el checkpoint Q4 mantiene en 5 bits las capas `down_proj` e `in_proj_z` mientras el resto va a 4 bits, y en el Q5 distribuye 5, 6 y 8 bits según la sensibilidad de cada tensor. El resultado se mide con divergencia KL respecto al BF16 original, una métrica de fidelidad distribucional. El autor publica una gráfica comparativa con packs de mlx-community, lmstudio-community, Brooooooklyn y mlx-works, situando su Q4 y Q5 por debajo (más cerca del BF16) que las alternativas públicas para un tamaño de fichero comparable. No se documentan innovaciones de decodificación especulativa ni atención lineal en esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con mlx-lm y APIs OpenAI.
- Razonamiento explícito o "thinking mode" activado por defecto, con configuración de esfuerzo de razonamiento (`reasoning_effort`) y posibilidad de desactivarlo.
- Comprensión de imágenes: entrada image-text-to-text mediante partes `image_url` (URL http(s) o data URL base64) en la API compatible con OpenAI.
- Razonamiento matemático y aritmético, ejemplificado en la model card con operaciones como 17 × 23.
- Soporte de tool calling / function calling: el autor reporta que todas las aplicaciones probadas salvo `llm-tool` colocaron correctamente una llamada a herramienta.
- Capacidades multilingües limitadas al inglés según el campo `language` del repo, aunque el modelo base podría tener más cobertura no declarada aquí.
- Integración con servidores compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.

## Casos de uso

- Asistente local en Mac para desarrolladores: el pack Q4 de 6,2 GB cabe en equipos con 16 GB o más de memoria unificada y permite servir un chat con API OpenAI en localhost mediante Kapitsa o mlx-lm, sin depender de la nube.
- Análisis de imágenes en flujos de trabajo de escritorio: gracias a la entrada image-text-to-text, se puede enviar una captura, un diagrama o una foto y pedir una descripción o extracción de información, integrándolo en herramientas internas que consuman la API compatible con OpenAI.
- Razonamiento matemático y verificación de cálculos: el modo thinking por defecto es adecuado para problemas aritméticos y de varios pasos donde interesa ver la cadena de razonamiento, y puede desactivarse para respuestas rápidas en producción.
- Automatización con tool calling en agentes locales: el soporte de function calling permite construir agentes que invoquen APIs o scripts del sistema, con el modelo decidiendo qué herramienta llamar y con qué argumentos.
- Prototipado de aplicaciones multimodales en Apple Silicon: investigadores y desarrolladores pueden validar pipelines de visión-lenguaje en un portátil antes de migrar a infraestructura CUDA, usando mlx-vlm o vllm-mlx.
- Evaluación de cuantizaciones: el pack resulta útil para quien quiera medir el impacto de la cuantización mixta frente a BF16 en tareas propias, comparando Q4 y Q5 del mismo repositorio con la divergencia KL reportada como referencia.
- Servicio de chat privado en red local: con `kapitsa serve --private` se levanta un endpoint que no sale del equipo, útil para datos sensibles que no deben enviarse a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de cuantización (divergencia KL respecto a BF16) y tamaños de fichero, no resultados en tareas como MMLU, HumanEval o GSM8K.

| Metrica | Q4 | Q5 |
|---|---|---|
| Divergencia KL a BF16 | 0,030 | 0,010 |
| Bits por peso (aprox.) | 4,2 (4,7 con escalas) | 5,05 (5,55 con escalas) |
| Tamano de descarga | 6,2 GB | 7,1 GB |
| RAM minima orientativa | 16 GB+ | 16 GB+ |
| Alias en Kapitsa | 9b:q4 | 9b:q5 |

## Requisitos de hardware

- VRAM/RAM estimada: al ser MLX, se usa memoria unificada. El pack Q4 ocupa 6,2 GB de descarga y el Q5 7,1 GB; el autor estima que ambos caben en equipos con 16 GB o más, aplicando la regla de que la GPU toma por defecto unos dos tercios de la RAM del sistema y dejando 2 GB para la conversación.
- GPU recomendadas: exclusivamente Apple Silicon (serie M). El autor probó el pack en un M5 Pro; no hay soporte CUDA documentado.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 16 GB o más; no aplica a GPUs NVIDIA de consumo porque el formato es MLX.
- Opciones de despliegue: Kapitsa (motor propio del autor, con APIs OpenAI, Anthropic y Ollama), mlx-lm (CLI y servidor OpenAI en el puerto 8080), mlx-vlm, LM Studio con motor MLX, SwiftLM, LocalAI con backend MLX, Osaurus, vllm-mlx y mlx-openai-server.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-mixed-KQuant (Q4) | 9,41 B | no disponible | MLX safetensors | Apache 2.0 | KL 0,030; 6,2 GB; ~4,2 bits/peso |
| mlx-community 4-bit (Qwen3.5-9B) | 9,41 B (base) | no disponible | MLX | Apache 2.0 (base) | KL 0,081 según el autor; referencia pública de 4 bits |
| lmstudio-community 4-bit (Qwen3.5-9B) | 9,41 B (base) | no disponible | MLX | Apache 2.0 (base) | Incluido en la gráfica comparativa del autor; sin KL detallado en el texto |
| mlx-works oQ4e-mtp (Qwen3.5-9B) | 9,41 B (base) | no disponible | MLX | Apache 2.0 (base) | Incluido en la gráfica comparativa del autor; sin KL detallado en el texto |

## Limitaciones y advertencias

- Plataforma restringida: el formato MLX solo se ejecuta en Apple Silicon; no es utilizable en GPUs NVIDIA, AMD ni en servidores x86 convencionales.
- Idiomas: el campo `language` declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar aplicaciones con ventanas largas sin verificación previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido incorrecto, especialmente en modo thinking desactivado o con temperaturas altas; no se documentan evaluaciones de fiabilidad.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineación específicos para esta cuantización; los sesgos heredados del modelo base no están descritos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B por si el autor original añade restricciones adicionales no reflejadas aquí.
- Fidelidad de cuantización: aunque la divergencia KL es baja, Q4 y Q5 no son idénticos al BF16; para tareas sensibles a la precisión numérica conviene validar con el modelo original.
- Madurez del ecosistema: el pack depende de versiones recientes de mlx-lm, mlx-vlm y Kapitsa; el autor documenta pruebas con versiones concretas (mlx-lm 0.32.2, mlx-vlm 0.7.10, Kapitsa 0.2.32) y podrían aparecer incompatibilidades con versiones futuras.
- Soporte de tool calling variable: el autor reporta que `llm-tool` no colocó la llamada a herramienta en sus pruebas, lo que sugiere que no todos los motores MLX manejan igual el function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-mixed-KQuant
- Repositorio del pack Q4/Q5 (referenciado en la model card): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Gráfica comparativa de divergencia KL (asset del repo): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-dark.svg
