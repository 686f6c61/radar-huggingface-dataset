# kinyeah/mochiocr-caoshu-v8-gguf

## Resumen

`kinyeah/mochiocr-caoshu-v8-gguf` es una adaptación del modelo visión-lenguaje Qwen3-VL-8B-Instruct ajustada con QLoRA (r16) sobre el corpus de caligrafía cursiva «mochi» y publicada como GGUF fusionado para su uso con llama.cpp. Su única tarea es el reconocimiento óptico de caracteres sobre columnas verticales de escritura cursiva (草書) y semicursiva (行草) de libros y caligrafías chinas clásicas, devolviendo texto plano en caracteres tradicionales y sin puntuación. Lo firma el usuario kinyeah y se publicó el 26 de octubre de 2026; en el momento del análisis acumula 0 descargas y 0 likes.

El modelo no funciona de forma autónoma: el autor lo acompaña de un pipeline externo denominado MochiOCR que detecta y recorta cada columna vertical de la página y llama al modelo columna a columna. Por eso la entrada esperada es un único recorte de columna (lado corto ≥ 300 px, lado largo ≤ 3200 px) y no una página completa. Los pesos se distribuyen en tres ficheros GGUF: el modelo fusionado en Q4_K_M, el proyector visual en F16 (llama.cpp siempre lo carga aparte) y el adaptador LoRA sin fusionar en F16.

La relevancia del modelo es de nicho: cubre un dominio muy específico (caligrafía cursiva china vertical) que los OCR genéricos no resuelven bien, pero lo hace con un error de carácter del 34,7 % en un conjunto limpio de evaluación, insuficiente para producción sin corrección humana. Destaca como herramienta de preetiquetado y apoyo a la investigación filológica más que como solución cerrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (VLM) denso, base Qwen3-VL-8B-Instruct, con adaptador QLoRA r16 fusionado en los pesos publicados |
| Parámetros totales | ~8 000 M (modelo base Qwen3-VL-8B); el dato de safetensors del repo, 43 646 976, corresponde al adaptador LoRA en F16 (84 MB), no al modelo completo |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada por el autor; el ejemplo de despliegue de la model card usa `--ctx-size 8192` |
| Tipos de cuantización | Q4_K_M (modelo fusionado); F16 (proyector visual y adaptador LoRA) |
| Idiomas soportados | chino en caracteres tradicionales para la tarea de reconocimiento; no se declaran otros idiomas |
| Licencia | no declarada en los metadatos de HuggingFace; la model card indica que hereda la licencia del modelo base Qwen3-VL («rango compatible con Apache-2.0») y recomienda corrección humana |
| Formato de pesos | GGUF para llama.cpp: `caoshu-v8-merged-Q4_K_M.gguf`, `caoshu-v8-merged-mmproj-F16.gguf`, `caoshu-v8-lora-f16.gguf` |
| Entrada | un recorte de columna vertical única (escritura de arriba abajo), lado corto ≥ 300 px, lado largo ≤ 3200 px |
| Salida | cadena continua de caracteres chinos tradicionales, sin puntuación y sin segmentación |
| Tamaño del repositorio | 1,2 GB según los metadatos, aunque los tres ficheros declarados suman unos 5,9 GB (4,7 GB + 1,1 GB + 84 MB) |

## Arquitectura y entrenamiento

La base es Qwen3-VL-8B-Instruct, un modelo visión-lenguaje compuesto por un codificador visual y un proyector que inyecta las representaciones de imagen en el transformer lingüístico. El ajuste se realizó con QLoRA sobre la versión `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit` (base cuantizada a 4 bits), con rango 16, tasa de aprendizaje 1e-5 y 2 épocas. Los pesos publicados ya tienen el adaptador fusionado, por lo que en inferencia solo hace falta cargar el GGUF principal más el `mmproj`; el adaptador sin fusionar se ofrece para uso con `--lora` en tiempo de ejecución o para continuar el ajuste. No se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal) más allá del stack estándar de llama.cpp.

El corpus de entrenamiento es pequeño y muy focalizado: 971 recortes de columna de libros y caligrafías con transcripción oficial (procedentes del proyecto 墨池 / mochi, con material del 故宮) más 244 columnas verificadas mediante «gate» a partir de escaneos de la colección del museo de caligrafía Hos (hcsartmuseum.com), lo que suma 1 215 columnas. No se menciona RLHF ni DPO adicionales sobre el modelo base; el comportamiento se refuerza con un prompt fijo que se corresponde con el usado en entrenamiento y que prohíbe explícitamente recitar poemas o transcripciones famosas. El pipeline completo implica que cada columna de una página es una llamada de inferencia independiente, lo que multiplica el coste por página.

