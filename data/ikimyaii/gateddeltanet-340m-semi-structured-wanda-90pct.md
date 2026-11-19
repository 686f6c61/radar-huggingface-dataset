# ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-90pct

## Resumen

GatedDeltaNet-340M-semi-structured-Wanda-90pct es un modelo de lenguaje derivado de m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigación: una poda one-shot (sin reentrenamiento posterior) del modelo base hasta un 90 % de esparsidad, aplicada con el código oficial de Wanda (locuslab/wanda, rama unstructured, `use_variant=False`). El resultado conserva 399.531.200 parámetros almacenados, pero solo aproximadamente el 10 % de los pesos de las capas lineales internas de los bloques permanecen distintos de cero.

El modelo base emplea la arquitectura GatedDeltaNet, una familia de modelos lineales recurrentes con compuertas derivada de DeltaNet y desarrollada en el ecosistema de flash-linear-attention, entrenada sobre 20.000 millones de tokens según indica el nombre del checkpoint original. La poda afecta a todas las capas lineales dentro de los bloques; las embeddings y la lm_head permanecen densas.

La relevancia de esta ficha es doble: por un lado documenta una técnica de compresión extrema (poda semi-estructurada por filas con criterio Wanda) aplicada a una arquitectura no convencional; por otro, los resultados publicados por el autor muestran un deterioro severo de la perplejidad (de 16,42 a 4008,27 en WikiText-2), lo que convierte al modelo en una referencia negativa útil para calibrar qué nivel de esparsidad tolera esta arquitectura sin recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (modelo lineal recurrente con compuertas, familia DeltaNet) |
| Parametros totales | 399.531.200 (pesos almacenados en safetensors) |
| Parametros activos | no disponible (no es MoE; la esparsidad es estática por poda) |
| Longitud de contexto | no disponible (el calibrado usó secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad medida | 0,8995 en las capas podadas (240 capas verificadas) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base, un diseño de atención lineal recurrente con compuertas que sustituye la atención cuadrática por una actualización de estado con decaimiento controlado por compuertas. El nombre del modelo base sugiere un entrenamiento sobre 20.000 millones de tokens con un tamaño de 340M de parámetros; el recuento real en safetensors es de 399.531.200 pesos. No se dispone de información sobre la composición del dataset, el uso de RLHF o DPO, ni detalles del preentrenamiento más allá de lo que indica el identificador del checkpoint.

La innovación de este artefacto es el procedimiento de poda. Se aplicó Wanda en modo one-shot, sin reentrenamiento, con el código oficial en su rama unstructured y `use_variant=False`: cada fila elimina los pesos con menor producto `|W| * sqrt(||X||)`, calculado a partir de las activaciones de calibración. El calibrado usó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, y cada bloque se calibra sobre las salidas de los bloques ya podados que lo preceden, replicando el esquema de los drivers oficiales. El recorrido de capas es código nuevo del autor, ya que los drivers oficiales solo soportan OPT y LLaMA; la matemática de poda es la del código oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 1,5 minutos en una A100 de 40 GB. La poda afecta a todas las capas lineales internas de los bloques (240 capas verificadas), mientras que embeddings y lm_head quedan densas. Cada fila de cada capa podada conserva exactamente el mismo número de valores no nulos, de modo que el trabajo por fila queda perfectamente balanceado.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base, aunque degradada de forma severa por la poda.
- Razonamiento y respuesta a preguntas de opción múltiple: las evaluaciones zero-shot muestran precisión por encima del azar en varias tareas (RTE 0,5271, Winogrande 0,5075), pero muy por debajo del modelo denso.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no hay información sobre idiomas de entrenamiento.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades multimodales.
- El modelo requiere `flash-linear-attention` instalado (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Referencia de investigación en compresión de modelos: sirve como baseline negativo para comparar técnicas de poda más sofisticadas (por ejemplo, los modelos EHWS del mismo autor) sobre la misma arquitectura y el mismo checkpoint base.
- Estudio de robustez de arquitecturas lineales recurrentes: permite medir cuánto tolera GatedDeltaNet una esparsidad del 90 % sin recuperación, un dato relevante para decidir si merece la pena invertir en reentrenamiento tras podar.
- Validación de implementaciones de Wanda: al haberse generado con el código oficial y documentarse el protocolo de calibración (128 secuencias de C4 de 2.048 tokens, semilla 0), puede usarse para verificar reproducciones del pipeline de poda.
- Benchmarking de kernels de esparsidad: la propiedad de que todas las filas tengan el mismo número de no nulos (240 capas verificadas) lo hace adecuado para probar kernels que explotan balanceo perfecto por fila.
- Docencia y divulgación: ejemplo didáctico de los límites de la poda one-shot sin destilación ni fine-tuning, con métricas de perplejidad y de lm-evaluation-harness publicadas.
- Pruebas de pipelines de evaluación: útil para comprobar que un arnés de evaluación (ELSA, lm-evaluation-harness) detecta correctamente modelos degradados y no los confunde con checkpoints funcionales.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fórmula de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (90 % poda) | 4008,27 | 2030,09 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2218 |
| arc_easy | 0,6023 | 0,2795 |
| boolq | 0,5985 | 0,3783 |
| hellaswag | 0,3461 | 0,2600 |
| openbookqa | 0,2300 | 0,1520 |
| rte | 0,5162 | 0,5271 |
| winogrande | 0,5036 | 0,5075 |
| Media | 0,4373 | 0,3323 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,8 GB en bfloat16; en la práctica, el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluso manteniendo pesos en bf16.
- GPU recomendadas: no se requieren aceleradores de datacenter; una RTX 3060, RTX 4060 o superior es suficiente por memoria. El autor usó una A100 de 40 GB únicamente para el proceso de poda (1,5 minutos), no para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en bf16.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que la arquitectura GatedDeltaNet no es un transformer estándar, es probable que estos motores no la soporten sin adaptaciones, aunque este extremo no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet 340M, poda 90 %) | 399.531.200 almacenados, ~10 % no nulos en capas lineales | no disponible | 4008,27 | no disponible | Hugging Face (0 descargas) |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ~340M | no disponible | 16,42 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor (referenciados en la model card) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa más informativa es contra su propio modelo base denso, ya que no se dispone de datos de otros modelos comparables de la misma familia GatedDeltaNet en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de la calidad: la perplejidad en WikiText-2 pasa de 16,42 a 4008,27 y la media zero-shot cae de 0,4373 a 0,3323. El modelo no es apto para uso en producción ni para generación de texto fiable.
- La poda es one-shot, sin reentrenamiento ni destilación; no hay recuperación de capacidad tras el recorte.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base sin información pública sobre su dataset, los sesgos de ese corpus se heredan y probablemente se amplifican con la poda.
- Riesgo de alucinación: muy elevado, coherente con la perplejidad observada; las salidas pueden ser incoherentes o degenerar en repeticiones.
- Limitaciones de contexto e idioma: no se dispone de información sobre la ventana de contexto efectiva ni sobre los idiomas cubiertos.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin consultar al autor y al modelo base.
- Requiere una dependencia específica (`flash-linear-attention`) y no funciona con los motores de inferencia estándar sin verificación previa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (19 de noviembre de 2026), lo que sugiere que no ha pasado por revisión comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Código oficial de Wanda: locuslab/wanda, commit 8e8fc87 (rama unstructured)
- Biblioteca flash-linear-attention: no se proporciona URL en la información disponible
- Protocolo de evaluación ELSA: no se proporciona URL en la información disponible
- lm-evaluation-harness: no se proporciona URL en la información disponible
