# mradermacher/Qwen3-VL-4B-Trithemius-GGUF

## Resumen

Qwen3-VL-4B-Trithemius-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Carlosian/Qwen3-VL-4B-Trithemius, un ajuste fino de Qwen3-VL-4B orientado a OCR histórico. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp. El modelo base parte de la familia Qwen3-VL de Alibaba, con 4.022.468.096 parámetros totales (aproximadamente 4B) y arquitectura vision-language transformer.

El modelo está especializado en el reconocimiento de texto en impresos históricos: latín, alemán e inglés de la época moderna temprana, incluyendo tipografía gótica (blackletter). Resuelve el problema del OCR sobre digitalizaciones de libros antiguos, donde los modelos OCR genéricos fallan por la tipografía, la ortografía arcaica y la degradación del escaneo.

Esta ficha se centra en la versión GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y variantes. El repositorio ocupa 37,7 GB e incluye cuantizaciones estáticas desde Q2_K hasta f16, además de los proyectores multimodales mmproj en Q8_0 y f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3-VL) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | la, de, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-VL-4B, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La model card del repositorio GGUF no documenta la arquitectura interna detallada, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo base.

El ajuste fino de Carlosian está orientado a OCR histórico y a la transcripción de impresos de la época moderna temprana, con etiquetas explícitas de latín, alemán, inglés y blackletter. La cuantización de mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye, según el autor, cuantizaciones ponderadas o imatrix en el momento de la publicación. Se proporcionan ficheros mmproj separados para el procesamiento multimodal.

## Capacidades

- Generación de texto y razonamiento conversacional en latín, alemán e inglés.
- Procesamiento de imágenes (vision-language) mediante el proyector mmproj.
- OCR de impresos históricos: reconocimiento de tipografía gótica (blackletter), ortografía arcaica y textos latinos.
- Transcripción de documentos digitalizados de la época moderna temprana.
- Conversación multimodal (imagen + texto) en los tres idiomas declarados.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de libros antiguos: el modelo recibe la imagen de una página escaneada y devuelve la transcripción del texto latino, alemán o inglés, aprovechando su ajuste específico sobre tipografía gótica y ortografía de la época moderna temprana.
- Creación de corpus textuales para humanidades digitales: transcripción masiva de fondos digitalizados para alimentar búsquedas y análisis lingüísticos sobre latín y alemán histórico.
- Investigación filológica: extracción de pasajes concretos de ediciones príncipe para su cotejo entre testimonios, con un modelo que entiende la grafía arcaica.
- Archivística y bibliotecas digitales: generación de metadatos y texto completo buscable a partir de imágenes de incunables y libros del XVI-XVIII.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (2,5 GB) y Q4_K_M (2,6 GB) permiten ejecutar el modelo en portátiles y estaciones con GPU modesta mediante llama.cpp, sin necesidad de servidores dedicados.
- Prototipado de pipelines OCR locales: integración en herramientas de escritorio o scripts que procesan lotes de imágenes sin enviar documentos a servicios en la nube, útil por motivos de confidencialidad de fondos.
- Enseñanza e investigación académica: experimentación con modelos multimodales pequeños en entornos con recursos limitados gracias a la licencia Apache 2.0 y a los múltiples tamaños de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector visual):
  - Q2_K: ~1,8 GB de pesos; en torno a 2,5-3 GB en ejecución.
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB de pesos; en torno a 3,5-4 GB en ejecución.
  - Q8_0: ~4,4 GB de pesos; en torno a 5,5-6 GB en ejecución.
  - f16: ~8,2 GB de pesos; en torno a 10 GB en ejecución.
  - Añadir 0,6 GB (mmproj Q8_0) o 0,9 GB (mmproj f16) para el procesamiento de imágenes.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q8; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o inferiores; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM y TGI, aunque la información no lo confirma para la versión GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Trithemius (este, GGUF) | ~4,0B | no disponible | la, de, en | apache-2.0 | GGUF |
| Carlosian/Qwen3-VL-4B-Trithemius (base) | ~4,0B | no disponible | la, de, en | apache-2.0 | safetensors |
| Qwen3-VL-4B (modelo original de Alibaba) | ~4,0B | no disponible | multilingüe | no disponible en esta ficha | safetensors, GGUF |
| Otros OCR históricos especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de OCR histórico queda limitada por la ausencia de datos de benchmarks y de modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino está especializado en OCR histórico; su rendimiento en tareas generales de visión o conversación puede ser inferior al del Qwen3-VL-4B original.
- Los idiomas declarados son únicamente latín, alemán e inglés; no hay evidencia de soporte para castellano u otras lenguas.
- Riesgo de alucinación en la transcripción de textos degradados o tipografías poco representadas en el entrenamiento; conviene validar con muestras humanas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q8_0 cuando la fidelidad es crítica.
- No se han publicado cuantizaciones ponderadas o imatrix para este modelo en el momento de la publicación, lo que puede afectar a la calidad relativa frente a otros GGUF.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL puede estar sujeto a condiciones adicionales de Alibaba que no se detallan en esta información.
- No hay datos publicados sobre sesgos, longitud de contexto efectiva ni robustez frente a dominios distintos del OCR histórico.
- El repositorio ocupa 37,7 GB; conviene descargar solo la cuantización y el mmproj necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-VL-4B-Trithemius-GGUF
- Modelo base: https://huggingface.co/Carlosian/Qwen3-VL-4B-Trithemius
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-Trithemius-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
