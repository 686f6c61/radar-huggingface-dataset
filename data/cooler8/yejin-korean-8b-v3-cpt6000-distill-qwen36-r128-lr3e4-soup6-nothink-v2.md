# cooler8/yejin-korean-8b-v3-cpt6000-distill-qwen36-r128-lr3e4-soup6-nothink-v2

## Resumen

Yejin Korean 8B v3 (cpt6000 + destilación de Qwen3.6-27B, r128/lr3e-4, soup6, nothink-v2) es un modelo de lenguaje de 7.241.740.288 parámetros (≈7,24 B) especializado en instrucciones en coreano, publicado por el desarrollador independiente cooler8 bajo licencia Apache 2.0. No parte de un modelo preentrenado de terceros: su base, `cooler8/yejin-korean-8b-v3-base`, se preentrenó desde cero sobre un corpus bilingüe coreano-inglés y después recibió 6.000 pasos de preentrenamiento continuado sobre datos públicos en coreano.

La variante que nos ocupa aplica un *model soup* (promediado uniforme de pesos) sobre seis ajustes LoRA entrenados con distintas configuraciones —tres a rango 128 y learning rate 2e-4, tres a rango 64 y learning rate 3e-4, cada uno con un orden de datos diferente— sobre el modelo base ya provisto del *chat vector* de su propio modelo SFT. Parte del entrenamiento es destilación a nivel de secuencia: 39.290 soluciones cortas en coreano generadas por Qwen/Qwen3.6-27B y filtradas para conservar solo las que alcanzan la respuesta correcta, sin transferir pesos ni logits del profesor.

El resultado es un modelo de chat orientado a conversación y resolución de problemas en coreano, con una plantilla que fuerza un bloque `<think>` vacío (de ahí el sufijo *nothink*): el modelo responde directamente, sin traza de razonamiento visible. Es relevante para quien busque un modelo pequeño, con licencia permisiva y entrenamiento auditable en coreano, aunque su adopción es prácticamente nula (0 descargas, 0 *likes* en el momento de la consulta) y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *decoder-only*; la model card no la detalla y la etiqueta de HuggingFace incluye `qwen3` |
| Parametros totales | 7.241.740.288 (≈7,24 B) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | No disponible (la ficha de un modelo hermano, Yejin Korean 8B V3 SFT v4, menciona 4K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; el ejemplo de uso carga los pesos en `bfloat16`. Cuantización posible vía bitsandbytes o conversión propia a GGUF |
| Idiomas soportados | Coreano (`ko`); el modelo base se describe como bilingüe coreano-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 29,0 GB, superior a los ≈14,5 GB que ocuparían los pesos en bf16, lo que sugiere fp32 o ficheros adicionales) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: solo indica que el modelo base fue preentrenado desde cero y la etiqueta `qwen3` de HuggingFace apunta a una arquitectura de la familia Qwen3 (transformer denso, sin mezcla de expertos). El pipeline de entrenamiento tiene tres etapas encadenadas. Primero, preentrenamiento desde cero de `yejin-korean-8b-v3-base` sobre un corpus bilingüe coreano-inglés curado. Segundo, 6.000 pasos de preentrenamiento continuado sobre datos públicos en coreano y aplicación del *chat vector* extraído de un modelo SFT propio del autor. Tercero, seis ajustes LoRA independientes sobre esa base: tres con rango 128 y learning rate 2e-4 y tres con rango 64 y learning rate 3e-4, cada uno con un orden distinto de los datos, promediados posteriormente con un *model soup* de pesos uniforme.

