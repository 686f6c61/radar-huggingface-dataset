# HanyueShen/risa-recaptured-image-detection

## Resumen

El modelo `HanyueShen/risa-recaptured-image-detection` es un clasificador binario especializado en distinguir imágenes capturadas directamente por una cámara de aquellas que han sido recapturadas a través de una cadena pantalla-cámara (fotografía de una pantalla o impresión). Lo desarrolla HanyueShen y se basa en la metodología RISA (Readout with Invariant Support features), que combina representaciones visuales preentrenadas con descriptores de borde y textura. El modelo está diseñado para tareas de forensica de imagen, donde la detección de recaptura es un indicador de posible manipulación o fraude visual.

La arquitectura no es un transformer completo, sino un conjunto de 17 readouts lineales que operan sobre características extraídas con un DeiT-S congelado (384 dimensiones) junto con descriptores de perfil de borde (479 dimensiones) y textura nativa (2.035 dimensiones). Los readouts utilizan kernel lineal y agregan sus logits mediante mediana coordinada. El modelo tiene solo 257.965 parámetros, lo que lo hace extremadamente ligero. La ventana de contexto no aplica al ser un clasificador de imágenes. Su relevancia actual radica en el creciente interés por la autenticación visual y la detección de contenido recapturado en entornos de verificación de identidad, moderación de contenido y análisis forense.

