# Aignostics/RudolfV-2

## Resumen

RudolfV-2 es un modelo fundacional de visión por computador desarrollado por Aignostics, una empresa especializada en patología digital e inteligencia artificial. Está diseñado específicamente para histopatología: actúa como extractor de características a nivel de tile (parche) sobre imágenes de diapositivas completas (whole slide images, WSI). El modelo se basa en un backbone ViT-g/8 (vision transformer de tamaño gigante con patch de 8×8 píxeles) y fue preentrenado de forma autosupervisada sobre 300.000 diapositivas completas, adaptando la metodología de DINOv2 con distribuciones específicas de tejido y aumentos de tinción.

La relevancia de RudolfV-2 radica en que proporciona una representación densa y transferible de los tejidos, lo que permite entrenar clasificadores ligeros para tareas downstream como clasificación de tumores, gradación histológica, predicción de biomarcadores o detección de metástasis, sin necesidad de grandes volúmenes de datos etiquetados. El modelo tiene aproximadamente 1.130 millones de parámetros y se distribuye en formato safetensors, con acceso restringido (gated) en HuggingFace. A diferencia de los modelos de lenguaje, no procesa texto; su entrada son imágenes de parches histológicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-g/8) |
| Parametros totales | 1.133.789.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesamiento de imagenes) |
| Licencia | Otra (licencia especifica de Aignostics, con restricciones de uso) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RudolfV-2 emplea un backbone ViT-g/8, es decir, un vision transformer de gran escala con un tamaño de patch de 8×8 píxeles. Este tipo de arquitectura procesa la imagen en parches y aplica atención global sobre todas las posiciones, lo que resulta adecuado para capturar patrones morfológicos finos en tejidos. El preentrenamiento es autosupervisado, siguiendo el paradigma de DINOv2, pero adaptado al dominio de la patología: se muestrean distribuciones específicas de grupos de diapositivas y clústeres de tejido, y se extienden las aumentaciones con variaciones de tinción (stain variations), un factor crítico en histopatología debido a las diferencias entre laboratorios y protocolos de tinción.

El entrenamiento se realizó sobre 300.000 diapositivas completas, lo que proporciona una diversidad de tejidos, órganos y condiciones patológicas. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo de texto. La salida del modelo es un vector de características por tile, que puede utilizarse directamente o como entrada para clasificadores lineales o redes más complejas.

## Capacidades

- Extraccion de caracteristicas a nivel de tile para imagenes histopatologicas (H&E, IHC y otras tinciones).
- Clasificacion de tejido y subtipos tumorales a partir de las representaciones generadas.
- Gradacion histologica (por ejemplo, grado de diferenciacion tumoral).
- Prediccion de biomarcadores a partir de morfologia (por ejemplo, expresion de proteinas, mutaciones).
- Deteccion de metastasis en ganglios linfaticos y otros patrones patologicos.
- Soporte para transfer learning: las features extraidas pueden alimentar clasificadores ligeros o modelos de atencion sobre multiples tiles.
- No soporta tool calling, agentes ni razonamiento de texto, al ser un modelo exclusivamente visual.
- No es un modelo generativo; no produce texto ni imagenes nuevas.

## Casos de uso

- Clasificacion de subtipos de cancer: extraer features de tiles de una WSI y entrenar un clasificador lineal o MLP para distinguir subtipos (por ejemplo, adenocarcinoma vs. carcinoma escamoso). RudolfV-2 es adecuado porque sus representaciones son generalizables y reducen la necesidad de datos etiquetados.
- Prediccion de biomarcadores: a partir de imagenes H&E, predecir la expresion de biomarcadores como PD-L1, HER2 o estado mutacional (por ejemplo, EGFR, KRAS). El modelo captura caracteristicas morfologicas correlacionadas con estos marcadores.
- Deteccion de metastasis: en ganglios linfaticos, clasificar tiles como tumorales o no tumorales, y agregar las predicciones a nivel de diapositiva para detectar metastasis. Su preentrenamiento en 300k WSIs mejora la robustez frente a variaciones de tincion y artefactos.
- Segmentacion de regiones de tejido: usar las features de RudolfV-2 como entrada para modelos de segmentacion (por ejemplo, U-Net con encoder congelado) para delimitar areas tumorales, necrosis o estroma.
- Control de calidad en patologia digital: detectar artefactos de preparacion o regiones no diagnosticables clasificando tiles con un clasificador entrenado sobre las features del modelo.
- Investigacion traslacional: analisis de cohortes retrospectivas para descubrir correlaciones entre morfologia y resultados clinicos, aprovechando la capacidad del modelo para representar tejidos de multiples organos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con metricas concretas en la informacion disponible. La pagina del modelo y las noticias de Aignostics mencionan que RudolfV (la version original) alcanzo mayor precision que alternativas publicadas en conjuntos de datos clave de patologia, pero no se proporcionan numeros especificos en los materiales consultados. Por tanto, no es posible presentar una tabla comparativa cuantitativa sin riesgo de inventar datos.

