# DuoNeural/FC-CDM-Poincare-7L-108M

## Resumen

FC-CDM-Poincare-7L-108M es un modelo de generación de texto ultracompacto y altamente especializado en *function calling*, desarrollado por DuoNeural, un laboratorio independiente de investigación en IA. Se construye sobre la arquitectura propietaria CDM (*Crystal Directional Mixture-of-Experts*), un transformer de mezcla de expertos dispersa en el que el enrutado se realiza sobre una variedad hiperbólica de Poincaré en lugar de un softmax euclídeo, con el objetivo declarado de representar de forma nativa jerarquías de esquemas de herramientas. El modelo se presenta como un destilado del profesor Salesforce xLAM-1b-fc-r sobre el conjunto de 60.000 ejemplos `Salesforce/xlam-function-calling-60k`.

Su relevancia práctica es acotada pero concreta: propone que un modelo de tres cifras de millones de parámetros puede alcanzar precisión competitiva en selección de funciones y llamadas paralelas frente a modelos varias veces mayores, con una huella de memoria de decenas de megabytes en cuantización de 4 bits. La model card compara sus resultados con FunctionGemma-270M de Google DeepMind, reportando paridad en selección de herramienta (62,0% frente a 61,6% en BFCL Simple) y ventaja en argument F1 en escenarios paralelos (67,10% frente a ~58,2%).

