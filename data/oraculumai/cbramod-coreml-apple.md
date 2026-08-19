# oraculumai/CBraMod-CoreML-Apple

## Resumen

CBraMod-CoreML-Apple es la conversión a Core ML del modelo fundacional de EEG CBraMod, desarrollado por Wang et al. (ICLR 2025) y distribuido por el ecosistema braindecode. El paquete proporciona un único `.mlpackage` que transforma una ventana de EEG de 14 canales (5 segundos a 200 Hz) en un embedding de 14 000 dimensiones, ejecutable íntegramente en dispositivos Apple mediante CoreML.framework. La conversión está validada contra el checkpoint PyTorch original con una paridad numérica rel-L2 de 1.3e-5 y una equivalencia de tarea exacta en un estudio de imaginería motora.

Este artefacto resuelve el problema de desplegar modelos fundadores de EEG en entornos móviles y de escritorio sin conexión, algo relevante para aplicaciones de interfaz cerebro-computadora (BCI) en dispositivos Apple. El modelo está pensado como extractor de características: las embeddings se alimentan a un clasificador lineal simple (p. ej., regresión logística) para decodificar imaginería motora sostenida. En una evaluación de 109 sujetos, estas embeddings alcanzaron un 63.7 % ± 13.8 % de precisión, superando significativamente a los métodos clásicos y de FM (p ≈ 2e-6).

