# qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF es una derivada comunitaria, publicada por el usuario qmnvp, del trabajo de ISTA-DASLab sobre Qwen3.8-Flash-Next. Se trata de una versión podada (pruning de expertos) del modelo original MoE de 512 expertos, reducida a 320 expertos y orientada a tareas de código, conservando la capacidad multimodal (imagen-texto a texto) del modelo base. El objetivo del proyecto es que un modelo de 131.600 millones de parámetros totales quepa en un límite de memoria de aproximadamente 45 GB, incluyendo contexto de 256k tokens, mediante cuantización extrema IQ3_S y externalización de la tabla n-gram a disco.

Su relevancia radica en la tendencia actual de "pruning de expertos" en modelos MoE: seleccionar los expertos más relevantes (por saliencia) para una tarea concreta, en este caso programación en inglés, para reducir drásticamente los requisitos de hardware sin recurrir a una cuantización aún más agresiva. No es una publicación oficial de Qwen ni de ISTA-DASLab, sino un experimento comunitario con 334 descargas en el momento de la ficha, dirigido a usuarios de llama.cpp y runtimes compatibles con GGUF como Splash 1.4.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado de Qwen3.8-Flash-Next), multimodal image-text-to-text |
| Parametros totales | 131.621.823.360 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | IQ3_S (pesos cuantizados del modelo base), PLE Q8 para los expertos empaquetados |
| Idiomas soportados | Ingles (según la model card; el modelo base Qwen3.8 es multilingue, pero no hay datos oficiales en la ficha) |
| Licencia | qwen-community-1.0 (heredada del modelo base, tipo "other") |
| Formato de pesos | GGUF (con imatrix), 2 shards, 91,2 GB de tamano de repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, un MoE de 512 expertos, al que ISTA-DASLab aplicó su pipeline GSQ-RCO (cuantización con matriz de importancia y asignación de tensores) para producir una versión IQ3_S en GGUF. La variante de qmnvp no requantiza nada: toma los datos cuantizados directamente de la versión IQ3_S de ISTA-DASLab y aplica poda de expertos mediante el script prune_raw_gguf.py, eliminando los expertos menos relevantes.

La selección de expertos es lo más interesante técnicamente: se parte de los 256 expertos del release "Coder v2" de ISTA-DASLab (seleccionados para tareas de código) y se completan hasta 320 con expertos de la v1 y del listado de saliencia de sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit, en orden de saliencia. Además, se incluye el PLE (packed lazy experts) en Q8 extraído del shard UD-Q5_K_XL de unsloth/Qwen3.8-Flash-Next-GGUF. La tabla n-gram para decodificación especulativa no reside en memoria: se mantiene en SSD, con lo que sus requerimientos de ancho de banda son bajos. El runtime recomendado es Splash 1.4.1. No hay información sobre el entrenamiento original del modelo base (tokens, datasets, RLHF/DPO) en la ficha.

## Capacidades

- Generación de texto y razonamiento en inglés, heredadas del modelo base Qwen3.8-Flash-Next.
- Generación y comprensión de código: la selección de expertos está optimizada para flujos de trabajo de programación en inglés ("appears to work well for English coding workflows", según el autor, sin evaluación extensiva).
- Capacidad multimodal: entrada de imagen y texto (pipeline image-text-to-text), heredada del modelo base.
- Contexto largo: 256k tokens, útil para bases de código extensas.
- Decodificación especulativa mediante tabla n-gram (externa a memoria, en SSD) en el runtime Splash.
- Compatible con endpoints estándar de GGUF (endpoints_compatible) y con formato conversacional.

No hay información en la ficha sobre tool calling, agentes ni thinking mode.

## Casos de uso

