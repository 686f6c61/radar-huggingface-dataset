# Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit

## Resumen

Qwen3-Coder-30B-A3B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. La conversión la firma Outlier-Ai y está empaquetada específicamente para su ejecución nativa en Apple Silicon (M1, M2, M3 y M4) mediante la librería `mlx-lm`. No se trata de un fine-tuning ni de una fusión de pesos: los pesos originales se mantienen intactos y solo cambia el formato en disco (safetensors MLX 4-bit, plantilla de chat y tokenizer).

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 30.532.122.624 parámetros totales, orientado a tareas de código, agentes y tool calling. Su interés actual radica en que permite ejecutar localmente, sin conexión y en hardware de consumo de Apple, un modelo de codificación de 30B con capacidades agénticas, algo que hasta hace poco requería GPUs de datacenter. La cuantización a 4 bits con grupo de tamaño 64 y simétrica reduce el repositorio a 17,2 GB, un tamaño manejable en Macs con 24-32 GB de memoria unificada.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. La conversión está pensada para flujos de trabajo privados y offline: asistentes de código, generación y completado en IDE, y automatización con function calling, todo sin salir del equipo del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), conversión MLX 4-bit |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simétrica) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit, shards) + config.json + tokenizer + chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Qwen3-Coder, con 30.532.122.624 parámetros totales según los safetensors del repositorio. La conversión de Outlier-Ai no modifica la arquitectura ni los pesos: aplica cuantización de 4 bits en formato MLX con tamaño de grupo 64 y esquema simétrico, y repaqueta los shards en safetensors junto con `config.json`, el tokenizer y `chat_template.jinja`. Es compatible con `mlx-lm` 0.31.x.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones específicas de decodificación (como decodificación especulativa) en esta conversión. Cualquier dato de entrenamiento debe consultarse en la model card del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación (el repositorio incluye etiquetas `code-generation`, `code-completion` y `humaneval`).
- Razonamiento y resolución de problemas de programación, con ejemplos de widget para comprobación de primos en Python, consultas SQL con joins y refactorización con detección de bugs.
- Tool calling y function calling, con etiquetas explícitas `tool-use` y `function-calling`.
- Flujos agénticos y razonamiento multi-paso (etiqueta `agentic`).
- Conversación multi-turno (etiquetas `chat` y `conversational`).
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en Apple Silicon (etiquetas `offline`, `no-cloud`, `on-device`, `private`).
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente de código en IDE sin conexión: el modelo puede integrarse en extensiones de editor que envíen prompts al servidor local `mlx-lm`, ofreciendo completado y generación de código sin enviar el código fuente a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Refactorización y revisión de código: gracias a sus capacidades de razonamiento sobre código, puede recibir un fragmento y devolver una versión reescrita con detección de bugs, como demuestra el ejemplo de widget del repositorio.
- Generación de consultas SQL: el ejemplo de widget incluye la generación de una consulta para obtener los 10 usuarios con mayor valor de compra en los últimos 90 días, un caso realista para herramientas de análisis de datos internas.
- Automatización con function calling: el soporte de tool use permite construir agentes locales que invoquen APIs internas, scripts o herramientas del sistema operativo sin depender de servicios externos.
- Agentes de codificación multi-paso: la etiqueta `agentic` y el soporte de razonamiento multi-paso permiten encadenar tareas como leer un repositorio, proponer cambios y ejecutar pruebas en un pipeline local.
- Desarrollo en MacBook Air o Mac mini: al estar empaquetado en MLX 4-bit y ocupar 17,2 GB, puede ejecutarse en equipos Apple Silicon de gama consumer, lo que facilita prototipado y desarrollo en movilidad.
- Procesamiento multilingüe de documentación técnica: con 15 idiomas soportados, puede generar o traducir documentación de código para equipos distribuidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M, pero esos datos no se incluyen en el material proporcionado y no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 17,2 GB en formato MLX 4-bit; se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y al runtime, y 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según las etiquetas del repositorio.
- Compatibilidad con GPU de consumo: el formato MLX está diseñado para Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta conversión.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` y API Python `load`/`generate`), y la aplicación Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`), que permite cargar cualquier conversión MLX compatible.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de benchmarks de Outlier para cifras de tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-MLX-4bit (este) | 30.532.122.624 | no disponible | MLX 4-bit safetensors | apache-2.0 | Hugging Face, 139 descargas |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (base) | 30B (MoE) | no disponible | safetensors originales | apache-2.0 | Hugging Face |
| Outlier-Ai/Outlier-Coder-30B-MLX-4bit | 30B (mismo base) | no disponible | MLX 4-bit safetensors | no disponible | Hugging Face |
| Outlier-Ai/Qwen3-32B-MLX-4bit | 32B | no disponible | MLX 4-bit safetensors | no disponible | Hugging Face, 98 descargas |

La comparativa se limita a variantes del mismo modelo base y a otras conversiones MLX del mismo autor, ya que no se dispone de datos de rendimiento para comparar con alternativas de otros fabricantes. El modelo base sin cuantizar ofrece mayor fidelidad numérica pero requiere más memoria; la variante Outlier-Coder-30B-MLX-4bit parece ser otra build MLX del mismo modelo, aunque la información disponible no detalla diferencias técnicas entre ambas.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar ligeramente la calidad respecto al modelo base en tareas de razonamiento complejo o generación de código muy precisa; no se han publicado métricas de esa degradación en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs, librerías o sintaxis poco comunes; conviene validar el código generado con pruebas automatizadas.
- La longitud de contexto no está documentada en esta conversión; debe consultarse la model card del modelo base antes de diseñar flujos con contextos largos.
- El formato MLX está restringido a Apple Silicon; no es portable a GPUs NVIDIA, AMD ni a servidores x86 convencionales sin reconversión.
- Aunque la licencia es Apache 2.0, se recomienda revisar la model card del modelo base para confirmar términos y posibles restricciones adicionales.
- El repositorio tiene pocas descargas (139) y un solo like, por lo que la validación comunitaria es todavía limitada.
- La model card incluye promoción de la aplicación Outlier y enlaces con parámetros UTM; conviene separar esa información comercial de los datos técnicos del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Conversión alternativa del mismo autor: https://huggingface.co/Outlier-Ai/Outlier-Coder-30B-MLX-4bit
- Otras conversiones de Outlier-Ai:
  - https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Aplicación Outlier para macOS: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
