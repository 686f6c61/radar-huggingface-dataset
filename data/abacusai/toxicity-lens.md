# abacusai/Toxicity-Lens

## Resumen

Toxicity-Lens es un clasificador de toxicidad multilingüe desarrollado por Abacus.AI y publicado con licencia Apache 2.0. Se trata de un finetune completo del encoder `jhu-clsp/mmBERT-base`, un transformer ModernBERT de 22 capas, 768 dimensiones ocultas y 307.535.623 parámetros. El modelo devuelve siete probabilidades calibradas correspondientes a los atributos de la Perspective API de Google (TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT y SEXUALLY_EXPLICIT), lo que lo convierte en un sustituto directo de ese servicio.

Su relevancia inmediata es operativa: Google ha anunciado el cierre de la Perspective API el 31 de diciembre de 2026, y Toxicity-Lens incluye un servidor que responde en el mismo formato JSON que Perspective, de modo que los equipos pueden migrar cambiando únicamente la URL del endpoint. El modelo se ha destilado a partir de un profesor XLM-R-large de 560M entrenado sobre los mismos datos, y se distribuye en safetensors float32 y en exportaciones ONNX float32, 8-bit y dynamic int8 para transformers.js.

La propuesta de valor se centra en tres ejes medibles: mayor AUC que clasificadores abiertos comparables en 15 idiomas según el benchmark publicado por Horizon-Labs, menor tasa de falsos positivos que guards basados en LLM mucho mayores (Qwen3Guard-Gen-8B) y un comportamiento más cercano a la propia Perspective API que cualquier modelo abierto probado por el autor, tanto en inglés como en 17 idiomas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder: 22 capas, hidden size 768, 12 cabezas de atencion, atencion local (128 tokens) con atencion global cada tercera capa |
| Parametros totales | 307.535.623 (308M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventanas de 256 tokens por puntuacion; el servidor incluido puntua textos largos en ventanas solapadas |
| Tipos de cuantizacion | safetensors float32; ONNX float32 (exacto), ONNX 8-bit (por defecto en CPU, casi exacto) y ONNX dynamic int8 (transformers.js) |
| Idiomas soportados | Entrenado en ingles, Civil Comments traducido a mas de 30 idiomas, arabe, amharico y tatar nativos, y texto web en 17 idiomas mas ingles; evaluado en 21 idiomas mas hinglish. Idiomas declarados: en, ar, am, cs, de, es, fr, he, hi, id, it, ja, ko, nl, pl, pt, ru, sv, tt, uk, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) y ONNX (float32, 8-bit, dynamic int8) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe. ModernBERT sustituye la atención completa clásica por una combinación de atención local de 128 tokens y atención global cada tercera capa, lo que reduce el coste computacional manteniendo capacidad de modelar dependencias largas. Sobre esa base se realiza un finetune completo con una cabeza de clasificación multi-etiqueta que produce siete probabilidades independientes, una por atributo de Perspective. La calibración se aplica mediante temperatura por atributo, plegada dentro de la cabeza de clasificación, de modo que las salidas son probabilidades calibradas y no logits en bruto.

