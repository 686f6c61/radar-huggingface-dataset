# Anjielon/ODINO-397B-v34a-TQ1_0

## Resumen

ODINO 397B v3.4a es una cuantización ternaria TQ1_0 del modelo Ornith-1.5-397B, un Mixture-of-Experts (MoE) de 397 mil millones de parámetros con 512 expertos, desarrollado por ornith-ai. El autor de esta cuantización, Anjielon, la presenta como una alternativa de alta compresión (1.911 bits por peso, 88.2 GiB) frente a la cuantización IQ1_M de llama.cpp, con el objetivo de ejecutar un modelo de gran escala en hardware de consumo, como una APU con 128 GB de memoria unificada.

La relevancia de este modelo radica en su propuesta técnica: utiliza un esquema ternario de dos planos (TQ1_0) que, según las mediciones del autor, supera a IQ1_M en tareas reales de codificación y agente (78.3% frente a 55.2% en una suite de 143 pruebas), a pesar de tener una perplexidad ligeramente peor. Este resultado cuestiona la fiabilidad de la perplexidad como único criterio de selección de cuantizaciones y abre la puerta a explorar representaciones de muy bajo bit para modelos MoE de gran tamaño.

El modelo se distribuye en formato GGUF y se ejecuta mediante llama.cpp, con soporte Vulkan incluido en el PR #27765. La licencia no está especificada, y los idiomas soportados tampoco se indican en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 512 expertos (basado en Ornith-1.5-397B) |
| Parametros totales | 397 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Ornith-1.5-397B tiene 262K tokens) |
| Tipos de cuantizacion | TQ1_0 (ternaria de dos planos, 1.911 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

ODINO 397B v3.4a no es un modelo entrenado desde cero, sino una cuantización del modelo base Ornith-1.5-397B, un MoE con 397 mil millones de parámetros totales y 512 expertos, diseñado para razonamiento agéntico y tareas de ingeniería de software. La cuantización TQ1_0 es un esquema ternario que representa cada peso con valores en {-1, 0, 1} distribuidos en dos planos, logrando una densidad de 1.911 bits por peso y un tamaño final de 88.2 GiB.

El proceso de cuantización se describe en el repositorio "fucina" del autor (github.com/Anjielon/fucina), que incluye un paper titulado "Depth, Not Fidelity: What Decides Whether a Ternary Correction Helps a Mixture-of-Experts". El autor también menciona una rotación de Hadamard sobre bloques completos de 256 pesos que reduciría aproximadamente un 5% del error de reconstrucción al mismo presupuesto de bits, pero que aún no está implementada en el kernel de decodificación. El cuantizador es bit-exacto entre CPU y CUDA, con payloads empaquetados idénticos.

No se dispone de información sobre el entrenamiento del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento: el modelo base Ornith-1.5-397B está orientado a razonamiento agéntico y tareas complejas de ingeniería de software, y esta cuantización preserva esas capacidades según las pruebas del autor.
- Codificación y tareas de agente: en una suite de 143 pruebas emparejadas (con seeds fijos 7 y 42), el modelo resolvió el 78.3% de las tareas, frente al 55.2% de IQ1_M.
- Soporte de tool calling: el modelo base Ornith incluye flujos de tool-calling según la documentación web, aunque no se detalla en la información de esta cuantización.
- Inferencia local en hardware de consumo: gracias a la compresión ternaria, el modelo puede ejecutarse en una APU con 128 GB de memoria unificada o en GPUs con suficiente VRAM.
- No se mencionan capacidades multimodales (visión, audio) ni modos de pensamiento explícitos.

## Casos de uso

- Asistente de codificación local: el modelo puede ejecutarse en una estación de trabajo con APU de 128 GB (por ejemplo, AMD Radeon 8060S) para generar, revisar o refactorizar código sin depender de servicios en la nube, gracias a su tamaño reducido a 88.2 GiB.
- Agentes autónomos: con soporte de tool calling del modelo base, puede integrarse en pipelines de agentes que necesiten razonamiento multi-paso y ejecución de acciones, como automatización de tareas de desarrollo o DevOps.
- Investigación sobre cuantización de bajo bit: el modelo sirve como caso de estudio para comparar esquemas ternarios frente a cuantizaciones tradicionales como IQ1_M, especialmente en modelos MoE de gran escala.
- Despliegue en entornos con restricciones de memoria: al ocupar menos de 90 GiB, puede ejecutarse en configuraciones multi-GPU consumer (por ejemplo, dos RTX 4090 de 24 GB cada una) o en APUs de gama alta, habilitando inferencia local de modelos de 400B.
- Benchmarking de calidad de cuantización: los logs de perplexity, HellaSwag y Winogrande incluidos en el repositorio permiten evaluar el impacto de la cuantización ternaria en tareas estándar.
- Educación y experimentación: el código del "forge" y el paper asociado ofrecen herramientas para reproducir el proceso de cuantización y explorar variantes como la rotación de Hadamard.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de benchmarks comparando ODINO v3.4a con la cuantización IQ1_M de llama.cpp, medidos en la misma máquina y con el mismo corpus (WikiText-2 raw, 72 fragmentos, contexto 4096). No se proporcionan resultados frente al modelo original sin cuantizar ni frente a otros modelos.

| Métrica | ODINO v3.4a (TQ1_0) | IQ1_M (llama.cpp) |
|---|---|---|
| Bits por peso | 1.911 | 1.844 |
| Tamaño | 88.2 GiB | 85.1 GiB |
| Perplexity (WikiText-2, ctx 4096) | 7.5903 ± 0.0525 | 7.5438 ± 0.0512 |
| HellaSwag (2,108 ítems) | 75.85% | 73.86% |
| Winogrande (1,267 ítems) | 65.67 ± 1.33 | 61.09 ± 1.37 |
| Suite de tareas (143 pruebas emparejadas) | 78.3% (112 resueltas) | 55.2% (79 resueltas) |

El autor reporta que la diferencia en la suite de tareas es estadísticamente significativa (exact McNemar p = 5.42e-07, intervalo de confianza al 95% de la diferencia [+14.7, +31.5] puntos). Además, señala que el archivo IQ1_M es un 3.6% más pequeño, por lo que la comparación favorece ligeramente a IQ1_M en tamaño, pero aun así ODINO obtiene mejores resultados en tareas reales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 88.2 GiB para los pesos, más overhead de contexto y activaciones. Se requiere un mínimo de ~92-96 GiB de memoria disponible para inferencia con contexto 4096.
- GPU recomendadas: el modelo fue probado en una APU AMD con 128 GB de memoria unificada (Radeon 8060S) donde corre completamente residente, y en una NVIDIA RTX 4060 (aunque esta GPU no tiene suficiente VRAM para el modelo completo; probablemente se usó para validar los kernels Vulkan, no para ejecutar el modelo entero). Para ejecución completa, se necesitan configuraciones multi-GPU (por ejemplo, 4× RTX 4090 con 24 GB cada una) o APUs con memoria unificada de al menos 96 GB.
- Opciones de despliegue: llama.cpp (llama-server) con soporte Vulkan, tal como se indica en el comando de ejemplo del README: `llama-server -m ODINO-397B-v34a.gguf -ngl 999 --ctx-size 4096`. También podría usarse con backends CUDA, ya que el cuantizador es bit-exacto entre CPU y CUDA.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparativa principal que se puede establecer es con la cuantización IQ1_M de llama.cpp aplicada al mismo modelo base Ornith-1.5-397B, cuyos datos ya se han presentado en la sección de benchmarks. No se dispone de comparaciones con otras cuantizaciones ternarias (como TQ2_0 o similares) ni con el modelo original sin cuantizar.

| Modelo | Parámetros | Tamaño | Bits/peso | Perplexity | Tareas resueltas |
|---|---|---|---|---|---|
| ODINO v3.4a (TQ1_0) | 397B | 88.2 GiB | 1.911 | 7.5903 | 78.3% |
| Ornith-1.5-397B (IQ1_M) | 397B | 85.1 GiB | 1.844 | 7.5438 | 55.2% |
| Ornith-1.5-397B (original, sin cuantizar) | 397B | no disponible | ~16 bits | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría (MoE de ~400B con cuantización de bajo bit).

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las condiciones de uso comercial y redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Perplexity ligeramente peor que IQ1_M (7.59 frente a 7.54), lo que indica que en términos de modelado de lenguaje puro, la cuantización ternaria introduce más error que la cuantización de 1.844 bits/peso. El autor argumenta que esto no se traduce en peor rendimiento en tareas, pero es una advertencia para quienes utilicen perplexity como métrica de selección.
- La suite de tareas utilizada para los benchmarks es privada: solo se publican agregados, no los casos concretos. Esto dificulta la verificación independiente de los resultados.
- El autor declara haber excluido familias de tareas basadas en su propia automatización del hogar, pero no se detalla qué otras tareas se incluyen, por lo que puede haber sesgos no declarados.
- La rotación de Hadamard que reduciría un 5% del error de reconstrucción aún no está implementada en el kernel de decodificación, por lo que el archivo actual no representa el límite teórico de la técnica.
- Los kernels Vulkan están en un pull request pendiente de fusión en llama.cpp (PR #27765), lo que implica que el soporte no está disponible en las versiones estables actuales.
- No se dispone de información sobre sesgos del modelo base, riesgos de alucinación o limitaciones idiomáticas. Dado que la licencia y los idiomas no están documentados, se recomienda precaución en entornos multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anjielon/ODINO-397B-v34a-TQ1_0
- Pull request de llama.cpp para kernels Vulkan TQ1_0: https://github.com/ggml-org/llama.cpp/pull/27765
- Repositorio "fucina" (herramientas y paper): https://github.com/Anjielon/fucina
- Modelo base Ornith-1.5-397B: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Página del modelo Ornith 1.0 397B (documentación web): https://ornith.online/ornith-1-0-model-397b
