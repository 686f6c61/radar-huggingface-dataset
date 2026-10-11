# laaduvansh/scam-detector-model

## Resumen

`laaduvansh/scam-detector-model` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `laaduvansh`, orientado por su nombre a la detección de fraudes y estafas (scam) en texto. Se distribuye como un checkpoint de tipo `text-classification` compatible con la librería `transformers` y con el stack de inferencia de HuggingFace (`text-embeddings-inference`, `endpoints_compatible`). El repositorio ocupa 0,3 GB e incluye pesos en formato `safetensors`.

Técnicamente se trata de un modelo basado en DistilBERT, según la etiqueta `distilbert` del repositorio, con 66.955.010 parámetros totales. Ese recuento coincide exactamente con el de `distilbert-base-uncased`, un transformer encoder de 6 capas y 768 dimensiones ocultas, destilado a partir de BERT. Es, por tanto, un modelo pequeño (aproximadamente 67 millones de parámetros) que puede ejecutarse en CPU o en cualquier GPU de consumo, no un modelo generativo de gran escala.

La relevancia de esta ficha es limitada pero el caso es instructivo: la model card del autor es la plantilla automática de HuggingFace sin rellenar, con todos los campos marcados como `[More Information Needed]`. No hay documentación de datos de entrenamiento, etiquetas, idiomas, licencia ni evaluación. Con cero descargas y una sola interacción al momento de la consulta, debe considerarse un experimento personal sin validar, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, segun etiqueta `distilbert` del repo) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no documentada; 512 tokens como limite posicional si la base es `distilbert-base-uncased` (dato inferido, no confirmado por el autor) |
| Tipos de cuantizacion | no disponibles; al ser un transformer estandar de ~67 M de parametros admite cuantizacion dinamica INT8 (PyTorch/ONNX Runtime) y conversion a GGUF, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Tipo de modelo | encoder de clasificacion (etiquetas y numero de clases no documentados) |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-10-11 |
| Ultima actualizacion | 2026-10-11 |

Nota tecnica: el recuento de 66.955.010 parametros coincide de forma exacta con el publicado para `distilbert-base-uncased`. Una cabeza de clasificacion de dos clases anadiria 1.538 parametros (768 x 2 + 2), por lo que el dato sugiere que el checkpoint no ha anadido una cabeza nueva o que el recuento se ha heredado de la base. No es posible confirmarlo con la informacion disponible.

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de tipo BERT reducido mediante destilacion de conocimiento: 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion y un vocabulario de aproximadamente 30.522 tokens, lo que supone en torno a un 40 % menos de parametros y una inferencia aproximadamente un 60 % mas rapida que `bert-base-uncased`, con una perdida declarada de rendimiento en GLUE de unos 3 puntos. La etiqueta `arxiv:1910.09700` que aparece en el repositorio no corresponde al articulo del modelo, sino al trabajo de Lacoste et al. sobre el calculo del impacto ambiental, citado en la plantilla de model card de HuggingFace; no debe interpretarse como referencia tecnica del modelo.

No hay informacion sobre el entrenamiento de este fine-tuning concreto: se desconoce el conjunto de datos, el numero de tokens, la composicion del corpus, el numero de clases de salida, si se aplico una division train/validation/test, ni los hiperparametros (learning rate, epocas, precision fp32/fp16/bf16). La model card no documenta ninguna innovacion tecnica, tecnica de decodificacion ni estrategia de regularizacion. Todo lo relativo al procedimiento de entrenamiento figura como `[More Information Needed]`.

## Capacidades

Las capacidades que se enumeran a continuacion derivan del tipo de pipeline declarado (`text-classification`) y del nombre del modelo, no de documentacion del autor:

- Clasificacion de texto en una o varias categorias; por el nombre del repositorio, la intencion declarada es distinguir texto fraudulento (scam) de texto legitimo.
- Inferencia eficiente en CPU y GPU por su tamano reducido (aproximadamente 67 M de parametros).
- Carga directa mediante `transformers` (`AutoModelForSequenceClassification`) y compatibilidad declarada con `text-embeddings-inference` y endpoints de HuggingFace.
- No hay evidencia de soporte de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- Capacidad multilingue: no disponible; sin idiomas declarados no puede asumirse cobertura fuera del idioma o idiomas del corpus de entrenamiento, que se desconoce.
- No se documentan modos especiales (thinking mode, cadena de pensamiento, salidas estructuradas) ni etiquetas de salida.

## Casos de uso

Todos los casos siguientes son aplicaciones plausibles de un clasificador de fraude textual, pero requieren validacion previa por parte del equipo que los adopte, dado que no existe evaluacion publicada:

