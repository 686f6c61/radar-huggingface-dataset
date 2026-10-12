# dleemiller/finecat-nli-l

## Resumen

FineCat-NLI Large (`dleemiller/finecat-nli-l`) es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por Lee Miller sobre `answerdotai/ModernBERT-large` y afinado desde el checkpoint `tasksource/ModernBERT-large-nli`. No es un modelo generativo: recibe un par de textos (premisa, hipotesis) y devuelve una de tres etiquetas —`entailment` (0), `neutral` (1) o `contradiction` (2)—, lo que lo convierte en un componente de reranking y clasificacion zero-shot dentro de pipelines RAG o de moderacion de contenido.

El entrenamiento combina el dataset `dleemiller/FineCat-NLI` (1.024.986 ejemplos, compilacion depurada de seis fuentes NLI con filtrado de calidad y reduccion de muestras faciles) con destilacion de logits desde `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, un modelo de referencia en ANLI. La perdida empleada suma entropia cruzada y error cuadratico medio con pesos iguales (alpha = beta = 0.5).

Con 395,8 millones de parametros, el modelo busca el equilibrio entre el rendimiento de los grandes NLI basados en DeBERTa-v3-large (hasta 435 M de parametros y un consumo de VRAM notablemente superior) y la eficiencia de la arquitectura ModernBERT. En la evaluacion declarada por el autor alcanza un F1-micro de 0,8678 en el split de desarrollo de FineCat-NLI y supera a su modelo base en casi todos los conjuntos salvo `anli_r1`, `anli_r2` y `anli_r3`. La model card advierte de que el modelo ha sido superado por `finecat-nli-v2-l`, por lo que se recomienda ese checkpoint para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT-large (transformer encoder bidireccional) |
| Parametros totales | 395.834.371 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (ModernBERT-large esta disenado para contextos largos, pero no se especifica el valor concreto de este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan versiones GGUF, AWQ o GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,8 GB |
| Libreria | sentence-transformers |
| Pipeline declarado | zero-shot-classification |
| Descargas / likes | 2534 / 6 |
| Fecha de creacion | 2025-10-26 |
| Ultima actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: la premisa y la hipotesis se concatenan y se procesan conjuntamente por el encoder, de modo que la atencion cruzada entre ambos textos se calcula en todas las capas. El backbone es ModernBERT-large, la arquitectura de encoder moderna de Answer.AI que sustituye las positional embeddings absolutas por rotary positional embeddings (RoPE) y alterna atencion local y global. El modelo parte del checkpoint ya afinado para NLI `tasksource/ModernBERT-large-nli`, lo que le aporta una base solida en MNLI y SNLI antes del ajuste especifico.

El ajuste final se realiza sobre `dleemiller/FineCat-NLI`, una compilacion de seis grandes fuentes NLI (MNLI, SNLI, ANLI, WANLI, LingNLI y el propio conjunto agregado) con cribado de calidad y recorte de ejemplos triviales en el split de entrenamiento, que totaliza 1.024.986 pares. Ademas, se aplica destilacion de logits desde `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, especialmente fuerte en ANLI. La funcion de perdida es `L = alpha * L_CE(z_s, y) + beta * L_MSE(z_s, z_t)` con alpha = beta = 0.5, es decir, entropia cruzada respecto a las etiquetas reales mas error cuadratico medio respecto a los logits del profesor. La funcion de perdida declarada en las etiquetas del repositorio es `CrossEntropyLoss`. No se documentan fases de RLHF ni DPO.

## Capacidades

