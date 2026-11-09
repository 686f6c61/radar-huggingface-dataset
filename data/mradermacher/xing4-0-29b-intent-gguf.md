# mradermacher/Xing4.0-29B-Intent-GGUF

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones, slot-filling y extracción de información estructurada (NER, relaciones, eventos) a partir de texto. Lo desarrolla XingChen-AGI y esta disponible bajo licencia Apache 2.0. El modelo parte de una arquitectura transformer con 31.215.031.088 parametros totales (aproximadamente 29B, de ahi el nombre comercial) y esta afinado para tareas de extraccion guiada por esquema (schema-guided), lo que lo hace adecuado para pipelines de comprension del lenguaje natural en produccion.

La ficha que nos ocupa corresponde a la version cuantizada en GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base es XingChen-AGI/Xing4.0-29B-Intent y el dataset de entrenamiento asociado es XingChen-AGI/Xing4.0-29B-Intent-oss.

Es relevante ahora porque cubre un nicho concreto —la extraccion de informacion estructurada y el reconocimiento de intenciones— con un tamano manejable para inferencia local y una licencia permisiva, lo que reduce la friccion para integrarlo en sistemas de agentes, asistentes conversacionales y automatizacion de flujos documentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle especifico no disponible) |
| Parametros totales | 31.215.031.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF); pesos originales en safetensors |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por mradermacher); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer con 31.215.031.088 parametros totales. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones. El modelo esta especializado en tareas de extraccion de informacion: reconocimiento de intenciones, slot-filling, NER, extraccion de relaciones y extraccion de eventos, con enfasis en el enfoque schema-guided (esquemas que guian la salida estructurada).

El dataset de entrenamiento asociado es XingChen-AGI/Xing4.0-29B-Intent-oss, publicado por el mismo autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card del repositorio GGUF no aporta detalles adicionales sobre el proceso de entrenamiento; unicamente documenta el proceso de cuantizacion estatica (quantize_version 2, convert_type hf) realizado por mradermacher.

## Capacidades

- Reconocimiento de intenciones (intent recognition) en conversaciones y textos.
- Slot-filling: extraccion de valores concretos asociados a esquemas predefinidos.
- Extraccion de informacion guiada por esquema (schema-guided information extraction).
- Reconocimiento de entidades nombradas (NER).
- Extraccion de relaciones entre entidades.
- Extraccion de eventos.
- Generacion de texto conversacional (tag "conversational").
- Soporte bilingue chino-ingles (zh, en).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Clasificacion de intenciones en asistentes conversacionales: el modelo puede etiquetar la intencion del usuario en cada turno de una conversacion multi-turno, alimentando un enrutador de dialogos o un sistema de atencion al cliente automatizada con categorias predefinidas.
- Extraccion de datos estructurados de documentos: a partir de un esquema (por ejemplo, campos de una factura o de un formulario), el modelo rellena los slots correspondientes en texto libre, lo que permite poblar bases de datos sin reglas manuales.
- Pipeline de NER para enriquecimiento de contenidos: identificar personas, organizaciones, lugares y otras entidades en corpus textuales para indexacion, busqueda semantica o analisis de medios.
- Extraccion de relaciones para grafos de conocimiento: detectar relaciones entre entidades (por ejemplo, empleador-empleado, ubicacion-organizacion) y construir tripletas que alimenten un grafo.
- Extraccion de eventos en monitorizacion de noticias: identificar eventos (anuncios, fusiones, incidentes) con sus participantes y atributos a partir de articulos o comunicados.
- Procesamiento de formularios y tickets en back-office: dado un esquema de campos, extraer la informacion relevante de correos o tickets de soporte para su tramitacion automatica.
- Despliegue local en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 11,7 GB en Q2_K hasta 33,3 GB en Q8_0), puede ejecutarse en estaciones de trabajo o servidores sin GPU de gran formato, integrado en pipelines internos con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantizacion GGUF):
  - Q2_K: 11,7 GB
  - Q3_K_S: 13,8 GB
  - Q3_K_M: 15,1 GB
  - Q3_K_L: 16,4 GB
  - IQ4_XS: 17,0 GB
  - Q4_K_S: 18,0 GB
  - Q4_K_M: 19,1 GB
  - Q5_K_S: 21,7 GB
  - Q5_K_M: 22,3 GB
  - Q6_K: 25,8 GB
  - Q8_0: 33,3 GB
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, las cuantizaciones Q4_K_M (19,1 GB) encajan en GPUs de 24 GB como la RTX 4090; las cuantizaciones mayores (Q6_K, Q8_0) requieren 32 GB o mas (A100 40 GB, H100, o configuraciones multi-GPU).
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones Q4 o inferiores; las cuantizaciones Q2_K a Q3_K_L (11,7-16,4 GB) caben en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio, etc.); el modelo base en safetensors es compatible con transformers y, presumiblemente, con frameworks de servicio como vLLM o TGI, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa se limita a los datos objetivos del propio modelo:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Xing4.0-29B-Intent | 31.215.031.088 | no disponible | Apache 2.0 | safetensors, GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran chino (zh) e ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos conocidos: no se documentan en la informacion disponible; como todo modelo entrenado con datos web, puede heredar sesgos de su corpus.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de extraccion estructurada conviene validar la salida contra el esquema y aplicar comprobaciones posteriores.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar su uso en documentos largos sin pruebas previas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y del dataset asociado por si hubiera condiciones adicionales no reflejadas en la model card.
- Produccion: no hay benchmarks publicados que respalden el rendimiento; se recomienda evaluacion propia antes de desplegar en entornos criticos.
- La cuantizacion GGUF introduce perdida de calidad respecto a los pesos originales, especialmente en Q2_K y Q3; mradermacher indica que Q4_K_S y Q4_K_M son "rapidos y recomendados", y Q8_0 la mejor calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Xing4.0-29B-Intent-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Dataset: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- Pagina de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#Xing4.0-29B-Intent-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
