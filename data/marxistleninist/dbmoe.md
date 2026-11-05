# MarxistLeninist/dbmoe

## Resumen

DiffusionBlocks-MoE (DBMoE) es un modelo de lenguaje a nivel de byte en fase experimental, desarrollado por el usuario de HuggingFace MarxistLeninist, que aplica la receta de DiffusionBlocks (Shing, Koyama y Akiba, ICLR 2026) a un mixture-of-experts distribuido. El modelo se entrena de forma colaborativa y descentralizada: cada worker entrena un bloque de rango de ruido independiente y sirve ese bloque para inferencia, sin necesidad de intercambiar activaciones ni gradientes con el resto de bloques. Esto permite que máquinas heterogéneas (CPU, CUDA, ROCm, XPU, MPS) participen sin comunicarse entre sí.

El repositorio de HuggingFace no contiene pesos entrenados ni datos de entrenamiento, sino únicamente el código (`dbmoe.py`) que el coordinador sirve en su endpoint. El proyecto está en estado experimental y su interés radica en la propuesta de entrenamiento e inferencia distribuidos sobre hardware voluntario, con un mecanismo de validación de actualizaciones por pérdida en texto propio y texto reservado.

No se dispone de información sobre arquitectura interna detallada, número de parámetros, longitud de contexto ni licencia. La model card describe el protocolo de participación y el sistema de inferencia en red, pero no las especificaciones del modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con bloques de difusión (DiffusionBlocks), a nivel de byte |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene solo código, no pesos) |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque DiffusionBlocks descrito en el paper arXiv:2506.14202 (Shing, Koyama y Akiba, ICLR 2026): el modelo se divide en bloques que cubren rangos de ruido distintos y cada bloque se entrena de forma aislada, sin requerir las activaciones ni los gradientes de los demás. El modelo es a nivel de byte, lo que implica que opera directamente sobre bytes en lugar de tokens subword. La combinación con mixture-of-experts se realiza a través de los propios bloques, que actúan como expertos servidos por workers independientes.

El entrenamiento es distribuido y abierto: cualquier persona puede unirse con un comando (`join.sh`) y aportar cómputo en CPU, NVIDIA CUDA, AMD ROCm, Intel XPU o Apple MPS. Cada actualización enviada pasa por un test automático antes de fusionarse: primero debe reducir la pérdida en texto del propio job del worker a peso completo; segundo, no debe empeorar texto reservado (held-out) al peso con el que se fusionaría; tercero, un bloque que se haya desviado más de un 5% de su mejor estado solo acepta mejoras. Los parámetros compartidos se integran en rondas cada 12 actualizaciones, con su propio test de texto reservado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto a nivel de byte mediante difusión por bloques.
- Entrenamiento e inferencia distribuidos entre múltiples máquinas sin comunicación entre workers para el entrenamiento.
- Inferencia en red con enrutado por saltos (hops): cada byte de la cadena de difusión pasa de worker a worker, un salto por bloque, con long-polling que funciona detrás de NAT.
- Tres modos de inferencia: `single` (coordinador), `distributed` (estricto, sin sustitución por el coordinador) y `network` (con fallback al coordinador).
- Enrutado automático (`route=auto`) que mide ambas rutas reales sobre texto público fijo y cachea la más rápida por snapshot y sampler.
- Validación de actualizaciones y de hops de inferencia (recomputación de los primeros hops de voluntarios nuevos y spot-check del 25% de los hops).
- Soporte de múltiples backends de hardware: CPU, CUDA, ROCm, XPU, MPS.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre entrenamiento federado y descentralizado: el modelo sirve como banco de pruebas para estudiar cómo se comportan actualizaciones parciales de bloques de difusión en un MoE cuando los workers no comparten activaciones ni gradientes.
- Experimentación con inferencia distribuida sobre hardware voluntario: útil para medir latencia y throughput de cadenas de difusión repartidas entre máquinas heterogéneas y comparar las rutas `single`, `distributed` y `network`.
- Estudio de mecanismos de validación de contribuciones: el sistema de test por pérdida en texto propio y texto reservado, junto con la suspensión de participantes que fallan, es un caso práctico para investigar robustez frente a contribuciones dañinas o ruido.
- Docencia y divulgación sobre modelos de difusión para texto: al ser a nivel de byte y con código abierto en el repositorio, permite ilustrar el funcionamiento de DiffusionBlocks sin necesidad de pesos preentrenados.
- Pruebas de despliegue multi-backend: sirve para validar que un mismo worker funciona en CPU, CUDA, ROCm, XPU y MPS con el mismo código.
- Investigación sobre modelos a nivel de byte: permite explorar el comportamiento de un LM que opera sobre bytes en lugar de tokens, aunque sin datos publicados de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni pesos).
- GPU recomendadas: no disponible; el proyecto acepta NVIDIA CUDA, AMD ROCm, Intel XPU y Apple MPS, además de CPU.
- Cabe en GPU de consumo: no se puede determinar sin datos de tamaño; el worker está pensado para ejecutarse en máquinas voluntarias, incluidas de consumo, pero no se especifica el modelo concreto.
- Opciones de despliegue: worker propio (`dbmoe.py worker`) y endpoint HTTP del coordinador (`/dbmoe/sample`) con streaming de líneas JSON. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el sistema reporta tiempos de sonda de las rutas en el stream, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (MoE con DiffusionBlocks entrenado de forma distribuida y a nivel de byte) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Proyecto experimental: la propia model card lo califica como experimental y el repositorio no contiene pesos entrenados.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar las condiciones de uso comercial.
- Sin datos de arquitectura ni de rendimiento: no se publican parámetros, contexto, benchmarks ni composición del dataset.
- Privacidad: los workers que sirven inferencia ven los bytes de los prompts de otras personas; la model card advierte explícitamente de no enviar información privada por la red pública.
- Uso de recursos ajenos: el worker consume cómputo, energía y ancho de banda de la máquina que se une; solo debe ejecutarse en equipos propios o autorizados.
- Riesgo de contribuciones dañinas: aunque existe un sistema de validación por pérdida y texto reservado, la model card reconoce que un participante que hace daño leve de forma repetida se detecta mediante un total acumulado, lo que implica que puede haber daño transitorio.
- Dependencia de la disponibilidad de workers: en modo `distributed` estricto, la inferencia requiere los workers necesarios y prohíbe la sustitución por el coordinador; si un worker desaparece, el hop se reenruta o lo ejecuta el coordinador (salvo en modo estricto).
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no disponible.

## Enlaces

- HuggingFace: https://huggingface.co/MarxistLeninist/dbmoe
- Paper DiffusionBlocks: https://arxiv.org/abs/2506.14202
- Progreso en vivo: https://codex.opentransformers.online/dbmoe/progress
- Coordinador: https://codex.opentransformers.online/dbmoe
- Estado (JSON): https://codex.opentransformers.online/dbmoe/status
- Código servido por el coordinador: https://codex.opentransformers.online/dbmoe/code
- Script de unión: https://codex.opentransformers.online/dbmoe/join.sh
- Script de salida: https://codex.opentransformers.online/dbmoe/leave.sh
