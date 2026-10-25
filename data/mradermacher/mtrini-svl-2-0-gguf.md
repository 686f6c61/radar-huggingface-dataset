# mradermacher/Mtrini-SVL-2.0-GGUF

## Resumen

Mtrini-SVL-2.0-GGUF es la versión cuantizada en formato GGUF del modelo CompiwerAI/Mtrini-SVL-2.0, publicada por mradermacher, un conocido empaquetador de cuantizaciones para llama.cpp. El repositorio no aporta información sobre el entrenamiento ni las capacidades del modelo original: se limita a ofrecer los ficheros convertidos y una tabla de variantes disponibles. El modelo base cuenta con 8.953.803.264 parámetros (8,95 mil millones) según los pesos en safetensors del modelo original, lo que lo sitúa en la franja de los modelos de ~8-9B ejecutables en hardware de consumo.

La relevancia de esta ficha es práctica: permite descargar el modelo en 12 cuantizaciones distintas (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB), además de dos ficheros `mmproj` (Q8_0 y f16) que indican la presencia de un proyector multimodal en el modelo original, es decir, capacidad de procesar imágenes además de texto. El repositorio ocupa 83,0 GB en total y está etiquetado para la librería transformers, con idioma declarado únicamente inglés (`en`) y uso conversacional.

La información disponible es muy escasa: no se documentan arquitectura, longitud de contexto, licencia, composición del dataset ni resultados de benchmarks. Cualquier evaluación de idoneidad para producción debe hacerse asumiendo esa opacidad y verificando experimentalmente el comportamiento del modelo. El repositorio se creó el 24 de octubre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes, por lo que no existe validación comunitaria alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo distribuye GGUF; el modelo base no documenta la arquitectura en la informacion disponible) |
| Parametros totales | 8.953.803.264 (8,95B), dato de los safetensors del modelo base |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base CompiwerAI/Mtrini-SVL-2.0) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. Los ficheros publicados son cuantizaciones GGUF generadas con el pipeline habitual de mradermacher (metadatos internos `quantize_version: 2`, `convert_type: hf`), lo que implica una conversion desde pesos HuggingFace a GGUF y posterior cuantizacion de tensores. La presencia de ficheros `mmproj` (proyector multimodal) indica que el modelo original incorpora un codificador visual y un proyector hacia el espacio del modelo de lenguaje, pero no se especifica que codificador (CLIP, SigLIP u otro) ni como se entreno esa parte.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, tecnicas de atencion o innovaciones como decodificacion especulativa. El autor de las cuantizaciones indica que no ha generado cuantizaciones ponderadas con imatrix ("weighted/imatrix quants seem not to be available (by me) at this time"), por lo que todas las variantes son cuantizaciones estaticas, sin calibracion con un corpus especifico.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: los ficheros `mmproj` permiten, en teoria, entrada de imagenes junto a texto (VQA, descripcion de imagenes, extraccion de informacion de documentos escaneados), siempre que el runtime usado soporte el proyector.
- Ejecucion en CPU y GPU via llama.cpp y derivados, al estar distribuido en GGUF.
- No hay evidencia documentada de soporte de tool calling, function calling, modo de razonamiento explicito (thinking), agentes multi-paso, audio ni otras capacidades especiales.
- Capacidades multilingues: limitadas al ingles segun el metadato de idioma; no se documenta cobertura de otros idiomas.

## Casos de uso

