# mesiu650/GR00T-N1.6-LIBERO-llm-w4a4-flatquant-tf32

## Resumen

Este repositorio contiene el backbone de lenguaje (LLM) del modelo GR00T N1.6 de NVIDIA, en su variante fine-tuneada para el benchmark LIBERO, cuantizado a W4A4 (pesos y activaciones en int4) mediante una combinación de FlatQuant con transformada de Kronecker aprendida, clipping LWC/LAC y GPTQ. El archivo `llm.onnx` (406,8 MB) es un grafo ONNX listo para compilar con TensorRT en el dispositivo objetivo; no es un modelo ejecutable directamente, sino un componente intermedio para construir un motor optimizado.

El modelo original GR00T N1.6 es un sistema visión-lenguaje-acción (VLA) de 3B parámetros desarrollado por NVIDIA para robótica de manipulación. Esta cuantización específica, publicada por el usuario mesiu650, se centra en el submodelo de lenguaje y está diseñada para reducir la latencia en hardware edge como Jetson AGX Orin, manteniendo un rendimiento competitivo en tareas LIBERO. La relevancia de esta publicación radica en que demuestra una ruta de cuantización W4A4 con transformación TF32 que logra un éxito del 95,75% en 800 episodios de evaluación, muy cerca del 96,13% de la versión con transformada en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LLM de GR00T N1.6 (arquitectura no detallada en la informacion disponible; el modelo base es un VLA de 3B parametros) |
| Parametros totales | No disponible (el modelo base GR00T N1.6 tiene 3B parametros segun fuentes externas; el backbone LLM no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A4 (pesos int4 por fila de salida, activaciones int4 dinamicas por fila), FlatQuant + LWC/LAC + GPTQ |
| Idiomas soportados | No disponible (el modelo esta orientado a instrucciones en ingles para robotica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`llm.onnx` y `llm.onnx.data`), para compilacion con TensorRT |

## Arquitectura y entrenamiento

El modelo es el componente de lenguaje de GR00T N1.6, un sistema VLA que combina vision, lenguaje y accion. La cuantizacion aplicada usa una transformada de Kronecker de 2 vias con dimensiones (64, 96) en K=6144 y (32, 64) en K=2048, ejecutada sobre tensor cores TF32 mediante el flag `-DFQ_USE_TF32_TC=1`. Los pesos se cuantizan a int4 con GPTQ y clipping LWC/LAC, mientras que las activaciones se cuantizan dinamicamente por fila. La cuantizacion se aplica a los cuatro sitios GEMM del transformer: qkv, o_proj, gate+up y down_proj.

El entrenamiento corresponde al checkpoint LIBERO de GR00T N1.6, que es un fine-tuning del modelo base sobre tareas de manipulacion condicionadas por lenguaje. No se proporcionan datos sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO. La validacion se realizo en el benchmark LIBERO con 800 episodios (4 suites x 10 tareas x 20 episodios, 520 pasos maximo, 4 pasos de denoising), manteniendo el DiT en cuantizacion `omega_qvla_w4a4_sq`.

## Capacidades

- Generacion de representaciones latentes de accion para robotica de manipulacion, integrado en el pipeline VLA de GR00T N1.6.
- Soporte de instrucciones en lenguaje natural para tareas de manipulacion (a traves del sistema completo, no de este backbone aislado).
- Ejecucion eficiente en hardware edge gracias a la cuantizacion W4A4 y la transformada TF32.
- Compatibilidad con TensorRT para despliegue en GPU NVIDIA (sm_87 y sm_89).
- No es un modelo de chat generico: no soporta tool calling, agentes ni razonamiento conversacional.
- Capacidades multilingues no disponibles; el modelo esta orientado al benchmark LIBERO, que usa instrucciones en ingles.

## Casos de uso

- Robotica de manipulacion en entornos de investigacion: el modelo se integra en el sistema GR00T N1.6 para controlar brazos roboticos en tareas LIBERO como abrir cajones, colocar objetos o seguir instrucciones espaciales.
- Evaluacion de cuantizaciones extremas en VLA: sirve como referencia para estudiar el impacto de W4A4 en tareas de robotica, comparando la transformada TF32 frente a fp32.
- Despliegue en robots de bajo consumo: la cuantizacion permite ejecutar el backbone LLM en Jetson AGX Orin con una latencia proyectada de 10,89 ms (frente a 13,86 ms en fp32), habilitando robots moviles autonomos.
- Optimizacion de pipelines de inferencia con TensorRT: el archivo ONNX esta disenado para compilarse en motores especificos por dispositivo, lo que facilita la integracion en sistemas de produccion que ya usan TensorRT.
- Investigacion en compresion de modelos: el esquema FlatQuant+GPTQ con transformada de Kronecker puede servir como caso de estudio para otras tareas de control.
- Benchmarking de hardware: las latencias medidas en RTX 4090 y Jetson AGX Orin (ver seccion de hardware) permiten comparar el rendimiento de tensor cores INT4 entre arquitecturas sm_89 y sm_87.

## Benchmarks y rendimiento

La model card reporta resultados de evaluacion en el benchmark LIBERO (800 episodios, configuracion cerrada). El DiT se mantuvo fijo en cuantizacion `omega_qvla_w4a4_sq`.

| Suite | Tasa de exito (TF32 transform) |
|---|---|
| libero_spatial | 0.990 |
| libero_object | 0.985 |
| libero_goal | 0.955 |
| libero_10 | 0.900 |
| **Overall** | **0.9575** |

Referencia con transformada fp32: 0.9613 (800 episodios). La diferencia es de aproximadamente 3 episodios fallidos en 800. Metricas offline: `chan_rel_err` mediana 0.2487, `tok_cos_ex_top4_min` +0.0292 (signo positivo que distingue esta configuracion de W4A4 anteriores). El chequeo de build de TensorRT dio una coseno BF16-vs-TRT de 0.9916.

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente, pero el archivo ONNX pesa 406,8 MB, por lo que en fp16 ocuparia ~800 MB; con cuantizacion W4A4 la memoria efectiva es menor.
- GPU recomendadas: RTX 4090 (sm_89) y Jetson AGX Orin (sm_87) son las usadas en las pruebas. Se requiere soporte de tensor cores TF32 y capacidad de compilacion TensorRT 10.15 (sm_89) o 10.3 (sm_87).
- No cabe en GPU de consumo antiguas sin soporte TF32 (por ejemplo, GTX 10xx o 16xx).
- Opciones de despliegue: TensorRT (obligatorio, ya que el ONNX debe compilarse en el dispositivo destino). No es compatible con vLLM, llama.cpp u Ollama directamente.
- Latencia medida: en RTX 4090, 4.97 ms con FlatQuant vs 3.09 ms con INT8; en Jetson AGX Orin, 19.38 ms vs 10.22 ms. La latencia proyectada con transformada TF32 en Orin es 10.89 ms (frente a 13.86 ms en fp32). Nota: los motores no son portables entre sm_89 y sm_87.

## Comparativa con modelos similares

No se dispone de datos de otros modelos VLA cuantizados a W4A4 para comparar directamente. La unica comparacion interna disponible es con la version sin cuantizar o con cuantizacion INT8:

| Configuracion | Latencia RTX 4090 | Latencia Jetson AGX Orin | Tasa de exito LIBERO (800 ep.) |
|---|---|---|---|
| FlatQuant W4A4 (TF32 transform) | 4.97 ms | 10.89 ms (proyectado) | 0.9575 |
| FlatQuant W4A4 (fp32 transform) | No disponible | 13.86 ms | 0.9613 |
| INT8 | 3.09 ms | 10.22 ms | No disponible |

El modelo base GR00T N1.6 sin cuantizar (fp16) tendria mayor precision pero mayor latencia; no se reportan cifras en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion W4A4 introduce una perdida de precision que se traduce en una caida de ~0.4 puntos porcentuales en LIBERO (0.9575 vs 0.9613). En tareas mas complejas o con ruido, el impacto podria ser mayor.
- Los motores TensorRT no son portables entre arquitecturas sm_89 y sm_87; es necesario recompilar en cada dispositivo.
- El archivo ONNX es un componente intermedio, no un modelo completo. No puede usarse de forma aislada para generar texto o acciones; requiere el resto del pipeline VLA (vision encoder, DiT, etc.).
- No se proporcionan datos sobre sesgos, alucinacion o limitaciones de idioma, al ser un modelo especializado en robotica.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base GR00T N1.6 de NVIDIA puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.
- La latencia reportada en Jetson AGX Orin para la transformada TF32 es una proyeccion pendiente de validacion con el ONNX publicado.
- El autor advierte que una factorizacion alternativa mas rapida (128,48)/(64,32) falla el criterio de calidad `tok_cos_ex_top4_min` (valor -0.1009), por lo que no se publica. Esto indica que la configuracion elegida es un punto delicado del espacio de diseno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mesiu650/GR00T-N1.6-LIBERO-llm-w4a4-flatquant-tf32
- Proyecto de adaptacion LIBERO de Siqi Chen: https://tj-chen-1209.github.io/projects/libero-grootn1.6/
- Pagina de investigacion de NVIDIA sobre GR00T N1.6: https://research.nvidia.com/labs/gear/gr00t-n1_6/
- Repositorio GitHub de fine-tuning LIBERO: https://github.com/tj-chen-1209/Libero_GR00T
- Modelo base GR00T-N1.6-LIBERO (otro autor): https://huggingface.co/0xAnkitSingh/GR00T-N1.6-LIBERO
