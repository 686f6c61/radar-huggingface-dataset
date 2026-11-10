# erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep-kl

## Resumen

`dyn-spec-dflash-math10k-generator-attn-r32-3ep-kl` es un checkpoint de entrenamiento de un drafter de decodificación especulativa (speculative decoding) desarrollado por el usuario de Hugging Face erdem-erdem. No es un modelo de lenguaje completo ni un bundle listo para servir: es el resultado de un experimento de adaptación de un drafter DFlash sobre el modelo objetivo Qwen/Qwen3-8B, usando un LoRA de rango 32 durante 3 épocas sobre un conjunto de datos matemático (math10k). El repositorio incluye el estado del optimizador, los resultados de validación, las evaluaciones offline y la procedencia completa de los datos de activación.

El modelo pertenece a la familia de artefactos "speculators", orientados a la investigación en decodificación especulativa. El drafter base es `z-lab/Qwen3-8B-DFlash-b16`, un modelo auxiliar que propone tokens candidatos que el modelo objetivo verifica, acelerando la generación sin alterar la distribución de salida. La relevancia de este checkpoint es fundamentalmente metodológica: documenta de forma reproducible un ciclo de entrenamiento de un drafter con métricas de aceptación (τ, full_acc) y trazabilidad de datos, lo que resulta útil para investigadores que trabajen en aceleración de inferencia.

El tamaño del repositorio es de 6,6 GB, coherente con un checkpoint que incluye estado del optimizador y artefactos de procedencia. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso, y el propio autor indica que la exportación para serving de DFlash aún no está portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash (adaptación LoRA r32 sobre `z-lab/Qwen3-8B-DFlash-b16`); modelo objetivo Qwen/Qwen3-8B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |
| Tamano del repositorio | 6,6 GB |
| Rango LoRA | 32 |
| Epocas de entrenamiento | 3 |
| Actualizaciones (updates) | 1667 |
| Semilla | 42 |
| Brazo / etapa | `direct` / `pretraining` |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Dataset de activación | erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k |

## Arquitectura y entrenamiento

El artefacto es un drafter de decodificación especulativa construido sobre la arquitectura DFlash del modelo `z-lab/Qwen3-8B-DFlash-b16`, adaptado mediante LoRA de rango 32 al modelo objetivo Qwen3-8B. El entrenamiento se realizó en la etapa de pretraining del brazo `direct`, con 1667 actualizaciones y semilla 42. El repositorio conserva el estado del optimizador, el comando de entrenamiento (`train_command.txt`), el parche de speculators (`speculators.patch`) y los registros de procedencia del almacén de activaciones, lo que permite reproducir el experimento.

Los datos de entrenamiento provienen de un almacén de activaciones (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k`) generado a partir de un conjunto de datos matemático (math10k) y extraído con vLLM sobre Qwen3-8B. La validación se realizó sobre 200 filas fijas, con una fila por LoRA, evaluando la métrica `full_acc` y la longitud media de aceptación τ (eal). La innovación técnica principal no reside en el modelo en sí, sino en el pipeline de trazabilidad: identidad del almacén, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno, todo documentado en `provenance/store/`.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B: el drafter propone secuencias que el modelo objetivo verifica, acelerando la inferencia sin modificar la distribución final.
- Adaptación específica al dominio matemático: el entrenamiento sobre math10k está orientado a mejorar la tasa de aceptación en tareas de razonamiento matemático.
- Evaluación multi-dominio: las métricas de validación se desglosan en chat, code, math y stem, lo que permite analizar el comportamiento del drafter por categoría.
- Reproducibilidad completa: incluye comando de entrenamiento, parche, estado del optimizador y procedencia de datos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma nativa; es un componente auxiliar de inferencia, no un modelo conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint sirve como punto de partida reproducible para estudiar cómo afecta una adaptación LoRA de rango 32 sobre un drafter DFlash a la tasa de aceptación (τ) en dominios específicos.
- Aceleración de inferencia en dominios matemáticos: integrado en un pipeline de serving con Qwen3-8B, el drafter puede reducir la latencia de generación en tareas de razonamiento matemático, donde se observó una mejora de τ de 7,703 a 7,862 tras el entrenamiento.
- Reproducción de experimentos: gracias a `train_command.txt`, `speculators.patch` y `MANIFEST.json` con SHA256 de cada fichero, un equipo puede replicar exactamente el entrenamiento y comparar resultados.
- Análisis de procedencia de datos de activación: el repositorio documenta la identidad del almacén, el extractor y el lanzamiento de vLLM, útil para auditar cómo se generaron los datos de entrenamiento.
- Base para adaptaciones posteriores: el checkpoint con estado del optimizador permite continuar el entrenamiento o ajustar hiperparámetros (rango LoRA, épocas, dominio) sin partir de cero.
- Evaluación comparativa de drafters: las métricas desglosadas por dominio (chat, code, math, stem) permiten comparar este drafter con otras alternativas en un banco de pruebas fijo de 200 filas.
- Docencia y formación: como ejemplo documentado de un ciclo completo de entrenamiento de un drafter, puede usarse en cursos o talleres sobre optimización de inferencia.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc` y τ (eal):

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 1667 | 0.5322 | 7.862 | 0.3503 | 0.6031 | 0.6840 | 0.4915 |

El entrenamiento produce una mejora modesta pero consistente en todas las categorías: +0,0057 en full_acc, +0,159 en τ, +0,0040 en chat, +0,0075 en code, +0,0065 en math y +0,0049 en stem. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene un checkpoint de entrenamiento de 6,6 GB con estado del optimizador, no un bundle de serving cuantizado.
- GPU recomendadas: no disponible. El modelo objetivo Qwen3-8B requiere, en inferencia en precisión completa, del orden de 16-20 GB de VRAM, pero este dato no se confirma en la información proporcionada para el drafter.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica explícitamente que la exportación de serving de DFlash no está portada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto. El pipeline de extracción de activaciones usó vLLM, pero para generar los datos de entrenamiento, no para servir el drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-math10k-generator-attn-r32-3ep-kl | Drafter especulativo (LoRA r32 sobre DFlash) | no disponible | no disponible | no disponible | Hugging Face (checkpoint de entrenamiento) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter especulativo DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo de lenguaje objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a la relación estructural: este artefacto es una adaptación del drafter base sobre el modelo objetivo Qwen3-8B.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de entrenamiento con estado del optimizador y artefactos de procedencia; el autor indica que la exportación de serving de DFlash no está portada.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un drafter, los tokens propuestos son verificados por el modelo objetivo, lo que mitiga el riesgo en la salida final, pero no se documenta un análisis específico.
- Limitaciones de contexto: no disponibles.
- Mejora marginal: la ganancia en full_acc tras 1667 actualizaciones es de +0,0057, por lo que el impacto práctico debe validarse en el pipeline de serving completo antes de adoptarlo.
- Dependencia del modelo objetivo: el drafter está acoplado a Qwen3-8B y a la versión concreta del drafter base (`9b41424b...`); cambios en cualquiera de los dos pueden invalidar la adaptación.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep-kl
- Dataset de activación: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
