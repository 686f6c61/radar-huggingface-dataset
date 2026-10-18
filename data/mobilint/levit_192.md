# mobilint/LeViT_192

## Resumen

LeViT_192 (repositorio `mobilint/LeViT_192`) no es un modelo de lenguaje, sino un artefacto compilado de clasificación de imágenes basado en la arquitectura LeViT-192, un transformer de visión diseñado para inferencia rápida. Lo publica la organización mobilint dentro de su colección `aries-rb`, que agrupa reproducciones en formato MXQ de modelos del catálogo `mblt-model-arxiv`. El repositorio no contiene pesos en PyTorch ni safetensors: contiene un único binario MXQv7 de 14.247.469 bytes generado con `qbcompiler 1.4.0` y destinado a ejecutarse con `qbruntime 1.5.0` sobre aceleradores de la propia mobilint.

El problema que resuelve es la portabilidad de un clasificador de imágenes eficiente hacia el hardware y el runtime propietarios de mobilint: el artefacto permite ejecutar LeViT-192 con un esquema de inferencia único (`single`) y conserva, según la evaluación del autor, el 99,72 % de la precisión top-1 del modelo de referencia. Sobre 50.000 muestras de ImageNet reporta top-1 de 0,79646 y top-5 de 0,94616 en modo `async`.

Su relevancia es acotada y muy específica: sirve como pieza de validación de la toolchain qbcompiler/qbruntime y como bloque de clasificación visual en despliegues sobre NPU de mobilint. No es utilizable con vLLM, llama.cpp, Ollama o TGI, ni como modelo generativo. El repositorio no incluye pesos originales, tokenizador, configuración ni código de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeViT (vision transformer híbrido con etapas convolucionales), variante 192; artefacto compilado, no se publica el grafo fuente |
| Parametros totales | No disponible en la model card; el paper original de LeViT-192 reporta aproximadamente 10,9 M de parámetros (dato externo, no verificable a partir de este artefacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin ventana de contexto textual) |
| Tipos de cuantizacion | Cuantización propietaria aplicada por `qbcompiler 1.4.0`; el esquema exacto (bits, granularidad, calibración) no se detalla en la model card |
| Idiomas soportados | No aplica (no procesa texto); no disponible la lista de etiquetas de salida |
| Licencia | Apache-2.0 |
| Formato de pesos | MXQv7 (`format: "MXQv7"`), fichero único de 14.247.469 bytes; no hay safetensors, GGUF ni ONNX |
| Variante | `c0923-base` |
| Modos de inferencia soportados | `single` únicamente (el artefacto se compiló con `--inference-scheme single`) |
| Runtime requerido | `qbruntime 1.5.0` |
| Compilador e imagen | `qbcompiler 1.4.0`, imagen `1.4-cuda12.8.1-ubuntu22.04` (digest sha256:7910f1661605b82eb9616f6ac99fd6461dbb865dcadaa810cce22c638ceffd44) |
| Dispositivo de compilación | `gpu` |
| Dataset de evaluación | ImageNet, 50.000 muestras, modo de inferencia `async` |
| SHA-256 del artefacto | `d88f34406db68daea5951e9d55543ade06006a1903e150392e4148223c1d9bd8` |
| SHA-256 de contenido | `e9e602943ca11190a0d34a8d9341f03da2491be85f898cf6f18b9e238b4717f1` |
| Identificador de intento | `LeViT_192-jinman-20261017t181322-fbb1a` |
| Tamaño del repositorio | 0.0 GB según HuggingFace; el binario declarado ocupa unos 13,6 MiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es LeViT-192, un transformer de visión orientado a inferencia rápida que combina una etapa inicial de tipo convolucional para reducir la resolución espacial con bloques de atención multi-cabeza posteriores; el diseño prioriza el coste computacional bajo (pocos GMACs) frente a la precisión máxima. Este repositorio, sin embargo, no documenta el proceso de entrenamiento: no se indica el número de tokens o imágenes vistas, la composición del dataset de preentrenamiento, ni si hubo destilación desde un profesor convolucional (aproximación habitual en la familia LeViT). Tampoco se documenta ningún ajuste fino posterior, RLHF/DPO (no aplicable) ni técnica de decodificación.

