# sandpies/Minimax-H3-fl2va-ref2va-hybrid-unpruned-int8

## Resumen

`sandpies/Minimax-H3-fl2va-ref2va-hybrid-unpruned-int8` es un merge de pesos de la comunidad, no un modelo entrenado. Partiendo de los checkpoints INT8 de MiniMax H3 publicados por Comfy-Org (`Comfy-Org/MiniMax-H3`), el autor combina el cuerpo completo del checkpoint FL2VA (first-last frame to video+audio) con la proyección AdaLN de los bloques tardíos del checkpoint Ref2VA (reference to video+audio). El resultado es un híbrido que busca la fidelidad de FL2VA con el enrutado de referencia de Ref2VA.

El problema que resuelve es práctico: en ComfyUI, los dos checkpoints originales cubren casos de uso distintos y no siempre se quiere cargar uno u otro según la tarea. Este merge ofrece dos variantes con distinto grado de mezcla (`b25-49`, 25 bloques, y `b30-49`, 20 bloques), de modo que el usuario puede elegir entre mayor adherencia a la referencia o mayor pureza FL2VA. Está construido sobre la familia **no podada** (`time_embedder`), con ficheros de aproximadamente 32 GB cada uno, frente a los ~21 GB de la familia podada (`adaln_t_table`).

Es relevante para quien ya trabaja con MiniMax H3 en ComfyUI y quiere probar hibridaciones sin reentrenar nada: el merge es puramente una selección de tensores, se puede reproducir en tiempo de ejecución con un nodo cargador alternativo, y hereda íntegramente la licencia y los términos de uso de MiniMax H3. El repositorio ocupa 68,1 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión MiniMax H3 con bloques modulados por AdaLN y `time_embedder`; topología detallada no disponible en la información proporcionada |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | INT8 (`int8_convrot`), con tensores auxiliares `.comfy_quant` y `_scale` |
| Idiomas soportados | no disponible |
| Licencia | minimax (`license: other`, `license_name: minimax`), heredada de MiniMax H3 |
| Formato de pesos | safetensors (INT8, con metadatos de cuantización de ComfyUI) |

Datos adicionales: tamaño del repositorio 68,1 GB (contiene varias variantes); tamaño aproximado de cada fichero del híbrido no podado, ~32 GB; modelo base `Comfy-Org/MiniMax-H3`; biblioteca declarada `minimax-h3`; fecha de creación y de última actualización: 16 de septiembre de 2026.

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino. El procedimiento descrito es una selección de pesos tensor a tensor: se toma como base `minimax_h3_fl2va_int8_convrot.safetensors` (no podado) y se sustituyen únicamente las proyecciones `blocks.{N}.adaln_proj.linear.weight` y `.bias` (junto con sus hermanos `.comfy_quant` y `_scale`) por las del checkpoint `minimax_h3_ref2va_int8_convrot.safetensors` (no podado) para un rango de bloques tardíos. Todo lo demás permanece FL2VA, incluida la AdaLN de la capa final y las cabezas de salida. Es el mismo criterio que la propuesta híbrida podada de `smhfacct`, pero aplicado sobre el cuerpo no podado.

Las dos variantes publicadas difieren en el rango de bloques sobrescritos: `minimax_h3_hybrid_fl2va_ref2va_b25-49_unpruned_int8.safetensors` sustituye 25 bloques (25-49) y `minimax_h3_hybrid_fl2va_ref2va_b30-49_unpruned_int8.safetensors` sustituye 20 bloques (30-49). El autor advierte de que estos rangos son subjetivos y experimentales, y recomienda empezar por `b30-49` si prima la calidad bruta y por `b25-49` si la adherencia a la referencia resulta débil. A partir del tamaño del fichero (~32 GB con pesos de 1 byte) puede estimarse un orden de magnitud de decenas de miles de millones de parámetros, pero es una deducción del tamaño y no un dato confirmado por el autor ni por MiniMax.

Un detalle crítico de interoperabilidad: la familia no podada usa `time_embedder` y la podada usa `adaln_t_table`, y el autor indica explícitamente que no deben mezclarse ficheros de ambas familias en una misma carga.

## Capacidades

