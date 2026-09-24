# 0xSojalSec/UNSEEN_Gemma_4_26B_NSFW-GGUF

## Resumen

UNSEEN_Gemma_4_26B_NSFW-GGUF es un paquete de pesos cuantizados y en formato GGUF derivado de Jommarn/UNSEEN_Gemma_4_26B_NSFW, a su vez una version "abliterated" (sin alineamiento de seguridad) de google/gemma-4-26B-A4B-it. El repositorio analizado pertenece al usuario 0xSojalSec y no contiene el modelo original, sino un conjunto de conversiones preparadas para inferencia local con llama.cpp, LM Studio, Ollama o vLLM. Su proposito declarado es ofrecer un modelo multimodal (imagen-texto) sin filtros de contenido, priorizando eficiencia de memoria en GPU de consumo.

El modelo conserva la arquitectura multimodal de la familia Gemma 4 y un total real de 25.233.142.046 parametros segun los metadatos de safetensors. El sufijo "A4B" del modelo base sugiere una variante con expertos (MoE) y del orden de 4.000 millones de parametros activos, aunque esa cifra no se confirma en la informacion disponible. Los idiomas declarados son tailandes (th) e ingles (en). El repositorio ocupa 161,3 GB y agrupa cuantizaciones de 2, 3, 4, 5, 6, 8 y 16 bits, con tamanos de fichero que van de los 9,67 GB (IQ2_M) a los 50,5 GB (BF16), mas un proyector de vision de 1,11 GB necesario para la percepcion de imagenes.

Su relevancia actual es doble. Por un lado, los GGUF abliterados de Gemma 4 26B estan acumulando traccion en Hugging Face (una cronica de AlphaSignal menciona alrededor de 17.000 descargas para esta familia de pesos sin censura, aunque este repositorio concreto aparece con 0 descargas y 0 "likes"). Por otro, la licencia no esta especificada en la model card, lo que obliga a revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text). El sufijo A4B del modelo base apunta a una variante con expertos (MoE), no confirmado en la informacion disponible |
| Parametros totales | 25.233.142.046 (~25,2 B) segun safetensors |
| Parametros activos | no confirmado (el modelo base se denomina gemma-4-26B-A4B-it) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0; NF4; INT8; BF16 (maestro) |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | no disponible (no especificada en la model card; el modelo base de Google se distribuye bajo los terminos de Gemma) |
| Formato de pesos | GGUF para llama.cpp y safetensors/transformers; proyector de vision mmproj-gemma4-vision-f16.gguf |
| Proyector de vision | mmproj-gemma4-vision-f16.gguf (~1,11 GB), obligatorio para entrada de imagen en GGUF |

## Arquitectura y entrenamiento

La pieza original es google/gemma-4-26B-A4B-it, un modelo multimodal de la familia Gemma 4 de Google DeepMind. Sobre esa base, Jommarn/UNSEEN_Gemma_4_26B_NSFW aplica una "abliteracion": una intervencion quirurgica sobre los pesos que elimina la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ante peticiones que la version alineada bloquearia. El articulo de AlphaSignal describe el procedimiento como "un unico truco matematico" para retirar las negativas del modelo. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO; la abliteracion es, en esencia, una modificacion post-entrenamiento y no un reentrenamiento.

El repositorio de 0xSojalSec anade una capa de cuantizacion en formato GGUF con el objetivo de reducir el peso de un maestro BF16 de 50,5 GB hasta los 9,67 GB del nivel IQ2_M. La model card detalla una tabla de requisitos de VRAM por nivel de cuantizacion y subraya un detalle tecnico importante: en llama.cpp la capacidad de vision solo se activa si se pasa explicitamente el fichero `mmproj-gemma4-vision-f16.gguf` con el flag `--mmproj`; sin el, el modelo opera como un LLM estrictamente textual. No se aportan detalles sobre innovaciones de atencion, decodificacion especulativa ni estrategias de entrenamiento multimodal.