El entrenamiento combina varias fuentes: `google/civil_comments`, `Horizon-Labs/civil-comments-multilingual`, `afrihate/afrihate`, `HuggingFaceFW/fineweb-2`, `allenai/real-toxicity-prompts`, `ToxicityPrompts/PolygloToxicityPrompts` y `HPLT/HPLT2.0_cleaned`. Parte de los datos incluye las puntuaciones publicadas por la propia Perspective API, lo que explica que el modelo ordene los textos de forma más parecida a Perspective que los alternativos. Además, se destila sobre las puntuaciones del profesor en 374.000 segmentos web escritos nativamente en hebreo, hinglish, tatar y ucraniano, y el modelo final se obtiene por destilación de un profesor XLM-R-large de 560M entrenado sobre los mismos datos. Las filas de entrenamiento no se publican.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con siete salidas independientes y calibradas: TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT y SEXUALLY_EXPLICIT.
- Puntuación de textos de hasta 256 tokens por ventana, con agregación por ventanas solapadas para documentos más largos en el servidor incluido.
- Cobertura multilingüe evaluada en 21 idiomas más hinglish, con especial énfasis en inglés, árabe, amhárico, tatar, hebreo y ucraniano.
- Compatibilidad de API con Perspective: el servidor incluido responde en el mismo formato JSON, lo que permite sustituir el endpoint sin reescribir el cliente.
- Exportaciones ONNX para despliegue en CPU (8-bit por defecto) y en navegador vía transformers.js (dynamic int8).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto. Su única función es la clasificación.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comentarios en plataformas UGC: el modelo puntúa cada comentario con siete atributos calibrados y permite aplicar umbrales distintos por atributo (por ejemplo, 0,8 para THREAT y 0,5 para INSULT) para ajustar la agresividad de la moderación sin reentrenar.
- Migración desde Perspective API: al replicar el formato JSON de Perspective, un equipo puede redirigir su cliente existente al servidor de Toxicity-Lens y validar la paridad de flags antes del cierre del servicio en diciembre de 2026.
- Moderación multilingüe en foros internacionales: la cobertura de 21 idiomas evaluados y el entrenamiento con Civil Comments traducido permiten desplegar un único modelo en lugar de un clasificador por idioma.
- Filtrado previo en pipelines de datos de entrenamiento: con 2.200 comentarios por segundo en una H100 y 22 ms por comentario en 4 hilos de CPU, el modelo puede cribar corpus web (por ejemplo, FineWeb-2 o HPLT) para eliminar contenido tóxico antes de usarlo en el entrenamiento de LLM.
- Moderación en el navegador o en el borde: la exportación dynamic int8 para transformers.js permite ejecutar la clasificación en el cliente sin enviar el texto a un servidor, útil para chat y comentarios en aplicaciones web.
- Monitorización de comunidades y alertas de trust and safety: la salida calibrada por atributo facilita definir alertas específicas (por ejemplo, IDENTITY_ATTACK por encima de 0,7) y priorizar revisiones humanas.
- Evaluación de red teaming y auditoría de modelos: el clasificador puede puntuar las salidas de un LLM generativo para medir tasas de toxicidad en evaluaciones comparativas entre versiones.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con el código de evaluación de Horizon-Labs sobre su benchmark:

| Metrica | Toxicity-Lens | Horizon-Labs multilingual-toxicity-base | Detoxify multilingual | Qwen3Guard-Gen-8B |
|---|---|---|---|---|
| TextDetox ROC AUC | 89,0 | 85,4 | 67,8 | no disponible |
| F1 a umbral 0,5 | 65,2 | 43,3 | no disponible | no disponible |
| AUC (comparacion con guard LLM) | 88,4 | no disponible | no disponible | 84,6 |
| Porcentaje de comentarios limpios marcados | 8,1% | no disponible | no disponible | 38,8% |
| Cobertura de flags de Perspective a umbral 0,8 (ingles, texto no visto) | 95% | 18% | no disponible | no disponible |
| Cobertura de flags de Perspective a umbral 0,8 (texto web multilingue) | 85% | no disponible | no disponible | no disponible |