- Inferencia local en estacion de trabajo: con la variante Q4_K_M (5,7 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite ejecutar un asistente conversacional en ingles sin dependencia de la nube ni coste por token.
- Prototipado de asistentes conversacionales: al estar disponible en GGUF, se puede integrar en llama.cpp o Ollama en minutos para validar flujos de dialogo multi-turno antes de comprometerse con un modelo mayor.
- Procesamiento de documentos con componente visual: usando los ficheros `mmproj` junto al GGUF principal, es posible montar un pipeline de descripcion de imagenes o extraccion de texto de capturas, aunque la calidad debe validarse empiricamente al no haber benchmarks.
- Despliegue en entornos aislados (air-gapped): al ser un artefacto autocontenido de 3,9-18 GB, encaja en instalaciones sin acceso a internet, con la salvedad de la licencia no declarada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir perplejidad y calidad subjetiva por nivel de cuantizacion y elegir el punto de equilibrio para un hardware concreto.
- Educacion e investigacion: util como caso de estudio de conversion HF a GGUF y de despliegue de modelos multimodales de ~9B en hardware modesto.
- Pruebas de interfaz de usuario: integracion en LM Studio o en una interfaz web propia para validar experiencia de usuario con latencias reales antes de migrar a un modelo con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se referencian evaluaciones del modelo base CompiwerAI/Mtrini-SVL-2.0.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, orientativa a partir del tamano de fichero):
  - Q2_K (3,9 GB): ~5 GB de VRAM o ~4 GB de RAM en CPU.
  - Q3_K_M / IQ4_XS (4,7-5,3 GB): ~6-7 GB.
  - Q4_K_M (5,7 GB): ~7-8 GB de VRAM; es la variante marcada como "fast, recommended".
  - Q5_K_M (6,6 GB): ~8-9 GB.
  - Q6_K (7,5 GB): ~9-10 GB.
  - Q8_0 (9,6 GB): ~11-12 GB.
  - f16 (18,0 GB): ~20 GB o mas.
  - Sumar 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16) si se usa la entrada de imagenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 para Q4-Q5; RTX 4090 24 GB o A100/H100 para f16 y para servir varias peticiones concurrentes. El modelo cabe en GPU de consumo en todas las cuantizaciones hasta Q8_0.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python, text-generation-webui y servidores basados en llama.cpp. vLLM y TGI no estan pensados para GGUF de forma nativa; para esas pilas habria que partir del modelo base en safetensors.
- Latencia y throughput: no disponibles; no se publican mediciones y dependeran del hardware, de la cuantizacion y de la longitud de contexto real, que ademas se desconoce.

## Comparativa con modelos similares

Los datos de la columna de Mtrini provienen de este repositorio; los de los modelos comparables son datos publicos de sus respectivas fichas (no verificados en esta busqueda) y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mtrini-SVL-2.0 (este, via GGUF) | 8,95B | no disponible | si (mmproj) | no disponible | GGUF en HF, 0 descargas |
| Llama 3.1 8B Instruct | 8,03B | 128K | no | Llama 3.1 Community License | safetensors y GGUF, amplia comunidad |
| Qwen2.5 7B Instruct | 7,62B | 128K | no (variante VL aparte) | Apache 2.0 | safetensors y GGUF, amplia comunidad |
| Gemma 2 9B Instruct | 9,24B | 8K | no | Gemma Terms of Use | safetensors y GGUF, amplia comunidad |

La diferencia practica principal no es de tamano, sino de trazabilidad: los tres comparables tienen model card detallada, benchmarks publicos y licencia explicita, mientras que Mtrini-SVL-2.0 carece de todo ello en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Es un bloqueante potencial para cualquier despliegue en produccion.
- Cero validacion externa: 0 descargas y 0 likes en el momento de la ficha; no hay reportes de terceros sobre calidad o estabilidad.
- Ausencia total de benchmarks: no se puede comparar su calidad con alternativas de la misma franja sin evaluarla uno mismo.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no debe asumirse una ventana larga; hay que medirla antes de disenar flujos con contexto extenso.
- Riesgo de alucinacion estandar en modelos de ~9B sin datos de alineamiento publicados; sin evaluaciones de robustez no hay garantias.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable (la propia tabla del autor marca Q3_K_M como "lower quality"); para uso serio, partir de Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas: puede existir una perdida de calidad adicional respecto a modelos equivalentes cuantizados con calibracion.
- La entrada multimodal depende del soporte del runtime; no todos los clientes de llama.cpp manejan `mmproj` de forma estable.
- Procedencia del modelo base no verificable en la informacion disponible: conviene revisar la ficha de CompiwerAI/Mtrini-SVL-2.0 antes de cualquier uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mtrini-SVL-2.0-GGUF
- Modelo base: https://huggingface.co/CompiwerAI/Mtrini-SVL-2.0
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Mtrini-SVL-2.0-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del trabajo de cuantizacion): https://www.nethype.de/
