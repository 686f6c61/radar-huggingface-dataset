# batiai/Llama-4-Scout-17B-16E-Instruct-GGUF

## Resumen

Llama 4 Scout 17B-16E-Instruct es un modelo de lenguaje multimodal de gran escala desarrollado por Meta, lanzado en abril de 2025. Se trata de una arquitectura Mixture-of-Experts (MoE) con 109 000 millones de parámetros totales, de los cuales solo 17 000 millones se activan por token mediante enrutamiento top-1 entre 16 expertos. Esta eficiencia computacional permite un rendimiento cercano a modelos densos mucho más grandes, con un coste de inferencia reducido. El modelo es nativamente multimodal, ya que combina un backbone de texto con un codificador de visión, lo que le permite procesar imágenes y texto de forma conjunta.

La versión cuantizada GGUF, preparada por BatiAI, ofrece múltiples niveles de cuantización (desde IQ3_XXS de 38 GB hasta Q6_K de 85 GB) calibrados con imatrix, lo que facilita su ejecución en hardware de consumo, especialmente en Apple Silicon. El modelo soporta ocho idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) e incluye capacidades nativas de tool calling y contexto extendido. Su licencia, la Llama 4 Community License, permite uso comercial para organizaciones con menos de 700 millones de usuarios mensuales activos, lo que lo convierte en una opción atractiva para despliegues empresariales.

La relevancia de este modelo radica en su equilibrio entre tamaño, rendimiento y eficiencia: al ser un MoE con solo 17B de parámetros activos, puede ejecutarse en hardware de gama media-alta manteniendo una calidad comparable a modelos densos de 70B o más. Su naturaleza multimodal y su soporte multilingüe amplían su aplicabilidad a tareas que van desde la generación de código hasta el análisis de imágenes, todo ello bajo una licencia permisiva para la mayoría de los casos de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama4ForConditionalGeneration (MoE con 16 expertos, enrutamiento top-1) |
| Parametros totales | 107 769 861 184 (109B) |
| Parametros activos | 17B (16 expertos, top-1 por token) |
| Longitud de contexto | no disponible (la model card menciona "contexto extendido", sin cifra concreta) |
| Tipos de cuantizacion | IQ3_XXS, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 4 Community License (uso comercial permitido para organizaciones < 700M MAU) |
| Formato de pesos | GGUF (safetensors BF16 disponibles en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura de Llama 4 Scout se basa en un transformer MoE con 16 expertos enrutados mediante selección top-1 por token. Esto significa que, aunque el modelo tiene 109 000 millones de parámetros en total, solo se activan 17 000 millones en cada paso de generación, lo que reduce drásticamente el coste computacional en comparación con un modelo denso de tamaño equivalente. El modelo integra un codificador de visión que permite procesar imágenes junto con texto, mediante un módulo de proyección multimodal (`mmproj`) que se distribuye por separado en formato GGUF.

No se dispone de información detallada sobre el proceso de entrenamiento en la documentación proporcionada. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que el modelo fue lanzado por Meta en abril de 2025 y que la versión cuantizada se generó directamente a partir de los pesos BF16 oficiales, sin re-cuantización intermedia. Las cuantizaciones IQ y K-quant se calibraron con imatrix sobre el corpus wikitext-2-raw, siguiendo una receta consistente con otros modelos de BatiAI.

## Capacidades

- Generación de texto y razonamiento: produce respuestas coherentes y contextualmente relevantes en múltiples dominios, incluyendo matemáticas, ciencias y análisis lógico.
- Soporte multimodal: procesa imágenes junto con texto (image-text-to-text), permitiendo descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos escaneados.
- Tool calling nativo: puede invocar funciones y herramientas externas, lo que lo hace adecuado para integrarse en pipelines de agentes y automatización.
- Soporte multilingüe: cubre ocho idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), además de un comportamiento multilingüe general.
- Contexto extendido: la model card menciona soporte de contexto largo, aunque no se especifica la longitud máxima exacta en la información disponible.
- Eficiencia MoE: gracias al enrutamiento top-1 con solo 17B de parámetros activos, ofrece una latencia inferior a la de modelos densos de tamaño comparable.
- Compatibilidad con llama.cpp: puede ejecutarse tanto en modo texto como multimodal mediante `llama-server` o `llama-mtmd-cli`, con soporte para aceleración por GPU en Apple Silicon y CUDA.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones multi-turno en varios idiomas (es, en, de, fr, etc.) gracias a su soporte multilingüe y su contexto extendido, lo que permite mantener el historial de la conversación sin truncamientos. Su capacidad de tool calling facilita la integración con sistemas de tickets o bases de conocimiento.
- Asistente de documentación técnica con visión: al ser multimodal, puede analizar capturas de pantalla, diagramas o documentos escaneados y generar descripciones o resúmenes técnicos. Esto resulta útil en equipos de soporte que necesitan interpretar imágenes de errores o esquemas.
- Generación y revisión de código en producción: con tool calling nativo, el modelo puede invocar linters, compiladores o APIs de control de versiones dentro de un pipeline de CI/CD, generando código, revisando cambios y sugiriendo correcciones de forma autónoma.
- Agente de automatización de tareas ofimáticas: combinado con herramientas externas, puede redactar correos, generar informes o resumir documentos a partir de instrucciones en lenguaje natural, aprovechando su capacidad de razonamiento multi-paso y su soporte multilingüe.
- Análisis de imágenes médicas o industriales: aunque no es un modelo especializado, su componente de visión permite extraer información de radiografías, fotografías de maquinaria o planos, asistiendo a técnicos en tareas de clasificación o descripción inicial.
- Chatbot educativo multilingüe: puede servir como tutor virtual en varios idiomas, explicando conceptos de matemáticas, programación o idiomas, con la capacidad de adaptar el nivel de detalle según el usuario y de mostrar ejemplos visuales cuando se le proporcionan imágenes.
- Traducción asistida con contexto visual: al combinar texto e imagen, puede traducir carteles, menús o documentos con elementos gráficos, manteniendo la coherencia entre el texto y las referencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de BatiAI indica que los benchmarks están pendientes de medición en hardware Apple Silicon (M4 Max / M2 Ultra) y que se añadirán cuando estén completos. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros estándares en la documentación revisada.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (datos de la model card):
  - IQ3_XXS (38 GB): requiere al menos 48 GB de RAM/VRAM.
  - Q3_K_M (48 GB): requiere al menos 56 GB.
  - IQ4_XS (52 GB): requiere al menos 64 GB.
  - Q4_K_M (60 GB): requiere al menos 72 GB.
  - Q5_K_M (72 GB): requiere al menos 88 GB.
  - Q6_K (85 GB): requiere al menos 96 GB.
