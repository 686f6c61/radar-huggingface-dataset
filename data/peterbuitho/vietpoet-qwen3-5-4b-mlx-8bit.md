# peterbuitho/VietPoet-Qwen3.5-4B-MLX-8bit

## Resumen

VietPoet-Qwen3.5-4B-MLX-8bit es una version cuantizada a 8 bits en formato MLX del modelo VietPoet-Qwen3.5-4B, un ajuste fino de Qwen3.5-4B especializado en poesia vietnamita en metro *luc bat* (versos alternos de 6 y 8 silabas). Lo publica el usuario peterbuitho y esta pensado exclusivamente para ejecutarse en Apple Silicon a traves de la libreria MLX. El repositorio ocupa 4,5 GB y contiene 4.205.751.296 parametros en safetensors, con una licencia Apache-2.0 heredada del modelo base.

El problema que resuelve es muy concreto: generar poemas que respeten las reglas formales del luc bat (longitud 6/8, patrones de tono en las posiciones 2, 4 y 6 y rima entre el sexto verso y el octavo). Para ello el autor no confia solo en el modelo: proporciona un muestreador linea a linea con verificador de reglas en el repositorio ThoLucBat, que genera 16 candidatos por linea y descarta los que no cumplen el patron. Con ese muestreador el modelo alcanza una puntuacion de reglas de 0,992 y un 95% de poemas totalmente validos sobre 40 prompts reservados; sin el, la puntuacion cae a 0,81.

Es relevante ahora porque ilustra un patron util para modelos pequenos especializados: combinar un ajuste fino QLoRA ligero (8.000 poemas, 2 epocas) con decodificacion restringida externa para obtener una fiabilidad formal muy alta en un dominio con reglas verificables, y distribuir el resultado en varios formatos (MLX 8 y 4 bits, pesos de 16 bits, GGUF) segun el hardware del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.5-4B); no se detallan mas especificaciones en la informacion disponible |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX 8 bits (aproximadamente 8,5 bits por peso; 4,5 GB). El autor ofrece ademas una version MLX 4 bits, pesos de 16 bits y archivos GGUF |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); existen tambien GGUF y pesos de 16 bits en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parametros publicado por el equipo Qwen bajo licencia Apache-2.0. El ajuste fino se realizo con QLoRA sobre 8.000 poemas durante 2 epocas, usando el corpus phamson02/vietnamese-poetry-corpus (CC BY 4.0) filtrado previamente para conservar unicamente composiciones que superan un verificador de reglas de luc bat. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el procedimiento descrito es un ajuste supervisado con QLoRA.

La innovacion practica del proyecto no esta en la arquitectura, sino en el pipeline de decodificacion. El modelo se usa junto al muestreador y verificador de reglas del repositorio ThoLucBat: para cada linea se piden 16 muestras, se comprueban las restricciones de longitud (6/8), tono y rima, y solo se conservan las candidatas validas. Esto convierte una tarea de generacion libre en una tarea de verificacion y seleccion. La conversion a MLX se realizo con `mlx_lm.convert -q --q-bits 8`, y el autor documenta varias peculiaridades de `mlx_lm.server` 0.31.3 que afectan al pipeline: es necesario `--prompt-cache-size 0` para evitar un `IndexError` cuando un prompt coincide con uno cacheado (situacion que provoca el muestreador en cada linea), el campo `model` de la peticion debe ser `default_model` o la ruta local, el parametro `n` se ignora y `logprobs` debe enviarse como `true` booleano.

## Capacidades

- Generacion de texto en vietnamita con especializacion en poesia luc bat, con formato de salida controlado por el muestreador externo.
- Conversacion en formato chat de Qwen (`<|im_start|>`, `<|im_end|>`), con el bloque de razonamiento `<think>` vacio y desactivado.
- Escritura de poemas a partir de un titulo o tema breve; la longitud se solicita en el prompt (por ejemplo, "8 cau").
- Cumplimiento de restricciones formales verificables (longitud 6/8, tonos en posiciones determinadas, rima) cuando se combina con el muestreador y el verificador del repositorio ThoLucBat.
- Integracion con `mlx_lm.server` mediante API compatible con OpenAI, lo que permite conectarlo a interfaces web como la del propio repositorio.
- Capacidades multilingues: unicamente vietnamita declarado; no se documenta soporte de otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, vision ni audio. Tampoco se declaran capacidades de codigo o matematicas, y el ajuste fino esta orientado en exclusiva al dominio poetico.

