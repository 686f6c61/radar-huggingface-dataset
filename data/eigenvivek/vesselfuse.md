# eigenvivek/vesselfuse

## Resumen

vesselfuse es un modelo de segmentación de vasos sanguíneos en imágenes médicas 3D desarrollado por eigenvivek. Se distribuye como pesos preentrenados para la clase `vesselfuse.VesselFuse`, construida sobre una arquitectura MONAI DynUNet con 18 canales de entrada: 9 modalidades de imagen (CTA, CT, TOF, T1, T1+c, T2, FLAIR, SWI y SWI phase) y 9 máscaras de presencia asociadas. El modelo aborda el problema de la segmentación vascular multimodal con superresolución, unificando información de distintas secuencias de resonancia magnética y tomografía computarizada en una única predicción.

El modelo se presenta como pesos complementarios para la herramienta de línea de comandos `vesselfuse`, que los descarga automáticamente en el primer uso. El repositorio ocupa 0,1 GB y contiene el state dict de PyTorch (`vesselfuse.pt`). Los pesos derivan de un ajuste fino sobre vesselFM, un modelo fundacional de segmentación vascular, y heredan su licencia.

La relevancia actual del modelo radica en su enfoque multimodal nativo: en lugar de entrenar un modelo por modalidad, acepta hasta nueve tipos de imagen simultáneamente con máscaras de presencia que indican qué modalidades están disponibles en cada caso. Esto lo hace adecuado para pipelines clínicos heterogéneos donde no todos los estudios cuentan con las mismas secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI DynUNet (CNN 3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | vesselFM Open RAIL++-M (uso restringido a investigación y no comercial) |
| Formato de pesos | PyTorch state dict (`.pt`) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Canales de entrada | 18 (9 imágenes + 9 máscaras de presencia) |
| Modalidades de entrada | CTA, CT, TOF, T1, T1+c, T2, FLAIR, SWI, SWI phase |
| Tarea | Segmentación de vasos 3D con superresolución |
| Tamano del repositorio | 0,1 GB |
| Descargas | 0 |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

La arquitectura es una MONAI DynUNet, una red convolucional 3D con conexiones residuales y skip connections, adaptada para recibir 18 canales de entrada. Los 18 canales se componen de 9 volúmenes de imagen correspondientes a distintas modalidades (angiografía por tomografía computarizada, tomografía computarizada, time-of-flight, T1, T1 con contraste, T2, FLAIR, SWI y fase SWI) junto con 9 máscaras binarias de presencia que indican al modelo qué modalidades están disponibles en cada muestra. Este diseño permite entrenar e inferir con subconjuntos variables de modalidades sin cambiar la arquitectura.

Los pesos se obtuvieron mediante ajuste fino a partir de vesselFM, un modelo fundacional de segmentación vascular. La model card no detalla el número de tokens, la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de refuerzo o preferencias (RLHF/DPO), algo esperable en un modelo de segmentación. La innovación principal declarada es la fusión multimodal con superresolución: el modelo combina información de varias secuencias para producir segmentaciones de vasos de alta resolución. No se especifican detalles sobre la estrategia de superresolución, la función de pérdida ni el esquema de aumento de datos.

## Capacidades

- Segmentación de vasos sanguíneos en volúmenes médicos 3D.
- Fusión multimodal: acepta hasta nueve modalidades de imagen simultáneamente (CTA, CT, TOF, T1, T1+c, T2, FLAIR, SWI, SWI phase).
- Manejo de modalidades ausentes mediante máscaras de presencia de 9 canales.
- Superresolución aplicada a la segmentación vascular.
- Integración con la CLI `vesselfuse`, que descarga los pesos automáticamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de visión médica.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Segmentación vascular en estudios de ictus: el modelo puede procesar volúmenes TOF y CTA junto con secuencias estructurales (T1, T2, FLAIR) para delimitar vasos intracraneales, aprovechando las máscaras de presencia para los estudios que no incluyan todas las modalidades.
- Análisis de malformaciones arteriovenosas: la combinación de CTA y SWI permite caracterizar vasos arteriales y venosos en un mismo pase, algo útil para planificación quirúrgica.
- Investigación en angiografía por RM: el uso conjunto de TOF y T1+c con máscaras de presencia facilita entrenar y evaluar pipelines donde la disponibilidad de contraste varía entre cohortes.
- Extracción de árbol vascular para análisis morfológico: la salida de segmentación 3D sirve como base para calcular tortuosidad, diámetro y densidad vascular en estudios de investigación.
- Superresolución de segmentaciones vasculares de baja resolución: el modelo está diseñado para producir segmentaciones superresueltas, útil cuando los volúmenes originales tienen resolución anisotrópica.
- Preprocesado para modelos posteriores: las máscaras vasculares generadas pueden alimentar modelos de clasificación o registro que necesiten una región de interés vascular.
- Estudios de armonización multimodal: al aceptar nueve modalidades con máscaras de presencia, permite comparar el rendimiento con subconjuntos de secuencias y evaluar qué modalidades aportan más información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 0,1 GB, pero el consumo en memoria depende del tamaño de los volúmenes de entrada y de la resolución de inferencia.
- GPU recomendadas: no disponible. Al ser una DynUNet 3D con 18 canales de entrada, se espera que requiera GPU con memoria suficiente para volúmenes 3D completos, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño reducido del state dict sugiere que los pesos caben en cualquier GPU moderna, pero la memoria de activaciones para volúmenes 3D puede ser el factor limitante.
- Opciones de despliegue: la vía documentada es la CLI `vesselfuse` y el uso directo de PyTorch con MONAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Modalidades de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| vesselfuse | MONAI DynUNet 3D | 9 (con máscaras de presencia) | vesselFM Open RAIL++-M (no comercial) | Hugging Face (eigenvivek/vesselfuse) |
| vesselFM | Modelo fundacional de segmentación vascular | no disponible | no disponible | Hugging Face (bwittmann/vesselFM) |
| Otros modelos de segmentación vascular 3D | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con vesselFM, del cual vesselfuse es un ajuste fino. No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se distribuyen bajo vesselFM Open RAIL++-M, con uso limitado a investigación y fines no comerciales según el Attachment A de la licencia. Cualquier uso comercial requiere revisión legal.
- Modelo de nicho: no es un modelo de lenguaje ni un modelo multimodal general; solo realiza segmentación vascular 3D.
- Dependencia de modalidades: el rendimiento puede degradarse si faltan modalidades clave, aunque las máscaras de presencia están diseñadas para mitigarlo; no se documenta hasta qué punto.
- Riesgo de alucinación en segmentación: como todo modelo de segmentación, puede producir falsos positivos o negativos en vasos de pequeño calibre o en regiones con artefactos.
- Sesgos desconocidos: no se documenta la composición demográfica ni la procedencia de los datos de entrenamiento, por lo que no se pueden evaluar sesgos poblacionales o de adquisición.
- Sin benchmarks publicados: no hay métricas de validación (Dice, clDice, etc.) en la información disponible, lo que impide evaluar su rendimiento objetivo.
- Fecha de creación futura: el repositorio figura creado el 2026-11-05, lo que puede indicar un artefacto de metadatos o una fecha programada; conviene verificar la disponibilidad real.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Formato único: solo se distribuye state dict de PyTorch, sin versiones GGUF, ONNX ni TensorRT, lo que limita el despliegue en entornos no PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/eigenvivek/vesselfuse
- Repositorio GitHub: https://github.com/eigenvivek/vesselfuse
- Modelo base vesselFM: https://huggingface.co/bwittmann/vesselFM
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
