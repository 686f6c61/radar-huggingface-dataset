# skillsafe-ai/vit-base-patch16-224

## Resumen

`skillsafe-ai/vit-base-patch16-224` es un artefacto ONNX listo para navegador del conocido clasificador de imágenes ViT-Base/16 a 224x224 píxeles, publicado por SkillSafe a partir del export de Xenova (`Xenova/vit-base-patch16-224`, commit `66fef688e8dbe77dd9d5aa256353f9ad8b0ef799`). No es un modelo nuevo ni reentrenado: es una importación byte a byte del upstream, verificada con `onnx.checker` y con una prueba de humo en CPU, pensada para ejecutarse íntegramente en el cliente mediante `onnxruntime-web` (WebGPU o WASM) o vía transformers.js.

El modelo resuelve una tarea muy concreta: clasificación de imágenes en 1000 clases de ImageNet-1k. Su valor no está en la precisión, sino en el empaquetado reproducible y ligero (0,4 GB de repositorio, con una variante cuantizada de 84,17 MB) y en la trazabilidad criptográfica de cada fichero mediante SHA-256, algo poco habitual en artefactos publicados en HuggingFace.

Es relevante ahora porque la inferencia local en navegador se ha vuelto práctica: con una variante q8 de menos de 100 MB y latencias de decenas de milisegundos en CPU, se pueden ofrecer funciones de visión sin enviar imágenes a un servidor, lo que simplifica el cumplimiento de privacidad (RGPD) y reduce costes de infraestructura. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parámetros totales | Aproximadamente 86 millones, estimados a partir del tamaño del fichero fp32 (330,48 MB); no se declara explícitamente en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen fija de 224x224x3 canales, que con patch 16 produce 196 parches más el token CLS |
| Tipos de cuantización | fp32 (`onnx/model.onnx`) y q8 (`onnx/model_quantized.onnx`); el método exacto de cuantización no se especifica |
| Idiomas soportados | No aplica (modelo de visión); salida de 1000 clases de ImageNet-1k, etiquetas presumiblemente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11); `config.json` y `preprocessor_config.json` en JSON |

Ficheros incluidos en el repositorio:

| Fichero | Clase | Tamaño | SHA-256 |
|---|---|---|---|
| `config.json` | bundle | 0,07 MB | `ba68592930f3a1aa36c96630d374018d02c09fa59a7e38a3978613cadba02af4` |
| `onnx/model.onnx` | registry (fp32) | 330,48 MB | `4bafe23c7e2650856449a792eafcc1d3bab4a2f41bcf58c9f3eac99d98719fcc` |
| `onnx/model_quantized.onnx` | registry (q8) | 84,17 MB | `fe13a717a54c0f6ef1a966e0dd67a82e532e0898018fc50f7c37d437c225074a` |
| `preprocessor_config.json` | bundle | 0,00 MB | `b09d2030f83f2a59d12c717d41a9135a3f0c1ba0a2a5df694dbc40f77735daed` |

Cadena de procedencia declarada:

| Campo | Valor |
|---|---|
| Upstream | `Xenova/vit-base-patch16-224`, commit `66fef688e8dbe77dd9d5aa256353f9ad8b0ef799` |
| Receta de conversión | `recipes/vit-base-patch16-224.yaml`, SHA-256 `25150f00fb18af528acf2f49617699b573d5fef4dc30d53576acbb8ec05689bc` |
| Toolchain | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |
| Fecha de conversión | 2026-09-22T21:52:59+00:00 |
| Origen de los pesos | Google, ViT-base/16-224, licencia Apache-2.0; export ONNX de Xenova |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar en su configuración Base con parches de 16x16 sobre imágenes de 224x224. La nomenclatura "ViT-Base/16" implica la configuración canónica del transformer de visión (12 capas, 12 cabezas de atención, dimensión oculta 768), aunque la model card de este repositorio no detalla la configuración interna ni el número exacto de parámetros. La entrada es un tensor `pixel_values` de tipo float32 con forma `[batch_size, num_channels, height, width]` y la salida es un tensor `logits` float32 de forma `[batch_size, 1000]`. El grafo usa opset 11 de ONNX.

No ha habido entrenamiento ni ajuste alguno por parte de SkillSafe: la model card indica explícitamente "Imported as published upstream (no conversion)". Por tanto, los pesos son los del modelo original de Google `google/vit-base-patch16-224`, preentrenado sobre ImageNet y afinado para clasificación en las 1000 clases de ImageNet-1k, que es lo que anuncia el título del repositorio. Los detalles del dataset de preentrenamiento (composición, número de imágenes y si hubo fases de ajuste fino adicionales) no se documentan en la información proporcionada; el título solo indica "ImageNet-1k classification".

