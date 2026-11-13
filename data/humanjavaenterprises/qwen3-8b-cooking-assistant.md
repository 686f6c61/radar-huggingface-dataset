# HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant

## Resumen

Qwen3-8B Cooking-Assistant es un ajuste fino (fine-tune) del modelo Qwen3-8B de Alibaba, publicado por HumanjavaEnterprises bajo licencia Apache 2.0. Está especializado en asistencia culinaria y su rasgo distintivo no es memorizar recetas, sino un comportamiento aprendido: cuando el usuario pregunta por detalles de una receta que no le ha proporcionado, el modelo pide la receta en lugar de inventar cantidades o pasos. Según la model card, este comportamiento reduce la fabricación de detalles del 25,8 % (modelo base) al 2,7 % cuando tres de cada cuatro jueces lo confirman. El modelo conserva la arquitectura, tokenizer y plantilla de chat de Qwen3-8B, con 8.190.735.360 parámetros y pesos en bf16 (unos 16 GB en safetensors).

El ajuste se realizó en dos etapas: un LoRA supervisado seguido de un LoRA de preferencias (DPO) sobre él, ambos fusionados en un único modelo denso. Mantiene el soporte multilingüe de 26 idiomas del modelo base y, según el autor, puede ejecutarse en una GPU de 6 GB con cuantización Q4_K_M. La relevancia actual reside en su enfoque de "comportamiento con LoRA, hechos con recuperación, números con herramientas": el modelo está pensado para integrarse en aplicaciones que recuperan la receta y calculan conversiones, no para sustituirlas.

La publicación incluye además un conjunto de evaluación propio (HumanjavaEnterprises/cooking-assistant-eval) y una metodología de evaluación con cuatro jueces abiertos, lo que la convierte en un ejemplo de ajuste fino pequeño con procedencia trazable y controles publicados junto a sus fallos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue de vLLM usa `--max-model-len 8192`) |
| Tipos de cuantización | bf16 (safetensors); GGUF con Q4_K_M citado explícitamente (repositorio hermano GGUF) |
| Idiomas soportados | 26 idiomas: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros, y conserva la misma arquitectura, tokenizer y plantilla de chat. El ajuste se realizó en dos fases: primero un LoRA supervisado y después un LoRA de preferencias (DPO) sobre el anterior. Ambas etapas se fusionan en un único modelo bf16, por lo que no hay adaptadores separados en el despliegue. La plantilla de chat es la de Qwen3 con el modo de razonamiento desactivado (`enable_thinking: false` o `/no_think` en el turno de usuario), y el sistema se entrenó con un prompt de sistema específico de asistente culinario.

El objetivo del entrenamiento es enseñar comportamiento, no hechos: el modelo aprende a leer la receta incluida en el turno del usuario y a solicitar la receta cuando falta, en lugar de rellenar huecos. El autor declara el uso exclusivo de fuentes abiertas o de dominio público y que cada registro de entrenamiento es trazable a su origen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de DPO (hiperparámetros, pares de preferencia).

## Capacidades

- Generación de texto conversacional en el dominio culinario: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura de recetas proporcionadas en el contexto: responde preguntas basándose en el texto pegado en el turno de usuario.
- Abstención y petición de información: cuando una pregunta requiere una receta no mostrada, solicita la cantidad o receta original en lugar de inventar datos.
- Respuesta a preguntas generales de cocina (sustituciones, causas de fallos, seguridad alimentaria) a un nivel comparable al modelo base.
- Multilingüismo en 26 idiomas, incluyendo español, portugués, italiano, francés, alemán, neerlandés, ruso, japonés, chino, coreano (no listado), árabe, hindi, bengalí, tamil, malayo, tailandés, vietnamita, filipino, hebreo, malayalam, persa, indonesio, sueco, finlandés, polaco y turco.
- Modo de razonamiento desactivable: entrenado con thinking off, lo que reduce latencia y evita cadenas de pensamiento innecesarias en producción.
- Integración con Transformers, vLLM, text-generation-inference y, vía GGUF, con llama.cpp, Ollama y LM Studio.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni agentes multi-paso.

## Casos de uso

- Asistente de cocina en aplicación móvil o web: el modelo recibe la receta (pegada por el usuario o recuperada por la aplicación) y responde preguntas sobre cantidades, tiempos y sustituciones, leyendo directamente del texto proporcionado en lugar de inventar detalles.
- Chatbot de atención al cliente para una marca de alimentos: gestiona conversaciones multi-turno sobre ingredientes, alérgenos y conservación, con la ventaja de que pide la información que le falta en lugar de fabricar datos, lo que reduce respuestas erróneas en un dominio sensible.
- Generación de contenido culinario con verificación: redactar fichas de recetas o artículos donde el sistema recupera la receta fuente y el modelo la adapta al formato, manteniendo trazabilidad y minimizando la invención de cantidades.
- Control de calidad de recetarios digitales: procesar recetas existentes y detectar preguntas frecuentes de usuarios, usando la abstención para señalar ambigüedades en lugar de completarlas con supuestos.
- Asistente de seguridad alimentaria: responder sobre temperaturas de cocción, conservación y riesgos, con comportamiento entrenado para admitir incertidumbre en lugar de improvisar datos críticos.
- Despliegue en hardware de consumo: con cuantización Q4_K_M y una GPU de 6 GB, sirve como asistente local en una aplicación de escritorio o doméstica, sin dependencia de la nube.
- Demostración de ajuste fino responsable: como ejemplo reproducible de LoRA + DPO con dataset de evaluación publicado y metodología de cuatro jueces, útil para equipos que quieran replicar el flujo en otro dominio.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un conjunto fijo de 682 preguntas en 26 idiomas, nunca usado en entrenamiento: 290 con receta mostrada, 10 de recuerdo sin receta, 300 que requieren una receta no mostrada y 82 generales. La comparación se hizo contra el modelo base Qwen3-8B con thinking off y un juez de pesos abiertos de otra familia (DeepSeek-V4-Flash, licencia MIT), ciego y en ambos órdenes.

