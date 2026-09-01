# KoichiYasuoka/deberta-base-japanese-aozora-ud-head

## Resumen

El modelo `KoichiYasuoka/deberta-base-japanese-aozora-ud-head` es un DeBERTa V2 preentrenado sobre el corpus japonés Aozora Bunko (青空文庫) y ajustado específicamente para la detección de cabezas sintácticas (head-detection) en unidades de palabra larga (long-unit-words) dentro del marco de Universal Dependencies. Lo desarrolla Koichi Yasuoka, investigador conocido por sus modelos de procesamiento de japonés, y se presenta como una tarea de question-answering: dado un texto y una palabra (o unidad) como pregunta, el modelo devuelve el segmento que actúa como cabeza de esa unidad en la estructura de dependencias.

Este modelo resuelve el problema del análisis de dependencias sintácticas en japonés, un idioma con una morfología compleja y sin espacios entre palabras, donde la segmentación en unidades largas es necesaria para un análisis coherente. Su relevancia actual radica en que ofrece una alternativa ligera y especializada para tareas de NLP en japonés, especialmente en dominios literarios o históricos, y puede integrarse en pipelines de procesamiento lingüístico. La arquitectura es DeBERTa V2 base, con un tamaño de repositorio de 3,8 GB, y está disponible bajo licencia CC-BY-SA-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa V2 (encoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa V2, un transformer encoder con mecanismos de atención desacoplada (disentangled attention) que mejoran la representación de relaciones entre tokens. Fue preentrenado sobre el corpus Aozora Bunko, una colección de textos literarios japoneses de dominio público, y posteriormente ajustado (fine-tuning) sobre el dataset Universal Dependencies UD_Japanese-GSDLUW, que anota dependencias sintácticas en unidades de palabra larga. El ajuste se realiza formulando la detección de cabezas como una tarea de question-answering: el modelo recibe una pregunta (la palabra candidata) y un contexto (la oración), y predice el span que corresponde a la cabeza sintáctica. No se mencionan técnicas como RLHF o DPO; el entrenamiento es supervisado estándar.

## Capacidades

- Analisis de dependencias sintacticas en japones: detecta la cabeza de cada unidad de palabra larga en una oracion, produciendo un arbol de dependencias.
- Formulacion como question-answering: permite usar la infraestructura de modelos de QA de transformers para una tarea estructural.
- Soporte para desambiguacion: se puede insertar el token `[MASK]` en el contexto para indicar la ocurrencia exacta de una palabra ambigua.
- Procesamiento de textos literarios japoneses: entrenado sobre Aozora Bunko, es adecuado para dominios clasicos o historicos.
- Integracion con pipelines de Universal Dependencies: compatible con herramientas como `ufal.chu-liu-edmonds` para generar anotaciones CoNLL-U.
- No incluye capacidades de generacion de texto, tool calling, agentes ni vision.

## Casos de uso

- Analisis sintactico de corpus literarios japoneses: el modelo puede procesar textos de Aozora Bunko u otros corpus similares para generar anotaciones de dependencias, utiles para estudios filologicos o linguisticos.
- Construccion de pipelines de NLP para japones: se puede combinar con modelos de etiquetado POS y segmentacion para producir analisis completos en formato CoNLL-U, integrable en herramientas como Stanza o spaCy.
- Ensenanza de linguistica computacional: sirve como ejemplo practico de como adaptar un modelo de QA a una tarea estructural, util en cursos de procesamiento del lenguaje natural.
- Extraccion de relaciones sintacticas en textos historicos: permite identificar sujetos, objetos y modificadores en documentos antiguos, facilitando la busqueda de informacion especifica.
- Preprocesamiento para otros modelos: las dependencias generadas pueden alimentar modelos de extraccion de informacion o de analisis de sentimiento que requieran estructura sintactica.
- Evaluacion de modelos de dependencias en japones: al estar especializado en long-unit-words, sirve como referencia para comparar con otros analizadores que usan unidades cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como LAS (Labeled Attachment Score) o UAS (Unlabeled Attachment Score) sobre UD_Japanese-GSDLUW, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamano del repositorio (3,8 GB), se estima que los pesos en precision completa (fp32) ocupan aproximadamente 3,8 GB, por lo que se necesitarian al menos 8 GB de VRAM para inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como una NVIDIA RTX 2070, RTX 3060 o superior. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o mas.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs consumer modernas con 8 GB o mas.
- Opciones de despliegue: se puede usar con la libreria transformers de Hugging Face, tanto en Python como en pipelines de inferencia. Tambien es compatible con servidores de inferencia como TGI o vLLM, aunque al ser un modelo pequeno no requiere infraestructura especial.
- Latencia y throughput: no disponibles. Al ser un modelo base de DeBERTa, la inferencia es rapida en GPU moderna, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Entrenamiento | Licencia | Uso principal |
|---|---|---|---|---|---|
| KoichiYasuoka/deberta-base-japanese-aozora-ud-head | DeBERTa V2 base | no disponible | Aozora Bunko + UD_Japanese-GSDLUW | CC-BY-SA-4.0 | Dependency parsing (long-unit-words) |
| KoichiYasuoka/deberta-base-japanese-unidic-ud-head | DeBERTa V2 base | no disponible | Unidic + UD_Japanese-GSDLUW | CC-BY-SA-4.0 | Dependency parsing (long-unit-words) |
| KoichiYasuoka/deberta-base-japanese-wikipedia | DeBERTa V2 base | no disponible | Wikipedia + Aozora Bunko | CC-BY-SA-4.0 | Preentrenamiento general para japones |

Los tres modelos comparten la misma arquitectura y licencia, pero se diferencian en el corpus de preentrenamiento. El modelo de Aozora Bunko esta especializado en textos literarios, mientras que el de Unidic usa un diccionario morfologico diferente y el de Wikipedia cubre un dominio mas general. No se dispone de comparativas de rendimiento publicas.

## Limitaciones y advertencias

- Sesgos del corpus: al estar preentrenado sobre Aozora Bunko, el modelo puede tener un sesgo hacia el japones literario clasico, con vocabulario y estructuras arcaicas que no representan el japones moderno hablado o tecnico.
- Riesgo de alucinacion en QA: aunque la tarea principal es dependency parsing, al formularse como question-answering, el modelo podria producir spans incorrectos si la pregunta no esta bien formulada o si el contexto es ambiguo.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto, pero los modelos DeBERTa base suelen tener un limite de 512 tokens, lo que restringe el analisis a oraciones cortas o fragmentos.
- Restricciones de licencia: la licencia CC-BY-SA-4.0 exige que cualquier obra derivada se distribuya bajo la misma licencia, lo que puede ser problematico para uso comercial propietario.
- Dependencia de herramientas externas: para obtener un arbol de dependencias completo, se requiere el uso de librerias adicionales como `ufal.chu-liu-edmonds`, lo que anade complejidad al despliegue.
- Sin soporte para otros idiomas: el modelo solo funciona con japones, y su tokenizador esta disenado para ese idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoichiYasuoka/deberta-base-japanese-aozora-ud-head
- Paper de referencia (安岡孝一, 2022): http://hdl.handle.net/2433/275409
- Dataset UD_Japanese-GSDLUW: https://github.com/UniversalDependencies/UD_Japanese-GSDLUW
- Libreria ufal.chu-liu-edmonds: https://pypi.org/project/ufal.chu-liu-edmonds/
