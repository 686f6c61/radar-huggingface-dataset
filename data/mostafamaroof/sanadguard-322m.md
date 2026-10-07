# MostafaMaroof/sanadguard-322m

## Resumen

SanadGuard-322M es un modelo de clasificacion de seguridad (text-classification) de 321.908.998 parametros, desarrollado por MostafaMaroof como un fine-tuning de convaiinnovations/laya-multilingual. Su funcion concreta es evaluar si la respuesta de un asistente contiene contenido danino: devuelve una decision de dano y una puntuacion de probabilidad, sin generar texto. Segun la model card, tambien incluye definiciones de pregunta para clasificar el dano en el prompt y la negativa de respuesta, aunque el ejemplo de inicio rapido utiliza el clasificador de respuestas daninas.

El modelo se entrena sobre 40.000 pares en arabe e ingles, usando PolyGuardMix y NVIDIA Nemotron Safety Guard Dataset v3 como fuentes de datos, y se distribuye bajo licencia Apache-2.0. Su relevancia practica esta en el coste de inferencia: en la evaluacion publicada por el autor, tres llamadas a SanadGuard-322M sobre un Tesla T4 tienen una latencia media de 96 ms por par prompt-respuesta, frente a 969 ms del comparador generativo PolyGuard-Qwen-Smol, lo que supone una ventaja de 10,1x en ese flujo concreto.

El modelo aplica de forma automatica un umbral de decision guardado de 0,2276 y rechaza entradas que superen el presupuesto de entrenamiento de 1.024 tokens, incluyendo el sobrecoste de la pregunta de clasificacion. Su ambito es bilingue arabe-ingles, sin cobertura declarada de otros idiomas, y su uso previsto es el de guardrail o filtro de moderacion dentro de pipelines que ya disponen de un modelo generativo aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo transformer derivado de convaiinnovations/laya-multilingual; el detalle arquitectonico del backbone no esta disponible en la informacion proporcionada |
| Parametros totales | 321.908.998 (321,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Presupuesto de entrenamiento de 1.024 tokens, incluyendo el sobrecoste de la pregunta; el helper de inferencia rechaza entradas que lo excedan |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones en la informacion proporcionada |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye codigo Python auxiliar `predict_guard.py` en el repositorio) |

Datos adicionales: el repositorio ocupa 1,3 GB, la libreria declarada es `laya`, la pipeline es `text-classification` y el modelo base es un fine-tuning de convaiinnovations/laya-multilingual. Fecha de creacion registrada en HuggingFace: 2026-10-07.

## Arquitectura y entrenamiento

SanadGuard-322M es un ajuste fino supervisado de un modelo base multilingue (Laya multilingual) reorientado a una tarea de clasificacion binaria de dano, no a generacion de texto. El autor no detalla en la model card el numero de capas, la dimension del modelo, el mecanismo de atencion ni la composicion exacta del dataset de ajuste; la informacion de configuracion de entrenamiento se remite al archivo TRAINING.md del repositorio, no incluido en los datos disponibles. Lo que si se especifica es el volumen de datos de ajuste: 40.000 pares arabe-ingles.

Los datos de entrenamiento provienen de dos fuentes declaradas: ToxicityPrompts/PolyGuardMix y nvidia/Nemotron-Safety-Guard-Dataset-v3. El modelo resuelve tres decisiones de clasificacion (dano en el prompt, dano en la respuesta y negativa de respuesta), con umbral de decision fijado en 0,2276 y un presupuesto de 1.024 tokens por entrada. No se documenta en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni tecnicas de decodificacion especulativa o atencion lineal, que ademas no aplicarian a un clasificador sin generacion.

## Capacidades

