# erdem-erdem/dyn-spec-dflash-newmix24k-full-ft-3ep-kl

## Resumen

Este repositorio no contiene un modelo de lenguaje convencional, sino un *checkpoint* de entrenamiento de un drafter de decodificación especulativa. En concreto, se trata de una adaptación del drafter DFlash del proyecto dyn-spec sobre el modelo objetivo Qwen/Qwen3-8B, generada mediante LoRA y entrenada durante 4000 actualizaciones con semilla 42. El autor es erdem-erdem y el artefacto se publica como material de reproducibilidad de un experimento de investigación, no como un paquete listo para servir.

El objetivo técnico es acelerar la inferencia de Qwen3-8B mediante decodificación especulativa: un modelo pequeño (el drafter) propone varios tokens candidatos que el modelo grande verifica en paralelo, reduciendo el coste por token generado sin alterar la distribución de salida. La innovación aquí reside en que el drafter se adapta dinámicamente mediante un generador de LoRA, y este repositorio documenta una de las ramas del experimento (`fresh_lora`, etapa de pretraining).

Es relevante ahora porque la decodificación especulativa se ha consolidado como una de las vías prácticas para reducir latencia en despliegues de LLM, y este repositorio aporta trazabilidad completa (SHA de checkpoint, procedencia del almacén de activaciones, comandos de entrenamiento y evaluaciones offline). No obstante, el propio autor advierte de que no es un bundle de servicio: la exportación para servir con DFlash aún no está portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash (adaptación LoRA sobre `z-lab/Qwen3-8B-DFlash-b16`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un drafter DFlash, es decir, un modelo auxiliar que predice múltiples tokens futuros para alimentar un esquema de decodificación especulativa sobre el modelo objetivo Qwen/Qwen3-8B. La adaptación se realiza con un generador de LoRA (`lora-generator`), lo que sugiere que los pesos del drafter se generan o modulan dinámicamente a partir de un módulo LoRA en lugar de entrenarse de forma independiente. El drafter base identificado es `z-lab/Qwen3-8B-DFlash-b16`, fijado al commit `9b41424b7109f9c5413454f481b09a82b85333f4`.

El entrenamiento corresponde a la rama `fresh_lora` en etapa de pretraining, con 4000 actualizaciones, semilla 42 y SHA de Git `163f98d03c8822dd4168189de5cfea7aacec3689`. El checkpoint tiene SHA256 `4194e915148606ab51fe4f14fa38446b248cc36b7c5792164052ba410310d614`. Los datos de activaciones provienen del almacén `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-newmix24k`, y el repositorio incluye registros de procedencia del extractor, del lanzamiento de vLLM y de los procesos de llenado del almacén. La evaluación offline cubre reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá del nombre del mix (`newmix24k`).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B (no es un modelo generativo autónomo).
- Predicción multi-token (drafter de tipo *multi-step*): propone varias posiciones por paso de verificación.
- Adaptación dinámica mediante generador de LoRA, lo que permite modular el comportamiento del drafter sin reentrenar el modelo base.
- Evaluación desglosada por dominios: chat, código, formal, matemáticas, roleplay y ciencia, según la validación del autor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; su función es acelerar el modelo objetivo.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter se acopla al modelo objetivo para reducir la latencia por token mediante verificación especulativa, manteniendo la distribución de salida del modelo grande.
- Investigación en decodificación especulativa: el repositorio incluye el comando de entrenamiento, el parche de `speculators`, los registros de procedencia y las métricas, lo que permite reproducir el experimento y comparar ramas (`fresh_lora` frente a otras).
- Estudio de generadores de LoRA para drafters: la rama `fresh_lora` y las métricas por dominio permiten analizar cómo la adaptación LoRA afecta a la precisión del drafter en chat, código o matemáticas.
- Auditoría de pipelines de datos de activaciones: el almacén `dyn-spec-dflash-store-qwen3-8b-newmix24k` y los registros de llenado sirven para validar la extracción de activaciones con vLLM.
- Evaluación offline de drafters: los resultados en `run/offline_eval/` (coeficientes M4, donantes M7, similitud D13, coste D14) permiten medir el impacto de la adaptación antes de desplegar.
- Base para desarrollar la exportación de servicio DFlash: dado que el bundle de serving no está portado, este checkpoint es el punto de partida para construir dicha exportación y validarla contra el modelo objetivo.

## Benchmarks y rendimiento

Validación del autor sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | Score | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.4449 | 5.985 | 0.2766 | 0.5573 | 0.4912 | 0.6774 | 0.2112 | 0.4555 |
| 4000 | 0.4623 | 6.341 | 0.2837 | 0.5769 | 0.5355 | 0.6876 | 0.2257 | 0.4642 |

El entrenamiento mejora el score global de 0.4449 a 0.4623 y la longitud media de aceptación (τ) de 5.985 a 6.341. Las mayores ganancias por dominio se observan en formal (+0.0443), código (+0.0196) y matemáticas (+0.0102); roleplay es el dominio con menor rendimiento absoluto (0.2257). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,6 GB e incluye estado del optimizador, por lo que no refleja el tamaño de inferencia del drafter.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada; el artefacto es un checkpoint de entrenamiento, no un bundle servible. Los registros de procedencia mencionan lanzamientos de vLLM para la extracción de activaciones, no para servir el drafter.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dyn-spec DFlash `fresh_lora` (este repo) | Drafter LoRA para decodificación especulativa | Qwen/Qwen3-8B | no disponible | no disponible | no disponible | Checkpoint de entrenamiento en HF |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | Qwen/Qwen3-8B | no disponible | no disponible | no disponible | HF |
| Qwen/Qwen3-8B | LLM denso | — | 8B | no disponible en esta ficha | no disponible en esta ficha | HF |

La comparación con otros drafters de decodificación especulativa (por ejemplo, EAGLE o Medusa) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo servible: el autor indica explícitamente que es un checkpoint de entrenamiento con estado del optimizador y que la exportación de servicio DFlash aún no está portada.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribución.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al ser un drafter, su salida se verifica contra el modelo objetivo, pero un drafter mal calibrado puede reducir la tasa de aceptación y, con ello, el beneficio de latencia.
- Rendimiento dependiente del dominio: roleplay obtiene 0.2257 de `full_acc`, muy por debajo de matemáticas (0.6876) o código (0.5769); el beneficio de aceleración será desigual según la carga de trabajo.
- Validación limitada: las métricas proceden de 200 filas fijas con una fila por LoRA, no de un benchmark estándar ni de una evaluación en producción.
- Reproducibilidad condicionada: requiere el almacén de activaciones `dyn-spec-dflash-store-qwen3-8b-newmix24k`, el commit exacto del drafter base y el parche `speculators.patch` incluido en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix24k-full-ft-3ep-kl
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-newmix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16 (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
