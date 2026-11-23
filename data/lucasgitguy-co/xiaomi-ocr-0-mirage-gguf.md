# Lucasgitguy-co/Xiaomi-OCR-0-Mirage-GGUF

## Resumen

Xiaomi-OCR-0-Mirage-GGUF es una conversión a formato GGUF del modelo multimodal Xiaomi-OCR-0, desarrollado originalmente por Xiaomi Research para tareas de reconocimiento óptico de caracteres y parseo de documentos. Esta versión, publicada por el usuario Lucasgitguy-co, empaqueta los pesos cuantizados para su uso con llama.cpp e incorpora Mirage, un detector de texto de 54 millones de parámetros de Cactus Compute que se ejecuta de forma auxiliar para asignar coordenadas de caja a las líneas de texto reconocidas.

El modelo base cuenta con aproximadamente 949 millones de parámetros y adopta una arquitectura de tipo image-text-to-text, es decir, recibe imágenes y genera texto. Su propósito es doble: por un lado, la transcripción OCR de documentos, escenas y recibos; por otro, la extracción estructurada de campos mediante prompts con esquema, como demuestra su evaluación sobre CORD v2. La licencia Apache-2.0 del modelo base facilita su integración en productos comerciales.

La relevancia de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo OCR de casi mil millones de parámetros en hardware de consumo mediante cuantización, con métricas publicadas por el autor de la conversión (OCRBench, distancia de edición en documentos y F1 en CORD) que permiten comparar el impacto de cada nivel de cuantización frente a la referencia BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (modelo base Xiaomi-OCR-0); Mirage como detector de texto auxiliar de 54M parametros |
| Parametros totales | 949.514.976 (pesos safetensors del modelo base); el par recomendado Q8_0 + mmproj ocupa 949.514.976 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K-imat, Q4_K_M-imat; mmproj en Q8_0 y F16 |
| Idiomas soportados | no disponible; la evaluacion de documentos incluye paginas en ingles y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Xiaomi-OCR-0 es un modelo multimodal de tipo image-text-to-text orientado a OCR y parseo de documentos, con aproximadamente 949 millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo original de Xiaomi Research.

La innovación principal de esta publicación no está en el modelo base, sino en el pipeline de conversión y evaluación. Los pesos se convirtieron con el conversor de llama.cpp en el commit `1b6935b` y se cuantizaron con la build 12359. El autor aplica una regla de aceptación predefinida: OCRBench dentro de 10 preguntas de la referencia BF16, distancia de edición documental como máximo 0,010 peor, F1 de CORD como máximo 1,0 punto peor y un tamaño de archivo inferior a 10^9 bytes. También documenta un intento fallido de destilación DWQ (entrenamiento de las escalas de cuantización de 4 bits contra el modelo BF16), que solo superó a la cuantización simple en 1 de 3 benchmarks y divergió en la variante de 6 bits; por ello todas las cuantizaciones publicadas son simples.

Mirage, de Cactus Compute, es un detector y lector de texto de 54 millones de parámetros que solo funciona dentro del motor `cactus-compute`. Su código de entrenamiento y forward pass no son públicos, por lo que no puede fusionarse ni destilarse en Xiaomi-OCR-0; se ejecuta en paralelo dentro de `mirage_ocr.py`. Se limita a escritura latina y no detectó texto en 163 de las 1000 imágenes de OCRBench que sí contenían texto, por lo que nunca se usa para decidir que una imagen está vacía.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de documentos, escenas y recibos.
- Parseo de documentos con salida de texto normalizado y extracción de campos mediante prompts con esquema (evaluado en CORD v2 con el esquema de campos de CORD).
- Generación de coordenadas de caja (0-1000) por línea de texto cuando se usa el pipeline Mirage con `--json`, emparejando cada línea con la caja de Mirage de mayor similitud difusa (ratio >= 70).
- Modo de razonamiento (thinking) configurable: el ejemplo desactiva el thinking con `"chat_template_kwargs": {"enable_thinking": false}` y en el servidor con `--reasoning off`.
- Procesamiento de imágenes con control del número de tokens visuales (`--image-min-tokens 64`, `--image-max-tokens 16384`).
- API compatible con OpenAI a través de `llama-server` para integración en aplicaciones existentes.
- Soporte de decodificación greedy determinista recomendada (`--temp 0 --repeat-penalty 1`).
- Capacidad de zoom sobre regiones con texto (opción `--zoom`): probada pero desactivada por defecto al no superar la regla pre-registrada.
- Capacidades multilingües: no disponibles en detalle; la evaluación documental cubre inglés y chino.

## Casos de uso

- Digitalización masiva de facturas y recibos: el modelo puede extraer campos estructurados con el esquema de CORD y obtener un F1 de 77,18 a 78,10 según la cuantización, adecuado para pipelines de contabilidad donde se prioriza el coste por página sobre la precisión absoluta.
- Procesamiento de documentos escaneados en local: al ejecutarse con llama.cpp en Apple Silicon vía Metal, permite desplegar OCR sin enviar documentos sensibles a servicios en la nube, cumpliendo requisitos de privacidad.
- Extracción de texto con coordenadas para maquetación: usando `mirage_ocr.py --json`, cada línea reconocida se acompaña de una caja en coordenadas 0-1000, útil para reconstruir el orden de lectura o superponer resultados sobre la imagen original.
- Atención al cliente con capturas y documentos: la API compatible con OpenAI de `llama-server` permite integrar el modelo en un backend existente para transcribir tickets, capturas o formularios enviados por usuarios.
- Indexación de archivos históricos: la cuantización Q4_K_M-imat ocupa 746.890.176 bytes y mantiene un OCRBench de 841, lo que la hace viable para procesar grandes volúmenes en hardware modesto donde el espacio en disco y la RAM son limitados.
- Prototipado rápido de pipelines OCR: la opción `--no-mirage` permite ejecutar únicamente Xiaomi-OCR-0, reduciendo dependencias y facilitando pruebas comparativas antes de incorporar el detector de cajas.
- Evaluación de calidad de digitalización: las métricas publicadas (distancia de edición en OmniDocBench y F1 en CORD) sirven como referencia para comparar el rendimiento de la cuantización elegida frente al modelo BF16 antes de desplegar en producción.

