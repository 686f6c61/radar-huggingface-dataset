# aquaduck/Muse-Glimmer-30B-GGUF

## Resumen

Muse-Glimmer-30B-GGUF es un repositorio de pesos en formato GGUF publicado por el usuario Aquaduck a partir del modelo base `meta-models/muse-glimmer-30b`. No es un modelo nuevo ni un reentrenamiento: Aquaduck actúa como anfitrión de la cuantización Q4_K_XL generada por Unsloth (`unsloth/Muse-Glimmer-30B-GGUF`) y, además, reempaqueta ese GGUF en dos fragmentos de capas ("midpoint layer shards") pensados para carga por etapas o reparto entre nodos mediante el formato propietario Aquaduck Arc (`layer-package-v1`).

La relevancia del repositorio es práctica: permite ejecutar un modelo denso de gran tamano (la model card declara 29,8B de parámetros y 131.072 tokens de contexto nativo) en hardware de consumo gracias a la cuantización Q4_K_XL, con un archivo completo de ~15,88 GB. Los dos shards (capas 0-25 y 26-51) habilitan despliegues escalonados que no cabrían en un único dispositivo con presupuesto de memoria ajustado, aunque no son modelos completos utilizables con llama.cpp estándar.

Conviene senalar dos cautelas desde el principio: el repositorio no aporta evaluaciones propias y los metadatos de HuggingFace indican 13.927.393.792 parámetros (~13,9B), una cifra que no concuerda con los 29,8B declarados en la model card ni con la arquitectura descrita (52 capas, hidden dim 6656). Esa discrepancia no está resuelta en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Muse-Glimmer-30B-UD) con GQA (32 cabezas Q / 2 cabezas KV), 52 capas, hidden dim 6656 |
| Parámetros totales | 29,8B según la model card del autor; 13.927.393.792 (~13,9B) según los metadatos de HuggingFace del repositorio (discrepancia no resuelta) |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | 131.072 tokens (nativo, según model card) |
| Tipos de cuantización | Q4_K_XL (única incluida); el tag `imatrix` sugiere cuantización con matriz de importancia |
| Idiomas soportados | multilingüe (sin listado detallado, "igual que el modelo base") |
| Licencia | other (heredada de `meta-models/muse-glimmer-30b`; no se detallan términos) |
| Formato de pesos | GGUF (archivo completo + 2 shards de capas) |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este repositorio. Según la propia model card, el flujo es: pesos originales de `meta-models/muse-glimmer-30b` → cuantización Q4_K_XL en formato GGUF publicada por Unsloth → copia completa en este repositorio más el reempaquetado opcional en shards. Aquaduck no reentrena, no hace fine-tuning y, según declara, tampoco recuantiza.

La arquitectura del modelo base es un transformer causal denso con Grouped-Query Attention, 32 cabezas de consulta y solo 2 cabezas de clave/valor, 52 capas y dimensión oculta de 6656. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. La innovación técnica del repositorio no está en el modelo sino en el empaquetado: los archivos `*-layers-{start}-{endExclusive}.gguf` son cortes contiguos a mitad de red (frontera válida en la capa 26, con índice final exclusivo), con `maxStages: 2` y formato `layer-package-v1`. Los shards son reempaquetado puro, sin cambio alguno en los pesos.

## Capacidades

- Generación de texto conversacional: pipeline declarado `text-generation` y tag `conversational`.
- Modo thinking e instruct: la model card indica que deben usarse los modos documentados en el modelo base y su plantilla de chat; con otros formatos el modelo "no funcionará correctamente".
- Capacidad multilingüe: declarada de forma genérica como "igual que el modelo base", sin listado de idiomas.
- Contexto largo: hasta 131.072 tokens nativos, lo que permite tareas de comprensión sobre documentos extensos en una sola pasada.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (visión, audio): no disponibles (no documentadas); el repositorio solo cubre texto.
- Carga por etapas: capacidad operativa del empaquetado, no del modelo; los shards se cargan mediante Aquaduck Arc, no con llama.cpp estándar.

## Casos de uso

