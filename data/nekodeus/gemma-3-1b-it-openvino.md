# Nekodeus/gemma-3-1b-it-openvino

## Resumen

Gemma-3-1b-it OpenVINO es una conversión del modelo `google/gemma-3-1b-it` al formato OpenVINO IR, con cuantización weight-only INT8 aplicada mediante NNCF. La conversión la ha realizado el usuario Nekodeus con `optimum-cli` (optimum-intel 2.2.0) sobre un entorno de Kaggle sin GPU y sin token de autenticación. El resultado es un artefacto de despliegue, no un modelo nuevo: no hay entrenamiento adicional ni ajuste fino, sino una recompresión de los pesos originales de Google.

El modelo base es la variante de texto de 1.000 millones de parámetros de la familia Gemma 3, con arquitectura transformer decoder-only, contexto de 32.768 tokens y ajuste por instrucciones. La conversión a INT8 reduce el peso del repositorio a 1,1 GB, lo que permite ejecutar inferencia en CPU con OpenVINO Runtime o con `optimum-intel`, sin necesidad de GPU.

Su relevancia es práctica: ofrece una vía de despliegue en hardware Intel (CPU, iGPU, NPU) para un modelo pequeño de la familia Gemma 3, con licencia Gemma y compatibilidad con el ecosistema OpenVINO GenAI. El repositorio no registra descargas ni interacciones, por lo que debe tratarse como un artefacto recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM, variante text-only) |
| Parametros totales | 1B (aproximado, segun model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Weight-only INT8 (NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | No disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante de solo texto. La model card del artefacto no detalla la composicion del dataset de preentrenamiento ni las fases de alineacion (RLHF/DPO) del modelo original; esa informacion corresponde a la model card de Google, no a esta conversión. Lo que sí se documenta es el proceso de conversión: exportación con `optimum-cli export openvino --task text-generation --weight-format int8`, usando optimum-intel 2.2.0, OpenVINO 2026.4.1 y transformers 5.16.1.

La innovación técnica del artefacto es la cuantización weight-only INT8 con NNCF, que reduce el espacio en disco y el ancho de banda de memoria en CPU manteniendo las activaciones en FP16/FP32. El repositorio se compone de tres partes IR (modelo, tokenizer y detokenizer), lo que permite su uso tanto desde Python con `optimum-intel` como desde C++ con OpenVINO GenAI. El autor advierte de una dependencia frágil: la pila requiere transformers ≤5.16.x porque las imágenes 5.20.x eliminaron `VisionRotaryEmbedding`, que optimum-intel 2.2.0 importa, y además hay que saltarse la comprobación legacy `MAX_TRANSFORMERS_VERSION` del exportador de Gemma 3.

## Capacidades

- Generación de texto conversacional con ajuste por instrucciones (variante `-it`).
- Razonamiento básico y respuesta a preguntas en formato multi-turno.
- Generación de código y texto técnico, limitada por el tamaño de 1B parámetros.
- Procesamiento de contexto largo de hasta 32.768 tokens, útil para documentos extensos.
- Capacidades multilingües: no documentadas en esta model card; dependen del modelo base.
- Tool calling y function calling: no documentados en esta model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; no se recomienda asumirlo para un modelo de 1B.
- Modo thinking, visión y audio: no disponibles en esta variante (es la versión text-only).
- Ejecución en CPU mediante OpenVINO Runtime, sin requisito de GPU.

## Casos de uso

- Asistente conversacional local en CPU: el modelo cabe en 1,1 GB en disco y se ejecuta con OpenVINO GenAI en equipos sin GPU, adecuado para prototipos de chat en portátiles o mini-PC con procesadores Intel.
- Clasificación y extracción de información en documentos: con 32.768 tokens de contexto se pueden pasar contratos o informes completos y pedir extracción estructurada, aunque la precisión de un modelo de 1B es limitada.
- Generación de borradores de texto y resúmenes: útil para tareas de redacción asistida donde la latencia importa más que la calidad máxima, al ejecutarse en CPU sin colas de GPU.
- Enrutamiento y preprocesado en pipelines RAG: uso como modelo pequeño para reformular consultas o filtrar fragmentos antes de llamar a un modelo mayor, reduciendo coste.
- Despliegue en entornos edge o air-gapped: al ser un artefacto OpenVINO sin dependencias de servicios en la nube, encaja en dispositivos Intel aislados de red.
- Educación y experimentación: reproducción del pipeline de conversión con `optimum-cli` documentado en la model card, útil para aprender a exportar y cuantizar modelos a OpenVINO IR.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad de INT8 frente al modelo original en FP16/BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el artefacto está pensado para CPU. En disco ocupa 1,1 GB (INT8).
- Memoria RAM estimada: no disponible de forma explícita; por el tamaño del repositorio, un sistema con 4-8 GB de RAM libre debería poder cargarlo, aunque no está confirmado en la model card.
- GPU recomendadas: no documentadas; la conversión se generó en un entorno CPU-only de Kaggle y el uso previsto es OpenVINO en CPU, iGPU o NPU de Intel.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU NVIDIA; OpenVINO puede usar GPU Intel, pero no hay datos de rendimiento.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), OpenVINO Runtime en Python y C++.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/gemma-3-1b-it-openvino | 1B | 32.768 | OpenVINO IR INT8 | Gemma | Conversion comunitaria, sin benchmarks ni descargas |
| google/gemma-3-1b-it | 1B | 32.768 | Safetensors (BF16/FP16) | Gemma | Modelo original de Google, referencia de calidad |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 | Safetensors, GGUF | Llama 3.2 Community | Contexto mayor y ecosistema de despliegue amplio |

La comparación con los originales en safetensors es la más directa: este artefacto no cambia la arquitectura ni el entrenamiento, solo el formato y la precisión. Frente a alternativas de otros fabricantes, la diferencia clave es la licencia Gemma (con sus restricciones de uso) y la dependencia del stack OpenVINO.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todos los sesgos y limitaciones del `gemma-3-1b-it` original.
- Riesgo de alucinación elevado por el tamaño de 1B parámetros; no apto para tareas que requieran alta fiabilidad factual sin verificación.
- La cuantización INT8 weight-only puede degradar la calidad respecto al modelo en BF16/FP16; no se han publicado evaluaciones de esa degradación.
- Idiomas soportados no documentados en esta model card; hay que consultar la del modelo base.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google, que incluyen restricciones de uso aceptable y obligaciones de atribución.
- Dependencia frágil del stack: requiere transformers ≤5.16.x y un bypass del gate `MAX_TRANSFORMERS_VERSION`; versiones más recientes pueden romper la carga o el exportador.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de funcionamiento.
- No documenta soporte de tool calling ni de agentes; asumirlos en producción sería una extrapolación no respaldada.
- El rendimiento real en CPU, iGPU o NPU no está medido en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/gemma-3-1b-it-openvino
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Documentación de optimum-intel: https://github.com/huggingface/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO Runtime: https://github.com/openvinotoolkit/openvino
- NNCF (cuantización): https://github.com/openvinotoolkit/nncf
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
