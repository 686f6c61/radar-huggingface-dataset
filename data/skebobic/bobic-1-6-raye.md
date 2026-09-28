# Skebobic/Bobic-1.6-Raye

## Resumen

Bobic 1.6 Raye es un modelo de lenguaje pequeno (SLM) de 125,86 millones de parametros desarrollado por el usuario Skebobic y publicado en HuggingFace. Se presenta como un modelo entrenado desde cero y alineado mediante tecnicas de aprendizaje por refuerzo (RL/GRPO), orientado especificamente a tareas de razonamiento y de reduccion de alucinaciones en dominios concretos como la aritmetica y la logica de sentido comun. Su principal argumento es que, pese a su tamano reducido, mantiene una precision de tipo zero-shot medible en MMLU-Pro.

El modelo emplea una arquitectura transformer con Grouped-Query Attention en configuracion 12:4, redes feed-forward de tipo SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). Incluye un componente especifico denominado NumberHead a nivel de token, disenado para mejorar la estabilidad numerica en operaciones aritmeticas. La longitud de contexto es de 2048 tokens y el vocabulario BPE es de 16.384 tokens.

Su relevancia practica radica en el nicho de despliegue ultraligero: se distribuye principalmente en formato GGUF con cuantizacion Q8_0 de aproximadamente 127,8 MB, lo que permite ejecutarlo en CPU, en equipos de gama baja o en entornos embebidos mediante llama.cpp o LM Studio. La licencia MIT facilita su uso comercial sin restricciones significativas. No obstante, el repositorio no registra descargas ni interacciones en el momento de la consulta, y no se han publicado resultados exhaustivos de rendimiento mas alla de la metrica de MMLU-Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Grouped-Query Attention (GQA 12:4), SwiGLU, RMSNorm y embeddings rotatorios; NumberHead a nivel de token |
| Parametros totales | 125.864.458 (dato de safetensors); la model card indica 125.861.376 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (incluida); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (estado PyTorch FP32) y GGUF (Q8_0) |
| Vocabulario | 16.384 tokens BPE |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con varias decisiones de diseno orientadas a la eficiencia en modelos muy pequenos. Emplea Grouped-Query Attention con una relacion 12:4 (12 cabezas de consulta y 4 de clave/valor), lo que reduce el coste de memoria del cache KV respecto a la atencion multi-cabeza clasica. La red feed-forward usa SwiGLU, la normalizacion es RMSNorm y la codificacion posicional se basa en embeddings rotatorios. Un elemento distintivo es el NumberHead, una cabeza dedicada a nivel de token pensada para aumentar la estabilidad numerica en tareas aritmeticas.

Segun la model card, el modelo fue entrenado desde cero y posteriormente alineado mediante RL/GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo utilizada habitualmente para ajustar el comportamiento del modelo hacia respuestas mas correctas y menos propensas a la alucinacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de alineacion mas alla de la mencion al RL/GRPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de texto en formato conversacional y de razonamiento, con parametros de inferencia recomendados de temperatura 0,25-0,35, top-p 0,85 y penalizacion por repeticion 1,15.
- Razonamiento aritmetico basico con grounding, segun la model card mejora en operaciones del tipo suma y resta.
- Logica de sentido comun y manejo de negaciones, presentados como mejoras respecto a un modelo base no alineado.
- Reduccion de alucinaciones en dominios especificos (aritmetica y logica) segun las afirmaciones del autor.
- Razonamiento de tipo zero-shot medido en MMLU-Pro.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte especifico para agentes o razonamiento multi-paso.
- No se documenta capacidad multilingue; el campo de idiomas no esta disponible.
- No se documenta soporte de vision ni de audio.
- No se documenta un modo de razonamiento extendido (thinking mode) diferenciado.

## Casos de uso

