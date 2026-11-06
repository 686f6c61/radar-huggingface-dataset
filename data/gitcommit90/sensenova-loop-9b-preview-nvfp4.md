# gitcommit90/SenseNova-Loop-9B-Preview-NVFP4

## Resumen

SenseNova-Loop-9B-Preview-NVFP4 es una cuantización comunitaria no oficial del modelo multimodal SenseNova-Loop-9B-Preview, desarrollado originalmente por SenseNova. El checkpoint aplica cuantización post-entrenamiento NVFP4 mediante NVIDIA ModelOpt sobre los pesos originales, manteniendo la cabeza MTP (multi-token prediction) en BF16 para preservar la decodificación especulativa. El resultado es un modelo de 9,38 GB validado en hardware NVIDIA DGX Spark (GB10, SM121) con GEMMs FP4 nativas W4A4.

El modelo base emplea una arquitectura de transformer con bucles (looped transformer) e incorpora componentes mHC (probablemente atención multi-cabeza con routing tipo Sinkhorn, según los kernels descritos) y MTP. Está orientado a generación de texto e imagen-texto a texto, con soporte para inglés y chino. Los pesos reales en safetensors suman 6.200.143.984 parámetros, aunque la nomenclatura comercial del modelo base lo denomine "9B".

La relevancia de esta ficha radica en que documenta una de las primeras cuantizaciones NVFP4 de un modelo multimodal con decodificación especulativa funcional, incluyendo métricas de rendimiento reproducibles y una discusión explícita sobre las pérdidas de calidad asociadas a la optimización del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer multimodal con componentes mHC y cabeza MTP |
| Parametros totales | 6.200.143.984 (según safetensors); el modelo base se denomina comercialmente "9B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan entradas de ~4K tokens en las pruebas, sin especificar el máximo) |
| Tipos de cuantizacion | NVFP4 (W4A4) con ModelOpt; cabeza MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea una arquitectura de transformer con bucles (looped transformer), en la que el bloque se aplica repetidamente con el objetivo de aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Incluye componentes denominados mHC, cuya implementación concreta utiliza operaciones de normalización tipo Sinkhorn con 20 iteraciones configuradas, y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. Esta cuantización no ha sido entrenada ni sometida a QAT o destilación: se trata exclusivamente de una cuantización post-entrenamiento calibrada y empaquetada con ModelOpt.

El checkpoint cuantizado conserva la cabeza MTP en BF16 para que la decodificación especulativa siga funcionando, mientras que el resto de pesos se empaquetan en NVFP4. El runtime v2 del autor introduce kernels fusionados en FP32 para las operaciones mHC/Sinkhorn y reduce el vocabulario del borrador MTP a 65.536 tokens, seleccionados a partir de corpus de entrenamiento. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- Decodificación especulativa mediante cabeza MTP, con verificación sobre el vocabulario completo del modelo objetivo.
- Razonamiento multi-paso y generación de código (evaluado con prompts de código en las pruebas de rendimiento).
- Procesamiento de documentos largos (probado con entradas de ~4K tokens).
- Soporte de decodificación greedy; no se han evaluado otros modos de muestreo en las pruebas publicadas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multilingüe en inglés y chino: el modelo puede gestionar diálogos multi-turno con contexto de varios miles de tokens, adecuado para atención al cliente en mercados asiáticos y angloparlantes.
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede extraer y razonar sobre información contenida en capturas, formularios escaneados o diagramas combinados con texto.
- Generación de código en entornos con GPU de gama profesional: los benchmarks de decodificación de código (~90 tokens de entrada, 33-36 tok/s) lo hacen viable para autocompletado y generación de funciones en IDE con hardware tipo DGX Spark.
- Despliegue en hardware de borde con FP4: el formato NVFP4 y los 9,38 GB del checkpoint permiten ejecución en dispositivos con aceleradores FP4 nativos, como el GB10, reduciendo el coste energético frente a BF16.
- Prototipado de pipelines multimodales con decodificación especulativa: la cabeza MTP en BF16 permite experimentar con decodificación especulativa sin reentrenar, útil en investigación sobre inferencia eficiente.
- Evaluación comparativa de cuantizaciones: el repositorio incluye harness de evaluación, ledger de experimentos y resultados crudos, lo que lo convierte en un caso de estudio reproducible para investigar el trade-off velocidad-calidad en NVFP4.
- Servicio de inferencia con concurrencia moderada: con 8 peticiones agregadas a ~117-119 tok/s en entradas de ~1K, puede soportar cargas de trabajo de equipo pequeño en una sola GPU.

## Benchmarks y rendimiento

Rendimiento de decodificación (runtime v2, 256 tokens de salida, decodificación greedy):

