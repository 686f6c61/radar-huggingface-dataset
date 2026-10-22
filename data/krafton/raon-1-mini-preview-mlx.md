# KRAFTON/Raon-1-mini-preview-mlx

## Resumen

Raon-1-mini-preview-mlx es la variante en formato MLX del modelo Raon-1-mini-preview, publicado por KRAFTON (estudio surcoreano conocido por PUBG y por su división de IA). Se distribuye como un checkpoint de generación de texto con pipeline `text-generation` y orientación conversacional, empaquetado específicamente para su ejecución en Apple Silicon mediante la librería MLX. El repositorio declara 28.783.227.618 parámetros (≈28,8 B) en safetensors y un tamaño total de 17,6 GB, lo que sitúa al modelo en la gama media-alta de tamaño y sugiere almacenamiento en precisión reducida.

La relevancia del lanzamiento está en la combinación de tres factores: licencia Apache 2.0 (uso comercial sin restricciones de atribución adicionales), acceso restringido mediante gated access en HuggingFace y una build nativa para el stack MLX de Apple, que hasta ahora recibía menos atención que llama.cpp o GGUF en el ecosistema open source. El tag `nvfp4` apunta además a cuantización de 4 bits en formato floating point de NVIDIA, aunque el repositorio se distribuye en safetensors para MLX.

No se ha publicado en la información disponible documentación técnica sobre arquitectura, ventana de contexto, composición del dataset de entrenamiento ni idiomas soportados. La ficha refleja por tanto los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse, incluyendo benchmarks y comparativas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sin información en el repositorio ni en la búsqueda web) |
| Parametros totales | 28.783.227.618 (≈28,8 B) |
| Parametros activos | no disponible (sin evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (según tag `nvfp4`); pesos servidos en safetensors para MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |
| Pipeline | text-generation |
| Tamaño del repositorio | 17,6 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2026-10-21 |
| Fecha de actualizacion | 2026-10-21 |
| Descargas | 10 |
| Likes | 21 |

Nota sobre el tamaño: 28,8 B de parámetros en 17,6 GB de repositorio implican un promedio inferior a 5 bits por parámetro (4 bits puros equivaldrían a ≈14,4 GB), coherente con un checkpoint cuantizado a 4 bits más tokenizer, configuración y tensores auxiliares.

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye detalles sobre la arquitectura (transformer denso, MoE, híbrida o basada en space-state models), el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de thinking mode.

Los únicos indicios técnicos derivables del repositorio son indirectos: el pipeline declarado es `text-generation` con tag `conversational`, lo que indica un modelo ajustado para diálogo multi-turno; el tag `nvfp4` sugiere que existe una variante cuantizada a 4 bits en formato FP4 de NVIDIA, y la build publicada aquí está adaptada a MLX, el framework de arrays para Apple Silicon. Cualquier afirmación adicional sobre la arquitectura sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional: el pipeline declarado (`text-generation`) y el tag `conversational` confirman el ajuste para diálogo multi-turno.
- Razonamiento y código: no disponible; no hay documentación ni benchmarks que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución local en Apple Silicon: confirmada por el uso de MLX como librería de despliegue.

## Casos de uso

- Asistente conversacional local en Mac: la build MLX permite cargar el modelo en un Mac con Apple Silicon y mantener conversaciones multi-turno sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad. Requiere validar previamente la longitud de contexto real del modelo.
- Prototipado rápido de aplicaciones de chat: al estar en formato MLX y con licencia Apache 2.0, se puede integrar en cuadernos y scripts de `mlx-lm` para evaluar la calidad de respuesta antes de comprometerse con un despliegue en producción.
- Generación de texto asistida en edición de contenidos: redacción de borradores, reescritura y resumen de documentos en un flujo de trabajo de escritorio, aprovechando la ejecución local para evitar costes por token.
- Investigación sobre cuantización de 4 bits: el checkpoint es un caso de estudio útil para medir la degradación de calidad de un modelo de ~28,8 B al pasar a un formato de 4 bits (NVFP4) frente a pesos de mayor precisión, siempre que se disponga del checkpoint original para comparar.
- Base para ajuste fino (fine-tuning) con LoRA en Mac: al ser Apache 2.0 y estar en safetensors, es candidato a adaptaciones con LoRA/QLoRA sobre el ecosistema MLX, aunque el tamaño de 17,6 GB limita el entrenamiento a equipos con memoria unificada amplia.
- Evaluación comparativa de stacks de inferencia: sirve para contrastar el rendimiento de MLX frente a llama.cpp o vLLM en un mismo modelo, midiendo latencia y tokens por segundo en hardware Apple frente a GPU NVIDIA.
- Servicio interno de bajo volumen: con solo 10 descargas y acceso restringido, encaja en despliegues de nicho donde el volumen no justifica infraestructura GPU dedicada y se prefiere hardware de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación en el repositorio ni en los resultados de búsqueda web, que no guardan relación con el modelo. Tampoco se dispone de comparaciones oficiales frente a modelos de tamaño similar.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: los pesos ocupan 17,6 GB, por lo que se necesita un mínimo de 24 GB de memoria unificada en Apple Silicon para cargar el modelo con margen escaso para KV cache; 32 GB o más es recomendable para contextos largos y conversaciones multi-turno.
- GPU Apple: cualquier chip M-series con memoria unificada de 24 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y equivalentes). El modelo no se ejecuta de forma nativa en GPU NVIDIA mediante esta build, ya que está empaquetado para MLX.
- GPU NVIDIA: no disponible para esta build. El tag `nvfp4` sugiere la existencia de una variante para formatos FP4 de NVIDIA, cuyo soporte nativo está ligado a arquitecturas Blackwell; no se confirma en la información disponible.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí, en equipos con 24 GB o más de memoria unificada. En NVIDIA de consumo no hay confirmación para este repositorio concreto.
- Opciones de despliegue: `mlx-lm` (librería declarada), con posibilidad de servir una API compatible con OpenAI mediante los wrappers habituales de MLX. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La comparación de rendimiento no es posible: no hay benchmarks publicados de Raon-1-mini-preview. La tabla se limita a parámetros, contexto declarado, licencia y disponibilidad de formatos.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1-mini-preview-mlx (KRAFTON) | ≈28,8 B | no disponible | Apache 2.0 | safetensors (MLX), tag nvfp4 | Acceso gated; build específica para Apple Silicon |
| Gemma 2 27B (Google) | 27 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF, MLX | Requiere aceptar términos; no es Apache 2.0 |
| Qwen2.5 32B (Alibaba) | ≈32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF, AWQ/GPTQ | Contexto largo documentado y amplio soporte de herramientas |
| Mistral Small 24B (Mistral AI) | ≈24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de menor tamaño con contexto medio |

