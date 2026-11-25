# netprojects/Raon-1-mini-MLX-8bit

## Resumen

Raon-1-mini-MLX-8bit es una compilación cuantizada a 8 bits del modelo Raon-1-mini de KRAFTON AI, convertida por NetProjects para su ejecución en Apple Silicon mediante MLX. Raon-1-mini es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) entrenado desde cero por KRAFTON AI, con 28.800 millones de parámetros totales y 4.300 millones activos por token (6 de 128 expertos enrutados más 1 compartido). Emplea una arquitectura híbrida de 18 capas de Raon Delta Attention y 7 capas de MLA con compuerta, y ofrece una ventana de contexto de 262.144 tokens.

El modelo destaca en conversación en coreano y tareas agénticas, e incorpora un modo de razonamiento integrado con seis niveles de esfuerzo configurables por petición (`none`, `low`, `medium`, `high`, `xhigh`, `max`). Está entrenado en coreano, inglés, japonés, chino, español, francés y tailandés, y soporta tool calling con configuraciones para Hermes Agent, Pi y OpenCode.

Esta compilación concreta mantiene los pesos de los expertos enrutados en formato MXFP8 idéntico al release original de KRAFTON (que representa aproximadamente el 89% de los pesos), mientras que el resto de capas lineales usan cuantización afín de 8 bits con tamaño de grupo 64. El resultado es un paquete de 30,1 GB que cabe en equipos Apple Silicon de gama alta y permite ejecutar localmente un modelo MoE de casi 29.000 millones de parámetros con una fidelidad del 97,4% en top-1 respecto a los pesos bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 18 capas Raon Delta Attention (RDA) + 7 capas gated MLA |
| Parametros totales | 28.800 millones (10.333.536.482 en safetensors del repo) |
| Parametros activos | 4.300 millones por token (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits (afín, grupo 64) para capas lineales; MXFP8 nativo para expertos enrutados; bf16 para router, `kv_b_proj` de MLA y proyecciones de compuerta RDA |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con código de modelo propio (`raon_mlx_model.py`) |
| Tamano del repo | 31,1 GB (build de 30,1 GB) |
| Libreria | mlx (mlx 0.32.4, mlx-lm 0.32.2, transformers 5.20.1) |
| Modelo base | KRAFTON/Raon-1-mini (revision `aa14d2989727`, MXFP8) |
| Fidelidad top-1 vs bf16 | 97,4% (311 posiciones teacher-forced, 8 prompts cortos en inglés/coreano) |
| KL top-32 vs bf16 | 0,0023 |

## Arquitectura y entrenamiento

Raon-1-mini es un transformer MoE disperso entrenado desde cero por KRAFTON AI. La arquitectura combina 18 capas de Raon Delta Attention (RDA) con 7 capas de MLA con compuerta (gated MLA), una hibridación poco común que busca equilibrar eficiencia de atención y calidad de representación. El enrutamiento MoE activa 6 de 128 expertos enrutados más un experto compartido por token, lo que da 4.300 millones de parámetros activos sobre un total de 28.800 millones. La ventana de contexto alcanza los 262.144 tokens.

El modelo incorpora un mecanismo de razonamiento con seis niveles de esfuerzo seleccionables por petición, así como una cabeza de salida opcional de dos etapas (el repo incluye `head_stage1_a2g64gm.safetensors`). KRAFTON no detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, aunque sí confirma entrenamiento multilingüe en siete idiomas y ajuste para tareas agénticas y tool calling. El modelo incluye además un modelo borrador de decodificación especulativa (DFlash2, en `dflash2/`), pensado para acelerar la generación.

Esta compilación MLX 8-bit no entrena ni modifica pesos: convierte el release MXFP8 de KRAFTON preservando los expertos enrutados bit a bit en formato mxfp8 nativo de MLX, y aplica cuantización afín de 8 bits (grupo 64) al resto de capas lineales, con la cabeza de salida y el embedding de tokens también a 8 bits. Router, `kv_b_proj` y proyecciones de compuerta RDA permanecen en bf16. El código de modelo, tokenizador, plantilla de chat y modelo borrador se toman sin cambios de KRAFTON/Raon-1-mini-mlx (revision `78b7555b8902`).

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con seis niveles de esfuerzo configurables por petición (`none`, `low`, `medium`, `high`, `xhigh`, `max`).
- Razonamiento matemático y científico de alto nivel (resultados reportados por KRAFTON en AIME 2026, HMMT Feb 2026 y GPQA Diamond).
- Tool calling / function calling, con configuraciones documentadas para Hermes Agent, Pi y OpenCode.
- Tareas agénticas y razonamiento multi-paso, incluyendo búsqueda (BrowseComp Plus).
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés.
- Modo thinking activable mediante la plantilla de chat (`enable_thinking=True`).
- Cabeza de salida opcional de dos etapas.
- Decodificación especulativa mediante el modelo borrador DFlash2 incluido (aunque en esta compilación la generación plana es más rápida; ver más abajo).
- Servidor compatible con OpenAI (`raon_serve.py`) que acepta el parámetro `reasoning_effort`.

## Casos de uso

- **Atención al cliente automatizada multilingüe:** el modelo puede gestionar conversaciones multi-turno en siete idiomas con hasta 262.144 tokens de contexto, lo que permite mantener historiales largos y documentación de referencia en la misma ventana sin truncar.
- **Asistentes de razonamiento con coste controlado:** los seis niveles de esfuerzo permiten usar `none` para chat simple y `max` para problemas matemáticos o científicos, ajustando el coste computacional por petición en lugar de aplicar un único modo fijo.
- **Agentes autónomos con tool calling:** con soporte para Hermes Agent, Pi y OpenCode, el modelo puede integrarse en pipelines agénticos que requieran invocar herramientas, encadenar pasos y razonar sobre resultados intermedios.
- **Búsqueda aumentada y síntesis de fuentes:** los resultados en BrowseComp Plus (55,9) y MultiChallenge (64,9) lo hacen adecuado para tareas de búsqueda web con múltiples turnos y consolidación de información.
- **Desarrollo local en Apple Silicon:** al ejecutarse con MLX en un MacBook Pro M5 Max (128 GB) a 106 tok/s en generación plana, permite prototipar y desplegar un MoE de 28.800 millones de parámetros en hardware de sobremesa sin GPU dedicada.
- **Procesamiento de documentos largos en coreano e inglés:** la ventana de 262.144 tokens y el entrenamiento específico en coreano lo hacen útil para análisis de contratos, informes o corpus técnicos en esos idiomas.
- **Generación de código asistida:** KRAFTON recomienda `presence_penalty` 0 para código y matemáticas, lo que sugiere un uso previsto en tareas de programación con tool calling integrado en editores o pipelines de CI/CD.

## Benchmarks y rendimiento

Resultados reportados por KRAFTON en el release original (no medidos de forma independiente en esta compilación):

| Benchmark | Resultado |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

Métricas de fidelidad de esta compilación MLX 8-bit frente a los pesos bf16:

| Metrica | Valor |
|---|---|
| Top-1 (311 posiciones teacher-forced, 8 prompts EN/KO) | 97,4% |
| KL top-32 | 0,0023 |
| Decodificacion plana (MacBook Pro M5 Max, 128 GB) | 106 tok/s |
| Decodificacion con DFlash2 | 95 tok/s |

La compilación de 6 bits del mismo autor reporta 97,8% de top-1 y 121 tok/s en decodificación plana, con 24,0 GB de tamaño.

## Requisitos de hardware

- **VRAM/espacio unificado:** el build ocupa 30,1 GB en disco; en Apple Silicon se carga en memoria unificada, por lo que se recomienda un equipo con al menos 64 GB y preferiblemente 128 GB para dejar margen al contexto largo y al modelo borrador.
- **Hardware de referencia:** las velocidades reportadas se midieron en un MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- **GPU dedicadas:** no se han publicado requisitos ni velocidades para GPU NVIDIA o AMD en la información disponible; el formato MLX está orientado a Apple Silicon.
- **Consumer GPU:** no aplica directamente, ya que MLX requiere Apple Silicon; para GPUs de consumo habría que recurrir al release original de KRAFTON u otras compilaciones.
- **Despliegue:** CLI propio (`raon_mlx_model.py generate`), servidor compatible con OpenAI (`raon_serve.py serve`), servidor de mlx-lm (`python -m mlx_lm server`), y API de Python con mlx-lm (`trust_remote_code=True`).
- **Latencia y throughput:** 106 tok/s en generación plana y 95 tok/s con DFlash2 en el hardware de referencia; KRAFTON indica que la generación plana (`--no-dflash`) es la ruta más rápida para esta compilación porque los kernels rápidos de DFlash2 están escritos para NVFP4 y MXFP8, no para las capas afines de este build.
- **Dependencias fijadas:** Python 3.11+, mlx 0.32.4, mlx-lm 0.32.2, transformers 5.20.1.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Raon-1-mini-MLX-8bit (este) | 28,8B / 4,3B | 262.144 | Apache 2.0 | MLX 8-bit, Apple Silicon | 30,1 GB, 106 tok/s plana, top-1 97,4% vs bf16 |
| Raon-1-mini-MLX-6bit (netprojects) | 28,8B / 4,3B | 262.144 | Apache 2.0 | MLX 6-bit, Apple Silicon | 24,0 GB, 121 tok/s plana, top-1 97,8% vs bf16 |
| KRAFTON/Raon-1-mini-mlx (original) | 28,8B / 4,3B | 262.144 | Apache 2.0 | MLX 4-bit NVFP4, Apple Silicon | Recomendado por KRAFTON para aceleraciones DFlash2 |
| KRAFTON/Raon-1-mini (base) | 28,8B / 4,3B | 262.144 | Apache 2.0 | MXFP8 + bf16 | Release de referencia del que derivan las compilaciones |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, otros MoE de tamaño similar); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- **Fidelidad no exacta:** la compilación 8-bit reproduce el 97,4% de las decisiones top-1 de los pesos bf16; en producción pueden aparecer divergencias en generaciones largas o sensibles.
- **DFlash2 no aporta ventaja en este build:** los kernels rápidos de decodificación especulativa están escritos para NVFP4 y MXFP8, por lo que con las capas afines de 8 bits la generación plana es más rápida; se recomienda `--no-dflash`.
- **Exclusivo de Apple Silicon:** al usar MLX, no se puede desplegar en GPUs NVIDIA, AMD ni en servidores x86 convencionales; para esos entornos hay que usar el release original de KRAFTON.
- **Requisito de memoria elevado:** 30,1 GB de pesos más contexto de hasta 262.144 tokens exigen equipos con memoria unificada abundante (64-128 GB).
- **Riesgo de alucinación:** no se han publicado evaluaciones específicas de tasa de alucinación en la información disponible; como todo modelo generativo, es susceptible a fabricar datos, especialmente en modo de razonamiento largo.
- **Sesgos:** no se documentan análisis de sesgo en la información proporcionada; el entrenamiento está sesgado hacia coreano e inglés, con cobertura menor de español, francés y tailandés.
- **Idiomas:** aunque soporta siete idiomas, el rendimiento en español no está cuantificado en los benchmarks publicados.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de KRAFTON incluidos (código, tokenizador, plantilla de chat).
- **Dependencias fijadas:** requiere versiones concretas de mlx, mlx-lm y transformers; otras versiones pueden romper la carga del código remoto (`trust_remote_code=True`).
- **Configuración de muestreo:** KRAFTON recomienda `presence_penalty` 0 para código y matemáticas y 1,5 para el resto, y esfuerzo `none` para chat y tool calls simples; ignorar estas recomendaciones degrada la calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Raon-1-mini-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Compilación MLX original de KRAFTON (4-bit NVFP4): https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Compilación 6-bit del mismo autor: https://huggingface.co/netprojects/Raon-1-mini-MLX-6bit
- NetProjects: https://netprojects.com
