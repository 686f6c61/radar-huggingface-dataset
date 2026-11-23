# MohammedSinan/docres-page-mask-onnx

## Resumen

`MohammedSinan/docres-page-mask-onnx` es una exportación a ONNX de la red de segmentación de máscara de página del modelo DocRes, presentado en el artículo *DocRes: A Generalist Model Toward Unifying Document Image Restoration Tasks* (CVPR 2024) por Jiaxin Zhang, Dezhi Peng, Chongyu Liu, Peirong Zhang y Lianwen Jin. El autor del repositorio, MohammedSinan, declara explícitamente que no es su trabajo: únicamente ha convertido el checkpoint original (`data/MBD/checkpoint/mbd.pkl`) a formato ONNX mediante `torch.onnx.export` con opset 17 e input fijo de 448×448, para facilitar su descarga en un pipeline de build.

Se trata de la etapa de segmentación (DeepLab/ResNet) del modelo de dewarping basado en máscara `MBD` de DocRes. Su función es estrictamente acotada: dado un fotografía de un documento, produce una máscara binaria que indica qué píxeles corresponden a la página de papel, lo que permite recortar la página a sus límites reales antes de pasos posteriores de procesamiento (dewarping, OCR, etc.). No es un modelo de lenguaje ni un modelo generativo: es un segmentador de imágenes de propósito específico.

La relevancia de esta ficha es doble. Por un lado, documenta una pieza concreta y ligera (0,2 GB de repositorio, ~201 MB de pesos fp32) útil para pipelines de digitalización documental. Por otro, advierte de que el artefacto es una conversión de terceros, sin benchmarks propios publicados, sin idiomas declarados y con cero descargas e interacciones en el momento de la consulta, por lo que debe evaluarse contra el original en PyTorch antes de usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de segmentación semántica (etapa DeepLab/ResNet del modelo MBD de DocRes) |
| Parametros totales | no disponible (pesos fp32 de 201.549.351 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; input fijo 448×448) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `page_mask_fp32.onnx`) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma del texto) |
| Licencia | MIT (Copyright (c) 2024 Jiaxin Zhang) |
| Formato de pesos | ONNX (opset 17, input fijo 448×448) |

## Arquitectura y entrenamiento

La red es la etapa de segmentación del modelo `MBD` (mask-based dewarping) de DocRes, descrita en el repositorio del autor como una arquitectura tipo DeepLab con backbone ResNet. El modelo completo DocRes se plantea como un modelo generalista que unifica varias tareas de restauración documental (dewarping, deshadowing, apariencia, binarización y desblur) mediante una formulación de *prompt* de tarea; la máscara de página aquí exportada es el componente que localiza la región del documento dentro de la imagen.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. El autor de la conversión indica únicamente que los pesos provienen del checkpoint `mbd.pkl` del repositorio oficial y que la exportación se realizó sin modificar los pesos. La única innovación técnica documentada en esta ficha es la propia conversión a ONNX con opset 17 e input fijo, que permite ejecutar la inferencia sin dependencia de PyTorch.

## Capacidades

- Segmentación binaria de página: genera una máscara `[1, 1, 448, 448]` en la que los píxeles con valor superior a `100/255` se consideran página.
- Detección de la región de papel para recorte automático: la región conectada de página más grande corresponde a la hoja.
- Preprocesado documental: pensado para ejecutarse antes de etapas de dewarping, corrección de perspectiva u OCR.
- Ejecución ligera sin PyTorch: al estar en ONNX, puede desplegarse con ONNX Runtime u otros runtimes compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: su salida es una máscara, no una descripción.

## Casos de uso

- Recorte automático de páginas fotografiadas: en una app de escaneo móvil, el modelo recibe la foto redimensionada a 448×448 con desenfoque gaussiano 15×15 y devuelve la máscara de página; la región conectada mayor se usa para recortar el papel antes de guardar el PDF.
- Preprocesado en pipelines de OCR: antes de pasar una imagen a un motor OCR, se recorta la página para eliminar fondo, mesa o dedos, reduciendo errores de detección de texto en los bordes.
- Digitalización masiva de archivos: en un proceso por lotes, el modelo actúa como primer filtro para validar que una imagen contiene una página y descartar fotos sin documento.
- Integración en aplicaciones móviles: al ser ONNX de ~201 MB fp32, puede ejecutarse en servidor o en dispositivos con runtime ONNX, sirviendo de paso previo a modelos más pesados de dewarping.
- Corrección de perspectiva en escáneres de sobremesa: la máscara permite estimar los límites de la hoja y alimentar un paso posterior de rectificación geométrica.
- Automatización de ingesta documental: en un sistema de gestión documental, la máscara se usa para normalizar el encuadre de las imágenes antes de almacenarlas o indexarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de IoU, precisión ni comparaciones cuantitativas; solo afirma que, en sus páginas de prueba, las cajas de recorte coinciden exactamente con el original en PyTorch.

## Requisitos de hardware

- VRAM estimada: el fichero fp32 ocupa 201.549.351 bytes (~192 MiB); la inferencia con un único input 448×448 requiere un consumo muy bajo, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos ~1 GB de VRAM libre debería poder ejecutarlo, pero no hay datos oficiales.
- GPU de consumo: previsiblemente cabe en GPUs de consumo (RTX 3060, RTX 4090, etc.), aunque no se confirma en la documentación.
- Despliegue: ONNX Runtime (CPU o GPU) es la vía natural; también podría ejecutarse con otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / input | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MohammedSinan/docres-page-mask-onnx` | Segmentación de página (ONNX) | no disponible (~201 MB fp32) | 448×448 fijo | MIT | Hugging Face (0 descargas) |
| DocRes original (PyTorch) | Restauración documental generalista | no disponible | no disponible | MIT | GitHub oficial |
| Otros segmentadores de documento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de terceros, no el modelo oficial: el autor declara que el trabajo y los pesos son de los autores de DocRes y que solo cambió el formato.
- No se han publicado benchmarks ni métricas de calidad para esta exportación; la única validación es la coincidencia de cajas de recorte en páginas de prueba del autor.
- El input es fijo a 448×448 y requiere un preprocesado concreto (redimensionado y desenfoque gaussiano 15×15); omitirlo puede degradar la máscara.
- El umbral de binarización (`100/255`) y la heurística de "región conectada mayor" son decisiones de uso, no parámetros del modelo; pueden fallar en documentos con varias páginas o fondos con regiones claras.
- No hay información sobre sesgos, idiomas ni dominios de entrenamiento; el rendimiento en documentos no latinos o en condiciones de iluminación extremas no está documentado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en la máscara.
- Licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright y citar a los autores de DocRes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/MohammedSinan/docres-page-mask-onnx
- Repositorio oficial de DocRes: https://github.com/ZZZHANG-jx/DocRes
- Artículo DocRes (CVPR 2024): Jiaxin Zhang, Dezhi Peng, Chongyu Liu, Peirong Zhang, Lianwen Jin. *DocRes: A Generalist Model Toward Unifying Document Image Restoration Tasks.*