## Benchmarks y rendimiento

| Version | Bytes | OCRBench (/1000) | Doc NED (menor mejor) | CORD F1 |
|---|---:|---:|---:|---:|
| MLX BF16 (referencia) | 1.726.071.379 | 843 | 0,0829 | 77,55 |
| transformers BF16 (pesos originales) | 1.766.940.039 | 843 | 0,0823 | 78,18 |
| GGUF Q8_0 + mmproj Q8_0 | 949.514.976 | 847 | 0,0836 | 78,10 |
| GGUF Q6_K-imat + mmproj F16 | 851.527.104 | 844 | 0,0834 | 77,55 |
| GGUF Q6_K + mmproj F16 | 851.526.880 | 842 | 0,0823 | 77,70 |
| GGUF Q4_K_M-imat + mmproj F16 | 746.890.176 | 841 | 0,0908 | 77,18 |
| MLX 6-bit plain | 833.276.908 | 846 | 0,0844 | 77,67 |
| MLX 4-bit DWQ | 645.299.748 | 831 | 0,0888 | 78,58 |
| MLX 4-bit plain | 645.303.148 | 836 | 0,0877 | 77,23 |

Notas metodológicas publicadas por el autor: OCRBench se evalúa sobre las 1000 preguntas con la regla oficial de subcadena, con un error estándar de aproximadamente ±1,2 puntos, por lo que diferencias de pocas preguntas son ruido. La distancia de edición documental se mide sobre 100 páginas de OmniDocBench (50 en inglés, 50 en chino) y es una aproximación, no la puntuación oficial. CORD v2 se evalúa sobre 100 recibos del conjunto de test con F1 de campo. Todas las ejecuciones usan la misma imagen preparada (redimensionado propio de Xiaomi: lado largo de 2048 px, rejilla de 32 px), prompt sin thinking, decodificación greedy y sin penalización de repetición. La ejecución MLX BF16 obtuvo 843 en OCRBench, coincidiendo con el 84,6 reportado por Xiaomi.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el par Q8_0 + mmproj Q8_0 ocupa 949.514.976 bytes (aproximadamente 0,95 GB); Q6_K + mmproj F16, 851.527.104 bytes (aproximadamente 0,85 GB); Q4_K_M-imat + mmproj F16, 746.890.176 bytes (aproximadamente 0,75 GB). Estas cifras corresponden a los pesos; debe añadirse el consumo del contexto y del servidor.
- GPU recomendadas: no se especifican en la información disponible. Las mediciones publicadas se realizaron con `llama-server` en Apple Silicon (Metal).
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (inferior a 1 GB en todas las variantes publicadas), aunque no se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector multimodal; el bundle `Xiaomi-OCR-0-Mirage-bundle.gguf` debe desempaquetarse antes con `gguf_bundle.py unpack` porque llama.cpp no puede ejecutarlo directamente. El pipeline Mirage requiere `cactus-compute==4.2.0`, `rapidfuzz`, `pillow` y `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de servidor recomendados: `-c 16384 --temp 0 --repeat-penalty 1 --jinja --reasoning off --image-min-tokens 64 --image-max-tokens 16384`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OCRBench | Licencia | Formato |
|---|---|---:|---:|---|---|
| Xiaomi-OCR-0-Mirage-GGUF (Q8_0) | 949.514.976 | no disponible | 847 | Apache-2.0 | GGUF |
| Xiaomi-OCR-0 (BF16, original) | 949.514.976 | no disponible | 843 (segun evaluacion del autor) | Apache-2.0 | safetensors |
| Xiaomi-OCR-0-Mirage (MLX BF16) | 949.514.976 | no disponible | 843 | Apache-2.0 | MLX |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos OCR comparables (por ejemplo, de otras familias) que permitan una comparación cruzada rigurosa. La comparativa se limita, por tanto, a las variantes del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- La información sobre sesgos del modelo base no está disponible en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad más allá de las métricas de OCR y extracción de campos.
- La ventana de contexto no se especifica; el ejemplo de despliegue usa 16384 tokens, pero no se confirma que sea el máximo del modelo.
- Los idiomas soportados no se detallan; la evaluación documental solo cubre inglés y chino, y Mirage únicamente reconoce escritura latina.
- Mirage no detectó texto en 163 de 1000 imágenes de OCRBench que sí contenían texto, por lo que no debe usarse para determinar que una imagen está vacía.
- El modo de zoom de Mirage está desactivado por defecto: en las pruebas redujo OCRBench de 843 a 802 y no cumplió la regla pre-registrada.
- El modelo DWQ de 4 bits no se publica porque solo superó a la cuantización simple en 1 de 3 benchmarks y la variante de 6 bits divergió.
- `cactus-compute` envía recuentos de uso anónimos salvo que se defina `CACTUS_TELEMETRY=0`; `mirage_ocr.py` ya lo establece a 0.
- El bundle GGUF no es ejecutable directamente por llama.cpp y requiere desempaquetado previo.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de Mirage (Apache-2.0 según la model card) antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-GGUF
- Versión BF16 (transformers): https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage
- Versión MLX: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-MLX
- Modelo base Xiaomi-OCR-0: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Mirage (Cactus Compute): https://huggingface.co/Cactus-Compute/mirage
