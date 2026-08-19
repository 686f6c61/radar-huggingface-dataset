# Cadmon/AcroMELD

## Resumen

AcroMELD es un modelo de detección de objetos especializado en el reconocimiento de campos de formulario en documentos PDF, desarrollado por el autor Cadmon. Su función principal es convertir un PDF plano (sin campos interactivos) en un formulario rellenable, detectando los campos de texto, opción y firma, y generando un AcroForm real. El nombre corresponde a las siglas AcroForm Multi-source Evidence Linking Decoder, y su contribución técnica principal es la fusión de dos canales de información: la página renderizada y los primitivos de dibujo del propio PDF (líneas, rectángulos, trazos de glifos), lo que permite una detección más robusta que los métodos puramente visuales.

El modelo tiene 39,4 millones de parámetros y admite hasta 896 campos por página, lo que evita la truncación en formularios densos. Está entrenado sobre 35.388 PDFs y 119.418 páginas, con una arquitectura basada en un detector visual ECDet-L (EdgeCrafter) combinado con un codificador de estructura PDF sin etiquetas y un decodificador de conjuntos de grafos. Se distribuye bajo licencia Apache-2.0 y se presenta como un artefacto de investigación, no como un producto listo para producción. El autor advierte explícitamente que la detección de firmas no funciona correctamente y que el modelo solo se ha evaluado en formularios en alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos basado en ECDet-L (visual) + codificador de estructura PDF + decodificador de conjuntos de grafos |
| Parametros totales | 39,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | Solo evaluado en formularios en aleman; otros idiomas no probados |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (archivo `acromeld-inference.pt`, 158 MB) |

## Arquitectura y entrenamiento

El modelo combina tres componentes: una rama visual basada en ECDet-L (EdgeCrafter, vendida bajo Apache-2.0) con 384 consultas visuales, 384 consultas sembradas por estructura y 128 consultas libres de recuperacion, que producen 896 consultas exclusivas. Estas pasan por 4 capas de grafos dispersas con pesos geometricos, que generan cajas delimitadoras, tres clases (Texto, Eleccion, Firma) mas la clase "sin objeto", calidad de localizacion y enlaces de mismo campo. El decodificador de conjuntos produce consultas exclusivas, por lo que no necesita supresion de no-maximos (NMS con IoU 1.0 desactivado).

El entrenamiento se realizo en 35.388 PDFs (119.418 paginas) con dos NVIDIA RTX A6000, batch efectivo de 32 y se selecciono la epoca 32 de 33 segun una metrica de contencion en un split de desarrollo. El conjunto de validacion externo (1.996 PDFs / 6.843 paginas) se excluyo del indice de entrenamiento por hash de documento. El modelo se congelo y bloqueo por hash antes de abrir el holdout, y se aplico un umbral calibrado pre-registrado. El 12% de las paginas de entrenamiento se presentaron sin el canal de primitivos PDF para simular paginas escaneadas, lo que permite que el modelo degrade en lugar de fallar en esos casos.

## Capacidades

- Deteccion de campos de formulario en PDF: identifica campos de texto, eleccion (casillas, listas desplegables) y firma.
- Generacion de AcroForms: a partir de un PDF plano, el modelo localiza los campos y permite escribir un formulario interactivo real.
- Fusion de multiples fuentes de evidencia: combina la imagen renderizada de la pagina con los primitivos vectoriales del PDF (lineas, rectangulos, glifos) para mejorar la precision.
- Manejo de formularios densos: soporta hasta 896 campos por pagina sin truncacion.
- Degradacion controlada en paginas escaneadas: si no hay primitivos PDF, el modelo sigue funcionando, aunque con menor rendimiento.
- Rechazo de paginas rotadas: las paginas con rotacion se rechazan en lugar de producir resultados incorrectos.

## Casos de uso

