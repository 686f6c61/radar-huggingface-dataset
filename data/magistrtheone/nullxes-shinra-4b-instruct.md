# MagistrTheOne/NULLXES-SHINRA-4B-INSTRUCT

## Resumen

NULLXES SHINRA-4B-INSTRUCT es un checkpoint de inicializacion (pesos aleatorios) de un Transformer decoder-only de 3.926 millones de parametros desarrollado por NULLXES LLC (autor en HuggingFace: MagistrTheOne). Segun su model card, se trata de una implementacion propia, no de un fine-tune de un modelo fundacional existente, con tokenizer, pipeline de entrenamiento y procesamiento de datos tambien desarrollados internamente. El checkpoint publicado corresponde a la fase de "Training Initialization": el autor confirma que se han completado la implementacion del modelo, la configuracion, la inicializacion aleatoria, la validacion de parametros y una pasada de forward/backward con un paso de optimizador en BF16 sobre una NVIDIA A100 SXM4 de 80 GB.

Es importante subrayarlo con claridad: **el repositorio no contiene un modelo entrenado**. El tokenizer aun no se ha entrenado (la propia model card lista "Tokenizer training" como etapa siguiente), no se ha procesado corpus, no ha habido preentrenamiento, ni instruction tuning, ni alineamiento. Por tanto, el checkpoint no genera lenguaje coherente: produce salidas practicamente aleatorias a partir de los pesos inicializados. El nombre "INSTRUCT" del repositorio no se corresponde con ningun proceso de instruccion ejecutado.