## Capacidades

- Generacion de texto conversacional en ingles y tailandes, con estilos y registros que incluyen contenido explicito.
- Descripcion y comprension de imagenes (image-text-to-text) cuando se carga el proyector de vision correspondiente.
- Salida sin censura: la abliteracion elimina las negativas por contenido, incluido material NSFW.
- Soporte de cuantizacion agresiva (hasta 2 bits con IQ2_M) manteniendo funcionalidad basica.
- Compatibilidad declarada con `llama.cpp`, LM Studio, Ollama y vLLM segun las notas de prensa recogidas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes sin filtros de contenido: el modelo genera descripciones detalladas de ilustraciones y fotografias, incluidas aquellas con contenido adulto, algo que los modelos alineados rechazan; requiere cargar `mmproj-gemma4-vision-f16.gguf` en llama.cpp.
- Etiquetado y anotacion de datasets multimodales: util para preprocesar grandes volumenes de imagenes con descripciones en ingles o tailandes antes de entrenar otros sistemas, con la salvedad de que la salida puede contener lenguaje explicito y debe filtrarse aguas abajo.
- Investigacion sobre alineamiento y seguridad: sirve como contrapunto experimental para estudiar como la abliteracion altera las respuestas del modelo base frente a la version oficial de Google.
- Despliegue local en GPU de consumo: con la cuantizacion IQ2_M (9,67 GB) o IQ3_M (12,4 GB) se puede ejecutar en tarjetas de 12 GB como la RTX 3060 o la RTX 4070, lo que habilita entornos sin conectividad ni coste de API.
- Prototipado de asistentes conversacionales multilingues th/en: el soporte nativo de tailandes lo hace adecuado para productos dirigidos al mercado tailandes, con respuestas en el idioma de la consulta.
- Generacion de contenido creativo para narrativa o ilustracion: util en flujos donde el autor necesita texto sin restricciones tematicas, siempre que se asuma la responsabilidad legal del material producido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece una escalera completa de 2 a 16 bits, lo que permite medir la degradacion de calidad y de VRAM en un mismo modelo.
- Inferencia por lotes en servidor: con Q8_0 (28,0 GB) o BF16 (50,5 GB) sobre A100 40/80 GB o dos RTX 4090, es viable montar un endpoint multimodal de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card si incluye ejemplos cualitativos de salida (una descripcion detallada de una ilustracion anime con contenido explicito, tanto en ingles como en tailandes) generados con la cuantizacion Q4_K_M sobre una GPU NVIDIA L4. Se trata de demostraciones de capacidad, no de metricas reproducibles, por lo que no se incluyen como tabla comparativa.

## Requisitos de hardware

- 2 bits (IQ2_M, ~9,67 GB): 8-10 GB de VRAM. Valido en RTX 3060 12 GB, RTX 4060 o Mac de 16 GB.
- 3 bits (IQ3_M, ~12,4 GB): 12-14 GB de VRAM. RTX 4070 12 GB, RTX 3080 o Mac de 16 GB.
- 4 bits (Q4_K_M ~15,6 GB, NF4): 16-18 GB de VRAM. RTX 3090, RTX 4090 o NVIDIA L4. Es el nivel recomendado como estandar por el autor.
- 5 bits (Q5_K_M, ~18,3 GB): 20-22 GB de VRAM. RTX 3090/4090 de 24 GB o A10G de 24 GB.
- 6 bits (Q6_K, ~22,6 GB): 24-26 GB de VRAM. RTX 4090 24 GB o A100 40 GB.
- 8 bits (Q8_0 ~28,0 GB, INT8): 28-30 GB de VRAM. Dos RTX 3090/4090 o una A100 40/80 GB.
- 16 bits (BF16, ~50,5 GB): unos 52 GB de VRAM. A100 80 GB o Mac Studio de 64/128 GB.
- Proyector de vision: `mmproj-gemma4-vision-f16.gguf` (~1,11 GB) adicional, obligatorio para la entrada de imagen.
- GPU recomendadas: RTX 3060 12 GB y superiores para cuantizaciones bajas; RTX 3090/4090, A10G, L4, A100 40 GB y A100 80 GB para los niveles altos.
- Cabe en GPU de consumo: si, desde IQ2_M en una RTX 3060 12 GB hasta Q6_K en una RTX 4090 24 GB.
- Opciones de despliegue: llama.cpp (con `--mmproj`), LM Studio, Ollama y vLLM, segun las notas de prensa recogidas; la libreria declarada en el repositorio es transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizaciones | Estado de alineamiento | Licencia |
|---|---|---|---|---|---|
| 0xSojalSec/UNSEEN_Gemma_4_26B_NSFW-GGUF | 25,2 B (segun safetensors) | no disponible | GGUF de 2 a 16 bits, NF4, INT8, safetensors | Abliterado, sin filtros | no disponible |
| Jommarn/UNSEEN_Gemma_4_26B_NSFW | no disponible | no disponible | FP16/BF16 sin cuantizar | Abliterado, sin filtros | no disponible |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | no disponible | no disponible | no disponible | Sin censura | no disponible |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | pesos oficiales | Alineado con politicas de seguridad | terminos de Gemma |

