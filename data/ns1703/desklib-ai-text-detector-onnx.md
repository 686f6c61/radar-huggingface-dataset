# ns1703/desklib-ai-text-detector-onnx

## Resumen

`ns1703/desklib-ai-text-detector-onnx` es una exportación a ONNX con cuantización dinámica int8 del modelo `desklib/ai-text-detector-v1.01`, un clasificador binario diseñado para detectar si un texto ha sido generado por inteligencia artificial. El autor del repositorio, ns1703, no entrena un modelo nuevo: conserva los pesos originales, los exporta al formato ONNX y los cuantiza para que puedan ejecutarse directamente en el navegador mediante `onnxruntime-web` y `transformers.js`. El resultado es un artefacto de aproximadamente 0,4 GB pensado para inferencia ligera en cliente, sin necesidad de servidor.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de despliegue de un detector de texto IA en el edge (navegador), lo que permite verificar contenido sin enviar los textos a un servicio externo. Por otro, sirve de advertencia sobre las limitaciones de los clasificadores de texto IA cuantizados: la propia model card reconoce que la cuantización int8 introduce desviaciones respecto al modelo original.

No se dispone de información sobre la arquitectura interna del modelo base, el número de parámetros, la longitud de contexto ni los datos de entrenamiento, ya que la model card del repositorio ONNX no los detalla y no se ha proporcionado la del modelo original. La licencia es MIT, lo que permite uso comercial y modificación con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `desklib/ai-text-detector-v1.01`; presumiblemente transformer encoder, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |
| Entradas | `input_ids`, `attention_mask` (int64) |
| Salida | `logits` [batch, 1]; sigmoide sobre el logit da la probabilidad de texto IA |
| Tamaño del repositorio | 0,4 GB |
| Runtime objetivo | `onnxruntime-web` / `transformers.js` (navegador) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `desklib/ai-text-detector-v1.01`. Por el uso declarado (clasificación de texto con entradas `input_ids` y `attention_mask` y una única salida de logits) y por el ecosistema `transformers.js`, es compatible con un transformer encoder de tipo BERT o similar, pero esto no está confirmado en la información proporcionada.

El proceso documentado en este repositorio es únicamente de conversión y compresión: exportación de los pesos originales a ONNX y cuantización dinámica a int8. No se indica ningún reentrenamiento, ajuste fino ni destilación. La model card advierte explícitamente de que la cuantización provoca pequeñas desviaciones en los valores de salida respecto al modelo original, por lo que las probabilidades no son idénticas a las del checkpoint de referencia.

## Capacidades

- Clasificación binaria de texto: distingue entre texto generado por IA y texto humano.
- Salida de probabilidad calibrada mediante sigmoide sobre el logit de salida.
- Ejecución en navegador mediante `onnxruntime-web` y `transformers.js`, sin backend.
- Procesamiento por lotes (`batch`) en la dimensión de entrada.
- Inferencia local: los textos analizados no salen del dispositivo del usuario.
- No se documentan capacidades de generación, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Detección de texto IA en el navegador: integrar el modelo en una extensión o aplicación web que analice textos pegados por el usuario y devuelva una probabilidad de generación automática sin enviar datos a un servidor, gracias al runtime `onnxruntime-web`.
- Moderación de contenido en foros y comentarios: clasificar en cliente los mensajes antes de publicarlos y marcar automáticamente aquellos con alta probabilidad de ser generados por IA, reduciendo carga en el backend.
- Verificación editorial en redacciones: herramienta interna para que editores comprueben la procedencia de borradores recibidos de colaboradores externos, con la ventaja de que el contenido sensible no abandona la máquina del editor.
- Filtrado de datasets: preprocesar corpus recopilados de la web para descartar muestras con alta probabilidad de ser sintéticas antes de usarlas en entrenamiento o evaluación.
- Educación y evaluación académica: asistente para docentes que quieran una señal adicional (no concluyente) sobre la autoría de un texto entregado, ejecutándose localmente para preservar la privacidad del alumnado.
- Demostraciones y prototipos: al ser un ONNX int8 de 0,4 GB con licencia MIT, sirve para montar demos de detección de IA en Spaces de Hugging Face o páginas estáticas sin infraestructura de GPU; de hecho, el autor lo usa en el Space `ns1703/ki-detektor`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un ONNX int8 de un clasificador, el grueso del repositorio (0,4 GB) corresponde a los pesos y la inferencia es ligera. No se especifica el tamaño exacto del fichero `model_quantized.onnx`.
- GPU recomendadas: no aplica; el destino declarado es CPU en navegador mediante WebAssembly/WebGPU a través de `onnxruntime-web`.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; puede ejecutarse en CPU de escritorio o portátil.
- Opciones de despliegue: `onnxruntime-web` y `transformers.js` en navegador; también es posible usar `onnxruntime` en Python, Node.js o servidores con CPU.
- Latencia y throughput: no disponibles. Dependerán del tamaño real del modelo, del dispositivo y del backend de ejecución (WASM frente a WebGPU).

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de detección de texto IA en formato ONNX para construir una comparativa con datos verificables. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ns1703/desklib-ai-text-detector-onnx | no disponible | no disponible | MIT | ONNX int8 | Este modelo |
| desklib/ai-text-detector-v1.01 | no disponible | no disponible | MIT (según este repo) | safetensors/transformers | Modelo base sin cuantizar |
| Alternativas de detección de texto IA | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- La cuantización int8 dinámica introduce desviaciones en los logits y, por tanto, en la probabilidad de salida respecto al modelo original; no debe asumirse equivalencia numérica.
- Es un clasificador binario: no explica qué fragmentos del texto son sintéticos ni aporta justificación de la decisión.
- Riesgo de falsos positivos y falsos negativos inherente a los detectores de texto IA; no se han publicado métricas de precisión, recall ni AUC en la información disponible.
- No se documentan los idiomas de entrenamiento; el rendimiento en castellano es desconocido.
- No se documenta la longitud máxima de secuencia; textos largos pueden truncarse y degradar la clasificación.
- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento por dominio (código, poesía, texto técnico, etc.).
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de copyright original y los créditos a los autores del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Para producción, tratar la salida como una señal probabilística más, nunca como prueba concluyente de autoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ns1703/desklib-ai-text-detector-onnx
- Modelo base: https://huggingface.co/desklib/ai-text-detector-v1.01
- Space de demostración del autor: https://huggingface.co/spaces/ns1703/ki-detektor
