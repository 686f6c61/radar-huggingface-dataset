# microsoft/AesCode-8B

## Resumen

AesCode-8B es un modelo multimodal de generación de código desarrollado por Microsoft, orientado a producir artefactos visuales ricos en información (diapositivas, pósteres, cuadros de mando e infografías) como documentos HTML/CSS completos y editables. Parte del modelo base Qwen3-VL-8B-Instruct, sobre el que se aplica un ajuste en dos fases: un SFT de arranque en frío seguido de GDPO (optimización con siete canales de recompensa). El resultado es un modelo de 8.767.123.696 parámetros (aproximadamente 8,77 mil millones) con arquitectura transformer multimodal tipo Qwen3-VL y licencia Apache 2.0.

El problema que resuelve es concreto: los modelos de código no "ven" cómo interactúan composición, jerarquía y color sobre el lienzo, mientras que los generadores de imágenes componen páginas visualmente atractivas pero suelen fallar al renderizar texto, cifras y relaciones lógicas. AesCode combina ambas fortalezas aceptando una imagen de referencia generada desde el mismo prompt como guía estética, y separando los requisitos semánticos de las señales visuales mediante supervisión estructurada en grafo y recompensas multimodales desacopladas. La salida sigue siendo verificable: tablas como estructuras HTML y gráficos como especificaciones ECharts.

Su relevancia actual radica en que, según los datos publicados por el autor, un modelo de 8B supera a sistemas cerrados mucho mayores en esta tarea específica. AesCode-8B alcanza un 82,94 de puntuación global (Overall) en la evaluación de 300 infografías, por encima de GPT-5.5 (81,28) y Claude Opus 4.8 (80,39) en configuración con referencia, y mejora a su backbone Qwen3-VL-8B en 31,1 puntos de Visual. Es un modelo especializado y de nicho, pero ilustrativo de cómo el ajuste fino con recompensas bien diseñadas puede batir a modelos generalistas en dominios acotados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (familia Qwen3-VL, tag `qwen3_vl`) |
| Parametros totales | 8.767.123.696 (8,77 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 24.576 tokens (configuracion reportada en la evaluacion; contexto nativo del backbone no especificado) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `AutoModelForImageTextToText`) |

## Arquitectura y entrenamiento

AesCode-8B hereda la arquitectura multimodal de Qwen3-VL-8B-Instruct: un transformer que procesa de forma conjunta entradas de texto e imagen (pipeline `image-text-to-text`), con un procesador (`AutoProcessor`) que aplica la plantilla de chat de Qwen3-VL. El modelo requiere `transformers>=4.57`. La salida generada es un documento HTML completo, con tablas en HTML nativo y gráficos expresados como especificaciones ECharts, lo que permite inspeccionar y verificar el resultado de forma programática.

El entrenamiento parte de Qwen3-VL-8B-Instruct y se realiza en dos etapas: un SFT de arranque en frío (cold-start SFT) y después GDPO sobre siete canales de recompensa. La innovación técnica central es el desacoplamiento de recompensas entre modalidades (decoupled cross-modal rewards) combinado con supervisión estructurada en grafo, que separa los requisitos semánticos del contenido de las señales visuales de estilo y composición. Esta separación evita que el modelo copie contenido alucinado de la imagen de referencia o ignore su estructura de diseño. El modelo base al que se compara (Qwen3-VL-8B-Instruct sin ajustar) sirve como referencia de cuánto aporta esta receta: la mejora en la dimensión Visual es de 31,1 puntos.

Un detalle relevante del diseño es que la imagen de referencia es opcional en inferencia. El entrenamiento condicionado a referencia internaliza la planificación visual en la política del modelo, de modo que prescindir de la referencia en inferencia solo cuesta 1,00 punto Visual en AesCode-8B, frente a 19,55 puntos en el backbone sin ajustar y 10,04 en GPT-5.5. La calidad sigue siendo máxima cuando se proporciona referencia.

## Capacidades

