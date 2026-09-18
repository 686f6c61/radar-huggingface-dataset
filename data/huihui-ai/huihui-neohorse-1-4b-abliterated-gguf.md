# huihui-ai/Huihui-NeoHorse-1-4B-abliterated-GGUF

## Resumen

Huihui-NeoHorse-1-4B-abliterated-GGUF es una version "abliterated" (sin mecanismos de rechazo) del modelo TokenRhythm/NeoHorse-1-4B, publicada por huihui-ai en formato GGUF para su uso con llama.cpp y otros runners compatibles. El modelo base es un LLM de aproximadamente 4.000 millones de parametros orientado a tareas agenticas, uso de herramientas (tool calling), generacion de codigo, razonamiento e instrucciones, segun las etiquetas declaradas por el autor. La publicacion esta pensada como prueba de concepto: el propio autor la describe como una implementacion "cruda" cuyo unico objetivo es eliminar las direcciones de rechazo del modelo original sin recurrir a TransformerLens.

La intervencion tecnica consiste en una abliteracion aplicada a las capas 5 a 17 (indexacion base 0) del transformer original, un rango que se corresponde aproximadamente con el tercio central de la red. Ademas, el autor indica que los componentes MTP (multi-token prediction) y visual se extrajeron del modelo Qwen/Qwen3.5-4B, lo que sugiere que el modelo conserva capacidades de prediccion multi-token y potencialmente de procesamiento de imagenes heredadas de esa arquitectura. El repositorio incluye un ejemplo de uso con una ventana de contexto de 262.144 tokens, lo que situaria al modelo en el rango de contexto largo.

Su relevancia es limitada y muy especifica: se trata de un artefacto de investigacion con 0 descargas y 0 "likes" en el momento de la consulta, licencia Apache 2.0 y sin resultados de benchmarks publicados. Resulta de interes para quienes estudian tecnicas de abliteracion, evaluación de sesgos y robustez de filtros de seguridad, o para experimentacion local en cuantizaciones GGUF de bajo consumo, no como modelo de produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de TokenRhythm/NeoHorse-1-4B); incluye componentes MTP y visual extraidos de Qwen/Qwen3.5-4B |
| Parametros totales | Aproximadamente 4.000 millones (segun la denominacion "4B" del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de invocacion con llama.cpp incluido en la model card) |
| Tipos de cuantizacion | GGUF; en la model card solo se menciona explicitamente la variante f16. El resto de niveles de cuantizacion no esta detallado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (la model card declara tambien library_name: transformers) |

## Arquitectura y entrenamiento

El modelo parte de TokenRhythm/NeoHorse-1-4B, un transformer de aproximadamente 4.000 millones de parametros etiquetado por sus autores como orientado a uso agentico, tool use, codigo, razonamiento e instruccion. Sobre ese checkpoint, huihui-ai aplica abliteracion: se identifican las direcciones de activacion asociadas al rechazo y se proyectan fuera de la matriz de pesos, de modo que el modelo deja de activar respuestas de negativa ante determinadas peticiones. En este caso concreto, el autor especifica que las capas ablacionadas son las 5 a 17 (indexacion base 0), lo que deja intactas las capas iniciales de representacion y las finales de generacion. La herramienta de referencia citada por el autor es remove-refusals-with-transformers, una implementacion alternativa a TransformerLens. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ni en el modelo base ni en el proceso de abliteracion (que, por definicion, no reentrena el modelo).

El detalle mas llamativo de la ficha es la afirmacion de que los componentes MTP (multi-token prediction, prediccion de varios tokens por paso) y visual proceden de Qwen/Qwen3.5-4B y "pueden proporcionar un soporte excelente". Esto implica que el modelo podria incorporar una cabeza de prediccion multi-token, con la mejora de throughput asociada, y componentes de vision heredados. La model card no aclara como se integran esos modulos en el checkpoint de NeoHorse-1-4B ni si la abliteracion los afecta, por lo que cualquier uso de la via multimodal deberia validarse empiricamente antes de darla por supuesta.

## Capacidades