## Requisitos de hardware

- Parametros: 1.133.789.200 (aproximadamente 1,13 mil millones).
- Tamano del repositorio: 4,5 GB (pesos en safetensors, probablemente en fp32).
- VRAM estimada: en fp32, ~4,5 GB; en fp16, ~2,3 GB. Con cuantizacion a 8 bits (si estuviera disponible) se reduciria a ~1,2 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en fp16 para inferencia por lotes de tiles. Tarjetas como RTX 3060, RTX 4070, RTX 4090 o A100 son adecuadas. Para entrenamiento de clasificadores sobre las features, se recomienda al menos 16 GB.
- El modelo cabe en GPUs de consumo (por ejemplo, RTX 3090/4090) sin problema para inferencia.
- Opciones de despliegue: al ser un modelo de transformers, puede cargarse con la libreria `transformers` de HuggingFace. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que estan orientadas a modelos de lenguaje. Para extraccion de features en produccion, se puede usar un pipeline con `torch` y `transformers`, o exportar a ONNX/TensorRT para optimizacion.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la inferencia de un tile de 224×224 o 256×256 deberia tomar milisegundos, pero depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de fundacion en patologia (como UNI, Virchow o Phikon) en la informacion proporcionada. Se puede afirmar que RudolfV-2 se posiciona como un modelo de tamano medio-grande (1,13B parametros) frente a alternativas como UNI (alrededor de 300M parametros) o Virchow (alrededor de 630M), pero no hay cifras de rendimiento publicadas en las fuentes consultadas. La licencia restrictiva de Aignostics limita su uso comercial, a diferencia de otros modelos con licencias mas permisivas (por ejemplo, UNI bajo licencia no comercial, Virchow bajo licencia de investigacion). Para una comparacion rigurosa, se recomienda consultar los respectivos articulos y repositorios.

## Limitaciones y advertencias

- Licencia restrictiva: segun la pagina del modelo y la version RudolfV-2-S, no se permite uso diagnostico, preventivo, terapeutico, clinico o comercial. Tampoco se permite utilizar el modelo para entrenar otros modelos que intenten replicar o aproximar sus capacidades, ni generar etiquetas o pseudo-etiquetas de supervision para dichos fines.
- Acceso restringido: el repositorio es "gated"; es necesario aceptar las condiciones de uso en HuggingFace antes de descargar los pesos.
- Solo procesa imagenes: no admite entradas de texto ni genera respuestas en lenguaje natural. No es util para tareas de lenguaje o multimodalidad.
- Sesgos potenciales: no se ha documentado la composicion demografica o geografica de las 300.000 diapositivas de entrenamiento. Si la muestra esta sesgada hacia ciertos hospitales o poblaciones, el rendimiento puede degradarse en otros contextos clinicos.
- Alucinacion: no aplica, al ser un modelo discriminativo (encoder) y no generativo.
- Dependencia de la calidad de las imagenes: la extraccion de features asume tiles de buena calidad y tincion estandar; variaciones extremas pueden afectar el rendimiento.
- Sin soporte oficial de cuantizacion: no se ofrecen versiones cuantizadas, por lo que el despliegue en dispositivos con poca memoria requiere conversion manual (por ejemplo, a ONNX con cuantizacion dinamica).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aignostics/RudolfV-2
- Version pequena (RudolfV-2-S): https://huggingface.co/Aignostics/RudolfV-2-S
- Paper de RudolfV (arxiv): https://arxiv.org/html/2401.04079v2
- Caso de estudio sobre generalizabilidad: https://www.aignostics.com/case-studies/aignostics-foundation-model-enhance-generalizability-digital-pathology-ai
- Noticia sobre liderazgo en benchmarks: https://www.aignostics.com/news/aignostics-foundation-model-for-histopathology-takes-the-lead-on-key-benchmarks
