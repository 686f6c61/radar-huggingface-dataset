# onnx-community/qcpg-sentences-ONNX

## Resumen

qcpg-sentences-ONNX es una conversión a ONNX del modelo de paráfrasis controlada por calidad (QCPG) desarrollado por IBM Research y presentado en el ACL 2022. Este modelo permite generar paráfrasis de una oración especificando explicitamente el nivel de similitud semántica, divergencia léxica y divergencia sintáctica deseado.

La versión ONNX ha sido generada automáticamente por la comunidad onnx-community y está pensada para ejecutarse con Transformers.js, lo que habilita su uso en Node.js o en el navegador. Se basa en la arquitectura T5 y está entrenado sobre el dataset `parabk2`. El repositorio ocupa 5.2 GB.

Su relevancia radica en que ofrece un control explícito sobre la calidad de las paráfrasis generadas, lo que resulta útil para tareas de aumento de datos, evaluación de robustez y generación de texto controlada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (text-to-text transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos documentados estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo original `ibm-research/qcpg-sentences` está basado en la arquitectura T5, un transformer encoder-decoder de texto a texto. La variante QCPG añade un mecanismo de control por condiciones: tokens especiales como `COND_SEMANTIC_SIM_80`, `COND_LEXICAL_DIV_50` o `COND_SYNTACTIC_DIV_40` se anteponen a la frase de entrada. El modelo aprende a generar una paráfrasis que respeta esos niveles de calidad. El README indica que el modelo fue entrenado sobre `data/parabk2`.

La conversión a ONNX se realizó automaticamente mediante la Space oficial de onnx-community y se publica con la librería `transformers.js`, por lo que el pipeline de inferencia es text-to-text generation. No se documenta ningún proceso de RLHF o DPO. Los papers asociados son el arXiv 2203.10940 (Quality Controlled Paraphrase Generation) y el arXiv 1910.09700 (T5). El ejemplo de uso del README original, con valores de control `lexical=0.3`, `syntactic=0.5`, `semantic=0.8`, transforma la frase *“Is this going to work or what are we doing here?”* en *“Will it work or what is it we're doing?”*.

## Capacidades

- Generación de paráfrasis con control granular de calidad mediante tres dimensiones: similitud semántica, divergencia léxica y divergencia sintáctica.
- Compatibilidad con `transformers.js` para inferencia en JavaScript (Node.js o navegador), gracias al formato ONNX.
- Requiere que los valores de control se preparen como tokens de condición antes de la generación, tal como se muestra en el código del modelo original.
- No soporta function calling, tool calling, razonamiento multi-paso, visión ni audio.
- El control de calidad es direccional: un valor alto de similitud semántica tiende a producir paráfrasis más próximas al significado original, mientras que valores altos de divergencia léxica o sintáctica aumentan la variedad de redacción.

## Casos de uso

- Aumento de datos en NLP: generar múltiples paráfrasis de oraciones de un dataset de entrenamiento para incrementar la diversidad y robustez de modelos de clasificación o NER.
- Pruebas de robustez de modelos de lenguaje: crear variaciones de una frase con distintos niveles de similitud semántica y comprobar si un sistema de QA o sentiment analysis mantiene la misma predicción.
- Generación de contenido editorial: reescribir párrafos o frases manteniendo el significado original pero variando el registro, ajustando la divergencia léxica y sintáctica.
- Parafraseo de instrucciones en interfaces conversacionales: reformular comandos o prompts para generar alternativas de expresión que un sistema conversacional pueda reconocer.
- Recuperación de información: producir consultas alternativas a partir de una consulta original para ampliar los resultados de un motor de búsqueda.
- Evaluación de modelos de traducción: generar paráfrasis de referencia en inglés para medir la consistencia semántica entre traducciones automáticas y traducciones humanas.
- Simplificación de texto técnico o legal: reescribir una oración densa con alta similitud semántica y baja divergencia léxica, reduciendo la complejidad superficial sin perder significado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ONNX ocupa 5.2 GB, lo que sugiere que la carga en memoria puede ser elevada.
- Puede ejecutarse en CPU o GPU mediante ONNX Runtime, y en el navegador a través de Transformers.js y WebAssembly, aunque el tamaño del repositorio limita su uso en clientes ligeros.
- Opciones de despliegue: Transformers.js, ONNX Runtime, y cualquier runtime compatible con modelos ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Dataset | Rango lexico | Rango sintactico | Rango semantico | Formato |
|---|---|---|---|---|---|
| qcpg-sentences (ONNX) | parabk2 | 0-100 | 0-80 | 0-95 | ONNX |
| ibm-research/qcpg-sentences | parabk2 | 0-100 | 0-80 | 0-95 | PyTorch |
| qcpg-questions | wikians | 0-90 | 0-75 | 0-95 | PyTorch |
| qcpg-captions | mscoco | 0-90 | 0-80 | 0-95 | PyTorch |

La versión ONNX es una conversión directa del modelo original `ibm-research/qcpg-sentences`; el rendimiento de generación debería ser equivalente en la práctica. Las variantes `qcpg-questions` y `qcpg-captions` comparten arquitectura y metodología, pero están especializadas en preguntas y descripciones de imágenes respectivamente. No se dispone de benchmarks comparativos publicados en la información consultada.

## Limitaciones y advertencias

- QCPG no garantiza paráfrasis perfectas en todos los casos; el propio README recomienda ajustar los valores de control, utilizar métodos de muestreo más sofisticados y aplicar filtrado posterior.
- El control por tokens de condición exige construir el input siguiendo un formato específico y conocer los tokens especiales del tokenizer; un uso incorrecto puede producir salidas incoherentes.
- El repositorio no declara idiomas soportados; los datos de entrenamiento (parabk2, wikians, mscoco) y el ejemplo documentado apuntan al inglés, por lo que su rendimiento en otros idiomas no está verificado.
- El peso en ONNX es de 5.2 GB, lo que puede suponer un coste de descarga elevado para aplicaciones en navegador o entornos con poco ancho de banda.
- La conversión fue generada de forma automática y la publicación no muestra descargas ni evaluaciones de la comunidad, por lo que no existen evidencias de pruebas exhaustivas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de atribución del trabajo original de IBM.

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/onnx-community/qcpg-sentences-ONNX
- Modelo original: https://huggingface.co/ibm-research/qcpg-sentences
- Paper ACL 2022: https://aclanthology.org/2022.acl-long.45
- Repositorio de IBM: https://github.com/IBM/quality-controlled-paraphrase-generation
- Documentación de pipelines de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines
- Organización ONNX Community: https://huggingface.co/onnx-community