Los datos de los LoRA combinan 45.013 muestras del formato de fase 1 del autor con 39.290 soluciones cortas en coreano generadas por Qwen/Qwen3.6-27B (Apache-2.0) para preguntas de un generador de puzles propio, del split de entrenamiento de KMMLU y de exámenes escolares y comprensión lectora de AI Hub. Solo se conservaron las soluciones que llegaban a la respuesta conocida, lo que constituye una destilación a nivel de secuencia sin acceso a pesos ni logits del profesor. El autor declara que no se usaron ítems de test de benchmarks y que las soluciones del profesor no comparten ningún 13-grama de palabras con KMMLU-Pro, el test de KMMLU, CLIcK, MuSR ni Korean MuSR, como control de contaminación.

## Capacidades

- Generación de texto conversacional en coreano con plantilla de chat propia (`<|user|>`, `<|assistant|>`, `<|end|>`).
- Seguimiento de instrucciones en coreano, entrenado explícitamente sobre formato de instrucción y respuestas de estilo solución.
- Resolución de problemas de opción múltiple y de respuesta corta, por la composición del dataset (KMMLU train, exámenes escolares de AI Hub).
- Comprensión lectora en coreano: el corpus de destilación incluye preguntas de comprensión lectora de AI Hub.
- Razonamiento tipo puzle: parte de los datos proviene de un generador de puzles del propio autor.
- Modo *nothink*: la plantilla inserta un bloque `<think> </think>` vacío, de modo que el modelo genera la respuesta directamente sin traza de razonamiento intermedia.
- No se documentan *tool calling*, uso de agentes, visión, audio ni capacidades multimodales.

## Casos de uso

- **Atención al cliente en coreano**: despliegue de un asistente de primera línea para consultas frecuentes de usuarios coreanohablantes, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales y un tamaño de 7,24 B que abarata el *hosting*.
- **Tutor educativo para exámenes coreanos**: el modelo se entrenó con exámenes escolares de AI Hub y con el split de entrenamiento de KMMLU, por lo que es adecuado para generar explicaciones y respuestas a preguntas de estilo académico en coreano.
- **Generación de datos sintéticos en coreano**: usar el modelo como generador de pares pregunta-respuesta o de soluciones cortas para aumentar datasets de ajuste fino, aprovechando que su entrenamiento ya incluyó filtrado por corrección de respuesta.
- **Prototipado rápido de productos en coreano**: integración vía `transformers` en un script de pocas líneas (el ejemplo de la model card cabe en un bloque de diez líneas) para validar una idea de producto antes de invertir en un modelo mayor.
- **Base para ajuste fino posterior (LoRA/QLoRA)**: al ser Apache 2.0 y estar disponible en safetensors, se puede reentrenar con técnicas de bajo rango para dominios verticales (legal, sanitario, soporte interno) sin partir de cero.
- **Evaluación comparativa de modelos coreanos**: útil como línea base de 7 B en pruebas internas de calidad en coreano, especialmente porque su receta de datos está documentada y libre de contaminación declarada en KMMLU, CLIcK y MuSR.
- **Resumen y reescritura de documentación en coreano**: tareas de condensación de textos largos dentro de los límites de contexto reales del modelo (no confirmados), con revisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo declara controles de contaminación (ausencia de solapamiento de 13-gramas con KMMLU-Pro, test de KMMLU, CLIcK, MuSR y Korean MuSR) y la exclusión de ítems de test en el entrenamiento, pero no ofrece cifras de MMLU, KMMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware

