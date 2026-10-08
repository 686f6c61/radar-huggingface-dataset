# localdeel/ko-hand-ocr-vl

## Resumen

ko-hand-ocr-vl es un modelo de visión-lenguaje de pesos abiertos especializado en reconocimiento óptico de caracteres (OCR) sobre escritura manual en coreano (hangul). Lo desarrolla el usuario localdeel y se obtiene mediante ajuste fino de Qwen3.5-0.8B, cuyo modelo base también es Apache-2.0. Cuenta con 873.438.784 parámetros (etiquetado comercialmente como 0.8B) y mantiene la arquitectura del original sin ningún cambio estructural, lo que permite desplegarlo en cualquier entorno que ya soporte Qwen3.5 (Ollama, LM Studio, llama.cpp, vLLM, transformers).

El modelo resuelve un problema muy concreto: convertir una fotografía de texto manuscrito en coreano en texto plano legible, tanto en recortes de una sola línea como en páginas completas. A diferencia de su modelo hermano ko-hand-ocr (41M), que solo procesa líneas ya recortadas, esta variante recibe la imagen completa y la reduce a un máximo de 4.096 tokens de imagen.

Es relevante porque se publica como versión intermedia: se han completado 2.000 de los 16.000 pasos de entrenamiento previstos, y el autor anuncia que reemplazará estos pesos por la versión final en la misma dirección, junto con una tabla comparativa frente a otros seis motores de OCR. La licencia Apache-2.0 y la compatibilidad con endpoints estilo OpenAI lo hacen apto para despliegue en producción desde el primer momento, con las cautelas propias de una versión no final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas Gated DeltaNet (atención lineal) + 6 capas de atención, más un codificador de visión de ~100M de parámetros |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración recomendada por el autor (Ollama y vLLM); límite de imagen de 4.096 tokens. La longitud nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | GGUF Q8_0 (repositorio localdeel/ko-hand-ocr-vl-GGUF, con mmproj); safetensors en bf16. No se documentan otras cuantizaciones |
| Idiomas soportados | Coreano (ko) para la tarea de OCR; coreano e inglés (ko, en) declarados en la model card, incluida la posibilidad de usar consignas en inglés o vacías |
| Licencia | Apache-2.0 (el modelo base Qwen3.5-0.8B también es Apache-2.0; ver NOTICE) |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0 con mmproj) |
| Tamano del repositorio | 1,8 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es exactamente la de Qwen3.5-0.8B, sin modificación alguna: un transformer híbrido compuesto por 18 capas con Gated DeltaNet (mecanismo de atención lineal) y 6 capas de atención convencional, al que se añade un codificador de visión de aproximadamente 100 millones de parámetros. El ajuste se realizó con LoRA de rango 64 aplicado a todas las capas lineales, incluido el codificador de visión, con la pérdida calculada únicamente en las posiciones de la respuesta; después, los adaptadores se fusionaron en los pesos finales. No se ha documentado el uso de RLHF, DPO ni otras fases de alineación posteriores al ajuste supervisado.

Los datos de entrenamiento son íntegramente sintéticos y se reparten en tres bloques: un 55% de líneas dibujadas con 450 conjuntos de fuentes manuscritas, un 35% de fotografías simuladas de entre 1 y 10 líneas escritas a mano por una persona y capturadas como si estuvieran sobre un escritorio (con lado largo entre 640 y 2.400 px) y un 10% de líneas en tipografía impresa. Sobre estas imágenes se aplicaron aumentos que incluyen marcas de borrado, curvatura de trazos, inclinación, sombras, desenfoque y compresión JPEG. Los 30 conjuntos de fuentes de prueba y las fotografías de evaluación se reservaron fuera del entrenamiento.

Como ajustes de comportamiento, el autor modificó la plantilla de chat para que el bloque de razonamiento permanezca siempre cerrado (el modelo no gasta tokens pensando en la tarea de OCR), fijó el límite de imagen en 4.096 tokens y configuró `top_k: 1`, además de recomendar `temperature: 0`. La cabeza `mtp.*` (predicción multi-token) de los safetensors no fue ajustada y conserva el estado del modelo original; no existe en los pesos GGUF.

## Capacidades

