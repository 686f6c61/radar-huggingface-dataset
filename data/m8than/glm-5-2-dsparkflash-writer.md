# m8than/GLM-5.2-DSparkFlash-Writer

## Resumen

GLM-5.2-DSparkFlash-Writer es un modelo borrador (*draft*) para decodificación especulativa sobre GLM-5.2, publicado por el usuario m8than. No es un modelo de lenguaje autónomo: se acopla a un servidor GLM-5.2 como target y propone tokens que el modelo grande verifica en bloque. Combina un backbone DSpark de tres capas transformer, ajustado para escritura creativa y diálogo, con un selector condicional Markov de estilo DFlash2 entrenado por separado. El resultado se sirve con un retículo de 16 candidatos por posición y un árbol de verificación de ocho nodos, prediciendo 8 posiciones dentro de un bloque de verificación de 9 tokens (ancla incluida).

El checkpoint declara 3.154.303.873 parámetros en safetensors y 6,3 GB de repositorio. Buena parte de esa cifra corresponde a los tensores de embedding y LM head heredados del donante (`RedHatAI/GLM-5.2-speculator.dspark`) para mantener compatibilidad de checkpoint; el cuerpo entrenable son tres bloques transformer con tamaño oculto 6.144, 64 cabezas de query/KV, dimensión de cabeza 64 y rango Markov 256.

Su relevancia es doble: por un lado muestra una receta reproducible de ajuste de un *speculator* para un target concreto (incluido un dominio creativo); por otro, es un artefacto explícitamente experimental que solo funciona con un fork concreto del runtime Furnace sobre SGLang y que no ha sido validado en SGLang, vLLM ni Speculators sin modificar. No es una release oficial de Red Hat y no establece serving sin pérdida: el modo `--superfast` es aproximado y su reutilización de caché de prefijos puede hacer que las salidas dependan del historial de caché.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Draft especulativo DSpark: 3 bloques transformer (tamaño oculto 6.144, 64 cabezas de query/KV, dimensión de cabeza 64, rango Markov 256) con cabeza selectora condicional estilo DFlash2 (`markov_head_type="dsparkflash"`); no es un modelo de lenguaje autónomo |
| Parámetros totales | 3.154.303.873 (safetensors); incluye embedding compartido y LM head del donante retenidos por compatibilidad, no solo el backbone entrenado |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de draft de 2.048 tokens de contexto comprometido antes del ancla del bloque, más las queries causales del draft; la ventana de prefill/historial la fija el target GLM-5.2 |
| Tipos de cuantización | checkpoint BF16 servido como `unquant` (`--speculative-draft-model-quantization unquant`); no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 6,3 GB |

## Arquitectura y entrenamiento

El modelo es un *draft* de decodificación especulativa, no un transformer generativo completo. Sobre el donante `RedHatAI/GLM-5.2-speculator.dspark` (revisión `cc714308fc4ad68b667a6a71bbf2a344c2ef903b`, tres capas BF16 DSpark, tamaño oculto 6.144, dimensión de cabeza 64, 64 cabezas de query/KV, capas auxiliares del target `[2, 20, 39, 58, 75]` y rango Markov 256) se ejecutó un entrenamiento en tres fases. Primero, un backbone creativo: dos épocas con LR `3e-6`, seleccionando el paso 198 sobre 1.000 casos de entrenamiento (800 creativos/diálogo, 200 generales) con 100 de validación y 100 de test en proporción 80/20; se entrenaron los tres bloques transformer, la normalización final y las tablas Markov nativas, dejando congelados la proyección de contexto, la normalización de entrada, el embedding compartido, el LM head, la cabeza de confianza y el target GLM-5.2.

Segundo, un selector condicional independiente con el backbone DSpark nativo congelado, inicializado desde las tablas Markov del donante con pesos de proyección a cero y sesgo unitario; se probaron ocho configuraciones de LR y alcance de entrenamiento hasta 4.096 pasos, seleccionando por validación proyección LR `1e-5`, tablas Markov LR `1e-6` y paso 2.048 sobre un conjunto amplio de 7.116 casos de entrenamiento, 189 de validación y 184 de test que cubren conversación, propósito general y contexto largo. Tercero, el ensamblado: se conservan todos los tensores del checkpoint creativo salvo `markov_head.*`, que se sustituye entero por el selector seleccionado, sin entrenamiento adicional ni optimización sobre etiquetas de held-out.

Las etiquetas de continuación local fueron tokens nuevos de asistente decodificados por GLM-5.2 en Furnace, incluyendo razonamiento cuando se generó; los tokens de prompt, usuario, sistema e historial se excluyeron de la pérdida. Se usaron etiquetas duras de token, no destilación KL con log-probabilidades suaves, y no se registró un dataset de capas teacher en crudo (solo se cachearon características DSpark congeladas y contexto proyectado). Los prompts generales provienen de `AdvancedDataIntelligence/glm5.2-general-distill` (revisión `684db78055d6066c3417e2a279278f6b448c7d97`, declarado CC-BY-SA-3.0), usados como prompts y no como etiquetas de respuesta importadas. En serving, el draft sigue consumiendo estados auxiliares del target. El modelo declara explícitamente que no es DFlash2 B12 y que no contiene backbone DFlash2 trasplantado ni pesos de selector entrenados por DFlash2.

