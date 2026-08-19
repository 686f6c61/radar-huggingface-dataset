# Blackfrost-AI/Muse-Glimmer-30B-Abliterated-GGUF

## Resumen

Muse Glimmer 30B Abliterated GGUF es una versión cuantizada y modificada del modelo Muse Glimmer 30B, desarrollado originalmente por Meta Superintelligence Labs y transformado por Blackfrost-AI. Se trata de un modelo denso de 30.000 millones de parámetros, multimodal y orientado a agentes, diseñado para ejecutarse localmente en un solo GPU de consumo o incluso en CPU. La versión "abliterated" elimina el comportamiento de rechazo del modelo original mediante un proceso de modificación de pesos, manteniendo intactas sus capacidades multimodales y de razonamiento.

La relevancia de este modelo radica en su empaquetado como GGUF para llama.cpp, lo que permite desplegarlo de forma totalmente offline en hardware de consumo. Con una ventana de contexto de 131.072 tokens, soporte de visión mediante un proyector mmproj y decodificación especulativa con el drafter DFlash, ofrece un rendimiento de aproximadamente 73 tokens por segundo en una RTX PRO 6000, un 1,6 veces más rápido que la inferencia base. Su licencia Apache-2.0 facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — densa, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, torre de vision |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer denso de 52 capas con hidden size de 6656 y atención de consulta agrupada (GQA) con 32 cabezas de consulta y 2 cabezas de clave/valor. Emplea atención de ventana deslizante (sliding-window attention) y una torre de visión integrada que permite procesar entradas de imagen y texto simultáneamente. La arquitectura está diseñada específicamente para ejecución en dispositivo, priorizando la eficiencia de memoria y latencia.

La transformación "abliterated" aplicada por Blackfrost-AI modifica los pesos del modelo para eliminar el comportamiento de rechazo, manteniendo intactas las capacidades de razonamiento y multimodales. Los detalles del proceso de modificación de pesos no se han publicado. El modelo se distribuye en formato GGUF con una escalera completa de cuantizaciones, junto con un proyector de visión en precisión F16 y Q8_0, y un drafter DFlash para decodificación especulativa. Los datos de entrenamiento del modelo original no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos con un canal de razonamiento separado (`reasoning_content`) y respuesta final (`content`).
- Procesamiento multimodal: acepta entradas de imagen y texto mediante el proyector `mmproj` (vision projector).
- Soporte de function calling y capacidades agénticas, disenado para tareas de agente en dispositivo.
- Ventana de contexto larga de 131.072 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Decodificacion especulativa con DFlash drafter, que acelera la inferencia aproximadamente 1,6 veces sin cambiar la salida.
- Personalidad por defecto integrada con plantilla de sistema "AI assistant".
- Control de profundidad de razonamiento mediante una linea de sistema con niveles low/medium/high/xhigh.

## Casos de uso

- Asistente local de codigo: el modelo puede integrarse en entornos de desarrollo como un agente de autocompletado o revision de codigo, aprovechando su soporte de function calling y su capacidad para ejecutarse offline en una estacion de trabajo con GPU de 24 GB.
- Analisis de documentos con imagenes: gracias a su torre de vision y contexto de 131K tokens, puede procesar informes tecnicos extensos con diagramas, tablas y capturas de pantalla, extrayendo informacion relevante sin enviar datos a la nube.
- Atencion al cliente automatizada en local: empresas con requisitos de privacidad pueden desplegar el modelo en un servidor interno para gestionar conversaciones multi-turno con contexto largo, manteniendo los datos de clientes dentro de la infraestructura.
- Agente de automatizacion de tareas: su capacidad agéntica y de function calling permite construir pipelines que interactuan con APIs, ejecutan scripts o gestionan flujos de trabajo, todo en un entorno local.
- Investigacion academica sin conexion: investigadores que trabajan con datos sensibles pueden utilizar el modelo para analisis de texto e imagenes sin depender de servicios externos, gracias a su licencia Apache-2.0 y su ejecucion en hardware de consumo.
- Prototipado rapido de aplicaciones multimodales: desarrolladores pueden usar la cuantizacion Q4_K_M (15,8 GB) para crear prototipos de aplicaciones que combinan vision y lenguaje en una GPU de 24 GB, validando ideas antes de escalar a hardware mas potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son:

