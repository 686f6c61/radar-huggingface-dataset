# alpha-qualia/Anamnesis-Qwen3-8B-MQA

## Resumen

Anamnesis-Qwen3-8B-MQA es un *writer*: una hiperred pequena basada en la arquitectura SHINE que lee un documento de hasta 1.550 tokens y emite, en un unico forward pass, un LoRA de rango 8 para un Qwen3-8B congelado. El resultado es que el modelo base responde como si hubiera leido el documento, pero sin llevarlo en el prompt: la memoria queda codificada en los pesos del adaptador. Lo desarrolla el investigador independiente Bohdan Agarkov bajo el identificador `alpha-qualia`, con licencia Apache-2.0.

El checkpoint publicado en esta ficha es el punto de partida del proyecto: el writer principal antes del post-entrenamiento on-policy, entrenado sobre un writer SHINE original afinado en QA multi-pregunta de MS MARCO (`ift_mqa`). La revision `main` corresponde a la epoca completa (paso 2.099) y la revision `3ec8373` al paso 735. El modelo posterior y recomendado por el autor es `Anamnesis-Qwen3-8B`, que continua a partir de este.

La relevancia es tecnica: propone una via de memoria parametrica para agentes y asistentes donde el conocimiento persistente (perfiles de usuario, notas de proyecto, ficheros de reglas, documentacion de API privada) se inyecta como adaptador en lugar de ocupar ventana de contexto en cada turno. El repositorio ocupa 5,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiperred SHINE (4 capas, 32 cabezas, meta-rango 128) que genera LoRA de rango 8 sobre Qwen3-8B congelado |
| Parametros totales | No disponible (el writer es una hiperred; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada de memoria: hasta 1.550 tokens Qwen3 (longitud de entrenamiento). Contexto del modelo base: no especificado en la informacion disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-8B) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de 5,3 GB; el autor no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema separa dos piezas. Por un lado, Qwen3-8B permanece intacto en el checkpoint `b968826`. Por otro, el writer es una hiperred de 4 capas y 32 cabezas con meta-rango 128 que proyecta la representacion del documento de entrada en los pesos de un LoRA de rango 8 aplicado a todas las proyecciones de atencion y MLP del modelo base. La inferencia es un unico forward pass del writer seguido de la generacion normal de Qwen3-8B con el LoRA cargado.

El entrenamiento es destilacion offline: el profesor es el propio Qwen3-8B con el documento en el prompt y modo thinking activo; el alumno es Qwen3-8B con solo el LoRA generado. La perdida minimiza la KL top-16 entre ambos sobre las respuestas del profesor. Los datos son 2.216 documentos de memoria (perfiles de usuario, notas de proyecto, ficheros de reglas de agente, documentacion de API privada, papers, actas de reunion) y 67.424 conversaciones de estilo agente sobre ellos, con un curriculo que cubre recuerdo, aplicacion, escritura de codigo, llamada a herramientas, decir "no lo se" e ignorar la memoria cuando es irrelevante. Total: 101 millones de tokens objetivo supervisados. Computo: una epoca en 8x H100, batch 64, secuencias empaquetadas de 32K y schedule WSD, con learning rate 2e-5 partiendo del writer SHINE afinado en `ift_mqa`. La KL en held-out es 0,286 con la memoria correcta frente a 0,852 con una memoria intercambiada (cuota de memoria 0,66); en conversaciones acotadas de MS MARCO supera el 44,7% de turnos frente al 24,2% del writer SHINE MQA original.

## Capacidades

- Generacion de texto conversacional multi-turno sobre Qwen3-8B, con la memoria del documento incorporada via LoRA.
- Memoria parametrica de documentos de hasta 1.550 tokens sin incluirlos en el prompt.
- Razonamiento en modo thinking: el autor afirma que el modo thinking sigue funcionando.
- Tool calling y function calling: preservados del modelo base y entrenados explicitamente en el curriculo.
- Comportamiento de agente: conversaciones de estilo agente, incluida la capacidad de ignorar la memoria cuando no es relevante.
- Escritura de codigo condicionada por la memoria (documentacion de API, reglas de proyecto).
- Capacidad de abstenerse ("no lo se") entrenada en el curriculo.
- Capacidades multilingues: no documentadas de forma especifica; dependen del modelo base.

## Casos de uso

- Asistentes personales con perfil persistente: el writer genera un LoRA a partir del perfil del usuario y el asistente responde sin arrastrar ese perfil en cada peticion, reduciendo tokens de entrada en conversaciones largas.
- Agentes con ficheros de reglas: se codifican las instrucciones de comportamiento de un agente en un adaptador y se evita reinyectar el fichero de reglas en cada turno del bucle agente.
- Soporte interno sobre documentacion privada de API: el writer ingiere la documentacion y el modelo responde preguntas de integracion y escribe codigo de cliente, con la advertencia de que los valores literales (IDs, numeros) se degradan.
- Memoria de proyecto en herramientas de desarrollo: notas de proyecto y decisiones de arquitectura se convierten en LoRA para asistentes de codigo que deben respetar convenciones internas.
- Procesamiento de actas de reunion: a partir del acta se genera un adaptador que permite consultar decisiones y acciones sin cargar el texto completo.
- Investigacion en memoria parametrica y destilacion: el checkpoint sirve como linea base reproducible (KL held-out, QualiaBench) para comparar writers y estrategias de post-entrenamiento.
- Despliegue local en estaciones de trabajo: la app del repositorio corre offline en Mac Apple Silicon con 24 GB o mas de memoria unificada (MLX) o en Linux con una GPU NVIDIA de 48 GB o mas (vLLM).

