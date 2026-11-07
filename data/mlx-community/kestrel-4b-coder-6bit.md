# mlx-community/Kestrel-4B-Coder-6bit

## Resumen

Kestrel-4B-Coder es un ajuste fino (fine-tune) orientado a código y agentes sobre Qwen3.5-4B, preparado a partir de la versión de Unsloth del modelo base. Lo publica la comunidad MLX en formato de 6 bits para su ejecución en Apple Silicon mediante el framework MLX, mientras que el autor original del ajuste (Jackrong) distribuye el checkpoint fusionado y una versión GGUF. El objetivo declarado es llevar "inteligencia útil más cerca del dispositivo": generación de código práctica, razonamiento compacto y flujos de trabajo asistidos por herramientas que puedan ejecutarse en hardware personal sin depender de inferencia remota.

El modelo conserva la arquitectura multimodal del Qwen3.5-4B original (pipeline image-text-to-text) e incorpora los pesos MTP/NextN para decodificación especulativa, lo que reduce la latencia en inferencia local. Con 4.539.265.536 parámetros y un repositorio de 4,1 GB en cuantización de 6 bits, está pensado para equipos con presupuesto de memoria ajustado: portátiles, estaciones de trabajo con Apple Silicon y dispositivos edge.

Su relevancia actual reside en la combinación de tres factores: un tamaño que cabe en GPUs de consumo, un entrenamiento orientado explícitamente a tool calling y agentes multi-turno, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. La versión aquí descrita es la conversión a MLX de 6 bits; el autor reporta sus evaluaciones de código sobre GGUF Q8_0, no sobre esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; incluye pesos MTP/NextN para decodificación especulativa |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 6 bits (esta versión MLX); el autor distribuye además GGUF Q8_0; existe una variante MLX de 4 bits |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF disponible en el repositorio del autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con capacidad de procesar imagen y texto, y le aplica un ajuste fino supervisado (SFT) con destilación. La preparación consistió en fusionar la adaptación de código en los pesos de unsloth/Qwen3.5-4B, conservando los pesos MTP/NextN (multi-token prediction) y los componentes de visión heredados. El tokenizador y la plantilla de chat provienen del adaptador publicado; la model card indica explícitamente que debe usarse la plantilla incluida para interacciones de chat y herramientas.

El corpus de entrenamiento contiene aproximadamente 150.000 ejemplos de código y razonamiento complejo, con tres componentes principales: unos 40.000 ejemplos de interacción con agentes y uso de herramientas destilados de Qwen3.8-27B (llamadas multi-turno, seguimiento de estado del entorno, autocorrección y reflexión sobre límites de tareas y herramientas); ejemplos densos de algoritmos y generación de código destilados de Qwen3.8-Flash-Next y Qwen3.8-Max (implementación de algoritmos complejos, sintaxis rigurosa, manejo de casos límite y refactorización); y ejemplos seleccionados de la familia nvidia/Nemotron para razonamiento multi-paso y seguimiento estricto de instrucciones. El control de calidad aplica validación sintáctica basada en AST sobre el código aplicable, deduplicación y limpieza, y filtros de ejecución en sandbox.

La innovación técnica más destacable es la incorporación de decodificación especulativa mediante MTP con longitud de borrador máxima de 2, que el autor emplea en sus evaluaciones para reducir la latencia. El enfoque de "razonamiento compacto" busca que el modelo gaste su presupuesto de generación en la siguiente acción útil en lugar de en cadenas de pensamiento largas, algo crítico cuando un agente repite el bucle Leer → Razonar → Llamar herramientas → Editar → Probar muchas veces en un dispositivo con ancho de banda de memoria limitado.

## Capacidades

- Generación de código en múltiples lenguajes, con énfasis en implementación de algoritmos, manejo de casos límite y refactorización.
- Razonamiento multi-paso y resolución de problemas de programación.
- Tool calling y function calling, con soporte para llamadas multi-turno y seguimiento del estado del entorno.
- Comportamiento de agente: autocorrección, reflexión sobre límites de tareas y herramientas, y bucles de edición y prueba.
- Capacidades multimodales heredadas del modelo base (entrada de imagen y texto), aunque las evaluaciones publicadas se centran en texto, código y comportamiento de agente.
- Soporte multilingüe en inglés, chino, coreano, japonés, ruso y español.
- Decodificación especulativa mediante pesos MTP/NextN integrados.
- Modo de razonamiento compacto orientado a reducir la generación innecesaria en inferencia local.

## Casos de uso

