# asatheesh/latent-mas-aligner-phi3-mini-seed-1

## Resumen

LatentMAS Aligner (phi3-mini, topología secuencial, seed 1) es un artefacto de investigación desarrollado por asatheesh para estudiar la seguridad en sistemas multiagente (MAS) cuyos agentes se comunican en espacio latente en lugar de lenguaje natural. El problema que aborda es concreto: cuando los mensajes entre agentes son estados ocultos y no texto, la moderación basada en tokens no puede inspeccionarlos sin decodificarlos previamente. Este alineador lee directamente los latentes previos al agente Judger y los proyecta al espacio de representación de una cola congelada de Llama-Guard-3-8B, produciendo una probabilidad `p_unsafe` por comunicación.

El módulo no es un modelo de lenguaje completo, sino un componente auxiliar de unos 0,1 GB de peso construido sobre `microsoft/Phi-3-mini-4k-instruct` como modelo objetivo. Su arquitectura consiste en un pooling con una query aprendible que atiende sobre K tokens latentes, seguido de una proyección a dimensión 4096 que alimenta la cola del clasificador. Al atender sobre un número variable de tokens, un mismo checkpoint acepta cualquier número de agentes N sin reentrenamiento, lo que permite cubrir cadenas de 3 agentes y DAGs branch-and-fuse de 9 agentes con los mismos pesos.

Es relevante ahora porque la comunicación latente entre agentes es una línea activa de investigación en eficiencia multiagente, y la ausencia de mecanismos de moderación legibles sobre dichos canales es un hueco de seguridad poco explorado. El checkpoint forma parte de un estudio factorial topología x seed, con AUC de validación 0,9122 y un umbral `tau` calibrado en 0,7333563566 para una tasa de falsos positivos del 10 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo de alineamiento latente: pooling con query aprendible sobre K tokens + proyección a 4096, acoplado a cola congelada de Llama-Guard-3-8B |
| Parametros totales | no disponible (el checkpoint `aligner.pt` no declara recuento; tamaño de repo 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre K tokens latentes; K = 8 pasos latentes x número de agentes previos al Judger) |
| Tipos de cuantizacion | no disponible (se distribuye en PyTorch nativo, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`aligner.pt`, serializado con `torch.load`) |

## Arquitectura y entrenamiento

El componente es un cabezal de alineamiento, no un transformer completo. Su entrada son los latentes previos al Judger con forma `[B, K, 2560]`, donde K combina 8 pasos latentes por cada agente anterior al Judger. Sobre esos K tokens aplica un pooling mediante una única query aprendible y proyecta el resultado a un vector de dimensión 4096, que se inyecta en la cola congelada de Llama-Guard-3-8B para obtener `p_unsafe`. La parte del clasificador Llama-Guard no se distribuye con el checkpoint y debe aportarla el usuario. El fichero `aligner.pt` encapsula `{d_a, d_g, hidden_dim, pool, state_dict}`.

El entrenamiento se realizó sobre rollouts secuenciales de MAS latentes con 3 agentes, con etiquetas de cumplimiento de daño (harm-compliance), usando pesos de clase 1:10, 60 épocas, learning rate 3e-4, batch 512 y seed 1. La innovación central es que el pooling atiende sobre un número variable de tokens latentes, de modo que el mismo juego de pesos sirve tanto para cadenas de 3 agentes como para DAGs de 9 agentes con topología branch-and-fuse, sin necesidad de redimensionar ni reentrenar. Conviene señalar una discrepancia en la model card: la tabla de arquitectura declara como modelo objetivo `microsoft/Phi-3-mini-4k-instruct` con `d_a=3072`, mientras que la sección de limitaciones afirma que el módulo fue entrenado con latentes de `Qwen/Qwen3-4B` a `d_a=2560`; esta incoherencia condiciona la portabilidad real del checkpoint.

## Capacidades

- Clasificación de seguridad sobre comunicaciones latentes: produce una probabilidad `p_unsafe` a partir de latentes previos al Judger, sin necesidad de decodificar el canal a tokens.
- Inyección de avisos de seguridad: cuando `p_unsafe` supera un umbral `tau`, el pipeline puede insertar un aviso antes del agente agregador final.
- Generalización a distinto número de agentes: el pooling sobre K variable permite operar con N agentes arbitrario (cadenas de 3 y DAGs de 9) con los mismos pesos.
- Integración como guardarraíl en pipelines multiagente existentes, situándose antes del agente agregador.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: es exclusivamente un clasificador binario auxiliar.
- No se documenta soporte de tool calling, function calling, agentes autónomos ni capacidades multilingües.
- No incorpora modo de pensamiento (thinking mode), audio ni ninguna capacidad multimodal.

