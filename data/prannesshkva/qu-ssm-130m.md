# Prannesshkva/QU-SSM-130M

## Resumen

QU-SSM-130M es un modelo de lenguaje basado en state space models (SSM) desarrollado por Prannessh K.V.A. que aborda el problema del Hurwitz Dissipation Bottleneck, es decir, la degradación exponencial del estado oculto en recurrencias lineales clásicas. Para ello, parametriza las transiciones recurrentes en el grupo de Lie SO(16) mediante la transformada de Cayley, lo que garantiza que la norma espectral del operador de recurrencia sea exactamente 1.0 y, por tanto, la energía se conserve a lo largo de la secuencia.

El modelo tiene 24 capas recurrentes, un tamaño de ocultamiento de 768, una dimensión de estado unitario de 16 y un contexto de 8.192 tokens. Con aproximadamente 129,1 millones de parámetros, se posiciona como un modelo compacto orientado a investigación. Su relevancia radica en explorar una alternativa a las arquitecturas Transformer y Mamba, con un fundamento matemático sólido en álgebras de Lie y matrices unitarias, y en ofrecer una implementación nativa en Hugging Face Transformers mediante trust_remote_code.

La licencia es BSL 1.1, que permite uso no comercial, académico y de evaluación, pero prohíbe el uso comercial y la redistribución de obras derivadas sin permiso explícito. El modelo se publica con un DOI en Zenodo y un espacio interactivo en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con recurrencia unitaria SO(16) vía transformada de Cayley |
| Parametros totales | 129.127.680 (según model card); 290.489.856 (según metadatos de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (se recomienda fp16 en el ejemplo de carga) |
| Idiomas soportados | Inglés (en) |
| Licencia | BSL 1.1 (Business Source License) |
| Formato de pesos | safetensors |

Nota: existe una discrepancia entre los parámetros declarados en la model card (129,1M) y los metadatos del archivo safetensors (290,5M). Se recomienda verificar el tamaño real del modelo antes de su uso.

## Arquitectura y entrenamiento

QU-SSM-130M implementa una recurrencia cuasi-unitaria con compuerta. La transición de estado se define como:

1. Generador sesgado-simétrico: H = W - W^T, que pertenece al álgebra de Lie so(16).
2. Operador unitario de Cayley: U = (I - H/2)^(-1)(I + H/2), que pertenece a SO(16) y tiene norma espectral exactamente 1.0.
3. Recurrencia con compuerta: h_t = gamma_t * (U · h_{t-1}) + Delta_t · (x_t ⊗ B_t), donde gamma_t ∈ (0, 1] actúa como compuerta de olvido dinámica.

Esta formulación garantiza que la norma del estado no decaiga exponencialmente, resolviendo el problema de disipación de Hurwitz presente en recurrencias lineales estándar. El modelo usa un tokenizer BPE nativo con vocabulario de 50.280 tokens. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal (causal LM) con ventana de contexto de 8.192 tokens.
- Razonamiento secuencial gracias a la recurrencia unitaria, que preserva información a largo plazo.
- Filtrado selectivo de ruido mediante la compuerta de olvido dinámica gamma_t.
- Implementación nativa en Hugging Face Transformers con trust_remote_code.
- Soporte de generación con parámetros estándar (temperature, top_p, repetition_penalty).
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación académica en state space models: el modelo sirve como banco de pruebas para estudiar la estabilidad de recurrencias unitarias y su impacto en tareas de modelado de lenguaje a largo plazo.
- Prototipado de arquitecturas recurrentes alternativas: desarrolladores pueden comparar el comportamiento de QU-SSM-130M frente a Mamba o S4 en tareas de generación de texto con contexto largo.
- Generación de texto en entornos con recursos limitados: al ser un modelo de ~130M parámetros, puede ejecutarse en GPUs de consumo con cuantización, aunque no se han publicado guías de cuantización específicas.
- Educación en álgebra de Lie aplicada a deep learning: el modelo y su documentación matemática son un recurso didáctico para cursos avanzados de arquitecturas neuronales.
- Evaluación de estabilidad numérica: investigadores pueden analizar la propagación de gradientes y la conservación de energía en recurrencias unitarias frente a SSMs clásicos.
- Experimentación con generación de texto en inglés: el modelo puede usarse para tareas de completado de texto, storytelling o generación de contenido breve, siempre dentro del ámbito no comercial permitido por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 129,1M parámetros en fp16, el modelo ocupa aproximadamente 258 MB en memoria. Con los 290,5M reales, el peso en fp16 sería de unos 581 MB. La inferencia puede caber en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, etc.). El modelo es ligero y no requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo básicas.
- Opciones de despliegue: Hugging Face Transformers con trust_remote_code, PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al ser un SSM recurrente, la inferencia es secuencial y debería escalar linealmente con la longitud de secuencia, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QU-SSM-130M | 129,1M (declarado) | 8.192 | SSM unitario SO(16) | BSL 1.1 | Hugging Face |
| Mamba-130M | ~130M | 2.048 (ampliable) | SSM selectivo | Apache 2.0 | Hugging Face |
| S4 | ~100M-1B | Variable | SSM lineal | Apache 2.0 | GitHub |

Mamba y S4 son alternativas consolidadas con licencias permisivas y benchmarks publicados. QU-SSM-130M se diferencia por su fundamento en grupos de Lie y su enfoque en estabilidad espectral, pero carece de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Licencia BSL 1.1: prohibido el uso comercial, la redistribución de derivados y el despliegue en producción sin licencia comercial explícita. Solo uso personal, académico y de evaluación.
- Discrepancia de parámetros: la model card declara 129,1M pero los metadatos de safetensors indican 290,5M. Esto puede afectar a los requisitos de memoria y a la interpretación de la arquitectura.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que dificulta la evaluación objetiva.
- Idioma limitado: solo inglés, sin soporte multilingüe documentado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto. No se han documentado mitigaciones específicas.
- Sin información sobre el dataset de entrenamiento: no se conocen los datos utilizados, su composición ni posibles sesgos.
- Modelo en fase de preprint: el estado de desarrollo es preliminar (preprint v1.0) y no hay garantías de estabilidad o soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Prannesshkva/QU-SSM-130M
- DOI Zenodo: https://doi.org/10.5281/zenodo.22177118
- Espacio interactivo: https://huggingface.co/spaces/Prannesshkva/QU-SSM-Studio
- GitHub del autor: https://github.com/prannesshkva
- Web del autor: https://prannesshkva.vercel.app/index.html
