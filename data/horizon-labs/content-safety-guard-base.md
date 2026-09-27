# Horizon-Labs/content-safety-guard-base

## Resumen

Content Safety Guard (base) es un clasificador encoder de 308 millones de parametros desarrollado por Horizon Labs, pensado para actuar como barrera de seguridad (guardrail) delante o detras de cualquier LLM. Su tarea no es generar texto, sino puntuar si un prompt de usuario o una respuesta de modelo son inseguros, devolviendo una puntuacion global `unsafe` junto con 15 puntuaciones de categoria independientes (odio, acoso, violencia, armas, contenido sexual, abuso infantil, autolesion, planificacion criminal, drogas, privacidad, blasfemias, fraude y manipulacion, desinformacion, consejo no autorizado y otros). Al ser un encoder, resuelve la moderacion en una sola pasada hacia delante, sin decodificacion autoregresiva.

El modelo parte del backbone multilingue mmBERT (`jhu-clsp/mmBERT-base`), una variante de la arquitectura ModernBERT, y se distribuye bajo licencia Apache-2.0 con pesos en safetensors y ONNX, incluida una version int8 de 641 MB que puede ejecutarse en CPU o directamente en el navegador mediante transformers.js. Esta orientado a despliegues de bajo coste donde no es viable pagar la latencia y el coste de un modelo guard de tipo decoder de 0,6B a 8B parametros.

