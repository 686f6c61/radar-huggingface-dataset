# bhai2000/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario publicado por el usuario `bhai2000` en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo `distilbert/distilbert-base-uncased`, orientado a distinguir si un texto esta relacionado con comida o no. El repositorio es un artefacto de aprendizaje: la model card fue generada automaticamente por el `Trainer` de Transformers e incluye la advertencia explicita de que la descripcion, los usos previstos y el conjunto de datos estan sin documentar ("More information needed").

Arquitectonicamente es un encoder transformer destilado de BERT-base (6 capas, 768 dimensiones ocultas, 12 cabezas de atencion), con 66.955.010 parametros totales contando la cabeza de clasificacion, y un unico checkpoint en `safetensors` dentro de un repositorio de 0,3 GB. La licencia es Apache 2.0 y el pipeline declarado es `text-classification`.

Su relevancia es limitada como modelo de produccion, pero resulta util como ejemplo reproducible de fine-tuning minimo: 10 epocas, 70 pasos totales y un conjunto de evaluacion que alcanza exactamente 1,0 de accuracy con una perdida de validacion de 0,0005, cifras que apuntan a un dataset muy pequeno y probablemente no representativo. No tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer destilado de BERT-base, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones del modelo base DistilBERT) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio solo publica pesos en `safetensors` |
| Idiomas soportados | no disponible; el modelo base `distilbert-base-uncased` esta entrenado principalmente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilacion de BERT-base, con vocabulario WordPiece sin distincion de mayusculas y un limite de 512 posiciones. Sobre esa base se anade una cabeza de clasificacion para la tarea de texto, con lo que el recuento final de parametros asciende a 66.955.010. El pipeline declarado es `text-classification` y el checkpoint se distribuye en `safetensors`.

El entrenamiento consta de 10 epocas con `learning_rate = 0.0001`, batch de 32, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08) y planificador lineal. El detalle relevante es la escala: 7 pasos por epoca y 70 pasos en total implican un conjunto de entrenamiento de aproximadamente 224 muestras (7 x 32), es decir, un dataset minusculo. La perdida de validacion cae de 0,0404 en la primera epoca a 0,0005 en la decima, mientras la accuracy se mantiene en 1,0 desde la epoca 1, lo que sugiere un problema separable de forma trivial o un conjunto de evaluacion demasiado pequeno para ser informativo. No se documenta composicion del dataset, idioma, ni si hubo RLHF/DPO (no aplicable en un clasificador). Versiones de framework declaradas: Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificacion de texto (pipeline `text-classification`), presumiblemente binaria comida / no comida segun el nombre del modelo; el numero exacto de etiquetas no se documenta.
- Ajuste fino supervisado sobre `distilbert-base-uncased`; hereda la tokenizacion WordPiece sin distincion de mayusculas del modelo base.
- Inferencia rapida en CPU: 67 M de parametros permiten ejecucion sin GPU.
- Compatibilidad declarada con Inference Endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo "thinking", vision ni audio.
- Capacidad multilingue no declarada; el modelo base esta entrenado principalmente en ingles.
- No se documentan capacidades adicionales en la model card.

## Casos de uso

