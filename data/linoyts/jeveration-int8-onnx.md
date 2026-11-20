# linoyts/Jeveration-int8-ONNX

## Resumen

Jeveration int8 ONNX es una exportación a formato ONNX del modelo de generación de imágenes Jeveration, desarrollado originalmente por Yuhe Liu, Qi Li, Shihua Zhang y Xinchao Wang (referencia arXiv:2611.24738). Esta versión concreta, publicada por el usuario linoyts, está optimizada para ejecutarse en navegador mediante ONNX Runtime Web con aceleración WebGPU, lo que la convierte en una pieza poco habitual dentro del ecosistema: un modelo text-to-image que corre íntegramente en cliente sin necesidad de infraestructura de servidor.

La característica técnica más distintiva de Jeveration es que genera una imagen de 512 x 512 píxeles en un único pase forward de su backbone (derivado de Qwen3.5-4B), sin bucle de denoising. En lugar de iterar sobre pasos de difusión, el modelo muestrea 128 tokens de decisión y los decodifica de una vez mediante un decoder TA-TiTok. Esta arquitectura de "system one" reduce drásticamente la latencia frente a los modelos de difusión convencionales y es lo que hace viable su ejecución en el navegador.

El repositorio ocupa 6,3 GB y contiene los grafos ONNX cuantizados en distintos niveles de precisión: backbone en int8, cabeza y decoder en fp16, y embeddings de tokens en int4. La licencia es Apache-2.0, aunque los componentes subyacentes (Qwen3.5-4B, TA-TiTok y CLIP ViT-L/14-336) conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (backbone Qwen3.5-4B con capas de atención lineal Gated DeltaNet) + cabeza de muestreo + decoder TA-TiTok |
| Parametros totales | no disponible (backbone derivado de Qwen3.5-4B; el repo pesa 6,3 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt + 128 tokens de decisión en un único pase) |
| Tipos de cuantizacion | int8 (MatMulNBits, bloque 32) en backbone; fp16 en cabeza, decoder, CLIP y decision embed; int4 (q4f16) en embed_tokens |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el texto se procesa vía CLIP y plantilla de chat de Qwen) |
| Licencia | Apache-2.0 (componentes subyacentes con sus propias licencias) |
| Formato de pesos | ONNX (grafos separados por componente) |

## Arquitectura y entrenamiento

El pipeline se compone de cinco etapas. Primero, el prompt se inserta en una plantilla de chat (`assets/prompt_template.json`) y se embebe mediante `embed_tokens_q4f16.onnx`. Segundo, se muestrean 128 tokens de decisión a partir de un estado aleatorio y se embeben con `decision_embed_fp16.onnx`. Tercero, el backbone procesa prompt más tokens de decisión en un único pase; el backbone está dividido en 8 chunks de 4 capas cada uno (`backbone_int8/chunk_0..7.onnx`), con pesos int8 y LoRA fusionado. Los tokens de decisión se atienden entre sí de forma bidireccional. Cuarto, la cabeza (`head_fp16.onnx`) transforma los estados ocultos en una distribución sobre 8192 códigos por posición, muestreando los 128 códigos simultáneamente. Quinto, el decoder TA-TiTok (`decoder_fp16.onnx`) convierte los códigos y las características de texto CLIP (`clip_text_fp16.onnx`) en la imagen final.

