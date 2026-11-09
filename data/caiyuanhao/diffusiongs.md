# CaiYuanhao/DiffusionGS

## Resumen

DiffusionGS es un modelo de generación y reconstrucción 3D a partir de una sola imagen (image-to-3D), presentado en ICCV 2025 por Yuanhao Cai y colaboradores. A diferencia de los pipelines en varias etapas habituales (que primero estiman una representación intermedia y luego optimizan una malla o un campo de radiancia), DiffusionGS integra las Gaussian Splatting directamente en el proceso de denoising de un modelo de difusión, de modo que la salida del denoiser ya es una nube de puntos gaussianos 3D utilizable. El repositorio de Hugging Face contiene tres checkpoints entrenados para generación a nivel de objeto y de escena, con resoluciones espaciales de 256x256 y 512x512.

El modelo aborda dos problemas prácticos: la lentitud de los pipelines multi-etapa y la dificultad de escalar la generación 3D más allá de objetos aislados. Al producir Gaussian Splatting en una sola etapa, permite previsualizar y exportar geometría (malla en el caso de objeto) con un coste computacional menor que el de enfoques de optimización por instancia. La model card incluye comparaciones cualitativas frente a Hunyuan3D-v2.5, en las que el autor afirma obtener mejores resultados.

La relevancia actual reside en la madurez de las Gaussian Splatting como representación 3D eficiente y en la consolidación de los modelos de difusión como generadores 3D. DiffusionGS se publica bajo licencia Apache 2.0, con demos online para objeto y escena, lo que facilita su evaluación sin instalación local. El repo ocupa 11,3 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con denoiser que predice Gaussian Splatting (integración de 3DGS en el proceso de denoising); detalles de backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 11,3 GB; la model card no detalla safetensors, GGUF ni checkpoint binario) |

## Arquitectura y entrenamiento

DiffusionGS plantea un generador de difusión de una sola etapa en el que el denoiser opera directamente sobre representaciones de Gaussian Splatting, en lugar de sobre un espacio latente intermedio que luego se decodifica a malla o a campo de radiancia. La model card describe el resultado como "baking Gaussian Splatting into Diffusion Denoiser", es decir, la red aprende a predecir los parámetros de las gaussianas (posición, covarianza, opacidad y color) durante el proceso de denoising condicionado por la imagen de entrada. Se ofrecen tres checkpoints: objeto a 256x256, objeto a 512x512 y escena a 512x512; el pipeline de objeto admite además exportación a malla.

No se han publicado en la información disponible el número de parámetros, la composición exacta del dataset de entrenamiento, el número de tokens o imágenes vistas, ni si se emplearon etapas de RLHF/DPO (no aplicables en este dominio) o fine-tuning con preferencias. La comparación cualitativa con Hunyuan3D-v2.5 sugiere entrenamiento sobre datos de objetos (ABO, GSO) y escenas, pero los detalles cuantitativos del corpus no están disponibles. La innovación técnica principal es la unificación de generación y representación en una sola pasada de difusión, lo que evita la optimización por instancia típica de los pipelines basados en NeRF o en 3DGS optimizado.

## Capacidades

