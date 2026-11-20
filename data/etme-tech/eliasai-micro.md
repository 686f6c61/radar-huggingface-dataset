# ETME-TECH/EliasAI-Micro

## Resumen

EliasAI-Micro es un ajuste fino (fine-tune) en aleman del modelo base Qwen/Qwen3.5-0.8B-Base, desarrollado por Elias Rickert bajo el sello ETME-TECH. Se trata de un modelo de generacion de texto de proposito conversacional, disenado especificamente para ejecutarse de forma local en hardware de bajos recursos, como una Raspberry Pi o CPUs modestas. El repositorio publica tanto el modelo fusionado completo en bfloat16 (Safetensors) como cuantizaciones GGUF Q8_0 y Q4_K_M listas para llama.cpp, LM Studio y Ollama.

El modelo tiene 1.006.672.704 parametros totales (aproximadamente 1.000 millones, coherente con el nombre comercial "0.8B" del base) y una licencia Apache 2.0 heredada del modelo base. Su entrenamiento se centra en dialogos alemanes de uno y varios turnos, con un formato interno de razonamiento en bloques `<think>` antes de la respuesta final. La model card es explicita al respecto: el modelo no esta pensado para matematicas, conocimiento factual, programacion ni calculos, sino exclusivamente para comprension conversacional y escucha activa.

Su relevancia actual reside en dos factores: por un lado, demuestra un caso de uso de ajuste fino de un modelo Qwen3.5 pequeno para un idioma y una personalidad concretos; por otro, apunta a un nicho de despliegue extremo (hardware sin GPU) donde los modelos de un billon de parametros cuantizados a 4 bits ocupan apenas unos cientos de megabytes. No se han publicado resultados de benchmarks ni datos de rendimiento medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B-Base); detalles internos de atencion no disponibles |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-server usa `-c 4096` |
| Tipos de cuantizacion | bfloat16 (pesos completos), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | aleman (`de`) |
| Licencia | Apache 2.0 (heredada del modelo base Qwen3.5-0.8B-Base) |
| Formato de pesos | Safetensors (bfloat16) y GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de la familia Qwen3.5. La model card no detalla la configuracion interna de capas, cabezas de atencion ni mecanismos especificos (atencion lineal, decodificacion especulativa, etc.), por lo que estos datos deben considerarse no disponibles. El ajuste fino produce un modelo fusionado en bfloat16 que conserva la estructura del base.

El entrenamiento se realizo sobre dialogos alemanes de un solo turno y multi-turno, cubriendo conversacion cotidiana, small talk, subtexto emotivo (emoticonos como `:(((`, `:/`), conversacion tecnica e identidad del asistente. El formato de entrenamiento consiste en un bloque `<think>...</think>` seguido de la respuesta en texto natural, cerrado con el token `<|im_end|>`. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. El objetivo declarado del ajuste es producir un asistente con "personalidad" masculina y tono terrenal, que evite formulas neutras de IA y no ofrezca consejos, listas de verificacion ni recomendaciones no solicitadas.

## Capacidades

