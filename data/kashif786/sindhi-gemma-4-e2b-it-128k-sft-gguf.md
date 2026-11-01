# Kashif786/sindhi-gemma-4-E2B-it-128k-sft-GGUF

## Resumen

Sindhi Gemma 4 E2B IT 128k es un modelo de lenguaje especializado en sindhi, derivado de la familia Gemma 4 y ajustado por instrucciones por Kashif Ali (usuario Kashif786). El repositorio que nos ocupa contiene exclusivamente los pesos cuantizados en formato GGUF del modelo base, pensados para inferencia local en hardware de consumo sin necesidad de GPU dedicada. El modelo parte de un Gemma 4 de aproximadamente 3.250 millones de parametros y aplica una poda del vocabulario del 50 % (de 262k a 131k tokens), lo que reduce el tamano del embedding y acelera la generacion.

La propuesta de valor es cubrir el hueco de herramientas de calidad para sindhi, una lengua indoaria con escaso soporte en modelos abiertos. El autor reporta ventajas medibles frente al Gemma 4 base en tareas de RAG multilingue (ingles a sindhi), sintesis multioracion y velocidad de inferencia, con una huella de memoria notablemente menor. El contexto declarado es de 128k tokens, lo que permite procesar documentos largos en una sola pasada.

Los pesos estan publicados bajo licencia Apache 2.0 y en tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0), con integracion directa en Ollama y llama.cpp. El modelo esta pensado para despliegues ligeros: portatiles, MacBooks, dispositivos edge y entornos con restricciones de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B) |
| Parametros totales | 3.252.837.923 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (segun nombre del modelo) |
| Tipos de cuantizacion | Q4_K_M (~2,1 GB), Q5_K_M (~2,3 GB), Q8_0 (~3,2 GB) |
| Idiomas soportados | sindhi (sd), urdu (ur), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |
| Vocabulario | 131k tokens (podado un 50 % respecto a las 262k del Gemma 4 base) |
| Tamano del repositorio | 8,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4, en su variante E2B de aproximadamente 3.250 millones de parametros. La innovacion principal respecto al modelo fundacional es la poda del vocabulario al 50 % (de 262k a 131k tokens), decision que reduce el coste de las capas de embedding y del softmax final, y que en la practica se traduce en menor huella de memoria y mayor velocidad de decodificacion. El ajuste fino por instrucciones (SFT) se realizo sobre el modelo base podado, con el objetivo de adaptarlo al sindhi y a tareas conversacionales.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales de atencion (atencion lineal, decodificacion especulativa, etc.). Lo que si se documenta es el proceso de cuantizacion a GGUF en tres niveles, con Q8_0 descrito por el autor como practicamente sin perdida (99,9 % de paridad con BF16).

## Capacidades

- Generacion de texto conversacional en sindhi, urdu e ingles, con formato de chat basado en turnos (`<start_of_turn>user` / `<start_of_turn>model`).
- Respuesta a preguntas de conocimiento general y cultural sobre Sindh y la civilizacion del Indo, segun el ejemplo de la model card.
- Traduccion y sintesis multilingue, en particular de documentos en ingles a sindhi (evaluado en el apartado de RAG cross-lingual).
- Sintesis multioracion y resumen de documentos largos, aprovechando la ventana de 128k tokens.
- Integracion en pipelines de RAG ligero (etiqueta `lightweight-rag`).
- Despliegue local en Ollama y llama.cpp con un solo comando.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Atencion al cliente en sindhi: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de 128k tokens, adecuado para consultas de soporte en una lengua con poca cobertura comercial.
- RAG documental ingles-sindhi: ingestión de PDFs en ingles y generacion de respuestas en sindhi con sintesis de varias oraciones, escenario en el que el autor reporta una ventaja clara frente al Gemma 4 base.
- Digitalizacion y resumen de patrimonio cultural: resumen de textos historicos sobre Sindh y la civilizacion del Indo para portales educativos o museos.
- Traduccion asistida de contenido administrativo o periodistico del ingles al sindhi, con revision humana posterior.
- Despliegue en dispositivos edge o portatiles sin GPU: con Q4_K_M (~2,1 GB) cabe en cualquier equipo moderno, util para ONGs, escuelas o entornos con conectividad limitada.
- Prototipado rapido de asistentes conversacionales en sindhi mediante Ollama, sin infraestructura de servidores GPU.
- Investigacion linguistica: generacion de corpus sinteticos o aumentacion de datos para sindhi y urdu, con la cautela de revisar sesgos y alucinaciones.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de una evaluacion del autor, descrita como verificada por "Google Gemini Argon", que compara el modelo SFT de 131k con el Gemma 4 base de 262k. No se aportan resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K), por lo que no se pueden presentar cifras de ese tipo.

