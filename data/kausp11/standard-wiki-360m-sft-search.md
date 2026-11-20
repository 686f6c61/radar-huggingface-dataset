# Kausp11/standard-wiki-360m-sft-search

## Resumen

Standard 360M (Wikipedia), search fine-tuned es un modelo de lenguaje de tipo decoder-only publicado por el usuario Kausp11 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) del modelo base `Kausp11/standard-wiki-360m`, entrenado desde cero sobre Wikipedia en ingles y posteriormente afinado con un corpus de conversaciones que incluyen bloques de busqueda web. Su proposito es servir como modelo de control en un estudio comparativo sobre pretraining aumentado con busqueda: se compara directamente con `Kausp11/querylm-wiki-360m-sft-search`, que usa la misma arquitectura y presupuesto de computo pero si vio bloques de busqueda durante el pretraining.

La arquitectura sigue la configuracion de SmolLM2-360M: 32 capas, ancho 960 y 15 cabezas de atencion, con una longitud de contexto de 4.096 tokens. El modelo tiene 361,8 millones de parametros y se carga con `transformers` estandar mediante `LlamaForCausalLM`, sin codigo personalizado. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para delimitar consultas y respuestas de busqueda, lo que eleva el vocabulario a 49.156 entradas.

Su relevancia es acotada y experimental: no es un asistente de proposito general ni un producto, sino un artefacto de investigacion para estudiar como afecta el pretraining con busqueda a la capacidad de un modelo pequeno de emitir consultas y condicionar su respuesta a pasajes recuperados. El autor advierte explicitamente de que el modelo solo ha visto texto enciclopedico en ingles y carece de entrenamiento en seguridad o rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, configuracion SmolLM2-360M (32 capas, ancho 960, 15 cabezas) |
| Parametros totales | 361.824.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `6d59d04295a5afa4a8aef5ee7b6e958fa495ee157c3d9567ff530be68fbabe16`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuracion de SmolLM2-360M, entrenado desde cero sobre Wikipedia en ingles. El pretraining uso las mismas 4.885.877 articulos que el modelo emparejado QueryLM, en texto plano, sin bloques de busqueda ni anotacion alguna, reservando 54.582 articulos adicionales para evaluacion. El optimizador fue AdamW con LR pico de 5e-4 y weight decay 0.1, con batches de 256 secuencias de 4.096 tokens (1.048.576 tokens por actualizacion), warmup del 2% y decaimiento coseno. El presupuesto total fue de 30.600 actualizaciones, equivalentes a 32.100 millones de tokens en 8 epocas y 6,06e19 FLOPs en bf16. El modelo emparejado QueryLM consumio 6,31e19 FLOPs, aproximadamente un 4% mas.

