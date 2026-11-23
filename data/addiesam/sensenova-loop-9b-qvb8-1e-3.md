# addiesam/SenseNova-Loop-9B-QVB8-1e-3

## Resumen

SenseNova-Loop-9B-QVB8-1e-3 es un paquete de pesos cuantizados del modelo multimodal SenseNova-Loop-9B (desarrollado por SenseNova), publicado por el investigador independiente addiesam bajo el formato propietario QVB8. No se trata de un modelo nuevo ni de un ajuste fino: es una compresion certificada de los pesos originales en bf16, con un error maximo garantizado (tau = 0.001) para cada peso restaurado. El paquete esta disenado exclusivamente para el motor de inferencia QVB8, que decodifica los pesos comprimidos dentro de sus propios kernels CUDA en la GPU.

La propuesta tecnica central es el control del error en norma L-infinito en lugar del error medio. La mayoria de esquemas de cuantizacion se evaluan por perplexity o benchmarks medios, lo que puede ocultar pesos con errores grandes que alteran tokens concretos. Aqui cada tensor se verifica tras el empaquetado y el error maximo observado se almacena en `manifest.json`, sin superar nunca tau. El paquete ocupa 7.2 GB en disco y, segun el autor, el motor QVB8 lo ejecuta con un consumo de VRAM cercano a ese tamano, ademas de comprimir la cache KV para habilitar contextos largos en hardware modesto.

Es relevante ahora porque demuestra una via practica para ejecutar modelos multimodales de gran tamano en GPUs de consumo, con garantias formales de error sobre los pesos y un ecosistema de herramientas abierto (motor Apache-2.0, papers en Zenodo). No obstante, su adopcion esta limitada por la dependencia de un motor propietario y por la ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles no disponibles |
| Parametros totales | 4.640.880 (segun safetensors del paquete comprimido); el modelo base se denomina 9B pero el recuento real no esta disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor menciona soporte de contexto largo mediante cache KV comprimida, sin cifra) |
| Tipos de cuantizacion | QVB8 con tau = 0.001; 370 tensores comprimidos, media de 6.55 bits por peso; certificado para restauracion a fp16 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor); no cargable en transformers |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: deriva de los pesos bf16 de SenseNova-Loop-9B, un modelo multimodal de tipo image-text-to-text. La model card del paquete no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, mecanismo de atencion ni estrategia de fusion vision-lenguaje), por lo que esos datos deben consultarse en la ficha del modelo original.

La innovacion tecnica esta en la compresion. Cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado: el error maximo entre el valor restaurado y el peso bf16 original se registra por tensor en `manifest.json` (`max_err`) y ningun tensor supera tau. El proceso no usa datos de calibracion, solo depende de los pesos. Se incluye `escape_tables.json` para acelerar la decodificacion en ejecuciones fp16. El motor QVB8 decodifica pesos y cache KV en la GPU dentro de sus kernels CUDA, lo que permite un footprint de VRAM proximo al tamano del fichero comprimido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Razonamiento y respuesta en lenguaje natural; capacidades especificas de codigo o matematicas no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no especificados).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Ejecucion con contexto largo gracias a la cache KV comprimida del motor QVB8.

## Casos de uso

- Asistentes multimodales en hardware de consumo: desplegar un modelo image-text-to-text con un footprint de VRAM cercano a 7.2 GB permite ejecutarlo en GPUs de gama alta para consumidores, habilitando asistentes que describen imagenes o responden preguntas sobre capturas.
- Analisis de documentos con imagenes: procesar facturas, formularios o capturas de pantalla combinando OCR implicito y razonamiento textual en una sola pasada, aprovechando la naturaleza image-text-to-text del modelo base.
- Prototipado de investigacion en compresion: usar el paquete como banco de pruebas para validar la garantia L-infinito y comparar el comportamiento frente a cuantizaciones de 4 bits, midiendo el efecto de tau en la calidad.
- Despliegue en entornos con VRAM limitada: ejecutar el modelo en una unica GPU donde el checkpoint bf16 completo no cabria, gracias a la decodificacion en GPU del motor QVB8.
- Conversaciones de contexto largo: mantener dialogos extensos o analizar documentos largos apoyandose en la cache KV comprimida, que reduce el coste de memoria del contexto.
- Evaluacion de motores de inferencia alternativos: comparar latencia y calidad de salida del motor QVB8 frente a vLLM o llama.cpp con el modelo original, siempre que se disponga del checkpoint bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de compresion: 7.2 GB en disco, 370 tensores comprimidos, media de 6.55 bits por peso y error maximo por peso inferior a 0.001. No se ofrecen cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7.2 GB para los pesos comprimidos, segun el autor, mas la memoria adicional de la cache KV comprimida y activaciones.
- GPU recomendadas: no especificadas; el motor QVB8 usa kernels CUDA, por lo que requiere GPU NVIDIA. El autor menciona que necesita maquinas para probar otras generaciones de GPU.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8-12 GB o mas de VRAM, aunque no se confirma oficialmente ningun modelo concreto.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.3.0 o superior; no es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-QVB8-1e-3 | recuento real no disponible (base 9B) | no disponible | QVB8, 7.2 GB | Apache-2.0 | QVB8 |
| SenseNova-Loop-9B (original) | 9B (nominal) | no disponible | bf16 | Apache-2.0 | transformers y otros |
| SenseNova-Loop-9B-QVB8-5e-4 | recuento real no disponible (base 9B) | no disponible | QVB8, 8.3 GB | Apache-2.0 | QVB8 |

La comparativa con alternativas de cuantizacion estandar (GPTQ, AWQ, GGUF Q4) no esta disponible en la informacion proporcionada. La diferencia clave frente al modelo original es el tamano (7.2 GB frente al checkpoint bf16) y la garantia de error maximo; frente al pack 5e-4, este ofrece menor tamano a costa de un limite de error mas laxo.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no se carga en transformers ni en otros motores, lo que limita la portabilidad y crea un punto unico de fallo.
- La garantia L-infinito cubre solo los pesos almacenados; no asegura que las respuestas sean identicas a las del modelo original ni correctas. Diferencias en motores, tamanos de lote y orden de operaciones en coma flotante producen salidas distintas.
- El error de 0.001 por peso puede acumularse a lo largo de las capas; no se publican evaluaciones de perplexity ni de calidad downstream para este pack.
- Riesgo de alucinacion inherente al modelo base, no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no especificados, lo que impide garantizar cobertura multilingue.
- Recuento de parametros inconsistente: el nombre indica 9B pero safetensors reporta 4.640.880, probablemente por el formato comprimido; conviene verificar antes de dimensionar el hardware.
- Sin benchmarks publicados: imposible comparar objetivamente con alternativas.
- Licencia Apache-2.0 permite uso comercial, pero el motor QVB8 tambien es Apache-2.0 y el autor no ofrece garantia alguna.
- Proyecto de un investigador independiente con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/SenseNova-Loop-9B-QVB8-1e-3
- Pack alternativo tau = 5e-4: https://huggingface.co/addiesam/SenseNova-Loop-9B-QVB8-5e-4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.3.0: https://github.com/addiesam/qvb8/releases/tag/v1.3.0
- Paper I (DOI): https://doi.org/10.5281/zenodo.23815007
- Paper II (DOI): https://doi.org/10.5281/zenodo.23816044
- Patrocinio del autor: https://github.com/sponsors/addiesam
