# classifyre/en_core_web_sm

## Resumen

`classifyre/en_core_web_sm` no es un modelo entrenado por el usuario `classifyre`, sino una copia sin modificar del pipeline de spaCy `en_core_web_sm` 3.8.0 publicado originalmente por Explosion. El repositorio aloja el wheel `en_core_web_sm-3.8.0-py3-none-any.whl` (sha256 `1932429db727d4bff3deed6b34cfc05df17794f4a52eeb26cf8928f7c1a0fb85`) para que las compilaciones de Classifyre no dependan de las descargas de releases de GitHub. Todo el credito y el desarrollo corresponden a Explosion.

El modelo es un pipeline de procesamiento de lenguaje natural para ingles, orientado a inferencia en CPU, que agrupa componentes de spaCy para tokenizacion, etiquetado morfosintactico, analisis de dependencias, segmentacion de frases y reconocimiento de entidades nombradas. La variante `sm` es la mas pequena de la familia `en_core_web_*`, lo que la hace adecuada para tareas de preprocesamiento masivo o entornos con recursos limitados.

Su relevancia practica es acotada: no es un modelo generativo ni un LLM, sino un componente de infraestructura NLP. Resulta util como dependencia reproducible en pipelines de build y como base para tareas clasicas de extraccion de informacion en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy (tok2vec, tagger, parser, senter, ner, attribute_ruler) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por documento, sin ventana fija declarada) |
| Tipos de cuantizacion | no disponible (pesos en el formato propio de spaCy, sin variantes GGUF/ONNX publicadas en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | wheel de spaCy (`en_core_web_sm-3.8.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura modular de spaCy: un componente `tok2vec` que produce representaciones contextuales de tokens y varios componentes downstream que consumen esas representaciones. Incluye `tagger` (etiquetado de partes de la oracion), `parser` (analisis de dependencias), `senter` (segmentacion de frases), `ner` (reconocimiento de entidades nombradas) y `attribute_ruler` (reglas de atributos). La variante `sm` emplea embeddings y redes mas pequenas que las variantes `md` y `lg`, priorizando velocidad en CPU.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino especificas. El repositorio es una copia byte a byte del wheel oficial 3.8.0, por lo que las caracteristicas de entrenamiento son las del modelo original de Explosion, no documentadas aqui.

## Capacidades

- Tokenizacion y segmentacion de texto en ingles.
- Etiquetado morfosintactico (POS tagging) con el componente `tagger`.
- Analisis de dependencias sintacticas con `parser`.
- Segmentacion de frases con `senter`.
- Reconocimiento de entidades nombradas (NER) con `ner`.
- Aplicacion de reglas de atributos con `attribute_ruler`.
- Procesamiento por lotes (`nlp.pipe`) para volumen alto de documentos.
- Inferencia en CPU sin requisitos de GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No soporta generacion de texto.
- No soporta vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Preprocesamiento de corpus en ingles: el pipeline tokeniza, lematiza y etiqueta POS para alimentar modelos downstream (clasificadores, embeddings, indices de busqueda) con bajo coste computacional.
- Extraccion de entidades en documentos: el componente `ner` identifica personas, organizaciones, lugares y fechas en articulos, contratos o correos, util para enriquecer bases de datos o sistemas de gestion documental.
- Segmentacion de frases para traduccion o resumizacion: `senter` divide texto largo en unidades manejables antes de pasarlas a un modelo generativo o a un traductor.
- Analisis sintactico para reglas de negocio: el `parser` permite construir arboles de dependencias que alimentan extraccion de relaciones sujeto-verbo-objeto en pipelines de compliance o auditoria.
- Construccion reproducible en CI/CD: al estar empaquetado como wheel con hash fijado, se puede instalar de forma determinista en imagenes Docker sin depender de descargas externas de GitHub.
- Indexacion y busqueda semantica ligera: el pipeline sirve para normalizar y anotar texto antes de generar embeddings o de construir indices invertidos en motores de busqueda.
- Anotacion automatica de datasets: genera etiquetas POS y NER preliminares para revision humana en proyectos de etiquetado, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU.
- GPU recomendadas: no necesarias; funciona en CPU estandar.
- Cabe en GPU consumer: si, aunque no aporta ventaja frente a CPU para este pipeline.
- Opciones de despliegue: instalacion como paquete de spaCy (`pip install` del wheel), uso via `spacy.load("en_core_web_sm")`, integracion en contenedores Docker y en pipelines de CI/CD.
- Latencia y throughput: no disponibles en la informacion proporcionada; la variante `sm` esta optimizada para velocidad en CPU frente a las variantes mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `en_core_web_sm` (este repo) | no disponible | no disponible | no disponible | MIT | Hugging Face (copia) |
| `en_core_web_md` (Explosion) | no disponible | no disponible | mayor precision que `sm`, menor velocidad | MIT | GitHub releases de Explosion |
| `en_core_web_lg` (Explosion) | no disponible | no disponible | mayor precision que `md`, mayor coste | MIT | GitHub releases de Explosion |
| `en_core_web_trf` (Explosion) | no disponible | no disponible | mayor precision, requiere GPU para throughput alto | MIT | GitHub releases de Explosion |

No se dispone de cifras de rendimiento comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa texto en ingles; no es multilingue.
- No es un modelo generativo: no produce texto, no razona y no responde a instrucciones.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero el NER y el parser pueden producir etiquetas erroneas en dominios especializados o texto ruidoso.
- Sesgos: los sesgos del modelo original de Explosion no estan documentados en esta ficha; se heredan del entrenamiento original.
- Restricciones de licencia: MIT permite uso comercial, pero el credito corresponde a Explosion y el wheel incluye sus ficheros `LICENSE` y `LICENSES_SOURCES`.
- El repositorio tiene 0 descargas y 0 likes, y el pipeline no esta declarado; no hay garantia de mantenimiento por parte de `classifyre`.
- El tamano del repo es 0.0 GB segun los metadatos, lo que puede indicar que los archivos no estan subidos o que el tamano no se ha calculado correctamente; conviene verificar antes de usarlo en produccion.
- La fecha de creacion indicada (2026-11-08) es futura respecto a la fecha habitual de consulta; conviene tratar ese metadato con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/classifyre/en_core_web_sm
- Release oficial del wheel 3.8.0: https://github.com/explosion/spacy-models/releases/tag/en_core_web_sm-3.8.0
- Ficha de referencia en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/en-core-web-sm-spacy