- Generación conjunta de vídeo y audio: el modelo pertenece a la familia MiniMax H3, orientada a salida audiovisual, y esta variante mantiene tanto el cuerpo FL2VA como las cabezas de salida originales.
- Generación condicionada por referencia (Ref2VA): la inclusión del AdaLN de bloques tardíos de Ref2VA permite empaquetado de referencias, tal como se describe para los nodos `MiniMaxH3ReferenceToVideo` y HandTie.
- Generación a partir de primer y último fotograma más audio (FL2VA): es el comportamiento base del cuerpo de pesos, ya que todo excepto el AdaLN tardío y las capas finales permanece FL2VA.
- Integración directa en ComfyUI: se carga con los nodos estándar `Load Diffusion Model` / `UNETLoader` desde `ComfyUI/models/diffusion_models/`.
- Fusión en tiempo de ejecución: la misma receta puede reproducirse sin ficheros precalculados con el nodo `ComfyUI_MinimaxH3HybridLoader` (`block_range_adaln`).
- Cuantización INT8: los pesos están en `int8_convrot`, lo que reduce el espacio en disco y en memoria frente a precisión completa, a costa de una pérdida de calidad no cuantificada en la información disponible.
- No se documentan capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso ni soporte multilingüe; no es un modelo de ese tipo.

## Casos de uso

- Producción de vídeo corto con personaje recurrente: se aporta una referencia visual y el modelo genera planos audiovisuales manteniendo esa referencia gracias al AdaLN de Ref2VA en los bloques tardíos, útil para series o campañas con identidad visual consistente.
- Prototipado rápido en ComfyUI: al cargarse con los nodos estándar de difusión, un artista puede alternar entre FL2VA y este híbrido sin cambiar de flujo de trabajo, comparando resultados con la variante `b25-49` y la `b30-49`.
- Interpolación entre primer y último fotograma para animática: el cuerpo FL2VA permite fijar el estado inicial y final de un plano y rellenar la secuencia con audio sincronizado, un flujo habitual en previsualización de animación.
- Generación de vídeo musical o contenido sonoro: la salida conjunta de audio y vídeo evita tener que alinear una pista externa, lo que simplifica la iteración sobre el ritmo y el montaje.
- Investigación sobre merges de pesos: el repositorio documenta la receta (base, overlay y rango de bloques), lo que lo convierte en un punto de partida reproducible para estudiar el efecto de sustituir AdaLN por bloques en modelos de difusión audiovisual.
- Pruebas de ablación de rangos de bloques: el nodo `ComfyUI_MinimaxH3HybridLoader` permite variar `block_range_adaln` en tiempo de ejecución y medir el compromiso entre fidelidad FL2VA y adherencia a la referencia sin volver a descargar 32 GB por configuración.
- Despliegue por lotes en GPU de centro de datos: con un fichero INT8 de ~32 GB residente en una A100 80 GB o H100, se pueden encadenar generaciones por script manteniendo el mismo grafo de ComfyUI.
- Personalización publicitaria con referencia de producto: se introduce una imagen de referencia del producto y se generan variaciones audiovisuales, revisando después la adherencia al objeto y los artefactos introducidos por el merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada fichero del híbrido no podado ronda los 32 GB en INT8, por lo que la ejecución con todos los pesos residentes exige del orden de 32 GB de VRAM o más, sin contar activaciones ni cachés de atención. Por debajo de esa cifra hay que recurrir a offload a RAM o a carga secuencial, con la penalización de latencia correspondiente.
- GPU de centro de datos: A100 40 GB (ajustada, con offload parcial), A100 80 GB, H100 80 GB y tarjetas profesionales de 48 GB como la RTX 6000 Ada son los perfiles donde el modelo cabe con holgura.
- GPU de consumo: una RTX 4090 o 5090 de 24-32 GB no permite mantener el fichero completo en VRAM; es viable con offload, asumiendo tiempos de generación notablemente mayores. No hay datos de latencia publicados.
- Almacenamiento: el repositorio completo ocupa 68,1 GB, así que conviene disponer de ese espacio solo para descargarlo, más el espacio de la caché de ComfyUI.
- Opciones de despliegue: ComfyUI es la vía documentada (`Load Diffusion Model` / `UNETLoader` apuntando a `ComfyUI/models/diffusion_models/`), opcionalmente con `scottmudge/ComfyUI_MinimaxH3HybridLoader` para el merge en tiempo de ejecución. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Origen | Familia de pesos | Tamaño aproximado | Mezcla | Notas |
|---|---|---|---|---|---|
| Este repositorio, `b25-49` | sandpies | No podada (`time_embedder`) | ~32 GB | FL2VA + AdaLN Ref2VA en bloques 25-49 | Más recorrido de referencia, algo menos de pureza FL2VA |
| Este repositorio, `b30-49` | sandpies | No podada (`time_embedder`) | ~32 GB | FL2VA + AdaLN Ref2VA en bloques 30-49 | Más cercano a la calidad FL2VA, AdaLN de referencia algo más débil |
| `smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models` | smhfacct | Podada (`adaln_t_table`) | ~21 GB | Misma receta, cuerpo distinto | No mezclar con ficheros no podados |
| `Comfy-Org/MiniMax-H3` (FL2VA INT8) | Comfy-Org | No podada | ~32 GB por checkpoint | Sin mezcla | Checkpoint base del que procede el cuerpo |
| `Comfy-Org/MiniMax-H3` (Ref2VA INT8) | Comfy-Org | No podada | ~32 GB por checkpoint | Sin mezcla | Origen del AdaLN sobrescrito |

