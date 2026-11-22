# IFM/Jais-3-3.7B-MLX-4bit

## Resumen

Jais-3-3.7B-MLX-4bit es una cuantización de precisión mixta en 4 bits del modelo Jais-3-3.7B, publicada por IFM (Inception42) para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un transformer decoder-only denso de 3.700 millones de parámetros con una ventana de contexto de 524.288 tokens (512K), orientado a cargas de trabajo bilingües árabe-inglés y a casos de uso agénticos. Esta variante concreta ocupa 4,1 GB en disco y está pensada para inferencia local en Macs con chip de la serie M.

El modelo resuelve el problema de desplegar un LLM de contexto largo y centrado en árabe en hardware de consumo sin renunciar en exceso a la calidad. Frente a una cuantización 4-bit uniforme, que degrada la perplejidad un 16,3 % en WikiText-2 y un 14,5 % en Wikipedia árabe respecto a bf16, esta receta de precisión mixta limita la pérdida al 4,9 % y 5,7 % respectivamente, manteniendo un tamaño manejable.

Es relevante ahora porque el soporte de MLX para la arquitectura `k2_horizon` que usa Jais-3 todavía no está integrado en mlx-lm, de modo que el repositorio incluye el código del modelo (`k2_horizon.py`) que mlx-lm carga mediante la entrada `model_file` de `config.json`. Esto permite usar la versión publicada de mlx-lm con `--trust-remote-code`, a costa de ejecutar código remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia k2_horizon (Jais-3) |
| Parametros totales | 5.058.255.360 (según safetensors); el modelo base se denomina 3.7B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | 4-bit de precisión mixta: 4-bit grupo 32 en MLP (gate_proj, up_proj, down_proj) y 8-bit grupo 64 en atención, embeddings y lm_head; 6,5 bits/peso efectivos |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX; incluye `k2_horizon.py` y `config.json` con `model_file` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Jais-3, identificado en el repositorio con la arquitectura `k2_horizon`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo incorpora un modo de razonamiento explícito delimitado por las etiquetas `<ifm|think> … </ifm|think>`, con un nivel de esfuerzo configurable mediante `reasoning_effort` en la plantilla de chat (`high` por defecto, `medium` o `low`).