## Capacidades

- Predicción especulativa de 8 posiciones por paso, verificadas por el target en un bloque de 9 tokens incluida el ancla.
- Propuesta sobre un retículo top-16 de candidatos por posición con árbol de verificación de ocho nodos, activo por defecto en lanzamientos `--superfast` compatibles.
- Verificación con árbol únicamente en peticiones greedy; sampling, gramáticas, penalizaciones, peticiones de logprob y otras características no soportadas caen automáticamente a verificación lineal.
- Ventana de draft de 2.048 tokens de contexto comprometido independiente de la ventana de prefill del target.
- Ajuste específico de dominio creativo y diálogo (800 de los 1.000 casos del backbone), con selector entrenado sobre un conjunto más amplio que incluye conversación, general y contexto largo.
- Integración de tool calling, agentes o razonamiento multi-paso: no disponible como capacidad propia; depende enteramente de las capacidades del target GLM-5.2 y de que la petición sea compatible con la verificación por árbol.
- Capacidades multimodales, de visión o audio: no disponible (no declaradas).
- Modo *thinking* o razonamiento explícito: el draft puede predecir tokens de razonamiento cuando el target los genera, pero no expone un modo propio.

## Casos de uso

- Aceleración de serving de GLM-5.2 en producción: el draft propone 8 tokens por paso que el target verifica en un bloque de 9, reduciendo el número de pasos autorregresivos del modelo grande. Es adecuado porque su ventana de draft (2.048 tokens) está calibrada para el contexto comprometido típico de turnos de conversación.
- Escritura creativa y generación de prosa: el backbone se ajustó con 800 casos creativos/diálogo de 1.000, por lo que la distribución del draft se alinea mejor con texto narrativo que con código o matemáticas.
- Asistentes conversacionales multi-turno de baja latencia: al mantener una ventana de draft de 2.048 tokens antes del ancla, el borrador conserva contexto suficiente del historial reciente sin replicar la ventana completa del target.
- Despliegue en clústeres AMD con ROCm: la receta de referencia es un lanzamiento de ocho GPU MI325X con TP8 sobre el fork de SGLang de Furnace, pensado para entornos que ya operan aceleradores AMD Instinct.
- Investigación en decodificación especulativa: permite ablaciones controladas entre verificación lineal y verificación por árbol (`SGLANG_DFLASH_TREE_VERIFY=0`), y entre cabeza nativa y selector condicional, sobre un conjunto fijo de 100 casos held-out y 573 arranques de draft.
- Evaluación comparativa de selectores Markov: el repositorio separa claramente backbone creativo y cabeza selectora, lo que facilita medir el efecto aislado de la cabeza sobre la longitud media de prefijo acertado.
- Pipelines de generación greedy de alta concurrencia: es el escenario donde el árbol de ocho nodos se aprovecha al máximo, ya que las peticiones con sampling caen a verificación lineal y pierden la ventaja del árbol.
- Reproducción de recetas de ajuste de *speculators*: los hashes de checkpoints de origen y los hiperparámetros están en `training_metadata.json`, lo que permite replicar las tres fases de entrenamiento.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación con un protocolo definido, pero las cifras agregadas no están presentes en la información disponible (la tabla aparece truncada). El protocolo es: replay de ancla fija sobre 100 casos held-out y 573 arranques de draft, mismo backbone creativo, ventana de draft de 2.048 tokens y continuaciones de referencia de GLM-5.2; 80 casos creativos y 20 generales, con fracciones agregadas ponderadas por arranques de draft y no por caso. El propio autor advierte que este conjunto held-out se ha reutilizado para ablaciones.

| Métrica | Configuración | Resultado |
|---|---|---|
| Prefijo de draft acertado / 8 propuestas | cabeza selectora DFlashFlash vs. cabeza nativa | no disponible (tabla truncada en la información suministrada) |
| Longitud media acertada | idem | no disponible (tabla truncada en la información suministrada) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de throughput/latencia en la información disponible. Al ser un modelo borrador, esas métricas no serían interpretables de forma aislada: habría que medirlas sobre el par draft + target.

## Requisitos de hardware

