# patdev/k3-a40-bootstrap

## Resumen

El repositorio `patdev/k3-a40-bootstrap` no contiene un modelo de lenguaje en sí, sino un conjunto de scripts, configuraciones y artefactos de despliegue para levantar un endpoint compatible con la API de Anthropic (`/v1/messages`) sobre una GPU NVIDIA A40 (24 GB) alojada en RunPod. Su objetivo principal es permitir que herramientas como Claude Code utilicen modelos open source (Qwen3-Coder-30B o Kimi-Linear-48B) a través de un proxy que traduce la API de Anthropic a la de OpenAI, con soporte de streaming SSE, tool calling y conteo de tokens.

El autor, `patdev`, documenta mediciones de rendimiento reales en una sola A40: hasta 575 tokens por segundo en modo mono-flujo para edición de código con Qwen3-Coder-30B gracias a decodificación especulativa, y hasta 1 166 tok/s en modo agregado con 32 flujos. También incluye artefactos de Kimi-K3 (un modelo de 2,8 billones de parámetros de Moonshot AI) en formato GGUF, aunque el propio autor indica que esa vía fue abandonada por bajo rendimiento en A40. El repositorio tiene un tamaño de 7,0 GB e incluye un archivo `safetensors` con 2 249 289 601 parámetros, que probablemente corresponde a una versión cuantizada de Kimi-K3, pero no se especifica claramente en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (repositorio de scripts de despliegue; los modelos subyacentes son Qwen3-Coder-30B y Kimi-Linear-48B) |
| Parametros totales | 2 249 289 601 (dato del archivo safetensors incluido, no del modelo completo) |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 1 048 576 tokens (Kimi-Linear-48B) o 262 144 (Qwen3-Coder-30B), segun la configuracion |
| Tipos de cuantizacion | BF16 (archivo `Kimi-K3-DSpark-BF16.gguf`), otros no especificados |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un conjunto de herramientas para desplegar modelos existentes. Los modelos mencionados en la documentación son:

- **Qwen3-Coder-30B**: un modelo de lenguaje de 30 mil millones de parámetros, optimizado para generación de código, con soporte de tool calling y una ventana de contexto de 262 144 tokens.
- **Kimi-Linear-48B**: un modelo de 48 mil millones de parámetros con arquitectura híbrida (atención lineal), desarrollado por Moonshot AI, con contexto de 1 048 576 tokens y tool calling.
- **Kimi-K3**: un modelo de 2,8 billones de parámetros con arquitectura MoE, atención Delta (KDA) y residuales (AttnRes), con capacidades multimodales nativas. El repositorio incluye un archivo GGUF de este modelo, pero el autor documenta que su despliegue en A40 fue abandonado por rendimiento insuficiente (7,3 tok/s frente a 29,2 tok/s de la API oficial).

El repositorio incluye scripts de arranque para vLLM y llama.cpp, un proxy Python que traduce la API de Anthropic a OpenAI, y un protocolo de pruebas. No se proporcionan detalles sobre el entrenamiento de los modelos subyacentes.

## Capacidades

- **Servir API compatible con Anthropic**: el proxy `anthropic_proxy.py` expone el endpoint `/v1/messages` con streaming SSE, tool calling y `count_tokens`, lo que permite usar Claude Code con modelos open source.
- **Soporte de tool calling**: tanto Qwen3-Coder-30B como Kimi-Linear-48B admiten llamadas a herramientas, activadas mediante los identificadores `qwen3_coder` y `kimi_k2`.
- **Decodificación especulativa**: el script de vLLM incluye especulación n-gram para Qwen3-Coder-30B, que alcanza 575 tok/s en mono-flujo gracias a la emisión de 17,16 tokens por lectura de pesos en tareas de edición de código.
- **Reconfiguración en caliente**: el script `vllm_bootstrap.sh` permite recargar los modelos sin recrear el pod de RunPod.
- **Medición de rendimiento**: incluye un script `bench_endpoint.sh` para medir latencia y throughput en diferentes modos (mono-flujo, agregado, prefill frío/caliente).
- **Compatibilidad con múltiples modelos**: permite alternar entre Qwen3-Coder-30B y Kimi-Linear-48B según la carga de trabajo.

## Casos de uso

- **Uso de Claude Code con modelos open source**: configurando `ANTHROPIC_BASE_URL` y `ANTHROPIC_API_KEY` apuntando al endpoint del pod, un desarrollador puede ejecutar Claude Code sobre Qwen3-Coder-30B o Kimi-Linear-48B, reduciendo costes frente a la API oficial de Anthropic.
- **Desarrollo de agentes de edición de código**: el modo mono-flujo con especulación n-gram está optimizado para el patrón de un solo usuario que edita código de forma iterativa, alcanzando 575 tok/s con un coste de 0,21 $/1M de tokens.
- **Servicio multi-usuario de bajo coste**: desactivando la especulación, el endpoint puede servir hasta 1 166 tok/s agregados con 32 flujos, a 0,105 $/1M, adecuado para equipos pequeños que comparten una GPU.
- **Pruebas de integración de API**: el script `test_anthropic.sh` valida la compatibilidad del protocolo con Claude Code, distinguiendo entre "responde" y "funciona correctamente".
- **Evaluación de rendimiento de modelos en hardware limitado**: el repositorio documenta mediciones detalladas de prefill, decodificación y coste por token, útiles para comparar alternativas en una A40.
- **Despliegue rápido en RunPod**: el script `vllm_bootstrap.sh` automatiza la instalación y configuración, reduciendo el tiempo de puesta en marcha a menos de una hora.

