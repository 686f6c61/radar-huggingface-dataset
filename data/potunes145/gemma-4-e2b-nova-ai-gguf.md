# Potunes145/gemma-4-e2b-nova-ai-gguf

## Resumen

El modelo `Potunes145/gemma-4-e2b-nova-ai-gguf` es un finetune del modelo Gemma 4 E2B de Google, convertido a formato GGUF mediante la herramienta Unsloth. Se presenta como un modelo de lenguaje y visión (vision-language-model) orientado a ejecución local y despliegue en entornos con recursos limitados. Aunque el modelo base original de Google, Gemma 4 E2B, está diseñado para ser ultraligero (2.1 mil millones de parámetros según fuentes externas), los safetensors de este repositorio indican un total de 4.647.450.147 parámetros, lo que sugiere que el finetune podría haber ampliado la arquitectura o que el conteo incluye el proyector de visión. El repositorio incluye dos archivos: un GGUF cuantizado en Q4_K_M para el modelo principal y un proyector multimodal en F16 (mmproj).

La relevancia de este modelo radica en su formato GGUF, que permite su uso directo con llama.cpp, llama-cli y Ollama (con ciertas limitaciones para visión), facilitando la inferencia en CPU y GPU de consumo. Al ser un finetune de un usuario (Potunes145), no se dispone de documentación oficial sobre el proceso de entrenamiento, los datos utilizados ni la licencia, lo que limita su uso en producción sin una evaluación adicional. A pesar de ello, su tamaño moderado y su naturaleza multimodal lo convierten en una opción interesante para prototipos y aplicaciones de procesamiento de imágenes y texto en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con proyector de vision (modelo multimodal, segun tags y archivos mmproj) |
| Parametros totales | 4.647.450.147 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 4 E2B tiene 8K, no confirmado para este finetune) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Por el nombre y los archivos incluidos, se trata de un modelo multimodal que combina un codificador de vision con un modelo de lenguaje, probablemente basado en la arquitectura Transformer de Gemma 4 E2B. El finetune fue realizado con Unsloth, una libreria que acelera el entrenamiento y la conversion a GGUF, pero no se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El modelo base de Google, Gemma 4 E2B, segun fuentes externas, es un modelo de solo texto con 2.1 mil millones de parametros y contexto de 8K, pero este repositorio presenta un conteo mayor, lo que podria indicar una variante ampliada o la inclusion del proyector de vision en el conteo total. No se han publicado detalles tecnicos adicionales.

## Capacidades

- Generacion de texto y comprension de lenguaje natural, con enfoque conversacional (tag "conversational").
- Procesamiento de imagenes y texto (vision-language-model), lo que permite responder a entradas visuales.
- Ejecucion en formato GGUF compatible con llama.cpp, llama-cli y herramientas derivadas.
- Soporte para inferencia en CPU y GPU gracias a la cuantizacion Q4_K_M.
- No se confirma soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.

## Casos de uso

- Asistente de descripcion de imagenes: el modelo puede recibir una imagen y generar una descripcion textual detallada, util para accesibilidad o catalogacion automatica de contenido visual.
- Chatbot multimodal local: al ser un GGUF ligero, puede integrarse en aplicaciones de escritorio o moviles que requieran respuestas conversacionales con entrada de imagen, sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de vision por computador: los desarrolladores pueden probar tareas como respuesta a preguntas sobre imagenes (VQA) en entornos locales antes de escalar a modelos mas grandes.
- Educacion y demostraciones: su tamaño moderado permite ejecutarlo en portatiles con GPU modesta o incluso en CPU, facilitando talleres y ejemplos practicos de modelos multimodales.
- Analisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir informacion de imagenes de documentos, aunque se requiere validar la precision.
- Integracion en pipelines de datos con llama.cpp: al ser un GGUF, puede usarse en scripts de Python o C++ para procesamiento por lotes de imagenes y texto en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este finetune especifico.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M, con 4.647 millones de parametros, se estima un uso de memoria de aproximadamente 2.5-3 GB (calculado a partir del tamaño del archivo GGUF, aunque no se proporciona el tamano exacto). El proyector F16 anade unos cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en modo GPU. Tambien es viable en CPU con 8 GB de RAM, aunque la latencia sera mayor.
- Compatibilidad con consumer GPU: si, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, llama-cli, llama-mtmd-cli (para multimodal), Ollama (con la salvedad de que no soporta archivos mmproj separados, por lo que requiere un Modelfile especial), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se proporcionan datos concretos. En una GPU moderna (RTX 3090), se espera una generacion de decenas de tokens por segundo, pero es una estimacion sin confirmar.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo base Gemma 4 E2B de Google (solo texto, 2.1B, contexto 8K) es la referencia mas cercana, pero este finetune anade capacidades multimodales y un mayor numero de parametros. Alternativas como Phi-3-vision o LLaVA podrian ser comparables en cuanto a tareas de vision y lenguaje, pero no se han encontrado benchmarks que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones especificas del finetune.
- La licencia no esta declarada, por lo que su uso comercial es incierto y requiere consultar con el autor.
- La falta de documentacion sobre el proceso de entrenamiento y los datos utilizados impide evaluar la calidad y robustez del modelo en produccion.
- El numero de parametros difiere del modelo base oficial (2.1B vs 4.6B), lo que sugiere posibles modificaciones arquitectonicas no documentadas; se recomienda verificar el comportamiento real.
- Ollama no soporta archivos mmproj separados, por lo que la integracion con vision requiere pasos adicionales.
- Al ser un repositorio con 0 descargas y 0 likes, no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Potunes145/gemma-4-e2b-nova-ai-gguf
- Modelo base de Google: https://huggingface.co/google/gemma-4-E2B
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Repositorio de Qualcomm con GGUF de Gemma 4 E2B: https://huggingface.co/qualcomm-ai-hub-community/gemma-4-E2B-it-qat-GGUF
