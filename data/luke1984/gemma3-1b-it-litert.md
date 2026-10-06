# luke1984/gemma3-1b-it-litert

## Resumen

`luke1984/gemma3-1b-it-litert` es una copia alojada del artefacto `Gemma3-1B-IT_multi-prefill-seq_q4_block128_ekv4096.task`, distribuido originalmente por el repositorio `litert-community/Gemma3-1B-IT`. No se trata de un modelo nuevo ni de un ajuste fino: es un re-host del mismo fichero, publicado por el usuario `luke1984` para alimentar el chat de ayuda en dispositivo de su aplicacion "Piano Tuner", que usa la API MediaPipe LLM Inference en telefonos que no disponen de Gemini Nano. El SHA-256 declarado en la model card (`036e1511...d37891`) sirve como comprobacion de integridad de esa copia.

El modelo subyacente es Gemma 3 1B en su variante instruction-tuned, es decir, un transformer decoder-only de aproximadamente 1000 millones de parametros, empaquetado por el equipo LiteRT para ejecucion local en Android, iOS y Web mediante la pila LiteRT (antigua TensorFlow Lite) y la MediaPipe LLM Inference API. El artefacto concreto esta cuantizado a int4 en bloques de 128 y configurado con una cache KV de 4096 tokens, segun se deduce de los sufijos `q4_block128` y `ekv4096` del nombre del fichero.

Su relevancia es practica: permite desplegar un modelo de generacion de texto instruccional completamente offline en terminales moviles sin acceso a la nube, lo que resulta util para privacidad y para escenarios sin conectividad. Al ser una copia de un artefacto de terceros, el valor anadido es la disponibilidad del binario ya empaquetado, no una contribucion tecnica nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | Aproximadamente 1.000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (cache KV `ekv4096`); limite efectivo del artefacto desplegado |
| Tipos de cuantizacion | int4 con cuantizacion en bloques de 128 (`q4_block128`) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (con aviso en NOTICE y restricciones de la seccion 3.2 y la Politica de Usos Prohibidos de Gemma) |
| Formato de pesos | `.task` (bundle LiteRT/MediaPipe LLM Inference) |
| Tamano del repositorio | 0,7 GB |
| Biblioteca | mediapipe |
| Modelo base | litert-community/Gemma3-1B-IT |
| SHA-256 del artefacto | 036e15114d1868fc7be7ccc552fc8da2fe31d64af02b48847ff99f0185d37891 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en los materiales proporcionados. El modelo base pertenece a la familia Gemma 3 de Google, cuyo modelo de 1B es de tipo decoder-only orientado a texto, y ha sido instruction-tuned. El artefacto aqui alojado no reentrena ni modifica esos pesos: es una conversion al formato de despliegue de LiteRT con cuantizacion int4 en bloques de 128 y una cache KV fijada en 4096 tokens, ademas de una estrategia de prefill segmentado (`multi-prefill-seq`) para gestionar entradas largas en memoria limitada.

El dato distintivo del empaquetado es la combinacion de cuantizacion agresiva (int4) con un limite de cache KV de 4096 tokens, lo que prioriza la huella de memoria y la latencia en dispositivo frente a ventanas de contexto amplias. No hay datos sobre composicion del dataset, numero de tokens de entrenamiento, ni sobre etapas de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto instruccional en modo chat, heredada del modelo base Gemma 3 1B IT.
- Ejecucion local y offline mediante la MediaPipe LLM Inference API sobre LiteRT.
- Despliegue multiplataforma en Android, iOS y Web, segun la documentacion de litert-community.
- Inferencia en telefonos sin modulo Gemini Nano, que es el caso de uso declarado por el autor.
- Soporte de prefill segmentado (`multi-prefill-seq`) para procesar entradas en fragmentos.
- Capacidades de tool calling, agentes, vision, audio o modo "thinking": no disponibles en la informacion proporcionada.
- Idiomas soportados y calidad multilingue: no disponibles.

## Casos de uso

