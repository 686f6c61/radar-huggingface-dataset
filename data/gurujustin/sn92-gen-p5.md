# gurujustin/sn92-gen-p5

## Resumen

sn92-gen-p5 es un ajuste fino mediante LoRA del modelo ronanlee777/sn92-gen-ma, un modelo de decisión orientado a tareas de clasificación y enrutamiento dentro del ecosistema de subredes sn92. El autor, gurujustin, lo publica bajo licencia MIT con el objetivo de servir como entrada generalista para dicha subred. El modelo base es a su vez una mezcla (soup) al 50/50 de isomsom/sn92-gen-m87b y xflud/sn92-decider-1, fusionada sobre el backbone declarado baselabs/mammoth-1.

Con 26.085.330.160 parámetros totales (aproximadamente 26.000 millones) y un repositorio de 52,2 GB en formato safetensors, se trata de un modelo de gran tamaño derivado de la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio. La relevancia actual radica en su carácter de modelo de decisión especializado: no busca ser un asistente conversacional general, sino un componente de enrutamiento o selección dentro de un pipeline multi-modelo.

La información pública disponible es muy limitada: no se declaran idiomas soportados, no hay pipeline definido, no se publican resultados de benchmarks y la model card se limita a describir la genealogía del ajuste y las licencias. Esta ficha refleja exclusivamente los datos verificables del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen 3.5, según tag `qwen3_5`); detalles concretos no disponibles |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre ronanlee777/sn92-gen-ma (commit `d4aa443d03e12c073a176c84eb53096898943986`), que a su vez es una mezcla al 50/50 de isomsom/sn92-gen-m87b y xflud/sn92-decider-1, fusionada sobre el backbone declarado baselabs/mammoth-1. El resultado del ajuste se ha mergeado en el backbone, por lo que la distribución final es un modelo denso de aproximadamente 26.000 millones de parámetros en safetensors.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La etiqueta `decision-model` y la pertenencia a la subred sn92 sugieren un entrenamiento orientado a tareas de decisión (selección, clasificación o enrutamiento), pero no se aportan detalles técnicos sobre el proceso. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del backbone Qwen 3.5, sin confirmación explícita en la model card.
- Modelo de decisión: etiquetado como `decision-model`, orientado a tareas de selección o enrutamiento dentro de la subred sn92.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines multi-modelo: el modelo puede actuar como clasificador que decida qué modelo especializado debe atender cada petición, dado su carácter de `decision-model` dentro de la subred sn92.
- Selección de respuestas candidatas: en un sistema que genere varias respuestas con distintos modelos, sn92-gen-p5 puede puntuar o elegir la más adecuada.
- Clasificación de intenciones en asistentes: integrado como primera etapa de un agente, permite etiquetar la intención del usuario antes de derivar a un modelo generativo mayor.
- Evaluación automática de salidas: uso como juez o discriminador en pipelines de control de calidad de respuestas generadas.
- Filtrado y moderación en producción: como modelo de decisión binaria o multiclase sobre contenido entrante, siempre que se valide su comportamiento con datos propios.
- Investigación sobre mezclas y ajustes LoRA: su genealogía documentada (soup + LoRA merge) lo convierte en un caso de estudio reproducible para experimentos de merging de modelos.
- Componente en sistemas de subredes descentralizadas: encaja en arquitecturas donde distintos nodos aportan modelos especializados y se necesita un decisor común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 26-30 GB; en 4 bits, en torno a 14-16 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con paralelismo tensorial.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en precisión completa; requeriría cuantización agresiva a 4 bits y aun así estaría al límite.
- Opciones de despliegue: vLLM o TGI para serving en FP16/BF16; llama.cpp u Ollama solo si se generan cuantizaciones GGUF propias a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gurujustin/sn92-gen-p5 | 26,1 B | no disponible | MIT | Ajuste LoRA de un modelo de decisión de la subred sn92 |
| ronanlee777/sn92-gen-ma | no disponible | no disponible | no disponible | Modelo base directo; soup de dos modelos sn92 |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Componente del soup; orientado a decisión |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Backbone declarado de la subred |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que su uso en producción requiere evaluación propia.
- Idiomas no declarados: no se puede asumir soporte multilingüe sin validación.
- Contexto desconocido: la longitud de ventana no está documentada, lo que impide planificar casos de uso con contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de decisión puede producir clasificaciones erróneas con alta confianza.
- Sesgos: no documentados; al derivar de un soup de modelos comunitarios, puede heredar sesgos de los datasets originales no especificados.
- Licencia MIT: permite uso comercial, pero el autor retiene las líneas de copyright upstream en LICENSE y NOTICE; conviene revisarlas antes de redistribuir.
- Falta de afiliación: el autor declara explícitamente que no está afiliado a Base Labs/Baseten, al equipo de Qwen ni a Perplexity AI.
- Madurez: repositorio con 42 descargas y 0 likes, creado y actualizado el mismo día; sin señales de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/gurujustin/sn92-gen-p5
- Modelo base: https://huggingface.co/ronanlee777/sn92-gen-ma
- Componente del soup: https://huggingface.co/isomsom/sn92-gen-m87b
- Componente del soup: https://huggingface.co/xflud/sn92-decider-1
- Backbone declarado: https://huggingface.co/baselabs/mammoth-1
