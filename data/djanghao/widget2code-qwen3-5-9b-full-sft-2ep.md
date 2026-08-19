# Djanghao/Widget2Code-Qwen3.5-9B-Full-SFT-2ep

## Resumen

Widget2Code-Qwen3.5-9B-Full-SFT-2ep es un modelo de fine-tuning completo (full-weight SFT) sobre la base multimodal Qwen/Qwen3.5-9B, desarrollado por Djanghao. Su propósito es transformar capturas de pantalla de widgets de interfaz en código React JSX autocontenido, a partir de la imagen y de un contexto determinista que incluye dimensiones, texto extraído por OCR y paleta de colores. El modelo forma parte del framework Widget2Code, presentado en CVPR 2026, que aborda la tarea de convertir widgets visuales en código de interfaz mediante modelos de lenguaje multimodales.

El checkpoint es un peso completo en BF16 (no un adaptador PEFT), con la torre de visión congelada durante el entrenamiento. Se entrenó durante dos épocas sobre 1.816 pares imagen-código del dataset Djanghao/Widget2Code-Data. Con 9.409.813.744 parámetros, está pensado tanto para inferencia directa screenshot-to-JSX como para servir de inicialización en experimentos de aprendizaje por refuerzo (DAPO/GRPO). Su relevancia radica en que es uno de los primeros modelos abiertos específicamente diseñados para la generación de código UI a partir de imágenes, con una evaluación cuantitativa basada en métricas de renderizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (vision-language transformer, decoder-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el límite de generación usado en pruebas fue de 10.000 tokens) |
| Tipos de cuantizacion | BF16 (pesos del checkpoint); no se publican otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifican idiomas del fine-tuning) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal nativo que integra visión y lenguaje en una única arquitectura. Durante el fine-tuning se congeló la torre de visión y se entrenaron únicamente los pesos del modelo de lenguaje mediante supervisión completa (full-weight SFT) en precisión BF16. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 1e-5, tamaño de lote efectivo de 16 y semilla 42, sobre un conjunto de 1.816 pares imagen-código. No se emplearon técnicas de RLHF ni DPO; el objetivo era maximizar la verosimilitud del código JSX de referencia dado el contexto visual y determinista.

La innovación principal del framework Widget2Code reside en el uso de un contexto estructurado (dimensiones, OCR y paleta) además de la imagen, lo que mejora la precisión de la generación frente a enfoques puramente visuales. El modelo hereda las capacidades del base Qwen3.5, incluyendo razonamiento y comprensión multimodal, aunque su especialización en widgets limita su generalidad a otros dominios de interfaz.

## Capacidades

- Generación de código React JSX autocontenido a partir de capturas de pantalla de widgets.
- Comprensión de dimensiones, texto extraído por OCR y paleta de colores proporcionados como contexto de entrada.
- Reconocimiento de componentes de interfaz y análisis de layout (según la implementación del framework Widget2Code).
- Detección de iconos entre más de 57.000 iconos conocidos (capacidad del framework, no necesariamente del modelo fine-tuned).
- Inferencia directa screenshot-to-code sin necesidad de pasos intermedios adicionales.
- No se documentan capacidades de tool calling, function calling, ni modo agente explícito.
- No se documentan capacidades de audio ni de generación de vídeo.

## Casos de uso

- Generación de código UI a partir de mockups: un diseñador entrega una captura de un widget y el modelo produce el componente React JSX correspondiente, listo para integrarse en un proyecto frontend. Es adecuado porque el modelo ha sido entrenado específicamente para este tipo de transformación.
- Automatización de desarrollo frontend: en un pipeline de CI/CD, el modelo puede convertir imágenes de diseño en código base, reduciendo el trabajo manual de maquetación. Su salida en JSX autocontenido facilita la integración directa.
- Prototipado rápido: durante fases de exploración de producto, se pueden generar múltiples variantes de un widget a partir de imágenes de referencia, acelerando la validación de conceptos.
- Evaluación de modelos de generación de UI: sirve como baseline en investigación comparativa, tal como se describe en el paper Widget2Code, donde se compara contra MLLMs generales y modelos especializados en UI2Code.
- Inicialización para aprendizaje por refuerzo: el checkpoint completo se ofrece como punto de partida para experimentos con DAPO/GRPO, permitiendo a otros investigadores explorar políticas de generación más robustas.
- Documentación y mantenimiento de código: a partir de capturas de widgets existentes en una aplicación, el modelo puede generar código de referencia para documentar o reconstruir componentes, útil en proyectos con deuda técnica.
- Pruebas de accesibilidad: al generar código JSX a partir de widgets, se puede inspeccionar la estructura del componente para verificar atributos de accesibilidad (aria, roles, etc.), aunque el modelo no garantiza la corrección de estos aspectos.

