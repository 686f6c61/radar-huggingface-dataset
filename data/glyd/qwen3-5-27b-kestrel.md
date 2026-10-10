# glyd/Qwen3.5-27B-kestrel

## Resumen

Glyd kestrel es un checkpoint cuantizado del modelo Qwen/Qwen3.5-27B, publicado por el autor glyd bajo licencia Apache-2.0. No es un modelo entrenado desde cero, sino una compresion de los pesos originales en bf16 a aproximadamente 6,5 bits por peso, con un unico paso de cuantizacion. El resultado ocupa 22,0 GB en disco frente a los 53,8 GB del bf16 original, lo que supone una reduccion del 59 por ciento en el tamano de descarga.

La relevancia de esta ficha esta en el eje memoria-rendimiento: el checkpoint cabe en 24,0-24,2 GB de VRAM durante la inferencia con contexto de 4.000 tokens, lo que lo sitúa en el rango de una RTX 4090, una L40S o una RTX A6000 de una sola unidad. La cuantizacion no es sin perdidas: la divergencia KL respecto al bf16 medida sobre WikiText-2 es de 0,00789, un valor bajo pero no nulo, que el propio autor publica de forma explicita junto a una alternativa aun mas agresiva (glyd swift, 18,6 GB, KL 0,0173).

El modelo se ejecuta exclusivamente con el motor propietario de Glyd (`glyd run`), no con vLLM ni con transformers, y requiere Linux con GPU NVIDIA y driver 580 o superior. Ademas, el checkpoint es solo texto: la parte de vision del modelo base Qwen3.5-27B no se incluye. La ventana de contexto probada alcanza los 32.000 tokens en L40S y RTX A6000, aunque no en RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-27B; el model card solo indica que el base incluye una parte de vision) |
| Parametros totales | 26.895.998.464 en el modelo base segun el model card; 21.884.158.770 parametros en safetensors del checkpoint cuantizado |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.000 tokens en GPUs con memoria suficiente (L40S, RTX A6000); longitud nativa maxima no disponible |
| Tipos de cuantizacion | variante unica "kestrel" a ~6,5 bits por peso; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos (heredada de Qwen/Qwen3.5-27B); el motor Glyd es BUSL-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Se trata de una derivacion de Qwen/Qwen3.5-27B, un modelo con 26.895.998.464 parametros segun el model card, y del que se menciona explicitamente que incorpora un componente de vision que este checkpoint no incluye. El pipeline declarado es text-generation y las etiquetas incluyen conversational, ademas de qwen3_5 y kestrel.

El aspecto tecnico destacable no es el entrenamiento, sino el proceso de cuantizacion: los pesos se cuantizaron una sola vez partiendo de los pesos bf16 originales del commit `fc05daec` del modelo base, con un resultado de aproximadamente 6,5 bits por peso. El autor publica la metrica de fidelidad (KL de 0,00789 frente a bf16 sobre WikiText-2) y advierte que la etiqueta "8-bit precision" de HuggingFace cuenta bytes empaquetados, no bits reales por peso. No se documentan datos de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, ya que el checkpoint no introduce entrenamiento adicional.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation y el tag conversational, por lo que el modelo esta orientado a dialogos multi-turno.
- Capacidades heredadas del base (codigo, matematicas, razonamiento): no detalladas ni verificadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial de vision: excluida de forma explicita; el checkpoint es solo texto.
- Modo de pensamiento (thinking) u otras variantes de decodificacion: no disponible.
- Ventana de contexto extendida: soporta 32.000 tokens en L40S y RTX A6000.

## Casos de uso

- Asistente conversacional en GPU de consumo: con 24,1 GB de VRAM a 4.000 tokens y 40 tok/s en una RTX 4090, permite desplegar un chatbot de baja o media concurrencia en una sola maquina sin clúster.
- Analisis de documentos largos: en L40S o RTX A6000 la ventana de 32.000 tokens admite resumir informes, contratos o articulos extensos en una unica pasada, sin troceado agresivo.
- Generacion aumentada por recuperacion (RAG) con muchos fragmentos: la ventana de 32k permite concatenar un numero elevado de pasajes recuperados antes de generar, reduciendo la necesidad de re-ranking fino.
- Inferencia por lotes en servidor Linux: mediante `glyd run` sobre una L40S o RTX A6000 con driver 580 o superior, para tareas programadas de generacion de texto a escala moderada.
- Estudio de compromisos de cuantizacion: el KL publicado (0,00789) frente a la alternativa glyd swift (0,0173, 18,6 GB) permite evaluar el equilibrio entre compresion y fidelidad en investigacion de cuantizacion.
- Sustitucion de bf16 en entornos con VRAM limitada: reduce el peso en disco de 53,8 GB a 22,0 GB y el uso de memoria en GPU a ~24 GB, permitiendo ejecutar un modelo de 27B en hardware que no admite el bf16 completo.
- Despliegue de prototipos y demos sobre una unica GPU: la latencia de primer token medida (484 ms en RTX 4090, 438 ms en L40S) es adecuada para aplicaciones interactivas no criticas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El autor unicamente publica metricas de fidelidad de cuantizacion y de velocidad.

