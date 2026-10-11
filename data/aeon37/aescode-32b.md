# aeon37/AesCode-32B

## Resumen

AesCode-32B es un modelo multimodal de generacion de codigo especializado en producir artefactos visuales ricos en informacion (diapositivas, posters, dashboards, informes) como documentos HTML/CSS completos, estructurados, editables y verificables. El modelo parte de Qwen/Qwen3-VL-32B-Instruct y se entrena con SFT de arranque en frio seguido de GDPO (un esquema de optimizacion por recompensa derivado de GRPO) sobre siete canales de recompensa. Su rasgo distintivo es el uso de una imagen de referencia generada a partir del mismo prompt como guia estetica, mientras el contenido se rige por el texto del prompt, separando requisitos semanticos de senales visuales mediante supervision con estructura de grafo y recompensas multimodales desacopladas.

El problema que resuelve es doble: los modelos de codigo no "ven" como interactuan maquetacion, jerarquia y color en el lienzo, y los generadores de imagen componen paginas atractivas pero fallan al renderizar texto, cifras y relaciones logicas. AesCode se situa en el punto intermedio: usa la imagen solo como referencia de estilo y layout, y emite HTML/CSS ejecutable con tablas HTML reales y graficos ECharts, lo que permite verificacion programatica (comprobaciones de texto, limites de lienzo y graficos).

La ficha corresponde al repositorio aeon37/AesCode-32B, cuya model card documenta el checkpoint microsoft/AesCode-32B (mismo modelo base, misma licencia y mismos resultados). Cuenta con 33.357.390.064 parametros (unos 33,36 mil millones) en bf16, un repo de 66,7 GB, licencia Apache 2.0, pipeline image-text-to-text y registro de idioma exclusivamente en ingles. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y se publico el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (derivado de Qwen3-VL-32B-Instruct); densa, sin mezcla de expertos |
| Parametros totales | 33.357.390.064 (≈33,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 24.576 tokens en la configuracion de evaluacion y despliegue reportada (`--max-model-len 24576`); el maximo nativo del backbone no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16; no se documentan pesos cuantizados oficiales) |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), libreria transformers |
| Modelo base | Qwen/Qwen3-VL-32B-Instruct |
| Tamano del repositorio | 66,7 GB |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 11 de octubre de 2026 |

## Arquitectura y entrenamiento

AesCode-32B hereda la arquitectura multimodal de Qwen3-VL-32B-Instruct: un transformer denso que acepta entradas de imagen y texto y genera texto, con soporte para dos imagenes por prompt en despliegue con vLLM (`--limit-mm-per-prompt image=2`). El modelo emite un documento HTML completo, utiliza estructuras `<table>` de HTML para tablas y ECharts para graficos, lo que restringe el espacio de solucion a implementaciones ejecutables y verificables de forma programatica.

El entrenamiento consta de dos fases: un SFT de arranque en frio y una posterior optimizacion GDPO sobre siete canales de recompensa. La innovacion central es la separacion de requisitos semanticos y senales visuales mediante supervision con estructura de grafo y recompensas multimodales desacopladas: la imagen de referencia aporta informacion de layout y estilo, mientras que el contenido obligatorio se rige por el prompt. El paper asociado es "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards". No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles de RLHF/DPO mas alla de la fase GDPO.

## Capacidades

- Generacion de codigo HTML/CSS para artefactos visuales: diapositivas, posters, dashboards, informes e infografias.
- Generacion de documentos HTML completos, autocontenidos y editables.
- Uso de imagenes de referencia para guiar layout y estilo sin copiar su contenido.
- Generacion de tablas mediante estructuras HTML `<table>` reales.
- Generacion de graficos mediante ECharts.
- Razonamiento multimodal imagen-texto con la interfaz de chat de Qwen3-VL.
- Capacidades de codigo general y comprension de contenido textual, numerico y relaciones logicas dentro del artefacto generado.
- Generacion por lotes mediante vLLM con soporte de multiples imagenes por prompt.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking explicito, audio o video: no documentado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles.

## Casos de uso

