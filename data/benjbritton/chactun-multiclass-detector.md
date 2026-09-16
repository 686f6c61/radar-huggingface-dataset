# benjbritton/chactun-multiclass-detector

## Resumen

Chactún multiclass detector es un modelo de detección y segmentación de instancias basado en Mask R-CNN R50-FPN, publicado por el usuario benjbritton en HuggingFace bajo licencia CC BY 4.0. Su tarea es localizar y delimitar tres clases de estructuras mayas antiguas —edificio (building), plataforma (platform) y aguada— sobre visualizaciones de relieve derivadas de lidar aerotransportado en el centro de la península de Yucatán. Se entrenó sobre el Chactún ML-ready dataset (Kokalj et al. 2023), empleando el split de entrenamiento oficial del discovery challenge de ECML PKDD 2021.

El modelo no es un detector de propósito general: está fuertemente acoplado a un rendering de entrada concreto de tres bandas a 0,5 m (factor de cielo visible con radio de 5 m y 16 direcciones; apertura positiva con la misma geometría; pendiente en escala de grises invertida), con estiramientos lineales específicos. Aplicar otra función de estiramiento sobre las mismas magnitudes físicas degrada el rendimiento de forma no evidente en la salida, según midió el propio autor. La model card insiste en que la salida es una capa de candidatos probabilística para prospección, no un censo arqueológico.

Su relevancia es doble: por un lado, ofrece un punto de partida reproducible para generación de candidatos en arqueología del paisaje con lidar; por otro, documenta de forma inusualmente honesta un resultado negativo de formulación (la diferencia frente a una línea base semántica entrenada con el mismo cómputo) y una intervención con efecto medido y replicado (aumento D4, +4,16 AP). El repositorio pesa 0,4 GB y el checkpoint principal, `model_final.pth`, 351 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN R50-FPN (detectron2), preentrenado en COCO |
| Parametros totales | No especificado en la model card; el checkpoint `model_final.pth` ocupa 351 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; la entrada es una tesela de imagen, no una secuencia de texto) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados; solo se publica el checkpoint en el formato nativo de detectron2) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Pesos: CC BY 4.0. Codigo: MIT |
| Formato de pesos | `.pth` (checkpoint de detectron2), mas `config.yaml` e `inference.py` |
| Tarea | Deteccion de objetos y segmentacion de instancias (`image-segmentation` como pipeline declarado) |
| Clases | 3: building, platform, aguada |
| Entrada | 3 bandas a 0,5 m: (1) sky-view factor, radio 5 m, 16 direcciones, lineal 0,7-1,0; (2) positive openness, misma geometria, lineal 68°-93°; (3) pendiente, grises invertidos, lineal 0°-50° |
| Salida | GeoJSON de instancias con campo `coordinate_space` (coordenadas de mapa si el raster esta georreferenciado; coordenadas de pixel si no lo esta) |
| Tamano del repositorio | 0,4 GB |
| Descargas y likes | 0 y 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

Se trata de un Mask R-CNN con backbone ResNet-50 y cuello FPN, implementado con detectron2 y partiendo de pesos preentrenados en COCO. La cabeza produce simultaneamente cajas, etiquetas de clase y máscaras de instancia para las tres clases de interés. La innovación técnica documentada no está en la arquitectura, sino en el régimen de aumento de datos: la intervención **D4** —las ocho simetrías del cuadrado— aportó **+4,16 AP** sobre el control en validación cruzada de cinco particiones, con intervalo de confianza del 95 % de [+2,70, +5,61], positivo en todas las particiones y replicado a **+4,17** en el split de evaluación. El autor justifica su validez porque las tres bandas se calculan de forma isotrópica, de modo que una rotación preserva las etiquetas; advierte explícitamente de que **no sería válido sobre hillshade**, donde el azimut de iluminación queda fijado en los píxeles.

Cuatro intervenciones adicionales del lado del modelo se midieron dentro del ruido, con intervalos de confianza que contienen el cero: anclas desplazadas (*shifted anchors*), cabeza en cascada, entrada a 960 px y sobremuestreo por factor de repetición. El entrenamiento utilizó el split de entrenamiento del discovery challenge de ECML PKDD 2021 sobre el Chactún ML-ready dataset, con la evaluación sobre el split reservado (teselas 1765-2093) y una única semilla. No se documentan en la información disponible el número de tokens de imagen vistos, la composición detallada del dataset ni fases de RLHF o DPO (no aplicables a un modelo de visión supervisado).