Los tres primeros comparten la misma base (Gemma 4 26B A4B) y se diferencian por el nivel de cuantizacion y el canal de publicacion; el cuarto es la version oficial con alineamiento intacto. No se dispone de benchmarks comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: la abliteracion no elimina los sesgos del modelo base; al retirar el alineamiento se amplifica la probabilidad de respuestas ofensivas, estereotipadas o ilegales.
- Riesgo de alucinacion: sin datos de evaluacion publicados, no puede cuantificarse la tasa de invencion de hechos; se agrava en cuantizaciones de 2 y 3 bits.
- Contenido NSFW: el repositorio esta marcado como "not-for-all-audiences" y su proposito declarado incluye material explicito. No es apto para productos de consumo general ni para menores.
- Idiomas: solo tailandes e ingles; cualquier otro idioma, incluido el castellano, queda fuera del soporte declarado.
- Contexto: no se publica la ventana de contexto, por lo que no puede planificarse su uso en tareas de contexto largo.
- Licencia: la model card no especifica licencia. El modelo base de Google se rige por los terminos de Gemma, que incluyen restricciones de uso; usar estos pesos en produccion sin aclarar la licencia implica riesgo legal.
- Vision condicionada: sin `mmproj-gemma4-vision-f16.gguf`, el modelo no ve imagenes y funciona solo como LLM de texto.
- Metadatos sospechosos: la fecha de creacion indicada (2026-09-23) y el hecho de que este repositorio muestre 0 descargas frente a las ~17.000 de la familia sugieren que puede tratarse de un espejo o de un paquete agregado, no de la fuente principal.
- Huella de almacenamiento: 161,3 GB de repositorio, poco practico para descarga completa; conviene bajar solo la cuantizacion necesaria.

## Enlaces

- Repositorio analizado: https://huggingface.co/0xSojalSec/UNSEEN_Gemma_4_26B_NSFW-GGUF
- Modelo base completo (FP16/BF16): https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW
- Pesos GGUF de referencia: https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF
- Variante sin censura alternativa: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Busqueda de cuantizaciones del modelo base: https://huggingface.co/models?other=base_model:quantized:Jommarn/UNSEEN_Gemma_4_26B_NSFW
- Google DeepMind, pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- AlphaSignal, "UNSEEN Gemma 4 Removes AI Refusals With a Single Math Trick": https://alphasignal.ai/news/unseen-gemma-4-removes-ai-refusals-with-a-single-math-trick
- UncensoredHub, nota sobre pesos GGUF de Gemma 4 26B sin censura: https://uncensoredhub.ai/news/2026-06-05-gemma-4-26b-uncensored-weights-quantized-to-gguf-for-local-inference
