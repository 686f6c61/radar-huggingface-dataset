# mgoin/Qwen3-4B-speculator.dflash2

## Resumen

El modelo `mgoin/Qwen3-4B-speculator.dflash2` es un modelo de borrador (draft model) diseñado para acelerar la inferencia del modelo base `Qwen/Qwen3-4B` mediante decodificación especulativa. Fue entrenado por el autor mgoin como parte de un experimento con la arquitectura DFlash2, adaptada a la implementación del repositorio `vllm-project/speculators` en su pull request #1006. Se trata de un checkpoint intermedio de la primera época de un entrenamiento de tres épocas, publicado para permitir una evaluación independiente de dicha época.

Este modelo no es autónomo: no puede generar texto por sí mismo, sino que actúa como generador de tokens candidatos que un modelo verificador (el Qwen3-4B completo) valida y acepta o rechaza. La arquitectura DFlash2 emplea capas de borrador con convolución dinámica agrupada y un selector de candidatos condicionado al predecesor, lo que permite producir hasta siete tokens especulativos por paso. La relevancia actual radica en la creciente demanda de técnicas de decodificación acelerada para modelos de lenguaje de gran tamaño en entornos de producción, donde la latencia es crítica.

El checkpoint incluye tensores en formato `safetensors`, un `config.json` portable y un `config.py` personalizado, junto con métricas de validación offline de la primera época. No se han publicado aún resultados de benchmarks end-to-end (GSM8K, SPEED-Bench), que se añadirán tras completar el entrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (basada en Qwen3-4B) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el draft se sirve junto al verifier no cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el dataset de entrenamiento tampoco declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `DFlash2DraftModel` propuesta en el pull request #1006 del repositorio `vllm-project/speculators`, adaptada de la implementación de Z Lab (licencia MIT). Consta de 5 capas de borrador con un tamaño de bloque de 8, generando 7 tokens especulativos. El modelo utiliza taps de estado oculto del verificador en las posiciones 1, 9, 17, 25 y 33, y emplea un vocabulario completo de Qwen3-4B. La innovación principal es una convolución dinámica agrupada local al bloque (kernel 2, grupo de tamaño 16) combinada con un selector de candidatos condicionado al predecesor (rango 256, top-16 unario). El selector tiene un peso de pérdida de 0,1, y el objetivo base es una combinación de entropía cruzada (0,1) y divergencia total (0,9) con decaimiento exponencial posicional fijo.

El entrenamiento utilizó exactamente 300.000 filas de Magpie y 207.864 de UltraChat del dataset `inference-optimization/Qwen3-8B-Regenerated-Collection` en la revisión `65d219d6b40bb27c45afe16665147a1d3fa21069`. Las respuestas son trayectorias regeneradas por Qwen3-8B, no muestras on-policy de Qwen3-4B. El artefacto preparado contiene 507.864 filas, 1.618.498.917 tokens totales y 1.547.655.657 tokens supervisados, con una ventana de preparación de 16.384 tokens. El checkpoint corresponde al paso global 26.224; el estado del optimizador se conserva en el bundle local pero no se incluye en este repositorio de servicio.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: produce hasta 7 tokens especulativos por paso, que el modelo verificador Qwen3-4B valida.
- Aceleración de inferencia: al ser un modelo de borrador, reduce la latencia efectiva del modelo base sin cambiar su salida (siempre que los tokens sean aceptados).
- Integración con vLLM: puede servirse mediante `vllm serve` con configuración especulativa, aunque requiere un adaptador de configuración pendiente de integrar.
- Sin capacidades autónomas: no puede generar texto, razonar, escribir código ni realizar tareas de lenguaje por sí mismo.
- Sin soporte de tool calling, agentes ni multimodalidad: al ser un draft model, carece de estas funcionalidades.

## Casos de uso

