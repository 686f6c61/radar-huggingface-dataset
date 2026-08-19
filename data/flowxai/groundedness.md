# flowxai/groundedness

## Resumen

`flowxai/groundedness` es un clasificador cross-encoder diseñado para detectar alucinaciones en la salida de modelos de lenguaje: determina si una frase generada por un LLM está respaldada por las fuentes que se supone que la sustentan. Desarrollado por FLOWX.AI, una plataforma de agentes multi-IA para banca, seguros y logística, este modelo forma parte de su librería `flowx-border`, donde actúa como detector T3 de groundedness. Está basado en `FacebookAI/xlm-roberta-base`, exportado a ONNX fp16 para ejecución en CPU, y soporta 26 idiomas.

El modelo resuelve un problema crítico en sistemas de generación aumentada por recuperación (RAG) y en cualquier pipeline donde un LLM produzca respuestas a partir de documentos: verificar que cada afirmación esté realmente soportada por el contexto. Su relevancia actual radica en que ofrece una solución ligera, multilingüe y desplegable en CPU, con un umbral de decisión calibrado (0.78) que prioriza la precisión sobre la cobertura. A diferencia de otros detectores que usan tres clases (supported, unsupported, contradicted), este modelo simplifica a dos clases (`grounded` y `not_grounded`) porque la tercera clase se colapsa en la práctica.

La arquitectura es un cross-encoder que procesa pares `(source, candidate)` y devuelve una probabilidad de que la frase esté anclada en la fuente. Su ventana de contexto es de 512 tokens, y el README advierte que degrada significativamente por debajo de ese tamaño. El modelo está disponible en HuggingFace con licencia Apache-2.0, aunque actualmente tiene cero descargas y cero likes, lo que sugiere que es un lanzamiento reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa-base (FacebookAI/xlm-roberta-base) |
| Parametros totales | No disponible (XLM-RoBERTa-base tiene ~278M, pero no se especifica el numero exacto para este modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (requiere la ventana completa; degrada por debajo de 256 y falla a 96) |
| Tipos de cuantizacion | ONNX fp16 (exportado para CPU) |
| Idiomas soportados | 26: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, ga, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, tr, az |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp16), safetensors no mencionado |

## Arquitectura y entrenamiento

El modelo es un cross-encoder que toma un par `(source, candidate)` y produce una puntuación binaria de groundedness. Se basa en `xlm-roberta-base`, un transformer multilingüe preentrenado con 278M parámetros, y se ha ajustado específicamente para esta tarea. La salida es una probabilidad para dos clases: `grounded` y `not_grounded`. La decisión de usar dos clases en lugar de tres (supported, unsupported, contradicted) se justifica porque la biblioteca colapsa las dos últimas en una sola acción, y la frontera de tres clases optimizaba un límite que ningún llamador observa realmente.

El entrenamiento se realizó sobre un corpus sintético generado por un script (no se especifica el tamaño total ni la composición). El README menciona una evaluación con 2,062 filas held-out del propio generador, lo que indica que los datos de entrenamiento y validación provienen de la misma distribución sintética. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El modelo se exportó a ONNX fp16 para ejecución eficiente en CPU, lo que lo hace adecuado para despliegues sin GPU.

Una innovación destacable es el umbral de decisión recomendado de 0.78 en lugar de usar argmax. Este umbral se seleccionó mediante un barrido en la validación y se aplicó a un conjunto de 42 probes escritas a mano. El README advierte explícitamente que la curva de validación es casi plana en todo el rango, por lo que el umbral no se elige por distribución sino por un caso específico que otros candidatos fallaban: una contradicción temporal donde la frase "Withdrawals are free from the day the account opens" contra una fuente que dice que las retiradas tienen comisión durante los primeros doce meses y son gratuitas después. Este modelo lo detecta correctamente con una probabilidad de 0.7681, mientras que seis candidatos anteriores lo marcaban como grounded con probabilidades entre 0.9906 y 0.9995.

## Capacidades

- Detección de groundedness: clasifica si una frase generada está respaldada por una fuente dada, en dos clases (`grounded` / `not_grounded`).
- Multilingüe: soporta 26 idiomas, cubriendo la mayoría de lenguas europeas más turco y azerbaiyano.
- Cross-encoder: procesa pares `(source, candidate)` y produce una puntuación de similitud semántica con conciencia de la fuente.
- Ejecución en CPU: exportado a ONNX fp16, no requiere GPU para inferencia.
- Umbral calibrado: recomienda usar un umbral de 0.78 en lugar de argmax para maximizar la precisión en casos difíciles.
- Integración con `flowx-border`: diseñado como detector T3 en la librería de verificación de groundedness de FLOWX.AI.
- No es un modelo generativo: es un clasificador puro, no genera texto.

## Casos de uso

