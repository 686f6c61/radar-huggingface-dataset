# hermitdave/Hy-Memory-30B-A3B-MLX-Mixed4-6

## Resumen

Hy-Memory-30B-A3B-MLX-Mixed4-6 es una conversión comunitaria a formato MLX del modelo tencent/Hy-Memory-30B-A3B, desarrollado por Tencent Hunyuan y publicado bajo licencia Apache-2.0. No es un modelo de chat generalista: está diseñado específicamente como "escritor de memoria" (*memory writer*). Recibe una conversación como entrada, decide qué información merece conservarse (nombres, preferencias, restricciones, hechos recurrentes) y la devuelve como JSON limpio para frameworks de memoria externos como Mem0, MemOS o Hy-Memory. La conversión, cuantización y evaluación las firma Hermes Agent usando mlx-lm 0.31.3, y el adaptador de arquitectura `hy_v3` para MLX procede originalmente de QwQbb.

El modelo base es un MoE de 30.064.725.888 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, lo que le permite mantener una velocidad de decodificación alta en relación con su tamaño. La ventana de contexto es de 262.144 tokens. Esta versión concreta aplica cuantización mixta 4/6 bits (4,83 bits por peso) sobre la receta `mixed_4_6` de MLX-LM, con un peso en disco de 17 GB frente a los 30 GB de la versión de 8 bits y los 56 GB del checkpoint bf16 original.

Su relevancia actual está en la ruta de escritura de memoria (*write path*) de agentes y asistentes: en lugar de usar un modelo frontera generalista para extraer hechos de cada turno de conversación, este modelo ofrece una alternativa especializada y mucho más barata de ejecutar, con una recall de extracción reportada del 100% (70 de 70 hechos en 15 casos de prueba) y una degradación de perplejidad de solo el 0,94% respecto a la cuantización de 8 bits. Está pensado para ejecutarse en Apple Silicon, no en GPUs NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only de la familia `hy_v3` (HYV3ForCausalLM), implementación MLX con `trust-remote-code` |
| Parametros totales | 30.064.725.888 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX mixed 4/6-bit (4,83 bits por peso), group size 64, modo affine, esquema RTN; receta `mixed_4_6` equivalente lógica a Q4_K_M de llama.cpp |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (librería `mlx`); incluye `hy_v3.py` propio |
| Tamano del repositorio | 18,2 GB (pesos cuantizados: 17 GB) |
| Modelo base | tencent/Hy-Memory-30B-A3B (relación: quantized) |
| Librería de inferencia | mlx-lm 0.31.3 |
| Temperatura recomendada | 0,0 (extracción determinista) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con mezcla de expertos (MoE), identificado internamente como `hy_v3` y expuesto mediante la clase `HYV3ForCausalLM`. La arquitectura no está todavía integrada en MLX-LM, por lo que el repositorio incluye su propio archivo `hy_v3.py` (239 líneas, sin más función que definir el modelo) que se carga con `trust-remote-code`. El adaptador MLX fue escrito originalmente por QwQbb para la conversión de Hy-MT2 y se reutilizó aquí con una corrección `stop_gradient` sobre los índices del router, de modo que la arquitectura queda en principio entrenable. Los expertos tienen anchura 768; la model card señala que el campo `moe_intermediate_size: 1536` del config original contradice los pesos reales del checkpoint, y que `rope_theta` se movió a un bloque anidado `rope_parameters`. Ambas correcciones están aplicadas en el `config.json` de este repositorio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO para el modelo base. Lo que sí se detalla es el proceso de cuantización: los pesos se convierten capa por capa desde la fuente bf16 (en lugar de cargar el modelo completo, porque un checkpoint de 56 GB no cabe junto a una copia cuantizada en una máquina de 64 GB). La asignación de precisión sigue la receta `mixed_4_6` de MLX-LM: `q_proj`, `k_proj`, `o_proj`, las proyecciones de expertos `gate_proj` y `up_proj`, y las equivalentes del MLP compartido se quedan en 4 bits; `v_proj`, `down_proj` (densa, de expertos y compartida) y `lm_head` suben a 6 bits en las capas `[0–5, 42–47, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41]`; el router y los embeddings permanecen en 4 bits.

## Capacidades

