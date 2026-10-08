# sebekblessing/klein-qnn-8elite

## Resumen

Klein QNN 8 Elite es una conversion para telefono movil del modelo de generacion de imagenes FLUX.2 [klein] 4B, desarrollado originalmente por Black Forest Labs. El autor de esta conversion, sebekblessing, ha compilado los pesos originales como binarios de contexto QNN para la unidad neural Hexagon v79 del SoC Snapdragon 8 Elite (por ejemplo, el iQOO 13). El objetivo es ejecutar generacion de imagenes de 512x512 en 4 pasos y edicion de imagen guiada por instruccion directamente en el NPU del dispositivo, sin depender de la nube.

El modelo base FLUX.2 [klein] 4B es un modelo de difusion de aproximadamente 4000 millones de parametros para la parte de sintesis de imagen. La conversion incluye tres componentes empaquetados por separado: un lector de prompt basado en Qwen3-4B, el modelo de dibujo dividido en cuatro partes y un codificador-decodificador de imagen taef2 de madebyollin. Los pesos se convirtieron a ONNX, se cuantizaron y se compilaron para el NPU, por lo que los resultados pueden diferir ligeramente de los del modelo original.

La relevancia de esta ficha radica en que documenta un caso de despliegue on-device de un modelo de difusion de gran tamano sobre hardware movil especializado en IA. El repositorio es de 5,0 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en aplicaciones moviles de terceros. No obstante, la informacion publicada es muy limitada y varios datos tecnicos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion FLUX.2 [klein] 4B (generacion de imagen) + codificador de texto Qwen3-4B + autoencoder taef2; compilado como binarios de contexto QNN para Hexagon v79 |
| Parametros totales | 4B en el modelo de dibujo (FLUX.2 [klein] 4B); el codificador de texto Qwen3-4B aporta 4B adicionales |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion para QNN (los archivos indican pesos en formato q8, es decir, 8 bits, ademas de binarios compilados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (componentes: FLUX.2 [klein] 4B Apache 2.0, Qwen3-4B Apache 2.0, taef2 MIT) |
| Formato de pesos | Binarios de contexto QNN (.bin) derivados de ONNX; pesos crudos en `klein_qwen_q8.raw`; tokenizador en `qwen_tokenizer.json` |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna del modelo base mas alla de identificarlo como FLUX.2 [klein] 4B, un modelo de generacion de imagenes de 4B de parametros. La conversion esta desglosada en tres bloques funcionales claramente diferenciados. El primero es el lector de prompt, compuesto por los archivos `text0.bin` a `text2.bin`, `klein_qwen_q8.raw` y `qwen_tokenizer.json`, que corresponde a un codificador de texto Qwen3-4B. El segundo es el modelo de dibujo, dividido en `part0.bin` a `part3.bin`. El tercero son los archivos `enc.bin` y `dec.bin`, que implementan el codificador y decodificador de imagen taef2.

No se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El proceso de conversion si esta descrito a grandes rasgos: los pesos se transformaron a ONNX, se cuantizaron y se compilaron para la unidad neural. Esta compilacion especifica para el hardware es la innovacion tecnica central de la ficha, ya que permite ejecutar un modelo de difusion de 4B sobre el NPU Hexagon v79 de un SoC movil en lugar de sobre GPU de servidor.

## Capacidades

- Generacion de imagenes de texto a imagen a resolucion 512x512 en 4 pasos de muestreo.
- Edicion de imagen guiada por instruccion textual (image editing a partir de un prompt).
- Procesamiento del prompt mediante un codificador de texto Qwen3-4B.
- Codificacion y decodificacion de imagen mediante el autoencoder taef2.
- Ejecucion on-device sobre el NPU Hexagon v79 del Snapdragon 8 Elite.
- Integracion con aplicaciones moviles mediante un manifiesto (`manifest.json`) que lista archivos, tamanos y hashes SHA-256 para la descarga.
- No se documentan capacidades de tool calling, agentes, vision adicional, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de imagenes en aplicaciones moviles sin conexion: el modelo se ejecuta en el NPU del Snapdragon 8 Elite, por lo que una app puede producir imagenes de 512x512 a partir de texto sin enviar datos a un servidor, lo que reduce latencia y mejora la privacidad.
- Edicion fotografica asistida por lenguaje natural: el usuario puede aplicar instrucciones textuales sobre una imagen existente y obtener una version editada directamente en el dispositivo, util para apps de retoque rapido.
- Creacion de avatares e ilustraciones para redes sociales: la generacion en 4 pasos permite respuestas casi interactivas, adecuadas para flujos donde el usuario itera sobre variaciones de una imagen.
- Herramientas de diseno para movilidad: disenadores que trabajan en tableta o telefono pueden generar bocetos y variaciones sin depender de conectividad ni de servicios en la nube.
- Integracion en asistentes de escritura o mensajeria: generar imagenes de acompanamiento para publicaciones o mensajes dentro de la propia aplicacion, aprovechando el codificador Qwen3-4B para interpretar prompts redactados por el usuario.
- Demostraciones tecnicas y experimentacion con modelos de difusion on-device: sirve como referencia para desarrolladores que quieran portar otros modelos de difusion a QNN sobre Snapdragon 8 Elite.
- Aplicaciones de privacidad estricta: en entornos donde no se puede enviar contenido del usuario a terceros (sanitario, legal o corporativo), la ejecucion local del pipeline completo evita la fuga de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Snapdragon 8 Elite con unidad neural Hexagon v79 (por ejemplo, iQOO 13). El modelo esta compilado especificamente para este NPU.
- No se proporcionan estimaciones de VRAM ni de memoria, ya que no esta disenado para ejecucion en GPU de escritorio o servidor.
- El repositorio ocupa 5,0 GB, lo que da una referencia del espacio de almacenamiento necesario para los binarios y los pesos crudos.
- No se indica compatibilidad con GPU consumer (RTX 4090, etc.), con A100/H100 ni con runtimes de servidor como vLLM, TGI, llama.cpp u Ollama; al estar en formato QNN, el despliegue depende del runtime de Qualcomm para el NPU.
- No se publican datos de latencia ni throughput. La model card unicamente menciona que genera 512x512 en 4 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klein QNN 8 Elite (esta ficha) | 4B (dibujo) + 4B (texto Qwen3-4B) | no disponible | QNN para Hexagon v79 | Apache 2.0 | HuggingFace |
| FLUX.2 [klein] 4B (original) | 4B (dibujo) | no disponible | Pesos originales (safetensors, presumiblemente) | Apache 2.0 | HuggingFace |
| Qwen3-4B | 4B | no disponible | Pesos originales | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparativa se limita al componente de parametros, licencia y formato de despliegue. Como alternativa de categoria no disponible se puede considerar cualquier otro modelo de difusion on-device, pero no se aportan datos en esta ficha.

## Limitaciones y advertencias

- Al estar compilado especificamente para el NPU Hexagon v79 del Snapdragon 8 Elite, el modelo no es portable a otros SoC, NPU o GPU sin reconversion.
- La cuantizacion y compilacion para el NPU pueden introducir diferencias en las imagenes generadas respecto al modelo original, tal y como advierte el autor.
- No se documentan sesgos conocidos, comportamiento multilingue ni limites de contexto; estos datos no estan disponibles.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido inexacto o no fiel al prompt, aunque no se cuantifica en la informacion disponible.
- No se especifican restricciones adicionales de uso comercial mas alla de las licencias de los componentes: Apache 2.0 para FLUX.2 [klein] 4B y Qwen3-4B, y MIT para taef2, todas permisivas para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria publica de su funcionamiento.
- El correcto funcionamiento depende de que la aplicacion cliente interprete el `manifest.json` y descargue los archivos con los hashes SHA-256 correctos.
- No se ofrece soporte, documentacion de API ni garantias por parte del autor.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/sebekblessing/klein-qnn-8elite
- Modelo original FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- taef2 de madebyollin: no se proporciona enlace directo en la informacion disponible
- Qwen3-4B: no se proporciona enlace directo en la informacion disponible
