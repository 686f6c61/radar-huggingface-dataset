# JonusNattapong/LFM3-Omni-2B-abliterated

## Resumen

LFM3-Omni-2B-abliterated es una edicion a nivel de pesos del modelo multimodal LiquidAI/LFM3-Omni-2B, publicado por el usuario JonusNattapong. El modelo base, desarrollado por Liquid AI, es un modelo "any-to-any" de 2.166.928.384 parametros que acepta texto, imagen y video como entrada y produce texto y voz a 24 kHz como salida, sobre un backbone hibrido decoder-only que combina convoluciones cortas con atencion deslizante y atencion completa.

La modificacion aplicada es una "abliteracion": se estima una direccion de rechazo a partir de la diferencia media de estados ocultos entre prompts daninos y benignos en el ultimo token del prompt, y se proyecta ortogonalmente fuera de las matrices de pesos que escriben en el flujo residual del backbone de texto. Solo se modifican esas matrices; la arquitectura, el tokenizador, la plantilla de chat y el codigo remoto permanecen intactos. No es un fine-tuning por gradiente, sino una edicion directa de pesos.

El resultado es un modelo que reduce su comportamiento de rechazo y puede producir contenido que el modelo base deniega. Se publica explicitamente para investigacion de seguridad, red-teaming y estudio de mecanismos de rechazo. Es relevante ahora porque permite estudiar direcciones de rechazo en arquitecturas hibridas conv/atencion, un terreno menos explorado que los transformers puros, y porque el modelo base aporta capacidades omni (voz, vision, video) en un tamano de 2B apto para edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only hibrida: 24 capas (13 convolucion, 6 atencion completa, 5 atencion de ventana deslizante), hidden size 2.048, FFN intermedio 7.680, GQA con 16 cabezas de query y 4 de key-value en capas de atencion completa |
| Parametros totales | 2.166.928.384 (2,17B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Texto: EN, TH, AR, ZH, FR, DE, IT, JA, KO, PT, ES, VI, ID, HI, RU, PL, DA, EL, FI, HE, NL, SV, TR. Voz: locales heredados del modelo base |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | Safetensors (repo de 8,7 GB), con codigo remoto personalizado (custom_code) |

## Arquitectura y entrenamiento

El backbone es un modelo decoder-only hibrido de tipo LFM3 con 24 capas organizadas en tres regimenes: 13 capas de convolucion corta, 6 capas de atencion completa y 5 capas de atencion de ventana deslizante. Emplea atencion con query agrupada (GQA) de 16 cabezas de query y 4 de key-value en las capas de atencion completa, con un tamano oculto de 2.048 y una capa feed-forward de 7.680 de dimension intermedia. El vocabulario de texto es de 128k tokens. El modelo es multimodal: procesa texto, imagen y video, y genera texto y voz a 24 kHz. Es un modelo no razonador: `enable_thinking=True` no esta soportado.

El proceso de abliteracion no es un entrenamiento por gradiente. Se estima una direccion `r` como la diferencia media de estados ocultos entre prompts daninos y benignos en el ultimo token del prompt, y se proyecta ortogonalmente fuera de las matrices de pesos que escriben en el flujo residual del backbone de texto. La proyeccion solo elimino parcialmente la senal medida: se retuvo entre el 36 % y el 60 % de la norma de la direccion por capa. Los prompts de abliteracion fueron exclusivamente en ingles, por lo que la eliminacion de rechazo solo esta validada en ese idioma. No se dispone de datos sobre el numero de tokens de entrenamiento del modelo base ni sobre su composicion de dataset o uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en 17 idiomas de texto.
- Entrada multimodal: imagen y video, ademas de texto.
- Salida de voz a 24 kHz (speech-to-speech), heredada del modelo base.
- Capacidad de reduccion de rechazo en ingles: responde a peticiones que el modelo base deniega.
- No soporta modo de razonamiento (`enable_thinking=True` no esta disponible).
- No validado para uso agentico con tool calling ni para recuperacion en contexto largo.
- No validado para comportamiento de rechazo en idiomas distintos del ingles.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo sirve para generar datos de ataque y estudiar que tipos de peticiones siguen siendo rechazadas y cuales no, con revision humana obligatoria.
- Estudio de mecanismos de rechazo en arquitecturas hibridas: permite analizar como se distribuye la direccion de rechazo en capas de convolucion frente a capas de atencion, algo poco documentado en transformers puros.
- Generacion de datos para clasificadores de seguridad externos: las respuestas del modelo pueden usarse como ejemplos negativos para entrenar filtros de moderacion, siempre con supervision humana.
- Analisis de degradacion de capacidades tras edicion de pesos: comparar el rendimiento en prompts benignos frente al modelo base para medir el coste de la proyeccion (36-60 % de la norma retenida por capa).
- Experimentacion multimodal en edge: el tamano de 2,17B y el backbone hibrido permiten probar entrada de imagen/video y salida de voz en hardware limitado, aunque la abliteracion solo afecta al backbone de texto.
- Evaluacion de robustez multilingue del rechazo: comprobar si la reduccion de rechazo observada en ingles se transfiere a los otros 16 idiomas de texto, dado que los prompts de abliteracion fueron solo en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion, pero no se han proporcionado cifras numericas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad cuantitativas. La unica metrica concreta disponible es que 2 de 6 prompts de seguridad siguen siendo rechazados tras la abliteracion, y que la proyeccion retuvo entre el 36 % y el 60 % de la norma de la direccion de rechazo por capa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repo pesa 8,7 GB en safetensors, lo que da una referencia del orden de magnitud en precision completa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: no disponible en la informacion proporcionada; el tamano de 2,17B sugiere que es viable en GPUs consumer, pero no se confirma en la documentacion.
- Opciones de despliegue: la model card solo documenta `transformers` (version >= 5.0) con `AutoModelForImageTextToText` y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated | 2,17B | 32K | Texto, imagen, video, voz | LFM Open License v1.0 | Disponible en Hugging Face |
| LiquidAI/LFM3-Omni-2B | 2,17B | 32K | Texto, imagen, video, voz | LFM Open License v1.0 | Disponible en Hugging Face (modelo base) |
| Alternativas de 2B omni abliteradas | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa posible es con el modelo base, del que este deriva por edicion de pesos. No se dispone de informacion sobre otros modelos de la misma categoria (2B omni abliterados) para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- Riesgo de cumplimiento: el modelo puede responder a peticiones que el base rechaza. En evaluacion produjo una plantilla de correo de phishing, codigo de ransomware ejecutable e instrucciones para desactivar camaras.
- Abliteracion incompleta: el rechazo se reduce, no se elimina. 2 de 6 prompts de seguridad siguen siendo rechazados y persisten giros parciales del tipo "However, ...".
- Compromiso de capacidad: la proyeccion solo elimino parcialmente la senal (36-60 % de la norma de la direccion retenida por capa); los prompts benignos parecieron intactos segun la model card, pero el dato esta truncado en la informacion disponible.
- Validacion solo en ingles: los prompts de abliteracion fueron exclusivamente en ingles, por lo que el comportamiento de rechazo en los otros 16 idiomas no esta validado.
- No validado para uso agentico con tool calling, recuperacion en contexto largo ni comportamiento de rechazo multilingue.
- Uso fuera de alcance: no debe usarse como filtro de seguridad ni componente de moderacion, ni para producir contenido ilegal, danino o enganoso, ni para eludir leyes o politicas de plataforma, ni en productos publicos usados por menores sin una capa de seguridad independiente, ni para decisiones automatizadas con consecuencias legales, medicas o financieras.
- Restricciones de licencia: la LFM Open License v1.0 del modelo base se aplica a este derivado; conviene revisar sus terminos para uso comercial.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos en la informacion disponible, pero al ser un modelo no razonador y con abliteracion parcial, el riesgo de respuestas erroneas o inapropiadas es relevante en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentacion del modelo base: https://docs.liquid.ai/lfm
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Grafo de arquitectura (hfviewer): https://hfviewer.com/JonusNattapong/LFM3-Omni-2B-abliterated
- Paper de referencia (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Perfil del autor: https://huggingface.co/JonusNattapong
- Sitio de Liquid AI: https://www.liquid.ai/
