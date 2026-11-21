# infosave/MiniCPM-OCR-1.0-cmf

## Resumen

MiniCPM-OCR-1.0-cmf es una distribución cuantizada del modelo openbmb/MiniCPM-OCR-1.0, un modelo de visión-lenguaje de 1.300 millones de parámetros especializado en reconocimiento óptico de caracteres y parseo de documentos. El modelo original lo desarrolla OpenBMB y combina un codificador visual SigLIP con un modelo de lenguaje Qwen3.5, entrenado sobre MiniCPM-V 4.6. Esta versión la publica el usuario infosave empaquetada en archivos CMF (formato propio) para cortiq, un motor de inferencia escrito en Rust que no requiere Python ni frameworks de aprendizaje automático.

La relevancia de este paquete es doble. Por un lado, ofrece una alternativa de despliegue ligera y sin dependencias de Python para una tarea concreta y muy demandada en producción como es la extracción de texto, tablas, fórmulas, sellos y diagramas a partir de imágenes de documentos. Por otro, demuestra que es posible ejecutar un modelo multimodal de OCR en hardware de consumo (4 GB de VRAM en GPU Vulkan/DX12, unos 4 GB de memoria en Apple Silicon) con velocidades de decodificación que superan los 250 tokens por segundo en una RTX PRO 4500.

