# dealignai/Hy4-Flash-UNCENSORED-EXL3-3.56bpw

## Resumen

Hy4-Flash-UNCENSORED-EXL3-3.56bpw es una cuantización EXL3 de 3,56 bits por peso del modelo base tencent/Hy4-flash, publicada por dealignai. El modelo base es un transformer híbrido de 220 000 millones de parámetros que combina una capa densa con 41 capas MoE (512 expertos enrutados más 1 compartido por capa) e incorpora tablas Engram, un mecanismo de memoria externa. De esos 220 000 millones, 63 500 millones residen en las tablas Engram y solo 11 300 millones se activan por token de texto. El pack cuantizado que nos ocupa declara 35 740 520 758 parámetros en safetensors y ocupa 112,4 GB en disco.

La versión de dealignai aplica un proceso de "abliteration" para eliminar los rechazos del modelo base, orientándolo a usos sin filtrado. El pack está diseñado para servirse en un único DGX Spark mediante TandemEngine, un runtime derivado de exllamav3 1.6.7 que soporta el layout mixto denso + MoE + Engram y el drafter DFly2 integrado. Con un solo Spark se sirve de forma fiable hasta 262 144 tokens de contexto; el contexto nativo completo de 1 048 576 tokens requiere tensor parallelism en varios Spark.

Es relevante por tres motivos: demuestra la viabilidad de servir un MoE de 220 000 millones en hardware de un solo nodo con cuantización agresiva, introduce el mecanismo Engram con tablas en SSD, y documenta un caso de fine-tuning de "desalineación" con métricas de rechazo explícitas. La licencia es propia del autor (dealignai-community-model-license-v0.3), no la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 1 capa densa + 41 capas MoE (512 expertos enrutados + 1 compartido por capa) + tablas Engram + torre de visión |
| Parametros totales | 35 740 520 758 en el pack (modelo base: 220 000 millones, de los cuales 63 500 millones en tablas Engram) |
| Parametros activos | 11 300 millones por token de texto (modelo base) |
| Longitud de contexto | 1 048 576 tokens nativo; 262 144 tokens servibles en un solo DGX Spark con TandemEngine |
| Tipos de cuantizacion | EXL3 trellis a 3,56 bits por peso de media; mezcla interna K3, K3.5, K5, K8, BF16 y FP16 según componente |
| Idiomas soportados | no disponible |
| Licencia | dealignai-community-model-license-v0.3 |
| Formato de pesos | safetensors (EXL3), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base Hy4-flash de Tencent emplea un layout híbrido poco habitual: una única capa densa seguida de 41 capas de mezcla de expertos con 512 expertos enrutados y uno compartido en cada una. A esto se añaden las tablas Engram, un mecanismo de memoria que almacena conocimiento en tablas consultables de forma externa al cómputo denso; en el pack cuantizado estas tablas residen en SSD en frío con una caché de filas calientes de 2 GiB. El modelo incorpora además una torre de visión (presente en el pack a 5 bits pero no servida por TandemEngine, que es solo texto) y un cabezal drafter DFly2 de 5 capas para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. El proceso de dealignai consiste en una cuantización EXL3 más un procedimiento de abliteration para eliminar rechazos; la model card no detalla la metodología exacta de ese proceso. La cuantización usa precisión variable por componente: K3.5 para expertos enrutados e indexer de atención, K5 para atención, latentes, densos y expertos compartidos en la mayoría de capas, K8 para un subconjunto de proyecciones de atención modificada y expertos compartidos, K3 para los MLP del drafter, y BF16 para embeddings, layer norms y proyecciones Engram, con routers en FP16.

## Capacidades

- Generación de texto y conversación multi-turno, con modo de razonamiento configurable (no_think frente a razonamiento alto con presupuesto máximo).
- Razonamiento de alto esfuerzo: la model card reporta 95,18 % en MMLU con razonamiento máximo en el modelo base.
- Conocimiento enciclopédico amplio en STEM, humanidades y ciencias sociales (cobertura de las 57 materias de MMLU).
- Decodificación especulativa mediante el drafter DFly2 integrado, con autocomprobación bit a bit en cada verificación.
- Contexto largo: hasta 262 144 tokens en un solo DGX Spark y 1 048 576 tokens con tensor parallelism.
- Memoria externa vía tablas Engram, que permiten ampliar conocimiento sin aumentar el cómputo denso por token.
- Capacidad de visión presente en los pesos (torre a 5 bits), aunque no servida por el runtime actual.
- Comportamiento sin rechazos: 97,5 % de no rechazo en HarmBench según la model card.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el pack permite estudiar el comportamiento de un modelo con los rechazos eliminados, comparando sus respuestas con las del base Hy4-flash en conjuntos como HarmBench, con métricas de rechazo duro, blando y parcial documentadas.
- Evaluación de cuantización extrema: sirve para medir la degradación de un MoE de 220 000 millones al comprimirlo a 3,56 bits por peso, con datos de referencia de MMLU (2,64 puntos porcentuales de caída tanto en no_think como en razonamiento alto).
- Despliegue en un solo nodo: con unos 73 GiB residentes en un DGX Spark de 121,7 GiB unificados, permite servir un modelo de gran tamaño en hardware de escritorio de gama alta sin clúster.
- Procesamiento de documentos largos: los 262 144 tokens de contexto en un solo Spark permiten analizar libros técnicos, expedientes o bases de código completas en una sola sesión.
- Generación de texto creativo sin filtrado: para aplicaciones donde el filtrado del modelo base resulta un obstáculo, como escritura de ficción con contenido sensible o simulación de personajes.
- Pruebas de estrés de runtimes de inferencia: el pack ejercita el soporte de TandemEngine para layouts mixtos denso + MoE + Engram, útil para validar motores de inferencia alternativos a vLLM o llama.cpp.
- Análisis de corpus con memoria externa: las tablas Engram en SSD con caché caliente permiten consultar conocimiento almacenado fuera de la VRAM, útil en escenarios con memoria limitada.