## Casos de uso

- Moderación de canales latentes en sistemas multiagente: el alineador lee los latentes previos al Judger y emite `p_unsafe`, permitiendo bloquear comunicaciones que un moderador textual no podría inspeccionar sin decodificar cada estado oculto.
- Investigación en seguridad de MAS: sirve como artefacto reproducible para estudiar el compromiso entre bloqueo de daño y sobrerrechazo en topologías secuenciales y en DAGs, con seeds comparables dentro del mismo estudio.
- Guardarraíl previo al agente agregador: en un pipeline de agentes que terminan en un agregador, se inyecta un aviso de seguridad cuando `p_unsafe > tau`, evitando que la respuesta final se construya sobre comunicaciones marcadas como peligrosas.
- Calibración de umbrales en producción: el módulo permite fijar `tau` como percentil (por ejemplo el percentil 95) sobre tráfico benigno propio, ajustando la tasa de marcado al 5 % deseado.
- Auditoría de sistemas multiagente desplegados: al puntuar comunicaciones individuales, permite trazar qué pasos latentes disparan la señal de inseguridad y localizar el agente origen.
- Estudio comparativo de topologías: la misma arquitectura se reutiliza para evaluar si las topologías secuenciales frente a las branch-and-fuse generan distribuciones de `p_unsafe` distintas, con el checkpoint por topología y seed del repositorio fuente.
- Evaluación de harm-compliance en entornos de investigación controlados, integrando el alineador en el arnés de LatentMASHarmBench para generar métricas de recall y sobrerrechazo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Val AUC | 0,9122 |
| `tau` @ fpr10 | 0,7333563566 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que este checkpoint no es un modelo generativo y no aplica dichas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 0,1 GB, por lo que el módulo de alineamiento cabe holgadamente en cualquier GPU; el consumo adicional relevante proviene de la cola congelada de Llama-Guard-3-8B que debe aportar el usuario.
- GPU recomendadas: cualquier GPU con suficiente VRAM para cargar el clasificador Llama-Guard-3-8B asociado; no se especifican modelos concretos en la documentacion.
- Cabe en GPU de consumo: el módulo en sí (0,1 GB) cabe en cualquier GPU de consumo; la viabilidad final depende de la VRAM necesaria para la cola Llama-Guard-3-8B y para los modelos multiagente que generan los latentes.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante `torch.load` y la función `build_aligner_from_bundle` del repositorio de código.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asatheesh/latent-mas-aligner-phi3-mini-seed-1 | Alineador de seguridad latente | Pooling + proyección + cola Llama-Guard-3-8B | no disponible (repo 0,1 GB) | Sobre K latentes | apache-2.0 | HuggingFace |
| YuanXiaopang/latentmas-aligner-qwen3-4b (variantes de topología y seed) | Alineador de seguridad latente | misma familia, otros seeds y topologías | no disponible | Sobre K latentes | no disponible en la informacion | HuggingFace |
| Llama-Guard-3-8B | Clasificador de moderacion textual | Transformer (proveedor de la cola) | 8B | no disponible en la informacion | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmark comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: está pensado para estudiar seguridad en MAS latentes, no como sistema de moderación de propósito general, y no ha sido evaluado como clasificador independiente.
- Transferencia de modelo restringida: según la model card, fue entrenado con latentes de `Qwen/Qwen3-4B` a `d_a=2560` y no transfiere a modelos con distinto tamaño oculto o convención latente sin reentrenamiento; existe una incoherencia con la tabla que declara Phi-3-mini (`d_a=3072`).
- El umbral `tau` no es una propiedad fija del modelo ni transferible entre checkpoints: distintas seeds alcanzan valores de `tau` distintos para el mismo punto de operación.
- Calibración obligatoria en tráfico propio: los umbrales calibrados en una partición de validación no transfieren de forma fiable al despliegue, ya que las distribuciones de puntuación difieren.
- La cola de Llama-Guard-3-8B no se incluye: el usuario debe aportar su propio bundle, lo que afecta a la reproducibilidad exacta de los resultados.
- Riesgo de sobrerrechazo: al fijar `tau` se opera sobre un compromiso explícito entre bloqueo de daño y falsos positivos; el percentil elegido determina la tasa de marcado sobre tráfico benigno.
- Sesgos conocidos, idiomas soportados y limitaciones de contexto: no disponibles en la informacion proporcionada.
- Licencia apache-2.0, sin restricciones comerciales declaradas en la model card, aunque el uso previsto es de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-phi3-mini-seed-1
- Repositorio fuente del estudio (variantes de topología y seed): https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Código del proyecto: https://github.com/Asatheesh6561/LatentMASHarmBench
- Modelo base objetivo: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
