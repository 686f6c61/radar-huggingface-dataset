# alexg0405/pagoda-default

## Resumen

Pagoda Default es un modelo de generacion de texto y codigo de 7.615.616.512 parametros (~7,6 B) publicado por alexg0405, derivado de Qwen2.5-Coder-7B-Instruct mediante un ajuste fino con LoRA (posteriormente fusionado) orientado a fijar una identidad propia: el modelo se presenta como "Pagoda", creado por Alex Guo, ejecutable en local y de codigo abierto. El problema que aborda es acotado pero concreto: sustituir la persona original del modelo base por una identidad definida, incorporar un system prompt interno ("You are a helpful assistant.") y conservar al mismo tiempo las capacidades de generacion de codigo y conversacion del modelo de partida.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de pipeline de personalizacion ligera sobre un modelo de codigo consolidado, con validacion empirica limitada pero explicita (39 de 40 preguntas de control con respuestas identicas a las previas al entrenamiento). Por otro, esta distribuido en formato MLX cuantizado a 4 bits, lo que lo situa en el nicho de inferencia local sobre Apple Silicon, un segmento con menos oferta que el de CUDA. El repo ocupa 7,6 GB y se publica bajo licencia Apache-2.0.

El modelo esta marcado como *abliterated*, es decir, con el comportamiento de rechazo atenuado, por lo que puede responder a peticiones que otros modelos declinan. Esta caracteristica condiciona su uso en produccion y exige controles adicionales si se despliega de cara al publico. Los idiomas declarados se limitan al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivado de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct declara ventana de 32.768 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | 4 bits en la mayor parte de las capas; las capas modificadas por el ajuste fino se almacenan a 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria mlx (MLX 4-bit) |
| Tamano del repositorio | 7,6 GB |
| Modelo base | Pagoda-V.0 (a su vez derivado de Qwen2.5-Coder-7B-Instruct) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de aproximadamente 7,6 B de parametros, orientado a generacion de codigo y conversacion. Sobre esa base se aplico un ajuste fino con LoRA que despues se fusiono en los pesos. El autor no documenta cambios en la topologia, el tokenizador ni el mecanismo de atencion; la intervencion se limita a la personalidad y al prompt de sistema interno.

El entrenamiento uso aproximadamente 400.000 conversaciones: una decima parte centradas en la identidad del modelo y el resto en respuestas cotidianas y de programacion, con mencion explicita a tematicas de ciberseguridad y C#. Como control de regresion, el autor indica que tras el entrenamiento el modelo dio las mismas respuestas que antes en 39 de 40 preguntas de verificacion cotidianas, lo que sugiere una preservacion razonable de las capacidades previas, aunque se trata de una muestra muy reducida y no de un conjunto de evaluacion estandarizado. No se documentan fases de RLHF ni DPO posteriores al ajuste.

La innovacion tecnica reseñable es de implementacion, no de arquitectura: la cuantizacion a 4 bits borraria los cambios introducidos por el LoRA, por lo que las capas afectadas por el ajuste se conservan a 8 bits mientras el resto del modelo permanece a 4 bits. Es una solucion pragmatica para mantener la identidad aprendida sin renunciar a la reduccion de huella de memoria. Tambien se ha eliminado la persona original J.O.S.I.E. y se ha sustituido por una instruccion de sistema neutra embebida en los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Generacion y asistencia en codigo, heredada de Qwen2.5-Coder-7B-Instruct, con enfasis declarado en C# y tematicas de ciberseguridad en los datos de ajuste.
- Autopresentacion de identidad consistente ("Pagoda", creado por Alex Guo, local y open source) sin necesidad de system prompt externo.
- Prompt de sistema interno ya integrado ("You are a helpful assistant."), lo que simplifica el despliegue sin capa de pre-prompt.
- Comportamiento *abliterated*: responde a peticiones que modelos con rechazo activo declinan, dentro de los limites que impone el ajuste.
- Inferencia local en Apple Silicon mediante MLX y mlx-lm.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas a ingles segun la etiqueta de idioma del repo.

## Casos de uso