## Capacidades

- Transcripción de una columna vertical de caligrafía china cursiva o semicursiva a una cadena de texto tradicional sin puntuación.
- Exactitud declarada del 76-100 % por carácter en columnas de escritura 行草 ordenada y caracteres frecuentes; en un caso de inscripción (款識) de una sola columna el autor reporta un 100 % sobre la muestra real.
- Lectura de recortes con lado corto desde 300 px y lado largo de hasta 3200 px, útil para escaneos de libros antiguos.
- Cumplimiento de una instrucción estricta de fidelidad visual («solo transcribe lo que ves, detente si no está claro»), pensada para limitar la memorización de textos célebres.
- No incluye detección de columnas, segmentación de layout ni ordenación de lectura: eso lo aporta el pipeline externo MochiOCR.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, código, matemáticas ni audio.
- No se documenta modo de razonamiento (thinking) ni capacidades multilingües más allá del chino tradicional.

## Casos de uso

- Digitalización de libros chinos antiguos con escritura vertical cursiva: el pipeline detecta y recorta cada columna y el modelo la transcribe; el texto resultante se recompone en orden de lectura. Adecuado como primera pasada porque el coste por página es bajo en una GPU de consumo, pero el CER del 34,7 % obliga a revisión humana.
- Catalogación de fondos museísticos de caligrafía: generar transcripciones borrador de inscripciones y colofones para volcar en el sistema de documentación. El entrenamiento con transcripciones oficiales del 故宮 y de hcsartmuseum hace que el dominio coincida con el de muchas piezas catalogadas.
- Indexación y búsqueda full-text sobre archivos escaneados: alimentar un índice con las transcripciones para localizar pasajes; conviene configurar búsqueda tolerante a errores (distancia de edición o n-gramas) por el nivel de CER.
- Investigación filológica y alineación imagen-texto: al devolver texto sin puntuación, el alineamiento por carácter con la imagen es directo, lo que facilita anotación asistida y estudios de variantes gráficas.
- Preetiquetado para entrenar otros modelos OCR: usar el modelo como anotador automático y corregir a mano; el adaptador `caoshu-v8-lora-f16.gguf` sin fusionar permite continuar el ajuste con QLoRA sobre nuevos lotes de columnas.
- Despliegue local en instituciones con requisitos de confidencialidad: al ser un GGUF de ~4,7 GB ejecutable con llama.cpp, puede correr en una estación de trabajo con GPU de consumo sin enviar imágenes fuera de la red.
- Prototipado de aplicaciones de humanidades digitales: gracias a la API HTTP de `llama-server`, se puede integrar en un servicio que reciba recortes de columna y devuelva texto para interfaces de transcripción asistida.

## Benchmarks y rendimiento

Datos publicados por el autor (octubre de 2026, inferencia con llama.cpp en CPU/GPU). El CER se calcula por columna mediante alineamiento basado en LCS y promedia todas las columnas, incluidas las difíciles; menor es mejor.

| Versión | CER en `gold_test40` (holdout sin contaminación) | CER en demo de 3 páginas reales |
|---|---|---|
| v8 (esta versión) | 34,7 % | 31,1 % |
| v9 (+244 columnas hcs) | 35,0 % | 34,1 % |
| v10 (r32, con upsampling) | 34,1 % | 32,6 % |
| v11 (descontaminado) | 34,7 % | 34,1 % |
| Prueba con 32B (descartada) | 44,4 % | no disponible |

El autor añade que en columnas de 行草 ordenada y caracteres comunes la exactitud por carácter alcanza el 76-100 %, y que el CER global está dominado por las columnas de cursiva extrema. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con OCR genéricos sobre este corpus.

## Requisitos de hardware

