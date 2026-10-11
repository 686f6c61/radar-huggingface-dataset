# shalev396/calorie-lens

## Resumen

Calorie Lens es un modelo de vision por computador publicado por el usuario shalev396 dentro de su repositorio experimental ml-lab, orientado a la estimacion nutricional de comidas a partir de una unica fotografia. Su propuesta no es clasificar el plato con una etiqueta, sino descomponerlo: identifica que ingredientes hay, estima cuantos gramos de cada uno y traduce esa composicion a nutrientes concretos (kilocalorias, proteina, grasa, carbohidratos, fibra, azucares, grasa saturada y sodio), tanto por ingrediente como para el plato completo.

Tecnicamente es un sistema fusionado en una sola red con tres etapas entrenables de forma conjunta. La etapa 1 (IngredientNet) combina un backbone convolucional o de tipo DINOv2 con un decodificador de 253 consultas aprendidas, una por cada ingrediente del vocabulario de Nutrition5k, y usa cross-attention para leer los tokens de imagen; cada consulta produce una probabilidad de presencia y una estimacion de gramos. La etapa 2a (NutritionLayer) es una capa lineal sin sesgo cuyos pesos son una tabla fija de nutrientes por gramo que nunca se entrena, procedente de Nutrition5k y de USDA FoodData Central. La etapa 2b (NutriText) es un transformer de 4 capas entrenado desde cero sobre unos 470 000 nombres de alimentos de USDA que permite estimar nutrientes por 100 g a partir de texto libre.

Su relevancia actual es doble. Por un lado, ataca un problema practico donde los modelos genericos fallan: pasar de "hay salmon y arroz" a "hay 150 g de salmon y 200 g de arroz", que es lo que determina la ingesta calorica real. Por otro, demuestra un patron de diseno interesante para modelos pequenos y desplegables: separar la percepcion visual de una capa de conocimiento nutricional congelada y auditable, de modo que el modelo no puede inventar valores nutricionales incoherentes porque la composicion y las kilocalorias estan restringidas por construccion. Incluye licencia MIT y un handler listo para Inference Endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone (ConvNeXt-B o DINOv2-B) + decodificador de 253 consultas de ingrediente con 2 capas de cross-attention + capa de nutricion congelada sin sesgo (253 x 8) + transformer NutriText de 4 capas con tokenizador BPE propio |
| Parametros totales | no disponible (el autor no publica el recuento; solo se indica que cada etapa se reconstruye desde config.json) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para NutriText; la entrada visual es una imagen RGB encajada en un lienzo de 378 x 504 pixeles |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible. La parte textual (NutriText) se entrena con nombres de alimentos de USDA FoodData Central, en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), acompanado de config.json, nutritext_tokenizer.json, model.py, handler.py, requirements.txt y metrics.json |

## Arquitectura y entrenamiento

El diseno separa percepcion y conocimiento nutricional. En la etapa 1, un backbone preentrenado (se entrenan dos candidatos, ConvNeXt-B y DINOv2-B, con la misma receta y se elige el ganador por validacion, con desempate a favor de ConvNeXt) alimenta un decodificador de consultas: hay una consulta aprendida por cada uno de los 253 ingredientes de Nutrition5k, y cada consulta lee los tokens de imagen mediante dos capas de cross-attention sin self-attention entre consultas. Cada consulta tiene dos salidas, presencia del ingrediente y gramos. Ademas, una cabeza de totales estima directamente masa del plato, kilocalorias y macronutrientes; los gramos por ingrediente se reescalan a esa masa en espacio logaritmico, mezclados con su propia suma segun un peso ajustado en validacion. El modelo ganador se reentrena con una cabeza auxiliar de profundidad.

La etapa 2a (NutritionLayer) es una capa lineal sin sesgo cuyos pesos son una tabla de nutrientes por gramo que nunca se entrena: kilocalorias, grasa, carbohidratos y proteina provienen de los propios valores de Nutrition5k (cuyas etiquetas son exactamente gramos multiplicados por esa tabla) y fibra, azucares, grasa saturada y sodio se incorporan desde una correspondencia revisada con USDA por ingrediente. Como las 253 neuronas de gramos son su entrada, el sistema completo se entrena de extremo a extremo. La etapa 2b (NutriText) cubre vocabulario abierto: dado cualquier nombre de alimento devuelve nutrientes por 100 g, con composicion generada por softmax multiplicado por 100 g (nunca puede superar 100 g), azucares y grasa saturada acotados por carbohidratos y grasa, y kilocalorias proximas a la energia de Atwater de la composicion. Se entrena desde cero sobre unos 470 000 nombres de USDA.

