# mradermacher/Gemma-SEA-LION-v4-4B-VL-GGUF

## Resumen

Gemma-SEA-LION-v4-4B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal aisingapore/Gemma-SEA-LION-v4-4B-VL, desarrollado originalmente por AI Singapore (AISG) dentro de la familia SEA-LION (Southeast Asian Languages In One Network). El modelo base parte de Google Gemma 3 (4B, variante con visión) y ha sido adaptado para lenguas del sudeste asiático. Esta ficha cubre específicamente la redistribución GGUF publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face.

El modelo resuelve el problema de la baja cobertura de las lenguas del sudeste asiático (vietnamita, indonesio, tailandés, filipino, tamil, malayo y birmano) en los LLM abiertos, añadiendo capacidades de visión sobre una base Gemma 3. Con 3.880.263.168 parámetros reales (aproximadamente 3,9B) y licencia MIT, es adecuado para despliegue local en hardware de consumo mediante llama.cpp u Ollama.

La relevancia de esta publicación es doble: por un lado, ofrece acceso práctico a un modelo multilingüe regional en cuantizaciones que van desde 1,8 GB (Q2_K) hasta 7,9 GB (f16), incluyendo el proyector multimodal mmproj necesario para el procesamiento de imágenes. Por otro, demuestra el interés de la comunidad por modelos de nicho geográfico con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 3), con proyector de visión mmproj |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, my |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Esta publicacion es una cuantizacion, no un entrenamiento. El modelo base aisingapore/Gemma-SEA-LION-v4-4B-VL hereda la arquitectura de Gemma 3 en su variante de 4B con capacidad de visión: un transformer decoder-only con modulo de atencion multimodal y un proyector de visión (mmproj) que traduce las representaciones visuales al espacio del modelo de lenguaje. La adaptacion de SEA-LION se centra en el post-entrenamiento sobre datos de las lenguas del sudeste asiatico, aunque los detalles concretos de volumen de tokens, composicion del dataset y uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

La innovacion de esta publicacion concreta es la conversion a GGUF con cuantizaciones K-quant e IQ, incluyendo un fichero mmproj separado (Q8_0 y f16) que preserva la capacidad multimodal en llama.cpp. mradermacher indica que las cuantizaciones con imatrix (pesos ponderados) estan disponibles en un repositorio paralelo (Gemma-SEA-LION-v4-4B-VL-i1-GGUF), lo que suele mejorar la calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional multi-turno en nueve idiomas, con enfasis en lenguas del sudeste asiatico.
- Procesamiento de imagenes y razonamiento visual a traves del proyector mmproj (vision-language).
- Comprension y generacion en vietnamita, indonesio, tailandes, filipino, tamil, malayo y birmano, ademas de ingles y chino.
- Razonamiento basico y respuesta a instrucciones, heredado del post-entrenamiento del modelo base.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servidores tipo OpenAI API.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en lenguas del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en vietnamita, tailandes o indonesio, cubriendo mercados regionales con un unico despliegue en lugar de varios modelos por idioma.
- Procesamiento de documentos con OCR ligero y comprension visual: gracias al mmproj, puede extraer informacion de capturas, formularios o imagenes de producto con texto en lenguas regionales, util en digitalizacion de archivos administrativos.
- Moderacion de contenido multimodal: clasificacion de imagenes y texto en comunidades online de la region (foros, marketplaces) con una licencia MIT que permite uso comercial sin restricciones.
- Despliegue en el borde (edge): con cuantizaciones Q4_K_S de 2,5 GB, cabe en portatiles y mini-PC con 8 GB de RAM, permitiendo asistentes locales para personal de campo sin conexion a la nube.
- Traduccion asistida y localizacion: generacion de borradores de traduccion entre ingles y lenguas SEA, con revision humana posterior, adecuado para equipos de producto que localizan interfaces.
- Investigacion linguistica aplicada: evaluacion comparativa de modelos abiertos en lenguas de bajos recursos, usando las distintas cuantizaciones para analizar la degradacion por compresion.
- Prototipado rapido de asistentes con vision: demos de preguntas y respuestas sobre imagenes en ollama o llama.cpp sin necesidad de GPU dedicada, gracias al tamano contenido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: desde ~2,5 GB (Q4_K_S) hasta ~8 GB (f16), incluyendo el mmproj de 0,7-1,0 GB adicional si se usa vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 solo si se sirven muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas para cuantizaciones Q4; las Q2/Q3 caben incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints (tag endpoints_compatible); vLLM y TGI no aplican directamente a GGUF, aunque existen variantes del modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; a modo orientativo, un modelo de ~4B en Q4 suele generar decenas de tokens por segundo en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL (esta ficha, GGUF) | ~3,9B | no disponible | si (7 lenguas SEA + en/zh) | si | MIT | GGUF |
| Gemma 3 4B (base) | ~4B | no disponible | limitado | si | Gemma Terms | safetensors/GGUF |
| SEA-LION v3 (modelos previos) | variable | no disponible | si | no disponible | no disponible | safetensors |
| Qwen2.5-VL 3B | ~3B | no disponible | parcial (chino/ingles) | si | Apache 2.0 | safetensors/GGUF |

La comparativa se limita a lo verificable: la ventaja principal frente a Gemma 3 base es la cobertura de lenguas SEA y la licencia MIT; frente a Qwen2.5-VL 3B, la especializacion regional es mayor aunque el soporte de vision y contexto no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Al ser una cuantizacion, las versiones Q2/Q3 pueden degradar notablemente la calidad, especialmente en tareas multilingues y de vision; se recomienda Q4_K_M o superior para produccion.
- El modelo base es de ~4B parametros: la profundidad de razonamiento y el conocimiento factual son limitados frente a modelos de 7B o mas.
- Riesgo de alucinacion inherente a los LLM de este tamano, agravado en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- La licencia MIT se aplica a esta redistribucion, pero conviene verificar los terminos del modelo base (Gemma) por si hubiera condiciones adicionales de uso derivadas de la familia original.
- No se dispone de informacion sobre sesgos especificos, contexto maximo real ni soporte de tool calling; no asumir estas capacidades sin validacion empirica.
- El repositorio ocupa 37,3 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario y el mmproj correspondiente si se usa vision.
- Idiomas no SEA (espanol, frances, aleman) no estan declarados oficialmente; su rendimiento no esta garantizado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-4B-VL-GGUF
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-4B-VL-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma-SEA-LION-v4-4B-VL-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
