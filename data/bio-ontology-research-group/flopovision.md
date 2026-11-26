# bio-ontology-research-group/FLOPOVision

## Resumen

FLOPOVision es un modelo de visión por computador especializado en la extracción automática de rasgos morfológicos de plantas a partir de fotografías. Lo desarrolla el Bio-Ontology Research Group y se publica bajo licencia MIT. No es un modelo de lenguaje ni un clasificador de especies: es un conjunto de cabezas de clasificación lineal entrenadas sobre el extractor de imágenes congelado de BioCLIP 2, y su salida es un vector de 26 rasgos fenotípicos categóricos expresados con los términos de la Flora Phenotype Ontology (FLOPO).

El modelo resuelve un problema clásico en botánica computacional: describir el fenotipo de una planta sin necesidad de identificar previamente la especie. Predice rasgos como el hábito de crecimiento (arbusto, hierba, árbol, trepadora), la forma y el margen de la hoja, la presencia de pelos en hoja y tallo, el color y la forma de la flor, el tipo de inflorescencia o el tipo de fruto. La versión 0.1 cubre únicamente rasgos categóricos; las medidas continuas (longitud de hoja, altura de la planta) quedan para versiones posteriores.

La relevancia del modelo está en su método de supervisión: las cabezas se entrenaron sin ninguna fotografía anotada manualmente. Las etiquetas provienen de valores de rasgos que un modelo de lenguaje extrajo de floras publicadas y que se asociaron a nivel de especie, mientras que las imágenes son observaciones de iNaturalist de nivel de investigación de esas mismas especies. El repositorio ocupa 0,1 GB y la inferencia se realiza con la librería open_clip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas MLP (Linear 768→1024, GELU, Dropout 0.2, Linear 1024→valores) sobre el image tower congelado de BioCLIP 2 (open_clip) |
| Parametros totales | No disponible (el repositorio pesa 0,1 GB e incluye las cabezas; el image tower se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de una o varias imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la salida son etiquetas de rasgos en inglés derivadas de FLOPO) |
| Licencia | MIT |
| Formato de pesos | safetensors (`flopovision-heads.safetensors`) más `config.json` y scripts de inferencia y entrenamiento |

## Arquitectura y entrenamiento

Cada uno de los 26 rasgos tiene su propia cabeza de clasificación con la estructura `Linear(768, 1024) - GELU - Dropout(0.2) - Linear(1024, n_valores)`, aplicada sobre el embedding de imagen de BioCLIP 2 normalizado en L2. El image tower permanece congelado; solo se entrenan las cabezas. La unidad de entrenamiento es la especie: se agregan hasta 64 fotografías tomando la media de las probabilidades predichas y la pérdida es el logaritmo negativo de la probabilidad de los valores que las floras permiten para esa especie. Como una flora a menudo admite varios valores ("flores blancas o rosas") y una fotografía muestra solo parte de la planta, la etiqueta es un conjunto de valores para un conjunto de fotografías, no una etiqueta única.

El conjunto de entrenamiento comprende 33.281 especies con fotografías y valores de flora, con entre 1.073 especies (rasgo `substrate`) y 20.482 especies (rasgo `leaf_shape`) por rasgo. Las cabezas publicadas se entrenaron sobre todas esas especies. Los valores raros, con menos de 50 especies de entrenamiento, se excluyeron. Las imágenes proceden de observaciones de iNaturalist y las etiquetas de floras publicadas procesadas por un modelo de lenguaje.

## Capacidades

- Predicción de 26 rasgos morfológicos categóricos de plantas a partir de una o varias fotografías, sin conocer la especie.
- Rasgos cubiertos: `branching`, `corolla_shape`, `flower_colour`, `flower_position`, `fruit_colour`, `fruit_shape`, `fruit_type`, `habit`, `inflorescence`, `leaf_apex`, `leaf_arrangement`, `leaf_attachment`, `leaf_base`, `leaf_complexity`, `leaf_hair`, `leaf_margin`, `leaf_persistence`, `leaf_position`, `leaf_shape`, `leaf_texture`, `life_span`, `posture`, `spines`, `stem_hair`, `stem_shape` y `substrate`.
- Salida probabilística por rasgo (distribución sobre los valores posibles), agregable sobre varias fotografías de una misma planta mediante media de probabilidades.
- Modo `per_photo=True` para obtener un resultado independiente por fotografía.
- Interfaz de línea de comandos (`python flopovision.py foto.jpg`) y API de Python (`FLOPOVision().predict([...])`), con salida opcional en JSON.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen.
- Capacidad multilingüe: no aplica; las etiquetas de salida son términos de FLOPO en inglés.

