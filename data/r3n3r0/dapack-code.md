# R3n3r0/dapack-code

## Resumen

dapack-code es un pack de pesos en formato GGUF que comprime el modelo Qwen3.5-35B-A3B de Qwen (arquitectura Mixture of Experts con 35B parámetros totales y 3B activos) para tareas de programación y desarrollo de software. El pack reduce el tamaño de 21,2 GB a 10,7 GB mediante una técnica llamada "precisión graduada" (graded precision): en lugar de eliminar expertos, mantiene todos los 256 expertos del modelo, pero asigna cuantizaciones distintas según la relevancia de cada experto para el dominio de código. Los 143 expertos que el modelo enruta con mayor frecuencia para programación se conservan en q2_K, mientras que los 113 restantes se reducen a IQ2_XXS (2,06 bpw) con una matriz de importancia.

El modelo está desarrollado por R3n3r0, autor del proyecto dapack, que proporciona un runtime especializado (fork de llama.cpp) necesario para cargar estos pesos graduados. El pack incluye un manifiesto con mediciones conductuales que el router de dapack utiliza para decidir si una solicitud puede ser atendida por este pack o debe derivarse a otro. La licencia es MIT, lo que permite uso comercial sin restricciones, aunque el runtime requiere compilación o binarios precompilados disponibles en el repositorio de GitHub.

La relevancia de este modelo radica en su enfoque de compresión selectiva por dominio: en lugar de un único modelo cuantizado uniformemente, dapack-code sacrifica capacidades fuera de dominio (como traducción en→it, que cae al 40%) para mantener intactas las capacidades de programación, tool calling y seguimiento de instrucciones. Es una alternativa a la poda de expertos, con la ventaja de que la degradación es gradual y no produce fallos catastróficos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5-35B-A3B |
| Parámetros totales | 35B (no disponible desglose exacto) |
| Parámetros activos | 3B (A3B, 8 expertos activos por token) |
| Longitud de contexto | No disponible (se ha verificado needle a 3k tokens) |
| Tipos de cuantización | q2_K (143 expertos) e IQ2_XXS a 2,06 bpw (113 expertos) con matriz de importancia |
| Idiomas soportados | Inglés (en), italiano (it) |
| Licencia | MIT |
| Formato de pesos | GGUF con tensores duales por capa (`ffn_*_exps_cold` + `dapack.hot_experts_per_layer`) — requiere runtime dapack |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-35B-A3B, un transformer MoE con 35B parámetros totales y 3B activos por token, que activa exactamente 8 expertos por token. dapack-code no modifica la arquitectura ni los pesos originales; aplica una compresión por precisión graduada: cada capa contiene dos bancos de tensores de expertos (`ffn_*_exps_cold` y `dapack.hot_experts_per_layer`), donde los expertos "calientes" (los 143 que el router del dominio de código selecciona con mayor frecuencia) se mantienen en q2_K y los "fríos" (113 restantes) se reducen a IQ2_XXS con una matriz de importancia. El coste computacional es idéntico al modelo original: el presupuesto top-k se reparte entre ambos bancos, de modo que se ejecutan exactamente 8 expertos por token.

No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de calibración de la matriz de importancia. El autor reporta mediciones conductuales propias (no benchmarks estándar) que indican que el pack conserva el 100% de la capacidad de generación de código, tool calling (8/8 pruebas), italiano, seguimiento de instrucciones, contexto largo (needle a 3k tokens) y salida JSON estructurada, mientras que la traducción en→it cae al 40%. En comparación con la poda de expertos, la precisión graduada mantiene un 82% de rendimiento en Qwen3.5-35B frente al 79% de la eliminación, y en Qwen3-30B mejora de 40% a 93,3% (según mediciones del autor).

## Capacidades

- Generación de código: conserva el 100% de la capacidad del modelo base para programación, según mediciones del autor.
- Tool calling / function calling: 8/8 pruebas superadas, igual que el modelo completo.
- Seguimiento de instrucciones: 100% (el modelo base solo alcanza 80% en la misma prueba).
- Contexto largo: verificado con needle a 3k tokens, 100% de recuperación.
- Salida estructurada JSON: 100%.
- Italiano: 100% en pruebas conductuales de comprensión y generación.
- Traducción en→it: 40% (degradada intencionadamente por el presupuesto de precisión dedicado a código).
- Capacidades de razonamiento general y matemáticas: no se reportan mediciones específicas; el autor indica que la degradación fuera de dominio es gradual, no catastrófica.

## Casos de uso

