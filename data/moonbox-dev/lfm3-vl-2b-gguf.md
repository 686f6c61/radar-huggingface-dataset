# moonbox-dev/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B-GGUF es una compilación de cuantizaciones en formato GGUF del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario moonbox-dev para su uso con llama.cpp en dispositivos locales (Metal, CUDA, Vulkan y CPU). El modelo original lo desarrolla Liquid AI y combina un modelo de lenguaje LFM3 de aproximadamente 1.730 millones de parámetros con una torre de visión y su proyector, lo que permite entrada de imagen y vídeo además de texto. Esta compilación no introduce pesos nuevos: reproduce el checkpoint original en distintas precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) junto con un fichero `mmproj` compartido que contiene el codificador visual.

El interés de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo visión-lenguaje de 2B en hardware de consumo, con métricas de fidelidad frente al BF16 original para cada cuantización. El modelo "piensa" antes de responder y llama.cpp expone ese razonamiento como `reasoning_content`. La arquitectura del modelo base es un híbrido de convoluciones cortas y atención con compuertas (gated attention), propio de la familia LFM3.

La licencia es lfm1.0, heredada del modelo original, y las cuantizaciones son derivadas, por lo que quedan sujetas a las mismas condiciones. El repositorio ocupa 12,9 GB y fue creado el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido de convoluciones cortas y atención con compuertas (LFM3) más torre de visión con proyector |
| Parametros totales | 1.728.801.600 (según safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (los prompts de evaluación incluyen inglés y chino) |
| Licencia | lfm1.0 |
| Formato de pesos | GGUF (llama.cpp); fichero `mmproj` F16 para el codificador visual |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B emplea la arquitectura LFM3, descrita en la model card como un híbrido de convoluciones cortas y atención con compuertas, orientado a eficiencia en inferencia. Sobre el modelo de lenguaje se añade una torre de visión y un proyector que transforman las imágenes (y vídeo) en tokens compatibles con el decodificador. El fichero GGUF principal contiene únicamente el modelo de lenguaje; el codificador visual viaja aparte en `mmproj-lfm3-vl-2b-F16.gguf` (379 MB) y es común a todas las precisiones.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Las cuantizaciones se generaron con llama.cpp `b12621` a partir de la revisión `23387beda4` del modelo original: `convert_hf_to_gguf.py` produjo los ficheros BF16 y `mmproj`, y `llama-quantize` generó el resto. Q6_K, Q5_K_M y Q4_K_M se cuantizaron con importance matrix calculada sobre 200 × 512 tokens de WikiText-2 train usando el fichero Q8_0. La verificación tensor a tensor confirma que 423 de 424 tensores coinciden con el checkpoint original; el patchifier visual se divide en dos mitades temporales que coinciden con el original con un error máximo de 3e-8.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Comprensión de imágenes y vídeo mediante el codificador `mmproj` (entrada `image_url` en la API compatible de llama-server).
- Modo de razonamiento previo a la respuesta: el modelo "piensa" y llama-server devuelve ese contenido como `reasoning_content`.
- Descripción de imágenes y respuesta a preguntas visuales (verificado manualmente con Q4_K_M sobre una foto de prueba).
- Capacidades multilingües: los prompts de evaluación incluyen inglés y chino, aunque no se declara una lista oficial de idiomas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Asistente visual en local: desplegar el modelo con llama-server y `--mmproj` para responder preguntas sobre imágenes capturadas por el usuario, sin enviar datos a la nube; el tamaño de 1,10-1,85 GB en Q4/Q8 lo hace viable en portátiles.
- Descripción automática de imágenes en pipelines de accesibilidad: generar texto alternativo para lotes de fotos usando la cuantización Q5_K_M, que mantiene una fidelidad alta (KL 0,0040) con solo 1,26 GB.
- Análisis de fotogramas de vídeo: el codificador admite entrada de vídeo, útil para resumir o etiquetar clips cortos en herramientas de edición locales.
- Prototipado de aplicaciones multimodal en entornos con GPU de consumo: usar Q4_K_M (1,10 GB) para iterar rápido en una RTX 3080 Laptop o similar, aceptando la ligera pérdida de fidelidad marcada como experimental.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas KL y de coincidencia de token superior, lo que permite elegir precisión según memoria disponible en un despliegue concreto.
- Inferencia en CPU o dispositivos embebidos: al ser GGUF compatible con llama.cpp en CPU, Vulkan y Metal, puede integrarse en aplicaciones de escritorio o edge sin GPU dedicada.
- Chat con razonamiento visible: aprovechar `reasoning_content` para depurar respuestas o mostrar el proceso de pensamiento en herramientas educativas.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye una evaluación propia de fidelidad de cuantización frente al BF16, con 12 prompts (8 en inglés, 4 en chino), decodificación greedy de 64 tokens y cálculo de divergencia KL y coincidencia del token más probable:

| Precision | Tamano | Peso vs BF16 | KL chat | Mismo token superior |
|---|---|---|---|---|
| F16 | 3,47 GB | Igual a BF16 | 0,000003 | 100 % |
| BF16 | 3,47 GB | Referencia | — | — |
| Q8_0 | 1,85 GB | 0,57 % | 0,0003 | 99,5 % |
| Q6_K | 1,43 GB | 1,87 % | 0,0014 | 98,7 % |
| Q5_K_M | 1,26 GB | 3,24 % | 0,0040 | 98,0 % |
| Q4_K_M | 1,10 GB | 5,99 % | 0,0137 | 96,9 % |

El umbral del laboratorio es KL ≤ 0,01 y coincidencia ≥ 90 %; todas las precisiones lo cumplen salvo Q4_K_M (KL 0,0137), marcada como experimental. Q5_K_M es el fichero más pequeño dentro del umbral.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB (Q4_K_M), 1,3 GB (Q5_K_M), 1,4 GB (Q6_K), 1,9 GB (Q8_0) y 3,5 GB (F16/BF16) solo para los pesos del modelo de lenguaje; hay que sumar el `mmproj` de 379 MB cuando se procesan imágenes.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones pequeñas; el autor validó la evaluación en una RTX 3080 Laptop con CUDA. Para F16 conviene disponer de 8 GB o más.
- GPU de consumo: sí, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en Apple Silicon vía Metal.
- Despliegue: llama.cpp `b12621` o superior (`llama-server`), con soporte Metal, CUDA, Vulkan y CPU. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; solo se indica que la evaluación se ejecutó en una RTX 3080 Laptop mediante `llama-server` en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-GGUF (este) | ~1,73 B | No disponible | GGUF | lfm1.0 | Cuantizaciones para llama.cpp con métricas de fidelidad |
| LiquidAI/LFM3-VL-2B | ~1,73 B | No disponible | Safetensors | lfm1.0 | Modelo original multimodal, referencia BF16 |
| Otras alternativas de 2B visión-lenguaje | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia lfm1.0 es "other" y puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- Q4_K_M está marcada como experimental: su divergencia KL (0,0137) supera el umbral del laboratorio y puede degradar respuestas frente al BF16.
- No se declara una lista oficial de idiomas soportados; la evaluación solo cubre inglés y chino, por lo que el rendimiento en castellano no está verificado.
- No hay datos publicados de benchmarks estándar, sesgos, tasas de alucinación ni longitud de contexto, lo que dificulta evaluar su idoneidad en tareas de razonamiento complejo.
- El modo de razonamiento previo puede aumentar la latencia y el consumo de tokens; conviene controlarlo en aplicaciones sensibles al tiempo.
- La torre de visión solo está disponible en F16 (379 MB); no se ofrecen cuantizaciones del codificador visual.
- La información sobre tool calling, agentes y function calling no está documentada, por lo que no debe asumirse su soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Banner de Liquid AI (referenciado en la model card): https://huggingface.co/LiquidAI/LFM3-1.7B/resolve/main/assets/liquid-ai-banner.webp
- Consola de Liquid AI: https://console.liquid.ai/dashboard
