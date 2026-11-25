# kapitoshkina-ai/DeepSeek-V4.1-Flash-1017-WHT128-HLUT3

## Resumen

DeepSeek-V4.1-Flash-1017-WHT128-HLUT3 es una cuantización comunitaria del modelo multimodal `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario `kapitoshkina-ai`. Se trata de una arquitectura MoE (mixture of experts) con capacidades de imagen-a-texto, cuantizada a 3,125 bits por peso mediante un esquema propietario denominado `WHT128-HLUT3` con calibración `FP64 RAREBAL-LDLQ`. El repositorio ocupa 47,2 GB e incluye únicamente los shards de pesos de los expertos enrutados, además del codificador visual `DeepSeek-ViT` en BF16 y los ficheros de tokenizer y configuración del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización extrema (3,125 bpw) aplicada a un MoE de gran tamaño, con resultados de fidelidad declarados por el autor (coseno medio de 0,98668 y SNR medio de 16,48 dB). Por otro, el modelo está diseñado para ejecutarse en hardware poco habitual: GPUs AMD MI50 (`gfx906`) y aceleradores Tenstorrent Blackhole P150A, lo que lo aleja de los entornos CUDA convencionales.

Conviene subrayar que la model card contiene afirmaciones muy específicas sobre rendimiento en silicio y procedencia criptográfica que no han sido verificadas de forma independiente. Los datos que se recogen en esta ficha provienen exclusivamente de la información publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con codificador visual DeepSeek-ViT; detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (validado por el autor con una prueba de aguja en pajar de 3 needles) |
| Tipos de cuantizacion | WHT128-HLUT3 (3,125 bpw, tiles de 400 B, 8 centroides half-Gaussian) con calibracion FP64 RAREBAL-LDLQ; el autor ofrece tambien una variante WHT128-HLUT4 (4,125 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (shards nativos sin particionar); BF16 para el codificador visual; ficheros de tokenizer y config del modelo base |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de DeepSeek con un codificador visual denominado `DeepSeek-ViT` y componentes adicionales que el autor menciona como `Engram` y `DSpark` (este último asociado a decodificación especulativa y a módulos MTP). La model card no detalla el número total de parámetros, el número de expertos del modelo original ni la composición del dataset de entrenamiento. Lo que sí se documenta es el proceso de cuantización: se promovieron 3.344 expertos enrutados (384 del módulo DSpark MTP, 720 del shard `dev3`, 1.080 del shard `dev4` y 1.160 del shard `TP3`), de los cuales 2.915 recibieron calibración completa FP64 RAREBAL-LDLQ y 429 cayeron en un fallback raro `H=I`. El autor declara cero violaciones de doble recibo y una identidad SHA-256 byte a byte frente a un freeze local.

La innovación técnica principal es el esquema de cuantización `WHT128-HLUT3`: transformada de Walsh-Hadamard de 128 puntos combinada con una lookup table de 3 bits (8 centroides half-Gaussian) sobre tiles de 32×32, con calibración en FP64. El autor reporta un coseno medio de 0,98668 y una SNR media de 16,48 dB, que según sus propias comparaciones supone +5,46 dB frente a `HLUT2 RAREBAL` y +4,82 dB frente a `HLUT3 H=I`. El pipeline de cuantización se distribuye como código C++17/C++20 puro, sin Python, en el repositorio `bespokeontology/dsv41-wht128-hlut2`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento de imagen a texto (`image-text-to-text`): incluye el codificador `DeepSeek-ViT` en BF16, con lectura de gráficas y charts mencionada en la model card.
- Razonamiento de contexto largo: el autor valida 1.048.576 tokens con recuperación del 100 % en una prueba de 3 needles.
- Tool calling: la campaña de ingeniería reportada incluye 173 llamadas a herramientas sin errores sobre 133 pasos.
- Decodificación especulativa mediante el módulo `DSpark`, con 44.777 pasos consecutivos sin cuelgues según el autor.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos extensos: con una ventana de 1.048.576 tokens, el modelo puede ingerir manuales, normativas o bases de código completas en una sola pasada sin fragmentación, lo que resulta adecuado para auditoría documental.
- Procesamiento de gráficas e informes visuales: el codificador `DeepSeek-ViT` permite extraer datos de charts e imágenes técnicas; el autor reporta una latencia de lectura de 643,3 ms en su banco de pruebas.
- Asistentes con tool calling en pipelines de ingeniería: la campaña reportada con 173 llamadas a herramientas sin errores sugiere viabilidad para agentes que consultan APIs o ejecutan comandos en entornos controlados.
- Despliegue en infraestructura AMD no CUDA: al estar orientado a `gfx906` (MI50), encaja en clústeres heredados de GPUs AMD Instinct que de otro modo quedarían fuera de juego para modelos de este tamaño.
- Despliegue en aceleradores Tenstorrent: la integración con Blackhole P150A mediante TT-Metal abre la puerta a inferencia sobre hardware alternativo a NVIDIA.
- Investigación en cuantización extrema: el pipeline C++17/C++20 publicado permite a investigadores reproducir y modificar el esquema WHT128-HLUT3 para estudiar el compromiso entre bitwidth y fidelidad en MoE.
- Servicio de chat multimodal de contexto largo: la combinación de visión, tool calling y 1M de contexto permite asistentes que mantienen el hilo de conversaciones muy extensas con referencias visuales.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en su propio hardware (`SB-M5-P2-192G`), no benchmarks estandarizados de la comunidad. Se presentan tal cual, sin comparación con modelos similares porque no se han publicado resultados de MMLU, HumanEval, GSM8K ni equivalentes en la información disponible.

| Métrica | Resultado declarado por el autor |
|---|---|
| Expertos promovidos WHT128-HLUT3 | 3.344 (desequilibrio minimax de 0,000732 %) |
| Fidelidad de cuantización | coseno medio 0,98668; SNR media 16,48 dB |
| Prefill en frío M=4096 | 923,4 tok/s (4.435,9 ms); pico 959,8 tok/s |
| Decodificación especulativa DSpark | 53,08 tok/s pico; 47,58 tok/s sostenido a 739,3K de contexto |
| Prueba de contexto 1M | 100 % de recall, 3/3 needles, cos CSA2 = 1,00000000 |
| Campaña de ingeniería en vivo | 133/133 pasos, 173/173 tool calls sin error, 98,64 % de reutilización de prefix-cache |
| Recarga de KV en frío | 467,8K tok/s E2E / 2,18M tok/s en bruto a 780K de contexto |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 47,2 GB en total; el autor reporta 4.184–4.610 MiB libres por rango TP3 de 32 GiB durante la prueba de 1M de contexto, lo que implica que el conjunto de pesos más el estado de inferencia cabe en el hardware descrito.
- GPUs validadas por el autor: 5× AMD Radeon Instinct MI50 (3× 32 GiB + 2× 16 GiB = 128 GiB HBM2) más 2× Tenstorrent Blackhole P150A (64 GiB GDDR6), con 384 GiB de DDR4-3200 ECC.
- GPUs NVIDIA: no se documenta soporte ni validación en A100, H100 o RTX 4090 en la información proporcionada.
- Consumer GPU: no disponible; el esquema está orientado a `gfx906` y Tenstorrent, no a GPUs de consumo.
- Opciones de despliegue: motor propietario en C++17/C++20 del repositorio `bespokeontology/dsv41-wht128-hlut2` (release `v2.1.0-wave10-192g`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los valores reportados en la sección de benchmarks corresponden al hardware del autor; no hay datos para otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandarizados ni de información sobre parámetros totales del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. El autor menciona una variante hermana, `Hy4-flash-WHT128-HLUT4` (basada en `tencent/Hy4-flash`), como repositorio acompañante con el mismo esquema de cuantización, pero no se proporcionan métricas comparativas entre ambos.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-WHT128-HLUT3 | no disponible | 1.048.576 | MIT | Cuantización comunitaria a 3,125 bpw, orientada a gfx906 y Tenstorrent |
| Hy4-flash-WHT128-HLUT4 | no disponible | no disponible | no disponible | Variante hermana del mismo autor, 4,125 bpw, sobre modelo base distinto |
| Modelo base DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | Referencia original sin cuantizar |

## Limitaciones y advertencias

- Las afirmaciones de rendimiento, fidelidad y procedencia criptográfica provienen exclusivamente del autor y no han sido verificadas de forma independiente.
- El repositorio contiene solo los shards de pesos de los expertos enrutados y el codificador visual; no se especifica si faltan otros tensores necesarios para la inferencia completa (spine, Engram, etc. se mencionan como incluidos, pero su estado no se detalla).
- El esquema de cuantización a 3,125 bpw implica una pérdida de fidelidad inherente; el autor reporta un SNR de 16,48 dB, que puede ser insuficiente para tareas de alta precisión numérica o razonamiento matemático complejo.
- El hardware objetivo son GPUs AMD MI50 (`gfx906`) y Tenstorrent Blackhole; no hay evidencia de funcionamiento en GPUs NVIDIA o en entornos consumer, lo que limita su adopción general.
- No se documentan los idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; al ser una cuantización de un modelo conversacional, el riesgo persiste.
- La licencia MIT se aplica al artefacto de cuantización, pero conviene verificar la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de un uso comercial.
- El tamaño del repo (47,2 GB) y la dependencia de un motor propietario en C++ dificultan la integración en stacks estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/kapitoshkina-ai/DeepSeek-V4.1-Flash-1017-WHT128-HLUT3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio del motor y release: https://github.com/bespokeontology/dsv41-wht128-hlut2/releases/tag/v2.1.0-wave10-192g
- Repositorio compañero HLUT4: https://github.com/bespokeontology/hy4-flash-wht128-hlut4/releases/tag/v1.0.0-hlut4-192g
- Pesos compañeros HLUT4: https://huggingface.co/kapitoshkina-ai/Hy4-flash-WHT128-HLUT4
