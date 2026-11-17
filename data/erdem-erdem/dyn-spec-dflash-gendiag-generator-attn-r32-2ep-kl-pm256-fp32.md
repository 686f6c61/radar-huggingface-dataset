# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-fp32

## Resumen

`dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-fp32` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem en Hugging Face, dentro de la familia de artefactos `speculators`/`dflash`. No es un modelo de lenguaje completo, sino un *drafter* de decodificación especulativa: un adaptador LoRA (rango 32, atención) entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. El nombre codifica la configuración del run: generador de diagnóstico, rango 32, 2 épocas, pérdida KL, `pm256` y precisión fp32.

El artefacto corresponde a la etapa de *pretraining* del brazo `direct` del port del generador DFlash dentro del proyecto dyn-spec, con 2667 actualizaciones y semilla 42. El repositorio (13,3 GB) contiene el directorio de ejecución completo: checkpoint con estado del optimizador, métricas, comandos de entrenamiento, parches, evaluaciones offline y procedencia del *activation store*.

Es relevante ahora porque la decodificación especulativa se ha consolidado como técnica estándar para reducir la latencia de generación en LLM, y este tipo de artefactos documenta de forma reproducible cómo se adapta un drafter a un modelo objetivo concreto. Conviene subrayar que **no es un bundle de servicio**: el autor indica explícitamente que la exportación para servir con DFlash todavía no está portada, por lo que su uso directo en producción no es posible sin trabajo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo `Qwen/Qwen3-8B` |
| Parametros totales | no disponible (el repo pesa 13,3 GB e incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no es bundle de servicio |
| Brazo / etapa | `direct` / `pretraining` |
| Actualizaciones | 2667 |
| Semilla | 42 |
| Git SHA | `7773b351697d8168da498568e3031940e853cef4` |
| Checkpoint SHA256 | `d356bca48a53f78aee7e39106c4f0fd5f56063d7df6a5aa8e572b39244ae4f59` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre las capas de atención del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El drafter se entrena para predecir tokens especulativos que el modelo objetivo `Qwen/Qwen3-8B` valida después, de modo que la generación se acelera sin alterar la distribución del modelo grande. La configuración del run indica pérdida KL (`kl`), `pm256` y precisión fp32, con 2667 actualizaciones y semilla 42.

El entrenamiento se realizó sobre un *activation store* concreto, `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, del que el repositorio guarda identidad, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno. El autor documenta además evaluaciones offline en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14 y métricas por fila), lo que permite auditar el proceso. No se detalla la composición exacta del dataset de entrenamiento ni el número de tokens más allá de la referencia al store `mix24k`.

## Capacidades

- Actúa como drafter de decodificación especulativa para `Qwen/Qwen3-8B`, no como modelo generativo autónomo.
- Genera tokens candidatos que el modelo objetivo verifica, con el objetivo de reducir la latencia por token.
- Especializado por dominio según la validación del autor: chat, código, matemáticas y STEM (métricas separadas por categoría).
- Entrenado con pérdida KL para alinear la distribución del drafter con la del modelo objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo: esas capacidades residen en el modelo objetivo.
- No dispone de modo *thinking*, visión ni audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter se acopla al modelo objetivo para proponer tokens especulativos y reducir la latencia de decodificación, siempre que se complete previamente la exportación de servicio DFlash (no portada en este repo).
- Investigación en decodificación especulativa: el repositorio incluye comandos, parches y métricas que permiten reproducir el entrenamiento y comparar configuraciones de LoRA (rango, épocas, pérdida).
- Ajuste de drafters por dominio: la validación separada en chat, código, matemáticas y STEM permite evaluar si conviene un drafter especializado para cada carga de trabajo.
- Auditoría de procedencia de datos de entrenamiento: el *activation store* y los registros de extracción permiten rastrear qué activaciones se usaron y con qué configuración de vLLM.
- Base para experimentos de dyn-spec: sirve como punto de partida para otros brazos o etapas del port del generador DFlash.
- Evaluación comparativa de políticas de aceptación: las métricas de `full_acc` y τ (eal) permiten estudiar el equilibrio entre tasa de aceptación y coste computacional del drafter.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación interna del autor sobre 200 filas fijas (una fila por LoRA, métrica `full_acc`):

| Actualizacion | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5338 | 7.899 | 0.3522 | 0.6062 | 0.6838 | 0.4931 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros drafters. La mejora entre la actualización 0 y la 2667 es modesta (+0,0073 en score, +0,196 en τ), lo que sugiere un margen de optimización limitado en esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint está en fp32 e incluye estado del optimizador, por lo que el tamaño en disco (13,3 GB) no refleja el peso del adaptador en memoria.
- GPU recomendadas: no disponibles. El modelo objetivo es Qwen3-8B, que en fp16 requiere aproximadamente 16 GB de VRAM solo para los pesos, más el drafter y las cachés KV.
- Compatibilidad con GPU de consumo: no confirmada; un Qwen3-8B en cuantización de 4 bits podría caber en GPUs de 24 GB, pero el drafter DFlash requiere verificación adicional.
- Opciones de despliegue: el autor señala que la exportación de servicio DFlash no está portada; el repositorio incluye procedencia de lanzamiento de vLLM para el *activation store*, no para servir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros drafters comparables con métricas homogéneas ni datos de modelos alternativos de decodificación especulativa (EAGLE, Medusa, Lookahead) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo desplegable: es un checkpoint de entrenamiento con estado del optimizador; la exportación de servicio DFlash no está portada.
- Licencia no especificada: no se puede confirmar el uso comercial; además, los términos del modelo objetivo (Qwen3-8B) y del drafter base (`z-lab/Qwen3-8B-DFlash-b16`) condicionan su uso.
- Sin datos de sesgos, alucinación o comportamiento multilingüe: al ser un drafter, hereda las limitaciones del modelo objetivo, pero no se documentan evaluaciones al respecto.
- Validación limitada: 200 filas fijas y una única semilla (42), sin intervalos de confianza ni evaluación en benchmarks estándar.
- Mejora marginal respecto a la actualización 0 en la validación publicada, lo que cuestiona la ganancia práctica de esta configuración concreta.
- Repositorio de 13,3 GB dominado por el estado del optimizador; no apto para descarga ligera ni para uso en entornos con poco almacenamiento.
- Dependencia de un *activation store* concreto (`mix24k`) y de un commit específico del drafter base, lo que complica la reproducibilidad fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-fp32
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
