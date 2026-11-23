# Renesas/Phi-4-mini-instruct-GGUF

## Resumen

El repositorio `Renesas/Phi-4-mini-instruct-GGUF` contiene una conversion a formato GGUF de precision FP16 del modelo `microsoft/Phi-4-mini-instruct`, publicada por Renesas para su uso con la placa R-Car X5H y su NPU NPX6. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son identicos a los del modelo original de Microsoft, unicamente convertidos con `convert_hf_to_gguf.py` de llama.cpp. La relevancia de este repositorio es que, segun su model card, no existia un GGUF publico en FP16 de este modelo, y Renesas lo aloja como artefacto validado con su SDK npx-llm.

El modelo subyacente, Phi-4-mini-instruct, es un transformer denso de Microsoft disenado para instrucciones y razonamiento con una ventana de contexto de 128 000 tokens. La ficha tecnica del modelo base no se incluye en la informacion proporcionada, por lo que los datos de arquitectura, entrenamiento y benchmarks se marcan como no disponibles cuando no aparecen en el material de origen.

El interes practico de este repositorio es el despliegue en hardware embebido: la combinacion de un GGUF FP16 de 7,7 GB con el backend NPU de Renesas permite ejecutar el modelo en la placa R-Car X5H mediante llama.cpp modificado. Para el desarrollador general, sin embargo, sigue siendo mas directo usar el repositorio original de Microsoft o GGUF cuantizados de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Microsoft Phi-4-mini-instruct) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16 (unico fichero publicado: `fp16/Phi-4-mini-instruct-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (F16), 7,7 GB, SHA-256 `8c61a6508269df3163fbc7baf2771567f42abfd0727cb113aeefaab5e52b03d2` |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Lo unico documentado es el proceso de conversion: los pesos originales de `microsoft/Phi-4-mini-instruct` se transformaron a F16 con `convert_hf_to_gguf.py` de llama.cpp, sin modificaciones posteriores. No hay fine-tuning, destilacion ni ajuste por RLHF/DPO realizado por Renesas.

La innovacion tecnica del repositorio no esta en el modelo sino en el entorno de ejecucion: el SDK npx-llm empaqueta llama.cpp con un backend especifico para la NPU NPX6 del SoC R-Car X5H. La model card documenta el comando de arranque con `-at f16` (tipo de atencion en FP16), `-fa on` (flash attention activada) y `NPX_MEMORY_MB=18432` (18 GB de memoria reservada), lo que indica el perfil de memoria previsto para inferencia en la placa.

## Capacidades

- Generacion de texto e instrucciones: hereda las capacidades del modelo base Phi-4-mini-instruct de Microsoft.
- Razonamiento y matematicas: capacidades del modelo base, no documentadas en este repositorio.
- Generacion de codigo: capacidades del modelo base, no documentadas en este repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan listados.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en la placa Renesas R-Car X5H: el caso de uso documentado explicitamente. Se descarga el GGUF con `hf download`, se verifica el SHA-256 y se ejecuta con `start-llama-cli.sh` sobre la NPU NPX6. Es el escenario para el que Renesas publico el artefacto.
- Desarrollo y validacion de pipelines embebidos: sirve como referencia de un modelo de instrucciones de tamano medio ejecutado en un SoC automotriz, util para prototipar asistentes de a bordo o interfaces de voz en cabina.
- Punto de partida para cuantizaciones propias: al ser un GGUF F16 sin modificar, se puede recuantizar a Q8_0, Q5_K_M o Q4_K_M con llama.cpp para reducir el peso de 7,7 GB y ajustarlo a presupuestos de memoria mas ajustados.
- Verificacion de integridad en cadena de suministro: el SHA-256 publicado permite validar que el fichero descargado coincide con el artefacto que Renesas valido en su SDK.
- Reproduccion de entornos llama.cpp: util para equipos que necesiten un GGUF F16 canonico del modelo base cuando no encuentren uno publicado por el autor original.
- Evaluacion comparativa de backends: permite medir el rendimiento del backend NPU de Renesas frente a ejecuciones en CPU o GPU con el mismo fichero de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero F16 ocupa 7,7 GB; la model card configura `NPX_MEMORY_MB=18432` (18 GB) para la ejecucion en la placa R-Car X5H.
- GPU recomendadas: no disponibles en la informacion proporcionada. El destino documentado es la NPU NPX6 del SoC R-Car X5H.
- Compatibilidad con GPU de consumo: no documentada. Un F16 de 7,7 GB requiere al menos 8 GB de memoria libre en cualquier acelerador que lo ejecute; no se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: npx-llm (llama.cpp con backend NPX6), distribuido en el portal de clientes de Renesas. Tambien es compatible con llama.cpp estandar al ser un GGUF F16, aunque no se documenta esa ruta.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de ejecucion documentados: `-at f16 -fa on -t 4` (4 hilos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/Phi-4-mini-instruct-GGUF | no disponible | no disponible | GGUF F16 | MIT | Hugging Face (0 descargas) |
| microsoft/Phi-4-mini-instruct | no disponible | no disponible | safetensors (original) | MIT | Hugging Face (modelo base) |
| Otros GGUF de Phi-4-mini-instruct | no disponible | no disponible | GGUF | MIT | no verificado en la informacion disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y origen.

## Limitaciones y advertencias

- El repositorio no introduce ninguna mejora sobre el modelo base: hereda todos sus sesgos, riesgos de alucinacion y limitaciones idiomaticas, que no estan documentados aqui.
- La model card no lista idiomas soportados, por lo que no se puede garantizar un comportamiento adecuado en castellano sin evaluacion previa.
- El unico formato publicado es F16 (7,7 GB), lo que lo hace poco practico para entornos con memoria limitada sin recuantizar.
- La licencia MIT del modelo base se aplica al fichero, pero el SDK npx-llm necesario para el backend NPU se distribuye solo a traves del portal de clientes de Renesas, no publicamente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso ni de validacion por parte de la comunidad.
- El soporte esta atado al hardware R-Car X5H; fuera de esa placa, el valor anadido del repositorio desaparece frente al modelo original.
- No se documentan resultados de evaluacion de calidad, seguridad ni sesgos para este artefacto concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Renesas/Phi-4-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia MIT: https://opensource.org/license/mit
- Renesas (sitio corporativo): https://www.renesas.com/
- Renesas, productos: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Cobertura de Renesas en L'Embarque: https://lembarque.com/entreprise/renesas
