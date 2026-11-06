# Sanjok486/gustaf-1.7b-gguf

## Resumen

Gustaf 1.7B es una variante cuantizada del modelo Qwen3-1.7B de Qwen, publicada por el usuario Sanjok486 en Hugging Face. Se trata de un modelo base de 1.720 millones de parametros que ha sido afinado mediante LoRA con un pequeño conjunto de ejemplos propios del autor, con un estilo conversacional concreto: desenfadado, breve y honesto. El modelo esta distribuido en formato GGUF con cuantizacion Q4_K_M, lo que lo hace especialmente adecuado para su ejecucion local mediante Ollama o llama.cpp sin necesidad de hardware dedicado.

Su relevancia radica en la eficiencia: al ser un modelo de menos de 2 mil millones de parametros cuantizado a 4 bits, ocupa aproximadamente 1,1 GB y puede ejecutarse en portatiles y ordenadores de consumo sin GPU dedicada. Esta orientado principalmente a conversacion en aleman (idioma declarado en la ficha), heredando las capacidades base de la familia Qwen3. Es un ejemplo representativo de la tendencia actual de publicar variantes ligeras afinadas por la comunidad para casos de uso concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.720.574.976 (~1,72B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume densa) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens, ampliable a 131.072 con YaRN, segun documentacion de Qwen) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Aleman (declarado en la ficha); el modelo base Qwen3 soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gustaf 1.7B parte de Qwen3-1.7B, un modelo transformer decoder-only denso de la familia Qwen3 de Alibaba. El autor ha aplicado un fine-tuning eficiente mediante LoRA (Low-Rank Adaptation), una tecnica que congela los pesos originales y entrena matrices de bajo rango adicionales, reduciendo drasticamente los requisitos de computo y memoria del entrenamiento.

El conjunto de datos de entrenamiento es pequeño y privado: el autor describe "un pequeño conjunto de ejemplos propios" con un estilo definido como informal, breve y honesto. No se ha publicado informacion sobre el numero de ejemplos, el numero de epocas, la tasa de aprendizaje ni si el modelo base fue entrenado con RLHF o DPO (aunque la familia Qwen3 original si paso por procesos de alineacion de este tipo). La cuantizacion a Q4_K_M se realiza sobre los pesos finales para reducir el tamaño del fichero GGUF a unos 1,1 GB, manteniendo un equilibrio razonable entre calidad y consumo de memoria.

## Capacidades

- Generacion de texto conversacional en aleman, con un estilo afinado hacia respuestas cortas, informales y directas.
- Capacidades heredadas del modelo base Qwen3-1.7B: razonamiento general, resumen, preguntas y respuestas, y generacion de codigo basica.
- Compatibilidad con el ecosistema Ollama y llama.cpp, lo que permite uso offline en local.
- Etiquetado como "conversational" en Hugging Face, orientado a dialogo multi-turno.
- No se ha documentado soporte de tool calling, function calling, vision ni audio para esta variante afinada (el modelo base Qwen3-1.7B si soporta tool calling, pero no consta que se conserve tras el fine-tuning).

## Casos de uso

- Chatbot conversacional en aleman con tono informal: el fine-tuning con ejemplos de estilo "locker, kurz, ehrlich" (informal, breve, honesto) lo hace adecuado para asistentes personales o bots de charla casual que requieran respuestas cortas y directas.
- Ejecucion local en portatiles de gama baja: con 1,1 GB de tamaño y cuantizacion Q4_K_M, puede cargarse en equipos sin GPU dedicada mediante Ollama, ideal para privacidad total (los datos no salen del dispositivo).
- Prototipado rapido de aplicaciones LLM: su tamaño reducido permite iterar rapidamente en desarrollo local antes de escalar a modelos mayores.
- Integracion en aplicaciones de escritorio: el formato GGUF es compatible con llama.cpp, lo que permite embeber el modelo en aplicaciones nativas sin dependencias de servicios en la nube.
- Experimentacion con fine-tuning LoRA: al ser un ejemplo publico de adaptacion de Qwen3-1.7B con un dataset pequeño, sirve de referencia para desarrolladores que quieran replicar el proceso con sus propios datos.
- Asistente offline para dispositivos con recursos limitados: la baja huella de memoria lo hace viable en mini-PC, Raspberry Pi de gama alta o maquinas virtuales pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-1.7B dispone de resultados publicados por Qwen, pero el autor de esta variante no ha evaluado el impacto del fine-tuning sobre metricas estandar (MMLU, GSM8K, etc.), por lo que no se pueden ofrecer cifras verificables para esta version concreta.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente 1,2-1,5 GB de RAM con la cuantizacion Q4_K_M (1,1 GB de pesos mas contexto), ejecutable incluso solo con CPU.
- GPU recomendadas: no requiere GPU dedicada. En caso de usar una, cualquier GPU con 2 GB de VRAM o mas es suficiente (por ejemplo, una RTX 3050 o superior).
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna; tambien funciona en CPU-only con velocidad aceptable para un modelo de este tamaño.
- Opciones de despliegue: Ollama (metodo recomendado por el autor: `ollama pull hf.co/Sanjok486/gustaf-1.7b-gguf`), llama.cpp, y cualquier runtime compatible con GGUF (LM Studio, Jan, GPT4All).
- Latencia y throughput: no disponible; al ser un modelo de 1,7B cuantizado a 4 bits, es de esperar respuestas rapidas incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Gustaf 1.7B (esta ficha) | 1,72B | Q4_K_M (GGUF) | 32K (base) | Apache 2.0 | Fine-tuning LoRA en aleman, estilo conversacional propio |
| Qwen3-1.7B (base) | 1,72B | multiples (GGUF, safetensors) | 32K-131K | Apache 2.0 | Modelo original, soporte tool calling, modo thinking |
| Llama 3.2 1B | 1,24B | multiples (GGUF) | 128K | Llama 3.2 Community License | Licencia con restricciones; sin fine-tuning de estilo |
| Gemma 2 2B | 2,6B | multiples (GGUF) | 8K | Gemma Terms of Use | Mayor tamaño, contexto mas corto, licencia restrictiva |

Gustaf 1.7B se diferencia de sus alternativas por su afinado especifico en aleman con estilo personalizado y su licencia Apache 2.0 sin restricciones, aunque carece de la documentacion y evaluaciones rigurosas de los modelos oficiales.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño y privado: no se conoce su tamaño ni composicion, por lo que la calidad y consistencia de las respuestas no estan garantizadas ni evaluadas.
- Riesgo de alucinacion elevado, tipico de modelos pequenos; agravado por la ausencia de evaluaciones publicadas del fine-tuning.
- Idioma principal declarado: aleman. El rendimiento en castellano u otros idiomas no esta documentado y puede ser inferior al del modelo base.
- Posible perdida de capacidades del modelo base (como tool calling o el modo thinking de Qwen3) tras el fine-tuning con un dataset pequeño; no hay verificacion al respecto.
- Sin benchmarks publicados: no es posible comparar objetivamente su rendimiento con el modelo base u otras variantes.
- Proyecto comunitario de autor individual, con muy pocas descargas (60) y sin mantenimiento aparente documentado; conviene verificar su estado antes de uso en produccion.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero el usuario debe respetar tambien los terminos de la licencia del modelo base Qwen3 (igualmente Apache 2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanjok486/gustaf-1.7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de Ollama: https://ollama.com
