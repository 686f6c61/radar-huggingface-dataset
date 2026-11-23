# openamer-max/openamer-max-watch

## Resumen

OpenAmer-Max-Watch es un modelo de generación de texto de 0,6B parámetros desarrollado por openamer-max, el escalón más pequeño de una familia de modelos diseñada para ejecutarse de forma local y offline. Se construye como un ajuste fino mediante LoRA (r=128) sobre Qwen3-0.6B, con el objetivo declarado de responder con precisión a preguntas sobre el propio producto OpenAmer (instalación, plataformas, costes, privacidad, licencia) y de mantener conversación en alemán y bosnio, además de inglés.

La relevancia del modelo no reside en su capacidad general, sino en su enfoque de ingeniería: el autor documenta de forma explícita que el ajuste se realizó con trabajo de datos dirigido por errores, y que el resultado de 45/45 en un conjunto congelado de preguntas de producto se obtiene a costa de un rendimiento ligeramente inferior al de la base sin entrenar en tareas generales (12/20 frente a 13/20). Es, por tanto, un caso interesante de ajuste estrecho y honesto sobre un modelo muy pequeño.

El modelo se distribuye en formato GGUF (Q8_0, 639 MB) y está pensado para ejecutarse en dispositivos de gama baja, incluidos teléfonos Android mediante Ollama. Su contexto máximo de entrenamiento es de 40.960 tokens, insuficiente para el agente OpenAmer completo, que requiere al menos 64.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) con ajuste LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (máximo de entrenamiento); mayor coincidencia medida 39.322 tokens (96 %) |
| Tipos de cuantizacion | Q8_0 (única publicada en esta etapa); no hay Q6 en esta versión |
| Idiomas soportados | de, bs, hr, sr, en (alemán, bosnio, croata, serbio, inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (openamer-max-watch-q8.gguf, 639 MB); adaptador LoRA r=64 en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6B parámetros, sobre el que se aplica un ajuste LoRA con r=128 y 161 millones de parámetros entrenables, distribuido en 15 etapas de entrenamiento. Según la model card, el proceso se reinició tras esas etapas con r=128 y tres épocas para consolidar el resultado final. El ajuste se centró en datos generados a partir de fallos: para cada caso fallido se crearon ejemplos que cubren la habilidad subyacente (mantener el idioma, distinguir polaridad, seguir formato) en lugar de replicar la pregunta de examen.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El autor sí indica que el conjunto de 45 casos de producto funciona como protección contra regresiones y que la evaluación real de mejora se realiza sobre un conjunto fresco de 20 casos (A2), nunca visto en entrenamiento.

## Capacidades

- Generación de texto conversacional en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas sobre OpenAmer: instalación, plataformas, costes, privacidad y licencia.
- Manejo de texto en bosnio sin diacríticos.
- Respuestas concisas y seguimiento estricto de formato ("responde con una palabra", "solo el número").
- Reconocimiento de honestidad ante preguntas cuya respuesta no se conoce.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- No se documentan capacidades de matemáticas o razonamiento multietapa más allá de operaciones con números pequeños.

## Casos de uso

- Asistente de soporte de producto OpenAmer: el modelo responde preguntas frecuentes sobre instalación, plataformas y licencia con alta precisión en el conjunto de evaluación congelado (45/45), adecuado para un chatbot de FAQ embebido en la web o en la app.
- Chat local en dispositivos de gama baja: con 639 MB en Q8_0 y ~1,5 GB de RAM, puede ejecutarse en teléfonos Android mediante Ollama, ofreciendo conversación offline sin cuenta ni nube.
- Atención en alemán y bosnio para usuarios de la región: cubre ambos idiomas y variantes sin diacríticos, útil para soporte multilingüe en mercados de Europa central y los Balcanes.
- Generación de respuestas con formato controlado: su capacidad de seguir instrucciones del tipo "responde con una palabra" o "solo la cifra" lo hace útil en pipelines que necesitan salidas estructuradas simples (clasificación, extracción de campos).
- Filtro de honestidad y abstención: puede emplearse como componente que detecta preguntas sin respuesta conocida y deriva a un humano o a otra fuente, reduciendo alucinaciones en dominios acotados.
- Prototipado y pruebas de integración: al ser un GGUF pequeño con licencia Apache-2.0, sirve para validar pipelines de inferencia local (Ollama, llama.cpp) antes de escalar a modelos mayores de la familia.
- Uso educativo y de investigación sobre ajuste fino: el autor documenta el proceso de entrenamiento por etapas y la evaluación con conjuntos frescos, lo que lo convierte en un caso de estudio reproducible de LoRA sobre modelos pequeños.

## Benchmarks y rendimiento

| Evaluación | Esta versión (etapa 24) | Versión anterior (etapa 9) | Qwen3-0.6B sin entrenar |
|---|---|---|---|
| Preguntas de producto (45 casos congelados) | 45/45 (100,0 %) | 37/45 (82,2 %) | 23/45 (51,1 %) |
| Tareas generales (20 casos frescos, A2) | 12/20 (60 %) | 10/20 (50 %) | 13/20 (65 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,5 GB de RAM en Q8_0 (639 MB de pesos).
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y ejecución local en dispositivos de gama baja.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en teléfonos Android mediante Ollama.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-watch`), llama.cpp y cualquier runtime compatible con GGUF. No se documenta soporte explícito para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Max-Watch | 0,6B | 40.960 | Apache-2.0 | GGUF Q8_0 | Ajuste LoRA especializado en producto OpenAmer; 45/45 en conjunto congelado, 12/20 en general |
| Qwen3-0.6B (base) | 0,6B | no disponible en la información | Apache-2.0 | safetensors, GGUF | 23/45 en producto, 13/20 en general; mejor base general |
| OpenAmer-Max-Phone | 3,1B | no disponible | Apache-2.0 (según familia) | GGUF | 43/45 en el mismo conjunto; mayor tamaño y RAM (~3,5 GB) |
| OpenAmer-Max-Tab | 7,6B | no disponible | Apache-2.0 (según familia) | GGUF | 42/45; ~6 GB de RAM |

## Limitaciones y advertencias

- Razonamiento multietapa y matemáticas limitadas a números pequeños; no apto para tareas de cálculo complejo.
- Conocimiento del mundo poco fiable por su tamaño (0,6B); el autor lo reconoce explícitamente.
- No genera textos largos libres con calidad.
- Contexto máximo de 40.960 tokens, insuficiente para el agente OpenAmer (requiere 64.000); no puede ejecutar ese agente.
- Rendimiento general ligeramente inferior a la base sin entrenar (12/20 frente a 13/20), como coste del ajuste especializado.
- Riesgo de alucinación en preguntas fuera del dominio de producto; el modelo incorpora cierta capacidad de abstención, pero no es garantía.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan restricciones adicionales ni garantías.
- Solo se publica Q8_0 en esta etapa; no hay Q6 ni otras cuantizaciones de esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-watch
- Adaptador LoRA: https://huggingface.co/openamer-max/openamer-max-watch-adapter
- Web del proyecto: https://openamer-max.github.io
- Página de dispositivos (Gerätepass): https://openamer-max.github.io/geraetepass/
- Página Android: https://openamer-max.github.io/android.html
- Código fuente: https://github.com/openamer-max/openamer
- Informe de medición de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Donaciones: https://www.paypal.com/qrcodes/p2pqrc/BVZD4HRJ9G6YG
