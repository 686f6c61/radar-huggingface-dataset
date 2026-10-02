# mundetr1/where-is-shakespeare-final-d

## Resumen

Where is Shakespeare? — Final D es un ajuste fino del modelo base Qwen/Qwen3-0.6B-Base, publicado por el usuario mundetr1 bajo licencia Apache-2.0. Se trata de un artefacto de investigación en interpretabilidad mecanística: el modelo está congelado y entrenado específicamente para recuperar hechos proporcionados en el propio prompt y ejecutar programas formales de búsqueda encadenada hasta profundidad 10. El título hace referencia a la pregunta de dónde procede una respuesta dentro de un transformer, es decir, estudia la recuperación en contexto (in-context retrieval) y no el recuerdo de datos sobre Shakespeare aprendidos durante el preentrenamiento.

El modelo conserva la arquitectura del Qwen3-0.6B-Base: 28 bloques transformer con anchura residual de 1.024, 16 cabezas de consulta y 8 grupos de clave/valor (GQA) con dimensión de cabeza 128, y un total de 596.049.920 parámetros. El ajuste se realizó sobre mundos sintéticos acíclicos de hechos en prompt, con un currículo de profundidades máximas 2, 4, 8, 8 y 10, 35.136 ejemplos originales, 549 pasos de optimizador y 595.357 tokens objetivo supervisados, usando ocho GPU H100.

Su relevancia actual es acotada pero específica: proporciona un caso controlado y reproducible para estudiar recuperación en contexto, control de programas multi-paso y parada prematura, con un conjunto de evaluación archivado y un manifiesto de checksums que permite verificar la integridad del checkpoint. No es un asistente conversacional ni un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivado de Qwen3-0.6B-Base), 28 bloques, anchura residual 1.024, 16 cabezas de consulta y 8 grupos KV (GQA), dimensión de cabeza 128 |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no se publican pesos cuantizados; el repositorio contiene safetensors en FP32 (3 shards, ~2,4 GB). Los ejemplos de carga usan `torch_dtype=torch.float32` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el fichero LICENSE es byte-idéntico al de Qwen; se conservan los términos del modelo upstream) |
| Formato de pesos | safetensors (3 shards), más tokenizer, configuración y MANIFEST.json con hashes SHA-256 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B-Base sin modificaciones estructurales (revisión base `da87bfb608c14b7cf20ba1ce41287e8de496c0cd`): 28 bloques transformer indexados de 0 a 27, anchura residual de 1.024, 16 cabezas de consulta y 8 grupos de clave/valor con dimensión de cabeza 128. El ajuste fino se hizo sobre datos sintéticos: mundos acíclicos de hechos introducidos en el prompt, con un currículo de profundidades máximas 2, 4, 8, 8 y 10. Se utilizaron 35.136 ejemplos originales, 549 pasos de optimizador y 595.357 tokens objetivo supervisados, con entropía cruzada balanceada por turno y categoría y un tamaño de lote efectivo de 64. El entrenamiento original empleó ocho GPU H100; el autor advierte que una nueva ejecución en un solo dispositivo es un experimento de réplica y no una recreación bit a bit de estos pesos.

La innovación no está en la arquitectura sino en el objeto de estudio: el modelo emite trazas formales de varios pasos (búsquedas encadenadas con operadores `->` e `IN`) que terminan con una línea `DONE`. Los experimentos de intervención citados incluyen la transferencia de respuestas copiando claves y valores de tokens de objeto tardíos, y el rescate de campos de acción individuales mediante una dirección en el bloque 11. El propio autor indica que ninguno de estos hallazgos establece un circuito completo ni un uso autónomo seguro. No se menciona RLHF, DPO ni decodificación especulativa; el modelo es un ajuste supervisado derivado de un modelo Base.

## Capacidades

