# pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-W4A16-AWQ

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-W4A16-AWQ es una compilación cuantizada del modelo merge homónimo publicado por el usuario pragmaticcs. Se trata de un modelo denso de 8.953.803.264 parámetros (8,8B en el backbone de texto) construido sobre la arquitectura Qwen 3.5 de 9B, que combina mediante la técnica de fusión de task vectors TIES-DELLA tres fine-tunes especializados: Qwopus3.5-9B-Coder (precisión algorítmica y sintáctica), MiMo-V2.6-Distill-Qwen-9B (descomposición de problemas tipo SWE-bench y tool calling) y Ornith-1.5-9B (disciplina de terminación de bucles y recuperación ante errores en entornos agénticos).

El modelo resuelve un problema concreto en el segmento sub-10B: la mayoría de los modelos de código de este tamaño fallan en flujos agénticos reales, ya sea entrando en bucles infinitos cuando un comando de shell falla o alucinando sintaxis de APIs poco conocidas. La fusión busca un equilibrio entre generación de código limpio, manejo robusto de llamadas a herramientas y capacidad de recuperación ante errores. Mantiene una ventana de contexto nativa de 256k tokens y una arquitectura híbrida de atención Gated DeltaNet (3 capas de atención lineal por cada capa de atención completa).

Esta variante concreta está cuantizada a INT4 en formato W4A16 mediante AWQ y GPTQ, calibrada con una mezcla de código frontend real (HTML, CSS, JS/TS), razonamiento algorítmico y diálogos de tool calling. El repositorio ocupa 7,7 GB y está pensado para despliegue en vLLM y SGLang. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal LM (`qwen3_5_text`) con atención híbrida Gated DeltaNet (3:1 lineal/completa) |
| Parametros totales | 8.953.803.264 (8,8B en backbone de texto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | INT4 W4A16 (AWQ + GPTQ); pesos nativos en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM y SGLang |

Especificaciones adicionales de la arquitectura: dimensión oculta 4096, dimensión intermedia MLP 12288 (SwiGLU), 32 capas de decodificador. Capas de atención completa en los índices 3, 7, 11, 15, 19, 23, 27 y 31. Atención lineal con 16 cabezas de clave y 32 de valor (d_k = d_v = 128). Atención completa con 16 cabezas de query y 4 de clave-valor (GQA, d_h = 256). RoPE 1D parcial (θ = 10⁷, factor 0,25). Precisión nativa bfloat16.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 32 capas con un esquema de atención híbrido: 24 capas emplean Gated DeltaNet (atención lineal con estado recurrente) y 8 capas usan atención completa con GQA. Esta proporción 3:1 reduce el coste computacional y de memoria en contextos largos, manteniendo capacidad de recuperación exacta en las capas de atención completa. El modelo no es un entrenamiento desde cero, sino un merge de task vectors: se parte del checkpoint base Qwen/Qwen3.5-9B como ancla estructural (W₀) y se fusionan tres donantes con pesos ponderados según la profundidad de la red. Qwopus3.5-9B-Coder (destilación de Claude 3.5 Opus) aporta en las capas bajas (x ≤ 0,35) precisión de tipado, sintaxis y algoritmos; Ornith-1.5-9B aporta en las capas medias (0,35 < x < 0,70) disciplina de terminación de bucles y recuperación ante errores derivada de RL agéntico; MiMo-V2.6-Distill-Qwen-9B aporta descomposición de problemas y tool calling. La fusión usa TIES-DELLA, que combina el truncado de signos y la resolución de interferencias de TIES con el escalado adaptativo por capas de DELLA.

La cuantización W4A16 se calibró con AWQ y GPTQ sobre una mezcla de código frontend real, razonamiento algorítmico y diálogos de tool calling. Según la model card, componentes críticos como la torre de visión, los embeddings de tokens y el enrutamiento de atención lineal se mantuvieron en BF16 completo. No se especifica en la información disponible el número de tokens de entrenamiento de los donantes ni la composición detallada de sus datasets.

## Capacidades

- Generación de código en HTML, CSS, JavaScript y TypeScript, con especial énfasis en frontend según la calibración de la cuantización.
- Razonamiento algorítmico y descomposición de problemas de ingeniería de software, heredado del donante MiMo-V2.6.
- Tool calling y function calling, con diálogos de llamadas a herramientas incluidos en el conjunto de calibración.
- Flujos agénticos multi-paso con disciplina de terminación de bucles y recuperación ante fallos de comandos, heredada de Ornith-1.5.
- Razonamiento de tipo SWE-bench: localización de fallos, propuesta de parches y verificación.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modelo puramente de texto: la model card menciona una torre de visión preservada en BF16, pero el pipeline declarado es text-generation y el backbone es `qwen3_5_text`; no se documenta soporte de visión efectivo en esta build.
- Compatibilidad con `endpoints_compatible`, lo que permite su uso tras APIs compatibles con OpenAI.

## Casos de uso

- Asistente de código en IDE: el modelo puede completar y refactorizar código frontend (HTML, CSS, JS/TS) con 256k tokens de contexto, lo que permite incluir varios ficheros del proyecto en la ventana y mantener coherencia entre ellos.
- Agente de resolución de incidencias (SWE-bench style): dado un repositorio y un fallo reportado, el modelo descompone el problema, localiza el código relevante y propone un parche, con capacidad de reintentar y corregir cuando una verificación falla.
- Automatización de pipelines CI/CD con tool calling: puede invocar herramientas de build, tests y despliegue en flujos multi-paso, y la disciplina de terminación de bucles reduce el riesgo de que el agente se quede atascado reintentando la misma acción.
- Generación de componentes de interfaz: la calibración específica sobre HTML, CSS y JS/TS lo hace adecuado para producir componentes de UI completos y coherentes con un design system dado en el contexto.
- Chat de soporte técnico para desarrolladores: con contexto largo puede absorber documentación de API y logs de error, y responder con ejemplos de código y llamadas correctas a endpoints.
- Evaluación y corrección de código en lote: el tamaño de 8,8B y la cuantización INT4 permiten desplegarlo en GPUs de consumo para tareas de revisión estática, generación de tests y detección de errores de sintaxis a escala.
- Prototipado de agentes de shell: el modelo está entrenado para manejar fallos de comandos y pivotar de estrategia, lo que lo hace útil en entornos de ejecución de comandos donde los errores son frecuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas con MMLU, HumanEval, GSM8K, SWE-bench ni métricas comparativas de los modelos donantes o del merge.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 7,7 GB en INT4 W4A16, por lo que se necesita aproximadamente 8-10 GB de VRAM para los pesos, más overhead de KV cache. Con 256k de contexto la KV cache puede crecer considerablemente; para contextos largos se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para contextos completos de 256k y despliegue de alta concurrencia; RTX 4090 (24 GB) para contextos medios; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) para contextos moderados y en GPUs de 12 GB con contexto reducido.
- Opciones de despliegue: vLLM y SGLang son los objetivos declarados de esta build (formato compressed-tensors, W4A16). También es compatible con transformers. No se indica soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-W4A16-AWQ | 8,8B denso | 256k | Apache 2.0 | INT4 W4A16 | Merge TIES-DELLA de 3 fine-tunes; orientado a agentes y código |
| Qwen/Qwen3.5-9B | 9B denso | 256k (según base) | Apache 2.0 | BF16 nativo | Modelo base estructural; sin especialización en código agéntico |
| Jackrong/Qwopus3.5-9B-Coder | 9B denso | no disponible | no disponible | no disponible | Fine-tune de código con destilación de Claude 3.5 Opus; uno de los donantes |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B denso | no disponible | no disponible | no disponible | Fine-tune orientado a SWE-bench y tool calling; donante |
| ornith-ai/Ornith-1.5-9B | 9B denso | no disponible | no disponible | no disponible | Fine-tune con RL agéntico; donante |

