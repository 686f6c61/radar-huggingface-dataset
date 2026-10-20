# iamgkkj/LeafGuard-backend

## Resumen

LeafGuard AI es un clasificador de imágenes para la identificación de enfermedades en hojas de cultivos, publicado por el usuario iamgkkj en Hugging Face. El repositorio `iamgkkj/LeafGuard-backend` no contiene pesos de un modelo de lenguaje, sino el backend de una aplicación Gradio (`sdk: gradio`, `sdk_version: 4.0.0`, `app_file: app.py`) que se ejecuta en la capa gratuita de Hugging Face Spaces y descarga los pesos desde el Hub en el arranque. La licencia declarada es MIT.

El sistema ofrece dos variantes de una misma CNN: un MobileNetV3-Small estándar de 1.556.806 parámetros (6,41 MB) y la misma red con un módulo de atención CBAM (Convolutional Block Attention Module) de 1.562.524 parámetros (6,49 MB). La interfaz permite comparar ambas salidas o ejecutar solo una, e incluye mapas de explicabilidad Grad-CAM sobre la imagen de entrada.

Su relevancia es la de un prototipo de visión por computador de huella mínima (menos de 7 MB de pesos) orientado a despliegue en borde o en entornos con recursos muy limitados. No es un modelo generativo: no hay contexto de tokens, ni tool calling, ni capacidades multilingües. La model card no documenta el conjunto de datos de entrenamiento, el número de clases ni métricas de precisión, por lo que debe tratarse como una demo técnica y no como un sistema validado para producción agrícola.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Small; variante con módulo de atención CBAM (canal + espacial) |
| Parámetros totales | 1.556.806 (baseline) / 1.562.524 (CBAM) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes; sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | No disponible (la model card indica que los pesos se descargan del Hub al arrancar, sin especificar formato) |
| Tarea | Clasificación multi-clase de imágenes de hojas de cultivo |
| Entrada | Imagen de una hoja (resolución de entrada no documentada) |
| Salida | Predicción de clase + mapa de explicabilidad Grad-CAM |
| Tamaño de pesos | 6,41 MB (baseline) / 6,49 MB (CBAM) |
| Número de clases | No disponible |
| Framework de despliegue | Gradio 4.0.0 sobre Hugging Face Spaces |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

MobileNetV3-Small es una red convolucional diseñada para eficiencia computacional: bloques residuales invertidos con convoluciones separables en profundidad, funciones de activación hard-swish y hard-sigmoid, y módulos de atención de tipo squeeze-and-excitation en parte de sus bloques. La variante de este proyecto añade CBAM, que aplica secuencialmente una atención de canal y una atención espacial sobre los mapas de características; el incremento de parámetros es de solo 5.718 (de 1.556.806 a 1.562.524), lo que confirma que CBAM se inserta como un módulo ligero y no como un rediseño de la red.

La model card no especifica el conjunto de datos de entrenamiento, el número de imágenes, el número de clases, la resolución de entrada, el régimen de aumentos de datos ni si hubo ajuste fino desde pesos de ImageNet. Tampoco documenta el proceso de optimización, la función de pérdida, el particionado train/val/test ni técnicas de regularización. No se menciona RLHF, DPO ni ningún proceso de alineación, algo esperable en un clasificador y no en un modelo generativo. El único elemento técnico adicional declarado es la explicabilidad mediante Grad-CAM, que genera mapas de calor sobre las regiones de la imagen que más contribuyen a la clase predicha.

## Capacidades

- Clasificación multi-clase de enfermedades en hojas de cultivo a partir de una imagen.
- Ejecución comparada de dos modelos (baseline y CBAM) sobre la misma imagen para contrastar predicciones.
- Generación de mapas de explicabilidad Grad-CAM asociados a la predicción.
- Interfaz web lista para usar mediante Gradio, con carga de imagen y selección de modelo.
- Inferencia en CPU: el tamaño de los pesos (menos de 7 MB) permite ejecución sin GPU.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo "thinking" ni de salida estructurada documentada.

## Casos de uso