- Asistente de programación integrado en IDE: el modelo puede generar código, refactorizar funciones y explicar fragmentos, manteniendo la calidad del modelo base gracias a la cuantización q2_K de los expertos de código. Se puede servir mediante el runtime dapack con API compatible con OpenAI.
- Automatización de code review: con soporte de tool calling intacto, el modelo puede invocar herramientas de análisis estático, consultar repositorios y generar comentarios de revisión en flujos de CI/CD.
- Generación de código en pipelines de CI/CD: el pack es adecuado para entornos donde el espacio en disco es limitado (10,7 GB frente a 21,2 GB) y se requiere una inferencia rápida con 3B parámetros activos, por ejemplo en servidores de integración continua.
- Chat técnico en italiano: al conservar el 100% de capacidad en italiano, puede usarse para soporte técnico o documentación en ese idioma, siempre que no se requiera traducción desde inglés.
- Prototipado rápido de agentes con tool calling: el modelo mantiene 8/8 en tool calling, por lo que puede servir como motor de agentes que consultan APIs, ejecutan comandos o interactúan con bases de datos.
- Sistema de autocompletado de código en entornos con VRAM limitada: con 10,7 GB de pesos, cabe en GPUs de consumo con 12-16 GB, permitiendo inferencia local en estaciones de trabajo sin GPUs profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones conductuales propias, recogidas en el manifiesto del pack, que se resumen a continuación:

| Capacidad | Este pack | Modelo completo (21,2 GB) |
|---|---:|---:|
| Generación de código | 100% | 100% |
| Tool calling (8 pruebas) | 8/8 | 8/8 |
| Italiano (sonda conductual) | 100% | 100% |
| Seguimiento de instrucciones | 100% | 80% |
| Contexto largo (needle @ 3k tokens) | 100% | 100% |
| Salida estructurada (JSON) | 100% | 100% |
| Traducción en→it | 40% | 100% |

Además, el autor compara la precisión graduada frente a la poda de expertos en dos arquitecturas:

| Mecanismo | Qwen3.5-35B | Qwen3-30B | Herramientas |
|---|---:|---:|---:|
| Expertos sobrantes eliminados | 79,0% | 40,0% | 7/8 |
| Expertos sobrantes a 2 bits | 82,0% | 93,3% | 8/8 |

Estas cifras son mediciones del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- Tamaño del archivo: 10,7 GB (GGUF), por lo que la VRAM necesaria para inferencia será aproximadamente 11-12 GB (pesos + overhead de contexto y KV cache). Cabe en GPUs de consumo como RTX 3080 12GB, RTX 4070 Ti 12GB, RTX 4080 16GB o RTX 4090 24GB.
- GPU recomendadas: el runtime dapack ofrece binarios precompilados para Linux x86_64 con ROCm (AMD, gfx1151) y soporte para otras GPUs mediante compilación desde el repositorio. No se menciona soporte CUDA en los binarios precompilados, pero el fork de llama.cpp debería poder compilarse para NVIDIA.
- Requiere el runtime dapack (fork de llama.cpp) — no es compatible con llama.cpp estándar, Ollama o LM Studio sin modificación.
- Opciones de despliegue: `dapack serve` expone una interfaz web chat y una API compatible con OpenAI. También se puede usar en modo librería.
- Latencia y throughput: no se proporcionan datos. Al tratarse de un MoE con 3B parámetros activos, se espera una velocidad de generación similar al modelo base, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Tamaño | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (completo) | 35B | 3B | 21,2 GB | No disponible | MIT (presumible) | Safetensors |
| dapack-code (este modelo) | 35B | 3B | 10,7 GB | No disponible | MIT | GGUF (dapack) |
| Qwen3-30B-A3B (mencionado en comparativa) | 30B | 3B | No disponible | No disponible | No disponible | — |

La comparativa se limita a los datos disponibles: dapack-code ofrece una reducción de tamaño del 50% respecto al modelo base completo, con degradación solo en traducción en→it (40%). Frente a la poda de expertos, la precisión graduada mantiene mejor rendimiento en razonamiento y tool calling, según las mediciones del autor. No se dispone de comparaciones con otros modelos de código (p. ej., CodeLlama, DeepSeek-Coder) en la información proporcionada.

## Limitaciones y advertencias

- Requiere el runtime dapack específico: los pesos GGUF con tensores duales no pueden cargarse con llama.cpp estándar, Ollama, LM Studio ni otros runners habituales. Es imprescindible compilar el fork o usar los binarios precompilados del repositorio.
- Degradación intencionada fuera de dominio: la traducción en→it cae al 40%. El router de dapack debería evitar enviar solicitudes de traducción a este pack, pero si se usa sin router, el resultado será deficiente.
- Los expertos a IQ2_XXS (2,06 bpw) pueden producir errores en tareas no relacionadas con código, aunque el autor afirma que la degradación es gradual y no catastrófica.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.). Las mediciones de capacidades son propias del autor y no verificadas de forma independiente.
- El modelo base Qwen3.5-35B-A3B es un modelo muy reciente (fecha de creación del pack: agosto de 2026), por lo que la documentación y el soporte comunitario pueden ser limitados.
- No se especifica la longitud de contexto máxima; solo se ha verificado recuperación con needle a 3k tokens.
- No se reportan sesgos específicos, pero al ser un modelo derivado de Qwen, puede heredar sesgos del dataset original. No hay información sobre evaluación de sesgos en este pack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/R3n3r0/dapack-code
- Repositorio dapack (runtime, documentación y herramientas): https://github.com/R3n3r0/dapack
- Búsqueda de modelos con tag "graded-precision": https://huggingface.co/models?other=graded-precision
