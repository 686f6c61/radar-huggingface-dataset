# AMAImedia/Qwen3.6-35B-A3B-occamy-1.0-BF16-GGUF-MTP

## Resumen

Occamy-1.0 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Accio-Lab y distribuido en este repositorio por AMAImedia. Parte del checkpoint post-entrenado Qwen3.6-35B-A3B y se especializa en "co-work": tareas agénticas de horizonte largo y con estado persistente, donde el modelo debe coordinar búsqueda web, ejecución de código, llamadas a herramientas, gestión de ficheros y APIs estructuradas. Con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token, mantiene un coste de inferencia contenido para cargas de trabajo agénticas sostenidas.

El modelo es multimodal (pipeline image-text-to-text) y cubre más de 100 idiomas, incluido el castellano. Su entrenamiento se centra en la fiabilidad de ejecución, el seguimiento de estado, la recuperación tras errores y la continuidad del trabajo a través de reescrituras de historial como la compactación de contexto, en lugar de reaprender capacidades generales.

Este repositorio concreto contiene pesos en formato GGUF con precisión BF16 y soporte MTP (multi-token prediction), derivados del modelo base occamy-1.0. La licencia Apache 2.0 y la disponibilidad del stack de entrenamiento (Dressage) lo hacen relevante para equipos que necesitan desplegar agentes de larga duración en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `qwen3_5_moe`; multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | 3B (denominacion 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Repositorio en BF16 GGUF con MTP; otras cuantizaciones no disponibles en esta ficha |
| Idiomas soportados | Más de 100 idiomas, entre ellos es, en, zh, ru, ja, de, fr, pt, ar, hi, ko, vi, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) y safetensors (modelo base) |
| Tamano del repositorio | 130,9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B; Accio-Lab/occamy-1.0 |
| Fecha de publicacion | 2026-09-04 (modelo); repositorio creado 2026-09-17 |

## Arquitectura y entrenamiento

Occamy-1.0 se construye sobre el checkpoint post-entrenado Qwen3.6-35B-A3B, un transformer MoE con 35,1B parámetros totales y 3B activos por token. El entrenamiento adicional no parte de cero: se concentra en afinar la ejecución fiable en flujos de trabajo profesionales multi-paso, el seguimiento de estado persistente, la recuperación ante fallos y la continuidad a lo largo de llamadas a herramientas y reescrituras de historial (context compaction). El ajuste supervisado abarca trabajo agéntico general, interacción de horizonte largo, ingeniería de software y grounding de llamadas a herramientas.

La infraestructura de aprendizaje por refuerzo multi-harness utilizada se publica como Dressage (github.com/Accio-Lab/Dressage). El repositorio incluye variantes MTP (multi-token prediction), lo que sugiere decodificación especulativa o predicción multi-token para acelerar la generación. No se dispone del número exacto de tokens de entrenamiento ni de la composición detallada del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso en tareas profesionales.
- Ejecución de código en terminal (terminal coding) y grounding de tool calls.
- Llamadas a funciones y herramientas estructuradas (tool calling / function calling).
- Trabajo agéntico de horizonte largo con estado persistente y recuperación tras errores.
- Continuidad a través de compactación de contexto y reescrituras de historial.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidades multilingües amplias (más de 100 idiomas, incluido castellano).
- Seguimiento de instrucciones complejas en flujos de trabajo con múltiples pasos.
- Predicción multi-token (MTP) para acelerar la inferencia.

## Casos de uso

- Automatización de flujos de oficina con herramientas: el modelo puede encadenar búsqueda, edición de documentos, hojas de cálculo y APIs estructuradas manteniendo el estado entre pasos, gracias a su especialización en co-work.
- Agentes de ingeniería de software: ejecución de comandos en terminal, edición de ficheros y verificación de resultados en pipelines de CI/CD, con recuperación ante fallos de comandos o tests.
- Asistentes de investigación con búsqueda web: planificación de consultas, síntesis de fuentes y mantenimiento de un estado de trabajo coherente durante sesiones largas.
- Atención al cliente multi-turno con acceso a sistemas internos: el modelo puede invocar funciones de consulta de pedidos o cuentas y mantener contexto a lo largo de la conversación.
- Procesamiento de documentos con imagen y texto: extracción y razonamiento sobre capturas, formularios o diagramas combinados con texto.
- Doblaje y localización multilingüe: dado su origen en la plataforma NOESIS de automatización de doblaje, encaja en flujos de traducción y adaptación con más de 100 idiomas.
- Orquestación de agentes delegados: coordinación de subtareas y seguimiento de estado entre ejecuciones delegadas y compactaciones de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 70 GB (35,1B parámetros × 2 bytes); el repositorio completo pesa 130,9 GB por incluir múltiples ficheros GGUF/MTP.
- GPU recomendadas para BF16: H100 80 GB, A100 80 GB o H200; para cuantizaciones menores, A100 40 GB o RTX 6000 Ada.
- GPU de consumo: el BF16 no cabe en GPU de consumo de 24 GB; se requerirían cuantizaciones de 4-6 bits (no incluidas en este repositorio) para RTX 4090/3090, y aun así el peso total de 35B excede la VRAM típica, por lo que sería necesario offloading a RAM.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles; los 3B parámetros activos por token reducen el coste computacional frente a un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Occamy-1.0 (este) | 35,1B / 3B | no disponible | Apache 2.0 | Especializado en co-work agéntico, multimodal, MTP |
| Qwen3.6-35B-A3B (base) | 35,1B / 3B | no disponible | no disponible | Checkpoint post-entrenado del que parte Occamy |
| Alternativas de 30-40B MoE | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El propio autor advierte que Occamy está optimizado para cargas de co-work comunes y no sustituye a modelos frontera en todas las tareas.
- Las tareas de recuperación intensiva (retrieval-heavy) y de usuario simulado aún tienen margen de mejora.
- No incluye interacción visual nativa con navegador o escritorio en su interfaz de entrenamiento de co-work.
- Riesgo de alucinación inherente a los modelos de lenguaje; la ejecución de herramientas debe validarse en producción.
- Sesgos no documentados en la información disponible.
- La longitud de contexto no se especifica; debe confirmarse antes de diseñar flujos con historiales largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B.
- El repositorio contiene pesos BF16 de gran tamaño (130,9 GB), lo que limita el despliegue en hardware modesto sin cuantización adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Qwen3.6-35B-A3B-occamy-1.0-BF16-GGUF-MTP
- Modelo original: https://huggingface.co/Accio-Lab/occamy-1.0
- GGUF original: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- MTP original: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio del proyecto: https://accio-lab.github.io/occamy/
- Framework de entrenamiento Dressage: https://github.com/Accio-Lab/Dressage
- Informe técnico: https://arxiv.org/pdf/2609.11977
- Organización: https://www.amaimedia.com
