# mtita/Qwen3.8-Flash-Next-CodeUD-v18a-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino una cuantización GGUF del modelo Qwen3.8-Flash-Next publicada por el usuario mtita bajo el identificador `mtita/Qwen3.8-Flash-Next-CodeUD-v18a-GGUF`. El modelo base lo desarrolla el equipo Qwen (Alibaba) y emplea una arquitectura híbrida MoE + Gated DeltaNet: 125,74B parámetros de tronco principal más una tabla PLE (n-gram embeddings) de 51,2B parámetros, con 6B parámetros activos por token. La tabla de parámetros totales reportada en safetensors es de 176.943.899.520 (unos 176,9B), y el contexto nominal alcanza los 262.144 tokens.

El trabajo de mtita es un proyecto declaradamente educativo cuyo objetivo es comprimir el modelo hasta 3,13 bits por peso en el tronco para que los pesos residan íntegramente en GPU en dos aceleradores AMD Radeon AI PRO R9700 (RDNA4, gfx1201, 32 GB cada uno, 64 GB totales). La tabla PLE, de 51,2B parámetros, se mantiene en disco y se sirve mediante Direct I/O con `--load-mode dio`, ocupando 0 MB de VRAM. El resultado es un artefacto de 105,8 GB de repositorio que cabe en un presupuesto de pesos en GPU de 45,85 GiB.