- Generacion de texto e instrucciones: el modelo esta etiquetado como instruction-following y text-generation.
- Razonamiento: incluye la etiqueta reasoning entre sus capacidades declaradas.
- Codigo: etiquetado explicitamente como modelo de coding.
- Uso de herramientas: soporta tool use y function calling segun las etiquetas del repositorio.
- Flujos agenticos: etiquetado como agentic, lo que apunta a razonamiento multi-paso y ejecucion de tareas encadenadas.
- Prediccion multi-token (MTP): componente declarado como extraido de Qwen/Qwen3.5-4B, orientado a acelerar la decodificacion.
- Componente visual: el autor indica que se extrajo de Qwen/Qwen3.5-4B, aunque no detalla su funcionamiento ni su integracion final.
- Ausencia de filtros de rechazo: la abliteracion elimina las respuestas de negativa, lo que constituye una caracteristica funcional (y a la vez un riesgo).
- Capacidades multilingues: no disponibles. La model card no declara lista de idiomas.
- Modo "thinking": no disponible; no se menciona en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteracion y seguridad: el modelo permite comparar directamente el comportamiento del checkpoint original TokenRhythm/NeoHorse-1-4B con su version ablacionada en las capas 5-17, aislando el efecto de la intervencion sobre las tasas de rechazo, la coherencia y la calidad de las respuestas.
- Evaluacion de robustez de filtros: util para medir hasta que punto tecnicas de proyeccion de direcciones en un subconjunto de capas centrales bastan para desactivar el comportamiento de negativa, y que degradacion colateral provocan.
- Experimentacion local en hardware modesto: con el modelo en formato GGUF y cuantizaciones de 4 bits, es viable ejecutarlo en una GPU de consumo o incluso en CPU mediante llama.cpp, lo que facilita pruebas repetidas de tecnicas de edicion de pesos.
- Analisis de sesgos y contenido nocivo: al no disponer de filtros de rechazo, sirve como banco de pruebas controlado para estudiar que tipo de contenido genera un LLM de 4B cuando se le retiran las barreras, siempre en entorno aislado y con supervision.
- Prototipado de agentes con tool calling: las etiquetas agentic y tool-use sugieren su uso para validar esquemas de llamadas a funciones y razonamiento multi-paso en un modelo pequeno, antes de migrar el pipeline a un modelo mayor.
- Asistencia de codigo en entornos internos: puede emplearse para autocompletado o generacion de fragmentos en repositorios privados donde no se quiera enviar codigo a APIs externas, asumiendo la perdida de calidad frente a modelos de mayor tamano.
- Pruebas de contexto largo: el ejemplo de llama.cpp fija 262.144 tokens de contexto, lo que permite experimentar con resumen de documentos extensos o analisis de repositorios completos, midiendo el coste real de la cache KV.
- Generacion de datos sinteticos para investigacion: util en experimentos donde se necesita un generador poco restrictivo para construir datasets de contraste, con las salvedades legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (estimacion propia a partir de ~4.000 millones de parametros): aproximadamente 8 GB en f16, 4,3 GB en Q8_0 y 2,5 GB en Q4_K_M.
- Cache KV: con una ventana de 262.144 tokens, la cache KV puede superar con holgura el tamano de los propios pesos. Se recomienda cuantizar la cache (por ejemplo q8_0 o q4_0, opciones habituales en llama.cpp) o reducir la ventana efectiva si la VRAM es limitada.
- GPU de consumo: la variante de 4 bits deberia caber en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070) manteniendo contextos moderados. En f16 requeriria al menos 12-16 GB para trabajar con comodidad (RTX 4080, RTX 4090, RTX 3090).
- GPU de datacenter: A100, H100 o L40S permiten ejecutar el modelo en f16 con ventanas de contexto muy largas, aunque para un modelo de 4B son sobredimensionadas.
- Ejecucion en CPU: viable con las cuantizaciones GGUF mas agresivas usando llama.cpp, con latencias notablemente superiores.
- Opciones de despliegue: el unico flujo documentado por el autor es llama.cpp mediante `llama-cli`. Los repositorios GGUF de este tipo suelen ser compatibles tambien con Ollama, LM Studio y llama-cpp-python, pero no hay confirmacion en la model card para vLLM ni TGI con este formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Comando de referencia documentado: `llama-cli -m Huihui-NeoHorse-1-4B-abliterated-f16.gguf -c 262144`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-NeoHorse-1-4B-abliterated-GGUF | ~4B | 262.144 tokens (segun ejemplo de uso) | Apache 2.0 | GGUF | Version sin filtros de rechazo, prueba de concepto |
| TokenRhythm/NeoHorse-1-4B | ~4B (declarado) | no disponible | no disponible | no disponible | Modelo base sin abliterar; conserva los filtros de seguridad originales |
| Qwen/Qwen3.5-4B | ~4B (por denominacion) | no disponible | no disponible | no disponible | Citado por el autor como origen de los componentes MTP y visual |
| Otras variantes abliterated de huihui-ai | variable | no disponible | habitualmente Apache 2.0 | safetensors y GGUF | Misma metodologia de eliminacion de rechazos aplicada a otros modelos base |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteracion elimina deliberadamente las respuestas de rechazo. El autor advierte del riesgo de generar contenido sensible, controvertido o inapropiado, y recomienda revisar rigurosamente las salidas.
- No apto para todas las audiencias: la model card indica explicitamente que el modelo puede no ser adecuado para entornos publicos, usuarios menores de edad o aplicaciones con requisitos altos de seguridad.
- Prueba de concepto: el propio autor lo describe como una implementacion "cruda" cuyo objetivo es demostrar la eliminacion de rechazos, no como un modelo optimizado o validado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual. Un modelo de 4B sin benchmarks conocidos presenta un riesgo elevado de errores factuales, agravado por la falta de validacion tras la edicion de pesos.
- Degradacion potencial por abliteracion: al modificar las capas 5 a 17 sin reentrenamiento, es esperable cierto deterioro en coherencia, seguimiento de instrucciones o calidad general. No hay mediciones publicadas que cuantifiquen ese impacto.
- Idiomas no declarados: se desconoce que idiomas soporta realmente y con que calidad.
- Integracion incierta de MTP y vision: el autor afirma que esos componentes proceden de Qwen/Qwen3.5-4B, pero no documenta como se integran ni si funcionan correctamente en este checkpoint.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Responsabilidad legal y etica: el autor declina cualquier responsabilidad sobre las consecuencias del uso y recomienda limitarlo a investigacion, pruebas o entornos controlados, evitando su empleo directo en produccion o en aplicaciones comerciales de cara al publico.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero esa permisividad no exime al usuario de cumplir la normativa aplicable sobre contenido generado.
- Contexto declarado no verificado: los 262.144 tokens provienen de un ejemplo de invocacion, no de una ficha tecnica de arquitectura. La calidad real de recuperacion en ventanas tan largas no esta medida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo citado como origen de los componentes MTP y visual: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de abliteracion citada: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ko-fi del autor: https://ko-fi.com/huihuiai
