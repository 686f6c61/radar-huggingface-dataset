# savita10/laya-vision

# Laya-Vision

## Resumen

Laya-Vision es un modelo de decisión multimodal que extiende el modelo de decisión abierto Laya, de convaiinnovations, con un canal de entrada de imagen. En lugar de generar texto, devuelve decisiones tipadas y calibradas: una elección dentro de una lista cerrada, una puntuación en una escala o una probabilidad sí/no. La tarea que se distribuye es la clasificación de tipo de documento en 16 clases sobre RVL-CDIP, con un 86,2 % de exactitud y un error de calibración esperado (ECE) de 0,015, según los datos declarados por el autor. El repositorio lo publica el usuario savita10 bajo licencia Apache 2.0 y solo soporta inglés.

La arquitectura combina un encoder visual SigLIP-base-384 congelado (`google/siglip-base-patch16-384`) con un proyector y una cabeza de decisión entrenables de 28,1 M de parámetros, montados sobre una base Laya afinada en la etapa Gate-0 (ModernBERT-large, 843 MB en fp16). El modelo acepta imagen, texto OCR o ambos, aunque la modalidad recomendada es solo imagen; internamente se aplica letterbox a 384×384 y el OCR se ejecuta sobre la imagen original. No extrae valores ni devuelve texto libre en ningún caso.

Su relevancia práctica está en el coste por página: unos 15 ms por página en una GPU NVIDIA L4 y 2,2 s por página de extremo a extremo en la CPU de un portátil. Eso lo sitúa como primera etapa rápida de un pipeline documental, encargada de clasificar y enrutar cada página en milisegundos y de mandar solo las páginas dudosas a revisión humana o a extracción cara. La calibración de las probabilidades es lo que hace viable fijar umbrales de confianza seguros. El modelo acumula 0 descargas y 0 likes en HuggingFace en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder visual SigLIP-base-384 congelado más proyector y cabeza de decisión entrenables (28,1 M de parámetros) sobre base Laya afínada (ModernBERT-large); la descripción arquitectónica de la model card está truncada en la información disponible |
| Parámetros totales | No disponible (componentes conocidos: 28,1 M entrenables; base Laya de 843 MB en fp16; encoder SigLIP descargado aparte y no incluido en el repo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en fp32 y fp16, sin variantes cuantizadas publicadas) |
| Idiomas soportados | Inglés (`en`); el entrenamiento y la evaluación se hacen sobre documentos en inglés de RVL-CDIP |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`weights/trainable.safetensors` en fp32; `weights/base/` en fp16) |
| Tarea | Clasificación de tipo de documento en 16 clases (image-classification) |
| Modalidad de entrada | Imagen (PNG/JPEG/TIFF/BMP/WebP), texto OCR, o ambos; se recomienda solo imagen |
| Tamaño del repositorio | 1,0 GB |
| Librería | `laya-vision` |
| Fecha de creación / actualización | 2026-10-11 / 2026-10-11 |

## Arquitectura y entrenamiento

La información disponible describe un esquema de backbone congelado: el encoder SigLIP-base-384 (revisión `41aec1c8…`) procesa la imagen y solo se entrenan el proyector y la cabeza de decisión (28,1 M de parámetros en fp32). La cabeza se apoya en una base Laya previamente afinada en la etapa que el autor denomina Gate-0; el repositorio incluye ese checkpoint (843 MB en fp16) porque, según la model card, el adaptador se entrenó sobre él y no sobre el checkpoint upstream publicado. La model card detalla el contrato de secuencia y el preprocesado p2v1 en `laya_vision_config.json`, pero el texto disponible se interrumpe justo al describir la arquitectura, por lo que no se puede detallar el resto del flujo.

El entrenamiento se evalúa sobre el dataset `aharley/rvl_cdip`, con una única evaluación sobre una submuestra de test estratificada de 5.000 imágenes (artículo asociado: arXiv:1704.03557). El pipeline incluye OCR mediante Tesseract 5.3.4 para construir la vista combinada, y el SDK avisa cuando la versión local de Tesseract difiere de la usada en entrenamiento. La calibración se ajusta a posteriori: `calibration.json` guarda las temperaturas ajustadas y el ECE antes y después, vinculados por hash a los ficheros de pesos. Para preguntas nuevas distintas de la tarea distribuida, la temperatura se fija en T = 1.0 y la respuesta se marca con `"calibrated": false`. No se menciona en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO (el modelo no es generativo, por lo que esas técnicas no aplicarían del mismo modo). El artículo asociado a SigLIP es arXiv:2303.15343.

## Capacidades