- Filtrado de smishing en operadores de telefonia: integrar el modelo como etapa de triaje sobre el texto de los SMS entrantes para marcar mensajes con patrones de estafa antes de que lleguen al usuario; su tamano permite desplegarlo en inferencia por CPU a gran volumen.
- Moderacion de mensajes en plataformas de mensajeria y comunidades: clasificar mensajes de usuarios en busca de intentos de fraude (falsos soportes tecnicos, premios falsos, suplantacion de identidad) y derivarlos a revision humana o bloqueo automatico.
- Deteccion de correo de phishing en pasarelas de correo: usar el modelo como primer filtro sobre el cuerpo del mensaje, con la salida enviada a un clasificador o a un sistema de reglas mas costoso solo en los casos dudosos.
- Triaje de reclamaciones y denuncias bancarias: clasificar el texto libre de formularios de clientes para separar indicios de fraude de consultas operativas y enrutarlas al equipo adecuado.
- Deteccion de anuncios y publicaciones fraudulentas en marketplaces: analizar titulos y descripciones de listados para identificar esquemas de estafa recurrentes antes de publicarlos.
- Pre-etiquetado en pipelines de anotacion humana: emplear las predicciones como propuesta inicial que los anotadores corrigen, reduciendo el coste por ejemplo en un flujo de aprendizaje activo.
- Analisis de opiniones y resenas falsas: clasificar resenas y comentarios como sospechosos o legitimos para alimentar sistemas de reputacion, siempre con supervision humana en las decisiones de bloqueo.
- Investigacion academica sobre deteccion de fraude textual: servir como linea base ligera frente a la que comparar modelos mayores o enfoques con prompts, dado que se ejecuta en un portatil sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor es la plantilla automatica de HuggingFace y no incluye la seccion de evaluacion rellenada (metricas, conjunto de prueba, accuracy, F1, precision, recall ni matriz de confusion). Tampoco hay resultados de MMLU, GLUE, HumanEval ni GSM8K, que por otra parte no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,27 GB en fp32 (66.955.010 parametros x 4 bytes) y unos 0,13 GB en fp16. Con el overhead de activaciones y tokenizador, un presupuesto de 0,5-1 GB de memoria es suficiente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. No requiere A100, H100 ni GPU de centro de datos.
- GPU de consumo: si, cabe holgadamente en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida. Tambien es viable la inferencia en CPU: con 6 capas y 768 dimensiones ocultas, la latencia por frase corta suele situarse en el rango de milisegundos a decenas de milisegundos en CPU moderna, aunque no hay mediciones publicadas para este checkpoint concreto.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, HuggingFace Text Embeddings Inference (etiqueta `text-embeddings-inference` del repo), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime con cuantizacion dinamica INT8, y conversion a GGUF para llama.cpp/Ollama (conversion no publicada por el autor, requiere realizarla uno mismo).
- Latencia y throughput: no disponibles; no hay cifras medidas ni declaradas por el autor. El unico dato indirecto es que DistilBERT se disena para ser aproximadamente un 60 % mas rapido que BERT-base en el mismo hardware, pero no es una medicion de este modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de deteccion de estafas con la que contrastar rendimiento, ya que este modelo no publica evaluacion. La tabla siguiente compara unicamente la arquitectura con las bases publicas de la familia, cuyos datos proceden de sus propias model cards y no de la informacion de este repositorio:

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|
| laaduvansh/scam-detector-model | 66.955.010 | no documentada (512 tokens si la base es DistilBERT) | no disponible | safetensors | no |
| distilbert-base-uncased | 66.955.010 | 512 tokens | Apache 2.0 | safetensors, PyTorch | si (GLUE) |
| bert-base-uncased | 110 M aprox. | 512 tokens | Apache 2.0 | safetensors, PyTorch | si (GLUE) |
| Otros clasificadores de fraude en el Hub | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante en la practica no es de tamano, sino de utilidad: las bases preentrenadas cuentan con licencia explicita y resultados publicos, mientras que este checkpoint no ofrece ninguna de las dos cosas, por lo que no puede evaluarse su mejora respecto a partir de una base y ajustarla uno mismo.

## Limitaciones y advertencias

- Licencia no disponible: sin terminos declarados, el uso comercial es juridicamente incierto. No debe desplegarse en produccion sin aclarar previamente la licencia con el autor.
- Ausencia total de documentacion: la model card es la plantilla automatica con todos los campos `[More Information Needed]`. No se conocen datos de entrenamiento, etiquetas, numero de clases, idiomas ni criterios de evaluacion.
- Sin evaluacion publicada: no hay accuracy, F1, precision, recall ni analisis de errores. Es imposible estimar la tasa de falsos positivos y falsos negativos, algo critico en un clasificador de fraude.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza, especialmente en textos fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados. Al desconocerse el corpus, no puede descartarse sesgo por idioma, registro (formal/informal) o variedad dialectal, ni por el vocabulario especifico de ciertos tipos de estafa.
- Limitacion de idioma: sin idiomas declarados, no hay garantia de funcionamiento en castellano ni en ninguna otra lengua concreta.
- Vulnerabilidad adversarial: los clasificadores de fraude son objetivos habituales de evasion deliberada (erratas, espaciado, homoglifos, unicode ofuscado). Un modelo de este tamano, sin datos de entrenamiento adversarial documentados, es previsiblemente fragil ante estas tecnicas.
- Limitacion de contexto: si la base es DistilBERT, el limite es de 512 tokens; mensajes o documentos mas largos requeririan truncamiento o troceado.
- Desactualizacion temporal: un detector de estafas entrenado con datos no documentados puede no reconocer modismos y esquemas de fraude recientes.
- Madurez: cero descargas y una sola interaccion en el momento de la consulta. No hay evidencia de uso en produccion, mantenimiento ni soporte por parte del autor.
- Recomendacion: tratarlo como prototipo de investigacion y no como componente de seguridad. Si se adopta, validar con un conjunto de prueba propio y representativo antes de cualquier desliegue, y mantener siempre supervision humana en las decisiones de bloqueo o sancion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laaduvansh/scam-detector-model
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental, no sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML citada en la plantilla de la model card: https://mlco2.github.io/impact
- No se han encontrado otros enlaces (repositorio de codigo, demo, dataset o blog) en la informacion disponible.