## Capacidades

- Detección de instancias de tres clases arqueológicas (building, platform, aguada) sobre visualizaciones de relieve lidar.
- Segmentación de instancias: genera máscaras por objeto, no solo cajas delimitadoras.
- Salida geoespacial: escribe GeoJSON que respeta el espacio de coordenadas del raster de entrada y lo declara en el campo `coordinate_space`.
- Punto de operación ajustable: el umbral de confianza permite intercambiar exhaustividad por falsos positivos, con cifras medidas (92 % de recall a 188 FP/km² con umbral 0,05; 75 % de recall a 32 FP/km² con umbral 0,50, agrupado sobre 2.094 teselas).
- Gestión de teselado por extensión en el terreno en lugar de por recuento de píxeles, con envolvente de resolución aproximada de 0,33 a 1 m.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: no es un modelo generativo de texto.
- Sin capacidades multilingües: no procesa lenguaje natural.
- Sin modo *thinking*, visión general, audio ni otras modalidades: solo acepta el rendering de tres bandas especificado.

## Casos de uso

- Generación de candidatos para prospección arqueológica en el centro de Yucatán: el modelo recorre visualizaciones lidar a 0,5 m y devuelve instancias de building, platform y aguada en GeoJSON, que se cargan directamente en un SIG para priorizar trabajo de campo.
- Priorización de visitas de campo con coste controlado: gracias a los dos puntos de operación medidos, un equipo puede fijar el umbral según el coste de una visita (por ejemplo, umbral 0,50 para 32 FP/km² cuando el desplazamiento es caro, o umbral 0,05 para 92 % de recall cuando se dispone de revisión manual masiva).
- Preanotación para fotointerpretación: las máscaras de instancia sirven como borrador editable, reduciendo el tiempo de digitalización manual de estructuras sobre relieve lidar.
- Cribado de grandes volúmenes de lidar aerotransportado: con una envolvente de resolución de 0,33-1 m, se puede aplicar como filtro inicial sobre coberturas extensas antes de cualquier inspección humana.
- Integración en flujos de trabajo geoespaciales: `inference.py` produce GeoJSON que conserva el CRS del raster de entrada, lo que permite encadenar el resultado con herramientas GIS estándar o bases de datos espaciales.
- Investigación metodológica reproducible: el repositorio `benjbritton/geoai-detection` documenta el experimento completo, incluidos cuatro resultados refutados por medición posterior, lo que lo convierte en una base útil para comparar formulaciones de instancia frente a semántica.
- Contraste con cartografía existente: superponer la capa de candidatos con catálogos previos permite localizar estructuras no registradas o detectar discrepancias de delimitación.
- Docencia y formación en geoAI arqueológica: al ser un modelo pequeño (0,4 GB de repositorio) con licencia permisiva, se puede desplegar en un portátil con GPU de gama media para talleres prácticos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split reservado del challenge (teselas 1765-2093), una única semilla:

| Metrica | Valor |
|---|---|
| segm AP | 44,63 |
| segm AP50 | 69,31 |
| segm AP75 | 49,17 |
| segm AP por clase (building / platform / aguada) | 42,39 / 55,25 / 36,24 |
| IoU semantico (convencion del challenge) | 0,794 |

Puntos de operacion medidos, agrupados sobre las 2.094 teselas:

| Umbral de score | Recall de estructuras anotadas | Falsos positivos |
|---|---|---|
| 0,05 | 92 % | 188 FP/km² |
| 0,50 | 75 % | 32 FP/km² |

Contexto de referencia aportado por el autor: el campo publicado en la tabla de clasificación de ese split se mueve entre 0,811 y 0,834 de IoU semantico, pero esas entradas son ensembles de cinco particiones con pseudo-etiquetado y *test-time augmentation*. Una línea base de segmentación semántica entrenada con cómputo equivalente alcanza 0,809, lo que sitúa la mayor parte de la diferencia en la formulación instancia frente a semántica, no en el esfuerzo de entrenamiento. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Para un Mask R-CNN R50-FPN a resoluciones de tesela de hasta 960 px, la huella típica de esta arquitectura en fp32 se sitúa en el entorno de 4-8 GB, pero es una estimación derivada de la arquitectura, no una medición de este checkpoint.
- GPU recomendadas: no especificadas. Por tamano de modelo, cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia; para lotes grandes o entrenamiento, se beneficiaria de A100 o H100.
- Compatibilidad con GPU de consumo: si, es un modelo pequeno (checkpoint de 351 MB) y cabe en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- Opciones de despliegue: detectron2 nativo es la via documentada (el repo incluye `config.yaml` e `inference.py`). No se documentan exportaciones a ONNX, TorchScript, TensorRT, GGUF, Ollama, vLLM ni TGI; ninguna de esas rutas esta soportada oficialmente por la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni tasas de procesamiento por tesela.

