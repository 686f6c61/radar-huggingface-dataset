# mradermacher/Rosa_v1_3.43B-i1-GGUF

## Resumen

Rosa_v1_3.43B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base guillaume7/Rosa_v1_3.43B, publicada por mradermacher, un conocido autor de cuantizaciones en Hugging Face. El modelo base es un transformer de 3.429.913.600 parametros (aproximadamente 3,43 mil millones), orientado a conversacion y con licencia marcada como "other". Esta publicacion concreta no es un modelo nuevo, sino una distribucion optimizada para inferencia local con llama.cpp y derivados.

La relevancia de esta ficha radica en que las cuantizaciones i1 (imatrix) de mradermacher permiten ejecutar un modelo de 3,4B parametros en hardware de consumo, desde tarjetas con 4 GB de VRAM hasta configuraciones mas modestas usando cuantizaciones de 1 a 3 GB. El repositorio incluye 25 variantes de cuantizacion, desde IQ1_S (0,9 GB) hasta Q6_K (2,9 GB), lo que ofrece un abanico amplio de compromisos entre calidad y consumo de memoria.

No se dispone de informacion sobre la arquitectura interna, el contexto maximo, los datos de entrenamiento ni los idiomas soportados mas alla del ingles declarado en la model card. La ficha se limita, por tanto, a los datos verificables del repositorio y a las caracteristicas tecnicas de las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 3.429.913.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, Q2_K_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | other |
| Formato de pesos | GGUF (imatrix/i1) y safetensors para el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base guillaume7/Rosa_v1_3.43B. Por el numero de parametros (3,43B) y la etiqueta "conversational", se trata presumiblemente de un transformer decoder-only de escala pequena/media, pero no se confirma en la informacion proporcionada. Tampoco se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion: mradermacher genera cuantizaciones i1 (imatrix) utilizando una matriz de importancia (imatrix) calculada sobre el modelo, lo que mejora la calidad respecto a las cuantizaciones estaticas tradicionales en rangos de bits bajos. El repositorio incluye el propio fichero imatrix (Rosa_v1_3.43B.imatrix.gguf) para que otros usuarios puedan generar sus propias cuantizaciones. Ademas, se ofrece una version estatica en el repositorio hermano mradermacher/Rosa_v1_3.43B-GGUF.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y esta pensado para dialogos multi-turno.
- Idiomas: la model card declara unicamente ingles ("en"); no se confirma soporte multilingue.
- Formato GGUF: compatible con llama.cpp, Ollama, LM Studio y otras herramientas de inferencia local.
- Cuantizaciones de muy bajo bit: permite ejecucion en hardware con recursos muy limitados (desde 0,9 GB).
- No se dispone de informacion sobre tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Prototipado de chatbots en local: con la cuantizacion Q4_K_M (2,2 GB) se puede desplegar un asistente conversacional en un portatil con GPU de 4 GB o incluso en CPU, ideal para pruebas de concepto sin coste de API.
- Experimentacion con cuantizaciones de bajo bit: investigadores pueden comparar la calidad de IQ1_S, IQ2_M e IQ3_S sobre el mismo modelo para estudiar el impacto de la compresion en tareas conversacionales.
- Generacion de texto en entornos con restricciones de memoria: la variante IQ2_XS (1,2 GB) permite ejecutar el modelo en dispositivos embebidos o Raspberry Pi con suficiente RAM.
- Educacion y docencia: el tamano reducido y la disponibilidad de multiples cuantizaciones facilitan demostraciones practicas de inferencia de LLM en aulas sin infraestructura dedicada.
- Fine-tuning ligero sobre el modelo base: al disponer del modelo base en safetensors (guillaume7/Rosa_v1_3.43B), se puede ajustar y luego cuantizar de nuevo con la imatrix incluida.
- Benchmarking de herramientas GGUF: util para validar el rendimiento de llama.cpp, Ollama o LM Studio con un modelo de 3,4B en distintas configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB (IQ1_S) y 3,5 GB (Q6_K), dependiendo de la cuantizacion y del contexto utilizado.
- Cuantizaciones recomendadas: Q4_K_M (2,2 GB) como equilibrio calidad/velocidad; IQ4_XS (2,0 GB) como alternativa de mayor calidad por tamano similar; Q5_K_M (2,5 GB) para mayor fidelidad.
- GPU consumer compatibles: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Las cuantizaciones IQ2 e IQ3 pueden ejecutarse en GPU con 2 GB.
- Ejecucion en CPU: viable con cuantizaciones IQ2/IQ3 en sistemas con 4-8 GB de RAM; el modelo completo en Q6_K requiere unos 4 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Rosa_v1_3.43B-i1-GGUF | 3,43B | no disponible | other | GGUF (25 cuants) | Hugging Face |
| Modelo base Rosa_v1_3.43B | 3,43B | no disponible | other | safetensors | Hugging Face |
| Rosa_v1_3.43B-GGUF (estatico) | 3,43B | no disponible | other | GGUF | Hugging Face |

No se dispone de informacion suficiente para comparar con modelos de otros autores de la misma categoria (3-4B parametros) en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos exactos, por lo que es imprescindible revisar la licencia del modelo base (guillaume7/Rosa_v1_3.43B) antes de cualquier uso comercial.
- Solo ingles declarado: no se confirma soporte de castellano ni de otros idiomas, lo que limita su uso en produccion multilingue.
- Riesgo de alucinacion: como todo LLM de 3,4B, la fidelidad factual es limitada y puede inventar datos, especialmente en tareas de conocimiento especializado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que se recomienda evaluacion propia antes de desplegar.
- Cuantizaciones de muy bajo bit (IQ1, IQ2): degradacion notable de calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- Contexto desconocido: al no conocerse la longitud de contexto del modelo base, no se puede garantizar el rendimiento en conversaciones largas.
- Modelo de nicho: 968 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Rosa_v1_3.43B-i1-GGUF
- Modelo base: https://huggingface.co/guillaume7/Rosa_v1_3.43B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Rosa_v1_3.43B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Rosa_v1_3.43B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