La innovación técnica aquí no está en el modelo, sino en el proceso de empaquetado: conversión reproducible desde una fuente fijada por commit, verificación de integridad por SHA-256 de cada fichero, validación del grafo con `onnx.checker` y prueba de humo en CPU con entradas rellenas de ceros a las formas declaradas. El repositorio mantiene además un `manifest.json` con la receta, las fuentes, el toolchain (incluido el hash de `uv.lock`) y los números de verificación por fichero.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k (una única etiqueta por imagen, sin detección de cajas ni segmentación).
- Inferencia en el navegador mediante `onnxruntime-web`, con ejecución por WebGPU o WASM; el ejemplo de la model card crea la sesión directamente desde una URL de HuggingFace.
- Compatibilidad con transformers.js para integración en aplicaciones web con una API de alto nivel.
- Ejecución en CPU con onnxruntime (Python, C++ u otros lenguajes con bindings), sin necesidad de GPU.
- Funcionamiento offline una vez descargados los pesos, lo que permite aplicaciones instalables tipo PWA.
- No soporta *tool calling* ni *function calling*.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No tiene modo *thinking*, ni entrada de texto, ni audio, ni vídeo.
- No genera texto: la salida es un vector de logits de 1000 dimensiones.
- La capacidad multilingüe no aplica, ya que no procesa lenguaje natural.

## Casos de uso

