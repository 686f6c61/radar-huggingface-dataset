# pr1daclar/Mistral-Medium-3.5-128B-heretic-GGUF

## Resumen

Mistral-Medium-3.5-128B-heretic-GGUF es una cuantizacion en formato GGUF (Q4_K_M) del modelo Mistral Medium 3.5 128B en su variante "heretic", un ajuste fino orientado a reducir los rechazos de contenido (5 de cada 100 frente al modelo base, segun la model card) manteniendo una divergencia KL de 0,014 respecto al original. El modelo subyacente es un transformer denso de aproximadamente 125.000 millones de parametros, publicado por Mistral y redistribuido aqui por el usuario pr1daclar junto con el derivado BF16 de Shifusen. La relevancia de esta ficha radica en que documenta una de las pocas conversiones GGUF disponibles de un modelo de escala 128B con contexto declarado de 262.144 tokens, pensada para inferencia en clusters de GPU de clase profesional (V100, A100, H100) mediante llama.cpp.

La cuantizacion se genero con llama.cpp (commit fe14cad, 13 de noviembre de 2026) mediante `convert_hf_to_gguf --remote q8_0` seguido de `llama-quantize` a Q4_K_M sin imatrix, produciendo un fichero de 74,9 GB dentro de un repositorio de 474,4 GB. El autor advierte de que el GGUF no incluye plantilla de chat, por lo que es obligatorio pasar `--jinja --chat-template-file mistral35.jinja`; de lo contrario llama.cpp aplicaria ChatML y el comportamiento del modelo se degradaria.

El modelo no incorpora razonamiento por defecto: el modo de razonamiento se activa con `chat_template_kwargs {"reasoning_effort": "high"}` y la plantilla solo acepta los valores `none` y `high`. Las recomendaciones de muestreo de Mistral son temperatura 0,0-0,7 y top_p 1,0 sin razonamiento, y temperatura 0,7 con top_p 0,95 en modo `high`. No se dispone de informacion sobre licencia, idiomas ni pipeline en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral Medium 3.5); detalles de atencion no disponibles |
| Parametros totales | 125.025.988.608 (125,0 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configuracion de ejecucion documentada por el autor: `-c 262144`) |
| Tipos de cuantizacion | Q4_K_M (publicada); conversion intermedia q8_0; origen BF16 |
| Idiomas soportados | No disponibles en los metadatos; la model card menciona un filtro opcional de solo cirilico |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q4_K_M, 74,9 GB); origen safetensors BF16 |
| Plantilla de chat | No incluida en el GGUF; requiere `mistral35.jinja` con `--jinja` |
| Modos de razonamiento | `none` (por defecto) y `high` |
| Tamano del repositorio | 474,4 GB |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Mistral Medium 3.5 con 125.000 millones de parametros. La informacion disponible no detalla el numero de capas, la configuracion de atencion (GQA, ventanas deslizantes), la composicion del dataset de preentrenamiento ni las etapas de alineamiento (RLHF/DPO) del modelo original. Tampoco se documentan innovaciones tecnicas especificas del base, como decodificacion especulativa o atencion lineal.

La variante "heretic" procede de un ajuste fino de Shifusen sobre el modelo BF16, cuyo objetivo es reducir la tasa de rechazos: la model card reporta 5 rechazos por cada 100 solicitudes con una divergencia KL de 0,014 respecto al modelo de partida, lo que indica una modificacion de comportamiento acotada. La conversion a GGUF se realizo con llama.cpp (commit fe14cad) en dos pasos: extraccion remota en q8_0 y cuantizacion posterior a Q4_K_M sin matriz de importancia (imatrix), lo que implica que la asignacion de bits no esta optimizada por capa segun activaciones.

## Capacidades

- Generacion de texto y razonamiento general en un modelo denso de 125B, con modo de razonamiento explicito activable mediante `reasoning_effort: high`.
- Conversaciones multi-turno con ventana de contexto de hasta 262.144 tokens en la configuracion documentada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card solo documenta un filtro opcional para restringir la salida a cirilico mediante baneo de 118.814 tokens.
- Capacidad de vision o audio: no disponible.
- Control de rechazos: la variante heretic reduce los rechazos a 5/100 segun la model card, lo que amplia el rango de solicitudes que el modelo atendera.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de codigo completas en una sola pasada y responder preguntas sobre ellos sin troceado, lo que simplifica pipelines de analisis documental.
- Analisis de repositorios de codigo: la ventana extendida permite cargar varios ficheros y mantener coherencia entre modulos al generar parches o revisiones; requiere validar previamente el soporte real de tool calling.
- Asistentes conversacionales de dominio con pocos rechazos: la variante heretic resulta adecuada para entornos donde el filtrado excesivo degrada la utilidad (soporte tecnico especializado, redaccion creativa), siempre con moderacion externa.
- Generacion de texto en lote sobre GPU profesionales: el Q4_K_M de 74,9 GB cabe en 4-8 V100 de 32 GB y permite throughput de 13-32 tokens/s segun el numero de tarjetas y la longitud de contexto, apto para tareas batch no interactivas.
- Razonamiento profundo en modo `high`: para problemas de analisis que se benefician de cadenas de razonamiento (evaluacion de riesgos, sintesis de informes), con temperatura 0,7 y top_p 0,95.
- Despliegue en infraestructura existente de V100: el autor documenta un fork especifico (llama.cpp-v100 2.0.1.2) y un script `mmh.sh` con `-sm tensor`, KV en f16 y `--cache-ram 100000`, lo que permite reutilizar parques de GPU sin migrar a hardware mas reciente.
- Filtrado de salida por alfabeto: el mecanismo `ban.args` (118.814 tokens con logit -inf) permite restringir la generacion a cirilico, util para sistemas que solo admiten ese alfabeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son medidas de velocidad de inferencia del autor con Q4_K_M en V100 SXM2:

