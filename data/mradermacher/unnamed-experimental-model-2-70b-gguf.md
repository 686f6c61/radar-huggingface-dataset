# mradermacher/Unnamed-Experimental-Model-2-70B-GGUF

## Resumen

Unnamed-Experimental-Model-2-70B-GGUF es la distribucion en formato GGUF del modelo Unnamed-Experimental-Model-2-70B, un merge experimental de 70.553.755.712 parametros publicado por el usuario TareksGraveyard y cuantizado por mradermacher. Se trata de un modelo de lenguaje de tipo transformer denso orientado a conversacion, generado mediante mergekit a partir de otros modelos, sin una model card que documente su composicion, datos de entrenamiento o proceso de alineamiento. El repositorio original no proporciona informacion sobre la arquitectura interna mas alla de su naturaleza de merge.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 70B en hardware de consumo mediante cuantizaciones que van de 26,5 GB (Q2_K) a 75,1 GB (Q8_0), con dos variantes marcadas como recomendadas por el autor de las cuantizaciones (Q4_K_S y Q4_K_M). Al estar empaquetado en GGUF, es compatible con llama.cpp, Ollama y otras herramientas de inferencia local.

No obstante, se trata de un artefacto experimental y sin documentacion tecnica verificable: no hay benchmarks publicados, no consta licencia, solo declara soporte de ingles y su model card se limita a la lista de ficheros cuantizados. Cualquier evaluacion de calidad debe hacerse por cuenta del usuario antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (merge via mergekit; detalles no disponibles) |
| Parametros totales | 70.553.755.712 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit, segun las etiquetas del repositorio. No se especifica la tecnica de merge empleada (SLERP, TIES, DARE, passthrough, etc.), ni los modelos de origen, ni la proporcion de mezcla. Tampoco se documenta si hubo fases de fine-tuning, RLHF o DPO posteriores al merge. El nombre "Experimental" y el prefijo "Unnamed" sugieren un artefacto de pruebas sin publicacion asociada.

El repositorio cuantizado no aporta informacion adicional sobre la arquitectura: no consta numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion (MHA, GQA, MQA) ni contexto maximo entrenado. Los metadatos de cuantizacion indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion directa desde pesos Hugging Face a GGUF con cuantizacion de tensores de salida. Existe una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Unnamed-Experimental-Model-2-70B-i1-GGUF`, que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general, condicionado a la calidad del merge subyacente (no verificada).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite su despliegue en infraestructura de inferencia compatible con la API de Hugging Face.
- No consta soporte documentado de tool calling, function calling ni uso agentico.
- No consta soporte de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues limitadas al ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Experimentacion con merges de 70B en local: el modelo permite probar en hardware de consumo el comportamiento de un merge de gran tamano sin depender de infraestructura cloud, usando la cuantizacion Q4_K_M (42,6 GB) en un equipo con suficiente RAM o VRAM.
- Chat conversacional en ingles autoalojado: al estar etiquetado como `conversational`, puede emplearse como asistente de texto en ingles en un entorno controlado, siempre que se valide su calidad previamente.
- Evaluacion comparativa de tecnicas de merge: util como sujeto de prueba para medir como afecta un merge experimental de 70B a metricas de perplejidad y calidad conversacional frente a sus modelos de origen.
- Prototipado de pipelines de inferencia GGUF: sirve para validar integraciones con llama.cpp u Ollama antes de sustituir el modelo por uno documentado y con licencia clara.
- Generacion de texto sin conexion: el formato GGUF permite ejecucion totalmente offline, adecuado para entornos con requisitos de privacidad donde no se quiera enviar datos a APIs externas.
- Investigacion sobre cuantizacion: la disponibilidad de once variantes (de Q2_K a Q8_0) y de una version imatrix permite estudiar la degradacion de calidad segun el nivel de cuantizacion en un modelo de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB (dos partes); Q8_0 75,1 GB (dos partes).
- GPU recomendadas: para Q4_K_M se necesita al menos 48 GB de VRAM (A6000, L40S, A100 80GB) o descarga parcial a RAM del sistema con llama.cpp. Para Q8_0, A100 80GB o H100 80GB.
- GPU de consumo: Q2_K y Q3_K_S pueden caber en configuraciones con 24-32 GB de VRAM (RTX 3090, RTX 4090) solo si se usa descarga parcial de capas a RAM; no caben completos en una unica GPU de consumo. En sistemas con 64-128 GB de RAM y CPU, las cuantizaciones Q4 y Q5 son viables con velocidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Los ficheros Q6_K y Q8_0 estan divididos en dos partes que deben concatenarse antes de su uso.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 70B en Q4_K_M sobre una sola GPU de 48 GB ofrece velocidades del orden de decenas de tokens por segundo, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Unnamed-Experimental-Model-2-70B-GGUF | 70,55B | no disponible | no disponible | GGUF | Merge experimental sin documentacion |
| Llama 3.3 70B Instruct | 70B | 128K | Llama 3.3 Community License | safetensors, GGUF | Modelo documentado con benchmarks publicos |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 | safetensors, GGUF | Modelo documentado, licencia permisiva |
| Mistral Large 2 | 123B | 128K | Mistral Research License | API, pesos bajo solicitud | Mayor tamano, no comparable en requisitos |

La comparacion con Llama 3.3 70B y Qwen2.5 72B es la mas directa por tamano y formato de distribucion (GGUF). Frente a ellos, el modelo de esta ficha carece de benchmarks, licencia y documentacion de entrenamiento, lo que lo hace inadecuado para produccion sin una evaluacion propia. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que su rendimiento real es desconocido.
- Licencia no disponible: no se puede asumir uso comercial permitido; la falta de licencia explicita es un riesgo legal relevante.
- Modelo experimental sin model card tecnica: no se documentan datos de entrenamiento, composicion del merge ni proceso de alineamiento, lo que impide evaluar sesgos o comportamiento en dominios sensibles.
- Riesgo de alucinacion no caracterizado: al no haber evaluaciones, no se puede estimar su tasa de alucinacion ni su robustez.
- Solo ingles declarado: no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Contexto maximo desconocido: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Posible degradacion por cuantizacion agresiva: las variantes Q2_K y Q3_K_S, aunque permiten ejecucion en hardware modesto, suelen degradar la calidad de forma notable.
- Ficheros partidos: Q6_K y Q8_0 requieren concatenar dos partes antes de su uso, lo que anade pasos operativos.
- Origen incierto del merge: al no conocerse los modelos de origen, no se pueden heredar sus garantias de licencia ni sus limitaciones documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Unnamed-Experimental-Model-2-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/Unnamed-Experimental-Model-2-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Unnamed-Experimental-Model-2-70B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Unnamed-Experimental-Model-2-70B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