## Benchmarks y rendimiento

El autor proporciona mediciones propias en una A40, no resultados de benchmarks estándar (MMLU, HumanEval, etc.). Los datos son los siguientes:

| Metrica | Qwen3-Coder-30B | Kimi-Linear-48B |
|---|---|---|
| Edicion de codigo, mono-flujo | 575 tok/s | 100 tok/s |
| Agregado, 16 flujos | 782 tok/s | 616 tok/s |
| Agregado, 32 flujos | 1 166 tok/s | 772 tok/s |
| Prefill en frio | 4 485 tok/s | 7 647 tok/s |
| Prefill en caliente | 70 568 tok/s | 36 257 tok/s |
| Contexto maximo | 262 144 | 1 048 576 |
| Coste por 1M tokens (mono-flujo) | 0,21 $ | 1,22 $ |
| Tool calling | Si (`qwen3_coder`) | Si (`kimi_k2`) |

No se han publicado resultados de benchmarks estándar en la informacion disponible.

## Requisitos de hardware

- **GPU**: NVIDIA A40 (24 GB VRAM) es la plataforma de referencia, alojada en RunPod a 0,44 $/h.
- **VRAM estimada**: los modelos Qwen3-Coder-30B y Kimi-Linear-48B caben en 24 GB con cuantización BF16 o inferior; el archivo GGUF de Kimi-K3 incluido (2,2B parámetros) también cabe, pero su rendimiento es insuficiente.
- **Opciones de despliegue**: vLLM (recomendado para Qwen3-Coder y Kimi-Linear) y llama.cpp (para el GGUF de Kimi-K3).
- **Latencia y throughput**: los valores medidos se indican en la tabla de benchmarks; el modo mono-flujo con especulación alcanza 575 tok/s, mientras que el modo agregado llega a 1 166 tok/s.
- **No cabe en GPUs de consumo**: una A40 es una GPU de centro de datos; no se menciona compatibilidad con RTX 4090 u otras tarjetas consumer.

## Comparativa con modelos similares

Este repositorio no es un modelo, sino una solución de despliegue. Se puede comparar con alternativas para servir APIs compatibles con Anthropic:

| Solucion | Modelos soportados | Coste por hora | Rendimiento | Licencia |
|---|---|---|---|---|
| `patdev/k3-a40-bootstrap` | Qwen3-Coder-30B, Kimi-Linear-48B | 0,44 $/h (A40) | 575 tok/s mono-flujo | other |
| API oficial de Anthropic (Claude) | Claude Fable 5, etc. | Variable | No comparable | Propietaria |
| API oficial de Moonshot (Kimi) | Kimi K3, Kimi-Linear | ~16 $/1M | 29,2 tok/s (medido) | Propietaria |
| LiteLLM + vLLM | Cualquier modelo OpenAI-compatible | Depende del hardware | Depende del modelo | MIT |

La principal ventaja de este repositorio es su bajo coste por token (0,21 $/1M) y su compatibilidad directa con Claude Code, aunque la licencia "other" y la falta de soporte oficial limitan su uso en producción.

## Limitaciones y advertencias

- **Licencia "other" no especificada**: no se detallan las condiciones de uso, lo que impide garantizar su uso comercial o la redistribución de los artefactos incluidos.
- **La pista Kimi-K3 fue abandonada**: el autor documenta que el despliegue de Kimi-K3 en A40 es inviable (7,3 tok/s, 85 $/1M), por lo que los artefactos GGUF incluidos no son recomendables para uso real.
- **La especulación n-gram corrompe código en Kimi-Linear**: produce errores reproductibles como `fibonacci(n-1(n-1))`, por lo que está desactivada por defecto en ese modelo.
- **El rendimiento depende del patrón de uso**: la especulación solo es beneficiosa en mono-flujo; en modo agregado degrada el throughput.
- **Requiere configuración manual**: el despliegue exige conocimientos de vLLM, RunPod y proxies HTTP; no es un producto llave en mano.
- **Sin garantías de seguridad**: al ser un repositorio personal sin mantenimiento activo (0 descargas, 0 likes), no hay garantía de corrección de vulnerabilidades.
- **Idiomas no especificados**: no se indica qué idiomas soportan los modelos subyacentes, aunque Qwen3-Coder y Kimi-Linear son principalmente multilingües.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/patdev/k3-a40-bootstrap
- Perfil del autor: https://huggingface.co/patdev
- Kimi K3 (modelo de Moonshot AI): https://github.com/MoonshotAI/Kimi-K3
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/models
- Artículo sobre Kimi K3: https://blog.stackademic.com/kimi-k3-the-2-8t-open-source-ai-that-just-beat-claude-3211f38a7481
