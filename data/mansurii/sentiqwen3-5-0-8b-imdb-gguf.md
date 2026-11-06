# mansurii/SentiQwen3.5-0.8B-IMDb-GGUF

## Resumen

SentiQwen3.5-0.8B-IMDb-GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mansurii, orientado especificamente a la clasificacion binaria de sentimiento en resenas de peliculas (positivo o negativo). El modelo parte de la familia Qwen3.5 de Alibaba y se ha especializado mediante un ajuste LoRA (entrenado con Unsloth) sobre el conjunto de datos Stanford NLP IMDB, para despues fusionarse y convertirse al formato GGUF en F16 para su uso con llama.cpp.

El problema que resuelve es concreto: la clasificacion de sentimiento en texto en ingles con una precision declarada del 95,78% sobre el conjunto de test completo de IMDB (25.000 resenas). Frente a modelos de analisis de sentimiento tradicionales (BERT, RoBERTa fine-tuned), este modelo mantiene la interfaz conversacional de un LLM generativo, lo que permite integrarlo en pipelines que ya utilizan plantillas de chat y tooling de llama.cpp.

Con aproximadamente 773 millones de parametros (dato real de safetensors), es un modelo pequeno y ligero, adecuado para despliegue en CPU o GPUs de consumo. Su relevancia actual radica en la tendencia de especializar modelos fundacionales pequenos para tareas de clasificacion concretas, obteniendo rendimiento cercano al estado del arte con un coste de inferencia muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5) |
| Parametros totales | 772.845.888 (~773 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 (unico formato publicado en el repo GGUF); BF16 para el proyector multimodal |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (F16); el modelo base y el merge de 16 bits estan en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El ajuste se realizo mediante LoRA con la libreria Unsloth, que el autor declara que entreno el modelo "2x mas rapido". Posteriormente, los adaptadores LoRA se fusionaron con el modelo base (repo `mansurii/SentiQwen3.5-0.8B-IMDb-16bit`) y se convirtieron a GGUF en F16 (fichero `Qwen3.5-0.8B.F16.gguf`). Tambien se publica un fichero `Qwen3.5-0.8B.BF16-mmproj.gguf`, que sugiere la existencia de un proyector multimodal en el modelo base, aunque no se detalla su uso en esta tarea.

El entrenamiento se realizo sobre el dataset `stanfordnlp/imdb`, con un formato de prompt conversacional de tres turnos: un mensaje de sistema que instruye la clasificacion, un mensaje de usuario con la resena y una respuesta del asistente con el formato `Sentiment: positive.` o `Sentiment: negative.`. El autor indica explicitamente que el modo "thinking" (razonamiento extendido) se desactivo durante el entrenamiento y la evaluacion. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset (aunque se sobreentiende que es el split de entrenamiento de IMDB) ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas de peliculas en ingles.
- Generacion de texto con formato conversacional (chat template con roles system/user/assistant).
- Razonamiento basico derivado del modelo base Qwen3.5, aunque el ajuste esta orientado a una unica tarea.
- Soporte de plantillas Jinja en llama.cpp (`--jinja`), lo que facilita la integracion con el formato de chat.
- Capacidad multilingue limitada: el modelo se ha ajustado y evaluado solo en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en esta variante especializada.

## Casos de uso

- Moderacion y analisis de resenas en plataformas de cine o streaming: el modelo clasifica resenas de usuarios como positivas o negativas con un 95,78% de precision, lo que permite agregar puntuaciones de sentimiento a gran escala.
- Monitorizacion de reputacion de peliculas o productos: procesar lotes de resenas de IMDB u otras fuentes y generar metricas de sentimiento por titulo, con un coste de inferencia bajo gracias a sus ~773 M de parametros.
- Investigacion en NLP y analisis de sentimiento: servir como baseline especializado y reproducible (dataset IMDB, split test completo) para comparar con modelos BERT/RoBERTa fine-tuned.
- Pipeline de enriquecimiento de datos: clasificar grandes volumenes de texto en ingles dentro de un ETL, usando llama.cpp en CPU o GPU de consumo sin necesidad de infraestructura dedicada.
- Prototipado rapido de clasificadores conversacionales: al mantener el formato de chat de Qwen3.5, se puede integrar en aplicaciones que ya usan plantillas de chat y cambiar de tarea sin reescribir el pipeline.
- Educacion y demostraciones: ejemplo de ajuste LoRA con Unsloth y conversion a GGUF, util para quienes aprenden a especializar modelos fundacionales pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test completo de `stanfordnlp/imdb` (25.000 resenas), con decodificacion greedy:

| Metrica | Valor |
|---|---|
| Accuracy | 95,78% |
| Macro F1 | 0,9578 |
| Macro Precision | 0,9579 |
| Macro Recall | 0,9578 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Negativo | 0,97 | 0,95 | 0,96 | 12.500 |
| Positivo | 0,95 | 0,97 | 0,96 | 12.500 |

Matriz de confusion (filas = real, columnas = predicho):

| | Negativo | Positivo |
|---|---|---|
| Negativo | 11.862 | 638 |
| Positivo | 417 | 12.083 |

Nota: estos resultados no estan verificados de forma independiente (`verified: false` en el model-index). El criterio de evaluacion fue considerar positiva cualquier salida que contuviera la palabra "positive"; en caso contrario, negativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~773 M de parametros en F16, el peso del modelo ocupa aproximadamente 1,5 GB; en cuantizaciones de 8 bits o 4 bits (no publicadas en este repo, pero generables con llama.cpp) se reduciria a ~0,8 GB y ~0,4 GB respectivamente, mas el overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para F16; RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con `llama-cli -hf mansurii/SentiQwen3.5-0.8B-IMDb-GGUF --jinja`), Ollama y otros runners compatibles con GGUF. vLLM y TGI requeririan conversion a safetensors o uso del repo de 16 bits.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia en GPU y throughput alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en IMDB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SentiQwen3.5-0.8B-IMDb-GGUF | ~773 M | No disponible | 95,78% accuracy (declarado) | No disponible | GGUF en HF |
| Qwen/Qwen3.5-0.8B (base) | ~773 M | No disponible | No disponible (no especializado en sentimiento) | No disponible | HF |
| Modelos BERT/RoBERTa fine-tuned en IMDB | ~110-355 M | 512 tokens | No disponible en la informacion proporcionada | Varía (MIT/Apache en la mayoria) | HF |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en clasificacion binaria de sentimiento en resenas de peliculas en ingles; su uso fuera de ese dominio (otros idiomas, otros tipos de texto) no esta validado.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir respuestas que no sigan el formato esperado (`Sentiment: positive.` / `Sentiment: negative.`); el autor mitiga esto con un criterio de evaluacion basado en la presencia de la palabra "positive".
- Sesgos: al entrenarse sobre IMDB, hereda los sesgos del dataset (resenas de peliculas, predominantemente en ingles y de una comunidad concreta).
- Licencia no disponible: no se especifica la licencia del modelo, lo que impide confirmar si el uso comercial esta permitido. Se debe consultar la licencia del modelo base Qwen3.5-0.8B y del repo antes de usarlo en produccion.
- El modo "thinking" esta desactivado; no se debe esperar razonamiento extendido.
- Solo se publica cuantizacion F16 en este repo; para otros tamanos habria que generar los GGUF a partir del merge de 16 bits.
- Resultados de benchmarks no verificados de forma independiente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mansurii/SentiQwen3.5-0.8B-IMDb-GGUF
- Adaptadores LoRA: https://huggingface.co/mansurii/SentiQwen3.5-0.8B-IMDb-lora
- Modelo fusionado 16-bit: https://huggingface.co/mansurii/SentiQwen3.5-0.8B-IMDb-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Matriz de confusion (imagen): https://cdn-uploads.huggingface.co/production/uploads/6a3c3fefeb8dc3ea15c4ac2d/Xf3S5iuvcaP9IHJEnMuCX.png
