# shalev396/calorie-lens

## Resumen

Calorie Lens es un modelo de visión por computador especializado en estimación nutricional a partir de fotografías de platos de comida. Lo desarrolla el autor independiente shalev396 dentro de su proyecto ml-lab, y resuelve un problema concreto: dado un RGB de una comida, identificar los ingredientes presentes, estimar los gramos de cada uno y derivar la ingesta de calorías, proteínas, grasas, carbohidratos, fibra, azúcares, grasas saturadas y sodio, tanto por ingrediente como del plato completo.

Técnicamente no es un transformer generativo, sino una red de clasificación de imágenes multi-etiqueta de 94,64 millones de parámetros que fusiona tres etapas en un único grafo: un backbone DINOv2-B (o ConvNeXt-B) con un decodificador de 253 consultas de ingredientes, una capa lineal congelada de nutrición por gramo y un pequeño transformer de texto (NutriText) entrenado desde cero para nombres de alimentos en vocabulario abierto. El modelo se distribuye en safetensors con licencia MIT y admite despliegue vía `transformers` y endpoints compatibles.

Su relevancia actual radica en que combina estimación de porción (peso en gramos) con estimación calórica en un solo pase, un enfoque poco habitual frente a los modelos de clasificación de alimentos que solo predicen la categoría del plato. Con 292.705 descargas en Hugging Face, es uno de los modelos de estimación calórica más utilizados del hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2-B con registers + decodificador de 253 consultas de ingredientes (cross-attention) + capa de nutrición congelada + NutriText (transformer de 4 capas con tokenizador BPE propio) |
| Parametros totales | 94.637.834 (94,64 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 378 x 504 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (incluye LICENSE-APACHE-2.0.txt para los pesos DINOv2 de los que parte) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `nutritext_tokenizer.json`, `model.py`, `handler.py`, `requirements.txt`, `metrics.json` |

## Arquitectura y entrenamiento

El modelo se organiza en tres etapas encadenadas. La etapa 1 (IngredientNet) parte de un backbone DINOv2-B con registers y añade un decodificador de consultas: una consulta aprendida por cada uno de los 253 ingredientes de Nutrition5k lee los tokens de imagen mediante dos capas de cross-attention sin self-attention entre consultas, y cada consulta tiene sus propias salidas de presencia y de gramos. Una cabeza de totales lee el token CLS y la media de tokens de parche para estimar directamente masa, kcal y macros del plato. La lectura final reescala los gramos de ingrediente a la masa del plato en espacio logarítmico (0,85 x cabeza de totales + 0,15 x suma propia) y los inclina hacia un objetivo de kcal por gramo (90 % el propio de los ingredientes, 10 % el de la cabeza de totales); además promedia la foto original y su imagen espejo. Estos hiperparámetros se ajustaron sobre validación.

La etapa 2a (NutritionLayer) es una capa lineal sin sesgo cuyos pesos son la tabla de nutrientes por gramo y que nunca se entrena: kcal, grasa, carbohidrato y proteína provienen de los propios valores de Nutrition5k (cuyas etiquetas son exactamente gramos x esa tabla), mientras que fibra, azúcares, grasa saturada y sodio proceden de un emparejamiento revisado con USDA por ingrediente. Como los 253 gramos son la entrada de esta capa, todo el sistema entrena de extremo a extremo. La etapa 2b (NutriText) es un transformer de 4 capas entrenado desde cero sobre ~470.000 nombres de USDA que mapea cualquier nombre de alimento a nutrientes por 100 g, con restricciones físicas: composición vía softmax x 100 g (nunca supera 100 g), azúcares y grasa saturada acotados por carbohidratos y grasa, y kcal próxima a la energía de Atwater de la composición.

El entrenamiento combina Nutrition5k (limpiado, con cada ingrediente pesado en báscula), FlavoriaFoodWeight1700 (platos pesados en una línea de comedor finlandesa) y USDA FoodData Central. El `config.json` registra `pretrained: false`, de modo que `model.load()` reconstruye todas las redes desde la configuración y carga `model.safetensors` sin descargar ningún modelo base en inferencia.

## Capacidades

- Clasificación multi-etiqueta de ingredientes: detecta hasta 253 ingredientes distintos sobre la imagen del plato.
- Estimación de porción: predice los gramos de cada ingrediente presente, no solo su presencia.
- Estimación nutricional por ingrediente y del plato completo: kcal, proteínas, grasas, carbohidratos, fibra, azúcares, grasas saturadas y sodio.
- Salida estructurada en JSON con `ingredients`, `other`, `totals` y `direct_estimate`, donde las filas suman exactamente los totales.
- Nutrición en vocabulario abierto: NutriText convierte cualquier nombre de alimento en nutrientes por 100 g, incluidos alimentos no vistos en el entrenamiento visual.
- Entrada de imagen flexible: cualquier RGB, reescalado con preservación de aspecto a un lienzo de 378 x 504.
- Robustez al encuadre: promedia la inferencia sobre la imagen y su espejo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de clasificación de imágenes.

## Casos de uso

- Aplicaciones de seguimiento nutricional: el usuario fotografía el plato y la app obtiene ingredientes, gramos y macros en una sola llamada, sin introducir pesos a mano; la ventana de 253 ingredientes cubre dietas variadas.
- Restauración y comedores colectivos: integrado en la línea de servicio, estima la composición de cada bandeja para etiquetado nutricional automático, aprovechando que se entrenó con datos de FlavoriaFoodWeight1700, platos pesados en una línea de comedor real.
- Investigación en epidemiología nutricional: procesamiento por lotes de fotografías de estudios dietéticos para estimar ingesta calórica y de macros a escala, con la ventaja de que la salida suma exactamente los totales y es auditable por ingrediente.
- Control de porciones en aplicaciones de salud: la estimación de gramos por ingrediente permite señalar los componentes que más aportan calorías de un plato y sugerir reducciones concretas.
- Etiquetado nutricional asistido para productores: combinado con NutriText, un nombre de receta o alimento se traduce en nutrientes por 100 g sin necesidad de base de datos externa, útil para borradores de etiqueta.
- Análisis de menús y cartas: dado un catálogo de fotos de platos, generar fichas nutricionales por ración para portales de restauración o apps de delivery.
- Despliegue en el edge: con 94,64 M de parámetros y pesos en safetensors de un repo de 0,8 GB, cabe en GPUs de consumo y en endpoints compatibles, lo que permite inferencia local en el móvil o en servidores modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`) sobre el split de test del dataset `shalev396/calorie-lens-data` (Nutrition5k limpio + FlavoriaFoodWeight1700 + USDA FoodData Central):

| Metrica | Valor |
|---|---|
| kcal_mae | 40,9075 |
| kcal_pmae | 16,0128 |
| mass_pmae | 12,6435 |
| fat_pmae | 23,3219 |
| carb_pmae | 21,6526 |
| protein_pmae | 21,7153 |
| side_dish_kcal_pmae | 15,8816 |
| test_clean_kcal_pmae | 16,281 |
| presence_map | 0,6885 |
| ingredient_grams_mae | 10,1312 |
| flavoria_mass_pmae | 25,4688 |
| nutritext_kcal_mae_per_100g | 31,2459 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar de visión (ImageNet, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 94,64 M de parámetros en fp32 los pesos ocupan unos 0,38 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; para lotes grandes se recomiendan A100, H100 o L4; para uso individual, RTX 4090, RTX 3090 o superiores.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060 y similares con 8 GB o más; también en entornos ZeroGPU (el Space oficial usa `runtime: zerogpu`).
- Opciones de despliegue: `transformers` (el modelo se reconstruye desde `config.json` con `model.load()`), endpoints compatibles de Hugging Face (`endpoints_compatible`), el Space oficial `shalev396/calorie-lens` y el `handler.py` incluido en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calorie-lens (shalev396) | 94,64 M | Clasificación de imágenes, ingredientes + gramos + nutrición | Imagen 378 x 504 | MIT | Hugging Face, 292.705 descargas |
| Kaikaku/epicure-core | no disponible | Extracción de features de alimentos | no disponible | no disponible | Hugging Face |
| AKMESSI/Food-R1-GGUF | no disponible | Image-Text-to-Text (VLM) | no disponible | no disponible | Hugging Face (GGUF) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Los benchmarks del model-index están marcados como `verified: false`: son cifras declaradas por el autor y no han sido reproducidas de forma independiente.
- El error calórico absoluto medio es de 40,9 kcal por plato; en platos grandes o con ingredientes fuera del vocabulario de 253 clases el error puede crecer.
- La cobertura de ingredientes está limitada a las 253 consultas de Nutrition5k; alimentos no representados se agrupan en `other` o se ignoran.
- La estimación de gramos depende de la masa del plato estimada por la cabeza de totales, que introduce su propio error (mass_pmae de 12,64).
- El rendimiento cae en dominios distintos: en FlavoriaFoodWeight1700 el mass_pmae sube a 25,47 frente al 12,64 del test principal.
- NutriText tiene un MAE de 31,25 kcal por 100 g en nombres de alimentos, por lo que sus estimaciones para alimentos no vistos deben tratarse como aproximadas.
- Riesgo de sesgo por la composición de los datasets: Nutrition5k y FlavoriaFoodWeight1700 reflejan cocinas y hábitos concretos (estadounidense y finlandesa), lo que puede infrarepresentar otras tradiciones culinarias.
- No hay información sobre sesgos demográficos ni sobre idiomas soportados; la salida de nombres de ingredientes está en el idioma del vocabulario de entrenamiento, no disponible en la ficha.
- Licencia MIT: permite uso comercial, pero el repo incluye `LICENSE-APACHE-2.0.txt` para los pesos DINOv2 de los que parte el backbone, cuyos términos deben respetarse en la redistribución.
- No es un modelo generativo: no admite conversación, tool calling ni razonamiento; cualquier flujo de agente debe construirse alrededor de él.
- Para producción conviene validar la calibración de las salidas en el dominio concreto de despliegue, dado que las métricas publicadas corresponden a los datasets de entrenamiento y test del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/calorie-lens
- Dataset: https://huggingface.co/datasets/shalev396/calorie-lens-data
- Space oficial: https://huggingface.co/spaces/shalev396/calorie-lens
- Repositorio GitHub: https://github.com/shalev396/ml-lab/tree/main/calorie-lens
- Notebook de entrenamiento (Colab): https://colab.research.google.com/github/shalev396/ml-lab/blob/main/calorie-lens/training/notebook.ipynb
- Nutrition5k: https://github.com/google-research-datasets/Nutrition5k
- FlavoriaFoodWeight1700: https://zenodo.org/records/5850856
- USDA FoodData Central: https://fdc.nal.usda.gov/
- Listado de modelos con etiqueta food: https://huggingface.co/models?other=food&p=0&sort=downloads
- Listado de modelos con etiqueta calorie-estimation: https://huggingface.co/models?other=calorie-estimation
