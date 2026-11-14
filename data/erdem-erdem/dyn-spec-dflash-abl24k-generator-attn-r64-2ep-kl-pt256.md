# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256` contiene un checkpoint de entrenamiento de un *drafter* para decodificación especulativa, desarrollado por el usuario erdem-erdem dentro del marco de trabajo dyn-spec y del port del generador DFlash. No se trata de un modelo de lenguaje autónomo, sino de un componente auxiliar (LoRA de atención con rango 64) que se acopla a un modelo objetivo, en este caso Qwen/Qwen3-8B, para acelerar la generación mediante propuestas de tokens candidatos que el modelo grande verifica después.

El artefacto corresponde a la etapa de preentrenamiento del brazo `direct`, con 2667 actualizaciones, semilla 42 y un tamaño de repositorio de 2,7 GB, lo que incluye el estado del optimizador además de los pesos. La model card indica explícitamente que es un checkpoint de entrenamiento con evaluaciones offline y procedencia completa, y no un paquete listo para servir: la exportación de servicio de DFlash aún no está portada.

Su relevancia es acotada y muy específica: sirve como material reproducible para investigadores que trabajen en decodificación especulativa, en adaptación de drafters sobre Qwen3-8B y en la metodología dyn-spec. No está pensado para uso directo en producción ni como modelo conversacional, y de hecho no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de atención (rango 64) como drafter de decodificación especulativa sobre Qwen3-8B; marco dyn-spec / DFlash |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`checkpoint.pt`) con estado del optimizador; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El componente es un adaptador LoRA de atención con rango 64 que actúa como generador de borradores en un esquema de decodificación especulativa. El modelo objetivo es Qwen/Qwen3-8B, sobre el que se apoya un drafter base identificado como `z-lab/Qwen3-8B-DFlash-b16` en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`. El entrenamiento se realizó en el brazo `direct`, etapa de preentrenamiento, con 2667 actualizaciones y semilla 42, y se apoya en un almacén de activaciones externo (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`) que contiene las activaciones extraídas del modelo objetivo.

La model card documenta la procedencia de forma exhaustiva: SHA de Git (`1efa1cf50674448f7942ef6d520d195b2fc92455`), SHA256 del checkpoint (`a39178258bfc18304e3b9eef0d1c8784bf999e174a0ac14ea146e733fa958326`), registro de extracción, procedencia del lanzamiento de vLLM y registros de relleno del almacén. El directorio `run/` incluye `checkpoint.pt`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, un parche `speculators.patch` y el árbol `provenance/`. La evaluación offline se organiza en `run/offline_eval/` con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen3-8B: propone secuencias candidatas que el modelo objetivo verifica.
- Adaptación específica del mecanismo de atención del drafter mediante LoRA de rango 64.
- Evaluación de aceptación por categoría: la validación desglosa `chat`, `code`, `math` y `stem`, lo que permite medir el comportamiento del drafter por dominio.
- Reproducibilidad completa: comandos de entrenamiento, parche de código, semilla y SHAs permiten replicar el run.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido, ya que el artefacto no es un modelo de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el run `direct`/`pretraining` con 2667 actualizaciones y comparar la tasa de aceptación del drafter frente al estado inicial (update 0 frente a update 2667) en las cuatro categorías evaluadas.
- Estudio de adaptación de drafters sobre Qwen3-8B: sirve para analizar cómo un LoRA de atención de rango 64 modifica la calidad de las propuestas especulativas sin reentrenar el modelo objetivo.
- Reproducción de experimentos dyn-spec: los ficheros `train_command.txt`, `speculators.patch` y `provenance/` permiten reconstruir el pipeline exacto, incluida la extracción de activaciones y el lanzamiento de vLLM.
- Auditoría de procedencia en investigación: el `MANIFEST.json` con tamaño y SHA256 de cada fichero facilita la verificación de integridad en estudios de reproducibilidad.
- Análisis por dominio de la aceptación de borradores: las métricas desglosadas por `chat`, `code`, `math` y `stem` permiten identificar en qué tipo de contenido el drafter aporta más y dónde conviene desactivar la decodificación especulativa.
- Base para futuros ports de servicio: aunque la exportación de servicio DFlash no está portada, el checkpoint es el punto de partida lógico para quien aborde esa integración.
- Comparación de coeficientes y donantes: los resultados offline (M4, M7, D13, D14) permiten contrastar metodologías de evaluación de drafters entre distintos runs.

## Benchmarks y rendimiento

La model card reporta una validación sobre 200 filas fijas, con una fila por LoRA y métrica `full_acc`, comparando el estado inicial (update 0) con el estado final (update 2667):

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5347 | 7.903 | 0.3526 | 0.6066 | 0.6849 | 0.4944 |

El incremento es moderado: +0.0082 en `full_acc`, +0.200 en τ (eal), +0.0063 en `chat`, +0.0110 en `code`, +0.0074 en `math` y +0.0078 en `stem`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,7 GB, pero corresponde a un checkpoint de entrenamiento con estado del optimizador, no a un artefacto de inferencia; el peso efectivo del adaptador LoRA es sustancialmente menor, aunque su tamaño exacto no está disponible.
- Para usar el drafter es necesario cargar el modelo objetivo Qwen3-8B, lo que implica el coste de memoria de un modelo de 8 mil millones de parámetros.
- VRAM estimada para el conjunto objetivo más drafter: no disponible con precisión; depende de la cuantización del modelo base y de la implementación de servicio.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo objetivo, un despliegue en FP16 requeriría del orden de 16 GB solo para pesos, además de caché KV y overhead.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 8B en cuantizaciones de 8 o 4 bits podría caber en GPUs de consumo de gama alta, pero la información no lo especifica.
- Opciones de despliegue: la model card menciona vLLM en la procedencia del lanzamiento, pero indica que la exportación de servicio DFlash no está portada; llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256 | Drafter LoRA (checkpoint de entrenamiento) | Qwen3-8B | no disponible | no disponible | no disponible | Experimental, no servible |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen3-8B | no disponible | no disponible | no disponible | Base de referencia del run |
| Qwen/Qwen3-8B | LLM completo | no aplica | 8B (aprox.) | no disponible | no disponible | Modelo de propósito general |

La comparación con otros drafters o con modelos completos de la misma categoría no está disponible en la información proporcionada, más allá de la relación jerárquica con el drafter base y el modelo objetivo.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autónoma: es un checkpoint de entrenamiento de un drafter y carece de exportación de servicio.
- No declara licencia, lo que impide determinar si su uso comercial está permitido; debe tratarse como no apto para producción hasta que el autor lo aclare.
- No declara idiomas soportados; las capacidades lingüísticas heredadas dependen del modelo objetivo Qwen3-8B y del drafter base.
- El checkpoint incluye estado del optimizador, por lo que no es directamente cargable como adaptador de inferencia sin un paso de conversión no documentado.
- La validación se limita a 200 filas fijas con una fila por LoRA, una muestra pequeña que no garantiza comportamiento en dominios fuera de `chat`, `code`, `math` y `stem`.
- Las mejoras frente al estado inicial son pequeñas (por ejemplo, +0.0082 en `full_acc`), por lo que el beneficio práctico del run debe evaluarse con cautela.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un drafter, su comportamiento está condicionado por la verificación del modelo objetivo.
- Dependencia estricta de versiones: el uso requiere el commit exacto del drafter base y del almacén de activaciones, lo que puede dificultar la reproducibilidad a medio plazo.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha habitual de referencia; conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r64-2ep-kl-pt256
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Commit del drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16/tree/9b41424b7109f9c5413454f481b09a82b85333f4
