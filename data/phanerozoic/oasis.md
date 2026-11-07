# phanerozoic/oasis

## Resumen

Oasis es un modelo de visión y OCR de muy pequeño tamaño desarrollado por el usuario phanerozoic como un fine-tuning del modelo Mirage de Cactus-Compute. Con solo 51 millones de parámetros y un archivo de pesos de 21,6 MB (mayoritariamente cuantizado a 2 bits), es capaz de procesar una imagen y devolver un registro JSON estructurado que incluye campos de escena, objetos nombrados con cajas y máscaras, el texto presente en la imagen, relaciones entre objetos y una breve traza de razonamiento. El modelo está pensado para ejecutarse en CPU, lo que lo hace adecuado para entornos con recursos muy limitados.

La innovación principal de Oasis no está en el modelo en sí, sino en el motor de inferencia que lo acompaña: una biblioteca en C++17 con API en C, herramienta de línea de comandos y binding de Python, construida con CMake y que aprovecha OpenMP y kernels AVX2/AVX-VNNI para las operaciones con pesos de 2 bits y activaciones int8. Según las mediciones del autor, este motor reduce el tiempo de descripción completa de 841 ms a 262 ms respecto a Mirage, elimina los fallos de parseo JSON (0 de 24 frente a 7 de 24) y mejora ligeramente la precisión OCR en ICDAR2013 (81,0% frente a 80,9%) y IIIT5K (78,7% frente a 77,6%).

El modelo es relevante ahora porque demuestra que es posible obtener capacidades de visión estructurada (detección, segmentación, OCR y relaciones) en un archivo de 21,6 MB que cabe en CPU, con licencia Apache-2.0 y soporte para siete idiomas europeos. Está disponible en Hugging Face con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión y texto (hereda la de Mirage; detalles no disponibles) |
| Parametros totales | 51 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hasta 512 tokens decodificados por descripción completa) |
| Tipos de cuantizacion | 2 bits (pesos mayoritarios), activaciones int8; checkpoint float32 latente disponible |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache-2.0 |
| Formato de pesos | `.oasis` (motor propio), `.safetensors` (float32 latente) |

## Arquitectura y entrenamiento

Oasis hereda la arquitectura de Mirage (Cactus-Compute), un transformer multimodal de 51 millones de parámetros especializado en visión y texto. El cambio principal respecto al modelo base es el reentrenamiento del lector de texto: Mirage contaba con 306 caracteres en su lector, pero 67 de ellos (incluyendo Ÿ, Ź, Ĳ, ¡ y la raya de los siete idiomas, así como letras de checo, húngaro, letón, galés, islandés y esperanto) nunca se entrenaron y tenían pesos de salida a cero. Oasis reentrena el lector sobre recortes de palabras de TextOCR, con destilación hacia el lector de Mirage, junto con líneas sintéticas que contienen esos caracteres. El resultado es que los 306 caracteres tienen pesos entrenados y los 67 previamente no entrenados pasan de 0% a 51,7% de acierto en líneas sintéticas.

El entrenamiento del lector se realiza a través del mismo cuantizador de 2 bits y activaciones int8 que ejecuta el motor, y se exporta con la misma aritmética. El resto de tensores son de Mirage y las matrices cuantizadas fuera del lector se copian byte a byte desde `mirage.cact`. El motor calcula directamente el forward pass publicado: activaciones int8 contra pesos de libro de códigos de 2 bits mediante kernels AVX2 y AVX-VNNI con fallback portable, un redimensionado que coincide con el filtro bilineal de Pillow, coeficientes de máscara a partir de un parche de características de 5 × 5 por objeto y un decodificador cuyos hilos trabajan durante toda la decodificación. El escritor JSON emite `null` para cualquier número no finito. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de descripciones estructuradas de imágenes en formato JSON, con campos de escena, objetos, texto, relaciones y traza de razonamiento.
- Detección de objetos con cajas delimitadoras en escala 0–1000 por eje de imagen.
- Segmentación de objetos con máscaras en formato `largest`, `polygons` o `none`.
- OCR multilingüe en siete idiomas (en, de, fr, es, it, nl, pl) con lectura de palabras y líneas de texto.
- Salida estructurada con razonamiento breve (campo `reasoning` configurable).
- Soporte de peticiones solo de texto (`sections=["text"]`) que omiten el decodificador y reducen la latencia.
- Control de umbrales de confianza (`conf`, `text_conf`), número máximo de objetos y líneas de texto, y tokens máximos.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes multi-paso ni razonamiento de múltiples turnos.
- No soporta visión más allá de la descripción de una imagen estática; no hay soporte de audio ni vídeo.
- Capacidades multilingües limitadas a los siete idiomas listados, con especial atención a caracteres previamente no entrenados.

## Casos de uso