- Clasificacion de pares de textos en tres categorias: `entailment`, `neutral` y `contradiction`, con el mapeo de etiquetas 0, 1 y 2 respectivamente.
- Reranking de candidatos en pipelines de recuperacion: dado un par (consulta, documento) puede puntuar la relacion semantica y reordenar resultados.
- Clasificacion zero-shot: reformulando la tarea como NLI (premisa = texto, hipotesis = plantilla "esto es sobre X") se puede usar para etiquetado sin entrenamiento especifico, tal como declara el pipeline `zero-shot-classification`.
- Deteccion de contradicciones y consistencia factica, util para verificacion de respuestas generadas.
- Procesamiento de pares en lote: `model.predict(pairs)` devuelve un array de forma (n, 3) con los logits por clase.
- No genera texto, no soporta tool calling ni function calling, y no dispone de modo de razonamiento extendido, vision ni audio.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de un unico paso.
- Capacidad multilingue: no disponible; el modelo esta etiquetado como `en` y los datasets de entrenamiento son mayoritariamente en ingles.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperacion densa de, por ejemplo, 50 fragmentos, el cross-encoder puntua cada par (pregunta, fragmento) y reordena los resultados antes de pasarlos al modelo generativo, mejorando la precision del contexto final.
- Deteccion de alucinaciones: dada una respuesta generada y el documento fuente, el modelo clasifica si la respuesta es `entailment`, `neutral` o `contradiction` respecto al contexto, lo que permite descartar afirmaciones no respaldadas.
- Clasificacion de contenido zero-shot: definir categorias de moderacion mediante hipotesis en lenguaje natural y etiquetar textos sin necesidad de entrenar un clasificador especifico por taxonomia.
- Deduplicacion semantica y agrupacion: comprobar si dos descripciones, titulares o fichas de producto afirman lo mismo para fusionar registros duplicados.
- Verificacion de hechos en pipelines editoriales: contrastar afirmaciones de un borrador contra una base documental y marcar las contradicciones antes de publicar.
- Filtrado de datos de entrenamiento: descartar pares de instruccion-respuesta inconsistentes en la construccion de datasets, usando la clase `contradiction` como senal de descarte.
- Busqueda semantica con reordenacion en atencion al cliente: dado un ticket y una base de articulos de ayuda, ordenar los articulos mas pertinentes y descartar los que contradicen el problema descrito.
- Evaluacion automatica de resumenes: comprobar si cada frase del resumen esta implicada por el documento original.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el split de desarrollo de `dleemiller/FineCat-NLI`:

| Metrica | Valor |
|---|---|
| F1 macro | 0,8663 |
| F1 micro | 0,8678 |
| F1 ponderado | 0,8674 |

Evaluacion NLI ampliada (F1-micro, equivalente a exactitud) medida con tamano de lote 32 en una Nvidia Blackwell PRO 6000 Max-Q. La columna `finecat` corresponde al conjunto propio:

