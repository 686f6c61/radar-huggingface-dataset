# micrictor/LFM2.5-350M-ShellAI-v2-GGUF

## Resumen

LFM2.5-350M ShellAI v2 es un modelo de 350 millones de parámetros desarrollado por el usuario micrictor como una adaptación del modelo base LiquidAI/LFM2.5-350M de Liquid AI. Su propósito es traducir peticiones en lenguaje natural a comandos Bash mediante un pipeline de dos etapas: primero convierte el texto en una representación intermedia tipada llamada ShellIR-v1, y después transforma esa representación en un único comando Bash. Esta arquitectura en dos fases permite separar la comprensión semántica de la generación sintáctica, lo que facilita la validación y el control de riesgos antes de ejecutar cualquier comando.

El modelo se distribuye en formato GGUF con cuantización Q8_0, lo que permite su ejecución eficiente en CPU sin necesidad de GPU dedicada. Se basa en la arquitectura LFM2 de Liquid AI, que ha sido pre-entrenada con 28 billones de tokens según el blog oficial de Liquid AI, e incorpora un ajuste fino con LoRA que combina un 87,5 % de pesos orientados a seguridad y un 12,5 % de pesos balanceados. La relevancia de este modelo radica en su capacidad para generar comandos shell seguros y validados en entornos donde el coste de un error es alto, como administración de sistemas o automatización de infraestructuras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (arquitectura de Liquid AI, detalles no especificados) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), BF16 (para evaluacion con Transformers) |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (Q8_0), safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-350M, un modelo de 350 millones de parámetros desarrollado por Liquid AI que utiliza la arquitectura LFM2, diseñada para ofrecer inferencia rápida en dispositivos con recursos limitados. Según el blog oficial de Liquid AI, el modelo base fue pre-entrenado con 28 billones de tokens (frente a los 10 billones de la versión anterior) y sometido a un proceso de aprendizaje por refuerzo a gran escala. La adaptación ShellAI v2 se realizó mediante un ajuste fino con LoRA, combinando dos checkpoints: un 87,5 % de pesos enfocados en seguridad y un 12,5 % de pesos balanceados, lo que mejoró la precisión estricta de la suite de evaluación del 70 % al 80 %.

La innovación principal es el pipeline de dos etapas: un primer modelo traduce lenguaje natural a ShellIR-v1, una representación intermedia tipada y validable, y un segundo modelo convierte esa representación en un comando Bash. Esta separación permite sustituir el segundo modelo por un compilador determinista de ShellIR cuando se prioriza la latencia o el uso de memoria. El modelo base conversacional de LiquidAI permanece utilizable sin los adaptadores de tarea, lo que ofrece flexibilidad de despliegue.

## Capacidades

- Generacion de comandos Bash a partir de descripciones en lenguaje natural.
- Generacion de representacion intermedia ShellIR-v1 tipada y validable.
- Etiquetado de riesgos y efectos de los comandos generados (riesgo/efectos).
- Soporte para validacion externa de ShellIR antes de la ejecucion.
- Capacidad de funcionar como modelo conversacional generico si se eliminan los adaptadores de tarea.
- Inferencia eficiente en CPU con cuantizacion Q8_0.
- No soporta tool calling ni funciones de agente adicionales (no mencionado).

## Casos de uso

- Administracion de sistemas automatizada: el modelo puede generar comandos Bash complejos a partir de instrucciones en lenguaje natural, como "listar todos los archivos con permisos de escritura para todos los usuarios", y etiquetar los riesgos asociados antes de que el administrador los ejecute.
- Asistente de terminal para desarrolladores: integrado en entornos de desarrollo, permite consultar "¿cómo hago un backup incremental de este directorio?" y obtener un comando validado sin necesidad de recordar la sintaxis exacta.
- Generacion de scripts para pipelines de CI/CD: a partir de descripciones de pasos de despliegue, el modelo produce comandos Bash que pueden integrarse en scripts de automatización, reduciendo errores de sintaxis.
- Educacion en shell scripting: estudiantes pueden practicar describiendo tareas en lenguaje natural y recibiendo comandos Bash correctos, con la representacion intermedia como material didactico.
- Automatizacion de operaciones en infraestructura con recursos limitados: al ejecutarse en CPU con baja latencia (menos de 2 segundos por comando en pruebas), es adecuado para entornos embebidos o servidores sin GPU.
- Auditoria de seguridad de comandos: el modelo genera comandos con etiquetas de riesgo y efectos, lo que permite a los equipos de seguridad revisar y aprobar acciones destructivas antes de su ejecucion.

