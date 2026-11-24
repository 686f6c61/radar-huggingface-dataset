# mradermacher/Opusculum-1.5B-GGUF

## Resumen

Opusculum-1.5B-GGUF es la distribucion en formato GGUF del modelo Stoned-Code/Opusculum-1.5B, un modelo de lenguaje conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) afinado por el usuario Stoned-Code y cuantizado por mradermacher. El modelo base esta construido sobre la libreria transformers y emplea la tecnica de entrenamiento Unsloth, segun las etiquetas de la model card. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo esta especializado en generacion de texto conversacional en ingles, con un enfasis claro en datos de instruccion, roleplay y escritura creativa, a juzgar por los datasets empleados en su afinado: colecciones como kalo-opus-instruct, SynthRP-Gens, Synthstruct-Gens, Hydrus-Claude-Instruct y nopm_claude_writing_fixed. Estos datasets proceden en su mayoria de la comunidad de modelos abiertos (anthracite-org, Epiculous, Delta-Vector, lodrick-the-lafted) y estan orientados a instrucciones sin rechazo y a narrativa.

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica lista para desplegar en entornos con recursos limitados: los archivos GGUF van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16), lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU. No obstante, la informacion publica disponible es escasa: no se detallan la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), segun la libreria transformers; detalles especificos no disponibles |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun la model card); no se detallan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 14,2 GB (incluye todas las cuantizaciones) |
| Modelo base | Stoned-Code/Opusculum-1.5B-V0.1 |
| Metodo de entrenamiento | Unsloth (segun tags) |
| Descargas | 626 |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

La informacion publica no especifica la arquitectura interna del modelo base mas alla de que es un transformer decoder-only compatible con transformers y entrenado con Unsloth. No se detallan el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea alguna innovacion como atencion lineal o decodificacion especulativa. Tampoco se indica el numero de tokens de entrenamiento ni la composicion exacta del dataset en terminos de proporciones.

Lo que si se conoce es la lista de datasets de afinado, que revela una orientacion marcada hacia instrucciones conversacionales y escritura creativa: Stoned-Code/magnum-v4, Delta-Vector/Hydrus-Claude-Instruct-5K, anthracite-org/kalo-opus-instruct-22k-no-refusal, Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned, lodrick-the-lafted/kalo-opus-instruct-3k-filtered, anthracite-org/nopm_claude_writing_fixed, Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned, anthracite-org/kalo_opus_misc_240827 y anthracite-org/kalo_misc_part2. La presencia de datasets con la etiqueta "no-refusal" y de colecciones de roleplay (SynthRP) sugiere un ajuste orientado a reducir rechazos y favorecer narrativa y dialogo. No se documenta si hubo RLHF, DPO u otra fase de alineamiento posterior al SFT.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Instrucciones generales y respuesta a prompts de tipo chat.
- Escritura creativa y narrativa: roleplay, ficcion y continuacion de historias, segun los datasets de afinado.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles documentado; otros idiomas no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere despliegue en infraestructura de inferencia gestionada.

## Casos de uso

- Asistente conversacional ligero en ingles: el modelo puede gestionar dialogos multi-turno basicos en aplicaciones de chat con recursos limitados, al caber en cuantizaciones de 1 GB en GPUs de consumo.
- Prototipado rapido de chatbots: gracias a su tamano reducido y a los archivos GGUF, permite iterar sobre prompts y flujos conversacionales en portatiles sin GPU dedicada.
- Generacion de narrativa y roleplay: los datasets de entrenamiento orientados a escritura creativa y roleplay lo hacen adecuado para herramientas de ficcion interactiva y generacion de historias.
- Educacion y demostraciones: util para ensenar conceptos de cuantizacion e inferencia local con llama.cpp u Ollama en entornos academicos.
- Filtrado y generacion de texto en pipelines: puede emplearse como modelo auxiliar para tareas de reescritura, resumen corto o clasificacion textual en ingles, siempre con validacion humana.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K y Q3_K permiten ejecucion en CPU o en GPUs integradas para tareas de baja latencia y bajo coste.
- Base para fine-tuning adicional: al ser Apache 2.0 y tener solo 1,5B de parametros, sirve como punto de partida para ajustes especificos de dominio con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q4_K_M, 1,7 GB con Q8_0 y 3,2 GB con f16, segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad y cuantizaciones altas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Opusculum-1.5B-GGUF | 1,5B | No disponible | Apache 2.0 | GGUF | Afinado para conversacion y roleplay en ingles |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica del modelo) | Apache 2.0 | Safetensors, GGUF | Modelo generalista multilingue con benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (segun documentacion publica del modelo) | Apache 2.0 | Safetensors, GGUF | Modelo compacto orientado a instrucciones |
| Llama-3.2-1B-Instruct | 1,2B | 128K (segun documentacion publica del modelo) | Llama 3.2 Community License | Safetensors, GGUF | Modelo generalista con licencia restrictiva para algunos usos |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentacion publica general; no se dispone de comparaciones de rendimiento directas con Opusculum-1.5B en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datasets de la comunidad, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: inherente a los modelos de 1,5B de parametros; la capacidad de razonamiento y factualidad es limitada en comparacion con modelos mayores.
- Limitaciones de contexto o idioma: solo ingles documentado; la longitud de contexto no esta especificada, lo que impide planificar aplicaciones con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento originales, algunos con etiqueta "no-refusal".
- Caveats para produccion: la ausencia de benchmarks publicados y de documentacion sobre alineamiento hacen recomendable una evaluacion propia antes de desplegar en produccion; el modelo esta orientado a conversacion y escritura creativa, no a tareas de alta precision como codigo o matematicas.
- El repositorio incluye multiples cuantizaciones (14,2 GB en total); descargar solo el archivo necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Opusculum-1.5B-GGUF
- Modelo base: https://huggingface.co/Stoned-Code/Opusculum-1.5B
- Modelo base V0.1: https://huggingface.co/Stoned-Code/Opusculum-1.5B-V0.1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Opusculum-1.5B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Opusculum-1.5B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
