# guideboardlabs/Voltron-1-Mini-GGUF

## Resumen

Voltron-1 Mini GGUF es la versión cuantizada en formato GGUF de Voltron-1 Mini, un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B desarrollado por Akahsizrr (@RoliumGens). La conversión y cuantización la ha realizado Guideboard Labs para permitir su ejecución en GPUs de consumo, manteniendo la misma arquitectura, tokenizador y plantilla de chat del modelo base. El modelo original se publicó en BF16 safetensors el 13 de noviembre de 2026 sin ninguna versión GGUF disponible.

El modelo cuenta con 1.728.801.600 parámetros totales (aproximadamente 1,73 mil millones) y está orientado a tareas de código y matemáticas, con soporte de modo de razonamiento (thinking) activado por defecto en la plantilla de chat. Su ventana de contexto práctica recomendada es de 32K tokens, aunque el autor indica que 16K funciona y que ventanas menores pueden consumir el presupuesto de generación dentro de la traza de razonamiento, devolviendo respuestas vacías.

La relevancia de esta ficha radica en que ofrece un modelo pequeño (1,1 GB en Q4_K_M) con un rendimiento medido de 135,3 tokens por segundo en decodificación sobre una GPU AMD RX 5700 XT de 8 GB mediante llama.cpp con backend Vulkan, y una mejora documentada de +5,33 puntos sobre el modelo base en el conjunto de evaluación Agon-Bench (66 puntos totales). Es una opción adecuada para entornos con recursos limitados donde priman la velocidad y el tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-1.7B de Liquid AI; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32K recomendado (16K funcional; el autor indica que ventanas menores pueden truncar la traza de razonamiento) |
| Tipos de cuantizacion | Q4_K_M (5,05 BPW) y Q8_0 (8,51 BPW) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (287 tensores; mapa de tipos: 136 q4_K, 18 q6_K, 133 f32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, que a su vez es un modelo de la familia LFM3 de Liquid AI. La model card no proporciona detalles sobre la arquitectura interna del transformer subyacente, la composición del dataset de entrenamiento ni el número de tokens utilizados en el ajuste fino. Tampoco se documenta si hubo etapas de RLHF o DPO. La información disponible confirma que el modelo base se publicó en BF16 safetensors el 13 de noviembre de 2026 y que el ajuste fino fue realizado por Akahsizrr (@RoliumGens).

La innovación técnica destacable de esta publicación es el proceso de conversión y cuantización: se utilizó llama.cpp en la versión 0.7.0-dev (build 50, commit `338fce651`), que incluía localmente el script `conversion/lfm3.py`. Dicho conversor fue integrado posteriormente en el repositorio upstream mediante el PR #31252, fusionado el 27 de octubre de 2026 como commit `19cce69`. El archivo Q4_K_M resultante es un reemplazo directo del cuantizado oficial de Liquid AI: ambos tienen 287 tensores, el mismo mapa de tipos y difieren en solo 352 bytes, lo que permite comparar el ajuste fino contra el modelo base sin que la receta de cuantización introduzca sesgos. El modelo se verificó con una compilación upstream estándar (0.9.0-dev, build 1, commit `3ba1ce0`) sin necesidad de parches.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito mediante modo thinking activado por defecto en la plantilla de chat; la traza se separa en `reasoning_content` y la respuesta final en `content`.
- Generación de código orientada a tareas que caben en un solo archivo: manejo de cadenas, parsers, CLI multiarchivo.
- Tareas matemáticas y de razonamiento (el evento Reason de Agon-Bench mantiene el rendimiento del modelo base con 15,67 sobre 17).
- Tareas de agente (Agent en Agon-Bench: 18,67 sobre 24), lo que sugiere cierta capacidad para flujos multi-paso.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp).
- No se documenta soporte de tool calling o function calling explícito en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Modelo monolingüe: únicamente inglés.

## Casos de uso

- Asistencia de código en local para desarrolladores con GPUs de gama media: con 1,1 GB en Q4_K_M y 135 t/s de decodificación en una RX 5700 XT, el modelo permite autocompletado y generación de funciones en un editor sin depender de la nube, especialmente en tareas acotadas como parsers o utilidades de cadenas.
- Automatización de tareas de refactorización de un solo archivo: el modelo rinde mejor en código que cabe en un archivo, por lo que se puede integrar en scripts que procesen archivos individuales de un repositorio y apliquen transformaciones concretas.
- Generación de scripts de CLI multiarchivo: el evento Code de Agon-Bench (17,67 sobre 25) y la mención explícita del autor a CLI multiarchivo lo sitúan como candidato para generar esqueletos de herramientas de línea de comandos.
- Prototipado rápido de agentes conversacionales: con 18,67 sobre 24 en el evento Agent, puede emplearse como núcleo de un agente ligero en entornos de pruebas donde el coste por inferencia y la latencia importan más que la profundidad de razonamiento.
- Evaluación comparativa de ajustes finos: al ser un drop-in del Q4_K_M oficial de LFM3-1.7B (mismo mapa de tensores, diferencia de 352 bytes), sirve para medir el efecto del fine-tune de forma aislada en pipelines de evaluación propios.
- Despliegue en hardware AMD con Vulkan: el autor documenta su funcionamiento con llama.cpp Vulkan en una RX 5700 XT, lo que lo hace útil en estaciones de trabajo con GPUs AMD donde otras pilas de inferencia no están optimizadas.
- Tareas de razonamiento con traza visible: el modo thinking separado en `reasoning_content` permite auditar el proceso de razonamiento en aplicaciones educativas o de depuración, siempre que se configure una ventana de al menos 16K-32K tokens.

