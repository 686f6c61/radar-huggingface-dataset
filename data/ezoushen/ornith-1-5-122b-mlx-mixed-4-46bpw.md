# ezoushen/ornith-1.5-122b-mlx-mixed-4.46bpw

## Resumen

Ornith-1.5-122B MLX mixed 4.46 bpw es una cuantización de precisión mixta, en formato MLX, del modelo Ornith-1.5-122B desarrollado por Ornith AI, realizada por el usuario independiente ezoushen. El modelo base es un modelo de lenguaje de 122B parámetros con arquitectura de mezcla de expertos (MoE) basada en Qwen3.5-MoE, con unos 10B parámetros activos por token, capacidades multimodales (texto e imagen) y una ventana de contexto de 262.144 tokens. Esta versión cuantizada está diseñada específicamente para ejecutarse en Macs Apple Silicon con 128 GB de memoria unificada.

El problema que resuelve esta cuantización es la brecha entre el modelo original en BF16 (unos 228 GiB, imposible de ejecutar en hardware de consumo) y las cuantizaciones uniformes de 4 bits, que sacrifican fidelidad. Mediante GPTQ con búsqueda de clip y anchos de bits variables por módulo (de 3 a 8 bits, con media de 4,46 bits por peso), la cuantización logra una divergencia KL frente a BF16 entre 1,8x y 3,3x menor que la cuantización uniforme de 4 bits, con apenas 0,5 GiB menos de tamaño.

Es relevante ahora porque permite ejecutar un modelo MoE de 122B con capacidades de razonamiento, código agéntico, tool calling y visión de forma local en un M5 Max, alcanzando unos 194 tokens/s con decodificación especulativa DFlash2 mediante el runtime Splash.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (48 capas: 36 de atención lineal, 12 de atención completa; 256 expertos enrutados, 8 por token, más experto compartido; torre de visión) |
| Parámetros totales | 122.562.817.776 |
| Parametros activos | ~10B por token (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | MLX affine de precisión mixta: 3/4/6/8 bits por módulo (media 4,46 bpw), routers y normas en BF16, torre de visión en BF16, grupo 64, GPTQ con búsqueda de clip |
| Idiomas soportados | Inglés y multilingüe (no se detalla la lista completa de idiomas) |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-122B, emplea la arquitectura Qwen3.5-MoE: un transformer híbrido con 48 capas, de las cuales 36 usan atención lineal y 12 atención completa, una configuración que reduce el coste computacional en contextos largos. El bloque MoE contiene 256 expertos enrutados con 8 activos por token, más un experto compartido, lo que da unos 10B parámetros activos por token sobre 122B totales. Incluye además una torre de visión para capacidades multimodales de imagen-texto a texto.

Sobre el entrenamiento del modelo base no se han publicado detalles en la información disponible (número de tokens, composición del dataset, RLHF/DPO). Esta cuantización concreta se ha calibrado con GPTQ y búsqueda de clip, asignando anchos de bits por módulo según su sensibilidad. La model card menciona datasets asociados al ecosistema del modelo (Nebius SWE-agent-trajectories, OpenThoughts3-1.2M, Hermes function-calling v1 y UltraChat 200k), lo que sugiere un entrenamiento orientado a código agéntico, razonamiento, tool calling y conversación, aunque no se especifica su papel exacto.

Una innovación destacable del ecosistema es la decodificación especulativa DFlash2, usada junto al runtime Splash para alcanzar ~194 tokens/s de decodificación en un M5 Max.

## Capacidades

- Generación de texto conversacional, con entrenamiento aparente sobre datos de chat (UltraChat 200k).
- Razonamiento (tag "reasoning"), con datos de razonamiento tipo OpenThoughts3.
- Código agéntico (agentic-coding), con datos de trayectorias de agentes SWE (Nebius SWE-agent-trajectories).
- Tool calling / function calling, con datos de Hermes function-calling v1.
- Capacidades multimodales de imagen-texto a texto: la torre de visión se mantiene en BF16 y Splash soporta entrada de visión.
- Soporte para decodificación especulativa DFlash2 en hardware Apple Silicon.
- Capacidades multilingües, con mejor rendimiento documentado en inglés.

## Casos de uso

- Ejecución local de un modelo grande en Mac: con 64,3 GiB en memoria unificada de 128 GB, un desarrollador puede correr un modelo de 122B (10B activos) completamente offline en un M5 Max, sin depender de APIs externas ni enviar datos a la nube.
- Asistentes de código agéntico: el modelo está cuantizado y evaluado específicamente para sesiones de agentes de código (pi, opencode, OpenHands), donde la fidelidad frente a BF16 es un 3,3x mejor que la cuantización uniforme de 4 bits, algo crítico cuando el modelo encadena llamadas a herramientas de edición y ejecución de código.
- Automatización con function calling: soporta llamadas a herramientas con selección correcta de herramienta y argumentos (4/4 en las comprobaciones de la model card), adecuado para orquestar APIs, scripts locales o flujos de automatización en el dispositivo.
- Análisis de documentos largos: la ventana de contexto de 262.144 tokens permite procesar repositorios completos, documentación extensa o conjuntos de documentos en una sola sesión.
- Comprensión de imágenes local: la torre de visión en BF16 permite tareas de descripción de imágenes, OCR ligero o análisis visual sin subir las imágenes a servicios externos.
- Razonamiento matemático y resolución de problemas: evaluado con problemas aritméticos en lenguaje natural (10/10 en las comprobaciones de la model card), útil para asistentes de cálculo y análisis.
- Prototipado de aplicaciones multimodales en local: la compatibilidad con mlx-lm (texto) y Splash (texto y visión) facilita integrar el modelo en aplicaciones macOS nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) para esta cuantización. La model card incluye comprobaciones propias (smoke checks) y mediciones de fidelidad frente a BF16:

