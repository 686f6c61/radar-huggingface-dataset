# elnemer7/ElNeMeR-Victim-Image-Splice-Innocence-ONNX

## Resumen

ElNeMeR-Victim-Image-Splice-Innocence-ONNX es un clasificador binario/multiclase exportado a ONNX, desarrollado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI), orientado a la defensa forense de víctimas de difamación mediante manipulación de imágenes. El modelo analiza un vector de 20 características (`splice_innocence_features`) extraídas de un retrato y emite probabilidades sobre tres clases: retrato auténtico sin modificar, empalme cabeza-cuerpo con discontinuidad de iluminación en cuello-cuello de camisa, y composición generativa por inpainting corporal.

El modelo se presenta como parte de una flota de 50 modelos forenses y humanitarios del mismo autor. Su propuesta de valor es detectar fabricaciones de imágenes usadas para chantaje o difamación, un nicho poco cubierto por los clasificadores forenses genéricos, que suelen centrarse en detección de deepfakes faciales o de imágenes sintéticas completas y no en empalmes cabeza-cuerpo.

La información pública es escasa: el repositorio de Hugging Face tiene 0 descargas y 0 likes, un tamaño de 0.0 GB (lo que sugiere que los pesos no están subidos o son de tamaño despreciable) y no se especifica pipeline, idiomas ni datos de entrenamiento. La model card aporta únicamente la precisión de calibración (89,62 %), el opset de ONNX (14) y la forma del tensor de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador sobre vector de 20 características; no se especifica la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX float32) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna: la model card solo indica que la entrada es un tensor `float32` de forma `[batch_size, 20]` denominado `splice_innocence_features` y que la salida es un vector de probabilidades sobre tres clases. Por la forma de la entrada, se trata de un clasificador tabular que opera sobre características preextraídas (presumiblemente descriptores de discontinuidad de iluminación en la zona cuello-cuello de camisa, saltos de crominancia de piel y fronteras de inpainting generativo), no de un modelo de visión extremo a extremo.

No se han publicado detalles sobre el dataset de entrenamiento, el número de muestras, la composición de clases, el proceso de anotación ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta el pipeline de extracción de las 20 características, lo que impide reproducir el preprocesado a partir de una imagen RGB.

La única métrica declarada es una "calibración" del 89,62 %, sin especificar si corresponde a accuracy, a calibración probabilística (ECE) o a otra medida, ni sobre qué conjunto de validación se calculó.

## Capacidades

- Clasificación de retratos en tres clases: auténtico, empalme cabeza-cuerpo por iluminación y composición por inpainting generativo.
- Detección de discontinuidades de iluminación en la zona de cuello y cuello de camisa.
- Detección de saltos de crominancia en la piel entre regiones de la imagen.
- Detección de fronteras de inpainting generativo en el cuerpo.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), según declara la model card.
- Inferencia en servidor mediante `onnxruntime`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión extremo a extremo: requiere un extractor de características externo que produzca el vector de 20 dimensiones.

## Casos de uso

- Apoyo pericial en casos de difamación: el clasificador puede actuar como triaje previo sobre imágenes aportadas como prueba, señalando candidatas a empalme cabeza-cuerpo antes de la revisión manual de un perito.
- Defensa frente a chantaje con imágenes manipuladas: integrado en una plataforma de recepción de denuncias, permite clasificar automáticamente los archivos y priorizar los que presentan indicios de composición generativa.
- Moderación de contenido en plataformas: filtro de segunda etapa para imágenes denunciadas por suplantación o montaje, usando la salida probabilística como señal de escalado a revisión humana.
- Verificación en flujos de prensa y redes sociales: comprobación rápida de retratos sospechosos antes de su publicación, con la ventaja de que la inferencia ONNX puede ejecutarse en el navegador del editor sin enviar la imagen a un servidor.
- Herramienta de formación forense: uso docente para ilustrar qué señales (iluminación, crominancia, fronteras de inpainting) discriminan un empalme de un retrato auténtico.
- Integración en pipelines de ONNX Runtime en producción: al ser un grafo ONNX de opset 14, puede desplegarse con `onnxruntime` en CPU o GPU y con `onnxruntime-web` en cliente, sin dependencias de frameworks de deep learning pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una "calibración" del 89,62 %, sin especificar la métrica exacta ni el conjunto de evaluación, por lo que no se puede comparar con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 `float32`, por lo que el modelo es presumiblemente de tamaño muy reducido (kilobytes o pocos megabytes).
- GPU recomendadas: no se requieren; un clasificador de esta forma de entrada puede ejecutarse en CPU.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo e, incluso, en el navegador mediante WASM.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM) y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles; por el tamaño de la entrada se espera latencia despreciable, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección de empalmes cabeza-cuerpo con salida ONNX y clasificación en tres clases; los detectores forenses públicos habituales (deepfake facial, detección de imágenes sintéticas) abordan tareas distintas y no se dispone de sus métricas en este contexto para una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia de documentación sobre arquitectura, datos de entrenamiento y metodología de evaluación: no es posible auditar el modelo ni reproducir sus resultados.
- La única métrica declarada (89,62 %) no especifica qué mide ni sobre qué conjunto, lo que impide valorar su fiabilidad.
- Requiere un extractor de características externo que genere el vector de 20 dimensiones; sin él, el modelo no es utilizable sobre imágenes RGB.
- Riesgo de falsos positivos y negativos en retratos con iluminación compleja, retoque fotográfico legítimo o compresión agresiva; no se documentan curvas ROC, matrices de confusión ni umbrales recomendados.
- Riesgo de alucinación en sentido amplio: un clasificador puede producir una probabilidad alta en una clase incorrecta sin señal de incertidumbre calibrada verificable.
- Sesgos potenciales desconocidos: no se documenta la diversidad de tonos de piel, condiciones de iluminación ni demografía del conjunto de entrenamiento, algo crítico en un modelo que analiza crominancia de piel.
- Uso forense: no debe emplearse como prueba pericial autónoma; la model card no indica validación independiente ni acreditación.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar el aviso de copyright.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB: verificar que los pesos estén efectivamente disponibles antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Victim-Image-Splice-Innocence-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