- Generación de código HTML/CSS a partir de un prompt de contenido, produciendo documentos HTML completos y autocontenidos.
- Generación de artefactos visuales estructurados: diapositivas, pósteres, cuadros de mando, informes e infografías.
- Comprensión de imágenes: acepta una imagen de referencia (hasta dos por prompt en despliegue con vLLM) para guiar composición, jerarquía y estilo.
- Generación de tablas en estructuras HTML y de gráficos como especificaciones ECharts, lo que las hace directamente inspeccionables y verificables.
- Modo de razonamiento con planificación visual internalizada: funciona sin imagen de referencia con una pérdida mínima de calidad (1,00 punto Visual).
- Capacidad conversacional, heredada de la interfaz de chat de Qwen3-VL (tag `conversational`).
- Soporte multilingüe limitado al inglés (idioma declarado: `en`).
- No se documentan capacidades de tool calling, function calling, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Generación de diapositivas de presentación: dado un prompt con el contenido (por ejemplo, un resumen ejecutivo con cifras), el modelo produce un documento HTML/CSS con jerarquía visual, tablas y gráficos ECharts, directamente editable en cualquier editor de código o herramienta de diseño.
- Cuadros de mando e informes de negocio: el modelo puede convertir métricas descritas en texto en un dashboard HTML con tablas y gráficos, aprovechando su ventana de 24.576 tokens para prompts densos en datos.
- Pósteres e infografías para marketing o divulgación: con una imagen de referencia estética, genera una versión editable y verificable del diseño, evitando los errores de renderizado de texto típicos de los generadores de imágenes.
- Investigación en generación de código multimodal: sirve como sistema de referencia (con paper y código publicados) para estudiar cómo separar recompensas semánticas y visuales en modelos de código visual.
- Prototipado rápido de interfaces documentales: generar plantillas HTML/CSS de informes o fichas técnicas que luego se integran en pipelines web, manteniendo la salida como HTML verificable en lugar de una imagen rasterizada.
- Aseguramiento de calidad de diseño con verificación programática: al emitir tablas HTML y specs ECharts, un pipeline puede validar automáticamente que las cifras y relaciones lógicas del contenido son correctas, algo imposible con una imagen generada.
- Evaluación comparativa de modelos de diseño visual: el protocolo de evaluación del autor (300 infografías, tres rollouts, métricas Rule y Visual) puede reproducirse con este modelo como baseline abierto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 muestras de infografías. `Rule` promedia las comprobaciones programáticas de Text, Bound y Chart. `Visual` promedia las dimensiones de checklist Content, Layout y Style. `Overall` es la media de Rule y Visual. Son porcentajes promediados sobre tres generaciones por prompt sin selección. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt. Negrita = mejor puntuación de cada columna; subrayado = segunda mejor.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|:---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | No | 88,67 | 86,18 | 82,85 | 85,90 | 79,27 | 68,09 | 52,80 | 66,72 | 76,31 |
| GPT-5.5 | Si | 89,22 | 86,85 | 81,35 | 85,80 | 82,44 | 89,93 | 57,91 | 76,76 | 81,28 |
| Claude Opus 4.8 | No | 91,40 | 85,03 | 87,69 | 88,04 | 84,98 | 64,88 | 46,72 | 65,53 | 76,78 |
| Claude Opus 4.8 | Si | 92,45 | 84,43 | 73,75 | 83,55 | 86,42 | 89,76 | 55,51 | 77,23 | 80,39 |
| Qwen3-VL-8B | No | 58,32 | 77,23 | 43,30 | 59,61 | 38,33 | 23,97 | 13,22 | 25,17 | 42,39 |
| Qwen3-VL-8B | Si | 64,07 | 70,99 | 42,35 | 59,14 | 52,90 | 51,33 | 29,92 | 44,72 | 51,93 |
| Qwen3-VL-32B | No | 66,00 | 80,31 | 41,36 | 62,55 | 49,81 | 34,85 | 19,34 | 34,67 | 48,61 |
| Qwen3-VL-32B | Si | 71,19 | 79,61 | 50,77 | 67,19 | 62,04 | 64,59 | 38,43 | 55,02 | 61,10 |
| **AesCode-8B** | **Si** | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| **AesCode-32B** | **Si** | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

