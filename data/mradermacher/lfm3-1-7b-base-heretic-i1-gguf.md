# mradermacher/LFM3-1.7B-Base-heretic-i1-GGUF

## Resumen

LFM3-1.7B-Base-heretic-i1-GGUF es una cuantizacion GGUF del modelo LFM3-1.7B-Base-heretic, publicada por el usuario mradermacher en Hugging Face. El modelo subyacente es una variante "heretic" del LFM3-1.7B de Liquid AI, un modelo de texto de 1,73 mil millones de parametros liberado en octubre de 2026 como parte de la familia LFM3. La familia LFM3 se construye sobre una arquitectura "tri-hybrid" propietaria de Liquid AI y comparte un backbone de 1,7B parametros entre seis modelos abiertos que cubren texto, vision y audio.

El repositorio concreto que nos ocupa no aporta informacion sobre el proceso de entrenamiento de la variante "heretic" ni sobre los datos empleados para producirla; la model card se limita a documentar los tipos de cuantizacion generados a partir del checkpoint original `saidutta69/LFM3-1.7B-Base-heretic`. El sufijo "heretic" hace referencia a una tecnica de ablacion de rechazos (reduccion de comportamientos de negativa aprendidos), aunque los detalles tecnicos de esa intervencion no estan documentados en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, permite ejecutar localmente un modelo de la familia LFM3 en hardware de consumo gracias a las cuantizaciones GGUF (desde IQ1_S hasta Q6_K); por otro, advierte de que se trata de una variante modificada sin garantias de licencia, idiomas ni evaluacion publicada. Cualquier uso en produccion deberia partir del checkpoint original de Liquid AI y verificar la licencia alli.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (backbone de 1,7B parametros, segun Liquid AI); variante cuantizada GGUF |
| Parametros totales | 1,73B (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 256K tokens (segun Liquid AI para LFM3-1.7B); no confirmado para la variante heretic |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura "tri-hybrid" de Liquid AI, presentada como una combinacion de mecanismos de atencion y estado recurrente dentro de la familia LFM3. Liquid AI describe este backbone de 1,7B parametros como compartido entre seis modelos abiertos que integran texto, vision y audio, con un enfoque en agentes locales y aplicaciones especializadas. El contexto declarado para el modelo de texto es de 256K tokens y soporta tool calling nativo.

Sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay informacion en la documentacion disponible. Tampoco se documenta la intervencion "heretic" aplicada por `saidutta69`: no se especifican los datos de ablacion, el metodo de direccion de rechazo eliminada ni las metricas de evaluacion posteriores. Las cuantizaciones de mradermacher se generaron con la herramienta de cuantizacion estandar (quantize_version 2) en modo imatrix/weighted y con el tensor de salida cuantizado, a partir del checkpoint HF del autor original.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base LFM3-1.7B.
- Tool calling / function calling nativo (segun la documentacion de Liquid AI para LFM3-1.7B).
- Orientacion a agentes locales y aplicaciones especializadas (posicionamiento oficial de la familia LFM3).
- Ventana de contexto de hasta 256K tokens en el modelo base (no verificada en la variante heretic).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking" o vision/audio: no disponible para esta variante de texto.
- Comportamiento de rechazo reducido por la intervencion "heretic" (sin detalles tecnicos publicados).

## Casos de uso

- Agentes locales en hardware de consumo: con cuantizaciones Q4_K_M o IQ4_XS, el modelo cabe en GPUs de 8-12 GB y puede ejecutar bucles de tool calling en local sin depender de la nube, aprovechando el soporte nativo de function calling del modelo base.
- Asistentes personales con contexto largo: la ventana de 256K tokens del modelo base permite resumir documentos extensos o mantener historiales de conversacion prolongados, aunque en la practica el contexto efectivo depende de la VRAM disponible para la KV cache.
- Prototipado rapido de pipelines de agentes: util para validar flujos multi-paso y esquemas de herramientas antes de migrar a modelos mayores, gracias a su tamano reducido y a la disponibilidad de cuantizaciones IQ1-IQ3 para entornos con poca memoria.
- Procesamiento de texto en el borde (edge): despliegue en portatiles o mini-PC con llama.cpp u Ollama para tareas de clasificacion, extraccion y resumen sin conexion.
- Investigacion sobre alineacion y rechazos: la variante "heretic" permite estudiar como cambia el comportamiento de negativa tras la ablacion, comparandola con el checkpoint original de Liquid AI.
- Generacion de codigo ligera y explicaciones tecnicas: adecuada para autocompletado y asistencia en editores con recursos limitados, aunque sin benchmarks publicados que respalden su calidad en HumanEval o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante. Liquid AI menciona en su comunicacion un incremento de 12,7x en benchmarks agenticos respecto a la generacion anterior de la familia, pero no se aportan cifras absolutas ni comparaciones detalladas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantizacion de 4 bits para el backbone de 1,7B (cifra citada por Liquid AI para la familia LFM3); las cuantizaciones Q4_K_M e IQ4_XS rondarian 1,1-1,3 GB, mientras que Q6_K se acercaria a 1,5-1,8 GB.
- Las cuantizaciones IQ1_S e IQ2_XXS permiten ejecucion en CPU con menos de 1 GB de RAM, a costa de degradacion de calidad.
- GPU recomendadas: RTX 3060/4060 (8-12 GB), RTX 4090, A100 y H100 para despliegues con contexto largo; cualquier GPU consumer con 8 GB o mas puede alojar el modelo con contexto moderado.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan el checkpoint en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. En una RTX 4090 se espera un throughput alto para un modelo de este tamano, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-heretic-i1-GGUF (este) | 1,73B | 256K (base) | no disponible | GGUF | Variante heretic cuantizada; sin benchmarks |
| LFM3-1.7B (Liquid AI) | 1,73B | 256K | no disponible en las fuentes | safetensors (original) | Modelo oficial de texto con tool calling |
| Qwen3-1.7B (variantes heretic de mradermacher) | 1,7B | no disponible | no disponible | GGUF | Alternativa de misma escala con cuantizaciones equivalentes |
| mradermacher/Qwen3-1.7B-Magic_heretic-i1-GGUF | 1,7B | no disponible | no disponible | GGUF | Otro ejemplo del mismo patron de cuantizacion heretic |

La comparacion se limita a tamano, formato y disponibilidad; no hay datos de rendimiento publicados para este repositorio que permitan una comparacion cuantitativa con Qwen3-1.7B u otros modelos de 1-2B.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio; no se puede asumir uso comercial sin verificar la licencia del checkpoint original de Liquid AI y del modelo base.
- La variante "heretic" reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido inapropiado, inseguro o no alineado con las politicas del modelo original.
- No hay benchmarks publicados para esta variante; el rendimiento real en tareas agenticas, codigo o matematicas es desconocido.
- El contexto efectivo de 256K del modelo base no esta confirmado para la variante heretic ni para las cuantizaciones bajas, donde la degradacion puede ser notable.
- Los idiomas soportados no estan documentados; no se puede garantizar un buen rendimiento en castellano sin evaluacion previa.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Las cuantizaciones IQ1/IQ2 pueden degradar sensiblemente la coherencia y la capacidad de seguir instrucciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validacion externa.
- Fecha de creacion del repositorio: 2026-11-08; se trata de una publicacion muy reciente sin historial de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Base-heretic-i1-GGUF
- Checkpoint original: https://huggingface.co/saidutta69/LFM3-1.7B-Base-heretic
- Documentacion de LFM3-1.7B en Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Benchmarks y contexto de LFM3-1.7B: https://llm-stats.com/models/lfm3-1.7b
- Articulo sobre el lanzamiento de la familia LFM3: https://www.techtimes.com/articles/329588/20261028/liquid-ai-releases-lfm3-six-open-weight-models-fuse-text-vision-audio-one-2b-backbone.htm
- Ejemplo de cuantizacion heretic equivalente (Qwen3-1.7B): https://huggingface.co/mradermacher/Qwen3-1.7B-heretic-i1-GGUF