| Modelo | Tamano | Reduccion vs bf16 | KL vs bf16 | RTX 4090 (tok/s) |
|---|---|---|---|---|
| bf16 (original) | 53,8 GB | – | 0 | no disponible |
| Qwen FP8 | 29,5 GB | 45 % | no disponible | no disponible |
| kestrel (este repo) | 22,0 GB | 59 % | 0,00789 | 40 |
| glyd swift | 18,6 GB | 65 % | 0,0173 | 46 |

La divergencia KL se midio sobre WikiText-2. Las cifras de velocidad y memoria se registraron el 2026-10-09 con glyd 0.29.4, una GPU por medicion y contexto de 4.000 tokens.

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
|---|---:|---:|---:|---|
| RTX 4090 | 40 | 484 ms | 24,1 GB | no |
| L40S | 31 | 438 ms | 24,2 GB | si |
| RTX A6000 | 30 | 712 ms | 24,0 GB | si |

## Requisitos de hardware

- VRAM estimada para inferencia: 24,0-24,2 GB con contexto de 4.000 tokens, segun las mediciones del autor en RTX 4090, L40S y RTX A6000.
- GPU recomendadas: RTX 4090, L40S, RTX A6000. Para contexto de 32.000 tokens hacen falta L40S o RTX A6000.
- GPU de consumo: si, cabe en una RTX 4090 a 4k de contexto (24,1 GB), pero no soporta la ventana de 32k.
- Sistema operativo y driver: Linux con GPU NVIDIA y driver 580 o posterior.
- Opciones de despliegue: exclusivamente el motor Glyd (`glyd run`). No es compatible con vLLM ni con transformers en el momento de la publicacion.
- Latencia y throughput: 40 tok/s en RTX 4090 con 484 ms hasta el primer token; 31 tok/s en L40S con 438 ms; 30 tok/s en RTX A6000 con 712 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | KL vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-27B bf16 (base) | 26,9B | no disponible | 53,8 GB | 0 | Apache-2.0 | HuggingFace |
| Qwen3.5-27B FP8 | 26,9B | no disponible | 29,5 GB | no disponible | Apache-2.0 | HuggingFace |
| glyd kestrel (este repo) | 26,9B (base) | 32k | 22,0 GB | 0,00789 | Apache-2.0 | HuggingFace |
| glyd swift | 26,9B (base) | no disponible | 18,6 GB | 0,0173 | Apache-2.0 | HuggingFace |

Las tres alternativas cuantizadas parten del mismo modelo base. La eleccion entre kestrel y swift es un compromiso entre tamano y fidelidad: swift ocupa 3,4 GB menos y es mas rapido en RTX 4090 (46 frente a 40 tok/s), pero su divergencia KL es mas del doble.

## Limitaciones y advertencias

- La cuantizacion es con perdidas: la divergencia KL de 0,00789 respecto al bf16 implica un desplazamiento medible en las probabilidades del siguiente token, que puede afectar a tareas sensibles a la precision.
- El checkpoint esta empaquetado a ~6,5 bits por peso; la etiqueta "8-bit precision" de HuggingFace cuenta bytes empaquetados y puede inducir a confusion.
- Existe una discrepancia entre el recuento de parametros del model card (26.895.998.464) y el recuento de safetensors del repositorio (21.884.158.770), presumiblemente por el empaquetado de los tensores cuantizados.
- Dependencia total del motor Glyd: no funciona con vLLM ni transformers, lo que limita la portabilidad y obliga a adoptar la herramienta del proveedor.
- La licencia de los pesos es Apache-2.0, pero el motor que los ejecuta es BUSL-1.1: uso gratuito solo personal y no comercial en equipos propios; el uso comercial requiere licencia adicional.
- El modelo es solo texto: la parte de vision del base no esta incluida, por lo que no admite entradas de imagen.
- No se documentan idiomas soportados, sesgos conocidos ni riesgo de alucinacion especifico.
- Soporte de tool calling, agentes y razonamiento multi-paso no confirmado en la informacion disponible.
- El contexto de 32.000 tokens solo es viable en L40S y RTX A6000, no en RTX 4090.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- Requiere Linux y driver NVIDIA 580 o superior; no hay soporte declarado para otros sistemas o aceleradores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-27B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Commit concreto del base: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Variante glyd swift: https://huggingface.co/glyd/Qwen3.5-27B-swift
- Motor y licencia del motor: https://getglyd.com
- Script de instalacion: https://getglyd.com/install.sh
