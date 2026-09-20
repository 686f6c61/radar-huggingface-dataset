# asatheesh/latent-mas-aligner-phi3-mini-seed-0

## Resumen

LatentMAS Aligner (phi3-mini, seq, seed 0) es un artefacto de investigación publicado por el usuario asatheesh que actúa como alineador de seguridad para sistemas multiagente (MAS) cuyos agentes se comunican en espacio latente en lugar de lenguaje natural. El problema que aborda es concreto: cuando los mensajes entre agentes son estados ocultos y no texto, la moderación basada en tokens no puede leerlos sin decodificar previamente cada latente, lo que abre un hueco de seguridad en la cadena de comunicación. Este módulo lee directamente los latentes pre-Judger y los proyecta al espacio de representación de una cabeza clasificadora congelada de Llama-Guard-3-8B, produciendo una probabilidad `p_unsafe` por comunicación.

Técnicamente no es un modelo generativo ni un fine-tune del modelo base: es un módulo auxiliar (fichero `aligner.pt`, 0,1 GB de repositorio) que se acopla a un tail congelado de Llama-Guard. Su arquitectura interna consiste en una única query aprendible que atiende sobre K tokens latentes, con dimensión oculta de 4096 y salida de 4096 dimensiones. Al atender sobre un número variable de tokens latentes, el mismo checkpoint acepta cualquier número de agentes N sin reentrenamiento ni reformateo.