- Peso del draft: 3,15 B de parámetros en BF16, aproximadamente 6,3 GB, coherente con el tamaño del repositorio. Se suma al footprint del target GLM-5.2, que no está incluido en este repositorio.
- Configuración de referencia del autor: ocho GPU AMD Instinct MI325X (256 GB de HBM3E por GPU) con TP8, sobre ROCm y el fork de SGLang de Furnace (rama `da53bee642bb48c3230df524eea223d9e7371e6b`).
- No cabe ni es utilizable en GPU de consumo: necesita un servidor GLM-5.2 completo como target en la misma instancia de serving, con el draft como proceso adicional. Una RTX 4090 o similar no puede alojar el conjunto.
- Flags específicos del draft: `--speculative-algorithm DSPARK`, `--speculative-num-draft-tokens 9`, `--speculative-draft-window-size 2048`, `--speculative-draft-attention-backend triton`, `--speculative-draft-kv-cache-dtype bfloat16`, `--superfast`, y `SGLANG_RAGGED_VERIFY_MODE=static` como variable de entorno.
- Backends validados: solo el fork de Furnace sobre SGLang. SGLang upstream, vLLM y Speculators no están validados para esta cabeza. No hay soporte de llama.cpp, Ollama ni TGI.
- No requiere `--trust-remote-code`.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni factor de aceleración frente a decodificación sin draft.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m8than/GLM-5.2-DSparkFlash-Writer | draft especulativo ajustado (backbone creativo + selector DFlash2) | 3,15 B (safetensors) | ventana de draft 2.048 tokens | Apache-2.0 | HuggingFace, 0 descargas, 0 likes; requiere runtime Furnace |
| RedHatAI/GLM-5.2-speculator.dspark | draft especulativo donante, sin ajuste de dominio | no disponible en la información | no disponible | Apache-2.0 (declarada) | HuggingFace |
| m8than/GLM-5.2-E2M1-Furnace | target GLM-5.2 en formato E2M1, probado localmente con este draft | no disponible | no disponible | no disponible | HuggingFace |
| DFlash2 B12 (referencia citada por el autor) | draft DFlash2 con backbone y selector propios | no disponible | no disponible | no disponible | no disponible; el autor aclara que este modelo no lo replica |

No hay datos públicos de benchmarks que permitan comparar rendimiento entre estas variantes. La comparación relevante es funcional: el donante aporta el backbone y las tablas Markov nativas, y este modelo sustituye la cabeza por un selector entrenado y ajusta el backbone a un dominio creativo, lo que puede degradar el comportamiento en dominios no representados en sus 1.000 casos.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un servidor GLM-5.2 compatible y el runtime Furnace, el checkpoint no genera texto utilizable.
- Dependencia de un fork concreto de SGLang (rama `da53bee`). Actualizaciones de upstream pueden romper la compatibilidad sin aviso.
- `--superfast` es un modo con pérdida y su reutilización aproximada de caché de prefijos puede hacer que las salidas dependan del historial de caché. La release no establece serving sin pérdida.
- La cabeza de confianza heredada no se ha recalibrado tras el ajuste; el autor exige mantener `SGLANG_RAGGED_VERIFY_MODE=static`.
- Solo las peticiones greedy aprovechan el árbol de verificación de ocho nodos; sampling, gramáticas, penalizaciones y logprobs caen a verificación lineal, con lo que la aceleración efectiva varía según el tráfico.
- Sesgo de dominio: el backbone se entrenó con 800 casos creativos/diálogo frente a 200 generales, y el selector con 7.116 casos de conversación, general y contexto largo. El rendimiento en código, matemáticas o dominios técnicos no está caracterizado.
- Riesgo de alucinación: inherente al target GLM-5.2; el draft no filtra ni verifica contenido, solo propone tokens que el target acepta o rechaza. Un draft mal calibrado reduce la tasa de aceptación, no la calidad final del texto.
- Idiomas soportados no declarados; no hay evaluación multilingüe en la información disponible.
- El conjunto held-out de 100 casos y 573 arranques se ha reutilizado para ablaciones, por lo que las cifras de evaluación, si se publican, estarían optimistamente sesgadas.
- Licencia Apache-2.0 en este repositorio, pero el cumplimiento depende también de las condiciones del donante (declarado Apache-2.0) y del dataset de prompts (declarado CC-BY-SA-3.0), que puede imponer obligaciones adicionales sobre datos derivados.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, etiquetado `experimental` por el propio autor. No hay validación independiente.
- El repositorio no incluye conversaciones, texto de prompts o salidas, identificadores de caso ni cachés de características; la reproducibilidad de los datos de entrenamiento es, por tanto, parcial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m8than/GLM-5.2-DSparkFlash-Writer
- Modelo donante: https://huggingface.co/RedHatAI/GLM-5.2-speculator.dspark
- Target E2M1 probado localmente: https://huggingface.co/m8than/GLM-5.2-E2M1-Furnace
- Runtime Furnace (rama fijada): https://github.com/m8than/furnace/tree/da53bee642bb48c3230df524eea223d9e7371e6b
- Instrucciones de lanzamiento (START_COMMANDS.md): https://github.com/m8than/furnace/blob/da53bee642bb48c3230df524eea223d9e7371e6b/START_COMMANDS.md
- Dataset de prompts generales: https://huggingface.co/datasets/AdvancedDataIntelligence/glm5.2-general-distill