Las capas de atención lineal (Gated DeltaNet) se implementan en forma chunked basada en matmuls, sin nodos `Scan` ni `Loop`, lo que es requisito para la compatibilidad con ONNX Runtime Web. El backbone deriva de Qwen/Qwen3.5-4B, el decoder de TA-TiTok (tokenizer_tatitok_bl128_vq) y la torre de texto de OpenAI CLIP ViT-L/14-336. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes text-to-image a 512 x 512 píxeles en un único pase forward, sin bucle de denoising.
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU, sin backend de servidor.
- Procesamiento de prompts en lenguaje natural a través de plantilla de chat y embeddings de Qwen3.5-4B.
- Muestreo conjunto de 128 códigos de imagen en una sola operación (todos los códigos se muestrean a la vez).
- Decodificación de códigos a imagen mediante TA-TiTok con condicionamiento de texto CLIP.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Demos interactivas en navegador: el modelo puede integrarse en una aplicación web que genere imágenes a partir de texto sin enviar datos a un servidor, aprovechando la ejecución vía WebGPU y la ausencia de bucle de denoising para mantener la latencia baja.
- Prototipado rápido de interfaces generativas: desarrolladores que necesiten validar una UX de generación de imágenes pueden desplegar el modelo en una Space de Hugging Face o en una página estática sin aprovisionar GPUs.
- Aplicaciones con requisitos de privacidad: al ejecutarse en cliente, los prompts no abandonan el dispositivo del usuario, lo que resulta adecuado para entornos donde el texto introducido es sensible.
- Educación y experimentación: sirve para estudiar arquitecturas de generación de imágenes sin difusión y comparar su comportamiento con modelos de difusión clásicos en un entorno controlado.
- Generación de imágenes offline: una vez descargados los 6,3 GB de pesos, la inferencia puede realizarse sin conexión en navegadores compatibles con WebGPU.
- Investigación sobre cuantización: el repo ofrece un caso concreto de exportación int8/fp16/int4 con métricas de fidelidad (92-96% de códigos idénticos), útil para estudiar el impacto de la cuantización en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta métricas de fidelidad de la exportación:

| Metrica | Resultado |
|---|---|
| Exportación a precisión completa vs PyTorch fp32 | Diferencia relativa 1,7e-6 |
| Esta build int8 vs salida oficial (códigos idénticos) | 92% - 96% de los 128 códigos |
| Referencia bf16 vs fp32 (códigos idénticos) | 96% - 98% de los 128 códigos |

Estas comprobaciones se realizaron contra el pipeline oficial de PyTorch (bf16, mismos muestreos aleatorios) sobre 4 prompts, con ONNX Runtime en CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo completo pesa 6,3 GB, aunque en ejecución WebGPU la memoria la gestiona el navegador y puede ser inferior al tamaño total en disco.
- GPU recomendadas: no se especifican modelos concretos; el requisito es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: plausible en GPUs de consumo con WebGPU habilitado, pero no se documentan modelos concretos ni mínimos.
- Opciones de despliegue: ONNX Runtime Web (WebGPU); también puede ejecutarse con ONNX Runtime en CPU para validación, como hizo el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la información proporcionada. Como referencia estructural, se puede contrastar con:

| Modelo | Paradigma | Contexto de ejecución | Licencia |
|---|---|---|---|
| Jeveration int8 ONNX | Generación en un pase (sin difusión) | Navegador (WebGPU) | Apache-2.0 |
| Modelos de difusión típicos (p. ej. SDXL) | Difusión iterativa (múltiples pasos) | Servidor con GPU | Varía |
| Backbone base Qwen3.5-4B | LLM de texto | Servidor o local | Según Qwen |

No se dispone de datos de rendimiento de alternativas en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Resolución fija de 512 x 512 píxeles; no se documenta soporte de otras resoluciones.
- La fidelidad de la cuantización int8 implica que entre un 4% y un 8% de los códigos de imagen pueden diferir de la salida oficial, lo que puede producir variaciones visibles en algunas generaciones.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-4B y CLIP, puede heredar sesgos presentes en esos modelos y en sus datos de entrenamiento.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir imágenes que no se correspondan fielmente con el prompt.
- Idiomas soportados no documentados; el comportamiento multilingüe del prompt no está garantizado.
- La licencia Apache-2.0 aplica a los pesos de Jeveration, pero el backbone (Qwen3.5-4B), el decoder (TA-TiTok) y la torre de texto (CLIP ViT-L/14-336) conservan sus propias licencias, que deben verificarse para uso comercial.
- Dependencia de WebGPU: navegadores sin soporte no podrán ejecutar el modelo con aceleración; la ejecución en CPU es posible pero con latencia no documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linoyts/Jeveration-int8-ONNX
- Modelo base: https://huggingface.co/linlinlinlinsdada/Jeveration
- Demo WebGPU: https://huggingface.co/spaces/linoyts/Jeveration-WebGPU
- Backbone Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Embeddings Qwen3.5-4B ONNX: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX
- Decoder TA-TiTok: https://huggingface.co/turkeyju/tokenizer_tatitok_bl128_vq
- Paper: arXiv:2611.24738 (Jeveration: System One Models Now Generate)
