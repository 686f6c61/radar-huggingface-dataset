# morwal/finance_stage1_adapter

## Resumen

`morwal/finance_stage1_adapter` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `unsloth/qwen2.5-0.5b-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto al modelo base para producir texto. El nombre del repositorio sugiere un ajuste orientado al dominio financiero y una primera etapa dentro de una posible cadena de entrenamiento, pero la model card publicada es la plantilla por defecto de HuggingFace y no contiene ninguna descripción, dataset ni hiperparametro declarado por el autor.

El interes de esta ficha es, por tanto, limitado y de caracter tecnico: sirve para documentar que existe un adaptador LoRA de dominio financiero construido sobre Qwen2.5-0.5B con el stack Unsloth + TRL + PEFT 0.20.0, y para advertir de que no hay evaluacion, licencia ni datos de entrenamiento publicados. Con 0 descargas y 0 likes, el artefacto no ha sido validado por la comunidad.

El modelo base aporta la arquitectura y el tamano: un transformer decoder-only denso de aproximadamente 0,49 mil millones de parametros, con atencion de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, y una ventana de contexto nativa de 32 768 tokens. Ese tamano lo situa en la gama de modelos que caben en cualquier GPU de consumo e incluso en CPU, lo que lo hace util para prototipado y tareas estrechas de clasificacion o extraccion, no para razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2ForCausalLM); 24 capas, hidden size 896, 14 cabezas de consulta y 2 de clave/valor en el modelo base |
| Parametros totales | 0,49 B en el modelo base; numero de parametros entrenables del adaptador no disponible (rango y alpha no declarados) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el base de entrenamiento estaba cuantizado en 4 bits (bitsandbytes). No se publican versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base Qwen2.5 declara soporte para 29 idiomas, entre ellos castellano e ingles |
| Licencia | no especificada para el adaptador; el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con la libreria PEFT 0.20.0 y las etiquetas del repositorio indican SFT (supervised fine-tuning) sobre TRL y Unsloth. El modelo base es una version ya cuantizada en 4 bits con bitsandbytes del Qwen2.5-0.5B de Alibaba, preparada por Unsloth para reducir el consumo de memoria durante el ajuste. La arquitectura subyacente es un transformer decoder-only con atencion de consultas agrupadas: 24 capas, dimension oculta de 896, 14 cabezas de consulta frente a 2 cabezas de clave/valor, vocabulario de 151 936 tokens y contexto nativo de 32 768 tokens.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, la longitud de secuencia, el rango del adaptador, la tasa de aprendizaje ni si se aplicaron tecnicas posteriores como DPO o RLHF. Tampoco se documentan innovaciones tecnicas propias: el adaptador se limita a aplicar el procedimiento estandar de LoRA, que congela los pesos del base e inserta matrices de bajo rango en determinadas proyecciones. El sufijo "stage1" del nombre apunta a un entrenamiento por fases, presumiblemente seguido de una segunda etapa no publicada en este repositorio.

## Capacidades

- Generacion de texto condicionada por el ajuste SFT, presumiblemente orientada al registro y la terminologia del dominio financiero, aunque no hay ejemplos ni evaluacion que lo confirmen.
- Ajuste de estilo y vocabulario: al ser un adaptador, modifica la distribucion de salida del modelo base sin alterar su arquitectura ni su tokenizador.
- Capacidades heredadas del base Qwen2.5-0.5B: generacion de texto general, respuesta a instrucciones sencillas, aritmetica basica y conocimientos limitados de programacion.
- Capacidades multilingues: no confirmadas para el adaptador; dependen de lo que haya visto durante el SFT. El base cubre 29 idiomas.
- Tool calling y function calling: no disponible. El modelo base de 0,5 B no esta optimizado para ello y el adaptador no documenta plantillas de herramientas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio o multimodalidad: no soportadas.
- Soporte de agentes y razonamiento multi-paso: no disponible y poco realista con 0,49 B de parametros.

## Casos de uso

- Clasificacion de transacciones y movimientos bancarios: el modelo puede asignar categorias (nomina, suministros, suscripciones, transferencias) a partir de la descripcion textual de un apunte. Es adecuado porque la tarea es de etiquetado corto y no requiere razonamiento profundo, y porque un adaptador de dominio puede capturar vocabulario bancario especifico que el base desconoce.
- Extraccion de entidades en documentos financieros: identificacion de importes, fechas, CIF/NIF y conceptos en lineas de extracto o facturas. El contexto de 32 768 tokens permite procesar lotes de movimientos en una sola pasada sin truncar.
- Normalizacion y enriquecimiento de descripciones: convertir descripciones abreviadas y ruidosas de extractos en texto legible y estructurado, util para conciliacion contable automatizada.
- Generacion de respuestas FAQ en banca: si el ajuste ha cubierto material de atencion al cliente, puede redactar respuestas breves sobre comisiones, plazos o productos. Requiere validacion humana obligatoria por el riesgo regulatorio.
- Analisis de sentimiento en titulares y notas de prensa economicas: clasificacion en positivo, neutro o negativo a partir de texto corto, tarea bien alineada con el tamano del modelo.
- Etapa inicial de un pipeline de ajuste en varias fases: el sufijo "stage1" sugiere que puede usarse como punto de partida de un SFT posterior con mas datos o mayor rango, o para generar etiquetas sinteticas que alimenten un modelo mayor.
- Prototipado y pruebas de integracion: por su tamano, sirve para validar un pipeline completo de PEFT con vLLM o Transformers antes de invertir en un modelo de mayor escala.
- Enrutado previo de consultas: clasificar la intencion de una peticion de usuario para derivarla al modelo o al servicio adecuado, aprovechando la baja latencia de un modelo de 0,5 B.

Advertencia: al no existir evaluacion publicada ni documentacion del dataset, estos casos de uso son hipotesis derivadas del nombre del repositorio y del modelo base, no capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada y no existe ningun informe de MMLU, GSM8K, HumanEval ni de tareas financieras especificas para este adaptador. Tampoco se publican mediciones de latencia ni de throughput.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 1 GB para los pesos del base mas unos 400 MB de cache KV con 32 768 tokens de contexto y un lote de una secuencia. En la practica, entre 1,8 y 2,5 GB contando el runtime.
- VRAM en 4 bits: alrededor de 0,4 GB de pesos mas la misma cache KV, en torno a 1,0-1,5 GB en total.
- Cache KV estimada: cada token ocupa 6144 valores (24 capas x 2 cabezas KV x 64 dimensiones x 2 tensores), es decir unos 12 KB por token en fp16 y cerca de 400 MB a contexto maximo.
- GPU recomendadas: cualquier GPU con 4 GB o mas. Funciona sin problemas en RTX 3050, RTX 3060, RTX 4060, GTX 1650, y con holgura en RTX 4090, A100 o H100.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos ocho anos, y tambien en CPU con llama.cpp o en hardware Apple Silicon mediante MLX.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained` sobre el base), vLLM con `--enable-lora`, TGI, Ollama o llama.cpp previa fusion del adaptador y conversion a GGUF. Unsloth sirve para el reentrenamiento, no para servir.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el autor no documenta hardware de entrenamiento ni de inferencia.
- Nota importante: los pesos se entrenaron sobre un base cuantizado en 4 bits. Fusionar el adaptador sobre el base en fp16 puede producir distribuciones de salida distintas de las observadas durante el entrenamiento, por lo que conviene validar ambas rutas antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| morwal/finance_stage1_adapter | 0,49 B (base) + adaptador LoRA de rango no declarado | 32 768 tokens | no especificada (base Apache 2.0) | no | 0 descargas, 0 likes |
| Qwen2.5-0.5B / 0.5B-Instruct | 0,49 B | 32 768 tokens | Apache 2.0 | si, publicados por Alibaba | amplia, muy descargado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | si, publicados por Alibaba | amplia |
| SmolLM2-360M-Instruct | 0,36 B | 8192 tokens | Apache 2.0 | si, publicados por HuggingFace | amplia |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 tokens | Apache 2.0 | si, publicados por la comunidad | amplia |