## Casos de uso

- Composicion asistida de poemas luc bat: el modelo genera candidatos de linea y el verificador del repositorio ThoLucBat selecciona los que cumplen las reglas de 6/8, tono y rima, de modo que el usuario final recibe un poema formalmente valido sobre el tema indicado.
- Aplicaciones de escritorio para escritores en macOS: el paquete de LM Studio descrito en el repositorio ThoLucBat configura el modelo y el muestreador listos para usar en Apple Silicon, sin necesidad de escribir codigo.
- Generacion de contenido editorial en vietnamita: tarjetas, dedicatorias o textos conmemorativos en metro luc bat, donde la forma correcta es el requisito principal y el significado puede revisarse despues.
- Investigacion en decodificacion restringida: el par modelo mas muestreador sirve como banco de pruebas reproducible para comparar estrategias de seleccion de candidatos en dominios con reglas verificables (puntuacion de 0,81 sin muestreador frente a 0,992 con el).
- Herramientas educativas sobre prosodia vietnamita: el modelo puede producir ejemplos etiquetados como validos o invalidos segun el verificador, utiles para materiales de ensenanza del luc bat.
- Base para ajustes finos posteriores en otros metros o generos poeticos vietnamitas: al estar bajo Apache-2.0 y derivar de Qwen3.5-4B, el coste de reentrenamiento con QLoRA es bajo.
- Evaluacion comparativa de formatos de cuantizacion: al existir versiones MLX de 8 y 4 bits, pesos de 16 bits y GGUF, el mismo prompt permite medir la perdida de calidad formal introducida por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas aportadas son especificas del dominio y miden la forma del poema, no su calidad literaria:

| Metrica | Valor | Configuracion |
|---|---|---|
| Puntuacion de reglas (rule score) | 0,992 | MLX 8 bits con muestreador, 40 prompts reservados de tipo "8 cau", `mlx_lm.server` sobre Apple M2 Pro |
| Poemas totalmente validos | 95% | misma configuracion |
| Puntuacion de reglas | 0,994 | modelo de 16 bits con vLLM, 100 prompts |
| Poemas totalmente validos | 98% | misma configuracion |
| Puntuacion de reglas sin muestreador | aproximadamente 0,81 | modelo bruto, sin verificador de reglas |
| Lineas *bat* que incumplen la regla de tono de la sexta y octava silaba | 38% | modelo bruto, sin muestreador |
| Tiempo por poema de 8 lineas | 75 a 85 segundos | 16 muestras por linea, M2 Pro de 16 GB con `mlx_lm.server` |

El propio autor advierte de que estas cifras evaluan la forma y no la poesia: los poemas son luc bat correctos, pero el significado suele ser vago o estar fuera de tema, porque los prompts de entrenamiento solo incluian el titulo como asunto.

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon: MLX no se ejecuta en GPUs NVIDIA o AMD. Este repositorio no es utilizable en CUDA.
- Peso de los archivos: 4,5 GB para la version de 8 bits. Con memoria unificada se recomienda un minimo practico de 8 GB y, para trabajar comodamente con la cache y el servidor, 16 GB.
- Hardware validado por el autor: Apple M2 Pro con 16 GB, sobre el que un poema de 8 lineas con 16 muestras por linea tarda entre 75 y 85 segundos.
- Alternativas sin Apple Silicon: usar los pesos de 16 bits con vLLM (98% de poemas validos sobre 100 prompts) o los archivos GGUF con llama.cpp u Ollama.
- Opciones de despliegue: `mlx_lm.server` con la API compatible con OpenAI, la version de 4 bits para equipos con menos memoria, LM Studio en macOS mediante el paquete del repositorio ThoLucBat, y vLLM o llama.cpp para las variantes de 16 bits y GGUF respectivamente.
- Ajustes obligatorios del servidor: `--prompt-cache-size 0`, nombre de modelo `default_model`, `logprobs` como booleano `true` y un maximo de 8 peticiones simultaneas; con 16 conexiones concurrentes el servidor reinicia la conexion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos publicos de generacion de poesia vietnamita luc bat con los que comparar directamente. La comparacion mas util es entre las propias variantes distribuidas por el autor, que cubren el mismo modelo con distintos formatos y precisiones:

