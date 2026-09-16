# geodesic-research/hybrid-moe-30b-a3b-base

## Resumen

hybrid-moe-30b-a3b-base es un modelo de lenguaje base desarrollado por geodesic-research que combina en una misma pila capas de espacio de estados (Mamba2), capas de atencion y capas de mezcla de expertos (MoE). Con 31.577.937.344 parametros totales (31,6 B) y aproximadamente 3 B de parametros activos por token, la arquitectura esta disenada para mantener la capacidad de un modelo de 30 B con un coste de computo por token cercano al de un modelo denso de 3 B. El modelo se entreno desde cero, partiendo de inicializacion aleatoria, sobre 553.765.568.512 tokens (553,8 B) y en precision BF16.

El entrenamiento de contexto se hizo en dos fases: primero a 8.192 tokens y despues una continuacion a 32.768 tokens, que es la ventana operativa declarada. El modelo es monolingue en ingles (`en`) y se distribuye unicamente en pesos safetensors BF16, con un repositorio de 63,2 GB. Se identifica explicitamente como modelo base, sin ajuste por instrucciones ni optimizacion de preferencias, por lo que esta orientado a completado de texto y no a conversacion.

Su relevancia actual es doble. Por un lado, es un ejemplo de arquitectura hibrida SSM + atencion + MoE, una familia que busca reducir el coste de inferencia en contextos largos frente a los transformers densos. Por otro, al estar entrenado desde cero y publicarse como base, sirve como punto de partida para ajuste fino, para investigacion sobre arquitecturas hibridas y para destilacion. En el momento de recopilar los datos, el repositorio no tenia descargas ni valoraciones, la licencia no estaba declarada y no se habian publicado evaluaciones, lo que limita cualquier valoracion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba2 (SSM) + atencion + mezcla de expertos (MoE); `model_type: nemotron_h` |
| Parametros totales | 31.577.937.344 (31,6 B) |
| Parametros activos | ~3 B por token (MoE) |
| Longitud de contexto | 32.768 tokens (entrenado primero a 8.192 y continuado a 32.768) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16; no hay cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Numero de capas | 52 |
| Tamano oculto (hidden size) | 2.688 |
| Inicializacion | aleatoria (entrenado desde cero) |
| Tokens vistos en entrenamiento | 553.765.568.512 (553,8 B) |
| Precision declarada | BF16 |
| Tamano del repositorio | 63,2 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (ultima actualizacion, 16 de septiembre de 2026) |
| Descargas / valoraciones | 0 / 0 en el momento de la recopilacion |

## Arquitectura y entrenamiento

La arquitectura es hibrida y se corresponde con `model_type: nemotron_h`. La pila tiene 52 capas y un tamano oculto de 2.688, e intercala tres tipos de capa: capas Mamba2 (modelo de espacio de estados con dinamica selectiva), capas de atencion y capas de mezcla de expertos. Este diseno busca combinar la eficiencia de las SSM en el procesamiento secuencial y en contextos largos con la capacidad de recuperacion precisa de la atencion, mientras que las capas MoE incrementan el numero total de parametros sin escalar proporcionalmente el computo por token. El modelo declara 31,6 B de parametros totales y unos 3 B activos por token, lo que situa su coste de computo en el rango de un modelo denso de 3 B. No se especifican en la informacion disponible el numero de expertos, el numero de expertos activados por token, la estrategia de enrutamiento, la configuracion exacta de atencion (numero de cabezas, uso de GQA/MQA) ni la distribucion de capas entre los tres tipos.

El entrenamiento parte de inicializacion aleatoria, sin destilacion ni inicializacion desde otro checkpoint, y consume 553,8 B tokens en BF16. La longitud de contexto se amplio en dos etapas: una primera fase a 8.192 tokens y una continuacion a 32.768. No hay informacion sobre la composicion del dataset, el tokenizador, el vocabulario, el numero de tokens por idioma ni sobre el uso de tecnicas de alineacion. En concreto, no se aplico ajuste por instrucciones ni optimizacion de preferencias (RLHF, DPO u otras), tal como indica la propia model card. Tampoco se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal mas alla de Mamba2, o tecnicas de eficiencia en el entrenamiento (por ejemplo, precision mixta mas alla de BF16 declarado).

## Capacidades