- Extracción de hechos explícitos de una conversación: nombres, ubicaciones, ocupación, preferencias, restricciones y hechos recurrentes.
- Generación de salida estructurada en JSON (por ejemplo, un objeto con una lista `memories` de cadenas autocontenidas).
- Escritura de memoria para frameworks externos: Mem0, MemOS y Hy-Memory, entre otros.
- Comprensión de conversaciones multi-turno dentro de una ventana de 262.144 tokens.
- Generación de texto conversacional, aunque su uso previsto no es el diálogo abierto.
- Multilingüe limitado a inglés y chino.
- No se documenta soporte de *tool calling* ni *function calling*: no disponible.
- No se documenta comportamiento de agente autónomo ni razonamiento multi-paso: no disponible.
- No dispone de visión, audio ni modo *thinking*: no disponible.

## Casos de uso

- Memoria a largo plazo en asistentes conversacionales: el modelo se coloca en la ruta de escritura de un framework como Mem0 o MemOS, recibe cada turno o cada resumen de sesión y devuelve en JSON los hechos que deben persistir en la base de memoria vectorial, sin necesidad de invocar un modelo frontera para esa tarea.
- Personalización persistente del usuario: extrae de forma fiable preferencias estables (por ejemplo, "el usuario es vegetariano" o "prefiere respuestas concisas con ejemplos de código") que después se inyectan como contexto en las respuestas de un LLM generalista.
- Agentes multi-turno con historial largo: gracias a los 262.144 tokens de contexto, puede procesar sesiones extensas completas en una sola pasada y consolidar la memoria al final de la sesión en lugar de ir acumulando llamadas parciales.
- Enriquecimiento de perfiles en soporte técnico y CRM: a partir de transcripciones de tickets, extrae restricciones del cliente, versiones de software, configuraciones y decisiones tomadas, y las almacena como hechos consultables para el siguiente agente que atienda el caso.
- Documentación de decisiones y actas: procesa reuniones o hilos de discusión internos y devuelve las decisiones y compromisos explícitos en formato estructurado, apto para volcarse a una herramienta de gestión.
- Preprocesado de datos para entrenamiento o evaluación: puede usarse como extractor por lotes para etiquetar conversaciones con hechos estructurados, generando datasets de memoria a partir de corpus en inglés o chino.
- Procesamiento local con privacidad: al ejecutarse con MLX sobre Apple Silicon, permite hacer extracción de memoria en el propio portátil o equipo de escritorio del usuario, sin enviar la conversación a una API externa, algo relevante cuando el contenido incluye datos personales.
- Sincronización de memoria entre sesiones de un asistente de escritorio: un cliente nativo para macOS puede cargar el modelo cuantizado de 17 GB y ejecutar la escritura de memoria en segundo plano a unos 65 tokens por segundo sin bloquear la interfaz.

## Benchmarks y rendimiento

La model card solo publica métricas de calidad de cuantización y de extracción, no evaluaciones estándar de conocimiento o razonamiento. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | Mixed 4/6 | 8-bit |
|---|---|---|
| Tamano | 17 GB | 30 GB |
| Bits por peso | 4,83 | 8,0 |
| Perplejidad (wikitext-2) | 14,923 | 14,783 |
| Delta frente a 8-bit | +0,94% | — |
| KL por token frente a 8-bit | 0,0994 | — |
| Acuerdo top-1 | 86,08% | — |
| Recall de extracción (15 casos / 70 hechos) | 100% | 100% |
| Tiempo de carga | 3,3 s | 7,0 s |
| Decodificación (M3 Max, 64 GB) | ~65 tok/s | ~51 tok/s |

Desglose adicional de la divergencia: segmentando por la confianza del modelo de referencia de 8 bits, ambos modelos coinciden el 100% de las veces cuando la referencia estaba segura (probabilidad top-1 mayor que 0,9, el 27% de las posiciones). Solo 3 de 2.040 posiciones discreparon en ese régimen; el resto de la divergencia se concentra en la cola de distribuciones casi uniformes, donde la propia referencia no está segura.

## Requisitos de hardware

