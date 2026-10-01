# aaronfeller/StabilityArc

## Resumen

StabilityArc es un decodificador neuronal publicado por Aaron L. Feller (repositorio `aaronfeller/StabilityArc`) que predice los efectos de sustituciones de un solo aminoácido sobre la estabilidad de una proteína. El modelo no se entrena desde cero: utiliza embeddings de secuencia congelados de ESMC-600M, un encoder proteico de 600 millones de parámetros que se descarga por separado desde su página upstream (`biohub/esmc-600m-2024-12`). Sobre esos embeddings, StabilityArc aprende a proyectar la representación de cada posición en un valor de estabilidad y en un ddG predicho para las 19 sustituciones no nativas posibles.

El repositorio contiene únicamente el código de inferencia y el checkpoint del decodificador denominado «all-66», entrenado con ensayos de estabilidad de 66 proteínas de ProteinGym. No incluye los pesos de ESMC-600M, datos de benchmark, checkpoints por pliegue, el manuscrito ni una demo alojada. El propio autor advierte que los resultados protein-held-out del manuscrito se obtuvieron con checkpoints distintos, de modo que no pueden reproducirse con este checkpoint.

Es relevante para equipos de biología computacional e ingeniería de proteínas porque ofrece una vía directa, en PyTorch y con pocas líneas de código, para puntuar librerías completas de mutantes puntuales antes de gastar presupuesto experimental. Sus limitaciones principales son la ausencia de licencia declarada, la falta de benchmarks publicados en el repositorio y que el valor de ddG devuelto no está calibrado como medida experimental en kcal/mol.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador sobre embeddings congelados de ESMC-600M (encoder proteico tipo transformer); detalles internos del decodificador no disponibles |
| Parametros totales | Decodificador: no disponible; encoder ESMC-600M: 600 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; acotada por el limite de entrada de ESMC-600M |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica: modelo sobre secuencias de proteinas; la entrada admite exclusivamente los 20 aminoacidos estandar |
| Licencia | no especificada por el autor; ESMC-600M tiene terminos upstream independientes |
| Formato de pesos | PyTorch (`checkpoints/stabilityarc.pt`); los pesos de ESMC-600M se descargan aparte en formato no disponible |
| Tarea | Prediccion de efectos de mutacion (estabilidad / ddG) para sustituciones unicas |
| Entrada | Secuencia de proteina con los 20 aminoacidos estandar |
| Salida | 19 sustituciones no nativas por posicion (indexadas 1-based): `stabilityarc_stability_score` y `stabilityarc_predicted_ddG` |
| Libreria | pytorch (Python 3.10+, CUDA recomendada) |
| Tamano del repositorio | 0.0 GB |
| Autor | aaronfeller |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

StabilityArc sigue un esquema de «decoding» de embeddings: el encoder ESMC-600M permanece congelado y solo se entrena la cabeza decodificadora que transforma las representaciones por residuo en predicciones de estabilidad. La API devuelve, para cada posición 1-based de la secuencia introducida, las 19 sustituciones no nativas junto con dos campos: `stabilityarc_stability_score` (valores mayores indican mayor estabilidad predicha) y `stabilityarc_predicted_ddG`, que es simplemente el negativo de esa puntuación y, según el autor, **no** constituye una medida experimental calibrada en kcal/mol. La descripción pública no detalla el número de capas, la dimensión oculta ni el número de parámetros del decodificador.

El checkpoint distribuido («all-66») fue entrenado con ensayos de estabilidad de 66 proteínas de ProteinGym y está pensado para inferencia sobre proteínas externas. No se especifican en el repositorio el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras optimizaciones; tampoco se documentan innovaciones de decodificación especulativa o atención lineal. La referencia técnica asociada es el manuscrito de Feller, Ellington y Wilke (2026), *StabilityArc: Decoding Protein Sequence Embeddings into Generalizable Stability Landscapes*, que no se incluye en el repositorio.

## Capacidades

