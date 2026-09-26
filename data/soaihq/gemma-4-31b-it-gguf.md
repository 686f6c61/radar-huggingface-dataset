# SoAIHQ/gemma-4-31B-it-GGUF

## Resumen

SoAIHQ/gemma-4-31B-it-GGUF es una redistribucion en formato GGUF del modelo google/gemma-4-31B-it, publicada por SoAI. No se trata de un modelo entrenado desde cero, sino de una cuantizacion del modelo denso multimodal de Google, pensada para ejecutarse en llama.cpp tanto en GPU como en CPU. El modelo base es un transformer denso de 30.697.345.596 parametros (aproximadamente 30,7B) con entrada de imagen y una ventana de contexto de 262.144 tokens (256K).

Su relevancia practica esta en el empaquetado: el repositorio ofrece dos cuantizaciones (Q4_K_M de 18,7 GB y Q8_0 de 32,6 GB) mas un proyector multimodal mmproj en F16 de 1,2 GB. La cuantizacion Q4_K_M se ha generado con una importance matrix (imatrix) calculada por SoAI sobre un corpus propio de chat multi-turno, codigo, llamadas a herramientas y matematicas, en lugar de texto web generico, con el objetivo de preservar mejor la calidad en los casos de uso reales del modelo.

El modelo esta publicado bajo licencia apache-2.0, aunque el enlace de licencia apunta a la licencia especifica de Gemma 4 de Google, una discrepancia que conviene revisar antes de un uso comercial. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes, por lo que no existe aun validacion de la comunidad sobre la calidad de estas cuantizaciones concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense (transformer denso, segun la model card) |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M, Q8_0; proyector multimodal mmproj en F16. SoAI no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+); el corpus de calibracion cubre chat multi-turno en 21 idiomas y codigo en 22 lenguajes de programacion |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp). El modelo base esta en safetensors |
| Entradas | Texto e imagen; audio no soportado |
| Razonamiento | Thinking configurable, activable por peticion |
| Tool calling | Si |
| Tamano del repositorio | 52,5 GB |
| Version de llama.cpp indicada | v0.5.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer denso de 30,7B parametros con soporte de entrada de imagen y ventana de 262.144 tokens. Es multimodal en la direccion imagen-texto-a-texto (`pipeline_tag: image-text-to-text`), no soporta audio y permite activar o desactivar el modo de razonamiento por peticion mediante `chat_template_kwargs: {"enable_thinking": true}` en llama-server. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

El trabajo de SoAI se centra en la cuantizacion y no en el entrenamiento. Q4_K_M se genera con una importance matrix que indica a llama.cpp que pesos afectan mas a la salida para almacenarlos con mayor precision; esa imatrix se calcula sobre un corpus propio de calibracion formateado con la plantilla de chat del modelo, incluida su sintaxis nativa de tool calling. Q8_0 se cuantiza sin imatrix porque el formato Q8_0 de llama.cpp no la utiliza. Antes de cuantizar, el proceso verifica que los marcadores de chat, thinking y tool call se almacenan como tokens especiales y que la plantilla de chat embebida coincide con la original; si la conversion los importa como texto plano, el proceso se detiene en lugar de publicar el fichero. El fichero de imatrix y la tabla de procedencia (revision original y commit de llama.cpp) se publican en el repositorio para permitir reconstruir los ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking configurable, activable o desactivable por peticion.
- Entrada de imagenes cuando se carga el proyector `mmproj-gemma-4-31B-it-f16.gguf` con `--mmproj`.
- Tool calling o function calling con sintaxis nativa incluida en la plantilla de chat y usada tambien en la calibracion de la imatrix.
- Soporte de agentes y razonamiento multi-paso, derivado de la combinacion de tool calling y modo thinking.
- Capacidades multilingues: 35+ idiomas declarados, con preentrenamiento en 140+; la imatrix se calibro con chat en 21 idiomas.
- Capacidades de codigo: la imatrix incluye ediciones de codigo en 22 lenguajes de programacion.
- Matematicas paso a paso, incluidas en el corpus de calibracion.
- No soporta audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno largas apoyandose en la ventana de 262.144 tokens, lo que permite arrastrar el historial completo de un caso sin truncar contexto ni recurrir a resumenes intermedios.
- Generacion y refactorizacion de codigo en produccion: la calibracion de la imatrix incluye ediciones en 22 lenguajes, y el soporte de tool calling permite integrarlo en pipelines que consulten repositorios, ejecuten tests o apliquen parches.
- Agentes autonomos con herramientas: la sintaxis nativa de tool call y el modo thinking configurable por peticion permiten construir bucles de razonamiento multi-paso donde el modelo decide cuando invocar una herramienta y cuando razonar sin llamadas externas.
- Analisis de documentos con imagenes: al cargar el mmproj, el modelo puede procesar capturas, diagramas o documentos escaneados y combinarlos con texto en la misma ventana de contexto.
- Asistentes de codigo locales: la cuantizacion Q4_K_M de 18,7 GB permite desplegar un asistente de programacion en una estacion de trabajo con una sola GPU de 24 GB o con memoria unificada, sin enviar codigo a servicios externos.
- Razonamiento matematico y tutorizacion: el modo thinking y la calibracion sobre matematicas paso a paso lo hacen util para explicar resoluciones detalladas en lugar de solo dar el resultado.
- Procesamiento por lotes en CPU: llama.cpp puede repartir capas entre GPU y CPU, lo que permite ejecutar Q4_K_M en servidores sin GPU para tareas de baja concurrencia y alto volumen.
- Servicio con API compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, lo que facilita sustituir un proveedor externo por este modelo en aplicaciones ya escritas contra la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas respecto al modelo base sin cuantizar. El unico dato cualitativo aportado es que Q4_K_M mantiene una calidad cercana a los pesos de 16 bits y que Q8_0 es practicamente sin perdida, pero sin cifras que lo respalden.

