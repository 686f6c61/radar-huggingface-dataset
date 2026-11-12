# audenvenn/raceline-qwen3.8-27b

## Resumen

raceline-qwen3.8-27b es una conversión del modelo Qwen/Qwen3.8-27B realizada por el usuario audenvenn para raceline, un runtime de agentes local con motor de inferencia propio orientado a Macs con Apple Silicon y aceleradores neuronales en la GPU (familias M5 y M6). El modelo base es un transformer de 27.000 millones de parámetros desarrollado por Alibaba Qwen, y esta conversión lo empaqueta en el formato nativo del motor con pesos de 4 bits en FP4.

La particularidad del artefacto es que no es un checkpoint convencional en safetensors o GGUF: se distribuye en partes de menos de 2 GB descritas por un manifiesto `qwen3.8-27b.rlm.json`, e incluye la cabeza de predicción multi-token (MTP) del modelo original, que raceline explota para decodificación especulativa exacta. La cuantización se realizó con GPTQ tras una rotación de Hadamard del flujo residual plegada en los pesos, con una escala por fila y por columna, resultando en 4,0 bits por peso.

El modelo resuelve el problema de ejecutar un LLM de 27B en hardware de consumo Apple con un motor especializado, a cambio de perder portabilidad: solo funciona con raceline 0.2.0 o superior y no es utilizable con otros runtimes. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); pesos en formato nativo raceline con rotacion de Hadamard plegada y cabeza MTP |
| Parametros totales | 27 000 millones (27B, segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP4 con escala por fila y por columna (4,0 bits por peso), GPTQ tras rotacion de Hadamard |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato nativo raceline (`.rlm`), dividido en partes de menos de 2 GB con manifiesto `qwen3.8-27b.rlm.json`; tamano ensamblado 13,81 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer denso de 27B parametros de Alibaba Qwen. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original; esos datos deben consultarse en la model card de Qwen.

La conversion a raceline aplica tres transformaciones tecnicas destacables. Primero, una rotacion de Hadamard del flujo residual plegada en los propios pesos antes de cuantizar, tecnica que reduce los valores atipicos y mejora la fidelidad de la cuantizacion. Segundo, cuantizacion GPTQ a FP4 con escalas por fila y por columna, alcanzando 4,0 bits por peso. Tercero, la preservacion de la cabeza de prediccion multi-token (MTP) del modelo original, que el motor usa para decodificacion especulativa exacta: segun el autor, la eleccion principal de la cabeza draft coincide con el siguiente token pero uno del modelo en el 81,7 % de los casos.

La calidad de la conversion se midio contra el modelo en coma flotante sobre texto retenido de 1152 posiciones: divergencia KL de 0,148 nats, perplejidad de 1,979 y acuerdo top-1 del 90,6 %.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation.
- Decodificacion especulativa: integra la cabeza MTP del modelo base para acelerar la generacion de forma exacta dentro de raceline.
- Ejecucion local en Apple Silicon: pensado para GPUs con aceleradores neuronales de las familias M5 y M6.
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base Qwen3.8-27B; no se detallan en la informacion disponible.
- Tool calling y uso como agente: el runtime raceline se describe como un runtime de agentes local, aunque la model card no detalla el soporte concreto de function calling.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes locales en Mac: desplegar un asistente que ejecute tareas multi-paso en local sobre un Mac con M5 o M6, usando raceline como runtime y aprovechando la decodificacion especulativa para reducir la latencia por token.
- Asistencia de programacion sin conexion: integrar el modelo en un flujo de autocompletado o generacion de codigo dentro de un IDE en un equipo Apple Silicon, sin enviar codigo a servicios externos.
- Procesamiento de documentos confidenciales: al ejecutarse integramente en local, es adecuado para resumir o analizar textos sensibles que no pueden salir de la maquina.
- Prototipado de agentes con tool calling: usar raceline para experimentar con flujos de agente que invocan herramientas locales (ficheros, shell, APIs internas) antes de moverlos a produccion.
- Evaluacion de tecnicas de cuantizacion: el artefacto sirve como referencia practica de cuantizacion FP4 con rotacion de Hadamard y GPTQ, con metricas de fidelidad publicadas (KL 0,148 nats, top-1 90,6 %).
- Generacion de texto por lotes en estaciones de trabajo Apple: ejecutar tareas de redaccion, clasificacion o extraccion sobre volumenes moderados de texto aprovechando el rendimiento del motor nativo frente a mlx-lm, segun las mediciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de fidelidad de la cuantizacion respecto al modelo en coma flotante:

| Metrica | Valor |
|---|---|
| Divergencia KL (nats) | 0,148 |
| Perplejidad | 1,979 |
| Acuerdo top-1 | 90,6 % |
| Acierto de la cabeza draft (siguiente token pero uno) | 81,7 % |
| Posiciones evaluadas | 1152 |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el fichero ensamblado ocupa 13,81 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas el espacio de trabajo del motor; en la practica, un Mac con 24 GB o mas es el minimo razonable.
- GPU compatibles: exclusivamente Apple Silicon con aceleradores neuronales en GPU, es decir, familias M5 y M6 segun la model card.
- GPU de consumo NVIDIA: no soportadas; el formato `.rlm` no es compatible con CUDA.
- Opciones de despliegue: unicamente raceline 0.2.0 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas; el autor remite a las mediciones de velocidad frente a mlx-lm publicadas en el README de raceline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raceline-qwen3.8-27b | 27B | No disponible | `.rlm` (FP4, nativo raceline) | Apache-2.0 | Solo raceline en Apple Silicon M5/M6 |
| Qwen/Qwen3.8-27B (original) | 27B | No disponible | Safetensors (BF16/FP16) | Apache-2.0 | Multiples runtimes (vLLM, TGI, transformers) |
| Versiones GGUF de Qwen3.8-27B | 27B | No disponible | GGUF | Apache-2.0 | llama.cpp, Ollama, LM Studio |

La comparativa se limita al modelo original y a sus cuantizaciones GGUF, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada. La diferencia clave es la portabilidad: el original y los GGUF funcionan en multiples plataformas, mientras que esta conversion queda restringida a raceline sobre Apple Silicon.

## Limitaciones y advertencias

- Portabilidad nula: el formato `.rlm` solo lo interpreta raceline 0.2.0 o superior; no se puede cargar en vLLM, llama.cpp, Ollama, TGI ni transformers.
- Restriccion de hardware: requiere un Mac con GPU de las familias M5 o M6; no funciona en generaciones anteriores de Apple Silicon ni en GPUs NVIDIA o AMD.
- Perdida de fidelidad por cuantizacion: con 4,0 bits por peso y un acuerdo top-1 del 90,6 % frente al modelo flotante, es esperable cierta degradacion en tareas sensibles a la precision, como matematicas o generacion de codigo estricta.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en esta conversion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; deben asumirse los del modelo Qwen3.8-27B original.
- Idiomas y contexto: sin datos publicados en esta ficha; conviene consultar la model card del modelo base antes de desplegar en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero debe verificarse que las condiciones del modelo base se mantienen y citarse adecuadamente.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audenvenn/raceline-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de raceline: https://github.com/audenvenn/raceline
- Guia de inicio rapido de raceline: https://github.com/audenvenn/raceline#quick-start
