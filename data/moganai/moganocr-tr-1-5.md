# moganai/MoganOCR-TR-1.5

## Resumen

MoganOCR-TR-1.5 es un modelo de visión-lenguaje (VLM) especializado en OCR y comprensión de documentos, desarrollado por moganai. Su tarea es concreta: recibe la imagen de una página y devuelve el contenido completo en orden de lectura como Markdown, con las tablas convertidas a HTML y las fórmulas a LaTeX. Con 2.721.801.024 parámetros totales, es un modelo compacto pensado para desplegarse en producción sin necesidad de infraestructura masiva.

La versión 1.5 es una actualización de MoganOCR-TR que mantiene el mismo tamaño, el mismo prompt y el mismo formato de salida, por lo que funciona como reemplazo directo. Las mejoras se centran en tres problemas clásicos del OCR generativo: la alucinación de texto memorizado en páginas en blanco, los bucles de repetición que agotan el límite de tokens y la calidad de las tablas. En el benchmark propio del autor (TurkishOCR-Bench) la puntuación global sube de 89,9 a 91,9.

El modelo está orientado al turco como idioma principal, con soporte declarado de inglés, y se distribuye bajo licencia Apache 2.0. Es relevante ahora porque demuestra que un modelo de menos de 3.000 millones de parámetros, afinado con RL (GRPO) sobre un modelo base, puede competir en tareas de parsing de documentos frente a alternativas mucho mayores, y porque corrige fallos de fiabilidad que hacían inviable su uso en pipelines automáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basada en transformer, familia `qwen3_5` (vision encoder + LLM), vision encoder congelado durante el afinado |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el despliegue con vLLM: `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16) |
| Idiomas soportados | tr (turco), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también incluye `mtp.safetensors` con la cabeza MTP) |

## Arquitectura y entrenamiento

El modelo parte de MoganOCR-TR y hereda su arquitectura de visión-lenguaje de la familia `qwen3_5`: un codificador de imagen que procesa la página y un decodificador de lenguaje que genera el Markdown token a token. Durante el afinado de la versión 1.5 el codificador visual se mantuvo congelado, de modo que todo el entrenamiento se concentró en el decodificador. El procesador trabaja con imágenes de hasta 4.194.304 píxeles, que es el límite por defecto y el que dio mejores resultados en la evaluación.

El entrenamiento se hizo en tres fases. Primero, RL con GRPO (pérdida DAPO, implementado con TRL y vLLM): 125 pasos, 8 páginas por paso y 8 muestras por página, seleccionando páginas donde las propias muestras del modelo discrepaban entre sí. La recompensa combinaba similitud de texto, F1 de filas y números en tablas, salida vacía en páginas en blanco, y cero para bucles o salidas truncadas. Después, un SFT corto de una época sobre 1.086 páginas, con páginas en blanco que el RL no logró corregir y salidas propias de alta puntuación en páginas de texto para evitar olvido catastrófico. Por último, se promediaron los pesos al 50% entre el modelo de RL y el de SFT: el modelo de SFT por sí solo arreglaba las páginas en blanco pero se saltaba cerca del 5% de las páginas de texto, y el promedio conserva ambas propiedades.

Como innovación destacable, el repo incluye una cabeza MTP (multi-token prediction) que permite decodificación especulativa en vLLM (`--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`). Esa cabeza proviene de MoganOCR-TR y no se reentrenó para 1.5, y la ganancia de velocidad no se volvió a medir en esta versión.

## Capacidades

- OCR de página completa: lee una imagen de documento y devuelve todo el contenido en orden de lectura como Markdown.
- Conversión de tablas a HTML, con una métrica TEDS de 86,9 en el benchmark del autor.
- Conversión de fórmulas matemáticas a LaTeX, con CDM de 97,8.
- Manejo correcto de páginas en blanco: devuelve salida vacía o solo los elementos realmente presentes (número de página, `<figure/>`, casillas de formulario).
- Reconocimiento robusto de caracteres turcos específicos (ı, İ, ş, ğ, ç, ö, ü), con 99,2 en las pruebas de caracteres turcos del benchmark.
- Documentos escaneados: la usabilidad del texto en páginas escaneadas sube a 78,4.
- Salida estable sin bucles de repetición: cero páginas que agotan el límite de tokens en el benchmark y cero en las páginas de texto del conjunto de validación.
- Soporte de modo thinking desactivable mediante `enable_thinking` en la plantilla de chat (el valor por defecto es thinking desactivado).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión general más allá del parsing de documentos.

## Casos de uso

- Digitalización masiva de archivos turcos: el modelo procesa páginas escaneadas y devuelve Markdown listo para indexar, con la ventaja de que en páginas en blanco ya no genera texto inventado, lo que evita contaminar el corpus con pasajes falsos.
- Extracción de tablas de informes y artículos: la conversión a HTML con TEDS de 86,9 permite reconstruir tablas financieras o científicas y parsearlas después con herramientas estándar.
- Procesamiento de literatura científica con fórmulas: la salida LaTeX (CDM 97,8) hace viable alimentar repositorios de artículos turcos manteniendo las ecuaciones en formato reutilizable.
- Pipeline de accesibilidad documental: convertir PDFs escaneados en Markdown estructurado para lectores de pantalla o para su publicación web, con orden de lectura preservado.
- Backend de OCR en aplicaciones de gestión documental: al ser un modelo de 2.700 millones de parámetros, cabe en una GPU de consumo y puede servirse con vLLM detrás de una API compatible con OpenAI, integrándose en flujos de digitalización de facturas, formularios y expedientes.
- Preprocesado para RAG sobre documentación turca: el Markdown generado, con tablas en HTML y fórmulas en LaTeX, se trocea y se embebe directamente, y la ausencia de bucles reduce el riesgo de fragmentos corruptos.
- Control de calidad de escaneos: al devolver salida vacía o mínima en páginas en blanco, el modelo sirve como detector implícito de páginas sin contenido útil en lotes de digitalización.

## Benchmarks y rendimiento

Resultados publicados por el autor en TurkishOCR-Bench (488 páginas difíciles, 10 categorías, pipeline `oku_puanla.py` + `tob_v3.py` con CDM incluido, imágenes de hasta 4.194.304 píxeles y hasta 8.000 tokens nuevos):

| Metrica | MoganOCR-TR | MoganOCR-TR-1.5 |
|---|---|---|
| Puntuación TOB global | 89,9 | 91,9 |
| Text_TR | 89,4 | 91,0 |
| Tablas (TEDS) | 82,5 | 86,9 |
| Fórmulas (CDM) | 97,8 | 97,8 |
| Páginas limpias | 65,8% | 68,3% |
| Páginas no fiables | 26,8% | 24,7% |
| Pruebas de caracteres turcos | 97,6 | 99,2 |
| Páginas que entran en bucle hasta el límite de tokens | 2 | 0 |

No se han publicado en la información disponible resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,5 GB solo para los pesos (2.721.801.024 parámetros × 2 bytes), más el coste de activaciones y del procesamiento de imágenes de hasta 4.194.304 píxeles, que puede elevar el consumo de forma apreciable según la resolución de la página.
- GPU recomendadas: A100 o H100 para lotes grandes y máximo throughput; L40S o RTX 6000 Ada como opción de centro de datos de gama media; RTX 4090 (24 GB) para servir el modelo con holgura.
- GPU de consumo: cabe en tarjetas con 16 GB o más en bfloat16, y en 8-12 GB si se cuantiza, aunque el repo no publica pesos cuantizados oficiales.
- Opciones de despliegue: vLLM (soporte documentado, con decodificación especulativa MTP opcional) y Transformers con `AutoModelForImageTextToText`. No se documentan instrucciones para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la ganancia de velocidad del MTP no se volvió a medir para la versión 1.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganOCR-TR-1.5 | 2.721.801.024 | 32.768 tokens | OCR turco a Markdown, tablas HTML, fórmulas LaTeX | Apache 2.0 | Hugging Face |
| MoganOCR-TR | no disponible en la información | no disponible | Versión anterior, mismo prompt y formato | Apache 2.0 | Hugging Face |
| Otros modelos OCR/VLM de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con la versión anterior del propio modelo. No se han proporcionado datos de alternativas de terceros (por ejemplo, modelos OCR de la familia Qwen-VL, Granite Vision o similares), por lo que la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- Cobertura lingüística limitada: el modelo está entrenado y evaluado para turco, con inglés declarado, pero no hay evidencia de rendimiento en otros idiomas.
- Especialización estrecha: no es un asistente general; está diseñado para una única tarea con un prompt fijo (`Sayfayı markdown olarak yaz.`), y desviarse de ese formato puede degradar la salida.
- Riesgo de alucinación residual: aunque la versión 1.5 corrige el texto memorizado en páginas en blanco, el 24,7% de las páginas del benchmark se clasifican como "no fiables", lo que exige validación en producción.
- Dependencia de la configuración: los resultados publicados se obtuvieron con decodificación greedy, thinking desactivado, hasta 8.000 tokens nuevos y el límite de imagen por defecto de 4.194.304 píxeles; cambiar estos parámetros puede alterar la calidad.
- La cabeza MTP no se reentrenó para 1.5, por lo que la aceleración por decodificación especulativa no está validada en esta versión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datos de entrenamiento del modelo base, no detalladas en la información disponible.
- Sin datos publicados sobre sesgos demográficos o culturales, ni sobre robustez frente a documentos manuscritos, sellos, imágenes degradadas o layouts atípicos más allá de las categorías del benchmark del autor.
- Ecosistema joven: cero descargas y cero likes en el momento de la consulta, lo que implica poca validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganOCR-TR-1.5
- Modelo base / versión anterior: https://huggingface.co/moganai/MoganOCR-TR
- Benchmark TurkishOCR-Bench (Space): https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- Apoyo al autor: https://buymeacoffee.com/moganai
