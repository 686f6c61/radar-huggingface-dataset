# SinclairSchneider/german_politic_EuroBERT-210m

## Resumen

`german_politic_EuroBERT-210m` es un clasificador binario de texto en alemán que distingue entre contenido político (`politic`) y no político (`other`). Lo desarrolla SinclairSchneider como fine-tuning de `EuroBERT/EuroBERT-210m`, un modelo de la familia EuroBERT presentada en el paper arXiv:2503.05500, y se publica bajo licencia Apache 2.0. El problema que resuelve es el filtrado previo de corpus alemanes: identificar de forma automática qué fragmentos de noticias, foros o documentos abordan temática política antes de pasarlos a etapas posteriores de análisis (por ejemplo, predicción de ideología).

La particularidad frente a alternativas como `german_politic_DeBERTa-v2-base` es la ventana de contexto: el modelo acepta hasta 8.192 tokens, frente a los 512 del DeBERTa, lo que permite clasificar artículos completos sin truncar. Se entrenó sobre el mismo conjunto de 234.978 textos que la versión DeBERTa, lo que facilita comparaciones controladas entre ambas arquitecturas.

Es relevante ahora porque el autor lo emplea como prefiltro en un pipeline de predicción de ideología publicado en ICWSM 2026, y porque demuestra que un encoder de 212 millones de parámetros con contexto largo puede alcanzar recall casi perfecto sobre noticias políticas reales, a costa de un sesgo claro hacia la sobreclasificación de noticias no políticas como políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EuroBERT), fine-tuning para clasificación de secuencias con pooling tardío (`classifier_pooling = "late"`) |
| Parametros totales | 212.358.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), tamaño del repo 1,3 GB |

## Arquitectura y entrenamiento

El modelo parte de EuroBERT-210m, un encoder transformer multilingüe de la familia EuroBERT (arXiv:2503.05500). Sobre esa base se añade una cabeza de clasificación binaria con pooling tardío, es decir, la representación usada para clasificar se construye después de la torre del encoder en lugar de tomar directamente el token `[CLS]`. El checkpoint se guardó en marzo de 2025 con una versión temprana del código de EuroBERT que nombraba la capa de salida `out_proj`; las versiones actuales esperan `classifier`, por lo que es necesario renombrar las claves al cargar (ver la sección de limitaciones).

El entrenamiento se realizó sobre `SinclairSchneider/trainset_political_text_yes_no_german`, un conjunto de 234.978 textos etiquetados como políticos o no políticos, el mismo usado para la variante DeBERTa. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (poco habituales en un clasificador de este tipo). El script de entrenamiento está incluido en el repositorio (`train.py`). La innovación técnica principal es el uso de la ventana de 8.192 tokens heredada de EuroBERT, que permite clasificar documentos completos sin truncamiento.

## Capacidades

- Clasificación binaria de texto alemán en las clases `politic` y `other`.
- Procesamiento de documentos largos de hasta 8.192 tokens en una sola pasada, sin truncar artículos periodísticos completos.
- Detección de temática política en noticias, prensa escrita y textos de dominio general.
- Funciona como prefiltro en pipelines de análisis político e ideológico (uso documentado en el paper ICWSM 2026 con umbral 0,8 sobre la versión DeBERTa).
- Mejor manejo de textos cotidianos (posts de foro, reseñas, aficiones) que la variante DeBERTa: 17 de 19 ejemplos escritos a mano correctos frente a 13 de 19.
- No soporta generación de texto, tool calling, agentes ni multimodalidad: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo de corpus periodísticos: dado un feed de noticias alemanas, el modelo marca qué artículos entran en la sección política antes de pasarlos a analizadores de ideología o sentimiento, aprovechando la ventana de 8.192 tokens para no truncar piezas largas.
- Construcción de datasets etiquetados: para crear corpus de entrenamiento político/no político a partir de fuentes heterogéneas (prensa, blogs, foros), usando el modelo como etiquetador automático con revisión humana posterior.
- Monitorización de medios: clasificar en tiempo casi real el flujo de publicaciones de un medio alemán para separar cobertura política de cultura, deportes o economía.
- Moderación y enrutado de contenidos: en plataformas de comentarios o foros en alemán, derivar los hilos con contenido político a moderadores o políticas específicas.
- Investigación en ciencias sociales computacionales: prefiltrar grandes volúmenes de texto antes de aplicar modelos más costosos de ideología, replicando el uso del paper ICWSM 2026.
- Análisis de archivos documentales: procesar PDFs, correos o transcripciones (previa normalización de espacios) para identificar qué documentos abordan temática política, por ejemplo en estudios de historia o comunicación política.
- Detección de sesgo de cobertura: comparar la proporción de contenido político entre medios o secciones para estudios de agenda setting.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea / conjunto | Métrica | Valor |
|---|---|---|
| Detección de texto político, split held-out aleatorio del 20 % de `trainset_political_text_yes_no_german` | Accuracy | 0,9957 |
| Detección de texto político, mismo split | Weighted F1 | 0,9957 |
| Out-of-domain: 10kGNAD (derStandard.at), Inland + International vs. resto | ROC-AUC | 0,8596 |
| Out-of-domain: 10kGNAD, umbral 0,5 | Recall clase `politic` | 0,9996 |
| Out-of-domain: 10kGNAD, umbral 0,5 | Accuracy | 0,3748 |
| Out-of-domain: 10kGNAD, umbral 0,5 | F1 clase `politic` | 0,44 |

