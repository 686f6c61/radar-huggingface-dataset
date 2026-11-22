# HoeioUser/vollie2

## Resumen

Vollie2 es un repositorio de archivos GGUF con dos modelos cuantizados publicados por el usuario HoeioUser como parte de la "campaña 2" del proyecto Vollie, un experimento de inferencia de un LLM disperso (MoE) sobre la CPU de un teléfono de 2021. No se trata de un modelo entrenado desde cero, sino de dos recuantizaciones de pesos publicados sin modificar: `allenai/OLMoE-1B-7B-0125-Instruct` e `ibm-granite/granite-4.0-h-tiny`, ambos bajo licencia Apache-2.0.

El repositorio contiene dos ficheros GGUF de aproximadamente 3 GB cada uno (`olmoe-Mi.gguf` y `granite-Mi.gguf`), generados con `llama-quantize` de llama.cpp (commit `620d2225c`) usando matrices de importancia (imatrix) de mradermacher. La mezcla de tipos es heterogénea: tensores densos en Q4_0, tensores de expertos en Q3_K y la cabeza de salida en Q6_K.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien quiera ejecutar modelos MoE en hardware muy limitado (CPU de móvil), con perplejidades medidas publicadas (wikitext-2, contexto 512) que permiten evaluar la pérdida de calidad frente a los pesos originales en F16/BF16. No hay información sobre fine-tuning propio, idiomas soportados ni benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) en ambos modelos base; OLMoE usa transformer MoE con enrutamiento por token, Granite 4.0-h-tiny es un modelo híbrido MoE (detalles exactos no disponibles en la información proporcionada) |
| Parametros totales | 6.939.037.248 (según safetensors del repo); OLMoE-1B-7B: 6,9 B totales; Granite-4.0-h-tiny: no disponible |
| Parametros activos | OLMoE-1B-7B: aproximadamente 1,3 B activos por token (según nomenclatura del modelo base); Granite-4.0-h-tiny: no disponible |
| Longitud de contexto | No disponible en la información proporcionada (la perplejidad se midió con contexto 512) |
| Tipos de cuantizacion | Tensores densos Q4_0, tensores de expertos Q3_K, cabeza de salida Q6_K (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: publica dos recuantizaciones de pesos ya entrenados por Allen AI (OLMoE-1B-7B-0125-Instruct) e IBM (Granite-4.0-h-tiny). OLMoE es un transformer con mezcla de expertos de 6,9 mil millones de parámetros totales y aproximadamente 1,3 mil millones activos por token, afinado para instrucciones; Granite-4.0-h-tiny es un modelo híbrido MoE de IBM del que la información disponible no detalla la arquitectura interna.

La innovación técnica del repositorio está en el proceso de cuantización: se aplican matrices de importancia (imatrix) de mradermacher para asignar precisión de forma selectiva, con Q4_0 en tensores densos, Q3_K en los tensores de expertos (donde el impacto por peso es menor al activarse de forma dispersa) y Q6_K en la cabeza de salida (crítica para la distribución de probabilidad final). Los pesos se generaron con `llama-quantize` sobre el commit `620d2225c` de llama.cpp. No hay datos sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas de los modelos base afinados para instrucciones (OLMoE-1B-7B-0125-Instruct).
- Razonamiento y conocimiento general en el rango propio de un MoE de 6,9 B con ~1,3 B activos.
- Ejecución en CPU de gama baja: el objetivo declarado del proyecto es servir un LLM disperso en la CPU de un teléfono de 2021.
- Compatibilidad con llama.cpp y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia en dispositivos móviles sin GPU: los GGUF de ~3 GB permiten cargar OLMoE o Granite en la CPU de un teléfono moderno con 4-6 GB de RAM libre, usando llama.cpp con mmap; es el escenario para el que se publicaron los ficheros.
- Prototipado offline en portátiles modestos: con 3 GB de pesos en Q3_K/Q4_0, un portátil sin GPU dedicada puede ejecutar un MoE de 6,9 B con consumo de RAM contenido frente a un modelo denso equivalente.
- Evaluación de pérdida por cuantización: las perplejidades publicadas (OLMoE 11,7146 frente a 10,9420 en F16; Granite 9,2266 frente a 8,7816 en BF16) permiten decidir si el ahorro de memoria compensa la degradación en una tarea concreta antes de desplegar.
- Servicio de chat ligero en entornos con restricciones de memoria: al ser MoE con ~1,3 B activos (OLMoE), el coste computacional por token es bajo, adecuado para asistentes conversacionales de baja concurrencia en CPU.
- Base para experimentos de cuantización mixta: la receta (Q4_0 densos, Q3_K expertos, Q6_K cabeza) sirve como plantilla reproducible para recuantizar otros MoE con llama.cpp e imatrix.
- Despliegue en contenedores pequeños: ficheros de 3 GB con pesos congelados y hashes SHA-256 publicados facilitan la verificación de integridad y el despliegue en imágenes Docker de tamaño moderado con llama.cpp o servidores compatibles con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de calidad son las perplejidades en wikitext-2 (test, contexto 512, todos los chunks, medidas en un portátil):

| Modelo | Perplejidad GGUF | Referencia | Degradación |
|---|---|---|---|
| OLMoE-1B-7B-0125-Instruct | 11,7146 | 10,9420 (F16) | +0,7726 |
| Granite-4.0-h-tiny | 9,2266 | 8,7816 (BF16) | +0,4450 |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,1 GB por fichero GGUF (3.072.399.552 bytes para OLMoE, 3.161.269.344 bytes para Granite), más overhead de contexto y del runtime de llama.cpp; con contexto 512 y mmap, cabe en 4 GB de RAM libre.
- GPU recomendadas: no se especifican; el proyecto está orientado a CPU. Cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutarlos con offload completo.
- GPU de consumo: sí, cabe en cualquier GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) con carga completa de capas.
- Opciones de despliegue: llama.cpp (formato nativo, generado con `llama-quantize`), Ollama (importando el GGUF), servidores compatibles con endpoints (etiqueta `endpoints_compatible`); vLLM y TGI no están indicados en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; el contexto de diseño es la CPU de un teléfono de 2021, lo que implica throughput bajo (del orden de pocos tokens por segundo), aunque no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización publicada | Licencia | Formato |
|---|---|---|---|---|---|---|
| Vollie2 / OLMoE-1B-7B (este repo) | 6,9 B | ~1,3 B | no disponible | Q4_0/Q3_K/Q6_K, 3,07 GB | Apache-2.0 | GGUF |
| Vollie2 / Granite-4.0-h-tiny (este repo) | no disponible | no disponible | no disponible | Q4_0/Q3_K/Q6_K, 3,16 GB | Apache-2.0 | GGUF |
| allenai/OLMoE-1B-7B-0125-Instruct (original) | 6,9 B | ~1,3 B | no disponible | F16/BF16 y otras | Apache-2.0 | safetensors |
| ibm-granite/granite-4.0-h-tiny (original) | no disponible | no disponible | no disponible | BF16 y otras | Apache-2.0 | safetensors |

