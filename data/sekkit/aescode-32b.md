# sekkit/AesCode-32B

## Resumen

AesCode-32B es un modelo multimodal de generación de código especializado en producir artefactos visuales ricos en información —presentaciones, pósteres, paneles de control e infografías— como documentos HTML/CSS completos, estructurados, editables y verificables. Está desarrollado por el equipo de Microsoft (repositorio y pesos publicados bajo el identificador `microsoft/AesCode-32B`, replicados en el espacio `sekkit/AesCode-32B`) y parte del modelo base Qwen/Qwen3-VL-32B-Instruct, sobre el que se aplica un ajuste específico.

El problema que aborda es concreto: los modelos de código no ven cómo interactúan maquetación, jerarquía y color sobre el lienzo, mientras que los generadores de imágenes componen páginas atractivas pero fallan al renderizar texto, cifras y relaciones lógicas. AesCode utiliza una imagen generada a partir del mismo *prompt* como referencia estética, pero sigue el *prompt* para el contenido obligatorio, separando requisitos semánticos de señales visuales mediante supervisión con estructura de grafo y recompensas multimodales desacopladas.

El modelo tiene 33.357.390.064 parámetros (~33,4 mil millones) y una arquitectura de transformer denso visión-lenguaje (no MoE). Se distribuye bajo licencia Apache 2.0, con pesos en bf16 y safetensors, y está entrenado únicamente en inglés. Su relevancia actual radica en que demuestra que la generación de diseño visual verificable puede superar a asistentes propietarios de propósito general en métricas programáticas de texto, límites y gráficos, con una reducción drástica del desbordamiento de lienzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), denso |
| Parametros totales | 33.357.390.064 (~33,4 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 24.576 tokens en la configuracion de evaluacion y despliegue documentada; maximo nativo no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La base es Qwen3-VL-32B-Instruct, un transformer multimodal capaz de recibir imagen y texto y emitir texto (`image-text-to-text`). Sobre esa base, AesCode-32B se entrena en dos fases: un *cold-start* de ajuste supervisado (SFT) seguido de GDPO (una variante de optimización por preferencias/refuerzo) sobre siete canales de recompensa. La innovación central es la separación explícita entre requisitos semánticos y señales visuales mediante supervisión con estructura de grafo y recompensas multimodales desacopladas, de modo que el modelo no copia contenido alucinado de la imagen de referencia ni ignora su maquetación.

El modelo emite un documento HTML completo. Las tablas deben construirse con estructuras de tabla HTML y los gráficos con ECharts, lo que restringe el espacio de soluciones a implementaciones ejecutables y verificables de forma directa; esto explica su ventaja en las comprobaciones programáticas de gráficos y tablas. El autor indica que se requiere `transformers>=4.57` y que el entrenamiento se realizó sobre muestras de infografía evaluadas con tres *rollouts* por *prompt* a temperatura 0,8, top-p 0,95, hasta 12.000 tokens de salida y un contexto de 24.576 tokens. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de artefactos visuales como documentos HTML/CSS completos: presentaciones, pósteres, paneles de control, infografías e informes.
- Entrada multimodal: acepta una imagen de referencia (maquetación y estilo) junto con un *prompt* de contenido detallado.
- Salida estructurada y editable: HTML con tablas HTML nativas y gráficos en ECharts, verificables de forma programática.
- Razonamiento visual condicionado por referencia: distingue el contenido exigido por el *prompt* de las señales puramente estéticas de la imagen.
- Conversación multi-turno siguiendo la interfaz de chat de Qwen3-VL.
- Capacidad de generar documentos extensos: hasta 12.000 tokens nuevos de salida en la configuración documentada.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades especiales adicionales (audio, *thinking mode* explícito): no disponible.

## Casos de uso

- Generación de infografías verificables: a partir de un *prompt* de contenido y una imagen de referencia, el modelo produce un HTML/CSS con tablas HTML y gráficos ECharts que pueden validarse automáticamente con las comprobaciones Text, Bound y Chart descritas en la model card (alcanza 94,33 de media en Rule).
- Creación de presentaciones editables: permite generar diapositivas como HTML estructurado en lugar de imágenes rasterizadas, de modo que un equipo de diseño puede revisar, versionar y reutilizar el contenido sin perder fidelidad tipográfica.
- Paneles de control con gráficos: al forzar ECharts, los paneles generados son directamente ejecutables en navegador y sus datos pueden auditarse, lo que evita los errores de renderizado de cifras típicos de los generadores de imágenes.
- Pósteres y material de marketing: el modelo mantiene el contenido exigido por el *prompt* mientras adopta la paleta y la jerarquía visual de la referencia, reduciendo el número de iteraciones de diseño necesarias.
- Informes automáticos con tablas densas: su puntuación de 97,27 en la comprobación de límites (Bound) indica una reducción fuerte del desbordamiento de lienzo, adecuada para documentos con tablas y bloques de datos extensos.
- Investigación en generación multimodal de código: sirve como punto de comparación reproducible para estudiar recompensas multimodales desacopladas y supervisión con estructura de grafo.
- Plantillas HTML a partir de una referencia visual: empresas con guías de marca pueden convertir una referencia en una plantilla de código reutilizable, ajustando después los textos sin rehacer la maquetación.
- Previsualización rápida de concepto de producto: para equipos que necesitan prototipos visuales verificables antes de invertir en diseño final.

## Benchmarks y rendimiento

Evaluación sobre 300 muestras de infografía. `Rule` promedia las comprobaciones programáticas Text, Bound y Chart. `Visual` promedia las dimensiones de lista de verificación Content, Layout y Style. `Overall` es la media de Rule y Visual. Los valores son porcentajes promediados sobre tres generaciones por *prompt*, sin selección. `Ref.` indica si el modelo recibe una imagen de referencia generada junto con el *prompt*.

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
| AesCode-8B | Si | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| AesCode-32B | Si | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

AesCode-32B mejora `Visual` en 22,4 puntos y `Overall` en 24,8 puntos respecto a su modelo base Qwen3-VL-32B condicionado por referencia. Lidera la comparativa en `Overall` con 85,89 y alcanza 94,33 en `Rule`, frente a 85,90 de GPT-5.5 y 88,04 de Claude Opus 4.8. Destacan dos resultados: `Chart` con 90,37, el mejor de todos los modelos, y `Bound` con 97,27, con un fallo grave de límites recurrente en el 4,3 % de las 300 muestras frente al 34,7 % de GPT-5.5. La dimensión `Style` es el techo compartido: ningún modelo supera 60.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 65 GB solo para los parámetros, según el autor; conviene reservar del orden de 70-80 GB contando caché KV y sobrecarga (estimación).
- Despliegue recomendado por el autor: vLLM con `--tensor-parallel-size 4`, `--limit-mm-per-prompt image=2` y `--max-model-len 24576`, lo que implica al menos 4 GPU de gama alta.
- GPU recomendadas: 4x A100 40 GB, 4x H100, 4x L40S o configuraciones equivalentes con al menos 65 GB agregados más overhead (estimación).
- GPU de consumo: no cabe en una sola GPU de consumo en bf16. Con cuantización a 4 bits cabría en el rango de 18-22 GB, lo que permitiría una RTX 4090 o RTX 3090 de 24 GB (estimación, ya que no se publican pesos cuantizados oficiales).
- Opciones de despliegue confirmadas: vLLM (documentado por el autor) y `transformers>=4.57` mediante `AutoModelForImageTextToText` y `AutoProcessor`. No se confirman soportes de Ollama, llama.cpp o TGI.
- Latencia y throughput: no disponibles. Las generaciones son largas por diseño (hasta 12.000 tokens nuevos de salida), por lo que la latencia por petición será elevada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (con Ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B | 33,4 mil millones (denso) | 24.576 tokens en la config. documentada | 85,89 | apache-2.0 | pesos safetensors en HF |
| AesCode-8B | 8 mil millones (segun denominacion; valor exacto no disponible) | no disponible | 82,94 | no disponible | pesos en HF (`microsoft/AesCode-8B`) |
| Qwen3-VL-32B-Instruct | 32 mil millones (denso) | no disponible | 61,10 (48,61 sin referencia) | no disponible en la informacion proporcionada | pesos en HF (`Qwen/Qwen3-VL-32B-Instruct`) |
| GPT-5.5 (propietario) | no disponible | no disponible | 81,28 (76,31 sin referencia) | propietaria | API cerrada |
| Claude Opus 4.8 (propietario) | no disponible | no disponible | 80,39 (76,78 sin referencia) | propietaria | API cerrada |

## Limitaciones y advertencias

- Idioma: únicamente inglés según los metadatos; no se documenta soporte multilingüe.
- Estilo visual: la dimensión `Style` no supera 60 en ningún sistema comparado, lo que indica que la salida puede requerir revisión visual humana antes de entregarse.
- Desbordamiento de lienzo: aunque reducido, persiste un fallo grave de límites en el 4,3 % de las 300 muestras evaluadas.
- Dependencia de la referencia: sin imagen de referencia, el rendimiento cae de forma notable (Qwen3-VL-32B pasa de 61,10 a 48,61 en `Overall`); el modelo está pensado para operar con referencia.
- Riesgo de alucinación: el propio autor señala que los modelos visión-lenguaje genéricos pueden copiar contenido alucinado de la imagen de referencia; aunque AesCode lo mitiga, el riesgo no se elimina.
- Salidas largas: hasta 12.000 tokens de salida, con impacto en coste, latencia y consumo de VRAM.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL y de las dependencias generadas (por ejemplo, ECharts).
- Adopción y reproducibilidad: el repositorio consultado muestra 0 descargas y 0 *likes* en el momento de la ficha, sin resultados de terceros que reproduzcan los benchmarks.
- Procedencia: los metadatos de HuggingFace atribuyen el modelo a `sekkit`, mientras que la model card referencia `microsoft/AesCode-32B`; conviene confirmar la fuente oficial antes de usarlo en producción.
- Contexto: la configuración documentada usa 24.576 tokens; no se especifica el máximo nativo soportado por el modelo base.

## Enlaces

- Modelo en HuggingFace (identificador consultado): https://huggingface.co/sekkit/AesCode-32B
- Modelo referenciado en la model card: https://huggingface.co/microsoft/AesCode-32B
- Modelo companero AesCode-8B: https://huggingface.co/microsoft/AesCode-8B
- Repositorio de codigo: https://github.com/microsoft/AesCode
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper citado: "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (sin enlace directo en la informacion disponible)
