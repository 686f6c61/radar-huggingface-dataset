# kaushiktechnologysolutions/indic-trans2-200m-distilled

## Resumen

IndicTrans2 es una familia de modelos de traducción automática neuronal multilingüe (NMT) desarrollada por AI4Bharat, una iniciativa de investigación del Instituto Indio de Tecnología de Madras (IIT Madras). El modelo `kaushiktechnologysolutions/indic-trans2-200m-distilled` es una versión destilada de 200 millones de parámetros de IndicTrans2, diseñada para ofrecer traducciones de alta calidad entre el inglés y las 22 lenguas programadas de la India, incluyendo hindi, tamil, bengalí, telugu, maratí y otras. El repositorio en HuggingFace contiene los pesos en formato ONNX, lo que facilita su despliegue en entornos de producción con diferentes runtimes.

Este modelo resuelve el problema de la falta de sistemas de traducción accesibles y de alta calidad para las lenguas indias, que históricamente han estado infrarrepresentadas en los modelos de IA. La versión destilada reduce el coste computacional y la latencia respecto al modelo completo, manteniendo un rendimiento competitivo, lo que lo hace adecuado para aplicaciones en tiempo real y despliegues en hardware con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (no disponible detalle de capas) |
| Parametros totales | 200 millones (aproximadamente, por nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX puede incluir cuantizacion, no especificado) |
| Idiomas soportados | 22 lenguas programadas de la India (asamés, bengalí, bodo, dogri, gujarati, hindi, canarés, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, oriya, punjabi, sánscrito, santali, sindhi, tamil, telugu, urdu) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

IndicTrans2 se basa en una arquitectura transformer encoder-decoder estándar, pero con una innovación clave: la unificación de escrituras (script unification). Esta técnica translitera todas las lenguas indias a una escritura común (Devanagari) cuando es posible, lo que permite el intercambio léxico entre lenguas relacionadas y mejora el aprendizaje por transferencia, especialmente para lenguas de bajos recursos. El modelo emplea un vocabulario compartido basado en SentencePiece con aproximadamente 64 000 subpalabras.

El entrenamiento se realizó en dos fases: primero un preentrenamiento supervisado con datos paralelos de alta calidad y luego un ajuste fino con datos adicionales. Para la versión destilada, se utilizó destilación de conocimiento desde el modelo profesor más grande (non-distilled) para comprimir el rendimiento en un modelo más pequeño y rápido. El dataset de entrenamiento incluye datos paralelos de diversas fuentes, como Samanantar, el mayor corpus paralelo para lenguas indias, junto con datos generados sintéticamente. No se ha publicado información sobre el uso de RLHF o DPO en este modelo.

## Capacidades

- Traducción automática neuronal multilingüe entre inglés y 22 lenguas programadas de la India, en ambas direcciones (inglés a indic e indic a inglés).
- Soporte de múltiples escrituras para lenguas de bajos recursos como cachemir (persoárabe, devanagari y sharada), manipuri (bengalí y meitei mayek) y sindhi (persoárabe y devanagari).
- Generación de texto traducido con fluidez y precisión contextual, especialmente en dominios generales y de noticias.
- Capacidad de procesamiento por lotes para traducción de grandes volúmenes de texto.
- Al ser un modelo de traducción, no incluye capacidades de tool calling, razonamiento multi-paso, generación de código ni visión.

## Casos de uso

- Localización de productos digitales: traducir interfaces de usuario, documentación técnica y materiales de marketing al hindi, tamil, bengalí y otras lenguas indias para llegar a más de mil millones de usuarios.
- Atención al cliente multilingüe: integrar el modelo en sistemas de tickets o chatbots para traducir consultas de clientes en lenguas regionales al inglés y viceversa, permitiendo que agentes de soporte atiendan sin barreras idiomáticas.
- Traducción de contenido editorial: automatizar la traducción de artículos de noticias, blogs y publicaciones en redes sociales para ampliar el alcance de medios digitales en el mercado indio.
- Subtitulado y transcripción: generar subtítulos traducidos para vídeos educativos, de entretenimiento o corporativos, aprovechando el formato ONNX para integración en pipelines de procesamiento de vídeo.
- Traducción de documentos legales y administrativos: asistir en la traducción de formularios, contratos y comunicaciones oficiales entre inglés y lenguas regionales, reduciendo el tiempo de procesamiento en administraciones públicas y bufetes.
- Educación y e-learning: traducir materiales educativos, exámenes y recursos de aprendizaje a lenguas vernáculas para mejorar el acceso a la educación en zonas rurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de IndicTrans2 (arXiv:2305.16307) reporta mejoras significativas sobre modelos anteriores en FLORES-101 y otros conjuntos de evaluación, pero no se dispone de cifras específicas para esta versión destilada de 200M en ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 200M en ONNX, el uso de memoria es reducido. Con precisión FP32, el modelo ocupa aproximadamente 800 MB; con cuantización INT8, podría reducirse a unos 200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU con razonable latencia para traducción por lotes.
- Sí cabe en GPUs de consumo: el modelo es adecuado para GPUs de gama media y baja, así como para inferencia en CPU con ONNX Runtime.
- Opciones de despliegue: al estar en formato ONNX, puede desplegarse con ONNX Runtime, TensorRT, OpenVINO o convertirse a otros formatos. También es compatible con frameworks como HuggingFace Optimum para aceleración.
- Latencia y throughput estimados: no disponible. Depende del hardware y del runtime utilizado, pero un modelo de 200M en ONNX en una GPU moderna debería traducir una frase en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| indic-trans2-200m-distilled (este) | 200M | no disponible | 22 indic + en | Apache 2.0 | ONNX |
| ai4bharat/indictrans2-indic-en-dist-200M | 200M | no disponible | 22 indic + en | MIT | PyTorch |
| prajdabre/rotary-indictrans2-en-indic-dist-200M | 200M | no disponible | 22 indic + en | MIT | PyTorch |
| ai4bharat/indictrans2-en-indic-dist-200M | 200M | no disponible | 22 indic + en | MIT | PyTorch |

Las alternativas de AI4Bharat son los modelos originales en PyTorch, mientras que este repositorio ofrece una conversión a ONNX. La licencia Apache 2.0 de este modelo es ligeramente más permisiva que la MIT de los originales, aunque ambas permiten uso comercial. No se dispone de comparativas de rendimiento entre estas versiones.

## Limitaciones y advertencias

- Sesgos conocidos: los modelos de traducción entrenados con datos web pueden reflejar sesgos de género, religiosos o regionales presentes en los corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo NMT, puede producir traducciones inventadas o incorrectas, especialmente con texto ambiguo, dialectos no representados o dominios especializados.
- Limitaciones de contexto: al ser un modelo de traducción, no está diseñado para tareas de generación libre ni para manejar contextos conversacionales largos.
- Limitaciones de idioma: aunque cubre 22 lenguas, la calidad varía significativamente entre lenguas de altos recursos (hindi, tamil, bengalí) y las de bajos recursos (santali, bodo, dogri).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y no se otorgan patentes implícitas.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026), lo que sugiere que puede ser un modelo no verificado o de publicación reciente. Se recomienda validar su rendimiento antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaushiktechnologysolutions/indic-trans2-200m-distilled
- Modelo original AI4Bharat: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- Repositorio GitHub de IndicTrans2: https://github.com/ai4bharat/IndicTrans2
- Página del proyecto AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/NMT/IndicTrans2/
- Paper de IndicTrans2: https://arxiv.org/abs/2305.16307
- Variante con rotary embeddings: https://huggingface.co/prajdabre/rotary-indictrans2-en-indic-dist-200M
