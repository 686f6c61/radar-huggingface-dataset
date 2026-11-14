# BRR1154/SLM-WebDev-v2

## Resumen

SLM-WebDev-v2 es un modelo de lenguaje especializado en la síntesis de interfaces web accesibles, desarrollado por Bhavanam Rajendra Reddy (Runtime-Slayers) como una evolución del checkpoint SLM-WebDev-v1. Se construye sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros, y se ajusta mediante LoRA real en PyTorch combinado con una técnica de consolidación en espacio nulo (null-space SVD) que preserva las capacidades generales del modelo base mientras especializa el comportamiento en tareas de generación de HTML5 accesible y estructuras AST de UI.

El modelo aborda un problema concreto: la generación determinista de marcado HTML5 semánticamente correcto y accesible para componentes de interfaz. Frente al baseline v1, el autor declara una mejora de 25% a 58,33% en precisión de ejecución sobre el conjunto de evaluación de dominio HTML5-AST-UI-12, manteniendo a la vez la retención en tareas generales (ARC-Easy-25) en un 76%.

Es relevante ahora por su tamaño reducido (apto para GPU de consumo), su licencia Apache 2.0 permisiva para uso comercial y su enfoque metodológico de "cirugía de pesos" que busca especializar sin degradar. No obstante, se trata de un modelo experimental con 58 descargas en el momento de la consulta y sin validación independiente de sus métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA + consolidación null-space |
| Parametros totales | 494.032.768 (494M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste se realiza sobre el checkpoint intermedio SLM-WebDev-v1 mediante capas `LoRALinear` reales en PyTorch con retropropagación, aplicadas sobre un "banda de capas objetivo" 10-23 y sobre las proyecciones `q_proj`, `v_proj`, `o_proj` y `down_proj`. El autor reporta 40 pasos de gradiente con rango LoRA 16 y subespacio SVD empírico de dimensión k=24.

La innovación técnica declarada es la consolidación en espacio nulo: tras el ajuste, se aplica una proyección $\Delta W_{\text{proj}} = \Delta W - (\Delta W V_{\text{base}}) V_{\text{base}}^T$ para eliminar del delta de pesos las componentes que actúan sobre subespacios ya cubiertos por el modelo base, minimizando la interferencia con capacidades previas. El autor reporta 56/56 módulos mutados verificados por SHA-256, un desplazamiento máximo de Frobenius del 1,627% y un error de ortogonalidad máximo de 3,842e-09. Además se emplea una calibración "Wake-Error ABSTAIN" para que el modelo se abstenga en casos fuera de distribución. No se especifica el volumen ni la composición del dataset de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template de Qwen2.5).
- Síntesis de HTML5 accesible y estructuras AST de UI para componentes frontend.
- Generación determinista (el quickstart usa `do_sample=False`), orientada a reproducibilidad.
- Capacidades de retención general preservadas parcialmente (76% en ARC-Easy-25 según el autor).
- Calibración de abstención para señalar casos fuera de dominio (mecanismo ABSTAIN).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de componentes de interfaz accesibles: el modelo produce marcado HTML5 con atributos ARIA y estructura semántica, adecuado para prototipado rápido de UI en pipelines de diseño.
- Automatización de tareas de frontend en CI/CD: puede integrarse como generador de fragmentos HTML5 en flujos de build, dado su tamaño reducido y su enfoque determinista (`do_sample=False`).
- Asistencia a desarrolladores en editores de código: autocompletado y sugerencia de estructuras AST de UI para frameworks web, gracias a su especialización en el dominio.
- Auditoría y corrección de accesibilidad: puede emplearse para reescribir fragmentos de HTML no accesible en versiones conformes con buenas prácticas ARIA.
- Despliegue en entornos con recursos limitados: con 494M parámetros cabe en GPU de consumo, lo que permite servir la especialización en local o en edge sin infraestructura dedicada.
- Filtrado y clasificación de salidas de UI: su calibración ABSTAIN permite usar el modelo como verificador de calidad en un pipeline de generación más amplio, descartando salidas fuera de distribución.
- Investigación en especialización de modelos: sirve como caso de estudio reproducible de ajuste LoRA con consolidación null-space sobre un modelo base pequeño.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Ámbito | Resultado |
|---|---|---|
| HTML5-AST-UI-12 (v2) | Ejecución de dominio / precisión de solver | 58,33% |
| HTML5-AST-UI-12 (v1 baseline) | Ejecución de dominio / precisión de solver | 25,00% |
| ARC-Easy-25 (raw / PMI-calibrado) | Retención general | 76,0% / 76,0% |
| AA-Omniscience-12 | Índice de calibración | -25,00 |
| GPQA-Diamond | 50 preguntas de ciencia PhD | 20,0% (raw) / 18,0% (PMI) |
| Humanity's Last Exam (HLE) | 51 ítems de opción múltiple | 9,8% (raw) / 15,69% (PMI) |
| MATH-500 (nivel 1-3) | PAL Python | 3/8 (37,5%) |
| AIME 2025 | PAL Python | 0/5 (0,0%) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-WebDev-v2 | 494M | no disponible | HTML5 accesible / UI | Apache 2.0 | Hugging Face (58 descargas) |
| Qwen2.5-0.5B-Instruct | 494M | no disponible | Generalista | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-Coder-0.5B-Instruct | 494M | no disponible | Código | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | no disponible | Generalista | Apache 2.0 | Hugging Face |

La comparación directa de rendimiento con estas alternativas no está disponible, ya que el autor solo publica métricas frente a su propio baseline v1 y benchmarks de frontera. Qwen2.5-0.5B-Instruct es el modelo base directo y sirve como referencia de capacidades generales; Qwen2.5-Coder-0.5B-Instruct es la alternativa natural para tareas de código; SmolLM2-360M-Instruct compite en el segmento de modelos pequeños.

## Limitaciones y advertencias

- Modelo experimental con 58 descargas y sin validación independiente de las métricas declaradas; los benchmarks son autoinformados (`verified: false`).
- El índice de calibración AA-Omniscience-12 es negativo (-25,00), lo que sugiere sobreconfianza en la estimación de conocimiento propio.
- Rendimiento muy bajo en razonamiento matemático y científico: 0% en AIME 2025 y 20% en GPQA-Diamond; no es adecuado para tareas STEM.
- Soporte únicamente en inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación en generación de HTML/ARIA no verificado por herramientas externas en producción; se recomienda validación con parsers y linters.
- Sesgos no documentados en la model card; al derivar de Qwen2.5-0.5B-Instruct hereda los sesgos del corpus de entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Longitud de contexto no confirmada en la información proporcionada; conviene verificar la configuración del tokenizer antes de usarlo con prompts largos.
- El mecanismo de abstención (ABSTAIN) no está documentado en detalle; su fiabilidad en producción es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/BRR1154/SLM-WebDev-v2
- Checkpoint base v1: https://huggingface.co/BRR1154/SLM-WebDev-v1
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