Según el autor, AesCode-8B mejora Visual respecto a su backbone condicionado por referencia en 31,1 puntos y Overall en 31,0. Su Overall de 82,94 supera a GPT-5.5 y Claude Opus 4.8 con referencia, mientras que Rule alcanza 90,07. El autor señala que Style es el techo común de todos los sistemas y que ningún modelo supera 60 en esa dimensión.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precisión completa (bf16/fp16) ocupan del orden de 17,5 GB (tamaño del repo), por lo que se necesitan aproximadamente 18-20 GB de VRAM solo para pesos, más memoria adicional para la caché KV dependiente de contexto y número de imágenes. Las cifras exactas no están publicadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 24 GB o más (RTX 3090, RTX 4090, A10G 24 GB, L40S, A100 40/80 GB, H100) con precisión completa y contexto reducido; para contextos largos de 24.576 tokens y prompts con imágenes conviene memoria adicional.
- Cabe en GPU de consumo: probablemente en una RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto limitado; no hay confirmación oficial ni cuantizaciones publicadas que lo garanticen.
- Opciones de despliegue: vLLM está explícitamente soportado, con el comando documentado `vllm serve microsoft/AesCode-8B --limit-mm-per-prompt image=2 --max-model-len 24576`. También es posible cargarlo con transformers mediante `AutoModelForImageTextToText` y `AutoProcessor`. No se documenta soporte para llama.cpp, Ollama, TGI ni otros backends.
- Latencia y throughput estimados: no disponibles. La configuración de generación reportada usa temperatura 0,8, top-p 0,95 y hasta 12.000 tokens de salida, lo que implica generaciones largas por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (con ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B | 8,77B densos | 24.576 tokens | 82,94 | apache-2.0 | pesos abiertos en HuggingFace |
| Qwen3-VL-8B-Instruct | ~8B densos | no especificado | 51,93 | no disponible en esta ficha | pesos abiertos |
| Qwen3-VL-32B-Instruct | ~32B densos | no especificado | 61,10 | no disponible en esta ficha | pesos abiertos |
| AesCode-32B | ~32B densos | no especificado | 85,89 | no disponible en esta ficha | pesos abiertos en HuggingFace |
| GPT-5.5 | no disponible | no disponible | 81,28 | propietaria | API cerrada |
| Claude Opus 4.8 | no disponible | no disponible | 80,39 | propietaria | API cerrada |

La comparación relevante es interna a la familia: AesCode-8B supera a su backbone sin ajustar (Qwen3-VL-8B-Instruct) por un margen amplio y se acerca a la variante de 32B (AesCode-32B), que sigue siendo la mejor de la tabla. Frente a los modelos cerrados de propósito general, el modelo de 8B resulta competitivo solo en esta tarea concreta de generación de artefactos HTML/CSS y no como modelo de propósito general.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica sobre sesgos en la documentación proporcionada. Al ser un modelo entrenado y evaluado únicamente en inglés, los sesgos culturales del dataset pueden reflejarse en las convenciones de diseño y composición.
- Riesgo de alucinación: específicamente señalado para la tarea. El modelo card advierte que los modelos vision-language genéricos pueden "copiar contenido alucinado" de la referencia. Aunque AesCode está diseñado precisamente para mitigarlo mediante recompensas desacopladas, el riesgo persiste, especialmente en contenido numérico o factual.
- Limitaciones de idioma: el único idioma declarado es el inglés (`en`). No hay confirmación de rendimiento en castellano u otros idiomas, ni en la interfaz ni en el contenido generado.
- Limitaciones de contexto: la ventana operativa reportada es de 24.576 tokens; prompts muy extensos con imágenes pueden excederla y requerir truncado. En vLLM hay que configurar `--max-model-len 24576` y permitir dos imágenes por prompt (`--limit-mm-per-prompt image=2`).
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificación y redistribución. Conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct, ya que la licencia del modelo derivado puede estar sujeta a las obligaciones del original.
- Caveat de producción: la dimensión Style es el punto débil declarado. Ningún sistema de la evaluación supera 60 en Style, que solo otorga crédito cuando un diseño no requiere más revisiones visuales antes de entregarse. Esto implica que la salida probablemente necesite revisión humana de acabado. Además, con 6 descargas y 22 likes en el momento de la consulta, el modelo es muy reciente y con adopción mínima, por lo que no hay evidencia de robustez en producción fuera de la evaluación del autor.
- Coste de generación: hasta 12.000 tokens de salida por documento y tres rollouts por prompt en la evaluación, lo que puede implicar coste y latencia elevados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/AesCode-8B
- Modelo companion AesCode-32B: https://huggingface.co/microsoft/AesCode-32B
- Repositorio de código: https://github.com/microsoft/AesCode
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards (referenciado en la model card; no se ha encontrado URL directa en la información disponible)
- Imagen teaser: https://huggingface.co/microsoft/AesCode-8B/resolve/main/assets/teaser.png
- Nota: los resultados de la búsqueda web proporcionada solo devolvieron páginas genéricas de Microsoft (microsoft.com, cuenta de Microsoft, Microsoft Store) sin información técnica adicional sobre el modelo.
