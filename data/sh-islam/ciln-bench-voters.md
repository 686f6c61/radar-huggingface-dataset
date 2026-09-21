# sh-islam/ciln-bench-voters

## Resumen

CILN-Bench voters es un repositorio de checkpoints que contiene los clasificadores (denominados "voters") utilizados para generar las probabilidades softmax publicadas en el benchmark CILN-Bench, descrito en el articulo "Benchmarking Instance-Dependent Label Noise with Controlled Corruptions" de Shadman Islam, Agustinus Kristiadi y Mostafa Milani (TMLR, en revision, 2026). No es un modelo generativo ni un modelo de lenguaje: es una coleccion heterogenea de clasificadores supervisados que actuan como etiquetadores de referencia para estudiar ruido de etiquetas dependiente de la instancia.

El repositorio cubre tres dominios (imagen, tabular y texto) y cuatro datasets: CIFAR-10, MNIST, Adult y AG-News. Cada voter se entrena exclusivamente sobre la particion de entrenamiento con etiquetas limpias de su dataset y nunca ve las filas con etiquetas ruidosas que despues etiqueta, lo que garantiza que los softmax liberados reflejen la incertidumbre de un modelo limpio frente a ejemplos corrompidos de forma controlada. Esto permite reproducir bit a bit los ficheros publicados mediante el adaptador `code/infer/voter_adapters.py` del repositorio de codigo.

Su relevancia es metodologica: proporciona una base reproducible y multiarquitectura para evaluar metodos de aprendizaje robusto a ruido de etiquetas (label noise learning), comparar el comportamiento de familias de modelos muy distintas ante el mismo tipo de corrupcion y auditar implementaciones de ruido dependiente de la instancia. El repo ocupa 1,2 GB, tiene licencia MIT y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: CNN (ResNet-20, WRN-28-10, LeNet-5, MLP), transformers de vision (DeiT3-Small, CLIP ViT-B/32), transformers de texto (DistilBERT-cased, RoBERTa-base, all-MiniLM-L6-v2), gradient boosting (XGBoost, CatBoost), MLP tabular (RTDL-MLP), transformer tabular (FT-Transformer), TabPFN y fastText |
| Parametros totales | No disponible como cifra agregada: varia por checkpoint (desde MLP y LeNet-5 hasta WRN-28-10 y RoBERTa-base). La model card no publica recuentos de parametros |
| Longitud de contexto | No aplica: no es un modelo generativo. Los voters de texto se entrenan sobre AG-News, pero la model card no especifica longitud maxima de secuencia |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible. Los voters de texto se entrenan sobre AG-News, corpus en ingles |
| Licencia | MIT para el repositorio. Los pesos de terceros reutilizados (CLIP ViT-B/32 de OpenAI via open_clip, TabPFN, pesos timm de ImageNet-21k para DeiT3-Small, all-MiniLM-L6-v2) conservan sus propias condiciones de uso |
| Formato de pesos | PyTorch `.pt` (mayoria de voters de imagen y tabulares), XGBoost `.json`, CatBoost `.cbm`, fastText `.bin` y carpetas HuggingFace `save_pretrained` para DistilBERT-cased y RoBERTa-base. El repositorio declara el tag `safetensors` |
| Tamano del repositorio | 1,2 GB |
| Datasets cubiertos | CIFAR-10, MNIST, Adult, AG-News |
| Metadatos adicionales | Ficheros `*_train_summary.json` junto a cada checkpoint con la precision final de validacion/test de cada ejecucion |

Inventario de voters incluidos:

| Ruta | Voter | Dataset | Notas |
|---|---|---|---|
| `image/resnet20_cifar10_best.pt` | ResNet-20 | CIFAR-10 | Script `train_resnet20_cifar.py` |
| `image/wrn28_10_cifar10_best.pt` | WRN-28-10 | CIFAR-10 | Script `train_wrn28_10_cifar.py` |
| `image/deit3_small_cifar10_best.pt` | DeiT3-Small | CIFAR-10 | Fine-tuning desde pesos timm ImageNet-21k |
| (ninguno) | CLIP ViT-B/32 | CIFAR-10 | Zero-shot, pesos `openai` via open_clip, prompt "a photo of a {class}" |
| `image/lenet5_mnist_best.pt` | LeNet-5 | MNIST | Script `train_lenet5_mnist.py` |
| `image/mlp_mnist_best.pt` | MLP | MNIST | Script `train_mlp_mnist.py` |
| `image/resnet20_mnist_best.pt` | ResNet-20 | MNIST | Script `train_resnet20_mnist.py` |
| `image/deit3_small_mnist_best.pt` | DeiT3-Small | MNIST | Script `train_deit3_mnist.py` |
| `tabular/xgboost_adult_dummyna.json` | XGBoost | Adult | Script `train_xgboost_dummyna.py` |
| `tabular/catboost_adult.cbm` | CatBoost | Adult | Script `train_catboost.py` |
| `tabular/mlp_adult_best.pt` | RTDL-MLP | Adult | Script `train_mlp.py` |
| `tabular/ft_transformer_adult_best.pt` | FT-Transformer | Adult | Script `train_ft_transformer.py` |
| (ninguno) | TabPFN | Adult | Paquete `tabpfn` preentrenado, sin fine-tuning |
| `text/fasttext/model.bin` | fastText | AG-News | Script `train_fasttext.py` |
| `text/distilbert/` | DistilBERT-cased | AG-News | Carpeta HF `save_pretrained` |
| `text/roberta-base/` | RoBERTa-base | AG-News | Carpeta HF `save_pretrained` |
| (ninguno) | all-MiniLM-L6-v2 | AG-News | Sentence-transformer zero-shot con embeddings de prompt de clase |