## Benchmarks y rendimiento

La model card reporta los resultados de una ejecución de prueba almacenada sobre 1.000 imágenes del conjunto de test de Widget2Code:

| Metrica | Valor |
|---|---|
| Ejemplos de generacion completados | 957 / 1.000 |
| Salidas que renderizaron correctamente | 924 / 1.000 |
| SSIM medio entre renderizados | 0,7247 |

Estos números corresponden a una ejecución con temperatura 0,7, penalización de repetición 1,1 y límite de 10.000 tokens. No se han publicado resultados comparativos cuantitativos frente a otros modelos en la información disponible; el sitio web del proyecto muestra comparaciones cualitativas con Gemini-2.5-Pro, GPT-4o, Qwen3-VL, ScreenCoder y UI-UG, pero sin métricas numéricas accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 18,8 GB en disco (pesos de 9,4B parámetros). Para inferencia en BF16 se necesitan al menos 20 GB de VRAM considerando activaciones y memoria intermedia. Con cuantización a 8 bits se podría reducir a unos 10-11 GB, y a 4 bits a unos 5-6 GB, pero no se proporcionan versiones cuantizadas oficiales.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40GB) es suficiente para inferencia en BF16. Para entrenamiento o fine-tuning adicional se recomienda al menos 40 GB (A100, H100).
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo en BF16, aunque con limitaciones de velocidad si se usan secuencias largas.
- Opciones de despliegue: al ser un checkpoint de transformers, puede servirse con vLLM, TGI, o directamente con la librería transformers. También es convertible a GGUF para su uso con llama.cpp u Ollama, aunque no se ofrecen conversiones oficiales.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de 9,4B en una GPU moderna, se puede esperar una generación de 20-40 tokens por segundo en BF16, dependiendo de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos cuantitativos públicos para comparar directamente este modelo con alternativas. El paper Widget2Code menciona que los métodos especializados en UI2Code (ScreenCoder, UI-UG) tienden a rendir peor que los MLLMs generales (Gemini-2.5-Pro, GPT-4o, Qwen3-VL) en la tarea de widgets, pero no se publican tablas de resultados en la información disponible. Como referencia cualitativa:

| Modelo | Tipo | Enfoque | Licencia |
|---|---|---|---|
| Widget2Code-Qwen3.5-9B (este) | Fine-tune especializado | Generación de JSX desde imagen + contexto determinista | other |
| ScreenCoder | Especializado en UI2Code | Generación de código desde screenshots | no disponible |
| Qwen3-VL | MLLM general | Comprensión visual y generación de código | Apache 2.0 (Qwen3-VL) |
| GPT-4o | MLLM propietario | Generación de código multimodal | Propietaria |

La comparativa cuantitativa entre estos modelos no está disponible en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo puede generar código inválido o inseguro; la model card advierte explícitamente que no debe ejecutarse en un entorno privilegiado sin sandboxing.
- El conjunto de entrenamiento es pequeño (1.816 ejemplos), lo que aumenta el riesgo de sobreajuste y limita la generalización a widgets no vistos o a otros tipos de interfaz.
- La evaluación reportada se limita a una ejecución almacenada; no hay evidencia de robustez estadística ni de rendimiento en producción.
- La licencia "other" no especifica los términos exactos de uso, por lo que se debe contactar al autor antes de un uso comercial.
- No se documentan los idiomas soportados por el fine-tuning; aunque Qwen3.5 es multilingüe, el entrenamiento en datos probablemente en inglés puede degradar el rendimiento en otros idiomas.
- No hay soporte explícito para tool calling ni para uso como agente autónomo.
- El modelo no ha sido evaluado en tareas de razonamiento general, matemáticas o código fuera del dominio de widgets.

## Enlaces

- HuggingFace: https://huggingface.co/Djanghao/Widget2Code-Qwen3.5-9B-Full-SFT-2ep
- Dataset de entrenamiento: https://huggingface.co/datasets/Djanghao/Widget2Code-Data
- Sitio del proyecto: https://djanghao.github.io/widget2code/
- Repositorio GitHub: https://github.com/Djanghao/widget2code
- Paper arXiv: https://arxiv.org/pdf/2512.19918
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