- Clasificación de tipo de documento en 16 clases de RVL-CDIP: letter, form, email, handwritten, advertisement, scientific report, scientific publication, specification, file folder, news article, budget, invoice, presentation, questionnaire, resume y memo.
- Devolución de probabilidades calibradas para la tarea distribuida (ECE de 0,0145 declarado), lo que permite fijar umbrales de confianza y derivar páginas a revisión humana.
- Acepta imagen sola, texto OCR solo o la combinación de ambos; la modalidad recomendada por el autor es solo imagen.
- Admite preguntas tipadas definidas en tiempo de petición (elección entre una lista de criterios, puntuación en una escala o probabilidad sí/no) sin reentrenamiento, aunque la exactitud de esas preguntas nuevas no está medida y sus probabilidades no están calibradas.
- No genera texto libre ni extrae valores: no devuelve importes de facturas, fechas, nombres ni ningún contenido textual.
- No realiza OCR por sí mismo: el texto de entrada debe provenir de Tesseract u otro motor externo.
- No detecta escritura a mano ni juzga la legibilidad de un documento.
- No conoce tipos de documento fuera de las 16 clases: cualquier otro se fuerza a la clase más próxima.
- No es un modelo de imagen general; las imágenes que no son documentos producen respuestas sin sentido pero con apariencia de confianza alta.
- Soporte de tool calling o function calling, razonamiento multi-paso y capacidades de agente: no disponible / no aplicable en la información proporcionada.
- Capacidades multilingües: no; únicamente inglés.

## Casos de uso

- Enrutado y triaje de documentación escaneada: cada página se clasifica en milisegundos y se dirige a la cola de proceso correspondiente (facturas a cuentas a pagar, contratos a legal, formularios a intake), usando las probabilidades calibradas para decidir qué páginas van a revisión humana.
- Pre-ordenación antes de OCR o extracción: al ejecutar la clasificación primero, solo las páginas que realmente lo necesitan pasan por motores de OCR o VLM caros, lo que reduce de forma directa el coste por documento procesado.
- Digitalización de archivos históricos: el modelo está entrenado con escaneos en escala de grises de aproximadamente 90 dpi de las décadas de 1960 a 1990, que es exactamente el material habitual en proyectos de digitalización de fondos antiguos.
- Automatización de intake con umbral de revisión: el ECE declarado de 0,0145 permite definir un umbral de confianza por debajo del cual la página se deriva a una persona, en lugar de aceptar automáticamente una clasificación dudosa.
- Clasificación por lotes de gran volumen: los 15 ms por página medidos en una L4 equivalen a unos 66 páginas por segundo por GPU en la fase de clasificación, un orden de magnitud adecuado para digitalizaciones masivas.
- Control de calidad de pipelines de digitalización: la clasificación resultante se puede usar como señal para detectar páginas mal escaneadas, mal ordenadas o mezcladas en un lote, ya que una página fuera de distribución tiende a producir una decisión poco fiable.
- Investigación sobre modelos de decisión multimodales con backbone congelado: el repositorio publica el protocolo de evaluación, las temperaturas de calibración, los diagramas de fiabilidad y los scripts de demo, lo que sirve como referencia reproducible para estudiar calibración en clasificación documental.
- Prefiltrado en pipelines que ya usan un VLM: se usa Laya-Vision como etapa barata que descarta o marca páginas antes de invocar un modelo generativo mucho más caro por página.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el `model-index` de la model card. No están verificados de forma independiente (`"verified": false`).

| Métrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Accuracy | RVL-CDIP, submuestra de test estratificada de 5.000 imágenes (16 clases) | 0,8624 | No |
| Expected calibration error (ECE) | RVL-CDIP, misma submuestra | 0,0145 | No |

Medidas de latencia declaradas en la model card: aproximadamente 15 ms por página en una GPU NVIDIA L4 y aproximadamente 2,2 s por página de extremo a extremo en la CPU de un portátil. No se publican cifras de throughput agregado.

## Requisitos de hardware

- Pesos empaquetados en el repositorio: 112 MB del proyector y la cabeza en fp32 más 843 MB de la base Laya en fp16, es decir, en torno a 955 MB antes de contar el encoder SigLIP, que se descarga aparte y no se distribuye en el repo.
- VRAM estimada para inferencia: no se publica una cifra oficial. Partiendo de los tamaños anteriores y del encoder SigLIP descargado, la estimación orientativa es de unos 2-3 GB en fp16; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el dato medido por el autor corresponde a una NVIDIA L4. Cualquier GPU de gama media o alta (L4, T4, A10, RTX 3090, RTX 4090, A100, H100) sirve para esta carga, que está limitada por el coste de un único paso de encoder visual.
- GPU de consumo: sí, cabe en GPUs de consumo con 4 GB o más de VRAM, incluidas las gamas RTX 30 y 40.
- CPU: viable pero lenta; 2,2 s por página de extremo a extremo en un portátil, incluyendo el OCR cuando se usa la vista combinada.
- Opciones de despliegue: SDK propio del proyecto (`from laya_vision import VisionAgent`), con dependencias `laya==0.3.24`, `transformers==4.49.0`, `torch`, `pillow` y `huggingface_hub`. El script `scripts/demo.py` procesa directorios de imágenes y produce un JSON de resultados. Tesseract 5.3.4 es opcional y solo necesario para la vista combinada imagen + texto.
- vLLM, llama.cpp, Ollama o TGI: no se mencionan en la documentación disponible y, al no ser un modelo generativo de texto, no son las vías de despliegue previstas.
- Latencia declarada: 15 ms por página en L4; 2,2 s por página end-to-end en CPU de portátil. Throughput agregado: no publicado.

