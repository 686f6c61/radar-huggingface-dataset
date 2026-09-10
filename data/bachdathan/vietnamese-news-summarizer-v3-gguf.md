# BachDaThan/vietnamese-news-summarizer-v3-GGUF

## Resumen

vietnamese-news-summarizer-v3-GGUF es una version cuantizada en formato GGUF de un ajuste fino del modelo Qwen3-1.7B, orientada especificamente a la summarizacion de noticias en vietnamita. El modelo lo publica el usuario BachDaThan, que ha tomado el adaptador LoRA vinhthuan/vietnamese-news-summarizer-v3, lo ha fusionado sobre los pesos base de Qwen/Qwen3-1.7B y ha generado cuatro niveles de cuantizacion para su uso con llama.cpp y Ollama. Se trata, por tanto, de una publicacion de distribucion (quantized_by) mas que de un entrenamiento original desde cero.

La relevancia de esta ficha es practica: ofrece un modelo de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) que cabe en GPU de consumo con apenas 3 GB de VRAM en su cuantizacion Q4_K_M, lo que permite ejecutar resumen de noticias en vietnamita en portatiles y equipos modestos, incluso en CPU. La arquitectura subyacente es Qwen3, un transformer denso con 28 capas, hidden size de 2048, atencion con 16 cabezas de consulta y 8 cabezas KV (GQA), vocabulario de 151936 tokens y ventana de contexto declarada de 40960 tokens.

El modelo esta etiquetado como instruction-tuned, conversational y lora-merged, con soporte para vietnamita (vi) e ingles (en), y se distribuye bajo licencia Apache-2.0. No tiene descargas ni likes en el momento del registro y no se han publicado resultados de benchmarks, por lo que su evaluacion debe hacerse de forma empirica sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (atencion con GQA) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40960 tokens (ventana declarada en la model card) |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); pesos originales en bfloat16 |
| Capas | 28 |
| Hidden size | 2048 |
| Head dim | 128 |
| Cabezas de atencion | 16 |
| Cabezas KV | 8 |
| Tamano de vocabulario | 151936 |
| Precisión original | bfloat16 |
| Modelo base | Qwen/Qwen3-1.7B |
| Adaptador LoRA | vinhthuan/vietnamese-news-summarizer-v3 |
| Plantilla de chat | estilo ChatML con tokens `<|im_start|>` / `<|im_end|>` |
| Tamano del repositorio | 4,0 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B: un transformer denso decodificador-only con 28 capas, hidden size de 2048 y atencion con Grouped Query Attention (16 cabezas de consulta frente a 8 cabezas KV), lo que reduce el coste de la cache KV frente a atencion multi-cabeza completa. El vocabulario de 151936 tokens y la ventana de contexto declarada de 40960 tokens son los del modelo base. Los pesos originales estan en bfloat16.

El proceso de construccion descrito en la model card es el siguiente: se parte del adaptador LoRA vinhthuan/vietnamese-news-summarizer-v3, se fusiona (merge) sobre Qwen/Qwen3-1.7B y el resultado se cuantiza a GGUF de forma automatica. No se documentan en la informacion disponible el numero de tokens de entrenamiento del adaptador, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta si el ajuste preserva o elimina el modo de razonamiento (thinking) del Qwen3 original; la plantilla de chat incluida en el repositorio no incorpora ningun conmutador de pensamiento, por lo que la generacion se plantea como conversacional directa con `temperature=0.6` y `top_p=0.95` como valores sugeridos.

La innovacion destacable aqui no es arquitectonica, sino de distribucion: las cuantizaciones se generaron y se midieron tamano a tamano con `stat().st_size` tras el proceso, y la model card publica el tamano real de cada fichero junto a una recomendacion de VRAM, lo que permite planificar el despliegue con datos verificados en lugar de estimaciones.

## Capacidades

- Generacion de texto conversacional en vietnamita e ingles, con plantilla de chat tipo ChatML.
- Summarizacion de noticias en vietnamita, que es el objetivo declarado del ajuste fino.
- Instrucciones de un solo turno y conversaciones multiturno mediante `create_chat_completion` o equivalentes.
- Razonamiento y comprension lectora basicos heredados del modelo base Qwen3-1.7B, aunque no hay evaluacion publicada sobre el grado de preservacion tras el merge del LoRA.
- Ejecucion local en CPU y GPU a traves de llama.cpp, llama-cpp-python y Ollama.
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling especifico.
- No hay evidencia de soporte de agentes, razonamiento multi-paso explicito ni modo thinking en esta version.
- No hay soporte multimodal: es un modelo exclusivamente de texto.

## Casos de uso

