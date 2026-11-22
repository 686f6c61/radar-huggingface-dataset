# mradermacher/Synaps-PL-Small-4B-GGUF

## Resumen

Synaps-PL-Small-4B-GGUF es la versión cuantizada en formato GGUF del modelo Synaps-PL-Small-4B, publicado por el usuario mradermacher a partir de los pesos originales de Synaptivo. Se trata de una adaptación al polaco de un modelo base de la familia Qwen 3.5, afinada mediante SFT (supervised fine-tuning) y con un adaptador LoRA ya fusionado en los pesos finales. El resultado es un modelo pequeño, de aproximadamente 333 millones de parámetros según los safetensors del repositorio, aunque el nombre comercial sugiere una escala de 4B.

El propósito del modelo es ofrecer generación de texto y conversación en polaco con un coste de inferencia bajo, empaquetado en GGUF para su uso con llama.cpp y herramientas compatibles. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales. Al estar cuantizado en múltiples precisiones (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS), está pensado para ejecutarse en hardware de consumo.

La relevancia actual radica en la existencia de un ecosistema creciente de modelos pequeños especializados por idioma que permiten despliegues locales y privados sin depender de APIs. No obstante, la información pública disponible sobre el modelo original es muy limitada: no se detallan datos de entrenamiento, benchmarks ni arquitectura interna más allá de la etiqueta "qwen3_5".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "qwen3_5" en la model card; detalles no disponibles) |
| Parametros totales | 333.514.240 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo base como perteneciente a la familia "qwen3_5" y describe el proceso de ajuste como SFT con un adaptador LoRA fusionado ("lora-merged"). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se detalla si la arquitectura incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos.

El repositorio cuantizado incluye además ficheros `mmproj` (suplemento multimodal), lo que sugiere que el modelo base podría tener capacidades de visión o al menos soporte para proyección multimodal en el pipeline de llama.cpp. No obstante, esta capacidad no se documenta explícitamente en la información disponible.

## Capacidades

- Generación de texto en polaco, orientada a conversación y completado.
- Ajuste por SFT, lo que implica un comportamiento alineado con instrucciones, aunque sin detalles sobre el dataset utilizado.
- Posible soporte multimodal por la presencia de ficheros `mmproj` en el repositorio, si bien no se confirma ni se detalla en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al polaco según la etiqueta de idioma.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes conversacionales en polaco para atención al cliente: el modelo puede gestionar diálogos multi-turno en dicho idioma con un coste de inferencia bajo, adecuado para despliegues en local o en servidores modestos.
- Generación de borradores de texto en polaco: redacción de correos, resúmenes o publicaciones a partir de instrucciones, aprovechando el ajuste SFT para seguir indicaciones.
- Procesamiento de documentos en polaco en pipelines privados: al ejecutarse en formato GGUF con llama.cpp, permite tratar datos sensibles sin enviarlos a APIs externas.
- Prototipado rápido de aplicaciones NLP en polaco: su tamaño reducido y su licencia Apache 2.0 permiten integrarlo en pruebas de concepto sin coste de licencia.
- Traducción asistida polaco-español o polaco-inglés como paso intermedio: útil para preprocesar contenido antes de un modelo mayor, aunque la calidad no está documentada.
- Educación y experimentación: servir como modelo de referencia para estudiar el efecto del fine-tuning SFT y la cuantización en un idioma de recursos medios como el polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~333 M de parámetros, las cuantizaciones Q4_K_M ocupan del orden de 0,2-0,3 GB, y F16 alrededor de 0,7 GB; los ficheros `mmproj` añaden 0,5-0,8 GB si se usa el pipeline multimodal.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también cabe en iGPU y en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera un throughput alto en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Synaps-PL-Small-4B-GGUF | ~333 M (según safetensors) | no disponible | pl | Apache 2.0 | GGUF |
| Qwen2.5-0.5B-Instruct | ~494 M | 32 768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | ~1,2 B | 131 072 | multilingüe | Llama 3.2 Community | safetensors, GGUF |

La comparación es aproximada: no hay datos de rendimiento del modelo Synaps que permitan una evaluación cuantitativa frente a estas alternativas. La principal ventaja diferencial es su especialización en polaco y su licencia permisiva; la desventaja es la ausencia de documentación técnica y de benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo ajustado sobre datos no especificados, puede heredar sesgos del corpus de entrenamiento.
- Riesgo de alucinación: no evaluado; en modelos pequeños es habitual, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: solo se declara soporte de polaco; la longitud de contexto no está publicada, lo que impide planificar su uso en documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento, no documentados.
- Caveats para producción: no hay benchmarks, ni información sobre robustez, ni guía de prompting; el nombre "4B" del identificador no coincide con los ~333 M de parámetros de los safetensors, lo que genera ambigüedad sobre el tamaño real.
- El repositorio cuantizado tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Synaps-PL-Small-4B-GGUF
- Modelo base: https://huggingface.co/Synaptivo/Synaps-PL-Small-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Synaps-PL-Small-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
