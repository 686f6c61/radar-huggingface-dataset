# mradermacher/LFM3-1.7B-Surgical-Abliterated-i1-GGUF

## Resumen

`mradermacher/LFM3-1.7B-Surgical-Abliterated-i1-GGUF` es una distribucion de cuantizaciones GGUF generadas con imatrix sobre el modelo `medismera/LFM3-1.7B-Surgical-Abliterated`, una variante "abliterated" (sin censura) del modelo base LFM3 de 1.7B parametros. El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos de la comunidad para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3), aunque la model card disponible no documenta detalles de arquitectura ni de entrenamiento.

El problema que resuelve es el de ofrecer una version del modelo con las capas de rechazo ("refusal") eliminadas mediante una tecnica de "surgical alignment" (abliteracion selectiva), pensada para investigadores que necesitan estudiar el comportamiento del modelo sin los filtros de alineacion habituales. La cuantizacion en formato GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo inviable con los pesos en precision completa para muchos usuarios.

Es relevante ahora porque el ecosistema de modelos "uncensored" y "abliterated" ha crecido como area de investigacion en seguridad y alineacion, y porque las cuantizaciones GGUF con imatrix ofrecen un equilibrio calidad/tamano superior a las cuantizaciones estaticas tradicionales. No obstante, la informacion publica disponible sobre este modelo concreto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3, familia Liquid Foundation Model; detalles no documentados en la informacion disponible) |
| Parametros totales | 899.013 (segun safetensors del repo base; el nombre comercial indica 1.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (i1); se listan Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en (ingles) |
| Licencia | other (heredada del modelo base; consultar terminos del modelo original) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre indica que pertenece a la familia LFM3 (Liquid Foundation Model 3), pero la model card del repositorio de cuantizacion no detalla si se trata de un transformer clasico, un modelo hibrido o una arquitectura con capas de estado (SSM). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada en este repositorio es la cuantizacion: se trata de cuantizaciones i1 (imatrix) generadas con un fichero `imatrix.gguf` incluido en el repo, que permite crear cuantizaciones propias. Las cuantizaciones imatrix ponderan la importancia de cada tensor durante la cuantizacion, lo que tipicamente mejora la perplejidad frente a cuantizaciones estaticas del mismo tamano. El modelo base incorpora una tecnica de "surgical alignment" para eliminar los comportamientos de rechazo, aunque los detalles del procedimiento no estan documentados en la informacion disponible.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Modelo causal de lenguaje (`causal-lm`), apto para completado y generacion autoregresiva.
- Comportamiento "uncensored"/"abliterated": se han eliminado las capas de rechazo mediante alineacion quirurgica, por lo que el modelo no aplica los filtros de seguridad habituales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite estudiar como se comporta una red sin capas de rechazo, comparando respuestas frente al modelo base alineado para analizar que informacion queda suprimida por la alineacion.
- Analisis de sesgos y robustez: al carecer de filtros de rechazo, facilita la evaluacion de sesgos latentes y comportamientos no filtrados en entornos controlados de laboratorio.
- Generacion creativa sin restricciones: util para escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados rechazan, siempre que se cumplan los requisitos legales y eticos del usuario.
- Red teaming de sistemas: sirve como modelo adversario para probar la robustez de clasificadores de contenido y pipelines de moderacion.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF de 1.7B permiten ejecutar el modelo en CPU y GPUs modestas mediante llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura cloud.
- Prototipado rapido de pipelines de generacion de texto: el tamano reducido y el formato GGUF facilitan iterar en local antes de escalar a modelos mayores.
- Educacion e investigacion academica: permite a estudiantes experimentar con modelos de lenguaje cuantizados y con tecnicas de abliteracion en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~1.7B parametros, las cuantizaciones Q4_K_M ocupan aproximadamente 1.0-1.3 GB; las Q6_K en torno a 1.4-1.6 GB; las Q2_K alrededor de 0.7-0.9 GB. Los valores exactos por cuantizacion no se detallan en la informacion disponible.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de menor tamano; una RTX 3060/4060 (8-12 GB) permite cargar las cuantizaciones de mayor calidad con contexto amplio.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas (GTX 1060 6 GB en adelante) e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repo incluye un fichero `imatrix.gguf` para generar cuantizaciones propias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Surgical-Abliterated-i1-GGUF (este) | ~1.7B (899.013 segun safetensors) | no disponible | other | GGUF (i1) | Variante abliterated, solo ingles |
| LFM3-1.7B-Surgical-Abliterated (base) | ~1.7B | no disponible | other | safetensors | Modelo original sin cuantizar |
| LFM3-1.7B-Surgical-Abliterated-GGUF (estatico) | ~1.7B | no disponible | other | GGUF estatico | Mismo modelo, cuantizaciones no imatrix |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored": al haberse eliminado las capas de rechazo, puede generar contenido ofensivo, ilegal o danino; no es apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de alucinacion: los modelos de ~1.7B parametros tienen menor fiabilidad factual que modelos mayores; no debe usarse como fuente de verdad.
- Idioma limitado al ingles: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia "other": es imprescindible revisar los terminos del modelo base (`medismera/LFM3-1.7B-Surgical-Abliterated`) antes de cualquier uso comercial; la cuantizacion hereda las restricciones del original.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que dificulta planificar despliegues con entradas largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del modelo ni del impacto de la abliteracion en sus capacidades.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso.
- La discrepancia entre el nombre comercial (1.7B) y el recuento de safetensors (899.013) sugiere que el dato de parametros del repo puede estar incompleto o mal reportado; conviene verificarlo antes de dimensionar hardware.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/LFM3-1.7B-Surgical-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/medismera/LFM3-1.7B-Surgical-Abliterated
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/LFM3-1.7B-Surgical-Abliterated-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#LFM3-1.7B-Surgical-Abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