- Triaje preliminar en campo desde el móvil: el usuario fotografía una hoja y obtiene una clase candidata junto con el mapa Grad-CAM. Es adecuado por su huella de 6,5 MB y su capacidad de ejecutarse en CPU, aunque la precisión real es desconocida y requeriría validación previa.
- Prefiltrado en inspección con dron o robot agrícola: al ser una CNN de 1,5 M de parámetros, puede procesar fotogramas a alta frecuencia en hardware embebido y delegar solo los casos dudosos a un modelo mayor o a un agrónomo.
- Monitorización continua en invernadero: integrado en una cámara fija, el modelo puede etiquetar imágenes periódicas y generar alertas cuando la clase predicha cambie respecto a la línea base de la parcela.
- Despliegue en borde sin conectividad: los pesos caben en una Raspberry Pi o en un microcontrolador de gama alta tras conversión, lo que permite uso en explotaciones sin cobertura de red.
- Herramienta educativa y de demostración: la comparación baseline frente a CBAM y los mapas Grad-CAM lo hacen útil para explicar el efecto de los mecanismos de atención en visión por computador.
- Asistencia al etiquetado de datasets agrícolas: las predicciones del modelo pueden usarse para pre-anotar imágenes y priorizar la revisión humana, siempre con verificación manual dada la ausencia de métricas publicadas.
- Base de investigación para experimentos con módulos de atención: el par de modelos permite ablaciones controladas de CBAM manteniendo el resto de la arquitectura constante.
- Integración en una API de gestión de explotaciones: el backend Gradio puede envolverse en un servicio HTTP que reciba imágenes y devuelva la clase y la imagen Grad-CAM al panel del agricultor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud, precisión, recall, F1, matriz de confusión ni comparación con otros clasificadores, y tampoco documenta latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con pesos de 6,41-6,49 MB y resolución de entrada moderada, la huella en memoria es mínima. Cifra exacta no disponible.
- GPU recomendadas: no es necesaria ninguna GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) ejecutaría el modelo sin aprovechar su capacidad; el cuello de botella sería el preprocesado de imagen.
- GPU de datacenter (A100, H100): innecesarias para este modelo; solo tendrían sentido para entrenamiento o para servir muchas instancias en paralelo.
- Cabe en GPU consumer: sí, de forma holgada, y también en CPU. Es viable en Raspberry Pi 4/5, Jetson Nano o dispositivos similares.
- Opciones de despliegue: Gradio 4.0.0 sobre Hugging Face Spaces (capa gratuita), tal como describe la model card. Otros runners (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje. La exportación a ONNX o TFLite es técnicamente viable dada la arquitectura, pero no está documentada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Dependencia de red: el arranque descarga los pesos desde el Hub, por lo que el servicio depende de la disponibilidad de Hugging Face en el momento de iniciar la instancia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Precisión publicada | Disponibilidad |
|---|---|---|---|---|---|
| LeafGuard baseline (MobileNetV3-Small) | 1.556.806 | Imagen; resolución no disponible | MIT | No disponible | Hugging Face (0 descargas) |
| LeafGuard + CBAM | 1.562.524 | Imagen; resolución no disponible | MIT | No disponible | Hugging Face (0 descargas) |
| MobileNetV3-Small (referencia torchvision) | ~2,5 M (aprox., cabeza de 1000 clases) | Imagen 224x224 | BSD-3-Clause (torchvision) | ImageNet top-1 ~67,7 % | Ampliamente disponible |
| EfficientNet-B0 (referencia) | ~5,3 M (aprox.) | Imagen 224x224 | No disponible | ImageNet top-1 ~77,1 % | Ampliamente disponible |
| ResNet-50 (referencia) | ~25,6 M (aprox.) | Imagen 224x224 | No disponible | ImageNet top-1 ~76,1 % | Ampliamente disponible |

Los valores de parámetros y precisión de las filas de referencia corresponden a las implementaciones estándar de cada arquitectura y se incluyen solo como orden de magnitud; no son resultados de LeafGuard ni han sido verificados contra la documentación de este repositorio. No se dispone de comparaciones publicadas frente a clasificadores específicos de enfermedades de cultivos.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay exactitud, F1 ni matriz de confusión publicadas, por lo que no es posible evaluar si el modelo supera a un clasificador trivial o a la variante baseline.
- Conjunto de datos no documentado: se desconoce el origen de las imágenes, el número de clases, el balance entre ellas y el particionado. No se puede descartar fuga de datos entre entrenamiento y validación.
- Sesgo probable hacia el dataset de origen: las CNN entrenadas con corpus agrícolas públicos suelen degradarse con fondos distintos, iluminación de campo, otras variedades de cultivo o cámaras de móvil.
- Número de clases desconocido: no se puede saber si cubre las enfermedades de interés para un cultivo concreto ni si incluye clases sanas.
- Riesgo de atajos espurios: el modelo puede apoyarse en el fondo o en el encuadre en lugar de en los síntomas foliares. Grad-CAM es una aproximación de localización, no una prueba de causalidad ni una garantía de robustez.
- Confianza no calibrada: la model card no menciona calibración ni umbrales de rechazo, algo crítico si se usa para decidir tratamientos fitosanitarios.
- Sin capacidades de texto: no puede generar recomendaciones de tratamiento ni explicaciones en lenguaje natural; solo devuelve una clase y un mapa de calor.
- Licencia MIT sobre el código y los pesos, pero la licencia del dataset de entrenamiento no se declara. Si el corpus subyacente tiene restricciones (por ejemplo, uso no comercial), la licencia MIT no las resuelve y conviene verificar antes de un uso comercial.
- Validación comunitaria nula: 0 descargas y 0 likes, sin issues ni discusión pública que permitan contrastar el comportamiento.
- Dependencia de Hugging Face Spaces y del Hub en el arranque: un fallo de red o un cambio en el repositorio deja el servicio inoperativo.
- No apto como sustituto del diagnóstico fitosanitario profesional: cualquier uso en producción requiere validación agronómica independiente y supervisión humana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamgkkj/LeafGuard-backend
- Repositorio en GitHub: https://github.com/iamgkkj/LeafGuard

No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con clasificación de imágenes agrícolas.
