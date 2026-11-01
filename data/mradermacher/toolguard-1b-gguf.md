# mradermacher/toolguard-1b-GGUF

## Resumen

Toolguard 1B (cuantizado por mradermacher en formato GGUF) es la versión cuantizada de CharanSripadi/toolguard-1b, un modelo de aproximadamente 1.000 millones de parámetros (999.885.952 según los safetensors del repositorio) orientado a la seguridad de agentes de IA. Según las etiquetas del repositorio, el modelo se centra en el ecosistema MCP (Model Context Protocol), la detección de tool poisoning, prompt injection y, en general, la seguridad de sistemas LLM agénticos. Fue entrenado sobre el dataset CharanSripadi/toolguard-bench, un benchmark propio del mismo autor.

La relevancia de este modelo radica en un problema actual y creciente: a medida que los agentes LLM consumen herramientas externas vía MCP, se exponen a ataques como descripciones de herramientas envenenadas o inyecciones de prompt incrustadas en respuestas de herramientas. Un clasificador pequeño y especializado como este puede actuar como capa de filtrado previa a la ejecución de herramientas, con coste mínimo dado su tamaño.

Esta ficha corresponde específicamente al repositorio de cuantizaciones estáticas GGUF publicado por mradermacher, que ofrece desde Q2_K (0,8 GB) hasta f16 (2,1 GB). La model card del modelo base no incluye detalles de arquitectura, ventana de contexto ni resultados de benchmarks, por lo que varios campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, modelo base CharanSripadi/toolguard-1b) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | gemma (Gemma license) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base, CharanSripadi/toolguard-1b, es un modelo de unos mil millones de parametros entrenado sobre el dataset CharanSripadi/toolguard-bench. La model card no especifica la arquitectura exacta (aunque el tamano y el formato sugieren un transformer decoder-only), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Dado que hereda la licencia Gemma, es probable que el modelo base sea un fine-tuning de una variante de la familia Gemma de Google.

La cuantizacion publicada por mradermacher consiste en cuantizaciones estaticas GGUF convertidas desde el formato HF (convert_type: hf). No se ofrecen cuantizaciones weighted/imatrix por el autor en el momento de publicacion, aunque el propio README indica que se pueden solicitar mediante una Community Discussion.

## Capacidades

- Clasificacion o analisis de seguridad en contextos de agentes LLM, centrado en tool poisoning y prompt injection segun las etiquetas del repositorio.
- Evaluacion de herramientas MCP (Model Context Protocol) antes de su uso por un agente.
- Generacion de texto conversacional (pipeline etiquetado como conversational).
- Funcionamiento en ingles; no hay indicios de soporte multilingue.
- No hay informacion sobre capacidades de vision, audio, tool calling propio ni modos de razonamiento extendido.

## Casos de uso

- **Filtro de seguridad para agentes MCP**: desplegar el modelo como clasificador que inspecciona las descripciones y respuestas de herramientas MCP antes de que el agente principal las procese, detectando posibles tool poisoning o inyecciones. Su tamano de ~1B permite ejecutarlo en paralelo al agente con coste minimo.
- **Moderacion de prompt injection en pipelines RAG**: analizar fragmentos recuperados de fuentes externas para detectar instrucciones maliciosas incrustadas antes de pasarlas al LLM principal.
- **Auditoria de toolstores**: analizar de forma masiva catologos de herramientas MCP de terceros en busca de descripciones manipuladas, aprovechando que puede ejecutarse localmente y en lote.
- **Despliegue en edge o local**: con cuantizaciones de 0,8-1,2 GB, puede ejecutarse en portatiles o maquinas sin GPU dedicada, util para entornos corporativos donde los datos no pueden salir del perimeter.
- **Investigacion en seguridad LLM**: como modelo base o punto de comparacion para experimentos sobre deteccion de ataques agenticos, apoyandose en el benchmark toolguard-bench.
- **Capa de defensa en profundidad en produccion**: integrarlo en un pipeline de CI/CD o gateway de agentes que combine reglas estaticas con este clasificador para reducir la superficie de ataque de integraciones con herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El dataset de evaluacion asociado (CharanSripadi/toolguard-bench) existe como repositorio independiente, pero la model card no incluye metricas de rendimiento (precision, recall, F1) ni comparativas con otros modelos.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: entre 0,8 GB (Q2_K/Q3_K_S/IQ4_XS) y 2,1 GB (f16) solo de pesos; con contexto y overhead, basta con ~2-3 GB de RAM en la mayoria de cuantizaciones. Cabe holgadamente en cualquier GPU consumer moderna (incluso una GTX 1650 de 4 GB o una RTX 3060 de 6 GB) y, de hecho, puede ejecutarse solo con CPU.
- **GPU recomendadas**: no requiere GPU; cualquier GPU con 4 GB o mas de VRAM acelerara la inferencia. No se necesitan A100 ni H100.
- **Consumer GPUs**: totalmente viable en RTX 3060, RTX 4060, RTX 4090 o incluso integrados con CPU pura mediante llama.cpp.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers (Hugging Face) o vLLM.
- **Latencia y throughput**: no disponible; por tamano (~1B de parametros), se espera inferencia muy rapida, tipicamente por encima de 50 tokens/s incluso en CPU moderna, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| toolguard-1b (este modelo) | ~1,0B | GGUF / safetensors | gemma | Seguridad de agentes: tool poisoning, prompt injection, MCP |
| Llama Guard 3 1B (Meta) | ~1,2B | safetensors / GGUF (comunitarias) | Llama 3.2 Community | Moderacion de contenido y clasificacion de seguridad de prompts/respuestas |
| ShieldGemma 2B (Google) | ~2,6B | safetensors | Gemma | Clasificador de politicas de seguridad de contenido |
| WildGuard 7B (AllenAI) | ~7B | safetensors | Apache 2.0 | Deteccion de jailbreaks y prompt injection |

Nota: no existen alternativas publicas ampliamente conocidas especializadas exactamente en tool poisoning MCP, por lo que la comparacion se realiza con clasificadores de seguridad LLM de tamano similar. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- La model card del modelo base no documenta arquitectura, ventana de contexto, datos de entrenamiento ni metricas de evaluacion, lo que dificulta evaluar su fiabilidad antes de produccion.
- Entrenado sobre un dataset propio (toolguard-bench) del mismo autor; no hay validacion independiente publicada de su eficacia contra ataques reales.
- Solo soporta ingles; no es adecuado para filtrar contenido en castellano sin validacion previa.
- Riesgo de alucinacion o falsos positivos/negativos no cuantificado: no debe usarse como unico mecanismo de defensa, sino como capa adicional dentro de una estrategia de defensa en profundidad.
- Licencia Gemma: impone terminos de uso de Google (restricciones de uso, aviso de licencia y clausulas de uso aceptable) que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Se trata de cuantizaciones estaticas sin imatrix; las cuantizaciones mas agresivas (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable, especialmente en un modelo de solo 1B de parametros.
- La cuantizacion es de un tercero (mradermacher); para el modelo original con pesos completos, utilizar el repositorio base CharanSripadi/toolguard-1b.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/toolguard-1b-GGUF
- Modelo base: https://huggingface.co/CharanSripadi/toolguard-1b
- Dataset/benchmark: https://huggingface.co/datasets/CharanSripadi/toolguard-bench
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#toolguard-1b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de codigo: no disponible