La comparación relevante es contra los pesos originales: mismo modelo, misma licencia, pero Vollie2 reduce el peso de 13-14 GB en F16/BF16 a ~3 GB con una degradación de perplejidad de +0,77 (OLMoE) y +0,45 (Granite). No se dispone de comparación con otros MoE cuantizados de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier sesgo, alucinación o limitación de conocimiento proviene de OLMoE-1B-7B-0125-Instruct y Granite-4.0-h-tiny, no del autor del repo.
- La cuantización Q3_K en expertos y Q4_0 en densos introduce degradación medible (+0,77 y +0,45 de perplejidad en wikitext-2); en tareas sensibles a precisión (código, matemáticas) el impacto puede ser mayor y no está medido.
- La cabeza de salida en Q6_K mitiga parte del daño, pero no hay benchmarks de tareas que confirmen la calidad final.
- Idiomas soportados no documentados: no se puede asumir un rendimiento fiable en castellano sin evaluación propia.
- Longitud de contexto no documentada; la perplejidad se midió a 512 tokens, lo que sugiere que no se validó el comportamiento en contextos largos.
- Licencia Apache-2.0 en ambos ficheros y en los modelos base, lo que permite uso comercial, pero conviene verificar las condiciones de los pesos originales de IBM y Allen AI por si hubiera cláusulas adicionales de uso aceptable.
- Repositorio con 0 likes y 620 descargas: no hay validación comunitaria ni issues documentados; los hashes SHA-256 publicados permiten verificar integridad, pero no hay garantía de mantenimiento.
- El proyecto está diseñado para CPU de móvil; desplegarlo en producción con concurrencia alta requeriría GPU y no se han publicado cifras de throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HoeioUser/vollie2
- Proyecto Vollie en GitHub: https://github.com/hoeio/vollie
- Modelo base OLMoE: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo base Granite: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- llama.cpp (commit de cuantización `620d2225c`): https://github.com/ggml-org/llama.cpp
- Matrices de importancia de mradermacher: https://huggingface.co/mradermacher