- Asistente conversacional local en escritorio: el archivo GGUF completo se carga con llama.cpp o desde la aplicación de escritorio de Aquaduck, lo que permite mantener conversaciones multiturno con contexto de hasta 131.072 tokens sin enviar datos a servicios externos.
- Análisis de documentos largos: informes anuales, contratos, manuales técnicos o expedientes de decenas de miles de tokens pueden introducirse completos en una sola ventana, evitando el troceado y la pérdida de contexto entre fragmentos.
- Despliegue on-premise con requisitos de privacidad: al ser un GGUF ejecutable localmente, encaja en entornos sanitarios, legales o industriales donde no se permite sacar datos de la red corporativa.
- Sustitución de APIs de pago en procesamiento por lotes: tareas de resumen, reescritura, clasificación o extracción sobre grandes volúmenes de texto pueden ejecutarse en una estación de trabajo con una sola GPU de 24 GB.
- Carga distribuida por etapas: los dos shards (capas 0-25 y 26-51) permiten repartir el modelo entre dos etapas o nodos dentro del stack Aquaduck Arc, útil cuando el presupuesto de memoria por dispositivo es inferior a los ~16 GB del modelo completo.
- Prototipado e investigación: sirve como punto de partida de bajo coste para medir latencia, consumo de VRAM y calidad de la cuantización Q4_K_XL antes de decidir si se necesita una precisión mayor.
- Generación de texto multilingüe: al declararse multilingüe, puede emplearse en pipelines de traducción, atención al cliente o generación de contenido en varios idiomas, siempre que se valide la calidad real por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que no hay evaluaciones separadas para el GGUF alojado ni para los shards, y remite a la ficha de `meta-models/muse-glimmer-30b`, que no forma parte de la información proporcionada. Tampoco se incluyen datos de latencia ni de throughput. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- Peso en disco de los pesos: ~15,88 GB el GGUF completo (Q4_K_XL); ~7,85 GB el shard de capas 0-25 y ~8,80 GB el de capas 26-51. El repositorio ocupa 32,5 GB en total.
- VRAM para los pesos: aproximadamente 16 GB en el modelo completo, más el overhead del runtime.
- Caché KV (estimación propia a partir de la arquitectura documentada): 2 × 2 cabezas KV × 208 de dimensión de cabeza = 832 valores por capa y token; × 52 capas = 43.264 valores por token; en FP16 son ~84,5 KiB por token. Equivale a ~0,66 GB a 8.192 tokens, ~2,6 GB a 32.768 tokens y ~10,8 GB a 131.072 tokens.
- Presupuesto total estimado: ~17 GB a contexto corto y ~27 GB con la ventana completa en FP16 de caché KV, sin contar el overhead del motor de inferencia.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para contexto moderado; A100 40 GB, H100 80 GB o reparto entre dos GPUs de 24 GB si se quiere explotar la ventana completa de 131.072 tokens.
- GPU de consumo: sí cabe en 24 GB con contexto ajustado; también es viable en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) reduciendo el contexto, y en CPU con 32 GB de RAM o más mediante llama.cpp.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, servidores compatibles con endpoints) con el archivo completo; la aplicación de escritorio de Aquaduck como vía prevista por el autor. Los shards de capas solo funcionan con Aquaduck Arc.
- vLLM y TGI: no se documenta compatibilidad en la información disponible; el soporte de GGUF en estos motores es limitado y debería verificarse antes de plantear un despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se establece por categoría (modelo denso de ~25-35B en GGUF para ejecución local). Los datos de los modelos alternativos provienen de sus fichas públicas y no de la información proporcionada en esta búsqueda, por lo que conviene verificarlos antes de publicar.

| Modelo | Parámetros | Contexto | Licencia | GGUF | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-GGUF (este repo) | 29,8B declarados / 13,9B en metadatos HF | 131.072 tokens | other (términos no detallados) | Sí, Q4_K_XL + 2 shards | Sin evaluaciones publicadas; empaquetado propietario para carga por etapas |
| Qwen2.5-32B-Instruct (referencia externa) | 32,5B | 32.768 nativo / 131.072 con YaRN | Apache-2.0 | Sí | Licencia permisiva y ecosistema amplio de cuantizaciones |
| Gemma 2 27B (referencia externa) | 27B | 8.192 tokens | licencia propia de Google | Sí | Contexto mucho menor; buenas evaluaciones publicadas |
| Mistral Small 3.1 24B (referencia externa) | 24B | 128.000 tokens | Apache-2.0 | Sí | Alternativa de tamano similar con licencia permisiva |

## Limitaciones y advertencias

- Licencia "other" sin términos detallados en la información disponible: es obligatorio revisar la licencia del modelo base (`meta-models/muse-glimmer-30b`) antes de cualquier uso comercial.
- Discrepancia no resuelta entre los 29,8B de la model card y los 13,9B de los metadatos de HuggingFace; afecta a la planificación de memoria y a la comparación con alternativas.
- La cuantización Q4_K_XL degrada la calidad respecto a releases de mayor precisión, tal como reconoce el propio autor.
- Los shards de capas no son modelos completos: no funcionan con llama.cpp estándar y solo sirven para el cargador Aquaduck Arc.
- Es imprescindible usar la plantilla de chat del modelo base, incluidos sus modos thinking e instruct; otro formato produce respuestas incorrectas.
- No hay evaluaciones propias del GGUF ni de los shards, lo que impide cuantificar la pérdida de calidad frente al modelo original.
- Sesgos y riesgos: heredados del modelo base y no documentados en este repositorio.
- Riesgo de alucinación: inherente a un modelo generativo de este tipo, sin mitigaciones documentadas.
- Idiomas: la etiqueta "multilingüe" es genérica; no hay listado de idiomas ni datos de rendimiento por lengua.
- Repositorio recién creado, con 0 descargas y 0 likes, sin validación independiente de la comunidad.
- La búsqueda web no arrojó resultados relevantes, por lo que no ha sido posible verificar de forma externa la identidad del proveedor ni las capacidades declaradas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aquaduck/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/muse-glimmer-30b
- Fuente de la cuantización GGUF: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Perfil del anfitrión: https://huggingface.co/aquaduck
- llama.cpp (soporte GGUF): https://github.com/ggml-org/llama.cpp
- Búsqueda web: sin resultados relevantes sobre este modelo.
