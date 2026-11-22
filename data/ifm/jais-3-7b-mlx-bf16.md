# IFM/Jais-3-7B-MLX-bf16

## Resumen

Jais-3-7B es un modelo de lenguaje denso de tipo decoder-only desarrollado por el equipo IFM (Inception42), orientado específicamente al árabe y con soporte de inglés. Esta ficha describe la conversión a formato MLX en bf16 publicada por IFM, pensada para ejecución en Apple Silicon. El modelo base cuenta con 8.999.178.240 parámetros (aproximadamente 9B, comercializado como "7B") y una ventana de contexto de 512K tokens (524.288), lo que lo sitúa en la gama media de la familia Jais-3.

La relevancia del modelo radica en su enfoque "Arabic-centric" con capacidades agénticas: incorpora un modo de razonamiento explícito (thinking mode) delimitado por las etiquetas `<ifm|think> ... </ifm|think>`, con niveles de esfuerzo configurables (`high`, `medium`, `low`) a través de la plantilla de chat. La arquitectura declarada es `k2_horizon`, una variante propia que mlx-lm todavía no soporta de forma nativa, por lo que el repositorio incluye el código del modelo (`k2_horizon.py`) que se carga mediante `trust_remote_code`.

Esta conversión MLX no aplica cuantización: mantiene los pesos originales en bf16, con un tamaño en disco de 18,0 GB y un pico de memoria de 18,2 GB para prompts cortos. La verificación de conversión reporta coincidencia de logits con el código PyTorch a un error relativo de 6e-6 o mejor, y decodificación greedy idéntica (64/64 tokens en cada prompt de prueba). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (decoder-only, denso) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; variantes 8-bit y 4-bit publicadas por separado (`IFM/Jais-3-7B-MLX-8bit`, `IFM/Jais-3-7B-MLX-4bit`) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (bf16) |

## Arquitectura y entrenamiento

El modelo base Jais-3-7B es un transformer decoder-only denso con arquitectura denominada `k2_horizon`, según la información del repositorio. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado y remite a la model card del modelo base (`IFM/Jais-3-7B`).

La innovación destacable documentada en esta conversión es el modo de razonamiento explícito: el modelo genera su cadena de pensamiento dentro de las etiquetas `<ifm|think> ... </ifm|think>` antes de emitir la respuesta final, y el nivel de esfuerzo se controla mediante el parámetro `reasoning_effort` de la plantilla de chat (`high` por defecto, `medium` o `low`). La conversión a MLX se verificó en fp32 sobre los pesos reales del modelo, con prompts en inglés, código, árabe y matemáticas: los logits coinciden con el código PyTorch (`modeling_k2_horizon.py`) con error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificación greedy con caché KV produce los mismos tokens (64/64 en cada prompt). Se realizaron pruebas de humo con mlx-lm 0.32.0 en prompts de chat en inglés y árabe, verificando que las respuestas terminan correctamente.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento explícito con modo "thinking" delimitado por `<ifm|think> ... </ifm|think>` y niveles de esfuerzo configurables (`high`, `medium`, `low`).
- Capacidades agénticas: el modelo base se presenta como "Arabic-centric Agentic AI" (título del paper asociado, arXiv:2611.10224).
- Soporte de tool calling / function calling: la model card menciona un formato de tool-call, aunque mlx-lm todavía no lo parsea y lo devuelve dentro del contenido.
- Razonamiento matemático y generación de código: verificado en las pruebas de conversión con prompts de matemáticas y código.
- Ventana de contexto larga de 512K tokens, apta para documentos extensos.
- Capacidades multilingües limitadas a árabe e inglés según los metadatos del modelo.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 512K tokens, manteniendo el historial completo de la interacción sin truncamiento.
- Procesamiento de documentos legales o administrativos en árabe: la ventana de 512K permite ingerir contratos o expedientes completos y responder preguntas sobre ellos en una sola pasada.
- Asistentes agénticos con tool calling: el modelo base está diseñado para flujos agénticos; en MLX habría que parsear manualmente el formato de tool-call hasta que mlx-lm lo soporte.
- Generación y revisión de código: útil en pipelines de desarrollo para autocompletado, explicación y revisión, con la salvedad de que el rendimiento en código no está cuantificado en los benchmarks disponibles.
- Razonamiento matemático asistido: el modo thinking con `reasoning_effort="high"` permite obtener cadenas de razonamiento paso a paso para problemas matemáticos.
- Inferencia local en Apple Silicon: desarrolladores con Mac equipados con M-series pueden ejecutar el modelo en local (18,2 GB de pico de memoria) para prototipado sin depender de la nube.
- Investigación en NLP árabe: evaluación y experimentación con un modelo denso de ~9B centrado en árabe, con licencia Apache-2.0 que facilita su uso académico y comercial.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia conversión MLX (perplejidad y velocidad), no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.):

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 6,4 |
| Disco | 18,0 GB | 9,6 GB | 7,2 GB |
| Memoria pico | 18,2 GB | 9,8 GB | 7,4 GB |
| Perplejidad WikiText-2 (inglés) | 12,829 | 12,858 (+0,2%) | 13,372 (+4,2%) |
| Perplejidad Wikipedia árabe | 17,332 | 17,350 (+0,1%) | 18,129 (+4,6%) |
| Generación (Apple M4 Max) | 28,5 tok/s | 52,7 tok/s | 70,4 tok/s |

