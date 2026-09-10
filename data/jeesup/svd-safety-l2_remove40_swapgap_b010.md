# Jeesup/svd-safety-l2_remove40_swapgap_b010

## Resumen

svd-safety-l2_remove40_swapgap_b010 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se construye a partir de meta-llama/Llama-2-7b-chat-hf, al que se aplica una compresión SVD-LLM que elimina el 40,02 % de los parámetros densos, seguida de la restauración de un presupuesto del 1,000 % de componentes SVD seleccionados con la regla `swapgap`. El resultado declara una fracción de parámetros de 0,5998, con 5665 componentes restaurados y 5665 sustituidos, y semilla 42. El repositorio almacena safetensors con 6.738.415.616 parámetros y ocupa 13,5 GB.

El interés del modelo es metodológico, no de producto: forma parte de un grid experimental sobre reglas de selección de componentes y presupuestos de restauración, cuyo objetivo es cuantificar cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección lo repara mejor. Las métricas publicadas son AdvBench ASR 0,0538 y StrongREJECT ASR 0,1342 (juez HarmBench), sobre-rechazo macro de 0,1682 (WildGuard) y perplejidad de 11,6084 en WikiText-2.

El propio autor advierte que varias celdas del grid están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable. Es relevante ahora porque la compresión agresiva de modelos abiertos es práctica habitual y este artefacto ofrece un punto de medida reproducible del coste en seguridad de esa práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con matrices de pesos truncadas por SVD (metodo SVD-LLM) |
| Parametros totales | 6.738.415.616 (segun metadatos de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No indicada en la model card; el modelo base Llama-2-7b-chat usa 4096 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No declarados en la model card; el modelo base esta entrenado predominantemente en ingles |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | swapgap |
| Presupuesto de restauracion | 1,000 % de los parametros densos (5665 componentes restaurados, 5665 sustituidos) |
| Fraccion de parametros resultante | 0,5998 |
| Semilla | 42 |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible |

Nota: los metadatos de safetensors declaran la misma forma densa que Llama-2-7B (6.738.415.616 parametros), mientras que la model card informa de una fraccion de parametros de 0,5998 tras la compresion. La model card no explicita si el checkpoint almacena las matrices truncadas en su forma completa o solo los componentes conservados; conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria proporcional.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion multi-cabeza. La modificacion aplicada no es arquitectonica en sentido estricto, sino de descomposicion de pesos: SVD-LLM descompone las matrices de proyeccion y trunca los componentes singulares de menor contribucion, eliminando el 40,02 % de los parametros densos. Sobre ese checkpoint comprimido se restauran 5665 componentes SVD (presupuesto del 1,000 % de los parametros densos) seleccionados mediante la regla `swapgap`, sustituyendo otros tantos. La model card no describe el criterio interno de `swapgap` ni el detalle del algoritmo de truncacion.

No se documenta ningun entrenamiento adicional, ajuste fino, RLHF ni DPO sobre el checkpoint resultante: el artefacto es una transformacion post-hoc de pesos ya entrenados. Las fases de ajuste conversacional y alineacion (SFT y RLHF) proceden del modelo base Llama-2-7b-chat segun la documentacion de Meta, y la compresion posterior es la que la model card senala como responsable de la degradacion del comportamiento de seguridad. No se proporcionan datos sobre el corpus utilizado en la compresion ni sobre el numero de tokens empleados en la calibracion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base, con calidad degradada de forma no cuantificada fuera de las metricas publicadas.
- Razonamiento y conocimiento general en la medida en que sobreviven al truncamiento SVD del 40,02 %; la model card no reporta evaluaciones de conocimiento (MMLU, GSM8K u otras).
- Codigo y matematicas: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado. Llama-2-7b-chat no incluye un formato nativo de llamada a herramientas.
- Uso como agente y razonamiento multi-paso: no documentado; el autor indica explicitamente que no es un modelo de chat de proposito general.
- Capacidades multilingues: no declaradas; el entrenamiento del modelo base esta centrado en ingles.
- Capacidades especiales: ninguna (sin vision, sin audio, sin modo de razonamiento explicito). El proposito declarado es servir como sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresion.
- Resistencia parcial a ataques de jailbreak: AdvBench ASR 0,0538 y StrongREJECT ASR 0,1342, medidos con juez HarmBench.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda concreta de un grid para medir cuanto sube la tasa de exito de ataque (ASR) al eliminar el 40,02 % de parametros, comparando con el modelo base sin comprimir.
- Comparacion de reglas de seleccion de componentes SVD: dado que el nombre codifica la regla `swapgap` y el presupuesto 0,010, el checkpoint sirve para contrastar algoritmos de restauracion alternativos manteniendo constante el porcentaje de compresion.
- Evaluacion de sobre-rechazo en sistemas de moderacion: el valor de sobre-rechazo macro de 0,1682 medido con WildGuard permite estudiar el falso positivo del modelo comprimido frente a peticiones benignas.
- Red-teaming academico reproducible: la semilla 42 y la procedencia documentada (base, metodo, presupuesto, numero de componentes) permiten replicar experimentos de ataque con trazabilidad completa.
- Auditoria de perplejidad como proxy de degradacion: con 11,6084 en WikiText-2, se puede correlacionar la perdida de calidad linguistica con los cambios en el comportamiento de seguridad.
- Banco de pruebas de pipelines de evaluacion: al ser compatible con text-generation-inference y endpoints_compatible, se puede desplegar temporalmente para validar arneses de evaluacion automatica sin depender de un modelo de produccion.
- Estudio de interpretabilidad de subespacios de seguridad: analizar que componentes singulares restaurados por `swapgap` recuperan comportamiento seguro frente a los sustituidos, para localizar direcciones de pesos asociadas a la alineacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0538 |
| StrongREJECT | ASR (juez HarmBench) | 0,1342 |
| WildGuard | Sobre-rechazo macro | 0,1682 |
| WikiText-2 | Perplejidad | 11,6084 |

No se proporcionan en la informacion disponible los valores del modelo base meta-llama/Llama-2-7b-chat en estas mismas metricas, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar. Por tanto, no es posible calcular la delta exacta de degradacion respecto al modelo sin comprimir a partir de los datos aportados. La model card si afirma cualitativamente que la compresion por si sola eleva la tasa de exito de ataque.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, mas cache KV y activaciones; alrededor de 16 GB con contexto corto y batch 1. Cifra estimada a partir del numero de parametros declarado, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB. En 4 bits: aproximadamente 4 GB. Estas variantes no estan publicadas en el repositorio y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con contexto largo o batch alto; RTX 4090 y RTX 3090 (24 GB) para FP16 con contexto moderado; RTX 4080 (16 GB) queda al limite en FP16.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a FP16 y en GPUs de 8-12 GB si se cuantiza a 4 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: vLLM, Hugging Face text-generation-inference (el repositorio esta etiquetado como text-generation-inference y endpoints_compatible), transformers con accelerate o bitsandbytes. llama.cpp y Ollama requeririan convertir previamente los pesos a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

Advertencia practica: si los tensores del checkpoint conservan la forma densa original, el ahorro de VRAM respecto a Llama-2-7B puede ser nulo o marginal pese a la fraccion de parametros de 0,5998. Conviene inspeccionar las formas de los safetensors antes de dimensionar el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en seguridad/calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapgap_b010 | 6.738.415.616 almacenados; fraccion densa declarada 0,5998 | No indicado (base: 4096) | AdvBench ASR 0,0538; StrongREJECT ASR 0,1342; sobre-rechazo 0,1682; WikiText-2 ppl 11,6084 | Llama 2 Community License | HuggingFace, repositorio de investigacion, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | No comparable: no se aportan sus valores en las mismas metricas | Llama 2 Community License | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | Aproximadamente 8.000 millones | 128.000 | No comparable con los datos disponibles | Llama 3.1 Community License | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | Aproximadamente 7.200 millones | 32.000 | No comparable con los datos disponibles | Apache 2.0 | HuggingFace |

La comparativa se limita a parametros, contexto, licencia y disponibilidad porque la informacion proporcionada solo incluye metricas de este checkpoint. Cualquier comparacion de rendimiento exigiria ejecutar el mismo arnes de evaluacion sobre los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo de proposito general. El autor lo describe como artefacto de investigacion y una celda de un grid experimental; no deberia usarse como asistente en produccion.
- Degradacion deliberada de seguridad en parte del grid: la model card advierte que varias celdas estan degradadas respecto a Llama-2-7b-chat y que la compresion por si sola eleva la tasa de exito de ataque. Este checkpoint concreto presenta ASR de 0,0538 en AdvBench y 0,1342 en StrongREJECT, valores no nulos.
- Sobre-rechazo de 0,1682 en WildGuard, lo que implica que una fraccion relevante de peticiones benignas puede ser rechazada.
- Riesgo de alucinacion no cuantificado: la perplejidad de 11,6084 en WikiText-2 indica una calidad de modelado del lenguaje por debajo de la del modelo sin comprimir, aunque no se aporta la cifra de referencia.
- Idiomas no declarados y base centrada en ingles; el comportamiento en castellano no esta evaluado y previsiblemente sera inferior.
- Restricciones de licencia: el uso se rige por la Llama 2 Community License y por USE_POLICY.md, ambos incluidos en el repositorio. Es una obra derivada, por lo que se heredan las condiciones de la licencia, incluidos los requisitos de atribucion y las clausulas de uso comercial (con el umbral de usuarios activos mensuales que fija la licencia). El nombre del checkpoint no sigue la convencion de nomenclatura que la licencia de Llama 2 impone a los derivados, que deben comenzar por "Llama"; conviene revisar los terminos antes de redistribuir o desplegar.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos de bajos recursos sin trabajo adicional de conversion y validacion.
- Trazabilidad parcial: la model card no documenta el corpus de calibracion, el numero de tokens ni el criterio interno de la regla `swapgap`, lo que limita la reproducibilidad completa del experimento.
- Anomalia en los metadatos: el repositorio figura como creado el 2026-09-10 y actualizado el mismo dia, fechas incoherentes con el calendario habitual; puede tratarse de un error de metadatos.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados publicados.
- Uso en produccion: si se plantea, es imprescindible reevaluar seguridad, utilidad y sesgos con un arnes propio; la model card lo exige explicitamente antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgap_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- SVD-LLM (metodo de compresion citado en la model card): no se proporciona enlace en la informacion disponible
- HarmBench (juez de evaluacion citado): no se proporciona enlace en la informacion disponible
- StrongREJECT (benchmark citado): no se proporciona enlace en la informacion disponible
- WildGuard (evaluador de sobre-rechazo citado): no se proporciona enlace en la informacion disponible
- Repositorio o demo adicional: no disponibles

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces verificables son los de HuggingFace y el paper de Llama 2.
