# infosave/MiniCPM-OCR-1.0-cmf

## Resumen

MiniCPM-OCR-1.0-cmf es la distribución cuantizada en formato CMF del modelo MiniCPM-OCR-1.0 de OpenBMB, un modelo de reconocimiento óptico de caracteres (OCR) de 1.300 millones de parámetros orientado a la extracción de texto, tablas, fórmulas, gráficos, sellos y campos estructurados a partir de imágenes de documentos. La arquitectura combina un codificador visual SigLIP con un modelo de lenguaje Qwen3.5, y fue entrenada sobre MiniCPM-V 4.6. Esta versión la publica el usuario infosave y está empaquetada como ficheros CMF individuales para `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de aprendizaje automático.

El interés de esta ficha reside en la distribución, no en el modelo base: los ficheros CMF permiten ejecutar el modelo en GPUs de consumo y en Apple Silicon mediante Vulkan, DX12 o Metal, con un consumo de VRAM de 4 GB, sin necesidad de instalar el ecosistema de Transformers. El paquete incluye dos cuantizaciones: `q8_2f` (modelo de lenguaje en 8 bits y codificador visual en 16 bits, 1,67 GB) y `q4tp` (modelo de lenguaje en 4 bits y codificador visual en 16 bits, 1,43 GB).

La relevancia actual del paquete es doble: por un lado, ofrece una alternativa de despliegue ligera para pipelines de digitalización documental; por otro, demuestra la viabilidad de motores de inferencia nativos (sin Python) para tareas multimodales especializadas. El alcance se limita a imágenes: la ruta de vídeo del modelo original, el modo de submuestreo `16x` y el borrador DSpark no forman parte de estos ficheros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP + modelo de lenguaje Qwen3.5 (transformer multimodal) |
| Parámetros totales | 1.300 millones (1.3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `q8_2f`: LM en 8 bits, codificador visual en 16 bits; `q4tp`: LM en 4 bits, codificador visual en 16 bits |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (fichero único para el motor `cortiq`) |
| Modelo base | openbmb/MiniCPM-OCR-1.0 |
| Tamaño de los ficheros | 1,67 GB (`q8_2f`), 1,43 GB (`q4tp`) |
| Tamaño del repositorio | 3,1 GB |
| Motor de inferencia | `cortiq` 0.8.54 o superior (Rust, sin Python) |
| Plataformas | Vulkan, DX12 (NVIDIA/AMD/Intel), Metal (Apple Silicon), CPU |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal clásica de dos torres: un codificador visual SigLIP que procesa la imagen y proyecta las representaciones visuales en el espacio del modelo de lenguaje, y un modelo de lenguaje Qwen3.5 de 1.300 millones de parámetros que genera la salida textual condicionada por las representaciones visuales. El modelo fue entrenado sobre MiniCPM-V 4.6, según indica la model card del autor de la distribución.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del paquete CMF tampoco describe innovaciones de decodificación más allá de la cuantización: el proceso de preprocesamiento se declara exacto y las filas que el codificador entrega al modelo de lenguaje presentan un coseno de al menos 0,9999998 respecto al original en float32. La cuantización `q8_2f` reproduce de forma idéntica los 300 tokens generados con decodificación greedy frente al original en una página impresa, mientras que `q4tp` produce el mismo texto pero se queda 48 caracteres por debajo de los 300 tokens en esa misma prueba.

## Capacidades

- Reconocimiento de texto: extracción de texto plano de imágenes de documentos, párrafos, títulos y páginas completas mediante el prompt `Text Recognition:`.
- Reconocimiento de tablas: conversión de tablas en imagen a tablas estructuradas mediante `Table Recognition:`.
- Reconocimiento de fórmulas: transcripción de expresiones matemáticas a LaTeX mediante `Formula Recognition:`.
- Reconocimiento de sellos: extracción del texto contenido en sellos y estampillas mediante `Seal Recognition:`.
- Conversión de gráficos a tabla: transformación de gráficos en tablas de datos mediante `Chart to Table:`.
- Extracción de campos estructurados: generación de JSON con claves definidas por el usuario a partir de los campos presentes en la imagen, con valor `"###"` para los campos ausentes.
- Procesamiento de imágenes: acepta rutas locales, data URLs y URLs HTTP(S) como entrada.
- Capacidades multilingües: inglés, ruso y chino.
- No incluye tool calling ni razonamiento multi-paso: es un modelo especializado en una única tarea de reconocimiento por invocación.
- No incluye detección de layout ni orden de lectura: esas funciones pertenecen al SDK original (PP-DocLayoutV3) y quedan fuera de estos ficheros.

## Casos de uso

- Digitalización masiva de documentos escaneados: el modelo procesa páginas A4 completas (vista general más nueve recortes, 2.470 tokens de imagen) y devuelve el texto con un tiempo hasta el primer token de 2,0 s en una RTX PRO 4500 Blackwell, lo que permite procesar lotes de facturas o expedientes en servidores con 4 GB de VRAM.
- Extracción de datos de facturas y albaranes: mediante el prompt de extracción de campos con claves JSON definidas por el usuario, se pueden obtener número de factura, fecha, importe y proveedor directamente como objeto JSON listo para insertar en una base de datos.
- Conversión de tablas financieras a CSV o JSON: el prompt `Table Recognition:` transforma tablas impresas en estructuras tabulares reutilizables, útil en la migración de informes contables en papel a sistemas digitales.
- Transcripción de fórmulas científicas: el prompt `Formula Recognition:` devuelve LaTeX, lo que permite incorporar ecuaciones de artículos escaneados a editores científicos o bases de conocimiento matemáticas.
- Procesamiento de documentos oficiales con sellos: el prompt `Seal Recognition:` extrae el texto de sellos y estampillas, relevante en la verificación de documentos notariales o administrativos.
- Digitalización de gráficos en publicaciones: el prompt `Chart to Table:` convierte gráficos de barras o líneas en tablas de datos numéricos, útil para reutilizar series históricas publicadas solo en imagen.
- Despliegue en estaciones de trabajo sin GPU dedicada: con `CMF_GPU=0`, el modelo decodifica a 61 tok/s en una cuota de 10 núcleos Xeon, lo que permite ejecutar el OCR en CPU en entornos sin acelerador.
- Integración en aplicaciones de escritorio o móviles: el motor `cortiq` en Rust y los ficheros CMF de 1,43-1,67 GB permiten incorporar OCR local en aplicaciones sin dependencias de Python ni servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del paquete CMF únicamente reporta métricas de rendimiento de inferencia y de fidelidad de la cuantización:

| Métrica | `q8_2f` | `q4tp` |
|---|---|---|
| Fidelidad vs. original float32 (300 tokens greedy, página impresa) | Idéntica | Mismo texto; 48 caracteres por debajo de 300 tokens |
| Decodificación en RTX PRO 4500 Blackwell (Vulkan) | 254 tok/s | 267 tok/s |
| Tiempo hasta el primer token en RTX PRO 4500 Blackwell | 2,0 s | 1,9 s |
| Decodificación en M4, GPU de 10 núcleos (Metal) | 73 tok/s | 102 tok/s |
| Tiempo hasta el primer token en M4 | 8,1 s | 7,7 s |
| Tiempo del codificador por vista (RTX PRO 4500) | 0,13 s | 0,13 s |
| Tiempo del codificador por vista (M4) | 0,5 s | 0,5 s |
| Decodificación solo CPU (Xeon de 10 núcleos, `CMF_GPU=0`) | 61 tok/s | 61 tok/s |

La prueba se realizó sobre una página A4 a 144 dpi con una vista general y nueve recortes, lo que suma 2.470 tokens de imagen. En la RTX PRO 4500, la primera petición añade 4 s adicionales para la carga de pesos en la GPU.

## Requisitos de hardware

- VRAM estimada: 4 GB son suficientes para cualquiera de los dos ficheros, tanto en GPUs NVIDIA, AMD e Intel (Vulkan, DX12) como en Apple Silicon (Metal), donde una página consume unos 4 GB de memoria.
- GPUs recomendadas: RTX PRO 4500 Blackwell (referencia medida, 254-267 tok/s); cualquier GPU con soporte Vulkan o DX12 con al menos 4 GB de VRAM; Apple Silicon con GPU de 10 núcleos (M4, 73-102 tok/s).
- GPU de consumo: sí cabe en GPUs de consumo con 4 GB o más de VRAM, aunque la model card no enumera modelos concretos como RTX 4090 o RTX 3060.
- Despliegue: motor `cortiq` (versión 0.8.54 o superior) mediante `cortiq run` para CLI o `cortiq serve` para servidor compatible con la API `/v1/chat/completions`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Solo CPU: variable de entorno `CMF_GPU=0`; decodificación de 61 tok/s en una cuota de 10 núcleos Xeon.
- Latencia: 2,0 s hasta el primer token en RTX PRO 4500 Blackwell y 8,1 s en M4 para una página A4 completa; el codificador tarda 0,13 s por vista en la RTX PRO 4500 y 0,5 s en la M4.
- Binarios precompilados para Linux, macOS y Windows disponibles en la página de releases del proyecto CMF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-cmf (`q8_2f` / `q4tp`) | 1,3B | No disponible | en, ru, zh | Apache-2.0 | CMF / `cortiq` (Rust) | Cuantizado; 1,67 GB y 1,43 GB; 4 GB de VRAM |
| openbmb/MiniCPM-OCR-1.0 (original) | 1,3B | No disponible | en, ru, zh | Apache-2.0 | Transformers 5.21, float32 | Modelo base sin cuantizar; incluye ruta de vídeo y modo `16x` |
| MiniCPM-V 4.6 | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo sobre el que se entrenó MiniCPM-OCR-1.0 según la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia, formato y requisitos de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado sobre datos de documentos, puede heredar sesgos de los corpus utilizados en su entrenamiento original.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de extracción de campos, el modelo puede rellenar valores ausentes con `"###"`, pero no se documenta su comportamiento ante texto ilegible o imágenes degradadas.
- Limitaciones de contexto: la longitud de contexto no está especificada; el rendimiento medido se basa en páginas A4 con 2.470 tokens de imagen, por lo que documentos mucho más densos podrían superar la ventana disponible.
- Limitaciones de idioma: solo se declaran inglés, ruso y chino; no hay soporte documentado para español ni para otras lenguas.
- Alcance reducido: estos ficheros solo cubren la etapa de reconocimiento; no incluyen detección de layout ni orden de lectura (funciones del SDK original con PP-DocLayoutV3), ni la ruta de vídeo, el modo de submuestreo `16x` o el borrador DSpark.
- Fidelidad de la cuantización: `q4tp` produce el mismo texto que el original en la página de prueba, pero se queda 48 caracteres por debajo de los 300 tokens generados; en documentos más largos o densos la divergencia podría ser mayor.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base openbmb/MiniCPM-OCR-1.0 y de los datos de entrenamiento originales antes de un despliegue en producción.
- Madurez del ecosistema: el motor `cortiq` y el formato CMF son proyectos con pocas descargas (0 descargas y 1 like en el momento de la consulta); conviene evaluar su estabilidad y soporte a largo plazo antes de adoptarlos en producción.
- Dependencia de versión: se requiere `cortiq` 0.8.54 o superior; versiones anteriores pueden no cargar los ficheros correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/MiniCPM-OCR-1.0-cmf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de `cortiq`: https://github.com/infosave2007/cmf/releases
