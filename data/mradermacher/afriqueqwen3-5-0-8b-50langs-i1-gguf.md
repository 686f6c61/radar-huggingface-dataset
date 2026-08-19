# mradermacher/AfriqueQwen3.5-0.8B-50Langs-i1-GGUF

## Resumen

AfriqueQwen3.5-0.8B-50Langs-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo AfriqueQwen3.5-0.8B-50Langs, desarrollado por el grupo McGill-NLP. Se trata de un modelo de lenguaje multimodal (texto e imagen) basado en la arquitectura Qwen3.5, sometido a un proceso de continued pretraining sobre 50 lenguas africanas y otras lenguas de relevancia regional. El objetivo es ofrecer capacidades de procesamiento del lenguaje natural en idiomas tradicionalmente infrarrepresentados en los modelos de fundación.

Esta versión cuantizada, publicada por mradermacher, reduce el tamaño del modelo original (aproximadamente 1 000 millones de parámetros) a archivos de entre 0,5 y 0,8 GB, lo que permite su ejecución en hardware de gama baja, incluidas CPU y GPUs de consumo. Al tratarse de un modelo de visión, los archivos de proyección multimodal (mmproj) se distribuyen por separado en el repositorio estático asociado. La licencia CC-BY-4.0 permite su uso comercial con atribución, lo que lo convierte en una opción atractiva para proyectos que requieran soporte multilingüe africano sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5 |
| Parametros totales | 1 006 672 704 (aprox. 1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, entre otras |
| Idiomas soportados | 50 lenguas: afrikáans, amárico, árabe, inglés, francés, hausa, igbo, malgache, chichewa, oromo, portugués, kinyarwanda, shona, somalí, sesotho, suajili, tigriña, setsuana, xhosa, yoruba, zulú, kirundi, luganda, tsonga, lingala, ewé, wolof, sango, akan, twi, kabiye, bambara, sesotho del norte, fon, swazi, tamazight, cabilio, krio, n'ko, mossi, kimbundu, kituba, dyula, tamasheq, dinka, luo, fula, bemba, kikuyu, kamba, kikongo y lua |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base AfriqueQwen3.5-0.8B-50Langs parte de la arquitectura Qwen3.5, un transformer multimodal que procesa tanto texto como imágenes. Sobre esta base, McGill-NLP aplicó un continued pretraining con datos en 50 lenguas africanas y otras lenguas de la región, con el objetivo de mejorar la representación lingüística de estos idiomas en el modelo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO en la documentación consultada.

La versión publicada por mradermacher es una cuantización con imatrix (i1), que utiliza una matriz de importancia calculada sobre un conjunto de datos representativo para optimizar la asignación de bits durante la cuantización. Esto permite preservar mejor la calidad en los tamaños reducidos en comparación con cuantizaciones estáticas convencionales. El repositorio incluye un archivo imatrix de 0,1 GB que puede usarse para generar cuantizaciones personalizadas.

## Capacidades

- Generación de texto y comprensión del lenguaje natural en 50 lenguas africanas y otras lenguas (incluido inglés, francés, portugués y árabe).
- Procesamiento de imágenes (entrada multimodal) gracias a su arquitectura image-text-to-text, aunque el proyector de visión se distribuye por separado en el repositorio estático.
- Soporte conversacional: el modelo está etiquetado como "conversational", lo que indica que puede mantener diálogos multi-turno.
- Adecuado para tareas de traducción automática, resumen, extracción de información y generación de contenido en lenguas de bajos recursos.
- Compatible con el ecosistema de herramientas GGUF (llama.cpp, Ollama, LM Studio, etc.) gracias a su formato de pesos.

## Casos de uso

- Traducción automática entre lenguas africanas y lenguas globales: el modelo puede traducir textos entre suajili, yoruba, hausa y otras lenguas, facilitando la comunicación transfronteriza en contextos comerciales o administrativos.
- Asistentes virtuales locales: su tamaño reducido permite desplegarlo en dispositivos móviles o servidores modestos para ofrecer atención al cliente en lenguas como el amárico, el wolof o el zulú.
- Procesamiento de documentos gubernamentales: ministerios y ONGs pueden usarlo para resumir o extraer información de documentos oficiales redactados en lenguas locales, reduciendo la dependencia de traductores humanos.
- Educación y alfabetización digital: el modelo puede generar materiales educativos, ejercicios o explicaciones en lenguas minoritarias, ayudando a preservar y promover su uso.
- Análisis de sentimiento en redes sociales: al comprender múltiples lenguas africanas, permite monitorizar opiniones y tendencias en plataformas como X o Facebook en regiones donde estas lenguas son predominantes.
- Transcripción y asistencia en atención sanitaria: combinado con un sistema de reconocimiento de voz, puede ayudar a transcribir consultas médicas en lenguas como el kikuyu o el luganda, mejorando la documentación clínica.
- Desarrollo de aplicaciones de chat comunitarias: su licencia permisiva y su tamaño permiten integrarlo en aplicaciones de mensajería para ofrecer respuestas automáticas en lenguas locales sin coste por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el conjunto de tareas específico antes de su adopción en producción.

## Requisitos de hardware

- El modelo cuantizado ocupa entre 0,5 y 0,8 GB según la cuantización elegida, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, Raspberry Pi 5 con 8 GB, etc.).
- Para inferencia en CPU, es viable en procesadores modernos con 4 GB de RAM libre; se recomienda usar cuantizaciones Q4_K_M o superiores para un equilibrio razonable entre velocidad y calidad.
- GPUs recomendadas: cualquier GPU NVIDIA con 2 GB o más (GTX 1650, RTX 2060, etc.) o GPUs integradas recientes con soporte Vulkan.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o servidores de inferencia compatibles con GGUF (vLLM no soporta GGUF nativamente, pero puede convertirse a safetensors).
- Latencia estimada: en una GPU moderna, la generación de tokens debería ser de decenas de tokens por segundo; en CPU, entre 5 y 20 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-0.8B-50Langs (base) | ~1B | No disponible | 50 lenguas africanas + otras | CC-BY-4.0 | safetensors |
| AfriqueQwen3.5-4B-ExtendedCM | ~4B | No disponible | 21 lenguas | CC-BY-4.0 | GGUF |
| Qwen3.5-0.8B (original) | ~0.8B | No disponible | Multilingüe (sin enfoque africano) | Apache 2.0 (probable) | safetensors |