Los datos de contexto, licencia y cuantización de los modelos donantes no aparecen en la información proporcionada; se marcan como no disponibles. No se dispone de métricas de rendimiento comparativas.

## Limitaciones y advertencias

- Modelo de texto: aunque la model card menciona una torre de visión preservada en BF16, el pipeline es text-generation y el backbone es `qwen3_5_text`; no se debe asumir capacidad de visión en esta build.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de código, especialmente en APIs poco frecuentes; la propia model card reconoce este problema en el segmento sub-10B.
- Al ser un merge de fine-tunes, puede heredar sesgos de los tres donantes, incluidos sesgos de los datasets de destilación y de RL agéntico; no se detallan en la información disponible.
- La cuantización INT4 puede degradar ligeramente la precisión respecto al modelo BF16 original; no se han publicado evaluaciones de la pérdida de calidad.
- La ventana de 256k en la práctica está limitada por la VRAM disponible para KV cache; en GPUs de consumo el contexto efectivo será mucho menor.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base y donantes por si imponen restricciones adicionales; no están detalladas en la información disponible.
- La model card incluye promoción de un Patreon y de otro modelo del mismo autor; no es un modelo oficial de Qwen ni de Xiaomi.

## Enlaces

- Hugging Face: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-W4A16-AWQ
- Modelo merge en BF16: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Donante Qwopus: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Donante MiMo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Paper referenciado (arXiv:2406.11617): https://arxiv.org/abs/2406.11617
- Repositorio transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