| Métrica | Qwen3-8B | Este modelo |
|---|---|---|
| Inventa detalles de receta sin receta mostrada | 30,0 % [25,1; 35,4] | 9,0 % [6,3; 12,8] |
| Ídem, tras comprobación de reglas que elimina falsos positivos del juez | 27,7 % | 4,0 % [2,3; 6,9] |
| Correcto con receta mostrada (290 preguntas) | 87,6 % | 96,2 % |
| Preferido por el juez, todas las 682 preguntas | — | 0,610 [0,581; 0,639] (0,50 = empate) |
| Preferido por el juez, solo preguntas generales | — | 0,460 [0,369; 0,549] (nivel con el base) |

Con cuatro jueces abiertos (DeepSeek-V4-Flash, Qwen3.8-27B Apache-2.0, GLM-4.7-Flash MIT y gpt-oss-120b Apache-2.0) y la misma comprobación de reglas:

| Criterio de "inventa" | Qwen3-8B | Este modelo |
|---|---|---|
| Al menos 3 de 4 jueces lo afirman | 25,8 % [21,1; 31,0] | 2,7 % [1,4; 5,2] |
| Los cuatro jueces lo afirman | 19,1 % | 1,0 % |
| Cualquier juez lo afirma | 49,2 % | 18,3 % |

La reducción de invenciones es estadísticamente significativa (McNemar p < 1e-10; 78 preguntas donde solo inventa el base, 15 donde solo inventa este modelo). No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Inferencia en bf16: pesos de ~16 GB, por lo que se requiere una GPU con al menos 16-20 GB de VRAM (A100 40 GB, H100, L40S, RTX 4090 24 GB o A6000 48 GB).
- Inferencia en Q4_K_M: según el autor, cabe en una GPU de 6 GB, lo que permite ejecución en tarjetas consumer como RTX 3060, RTX 4060 o superiores.
- Despliegue con Transformers (bf16) o vLLM: `vllm serve HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant --max-model-len 8192`, con `chat_template_kwargs: {"enable_thinking": false}`.
- Despliegue en CPU o GPU modesta mediante GGUF con llama.cpp, Ollama (`ollama run vveerrgg/qwen3-8b-cooking-assistant:v1`) y LM Studio, usando el repositorio GGUF hermano.
- Compatible con text-generation-inference según los tags del repositorio.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Cooking-Assistant (este) | 8,19 B | No disponible | 2,7 % de invención sin receta (3 de 4 jueces); 96,2 % de acierto con receta | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Qwen3-8B (base) | 8,19 B | No disponible | 25,8 % de invención sin receta; 87,6 % de acierto con receta | Apache 2.0 | Hugging Face |
| Modelos culinarios de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de otros modelos especializados en cocina con los que comparar parámetros, contexto o resultados de forma fiable. La comparación más sólida disponible es contra el propio modelo base Qwen3-8B, que se incluye arriba.

## Limitaciones y advertencias

- El modelo no memoriza recetas: su rendimiento depende de que la aplicación le proporcione la receta o los datos; sin ellos, pide información en lugar de responder, lo que puede percibirse como menos útil en consultas informales.
- Está entrenado para abstenerse, pero la tasa de invención no es cero: entre el 1,0 % y el 18,3 % de las preguntas sin receta contienen detalles inventados según el criterio de los jueces.
- No se documenta tool calling ni capacidad de agente; los cálculos de escalado y conversión de unidades deben hacerse fuera del modelo, tal como recomienda el autor.
- El rendimiento en preguntas generales de cocina es equivalente al modelo base, no superior.
- El ajuste se realizó con el modo thinking desactivado; activarlo puede degradar el comportamiento entrenado.
- Es un fine-tune no oficial de Qwen3-8B, no respaldado por Alibaba Cloud ni por el equipo Qwen.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las condiciones del modelo base.
- Riesgo de sesgos heredados del modelo base y de los datos de entrenamiento, no cuantificado en la información disponible.
- La evaluación se apoya en jueces automáticos de pesos abiertos, no en evaluación humana; los intervalos de confianza son amplios en algunas métricas.
- No se publican datos sobre latencia, throughput, consumo de memoria en producción ni comportamiento con contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Perfil del autor: https://huggingface.co/HumanjavaEnterprises