La versión cuantizada aquí descrita ofrece una ventaja en tamaño y facilidad de despliegue frente al modelo base, a costa de una ligera pérdida de calidad por la cuantización. El modelo de 4B de la misma familia ofrece mayor capacidad pero requiere más recursos. El Qwen3.5 original no está especializado en lenguas africanas, por lo que su rendimiento en estos idiomas será previsiblemente inferior.

## Limitaciones y advertencias

- Al ser un modelo de aproximadamente 1 000 millones de parámetros, su capacidad de razonamiento complejo y generación de código es limitada en comparación con modelos de mayor tamaño.
- La cuantización, especialmente en los niveles más bajos (IQ1, IQ2), puede degradar significativamente la calidad de las respuestas y aumentar la probabilidad de alucinaciones.
- No se ha verificado el rendimiento en tareas de visión; el proyector de imágenes (mmproj) debe obtenerse por separado y su compatibilidad con esta cuantización no está garantizada.
- La licencia CC-BY-4.0 exige atribución al autor original en cualquier redistribución o uso público, lo que debe tenerse en cuenta en productos comerciales.
- No se dispone de información sobre la longitud de contexto soportada, por lo que se recomienda probar con secuencias cortas para evitar errores de memoria.
- El modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en lenguas con pocos recursos donde los corpus suelen ser limitados y poco diversos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-0.8B-50Langs-i1-GGUF
- Repositorio estático (cuantizaciones sin imatrix y mmproj): https://huggingface.co/mradermacher/AfriqueQwen3.5-0.8B-50Langs-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-0.8B-50Langs
- Modelo relacionado (4B): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-ExtendedCM-GGUF
- Guía de fine-tuning de Qwen3.5 (Unsloth): https://unsloth.ai/docs/models/qwen3.5/fine-tune