- Clasificación privada en el navegador: la variante q8 (84,17 MB) se descarga una vez y clasifica imágenes localmente con WebGPU o WASM, de modo que la imagen del usuario nunca sale de su dispositivo. Es el escenario que justifica el empaquetado de este repositorio.
- Moderación previa de contenido subido: en un formulario web o una app móvil, el modelo puede etiquetar la imagen en el cliente antes de enviarla al servidor y bloquear o marcar categorías no permitidas, reduciendo coste de ancho de banda y de cómputo en backend.
- Etiquetado automático de catálogos: asignación de categorías aproximadas a imágenes de producto, inventario fotográfico o bibliotecas de recursos, usando las 1000 clases como taxonomía base o como señal de entrada para un clasificador propio posterior.
- Pre-anotación en pipelines de etiquetado de datos: generación de etiquetas preliminares con su logit asociado para priorizar la revisión humana (active learning), aprovechando que la inferencia es barata y se puede ejecutar en el propio portátil del anotador.
- Aplicaciones de accesibilidad: identificación de la categoría dominante de una foto para alimentar descripciones breves o etiquetas de navegación, siempre que el objeto pertenezca a alguna de las 1000 clases de ImageNet.
- Control de calidad visual en entornos de baja conectividad: en plantas o almacenes con red limitada, un equipo con CPU puede ejecutar la variante fp32 (25,2 ms medidos en la prueba de humo) para clasificar piezas o productos contra una taxonomía predefinida, sin depender de un servicio en la nube.
- Componente de visión en asistentes locales: dentro de una aplicación de escritorio o extensión de navegador que ya procesa otros datos localmente, aporta una señal de categoría visual sin introducir una dependencia de red adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (ImageNet top-1/top-5, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. La model card solo documenta una prueba de humo de correctitud de formas y tiempos de ejecución en CPU con entradas de ceros, que se reproduce a continuación por su valor como orden de magnitud, no como benchmark de producción:

| Fichero | Entradas | Salidas | Tiempo (ms) |
|---|---|---|---|
| `onnx/model.onnx` (fp32) | `pixel_values[1, 3, 224, 224]` | `logits[1, 1000]` | 25,2 |
| `onnx/model_quantized.onnx` (q8) | `pixel_values[1, 3, 224, 224]` | `logits[1, 1000]` | 19,3 |

Contexto de la medición: onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64 (CPU), *batch size* 1, entradas rellenas de ceros. No se especifican la CPU exacta, el número de hilos ni si se aplicaron optimizaciones de grafo.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante fp32 ocupa 330,48 MB de pesos, por lo que cabe holgadamente en menos de 1 GB de VRAM incluyendo el runtime y los búferes intermedios; la variante q8 ocupa 84,17 MB y se mantiene por debajo de los 300 MB en la práctica.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (integrada moderna incluida) es suficiente para la variante q8; para fp32, GPUs de gama media como RTX 3060 o superiores no suponen ningún cuello de botella. No requiere A100, H100 ni ningún acelerador de centro de datos.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, y también en CPUs convencionales e incluso en dispositivos móviles con la variante cuantizada.
- Opciones de despliegue: `onnxruntime-web` (WebGPU, WASM) para navegador, transformers.js para integración web de alto nivel, y onnxruntime nativo (Python, C++, C#, Java) para escritorio y servidor. vLLM, TGI, llama.cpp y Ollama no son aplicables: están orientados a modelos generativos de lenguaje, no a un clasificador de visión ONNX.
- Latencia y throughput estimados: 25,2 ms por imagen en fp32 y 19,3 ms en q8, en *batch size* 1 y CPU arm64, según la prueba de humo del propio repositorio. Con batching se amortiza parte del coste fijo, pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto/entrada | Licencia | Enfoque |
|---|---|---|---|---|---|
| `skillsafe-ai/vit-base-patch16-224` | ONNX fp32 + q8 | 330,48 MB / 84,17 MB (repo 0,4 GB) | Imagen fija 224x224 | Apache-2.0 | Artefacto verificado y reproducible para navegador |
| `Xenova/vit-base-patch16-224` (upstream) | Export ONNX para transformers.js | No disponible en la información proporcionada | Imagen fija 224x224 | Apache-2.0 | Mismo grafo; origen de esta importación |
| `google/vit-base-patch16-224` (original) | No disponible | No disponible | Imagen fija 224x224 | Apache-2.0 | Pesos originales en PyTorch |
| Clasificadores ligeros tipo MobileNetV2/V3 | No disponible | No disponible | Imagen típicamente 224x224 | No disponible | Alternativa de menor coste computacional, no comparada aquí |

La comparación cuantitativa de precisión con alternativas no es posible con la información disponible: no se publican cifras de top-1 ni top-5 para ninguno de los modelos listados. La diferencia real entre las tres primeras filas es de empaquetado y trazabilidad, no de comportamiento: comparten los mismos pesos.

## Limitaciones y advertencias

- No se publican métricas de precisión. La única verificación documentada es de formas y tiempos con entradas de ceros, que no dice nada sobre la exactitud del modelo.
- La salida está restringida a las 1000 clases de ImageNet-1k. Cualquier imagen cuya categoría no esté en esa taxonomía recibirá igualmente una etiqueta forzada, con el consiguiente riesgo de clasificación incorrecta.
- Sesgos heredados del dataset de preentrenamiento original. No se documenta ningún análisis de sesgo, y las clases de ImageNet no están equilibradas desde el punto de vista demográfico.
- No hay verificación de robustez frente a imágenes adversarias, dominios fuera de distribución, baja iluminación, oclusiones o cambios de resolución. Para uso en producción se recomienda validar con datos propios.
- El fichero de etiquetas no aparece listado entre los ficheros del repositorio; la correspondencia entre índices y nombres de clase debe obtenerse del `config.json` o del repositorio upstream, y conviene verificarla antes de desplegar.
- La model card indica que los ficheros marcados como `registry` se sirven desde `models.skillsafe.ai` una vez vetados. Conviene confirmar la disponibilidad y las condiciones de servicio de ese endpoint si se va a depender de él en producción, en lugar de servirlos desde el propio repositorio de HuggingFace.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución. Se debe conservar el aviso de licencia y la atribución indicada (Google como autor de los pesos originales, Xenova como autor del export ONNX). La receta de conversión y la model card son parte del repositorio de SkillSafe y llevan su propia licencia.
- La cuantización q8 puede degradar ligeramente la precisión respecto a fp32. No se documenta la pérdida medida, por lo que conviene comparar ambas variantes sobre el conjunto de validación propio antes de elegir.
- No es un modelo generativo: no produce descripciones, no responde a preguntas y no acepta entrada de texto. Cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/vit-base-patch16-224
- Modelo upstream: https://huggingface.co/Xenova/vit-base-patch16-224/tree/66fef688e8dbe77dd9d5aa256353f9ad8b0ef799
- Modelo original de Google: https://huggingface.co/google/vit-base-patch16-224
- Aviso de licencia del modelo original: https://huggingface.co/google/vit-base-patch16-224/blob/main/README.md
- Repositorio con la receta de conversión: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Referencia de la arquitectura ViT: https://arxiv.org/abs/2010.11929 (no aportada por la búsqueda web; incluida por ser la publicación canónica de la arquitectura)

Nota sobre la búsqueda web: los resultados devueltos corresponden a foros y comunidades de Roblox (herramientas de scripting, listas de caracteres Unicode, configuración de Fast Flags) y no guardan ninguna relación con este modelo ni aportan información adicional sobre él. No se han encontrado papers, blogs, demos ni repositorios adicionales específicos de `skillsafe-ai/vit-base-patch16-224`.
