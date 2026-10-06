# ollaya-dev/arbiter

## Resumen

arbiter es un modelo de decisión distribuido por el usuario ollaya-dev para el runtime Ollaya, un sistema de ejecución local de modelos de decisión. No es un modelo generativo: recibe preguntas tipadas y devuelve decisiones calibradas, con puntuaciones por slot y probabilidades. Se etiqueta como text-classification y system-one, lo que lo sitúa en la categoría de modelos de decisión rápida y reactiva, no de razonamiento deliberativo.

El modelo deriva de hiteshluke/arbiter-4b, que a su vez parte de unsloth/gemma-3-4b-it (Gemma 3 4B de Google) con un adaptador LoRA y una cabeza de decisión. Esta ficha corresponde al repositorio de exportación ONNX de ollaya-dev: contiene un grafo fp32 (model-fp32.onnx), la disposición de secuencia y los tokens especiales (decision.json) y las temperaturas de calibración (calibration.json), pero no incluye pesos. El grafo referencia los pesos de los repositorios originales por desplazamiento de bytes, de modo que `ollaya pull` los descarga sin modificar, anclados a un commit y verificados por sha256.

Su interés actual reside en ese formato de distribución, que separa el grafo del runtime de los pesos del modelo y los reutiliza verificados por hash. El proyecto se encuentra en una fase muy temprana: 0 descargas y 0 me gusta en el momento de la consulta, con fechas de creación y actualización de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3) con adaptador LoRA y cabeza de decisión; exportado a ONNX. Base: unsloth/gemma-3-4b-it |
| Parámetros totales | En torno a 4.000 millones, según la denominación del modelo base (Gemma 3 4B); no se publica el recuento exacto |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible para este derivado; el modelo base Gemma 3 4B declara hasta 128.000 tokens |
| Tipos de cuantización | Únicamente fp32 (grafo model-fp32.onnx) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-and-gemma (Apache-2.0 para el adaptador LoRA y la cabeza; Gemma Terms of Use para el modelo base Gemma 3) |
| Formato de pesos | ONNX (fp32); el repositorio no contiene pesos, solo grafos que referencian los pesos de los repositorios upstream |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer decoder de Gemma 3 en su variante de 4.000 millones de parámetros, sobre el que los autores han añadido un adaptador LoRA y una cabeza de decisión. La exportación a ONNX conserva el grafo en fp32 y se utiliza tanto en CPU como en GPU. El repositorio de ollaya-dev no incluye pesos ni información sobre el proceso de entrenamiento del adaptador. Los repositorios upstream citados son hiteshluke/arbiter-4b (commit 0c44271) y unsloth/gemma-3-4b-it (commit bf46152). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable no está en el entrenamiento, sino en el formato de distribución y en la verificación de paridad. Ollaya exporta el modelo a ONNX con los pesos referenciados por desplazamiento de bytes, de forma que el runtime descarga los pesos originales desde los repositorios upstream y comprueba su sha256, sin duplicarlos. El runtime en Rust iguala a la referencia (transformers con Gemma 3, el LoRA y la cabeza de los autores, fp32, y los prompts del script de entrenamiento) sobre 420 preguntas agrupadas en 127 peticiones, tanto en CPU como en CUDA: filas de tokens idénticas, las mismas 121 peticiones rechazadas, la misma decisión en todas las preguntas, puntuaciones por slot con una diferencia máxima de 8,5·10⁻⁵ y probabilidades con una diferencia máxima de 1,0·10⁻⁵.

## Capacidades

- Clasificación de texto y toma de decisiones: devuelve una decisión por pregunta tipada, según la descripción del proyecto ("typed questions in, calibrated answers out").
- Salida calibrada: emite puntuaciones por slot y probabilidades, ajustadas mediante las temperaturas declaradas en calibration.json.
- Capacidad de rechazo: el modelo puede rechazar peticiones; en la prueba de paridad se rechazaron 121 de las 127 peticiones evaluadas.
- Determinismo: en la prueba de paridad la decisión fue idéntica en todas las preguntas evaluadas.
- Inferencia en CPU y GPU: el grafo fp32 se ejecuta en ambos entornos.
- Integración mediante una API compatible con TypeSafe a través del runtime Ollaya.
- Generación de texto libre: no documentada; el pipeline declarado es text-classification.
- Tool calling y function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible; el modelo se etiqueta como system-one, es decir, decisión rápida y no deliberativa.
- Visión y audio: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

Los siguientes escenarios se derivan de la función declarada del modelo (recibir preguntas tipadas y devolver decisiones calibradas) y deben considerarse propuestas de uso, no casos validados por los autores.