- Clasificacion de dano en la respuesta del asistente: devuelve la etiqueta `response_harm` y la probabilidad `probability_yes`, aplicando automaticamente el umbral 0,2276.
- Clasificacion de dano en el prompt del usuario: la model card indica que el modelo incluye definiciones de pregunta para prompt harm.
- Deteccion de negativa de respuesta (response refusal): tercera decision de clasificacion incluida en el modelo.
- Bilinguismo arabe-ingles: evaluado con 500 pares en arabe y 500 en ingles sobre el subconjunto de PolyGuard.
- Inferencia sin generacion: al ser un clasificador, no produce texto libre, lo que reduce coste y latencia frente a guardrails generativos.
- Soporte de ejecucion en CPU y GPU mediante el helper `Guard(model_dir, device=...)` incluido en el repositorio.
- No disponible: soporte de tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito o cualquier capacidad multimodal. No se documentan en la informacion proporcionada.

## Casos de uso

- Moderacion de respuestas de un asistente conversacional: el modelo se situa como segunda etapa despues del LLM generativo y filtra las respuestas marcadas como daninas antes de entregarlas al usuario, con 96 ms de latencia media por par en Tesla T4.
- Filtrado previo de prompts en un chatbot de atencion al cliente: la definicion de prompt harm permite bloquear entradas abusivas o peligrosas antes de consumir tokens del modelo generativo.
- Guardrail bilingue en productos para el mundo arabe: es uno de los pocos clasificadores de seguridad publicos que cubre arabe e ingles en el mismo modelo, con recall de dano del 75,00% en arabe y 81,40% en ingles segun la evaluacion del autor.
- Auditoria de conversaciones historicas: al ser un clasificador barato y sin generacion, permite pasar lotes grandes de transcripciones ya almacenadas para etiquetar casos de dano y alimentar revisiones humanas.
- Deteccion de negativas problematicas: la decision de response refusal sirve para monitorizar asistentes que rechazan en exceso peticiones legitimas, un fallo habitual en sistemas con guardrails agresivos.
- Capa de seguridad en pipelines de CI/CD para aplicaciones LLM: se puede integrar como test de regresion que verifique que un cambio de prompt o de modelo generativo no incrementa la tasa de respuestas daninas.
- Enrutado de peticiones a revision humana: dado el umbral configurable (0,2276 por defecto) y la probabilidad devuelta, se puede fijar un rango de incertidumbre y derivar esos casos a moderadores, aceptando el coste de falsos positivos.
- Despliegue en hardware modesto: con ~322 M de parametros y ejecucion en CPU, encaja en entornos sin GPU para pre-filtrado de bajo volumen.

## Benchmarks y rendimiento

Deteccion de respuestas daninas sobre los mismos 1.000 pares de PolyGuard (500 arabe, 500 ingles), con latencia medida en Tesla T4 considerando las tres decisiones por par:

| Modelo | Recall de dano | Precision | Tasa de falsos positivos | Latencia media |
|---|---:|---:|---:|---:|
| SanadGuard-322M | 78,48% | 47,69% | 16,15% | 96 ms |
| Base Laya | 48,73% | 28,52% | 22,92% | 93 ms |
| PolyGuard-Qwen-Smol | 68,99% | 78,99% | 3,44% | 969 ms |