## Benchmarks y rendimiento

MMLU sobre 228 prompts (4 por materia, 57 materias), comparando base frente a este pack:

| Modo | Base | Este pack | Delta |
|---|---:|---:|---:|
| no_think | 88,60 % | 85,96 % | −2,64 pp |
| Razonamiento alto (presupuesto máximo) | 95,18 % | 92,54 % | −2,64 pp |

HarmBench (razonamiento alto, límite de 4 K tokens, 240 prompts):

| Métrica | Recuento / 240 | Porcentaje |
|---|---:|---:|
| No rechazo | 234 | 97,5 % |
| Rechazos marcados por palabra clave | 6 | 2,5 % |
| Rechazos duros | 0 | 0,0 % |
| Rechazos blandos | 0 | 0,0 % |
| Bucles (rep8 ≥ 0,5) | 0 | 0,0 % |
| Final vacío | 0 | 0,0 % |
| Alcanzó el límite de 4 K | 73 | 30,4 % |

En un subconjunto de auditoría de 111 prompts calificado por otro LLM: 0 rechazos duros, 0 rechazos blandos, 94,6 % de cumplimiento explícito o parcial y 100 % de no rechazo. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 73 GiB residentes por Spark, desglosados en 67,45 GiB de pesos, 5,32 GiB de motor, 0,08 GiB de drafter y unos 2 GiB de caché KV para 262 K de contexto en una sesión. Las tablas Engram no consumen RAM (caché de filas calientes de 2 GiB en SSD).
- GPU recomendadas: DGX Spark (121,7 GiB de memoria unificada) para un solo nodo. Para el contexto completo de 1 M tokens se requiere tensor parallelism con `--tp 4`, es decir, varios Spark.
- Cabe en GPU de consumo: no. El pack de 112,4 GB en disco y 73 GiB residentes excede la VRAM de cualquier GPU consumer actual (RTX 4090, 24 GB).
- Opciones de despliegue: TandemEngine (único runtime que soporta el layout Engram y el drafter DFly2 según el autor). exllamav3 estándar no carga estos packs. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Hy4-Flash-UNCENSORED-EXL3-3.56bpw (este) | 35,74 B en pack (base 220 B, 11,3 B activos) | 1 M nativo; 262 K en un Spark | dealignai-community-model-license-v0.3 | EXL3 / TandemEngine |
| tencent/Hy4-flash (base) | 220 B (11,3 B activos) | 1 M nativo | no disponible | no disponible |
| Otras cuantizaciones EXL3 de Hy4-flash | no disponible | no disponible | no disponible | EXL3 |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa con otras familias.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos del modelo base: la model card reporta 0 rechazos duros y 0 blandos en HarmBench. Esto implica que el modelo puede generar contenido dañino, ilegal o peligroso sin filtrado, lo que lo hace inadecuado para aplicaciones de cara al público sin capas de seguridad externas.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de calibración; la caída de 2,64 puntos en MMLU sugiere cierta degradación por la cuantización, pero no cuantifica el riesgo de fabricación de datos.
- Idiomas soportados: no disponibles. No hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano.
- Restricciones de licencia: la dealignai-community-model-license-v0.3 es una licencia propia del autor, distinta de la del modelo base; no se detallan sus términos de uso comercial en la información disponible, por lo que debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- Dependencia de un runtime no estándar: requiere TandemEngine; exllamav3 estándar no carga el pack, lo que limita la portabilidad y la integración con herramientas habituales.
- Contexto efectivo limitado en un solo nodo: aunque el modelo declara 1 M de tokens, en un único Spark el contexto fiable es de 262 K; superarlo exige varios nodos.
- Visión no servida: la torre de visión está en los pesos pero el runtime actual es solo texto, por lo que no puede usarse para tareas multimodales.
- Sin datos de tool calling ni de comportamiento agéntico: no hay información sobre soporte de function calling, lo que impide recomendarlo para pipelines de agentes.
- El pack tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026: es un artefacto muy reciente y sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Hy4-Flash-UNCENSORED-EXL3-3.56bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Runtime TandemEngine: https://github.com/TandemLLM/TandemEngine
- Perfil del autor en X: https://x.com/dealignai
