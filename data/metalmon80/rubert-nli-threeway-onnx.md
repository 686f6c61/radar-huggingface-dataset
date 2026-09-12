# metalmon80/rubert-nli-threeway-onnx

## Resumen

`metalmon80/rubert-nli-threeway-onnx` es un reempaquetado en formato ONNX del modelo `cointegrated/rubert-base-cased-nli-threeway`, un clasificador de inferencia de lenguaje natural (NLI) en ruso de tres clases construido sobre `BertForSequenceClassification`. El autor de la conversión es el usuario de Hugging Face metalmon80 y el repositorio no introduce pesos nuevos: el grafo se exporta desde el snapshot original y las etiquetas, el tokenizador y la configuración se copian sin modificaciones.

El modelo resuelve una tarea concreta: dado un texto de partida (premisa) y una afirmación (hipótesis), estima la probabilidad de que la hipótesis se siga de la premisa, con las etiquetas `entailment`, `contradiction` y `neutral` en ese orden de salida. Su uso previsto declarado es actuar como verificador de fundamentación de respuestas dentro del toolkit `glossa`, comprobando si una respuesta generada está respaldada por los fragmentos recuperados de una base documental.

Es relevante para quien necesite ejecutar NLI en ruso sin GPU y sin dependencias de PyTorch: el grafo ONNX admite ejes de batch y secuencia dinámicos y está pensado para inferencia en proceso sobre CPU. Se trata de un modelo entrenado exclusivamente en ruso y el propio autor advierte de que su comportamiento en inglés no es fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) con cabeza de clasificación de secuencia, `BertForSequenceClassification`; exportado a grafo ONNX (opset 14) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base declarado es `DeepPavlov/rubert-base-cased`, de tipo BERT-base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings` = 512; el autor recomienda mantener `seq ≤ 512` y trocear premisas mas largas) |
| Tipos de cuantizacion | no disponible; el grafo exportado usa pesos float32 sin cuantizar y no se declaran variantes int8 o similares |
| Idiomas soportados | ruso (ru); el autor advierte de que el modelo no es fiable en ingles |
| Licencia | no disponible; el repositorio de origen no declara licencia explicita y este export no reclama derechos adicionales |
| Formato de pesos | ONNX (`.onnx`) para el grafo, mas `config.json`, `tokenizer.json` y `vocab.txt` copiados del snapshot original |
| Tamano del repositorio | 0,7 GB |
| Etiquetas de salida | indice 0: `entailment`, indice 1: `contradiction`, indice 2: `neutral` (orden softmax) |
| Firma de entrada | `input_ids`, `attention_mask`, `token_type_ids` (int64, `[batch, seq]`) |
| Firma de salida | `logits` (float32, `[batch, 3]`) |
| Pipeline declarado | zero-shot-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder de tipo BERT con una cabeza de clasificación de tres clases. El repositorio no entrena ni afina nada: parte del snapshot de `cointegrated/rubert-base-cased-nli-threeway`, que a su vez deriva de `DeepPavlov/rubert-base-cased`, y exporta el modelo con `torch.onnx.export` usando opset 14 y `do_constant_folding=True`, con ejes `batch` y `seq` dinámicos y un envoltorio que devuelve únicamente los `logits`. Según el autor, el grafo exportado es numéricamente fiel al modelo en PyTorch, con salidas softmax que coinciden en torno a 1e-3 en CPU.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas más allá de la propia conversión a ONNX. La innovación del repositorio es, por tanto, de empaquetado y despliegue: permitir inferencia NLI en proceso sobre CPU con el runtime de ONNX y sin cargar PyTorch, manteniendo la configuración y el tokenizador originales. El pipeline declarado (`zero-shot-classification`) es una consecuencia del uso de NLI como clasificador: puntuando `P(entailment)` frente a distintas etiquetas candidatas se puede etiquetar texto sin entrenamiento específico.

## Capacidades

- Inferencia de lenguaje natural en ruso con tres clases: implicación (`entailment`), contradicción (`contradiction`) y neutralidad (`neutral`).
- Verificación de fundamentación de respuestas: comparar un fragmento recuperado (premisa) con una afirmación de una respuesta (hipótesis) y puntuar la probabilidad de implicación.
- Clasificación zero-shot de textos rusos mediante el esquema de NLI como clasificador.
- Detección de contradicciones entre pares de textos (documentos, resúmenes, políticas).
- Inferencia en proceso sobre CPU mediante ONNX Runtime, con ejes de batch y secuencia dinámicos.
- Soporte de lotes (`batch`) para procesar múltiples pares premisa-hipótesis en una sola pasada.
- No incluye tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de razonamiento explícito, visión ni audio.
- Capacidad multilingüe: no; el modelo está entrenado en ruso y su uso en inglés no es fiable según el propio autor.

## Casos de uso

- Verificación de respuestas en pipelines RAG en ruso: el modelo es el verificador declarado del toolkit `glossa`; se le pasa el fragmento recuperado como premisa y la afirmación generada por el LLM como hipótesis, y se filtra o corrige la respuesta cuando `P(entailment)` es baja.
- Detección de alucinaciones en asistentes en ruso: comparar cada frase de la respuesta con las fuentes citadas y marcar como no soportadas aquellas con alta probabilidad de contradicción o neutralidad.
- Clasificación zero-shot de textos rusos: usar las etiquetas como hipótesis (por ejemplo, "El texto trata sobre facturación") y asignar la clase con mayor `P(entailment)`, sin necesidad de datos etiquetados ni reentrenamiento.
- Consistencia de resúmenes: comprobar si cada afirmación de un resumen se sigue del documento original, útil en flujos de generación automática de resúmenes en ruso.
- Control de calidad documental y legal: detectar pares de cláusulas o versiones de un mismo documento que se contradicen entre sí.
- Filtrado y moderación de contenido basado en políticas: verificar si un mensaje contradice una política escrita, usando la política como premisa y el mensaje como hipótesis.
- Anotación asistida de corpus NLI en ruso: preetiquetar pares premisa-hipótesis para revisión humana posterior, aprovechando el procesamiento por lotes.
- Despliegue en entornos sin GPU o con requisitos de confidencialidad: al ejecutarse sobre ONNX en CPU, puede integrarse en servicios on-premise donde los datos no deben salir de la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la fidelidad numérica de la exportación (coincidencia de las salidas softmax en torno a 1e-3 frente al modelo PyTorch en CPU), que es una medida de equivalencia del grafo y no un resultado de evaluación de la tarea.

## Requisitos de hardware

- El repositorio ocupa 0,7 GB, lo que da una idea del peso en disco del grafo ONNX junto con los ficheros de tokenización y configuración.
- Inferencia prevista en CPU mediante ONNX Runtime; no requiere GPU.
- Cabe en cualquier GPU de consumo (serie RTX, GTX o integradas compatibles con ONNX Runtime) por su tamano, aunque el caso de uso declarado es la ejecución en proceso sobre CPU.
- La VRAM exacta necesaria no está indicada en la información disponible; depende del lote y de la longitud de secuencia, que son ejes dinámicos del grafo.
- El límite práctico de memoria de activaciones viene dado por la longitud de secuencia, acotada en 512 tokens por `max_position_embeddings`.
- Opciones de despliegue: ONNX Runtime es el runtime natural dado el formato. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo y formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|---|
| `metalmon80/rubert-nli-threeway-onnx` | ONNX (float32) | no disponible | 512 tokens | ruso | no disponible | Reempaquetado para inferencia en proceso en CPU; sin cambios en los pesos |
| `cointegrated/rubert-base-cased-nli-threeway` | PyTorch (Hugging Face) | no disponible | no disponible (el export hereda 512) | ruso | no declarada | Modelo de origen; requiere PyTorch para su uso |
| `DeepPavlov/rubert-base-cased` | PyTorch (Hugging Face) | no disponible | no disponible | ruso | no disponible | Modelo base sobre el que se construye el NLI; no incluye cabeza de inferencia de tres clases |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado en ruso: el propio autor advierte de que discrimina bien implicación y contradicción en ruso pero no es fiable en inglés, y que una prueba en inglés no sirve como verificación de salud del modelo.
- Longitud de contexto limitada a 512 tokens; las premisas más largas deben trocearse y evaluarse por separado, lo que puede fragmentar la evidencia.
- Riesgo de alucinación no evaluado aquí: al ser un clasificador NLI, su salida es una probabilidad sobre tres clases y puede equivocarse en pares con matices, negaciones complejas o vocabulario fuera de dominio.
- Sesgos conocidos: no disponibles; el repositorio no documenta análisis de sesgo.
- Licencia no disponible: el repositorio de origen no declara licencia explícita y este export no reclama derechos adicionales, por lo que el uso comercial queda sujeto a los términos del repositorio original y debe verificarse antes de desplegarlo en producción.
- Es un artefacto derivado: se recomienda contrastar cualquier resultado con el modelo de origen, dado que no hay evaluación publicada del export.
- El orden de las etiquetas (`entailment`, `contradiction`, `neutral`) procede del `config.json` de origen y debe respetarse al interpretar los índices de la salida softmax; invertirlo alteraría por completo la verificación.
- El repositorio no registra descargas ni likes y no incluye demos, lo que limita la validación comunitaria.
- No admite tool calling ni razonamiento multi-paso, por lo que no sustituye a un LLM en tareas generativas o agénticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metalmon80/rubert-nli-threeway-onnx
- Modelo de origen: https://huggingface.co/cointegrated/rubert-base-cased-nli-threeway
- Modelo base declarado: `DeepPavlov/rubert-base-cased` (referenciado en la model card)
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a herramientas de edicion de fotos y no guardan relacion con el contenido de esta ficha.
