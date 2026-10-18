# muhammediyunes/dwago

## Resumen
dwago es un modelo de clasificación de texto publicado por el usuario muhammediyunes en HuggingFace. Según los metadatos, tiene 30.337.921 parámetros, se etiqueta como entrenado desde cero (`trained-from-scratch`), se distribuye como pesos abiertos aunque con acceso restringido y está orientado a inferencia de lenguaje natural, clasificación de intenciones, moderación y toma de decisiones. La información disponible no detalla la arquitectura interna, la longitud de contexto ni el conjunto de entrenamiento.

Por su tamaño, se sitúa en la categoría de clasificadores pequeños de aproximadamente 30 M de parámetros, lo que en principio permite despliegues con requisitos de cómputo moderados, incluidos CPU y GPUs de gama de consumo. Los idiomas declarados son `multilingual` y `en`, sin que se especifique la cobertura real ni la calidad por idioma. El repositorio ocupa 0,2 GB y ofrece pesos en PyTorch, safetensors y ONNX.

Su relevancia práctica está en tareas de etiquetado y enrutamiento dentro de pipelines de NLP, donde un clasificador compacto puede reducir coste frente a un modelo generativo. Sin embargo, el acceso es `gated`, la licencia `dwago-evaluation-license` no es estándar y no se han publicado benchmarks ni documentación sobre datos, sesgos o rendimiento. Debe tratarse, por tanto, como un candidato experimental hasta disponer de una evaluación técnica completa.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 30.337.921 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se documentan checkpoints cuantizados oficiales |
| Idiomas soportados | `multilingual`, `en` (según metadatos; cobertura no detallada) |
| Licencia | `dwago-evaluation-license` (licencia `other`; acceso `gated`) |
| Formato de pesos | safetensors, ONNX, PyTorch |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | `text-classification` |
| Acceso | restringido (`gated`); requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La información disponible no especifica la arquitectura del modelo. No se indica si se trata de un transformer, una CNN, un modelo lineal o una arquitectura híbrida; tampoco se documentan el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud máxima de secuencia. El único dato estructural verificable es el recuento de 30.337.921 parámetros y el tag `trained-from-scratch`, que sugiere un entrenamiento desde cero y no un fine-tuning declarado de un modelo preentrenado, aunque no se detalla el procedimiento.

Tampoco hay información sobre volumen de tokens, composición del dataset, idiomas de entrenamiento, técnicas de alineación como RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Al ser un modelo de clasificación, la salida esperada son etiquetas o probabilidades por clase, no texto generativo. Cualquier afirmación sobre su calidad, robustez o sesgos requeriría la model card completa o una evaluación independiente, que no se ha publicado en la información disponible.

## Capacidades
- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que asigna etiquetas o probabilidades a una entrada textual.
- Inferencia de lenguaje natural (NLI): el tag `natural-language-inference` indica uso previsto para tareas de implicación, contradicción o neutralidad, aunque no se detallan las clases exactas.
- Clasificación de intenciones: el tag `intent-classification` apunta a enrutamiento de consultas en asistentes conversacionales o sistemas de atención al cliente.
- Moderación de contenido: el tag `moderation` sugiere clasificación de textos según categorías de riesgo o política, sin que se documenten las taxonomías.
- Apoyo a la toma de decisiones: el tag `decision-making` indica uso como componente de clasificación para reglas o flujos de decisión, no razonamiento generativo.
- Capacidades multilingües: se declaran `multilingual` y `en`, pero no se especifica la lista de idiomas ni la calidad por lengua.
- Exportación a ONNX: el tag `onnx` facilita el despliegue en ONNX Runtime.
- No documentado: no hay evidencia de generación de texto, código, matemáticas, visión, audio, tool calling, function calling, agentes, razonamiento multi-paso ni modo `thinking`.