Los datos proceden del dataset shalev396/calorie-lens-data, construido a partir de Nutrition5k: un escaneo RGB-D cenital por plato cuando estaba disponible y 5 fotogramas de cada uno de los 4 videos de angulo lateral. El autor documenta la correccion de errores de etiquetado (totales de Cafe 2 registrados como 0, errores de escala x1000, nombres vacios, filas duplicadas) y la asignacion de un grupo de plato a cada muestra para que validacion y entrenamiento nunca compartan plato. La receta usa AdamW con decaimiento de learning rate por capas, warmup mas coseno, bf16, media movil exponencial de los pesos y parada temprana sobre validacion; el aumento de datos se hace en GPU, con rotacion libre para los escaneos cenitales, lo que preserva la pista de escala asociada a la altura de camara. El split de test oficial se evalua una sola vez, al final, y no se descarga ningun modelo base en inferencia (config.json registra pretrained: false).

## Capacidades

- Estimacion multi-etiqueta de ingredientes: detecta simultaneamente los ingredientes presentes de un vocabulario cerrado de 253 clases.
- Estimacion de porciones en gramos por ingrediente, con reescalado a la masa total del plato.
- Calculo de nutricion por ingrediente y agregada del plato: kcal, grasa, carbohidratos, proteina, fibra, azucares, grasa saturada y sodio.
- Salida estructurada en JSON con listas de ingredientes (nombre, gramos, confianza y nutrientes), un apartado other para lo no reconocido, totals y direct_estimate; las filas suman exactamente los totales.
- Calculadora nutricional de vocabulario abierto (NutriText): a partir de un nombre de alimento en texto devuelve nutrientes por 100 g.
- Acepta una masa total conocida (total_grams) para convertir la estimacion relativa en una medida exacta cuando el plato se ha pesado.
- Generacion de mapas de calor por ingrediente mediante analyze(), que muestra donde miro la consulta de cada ingrediente.
- Entrada flexible: imagen RGB en formato PIL, bytes o base64.
- No se describe soporte de tool calling, function calling, agentes, audio ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Registro dietetico personal: el usuario fotografia el plato y obtiene el desglose en gramos y nutrientes, lo que reduce el esfuerzo de pesar alimentos uno a uno; la opcion total_grams permite corregir la estimacion cuando se conoce la masa del plato.
- Aplicaciones de seguimiento calorico para nutricionistas: el modelo genera un JSON estructurado que se puede volcar directamente a una base de datos de seguimiento, con desglose por ingrediente en lugar de una unica cifra de calorias.
- Control de raciones en restauracion colectiva: en comedores y hospitales se pueden fotografiar las bandejas servidas y agregar estadisticas de composicion nutricional por lote, validadas despues contra pesadas manuales.
- Analisis automatico de menus y recetas: usando NutriText, se puede enriquecer una base de recetas escrita con nutrientes por 100 g sin necesidad de fotografias, solo con los nombres de los ingredientes.
- Investigacion en vision por computador aplicada a alimentacion: el modelo sirve como linea base reproducible sobre Nutrition5k, con licencia MIT y pesos abiertos, para estudiar estimacion de porciones, calibracion de incertidumbre y el uso de profundidad auxiliar.
- Educacion nutricional interactiva: una aplicacion puede mostrar mapas de calor por ingrediente para explicar al usuario en que se ha basado la estimacion, algo util en contextos docentes.
- Triaje de calidad en cocinas industriales: comparar la composicion estimada de porciones servidas frente a la receta teorica para detectar desviaciones sistematicas de racionamiento.
- Integracion en pipelines de etiquetado: el handler incluido permite desplegar el modelo como endpoint HTTP que recibe imagenes JPEG o JSON con base64 y devuelve la estructura completa, lo que facilita usarlo como servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una metrica de tipo MAE en los tags y un archivo metrics.json entre los ficheros del repositorio, pero no se incluyen los valores numericos ni comparaciones con otros modelos en la informacion proporcionada. Se sabe unicamente que el modelo se evalua sobre el split oficial de test de Nutrition5k y que esa evaluacion se realiza una sola vez, al final del proceso, tras seleccionar el backbone en validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. Como estimacion orientativa, un backbone del orden de 90 millones de parametros mas un transformer de 4 capas ocupa unos cientos de megabytes en fp32 y alrededor de 200 MB en bf16, por lo que la inferencia en una sola imagen requeriria aproximadamente entre 1 y 3 GB de memoria, incluyendo activaciones para el lienzo de 378 x 504 pixeles. Esta cifra es una estimacion, no un dato del autor.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; el autor expone solo la opcion device="cpu" o device="cuda".
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna (por ejemplo, gamas RTX con 4-8 GB), dado el tamano reducido del modelo. No confirmado por el autor.
- CPU: el ejemplo oficial del autor carga el modelo con device="cpu", de modo que la inferencia en CPU esta contemplada explicitamente.
- Opciones de despliegue: carga nativa con PyTorch mediante snapshot_download mas model.load(), el handler.py incluido para Hugging Face Inference Endpoints (el repositorio tiene el tag endpoints_compatible), y un Space publico en Hugging Face con runtime ZeroGPU que expone /predict. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni pesos en formato GGUF.
- Latencia y throughput: no disponibles. El endpoint del Space devuelve, junto al resultado, el tiempo en segundos y el dispositivo empleado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto o entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calorie Lens (este modelo) | Ingredientes + gramos + nutrientes por ingrediente y totales | no disponible (backbone en torno a 90 M, no confirmado) | Imagen 378 x 504 px; texto para NutriText | MIT | Pesos abiertos en Hugging Face, Space y handler para endpoints |
| Clasificadores de alimentos tipo ResNet-50 / ViT-B entrenados en Food-101 | Clasificacion de una unica etiqueta de plato entre 101 clases | 25,6 M (ResNet-50) / 86 M (ViT-B) | Imagen fija | Variable segun el autor | Amplia, pero sin estimacion de gramos ni nutrientes |
| Modelos vision-language generalistas tipo CLIP ViT-B/32 | Zero-shot imagen-texto, requiere prompting para clasificar alimentos | 151 M | Imagen + texto | Variable segun la version | Amplia, sin granularidad de porciones |
| Enfoques publicados sobre Nutrition5k por el equipo de Google Research | Estimacion de masa e ingredientes en platos de cafeteria | no disponible en la informacion proporcionada | Imagen RGB-D | no disponible | no disponible |