- **VRAM en bf16/fp16**: aproximadamente 14,5 GB solo para pesos (cálculo a partir de 7.241.740.288 parámetros × 2 bytes), más caché KV; presupuestar 18-22 GB para contexto moderado.
- **GPU de datacenter**: A100 40 GB, A100 80 GB, H100 80 GB para servir con contexto largo o varios usuarios concurrentes.
- **GPU de consumo**: sí cabe en RTX 4090, RTX 3090, RTX A6000 y similares con 24 GB o más en precisión completa. En GPUs de 12-16 GB hace falta cuantización.
- **Cuantización**: en 8 bits los pesos bajan a ≈7,3 GB y en 4 bits a ≈4 GB (estimación teórica); no hay versiones GGUF, AWQ ni GPTQ publicadas, por lo que habría que generarlas.
- **Opciones de despliegue**: `transformers` con `device_map="auto"` y `torch_dtype="bfloat16"` (única vía documentada por el autor); vLLM y TGI son viables si la arquitectura efectiva es compatible, aunque no están verificados en la información disponible. llama.cpp u Ollama requerirían conversión manual a GGUF.
- **Latencia y throughput**: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Yejin Korean 8B v3 soup6 nothink-v2 (este) | 7,24 B | No disponible | Apache 2.0 | Sin benchmarks publicados |
| Qwen2.5-7B-Instruct | ≈7,6 B | 32K nativo (hasta 128K con YaRN) | Apache 2.0 | No evaluado aquí; sin datos comparables en esta ficha |
| Llama 3.1 8B Instruct | 8 B | 128K | Licencia comunitaria Llama 3.1 | No evaluado aquí; sin datos comparables en esta ficha |
| EXAONE 3.5 7.8B Instruct | 7,8 B | 32K | Licencia EXAONE no comercial | No evaluado aquí; sin datos comparables en esta ficha |

Nota: los datos de las alternativas son especificaciones públicas de sus respectivas model cards y no se han verificado en la búsqueda realizada. La diferencia práctica más relevante es la licencia: Apache 2.0 en este modelo y en Qwen2.5, frente a la restricción no comercial de EXAONE. No existe comparación de rendimiento posible sin resultados publicados por el autor.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay ninguna métrica objetiva que permita estimar la calidad real frente a alternativas; la adopción es nula (0 descargas, 0 *likes*), lo que implica ausencia de validación externa.
- **Riesgo de alucinación**: es un modelo de 7,24 B ajustado con instrucciones y entrenado parcialmente con destilación; no se documenta ninguna técnica de mitigación (RLHF, DPO, verificación factual) y el filtrado del profesor solo garantiza que la respuesta final era correcta, no el razonamiento intermedio.
- **Idioma**: la model card declara únicamente coreano. Aunque el modelo base se describe como coreano-inglés, no hay garantía de calidad en inglés ni en otras lenguas, y menos aún en castellano.
- **Contexto desconocido**: la ventana de contexto no se especifica. La referencia de 4K de un modelo hermano sugiere un límite corto, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Formato de chat propietario**: la plantilla usa tokens propios (`<|user|>`, `<|assistant|>`, `<|end|>`) y no sigue el formato ChatML habitual; hay que usar `apply_chat_template` para evitar degradación de la calidad.
- **Modo *nothink* forzado**: el bloque `<think>` va vacío en la plantilla, por lo que no se obtiene traza de razonamiento; no debe esperarse capacidad de *chain-of-thought* explícito.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene revisar las condiciones de los datos de origen de terceros citados en el entrenamiento (KMMLU, AI Hub) si se redistribuye el modelo o derivados.
- **Repositorio de 29 GB**: el tamaño es el doble de lo esperado para pesos en bf16, lo que puede indicar fp32 o artefactos adicionales; verificar antes de descargar en entornos con disco limitado.
- **Autor único e independiente**: no hay garantía de soporte, mantenimiento ni actualizaciones de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt6000-distill-qwen36-r128-lr3e4-soup6-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Variante LoRA relacionada (rango 64, lr 2e-4): https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt6000-distill-qwen36-lora-lr2e4-nothink-v2
- Ficha en LLM Explorer del modelo SFT v4: https://llm-explorer.com/model/cooler8%2Fyejin-korean-8b-v3-sft-v4,2Y6CYkcnNRCPvNQHut335M
- Registro en free2aitools (variante LoRA): https://free2aitools.com/model/cooler8/yejin-korean-8b-v3-cpt6000-distill-qwen36-lora-lr2e4-nothink-v2
- Registro en free2aitools (SFT): https://free2aitools.com/model/cooler8/yejin-korean-8b-v3-sft
