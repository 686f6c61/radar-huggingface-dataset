# Ruicheng/moge-vitl

## Resumen

MoGe (Model for Geometry) es un modelo desarrollado por Microsoft Research, presentado como ponencia oral en CVPR 2025, que recupera geometria 3D a partir de imagenes monoculares de dominio abierto. Dada una unica imagen, el modelo predice directamente un mapa de puntos 3D de la escena capturada con una representacion invariante a la afinidad, lo que lo hace agnostico a la escala y el desplazamiento globales reales. Esta representacion evita la supervision ambigua durante el entrenamiento y facilita un aprendizaje de geometria mas efectivo.

El repositorio `Ruicheng/moge-vitl` aloja la variante ViT-Large del modelo en el hub de HuggingFace, con un tamano de 1,3 GB y licencia MIT. El modelo puede cargarse directamente mediante `MoGeModel.from_pretrained("Ruicheng/moge-vitl")` sin descarga manual, y es capaz de generar mapas de puntos metricos, mapas de profundidad metricos, mapas de normales y el campo de vision (FOV) de la camara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (1,3 GB) |

## Arquitectura y entrenamiento

MoGe utiliza una arquitectura basada en Vision Transformer (ViT) en su variante Large. El modelo predice directamente un mapa de puntos 3D con representacion invariante a la afinidad, lo que significa que la salida es agnostica a la escala y el desplazamiento globales reales de la escena. Esta eleccion de representacion es clave, ya que evita la supervision ambigua en el entrenamiento y permite un aprendizaje de geometria mas solido.

El entrenamiento se realiza sobre imagenes de dominio abierto, lo que permite al modelo generalizar a una amplia variedad de escenas y condiciones. Los detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset y si se utilizaron tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada. El modelo esta disenado para ser agnostico a la escala y el desplazamiento, lo que simplifica la supervision y mejora la calidad de la geometria aprendida.

## Capacidades

- Recuperacion de geometria 3D a partir de imagenes monoculares de dominio abierto.
- Prediccion de mapas de puntos 3D metricos.
- Generacion de mapas de profundidad metricos.
- Calculo de mapas de normales de superficie.
- Estimacion del campo de vision (FOV) de la camara.
- Representacion invariante a la afinidad, agnostica a escala y desplazamiento globales.
- Integracion sencilla con la API `MoGeModel.from_pretrained` de HuggingFace.

## Casos de uso

- Reconstruccion 3D para robotica: el modelo puede proporcionar mapas de puntos 3D metricos a partir de una unica imagen, lo que permite a robots y drones estimar distancias y geometria del entorno en tiempo real sin necesidad de sensores estereo o LiDAR.
- Realidad aumentada y virtual: la prediccion de profundidad metrica y mapas de normales permite colocar objetos virtuales de forma coherente en escenas reales capturadas con una unica camara, mejorando la experiencia de usuario en aplicaciones de RA/RV.
- Vision artificial para vehiculos autonomos: el modelo puede estimar profundidad y geometria de la carretera y obstaculos a partir de una unica imagen de camara, complementando otros sensores y mejorando la robustez del sistema de percepcion.
- Fotogrametria y topografia: la generacion de mapas de puntos 3D a partir de imagenes aereas o terrestres permite crear modelos digitales del terreno y estructuras con una sola pasada de camara, reduciendo costes y tiempo de captura.
- Analisis de escenas para vigilancia: la estimacion de geometria y normales puede ayudar a sistemas de videovigilancia a comprender la disposicion espacial de una escena y detectar anomalias basadas en la estructura 3D.
- Postprocesado de imagenes y edicion: los mapas de profundidad y normales generados pueden utilizarse para aplicar efectos como desenfoque de fondo (bokeh), relighting o reiluminacion de escenas en herramientas de edicion fotografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque el tamano del repositorio (1,3 GB) sugiere que el modelo puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precision FP16.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente compatible con tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay datos confirmados.
- Opciones de despliegue: el modelo se carga mediante la API `MoGeModel.from_pretrained` de HuggingFace, por lo que es compatible con el ecosistema Transformers y PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos similares en la informacion proporcionada. Modelos comparables en el ambito de estimacion de profundidad monocular incluyen Depth Anything, MiDaS o ZoeDepth, pero no se dispone de datos de rendimiento de MoGe para realizar una comparacion cuantitativa.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- El riesgo de alucinacion en la prediccion de geometria 3D no esta documentado, pero es inherente a cualquier modelo generativo aplicado a vision.
- El modelo esta disenado para imagenes monoculares; su rendimiento puede degradarse en condiciones de poca luz, oclusiones severas o superficies reflectantes.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones de produccion.
- No se dispone de informacion sobre limitaciones de contexto o idioma, al tratarse de un modelo de vision.
- El modelo no incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que su funcion es exclusivamente la recuperacion de geometria 3D.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ruicheng/moge-vitl
- Repositorio GitHub oficial (Microsoft): https://github.com/microsoft/MoGe
- Repositorio GitHub alternativo: https://github.com/vmurakami0123/MoGe
- Paper en arXiv: https://arxiv.org/html/2410.19115v2
