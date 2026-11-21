# AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP es una cuantización experimental del modelo Qwen/Qwen3.5-9B, publicada por AutomatosX bajo el marco propio AXQuant. El artefacto está empaquetado en formato MLX (Apple Silicon) con safetensors y una mezcla de precisiones que el autor denomina "6-bit" en el nombre, aunque la medición real del repositorio arroja 8,82 bits por peso (BPW) incluyendo tensores protegidos y sobrecarga de almacenamiento. No es MXFP6 ni un almacenamiento uniforme de seis bits: se trata de un empaquetado affine6 con capas de protección de mayor precisión.

El modelo base declarado es Qwen3.5-9B, con 9.409.812.208 parámetros totales según los safetensors del repositorio, y el artefacto ocupa 10.642.707.736 bytes (10,7 GB). La licencia es Apache 2.0, heredada del modelo fuente, y la librería de referencia es MLX.

La relevancia de esta ficha es acotada y conviene subrayarla: el autor lo describe explícitamente como "research development artifact" sin certificado de calidad. La única evidencia de ejecución publicada es un smoke test funcional en MLX-VLM 0.7.9 sobre Metal con dos prompts triviales (una suma y una respuesta literal). No hay benchmarks de calidad, ni evaluación de código, ni pruebas de contexto largo, ni verificación del mecanismo MTP (multi-token prediction) que da nombre al artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 9.409.812.208 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant affine6 con protección de precisión mixta; BPW medido 8,82; clase de presupuesto `8p8bpw` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `axquant_manifest.json`, `axquant_plan.json` y `config.json` |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino una conversión cuantizada del checkpoint Qwen/Qwen3.5-9B fijado en la revisión inmutable `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer de aproximadamente 9.400 millones de parámetros. La model card no detalla el número de capas, la configuración de atención ni la composición del dataset de entrenamiento original; esa información debe consultarse en el repositorio upstream de Qwen.

La innovación técnica del artefacto es el esquema de cuantización AXQuant: empaquetado affine de 6 bits con "suelos" de protección de precisión en determinados módulos, cuyas asignaciones exactas por módulo se registran en `axquant_manifest.json` y `axquant_plan.json`. El artefacto incluye además pesos MTP (multi-token prediction) protegidos, presumiblemente para decodificación especulativa, pero el autor declara explícitamente que la ejecución, la tasa de aceptación y la ganancia de velocidad del MTP no están verificadas. No se documentan fases de RLHF, DPO ni datos de post-entrenamiento propios de esta conversión.

## Capacidades

- Generación de texto y conversación: pipeline declarado `text-generation` con tag `conversational`.
- Razonamiento aritmético básico: el smoke test publicado resuelve correctamente "19 + 23" con salida "42".
- Instrucciones literales: responde correctamente a consignas de formato estricto ("Reply with exactly the word READY").
- Tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no disponible; el autor no declara lista de idiomas.
- Visión: el repositorio contiene un sidecar de visión no indexado, pero la ruta de carga de texto probada lo omite y el autor indica que la inferencia de imagen no está soportada por esa ruta en esta revisión; requeriría un loader o export verificado por separado.
- MTP (multi-token prediction): pesos incluidos, comportamiento y aceleración no verificados.

## Casos de uso

- Evaluación de esquemas de cuantización en Apple Silicon: el caso de uso principal y más realista es servir como artefacto de investigación para medir el impacto de AXQuant affine6 con protección de precisión frente al checkpoint original en MLX. Adecuado porque el autor publica manifiesto, plan y BPW medido, lo que permite reproducir la conversión.
- Prototipado local en Mac con MLX: el formato nativo MLX y los 10,7 GB de pesos permiten cargar el modelo en un Mac con memoria unificada suficiente para experimentar con generación de texto conversacional sin infraestructura de GPU dedicada.
- Pruebas de integración de pipelines MLX-VLM: el smoke test publicado con la versión 0.7.9 sirve como referencia mínima para validar que un entorno MLX-VLM concreto carga y ejecuta el artefacto antes de invertir en evaluaciones mayores.
- Investigación sobre decodificación especulativa con MTP: los pesos MTP incluidos permiten a un equipo verificar de forma independiente si la predicción multi-token aporta aceleración, dado que el autor no lo ha medido. No es un caso de uso de producción, sino de validación.
- Comparación de BPW efectivo frente a cuantizaciones estándar: con 8,82 BPW medidos, el artefacto permite contrastar el compromiso tamaño/calidad de un esquema de precisión mixta frente a alternativas uniformes de 8 bits o 6 bits en el mismo modelo base.
- Docencia y experimentación con formatos de pesos: útil para explicar cómo se estructura un manifiesto de cuantización con protecciones por módulo y cómo se valida un artefacto antes de usarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta un smoke test funcional, que no constituye una evaluación de calidad:

| Prueba | Runtime | Resultado |
|---|---|---|
| "What is 19 plus 23? Reply with only the number." | MLX-VLM 0.7.9 / MLX 0.32.4 en Metal | "42", correcto |
| "Reply with exactly the word READY." | MLX-VLM 0.7.9 / MLX 0.32.4 en Metal | "READY", correcto |

Estado de los runtimes según el autor: MLX-VLM 0.7.9 probado; MLX-LM no probado por separado; AX Engine no probado; omlx y mtplx no soportados (solo análisis estático).

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan 10.642.707.736 bytes (unos 10,7 GB); el autor advierte que el tamaño de fichero no determina el pico de memoria en tiempo de ejecución, por lo que hay que prever margen adicional para caché KV y activaciones.
- Plataforma: el formato es MLX, orientado a Apple Silicon; el smoke test se ejecutó en Metal con MLX 0.32.4 y MLX-VLM 0.7.9.
- GPU recomendadas: no disponibles para CUDA; el artefacto no está pensado para A100, H100 ni RTX 4090 en su formato actual. En Apple Silicon se requiere un Mac con memoria unificada holgada para el tamaño indicado.
- Compatibilidad con GPU de consumo: no verificada; no hay datos de ejecución en GPUs NVIDIA.
- Opciones de despliegue: MLX-VLM 0.7.9 (probado); MLX-LM (no probado); AX Engine (no probado); omlx y mtplx no soportados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad ni de aceptación de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado de validación |
|---|---|---|---|---|---|
| AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP | 9.409.812.208 | no disponible | MLX safetensors, 8,82 BPW | Apache 2.0 | Smoke test funcional únicamente |
| Qwen/Qwen3.5-9B (original) | ~9,4 B (según base declarada) | no disponible | safetensors | Apache 2.0 | Modelo upstream de referencia |
| Cuantizaciones MLX uniformes de Qwen3.5-9B | ~9,4 B | no disponible | MLX safetensors | Apache 2.0 | No disponibles en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos aportados: no hay benchmarks del artefacto ni del modelo base en la información proporcionada. La diferencia verificable frente al original es el tamaño (10,7 GB) y el esquema de cuantización con protecciones por módulo.

## Limitaciones y advertencias

- Artefacto de investigación sin certificado de calidad: el propio autor lo declara "research development artifact" y advierte que no emite garantía de calidad.
- Nombre engañoso respecto al almacenamiento real: se anuncia como "6bit" pero el BPW medido es 8,82, incluyendo tensores protegidos y sobrecarga; no es MXFP6 ni seis bits uniformes.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K, MTEB ni evaluación de contexto largo; el smoke test de dos prompts no es evidencia de rendimiento.
- MTP no verificado: los pesos están incluidos pero la ejecución, la tasa de aceptación y la aceleración no se han medido.
- Visión no soportada en la ruta probada: la carga de texto omite el sidecar de visión; la inferencia de imagen requiere un loader o export verificado por separado.
- Idiomas no declarados: no hay lista de idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Contexto no documentado: se desconoce la ventana de contexto efectiva de esta conversión.
- Riesgo de alucinación: inherente al modelo base; no hay evaluación específica de este artefacto que lo cuantifique.
- Sesgos: no documentados en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero el autor aclara que el repositorio upstream y su licencia rigen el uso posterior y que no se transfiere ninguna certificación ni benchmark del modelo original.
- Compatibilidad limitada: omlx y mtplx no soportados; AX Engine y MLX-LM sin probar; sin soporte documentado para ecosistemas CUDA.
- Reproducibilidad: conviene fijar la revisión inmutable del Hub y conservar el processor y la plantilla del modelo fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión inmutable del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Manifiesto de cuantización: `axquant_manifest.json` (en el repositorio)
- Plan de cuantización: `axquant_plan.json` (en el repositorio)
- Informe estático de compatibilidad: `axquant_compatibility.json` (en el repositorio)