- Asistente de código en el IDE sobre portátil: con 4,54 mil millones de parámetros en 6 bits, el modelo cabe en la memoria unificada de un Mac con Apple Silicon y puede ofrecer autocompletado y edición contextual sin enviar código a un servicio remoto.
- Agente de refactorización local: el modelo puede recibir el estado del repositorio, llamar a herramientas de búsqueda y edición, aplicar cambios y verificar el resultado en un bucle acotado, gracias a su entrenamiento en seguimiento de estado y autocorrección.
- Automatización de tareas de CI/CD: integrado mediante tool calling, puede interpretar fallos de tests, proponer parches y ejecutar comprobaciones en sandbox, con la ventaja de que la validación AST del entrenamiento favorece código sintácticamente correcto.
- Generación de tests unitarios: su énfasis en casos límite y sintaxis rigurosa lo hace adecuado para producir suites de pruebas a partir de firmas de funciones y documentación existente.
- Asistencia en dispositivos edge sin conectividad: al ejecutarse con MLX o llama.cpp, puede desplegarse en entornos con red intermitente o requisitos de privacidad, manteniendo el código y los datos en el dispositivo.
- Prototipado de agentes multi-herramienta: investigadores pueden usar el modelo como banco de pruebas de bajo coste para validar arquitecturas de agentes antes de escalar a modelos mayores, aprovechando su soporte de function calling y decodificación especulativa.
- Soporte multilingüe en documentación técnica: con cobertura de inglés, chino, coreano, japonés, ruso y español, puede generar y traducir documentación de código en equipos distribuidos.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a la versión GGUF Q8_0 con llama.cpp CUDA, decodificación especulativa MTP (longitud de borrador máxima 2), temperatura 0,2 y top-p 0,95, sobre 164 tareas de programación con cinco muestras por tarea (820 generaciones por modelo). No se han publicado resultados específicos para la conversión MLX de 6 bits.

| Metrica | Kestrel-4B-Coder | Qwen3.5-4B | Qwopus3.5-9B-Coder-Flash | Qwen3.5-9B |
|---|---|---|---|---|
| HumanEval Pass@1 | 83,66% | 72,56% | 91,83% | 85,24% |
| HumanEval Pass@5 | 94,51% | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

El extracto de la model card se interrumpe durante la fila de HumanEval Pass@5, por lo que no se dispone del resto de valores de la tabla ni de resultados de HumanEval+.

## Requisitos de hardware

- VRAM estimada: el repositorio de 6 bits ocupa 4,1 GB, por lo que la inferencia requiere aproximadamente 5-6 GB de memoria considerando overhead de contexto y caché KV (estimación, no dato publicado).
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 con memoria unificada suficiente) para la versión MLX; GPUs NVIDIA (RTX 3060 12 GB, RTX 4070, RTX 4090) para la versión GGUF con llama.cpp CUDA, que es la configuración usada en las evaluaciones del autor.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM en cuantización de 6 bits; la variante de 4 bits reduce aún más el requisito.
- Opciones de despliegue: MLX (esta versión), llama.cpp y LM Studio (versión GGUF), así como el stack transformers. El autor menciona LM Studio sobre Apple Silicon para sus pruebas de agente.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa MTP con borrador de longitud 2 está orientada a reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-4B-Coder | 4,54 B | No disponible | 83,66% (Q8_0) | Apache 2.0 | MLX 6-bit y 4-bit, GGUF, checkpoint fusionado |
| Qwen3.5-4B | 4 B (aprox.) | No disponible | 72,56% | No disponible en la información | Modelo base en Hugging Face |
| Qwopus3.5-9B-Coder-Flash | 9 B (aprox.) | No disponible | 91,83% | No disponible en la información | No disponible en la información |
| Qwen3.5-9B | 9 B (aprox.) | No disponible | 85,24% | No disponible en la información | No disponible en la información |

Kestrel-4B-Coder supera a su base Qwen3.5-4B en 11,1 puntos de Pass@1 con la mitad de parámetros que los modelos de 9 B comparados, aunque queda por debajo de Qwopus3.5-9B-Coder-Flash (91,83%) y de Qwen3.5-9B (85,24%) en la métrica de código. La ventaja competitiva del modelo es el tamaño reducido con licencia Apache 2.0 y soporte multimodal, no el rendimiento absoluto.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden a GGUF Q8_0; el rendimiento de esta conversión MLX de 6 bits puede diferir y no ha sido evaluado por el autor.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar tareas que dependan de ventanas largas sin verificarla empíricamente.
- El corpus de entrenamiento es mayoritariamente sintético y destilado de modelos mayores (Qwen3.8-27B, Qwen3.8-Flash-Next, Qwen3.8-Max, Nemotron); puede heredar sesgos y errores de esos profesores, y la destilación no garantiza cobertura de dominios poco representados.
- Riesgo de alucinación en APIs, librerías y funciones inexistentes, habitual en modelos de código de este tamaño; la validación AST del entrenamiento reduce errores de sintaxis pero no de semántica.
- El enfoque de "razonamiento compacto" puede penalizar tareas que requieren cadenas de pensamiento largas o planificación extensa.
- La model card advierte de que debe usarse la plantilla de chat incluida; plantillas alternativas pueden degradar el comportamiento de tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene verificar en su propia model card.
- El soporte de visión es heredado y no está evaluado en esta ficha; no se han publicado resultados multimodales.
- No hay métricas publicadas de latencia, throughput ni consumo energético, datos relevantes para despliegues en edge.

## Enlaces

- Modelo en Hugging Face (esta versión): https://huggingface.co/mlx-community/Kestrel-4B-Coder-6bit
- Versión MLX de 4 bits: https://huggingface.co/mlx-community/Kestrel-4B-Coder-4bit
- Checkpoint fusionado del autor: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Versión GGUF con pesos MTP: https://huggingface.co/Jackrong/Kestrel-4B-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión de Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Framework Unsloth en GitHub: https://github.com/unslothai/unsloth
- Perfil de Kyle Hessling en X (colaboración y pruebas): https://x.com/KyleHessling1
- Unsloth: https://unsloth.ai/
