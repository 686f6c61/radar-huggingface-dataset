# mradermacher/ConTra-0.8B-GGUF

## Resumen

ConTra-0.8B-GGUF es la distribucion en formato GGUF del modelo ConTra-0.8B, desarrollado originalmente por JJHou1 y cuantizado por mradermacher. Se trata de un modelo de recuperacion contextual (contextual retrieval) orientado a pipelines de generacion aumentada por recuperacion (RAG) y recuperacion de documentos. El modelo cuenta con 752.393.024 parametros (aproximadamente 0,75 mil millones), lo que lo situa en la gama de modelos pequenos optimizados para tareas de representacion y recuperacion mas que para generacion abierta de texto.

La relevancia de esta publicacion radica en su empaquetado en multiples cuantizaciones GGUF (desde Q2_K hasta f16), lo que permite ejecutar el modelo en hardware de consumo con requisitos de memoria muy reducidos (desde 0,5 GB en Q2_K). Esto lo hace atractivo para integrar recuperacion contextual en entornos con recursos limitados, como aplicaciones de escritorio, edge computing o pipelines de RAG autoalojados.

La informacion disponible sobre el modelo es limitada: la model card original no detalla la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, y no se han publicado resultados de benchmarks en la informacion proporcionada. El modelo esta etiquetado unicamente para ingles y su licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: JJHou1/ConTra-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base (JJHou1/ConTra-0.8B) esta etiquetado como `transformers` y orientado a tareas de `contextual-retrieval`, `rag` y `document-retrieval`, lo que sugiere un diseno especializado en representaciones de documentos y contexto para sistemas de recuperacion. El numero de parametros (752 millones) es coherente con un transformer de escala pequena, pero no se especifica si emplea atencion estandar, atencion lineal u otra variante.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio GGUF indica que el modelo base incorpora algun componente multimodal, aunque la model card no describe su funcionamiento ni las modalidades soportadas. No se han documentado innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Recuperacion contextual (contextual retrieval): disenado para generar representaciones utiles en pipelines de recuperacion de documentos.
- Integracion en sistemas RAG: orientado a la fase de recuperacion de informacion previa a la generacion.
- Recuperacion de documentos (document-retrieval): adecuado para indexacion y busqueda semantica.
- Procesamiento en ingles: el modelo esta etiquetado exclusivamente para el idioma ingles.
- Soporte multimodal potencial: la presencia de ficheros `mmproj` sugiere algun grado de capacidad multimodal, aunque no se detalla en la informacion disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia compatibles con Hugging Face Endpoints.
- No se ha documentado soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Recuperacion de documentos en pipelines RAG autoalojados: el modelo puede generar representaciones de fragmentos de documentos para busqueda semantica en sistemas con recursos limitados, gracias a su tamano reducido y a las cuantizaciones de 0,5-0,9 GB.
- Busqueda semantica en aplicaciones de escritorio: al caber en cuantizaciones Q4_K_M (0,6 GB), puede integrarse en aplicaciones locales que necesiten recuperacion contextual sin depender de servicios en la nube.
- Indexacion de bases documentales en edge computing: su huella de memoria reducida permite desplegarlo en dispositivos con poca VRAM o incluso en CPU mediante llama.cpp.
- Filtrado y reordenacion de candidatos en sistemas de recuperacion: puede emplearse como componente de reranking o de recuperacion contextual dentro de una arquitectura multi-etapa.
- Prototipado rapido de sistemas RAG: las multiples cuantizaciones disponibles permiten experimentar con distintos equilibrios calidad/tamano antes de escalar a modelos mayores.
- Despliegue en contenedores con restricciones de memoria: la version Q2_K (0,5 GB) facilita su inclusion en entornos con limites estrictos de RAM o VRAM.
- Investigacion en recuperacion contextual: util como linea base ligera para comparar tecnicas de recuperacion en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K) hasta 1,6 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas ligeras; para f16 se recomienda al menos 2-3 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (previa importacion del GGUF), y otras herramientas compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo pertenece a la categoria de modelos pequenos de recuperacion contextual (menos de 1.000 millones de parametros) orientados a RAG, pero no se han facilitado datos de rendimiento ni alternativas directas para establecer una comparacion fundamentada.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ConTra-0.8B-GGUF | 752.393.024 | no disponible | no disponible | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado presumiblemente con datos en ingles, puede heredar sesgos de dichos datos.
- Riesgo de alucinacion: no evaluado; al ser un modelo especializado en recuperacion, su uso principal no es la generacion abierta, lo que reduce pero no elimina este riesgo.
- Limitaciones de idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia no esta especificada, lo que impide confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base (JJHou1/ConTra-0.8B) antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay datos publicados que permitan validar su calidad frente a alternativas.
- Documentacion escasa: la model card no detalla arquitectura, entrenamiento ni contexto maximo, lo que dificulta la evaluacion tecnica rigurosa.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K pueden degradar notablemente la calidad de las representaciones; se recomienda Q4_K_M o superior para uso en produccion.
- Fecha de creacion futura: el repositorio figura creado en 2026-11-27, lo que puede indicar metadatos inconsistentes o un modelo de muy reciente publicacion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/ConTra-0.8B-GGUF
- Modelo base: https://huggingface.co/JJHou1/ConTra-0.8B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ConTra-0.8B-GGUF
- Paper referenciado (arXiv): 2611.34366
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
