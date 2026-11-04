# Docglasses-AI/hc-mts-skin-triage-onnx-fp16

## Resumen

HC-MTS skin triage es un paquete de tres cabezas de clasificación de imágenes dermatológicas exportadas a ONNX en FP16, pensadas para inferencia en dispositivo (ONNX Runtime con CPUExecutionProvider) dentro de la aplicación Android DocGlasses. El modelo base es ConvNeXt-Base y la tarea es un triaje jerárquico de lesiones cutáneas: primero una compuerta que distingue piel sana de lesión y detecta si la imagen no es piel, después una clasificación en tres clases (maligno / benigno neoplásico / no neoplásico) y, solo para el caso no neoplásico, una clasificación fina en 12 familias que incluye cicatriz y cicatriz de acné.

Cada uno de los tres grafos ocupa unos 175 MB, lo que da un repositorio de aproximadamente 0,5 GB, y todos comparten el mismo contrato de tensores: entrada `float32` NCHW de `[1,3,384,384]` en RGB con valores 0-255 (el grafo aplica la normalización `/255` y media/desviación típica de ImageNet) y salida `logits` de `[1,C]`. Los pesos se almacenan en FP16 dentro del grafo, pero los tensores de entrada y salida se mantienen en float32, una decisión habitual para maximizar compatibilidad con aceleradores móviles.