No se dispone de resultados numericos comparables entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a tarea, tamano y licencia.

## Limitaciones y advertencias

- Vocabulario cerrado de 253 ingredientes: lo que no esta en ese conjunto cae en el apartado other y no recibe estimacion por ingrediente.
- Sesgo de dominio: el entrenamiento procede de Nutrition5k, con platos de cafeteria y fotos cenitales o de angulo lateral, por lo que el rendimiento fuera de ese tipo de cocina, de presentacion o de iluminacion es incierto.
- La inferencia trabaja con imagen RGB, no con la profundidad de Nutrition5k; la estimacion de gramos depende de pistas de escala visuales y es la parte mas fragil del sistema.
- Riesgo de alucinacion controlado pero no nulo: la capa de nutricion es fija y esta acotada por construccion, pero la presencia y los gramos por ingrediente pueden ser incorrectos y propagarse a los totales.
- NutriText esta entrenado con nombres de alimentos de USDA en ingles, por lo que el uso con nombres en castellano u otros idiomas no esta garantizado ni documentado.
- Idiomas soportados: no disponible en la informacion. No se declara soporte multilingue.
- No es un dispositivo medico ni una herramienta de diagnostico; las cifras son estimaciones a partir de una fotografia y no deben usarse para prescripcion clinica.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con conservacion del aviso de copyright. No se declaran restricciones adicionales de uso.
- Dependencia del repositorio: la carga se hace ejecutando model.py desde el snapshot descargado (import model y model.load), lo que implica ejecutar codigo Python del repositorio; conviene auditar ese fichero antes de desplegarlo en produccion.
- No se publican cifras de error, intervalos de confianza ni evaluacion por subgrupos, por lo que no es posible calibrar de antemano la precision esperada en un caso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/calorie-lens
- Space de demostracion: https://huggingface.co/spaces/shalev396/calorie-lens
- Dataset de entrenamiento: https://huggingface.co/datasets/shalev396/calorie-lens-data
- Repositorio GitHub del proyecto: https://github.com/shalev396/ml-lab/tree/main/calorie-lens
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/calorie-lens/training/notebook.ipynb
- Dataset Nutrition5k (Google Research): https://github.com/google-research-datasets/Nutrition5k
- USDA FoodData Central: https://fdc.nal.usda.gov/
