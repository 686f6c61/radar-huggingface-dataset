# netprojects/WeMM-Ecom-4B-MLX-8bit

## Resumen

WeMM-Ecom-4B-MLX-8bit es una conversión a formato MLX, cuantizada a 8 bits, del modelo multimodal tencent/WeMM-Ecom-4B, desarrollado por Tencent (WeChat Vision) y afinado a partir de Qwen3.5. Está pensado para tareas de comercio electrónico: lectura de imágenes de producto, comparación de varias imágenes simultáneas y análisis de vídeo combinado con texto, en chino e inglés. Esta build la publica NetProjects (Internet Projects Ltd), no Tencent ni Alibaba, y su objetivo es ejecutar el modelo en Apple Silicon con la librería mlx-vlm.

El modelo base tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y una arquitectura vision-language basada en transformer con codificador visual incluido. La conversión mantiene el tokenizador, la plantilla de chat y los ficheros de procesador originales sin modificar, y aplica cuantización afina de 8 bits con tamaño de grupo 64. El repositorio ocupa 5,2 GB y el peso descargable es de 5,1 GB.

Su relevancia actual radica en que permite desplegar un modelo especializado en e-commerce en portátiles y equipos de sobremesa con chip Apple M-series, sin GPU dedicada, con una fidelidad muy alta respecto a los pesos bf16 originales: el 98,9 % de los siguientes tokens coinciden y la KL media frente al original es de 0,0008. Incluye modo de razonamiento híbrido (thinking activado por defecto, desactivable por petición).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (fine-tune de Qwen3.5, con codificador visual incluido) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afina (group size 64); existe build alternativa de 4 bits |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización 8-bit |

## Arquitectura y entrenamiento

El modelo es un vision-language model construido sobre Qwen3.5 (Alibaba Cloud, licencia Apache-2.0) y afinado por Tencent WeChat Vision para el dominio de comercio electrónico. Incorpora un codificador visual que procesa imágenes individuales, múltiples imágenes en una misma petición y vídeo, junto con entrada de texto. La build MLX conserva íntegro el codificador visual y los ficheros de tokenizador, plantilla de chat y procesador de Tencent, y solo transforma los pesos al formato MLX con cuantización afina de 8 bits y grupo de 64.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La innovación destacable de esta build concreta es la verificación de fidelidad frente a los pesos bf16 originales: sobre 10 prompts cortos en inglés y chino (362 posiciones forzadas por teacher forcing), el 98,9 % de los siguientes tokens coinciden con el original y la divergencia KL media es de 0,0008. El modelo soporta razonamiento híbrido: el bloque de pensamiento está activado por defecto y puede desactivarse por petición mediante `enable_thinking`.

## Capacidades

- Generación de texto multimodal a partir de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes de producto: identificación de objeto, color, precio y atributos visibles.
- Comparación de múltiples imágenes en una misma petición (por ejemplo, dos listados del mismo producto en colores distintos).
- Comprensión de vídeo combinada con texto.
- Razonamiento híbrido: modo thinking (por defecto) y modo instruct (thinking desactivado) seleccionable por petición.
- Generación de contenido comercial: títulos de producto, puntos de venta y descripciones.
- Capacidades multilingües limitadas a chino e inglés.
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Generación de fichas de producto: dado un conjunto de fotos de un artículo, el modelo produce un título corto y tres puntos de venta; encaja por su entrenamiento específico en e-commerce y por el modo instruct de baja latencia.
- Comparación de listados duplicados: con dos imágenes en la misma petición y thinking activado, el modelo explica diferencias entre listados (color, presentación, precio) para tareas de moderación o deduplicación de catálogo.
- Enriquecimiento de catálogo a gran escala en Mac: al caber en 5,8 GB de memoria pico en una prueba con imagen, se puede procesar lotes de imágenes en un MacBook sin GPU dedicada.
- Análisis de vídeo de producto: revisión de vídeos demostrativos para extraer atributos y verificar que el contenido coincide con la descripción textual.
- Asistentes de atención al cliente en chino e inglés: respuesta a consultas sobre productos adjuntando imágenes, con contexto multimodal.
- Prototipado local de pipelines multimodales: uso de `mlx_vlm.server` con API compatible con OpenAI para integrar el modelo en aplicaciones existentes sin infraestructura cloud.
- Evaluación comparativa de cuantizaciones: la disponibilidad de builds de 8 y 4 bits permite medir el compromiso entre memoria y fidelidad (98,9 % frente a 93,6 % de coincidencia de siguiente token) antes de decidir el despliegue.