- Generación 3D a partir de una única imagen de referencia, a nivel de objeto y de escena.
- Salida en nube de puntos gaussianos (Gaussian Splatting) directamente previsualizable y descargable.
- Exportación a malla en el caso de generación de objetos.
- Renderizado de vídeo para escenas generadas (según la demo de escena).
- Dos resoluciones espaciales: 256x256 y 512x512.
- Acepta imágenes de entrada reales y también imágenes sintéticas generadas por modelos de difusión 2D (la model card muestra ejemplos con Stable Diffusion y FLUX).
- No dispone de tool calling, function calling, razonamiento multi-paso textual ni capacidades de agente; no es un modelo de lenguaje.
- Capacidades multilingües no aplicables: la model card declara únicamente inglés como idioma asociado a los metadatos.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de una foto o un render 2D se obtiene una nube gaussiana y, en el caso de objeto, una malla exportable que puede importarse en motores como Unity o Unreal para blockouts y pruebas de escala.
- Reconstrucción de objetos para comercio electrónico: generar una representación 3D visualizable a partir de la imagen de catálogo de un producto, con la ventaja de que la inferencia en una sola etapa reduce el tiempo frente a pipelines de optimización por instancia.
- Generación de escenas para previsualización arquitectónica: el checkpoint de escena a 512x512 permite obtener una representación gaussiana navegable de un entorno a partir de una sola vista, útil para revisiones tempranas de diseño.
- Enriquecimiento de datasets 3D: usar el modelo para generar variaciones gaussianas de objetos a partir de imágenes 2D existentes y ampliar corpus de entrenamiento para otras tareas de visión 3D.
- Creación de contenido para realidad aumentada y virtual: exportar mallas de objeto para visores o visores web que consuman glTF, aprovechando la licencia Apache 2.0 para integración comercial.
- Investigación en generación 3D: servir como baseline reproducible de difusión de una etapa frente a enfoques multi-etapa, con demos públicas para comparación cualitativa.
- Automatización de catalogación 3D en pipelines internos: integrar el modelo como servicio de image-to-3D detrás de una API para procesar lotes de imágenes y devolver nubes gaussianas o mallas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye comparaciones cualitativas con Hunyuan3D-v2.5, sin tablas de métricas (PSNR, LPIPS, Chamfer Distance, F-Score u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repo (11,3 GB) sugiere que los pesos completos de los tres checkpoints requieren al menos esa magnitud de almacenamiento, pero no se detalla la VRAM por checkpoint ni por resolución.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la model card.
- Viabilidad en GPU de consumo: no confirmada. Las demos online de Hugging Face Spaces permiten probar el modelo sin hardware local, lo que sugiere que el autor ha desplegado la inferencia en infraestructura propia, pero no se indica qué GPU utiliza.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión 3D). El código está disponible en el repositorio de GitHub Open-DiffusionGS; los detalles de instalación y dependencias deben consultarse allí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DiffusionGS | Difusión de una etapa con 3DGS integrado | Imagen única | Gaussian Splatting (+ malla en objeto) | 256x256 y 512x512 | Apache 2.0 | Pesos en HF, código en GitHub, demos online |
| Hunyuan3D-v2.5 | Pipeline image-to-3D de Tencent | Imagen única | Malla texturizada | no disponible | no disponible en esta ficha | Pesos y demo públicos |
| TripoSR | Reconstrucción feed-forward (triplano) | Imagen única | Malla | no disponible | MIT (según conocimiento público, no verificado aquí) | Pesos en HF |
| TRELLIS | Generación 3D estructurada (SLAT) | Imagen única | Malla y radiancia | no disponible | MIT (según conocimiento público, no verificado aquí) | Pesos en HF |

La comparación cuantitativa con Hunyuan3D-v2.5, TripoSR o TRELLIS no está disponible en la información proporcionada; la model card solo ofrece una comparación visual cualitativa frente a Hunyuan3D-v2.5.

## Limitaciones y advertencias

- La model card no documenta sesgos específicos; al tratarse de un modelo de imagen a 3D, puede heredar sesgos de los datasets de objetos y escenas empleados en el entrenamiento (categorías sobrerrepresentadas, sesgos geográficos o de iluminación).
- Riesgo de alucinación geométrica: al generar 3D desde una sola vista, las partes no visibles del objeto o escena se infieren y pueden no corresponder con la realidad física.
- Limitaciones de resolución: los checkpoints están entrenados a 256x256 y 512x512; no se documenta el comportamiento con entradas de mayor resolución ni con relaciones de aspecto extremas.
- Idioma: los metadatos declaran únicamente inglés; no hay soporte multilingüe ni de texto en la generación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las licencias de los datasets de entrenamiento (no detalladas en la model card) antes de un despliegue comercial.
- Sin benchmarks publicados: no es posible validar cuantitativamente la calidad frente a alternativas; la única evidencia es cualitativa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de usuarios muy reducido, lo que implica menor soporte comunitario y menos reportes de errores.
- No se detallan requisitos de hardware ni latencias, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaiYuanhao/DiffusionGS
- Paper (arXiv 2411.14384): https://arxiv.org/abs/2411.14384
- Código en GitHub: https://github.com/caiyuanhao1998/Open-DiffusionGS
- Página del proyecto: https://caiyuanhao1998.github.io/project/DiffusionGS/
- Dataset en Hugging Face: https://huggingface.co/datasets/CaiYuanhao/DiffusionGS
- Demo de objeto: https://huggingface.co/spaces/CaiYuanhao/DiffusionGS-Object
- Demo de escena: https://huggingface.co/spaces/CaiYuanhao/DiffusionGS-Scene
- Artículo divulgativo en Zhihu: https://zhuanlan.zhihu.com/p/1962623398749372601
