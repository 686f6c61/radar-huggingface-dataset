# erdem-erdem/dyn-spec-dflash-m2-generator-attn-r8-4k-1500

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-m2-generator-attn-r8-4k-1500` contiene un checkpoint de entrenamiento de un drafter de decodificación especulativa (speculative decoding) construido sobre el modelo `z-lab/Qwen3-8B-DFlash-b16` y orientado a acelerar la inferencia de `Qwen/Qwen3-8B`. No es un modelo generativo autónomo, sino un componente auxiliar que predice varios tokens candidatos por paso para que el modelo objetivo los verifique en paralelo, reduciendo la latencia de decodificación sin alterar la distribución de salida del modelo base.

El artefacto corresponde a la etapa de preentrenamiento del brazo `direct` de una ejecución de adaptación mediante LoRA (rango 8, ventana de 4k, 1500 actualizaciones, semilla 42). El repositorio incluye el estado del optimizador, métricas, evaluaciones offline y la procedencia completa (identidad del almacén de activaciones, registro del extractor, lanzamiento de vLLM), pero no constituye un paquete de servicio: la exportación para servir el DFlash aún no está portada.

Es relevante ahora porque la decodificación especulativa se ha consolidado como una de las vías más eficaces para reducir el coste por token en despliegues de LLM, y este repositorio documenta de forma trazable un experimento de adaptación de drafters con resultados de validación medidos. Los datos publicados son escasos y el autor no declara licencia, idiomas ni pipeline, por lo que su uso en producción exige verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash con adaptadores LoRA (rango 8) sobre el drafter base `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible (repo de 3,4 GB, incluye estado del optimizador y checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4k tokens (según el identificador del run: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3-8B, no declarados) |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) dentro del directorio `run/`; no es un bundle de servicio |

## Arquitectura y entrenamiento

El componente es un drafter de decodificación especulativa de la familia DFlash, adaptado desde el checkpoint `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b...`) para el modelo objetivo `Qwen/Qwen3-8B`. La adaptación se realiza con LoRA de rango 8 sobre atención (`attn`), con una ventana de contexto de 4k tokens, durante 1500 actualizaciones en la etapa de preentrenamiento del brazo `direct`. El entrenamiento parte de un almacén de activaciones publicado por separado (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), lo que permite reproducir la extracción de activaciones y el proceso de ajuste.

La validación se realizó sobre 200 filas fijas, con un LoRA por fila, midiendo `full_acc` y la longitud media de aceptación `τ` (eal). En la actualización 0 el score fue 0,5246 con τ = 7,108; en la actualización 1500, 0,5239 con τ = 7,176. El desglose por dominio muestra valores estables: chat 0,3369, code 0,5676, math 0,6791 y stem 0,5119 al final del entrenamiento. La práctica estabilidad del score con un ligero aumento de τ sugiere que el ajuste no degrada la aceptación y mejora marginalmente la longitud media de aceptación.

El repositorio incluye además evaluaciones offline en `run/offline_eval/` con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, así como métricas por fila. No se documentan innovaciones adicionales como decodificación especulativa con árbol, atención lineal o modos de razonamiento; el foco es la adaptación del drafter y su trazabilidad.

## Capacidades

