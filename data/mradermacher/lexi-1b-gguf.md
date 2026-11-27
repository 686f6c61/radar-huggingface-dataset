# mradermacher/Lexi-1B-GGUF

## Resumen

Lexi-1B es un modelo de lenguaje conversacional de aproximadamente 1.001 millones de parametros (1.001B), desarrollado originalmente por Reallexi-llc y distribuido en formato GGUF por el cuantizador mradermacher. Se trata de un modelo base de tipo transformer, etiquetado como conversacional y orientado exclusivamente al idioma ingles. La version aqui descrita es una recuantizacion estatica del modelo original `Reallexi-llc/Lexi-1B`, publicada bajo el identificador `mradermacher/Lexi-1B-GGUF`.

El modelo resulta relevante por su tamano reducido, que lo hace apto para despliegue en hardware de consumo, y por la disponibilidad de un amplio abanico de cuantizaciones GGUF (desde Q2_K hasta f16, pasando por IQ4_XS), lo que permite ajustar el equilibrio entre calidad y consumo de memoria. No obstante, la informacion publica disponible es muy limitada: no se documentan la longitud de contexto, la composicion del dataset de entrenamiento, el proceso de alineacion ni resultados de benchmarks.

Esta ficha se centra en la informacion verificable de la model card y de los metadatos de Hugging Face. Cualquier dato no documentado se indica explicitamente como "no disponible" para no inducir a error en la evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 1.001.053.824 (aprox. 1.001B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un transformer con 1.001.053.824 parametros, segun los datos reales de safetensors del modelo base. No se documenta en la model card el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se especifica si el modelo usa embeddings atados, normalizacion RMSNorm o activaciones SwiGLU, aunque son elecciones habituales en modelos de este tamano.

Respecto al entrenamiento, la model card no aporta informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El etiquetado "conversational" sugiere un ajuste para dialogos, pero no se detalla el proceso. La unica informacion tecnica adicional proviene del proceso de cuantizacion: se generaron cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) a partir del modelo en formato Hugging Face, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun el etiquetado del modelo.
- Uso previsto como modelo de chat o asistente de dialogos multi-turno (inferido de la etiqueta "conversational"; no documentado de forma explicita).
- Capacidades de razonamiento, codigo y matematicas: no documentadas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; no se documentan otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional ligero en local: el modelo, con 1.001B parametros y cuantizaciones desde 0,7 GB, puede ejecutarse en equipos de consumo para prototipos de chatbot en ingles sin depender de la nube.
- Despliegue en dispositivos con recursos limitados: las versiones Q4_K_S y Q4_K_M (0,8 GB) permiten integrar el modelo en aplicaciones de escritorio o moviles con un consumo de memoria reducido.
- Generacion de texto en pipelines de bajo coste: adecuado para tareas de completado, resumen o reformulacion en ingles donde no se requiera maxima calidad y prime el throughput.
- Experimentacion e investigacion: util como modelo base pequeno para estudiar tecnicas de cuantizacion, comparar calidad entre tipos de quant (Q2_K frente a Q8_0) o evaluar el impacto del tamano en tareas conversacionales.
- Filtrado y clasificacion de texto simple: por su tamano, puede emplearse en tareas de etiquetado o moderacion basica en ingles, siempre con validacion humana.
- Educacion y demos: sirve para demostrar flujos de inferencia con llama.cpp u Ollama en entornos docentes sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (Q2_K, Q3_K_S, IQ4_XS) y 2,1 GB (f16), segun el tamano del fichero GGUF. La VRAM real requerida es ligeramente superior por el contexto y los buffers de ejecucion.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores son mas que suficientes. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluidas las integradas con memoria compartida para las cuantizaciones mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (por ejemplo, LM Studio). El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lexi-1B (esta ficha) | 1.001B | No disponible | No disponible | GGUF, safetensors | Conversacional, solo ingles |
| TinyLlama-1.1B | 1.1B | 2048 tokens (tipico) | Apache 2.0 | GGUF, safetensors | Modelo pequeno ampliamente usado; datos de contexto y licencia documentados |
| Qwen2.5-0.5B | 0.5B | 32.768 tokens | Apache 2.0 | GGUF, safetensors | Multilingue, contexto largo, benchmarks publicos |

La comparativa se ofrece a titulo orientativo; los datos de TinyLlama y Qwen2.5 provienen de conocimiento general de esos modelos y no de la informacion proporcionada para Lexi-1B. Para Lexi-1B no se dispone de contexto, licencia ni benchmarks, lo que dificulta una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado solo en ingles, es probable que herede sesgos de su corpus, pero no hay informacion al respecto.
- Riesgo de alucinacion: no evaluado; como todo modelo de 1B, la probabilidad de generar contenido inexacto es elevada, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: solo soporta ingles y no se documenta la ventana de contexto, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor original antes de usarlo en produccion.
- Caveats para produccion: la ausencia de benchmarks, de documentacion de entrenamiento y de licencia clara hace desaconsejable su uso en entornos productivos sin una evaluacion propia previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lexi-1B-GGUF
- Modelo base: https://huggingface.co/Reallexi-llc/Lexi-1B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Lexi-1B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
