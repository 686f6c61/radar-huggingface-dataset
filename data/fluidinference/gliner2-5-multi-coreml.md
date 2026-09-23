# FluidInference/gliner2-5-multi-coreml

## Resumen

GLiNER2.5 multilingual Core ML classification es una conversión a Core ML de la ruta de clasificación del modelo Fastino GLiNER2.5 multilingual (`fastino/gliner2.5-multi-v1`, revisión `a221b77a8baf4a613b8f8652661d41fa10a5641e`). Lo publica FluidInference, que se encarga de la conversión y el empaquetado, mientras que Fastino es el autor del checkpoint original. El objetivo es ejecutar clasificación de texto multilingüe con latencias de milisegundos en hardware de Apple (Apple Silicon, incluyendo la Neural Engine) sin depender de un servidor externo.

El checkpoint original tiene 287.355.159 parámetros. Este export incluye únicamente el encoder y la cabeza de clasificación entrenada, con 278.719.489 parámetros, y no incorpora las rutas de extracción de entidades, relaciones, registros ni spans del modelo original. Está pensado, por tanto, para tareas de clasificación con un conjunto cerrado de etiquetas, no como sustituto completo de GLiNER2.5.

La relevancia actual está en el despliegue local en el ecosistema Apple: el paquete FP16 ocupa 576.528.829 bytes, la referencia FP32 1.152.027.886 bytes, y la latencia mediana de una llamada desde Python fue de 8,81 ms en FP16 y 11,24 ms en FP32 sobre un M5 Pro con macOS 27.0. El destino mínimo de Core ML es iOS 17 / macOS 14.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de clasificación entrenada (detalles internos de capas y atención no disponibles); export a Core ML |
| Parámetros totales | 278.719.489 (export encoder + cabeza de clasificación); el checkpoint original tiene 287.355.159 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (variante L128); el bucket admite como máximo 8 etiquetas (K8). No se permite truncado: entradas por encima de la capacidad requieren un bucket mayor |
| Tipos de cuantización | FP16 (paquete L128/K8, 576.528.829 bytes) y FP32 (referencia, 1.152.027.886 bytes). No se documentan otras precisiones |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); se verificaron frases de prueba en francés, español, chino y alemán. Lista completa de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Core ML (coremltools) junto con ficheros de tokenizer; el modelo usa el esquema GLiNER2 y el tokenizer originales |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 1,7 GB |
| Plataforma mínima | iOS 17 / macOS 14 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe este artefacto como una conversión, no como un entrenamiento nuevo. Se exporta el encoder más la cabeza de clasificación ya entrenada del checkpoint `fastino/gliner2.5-multi-v1`, que a su vez emplea el esquema y el tokenizer de GLiNER2. El export resultante tiene 278.719.489 parámetros frente a los 287.355.159 del checkpoint original, diferencia coherente con la omisión de las cabezas de extracción de entidades, relaciones, registros y spans, que no forman parte de este paquete.

No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento, ya que corresponden al modelo original de Fastino. La innovación técnica relevante aquí es la conversión y el empaquetado: dos buckets de precisión (FP16 y FP32) con paridad verificada frente a las decisiones del modelo nativo, un runtime mínimo que carga solo los ficheros Core ML y de tokenizer, y scripts de conversión, dependencias fijadas y hashes de los activos incluidos en el repositorio.

## Capacidades

- Clasificación de texto multilingüe con un conjunto cerrado de etiquetas definido en tiempo de inferencia (por ejemplo, `["science","sports","politics"]`), devolviendo la etiqueta elegida y su confianza.
- Ejecución nativa en Apple Silicon mediante Core ML, con destino mínimo iOS 17 / macOS 14.
- Procesamiento de hasta 8 etiquetas por llamada en el bucket L128/K8 incluido.
- Entrada multilingüe: se verificaron frases de prueba en francés, español, chino y alemán con etiquetas elegidas idénticas en nativo, FP16 y FP32.
- Dos modos de precisión seleccionables en el runtime (`--precision fp16` y `--precision fp32`), pensados para priorizar velocidad o decisiones exactas en márgenes estrechos.
- API de línea de comandos en el runtime incluido, invocable con `uv run python runtime.py --model-dir . --text ... --task ... --labels ...`.
- No incluye: extracción de entidades (NER), extracción de relaciones, extracción de registros, extracción de spans, generación de texto, tool calling, function calling, razonamiento multi-paso ni modo de pensamiento. Para esas tareas la model card remite explícitamente al checkpoint original.

## Casos de uso

- Clasificación de titulares o noticias por temática en local: con un conjunto de etiquetas como `science`, `sports`, `politics`, el modelo devuelve la etiqueta y su confianza; es el escenario exacto que se usó en las pruebas de paridad (299 de 300 aciertos respecto al nativo en FP16).
- Moderación y enrutado de contenido en aplicaciones iOS/macOS: al ejecutarse en Core ML sobre el dispositivo, permite clasificar texto sin enviar datos a un servidor, útil cuando hay requisitos de privacidad o de residencia del dato.
- Etiquetado de formularios y tickets de soporte con categorías fijas: la latencia mediana de 8,81 ms por llamada en FP16 sobre M5 Pro permite clasificar en el momento de la escritura, sin bloquear la interfaz.
- Enrutado de consultas en asistentes locales: asignar cada consulta entrante a una categoría (por ejemplo, facturación, soporte técnico, comercial) antes de pasarla a otro componente del sistema.
- Procesamiento por lotes en pipelines de datos: la combinación de precisión FP32 con márgenes estrechos (diferencia máxima de confianza de 0,00000805 en las 100 muestras verificadas) es adecuada cuando se necesita replicar exactamente la decisión del modelo nativo.
- Clasificación multilingüe en aplicaciones para varios países: el modelo está etiquetado como multilingüe y se comprobó con frases en francés, español, chino y alemán, con resultados equivalentes entre precisiones.
- Filtrado previo en herramientas de anotación: usar la salida del modelo como preetiquetado rápido para que un humano solo revise los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo documenta comprobaciones de paridad entre el modelo nativo y los exports Core ML:

| Prueba | Precisión | Muestras | Coincidencia con el nativo | Diferencia máxima de confianza | Latencia mediana (M5 Pro, macOS 27.0) |
|---|---|---|---|---|---|
| Decisiones sobre peticiones fijas de aplicación | FP16 | 299 de 300 elegibles | 299 de 300; un empate cercano invirtió «sports» y «world news» | 0,009249 | 8,81 ms por llamada desde Python |
| Decisiones sobre muestras | FP32 | 100 | 100 de 100 | 0,00000805 | 11,24 ms por llamada desde Python |
| Frases de prueba multilingües | Nativo, FP16 y FP32 | 4 (francés, español, chino, alemán) | Etiquetas idénticas en las tres rutas | No disponible | No disponible |

Advertencia recogida en la propia model card: son comprobaciones de paridad, no una ejecución completa del Decision Index ni mediciones exclusivas de la Neural Engine. No se han publicado cifras de throughput.

## Requisitos de hardware

- Memoria: al ser Core ML sobre Apple Silicon, se usa memoria unificada. El paquete FP16 ocupa 576.528.829 bytes (aproximadamente 0,54 GiB) y el FP32 1.152.027.886 bytes (aproximadamente 1,07 GiB); hay que sumar el tokenizer y el overhead del runtime.
- GPU/plataforma: está diseñado para Apple Silicon, con Core ML como único backend; no se documentan rutas para CUDA, ROCm ni CPU x86. La model card menciona ejecución en M5 Pro y no publica tiempos exclusivos de ANE.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y en dispositivos con iOS 17 o superior. No se indican requisitos de GPU dedicada tipo A100, H100 o RTX 4090 porque no aplican a este artefacto.
- Despliegue: el repositorio incluye un runtime propio que carga únicamente los ficheros Core ML y de tokenizer, con `uv sync` y `uv run python runtime.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 8,81 ms de mediana por llamada en FP16 y 11,24 ms en FP32 medidos desde Python sobre un M5 Pro. Se recomienda FP32 cuando las decisiones exactas del modelo nativo importan en márgenes estrechos.
- Capacidad: máximo 8 etiquetas con el bucket L128/K8 incluido. Las entradas que superan la capacidad requieren un bucket mayor; no se admite truncado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Funcionalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/gliner2-5-multi-coreml (este) | 278.719.489 (export) | 128 tokens; máximo 8 etiquetas | Solo clasificación; ejecución local en Core ML | Apache-2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| fastino/gliner2.5-multi-v1 (origen) | 287.355.159 | No disponible | Clasificación y extracción de entidades, relaciones, registros y spans | Apache-2.0 | HuggingFace |
| Otras alternativas de clasificación multilingüe o de la familia GLiNER | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para comparar el rendimiento frente a otros modelos de clasificación de la misma categoría.

## Limitaciones y advertencias

- Cobertura funcional reducida: el export incluye solo encoder y cabeza de clasificación. No hace extracción de entidades, relaciones, registros ni spans; para esas tareas hay que usar el checkpoint original.
- Límite de etiquetas: como máximo 8 etiquetas por llamada en el bucket L128/K8. No se permite truncar; si la entrada no cabe, hace falta un bucket mayor.
- Longitud de entrada limitada a 128 tokens en la variante publicada.
- Pérdida de fidelidad en FP16: se documenta una inversión de etiquetas en un caso cercano («sports» y «world news») y una diferencia máxima de confianza de 0,009249. Para decisiones ajustadas se recomienda FP32.
- Las mediciones de latencia y de paridad son de un único entorno (M5 Pro con macOS 27.0) y no son tiempos exclusivos de la Neural Engine; los resultados pueden variar en otros dispositivos.
- Alcance de las pruebas: 300 peticiones fijas de aplicación y 100 muestras en FP32, más cuatro frases multilingües. No es una evaluación exhaustiva de calidad ni de sesgos.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento en dominios específicos; no hay datos sobre idiomas soportados más allá de los cuatro verificados.
- Licencia Apache-2.0, permisiva y apta para uso comercial, siempre que se conserve la atribución correspondiente. Hay que tener en cuenta que el modelo original es de Fastino y que este paquete es una conversión de FluidInference.
- Advertencia operativa: el modelo está pensado para clasificación con etiquetas cerradas; no debe usarse como generador de texto ni como extractor de información estructurada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/gliner2-5-multi-coreml
- Checkpoint original de Fastino: https://huggingface.co/fastino/gliner2.5-multi-v1
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: papers, blogs, repositorios o demos adicionales no disponibles.
