# rupeshs/iris-3b-int8-ov

## Resumen

rupeshs/iris-3b-int8-ov es un repositorio alojado en Hugging Face por el usuario rupeshs, publicado el 17 de octubre de 2026 y distribuido bajo licencia Apache 2.0. En el momento de la consulta no incluye model card propiamente dicha —el README se limita a la declaración de licencia—, no registra descargas ni interacciones y el tamaño del repositorio es de 0,0 GB, lo que indica que no contiene pesos ni ficheros de configuración.

El identificador del repositorio sugiere, siguiendo la convención de nombres habitual, un modelo de aproximadamente 3.000 millones de parámetros cuantizado a INT8 y exportado para el runtime OpenVINO (sufijo ov). Ninguno de estos extremos está confirmado por documentación del autor, por lo que deben tratarse como hipótesis derivadas del nombre y no como especificaciones verificadas.

En su estado actual el artefacto no es utilizable: sin pesos, sin tokenizador, sin config.json y sin documentación, no puede integrarse en ningún pipeline de inferencia ni evaluarse con benchmarks. Su interés es, por tanto, meramente prospectivo, como posible publicación futura de una variante cuantizada de un modelo base llamado Iris.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el identificador sugiere 3B, sin confirmar) |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el identificador sugiere INT8, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el identificador sugiere OpenVINO IR, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no describe si se trata de un transformer denso, una mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura híbrida. Tampoco hay datos sobre número de capas, dimensión oculta, número de cabezas de atención, vocabulario o mecanismo de atención (completa, ventana deslizante, lineal, GQA/MQA).

Respecto al entrenamiento, no consta el volumen de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni el modelo base del que derivaría esta hipotética cuantización. Tampoco hay evidencia de técnicas de optimización de inferencia (decodificación especulativa, cuantización de KV cache o destilación). Toda la sección queda, por tanto, sin contenido verificable.

## Capacidades

- No se puede confirmar ninguna capacidad funcional: el repositorio no contiene pesos ni documentación técnica que permita evaluar el modelo.
- Generación de texto: no disponible.
- Razonamiento, matemáticas y código: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Únicamente si se confirma la hipótesis de una exportación OpenVINO INT8, cabría esperar inferencia optimizada en CPU x86 y en GPUs Intel, pero esto es una suposición derivada del nombre del repositorio y no un dato publicado.

## Casos de uso

Los siguientes escenarios son condicionales a que el repositorio llegue a publicar pesos utilizables y a que se confirmen arquitectura, contexto e idiomas. No deben considerarse casos validados.

- Inferencia en CPU x86 sin GPU: si se confirma la exportación a OpenVINO IR, el modelo podría ejecutarse con el runtime de OpenVINO en servidores sin acelerador dedicado, un escenario habitual en entornos corporativos con hardware Intel y restricciones de coste.
- Asistente de texto en el borde (edge): un modelo de ~3B en INT8 ocupa del orden de 3 GB, lo que permitiría desplegarlo en mini-PC, NUC o dispositivos con NPU Intel, con latencias aceptables para tareas de baja concurrencia.
- Clasificación y extracción de información estructurada: uso como extractor de entidades o clasificador de tickets en un pipeline batch donde el coste por token sea determinante y no se requiera razonamiento profundo.
- Resumen de documentos internos: generación de resúmenes de informes o actas en despliegues on-premise, siempre que la ventana de contexto confirmada sea suficiente para los documentos objetivo.
- Generación de código asistida en el IDE: si el modelo ha sido entrenado con corpus de código, podría emplearse para autocompletado local, sin enviar el código a servicios externos.
- Chatbot de atención al cliente de primer nivel: filtrado y respuesta a consultas frecuentes en un sistema multi-turno, con escalado a un modelo mayor cuando la consulta exija razonamiento complejo.
- Traducción automática de baja latencia: si se confirman los idiomas soportados, podría cubrir traducción en tiempo casi real en aplicaciones de mensajería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de referencia, y no hay resultados derivados de terceros asociados a este identificador.

## Requisitos de hardware

Las cifras siguientes son estimaciones teóricas para un hipotético modelo denso de 3.000 millones de parámetros con la cuantización INT8 que sugiere el nombre del repositorio. No proceden de documentación del autor y deben verificarse si el modelo se publica finalmente.

- VRAM estimada en INT8: del orden de 3,0-3,5 GB solo para los pesos, más 0,5-1,5 GB de caché KV en función del contexto y del batch, lo que sitúa el consumo total en torno a 4-6 GB.
- VRAM estimada en FP16: aproximadamente 6,5-7 GB de pesos.
- VRAM estimada en cuantizaciones de 4 bits: del orden de 2,0-2,5 GB de pesos.
- GPU de consumo: cabría esperar compatibilidad con RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores, así como con iGPU Intel Arc en el caso de OpenVINO.
- GPU de centro de datos: A100, H100, L40S o L4, aunque para 3B parámetros estarían sobredimensionadas salvo por requisitos de concurrencia alta.
- CPU: en caso de exportación OpenVINO o GGUF, sería viable en CPU x86 moderna con AVX2/AVX-512, con throughput muy inferior al de GPU.
- Opciones de despliegue: OpenVINO Runtime y optimum-intel si se confirma el formato IR; llama.cpp y Ollama si se publican pesos GGUF; vLLM y TGI si se publican safetensors en FP16/BF16 con config.json.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparación sustantiva porque no hay ningún dato publicado del modelo analizado. La tabla recoge, a título de referencia, modelos de la misma clase de tamaño (aproximadamente 3B parámetros) ampliamente documentados por sus autores; los valores de las alternativas provienen de su documentación pública y deben contrastarse con la versión vigente de cada uno.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rupeshs/iris-3b-int8-ov | no disponible (el nombre sugiere 3B) | no disponible | Apache-2.0 | repositorio sin pesos, 0 descargas |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | pesos públicos en Hugging Face, ampliamente desplegado |
| Qwen2.5 3B Instruct | 3,09B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | pesos públicos en Hugging Face y ModelScope |
| Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens (existe variante de 128.000) | MIT | pesos públicos en Hugging Face |

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni ficheros de configuración (tamaño de 0,0 GB), por lo que el modelo no es ejecutable ni evaluable en su estado actual.
- No existe model card técnica: no hay información sobre datos de entrenamiento, arquitectura, contexto, idiomas ni evaluación.
- Las hipótesis sobre tamaño (3B), cuantización (INT8) y formato (OpenVINO) proceden únicamente del nombre del repositorio y no están confirmadas; podrían ser incorrectas.
- Cero descargas y cero interacciones: no hay evidencia de uso real ni de validación por parte de la comunidad.
- La fecha de creación registrada (17 de octubre de 2026) es posterior al periodo habitual de consulta y conviene verificarla antes de citarla.
- Licencia Apache 2.0: permite uso comercial, pero se desconoce la procedencia de los pesos base y si existirían restricciones heredadas de la licencia del modelo original no reflejadas en el repositorio.
- Riesgo de alucinación, sesgos y comportamiento multilingüe: imposibles de evaluar sin pesos ni documentación.
- No debe utilizarse en producción ni citarse como referencia técnica mientras no se publique información verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rupeshs/iris-3b-int8-ov
- Perfil del autor en Hugging Face: https://huggingface.co/rupeshs

No se han encontrado enlaces adicionales (paper, blog técnico, repositorio de código o demo) en la información disponible.