La arquitectura subyacente es un transformer criss-cross, que procesa los canales de EEG de forma simétrica a nivel de parches. La conversión se realizó con coremltools 9.0 y el frontend `torch.export`, evitando las limitaciones de `torch.jit.trace` en este tipo de redes con aritmética de reshape intensiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Criss-cross transformer (CBraMod) |
| Parámetros totales | no disponible (peso del paquete ≈ 20 MB en fp32) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | Ventana fija de 1000 muestras (5 s a 200 Hz) |
| Tipos de cuantización | fp32 únicamente; sin variantes comprimidas publicadas |
| Idiomas soportados | no aplicable (modelo de EEG, no de lenguaje; etiqueta "en" del autor) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.mlpackage` (CoreML `mlprogram`, fp32) |

## Arquitectura y entrenamiento

El modelo base es CBraMod, un transformer con atención criss-cross diseñado para decodificación de EEG. La atención criss-cross permite capturar correlaciones tanto entre canales como entre parches temporales, tratando los canales de forma simétrica a nivel de parche. El checkpoint original fue preentrenado por los autores (Wang et al., ICLR 2025) sobre datos de EEG, aunque los detalles del preentrenamiento (número de tokens, composición del dataset, técnica de alineamiento) no están incluidos en la información proporcionada.

La conversión a Core ML elimina la cabeza de clasificación (se sustituye por una capa `Identity`) para exponer únicamente las embeddings. El proceso de exportación utiliza `torch.export.export(...).run_decompositions({})`, que especializa las formas estáticas a constantes y elimina los nodos simbólicos que causaban fallos con `torch.jit.trace`. La validación se realizó sobre EEG real (PhysioNet EEGBCI) y no sobre tensores aleatorios, garantizando la integridad de la conversión.

## Capacidades

- Extracción de embeddings de EEG: convierte ventanas de 14 canales × 1000 muestras en un vector de 14 000 dimensiones.
- Decodificación de imaginería motora sostenida (izquierda/derecha) cuando se combina con un clasificador lineal entrenado sobre las embeddings.
- Ejecución nativa en Apple Silicon (macOS, iOS, visionOS) mediante CoreML.framework, sin conexión a red.
- Montaje flexible: aunque la entrada fija es de 14 canales a 200 Hz, el modelo no es específico de un montaje concreto; cualquier montaje de 14 canales a 200 Hz puede usar el paquete.
- Compatibilidad con Swift y Python (via coremltools) para integración en apps y scripts.
- No es un modelo generativo de texto: no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Decodificación de imaginería motora en aplicaciones BCI móviles: un usuario con un casco de 14 canales (p. ej., Emotiv EPOC X) puede generar embeddings en tiempo real en un iPhone o Mac para controlar un cursor o una prótesis virtual, sin enviar datos a la nube.
- Neurofeedback personalizado: las embeddings pueden alimentar un clasificador que proporcione retroalimentación en tiempo real sobre el estado de concentración o relajación, en una app de bienestar.
- Investigación en neurociencia: los embeddings de CBraMod sirven como características robustas para estudios de imaginería motora en sujetos múltiples, con una precisión significativamente superior a los métodos clásicos según la validación del autor.
- Plataforma de datos clínicos (no diagnóstico): como componente de un pipeline de análisis de señales EEG para investigación, donde la extracción de embeddings on-device reduce costes de infraestructura.
- Desarrollo de apps de accesibilidad: permitir a personas con discapacidad motora controlar interfaces mediante señales de imaginería motora, usando solo hardware de consumo y procesamiento local.
- Benchmark de modelos fundadores de EEG: el paquete sirve como referencia reproducible para comparar la calidad de embeddings de CBraMod frente a otros modelos en pipelines de evaluación estandarizados.

## Benchmarks y rendimiento

La información disponible incluye validación de paridad y equivalencia de tarea, así como un resultado downstream del checkpoint original:

| Métrica | Resultado |
|---|---|
| Paridad numérica (rel-L2, 36 ventanas reales, CPU_ONLY) | 1.3e-5 (gate 1e-4) |
| Fidelidad de exportación (`torch.export` vs eager) | bit-exact |
| Equivalencia de tarea (precisión MI, sujetos 1–5, Core ML vs PyTorch) | idéntica (diferencia máxima 0.000) |
| Precisión downstream (109 sujetos, imaginería motora sostenida, embeddings + regresión logística) | 63.7 % ± 13.8 % (p ≈ 2e-6 vs mejor baseline) |

No se han publicado resultados de benchmarks comparativos con otros modelos fundadores de EEG en la información disponible.

## Requisitos de hardware

- El paquete es de ~20 MB en fp32, por lo que cabe en cualquier dispositivo Apple con CoreML.
- Probado en un Apple M3 Max: compilación en 0.44 s y primera predicción en frío en 1.27 s (aunque el rendimiento en caliente será menor).
- Se ejecuta en CPU y GPU de Apple Silicon (macOS, iOS, visionOS) mediante CoreML.framework; no requiere GPU externa.
- No se ha validado en hardware no Apple; para otros entornos se debe usar el checkpoint PyTorch original (`braindecode/cbramod-pretrained`).
- Opciones de despliegue: integración directa en apps Swift/Objective-C con CoreML, o en Python con `coremltools`. No se mencionan soporte para vLLM, llama.cpp o Ollama (no aplica para modelos de EEG).
- La latencia reportada en M3 Max es de 1.27 s para la primera predicción en frío; predicciones subsiguientes serán mucho más rápidas al estar compilado el modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Como referencia de categoría, el modelo original CBraMod se comparó en el paper con otros métodos de EEG decoding, pero los resultados no están detallados en esta ficha. Se recomienda consultar el repositorio de GitHub para la evaluación completa. Alternativas de modelos fundadores de EEG (no comparadas numéricamente aquí) incluyen LaTeX (Large Language Model for EEG), EEG-B (EEG foundation model) y otros, pero sin datos públicos de comparación en esta fuente.

## Limitaciones y advertencias

- Forma de entrada fija: `[1, 14, 1000]` (14 canales × 1000 muestras). Cualquier otro montaje o longitud de ventana requiere reexportación del modelo.
- Solo fp32: no se han publicado variantes comprimidas (paletizado, int8) y no están validadas para este modelo.
- Artefacto de investigación: no validado para diagnóstico médico, tratamiento ni decisiones clínicas. Su uso es bajo responsabilidad del usuario.
- La licencia BSD-3-Clause del modelo base se aplica; se debe cumplir en uso comercial.
- El modelo está orientado a EEG, no a lenguaje; no tiene capacidades de procesamiento de texto.
- El rendimiento downstream (63.7 %) es específico del conjunto de datos PhysioNet EEGBCI y del protocolo de evaluación (ventana de cue-offset); no se garantiza la generalización a otros protocolos o poblaciones.
- Riesgo de sesgo: el modelo se entrenó con datos de EEG de una población específica; puede no generalizar a otros grupos de edad, condición o montaje.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/oraculumai/CBraMod-CoreML-Apple
- Checkpoint base en HuggingFace: https://huggingface.co/braindecode/cbramod-pretrained
- Repositorio original CBraMod (GitHub): https://github.com/wjq-learning/CBraMod
- Script de conversión y validación (GitHub): https://github.com/nschlaepfer/oraculum-gpt-mk1/blob/main/scripts/port_cbramod_coreml.py
- Documentación de Core ML (Apple): https://developer.apple.com/documentation/coreml
- Proyecto Core AI Models (Apple): https://github.com/apple/coreai-models
- Modelos relacionados en HuggingFace: https://huggingface.co/oraculumai/ZUNA1.1-CoreML-Apple-1s y https://huggingface.co/oraculumai/ZUNA1.1-Classifier-CoreML-Apple
