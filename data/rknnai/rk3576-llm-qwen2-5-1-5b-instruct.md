# RKNNAI/RK3576-LLM-Qwen2.5-1.5B-Instruct

## Resumen

RKNNAI/RK3576-LLM-Qwen2.5-1.5B-Instruct no es un modelo entrenado desde cero, sino una distribucion de despliegue del modelo Qwen/Qwen2.5-1.5B-Instruct convertida al formato RKLLM y cuantizada para ejecutarse sobre la NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI y conserva la licencia Apache 2.0 del modelo origen de Alibaba.

Su interes practico es que permite ejecutar un LLM de aproximadamente 1.500 millones de parametros en hardware de borde con aceleracion NPU, algo que no es posible directamente con los formatos de pesos habituales (safetensors o GGUF). El repositorio incluye una unica configuracion, Qwen2.5-1.5B-Instruct-w4a16-2-1024, con cuantizacion w4a16, dos nucleos NPU y una ventana de contexto limitada a 1024 tokens, compatible con la version v1.2.4 del runtime RKLLM.

El repositorio ocupa 1,4 GB y no registra descargas ni likes en el momento de la consulta. No se publican resultados de benchmarks ni detalles adicionales del proceso de entrenamiento o conversion mas alla de los que aporta el modelo origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion (modelo origen: Qwen2.5-1.5B-Instruct, transformer decoder) |
| Parametros totales | 1.500 millones (1.5B), segun el nombre y el modelo origen |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 1024 tokens en la configuracion desplegada |
| Tipos de cuantizacion | w4a16 (pesos a 4 bits, activaciones a 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip para el runtime RKLLM) |

## Arquitectura y entrenamiento

La ficha describe un artefacto de despliegue, no un entrenamiento nuevo. El repositorio toma el modelo Qwen2.5-1.5B-Instruct ya entrenado y lo convierte y cuantiza al formato RKLLM, pensado para ejecutarse en la NPU del Rockchip RK3576 mediante el runtime RKLLM v1.2.4. La unica configuracion publicada aplica cuantizacion w4a16 (pesos a 4 bits y activaciones a 16 bits) y reparte la ejecucion sobre dos nucleos NPU.

No se documentan en este repositorio ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO, ni innovaciones de atencion. Toda la informacion de entrenamiento queda en el modelo origen Qwen/Qwen2.5-1.5B-Instruct, del que esta distribucion solo conserva los avisos de copyright en el fichero de licencia.

## Capacidades

- Generacion de texto e instrucciones: la distribucion hereda el comportamiento del modelo Qwen2.5-1.5B-Instruct, ajustado para seguir instrucciones y mantener conversaciones, extremo que no se documenta de forma detallada en este repositorio.
- Razonamiento y codigo: no disponible en la informacion proporcionada para este artefacto concreto.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.

## Casos de uso

- Asistentes de voz o texto embebidos en dispositivos RK3576: el modelo puede integrarse en un SoC de borde para responder consultas en local sin depender de la nube, con la ventana de 1024 tokens como limite practico de conversacion.
- Automatizacion industrial en el borde: en lineas de produccion o equipos con RK3576 se puede usar para interpretar comandos en lenguaje natural y generar respuestas o etiquetas, evitando enviar datos fuera de la planta.
- Robotica y sistemas autonomos ligeros: el modelo puede actuar como capa de interaccion en lenguaje natural sobre la NPU del RK3576, siempre que la logica de control se mantenga en el propio dispositivo.
- Domotica y electrodomesticos conectados: permite dotar a un dispositivo de un interprete de ordenes en lenguaje natural en local, con requisitos de memoria contenidos gracias a la cuantizacion w4a16.
- Procesamiento de texto en kioscos o terminales de punto de venta: generacion de resumenes cortos o respuestas guiadas a partir de entradas de hasta 1024 tokens sin conexion externa.
- Prototipado de aplicaciones de IA embebida: sirve como referencia para validar el flujo de conversion RKLLM, la verificacion SHA-256 y el despliegue sobre la NPU RK3576 antes de pasar a modelos mayores.
- Educacion y demostraciones tecnicas: util para mostrar en un dispositivo de bajo consumo como se ejecuta un LLM cuantizado sobre NPU, con el fichero SHA256SUMS como control de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3576, con NPU de dos nucleos segun la configuracion publicada.
- Runtime: RKLLM v1.2.4, obligatorio para esta configuracion.
- Formato de pesos: RKLLM, no ejecutable directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion adicional.
- Tamano del repositorio: 1,4 GB, dato util como referencia de almacenamiento para el despliegue.
- Cuantizacion w4a16: reduce la huella de pesos respecto a una version en precision completa, aunque el autor no publica cifras exactas de memoria en ejecucion.
- GPU de consumo: no aplica; el artefacto esta pensado para la NPU del RK3576, no para tarjetas graficas de escritorio.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Verificacion previa: el autor exige comprobar el fichero SHA256SUMS y que todas las entradas reporten OK antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3576-LLM-Qwen2.5-1.5B-Instruct | 1.5B | 1024 tokens (desplegado) | RKLLM (w4a16) | Apache 2.0 | HuggingFace y ModelScope |
| Qwen/Qwen2.5-1.5B-Instruct (origen) | 1.5B | no disponible en esta ficha | safetensors | Apache 2.0 | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa es con el modelo origen: mismo numero de parametros y misma licencia, pero distinto formato (RKLLM cuantizado frente a safetensors) y distinta ventana de contexto declarada, que en esta distribucion queda fijada en 1024 tokens.

## Limitaciones y advertencias

- La ventana de contexto esta limitada a 1024 tokens, muy por debajo de lo habitual en modelos de su tamano, lo que restringe conversaciones largas o documentos extensos.
- La cuantizacion w4a16 puede degradar la calidad de las respuestas respecto a los pesos originales; el autor no publica metricas de esa perdida.
- El artefacto esta restringido al chip RK3576 y al runtime RKLLM v1.2.4; no es portable a otras plataformas sin reconversion.
- No hay benchmarks publicados, por lo que el rendimiento real no puede validarse con datos objetivos.
- El repositorio tiene cero descargas y cero likes, lo que implica ausencia de validacion por parte de la comunidad.
- Un modelo de 1.500 millones de parametros tiene riesgo alto de alucinacion y capacidad limitada de razonamiento complejo frente a modelos mayores.
- No se declaran idiomas soportados; el comportamiento multilingue no esta garantizado por el autor.
- La licencia Apache 2.0 permite uso comercial, siempre que se conserven los avisos de copyright del modelo origen incluidos en el fichero de licencia.
- El autor exige verificar el SHA-256 y usar exclusivamente ficheros de la misma configuracion antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen2.5-1.5B-Instruct
- Modelo origen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Los resultados de la busqueda web consultada no contienen enlaces relevantes para este modelo.
