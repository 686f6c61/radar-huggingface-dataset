# kaitemoreau/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en Hugging Face bajo el identificador `kaitemoreau/DeepSeek-V4.1-Flash`. Segun la model card, se trata de un modelo con 552B parametros de backbone y capacidad de procesar contextos de hasta un millon de tokens, capaz de procesar de forma nativa imagenes y texto y de generar texto de forma autorregresiva. El repositorio declara 763.205.315.794 parametros totales segun los pesos en safetensors y un tamano de 510,3 GB.

Su propuesta tecnica central es la compresion agresiva de la cache KV: mediante una arquitectura Causal Encoder-Decoder (CED), atencion dispersa comprimida CSA2, cacheo de KV principal en FP4 y decodificacion especulativa DSpark, el modelo reduce la huella de cache KV global a unos 890 bytes por token, aproximadamente una cuarta parte de DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1. Esto lo orienta a cargas de trabajo agenticas con mucho input, donde el coste de prefill y de memoria de contexto domina.

El modelo se distribuye con licencia MIT y pesos en safetensors, con cuantizacion en 8 bits y FP8 declarada en los tags. La model card incluye una seccion de resultados de evaluacion que aparece truncada, por lo que los datos de benchmarks no estan completos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): Transformer de 40 capas (20 de encoder causal + 20 de decoder), MoE con atencion dispersa CSA2 |
| Parametros totales | 763.205.315.794 (segun safetensors); 552B de backbone segun model card; 196B adicionales en memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit y FP8 (tags del repo); cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder (CED) de 40 capas: 20 capas de encoder causal seguidas de 20 capas de decoder. La innovacion clave es que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite activar solo 8B parametros por token durante el prefill y 16B durante el decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante (SWA) que faltan replicando unicamente los ultimos *n*_win tokens, lo que evita persistir la cache SWA en SSD y reduce la huella de cache KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atencion dispersa comprimida CSA2 asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices de atencion dispersa Top-K. En el decoder, un indexador jerarquico disperso restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador en profundidad independientemente de la longitud de contexto. Combinado con el cacheo FP4 de la KV principal, la cache global queda en unos 890 bytes por token. El modelo incorpora ademas Single-Pass mHC (mezcla revisada del flujo residual con kernel Mega-mHC), memoria condicional Engram de 196B parametros con acceso disperso por lookup de tokens, y decodificacion especulativa DSpark con generacion de borradores semiautorregresiva y verificacion programada por confianza. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token.

En el plano multimodal, un encoder visual DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling pixel-unshuffle 3×3, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento. El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens, con atencion dispersa entrenada a longitud de secuencia de 64K y contexto extendido a 1M tokens a partir de 34T tokens. El postentrenamiento sigue el paradigma estandar SFT → RL → destilacion on-policy (OPD), con cambios sustanciales en el pipeline de datos: sintesis automatizada a gran escala de tareas y entornos agenticos con escalado progresivo de datos, tareas y rollouts. El modelo admite un ajuste de esfuerzo de razonamiento continuo y controlable (entero de 1 a 100) que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva y razonamiento con esfuerzo de razonamiento configurable (entero de 1 a 100).
- Procesamiento nativo de imagenes y texto (pipeline image-text-to-text), con encoder visual DeepSeek-ViT integrado desde el preentrenamiento.
- Capacidades agenticas y de razonamiento multi-paso, entrenado con sintesis automatizada de tareas y entornos agenticos.
- Soporte de contextos de hasta 1M tokens, adecuado para cargas con mucho input.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Memoria condicional Engram de 196B parametros con acceso disperso por lookup de tokens.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 1M tokens de contexto y un coste de prefill reducido (8B parametros activos por token), el modelo puede ingerir bases de codigo o manuales completos y responder preguntas sobre ellos en una sola pasada.
- Agentes autonomos multi-paso: el entrenamiento con entornos agenticos sintetizados y el ajuste de esfuerzo de razonamiento permiten desplegar agentes que planifican y ejecutan tareas con control del coste por consulta.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre diagramas, capturas o paginas escaneadas junto al texto asociado.
- Asistentes conversacionales de contexto largo: la cache KV de 890 bytes por token hace viable mantener sesiones multi-turno muy largas sin agotar la memoria del servidor.
- Pipelines de revision de codigo o analisis de incidencias: la ventana de 1M tokens permite incluir historiales de commits, logs y ficheros relacionados en una unica peticion.
- Investigacion sobre compresion de cache KV: la arquitectura CED, CSA2 y el cacheo FP4 son un caso de estudio replicable para equipos que investigan eficiencia de inferencia en modelos MoE multimodales.
- Despliegue en infraestructura propia con licencia permisiva: la licencia MIT facilita la integracion en productos comerciales sin restricciones de uso derivadas de la licencia.

## Benchmarks y rendimiento

La model card incluye una seccion de resultados de evaluacion ("Evaluation Results", "Base Model") que aparece truncada en la informacion proporcionada, sin cifras concretas de MMLU, HumanEval, GSM8K ni de los benchmarks agenticos referenciados en la figura 1. No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio ocupa 510,3 GB en safetensors; con cuantizacion de 8 bits el peso ronda los 380 GB, y en FP8 un valor similar. La cache KV es comparativamente pequena (890 bytes por token), pero el peso del modelo exige agregacion de memoria entre varias GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo, el despliegue requiere nodos multi-GPU de clase centro de datos (A100, H100 o equivalentes con suficiente memoria agregada).
- Cabe en GPU de consumo: no, el tamano de pesos y el numero de parametros totales lo impiden en configuraciones de una sola GPU de consumo.
- Opciones de despliegue: la libreria declarada es transformers; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card menciona mejoras de eficiencia (8B parametros activos en prefill, 16B en decode, cache KV de 890 bytes por token) pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 552B backbone (763B totales en safetensors) | 1M tokens | 890 bytes | MIT | Hugging Face |
| DeepSeek-V4-Flash | no disponible | no disponible | ~4x mayor que V4.1-Flash (segun model card) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | ~437x mayor que V4.1-Flash (segun model card) | no disponible | no disponible |

Los datos de parametros, contexto y licencia de DeepSeek-V4-Flash y DeepSeek-V1 no estan disponibles en la informacion proporcionada; solo se conocen las ratios de cache KV indicadas en la model card.

## Limitaciones y advertencias

- La seccion de benchmarks de la model card esta truncada, por lo que no es posible verificar el rendimiento real frente a modelos comparables.
- No se especifican los idiomas soportados; el comportamiento multilingue es desconocido.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de APIs estructuradas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del repositorio (`kaitemoreau`) no coincide con la organizacion oficial `deepseek-ai` referenciada en la model card; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.
- El elevado numero de parametros totales (763B en safetensors) implica requisitos de hardware muy altos y costes de despliegue significativos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La licencia MIT permite uso comercial, pero al no haber validacion externa de los pesos, el riesgo de calidad recae enteramente en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitemoreau/DeepSeek-V4.1-Flash
- Pagina oficial de DeepSeek: https://www.deepseek.com/
- Chat DeepSeek V4.1: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
- Technical Report (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
