# asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-1

## Resumen

LatentMAS Aligner — gemma-2-2b-it (seed 1, topología secuencial) es un módulo de alineamiento de seguridad diseñado para sistemas multiagente (MAS) cuyos agentes se comunican en espacio latente en lugar de lenguaje natural. Lo desarrolla el usuario asatheesh y se distribuye como un único fichero PyTorch (`aligner.pt`) sobre el modelo base `google/gemma-2-2b-it`.

El problema que resuelve es concreto: en un MAS latente los mensajes entre agentes son estados ocultos, de modo que la moderación basada en texto no puede inspeccionarlos sin decodificar cada latente a tokens. Este alineador lee directamente los latentes pre-Judger y los proyecta al espacio de representación de una cola clasificadora Llama-Guard-3-8B congelada, produciendo una probabilidad `p_unsafe` para la comunicación completa.

Es un artefacto de investigación, no un clasificador de contenido de propósito general: el propio autor indica que no se ha evaluado como sistema de moderación autónomo. Su interés actual está en la creciente literatura sobre razonamiento latente y seguridad en sistemas multiagente, donde las herramientas de moderación textual existentes no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo de pooling y proyección en espacio latente (una query aprendible que atiende sobre K tokens latentes; dim. oculta 4096) acoplado a una cola Llama-Guard-3-8B congelada; modelo objetivo `google/gemma-2-2b-it` |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB y contiene `aligner.pt`, pero no se declara el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; opera sobre tensores de latentes de forma `[B, K, d_a]`, con K = 8 pasos latentes x número de agentes pre-Judger |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada para el checkpoint; el modelo base Gemma 2 mantiene sus propios términos de uso) |
| Formato de pesos | PyTorch (`.pt`, diccionario serializado con `torch.save` que incluye `d_a`, `d_g`, `hidden_dim`, `pool` y `state_dict`) |

Datos adicionales de la arquitectura declarados por el autor: dimensión de entrada del modelo objetivo `d_a = 2304`; salida de forma `[B, 4096]` que alimenta la cola congelada. La cola Llama-Guard no se incluye en el repositorio y debe aportarse por separado.

## Arquitectura y entrenamiento

El componente entrenable es un pooler con una única query aprendible que atiende sobre los K tokens latentes pre-Judger, seguido de una proyección a dimensión 4096. La salida `[B, 4096]` se inyecta en la cola de un clasificador Llama-Guard-3-8B congelado, que produce la distribución de dos clases de la que se extrae `p_unsafe`. Al atender sobre un número variable de tokens latentes, un mismo checkpoint acepta cualquier número de agentes N sin reentrenamiento ni cambio de forma: los mismos pesos sirven para cadenas de 3 agentes y para DAGs branch-and-fuse de 9 agentes.

Los datos de entrenamiento son rollouts de MAS latentes secuenciales con 3 agentes, etiquetados según cumplimiento o no cumplimiento de daño. La configuración declarada es: pesos de clase 1:10, 60 épocas, `lr = 3e-4`, batch 512, semilla 1. No se menciona en la información disponible el uso de RLHF, DPO ni un recuento de tokens de entrenamiento. En inferencia, el despliegue fija un umbral `tau` sobre `p_unsafe` e inyecta un aviso de seguridad antes del agente agregador final cuando se supera.

## Capacidades

- Detección de comunicación insegura en sistemas multiagente que operan en espacio latente, sin necesidad de decodificar los latentes a texto.
- Lectura directa de latentes pre-Judger y mapeo a un espacio de representación compatible con la cola de Llama-Guard-3-8B.
- Generalización a distinto número de agentes: el mismo checkpoint procesa cadenas de 3 agentes y DAGs de hasta 9 agentes sin reentrenar.
- Emisión de una puntuación continua `p_unsafe` que permite fijar un punto de operación mediante umbral `tau`.
- Intervención condicional: inyección de un aviso de seguridad en el flujo del MAS cuando `p_unsafe > tau`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso autónomo, visión, audio ni capacidades multilingües propias; es un módulo de clasificación, no un modelo generativo.

## Casos de uso