- Generacion de texto conversacional en aleman, con respuestas en prosa natural de 3 a 6 frases segun el system prompt sugerido.
- Razonamiento interno previo a la respuesta mediante bloques `<think>`, usado para interpretar estado de animo, contexto y senales emotivas del interlocutor.
- Dialogo multi-turno con mantenimiento de contexto conversacional.
- Manejo de subtexto emotivo y emoticonos como senales de estado de animo.
- Conversacion tecnica y de identidad dentro del dominio conversacional.
- Formato de chat ChatML (`<|im_start|>role\ncontent<|im_end|>`).
- Compatibilidad con `llama-server` y el formato de razonamiento `deepseek` (`--reasoning-format deepseek`).
- No soporta, segun el autor: matematicas, conocimiento factual fiable, programacion ni calculos.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al aleman; no se declaran otros idiomas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Companero conversacional local en aleman: el modelo puede mantener conversaciones multi-turno con tono personal en una Raspberry Pi o CPU modesta, gracias a su tamano de aproximadamente 1.000 millones de parametros y sus cuantizaciones GGUF de bajo peso.
- Asistente de escucha y apoyo emocional ligero: el entrenamiento en subtexto emotivo y su formato `<think>` le permiten interpretar senales como emoticonos y responder en prosa calida sin lanzar consejos no solicitados, adecuado para prototipos de chat de acompanamiento.
- Chatbot de practica de conversacion en aleman: util para entornos educativos o de practica idiomatica donde se busca un interlocutor que responda de forma natural y breve, sin depender de una GPU.
- Despliegue en dispositivos de borde: al caber en cuantizacion Q4_K_M en hardware de muy baja memoria, puede integrarse en dispositivos empotrados o sistemas sin acelerador para interfaces de voz o texto locales.
- Prototipado rapido de personalidad conversacional: sirve como base para experimentar con system prompts, temperaturas y formatos de razonamiento antes de escalar a un modelo mayor como ETME-TECH/EliasAIv4 en GPU propia.
- Integracion en LM Studio u Ollama para pruebas de UX: al publicar GGUF Q8_0 y Q4_K_M, permite evaluar la experiencia conversacional en herramientas de escritorio sin infraestructura adicional.
- Filtro o preprocesado de dialogos: su capacidad de interpretar contexto y emoticonos puede emplearse para clasificar o anotar conversaciones alemanas en pipelines ligeros, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma medida. Como referencia orientativa por tamano, un modelo de aproximadamente 1.000 millones de parametros en bfloat16 ocupa del orden de 2 GB de pesos; la cuantizacion Q8_0 queda en torno a 1 GB y Q4_K_M en torno a 0,6-0,7 GB, si bien estas cifras no las publica el autor.
- GPU recomendadas: no disponibles. El autor orienta el modelo a hardware sin GPU (Raspberry Pi, CPUs debiles); para mayor calidad en GPU propia recomienda ETME-TECH/EliasAIv4.
- Cabe en GPU consumer: si, por tamano; no se documentan pruebas en modelos concretos de GPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` (ejemplo oficial con `-hf ETME-TECH/EliasAI-Micro:Q4_K_M`), LM Studio y Ollama; el repositorio tambien incluye pesos Safetensors para transformers.
- Parametros de inferencia recomendados: temperatura 0.55, top-p 0.90, top-k 40, repeat penalty 1.06, contexto de ejemplo 4096 tokens.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| EliasAI-Micro (este modelo) | 1.006.672.704 | no disponible (ejemplo 4096) | aleman | Apache 2.0 | Conversacional aleman, hardware de bajos recursos |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B (base) | no disponible | multilingue (base) | Apache 2.0 | Modelo base generalista |
| ETME-TECH/EliasAIv4 | no disponible | no disponible | aleman (presumible) | no disponible | Version de mayor calidad del mismo autor para GPU |

La comparativa con alternativas de terceros de la misma categoria no esta disponible en la informacion proporcionada; los unicos modelos comparables documentados son el modelo base y la version mayor del mismo autor.

## Limitaciones y advertencias

- Capacidad muy reducida: aproximadamente 1.000 millones de parametros; el autor advierte explicitamente que no sirve para matematicas, conocimiento factual, programacion ni calculos.
- Riesgo de alucinacion elevado en cualquier consulta factual, dado el enfoque puramente conversacional y el tamano del modelo.
- Idioma limitado al aleman; no se declaran capacidades en castellano ni en otros idiomas.
- Longitud de contexto no documentada; el ejemplo de despliegue usa 4096 tokens, por lo que contextos mayores no estan garantizados.
- Personalidad y estilo deliberadamente marcados (asistente masculino, tono terrenal, sin consejos); esto puede no encajar en aplicaciones que requieran respuestas neutras o estructuradas.
- Dependencia del formato `<think>` y del system prompt recomendado; un uso fuera de ese formato puede degradar la calidad de las respuestas.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-0.8B-Base, que deben revisarse.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Version mayor recomendada por el autor: https://huggingface.co/ETME-TECH/EliasAIv4
