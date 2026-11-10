# erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k2

## Resumen

`dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k2` es un checkpoint de entrenamiento de un *drafter* de decodificación especulativa (speculative decoding), no un modelo de lenguaje completo. Lo publica el usuario `erdem-erdem` en Hugging Face como parte de la familia `dyn-spec` y del port del generador DFlash. Se trata de un adaptador LoRA con rango 32 (`attn-r32`) entrenado durante 1500 actualizaciones sobre un drafter base `z-lab/Qwen3-8B-DFlash-b16`, cuyo modelo objetivo (*target*) es `Qwen/Qwen3-8B`.

El propósito del artefacto es servir como material de entrenamiento y reproducibilidad: el repositorio incluye el directorio `run/` con el estado del optimizador (`checkpoint.pt`), registros de métricas, tiempos, comandos de entrenamiento, un parche `speculators.patch` y un directorio `provenance/` con la identidad del almacén de activaciones, el registro del extractor y la procedencia del lanzamiento de vLLM. El autor indica explícitamente que no es un paquete de servicio (*serving bundle*), ya que la exportación de servicio DFlash todavía no se ha portado.

La relevancia de este checkpoint es acotada y de nicho: interesa a quienes investigan o reproducen técnicas de decodificación especulativa, en concreto el entrenamiento de *drafters* mediante LoRA sobre activaciones almacenadas. No es un modelo para uso directo en inferencia ni para aplicaciones de usuario final, y no debe confundirse con el modelo objetivo Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, `attn`) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo `Qwen/Qwen3-8B` |
| Parametros totales | no disponible (el repo pesa 13.2 GB e incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (según el identificador del run y el almacén de activaciones `dyn-spec-dflash-store-qwen3-8b-4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) más ficheros JSON de métricas, procedencia y `MANIFEST.json`; no incluye GGUF ni safetensors de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre las capas de atención de un drafter DFlash, que a su vez se apoya en `Qwen/Qwen3-8B` como modelo objetivo. El entrenamiento se realizó en la etapa `pretraining` de la rama `direct` del port del generador DFlash, con 1500 actualizaciones, semilla 42 y un almacén de activaciones de 4k de contexto (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). El repositorio conserva el estado del optimizador, lo que permite reanudar o auditar el entrenamiento.

La validación se hizo sobre 200 filas fijas (2 filas por LoRA) con la métrica `full_acc`. Los resultados muestran que el entrenamiento no mejora al punto de partida: en la actualización 0 la puntuación fue 0.5173 (τ = 7.047) y en la 1500 fue 0.5145 (τ = 7.046). Por categorías, chat pasó de 0.3192 a 0.3153, code de 0.5602 a 0.5571, math de 0.6817 a 0.6786 y stem de 0.5081 a 0.5072. Es decir, un ligero descenso en todas las categorías, lo que sugiere que este run concreto no aporta ganancia medible sobre el drafter base en la validación reportada. El autor incluye además evaluaciones offline en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14) con métricas por fila.

## Capacidades

- Entrenamiento y reproducción de un drafter de decodificación especulativa sobre Qwen3-8B.
- Adaptación LoRA de rango 32 sobre capas de atención para el drafter DFlash.
- Conservación de estado del optimizador para reanudar o auditar el entrenamiento.
- Registro de procedencia completo: identidad del almacén de activaciones, extractor, lanzamiento de vLLM y registros de llenado.
- Evaluación offline con métricas por fila (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14).
- No es un modelo de generación de texto, código, matemáticas ni visión por sí mismo; no soporta tool calling ni agentes de forma directa.
- No incluye exportación de servicio (*serving bundle*): la exportación DFlash de servicio no está portada.

## Casos de uso

- Reproducción de experimentos de decodificación especulativa: el repositorio incluye `train_command.txt`, `speculators.patch` y el estado del optimizador, lo que permite replicar el run `direct`/`pretraining` con 1500 actualizaciones y semilla 42.
- Auditoría de procedencia: `provenance/store/` y `MANIFEST.json` permiten verificar la identidad del almacén de activaciones, el extractor y el lanzamiento de vLLM, así como el SHA256 de cada fichero.
- Estudio de la eficacia de LoRA de rango 32 en drafters: los resultados de validación (200 filas fijas, 2 por LoRA) permiten comparar el punto de partida con la actualización 1500 y analizar por qué no hay ganancia.
- Análisis de evaluaciones offline: `run/offline_eval/` contiene métricas por fila para reproducir los cálculos de coeficientes M4, donantes M7, similitud D13 y coste D14.
- Base para futuros runs de la familia `dyn-spec`: el checkpoint sirve como punto de partida para continuar el entrenamiento o para comparar con otras ramas del port DFlash.
- Investigación sobre decodificación especulativa en contexto de 4k: el almacén de activaciones asociado está dimensionado a 4k, lo que acota los escenarios de estudio a esa longitud.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación interna del run sobre 200 filas fijas (2 filas por LoRA) con la métrica `full_acc`:

| Actualizacion | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5173 | 7.047 | 0.3192 | 0.5602 | 0.6817 | 0.5081 |
| 1500 | 0.5145 | 7.046 | 0.3153 | 0.5571 | 0.6786 | 0.5072 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- El artefacto es un checkpoint de entrenamiento de 13.2 GB que incluye estado del optimizador; no está pensado para inferencia directa.
- Para usarlo como drafter sería necesario portar la exportación de servicio DFlash, que el autor indica que no está disponible.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible para este artefacto; el repositorio solo registra procedencia del lanzamiento de vLLM durante la extracción de activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otros checkpoints de drafter DFlash comparables con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable directamente: es un checkpoint de entrenamiento de un drafter, no un *serving bundle*.
- El entrenamiento no mejora la validación: `full_acc` baja de 0.5173 a 0.5145 entre la actualización 0 y la 1500, con descensos en todas las categorías (chat, code, math, stem).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas soportados no disponibles.
- Contexto acotado a 4k según el identificador del run y el almacén de activaciones.
- El repositorio incluye estado del optimizador y procedencia, lo que aumenta el tamaño (13.2 GB) y no está optimizado para despliegue.
- Riesgo de alucinación y sesgos: no evaluables, ya que el artefacto no genera texto por sí mismo.
- Dependencia de la versión concreta del drafter base (`z-lab/Qwen3-8B-DFlash-b16@9b41424b...`) y del modelo objetivo Qwen3-8B; cambios en estos pueden invalidar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k2
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16 (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
