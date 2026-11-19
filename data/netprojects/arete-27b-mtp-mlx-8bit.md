# netprojects/Arete-27B-MTP-MLX-8bit

## Resumen

Arete-27B-MTP-MLX-8bit es una conversión a MLX del modelo NousResearch/Arete-27B, un ajuste fino supervisado completo de Qwen3.8-27B orientado a respuestas factuales y directas sobre temas políticamente sensibles en siete áreas, preservando las capacidades generales y agénticas del modelo base. La conversión la publica el usuario netprojects e incluye un cabezal MTP (multi-token prediction) para acelerar la decodificación en Apple Silicon.

El modelo mantiene la arquitectura multimodal del base: torre de visión en bfloat16 y modelo de lenguaje cuantizado a 8 bits en formato afín con grupo 64. El repositorio ocupa 30,0 GB y los pesos suman 27.781.427.952 parámetros. La longitud de contexto no se especifica en la información disponible, aunque el modelo base Qwen3.8-27B es la referencia para inferirla.

La relevancia de esta ficha radica en que combina tres piezas poco habituales: un ajuste fino con objetivos de factualidad medibles, una cuantización de alta fidelidad (99,1 % de coincidencia de siguiente token con bf16 y KL de 0,0005) y un cabezal MTP que reporta 2,18x de aceleración en decodificación greedy. Es una opción práctica para desplegar un modelo de 27B en Macs con memoria suficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredero de Qwen3.8-27B) con torre de visión y cabezal MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (torre de visión en bfloat16); la familia incluye builds de 6, 4, 3, 2.5 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B: un transformer multimodal con torre de visión, sobre el que Nous Research aplicó un ajuste fino supervisado completo (SFT) con datos exclusivamente de texto y el codificador visual congelado. El objetivo del entrenamiento es mejorar la factualidad y reducir la propaganda en respuestas sobre temas políticamente sensibles en siete áreas, sin degradar habilidades generales ni agénticas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La conversión a MLX cuantiza el modelo de lenguaje a 8 bits afín con grupo 64 y deja la torre de visión en bfloat16. El cabezal MTP incluido (`model-mtp.safetensors`) no proviene de Arete-27B, sino que es el cabezal MTP sin cambios de Qwen/Qwen3.8-27B (revisión `37561816`), cuantizado al mismo ancho de bits. Como ese cabezal se entrenó contra el modelo base y no contra el ajuste fino, funciona como modelo borrador sobre un fine-tune; mlx-vlm lo usa como draft integrado al pasar el mismo repositorio como `--draft-model`. El `config.json` del build fija `mtp_num_hidden_layers` a 1 (el original lo tenía a 0) para que los cargadores detecten el cabezal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen y soporte de modo thinking (desactivable con `enable_thinking=False`).
- Razonamiento y respuestas factuales sobre temas sensibles, con métricas declaradas por Nous Research de mejora en fact score y reducción de propaganda.
- Capacidades agénticas y de terminal: el modelo base reporta resultados en Terminal-Bench-2.1 y Hermes Bench.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Generación de código y resolución de problemas matemáticos (GSM8K reportado en los builds de la familia).
- Visión imagen-texto mediante mlx-vlm: descripción de imágenes, lectura de capturas de pantalla y preguntas sobre contenido visual.
- Decodificación especulativa con cabezal MTP para acelerar la generación en modo greedy.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional con postura factual: el ajuste fino está diseñado para responder de forma directa y sin propaganda en temas políticamente sensibles, lo que lo hace adecuado para aplicaciones de divulgación o análisis donde la neutralidad factual es un requisito medible.
- Agente de terminal y automatización de tareas: el modelo base reporta 70 en Terminal-Bench-2.1 frente a 67 de Qwen3.8-27B, por lo que puede integrarse en flujos que ejecutan comandos, interpretan salidas y encadenan pasos con tool calling.
- Análisis de capturas de pantalla y documentación visual: con mlx-vlm se le puede pasar una imagen de un terminal o una interfaz y preguntar por errores o elementos concretos, útil en soporte técnico y triaje de incidencias.
- Generación de código en local sobre Apple Silicon: con 8 bits y MTP alcanza 28,6 tok/s en decodificación greedy, suficiente para autocompletado y generación de funciones en un portátil Mac de gama alta.
- Evaluación de factualidad y sesgo en pipelines de investigación: al disponer de métricas comparativas frente al base (fact score 2,98 vs 2,32; propaganda 0,9 % vs 22 %), sirve como referencia en estudios de alineación y sesgo político.
- Despliegue de un 27B multimodal en estación de trabajo Mac: el build de 8 bits ocupa 29,9 GB y encaja en Macs con memoria unificada amplia, permitiendo prototipado sin GPU dedicada.
- Servidor local compatible con OpenAI: mlx-lm expone un servidor que devuelve `tool_calls` en formato OpenAI, lo que facilita sustituir APIs externas en prototipos y pruebas de integración.

