# aminya/Qwen3.8-Flash-Next-DFlash2-GGUF

## Resumen

DFlash 2 es un modelo borrador (draft model) auxiliar disenado para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3.8-Flash-Next. Lo desarrolla Inco AI y se distribuye en este repositorio como cuantizaciones GGUF preparadas por el usuario aminya. No es un modelo conversacional autonomo: su funcion es proponer bloques de tokens candidatos que el modelo objetivo verifica, acelerando asi la generacion sin alterar la distribucion de salida del modelo grande.

La innovacion tecnica es el uso de difusion de bloques (block diffusion) combinada con un selector de trayectoria: el borrador propone un bloque completo de tokens y un mecanismo de seleccion elige la ruta candidata mas prometedora antes de que el modelo objetivo valide el resultado. Esto se aparta del esquema clasico de decodificacion especulativa token a token y permite paralelizar la propuesta.

El modelo cuenta con 603.065.600 parametros (aproximadamente 0,6 mil millones) y se empaqueta en varios formatos GGUF, desde BF16 hasta IQ3_S, con un tamano de repositorio de 4,4 GB. Su relevancia practica esta en reducir la latencia de inferencia de Qwen3.8-Flash-Next en despliegues con llama.cpp, a costa de un consumo adicional de VRAM para alojar el borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa basado en difusion de bloques (block diffusion) con selector de trayectoria; detalles de capas y atencion no disponibles |
| Parametros totales | 603.065.600 (aprox. 0,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ3_S, IQ3_M, IQ4_NL, IQ4_XS |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3.8-Flash-Next, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un borrador auxiliar para decodificacion especulativa. Segun la model card, DFlash 2 propone un bloque de tokens y un selector escoge una ruta candidata; posteriormente el modelo objetivo (Qwen3.8-Flash-Next) verifica el borrador. La tecnica subyacente es la difusion de bloques aplicada a decodificacion especulativa, descrita en el paper DFlash (Chen, Liang y Liu, ICML 2026) y extendida en DFlash 2 bajo el lema "Keep Drafting Parallel".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el borrador. Tampoco se detalla el numero de capas, la dimension del modelo ni el mecanismo de atencion. Los datos disponibles solo confirman el rol funcional (draft model) y el linaje (derivado de incoai/Qwen3.8-Flash-Next-DFlash2).

## Capacidades

- Generacion de tokens candidatos por bloques para decodificacion especulativa sobre Qwen3.8-Flash-Next.
- Seleccion de trayectoria candidata mediante un selector interno antes de la verificacion del modelo objetivo.
- Integracion con llama.cpp a traves de los flags `--spec-draft-model`, `--spec-type draft-dflash` y `--spec-draft-n-max`.
- No soporta tool calling ni function calling de forma autonoma (no es un modelo de chat).
- No soporta agentes ni razonamiento multi-paso por si mismo; su aportacion es acelerar al modelo objetivo.
- Capacidades multilingues: no disponibles como entidad propia; dependen del modelo objetivo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia en produccion con llama.cpp: se carga junto a un GGUF compatible de Qwen3.8-Flash-Next y se activa la decodificacion especulativa para reducir la latencia por token generado, manteniendo la calidad del modelo objetivo.
- Servidores de chat de baja latencia: al proponer bloques de tokens en paralelo, el borrador disminuye el tiempo hasta el primer token completo de una respuesta en despliegues con `llama-server`.
- Despliegue en hardware con VRAM limitada: las variantes IQ3_S e IQ4_XS reducen el peso del borrador, permitiendo reservar mas memoria para el modelo objetivo en GPUs de gama consumer.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: util para investigadores que quieran medir el impacto de la difusion de bloques frente a esquemas clasicos de draft token a token.
- Pipelines de generacion por lotes: en tareas de resumen o generacion de codigo donde el throughput importa, el borrador puede aumentar los tokens por segundo del modelo objetivo.
- Prototipado de infraestructura de inferencia: sirve como pieza de referencia para integrar borradores DFlash 2 en stacks basados en llama.cpp antes de migrar a otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto ningun benchmark end-to-end de inferencia objetivo/borrador para estas variantes GGUF.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,2 GB en BF16 (0,6 B parametros), en torno a 0,4-0,5 GB en Q4_K_M/IQ4_XS y cerca de 0,7 GB en Q8_0. Estimaciones calculadas a partir del numero de parametros; no confirmadas por el autor.
- La VRAM total debe sumar la del modelo objetivo Qwen3.8-Flash-Next, cuyas dimensiones no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles de forma especifica. Por tamano, el borrador cabe en cualquier GPU consumer moderna (RTX 3060 12 GB en adelante) junto con un objetivo cuantizado; para el objetivo completo se requeririan GPUs de mayor capacidad (A100, H100) segun su tamano real.
- Cabe en GPU consumer: si, el borrador por si solo; el conjunto objetivo + borrador depende del tamano del objetivo.
- Opciones de despliegue: llama.cpp (build con soporte DFlash) mediante `llama-server`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; no se ejecutaron mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros borradores de decodificacion especulativa comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Qwen3.8-Flash-Next y un build de llama.cpp con soporte DFlash; no puede usarse como chat por si solo.
- Las cuantizaciones IQ3_S, IQ3_M, IQ4_NL e IQ4_XS se generaron sin importance matrix, lo que puede degradar la calidad del borrador y, con ello, la tasa de aceptacion de tokens.
- IQ3_XXS e IQ3_XS se omitieron porque llama.cpp exige una importance matrix para completarlas; IQ4_S e IQ4_M no estan soportadas por el cuantizador empleado.
- No hay benchmarks end-to-end publicados para estas variantes GGUF, por lo que la ganancia real de velocidad es desconocida.
- Riesgo de alucinacion: no aplica de forma directa al ser un borrador verificado por el objetivo, pero una baja tasa de aceptacion reduce el beneficio y aumenta el coste computacional.
- Sesgos e idiomas: no declarados; dependen del modelo objetivo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo objetivo Qwen3.8-Flash-Next antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aminya/Qwen3.8-Flash-Next-DFlash2-GGUF
- Modelo base: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Implementacion de DFlash: https://github.com/z-lab/dflash
