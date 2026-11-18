# Harsha001/SenseNova-Loop-9B-ROCmFPX

## Resumen
SenseNova-Loop-9B-ROCmFPX es una cuantización en formato GGUF del modelo SenseNova-Loop-9B, un modelo vision-language de 9B parámetros desarrollado por el equipo SenseNova. La ficha corresponde a un repositorio no oficial publicado por el usuario Harsha001, que adapta los pesos originales para el runtime ROCmFPX, un fork de llama.cpp orientado a hardware AMD (ROCm y Vulkan), con especial atención a plataformas Strix Halo.

El modelo base destaca por una arquitectura de transformer con bucle: 24 de sus 32 capas decodificadoras se ejecutan dos veces por token, lo que resulta en 56 pasadas de capa por token. Además, en la parte buclada se mezclan dos flujos residuales (mHC). Esta innovación estructural incrementa la profundidad efectiva sin aumentar proporcionalmente el número de parámetros, pero también amplifica el error de cuantización, ya que los errores de redondeo atraviesan las capas compartidas dos veces.

La relevancia de esta ficha es doble: por un lado, documenta la disponibilidad de pesos cuantizados de un modelo multimodal reciente con licencia Apache-2.0; por otro, advierte de que la arquitectura `sensenova_loop` es nueva y requiere una versión específica del runtime (ROCmFPX compilado a partir del 18 de noviembre de 2026), por lo que no carga en llama.cpp estándar, LM Studio, Ollama ni versiones anteriores del fork.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con bucle de capas (`sensenova_loop`), 32 capas con 24 ejecutadas dos veces (56 pasadas por token), mezcla de dos flujos residuales (mHC) en la parte buclada |
| Parametros totales | 8.956.949.624 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (ROCmFPX, 8 bits), Q6_K (tipo estándar de llama.cpp, 6 bits); codificador visual en F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye `mmproj` F16 para el codificador visual) |

## Arquitectura y entrenamiento
El modelo base es un transformer decodificador de 9B parámetros con una modificación estructural denominada "looped transformer": de las 32 capas del decodificador, 24 se recorren dos veces por token, dando lugar a 56 pasadas de capa. En el tramo buclado se combinan dos flujos residuales (mHC), lo que añade una vía de información paralela a la residual convencional. El modelo es multimodal: procesa texto e imágenes y genera texto, con un codificador visual independiente que en esta cuantización se distribuye como `mmproj-SenseNova-Loop-9B-F16.gguf` (0.9 GB).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base incluye una cabeza de predicción multi-token (MTP) que no está incluida en estos archivos GGUF. La plantilla de chat original incluye un bloque de razonamiento (`<think>`); para respuestas sin razonamiento explícito se debe iniciar la respuesta con un bloque `<think>\n\n</think>\n\n` vacío. El soporte de la arquitectura en el fork ROCmFPX reutiliza el código de Qwen3.5 de llama.cpp, ya que el decodificador comparte el mismo esquema de capas híbridas.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes y descripción de su contenido (pipeline `image-text-to-text`).
- Razonamiento explícito mediante bloque de pensamiento (`<think>`), activable o desactivable desde la plantilla de chat.
- Razonamiento multi-paso y tareas de tipo agente, según los tags del modelo base (`reasoning`).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de audio ni de otros modalidades distintas de texto e imagen.
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso
- Descripción y etiquetado de imágenes en pipelines de catalogación: el modelo recibe una imagen y devuelve texto descriptivo; en las pruebas publicadas identificó correctamente formas y posiciones (círculo rojo arriba a la izquierda, cuadrado azul abajo a la derecha sobre fondo blanco).
- Asistentes conversacionales en inglés o chino con razonamiento visible: la plantilla de chat permite activar el bloque `<think>` para tareas que requieren cadena de razonamiento y desactivarlo para respuestas directas de baja latencia.
- Despliegue en estaciones de trabajo con GPU AMD: al estar empaquetado para ROCmFPX con soporte ROCm y Vulkan, está pensado para entornos con hardware AMD, incluido Strix Halo, donde llama.cpp estándar no es una opción directa.
- Evaluación de técnicas de cuantización en arquitecturas bucladas: el repositorio publica métricas de divergencia KL frente a BF16, lo que lo hace útil como caso de estudio de cómo el bucle amplifica el error de cuantización.
- Prototipado de aplicaciones visión-lenguaje en local: con 9.3 GB para el archivo de 8 bits más 0.9 GB del codificador visual, es viable en equipos con suficiente memoria unificada o VRAM.
- Investigación sobre transformers con capas recurrentes: sirve para experimentar con las diferencias de comportamiento frente a transformers convencionales de tamaño similar.
- Procesamiento de documentación técnica bilingüe inglés-chino con extracción de información a partir de capturas o diagramas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye únicamente métricas de fidelidad de cuantización (divergencia KL frente a BF16 y porcentaje de coincidencia del token superior), medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés, en una GPU NVIDIA GB10 tras expandir cada archivo a F16. La perplejidad del BF16 de referencia es 14.46.

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 ROCmFPX | 9.3 GB | 0.0012 | 98.7% |
| Q6_K (estándar) | 7.4 GB | 0.012 | 95.9% |
| Q8_0 estándar (referencia) | 9.5 GB | 0.0023 | 98.5% |
| Q6 ROCmFPX (referencia) | 7.4 GB | 0.013 | 95.5% |