La relevancia de esta ficha es, por tanto, arquitectonica y de seguimiento de proyecto mas que funcional. La configuracion declarada (3.926B parametros, 32 capas, hidden size 3072, vocabulario de 131072 tokens, contexto de 32768 tokens, GQA 24Q/8KV, SwiGLU, RMSNorm con QK-Norm y RoPE) es coherente con un diseno de tipo Llama/Qwen moderno. No hay resultados de benchmarks, ni dataset publicado, ni fecha de finalizacion de entrenamiento anunciada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Custom Decoder-only Transformer (atencion GQA, SwiGLU, RMSNorm + QK-Norm, RoPE) |
| Parametros totales | 3.926.076.416 (3,926B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en BF16; no hay versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (el autor no declara idiomas; el tokenizer no esta entrenado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con `custom_code` / clases Auto propias de Transformers |
| Vocabulario | 131072 tokens |
| Capas | 32 |
| Hidden size | 3072 |
| Atencion | GQA 24 cabezas de consulta / 8 de clave-valor, head dimension 128 |
| Precision de entrenamiento/validacion | BF16 |
| Estado del checkpoint | Inicializacion aleatoria validada (sin entrenamiento) |
| Tamano del repositorio | 7,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de implementacion propia, sin atencion lineal ni componentes de estado (SSM) declarados. Usa grouped-query attention con 24 cabezas de consulta y 8 de clave-valor (ratio 3:1), head dimension de 128, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm complementada con QK-Norm (normalizacion aplicada a consultas y claves antes del producto escalar, tecnica habitual para estabilizar el entrenamiento en precision BF16) y codificacion posicional rotatoria RoPE. La pila tiene 32 capas con hidden size 3072 y un vocabulario de 131072 entradas, disenado para tokenizacion por subpalabras de granularidad fina. El autor afirma que tanto el tokenizer como el pipeline de datos son desarrollados desde cero, no heredados de otro modelo.

Respecto al entrenamiento, **no se ha ejecutado ninguno**. La model card enumera como completadas unicamente tareas de infraestructura: implementacion del modelo, configuracion, inicializacion aleatoria, validacion de parametros, validacion en A100 con BF16, forward pass, backward pass, paso de optimizador y serializacion del checkpoint. Las etapas pendientes listadas son, en orden: entrenamiento del tokenizer, preparacion del corpus, pipeline de dataset, piloto de preentrenamiento, instruction tuning y alineamiento. No se especifica el numero de tokens previsto, la composicion del dataset, ni si se aplicaran RLHF, DPO u otras tecnicas de alineamiento. El autor enmarca el modelo dentro de un "NULLXES Intelligence Stack" con cuatro componentes anunciados (SHINRA para lenguaje, RAIDEN para razonamiento, CERBER para vision y AION para inteligencia encarnada), de los cuales solo SHINRA tiene repositorio publico.

## Capacidades

- Generacion de texto: **no operativa en el estado actual**. Los pesos son aleatorios y la salida no es lenguaje coherente.
- Razonamiento, matematicas y codigo: no disponible; no hay entrenamiento ni evaluacion.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni formato de herramientas publicado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el tokenizer aun no ha sido entrenado.
- Capacidades multimodales (vision, audio): no disponibles en SHINRA; el autor reserva vision para el componente CERBER, sin repositorio.
- Modo "thinking": no disponible.
- Infraestructura disponible: forward pass y backward pass verificados en BF16 sobre A100 SXM4 80 GB, con serializacion de checkpoint funcional.

## Casos de uso

Ninguno de los siguientes casos es aplicable al checkpoint publicado, porque no ha sido entrenado. Se enumeran como escenarios de uso previstos para la arquitectura una vez completadas las etapas de preentrenamiento y ajuste, y como referencia para evaluar si el proyecto merece seguimiento.

- Procesamiento de documentos largos: la ventana de 32768 tokens permite ingerir informes, contratos o articulos cientificos completos en una sola pasada sin chunking ni recuperacion externa, algo util para resumen extractivo y extraccion de entidades en entornos documentales.
- Asistentes conversacionales multi-turno: con 32 capas y GQA 24Q/8KV, el coste de cache KV por token es contenido, lo que abarata mantener historiales largos en memoria durante sesiones de chat prolongadas.
- Generacion de codigo asistida: un vocabulario de 131072 tokens reduce el numero de tokens por linea de codigo respecto a vocabularios de 32k, lo que mejora la eficiencia efectiva de contexto en repositorios con identificadores largos.
- Despliegue en infraestructura propia: la licencia Apache 2.0 y el formato safetensors facilitan el uso comercial y la integracion en pipelines internos sin negociacion de licencia.
- Servicio de inferencia de alto rendimiento: el diseno GQA es compatible con kernels optimizados tipo FlashAttention y con servidores como vLLM o TGI, pensados para batching continuo.
- Investigacion en arquitecturas propias: sirve como banco de pruebas para validar decisiones de diseno (QK-Norm, vocabulario grande, RoPE) sin depender de pesos de terceros.
- Ajuste fino por dominio: si el preentrenamiento se completa, el tamano de 3,9B permite fine-tuning con LoRA en una sola GPU de 80 GB o en configuraciones multi-GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K, ni ninguna otra metrica, y el estado del checkpoint (inicializacion aleatoria) hace que cualquier evaluacion careciese de sentido. Tampoco hay datos de latencia o throughput publicados.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 7,9 GB de pesos mas overhead. Con el cache KV a contexto completo (32768 tokens) hay que sumar unos 4 GB adicionales, calculados como 8 cabezas KV x 128 de dimension x 2 (K y V) x 32 capas x 2 bytes x 32768 tokens. Presupuesto realista: 13-16 GB.
- VRAM en cuantizacion INT8/FP8: del orden de 4 GB de pesos, mas cache KV (que en BF16 seguiria siendo ~4 GB a contexto completo). No existen ficheros cuantizados publicados; habria que generarlos.
- VRAM en cuantizacion de 4 bits: del orden de 2-2,5 GB de pesos, si se llegasen a producir ficheros GGUF.
- GPU recomendadas: el autor solo ha validado en NVIDIA A100 SXM4 80 GB. Para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubririan BF16 a contexto completo con margen; una RTX 4080 (16 GB) iria justa en BF16 y comoda solo con cuantizacion o contexto reducido.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas en BF16, y en 8-12 GB con cuantizacion de 4-8 bits (pendiente de generar).
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la unica via garantizada, dado que el modelo usa clases Auto personalizadas. vLLM y TGI requeririan que la implementacion custom sea compatible con sus interfaces. llama.cpp, Ollama y LM Studio no soportan la arquitectura sin que alguien implemente y registre el grafo correspondiente; no hay convertidor oficial disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion es asimetrica porque SHINRA-4B no ha sido entrenado. Los modelos de la tabla son alternativas reales de tamano equivalente con pesos entrenados y publicados.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| NULLXES SHINRA-4B-INSTRUCT | 3,926B | 32768 | Apache 2.0 | Checkpoint aleatorio, sin entrenar |
| Llama 3.2 3B | 3,21B | 128000 | Llama 3.2 Community License | Entrenado y alineado |
| Qwen2.5 3B | 3,09B | 32768 | Apache 2.0 (segun variante) | Entrenado y alineado |
| Phi-3.5-mini-instruct | 3,8B | 128000 | MIT | Entrenado y alineado |
| Gemma 2 4B | 4B | 8192 | Gemma Terms of Use | Entrenado y alineado |

Frente a estas alternativas, SHINRA solo ofrece ventaja en longitud de contexto respecto a Gemma 2 y en permisividad de licencia respecto a Llama 3.2 y Gemma 2. En todo lo demas (rendimiento, disponibilidad de cuantizaciones, soporte en runtimes de inferencia, ecosistema de herramientas) queda por detras mientras no se complete el entrenamiento. Los datos de las alternativas proceden de sus especificaciones publicas; no se incluyen cifras de benchmarks porque la informacion proporcionada no las contiene para SHINRA y una comparacion de rendimiento careceria de base.

## Limitaciones y advertencias

- **El modelo no es funcional.** Es un checkpoint con pesos aleatorios. Cualquier uso en produccion o en evaluacion producira salidas sin sentido. No debe confundirse con un modelo de instrucciones pese al sufijo "INSTRUCT" del repositorio.
- **Tokenizer sin entrenar.** No existe vocabulario efectivo, de modo que la tokenizacion de entradas reales no esta definida.
- **Requiere codigo remoto.** La etiqueta `custom_code` implica que cargar el modelo exige `trust_remote_code=True`, lo que ejecuta codigo Python del autor en la maquina local. Es un riesgo de seguridad que debe evaluarse antes de usarlo.
- **Sin dataset ni receta de entrenamiento publicados.** No se puede auditar la procedencia de datos futuros ni anticipar sesgos, contaminacion o cumplimiento de derechos de autor.
- **Sin benchmarks ni evaluaciones de seguridad.** No hay mediciones de alucinacion, toxicidad, sesgo de genero, raza o religion, ni evaluaciones multilingues.
- **Compatibilidad limitada de runtimes.** Al no existir arquitectura registrada en llama.cpp, vLLM o TGI ni ficheros GGUF, el despliegue eficiente requiere trabajo adicional de ingenieria.
- **Licencia Apache 2.0.** Permite uso comercial sin restricciones adicionales, pero solo cubre el artefacto publicado; el autor no ofrece garantias de ningun tipo.
- **Proyecto en fase temprana.** Cero descargas y cero likes en el momento del analisis, repositorio creado y actualizado en septiembre de 2026, y un roadmap de entrenamiento de seis etapas del que ninguna se ha iniciado. El riesgo de abandono del proyecto es alto.
- **La busqueda web no aporto informacion relevante.** Los resultados devueltos trataban sobre cronica local de Fermo, un club de futbol italiano, un videojuego y un centro educativo; ninguno guarda relacion con el modelo. No se ha podido verificar de forma independiente ninguna afirmacion del autor.

## Enlaces

- HuggingFace: https://huggingface.co/MagistrTheOne/NULLXES-SHINRA-4B-INSTRUCT
- GitHub del proyecto: https://github.com/MagistrTheOne/NULLXES-SHINRA-4B-INSTRUCT
- Paper, blog tecnico, demo o documentacion adicional: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados obtenidos no guardan relacion con el modelo)
