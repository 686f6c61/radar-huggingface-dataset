# HyphenSam/kura-models

## Resumen

HyphenSam/kura-models no es un modelo único, sino un repositorio de artefactos en formato ONNX publicado por el usuario HyphenSam para su propia aplicación. El repositorio ocupa 0,1 GB e incluye, según su model card, al menos dos modelos de visión por computador: `animesharp_v4_rcan_2x.onnx`, orientado al reescalado 2x de imágenes de estilo anime, y `grd_denoiser.onnx`, un modelo de eliminación de ruido.

El interés del repositorio es puramente práctico: son conversiones a ONNX pensadas para su integración en una app, no una publicación de investigación. No se declara pipeline, idiomas, licencia a nivel de repositorio ni resultados de evaluación, y el contador público indica 0 descargas y 0 likes, por lo que se trata de un artefacto personal sin validación comunitaria.

Su relevancia es limitada y acotada: sirve como ejemplo de distribución de modelos de restauración de imagen en ONNX (ejecutables con ONNX Runtime en escritorio, web o móvil), pero la licencia del componente principal es no comercial (CC BY-NC-SA 4.0) y el segundo componente requiere permiso explícito de su autor original, lo que restringe seriamente su reutilización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible a nivel de repositorio; `animesharp_v4_rcan_2x.onnx` apunta por nomenclatura a una red RCAN (Residual Channel Attention Network) de superresolución, dato no confirmado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de visión por computador) |
| Tipos de cuantizacion | no disponible; se distribuyen artefactos ONNX sin detallar precisión (fp32/fp16) ni variantes cuantizadas |
| Idiomas soportados | no disponible (no aplica: procesan imágenes, no texto) |
| Licencia | mixta: `animesharp_v4_rcan_2x.onnx` bajo CC BY-NC-SA 4.0; `grd_denoiser.onnx` con permiso de livinginparadise y sujeción a su autorización; el repositorio en conjunto no declara licencia propia |
| Formato de pesos | ONNX |
| Tarea declarada | conversión de modelos ONNX para una app; reescalado 2x de anime y eliminación de ruido |
| Ficheros citados en la model card | `animesharp_v4_rcan_2x.onnx`, `grd_denoiser.onnx` |
| Tamaño del repositorio | 0,1 GB |
| Tags declarados | onnx, region:us |
| Fecha de creación / actualización | 2026-10-15T16:52:02Z / 2026-10-15T16:59:43Z |

## Arquitectura y entrenamiento

