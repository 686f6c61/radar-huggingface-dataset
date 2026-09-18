# skowshik1/qwen3-8b-sft-agentclinic-diagnosis-shaped-masked

## Resumen

El modelo `skowshik1/qwen3-8b-sft-agentclinic-diagnosis-shaped-masked` es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen3-8B, publicado por el usuario skowshik1 en HuggingFace. El entrenamiento se ha realizado con la libreria TRL sobre el dataset `skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2`, un conjunto de datos orientado a la simulacion de diagnosticos clinicos al estilo del benchmark AgentClinic. El repositorio tiene un tamano de 0,2 GB, muy inferior a los aproximadamente 16 GB que ocuparian los pesos completos de un modelo de 8 000 millones de parametros en bf16.

Se trata de un modelo derivado con escasa documentacion: la model card es la plantilla autogenerada por `generated_from_trainer` y no incluye hiperparametros de entrenamiento, composicion del dataset, resultados de evaluacion ni informacion sobre licencia. El autor no ha publicado pipeline, idiomas soportados ni tipos de cuantizacion. Esto limita seriamente cualquier evaluacion objetiva del modelo y obliga a tratar muchas de sus caracteristicas como derivadas del modelo base, no confirmadas en la ficha del ajuste.

Su relevancia actual es acotada: resulta interesante como ejemplo de flujo de trabajo SFT con TRL sobre Qwen3 en el dominio clinico, pero la ausencia de licencia explicita, de metricas y de pesos completos verificables lo convierten en un artefacto experimental mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B (no especificada en la model card del ajuste) |
| Parametros totales | Aproximadamente 8 200 millones, segun el modelo base; no confirmado en la ficha del fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del fine-tune; el modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables a 131 072 mediante YaRN |
| Tipos de cuantizacion | No disponible; el repositorio no publica pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la ficha del fine-tune; el modelo base Qwen3-8B declara 119 idiomas |
| Licencia | No disponible; la model card incluye el marcador de posicion `licence: license` sin texto legal |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Dataset de entrenamiento | skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura concreta no se documenta en la model card del ajuste. Por herencia del modelo base, se trata de un transformer decoder-only denso de aproximadamente 8 200 millones de parametros, con atencion por consulta (query-key normalization) y sin mezcla de expertos. El modelo base Qwen3-8B admite un modo de razonamiento explicito ("thinking") conmutable, pero no hay ninguna confirmacion de que este ajuste SFT lo preserve o lo desactive. Dado que la atencion de contexto largo en Qwen3 depende de factores de escala RoPE configurados en el tokenizador y en la configuracion de generacion, la perdida de esos ficheros en un repositorio incompleto degradaria la ventana efectiva.

El entrenamiento se ha realizado exclusivamente mediante aprendizaje supervisado (SFT) con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se declara ni RLHF ni DPO, ni tecnicas de decodificacion especulativa. La seccion "Training procedure" de la model card esta vacia: no hay numero de tokens de entrenamiento, epocas, tasa de aprendizaje, composicion del dataset ni configuracion de enmascarado de la funcion de perdida. El sufijo "masked" del nombre y el sufijo "shaped" del dataset sugieren un formateo y un enmascarado especificos de las etiquetas (probablemente perdida calculada solo sobre los turnos del asistente), pero esto es una inferencia a partir del nombre, no un dato documentado.

## Capacidades

- Generacion de texto conversacional en formato de chat: la model card incluye un ejemplo con `pipeline("text-generation")` sobre un mensaje con rol `user`, lo que confirma que el tokenizador conserva la plantilla de chat del modelo base.
- Simulacion de dialogos de diagnostico clinico: el dataset de entrenamiento esta construido al estilo AgentClinic, un entorno de evaluacion de agentes clinicos, por lo que el ajuste esta orientado a ese tipo de interaccion.
- Generacion de respuestas con perdida enmascarada: el sufijo "masked" apunta a que el modelo fue entrenado para producir respuestas del asistente sin penalizar el contenido del usuario, aunque no hay confirmacion documental.
- Capacidades heredadas del modelo base Qwen3-8B (razonamiento multi-paso, generacion de codigo, matematicas, soporte de tool calling y capacidades multilingues): no verificadas en este ajuste concreto y potencialmente degradadas por el SFT.
- Capacidad de agente multi-turno: no disponible como dato confirmado; no se documenta soporte explicito de function calling en la ficha.

## Casos de uso

- Investigacion en agentes clinicos: el modelo puede emplearse como sujeto de prueba en experimentos que replican el entorno AgentClinic, comparando su comportamiento con el de otros modelos ajustados sobre el mismo dataset.
- Prototipado de anamnesis sintetica: dado su entrenamiento sobre dialogos de diagnostico, puede generar historiales clinicos simulados para construir datasets auxiliares de investigacion, siempre que un profesional valide las salidas.
- Evaluacion de tecnicas de SFT: sirve como caso de estudio reproducible de un ajuste con TRL sobre Qwen3-8B, util para comparar estrategias de enmascarado de perdida en dominios especializados.
- Generacion de texto asistida en formato conversacional: mediante el ejemplo de `transformers.pipeline` de la model card, puede integrarse en un prototipo de chat con hasta 128 tokens nuevos por respuesta.
- Docencia y divulgacion sobre ciclo de vida de modelos: util como ejemplo de publicacion incompleta de un modelo (sin licencia, sin metricas, sin pesos completos) para ilustrar buenas practicas de model cards.
- Base para un posterior ajuste con DPO o RLHF: al ser un punto de partida ya especializado en dominio clinico, podria servir de inicializacion para etapas posteriores de alineamiento, asumiendo que los pesos esten completos.
- Filtrado y anotacion de dialogos medicos: podria emplearse para preetiquetar conversaciones clinicas antes de la revision humana, con supervision profesional obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, no hay seccion de resultados en el repositorio y la busqueda web realizada no ha devuelto ninguna referencia tecnica al modelo (los unicos resultados obtenidos son enlaces a la plataforma de videoconferencia Zoom, sin relacion con el modelo). Tampoco existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones clinicas como MedQA o AgentClinic para este ajuste concreto.

