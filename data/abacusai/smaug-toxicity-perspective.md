# abacusai/Smaug-Toxicity-Perspective

## Resumen

Smaug-Toxicity-Perspective es un clasificador de toxicidad multilingüe desarrollado por Abacus.AI. Devuelve las siete atributos del API Perspective de Google (TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT, SEXUALLY_EXPLICIT) como probabilidades calibradas y se distribuye junto a un servidor que responde a peticiones del API Perspective con el mismo formato JSON. Esto permite a los equipos que migran fuera del API Perspective antes de su cierre el 31 de diciembre de 2026 mantener su código y cambiar únicamente una URL.

El modelo se basa en `jhu-clsp/mmBERT-base`, un encoder ModernBERT de 22 capas, tamaño oculto 768 y 12 cabezas de atención, con atención local de 128 tokens y atención global cada tercera capa. Cuenta con 307.535.623 parámetros y procesa ventanas de 256 tokens, puntuando textos más largos mediante ventanas solapadas en el servidor incluido.

Su relevancia actual radica en que ofrece una alternativa abierta y reproducible (Apache 2.0) a un servicio propietario en proceso de descontinuación, con un rendimiento en ranking de toxicidad superior al de clasificadores abiertos de propósito general como los de Horizon-Labs y Detoxify, y con muchas menos falsas alarmas que los modelos guardián basados en LLM de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder: 22 capas, hidden size 768, 12 cabezas de atención, atención local (128 tokens) con atención global cada tercera capa |
| Parámetros totales | 307.535.623 (308M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens; el servidor incluido puntúa textos más largos en ventanas solapadas |
| Tipos de cuantización | safetensors float32; ONNX float32 (exacto), ONNX 8-bit (por defecto en CPU, casi exacto) y ONNX dynamic int8 (transformers.js) |
| Idiomas soportados | Multilingüe: en, ar, am, cs, de, es, fr, he, hi, id, it, ja, ko, nl, pl, pt, ru, sv, tt, uk, zh (evaluado en 21 idiomas más Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) y ONNX (float32, 8-bit, dynamic int8) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT afinado completamente (full finetune) a partir de `jhu-clsp/mmBERT-base`. La arquitectura combina atención local de 128 tokens con atención global cada tercera capa, lo que reduce el coste computacional en secuencias largas manteniendo el acceso global al contexto. La cabeza de clasificación produce siete probabilidades independientes (multi-label) correspondientes a los atributos del API Perspective, con calibración por atributo mediante temperatura plegada en la propia cabeza de clasificación.

El entrenamiento parte de un profesor XLM-R-large (560M) entrenado sobre los mismos datos, del que el modelo destila. Los datos incluyen inglés, Civil Comments traducido a más de 30 idiomas, texto nativo en árabe, amárico y tártaro, y texto web en 17 idiomas más prompts en inglés que llevan las puntuaciones propias del API Perspective. Además, se destiló sobre las puntuaciones del profesor para 374.000 segmentos web nativos en hebreo, hinglish, tártaro y ucraniano. Los conjuntos de datos citados incluyen google/civil_comments, Horizon-Labs/civil-comments-multilingual, afrihate/afrihate, HuggingFaceFW/fineweb-2, allenai/real-toxicity-prompts, ToxicityPrompts/PolygloToxicityPrompts y HPLT/HPLT2.0_cleaned. Las filas de entrenamiento no se publican.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con siete atributos independientes del API Perspective: TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT y SEXUALLY_EXPLICIT.
- Salida de probabilidades calibradas por atributo, adecuadas para umbrales operativos reproducibles.
- Servidor compatible con el formato JSON del API Perspective, lo que permite sustituir la URL sin cambios de código.
- Soporte multilingüe en 21 idiomas más Hinglish, con entrenamiento específico en árabe, amárico, tártaro, hebreo y ucraniano.
- Procesamiento de textos largos mediante ventanas solapadas de 256 tokens en el servidor incluido.
- Exportaciones ONNX para inferencia en CPU y en navegador mediante transformers.js.
- Reproducibilidad de las puntuaciones fijando un commit del repositorio.
- Integración con la librería transformers (pipeline de text-classification) y con text-embeddings-inference (endpoints compatibles).

## Casos de uso

- Moderación de comentarios en plataformas de contenido: el modelo puntúa cada comentario con las siete probabilidades del API Perspective y permite aplicar umbrales por atributo para ocultar, revisar o escalar contenido, con la ventaja de que el servidor incluido responde en el mismo JSON que el API Perspective.
- Migración desde el API Perspective antes de su cierre: los equipos pueden cambiar la URL del servicio por el servidor de Smaug-Toxicity-Perspective y conservar su lógica de umbrales y su formato de respuesta, ajustando el umbral según la sección de calibración de la model card.
- Moderación multilingüe en foros y redes sociales: al cubrir 21 idiomas más Hinglish con un único modelo, se evita mantener clasificadores separados por idioma y se obtiene un ranking consistente entre lenguas.
- Filtrado de datasets de entrenamiento: el modelo puede puntuar grandes volúmenes de texto web (por ejemplo, fineweb-2) para eliminar contenido tóxico antes de usarlo en el entrenamiento de otros modelos, con un throughput de aproximadamente 2.200 comentarios por segundo en una H100.
- Despliegue en el navegador o en el borde: la exportación ONNX dynamic int8 para transformers.js permite ejecutar la clasificación en cliente sin enviar el texto a un servidor, útil para aplicaciones de mensajería o comentarios en tiempo real.
- Servicio de moderación en CPU de bajo coste: con 22 ms por comentario en 4 hilos de CPU (ONNX 8-bit en Apple M5), el modelo puede desplegarse en contenedores Docker sin GPU para volúmenes moderados.
- Investigación en trust and safety: al ser Apache 2.0 y reproducible por commit, sirve como línea base abierta para comparar clasificadores de toxicidad y para estudiar el sesgo y la calibración de las puntuaciones.

## Benchmarks y rendimiento

Los datos disponibles en la model card son los siguientes:

| Evaluación | Smaug-Toxicity-Perspective | Horizon-Labs multilingual-toxicity-base | Detoxify multilingual | Qwen3Guard-Gen-8B |
|---|---|---|---|---|
| TextDetox ROC AUC | 89,0 | 85,4 | 67,8 | No disponible |
| F1 al umbral 0,5 | 65,2 | 43,3 | No disponible | No disponible |
| AUC frente a toxicidad (ranking) | 88,4 | No disponible | No disponible | 84,6 |
| Porcentaje de comentarios limpios marcados | 8,1% | No disponible | No disponible | 38,8% |
| Cobertura de tóxicos al umbral 0,5 | 59% | No disponible | No disponible | 88% |
| Concordancia con Perspective al umbral 0,8 (inglés no visto en entrenamiento) | 95% | 18% | No disponible | No disponible |
| Concordancia con Perspective al umbral 0,8 (texto web multilingüe) | 85% | No disponible | No disponible | No disponible |

Además, la model card indica que, al umbral 0,8, el modelo marca 1,2 veces más textos en inglés y 1,9 veces más textos multilingües que el API Perspective, por lo que recomienda ajustar el umbral para mantener el volumen de marcado. El modelo ONNX 8-bit coincide con float32 en el 99,9% de las decisiones al umbral 0,5. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 308M parámetros, la inferencia en float32 requiere aproximadamente 1,2 GB de pesos; en ONNX 8-bit se reduce a unos 0,3 GB.
- GPU recomendadas: una H100 ofrece aproximadamente 2.200 comentarios por segundo en bfloat16; cualquier GPU consumer reciente (por ejemplo, RTX 4090) es sobradamente suficiente para este tamaño de modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM en float32 o 1 GB en 8-bit; también funciona en CPU.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js, text-embeddings-inference (endpoints compatibles) y el servidor Docker para CPU incluido por el autor.
- Latencia y throughput: 22 ms por comentario en 4 hilos de CPU con ONNX 8-bit (Apple M5); aproximadamente 2.200 comentarios por segundo en una H100 en bfloat16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smaug-Toxicity-Perspective | 308M | Ventanas de 256 tokens | Clasificador multi-etiqueta de 7 atributos Perspective, multilingüe | Apache 2.0 | Hugging Face, ONNX, Docker |
| Horizon-Labs multilingual-toxicity-base | No disponible | No disponible | Clasificador de toxicidad multilingüe de propósito general | No disponible | Hugging Face |
| Detoxify multilingual | No disponible | No disponible | Clasificador de toxicidad multilingüe de propósito general | No disponible | Hugging Face |
| Qwen3Guard-Gen-8B | 8B (aproximado) | No disponible | LLM guardián generativo de seguridad | No disponible | Hugging Face |

Según los datos de la model card, Smaug-Toxicity-Perspective supera en ROC AUC de TextDetox a Horizon-Labs multilingual-toxicity-base (89,0 frente a 85,4) y a Detoxify multilingual (89,0 frente a 67,8), y en ranking de toxicidad a Qwen3Guard-Gen-8B (88,4 frente a 84,6) con un 8,1% de falsas alarmas frente al 38,8% de este último. Frente al API Perspective, es el modelo abierto que más se aproxima a su ordenación de textos en inglés y en 17 idiomas.

## Limitaciones y advertencias

- El modelo marca más textos que el API Perspective al mismo umbral (1,2 veces en inglés y 1,9 veces en multilingüe al umbral 0,8), por lo que es necesario recalibrar el umbral para mantener el volumen de marcado.
- Al umbral 0,5, la cobertura de textos tóxicos es del 59%, inferior al 88% de Qwen3Guard-Gen-8B, aunque con muchas menos falsas alarmas; la elección del umbral depende del equilibrio deseado entre cobertura y precisión.
- Es un clasificador de toxicidad, no un modelo generativo: no razona, no genera texto ni soporta tool calling ni agentes.
- La evaluación se limita a 21 idiomas más Hinglish; el rendimiento en idiomas no evaluados no está documentado.
- Los datos de entrenamiento no se publican (solo se listan los conjuntos de datos), lo que limita la auditoría completa del comportamiento del modelo.
- Como todo clasificador de toxicidad, puede heredar sesgos de los datos de anotación y de las puntuaciones del API Perspective usadas como referencia, especialmente en variedades dialectales y en lenguaje coloquial.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio y de cumplir la normativa aplicable en materia de moderación de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Toxicity-Perspective
- Página de Abacus.AI: https://abacus.ai
- Organización Abacus.AI en Hugging Face: https://huggingface.co/abacusai
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de referencia (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
