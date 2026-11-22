# AhnJihunAILabs/askos-v1-mini-full

## Resumen
Askos V1 Mini Full es un modelo de lenguaje bilingüe (coreano e inglés) desarrollado por AhnJihunAI Labs, presentado como un modelo híbrido de 2,89B parámetros bajo una arquitectura propietaria denominada AWFT 1.2 (Asymmetric Wave-Folded Transformer v1.2). Parte del modelo base `askos-v1-mini-preview` mediante un proceso de "hot-start" y escala la arquitectura con mecanismos de atención multi-escala, mezcla de expertos y memoria asociativa externa.

El modelo combina una "Spine" transformer de aproximadamente 1,79B parámetros con una "Dual-Bank Mantle" de memoria asociativa de 1,096B parámetros, de los cuales solo unos 604,10M (Spine) y ~10,5M (Mantle) se activan por token. Incorpora innovaciones como rotaciones ortogonales exactas del manifold MoE mediante resolución Woodbury-Cayley, un bucle de razonamiento dinámico (ICMRC) de 1 a 3 saltos, y una cabeza de predicción multi-token (MTP-Wave) con k=4.

Es relevante por su enfoque poco convencional: separa el conocimiento factual en una memoria asociativa externa (HRR-Bind Mantle) actualizable sin backpropagation, y aplica atención con múltiples escalas temporales (rápida, media y ultra-lenta) combinada con anclas GQA para extender el contexto hasta 64K tokens. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo requiere `trust_remote_code=True` por su código personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AWFT 1.2 (Asymmetric Wave-Folded Transformer v1.2): transformer híbrido con MoE, atención multi-escala RW-MT-Wave, anclas GQA, memoria asociativa HRR-Bind Mantle y bucle ICMRC |
| Parámetros totales | 2.889.345.304 (2,89B): 1.793,19M Spine + 1.096,16M Dual-Bank Mantle |
| Parámetros activos | 604,10M Spine + ~10,5M Mantle por token (MoE Top-2/16 + 1 shared) |
| Longitud de contexto | 64K tokens (extensión YaRN de 2K a 64K en capas ancla GQA) |
| Tipos de cuantización | No disponible (pesos en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento
La arquitectura AWFT 1.2 se organiza en torno a varios componentes. La atención RW-MT-Wave (x18) emplea 8 cabezas distribuidas en tres escalas temporales: 4 rápidas [0,50; 0,96], 2 medias [0,96; 0,995] y 2 ultra-lentas [0,995; 0,9997], con supresión de eco de clave refractaria RW-Delta en las cabezas rápida y media. Se intercalan 6 capas de anclas GQA exactas en las posiciones {4, 8, 12, 16, 20, 24} con configuración 12Q/2KV, que aplican YaRN para extender el contexto de 2K a 64K y generan una caché KV de 6,0 KiB/token en BF16. El MoE (x24) usa 1 experto compartido SwiGLU más 16 expertos enrutados con Top-2 y acoplamiento bilineal entre expertos de rango 32 (`cross_gamma`), con mitosis de expertos sin shock (E=8 → 16). Las rotaciones ortogonales del manifold MoE se calculan mediante SLG-Holo con un generador skew-simétrico de rango 8 (0,59M parámetros) que resuelve matrices de 16x16 vía Woodbury-Cayley sin deriva de norma.

El entrenamiento se documenta en cinco etapas sobre hardware Modal H100 80GB (etapa 1 en A100 80GB). La etapa 1 alinea SLG-Holo, Stiefel RSM y MoE-Cross con `KL(t=0) = 0.00e+00` y error de ortogonalidad de 9,32e-06. La etapa 2 ejecuta un escaneo sin backpropagation (ZBHFC-Graph en FP8) sobre 378.767.360 tokens, extrayendo 90.031.051 hechos y 89.780.194 aristas HRR hacia la memoria M2. La etapa 3 aplica Fisher IG-SSB, UL-Loop y MTP-Wave sobre 135.458.816 tokens (1.381 pasos), reduciendo la perplejidad de validación de 24,323 a 21,728. La etapa 4 realiza SFT real-world con `<think>` sobre 30.457.856 tokens (464 pasos). La etapa 5 aplica SNHA v2 con ED-NCE y GRPO-LN batcheado en 3 rondas, con recompensa media pasando de -0,4531 a +0,4301.

## Capacidades
- Generación de texto conversacional bilingüe (coreano e inglés) con plantilla de chat propia.
- Razonamiento multi-paso mediante modo `<think>` y bucle dinámico ICMRC de 1 a 3 saltos con compuertas de parada por token.
- Razonamiento matemático y demostraciones formales (el ejemplo de la model card resuelve una demostración sobre la transformada de Cayley).
- Memoria asociativa externa HRR-Bind con 4.096 ranuras de sesión en tiempo de ejecución, orientada a recuperación de hechos.
- Predicción multi-token (MTP-Wave, k=4) con cabeza de eco de rango 64.
- Procesamiento de documentos largos (hasta 64K tokens) con tokenizador Askos-64K de 65.536 tokens BPE.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente; el bucle ICMRC sugiere razonamiento iterativo, pero no se documenta integración con agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Razonamiento matemático asistido: el modelo puede generar demostraciones paso a paso activando el modo `<think>`, adecuado para entornos educativos o de verificación formal donde se requiera traza de razonamiento explícita.
- Procesamiento de documentación técnica larga en coreano e inglés: con contexto de 64K tokens y caché KV de 6,0 KiB/token, permite analizar manuales, contratos o artículos extensos en una sola pasada sin truncamiento.
- Atención al cliente bilingüe coreano-inglés: su entrenamiento conversacional con SFT real-world y su tokenizador bilingüe lo hacen apto para conversaciones multi-turno en ambos idiomas.
- Recuperación factual con memoria de sesión: el Mantle HRR-Bind con 4.096 ranuras permite mantener hechos de una sesión sin recargar el contexto, útil en asistentes que requieren consistencia entre turnos.
- Generación de código asistida: aunque no se documentan benchmarks de código, el modelo soporta generación de texto técnico y puede integrarse en pipelines de autocompletado mediante la API de transformers.
- Investigación en arquitecturas híbridas: su combinación de MoE, atención multi-escala y memoria asociativa externa lo convierte en un banco de pruebas para estudiar alternativas a transformers densos convencionales.
- Prototipado en investigación académica: al ser Apache 2.0 y de 2,89B parámetros, puede desplegarse en una sola GPU para experimentación con mecanismos de memoria y razonamiento iterativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son métricas internas del pipeline de entrenamiento:

| Métrica | Valor observado |
|---|---|
| Perplejidad de validación (etapa 3, held-out 0998+0999) | 24,323 → 21,728 (val_bpb = 0,9801; mejor split de 16 secuencias: 19,796) |
| Perplejidad de validación QA (etapa 4) | 5,607 |
| Perplejidad de validación base (etapa 4) | 21,821 → 23,521 |
| Perplejidad de validación (etapa 5) | 23,519 → 23,457 (val_bpb = 1,0045) |
| Expertos MoE muertos | 0/384 |
| Saltos ICMRC medios | 1,454 |
| Tasa de cierre `<think>` (sonda de 6 prompts) | 66,7% |
| Repetición 4-gram (sonda de 6 prompts) | 1,27% |
| Tokens medios en modo `<think>` | 524,3 |
| Fuga top-10 ED-NCE | 0,002489 (≤ 0,01) |
| Recompensa media GRPO-LN (3 rondas) | -0,4531 → -0,2111 → +0,4301 |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 5,8 GB para los pesos (tamaño del repo), más la caché KV de 6,0 KiB/token; con 64K tokens de contexto la caché añade ~384 MiB por secuencia.
- GPU recomendadas: el autor reporta entrenamiento en H100 80GB y A100 80GB; para inferencia es suficiente una GPU con 16 GB o más en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12-16 GB de VRAM (RTX 4090, RTX 4080, RTX 3090) en BF16 o cuantización inferior; en FP16/BF16 una RTX 4090 de 24 GB deja margen para contexto largo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (soporte nativo documentado); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible y probablemente requieran adaptación por el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Askos V1 Mini Full | 2,89B totales / ~615M activos | 64K | Apache 2.0 | Hugging Face |
| Qwen2.5-3B | 3,09B | 32K (128K con YaRN) | Apache 2.0 | Hugging Face |
| Llama 3.2-3B | 3,21B | 128K | Llama 3.2 Community | Hugging Face |
| Gemma 2-2B | 2,61B | 8K | Gemma Terms | Hugging Face |

La comparación con alternativas establecidas se limita a parámetros, contexto y licencia, ya que no hay benchmarks públicos de Askos V1 Mini Full que permitan contrastar rendimiento. Askos destaca por su contexto de 64K y su licencia permisiva, pero carece de la validación de ecosistema y las herramientas de despliegue (vLLM, llama.cpp) que sí tienen Qwen, Llama y Gemma.

## Limitaciones y advertencias
- Solo soporta coreano e inglés; no hay evidencia de capacidades en castellano u otros idiomas.
- La tasa de cierre de `<think>` observada es del 66,7%, lo que indica que en un tercio de los casos el razonamiento puede no terminar correctamente.
- La perplejidad de validación base aumentó tras el SFT (21,821 → 23,521), lo que sugiere cierto olvido catastrófico en la etapa 4.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; auditar antes de usar en producción.
- No hay benchmarks estándar publicados, por lo que el rendimiento real frente a modelos convencionales es desconocido.
- Riesgo de alucinación no cuantificado; la memoria HRR-Bind podría recuperar hechos incorrectos si la extracción de la etapa 2 contiene errores.
- El ecosistema de despliegue es limitado: sin soporte confirmado en vLLM, llama.cpp u Ollama, la integración en producción requiere trabajo adicional.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado y las dependencias asociadas deben revisarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/AhnJihunAILabs/askos-v1-mini-full
- Modelo base: https://huggingface.co/AhnJihunAILabs/askos-v1-mini-preview