Desglose por idioma de SanadGuard-322M: recall de dano del 75,00% en arabe y del 81,40% en ingles. El autor indica que SanadGuard fue 10,1x mas rapido que Smol en esta carga de trabajo, y que el subconjunto de PolyGuard utilizado ya se habia empleado previamente para evaluacion de regresion. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general, que no aplican a un clasificador de esta naturaleza.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia aritmetica sobre el numero de parametros, ~1,29 GB en fp32 y ~0,64 GB en fp16; el repositorio completo ocupa 1,3 GB.
- GPU recomendadas: el autor mide latencia en Tesla T4. Cualquier GPU con al menos ~2 GB de VRAM libre deberia ser suficiente para el clasificador.
- GPU de consumo: si, cabe con holgura en GPU de consumo basicas (por ejemplo, GTX 1650, RTX 3050, RTX 4060 y superiores) segun la estimacion por parametros.
- CPU: soportada explicitamente por el helper (`device="cpu"`), lo que permite despliegue sin GPU.
- Opciones de despliegue: el repositorio proporciona `predict_guard.py` y una instalacion especifica (`pip install "laya @ https://github.com/NandhaKishorM/laya/archive/4066d5d5fbf08b66c6757ddeedbd797bd7655bc0.zip" "transformers==4.57.6" "huggingface_hub==0.36.2"`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; estos frameworks estan orientados a generacion y el artefacto aqui es un clasificador con codigo propio.
- Latencia y throughput: 96 ms de media por par (tres decisiones) en Tesla T4, frente a 93 ms del base Laya y 969 ms de PolyGuard-Qwen-Smol. No se publican cifras de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Recall de dano | Precision | Falsos positivos | Latencia (T4) | Licencia |
|---|---|---|---:|---:|---:|---:|---|
| SanadGuard-322M | 321,9 M | Clasificacion de seguridad ar/en | 78,48% | 47,69% | 16,15% | 96 ms | Apache-2.0 |
| Base Laya (convaiinnovations/laya-multilingual) | No disponible | Modelo base multilingue | 48,73% | 28,52% | 22,92% | 93 ms | No disponible en la informacion proporcionada |
| PolyGuard-Qwen-Smol | No disponible | Guardrail generativo | 68,99% | 78,99% | 3,44% | 969 ms | No disponible en la informacion proporcionada |

No se dispone de datos de parametros, contexto ni licencia de los dos comparadores en la informacion proporcionada. La comparativa se limita, por tanto, a la tarea de deteccion de respuestas daninas sobre el mismo subconjunto de 1.000 pares.

## Limitaciones y advertencias

- Precision baja: 47,69% en la evaluacion publicada, muy por debajo del 78,99% de PolyGuard-Qwen-Smol. Cerca de la mitad de las alertas de dano serian incorrectas en ese conjunto.
- Tasa de falsos positivos del 16,15%, que el propio autor senala como limitacion ("false alarms remain a limitation"). En produccion esto implica bloqueos o derivaciones innecesarias de contenido legitimo.
- Rendimiento desigual por idioma: recall del 75,00% en arabe frente al 81,40% en ingles. El arabe esta peor cubierto.
- Limite estricto de 1.024 tokens por entrada, incluyendo el sobrecoste de la pregunta de clasificacion. El helper rechaza directamente las entradas que lo superan, lo que obliga a truncar o dividir conversaciones largas.
- Cobertura linguistica restringida a arabe e ingles. No hay soporte declarado para castellano ni otros idiomas, por lo que su uso en entornos hispanohablantes requeriria evaluacion adicional no documentada.
- No genera texto: no puede sustituir a un LLM en ninguna tarea de generacion, resumen o dialogo. Solo emite etiquetas y probabilidades.
- El autor advierte que el rendimiento "puede diferir en datos nuevos". Los resultados proceden de un subconjunto de PolyGuard previamente usado en evaluacion de regresion, lo que puede introducir sesgo de seleccion.
- No se documentan sesgos demograficos, culturales o dialectales especificos, ni auditorias de equidad. Tampoco se detallan los tipos de dano cubiertos por la taxonomia.
- Licencia Apache-2.0, permisiva para uso comercial, pero se debe verificar la licencia del modelo base Laya multilingual, que no se especifica en la informacion proporcionada.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin comunidad que haya validado los resultados de forma independiente.
- No se publican versiones cuantizadas, pesos GGUF ni artefactos listos para frameworks de inferencia estandar, lo que anade trabajo de integracion.
- El repositorio incluye un helper Python propio (`predict_guard.py`) que hay que importar desde el directorio del modelo, con versiones de `transformers` y `huggingface_hub` fijadas; esto complica el mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MostafaMaroof/sanadguard-322m
- Modelo base (Laya multilingual): https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio de la libreria laya: https://github.com/NandhaKishorM/laya
- Dataset PolyGuardMix: ToxicityPrompts/PolyGuardMix
- Dataset NVIDIA Nemotron Safety Guard v3: nvidia/Nemotron-Safety-Guard-Dataset-v3
- Detalles de evaluacion: EVALUATION.md (en el repositorio del modelo)
- Detalles de entrenamiento, atribucion de datos y revisiones de origen: TRAINING.md (en el repositorio del modelo)