| Dimension | Sindhi Gemma 4 SFT (131k) | Gemma 4 base (262k) |
|---|---|---|
| Calidad global de RAG (0-10) | 8,28 | 8,15 |
| RAG cross-lingual (EN a SD) | 8,40 (5-0) | 5,10 |
| Sintesis multioracion | 9,00 (4-1) | 7,50 |
| Velocidad de inferencia | 1,96 s/respuesta | 5,33 s/respuesta |
| Huella de memoria | 6,06 GB (BF16) / 2,1 GB (Q4) | 9,51 GB |

No se han publicado resultados de benchmarks academicos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~2,4 GB con Q4_K_M, ~2,8 GB con Q5_K_M y ~3,8 GB con Q8_0.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecutarse en CPU. Cualquier GPU consumer con 4 GB o mas de VRAM puede alojarlo, pero no es necesario.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en iGPU y Apple Silicon.
- Cabe en portatiles, MacBooks y telefonos segun el autor, al menos en la cuantizacion Q4_K_M.
- Opciones de despliegue: Ollama (comando directo desde Hugging Face o Modelfile local), llama.cpp / llama-cli.
- Latencia y throughput: el autor reporta 1,96 s por respuesta en su evaluacion, sin especificar el hardware empleado. No hay datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sindhi Gemma 4 E2B IT 128k (este) | ~3,25 B | 128k | sd, ur, en | Apache 2.0 | GGUF |
| Gemma 4 base (262k vocab) | no disponible | no disponible | multilingue | Gemma Terms | safetensors |
| Gemma 2 2B IT | ~2,6 B | 8k | multilingue | Gemma Terms | safetensors, GGUF |
| Qwen2.5 3B Instruct | ~3,1 B | 32k | multilingue (incluye urdu parcial) | Apache 2.0 | safetensors, GGUF |

La comparativa con Gemma 2 2B y Qwen2.5 3B es orientativa por tamano y licencia; no se dispone de evaluaciones cruzadas en sindhi que permitan afirmar superioridad en esa lengua. El Gemma 4 base es el referente directo segun la evaluacion del autor.

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Los benchmarks presentados son autoinformados y la "verificacion" por Gemini Argon no es un estandar academico reconocido; deben tomarse con cautela.
- Riesgo de alucinacion inherente a modelos de 3B parametros, especialmente en tareas de conocimiento factual y en lenguas de bajos recursos.
- La poda del vocabulario al 50 % puede degradar el rendimiento en urdu e ingles si los tokens eliminados eran relevantes para esos idiomas.
- Cobertura limitada a tres idiomas (sd, ur, en); no se garantiza comportamiento correcto en otras lenguas.
- No se documentan sesgos especificos ni evaluaciones de seguridad; se desconoce el filtrado del dataset de SFT.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma puede arrastrar terminos adicionales de Google; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- No hay soporte documentado de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- El contexto de 128k debe validarse en la practica: no se aportan pruebas de recuperacion efectiva a esa distancia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-128k-sft-GGUF
- Modelo base (safetensors): https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-128k-sft
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