Rendimiento declarado: 22 ms por comentario en 4 hilos de CPU con la exportación ONNX 8-bit sobre Apple M5, con concordancia del 99,9% respecto a float32 en las decisiones a umbral 0,5; aproximadamente 2.200 comentarios por segundo en una H100 en bfloat16. A umbral 0,8 el modelo marca 1,2 veces más textos en inglés y 1,9 veces más en multilingüe que Perspective, por lo que la model card remite a la sección 6 para ajustar el umbral y mantener el volumen de flags.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float32 ocupa aproximadamente 1,2 GB de pesos (308M parámetros); en ONNX 8-bit baja a unos 300-350 MB. La inferencia en GPU requiere espacio adicional para activaciones, pero el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: H100 para throughput máximo (unas 2.200 puntuaciones por segundo en bfloat16); A100, L40S o RTX 4090 para despliegues de producción de menor volumen; cualquier GPU consumer con 4 GB o más para inferencia puntual.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes. También funciona en CPU: 22 ms por comentario en 4 hilos con ONNX 8-bit.
- Opciones de despliegue: transformers con safetensors, ONNX Runtime (float32, 8-bit o dynamic int8), transformers.js en navegador, servidor incluido compatible con Perspective API, y text-embeddings-inference según los tags del repositorio. vLLM y llama.cpp no aplican a un encoder de clasificación.
- Latencia y throughput: 22 ms por comentario en CPU (4 hilos, ONNX 8-bit) y aproximadamente 2.200 comentarios por segundo en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC TextDetox | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Toxicity-Lens | 308M | 256 tokens por ventana | 89,0 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| Horizon-Labs multilingual-toxicity-base | no disponible | no disponible | 85,4 | no disponible | Hugging Face |
| Detoxify multilingual | no disponible | no disponible | 67,8 | no disponible | Hugging Face |
| Qwen3Guard-Gen-8B | 8B (aprox.) | no disponible | 84,6 (AUC en la comparacion del autor) | no disponible | Hugging Face |

La comparación con Qwen3Guard-Gen-8B es especialmente relevante por la diferencia de tamaño: Toxicity-Lens obtiene mayor AUC con 27 veces menos parámetros y marca el 8,1% de comentarios limpios frente al 38,8% del guard basado en LLM. A umbral 0,5, Qwen3Guard detecta más texto tóxico (88% frente a 59%) precisamente porque marca mucho más en general.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no puede explicar sus decisiones ni generar texto; solo devuelve probabilidades por atributo.
- Riesgo de sesgo: al entrenarse en parte sobre Civil Comments y sus traducciones, puede heredar sesgos de anotación de esas fuentes, especialmente en la detección de IDENTITY_ATTACK sobre determinados grupos demográficos.
- Calibración dependiente del umbral: a 0,8 el modelo marca 1,2 veces más textos en inglés y 1,9 veces más en multilingüe que Perspective; es necesario recalibrar el umbral para mantener el volumen de flags en producción.
- Cobertura lingüística desigual: aunque se evalúa en 21 idiomas más hinglish, el entrenamiento nativo se concentra en árabe, amhárico, tatar, hebreo, hinglish y ucraniano; el resto de idiomas dependen en gran medida de traducciones de Civil Comments.
- Ventana de 256 tokens: los textos largos requieren agregación por ventanas solapadas, lo que puede introducir artefactos en los bordes de ventana.
- Las filas de entrenamiento no se publican, lo que limita la auditoría completa del dataset.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados.
- No sustituye la revisión humana en casos de THREAT o SEVERE_TOXICITY con consecuencias legales; debe usarse como señal de priorización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Toxicity-Lens
- Organización Abacus.AI en Hugging Face: https://huggingface.co/abacusai
- Página de Abacus.AI: https://abacus.ai
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de referencia citado en los tags: https://arxiv.org/abs/2509.06888
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset Civil Comments multilingüe de Horizon-Labs: https://huggingface.co/datasets/Horizon-Labs/civil-comments-multilingual
- Dataset AfriHate: https://huggingface.co/datasets/afrihate/afrihate
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset RealToxicityPrompts: https://huggingface.co/datasets/allenai/real-toxicity-prompts
- Dataset PolygloToxicityPrompts: https://huggingface.co/datasets/ToxicityPrompts/PolygloToxicityPrompts
- Dataset HPLT 2.0 cleaned: https://huggingface.co/datasets/HPLT/HPLT2.0_cleaned