La perplejidad se midió sobre 128 × 512 tokens (test de WikiText-2 y primeros artículos del dump `20231101.ar` de Wikipedia en árabe). El autor advierte que la perplejidad es una señal gruesa y recomienda probar cada variante sobre la carga de trabajo propia.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,2 GB de pico para prompts cortos en bf16; la caché KV crece con el contexto, por lo que contextos largos requieren más memoria.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (verificado en Apple M4 Max). No está orientado a GPU NVIDIA/AMD; para esas plataformas habría que usar los pesos PyTorch del modelo base.
- Cabe en consumer hardware Apple: un Mac con al menos 24 GB de memoria unificada podría ejecutar la versión bf16; las variantes 8-bit (9,8 GB pico) y 4-bit (7,4 GB pico) amplían el rango de equipos compatibles.
- Opciones de despliegue: `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`, todos con `--trust-remote-code` (o `trust_remote_code=True`). Requiere mlx-lm 0.32.0 o superior.
- Reducción de memoria: `--max-kv-size` y cuantización de caché KV (`--kv-bits 8`, donde esté disponible).
- Throughput medido: 28,5 tok/s en bf16, 52,7 tok/s en 8-bit y 70,4 tok/s en 4-bit sobre Apple M4 Max.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para comparar el rendimiento con modelos de la misma categoría. A continuación se comparan únicamente las variantes de cuantización del propio modelo, que es la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Memoria pico | Velocidad (M4 Max) |
|---|---|---|---|---|---|---|
| Jais-3-7B-MLX-bf16 | ~9B | 512K | Apache-2.0 | MLX safetensors | 18,2 GB | 28,5 tok/s |
| Jais-3-7B-MLX-8bit | ~9B | 512K | Apache-2.0 | MLX safetensors | 9,8 GB | 52,7 tok/s |
| Jais-3-7B-MLX-4bit | ~9B | 512K | Apache-2.0 | MLX safetensors | 7,4 GB | 70,4 tok/s |

Comparativa con modelos alternativos de otros autores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a árabe e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad factual en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modo thinking consume tokens adicionales; hay que reservar espacio en `max_tokens` para el bloque `<ifm|think> ... </ifm|think>` o la respuesta puede truncarse.
- `mlx_lm.server` no reconoce las etiquetas `<ifm|think>`: devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado. El formato de tool-call tampoco se parsea todavía.
- La arquitectura `k2_horizon` no está soportada de forma nativa por mlx-lm; es obligatorio usar `--trust-remote-code`, lo que implica ejecutar código del repositorio (revisarlo antes de usarlo en producción).
- La plantilla de chat original falla cuando un mensaje previo del asistente no tiene campo de thinking (clientes estilo OpenAI); la plantilla de esta conversión renderiza thinking vacío en esos casos.
- La caché KV crece con el contexto: los 512K tokens de ventana no son prácticos con la memoria pico indicada para prompts cortos; hay que ajustar `--max-kv-size` o cuantizar la caché.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales de uso responsable.
- Solo disponible para Apple Silicon en este formato; no hay pesos GGUF ni integración con vLLM, TGI o llama.cpp en la información disponible.

## Enlaces

- Repositorio Hugging Face (esta conversión): https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- Modelo base: https://huggingface.co/IFM/Jais-3-7B
- Variante 8-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- Paper "Jais 3: Introducing Arabic-centric Agentic AI": https://arxiv.org/abs/2611.10224
- Código del modelo en el repo: `k2_horizon.py` (incluido en el repositorio de Hugging Face)
