# KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GGUF es una cuantizacion post-entrenamiento en formato GGUF del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario KarLexAI bajo la etiqueta KLX-IQ1_S. Se trata de un modelo de mezcla de expertos (MoE) de 748.494.643.824 parametros (aproximadamente 748B, que el autor redondea a 763B en su model card) comprimido hasta 232,6 GB, lo que permite ejecutarlo en cuatro GPU H100 de 80 GB con llama.cpp estandar, sin necesidad de un fork del runtime.

El interes de esta publicacion no esta en el modelo base, sino en la compresion extrema: reduce un modelo que en su version original ocupa unos 510 GB a una cuantizacion de 2 bits (IQ1_S) manteniendo, segun el autor, un rendimiento casi identico al de la cuantizacion UD-IQ1_S de Unsloth en las mismas pruebas, con una divergencia KL un 24% menor respecto al modelo completo y una generacion de razonamiento mas corta (16% menos tokens en MATH-500 y 18% menos en AIME 2025).

Es relevante ahora porque demuestra que modelos de escala frontera con capacidades de razonamiento pueden desplegarse en infraestructura relativamente modesta (cuatro aceleradores, no un cluster) manteniendo puntuaciones altas en benchmarks de matematicas y seguimiento de instrucciones. El repositorio, sin embargo, no incluye informacion sobre el proceso de entrenamiento del modelo base, los idiomas soportados ni el contexto nativo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 748.494.643.824 (~748B; el autor indica 763B en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens configurados en el ejemplo de llama-server; el autor menciona ocho slots paralelos de 81.920 tokens |
| Tipos de cuantizacion | IQ1_S (2 bits), unica carpeta publicada (KLX-IQ1_S) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (seis fragmentos, llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos de aproximadamente 748B parametros totales. La model card no detalla el numero de expertos, la proporcion de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplico RLHF, DPO u otra fase de alineamiento. Tampoco se especifica la variante de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Lo que si esta documentado es el proceso de cuantizacion: se trata de una cuantizacion post-entrenamiento (sin fine-tuning) a IQ1_S, con imatrix (la etiqueta del repositorio lo confirma), que produce un archivo de 232,6 GB con una divergencia KL media de 0,082 respecto al modelo completo. El autor afirma que solo emplea tipos de tensor estandar de llama.cpp y que la plantilla de chat esta integrada; dicha plantilla es el port de Unsloth al formato llama.cpp de la plantilla de DeepSeek (licencia MIT), que reproduce los mismos prompts que el `chat_template.jinja` original. El codificador de vision no esta incluido: es un modelo solo de texto. Para ejecutarlo se requiere una compilacion de llama.cpp con soporte de DeepSeek V4.1 (probada con el commit `bcb0152`).

## Capacidades

- Generacion de texto y razonamiento de varios pasos, con modo de razonamiento explicito (el ejemplo de ejecucion usa `--reasoning-format deepseek`).
- Razonamiento matematico de alta exigencia: el autor reporta 100% en AIME 2025, 96,7% en AIME 2026 y 91,0% en MATH-500.
- Seguimiento de instrucciones: 95,5% en IFEval en modo estricto, segun el autor.
- Conversacion multi-turno con contexto largo: ocho conversaciones simultaneas de 81.920 tokens en la configuracion de referencia.
- Capacidad de mezcla de expertos con compresion extrema a 2 bits manteniendo el comportamiento del modelo completo (KL media de 0,082).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: el modo de razonamiento esta documentado, pero no se detallan capacidades de agente ni de uso de herramientas.
- Capacidades multilingues: no disponible.
- Vision y audio: no incluidas (el codificador de vision queda fuera de esta cuantizacion).

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene puntuaciones altas en AIME y MATH-500 tras la cuantizacion, por lo que puede emplearse para resolver problemas de competicion o verificar demostraciones, con la ventaja de que el razonamiento generado es mas corto que en la cuantizacion de referencia.
- Despliegue en infraestructura de cuatro GPU: equipos con 4x H100 80 GB pueden servir el modelo con llama.cpp estandar, sin forks ni kernels personalizados, lo que simplifica el mantenimiento y la reproducibilidad del entorno.
- Servicio de chat multi-turno con contexto largo: la configuracion documentada admite ocho slots paralelos de 81.920 tokens, adecuada para asistentes conversacionales que necesitan arrastrar historial extenso o documentos largos.
- Evaluacion y experimentacion con modelos frontera comprimidos: investigadores que quieran estudiar el efecto de la cuantizacion a 2 bits sobre el razonamiento pueden comparar KL, longitud de respuesta y puntuaciones frente a UD-IQ1_S con los mismos prompts y semillas.
- Generacion de texto con seguimiento estricto de instrucciones: el 95,5% en IFEval estricto lo hace util para tareas de formateo, extraccion estructurada o transformacion de texto donde el cumplimiento del formato es critico.
- Prototipado en entornos con memoria limitada: la opcion `--fit on` permite mantener parte de los expertos en RAM del sistema, de modo que se puede arrancar el modelo con menos VRAM a costa de latencia, util para pruebas de integracion antes de escalar a hardware completo.
- Analisis de razonamiento eficiente en tokens: al generar aproximadamente un 16% menos de tokens por respuesta en MATH-500, reduce el coste por consulta en cargas de trabajo de razonamiento intensivo.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y comparan KLX-IQ1_S con UD-IQ1_S de Unsloth sobre las mismas 1.099 preguntas y semillas.

| Benchmark | KLX-IQ1_S | UD-IQ1_S | Notas |
|---|---|---|---|
| AIME 2025 | 100% | igual dentro del error | segun el autor |
| AIME 2026 | 96,7% | igual dentro del error | segun el autor |
| MATH-500 | 91,0% | igual dentro del error | 16% menos tokens por respuesta que UD-IQ1_S |
| IFEval (strict) | 95,5% | no disponible | segun el autor |
| KL media vs. modelo completo | 0,082 | no disponible (24% mayor segun el autor) | menor es mejor |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base sin cuantizar, ni comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 232,6 GB; en la configuracion de referencia con 4x H100 80 GB cada GPU aloja unos 44 GiB y el resto del archivo queda mapeado en memoria en RAM del sistema. En total se necesita mas memoria que el tamano del archivo, sumando VRAM y RAM.
- GPU recomendadas: 4x NVIDIA H100 80 GB para la configuracion documentada. No se documenta soporte en A100, RTX 4090 ni otras GPU consumer.
- GPU consumer: no cabe en ninguna GPU consumer individual; con `--fit on` se puede descargar parte de los expertos a RAM del sistema, pero no se especifican requisitos minimos ni rendimiento en ese modo.
- Opciones de despliegue: llama.cpp (llama-server) con soporte de DeepSeek V4.1, commit probado `bcb0152`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. Solo se documenta la concurrencia de ocho slots de 81.920 tokens.
- Descarga: `hf download KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF --include "KLX-IQ1_S/*" --local-dir .` y arranque con `llama-server -m KLX-IQ1_S/DeepSeek-V4.1-Flash-1017-KLX-IQ1_S-00001-of-00006.gguf --fit on -c 131072 --jinja --reasoning-format deepseek --temp 1.0 --top-p 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KLX-IQ1_S (este repo) | ~748B (MoE) | 131.072 configurados | IQ1_S, 232,6 GB | MIT | Hugging Face, llama.cpp |
| UD-IQ1_S (Unsloth, misma base) | ~748B (MoE) | no disponible | IQ1_S, tamano ligeramente mayor segun el autor | MIT (base) | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (modelo completo) | ~748B (MoE) | no disponible | sin cuantizar, ~510 GB | MIT | Hugging Face |

La comparacion se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos de la misma categoria. Frente a UD-IQ1_S, el autor reporta puntuaciones equivalentes, 24% menos divergencia KL y respuestas mas cortas; frente al modelo completo, la diferencia principal es el tamano (232,6 GB frente a 510 GB) y la perdida de precision inherente a 2 bits.

## Limitaciones y advertencias

- Cuantizacion a 2 bits: aunque la KL media es baja (0,082), existe degradacion respecto al modelo completo, especialmente en tareas no cubiertas por los benchmarks reportados.
- Solo texto: el codificador de vision no esta incluido, por lo que no puede procesar imagenes.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni calidad fuera del ingles.
- Sin datos de sesgos ni de alucinacion: la model card no incluye evaluaciones de seguridad, sesgo o fiabilidad factual.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y creado recientemente; no hay validacion independiente de los resultados reportados.
- Requisito de version especifica de llama.cpp: se necesita una compilacion con soporte de DeepSeek V4.1 (commit `bcb0152` probado); versiones anteriores pueden no cargar el modelo.
- Memoria total superior al tamano del archivo: hay que sumar VRAM y RAM del sistema; la afirmacion de que funciona en 4x H100 asume suficiente RAM para el mapeo del resto del archivo.
- Licencia MIT heredada del modelo base: permite uso comercial, pero el autor no es DeepSeek ni Unsloth y no ofrece garantias sobre el modelo subyacente.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir su disponibilidad en produccion sin verificacion previa.
- Los benchmarks del autor no han sido replicados de forma independiente y las comparaciones con UD-IQ1_S se presentan como "iguales dentro del error" sin detallar los intervalos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Benchmarks detallados: https://huggingface.co/KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF/blob/main/BENCHMARKS.md
- Licencia: https://huggingface.co/KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF/blob/main/LICENSE
- Carpeta de la cuantizacion: https://huggingface.co/KarLexAI/DeepSeek-V4.1-Flash-1017-GGUF/tree/main/KLX-IQ1_S
- Sitio del autor: https://karlex.ai
