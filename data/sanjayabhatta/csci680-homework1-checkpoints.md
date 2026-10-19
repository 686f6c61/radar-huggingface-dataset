# sanjayabhatta/csci680-homework1-checkpoints

## Resumen

`sanjayabhatta/csci680-homework1-checkpoints` es un conjunto de cuatro checkpoints publicados por el usuario sanjayabhatta como entrega de un trabajo individual de la asignatura CSCI 680. No es un modelo listo para producción: son pesos seleccionados y sin modificar de un experimento académico que entrena desde cero un transformer T5 de 60.492.288 parámetros con vocabulario SentencePiece propio, sin importar pesos ni vocabulario preentrenados. El objetivo del experimento es medir cuánto aporta el preentrenamiento con corrupción de spans sobre código Java en dos tareas de revisión de código (generar un comentario de revisión a partir de un método y reescribir el método a partir de su comentario).

Los cuatro ficheros corresponden a cuatro configuraciones: preentrenamiento desde cero (50.000 actualizaciones), variante A (inicialización aleatoria más ajuste fino en las dos tareas), variante B (preentrenamiento más ajuste fino en las dos tareas) y variante C (preentrenamiento más ajuste fino solo en revisión de código). Los resultados son muy modestos: el mejor exact match en revisión de código es del 2,24% (112 de 5.000), aunque el CodeBLEU de B y C se sitúa en 79,27 y 80,98 sobre 100. Su interés es, por tanto, metodológico y docente, no de aplicación directa.

El corpus de preentrenamiento son métodos Java autoextraídos de GitHub mediante una búsqueda SEART congelada con etiqueta MIT, y los datos de ajuste fino proceden de un subconjunto reparado, filtrado y muestreado del dataset de Tufano et al. (ICSE 2022). El repositorio ocupa 1,0 GB, no tiene descargas ni likes, y en el momento de la consulta es privado, por lo que la descarga requiere autenticación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (`T5ForConditionalGeneration`) |
| Parametros totales | 60.492.288 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; solo se publican checkpoints PyTorch en coma flotante, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés (etiqueta `en`); el contenido manipulado es código Java |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch personalizado (`.pt` con `model_state_dict`), no es una carpeta `save_pretrained`; se acompaña de `configs/model.json`, tokenizador SentencePiece (`tokenizer/spiece.model`) y `checkpoint_files.json` con sumas SHA-256 |
| Checkpoints incluidos | `pretraining.pt` (50.000 actualizaciones), `nopt.pt` (A), `pt.pt` (B), `pt-st.pt` (C), los tres últimos con 15.625 actualizaciones |
| Tamano del repositorio | 1,0 GB |
| Prefijos de tarea | `code&comment2code: ` y `code2comment: ` (con un espacio final); las salidas no llevan prefijo |

## Arquitectura y entrenamiento

La arquitectura es un T5 estándar (encoder-decoder con atención completa y embeddings posicionales relativos) de 60.492.288 parámetros, instanciado desde cero con `T5Config`. No se importó ningún peso preentrenado ni vocabulario de T5: el tokenizador es un modelo SentencePiece entrenado específicamente para este experimento, y el código de carga debe usar la clase `ScratchTokenizer` incluida en `src/scratch_tokenizer.py` en lugar de `T5Tokenizer`. El preentrenamiento usa el objetivo de corrupción de spans característico de T5 sobre métodos Java con Javadoc cuando está disponible, extraídos de un marco de búsqueda SEART congelado y etiquetado como MIT.

El ajuste fino se planteó como un diseño experimental de tres brazos con el mismo presupuesto de 15.625 actualizaciones: A parte de inicialización aleatoria y se ajusta en las dos tareas; B parte del checkpoint preentrenado y se ajusta en las dos tareas; C parte del preentrenado y se ajusta únicamente en revisión de código. La model card indica que C vio el doble de presentaciones de revisión de código que B y que usó un criterio de selección de validación distinto, lo que impide atribuir toda la diferencia a la tarea. No se menciona RLHF, DPO ni ningún ajuste por preferencias; tampoco se especifica el número de tokens de preentrenamiento ni la composición detallada del corpus. Los datos crudos de ajuste fino, el corpus y los checkpoints de optimizador o reanudación no se redistribuyen.

## Capacidades