## Benchmarks y rendimiento

Datos de la familia de builds publicados por el autor de la conversión (no son mediciones del modelo original salvo donde se indica):

| Metrica | Valor (build 8-bit) |
|---|---|
| Coincidencia de siguiente token con bf16 | 99,1 % |
| KL frente a bf16 | 0,0005 |
| Bits por peso | 8,63 |
| Tamano | 29,9 GB |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |
| Throughput greedy sin MTP | 13,1 tok/s |
| Throughput greedy con MTP | 28,6 tok/s (2,18x) |
| Tasa de aceptación MTP | 77 % |

Cifras de Nous Research para los pesos originales frente a Qwen3.8-27B:

| Metrica | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9 % | 22 % |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

GSM8K del build de 8 bits: no medido en la información disponible (el 6-bit reporta 46/50, el 4-bit 47/50 y el 3-bit 49/50).

## Requisitos de hardware

- VRAM/memoria unificada: el build de 8 bits ocupa 29,9 GB en disco; el pico de memoria para prompt de 8K tokens no se reporta para este build (el 3-bit reporta 14,6 GB y el 2,5-bit 13,8 GB en mlx-lm con texto).
- GPU recomendadas: Apple Silicon exclusivamente (MLX). El autor midió en un MacBook Pro M5 Max de 128 GB.
- Cabe en GPU de consumo: no aplica en el sentido habitual; requiere Mac con memoria unificada. El autor indica que el build de 3 bits necesita un Mac de 24 GB o más; para el de 8 bits no se especifica el mínimo, pero por tamaño conviene un Mac con 48 GB o más.
- Opciones de despliegue: mlx-lm >= 0.32.2 para texto y servidor compatible con OpenAI; mlx-vlm >= 0.7.11 para imágenes y para usar el cabezal MTP como draft model.
- Latencia y throughput: 13,1 tok/s sin MTP y 28,6 tok/s con MTP en decodificación greedy sobre M5 Max, con 77 % de aceptación. Las ganancias dependen del prompt y pueden ser menores en textos distintos a los de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Arete-27B-MTP-MLX-8bit | 27,8B | no disponible | Apache 2.0 | safetensors MLX | Fine-tune factual de Qwen3.8-27B, MTP incluido, solo Apple Silicon |
| Arete-27B-MTP-MLX-6bit | 27,8B | no disponible | Apache 2.0 | safetensors MLX | Build recomendado por el autor: 23,1 GB, 98,7 % de coincidencia con bf16 |
| Arete-27B-MTP-MLX-4bit | 27,8B | no disponible | Apache 2.0 | safetensors MLX | 16,3 GB, 95,5 % de coincidencia, 39,8 tok/s con MTP |
| NousResearch/Arete-27B | 27,8B | no disponible | Apache 2.0 | safetensors | Pesos originales en bf16, sin MTP, para GPU y otros runtimes |

## Limitaciones y advertencias

- El cabezal MTP se entrenó contra Qwen3.8-27B y no contra Arete-27B: es un cabezal de modelo base aplicado sobre un fine-tune, lo que puede reducir la tasa de aceptación en dominios donde el ajuste fino diverge del base.
- Con decodificación greedy, el texto con MTP coincide con la decodificación simple hasta un empate cercano; en respuestas largas puede divergir ligeramente por el redondeo del chequeo por lotes.
- El autor no reporta mediciones de este build para GSM8K ni para pico de memoria con prompt de 8K; las cifras de la tabla de benchmarks son de los pesos originales o de otros builds de la familia.
- Riesgo de alucinación: no se documenta una evaluación específica de alucinación en la información disponible; el fact score es una métrica propia de Nous Research y no equivale a una tasa de alucinación.
- Sesgos: el ajuste fino está orientado explícitamente a temas políticamente sensibles en siete áreas; no se detalla la metodología de anotación ni la cobertura temática completa.
- Idiomas soportados no documentados; el comportamiento multilingüe heredado de Qwen3.8-27B no se ha verificado en esta conversión.
- El modelo solo funciona en Apple Silicon con MLX; no es desplegable en CUDA, ROCm ni CPU convencional sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de los datos de entrenamiento de Nous Research no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras del autor.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo del cabezal MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16
