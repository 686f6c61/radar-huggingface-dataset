# d-michail/Mitos-Qwen3-8B-Process-LoRA

## Resumen

Mitos-Qwen3-8B-Process-LoRA es un adaptador LoRA (PEFT) sobre el modelo base Qwen3-8B, desarrollado por el usuario d-michail, para responder preguntas en griego sobre tramites de la administracion publica helena. El dominio concreto es el Εθνικο Μητρωο Διοικητικων Διαδικασιων (ΕΜΔΔ / Mitos), el registro nacional de procedimientos administrativos de Grecia, cuyos textos estructurados se transformaron en 90.145 registros de pregunta-respuesta que cubren las 4.407 fichas de procedimiento del snapshot utilizado.

El adaptador no introduce arquitectura nueva: reutiliza el transformer decoder-only de Qwen3-8B (8.000 millones de parametros) y anade modulos LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP. Se entreno durante 2 epocas con longitud maxima de 4.096 tokens, plantilla de chat de Qwen3 y modo de razonamiento desactivado (enable_thinking=False). El repositorio incluye dos adaptadores: la raiz, entrenada con las 4.407 fichas, y holdout/, entrenada con 4.187 fichas excluyendo las 220 reservadas para evaluacion.

Su relevancia es doble: por un lado demuestra un flujo de destilacion de datos estructurados de un registro publico a un asistente conversacional sin usar un LLM para la generacion de los datos; por otro, publica una evaluacion con metricas sin juez sobre 1.933 preguntas que cuantifica la brecha entre el modo closed-book y varios esquemas de RAG. La licencia es CC BY-SA 4.0, heredada del contenido del registro, y el uso previsto es investigacion, no asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA; rango 16, alpha 32, sobre proyecciones de atencion y MLP |
| Parametros totales | 8.000 millones (modelo base Qwen/Qwen3-8B); adaptador LoRA adicional no cuantificado en la ficha (repositorio de 0,4 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens en el entrenamiento del adaptador; el modelo base Qwen3-8B declara 32.768 tokens nativos |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors (bfloat16); no se listan cuantizaciones propias. El modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | griego (codigo el) para el dominio entrenado; el modelo base es multilingue pero no se evalua aqui |
| Licencia | CC BY-SA 4.0 para los pesos del adaptador; el modelo base Qwen3 es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only denso de la familia Qwen3. La configuracion LoRA es rango 16, alpha 32, aplicada a todas las proyecciones de atencion y MLP. La optimizacion usa tasa de aprendizaje 2e-4 con planificador coseno, 2 epocas, lote efectivo de 32 y precision bfloat16. La longitud maxima de secuencia es 4.096 tokens. La funcion de perdida es entropia cruzada estandar calculada unicamente sobre los tokens del asistente, con la plantilla de chat de Qwen3 y el modo de pensamiento desactivado.

Los datos proceden exclusivamente del snapshot del registro Mitos descargado los dias 1 y 2 de octubre de 2026 (registros actualizados entre el 26 de junio y el 1 de octubre de 2026). El texto estructurado de cada procedimiento se segmento en temas y se convirtio en dialogos o pares de pregunta-respuesta mediante plantillas, sin intervencion de un LLM, generando 90.145 registros sobre 4.407 procedimientos. La model card indica que los dialogos de entrenamiento se generaron con Qwen3.8-27B (Apache-2.0), segun la propia redaccion del autor. No se documenta ninguna innovacion de decodificacion (no hay decodificacion especulativa, atencion lineal ni variantes SSM).

## Capacidades

- Generacion de texto conversacional en griego centrada en procedimientos administrativos: requisitos, plazos, documentos, tasas y pasos de tramitacion.
- Respuesta a preguntas de ciudadanos sobre el registro Mitos, tanto en modo closed-book como con contexto inyectado (prompt de recuperacion incluido en la model card).
- Respuestas largas y estructuradas que reproducen el formato de las entradas del registro (la evaluacion reporta 83-139 palabras de media segun el esquema).
- Abstención explicita: el prompt recomendado instruye al modelo a declarar cuando la informacion proporcionada no basta para responder.
- Integracion en pipelines RAG: el adaptador se ha evaluado con tres estrategias de recuperacion distintas (chunks a nivel de campo, ventanas divididas y procedimientos completos).
- Soporte de tool calling o function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento desactiva explicitamente el modo de pensamiento de Qwen3.
- Capacidades multilingues: no disponibles mas alla del griego; el ajuste se realizo solo sobre datos en griego.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al ciudadano sobre tramites administrativos: el modelo se integra como generador final de un pipeline RAG que recupera fragmentos del registro Mitos; el prompt incluido fuerza respuestas basadas solo en el contexto recuperado y obliga a admitir cuando la informacion no basta. El esquema de chunks a nivel de campo es el que mejores cifras obtiene (0,554 de key-fact recall).
- Portal de autoservicio para administraciones publicas helenas: desplegado detras de una interfaz de busqueda, responde en griego a preguntas del tipo "que documentos necesito para X" citando el procedimiento correspondiente y enlazando a https://id.mitos.gov.gr/<ID de 6 digitos>.
- Investigacion sobre QA en dominio administrativo: el adaptador holdout/ (4.187 procedimientos, sin las 220 fichas reservadas) permite reproducir la tabla de resultados de la model card sobre 1.933 preguntas con metricas independientes de juez.
- Generacion de resumenes y normalizacion de fichas de procedimiento: al haberse entrenado sobre el formato del registro, el modelo reproduce la estructura de las entradas y sirve para reescribir o condensar descripciones de tramites.
- Asistente interno para empleados publicos: apoyo en la localizacion de requisitos y plazos dentro del corpus, siempre con verificacion humana posterior contra el procedimiento en vivo.
- Backend conversacional para asistentes de voz o chat en griego: el modelo puede actuar como capa de generacion de un bot telefonico o de chat, con penalizacion de repeticion y reglas de parada para evitar bucles degenerativos.
- Evaluacion comparativa de estrategias de recuperacion: sirve como sistema de referencia para medir el efecto del troceado de documentos (campo, ventana o procedimiento completo) en la precision de las respuestas.
- Prototipado rapido con coste bajo: al ser un adaptador LoRA de 0,4 GB, se puede cargar sobre el modelo base en una unica GPU de consumo y probar variantes sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Resultados publicados en la model card para el adaptador `holdout/`, con metricas sin juez sobre 1.933 preguntas. "Base" se refiere al recuerdo de hechos clave del modelo sin ajustar de referencia.

| Sistema | Key-fact recall (base) | Key-fact recall (modelo) | Token F1 (modelo) | Palabras (modelo) |
|---|---|---|---|---|
| Closed-book | 0,043 | 0,119 | 0,157 | 135 |
| RAG (chunks a nivel de campo) | 0,442 | 0,554 | 0,348 | 83 |
| RAG-split (ventanas) | 0,260 | 0,344 | 0,270 | 116 |
| RAG-process (procedimientos completos) | 0,236 | 0,296 | 0,223 | 139 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 8.000 millones de parametros, cifras orientativas): aproximadamente 16-17 GB en bfloat16/fp16, 9-10 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits.
- El adaptador LoRA anade una sobrecarga pequena (repositorio de 0,4 GB); puede fusionarse con el modelo base para eliminar el coste de runtime de PEFT.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para bfloat16 en una sola tarjeta.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 a precision completa, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 8 GB) con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft (via indicada en la model card), vLLM, TGI y SGLang con soporte de adaptadores LoRA en runtime; llama.cpp u Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros modelos comparables de QA administrativa en griego. La comparacion se limita a las variantes directamente relacionadas.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-8B | 8.000 millones | 32.768 tokens nativos | Denso, sin ajuste | Apache-2.0 | HuggingFace |
| Mitos-Qwen3-8B-Process-LoRA (raiz) | 8.000 millones + LoRA r16 | 4.096 tokens de entrenamiento | Adaptador LoRA sobre 4.407 procedimientos | CC BY-SA 4.0 | HuggingFace |
| Mitos-Qwen3-8B-Process-LoRA (holdout/) | 8.000 millones + LoRA r16 | 4.096 tokens de entrenamiento | Adaptador LoRA sobre 4.187 procedimientos, para evaluacion | CC BY-SA 4.0 | HuggingFace |
| d-michail/Mitos-Qwen3-8B-Process | 8.000 millones | 4.096 tokens de entrenamiento | Modelo fusionado (LoRA integrado en los pesos) | CC BY-SA 4.0 | HuggingFace |

