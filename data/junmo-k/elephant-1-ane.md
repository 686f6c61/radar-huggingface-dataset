# junmo-k/elephant-1-ane

## Resumen

Elephant-1-ane es un paquete de conversión independiente en FP16 del modelo de decisión Elephant-1, desarrollado por Base Labs en Baseten a partir de Qwen3.5-9B. El autor de esta conversión es junmo-k, que lo publica bajo licencia MIT con el objetivo de ejecutarlo sobre Apple Neural Engine (ANE) mediante el runtime ANERun. El modelo acepta texto, estado estructurado y, opcionalmente, una imagen, y devuelve respuestas y probabilidades para un conjunto de opciones solicitadas; es decir, no es un generador de texto libre, sino un modelo de decisión multimodal.

La relevancia de esta ficha está en que demuestra un flujo de despliegue de un modelo de 9B en hardware de consumo profesional de Apple (Mac Studio) sin GPU dedicada, con grafos Core AI portables y verificación de colocación en la ANE. El repositorio ocupa 18,8 GB e incluye los pesos, el tokenizador y los datos de readout necesarios para ANERun.

Conviene señalar una discrepancia documental: la model card describe el modelo base como un modelo de decisión de 9B, mientras que el recuento real de parámetros en safetensors del repositorio es de 1.020.821.504 (aproximadamente 1,02B). Esta ficha recoge ambos datos tal como aparecen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B, con grafo Core AI portable para Apple Neural Engine (ANE) |
| Parametros totales | 1.020.821.504 según safetensors del repo; la model card describe el modelo base como de 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (paquete convertido en FP16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible; en las pruebas de fidelidad se citan entradas en inglés y coreano |
| Licencia | MIT |
| Formato de pesos | safetensors, junto con grafos fuente Core AI, tokenizador y datos de readout |
| Modelo base | baselabs/elephant-1 (post-entrenado desde Qwen3.5-9B) |
| Tamaño del repositorio | 18,8 GB (instalación aproximada de 18,84 GB) |
| Hardware objetivo | Apple Silicon, Mac Studio `h17d`, macOS 27, Xcode 27.1 con Metal Toolchain |
| Runtime | ANERun (probado con la release candidate 0.3.0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, sobre el que Base Labs aplicó un post-entrenamiento para convertirlo en un modelo de decisión: en lugar de generar texto abierto, recibe texto, estado estructurado y una imagen opcional, y devuelve la respuesta seleccionada junto con probabilidades para cada una de las opciones planteadas. La conversión de junmo-k cambia la representación del grafo, añade la búsqueda de dispositivo de ANERun y funciones numéricas y de readout, manteniendo el tokenizador y los pesos en FP16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en el despliegue: grafos Core AI portables, compilación y especialización para el dispositivo local, verificación de colocación en la ANE y una capa de readout que reproduce las probabilidades del modelo original con una diferencia absoluta máxima de 0,000982 (0,0982 puntos porcentuales) en cuatro entradas fijas de prueba.

## Capacidades

- Modelo de decisión multimodal: acepta texto, estado estructurado e imagen opcional, y devuelve una elección entre opciones junto con las probabilidades asociadas.
- Enrutamiento y clasificación: las pruebas de fidelidad cubren enrutamiento en inglés y en coreano, lo que indica capacidad de selección entre alternativas en distintos idiomas.
- Puntuación estructurada: puede evaluar y puntuar entradas con estado estructurado, no solo texto plano.
- Selección con imagen: soporta decisiones en las que la imagen es una entrada relevante del caso.
- Salida probabilística: proporciona probabilidades por candidato, útil para umbrales, abstención o ranking.
- No se documentan en la información disponible capacidades de generación libre de texto, tool calling, function calling, agentes multi-paso, matemáticas o código.

## Casos de uso

- Enrutamiento de peticiones en un servicio local: dado un texto de entrada y un conjunto de destinos posibles, el modelo devuelve la opción más probable y su probabilidad, lo que permite aplicar umbrales de confianza antes de derivar la petición. Es adecuado porque su salida es una distribución sobre opciones, no texto libre.
- Clasificación con estado estructurado: en flujos donde la decisión depende de campos tabulares o de un estado de sesión además del texto, el modelo acepta esa estructura como entrada y puntúa las alternativas.
- Triage de imágenes en local: con la entrada de imagen opcional, puede seleccionar entre categorías predefinidas (por ejemplo, tipo de incidencia) sin enviar datos a la nube, gracias a la ejecución sobre ANE en un Mac Studio.
- Automatización de escritorio en Mac: al integrarse con ANERun y servir por HTTP, puede actuar como componente de decisión en herramientas locales que necesiten elegir entre acciones o rutas con una latencia de 0,43 a 1,02 segundos en peticiones en caliente.
- Evaluación de alternativas con puntuación probabilística: en paneles de revisión donde varias opciones compiten, las probabilidades permiten ordenar candidatos y registrar la incertidumbre de cada decisión.
- Prototipado sin GPU dedicada: investigadores que quieran reproducir el comportamiento de Elephant-1 en hardware Apple pueden instalar el paquete con `anerun models install` y validar decisiones con una fidelidad documentada frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta medidas de fidelidad de conversión y latencia:

| Medición | Resultado |
|---|---|
| Diferencia absoluta máxima en probabilidad de candidato (4 entradas fijas) | 0,000982 (0,0982 puntos porcentuales) |
| Cobertura de la prueba de fidelidad | 4 invocaciones CLI y 12 peticiones HTTP; enrutamiento en inglés, enrutamiento en coreano, puntuación estructurada y elección con imagen |
| Primera petición HTTP por entrada | 1,06–1,61 s |
| Peticiones en caliente | 0,43–1,02 s (el caso con imagen en el extremo superior) |
| Compilación y especialización inicial | tiempo adicional no cuantificado |

## Requisitos de hardware

- VRAM: no aplica; el destino es Apple Neural Engine. El instalador descarga aproximadamente 18,84 GB y requiere espacio adicional en disco para la compilación y la caché nativa.
- GPU recomendadas: no aplica GPU discreta; el hardware cualificado es Mac Studio `h17d` con Apple Silicon.
- Cabe en consumer GPU: no es el objetivo del paquete; está diseñado para ANE en Apple Silicon, no para CUDA.
- Sistema y toolchain: macOS 27, Xcode 27.1 y el Metal Toolchain opcional.
- Opciones de despliegue: ANERun 0.3.0 (release candidate) con `anerun models install` y `anerun serve`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia: 1,06–1,61 s en la primera petición por entrada y 0,43–1,02 s en caliente; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| junmo-k/elephant-1-ane | 1.020.821.504 según safetensors (base descrito como 9B) | no disponible | MIT | Hugging Face, runtime ANERun | Conversión FP16 para Apple Neural Engine |
| baselabs/elephant-1 | descrito como 9B | no disponible | MIT | Hugging Face | Modelo original de decisión de Base Labs en Baseten |
| Qwen3.5-9B | 9B | no disponible | licencia Qwen incluida en el repo | Hugging Face | Modelo base del que se post-entrenó Elephant-1; generativo, no de decisión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card describe un modelo de 9B, pero el recuento real de safetensors del repositorio es de 1.020.821.504 parámetros; conviene verificar qué artefacto se está desplegando antes de usarlo en producción.
- Ámbito de uso restringido: es un modelo de decisión sobre opciones predefinidas, no un generador de texto libre; no debe emplearse para tareas generativas sin validación previa.
- Fidelidad medida en un conjunto muy pequeño: la comparación con el original se limita a cuatro entradas fijas, por lo que no garantiza equivalencia en dominios no cubiertos.
- Dependencia de hardware y software muy específicos: Mac Studio `h17d`, macOS 27, Xcode 27.1 y ANERun 0.3.0 release candidate; no hay soporte documentado para otras plataformas.
- Idiomas: no se declara una lista de idiomas soportados; las pruebas citan inglés y coreano, sin cobertura documentada del castellano.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de error en la información disponible; al tratarse de un derivado de Qwen3.5-9B, hereda los sesgos del modelo base.
- Licencia: MIT para este paquete, con atribución upstream y licencia de Qwen3.5-9B incluida en `licenses/Qwen3.5-9B-LICENSE`; es necesario revisar ambas para uso comercial.
- Madurez: el runtime indicado es una release candidate y el repositorio tiene 18 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/junmo-k/elephant-1-ane
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Checkpoint upstream fijado: https://huggingface.co/baselabs/elephant-1/tree/b3f8a93462fb1051a9de031e94a7ff380e254072
- Proyecto ANERun: https://github.com/junmo-kim/ANERun
- Licencia MIT del repositorio: https://huggingface.co/junmo-k/elephant-1-ane/blob/main/LICENSE
- Atribución upstream: https://huggingface.co/junmo-k/elephant-1-ane/blob/main/NOTICE
- Licencia de Qwen3.5-9B: https://huggingface.co/junmo-k/elephant-1-ane/blob/main/licenses/Qwen3.5-9B-LICENSE
