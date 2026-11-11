# ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-hot_iq-8xV100-SXM2-PP2xTP4

## Resumen

Volta Max uPLIft FP4 es un paquete de pesos cuantizados del modelo DeepSeek-V4.1-Flash-1017, desarrollado por Nick Mermiges (PLI Labs / Proprietary Legal Intelligence) y publicado bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una compilación de cuantización de precisión mixta pensada específicamente para servir el modelo base en ocho GPU NVIDIA V100-SXM2 de 32 GB (arquitectura Volta, SM70), hardware que no dispone de soporte nativo para los formatos FP4 de las generaciones posteriores.

La propuesta técnica consiste en colocar en VRAM el mayor número posible de expertos enrutados a precisión NVFP4 (el formato de NVIDIA) y mantener el resto en registros comprimidos de clase IQ2 (de ISTA-DASLab). Según la model card, 6.087 de los 15.360 expertos enrutados quedan a precisión NVFP4 exacta, lo que cubre entre el 79,0 % y el 85,0 % de las rutas de decodificación en los conjuntos medidos (medición in-sample). El paquete completo ocupa 556 GB y se distribuye con una configuración identificada como `hot_iq`, con paralelismo de pipeline 2 y tensor 4 (PP2 x TP4).

La relevancia del proyecto es fundamentalmente de infraestructura: demuestra una vía para ejecutar un modelo MoE de gran tamaño en hardware Volta sin acceso a FP4 nativo, combinando cuantización mixta, decodificación especulativa y parches de motor (vLLM). En el momento de la publicación, la subida de ficheros estaba marcada como incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) derivada de DeepSeek-V4.1-Flash-1017; el paquete aplica cuantización mixta NVFP4 + IQ2-class |
| Parametros totales | no disponible (el modelo base no reporta cifra en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas de velocidad con código de 1K a 256K) |
| Tipos de cuantizacion | NVFP4 (expertos promocionados), IQ2-class (expertos comprimidos), MXFP4 (etiqueta), GGUF (etiqueta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible con detalle; el paquete se distribuye como descarga única de 556 GB, con etiquetas GGUF y safetensors no confirmadas |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo nuevo: hereda la arquitectura del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un transformer con mezcla de expertos. La contribución del autor es un procedimiento de asignación de precisión sobre los pesos: primero se colocan en las tarjetas los registros comprimidos IQ2-class de cada experto enrutado y, a continuación, se promocionan a pesos NVFP4 por orden de uso por byte, uno a uno, hasta que el siguiente no cabe. El criterio maximiza el trabajo cubierto a NVFP4, no el número de expertos promocionados: empaquetar primero las promociones más baratas habría permitido encajar 6.377-6.379 expertos frente a 6.087, pero con expertos menos usados y, por tanto, sin cubrir más carga de trabajo real.

En decodificación, todos los expertos residen en VRAM, de modo que ninguna lectura de experto enrutado cruza PCIe. La lectura de prompt es distinta: se leen los expertos comprimidos a precisión NVFP4 desde registros preparados en RAM del host. El paquete se sirve con vLLM y parches de motor propios, y emplea decodificación especulativa. La model card indica que el test de proximidad frente al pack NVFP4 de NVIDIA está diseñado con reglas públicas, pero sus resultados no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto y decodificación autorregresiva sobre el modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y generación de código, evidenciados por el banco de velocidad sobre código de 1K a 256K.
- Soporte de bucles de herramientas (tool loops) de hasta 31K, con velocidades medidas de 88-91 tok/s.
- Capacidad de servir cargas de estilo legal, con 64,7 tok/s medidos en ese perfil.
- Decodificación especulativa integrada en el motor de servicio.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en infraestructura Volta existente: permite ejecutar un MoE de gran tamaño en ocho V100-SXM2 de 32 GB sin migrar a GPU con soporte FP4 nativo, usando PP2 x TP4 y vLLM con los parches del repositorio.
- Generación de documentación jurídica: el perfil de estilo legal medido (64,7 tok/s) sugiere un uso orientado a redacción y revisión de textos legales dentro de flujos con recuperación y validación posteriores.
- Agentes con uso intensivo de herramientas: los bucles de herramienta de hasta 31K tokens y las velocidades de 88-91 tok/s lo hacen apto para pipelines agénticos de varios pasos donde el coste por token condiciona la viabilidad.
- Generación de código en producción: el banco de velocidad sobre código de 1K a 256K (104-127 tok/s) respalda su integración en asistentes de programación y revisión automatizada de parches.
- Procesamiento de contextos largos: la ventana probada hasta 256K permite resumir expedientes, contratos o repositorios extensos en una sola pasada, siempre que el consumo de VRAM lo permita.
- Investigación en cuantización mixta: el paquete sirve como referencia reproducible para estudiar el compromiso entre precisión por experto y cobertura de rutas en decodificación sobre hardware sin FP4.
- Despliegue de bajo coste en clústeres heredados: al mantener todos los expertos en VRAM y evitar lecturas PCIe en decodificación, reduce la dependencia de interconexión rápida entre nodos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Rutas de decodificacion a precision NVFP4 | 79,0-85,0 % (in-sample) |
| Expertos enrutados a NVFP4 exacto | 6.087 de 15.360 |
| Velocidad, estilo legal | 64,7 tok/s |
| Velocidad, general | 83,6 tok/s |
| Velocidad, bucles de herramienta de 31K | 88-91 tok/s |
| Velocidad, codigo de 1K a 256K | 104-127 tok/s |
| Tamano del paquete | 556 GB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El test de proximidad frente al pack NVFP4 de NVIDIA estaba pendiente de resultados en el momento de la publicacion.

## Requisitos de hardware

- VRAM: ocho GPU V100-SXM2 de 32 GB (256 GB en total), con todos los expertos enrutados residentes en VRAM durante la decodificación.
- RAM del host: necesaria para alojar los registros comprimidos de los expertos durante la lectura de prompt; el volumen exacto no está especificado.
- GPU recomendadas: NVIDIA V100-SXM2-32GB en configuración de 8 tarjetas con PP2 x TP4. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en tarjetas consumer; el paquete ocupa 556 GB y requiere un nodo de ocho aceleradores.
- Despliegue: vLLM con parches de motor propios, decodificación especulativa y el launcher incluido en el repositorio de GitHub.
- Latencia y throughput: 64,7 tok/s en estilo legal, 83,6 tok/s en uso general, 88-91 tok/s en bucles de herramienta de 31K y 104-127 tok/s en código de 1K a 256K, según mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Volta Max uPLIft FP4 (este paquete) | no disponible | no disponible | Mixta NVFP4 + IQ2-class | MIT | 8x V100-SXM2-32GB |
| Volta sPLIt (mismo autor) | no disponible | no disponible | Todos los expertos comprimidos | MIT | 8x V100-SXM2-32GB |
| Volta Full NVFP4 (mismo autor) | no disponible | no disponible | Todos los expertos a NVFP4, los menos usados desde RAM | MIT | 8x V100-SXM2 |
| DeepSeek-V4.1-Flash-1017-NVFP4 (NVIDIA) | no disponible | no disponible | NVFP4 | no disponible | GPU con soporte FP4 nativo |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada. Las tres variantes del mismo autor difieren en la política de asignación de precisión y en el compromiso entre cobertura NVFP4 y velocidad.

## Limitaciones y advertencias

- El paquete estaba marcado como subida en curso en el momento de la publicación: los ficheros están incompletos y la model card desaconseja la descarga.
- Las cifras de cobertura de rutas (79-85 %) son mediciones in-sample sobre los conjuntos medidos por el autor; no se han validado de forma independiente.
- El test de proximidad frente al pack NVFP4 de NVIDIA no tenía resultados publicados, por lo que no se conoce la degradación de calidad frente a la referencia.
- El 15-21 % restante de rutas de decodificación se ejecuta sobre registros IQ2-class, con precisión inferior a NVFP4.
- La lectura de prompt recurre a registros en RAM del host, lo que puede introducir latencia adicional en contextos largos.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación para este paquete.
- La licencia MIT del paquete no exime de verificar las condiciones del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` para uso comercial.
- El despliegue depende de parches de motor propios y de una configuración de hardware muy concreta (V100-SXM2, PP2 x TP4), lo que limita la portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-hot_iq-8xV100-SXM2-PP2xTP4
- GitHub del paquete: https://github.com/ProprietaryLegal/Volta-Max-uPLIft-FP4-DeepSeek-V4.1-Flash-1017-NVFP4-8xV100-SXM2-PP2xTP4
- Build relacionado Volta Full NVFP4: https://github.com/ProprietaryLegal/Volta-Full-NVFP4-DeepSeek-V4.1-Flash-8xV100
- Build anterior Volta sPLIt: https://github.com/ProprietaryLegal/Volta-sPLIt-DeepSeek-V4.1-Flash-1017-8xV100-SXM2-PP2xTP4
- Volta sPLIt en Hugging Face: https://huggingface.co/ProprietaryLegal/Volta-sPLIt-DeepSeek-V4.1-Flash-1017-8xV100-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack NVFP4 de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- PLI Labs: https://proprietarylegal.ai/labs.html
- Proprietary Legal Intelligence: https://proprietarylegal.ai
