# EdikK/hermes-literature

## Resumen

`EdikK/hermes-literature` es un repositorio alojado en Hugging Face que, pese a su identificador de modelo, no contiene pesos de un modelo de lenguaje entrenado. Se trata de un indice de literatura cientifica orientado a la preparacion de articulos sobre inteligencia artificial en sanidad, sistemas de soporte a la decision clinica (CDSS), equidad y sesgo en IA medica, y marcos regulatorios como el EU AI Act o las guias de la FDA. El autor, Eduard Koshilko, es un medico formado en Ucrania que declara no estar licenciado para ejercer en la UE ni en Alemania.

El contenido del repositorio consiste en PDFs de origen, textos extraidos en formato `.txt` y `.md`, y un grafo de conocimiento en JSON y Mermaid que organiza 28 nodos y 33 aristas en siete clusters tematicos (regulatorio, evaluacion, sesgo y equidad, despliegue, fundamentos, bases de datos y arquitectura). El tamano del repositorio es de 0.0 GB segun los metadatos de Hugging Face, lo que resulta incoherente con la suma de los PDFs listados en la model card (mas de 35 MB solo en los tres documentos mas grandes).

No se dispone de informacion sobre arquitectura de red neuronal, parametros, contexto, tokenizador ni proceso de entrenamiento. El repositorio no debe evaluarse como un modelo desplegable, sino como un corpus documental de apoyo a la redaccion cientifica. Cualquier uso como modelo de inferencia requeriria un modelo base externo no identificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio documental, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los documentos fuente estan en ingles y ruso) |
| Licencia | no disponible |
| Formato de pesos | no disponible (contenido en PDF, TXT, MD, JSON y MMD) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio se estructura como un corpus documental con dos componentes: un directorio `source_pdfs/` con 16 documentos (manuales de Stanford sobre IA en sanidad, articulos de Rajkomar, Densen, Gillon y Altman & Bland, y libros de Hastie y Goodfellow) y un directorio `extracted/` con las versiones en texto plano generadas mediante `pdftotext` o aportadas por el usuario.

El componente mas elaborado es el grafo de conocimiento `knowledge_graph/literature_kg.json`, con 28 nodos y 33 aristas distribuidas en siete clusters. El nodo central es "CDSS Architecture" (arquitectura de tres capas con humano en el bucle), que conecta con nodos regulatorios, de evaluacion, de sesgo, de despliegue, de fundamentos y de bases de datos. Se incluye ademas una representacion en Mermaid (`literature_kg.mmd`) para renderizado visual. No se documenta ningun proceso de RLHF, DPO ni ajuste fino.

## Capacidades

- Almacenamiento y organizacion de literatura cientifica sobre IA en sanidad, CDSS, sesgo y regulacion.
- Extraccion de texto desde PDF para su uso en pipelines de procesamiento de lenguaje natural.
- Navegacion conceptual mediante un grafo de conocimiento con siete clusters tematicos y un nodo central de arquitectura CDSS.
- Soporte documental para la redaccion de articulos sobre evaluacion de modelos clinicos, incluidos analisis de curvas de decision y de beneficio neto.
- Referencia sobre categorias de riesgo SaMD (I-IV) del marco IMDRF/FDA y sobre el EU AI Act 2024/1689.
- Referencia sobre tipos de sesgo en IA medica (historico, de representacion, de medicion, de agregacion, de evaluacion, de despliegue, de etiqueta, de minoria, de privilegio, de automatizacion y de descarte).
- Referencia sobre los cuatro principios de etica medica de Gillon (autonomia, beneficencia, no maleficencia y justicia) y su alcance de aplicacion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente.

## Casos de uso

- Preparacion de revisiones narrativas sobre CDSS: el corpus reune manuales de Stanford y articulos primarios que permiten citar marcos de evaluacion como OAP, GRADE y MINIMAR sin busquedas adicionales.
- Redaccion de secciones regulatorias: los documentos sobre EU AI Act 2024/1689, guia FDA CDS de enero de 2026 y categorias SaMD permiten fundamentar el encuadre normativo de un sistema clinico.
- Analisis de equidad en modelos medicos: el articulo de Rajkomar et al. (2018) y el modulo 4 de Stanford sirven de base para discutir justicia distributiva, paridad predictiva y odds igualadas.
- Construccion de material docente: el grafo de conocimiento en Mermaid facilita generar diagramas de relaciones entre regulacion, evaluacion y despliegue para cursos o seminarios.
- Documentacion de metodologia estadistica: los textos de Altman & Bland sobre curvas ROC y el libro de Hastie, Tibshirani y Friedman aportan la base para secciones de evaluacion de discriminacion y calibracion.
- Trazabilidad de fuentes en un pipeline de recuperacion: los textos extraidos en `extracted/` pueden indexarse en un sistema RAG para responder consultas sobre literatura medica y regulatoria.
- Referencia sobre longevidad del conocimiento medico: el dato de Densen (2011) sobre duplicacion del conocimiento (50 anos en 1950, 73 dias en 2020) resulta util para justificar la necesidad de sistemas de soporte actualizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el repositorio no contiene pesos ni requiere GPU.
- Almacenamiento estimado: la model card lista mas de 35 MB en PDFs, aunque los metadatos de Hugging Face indican 0.0 GB; se recomienda verificar el tamano real del repositorio antes de clonarlo.
- Para procesar los textos extraidos con un modelo externo se necesitaria un LLM no especificado en la informacion disponible.
- Opciones de despliegue del corpus: indexacion en bases vectoriales (FAISS, Chroma, Qdrant) para pipelines RAG, o servido estatico de los ficheros JSON y Mermaid.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdikK/hermes-literature | Corpus documental y grafo de conocimiento | no aplica | no aplica | no disponible | Hugging Face, 0 descargas, 0 likes |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de repositorios comparables identificados en la informacion proporcionada.

## Limitaciones y advertencias

- El identificador sugiere un modelo de lenguaje, pero el contenido es un corpus documental; un usuario que espere pesos ejecutables no encontrara ninguno.
- La licencia no esta declarada, lo que impide determinar si el uso comercial o la redistribucion estan permitidos.
- El autor declara explicitamente no estar licenciado para ejercer la medicina en Alemania ni en la UE y no tener practica clinica; el contenido no constituye consejo medico.
- Los documentos fuente estan mayoritariamente en ingles, con un unico libro en ruso; no hay material en castellano.
- El grafo de conocimiento es pequeno (28 nodos, 33 aristas) y su cobertura tematica es limitada a los clusters declarados.
- Existe una incoherencia entre el tamano declarado en los metadatos (0.0 GB) y la suma de los ficheros listados (mas de 35 MB), lo que puede indicar que el repositorio no esta completamente subido.
- El repositorio no registra descargas ni likes, por lo que no ha sido validado por la comunidad.
- Riesgo de desactualizacion normativa: referencias como la guia FDA CDS de enero de 2026 o el EU AI Act requieren verificacion contra las fuentes oficiales vigentes.
- No se documenta ningun proceso de curacion, revision por pares ni control de calidad de las extracciones de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EdikK/hermes-literature