- OCR de escritura manual en coreano (hangul) sobre imágenes completas, incluyendo páginas con múltiples líneas.
- OCR de recortes de una sola línea, con mayor precisión que en el caso de página completa.
- Generación de salida en texto plano, una línea por cada línea leída, sin formato enriquecido ni estructura.
- Codificador de visión capaz de procesar fotografías reducidas a un máximo de 4.096 tokens de imagen.
- Acepta consignas arbitrarias (por ejemplo "OCR", "lee el texto", en inglés o incluso vacías); el resultado no depende de la formulación del prompt.
- Modo de razonamiento permanentemente desactivado en la plantilla de conversación, lo que reduce la latencia al no generar tokens de pensamiento.
- Compatibilidad con la interfaz de chat estilo OpenAI (`/v1/chat/completions`) en LM Studio, llama-server, Ollama y vLLM, incluyendo imágenes codificadas en base64.
- Soporte de `image-text-to-text` a través de `AutoModelForImageTextToText` y `AutoProcessor` en transformers.
- No se declara soporte de tool calling ni de function calling en la información disponible.
- No se declara soporte para flujos de agentes ni razonamiento multi-paso.
- No lee estructuras de formulario como tablas, sellos o firmas; únicamente devuelve el texto de las líneas.

## Casos de uso

- Digitalización de formularios manuscritos coreanos: el modelo recibe la fotografía de la hoja y devuelve el texto línea a línea, lo que permite volcar los datos a un sistema de gestión documental sin necesidad de un paso previo de recorte manual.
- Archivado de notas y agendas manuscritas: con 4.096 tokens de imagen y 8.192 tokens de contexto, puede procesar páginas completas de un cuaderno y producir un volcado de texto indexable para motores de búsqueda internos.
- OCR por lotes en local sobre hardware de consumo: al pesar 1,02 GB en GGUF Q8_0 (incluido el mmproj) y funcionar en una RTX 5060 Laptop de 8 GB, es viable montar un pipeline de conversión masiva en una estación de trabajo sin GPU de centro de datos.
- Aplicaciones móviles o de escritorio de escaneo: la compatibilidad con la API estilo OpenAI permite conectar la cámara de un dispositivo a un servidor local (Ollama, llama-server o LM Studio) sin escribir código específico del modelo.
- Despliegue on-premise con requisitos de soberanía de datos: al ser Apache-2.0 y ejecutarse completamente en local, encaja en entornos donde las imágenes no pueden salir de la organización.
- Preprocesado para sistemas RAG sobre documentación escaneada: el texto extraído puede alimentar un índice vectorial o un pipeline de búsqueda documental en coreano.
- Anotación asistida de conjuntos de datos de OCR: el modelo puede generar una primera pasada sobre imágenes sin etiquetar, que después revisa un anotador humano.
- Investigación en reconocimiento de hangul manuscrito: sirve como referencia base (0,8B) frente a modelos especializados más pequeños como ko-hand-ocr (41M), dado que el autor publicará una comparativa con otros seis motores de OCR.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son de la propia tarea de OCR, medidas por el autor sobre el mismo conjunto de pruebas y el mismo equipo (RTX 5060 Laptop de 8GB). La similitud de jamo (자모 닮음) es mejor cuanto más alta, y el CER (tasa de error de caracteres) es mejor cuanto más bajo. La primera columna usa 6 conjuntos de fuentes de escritura reservados; la segunda, 11 fotografías de escritura manual real, ninguna usada en entrenamiento.

| Modelo | Fuentes de prueba (jamo / CER) | Fotos, recortes de línea (jamo / CER) |
|---|---:|---:|
| ko-hand-ocr-vl | 89,1 / 14,1 | 84,6 / 23,4 |
| Qwen3.5-0.8B (original) | 51,1 / 160,6 | 55,1 / 98,6 |

| Modelo | Jamo por página | CER por página | Peor foto (página) | Emparejamiento de líneas (jamo) |
|---|---:|---:|---:|---:|
| ko-hand-ocr-vl | 82,0 | 31,6 | 63,6 | 61,6 |
| Qwen3.5-0.8B (original) | 72,7 | 42,1 | 55,3 | 62,1 |

El autor advierte que la métrica de emparejamiento de líneas penaliza casos correctos: cuando la referencia escribe en una sola línea algo como "부서: …  성명: …" y el modelo lo divide en dos líneas, la lectura puede ser correcta y aun así bajar la puntuación.

Reproducibilidad según la vía de ejecución (mismos conjuntos de prueba):