- Digitalización de documentos y facturas: el modelo puede extraer texto de imágenes de documentos y devolverlo en JSON estructurado, lo que facilita su integración en pipelines de contabilidad o gestión documental. Es adecuado por su OCR multilingüe y su capacidad de ejecutarse en CPU sin GPU.
- Accesibilidad para personas con discapacidad visual: descripción de escenas con objetos, texto y relaciones entre elementos en tiempo real sobre CPU, lo que permite desplegarlo en dispositivos de bajo consumo o en servidores sin acelerador.
- Moderación de contenido visual: detección de objetos y texto en imágenes subidas por usuarios para identificar contenido no deseado, con salida JSON que se puede validar automáticamente.
- Automatización de inventario y logística: reconocimiento de objetos y texto en fotos de almacén o paquetes, con cajas y máscaras para localizar etiquetas y productos, ejecutándose en el propio dispositivo de captura.
- Extracción de información de imágenes médicas o industriales simples: identificación de regiones y texto en capturas, con máscaras poligonales para delimitar áreas de interés, siempre que la tarea no requiera precisión clínica.
- Procesamiento por lotes en entornos sin GPU: al ocupar 21,6 MB y ejecutarse en CPU con OpenMP, permite procesar grandes volúmenes de imágenes en servidores convencionales con latencias de 68 ms para solo texto y 262 ms para descripción completa.
- Integración en aplicaciones de escritorio o móviles: el binding de Python y la herramienta de línea de comandos facilitan su inclusión en aplicaciones locales que necesiten describir imágenes sin conexión a la nube.

## Benchmarks y rendimiento

Los datos disponibles provienen de la comparación del autor entre Mirage y Oasis, medida en un Intel Core i9-12900H con las mismas imágenes y opciones. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | Mirage | Oasis |
|---|---:|---:|
| Descripción completa, mediana de 24 imágenes | 841 ms | 262 ms |
| Petición solo de texto | 793 ms | 68 ms |
| Salidas que no parsean como JSON | 7 de 24 | 0 de 24 |
| Palabras ICDAR2013 leídas correctamente | 80,9% | 81,0% |
| Palabras IIIT5K leídas correctamente | 77,6% | 78,7% |
| Caracteres del lector con pesos entrenados | 239 de 306 | 306 de 306 |
| Otros 67 caracteres leídos en líneas sintéticas | 0% | 51,7% |
| Pesos | 21,6 MB | 21,6 MB |

Adicionalmente, una descripción completa en un solo hilo tarda 607 ms en Oasis, aún por debajo del tiempo multihilo de Mirage. Los pesos de Mirage sobre el motor de Oasis tardan 255 ms y leen 81,2% y 77,9%, lo que indica que la mejora de velocidad y la salida limpia corresponden al motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para CPU; el archivo de pesos ocupa 21,6 MB.
- GPU recomendadas: no se requieren GPU; el motor usa kernels AVX2 y AVX-VNNI con fallback portable.
- Cabe en cualquier CPU moderna con soporte AVX2; no se especifican requisitos mínimos de memoria RAM, pero al ser un modelo de 51 millones de parámetros y 21,6 MB de pesos, el consumo es muy bajo.
- Opciones de despliegue: motor propio en C++17 con API en C, herramienta de línea de comandos `oasis_cli` y binding de Python `oasis_engine`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 68 ms para peticiones solo de texto y 262 ms para descripción completa (mediana de 24 imágenes) en un Intel Core i9-12900H; 607 ms en un solo hilo para descripción completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OCR ICDAR2013 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oasis | 51 M | no disponible (512 tokens decodificados) | 81,0% | Apache-2.0 | Hugging Face |
| Mirage (Cactus-Compute) | 51 M | no disponible | 80,9% | Apache-2.0 | Hugging Face |
| Otros modelos de OCR/visión de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparación más directa es con Mirage, su modelo base, del que Oasis mejora la latencia, la limpieza de salida JSON y la cobertura de caracteres del lector.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre TextOCR y datos de Mirage, puede heredar sesgos de esos conjuntos.
- Riesgo de alucinación: no se cuantifica; el modelo genera descripciones y trazas de razonamiento que podrían contener información no presente en la imagen, aunque el autor destaca que todas las salidas parsean como JSON.
- Limitaciones de contexto: la longitud de contexto no está documentada; las descripciones completas decodifican hasta 512 tokens, lo que limita la cantidad de objetos y texto que se pueden describir en una sola pasada.
- Limitaciones de idioma: solo soporta en, de, fr, es, it, nl y pl; no se garantiza un rendimiento equivalente en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el archivo `NOTICE` registra qué proviene de Mirage y de TextOCR, por lo que se deben respetar las atribuciones correspondientes.
- Caveats para producción: el modelo no incluye el rellenado de formularios (`extract`) ni las máscaras de mapa de bits del motor de Mirage; el motor es propio y requiere compilación con CMake; no se han publicado benchmarks estándar de razonamiento o código; el repositorio tiene 0 descargas y 0 likes, lo que indica poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/phanerozoic/oasis
- Modelo base Mirage: https://huggingface.co/Cactus-Compute/mirage
- Dataset TextOCR_OCR: https://huggingface.co/datasets/MiXaiLL76/TextOCR_OCR
- Artículo sobre OASIS (omics AI scientist, no relacionado): https://www.sciencedirect.com/science/article/pii/S1674205226003059
- Proyecto Oasis (modelo de vídeo interactivo, no relacionado): https://oasis-model.github.io/
