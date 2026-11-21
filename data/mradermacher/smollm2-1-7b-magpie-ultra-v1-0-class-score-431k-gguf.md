# mradermacher/SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k-GGUF

## Resumen

Esta ficha describe una coleccion de cuantizaciones GGUF del modelo `EleutherAI/SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k`, publicadas por el usuario mradermacher. No se trata de un modelo original, sino de una redistribucion en formato GGUF de un fine-tune de SmolLM2-1.7B realizado por EleutherAI, lo que permite su despliegue en entornos de inferencia local mediante llama.cpp y herramientas compatibles.

El modelo base parte de SmolLM2-1.7B, un transformer decoder-only de 1.711.376.384 parametros (aproximadamente 1,7 mil millones) entrenado originalmente por Hugging Face. Sobre el se aplico un ajuste fino supervisado con el dataset Magpie-Ultra, un conjunto de instrucciones generado de forma sintetica y filtrado por dificultad, segun la nomenclatura del identificador (`magpie-ultra-v1.0-class-score-431k`). El resultado es un modelo de instrucciones en ingles de pequeno tamano, pensado para tareas de generacion de texto y seguimiento de instrucciones en hardware modesto.

La relevancia de esta publicacion es practica: el repositorio ofrece once variantes de cuantizacion entre Q2_K (0,8 GB) y f16 (3,5 GB), lo que permite ejecutar el modelo en GPUs de consumo, CPUs modernas e incluso dispositivos con poca memoria. Es una opcion util para prototipado rapido, experimentacion con modelos pequenos y despliegues edge, aunque con las limitaciones propias de un modelo de 1,7B y de un fine-tune sobre datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-1.7B, un transformer decoder-only con atencion causal estandar, disenado por Hugging Face para ofrecer un rendimiento competitivo en la franja de 1-2 mil millones de parametros. Sobre esa base, EleutherAI aplico un ajuste fino supervisado con el dataset Magpie-Ultra, un corpus de instrucciones generado mediante la tecnica Magpie (autogeneracion de instrucciones a partir de un modelo alineado) y posteriormente filtrado. El sufijo `class-score-431k` sugiere un subconjunto de aproximadamente 431.000 ejemplos seleccionados por una puntuacion de calidad o dificultad, aunque no se dispone de detalles oficiales sobre el criterio exacto de filtrado en la informacion proporcionada.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos) mas alla de las propias del SmolLM2 original. El trabajo de mradermacher se limita a la conversion y cuantizacion estatica del modelo a GGUF, sin modificaciones en los pesos mas alla de la perdida de precision inherente a cada nivel de cuantizacion.

## Capacidades

- Generacion de texto en ingles con seguimiento de instrucciones, gracias al ajuste fino sobre Magpie-Ultra.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano del modelo.
- Generacion de codigo sencillo y explicaciones tecnicas breves.
- Resolucion de problemas matematicos de complejidad baja a media.
- Conversacion multi-turno en ingles, con contexto limitado por la ventana del modelo base.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (1,2 GB) el modelo cabe en cualquier GPU de consumo y permite iterar rapidamente sobre prompts y flujos de conversacion sin depender de APIs externas.
- Clasificacion y etiquetado de texto en pipelines de datos: el modelo puede generar etiquetas, resumenes cortos o extracciones simples en lotes, aprovechando su bajo coste de inferencia en CPU o GPU modesta.
- Generacion de codigo asistida en entornos con recursos limitados: util para autocompletar funciones cortas o explicar fragmentos en editores integrados que no pueden asumir modelos de mayor tamano.
- Educacion y demostraciones: sirve para ensenar conceptos de cuantizacion, despliegue con llama.cpp y evaluacion de modelos pequenos en cursos y talleres.
- Filtrado y preprocesado de corpus: puede usarse como modelo auxiliar para reformatear, limpiar o reescribir textos antes de pasarlos a un modelo mayor, reduciendo coste.
- Experimentacion con fine-tuning ligero: al ser un modelo de 1,7B en GGUF, es adecuado para probar tecnicas de LoRA o QLoRA en hardware de gama media antes de escalar a modelos mayores.
- Despliegue en dispositivos edge: la variante Q2_K (0,8 GB) permite ejecucion en Raspberry Pi 5, mini-PCs o telefonos de gama alta con llama.cpp, para tareas de generacion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~0,8 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda al menos 4-6 GB (RTX 3060, RTX 4060 Ti, A10).
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPUs recientes con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI a traves de llama.cpp server.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k (GGUF, este repo) | 1,7B | no disponible | no disponible | GGUF | Fine-tune de instrucciones en ingles, cuantizaciones estaticas |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,7B | no disponible en esta ficha | Apache 2.0 (segun el modelo original de Hugging Face) | safetensors, GGUF | Modelo oficial de instrucciones de Hugging Face, base del anterior |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, con soporte de tool calling |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, contexto largo, requiere aceptacion de licencia |

La comparativa se ofrece como referencia de categoria (modelos de 1-2B para instrucciones); los datos de contexto y licencia de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Modelo de 1,7B parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 7B o superiores; propenso a errores en tareas complejas.
- Riesgo de alucinacion elevado en preguntas factuales, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- Entrenado y ajustado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- La licencia no esta disponible en la informacion proporcionada; antes de un uso comercial es imprescindible verificar la licencia del modelo base original (SmolLM2) y del fine-tune de EleutherAI.
- Al ser un fine-tune sobre datos sinteticos (Magpie), puede heredar sesgos y artefactos del modelo generador utilizado para crear las instrucciones.
- Las cuantizaciones estaticas (sin imatrix) ofrecen peor calidad que las ponderadas a igual tamano; el autor indica que las versiones imatrix no estan disponibles en el momento de la publicacion.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- El repositorio tiene un numero muy bajo de descargas (51) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.
- La fecha de actualizacion (2026-11-20) es posterior a la de creacion; conviene revisar si el repositorio ha sido modificado o re-subido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k-GGUF
- Modelo base original: https://huggingface.co/EleutherAI/SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#SmolLM2-1.7B-magpie-ultra-v1.0-class-score-431k-GGUF
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- SmolLM2 (modelo base de Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Magpie (metodo de generacion de instrucciones): https://github.com/magpie-align/magpie