- Predicción de efectos de sustitución única de aminoácidos sobre la estabilidad proteica.
- Puntuación de las 19 sustituciones no nativas en cada posición de una secuencia dada.
- Salida de dos métricas por mutante: `stabilityarc_stability_score` y `stabilityarc_predicted_ddG` (esta última no calibrada experimentalmente).
- Inferencia sobre proteínas externas al conjunto de entrenamiento (los 66 conjuntos de ProteinGym se usaron para entrenar, no para evaluar).
- Ejecución en CPU o GPU (CUDA recomendada para el encoder de 600 M de parámetros).
- Uso programático desde Python mediante `stabilityarc.inference.StabilityArcPredictor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión, audio, ni modalidades distintas de la secuencia proteica.
- No soporta aminoácidos no canónicos, indels ni mutaciones múltiples combinadas.

## Casos de uso

- Priorización de variantes missense en genética clínica: dado un listado de variantes de significado incierto, el modelo puntúa cada sustitución y permite ordenar candidatas para validación funcional posterior, reduciendo el espacio experimental.
- Cribado in silico previo a evolución dirigida: antes de construir una librería de mutagénesis, se puntúan todas las sustituciones posibles de la proteína diana y se seleccionan las posiciones con mayor margen de mejora de estabilidad.
- Ingeniería de estabilidad térmica de enzimas industriales: se aplica el decodificador sobre la secuencia de la enzima y se filtran las mutaciones con `stabilityarc_stability_score` más alto para ensayos de termoestabilidad.
- Desarrollo de biofármacos y anticuerpos: evaluación rápida del impacto de mutaciones puntuales en regiones variables o de framework, para descartar variantes desestabilizadoras antes de expresarlas y caracterizarlas.
- Anotación a escala en pipelines bioinformáticos: el modelo es un módulo PyTorch invocable desde scripts, por lo que puede integrarse en un pipeline que recorra paneles de variantes y almacene los resultados en una base de datos.
- Planificación de experimentos de deep mutational scanning: usar las predicciones como hipótesis previas para decidir qué posiciones cubrir con mayor profundidad de secuenciación.
- Formación y análisis metodológico: al exponer la API de decodificación de embeddings congelados, sirve como referencia didáctica para estudiar el paradigma de reutilizar encoders proteicos preentrenados en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que no incluye datos de benchmark ni checkpoints por pliegue, y que los resultados protein-held-out del manuscrito no pueden reproducirse con el checkpoint «all-66» aquí distribuido.

## Requisitos de hardware

- VRAM del encoder: ESMC-600M tiene 600 M de parámetros; la estimación teórica de pesos es de aproximadamente 2,4 GB en fp32 (~1,2 GB en fp16/bf16), a lo que hay que sumar activaciones que crecen con la longitud de la secuencia. Estas cifras son estimaciones de cálculo a partir del tamaño del encoder, no datos publicados por el autor.
- VRAM del decodificador: no disponible.
- GPU recomendadas: el autor indica CUDA como recomendada; no especifica modelos concretos. Cualquier GPU con suficiente memoria para el encoder debería ser válida.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con 8-12 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) si se usa precisión reducida, aunque no hay confirmación oficial en la documentación.
- CPU: la inferencia es posible en CPU (el código selecciona `cpu` si no hay CUDA disponible), pero con latencias no especificadas y presumiblemente altas para el encoder de 600 M.
- Opciones de despliegue: integración directa en Python mediante PyTorch y la API `stabilityarc.inference`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Requisito operativo: la primera predicción descarga los pesos de ESMC-600M y necesita acceso a red.

## Comparativa con modelos similares

Los datos de licencia y parámetros de los modelos alternativos proceden de su documentación pública y conviene verificarlos antes de un uso en producción. No hay comparación de rendimiento disponible entre StabilityArc y estas alternativas, ya que no se publican benchmarks en el repositorio.

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| StabilityArc | Decodificador entrenado sobre embeddings congelados de ESMC-600M | Decodificador: no disponible; encoder: 600 M | no especificada | HuggingFace (`aaronfeller/StabilityArc`) |
| ESMC-600M sin fine-tuning | Embeddings proteicos de propósito general, uso cero-shot para puntuar mutaciones | 600 M | terminos upstream propios | HuggingFace (`biohub/esmc-600m-2024-12`) |
| ESM-1v | Modelo de lenguaje proteico para prediccion cero-shot de efectos de mutacion | aproximadamente 650 M | MIT (segun documentacion publica) | HuggingFace |
| ThermoMPNN | Red neuronal sobre grafos construida sobre ProteinMPNN para prediccion de ddG | no disponible | MIT (segun documentacion publica) | GitHub |
| AlphaMissense | Clasificador de patogenicidad de variantes missense derivado de AlphaFold2 | no disponible | CC BY-NC-SA 4.0 (segun documentacion publica) | GitHub |

## Limitaciones y advertencias

- Licencia no especificada: el autor no declara licencia de software ni de modelo para StabilityArc. No puede asumirse permiso de uso comercial. Además, ESMC-600M tiene términos upstream propios que hay que respetar por separado.
- ddG no calibrado: `stabilityarc_predicted_ddG` es el negativo del score de estabilidad y no una medida experimental en kcal/mol. No debe compararse directamente con valores de ddG medidos en laboratorio.
- Riesgo de sobreajuste al conjunto de entrenamiento: el checkpoint «all-66» se entrenó con las 66 proteínas de ProteinGym, por lo que las métricas sobre ese conjunto no son una evaluación honesta de generalización.
- Imposibilidad de reproducir el manuscrito: los resultados protein-held-out del artículo usan checkpoints distintos que no se distribuyen en este repositorio.
- Alcance limitado: solo sustituciones únicas, solo los 20 aminoácidos estándar. No acepta indels, mutaciones múltiples, modificaciones postraduccionales ni aminoácidos no canónicos.
- Dependencia externa: el primer uso requiere descarga de ESMC-600M y acceso a red; el repositorio tiene 0.0 GB, es decir, no incluye el encoder.
- Ausencia de benchmarks: no hay datos publicados en el repositorio para validar el rendimiento frente a alternativas.
- Alucinación: al ser un modelo de regresión y no generativo, no produce texto inventado; el riesgo equivalente es una predicción sobreconfiada fuera de la distribución de entrenamiento (familias proteicas poco representadas, secuencias muy largas o de composición atípica).
- Sesgos potenciales: la composición del dataset de entrenamiento (66 proteínas de ProteinGym) puede sesgar las predicciones hacia familias y organismos sobrerrepresentados. No se documentan análisis de sesgo.
- Caveat operativo: no hay información sobre latencia, throughput ni soporte de despliegue en servidores de inferencia, lo que dificulta planificar un uso a gran escala.
- Metadatos del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fechas de creación y actualización poco habituales en los metadatos de HuggingFace.

## Enlaces

- [Modelo en HuggingFace: aaronfeller/StabilityArc](https://huggingface.co/aaronfeller/StabilityArc)
- [Encoder upstream: biohub/esmc-600m-2024-12](https://huggingface.co/biohub/esmc-600m-2024-12)
- Referencia del manuscrito (sin enlace disponible): Feller, Aaron L., Andrew D. Ellington y Claus O. Wilke. 2026. *StabilityArc: Decoding Protein Sequence Embeddings into Generalizable Stability Landscapes*. Manuscript.
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web disponible.
