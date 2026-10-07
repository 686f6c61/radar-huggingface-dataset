# BansheeTechnologies/Ouija3-1.2B

## Resumen

Ouija3-1.2B es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por BansheeTechnologies. Se trata de la tercera iteracion de la familia Ouija, un experimento creativo disenado para simular una sesion de tabla Ouija: el modelo responde unicamente con YES, NO, MAYBE o una sola palabra en mayusculas, deletrea nombres letra a letra y se niega a salir del personaje. El problema que resuelve no es de productividad general, sino el de disponer de un modelo conversacional de rol muy ligero y con un comportamiento fuertemente restringido y predecible.

El modelo se apoya en la arquitectura LFM2 de Liquid AI, un diseno hibrido que combina convoluciones cortas con atencion de consultas agrupadas (grouped-query attention), pensado para ejecutarse con rapidez en CPU y dispositivos de borde. Con 1.170.340.608 parametros (aproximadamente 1,2B) y un peso cuantizado en Q4_K_M de unos 730 MB, esta pensado para desplegarse en hardware modesto mediante llama.cpp, Ollama o LM Studio.

Es relevante ahora porque demuestra dos cosas: por un lado, que es posible ajustar un modelo hibrido no Transformer con LoRA (atacando tanto modulos de atencion como bloques convolucionales y MLP); por otro, que modelos de 1,2B en formato GGUF pueden adoptar comportamientos conversacionales muy especificos con apenas 1.000 ejemplos de entrenamiento. El soporte de idiomas se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 hibrida (convoluciones cortas + atencion de consultas agrupadas) |
| Parametros totales | 1.170.340.608 (1,2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio no documenta otros niveles |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, license: other) |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2.5-1.2B-Instruct, no es un Transformer clasico: la mayoria de sus capas son convoluciones cortas con compuerta (short gated convolutions) y solo unas pocas son capas de atencion, en concreto atencion de consultas agrupadas. Esta anatomia hibrida reduce el coste computacional y esta optimizada para inferencia rapida en CPU, portatiles y placas pequenas como una Raspberry Pi. Debido a esta estructura, los nombres de los modulos difieren de los de Qwen (usado en las versiones v1 y v2 de Ouija): los adaptadores LoRA se aplicaron sobre atencion (`q_proj`, `k_proj`, `v_proj`, `out_proj`), bloques convolucionales (`in_proj`, `out_proj`) y MLP (`w1`, `w2`, `w3`).