- Generación de texto secuencia a secuencia con un vocabulario SentencePiece propio entrenado para código Java y texto técnico en inglés.
- Generación de comentarios de revisión a partir de un método Java, mediante el prefijo `code2comment: `.
- Reescritura de un método Java a partir de su comentario, mediante el prefijo `code&comment2code: ` (tarea de revisión de código).
- Modelado de código Java a nivel de método, incluyendo Javadoc asociado.
- Soporte de tool calling / function calling: no. No hay plantilla de herramientas, ni formato de llamadas, ni entrenamiento orientado a agentes.
- Soporte de agentes y razonamiento multi-paso: no. Es un modelo seq2seq de una sola pasada.
- Capacidades multilingües: limitadas al inglés como idioma declarado; el código fuente es Java.
- Capacidades especiales: ninguna. No hay modo de razonamiento, ni visión, ni audio, ni decodificación especulativa documentada.
- Carga e inspección determinista de pesos: el repositorio incluye sumas SHA-256 para verificar la integridad de cada fichero.

## Casos de uso

- Reproducción de experimentos académicos: cargar `pt.pt` o `nopt.pt` con `T5ForConditionalGeneration` y `strict=True`, aplicar los prefijos de tarea y replicar las métricas de la model card con el mismo criterio de decodificación. Es el uso previsto por el autor.
- Línea base en investigación sobre revisión automática de código: comparar el efecto de entrenar desde cero 60M de parámetros frente a modelos preentrenados de tamaño similar en las mismas 5.000 muestras de test.
- Estudio de ablación preentrenamiento vs. inicialización aleatoria: los pares A/B están diseñados exactamente para aislar esa variable, con el mismo número de actualizaciones de ajuste fino.
- Docencia en cursos de ingeniería del software o aprendizaje automático: sirve como ejemplo completo de pipeline (tokenizador propio, preentrenamiento con corrupción de spans, ajuste fino multi-tarea, selección por validación y evaluación con EM, BLEU-4 y CodeBLEU).
- Validación de infraestructura de checkpoints no estándar: útil para probar procedimientos de descarga con `snapshot_download`, verificación de hashes y carga manual de `state_dict` antes de adoptar este formato en proyectos internos.
- Anotación asistida de Javadoc en un corpus Java interno, solo como piloto con revisión humana obligatoria: el EM de 0/5.000 en comentarios de revisión y un BLEU-4 máximo de 0,5718 indican que la salida no es fiable sin supervisión.
- Investigación sobre métricas de evaluación: permite contrastar cuánto se separan el exact match (2,24% en el mejor caso) y el CodeBLEU (80,98) en una misma tarea, evidencia de que la similitud de código no equivale a corrección funcional.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 5.000 muestras de test y un único seed:

| Checkpoint | Tarea | Exact match | CodeBLEU (0-100) | BLEU-4 |
|---|---|---:|---:|---:|
| A (`nopt.pt`) | Revisión de código | 1/5.000 (0,02%) | 20,4810 | no disponible |
| B (`pt.pt`) | Revisión de código | 76/5.000 (1,52%) | 79,2664 | no disponible |
| C (`pt-st.pt`) | Revisión de código | 112/5.000 (2,24%) | 80,9781 | no disponible |
| A (`nopt.pt`) | Comentario de revisión | 0/5.000 (0,00%) | no disponible | 0,2359 |
| B (`pt.pt`) | Comentario de revisión | 0/5.000 (0,00%) | no disponible | 0,5718 |
| C (`pt-st.pt`) | Comentario de revisión | no evaluado | no evaluado | no evaluado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores no son comparables con las de modelos preentrenados a gran escala, ya que el modelo se entrena desde cero con un presupuesto muy limitado y sobre un dominio restringido.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 242 MB en FP32 (60,49M de parámetros × 4 bytes), unos 121 MB en FP16/BF16 y unos 60 MB en int8. Son cálculos teóricos a partir del número de parámetros; no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090, A100 u H100 quedan enormemente sobredimensionadas; el cuello de botella sería el tamaño de lote y el preprocesado, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida. La model card indica explícitamente que el ejemplo de carga funciona solo en CPU (`map_location="cpu"`).
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, porque el formato es un `state_dict` personalizado y no una carpeta `save_pretrained` ni un GGUF. El camino soportado es `transformers` + `torch.load(..., weights_only=True)` + `load_state_dict(strict=True)` con el `T5Config` de `configs/model.json`. Para usarlo con otras herramientas habría que reexportar previamente a `save_pretrained` e incluir el `ScratchTokenizer`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni tamaño de lote.
- Requisito operativo adicional: el repositorio es privado en el momento de la consulta, por lo que `snapshot_download` necesita autenticación, y conviene fijar la revisión (`revision=HUB_COMMIT`) al commit verificado en `results/checkpoints/hub_manifest.json`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este modelo (B/C) | 60,49M | no disponible | T5 desde cero, Java, revisión de código | no disponible | repo privado, formato `.pt` propio |
| google-t5/t5-small | 60,5M | 512 tokens en la práctica (T5 estándar) | T5 preentrenado multilingüe, propósito general | Apache 2.0 | público, `safetensors`/PyTorch |
| Salesforce/codet5-small | 60M | 512 tokens en la práctica (CodeT5) | T5 preentrenado en código (identificadores), multi-lenguaje | Apache 2.0 | público, `safetensors`/PyTorch |
| microsoft/CodeReviewer | ~223M | 512 tokens en la práctica | BERT encoder para revisión de código (Tufano et al.) | no verificada en esta ficha | público |