Conviene señalar dos advertencias de partida: la cuenta real de parámetros en los pesos `safetensors` publicados es de 134.438.552, no los 107,79 M que afirma la model card, y el modelo no ha recibido validación independiente alguna (0 descargas, 0 *likes* en el momento de la ficha). Además, su ventana de contexto es de solo 512 tokens y no está entrenado para abstenerse, lo que limita su uso a *routing* y extracción de esquemas, no a conversación general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso CDM (*Crystal Directional Mixture-of-Experts*) con enrutado sobre hiperboloide de Poincaré; identificador de arquitectura `cdm_moe_poincare_fc` |
| Parámetros totales | 134.438.552 según los pesos `safetensors` publicados; la model card declara 107,79 M no atados (83,02 M atados, 58,24 M de *backbone*) |
| Parámetros activos | ~38 M por token según el autor (enrutado disperso 2 de 4 expertos); estimación del autor, no verificable de forma independiente |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | GGUF Q8_0 (~115 MB) y Q4_K_M (~60 MB) según la model card; pesos originales en BF16/FP16. No se documentan otras variantes (GPTQ, AWQ, EXL2) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `transformers`); GGUF mediante un `llama.cpp` parcheado por DuoNeural |
| Capas | 7 |
| Dimensión oculta (d_model) | 768 |
| Cabezas de atención | 12 |
| Dimensión feed-forward (d_ff) | 1024 |
| Expertos por capa (E) | 4 |
| Expertos activos por token (K) | 2 |
| Centroides de enrutado cristalino | 8 por capa |
| Tamaño de vocabulario | 32.256 |
| Curvatura hiperbólica (c) | 0,30–0,35 (0,3008 en capa 0; 0,3538 en capa 6) |
| Modelo profesor | Salesforce xLAM-1b-fc-r (1.350 M parámetros según la card) |
| Dataset de entrenamiento | `Salesforce/xlam-function-calling-60k` (60.000 ejemplos) |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 7 capas con atención multi-cabeza estándar (12 cabezas, d_model 768) en el que cada capa *feed-forward* se sustituye por un MoE de 4 expertos con d_ff compacto de 1024 y enrutado *top-2*. La innovación declarada está en el mecanismo de enrutado: en lugar de una puerta softmax euclídea, se utilizan centroides sobre un hiperboloide de Poincaré con curvatura ajustable (c ≈ 0,30–0,35), de modo que las representaciones de entrada se proyectan en una geometría con capacidad exponencial para acomodar estructuras arbóreas, algo alineado con la naturaleza jerárquica de los esquemas JSON. El autor acompaña esta descripción con un análisis de "Slot Logit Lens" sobre los 8 centroides por capa, mostrando que en la capa 0 ciertos *slots* se especializan en anclajes sintácticos (`":"`, `"{"`, `"[")` y otros en descriptores de esquema (`"description"`, `"type"`, `"required"`), y que en la capa 6 los centroides se agrupan en torno a restricciones de parámetros (`type`, `default`, `alias`, `optional`, `required`). Esta separación entre sintaxis y semántica es, según el autor, lo que evita la degradación de formato en modelos de este tamaño.

El entrenamiento es una destilación del profesor xLAM-1b-fc-r sobre los 60.000 ejemplos de `xlam-function-calling-60k`, sin mezcla de datos negativos ni diálogo conversacional, y sin que la model card documente fases de RLHF, DPO o *preference tuning*. El autor reporta una pérdida de validación de 0,3337 BPB (perplejidad ≈ 2,33), que interpreta como convergencia saturada sobre el conjunto. No se especifican el número total de tokens vistos, la composición exacta del dataset más allá del nombre del *benchmark* de origen, ni los detalles del *scheduler* o la inicialización de los centroides hiperbólicos. Tampoco se publica el código de entrenamiento ni el paper asociado en los materiales disponibles.

## Capacidades

- Generación de llamadas a funciones en formato JSON a partir de lenguaje natural y de un esquema de herramientas dado.
- Selección de herramienta en un único turno (una llamada por consulta).
- Llamadas paralelas: emisión de múltiples invocaciones en una misma respuesta, con argument F1 reportado del 67,10% en el subconjunto paralelo.
- Extracción de argumentos clave-valor, incluyendo tipos, valores por defecto y campos opcionales o requeridos.
- Enrutado de bajo coste: ~38 M de parámetros activos por token según el autor, lo que permite ejecutarlo como clasificador previo a un modelo mayor.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Modo *thinking*, visión, audio, tool calling anidado o razonamiento multi-paso: no disponibles ni documentados.
- Detección de irrelevancia / abstención: no soportada (0,0% en el control negativo reportado por el propio autor).

## Casos de uso

- **Enrutado de herramientas en asistentes locales**: con 512 tokens de contexto y ~60 MB en Q4_K_M, el modelo puede residir en memoria de un dispositivo móvil o un mini-PC y decidir qué función invocar antes de derivar la respuesta a un LLM mayor, reduciendo el coste por consulta.
- **Extracción de parámetros estructurados en automatización de procesos**: conversión de una frase corta del usuario ("reserva mesa para cuatro el viernes a las nueve") en un JSON con los campos del esquema de la API de reservas, aprovechando la especialización de los centroides de la capa 6 en restricciones de parámetros.
- **Orquestación de llamadas paralelas**: cuando una consulta requiere consultar varias fuentes (tiempo, vuelos y hotel en un mismo turno), el modelo emite las llamadas en una sola pasada; el argument F1 de 67,10% en el subconjunto paralelo lo hace viable en flujos donde el error se puede reintentar.
- **Router de intenciones previo a un pipeline RAG**: clasificación de la consulta entrante en una de las herramientas registradas y paso posterior al recuperador correspondiente, con latencia muy baja al tener solo 7 capas y 2 expertos activos.
- **Procesamiento en el borde sin conectividad**: despliegue en microcontroladores o SRAM con cuantización Q4_K_M según la model card, para dispositivos industriales o IoT que deben formatear comandos de API sin acceso a la nube.
- **Normalización de esquemas en ETL de datos**: mapeo de campos de orígenes heterogéneos a un esquema canónico, tratando cada registro corto como una consulta de *function calling* contra el esquema destino.
- **Investigación en interpretabilidad de geometrías hiperbólicas**: con 7 capas y 4 expertos por capa, es un sujeto barato para reproducir análisis de enrutado, comparar inicializaciones de centroides o hacer *ablations* de curvatura en una sola GPU de consumo.

## Benchmarks y rendimiento

Resultados reportados por el autor frente a `google/functiongemma-270m-it`, sobre *splits* retenidos propios y tomando BFCL como referencia. No hay verificación independiente.

| Benchmark / subtarea | FunctionGemma-270M | FC-CDM-Poincare-7L-108M | Nota |
|---|---|---|---|
| Precisión en llamadas paralelas | 29,5% (Distil Labs) / 39,0% (BFCL) | 38,0% | Paridad con 40% de la huella |
| Argument F1 en paralelo | ~58,2% | 67,10% | +8,9 puntos |
| Validez de esquema JSON en paralelo | ~84,5% | 74,00% | Peor que la referencia |
| Selección de función, un turno | 61,6% (BFCL Simple) / 68,4% | 62,00% | Paridad |
| Argument F1, un turno | ~64,0% | 59,93% | Peor que la referencia |
| Validez sintáctica JSON, un turno | 89,2% | 66,00% | Peor que la referencia |
| Pérdida de validación / BPB | No disponible (entrenamiento propietario) | 0,3337 BPB (PPL ≈ 2,33) | Sobre xLAM-60k |
| Detección de irrelevancia (control negativo) | 73,7% | 0,0% | Sin datos negativos en el SFT |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- **VRAM en BF16/FP16**: ~215 MB según la model card; ~269 MB si se calcula a partir de los 134.438.552 parámetros reales de los `safetensors` (2 bytes por parámetro). La discrepancia entre ambas cifras no está explicada por el autor.
- **VRAM en Q8_0**: ~115 MB según la model card.
- **VRAM en Q4_K_M**: ~60 MB según la model card, lo que permite residencia en SRAM o caché L3 de algunos SoC.
- **GPU recomendadas**: cualquier GPU con más de 1 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 3060, una GTX 1650, una iGPU reciente o incluso CPU con AVX2 bastan para la inferencia.
- **¿Cabe en GPU de consumo?**: sí, en todas las GPU de consumo de las últimas dos generaciones, con margen amplio para *batching*.
- **Opciones de despliegue**: `transformers` (librería declarada) y `llama.cpp` con los *kernels* geodésicos hiperbólicos parcheados por DuoNeural, que es un requisito para cargar el GGUF. Soporte en vLLM, TGI u Ollama: no disponible / no confirmado; la arquitectura personalizada `cdm_moe_poincare_fc` probablemente exige código propio y posiblemente `trust_remote_code`.
- **Latencia y throughput**: no disponible. No se publican mediciones de tokens por segundo ni de latencia por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos/token | Contexto | Licencia | Datos de function calling |
|---|---|---|---|---|---|
| FC-CDM-Poincare-7L-108M | 134,4 M (medidos) / 107,79 M (declarados) | ~38 M (2 de 4 expertos) | 512 | Apache 2.0 | Precisión 62,0%; argument F1 59,93% (un turno) |
| google/functiongemma-270m-it | 268–270 M (denso) | ~270 M | No disponible en la información proporcionada | No disponible en la información proporcionada | Precisión 61,6%; argument F1 ~64,0% (un turno) |
| Salesforce/xLAM-1b-fc-r (profesor) | ~1.350 M según la card | Denso | No disponible en la información proporcionada | No disponible en la información proporcionada | Usado como referencia de destilación; cifras propias no disponibles |

Frente a alternativas densas de tamaño similar, la diferencia declarada es de eficiencia computacional: el CDM activa aproximadamente una séptima parte de sus parámetros por token, lo que reduce el coste de inferencia a cambio de una complejidad de despliegue mucho mayor (kernels personalizados) y de una validación externa inexistente.

## Limitaciones y advertencias

- **Ausencia total de abstención**: el autor reporta 0,0% en detección de irrelevancia. El modelo intentará resolver cualquier entrada del usuario como una llamada a herramienta, incluso cuando la consulta sea conversacional o no tenga herramienta aplicable. Es un fallo crítico para cualquier despliegue en producción sin una capa de filtrado previa.
- **Validez JSON inferior a la referencia**: 66,00% en sintaxis JSON de un solo turno y 74,00% en paralelo, frente a 89,2% y ~84,5% de FunctionGemma-270M. Habrá que parsear con tolerancia a errores y reintentar.
- **Contexto de 512 tokens**: insuficiente para esquemas de herramientas grandes o conversaciones multi-turno. Un catálogo de funciones extenso más la consulta puede superar el límite con facilidad.
- **Solo inglés**: no se declara ni se evalúa ningún otro idioma, incluido el castellano.
- **Discrepancia en el recuento de parámetros**: 134,4 M en los pesos publicados frente a 107,79 M declarados en la model card. Afecta a las estimaciones de memoria y a la reproducibilidad de las afirmaciones de eficiencia.
- **Dependencia de un runtime parcheado**: el GGUF requiere el `llama.cpp` modificado por DuoNeural con kernels hiperbólicos. Esto rompe la portabilidad y ata el despliegue a un fork de mantenimiento incierto.
- **Benchmarks autoinformados**: no hay evaluación independiente, ni descarga ni *feedback* de la comunidad en el momento de la ficha; la comparación con FunctionGemma-270M usa *splits* retenidos propios y rangos amplios (29,5%–39,0%) para el rival.
- **Riesgo de alucinación de argumentos**: al estar entrenado solo con trazas de *function calling*, puede generar valores plausibles pero inventados para campos obligatorios en lugar de señalar que faltan datos.
- **Sesgos**: no documentados por el autor; el corpus xLAM-60k procede de esquemas de API de dominios mayoritariamente técnicos y en inglés, lo que puede infrarepresentar otros contextos.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del dataset de destilación (`xlam-function-calling-60k`) y del modelo profesor, que la model card no detalla.
- **Madurez**: el autor anuncia una v2 con un 15% de controles negativos para crear un "basin" de no-herramienta; la versión actual debe considerarse un artefacto de investigación, no un componente listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/FC-CDM-Poincare-7L-108M
- Organización DuoNeural en HuggingFace: https://huggingface.co/DuoNeural
- Sitio web del laboratorio: https://duoneural.com/index.html
- Perfil de GitHub: https://github.com/DuoNeural
- Repositorios de GitHub: https://github.com/DuoNeural?tab=repositories
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Modelo profesor citado: https://huggingface.co/Salesforce/xLAM-1b-fc-r
- Modelo de comparación citado: https://huggingface.co/google/functiongemma-270m-it
- Paper, DOI o informe técnico del modelo: no disponible en la información proporcionada (el autor menciona preprints en Zenodo a través de su web, sin enlace directo).
