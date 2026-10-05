# btbtyler09/Muse-Glimmer-30B-GPTQ-4bit

## Resumen

Muse-Glimmer-30B-GPTQ-4bit es una cuantizacion GPTQ de 4 bits del modelo multimodal meta-models/Muse-Glimmer-30B, un modelo denso de 29.776.626.688 parametros que procesa texto e imagenes (pipeline `image-text-to-text`). La publica el usuario btbtyler09 y no es un entrenamiento nuevo: se trata de un checkpoint derivado que reduce el peso del modelo original en BF16 (59,6 GB) hasta unos 23 GB, manteniendo intactas en BF16 la torre de vision, el adaptador y la proyeccion visual, los embeddings, las normas y el LM head. Solo el decodificador de texto, compuesto por 52 capas, se cuantiza a INT4.

El interes practico de esta ficha esta en que permite desplegar un modelo de casi 30.000 millones de parametros con vision en hardware mucho mas asequible que la version BF16, sin tocar la parte multimodal. La cuantizacion usa GPTQ con W4, group size 32, simetria activada y `desc_act` desactivado, con un total de 416 modulos cuantizados. El autor verifica el funcionamiento con vLLM en configuracion de tensor parallel 4 y una longitud de contexto de servicio de 65.536 tokens, e incluye resultados cualitativos de aritmetica basica, lectura de imagen y tool calling.

El modelo base pertenece a una familia poco documentada publicamente y la informacion disponible se limita a la model card del autor de la cuantizacion: no hay datos deidiomas soportados, no hay benchmarks publicados y no se ha medido la perplejidad frente al original en BF16. La licencia es Apache-2.0, heredada del modelo base, con una politica de uso (`USAGE_POLICY.md`) que se incluye y aplica al checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (decodificador de texto de 52 capas + torre de vision con adaptador y proyeccion); detalles internos de atencion (GQA/MHA) no disponibles |
| Parametros totales | 29.776.626.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens en la configuracion de referencia de vLLM; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | GPTQ 4 bits (W4, group size 32, simetrica, `desc_act=False`, `true_sequential=True`, mse 2.0, damp 0.05, fallback RTN con umbral de cobertura de calibracion del 0,5 por ciento) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base; se incluye y aplica `USAGE_POLICY.md`) |
| Formato de pesos | Safetensors (GPTQ), libreria `transformers`; repo de 23,8 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un modelo entrenado desde cero, por lo que no hay datos de preentrenamiento, ajuste fino ni RLHF/DPO atribuibles a esta publicacion. El modelo base es meta-models/Muse-Glimmer-30B (revision `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`), descrito por el autor como un modelo denso de 29,8B de texto y vision con un decodificador de texto de 52 capas.

La innovacion tecnica relevante esta en el reparto de precision: se cuantizan a INT4 GPTQ las proyecciones `self_attn.{q,k,v,gate,o}_proj` (incluida la puerta de salida de atencion) y las proyecciones `mlp.{gate,up,down}_proj` de las 52 capas, mientras que la torre de vision, el adaptador y la proyeccion visual, los embeddings, las normas y el LM head permanecen en BF16. En total, 416 modulos cuantizados. La calibracion se hizo con 2048 muestras mezclando evol-codealpaca-v1 (codigo) y C4 (ingles general), distribuidas uniformemente en longitudes de 256 a 2048 tokens y pasadas como un unico turno de usuario por la plantilla de chat del modelo. Se uso GPTQModel v7.3.5 con la definicion `muse_glimmer`; el script `quantize.py` se incluye en el repositorio.

El modelo incorpora un canal de razonamiento controlable mediante `Reasoning strength: low | medium | high | xhigh` (por defecto `high`), configurable en el system prompt o con `chat_template_kwargs={"reasoning_strength": "low"}`. No existe un interruptor de encendido/apagado del modo pensamiento. El canal de razonamiento suele empezar reformulando la peticion del usuario, comportamiento que el autor atribuye al modelo original y no a la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia y canal de razonamiento de intensidad ajustable.
- Razonamiento con esfuerzo configurable (`low`, `medium`, `high`, `xhigh`), util para modular latencia frente a profundidad de razonamiento.
- Vision: procesamiento de imagenes junto a texto (pipeline `image-text-to-text`); el autor verifica la lectura correcta de la portada de un periodico (cabecera, fecha impresa y titular principal).
- Tool calling / function calling: compatible con `--enable-auto-tool-choice --tool-call-parser muse_glimmer` en vLLM; verificado con una peticion a una herramienta meteorologica que devolvio una llamada `get_weather` parseada con argumentos correctos.
- Razonamiento multi-paso y uso como agente, gracias al parser de razonamiento especifico (`--reasoning-parser muse_glimmer`) y al soporte de tool calling.
- Aritmetica basica: verificada con 17 x 23 = 391.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada con entradas visuales: el modelo puede gestionar conversaciones multi-turno y ademas interpretar capturas, facturas o fotografias de producto enviadas por el usuario, manteniendo el contexto de la conversacion en una ventana de servicio de hasta 65.536 tokens configurada en vLLM.
- Extraccion de datos de documentos escaneados: la torre de vision se mantiene en BF16, por lo que la lectura de texto impreso (cabeceras, fechas, titulares) conserva la precision del modelo original; util para digitalizar formularios o recortes de prensa.
- Agentes con herramientas en produccion: al soportar tool calling con parser dedicado y razonamiento multi-paso, encaja en flujos donde el modelo debe decidir que API invocar (clima, calendario, bases de datos internas) y devolver argumentos estructurados.
- Asistencia a desarrolladores: la calibracion GPTQ incluye el dataset de codigo evol-codealpaca-v1, lo que orienta el checkpoint hacia tareas de generacion y explicacion de codigo; puede integrarse en revision de parches o generacion de tests dentro de pipelines.
- Despliegue en infraestructura limitada de GPU: con 23 GB de pesos en INT4 frente a los 59,6 GB en BF16, permite servir un modelo de 29,8B multimodal en nodos de 4 GPU de gama media en lugar de exigir hardware de 80 GB por tarjeta.
- Razonamiento con control de coste: el parametro `reasoning_strength` permite usar `low` en tareas triviales de clasificacion o enrutado y `xhigh` en problemas analiticos, ajustando el consumo de tokens de salida segun el caso.
- Procesamiento por lotes de contenido mixto texto-imagen: indexado de catalogos, moderacion de imagenes con descripcion textual o generacion de alt-text a partir de material visual.
- Prototipado e investigacion sobre cuantizacion: al incluir el script `quantize.py` y la configuracion exacta de GPTQ, sirve como referencia reproducible para estudiar el impacto de la cuantizacion W4 en un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la perplejidad y la fidelidad frente al original en BF16 no se han medido todavia.