| Metrica | Resultado |
|---|---|
| Rechazos verdaderos (R1-HARMFUL-BENCH-450, n=300) | 0 / 300 = 0,0% |
| Rechazos verdaderos (suite completa de 450) | 0 / 450 = 0,0% |
| Falsos positivos substring (XSTest) | 2 / 450 |
| Errores | 0 |

Rendimiento de inferencia medido en 1x NVIDIA RTX PRO 6000 (Blackwell), Q8_0, flash attention desactivada:

| Configuracion | Decode tok/s | Speedup |
|---|---|---|
| Linea base | ~46 | 1,0x |
| Con DFlash | ~73 | 1,6x |

Meta reporta aceleraciones de hasta 3,1x en RTX 5090 con flash attention activada y salida estructurada o de codigo.

## Requisitos de hardware

- VRAM estimada por cuantizacion: Q2_K 10,0 GB, Q3_K_S 11,7 GB, Q3_K_M 12,7 GB, Q4_K_S 15,0 GB, Q4_K_M 15,8 GB, Q5_K_S 18,0 GB, Q5_K_M 18,5 GB, Q6_K 21,3 GB, Q8_0 27,6 GB.
- GPU recomendadas: RTX 4090 o RTX PRO 6000 para cuantizaciones Q4_K_M y superiores; tarjetas de 16 GB pueden usar Q4_K_S; tarjetas de 12 GB pueden usar Q3_K_M.
- El modelo cabe en GPUs de consumo: Q4_K_M (15,8 GB) es la opcion por defecto para tarjetas de 24 GB; cuantizaciones menores permiten ejecucion en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp con `llama-server` (requerido para DFlash), compatible con vLLM, Ollama y TGI mediante el formato GGUF.
- Latencia y throughput: ~46 tok/s en linea base y ~73 tok/s con DFlash en RTX PRO 6000 con Q8_0 y flash attention desactivada; el rendimiento mejora con flash attention activada.
- El drafter DFlash requiere 4,8 GB adicionales de VRAM y solo funciona con `llama-server`, no con `llama-cli`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse Glimmer 30B (original) | 30B | 131.072 | Apache-2.0 | BF16, GGUF, ExecuTorch | Modelo base de Meta, sin abliteracion |
| Muse Glimmer 30B Abliterated BF16 | 30B | 131.072 | Apache-2.0 | safetensors | Version abliterated en precision completa |
| Muse Glimmer 30B Abliterated GGUF | 30B | 131.072 | Apache-2.0 | GGUF | Version cuantizada, objeto de esta ficha |

No se dispone de informacion sobre modelos comparables de otros desarrolladores con la misma arquitectura o tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la arquitectura se publico el mismo dia que la cuantizacion, por lo que pueden existir problemas de decodificacion, coherencia, parseo de herramientas o errores bajo carga.
- La abliteracion elimina el comportamiento de rechazo, lo que significa que el modelo puede generar contenido que el modelo original rechazaria. Esto implica riesgos de seguridad y uso indebido que deben evaluarse antes del despliegue en produccion.
- Se requiere `max_tokens` de al menos 1024: el modelo consume tokens en el canal de razonamiento y con presupuestos pequenos devuelve `content` vacio.
- El drafter DFlash solo funciona con `llama-server` y comparte contexto con el modelo principal; no es compatible con `llama-cli`.
- Los idiomas soportados no estan documentados; el rendimiento en idiomas distintos del ingles no esta verificado.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que la comparacion objetiva con otros modelos de 30B no es posible con los datos disponibles.
- La cuantizacion Q2_K y Q3_K pueden degradar significativamente la calidad de salida; se recomienda Q4_K_M como minimo para uso general.

## Enlaces

- Modelo GGUF: https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-GGUF
- Modelo base BF16: https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Coleccion Muse Glimmer de Meta: https://huggingface.co/collections/meta-models/muse-glimmer
- Guia y laboratorio de agentes: https://github.com/cobusgreyling/Muse-Glimmer
- Perfil de Blackfrost en X: https://x.com/Blackfrost_AI