| Modelo | finecat | mnli | mnli_mismatched | snli | anli_r1 | anli_r2 | anli_r3 | wanli | lingnli | Throughput (muestras/s) | Memoria GPU pico (MB) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dleemiller/finecat-nli-v2-l` | 0,8359 | 0,9165 | 0,9127 | 0,9328 | 0,7740 | 0,6020 | 0,5733 | 0,7674 | 0,8776 | 539,04 | 1838,06 |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | 0,8233 | 0,9121 | 0,9079 | 0,8898 | 0,7960 | 0,6830 | 0,6400 | 0,7700 | 0,8821 | 454,96 | 3250,44 |
| `dleemiller/finecat-nli-l` | 0,8227 | 0,9152 | 0,9265 | 0,9162 | 0,7480 | 0,5700 | 0,5433 | 0,7706 | 0,8742 | 539,04 | 1838,06 |
| `tasksource/ModernBERT-large-nli` | 0,7959 | 0,8983 | 0,9229 | 0,9188 | 0,7260 | 0,5110 | 0,4925 | 0,6978 | 0,8504 | 543,44 | 1838,06 |
| `dleemiller/ModernCE-large-nli` | 0,7811 | 0,9088 | 0,9205 | 0,9273 | 0,6630 | 0,4860 | 0,4408 | 0,6576 | 0,8566 | 540,74 | 1838,06 |
| `cross-encoder/nli-deberta-v3-large` | 0,7618 | 0,9019 | 0,9049 | 0,9220 | 0,5300 | 0,4170 | 0,3758 | 0,6548 | 0,8466 | 448,35 | 3250,44 |

Observaciones sobre los datos: `finecat-nli-l` obtiene el mejor resultado en `mnli_mismatched` (0,9265) y en `wanli` (0,7706), y queda por detras del modelo destilado `finecat-nli-v2-l` y de `MoritzLaurer/DeBERTa-v3-large-...` en las tres rondas de ANLI. En throughput y memoria, el modelo empata con la familia ModernBERT (539,04 muestras/s, 1838,06 MB) y supera a los DeBERTa-v3-large (454,96 y 448,35 muestras/s con 3250,44 MB). Los valores no estan verificados de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 800 MB solo para los pesos (395,8 M de parametros); el consumo medido en evaluacion con lote 32 es de 1838,06 MB de pico.
- VRAM estimada en FP32: aproximadamente 1,6 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; en la evaluacion oficial se uso una Nvidia Blackwell PRO 6000 Max-Q. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con memoria suficiente pueden ejecutar inferencia en lotes moderados.
- Cabe holgadamente en GPU de consumo: si, sin necesidad de cuantizacion, dado el tamano del modelo.
- Opciones de despliegue: la via documentada es `sentence-transformers` (`CrossEncoder`); tambien es cargable con `transformers` al ser un modelo `ModernBertForSequenceClassification`. Otras alternativas (Text Embeddings Inference, ONNX Runtime, llama.cpp/Ollama) no estan documentadas para este checkpoint.
- Latencia y throughput: 539,04 muestras/s y 1838,06 MB de pico con lote 32 segun el autor, medidos en una Nvidia Blackwell PRO 6000 Max-Q. No se publican cifras de latencia por peticion en configuracion de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-micro finecat | F1-micro mnli | ANLI r1/r2/r3 | Throughput (muestras/s) | Memoria pico (MB) | Licencia |
|---|---|---|---|---|---|---|---|---|
| `dleemiller/finecat-nli-l` | 395,8 M | no disponible | 0,8227 | 0,9152 | 0,7480 / 0,5700 / 0,5433 | 539,04 | 1838,06 | no disponible |
| `dleemiller/finecat-nli-v2-l` | no disponible | no disponible | 0,8359 | 0,9165 | 0,7740 / 0,6020 / 0,5733 | 539,04 | 1838,06 | no disponible |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | no disponible | no disponible | 0,8233 | 0,9121 | 0,7960 / 0,6830 / 0,6400 | 454,96 | 3250,44 | no disponible |
| `tasksource/ModernBERT-large-nli` | no disponible | no disponible | 0,7959 | 0,8983 | 0,7260 / 0,5110 / 0,4925 | 543,44 | 1838,06 | no disponible |
| `cross-encoder/nli-deberta-v3-large` | no disponible | no disponible | 0,7618 | 0,9019 | 0,5300 / 0,4170 / 0,3758 | 448,35 | 3250,44 | no disponible |

De la comparativa se desprende que la ventaja principal de este checkpoint frente a los DeBERTa-v3-large equivalentes no esta en la precision bruta (donde el modelo de MoritzLaurer gana en ANLI), sino en el coste: misma tasa de procesamiento que el resto de la familia ModernBERT y aproximadamente un 43 % menos de memoria GPU pico que los DeBERTa-v3-large. Los datos de parametros y contexto de los modelos comparados no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- Modelo superado: la propia model card indica que ha sido reemplazado por `finecat-nli-v2-l` y recomienda usar ese checkpoint en su lugar.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas producira resultados poco fiables.
- Licencia no disponible: al no declararse una licencia explicita en el repositorio, no hay garantia de uso comercial y conviene contactar con el autor antes de integrarlo en un producto.
- Es un clasificador, no un generador: no puede redactar, resumir ni responder preguntas por si mismo; solo puntua pares de textos.
- Riesgo de falsos `entailment` con hipotesis genericas o plantillas mal disenadas en clasificacion zero-shot; la eleccion del template condiciona fuertemente el resultado.
- Rendimiento mas debil en ANLI (0,7480 / 0,5700 / 0,5433), el escenario de inferencia adversarial; no es la mejor opcion si el caso de uso exige robustez frente a razonamiento complejo.
- Los resultados publicados no estan verificados de forma independiente (`verified: false`) y provienen exclusivamente del autor.
- Riesgo de sesgos heredados de los datasets de origen (MNLI, SNLI, ANLI, WANLI, LingNLI), que estan sesgados hacia generos como el captioning de imagenes y textos de Wikipedia.
- Longitud de contexto no documentada en la model card: conviene medir el comportamiento real con entradas largas antes de desplegarlo en produccion.
- La destilacion desde un profesor puede introducir los sesgos propios de ese profesor (`MoritzLaurer/DeBERTa-v3-large-...`) en los logits del estudiante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dleemiller/finecat-nli-l
- Modelo sucesor: https://huggingface.co/dleemiller/finecat-nli-v2-l
- Dataset de entrenamiento: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Checkpoint de partida: https://huggingface.co/tasksource/ModernBERT-large-nli
- Modelo profesor de destilacion: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
- Modelo comparado de la misma familia: https://huggingface.co/dleemiller/ModernCE-large-nli
- Modelo comparado de referencia: https://huggingface.co/cross-encoder/nli-deberta-v3-large
- Repositorio de la libreria: https://github.com/UKPLab/sentence-transformers