- Generacion de texto por continuacion (completion): el modelo es un base model, por lo que su modo natural de uso es completar prefijos de texto, no seguir instrucciones.
- Razonamiento, matematicas y codigo: no hay evaluaciones publicadas que confirmen el nivel en estas tareas; no disponible.
- Contexto de hasta 32.768 tokens, con entrenamiento en dos fases (8.192 y 32.768).
- Eficiencia computacional: con ~3 B de parametros activos por token, el coste por token es comparable al de un modelo denso de 3 B, aunque requiere almacenar los 31,6 B de pesos.
- Capacidades multilingues: no. El modelo declara unicamente ingles (`en`).
- Tool calling / function calling: no documentado; al no haber ajuste por instrucciones ni plantilla de chat publicada, no se puede asumir soporte.
- Uso en agentes y razonamiento multi-paso: no documentado y poco probable sin ajuste fino previo.
- Modo thinking o razonamiento explicito: no disponible.
- Vision, audio u otras modalidades: no soportadas (el pipeline declarado es `text-generation`).
- Puntuacion de secuencias y generacion de datos sinteticos: al ser un modelo base, puede utilizarse para calcular verosimilitudes de texto o para generar continuaciones masivas en lotes.

## Casos de uso

- Ajuste fino supervisado para dominio concreto: al ser un modelo base entrenado desde cero, es un punto de partida para SFT sobre corpus especializados (legal, sanitario, financiero). El coste de ajuste es menor que entrenar desde cero y el modelo no arrastra un sesgo de formato conversacional previo.
- Motores de autocompletado y code completion en local: con ~3 B de parametros activos por token, el coste de decodificacion es bajo, lo que permite servir completados con latencia reducida en un unico nodo y con throughput alto en lote.
- Generacion de datos sinteticos a gran escala: el modelo puede producir continuaciones masivas de prompts semilla para construir datasets de preentrenamiento o de destilacion. Es adecuado porque no requiere plantillas de chat y acepta prompts en formato de texto plano.
- Investigacion sobre arquitecturas hibridas: sirve para estudiar el comportamiento de la combinacion Mamba2 + atencion + MoE (por ejemplo, analisis de las capas que mas contribuyen, ablaciones de enrutamiento o estudios de longitud efectiva de contexto) frente a transformers densos de tamano comparable.
- Modelo profesor para destilacion: su capacidad de 31,6 B con solo ~3 B activos lo hace util como generador de etiquetas o distribuciones para destilar en modelos mas pequenos que si quepan en produccion con latencia estricta.
- Procesamiento de documentos largos en lote: con 32.768 tokens de contexto, se puede usar para resumir o extraer informacion de documentos extensos mediante prompts de continuacion (por ejemplo, "Resumen: ..."), siempre que se valide el comportamiento del modelo en esa longitud.
- Despliegue on-premise con presupuesto de GPU limitado: cuantizado a 4 bits, el conjunto de pesos baja a un rango aproximado de 16-18 GB, lo que permite ejecutarlo en una GPU consumer de 24 GB, algo inviable en BF16 (63,2 GB de pesos).
- Filtrado y puntuacion de corpus: al ser un modelo base, puede puntuar la probabilidad de secuencias para tareas de deduplicacion semantica, filtrado de calidad o seleccion de datos, sin necesidad de una cabeza de clasificacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, GSM8K, HumanEval, ARC, HellaSwag ni de tareas de contexto largo, y la busqueda web no ha devuelto ningun informe tecnico, paper o entrada de blog asociada al modelo. Tampoco se dispone de mediciones de throughput, latencia o consumo de memoria publicadas por el autor.

## Requisitos de hardware

- VRAM para inferencia en BF16: los 31,58 B de parametros a 2 bytes por peso ocupan aproximadamente 63,2 GB, cifra coherente con el tamano del repositorio. Hay que sumar la cache KV y los buffers de activaciones, por lo que se necesitan del orden de 70-80 GB de VRAM o mas, segun el backend y la longitud de contexto.
- VRAM estimada en 8 bits: en torno a 32 GB de pesos, mas cache KV. Encaja en una GPU de 80 GB (A100, H100) o en configuraciones multi-GPU.
- VRAM estimada en 4 bits: en torno a 16-18 GB de pesos, mas cache KV. Es la unica configuracion realista para GPU consumer.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; A100 40 GB en paralelo o H100 80 GB para 8 bits; RTX 4090, RTX 5090, L40S o A6000 (24-48 GB) para 4 bits.
- Cabe en GPU consumer: si, unicamente con cuantizacion de 4 bits y en tarjetas con 24 GB o mas de VRAM. En BF16 no cabe en ninguna GPU consumer actual.
- Consideracion de arquitectura: al ser un MoE, la memoria necesaria viene determinada por los parametros totales (31,6 B), no por los activos (~3 B). Los ~3 B activos reducen el computo por token, no el espacio de pesos, salvo que se apliquen tecnicas de offload a CPU o de expertos en disco, que penalizan la latencia.
- Opciones de despliegue: vLLM, TGI y SGLang son los candidatos habituales para este tipo de arquitectura, pero no hay confirmacion en la informacion disponible de que soporten `nemotron_h`. llama.cpp y Ollama requeririan una conversion a GGUF y soporte explicito del tipo de modelo; no hay cuantizaciones GGUF publicadas. Todo ello debe verificarse antes de plantear un despliegue.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni oficiales ni de terceros.
- Almacenamiento: 63,2 GB para los pesos BF16; presupuestar espacio adicional para cache de cuantizacion y checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hybrid-moe-30b-a3b-base (geodesic-research) | 31,6 B / ~3 B | 32.768 | Hibrida Mamba2 + atencion + MoE (`nemotron_h`) | en | no disponible | safetensors BF16, 0 descargas |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 128.000 (segun documentacion publica del modelo) | MoE transformer | multilingue | Apache 2.0 | ampliamente distribuido, con versiones cuantizadas |
| Mixtral 8x7B | 46,7 B / 12,9 B | 32.768 | MoE transformer | multilingue | Apache 2.0 | ampliamente distribuido, con versiones cuantizadas |
| Familia NVIDIA Nemotron-H | no disponible | no disponible | Hibrida Mamba-Transformer | no disponible | no disponible | referencia de arquitectura, datos no verificados en la informacion disponible |