## Benchmarks y rendimiento

Resultados en Agon-Bench (66 puntos totales, tres ejecuciones por evento, comparados contra el modelo base medido en el mismo harness):

| Evento | Máximo | LFM3-1.7B | Voltron-1 Mini | Delta |
|---|---:|---:|---:|---:|
| Agent | 24 | 18,00 | 18,67 | +0,67 |
| Code | 25 | 13,00 | 17,67 | +4,67 |
| Reason | 17 | 15,67 | 15,67 | 0,00 |
| **Total** | **66** | **46,67** | **52,00** | **+5,33** |

El autor precisa que el evento Code se reejecutó con ventana de 32K; con la ventana de 16K del modelo base, Voltron-1 Mini obtuvo 16,67 en Code y un total de 51,01. La comparación equivalente (misma ventana de 16K) arroja una mejora de +4,34 en total. El modelo ocupa el puesto 21 de 36 entradas visibles en el tablero de Agon-Bench.

Rendimiento de inferencia medido en una RX 5700 XT (RDNA1, 8 GB), Ryzen 5 1600, 32 GB de RAM, llama.cpp Vulkan, Q4_K_M:

| Métrica | Valor |
|---|---|
| Decodificación | 135,3 t/s (509k tokens en 66 peticiones, mediana 137,3) |
| Prefill | ~1.700 t/s |
| VRAM | 1,59 GiB con ventana de 32K, 0,28 GiB GTT, sin spill |
| Tiempo de carga | ~2 s |
| Tamaño del archivo | 1,10 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,59 GiB con ventana de 32K en Q4_K_M (medido en RX 5700 XT).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva para Q4_K_M; el autor lo ha validado en AMD RX 5700 XT (RDNA1, 8 GB). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPUs de consumo: sí, con 1,1 GB de pesos en Q4_K_M y 1,85 GB en Q8_0.
- Opciones de despliegue: llama.cpp (validado con backend Vulkan y compilación upstream 0.9.0-dev), llama-server con `-ngl 999 -fa on -c 32768 --jinja`. No se documentan pruebas en vLLM, Ollama ni TGI.
- Latencia y throughput: 135,3 t/s de decodificación y ~1.700 t/s de prefill en la configuración indicada; carga en ~2 s.
- Parámetros de muestreo del `generation_config.json`: temperature 0,1, top_k 50, repetition penalty 1,1. Las evaluaciones del autor usaron temperature 0,6 y top_p 0,95.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Voltron-1 Mini (este) | 1,73B | 32K recomendado | LFM Open License v1.0 | GGUF (Q4_K_M, Q8_0) | Agon-Bench: 52,00/66; 135,3 t/s en RX 5700 XT |
| LiquidAI/LFM3-1.7B | 1,73B (no confirmado en la información disponible) | No disponible | No disponible en la información proporcionada | GGUF oficial Q4_K_M | Modelo base; Agon-Bench: 46,67/66 a 16K |
| Alternativas de ~1,7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa más fiable es contra el modelo base LFM3-1.7B, ya que comparten arquitectura, tokenizador, plantilla de chat y mapa de tensores en Q4_K_M (diferencia de 352 bytes entre archivos). No se han encontrado en la información proporcionada datos de otros modelos de tamaño similar para establecer una comparativa adicional.

## Limitaciones y advertencias

- Modelo pequeño (1,73B): el propio autor advierte que perderá frente a cualquier modelo competente de 7B o superior en tareas abiertas.
- El evento Code de Agon-Bench no es evidencia de capacidad para tareas complejas: en la tarea más difícil del conjunto (un motor de regex desde cero), las tres ejecuciones produjeron scripts que fallan al cargar.
- Ventana de contexto crítica: el modo thinking está activado por defecto y consume muchos tokens (en un prompt trivial de código, 4.860 caracteres de razonamiento y 1.174 tokens de finalización antes de responder). Ventanas pequeñas o límites de `max_tokens` ajustados devuelven respuestas vacías.
- Resultados de benchmark con salvedades: las puntuaciones son automáticas, no revisadas manualmente tarea por tarea; la comparación de Code mezcla ventanas de 16K y 32K, y la cifra equivalente es +4,34 en total, no +5,33.
- Idioma: únicamente inglés; no se documenta soporte multilingüe.
- Licencia: LFM Open License v1.0. La sección 5 limita el uso comercial por entidades que superen el umbral de ingresos de la licencia; es necesario leerla antes de un uso comercial. La redistribución exige conservar el archivo LICENSE.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- No se documenta soporte explícito de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de esa funcionalidad.
- Los checksums SHA-256 de los archivos están publicados en la model card para verificación de integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/guideboardlabs/Voltron-1-Mini-GGUF
- Modelo base del ajuste fino: https://huggingface.co/Akahsizrr/voltron-1-mini
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Cuantizado oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- PR de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Harness y tablero Agon-Bench: https://github.com/GuideboardLabs/agon-arena
- Sitio de Guideboard Labs: https://guideboardlabs.com