- Asistencia a la programación en local: el modelo cabe en ~45 GB de memoria con los 320 expertos y contexto de 256k, lo que permite trabajar con repositorios grandes completos en el contexto desde una estación de trabajo con GPU de gama alta o Mac con memoria unificada.
- Revisión y refactorización de bases de código extensas: la ventana de 256k tokens permite cargar módulos completos o múltiples ficheros para análisis y reescritura coherente.
- Chat con documentos visuales: al conservar la capacidad multimodal, puede responder preguntas sobre capturas de pantalla, diagramas de arquitectura o mockups junto con código.
- Experimentación con poda de expertos MoE: al derivar de los releases de ISTA-DASLab con allocations documentadas, es un buen sujeto de estudio para investigadores que comparan selecciones de expertos por saliencia frente a por dominio.
- Despliegue en hardware limitado de modelos muy grandes: la combinación IQ3_S + PLE Q8 + tabla n-gram en SSD permite ejecutar un modelo de 131B de parámetros totales sin H100, por ejemplo con 48 GB de VRAM o memoria unificada.
- Razonamiento especulativo de bajo coste: la tabla n-gram en SSD acelera la inferencia sin consumir VRAM, útil para sesiones interactivas largas de coding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que "no extensive testing or evaluation has been performed" (no se han realizado pruebas ni evaluaciones extensivas).

## Requisitos de hardware

- Memoria estimada para inferencia: ~45 GB con los 320 expertos y contexto de 256k completo (tabla n-gram en SSD), usando Splash 1.4.1. El repo completo ocupa 91,2 GB en disco.
- GPU recomendadas: no disponible (no se especifican modelos concretos de GPU). Por la huella de memoria, encajan GPUs de 48 GB (RTX A6000, RTX 6000 Ada, L40S) o sistemas con memoria unificada tipo Mac Studio con 48-64 GB o más.
- Consumer GPUs: cabe parcialmente en una RTX 4090 (24 GB) solo con offload parcial a CPU/RAM; para cargar todo el modelo en GPU se necesitan 48 GB.
- Despliegue: Splash 1.4.1 (runtime recomendado por el autor); por formato GGUF debería ser compatible con llama.cpp, Ollama y LM Studio, aunque la estructura de shards modificada y el PLE externo pueden requerir verificación.
- Latencia y throughput: no disponible. El uso de tabla n-gram para decodificación especulativa sugiere aceleración del throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF | 131,6B | 320 | 256k | IQ3_S + PLE Q8 | qwen-community-1.0 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | 131,6B (base) | 256 (poda coder) | 256k | IQ1_M / IQ3_S | qwen-community-1.0 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 131,6B (base) | 512 (sin podar) | 256k | IQ3_S | qwen-community-1.0 |

Esta variante se sitúa deliberadamente entre ambas: más capacidad general que la versión Coder de 256 expertos (al incluir 64 expertos adicionales por saliencia) y menor huella que el release completo de 512 expertos. Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Evaluación mínima: el autor reconoce no haber realizado pruebas ni evaluaciones extensivas; el modelo "parece funcionar bien" para código en inglés, sin cifras que lo respalden.
- Pérdida por poda: reducir de 512 a 320 expertos puede degradar capacidades fuera del dominio de código; no hay benchmarks que cuantifiquen la degradación.
- Idioma: la ficha declara solo inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación: inherente a modelos de lenguaje; agravado por la cuantización extrema IQ3_S, que puede amplificar errores en razonamiento fino y generación de código.
- Licencia: hereda qwen-community-1.0 del modelo base; conviene revisar el archivo LICENSE para conocer las restricciones de uso comercial antes de desplegar en producción.
- Dependencia de tooling específico: la estructura de shards modificada y el PLE externo requieren runtimes compatibles (Splash 1.4.1); la compatibilidad con otras herramientas GGUF no está garantizada.
- Proyecto comunitario con baja tracción (334 descargas, 1 like): soporte y mantenimiento no garantizados.

## Enlaces

- Modelo: https://huggingface.co/qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Versión Coder de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- GGUF original de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Listado de saliencia usado para expertos: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- Script de poda: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Overview/blob/main/tools/prune_raw_gguf.py
- Repositorio de herramientas: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Overview
- Runtime Splash: https://github.com/incoai/splash
