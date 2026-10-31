# mradermacher/Qwen3.5-9B-CuteHuman-GGUF

## Resumen

Qwen3.5-9B-CuteHuman-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo wesjos/Qwen3.5-9B-CuteHuman, realizadas por mradermacher, un cuantizador muy activo de la comunidad Hugging Face. El modelo base es un ajuste de la familia Qwen3.5 de 9B parámetros (9.197.093.888 parámetros exactos según los safetensors) orientado a roleplay y conversación con estilo "cute", caracterizado por el uso de emojis y kaomoji en sus respuestas. Según los tags del repositorio, el modelo es multimodal e incluye suplementos mmproj para capacidades de visión en llama.cpp.

Esta ficha cuantizada es relevante porque permite ejecutar un modelo de roleplay multimodal de tamaño medio en hardware de consumo: las versiones Q4_K_M ocupan unos 5,9 GB, lo que las hace accesibles para GPUs de 8 GB o incluso para ejecución en CPU con RAM suficiente. El modelo está licenciado bajo Apache 2.0, lo que permite su uso comercial sin restricciones. Los idiomas principales son chino e inglés; no hay constancia de soporte oficial para castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible detalle completo |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por mradermacher); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, wesjos/Qwen3.5-9B-CuteHuman, es un ajuste de un modelo de la familia Qwen3.5 de 9B parámetros. Los tags del repositorio indican que es multimodal, y la presencia de archivos mmproj (multimodal projector) en formato f16 y Q8_0 confirma que puede procesar imágenes cuando se usa con llama.cpp o derivados, que cargan el proyector de visión como archivo complementario.

Sobre los datos de entrenamiento del ajuste, el método (SFT, DPO, RLHF), el número de tokens y la composición del dataset no están disponibles en la información proporcionada. Por los tags (roleplay, cute, emoji, kaomoji), todo apunta a un ajuste fino orientado a conversación estilizada y generación de personajes, pero no hay detalles publicados en la model card. Las cuantizaciones de mradermacher son estáticas (convertidas desde los safetensors originales con tipo de conversión "hf"), y existen también versiones imatrix/weighted en un repositorio hermano.

## Capacidades

- Generación de texto conversacional con estilo "cute", uso intensivo de emojis y kaomoji.
- Roleplay: interpretación de personajes y conversaciones de rol, uso principal para el que se ha ajustado el modelo.
- Capacidades multimodales: los archivos mmproj (0,7 GB en Q8_0 y 1,0 GB en f16) permiten el procesamiento de imágenes en runtimes compatibles con GGUF como llama.cpp.
- Soporte multilingüe en chino e inglés; el soporte de otros idiomas no está documentado.
- No hay información publicada sobre tool calling, function calling ni capacidades de agente.
- No hay información sobre modo de razonamiento (thinking mode) heredado de la familia Qwen3.

## Casos de uso

- Chatbots de compañía y roleplay en local: el modelo está ajustado específicamente para conversaciones de rol con personalidad expresiva; con la versión Q4_K_M (5,9 GB) cabe en una GPU de 8 GB y funciona con backends típicos de roleplay como llama.cpp o KoboldCpp.
- Generación de contenido estilizado para redes sociales o aplicaciones de mensajería: su inclinación natural a emojis y kaomoji lo hace adecuado para redactar mensajes con tono cercano y expresivo en chino e inglés.
- Asistente multimodal ligero: combinando el modelo cuantizado con el archivo mmproj, se puede construir un chatbot que describa imágenes en local, útil para aplicaciones de privacidad donde los datos no deben salir del dispositivo.
- Prototipado de agentes conversacionales con personalidad: al ser un modelo de 9B, permite iterar rápidamente en desarrollo local antes de escalar a modelos mayores.
- Ejecución en CPU o dispositivos sin GPU dedicada: las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,5 GB) permiten inferencia en portátiles con RAM limitada, sacrificando calidad de generación.
- Traducción o redacción bilingüe chino-inglés con tono informal: su entrenamiento en ambos idiomas lo hace útil para contenido casual bilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un ajuste comunitario orientado a roleplay, ni el autor del modelo base ni el cuantizador publican evaluaciones en MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin KV cache):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - Añadir 0,7-1,0 GB adicionales si se carga el mmproj para visión.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4090 para las cuantizaciones altas; GPUs de 8 GB (RTX 3060 Ti, RTX 4060) para Q4_K_M o inferiores.
- Cabe en consumer GPUs: sí, desde 6-8 GB de VRAM con cuantizaciones Q4 o menores; también es viable en CPU pura con 8-16 GB de RAM, con latencias mucho mayores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), KoboldCpp, Ollama, LM Studio, text-generation-webui. Para el modelo base en safetensors: vLLM o TGI, aunque no está verificado en la información disponible.
- Latencia y throughput: no disponibles; en GPU de consumo con Q4_K_M se puede esperar generación fluida en tiempo real típica de modelos de 9B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-9B-CuteHuman (esta ficha) | 9,2B | GGUF (12 cuants) | Apache 2.0 | Roleplay, estilo cute, emojis | Sí (mmproj) |
| Qwen3-8B (base oficial) | 8B | Safetensors, GGUF comunitario | Apache 2.0 | Uso general, thinking mode | No |
| GLM-4-9B-Chat | 9B | Safetensors, GGUF comunitario | Licencia propia (restricciones comerciales) | Chat general | Versión GLM-4V sí |
| Llama-3.1-8B-Instruct | 8B | Safetensors, GGUF comunitario | Llama Community License | Uso general | No |

Frente a los modelos generales de su rango de tamaño, Qwen3.5-9B-CuteHuman se diferencia por su especialización en roleplay y estilo expresivo, y por incluir soporte multimodal en formato GGUF. Su licencia Apache 2.0 es más permisiva que la de GLM-4-9B y Llama-3.1. En tareas generales (razonamiento, código, matemáticas) probablemente rinda peor que los modelos base oficiales, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Idiomas: solo hay soporte documentado para chino e inglés. No hay garantía de calidad en castellano; los emojis y kaomoji pueden aparecer de forma excesiva en respuestas donde no se deseen.
- Sesgos: no disponible información específica; como todo modelo de lenguaje, puede heredar sesgos de los datos de Qwen3.5 y del dataset de ajuste para roleplay.
- Alucinaciones: riesgo estándar de modelos de 9B; en roleplay puede generar contenido ficticio de forma consistente, lo que exige salvaguardas si se usa en aplicaciones con usuarios finales.
- Contexto: la longitud de ventana de contexto no está documentada en la model card; verificarla en la configuración del modelo base antes de planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base (wesjos/Qwen3.5-9B-CuteHuman) por si existen condiciones adicionales del autor del ajuste.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad de generación; para roleplay con estilo fino (emojis, formato) se recomienda Q4_K_M o superior.
- Contenido: al ser un modelo de roleplay sin filtro documentado, puede generar contenido sensible; se recomienda moderación en despliegues públicos.
- Benchmarks: al no existir evaluaciones publicadas, no es posible comparar objetivamente su capacidad de razonamiento o código frente a modelos generales.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-CuteHuman-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-9B-CuteHuman
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Qwen3.5-9B-CuteHuman-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-CuteHuman-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