## Benchmarks y rendimiento

La suite de evaluacion sellada contiene 20 casos composicionales de lenguaje natural a Bash. No se ejecuto ningun comando generado. Los resultados son los siguientes:

| Runtime | Strict / exact | Utility | Valid ShellIR | Gold-IR compiler |
|---|---:|---:|---:|---:|
| Transformers BF16 adapter | 80 % | 100 % | 100 % | 100 % |
| llama.cpp Q8_0, 1 hilo | 75 % | 100 % | 100 % | 100 % |
| llama.cpp Q8_0, 2 hilos | 75 % | 100 % | 100 % | 100 % |

La unica regresion con Q8_0 fue una eleccion de mascara de permisos en el caso de archivos escribibles por el mundo. El numero de hilos no afecto a la salida del modelo.

Latencia medida con llama.cpp b10516 en CPU (maquina de desarrollo):

| Hilos CPU | Latencia mediana IR | Latencia mediana comando | Total mediana | Decodificacion IR | Decodificacion comando |
|---:|---:|---:|---:|---:|---:|
| 1 | 2482 ms | 698 ms | 3525 ms | 35.1 tok/s | 33.0 tok/s |
| 2 | 1381 ms | 368 ms | 1923 ms | 58.1 tok/s | 65.3 tok/s |

## Requisitos de hardware

- Inferencia en CPU sin GPU dedicada: el modelo en Q8_0 ocupa aproximadamente 379 MB, por lo que cabe en cualquier sistema con al menos 1 GB de RAM libre.
- GPU recomendada: no necesaria; el modelo esta disenado para entornos CPU. Si se desea aceleracion, cualquier GPU con 2 GB de VRAM seria suficiente, aunque no se han publicado pruebas con GPU.
- Opciones de despliegue: llama.cpp (probado con b10516), Transformers con pesos BF16, y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, etc.).
- Latencia: con 2 hilos CPU, la latencia mediana total es de 1,9 segundos por peticion, con un throughput de decodificacion de 58-65 tokens por segundo.
- Requisitos minimos: CPU de 2 nucleos, 1-2 GB de RAM, sin necesidad de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Precision estricta (suite 20 casos) | Licencia |
|---|---|---|---|---|---|
| LFM2.5-350M ShellAI v2 (este) | 354 M | no disponible | Q8_0 | 75-80 % | LFM Open License v1.0 |
| LFM2.5-350M ShellAI v1 (micrictor) | 354 M | no disponible | Q8_0 | no publicado | LFM Open License v1.0 |
| LFM2.5-350M base (LiquidAI) | 354 M | no disponible | BF16 | no aplicable (conversacional) | LFM Open License v1.0 |

No hay datos publicados de otros modelos especificos de generacion de comandos Bash con los que comparar directamente. El modelo base LFM2.5-350M esta disenado para conversacion general y no tiene la capacidad especializada de este adaptador.

## Limitaciones y advertencias

- El modelo es pequeno (350 M parametros) y puede presentar alucinaciones en comandos complejos o poco habituales.
- La suite de evaluacion contiene solo 20 casos, por lo que el rendimiento en escenarios reales puede variar.
- El pipeline requiere dos modelos secuenciales, lo que duplica la latencia frente a un modelo unico.
- Los comandos generados deben tratarse como no confiables: es obligatorio validar ShellIR, aplicar la politica de riesgos/efectos, mostrar los comandos destructivos al usuario y nunca ejecutar sin autorizacion explicita.
- La licencia LFM Open License v1.0 impone restricciones de uso que deben revisarse antes de un despliegue comercial.
- No se han publicado datos sobre idiomas soportados; el modelo base probablemente tiene un rendimiento limitado fuera del ingles.
- No se han ejecutado pruebas de seguridad exhaustivas; el modelo no debe usarse como unica barrera de proteccion en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/micrictor/LFM2.5-350M-ShellAI-v2-GGUF
- Modelo anterior v1: https://huggingface.co/micrictor/LFM2.5-350M-ShellAI-GGUF
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