| Métrica | Uniform 4-bit MLX | Esta versión (mixed 4,46 bpw) |
|---|---|---|
| KL vs BF16, sesiones privadas de código agéntico | 0,0591 | 0,0179 |
| KL vs BF16, media en 5 conjuntos públicos | 0,0615 | 0,0301 |
| Acuerdo top-1 con BF16 (código agéntico privado) | 91,4% | 95,4% |
| Decodificación en M5 Max (Splash + DFlash2) | 215,8 tok/s | 193,8 tok/s |
| HumanEval (40 problemas, ejecutados) | 36 | 37 |
| Problemas aritméticos en lenguaje natural | 10/10 | 10/10 |
| Tool calls correctos | 4/4 | 4/4 |
| Visión (6 imágenes generadas) | 5/6 | 5/6 |

Ratios KL (cuantización uniforme 4 bits dividida por esta versión, sobre el mismo conjunto de tokens; valores >1 significan mayor fidelidad de esta versión):

| Conjunto | Ratio [IC 95%] | Documentos más cercanos a BF16 |
|---|---|---|
| Código agéntico, privado | 3,30 [3,16, 3,42] | 48 de 48 |
| Código agéntico (OpenHands) | 2,46 [2,16, 2,77] | 39 de 40 |
| Matemáticas (NuminaMath) | 2,19 [2,03, 2,36] | 59 de 60 |
| Function calling (Glaive) | 1,77 [1,57, 1,99] | 51 de 60 |
| Chat, inglés (OASST2) | 2,20 [1,97, 2,46] | 48 de 50 |
| Chat, otros idiomas (OASST2) | 2,03 [1,88, 2,18] | 49 de 50 |

Los autores advierten que las filas de tareas son comprobaciones pequeñas y que una diferencia de un problema en HumanEval está dentro del ruido estadístico.

## Requisitos de hardware