## Comparativa con modelos similares

No se identifican en la informacion disponible otros modelos publicados con nombre propio y pesos abiertos para esta tarea concreta. La comparacion posible es con las entradas del challenge y con la linea base semantica descritas por el autor:

| Alternativa | Formulacion | IoU semantico | Notas |
|---|---|---|---|
| Chactun multiclass detector (este modelo) | Mask R-CNN R50-FPN, instancias, semilla unica | 0,794 | Pesos CC BY 4.0 disponibles en HuggingFace |
| Entradas del leaderboard del challenge | Ensembles de cinco particiones con pseudo-etiquetado y TTA | 0,811-0,834 | Identidades y licencias no disponibles en la informacion proporcionada |
| Linea base de segmentacion semantica | Entrenada con computo equivalente | 0,809 | Nombres, parametros y disponibilidad no disponibles |

En parametros, contexto y licencia no hay datos publicados para las dos alternativas, por lo que la comparacion se limita a la metrica de IoU semantico y a la formulacion.

## Limitaciones y advertencias

- **Aguada esta limitada por las bandas, no por falta de aprendizaje.** Las tres visualizaciones enfatizan rasgos en relieve; una aguada es una depresion y difiere del fondo en unos dos cuentas, frente a las 45-60 de un edificio. Los propios autores del dataset usaron a mano una cuarta visualizacion (dominancia local) para trazar bordes de aguada. Mas datos de entrenamiento no resuelven esto; haria falta otra banda.
- **Ambiguedad karstica.** Los afloramientos de caliza meteorizada y los margenes de rejollada se parecen a plataformas informales no rectilineas. Esta ambiguedad afecta igualmente a la interpretacion manual.
- **Envolvente de resolucion aproximada de 0,33-1 m.** Con datos mas gruesos, la clase aguada es la primera en degradarse.
- **Optimismo de validacion.** Las teselas de Chactun se parecen mucho entre si, de modo que cada tesela de validacion tiene una casi gemela en entrenamiento bajo cualquier particion. El dataset no incluye georreferenciacion (enmascarado deliberado de los autores para proteger yacimientos no documentados), por lo que no es posible un split bloqueado espacialmente.
- **Semilla unica.** Las cifras de la tabla principal no llevan intervalos; solo los llevan los numeros de validacion cruzada.
- **Sensibilidad al rendering de entrada.** El modelo solo es portable en la medida en que el rendering de tres bandas sea reproducible. Igualar la estadistica de las bandas no equivale a aplicar la misma funcion de estiramiento, y el autor midio que esa sustitucion es peor que no hacer nada.
- **Riesgo de alucinacion:** el modelo produce falsos positivos a tasas medibles (188 FP/km² a umbral 0,05 sobre 2.094 teselas). La salida debe tratarse como capa de candidatos, nunca como inventario.
- **Sesgos conocidos:** no se documentan analisis de sesgo mas alla de la ambiguedad karstica y la limitacion de clase aguada.
- **Licencia y uso comercial:** los pesos son CC BY 4.0 y el codigo es MIT, por lo que el uso comercial esta permitido con atribucion. Es obligatorio citar el dataset de Kokalj et al. (2023) si se usa el modelo.
- **Caveat de produccion:** el modelo esta acoplado a una resolucion (0,5 m) y a un pipeline de visualizacion concretos; desplegarlo sobre coberturas lidar con otras caracteristicas o sobre otra region requiere revalidacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benjbritton/chactun-multiclass-detector
- Repositorio experimental completo: https://github.com/benjbritton/geoai-detection
- Dataset Chactún ML-ready: https://doi.org/10.6084/m9.figshare.22202395
- Articulo del dataset (Kokalj, Ž., Somrak, M., et al. 2023, *Scientific Data* 10:558): https://doi.org/10.1038/s41597-023-02455-x
