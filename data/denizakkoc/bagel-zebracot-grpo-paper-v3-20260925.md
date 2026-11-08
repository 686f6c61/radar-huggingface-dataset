# denizakkoc/BAGEL-ZebraCoT-GRPO-Paper-v3-20260925

## Resumen

BAGEL-ZebraCoT-GRPO-Paper-v3-20260925 es un conjunto de checkpoints de investigación (adaptadores LoRA) entrenados sobre el modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`, que a su vez deriva de la familia BAGEL. El autor, denizakkoc (deniz bilge akkoc), lo publica como archivo experimental de una ejecución de aprendizaje por refuerzo con GRPO sobre un conjunto ordenado de 10.000 ejemplos de razonamiento visual. No es un modelo autónomo ni un export estándar de PEFT: son pesos entrenables en el formato nativo de BAGEL, pensados para reproducir y auditar un experimento concreto.

El interés del artefacto es metodológico más que de producto. Documenta con detalle inusual el cursor de datos, las fechas, el hardware (NVIDIA A100 en CINECA Leonardo), la configuración de recompensas (`counterbalanced-terminal-gated-arc-exact-neither-v3`) y las ramas de entrenamiento, incluyendo la rama Fast64 que se bifurca a los 3.360 ejemplos. La continuación guardada alcanza 8.256 ejemplos, no una época completa de 10.000.

Se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, orientado a inglés y con licencia Apache 2.0. Su relevancia actual es acotada: sirve para estudiar dinámicas de GRPO con LoRA en tareas de razonamiento visual (ARC-AGI, matrices de Raven, ajedrez, laberintos, criptogramas), no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL multimodal (expertos separados de comprensión y generación); adaptación LoRA sobre el modelo base |
| Parametros totales | no disponible (el repo pesa 3,9 GB y contiene 4 checkpoints de pesos entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints son pesos entrenables en formato nativo BAGEL, no GGUF) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de parámetros entrenables de BAGEL (no safetensors estándar de `save_pretrained`, no GGUF); incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo base es BAGEL-ZebraCoT, un modelo multimodal de la familia BAGEL con expertos diferenciados para comprensión y generación. Sobre él se aplica un adaptador LoRA de rango 64 y alpha 128, que adapta ambos expertos. Los checkpoints publicados son los pesos entrenables en el formato original de BAGEL; se excluyen los ficheros de optimizador y RNG. La revisión del base registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`.

El entrenamiento usa GRPO con dos rollouts por prompt y 16 GPUs de política en CINECA Leonardo (A100). El conjunto principal de 10.000 ejemplos cubre 13 categorías: búsqueda visual, puzles, ajedrez, tetris, criptogramas, laberintos, matrices estilo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. La configuración de septiembre empleó 256 px, ocho pasos de difusión y dos candidatos, frente a la de octubre con 512 px, 50 pasos y seis candidatos. La rama principal llega a 8.256 ejemplos guardados; la rama Fast64 se bifurca a los 3.360 ejemplos. El hash de orden del dataset original es `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`.

## Capacidades

- Razonamiento visual sobre imágenes en tareas estructuradas: matrices de Raven, ARC-AGI, laberintos, puzles y búsqueda visual.
- Razonamiento simbólico y algorítmico: criptogramas, ajedrez, tetris, algoritmos de grafos y programación competitiva.
- Razonamiento científico básico: física, geometría y química a nivel de problema.
- Cadena de pensamiento visual (Zebra-CoT) como formato de razonamiento intermedio.
- Generación multimodal heredada del base BAGEL (existen expertos de comprensión y generación adaptados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como funcionalidad de producto; el multi-paso se limita al razonamiento interno del CoT.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación en RL para razonamiento visual: reproducir la curva de entrenamiento GRPO con LoRA sobre el dataset Zebra-CoT usando los cursores y metadatos incluidos, comparando la rama principal con Fast64.
- Auditoría de experimentos: los ficheros `checkpoint_manifest.json` y `training_metadata.json` permiten verificar checksums SHA-256, fechas, semillas y configuración de recompensas de cada checkpoint.
- Estudio de funciones de recompensa: analizar el efecto de `counterbalanced-terminal-gated-arc-exact-neither-v3` frente a linajes con recompensa mixta sobre el mismo conjunto ordenado.
- Evaluación de ARC-AGI y matrices de Raven: usar los checkpoints como punto de partida para medir transferencia en tareas de abstracción visual.
- Ablación de hiperparámetros multimodales: comparar resoluciones (256 px frente a 512 px), pasos de difusión (8 frente a 50) y número de candidatos (2 frente a 6) sobre el rendimiento final.
- Base para ajuste posterior: al ser adaptadores LoRA sobre BAGEL-ZebraCoT, pueden servir como inicialización para nuevos experimentos de RL o SFT en dominios de razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base BAGEL-ZebraCoT completo, no solo del adaptador (el repo de 3,9 GB contiene únicamente los pesos LoRA).
- GPU recomendadas: el entrenamiento se realizó con NVIDIA A100 en CINECA Leonardo; para inferencia se requiere hardware capaz de ejecutar el base BAGEL completo.
- GPU de consumo: no disponible; no se documenta que quepa en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: no disponible para este artefacto; no es un export estándar de PEFT ni un GGUF, por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin conversión previa y carga del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Paper-v3-20260925 | no disponible (LoRA sobre BAGEL) | no disponible | Apache 2.0 | Checkpoints de investigación en HF | Requiere el base `multimodal-reasoning-lab/Bagel-ZebraCoT` |
| multimodal-reasoning-lab/Bagel-ZebraCoT | no disponible | no disponible | no disponible | Modelo base en HF | Modelo base del que dependen estos adaptadores |
| BAGEL (familia original) | no disponible | no disponible | no disponible | Repositorio público del proyecto | Arquitectura multimodal con expertos de comprensión y generación |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base `multimodal-reasoning-lab/Bagel-ZebraCoT` en la revisión `ebce32410ee2062d073feae484ea2c6c1515fba8` y el código personalizado de BAGEL.
- No es un export estándar de PEFT: no funciona con `save_pretrained` ni con pipelines convencionales de Hugging Face sin adaptación.
- Entrenamiento incompleto: la continuación guardada alcanza 8.256 ejemplos de los 10.000 previstos; no representa una época completa.
- Idiomas: solo inglés declarado; sin soporte documentado para castellano.
- Sesgos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; en tareas de razonamiento visual estructurado el riesgo existe pero no se aportan métricas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al depender del modelo base, las condiciones de este último también aplican y no están documentadas aquí.
- Reproducibilidad parcial: los intentos fallidos sin pesos guardados no se pueden reconstruir, según el propio autor.
- Madurez: 0 descargas y 0 likes; sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Paper-v3-20260925
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-ZebraCoT
- Dataset: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Perfil del autor: https://huggingface.co/denizakkoc
- Datasets del autor: https://huggingface.co/denizakkoc/datasets
