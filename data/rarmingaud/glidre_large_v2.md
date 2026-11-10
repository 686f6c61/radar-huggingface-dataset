# rarmingaud/glidre_large_v2

## Resumen

GLiDRE v2 (Generalist and Lightweight model for Document-level Relation Extraction) es un modelo especializado en extraccion de relaciones a nivel de documento, desarrollado por Robin Armingaud y Romaric Besancon en el CEA List (laboratorio LASTI). El modelo aborda la tarea de identificar y clasificar relaciones semanticas entre entidades mencionadas en un texto, incluyendo escenarios de zero-shot donde las etiquetas de relacion no han sido vistas durante el entrenamiento. Se presenta como una version mejorada de GLiDRE con "mejores datos y mejor codigo de entrenamiento".

Tecnicamente, GLiDRE v2 se construye sobre dos modelos base: microsoft/deberta-v3-large y BAAI/bge-large-en-v1.5, combinando las capacidades de representacion de DeBERTa-v3 con el encoder de embeddings de BGE. El modelo acepta tanto texto tokenizado como documentos completos, y permite personalizar las etiquetas de relacion en tiempo de inferencia, lo que lo hace especialmente versatil para dominios donde el esquema de relaciones varia.

Es relevante porque propone un enfoque "generalista y ligero" para una tarea tradicionalmente costosa (extraccion de relaciones documentales), con soporte para zero-shot, multiples funciones de perdida y modificacion de componentes. El repositorio ocupa 3.2 GB y la licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en transformers (DeBERTa-v3-large y BGE-large-en-v1.5 como modelos base); arquitectura especifica de extraccion de relaciones no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo de 3.2 GB; safetensors no confirmado) |

## Arquitectura y entrenamiento

GLiDRE v2 se apoya en dos modelos base: microsoft/deberta-v3-large, un transformer encoder con atencion desenredada (disentangled attention) y preentrenamiento con ELECTRA-style, y BAAI/bge-large-en-v1.5, un encoder orientado a embeddings de frases. La model card no detalla como se combinan ambos ni la arquitectura exacta de la cabeza de extraccion de relaciones, por lo que este dato debe considerarse no disponible.

El entrenamiento se realizo sobre el dataset HuggingFaceFW/fineweb segun los metadatos, y la model card menciona soporte para entrenamiento en DocRED y Re-DocRED mediante un script `train.py` con ficheros de configuracion YAML. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal declarada es la capacidad zero-shot para clasificar relaciones no vistas directamente desde el texto, junto con la flexibilidad para modificar componentes y funciones de perdida.

## Capacidades

