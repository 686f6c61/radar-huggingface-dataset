# NoxNotreve/amaliaguard-4b-GGUF

## Resumen

AmaliaGuard-4B es un modelo de seguridad y moderación de contenido de 4.022.468.096 parámetros (aproximadamente 4 mil millones), desarrollado por amalia-llm y distribuido en formato GGUF por el usuario NoxNotreve. Está diseñado específicamente como un "guard model" para filtrar contenido, aplicar políticas de moderación y servir como capa de protección (guardrails) en aplicaciones conversacionales. Su enfoque declarado incluye el cumplimiento del RGPD (GDPR), lo que lo orienta a despliegues en entornos europeos con requisitos de protección de datos.

El modelo base es amalia-llm/amaliaguard-4b, del que esta ficha es una cuantización estática en formato GGUF generada con la herramienta de mradermacher. Los idiomas soportados declarados son portugués (pt) e inglés (en), lo que lo hace adecuado para mercados lusófonos y para pipelines bilingües. No se dispone de información sobre arquitectura interna, longitud de contexto ni proceso de entrenamiento en la documentación proporcionada.

La relevancia de este modelo radica en la creciente necesidad de capas de seguridad locales y desplegables en hardware modesto: con cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), puede ejecutarse en GPUs de consumo y en entornos con requisitos de soberanía de datos, evitando enviar contenido sensible a APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el pipeline de transformers; no confirmado en la documentacion) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | pt, en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors segun el dato de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base amalia-llm/amaliaguard-4b en la documentacion proporcionada. Por el numero de parametros (4.022.468.096) y la libreria declarada (transformers), se trata de un modelo transformer denso de aproximadamente 4 mil millones de parametros, pero no se confirma el tipo exacto de atencion, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado.

La model card del repositorio GGUF es una plantilla generada automaticamente por la herramienta de cuantizacion de mradermacher: describe el proceso de conversion a GGUF y las variantes disponibles, pero no aporta informacion sobre el entrenamiento del modelo original. Las cuantizaciones son estaticas (no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion), y el autor indica que podrian solicitarse mediante una discusion en la comunidad. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Moderacion de contenido y clasificacion de seguridad: el modelo esta etiquetado como `safety`, `content-moderation` y `guardrails`, lo que indica su uso previsto como filtro de contenido.
- Aplicacion de politicas de proteccion de datos orientadas al RGPD (`gdpr`), segun las etiquetas del autor.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de dialogos, aunque no se detalla el formato de prompt.
- Capacidades multilingues limitadas a portugues e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se dispone de informacion sobre capacidades de generacion de codigo o matematicas; el enfoque declarado es la seguridad, no el razonamiento general.

## Casos de uso

- Moderacion de comentarios en plataformas lusofonas: el modelo puede clasificar texto en portugues e ingles para detectar contenido toxico o que incumpla politicas, desplegado localmente en formato GGUF con llama.cpp para evitar enviar datos de usuarios a terceros.
- Filtro de entrada en chatbots de atencion al cliente: como capa previa al modelo generativo principal, intercepta peticiones que infrinjan politicas o contengan datos personales, alineandose con los requisitos del RGPD.
- Guardrail en pipelines de generacion aumentada (RAG): validacion de las respuestas generadas antes de mostrarlas al usuario, con la ventaja de que el modelo de 4B puede ejecutarse en la misma maquina que el orquestador.
- Cumplimiento normativo en entornos sanitarios o financieros: clasificacion de comunicaciones internas para detectar fugas de informacion personal, con despliegue on-premise que garantiza que los datos no salgan de la infraestructura.
- Moderacion de foros y comunidades online: integracion en sistemas de gestion de contenido para preclasificar reportes de usuarios en portugues, reduciendo la carga de revision manual.
- Despliegue en hardware de consumo para prototipado: con la cuantizacion Q4_K_M (2,6 GB), el modelo cabe en GPUs de gama media y permite a equipos pequenos validar politicas de moderacion antes de escalar a produccion.
- Filtrado bilingue en herramientas de traduccion o agregadores de noticias: deteccion de contenido sensible en pares pt-en antes de la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): aproximadamente 2,5-3,5 GB con Q4_K_S/Q4_K_M, 3,5-4,5 GB con Q6_K, 5-6 GB con Q8_0 y 9-10 GB con f16, asumiendo overhead de KV cache moderado (no se dispone de la longitud de contexto para calcularlo con precision).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores para Q6/Q8; A100/H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y, por tanto, con vLLM o TGI en su version sin cuantizar (sujeto a confirmacion de soporte de arquitectura).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Se comparan alternativas genericas de moderacion de la misma categoria; los datos de los competidores son de conocimiento general y no proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AmaliaGuard-4B (este) | 4,02 B | no disponible | pt, en | no disponible | GGUF, safetensors |
| Llama Guard 3 (8B) | 8 B | 128k (segun documentacion publica de Meta) | multilingue | Llama 3 Community License | safetensors, GGUF |
| ShieldGemma (2B/9B) | 2 B / 9 B | 8k (segun documentacion publica de Google) | ingles principalmente | Gemma Terms of Use | safetensors, GGUF |
| Qwen3Guard (0.6B-8B) | 0,6-8 B | variable | multilingue | Apache 2.0 (segun familia Qwen) | safetensors, GGUF |

La ventaja principal de AmaliaGuard-4B frente a estas alternativas es su especializacion declarada en portugues y en cumplimiento del RGPD, un nicho poco cubierto por los modelos de moderacion genericos, que suelen estar optimizados para ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo de moderacion, hereda los sesgos de su dataset de entrenamiento, que no se describe.
- Riesgo de alucinacion: no evaluado; en tareas de clasificacion de seguridad, los falsos negativos (contenido danino no detectado) son el riesgo critico y no hay datos de evaluacion publicados.
- Limitaciones de idioma: solo portugues e ingles; no se garantiza comportamiento correcto en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial. Es imprescindible verificar la licencia del modelo base amalia-llm/amaliaguard-4b antes de desplegarlo en produccion.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Las cuantizaciones son estaticas y no hay versiones ponderadas/imatrix, lo que puede degradar la calidad en las variantes de menor bitrate (Q2_K, Q3_K_S).
- La model card es una plantilla automatica sin informacion sobre el entrenamiento, el formato de prompt o las metricas de evaluacion; se recomienda consultar el repositorio del modelo base.
- La fecha de creacion del repositorio (2026-11-04) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/NoxNotreve/amaliaguard-4b-GGUF
- Modelo base: https://huggingface.co/amalia-llm/amaliaguard-4b
- Repositorio original de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/amaliaguard-4b-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#amaliaguard-4b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
