# Cactus-Compute/needle

## Resumen
Needle es un modelo de lenguaje de 26 millones de parametros (30,4 millones segun los pesos safetensors) desarrollado por Cactus-Compute, una empresa centrada en IA para dispositivos de borde. El modelo ha sido destilado a partir de Gemini 3.1 para especializarse en function calling y tool use, con el objetivo de ejecutarse en telefonos, wearables, domotica y robots. Su arquitectura es un encoder-decoder basado unicamente en atencion (sin capas FFN), con 12 capas de encoder y 8 de decoder, dimension de modelo 512 y un vocabulario SentencePiece BPE de 8192 tokens. Se entreno con 200 mil millones de tokens en 16 TPU v6e durante 27 horas, seguido de un ajuste fino con 2 mil millones de tokens de datos de llamadas a funciones en 45 minutos. El modelo es relevante porque demuestra que es posible llevar capacidades de agente a dispositivos con recursos minimos, con un binario de 14 MB y un consumo de RAM de sesion de 28 MB, manteniendo velocidades de 6000 tokens/s en prefill y 1200 tokens/s en decode gracias al runtime propietario Cactus.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder, atencion pura sin FFN, GQA (8H/4KV), RoPE, residuales con puerta |
| Parametros totales | 30.427.676 (segun safetensors; la model card indica 26M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (entrenamiento), INT4 QAT (durante entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (JAX/Flax) |

## Arquitectura y entrenamiento
Needle emplea una arquitectura encoder-decoder con atencion pura, eliminando por completo las capas de feed-forward (FFN) tipicas de los transformers convencionales. El encoder consta de 12 capas con atencion de consultas agrupadas (GQA) con 8 cabezas de consulta y 4 cabezas de clave/valor, posicionales rotatorias (RoPE) y residuales con puerta. El decoder tiene 8 capas con auto-atencion enmascarada y atencion cruzada sobre el encoder, tambien con residuales con puerta. La normalizacion se realiza mediante ZCRMSNorm (zero-centered RMSNorm con inicializacion a cero). El modelo comparte embeddings entre encoder y decoder, y la salida se proyecta a traves de una capa lineal atada al vocabulario.

El entrenamiento se realizo en dos fases: un preentrenamiento de 200 mil millones de tokens en 16 TPU v6e durante 27 horas, seguido de un ajuste fino con 2 mil millones de tokens de datos especificos de llamadas a funciones, que tardo 45 minutos. Durante el entrenamiento se aplico cuantizacion INT4 QAT (quantization-aware training), lo que permite una inferencia eficiente en hardware de bajo consumo. Los pesos y el codigo de generacion de datos estan completamente abiertos bajo licencia MIT.

## Capacidades
- Generacion de texto y respuestas a consultas, aunque su foco principal es el function calling.
- Soporte de tool calling y function calling: el modelo recibe una lista de herramientas en formato JSON y devuelve la llamada adecuada con sus argumentos.
- Extraccion estructurada de informacion a partir de texto, gracias a su entrenamiento especifico en datos de herramientas.
- Capacidad de uso como agente en dispositivos de borde, con latencia muy baja gracias al runtime Cactus.
- Soporte de finetuning local en equipos de escritorio o portatiles, mediante interfaz web o CLI.
- No se especifican capacidades de vision, audio o razonamiento multimodal.

## Casos de uso
- Atencion al cliente automatizada en dispositivos de borde: el modelo puede gestionar consultas sencillas y ejecutar acciones como consultar el estado de un pedido o modificar una reserva, llamando a las APIs correspondientes sin depender de la nube.
- Asistentes de voz en wearables y telefonos: al ser extremadamente ligero, puede ejecutarse localmente para interpretar comandos de voz y activar funciones del dispositivo, como enviar mensajes o controlar la reproduccion de musica.
- Domotica y smart home: integrado en hubs locales, puede interpretar ordenes en lenguaje natural y traducirlas a llamadas a dispositivos IoT (encender luces, ajustar termostatos, bloquear puertas) con tiempos de respuesta inferiores a 100 ms.
- Robots y dispositivos autonomos: permite que robots de bajo coste ejecuten tareas de planificacion simple y control de herramientas sin conexion a internet, reduciendo la dependencia de servicios externos.
- Extraccion de datos estructurados en aplicaciones moviles: puede convertir texto no estructurado (por ejemplo, correos electronicos o recibos) en objetos JSON con campos definidos, util para aplicaciones de productividad y finanzas personales.
- Pruebas y prototipado de agentes en entornos con recursos limitados: su pequeño tamano permite iterar rapidamente en el diseno de pipelines de tool calling antes de escalar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas estandar como MMLU, HumanEval o GSM8K. Los unicos datos de rendimiento proporcionados son velocidades de inferencia en el runtime Cactus: 6000 tokens/s en prefill y 1200 tokens/s en decode, medidos en produccion.

## Requisitos de hardware
- VRAM estimada: no requiere VRAM dedicada; funciona en CPU con 28 MB de RAM de sesion (el binario pesa 14 MB).
- GPU recomendadas: ninguna; esta disenado para dispositivos sin GPU, como telefonos, wearables y microcontroladores.
- Compatibilidad con GPU de consumo: no es relevante, aunque puede ejecutarse en cualquier equipo con JAX/Flax instalado.
- Opciones de despliegue: runtime Cactus (recomendado para produccion), JAX/Flax para experimentacion, y finetuning local via CLI o interfaz web.
- Latencia y throughput: 6000 tokens/s de prefill y 1200 tokens/s de decode en el runtime Cactus; en otros entornos no se han publicado mediciones.

## Comparativa con modelos similares
No se dispone de comparativas publicadas con otros modelos de tamano similar. Como referencia cualitativa, frente a modelos como SmolLM2-135M o Qwen2.5-0.5B, Needle es significativamente mas pequeño (26M vs 135M o 500M) y esta especializado exclusivamente en function calling, mientras que los otros son modelos genericos de proposito general. No hay datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- Tamano muy reducido: 26 millones de parametros limita severamente la capacidad de razonamiento complejo, comprension de matices y generacion de texto extenso.
- Especializacion estrecha: el modelo esta optimizado para function calling; su rendimiento en tareas generales de lenguaje puede ser pobre.
- Sesgos y alucinaciones: al ser un modelo destilado y pequeno, puede generar llamadas a funciones incorrectas o inventar argumentos si la consulta es ambigua o fuera de su dominio de entrenamiento.
- Idiomas no especificados: no se indica que idiomas soporta; probablemente este optimizado para ingles, lo que limita su uso en otros idiomas.
- Longitud de contexto desconocida: no se ha publicado el tamano de la ventana de contexto, lo que impide conocer su capacidad para manejar conversaciones largas o documentos extensos.
- Dependencia del runtime Cactus: las velocidades anunciadas se logran solo con este runtime propietario; otros entornos pueden ofrecer rendimiento inferior.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo puede tener limitaciones de calidad en produccion real.

## Enlaces
- [Hugging Face - Cactus-Compute/needle](https://huggingface.co/Cactus-Compute/needle)
- [GitHub - cactus-compute/needle](https://github.com/cactus-compute/needle)
- [Blog - Needle: We Distilled Gemini Tool Calling into a 26M Model](https://cactuscompute.com/blog/needle)
- [Pagina de producto - Needle 2](https://cactuscompute.com/needle)
- [Documentacion - Simple Attention Networks](https://github.com/cactus-compute/needle/blob/main/docs/simple_attention_networks.md)
