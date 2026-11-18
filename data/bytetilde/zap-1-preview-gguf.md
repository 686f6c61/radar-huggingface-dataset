# bytetilde/zap-1-preview-gguf

## Resumen

Zap-1 Preview es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM3-1.7B, publicado por el usuario bytetilde en formato GGUF para su uso con llama.cpp. Su objetivo declarado es que el modelo emita una respuesta final clara sin quedarse atascado en cadenas de razonamiento largas: aprende a generar una etiqueta de esfuerzo (`none`, `low`, `medium` o `high`) antes de responder, de modo que las peticiones faciles se resuelvan con poco o ningun razonamiento y las dificiles dispongan de mas margen.

El modelo base es LFM3, una arquitectura hibrida de 24 capas que combina 13 capas de convolucion corta, 6 capas de atencion completa y 5 de atencion con ventana deslizante de 256 tokens, con atencion de consultas agrupadas (16 cabezas de consulta y 4 de clave/valor). Tiene 1.728.801.600 parametros y una longitud de contexto configurada de 262.144 tokens, con un vocabulario de 128.000 tokens.

Es relevante porque explora el control explicito del presupuesto de razonamiento en un modelo pequeno (1,7 mil millones de parametros) y lo distribuye ya cuantizado en Q8_0 (1,85 GB) y Q4_K_M (1,10 GB), lo que permite ejecutarlo en hardware de consumo. Conviene tener en cuenta que el autor indica que el entrenamiento no se ha completado y que la version final deberia ofrecer mejor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (hibrida: convolucion corta, atencion completa y atencion con ventana deslizante; GQA) |
| Parametros totales | 1.728.801.600 (1,73 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens configurados; ventana de atencion deslizante de 256 tokens |
| Tipos de cuantizacion | Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`), con limitacion de uso comercial ligada a los ingresos anuales |
| Formato de pesos | GGUF (tambien existen pesos safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura es LFM3, un transformer hibrido con 24 capas distribuidas en 13 capas de convolucion corta, 6 capas de atencion completa y 5 capas de atencion con ventana deslizante de 256 tokens. El tamano oculto es de 2.048 y el de la capa feed-forward de 7.680; emplea atencion de consultas agrupadas con 16 cabezas de consulta, 4 de clave/valor y dimension de 128 por cabeza. El vocabulario es de 128.000 tokens y la revision del modelo base utilizada es `1da06bec6a819da10b54c67e5c90972b46d81871`.

El entrenamiento consiste en un ajuste fino supervisado sobre LFM3-1.7B orientado a la gestion del esfuerzo de razonamiento. El modelo aprende a comenzar la respuesta con una decision corta de esfuerzo y una de cuatro etiquetas (`none`, `low`, `medium`, `high`) con el formato `<zap>decision<zapthink>level</zap>`, seguida opcionalmente de un bloque `` antes de la respuesta final; la etiqueta `none` esta pensada para omitir dicho bloque. La etiqueta la genera el propio modelo, no la impone el entorno de ejecucion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional para chat de uso cotidiano.
- Razonamiento con presupuesto adaptativo: el modelo decide por si mismo el nivel de esfuerzo (`none`, `low`, `medium`, `high`) antes de responder.
- Emision opcional de un bloque de razonamiento `<think>...</think>` intermedio antes de la respuesta final.
- Contexto largo: hasta 262.144 tokens configurados, con atencion deslizante de 256 tokens en parte de las capas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se enumeran idiomas).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Chat de uso cotidiano con coste de computo variable: el modelo puede resolver consultas sencillas con la etiqueta `none` y evitar el bloque de razonamiento, reduciendo tokens generados y latencia en preguntas triviales.
- Asistentes integrados en portatiles o equipos sin GPU dedicada: la cuantizacion Q4_K_M de 1,10 GB permite ejecutar el modelo en CPU con llama.cpp y mantener una interfaz conversacional local.
- Procesamiento de documentos largos en local: la ventana configurada de 262.144 tokens permite cargar contratos, articulos o transcripciones extensas, aunque la atencion deslizante de 256 tokens limita el detalle fino en tramos muy alejados.
- Experimentacion con control de razonamiento: util para investigadores que quieran estudiar como un modelo pequeno distribuye su presupuesto de pensamiento segun la dificultad del prompt, tratando la etiqueta y el bloque `<think>` como campos opcionales de salida.
- Clasificacion y extraccion de informacion en pipelines ligeros: al ser un modelo pequeno y cuantizado, puede desplegarse en multiples instancias para tareas de resumen o extraccion con contexto medio.
- Prototipado rapido de interfaces de chat: el formato de etiqueta estructurada permite construir una UI que muestre u oculte el razonamiento segun el nivel elegido por el modelo.
- Evaluacion de ajustes finos sobre LFM3: sirve como referencia para comparar el efecto del SFT en la calidad y la verbosidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,10 GB con Q4_K_M y 1,85 GB con Q8_0, mas el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050, RTX 4060); con Q8_0 se recomienda partir de 6 GB. En entornos de servidor, A100, H100 o L40S permiten desplegar muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con la cuantizacion Q4_K_M; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (requiere una build con soporte de LFM3; los GGUF se generaron con la build 12015, `a34de8618`). El uso con vLLM, TGI u Ollama no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zap-1 Preview (este modelo) | 1,73 mil millones | 262.144 tokens configurados | LFM Open License v1.0 (uso comercial limitado por ingresos) | GGUF (Q8_0, Q4_K_M) | SFT sobre LFM3-1.7B con etiqueta de esfuerzo de razonamiento; entrenamiento no completado |
| LiquidAI/LFM3-1.7B (modelo base) | 1,73 mil millones | 262.144 tokens configurados | LFM Open License v1.0 | safetensors (y GGUF derivados) | Modelo original de Liquid AI; sin el mecanismo de etiqueta de esfuerzo |
| Alternativas de ~1-2 mil millones de parametros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

## Limitaciones y advertencias

- El autor indica explicitamente que el entrenamiento no se ha completado; la version final deberia ser mejor en calidad, por lo que los resultados actuales no son representativos del modelo terminado.
- La etiqueta de esfuerzo y el bloque `<think>` son campos de salida opcionales y no garantizan la correccion de la respuesta; no deben tratarse como senal de fiabilidad.
- La licencia LFM Open License v1.0 incluye una limitacion de uso comercial vinculada a los ingresos anuales; es necesario revisar el texto de la licencia antes de un uso en produccion.
- No se documentan los idiomas soportados, por lo que el comportamiento multilingue no esta verificado.
- No hay informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- La ventana de atencion deslizante de 256 tokens en parte de las capas puede degradar la recuperacion de informacion muy localizada en contextos extremadamente largos.
- El modelo solo se distribuye en GGUF y requiere una build de llama.cpp con soporte de LFM3; otras herramientas de inferencia no estan verificadas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bytetilde/zap-1-preview-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: LICENSE (referenciada en el repositorio del modelo)