## Casos de uso
- Moderación de comentarios en foros o prensa: usar el clasificador como filtro previo a la publicación para asignar una puntuación de riesgo y derivar los casos dudosos a revisión humana. Su tamaño contenido permite ejecutarlo junto al servicio web, aunque requiere calibrar umbrales con datos propios.
- Enrutamiento de intenciones en chatbots: clasificar la consulta del usuario y dirigirla al flujo, departamento o modelo generativo adecuado. Un modelo de 30 M de parámetros reduce el coste por turno frente a invocar un LLM en cada petición.
- Validación de respuestas en pipelines RAG: utilizar la capacidad declarada de NLI para comprobar si una respuesta se sigue de un pasaje recuperado y filtrar posibles inconsistencias antes de mostrarla. Es un uso adecuado por el tag `natural-language-inference`, pero sin benchmarks no puede garantizarse su fiabilidad.
- Triaje de tickets de soporte: clasificar solicitudes por categoría, urgencia o intención para asignarlas al equipo correspondiente. El modelo puede ejecutarse por lotes en ONNX Runtime y procesar textos cortos con coste computacional bajo.
- Etiquetado de contenido en catálogos y reseñas: asignar categorías o etiquetas a descripciones y opiniones en inglés y otros idiomas declarados. Es adecuado para volúmenes altos donde un modelo grande sería innecesario.
- Prefiltro de seguridad antes de llamar a un LLM: detectar intenciones o contenido no permitido en formularios y APIs antes de enviar la petición a un modelo generativo. Su tamaño permite incluirlo en la ruta crítica sin un coste elevado.
- Evaluación de pipelines de clasificación: emplear el modelo como componente o baseline en experimentos de evaluación, teniendo en cuenta que la licencia se denomina de evaluación y el acceso es restringido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan métricas de clasificación como accuracy, F1, precisión, recall o AUC, ni comparaciones con otros modelos.

## Requisitos de hardware
- Memoria de pesos estimada a partir de 30.337.921 parámetros: aproximadamente 121 MB en FP32, 61 MB en FP16 y 30 MB en INT8. Es un cálculo teórico y no implica que existan checkpoints oficiales en esas precisiones.
- VRAM estimada para inferencia: orientativamente inferior a 1 GB para lote 1 y secuencias cortas en FP16 o INT8, adicional al overhead del runtime. No hay mediciones publicadas.
- GPU recomendadas: no se especifican. Por tamaño, cabe previsiblemente en GPUs de consumo como GTX 1650, RTX 3050 o RTX 4090; A100 o H100 no son necesarias.
- CPU: el modelo es susceptible de ejecutarse en CPU para cargas moderadas, especialmente con exportación ONNX.
- Despliegue: PyTorch y ONNX Runtime son las opciones documentadas por los tags. No se confirma compatibilidad con HuggingFace Transformers, vLLM, llama.cpp, Ollama o TGI; para un clasificador pequeño estos runtimes no son habituales salvo soporte específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de resultados de rendimiento de dwago ni de una comparación cuantitativa publicada. Para no inventar cifras, solo se comparan los datos verificables; las alternativas se indican como familias de referencia, sin atribuir métricas que no se han evaluado frente a este modelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dwago | 30.337.921 | no disponible | no disponible | `dwago-evaluation-license` | `gated` |
| Clasificadores basados en DistilBERT | no disponible en esta ficha | no disponible | no comparado | varía según modelo | pública, según modelo |
| Clasificadores basados en MiniLM | no disponible en esta ficha | no disponible | no comparado | varía según modelo | pública, según modelo |

## Limitaciones y advertencias
- Licencia no estándar: `dwago-evaluation-license` no permite asumir uso comercial, redistribución o producción sin revisar el texto completo. El nombre sugiere finalidad de evaluación, pero no se dispone de sus términos.
- Acceso restringido: el repositorio es `gated` y requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la integración automatizada.
- Sin benchmarks: no hay métricas de accuracy, F1 ni evaluaciones independientes; no se puede afirmar su calidad frente a alternativas.
- Sin documentación de entrenamiento: se desconocen el dataset, el volumen de tokens, la composición lingüística y los posibles sesgos.
- Idiomas: se declaran `multilingual` y `en`, pero no se detalla la cobertura. No debe asumirse un rendimiento adecuado en castellano sin validación específica.
- Contexto desconocido: no se especifica la longitud máxima de entrada; no es recomendable usarlo con documentos largos sin comprobar el límite real.
- Errores de clasificación: como todo clasificador, puede producir falsos positivos y falsos negativos. En moderación o seguridad no debería ser la única barrera.
- Calibración desconocida: no se documenta si las probabilidades están calibradas, algo crítico si se usan umbrales automáticos.
- Capacidad limitada: 30 M de parámetros es un tamaño reducido para tareas ambiguas o de razonamiento complejo.
- Validación comunitaria nula: 0 descargas y 0 likes en los metadatos, sin evidencia de uso o revisión por terceros.
- Decisiones de alto riesgo: no debe emplearse en salud, justicia, empleo o crédito sin una auditoría específica de sesgos, robustez y cumplimiento normativo.

## Enlaces
- HuggingFace: https://huggingface.co/muhammediyunes/dwago
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