- Digitalizacion de formularios en papel escaneados: el modelo puede procesar PDFs escaneados (sin primitivos) y detectar los campos, aunque con menor precision que en PDFs nativos.
- Conversion de PDFs planos a formularios rellenables en entornos administrativos: una entidad publica o privada con archivos de formularios sin campos interactivos puede automatizar la generacion de AcroForms con el comando `acromeld input.pdf output.pdf`.
- Preprocesamiento para pipelines de extraccion de datos: al conocer la ubicacion de los campos, se puede alimentar un sistema OCR o de extraccion de entidades con las regiones exactas de interes.
- Automatizacion de flujos de trabajo de documentos en aleman: el modelo se evaluo exclusivamente con formularios en aleman, por lo que es adecuado para entornos germanoparlantes.
- Generacion de formularios accesibles: al crear campos interactivos, se facilita la navegacion por teclado y la compatibilidad con lectores de pantalla en documentos PDF.
- Investigacion en deteccion de campos de formulario: el modelo sirve como referencia para estudiar la fusion de canales visuales y estructurales en tareas de document AI.

## Benchmarks y rendimiento

El autor publica una unica medicion sobre un holdout sellado de 1.996 PDFs (6.843 paginas) que el modelo no vio durante el entrenamiento, con un umbral de aprobacion pre-registrado.

| Metrica | Valor |
|---|---|
| Contencion micro-F1 (umbral registrado) | 0,82903655889853 |
| Contencion micro-F1 (AcroMELD) | 0,8476748634830094 |
| Verdict | Aprobado (passed) |
| F1 por clase - Firma (umbral calibrado) | 0,0677 |
| mAP (adaptador estricto IoU/COCO) | 0,28996 |

El autor advierte que la deteccion de firmas es practicamente inutil en el umbral calibrado, y que el mAP estricto es inferior al de una referencia CommonForms-L evaluada localmente. Los dos adaptadores usan conteos de ground-truth distintos y no son comparables entre si. No se proporcionan resultados de benchmarks estandar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- El archivo de pesos pesa 158 MB, por lo que la carga en memoria es ligera.
- Inferencia en CPU posible, aunque se recomienda GPU para procesamiento por lotes de muchas paginas.
- Las GPU de consumo como RTX 3060 o superiores son suficientes para la inferencia; el entrenamiento se realizo con 2x NVIDIA RTX A6000.
- No se especifican requisitos de VRAM concretos, pero al tratarse de un detector de objetos de 39,4 M de parametros, cabra en cualquier GPU moderna con mas de 4 GB.
- Despliegue: el paquete `acromeld` (pip) descarga los pesos automaticamente en el primer uso. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput no publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar AcroMELD con otros modelos de deteccion de campos de formulario en el mercado, como los basados en LayoutLM o los detectores de objetos genericos. El autor menciona una referencia local "CommonForms-L" pero no proporciona detalles suficientes para una comparativa rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La deteccion de campos de firma no funciona: en el umbral calibrado, el modelo predice practicamente cero campos de firma (F1 por clase de 0,0677). Cualquier salida de firma debe considerarse no utilizable.
- El rendimiento bajo un adaptador estricto IoU/COCO es bajo (mAP 0,28996), muy por debajo de una referencia local. El autor lo reporta como el numero menos favorecedor.
- Solo se ha evaluado en formularios en aleman. Otros idiomas y disenos de formulario no estan probados.
- Las paginas rotadas se rechazan, no se corrigen ni se procesan.
- Es un artefacto de investigacion: una unica ejecucion sellada, una semilla, sin estudios de estabilidad ni ablaciones de componentes.
- El corpus de entrenamiento no se publica por derechos de terceros y posibles datos sensibles; el codigo de entrenamiento tampoco esta disponible.
- Aunque la licencia es Apache-2.0, el uso en produccion requiere validacion adicional en el dominio especifico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cadmon/AcroMELD
- Paquete Python: `pip install acromeld` (no se proporciona URL del repositorio)
- No se encontraron papers, blogs o demos adicionales en la busqueda web.
