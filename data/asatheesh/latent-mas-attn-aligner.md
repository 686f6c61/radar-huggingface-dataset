# asatheesh/latent-mas-attn-aligner

## Resumen

LatentMAS Attention Aligner es un modelo de seguridad diseñado para sistemas multi-agente (MAS) que se comunican en espacio latente en lugar de lenguaje natural. En este tipo de arquitecturas, los mensajes entre agentes son estados ocultos, por lo que los moderadores de texto tradicionales no pueden inspeccionarlos sin decodificar cada latente a tokens. Este aligner, desarrollado por asatheesh (Anirudh Satheesh) en el contexto del proyecto LatentMAS, lee directamente los latentes previos al agente "Judger" y los mapea al espacio de representación de una cola clasificadora congelada de Llama-Guard-3-8B, produciendo una probabilidad `p_unsafe` para la comunicación. Un despliegue umbraliza `p_unsafe` con un valor `tau` y, si se supera, inyecta un aviso de seguridad antes del agente agregador final.

El modelo es un artefacto de investigación, con 27,3 millones de parámetros (5 tensores), y se entrena sobre rollouts de un MAS latente secuencial de 3 agentes con etiquetas de cumplimiento de daño. Su arquitectura de pooling con una query aprendible permite aceptar cualquier número de agentes sin reentrenar, lo que lo hace flexible para cadenas de 3 agentes o DAGs de 9 agentes con bifurcación y fusión. Su relevancia radica en abordar un problema emergente: la moderación de seguridad en sistemas donde los agentes no intercambian texto, sino representaciones continuas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pooling por atención (query aprendible) + MLP de 4096 dimensiones + cola congelada de Llama-Guard-3-8B |
| Parametros totales | 27,3 millones (5 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre latentes, no sobre texto) |
| Tipos de cuantizacion | No disponible (pesos PyTorch estándar) |
| Idiomas soportados | No disponible (depende del modelo subyacente, Qwen3-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`aligner.pt`, no safetensors) |

## Arquitectura y entrenamiento

El aligner no es un modelo generativo, sino un clasificador de seguridad acoplado a un MAS latente. Su entrada es `h_a` con forma `[B, K, 2560]`, donde `K` es el número de pasos latentes (8 en el entrenamiento) multiplicado por el número de agentes pre-Judger. Una única query aprendible atiende sobre los `K` tokens latentes mediante atención, y el resultado pasa por un MLP con dimensión oculta 4096, produciendo una salida `[B, 4096]` que alimenta una cola congelada de Llama-Guard-3-8B. Esta cola no está incluida en el checkpoint; el usuario debe suministrarla.

El entrenamiento se realizó con pesos de clase 1:10 (favorables a la clase de daño), 60 épocas, tasa de aprendizaje 3e-4 y tamaño de lote 512, sobre rollouts secuenciales de 3 agentes con etiquetas de cumplimiento de daño. La innovación clave es el pooling variable: al atender sobre un número arbitrario de tokens latentes, el mismo checkpoint funciona para cualquier número de agentes sin reentrenar ni remodelar los pesos. El umbral `tau` no es una propiedad fija del modelo; debe calibrarse sobre el tráfico benigno propio del despliegue (por ejemplo, el percentil 95 de `p_unsafe` para una tasa de marcado del 5%).

## Capacidades

- Clasificación de contenido inseguro en comunicaciones latentes entre agentes de un MAS, produciendo `p_unsafe`.
- Generalización a un número variable de agentes sin reentrenamiento (probado con cadenas de 3 agentes y DAGs de 9 agentes).
- Inyección de avisos de seguridad cuando `p_unsafe` supera el umbral `tau`.
- Integración con la cola clasificadora congelada de Llama-Guard-3-8B.
- No genera texto, no realiza razonamiento multi-paso ni tool calling; es un componente de moderación específico.

## Casos de uso

