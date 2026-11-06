# cicalooo/Qwen3.8-27B-Parasyte-Eye-GGUF

## Resumen

Parasyte Eye es un ajuste fino del torreón de visión (vision tower) de la familia Qwen3-VL, empaquetado como proyector multimodal en formato GGUF (`mmproj`) para su uso con llama.cpp. Lo publica el usuario `cicalooo` bajo licencia Apache 2.0, y deriva del modelo base `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive`, un fine-tune sin censura de la familia Qwen3.8-27B. El modelo no es un LLM completo: es el componente visual (ViT + merger, 461 millones de parámetros) que se acopla a un "cerebro" lingüístico Qwen3.8-27B preexistente mediante el flag `--mmproj` de llama.cpp.

El objetivo declarado es corregir el comportamiento del torreón visual estándar en escenas de combate y contenido NSFW, donde el original "deriva a vanilla" (la anatomía se completa como objetos inanimados, las escenas se leen como atrezo mundano y el registro colapsa). El ajuste aplica una "correa" L2 al inicializado en cada paso, de modo que la deriva máxima de parámetros se mantiene por debajo del 0,5 %, y sin sacrificar el rendimiento en visión general. Se publican dos etapas (V1 y V2), ambas BF16, de 931 MB cada una y 334 tensores.