## Benchmarks y rendimiento

La model card de esta build remite a las tablas de benchmarks de la model card original de Tencent (comparativas de e-commerce y generales, en modo instruct y thinking), presentadas como imágenes. No se incluyen cifras numéricas en el texto disponible, por lo que no se reproducen valores concretos.

| Metrica de fidelidad (frente a bf16 original) | 8-bit | 4-bit |
|---|---|---|
| Mismo siguiente token | 98,9 % | 93,6 % |
| KL media vs original | 0,0008 | 0,0572 |
| Memoria pico (prueba con imagen) | 5,8 GB | 3,9 GB |
| Tamano | 5,1 GB | 3,0 GB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) con cifras en la información disponible.

## Requisitos de hardware

- Memoria pico medida en prueba con imagen: 5,8 GB para la build de 8 bits y 3,9 GB para la de 4 bits.
- Hardware de referencia de la validación: MacBook Pro M5 Max con 128 GB de memoria unificada, mlx 0.32.4 y mlx-vlm 0.7.11.
- Cabe en equipos consumer Apple Silicon; el requisito práctico es disponer de al menos unos 6 GB de memoria unificada libres para la build de 8 bits (más margen para el contexto y el vídeo).
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable a esta build, que es específica de MLX y Apple Silicon.
- Despliegue: `mlx-vlm>=0.7.11` mediante CLI (`mlx_vlm.generate`) o desde Python (`mlx_vlm.load` / `generate`); servido con `mlx_vlm.server` (API compatible con OpenAI).
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por Tencent: thinking off (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5); thinking on (temperatura 1,0, top_p 0,95, top_k 20, presence_penalty 1,5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-MLX-8bit (esta ficha) | 4,54 B | no disponible | zh, en | Apache-2.0 | MLX 8-bit, Apple Silicon |
| netprojects/WeMM-Ecom-4B-MLX-4bit | 4,54 B | no disponible | zh, en | Apache-2.0 | MLX 4-bit, Apple Silicon |
| tencent/WeMM-Ecom-4B (original) | 4,54 B | no disponible | zh, en | Apache-2.0 | safetensors bf16, GPU |
| Qwen3.5 (modelo base) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de fidelidad y memoria recogidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no hay soporte declarado de castellano.
- Específico de Apple Silicon y de la librería MLX: no se puede ejecutar en CUDA, ROCm ni CPU convencional sin reconversión.
- La cuantización a 8 bits introduce una divergencia pequeña pero no nula (1,1 % de siguientes tokens distintos, KL 0,0008); la build de 4 bits diverge de forma apreciable (6,4 %, KL 0,0572).
- Longitud de contexto no documentada en la información disponible; conviene validarla antes de usarla con entradas largas o vídeo extenso.
- Riesgo de alucinación en la descripción de atributos de producto no visibles en la imagen; no se han publicado evaluaciones de sesgo en la información disponible.
- El modo thinking está activado por defecto y consume más tokens; para producción de baja latencia debe desactivarse explícitamente con `enable_thinking=False`.
- Publicada por NetProjects (Internet Projects Ltd), sin afiliación con Tencent ni Alibaba; la licencia Apache-2.0 se hereda del modelo original y el fichero LICENSE es el de Tencent, con su sección de terceros para Qwen3.5.
- El repositorio tiene un volumen de descargas muy bajo (17) y ninguna marca de "me gusta", lo que reduce la evidencia comunitaria disponible sobre su comportamiento en producción.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/WeMM-Ecom-4B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/WeMM-Ecom-4B-MLX-4bit
- Modelo original de Tencent: https://huggingface.co/tencent/WeMM-Ecom-4B
- Perfil del publicador en Hugging Face: https://huggingface.co/netprojects
- Sitio del publicador: https://netprojects.com
