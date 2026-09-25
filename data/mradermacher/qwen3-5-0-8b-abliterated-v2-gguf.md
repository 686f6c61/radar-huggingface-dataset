# mradermacher/Qwen3.5-0.8B-Abliterated-V2-GGUF

## Resumen

Qwen3.5-0.8B-Abliterated-V2-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo anlord/Qwen3.5-0.8B-Abliterated-V2, que a su vez deriva de la familia Qwen3.5 de Alibaba. Se trata de un modelo pequeno (752.393.024 parametros, es decir unos 0,75B) con una modificacion de tipo "abliteration", una tecnica de edicion de pesos que elimina o atenua los mecanismos de rechazo del modelo original para obtener un comportamiento sin censura. El repositorio incluye tanto pesos completos en f16 como multiples niveles de cuantizacion (desde Q2_K hasta Q8_0) y ficheros mmproj para entrada multimodal.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de modelo "uncensored" de muy baja huella, util para experimentacion local en hardware modesto. Por otro, muestra el flujo habitual de la comunidad: un fine-tune abliterado en safetensors, publicado por un tercero, que otro autor (mradermacher) convierte a GGUF para su uso en llama.cpp, Ollama o LM Studio. El modelo base se distribuye bajo licencia Apache 2.0 y esta etiquetado unicamente para ingles.

La informacion disponible sobre el modelo es limitada: la model card del repositorio GGUF es generica (plantilla de cuantizacion) y no aporta detalles sobre arquitectura, datos de entrenamiento ni evaluacion. Las busquedas web apuntan a que Qwen3.5 0.8B es el modelo multimodal mas pequeno de la familia, con soporte nativo de vision, pero hay discrepancias entre fuentes sobre la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5; los ficheros mmproj incluidos indican soporte multimodal (vision) |
| Parametros totales | 752.393.024 (aprox. 0,75B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | discrepancia entre fuentes: 262.144 tokens segun codersera; 4.096 tokens segun free2aitools. No confirmado en la model card |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 para multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio base anlord/Qwen3.5-0.8B-Abliterated-V2 usa safetensors) |
| Tamano del repositorio | 7,8 GB |
| Cuantizacion de mradermacher | estatica (quantize_version 2); no hay cuantizaciones imatrix/weighted disponibles en el momento de la publicacion |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Por el identificador del modelo y las etiquetas (qwen3.5, qwen), se trata de un transformer autorregresivo perteneciente a la familia Qwen3.5. La presencia de ficheros mmproj (Q8_0 y f16) es un indicador fuerte de que el modelo base incorpora un proyector multimodal para entrada de imagenes, en linea con lo que describe la fuente de codersera, que califica a Qwen3.5 0.8B como el modelo multimodal mas pequeno de Alibaba.

Respecto al entrenamiento, la informacion disponible no especifica numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. El elemento diferencial declarado es la "abliteration" (V2), un procedimiento de edicion de pesos aplicado sobre el modelo Qwen3.5-0.8B original para reducir las respuestas de rechazo. mradermacher, por su parte, solo realiza la conversion a GGUF aplicando cuantizacion estatica; su model card indica explicitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Comportamiento sin censura declarado (abliterated/uncensored): se han atenuado los rechazos del modelo original.
- Soporte de entrada de imagenes presumiblemente, dado que el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16. No confirmado explicitamente en la model card.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local en hardware de gama baja: con cuantizaciones de 0,5 a 0,9 GB, el modelo cabe en cualquier GPU consumer e incluso en CPU, lo que permite probar tecnicas de abliteration y cuantizacion sin infraestructura dedicada.
- Prototipado rapido de chatbots conversacionales en ingles: su tamano reducido permite iterar sobre prompts y plantillas de chat con tiempos de arranque minimos.
- Generacion de texto sin restricciones para investigacion sobre seguridad y alineacion: el caracter abliterated lo hace util para estudiar como cambia el comportamiento de un modelo al eliminar los rechazos, siempre en un entorno controlado.
- Pruebas de pipelines de inferencia con llama.cpp u Ollama: sirve como modelo de humo para validar configuraciones de despliegue (num_ctx, offloading de capas, uso de mmproj) antes de escalar a modelos mayores.
- Analisis de imagen en el borde (edge): si se confirma el soporte multimodal a traves de mmproj, podria emplearse para tareas sencillas de descripcion o clasificacion de imagenes en dispositivos con poca VRAM.
- Educacion y demos: util para mostrar en charlas o talleres como funciona el flujo safetensors a GGUF y como se aplican distintos niveles de cuantizacion segun el compromiso calidad/tamano.
- Base para fine-tunes posteriores: al ser un modelo pequeno y con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF es una plantilla generica de cuantizacion y no incluye tablas de MMLU, HumanEval, GSM8K ni similares. Las fuentes web consultadas mencionan impresiones cualitativas (por ejemplo, codersera indica "buen recall pero precision debil en codigo" para Qwen3.5 0.8B), pero no aportan cifras verificables ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - Q2_K: 0,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 0,5 - 0,6 GB
  - Q4_K_S / IQ4_XS / Q4_K_M: 0,6 GB
  - Q5_K_S / Q5_K_M: 0,7 GB
  - Q6_K: 0,7 GB
  - Q8_0: 0,9 GB
  - f16: 1,6 GB
  - mmproj (vision): 0,2 GB (Q8_0) o 0,3 GB (f16) adicionales
