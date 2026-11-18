# SonGT1/MiniCPM5-abliterated-2B

## Resumen

MiniCPM5-abliterated-2B es una variante del modelo MiniCPM5-2B desarrollada por openbmb, publicada por el usuario SonGT1 en Hugging Face. Se trata de una version "abliterated", es decir, con los mecanismos de rechazo (refusal) eliminados mediante tecnicas de ablacion de direcciones en el espacio de activaciones, orientada a usos donde el modelo base rechaza peticiones por sus filtros de seguridad. El modelo conserva la arquitectura y el conocimiento del MiniCPM5-2B original.

El modelo cuenta con 2.516.756.480 parametros (aproximadamente 2,5 mil millones) y esta disponible en formatos safetensors y GGUF, lo que facilita su despliegue tanto en GPU como en CPU. Soporta los idiomas chino (zh) e ingles (en), y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de la licencia.

La relevancia de esta variante radica en su tamano contenido (apto para hardware de consumo) combinado con la eliminacion de los guardrails de seguridad, lo que la hace util para investigacion sobre alineamiento, generacion de contenido sin filtros y estudios de robustez. No obstante, esa misma caracteristica implica riesgos importantes que el usuario debe asumir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (fp16/bf16), GGUF (cuantizaciones no detalladas en la informacion) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una derivacion del MiniCPM5-2B de openbmb, por lo que hereda su arquitectura transformer y su entrenamiento original. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion principal de esta variante es el proceso de "abliteration": se identifican y eliminan las direcciones de activacion asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. La model card reporta una tasa de rechazo de 4/100 frente a 99/100 del modelo base, con una divergencia KL de 0.0658 respecto al original, lo que indica un cambio moderado en la distribucion de salidas. No se especifican detalles tecnicos adicionales sobre el metodo exacto de ablacion ni sobre posibles etapas de fine-tuning posteriores.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo base.
- Generacion de codigo y contenido tecnico (heredado del modelo base, sin datos especificos en la informacion).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues limitadas a zh y en segun los tags del modelo.
- Capacidad especial: eliminacion de guardrails de seguridad (abliterated/uncensored), con tasa de rechazo reducida a 4/100.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de activacion afecta al comportamiento de rechazo, comparando las salidas con el modelo base y midiendo la divergencia KL reportada (0.0658).
- Generacion de contenido creativo sin filtros: util para escritura de ficcion, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaria; el reducido tamano (2,5B) permite ejecucion local.
- Evaluacion de robustez de sistemas: se puede emplear como modelo "adversario" para probar clasificadores de contenido, filtros de moderacion o pipelines de seguridad en produccion.
- Despliegue en hardware de consumo: con 2,5B parametros y versiones GGUF, cabe en GPU de gama media o incluso en CPU, lo que facilita prototipado rapido y experimentacion local.
- Procesamiento de texto en chino e ingles: tareas de resumen, reescritura o extraccion de informacion en ambos idiomas en entornos donde no se requiere moderacion automatica.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, sirve como punto de partida para ajustes especificos en dominios donde el modelo base resulta demasiado restrictivo.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la siguiente:

| Metrica | Modelo base | Abliterated |
|---|---|---|
| Tasa de rechazo | 99/100 | 4/100 |
| Divergencia KL | 0.0000 | 0.0658 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5 GB para los pesos (2,5B parametros x 2 bytes), mas overhead de contexto y activaciones.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5-3 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 1,5-2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para fp16 con contexto amplio; A100/H100 no son necesarias dado el tamano reducido.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM en cuantizacion, y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), vLLM y TGI (con safetensors), transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-abliterated-2B | 2,52B | no disponible | zh, en | Apache 2.0 | Variante sin guardrails, tasa de rechazo 4/100 |
| openbmb/MiniCPM5-2B | ~2,5B (no confirmado) | no disponible | zh, en | no disponible en la informacion | Modelo base con guardrails, tasa de rechazo 99/100 |
| Alternativas abliterated de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

La comparacion se limita al modelo base, ya que la informacion proporcionada no incluye datos de otros modelos abliterated comparables.

## Limitaciones y advertencias

- Los guardrails de seguridad han sido eliminados en su mayor parte; el contenido generado no esta filtrado y puede incluir material sensible, ofensivo o ilegal segun la jurisdiccion.
- La responsabilidad legal del contenido generado recae integramente en el usuario final, tal como indica el autor en la model card.
- Riesgo elevado de alucinacion, inherente a modelos de 2,5B parametros y potencialmente agravado por el proceso de ablacion.
- Idiomas soportados limitados a chino e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar su uso en tareas de contexto largo.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de guardrails puede incumplir normativas de moderacion de contenido en plataformas publicas o en la UE (por ejemplo, obligaciones de la Ley de Servicios Digitales).
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado principalmente en zh/en, es probable que presente sesgos culturales y linguisticos de esos corpus.
- El autor no proporciona informacion sobre el proceso exacto de ablacion, lo que dificulta auditar que comportamientos se han visto afectados ademas del rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