## Casos de uso

- Digitalización de colecciones de herbario y fichas de flora: procesar lotes de fotografías de especímenes para prellenar campos morfológicos (hábito, tipo de fruto, margen de hoja) que después revisa un botánico, reduciendo el trabajo manual de transcripción.
- Fenotipado en estudios ecológicos a gran escala: aplicar el modelo a observaciones de iNaturalist o a censos fotográficos para obtener distribuciones de rasgos por población o por región y correlacionarlas con variables ambientales.
- Filtrado y enriquecimiento de bases de datos de biodiversidad: anotar automáticamente imágenes con rasgos como `leaf_persistence` (perenne/caduca) o `life_span` (anual/perenne) para hacer búsquedas por fenotipo en catálogos de imágenes.
- Apoyo a la identificación taxonómica: usar las predicciones de rasgos como evidencia adicional en una clave dicotómica o en un sistema de identificación asistida, especialmente en rasgos con alta precisión como `habit` (0,89) o `substrate` (0,94).
- Educación botánica y aplicaciones de campo: integrar el modelo en una app móvil que, a partir de una foto, muestre una descripción morfológica preliminar de la planta para uso didáctico o de aficionados.
- Investigación en visión por computador aplicada a biología: servir de línea base reproducible (código de entrenamiento incluido en `train_release.py`) para experimentos de aprendizaje débilmente supervisado con etiquetas derivadas de textos científicos.
- Monitorización de cultivos o vegetación: estimar rasgos como `leaf_hair`, `leaf_margin` o `posture` en fotografías de campo para caracterizar variedades o estados de desarrollo, con la cautela de que el modelo se entrenó con flora silvestre.

## Benchmarks y rendimiento

Precisión balanceada (media sobre los valores de cada rasgo) medida en cinco particiones con géneros completos reservados, de modo que cada especie evaluada pertenece a un género no visto en entrenamiento. Solo se evalúan especies para las que dos floras independientes coinciden en un único valor, con hasta 64 fotografías por especie. Media sobre los 26 rasgos: 0,70.