La relevancia práctica es doble: por un lado, es una de las pocas recetas documentadas públicamente para servir un MoE de ~177B parámetros en hardware AMD consumer/prosumer con ROCm; por otro, la model card detalla empíricamente qué tensores admiten cuantización agresiva y cuáles no (las proyecciones down de los expertos resultan ser el cuello de botella en dominios espaciales y numéricos). No hay garantías de calidad, estabilidad ni idoneidad, según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida MoE + Gated DeltaNet con Qwen Sparse Attention (3 × Gated DeltaNet + 1 × QSA por bloque de cuatro); 48 capas; 512 expertos (10 enrutados + 1 compartido); dimensión de experto 640 |
| Parámetros totales | 176.943.899.520 (~176,9B): 125,74B de tronco + 51,2B de tabla PLE |
| Parámetros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | GGUF mixta por tensor: Q8_0, Q6_K, Q5_K, IQ4_NL, IQ3_S, IQ2_S, IQ2_XXS y Q2_0; tronco a 3,13 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de mezcla de tokens: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con estado recurrente) y una usa Qwen Sparse Attention, lo que reduce el coste de atención en contextos largos manteniendo recuperación global. El componente MoE consta de 512 expertos por capa (10 enrutados más 1 compartido), con dimensión de experto 640, sobre 48 capas. A esto se añade una tabla PLE de n-gram embeddings de 51,2B parámetros, separada del tronco y consultada por token; en esta cuantización se almacena en Q8_0 en disco y se transmite fuera de la VRAM.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada. El repositorio de Qwen indica que el coste de entrenamiento es aproximadamente 1/9 del de Qwen3.7-Plus, con capacidades superiores en código. La innovación destacable de esta ficha concreta es el proceso de cuantización: un pase de `llama-quantize` guiado por una imatrix pública de AtomicChat (2,05M tokens, 0 expertos sin datos), con escalera de precisión estratificada por capas (capas frontera en IQ3_S, transicionales en IQ2_S, centrales en IQ2_XXS), down-exps forzados a IQ4_NL, y Q8_0 en expertos compartidos, atención QSA y cabeza de salida. El autor documenta dos restricciones técnicas: `ffn_down_exps` tiene forma `[640, 2560, 512]` y 640 no es divisible por 256, por lo que los superbloques de 256 caen silenciosamente a IQ4_NL (+3,08 GiB de VRAM); solo Q2_0 (bloque 64) e IQ4_NL (bloque 32) son válidos por debajo de 8 bits en down-experts.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`), con ventana nominal de 262.144 tokens.
- Generación y edición de código, incluyendo trabajo multiarchivo; la variante se denomina "CodeUD" y el corpus de calibración se orientó explícitamente a código.
- Razonamiento de tipo agente con cadenas de muchos pasos: el autor ejecutó una prueba de estrés agéntica autónoma de 3.000 turnos.
- Generación de frontend y razonamiento sobre DOM/estado web (el corpus de calibración incluye 800 muestras de web/DOM; PPL medida de 2,0347 en ese dominio).
- Razonamiento geométrico y espacial 3D, con 600 muestras de geometría y VSR en la calibración (PPL de 1,789–1,797 en las builds citadas).
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio es exclusivamente de texto.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Agente de código autónomo en estación de trabajo local: con 262.144 tokens de contexto puede mantener el estado de un repositorio mediano y ejecutar ciclos de editar–compilar–testear sin salir de la máquina, evitando enviar código propietario a APIs externas.
- Sustitución de API en pipelines de CI/CD: el modelo se sirve con llama.cpp sobre ROCm y puede exponerse como endpoint compatible (`endpoints_compatible` en las etiquetas), de modo que un runner interno consulte al modelo para revisiones de parches y generación de tests.
- Refactorización multiarchivo: la combinación de contexto largo y atención híbrida permite cargar varios ficheros relacionados y aplicar cambios coherentes entre módulos, una tarea donde los modelos de contexto corto pierden referencias cruzadas.
- Generación de frontend y corrección de estado DOM: el corpus de calibración incluyó muestras específicas de web/UI, por lo que el artefacto está ajustado para producir componentes y depurar errores de estado en aplicaciones web.
- Asistente interno con contexto documental extenso: útil para consultar manuales técnicos o normativa de varios cientos de miles de tokens en una sola sesión, manteniendo los datos dentro de la infraestructura propia.
- Servicio multiusuario ligero: la configuración de referencia usa `--parallel 4` con `--kv-unified` y caché KV en q4_0, lo que permite atender a varios usuarios simultáneos desde un único par de GPU.
- Investigación en cuantización: el repositorio sirve como caso de estudio reproducible de escaleras de precisión por tensor, uso de imatrix y presupuesto de VRAM, con doce builds documentadas y once técnicas descartadas con mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas internas de perplejidad por dominio, obtenidas con su propio corpus de calibración y no comparables con evaluaciones públicas:

| Build | Dominio | PPL reportada | Observación |
|---|---|---|---|
| Referencia previa a v8 | geometry | 1,7846 | Línea base citada por el autor |
| v8 | geometry | 2,0321 (+27%) | Regresión al mover todas las down-exps a IQ4_NL con IQ2_XXS intermedio |
| v9 | geometry | 1,797 | Recuperación con expertos estratificados y down-exps en IQ4_NL |
| v4 | geometry | 1,789 | Con atención en Q6_K y corpus de 6 pilares |
| v4 | web_ui | 2,0347 | Dominio web/DOM |
| v4 | wiki | regresión leve | La composición de calibración es un compromiso explícito |

Existe además una prueba de estrés agéntica de 3.000 turnos que identificó fallos a partir de 120k tokens de contexto: deriva en las claves de atención de largo alcance, errores de coordenadas espaciales 3D y errores de estado/DOM en frontend. No se reportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM: el build de referencia mantiene los pesos en GPU en un máximo de 45,85 GiB, distribuidos en 2 × AMD Radeon AI PRO R9700 (32 GB nominales, ~30,57 GB usables por tarjeta, 64 GB totales). A ello se suman ~1,5 GiB de grafos de cómputo por slot en la GPU 0 y ~3,1 GiB en la GPU 1 con `--parallel 4`, más la caché KV en q4_0 y ~1,2 GiB de grafo de draft.
- La tabla PLE (51,2B parámetros) no consume VRAM: se sirve desde disco con `--load-mode dio` (0 MB en GPU), por lo que el almacenamiento debe tener suficiente ancho de banda y latencia baja.
- El modelo base en ~16 bits por peso necesita más de 120 GB de VRAM solo para pesos, según el autor; no cabe en ninguna estación de 64 GB sin cuantizar.
- GPU recomendadas: AMD RDNA4 `gfx1201` (Radeon AI PRO R9700) con ROCm y el fork `stew675/llama-cpp-rdna-boosts`, que aporta fusión BF16 del HC-mixer, chunking de GDN y correcciones de QSA. Para CUDA no hay configuración documentada en esta ficha.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RX 7900 XTX de 24 GB) ni en configuraciones de 32 GB; el requisito práctico es de 64 GB de VRAM agregada más almacenamiento rápido para la PLE.
- Despliegue: llama.cpp (formato GGUF) sobre ROCm. vLLM, TGI y Ollama no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|---|
| mtita/Qwen3.8-Flash-Next-CodeUD-v18a (esta ficha) | ~176,9B (125,74B + 51,2B PLE) | ~6B | 262.144 | GGUF 3,13 bpw, repo de 105,8 GB | qwen-community-1.0 | Pesos en GPU ≤ 45,85 GiB; PLE en disco; 214 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | ~176,9B | ~6B | 262.144 | safetensors, ~16 bpw | qwen-community-1.0 | Requiere >120 GB de VRAM para pesos |
| Qwen3.8 Flash Next 131b A6b (GGUF de comunidad, local-ai-zone) | ~131B | ~6B | no disponible | GGUF, 77,4 GB | no disponible | 5.730 descargas, 39 likes en el índice |
| Qwen3.8 Flash Next Ap (GGUF de comunidad, local-ai-zone) | no disponible | no disponible | no disponible | GGUF, 5,05 GB | no disponible | 35.315 descargas, 38 likes; tamaño propio de una cuantización muy agresiva |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible | Referencia del autor del modelo base: coste de entrenamiento ~9× mayor |

## Limitaciones y advertencias

- Proyecto declaradamente educativo: el autor no ofrece garantía alguna de calidad, estabilidad, corrección ni idoneidad para ningún propósito. No es un artefacto recomendado para producción sin validación propia.
- Calidad degradada respecto al modelo base: el tronco está a 3,13 bpw, con capas centrales en IQ2_XXS. La propia model card documenta regresiones medibles, incluida una subida de perplejidad del 27% en geometría en la build v8.
- Fallos documentados en contextos largos: a partir de ~120k tokens se observan derivas en las claves de atención de largo alcance, errores de coordenadas espaciales 3D y errores de estado/DOM en frontend. La ventana de 262.144 tokens es nominal, no una garantía de calidad equivalente en toda su extensión.
- Sesgo de calibración: el corpus imatrix está sesgado hacia Python, prosa, geometría y web/DOM. Los dominios fuera de esa cobertura (por ejemplo wiki, según la medición del propio autor) pueden degradarse más de lo esperado.
- Dependencia de hardware muy específica: ROCm sobre RDNA4 (`gfx1201`) con un fork concreto de llama.cpp. No hay ruta documentada para CUDA, Apple Silicon ni CPU.
- Dependencia de E/S de disco: la tabla PLE se sirve fuera de VRAM mediante Direct I/O; un almacenamiento lento penaliza la latencia de forma directa.
- Margen de memoria muy ajustado: el presupuesto de 45,85 GiB está calculado para el envoltorio real de `--parallel 4`; un incremento de tan solo 225 MiB en pesos puede provocar OOM en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo cuantizado a baja precisión y sin evaluación estándar publicada.
- Idiomas soportados: no declarados. No hay evidencia en la información disponible sobre calidad multilingüe, incluido el castellano.
- Licencia Qwen Community License 1.0: es una licencia con condiciones ("other" en los metadatos); debe revisarse el texto completo antes de cualquier uso comercial. El autor de la cuantización no añade permisos adicionales.
- Sin resultados de benchmarks estándar ni evaluación independiente; 214 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- La model card original está truncada en la información proporcionada (corte en la era 2 del historial de builds), por lo que parte del proceso documentado no es verificable desde esta ficha.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mtita/Qwen3.8-Flash-Next-CodeUD-v18a-GGUF
- Árbol de ficheros: https://huggingface.co/mtita/Qwen3.8-Flash-Next-CodeUD-v18a-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- llama.cpp / ggml (formato GGUF y kernels de cuantización): https://github.com/ggml-org/llama.cpp
- Fork ROCm para RDNA4 utilizado: https://github.com/stew675/llama-cpp-rdna-boosts
- Índice de modelos con el GGUF de 131B A6b: https://local-ai-zone.github.io/models/qwen3-8-flash-next-131b-a6b.html
- Índice de modelos con el GGUF "Ap": https://local-ai-zone.github.io/models/qwen3-8-flash-next-ap.html
- Referencias arXiv incluidas en las etiquetas del repositorio: https://arxiv.org/abs/2608.30320, https://arxiv.org/abs/2210.17323, https://arxiv.org/abs/2306.00978, https://arxiv.org/abs/2211.10438, https://arxiv.org/abs/2406.08155, https://arxiv.org/abs/2605.23078, https://arxiv.org/abs/2402.04396, https://arxiv.org/abs/2401.06118, https://arxiv.org/abs/2406.11235
- Imatrix pública de AtomicChat (2,05M tokens): referenciada en la model card, sin URL en la información disponible.