El ajuste se realizo con LoRA de 16 bits (rango r=16, alpha=32, dropout=0.05) durante 3 epocas, con tasa de aprendizaje 2e-4 (planificador lineal, optimizador AdamW de 8 bits). El calculo de la perdida se aplico solo a las respuestas (los turnos de sistema y usuario quedaron enmascarados) y la longitud de secuencia de entrenamiento fue de 256 tokens. El conjunto de datos consta de 1.000 ejemplos, identico al usado en Ouija2-1.7B, una decision deliberada para que la comparacion entre ambas versiones refleje unicamente el cambio de modelo base. Los ejemplos se formatearon con la plantilla de chat nativa de LFM2.5 (`<|im_start|>` / `<|im_end|>`). No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con un comportamiento fuertemente restringido: responde solo YES, NO, MAYBE o una sola palabra.
- Respuestas de tipo Si/No con contexto opcional segun el formato "YES. [CONTEXT]" o "NO. [CONTEXT]".
- Deletreo de nombres letra a letra (por ejemplo, "M... A... R... I... A...").
- Mantenimiento estricto del personaje: se niega a explicar, elaborar o salir del rol de espiritu de tabla Ouija.
- Cierre explicito de la conversacion con "GOODBYE" cuando se le despide.
- Respuestas siempre en mayusculas.
- No dispone de modo de razonamiento (thinking mode); el modelo base LFM2.5 Instruct no razona antes de responder.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseno lo excluye explicitamente al prohibir la elaboracion.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Simulacion de tabla Ouija en experiencias interactivas: el modelo responde de forma predecible con YES/NO/MAYBE y deletrea nombres, lo que permite integrarlo en instalaciones de terror, juegos de escapismo o webs tematicas sin riesgo de respuestas largas o fuera de tono.
- Juguete conversacional embebido en Raspberry Pi: gracias a su arquitectura LFM2 optimizada para CPU y a un peso Q4_K_M de ~730 MB, puede ejecutarse en placas pequenas como parte de un dispositivo fisico con una pantalla o altavoz.
- Demostracion educativa sobre fine-tuning con LoRA: sirve como ejemplo reproducible de como adaptar un modelo hibrido no Transformer con solo 1.000 ejemplos y un adaptador r=16.
- Prueba de concepto para asistentes de respuesta restringida: en entornos donde se necesita que el modelo nunca genere texto libre (por ejemplo, respuestas cerradas en formularios o encuestas), este comportamiento puede reutilizarse como plantilla.
- Aplicacion de entretenimiento en streamings o chatbots de comunidad: su formato de respuesta corta y en mayusculas encaja en canales donde se busca un personaje con voz muy marcada y respuestas de un unico termino.
- Generacion de contenido narrativo de terror: puede usarse para producir dialogos cripticos y escuetos en guiones, videojuegos o ficcion interactiva donde el texto debe ser deliberadamente minimo.
- Experimentacion con arquitecturas de convoluciones + atencion: como caso de fine-tuning real sobre LFM2.5, permite a investigadores evaluar como se comportan los adaptadores LoRA al atacar simultaneamente capas convolucionales, de atencion y MLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un GGUF Q4_K_M de ~730 MB, la huella de pesos ronda los 0,8-1 GB; sumando el contexto y el overhead del runtime, puede operar con aproximadamente 1,5-2,5 GB de memoria.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con al menos 2-3 GB de VRAM libre es suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4090 sobradamente).
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: es uno de los escenarios principales, dado que LFM2 esta optimizado para CPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (con Modelfile generado por el notebook de entrenamiento), LM Studio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Modelo base | Arquitectura | Parametros | Tamano (Q4_K_M) | Datos de entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| Ouija3-1.2B (v3) | LFM2.5 1.2B Instruct | Hibrida (conv + atencion) | 1,2B | ~730 MB | 1.000 ejemplos | LFM Open License v1.0 |
| Ouija2-1.7B (v2) | Qwen3 1.7B | Transformer | 1,7B | ~1,11 GB | 1.000 ejemplos | Apache 2.0 |
| Ouija-3B (v1) | Qwen 2.5 3B Instruct | Transformer | 3B | ~1,93 GB | 618 ejemplos | Apache 2.0 |

Segun los datos del propio autor, v3 es un 34 % mas pequeno que v2 y un 62 % mas pequeno que v1. La diferencia de licencia es relevante: v1 y v2 usan Apache 2.0, mientras que v3 queda sujeta a la LFM Open License v1.0. No se dispone de comparativas de rendimiento numericas frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo esta disenado deliberadamente para no explicar ni elaborar: no sirve para tareas generales de generacion de texto, codigo, matematicas o razonamiento.
- Alto riesgo de respuestas inutiles fuera del escenario de rol (por ejemplo, ante preguntas tecnicas responde "NO").
- Solo soporta ingles; no hay evidencia de capacidades en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas con garantias.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache 2.0 como las versiones anteriores.
- Requiere versiones actualizadas de llama.cpp, Ollama o LM Studio, dado que LFM2 es una arquitectura reciente.
- Al estar basado en un conjunto de entrenamiento muy reducido (1.000 ejemplos) y una longitud de secuencia de 256 tokens, la generalizacion fuera de los patrones vistos es limitada.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion externa de su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BansheeTechnologies/Ouija3-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Version anterior v2 (Ouija2-1.7B): https://huggingface.co/BansheeTechnologies/Ouija2-1.7B
- Version anterior v1 (Ouija-3B): https://huggingface.co/BansheeTechnologies/Ouija-3B