| Configuracion | Contexto corto | 20K tokens | 60K tokens | 85K tokens |
|---|---|---|---|---|
| 4 x V100 32 GB | 23 t/s | 19,7 t/s | no disponible | 13,2 t/s |
| 8 x V100 32 GB | 31,6 t/s | 26,9 t/s | ~19 t/s | no disponible |

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 74,9 GB; con cache KV en f16 y contexto largo, el consumo crece de forma proporcional al contexto. El autor emplea `--cache-ram 100000` (100 GB de cache en RAM del sistema).
- GPU recomendadas: 4-8 x V100 32 GB (configuracion validada por el autor); por tamano, tambien cabria en 2-3 x A100 80 GB o 2 x H100 80 GB, aunque estas configuraciones no estan documentadas en la informacion disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer individual; requeriria reparto entre varias tarjetas y aun asi seria ajustado.
- Opciones de despliegue: llama.cpp (commit fe14cad o el fork llama.cpp-v100 2.0.1.2), con `--jinja --chat-template-file mistral35.jinja`, `-sm tensor` y KV en f16. vLLM, TGI u Ollama no estan documentados para este fichero.
- Latencia y throughput: 23 t/s (4 GPU, contexto corto), 19,7 t/s a 20K, 13,2 t/s a 85K; con 8 GPU, 31,6 t/s en corto, 26,9 t/s a 20K y ~19 t/s a 60K.
- Nota operativa: el filtro de baneo requiere `ulimit -s 65536` por el tamano de los argumentos (2,7 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Medium-3.5-128B-heretic-GGUF (este) | 125,0 B | 262.144 | Q4_K_M (74,9 GB) | No disponible | Hugging Face, 0 descargas |
| Mistral-Medium-3.5-128B-BF16-heretic (origen) | 125,0 B | No disponible | BF16 | No disponible | Hugging Face (referenciado) |
| Mistral Medium 3.5 (base) | 125,0 B | No disponible | No disponible | No disponible | No disponible en la informacion |

No se dispone de datos de benchmarks ni de modelos comparables alternativos en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La variante heretic reduce deliberadamente los rechazos (5/100), lo que implica menor alineacion de seguridad que el modelo base; requiere moderacion externa en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de esta escala sin benchmarks publicados.
- Ausencia de plantilla de chat en el GGUF: sin `mistral35.jinja` y `--jinja`, llama.cpp aplica ChatML y el modelo se comporta de forma incorrecta.
- La cuantizacion Q4_K_M se genero sin imatrix, por lo que la perdida de calidad respecto a BF16 no esta medida ni documentada.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse en el modelo base de Mistral antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; el filtro de cirilico sugiere un uso previsto en ruso, pero no hay confirmacion oficial.
- Contexto de 262.144 tokens verificado solo en la configuracion del autor con 4-8 V100 y cache KV f16; a esa longitud el throughput cae a 13,2 t/s y el consumo de memoria es elevado.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni informes independientes de calidad.
- El modo de razonamiento solo admite `none` o `high`; no hay niveles intermedios.
- Despliegue limitado a llama.cpp (y fork especifico para V100); no hay soporte documentado en vLLM, TGI u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/pr1daclar/Mistral-Medium-3.5-128B-heretic-GGUF
- Modelo de origen citado en la model card: Shifusen/Mistral-Medium-3.5-128B-BF16-heretic (ruta en Hugging Face; URL completa no disponible en la informacion)
- llama.cpp (commit fe14cad): repositorio oficial de llama.cpp; URL directa no disponible en la informacion
- Fork llama.cpp-v100 2.0.1.2: referenciado en la model card; URL no disponible en la informacion
- Scripts `mmh.sh` y `make_ban.py`: referenciados en la model card; URL no disponible en la informacion