| Variante | Precision o formato | Tamano | Rendimiento formal | Hardware objetivo |
|---|---|---|---|---|
| VietPoet-Qwen3.5-4B-MLX-8bit | MLX 8 bits (aproximadamente 8,5 bits por peso) | 4,5 GB | 0,992 de puntuacion de reglas y 95% de poemas validos (40 prompts, M2 Pro) | Apple Silicon |
| VietPoet-Qwen3.5-4B-MLX-4bit | MLX 4 bits | aproximadamente la mitad, segun el autor | no disponible | Apple Silicon con menos memoria |
| VietPoet-Qwen3.5-4B | 16 bits | no disponible | 0,994 y 98% de poemas validos (100 prompts, vLLM) | GPU con vLLM |
| VietPoet-Qwen3.5-4B-GGUF | GGUF (cuantizaciones no detalladas) | no disponible | no disponible | CPU y GPU con llama.cpp u Ollama |

Frente al modelo base Qwen3.5-4B, la diferencia relevante es la especializacion en luc bat y la integracion con el verificador de reglas; no hay datos publicados que comparen ambos en tareas generales.

## Limitaciones y advertencias

- Sesgos y calidad literaria: el autor indica explicitamente que las metricas miden la forma y no la poesia. Los poemas respetan el metro pero el significado suele ser vago o estar fuera del tema solicitado, porque el entrenamiento solo uso el titulo como asunto.
- Dependencia del muestreador: sin el verificador externo, la puntuacion de reglas baja a aproximadamente 0,81 y el 38% de las lineas *bat* incumplen la regla de tono de la sexta y octava silaba. Usar el modelo "en crudo" produce resultados sensiblemente peores.
- Riesgo de alucinacion: no se documenta una evaluacion de veracidad; en un modelo de generacion poetica la nocion de alucinacion se manifiesta como contenido fuera de tema o sin sentido, no como datos falsos verificables.
- Limitacion idiomatica: solo se declara vietnamita. No hay evidencia de un rendimiento aceptable en castellano ni en otros idiomas.
- Longitud de contexto: no disponible. No se documenta el contexto efectivo ni su comportamiento en conversaciones largas; el uso previsto es la generacion de poemas cortos a partir de un titulo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el corpus de entrenamiento (phamson02/vietnamese-poetry-corpus) se distribuye bajo CC BY 4.0, por lo que la atribucion correspondiente debe conservarse.
- Caveats de produccion: las peculiaridades documentadas de `mlx_lm.server` 0.31.3 (cache de prompt que provoca `IndexError`, ignorancia del parametro `n`, `logprobs` booleano, limite de conexiones concurrentes, aparicion del token `<|im_end|>` como texto) obligan a adaptar cualquier integracion. El pipeline lanza 16 peticiones por linea, lo que multiplica la carga del servidor.
- Rendimiento: 75 a 85 segundos por poema de 8 lineas en un M2 Pro de 16 GB hace inviable el uso interactivo en tiempo real con la configuracion de muestreo completa.
- Baja traccion: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe validacion externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-MLX-8bit
- Modelo base (16 bits): https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B
- Version MLX de 4 bits: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-MLX-4bit
- Archivos GGUF: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del muestreador y verificador de reglas: https://github.com/peterbuitho/ThoLucBat
- Dataset de entrenamiento: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Articulo de referencia sobre puntuacion de poesia vietnamita: https://arxiv.org/abs/2401.01078
- Libreria MLX: https://github.com/ml-explore/mlx