- Enrutamiento de decisiones en pipelines: al recibir preguntas tipadas y devolver una decisión con probabilidad calibrada, puede actuar como enrutador que dirige cada petición a la rama correspondiente. Su ejecución local en ONNX permite integrarlo en el mismo proceso sin llamadas externas.
- Filtrado y rechazo de peticiones: la capacidad de rechazar solicitudes (121 de 127 peticiones en la prueba de paridad) lo hace adecuado como primera barrera que descarta entradas fuera de dominio antes de enviarlas a un modelo mayor.
- Clasificación con umbral de confianza: gracias a las probabilidades calibradas mediante calibration.json, es posible fijar un umbral para aceptar, revisar manualmente o rechazar una decisión.
- Ejecución en el borde o en CPU: al disponer de un único grafo ONNX fp32 y soportar CPU, puede desplegarse en servidores sin GPU, siempre que la memoria disponible permita los aproximadamente 16 GB del modelo sin cuantizar.
- Preclasificación ante un LLM generativo: situarlo como componente system-one delante de un modelo generativo para decidir si la consulta requiere razonamiento deliberativo, reduciendo así el coste de inferencia.
- Decisiones deterministas y auditables: la coincidencia exacta con la implementación de referencia en filas de tokens y decisión facilita la reproducibilidad en entornos que exigen trazabilidad.
- Servicio tipado de decisiones: integración con la API compatible con TypeSafe del runtime Ollaya para exponer decisiones tipadas como parte de un servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación es la prueba de paridad entre el runtime Ollaya y la implementación de referencia.

| Métrica | Resultado |
|---|---|
| Preguntas evaluadas | 420 |
| Peticiones evaluadas | 127 |
| Peticiones rechazadas | 121 (idénticas a la referencia) |
| Coincidencia de decisiones | 100 % (misma decisión en todas las preguntas) |
| Diferencia máxima en puntuaciones por slot | 8,5·10⁻⁵ |
| Diferencia máxima en probabilidades | 1,0·10⁻⁵ |
| Hardware probado | CPU y CUDA (RTX 4090) |

## Requisitos de hardware

- Huella en fp32: aproximadamente 16 GB solo de parámetros (unos 4.000 millones × 4 bytes), sin contar activaciones ni el propio runtime. Es una estimación aritmética.
- VRAM estimada: en torno a 16-20 GB en fp32. No se ofrecen cuantizaciones int8 o int4, por lo que la huella no puede reducirse con ese tipo de formatos.
- GPU probada: NVIDIA RTX 4090 (24 GB) en CUDA; el modelo también se ejecuta en CPU.
- GPU de centro de datos: no se documentan pruebas específicas en A100 o H100, aunque por capacidad de VRAM serían compatibles.
- GPU de consumo: cabe en tarjetas con 24 GB (por ejemplo, RTX 3090 o RTX 4090) en fp32; en GPUs con 8-16 GB no cabría en fp32 y no hay cuantizaciones publicadas que lo permitan.
- Opciones de despliegue: runtime Ollaya (`ollaya pull`, `ollaya run arbiter`) y ONNX Runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La categoría (modelos de decisión empaquetados para un runtime concreto) cuenta con pocos modelos públicos, por lo que varios campos no están documentados. Se comparan el modelo y sus dos referencias directas.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ollaya-dev/arbiter | En torno a 4.000 M | No disponible | Clasificación y decisión (ONNX) | apache-2.0-and-gemma | Hugging Face y runtime Ollaya |
| hiteshluke/arbiter-4b | En torno a 4.000 M | No disponible | Modelo de decisión (upstream) | No disponible | Hugging Face |
| unsloth/gemma-3-4b-it | En torno a 4.000 M | 128.000 tokens | Generación de texto (fine-tune) | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio sin pesos: no contiene los parámetros; requiere descargarlos de los repositorios upstream, con verificación sha256 y anclaje a un commit.
- Licencia dual: el modelo base Gemma 3 se rige por los Gemma Terms of Use, que imponen condiciones adicionales al uso comercial; el adaptador y la cabeza son Apache-2.0. Conviene revisar esos términos antes de un uso en producción.
- Naturaleza no generativa: el pipeline declarado es text-classification, por lo que no debe utilizarse como LLM para generación de texto libre.
- Riesgo de decisiones erróneas: al ser un clasificador, los fallos se manifiestan como falsos positivos o falsos negativos; la calibración depende de las temperaturas de calibration.json. No se documentan tasas de error.
- Idiomas: no se documentan los idiomas soportados.
- Contexto: no se documenta la longitud de contexto efectiva de este derivado.
- Taxonomía de razonamiento: la etiqueta system-one implica decisiones rápidas, no razonamiento multi-paso ni deliberación.
- Madurez: el repositorio registra 0 descargas y 0 me gusta, con fechas de octubre de 2026; no cuenta con validación independiente.
- Dependencia del runtime: la ejecución requiere el runtime Ollaya (Rust) o ONNX Runtime; el grafo referencia pesos externos, de modo que la disponibilidad depende de los repositorios upstream, mitigado por el anclaje a un commit concreto.
- Sin cuantizaciones publicadas: solo fp32, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/ollaya-dev/arbiter
- Repositorio Ollaya: https://github.com/ollaya-dev/ollaya
- Modelo upstream (adaptador LoRA y cabeza): https://huggingface.co/hiteshluke/arbiter-4b
- Commit upstream de arbiter-4b: https://huggingface.co/hiteshluke/arbiter-4b/tree/0c44271c59f89758e3cae17b032e98a9140093e9
- Modelo base Gemma 3 4B (fine-tune): https://huggingface.co/unsloth/gemma-3-4b-it
- Commit upstream de unsloth/gemma-3-4b-it: https://huggingface.co/unsloth/gemma-3-4b-it/tree/bf46152c47f5dd20b896357cb51abc4c03b8ee8c
- Términos de licencia de Gemma: https://ai.google.dev/gemma/terms
