# infosave/Unlimited-OCR-2-cmf

## Resumen

Unlimited-OCR-2-cmf es la distribución cuantizada del modelo Baidu Unlimited-OCR-2, un parser de documentos multimodales diseñado para leer varias páginas en una sola pasada. El paquete lo publica el usuario infosave en formato CMF, un contenedor de pesos propio del motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning. Esto lo convierte en una alternativa de despliegue ligero frente a las pilas habituales basadas en Transformers.

El modelo original combina un DeepEncoder (SAM ViT-B alimentando CLIP-L) con un decodificador transformer de 12 capas con mezcla de expertos (MoE) cuya atención lee como máximo 512 tokens por paso, independientemente de la longitud del documento. Esa restricción de atención es la que da nombre al modelo y permite procesar documentos de muchas páginas sin que el coste de atención crezca de forma cuadrática con el número de páginas.

La relevancia actual del paquete es doble: por un lado, ofrece dos cuantizaciones listas para usar (8 bits y 4 bits en el decodificador, con el encoder siempre en 16 bits) que reducen el peso a 3,78 GB y 2,37 GB respectivamente; por otro, el motor cortiq permite ejecutar el modelo sobre Vulkan, DX12 y Metal, incluyendo GPUs de consumo y Apple Silicon. La licencia es MIT, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepEncoder (SAM ViT-B + CLIP-L) con decodificador transformer MoE de 12 capas y atención limitada a 512 tokens por paso |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el número de expertos ni los parámetros activos) |
| Longitud de contexto | no disponible como cifra de tokens; la atención lee como máximo 512 tokens por paso, sin límite declarado de páginas por pasada |
| Tipos de cuantizacion | q8_2f (decodificador 8 bits, encoder 16 bits) y q4tp (decodificador 4 bits, encoder 16 bits) |
| Idiomas soportados | en, ru, zh |
| Licencia | MIT |
| Formato de pesos | CMF (contenedor propio del motor cortiq); el original está en safetensors float32 para Transformers 4.52 |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema encoder-decoder multimodal. El DeepEncoder procesa la imagen en dos escalas: una imagen única se divide en hasta 16 tiles de 640×640 más una vista global de 1024×1024, mientras que varias imágenes comparten únicamente la vista de 1024×1024. El codificador visual combina SAM ViT-B con CLIP-L. El decodificador es un transformer de 12 capas con mezcla de expertos cuya atención está acotada a 512 tokens por paso, lo que mantiene estable el coste por paso a medida que crece el número de páginas.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del paquete cuantizado se centra en la fidelidad de la cuantización: el archivo q8_2f reproduce de forma idéntica los primeros 300 tokens greedy de una página respecto al original en float32, y el q4tp conserva el 98,5 % de los caracteres. El preprocesado replica el del original (bicúbico de punto fijo de Pillow). En documentos largos, las coordenadas y el orden de bloques vecinos pueden variar en empates cercanos, un comportamiento que también aparece en el original al comparar float32 con bf16.

## Capacidades

- Parsing de documentos multipágina en una sola pasada, con una etiqueta `<PAGE>` por página de entrada.
- Detección y marcado de bloques con tipo (por ejemplo `title`, `text`) y nivel jerárquico (`<LEVEL1>`).
- Extracción de coordenadas de cada bloque en una rejilla normalizada de 0 a 999, lo que facilita la reconstrucción del layout.
- Procesamiento de imágenes en dos modos: una imagen se trocea en hasta 16 tiles de 640×640 más una vista global de 1024×1024; varias imágenes usan solo la vista de 1024×1024.
- Soporte multilingüe declarado para inglés, ruso y chino.
- Salida en texto plano estructurado con marcadores (`<PAGE>`, `<BLOCK>`, `<FORK>`), apta para postprocesado programático.
- Servido mediante API compatible con el endpoint `/v1/chat/completions` del motor cortiq, aceptando varias imágenes por petición.
- No expone tool calling ni function calling, ni modos de razonamiento explícito; su ámbito es exclusivamente la lectura de imágenes.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: se envían las páginas en orden como imágenes y el modelo devuelve un `<PAGE>` por página con bloques y coordenadas, lo que permite reconstruir el documento estructurado sin segmentar previamente cada página.
- Extracción de tablas y títulos para sistemas de gestión documental: los tipos de bloque y las coordenadas en rejilla 0–999 permiten mapear cada elemento a una posición física y alimentar un indexador o una base de datos documental.
- Procesamiento de contratos y expedientes multiidioma: al cubrir inglés, ruso y chino, un mismo pipeline puede tratar lotes heterogéneos sin cambiar de modelo.
- Despliegue en estaciones de trabajo sin Python: gracias al binario de cortiq y a los archivos CMF, el modelo se ejecuta en entornos donde instalar PyTorch o Transformers no es viable, por ejemplo equipos de escritorio Windows con DX12 o Vulkan.
- Servicio interno de OCR como API: `cortiq serve` expone un endpoint compatible con chat completions que acepta varias URLs de imagen, lo que simplifica la integración con aplicaciones existentes que ya hablan ese formato.
- Procesamiento en Apple Silicon para equipos de investigación: con Metal, una página ocupa 4,7 GB con q4tp y 6,2 GB con q8_2f, de modo que un Mac con GPU de 10 núcleos puede ejecutar el parser localmente con latencias de 4,9 s hasta el primer token en página troceada.
- Ingesta de documentos en pipelines de CI o batch en CPU: con `CMF_GPU=0` el decodificador rinde 67 tok/s en una cuota Xeon de 10 núcleos, suficiente para trabajos por lotes donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible. La model card sí incluye mediciones de rendimiento de inferencia y de fidelidad de cuantización:

