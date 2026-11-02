# nile-academy/pp-ocrv6-medium-onnx

## Resumen

pp-ocrv6-medium-onnx es un espejo de pesos ONNX de los modelos de detección y reconocimiento de texto de la familia PP-OCRv6 de PaddlePaddle, en su variante "medium". Lo publica el usuario `nile-academy` (Nile Academy) para consumidores de la plataforma Wekala, con el propósito explícito de fijar las identidades de fichero de los checkpoints originales mediante commits inmutables. No se trata de un modelo entrenado por el publicador: el desarrollo y los derechos pertenecen a PaddlePaddle, y este repositorio solo redistribuye exportaciones ONNX y checkpoints Paddle de inferencia.

El contenido se organiza en dos componentes desplegables, `det/` (detección de cajas de texto) y `rec/` (reconocimiento de caracteres), más los checkpoints originales preservados bajo `original/<source-commit>/`. El repositorio ocupa 0,3 GB e incluye únicamente datos de modelo: no contiene código Python, checkpoints pickle, servidores de inferencia ni código ejecutable.

Es relevante para quienes necesitan un pipeline OCR en dos etapas (detección + reconocimiento) con pesos en formato ONNX y trazabilidad de procedencia verificable, pero conviene subrayar que la propia model card declara que la publicación no certifica precisión OCR, fidelidad de cuantización ni aceptación en dispositivos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR en dos etapas: detector y reconocedor; familia PP-OCRv6 de PaddlePaddle) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR, no generativo de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen exportaciones ONNX; la fidelidad de cuantización no está verificada según la model card) |
| Idiomas soportados | en, zh (según metadatos; la model card advierte que los metadatos de idioma no acreditan calidad probada) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (exportaciones oficiales) y checkpoints Paddle de inferencia originales |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna de los componentes de detección y reconocimiento, ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si se aplicaron fases de ajuste supervisado adicionales. Lo único documentado es la estructura de publicación: un detector (`PP-OCRv6_medium_det`) y un reconocedor (`PP-OCRv6_medium_rec`), cada uno con su checkpoint Paddle original y su exportación ONNX, fijados a commits concretos del repositorio de PaddlePaddle.

La innovación técnica destacable no está en el modelo sino en el mecanismo de publicación: identidades de fichero inmutables, preservación de las model cards originales y de los avisos de licencia upstream, y separación explícita entre los checkpoints Paddle y las exportaciones ONNX. La model card indica que los consumidores deben aportar los assets aprobados a adaptadores compilados cualificados, y que el modelo no se distribuye integrado en el núcleo de Wekala.

## Capacidades

- Detección de regiones de texto en imágenes (componente `det`), generando cajas delimitadoras para su posterior recorte.
- Reconocimiento de texto en las regiones detectadas (componente `rec`), en inglés y chino según los metadatos declarados.
- Despliegue mediante runtime ONNX, sin dependencia de código Python incluido en el repositorio.
- Trazabilidad de procedencia: cada peso está vinculado a un commit upstream concreto.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; es un modelo OCR especializado, no un modelo de lenguaje.
- No se documenta soporte multilingüe más allá de en y zh; la model card menciona que el soporte de árabe es preferente para los consumidores de Wekala pero nunca un criterio de elegibilidad del modelo, y no se acredita calidad probada en ningún idioma.

## Casos de uso

- Digitalización de documentos en inglés y chino: pipeline en dos etapas con `det` para localizar bloques de texto y `rec` para transcribirlos, adecuado para archivos escaneados y facturas.
- Extracción de texto en aplicaciones de escritorio o móvil: al distribuirse como ONNX, los pesos pueden cargarse en runtimes ONNX Runtime en distintos sistemas operativos sin arrastrar el ecosistema Paddle completo.
- Procesamiento por lotes en servidores de documentos: integración en colas de trabajo que reciben imágenes y devuelven texto estructurado, con la ventaja de que el repositorio no incluye servidores ni código ejecutable que auditar.
- Verificación de integridad en cadena de suministro de modelos: uso del repositorio como referencia inmutable (commits fijados, `publication.json` con identidades de fichero) para replicar o auditar un pipeline OCR en producción.
- Preprocesado para sistemas de búsqueda documental: conversión de PDFs e imágenes a texto indexable antes de pasarlo a un motor de búsqueda o a un modelo de lenguaje.
- Evaluación comparativa de motores OCR: al estar en ONNX, permite medir latencia y precisión en el hardware objetivo antes de comprometerse con un stack propietario.
- Repositorio de referencia para entornos con requisitos de licencia: la licencia Apache 2.0 y la preservación de avisos upstream facilitan la revisión legal en despliegues comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la publicación verifica identidades de fichero inmutables, no la precisión OCR, la fidelidad de cuantización, el ajuste a dispositivo ni la aceptación en escritorio, móvil o navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,3 GB) incluye checkpoints Paddle y exportaciones ONNX, por lo que no equivale al peso en memoria de un solo componente en ejecución.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU ni aceleradores soportados.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni se descarta que quepa en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato, pero no se documentan integraciones concretas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a un OCR).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pp-ocrv6-medium-onnx (este) | no disponible | no aplica | no documentado | apache-2.0 | ONNX + checkpoints Paddle, espejo con procedencia fijada |
| PP-OCRv6 medium original (PaddlePaddle) | no disponible | no aplica | no documentado en esta ficha | apache-2.0 | Repositorios upstream de PaddlePaddle |
| Otras variantes de PP-OCRv6 (small, large) | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas OCR de terceros (Tesseract, EasyOCR, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La publicación no certifica precisión OCR: la model card lo declara explícitamente, de modo que cualquier evaluación de calidad debe realizarla el consumidor.
- Idiomas: los metadatos declaran en y zh, pero no se acredita calidad probada en ninguno de los dos; el soporte de árabe es preferente para los consumidores pero no está garantizado por el modelo.
- Fidelidad de cuantización no verificada: si se aplican conversiones o cuantizaciones adicionales sobre los ONNX, sus efectos no están validados por el publicador.
- Ajuste a dispositivo no verificado: no hay garantía de aceptación en escritorio, móvil o navegador.
- El repositorio no incluye código de inferencia, servidores ni adaptadores; el consumidor debe aportar el runtime y los adaptadores compilados cualificados.
- Licencia Apache 2.0 declarada por los upstream, con preservación de avisos; los derechos de autor permanecen en PaddlePaddle y no se inventa ningún titular adicional. Cualquier uso comercial debe revisar los avisos upstream conservados en el repositorio.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo, pero sí existe riesgo de errores de transcripción y de detección en imágenes de baja calidad, sin métricas publicadas que permitan acotarlo.
- Sesgos conocidos: no documentados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nile-academy/pp-ocrv6-medium-onnx
- Detector ONNX upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx/tree/61323801669c338b7891481ec7bac61ce31b576a
- Reconocedor ONNX upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx/tree/50c7eacafc52fa7bcf4194e8cd08e46f8558504b
- Detector Paddle upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det/tree/8e0f56fb2ef86b461d99cfc7ac5c137738985f61
- Reconocedor Paddle upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec/tree/e5a92bcbc5cc1b494628e458d267778f0704fd7c
