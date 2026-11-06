# richardyoung/gemma-4-31B-it-MPOA-heretic

## Resumen

Gemma 4 31B it Heretic MPOA es una variante "decensored" del modelo multimodal google/gemma-4-31B-it, publicada por el usuario richardyoung y generada mediante la herramienta Heretic v2.0.0 aplicando una tecnica de ablacion ortogonal con preservacion de magnitud (MPOA, Magnitude-Preserving Orthogonal Ablation). El objetivo declarado es reducir la tasa de rechazos (refusals) del modelo original, manteniendo en la medida de lo posible el resto de capacidades intactas. El modelo base es un transformer denso de Google DeepMind con 30,7B parametros efectivos (31,27B en los pesos safetensors publicados), 60 capas, ventana de contexto de 256K tokens y soporte de entrada de texto e imagen.

La relevancia de esta ficha es doble. Por un lado, documenta el modelo base Gemma 4 31B, que introduce atencion hibrida (sliding window local de 1024 tokens intercalada con atencion global), soporte nativo del rol `system`, modos de razonamiento configurables y function calling. Por otro, describe una modificacion de pesos que altera el comportamiento de seguridad del modelo original: segun la model card, los rechazos bajan de 99/100 a 80/100, con una divergencia KL de 0,0691 respecto al original.

El modelo se distribuye en formato safetensors para transformers, con un tamano de repositorio de 62,6 GB, licencia Apache 2.0 declarada y pipeline `image-text-to-text`. Es un modelo sin descargas ni likes en el momento de la consulta, lo que conviene tener en cuenta a la hora de evaluar su madurez y soporte comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local de 1024 tokens intercalada con atencion global; capa final siempre global; Keys y Values unificadas en capas globales; Proportional RoPE) |
| Parametros totales | 31.273.086.512 (31,27B); 30,7B segun la model card del modelo base |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible (la model card no lista cuantizaciones publicadas; al ser safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | Mas de 140 idiomas segun el modelo base; no se detalla lista concreta |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B es un transformer denso de 60 capas con vocabulario de 262K tokens y un encoder de vision de aproximadamente 550M parametros. La innovacion arquitectonica principal es la atencion hibrida: las capas alternan atencion local de ventana deslizante (1024 tokens) con atencion global, garantizando que la capa final sea siempre global. Para reducir el coste de memoria en contextos largos, las capas globales comparten Keys y Values y aplican Proportional RoPE (p-RoPE). El modelo soporta texto e imagen como entrada (sin audio, a diferencia de las variantes E2B, E4B y 12B) y genera texto.

Sobre el entrenamiento del modelo base no se proporcionan en la informacion disponible detalles sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO; la model card solo indica que hay variantes preentrenadas e instruction-tuned. La modificacion de richardyoung no reentrena el modelo: aplica MPOA, una ablacion ortogonal de direcciones en los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj`, con parametros concretos documentados (por ejemplo, `direction_index` 41,46, `attn.o_proj.max_weight` 1,11 en la posicion 36,41, `mlp.down_proj.max_weight` 1,41 en la posicion 37,69). El proceso es reproducible segun el autor, con instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables, heredados del modelo base.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Generacion de codigo y matematicas, con mejoras declaradas por Google en benchmarks de codigo para la familia Gemma 4.
- Function calling / tool calling nativo.
- Soporte de flujos agenticos y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingues en mas de 140 idiomas.
- Conversacion multi-turno con contexto de hasta 256K tokens.
- Reduccion de rechazos respecto al modelo original (80/100 frentes a 99/100 segun la model card), lo que amplia el rango de peticiones que el modelo responde sin negarse.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial largo gracias a los 256K tokens de contexto, y el soporte nativo del rol `system` permite fijar politicas de empresa de forma estable durante toda la sesion.
- Generacion de codigo en produccion: el function calling nativo y el soporte agentico permiten integrarlo en pipelines de CI/CD para generar parches, escribir tests o resolver issues a partir de descripciones e imagenes de errores.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer informacion de capturas, diagramas o formularios escaneados combinados con texto de contexto largo.
- Asistentes de investigacion y sintesis: la ventana de 256K tokens permite cargar articulos o expedientes completos y generar resumenes o comparativas sin truncar el material.
- Agentes autonomos multi-paso: con tool calling y razonamiento configurable, se puede usar como planificador en pipelines que consultan APIs, ejecutan comandos y validan resultados.
- Generacion creativa y roleplay sin filtros excesivos: la reduccion de rechazos respecto al original lo hace adecuado para escenarios de escritura creativa o simulacion donde el modelo base se negaba con frecuencia, siempre bajo revision humana.
- Despliegue en estaciones de trabajo: con 31B parametros densos y cuantizacion agresiva, es candidato para entornos locales de desarrollo con una o dos GPU de gama alta.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Rechazos | 80/100 | 99/100 |
| Divergencia KL | 0,0691 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta variante ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 2 GPU de 48 GB o 4 GPU de 24 GB.
- Cuantizacion a 8 bits: alrededor de 31-33 GB de pesos, viable en una A100 80GB, H100 80GB o dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB de pesos, cabe en una RTX 4090, RTX 5090 o L40S con margen limitado para contexto largo; el contexto de 256K exigira tecnicas de atencion eficiente y cache KV cuantizada.
- GPU recomendadas: H100 80GB, A100 80GB, L40S 48GB para BF16; RTX 4090/5090 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servidor una vez convertido, llama.cpp/Ollama para cuantizaciones GGUF (requiere conversion previa, no publicada en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-MPOA-heretic | 31,27B densos | 256K | Texto, imagen | Apache 2.0 | Variante decensored con MPOA; rechazos 80/100 |
| google/gemma-4-31B-it | 30,7B densos | 256K | Texto, imagen | Apache 2.0 | Modelo base original; rechazos 99/100 |
| google/gemma-4-26B-A4B | 26B totales, 4B activos (MoE) | 256K | Texto, imagen | Apache 2.0 | Alternativa MoE de la misma familia, mas eficiente en inferencia |
| google/gemma-4-12B | 11,95B densos | 256K | Texto, imagen, audio | Apache 2.0 | Version menor con audio nativo, desplegable en GPU de consumo |

## Limitaciones y advertencias

- La modificacion MPOA altera el comportamiento de seguridad del modelo original; los rechazos bajan de 99/100 a 80/100, lo que implica que puede generar contenido que el modelo base rechazaria. Requiere revision y filtros adicionales en produccion.
- La divergencia KL de 0,0691 indica un cambio medible en la distribucion de salida respecto al original; puede haber degradacion en tareas distintas de las evaluadas por el autor.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para esta variante.
- No se detalla la lista de idiomas soportados ni evaluaciones por idioma; el soporte multilingue se hereda del modelo base sin verificacion independiente.
- El modelo base no incluye audio, a diferencia de las variantes E2B, E4B y 12B de la familia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion comunitaria; conviene tratar los resultados de la model card como no auditados de forma independiente.
- La licencia declarada es Apache 2.0, pero el enlace de licencia apunta a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos exactos antes de uso comercial.
- No se publican cuantizaciones oficiales; el despliegue eficiente exige conversion propia a GGUF/AWQ/GPTQ, con el riesgo de degradacion adicional que ello conlleva.
- El contexto de 256K requiere tecnicas de atencion eficiente y puede no estar disponible en todos los backends de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-MPOA-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Heretic: https://heretic-project.org
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
