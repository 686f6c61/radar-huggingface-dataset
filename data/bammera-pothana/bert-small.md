# bammera-pothana/BERT-small

## Resumen

BERT-small (bammera-pothana/BERT-small) es un modelo encoder de tipo BERT preentrenado desde cero en telugu por el usuario bammera-pothana. Sigue la receta original de Devlin et al. (2018) aplicada a las miniaturas de Turc et al. (2019), con 4 capas, tamano oculto 512, 8 cabezas de atencion y 29,8 millones de parametros totales. Forma parte de la coleccion "Google's Recipes", junto a BERT-tiny y BERT-mini, que reproduce las tallas compactas de BERT para telugu sin modificar la receta mas alla del vocabulario.

El modelo resuelve el problema de disponer de un encoder compacto y especifico para telugu, un idioma con relativamente pocos recursos en comparacion con el ingles. Su tamano reducido lo hace adecuado para fine-tuning en entornos con recursos limitados, para puntuar y clasificar texto en telugu mediante masked language modeling, y como punto de una curva de escalado junto a sus hermanos menores. El contexto maximo es de 512 tokens y el vocabulario WordPiece de 32.000 tokens se aprendio sobre el texto de preentrenamiento, compartido con BERT-mini.

La relevancia actual radica en que ofrece una alternativa ligera a BERT-Base para tareas downstream en telugu, con pesos en safetensors y compatibilidad con la libreria transformers. El repositorio ocupa 0,1 GB y los pesos se distribuyen en float32. La licencia no esta disponible en la informacion proporcionada, lo que supone una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForPreTraining (transformer encoder, cabeza MLM + cabeza NSP) |
| Parametros totales | 29.817.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | telugu (te) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 119 MB, float32) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas con tamano oculto 512, 8 cabezas de atencion y feed-forward de 2048, siguiendo la configuracion BERT-Small de Turc et al. (2019). Se entrena con los dos objetivos originales de BERT: masked language modeling sobre el 15 % de los tokens WordPiece (80 % sustituidos por `[MASK]`, 10 % por token aleatorio, 10 % sin cambios) y next-sentence prediction. El enmascaramiento es a nivel de token, dinamico y se remuestrea en cada batch. El vocabulario es de 32.000 tokens WordPiece, con distincion de mayusculas y sin eliminacion de acentos, ya que eliminar los signos vocalicos del telugu (మాత్రలు) destruiria el texto; por ello el tokenizer debe cargarse desde el repositorio.

El entrenamiento se realizo en una unica schedule continua de 1.000.000 de pasos con batch global de 256 secuencias: 900.000 pasos a 128 tokens y 100.000 pasos a 512 tokens, con el estado del optimizador transferido entre fases. Se uso AdamW con learning rate 1e-4, β₁ 0.9, β₂ 0.999, ε 1e-6, weight decay 0.01 (no aplicado a bias ni LayerNorm), warm-up lineal de 10.000 pasos y decaimiento lineal hasta cero, clipping de gradiente 1.0, dropout 0.1, activacion GELU y precision mixta float16 con loss scaling manteniendo pesos en float32. El hardware fueron 4 NVIDIA GeForce RTX 2080 Ti de 11 GB, con 27,0 h para la fase 1 (0,11 s/paso) y 12,4 h para la fase 2 (0,44 s/paso). Los ejemplos de entrenamiento se construyeron con el formato `[CLS] A [SEP] B [SEP]`, donde B es la continuacion real la mitad de las veces y un segmento de otro documento el resto; el 10 % de los ejemplos usan una longitud objetivo aleatoria mas corta. Se reservo un conjunto de documentos held-out antes de aprender el vocabulario. Las fechas de entrenamiento fueron del 10 al 12 de noviembre de 2026.

## Capacidades

