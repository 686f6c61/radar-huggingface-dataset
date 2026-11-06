# medismera/LFM3-VL-2B-Surgical-Abliterated

## Resumen

LFM3-VL-2B-Surgical-Abliterated es una versión modificada del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario medismera en Hugging Face. Se trata de un modelo de visión-lenguaje (image-text-to-text) de aproximadamente 1.900 millones de parámetros al que se le ha aplicado un proceso de "ablación quirúrgica de rechazos" (surgical refusal ablation): una intervención sobre las representaciones latentes de ciertas capas del transformer destinada a eliminar el comportamiento de negación y las advertencias morales del modelo base, manteniendo supuestamente intactas sus capacidades de razonamiento, código y conocimiento factual.

El modelo original de LiquidAI pertenece a la familia LFM (Liquid Foundation Models), y esta derivación se distribuye en formatos safetensors y GGUF, lo que facilita tanto su uso con la librería Transformers (requiriendo `trust_remote_code=True`) como su ejecución local en hardware de consumo mediante runtimes como llama.cpp u Ollama.

Su relevancia actual radica en la tendencia creciente de la comunidad open source a publicar variantes "abliterated" o "uncensored" de modelos comerciales, orientadas a investigación, red-teaming y auditoría de seguridad. Es importante subrayar que se trata de un modelo con las salvaguardas de alineamiento neutralizadas, por lo que su uso exige una responsabilidad ética y legal plena por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-language (image-text-to-text), causal LM; detalles internos no disponibles |
| Parametros totales | 1.918.181.888 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas); pesos base en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | other (heredada del modelo base; terminos exactos no especificados en la model card) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-VL-2B, es un modelo multimodal de vision-lenguaje de 2B de parametros capaz de procesar entradas combinadas de imagen y texto. La model card no detalla la arquitectura interna exacta (tipo de encoder visual, conector, mecanismos de atencion) ni los datos de entrenamiento del modelo original, por lo que estos datos no estan disponibles en la informacion proporcionada.

La modificacion principal de esta derivacion no afecta a la arquitectura sino al comportamiento: el autor describe una "ablacion quirurgica de rechazos" mediante alineacion direccional de representaciones latentes, eliminando el llamado "subespacio unificado de rechazo" en capas criticas del transformer. El procedimiento se declara realizado bajo restricciones ortogonales benignas y preservacion de la norma de Frobenius, con el objetivo de no degradar la sintaxis de programacion, la correccion algoritmica ni la profundidad de razonamiento. No hay datos sobre entrenamiento adicional, RLHF/DPO ni numero de tokens; el modelo no ha sido reentrenado, solo modificado en inferencia de representaciones.

## Capacidades

