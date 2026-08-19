# barbonara/corin-nemotron-super-anti-sft

## Resumen

El repositorio `barbonara/corin-nemotron-super-anti-sft` contiene un adaptador LoRA exportado desde la plataforma Tinker, diseñado para aplicarse sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. El nombre del adaptador sugiere una finalidad de "anti-SFT" (anti-supervised fine-tuning), pero no se proporciona ninguna descripción adicional sobre su propósito, metodología de entrenamiento o datos utilizados. Se trata de un adaptador de 3.6 GB con rango 8, que modifica las capas de atención y MLP, pero no la capa de unembedding.

El modelo base, NVIDIA Nemotron 3 Super, es un modelo de arquitectura Mixture-of-Experts (MoE) híbrida Mamba-Transformer con 120B parámetros totales y 12B activos. Es el primero de la serie Nemotron 3 que emplea Latent MoE, capas MTP (Multi-Token Prediction) para decodificación especulativa nativa y preentrenamiento en precisión NVFP4. El adaptador LoRA hereda las capacidades del modelo base, aunque su comportamiento específico no está documentado.

Dado que el adaptador no incluye model card descriptiva, benchmarks ni ejemplos de uso, esta ficha se centra en las características conocidas del modelo base y en las limitaciones de la información disponible sobre el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Mamba-Transformer con Latent MoE (modelo base) |
| Parametros totales | 120B (modelo base) |
| Parametros activos | 12B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (modelo base); adaptador LoRA en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre NVIDIA Nemotron 3 Super, un modelo MoE híbrido que combina capas Transformer con bloques Mamba (SSM). La arquitectura Latent MoE optimiza la relación precisión por FLOP y precisión por parámetro, y las capas MTP permiten decodificación especulativa nativa. El modelo base fue preentrenado en NVFP4, una precisión de 4 bits desarrollada por NVIDIA para reducir memoria y acelerar la inferencia.

El adaptador fue entrenado con rango LoRA 8, afectando a las proyecciones de atención (`attn=True`) y a las capas MLP (`mlp=True`), sin modificar la capa de unembedding (`unembed=False`). Se desconoce el dataset, el número de pasos, la función de pérdida y cualquier detalle adicional del entrenamiento. El nombre "anti-sft" podría indicar un entrenamiento orientado a revertir o mitigar los efectos de un fine-tuning supervisado previo, pero no hay evidencia que lo confirme.

## Capacidades

Las capacidades listadas corresponden al modelo base Nemotron 3 Super, ya que el adaptador no documenta capacidades propias:

- Generación de texto y razonamiento complejo (matemáticas, ciencia, lógica).
- Generación de código y soporte de tool calling / function calling.
- Razonamiento multi-step y capacidades de agente (agentic AI).
- Razonamiento visual (el modelo base es multimodal, según NVIDIA).
- Decodificación especulativa nativa gracias a las capas MTP.
- Eficiencia en inferencia por su naturaleza MoE con 12B activos.

No se puede afirmar que el adaptador preserve o modifique estas capacidades sin información adicional.

## Casos de uso

Dado que no se dispone de documentación sobre el adaptador, los casos de uso se infieren del modelo base y de la naturaleza genérica de un adaptador LoRA:

- Ajuste de un modelo MoE de 120B para tareas específicas sin reentrenar todos los parámetros, usando LoRA para adaptar atención y MLP con un coste reducido.
- Investigación sobre "anti-SFT": explorar cómo un adaptador puede contrarrestar los efectos de un fine-tuning supervisado (por ejemplo, para estudiar alineación o desalineación).
- Experimentación con adaptadores LoRA sobre modelos MoE híbridos Mamba-Transformer para evaluar su comportamiento en tareas de razonamiento o código.
- Fine-tuning selectivo para dominios concretos (legal, médico, técnico) donde se requiera modificar solo ciertas capas.
- Pruebas de decodificación especulativa con el modelo base y un adaptador que no altere las capas MTP.
- Integración en pipelines de agentes donde se necesite un modelo de 12B activos con bajo coste de inferencia.

Estos casos son hipotéticos y deben validarse experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el adaptador `corin-nemotron-super-anti-sft` en la información disponible. El modelo base Nemotron 3 Super tiene benchmarks reportados en su technical report (MMLU, HumanEval, GSM8K, etc.), pero no se incluyen aquí por no ser específicos del adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere al menos 240 GB en BF16 (120B parámetros). Con cuantización NVFP4, aproximadamente 60 GB. El adaptador LoRA añade unos 3.6 GB adicionales.
- GPU recomendadas: para el modelo base en BF16, se necesitan múltiples GPU (por ejemplo, 2-4 A100 80GB o H100). En NVFP4, una sola GPU de 80 GB podría ser suficiente.
- No cabe en GPU de consumo (RTX 4090 tiene 24 GB) sin cuantización agresiva, y aun así sería inviable para 120B.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o directamente con Transformers + PEFT para cargar el adaptador.
- Latencia y throughput: no disponibles para el adaptador; el modelo base tiene buen throughput por ser MoE con 12B activos, pero no se aportan cifras.

## Comparativa con modelos similares

El modelo base Nemotron 3 Super compite con otros MoE de gran escala, pero el adaptador en sí no es comparable directamente. A continuación se comparan modelos base de características similares:

| Modelo | Parametros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3 Super | 120B | 12B | no disponible | MoE híbrida Mamba-Transformer | no disponible |
| DeepSeek-V3 | 671B | 37B | 128K | MoE Transformer | MIT |
| Qwen2.5-MoE | 57B | 14B | 32K | MoE Transformer | Apache 2.0 |

El adaptador LoRA no tiene comparativa directa con otros adaptadores sin información sobre su entrenamiento.

## Limitaciones y advertencias

- No hay documentación sobre el propósito, el dataset de entrenamiento ni la metodología del adaptador. Su uso en producción es arriesgado.
- La licencia no está especificada; no se puede garantizar su uso comercial.
- El nombre "anti-sft" sugiere una posible intención de desalinear el modelo, lo que podría generar comportamientos no deseados o inseguros.
- El adaptador solo modifica atención y MLP, no la capa de unembedding; esto puede limitar su capacidad de ajuste.
- El modelo base tiene 120B parámetros; la inferencia requiere hardware de datacenter, no disponible para la mayoría de equipos.
- No se conocen sesgos específicos del adaptador, pero el modelo base puede heredar sesgos de sus datos de entrenamiento (no documentados aquí).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/barbonara/corin-nemotron-super-anti-sft
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Página de investigación de Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Technical report (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Artículo arXiv: https://arxiv.org/html/2604.12374v1
- GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
