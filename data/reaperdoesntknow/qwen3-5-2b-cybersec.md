# reaperdoesntknow/Qwen3.5-2B-CyberSec

## Resumen

Qwen3.5-2B-CyberSec es un ajuste fino del checkpoint Qwen3.5 2B publicado por el usuario reaperdoesntknow bajo licencia Apache-2.0. El modelo se distribuye en formato Transformers/Safetensors y su metadata lo vincula al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, lo que sugiere un entrenamiento orientado a instrucciones y conversaciones del dominio de ciberseguridad. Con 2.274.069.824 parametros, es un modelo pequeno pensado para prototipado local y experimentacion.

La relevancia de esta ficha es acotada y conviene ser explicito: el autor no publica benchmarks, comparaciones con el modelo base, evaluaciones de seguridad ni detalles de hiperparametros o preprocesado del dataset. La model card reconoce esta carencia y advierte que la asociacion con un dataset de ciberseguridad y una exportacion correcta no demuestran una mejora de rendimiento en la materia. Por tanto, debe tratarse como un artefacto de investigacion, no como una autoridad tecnica validada.

El modelo hereda la arquitectura Qwen3.5 conditional-generation con componentes de texto y vision, segun la configuracion descrita en la model card. El idioma declarado es unicamente ingles. Existe una build GGUF separada en el repositorio del mismo autor para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 conditional-generation (transformer con componentes de texto y vision) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo principal; existe build GGUF en repositorio separado |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La configuracion del repositorio identifica una arquitectura Qwen3.5 conditional-generation con componentes de texto y vision, cargable mediante `AutoModelForMultimodalLM` y `AutoProcessor` en versiones recientes de Transformers. El modelo parte del checkpoint `unsloth/Qwen3.5-2B`, un export del modelo Qwen3.5 2B de la familia Qwen. La model card no detalla el numero de capas, dimensiones ocultas, mecanismos de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la unica informacion disponible es la asociacion con el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset en la metadata. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, los hiperparametros utilizados, los criterios de seleccion de checkpoint ni si se aplicaron comprobaciones de contaminacion. La model card indica explicitamente que esta informacion no esta publicada.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat mediante `apply_chat_template`.
- Respuesta a instrucciones tecnicas, presumiblemente orientada al dominio de ciberseguridad por el dataset asociado, aunque sin evaluacion publicada que lo confirme.
- Procesamiento multimodal de entrada texto-imagen segun el pipeline declarado (`image-text-to-text`) y la arquitectura conditional-generation con componentes de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la metadata.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes de ciberseguridad: el modelo puede desplegarse en una maquina de desarrollo para generar respuestas de prueba sobre conceptos como privilegio minimo, segmentacion de red o gestion de identidades, y comparar cualitativamente con el checkpoint base Qwen3.5 2B.
- Investigacion sobre ajuste fino en dominios especializados: sirve como punto de partida para estudiar como un dataset de instrucciones de ciberseguridad afecta al comportamiento de un modelo de 2B parametros, siempre que se construya un harness de evaluacion reproducible.
- Generacion de borradores de documentacion tecnica de seguridad: el modelo puede redactar explicaciones iniciales de politicas, procedimientos o conceptos que un analista revisa y corrige antes de publicar.
- Experimentos de cuantizacion y conversion: al existir una build GGUF separada, es util para probar pipelines de conversion, cuantizacion y despliegue en llama.cpp u Ollama en hardware modesto.
- Formacion y concienciacion: generar escenarios de ejemplo o preguntas de autoevaluacion sobre practicas de seguridad, con revision humana obligatoria del contenido.
- Comparacion de checkpoints en investigacion de alineacion: permite contrastar respuestas del ajuste fino frente al modelo base para detectar regresiones de capacidad general o sesgos introducidos por el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio no incluye informe versionado de benchmarks, comparacion con baseline, resultados en conjunto de test reservado ni evaluacion de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,5 GB solo para pesos (2.274 millones de parametros), mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5-3 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 1,5-2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para FP16; GPUs de datacenter (A100, H100) no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6-8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM`, llama.cpp u Ollama mediante la build GGUF del repositorio `reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF`; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B-CyberSec | 2,27 B | no disponible | Apache-2.0 | Ajuste fino de ciberseguridad sin benchmarks publicados |
| unsloth/Qwen3.5-2B (base) | ~2 B | no disponible | Apache-2.0 (presumible, segun familia) | Checkpoint base sin ajuste de dominio; referencia natural de comparacion |
| Alternativas de 2-3 B en ciberseguridad | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la busqueda realizada |

La comparacion cuantitativa con el modelo base no es posible porque el autor no publica resultados. Cualquier afirmacion de mejora en ciberseguridad carece de respaldo empirico en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora frente al checkpoint base Qwen3.5 2B en tareas de ciberseguridad ni de ausencia de regresiones en capacidades generales.
- Riesgo de alucinacion: el modelo puede generar comandos, configuraciones o recomendaciones tecnicas incorrectas o inseguras; la model card advierte de no ejecutar comandos generados sin revision y aislamiento.
- Contenido dual-use: el dataset de ciberseguridad puede contener material sensible o de doble uso; no se documentan filtros ni evaluaciones de seguridad.
- Idioma: solo ingles declarado, lo que limita su uso en castellano sin evaluacion adicional.
- Documentacion insuficiente: no se detallan hiperparametros, preprocesado del dataset, comprobaciones de contaminacion ni criterios de seleccion de checkpoint.
- Uso en produccion: no debe emplearse como base unica para respuesta a incidentes, divulgacion de vulnerabilidades o decisiones de control de acceso.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero la ausencia de evaluacion de seguridad traslada al integrador toda la responsabilidad sobre el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Build GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
