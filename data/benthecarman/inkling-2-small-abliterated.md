# benthecarman/Inkling-2-Small-abliterated

## Resumen

Inkling-2-Small-abliterated es una variante "abliterated" (sin la dirección de rechazo eliminada de los pesos) del modelo multimodal Inkling-2-Small de Thinking Machines. Se trata de un transformer de mezcla de expertos (MoE) con 594.000 millones de parámetros totales y aproximadamente 17.000 millones activos por token, capaz de procesar entradas de texto e imagen (pipeline image-text-to-text). El autor de la variante es el usuario de Hugging Face benthecarman, que la publica bajo licencia Apache 2.0.

El modelo base resuelve tareas de razonamiento, generación de código, matemáticas y comprensión de imágenes. Esta variante mantiene intactas las capacidades del base pero reduce drásticamente las tasas de rechazo ante peticiones dañinas: del 88,6 % al 22,5 % en un conjunto de 633 prompts reservados, y del 15,5 % al 4,0 % en imágenes sensibles, con una divergencia KL de solo 0,161 respecto al modelo original en el primer token de respuesta.

La relevancia de esta ficha radica en que documenta un modelo de gran tamaño (393,5 GB de pesos) con una intervención quirúrgica sobre el comportamiento de rechazo, manteniendo métricas de conocimiento (MMLU 80,0 % frente a 79,3 % del base) y de código (HumanEval 97,0 % frente a 95,1 %). Es un caso de estudio útil para investigadores interesados en técnicas de abliteration aplicadas a modelos MoE multimodales de escala industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) multimodal texto-imagen |
| Parametros totales | 594.000 millones (según model card); 383.072.987.216 según safetensors |
| Parametros activos | ~17.000 millones por token |
| Longitud de contexto | 128.000 tokens (según evaluación LongBench v2) |
| Tipos de cuantizacion | NVFP4 (expertos capas 0-39), MXFP8 (expertos capas 40-47), BF16 (resto); 8-bit |
| Idiomas soportados | No disponible (Global-MMLU-Lite evaluado en 23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), NVFP4/MXFP8/BF16 mixtos |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) multimodal que acepta texto e imágenes como entrada. La arquitectura distribuye los expertos en capas diferenciadas con precisión mixta: los expertos de las capas 0 a 39 están cuantizados en NVFP4, los de las capas 40 a 47 en MXFP8, y el resto de componentes (atención, embeddings, etc.) permanece en BF16. Esta configuración de precisión mixta es la del checkpoint oficial de Thinking Machines y se ha preservado íntegramente en la variante abliterated.

El proceso de abliteration consiste en identificar una "dirección de rechazo" en el espacio de activaciones (la diferencia entre activaciones ante prompts dañinos y prompts inocuos) y proyectarla fuera de las matrices que escriben en el flujo residual. El autor utilizó abliterix, un fork de la herramienta de wuwangzhang1216, con soporte para Inkling 2, ejecutando una búsqueda Optuna de 50 ensayos sobre dónde y con qué intensidad aplicar la edición. Cada ensayo se recodificó a NVFP4/MXFP8 y se evaluó en vLLM, de modo que la puntuación correspondía al modelo tal como se distribuye. Se seleccionó el ensayo 47 por ofrecer un equilibrio entre reducción de rechazos y preservación de capacidades (6 puntos más de rechazo que el candidato más agresivo, pero con un tercio de su KL y sin la pérdida de 4 puntos de MMLU que este último sufría). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128.000 tokens.
- Razonamiento explícito: el modelo razona antes de cada respuesta incluso con esfuerzo "none", y admite configuraciones de mayor esfuerzo de razonamiento.
- Comprensión de imágenes (image-text-to-text): descripción, análisis y respuesta a preguntas sobre imágenes.
- Generación de código: HumanEval 97,0 % y MBPP 88,4 % en la evaluación del autor.
- Matemáticas y conocimiento general: MMLU 80,0 %, Global-MMLU-Lite 87,1 %, GPQA Diamond 86,4 %.
- Capacidades multilingües evaluadas en 23 idiomas (Global-MMLU-Lite).
- Reducción drástica de rechazos ante peticiones dañinas (22,5 % de rechazo frente al 88,6 % del base), lo que amplía el espacio de respuestas útiles en dominios sensibles.
- No se dispone de información sobre soporte explícito de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de rechazo y la eficacia de técnicas de abliteration en modelos MoE multimodales de gran escala, comparando directamente con el checkpoint base bajo el mismo harness de evaluación.
- Análisis de documentos largos con imágenes: con 128.000 tokens de contexto, se puede emplear para procesar informes extensos que combinen texto y figuras, extrayendo conclusiones y respondiendo preguntas sobre el contenido completo.
- Generación de código en entornos controlados: su HumanEval de 97,0 % lo hace adecuado para pipelines internos de generación y revisión de código donde se requiera alta precisión sintáctica y se disponga de la infraestructura necesaria (394 GB de pesos).
- Evaluación de sesgos y robustez: al eliminar la dirección de rechazo, el modelo expone más directamente los sesgos subyacentes del base, lo que resulta útil para auditar comportamientos indeseados en investigación de alineamiento.
- Procesamiento multimodal de contenido sensible para moderación: en un entorno de investigación, puede emplearse para generar respuestas que el modelo base rechazaría, permitiendo estudiar qué tipo de contenido produce y diseñar mejores filtros.
- Redacción asistida en dominios regulados: para equipos que necesitan respuestas sobre temas que el base declina (por ejemplo, análisis de riesgos o descripciones técnicas de actividades peligrosas) bajo supervisión humana y cumplimiento normativo.
- Experimentación con cuantización NVFP4/MXFP8: sirve como banco de pruebas para validar recetas de despliegue en vLLM y SGLang con precisión mixta a gran escala.