- Masked language modeling: predice tokens enmascarados en texto en telugu, con una precision top-1 del 49,4 % en el conjunto held-out de preentrenamiento.
- Next-sentence prediction: clasifica si un segundo segmento es continuacion del primero, con una precision del 96,3 % en held-out.
- Puntuacion y ranking de texto: la perplexity del modelo (16,9 en held-out) permite usar la verosimilitud para puntuar o comparar fragmentos de texto en telugu.
- Base para fine-tuning: encoder compacto adecuado para tareas downstream de clasificacion, etiquetado o extraccion de caracteristicas en telugu.
- Procesamiento de texto en escritura telugu con normalizacion NFC, distincion de mayusculas y sin eliminacion de acentos.
- No soporta generacion de texto autoregresiva, tool calling, agentes ni razonamiento multi-paso: es un encoder de enmascaramiento, no un modelo causal.
- No dispone de capacidades multimodales (vision, audio) ni de modo thinking.

## Casos de uso

- Clasificacion de texto en telugu: fine-tuning de la cabeza de clasificacion sobre el encoder para tareas como deteccion de tematica o analisis de sentimiento en noticias y resenas, aprovechando que el modelo ya ha aprendido representaciones del idioma con 1 millon de pasos de preentrenamiento.
- Etiquetado de secuencias (NER, POS): el encoder de 512 tokens permite anadir una cabeza token-level para reconocimiento de entidades en textos literarios o periodisticos en telugu, con un coste de fine-tuning bajo gracias a sus 29,8 M de parametros.
- Puntuacion de candidatos en correccion ortografica o autocompletado: el modelo puede calcular la verosimilitud de frases con un token enmascarado para elegir la variante mas probable, util en correctores y teclados predictivos en telugu.
- Filtrado y deduplicacion de corpus: usar la perplexity del modelo sobre parrafos de telugu para detectar texto anomalo, ruido OCR o duplicados en la construccion de datasets, dado que el modelo se entreno sobre texto telugu normalizado.
- Recuperacion de informacion y ranking: generar embeddings contextuales del encoder para similitud semantica entre consultas y documentos en telugu, con un coste de inferencia muy bajo en CPU o GPU consumer.
- Prototipado rapido en entornos con pocos recursos: al caber en GPUs consumer y ocupar 0,1 GB, permite experimentar con fine-tuning en una unica RTX 2080 Ti o similar, sirviendo como linea base antes de escalar a BERT-Base.
- Analisis de textos literarios: el modelo muestra un rendimiento especifico en el corpus de Telugu Wikisource (loss 3,05, precision 46,2 %), lo que lo hace util para tareas sobre prosa literaria clasica frente a texto periodistico moderno.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| Held-out Telugu text (512 tokens) | Masked-LM loss | 2,83 |
| Held-out Telugu text (512 tokens) | Masked-LM perplexity | 16,9 |
| Held-out Telugu text (512 tokens) | Masked-LM top-1 accuracy | 0,494 |
| Held-out Telugu text (512 tokens) | Next-sentence-prediction accuracy | 0,963 |
| Telugu Wikisource (3.000 parrafos, 128 tokens) | Masked-LM loss | 3,05 |
| Telugu Wikisource (3.000 parrafos, 128 tokens) | Masked-LM top-1 accuracy | 0,462 |
| Telugu news (3.000 parrafos, 128 tokens) | Masked-LM loss | 2,778 |
| Telugu news (3.000 parrafos, 128 tokens) | Masked-LM top-1 accuracy | 0,507 |

Comparacion interna declarada por el autor en held-out:

| Checkpoint | MLM loss | MLM perplexity | MLM accuracy | NSP accuracy |
|---|---|---|---|---|
| Fin de fase 1 (paso 900 k, 128 tokens) | 2,933 | 18,8 | 47,8 % | 95,4 % |
| Publicado: fin de fase 2 (paso 1 M, 512 tokens) | 2,830 | 16,9 | 49,4 % | 96,3 % |
| BERT-mini publicado (mismo vocabulario y texto) | 3,418 | 30,5 | 42,4 % | 95,5 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 (29,8 M de parametros, ~119 MB de pesos) mas el overhead de activaciones y contexto; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 2080 Ti, RTX 3060, RTX 4090) o incluso CPU para inferencia por lotes pequenos; el entrenamiento original uso 4 x RTX 2080 Ti de 11 GB.
- Cabe en GPU consumer: si, en todas las GPU consumer con al menos 2 GB de VRAM, y en CPU para inferencia ligera.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportacion a ONNX para inferencia optimizada; integracion en pipelines de Hugging Face. No se dispone de pesos GGUF publicados, aunque la conversion a llama.cpp/GGUF seria tecnicamente posible al ser un encoder BERT estandar. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor reporta 0,11 s/paso (128 tokens) y 0,44 s/paso (512 tokens) durante el entrenamiento en 4 x RTX 2080 Ti, pero no se ofrecen cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| BERT-small (este modelo) | 29,8 M | 512 | no disponible | MLM loss 2,83, perplexity 16,9, top-1 49,4 %, NSP 96,3 % (held-out telugu) | Hugging Face, safetensors |
| BERT-mini (bammera-pothana) | no disponible en la informacion | 512 | no disponible | MLM loss 3,418, perplexity 30,5, top-1 42,4 %, NSP 95,5 % (mismo held-out) | Hugging Face |
| BERT-tiny (bammera-pothana) | no disponible en la informacion | 512 | no disponible | no disponible (vocabulario distinto, perdidas solo aproximadamente comparables) | Hugging Face |
| BERT-Base multilingue | ~110 M | 512 | Apache 2.0 (segun el modelo original de Google) | no disponible en la informacion | Hugging Face |

La comparacion directa con BERT-mini es la mas fiable porque comparte vocabulario y texto de preentrenamiento con BERT-small; BERT-tiny usa un vocabulario propio, por lo que sus perdidas solo son comparables de forma aproximada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el permiso para uso comercial, redistribucion o modificacion; es un riesgo legal para produccion.
- Modelo unicamente de telugu: no soporta otros idiomas ni cambio de dominio linguistico sin reentrenamiento.
- No es un modelo generativo: no puede usarse para generacion de texto, dialogo, tool calling ni agentes; solo para enmascaramiento, clasificacion y extraccion de representaciones.
- Precision limitada: la precision top-1 en masked LM es del 49,4 % en held-out y baja al 46,2 % en texto literario (Wikisource), lo que refleja las limitaciones de un modelo de 4 capas y 29,8 M de parametros.
- Contexto maximo de 512 tokens: textos mas largos deben truncarse o dividirse, lo que puede perder dependencias de largo alcance.
- Tokenizer especifico: debe cargarse desde el repositorio; configurarlo manualmente con eliminacion de acentos o minusculas destruiria los signos vocalicos del telugu y degradaria el rendimiento.
- Riesgo de sesgo: el modelo se entrena sobre un corpus de telugu no documentado en la informacion disponible; pueden aparecer sesgos de dominio (literario vs. periodistico) y de representacion del vocabulario aprendido.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las predicciones de tokens enmascarados pueden ser incorrectas o poco plausibles, especialmente en dominios alejados del texto de entrenamiento.
- Resultados de benchmarks no verificados: el autor los declara como no verificados (`verified: false`); no hay evaluacion independiente ni resultados en benchmarks estandar.
- Fechas de creacion y actualizacion en 2026 y cero descargas/likes: el modelo es muy reciente y no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bammera-pothana/BERT-small
- BERT-tiny (modelo hermano): https://huggingface.co/bammera-pothana/BERT-tiny
- BERT-mini (modelo hermano): https://huggingface.co/bammera-pothana/BERT-mini
- Perfil del autor: https://huggingface.co/bammera-pothana
- Paper de BERT (Devlin et al., 2018): arXiv:1810.04805 (referenciado en la receta)
- Paper de las miniaturas BERT (Turc et al., 2019): arXiv:1908.08962 (referenciado en los tags del modelo)
