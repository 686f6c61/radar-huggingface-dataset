# hylin16/food-recognition-food11-effnet-b0-cbam-300

## Resumen

Modelo de clasificación de imágenes de comida desarrollado por el autor `hylin16`. Utiliza un backbone `EfficientNet-B0` de TorchVision al que se le inserta un bloque CBAM (*Convolutional Block Attention Module*), concretamente atención de canal y espacial, entre las features extraídas y la cabeza de clasificación. El modelo está entrenado de forma totalmente supervisada sobre el dataset Food-11, compuesto por 11 clases de alimentos, a una resolución de entrada de 300 píxeles. La publicación de este checkpoint permite evaluar el impacto de módulos de atención como CBAM sobre una arquitectura ligera y ofrece un punto de partida para tareas de reconocimiento de alimentos.

Según los datos declarados por el autor, el modelo alcanza una precisión top-1 del 95,15 % y un macro F1 de 0,9514 sobre el split de validación de Food-11. El checkpoint generado embebe la arquitectura, la resolución de entrada y los nombres de las clases, lo que simplifica su carga posterior sin necesidad de especificar estos parámetros manualmente. Es una implementación práctica que incluye además una CLI para generar mapas de activación GradCAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 con bloque CBAM (atencion de canal y espacial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tarea de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura parte de un `efficientnet_b0` de TorchVision, sobre el que se inserta un bloque CBAM antes de la cabeza de clasificación. CBAM combina una atención de canal y una atención espacial, lo que permite recalibrar las features de forma adaptativa. El modelo se entrena sobre el dataset Food-11, con 11 clases, a una resolución de 300 píxeles, durante 30 épocas, con un batch size de 32, un learning rate de 0,0005 y un scheduler coseno. El entrenamiento es totalmente supervisado y dura 19 minutos en la GPU utilizada por el autor. El checkpoint publicado corresponde a la época 23 y se distribuye como un archivo `best.pt`.

## Capacidades

- Clasificación de imágenes de comida en 11 categorías (dataset Food-11).
- Integración de un módulo de atención CBAM que actúa sobre las features extraídas por el backbone.
- Soporte de inferencia con top-k (\(k\) configurable), permitiendo obtener varias predicciones ordenadas por probabilidad.
- El checkpoint incluye metadatos que describen la arquitectura, la resolución y las clases, por lo que no es necesario especificarlos en el momento de la carga.
- La librería asociada `food_recognition` ofrece una CLI para generar visualizaciones GradCAM, útiles para interpretar las regiones de la imagen que más influyen en la predicción.
- No soporta tool calling, agentes ni razonamiento multi-paso, al tratarse de un clasificador de imágenes.

## Casos de uso

- **Etiquetado automático de datasets de comida:** permite pre-clasificar imágenes de distintos platos en 11 categorías, acelerando el proceso de anotación manual en proyectos de visión por computador.
- **Aplicaciones móviles de registro de dietas:** clasifica fotografías de comidas para ayudar a completar registros de alimentación, aunque debe complementarse con supervisión humana debido a las limitaciones en la generalización.
- **Sistemas de recomendación de recetas:** utiliza la categoría predicha para sugerir recetas relacionadas, por ejemplo, si la imagen es clasificada como pizza, se pueden mostrar opciones de recetas de pizza.
- **Herramientas educativas sobre mecanismos de atención:** sirve como ejemplo práctico de cómo un módulo CBAM afecta a la clasificación, y la visualización GradCAM permite mostrar qué zonas de la imagen pesan más en la decisión.
- **Análisis de menús en fotografía:** categoriza platos fotografiados en un menú, facilitando la búsqueda por tipo de comida en aplicaciones de restauración.
- **Base de comparación para investigación:** al ser un checkpoint pequeño y reproducible, puede utilizarse como baseline para evaluar otras variantes de atención o arquitecturas ligeras en el dataset Food-11.

## Benchmarks y rendimiento

Resultados declarados por el autor para el modelo `efficientnet_b0_cbam` sobre el split de validación de Food-11:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 95,15 % |
| Macro F1 | 0,9514 |
| Resolucion de entrada | 300 px |
| Epoca del checkpoint | 23 |
| Clase mas dificil | 02 (F1 0,872) |
| Clase mas facil | 06 (F1 1,000) |

Estos valores proceden del `metrics.json` de la ejecución y son recalculados por el repositorio para cada checkpoint publicado. La modelo se marca como no verificada en el model-index de HuggingFace, y el propio autor advierte de que la precisión de validación es un estimado optimista del comportamiento real en el campo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se dispone de datos específicos, aunque el backbone EfficientNet-B0 es una arquitectura ligera típicamente adecuada para entornos con recursos limitados.
- Opciones de despliegue: no se especifican en la información proporcionada. El checkpoint está empaquetado para su carga mediante la librería `food_recognition`, que utiliza `load_predictor` y lee el archivo `best.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. No existen datos de benchmarks comparativos ni resultados de otros clasificadores de Food-11 que permitan situar este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con Food-11, por lo que su precisión en otros platos, cocinas o condiciones fotográficas fuera de esa distribución es desconocida.
- El modelo devolverá una etiqueta con alta confianza incluso para imágenes que no contienen alimentos, sin señalar explícitamente la ausencia de comida.
- Las predicciones no son un juicio nutricional, alergénico ni de seguridad alimentaria. No debe utilizarse en aplicaciones donde una clasificación errónea pueda suponer un riesgo para la salud.
- Los resultados reportados son de validación sobre un split público, lo que constituye una estimación optimista del rendimiento en producción.
- Los benchmarks no están verificados externamente, tal y como se indica en el model-index de HuggingFace.
- No se han documentado sesgos específicos en la información disponible, aunque el modelo solo cubre 11 categorías de alimentos y no representa la diversidad culinaria global.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b0-cbam-300
- Repositorio de entrenamiento: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