| Metrica | RTX PRO 4500 Blackwell (Vulkan) | M4, GPU 10 nucleos (Metal) | Xeon 10 nucleos (CPU) |
|---|---:|---:|---:|
| Encoder, tile 640×640 | 0,10 s | 0,35 s | no disponible |
| Encoder, vista 1024×1024 | 0,24 s | 1,15 s | 16 s |
| Ingesta de prompt | ~2600 tok/s | ~700 tok/s | no disponible |
| Decodificacion q8_2f | 323 tok/s | 95 tok/s | 67 tok/s (decodificador) |
| Decodificacion q4tp | 319 tok/s | 112 tok/s | no disponible |
| Decodificacion a 24 paginas | 316 tok/s (q8_2f) | 137 tok/s (q4tp) | no disponible |
| Primer token, pagina troceada | 1,2 s (primer request +4 s) | 4,9 s | no disponible |

| Metrica de fidelidad | q8_2f | q4tp |
|---|---|---|
| Primeros 300 tokens greedy vs. original float32 | idénticos | 98,5 % de caracteres coincidentes |
| Tamano del archivo | 3,78 GB | 2,37 GB |

## Requisitos de hardware

- VRAM en GPU de escritorio: 8 GB bastan para q4tp y 12 GB para q8_2f, con encoder y decodificador ejecutándose en la tarjeta.
- Memoria en Apple Silicon: una página consume 4,7 GB con q4tp y 6,2 GB con q8_2f, con ambos componentes en la GPU vía Metal.
- GPU recomendadas: RTX PRO 4500 Blackwell (referencia medida), cualquier GPU con soporte Vulkan o DX12 (NVIDIA, AMD, Intel) y Apple Silicon con Metal. No se documentan pruebas en A100 o H100.
- GPU de consumo: sí cabe; el límite práctico es la VRAM indicada (8 GB para q4tp, 12 GB para q8_2f), por lo que tarjetas de gama media-alta reciente son suficientes.
- CPU sola: funciona con `CMF_GPU=0`, pero el encoder tarda decenas de segundos por página y el decodificador rinde 67 tok/s en una cuota Xeon de 10 núcleos.
- Opciones de despliegue: motor cortiq (CLI `cortiq run` y servidor `cortiq serve` con endpoint `/v1/chat/completions`); requiere cortiq 0.8.54 o superior, con binarios precompilados para Linux, macOS y Windows. No se ofrece integración con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: ver la tabla de benchmarks; el rendimiento de decodificación se mantiene estable al crecer el número de páginas (316 tok/s a 24 páginas en la RTX PRO 4500).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| Unlimited-OCR-2-cmf (este) | no disponible (MoE, 12 capas) | atención de 512 tokens por paso, sin límite declarado de páginas | en, ru, zh | MIT | CMF sobre cortiq (Rust) | Cuantizado q8_2f / q4tp; ejecución en Vulkan, DX12 y Metal |
| baidu/Unlimited-OCR-2 (original) | no disponible (mismo modelo) | misma arquitectura | en, ru, zh | MIT | safetensors float32 sobre Transformers 4.52 | Referencia de fidelidad; requiere pila Python |
| Alternativas OCR de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo solo procesa imágenes: una petición sin imagen es rechazada. No sirve como modelo de texto general.
- El diseño entrenado `<PAGE><image>` es obligatorio; no se expone la colocación personalizada de etiquetas `<image>`.
- El orden de páginas debe respetarse pasando un `--image` por página; mezclar varias imágenes hace que solo se use la vista global de 1024×1024, con posible pérdida de detalle frente al troceado de una imagen única.
- Hay que dimensionar `--max-tokens` para el documento completo, ya que la generación se detiene cuando se han emitido todas las páginas; un límite corto trunca la salida.
- En documentos largos, las coordenadas y el orden de bloques vecinos pueden desplazarse en empates cercanos; es un comportamiento heredado del modelo original y no un defecto de la cuantización.
- La cuantización q4tp conserva el 98,5 % de los caracteres en la prueba de 300 tokens, por lo que puede introducir errores de transcripción en textos densos; para máxima fidelidad se recomienda q8_2f.
- Cobertura lingüística declarada limitada a inglés, ruso y chino; el rendimiento en otros idiomas no está documentado.
- No se han publicado evaluaciones de sesgos ni tasas de alucinación para este modelo.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y del motor cortiq por separado.
- El paquete tiene 0 descargas y 1 like en el momento de la consulta; es una distribución reciente y poco contrastada por la comunidad.
- Dependencia de una versión mínima del motor (cortiq 0.8.54) y de un formato de pesos propietario (CMF), lo que limita la portabilidad a otras pilas de inferencia.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/infosave/Unlimited-OCR-2-cmf
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio del formato CMF y binarios: https://github.com/infosave2007/cmf
- Releases de cortiq (binarios Linux, macOS, Windows): https://github.com/infosave2007/cmf/releases
