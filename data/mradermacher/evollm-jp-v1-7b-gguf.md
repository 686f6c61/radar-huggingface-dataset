# mradermacher/EvoLLM-JP-v1-7B-GGUF

## Resumen

EvoLLM-JP-v1-7B-GGUF es la version cuantizada en formato GGUF del modelo EvoLLM-JP-v1-7B desarrollado por Sakana AI, un laboratorio japones de investigacion en inteligencia artificial. Este repositorio, mantenido por el usuario mradermacher, proporciona los pesos del modelo original convertidos a GGUF para su uso con llama.cpp y herramientas compatibles, facilitando la inferencia en hardware de consumo. El modelo base es un transformer de 7.241.732.096 parametros (aproximadamente 7,24 mil millones) especializado en japones, derivado de la investigacion de Sakana AI sobre modelos evolutivos.

El modelo resuelve el problema de disponer de un LLM de tamano medio (7B) optimizado para el idioma japones que pueda ejecutarse en hardware asequible mediante cuantizacion. Sakana AI es conocido por sus trabajos en modelos evolutivos y fusion de modelos, y EvoLLM-JP representa su incursion en el ambito de los modelos de lenguaje en japones con un enfoque en eficiencia y calidad linguistica para ese idioma.

La relevancia de este repositorio radica en que ofrece 12 variantes de cuantizacion (desde Q2_K hasta f16) que permiten desplegar el modelo en un rango amplio de hardware, desde GPUs de gama baja hasta estaciones de trabajo. El repositorio acumula 646 descargas y fue creado en diciembre de 2024, con actualizacion en noviembre de 2026. La licencia es "other", lo que requiere consultar los terminos del modelo base para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base SakanaAI/EvoLLM-JP-v1-7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base EvoLLM-JP-v1-7B no se detalla en la informacion proporcionada. Por el numero de parametros (7,24 mil millones) y el ecosistema de Sakana AI, se trata de un transformer decoder-only de escala 7B, consistente con las arquitecturas tipicas de modelos de lenguaje de ese tamano. El repositorio GGUF no incluye informacion sobre el proceso de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o mecanismos de atencion lineal.

La unica informacion tecnica adicional disponible en la model card es que las cuantizaciones son de tipo "static" (estaticas) y que existe una version alternativa con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/EvoLLM-JP-v1-7B-i1-GGUF. El proceso de cuantizacion se realizo con convert_type hf y quantize_version 2, segun los metadatos internos de la model card.

## Capacidades

- Generacion de texto en japones: el modelo esta especializado en el idioma japones segun la etiqueta de idioma del repositorio.
- Razonamiento y comprension del lenguaje: capacidades propias de un modelo de lenguaje de 7B, aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al japones segun los metadatos; no se confirma soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en japones: el modelo puede gestionar conversaciones multi-turno en japones para empresas que operan en el mercado nipon, aprovechando su especializacion linguistica para respuestas mas naturales y culturalmente adecuadas.
- Procesamiento de documentos en japones: resumen, extraccion de informacion y clasificacion de textos en japones en entornos con hardware de consumo, gracias a las cuantizaciones de 4-5 GB que caben en GPUs de gama media.
- Generacion de contenido editorial en japones: redaccion asistida de articulos, correos y material de marketing en japones, desplegable en local con llama.cpp u Ollama para evitar dependencias de la nube.
- Chatbot local para desarrolladores japoneses: integracion en entornos de desarrollo mediante la API compatible con endpoints, permitiendo asistentes de codigo o documentacion en japones sin conexion externa.
- Investigacion linguistica: analisis de fenomenos del japones (morfologia, keigo, estructuras sintacticas) con un modelo open source ejecutable en laboratorios con recursos limitados.
- Prototipado rapido de aplicaciones NLP en japones: las multiples cuantizaciones (desde Q2_K de 2,8 GB hasta Q8_0 de 7,8 GB) permiten ajustar el equilibrio calidad/recursos en fases de prueba antes de escalar a infraestructura mayor.
- Educacion y tutoria en japones: despliegue de un tutor conversacional local para estudiantes de japones, con la ventaja de privacidad al no requerir envio de datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (2,8 GB): aproximadamente 3-4 GB de VRAM.
  - Q3_K_S (3,3 GB) a Q3_K_L (3,9 GB): aproximadamente 4-5 GB de VRAM.
  - IQ4_XS (4,0 GB) a Q4_K_M (4,5 GB): aproximadamente 5-6 GB de VRAM.
  - Q5_K_S (5,1 GB) a Q5_K_M (5,2 GB): aproximadamente 6-7 GB de VRAM.
  - Q6_K (6,0 GB): aproximadamente 7-8 GB de VRAM.
  - Q8_0 (7,8 GB): aproximadamente 9-10 GB de VRAM.
  - f16 (14,6 GB): aproximadamente 16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 para las variantes de mayor precision.
- Cabe en GPU de consumo: si, desde una GTX 1060 6 GB (con Q2_K o Q3) hasta una RTX 4090 (con Q8_0 o f16).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EvoLLM-JP-v1-7B-GGUF | 7,24B | no disponible | japones | other | GGUF |
| SakanaAI/EvoLLM-JP-v1-7B (base) | 7,24B | no disponible | japones | other | safetensors |
| mradermacher/EvoLLM-JP-v1-7B-i1-GGUF | 7,24B | no disponible | japones | other | GGUF (imatrix) |

No se dispone de informacion sobre modelos comparables de otros desarrolladores en la informacion proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado principalmente con datos en japones, puede reflejar sesgos culturales y linguisticos del corpus utilizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 7B; no se han publicado evaluaciones especificas de fidelidad factual en la informacion disponible.
- Limitaciones de contexto o idioma: el modelo esta etiquetado unicamente para japones; no se garantiza un rendimiento adecuado en otros idiomas. La longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia es "other", lo que implica que se deben consultar los terminos del modelo base (SakanaAI/EvoLLM-JP-v1-7B) antes de cualquier uso comercial. No se especifican permisos explicitos en la informacion proporcionada.
- Caveats para produccion: las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; se recomienda Q4_K_M o superior para uso en produccion. La version i1-GGUF con cuantizacion imatrix puede ofrecer mejor calidad a igual tamano.
- El repositorio es una cuantizacion de terceros (mradermacher), no el modelo oficial de Sakana AI; para soporte y documentacion completa debe consultarse el repositorio del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EvoLLM-JP-v1-7B-GGUF
- Modelo base: https://huggingface.co/SakanaAI/EvoLLM-JP-v1-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EvoLLM-JP-v1-7B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#EvoLLM-JP-v1-7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa patrocinadora: https://www.nethype.de/