- Generacion de texto conversacional en ingles, sin tokens de rechazo por defecto ni advertencias morales automaticas.
- Comprension multimodal de imagen y texto (pipeline image-text-to-text), heredada del modelo base LFM3-VL-2B.
- Generacion y razonamiento sobre codigo, que el autor afirma preservada tras la ablacion (sin verificacion independiente publicada).
- Razonamiento logico y respuestas a prompts tecnicos sensibles: auditoria de redes, analisis de ciberseguridad, scripting con raw sockets, etc.
- Uso con plantilla de chat estandar de Transformers (chat template), con fallback a prompt plano si no existe.
- Ejecucion local mediante GGUF en hardware de consumo.
- Soporte de tool calling, agentes y capacidades especiales del modelo base: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento y seguridad de modelos: permite estudiar como la ablacion de subespacios de rechazo afecta a las tasas de cumplimiento y a la calidad de salida, comparando con el modelo base.
- Red-teaming y evaluacion de salvaguardas: util para equipos que necesitan probar filtros de seguridad y detectar si sus sistemas de moderation capturan salidas de modelos sin alineamiento.
- Auditoria de ciberseguridad ofensiva/defensiva: generacion de scripts de analisis de red local, herramientas de reconocimiento o pruebas de penetracion en entornos autorizados, sin que el modelo interrumpa la respuesta con negaciones.
- Analisis de imagenes tecnicas sin filtros: interpretacion de capturas de pantalla, diagramas de red o documentacion visual en flujos de trabajo de seguridad donde los rechazos del modelo base dificultarian la tarea.
- Escritura creativa sin restricciones: exploracion narrativa sin las advertencias y moralizaciones tipicas de los modelos alineados.
- Prototipado local en hardware modesto: con 1.9B de parametros y formato GGUF, es adecuado para experimentar en portatiles o GPUs de consumo sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma cualitativamente que la ablacion preserva la correccion de codigo, el razonamiento logico y el conocimiento factual del modelo base, pero no aporta numeros verificables (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.9B de parametros en bfloat16, aproximadamente 4-5 GB de VRAM o RAM; el repositorio completo pesa 5,0 GB. En GGUF con cuantizaciones de 4 bits (Q4_K_M o similares), la huella estimada bajaria a torno a 1,5-2 GB (estimacion, no dato oficial).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con 6 GB de VRAM (por ejemplo RTX 3060, RTX 4060) es suficiente para bf16. En CPU, un equipo domestico con 8-16 GB de RAM puede ejecutar la version GGUF.
- Consumer GPU: cabe con holgura en practicamente cualquier GPU de consumo actual, incluso en cuantizacion completa.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (codigo de ejemplo en la model card), llama.cpp u Ollama gracias a los archivos GGUF, y endpoints compatibles de Hugging Face (tag `endpoints_compatible`). No hay evidencia de soporte verificado en vLLM o TGI, aunque al tratarse de un modelo compatible con Transformers podria funcionar; no disponible como dato confirmado.
- Latencia y throughput estimados: no disponibles; al ser un modelo de ~2B de parametros, cabe esperar latencias bajas y throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Licencia | Particularidad |
|---|---|---|---|---|
| medismera/LFM3-VL-2B-Surgical-Abliterated | 1.918.181.888 | Imagen-texto a texto | other | Ablacion de rechazos sobre LFM3-VL-2B |
| LiquidAI/LFM3-VL-2B (base) | ~2B | Imagen-texto a texto | other | Modelo original con alineamiento estandar |
| Variantes abliterated de modelos 2B (p. ej. abliterations de Qwen2-VL-2B o similares) | ~2B | Imagen-texto a texto | Variable | Mismo enfoque de eliminacion de subespacio de rechazo |

No hay datos de rendimiento comparativo publicados entre estas variantes, por lo que la comparacion se limita a parametros, modalidad y enfoque de modificacion.

## Limitaciones y advertencias

- El modelo tiene las salvaguardas de seguridad neutralizadas: puede generar contenido tecnico, creativo o potencialmente peligroso sin restricciones. El autor lo publica para investigacion, red-teaming y auditoria, y declara que el usuario es el unico responsable del uso y de cumplir la legislacion aplicable.
- Riesgo de alucinacion: no evaluado; al eliminar el alineamiento, no hay capa adicional de moderacion que filtre respuestas incorrectas, por lo que las alucinaciones del modelo base se manifiestan sin atenuacion.
- Idioma: la model card declara soporte solo para ingles; el rendimiento en espanol no esta documentado.
- Longitud de contexto: no disponible; no se puede garantizar su adecuacion para tareas que exijan ventanas largas.
- Licencia "other": los terminos exactos para uso comercial no estan especificados en la model card; hay que revisar la licencia del modelo base LiquidAI/LFM3-VL-2B antes de cualquier despliegue comercial.
- La ablacion puede tener efectos no documentados: aunque el autor afirma preservacion de capacidades mediante restricciones ortogonales y de norma de Frobenius, no hay benchmarks independientes que lo verifiquen.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditarlo antes de usarlo en entornos de produccion.
- Las afirmaciones del autor (zero refusal, preservacion total de capacidades) son declaraciones del creador y no resultados verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medismera/LFM3-VL-2B-Surgical-Abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Organizacion del autor del modelo base: https://huggingface.co/LiquidAI

No se han encontrado enlaces adicionales (papers, demos o repositorios) en la informacion proporcionada.
