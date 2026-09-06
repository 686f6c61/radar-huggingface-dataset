# hylin16/food-recognition-food11-effnet-b4-cbam-380

## Resumen

El modelo `hylin16/food-recognition-food11-effnet-b4-cbam-380` es un clasificador de imagenes de alimentos desarrollado por el autor hylin16. Esta basado en un backbone de vision `efficientnet_b4_cbam` de torchvision, al que se le anade un bloque CBAM (Convolutional Block Attention Module) entre las caracteristicas extraidas y la cabeza de clasificacion. El bloque CBAM aplica atencion de canal y espacial para mejorar la discriminacion de las regiones mas relevantes de la imagen.

El modelo resuelve el problema de reconocimiento de alimentos en un conjunto de 11 categorias (dataset Food-11). Esta entrenado de forma totalmente supervisada, sin pseudo-etiquetado, con una resolucion de entrada de 380 pixeles. Su relevancia radica en que ofrece un rendimiento de validacion del 95% de top-1 accuracy y un macro F1 de 0.9497, lo que lo convierte en una opcion solida para aplicaciones de clasificacion de comida en escenarios controlados. El repositorio de entrenamiento es `food_recognition` y el checkpoint embebe la arquitectura, resolucion y nombres de clases, lo que simplifica su carga e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 con bloque CBAM (atencion de canal y espacial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

La arquitectura se compone de un backbone EfficientNet-B4 preentrenado de torchvision, seguido de un modulo CBAM que recalibra las caracteristicas mediante atencion de canal y espacial, y una cabeza de clasificacion totalmente conectada. Esta combinacion permite que el modelo se centre en rasgos discriminativos de los alimentos, como texturas o colores relevantes.

El entrenamiento se realizo con el dataset Food-11, que contiene 11 clases de alimentos. Segun la informacion publicada, se usaron 30 epocas, un batch size de 32, una tasa de aprendizaje de 0.0005 y un scheduler coseno. El proceso completo tardo 77 minutos. No se aplicaron tecnicas de pseudo-etiquetado, por lo que el entrenamiento es completamente supervisado. La resolucion de entrada es de 380 pixeles, y el checkpoint se guardo en la epoca 13. El modelo se evaluo sobre el split completo de validacion, obteniendo una precision del 95% y un macro F1 de 0.9497. Las clases mas dificil y mas facil fueron la clase 02 (F1 0.877) y la clase 10 (F1 1.000), respectivamente.

## Capacidades

- Clasificacion de imagenes de alimentos en 11 categorias (dataset Food-11).
- Prediccion top-k: permite obtener las k clases mas probables para una imagen dada.
- Generacion de mapas de activacion Grad-CAM para interpretar que regiones de la imagen influyeron en la prediccion.
- Carga sencilla: el checkpoint incluye la arquitectura, resolucion de entrada y nombres de clases, por lo que no es necesario especificarlos al cargar.
- No soporta tool calling, agentes ni razonamiento multi-step, al ser un modelo puramente discriminativo de vision.

## Casos de uso

- Aplicaciones moviles de conteo de calorias: el usuario fotografia un plato y el modelo devuelve la categoria del alimento, que puede combinarse con una base de datos nutricional para estimar calorias.
- Analisis de dietas en estudios nutricionales: investigacion clinica que necesita clasificar automaticamente fotografias de comidas consumidas por participantes, acelerando el registro dietetico.
- Sistemas de recomendacion en restaurantes: clasificar platos a partir de fotos de clientes para sugerir combinaciones o acompanamientos similares.
- Automatizacion de inventario en comedores escolares u hospitalarios: identificar tipos de alimentos servidos en bandejas mediante camaras, para control de raciones y desperdicio.
- Etiquetado masivo de datasets de comida: facilitar la anotacion de grandes colecciones de imagenes gastronomicas para entrenar modelos mas complejos.
- Educacion alimentaria: herramientas didacticas que identifican alimentos en imagenes para ensenar a distinguir categorias basicas (por ejemplo, frutas, verduras, carne).

## Benchmarks y rendimiento

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| Food-11 | Top-1 accuracy | 0.95 | no |
| Food-11 | Macro F1 | 0.9497 | no |

Estos resultados fueron declarados por el autor en la model card y corresponden al split de validacion completo del dataset Food-11. No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El tamano del repositorio es de 0.1 GB, lo que sugiere un modelo ligero, pero no se especifican requisitos concretos.
- Compatibilidad con GPUs de consumo: no confirmada. Dado el tamano reducido del checkpoint, es probable que sea ejecutable en tarjetas de gama media, aunque no hay datos oficiales.
- Opciones de despliegue: el modelo se integra con la libreria `food_recognition`, que permite cargar el checkpoint y ejecutar inferencia con una simple llamada. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la informacion disponible. No existen datos oficiales que permitan contrastar este modelo con alternativas de la misma categoria (por ejemplo, otros clasificadores de alimentos basados en EfficientNet).

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente con el dataset Food-11. La precision sobre platos, cocinas o condiciones fotograficas fuera de esa distribucion no ha sido medida.
- El modelo devolvera una etiqueta con alta confianza incluso para imagenes que no contienen alimentos, lo que puede generar falsos positivos en aplicaciones reales.
- Las predicciones no deben interpretarse como un juicio nutricional, alergenico o de seguridad alimentaria. No debe usarse en contextos donde una clasificacion erronea pueda suponer un riesgo para la salud.
- El valor de 95% de exactitud corresponde a un split de validacion publico, lo que constituye una estimacion optimista del rendimiento en condiciones reales.
- No se especifican sesgos conocidos mas alla de la limitacion del dominio de entrenamiento. Dado que Food-11 contiene principalmente imagenes de comida occidental, es probable que el modelo rinda peor con platos de otras culturas, aunque este extremo no se ha cuantificado.

## Enlaces

- HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b4-cbam-380
- Repositorio de entrenamiento: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