- GPU recomendadas: cualquier GPU moderna con mas de 2 GB de VRAM es suficiente; desde una GTX 1650 o una iGPU con memoria compartida hasta RTX 4090, A100 o H100 (en estas ultimas el modelo queda ampliamente sobredimensionado en recursos).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en algunos sistemas integrados, especialmente con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y cualquier runtime compatible con GGUF. Para los pesos safetensors del modelo base, transformers con CUDA o vLLM.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Al tratarse de un modelo de 0,75B, cabe esperar latencias muy bajas en GPU consumer, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Abliterated-V2-GGUF (este) | 0,75B | discrepancia: 4K / 262K segun fuente | si (mmproj) | apache-2.0 | GGUF en HuggingFace (mradermacher) |
| Qwen3.5 0.8B (base, Alibaba) | ~0,8B | 262K segun codersera | si | no disponible en la informacion | Ollama (`ollama run qwen3.5:0.8b`), GGUF |
| Qwen3.5 4B | no disponible (mayor que 0,8B) | no disponible | no disponible | no disponible | mencionado en codersera como alternativa para codigo |
| Qwen3.5-9B-Janus-Abliterated-V2 (mradermacher) | ~9B | no disponible | no disponible | apache-2.0 | GGUF en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterado/uncensored: al haberse eliminado los mecanismos de rechazo, puede generar contenido inapropiado, ofensivo o danino. No es recomendable su uso directo en aplicaciones orientadas al publico sin un filtrado posterior.
- La abliteration suele degradar el rendimiento general y la coherencia del modelo base; no hay evaluacion publicada que cuantifique esa perdida.
- Riesgo de alucinacion elevado por su tamano (0,75B); el conocimiento factual y el razonamiento complejo son limitados.
- Idiomas: solo ingles declarado. El uso en castellano u otros idiomas no esta soportado oficialmente y producira resultados de calidad desigual.
- Contexto: existe una discrepancia importante entre fuentes (4K frente a 262K). Conviene verificar la longitud real de contexto en la configuracion del modelo antes de usarlo en tareas que dependan de ventanas largas.
- Capacidades de tool calling, agentes y vision no estan confirmadas en la model card; la vision se infiere unicamente por la presencia de ficheros mmproj.
- Licencia Apache 2.0: permite uso comercial, pero el autor del modelo derivado no ofrece garantias sobre el comportamiento abliterado ni sobre posibles sesgos heredados del modelo original.
- No hay cuantizaciones imatrix/weighted disponibles; las versiones estaticas de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Abliterated-V2-GGUF
- Modelo base: https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-V2
- Pagina de resumen de mradermacher para este modelo: https://hf.tst.eu/model#Qwen3.5-0.8B-Abliterated-V2-GGUF
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Articulo sobre ejecucion y benchmark de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Ficha de Qwen3.5 0.8B Abliterated GGUF en free2aitools: https://free2aitools.com/model/mradermacher/qwen3.5-0.8b_abliterated-gguf
- Variante relacionada Qwen3.5-9B-Janus-Abliterated-V2: https://huggingface.co/mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF
