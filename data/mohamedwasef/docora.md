# mohamedwasef/Docora

## Resumen

Docora (identificador `mohamedwasef/Docora`) es un adaptador LoRA entrenado sobre `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit` para OCR de página completa de documentos oficiales egipcios escaneados, en concreto ejemplares de la Gaceta Oficial (الجريدة الرسمية) con leyes tributarias y decisiones del Ministerio de Hacienda. Lo desarrolla el usuario de HuggingFace mohamedwasef y se publica bajo licencia Apache 2.0 con pipeline `image-to-text`. No es un modelo autónomo: es un adaptador de 0,2 GB que debe cargarse sobre el modelo base cuantizado en 4 bits.

El modelo base Qwen3-VL-8B-Instruct es un transformer denso de tipo vision-language con 8.810 millones de parámetros totales. El adaptador entrena solo las capas del modelo de lenguaje (r=16, alpha=16), dejando el codificador visual congelado, con 43.646.976 parámetros entrenables, el 0,50 % del total. El repositorio declara únicamente el idioma árabe (`ar`).

Su relevancia es doble. Por un lado, ataca un nicho poco cubierto: OCR de documentos legales árabes con tipografía impresa antigua, dígitos árabe-índicos y maquetación a varias columnas. Por otro, forma parte de una familia de tres adaptadores (Qwen3-VL-4B, Qwen3-VL-8B y Gemma 4 E4B) entrenados sobre exactamente el mismo conjunto de datos y la misma partición train/validation, lo que permite una comparación directa de tamaño y arquitectura; el autor afirma que esta versión de 8B es la más potente de las tres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptador LoRA; el adaptador modifica solo las capas del modelo de lenguaje y mantiene congelado el codificador visual |
| Parámetros totales | 8.810 millones en el modelo base; 43.646.976 parámetros entrenables en el adaptador (0,50 % del total) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | Adaptador en fp16; el modelo base se distribuye en 4 bits (bnb-4bit) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, 0,2 GB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (r=16, alpha=16) sobre un modelo vision-language de la familia Qwen3-VL. El ajuste se limita a las capas del modelo de lenguaje; el codificador visual permanece congelado durante todo el entrenamiento, de modo que la capacidad de percepción visual es la del modelo base y lo aprendido es la proyección hacia la transcripción de texto legal árabe. Los pesos entrenables son 43.646.976, un 0,50 % de los 8.810 millones de parámetros del modelo base.

El conjunto de datos es `mohamedwasef/egyptian-official-documents-ocr`, con 280 páginas para entrenamiento y 56 reservadas para validación; la partición es idéntica a la usada en los modelos hermanos de 4B y Gemma 4 E4B. El entrenamiento se hizo en precisión fp16, durante 3 épocas y unos 57 minutos en total, sobre una única NVIDIA T4 del nivel gratuito de Kaggle. La librería Unsloth descargó automáticamente la capa de embeddings a la RAM de la CPU para encajar en los 14,6 GB de VRAM de la T4, con un pico de uso de 7,50 GB durante el entrenamiento. La pérdida de evaluación seguía mejorando en el último paso, sin señales de sobreajuste, motivo por el que se completaron las 3 épocas. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- OCR de página completa de documentos oficiales egipcios escaneados, con salida de texto plano en árabe.
- Transcripción de documentos legales con estructura interna: artículos, enmiendas, referencias cruzadas entre leyes y numeración de páginas.
- Manejo de dígitos árabe-índicos (٠١٢٣٤٥٦٧٨٩) y de referencias numéricas del tipo «المادة (٢٩ مكرراً)».
- Procesamiento de maquetación a varias columnas y de texto con diacríticos; la evaluación normaliza diacríticos y unifica ى/ي, y evalúa los dígitos por separado y de forma exacta.
- Salida en formato imagen-a-texto (`image-to-text`), orientada a transcripción, no a diálogo general.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: solo se declara árabe (`ar`).
- Modo de razonamiento explícito (thinking), visión general, audio: no documentado en la información disponible.

## Casos de uso

- Digitalización masiva de boletines oficiales: el modelo transcribe páginas escaneadas completas de la Gaceta Oficial a texto plano en árabe, lo que permite convertir series históricas de PDF escaneado en corpus consultables sin intervención manual página a página. Su CER del 1,97 % en el conjunto de prueba de 30 páginas lo hace viable con revisión humana posterior por muestreo.
- Extracción de referencias legales para bases de datos jurídicas: al conservar la numeración de artículos y las fórmulas de enmienda («يُضاف إلى المادة...»), el texto resultante se puede parsear con reglas para indexar qué artículo modifica cada ley, alimentando un sistema de trazabilidad normativa.
- Búsqueda de texto completo sobre archivos históricos: una vez transcritas las páginas, se puede construir un índice de búsqueda sobre normativa tributaria egipcia, un material que de otro modo solo existe como imagen y no es indexable por buscadores convencionales.
- Cumplimiento fiscal y análisis de normativa: despachos y departamentos fiscales pueden transcribir leyes y decisiones del Ministerio de Hacienda para extraer definiciones, plazos y umbrales económicos concretos (por ejemplo, límites trimestrales de declaración de operaciones) y compararlos entre ejercicios.
- Auditoría y control de calidad de OCR existente: el adaptador sirve como segunda opinión sobre transcripciones producidas por otros motores; las páginas con CER alto o con discrepancias entre ambos sistemas se marcan para revisión, reduciendo el coste de validación manual.
- Construcción de pipelines RAG sobre normativa egipcia: el texto transcrito se puede trocear por artículo, vectorizar e integrar en un asistente que responda preguntas citando la disposición concreta, ya que la salida mantiene la estructura de artículos y apartados.
- Preservación y archivo documental: instituciones que conservan colecciones escaneadas pueden generar una capa de texto asociada a cada imagen para accesibilidad, búsqueda y conservación a largo plazo del contenido, no solo del escaneo.
- Comparación de arquitecturas sobre un mismo corpus: al compartir partición de datos con los adaptadores de 4B y Gemma 4 E4B, el modelo sirve como referencia de techo de calidad para decidir si merece la pena el coste de un 8B frente a alternativas menores en un despliegue de producción.