| Via de ejecucion | Fuentes de prueba | Recortes de linea | Pagina completa |
|---|---:|---:|---:|
| transformers (bf16, safetensors) | 89,1 | 84,6 | 82,0 |
| llama.cpp `llama-server` — Q8_0 | 88,5 | 86,9 | 83,7 |
| LM Studio — Q8_0, sin tocar ajustes | 88,5 | 86,2 | 84,9 |
| Ollama — `hf.co/…:Q8_0`, tal cual | 88,2 | 86,9 | 83,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 (safetensors) los pesos ocupan aproximadamente 1,8 GB, a lo que hay que sumar la caché KV y las activaciones; en GGUF Q8_0 el conjunto de pesos y el mmproj suma 1,02 GB. Estas cifras son estimaciones derivadas del tamaño de los archivos publicados, no medidas oficiales de VRAM pico.
- GPU validadas por el autor: RTX 5060 Laptop con 8 GB, que es el equipo donde se realizaron todas las mediciones del apartado anterior.
- Cabe en GPU de consumo: sí, con 8 GB es suficiente en las configuraciones probadas (bf16 y Q8_0). No se documentan pruebas en GPUs de gama inferior.
- GPU de centro de datos (A100, H100) y otras GPU de gama alta: no se han publicado mediciones.
- Opciones de despliegue: transformers (bf16), llama.cpp `llama-server`, LM Studio, Ollama y vLLM. En el caso de vLLM el autor indica que no pudo probarlo directamente porque su equipo usa Windows, aunque la compatibilidad se deriva del soporte de Qwen3.5 en vLLM.
- Latencia y throughput: no disponibles. El único dato indirecto es que el modo de razonamiento permanece cerrado en la plantilla de chat, lo que evita generar tokens de pensamiento y reduce el tiempo de respuesta frente a un modelo con thinking activo.
- Se recomienda fijar `temperature` a 0 y mantener `top_k: 1` para obtener una salida determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| ko-hand-ocr-vl | 873M | Imagen completa o recorte de línea | 8.192 tokens (config. recomendada), imagen hasta 4.096 tokens | Apache-2.0 | HuggingFace, safetensors y GGUF |
| ko-hand-ocr | 41M | Solo línea ya recortada | No disponible | No disponible | HuggingFace (localdeel/ko-hand-ocr) |
| Qwen3.5-0.8B (base) | 0.8B | Imagen y texto, uso general | No disponible | Apache-2.0 | HuggingFace |

Según el autor, ko-hand-ocr (41M) sigue siendo más preciso que este modelo cuando se trata de leer una única línea ya recortada, mientras que ko-hand-ocr-vl es el adecuado cuando se parte de la fotografía completa. El autor ha anunciado una comparativa contra otros seis motores de OCR que se publicará junto con la versión final; esos resultados no están disponibles todavía.

## Limitaciones y advertencias

- No se ha entrenado con escritura manual humana real: el 55% del corpus proviene de fuentes tipográficas que imitan la escritura a mano. El propio autor señala que la letra cursiva ligada o los trazos superpuestos son puntos débiles.
- El conjunto de evaluación fotográfica consta de solo 11 imágenes, por lo que la varianza es muy alta: cada foto individual representa unos 9 puntos porcentuales del resultado global.
- No reconoce estructura de formulario: tablas, sellos, firmas y otros elementos de maquetación se ignoran; la salida es texto plano, una línea por línea.
- Es una versión intermedia: 2.000 de 16.000 pasos de entrenamiento. Los pesos serán reemplazados por la versión final en la misma dirección del repositorio, lo que puede alterar el comportamiento de forma no versionada.
- En los safetensors, la cabeza `mtp.*` (predicción multi-token) no fue ajustada y conserva el estado del modelo original; el autor indica que esto no cambia las respuestas, pero puede degradar la precisión de la predicción especulativa. En los GGUF esta cabeza no existe.
- La tarea está limitada al coreano: aunque la model card declara coreano e inglés, el inglés se refiere a la posibilidad de usar consignas en ese idioma, no al reconocimiento de escritura en inglés.
- Riesgo de alucinación: como cualquier modelo generativo aplicado a OCR, puede producir texto plausible pero distinto del contenido real de la imagen, especialmente con trazos ambiguos; se recomienda validación humana en flujos críticos.
- Licencia Apache-2.0, que permite uso comercial sin restricciones adicionales destacables; el modelo base Qwen3.5-0.8B también es Apache-2.0. Se debe consultar el archivo NOTICE del repositorio para los términos completos.
- No se documentan sesgos específicos del modelo en la información disponible, más allá de que toda la escritura sintética proviene de un único escritor humano y de 450 conjuntos de fuentes, lo que puede no representar la variabilidad real de la caligrafía coreana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localdeel/ko-hand-ocr-vl
- Pesos GGUF: https://huggingface.co/localdeel/ko-hand-ocr-vl-GGUF
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo hermano de 41M para líneas recortadas: https://huggingface.co/localdeel/ko-hand-ocr
- Repositorio de código ko-hand-ocr (utilidades de recorte de líneas): https://github.com/jysvai/ko-hand-ocr
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