- Predicción especulativa de tokens para acelerar la decodificación de `Qwen/Qwen3-8B` mediante verificación paralela en el modelo objetivo.
- Aceptación multi-token con longitud media observada de τ ≈ 7,18 en la validación publicada.
- Adaptación por dominio medida en chat, código, matemáticas y STEM, con mejor aceptación relativa en matemáticas (0,6791) y código (0,5676).
- Entrenamiento reproducible: almacén de activaciones, registro del extractor, procedencia de lanzamiento de vLLM y manifiesto con SHA256 de cada fichero.
- No es un modelo de chat ni de generación autónoma: no se declaran capacidades de tool calling, agentes, visión, audio ni modo de pensamiento.
- Soporte multilingüe: no declarado; depende del modelo objetivo.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter se emplea junto al modelo objetivo para proponer tokens candidatos y reducir la latencia por token en servicios de generación de texto, siempre que se complete la exportación de servicio pendiente.
- Reducción de coste en despliegues de chat: con τ ≈ 7,18, cada paso de verificación puede aceptar varios tokens, lo que disminuye el número de pasos de decodificación y el coste de GPU por respuesta en cargas conversacionales.
- Generación de código asistida: la aceptación relativamente alta en el dominio `code` (0,5676) hace que el drafter sea adecuado para autocompletado y generación de parches en IDE o pipelines, donde la latencia percibida es crítica.
- Razonamiento matemático y tutoría: el mejor resultado por dominio en `math` (0,6791) respalda su uso en asistentes de resolución de problemas paso a paso con Qwen3-8B como verificador.
- Investigación en decodificación especulativa: el repositorio sirve como base reproducible para estudiar el efecto del rango LoRA, la ventana de contexto y el número de actualizaciones sobre la aceptación, gracias al almacén de activaciones y a las evaluaciones offline incluidas.
- Evaluación comparativa de drafters: los registros de procedencia y las métricas por fila permiten contrastar variantes (brazo `direct` frente a otras configuraciones) en condiciones controladas.
- Despliegue en entornos con GPU limitada: al ser un adaptador LoRA de rango 8 sobre un drafter de 8B, el incremento de memoria frente al modelo objetivo es contenido, aunque la VRAM exacta no está documentada.

## Benchmarks y rendimiento

| Metrica | Update 0 | Update 1500 |
|---|---|---|
| full_acc | 0,5246 | 0,5239 |
| τ (eal) | 7,108 | 7,176 |
| chat | 0,3383 | 0,3369 |
| code | 0,5699 | 0,5676 |
| math | 0,6796 | 0,6791 |
| stem | 0,5105 | 0,5119 |

Validación sobre 200 filas fijas, un LoRA por fila. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El drafter se apoya en `Qwen/Qwen3-8B` como modelo objetivo, por lo que el requisito agregado supera el del modelo base; el repositorio no documenta cifras.
- GPU recomendadas: no disponible. Por el tamaño del modelo objetivo (8B) y el drafter asociado, son razonables A100, H100 o L40S para servicio concurrente, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 8B en cuantización de 4 bits podría caber en RTX 4090 (24 GB), pero el repositorio no incluye pesos cuantizados ni instrucciones de despliegue.
- Opciones de despliegue: el autor menciona procedencia de lanzamiento de vLLM, lo que sugiere vLLM como vía prevista; la exportación de servicio DFlash no está portada. No se documentan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La única métrica de eficiencia publicada es la longitud media de aceptación τ ≈ 7,18.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-m2-generator-attn-r8-4k-1500 | Drafter especulativo (LoRA r8) | no disponible | 4k | no disponible | Checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter especulativo base | no disponible | no disponible | no disponible | Modelo base del que parte |
| Qwen/Qwen3-8B | LLM objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo verificado |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a su rol en el pipeline.

## Limitaciones y advertencias

- No es un modelo de servicio: el repositorio contiene un checkpoint de entrenamiento con estado del optimizador; la exportación DFlash para servir no está portada.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución; es imprescindible verificar la licencia del drafter base y de `Qwen/Qwen3-8B` antes de cualquier despliegue.
- Idiomas no declarados: el comportamiento multilingüe depende del modelo objetivo y no está evaluado.
- Métricas limitadas: la validación se realizó sobre 200 filas fijas con un LoRA por fila, un protocolo que no equivale a una evaluación en producción ni a benchmarks estándar.
- Estabilidad del score: `full_acc` prácticamente no mejora entre la actualización 0 y la 1500 (0,5246 frente a 0,5239); la ganancia se concentra en τ, por lo que el beneficio esperado es de latencia, no de calidad.
- Dominio chat con aceptación baja: 0,3369 es el valor más bajo del desglose, lo que anticipa menor aceleración en conversación abierta.
- Ventana de 4k: el drafter está adaptado a ese contexto; su comportamiento con secuencias más largas no está documentado.
- Riesgo de alucinación: al ser un componente de decodificación especulativa, la salida final la valida el modelo objetivo, pero un drafter mal calibrado puede reducir la tasa de aceptación y anular la ganancia de velocidad.
- Sin datos de sesgo, seguridad ni robustez: no se han publicado evaluaciones de alineamiento o toxicidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m2-generator-attn-r8-4k-1500
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: `Qwen/Qwen3-8B`
- Paper, blog o demo: no disponibles en la información proporcionada.
