# microsoft/AesCode-32B

## Resumen

AesCode-32B es un modelo multimodal de generacion de codigo desarrollado por Microsoft, afinado a partir de Qwen/Qwen3-VL-32B-Instruct. Su objetivo es producir artefactos visuales ricos en informacion (presentaciones, posters, paneles de control, informes) como documentos HTML/CSS completos, de modo que el resultado sea estructurado, editable y verificable, a diferencia de lo que ocurre con los generadores de imagenes, que fallan al representar texto, cifras y relaciones logicas.

El modelo parte de una premisa concreta: un modelo de codigo no puede anticipar como interactuan maquetacion, jerarquia y color sobre el lienzo, mientras que un generador de imagenes compone visualmente bien pero no respeta el contenido. AesCode resuelve la tension aceptando como entrada una imagen de referencia generada a partir del mismo prompt (referencia estetica) junto al prompt de contenido, y separando los requisitos semanticos de las senales visuales mediante supervision con estructura de grafo y recompensas multimodales desacopladas.

Con 33.357.390.064 parametros (aproximadamente 33,4 mil millones) en formato bf16, licencia Apache 2.0 y un tamano de repositorio de 66,7 GB, es el checkpoint grande de la familia y el que encabeza los resultados agregados de su benchmark. Se publica junto a un modelo hermano de 8B, microsoft/AesCode-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (tag de HuggingFace: qwen3_vl); variante afinada de Qwen3-VL-32B-Instruct |
| Parametros totales | 33.357.390.064 (33,4 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 24.576 tokens (configuracion de evaluacion y de servido indicada en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos publicados son bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

AesCode-32B hereda la arquitectura multimodal Qwen3-VL-32B-Instruct, un transformer vision-lenguaje capaz de procesar simultaneamente imagenes y texto. La tarea objetivo es la generacion de documentos HTML/CSS completos: la model card indica que el modelo emite un documento HTML integro, que las tablas deben usar estructuras de tabla HTML y que los graficos se implementan con ECharts, lo que restringe el espacio de soluciones a implementaciones ejecutables y verificables de forma directa.

El entrenamiento consta de un SFT de arranque en frio (cold-start SFT) seguido de GDPO (una variante de optimizacion por preferencias) sobre siete canales de recompensa. La innovacion central descrita por los autores es el uso de recompensas multimodales desacopladas junto con supervision con estructura de grafo, que separan los requisitos semanticos (texto, limites, graficos, contenido) de las senales puramente visuales (maquetacion y estilo). El prompt de entrada puede acompanarse de una imagen de referencia generada desde el mismo prompt, que actua como guia de maquetacion y estilo sin que el modelo deba copiar su contenido. El modelo no genera imagenes: produce codigo.

## Capacidades

- Generacion de artefactos visuales como codigo: documentos HTML/CSS completos para presentaciones, posters, paneles de control, informes e infografias.
- Entrada multimodal image-text-to-text: acepta una imagen de referencia junto al prompt de contenido y la usa como guia de maquetacion y estilo.
- Separacion explicita entre contenido y forma: sigue el prompt para el contenido requerido y la referencia para las decisiones visuales, evitando copiar contenido alucinado de la imagen.
- Verificabilidad estructural: uso de tablas HTML para datos tabulares y de ECharts para graficos, lo que permite comprobacion programatica.
- Control de desbordamiento de lienzo: el benchmark reporta un 97,27% en la metrica de limites (Bound), con fallo severo de desbordamiento en solo el 4,3% de 300 muestras.
- Idioma: ingles unicamente.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo de pensamiento explicito (thinking mode): no documentado en la informacion disponible.
- Capacidades de audio o video: no documentadas en la informacion disponible.

## Casos de uso

- Generacion de presentaciones editables: a partir de un prompt de contenido y, opcionalmente, una referencia visual, el modelo produce un documento HTML/CSS que puede editarse y versionarse como cualquier otro artefacto de codigo, en lugar de un fichero binario de diapositivas.
- Creacion de posters e infografias de marketing: el modelo compone paginas con jerarquia tipografica y color coherentes, manteniendo la fidelidad de textos y cifras gracias a la supervision desacoplada de contenido y estilo.
- Paneles de control con datos: al generar graficos mediante ECharts y tablas como estructuras HTML, los cuadros de mando resultantes son ejecutables y verificables programaticamente, lo que encaja en flujos de analitica que necesitan artefactos auditables.
- Informes automaticos a partir de datos estructurados: con 24.576 tokens de contexto el modelo puede recibir descripciones extensas de contenido y producir un informe maquetado de una sola pasada (hasta 12.000 tokens de salida).
- Generacion de paginas de aterrizaje o landings de producto: la salida HTML/CSS es directamente desplegable en un navegador y permite iterar sobre el diseno sin regenerar la imagen desde cero.
- Investigacion en generacion multimodal de codigo: el paper y el codigo asociados permiten reproducir el esquema de recompensas desacopladas y el GDPO de siete canales sobre otros backbones.
- Aplicaciones de diseno verificable: la restriccion a implementaciones ejecutables (tablas HTML, ECharts) habilita la validacion automatica del resultado dentro de una cadena de integracion continua antes de su publicacion.

## Benchmarks y rendimiento

Evaluacion sobre 300 muestras de infografias. La columna `Rule` promedia las comprobaciones programaticas de texto, limites y graficos; `Visual` promedia las dimensiones de contenido, maquetacion y estilo; `Overall` es la media de ambas. Las puntuaciones son porcentajes promediados sobre tres generaciones por prompt sin seleccion. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

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

Segun la model card, AesCode-32B mejora la metrica Visual de su backbone Qwen3-VL-32B condicionado por referencia en 22,4 puntos y la Overall en 24,8. Alcanza un Rule de 94,33 frente a 85,90 de GPT-5.5 y 88,04 de Claude Opus 4.8. En Table/Chart obtiene 90,37, el mejor de la comparativa. La dimension Style es el techo comun a todos los sistemas y ningun modelo supera 60.

## Requisitos de hardware

- Memoria de acelerador: aproximadamente 65 GB solo para los parametros en bf16, segun la model card.
- Servido recomendado por los autores: vLLM con `--tensor-parallel-size 4`, `--limit-mm-per-prompt image=2` y `--max-model-len 24576`, lo que implica un minimo de cuatro GPU.
- Estimacion orientativa: 4 GPU de 24 GB (por ejemplo RTX 4090 o L40S) reparten unos 16,7 GB de pesos por dispositivo, quedando margen ajustado para cache KV y activaciones a 24.576 tokens; 2 GPU de 80 GB (A100 o H100) ofrecen una configuracion mas holgada.
- Uso en GPU de consumo: no cabe en una unica GPU de consumo de 24 GB en bf16; requeriria cuantizacion, para la que no se documentan pesos preconvertidos en la informacion disponible.
- Opciones de despliegue: transformers (>= 4.57, con `AutoModelForImageTextToText`) y vLLM. No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (benchmark AesCode) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B | 33,4 B | 24.576 tokens (config. de evaluacion) | 85,89 | Apache 2.0 | Pesos abiertos en HuggingFace |
| AesCode-8B | no disponible | no disponible | 82,94 | no disponible en la informacion | Pesos abiertos en HuggingFace |
| Qwen3-VL-32B-Instruct (backbone) | no disponible | no disponible | 61,10 con referencia / 48,61 sin referencia | no disponible en la informacion | Pesos abiertos |
| GPT-5.5 | no disponible | no disponible | 81,28 con referencia / 76,31 sin referencia | propietaria | API |
| Claude Opus 4.8 | no disponible | no disponible | 80,39 con referencia / 76,78 sin referencia | propietaria | API |

La comparativa se limita a la tarea especifica del benchmark de la model card (generacion de infografias en HTML/CSS), ya que no se dispone de resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para AesCode-32B.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Generacion de imagenes: el modelo no produce imagenes, solo codigo HTML/CSS; requiere un generador de imagenes externo si se quiere usar la modalidad de referencia visual.
- Metrica de estilo: ningun sistema de la comparativa, incluido AesCode-32B, supera 60 puntos en Style, lo que indica que la revision visual humana sigue siendo necesaria antes de la entrega.
- Desbordamiento de lienzo: aunque reducido, persiste un fallo severo de limites en el 4,3% de las 300 muestras evaluadas.
- Riesgo de alucinacion: la model card advierte que los modelos vision-lenguaje sin ajuste pueden copiar contenido alucinado de la imagen de referencia o ignorar su maquetacion; el ajuste mitiga el problema, pero no se documenta una tasa residual de alucinacion de contenido.
- Contexto acotado: la configuracion de evaluacion y servido usa 24.576 tokens, con hasta 12.000 tokens de salida; prompts muy extensos pueden exceder ese limite.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del backbone Qwen3-VL-32B-Instruct, que conviene verificar por separado.
- Reproducibilidad: las puntuaciones publicadas emplean muestreo con temperatura 0,8 y top-p 0,95 sobre tres rollouts por prompt; variaciones en esos parametros alteran los resultados.
- Requisito de version: se necesita transformers >= 4.57 para cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/AesCode-32B
- Modelo hermano: https://huggingface.co/microsoft/AesCode-8B
- Codigo: https://github.com/microsoft/AesCode
- Paper: AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards (referenciado en la model card, sin URL directa en la informacion proporcionada)
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