## Benchmarks y rendimiento

| Benchmark | Base | Este modelo | Diferencia |
|---|---|---|---|
| Rechazos en 633 prompts dañinos reservados | 88,6 % | 22,5 % | -66,1 pp |
| Rechazos con razonamiento activado | 87,0 % | 22,5 % | -64,5 pp |
| Rechazos en 251 imágenes sensibles | 15,5 % | 4,0 % | -11,5 pp |
| KL respecto al base (primer token) | - | 0,161 | - |
| MMLU (14.042, 5-shot) | 79,3 % | 80,0 % | +0,7 pp |
| Global-MMLU-Lite (9.200, 23 idiomas) | 87,3 % | 87,1 % | -0,2 pp |
| GPQA Diamond (198, razonamiento activado) | 85,9 % | 86,4 % | +0,5 pp |
| LongBench v2 (503, 128k) | 54,1 % | 48,5 % | -5,6 pp |
| HumanEval (164) | 95,1 % | 97,0 % | +1,9 pp |
| MBPP (500) | 90,8 % | 88,4 % | -2,4 pp |

El autor señala que todas las diferencias salvo LongBench v2 están dentro del ruido estadístico. La caída de LongBench v2 se debe a que el modelo abliterated agota los tokens antes de responder con más frecuencia (178 de 503 frente a 131 del base) cuando se limita a 2.048 tokens por respuesta; en las preguntas que ambos respondieron, la precisión es equivalente (185 aciertos frente a 179). Con 8.192 tokens para las 202 preguntas que alcanzaron respuesta, el modelo acertó 129, y en las 372 que el base respondió obtuvo 218 aciertos frente a 225 del base.

## Requisitos de hardware

- Pesos del modelo: 394 GB en el formato mixto NVFP4/MXFP8/BF16 distribuido.
- VRAM estimada para inferencia: no disponible con precisión; el tamaño de los pesos implica que no cabe en GPUs de consumo individuales y requiere despliegue multi-GPU o en nodos de memoria unificada de gran capacidad.
- GPU recomendadas: no se especifican en la documentación; por el volumen de pesos, se requiere un clúster con múltiples aceleradores de clase数据中心 (A100, H100 o similares) o hardware con suficiente memoria agregada.
- No cabe en GPUs de consumo (RTX 4090, etc.) en su formato oficial.
- Opciones de despliegue: vLLM y SGLang (recetas oficiales del modelo base enlazadas en la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-abliterated | 594B totales / 17B activos | 128k | Apache 2.0 | Sí | Variante sin rechazos del base |
| Inkling-2-Small (base) | 594B totales / 17B activos | 128k | Apache 2.0 | Sí | Tasa de rechazo del 88,6 % |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se han proporcionado datos de otros modelos MoE multimodales de escala similar para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo sigue rechazando aproximadamente un 22,5 % de los prompts dañinos reservados, concentrados en autolesión (67 %), derechos de autor (67 %), acoso y odio (57 %), actividades peligrosas (55 %) y CBRN (50 %).
- La abliteration no elimina los sesgos del modelo base; al contrario, al reducir los rechazos, puede exponerlos con mayor frecuencia y crudeza.
- Riesgo elevado de generar contenido dañino, ilegal o éticamente problemático; el usuario es responsable del cumplimiento legal y de la política de uso aceptable de Thinking Machines.
- Las evaluaciones de seguridad del modelo base no son aplicables a esta variante, según advierte el propio autor.
- En contextos largos, el modelo tiende a razonar más que el base y puede agotar el presupuesto de tokens antes de responder (178 de 503 casos en LongBench v2 con 2.048 tokens).
- El rendimiento en LongBench v2 cae 5,6 puntos respecto al base, lo que desaconseja su uso en tareas de razonamiento sobre documentos extensos con presupuestos de tokens ajustados.
- No se dispone de información sobre idiomas soportados oficialmente ni sobre el rendimiento fuera de los 23 idiomas de Global-MMLU-Lite.
- El tamaño de 394 GB limita su despliegue a infraestructuras de alto coste.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la política de uso aceptable del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benthecarman/Inkling-2-Small-abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Herramienta abliterix (fork del autor): https://github.com/benthecarman/abliterix
- Herramienta abliterix original: https://github.com/wuwangzhang1216/abliterix
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
