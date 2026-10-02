# RKNNAI/RK3576-LLM-Qwen3-0.6B

## Resumen

RKNNAI/RK3576-LLM-Qwen3-0.6B no es un modelo entrenado desde cero, sino un repositorio de despliegue que convierte y cuantiza el modelo Qwen3-0.6B al formato RKLLM para ejecutarlo sobre el NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI y su modelo fuente es Qwen/Qwen3-0.6B, desarrollado por el equipo Qwen (Alibaba). El problema que resuelve es la ausencia de artefactos listos para producción en placas RK3576: el repositorio incluye la configuracion cuantizada, los ficheros de runtime y sumas de verificacion SHA-256.

La configuracion publicada es una sola: `Qwen3-0.6B-w4a16-2-1024`, con cuantizacion w4a16 (pesos de 4 bits y activaciones de 16 bits), uso de 2 nucleos NPU y una longitud de contexto de 1024 tokens. Está pensada para el runtime RKLLM v1.2.4. El repositorio ocupa aproximadamente 0,7 GB.

Su relevancia es practica y acotada: permite ejecutar un modelo de 0,6 mil millones de parametros en un SoC de borde sin GPU dedicada, dentro del ecosistema Rockchip. Al tratarse de una distribucion derivada, sus capacidades reales dependen del modelo fuente Qwen3-0.6B y, en la practica, de la degradacion introducida por la cuantizacion a 4 bits y por la ventana de contexto reducida a 1k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo fuente Qwen3-0.6B; la serie Qwen3 incluye arquitecturas densas y MoE) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (1k) en la configuracion RKLLM publicada |
| Tipos de cuantizacion | w4a16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | multilingue segun la ficha de Qualcomm AI Hub; lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (runtime v1.2.4) para RK3576; no safetensors ni GGUF |
| Modelo fuente | Qwen/Qwen3-0.6B |
| Acelerador objetivo | NPU del Rockchip RK3576, 2 nucleos |
| Variantes publicadas | Qwen3-0.6B-w4a16-2-1024 |

## Arquitectura y entrenamiento

El objeto de este repositorio no es el entrenamiento, sino la conversion de un modelo ya existente. El modelo fuente, Qwen3-0.6B, pertenece a la familia Qwen3, descrita en el informe tecnico de arXiv (2505.09388v1) como una serie que combina arquitecturas densas y de mezcla de expertos (MoE), con escalas que van de 0,6 a 235 mil millones de parametros, e integra un modo de razonamiento ("thinking mode") y un modo directo ("non-thinking mode") en un marco unificado. La variante de 0,6B es la mas pequena de la familia.

