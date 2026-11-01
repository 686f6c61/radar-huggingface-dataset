# james58899/gemma-4-E4B-it-qat-ONNX

## Resumen

Esta ficha corresponde a una conversión comunitaria a ONNX del modelo **Gemma 4 E4B IT** en su variante QAT (Quantization-Aware Training) con pesos a 4 bits, publicada por el usuario james58899 en Hugging Face. El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`, un checkpoint de Google de la familia Gemma 4 orientado a generación de texto conversacional, y esta conversión lo hace ejecutable mediante ONNX Runtime.

El valor diferencial de este repositorio es doble: por un lado, ofrece pesos cuantizados a 4 bits mediante QAT, una técnica en la que el modelo se entrena (o ajusta) teniendo en cuenta la cuantización, lo que suele preservar mejor la calidad que la cuantización posterior al entrenamiento; por otro, el formato ONNX permite desplegar el modelo fuera del ecosistema PyTorch, incluyendo CPU, aceleradores con soporte ONNX Runtime y entornos de producción heterogéneos.

Es importante subrayar que se trata de una conversión realizada por un tercero (no por Google), con scripts generados con ayuda de IA según advierte el propio autor en la model card, por lo que recomienda verificar los resultados antes de usarla en producción. La versión es de solo texto: no incluye codificadores de visión ni de audio presentes en el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (`Gemma4ForCausalLM`), solo texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la denominación E4B sugiere variante eficiente, pero el dato exacto no está publicado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT 4 bits (bloques de 32, grid Q4_0); variantes ONNX `q4` (activaciones y KV cache fp32) y `q4f16` (activaciones y KV cache fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con licencia de Gemma asociada: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | ONNX (pesos a 4 bits, block size 32); tamaño del repositorio: 9,0 GB |

## Arquitectura y entrenamiento

El modelo es un decodificador transformer de la familia Gemma 4 (`Gemma4ForCausalLM`), convertido a ONNX con soporte de KV cache para inferencia eficiente en dos variantes: `q4` con activaciones y cache en fp32, y `q4f16` con activaciones y cache en fp16. En ambas variantes los pesos de 4 bits son idénticos; solo cambia la precisión de las activaciones. La conversión incluye tanto el embedding de tokens como los embeddings por capa (per-layer embeddings), un rasgo característico de las arquitecturas Gemma recientes.

La variante QAT (Quantization-Aware Training) con grid Q4_0 procede directamente del checkpoint oficial de Google, lo que significa que la cuantización a 4 bits se tuvo en cuenta durante el entrenamiento o ajuste fino, reduciendo típicamente la degradación frente a la cuantización post-entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación (RLHF, DPO) en la model card de esta conversión. El repositorio incluye además el tokenizer, la plantilla de chat y la configuración de generación copiadas del checkpoint original, así como los scripts de conversión (`scripts/export.py`) para reproducir el proceso.

## Capacidades

- Generación de texto conversacional: pipeline `text-generation` con chat template incluido del checkpoint original.
- Solo texto: la conversión no incluye codificadores de visión ni de audio, aunque el checkpoint base de Google pudiera tenerlos.
- KV cache en ONNX para inferencia multi-turno eficiente.
- Ejecución multiplataforma gracias al formato ONNX y ONNX Runtime (CPU, GPU y otros aceleradores compatibles).
- Dos variantes de precisión de activaciones (fp32 y fp16) para ajustar rendimiento y calidad según el hardware.
- Soporte de tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Chatbots y asistentes conversacionales en local: gracias al chat template incluido y al KV cache en ONNX, es adecuado para construir asistentes multi-turno que se ejecutan sin depender del ecosistema PyTorch.
- Despliegue en producción con ONNX Runtime: el formato ONNX permite integrar el modelo en servicios backend escritos en C#, Java, Rust o Python, algo habitual en empresas con stacks no basados en Python.
- Inferencia en CPU o hardware heterogéneo: la cuantización QAT a 4 bits (con bloques de 32) reduce el tamaño de los pesos a unos 9 GB de repositorio, haciéndolo viable en servidores sin GPU dedicada mediante ONNX Runtime con optimizaciones para CPU.
- Dispositivos con aceleradores NPU o GPU de consumo: la variante `q4f16` (activaciones y cache en fp16) reduce el ancho de banda de memoria, útil en portátiles y equipos de escritorio con aceleradores integrados.
- Evaluación y comparación de cuantizaciones QAT: al incluir los scripts de conversión, el repositorio sirve como referencia para estudiar el impacto de la cuantización QAT Q4_0 frente a pesos completos.
- Prototipado rápido de aplicaciones de IA generativa: la disponibilidad de tokenizer, chat template y generación config listos para ONNX Runtime permite montar demos y pruebas de concepto con poca infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluar el rendimiento del modelo base puede consultarse la model card de `google/gemma-4-E4B-it-qat-q4_0-unquantized` en Hugging Face.

## Requisitos de hardware

- VRAM / memoria estimada: el repositorio ocupa 9,0 GB con pesos a 4 bits; para la variante `q4` (activaciones fp32) conviene disponer de al menos 12-16 GB de RAM o VRAM considerando el KV cache; la variante `q4f16` reduce el consumo al usar activaciones y cache en fp16. Cifras exactas de VRAM: no disponible.
- GPU recomendadas: no disponible en la información proporcionada. Al ser ONNX, cualquier GPU compatible con ONNX Runtime (NVIDIA con CUDA, AMD con DirectML/ROCm, Intel con OpenVINO) es candidata.
- Consumer GPU: la cuantización a 4 bits hace plausible la ejecución en GPUs de consumo con 8-12 GB de VRAM para la variante fp16, aunque no hay datos oficiales que lo confirmen.
- Despliegue: ONNX Runtime es la vía principal (la librería declarada del repositorio). No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|
| james58899/gemma-4-E4B-it-qat-ONNX | ONNX | QAT 4 bits (Q4_0) | Apache 2.0 | Conversión comunitaria, solo texto, KV cache incluido |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | Safetensors (PyTorch) | QAT 4 bits (grid Q4_0, des-quantizado a fp en carga) | Gemma / Apache 2.0 | Checkpoint oficial de Google, base de esta conversión |
| Conversiones ONNX oficiales de Gemma (google/gemma-*) | ONNX | Variables según release | Gemma | Mantenidas por Google, mayor garantía de corrección |

La principal alternativa a esta conversión comunitaria es usar directamente el checkpoint oficial de Google o las conversiones ONNX publicadas por el propio equipo de Gemma, que cuentan con validación del fabricante. Esta conversión destaca por ofrecer pesos QAT ya empaquetados en ONNX con dos variantes de precisión, pero al ser no oficial exige verificación previa.

## Limitaciones y advertencias

- Conversión no oficial: el propio autor advierte que los scripts de conversión fueron escritos con ayuda de IA y recomienda verificar los resultados antes de usarlos; el uso es bajo responsabilidad del usuario.
- Solo texto: la conversión descarta cualquier codificador de visión o audio del checkpoint original, por lo que no sirve para tareas multimodales.
- Datos incompletos: la model card no documenta longitud de contexto, idiomas soportados, parámetros exactos ni benchmarks, lo que dificulta la evaluación previa al despliegue.
- Riesgo de alucinación y sesgos: como todo modelo de lenguaje, puede generar contenido incorrecto o sesgado; no se han documentado evaluaciones específicas de sesgo para esta conversión.
- Licencia: se declara Apache 2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de la licencia Gemma antes de un uso comercial, ya que pueden imponer restricciones adicionales a las de Apache 2.0.
- Calidad de la cuantización: aunque QAT suele preservar mejor la calidad que la cuantización post-entrenamiento, no hay evaluaciones que cuantifiquen la degradación de esta conversión concreta frente al modelo completo.
- Adopción marginal: con unos 540 descargas y 0 likes, el modelo tiene poca trazabilidad comunitaria; los problemas de calidad podrían no estar detectados ni reportados todavía.

## Enlaces

- Repositorio del modelo: https://huggingface.co/james58899/gemma-4-E4B-it-qat-ONNX
- Modelo base (checkpoint oficial de Google): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Actividad del autor en Hugging Face: https://huggingface.co/james58899/activity/all