- Despliegue de Qwen3-4B en producción con baja latencia: el draft model se usa junto al verificador para acelerar la generación de respuestas en servicios de chat o asistentes virtuales, donde cada milisegundo cuenta.
- Inferencia en entornos con recursos limitados: al reducir el número de pasos autoregresivos del modelo grande, se puede servir Qwen3-4B en GPUs más modestas o con mayor throughput.
- Evaluación de arquitecturas de decodificación especulativa: investigadores pueden usar este checkpoint intermedio para analizar el comportamiento de DFlash2 en una época concreta y comparar con otras estrategias de borrador.
- Optimización de costes en APIs de LLM: al aumentar el throughput por petición, se reduce el coste por token servido en infraestructura propia.
- Experimentación con configuraciones de especulación: el modelo permite probar diferentes números de tokens especulativos (7 en este caso) y ajustar el equilibrio entre aceptación y overhead.
- Benchmarking de métodos de decodificación paralela: sirve como referencia para comparar DFlash2 con otros drafters como EAGLE o Medusa en términos de longitud aceptada y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks end-to-end en la informacion disponible. La model card incluye métricas de validación offline (teacher-forced) sobre un split reservado del 1%, que no sustituyen a una evaluación real de aceptación en vLLM ni a métricas de calidad downstream:

| Metrica | Valor |
|---|---|
| Loss total | 0,37105 |
| CE loss | 1,11711 |
| TV loss | 0,23711 |
| Full-token accuracy | 0,49085 |
| Unary candidate recall@16 | 0,82862 |
| Unary candidate target mass@16 | 0,81468 |
| Teacher-forced selector accuracy | 0,61739 |
| Self-conditioned accepted length | 3,73552 |
| Unary top-16 oracle accepted length | 6,07611 |

Los resultados de GSM8K y SPEED-Bench se añadirán tras completar el entrenamiento de tres épocas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Al ser un modelo de borrador con solo 5 capas (frente a las 36 del Qwen3-4B completo), su huella de memoria es significativamente menor que la del verificador, pero el despliegue conjunto requiere la VRAM del modelo base (Qwen3-4B) más la del draft.
- Para servir Qwen3-4B con este draft, se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A10G, L4) para el modelo base en FP16, más el overhead del draft. No hay datos oficiales de latencia o throughput.
- Opciones de despliegue: vLLM (requiere el PR #52816 y un adaptador de configuración), o bien integración manual con el repositorio Speculators. No es compatible con llama.cpp, Ollama ni TGI en su estado actual.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros draft models (p. ej., EAGLE-2, Medusa) en la información proporcionada. El modelo base Qwen3-4B es el verificador objetivo, pero no existe una comparación cuantitativa de velocidad o aceptación frente a alternativas.

## Limitaciones y advertencias

- No puede generar texto de forma independiente; es exclusivamente un draft model y debe usarse junto al verificador Qwen3-4B no cuantizado.
- Es un checkpoint intermedio (época 1 de 3), por lo que su rendimiento no refleja el resultado final del entrenamiento.
- La integración con vLLM aún no está completa: requiere el PR #52816 y un adaptador de configuración que mapee los campos planos de DFlash2 a `dflash_config`.
- El dataset de entrenamiento (`Qwen3-8B-Regenerated-Collection`) no tiene licencia declarada ni metadatos de tarjeta; los usuarios deben evaluar si su uso es apropiado para sus fines.
- La licencia del propio modelo no está declarada, lo que puede limitar su uso comercial hasta que el autor la especifique.
- Las métricas de validación son offline y teacher-forced; no garantizan el rendimiento en inferencia real con vLLM.
- No se ha evaluado la calidad de las respuestas finales del modelo verificador con este draft; la aceptación de tokens no implica necesariamente una mejora en tareas downstream.
- Al ser un modelo experimental, puede presentar comportamientos inesperados en producción y no está respaldado por una comunidad amplia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mgoin/Qwen3-4B-speculator.dflash2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Speculators (PR #1006): https://github.com/vllm-project/speculators/pull/1006
- PR de vLLM para integración: https://github.com/vllm-project/vllm/pull/52816
- Dataset de entrenamiento: https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection/tree/65d219d6b40bb27c45afe16665147a1d3fa21069
- Implementación de referencia de DFlash2 (Z Lab): https://github.com/z-lab/dflash/blob/07ebd93db9f472af339b644bb70221ad8428328a/dflash/model.py
- Blog de Inco AI sobre DFlash2: https://inco.ai/blog/dflash2/