El autor señala que, sobre noticias reales de 10kGNAD, el modelo solo se pierde 1 de 2.524 artículos políticos, pero etiqueta como políticos la mayoría de las noticias no políticas: negocios, ciencia y panorama al 99,8 %, medios al 97 % y web/tecnología al 91 %. En ejemplos cotidianos escritos a mano acierta 17 de 19, frente a 13 de 19 del DeBERTa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,85 GB solo de pesos (212 M de parámetros), más activaciones y buffer de atención para secuencias de hasta 8.192 tokens; en la práctica, unos 2-4 GB con batch pequeño.
- En FP16/BF16 los pesos ocupan aproximadamente 0,42 GB; el cuello de botella es la atención sobre secuencias largas, no el tamaño del modelo.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en GPUs de datacenter (A100, H100) para procesamiento por lotes a gran escala.
- También puede ejecutarse en CPU para volúmenes moderados, dado el reducido número de parámetros.
- Opciones de despliegue: `transformers` con el loader específico documentado en la model card (obligatorio renombrar `out_proj` a `classifier`); el pipeline estándar `pipeline("text-classification", ...)` carga sin error pero con la capa de salida inicializada aleatoriamente, por lo que no debe usarse tal cual. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a generación; para un encoder de clasificación lo habitual es `transformers` o TorchServe).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `german_politic_EuroBERT-210m` | 212 M | 8.192 tokens | Apache 2.0 | Mejor recall y mejor manejo de textos cotidianos; sobreclasifica noticias no políticas |
| `german_politic_DeBERTa-v2-base` (mismo autor) | no disponible en la información | 512 tokens | no disponible en la información | Entrenado sobre el mismo dataset de 234.978 textos; peor en ejemplos cotidianos (13/19 vs. 17/19) |
| `EuroBERT/EuroBERT-210m` (modelo base) | 210 M aprox. | 8.192 tokens | no disponible en la información | Encoder multilingüe sin fine-tuning; no es un clasificador político directo |

No se dispone de datos de benchmarks comparativos entre estos modelos más allá de las cifras citadas por el autor.

## Limitaciones y advertencias

- **Carga delicada**: el checkpoint usa el nombre antiguo `out_proj` para la capa de salida. Con Transformers actuales, `pipeline("text-classification", model=...)` carga sin error pero con la cabeza aleatoria (predicciones sin sentido, p. ej. 0,73/0,60 en lugar de 0,999/0,987). `trust_remote_code=True` falla con `KeyError: 'default'` en Transformers 5.15. Es imprescindible usar el loader de la model card, que renombra las claves y carga en modo estricto.
- **Sensibilidad a los saltos de línea**: el modelo reacciona con fuerza a los saltos duros de línea. Un artículo político envuelto a ~70 caracteres se clasifica como `other` en el 94 % de los casos; en textos de 20 líneas o más el cambio es casi siempre. Afecta a texto extraído de PDFs, correos y poemas. Es obligatorio normalizar con `" ".join(text.split())`.
- **Sobreclasificación de noticias no políticas**: negocios, ciencia y panorama se etiquetan como políticos el 99,8 % de las veces; medios el 97 %; web/tecnología el 91 %. La accuracy out-of-domain al umbral 0,5 es solo 0,3748, pese al recall de 0,9996.
- **Sesgo de dominio**: entrenado sobre un conjunto concreto de textos; el `other` de entrenamiento estaba dominado por párrafos de Project Gutenberg con saltos duros, lo que explica parte de los sesgos anteriores.
- **Idioma**: solo alemán; no se garantiza comportamiento en otros idiomas pese a que el modelo base sea multilingüe.
- **Riesgo de alucinación**: no aplica en el sentido generativo (no produce texto libre), pero sí hay riesgo de falsos positivos sistemáticos en las categorías citadas.
- **Uso comercial**: la licencia Apache 2.0 lo permite sin restricciones adicionales conocidas; conviene verificar la licencia del modelo base EuroBERT por si impone condiciones adicionales.
- **Madurez**: 18 descargas y 1 like en el momento de la consulta; los resultados no están verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/german_politic_EuroBERT-210m
- Modelo base EuroBERT-210m: https://huggingface.co/EuroBERT/EuroBERT-210m
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_text_yes_no_german
- Variante DeBERTa del mismo autor: https://huggingface.co/SinclairSchneider/german_politic_DeBERTa-v2-base
- Script de entrenamiento: https://huggingface.co/SinclairSchneider/german_politic_EuroBERT-210m/blob/main/train.py
- Paper EuroBERT: https://arxiv.org/abs/2503.05500
- Paper de predicción de ideología (ICWSM 2026): https://doi.org/10.1609/icwsm.v20i1.42735
- Paper de referencia de transformers (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- DOI del modelo: https://doi.org/10.57967/hf/9334
- Dataset 10kGNAD: https://huggingface.co/datasets/community-datasets/gnad10