- Generacion automatica de dashboards de negocio: el modelo produce HTML/CSS con tablas `<table>` y graficos ECharts a partir de una descripcion textual y, opcionalmente, una referencia visual de estilo, lo que permite integrar el resultado en un CMS o en un pipeline de informes sin postprocesado manual de maquetacion.
- Creacion de diapositivas y posters editables: al emitir HTML/CSS estructurado en lugar de una imagen rasterizada, el material generado puede editarse, versionarse en Git y traducirse sin degradacion.
- Informes de datos verificables: la verificacion programatica de texto, limites de lienzo y graficos (canal `Rule` del benchmark, 94,33 en este modelo) permite auditar de forma automatica que el artefacto contiene los datos exigidos.
- Generacion de infografias a partir de datos tabulares: la puntuacion de 97,27 en el canal `Bound` indica una tasa baja de desbordamiento del lienzo, un fallo critico al producir material listo para publicacion.
- Investigacion en generacion de codigo multimodal: el modelo sirve como referencia reproducible para estudiar recompensas multimodales desacopladas y supervision con estructura de grafo, con paper y codigo publicados.
- Prototipado rapido de interfaces de presentacion: util para equipos de diseno que necesitan partir de una referencia visual y obtener HTML/CSS base que luego refinan a mano.
- Generacion de graficos embebidos en documentacion tecnica: la restriccion a ECharts produce visualizaciones ejecutables y directamente insertables en paginas web.
- Produccion por lotes de material de marketing: con vLLM y tensor-parallel-size 4 se pueden generar multiples artefactos por prompt (la evaluacion reportada usa tres rollouts por prompt) y seleccionar el mejor.

## Benchmarks y rendimiento

Evaluacion sobre 300 muestras de infografias. `Rule` promedia las comprobaciones programaticas de Text, Bound y Chart. `Visual` promedia las dimensiones de checklist Content, Layout y Style. `Overall` es la media de Rule y Visual. Puntuaciones en porcentaje, media de tres generaciones por prompt sin seleccion. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | No | 88,67 | 86,18 | 82,85 | 85,90 | 79,27 | 68,09 | 52,80 | 66,72 | 76,31 |
| GPT-5.5 | Si | 89,22 | 86,85 | 81,35 | 85,80 | 82,44 | 89,93 | 57,91 | 76,76 | 81,28 |
| Claude Opus 4.8 | No | 91,40 | 85,03 | 87,69 | 88,04 | 84,98 | 64,88 | 46,72 | 65,53 | 76,78 |
| Claude Opus 4.8 | Si | 92,45 | 84,43 | 73,75 | 83,55 | 86,42 | 89,76 | 55,51 | 77,23 | 80,39 |
| Qwen3-VL-8B | No | 58,32 | 77,23 | 43,30 | 59,61 | 38,33 | 23,97 | 13,22 | 25,17 | 42,39 |
| Qwen3-VL-8B | Si | 64,07 | 70,99 | 42,35 | 59,14 | 52,90 | 51,33 | 29,92 | 44,72 | 51,93 |
| Qwen3-VL-32B | No | 66,00 | 80,31 | 41,36 | 62,55 | 49,81 | 34,85 | 19,34 | 34,67 | 48,61 |
| Qwen3-VL-32B | Si | 71,19 | 79,61 | 50,77 | 67,19 | 62,04 | 64,59 | 38,43 | 55,02 | 61,10 |
| AesCode-8B | Si | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| AesCode-32B | Si | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