Los datos de los modelos comparados corresponden a sus especificaciones públicas habituales; los de Raon-1-mini-preview se limitan a lo declarado en el repositorio. Cualquier conclusión sobre calidad relativa exigiría ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, contexto, dataset ni idiomas, lo que impide evaluar el modelo con criterios de ingeniería antes de invertir tiempo en su integración.
- Sesgos conocidos: no disponibles. Al no documentarse la composición del dataset ni los procesos de alineación, no puede evaluarse el riesgo de sesgo de género, etnia, idioma o ideología.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de fidelidad factual ni de tasa de alucinación publicadas.
- Limitaciones de contexto e idioma: desconocidas. El campo de idiomas del repositorio está vacío y no se declara ventana de contexto, por lo que no puede asumirse un rendimiento correcto en castellano ni en conversaciones largas.
- Restricción de acceso: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que puede bloquear pipelines automatizados de descarga y despliegue en CI.
- Licencia: Apache 2.0 permite uso comercial y modificaciones sin obligación de atribución adicional, pero conviene verificar los términos del modelo base (no incluidos en la información disponible) por si añaden cláusulas adicionales.
- Madurez: el repositorio tiene 10 descargas y 21 likes, con creación y última actualización en la misma fecha. Es un preview sin historial de mantenimiento que justifique su uso en producción crítica.
- Compatibilidad de hardware limitada: esta build está pensada para MLX; no se confirma su funcionamiento en CUDA, ROCm ni CPU convencional.
- Cuantización a 4 bits: aunque el tag `nvfp4` sugiere ello, no hay métricas de degradación frente al modelo en precisión completa, por lo que la calidad puede diferir del checkpoint original.

## Enlaces

- HuggingFace: https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx
- Repositorio MLX (framework de ejecución): no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible
- Demo o espacio de inferencia: no disponible
- Nota: los resultados de la búsqueda web realizada no contienen ningún enlace relacionado con el modelo, KRAFTON o MLX; corresponden a foros de diseño gráfico y automoción sin relación con el tema.
