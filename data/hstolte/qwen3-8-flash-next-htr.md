# hstolte/Qwen3.8-Flash-Next-HTR

## Resumen

Qwen3.8-Flash-Next-HTR es una distribución cuantizada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el desarrollador independiente hstolte bajo el formato propietario Halo Trellis (HTR). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint de servicio optimizado para hardware AMD Strix Halo (Radeon 8060S, arquitectura RDNA 3.5, ISA `gfx1151`), que requiere un runtime vLLM modificado (vllm-htr) para funcionar. El modelo base es un transformer de 53.986 millones de parámetros (aproximadamente 54B) con capacidades de generación de texto y conversación.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la optimización de modelos grandes para hardware de consumo o semi-profesional mediante cuantización agresiva y kernels AOT (ahead-of-time) específicos para una GPU concreta. La versión v0.2.6 del runtime elimina las pausas por compilación JIT de Triton en mitad de la inferencia y duplica la velocidad de prefill en contextos largos (de 551,9 a 1.137,7 tok/s en prefill cálido de 13K tokens), lo que lo hace viable para despliegues interactivos en una única máquina con GPU integrada.

El modelo se distribuye en dos variantes: Htr5Core (recomendada para inferencia) y Bf16Core (referencia de investigación que restaura el núcleo en BF16, sin cualificación de rendimiento). El repositorio completo ocupa 182,1 GB, aunque la model card indica que debe descargarse una sola variante, no el repositorio entero. La licencia es qwen-community-1.0, con restricciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; el modelo base Qwen3.8-Flash-Next no se describe en la informacion proporcionada) |
| Parametros totales | 53.986.623.187 (~54B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (max-model-len usado en las pruebas del runtime); máximo no confirmado en la informacion disponible |
| Tipos de cuantizacion | Halo Trellis (HTR) propietaria; variantes Htr5Core y Bf16Core; KV cache en `int8_per_token_head` e `int4_per_token_head`; W4A16 para MoE; V5-Q4 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (con runtime HTR personalizado; no compatible con vLLM estándar) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.8-Flash-Next (número de capas, dimensión oculta, tipo de atención, composición del dataset de entrenamiento ni si hubo RLHF o DPO). Lo que sí se detalla es la capa de optimización introducida por HTR: el runtime vLLM modificado implementa kernels HIP AOT compilados para `gfx1151`, incluyendo atención QSA con WMMA INT8 (`v_wmma_i32_16x16x16_iu8`), GDN (probablemente un mecanismo de atención o convolución con estado), `causal_conv1d`, MoE en W4A16, HyperConnection, prefill denso, transposición PLE y sampler Gumbel. La versión v0.2.6 añade 20 kernels AOT sin spill y tres extensiones de decodificación con optimizaciones ISA RDNA 3.5 (dual-issue `v_dual_dot2acc_f32_bf16`, `v_perm_b32` de un ciclo y emparejamiento VOPD con bancos escalonados).

El entrenamiento del modelo base no se documenta en la información proporcionada. La cuantización HTR parece ser post-entrenamiento (PTQ) y mantiene los pesos, tokenizador y configuración sin cambios respecto al checkpoint original; las actualizaciones de versión son exclusivamente de serving. El runtime emplea decodificación especulativa MTP (Multi-Token Prediction) con una tasa de aceptación de 3,21 tokens por paso (73,80% en BF16 KV) y 63,45% en MTP-3 con atención INT8.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones (heredado del modelo base Qwen3.8-Flash-Next, aunque no se detallan capacidades específicas en la información disponible).
- Soporte de decodificación especulativa MTP para acelerar la generación.
- Inferencia con KV cache cuantizada en INT8 e INT4 por cabeza de token (`int8_per_token_head`, `int4_per_token_head`).
- Capacidad de servir múltiples peticiones concurrentes (probado con `c=4` y `c=8`).
- No se documentan en la información disponible capacidades de visión, audio, tool calling, function calling ni agentes multi-paso.

## Casos de uso

- **Servicio de chat interactivo en estación de trabajo AMD Strix Halo**: el modelo puede atender conversaciones multi-turno con hasta 32K tokens de contexto en una única máquina con GPU integrada Radeon 8060S, usando el runtime vLLM-HTR y KV cache INT8. Es adecuado porque el prefill cálido de 13K tokens se completa en 11,44 s y la decodificación greedy alcanza 45,16 tok/s, suficiente para interacción humana fluida.
- **Procesamiento por lotes de documentos largos**: con 32K de contexto y prefill frío de 13K tokens a 910,5 tok/s, se pueden resumir o extraer información de informes, contratos o artículos de forma local, sin depender de API en la nube. La cuantización HTR reduce el espacio de pesos para que quepan en la memoria unificada del sistema.
- **Generación de código asistida en local**: aunque no se documenta soporte explícito de tool calling, el modelo base Qwen3.8-Flash-Next está orientado a texto y conversación; puede usarse como asistente de autocompletado o revisión en un IDE local, con la ventaja de que el runtime elimina las pausas por JIT de Triton durante la inferencia (`0` avisos), lo que evita bloqueos en sesiones interactivas.
- **Investigación en cuantización y kernels para RDNA 3.5**: el repositorio incluye kernels AOT, scripts de cualificación y datos de evidencia (`evidence/v0.2.6-release-qualification.json`), lo que lo convierte en una base para estudiar el rendimiento de WMMA INT8, W4A16 MoE y decodificación especulativa en `gfx1151`.
- **Despliegue de bajo coste en hardware de consumo**: al no requerir GPU de datacenter (A100/H100), el modelo permite a desarrolladores individuales o equipos pequeños servir un modelo de ~54B en una máquina con memoria unificada grande, siempre que acepten la dependencia del runtime HTR y la licencia qwen-community-1.0.
- **Evaluación comparativa de runtimes de inferencia**: los datos de throughput y latencia publicados (prefill, decodificación greedy, concurrencia `c=4` y `c=8`) permiten comparar el rendimiento de vLLM-HTR frente a otras pilas de serving en el mismo hardware, útil para decisiones de arquitectura en equipos de infraestructura.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de serving del runtime, no benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks de calidad en la información disponible.

| Carga de trabajo | v0.2.5 KV8 | v0.2.6 | Cambio |
|---|---:|---:|---|
| Prefill cálido 13K (13.018 tok) | 551,9 tok/s (23,58 s) | 1.137,7 tok/s (11,44 s) | 2,06× más rápido |
| Prefill frío 13K (13.017 tok) | 551,9 tok/s (23,58 s) | 910,5 tok/s (14,30 s) | 1,65× más rápido |
| Decodificación greedy `c=1` (128 tok) | 45,05 tok/s | 45,16 tok/s | +0,2% |
| `c=4 × 4K` (16.702 ctx), wall / suma decode | 23,82 s / 57,25 tok/s | 21,77 s / 61,65 tok/s | 1,09× wall / +7,7% dec |
| `c=8` alta concurrencia (8×128), wall / agg | 19,03 s / 53,80 tok/s | 15,51 s / 66,01 tok/s | 1,23× wall |
| Avisos JIT de Triton en inferencia | múltiples | 0 | eliminados |

Datos adicionales de v0.2.5 frente a v0.2.4: con KV BF16 y `max-num-seqs=4`, 32K ctx, MTP3, 4 GiB KV, la decodificación greedy `c=1` pasó de 42,21 a 44,60 tok/s (+5,7%); la decodificación 4K de 54,59 a 59,56 tok/s (+9,1%); `c=4` concurrente (t=0,7, 4×256) de 71,33 a 100,50 tok/s de suma (+40,9%). Con KV INT8 y `max-num-seqs=8`, el prefill 13K pasó de 409,6 a 551,9 tok/s (+34,7%) y la decodificación 13K de 43,39 a 63,92 tok/s (+47,3%).

## Requisitos de hardware

- **GPU objetivo**: AMD Strix Halo / Radeon 8060S (RDNA 3.5, ISA `gfx1151`). El runtime está compilado específicamente para esta arquitectura; no se documenta soporte para otras GPU.
- **VRAM/memoria**: el repositorio completo ocupa 182,1 GB, pero debe descargarse una sola variante (Htr5Core o Bf16Core). No se especifica el tamaño exacto de cada variante en la información disponible. Las pruebas usan 4 GiB de KV cache con `max-num-seqs=4` u `8` y contexto de 32K, lo que sugiere que la memoria unificada del sistema debe acomodar pesos más KV.
- **GPU de consumo**: sí, cabe en hardware de consumo/semi-profesional AMD Strix Halo con memoria unificada; no se documenta compatibilidad con RTX 4090, A100 ni H100.
- **Despliegue**: exclusivamente mediante el runtime vLLM-HTR (imagen de contenedor con kernels AOT). No se menciona compatibilidad con llama.cpp, Ollama, TGI ni vLLM estándar.
- **Latencia y throughput**: prefill cálido de 13K a 1.137,7 tok/s; decodificación greedy `c=1` a 45,16 tok/s; `c=8` con 66,01 tok/s agregados. Tasa de aceptación MTP3 del 73,80% con KV BF16 y 63,45% con atención INT8.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones del modelo base Qwen3.8-Flash-Next en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría. La comparación disponible es exclusivamente de rendimiento de serving entre versiones del propio runtime (v0.2.4, v0.2.5 y v0.2.6), ya presentada en la sección de benchmarks. Cualquier comparación con otros modelos de ~54B o con otras distribuciones cuantizadas del mismo modelo base requeriría datos que no se han publicado aquí.

## Limitaciones y advertencias

- **Dependencia de hardware y runtime**: el modelo solo funciona con el runtime vLLM-HTR y kernels compilados para `gfx1151` (AMD Strix Halo). No es portable a otras GPU sin recompilación, y la model card marca `inference: false` en los metadatos, lo que indica que no es un checkpoint listo para pipelines estándar.
- **Licencia**: qwen-community-1.0 (etiquetada como `other`). Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; la información disponible no detalla las restricciones concretas.
- **Idiomas**: no se especifican los idiomas soportados; no se puede garantizar calidad multilingüe sin evaluación.
- **Sesgos y alucinación**: no se documentan evaluaciones de sesgo ni de tasa de alucinación para este checkpoint ni para el modelo base en la información proporcionada. Al ser un modelo de ~54B cuantizado, cabe esperar degradación adicional respecto al original, aunque no se cuantifica.
- **Contexto**: las pruebas se limitan a 32.768 tokens (`max-model-len=32768`); no se confirma si el modelo soporta contextos mayores ni con qué degradación.
- **Madurez**: la versión v0.2.6 es una actualización de serving reciente (noviembre de 2026) con 0 likes y sin benchmarks de calidad publicados; el ecosistema de herramientas en torno a HTR es reducido y específico.
- **Variantes**: Bf16Core se describe como referencia de investigación sin cualificación de rendimiento en GPU; no debe usarse en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hstolte/Qwen3.8-Flash-Next-HTR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime vLLM-HTR (release v0.2.6): https://github.com/HawgAuto/vllm-htr/releases/tag/htr-v0.2.6
- Repositorio del runtime: https://github.com/HawgAuto/vllm-htr
- Historial de releases (documentación del repo): docs/RELEASES.md
- Detalles de variantes (documentación del repo): docs/VARIANTS.md
- Evidencia de cualificación v0.2.6: evidence/v0.2.6-release-qualification.json
- Paper referenciado en los tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
