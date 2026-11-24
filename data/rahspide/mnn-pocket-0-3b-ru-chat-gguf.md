# Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF

## Resumen

MNN-Pocket-0.3B-RU-Chat es un modelo de lenguaje conversacional en ruso (con soporte de inglés) de tan solo 302.830.976 parámetros, desarrollado por Rahspide. Se trata de la versión cuantizada en GGUF para `llama.cpp` de un modelo base afinado mediante SFT sobre un modelo de continuación de texto, con el objetivo explícito de que el modelo responda a instrucciones en lugar de limitarse a continuar el texto de entrada. Su propuesta de valor es el despliegue en dispositivo (on-device) y en el borde (edge): con cuantizaciones de 208-223 MB cabe en un teléfono y genera a más de 100 tok/s en CPU x86 de 16 hilos.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado con los identificadores `mnn` y `qwen3`, lo que sugiere una arquitectura derivada de la familia Qwen3, aunque la model card no detalla la arquitectura interna. La plantilla ChatML está embebida en el propio archivo GGUF, de modo que basta con `--jinja` en `llama.cpp` para activar el formato conversacional; sin ella, el modelo se comporta como su "hermana" (el modelo de continuación) y sigue el texto en lugar de contestar.

Es relevante ahora porque demuestra que un ajuste de 50 M de tokens de SFT puede convertir un modelo de continuación de 0,3 B en un asistente instruccional funcional para ruso, con un coste de almacenamiento y cómputo compatible con hardware de consumo y móvil. No hay datos publicados de benchmarks ni de calidad conversacional más allá de las velocidades de generación medidas por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3 (según tags; detalle no disponible) |
| Parametros totales | 302.830.976 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_1 |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de las etiquetas `mnn` y `qwen3`, que apuntan a una base de la familia Qwen3 adaptada al runtime MNN y posteriormente convertida a GGUF. El dato concreto disponible es el proceso de ajuste: se partió de un modelo de continuación de texto ("continuation model") y se aplicaron 50 M de tokens de SFT (supervised fine-tuning) para convertirlo en un asistente que responde a instrucciones. El autor indica explícitamente que, sin la plantilla ChatML embebida, el modelo vuelve a comportarse como el modelo de continuación original, lo que confirma que la capacidad instruccional proviene del SFT y del formato de chat, no de un cambio arquitectónico.

No se especifican la composición del dataset de SFT, el número total de tokens de preentrenamiento, ni si hubo RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única optimización destacada es práctica: la inclusión de la plantilla ChatML dentro del archivo GGUF para simplificar el uso con `llama.cpp --jinja`.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con formato de instrucciones ChatML.
- Respuesta a instrucciones en lugar de continuación de texto (comportamiento diferenciado respecto al modelo base de continuación).
- Conversación multi-turno mediante la plantilla ChatML embebida.
- Ejecución en CPU y en dispositivos de borde gracias a su tamaño reducido y a las cuantizaciones de 4 y 8 bits.
- Compatibilidad con `llama.cpp` y, por extensión, con herramientas que consumen GGUF (CLI, servidores compatibles con endpoints).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Asistentes conversacionales en ruso en dispositivos móviles: con Q4_K_M (223 MB) el modelo cabe en un teléfono y responde a instrucciones básicas sin conexión, lo que permite asistentes de bolsillo, notas o accesibilidad sin enviar datos a la nube.
- Aplicaciones de escritorio con CPU: en un x86 de 16 hilos genera a ~123 tok/s con Q4_K_M y ~102 tok/s con Q8_0, suficiente para un chat interactivo local en herramientas de escritorio o plugins de IDE ligeros.
- Procesamiento por lotes en el borde: con Q4_1 (208 MB) y ~62,6 tok/s de generación se pueden clasificar o resumir textos cortos en ruso en gateways, routers o dispositivos IoT con CPU modesta.
- Prototipado rápido de pipelines conversacionales: al ser un GGUF de 0,3 B con plantilla ChatML, sirve para validar flujos de chat y prompts antes de escalar a modelos mayores, con coste de infraestructura mínimo.
- Filtrado y moderación de texto en ruso: tareas de etiquetado o reformulación de frases cortas donde la latencia y el tamaño importan más que la profundidad de razonamiento.
- Educación y demos offline: entornos sin red (aulas, ferias, dispositivos aislados) donde se necesita un chat en ruso que quepa en un USB o en la memoria de un móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos medidos por el autor son de velocidad en CPU x86 de 16 hilos:

| Cuantización | Generación (tok/s) | Procesamiento de prompt (tok/s) | Tamaño |
|---|---|---|---|
| Q4_K_M | ~123 (medición aislada) / 54,3 (medición back-to-back) | 251 | 223 MB |
| Q8_0 | ~102 | no disponible | 310 MB |
| Q4_1 | 62,6 | 199 | 208 MB |
| F16 | no disponible | no disponible | 581 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; en GPU, Q4_K_M ocupa ~223 MB de pesos más overhead de contexto y KV cache (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre puede alojar las cuantizaciones Q4; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo está orientado a CPU y borde.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también en CPU convencional.
- Despliegue: `llama.cpp` (CLI con `--jinja`), y por extensión servidores compatibles con GGUF y endpoints; no se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~123 tok/s de generación con Q4_K_M y ~102 tok/s con Q8_0 en CPU x86 de 16 hilos; Q4_1 prioriza generación (62,6 tok/s) a costa de procesamiento de prompt (199 frente a 251 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat GGUF | 302.830.976 | no disponible | ru, en | Apache 2.0 | GGUF | Enfoque on-device, SFT de 50 M tokens |
| Qwen3 (variantes pequeñas) | no disponible en esta ficha | no disponible | multilingüe | según variante | safetensors/GGUF | Base arquitectónica probable; datos no verificados aquí |
| Modelos de continuación de 0,3 B del mismo autor | ~0,3 B | no disponible | ru, en | Apache 2.0 | GGUF | Sin SFT conversacional; continúan texto |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en razonamiento, código o matemáticas; el tamaño de 0,3 B limita severamente estas capacidades.
- Riesgo de alucinación elevado por el reducido número de parámetros y por un SFT de 50 M de tokens sin fases de alineación documentadas (RLHF/DPO no mencionados).
- Sesgos no evaluados: no se documenta ninguna evaluación de sesgos, toxicidad o robustez.
- Dependencia del formato: sin la plantilla ChatML y `--jinja`, el modelo continúa texto en lugar de responder, lo que puede romper integraciones mal configuradas.
- Cobertura lingüística limitada a ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- El repo pesa 1,4 GB por incluir varias cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF
- Modelo base (pesos, datos y evaluación): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
