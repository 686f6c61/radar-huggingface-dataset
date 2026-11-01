# nativ-community/flint-6bit

## Resumen

Flint 6bit es una cuantización a 6 bits del modelo Flint, desarrollado por RecursiveSI, publicada por la comunidad nativ-community en HuggingFace. Se trata de una conversión para el ecosistema MLX de Apple, realizada con MLX-VLM 0.7.10 y MLX 0.32.4, que permite ejecutar el modelo de forma eficiente en hardware Apple Silicon (Mac con chips M1 a M5). El modelo base es un modelo de generación de texto conversacional con arquitectura MoE (mixture of experts), según se deduce de los 47 enrutadores MoE mencionados en la documentación de la conversión.

La relevancia de esta conversión radica en la creciente demanda de ejecutar modelos grandes localmente en Mac: con 39,8 mil millones de parámetros totales, la versión BF16 original sería inviable en la mayoría de equipos de consumo, mientras que la cuantización a 6 bits reduce el tamaño a 32,3 GB, accesible para máquinas con 36 GB o más de memoria unificada. La conversión preserva el tokenizador, la plantilla de chat, la configuración de generación y la licencia Apache-2.0 del modelo original, además de mantener el control del modo de razonamiento ("thinking") mediante la plantilla original.

Cabe destacar que la conversión ha sido validada únicamente mediante pruebas de humo (recarga estricta, logits finitos, comprobaciones aritméticas y de código simple) en un Apple M5 Max, y no se han evaluado los pesos cuantizados en el conjunto de benchmarks publicado del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (47 enrutadores MoE, detalle completo no disponible) |
| Parametros totales | 39.785.299.488 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada prompt/salida, según configuración del modelo fuente) |
| Tipos de cuantizacion | 6-bit affine (group size 64) para pesos; 8-bit affine (group size 64) para los 47 enrutadores MoE; parámetros de normalización, attention sinks y otros no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, RecursiveSI/flint, es un transformer con arquitectura mixture of experts (MoE), como evidencia la cuantización específica de sus 47 enrutadores MoE a 8 bits con group size 64, una práctica habitual para preservar la precisión de las decisiones de enrutamiento mientras se comprimen los pesos de los expertos. El número de expertos activos por token, la dimensión del modelo y otros detalles arquitectónicos no están disponibles en la información proporcionada.

Sobre el entrenamiento del modelo fuente (número de tokens, composición del dataset, uso de RLHF o DPO) no hay datos disponibles en la model card. Respecto a la conversión publicada, se trata de una cuantización affine a 6 bits con group size 64, generada de forma reproducible con el comando `mlx_vlm.convert` (MLX 0.32.4, dtype bfloat16 como base). Los sidecars originales (tokenizer.json, chat_template.jinja, generation_config.json, LICENSE) se copian sin modificaciones, y la integridad de los artefactos se documenta mediante SHA256SUMS y conversion.json con los hashes por shard.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), con plantilla de chat nativa preservada del modelo fuente.
- Modo de razonamiento ("thinking") controlado por la plantilla original de chat; no se incluye un mecanismo de desactivación alternativa, y el razonamiento consume el presupuesto de tokens de salida.
- Generacion de codigo: la validación incluye la generación de una función en Python (fusión de intervalos solapados), verificada por parsing AST (sin ejecución).
- Capacidades multimodales potenciales vía mlx-vlm: la conversión se realizó con la librería MLX-VLM, lo que sugiere soporte de visión en el modelo fuente, aunque la model card no lo detalla explícitamente.
- Contexto largo: la configuración fuente admite 262.144 tokens combinados de prompt y salida, aunque las pruebas de humo de esta conversión no validan la calidad en contexto largo.
- Decodificación con los valores por defecto del modelo fuente: temperatura 1.0, top-p 0,95 y top-k 20.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: el objetivo principal de esta conversión es permitir ejecutar un modelo de ~40 B de parámetros en máquinas con memoria unificada suficiente (36-64 GB), sin depender de GPUs de datacenter.
- Generacion y prototipado de codigo: se puede usar con `mlx_vlm.generate` para generar funciones y utilidades en Python u otros lenguajes directamente en local, útil para desarrollo asistido sin enviar código a servicios externos.
- Asistente conversacional privado: al ejecutarse íntegramente en local, es adecuado para chatbots que procesan información sensible sin exfiltración de datos.
- Razonamiento paso a paso en tareas complejas: el modo thinking de la plantilla original permite tareas de razonamiento multi-paso, siempre con un presupuesto de salida ampliado (por ejemplo, `--max-tokens` elevado) para acomodar el razonamiento.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o analizar documentos extensos, aunque conviene verificar la calidad en contexto largo, no validada en esta conversión.
- Integracion en pipelines locales con MLX: al ser un modelo MLX nativo, se integra en flujos de trabajo en Swift/Python sobre Apple Silicon para automatización on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que estos pesos cuantizados no han sido evaluados en el conjunto de benchmarks publicado del modelo fuente, y que las validaciones realizadas son pruebas de humo (aritmética, recuperación corta, generación de código verificado por AST), no una medición de calidad ni una prueba de equivalencia con BF16 o Transformers.

