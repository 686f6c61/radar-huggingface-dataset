# Medwebsite/semio-2-mistral7b-lora

## Resumen

Semio-2 (LoRA) es un adaptador de bajo rango (LoRA) publicado por el usuario Medwebsite sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.2`. Su objetivo es especializar un modelo generalista de 7 mil millones de parametros en el dominio medico en frances, concretamente en la resolucion de preguntas de tipo QCM (cuestiones de opcion multiple) del examen ECN frances (Examen Classant National). El adaptador se ha afinado sobre dos conjuntos de datos medicos: MediQAl (licencia CC BY 4.0) y FrenchMedMCQA (licencia Apache 2.0).

El modelo resuelve el problema de la baja precision de los LLM generalistas en preguntas medicas especializadas en frances. Segun la model card, el autor reporta una mejora en la tasa de acierto sobre 100 QCM de ECN no vistos durante el entrenamiento, pasando del 42,0 % antes del ajuste fino al 53,0 % despues. Estos datos son los unicos disponibles y no han sido verificados de forma independiente.

Es relevante ahora porque demuestra un flujo de trabajo reproducible y de bajo coste (un adaptador LoRA de aproximadamente 0,1 GB) para especializar modelos abiertos en dominios verticales regulados como la sanidad. El autor lo presenta explicitamente como herramienta pedagogica y advierte de que no sustituye el criterio de un profesional medico. No obstante, la informacion publica es muy limitada: no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y la model card no detalla hiperparametros de entrenamiento ni composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-Instruct-v0.2); el artefacto publicado es un adaptador LoRA |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.2 tiene 7,24 mil millones de parametros; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.2 soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors del adaptador LoRA (formato de precision original, probablemente fp16 o bf16) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Mistral-7B-Instruct-v0.2: un transformer decoder-only con atencion de ventana deslizante (sliding window attention) y 32 768 tokens de contexto, tal como se describe en la documentacion oficial de Mistral AI. Sobre este modelo se ha aplicado un ajuste fino mediante LoRA (Low-Rank Adaptation), una tecnica de parametros eficientes que congela los pesos originales e inserta matrices de bajo rango en determinadas capas. El repositorio publicado contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que para su uso es necesario cargar primero `mistralai/Mistral-7B-Instruct-v0.2` y aplicar despues el adaptador con PEFT o librerias equivalentes.

Los datos de entrenamiento declarados son MediQAl (CC BY 4.0) y FrenchMedMCQA (Apache 2.0), ambos conjuntos de preguntas medicas en frances. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de epocas, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. La unica metrica reportada es la evaluacion sobre 100 QCM de ECN no vistos (42,0 % antes frente a 53,0 % despues), sin que se detalle el protocolo de evaluacion ni los intervalos de confianza. No se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto en frances con especializacion en contenido medico.
- Resolucion de preguntas de opcion multiple (QCM) de tematica medica y estilo ECN.
- Razonamiento clinico basico sobre escenarios descritos en texto.
- Capacidades heredadas del modelo base Mistral-7B-Instruct-v0.2: generacion de codigo, matematicas basicas e instrucciones generales, aunque el ajuste fino puede haber degradado parcialmente estas habilidades fuera del dominio medico.
- Soporte de conversacion multi-turno en frances, heredado del modelo base Instruct.
- No se documenta soporte explicito de tool calling, function calling ni capacidades de agente multi-paso en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Preparacion de examenes medicos: el modelo puede generar y responder preguntas de tipo QCM del ECN en frances, sirviendo como herramienta de autoevaluacion para estudiantes de medicina. Es adecuado porque se ha afinado especificamente sobre datasets de QCM medicos franceses.
- Generacion de bancos de preguntas para docencia: un profesor puede usar el modelo para redactar preguntas de opcion multiple sobre temas clinicos y revisar despues las respuestas, aprovechando la mejora del 42,0 % al 53,0 % reportada en el dominio.
- Explicacion de conceptos de semiologia medica: dado que el nombre del modelo remite a la semiologia (estudio de los signos clinicos), puede emplearse para redactar explicaciones introductorias de signos y sintomas en frances, siempre con supervision de un profesional.
- Prototipado de asistentes de estudio: desarrolladores pueden integrar el adaptador en una aplicacion de repaso espaciado o un chatbot educativo para estudiantes francoparlantes, cargando el modelo base y aplicando el LoRA con PEFT.
- Investigacion sobre ajuste eficiente de parametros: el adaptador sirve como ejemplo reproducible de especializacion de un modelo de 7B en un dominio vertical con un artefacto de solo 0,1 GB, util para estudiar el impacto de LoRA en tareas medicas.
- Evaluacion comparativa de modelos medicos en frances: investigadores pueden usar el adaptador como linea base en experimentos de evaluacion de LLM en QCM medicos, comparandolo con modelos generalistas sin ajuste.
- Traduccion y reformulacion de material clinico en frances: con cautela y revision humana, puede ayudar a reformular resumenes de casos clinicos o material divulgativo, aunque su fiabilidad fuera del formato QCM no esta documentada.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la tasa de acierto sobre 100 QCM de ECN no vistos durante el entrenamiento:

| Metrica | Antes del ajuste (modelo base) | Despues del ajuste (Semio-2 LoRA) |
|---|---|---|
| Acierto en 100 QCM de ECN no vistos | 42,0 % | 53,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FrenchMedMCQA oficial, etc.) en la informacion disponible. No se detalla el protocolo de evaluacion, el muestreo de las 100 preguntas ni los intervalos de confianza, por lo que la cifra debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre Mistral-7B-Instruct-v0.2, los requisitos son los del modelo base. En fp16 se estiman aproximadamente 14-15 GB de VRAM; en cuantizacion de 8 bits, unos 8 GB; en 4 bits (por ejemplo, con bitsandbytes o GGUF Q4), unos 5-6 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para inferencia en fp16 sin cuantizar. Una RTX 4090 (24 GB) puede ejecutar el modelo en fp16 con margen ajustado o en 8 bits con holgura.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM si se aplica cuantizacion de 4 u 8 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En fp16 completo requiere tarjetas de 16 GB o mas.
- Opciones de despliegue: PEFT junto con Transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA de forma nativa; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Semio-2 (LoRA) | Adaptador sobre 7,24 mil millones (base) | No disponible (base: 32 768 tokens) | Medica, frances, QCM ECN | Apache 2.0 | Hugging Face, 0 descargas |
| Mistral-7B-Instruct-v0.2 (base) | 7,24 mil millones | 32 768 tokens | Generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| FrenchMedMCQA (modelos afinados publicados) | Variable | Variable | Medica, frances | Variable | No disponible en la informacion proporcionada |
| BioMistral-7B | 7,24 mil millones | 32 768 tokens (heredado de Mistral) | Medica, multilingue | Apache 2.0 | Hugging Face, con descargas y validacion comunitaria |

La comparativa se limita a modelos de la misma familia o categoria. No se dispone de datos de rendimiento comparables entre Semio-2 y BioMistral-7B en la informacion proporcionada, por lo que no se puede establecer una jerarquia de rendimiento. La principal diferencia frente al modelo base es la especializacion en QCM medicos franceses; frente a BioMistral-7B, la cobertura linguistica es exclusivamente francesa y la validacion publica es mucho menor.

## Limitaciones y advertencias

- El autor declara explicitamente que es una herramienta pedagogica y que no sustituye una opinion medica profesional. No debe usarse para diagnostico, tratamiento ni decisiones clinicas.
- Riesgo elevado de alucinacion en contenido medico: la tasa de acierto reportada del 53,0 % en QCM implica que casi la mitad de las preguntas se responden incorrectamente, lo que desaconseja su uso sin supervision experta.
- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre datasets medicos franceses, puede heredar sesgos de esos corpus y de la poblacion representada en ellos.
- Limitaciones de idioma: el modelo esta especializado unicamente en frances; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior al del modelo base.
- Limitaciones de contexto: no se especifica si el ajuste LoRA altera la ventana de contexto del modelo base; se asume la del modelo base (32 768 tokens), pero no esta confirmado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero los datasets de entrenamiento tienen licencias propias (MediQAl CC BY 4.0, FrenchMedMCQA Apache 2.0) que conviene revisar para cumplir con los requisitos de atribucion.
- Validacion limitada: cero descargas y cero likes en el momento de la consulta, sin evaluacion independiente. La metrica de mejora se basa en una unica evaluacion de 100 preguntas sin protocolo detallado.
- No se documentan hiperparametros de entrenamiento, composicion del dataset ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- En produccion, es imprescindible implementar filtros de seguridad, avisos legales y revision humana para cualquier aplicacion sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Medwebsite/semio-2-mistral7b-lora
- Modelo base Mistral-7B-Instruct-v0.2: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Dataset MediQAl: no disponible en la informacion proporcionada
- Dataset FrenchMedMCQA: no disponible en la informacion proporcionada
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio vLLM: https://github.com/vllm-project/vllm