El ajuste fino supervisado se aplico sobre el dataset `Kausp11/querylm-search-sft-data`, compuesto por unas 53.000 conversaciones usuario-asistente, de las cuales el 21% incluyen bloques de busqueda al inicio de una frase en los turnos del asistente. Se uso un AdamW nuevo con LR pico de 2e-5, warmup del 3%, decaimiento coseno y 134 actualizaciones de 64 secuencias (una sola epoca), identico al procedimiento del modelo emparejado. La innovacion tecnica principal no esta en la arquitectura sino en el formato de interaccion: el modelo emite una consulta entre `<WEB_QUERY>` y `</WEB_QUERY>`, el llamante ejecuta su propio retriever e inserta el pasaje entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>`, y el modelo continua la respuesta condicionada por ese texto. El checkpoint publicado corresponde al run `sft_v4cannsent_wiki360_cm`, actualizacion 134 de 134, y tambien se publico con el nombre anterior `Kausp11/searchlm-sft_v4cannsent_wiki360_cm` con pesos identicos.

## Capacidades

- Generacion de texto en ingles sobre dominio enciclopedico, con formato de chat en texto plano mediante prefijos `System:`, `User:` y `Assistant:` separados por linea en blanco. No hay chat template y `apply_chat_template` no aplica.
- Emision de consultas de busqueda delimitadas por los tokens especiales `<WEB_QUERY>` (id 49152) y `</WEB_QUERY>` (id 49153), con insercion de pasajes entre `<WEB_RESPONSE>` (id 49154) y `</WEB_RESPONSE>` (id 49155).
- Condicionamiento de la respuesta al pasaje recuperado insertado literalmente en el contexto por el llamante.
- Generacion determinista en el ejemplo de la model card (`do_sample=False`).
- Soporte de tool calling: no disponible como tal; el unico mecanismo externo es el bloque de busqueda descrito.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma general; el flujo consulta-recuperacion-respuesta es de un solo paso.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Estudio comparativo de pretraining aumentado con busqueda: el modelo sirve como control frente a `Kausp11/querylm-wiki-360m-sft-search` para medir el efecto de exponer bloques de busqueda durante el pretraining, manteniendo arquitectura, datos y computo casi identicos.
- Prototipado de pipelines de retrieval-augmented generation (RAG): permite montar un ciclo consulta-recuperacion-respuesta con un retriever propio (BM25, API de busqueda web) y evaluar el comportamiento del modelo ante distintos pasajes, gracias a su integracion directa con `transformers`.
- Investigacion sobre formatos de interaccion con herramientas: los cuatro tokens especiales y el layout documentado permiten experimentar con esquemas de delimitacion de consultas y pasajes en modelos pequenos.
- Experimentos de bajo coste en CPU o GPU de consumo: con 361,8 millones de parametros y contexto de 4.096 tokens, el modelo se ejecuta en entornos modestos, como demuestra el ejemplo de la model card ejecutado en CPU con bfloat16.
- Generacion de respuestas sobre contenido enciclopedico en ingles: util para tareas de pregunta-respuesta sobre articulos de Wikipedia cuando se dispone de un retriever sobre ese corpus.
- Docencia y formacion en tecnicas de SFT y RAG: el repositorio incluye procedimiento de entrenamiento, procedencia del checkpoint y script de inferencia, lo que facilita reproducir el flujo en un entorno academico.
- Analisis de robustez frente a pasajes recuperados: al condicionar literalmente sobre lo que devuelve el retriever, permite estudiar como afectan pasajes irrelevantes o incorrectos a la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 361,8 millones de parametros ocupan aproximadamente 0,72 GB de pesos; con cache KV para 4.096 tokens el consumo total se mantiene por debajo de 2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es tambien viable en CPU, como muestra el ejemplo de la model card ejecutado en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, incluso con cuantizacion de 8 o 4 bits si se genera con herramientas compatibles.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `LlamaForCausalLM`; el tag `text-generation-inference` sugiere compatibilidad con TGI, y el tag `endpoints_compatible` con los endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La model card no proporciona medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pretraining con busqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kausp11/standard-wiki-360m-sft-search` (este) | 361,8 M | 4.096 | No (solo en SFT) | no disponible | Hugging Face |
| `Kausp11/querylm-wiki-360m-sft-search` | 361,8 M (misma configuracion) | 4.096 | Si | no disponible | Hugging Face |
| `Kausp11/standard-wiki-360m` (base) | 361,8 M | 4.096 | No | no disponible | Hugging Face |

El modelo emparejado QueryLM uso 6,31e19 FLOPs frente a 6,06e19 de este modelo (un 4% mas) y fue preentrenado con bloques de busqueda, por lo que la comparacion entre ambos aisla el efecto de esa exposicion temprana. El modelo base carece de ajuste fino conversacional y no sigue el formato de chat ni emite consultas. No se dispone de datos de benchmarks para ninguno de los tres en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo describe explicitamente como modelo de control para estudiar pretraining aumentado con busqueda, no como producto.
- Ajuste fino de una sola epoca sobre una mezcla conversacional pequena; no es un asistente de proposito general.
- Solo texto de Wikipedia en ingles; rendimiento debil fuera de texto enciclopedico.
- Sin entrenamiento en seguridad ni rechazo: el modelo afirmara cosas falsas con fluidez y no tiene mecanismos de moderacion.
- Riesgo alto de alucinacion fuera del dominio enciclopedico y cuando el pasaje recuperado es irrelevante o incorrecto.
- El pasaje se inserta literalmente en el contexto: la calidad y el origen de la recuperacion son responsabilidad del llamante.
- No hay chat template; el formato de conversacion es texto plano con prefijos `System:`, `User:` y `Assistant:`.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- El ejemplo de la model card muestra la mecanica del flujo, no la precision del modelo; la propia salida del script de ejemplo es incoherente.
- Idiomas: solo ingles, sin soporte documentado de castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-wiki-360m-sft-search
- Modelo base: https://huggingface.co/Kausp11/standard-wiki-360m
- Modelo emparejado QueryLM: https://huggingface.co/Kausp11/querylm-wiki-360m-sft-search
- Dataset de ajuste fino: https://huggingface.co/datasets/Kausp11/querylm-search-sft-data
- Publicacion con nombre anterior: `Kausp11/searchlm-sft_v4cannsent_wiki360_cm` (pesos identicos, segun la model card)