- Chat de ayuda en aplicaciones moviles: el autor lo emplea para el asistente de ayuda en dispositivo de su app "Piano Tuner", de modo que la asistencia funcione sin conexion y sin enviar datos del usuario a un servidor.
- Asistentes privados sin conexion: cualquier app Android, iOS o Web puede integrar el `.task` mediante MediaPipe LLM Inference para ofrecer respuestas generadas localmente, util en entornos con requisitos de privacidad o sin red.
- Funcionalidad de respaldo en dispositivos de gama media: al no depender de Gemini Nano, cubre telefonos que no cumplen los requisitos de ese modulo del sistema.
- Clasificacion y resumen de texto corto en dispositivo: tareas de extraccion o sintesis de fragmentos de hasta 4096 tokens que se benefician de no salir del terminal.
- Prototipado de interfaces conversacionales moviles: sirve como modelo de referencia rapido para validar flujos de chat on-device antes de escalar a modelos mayores.
- Verificacion de integridad y despliegue reproducible: el SHA-256 publicado permite comprobar que el binario no se ha alterado antes de empaquetarlo en una aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,7 GB, lo que da una idea del peso del artefacto cuantizado a int4; la memoria en tiempo de ejecucion sera superior al incluir pesos descargados, cache KV de 4096 tokens y overhead de la pila LiteRT.
- Destino principal: telefonos Android, iOS y navegador Web, segun la documentacion de litert-community para este tipo de artefactos.
- Cabe en dispositivos moviles de gama media; el propio caso de uso declarado son telefonos sin Gemini Nano.
- GPU de escritorio (A100, H100, RTX 4090) o VRAM estimada: no disponible.
- Opciones de despliegue: MediaPipe LLM Inference API sobre LiteRT. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.task` es especifico de la pila LiteRT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luke1984/gemma3-1b-it-litert (este repositorio) | ~1B | 4096 tokens (cache KV) | `.task` int4 (LiteRT/MediaPipe) | Gemma Terms of Use | Copia re-alojada, 0 descargas y 0 likes en el momento de la ficha |
| litert-community/Gemma3-1B-IT | ~1B | Varias variantes de cache KV segun el fichero | `.task` (LiteRT/MediaPipe) | Gemma Terms of Use | Repositorio original del artefacto, con varias configuraciones |
| google/gemma-3-1b-it | ~1B | No disponible en la informacion proporcionada | safetensors (formato original) | Gemma Terms of Use | Modelo base de Google, sin empaquetado para dispositivo |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos de ~1B de otras familias) no esta respaldada por datos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una copia de un artefacto de terceros, no un modelo nuevo; la responsabilidad tecnica y de mantenimiento recae en el repositorio original `litert-community/Gemma3-1B-IT`.
- La ventana de contexto efectiva esta limitada a 4096 tokens por la cache KV configurada (`ekv4096`); entradas mas largas requeriran truncado o fragmentacion.
- La cuantizacion int4 puede degradar la calidad de las respuestas respecto a los pesos originales en safetensors.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinacion ni evaluaciones de seguridad para este artefacto concreto.
- No se especifican los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Licencia Gemma: el uso esta sujeto a los Terminos de Uso de Gemma, incluidas las restricciones de uso de la seccion 3.2 y la Politica de Usos Prohibidos de Gemma; es necesario revisar ambas antes de un despliegue comercial.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- Formato `.task` propietario de la pila LiteRT/MediaPipe: no es directamente utilizable en runners de inferencia habituales de servidor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/luke1984/gemma3-1b-it-litert
- Modelo base del artefacto: https://huggingface.co/litert-community/Gemma3-1B-IT
- Modelo original de Google: https://huggingface.co/google/gemma-3-1b-it
- Resumen del modelo base: https://www.aimodels.fyi/models/huggingFace/gemma3-1b-it-litert-community
- Ejemplos de modelos Gemma3/Gemma4 en LiteRT: https://deepwiki.com/google-ai-edge/LiteRT/14.3-model-examples-(gemma3gemma4)
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/litert-community/Gemma3-1B-IT/summary
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
