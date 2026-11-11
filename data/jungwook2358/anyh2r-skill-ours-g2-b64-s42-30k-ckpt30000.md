# jungwook2358/anyh2r-skill-ours-g2-b64-s42-30k-ckpt30000

## Resumen
El modelo `anyh2r-skill-ours-g2-b64-s42-30k-ckpt30000` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) entrenado para robótica, publicado en Hugging Face por el usuario jungwook2358. Se trata de una réplica de un experimento de entrenamiento previo (original de junhyeong, fechado el 2026-11-08) dentro del proyecto AnyH2R, cuyo objetivo es el entrenamiento con diversidad de tareas. El checkpoint corresponde al paso 30.000 de entrenamiento, con un batch global de 64 y semilla 42.

El modelo parte de la inicialización RLDX-1-PT-IMG y se ha entrenado con 2 GPUs, sin renovación de instrucciones (instruction renewal off) y con un chunk de 16 acciones. El repositorio incluye los pesos en formato safetensors, la configuración del entrenador, el procesador, las estadísticas del dataset y los activos necesarios para la inferencia (normalizadores, geometría y tokenizador de acciones). No se dispone de información sobre los idiomas soportados, el número de parámetros ni la longitud de contexto.

La relevancia de este checkpoint es limitada fuera del contexto de investigación en robótica: es un artefacto intermedio de un experimento de ablación, no un modelo listo para producción. Su interés radica en la reproducibilidad del entrenamiento VLA y en el contrato de inferencia que define los assets necesarios para desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción), transformer multimodal; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, no especificada) |
| Formato de pesos | safetensors (3 shards + índice) |
| Tamano del repo | 13.9 GB |
| Pipeline | robotics |
| Checkpoint | paso 30.000 |
| Batch global | 64 |
| Semilla | 42 |
| Chunk de acciones | 16 |
| GPUs de entrenamiento | 2 |
| Renovación de instrucciones | desactivada |

## Arquitectura y entrenamiento
El modelo es un VLA (vision-language-action) construido sobre la inicialización RLDX-1-PT-IMG. La arquitectura concreta no se detalla en la model card, pero por la naturaleza del pipeline (robótica) y la presencia de un tokenizador de acciones de 100k (split-decoder action tokenizer), se trata de un transformer multimodal que procesa instrucciones en lenguaje natural junto con observaciones visuales y genera secuencias de acciones discretizadas.

El entrenamiento se realizó con 2 GPUs, batch global 64, semilla 42 y 30.000 pasos, sin renovación de instrucciones. El checkpoint es una réplica exacta de un experimento previo (código, inputs, entorno Python y knobs idénticos, verificados por sha256), difiriendo solo en el propietario de la salida y el nombre del job. El repositorio incluye los estados del optimizador de DeepSpeed y los estados RNG excluidos, así como el `INFERENCE_CONTRACT.json` con normalizadores, assets de geometría y la etiqueta de despliegue, y el `diversity_contract.json` con las especificaciones del dataset. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de acciones robóticas a partir de instrucciones en lenguaje natural y observaciones visuales (VLA).
- Tokenización de acciones mediante un tokenizador dedicado de 100k (split-decoder action tokenizer).
- Procesamiento de instrucciones con chunk de 16 acciones por paso.
- Entrenado con diversidad de tareas (task-diversity), lo que sugiere cierta generalización entre tareas dentro del dataset.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: visión implícita en el pipeline VLA; audio no disponible.

## Casos de uso
- Investigación en aprendizaje por imitación robótico: el checkpoint sirve como punto de partida o referencia para experimentos de VLA con diversidad de tareas, permitiendo reproducir el entrenamiento con los mismos knobs (batch 64, semilla 42, 30k pasos).
- Evaluación de contratos de inferencia: el `INFERENCE_CONTRACT.json` permite desplegar el modelo con los normalizadores y assets de geometría correctos, útil para validar pipelines de inferencia robótica.
- Ablación de diversidad de tareas: al ser una réplica de un experimento controlado, permite comparar el efecto de la diversidad de tareas frente a otras celdas del proyecto AnyH2R.
- Generación de trayectorias de acciones en entornos simulados: el modelo puede producir chunks de 16 acciones condicionados a instrucciones, adecuado para pruebas en simuladores antes de transferir a hardware real.
- Estudio de tokenizadores de acciones: el tokenizador de 100k incluido en el repo permite analizar la discretización de acciones y su impacto en el rendimiento.
- Reproducibilidad de experimentos: los receipts y hashes sha256 permiten verificar que el entorno y los datos coinciden con el experimento original, útil para auditorías de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precisión; el repo de 13.9 GB sugiere que los pesos en fp16 rondan los 13-14 GB, por lo que se necesitarían al menos 16 GB de VRAM para cargar los pesos, más memoria para activaciones y el tokenizador.
- GPU recomendadas: no disponible; por el tamaño del repo, una GPU con 24 GB o más (RTX 3090/4090, A100, H100) sería necesaria para inferencia sin cuantización.
- ¿Cabe en consumer GPU? Posiblemente en RTX 3090/4090 (24 GB) si los pesos caben en fp16, aunque no se confirma.
- Opciones de despliegue: no se especifican; el formato safetensors es compatible con vLLM, TGI y transformers, pero al ser un VLA puede requerir un pipeline personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLA para robótica) con parámetros, contexto o licencia conocidos.

## Limitaciones y advertencias
- Es un checkpoint intermedio de un experimento de investigación, no un modelo final listo para producción.
- La licencia es "other" y no se especifican los términos; es imprescindible contactar con el autor antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, idiomas o riesgos de alucinación; al ser un modelo de acciones, el riesgo principal es la generación de trayectorias incorrectas o inseguras en entornos reales.
- El entrenamiento se realizó con solo 2 GPUs y 30k pasos; la calidad y generalización pueden ser limitadas.
- No hay garantías de reproducibilidad completa: los estados del optimizador y RNG están excluidos del repo.
- El uso en robótica real requiere validación exhaustiva de seguridad antes de desplegar en hardware físico.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.

## Enlaces
- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-skill-ours-g2-b64-s42-30k-ckpt30000
- Repositorio de código referenciado: jun-brro/RLDX-1-egopi (rama feat/anyh2r-diversity-training, commit fc72b51)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