- **Moderación de seguridad en sistemas multi-agente latentes**: el aligner puede interponerse entre los agentes pre-Judger y el agregador final, bloqueando o anotando comunicaciones que superen el umbral de riesgo, sin necesidad de decodificar los latentes a texto.
- **Investigación en seguridad de IA**: sirve como banco de pruebas para estudiar cómo se manifiestan comportamientos dañinos en el espacio latente y cómo mitigarlos, especialmente en arquitecturas que evitan el razonamiento textual explícito.
- **Monitoreo en tiempo real de agentes colaborativos**: en despliegues donde varios agentes intercambian estados ocultos (por ejemplo, en planificación o razonamiento distribuido), el aligner puede auditar cada intercambio y emitir alertas.
- **Evaluación de riesgos en pipelines de MAS**: permite medir la frecuencia de comunicaciones potencialmente dañinas en un sistema latente, ayudando a calibrar políticas de seguridad antes de producción.
- **Benchmarking de seguridad en MAS latentes**: los autores lo presentan como herramienta para comparar la eficacia de diferentes estrategias de alineación en entornos donde la moderación textual no es aplicable.
- **Investigación académica sobre alineación de modelos**: el código de entrenamiento y el dataset asociado (`latent-mas-safety-dataset`) permiten reproducir y extender el enfoque a otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un barrido de tres umbrales en resultados de despliegue, pero no se proporcionan valores numéricos. No se dispone de comparaciones con otros modelos de moderación.

## Requisitos de hardware

- El modelo en sí tiene 27,3 millones de parámetros, ocupando aproximadamente 0,1 GB en disco; la inferencia requiere menos de 200 MB de VRAM para los pesos.
- Sin embargo, la cola congelada de Llama-Guard-3-8B no está incluida y debe cargarse por separado, lo que exige al menos 16 GB de VRAM en FP16 (o más con cuantización).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para acomodar Llama-Guard-3-8B (por ejemplo, RTX 4090, A100, H100). Sin la cola, cualquier GPU consumer es suficiente.
- Opciones de despliegue: al ser un modelo PyTorch pequeño, puede integrarse fácilmente en scripts personalizados. No se mencionan adaptaciones para vLLM, llama.cpp u Ollama, pero el código de ejemplo muestra una carga directa con `torch.load`.
- Latencia y throughput estimados: no disponibles; dependerán de la cola congelada de Llama-Guard y del número de agentes.

## Comparativa con modelos similares

No disponible. Este aligner es un artefacto de investigación específico para MAS latentes; no existen modelos comparables en el mercado que realicen moderación directamente sobre estados ocultos. Los moderadores de texto (como Llama-Guard estándar) requieren decodificar los latentes, lo que invalida su uso en este contexto.

## Limitaciones y advertencias

- Solo es válido para latentes de Qwen3-4B con dimensión `d_a=2560`; no transferible a otros modelos con diferente tamaño oculto o convención de latentes sin reentrenar.
- No es un clasificador de contenido general ni ha sido evaluado como sistema de moderación independiente.
- La cola congelada de Llama-Guard-3-8B no se incluye en el checkpoint; el usuario debe suministrarla y conocer sus propias limitaciones y sesgos.
- El umbral `tau` debe recalibrarse en cada despliegue; los valores de validación no se transfieren de forma fiable porque las distribuciones de `p_unsafe` difieren entre entornos.
- Al estar entrenado con pesos de clase 1:10, puede presentar un sesgo hacia el sobre-marcado de comunicaciones benignas como dañinas (falsos positivos).
- Es un artefacto de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva en el dominio objetivo.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de garantías y la dependencia de Llama-Guard (con su propia licencia) deben tenerse en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-attn-aligner
- Repositorio de código del aligner (según model card): https://github.com/Asatheesh6561/LatentMASHarmBench
- Proyecto LatentMAS (framework general): https://github.com/Gen-Verse/LatentMAS
- Artículo "Latent Collaboration in Multi-Agent Systems": https://arxiv.org/abs/2511.20639
- Dataset de seguridad asociado: https://huggingface.co/asatheesh/latent-mas-safety-dataset
