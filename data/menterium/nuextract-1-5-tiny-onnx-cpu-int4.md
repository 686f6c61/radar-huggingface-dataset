# Menterium/NuExtract-1.5-tiny-onnx-cpu-int4

## Resumen
NuExtract-1.5-tiny-onnx-cpu-int4 es una conversion no oficial del modelo de extraccion de informacion numind/NuExtract-1.5-tiny a formato ONNX, cuantizada a int4 y optimizada para inferencia en CPU mediante ONNX Runtime GenAI. La publica el usuario Menterium y esta pensada para su uso en proceso dentro de una aplicacion de escritorio .NET, sin dependencia de GPU ni de servicios externos.

NuExtract no es un modelo de chat: recibe una plantilla JSON vacia junto a un texto y devuelve la misma plantilla rellena con los valores copiados literalmente del texto de entrada, dejando `""` cuando no encuentra un campo. El modelo original, desarrollado por NuMind, esta basado en Qwen2.5-0.5B (Apache 2.0) y cuenta con unos 0,5 mil millones de parametros y una ventana de contexto de 32.768 tokens.

La relevancia de esta conversion radica en que empaqueta el modelo en un unico artefacto ONNX de aproximadamente 0,33 GB con cuantizacion int4 weight-only (MatMulNBits) para el execution provider de CPU, lo que permite ejecutar extraccion estructurada en hardware modesto y en entornos sin GPU, a costa de cierta perdida de precision respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo original basado en Qwen2.5-0.5B) |
| Parametros totales | Aproximadamente 0,5 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun `genai_config.json`) |
| Tipos de cuantizacion | int4 weight-only (MatMulNBits); existe tambien un export fp32 probado por el autor |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | MIT (el modelo original tambien es MIT; Qwen2.5-0.5B es Apache 2.0) |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) para onnxruntime-genai |

## Arquitectura y entrenamiento
El artefacto es una exportacion ONNX del modelo original numind/NuExtract-1.5-tiny (revision `63e2e80c804d9c97f3f19a4aa25613e7beca83c9`). Ese modelo original se construye sobre Qwen/Qwen2.5-0.5B, por lo que la arquitectura subyacente es la de un transformer decoder-only de aproximadamente 0,5 mil millones de parametros. Aparte de la cuantizacion int4, los pesos no se han modificado respecto al original.

La conversion se realizo con el Model Builder de onnxruntime-genai 0.16.0, con transformers 5.17.0 y PyTorch 2.14 sobre CPU. En la informacion disponible no se detallan los datos de entrenamiento del modelo original (numero de tokens, composicion del corpus, ni el uso de RLHF o DPO). La innovacion tecnica destacable de esta ficha es la propia cuantizacion: empaquetado int4 weight-only orientado al execution provider de CPU de ONNX Runtime GenAI, con soporte de decodificacion restringida por esquema JSON para garantizar que la salida sea valida y para finalizar la generacion tras la llave de cierre.

## Capacidades
- Extraccion de informacion estructurada: rellena plantillas JSON a partir de un texto libre, copiando los valores de forma literal.
- Manejo de campos ausentes: devuelve `""` cuando el valor solicitado no aparece en el texto.
- Generacion con salida restringida: admite decodificacion guiada por esquema JSON (constrained decoding), finalizando la generacion al cerrar la llave.
- Soporte multilingue, heredado de la familia NuExtract y de Qwen2.5-0.5B; la lista exacta de idiomas no esta disponible.
- Contexto largo: ventana de 32.768 tokens, adecuada para documentos de entrada extensos.
- Uso combinado con reglas deterministas: el autor recomienda plantillas cortas y delegar en el modelo solo los campos que las reglas no resuelven.
- No es un modelo de chat: no se documenta soporte de tool calling, function calling ni razonamiento multi-paso en agente.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Extraccion de datos de confirmaciones de pedido: el autor lo probo sobre confirmaciones de pedido en aleman, rellenando plantillas con campos como nombre, direccion o ciudad directamente desde el texto.
- Procesamiento de facturas y albaranes: convertir documentos no estructurados en JSON con campos como emisor, importe o numero de referencia, aprovechando la ventana de 32.768 tokens para documentos largos.
- Integracion en aplicaciones de escritorio .NET: el artefacto esta pensado para ejecutarse en proceso mediante el paquete NuGet `Microsoft.ML.OnnxRuntimeGenAI`, sin depender de servicios de inferencia externos.
- Preprocesamiento para pipelines RAG: extraer y normalizar campos de documentos antes de indexarlos, de modo que las busquedas operen sobre datos estructurados.
- Extraccion de entidades de correos y formularios: identificar nombres, direcciones, identificadores o fechas en correspondencia y formularios de contacto.
- Despliegue en entornos sin GPU: al ejecutarse sobre el execution provider de CPU, es adecuado para maquinas de oficina, servidores on-premise o entornos edge donde no hay acelerador disponible.
- Normalizacion de datos con reglas y modelo: combinarlo con reglas deterministas para los campos predecibles y reservar el modelo para los casos ambiguos, reduciendo el coste computacional.
- Extraccion multilingue de datos de contacto: procesar textos en varios idiomas dentro del mismo flujo de captura de datos, sin listado de idiomas confirmado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento medido es el de inferencia en CPU: sobre un Intel Core i7-9700K (8 nucleos, AVX2, sin GPU) el autor reporta aproximadamente 240 tokens/s para el prompt y 25 tokens/s para la respuesta. El autor indica ademas que la cuantizacion int4 tiene cierto coste de precision frente al modelo original y que un export fp32, probado sobre confirmaciones de pedido en aleman, no resulto mas preciso en la practica pero si aproximadamente cuatro veces mas lento.

