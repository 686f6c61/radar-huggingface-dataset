# blaj/Qwen3.8-27B-heretic-ara-int8-ov

## Resumen

`blaj/Qwen3.8-27B-heretic-ara-int8-ov` es una conversión a OpenVINO IR del modelo `heretic-org/Qwen3.8-27B-heretic-ara`, un modelo de visión-lenguaje (VLM) de 27 000 millones de parámetros construido sobre la arquitectura `qwen3_5`. La conversión, realizada con Optimum Intel, comprime los pesos a INT8 mediante NNCF (`compress_weights`, modo `INT8_ASYM`) y descompone el modelo en varios grafos OpenVINO especializados: decoder de texto, embeddings de texto, torre de visión (embeddings, posicional y merger), cabeza MTP y tokenizer/detokenizer.

El interés principal de esta ficha es doble. Por un lado, es un ejemplo de empaquetado listo para producción sobre el stack de Intel: se ejecuta con OpenVINO GenAI directamente sobre CPU, iGPU o GPU Intel Arc, sin necesidad de GPUs NVIDIA. Por otro, incorpora una cabeza de predicción multi-token (`openvino_mtp_model`) que permite decodificación especulativa en paralelo por bloques cuando se empareja con un borrador DFlash compatible.

El modelo base pertenece a la familia `heretic`, asociada a ajustes orientados a eliminar el alineamiento restrictivo (etiquetado como `uncensored`), y la licencia declarada es Apache-2.0. El repositorio ocupa 27,8 GB y, en el momento de redactar esta ficha, acumula 3 descargas y 0 likes, por lo que se trata de un artefacto muy reciente y sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención (64 capas de texto: 48 de atención lineal + 16 de atención completa) con torre de visión de 27 niveles; familia `qwen3_5` |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en INT8 asimétrico (`INT8_ASYM`, 8 bits) mediante `nncf.compress_weights`; formato OpenVINO IR |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`): `openvino_language_model`, `openvino_text_embeddings_model`, `openvino_vision_embeddings_model`, `openvino_vision_pos_model`, `openvino_vision_merger_model`, `openvino_mtp_model`, `openvino_tokenizer`, `openvino_detokenizer` |
| Dimension oculta | 5120 |
| Tamano del repositorio | 27,8 GB |
| Pipeline | image-text-to-text |
| Libreria | openvino |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con una estrategia de atención híbrida: de las 64 capas del decodificador de texto, 48 utilizan atención lineal y 16 atención completa, con una dimensión oculta de 5120. Esta combinación reduce el coste computacional y de memoria del contexto largo respecto a un transformer íntegramente de atención cuadrática, manteniendo un subconjunto de capas con atención completa para preservar la calidad de recuperación de información. La torre de visión tiene 27 niveles de profundidad y se exporta en tres etapas separadas (embeddings, posicional y merger), lo que permite al runtime de OpenVINO gestionar las activaciones de imagen de forma independiente al decoder.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento) no están disponibles en la información proporcionada. El sufijo `heretic` indica que el modelo base ha sido sometido a algún tipo de intervención sobre sus capas de alineamiento, habitualmente mediante técnicas de abliteración o ajuste dirigido; el autor original no documenta el procedimiento en la información disponible.

La innovación técnica relevante en este artefacto concreto es la inclusión de la cabeza MTP (`openvino_mtp_model`), exportada por Optimum Intel, que habilita decodificación especulativa en paralelo por bloques cuando se empareja con un borrador DFlash compatible. La conversión se realizó con Optimum Intel, Transformers 5.2.0 y OpenVINO 2026.3.1, y requiere un `TMPDIR` sobre disco real: el proceso de exportación hace staging de aproximadamente 74 GB de pesos comprimidos de forma temporal.

## Capacidades

- Generación de texto conversacional en formato image-text-to-text.
- Comprensión de imágenes: la torre de visión de 27 niveles permite describir, interpretar y razonar sobre contenido visual.
- Razonamiento multimodal: combinación de entrada de imagen y texto en un mismo contexto.
- Decodificación especulativa mediante cabeza MTP, con soporte para borradores DFlash.
- Modelo etiquetado como `uncensored`: el autor declara que se han atenuado las restricciones de contenido del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento explícito (thinking mode), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos escaneados con componentes visuales: el modelo puede recibir una imagen de una factura, un formulario o un gráfico y generar una transcripción estructurada o un resumen textual, gracias a la torre de visión y al decoder de texto integrados en un único pipeline.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en catálogos, plataformas educativas o archivos multimedia, desplegable enteramente sobre hardware Intel sin GPU dedicada.
- Asistente conversacional local con entrada de imagen: dado que se distribuye en formato OpenVINO IR INT8 y se ejecuta sobre iGPU o GPU Arc, es adecuado para asistentes de escritorio que no pueden enviar datos a la nube por requisitos de privacidad.
- Extracción de información de capturas de pantalla o interfaces: útil en herramientas de automatización de QA que necesitan interpretar el estado de una UI a partir de una imagen y producir una descripción textual.
- Despliegue en edge sobre equipos Intel: al estar optimizado con NNCF y OpenVINO, puede ejecutarse en estaciones de trabajo con CPU Xeon o con aceleradores Arc, sin depender de CUDA.
- Generación de contenido sin filtros editoriales: el etiquetado `uncensored` lo hace apto para investigación sobre alineamiento, red teaming y estudios de comportamiento de modelos, siempre que se asuma la responsabilidad legal y ética del contenido generado.
- Servicio de inferencia multimodal con decodificación especulativa: en escenarios con SLA de latencia estricto, la cabeza MTP permite acelerar la generación emparejándola con un borrador DFlash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni comparaciones con modelos alternativos. Tampoco se han encontrado datos de throughput o latencia medidos sobre hardware concreto.

## Requisitos de hardware

- Peso del repositorio: 27,8 GB, correspondiente a los pesos ya cuantizados a INT8. Esta cifra es un buen punto de partida para estimar la memoria necesaria para cargar el modelo.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, cargar los pesos INT8 requiere del orden de 28 GB, a lo que hay que sumar el espacio para la caché KV y las activaciones de la torre de visión; el requisito total dependerá de la longitud de contexto configurada y del número de imágenes por petición.
- GPU recomendadas: el modelo está etiquetado explícitamente para `intel-arc`, por lo que las GPU Intel Arc (tanto dedicadas como iGPU integradas) son el objetivo declarado. No se documentan requisitos para GPU NVIDIA ni AMD.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Un modelo de 27B en INT8 no cabe en GPUs de consumo con 8-12 GB de VRAM; requeriría al menos una GPU con 24-32 GB o el uso de memoria del sistema mediante OpenVINO sobre CPU/iGPU.
- Opciones de despliegue: OpenVINO GenAI con `ov_genai.VLMPipeline`, que permite seleccionar el dispositivo (`GPU`, `CPU`, etc.). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos es OpenVINO IR y no GGUF ni safetensors.
- Latencia y throughput estimados: no disponible.

Ejemplo de uso documentado por el autor:

```python
import openvino_genai as ov_genai
pipe = ov_genai.VLMPipeline(".", "GPU")
print(pipe.generate("Describe this image.", image=image_tensor))
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `blaj/Qwen3.8-27B-heretic-ara-int8-ov` | 27B | no disponible | OpenVINO IR INT8 | Apache-2.0 | HuggingFace, 3 descargas |
| `heretic-org/Qwen3.8-27B-heretic-ara` | 27B | no disponible | no disponible | no disponible | Modelo base referenciado |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada, ni de datos de rendimiento que permitan establecer una comparación cuantitativa con alternativas de la misma categoría (modelos VLM de ~27B). La comparación con el modelo base se limita al formato y al proceso de cuantización, ya que no se publican métricas de ninguno de los dos artefactos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningún dato publicado que permita estimar la calidad del modelo en tareas de texto, visión o razonamiento. Cualquier uso en producción debería ir precedido de una evaluación propia y exhaustiva.
- Modelo etiquetado como `uncensored` y `heretic`: es previsible que las salvaguardas de contenido estén atenuadas o eliminadas. Esto implica riesgo de generar contenido ofensivo, inseguro o legalmente problemático, y responsabilidad plena del operador sobre las salidas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no existe documentación que cuantifique la tasa de alucinación en tareas de visión o texto.
- Idiomas soportados: no disponible. Se desconoce si el sufijo `ara` del nombre implica un ajuste específico para árabe o si la cobertura multilingüe se mantiene respecto al modelo Qwen original. No se debe asumir soporte de castellano sin verificarlo.
- Longitud de contexto: no disponible. Es un parámetro crítico para planificar memoria y para casos de uso con documentos largos.
- Formato propietario del ecosistema OpenVINO: los pesos no son directamente portables a vLLM, llama.cpp, Ollama o TGI. Migrar a otro runtime exigiría reconvertir desde el modelo base.
- Huella de memoria elevada: 27,8 GB de pesos en INT8 más caché KV implica que el despliegue en GPU de consumo de gama alta no está garantizado.
- Proceso de exportación exigente: la conversión requiere un `TMPDIR` sobre disco real con unos 74 GB libres, ya que OpenVINO hace staging de los pesos comprimidos en ese directorio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo base procede de la familia Qwen de Alibaba Cloud; conviene verificar las condiciones del modelo original antes de redistribuir.
- Adopción mínima: 3 descargas y 0 likes en el momento de la consulta. No hay evidencia comunitaria de funcionamiento correcto en distintos entornos.
- Los resultados de búsqueda web asociados a la consulta no contienen ninguna información técnica relevante sobre el modelo; los enlaces devueltos son contenido no relacionado y se omiten deliberadamente.

## Enlaces

- Modelo en HuggingFace (este artefacto): https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int8-ov
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Optimum Intel (herramienta de conversión): no disponible en la información proporcionada
- OpenVINO GenAI (runtime de inferencia): no disponible en la información proporcionada
- NNCF (cuantización): no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponible en la información proporcionada