El autor señala que el modelo es entre siete y diez veces más sensible a la cuantización que un fine-tune de Qwen3.5-9B con la misma receta, atribuido al doble paso de los errores de redondeo por las capas compartidas del bucle. No hay datos de latencia o throughput publicados; el autor advierte de que la generación es más lenta que en un modelo plano de 9B del mismo tamaño debido al elevado número de operaciones pequeñas en GPU por token.

## Requisitos de hardware
- VRAM estimada: aproximadamente 9.3 GB para el archivo Q8_0 más 0.9 GB del `mmproj` F16 si se usa visión; unos 7.4 GB más 0.9 GB para el Q6_K.
- GPU recomendadas: no hay pruebas publicadas en hardware AMD; el autor indica explícitamente que no se ha probado en AMD. Las métricas de cuantización se midieron en una NVIDIA GB10.
- Compatibilidad con GPU de consumo: el archivo de 8 bits cabe en GPUs con 12 GB o más de VRAM; el de 6 bits, en GPUs con 8-10 GB, en ambos casos sumando el codificador visual si se procesan imágenes.
- Opciones de despliegue: exclusivamente ROCmFPX compilado a partir del 18 de noviembre de 2026 o posterior. No funciona en llama.cpp estándar, LM Studio, Ollama ni versiones anteriores del fork.
- Latencia y throughput: no disponibles. Se espera menor velocidad que un transformer plano de 9B por el doble recorrido de capas y la mezcla de flujos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (base) | 8.96B | no disponible | texto + imagen | Apache-2.0 | Hugging Face, PyTorch |
| SenseNova-Loop-9B-ROCmFPX (esta ficha) | 8.96B | no disponible | texto + imagen | Apache-2.0 | GGUF para ROCmFPX |
| Qwen3.5-9B (fine-tune citado como referencia) | ~9B | no disponible | texto | no disponible | no disponible |

La comparación con Qwen3.5-9B procede únicamente de la afirmación del autor sobre sensibilidad a la cuantización; no se dispone de datos de rendimiento comparables entre ambos modelos. No se han identificado en la información proporcionada otras alternativas multimodales de 9B con arquitectura buclada.

## Limitaciones y advertencias
- Cuantización no oficial: el repositorio lo publica un tercero, no el equipo SenseNova; los créditos del modelo corresponden al equipo original.
- Sin probar en hardware AMD: a pesar de estar orientado a ROCm y Vulkan, el autor no ha verificado velocidad ni calidad en GPUs AMD.
- Dependencia estricta de runtime: requiere ROCmFPX compilado a partir del 18 de noviembre de 2026; cualquier otra herramienta fallará al cargar el archivo.
- Mayor degradación por cuantización que un modelo plano equivalente; para máxima fidelidad al BF16 se recomienda el archivo de 8 bits.
- Cabeza MTP no incluida, lo que puede afectar a la velocidad de decodificación especulativa si se esperaba aprovecharla.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación no cuantificado: no hay benchmarks de razonamiento, código ni tareas de agente en la información disponible, por lo que la fiabilidad en esos dominios no está verificada.
- Las métricas de KL se midieron sobre texto general en inglés (wikitext-2) y no predicen el comportamiento en razonamiento, código o tareas multimodales.
- Generación más lenta que un 9B plano por la estructura de bucle y la mezcla de flujos residuales.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución al equipo SenseNova y verificar la licencia del modelo base.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Harsha001/SenseNova-Loop-9B-ROCmFPX
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Código del modelo original: https://github.com/OpenSenseNova/SenseNova-Loop
