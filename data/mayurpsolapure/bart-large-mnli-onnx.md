# mayurpsolapure/bart-large-mnli-onnx

## Resumen

`mayurpsolapure/bart-large-mnli-onnx` es una conversión a formato ONNX del modelo `facebook/bart-large-mnli`, un transformer encoder-decoder de tipo BART entrenado por Facebook AI Research para inferencia de lenguaje natural (NLI) sobre el corpus MultiNLI. El autor del repositorio, `mayurpsolapure`, publica únicamente los pesos en formato ONNX bajo licencia Apache 2.0, sin model card descriptiva, sin métricas declaradas y sin documentación sobre el proceso de exportación.

El modelo base es ampliamente utilizado en la práctica como clasificador zero-shot: se reformula una tarea de clasificación como una hipótesis NLI ("este texto trata sobre {etiqueta}") y se mide la probabilidad de entailment. La versión ONNX busca facilitar el despliegue en entornos de inferencia sin PyTorch, como ONNX Runtime, servicios en C#/.NET, aplicaciones web en el navegador o dispositivos con recursos limitados.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no incluye pipeline declarado, no especifica idiomas soportados ni proporciona detalles sobre la exportación (opsets, precisión, dynamic axes). Se trata, por tanto, de un artefacto derivado de un modelo conocido, no de un modelo nuevo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) heredada del modelo base `facebook/bart-large-mnli`; la exportación es a ONNX |
| Parametros totales | no disponible en la información proporcionada (el modelo base BART-large tiene aproximadamente 407 M de parámetros, dato no confirmado en este repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base admite hasta 1024 tokens posicionales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es BART, un transformer encoder-decoder con atención bidireccional en el encoder y autorregresiva en el decoder, preentrenado con un objetivo de denoising (corrupción de texto y reconstrucción). El modelo base `facebook/bart-large-mnli` fue ajustado sobre MultiNLI para la tarea de inferencia de lenguaje natural con tres etiquetas: entailment, neutral y contradiction.

No se dispone de información sobre el proceso de exportación a ONNX: se desconoce el opset utilizado, si se aplicaron optimizaciones (fusión de operadores, quantización, graph optimization), si los ejes son dinámicos o estáticos, y si se exportaron por separado encoder y decoder. Tampoco hay datos sobre el dataset de ajuste más allá de lo que se deduce del nombre del modelo base, ni sobre técnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación zero-shot mediante reformulación NLI: asignar etiquetas arbitrarias a un texto calculando probabilidades de entailment frente a hipótesis generadas.
- Inferencia de lenguaje natural de tres clases (entailment, neutral, contradiction) sobre pares premisa-hipótesis.
- Generación de texto condicionada (el decoder BART está presente en los pesos), aunque el ajuste del modelo base está orientado a clasificación y no a generación abierta de calidad.
- Ejecución en ONNX Runtime, lo que permite despliegue en Python, C++, C#, Java, JavaScript y entornos sin PyTorch.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles según la model card; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Clasificación de tickets de soporte: usar el modelo como clasificador zero-shot para asignar categorías (facturación, incidencia técnica, cancelación) sin entrenamiento adicional, aprovechando la inferencia NLI sobre textos cortos.
- Moderación de contenido en pipelines sin GPU: al estar en ONNX, puede ejecutarse con ONNX Runtime en CPU para etiquetar comentarios como tóxicos o no tóxicos mediante hipótesis predefinidas.
- Enrutamiento de consultas en asistentes conversacionales: clasificar la intención del usuario en un conjunto cerrado de intenciones antes de derivar a un modelo generativo mayor, reduciendo coste por petición.
- Análisis de sentimiento zero-shot en reseñas: definir etiquetas como "positivo", "negativo" o "neutro" y obtener probabilidades sin dataset etiquetado, útil en dominios con pocos datos.
- Despliegue en aplicaciones .NET o Java: integrar el modelo ONNX en servicios empresariales que no disponen de stack Python, usando las APIs nativas de ONNX Runtime.
- Detección de contradicciones en bases de conocimiento: comparar pares de frases (premisa e hipótesis) para señalar inconsistencias entre documentos, aprovechando la tarea NLI nativa del modelo.
- Prototipado rápido en el navegador: ejecutar el modelo con ONNX Runtime Web para demos de clasificación sin backend, siempre que el tamaño del artefacto lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base BART-large en FP32 ocupa aproximadamente 1,6 GB de pesos, pero el repositorio no confirma el tamaño del artefacto ONNX ni la precisión de exportación.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, cualquier GPU con al menos 2-4 GB de VRAM podría ejecutarlo en FP32, pero no hay confirmación en el repositorio.
- Compatibilidad con GPU de consumo: probable en RTX 3060, RTX 4060 y superiores si el artefacto mantiene el tamaño del modelo base, aunque no está verificado.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript), ONNX Runtime Web, y potencialmente integración con servidores de inferencia compatibles con ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mayurpsolapure/bart-large-mnli-onnx` | ONNX | no disponible (base BART-large ~407 M) | no disponible (base 1024 tokens) | Apache 2.0 | Hugging Face, 0 descargas |
| `facebook/bart-large-mnli` | PyTorch (safetensors/bin) | ~407 M | 1024 tokens | MIT | Hugging Face, ampliamente usado |
| `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` | PyTorch | ~184 M | 512 tokens | MIT | Hugging Face, referencia en zero-shot NLI |
| `cross-encoder/nli-deberta-v3-base` | PyTorch | ~184 M | 512 tokens | Apache 2.0 | Hugging Face |

La comparativa se basa en el modelo base declarado en el nombre del repositorio; los datos del artefacto ONNX concreto (tamaño, opset, precisión) no están disponibles. Frente a las alternativas DeBERTa-v3, el modelo BART-large es más pesado y con mayor latencia, aunque su encoder-decoder permite también generación.

## Limitaciones y advertencias

- El repositorio no incluye model card, documentación de exportación ni métricas; no hay garantía de que la conversión a ONNX sea fiel al modelo original.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Riesgo de alucinación y de clasificaciones erróneas en dominios alejados de MultiNLI; el modelo base está ajustado sobre pares premisa-hipótesis en inglés y puede degradarse con textos largos, informales o multilingües.
- Idiomas soportados no declarados; se asume inglés por herencia del modelo base, pero no está confirmado.
- Sesgos heredados del corpus MultiNLI y de los datos de preentrenamiento de BART (fuentes web con sesgos demográficos y culturales), no documentados en este repositorio.
- La licencia Apache 2.0 del artefacto no exime de verificar la licencia del modelo base (`facebook/bart-large-mnli`, MIT) y de los datos de entrenamiento originales para uso comercial.
- No se especifica la longitud máxima de secuencia soportada por el grafo ONNX exportado; si los ejes son estáticos, podría estar limitada a un valor concreto no documentado.
- Ausencia de información sobre cuantización: no se puede asumir que el artefacto sea ligero ni apto para dispositivos de bajos recursos sin verificarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mayurpsolapure/bart-large-mnli-onnx
- Modelo base: https://huggingface.co/facebook/bart-large-mnli
- Paper de BART: https://arxiv.org/abs/1910.13461
- Paper de MultiNLI: https://arxiv.org/abs/1704.05426
- ONNX Runtime: https://onnxruntime.ai/
