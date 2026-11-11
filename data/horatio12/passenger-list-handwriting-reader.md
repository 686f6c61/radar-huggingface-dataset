# horatio12/passenger-list-handwriting-reader

## Resumen

Passenger-list-handwriting-reader es un modelo de reconocimiento de escritura manuscrita (HTR, *handwritten text recognition*) especializado en la lectura de nombres en listas de pasajeros de barcos con destino a Estados Unidos. Lo desarrolla el usuario horatio12 como parte del proyecto de código abierto passenger-list-reader, y se construye mediante *fine-tuning* del modelo multicentury-htr-model del Archivo Nacional de Finlandia (Kansallisarkisto) sobre tiras de nombres recortadas de las listas de llegada a Nueva York entre 1897 y 1957 (microfilm T715 de los National Archives, digitalizado en archive.org).

El modelo resuelve un problema muy concreto dentro de la digitalización genealógica y archivística: transcribir automáticamente nombres manuscritos, muchos de ellos de origen este y sur de Europa tal como los escribían empleados y oficiales estadounidenses. Se trata de un modelo visión-codificador-decodificador de tipo TrOCR con 558 millones de parámetros, empaquetado en safetensors y compatible con la librería transformers, lo que facilita su integración en pipelines existentes de OCR/HTR.

Su relevancia radica en la especialización: frente a modelos HTR genéricos, está ajustado sobre un dominio muy estrecho (tiras de nombres en listas de pasajeros) con un rendimiento declarado de 75,1 % de palabras correctas sobre páginas no vistas. Es un modelo pequeño, con licencia Apache 2.0 y pensado para ejecutarse en hardware modesto, lo que lo hace accesible para proyectos de historia familiar y archivos digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR) |
| Parametros totales | 558.226.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion limitada a max_new_tokens=48 en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (nombres en ingles, con muchos nombres de origen este y sur de Europa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR: un codificador de visión (encoder) que procesa la imagen de la tira de texto y un decodificador de texto autorregresivo que genera la transcripción, ambos conectados mediante un mecanismo de atención cruzada. Es un transformer visión-texto estándar, sin innovaciones arquitectónicas propias; la aportación está en el ajuste fino sobre un dominio concreto.

El entrenamiento parte del modelo multicentury-htr-model del Archivo Nacional de Finlandia y se ajusta sobre tiras de nombres recortadas con el localizador de líneas de kraken a partir de las listas de llegada a Nueva York (microfilm T715). Las etiquetas de entrenamiento se generaron leyendo cada tira dos veces con Claude (y algunas también con Gemini), conservando únicamente los nombres en los que ambas lecturas coincidían; no hubo verificación humana, por lo que la escritura difícil está infrarrepresentada en el conjunto de entrenamiento. No se especifican el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de escritura manuscrita sobre imágenes de tiras de nombres recortadas de listas de pasajeros.
- Generación de texto a partir de imagen (*image-to-text*) mediante pipeline de transformers.
- Lectura óptima de tiras cortadas con el localizador de líneas de kraken.
- Manejo de nombres de origen este y sur de Europa tal como los transcribían empleados y oficiales estadounidenses.
- Soporte de *interpolate_pos_encoding* para imágenes de resolución variable.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés y a nombres transcritos en contextos anglófonos.

## Casos de uso

- Digitalización de archivos genealógicos: procesar lotes de imágenes de listas de pasajeros y extraer los nombres para indexarlos en bases de datos de historia familiar, aprovechando que el modelo está ajustado específicamente a este tipo de documento.
- Transcripción asistida para historiadores: generar una primera lectura automática de las tiras de nombres que después un investigador revisa y corrige, reduciendo el tiempo de transcripción manual.
- Construcción de índices de inmigración: alimentar motores de búsqueda de registros de llegada a puertos estadounidenses a partir de microfilm digitalizado.
- Enriquecimiento de colecciones en archive.org: aplicar el modelo a los escaneos de los rollos T715 para producir metadatos textuales asociados a cada imagen.
- Pipeline de OCR especializado en producción: integrar el modelo con el localizador de líneas de kraken para segmentar y transcribir páginas completas de listas manuscritas.
- Proyectos de bajo presupuesto: al tener 558 millones de parámetros y licencia Apache 2.0, puede desplegarse en hardware modesto para organizaciones pequeñas o voluntarios que digitalizan archivos locales.
- Investigación sobre HTR histórico: servir como punto de partida para *fine-tuning* sobre otras colecciones de documentos manuscritos con estructura similar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 23 páginas manuscritas de rollos no usados en entrenamiento, contando solo nombres en los que dos lecturas independientes coinciden en la verdad:

| Metrica | Resultado |
|---|---|
| Palabras correctas | 559 de 744 (75,1 %) |
| Nombres completos correctos | 178 |
| Tasa de error por letra | 7,5 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de una tarea de HTR y no de benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en precisión completa (fp32) para los 558 millones de parámetros; en fp16 alrededor de 1,1 GB, más el espacio para las activaciones de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en tarjetas consumer como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (TrOCRProcessor + VisionEncoderDecoderModel), con soporte de endpoints compatibles; no se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| horatio12/passenger-list-handwriting-reader | 558 M | no disponible | 75,1 % palabras correctas en su dominio | Apache 2.0 | Hugging Face |
| Kansallisarkisto/multicentury-htr-model (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| horatio12/passenger-list-typed-reader | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ajustado para tiras cortas de nombres, no para escritura corrida ni páginas completas.
- Sin probar en otros puertos distintos de Nueva York; el rendimiento puede degradarse fuera del dominio de entrenamiento.
- La escritura difícil o desvaída tiene una precisión mucho menor que la media declarada.
- Las etiquetas de entrenamiento se generaron con lecturas automáticas de Claude y Gemini sin verificación humana, por lo que la escritura difícil está infrarrepresentada y pueden persistir errores sistemáticos en los datos.
- Riesgo de alucinación en la transcripción: el decodificador puede generar nombres plausibles que no correspondan exactamente a lo escrito.
- Sesgo hacia nombres de origen este y sur de Europa tal como los escribían empleados estadounidenses; otros orígenes pueden estar peor representados.
- Idioma limitado al inglés y a contextos anglófonos.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base es de un archivo nacional finlandés y conviene revisar sus condiciones originales.
- No apto para producción crítica sin revisión humana, dado el 7,5 % de error por letra y la ausencia de validación humana en las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/horatio12/passenger-list-handwriting-reader
- Modelo base: https://huggingface.co/Kansallisarkisto/multicentury-htr-model
- Modelo para tiras mecanografiadas: https://huggingface.co/horatio12/passenger-list-typed-reader
- Repositorio del proyecto: https://github.com/jbyoung12/passenger-list-reader
- Kraken (localizador de líneas): https://kraken.re
