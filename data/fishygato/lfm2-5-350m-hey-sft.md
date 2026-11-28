# fishygato/LFM2.5-350M-hey-sft

## Resumen

`fishygato/LFM2.5-350M-hey-sft` es un ajuste fino (SFT) del modelo base `LiquidAI/LFM2.5-350M`, publicado por el usuario fishygato. El modelo está especializado en la generación de comandos de shell y en su explicación token a token, pensado para integrarse en `hey`, una herramienta de línea de comandos local que traduce lenguaje natural a comandos de bash y los explica paso a paso. Se distribuye exclusivamente en formato GGUF cuantizado con imatrix, con la restricción de diseño de que todos los ficheros pesen estrictamente menos de 300 MB, para que la herramienta funcione en equipos modestos sin GPU dedicada.

El modelo hereda la arquitectura y el tamaño del modelo base de Liquid AI: 354.483.968 parámetros totales (aproximadamente 350 M), lo que lo sitúa en la gama ultraligera. El ajuste se realizó sobre conjuntos de datos curados de 2.000 y 13.000 ejemplos, con tres versiones publicadas (v1, v2 y v3) y tres cuantizaciones por versión (Q4_K_M, Q5_K_M y Q6_K). La versión v3, entrenada sobre el conjunto de 13.000 ejemplos, reporta 58 aciertos sobre 106 en el benchmark propio del autor.

Su relevancia es acotada pero clara: demuestra que un modelo de 350 M parámetros, cuantizado por debajo de 300 MB, puede especializarse en una tarea concreta de generación de comandos CLI con utilidad práctica en local. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, no dispone de pipeline declarado y su model card no documenta idiomas soportados ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (GGUF con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (llama.cpp b12721+) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del base `LiquidAI/LFM2.5-350M`. La model card no detalla la arquitectura interna del modelo base (transformer, híbrido u otra), por lo que este dato no está disponible en la información proporcionada. El ajuste se realizó en tres iteraciones documentadas:

- **v1**: 3 épocas de SFT sobre un conjunto curado base de 2.000 ejemplos (JSON de Stage 1 heredado).
- **v2**: 1 época de SFT completo sobre un conjunto curado ampliado de 2.000 ejemplos (26/30 en el núcleo del benchmark).
- **v3**: 1 época de SFT completo sobre un conjunto de 13.000 ejemplos (58/106 en el benchmark del autor).

Las cuantizaciones emplean imatrix, una técnica de cuantización con matriz de importancia que mejora la fidelidad de los pesos cuantizados respecto a la cuantización estándar. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. El entrenamiento se orientó específicamente a la tarea de generación de comandos de shell y su explicación token a token, con un formato de salida JSON de Stage 1.

## Capacidades

- Generación de comandos de shell (bash) a partir de instrucciones en lenguaje natural.
- Explicación token a token de los comandos generados.
- Conversación multi-turno en el contexto de la herramienta `hey` (tag `conversational`).
- Especialización en dominio CLI: shell, bash y utilidades de línea de comandos.
- Compatibilidad con `llama.cpp` (b12721+) y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Asistente de terminal local**: el modelo traduce una petición en lenguaje natural ("lista los ficheros modificados en las últimas 24 horas") a un comando de bash, integrándose en la CLI `hey` sin conexión a servicios externos.
- **Explicación educativa de comandos**: dado un comando de shell, el modelo lo desglosa token a token, útil para formación de principiantes en administración de sistemas.
- **Automatización en entornos con recursos limitados**: al pesar menos de 300 MB en Q4_K_M (218,7 MiB), puede desplegarse en contenedores mínimos, Raspberry Pi o portátiles sin GPU dedicada.
- **Generación de comandos en pipelines de CI/CD**: integrable vía `llama.cpp` para generar o validar comandos de shell en scripts de integración, con la cautela de revisar la salida antes de ejecutarla.
- **Herramientas de desarrollo para terminal**: base para plugins de editores o shells interactivas que sugieran comandos contextuales sin enviar datos a la nube.
- **Distribución con espejos de Hugging Face**: la CLI soporta `--hf-endpoint` para descargar los pesos desde espejos, útil en entornos corporativos con restricciones de red.

## Benchmarks y rendimiento

La model card reporta únicamente el resultado de un benchmark propio del autor sobre el conjunto de evaluación interno:

| Version | Conjunto de entrenamiento | Resultado benchmark propio |
|---|---|---|
| v1 | 2k ejemplos, 3 épocas | no reportado |
| v2 | 2k ejemplos ampliado, 1 época | 26/30 en el núcleo |
| v3 | 13k ejemplos, 1 época | 58/106 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en todas las cuantizaciones; los pesos ocupan entre 218,7 MiB (Q4_K_M) y 279,8 MiB (Q6_K), más el overhead del contexto en `llama.cpp`.
- **GPU recomendadas**: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede alojarlo holgadamente, pero no es necesario.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en dispositivos de placa única tipo Raspberry Pi.
- **Opciones de despliegue**: `llama.cpp` (versión b12721 o superior) es el runtime documentado; también es compatible con endpoints compatibles con la API de llama.cpp. No se documenta soporte explícito para vLLM, TGI u Ollama.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| fishygato/LFM2.5-350M-hey-sft | 354 M | no disponible | GGUF | LFM Open License v1.0 | Comandos shell |
| LiquidAI/LFM2.5-350M (base) | 354 M | no disponible | safetensors, GGUF | LFM Open License v1.0 | Generalista |
| Qwen2.5-Coder-0.5B | ~500 M | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Código general |
| SmolLM2-360M | 360 M | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Generalista |

La comparación con alternativas de la misma categoría (modelos ultraligeros de 300-500 M) es aproximada: los datos de contexto y rendimiento de los modelos alternativos no se han verificado en la información proporcionada. La ventaja diferencial de este modelo es su especialización en comandos shell y su tamaño inferior a 300 MB, mientras que su desventaja es la ausencia de benchmarks estándar y su licencia restrictiva frente a alternativas Apache 2.0.

## Limitaciones y advertencias

- **Riesgo de comandos peligrosos**: al generar comandos de shell, una salida incorrecta puede provocar borrados, sobreescrituras o cambios de permisos. Es imprescindible revisar cada comando antes de ejecutarlo.
- **Benchmark propio y limitado**: el único dato de rendimiento es 58/106 en un benchmark interno del autor, sin comparación con líneas base públicas.
- **Sin datos de sesgo**: no se documentan evaluaciones de sesgo ni de robustez.
- **Riesgo de alucinación**: como todo modelo de 350 M, puede inventar flags, opciones o sintaxis inexistentes en bash.
- **Idiomas no documentados**: la model card no especifica qué idiomas soporta; se desconoce su comportamiento fuera del inglés técnico.
- **Contexto no documentado**: se desconoce la longitud de contexto efectiva del modelo base y si el ajuste la preserva.
- **Licencia restrictiva**: LFM Open License v1.0 no es una licencia de código abierto permisiva; deben revisarse sus condiciones para uso comercial y redistribución, e incluir el fichero `LICENSE` de Liquid AI.
- **Madurez**: cero descargas y cero likes en el momento de la ficha; sin pipeline declarado y con fecha de creación muy reciente.
- **Runtime específico**: requiere `llama.cpp` b12721 o superior; no se garantiza compatibilidad con otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishygato/LFM2.5-350M-hey-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: fichero `LICENSE` en el repositorio del modelo base
- Checksums: fichero `SHA256SUMS.txt` en el repositorio
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