- Memoria requerida: aproximadamente 64,3 GiB de pesos (69,0 GB el repositorio), más la memoria para KV cache y el sistema. Está diseñado para Macs Apple Silicon con 128 GB de memoria unificada; no cabe en Macs de 64 GB ni en GPUs de consumo convencionales.
- Hardware probado: Apple M5 Max con 128 GB de memoria unificada.
- No es adecuado para GPUs NVIDIA de consumo (RTX 4090, etc.) ni para A100/H100 en formato MLX; para esas plataformas habría que recurrir al checkpoint original en BF16 (~228 GiB, requiriendo multi-GPU) u otras cuantizaciones.
- Runtimes soportados: Splash (texto y visión, con decodificación especulativa DFlash2) y mlx-lm 0.31.3 (solo texto). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento medido: ~193,8 tokens/s de decodificación en M5 Max con Splash y DFlash2; la cuantización uniforme de 4 bits alcanza 215,8 tokens/s, es decir, esta versión es un ~10% más lenta.

## Comparativa con modelos similares

Comparativa con la cuantización uniforme de 4 bits del mismo modelo y con el checkpoint original:

| | BF16 original | Uniform 4-bit MLX | Esta versión (mixed 4,46 bpw) |
|---|---|---|---|
| Parámetros | 122B (MoE, ~10B activos) | 122B (MoE, ~10B activos) | 122B (MoE, ~10B activos) |
| Tamaño con visión | ~228 GiB | 64,8 GiB | 64,3 GiB |
| Bits por peso | 16 | ~4,5 | 4,46 (3-8 bits por módulo) |
| Cabe en un Mac de 128 GB | No | Sí | Sí |
| KL vs BF16 (código agéntico privado) | 0 | 0,0591 | 0,0179 |
| Decodificación en M5 Max | No ejecutable | 215,8 tok/s | 193,8 tok/s |
| Licencia | MIT | MIT | MIT |

Alternativas de la misma categoría (MoE grandes cuantizados para Apple Silicon), como Qwen3.5 en variantes MLX u otros modelos MoE de tamaño similar, no se han incluido porque no hay datos comparativos publicados en la información disponible: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se han documentado sesgos específicos en la model card.
- Riesgo de alucinación: inherente a cualquier LLM; no se han publicado evaluaciones de alucinación para este modelo.
- Idioma: el rendimiento documentado se centra en inglés; las capacidades multilingües existen pero la lista de idiomas y su calidad no están detalladas. En las pruebas de chat en otros idiomas (OASST2), la mejora de fidelidad frente a la cuantización uniforme es la más modesta de las evaluadas (ratio 2,03).
- Velocidad: esta versión es ~10% más lenta que la cuantización uniforme de 4 bits (193,8 frente a 215,8 tok/s en M5 Max), un compromiso por mayor fidelidad.
- La torre de visión solo funciona con Splash; mlx-lm la carga únicamente para texto.
- Las filas de tareas (HumanEval, aritmética, tool calling, visión) son comprobaciones pequeñas de la model card, no benchmarks rigurosos.
- Se trata de una redistribución independiente por ezoushen, no respaldada oficialmente por Ornith AI.
- Requisito de hardware muy específico: se necesita un Mac Apple Silicon con 128 GB de memoria unificada, lo que limita fuertemente el público potencial.
- Licencia MIT, sin restricciones para uso comercial, aunque la model card no documenta las condiciones de los datos de entrenamiento del modelo base.
- No se ha publicado información sobre el entrenamiento del modelo base (datos, RLHF/DPO, fecha de corte de conocimiento), lo que dificulta evaluar su vigencia.

## Enlaces

- Modelo cuantizado: https://huggingface.co/ezoushen/ornith-1.5-122b-mlx-mixed-4.46bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Cuantización uniforme 4-bit del mismo autor: https://huggingface.co/ezoushen/ornith-1.5-122b-mlx-4bit
- Cuantización uniforme 4-bit oficial: https://huggingface.co/ornith-ai/Ornith-1.5-122B-MLX-4bit
- Runtime Splash: https://github.com/incoai/splash