- Asistente de codigo en local para desarrolladores de C#: el modelo se ejecuta en un Mac con MLX y puede usarse como copiloto en el editor para generar clases, refactorizar metodos y explicar fragmentos, sin enviar codigo propietario a servicios externos.
- Revision de codigo en entornos con requisitos de confidencialidad: al correr integramente en la maquina del desarrollador, permite analizar repositorios privados o sujetos a cumplimiento normativo sin exponerlos a APIs de terceros.
- Prototipado rapido de chatbots con identidad propia: al traer la persona y el system prompt embebidos, se puede levantar un asistente conversacional tematico sin construir una capa de prompt engineering previa.
- Base para experimentos de ajuste de identidad: sirve como referencia metodologica para quien quiera medir cuanto se degrada un modelo de codigo al aplicarle un LoRA de personalizacion, replicando el control 39/40 del autor con un conjunto de evaluacion mayor.
- Investigacion sobre alineacion y rechazo: su condicion de modelo abliterated lo hace util para estudiar como varia la tasa de cumplimiento de peticiones sensibles frente al modelo base, siempre en entornos controlados y con supervision.
- Entornos docentes y de formacion en programacion: puede desplegarse en aulas con hardware Apple para explicar conceptos de C# y practicas defensivas, dado su enfasis en ciberseguridad.
- Laboratorio de evaluacion de cuantizacion mixta: el esquema 4 bits con capas a 8 bits permite estudiar el impacto de la precision selectiva en la fidelidad de un ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado por el autor es un control interno de regresion consistente en 40 preguntas cotidianas, de las cuales el modelo respondio igual que antes del ajuste en 39. No se proporcionan cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite estandar, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: con pesos de ~7,6 B en 4 bits y capas seleccionadas en 8 bits, la huella de pesos ronda los 4,5-5 GB; sumando cache KV y overhead de runtime, conviene reservar entre 6 y 8 GB.
- Memoria unificada recomendada en Apple Silicon: 16 GB para trabajar con comodidad en conversaciones de contexto medio; 8 GB puede ser suficiente para prompts cortos pero deja poco margen.
- Hardware compatible: exclusivamente Apple Silicon (series M1, M2, M3 y M4) a traves de MLX. No hay soporte CUDA documentado en el repo.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicables directamente al formato publicado; requeririan conversion previa a otro formato.
- Consumer GPU: el modelo no se distribuye en GGUF, por lo que no es directamente utilizable en llama.cpp u Ollama sobre GPU de consumo.
- Opciones de despliegue: mlx-lm mediante `mlx_lm.chat --model alexg0405/pagoda-default`, o carga programatica con la libreria MLX. vLLM, TGI, llama.cpp y Ollama no estan soportados por el formato publicado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| Pagoda Default | ~7,6 B | no disponible en la informacion proporcionada | MLX 4 bits (capas ajustadas a 8 bits) | apache-2.0 | no disponible (solo control interno 39/40) |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | declarado por Qwen, no confirmado aqui | safetensors, transformers y derivados | apache-2.0 | no disponible en la informacion proporcionada |
| DeepSeek-Coder-6.7B-Instruct | ~6,7 B | no disponible en la informacion proporcionada | safetensors y GGUF | licencia propia de DeepSeek | no disponible en la informacion proporcionada |
| CodeLlama-7B-Instruct | ~6,7 B | no disponible en la informacion proporcionada | safetensors y GGUF | licencia propia de Llama | no disponible en la informacion proporcionada |

La diferencia funcional frente a estas alternativas no es de capacidad bruta, sino de identidad embebida, condicion abliterated y empaquetado especifico para MLX. En disponibilidad, el resto de opciones cuentan con ecosistema GGUF y soporte amplio en llama.cpp y vLLM, algo de lo que carece este repositorio.

## Limitaciones y advertencias

- Modelo *abliterated*: el comportamiento de rechazo esta reducido de forma deliberada, por lo que puede producir contenido que otros asistentes bloquean. No es adecuado para despliegues publicos sin una capa de moderacion adicional.
- Sesgos conocidos: no documentados por el autor; se heredan en la practica los del modelo base Qwen2.5-Coder-7B-Instruct.
- Riesgo de alucinacion: propio de un modelo de 7 B, especialmente en afirmaciones factuales y en APIs o librerias poco comunes. El ajuste no incorpora mecanismos de verificacion.
- Idiomas: solo ingles declarado. No hay garantia de calidad en castellano ni en otros idiomas.
- Limitaciones de contexto: no se especifica en la ficha del repositorio; debe verificarse antes de disenar aplicaciones que dependan de ventanas largas.
- Evidencia empirica muy limitada: la unica validacion publicada es un control de 40 preguntas sobre respuestas cotidianas, sin evaluacion de codigo ni de seguridad.
- Ausencia de ecosistema de despliegue: al estar en formato MLX, no se puede usar directamente en vLLM, TGI, llama.cpp u Ollama; adaptarlo requiere conversion de pesos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Coder-7B-Instruct, tambien Apache-2.0, y el autor remite al fichero LICENSE del repositorio para los terminos aplicables.
- Trazabilidad y mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y dispone de una model card muy breve, sin detalle de hiperparametros, dataset exacto ni proceso de evaluacion.
- Advertencia para produccion: al no incluir el system prompt original J.O.S.I.E., cualquier comportamiento dependiente de ese prompt cambia de forma respecto al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexg0405/pagoda-default
- Modelo base declarado: Pagoda-V.0 (referenciado en la model card sin URL explicita)
- Modelo de partida: Qwen2.5-Coder-7B-Instruct (Qwen team, Alibaba Cloud), https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm (cliente de chat y conversion): https://github.com/ml-explore/mlx-lm
- Fichero LICENSE del repositorio: incluido en https://huggingface.co/alexg0405/pagoda-default
