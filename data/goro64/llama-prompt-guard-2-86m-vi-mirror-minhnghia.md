# Goro64/Llama-Prompt-Guard-2-86M-vi-mirror-MinhNghia

## Resumen

Llama-Prompt-Guard-2-86M-vi es un clasificador de texto derivado de Meta Llama Prompt Guard 2 86M, afinado por el usuario MinhNghia para tareas de deteccion de inyeccion de prompts (prompt injection) y jailbreak en vietnamita e ingles. Este repositorio concreto, publicado por Goro64, es un espejo de archivo sin modificaciones del release upstream, capturado el 28 de octubre de 2026 en el commit `95118de3483c52b44317d19cf905efcdcb094c49`. No se ha reentrenado, cuantizado ni fusionado ningún peso: solo se anaden tarjetas de procedencia y documentacion legal.

El modelo resuelve un problema de seguridad concreto en pipelines de LLM: clasificar entradas de usuario como benignas o maliciosas antes de que lleguen al modelo generativo. Su tamano reducido (278,8 millones de parametros reales en safetensors) lo hace apto para filtrar en tiempo real con latencia muy baja, aunque el nombre comercial "86M" del modelo base no coincide con el recuento real de parametros del checkpoint.

La relevancia actual es doble: por un lado, amplia la cobertura linguistica de Prompt Guard 2 al vietnamita, un idioma poco representado en herramientas de seguridad para LLM; por otro, la existencia de espejos archivisticos como este responde a la necesidad de reproducibilidad en auditorias de seguridad, donde un cambio silencioso en el upstream puede invalidar evaluaciones previas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer, clasificacion de secuencias) |
| Parametros totales | 278.810.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizar) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Llama 4 Community License Agreement (efectiva desde el 5 de abril de 2025) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 1,1 GB |
| Modelo base | meta-llama/Llama-Prompt-Guard-2-86M |
| Relacion con el base | finetune (via MinhNghia/Llama-Prompt-Guard-2-86M-vi) |

## Arquitectura y entrenamiento

La arquitectura subyacente es DeBERTa-v2, un transformer encoder con atencion desenredada (disentangled attention) que separa el contenido y la posicion de cada token en dos vectores distintos. El modelo se emplea como clasificador binario o multiclase de secuencias, no como generador: recibe un texto y devuelve una puntuacion de probabilidad de que la entrada constituya un intento de inyeccion de prompt o jailbreak. El checkpoint upstream de Meta, Llama Prompt Guard 2 86M, se entreno especificamente para esta tarea de seguridad.

Sobre el proceso de entrenamiento del afinamiento vietnamita no se dispone de informacion en la documentacion proporcionada: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. La model card del espejo remite explicitamente a la tarjeta upstream para esos detalles, y el mantenedor del espejo declara no haber entrenado, evaluado ni certificado el modelo de forma independiente. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), lo cual es coherente con un clasificador encoder de este tamano.

## Capacidades

- Clasificacion de texto para deteccion de prompt injection y jailbreak, con etiquetas definidas en la tarjeta upstream.
- Soporte bilingue vietnamita-ingles, segun los metadatos de idioma del repositorio.
- Inferencia de baja latencia gracias a su tamano (278,8 M de parametros) y a la arquitectura encoder.
- Compatibilidad con `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`), lo que permite desplegarlo como endpoint HTTP.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para integrarse como filtro previo a un LLM generativo.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat con LLM: se ejecuta el clasificador sobre cada mensaje del usuario antes de enviarlo al modelo generativo; si la puntuacion supera un umbral, se bloquea o se redirige a revision. Su tamano permite hacerlo en linea sin anadir latencia perceptible.
- Proteccion de agentes autonomos: en pipelines donde un agente interpreta instrucciones de texto libre (correos, tickets, paginas web), el clasificador actua como guardia contra inyecciones indirectas incrustadas en el contenido recuperado.
- Moderacion en comunidades vietnamitas: foros y plataformas de mensajeria en vietnamita pueden usar el modelo para detectar intentos de manipulacion de asistentes desplegados en ese idioma, una cobertura que los guardias solo en ingles no ofrecen.
- Evaluacion de robustez en auditorias de seguridad: al ser un espejo archivistico con manifiesto de hashes SHA-256, sirve como referencia reproducible para comparar resultados de evaluacion a lo largo del tiempo sin que cambios en el upstream invaliden las mediciones.
- Capa de defensa en profundidad en gateways de API: desplegado con Text Embeddings Inference detras de un API gateway, clasifica el trafico entrante de forma centralizada antes de enrutarlo a distintos modelos generativos.
- Investigacion academica sobre seguridad multilingue: permite estudiar la transferencia de defensas de prompt injection del ingles al vietnamita y comparar tasas de deteccion entre ambos idiomas con un checkpoint fijo y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del espejo remite a la documentacion upstream para las afirmaciones de evaluacion, pero no reproduce cifras concretas, y el mantenedor declara no haber realizado evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,1 GB solo para pesos, mas overhead de activaciones; en la practica, entre 1,5 y 2 GB.
- En fp16/bf16: alrededor de 0,6 GB de pesos, con un total tipico por debajo de 1,5 GB incluyendo runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: T4, L4 o A10G son suficientes; A100/H100 solo tendrian sentido para agregar muchas instancias en un mismo nodo.
- Opciones de despliegue: `transformers` (Python), Text Embeddings Inference (soporte declarado mediante tag), y servidores compatibles con endpoints. Para CPU pura, `transformers` con PyTorch es viable dado el tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos en GPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goro64/Llama-Prompt-Guard-2-86M-vi-mirror-MinhNghia (este) | 278,8 M | vi, en | Clasificacion prompt injection | Llama 4 Community | HuggingFace, espejo archivistico |
| meta-llama/Llama-Prompt-Guard-2-86M | no disponible en la informacion | en (principalmente) | Clasificacion prompt injection | Llama 4 Community | HuggingFace, upstream oficial |
| MinhNghia/Llama-Prompt-Guard-2-86M-vi | no disponible en la informacion | vi, en | Clasificacion prompt injection | Llama 4 Community | HuggingFace, upstream del afinamiento |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- El mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo; no hay garantia de seguridad derivada de la preservacion del checkpoint.
- No se documentan sesgos conocidos ni tasas de falsos positivos/negativos; cualquier despliegue en produccion requiere evaluacion propia sobre datos representativos.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si existe riesgo de clasificacion erronea, especialmente en entradas adversarias o en variedades dialectales del vietnamita no cubiertas.
- La longitud de contexto no esta documentada; entradas muy largas pueden truncarse y perder la parte maliciosa del texto.
- La licencia Llama 4 Community License Agreement impone obligaciones especificas (atribucion, politica de uso aceptable, umbrales de usuarios mensuales para ciertos usos); el uso comercial esta permitido bajo condiciones, no de forma irrestricta.
- El espejo preserva los terminos de licencia en el momento de la captura; cambios posteriores en el upstream no se reflejan en este snapshot, y una terminacion o modificacion legal efectiva del acuerdo podria afectar al uso.
- El nombre "86M" del modelo base no coincide con los 278,8 M de parametros reales del checkpoint; conviene no dimensionar infraestructura a partir de la etiqueta comercial.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-mirror-MinhNghia
- Upstream del afinamiento: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi
- Commit exacto capturado: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi/tree/95118de3483c52b44317d19cf905efcdcb094c49
- Tarjeta upstream en la revision capturada: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi/blob/95118de3483c52b44317d19cf905efcdcb094c49/README.md
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Coleccion de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