## Benchmarks y rendimiento

Resultados en QualiaBench (280 documentos, 2.800 preguntas, evaluacion punto por punto; medias sobre documentos de 128 a 1.024 tokens). "Gain" situa el LoRA entre el modelo desnudo (0) y el documento pegado en el prompt (1).

| Qwen3-8B con... | General | Factual | Recall | Precision | Gain [IC 95%] |
|---|---:|---:|---:|---:|---|
| nada (desnudo) | 0,487 | 0,151 | 0,186 | 0,376 | 0 |
| Anamnesis MQA, paso 735 | 0,624 | 0,267 | 0,370 | 0,266 | 0,40 [0,37, 0,42] |
| Anamnesis MQA, epoca completa | 0,635 | 0,284 | 0,394 | 0,278 | 0,43 [0,41, 0,46] |
| Anamnesis (MQA + OPSD) | 0,641 | 0,304 | 0,411 | 0,323 | 0,45 [0,42, 0,48] |
| el documento en el prompt | 0,817 | 0,732 | 0,831 | 0,755 | 1 |

Un LoRA generado a partir del documento equivocado puntua igual o por debajo del modelo desnudo, lo que indica que la ganancia procede del documento. Otros datos reportados: KL held-out de 0,286 con memoria correcta frente a 0,852 con memoria intercambiada; 44,7% de turnos superados en conversaciones acotadas de MS MARCO frente a 24,2% del writer SHINE MQA original. El autor menciona un panel de habilidades no relacionadas (MMLU-Redux, IFEval, MATH-500) sin dano medio, pero no publica las cifras en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada. El autor indica 48 GB o mas en una GPU NVIDIA para el servidor con vLLM, y 24 GB o mas de memoria unificada en Apple Silicon con MLX.
- GPU recomendadas: una H100 o A100 de 80 GB para margen; el minimo declarado es 48 GB (por ejemplo, A6000, L40S o A100 de 80 GB). El entrenamiento se realizo en 8x H100.
- GPU de consumo: no cabe en RTX 4090 (24 GB) segun el requisito declarado de 48 GB para el despliegue completo con el writer y Qwen3-8B.
- Opciones de despliegue: vLLM en Linux; MLX en Apple Silicon; servidor compatible con la API de chat de OpenAI en el puerto 8788 aceptando los campos `memory` y `writer_id`; app local en `http://127.0.0.1:3000`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anamnesis-Qwen3-8B-MQA | 8B (base) + hiperred | Memoria de 1.550 tokens | LoRA generado por writer | Apache-2.0 | Hugging Face, 0 descargas |
| Anamnesis-Qwen3-8B | 8B (base) + hiperred | Memoria de 1.550 tokens | LoRA generado por writer, con OPSD | Apache-2.0 | Hugging Face |
| Writer SHINE MQA original | No disponible | No disponible | LoRA generado por writer | Apache-2.0 | GitHub MuLabPKU/SHINE |
| Qwen3-8B (base) | 8B | No disponible en esta ficha | Documento en el prompt | Apache-2.0 | Hugging Face |

No se dispone de comparativas con otros sistemas de memoria parametrica en la informacion proporcionada.

## Limitaciones y advertencias

- Predominio de la idea general sobre los literales: captura el tema, las reglas y el estilo del documento mejor que los valores exactos; nombres, numeros e identificadores se difuminan primero.
- Invencion de detalles: la precision (0,32) queda por debajo del modelo desnudo (0,38); cuando recuerda un tema, a veces rellena especificos erroneos con seguridad.
- La longitud perjudica: el recall cae de aproximadamente 0,54 a 128 tokens hasta aproximadamente 0,28 a 1.024 tokens; entradas por encima de 1.550 tokens quedan fuera del entrenamiento.
- Bucles de repeticion: tras un detalle erroneo, una respuesta larga puede repetir una frase de la memoria; se recomienda penalizacion por repeticion o limite de tokens.
- Un unico seed de entrenamiento por checkpoint y ausencia de ajuste de seguridad mas alla del modelo base.
- Sesgos conocidos: no documentados de forma especifica; se heredan los del modelo base Qwen3-8B.
- Riesgo de alucinacion: elevado en datos factuales concretos, segun los propios resultados de precision.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el checkpoint es investigacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpha-qualia/Anamnesis-Qwen3-8B-MQA
- Modelo posterior recomendado: https://huggingface.co/alpha-qualia/Anamnesis-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de evaluacion: https://huggingface.co/datasets/alpha-qualia/qualiabench
- Repositorio del proyecto (codigo, app y write-up): https://github.com/keell0renz/anamnesis
- API Python y formato de fichero: https://github.com/keell0renz/anamnesis/blob/main/src/shine/README.md
- Arquitectura SHINE: https://github.com/MuLabPKU/SHINE
- Perfil del autor: https://github.com/keell0renz
