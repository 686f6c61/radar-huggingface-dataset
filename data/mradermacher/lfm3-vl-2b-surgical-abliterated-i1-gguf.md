# mradermacher/LFM3-VL-2B-Surgical-Abliterated-i1-GGUF

## Resumen

LFM3-VL-2B-Surgical-Abliterated-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo medismera/LFM3-VL-2B-Surgical-Abliterated. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos. El modelo subyacente es una variante "abliterated" (con el alineamiento de seguridad atenuado mediante la tecnica de abliteration) de un modelo multimodal de 2B parametros de la familia LFM3-VL, orientado a tareas de vision-lenguaje y generacion de texto causal.

La relevancia de esta ficha radica en que combina tres elementos poco frecuentes en un mismo artefacto: un modelo de vision-lenguaje de tamano pequeno (2B), una intervencion de "surgical alignment" que elimina los rechazos de seguridad, y una distribucion en GGUF con cuantizaciones de 1 a 6 bits pensadas para inferencia en CPU y GPU de consumo. Esto lo hace atractivo para experimentacion local, investigacion sobre alineamiento y despliegues en entornos con recursos limitados.

No obstante, la informacion publica disponible es muy escasa: la model card del repositorio es una plantilla generica de mradermacher, sin datos sobre arquitectura detallada, datos de entrenamiento, benchmarks ni composicion del dataset. El dato de parametros totales registrado en safetensors (899.013) no es coherente con la denominacion "2B" del modelo base y debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capacidad de vision (VL), segun la familia LFM3-VL; detalles no disponibles |
| Parametros totales | 2B (denominacion del modelo base); el campo safetensors del repo indica 899.013, dato no coherente y no verificado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | en (segun tags del repo) |
| Licencia | other (no se especifican terminos concretos) |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de la familia LFM3-VL con modulo de vision, segun indican los tags `causal-lm` y la naturaleza VL del repositorio. La variante "Surgical-Abliterated" implica una intervencion de alineamiento quirurgico destinada a eliminar comportamientos de rechazo (refusal) mediante la modificacion de direcciones en el espacio de activaciones, una tecnica conocida como abliteration. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original.

La cuantizacion de mradermacher emplea ficheros imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precision, especialmente las familias IQ. El repositorio incluye un fichero `imatrix.gguf` de 0,1 GB para que el usuario pueda generar sus propias cuantizaciones. Al tratarse de un modelo de vision, los ficheros `mmproj` (proyector multimodal) se alojan en el repositorio estatico hermano, no en este repositorio i1.

## Capacidades

- Generacion de texto causal en ingles.
- Procesamiento de imagenes y texto (vision-lenguaje), a condicion de usar los ficheros `mmproj` del repositorio estatico.
- Comportamiento "uncensored": el alineamiento de seguridad ha sido atenuado, por lo que el modelo tiende a no rechazar peticiones que otros modelos alineados bloquearian.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration sobre las respuestas y comparar su comportamiento con la version alineada original, en un entorno controlado y con fine-tuning supervisado.
- Experimentacion local con vision-lenguaje: gracias a las cuantizaciones de 1 a 6 bits, se puede ejecutar en equipos de consumo para prototipar tareas de descripcion de imagenes, VQA o extraccion de informacion visual sin depender de APIs externas.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido que los modelos alineados suelen rechazar, siempre que el uso cumpla la legalidad aplicable.
- Evaluacion de cuantizaciones: el fichero imatrix y la amplia gama de quants permiten comparar la degradacion de calidad entre niveles de compresion en un modelo pequeno, como referencia metodologica.
- Despliegue en entornos con recursos muy limitados: las variantes IQ1/IQ2 y Q2 permiten ejecutar el modelo en CPU o en GPUs con poca VRAM para tareas de bajo coste y baja latencia.
- Red teaming y pruebas de robustez: util para generar respuestas adversarias y evaluar filtros de seguridad en pipelines de moderacion.
- Prototipado de asistentes multimodales offline: integrable en aplicaciones de escritorio o moviles con llama.cpp que requieran privacidad total de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 2B en GGUF, las cuantizaciones Q4_K_M suelen ocupar en torno a 1,2-1,5 GB, y las Q2 en torno a 0,8-1 GB; estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: no disponible. Por tamano, cabria esperar ejecucion en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, dada la denominacion 2B y el formato GGUF, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) son los entornos naturales para GGUF; tambien es posible usar el modelo base en transformers con safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-Surgical-Abliterated-i1-GGUF (este) | 2B (segun denominacion) | no disponible | Si | other | GGUF | Variante abliterated cuantizada con imatrix |
| LFM3-VL-2B-Surgical-Abliterated (base) | 2B | no disponible | Si | other | safetensors | Modelo original sin cuantizar |
| LFM3-VL-2B (familia original) | 2B | no disponible | Si | no disponible | no disponible | Version alineada de referencia |
| Alternativas abliterated de 2B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico. No debe desplegarse en produccion sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion, agravado por el tamano reducido (2B) y por la falta de datos sobre el entrenamiento.
- Idiomas: solo ingles segun los tags; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere revisar la licencia del modelo base (medismera/LFM3-VL-2B-Surgical-Abliterated) y de la familia LFM3 original.
- El dato de parametros totales del campo safetensors (899.013) es incoherente con la denominacion 2B; conviene verificar el modelo base antes de asumir capacidades o requisitos de hardware.
- Los ficheros `mmproj` necesarios para la funcionalidad de vision no estan en este repositorio, sino en el repositorio estatico; un uso solo de este repo puede carecer de capacidad visual.
- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones; la trazabilidad es practicamente nula.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-VL-2B-Surgical-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/medismera/LFM3-VL-2B-Surgical-Abliterated
- Repositorio estatico de cuantizaciones (incluye mmproj): https://huggingface.co/mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-VL-2B-Surgical-Abliterated-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