## Requisitos de hardware
- El modelo esta disenado para inferencia en CPU; no requiere GPU. El execution provider objetivo es el de CPU de ONNX Runtime GenAI.
- Peso del artefacto: aproximadamente 0,33 GB en disco; el fichero de pesos `model.onnx.data` ocupa 320.970.752 bytes.
- Memoria: al ser un modelo de ~0,5 mil millones de parametros en int4, la huella de memoria es reducida; el valor exacto de RAM en tiempo de ejecucion no esta disponible en la informacion proporcionada.
- CPU de referencia probada: Intel Core i7-9700K, 8 nucleos, con soporte AVX2.
- Throughput medido: aproximadamente 240 tokens/s de prompt y 25 tokens/s de generacion en la CPU de referencia, sin GPU.
- GPUs recomendadas: no disponible; esta exportacion esta pensada para el execution provider de CPU, no para GPU.
- Encaje en GPU de consumo: no aplica a esta exportacion; requeriria una conversion distinta orientada a GPU.
- Despliegue: ONNX Runtime GenAI 0.16 o superior, mediante el paquete NuGet `Microsoft.ML.OnnxRuntimeGenAI` o el paquete PyPI `onnxruntime-genai`. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que consumen otros formatos.
- Runtime de conversion documentado: onnxruntime-genai 0.16.0 con transformers 5.17.0 y PyTorch 2.14 (el model builder 0.16 requiere transformers 5.x; con 4.x falla en la importacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NuExtract-1.5-tiny-onnx-cpu-int4 (este) | ~0,5 B | 32.768 tokens | ONNX int4 (CPU) | MIT | HuggingFace, conversion no oficial de Menterium |
| numind/NuExtract-1.5-tiny (original) | ~0,5 B | No disponible en la informacion | Pesos PyTorch originales | MIT | HuggingFace, oficial de NuMind |
| Export fp32 de este modelo (mencionado en las notas) | ~0,5 B | 32.768 tokens (presumiblemente, no confirmado) | ONNX fp32 | MIT | No publicado como repositorio; solo citado por el autor |
| Qwen/Qwen2.5-0.5B (modelo base del original) | ~0,5 B | No disponible en la informacion | safetensors | Apache 2.0 | HuggingFace, oficial de Qwen |

El modelo base Qwen2.5-0.5B no es un modelo de extraccion estructurada, por lo que la comparacion con el es solo de origen arquitectonico, no funcional. No se dispone de datos de benchmarks que permitan comparar el rendimiento de extraccion frente a alternativas.

## Limitaciones y advertencias
- No es un modelo de chat: solo esta disenado para rellenar plantillas JSON a partir de un texto; no debe usarse como asistente conversacional.
- La cuantizacion int4 introduce cierta perdida de precision respecto al modelo original, segun reconoce el propio autor.
- Riesgo de alucinacion: aunque el modelo copia valores del texto, no hay garantia de que todos los campos extraidos sean correctos; se recomienda validacion posterior.
- Rendimiento limitado con plantillas largas: el autor indica que los modelos pequenos se benefician de plantillas cortas y recomienda combinarlo con reglas deterministas.
- Lista de idiomas soportados no disponible; solo se declara de forma generica como multilingue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Es una conversion no oficial: no esta afiliada ni respaldada por NuMind, que no publica un export ONNX de este modelo.
- Restricciones de licencia: el modelo es MIT y el modelo base Qwen2.5-0.5B es Apache 2.0; conviene conservar ambos ficheros de licencia (`LICENSE` y `LICENSE-Qwen2.5`) en cualquier redistribucion.
- Rendimiento en produccion: el dato de throughput corresponde a una CPU concreta (i7-9700K, AVX2); en CPUs sin AVX2 el rendimiento puede degradarse.
- El modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces
- Repositorio de esta conversion: https://huggingface.co/Menterium/NuExtract-1.5-tiny-onnx-cpu-int4
- Modelo original: https://huggingface.co/numind/NuExtract-1.5-tiny
- Modelo base del original: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