No se dispone de comparativas de rendimiento objetivo (métricas de calidad de vídeo o de audio) entre estas variantes; la elección entre ellas es, según el propio autor, subjetiva.

## Limitaciones y advertencias

- Los rangos de bloques son experimentales y subjetivos: el autor no aporta métricas que respalden `b25-49` frente a `b30-49`, solo una recomendación cualitativa.
- No mezclar ficheros podados (`adaln_t_table`) y no podados (`time_embedder`) en una misma carga; hacerlo produce incompatibilidades de tensores.
- Licencia heredada: el merge no concede derechos adicionales. Cualquier uso comercial debe cumplir los términos de MiniMax H3, disponibles en `MiniMaxAI/MiniMax-H3`. La etiqueta `license: other` con `license_name: minimax` obliga a revisar el texto original antes de desplegar.
- Ausencia de validación comunitaria: 0 descargas y 0 me gusta en el momento de la consulta, y ninguna evaluación publicada por el autor. No hay garantía de que el híbrido funcione mejor que los checkpoints originales.
- Riesgo de artefactos por mezcla: combinar el AdaLN de un checkpoint Ref2VA sobre un cuerpo FL2VA puede introducir degradaciones visuales o de audio no caracterizadas, especialmente en los planos que dependen fuertemente de los bloques tardíos.
- Alucinación en el sentido generativo: como todo modelo de difusión, puede producir contenido visual o sonoro plausible pero incorrecto respecto a la referencia proporcionada, con deriva de identidad en secuencias largas.
- Sesgos del modelo base: no se documentan análisis de sesgo para MiniMax H3 en la información disponible; los sesgos del corpus de entrenamiento original se heredan íntegramente.
- Riesgo de suplantación: la capacidad de condicionar por referencia facilita la generación de contenido con la apariencia de personas reales; es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable.
- Coste de infraestructura: ~32 GB por fichero y 68,1 GB de repositorio implican requisitos de disco y de VRAM que excluyen a la mayoría de equipos de consumo sin offload.
- Idiomas y contexto: no hay información publicada sobre idiomas soportados ni sobre límites de contexto, porque no es un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandpies/Minimax-H3-fl2va-ref2va-hybrid-unpruned-int8
- Modelo base en HuggingFace: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia y modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Híbrido podado de referencia: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Nodo de fusión en tiempo de ejecución: https://github.com/scottmudge/ComfyUI_MinimaxH3HybridLoader

Nota: las búsquedas web realizadas devolvieron únicamente páginas del asistente Gemini de Google, sin relación con este modelo, por lo que no se incluyen. No se han encontrado papers, blogs ni demos adicionales asociados a este repositorio en la información disponible.