| Rasgo | Valores (más frecuentes primero) | Precisión balanceada | Especies evaluadas |
|---|---|---|---|
| `substrate` | epífita, terrestre | 0,94 | 162 |
| `habit` | arbusto, hierba, árbol, trepadora | 0,89 | 4.790 |
| `leaf_complexity` | compuesta, simple | 0,88 | 2.660 |
| `leaf_persistence` | perenne, caduca | 0,87 | 601 |
| `stem_hair` | con pelos, glabro | 0,84 | 2.432 |
| `leaf_hair` | con pelos, glabro | 0,83 | 3.785 |
| `leaf_position` | basal, caulinar | 0,81 | 516 |
| `life_span` | perenne, anual, bienal | 0,80 | 3.559 |
| `leaf_attachment` | sésil, peciolada | 0,79 | 945 |
| `flower_position` | terminal, axilar | 0,78 | 1.415 |
| `spines` | presentes, ausentes | 0,78 | 756 |
| `branching` | ramificada, no ramificada | 0,73 | 1.244 |
| `fruit_type` | cápsula, aquenio, baya, legumbre, drupa, nuez | 0,73 | 2.468 |
| `posture` | erecta, ascendente, postrada, trepadora | 0,71 | 3.033 |
| `leaf_margin` | dentada, entera, lobulada | 0,68 | 2.561 |
| `stem_shape` | cilíndrico, angular, cuadrangular | 0,67 | 445 |
| `flower_colour` | blanco, amarillo, púrpura, rosa, rojo, verde | 0,65 | 3.675 |
| `leaf_arrangement` | alterna, opuesta, verticilada | 0,64 | 879 |
| `leaf_texture` | coriácea, papirácea, membranosa, carnosa | 0,63 | 1.571 |
| `inflorescence` | racimo, panícula, cima, espiga, umbela, corimbo | 0,59 | 2.676 |
| `leaf_shape` | elíptica, lanceolada, ovada, oblonga, linear, obovada | 0,53 | 1.791 |
| `leaf_apex` | agudo, acuminado, obtuso, mucronado, emarginado | 0,52 | 2.120 |
| `leaf_base` | cuneada, redondeada, cordada, truncada, decurrente, abrazadora | 0,52 | 1.905 |
| `corolla_shape` | tubular, infundibuliforme, campanulada, rotácea, hipocrateriforme, urceolada | 0,49 | 583 |
| `fruit_shape` | alargado, ovoide, globoso, aplanado | 0,48 | 3.011 |
| `fruit_colour` | marrón, rojo, verde, amarillo, negro, naranja | 0,32 | 1.344 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio de las cabezas ocupa 0,1 GB; el coste dominante es el image tower de BioCLIP 2, que se descarga en el primer uso y debe residir en memoria durante la inferencia.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para ejecutar el image tower de BioCLIP 2; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- GPU de consumo: previsiblemente viable en GPUs de consumo por el reducido tamaño de las cabezas, aunque el requisito real depende del image tower; no confirmado en la información disponible.
- Despliegue: la vía documentada es la librería `open_clip_torch` con `torch`, `safetensors`, `huggingface_hub` y `pillow`, mediante el script `flopovision.py` o la clase `FLOPOVision`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLOPOVision | Cabezas de clasificación sobre BioCLIP 2 congelado | No disponible (repo de 0,1 GB) | No aplica | MIT | Hugging Face |
| BioCLIP 2 (`imageomics/bioclip-2`) | Modelo fundacional visión-lenguaje para biología, base de FLOPOVision | No disponible | No aplica | No disponible en la información | Hugging Face |
| CLIP estándar (OpenAI) | Visión-lenguaje genérico | No disponible | No aplica | No disponible en la información | Público |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a la relación arquitectónica (FLOPOVision reutiliza el tower de BioCLIP 2) y al tipo de tarea.

## Limitaciones y advertencias

- Las etiquetas son afirmaciones a nivel de especie extraídas de floras; las cabezas aprenden qué aspecto tienen las plantas con un valor declarado, no el rasgo de un individuo concreto. La predicción a nivel individual solo está validada para `flower_colour` (98,6 % de concordancia con la identificación en 5.999 observaciones de un género reservado) y no se ha probado para la mayoría de los demás rasgos.
- Las predicciones varían ligeramente según el entorno de la fotografía; diferencias de pocos puntos porcentuales entre grupos de fotos de una misma especie no deben interpretarse como diferencias entre plantas.
- Sesgo geográfico: las fotografías de iNaturalist se concentran en Norteamérica y Europa, y las floras cubren el mundo de forma desigual.
- Los valores raros (menos de 50 especies de entrenamiento) se excluyeron del modelo; rasgos de baja precisión como `fruit_colour` (0,32), `leaf_apex` (0,52) o `corolla_shape` (0,49) se incluyen solo por completitud y no son fiables para decisiones automatizadas.
- La precisión con una sola fotografía es inferior a la obtenida agregando hasta 64 fotografías por especie, y depende de que el órgano correspondiente esté visible: la cabeza devuelve una distribución incluso para una foto sin fruto en el rasgo `fruit_type`.
- Solo cubre rasgos categóricos; no estima medidas continuas (longitud de hoja, altura) en la versión 0.1.
- Riesgo de alucinación: al ser un clasificador, el riesgo se traduce en predicciones seguras pero incorrectas cuando el órgano no es visible o la imagen es atípica; no hay mecanismo de abstención documentado.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base BioCLIP 2 tiene su propia licencia, que debe verificarse por separado antes de un despliegue en producción.
- El modelo está en versión 0.1 y no se han publicado resultados de benchmarks frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bio-ontology-research-group/FLOPOVision
- Modelo base BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- Flora Phenotype Ontology (FLOPO): https://github.com/flora-phenotype-ontology/flopoontology
