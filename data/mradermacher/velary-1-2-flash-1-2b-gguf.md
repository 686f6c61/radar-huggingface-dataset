# mradermacher/Velary-1.2-Flash-1.2B-GGUF

## Resumen

Velary-1.2-Flash-1.2B es un modelo de lenguaje bilingue (ruso e ingles) de 1.170.340.608 parametros desarrollado por AuroraSystem, publicado originalmente en formato transformers y distribuido aqui en formato GGUF por mradermacher. El modelo se presenta como un modelo de chat con instruction tuning, orientado a razonamiento, y con un sistema de "niveles de razonamiento" (reasoning-levels) que permite ajustar la profundidad del proceso de pensamiento. Su arquitectura se etiqueta como lfm2 (Liquid Foundation Model 2), lo que lo situa en la familia de modelos Liquid.

La relevancia de esta ficha radica en que se trata de la version cuantizada para inferencia local de un modelo pequeno y bilingue, lo que lo hace accesible en hardware de consumo. El repositorio GGUF incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16), lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama.

No obstante, la informacion publicada es escasa: no se detallan datos de entrenamiento, composicion del dataset ni resultados de benchmarks. La model card del repositorio GGUF es practicamente la plantilla estandar de mradermacher, sin informacion tecnica adicional sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (Liquid Foundation Model 2), segun tags del autor |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, en |
| Licencia | lfm-open-license (license: other) |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura lfm2 (Liquid Foundation Model 2), si bien no se proporcionan detalles tecnicos sobre la implementacion interna, el numero de capas, la dimension oculta ni el mecanismo de atencion. Los tags incluyen "liquid", "aurora" y "velary", que apuntan a la familia de modelos Liquid y al proyecto AuroraSystem, pero no se documenta la innovacion arquitectonica concreta.

Respecto al entrenamiento, la unica informacion disponible es que se uso el dataset AuroraSystem/ABench75 y que el modelo ha pasado por instruction tuning orientado a chat. Los tags mencionan "reasoning" y "reasoning-levels", lo que sugiere un entrenamiento con modos de razonamiento configurables, pero no se especifica el numero de tokens, la composicion del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento. No hay informacion sobre decodificacion especulativa ni tecnicas de atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno en ruso e ingles.
- Razonamiento con niveles configurables (reasoning-levels), segun los tags del autor.
- Instruction following y formato de chat.
- Capacidades de razonamiento general (tag "reasoning").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o multi-step reasoning mas alla del razonamiento interno.
- No se documenta vision, audio ni otras modalidades.
- Capacidades multilingues limitadas a ru y en segun la model card.

## Casos de uso

- Chat bilingue ruso-ingles en local: el modelo puede gestionar conversaciones en ambos idiomas y desplegarse en equipos de consumo gracias a sus cuantizaciones de 0,6 a 1,3 GB, lo que lo hace adecuado para asistentes personales sin conexion.
- Prototipado rapido de aplicaciones de razonamiento: sus niveles de razonamiento configurables permiten experimentar con distintos grados de profundidad en la respuesta sin cambiar de modelo.
- Educacion y tutoria en ruso: al ser un modelo pequeno y bilingue, puede emplearse en entornos educativos donde se requiera un asistente ligero que responda en ruso con coste computacional bajo.
- Procesamiento de texto en el borde (edge computing): con cuantizaciones Q4_K_S de 0,8 GB, puede ejecutarse en dispositivos con poca memoria, como mini-PC o portatiles sin GPU dedicada.
- Filtrado y clasificacion de texto en pipelines: su tamano reducido permite usarlo como componente de preprocesamiento o generacion de resumenes en flujos automatizados.
- Investigacion sobre modelos Liquid: sirve como caso de estudio para evaluar el comportamiento de la arquitectura lfm2 en tareas de chat y razonamiento a pequena escala.
- Generacion de contenido en ingles y ruso para blogs o documentacion tecnica, con la ventaja de ejecucion local y privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K), 0,8 GB (Q4_K_S / Q4_K_M), 1,1 GB (Q6_K), 1,3 GB (Q8_0) y 2,4 GB (f16), segun los tamanos de fichero del repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; una RTX 3060 o superior permite ejecutar f16 con holgura. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. Se puede senalar que, por tamano (1,2B parametros) y naturaleza bilingue, se situaria en la categoria de modelos pequenos tipo Qwen2.5-1.5B o SmolLM2-1.7B, pero no hay datos para establecer una comparacion rigurosa de rendimiento, contexto o licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Velary-1.2-Flash-1.2B | 1,17B | no disponible | lfm-open-license | GGUF en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no se documentan contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Riesgo de alucinacion inherente a modelos pequenos de 1,2B parametros, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden identificar sesgos especificos.
- Cobertura linguistica limitada a ruso e ingles; no se garantiza un buen rendimiento en castellano.
- Licencia "lfm-open-license" (license: other): es necesario revisar los terminos exactos antes de un uso comercial, ya que no es una licencia estandar tipo Apache o MIT.
- Modelo cuantizado de terceros: la calidad puede degradarse en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).
- Sin soporte documentado de tool calling ni agentes, lo que limita su uso en pipelines complejos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Velary-1.2-Flash-1.2B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Velary-1.2-Flash-1.2B
- Dataset: https://huggingface.co/datasets/AuroraSystem/ABench75
- Pagina de overview de cuantizaciones: https://hf.tst.eu/model#Velary-1.2-Flash-1.2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