- Extraccion de relaciones a nivel de documento entre menciones de entidades.
- Clasificacion zero-shot de relaciones no vistas durante el entrenamiento, definiendo las etiquetas en tiempo de inferencia.
- Entrada versatil: acepta texto tokenizado o documentos completos.
- Soporte de multiples etiquetas por par de entidades mediante el parametro `multi_label`.
- Umbral de confianza configurable (`threshold`) para filtrar predicciones.
- Arquitectura personalizable con soporte para multiples funciones de perdida.
- Entrada estructurada de menciones con offsets de caracteres (`start`, `end`) y tipos de entidad.
- Capacidad de entrenamiento y ajuste fino sobre DocRED y Re-DocRED.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Extraccion de relaciones en articulos enciclopedicos: el modelo puede procesar textos tipo Wikipedia (como el ejemplo de la model card con "The Loud Tour" y "Rihanna") para identificar relaciones como COUNTRY_OF_CITIZENSHIP o PART_OF entre entidades detectadas previamente.
- Construccion de grafos de conocimiento a partir de corpus documentales: dado un conjunto de documentos con entidades anotadas, GLiDRE v2 genera tripletas (entidad 1, relacion, entidad 2) que alimentan bases de conocimiento estructuradas.
- Analisis de documentos legales o contractuales: permite definir etiquetas de relacion especificas del dominio (por ejemplo, PARTY_TO, GOVERNED_BY) y aplicarlas en modo zero-shot sin reentrenamiento.
- Enriquecimiento de pipelines de RAG (Retrieval-Augmented Generation): las relaciones extraidas pueden usarse para mejorar la indexacion semantica y el razonamiento sobre documentos recuperados.
- Extraccion de relaciones en literatura cientifica o biomedica: con etiquetas personalizadas como TREATS, ASSOCIATED_WITH o CITES, el modelo puede estructurar informacion de abstracts y articulos completos.
- Procesamiento de noticias y monitorizacion de medios: identificacion de relaciones entre personas, organizaciones y lugares en articulos periodisticos para analisis de eventos y entidades.
- Anotacion asistida para humanos: el modelo puede pre-anotar relaciones en tareas de etiquetado, reduciendo el esfuerzo manual en la construccion de datasets de RE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 3.2 GB, lo que sugiere que en FP16 requeriria del orden de 6-8 GB de VRAM para pesos, mas memoria para activaciones y contexto.
- GPU recomendadas: no especificadas en la informacion; por tamano, una GPU consumer de gama alta (RTX 3090, RTX 4090) o profesional (A100, H100) seria suficiente, aunque no hay confirmacion oficial.
- Compatibilidad con GPU consumer: probable segun el tamano del repo, pero no confirmada.
- Opciones de despliegue: la model card documenta uso mediante la libreria propia `glidre` (`pip install .` desde el repositorio GitHub) y `GLiDRE.from_pretrained(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDRE v2 | no disponible | no disponible | Extraccion de relaciones documental, zero-shot | Apache 2.0 | Hugging Face (rarmingaud/glidre_large_v2) |
| GLiDRE (v1) | no disponible | no disponible | Extraccion de relaciones documental | no disponible en la informacion | Referenciado en el paper arXiv:2508.00757 |
| DeBERTa-v3-large (base) | no disponible | no disponible | Encoder generico | MIT (habitual en DeBERTa) | Hugging Face (microsoft/deberta-v3-large) |
| BGE-large-en-v1.5 (base) | no disponible | no disponible | Embeddings de texto | MIT (habitual en BGE) | Hugging Face (BAAI/bge-large-en-v1.5) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta documentado.
- Al ser un modelo especializado en extraccion de relaciones, no es adecuado para generacion de texto libre, codigo, matematicas ni tareas multimodales.
- Riesgo de alucinacion en relaciones: como todo modelo discriminativo de RE, puede predecir relaciones espurias entre entidades, especialmente con umbrales bajos; se recomienda ajustar `threshold` y validar en dominio.
- La calidad depende de la correcta identificacion previa de menciones y offsets de caracteres; errores en la anotacion de entidades degradan la extraccion.
- La model card recomienda usar etiquetas de relacion en mayusculas porque el modelo rinde mejor con nombres capitalizados.
- No se documentan sesgos especificos, pero al entrenarse sobre FineWeb (corpus web) puede heredar sesgos presentes en ese corpus.
- No se especifican limitaciones de longitud de contexto; documentos muy largos podrian requerir truncamiento o segmentacion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (DeBERTa-v3-large y BGE-large-en-v1.5) por si imponen restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- La discrepancia entre el ID del repo (rarmingaud/glidre_large_v2) y el usado en el ejemplo de la model card (cea-list-ia/glidre_large_v2) debe verificarse antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarmingaud/glidre_large_v2
- Paper (arXiv): https://arxiv.org/abs/2508.00757
- Repositorio GitHub: https://github.com/cea-list-lasti/glidre
- Modelo base DeBERTa-v3-large: https://huggingface.co/microsoft/deberta-v3-large
- Modelo base BGE-large-en-v1.5: https://huggingface.co/BAAI/bge-large-en-v1.5
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset DocRED: no disponible en la informacion
- Dataset Re-DocRED: no disponible en la informacion