- Recuperación de hechos proporcionados en el prompt, sin depender de conocimiento almacenado en los pesos.
- Ejecución de programas formales de búsqueda encadenada (lookups anidados con operadores `->` e `IN`) hasta profundidad 10 con alta exactitud en su panel de evaluación.
- Emisión de trazas paso a paso con anuncio de la operación siguiente y terminación explícita mediante `DONE`.
- Generación de texto autoregresiva estándar mediante `transformers` (pipeline `text-generation`).
- Inferencia determinista con decodificación greedy (`do_sample=False`) reproducible bajo el mismo entorno numérico.
- No dispone de plantilla de chat: debe cargarse sin chat template y con `trust_remote_code=False`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning general: no disponible; el razonamiento multi-paso se limita a las tareas formales sintéticas descritas.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (visión, audio, modo thinking): no disponible.
- Extrapolación más allá de la profundidad entrenada: degradada de forma marcada (13,3 % de exactitud en profundidades 11-16).

## Casos de uso

- Investigación en interpretabilidad mecanística: análisis de activaciones, direcciones y circuitos asociados a la recuperación en contexto, usando las tareas de búsqueda formal como banco de pruebas controlado.
- Estudio de parada prematura: el fallo dominante del modelo es anunciar `DONE` antes de completar el programa, lo que lo convierte en un caso concreto para investigar algoritmos de terminación en modelos autoregresivos.
- Reproducción y verificación de artefactos: el repositorio incluye MANIFEST.json con tamaños y hashes SHA-256, de modo que se puede auditar la integridad de pesos, tokenizer, configuración y licencia antes de cualquier experimento.
- Docencia sobre ajuste fino de modelos pequeños: con 596 millones de parámetros y 2,4 GB en FP32, sirve para ilustrar currículos de profundidad creciente, balanceo por turno y evaluación por celdas de profundidad/familia.
- Pruebas de sensibilidad numérica: el autor documenta experimentos en FP32 con TF32 desactivado y una puerta de equivalencia numérica, lo que permite estudiar cómo cambian las trazas según el backend y la precisión.
- Evaluación de transferencia mediante intervenciones: replicar la copia de claves/valores de tokens de objeto tardíos o la actuación sobre la dirección del bloque 11 como ejercicios de contraste de hipótesis sobre el circuito de recuperación.
- Base para experimentos de extrapolación: medir el comportamiento en profundidades 11-16 (128/960, 13,3 %) como referencia de generalización fuera de distribución en tareas algorítmicas.

## Benchmarks y rendimiento

Los únicos resultados disponibles son el benchmark nativo archivado del autor (2.560 trazas greedy completas, 40 por celda de profundidad/familia, profundidades 1-16, cuatro familias de relaciones alternas/repetidas). Se trata de resultados archivados de un único checkpoint y paneles concretos, no de una replicación ni de un benchmark general de razonamiento.

| Rango de profundidad | Exactitud | Muestras |
|---|---|---|
| Profundidades entrenadas 1-10 | 1.548/1.600 (96,8 %) | 1.600 |
| Extrapolación 11-16 | 128/960 (13,3 %) | 960 |

Desglose de los 832 errores de extrapolación:

