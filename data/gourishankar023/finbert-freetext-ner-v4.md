# gourishankar023/finbert-freetext-ner-v4

## Resumen

`gourishankar023/finbert-freetext-ner-v4` es un modelo publicado en Hugging Face por el usuario gourishankar023 bajo licencia Apache 2.0. Por su identificador, se trata de un modelo derivado de la familia FinBERT orientado a reconocimiento de entidades nombradas (NER) sobre texto libre en el dominio financiero. La nomenclatura "freetext" sugiere que el modelo está pensado para extraer entidades de texto no estructurado, y el sufijo "v4" indica que es la cuarta iteración de una serie de ajustes realizados por el autor.

La información pública disponible es extremadamente limitada: la model card únicamente contiene la declaración de licencia, sin descripción de arquitectura, datos de entrenamiento, métricas ni ejemplos de uso. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no tiene pipeline declarado, lo que impide confirmar automáticamente la tarea concreta (token-classification, ner u otra).

Por tanto, esta ficha se construye a partir de inferencias razonables basadas en el nombre del modelo y en las convenciones habituales de la familia FinBERT, señalando explícitamente en cada apartado qué datos son inferidos y cuáles no están disponibles. Se recomienda tratar cualquier dato no confirmado como no verificado antes de usar el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (por el nombre, presumiblemente BERT base ajustado para NER; sin confirmar) |
| Parametros totales | No disponible (si deriva de BERT-base, ~110 M; sin confirmar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (si deriva de BERT-base, 512 tokens; sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (por el nombre, presumiblemente ingles; sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no se lista ningún archivo en la información proporcionada) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El identificador del modelo incluye "finbert", lo que apunta a un encoder tipo BERT preentrenado en dominio financiero y posteriormente ajustado para la tarea de NER. El sufijo "freetext" sugiere un ajuste orientado a texto libre, posiblemente con un esquema de etiquetas BIO o BIOES para entidades financieras (empresas, tickers, importes, fechas, etc.), pero esto es una inferencia y no está confirmado por el autor.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF, DPO) ni innovaciones técnicas. Al tratarse de un modelo encoder para NER, es esperable que no emplee decodificación generativa ni técnicas de decodificación especulativa, pero de nuevo se trata de una suposición basada en la categoría del modelo, no en documentación publicada.

## Capacidades

- Extracción de entidades nombradas en texto financiero (presunta, no confirmada): el nombre del modelo indica NER, pero no se especifica el conjunto de etiquetas.
- Procesamiento de texto libre no estructurado (presunto, por el sufijo "freetext").
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia publicada de capacidades multilingües; el nombre sugiere inglés, pero no está confirmado.
- No hay evidencia publicada de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay evidencia publicada de modo "thinking" ni de capacidades multimodales.

## Casos de uso

- Extracción de entidades en informes financieros: si el modelo confirma su naturaleza NER, podría aplicarse a informes anuales y notas de prensa para identificar empresas, importes y fechas, siempre que se valide previamente el esquema de etiquetas.
- Enriquecimiento de noticias financieras: uso potencial para poblar bases de datos de eventos a partir de titulares y cuerpos de noticia, con revisión humana dado el escaso soporte documental.
- Preprocesado para pipelines de análisis de sentimiento: las entidades extraídas podrían alimentar modelos posteriores de sentimiento por entidad, aunque el modelo en sí no realiza esa tarea.
- Indexación y búsqueda semántica en corpus financieros: las entidades detectadas podrían usarse como metadatos para filtrado y recuperación.
- Investigación académica sobre NER financiero: útil como punto de partida o baseline, dado que la licencia Apache 2.0 permite su uso y modificación.
- Prototipado interno: adecuado para experimentación en entornos controlados antes de comprometerse con un modelo con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; si el modelo deriva de BERT-base (~110 M de parámetros), cabría esperar un consumo de aproximadamente 0,5-1 GB en FP32 y menos de 0,5 GB en cuantización de 8 bits, pero esto no está confirmado.
- GPU recomendadas: no disponible; para un encoder de tamaño BERT-base sería suficiente una GPU consumer moderna (por ejemplo, RTX 3060 o superior), pero no hay datos oficiales.
- Compatibilidad con GPU consumer: presumiblemente sí si el tamaño es el de BERT-base, sin confirmar.
- Opciones de despliegue: no disponible; cabría esperar compatibilidad con Transformers, ONNX y llama.cpp solo si los pesos están en formatos adecuados, lo cual no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gourishankar023/finbert-freetext-ner-v4 | No disponible | No disponible | Apache 2.0 | Hugging Face, sin descargas registradas |
| ProsusAI/finbert | ~110 M (BERT-base) | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| yiyanghkust/finbert-tone | ~110 M (BERT-base) | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| nlpaueb/bert-base-fin | ~110 M (BERT-base) | 512 tokens | No disponible en esta ficha | Hugging Face |

La comparativa se ofrece solo como referencia de categoría; no se dispone de métricas del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay model card más allá de la licencia, lo que impide conocer el esquema de etiquetas, los datos de entrenamiento y las métricas.
- Riesgo elevado de alucinación o extracción incorrecta de entidades en dominios distintos al de entrenamiento, al no poder verificar la composición del dataset.
- Sesgos desconocidos: al no documentarse los datos, no es posible evaluar sesgos de dominio, geográficos o de género.
- Cobertura lingüística incierta: no se declaran idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre procedencia de datos podría plantear dudas sobre la trazabilidad de los mismos.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo haya sido probado por terceros, lo que desaconseja su uso directo en producción sin una evaluación propia.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/gourishankar023/finbert-freetext-ner-v4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
