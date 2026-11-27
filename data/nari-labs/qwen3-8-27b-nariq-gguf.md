# nari-labs/Qwen3.8-27B-NariQ-GGUF

## Resumen

NariQ es una cuantización post-entrenamiento (PTQ) del modelo Qwen3.8-27B de Alibaba, desarrollada por nari-labs y publicada en formato GGUF para su ejecución en llama.cpp. La innovación principal es el uso de codificación trellis (trellis-coded quantization) calibrada sobre trazas reales de agentes de código, lo que permite comprimir un modelo de 26.900 millones de parámetros (53,8 GB en BF16) hasta 10,1 GB (3 bits por peso) manteniendo un rendimiento prácticamente idéntico al original en tareas de agente de largo horizonte, matemáticas y comprensión de imágenes.

El modelo base Qwen3.8-27B es un transformer multimodal (image-text-to-text) con una ventana de contexto de 262.144 tokens, orientado a tareas de razonamiento, generación de código y uso como agente autónomo. NariQ preserva estas capacidades en un tamaño que cabe en GPUs de consumo de 24 GB, lo que lo hace relevante para desarrolladores que necesitan ejecutar localmente un agente de código de alto rendimiento sin infraestructura de datacenter.

La relevancia actual radica en que la cuantización a 3 y 2,5 bits iguala o supera al BF16 en los benchmarks de agente reportados (DeepSWE v1.1, Terminal-Bench 2.1), lo que rompe la suposición habitual de que comprimir por debajo de 4 bits degrada inevitablemente el rendimiento en tareas complejas de razonamiento multi-paso. Requiere obligatoriamente un fork específico de llama.cpp mantenido por nari-labs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Qwen3.8-27B |
| Parámetros totales | 26.906.086.912 (26,9 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (completa); ≈135K–184K según cuantización en GPU de 24 GB |
| Tipos de cuantización | NariQ 3,0 bpw (10,12 GB), 2,5 bpw (8,44 GB), 2,0 bpw (6,75 GB); proyector visual mmproj en BF16 (0,93 GB) |
| Idiomas soportados | no disponible (el benchmark MGSM evalúa 11 idiomas, pero no se lista el conjunto completo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con 26,9 mil millones de parámetros que procesa entradas de imagen y texto. NariQ no reentrena el modelo: aplica una cuantización post-entrenamiento con codificación trellis (trellis-coded quantization), calibrada sobre trazas reales de agentes de código. El layout resultante está diseñado para ejecutarse en una sola GPU mediante el fork de llama.cpp de nari-labs, que es requisito obligatorio para cargar estos pesos.

Los detalles técnicos completos se recogen en el informe técnico publicado en arXiv (2611.26157). La model card no especifica el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la documentación de Qwen3.8-27B. La innovación destacable es la preservación del rendimiento BF16 en tareas de agente de largo horizonte a 3 y 2,5 bits, medida mediante divergencia KL sobre trazas de agente retenidas y mediante benchmarks de ejecución real con el CLI de Claude Code como arnés.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking mode), con parámetros de muestreo recomendados de temperatura 1,0, top-p 0,95, top-k 20 y min-p 0.
- Generación y edición de código en tareas de agente de largo horizonte (resolución de issues, parcheo de repositorios, ejecución de comandos en terminal).
- Razonamiento matemático (evaluado en AIME 25+26 y MGSM en 11 idiomas).
- Comprensión de imágenes (image-text-to-text), mediante el proyector visual mmproj incluido en BF16.
- Capacidades multilingües: el benchmark MGSM cubre 11 idiomas, aunque la lista completa no está disponible.
- Integración con arneses de agente externos: los resultados reportados usan el CLI de Claude Code como driver del modelo local.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional multi-turno.
- Soporte de tool calling y function calling: no se detalla explícitamente en la model card, pero el uso como agente de código con Claude Code implica interacción con herramientas; no disponible como especificación formal.

## Casos de uso

- Agente de código autónomo en local: el modelo puede resolver tareas de ingeniería de software de extremo a extremo (leer repositorio, escribir parches, ejecutar tests) con 262.144 tokens de contexto, suficiente para cargar grandes porciones de un codebase. La cuantización de 3 bits mantiene el rendimiento BF16 en DeepSWE v1.1 (41,0 % frente a 39,8 %) y Terminal-Bench 2.1 (63,8 % frente a 62,6 %).
- Asistente de terminal y automatización de operaciones: con Terminal-Bench 2.1 como referencia, el modelo puede ejecutar secuencias de comandos, diagnosticar fallos y corregir errores en entornos de shell, integrándose en flujos de trabajo de administración de sistemas.
- Revisión y generación de código en pipelines de CI/CD: el modelo puede analizar diffs, sugerir correcciones y generar tests; su ventana de contexto permite procesar múltiples archivos y el historial de cambios en una sola pasada.
- Razonamiento matemático asistido: con un 98,3 % en AIME 25+26 (3 bits), es adecuado para tutoría, verificación de cálculos y resolución de problemas cuantitativos en entornos educativos o de investigación.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas y documentos escaneados, combinando visión y razonamiento textual en una sola llamada.
- Despliegue en estación de trabajo con GPU de consumo: con 10,1 GB (3 bits) y un contexto de ≈135K en una GPU de 24 GB, permite ejecutar un agente de código de 27B en hardware como una RTX 4090, sin depender de servicios en la nube.
- Atención al cliente técnica multi-turno: la ventana de contexto larga y el modo conversacional permiten mantener sesiones extensas con historial completo, aunque no hay datos específicos de rendimiento en este dominio.

## Benchmarks y rendimiento

Resultados reportados en la model card. Cada celda indica porcentaje y, entre paréntesis, el recuento (tareas resueltas o respuestas correctas). Los agentes se ejecutan con Claude Code CLI 2.1.309, thinking activado, effort máximo, contexto de 262.144 tokens y muestreo de thinking mode.

| Modelo | DeepSWE v1.1 (113 tareas × 3) | Terminal-Bench 2.1 (82 × 3) | AIME 25+26 (60 × 8) | MGSM (250 × 11 idiomas) | RealWorldQA (765 × 3) |
|---|---:|---:|---:|---:|---:|
| BF16 (53,8 GB) | 39,8 (45,0) | 62,6 (154) | 97,7 (469) | 94,0 (2584) | 82,4 (1890) |
| NariQ 3-bit (10,1 GB) | 41,0 (46,3) | 63,8 (157) | 98,3 (472) | 93,1 (2561) | 82,4 (1890) |
| NariQ 2,5-bit (8,4 GB) | 41,9 (47,3) | 60,2 (148) | 96,5 (463) | 91,8 (2525) | 81,3 (1866) |
| NariQ 2-bit (6,8 GB) | 28,6 (32,3) | 52,4 (129) | 86,0 (413) | 90,6 (2491) | 80,9 (1856) |

En DeepSWE, la proporción media de tests nuevos superados por tarea fue del 83,1 % (BF16), 82,9 % (3 bits), 83,2 % (2,5 bits) y 77,2 % (2 bits). Un timeout del verificador BF16 en la ronda 3 se contabilizó como cero (338 de 339 ensayos calificados); todas las variantes NariQ tuvieron los 339 ensayos calificados. La model card incluye además gráficas de divergencia KL frente a BF16 sobre trazas de agente retenidas y comparaciones con resultados publicados de Unsloth (Dynamic V3.1, arnés mini-swe-agent), que no son directamente comparables por usar arneses distintos.

## Requisitos de hardware

- VRAM con proyector visual incluido: 3 bits, ≈135K de contexto en 24 GB y ≈30 GB a contexto completo de 262K; 2,5 bits, ≈160K en 24 GB y ≈28 GB a 262K; 2 bits, ≈184K en 24 GB y ≈27 GB a 262K.
- GPU recomendadas: NVIDIA RTX PRO 6000 (Blackwell) para las velocidades reportadas; RTX 4090 u otras GPU de 24 GB para el modo de contexto reducido; 32 GB o más para contexto completo.
- Requisito de driver: NVIDIA driver 570 o superior en Linux para el script de arranque rápido.
- Cabe en GPU de consumo: sí, en GPU de 24 GB con contexto de ≈135K (3 bits), ≈160K (2,5 bits) o ≈184K (2 bits).
- Despliegue: obligatorio el fork de llama.cpp de nari-labs (llama-server, binarios precompilados, imagen Docker). No es compatible con llama.cpp upstream, Ollama, vLLM ni TGI según la información disponible.
- Velocidad de decodificación: la model card incluye una tabla de tokens/s en una RTX PRO 6000 (sesión única, 512 tokens de salida greedy) que compara NariQ 3,0/2,5/2,0 bpw con UD-IQ3_XXS (10,9 GB); los valores numéricos de esa tabla están truncados en la información proporcionada y no se reproducen aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DeepSWE v1.1 | Terminal-Bench 2.1 | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-27B BF16 | 26,9B | 262.144 | 39,8 | 62,6 | Apache 2.0 | safetensors |
| NariQ 3,0 bpw (este) | 26,9B | 262.144 | 41,0 | 63,8 | Apache 2.0 | GGUF |
| NariQ 2,5 bpw (este) | 26,9B | 262.144 | 41,9 | 60,2 | Apache 2.0 | GGUF |
| UD-IQ3_XXS (10,9 GB) | 26,9B | 262.144 | no disponible | no disponible | Apache 2.0 | GGUF |
| Unsloth Dynamic V3.1 | 26,9B | 262.144 | solo gráfica (arnés distinto) | solo gráfica (arnés distinto) | Apache 2.0 | GGUF |

La comparación con UD-IQ3_XXS y Unsloth Dynamic V3.1 solo está disponible de forma gráfica o parcial en la model card; no se ofrecen cifras numéricas completas para esos competidores en la información proporcionada. Los resultados de Unsloth usan el arnés mini-swe-agent y no son directamente comparables con los de NariQ (Claude Code CLI).

## Limitaciones y advertencias

- Requiere obligatoriamente el fork de llama.cpp de nari-labs; no funciona con llama.cpp upstream ni con otros motores de inferencia según la información disponible.
- La variante de 2 bits degrada notablemente el rendimiento: DeepSWE cae a 28,6 % (frente a 39,8 % en BF16) y AIME a 86,0 % (frente a 97,7 %). No se recomienda para tareas de agente o matemáticas exigentes.
- El rendimiento en MGSM desciende de forma monótona con la compresión: 94,0 % (BF16), 93,1 % (3 bits), 91,8 % (2,5 bits), 90,6 % (2 bits); relevante para despliegues multilingües.
- Los benchmarks de agente se midieron con un arnés concreto (Claude Code CLI, thinking mode, effort máximo); el rendimiento puede variar con otros arneses o configuraciones de muestreo.
- Riesgo de alucinación y sesgos: no se documentan en la model card; aplican los del modelo base Qwen3.8-27B, no disponibles en la información proporcionada.
- La lista completa de idiomas soportados no está disponible; el benchmark MGSM cubre 11 idiomas sin especificar cuáles.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del fork de llama.cpp.
- El contexto completo de 262K requiere ≈27–30 GB de VRAM; en GPU de 24 GB hay que reducir el contexto o compartir GPU con el display.
- No hay datos publicados sobre latencia o throughput fuera de la tabla truncada de la RTX PRO 6000.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp requerido: https://github.com/nari-labs/nari-llama.cpp
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26157
- Referencia adicional citada en tags (arXiv): https://arxiv.org/abs/2406.11235
- Script de arranque rápido: https://github.com/nari-labs/nari-llama.cpp/releases/download/b12431-nariv0/run.sh
- Discord de nari-labs: https://discord.gg/KcqgP95aeh