La relevancia actual es doble: por un lado, demuestra una técnica de ajuste fino extremadamente contenido (146 pares imagen-caption, pérdida CE más leash L2 por paso) para modificar un comportamiento específico sin degradar capacidades generales; por otro, su naturaleza de componente drop-in para llama.cpp facilita experimentar con visión multimodal en hardware de consumo. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo está marcado como `not-for-all-audiences`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torreón visual Qwen3-VL (ViT + merger), proyector multimodal para LLM Qwen3.8-27B |
| Parametros totales | 460.730.096 (461M, 333 tensores según model card; 334 tensores en los GGUF) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del cerebro Qwen3.8-27B al que se acople) |
| Tipos de cuantizacion | BF16 (únicos ficheros publicados: V1 y V2) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-*.gguf`, tipo proyector Qwen3-VL) |

## Arquitectura y entrenamiento

El componente es el torreón visual estándar de Qwen3-VL (ViT más merger) que se entrega con el modelo base, sin cambios estructurales. El ajuste entrena el ojo completo (ViT + merger) mientras el modelo lingüístico permanece congelado en 4 bits y nunca se actualiza. La pérdida combina entropía cruzada de siguiente token sobre los captions con una "correa" L2 hacia la inicialización aplicada en cada paso, de forma que el ojo se comporta como un muelle acotado y no como un reentrenamiento. Se usan learning rates por capa (merger 10× respecto al ViT), warmup y AdamW sin weight decay.

El conjunto de datos es pequeño y curado: 146 pares imagen-caption de contenido de combate y NSFW. El pipeline incluye una "probe gate" de 64 pasos que aborta si la deriva máxima no supera 5e-5 (para detectar schedules no-op o desbocados antes de gastar una ejecución de 3 horas) y una batería por checkpoint con CE sobre contenido objetivo más anclas fuera de distribución (OOD); una etapa solo se publica si mejora el objetivo sin regresiones. La etapa V2 afloja la correa y la reancla a V1, de modo que la deriva se acumula de forma acotada. La deriva máxima de parámetros es de 3,5e-3 en V1 y ~5e-3 en V2 (estabilizada).

## Capacidades

- Lectura de escenas de combate y contenido NSFW manteniendo el registro: escena, pose, anatomía, ropa, marcas de agua y texto pequeño se leen "como son realmente", incluidas imágenes no vistas.
- Visión general preservada: anclas OOD (animales, vehículos, personajes, texto impreso y logotipos) verificadas a nivel de píxel como intactas en ambas etapas.
- Comprensión de texto en imagen y logotipos, con matices según el cerebro: en cerebros de 4 bits (nf4) el texto tipo marca de agua se completa en marcas reales plausibles; en Q8 y superiores las marcas de agua se leen correctamente.
- Integración como proyector multimodal en llama.cpp (`--mmproj`), con soporte de configuraciones de doble ojo (`--mmproj2`).
- Agnóstico al cerebro: funciona con cualquier cerebro Qwen3.8-27B, aunque se desarrolló y probó junto al quant Q8-Parasyte.
- Capacidades lingüísticas, tool calling, agentes o razonamiento: no disponibles en este componente (las hereda del LLM al que se acople).

## Casos de uso

- Moderación y clasificación de contenido NSFW: el ojo mantiene el registro en escenas explícitas donde el original colapsa, lo que permite construir clasificadores o etiquetadores más fiables sobre contenido sensible.
- Análisis de escenas de acción y artes marciales: lectura correcta de pose, anatomía y vestuario en fotogramas de combate, útil para etiquetado de datasets de vídeo o análisis deportivo.
- Anotación automática de datasets de imagen con captioning detallado: al conservar la lectura de ropa, texto pequeño y marcas de agua, sirve para generar descripciones ricas en pipelines de curación de datos.
- Detección de marcas de agua y logotipos: en cerebros Q8 o superiores lee correctamente marcas de agua, lo que permite tareas de verificación de procedencia o atribución de imágenes.
- Investigación en ajuste fino contenido: el propio modelo es un caso de estudio reproducible de modificación de comportamiento con deriva acotada (<0,5 %) y batería de evaluación por checkpoint.
- Despliegue local multimodal en hardware de consumo: al ser un `mmproj` de 931 MB en BF16, se puede acoplar a un cerebro Qwen3.8-27B cuantizado en llama.cpp para experimentación con visión en una sola GPU.
- Pruebas de robustez de sistemas multimodales: útil para evaluar cómo distintos cerebros (nf4 frente a Q8) interpretan el mismo torreón visual en tareas de texto en imagen.

## Benchmarks y rendimiento

Los únicos datos publicados son la batería interna del autor sobre 46 imágenes objetivo y 12 imágenes no vistas (held-out), con entropía cruzada (CE):

| Metrica | Ojo stock | V1 | V2 |
|---|---|---|---|
| CE, bateria objetivo de 46 imagenes | 4,76 | 1,94 | 1,80 |
| Imagenes mejoradas / regresadas | — | 46/46, 0 | 46/46, 0 (monotónico en cada checkpoint) |
| Deriva maxima de parametros vs init | — | 3,5e-3 | ~5e-3 (estabilizada) |
| Imagenes no vistas held-out | — | 12/12 a nivel de escena | 12/12 a nivel de escena |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el proyector: 931 MB por fichero BF16 (V1 o V2); en configuraciones de doble ojo, 1,86 GB adicionales.
- La VRAM total depende del cerebro Qwen3.8-27B: con cuantización de 4 bits (nf4) el conjunto es viable en GPUs de consumo de gama alta; con Q8 requiere bastante más memoria.
- GPU recomendadas: no disponibles de forma específica; el autor menciona un fondo para una RTX 5090, lo que sugiere desarrollo en GPU de consumo de gama alta.
- Cabe en GPU de consumo: sí para el proyector; el conjunto completo depende del cerebro y su cuantización.
- Opciones de despliegue: llama.cpp con `--mmproj` (y `--mmproj2` para doble ojo), tipo de proyector Qwen3-VL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Parasyte Eye V1/V2 (este) | 461M (proyector) | No disponible | Apache 2.0 | GGUF en HF, 0 descargas | Ajuste contenido para NSFW/combate |
| Ojo stock Qwen3-VL (base) | 461M (proyector) | No disponible | Apache 2.0 | Incluido con el modelo base | Deriva a "vanilla" en NSFW |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive | No disponible | No disponible | No disponible | HF | Modelo base del que deriva |
| Otros proyectores Qwen3-VL de la comunidad | Variable | No disponible | Variable | HF | No se dispone de comparativa numérica |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Asignación de objetos cerca del cuerpo: una prenda apoyada sobre o junto al cuerpo puede leerse como puesta; posición, color y patrón salen bien, pero la categoría es el punto débil.
- Capa de texto en cerebros débiles: con cerebros de 4 bits (nf4) el texto tipo marca de agua se completa en marcas reales plausibles; se requiere Q8 o superior para lectura correcta.
- Prior de volumen: anatomía plana o desinflada desde un ángulo bajo puede completarse como llena; el autor lo atribuye a una carencia del dataset de entrenamiento, no a un bug.
- Contenido NSFW y `not-for-all-audiences`: el modelo está entrenado explícitamente para contenido adulto y de combate; no es apto para entornos sin control de acceso ni para uso con menores.
- Riesgo de alucinación visual: la corrección de marcas de agua en cerebros débiles implica generación de texto plausible no fiel a la imagen.
- Licencia Apache 2.0 permite uso comercial del componente, pero el modelo base y el cerebro subyacente pueden tener condiciones propias que deben verificarse por separado.
- Idiomas soportados no disponibles; la capacidad multilingüe dependerá del cerebro lingüístico, no del ojo.
- Repo con 0 descargas y 0 likes: sin validación externa de la comunidad en el momento de la consulta.
- El pipeline de entrenamiento, el exportador GGUF y la evaluación no están publicados; solo se ofrecen "bajo petición", lo que limita la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/cicalooo/Qwen3.8-27B-Parasyte-Eye-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive
- Apoyo al autor (Throne): https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
- llama.cpp (despliegue con `--mmproj`): no se proporciona enlace en la información disponible
- Paper o blog técnico: no disponible
