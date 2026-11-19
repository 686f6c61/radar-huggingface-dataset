# infosave/LFM2.5-cmf

## Resumen

LFM2.5-cmf es una distribución cuantizada en formato CMF de la familia LFM2.5 de LiquidAI, publicada por el usuario infosave. No se trata de un modelo entrenado desde cero, sino de una conversión de los checkpoints oficiales en bf16 a un contenedor de un solo archivo (CMF) con cuantización de 4 bits por bloques y escalas en escalera (`q4tp`). El repositorio agrupa tres variantes: LFM2.5-230M, LFM2.5-2.6B y LFM2.5-8B-A1B, esta última con arquitectura MoE.

La relevancia de esta ficha no está en el modelo en sí, sino en el formato de despliegue: los archivos se leen mediante `cortiq`, un binario escrito en Rust sin framework de machine learning por debajo, que soporta GPU vía Vulkan, Metal y DX12 con caída a CPU. Esto permite ejecutar los tres modelos en NVIDIA, AMD, Intel y Apple Silicon con el mismo archivo, sin Python ni dependencias de PyTorch.

Arquitectónicamente, LFM2.5 es un modelo híbrido: la mayoría de capas usan una convolución corta con compuerta y solo unas pocas llevan atención completa, lo que reduce el estado por token a un tamaño pequeño y constante en las capas convolucionales. El repositorio ocupa 6,0 GB y acumula 3268 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución corta con compuerta + atención completa en un subconjunto de capas); variante MoE en el modelo de 8B |
| Parametros totales | 0,23B (230M) / 2,70B (2.6B) / 8,3B (8B-A1B) |
| Parametros activos | 1B en LFM2.5-8B-A1B (32 expertos, 4 por token); no aplica en 230M y 2.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4tp (4 bits, por bloques con escalas en escalera); única variante publicada en el repo |
| Idiomas soportados | en |
| Licencia | other (heredada del modelo base LiquidAI/LFM2.5; consultar términos en el repositorio original) |
| Formato de pesos | CMF (contenedor de un solo archivo, mapeado en memoria); no se distribuyen safetensors ni GGUF en este repo |

Detalle por archivo:

| Archivo | Parametros | Capas | Tamano |
|---|---|---|---|
| `lfm2.5-230m-q4tp.cmf` | 0,23B | 14 (5 atención / 9 convolución) | 132 MB |
| `lfm2.5-2.6b-q4tp.cmf` | 2,70B | 30 (8 atención / 22 convolución) | 1,43 GB |
| `lfm2.5-8b-a1b-q4tp.cmf` | 8,3B totales, 1B activos | 24 (6 atención / 18 convolución) | 4,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LFM2.5 de LiquidAI, un diseño híbrido en el que la mayor parte de las capas aplica una convolución corta con compuerta y solo una fracción mantiene atención completa. En el modelo de 2,6B, 22 de las 30 capas son convolucionales y 8 son de atención; en el de 230M la proporción es 9 convolucionales frente a 5 de atención. Esta mezcla implica que el estado necesario por token es pequeño y constante en las capas convolucionales, lo que abarata la decodificación en contextos largos. La variante de 8B es un MoE con 32 expertos, enrutamiento por sigmoide y 4 expertos activados por token, sobre 24 capas (6 de atención y 18 convolucionales).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO: esos datos corresponden a la model card de LiquidAI y no se incluyen en la información proporcionada. La innovación técnica destacable de esta distribución es el propio contenedor CMF y el motor `cortiq`: un único archivo mapeado en memoria, leído por un binario Rust sin framework de ML, que en tarjetas discretas ejecuta el token completo como un único grafo enviado a la GPU, incluyendo el anillo de convolución y el enrutamiento de expertos. En el caso del MoE, la salida greedy es idéntica a la de la ruta de CPU.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Razonamiento y respuesta a instrucciones en formato conversacional (la API expone `/v1/chat/completions`).
- Soporte de decodificación en modo servidor compatible con la API de OpenAI, lo que habilita integración con clientes existentes.
- Ejecución multiplataforma: Vulkan, Metal y DX12 para GPU, con fallback a CPU; el mismo archivo funciona en NVIDIA, AMD, Intel y Apple Silicon.
- Enrutamiento de expertos eficiente en la variante 8B-A1B (4 de 32 expertos por token).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: limitada al inglés según el campo `language` del repositorio.

## Casos de uso

- Inferencia local en estaciones de trabajo sin Python: el binario `cortiq` se instala con `cargo install cortiq-cli` y ejecuta el archivo CMF directamente, lo que elimina la necesidad de gestionar entornos virtuales, CUDA toolkit o dependencias de PyTorch en máquinas de desarrollo y portátiles.
- Servicio de chat interno compatible con OpenAI: `cortiq serve` levanta un endpoint en `/v1/chat/completions` que cualquier cliente escrito para la API de OpenAI puede consumir sin cambios, útil para prototipos y herramientas internas que ya usan ese contrato.
- Despliegue en hardware heterogéneo: al leer el mismo archivo en NVIDIA, AMD, Intel y Apple Silicon, encaja en flotas mixtas donde no se quiere mantener una build distinta por cada tipo de GPU.
- Prototipado rápido en Apple Silicon: el modelo de 230M decodifica a 138 tok/s en un M4 y el de 2,6B a 42 tok/s con `CMF_GPU=0`, suficiente para asistentes de autocompletado o resumen en local sobre portátiles.
- Procesamiento por lotes de bajo coste en GPU de gama alta: con 141 tok/s en una A100 80GB para el 2,6B y 124 tok/s para el 8B-A1B, es adecuado para tareas de clasificación, extracción o reescritura a gran volumen donde el coste por token importa más que la calidad puntera.
- Evaluación comparativa de cuantizaciones: al ser una conversión directa desde bf16 con `q4tp`, sirve para medir la degradación introducida por la cuantización de 4 bits frente a los checkpoints originales de LiquidAI en tareas concretas.
- Entornos con requisitos estrictos de empaquetado: un solo archivo de 132 MB (230M) o 1,43 GB (2,6B) con checksum `.sha256` al lado simplifica la distribución y verificación de artefactos en pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos del repositorio son de velocidad de decodificación en régimen estable, un solo stream, con `cortiq bench --core` y versión 0.5.99 o superior:

| Modelo | A100 80GB (Vulkan) | Apple M4 |
|---|---|---|
| 230M | 390 tok/s | 138 tok/s |
| 2,6B | 141 tok/s | 42 tok/s (`CMF_GPU=0`) |
| 8B-A1B | 124 tok/s | no disponible |

Mediciones adicionales en RTX A5000 (24 GB) para el modelo de 2,6B en `q4tp`, con `cortiq bench --tokens 64`:

| Backend | Tokens por segundo |
|---|---|
| CUDA (`CMF_GPU=cuda`, cortiq 0.8.90) | 245,8–246,9 tok/s |
| Vulkan | 128,7–204,8 tok/s |

En ambos casos la salida greedy es idéntica. El backend CUDA requiere compilar con `cargo install cortiq-cli --features cuda`, además del driver de NVIDIA y las librerías de CUDA 12.x. Nota importante: versiones de `cortiq` anteriores a 0.5.98/0.5.99 decodifican esta familia un orden de magnitud más lento, porque el grafo de token completo no reconocía todavía el mezclador de convolución corta ni el MoE con enrutamiento sigmoide.

## Comparativa con modelos similares

La comparación natural es contra los checkpoints originales de LiquidAI en bf16, de los que esta distribución deriva, y contra otras rutas de cuantización del mismo modelo base. No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento con alternativas.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-cmf (esta ficha) | 0,23B / 2,7B / 8,3B (1B activos) | no disponible | CMF q4tp | other | Hugging Face, 3268 descargas |
| LiquidAI/LFM2.5-2.6B (original) | 2,7B | no disponible | bf16 (safetensors) | other | Hugging Face, oficial |
| LiquidAI/LFM2.5-230M (original) | 0,23B | no disponible | bf16 (safetensors) | other | Hugging Face, oficial |
| LiquidAI/LFM2.5-8B-A1B (original) | 8,3B (1B activos) | no disponible | bf16 (safetensors) | other | Hugging Face, oficial |

La diferencia práctica frente a los originales no es de calidad sino de empaquetado y motor de inferencia: los bf16 requieren un stack de ML convencional (PyTorch, transformers, vLLM o similar), mientras que los CMF requieren el binario `cortiq`. No se dispone de información sobre otras distribuciones cuantizadas (GGUF, AWQ, GPTQ) de esta familia para comparar.

## Limitaciones y advertencias

- Solo inglés: el campo `language` del repositorio declara únicamente `en`, por lo que el uso en castellano u otros idiomas no está soportado ni evaluado.
- Licencia `other`: los términos exactos provienen del modelo base de LiquidAI y deben verificarse en el repositorio original antes de cualquier uso comercial. No se documenta aquí una autorización explícita.
- No hay datos publicados de calidad: sin benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación, no es posible estimar la fiabilidad del modelo en tareas de razonamiento o código a partir de la información disponible.
- Cuantización de 4 bits: `q4tp` introduce degradación respecto a los checkpoints bf16 originales. No se documenta en el repositorio ninguna evaluación de esa pérdida.
- Dependencia de una versión concreta del motor: con `cortiq` anterior a 0.5.98/0.5.99 la decodificación de esta familia es un orden de magnitud más lenta. Fijar la versión del binario es obligatorio en producción.
- Backend CUDA como feature de compilación: no viene activado por defecto; requiere `--features cuda` y CUDA 12.x. Sin ello, en tarjetas NVIDIA se usa Vulkan, con rendimiento notablemente inferior en la RTX A5000 medida (128,7–204,8 frente a 245,8–246,9 tok/s).
- En Apple Silicon el motor elige dinámicamente entre GPU y CPU al arrancar; para el modelo de 2,6B gana la ruta de CPU en el M4 medido, lo que puede sorprender si se espera aceleración por GPU.
- El repositorio tiene 1 like y procede de un autor no oficial (infosave), no de LiquidAI. Conviene validar los checksums `.sha256` que acompañan a cada `.cmf` antes de desplegar.
- No se documentan sesgos conocidos, limitaciones de contexto ni restricciones específicas de uso más allá de la licencia; esa información correspondería a la model card de LiquidAI, no incluida en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/infosave/LFM2.5-cmf
- Modelo base LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Modelo base LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo base LFM2.5-8B-A1B: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Organización LiquidAI en Hugging Face: https://huggingface.co/LiquidAI
- Repositorio del contenedor CMF: https://github.com/infosave2007/cmf