| Medición | NVFP4 congelado + MTP | v2 exact + MTP | v2 fast + MTP |
|---|---:|---:|---:|
| Decodificación individual, ~1K entrada (tok/s, mediana) | 12,4 | 27,3 | 28,9 |
| Decodificación individual de código, ~90 entrada (tok/s, mediana) | 16,0 | 33,4 | 35,9 |
| Decodificación individual de documento, ~4K entrada (tok/s, mediana) | 14,3 | 30,6 | 33,3 |
| Agregado 8 peticiones, ~1K entrada (tok/s) | 64,3 | 117,2 | 119,4 |
| Agregado 8 peticiones de código (tok/s) | 97,4 | 172,7 | 196,7 |
| TTFT individual, ~1K entrada (s, mediana) | 0,74 | 0,51 | 0,32 |

Calidad (suite de 300 ítems):

| Configuración | Aciertos | Precisión | Delta vs congelado (IC 95% bootstrap pareado) |
|---|---:|---:|---|
| v1 congelado | 251/300 | 83,7% | referencia |
| v2 exact | 249/300 | 83,0% | −0,67 pp [−3,00, +1,67] |
| v2 fast | 247/300 | 82,3% | −1,33 pp [−4,33, +1,67] |

MMLU-Pro: la primera ejecución de v2 fast cayó del 70,0% al 58,3% (−11,7 pp), con truncamientos que pasaron de 14 a 20. Reruns posteriores de fast dieron 71,7% y 65,0%; los reruns del congelado dieron 70,0% y 65,0%. El autor advierte que la variabilidad y el presupuesto de tokens complican la interpretación, pero no eliminan la regresión de la primera ejecución.

## Requisitos de hardware

- Checkpoint de 9,38 GB en NVFP4; requiere aceleradores con soporte nativo de FP4 (W4A4) para aprovechar los GEMMs FP4.
- Validado en NVIDIA DGX Spark (GB10, SM121); no se han publicado pruebas en otras GPU.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no disponible en la información proporcionada; el requisito de GEMMs FP4 nativas apunta a arquitecturas Blackwell o superiores.
- Despliegue: runtime propio del autor (runtime v2 y runtime v1 congelado), con imagen Docker fijada. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Throughput: 27-36 tok/s por petición individual y 117-197 tok/s agregados con 8 peticiones concurrentes en DGX Spark.
- TTFT: 0,32-0,51 s con ~1K tokens de entrada en runtime v2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-NVFP4 (este) | 6,2B (safetensors) | no disponible | Apache-2.0 | safetensors NVFP4 | Hugging Face, 59 descargas |
| SenseNova-Loop-9B-Preview (base) | no disponible | no disponible | Apache-2.0 | safetensors BF16 | Hugging Face (oficial) |
| Otras cuantizaciones NVFP4 de modelos multimodales de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: no ha sido producida ni validada por SenseNova; los pesos son modificados y cualquier problema de calidad debe atribuirse al proceso de cuantización.
- Solo se ha evaluado decodificación greedy; el comportamiento con muestreo, temperatura o top-p no está documentado.
- El perfil `fast` del runtime v2 puede divergir textualmente del modelo congelado por cambios en el orden de suma en FP32, y mostró una regresión inicial de −11,7 pp en MMLU-Pro en la primera ejecución.
- La suite de calidad de 300 ítems es pequeña y ruidosa; el autor indica explícitamente que no establece ausencia de pérdida ni equivalencia con el benchmark completo.
- Idiomas limitados a inglés y chino; no se ha documentado rendimiento en castellano ni en otros idiomas.
- Longitud máxima de contexto no especificada; las pruebas solo cubren entradas de hasta ~4K tokens.
- Riesgo de alucinación y sesgos: no cuantificado en la información disponible, pero aplicable como en cualquier modelo generativo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y la cuantización deben citarse adecuadamente; verificar la licencia del modelo original en su repositorio.
- El vocabulario del borrador MTP está restringido a 65.536 tokens; el objetivo verificador mantiene el vocabulario completo, pero el sesgo del borrador puede afectar a dominios fuera de los corpus de entrenamiento usados para seleccionarlo.
- Requiere hardware con soporte FP4 nativo; el rendimiento en GPU sin estas instrucciones no está documentado.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/gitcommit90/SenseNova-Loop-9B-Preview-NVFP4
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio companion (runtime, receta de cuantización, harness, resultados): https://github.com/gitcommit90/sensenova-loop-9b-nvfp4-dgx-spark
- Resultados del runtime v2: https://github.com/gitcommit90/sensenova-loop-9b-nvfp4-dgx-spark/blob/main/runtime-v2/RESULTS.md
- Figuras (figures4papers): https://github.com/ChenLiu-1996/figures4papers
