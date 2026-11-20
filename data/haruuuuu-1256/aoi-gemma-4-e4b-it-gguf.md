# haruuuuu-1256/aoi-gemma-4-E4B-it-GGUF

## Resumen
aoi-gemma-4-E4B-it-GGUF es la version cuantizada en formato GGUF del modelo aoi-gemma-4-E4B-it, un ajuste fino de caracter orientado a roleplay y conversacion en japones, publicado por el usuario haruuuuu-1256. El modelo parte de la familia Gemma 4 y se distribuye especificamente para su uso con llama.cpp, con pesos en cuantizacion de 4 bits y BF16, ademas de un proyector multimodal separado para entrada de imagen.

El modelo resuelve el caso de uso de personajes conversacionales ("aoi") en japones, con un template de chat embebido que desactiva permanentemente el modo de razonamiento (thinking mode) para preservar la coherencia de la personalidad. La ficha tecnica del autor indica que el ajuste incluye una etapa de DPO (el nombre del archivo, aoi10dpo7, sugiere la septima iteracion de un proceso DPO), y que el modelo no ha sido entrenado con conversaciones en modo thinking.

Con aproximadamente 7.500 millones de parametros totales segun los safetensors del modelo base, un repositorio de 21,4 GB en GGUF y licencia Apache-2.0, el modelo es relevante para quienes necesitan desplegar un personaje japones multimodal en hardware de consumo mediante llama.cpp, sin depender de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), multimodal image-text-to-text |
| Parametros totales | 7.518.069.290 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits) y BF16; proyector multimodal en F16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de la familia Gemma 4 con capacidad multimodal image-text-to-text, segun el pipeline declarado. La arquitectura subyacente es un transformer de aproximadamente 7.500 millones de parametros totales, aunque el autor no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni la configuracion exacta de la etapa de alineacion. El nombre del archivo de pesos (aoi10dpo7) indica que se aplico un proceso de DPO (Direct Preference Optimization) sobre el modelo base, presumiblemente para reforzar el estilo de personaje y la conversacion en japones.

La innovacion tecnica mas destacable es la gestion del modo de razonamiento: el template de chat embebido en el GGUF desactiva siempre el thinking mode, porque el modelo no fue entrenado con conversaciones que incluyeran razonamiento explicito y activarlo degrada la personalidad. El autor documenta que la conversion a GGUF se realizo con el commit c746810 de llama.cpp y advierte que es necesario usar una version de llama.cpp compatible con Gemma 4. La evaluacion del autor, sobre 10 preguntas propensas a la desestabilizacion repetidas 8 veces con temperatura 0.7, reporta 1 rotura de personaje en 80 generaciones para la cuantizacion Q4_K_M.

## Capacidades
- Generacion de texto conversacional en japones con una personalidad de personaje definida ("aoi").
- Roleplay y conversacion multi-turno orientada a character.
- Entrada de imagen (image-text-to-text) mediante el proyector mmproj en F16.
- Conversacion sin modo de razonamiento: el template desactiva el thinking mode de forma deliberada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al japones segun la metadata del modelo.
- No se documenta soporte de audio ni otras modalidades mas alla de texto e imagen.

## Casos de uso
- Despliegue de un personaje conversacional en japones en local: el modelo se ejecuta con llama-server y el GGUF Q4_K_M de 5,34 GB, adecuado para un chatbot de personaje en una maquina de consumo.
- Prototipado de experiencias de roleplay interactivo: la cuantizacion de 4 bits y el template sin thinking permiten iterar rapidamente sobre dialogos de personaje sin infraestructura de servidor.
- Aplicaciones de compania virtual o asistente con personalidad fija: el ajuste DPO y el template embebido reducen la deriva de personalidad, con 1 rotura en 80 generaciones segun el autor.
- Interaccion multimodal basica en japones: cargando el mmproj F16 junto al modelo, se pueden procesar imagenes acompanadas de texto para respuestas contextuales de personaje.
- Evaluacion e investigacion de tecnicas DPO en modelos pequenos: el modelo sirve como caso de estudio de ajuste de personalidad sobre Gemma 4 con cuantizacion GGUF.
- Integracion en pipelines de llama.cpp para demos y entornos de prueba: el repositorio incluye instrucciones de ejecucion directas con llama-server y parametros de muestreo recomendados (temp 1.0, top-p 0.95, top-k 64).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion proporcionado por el autor es una prueba de estabilidad de personaje: 10 preguntas propensas a la desestabilizacion repetidas 8 veces con temperatura 0.7, con 1 rotura de personaje en 80 generaciones para la cuantizacion Q4_K_M.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con Q4_K_M (5,34 GB de pesos mas overhead); aproximadamente 16-17 GB con BF16 (15,05 GB de pesos mas overhead).
- Para entrada de imagen, anadir aproximadamente 1 GB del proyector mmproj F16.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 o superiores para BF16; GPUs con 8 GB o mas para Q4_K_M.
- Cabe en GPUs de consumo: si, con Q4_K_M en tarjetas de 8 GB o mas; BF16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server), con la version compatible con Gemma 4 (commit c746810 o posterior). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de la misma categoria (roleplay en japones, tamano 4B-8B o multimodal). El propio autor indica que, al ser un modelo de clase 4B, puede cometer errores en conocimiento detallado, pero no aporta comparaciones cuantitativas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al ser un ajuste de personaje, puede reflejar sesgos del dataset de roleplay no especificado.
- Riesgo de alucinacion: el autor advierte que, al ser un modelo de clase 4B, puede equivocarse en conocimiento detallado.
- Limitacion de idioma: el modelo esta orientado al japones; no se garantiza un rendimiento correcto en otros idiomas.
- Limitacion de contexto: la longitud de contexto no esta documentada.
- Modo de razonamiento: activar el thinking mode degrada la personalidad, ya que el modelo no fue entrenado con conversaciones de razonamiento; el template lo desactiva por defecto.
- Dependencia de version: requiere una version de llama.cpp compatible con Gemma 4 (commit c746810 o posterior); versiones anteriores pueden fallar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no detalla condiciones adicionales sobre el dataset de roleplay ni sobre el personaje.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