## Comparativa con modelos similares

No se han proporcionado en esta información resultados de benchmarks, parámetros, contexto ni licencias de modelos alternativos, por lo que no se puede construir una comparativa numérica fiable.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| savita10/laya-vision | Clasificación de tipo de documento sobre RVL-CDIP, decisión calibrada | No disponible en total (28,1 M entrenables) | No disponible | Apache 2.0 | 86,2 % de accuracy y ECE de 0,0145 declarados por el autor |
| DiT (Document Image Transformer) | Baseline habitual de clasificación documental sobre RVL-CDIP | No disponible | No disponible | No disponible | No disponible en esta información |
| LayoutLMv3 | Baseline habitual de comprensión documental multimodal | No disponible | No disponible | No disponible | No disponible en esta información |
| Donut | Modelo documento-a-texto con variantes de clasificación | No disponible | No disponible | No disponible | No disponible en esta información |

Las filas de DiT, LayoutLMv3 y Donut se incluyen únicamente como referencia de qué familias de modelos compiten en esta tarea; sus cifras no se han verificado en la información disponible.

## Limitaciones y advertencias

- No extrae contenido: no lee importes, fechas ni nombres, y nunca devuelve texto libre. Cualquier expectativa de extracción debe cubrirse con otro componente del pipeline.
- Fuera de distribución por diseño: el entrenamiento se hizo con escaneos en escala de grises de unas 90 dpi de las décadas de 1960 a 1990, de modo que los PDF en color modernos, las fotos hechas con el móvil y las capturas de pantalla quedan fuera de distribución y deben validarse antes de usarse.
- Clases cerradas: los 16 tipos de RVL-CDIP son el universo completo. Cualquier documento de otro tipo se fuerza a la clase más próxima, sin aviso explícito de que la etiqueta es incorrecta.
- Imágenes no documentales: el modelo no es un modelo de imagen general y produce respuestas sin sentido pero con apariencia de confianza alta ante entradas que no son documentos.
- Riesgo de alucinación en el sentido de confianza mal situada: las preguntas tipadas nuevas definidas en tiempo de solicitud se responden con T = 1.0 y `"calibrated": false`, con exactitud no medida. No deben usarse para decisiones automatizadas sin validación previa.
- Idioma: solo inglés. No hay soporte declarado para documentos en castellano ni en otras lenguas.
- Dependencia del OCR externo: la vista combinada requiere Tesseract y el SDK advierte cuando la versión local difiere de la 5.3.4 usada en entrenamiento, con posibles variaciones en el texto.
- Multitiff y PDF: los TIFF de varias páginas solo procesan la primera página; los PDF deben rasterizarse previamente (el autor recomienda unos 150 dpi).
- Sin detección de escritura a mano ni juicio de legibilidad, aunque existe una clase `handwritten` que clasifica el tipo de documento, no su contenido.
- Decisiones de alto riesgo: la model card prohíbe explícitamente el uso en decisiones automatizadas de alto impacto sin un umbral de revisión humana.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha, métricas no verificadas de forma independiente y una model card con el apartado de arquitectura truncado, lo que dificulta auditar el diseño sin acudir al repositorio de código.
- Integridad de pesos: el config incluye hashes SHA-256 de cada fichero de pesos, y las temperaturas de calibración están vinculadas a esos hashes; sustituir o reentrenar los pesos invalida la calibración publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/savita10/laya-vision
- Repositorio de código, historial de entrenamiento y protocolo de evaluación: https://github.com/savita10/laya-vision
- Modelo base (Laya, convaiinnovations): https://huggingface.co/convaiinnovations/laya
- Encoder visual SigLIP-base-384: https://huggingface.co/google/siglip-base-patch16-384
- Dataset RVL-CDIP: https://huggingface.co/datasets/aharley/rvl_cdip
- Artículo de RVL-CDIP: https://arxiv.org/abs/1704.03557
- Artículo de SigLIP: https://arxiv.org/abs/2303.15343

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con su autor, por lo que no se han podido añadir enlaces adicionales de prensa, demos o análisis independientes.