La comparación de rendimiento directo no está disponible: este experimento no evalúa T5-small ni CodeT5-small sobre su mismo conjunto de test, y las condiciones de entrenamiento (desde cero, 50.000 actualizaciones de preentrenamiento) no son equiparables a los modelos preentrenados. La diferencia práctica más relevante es de ingeniería: los alternativas se cargan con `AutoModelForSeq2SeqLM.from_pretrained` y funcionan en ecosistemas estándar, mientras que este repositorio exige código de carga a medida.

## Limitaciones y advertencias

- Rendimiento muy bajo: el mejor exact match es del 2,24% en revisión de código y del 0,00% en generación de comentarios de revisión. No es apto para uso productivo sin intervención humana.
- Un único seed: no hay intervalos de confianza ni repeticiones, por lo que las diferencias entre B y C (1,52% frente a 2,24%) no pueden considerarse estadísticamente sólidas.
- Comparación B vs. C confundida: C vio el doble de presentaciones de revisión de código y usó otro criterio de selección de validación, de modo que la mejora no se puede atribuir limpiamente al diseño de la tarea.
- C no fue entrenado ni evaluado para comentarios de revisión, así que esa celda de la tabla comparativa queda vacía por diseño.
- La confianza de secuencia no es una probabilidad calibrada de acierto, y el CodeBLEU no es una tasa de superación de tests funcionales: un 80,98 de CodeBLEU no implica código correcto.
- La política de filtrado de comentarios de revisión del corpus es, según el propio autor, una interpretación no confirmada del enunciado de la asignatura.
- Procedencia del corpus: métodos Java autoextraídos de un marco SEART con etiqueta MIT, pero esas etiquetas no se comprobaron fichero a fichero. Existe riesgo de incorporar código con licencias incompatibles.
- Licencia del modelo no declarada: no se permite asumir uso comercial libre. Cualquier despliegue empresarial requiere aclarar la licencia con el autor.
- Formato no estándar: no se carga con `AutoModelForSeq2SeqLM`, ni con `pipeline()`, ni con servidores de inferencia habituales. Tampoco es compatible con el tokenizador de T5 por usar SentencePiece propio.
- Idiomas: solo inglés declarado y código Java; no hay evidencia de generalización a otros lenguajes de programación ni a otros idiomas naturales, a pesar de que el arXiv de referencia trate varios lenguajes.
- Riesgo de alucinación: como todo modelo generativo, puede producir Javadoc o código sintácticamente plausible pero incorrecto; con estos niveles de métricas el riesgo es alto.
- Sesgos conocidos: no se han publicado análisis de sesgo. El corpus proviene de repositorios públicos de GitHub, con el sesgo de estilo y de población de desarrolladores que ello implica.
- Dependencia de un entorno fijado (`pinned`) para reproducir resultados; sin él, las métricas pueden no coincidir.
- El autor declara asistencia de ChatGPT y Codex en la implementación, comprobaciones y documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanjayabhatta/csci680-homework1-checkpoints
- Repositorio fuente del experimento: https://github.com/aura-lab-wm/teaching-genai4se-2026-sbhatta/tree/893fe4a8db321afef25a9a64dc9186dc8684ee61
- Paper de referencia del dataset de ajuste fino (Tufano et al., ICSE 2022): https://arxiv.org/abs/2201.06850
- Dataset original en Zenodo (CC BY 4.0 según la data card facilitada): https://doi.org/10.5281/zenodo.5387856