- Resumen automatico de noticias vietnamitas: es el caso de uso principal para el que se construyo el adaptador; el modelo recibe el cuerpo de una noticia en vietnamita y devuelve una sintesis, con un coste de inferencia de aproximadamente 1 GB de pesos en Q4_K_M.
- Agregadores de prensa y boletines: integrar el modelo en un pipeline que recoja feeds RSS, genere resumenes por articulo y los agrupe por tematica; los 40960 tokens de contexto permiten procesar articulos largos sin trocear en exceso.
- Clasificacion y etiquetado de contenido periodistico: uso como preprocesador para extraer tema, entidades o tono antes de indexar en un buscador interno, aprovechando que el modelo es instruction-tuned.
- Asistentes conversacionales de nicho en vietnamita: al estar ajustado sobre instrucciones y soportar multiturno con la plantilla ChatML, puede desplegarse como chatbot ligero en atencion al cliente siempre que se acote el dominio y se validen las respuestas.
- Procesamiento en el borde o en equipos sin GPU: con cuantizaciones de 0,81 a 1,03 GB, es viable ejecutarlo en portatiles, mini-PC o incluso en un servidor modesto con llama.cpp usando solo CPU.
- Traduccion auxiliar vietnamita-ingles: el modelo declara ambos idiomas y puede emplearse para borradores de traduccion o para resumir fuentes en ingles y presentarlas en vietnamita, aunque la calidad no esta documentada.
- Prototipado e investigacion sobre ajuste fino: sirve como ejemplo reproducible de pipeline merge de LoRA mas cuantizacion GGUF para quienes quieran replicar el flujo con otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, resumen (ROUGE) ni de ninguna otra metrica para este modelo ni para el adaptador LoRA de origen. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun la model card: aproximadamente 3,0 GB para Q4_K_M y Q4_K_S, 2,9 GB para Q3_K_M y 2,8 GB para Q3_K_S. Estas cifras incluyen el contexto y la cache KV, y son superiores al tamano del fichero (1,03 GB, 0,99 GB, 0,88 GB y 0,81 GB respectivamente).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente. Sirven RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien es viable en iGPU con memoria unificada. No se requiere A100 ni H100.
- Despliegue en CPU: al ser un modelo de 1,7 B en cuantizaciones de menos de 1,1 GB, se puede ejecutar en CPU con llama.cpp, aunque no hay datos publicados de velocidad.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (con el Modelfile incluido en la model card) y LM Studio. vLLM y TGI trabajan mejor con el modelo en safetensors que con GGUF; no hay confirmacion de soporte GGUF en esas herramientas para este repositorio.
- Configuracion sugerida: `n_ctx=8192`, `n_gpu_layers=-1` en llama-cpp-python, `temperature=0.6` y `top_p=0.95`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vietnamese-news-summarizer-v3-GGUF | 1,7 B | 40960 | vi, en | apache-2.0 | GGUF (4 cuantizaciones) | Ajuste LoRA fusionado, orientado a resumen de noticias en vietnamita |
| Qwen/Qwen3-1.7B (base) | 1,7 B | 40960 | multilingue (incluye vi y en) | apache-2.0 | safetensors | Modelo generalista de origen; soporta modo thinking; sin ajuste de dominio |
| vinhthuan/vietnamese-news-summarizer-v3 | no disponible | no disponible | vi, en | apache-2.0 | adaptador LoRA | Adaptador original antes del merge; requiere cargar el base por separado |
| Otros modelos vietnamitas de ~1-2 B | no disponible | no disponible | vi | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre estas alternativas no es posible con los datos disponibles, ya que no se han publicado benchmarks para ninguna de las variantes derivadas.

## Limitaciones y advertencias

- Riesgo de alucinacion: el propio autor advierte de que el modelo puede generar informacion falsa y pide no usar sus salidas como sustituto de asesoramiento profesional en areas criticas.
- Especializacion estrecha: al tratarse de un LoRA fusionado orientado a resumen de noticias en vietnamita, es probable que haya perdido parte de la capacidad generalista del Qwen3-1.7B original; no hay evaluacion publicada que lo cuantifique.
- Sesgos: no se documenta ninguna evaluacion de sesgo. Al entrenarse sobre noticias en vietnamita, puede heredar los sesgos editoriales y tematicos de las fuentes utilizadas, que no se detallan.
- Cobertura idiomatica: la model card declara vietnamita e ingles, pero no hay datos sobre el rendimiento real en ingles ni sobre variedades dialectales del vietnamita.
- Contexto: aunque se declaran 40960 tokens, la model card recomienda `n_ctx=8192` en los ejemplos de uso, y no se especifica si la ventana completa es efectiva tras el ajuste. El consumo de VRAM indicado presupone contextos moderados.
- Estado del repositorio: 0 descargas y 0 likes en el momento del registro, sin historial de uso que permita validar la calidad en produccion.
- Licencia: tanto el modelo base como el adaptador se declaran Apache-2.0, lo que permite uso comercial. No obstante, la propia model card indica que la licencia del repositorio se determino tras un pipeline de verificacion de las licencias de origen y no se asigno Apache-2.0 de forma automatica; conviene revisar el fichero LICENSE del repositorio antes de un despliegue comercial.
- Reproducibilidad: no se documentan hiperparametros de cuantizacion, version de llama.cpp ni semillas, mas alla de la indicacion de que el proceso fue automatico.
- No apto para tareas multimodales ni para function calling: no hay evidencia de soporte de ninguna de las dos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/BachDaThan/vietnamese-news-summarizer-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Adaptador LoRA de origen: https://huggingface.co/vinhthuan/vietnamese-news-summarizer-v3
- Fichero de licencia del repositorio: LICENSE dentro del repositorio de HuggingFace (https://huggingface.co/BachDaThan/vietnamese-news-summarizer-v3-GGUF)
- Resultados de busqueda web: no se encontro ningun enlace relevante al modelo, al autor ni al adaptador. Las busquedas devolvieron exclusivamente paginas de hospitales psiquiatricos en ruso, sin relacion alguna con el modelo.