## Requisitos de hardware

Las siguientes cifras son estimaciones para un transformer denso de aproximadamente 8 200 millones de parametros y no proceden de la ficha del modelo, que no publica requisitos:

- VRAM estimada en bf16/fp16: en torno a 16 GB solo para pesos, mas 2-6 GB de cache KV segun longitud de contexto y tamano de lote; en la practica, 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos, 12-14 GB en total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, 8-10 GB en total.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, todas suficientes incluso en bf16 con contexto largo.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 con contexto moderado, y con holgura en cuantizacion de 8 o 4 bits. En tarjetas de 12 GB solo es viable en 4 bits.
- Opciones de despliegue: al ser un modelo de la familia Qwen3 con pesos safetensors, es compatible con transformers, vLLM, SGLang y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y el repositorio de 0,2 GB no permite siquiera confirmar que los pesos completos esten presentes para ejecutar una inferencia.

Advertencia importante: el tamano del repositorio (0,2 GB) es incompatible con un modelo de 8 000 millones de parametros en bf16, que ocuparia unos 16 GB. Es probable que la subida este incompleta o que solo contenga el adaptador o una parte de los ficheros, por lo que el modelo podria no ser cargable tal cual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-sft-agentclinic-diagnosis-shaped-masked | ~8,2 mil millones (heredado) | No disponible en la ficha | No disponible | Ninguno | Repositorio de 0,2 GB, posiblemente incompleto |
| Qwen/Qwen3-8B (base) | 8,2 mil millones | 32 768 tokens nativos, 131 072 con YaRN | Apache 2.0 | Si, publicados por el autor del modelo base | Completa, con pesos safetensors y GGUF |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 131 072 tokens | Llama 3.1 Community License | Si | Completa |
| Gemma-2-9B-it | 9,24 mil millones | 8 192 tokens | Gemma Terms of Use | Si | Completa |

La comparacion con alternativas genericas de ~8-9 mil millones de parametros es poco informativa en terminos de rendimiento, porque este ajuste no publica ninguna metrica. La diferencia principal no es de capacidades, sino de trazabilidad: los tres modelos de referencia tienen licencia explicita, pesos completos y evaluaciones publicadas, mientras que el ajuste de skowshik1 carece de los tres elementos. El dataset de entrenamiento lleva "gemma3" en el nombre pese a que el modelo base es Qwen3, lo que sugiere una reutilizacion de plantillas entre familias y anade incertidumbre sobre el formato final de las conversaciones.

## Limitaciones y advertencias

- Licencia no especificada: la model card contiene el marcador `licence: license` sin texto legal. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, y en la Union Europea tampoco queda claro el regimen de responsabilidad derivado.
- Repositorio incompleto en apariencia: 0,2 GB es un tamano incompatible con los pesos bf16 de un modelo de 8B. Puede tratarse de una subida parcial, de un adaptador o de un error, pero en cualquier caso no hay garantia de que el modelo sea cargable.
- Riesgo clinico grave: es un modelo entrenado sobre dialogos de diagnostico medico. No es un dispositivo medico, no esta validado clinicamente y no debe usarse para diagnostico, triaje ni recomendacion terapeutica real. Cualquier uso en ese contexto requeriria validacion regulatoria y supervision profesional.
- Riesgo elevado de alucinacion en dominio medico: los modelos de ~8B ajustados con SFT sobre datasets pequenos tienden a producir afirmaciones clinicas plausibles pero incorrectas, con un dano potencial alto.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de sesgos, ni analisis de robustez, ni pruebas de toxicidad. No es posible cuantificar la degradacion respecto al modelo base.
- Perdida de capacidades generales: el ajuste SFT sobre un unico dataset especializado puede provocar olvido catastrofico en razonamiento general, codigo o multilingueismo. No hay datos que lo confirmen ni que lo descarten.
- Idiomas no declarados: aunque el modelo base cubre 119 idiomas, no hay confirmacion de que el ajuste conserve ese soporte. El dataset parece estar en ingles, lo que probablemente degrade el rendimiento en castellano.
- Contexto no confirmado: al no publicarse los ficheros de configuracion y tokenizador de forma verificable, la ventana efectiva de 32 768 tokens del modelo base no esta garantizada.
- Datos de entrenamiento no auditables: no se describe la procedencia de los dialogos clinicos del dataset, su anonimizacion ni su base legal, lo que plantea dudas de privacidad si contuviera datos reales.
- Versionado fragil: el repositorio esta construido con versiones muy recientes de Transformers, PyTorch y TRL, lo que puede dificultar la reproducibilidad en entornos con dependencias fijadas.
- Cero adopcion: el modelo registra 0 descargas y 0 likes, y no hay referencias tecnicas externas que lo avalen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skowshik1/qwen3-8b-sft-agentclinic-diagnosis-shaped-masked
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/skowshik1/gemma3-sft-agentclinic-style-diagnosis-shaped-v2
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (BibTeX en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020, licencia Apache-2.0
- No se han encontrado articulos, blogs, demos ni papers adicionales sobre este modelo en la busqueda web realizada.