Sobre el proceso de entrenamiento del modelo fuente (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se aporta informacion en los materiales disponibles. Tampoco se especifica si el checkpoint Qwen3-0.6B empleado corresponde a una variante base o ajustada para instrucciones. La innovacion tecnica de este repositorio es exclusivamente de despliegue: conversion a RKLLM, cuantizacion w4a16 y reparto sobre 2 nucleos NPU del RK3576, con verificacion de integridad mediante SHA-256.

## Capacidades

- Generacion de texto y comprension del lenguaje, segun la descripcion del modelo fuente en Qualcomm AI Hub.
- Generacion de codigo y resolucion de problemas matematicos basicos, capacidades atribuidas explicitamente a Qwen3-0.6B en la ficha de Qualcomm AI Hub.
- Soporte multilingue, aunque la lista concreta de idiomas no esta disponible.
- Modos de razonamiento "thinking" y "non-thinking" en la familia Qwen3; no se confirma en la documentacion de este repositorio si el checkpoint concreto los expone en la configuracion RKLLM.
- Ejecucion local en el NPU del RK3576, sin dependencia de servicios en la nube.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente, razonamiento multi-paso extendido, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos sin conexion: el modelo se ejecuta integramente en el NPU del RK3576, de modo que un dispositivo de campo puede mantener dialogo en castellano o en otros idiomas sin enviar datos a un servidor. La ventana de 1024 tokens obliga a disenos de turno corto y a resumir el historial.
- Clasificacion y enrutado de texto en dispositivos de borde: etiquetado de incidencias, categorizacion de tickets o deteccion de intencion en un kiosco, donde la tarea cabe en pocos cientos de tokens y no requiere contexto largo.
- Extraccion de campos estructurados: convertir frases breves de formularios, albaranes o partes de incidencia en JSON, aprovechando la generacion de codigo y texto del modelo base para producir salidas con formato fijo.
- Automatizacion domestica e industrial ligera: interpretar comandos en lenguaje natural en una pasarela domotica basada en RK3576 y traducirlos a acciones sobre actuadores, sin salir del dispositivo.
- Educacion y robotica de bajo coste: tutoria de preguntas y respuestas o generacion de explicaciones cortas en un robot educativo, donde el coste por unidad y el consumo importan mas que la precision punta.
- Preprocesado y resumen en pipelines de vision: combinado con un detector de objetos o un OCR que corra en el mismo SoC, el modelo puede redactar descripciones breves o resumir alertas generadas por el modulo de vision.
- Filtrado previo y reduccion de coste en arquitecturas hibridas: usar esta configuracion como primera etapa local para descartar consultas triviales y escalar solo las complejas a un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput, y la degradacion introducida por la cuantizacion w4a16 respecto al modelo original tampoco esta documentada.

## Requisitos de hardware

- El repositorio esta orientado exclusivamente al SoC Rockchip RK3576, con 2 nucleos NPU y el runtime RKLLM v1.2.4.
- El tamano del repositorio es de aproximadamente 0,7 GB, lo que da una idea del espacio de almacenamiento necesario para los artefactos cuantizados.
- VRAM estimada para inferencia: no disponible; el despliegue no usa VRAM de GPU, sino memoria del sistema y el NPU del SoC.
- GPU recomendadas: no aplica a esta distribucion. Para ejecutar el modelo fuente sobre GPU habria que usar los pesos originales de Qwen/Qwen3-0.6B, no estos ficheros.
- Compatibilidad con GPU de consumo: no aplica; los ficheros RKLLM no se cargan en CUDA.
- Opciones de despliegue: runtime RKLLM v1.2.4 sobre RK3576. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tokens por segundo ni de tiempo de primera respuesta.
- Nota de integridad: deben usarse ficheros de la misma configuracion y verificarse con `sha256sum -c SHA256SUMS` antes del despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3576-LLM-Qwen3-0.6B | 0,6 B | 1024 tokens | RKLLM para RK3576 | Apache 2.0 | Hugging Face y ModelScope, revision v1.2.4 |
| RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507 | 4 B | no disponible | RKLLM para RK3576 | no disponible | Hugging Face |
| Qwen/Qwen3-0.6B (original) | 0,6 B | no disponible en la informacion proporcionada | Pesos originales (no RKLLM) | Apache 2.0 | Hugging Face |
| Qwen3-0.6B en Qualcomm AI Hub | 0,6 B | no disponible | Optimizado para hardware Snapdragon | no disponible | Qualcomm AI Hub |
| Qwen3-0.6B en Microsoft Foundry | 0,6 B | no disponible | Servicio gestionado en la nube | no disponible | Microsoft Foundry |

Frente a las alternativas en la nube, la propuesta de RKNNAI se diferencia por ejecucion local, aislamiento de datos y coste marginal nulo por consulta, a cambio de una ventana de contexto muy inferior y de la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Contexto reducido a 1024 tokens en la configuracion RKLLM, muy por debajo de lo habitual en modelos de chat; los dialogos largos o documentos extensos no caben sin truncado o resumen externo.
- Cuantizacion w4a16: la reduccion a 4 bits de los pesos puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento y matematicas. No se han publicado mediciones de esa perdida.
- No es un modelo entrenado por el autor del repositorio: las capacidades y los sesgos proceden de Qwen3-0.6B, y no se documentan evaluaciones de sesgo en esta ficha.
- Riesgo de alucinacion inherente a un modelo de 0,6 B de parametros, agravado por la cuantizacion; no debe usarse como fuente de verdad sin verificacion externa.
- La documentacion no especifica la lista de idiomas soportados ni el comportamiento real en castellano.
- Dependencia de proveedor: los ficheros solo funcionan sobre el runtime RKLLM v1.2.4 y el SoC RK3576; no hay portabilidad a GPU, CPU generica ni a otros formatos como GGUF.
- Estado de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su funcionamiento en produccion.
- Licencia Apache 2.0, que permite uso comercial, pero se deben conservar los avisos de copyright del modelo fuente, tal como indica el propio repositorio.
- No se documentan requisitos de memoria, latencia ni consumo energetico, datos criticos para planificar un despliegue en borde.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3-0.6B
- Modelo fuente Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio hermano para RK3576: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Ficha de Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Ficha de Qwen3-0.6B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-0.6b
- Descarga via ModelScope: `modelscope download --model RKNNAI/RK3576-LLM-Qwen3-0.6B --revision v1.2.4`
