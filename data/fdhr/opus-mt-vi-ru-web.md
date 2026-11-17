# fdhr/opus-mt-vi-ru-web

## Resumen

`fdhr/opus-mt-vi-ru-web` es una conversión a ONNX con cuantización int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-vi-ru`, perteneciente a la familia OPUS-MT desarrollada por el grupo de investigación de lenguaje de la Universidad de Helsinki (Jörg Tiedemann y colaboradores). El modelo original traduce texto del vietnamita (`vi`) al ruso (`ru`) mediante una arquitectura transformer encoder-decoder de tipo Marian. Esta versión concreta no reentrena ni modifica los pesos: únicamente los exporta y comprime para su ejecución en el navegador a través de Transformers.js.

La relevancia de esta ficha reside en su formato de despliegue: al estar cuantizado a int8 y empaquetado en ONNX, el modelo puede ejecutarse íntegramente en el cliente (navegador o dispositivo móvil) sin depender de infraestructura de servidor. El autor lo emplea en la función de traducción de frases de su aplicación Notely para teléfonos móviles. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0, heredada del modelo base.

Se trata, por tanto, de un artefacto de ingeniería de despliegue más que de un modelo novedoso: su interés está en el pipeline de exportación (separación de `lm_head` del embedding compartido para permitir la cuantización) y en su idoneidad para traducción de frases en entornos con recursos limitados y sin conectividad garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB; los ficheros ONNX cuantizados suman 136,2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (`dtype: 'q8'` en Transformers.js) |
| Idiomas soportados | vietnamita (`vi`) como origen, ruso (`ru`) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, la arquitectura transformer encoder-decoder que Helsinki-NLP emplea en toda su familia OPUS-MT para traducción automática neuronal. El encoder procesa la secuencia en vietnamita y el decoder genera la traducción al ruso de forma autorregresiva. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de ajuste fino adicionales; la model card del autor indica explícitamente que no se ha realizado entrenamiento adicional sobre los pesos originales.

La innovación técnica de esta versión es puramente de empaquetado. El autor separa el `lm_head` del embedding compartido para que el compresor lo trate como una constante, exporta con `optimum-onnx` 0.1.0 (transformers 4.57.6, torch 2.8.0) y cuantiza con `scripts/quantize.py` de Transformers.js 3.7.6 en modo `q8`. El tokenizer se genera con `scripts/extra/marian.py` de la misma versión. El resultado son tres ficheros: `tokenizer.json` (7,0 MB), `onnx/decoder_model_merged_quantized.onnx` (86,9 MB) y `onnx/encoder_model_quantized.onnx` (49,3 MB).

## Capacidades

- Traducción de texto del vietnamita al ruso, en modo texto a texto.
- Ejecución en navegador y en dispositivos móviles mediante Transformers.js con `dtype: 'q8'`.
- Traducción de frases y oraciones individuales; el autor la describe como función de traducción de frases, no de documentos largos.
- Inferencia local sin conexión a un servidor una vez descargados los ficheros.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada estrictamente al par `vi` → `ru`; no se documenta traducción inversa ni a terceros idiomas.

## Casos de uso

- Traducción de frases en aplicaciones móviles sin backend: el modelo se integra con Transformers.js y ejecuta la inferencia en el dispositivo, de modo que la app Notely puede traducir texto vietnamita a ruso sin enviar el contenido a un servidor, lo que reduce latencia y mejora la privacidad.
- Traducción en el navegador para sitios web y extensiones: al cargar los ficheros ONNX cuantizados (136,2 MB en total), una página puede ofrecer traducción de fragmentos de texto seleccionados sin depender de una API externa.
- Procesamiento por lotes de contenido vietnamita en entornos con recursos limitados: el tamaño reducido del modelo permite ejecutarlo en contenedores pequeños o en máquinas sin GPU dedicada para traducir colecciones de frases a ruso.
- Herramientas de atención al cliente para comunidades vietnamitas en mercados rusófonos: traducción de mensajes entrantes en vietnamita a ruso para que agentes humanitarios o de soporte puedan responder, con la ventaja de que el texto no sale del dispositivo del operador.
- Preprocesamiento de corpus para investigación: traducción de conjuntos de frases vietnamitas a ruso como paso previo a tareas de análisis lingüístico o construcción de datasets paralelos de bajo volumen.
- Aplicaciones de mensajería con traducción integrada: integración en clientes de chat que traduzcan mensajes individuales al vuelo en el propio teléfono, aprovechando que el modelo cabe en el almacenamiento de un dispositivo móvil y no requiere conectividad permanente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas BLEU, COMET ni comparaciones cuantitativas con otros sistemas, y tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida; los pesos cuantizados suman 136,2 MB, por lo que la huella de memoria es del orden de cientos de megabytes incluyendo activaciones y tokenizer.
- GPU recomendadas: no se especifican; el diseño está orientado a CPU y ejecución en navegador (WebGPU/WASM mediante Transformers.js), no a GPU de datacenter.
- Cabe en GPU de consumo: sí, con enorme margen; también en dispositivos móviles y en el navegador, que es el objetivo declarado del autor.
- Opciones de despliegue: Transformers.js 3.7.6 o superior con `dtype: 'q8'`; los ficheros ONNX también pueden cargarse con runtimes ONNX genéricos, aunque no se documenta una configuración concreta para vLLM, llama.cpp, Ollama o TGI (herramientas no orientadas a este formato).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fdhr/opus-mt-vi-ru-web` | Marian + ONNX int8 | vi → ru | no disponible | Apache-2.0 | ONNX cuantizado | Ejecución en navegador vía Transformers.js |
| `Helsinki-NLP/opus-mt-vi-ru` | Marian | vi → ru | no disponible | Apache-2.0 | safetensors / PyTorch | Modelo base sin cuantizar; requiere framework de inferencia |
| Otros modelos OPUS-MT de Helsinki-NLP | Marian | Pares diversos | no disponible | Apache-2.0 | safetensors / PyTorch | Misma familia; no se dispone de datos comparativos de calidad para el par vi-ru |

No se dispone de información sobre benchmarks comparativos entre estas alternativas ni sobre modelos de traducción vi-ru de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de OPUS-MT, hereda los sesgos de los corpus paralelos empleados por Helsinki-NLP, no descritos en esta ficha.
- Riesgo de alucinación: no cuantificado; como todo sistema NMT, puede generar traducciones fluidas pero incorrectas en frases ambiguas, nombres propios o terminología especializada.
- Limitaciones de contexto e idioma: solo traduce vietnamita a ruso; no se documenta la longitud máxima de secuencia ni el comportamiento con textos largos. El autor lo describe para traducción de frases, no de documentos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución; debe conservarse el aviso de licencia y reconocerse la autoría original de OPUS-MT (Jörg Tiedemann y colaboradores).
- Caveats para producción: la cuantización int8 puede degradar ligeramente la calidad respecto al modelo original en PyTorch, y no se han publicado evaluaciones de esa pérdida. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria. La fecha de creación indicada (2026-11-17) debe verificarse antes de citarla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fdhr/opus-mt-vi-ru-web
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-vi-ru
- Transformers.js: https://github.com/huggingface/transformers.js
- Familia OPUS-MT (Helsinki-NLP): https://huggingface.co/Helsinki-NLP
- Paper de OPUS-MT (Tiedemann y Thottingal): no disponible en la información proporcionada
- Repositorio del autor o demo de Notely: no disponible en la información proporcionada