La comparacion relevante es contra el propio base sin adaptador: cualquier mejora en el dominio financiero solo puede verificarse mediante una evaluacion que el autor no ha publicado. Frente a las alternativas, la ventaja de este adaptador seria la especializacion de dominio, y la desventaja la ausencia total de garantias, documentacion y traccion.

## Limitaciones y advertencias

- Model card vacia: la descripcion, el dataset, los hiperparametros, la evaluacion y la licencia figuran como "More Information Needed". Cualquier uso en produccion se hace sin trazabilidad del entrenamiento.
- Licencia no declarada: no se especifica la licencia del adaptador. Aunque el base es Apache 2.0, la ausencia de licencia explicita en el repositorio crea incertidumbre juridica para uso comercial. Conviene contactar con el autor o abstenerse.
- Sin evaluacion: no hay ninguna metrica publicada, ni general ni de dominio. No se puede afirmar que el adaptador mejore al base en tareas financieras.
- Sin validacion de la comunidad: 0 descargas y 0 likes. El repositorio se creo y actualizo con 22 segundos de diferencia, lo que sugiere una subida automatizada sin curaduria.
- Sesgo y alucinacion: con 0,49 B de parametros, la tasa de alucinacion en tareas factuales es alta. En un dominio regulado como el financiero, cualquier salida debe pasar por revision humana.
- Desajuste de cuantizacion: entrenado sobre un base en 4 bits, el adaptador puede comportarse de forma distinta al fusionarse sobre pesos en fp16.
- Riesgo de olvido catastrofico: el ajuste SFT puede degradar capacidades generales del base, especialmente el multilingue y el razonamiento aritmetico, sin que exista evaluacion que lo cuantifique.
- Limitacion de idioma: no se confirma que el ajuste se haya hecho en castellano. Si el dataset era mayoritariamente en ingles, el rendimiento en castellano puede ser peor que el del base.
- Limitacion de razonamiento: no es adecuado para analisis financiero complejo, calculo de riesgos, resumen de informes largos con matices ni para agentes multi-paso.
- Advertencia de fecha: los metadatos del repositorio indican una fecha de creacion de 2026-09-28, posterior a la actual, lo que puede indicar un error de reloj en el proceso de subida o una fecha manipulada. No afecta al contenido pero reduce la confianza en los metadatos.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/morwal/finance_stage1_adapter
- Modelo base: https://huggingface.co/unsloth/qwen2.5-0.5b-unsloth-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Informe tecnico de Qwen2 (arquitectura de la familia): https://arxiv.org/abs/2409.12191
- Referencia citada en la model card sobre impacto ambiental: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