## Requisitos de hardware

Las cifras de VRAM que siguen se derivan del tamano de los ficheros publicados, no de mediciones oficiales del autor; hay que anadir el espacio de la cache KV, que crece con la longitud de contexto configurada.

- Q4_K_M: 18,7 GB de pesos. Con contexto moderado, cabe en GPU de 24 GB (RTX 4090, RTX 3090, L4, A10G) dejando poco margen, o en GPU de 40/48 GB (A100 40GB, L40S, A6000) con holgura.
- Q8_0: 32,6 GB de pesos. Requiere GPU de 40 GB o superior, o 48-80 GB si se quiere contexto largo. En una RTX 4090 de 24 GB solo cabria con reparto de capas entre GPU y CPU.
- Proyector multimodal: 1,2 GB adicionales en F16 cuando se usa entrada de imagen.
- Contexto completo de 262.144 tokens: la cache KV a esa longitud es muy exigente en memoria; en la practica habria que reservar decenas de GB adicionales o recurrir a cuantizacion de la cache KV y a contextos menores.
- Consumer GPU: Q4_K_M es la unica opcion realista en tarjetas de 24 GB, y con margen limitado para contexto largo. Q8_0 no cabe en una consumer GPU de 24 GB sin offload a CPU.
- Memoria unificada: los 18,7 GB de Q4_K_M encajan comodamente en equipos Apple Silicon de 32 GB o mas, que es probablemente el escenario mas favorable para esta cuantizacion.
- Despliegue: llama.cpp y llama-server (API compatible con OpenAI, interfaz de chat integrada, descarga automatica del mmproj con `-hf`). Reparto de capas entre GPU y CPU soportado. No se mencionan en la informacion proporcionada otros runtimes como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Ajustes de muestreo recomendados por Google: temperature 1.0, top_p 0.95, top_k 64, identicos con thinking activado o desactivado.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de otros modelos comparables (parametros, contexto, rendimiento o licencia), por lo que no es posible construir una comparativa externa fiable. La unica comparacion documentada es contra el propio modelo base, del que esta cuantizacion deriva.

| Modelo | Parametros | Contexto | Formato | Licencia | Entrada de imagen | Disponibilidad |
|---|---|---|---|---|---|---|
| SoAIHQ/gemma-4-31B-it-GGUF (Q4_K_M / Q8_0) | 30,7B | 262.144 tokens | GGUF, 18,7 GB / 32,6 GB | apache-2.0 (enlace a licencia Gemma 4) | Si, con mmproj | HuggingFace, 0 descargas |
| google/gemma-4-31B-it (base, sin cuantizar) | 30,7B | 262.144 tokens | safetensors | Segun licencia de Gemma 4 | Si | HuggingFace |
| Otros modelos de ~30B densos multimodales | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion proporcionada. Al ser una cuantizacion del modelo base de Google, hereda los sesgos de este, pero no hay datos que los cuantifiquen.
- Alucinacion: no se aportan tasas de alucinacion ni evaluaciones de fidelidad. El riesgo es el habitual en modelos generativos y no esta caracterizado para esta cuantizacion.
- Discrepancia de licencia: la etiqueta del repositorio indica apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google, que impone condiciones adicionales de uso. Hay que verificar cual aplica realmente antes de un uso comercial.
- Validacion inexistente: 0 descargas y 0 likes. No hay evidencia publica de que estas cuantizaciones concretas funcionen correctamente en produccion; el autor no publica resultados de calidad ni comparativas contra los pesos originales.
- Perdida por cuantizacion: Q4_K_M es una cuantizacion de 4 bits con perdida. Aunque SoAI afirma que se mantiene cerca de los pesos de 16 bits, no aporta mediciones que lo respalden, y no se publican cuantizaciones por debajo de 4 bits.
- Soporte de idiomas: se declaran 35+ idiomas, pero el corpus de calibracion de la imatrix solo cubre 21 idiomas para chat, por lo que el rendimiento fuera de ese conjunto puede degradarse mas de lo que sugiere la cifra de 140+ idiomas de preentrenamiento.
- Contexto largo en la practica: el limite de 262.144 tokens es teorico respecto al hardware. Alcanzarlo exige cantidades de memoria para la cache KV que no estan cubiertas por el tamano de los ficheros publicados.
- Falta de datos de rendimiento: sin benchmarks ni mediciones de latencia o throughput, no es posible estimar costes de servicio ni comparar con alternativas.
- Versionado de llama.cpp: la model card menciona llama.cpp v0.5.0; conviene confirmar compatibilidad con la version concreta que se use, especialmente por el tratamiento de tokens especiales y plantilla de chat.
- Dependencia de Google: el modelo base y su licencia dependen del repositorio de Google; cambios en el modelo base o en sus condiciones afectan a esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de SoAI: https://soai.to
- Ficheros de cuantizacion:
  - https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/gemma-4-31B-it-Q4_K_M.gguf
  - https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/gemma-4-31B-it-Q8_0.gguf
  - https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/mmproj-gemma-4-31B-it-f16.gguf
- Arbol de ficheros del repositorio: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/tree/main
- Fuente del corpus de calibracion citada en la model card: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2 (referencia parcial; la model card se trunca en este punto)
