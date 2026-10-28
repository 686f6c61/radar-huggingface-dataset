# MTalha2001/LOCUS-2B

## Resumen

LOCUS-2B es un modelo de *visual grounding* (localización visual) desarrollado por Muhammad Talha (MTalha2001) que recibe una imagen y una expresión en lenguaje natural («el hombre de la camisa roja») y devuelve la caja delimitadora del objeto referido en píxeles. Se construye sobre Qwen/Qwen3-VL-2B-Instruct, al que se le añade una pequeña cabeza de regresión de cajas y se le somete a un ajuste fino completo del modelo de lenguaje y del fusionador visual.

La innovación es la receta «Locus» (Locate Once, Check Until Settled): la imagen se preprocesa una sola vez y cada expresión se resuelve como una rama corta sobre el prefijo cacheado; la cabeza de cajas genera un borrador en una sola pasada y ese borrador se renderiza como los tokens de coordenadas que el modelo escribiría, para que el propio modelo los verifique en paralelo mediante iteración de Jacobi hasta que el borrador deja de cambiar. Con aceptación exacta, la caja devuelta coincide con la respuesta greedy del modelo en tokens de coordenadas, pero alcanzada en unas pocas pasadas en lugar de un paso de decodificación por token.

Su relevancia es práctica: consigue precisión de modelo de 2B con latencias de decodificación especulativa (43,5 ms con solo la cabeza y 102,2 ms con verificación exacta por expresión en una RTX A6000), lo que lo hace viable en pipelines que deben localizar muchos objetos sobre una misma imagen. El modelo tiene 1.746.808.325 parámetros, licencia Apache-2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) de Qwen3-VL-2B-Instruct + cabeza de cajas añadida; verificación por decodificación especulativa con iteración de Jacobi |
| Parámetros totales | 1.746.808.325 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; pesos publicados en safetensors (bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `locus_config.json`); el codificador visual, el tokenizador y el resto de pesos se descargan aparte desde Qwen/Qwen3-VL-2B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct (transformer multimodal con torre visual y fusionador) y le añade una cabeza de cajas de pequeño tamaño. El repositorio solo contiene los pesos que el entrenamiento modificó: la cabeza de cajas, el modelo de lenguaje completamente ajustado y el fusionador visual; el codificador visual y el tokenizador permanecen congelados y se toman del modelo base. La inferencia sigue tres etapas: precarga única de la imagen, borrador de la caja en una pasada por la cabeza, y verificación del borrador renderizado como tokens de coordenadas mediante iteración de Jacobi en paralelo, conservando el prefijo aceptado y corrigiendo el siguiente token hasta la convergencia.

El entrenamiento consistió en un ajuste fino completo del modelo de lenguaje y del fusionador visual con tasa de aprendizaje 1e-5, con la cabeza y el verificador entrenados conjuntamente durante 36.000 pasos, equivalentes a 2,00 épocas (el mismo presupuesto que Jag). Los datos son las particiones de entrenamiento de RefCOCO, RefCOCO+ y RefCOCOg sobre imágenes de COCO, eliminando toda imagen que aparezca en cualquier partición de evaluación. No se mencionan fases de RLHF ni DPO; el objetivo es puramente de localización. El modo `accept=1.0` (por defecto) devuelve la caja greedy exacta en tokens de coordenadas, `accept=0.7` o `0.5` aplica aceptación típica (menos pasadas, sin equivalencia exacta con greedy) y `verify=False` devuelve el borrador de una sola pasada de la cabeza.

## Capacidades

- Localización visual (*visual grounding*): devuelve `[x0, y0, x1, y1]` en píxeles para una expresión referencial sobre una imagen.
- Comprensión de expresiones referenciales (REC) sobre imágenes de COCO/RefCOCO en inglés.
- Procesamiento por lotes de varias expresiones sobre una misma imagen reutilizando el prefijo cacheado, lo que reduce el coste por consulta.
- Decodificación especulativa verificada: la cabeza actúa como *drafter* de los tokens de coordenadas del propio modelo.
- Modos de aceptación configurables (exacta 1.0, típica 0.5/0.7) y modo sin verificación para mínima latencia.
- No soporta *tool calling*, agentes ni razonamiento multi-paso; responde únicamente consultas de grounding (las demás preguntas deben dirigirse al modelo base).
- Multilingüe: no; solo inglés.

## Casos de uso

- Anotación semiautomática de datasets: dado un conjunto de imágenes y descripciones, el modelo genera cajas para preetiquetar y el equipo humano solo revisa, con 90,01 de Acc@0.5 en una pasada y 89,30 con verificación exacta.
- Robótica de manipulación e interacción: un operador indica «la taza azul junto al portátil» y el sistema obtiene la caja en píxeles (43,5-102,2 ms) para proyectarla al espacio del brazo o del sistema de agarre.
- Control de interfaces gráficas y automatización de escritorio: localizar el botón o campo descrito en lenguaje natural para agentes de automatización que necesitan coordenadas clicables.
- Edición y retoque de imágenes: selección automática del objeto referido para aplicar recortes, máscaras o filtros sin intervención manual, reutilizando el prefijo de imagen para múltiples selecciones.
- Búsqueda visual en catálogos y comercio electrónico: localizar «la chaqueta del modelo de la derecha» en una imagen de producto para generar recortes o etiquetas de región.
- Moderación y análisis de contenido: localizar regiones descritas en una imagen para revisión humana o para aplicar políticas por zona (por ejemplo, marcas o personas concretas).
- Accesibilidad: descripción asistida que vincula una petición verbal del usuario con la región concreta de la escena, útil en aplicaciones de lectura de entorno.
- Inspección industrial y análisis documental: localizar campos, componentes o defectos nombrados en una imagen de alta resolución con 640² píxeles de entrada.