La liberación incluye únicamente los pesos del modelo en formato safetensors, junto con un `config.json` y un archivo de licencia. No se incluye el código de extracción de características ni el entrenamiento, por lo que el modelo espera vectores de características producidos por un pipeline RISA compatible; no es un checkpoint de Transformers de uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RISA: 17 readouts lineales sobre características DeiT-S congeladas, descriptores de borde y textura nativa |
| Parametros totales | 257.965 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante) |
| Idiomas soportados | no aplica (modelo visual) |
| Licencia | other (ver LICENSE.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el enfoque RISA, que se basa en readouts lineales sobre características invariantes de soporte. La representación visual se obtiene de un DeiT-S congelado, que produce un vector de 384 dimensiones. A esto se añaden 479 descriptores de perfil de borde y 2.035 descriptores de textura nativa, dando un vector de características total de 2.898 dimensiones. Los 17 readouts utilizan kernel lineal y sus logits binarios se agregan mediante mediana coordinada, lo que proporciona una salida robusta frente a variaciones.

El entrenamiento se realizó sobre las 86 imágenes de desarrollo del dataset DS-05 de Imperial College London, agrupadas en 12 grupos de contenido para evitar fugas de escena. La evaluación se hizo con validación cruzada estratificada por grupos (cuatro pliegues externos, tres internos), manteniendo cada identificador de contenido dentro de un único pliegue. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado clásico sobre un conjunto pequeño. La innovación principal es la combinación de características preentrenadas con descriptores artesanales y la agregación por mediana, que permite obtener un rendimiento sólido con muy pocos datos.

## Capacidades

- Clasificación binaria de imágenes: distingue entre captura directa y recaptura (fotografía de pantalla o impresión).
- Detección de recaptura a nivel de imagen completa; no está diseñado para localizar regiones recapturadas.
- Funciona sobre vectores de características RISA preextraídos; no acepta imágenes en bruto directamente.
- Específico para el dominio de forensica de imagen, con foco en el escenario representado en el dataset DS-05.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multilingües.
- Al ser un clasificador ligero, puede integrarse en pipelines de análisis forense con bajo coste computacional.

## Casos de uso

- Verificación de autenticidad de documentos: en procesos de onboarding digital o validación de identificaciones, el modelo puede señalar si una imagen de un documento ha sido fotografiada de una pantalla, lo que podría indicar fraude o suplantación.
- Moderación de contenido en plataformas: detectar imágenes recapturadas que se utilizan para evadir sistemas de detección de material inapropiado, como capturas de pantalla de contenido prohibido.
- Análisis forense en investigaciones: ayudar a peritos a identificar si una imagen presentada como evidencia fue recapturada, lo que puede afectar su validez probatoria.
- Control de calidad en fotografía de producto: en comercio electrónico, verificar que las imágenes de productos sean capturas originales y no fotografías de pantallas, mejorando la confianza del consumidor.
- Auditoría de material audiovisual: en medios de comunicación, comprobar si imágenes de archivo o de agencias han sido recapturadas, lo que puede indicar redistribución no autorizada.
- Investigación académica en forensica digital: servir como punto de partida para estudios sobre detección de recaptura, dado su pequeño tamaño y reproducibilidad.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de la evaluación agrupada fuera de pliegue (frozen four-outer/three-inner StratifiedGroupKFold):

| Metrica | Resultado agrupado fuera de pliegue |
|---|---:|
| Accuracy | 94,19% |
| Balanced accuracy | 93,57% |
| Macro-F1 | 93,82% |
| ROC-AUC | 96,57% |

La matriz de confusión es `[[30, 3], [2, 51]]`, con clases verdaderas como filas y clases predichas como columnas. El valor de 97,67% almacenado en `config.json` corresponde a la puntuación de selección de configuración agrupada, no a una estimación independiente de prueba; no debe sustituir al 94,19% de accuracy fuera de pliegue. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia del clasificador: al ser solo 17 readouts lineales sobre un vector de 2.898 dimensiones, el coste computacional es despreciable; puede ejecutarse en cualquier CPU.
- Extracción de características: requiere ejecutar DeiT-S (aproximadamente 85 millones de parámetros) y los descriptores de borde y textura. Esto puede hacerse en CPU con un tiempo de procesamiento de unos pocos segundos por imagen, o en GPU para mayor velocidad.
- VRAM estimada: menos de 1 GB para el modelo completo si se incluye DeiT-S en precisión float32; el clasificador en sí ocupa menos de 2 MB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3050 o superiores. También funciona en CPU.
- Opciones de despliegue: al ser un modelo de pesos únicamente, no es compatible directamente con vLLM, Ollama o TGI. Debe integrarse en un pipeline personalizado que primero extraiga las características RISA y luego aplique los readouts.
- Latencia: la inferencia del clasificador es del orden de microsegundos; el cuello de botella es la extracción de características, que puede tardar entre 0,1 y 1 segundo por imagen en GPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de detección de recaptura comparables en la documentación proporcionada. Existen enfoques alternativos en la literatura, como métodos basados en análisis de ruido de sensor o redes neuronales convolucionales entrenadas específicamente para recaptura, pero no se han encontrado datos concretos de rendimiento para establecer una comparativa rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El conjunto de entrenamiento es extremadamente pequeño: solo 86 imágenes y 12 grupos de contenido. Esto limita la generalización a otros dispositivos, pantallas, sesiones y condiciones de captura.
- El control de agrupación por contenido evita la fuga de escena, pero no garantiza robustez frente a variaciones de dispositivo, display o sesión.
- El modelo no ha sido validado como un sistema forense de decisión independiente; debe usarse como una señal complementaria, no como prueba concluyente.
- La recaptura benigna (fotografía de una pantalla para documentación, accesibilidad o captura de documentos) produce el mismo tipo de adquisición y puede generar falsos positivos.
- Para decisiones consecuentes, se requiere revisión humana y conservación de la evidencia original.
- La licencia es "other"; es necesario revisar el archivo `LICENSE.md` del repositorio para conocer las restricciones exactas de uso comercial y redistribución.
- El modelo no es un checkpoint de Transformers estándar; no puede cargarse con `transformers` sin un pipeline RISA compatible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HanyueShen/risa-recaptured-image-detection
- Dataset DS-05 (Imperial College London): https://www.commsp.ee.ic.ac.uk/~pld/research/Rewind/Recapture/
- Archivo de configuración y licencia dentro del repositorio: https://huggingface.co/HanyueShen/risa-recaptured-image-detection/tree/main
