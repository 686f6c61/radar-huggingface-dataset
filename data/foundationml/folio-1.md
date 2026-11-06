# FoundationML/Folio-1

## Resumen

Folio-1 es un modelo de lenguaje causal de 1.543.714.304 parámetros (1,5B) especializado en código y tareas de desarrollo, presentado por Foundation en colaboración con AeroAI. Se construye como un fine-tuning del modelo base Qwen/Qwen2.5-Coder-1.5B, lo que explica su arquitectura transformer decoder-only heredada y su ventana de contexto declarada de 32.000 tokens. Su principal singularidad es que, pese a derivar de un modelo puramente textual, se publica con pipeline `image-text-to-text`, es decir, se anuncia como multimodal con entrada de texto e imagen y salida de texto.

El modelo se distribuye en formato GGUF con cuantización Q4_K_M y también en pesos compatibles con Transformers y MLX, lo que facilita su ejecución en equipos de sobremesa y en Apple Silicon. El entrenamiento se realizó sobre la infraestructura propietaria «Forge» de Foundation, con una combinación de datos propietarios de AeroAI y Foundation y datasets destilados de Perplexity, ChatGPT, Oscilla y Claude, mediante LoRA y fine-tuning completo (FFT). La licencia declarada es Apache 2.0.

Su relevancia es limitada pero concreta: ofrece un modelo pequeño, ligero y desplegable localmente para asistencia de código, con métricas de benchmarks publicadas (HumanEval 43,9 %, MBPP 69,2 %). No obstante, la model card incluye advertencias explícitas de que no debe usarse en entornos comerciales u operativos, lo que introduce una tensión entre la licencia Apache 2.0 y las restricciones declaradas por el autor que conviene revisar antes de cualquier adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (derivada de Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos completos en safetensors; compatible con MLX |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (con restricciones de uso declaradas por el autor en la model card) |
| Formato de pesos | safetensors, GGUF (Q4_K_M), MLX |

## Arquitectura y entrenamiento

Folio-1 hereda la arquitectura de Qwen2.5-Coder-1.5B: un transformer decoder-only causal con atención completa, diseñado originalmente para generación de código y texto. El autor no detalla modificaciones estructurales sobre el modelo base, por lo que se asume que la columna vertebral arquitectónica es la de Qwen2.5-Coder-1.5B, con su tokenizador y su plantilla de chat. La ventana de contexto declarada es de 32.000 tokens. La model card indica entrada de texto e imagen, pero no especifica qué codificador visual ni qué mecanismo de proyección se ha incorporado, ni cómo se ha entrenado esa modalidad; este punto queda sin documentar.

El entrenamiento se realizó sobre la plataforma «Forge» de Foundation en cuatro etapas: prueba del modelo base, entrenamiento, evaluación y post-entrenamiento con fine-tuning y alineamiento. Se emplearon datasets propietarios de AeroAI y Foundation junto con datasets destilados generados a partir de Perplexity, ChatGPT, Oscilla y Claude. El método de ajuste combinó LoRA y fine-tuning completo (FFT). No se especifican el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO más allá de la mención genérica a «alineamiento».

## Capacidades

- Generación de texto y código en inglés, con foco declarado en tareas de programación y desarrollo.
- Razonamiento sobre código: generación de funciones, completado de fragmentos y explicación de comandos de shell (el ejemplo de la model card usa `mlx_lm.generate` para explicar comandos de terminal).
- Entrada multimodal texto-imagen según el pipeline declarado (`image-text-to-text`), aunque sin documentación técnica sobre el alcance real de esta capacidad.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con roles de sistema, usuario y asistente.
- Despliegue local en CPU/GPU mediante GGUF y en Apple Silicon mediante MLX.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia de código en local para desarrolladores individuales: el modelo puede generar funciones y completar fragmentos en un portátil con GPU de consumo gracias a su cuantización Q4_K_M y a su tamaño de 1,5B, sin depender de servicios en la nube.
- Explicación de comandos de terminal y shell: tal como muestra la model card, se puede usar para describir qué hace un comando y para qué sirve, integrado en una CLI de ayuda o en documentación interactiva.
- Generación de sitios web de un solo archivo: el ejemplo oficial pide «un sitio web de un solo archivo», un caso realista para prototipado rápido de páginas estáticas en entornos de desarrollo.
- Prototipado y pruebas en Apple Silicon: con MLX y `mlx-lm`, encaja en flujos de trabajo de desarrolladores en macOS que quieren un modelo de código ligero sin GPU dedicada.
- Evaluación comparativa de modelos pequeños de código: sus métricas publicadas en HumanEval, MBPP y BigCodeBench permiten usarlo como línea base en experimentos de investigación sobre modelos de 1,5B.
- Filtrado y revisión preliminar de fragmentos de código en pipelines internos de CI: puede señalizar errores evidentes o generar parches candidatos, siempre con revisión humana dado su tamaño reducido y su tasa de alucinación.
- Docencia y experimentación con fine-tuning: al ser un modelo pequeño con licencia Apache 2.0 y basado en Qwen2.5-Coder-1.5B, sirve como banco de pruebas para técnicas de LoRA y destilación.

## Benchmarks y rendimiento

| Benchmark | Folio-1 (%) |
|---|---:|
| HumanEval | 43,9 |
| HumanEval+ | 36,6 |
| MBPP | 69,2 |
| MBPP+ | 58,6 |
| MBPP (3-shot) | 59,2 |
| BigCodeBench-Complete (Full) | 34,6 |
| BigCodeBench-Complete (Hard) | 9,5 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos, ni métricas de MMLU, GSM8K o tareas no relacionadas con código.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 1,0-1,5 GB para los pesos cuantizados, más overhead de contexto; el repositorio completo ocupa 1,0 GB.
- En precisión completa (fp16), los 1,5B parámetros requieren aproximadamente 3 GB de VRAM, más memoria para el contexto KV.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en Apple Silicon (M1 en adelante) mediante MLX.
- Opciones de despliegue documentadas: Ollama (`ollama run hf.co/AeroAIAviation/Folio-1:Q4_K_M`), Transformers con `device_map="auto"`, y `mlx-lm` en macOS.
- No se documentan latencia ni throughput medidos. Por el tamaño, se espera inferencia interactiva en GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Folio-1 | 1,5B | 32.000 | Apache 2.0 (con restricciones declaradas) | safetensors, GGUF, MLX | Fine-tuning de Qwen2.5-Coder-1.5B; benchmarks de código publicados |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base de Folio-1; referencia directa |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Variante alineada para chat del mismo base |
| Modelos de código de ~1-2B (familia CodeLlama, StarCoder2-3B) | 1-3B | variable | licencias específicas | safetensors, GGUF | Alternativas de tamaño comparable; sin datos comparativos en la información disponible |

No se dispone de comparaciones de rendimiento directas entre Folio-1 y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card declara explícitamente: «Not for commercial and/or operational use», pese a que la licencia del repositorio es Apache 2.0. Esta contradicción debe resolverse con el autor antes de cualquier uso comercial.
- El autor advierte que el modelo es experimental y puede producir respuestas incorrectas, desactualizadas o fabricadas.
- Riesgo de alucinación en detalles numéricos y normativos, especialmente por su tamaño reducido (1,5B).
- Soporte únicamente de inglés; no se declaran capacidades multilingües.
- La modalidad de imagen no está documentada técnicamente: no se especifica codificador visual, datos de entrenamiento multimodal ni evaluación, por lo que su fiabilidad es desconocida.
- El modelo se distribuye con muy poca tracción (14 descargas, 0 likes) y sin paper ni evaluación independiente.
- Existe una discrepancia entre el ID del repositorio (`FoundationML/Folio-1`) y las referencias de la model card a `AeroAI/Folio-1` y `AeroAIAviation/Folio-1`, lo que puede afectar a la reproducibilidad de los comandos de descarga.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/FoundationML/Folio-1
- Repositorio referenciado en la model card: https://huggingface.co/AeroAIAviation/Folio-1
- Página de modelos de Foundation: https://foundationai-iota.vercel.app/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Vídeo de demostración: https://huggingface.co/AeroAIAviation/Folio-1/resolve/main/video.MP4
- Contacto: aeroaiaviation@icloud.com, aeroaisupport@icloud.com