## Benchmarks y rendimiento

La evaluación se realizó sobre el conjunto de prueba oficial del conjunto de datos, de 30 páginas nunca vistas en entrenamiento ni validación. El CER y el WER se calcularon tras normalizar diacríticos y unificar ى/ي; los dígitos se evaluaron por separado y de forma exacta.

| Subconjunto | Páginas | CER | WER |
|---|---|---|---|
| Todas las páginas de prueba | 30 | 1,97 % | 3,76 % |
| Resto de subconjuntos (desglose por tipo de página) | No disponible: la información proporcionada se interrumpe antes de completar la tabla | No disponible | No disponible |

Datos adicionales aportados por el autor: la página de ejemplo incluida en la model card obtiene CER 0,60 % / WER 2,19 %, resultado mediano entre las páginas de prueba sin tablas; dos páginas de prueba (`law_201_2014_p001.png` y `law_53_2014_p008.png`) alcanzaron coincidencia exacta carácter por carácter, con CER 0,00 % y WER 0,00 %. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que por otra parte no son representativos para una tarea de OCR.

## Requisitos de hardware

- Entrenamiento documentado: una única NVIDIA T4 de 14,6 GB de VRAM (nivel gratuito de Kaggle), con pico de 7,50 GB gracias a la descarga automática de la capa de embeddings a RAM de CPU que realiza Unsloth, en fp16.
- VRAM estimada para inferencia: en fp16, unos 18 GB solo para los pesos del modelo base de 8.810 millones de parámetros, más el coste de activaciones y del codificador visual; sobre el modelo base en 4 bits, alrededor de 5-6 GB de pesos más overhead, cifra coherente con el adaptador, que ocupa 0,2 GB.
- GPU recomendadas: para fp16, tarjetas de 24 GB o más como RTX 4090, L40S, A100 40 GB o H100; para la variante en 4 bits, tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4070 o T4 son suficientes en principio.
- Compatibilidad con GPU de consumo: sí. Con el modelo base cuantizado en 4 bits cabe en GPUs de 8-12 GB; en fp16 requiere una RTX 4090 de 24 GB o superior.
- Opciones de despliegue: al ser un modelo de visión con adaptador LoRA, los servidores que soportan ambos elementos (vLLM y TGI con carga de adaptadores) son las vías naturales. El uso con llama.cpp u Ollama requeriría convertir el modelo base a GGUF e integrar el adaptador; no está documentado en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los tres modelos siguientes comparten el mismo conjunto de datos y la misma partición train/validation, según la model card, lo que hace la comparación directa en calidad.

| Modelo | Modelo base | Parámetros del base | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Docora | Qwen3-VL-8B-Instruct (bnb-4bit) | 8,81 mil millones | No disponible | Apache 2.0 | HuggingFace, adaptador LoRA de 0,2 GB | CER 1,97 % / WER 3,76 % en 30 páginas de prueba; el autor lo describe como el más potente de los tres |
| mohamedwasef/egyptian-document-ocr | Qwen3-VL-4B-Instruct | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace | No disponible |
| mohamedwasef/egyptian-document-ocr-gemma4 | Gemma 4 E4B | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace | No disponible; el autor menciona que en ese entrenamiento sí se observó sobreajuste |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo independiente: requiere cargar `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit` (o un modelo base equivalente) para funcionar. La reproducibilidad exacta de los resultados depende de usar el mismo modelo base de partida.
- Ámbito temático estrecho: entrenado exclusivamente con documentos oficiales egipcios (leyes tributarias y decisiones del Ministerio de Hacienda). No hay evidencia de generalización a otros dominios, países, tipos de documento ni a texto manuscrito.
- Idioma único: solo se declara árabe (`ar`). No hay soporte documentado de otros idiomas ni de mezcla de idiomas en una misma página.
- Error residual medible: CER del 1,97 % y WER del 3,76 % sobre 30 páginas de prueba. En producción esto implica caracteres y palabras erróneos en documentos legales, donde una cifra o un artículo mal transcrito cambia el significado; se recomienda validación humana o automática en usos con consecuencias legales o fiscales.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible no presente en la imagen, especialmente en páginas degradadas, sellos, tablas o zonas de baja calidad. El autor indica que la tabla de resultados estaba desglosada por subconjuntos (con una categoría de páginas sin tablas), lo que sugiere un comportamiento distinto y presumiblemente peor en páginas con tablas.
- Los dígitos se evalúan de forma exacta y por separado, lo que refleja la sensibilidad del dominio a errores numéricos; conviene replicar esa comprobación en cualquier despliegue.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial está sujeto también a la licencia del modelo base, que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, sin validación externa independiente más allá de la evaluación del propio autor.
- Las fechas de creación y actualización del repositorio son muy próximas entre sí (2 de octubre de 2026), lo que indica que no ha habido iteraciones posteriores de mantenimiento documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohamedwasef/Docora
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/mohamedwasef/egyptian-official-documents-ocr
- Modelo hermano con Qwen3-VL-4B: https://huggingface.co/mohamedwasef/egyptian-document-ocr
- Modelo hermano con Gemma 4 E4B: https://huggingface.co/mohamedwasef/egyptian-document-ocr-gemma4