## Requisitos de hardware

- VRAM/memoria estimada: 32,3 GB solo de pesos; se recomienda al menos 36-48 GB de memoria unificada para dejar margen al KV cache y al sistema operativo.
- Hardware objetivo: Mac con Apple Silicon. La validación se realizó en un Apple M5 Max con MLX 0.32.4. No es un modelo para CUDA por defecto (formato MLX); para GPUs NVIDIA habría que buscar conversiones GGUF o usar el modelo base.
- Consumer hardware: cabe en Mac Studio y MacBook Pro de gama alta (M3/M4/M5 Max con 36-64 GB o más de memoria unificada). No cabe en la mayoría de portátiles con 16-24 GB.
- Opciones de despliegue: MLX y MLX-VLM (vía `mlx_vlm.generate` o la API Python de mlx-vlm). No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles. En Apple Silicon con memoria unificada, los modelos MoE cuantizados suelen ofrecer decodificación interactiva, pero no hay mediciones publicadas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| nativ-community/flint-6bit | 39,8 B (total) | MoE | 262.144 tokens | Apache-2.0 | safetensors MLX, 6-bit |
| Qwen3-30B-A3B (cuantizado MLX) | 30,5 B total / 3,3 B activos | MoE | 32.768-131.072 tokens | Apache-2.0 | safetensors / GGUF |
| Mixtral-8x7B-Instruct | 46,7 B total / 12,9 B activos | MoE | 32.768 tokens | Apache-2.0 | safetensors / GGUF |

Flint 6bit destaca por su ventana de contexto de 262.144 tokens, superior a la de Qwen3-30B-A3B y Mixtral-8x7B, y por su disponibilidad nativa en MLX para Apple Silicon. Su inconveniente es la falta de benchmarks publicados y de datos sobre parámetros activos, lo que dificulta estimar su rendimiento relativo. Los datos de Qwen3 y Mixtral son referencias de categoría y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- La calidad de la cuantización a 6 bits no está garantizada: la propia model card advierte que la cuantización puede alterar las respuestas y que no hay prueba de equivalencia con BF16 o Transformers.
- No hay benchmarks publicados para esta conversión; las validaciones son pruebas de humo con solo tres prompts y presupuesto de 512 tokens.
- La calidad en contexto largo (hasta 262.144 tokens) no ha sido validada en las pruebas de humo.
- Sesgos y riesgo de alucinación del modelo fuente: no documentados en esta model card; deben consultarse en la ficha de RecursiveSI/flint.
- El razonamiento ("thinking") consume el presupuesto de tokens de salida, lo que puede truncar respuestas si `--max-tokens` es bajo.
- No hay soporte documentado para desactivar el modo thinking mediante override en esta conversión.
- Los valores por defecto de generación (temperatura 1,0) pueden producir salidas variables; para reproducibilidad se usó decodificación greedy en las validaciones.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de la licencia y las atribuciones.
- Dependencia de versiones concretas: la conversión requiere MLX 0.32.4 y un commit específico de mlx-vlm para reproducibilidad; versiones distintas pueden comportarse diferente.

## Enlaces

- Modelo cuantizado: https://huggingface.co/nativ-community/flint-6bit
- Modelo fuente: https://huggingface.co/RecursiveSI/flint
- Revision del modelo fuente usada en la conversion: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Commit de MLX-VLM usado en la conversion: https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
- Metadatos de conversion: https://huggingface.co/nativ-community/flint-6bit/blob/main/conversion.json
- Validacion: https://huggingface.co/nativ-community/flint-6bit/blob/main/validation.json
- Sumas de verificacion: https://huggingface.co/nativ-community/flint-6bit/blob/main/SHA256SUMS