- Verificación de respuestas en sistemas RAG: en un pipeline de generación aumentada por recuperación, el modelo puede evaluar cada frase de la respuesta generada contra los documentos recuperados, descartando afirmaciones no soportadas antes de mostrarlas al usuario final.
- Control de calidad en resúmenes automáticos multilingües: para empresas que generan resúmenes de documentos en varios idiomas, este detector puede validar que cada afirmación del resumen esté presente en el documento original, reduciendo el riesgo de inventar datos.
- Auditoría de alucinaciones en chatbots de atención al cliente: integrado en un flujo de revisión, puede marcar respuestas del chatbot que no se basan en la base de conocimiento corporativa, permitiendo una intervención humana antes de enviar la respuesta al cliente.
- Filtro en generación de contenido legal o financiero: en sectores regulados donde la exactitud es crítica, el modelo puede actuar como guardarraíl para evitar que un LLM emita afirmaciones sobre condiciones contractuales o normativas que no están en las fuentes autorizadas.
- Evaluación de calidad de datasets de entrenamiento: usado como herramienta de análisis, puede identificar pares (fuente, afirmación) mal alineados en datasets sintéticos o curados, ayudando a depurar datos antes de entrenar otros modelos.
- Monitorización en producción de agentes conversacionales: desplegado como servicio independiente, puede registrar la tasa de groundedness de un agente en tiempo real y alertar cuando la proporción de respuestas no ancladas supera un umbral, facilitando la detección temprana de degradación.

## Benchmarks y rendimiento

El README proporciona dos evaluaciones con resultados muy diferentes, que deben interpretarse como preguntas distintas, no como un rango.

**Evaluación sobre corpus sintético (2,062 filas held-out, umbral 0.78, 512 tokens):**

| Metrica | Valor |
|---|---|
| Accuracy global | 0.9471 |
| Recall de not-grounded | 0.9612 |
| Pair accuracy | 0.8991 |
| Rango por idioma | 0.887 (`pl`) a 1.000 |
| Idiomas mas debiles | `pl` 0.887, `en` 0.897, `az` 0.912 |

La pair accuracy es la metrica preferida: el corpus usa pares de fuentes con etiquetas opuestas para la misma candidata, de modo que un modelo que ignorase la fuente puntuaria cerca de cero.

**Evaluacion con 42 probes escritas a mano (adversarial, siete categorias):**

| Configuracion | Accuracy |
|---|---|
| Modelo solo, umbral 0.78 | 0.6905 |
| Modelo + capa de reglas deterministicas de la libreria | 0.7381 |

El README advierte que la evaluacion sintetica mide la generalizacion dentro del estilo de un generador, mientras que las probes escritas a mano son adversariales por construccion. La verdad para un despliegue real se encuentra entre ambos valores.

No se han publicado resultados comparativos con otros modelos de deteccion de groundedness en la informacion disponible.

## Requisitos de hardware

- El modelo pesa aproximadamente 0.6 GB en formato ONNX fp16 (el repo tiene ese tamano), lo que lo hace ligero para inferencia.
- Puede ejecutarse en CPU sin GPU: el README indica explicitamente que esta exportado para CPU.
- VRAM estimada: no aplica para CPU; si se quisiera ejecutar en GPU, cabria en cualquier GPU con al menos 1 GB de VRAM, pero no es necesario.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna con soporte AVX2 es suficiente.
- Opciones de despliegue: ONNX Runtime, Python, integrable en pipelines con `flowx-border`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (no es un modelo generativo).
- Latencia y throughput: no se proporcionan datos numericos, pero al ser un cross-encoder de ~278M parametros en fp16, se espera una latencia de decenas de milisegundos por par en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros detectores de groundedness en la informacion proporcionada. Existen soluciones comerciales como el Groundedness Detection de Azure AI Content Safety, pero no se han publicado comparaciones directas. El modelo se distingue por ser open source (Apache-2.0), multilingue (26 idiomas) y optimizado para CPU, mientras que las alternativas comerciales suelen ser servicios en la nube con coste por llamada y sin transparencia en el umbral.

## Limitaciones y advertencias

- Erro hacia la cautela: el fallo principal son falsos `not_grounded` en afirmaciones genuinamente soportadas. En las 42 probes, 8 de 13 fallos son en esa direccion. Un ejemplo: contra una fuente que dice que las retiradas tienen comision durante los primeros doce meses, la afirmacion "Hay una comision por retiradas anticipadas" se marca como `not_grounded` con 0.8625, a pesar de ser correcta.
- Rendimiento muy variable segun el tipo de datos: la accuracy cae de 0.9471 en el corpus sintetico a 0.6905 en probes escritas a mano. Cualquier despliegue debe medirse con trafico real.
- El umbral de 0.78 no esta elegido por distribucion: la curva de validacion es casi plana, y el umbral se selecciono para atrapar un caso especifico de contradiccion temporal. Esto debilita la evidencia de su calibracion.
- Requiere la ventana completa de 512 tokens: a 256 tokens las puntuaciones se saturan y a 96 tokens el modelo falla en el caso de prueba (lee como grounded lo que deberia ser not_grounded). Truncar el contexto degrada gravemente el rendimiento.
- El detector esta deshabilitado por defecto en las politicas que envian con la libreria `flowx-border`: los autores recomiendan medirlo en trafico propio antes de habilitarlo.
- No se documentan sesgos especificos por idioma o dominio, pero el rendimiento por idioma varia notablemente (de 0.887 en polaco a 1.000 en varios idiomas).
- Riesgo de alucinacion en el propio modelo: como clasificador, puede producir falsos positivos (marcar como grounded algo que no lo es) en casos sutiles, aunque la direccion preferente de error es la contraria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowxai/groundedness
- Repositorio de la libreria `flowx-border`: https://github.com/flowx-ai/border
- Perfil de FLOWX.AI en HuggingFace: https://huggingface.co/flowxai
- Pagina oficial de FLOWX.AI: https://www.flowx.ai/
