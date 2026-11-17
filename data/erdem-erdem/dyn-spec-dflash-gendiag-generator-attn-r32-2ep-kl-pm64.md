# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm64

## Resumen

`gendiag-generator-attn-r32-2ep-kl-pm64` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding) para el modelo objetivo Qwen/Qwen3-8B. Lo publica el usuario de Hugging Face `erdem-erdem` dentro de un proyecto denominado dyn-spec, un port del generador DFlash. No es un modelo generativo autonomo: es un adaptador LoRA que actua como cabecera de propuestas (drafter) para acelerar la inferencia del modelo objetivo mediante decodificacion especulativa.

El artefacto corresponde a la rama `direct` de la etapa de `pretraining`, entrenado durante 2667 updates con semilla 42 sobre el drafter base `z-lab/Qwen3-8B-DFlash-b16`. El repositorio incluye el checkpoint con estado del optimizador, resultados de validacion sobre 200 filas fijas, evaluaciones offline y trazabilidad completa (provenance) del store de activaciones empleado.

Es relevante unicamente para investigadores que trabajen en tecnicas de aceleracion de inferencia y quieran reproducir o auditar el entrenamiento de drafters DFlash. El autor advierte explicitamente de que no es un bundle de serving: la exportacion para servir el drafter no esta portada. El repo ocupa 1.7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash con adaptador LoRA (rango 32, atencion) sobre el drafter base `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es un bundle de serving |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa construido sobre el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), que a su vez propone tokens para el modelo objetivo Qwen/Qwen3-8B. La adaptacion se realiza mediante un LoRA de rango 32 sobre las capas de atencion (`attn-r32`), entrenado en la rama `direct` durante la etapa de `pretraining` con 2667 updates y semilla 42. El nombre del checkpoint indica ademas una variante `gendiag`, dos epocas (`2ep`), una funcion de perdida tipo KL (`kl`) y una ventana o parametro `pm64`.

El entrenamiento se realizo sobre el store de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, que actua como dataset de destilacion de las activaciones del modelo objetivo. El repositorio conserva el comando de entrenamiento (`train_command.txt`), el parche aplicado a la libreria speculators (`speculators.patch`), el registro temporal (`timing.json`), las metricas (`metrics.json`) y la procedencia del store (identidad, extractor, lanzamiento de vLLM y registros de llenado). No se detalla la composicion del dataset, el numero de tokens ni si se aplico RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- No es un modelo generativo autonomo: actua como drafter auxiliar que propone tokens candidatos para el modelo objetivo Qwen/Qwen3-8B.
- Acelera la inferencia del modelo objetivo mediante decodificacion especulativa, con el objetivo de reducir la latencia por token generado.
- Capacidad de propuesta sobre cuatro dominios evaluados: chat, codigo, matematicas y STEM.
- Soporte de tool calling: no disponible (depende del modelo objetivo, no del drafter).
- Soporte de agentes y razonamiento multi-paso: no disponible (el drafter solo propone tokens; el razonamiento lo realiza el modelo objetivo).
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.
- Uso previsto: investigacion y reproduccion del entrenamiento de drafters, no despliegue directo en produccion.

## Casos de uso

- Reproduccion de experimentos de decodificacion especulativa: el repositorio incluye comando de entrenamiento, parche y procedencia, lo que permite replicar el entrenamiento del drafter sobre Qwen3-8B con el store de activaciones indicado.
- Auditoria de trazabilidad en investigacion: los ficheros de provenance (identidad del store, extractor, lanzamiento de vLLM) permiten verificar el origen de los datos de entrenamiento y las condiciones de extraccion de activaciones.
- Estudio de adaptadores LoRA para drafters: el checkpoint con estado del optimizador y las metricas por update facilitan analizar la evolucion del entrenamiento y el efecto del rango 32 en atencion.
- Comparacion de ramas y etapas del port dyn-spec: al estar etiquetado como rama `direct` y etapa `pretraining`, sirve como punto de referencia frente a otras variantes del mismo proyecto.
- Analisis de la funcion de perdida KL en destilacion de drafters: la configuracion `kl` y el parametro `pm64` permiten estudiar su impacto en la tasa de aceptacion de tokens.
- Evaluacion offline de drafters: los resultados en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14) permiten analizar el comportamiento del drafter sin necesidad de desplegarlo en serving.
- Base para portar la exportacion de serving DFlash: dado que el autor indica que el bundle de serving no esta portado, este checkpoint puede servir como material de partida para esa integracion.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5347 | 7.909 | 0.3516 | 0.6074 | 0.6845 | 0.4955 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores corresponden a la validacion interna del drafter, no a la calidad del modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 1.7 GB, pero incluye estado del optimizador y no es un bundle de serving, por lo que el consumo real de memoria del drafter desplegado no se puede derivar de ese dato.
- GPU recomendadas: no disponibles. El modelo objetivo asociado es Qwen3-8B, lo que en la practica exige GPUs con suficiente memoria para servir un modelo de 8B mas el drafter; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportacion de serving DFlash no esta portada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponibles. La metrica τ (eal) de 7.909 tras el entrenamiento es un indicador interno de aceptacion, no una medida de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gendiag-generator-attn-r32-2ep-kl-pm64` (este) | Drafter LoRA DFlash para Qwen3-8B | no disponible | no disponible | no disponible | Checkpoint de entrenamiento, sin bundle de serving |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base para Qwen3-8B | no disponible | no disponible | no disponible | Disponible en Hugging Face (commit referenciado) |
| Qwen/Qwen3-8B | Modelo objetivo generativo | 8B | no disponible en esta ficha | no disponible en esta ficha | Disponible en Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: el autor advierte de que la exportacion DFlash para servir el drafter no esta portada, por lo que no puede desplegarse directamente en produccion.
- El checkpoint incluye estado del optimizador, lo que aumenta el tamano del artefacto y no es el formato adecuado para inferencia.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial.
- No se especifican idiomas soportados ni limitaciones de contexto.
- Las metricas de validacion son internas (200 filas fijas, `full_acc` y τ eal) y no equivalen a benchmarks estandar; no deben interpretarse como medida de calidad generativa.
- Riesgo de alucinacion: no aplica directamente al drafter, pero la calidad de las propuestas afecta a la tasa de aceptacion y, por tanto, a la ganancia real de velocidad.
- Sesgos conocidos: no disponibles.
- Dependencia fuerte del modelo objetivo y del store de activaciones concretos (Qwen3-8B y `dyn-spec-dflash-store-qwen3-8b-mix24k`); el artefacto no es portable a otros modelos sin reentrenamiento.
- Repositorio sin descargas ni likes y con fecha de creacion reciente, sin evidencia de uso externo ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm64
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