## Arquitectura y entrenamiento

El repositorio no implementa una arquitectura unica, sino que agrupa clasificadores de cinco familias: redes convolucionales (ResNet-20, WRN-28-10, LeNet-5), perceptrones multicapa (MLP simple en MNIST, RTDL-MLP en Adult), transformers (DeiT3-Small en imagen, DistilBERT-cased y RoBERTa-base en texto, FT-Transformer en tabular), gradient boosting sobre arboles (XGBoost, CatBoost) y modelos lineales o de embeddings (fastText, all-MiniLM-L6-v2). Se incluyen ademas tres voters zero-shot sin fine-tuning: CLIP ViT-B/32 sobre CIFAR-10, TabPFN sobre Adult y all-MiniLM-L6-v2 sobre AG-News.

El protocolo de entrenamiento es el elemento distintivo: cada voter se entrena unicamente sobre la particion `clean-label-train` de su dataset y nunca observa las filas `noisy-label-train` que despues etiqueta. Los scripts de entrenamiento estan en `code/train/` y los logs por epoch en `logs/`. El adaptador `code/infer/voter_adapters.py` convierte pares `(inputs, checkpoint)` en softmax que coinciden bit a bit con los ficheros liberados, con tamanos de lote documentados en `code/infer/voter_adapters_README.md`. La model card no detalla el numero de tokens o ejemplos de entrenamiento, la composicion exacta de los datasets ni el uso de tecnicas de alineacion como RLHF o DPO, que en cualquier caso no aplican a clasificadores supervisados de este tipo.

## Capacidades

- Clasificacion supervisada de imagenes en CIFAR-10 (10 clases) y MNIST (10 clases de digitos).
- Clasificacion tabular binaria sobre el dataset Adult (prediccion de nivel de ingresos).
- Clasificacion de texto en AG-News (4 categorias de noticias) mediante fastText, DistilBERT-cased, RoBERTa-base y all-MiniLM-L6-v2.
- Generacion de vectores softmax calibrados por clase, que es la salida efectivamente consumida por el benchmark para construir el ruido dependiente de la instancia.
- Etiquetado zero-shot en tres configuraciones: CLIP ViT-B/32 con prompt textual de clase, TabPFN preentrenado y all-MiniLM-L6-v2 con embeddings de prompt de clase.
- Cobertura multiarquitectura deliberada: permite comparar CNN, transformers, boosting y modelos lineales bajo el mismo protocolo de ruido.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje generativa, tool calling, function calling, soporte de agentes ni modo de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Reproduccion exacta de CILN-Bench: cargando cada checkpoint con `voter_adapters.py` y los tamanos de lote documentados, se regeneran los softmax publicados bit a bit, lo que permite verificar resultados del paper sin reentrenar nada.
- Evaluacion de metodos de aprendizaje robusto a ruido de etiquetas: los softmax de los voters sirven como referencia limpia frente a la que medir la degradacion de tecnicas como co-teaching, sample selection o perdidas robustas sobre las particiones corrompidas.
- Estudio de ruido dependiente de la instancia: al disponer de voters de familias muy distintas sobre el mismo dataset, se puede analizar si el ruido depende de la arquitectura o de la muestra, algo que un unico modelo no permite aislar.
- Auditoria de implementaciones de corrupcion controlada: comparar los softmax liberados con los generados por una implementacion propia detecta discrepancias en el pipeline de corrupcion o en el preprocesado.
- Baselines tabulares con ruido: los cuatro voters de Adult (XGBoost, CatBoost, RTDL-MLP, FT-Transformer) mas TabPFN permiten estudiar como se comportan metodos de arboles frente a redes profundas cuando se inyecta ruido en variables categoricas o en la etiqueta.
- Investigacion en clasificacion de texto con ruido: los voters de AG-News (fastText, DistilBERT, RoBERTa, sentence-transformers) permiten comparar robustez al ruido entre modelos de bolsa de palabras y transformers preentrenados en una tarea de cuatro clases.
- Analisis de calibracion y confianza: los ficheros `*_train_summary.json` mas los softmax permiten estudiar temperatura, entropia predictiva y deteccion de ejemplos ruidosos (loss-based o confidence-based) con modelos de distinta capacidad.
- Docencia y replicacion academica: el conjunto es un material listo para cursos o replicaciones de resultados de TMLR sobre ruido de etiquetas, con scripts de entrenamiento y logs por epoch incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los ficheros `*_train_summary.json` situados junto a cada checkpoint registran la precision final de validacion/test de cada ejecucion, pero no reproduce esas cifras en el texto, por lo que no se incluyen tablas comparativas.

