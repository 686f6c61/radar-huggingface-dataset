# litert-community/Spark-X2.6-4B

## Resumen

Spark-X2.6-4B es un modelo de lenguaje denso de 4,11 mil millones de parámetros desarrollado por el equipo SparkLLM (XHToken), primer modelo de la serie Spark-X2.6. Se trata de un modelo de razonamiento que genera su cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final, y se construye sobre Spark-X2.5-4B, conservando su arquitectura y mejorando las capacidades mediante post-entrenamiento refinado.

Este repositorio concreto (litert-community/Spark-X2.6-4B) es una conversión del modelo original al formato LiteRT-LM (`.litertlm`), realizada con litert-torch 0.9.3 para LiteRT-LM 0.19.0. Su propósito es la ejecución en dispositivos edge y on-device (ordenadores Mac y teléfonos Android), con dos variantes de cuantización: int4 (2.483 MB) e int8 (4.238 MB). En un Mac Studio con GPU Apple M4 Max, la variante int4 decodifica a 91,2 tokens por segundo.

Su relevancia actual radica en la combinación de razonamiento con despliegue local eficiente: es un modelo con licencia Apache-2.0, tamaño contenido (cabe en portátiles y móviles de gama alta) y plantilla de chat verificada byte a byte contra la del proveedor, lo que lo hace idóneo para aplicaciones locales de IA que preserven privacidad y funcionen sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (decoder-only) |
| Parametros totales | 4,11 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (KV cache de los ficheros convertidos); no disponible el contexto nativo del modelo original |
| Tipos de cuantizacion | int4 blockwise-128 + OCTAV en capas lineales (embedding en int8); int8 dinámico por canal en todas las lineales y el embedding |
| Idiomas soportados | No disponible (el tokenizer soporta CJK, emoji, Latin-1/Extended-A) |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); original en XHToken/Spark-X2.6-4B |

## Arquitectura y entrenamiento

La arquitectura consta de 36 capas con tamaño oculto 2.560, 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones cada una (agrupamiento GQA). Emplea una relación de tres capas de atención con ventana deslizante (512 tokens) por cada capa de atención completa, puertas sigmoidales por cabeza sobre la salida de atención, MLPs con GELU exacto y un vocabulario embebido (tied) de 131.072 entradas. Es un modelo de razonamiento: abre el pensamiento según la plantilla de chat del proveedor y los ficheros declaran un canal `thought`, de modo que LiteRT-LM mantiene el razonamiento separado de la respuesta final.

Sobre el entrenamiento, la model card indica que el modelo se basa en Spark-X2.5-4B, manteniendo la arquitectura y ganando capacidad por post-entrenamiento mejorado. No se han publicado detalles del corpus, número de tokens ni técnicas de alineamiento (RLHF/DPO) en la información disponible. La conversión a LiteRT-LM incluye operaciones compuestas para GPU en la escritura del KV cache y los productos de atención en la variante int4, con los pesos sin modificar.

## Capacidades

- Generación de texto con razonamiento explícito: piensa dentro de `<think>…</think>` antes de responder, con niveles de esfuerzo de razonamiento (`reasoning_effort`: `high` por defecto, `low` para pensamientos más cortos) y posibilidad de desactivar el pensamiento.
- Resolución de problemas aritméticos y matemáticos: GSM8K 90 en bf16 de referencia (primeras 100 preguntas, greedy, thinking activado).
- Traducción y tareas lingüísticas básicas (verificado en las pruebas de corrección del repositorio).
- Soporte de plantilla de chat completa (system, user, assistant) con renderizado idéntico byte a byte a la plantilla Jinja del proveedor.
- Separación de canales: el canal `thought` permite filtrar el razonamiento en tiempo de ejecución mediante LiteRT-LM.
- Ejecución on-device en Mac (GPU Metal) y Android (CPU), con streaming de respuestas.
- No hay información sobre tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes locales en Mac con privacidad total: al ejecutarse íntegramente en GPU Apple (91,2 tok/s con int4), permite construir asistentes de razonamiento que no envían datos a ningún servidor, adecuado para entornos con requisitos de confidencialidad.
- Aplicaciones móviles con IA sin conexión: la variante int8 sobre CPU en un Galaxy S26 alcanza 5,3 tok/s, suficiente para asistentes de texto que funcionen en vuelo o sin cobertura, streaming la respuesta para reducir la latencia percibida.
- Resolución de problemas matemáticos en edge: con GSM8K 89-93 según configuración, es adecuado para calculadoras inteligentes, tutores de aritmética o verificación de cálculos en dispositivos locales.
- Chatbots multi-turno ligeros: las pruebas de conversación de 3 turnos (plantar un dato, hacer aritmética, recordarlo) pasan en GPU con int4 y en CPU y GPU con int8, lo que lo habilita para asistentes conversacionales con memoria de contexto corto.
- Prototipado y evaluación de modelos on-device: la disponibilidad de dos recetas de cuantización con métricas documentadas (velocidad y exactitud por variante) lo convierte en referencia útil para comparar trade-offs int4/int8 en LiteRT-LM.
- Generación de texto con razonamiento oculto al usuario: el canal `thought` permite mostrar solo la respuesta final en interfaces de usuario mientras el modelo razona internamente, útil en apps de productividad.
- Procesamiento de texto multilingüe básico: el tokenizer verificado soporta CJK, emoji, Latin-1 y Extended-A, apto para apps que mezclen alfabetos latinos, chino, japonés o coreano.