El interés del modelo es acotado pero claro: demuestra un patrón de despliegue de triaje dermatológico en móvil con umbrales de abstención calibrados y temperaturas por cabeza, algo poco frecuente en modelos de este tamaño publicados en HuggingFace. Ahora bien, el autor lo etiqueta explícitamente como *research use only*, no es un dispositivo médico y no constituye un diagnóstico, y la licencia del artefacto no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Base (tres cabezas: gate, L1 y L1.5), exportadas a ONNX |
| Parametros totales | no disponible (tres grafos de ~175 MB cada uno en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 384x384) |
| Tipos de cuantizacion | FP16 en los pesos del grafo; entrada y salida en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`), FP16 en el grafo |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Base, una red convolucional pura con diseño inspirado en transformers (profundización con convoluciones 7x7, normalización LayerNorm y activación GELU). Sobre el mismo backbone se han entrenado tres cabezas independientes que forman un pipeline jerárquico: la compuerta `gate_convnext` produce una softmax de dos vías (lesión / sin hallazgo) más un logit adicional con sigmoide para detectar imágenes que no son piel; `l1_convnext` clasifica en maligno, benigno neoplásico y no neoplásico; y `l15_convnext` refina únicamente las predicciones no neoplásicas en 12 familias, incluyendo cicatriz y cicatriz de acné. Los tres grafos tienen tamaños casi idénticos (175.359.346 bytes para gate y L1, 175.377.798 para L1.5), lo que sugiere el mismo backbone con cabezas de distinta dimensionalidad.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste fino con RLHF o DPO (no aplicable en clasificación de imágenes). Sí se indica que las imágenes de entrenamiento provienen de conjuntos con licencias propias, entre ellos ISIC (CC-BY-NC), SCIN y Fitzpatrick17k (CC-BY-NC-SA), y que el modelo se distribuye como espejo del repositorio `Gowtham25/hc-mts-models`, carpeta `mobile/`. La innovación técnica destacable es la calibración por cabeza: temperaturas específicas (softmax con T=0,8 en L1, softmax directa en L1.5) y umbrales de abstención explícitos (0,727 en L1, 0,4 en L1.5, 0,65 para no-piel y 0,62 para sano en la compuerta), un patrón de *selective classification* que permite al sistema rechazar casos ambiguos en lugar de forzar una predicción.

## Capacidades

- Clasificación binaria de triaje: distingue piel sana de lesión cutánea mediante la compuerta.
- Detección de imágenes que no son piel (logit con sigmoide y umbral de 0,65), útil para filtrar entradas inválidas en la app.
- Clasificación de malignidad en tres clases: maligno, benigno neoplásico y no neoplásico.
- Clasificación fina en 12 familias dermatológicas para casos no neoplásicos, incluyendo cicatriz y cicatriz de acné.
- Abstención calibrada por umbral: devuelve "no concluyente" cuando la probabilidad máxima no supera el umbral de la cabeza correspondiente.
- Inferencia en dispositivo con ONNX Runtime en CPU, sin necesidad de GPU ni de conexión de red.
- Procesamiento de imagen con preprocesado definido: redimensionado del lado mayor a 384 y relleno centrado en negro.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Triaje previo a consulta dermatológica: la compuerta filtra imágenes sin lesión y el pipeline L1/L1.5 devuelve una familia con abstención cuando la confianza es baja, de modo que el caso se deriva a revisión profesional en lugar de forzar una etiqueta.
- Filtrado de calidad de imagen en aplicaciones de captura: el logit de "no-piel" con umbral 0,65 permite descartar fotos mal encuadradas o de otras partes del cuerpo antes de procesarlas.
- Investigación en clasificación jerárquica dermatológica: los tres grafos con umbrales y temperaturas documentados permiten reproducir y comparar estrategias de abstención sobre ISIC, SCIN o Fitzpatrick17k.
- Prototipado de apps Android offline: al ser ONNX FP16 con CPUExecutionProvider, se integra en un APK sin dependencias de servidor y con un coste de almacenamiento de unos 0,5 GB para el paquete completo.
- Evaluación de sesgo por tono de piel: al entrenar con Fitzpatrick17k entre otras fuentes, sirve como base para auditar el comportamiento del modelo en distintos fototipos, siempre en entorno de investigación.
- Docencia y demostraciones de despliegue móvil de modelos médicos: el contrato de tensores explícito y el script de ejemplo en Python facilitan reproducir el pipeline en un cuaderno antes de portarlo a Android.
- Segunda opinión en herramientas de documentación clínica: como señal auxiliar (nunca como diagnóstico) que marque casos candidatos a revisión prioritaria dentro de un flujo supervisado por especialistas.

## Benchmarks y rendimiento

El repositorio incluye un `benchmark_report.json` con la concordancia FP16 frente a PyTorch y la latencia en CPU, pero los valores concretos no están incluidos en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM: no aplica en el caso de uso previsto (inferencia en CPU); en GPU, cada grafo de ~175 MB en FP16 requiere del orden de 0,2-0,4 GB de memoria, aunque no se han publicado mediciones.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU móvil vía ONNX Runtime.
- GPU de consumo: al ser un ConvNeXt-Base de ~88M de parámetros por grafo en FP16, cabría en cualquier GPU de consumo moderna (RTX 3060 en adelante), aunque no es el escenario objetivo ni hay datos de rendimiento publicados.
- Despliegue: ONNX Runtime con `CPUExecutionProvider`; también podría ejecutarse con otros proveedores de ONNX Runtime (CUDA, CoreML, NNAPI) sin cambios en el contrato de tensores, aunque no está documentado.
- Latencia y throughput: el autor publica un `benchmark_report.json` con latencia en CPU, pero los valores no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HC-MTS skin triage (este) | ConvNeXt-Base, 3 cabezas ONNX FP16 | no disponible (~88M por grafo, estimado) | 384x384 RGB | no disponible | HuggingFace, repo de 0,5 GB |
| Modelos de clasificación ISIC en HuggingFace | habitualmente ResNet/EfficientNet | variable | variable | variable segun autor | no verificado en esta busqueda |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría; los modelos públicos de triaje dermatológico varían ampliamente en arquitectura, datos y licencia, y no se han verificado en esta ficha.

## Limitaciones y advertencias

- El autor declara explícitamente "research use only": no es un dispositivo médico y no constituye un diagnóstico; no debe usarse para decisiones clínicas sin supervisión profesional.
- Licencia del artefacto no declarada, lo que impide determinar condiciones de uso comercial del modelo exportado.
- Las imágenes de entrenamiento provienen de ISIC (CC-BY-NC), Fitzpatrick17k (CC-BY-NC-SA) y SCIN, con cláusulas no comerciales que condicionan cualquier uso comercial derivado.
- Riesgo de sesgo por fototipo de piel y por desequilibrio entre clases, dado que las fuentes de datos dermatológicos públicos están desigualmente representadas; no se documentan métricas por subgrupo.
- Riesgo de alucinación en sentido amplio: el modelo puede asignar una familia con alta confianza a una imagen fuera de distribución; los umbrales de abstención mitigan pero no eliminan este riesgo.
- Sin datos publicados de sensibilidad, especificidad ni AUC en la información disponible, lo que impide evaluar su comportamiento clínico.
- Dependencia de un preprocesado muy concreto (redimensionado del lado mayor a 384 y relleno negro centrado); desviarse de él degrada las predicciones sin aviso.
- El pipeline es jerárquico: un error en la compuerta o en L1 propaga el fallo a L1.5, que solo se ejecuta para la clase no neoplásica.
- Sin soporte multilingüe ni generativo; no es adecuado para tareas de texto, razonamiento o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Docglasses-AI/hc-mts-skin-triage-onnx-fp16
- Repositorio de origen (espejo): https://huggingface.co/Gowtham25/hc-mts-models
- ISIC (fuente de datos, CC-BY-NC): https://www.isic-archive.com
- Fitzpatrick17k (fuente de datos, CC-BY-NC-SA): https://github.com/mdfarhaan/Fitzpatrick17k
- SCIN (fuente de datos): https://github.com/google-research-datasets/scin
- ONNX Runtime: https://onnxruntime.ai