La innovación técnica destacable de esta publicación es la receta de cuantización de precisión mixta en MLX: cuantización afín entera con escalas y sesgos en bf16, 4-bit con grupo de 32 para las proyecciones MLP (donde se concentra la mayor parte de los parámetros) y 8-bit con grupo de 64 para atención, embeddings y `lm_head`. El autor verificó la conversión contra el código PyTorch (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales del modelo, con prompts en inglés, código, árabe y matemáticas: los logits coinciden con un error relativo de 6e-6 o mejor, las predicciones del siguiente token coinciden en todas las posiciones y la decodificación greedy con caché KV reproduce los mismos tokens que PyTorch (64/64 en cada prompt). También se realizaron pruebas de humo con mlx-lm 0.32.0 en prompts de chat en inglés y árabe.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento explícito mediante un modo de pensamiento interno (`<ifm|think>`) con nivel de esfuerzo ajustable (`high`, `medium`, `low`).
- Contexto largo de hasta 524.288 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de razonamiento matemático y de código (verificada en las comprobaciones de conversión con prompts de código y matemáticas).
- Soporte de tool calling / function calling: la plantilla de chat contempla un formato de llamadas a herramientas, aunque mlx-lm todavía no lo parsea.
- Orientación a casos agénticos y razonamiento multi-paso, según el título del artículo asociado ("Arabic-centric Agentic AI").
- Capacidades multilingües limitadas a árabe e inglés.

## Casos de uso

- Asistencia conversacional en árabe en local: el modelo puede mantener diálogos multi-turno con contexto largo gracias a su ventana de 512K tokens, ejecutándose en un Mac con chip M sin depender de la nube.
- Procesamiento de documentos largos en árabe: resumen, extracción de información y preguntas sobre contratos, informes o corpus extensos que caben en la ventana de contexto.
- Generación y revisión de código en inglés: útil en entornos de desarrollo sobre Apple Silicon para autocompletado, explicación de fragmentos y generación de pruebas, con la salvedad de que el tool calling no está parseado por mlx-lm.
- Razonamiento matemático asistido: el modo de pensamiento permite cadenas de razonamiento antes de responder; conviene reservar tokens suficientes en `max_tokens` para el bloque `<ifm|think>`.
- Prototipado de agentes bilingües árabe-inglés: la orientación agéntica del modelo base y su contexto largo permiten construir flujos multi-paso, aunque la integración de herramientas requiere parsear manualmente el formato de llamadas.
- Evaluación e investigación en NLP árabe: reproducción de experimentos y comparación de calidad entre cuantizaciones (bf16, 8-bit, 4-bit) sobre las mismas cargas de trabajo.
- Despliegue de servidor local ligero: `mlx_lm.server` permite exponer el modelo como servicio en una máquina Apple, con la limitación de que el texto de pensamiento se devuelve dentro de `content`.

## Benchmarks y rendimiento

Datos publicados por el autor para las tres variantes MLX de Jais-3-3.7B. Perplejidad sobre 128 × 512 tokens (WikiText-2 test y primeros artículos del volcado de Wikipedia árabe `20231101.ar`; menor es mejor) y velocidad de generación en un Apple M4 Max:

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 6,5 |
| Disco | 10,1 GB | 5,4 GB | 4,1 GB |
| Memoria pico | 10,3 GB | 5,6 GB | 4,4 GB |
| Perplejidad WikiText-2 (inglés) | 14,984 | 14,994 (+0,1 %) | 15,714 (+4,9 %) |
| Perplejidad Wikipedia árabe | 20,171 | 20,188 (+0,1 %) | 21,319 (+5,7 %) |
| Generación | 50,4 tok/s | 89,2 tok/s | 115,9 tok/s |

El autor advierte que la perplejidad es una señal gruesa y recomienda probar las distintas versiones sobre la carga de trabajo propia. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4,4 GB de pico con un prompt corto; la caché KV crece con el contexto, por lo que contextos largos requieren más memoria.
- Hardware objetivo: Apple Silicon (la librería MLX solo funciona en chips de la serie M). Las mediciones del autor se realizaron en un Apple M4 Max.
- Cabe en GPU de consumo Apple: sí, en cualquier Mac con chip M con al menos ~5 GB de memoria disponible; no es compatible con GPU NVIDIA o AMD mediante MLX.
- Opciones de despliegue: `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server` de mlx-lm (probado con la versión 0.32.0), siempre con `--trust-remote-code` o `trust_remote_code=True`.
- Reducción de memoria en contextos largos: `--max-kv-size` y cuantización de la caché KV (`--kv-bits 8`, donde esté disponible).
- Throughput: 115,9 tok/s en un Apple M4 Max con esta variante 4-bit.
- No disponible para vLLM, llama.cpp, Ollama ni TGI, al estar en formato MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| IFM/Jais-3-3.7B-MLX-4bit | 5.058.255.360 (nominal 3.7B) | 524.288 | 4-bit mixta (6,5 bits/peso) | Apache-2.0 | Apple Silicon (MLX) |
| IFM/Jais-3-3.7B-MLX-8bit | 5.058.255.360 (nominal 3.7B) | 524.288 | 8-bit (8,5 bits/peso) | Apache-2.0 | Apple Silicon (MLX) |
| IFM/Jais-3-3.7B-MLX-bf16 | 5.058.255.360 (nominal 3.7B) | 524.288 | bf16 (16,0 bits/peso) | Apache-2.0 | Apple Silicon (MLX) |
| IFM/Jais-3-3.7B (base) | 5.058.255.360 (nominal 3.7B) | 524.288 | pesos originales PyTorch | Apache-2.0 | GPU/CPU genérica |

No se dispone en la información proporcionada de datos sobre modelos de otros autores comparables en tamaño o tarea (por ejemplo, otros LLM árabe-inglés de ~4B) para ampliar la comparativa.

## Limitaciones y advertencias

- Requiere `--trust-remote-code`: el repositorio incluye y ejecuta `k2_horizon.py` porque mlx-lm no soporta aún la arquitectura `k2_horizon`; conviene revisar el código antes de ejecutarlo.
- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPU NVIDIA, AMD ni en servidores x86 convencionales.
- Idiomas limitados a árabe e inglés; el rendimiento en otros idiomas no está documentado.
- La cuantización 4-bit introduce una degradación medible: +4,9 % de perplejidad en WikiText-2 y +5,7 % en Wikipedia árabe respecto a bf16.
- El modo de pensamiento consume tokens dentro de `<ifm|think>`; si no se reserva espacio en `max_tokens`, las respuestas pueden truncarse.
- `mlx_lm.server` no reconoce las etiquetas `<ifm|think>` y devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado; el formato de tool calling tampoco se parsea.
- La plantilla de chat original falla cuando un mensaje previo del asistente no incluye campo de pensamiento (lo habitual en clientes estilo OpenAI); esta versión la modifica para renderizar un pensamiento vacío en esos casos.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible análisis específicos; deben evaluarse sobre la carga de trabajo concreta.
- Licencia Apache-2.0, que permite uso comercial, pero se hereda del modelo base y conviene consultar la model card original para condiciones y usos previstos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/Jais-3-3.7B
- Variante bf16: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- Variante 8-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Código del modelo incluido en el repo: `k2_horizon.py` (en el propio repositorio)
- Artículo citado: arXiv:2611.10224, "Jais 3: Introducing Arabic-centric Agentic AI" (Team IFM et al.)
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-3.7B (enlace de licencia indicado por el autor)