Unicas comprobaciones funcionales reportadas (servidas con vLLM, tensor parallel 4, `--tool-call-parser muse_glimmer --reasoning-parser muse_glimmer`):

| Prueba | Resultado reportado |
|---|---|
| Aritmetica de texto | Correcto: 17 x 23 = 391 |
| Comprension de imagen | Correcto: lectura de cabecera, fecha impresa y titular de una portada de periodico |
| Tool calling | Correcto: llamada `get_weather` parseada con los argumentos adecuados |
| Estabilidad del servidor | Sin fallos reportados |
| Perplejidad frente a BF16 | No medida |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No disponibles |

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 23 GB (checkpoint de 23 GB, repositorio de 23,8 GB). El original en BF16 ocupa 59,6 GB.
- VRAM total: a los 23 GB de pesos hay que sumar la cache KV y los buffers de activaciones. El numero de cabezas y la configuracion de atencion del modelo base no estan disponibles, por lo que no se puede estimar la cache KV por token.
- Configuracion de referencia verificada: vLLM con `--tensor-parallel-size 4` y `--max-model-len 65536`, es decir, 4 GPU en paralelo para servir el contexto completo.
- GPU de centro de datos: A100 (40 GB o 80 GB), H100, L40S o equivalentes. Con TP=4 caben en tarjetas de 24 GB.
- GPU de consumo: los pesos caben en una sola RTX 3090 o RTX 4090 de 24 GB, pero el margen para cache KV es minimo; con contexto largo o lotes concurrentes es recomendable repartir en 2 GPU de 24 GB o mas.
- Opciones de despliegue: vLLM (verificado por el autor, con parsers de tool calling y razonamiento), `transformers` (libreria declarada en el repositorio) y TGI como alternativa habitual para GPTQ. llama.cpp y Ollama no consumen GPTQ directamente porque requieren GGUF; no se ha publicado una version GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| btbtyler09/Muse-Glimmer-30B-GPTQ-4bit | 29,78B (denso, multimodal) | Hasta 65.536 tokens en configuracion vLLM | INT4 GPTQ (vision y embeddings en BF16) | ~23 GB | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| meta-models/Muse-Glimmer-30B (modelo base) | 29,78B (denso, multimodal) | No disponible | BF16 | 59,6 GB | Apache-2.0 con `USAGE_POLICY.md` | HuggingFace |
| Alternativas de la misma categoria (otros modelos multimodales densos de ~30B) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de ninguno de los modelos comparados, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar nada sobre la calidad del modelo frente a alternativas de su tamano. El propio autor indica que la perplejidad y la fidelidad respecto al BF16 no se han medido.
- Riesgo de degradacion por cuantizacion: la cuantizacion W4 con `desc_act=False` puede afectar a tareas sensibles a la precision numerica (matematicas complejas, generacion de codigo largo). El autor solo ha verificado cualitativamente aritmetica basica.
- Calibracion limitada en idioma: el conjunto de calibracion combina codigo en ingles y C4 (ingles general). El comportamiento en castellano no esta verificado.
- Idiomas soportados: no disponibles. No se debe asumir cobertura multilingue sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad ni de tasas de alucinacion.
- Sin interruptor de modo pensamiento: el razonamiento se controla solo por niveles (`low`, `medium`, `high`, `xhigh`), con `high` por defecto. El canal de razonamiento abre reformulando la peticion del usuario, lo que incrementa el consumo de tokens de salida.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base incluye un `USAGE_POLICY.md` que se aplica a este checkpoint y que debe revisarse antes de desplegar en produccion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-05, dato que conviene verificar.
- Componentes multimodales en BF16: la torre de vision y el adaptador no estan cuantizados, asi que el ahorro de memoria se concentra en el decodificador de texto; el reparto de pesos en GPU debe planificarse en consecuencia.
- Dependencia de la libreria GPTQModel v7.3.5 y de la definicion `muse_glimmer`: es necesario un entorno con esa version o superior para reproducir la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/btbtyler09/Muse-Glimmer-30B-GPTQ-4bit
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Revision del modelo base usada en la cuantizacion: `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`
- GPTQModel: https://github.com/modelcloud/gptqmodel
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada (los resultados de busqueda web no contienen referencias al modelo)