## Benchmarks y rendimiento

GSM8K (primeras 100 preguntas de test, greedy, thinking activado, prompt 0-shot chain-of-thought con respuesta `#### <número>`, 3.584 tokens de salida máximos):

| Configuración | GSM8K | Notas |
|---|---|---|
| PyTorch bf16 (referencia) | 90 | 7 sin terminar |
| LiteRT-LM int4, GPU (Mac) | 89 | 4 sin terminar; 91,2 tok/s |
| LiteRT-LM int8, GPU (Mac) | 93 | 6 sin terminar; 49,8 tok/s (45 % más lento que int4) |
| LiteRT-LM int8, CPU (Mac) | 90 | 6 sin terminar |
| LiteRT-LM int8, CPU (Galaxy S26) | no disponible en exactitud | 5,3 tok/s |

Prueba de corrección de 8 preguntas cortas con respuesta única: 8/8 en las cuatro configuraciones (int4/int8 × CPU/GPU en Mac) y 8/8 en Galaxy S26 con int8 en CPU.

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: la variante int4 ocupa 2.483 MB y la int8 4.238 MB; a ello hay que sumar el KV cache (4.096 tokens) y activaciones fp32 en GPU. En la práctica, un portátil con GPU integrada de 8-16 GB de memoria unificada es suficiente para int4.
- GPU recomendadas: Apple Silicon (verificado en Mac Studio M4 Max con 91,2 tok/s en int4 y 49,8 tok/s en int8). No hay filas de rendimiento para GPU en Android con este modelo.
- Consumer GPUs: al ser formato .litertlm para LiteRT-LM, el despliegue verificado es en Mac (GPU) y Android (CPU); no hay información sobre compatibilidad con NVIDIA RTX de consumo.
- Móviles: Galaxy S26 con int8 en CPU a 5,3 tok/s, con recomendación de streaming en respuestas largas.
- Despliegue: LiteRT-LM 0.19.0 (CLI `litert-lm run` o API Python), instalable con `pip install litert-lm==0.19.0`; rueda Android disponible en PyPI.
- Latencia y throughput conocidos: 91,2 tok/s (int4, GPU Mac, prompt de 1.024 tokens, 256 generados), 49,8 tok/s (int8, GPU Mac), 5,3 tok/s (int8, CPU Galaxy S26).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto (KV) | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-4B (LiteRT-LM) | 4,11 B | int4 / int8 | 4.096 | Apache-2.0 | .litertlm |
| Spark-X2.5-4B (base) | 4,11 B (no disponible detalle) | no disponible | no disponible | no disponible | no disponible |
| Gemma 3 4B (LiteRT-LM) | ~4 B | no disponible | no disponible | Gemma | .litertlm / safetensors |

Nota: los datos de las alternativas no están en la información proporcionada y se indican como no disponibles donde proceda. Como referencia de rendimiento dentro del propio repositorio: el modelo bf16 original puntúa 90 en GSM8K y la conversión int4 conserva 89, lo que indica una degradación mínima por cuantización.

## Limitaciones y advertencias

- Problema de respuesta vacía con int4 en CPU: en conversaciones multi-turno de 3 turnos, la variante int4 dio una tercera respuesta vacía en 3 de 8 procesos en CPU (el modo sin filtrado de canales). Recomendación del repositorio: usar int4 solo en GPU e int8 en CPU.
- Contexto limitado: el KV cache de los ficheros convertidos contiene 4.096 tokens; en GSM8K se requirieron hasta 3.584 tokens de salida, por lo que en tareas de razonamiento largo el presupuesto de contexto se agota rápidamente (entre 4 y 7 respuestas quedaron sin terminar por límite de tokens).
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación; como en todo modelo de lenguaje, las respuestas factuales deben verificarse.
- Sesgos: no disponible; no se ha publicado información sobre sesgos conocidos del modelo.
- Idiomas: no se declara la lista de idiomas soportados; el tokenizer cubre CJK, Latin-1, Extended-A y emoji, pero la calidad por idioma no está documentada.
- Rendimiento móvil limitado: 5,3 tok/s en Galaxy S26 (int8, CPU) exige streaming obligatorio para una experiencia aceptable; no hay soporte GPU verificado en ese teléfono para este modelo.
- Los números de rendimiento fueron medidos exclusivamente con LiteRT-LM 0.19.0; versiones anteriores del runtime no se han probado con estos ficheros.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base XHToken/Spark-X2.6-4B para condiciones adicionales del proveedor.

## Enlaces

- Repositorio del modelo convertido: https://huggingface.co/litert-community/Spark-X2.6-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM

No se han encontrado enlaces adicionales (papers, blogs o demos) en la información disponible.