La comparacion directa con Qwen3-30B-A3B es la mas pertinente por tamano total y por numero de parametros activos, aunque difieren en arquitectura (MoE puro frente a hibrida SSM/atencion/MoE), en contexto declarado y en licencia. Frente a Mixtral 8x7B, el modelo aqui descrito activa menos parametros por token (unos 3 B frente a 12,9 B), pero no hay datos de rendimiento que permitan afirmar cual es mejor. En ningun caso se dispone de evaluaciones comparativas publicadas para hybrid-moe-30b-a3b-base.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso. Esto impide confirmar si el uso comercial esta permitido, si hay restricciones de redistribucion o si se aplican condiciones de atribucion. Es un riesgo legal directo para cualquier despliegue en produccion; conviene contactar con el autor antes de utilizarlo.
- Modelo base sin alineacion: no ha recibido ajuste por instrucciones ni optimizacion de preferencias (RLHF, DPO). No sigue instrucciones de forma fiable, no mantiene formato de chat y no soporta plantillas de conversacion. Para uso conversacional requiere SFT previo.
- Sin filtros de seguridad: al no haber alineacion, no hay garantia de rechazo de contenido danino, sesgado o ilegal. No debe exponerse directamente a usuarios finales sin una capa de moderacion.
- Riesgo de alucinacion: es un modelo de lenguaje preentrenado sobre corpus a gran escala, por lo que puede generar afirmaciones falsas con apariencia de verosimilitud. El riesgo no esta cuantificado porque no hay evaluaciones publicadas.
- Idiomas: solo ingles. No hay evidencia de competencia en castellano ni en otros idiomas; su uso en espanol degradaria la calidad de forma no medida.
- Contexto: la ventana es de 32.768 tokens y no se han publicado evaluaciones de recuperacion en contextos largos (por ejemplo, needle-in-a-haystack); el rendimiento efectivo a longitud maxima es desconocido.
- Ausencia total de benchmarks: no hay datos de MMLU, GSM8K, HumanEval ni de tareas multilingues. No es posible estimar su calidad relativa frente a alternativas conocidas.
- Composicion del dataset no divulgada: se desconoce la mezcla de datos, la proporcion de codigo, la presencia de datos con derechos reservados y el riesgo de contaminacion de benchmarks.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni de toxicidad. Al entrenarse sobre datos web a gran escala, es esperable que reproduzca sesgos presentes en el corpus, pero no hay mediciones disponibles.
- Soporte de backends incierto: la arquitectura `nemotron_h` puede no estar soportada por todas las herramientas habituales (vLLM, llama.cpp, TGI, Ollama). No hay cuantizaciones GGUF publicadas ni convertidores verificados.
- Inmadurez del ecosistema: 0 descargas y 0 valoraciones en el momento de la recopilacion, sin ajustes finos, cuantizaciones ni informes de terceros. No hay validacion independiente del modelo.
- Coste de memoria en inferencia: a pesar de activar solo ~3 B de parametros por token, hay que almacenar los 31,6 B, lo que obliga a cuantizacion o a memoria de 80 GB en BF16.
- Fechas de publicacion inusuales en los metadatos de HuggingFace (septiembre de 2026); conviene verificar la vigencia del repositorio antes de planificar un uso a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geodesic-research/hybrid-moe-30b-a3b-base
- Paper, blog o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Referencia de la arquitectura: no disponible en la informacion proporcionada. Las busquedas web realizadas devolvieron unicamente resultados sobre el termino matematico "geodesic" (Wikipedia, Wolfram MathWorld, Wikiwand), sin relacion con el modelo ni con su autor.
