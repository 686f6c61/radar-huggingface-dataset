# mradermacher/Fikra-Model-1-2B-GGUF

## Resumen

Fikra-Model-1-2B-GGUF es la version cuantizada en formato GGUF del modelo Fikra-Model-1-2B, desarrollado por zabibutechnika. La cuantizacion la firma mradermacher, un conocido publicador de conversiones GGUF en Hugging Face. El modelo base se presenta como un transformer de tipo Gemma 4 (segun las etiquetas del repositorio) orientado a razonamiento, modo thinking y uso agentico, con capacidades conversacionales y un complemento multimodal opcional (mmproj). Esta pensado para ejecucion local mediante llama.cpp y sus derivados, lo que lo hace accesible en hardware modesto.

El dato de parametros es llamativo: aunque el nombre comercial indica "2B", los pesos reales en safetensors suman 4.647.450.147 parametros (aproximadamente 4,65 mil millones). Esta discrepancia entre nombre y tamano real debe tenerse en cuenta al planificar memoria y rendimiento. El modelo declara soporte para ingles (en) y suajili (sw), lo que lo situa como una propuesta poco habitual para el multilingue africano en el ecosistema open source.

La relevancia actual radica en su disponibilidad en multiples cuantizaciones estaticas (desde Q2_K hasta Q8_0, mas f16 e IQ4_XS), lo que permite desplegarlo desde equipos con poca VRAM hasta estaciones de trabajo. Sin embargo, la ausencia de benchmarks publicados y de documentacion tecnica detallada obliga a tratar las afirmaciones de capacidad con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "gemma4" en el repositorio; detalles no disponibles) |
| Parametros totales | 4.647.450.147 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en), suajili (sw) |
| Licencia | zabibu-technika-license (categoria "other") |
| Formato de pesos | GGUF (repo cuantizado) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a una base tipo Gemma 4 y a un pipeline de transformers con conversacion y modo thinking. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

El proceso de cuantizacion lo realiza mradermacher con cuantizaciones estaticas (no se ofrecen, por ahora, versiones ponderadas o imatrix). Se incluye un componente mmproj que actua como suplemento multimodal, lo que sugiere que el modelo base acepta entradas de imagen ademas de texto, aunque la model card no lo desarrolla.

## Capacidades

- Generacion de texto conversacional en ingles y suajili.
- Modo de razonamiento ("thinking") segun las etiquetas del repositorio.
- Orientacion a uso agentico (tag "agentic"), lo que sugiere soporte para flujos multi-paso, aunque no se documenta el mecanismo.
- Capacidad multimodal opcional mediante el fichero mmproj (entrada de imagen), segun la presencia de dicho componente.
- Soporte de tool calling / function calling: no disponible en la documentacion.
- Capacidades matematicas o de codigo especificas: no disponibles.

## Casos de uso

- Asistente conversacional local en ingles y suajili: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo, lo que resulta util para prototipos de atencion al cliente en mercados de Africa Oriental donde el suajili es relevante.
- Razonamiento asistido en entornos sin conectividad: gracias a sus cuantizaciones ligeras (Q4_K_M o IQ4_XS), puede ejecutarse en portatiles sin GPU dedicada para tareas de analisis y resumen.
- Investigacion sobre modelos multilingues de bajo resource: su combinacion en/sw lo convierte en un objeto de estudio para evaluar transferencia linguistica en modelos de ~4,6 mil millones de parametros.
- Procesamiento de documentos con imagen: el componente mmproj permite experimentar con entrada visual combinada con texto, por ejemplo para extraer informacion de capturas o formularios.
- Flujos agenticos experimentales: la etiqueta "agentic" sugiere su uso en pipelines de varios pasos, aunque la falta de documentacion sobre tool calling limita la integracion en produccion sin validacion previa.
- Despliegue en edge o entornos con VRAM limitada: las versiones Q2_K y Q3_K permiten ejecucion en GPUs de 4-6 GB, adecuadas para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~4,65 mil millones de parametros, una cuantizacion Q4_K_M ocupa del orden de 3 GB, Q8_0 en torno a 5 GB y f16 cerca de 9-10 GB (estimaciones teoricas a partir del numero de parametros; no verificadas para este modelo concreto).
- El repo completo ocupa 49,6 GB, incluyendo todas las cuantizaciones y los ficheros mmproj.
- GPU recomendadas: RTX 3060/4060 (12/8 GB) para Q4-Q8; A100 o H100 para f16 y cargas concurrentes.
- Cabe en GPU de consumo: si, en modelos con 6-12 GB de VRAM segun cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun etiquetas), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fikra-Model-1-2B-GGUF | ~4,65 mil millones | no disponible | en, sw | zabibu-technika-license | GGUF |
| mradermacher/Zabibu-Fikra-2B-i1-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF (imatrix) |
| Alternativas de ~4-7B open source (p. ej. variantes Gemma o Qwen) | ~4-7 mil millones | 4K-32K tipico | decenas de idiomas | licencias permisivas habituales | GGUF, safetensors |

La comparacion con alternativas genericas es limitada porque no hay benchmarks ni contexto publicado del modelo. Se recomienda evaluar empiricamente antes de sustituir un modelo consolidado.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("2B") y los parametros reales (~4,65 mil millones): puede inducir a error en la planificacion de recursos.
- Ausencia de benchmarks y de documentacion tecnica sobre entrenamiento, contexto y datos.
- Solo declara dos idiomas (ingles y suajili); el rendimiento en castellano no esta garantizado ni documentado.
- Licencia "zabibu-technika-license" de tipo "other": es imprescindible revisar los terminos antes de uso comercial.
- Riesgo de alucinacion no cuantificado por falta de evaluaciones publicadas.
- El soporte multimodal depende de ficheros mmproj cuyo comportamiento no se documenta.
- Cuantizaciones estaticas sin versiones ponderadas/imatrix (por ahora), lo que puede implicar mayor perdida de calidad en cuantizaciones bajas.
- Modelo con cero descargas y cero likes en el momento de la ficha: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fikra-Model-1-2B-GGUF
- Modelo base: https://huggingface.co/zabibutechnika/Fikra-Model-1-2B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Fikra-Model-1-2B-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Variante imatrix relacionada: https://huggingface.co/mradermacher/Zabibu-Fikra-2B-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