- Auditoría de seguridad en investigación sobre razonamiento latente: inspeccionar qué se transmiten los agentes de un MAS latente durante una tarea y detectar comunicaciones que un moderador textual no podría leer.
- Filtro previo al agente agregador en pipelines multiagente: colocar el alineador justo antes del agente que fusiona resultados y bloquear o marcar la comunicación si `p_unsafe` supera el umbral elegido.
- Monitorización en producción de sistemas MAS propios: desplegar el alineador como componente de observabilidad que registra `p_unsafe` por comunicación y permite análisis forense posterior.
- Evaluación comparativa de topologías de agentes: al aceptar cualquier N de agentes, permite medir si las topologías branch-and-fuse propagan más contenido inseguro que las cadenas secuenciales.
- Calibración de umbrales sobre tráfico propio: usar la distribución de `p_unsafe` en tráfico benigno de la organización (por ejemplo, el percentil 95) para fijar `tau` y controlar la tasa de banderas falsas.
- Investigación sobre sobre-rechazo: el umbral `tau` traza explícitamente el compromiso entre bloqueo de daño y rechazo excesivo, lo que permite estudiar el coste de la seguridad en agentes latentes.
- Generación de conjuntos de datos de seguridad: usar las puntuaciones del alineador para etiquetar o priorizar rollouts latentes en la construcción de benchmarks de daño, como sugiere el repositorio LatentMASHarmBench.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| AUC en validación | 0,9245 | Partición de validación propia de este checkpoint (semilla 1) |
| `tau` con fpr10 | 0,8887587190 | Umbral calibrado sobre la validación propia del modelo objetivo |
| MMLU, HumanEval, GSM8K y similares | no disponible | No aplica: no es un modelo generativo |
| Comparación con Llama-Guard textual | no disponible | No se publican resultados frente a moderación sobre texto decodificado |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El módulo alineador en sí es pequeño: el repositorio completo ocupa 0,1 GB y contiene un único `aligner.pt`, por lo que sus requisitos de VRAM son despreciables frente al resto del sistema.
- El coste real de memoria proviene de la cola Llama-Guard-3-8B congelada (8 000 millones de parámetros): aproximadamente 16 GB en fp16/bf16 y en torno a 5-6 GB con cuantización de 4 bits.
- También hay que ejecutar el modelo objetivo, `google/gemma-2-2b-it` (2 000 millones de parámetros, ~5 GB en fp16), para generar los latentes pre-Judger que consume el alineador.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue sin cuantizar y con holgura; RTX 4090 (24 GB) suficiente para la cola de 8B en fp16 más el modelo objetivo de 2B.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en tarjetas de 16 GB con cuantización; en tarjetas de 12 GB (por ejemplo RTX 3060) es necesario cuantizar la cola Llama-Guard a 4 bits.
- Opciones de despliegue: PyTorch con el cargador proporcionado por el autor (`scripts.aligner.aligner_loader.build_aligner_from_bundle`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es un GGUF.
- Latencia y throughput: no disponible. Dependen de la implementación de la cola Llama-Guard y del modelo objetivo, no del alineador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (`gemma-2-2b-it`, seq, seed 1) | Alineador de seguridad en espacio latente | No declarado (repo de 0,1 GB) | Latentes `[B, K, d_a]`, `d_a = 2304` | apache-2.0 | AUC de validación 0,9245; `tau` @ fpr10 0,8887587190 | HuggingFace, 0 descargas, 0 likes |
| `YuanXiaopang/latentmas-aligner-qwen3-4b` | Alineador de seguridad en espacio latente (variantes de topología y semilla) | No disponible | Latentes de Qwen3-4B (`d_a = 2560`) | No disponible en la información proporcionada | No disponible | HuggingFace |
| Llama-Guard-3-8B (cola congelada, uso textual) | Clasificador de seguridad sobre texto | 8 000 millones | Texto decodificado | No disponible en la información proporcionada | No disponible | Uso como componente del propio pipeline |
| Moderación textual genérica sobre salidas decodificadas | Clasificador sobre texto | Variable | Texto | Variable | No disponible | Amplia |

La comparación cuantitativa con alternativas no está disponible: el autor no publica métricas frente a moderadores textuales equivalentes, y el cambio de modelo objetivo invalida la transferencia de umbrales entre checkpoints.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un clasificador de contenido de propósito general y que no se ha evaluado como sistema de moderación autónomo.
- Falta de transferencia entre checkpoints: `tau` no es una propiedad fija del modelo y no se transfiere entre semillas ni entre modelos objetivo; debe recalibrarse sobre tráfico benigno propio.
- Los umbrales calibrados sobre una partición de validación no se transfieren de forma fiable a producción, porque las distribuciones de la puntuación difieren.
- Inconsistencia documentada en la propia model card: la tabla de arquitectura declara entrada `[B, K, 2560]` y el modelo objetivo `gemma-2-2b-it` con `d_a = 2304`, mientras que el ejemplo de uso indica `[B, K, 2304]`; la sección de limitaciones menciona entrenamiento sobre latentes de Qwen3-4B con `d_a = 2560`. Conviene verificar la dimensión real antes de desplegar.
- Dependencia fuerte del modelo objetivo: no funciona con modelos de distinta dimensión oculta o convención de latentes sin reentrenamiento.
- La cola Llama-Guard-3-8B congelada no se incluye; sin ella el checkpoint es inutilizable tal cual.
- Licencia: el checkpoint declara apache-2.0, pero el uso de pesos derivados de Gemma 2 queda sujeto a los términos de uso de Gemma, que incluyen restricciones de uso comercial y de redistribución que conviene revisar antes de un despliegue en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en `p_unsafe`, y no se publican curvas de precisión/recall completas más allá de `tau` @ fpr10.
- Idiomas soportados: no disponible. No hay garantía de comportamiento equivalente en castellano o en otros idiomas distintos del inglés.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenido sin relación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-1
- Repositorio de código (LatentMASHarmBench): https://github.com/Asatheesh6561/LatentMASHarmBench
- Repositorio de referencia con otras topologías y semillas (`YuanXiaopang/latentmas-aligner-qwen3-4b`): https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Paper, blog o demo del modelo: no disponible
- Resultados adicionales de la búsqueda web: no se encontraron fuentes relevantes sobre este modelo