- Asistente conversacional local en dispositivos de bajos recursos: con 127,8 MB en Q8_0, el modelo puede ejecutarse integramente en CPU o en GPUs integradas, lo que permite construir chatbots offline sin dependencia de la nube.
- Clasificacion y extraccion de informacion en texto corto: su contexto de 2048 tokens y su tamano reducido lo hacen adecuado para tareas de etiquetado, resumen breve o extraccion de campos en pipelines por lotes de alto volumen.
- Filtrado previo o preprocesado en cascada: puede usarse como primer nivel de un sistema mayor para descartar consultas triviales o reformular preguntas antes de enviarlas a un modelo de mayor tamano, reduciendo coste computacional.
- Demostraciones educativas de entrenamiento y alineacion: al ser un modelo entrenado desde cero con un repositorio que incluye pesos en FP32 y tokenizer, es util como caso de estudio reproducible para ensenar RL/GRPO y arquitecturas transformer pequenas.
- Prototipado rapido en entornos sin GPU: gracias al formato GGUF y a la compatibilidad con llama.cpp y LM Studio, permite validar ideas de producto en un portatil convencional sin infraestructura dedicada.
- Aplicaciones embebidas o edge computing: su huella de memoria inferior a 150 MB abre la puerta a integraciones en dispositivos con recursos limitados donde un modelo mayor no es viable.
- Tareas de aritmetica sencilla con verificacion: el NumberHead y las mejoras de grounding declaradas permiten usarlo como componente de calculo basico dentro de un flujo mas amplio, siempre con validacion externa.

## Benchmarks y rendimiento

En la informacion disponible solo se publica un resultado de benchmark.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU-Pro (zero-shot) | 18,33 % - 20,00 % | Precision bajo inferencia calibrada, segun la model card |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q8_0 ocupa aproximadamente 127,8 MB, por lo que la inferencia requiere del orden de 150-250 MB con overhead de runtime. Los pesos FP32 completos rondan los 500 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente. No requiere aceleradores de gama alta como A100 o H100.
- Cabe en GPU de consumo: si, con enorme margen. Funciona en GTX 1050, RTX 3050, RTX 4090 e incluso en GPUs integradas y en CPU exclusivamente.
- Opciones de despliegue: llama.cpp y LM Studio son las opciones explicitamente mencionadas por el autor. Al ser un transformer estandar con GQA, tambien podria ser compatible con otros runners GGUF, aunque no se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, en hardware de consumo se espera una latencia muy baja y un throughput elevado, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

Los valores de los modelos alternativos corresponden a especificaciones publicas ampliamente documentadas; los datos de Bobic 1.6 Raye provienen del repositorio de HuggingFace.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Bobic 1.6 Raye | 125,86 M | 2048 | MIT | no disponible | HuggingFace (GGUF Q8_0 y FP32) |
| SmolLM-135M | 135 M | 2048 (v1) | Apache-2.0 | Ingles (principal) | HuggingFace |
| Qwen2.5-0.5B | ~0,49 B | 32.768 | Apache-2.0 | Multilingue | HuggingFace |

Comparativa de rendimiento: no disponible. No se han publicado resultados de benchmarks de Bobic 1.6 Raye mas alla de MMLU-Pro, por lo que no es posible establecer una comparacion cuantitativa fiable con las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo o toxicidad.
- Riesgo de alucinacion: el autor afirma reducciones de alucinacion en aritmetica y logica, pero no aporta evaluaciones independientes; la precision declarada en MMLU-Pro (18,33 % - 20,00 %) indica que la tasa de error en conocimiento general es elevada, cercana al 80 %.
- Limitacion de contexto: 2048 tokens es una ventana muy corta, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitacion de idioma: el campo de idiomas no esta disponible; el vocabulario BPE de 16.384 tokens sugiere un soporte limitado fuera de los idiomas mayoritarios presentes en el entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No se identifican restricciones adicionales en la informacion disponible.
- Caveats para produccion: el repositorio no registra descargas ni likes, no hay validacion externa de las afirmaciones del autor y no se documentan el dataset de entrenamiento ni el numero de tokens. Su uso en produccion deberia ir acompanado de evaluaciones propias.
- Aviso de fecha: la fecha de creacion y actualizacion del repositorio figura como 2026, dato poco habitual; conviene verificar la integridad del repositorio antes de integrarlo.
- Tamano muy reducido: con 125 M de parametros, el conocimiento factual y la cobertura de dominios son inherentemente limitados en comparacion con modelos de mayor escala.

## Enlaces

- HuggingFace: https://huggingface.co/Skebobic/Bobic-1.6-Raye
- Repositorio de GitHub bablaerrr/bobikA5 (aparicion en busqueda, relevancia no confirmada): https://github.com/bablaerrr/bobikA5/releases

Nota: el resto de resultados de la busqueda web (Ray 1.6 de Luma AI, Modly, listado de modelos de OpenAI, MeshGPT) no guardan relacion con este modelo y se han descartado. No se han encontrado papers, blogs ni demos oficiales asociados a Bobic 1.6 Raye.