## Requisitos de hardware

- El repositorio completo ocupa 1,2 GB; los checkpoints individuales son de tamano moderado (MLP, LeNet-5 y fastText son muy ligeros; ResNet-20, WRN-28-10, DistilBERT-cased y RoBERTa-base son mas pesados, y WRN-28-10 el mayor del conjunto).
- No se publican requisitos de VRAM, GPU recomendadas, latencia ni throughput en la model card. Cualquier cifra concreta seria una estimacion no confirmada.
- Por la naturaleza de las arquitecturas, la inferencia es viable en CPU para todos los voters y el reentrenamiento se beneficia de GPU, pero no hay datos oficiales que cuantifiquen el consumo.
- No aplican servidores de inferencia de LLM (vLLM, llama.cpp, Ollama, TGI). El despliegue se hace con PyTorch y timm (imagen), open_clip (CLIP), transformers de HuggingFace (DistilBERT, RoBERTa, all-MiniLM-L6-v2), xgboost, catboost, fasttext y el paquete `tabpfn` para tabular.
- Los tres voters zero-shot (CLIP ViT-B/32, TabPFN, all-MiniLM-L6-v2) no tienen checkpoint en el repositorio: requieren descargar los pesos originales de sus respectivos paquetes.

## Comparativa con modelos similares

| Aspecto | CILN-Bench voters | Benchmarks de ruido tipo CIFAR-N (CIFAR-10N/100N) | Benchmarks de ruido a gran escala tipo Clothing1M / WebVision |
|---|---|---|---|
| Tipo de recurso | Checkpoints de clasificadores (voters) multiarquitectura | Etiquetas reanotadas por humanos sobre CIFAR | Datasets con etiquetas ruidosas a escala web |
| Dominios cubiertos | Imagen, tabular y texto | Solo imagen | Solo imagen |
| Numero de arquitecturas | 17 voters de familias diversas (CNN, transformer, boosting, MLP, zero-shot) | Habitualmente evaluado con una o pocas arquitecturas por trabajo | Habitualmente ResNet y variantes |
| Reproduccion bit a bit de softmax | Si, mediante `voter_adapters.py` y tamanos de lote documentados | No disponible / no aplica | No disponible / no aplica |
| Licencia | MIT en el repositorio | Depende de cada publicacion; no disponible | Depende de cada publicacion; no disponible |
| Datos numericos comparables | No publicados en la model card | No disponible | No disponible |

No se dispone de datos de rendimiento de los votantes ni de cifras comparativas verificables, por lo que la comparacion se limita a cobertura y naturaleza del recurso.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde a instrucciones, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso en ese sentido es un error de categoria.
- Cada voter esta especializado en un unico dataset con un numero fijo de clases; no generaliza a otras tareas sin fine-tuning.
- Por diseno, los voters nunca ven las filas ruidosas que etiquetan, de modo que su comportamiento sobre esas filas refleja la distribucion limpia y no debe interpretarse como rendimiento en produccion sobre datos ruidosos.
- No se documentan analisis de sesgos ni evaluaciones de equidad. El dataset Adult contiene atributos sensibles (sexo, raza, pais de origen, estado civil, ocupacion), por lo que cualquier uso derivado en decision automatizada hereda los sesgos conocidos de esa fuente.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza: los softmax pueden estar mal calibrados y producir probabilidades altas en ejemplos ambiguos o fuera de distribucion.
- Los voters zero-shot dependen de modelos de terceros (CLIP de OpenAI, TabPFN, all-MiniLM-L6-v2) cuyos pesos no se incluyen en el repositorio y cuyas licencias pueden imponer condiciones distintas a la MIT del repositorio. Verificar antes de un uso comercial.
- Solo se declaran datos de texto en ingles (AG-News); no hay soporte multilingue documentado.
- No hay informacion sobre cuantizacion, formato GGUF, requisitos de hardware ni latencia, lo que complica planificar un despliegue sin trabajo adicional de medicion.
- El repositorio registra 0 descargas y 0 likes y la publicacion asociada esta en revision en TMLR, por lo que aun no cuenta con validacion por pares completada.
- Los resultados `*_train_summary.json` no se reproducen en la model card; hay que descargar el repositorio para conocer las precisiones reales.

## Enlaces

- HuggingFace: https://huggingface.co/sh-islam/ciln-bench-voters
- Repositorio de codigo: https://github.com/sh-islam/ciln-bench
- Citacion del paper: Islam, Shadman; Kristiadi, Agustinus; Milani, Mostafa. "Benchmarking Instance-Dependent Label Noise with Controlled Corruptions". Transactions on Machine Learning Research, 2026 (en revision). No se proporciona DOI ni enlace directo al paper en la informacion disponible.
- Rutas internas de referencia mencionadas en la model card: `code/infer/voter_adapters.py`, `code/infer/voter_adapters_README.md`, `code/train/`, `logs/`.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo: los enlaces recuperados corresponden a documentacion administrativa de la Oficina de Gestion de Personal de Estados Unidos sobre furloughs y no guardan relacion con el repositorio.
