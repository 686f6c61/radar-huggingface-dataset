# McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher

## Resumen

Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el grupo McGill-NLP a partir del modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16, propiedad de NVIDIA. Se trata de un ajuste fino supervisado (SFT) sobre el conjunto de datos Dolci-Instruct-SFT, y su funcion principal dentro del proyecto EchoMoE es servir como "teacher" (modelo maestro) sin comprimir del que se destila el modelo estudiante Nemotron-3.5-Lightning-30B-A3B. Es, por tanto, la referencia contra la que se comparan las puntuaciones del estudiante.

El modelo emplea la arquitectura propietaria de NVIDIA denominada nemotron_h, una combinacion hibrida de capas Mamba-2, capas de atencion y capas MoE, con 128 expertos enrutados (6 activos) mas un experto compartido y un tamano oculto de 2.688. Con aproximadamente 31.580 millones de parametros totales y solo 3.000 millones activos por token (de ahi el sufijo A3B), esta disenado para ofrecer un equilibrio entre capacidad y eficiencia computacional en inferencia.

Su relevancia es fundamentalmente de investigacion: forma parte del trabajo "Communicate the Change: Efficient Expert Parallelism via Activation Compression" (Liu et al., 2026), que estudia la compresion de activaciones para paralelismo de expertos eficiente. No es un modelo pensado para uso general en produccion, sino una pieza de referencia en un pipeline de destilacion. El modelo esta publicado bajo licencia OpenMDW 1.1 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido nemotron_h (Mamba-2 + atencion + MoE), 52 capas |
| Parametros totales | 31.577.940.288 (~31,58 B) |
| Parametros activos | ~3 B (128 expertos enrutados, 6 activos + 1 compartido) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura nemotron_h del modelo base de NVIDIA, que combina 52 capas de tres tipos: Mamba-2 (modelos de espacio de estados), atencion y capas MoE. La capa MoE cuenta con 128 expertos enrutados, de los cuales se activan 6 por token, mas un experto compartido siempre activo. El tamano oculto es de 2.688. Esta combinacion hibrida busca capturar dependencias de largo alcance con coste computacional reducido en las capas Mamba-2, mientras las capas de atencion y MoE aportan capacidad de modelado y eficiencia en el numero de parametros activos.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el dataset allenai/Dolci-Instruct-SFT durante dos epocas, con secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se menciona el uso de RLHF ni DPO en la informacion disponible. La evaluacion se realizo en bf16 con vLLM 0.21. La innovacion tecnica principal del proyecto EchoMoE (del que este modelo es el teacher) es la compresion de activaciones para paralelismo de expertos eficiente, descrita en el articulo de Liu et al. (2026), aunque el modelo en si no incorpora esa tecnica: es el modelo de referencia sin comprimir.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (apply_chat_template).
- Razonamiento y conocimiento general: promedio de 71,6 % en el dominio de conocimiento y razonamiento sobre 18 benchmarks.
- Matematicas: 50,5 % en el dominio de matematicas.
- Generacion de codigo: 53,0 % en el dominio de codigo.
- Seguimiento de instrucciones: 55,0 % en el dominio de instruction following.
- Soporte de decodificacion greedy (por defecto) y muestreo con temperature 0.7, top_p 0.8, top_k 20 y presence penalty 1.5 para chat.
- Capacidad de servir como modelo teacher en pipelines de destilacion (funcion principal para la que se publica).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Destilacion de modelos: es el modelo teacher del que se destila el estudiante Nemotron-3.5-Lightning-30B-A3B en el proyecto EchoMoE; se usa para generar senales de supervision o como referencia de calidad en el entrenamiento del estudiante.
- Investigacion en paralelismo de expertos: sirve como modelo de referencia sin comprimir para medir el impacto de la compresion de activaciones descrita en el articulo de Liu et al. (2026), comparando sus puntuaciones con las del estudiante comprimido.
- Evaluacion comparativa de tecnicas de compresion: al promediar 62,8 % en 18 benchmarks, proporciona una linea base solida para validar metodos de eficiencia en MoE.
- Generacion de texto en ingles con contexto medio: con 32.768 tokens de contexto, puede emplearse en tareas de resumen o respuesta sobre documentos de hasta esa longitud en entornos de investigacion.
- Experimentacion academica con arquitecturas hibridas Mamba-2/atencion/MoE: util para estudiar el comportamiento de este tipo de arquitecturas en tareas de instruccion.
- Servicio de inferencia con vLLM en configuracion multi-GPU: el quickstart oficial usa data-parallel-size 8 con expert-parallel, adecuado para despliegues de investigacion en clusters con GPUs de 80 GB.

## Benchmarks y rendimiento

Puntuacion media (%) sobre 18 benchmarks por dominio, segun la model card:

| Dominio | Puntuacion |
|---|---|
| Conocimiento y razonamiento | 71,6 |
| Matematicas | 50,5 |
| Codigo | 53,0 |
| Seguimiento de instrucciones | 55,0 |
| **Media** | **62,8** |

No se detallan los benchmarks individuales ni comparaciones numericas con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos bf16 caben en una sola GPU de 80 GB (indicado en la model card); el repositorio ocupa 63,2 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola GPU; configuracion multi-GPU (data-parallel-size 8 con expert-parallel) para servir con vLLM segun el quickstart oficial.
- GPU de consumo: no se documenta soporte ni viabilidad en GPUs consumer (RTX 4090, etc.) en la informacion disponible; el tamano del repositorio (63,2 GB) y la ausencia de pesos cuantizados publicados lo hacen inviable en GPUs de 24 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM 0.21 (recomendado, con soporte de expert-parallel) y transformers (carga directa sin el paquete EchoMoE). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher (este) | ~31,58 B | ~3 B | 32.768 | OpenMDW 1.1 | Hugging Face |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16 | ~31,58 B (no confirmado) | ~3 B | No disponible | OpenMDW 1.1 | Hugging Face |
| Nemotron-3.5-Lightning-30B-A3B (estudiante EchoMoE) | No disponible | No disponible | No disponible | No disponible | Coleccion EchoMoE en Hugging Face |

El modelo base y el estudiante pertenecen al mismo proyecto; no se dispone de datos de rendimiento del estudiante ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Es un modelo de investigacion disenado como teacher de destilacion, no como modelo de produccion para uso general.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- No se documentan sesgos conocidos en la model card; al entrenarse sobre Dolci-Instruct-SFT, puede heredar sesgos de ese dataset.
- La licencia OpenMDW 1.1 mantiene el aviso de copyright de NVIDIA; es responsabilidad del usuario revisar los terminos para uso comercial.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware de menor capacidad.
- Los benchmarks se reportan como medias por dominio sobre 18 benchmarks sin detallar los individuales, lo que dificulta la verificacion granular.
- El articulo asociado (Liu et al., 2026) no tiene identificador arXiv en la informacion disponible (marcado como TODO en la model card).
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Paper (referencia, sin arXiv ID disponible): Liu, F., Gala, J., Reddy, S., Bahdanau, D. (2026). "Communicate the Change: Efficient Expert Parallelism via Activation Compression".