| Tipo de fallo | Casos | Porcentaje |
|---|---|---|
| Parada prematura (`DONE` antes de tiempo) | 823 | 98,9 % |
| Resultado incorrecto | 4 | 0,5 % |
| Continuación innecesaria | 5 | 0,6 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos en FP32: 596.049.920 parámetros × 4 bytes ≈ 2,38 GB, coherente con los 2,4 GB del repositorio repartidos en tres shards safetensors.
- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP32 contando pesos, activaciones y caché KV; en FP16/BF16 los pesos bajan a ~1,2 GB (estimación, no verificada por el autor).
- El ajuste fino original se realizó con ocho GPU H100; el autor indica que una ejecución nueva en un solo dispositivo es un experimento de réplica, no una reproducción bit a bit.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM debería poder cargar los pesos en FP32, y con 2 GB en FP16/BF16. No se publican medidas concretas por modelo de GPU.
- Inferencia en CPU: el autor confirma que es posible, aunque más lenta; no se aportan cifras de latencia.
- Opciones de despliegue: `transformers` (versiones fijadas en el ejemplo: transformers 4.57.1, torch 2.7.1, safetensors 0.6.2, huggingface-hub 0.35.3), con `attn_implementation="sdpa"`. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`. No se publican pesos GGUF, por lo que el uso directo con llama.cpp u Ollama requeriría una conversión propia.
- Nota numérica: los experimentos científicos usaron FP32 con TF32 desactivado (`torch.backends.cuda.matmul.allow_tf32 = False`, `torch.backends.cudnn.allow_tf32 = False`) y una puerta de equivalencia numérica. El ejemplo de generación básico no equivale a esa puerta. Las salidas exactas pueden depender de la implementación y del entorno numérico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia verificable es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| where-is-shakespeare-final-d | 596.049.920 | no disponible | apache-2.0 | Hugging Face, acceso público sin invitación | Ajuste fino de investigación sobre tareas formales sintéticas |
| Qwen/Qwen3-0.6B-Base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face (model card enlazada por el autor) | Modelo base; el preentrenamiento de Qwen se hereda |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información disponible |

## Limitaciones y advertencias

- No es un asistente conversacional. El propio autor lo describe como un modelo derivado de un Base, orientado a tareas formales, y pide cargarlo sin plantilla de chat y sin código remoto.
- Degradación fuerte fuera de distribución: en profundidades 11-16 la exactitud cae al 13,3 %, frente al 96,8 % en profundidades 1-10.
- Parada prematura dominante: el 98,9 % de los errores de extrapolación (823 de 832) consisten en anunciar `DONE` antes de completar el programa. El autor afirma explícitamente que el algoritmo de parada sigue sin resolverse.
- Ejemplo documentado de fallo: en una traza real de profundidad 12 con relación `IN` repetida, el modelo devuelve OSCAR16 correctamente en el turno 10 pero anuncia `DONE` y omite las dos últimas búsquedas.
- Riesgo de alucinación: no se documenta explícitamente, pero el modelo está entrenado para copiar hechos del prompt; cualquier uso fuera de ese patrón carece de garantías.
- Idiomas soportados: no disponibles, lo que impide planificar despliegues multilingües.
- Longitud de contexto: no especificada para este checkpoint.
- Entrenamiento exclusivamente con datos sintéticos (mundos de hechos acíclicos), sin datos naturales; no se documenta ningún ajuste de alineación (RLHF/DPO).
- Las intervenciones descritas (copia de claves/valores tardíos, dirección en el bloque 11) no establecen un circuito completo ni un uso autónomo seguro, según el propio autor.
- Trazabilidad: el repositorio contiene el checkpoint, tokenizer, configuración y manifiesto de checksums, pero no el archivo de entrenamiento original ni el código de investigación privado. Una ejecución nueva en un solo dispositivo no reproduce bit a bit estos pesos.
- Licencia: Apache-2.0 con los términos upstream de Qwen conservados; el fichero LICENSE es byte-idéntico al original de Qwen. La licencia es permisiva, pero la idoneidad técnica del modelo para producción es muy limitada.
- Sensibilidad numérica: las salidas exactas pueden variar según implementación y entorno; los resultados científicos se obtuvieron en FP32 con TF32 desactivado, condiciones que una cuantización posterior rompería.
- Sesgos conocidos: no disponible (no se documenta ningún análisis de sesgos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mundetr1/where-is-shakespeare-final-d
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Repositorio de descarga fijado por revisión: `hf download mundetr1/where-is-shakespeare-final-d --revision final-d-v1 --local-dir models/final-d`
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo ni con el ámbito técnico de esta ficha, por lo que no se incluyen como fuentes.