## Benchmarks y rendimiento

Media sobre las 8 particiones val y test de RefCOCO / RefCOCO+ / RefCOCOg, a 640² píxeles. «Passes» es el número medio de pasadas secuenciales por expresión.

| Salida | Acc@0.5 | Acc@0.75 | Acc@0.9 | Passes |
|---|---|---|---|---|
| Cabeza (una pasada) | 90,01 | 79,79 | 54,87 | 1 |
| Verificada, exacta (greedy) | 89,30 | 80,31 | 59,13 | 5,60 |
| Verificada, típica (α = 0,5) | 89,60 | 80,49 | 58,95 | 3,43 |

Comparación con modelos de referencia sobre las mismas filas:

| Modelo | Enfoque | Acc@0.5 | Acc@0.75 | Acc@0.9 |
|---|---|---|---|---|
| Jag-0.8B | cabeza de regresión | 88,16 | 76,51 | 48,76 |
| LocateAnything-3B | tokens de caja | 88,68 | 80,82 | 65,55 |
| LOCUS-2B (exacto) | cabeza + verificación | 89,30 | 80,31 | 59,13 |

Latencia en una RTX A6000, batch 1, entradas de 512², con CUDA graphs: 43,5 ms con solo la cabeza y 102,2 ms por expresión con verificación exacta. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no serían representativos de un modelo especializado en grounding.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB solo para los pesos en bf16 (1,75B parámetros), más la torre visual del modelo base y las activaciones; en la práctica, entre 8 y 10 GB para inferencia cómoda a 512-640² con caché de imagen.
- GPU recomendadas: RTX A6000 (configuración medida por el autor), A100/H100 para mayor concurrencia, y RTX 4090/3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB sin problema; en 8 GB es ajustado y exigiría cuantización, para la que no se publican pesos preparados.
- Requiere GPU CUDA de forma explícita según la model card; no se documenta soporte de CPU.
- Opciones de despliegue: el paquete propio `locus` (`pip install git+https://github.com/muhammad-talha-ad/LOCUS`) con `from_pretrained` y `ground`; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF.
- Rendimiento: 43,5 ms (cabeza, una pasada) y 102,2 ms (verificación exacta) por expresión en RTX A6000, batch 1, 512², con CUDA graphs. El coste marginal por expresión adicional sobre la misma imagen es bajo gracias al prefijo cacheado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acc@0.5 (RefCOCO media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LOCUS-2B | 1,75B | no disponible | 89,30 (exacto) / 90,01 (cabeza) | Apache-2.0 | HuggingFace + GitHub |
| Jag-0.8B | 0,8B (aprox.) | no disponible | 88,16 | no disponible | no disponible |
| LocateAnything-3B | 3B (aprox.) | no disponible | 88,68 (65,55 en Acc@0.9) | no disponible | no disponible |
| Qwen3-VL-2B-Instruct (base, zero-shot) | 2B (aprox.) | no disponible | no disponible | Apache-2.0 | HuggingFace |

LOCUS-2B mejora a Jag-0.8B en las tres métricas con algo más del doble de parámetros, y se sitúa ligeramente por encima de LocateAnything-3B en Acc@0.5 pese a tener menos parámetros, aunque queda claramente por debajo en Acc@0.9 (59,13 frente a 65,55), es decir, en precisión de cajas muy ajustadas. La ventaja frente a LocateAnything-3B está en el coste: menos parámetros y verificación paralela en lugar de un token por paso.

## Limitaciones y advertencias

- Entrenado exclusivamente con la familia RefCOCO; no se ha validado en dominios fuera de COCO y el propio autor advierte que el rendimiento se degrada en objetos pequeños (en las imágenes Objects365 de Ref-L4 queda muy por debajo del modelo base zero-shot).
- Solo responde consultas de grounding; cualquier otra pregunta debe dirigirse a Qwen3-VL-2B-Instruct.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas.
- La verificación es más lenta que la cabeza sola y que una cabeza de regresión pura (102,2 ms frente a 43,5 ms), por lo que en despliegues de baja latencia hay que elegir entre exactitud y velocidad.
- La equivalencia exacta con la decodificación greedy se cumple en bf16 solo hasta el redondeo, que también hace que dos ejecuciones greedy con formas de batch distintas difieran.
- Requiere GPU CUDA; no se documentan pesos cuantizados, GGUF ni soporte de CPU.
- Los pesos son Apache-2.0, pero las anotaciones de entrenamiento provienen de RefCOCO/RefCOCO+/RefCOCOg sobre imágenes COCO: hay que revisar los términos de esos datasets para uso comercial.
- Riesgo de alucinación de cajas: al ser un modelo generativo de coordenadas, puede devolver una región plausible aunque el objeto no exista en la imagen; conviene umbralizar o validar en producción.
- Sesgos heredados del modelo base y de la distribución de COCO (escenas cotidianas, anotaciones en inglés), con posible peor cobertura en dominios alejados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MTalha2001/LOCUS-2B
- Página del proyecto: https://muhammad-talha-ad.github.io/LOCUS/
- Paper (arXiv 2610.35053): https://arxiv.org/abs/2610.35053
- Código en GitHub: https://github.com/muhammad-talha-ad/LOCUS
- Modelo hermano LOCUS-0.8B: https://huggingface.co/MTalha2001/LOCUS-0.8B
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Perfil del autor: https://huggingface.co/MTalha2001/models