Datos destacados reportados por el autor: AesCode-32B mejora Visual en 22,4 puntos y Overall en 24,8 puntos respecto a su backbone Qwen3-VL-32B condicionado por referencia. Alcanza Rule 94,33 frente a 85,90 de GPT-5.5 y 88,04 de Claude Opus 4.8. En el canal Chart obtiene 90,37, el mejor de la comparativa. El canal Boundary llega a 97,27, con un fallo severo de desbordamiento de lienzo recurrente en el 4,3% de las 300 muestras, frente al 34,7% de GPT-5.5. El canal Style es el techo comun de todos los sistemas y ningun modelo supera 60.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65 GB solo para los parametros, segun la model card, mas la memoria de activaciones y cache KV para contextos de hasta 24.576 tokens.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecucion en una sola GPU; el ejemplo oficial de vLLM usa `--tensor-parallel-size 4`, lo que apunta a configuraciones de 4 GPU (por ejemplo, 4x A100 40 GB o superiores).
- GPU de consumo: no cabe en una GPU de consumo en bf16. Con cuantizacion de 4 bits los pesos ocuparian aproximadamente 17-20 GB, lo que en teoria permitiria ejecutarlo en una RTX 4090 de 24 GB, pero es una estimacion propia y no hay pesos cuantizados oficiales publicados (los pesos son safetensors en bf16).
- Opciones de despliegue: transformers (>=4.57) con `AutoModelForImageTextToText` y `AutoProcessor`, y vLLM para generacion por lotes con la configuracion indicada. No hay soporte documentado para llama.cpp, Ollama o TGI, ni pesos GGUF.
- Parametros de generacion reportados: `do_sample=True`, `temperature=0.8`, `top_p=0.95`, `max_new_tokens=12000`, contexto de 24.576 tokens.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Overall (infografias) |
|---|---|---|---|---|---|
| AesCode-32B | 33,36 B (denso) | 24.576 tokens (config. reportada) | Apache 2.0 | Pesos abiertos en HuggingFace | 85,89 (con referencia) |
| AesCode-8B | No disponible | No disponible | No disponible | Pesos abiertos en HuggingFace | 82,94 (con referencia) |
| Qwen3-VL-32B-Instruct | 32 B (aprox., denso) | 24.576 tokens en esta evaluacion | Apache 2.0 | Pesos abiertos | 61,10 (con referencia), 48,61 (sin) |
| Qwen3-VL-8B | 8 B (aprox., denso) | No disponible | Apache 2.0 | Pesos abiertos | 51,93 (con referencia), 42,39 (sin) |
| GPT-5.5 | No disponible | No disponible | Propietaria | API | 81,28 (con referencia), 76,31 (sin) |
| Claude Opus 4.8 | No disponible | No disponible | Propietaria | API | 80,39 (con referencia), 76,78 (sin) |

Nota: los datos de contexto y parametros de los modelos Qwen3-VL corresponden a los valores empleados en la evaluacion del autor, no a especificaciones completas publicadas en esta informacion. GPT-5.5 y Claude Opus 4.8 son modelos propietarios sin pesos abiertos.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles (`en`). El rendimiento en castellano no esta documentado.
- Techo de estilo: el canal Style es la limitacion compartida de todos los sistemas evaluados y ningun modelo, incluido AesCode-32B (55,99), supera 60. El benchmark solo otorga credito cuando el diseno no requiere revision visual adicional antes de la entrega, por lo que buena parte de la salida necesitara retoque humano.
- Dependencia de la referencia visual: los mejores resultados (Overall 85,89) se obtienen con imagen de referencia. Sin ella el rendimiento del backbone cae notablemente (Qwen3-VL-32B pasa de 61,10 a 48,61), lo que sugiere que el modelo esta fuertemente condicionado por la entrada visual.
- Riesgo de alucinacion y copia: la propia model card advierte que los modelos vision-lenguaje genericos pueden copiar contenido alucinado o ignorar el layout de la referencia; AesCode mitiga el problema con recompensas desacopladas, pero no se documenta una eliminacion completa del riesgo.
- Desbordamiento de lienzo: persiste un fallo severo de limites en el 4,3% de las 300 muestras evaluadas, lo que exige validacion automatica antes de publicar artefactos.
- Fase de investigacion: la evaluacion se realiza sobre 300 muestras de infografias, con tres rollouts por prompt; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) ni de uso en produccion a gran escala.
- Ambiguedad de autoria y distribucion: el repositorio consultado es aeon37/AesCode-32B, mientras que la model card documenta el checkpoint microsoft/AesCode-32B (paper, repositorio de codigo y modelo companero apuntan a Microsoft). Conviene verificar la procedencia de los pesos antes de usarlos en produccion. El repositorio registra 0 descargas y 0 "likes" en la fecha de consulta.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir las obligaciones de atribucion y las condiciones aplicables al modelo base Qwen3-VL-32B-Instruct.
- Requisitos de memoria elevados: unos 65 GB solo para los parametros en bf16, lo que descarta el despliegue en hardware de consumo sin cuantizacion.
- Salida de hasta 12.000 tokens por generacion y contexto de 24.576 tokens: documentos muy extensos pueden truncarse.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/aeon37/AesCode-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Modelo companero: https://huggingface.co/microsoft/AesCode-8B
- Codigo: https://github.com/microsoft/AesCode
- Paper: "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (referenciado en la model card; no se proporciona URL directa)
- Checkpoint documentado en la model card: https://huggingface.co/microsoft/AesCode-32B
