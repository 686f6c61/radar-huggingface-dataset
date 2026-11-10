# erdem-erdem/dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvblock

## Resumen

El modelo `dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvblock`, publicado por el usuario erdem-erdem, no es un modelo de lenguaje generativo al uso, sino un *drafter* de decodificación especulativa (speculative decoding) adaptado mediante LoRA sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`. Se trata de un artefacto de entrenamiento del proyecto "dyn-spec DFlash generator port", concretamente la rama `direct` en fase de `pretraining` con 1500 actualizaciones y semilla 42. Su función es proponer tokens candidatos que un modelo objetivo (`Qwen/Qwen3-8B`) verifica después, acelerando la inferencia sin alterar la distribución de salida.

El repositorio, de 13,2 GB, contiene el checkpoint de entrenamiento con estado del optimizador, métricas, evaluaciones offline y trazabilidad completa (provenance), pero no es un paquete de servicio listo para producción: el autor indica explícitamente que la exportación de servicio DFlash todavía no se ha portado. La relevancia actual es acotada: sirve como material reproducible para investigación sobre decodificación especulativa y adaptación de drafters, no como modelo desplegable.

No se dispone de información sobre licencia, idiomas soportados ni pipeline en la model card ni en los metadatos de Hugging Face. La validación publicada muestra que el entrenamiento apenas modifica el rendimiento respecto al checkpoint inicial (full_acc 0,5246 en el paso 0 frente a 0,5233 en el paso 1500), lo que sugiere una adaptación marginal en la ventana evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores LoRA (rango 32) sobre drafter DFlash para decodificación especulativa; detalles completos no disponibles |
| Parametros totales | no disponible (repo de 13,2 GB, incluye estado del optimizador y checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4k (según el identificador del run: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El artefacto es un drafter de decodificación especulativa basado en DFlash, adaptado mediante LoRA de rango 32 (`r32`) sobre el modelo `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b...`). El modelo objetivo es `Qwen/Qwen3-8B`, cuya identidad de store se registra en `provenance/store/`. El entrenamiento corresponde a la rama `direct` en fase de `pretraining`, con 1500 actualizaciones, semilla 42 y un store de activaciones de 4k tokens (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). El identificador `kvblock` sugiere una configuración de bloques de clave-valor, aunque los detalles técnicos de esa configuración no están documentados en la información disponible.

La innovación principal es metodológica: el repositorio conserva trazabilidad completa del proceso (registro de ejecución, comandos de entrenamiento, parche `speculators.patch`, procedencia del lanzamiento de vLLM y registros de llenado del store). La validación se realizó sobre 200 filas fijas, una por cada LoRA, midiendo `full_acc` y la longitud media de aceptación (τ, eal). Los resultados muestran una práctica equivalencia entre el paso 0 y el paso 1500, con variaciones mínimas por categoría (chat, code, math, stem). No se documentan datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre `Qwen/Qwen3-8B`; no es un modelo autónomo de generación de texto.
- Aceleración de inferencia mediante verificación de propuestas por el modelo objetivo, preservando la distribución de salida del objetivo.
- Adaptación LoRA de rango 32 entrenada sobre un drafter DFlash existente.
- Evaluación por categorías: chat, código, matemáticas y STEM (métricas reportadas en la validación).
- Reproducibilidad completa: checkpoint con estado del optimizador, comandos de entrenamiento, parche y procedencia.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en decodificación especulativa: el artefacto permite reproducir el entrenamiento del drafter y analizar el efecto de 1500 actualizaciones LoRA sobre la tasa de aceptación, gracias a los registros de ejecución y al parche incluidos.
- Estudio de la dinámica de adaptación de drafters: la comparación entre el paso 0 y el paso 1500 (full_acc 0,5246 frente a 0,5233; τ 7,108 frente a 7,156) sirve para analizar cuándo la adaptación aporta o no ganancia.
- Auditoría de pipelines de entrenamiento: la carpeta `provenance/` y el `MANIFEST.json` con SHA256 de cada fichero permiten verificar la integridad y el origen de los datos de activación.
- Reproducción de evaluaciones offline: los resultados en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14) permiten reejecutar los análisis por fila.
- Base para portar la exportación de servicio DFlash: al no estar portada todavía, el checkpoint sirve como punto de partida para quien quiera completar esa integración.
- Análisis comparativo de configuraciones de bloques KV (`kvblock`) en decodificación especulativa, aunque la documentación de esa variante es escasa.

## Benchmarks y rendimiento

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5233 | 7.156 | 0.3361 | 0.5687 | 0.6755 | 0.5130 |

Validación sobre 200 filas fijas, una por LoRA. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un checkpoint de entrenamiento (13,2 GB) con estado del optimizador, no un bundle de servicio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada; se menciona vLLM en la procedencia del lanzamiento, pero no se documenta un procedimiento de servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvblock | Drafter LoRA sobre DFlash | no disponible | 4k | no disponible | Checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo verificado por el drafter |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor declara explícitamente que la exportación de servicio DFlash no está portada; no debe desplegarse como endpoint de generación.
- Licencia no especificada: no hay información sobre condiciones de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Ganancia de adaptación marginal: la validación muestra una diferencia mínima entre el paso 0 y el paso 1500, por lo que el entrenamiento no parece aportar mejoras sustanciales en la ventana evaluada.
- Dependencia estricta del modelo objetivo: solo es válido con `Qwen/Qwen3-8B` y el drafter base indicado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un drafter, la verificación por el modelo objetivo mitiga este riesgo en el pipeline completo, pero no se documenta.
- Tamaño del repositorio: 13,2 GB por incluir estado del optimizador; requiere espacio de almacenamiento considerable para reproducibilidad.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvblock
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
