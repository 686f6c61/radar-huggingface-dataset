# FerData/clasificacion-texto-transformers

## Resumen

El modelo `FerData/clasificacion-texto-transformers` es un clasificador binario de texto en espanol desarrollado por FerData como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18. Se trata de un BERT diminuto entrenado desde cero con un vocabulario propio de solo 37 tokens, disenado para clasificar comentarios cortos sobre departamentos como `positivo` o `negativo`. Su proposito no es el uso en produccion, sino mostrar de forma completa todas las piezas que componen un modelo publicado en Hugging Face: arquitectura, pesos, tokenizer y codigo de entrenamiento.

El modelo emplea `BertForSequenceClassification` con 2 capas, 2 cabezas de atencion y una dimension oculta de 32, sumando un total de 20.546 parametros. El tokenizer es de tipo `WordLevel`, pasa todo a minusculas y elimina las tildes. Se entreno de forma supervisada sobre un dataset sintetico de 368 comentarios generados a partir de 5 plantillas y 16 adjetivos (8 positivos y 8 negativos), con 294 registros para entrenamiento y 74 para evaluacion.

Su relevancia es exclusivamente didactica: demuestra el flujo completo de publicacion de un modelo Transformer y sirve como material de referencia para quienes se inician en el ecosistema de Hugging Face. No debe confundirse con un modelo de proposito general ni utilizarse en escenarios reales de clasificacion, dado que su vocabulario extremadamente limitado y su dataset sintetico lo hacen inutil fuera del aula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification) |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder de tipo BERT con 2 capas, 2 cabezas de atencion y dimension oculta de 32, configurado para clasificacion de secuencias con 2 etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es `WordLevel` con un vocabulario de 37 tokens, normaliza a minusculas y elimina tildes. El modelo se entreno desde cero, sin partir de un checkpoint preentrenado, lo que constituye una decision deliberada para fines pedagogicos: en un caso real se realizaria fine-tuning sobre un modelo preentrenado del Hub.

El entrenamiento fue supervisado, con funcion de perdida de entropia cruzada calculada por el propio modelo al recibir `labels`, optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16. El dataset es sintetico: 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), divididos en 294 para entrenamiento y 74 para evaluacion. No se emplearon tecnicas de RLHF, DPO ni decodificacion especulativa. La innovacion tecnica destacable es precisamente la ausencia de ella: el modelo ilustra el minimo viable de un Transformer funcional para clasificacion.

## Capacidades

- Clasificacion binaria de texto corto en espanol: asigna la etiqueta `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante el pipeline `text-classification` de Hugging Face Transformers.
- Compatibilidad con Transformers 4 y Transformers 5.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al espanol y, dentro de este, a las 37 palabras de su vocabulario.

## Casos de uso

- Docencia de Transformers: el modelo sirve como ejemplo completo y reproducible para explicar en clase como se compone un modelo publicado en Hugging Face (config, pesos, tokenizer y codigo), ya que incluye `train.py` y `predict.py` en el repositorio.
- Demostracion del flujo de publicacion en el Hub: permite mostrar a estudiantes el proceso completo desde el entrenamiento local hasta la publicacion y el consumo via `pipeline`, cambiando la ruta local por el nombre del repositorio.
- Ilustracion del problema de `[UNK]` y confianza calibrada: el modelo ejemplifica de forma controlada como un clasificador puede responder con seguridad alta (1.00) ante entradas que no comprende, lo que lo convierte en un recurso didactico para ensenar calibracion y evaluacion de modelos.
- Ejercicio de evaluacion critica: el accuracy de 1,000 sobre el conjunto de test, obtenido con las mismas plantillas y adjetivos que en entrenamiento, sirve para discutir en clase por que un resultado perfecto no implica un modelo bueno y como disenar una evaluacion honesta.
- Practica de tokenizacion: el tokenizer `WordLevel` de 37 tokens permite experimentar con normalizacion (minusculas, eliminacion de tildes) y observar directamente el impacto del vocabulario en la inferencia.
- Base para un ejercicio de fine-tuning: el propio autor sugiere partir de un modelo preentrenado en espanol y hacer fine-tuning con comentarios reales, por lo que este modelo puede usarse como punto de partida conceptual para comparar ambos enfoques en un taller practico.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Accuracy (74 comentarios de test) | 1,000 |

El autor advierte explicitamente que este resultado es optimista: los comentarios de test emplean las mismas plantillas y adjetivos que los de entrenamiento, por lo que no refleja capacidad de generalizacion. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 20.546 parametros en safetensors, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es mas que suficiente, y la inferencia en CPU es viable sin problemas.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `pipeline` de Transformers, `text-embeddings-inference` (segun tags del repositorio) y despliegue via endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dado el tamano del modelo, se espera latencia de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Proposito |
|---|---|---|---|---|---|
| FerData/clasificacion-texto-transformers | 20.546 | no disponible | es | MIT | Ejemplo pedagogico |
| BERT-base multilingue (referencia) | ~110 M | 512 tokens | multilingue | Apache 2.0 | Clasificacion general |
| BETO (BERT en espanol) | ~110 M | 512 tokens | es | Apache 2.0 | Clasificacion en espanol |

La comparativa con BERT-base multilingue y BETO se ofrece como referencia de categoria (clasificacion de texto en espanol), pero no se dispone de datos de rendimiento comparables en la informacion proporcionada. El modelo de FerData es entre tres y cuatro ordenes de magnitud mas pequeno que los modelos preentrenados habituales y no persigue la misma finalidad.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para produccion.
- Solo conoce 37 palabras; cualquier otra se convierte en `[UNK]` y el modelo responde igualmente con seguridad alta, lo que puede enganar a quien lo use sin conocer esta limitacion.
- No entiende negaciones ("no es luminoso") ni ironia, porque las frases de entrenamiento no las incluyen.
- El dataset es sintetico y generado por plantillas, por lo que el accuracy de test (1,000) es optimista y no refleja generalizacion.
- Sesgos conocidos: no documentados por el autor, pero derivados del vocabulario y las plantillas sinteticas.
- Riesgo de alucinacion: alto en el sentido de que el modelo produce predicciones confiadas sobre entradas fuera de distribucion.
- Restricciones de licencia: MIT permite uso comercial, pero el autor desaconseja explicitamente el uso real; para produccion recomienda fine-tuning de un modelo preentrenado en espanol con datos reales.
- Modelo y tokenizer son inseparables: publicar el modelo sin su tokenizer lo hace inutilizable, ya que los indices de vocabulario no coincidirian.

## Enlaces

- Hugging Face: https://huggingface.co/FerData/clasificacion-texto-transformers