Lo que sí está documentado es la cadena de compilación: el artefacto se generó a partir de la carpeta publicada en `mobilint/mblt-model-arxiv` con `qbcompiler 1.4.0` dentro de la imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04`, fijando el commit de operadores `1c66c7b88ec5251bf39410095b3e01d88d30ebe9` y el esquema de inferencia `single`. El resultado es un binario MXQv7 cuantizado que solo expone ese modo. La model card advierte además que `aries-rb/best_result.json` contiene valores de build heredados que se conservan para los valores por defecto de compilación de `mblt-vision-python`, y que el directorio legacy `aries/` se eliminó, de modo que `mblt-model-zoo <= 2.12` debe fijar una revisión anterior.

## Capacidades

- Clasificación de imágenes en 1 de las categorías del dataset de evaluación (ImageNet); la model card no explicita el número de clases de salida ni el orden de las etiquetas.
- Salida de probabilidades top-1 y top-5; la evaluación reportada usa ambas métricas.
- Inferencia en modo `single` sobre el runtime `qbruntime 1.5.0`, con medición realizada en modo `async`.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No incorpora modo "thinking", visión generativa, audio ni vídeo.
- No se documenta extracción de embeddings ni uso como backbone para detección o segmentación; solo la tarea de clasificación evaluada.

## Casos de uso

- Clasificación visual en el borde sobre aceleradores mobilint: el artefacto está compilado para `qbruntime 1.5.0` con esquema `single`, por lo que encaja en dispositivos con presupuesto de memoria muy ajustado (unos 13,6 MiB de binario) donde no cabe un runtime de propósito general.
- Validación de la toolchain qbcompiler/qbruntime: al reportar una retención de precisión top-1 del 99,72 % frente al modelo de referencia, sirve como caso de prueba de regresión al actualizar compilador o runtime.
- Etiquetado automático y preindexación de catálogos de imágenes: usar la predicción top-5 como etiquetas candidatas para un pipeline de gestión de activos digitales, con revisión humana posterior.
- Moderación y triaje de imágenes subidas por usuarios: clasificación rápida en las categorías de ImageNet para derivar a revisión manual los contenidos sensibles, siempre como primer filtro y no como decisión final.
- Benchmarking interno de hardware: comparar latencia y precisión retenida entre revisiones de acelerador o de runtime usando el protocolo declarado (ImageNet, 50.000 muestras, modo `async`).
- Demostraciones y docencia sobre ViT eficientes: contrastar en hardware real el comportamiento de un transformer de visión de baja complejidad frente a CNN clásicas en la misma plataforma.
- Verificación de integridad en despliegues: el `sha256` publicado permite comprobar la descarga con `sha256sum <file>.mxq` antes de cargar el modelo en producción.
- Advertencia para casos de uso industrial: no se debe plantear fine-tuning ni adaptación a dominios propios (inspección de defectos, medicina, etc.) con este artefacto, ya que solo se distribuye el binario compilado y no los pesos ni el pipeline de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| ImageNet (50.000 muestras) | Top-1 accuracy | 0,79646 | Inferencia `async`, `qbruntime 1.5.0` |
| ImageNet (50.000 muestras) | Top-5 accuracy | 0,94616 | Inferencia `async`, `qbruntime 1.5.0` |
| Retención frente al modelo de referencia | Top-1 relativo | 99,7245 % | Implica una línea base de aproximadamente 0,7987 top-1 |
| Latencia / throughput | — | No disponible | Solo se midió el modo `single`; no se publican tiempos |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay datos de latencia, throughput ni consumo energético, ni comparación con otras variantes ejecutadas en el mismo hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El binario pesa 14.247.469 bytes, pero la memoria de trabajo depende del runtime y del acelerador, extremos que la model card no documenta.
- GPU recomendadas: no aplica. El artefacto MXQv7 está destinado a aceleradores mobilint; no se declara ejecución sobre A100, H100 ni RTX 4090 mediante runtimes estándar.
- Compatibilidad con GPU de consumo: no disponible. No hay evidencia de que pueda ejecutarse en una GPU consumer; el runtime de referencia es `qbruntime 1.5.0`.
- La imagen indicada (`mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04`) es el entorno de compilación, no de inferencia; no debe confundirse con los requisitos de despliegue. La evaluación se realizó con una imagen distinta, `1.4-cpu-ubuntu22.04` (digest sha256:62b5bc714571dffd94fb561275767ca80d15337a433630a3ae7936305d531a7b).
- Opciones de despliegue: `qbruntime 1.5.0`, con `mblt-vision-python` como cliente de referencia. No compatible con vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de lenguaje).
- Latencia y throughput estimados: no disponible.
- Restricción de versión: `mblt-model-zoo <= 2.12` debe fijar una revisión anterior del repositorio, porque el directorio legacy `aries/` fue eliminado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión declarada | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| mobilint/LeViT_192 (este repositorio) | No disponible (paper original: aprox. 10,9 M) | No aplica | Top-1 0,79646 en ImageNet (50k) | Apache-2.0 | MXQv7, 14,2 MB, solo `qbruntime 1.5.0`, esquema `single` |
| LeViT-192 original (paper y pesos de referencia) | No disponible en esta ficha | No aplica | No disponible en esta ficha; la retención del 99,72 % sugiere una base cercana a 0,7987 top-1 | Apache-2.0 | Pesos PyTorch/safetensors en el repositorio original; requiere framework estándar |
| Otras variantes LeViT (128, 224, 256, 384) | No disponible | No aplica | No disponible en esta ficha | Apache-2.0 | Pesos originales; no hay artefactos MXQ documentados aquí |
| CNN eficientes tipo MobileNet o EfficientNet | No disponible | No aplica | No disponible en esta ficha | No disponible en esta ficha | Pesos en safetensors/TFLite; runtimes estándar, sin soporte MXQ |

No se dispone de datos suficientes en la información proporcionada para una comparación cuantitativa fiable con alternativas. La comparación relevante es operativa: este repositorio solo es intercambiable con otros artefactos MXQ de mobilint, no con pesos estándar de la misma arquitectura.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta tool calling ni agentes. Cualquier caso de uso textual queda fuera de alcance.
- El repositorio no contiene los pesos originales ni el grafo en formato estándar, solo un binario MXQv7; no es posible inspeccionar, reentrenar ni convertir el modelo con herramientas convencionales.
- Solo se soporta el esquema de inferencia `single`. No hay constancia de modos batch o multi-stream, lo que limita el throughput agregado.
- Dependencia de una versión concreta de runtime (`qbruntime 1.5.0`); cambios de versión pueden alterar resultados y no hay matriz de compatibilidad publicada.
- Ausencia de información sobre sesgos: no se documenta la composición del dataset de entrenamiento ni análisis de sesgo. ImageNet presenta desequilibrios conocidos entre clases y sesgos geográficos y culturales que se heredan sin cuantificar aquí.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de falsos positivos con alta confianza en clases visualmente próximas; el top-1 del 79,6 % implica que aproximadamente una de cada cinco imágenes se clasifica incorrectamente.
- La model card marca `identity_audit: "absent"` y `protocol: null` en la evaluación, es decir, no hay auditoría de identidad del conjunto de datos ni protocolo de evaluación detallado; la trazabilidad del benchmark es parcial.
- Sin información sobre resolución de entrada, normalización ni preprocesado esperado; usar un pipeline distinto al del autor puede degradar la precisión de forma significativa.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero la licencia no cubre el hardware ni el runtime propietarios necesarios para ejecutarlo, que se rigen por sus propios términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-10-17): no hay evidencia de uso en producción ni validación externa.
- `aries-rb/best_result.json` contiene valores de build heredados que no deben tomarse como resultado vigente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/LeViT_192
- Carpeta de origen en el catálogo arxiv de mobilint: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/image_classification/LeViT_192
- Paper original de LeViT: https://arxiv.org/abs/2104.01136
- Repositorio de referencia de LeViT: https://github.com/facebookresearch/LeViT
- Imagen de compilación: `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04` (digest sha256:7910f1661605b82eb9616f6ac99fd6461dbb865dcadaa810cce22c638ceffd44)
- Runtime de inferencia: `qbruntime 1.5.0` (cliente de referencia `mblt-vision-python`)
