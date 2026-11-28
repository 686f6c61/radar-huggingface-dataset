# divinetribe/AesCode-32B-MLX-bf16

## Resumen

AesCode-32B-MLX-bf16 es la conversion a formato MLX, en precision completa bfloat16, del modelo microsoft/AesCode-32B, un finetune de Qwen3-VL-32B-Instruct orientado a la generacion de artefactos visuales (presentaciones, posters, dashboards, paginas de producto) en HTML y CSS a partir de un prompt y una imagen de referencia. El modelo original lo desarrolla el equipo de AesCode en Microsoft y esta descrito en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). La conversion la publica el usuario divinetribe.

El interes de esta version concreta es que permite ejecutar un modelo vision-lenguaje de 33.400 millones de parametros de forma nativa en Apple Silicon mediante mlx-vlm, sin PyTorch ni inferencia en la nube, manteniendo intacta la torre de vision (los 351 tensores `vision_tower.*` y las configuraciones de vision y del procesador). Esto resuelve el problema habitual de las conversiones MLX incompletas, que descartan la parte visual y fallan en la primera imagen.

Arquitectura transformer multimodal de tipo `Qwen3VLForConditionalGeneration`, con 33.357.390.064 parametros totales y pesos bf16 de aproximadamente 62 GB en disco (66,7 GB de repositorio). La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3VLForConditionalGeneration` (vision-lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); la familia incluye variantes 8-bit y 4-bit en MLX |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base AesCode-32B es un finetune de Qwen/Qwen3-VL-32B-Instruct, por lo que hereda la arquitectura transformer multimodal de Qwen3-VL: una torre de vision que procesa la imagen de referencia y un decoder de lenguaje que genera el codigo. El entrenamiento del modelo original se describe en el paper arXiv:2610.18860 bajo el marco "Aesthetic Code Generation with Decoupled Cross-Modal Rewards", que segun el titulo emplea recompensas multimodales desacopladas para optimizar la generacion de codigo estetico. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

Esta build MLX no modifica el comportamiento del modelo: son los mismos pesos bf16 de 33,4B re-fragmentados en formato MLX para cargarse y ejecutarse de forma nativa en un Mac de la serie M. Se conservan los 351 tensores de la torre de vision y las configuraciones `vision_config` y del procesador, de modo que la ruta multimodal queda operativa. La validacion de la parte visual se realizo alimentando una captura real de una pagina de producto y solicitando una auditoria SEO, de marketing y de accesibilidad junto con textos alternativos para las imagenes.

## Capacidades

- Generacion de codigo HTML y CSS a partir de una imagen de referencia y un prompt: reconstruye capturas de pantalla como artefactos visuales completos.
- Generacion de artefactos visuales ricos en informacion: slides, posters, dashboards y paginas de producto.
- Comprension de imagenes: lectura de capturas de pantalla, identificacion de elementos de interfaz (titulos, breadcrumbs, valoraciones, rangos de precio, botones de compra) y redaccion de textos alternativos.
- Auditoria de paginas a partir de una captura: analisis SEO, de conversion/marketing y de accesibilidad.
- Generacion de texto conversacional en ingles.
- Capacidades de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Reconstruccion de disenos a codigo: dado un mockup o una captura de Figma o de una web existente, el modelo genera un unico archivo HTML con CSS en linea, lo que acelera el prototipado frontend sin salir del Mac.
- Generacion de paginas de producto: a partir de una captura de referencia, produce el HTML y CSS de una pagina de producto con jerarquia visual, CTA y estructura de precios, adecuado para equipos de ecommerce que iteran disenos rapidamente.
- Creacion de dashboards y presentaciones: convierte una imagen de referencia en maquetacion HTML de un panel de datos o de una slide, util para generar plantillas internas de forma masiva.
- Auditoria SEO y de accesibilidad automatizada: se le pasa una captura de una pagina en produccion y devuelve recomendaciones sobre title tag, meta descripcion, schema markup, jerarquia de encabezados y textos alternativos para cada imagen.
- Generacion de alt-text a escala: al leer la imagen real de cada producto o ilustracion, redacta descripciones utilizables para accesibilidad y para SEO, integrable en un pipeline de publicacion de contenidos.
- Desarrollo asistido en local con privacidad: al ejecutarse con mlx-vlm en Apple Silicon sin telemetria ni claves de API, encaja en flujos donde el codigo o las capturas no pueden salir a la nube, por ejemplo en entornos regulados.
- Prototipado de interfaces para equipos de diseno: permite iterar sobre una referencia visual y obtener codigo ejecutable inmediatamente, reduciendo el ciclo entre diseno y validacion tecnica.

## Benchmarks y rendimiento

Los datos proceden del paper de AesCode y de la model card del modelo original, sobre un benchmark de 300 muestras de estilo infografico puntuadas por cumplimiento de reglas y calidad visual.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

AesCode-32B supera en 22,4 puntos la calidad visual del Qwen3-VL-32B de la misma escala. No existe un leaderboard publico independiente que liste AesCode especificamente. Para metricas de vision general del backbone, deben consultarse las evaluaciones oficiales de Qwen3-VL, que corresponden al modelo base y no a AesCode.

## Requisitos de hardware

- VRAM/unified memory para bf16: aproximadamente 62 GB de pesos en disco, por lo que la inferencia requiere un Mac con memoria unificada holgada; en la practica, equipos con 64 GB o mas.
- Variantes ligeras: las builds 8-bit (aproximadamente la mitad de tamano) y 4-bit (un cuarto) de la misma familia reducen los requisitos para maquinas mas pequenas, a costa de calidad.
- GPU: el modelo esta pensado para Apple Silicon (serie M); no se proporcionan requisitos para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en el caso de Apple Silicon con memoria unificada suficiente; para GPUs discretas de consumo no hay datos en la informacion proporcionada.
- Despliegue: mlx-vlm sobre Apple Silicon. Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan para esta build.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-bf16 | 33,4B | no disponible | Vision-lenguaje para generar HTML/CSS desde imagen | Apache 2.0 | Hugging Face (MLX, Apple Silicon) |
| microsoft/AesCode-32B | 32B (nominal) | no disponible | Modelo original del que deriva esta build | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-32B-Instruct | 32B (nominal) | no disponible | Vision-lenguaje generalista, base de AesCode | no disponible | Hugging Face |
| Claude Opus 4.8 | no disponible | no disponible | Modelo propietario de proposito general | propietaria | API cerrada |

La comparativa de rendimiento en la tarea especifica de generacion estetica de codigo situa a AesCode-32B por delante de Claude Opus 4.8 y GPT-5.5 en la metrica global del benchmark de los autores, y muy por encima del Qwen3-VL-32B base en calidad visual.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; al derivar de Qwen3-VL, puede heredar los del backbone.
- Alucinacion: en tareas de lectura de imagenes y auditoria puede describir elementos que no estan presentes o inventar detalles; conviene verificar las salidas en produccion.
- Alcance: el finetune esta especializado en generacion de codigo visual (HTML/CSS) y auditoria de paginas; no es un modelo generalista de razonamiento o codigo de proposito general.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3-VL y del modelo original de Microsoft.
- Requisitos de memoria: la build bf16 exige aproximadamente 62 GB, lo que la limita a equipos Apple de gama alta; para maquinas menores deben usarse las variantes 8-bit o 4-bit.
- Validacion: la comprobacion de la torre de vision se hizo con una unica captura de pagina de producto, no con un conjunto amplio de pruebas.
- Ecosistema: depende de mlx-vlm y de Apple Silicon; no hay soporte documentado para otros runtimes o aceleradores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Modelo original: https://huggingface.co/microsoft/AesCode-32B
- Paper: https://arxiv.org/abs/2610.18860
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Variante abliterated: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