La model card no aporta ningún detalle de arquitectura ni de entrenamiento. El texto se limita a indicar que son «converted ONNX models for my app» y a atribuir la procedencia de cada fichero. `animesharp_v4_rcan_2x.onnx` es una conversión de [Kim2091/2x-AnimeSharpV4](https://huggingface.co/Kim2091/2x-AnimeSharpV4), publicado por Kim2091 bajo CC BY-NC-SA 4.0; el sufijo `rcan` del nombre de fichero sugiere una red con atención por canales residuales, pero esto es una inferencia a partir del nombre y no un dato confirmado. `grd_denoiser.onnx` se usa con permiso de [livinginparadise](https://github.com/livinginparadise), sin más información sobre su arquitectura.

No hay datos sobre número de tokens o imágenes de entrenamiento, composición del dataset, funciones de pérdida, proceso de ajuste (RLHF/DPO no aplica en este dominio) ni innovaciones técnicas. Tampoco se documenta si la exportación a ONNX introduce diferencias numéricas respecto a los pesos originales, algo habitual en conversiones de este tipo.

## Capacidades

- Superresolución de imágenes: reescalado 2x de ilustraciones de estilo anime mediante `animesharp_v4_rcan_2x.onnx`.
- Eliminación de ruido de imagen mediante `grd_denoiser.onnx`, presumiblemente orientado a artefactos de compresión o ruido de escaneo.
- Inferencia multiplataforma vía ONNX Runtime (escritorio, servidor, navegador o móvil) con ejecución en CPU o GPU según el execution provider elegido.
- Procesamiento por lotes de imágenes, al ser modelos de pasada única y sin estado.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales de lenguaje.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No se documentan modos especiales (thinking mode, audio, vídeo con consistencia temporal).

## Casos de uso

- Mejora de ilustraciones en una aplicación de escritorio o móvil: el modelo 2x RCAN puede invocarse desde ONNX Runtime para aumentar la resolución de imágenes de anime antes de mostrarlas o exportarlas, sin depender de servicios en la nube.
- Preprocesado en cascada de imagen: aplicar primero `grd_denoiser.onnx` para limpiar ruido de compresión JPEG y después el modelo 2x para reescalar, una secuencia habitual en pipelines de restauración.
- Limpieza de escaneos de manga o doujinshi: el denoiser puede reducir grano y artefactos de escaneo antes de pasos posteriores de binarizado u OCR.
- Prototipado e integración multiplataforma: al estar en ONNX, sirve como base para validar despliegues con ONNX Runtime Web o con un execution provider móvil en una app propia.
- Procesado local sin conexión: el tamaño total del repositorio (0,1 GB) permite empaquetar los modelos dentro de una aplicación de escritorio y ejecutarlos en el equipo del usuario final.
- Comparación de pipelines de restauración en investigación no comercial: al ser artefactos pequeños y fácilmente intercambiables, permiten evaluar combinaciones de denoiser y upscaler sobre un mismo conjunto de imágenes de prueba.
- Automatización de lotes en servidor: procesar colecciones de imágenes con un script que recorra el sistema de ficheros y aplique el upscaler 2x, siempre que el uso previsto respete la licencia no comercial del componente principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (PSNR, SSIM, LPIPS) ni comparaciones cuantitativas, y el repositorio no ofrece pesos originales de PyTorch ni scripts de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican recuentos de parámetros ni precisión de los artefactos ONNX.
- El repositorio completo ocupa 0,1 GB, por lo que el peso en disco de ambos modelos es bajo en términos absolutos; la memoria necesaria en tiempo de ejecución dependerá del tamaño de las imágenes de entrada y del número de activaciones intermedias, dato no documentado.
- GPU recomendadas: no disponible. Al no haber cifras oficiales, solo cabe señalar que cualquier GPU compatible con ONNX Runtime (por ejemplo, con execution provider CUDA o DirectML) podría ejecutar los modelos; no hay confirmación del fabricante ni del autor.
- GPU de consumo: no confirmado. Por el tamaño reducido del repositorio es razonable esperar que quepan en GPUs de gama consumer, pero se trata de una estimación indirecta, no de un requisito publicado.
- Ejecución en CPU: viable en principio mediante ONNX Runtime, con latencia no documentada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), ONNX Runtime Web, ONNX Runtime Mobile, DirectML, TensorRT y OpenVINO como execution providers compatibles. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `animesharp_v4_rcan_2x.onnx` (este repo) | no disponible | no aplica | no disponible | CC BY-NC-SA 4.0 | ONNX en HuggingFace |
| `grd_denoiser.onnx` (este repo) | no disponible | no aplica | no disponible | permiso explícito del autor original | ONNX en HuggingFace |
| Kim2091/2x-AnimeSharpV4 (modelo original) | no disponible en la información proporcionada | no aplica | no disponible | CC BY-NC-SA 4.0 según la model card | HuggingFace |
| Otras familias de superresolución para anime (waifu2x, Real-ESRGAN, SwinIR) | no disponible | no aplica | no disponible | varía según proyecto | no verificado en la información disponible |

No se dispone de datos verificables de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no comercial: `animesharp_v4_rcan_2x.onnx` está bajo CC BY-NC-SA 4.0, lo que prohíbe el uso comercial y obliga a compartir las obras derivadas bajo la misma licencia.
- `grd_denoiser.onnx` se distribuye con permiso de livinginparadise, pero la model card indica explícitamente que hay que consultarles para usarlo en otro proyecto; su licencia no queda definida en el repositorio.
- El repositorio no declara una licencia propia, lo que genera ambigüedad sobre los términos aplicables al conjunto de los artefactos.
- Especialización de dominio: un upscaler entrenado para anime puede producir artefactos o suavizado excesivo en fotografías o ilustraciones realistas.
- Riesgo de detalle inventado: en superresolución, el modelo puede generar texturas o líneas que no existían en la imagen original; no debe usarse como evidencia forense ni para reconstruir información perdida.
- Ausencia de métricas y de validación: sin PSNR, SSIM ni comparativas, no hay forma de cuantificar la calidad ni de detectar regresiones frente al modelo original.
- Trazabilidad limitada: se desconoce la composición del dataset de entrenamiento original (Kim2091/2x-AnimeSharpV4), por lo que los sesgos estilísticos o de contenido son desconocidos.
- Conversión a ONNX no verificada: no se documenta si la exportación preserva el comportamiento numérico de los pesos originales.
- Actividad mínima: 0 descargas y 0 likes, con creación y última actualización separadas por unos siete minutos, lo que sugiere un repositorio personal sin mantenimiento garantizado ni soporte.
- No apto para tareas de lenguaje: no genera texto, no razona, no ejecuta código y no soporta agentes ni llamadas a herramientas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HyphenSam/kura-models
- Modelo original del upscaler: https://huggingface.co/Kim2091/2x-AnimeSharpV4
- Perfil del autor del upscaler original: https://huggingface.co/Kim2091/
- Perfil GitHub del autor del denoiser: https://github.com/livinginparadise
- Artículo o paper: no disponible
- Blog o demo: no disponible
