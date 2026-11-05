# Aykanugur157/bert-base-turkish-tr-wiki-qa

## Resumen

`bert-base-turkish-tr-wiki-qa` es un modelo de respuesta extractiva de preguntas (extractive QA) para turco, desarrollado por el usuario de HuggingFace Aykanugur157. Se trata de un fine-tuning del checkpoint `dbmdz/bert-base-turkish-cased` (BERTurk, publicado por el equipo MDZ Digital Library de la Biblioteca Estatal de Baviera bajo licencia MIT) sobre el dataset `Aykanugur157/tr-wiki-qa`, compuesto por 67.661 filas de entrenamiento generadas con modelos de lenguaje a partir de la Wikipedia en turco. Dada una pregunta y un pasaje de contexto, el modelo devuelve el fragmento del contexto que responde a la pregunta.

El modelo es relevante como ejemplo de QA extractivo de dominio cerrado: obtiene métricas muy altas en la distribución de su propio dataset (EM 91,73 y F1 95,09 en el split de test) pero cae de forma notable en un conjunto independiente y de traducción humana como XQuAD-tr (EM 43,11 y F1 62,31). Esa brecha es la información más útil de la ficha: el modelo está especializado en preguntas cortas y factuales del estilo de su corpus de entrenamiento, no en comprensión lectora general en turco.

Arquitectónicamente es un transformer encoder BERT base con 110.028.290 parámetros, vocabulario case-sensitive y ventana de 512 tokens (entrenado con ventanas deslizantes de 384 tokens y paso 128). No genera texto libre ni puede abstenerse: siempre devuelve un span del contexto. La licencia es CC BY-SA 4.0, con la incertidumbre legal habitual sobre si la cláusula ShareAlike se extiende a los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base, case-sensitive) |
| Parametros totales | 110.028.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrenamiento con ventanas de 384 y paso 128) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de 110 M es convertible a int8/fp16 con herramientas estándar) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 0,4 GB, librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de BERTurk (`dbmdz/bert-base-turkish-cased`), un BERT base con 12 capas, hidden size 768 y 12 cabezas de atención, adaptado al turco con vocabulario case-sensitive. Sobre él se añade la cabeza estándar de `AutoModelForQuestionAnswering`: una proyección lineal que produce logits de inicio y fin sobre los tokens del contexto. La inferencia consiste en maximizar la suma de logits de inicio y fin restringida a posiciones del contexto y a una longitud máxima de respuesta.

El fine-tuning se realizó durante 2 épocas con learning rate 3e-05, batch efectivo 32, ventana máxima de 384 tokens con ventana deslizante de paso 128, precisión fp16 y semilla 42, sobre una Tesla T4. Las versiones de librerías reportadas son torch 2.11.0+cu130, transformers 5.22.0 y datasets 4.8.5, con fecha 2026-11-05. El dataset `tr-wiki-qa` (versión `687d958047df`) contiene 67.661 filas de entrenamiento generadas por modelos de lenguaje y sometidas a un filtro automático, sin verificación humana; cada ejemplo incluye la versión del artículo de Wikipedia en el directorio `audit/`. No se reporta uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado clásico de QA extractivo.

## Capacidades

- Respuesta extractiva de preguntas en turco: devuelve el span del contexto que responde a la pregunta, con logits de inicio y fin.
- Manejo de contextos de hasta 512 tokens por pasada; para textos más largos el autor recomienda ventanas deslizantes de 384 tokens con solapamiento.
- Comprensión lectora de pasajes factuales y enciclopédicos (estilo Wikipedia en turco).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generación de texto libre, resumen ni traducción.
- No soporta visión, audio ni modo "thinking".
- No puede responder "no hay respuesta": siempre emite un span aunque la respuesta no esté en el contexto.
- Capacidad multilingüe limitada al turco; el vocabulario y el preentrenamiento son específicos de ese idioma.

## Casos de uso

- Búsqueda de respuestas sobre una base documental turca: indexar artículos de Wikipedia o documentación interna y usar el modelo como extractor de spans para devolver la frase exacta que responde a la consulta del usuario, con la ventaja de que la respuesta es siempre textual y verificable en la fuente.
- Asistente de FAQ en atención al cliente: con contextos cortos (políticas de devolución, horarios, condiciones) el modelo localiza la frase relevante en milisegundos en CPU, lo que permite desplegarlo sin GPU en un servicio de bajo coste.
- Enriquecimiento de pipelines de recuperación (RAG ligero): combinar un retriever BM25 o denso con este modelo como lector extractivo para tareas donde no se necesita una respuesta generativa y se prioriza la fidelidad al documento.
- Extracción de atributos en documentos estructurados semiestructurados (fichas de producto, artículos enciclopédicos): formular preguntas plantilla ("¿en qué provincia está?", "¿cuál es la fecha de fundación?") y extraer el span correspondiente del texto.
- Anotación asistida de corpus turcos: preetiquetar pares pregunta-respuesta para revisión humana, aprovechando el alto F1 en la distribución de tr-wiki-qa (95,09 en test).
- Evaluación comparativa de modelos QA en turco: servir como referencia de un modelo entrenado con datos sintéticos frente a alternativas entrenadas con TQuAD, para medir la brecha entre distribución propia y conjuntos independientes como XQuAD-tr.
- Prototipado rápido en entornos con `transformers`: el checkpoint pesa 0,4 GB y se carga en memoria sin problemas en portátiles, lo que facilita experimentos de QA sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor con normalización turca de Exact Match y F1, una sola ejecución y una sola semilla (sin intervalos de confianza):