- GPUs recomendadas: no se especifican modelos concretos de NVIDIA, pero la model card indica compatibilidad con Apple Silicon (M4 Max, M2 Ultra, M3 Ultra) y, por extensión, con GPUs CUDA de gama alta (A100, H100, RTX 4090 con suficiente VRAM). Para las cuantizaciones más pequeñas (IQ3_XXS) se necesitan al menos 48 GB de VRAM, lo que apunta a GPUs como A6000, A100 40GB o RTX 6000 Ada.
- En consumer GPU: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ninguna de las cuantizaciones disponibles, ya que la más pequeña requiere 38 GB. Se necesitan GPUs profesionales o estaciones de trabajo.
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli), Ollama (texto únicamente), y cualquier framework compatible con GGUF (vLLM con soporte GGUF, TGI, etc.).
- Latencia y throughput: no hay mediciones publicadas. La model card advierte que en Apple Silicon la cuantización Q3_K_M puede ser más lenta que Q4_K_M debido a limitaciones del path de dequantización en Metal, por lo que recomienda usar Q4_K_M si hay memoria suficiente.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo comparte categoría con otros MoE de gran escala como Qwen3-30B-A3B, DeepSeek-V3 o Mixtral 8x22B, pero no se han publicado métricas de rendimiento que permitan una comparación objetiva. En cuanto a parámetros y licencia, Llama 4 Scout ofrece 109B totales con 17B activos y una licencia permisiva para uso comercial bajo condiciones, mientras que alternativas como Qwen3-30B-A3B tienen una licencia Apache 2.0, pero con menos parámetros totales. Se recomienda consultar los benchmarks oficiales de Meta y los resultados independientes cuando estén disponibles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje entrenado sobre datos web, puede reflejar sesgos presentes en el corpus y generar contenido factualmente incorrecto o inventado, especialmente en dominios especializados. Se recomienda verificación humana en contextos críticos.
- Requisitos de hardware elevados: aunque el modelo es eficiente gracias al MoE, la cuantización más pequeña (IQ3_XXS) requiere 38 GB de almacenamiento y al menos 48 GB de RAM, lo que excluye a la mayoría de los equipos de consumo y obliga a usar estaciones de trabajo o GPUs profesionales.
- Longitud de contexto no especificada: la model card menciona "contexto extendido" pero no ofrece una cifra concreta. En el ejemplo de `llama-server` se usa `-c 32768`, pero no se confirma si el modelo soporta más tokens de forma fiable.
- Restricciones de licencia: la Llama 4 Community License permite uso comercial solo para organizaciones con menos de 700 millones de usuarios mensuales activos. Las empresas por encima de ese umbral necesitan una licencia comercial específica de Meta.
- Rendimiento de cuantizaciones bajas: las cuantizaciones de 3 bits (IQ3_XXS, Q3_K_M) pueden degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o matemáticas. Se recomienda usar Q4_K_M o superior cuando la memoria lo permita.
- Soporte de visión limitado a la proyección multimodal: el componente de visión requiere descargar el archivo `mmproj` por separado y no está disponible en todas las cuantizaciones; además, el rendimiento en tareas visuales puede ser inferior al de modelos especializados en visión.
- Sin benchmarks publicados: la ausencia de métricas de rendimiento verificadas dificulta la evaluación objetiva del modelo frente a alternativas. Los usuarios deben realizar sus propias pruebas antes de adoptarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/batiai/Llama-4-Scout-17B-16E-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Licencia Llama 4: https://github.com/meta-llama/llama-models/blob/main/models/llama4/LICENSE
- Política de uso aceptable: https://www.llama.com/llama4/use-policy
- BatiFlow (herramienta on-device de BatiAI): https://flow.bati.ai
- Ollama (perfil de BatiAI): https://ollama.com/batiai/llama4-scout