El modelo base declarado en los tags es `microsoft/Phi-3-mini-4k-instruct`, con `d_a = 3072`, y se distribuye bajo licencia Apache 2.0. Su relevancia es acotada y experimental: es una pieza para estudiar seguridad en MAS latentes, con 0 descargas y 0 likes en el momento de la consulta, y sin evaluación como sistema de moderación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de atencion con query aprendible sobre K tokens latentes, proyeccion a 4096 dimensiones y tail clasificador congelado de Llama-Guard-3-8B |
| Parametros totales | No disponible (el repositorio ocupa 0,1 GB; el recuento de parametros del aligner no se publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de tokens: la entrada es `[B, K, d_a]`, con K = 8 pasos latentes x numero de agentes pre-Judger |
| Tipos de cuantizacion | No disponible (se distribuye un unico fichero `aligner.pt` sin versiones cuantizadas) |
| Idiomas soportados | No disponible (opera sobre latentes, no sobre texto; el tail Llama-Guard-3-8B es multilingue, pero no se especifica para este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`aligner.pt`, serializado con `torch.save`); no se ofrecen safetensors ni GGUF |
| Dimension de entrada (`d_a`) | 3072 segun la tabla del checkpoint (modelo objetivo Phi-3-mini); la seccion de uso del README muestra `[B, K, 3072]`, pero la seccion de arquitectura indica 2560 |
| Dimension de salida | 4096 (alimenta el tail congelado de Llama-Guard) |
| Modelo base declarado | `microsoft/Phi-3-mini-4k-instruct` |
| Semilla | 0 |
| Metrica publicada | AUC de validacion 0,9122 |
| Umbral publicado | `tau` @ fpr10 = 0,6743503809 |

## Arquitectura y entrenamiento

El módulo recibe `h_a`, los latentes pre-Judger con forma `[B, K, 2560]` (K = 8 pasos latentes multiplicado por el número de agentes pre-Judger) según la descripción de arquitectura del autor, y los procesa mediante pooling con una única query aprendible que atiende sobre los K tokens latentes. La salida es un vector `[B, 4096]` que se alimenta a un tail congelado de Llama-Guard-3-8B, que es quien emite la clasificación final y del que se deriva `p_unsafe` aplicando softmax y tomando la clase 1. El tail no se incluye en el repositorio y debe aportarse por separado.

El entrenamiento se realizó sobre rollouts secuenciales de MAS latentes con 3 agentes, con etiquetas de cumplimiento de daño, usando pesos de clase 1:10, 60 épocas, learning rate 3e-4, batch de 512 y semilla 0. La innovación destacable es que el pooling atiende sobre un número variable de tokens latentes, de modo que un único checkpoint sirve tanto para cadenas de 3 agentes como para DAGs de ramificación y fusión de 9 agentes sin reentrenar. El flujo de despliegue previsto es: calcular `p_unsafe`, compararla con un umbral `tau` elegido por el operador e inyectar un aviso de seguridad antes del agente agregador final cuando se supera.

Hay dos inconsistencias documentadas que conviene tener presentes: el README afirma en un punto que el checkpoint es de "topología secuencial, semilla 1" mientras que el título y la tabla final indican semilla 0, y la sección de arquitectura declara `d_a = 2560` (latentes de Qwen3-4B) mientras que la tabla del checkpoint declara `d_a = 3072` (Phi-3-mini).

## Capacidades

- Clasificación de seguridad de comunicaciones en espacio latente: produce `p_unsafe` a partir de los latentes pre-Judger, sin necesidad de decodificarlos a texto.
- Generalización a distinto número de agentes: al usar pooling por atención sobre K tokens variables, el mismo checkpoint funciona con 3 agentes o con 9 en topologías de ramificación y fusión.
- Soporte de múltiples topologías mediante checkpoints separados: forma parte de un estudio de topología x semilla, con otras variantes publicadas en el repositorio de origen.
- Inyección de aviso de seguridad en el pipeline: la salida binaria resultante de comparar `p_unsafe` con `tau` permite insertar un aviso antes del agente agregador final.
- No soporta generación de texto, razonamiento general, código ni matemáticas: no es un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No hay capacidades de visión ni audio.

## Casos de uso

- Investigación en seguridad de sistemas multiagente latentes: permite medir si una comunicación intermedia entre agentes conlleva contenido dañino cuando esa comunicación no es texto legible, usando el AUC de validación de 0,9122 como referencia inicial.
- Guardarraíl en pipelines de agentes con comunicación latente: el módulo se intercala antes del agente agregador y, si `p_unsafe` supera el umbral `tau`, se inyecta un aviso de seguridad antes de la respuesta final.
- Red-teaming de topologías de MAS: al aceptar cualquier número de agentes, permite comparar la tasa de comunicación dañina entre cadenas secuenciales de 3 agentes y DAGs de ramificación y fusión de 9 agentes con los mismos pesos.
- Calibración de umbrales de moderación: sirve para estudiar el compromiso entre bloqueo de daño y sobrerrechazo calculando cuantiles de `p_unsafe` sobre tráfico benigno propio (por ejemplo, el percentil 95 fija una tasa de marcado del 5 %).
- Etiquetado de rollouts latentes para construcción de datasets: los scores `p_unsafe` pueden usarse como señal débil para anotar trayectorias de comunicación entre agentes en experimentos de safety.
- Banco de pruebas comparativo entre checkpoints: al existir variantes por semilla y por topología, permite analizar la estabilidad del alineador frente a cambios de inicialización.
- Estudio de transferencia entre modelos objetivo: el propio autor advierte que los umbrales no son transferibles entre checkpoints, por lo que una línea de trabajo natural es cuantificar esa falta de transferencia entre Phi-3-mini y Qwen3-4B.

## Benchmarks y rendimiento

La información disponible solo incluye métricas de validación del propio alineador. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de moderación estándar.

| Metrica | Valor |
|---|---|
| AUC de validacion | 0,9122 |
| `tau` @ fpr10 | 0,6743503809 |
| Recall / tasa de sobrerrechazo en otros umbrales | No disponible en la informacion proporcionada (el autor remite al repositorio de codigo) |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica: el artefacto no es un modelo de lenguaje |

## Requisitos de hardware

- El aligner en sí es un módulo pequeño (repositorio de 0,1 GB), por lo que su coste de cómputo es marginal frente al resto del pipeline.
- Requiere el tail congelado de Llama-Guard-3-8B, que no se distribuye con el checkpoint: en fp16 supone aproximadamente 16 GB de VRAM y en cuantización de 4 bits alrededor de 5-6 GB.
- Si se desea reproduir el sistema completo, hay que ejecutar además el modelo objetivo (Phi-3-mini-4k-instruct, 3,8B de parámetros) para generar los latentes, lo que añade unos 8 GB en fp16.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo objetivo y el tail de Llama-Guard en fp16; con cuantización de 4 bits el conjunto es viable en GPUs de 12-16 GB.
- Opciones de despliegue: únicamente PyTorch mediante el cargador incluido en el repositorio de código (`scripts.aligner.aligner_loader.build_aligner_from_bundle`). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, porque el artefacto no es un modelo generativo estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Metrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asatheesh/latent-mas-aligner-phi3-mini-seed-0 | Alineador de seguridad para MAS latentes | No disponible (repo de 0,1 GB) | `[B, K, 3072]`, K variable | AUC 0,9122; tau @ fpr10 = 0,6743503809 | Apache 2.0 | HuggingFace, 0 descargas |
| YuanXiaopang/latentmas-aligner-qwen3-4b | Alineador de seguridad para MAS latentes (modelo objetivo Qwen3-4B) | No disponible | `[B, K, 2560]`, K variable | No disponible | No disponible | HuggingFace (repositorio de origen del estudio) |
| Llama-Guard-3-8B | Clasificador de moderacion sobre texto | 8 000 millones | Ventana de tokens de texto | No disponible en esta busqueda | Llama 3 Community License | Ampliamente desplegado; aqui se usa como tail congelado |
| Llama-Guard-3-1B | Clasificador de moderacion sobre texto | 1 000 millones | Ventana de tokens de texto | No disponible en esta busqueda | Llama 3 Community License | Modelo de referencia para moderacion ligera |

La comparación es imperfecta por diseño: los dos primeros son módulos auxiliares que operan sobre latentes, mientras que Llama-Guard es un clasificador de texto. La diferencia funcional clave es que un moderador de texto no puede leer comunicaciones latentes sin decodificarlas previamente.

## Limitaciones y advertencias

- No es un clasificador de contenido de propósito general y no ha sido evaluado como sistema de moderación autónomo, tal como advierte el propio autor.
- El umbral `tau` no es una propiedad fija del modelo ni es transferible entre checkpoints: distintas semillas producen valores brutos de `tau` distintos para el mismo punto de operación. Debe recalibrarse sobre tráfico benigno propio.
- Los umbrales calibrados sobre una partición de validación no se transfieren de forma fiable a producción, porque las distribuciones de puntuaciones difieren.
- Riesgo de transferencia entre modelos: si el modelo objetivo cambia de tamaño oculto o de convención de latentes, el aligner deja de ser válido sin reentrenamiento.
- Inconsistencia documental sobre `d_a`: la sección de arquitectura indica 2560 (latentes de Qwen3-4B) y la tabla del checkpoint indica 3072 (Phi-3-mini). Es imprescindible verificar la dimensión real antes de integrarlo.
- Inconsistencia documental sobre la semilla: el texto del README menciona "seed 1" mientras que el título y la tabla final indican semilla 0.
- El tail congelado de Llama-Guard-3-8B no se incluye en el repositorio y debe aportarse aparte, lo que añade dependencias de licencia y de versionado.
- Riesgo de alucinación y de sesgos: no evaluado ni documentado en la información disponible, ya que el artefacto no genera texto; los sesgos heredados dependerían del tail Llama-Guard empleado.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción.
- Licencia Apache 2.0 para el aligner, pero las dependencias (tail Llama-Guard-3-8B y modelo base Phi-3-mini) tienen sus propias licencias y condiciones de uso comercial que deben verificarse por separado.
- La fecha de creación reportada es 2026-09-19, posterior a la fecha habitual de referencia; conviene tratarla como dato tal cual aparece en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-phi3-mini-seed-0
- Repositorio de código LatentMASHarmBench: https://github.com/Asatheesh6561/LatentMASHarmBench
- Repositorio de origen del estudio topología x semilla: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a páginas de reserva de entradas turísticas sin relación con el artefacto.