| Conjunto | Muestras | Exact Match | F1 |
|---|---|---|---|
| tr-wiki-qa validation | 3.899 | 91,36 | 95,28 |
| tr-wiki-qa test | 3.831 | 91,73 | 95,09 |
| XQuAD-tr (traducción humana) | 1.190 | 43,11 | 62,31 |
| savasy/bert-base-turkish-squad en tr-wiki-qa test (referencia) | 3.831 | 76,30 | 87,29 |
| savasy/bert-base-turkish-squad en XQuAD-tr (referencia) | 1.190 | 45,38 | 65,85 |

El propio autor advierte que los splits de tr-wiki-qa se generaron con el mismo proceso que el entrenamiento (generación por LLM y filtro automático), por lo que esas cifras son probablemente optimistas. XQuAD-tr, no visto en entrenamiento y traducido por humanos, es el indicador más independiente: ahí el modelo queda por debajo del referente entrenado con TQuAD (43,11 frente a 45,38 en EM; 62,31 frente a 65,85 en F1). La comparación no es un enfrentamiento controlado, ya que los datos y detalles de entrenamiento difieren.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (110 M de parámetros), unos 0,25 GB en fp16 y unos 0,15 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una Tesla T4, RTX 3060, RTX 4090 o A100 son más que suficientes y el cuello de botella será el preprocesado, no el modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 2060 y superiores; también funciona en CPU con latencias de decenas de milisegundos por consulta en contextos de 384 tokens.
- Opciones de despliegue: `transformers` con `AutoModelForQuestionAnswering` (el pipeline `question-answering` se eliminó en transformers 5.x, según el autor), exportación a ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (este último orientado a generativos, por lo que su utilidad aquí es marginal). No hay GGUF publicado, aunque es convertible con `convert-h5-to-gguf` de llama.cpp para despliegue en CPU.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del modelo, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una pasada de 384 tokens, pero son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | XQuAD-tr (EM/F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aykanugur157/bert-base-turkish-tr-wiki-qa | 110 M | 512 | 43,11 / 62,31 | CC BY-SA 4.0 | HuggingFace, 0 descargas, 2 likes |
| savasy/bert-base-turkish-squad | 110 M (BERTurk) | 512 | 45,38 / 65,85 | no disponible en la información proporcionada | HuggingFace, modelo de referencia entrenado con TQuAD |
| dbmdz/bert-base-turkish-cased | 110 M | 512 | no aplica (modelo base, sin cabeza QA) | MIT | HuggingFace, checkpoint base de BERTurk |

No se dispone de datos de otros modelos QA en turco en la información proporcionada; la comparación se limita al referente TQuAD y al modelo base. En la distribución propia de tr-wiki-qa el modelo aquí descrito supera al referente (EM 91,73 frente a 76,30), pero esa ventaja no se traslada a XQuAD-tr, lo que sugiere un ajuste fuerte a la distribución sintética del corpus.

## Limitaciones y advertencias

- El dataset de entrenamiento fue generado por modelos de lenguaje y filtrado automáticamente, sin verificación humana: las etiquetas y respuestas pueden contener errores.
- No existe clase "sin respuesta": el modelo siempre devuelve un span del contexto aunque la respuesta no esté presente, lo que produce falsos positivos silenciosos.
- Las respuestas son spans cortos (mediana de 12 caracteres en el corpus); no es adecuado para respuestas explicativas o de varios párrafos.
- El corpus es casi exclusivamente factual y de dificultad baja; el rendimiento en preguntas de razonamiento, comparación o agregación no está evaluado y probablemente sea bajo.
- La brecha entre tr-wiki-qa (F1 95,09) y XQuAD-tr (F1 62,31) indica sobreajuste a la distribución sintética; no debe usarse como estimación de rendimiento en producción sin evaluar con datos propios.
- No debe emplearse como fuente de verdad en dominios médico, legal o financiero.
- Licencia CC BY-SA 4.0: la cláusula ShareAlike podría extenderse a los pesos derivados y a obras derivadas; el autor reconoce que la interpretación legal no está resuelta. Para uso comercial conviene revisar la obligación de compartir bajo la misma licencia.
- El modelo base BERTurk es MIT, pero la licencia del derivado es CC BY-SA 4.0, más restrictiva.
- Solo turco; no hay soporte multilingüe ni garantías en textos con ortografía informal o dialectal.
- El pipeline `question-answering` de transformers 5.x está eliminado, por lo que las integraciones basadas en `pipeline()` requieren adaptación manual.
- Tracción prácticamente nula en HuggingFace (0 descargas, 2 likes) y una única ejecución de evaluación sin intervalos de confianza: la reproducibilidad de las cifras no está validada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aykanugur157/bert-base-turkish-tr-wiki-qa
- Dataset de entrenamiento: https://huggingface.co/datasets/Aykanugur157/tr-wiki-qa
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Modelo de referencia entrenado con TQuAD: https://huggingface.co/savasy/bert-base-turkish-squad
- Wikipedia en turco (fuente del corpus): https://tr.wikipedia.org/
- XQuAD (Artetxe et al., ACL 2020), conjunto de evaluación: https://github.com/deepmind/xquad
