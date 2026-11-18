# AtomicChat/Ling-3.0-flash-GGUF

## Resumen

Ling 3.0 flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por inclusionAI, con 124.400 millones de parámetros totales y 5.100 millones de parámetros activos por token. Emplea una arquitectura híbrida de atención lineal: 35 bloques KDA (Kimi Delta Attention) intercalados en proporción 5:1 con 7 bloques de atención MLA con compuerta, sobre una capa MoE de 512 expertos. El repositorio analizado, AtomicChat/Ling-3.0-flash-GGUF, contiene cuantizaciones GGUF optimizadas para llama.cpp, no los pesos originales.

La relevancia de esta ficha reside en la estrategia de cuantización: el autor (AtomicChat) aplica un esquema propio denominado Atomic Dynamic (AD) que asigna bits de forma selectiva por rol de tensor, por proyección y por profundidad, en lugar de usar las reglas por defecto de `llama-quantize`. Según las mediciones publicadas, este esquema reduce la divergencia KL media entre un 31 % y un 41 % respecto a los presets estándar de llama.cpp con tamaños comparables.

El modelo base está pensado para generación de texto conversacional con modo de razonamiento (thinking) y soporte de tool calling, ambos integrados en la plantilla de chat incluida en los ficheros GGUF. La licencia MIT del repositorio de cuantización facilita su uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal (35 bloques KDA + 7 bloques gated MLA, intercalados 5:1) |
| Parámetros totales | 124.414.211.552 (124,4 B) |
| Parámetros activos | 5,1 B |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 32768`) |
| Tipos de cuantización | GGUF: AD-Q5_K_M, AD-Q4_K_S, AD-IQ4_XXS, AD-IQ3_M, AD-IQ2_M, AD-IQ1_S (más controles `*_STOCK` y `*_FLAT`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con plantilla de chat Jinja embebida |

## Arquitectura y entrenamiento

El modelo base es un MoE de 124,4 B de parámetros con 5,1 B activos, construido sobre una columna vertebral de atención híbrida: 35 bloques de KDA (Kimi Delta Attention, atención lineal) intercalados con 7 bloques de MLA con compuerta en proporción 5:1. La capa MoE consta de 512 expertos. Los expertos enrutados representan el 97,1 % del total de pesos, lo que concentra el esfuerzo de compresión en esa parte de la red. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El valor técnico diferencial de este repositorio es la cuantización AD (Atomic Dynamic), que distribuye los bits siguiendo tres ejes: por rol de tensor (el router `ffn_gate_inp` y el sesgo de expertos se mantienen en F32 para no alterar la selección de expertos; atención, compuertas KDA y experto compartido en Q8_0; `output` en F16), por proyección (dentro de los expertos, `down_proj` recibe más bits que `gate/up` por ser la mitad más sensible del SwiGLU) y por profundidad (los bloques MoE de los extremos —2, 3, 39, 40, 41— reciben más bits que los centrales). Los tensores no comprimidos suman unos 4 GB. Las mediciones de divergencia KL frente a BF16 se publican junto a los ficheros, con los controles correspondientes, para permitir su verificación.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja embebida en el GGUF.
- Modo de razonamiento (thinking mode) integrado en la plantilla de chat.
- Tool calling / function calling soportado por la plantilla incluida.
- Razonamiento multi-paso orientado a flujos de agente (el autor comercializa una app de agentes compatible).
- Capacidades multilingües: no documentadas en la información disponible.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local con contexto largo: con `-c 32768` y una cuantización AD-Q5_K_M (89,4 GB) puede mantener diálogos multi-turno extensos en una estación de trabajo con 128 GB de memoria unificada o dos GPU de 24 GB, sin depender de la nube.
- Agente con herramientas en local: la plantilla incluye tool calling, lo que permite construir agentes que invoquen APIs o scripts mediante function calling ejecutados en el mismo equipo, útil en entornos con requisitos de privacidad.
- Razonamiento con traza explícita: el thinking mode permite obtener cadenas de razonamiento intermedias para tareas de análisis, depuración de lógica o generación de explicaciones auditables.
- Despliegue en estaciones Mac Studio: la cuantización AD-Q5_K_M encaja en 128 GB de memoria unificada, lo que habilita un modelo de 124 B en hardware de sobremesa sin GPU dedicada.
- Servicio en GPU de 80 GB: con AD-IQ4_XXS (69,3 GB) el modelo cabe en una H100 o A100 de 80 GB, dejando margen para pesos y contexto compartiendo memoria, y permite atender peticiones concurrentes con llama.cpp.
- Evaluación de técnicas de cuantización: los ficheros de control (`*_STOCK`, `*_FLAT`) y las métricas KL públicas permiten reproducir y comparar estrategias de asignación de bits en un MoE grande.
- Prototipado con presupuesto de memoria reducido: AD-IQ2_M (49,1 GB) permite probar el modelo en equipos de 48 GB asumiendo una pérdida de calidad apreciable, útil para validar pipelines antes de escalar hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de fidelidad de cuantización (divergencia KL media frente a BF16):

| Cuantización | Tamaño (GB) | KL media | Control | Tamaño control (GB) | KL control | Mejora |
|---|---:|---:|---|---:|---:|---|
| AD-Q5_K_M | 89,4 | 0,02420 | Q5_K_M_STOCK | 88,3 | 0,03509 | 31 % menor |
| AD-Q4_K_S | 74,2 | 0,03178 | Q4_K_M_STOCK | 75,3 | 0,05121 | 38 % menor y más pequeño |
| AD-IQ4_XXS | 69,3 | 0,03293 | IQ4_XS_STOCK | 66,4 | 0,05605 | 41 % menor |
| AD-IQ3_M | 62,2 | 0,04810 | no disponible | — | — | — |
| AD-IQ2_M | 49,1 | 0,08820 | no disponible | — | — | — |
| AD-IQ1_S | 32,4 | 0,24520 | no disponible | — | — | — |

## Requisitos de hardware

- VRAM/memoria estimada: 89,4 GB (AD-Q5_K_M), 74,2 GB (AD-Q4_K_S), 69,3 GB (AD-IQ4_XXS), 62,2 GB (AD-IQ3_M), 49,1 GB (AD-IQ2_M), 32,4 GB (AD-IQ1_S). Pesos y contexto comparten memoria, por lo que hay que dejar margen adicional.
- GPU recomendadas: H100 o A100 de 80 GB para AD-IQ4_XXS; dos RTX 4090 (48 GB en total no bastan para Q5, sí para IQ2_M) o Mac Studio de 128 GB para AD-Q5_K_M; DGX Spark (arm64) con soporte CUDA.
- GPU de consumo: solo las cuantizaciones de 32-49 GB caben en configuraciones de 1-2 GPU de consumo, con degradación de calidad notable en IQ2_M e IQ1_S.
- Opciones de despliegue: exclusivamente el fork `atomic-llama-cpp-turboquant` (release `b10269-1.5.1` o superior), con binarios precompilados para Linux x64 (CUDA 13.3/12.4, ROCm, Vulkan, CPU), Linux arm64 (DGX Spark), macOS Apple Silicon y Windows x64. No hay binario SYCL para GPU Intel; requiere compilación desde fuentes. Los ficheros no funcionan con llama.cpp upstream sin los bugfixes del fork.
- Latencia y throughput: no disponibles. El modelo activa 5,1 B de parámetros por token, lo que reduce el coste computacional frente a un denso de 124 B, pero no se publican cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas. La comparación se limita a características estructurales:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Ling 3.0 flash (este repo) | 124,4 B | 5,1 B | no disponible | MIT | GGUF (fork TurboQuant) |
| Ling 3.0 flash (base) | 124,4 B | 5,1 B | no disponible | no disponible | safetensors (inclusionAI) |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de un fork: los GGUF requieren el build `atomic-llama-cpp-turboquant`; llama.cpp upstream incluye `bailingmoe3` pero sin los bugfixes del autor, por lo que la ejecución con la versión estándar puede fallar o dar resultados incorrectos.
- Calidad degradada en cuantizaciones bajas: el propio autor advierte que a partir de AD-IQ2_M (49,1 GB) la calidad empieza a resentirse y que AD-IQ1_S (32,4 GB) es "último recurso" con daño real esperado (KL 0,2452).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la compresión en cuantizaciones agresivas.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Sesgos: no documentados.
- Longitud de contexto no especificada: los ejemplos usan 32 768 tokens, pero se desconoce el máximo nativo del modelo base.
- Licencia: el repositorio de cuantización declara MIT, pero conviene verificar la licencia del modelo base `inclusionAI/Ling-3.0-flash` antes de un uso comercial, ya que la información disponible no la detalla.
- Sin soporte SYCL: las GPU Intel no tienen binario precompilado.
- Ausencia de benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares que permitan validar la calidad más allá de la fidelidad a BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Ling-3.0-flash-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Ling-3.0-flash-GGUF-metrics
- Fork de llama.cpp con TurboQuant: https://github.com/AtomicBot-ai/atomic-llama-cpp-turboquant
- Release de binarios `b10269-1.5.1`: https://github.com/AtomicBot-ai/atomic-llama-cpp-turboquant/releases/b10269-1.5.1
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
