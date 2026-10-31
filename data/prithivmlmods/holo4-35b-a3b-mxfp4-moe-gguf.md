# prithivMLmods/Holo4-35B-A3B-MXFP4-MoE-GGUF

## Resumen

Holo4-35B-A3B-MXFP4-MoE-GGUF es una cuantización en formato GGUF, publicada por prithivMLmods, del modelo Holo4-35B-A3B desarrollado por H Company. El modelo base es un modelo de visión-lenguaje (vision-language) de tipo MoE con 35B de parámetros totales y 3B activos, entrenado sobre Qwen3.6-35B-A3B y orientado a agentes de uso de ordenador (computer-use agents): interacción con interfaces gráficas mediante capturas de pantalla, localización de elementos, clics, escritura, OCR y llamada a herramientas vía MCP/API.

Su relevancia actual radica en la combinación de una ventana de contexto de 256K tokens, capacidades multimodales (imagen-texto) y una licencia Apache-2.0, todo ello con solo 3B de parámetros activos por token, lo que permite inferencia rápida. En benchmarks de agentes alcanza un 80,8 % en OSWorld y un 77,6 % en AndroidWorld. Esta versión cuantizada en MXFP4 reduce el tamaño a unos 19,8 GB, haciéndolo viable en GPUs con VRAM moderada, especialmente en hardware NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (arquitectura qwen3_5_moe, con proyector multimodal mmproj) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | 3B |
| Longitud de contexto | 256K (modelo base); 16.384 tokens en la prueba de rendimiento publicada |
| Tipos de cuantizacion | BF16, MXFP4_MOE, mmproj-bf16 (para el proyector de visión) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (además, el modelo base está disponible en BF16, FP8 y NVFP4) |

## Arquitectura y entrenamiento

Holo4-35B-A3B es un modelo mixture-of-experts (MoE) con 34,7B de parámetros totales y 3B activos por token, construido sobre Qwen3.6-35B-A3B. Incorpora un componente multimodal (mmproj) que lo habilita como modelo de imagen-texto a texto, capaz de procesar capturas de pantalla y realizar tareas de localización de elementos de interfaz y OCR. El entrenamiento del modelo base combina fine-tuning supervisado (SFT) con la fusión en un único checkpoint de dos expertos de aprendizaje por refuerzo, una técnica orientada a potenciar el comportamiento agéntico del modelo.

El modelo está diseñado para funcionar junto con el harness `hai-agents` de H Company, que orquesta la interacción con interfaces de usuario. La model card indica que no se emplea decodificación especulativa (MTP — Speculative Decoding: No). La variante aquí descrita es una cuantización MXFP4_MOE generada con llama.cpp, un formato de punto flotante de 4 bits optimizado para modelos MoE que reduce el tamaño de 69,4 GB (BF16) a 19,8 GB.

## Capacidades

- Generación de texto y razonamiento general, con desempeño destacado en tareas de razonamiento agéntico multi-paso.
- Comprensión de imágenes: análisis de capturas de pantalla, OCR y localización de elementos de interfaz (pipeline image-text-to-text).
- Interacción con interfaces gráficas: clics, escritura y navegación de UI a partir de capturas de pantalla (computer use).
- Ejecución de código y tool calling mediante MCP/API, con un 85,4 % de éxito en servidores de herramientas MCP.
- Soporte de agentes multi-step: diseñado específicamente para agentes de uso de ordenador, web, escritorio y móvil, con el harness `hai-agents`.
- Compatibilidad con inferencia mediante vLLM, SGLang, Transformers y llama.cpp.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar capturas de pantalla, localizar botones y campos, y ejecutar acciones de clic y escritura para automatizar flujos de trabajo repetitivos en aplicaciones de escritorio (64,8 % de éxito en apps de escritorio en la suite de H Company).
- Agentes de navegación web: dado su rendimiento del 70,8 % en aplicaciones web, es adecuado para construir agentes que rellenan formularios, extraen información y navegan sitios web de forma autónoma.
- Automatización móvil: con un 77,6 % en AndroidWorld, puede impulsar agentes que operan aplicaciones Android mediante capturas de pantalla y acciones de UI.
- Ejecución de herramientas vía MCP: su 85,4 % de éxito en servidores MCP lo hace idóneo para orquestadores que necesitan llamar APIs y herramientas externas de forma fiable dentro de pipelines agénticos.
- Automatización de línea de comandos: alcanza un 30,9 % en ALE-CLI, lo que permite agentes que ejecutan y encadenan comandos de terminal para tareas de administración de sistemas o DevOps.
- Procesamiento de documentos con OCR: la capacidad de visión y OCR permite extraer texto de imágenes, escaneos e interfaces para flujos de digitalización de documentos.
- Atención al cliente con contexto largo: la ventana de contexto de 256K tokens del modelo base permite gestionar conversaciones multi-turno extensas y consultar documentación técnica de gran volumen sin pérdida de contexto.