El repositorio ocupa 3,1 GB e incluye dos variantes de cuantización: q8_2f (modelo de lenguaje en 8 bits, codificador visual en 16 bits, 1,67 GB) y q4tp (modelo de lenguaje en 4 bits, codificador visual en 16 bits, 1,43 GB). La licencia es Apache-2.0, heredada del modelo original. Los idiomas declarados son inglés, ruso y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: codificador SigLIP + modelo de lenguaje Qwen3.5 |
| Parámetros totales | 1.300 millones (1.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_2f (LM 8 bits, encoder 16 bits) y q4tp (LM 4 bits, encoder 16 bits) |
| Idiomas soportados | inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (archivo único para el motor cortiq) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres: un codificador visual SigLIP que procesa la imagen y un modelo de lenguaje Qwen3.5 que genera la salida de texto condicionada por los tokens visuales. El modelo original se entrenó a partir de MiniCPM-V 4.6, según indica la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta distribución no está en la arquitectura, sino en el empaquetado y el motor de inferencia. Los archivos CMF son autocontenidos y se ejecutan con cortiq, un motor en Rust que soporta backend Vulkan, DX12, Metal y CUDA, además de CPU pura. Según el autor, el preprocesamiento es exacto y las filas que el codificador entrega al modelo de lenguaje presentan un coseno de al menos 0,9999998 respecto al original. Con la variante q8_2f, los 300 tokens generados en modo greedy sobre una página impresa son idénticos a los del modelo original en Transformers 5.21 en float32. La variante q4tp produce el mismo texto en esa página, aunque sus tokens quedan 48 caracteres por debajo de los 300.

## Capacidades

- Reconocimiento de texto: extracción de texto plano de párrafos, títulos y páginas completas mediante el prompt `Text Recognition:`.
- Reconocimiento de tablas: reconstrucción de tablas a partir de imágenes con el prompt `Table Recognition:`.
- Reconocimiento de fórmulas: conversión de fórmulas matemáticas a LaTeX con `Formula Recognition:`.
- Reconocimiento de sellos: lectura de sellos y estampados con `Seal Recognition:`.
- Conversión de gráficos a tabla: transformación de diagramas y charts en tablas estructuradas con `Chart to Table:`.
- Extracción de campos estructurados: generación de JSON con claves definidas por el usuario; los campos ausentes se rellenan con `###`.
- Procesamiento multimodal de imágenes: entrada de imagen por ruta local, data URL o URL HTTP(S).
- Multilingüe: inglés, ruso y chino.
- No incluye tool calling, function calling ni razonamiento multi-paso orientado a agentes; su alcance es el reconocimiento y la extracción.
- No cubre la ruta de vídeo del modelo original, ni el modo de submuestreo `16x`, ni el borrador DSpark.

## Casos de uso

- Digitalización de archivos administrativos: procesar páginas escaneadas en A4 a 144 dpi con `Text Recognition:` para obtener texto plano; el modelo gestiona una página completa como una vista más nueve recortes (2.470 tokens de imagen) en unos 2 segundos hasta el primer token en una RTX PRO 4500.
- Extracción de tablas de informes financieros: usar `Table Recognition:` para convertir tablas impresas en texto estructurado que luego se parsea a CSV o bases de datos.
- Conversión de documentación técnica con fórmulas: aplicar `Formula Recognition:` para obtener LaTeX de papers y manuales, integrable en pipelines de publicación científica.
- Procesamiento de facturas y formularios: definir un prompt de extracción de campos con claves JSON concretas para obtener datos estructurados directamente consumibles por un sistema de contabilidad.
- Verificación de documentos sellados: emplear `Seal Recognition:` en flujos de validación de contratos o certificados que requieren comprobar la presencia y el contenido de sellos.
- Digitalización de gráficos en prensa o informes: usar `Chart to Table:` para transformar gráficos de barras o líneas en tablas de datos numéricos.
- Despliegue en entornos sin Python: al ejecutarse con cortiq (Rust), encaja en infraestructuras donde no se quiere mantener un stack de Python ni frameworks de ML, con servidor compatible con la API de chat completions de OpenAI.
- Procesamiento en el borde o en portátiles: con 4 GB de VRAM o unos 4 GB de memoria unificada en Apple Silicon, es viable en estaciones de trabajo modestas y en equipos Mac con GPU de 10 núcleos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí proporciona mediciones de rendimiento de inferencia y de fidelidad frente al original:

| Medición | q8_2f | q4tp |
|---|---|---|
| Fidelidad vs. original (300 tokens greedy, página impresa) | Idénticos | Mismo texto; 48 caracteres menos en 300 tokens |
| Decodificación en RTX PRO 4500 Blackwell (Vulkan) | 254 tok/s | 267 tok/s |
| Imagen y prompt hasta el primer token en RTX PRO 4500 | 2,0 s | 1,9 s |
| Decodificación en M4, GPU de 10 núcleos (Metal) | 73 tok/s | 102 tok/s |
| Imagen y prompt hasta el primer token en M4 | 8,1 s | 7,7 s |
| Codificador visual por vista (RTX PRO 4500 / M4) | 0,13 s / 0,5 s | 0,13 s / 0,5 s |
| Decodificación del LM en CPU (Xeon de 10 núcleos, `CMF_GPU=0`) | 61 tok/s | no disponible |
| Decodificación del LM en RTX A5000 con CUDA (cortiq 0.8.89) | no disponible | 276,9–321,4 tok/s |
| Decodificación del LM en RTX A5000 con Vulkan | no disponible | 125,1–153,6 tok/s |

La primera petición en la RTX PRO 4500 añade unos 4 segundos por la carga de pesos en la tarjeta.

## Requisitos de hardware

- VRAM estimada: 4 GB de VRAM contienen cualquiera de los dos archivos en GPU Vulkan/DX12; en Apple Silicon una página consume unos 4 GB de memoria.
- GPU recomendadas: RTX PRO 4500 Blackwell (Vulkan), RTX A5000 de 24 GB (CUDA o Vulkan), Apple Silicon M4 con GPU de 10 núcleos (Metal).
- GPU de consumo: el modelo cabe en tarjetas con 4 GB o más de VRAM, por lo que es viable en GPUs de gama media y en equipos Mac con memoria unificada.
- CPU: funciona en modo solo CPU con `CMF_GPU=0`; en un Xeon de 10 núcleos el modelo de lenguaje decodifica a 61 tok/s.
- Opciones de despliegue: motor cortiq (CLI `cortiq run` y servidor `cortiq serve` con endpoint `/v1/chat/completions` compatible con OpenAI). Se instala con `cargo install cortiq-cli`; la versión mínima es 0.8.54 y el backend CUDA requiere compilar con `--features cuda` y disponer del driver NVIDIA y las librerías CUDA 12.x. Hay binarios precompilados para Linux, macOS y Windows.
- Latencia y throughput: ver tabla de benchmarks; el codificador visual añade 0,13 s por vista en la RTX PRO 4500 y 0,5 s en el M4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-cmf (esta ficha) | 1,3B | no disponible | en, ru, zh | Apache-2.0 | CMF para cortiq (Rust) |
| openbmb/MiniCPM-OCR-1.0 (original) | 1,3B | no disponible | en, ru, zh | Apache-2.0 | Transformers 5.21, float32 |
| MiniCPM-V 4.6 (base de entrenamiento) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de OCR de otros fabricantes no está disponible en la información proporcionada. Frente al modelo original, esta distribución ofrece un tamaño mucho menor (1,67 GB frente a los pesos en float32), ejecución sin Python y backend GPU nativo en Vulkan, DX12, Metal y CUDA, a cambio de una fidelidad prácticamente idéntica en q8_2f y ligeramente inferior en q4tp.

## Limitaciones y advertencias

- Solo procesa imágenes: no incluye la ruta de vídeo del modelo original, ni el modo de submuestreo `16x`, ni el borrador DSpark.
- No realiza detección de layout ni orden de lectura; esas funciones las aporta el SDK original (PP-DocLayoutV3) y quedan fuera de estos archivos, que cubren únicamente el paso de reconocimiento.
- Idiomas limitados a inglés, ruso y chino; no se declara soporte de español ni de otras lenguas.
- La cuantización q4tp introduce una pérdida medible: en la prueba de 300 tokens sobre una página impresa genera 48 caracteres menos que el original, aunque el texto es el mismo. Para máxima fidelidad se recomienda q8_2f.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación en dominios distintos de los documentos impresos.
- El formato CMF y el motor cortiq son específicos de este ecosistema; no es un archivo GGUF ni safetensors, por lo que no se puede cargar directamente en llama.cpp, Ollama, vLLM o TGI.
- El backend CUDA es una característica de compilación que requiere driver NVIDIA y CUDA 12.x; sin ella, en tarjetas NVIDIA se usa Vulkan, con menor throughput (125–154 tok/s frente a 277–321 tok/s en la RTX A5000).
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y del motor cortiq antes de desplegar en producción.
- El repositorio pertenece a un autor no oficial (infosave) y no está respaldado por OpenBMB; la reproducibilidad de las mediciones depende de la build de cortiq empleada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/MiniCPM-OCR-1.0-cmf
- Modelo base original: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio del motor y formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
