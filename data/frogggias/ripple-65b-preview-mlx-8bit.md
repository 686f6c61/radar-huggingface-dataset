# frogggias/Ripple-65B-Preview-MLX-8bit

## Resumen

Ripple-65B-Preview-MLX-8bit es una conversión no oficial a MLX y cuantización affine de 8 bits del modelo ricursiveAI/Ripple-65B-Preview, una release instruction-tuned en BF16 desarrollada por Ricursive. La conversión la mantiene el usuario frogggias y está pensada para ejecutar el modelo en Apple Silicon mediante la librería mlx-lm. No está hecha ni respaldada por Ricursive. Con 64.782.689.280 parámetros reales (aproximadamente 65B densos), el repositorio ocupa 68,8 GB, lo que equivale a unas 8,5 bits por peso.

El modelo base es un transformer denso de 65B con una arquitectura híbrida de atención: 16 capas de atención global que conservan todo el contexto (64 KiB de caché KV por token) y 64 capas con ventana deslizante de 1.024 tokens. Esta mezcla reduce el coste de memoria del contexto largo sin renunciar a la atención global en un subconjunto de capas. La conversión MLX mantiene los pesos lineales y de embedding en affine 8-bit con grupos de 64, mientras que las normas y las mezclas de value-residual por capa permanecen en BF16.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 65B en un Mac con 96 GB o más de memoria unificada, con una fidelidad respecto al BF16 original prácticamente indistinguible (acuerdo top-1 de 0,98–1,00 y KL ≤ 0,0007 en las pruebas del autor). El tokenizer y la plantilla de chat son los originales, sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas de atención global + 64 capas con ventana deslizante de 1.024 tokens) |
| Parametros totales | 64.782.689.280 (aproximadamente 65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Contexto completo en las 16 capas globales; ventana de 1.024 tokens en las 64 capas restantes (longitud máxima no disponible) |
| Tipos de cuantizacion | MLX affine 8-bit con grupos de 64 (aproximadamente 8,5 bits por peso); existe una versión MLX 4-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con archivo de modelo propio `ricursive.py` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros con una innovación destacable en la atención: solo 16 de sus 80 capas mantienen atención global sobre todo el contexto, mientras que las otras 64 aplican una ventana deslizante de 1.024 tokens. Esto implica que la caché KV por token es de 64 KiB únicamente en las capas globales, lo que abarata el contexto largo en memoria. Al ser un modelo denso, cada token generado lee la totalidad de los pesos, lo que condiciona el throughput en hardware consumer.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La release base es la versión instruction-tuned en BF16 de Ricursive, revisión `240d5966cbe0`. La conversión MLX se generó con `mlx_lm.convert -q --q-bits 8 --q-group-size 64 --dtype bfloat16` y se validó contra `modeling_ricursive.py` en modelos pequeños con pesos aleatorios: los logits en float32 coinciden en torno a 5e-6 en forward completo, decodificación con caché y prompts troceados por encima y por debajo de la ventana deslizante; el forward cuantizado iguala la referencia con los mismos pesos dequantizados a 2e-6.

## Capacidades

- Generación de texto conversacional y de código: la model card muestra ejemplos de generación de funciones Python y de chat multi-turno.
- Razonamiento explícito: el modelo emite su razonamiento dentro del contenido de la respuesta como `<think>…</think>`, ya que el tokenizer no tiene marcadores de think de un solo token que mlx-lm pueda separar.
- Tool calling / function calling: mlx-lm parsea las llamadas de herramienta de Ripple mediante el parser `json_tools` inferido de la plantilla de chat, con formato `<tool_call>` en JSON.
- Servidor compatible con OpenAI: `mlx_lm.server` expone el modelo con API compatible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo genera funciones y completados de código; con 65B densos ofrece una calidad propia de un modelo grande ejecutándose íntegramente en un Mac Studio con 96 GB o más de memoria unificada.
- Chat conversacional con contexto largo: las 16 capas de atención global conservan todo el contexto, lo que permite conversaciones multi-turno extensas (la prueba del autor usa un chat de 2.200 tokens) manteniendo coherencia sobre el historial.
- Agentes con tool calling: el parser `json_tools` de mlx-lm permite integrar el modelo en flujos de agente que emiten llamadas a herramientas en JSON, con razonamiento previo en `<think>`.
- Prototipado e investigación en local: investigadores que necesitan evaluar un modelo de 65B sin depender de GPUs de datacenter pueden usar la conversión MLX en hardware Apple, con fidelidad casi idéntica al BF16 original.
- Servicio interno de generación de texto: `mlx_lm.server` ofrece una API compatible con OpenAI para desplegar el modelo en un equipo Apple con 96 GB o más, con throughput medido de 11,8 tok/s para un usuario y 30,3 tok/s agregados para tres a 32K de contexto.
- Generación de documentación técnica y resúmenes: el modelo puede procesar prompts de hasta 32K tokens (prefill de 470–520 tok/s, aproximadamente un minuto para un prompt nuevo de 32K) para resumir o transformar documentación extensa.
- Pruebas de regresión de calidad de cuantización: útil como referencia para comparar el comportamiento de la versión 8-bit frente a la 4-bit del mismo autor en tareas de código y chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente métricas de fidelidad de la cuantización y de velocidad:

| Metrica | Resultado |
|---|---|
| Acuerdo top-1 con BF16 | 0,98–1,00 |
| Divergencia KL respecto a BF16 | ≤ 0,0007 |
| Salida greedy idéntica a BF16 | 10/10, 64/64 y 64/64 tokens en tres prompts |
| Decodificación (1 stream, 1K–32K contexto) | 12,3–12,8 tok/s |
| Prefill | 470–520 tok/s |
| Servidor a 32K, 1 usuario | 11,8 tok/s |
| Servidor a 32K, 2 usuarios | 22,6 tok/s agregados |
| Servidor a 32K, 3 usuarios | 30,3 tok/s agregados |

Medido en un Mac Studio con M5 Ultra (256 GB) y mlx-lm 0.32.2.

## Requisitos de hardware

- Memoria: se recomienda un Mac con 96 GB o más de memoria unificada para la versión 8-bit (69 GB de pesos).
- GPU: hardware Apple Silicon; las mediciones del autor se hicieron en un Mac Studio con M5 Ultra de 256 GB.
- GPU consumer NVIDIA: no aplica directamente, ya que el formato es MLX; para CUDA habría que usar el modelo base en PyTorch o una conversión GGUF (no disponible en la información).
- Despliegue: mlx-lm (versión >= 0.32.2) con `--trust-remote-code`, ya que mlx-lm no conoce aún la arquitectura de Ripple y el repo incluye su propio `ricursive.py` (unas 280 líneas de MLX puro).
- Servidor: `mlx_lm.server` con API compatible con OpenAI.
- Latencia y throughput: 12,3–12,8 tok/s en decodificación de un stream y 470–520 tok/s de prefill; un prompt nuevo de 32K tokens tarda aproximadamente un minuto en prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MLX-8bit | 65B densos | Global en 16 capas + ventana 1.024 en 64 capas | MLX 8-bit, Apple Silicon | Apache-2.0 | Hugging Face (este repo) |
| Ripple-65B-Preview-MLX-4bit | 65B densos | Igual que el 8-bit | MLX 4-bit, Apple Silicon | Apache-2.0 | Hugging Face (frogggias) |
| ricursiveAI/Ripple-65B-Preview | 65B densos | Igual que el 8-bit | BF16, PyTorch/SGLang | Apache-2.0 | Hugging Face (modelo base) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por Ricursive; el autor original no valida esta versión.
- Requiere `--trust-remote-code`: mlx-lm ejecuta el modelo con el archivo `ricursive.py` incluido en el repo; conviene revisarlo antes de usarlo, como advierte el propio autor.
- Hardware restringido: necesita un Mac con 96 GB o más de memoria unificada; no es desplegable en GPUs NVIDIA sin otra conversión.
- Throughput limitado: al ser denso, cada token lee todos los pesos; 12,3–12,8 tok/s en un stream limita su uso en aplicaciones de baja latencia o alto volumen.
- Contexto efectivo desigual: solo 16 capas mantienen el contexto completo; las otras 64 usan una ventana de 1.024 tokens, lo que puede afectar a la recuperación de información muy lejana en el contexto.
- Razonamiento embebido: el contenido `<think>…</think>` llega dentro del texto de la respuesta y debe separarse en postproceso si se quiere ocultar al usuario.
- Sin valores de sampling por defecto: Ricursive no publica parámetros de muestreo recomendados.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los riesgos habituales de un modelo de lenguaje sin evaluación publicada.
- Licencia Apache-2.0: permite uso comercial, pero al ser una conversión no oficial conviene verificar la licencia del modelo base antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frogggias/Ripple-65B-Preview-MLX-8bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Versión MLX 4-bit: https://huggingface.co/frogggias/Ripple-65B-Preview-MLX-4bit
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