## Limitaciones y advertencias

- No es asesoramiento legal: las respuestas no tienen valor normativo y el registro cambia con el tiempo; un sistema en produccion debe mostrar la fuente, la fecha de recuperacion y el enlace al procedimiento oficial.
- Alucinacion de datos concretos: el modelo puede afirmar importes, plazos o documentos incorrectos. En modo closed-book apenas aprende los hechos (key-fact recall de 0,119) aunque si capta el registro y el formato del dominio.
- Dependencia de la recuperacion: la mayor parte de la exactitud proviene del RAG; sin contexto fiable, el rendimiento cae drasticamente.
- Bucles de repeticion: modelos de este tamano pueden degenerar en repeticiones que llegan al limite de tokens; conviene usar penalizacion de repeticion o reglas de parada.
- Datos sinteticos y de una unica instantanea: los dialogos se generaron con plantillas a partir de un snapshot (descargado el 1-2 de octubre de 2026) y pueden reproducir errores y frases del generador; el modelo queda desactualizado a medida que cambian los procedimientos.
- Completitud del origen no garantizada: los terminos de uso de mitos.gov.gr (clausula A.6) no garantizan la exactitud ni la integridad del contenido, por lo que el modelo tampoco puede hacerlo.
- Cobertura idiomatica: solo griego. No hay evaluacion de su comportamiento en otros idiomas.
- Advertencia de evaluacion: el adaptador de la raiz del repositorio ha visto las 220 fichas reservadas; no debe evaluarse sobre el split `unseen`. Para reproducir los numeros hay que usar `holdout/`.
- Licencia share-alike: CC BY-SA 4.0 obliga a atribuir y a distribuir las obras derivadas bajo la misma licencia, lo que puede condicionar el uso comercial y la integracion en productos propietarios.
- Modo de pensamiento desactivado: el modelo se entreno con `enable_thinking=False` y sin system prompt; usarlo con otra configuracion degrada la calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Process-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Process
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa (config `json-all`)
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Registro nacional de procedimientos administrativos (Mitos): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su ID de 6 digitos: https://id.mitos.gov.gr/
- Paper: pendiente de publicacion segun la model card (no disponible)