- Pesos en disco o RAM: unos 5,8 GB (4,7 GB del Q4_K_M más 1,1 GB del `mmproj` en F16). El adaptador LoRA opcional añade 84 MB.
- VRAM estimada para inferencia: aproximadamente 7-8 GB con `--ctx-size 8192` (estimación a partir del tamaño de los pesos y de la caché KV; el autor no publica cifras).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4080/4090 24 GB. Cabe holgadamente en cualquier GPU con 8 GB o más.
- GPU profesionales: no requiere A100 ni H100; el modelo es de 8B y se ejecuta en hardware de gama media.
- Despliegue documentado: `llama-server -m caoshu-v8-merged-Q4_K_M.gguf --mmproj caoshu-v8-merged-mmproj-F16.gguf --host 127.0.0.1 --port 8800 --ctx-size 8192 --jinja`, más `--lora caoshu-v8-lora-f16.gguf` si se usa el adaptador sin fusionar.
- Otras opciones (Ollama, vLLM, TGI): no documentadas por el autor. El formato GGUF es compatible con cargadores basados en llama.cpp, pero no hay instrucciones ni pruebas publicadas para vLLM o TGI con este modelo multimodal concreto.
- Latencia y throughput: no disponibles. Como referencia de diseño, cada columna exige una inferencia multimodal completa, de modo que una página de 20 columnas implica 20 llamadas al servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en `gold_test40` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mochiocr-caoshu-v8 (este) | ~8B (LoRA de 43,6 M) | 8192 en el ejemplo de despliegue | 34,7 % | hereda Qwen3-VL | GGUF, 0 descargas, 0 likes |
| caoshu-v9 / v10 / v11 | ~8B (misma base) | no disponible | 35,0 % / 34,1 % / 34,7 % | hereda Qwen3-VL | no publicados en este repositorio |
| Prueba con base 32B (descartada) | ~32B | no disponible | 44,4 % | no disponible | descartada por el autor |
| Qwen3-VL-8B-Instruct base | ~8B | no disponible | no disponible (no evaluado sobre este corpus) | Qwen3-VL, compatible con Apache-2.0 según la model card | público en HuggingFace |
| OCR genéricos para chino (p. ej. GOT-OCR2.0, dots.ocr) | no disponible | no disponible | no disponible (sin evaluación publicada sobre `gold_test40`) | no disponible | no disponible |

No existe una comparación publicada contra OCR genéricos sobre este corpus, por lo que la única referencia cuantitativa disponible es la comparación interna entre versiones del propio proyecto. Resulta llamativo que la prueba con un modelo de 32B obtuviera peor CER (44,4 %) que el de 8B, lo que sugiere que el cuello de botella está en los datos de ajuste y no en la capacidad del modelo.

## Limitaciones y advertencias

- Error de carácter elevado: CER del 34,7 % en el holdout limpio y del 31,1 % en la demo de tres páginas. Es una cifra agregada por columna, no un porcentaje de caracteres correctos, y en la práctica implica corrección humana sistemática.
- Cursiva extrema (狂草), calcos sobre piedra (拓本) y anotaciones interlineadas a doble columna siguen siendo inestables según el autor.
- Las páginas impresas de libros antiguos quedan fuera del dominio de entrenamiento: el modelo puede usarse, pero no está especializado en ellas.
- La salida es texto sin puntuación y solo en caracteres tradicionales; no hay detección de columnas, orden de lectura ni normalización a simplificado.
- Riesgo de alucinación por memorización: al entrenarse con caligrafías célebres y textos canónicos, el modelo puede «recitar» poemas o pasajes completos en lugar de transcribir lo visible. El prompt del autor lo prohíbe explícitamente, lo que indica que el problema se observó durante el desarrollo.
- Corpus de entrenamiento muy reducido (1 215 columnas), con posible sobreajuste al estilo y al léxico de las colecciones empleadas (故宮 y hcsartmuseum), y cobertura limitada de variantes gráficas y vocabulario infrecuente.
- Licencia ambigua: los metadatos de HuggingFace no declaran licencia y la model card remite a los términos de Qwen3-VL con una fórmula poco precisa («rango compatible con Apache-2.0»). Antes de un uso comercial hay que verificar la licencia del modelo base.
- Adopción nula: 0 descargas y 0 likes en el momento del análisis, sin pruebas independientes ni informes de terceros.
- Inconsistencias en la ficha: el tamaño del repositorio (1,2 GB) no cuadra con la suma de los ficheros declarados (~5,9 GB) y el recuento de parámetros de safetensors (43,6 M) corresponde al adaptador LoRA, no al modelo completo.
- El enlace al pipeline MochiOCR aparece truncado en la model card, por lo que no es posible reproducir el flujo completo de detección de columnas con la información publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinyeah/mochiocr-caoshu-v8-gguf
- Pipeline MochiOCR: enlace truncado en la model card (https://github.com/), no disponible
- Fuente de datos de caligrafía: https://hcsartmuseum.com (museo de caligrafía Hos)
- Resultados de búsqueda web: https://huggingface.co/calcuis/mochi-gguf, https://www.modelscope.cn/models/calcuis/mochi-gguf y https://model.aibase.com/models/details/1915694034221424641 — corresponden a un proyecto distinto (Mochi, generación de vídeo texto-a-vídeo) y no guardan relación con este modelo OCR