Su relevancia practica esta en la combinacion de tamano reducido, cobertura de 17 idiomas en evaluacion (12 en entrenamiento) y un conjunto de benchmarks publicados frente a Qwen3Guard-Gen-0.6B, Vela-1.0-307M-Shield y clasificadores de toxicidad clasicos. Destaca en prompts reales de usuario (ToxicChat, 0,771 F1) y en recall sobre SimpleSafetyTests (0,930), aunque queda por detras de los guard basados en decoder en varias categorias de respuesta y en toxicidad multilingue. Nota: el modelo registra 0 descargas y 0 likes en el momento de la consulta y su model card aparece truncada, por lo que parte de la informacion tecnica no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT) con backbone mmBERT |
| Parametros totales | 307.542.544 (aproximadamente 308M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quantized.onnx`, 641 MB, embeddings cuantizados); safetensors fp32; GGUF no disponible |
| Idiomas soportados | Multilingue. 12 idiomas de entrenamiento segun la model card; 17 idiomas evaluados: en, ar, de, es, fr, hi, it, ja, ko, nl, th, zh, pt, ru, pl, cs, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (fp32 e int8) |
| Tarea | Clasificacion de texto (text-classification) |
| Entrada | Prompt suelto, o par (prompt, respuesta) para juzgar la respuesta en contexto |
| Salida | Puntuacion global `unsafe` mas 15 puntuaciones de categoria con sigmoides independientes |
| Categorias | hate, harassment, violence, weapons, sexual, sexual_minors, self_harm, criminal_planning, drugs, privacy, profanity, fraud_manipulation, misinformation, unauthorized_advice, other |
| Modelo base | jhu-clsp/mmBERT-base |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de tipo ModernBERT, construido sobre el checkpoint multilingue mmBERT-base. A diferencia de los guardrails basados en decoder (Qwen3Guard, Llama Guard y similares), que necesitan generar tokens para emitir un veredicto, este modelo produce la clasificacion en un unico paso de inferencia. La cabeza de clasificacion emite una puntuacion global `unsafe` y 15 salidas adicionales con activacion sigmoide independiente, de modo que una misma entrada puede activar varias categorias a la vez. Los umbrales por categoria estan calibrados sobre una particion de validacion y se distribuyen en el fichero `thresholds.json`; el umbral por defecto para `unsafe` es 0,5.

La model card lista los corpus de entrenamiento pero no detalla el numero de tokens, la mezcla exacta ni si hubo fases de RLHF o DPO: `nvidia/Nemotron-Safety-Guard-Dataset-v3`, `allenai/WildChat-1M`, `OpenAssistant/oasst2`, `CohereForAI/aya_dataset`, `OpenSafetyLab/Salad-Data`, `JailbreakBench/JBB-Behaviors` y `google/civil_comments`. La model card afirma que solo se utilizaron datos que permiten uso comercial. En la tabla de evaluacion, Qwen3Guard-Gen-8B aparece etiquetado como "teacher", lo que sugiere un proceso de destilacion desde ese modelo de 8B hacia el encoder de 308M, aunque el procedimiento no se describe explicitamente en la informacion disponible. Tampoco se documentan innovaciones adicionales como atencion lineal o decodificacion especulativa, algo que no aplica a un encoder de clasificacion.

## Capacidades

- Clasificacion de seguridad de prompts de usuario, con una puntuacion global y 15 categorias de dano.
- Clasificacion de respuestas de modelo, evaluadas en el contexto del prompt original mediante el par (prompt, respuesta).
- Deteccion de jailbreaks y peticiones maliciosas, gracias a la inclusion de `JailbreakBench/JBB-Behaviors` en el entrenamiento.
- Multilingue: 12 idiomas en entrenamiento y 17 evaluados en los benchmarks PolyGuard, Aya red-teaming y textdetox.
- Capacidad para distinguir peticiones que suenan peligrosas pero son benignas (por ejemplo, "como mato un proceso de Python bloqueado"), validada con el conjunto XSTest.
- Salidas multi-etiqueta: una misma entrada puede activarse simultaneamente en varias categorias.
- Inferencia sin generacion de tokens, lo que reduce la latencia a una unica pasada del encoder.
- Ejecucion en navegador o Node mediante transformers.js con `dtype: "q8"`.
- Compatibilidad con text-embeddings-inference y con endpoints compatibles, segun los tags del repositorio.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de entrada en aplicaciones de chat: el modelo se coloca delante del LLM y bloquea o marca prompts inseguros antes de enviarlos, con un coste de una sola pasada de encoder por mensaje.
- Moderacion de salida del LLM: se envia el par (prompt, respuesta) al clasificador para detectar respuestas daninas en contexto, util en asistentes con acceso a herramientas o datos sensibles.
- Filtrado en tiempo real en el navegador: con la version ONNX int8 y transformers.js se puede ejecutar la moderacion en el cliente sin enviar el texto del usuario a un servidor, lo que ayuda con requisitos de privacidad y RGPD.
- Moderacion de contenido generado por usuarios en foros y comunidades: las 15 categorias permiten enrutar cada caso a la cola de revision adecuada (por ejemplo, `self_harm` a un flujo con protocolo de crisis y `fraud_manipulation` a un flujo antifraude).
- Prefiltrado en pipelines de anotacion y red-teaming: reducir el volumen de textos que llegan a un modelo guard mayor o a revision humana, dado que el int8 mantiene la decision de `unsafe` coincidente con fp32 en el 100,0% de una muestra de textos de benchmark (30 por benchmark, con una diferencia media absoluta de puntuacion de 0,0015).
- Control de cumplimiento en plataformas multilingues: cubre 17 idiomas evaluados, lo que lo hace util para servicios con audiencias en Europa, America Latina y Asia sin desplegar un clasificador por idioma.
- Generacion aumentada por recuperacion (RAG) con salvaguardas: clasificar la consulta del usuario y, opcionalmente, la respuesta final generada por el sistema antes de mostrarla.
- Filtrado de datasets de entrenamiento: al ser un encoder rapido, puede puntuar corpus completos para descartar ejemplos toxicos o inseguros antes de entrenar otros modelos.

## Benchmarks y rendimiento

F1 de la clase `unsafe` con umbral 0,5. En las filas marcadas como recall, el valor representa la proporcion de prompts inseguros detectados. Segun la model card, ninguno de estos benchmarks se uso para entrenamiento y los clasificadores de toxicidad se incluyen como referencia aunque atacan una tarea mas estrecha. Las columnas de Qwen3Guard-Gen se puntuan a partir de las probabilidades del siguiente token tras "Safety:" (strict cuenta Unsafe y Controversial como inseguro; loose solo cuenta Unsafe). Los encoders distintos del modelo evaluado reciben unicamente la respuesta en los items de respuesta.

| Benchmark | Este modelo (308M) | Qwen3Guard-Gen-0.6B strict | Qwen3Guard-Gen-0.6B loose | Vela-1.0-307M-Shield | granite-guardian-hap-125m | unbiased-toxic-roberta | Qwen3Guard-Gen-8B strict (teacher) |
|---|---|---|---|---|---|---|---|
| PolyGuard prompts, 17 idiomas | 0,779 | 0,821 | 0,791 | 0,829 | 0,003 | 0,002 | 0,846 |
| PolyGuard responses, 17 idiomas | 0,732 | 0,748 | 0,767 | 0,645 | 0,000 | 0,000 | 0,801 |
| BeaverTails responses (prompts no vistos) | 0,838 | 0,869 | 0,858 | 0,779 | 0,164 | 0,177 | 0,870 |
| ToxicChat (prompts reales de usuario) | 0,771 | 0,588 | 0,760 | 0,672 | 0,264 | 0,254 | 0,638 |
| OpenAI moderation set | 0,768 | 0,660 | 0,780 | 0,721 | 0,672 | 0,663 | 0,685 |
| XSTest (test de sobre-bloqueo) | 0,786 | 0,853 | 0,852 | 0,838 | 0,315 | 0,227 | 0,908 |
| textdetox toxicity, 14 idiomas | 0,597 | 0,722 | 0,461 | 0,720 | 0,146 | 0,152 | 0,775 |
| Aya red-teaming, 8 idiomas (recall) | 0,766 | 0,859 | 0,605 | 0,812 | 0,023 | 0,025 | 0,946 |
| SimpleSafetyTests (recall) | 0,930 | 0,980 | 0,920 | 0,960 | 0,240 | 0,260 | 0,990 |

La model card incluye ademas una tabla de calidad de ranking (ROC AUC, sin umbral), pero el contenido disponible esta truncado justo en la cabecera de esa tabla, por lo que los valores de ROC AUC no estan disponibles. Los simbolos de nota al pie presentes en las columnas de Vela-1.0-307M-Shield y BeaverTails aparecen en el texto original, pero sus notas correspondientes no estan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para fp32: aproximadamente 1,23 GB solo de pesos (307,5M parametros a 4 bytes), mas activaciones y overhead del runtime. En la practica, entre 1,5 y 2,5 GB.
- VRAM estimada para int8: 641 MB de pesos en `onnx/model_quantized.onnx`, con un consumo total tipicamente por debajo de 1,5 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en CPU. Tambien se ejecuta en el navegador mediante WebGPU/WASM con transformers.js.
- GPU de centro de datos (A100, H100) no son necesarias; se usarian solo para servir muchas replicas concurrentes o para procesar grandes volumenes offline.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime, transformers.js (navegador y Node), text-embeddings-inference y endpoints compatibles. El soporte de GGUF llama.cpp y de Ollama no esta indicado en la informacion disponible. Para vLLM no se documenta soporte especifico para este encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada. Estructuralmente, al ser un encoder que resuelve la tarea en una sola pasada hacia delante (frente a la decodificacion autoregresiva de los guard basados en decoder), la latencia por peticion es un orden de magnitud menor en el mismo hardware, pero no se publican cifras medidas.
- Nota de calidad de la cuantizacion: segun la model card, la version int8 coincide con fp32 en la decision `unsafe` en el 100,0% de una muestra de textos de benchmark (30 por benchmark), con una diferencia media absoluta de puntuacion de 0,0015.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Idiomas | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|---|
| Content Safety Guard base | 308M | Encoder (ModernBERT / mmBERT) | Apache-2.0 | 17 evaluados | HuggingFace, ONNX, transformers.js | ToxicChat 0,771; SimpleSafetyTests (recall) 0,930 |
| Qwen3Guard-Gen-0.6B | 0,6B | Decoder generativo | No disponible en la informacion proporcionada | Multilingue | HuggingFace | PolyGuard prompts 0,821 (strict); textdetox 0,722 |
| Vela-1.0-307M-Shield | 307M | Guard de seguridad | No disponible en la informacion proporcionada | No disponible | HuggingFace | PolyGuard prompts 0,829; mejor F1 en textdetox (0,720) entre los encoder comparados |
| granite-guardian-hap-125m | 125M | Clasificador de toxicidad (tarea estrecha) | No disponible en la informacion proporcionada | Ingles principalmente | HuggingFace | 0,672 en OpenAI moderation set; practicamente nulo en PolyGuard y ToxicChat |
| Qwen3Guard-Gen-8B (teacher) | 8B | Decoder generativo | No disponible en la informacion proporcionada | Multilingue | HuggingFace | Mejor o cercano al mejor en todas las filas de la tabla |

Frente a los guard encoder de tamano similar, el modelo de Horizon Labs es competitivo en prompts de usuario reales y en conjuntos de recall, pero queda por detras de Vela-1.0-307M-Shield en PolyGuard prompts (0,829 frente a 0,779) y en textdetox (0,720 frente a 0,597). Frente a Qwen3Guard-Gen-0.6B, la comparacion depende del modo estricto o laxo, y el encoder gana de forma clara en ToxicChat (0,771 frente a 0,588 en strict) y en el conjunto de moderacion de OpenAI en modo estricto (0,768 frente a 0,660). Los clasificadores de toxicidad clasicos (granite-guardian-hap, unbiased-toxic-roberta) no son comparables en cobertura: obtienen valores cercanos a cero en los benchmarks multilingues y de seguridad general.

## Limitaciones y advertencias

- La model card disponible esta truncada: falta la tabla completa de ROC AUC, las notas al pie de las columnas marcadas y cualquier seccion posterior a la evaluacion.
- No se especifica la longitud de contexto soportada ni el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.
- Riesgo de falsos positivos en peticiones benignas con vocabulario sensible: la puntuacion en XSTest es 0,786, inferior a la de Qwen3Guard (0,853 en strict, 0,852 en loose) y ligeramente por debajo de Vela (0,838).
- Punto debil claro en toxicidad multilingue: textdetox en 14 idiomas da 0,597, muy por debajo del 0,775 del teacher de 8B y del 0,722 de Qwen3Guard-Gen-0.6B strict.
- Las puntuaciones de categoria son pequenas por diseno y solo son interpretables cuando el texto ya ha sido marcado como inseguro; usarlas sin el umbral global produce resultados enganosos. Es obligatorio aplicar los umbrales de `thresholds.json`.
- El rendimiento depende fuertemente del umbral elegido: 0,5 es solo el valor por defecto y la propia model card recomienda subirlo o bajarlo segun la tolerancia a falsos positivos.
- No genera explicaciones ni justificaciones de su decision: solo devuelve puntuaciones. Para trazabilidad en produccion hace falta registrar scores y aplicar reglas propias.
- No hay informacion publicada sobre sesgos especificos por idioma, dialecto, genero o grupo demografico, ni sobre tasas de error desagregadas.
- Cobertura idiomatica desigual: 12 idiomas de entrenamiento frente a 17 evaluados, sin desglose publico de resultados por idioma.
- No es un modelo generativo: no puede reformular, resumir ni reescribir contenido inseguro, solo clasificarlo.
- Licencia Apache-2.0, que permite uso comercial sin restricciones adicionales; el autor declara haber entrenado solo con datos que permiten uso comercial, pero recomienda verificar las licencias de los datasets de origen para el caso de uso concreto.
- Modelo con 0 descargas y 0 likes y sin validacion externa conocida: conviene tratarlo como un artefacto reciente y no como un estandar consolidado. La fecha de creacion registrada (2026-09-26) es posterior a la fecha habitual de publicacion, lo que conviene verificar.
- No reemplaza una politica de moderacion completa: es un componente de puntuacion y debe combinarse con revision humana en las categorias de mayor riesgo (`sexual_minors`, `self_harm`, `criminal_planning`).
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Horizon Labs: los enlaces encontrados corresponden a entidades homonimas no relacionadas (partidos politicos, asociaciones locales, VMware Horizon).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/content-safety-guard-base
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Guard de inyeccion de prompts de la misma familia: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Redactor de PII de la misma familia: https://huggingface.co/Horizon-Labs/pii-redactor-base
- Guard de alucinaciones de la misma familia: https://huggingface.co/Horizon-Labs/hallucination-guard-base
- Dataset de seguridad Nemotron: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset JailbreakBench JBB-Behaviors: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