- Almacenamiento: 17 GB de pesos cuantizados y 18,2 GB de repositorio completo.
- Plataforma: MLX solo se ejecuta en Apple Silicon; no hay soporte CUDA, ROCm ni CPU x86 documentado para este formato.
- GPUs compatibles: no se documentan GPU NVIDIA ni AMD. El hardware de referencia de la model card es un Apple M3 Max con 64 GB de memoria unificada.
- Cabe en consumo: sí, con memoria unificada de 32 GB o superior es plausible, ya que los pesos ocupan 17 GB; la model card solo confirma el funcionamiento en un equipo de 64 GB. No se especifica el requisito mínimo exacto de memoria.
- Comparativa de huella: la versión de 8 bits ocupa 30 GB y el checkpoint bf16 de origen, 56 GB, que no cabe junto a una copia cuantizada en una máquina de 64 GB.
- Despliegue: `mlx-lm` mediante `load` y `stream_generate`; servidor compatible con la API de OpenAI con `mlx_lm.server --model hermitdave/Hy-Memory-30B-A3B-MLX-Mixed4-6 --port 8080`. No se proporcionan GGUF, builds para vLLM, TGI, Ollama ni llama.cpp.
- Latencia y rendimiento: 3,3 s de carga y aproximadamente 65 tokens por segundo en decodificación sobre M3 Max de 64 GB. La versión de 8 bits tarda 7,0 s en cargar y rinde a unos 51 tok/s en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Tamano en disco | Perplejidad (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Hy-Memory-30B-A3B-MLX-Mixed4-6 | 30.064.725.888 | ~3B | 262.144 | 17 GB | 14,923 | Apache-2.0 | HuggingFace, formato MLX, `trust-remote-code` |
| Hy-Memory-30B-A3B (MLX 8-bit) | 30.064.725.888 | ~3B | 262.144 | 30 GB | 14,783 | Apache-2.0 | Conversión MLX de referencia usada en la comparación |
| Hy-Memory-30B-A3B (bf16 original) | 30.064.725.888 | ~3B | 262.144 | 56 GB | no disponible | Apache-2.0 | tencent/Hy-Memory-30B-A3B |

No se dispone de datos comparativos frente a otros extractores de memoria o modelos especializados de la misma categoría en la información disponible. La model card menciona de forma genérica que el modelo es más barato en la ruta de escritura que un generalista frontera, pero no aporta cifras de modelos alternativos concretos.

## Limitaciones y advertencias

- No es un modelo de chat: es un escritor de memoria. Sustituirlo por un LLM generalista en tareas de respuesta o de recuperación no es su uso previsto; está pensado para ir acompañado de otro modelo.
- Arquitectura personalizada: requiere `trust-remote-code` y el archivo `hy_v3.py` incluido en el repositorio, que no forma parte de MLX-LM. Hay que revisar ese código antes de ejecutarlo en entornos con requisitos de seguridad estrictos.
- Solo inglés y chino. No hay soporte declarado de español ni de otros idiomas, por lo que la extracción en castellano no está validada.
- Riesgo de alucinación si el prompt no restringe explícitamente la inferencia; la model card recomienda instruir al modelo para no inferir ni inventar información y usar temperatura 0,0 para forzar determinismo.
- La evaluación publicada es muy limitada: 15 casos y 70 hechos para el recall de extracción, más perplejidad y KL sobre wikitext-2. No hay evaluación en tareas de conocimiento, razonamiento ni código, ni una comparación con extracción hecha por modelos generalistas.
- Advertencia de licencia: aunque el modelo base es Apache-2.0 y la conversión también declara esa licencia, se trata de una conversión comunitaria y no de una publicación oficial de Tencent. La model card lo indica explícitamente y no ofrece garantías.
- Cero descargas y cero valoraciones en el momento de redactar esta ficha, con fechas de creación y actualización del 16 de octubre de 2026 separadas por 12 minutos: es una conversión reciente y con poca validación externa independiente.
- Restricciones de plataforma: al ser un formato MLX, no se puede desplegar en infraestructura con GPUs NVIDIA o AMD sin volver a convertir los pesos.
- El repositorio aplica dos correcciones manuales al `config.json` del modelo base (anchura real de los expertos y ubicación de `rope_theta`); cualquier otra herramienta que cargue el modelo base sin esas correcciones puede comportarse de forma distinta.
- Los 262.144 tokens de contexto son una capacidad heredada del modelo base; la propia model card reconoce que la escritura de memoria no necesita una ventana tan grande, por lo que cargarla no aporta ventajas en ese caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Hy-Memory-30B-A3B-MLX-Mixed4-6
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Artículo (paper): https://arxiv.org/pdf/2610.22196
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Adaptador `hy_v3` para MLX (autor original): https://huggingface.co/QwQbb
- Conversión, cuantización y evaluación: https://hermes-agent.nousresearch.com

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos trataban de temas sin relación (astronomía, topología y una guía de videojuegos), por lo que todos los enlaces anteriores proceden de la información de HuggingFace y de la model card.