## Benchmarks y rendimiento

Resultados publicados para el modelo base Holo4-35B-A3B (según la model card):

| Benchmark | Resultado |
|---|---|
| OSWorld | 80,8 % (0,05 $/tarea) |
| OSWorld 2.0 | 30,9 % (0,61 $/tarea) |
| AutomationBench | 34,5 % (0,02 $/tarea) |
| AndroidWorld | 77,6 % |
| ALE-CLI | 30,9 % |
| MCP tool servers (Agentic Task Factory) | 85,4 % |
| Web apps (Agentic Task Factory) | 70,8 % |
| Desktop apps (Agentic Task Factory) | 64,8 % |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible.

Rendimiento de la cuantización MXFP4_MOE (prueba del autor en llama.cpp):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento del prompt | 260,44 tokens/s |
| Velocidad media de generación | 215,28 tokens/s |
| VRAM máxima usada | 19,07 GiB |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) |
| Contexto de la prueba | 16.384 tokens |
| KV cache (K) | q8_0 |

## Requisitos de hardware

- VRAM estimada para inferencia con la cuantización MXFP4_MOE: unos 19-20 GiB (19,07 GiB de pico en la prueba publicada, con KV cache q8_0 y contexto de 16K).
- VRAM para la versión BF16: unos 69,4 GB de pesos, más la caché KV, por lo que se requieren GPUs de 80 GB o superior.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (96 GB), donde se ha validado el checkpoint con soporte SM120/FP4. Dado el pico de ~19 GiB, debería caber también en GPUs de 24 GB como la RTX 4090 o RTX 3090 con contexto moderado, aunque esto no está verificado en la información disponible.
- Despliegue: llama.cpp (llama-cli, validado), vLLM, SGLang y Transformers (para el modelo base en sus formatos BF16, FP8 y NVFP4).
- Throughput medido: 215,28 tokens/s de generación y 260,44 tokens/s de procesamiento de prompt en la configuración de prueba descrita.
- No se usa decodificación especulativa, por lo que la latencia depende exclusivamente del throughput del motor de inferencia.

## Comparativa con modelos similares

| Caracteristica | Holo4-35B-A3B (esta cuantizacion) | Qwen3.6-35B-A3B (modelo base) | GLM-4.6V / alternativas VLM agenticas |
|---|---|---|---|
| Parametros totales | 34,7B | 35B | no disponible |
| Parametros activos | 3B | 3B | no disponible |
| Contexto | 256K | no disponible | no disponible |
| Multimodal | Sí (visión + OCR + UI) | Base del modelo | Sí |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Formatos | GGUF (BF16, MXFP4), BF16, FP8, NVFP4 | no disponible | no disponible |

Nota: la información disponible no incluye fichas detalladas de modelos comparables de la misma categoría, por lo que la comparativa cuantitativa no está disponible. La referencia más directa es su propio modelo base, Qwen3.6-35B-A3B, sobre el que H Company añadió el entrenamiento agéntico con RL.

## Limitaciones y advertencias

- Idioma: la model card declara soporte únicamente para inglés; no hay garantía de rendimiento en castellano ni en otros idiomas.
- La cuantización MXFP4_MOE está optimizada y probada sobre hardware NVIDIA Blackwell (SM120, GB202, B200, B300, RTX PRO 6000); su rendimiento en arquitecturas anteriores (Ampere, Ada, Hopper) no está verificado en la información disponible.
- La prueba de rendimiento se realizó con contexto de 16.384 tokens, muy por debajo de los 256K que soporta el modelo base; usar contextos mayores incrementará sustancialmente el consumo de VRAM para la caché KV.
- Benchmarks de agentes como OSWorld miden tareas específicas de automatización; no reflejan necesariamente el rendimiento en generación de texto general, código o matemáticas.
- Riesgo de alucinación: no se publican evaluaciones de veracidad o alucinación; como en todo modelo agéntico que ejecuta acciones reales (clics, comandos, APIs), se recomienda supervisión y entornos aislados en producción.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución de la licencia.
- Esta ficha describe una cuantización de tercer autor (prithivMLmods); para soporte oficial del modelo debe recurrirse a H Company y al repositorio base.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/prithivMLmods/Holo4-35B-A3B-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Modelo base de origen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo BF16: https://huggingface.co/prithivMLmods/Holo4-35B-A3B-MXFP4-MoE-GGUF/blob/main/Holo4-35B-A3B.BF16.gguf
- Archivo MXFP4_MOE: https://huggingface.co/prithivMLmods/Holo4-35B-A3B-MXFP4-MoE-GGUF/blob/main/Holo4-35B-A3B.MXFP4_MOE.gguf
- Archivo mmproj-bf16: https://huggingface.co/prithivMLmods/Holo4-35B-A3B-MXFP4-MoE-GGUF/blob/main/Holo4-35B-A3B.mmproj-bf16.gguf
- Harness hai-agents y paper de H Company: no disponible en la información proporcionada