- Filtrado de contenidos en foros o comunidades gastronomicas: clasificar mensajes entrantes para enrutar los que hablan de comida hacia un subforo, recetas o moderacion especifica, usando la ventana de 512 tokens del encoder.
- Etiquetado previo en pipelines de datos: preanotar un corpus de textos como "comida" / "no comida" antes de una revision humana, como paso de bajo coste computacional en un flujo de anotacion activa.
- Enrutado en un asistente conversacional: decidir si una consulta de usuario debe derivarse a un modulo de recetas o de restaurantes en lugar de a un modulo generico, con latencia muy baja al ser un modelo de 67 M de parametros.
- Clasificacion de titulares o snippets en un agregador de noticias: separar secciones de gastronomia del resto de contenido con un modelo que cabe en CPU y no requiere GPU dedicada.
- Prototipado y docencia: servir como referencia reproducible de un fine-tuning minimo de DistilBERT (10 epocas, 70 pasos, hiperparametros documentados) para comparar resultados en cursos o experimentos internos.
- Moderacion de resenas de producto: marcar resenas de alimentacion dentro de un catalogo general, siempre que el dominio y el idioma coincidan con el conjunto de entrenamiento original.
- Baseline en experimentos de clasificacion: punto de partida para medir mejoras frente a modelos mayores (BERT-base, DeBERTa) en una tarea concreta de dos clases.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`). Los unicos datos disponibles son los declarados por el autor en la model card, medidos sobre un conjunto de evaluacion no descrito:

| Metrica | Valor | Contexto |
|---|---|---|
| Accuracy (evaluacion) | 1,0 | Conjunto de evaluacion no documentado |
| Loss (evaluacion) | 0,0005 | Epoca 10 |
| Loss (entrenamiento, epoca 1) | 0,3357 | Paso 7 |
| Loss (entrenamiento, epoca 10) | 0,0006 | Paso 70 |
| Pasos totales | 70 | 10 epocas x 7 pasos |
| Batch size | 32 | Entrenamiento y evaluacion |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. La accuracy de 1,0 debe interpretarse con cautela: con 7 pasos por epoca y batch 32, el conjunto de evaluacion es necesariamente muy reducido.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 268 MB de pesos (66,9 M de parametros), coherente con el tamano de repositorio de 0,3 GB; en la practica, menos de 1 GB de memoria total incluyendo activaciones y tokenizador.
- En FP16 los pesos ocuparian unos 134 MB y en INT8 unos 67 MB, aunque no se publican checkpoints cuantizados en el repositorio.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y funciona en CPU sin problemas; no requiere acelerador para uso individual.
- GPU recomendadas: ninguna en particular; para lotes grandes, cualquier GPU con al menos 2 GB de memoria es suficiente.
- Opciones de despliegue: `transformers` pipeline (`text-classification`), Inference Endpoints de HuggingFace (tag `endpoints_compatible`) y exportacion a ONNX Runtime mediante herramientas estandar de Optimum (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bhai2000/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` | 66,9 M | 512 tokens | Clasificacion comida / no comida | Apache 2.0 | Publico en HF, 0 descargas |
| `distilbert-base-uncased` (modelo base) | 66,3 M | 512 tokens | Modelo de representaciones (MLM) | Apache 2.0 | Ampliamente usado, muy descargado |
| `bert-base-uncased` | 110 M | 512 tokens | Modelo de representaciones (MLM) | Apache 2.0 | Referencia estandar en NLP |
| `wincode/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` | no disponible | no disponible | Misma tarea (copia derivada del mismo ejercicio) | no disponible | Publico en HF |
| `Abbassani/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` | no disponible | no disponible | Misma tarea (copia derivada del mismo ejercicio) | no disponible | Publico en HF |

Los mirrors localizados (`wincode`, `Abbassani`) corresponden a variantes del mismo ejercicio de fine-tuning y no aportan datos de rendimiento comparables. No se dispone de benchmarks de terceros que permitan situar este checkpoint frente a alternativas.

## Limitaciones y advertencias

- Model card autogenerada: seccion de descripcion, usos previstos y datos de entrenamiento sin completar ("More information needed"), lo que impide conocer la composicion, el idioma y el dominio del dataset.
- Sobreajuste muy probable: 1,0 de accuracy constante desde la primera epoca y loss de 0,0005 sobre un conjunto de evaluacion no descrito; el rendimiento en datos reales es una incognita.
- Conjunto de entrenamiento estimado en ~224 muestras (70 pasos x batch 32), insuficiente para generalizar a produccion.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y negativos sistematicos fuera de la distribucion de entrenamiento.
- Idiomas soportados no declarados; el modelo base es fundamentalmente ingles, por lo que el comportamiento en castellano no esta garantizado.
- Limite de 512 tokens por entrada; textos mas largos requieren truncado o segmentacion, con perdida de contexto.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero no hay garantias ni soporte del autor; conviene conservar el aviso de licencia y citar la procedencia.
- Sin descargas ni validacion comunitaria: no existe evidencia externa de calidad ni issues resueltos.
- Fecha de creacion y actualizacion registradas como 2026-10-28, con apenas tres minutos entre ambas, lo que sugiere una publicacion automatica sin revision posterior.
- No usar como unico filtro en flujos con consecuencias legales o de negocio; requiere validacion con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhai2000/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Mirror `wincode`: https://huggingface.co/wincode/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Mirror `Abbassani`: https://huggingface.co/Abbassani/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Ficha indexada en aibase (1): https://model.aibase.com/models/details/1924735252866273280
- Ficha indexada en aibase (2): https://model.aibase.com/models/details/1915748764360531970
- Ficha indexada en essamamdani: https://essamamdani.com/ai-models/hf-ryanwlr-learn-hf-food-not-food-text-classifier-distilbert-base-uncased
