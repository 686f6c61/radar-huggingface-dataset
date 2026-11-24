# Project-Bastion/prompt-injection-guard-large

## Resumen

prompt-injection-guard-large es un clasificador binario de texto desarrollado por Project-Bastion que detecta intentos de *prompt injection* en entradas dirigidas a modelos de lenguaje. Se construye sobre FacebookAI/roberta-large (355 millones de parámetros) y devuelve un margen de logits (`injection - benign`) en lugar de una probabilidad, lo que evita la saturación de la función softmax en la cola de baja tasa de falsos positivos. Es un modelo de una sola capa de defensa, no un sistema completo de guardrails.

El modelo aborda un problema concreto y creciente en despliegues de LLM: instrucciones maliciosas embebidas en datos que el modelo debe procesar (correos, páginas web, documentos recuperados en RAG). Su relevancia radica en que ofrece un AUROC de 0,947 en el conjunto de evaluación sellado PromptShield (mitad B, 11.744 prompts), superando a alternativas con cientos de miles de descargas como protectai/deberta-v3-base-prompt-injection-v2 (AUROC 0,705 en el mismo conjunto), aunque queda por detrás de Horizon-Labs en el punto operativo de baja tasa de falsos positivos.

La versión publicada es experimental (v0.1), con licencia Apache 2.0, soporte exclusivo de inglés y pesos en safetensors y ONNX (int8, ~360 MB) para ejecución local en navegador mediante transformers.js. La longitud máxima de entrada es de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder, clasificación de secuencias) |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncación en el tokenizador) |
| Tipos de cuantizacion | ONNX int8 (~360 MB); safetensors en precisión completa |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de FacebookAI/roberta-large para clasificación de secuencias con dos etiquetas (0 = benigno, 1 = inyección). La salida utilizada en producción es el margen de logits entre ambas clases, que el autor justifica como una forma de evitar la saturación de probabilidades y preservar resolución en la cola de baja tasa de falsos positivos. La entrada se trunca a 512 tokens.

El autor indica que entrenó sobre la partición de entrenamiento de PromptShield y que dividió el conjunto de test de ese benchmark por un hash del prompt: la mitad A se usó para desarrollo y la mitad B quedó reservada para la evaluación final. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un clasificador de este tipo). El autor advierte que el modelo es más débil que otras alternativas abiertas frente a *jailbreaks* y algunos ataques directos cortos, y que su tasa de falsos positivos depende del umbral y del estilo del prompt.

## Capacidades

- Clasificación binaria de texto: distingue entre prompt benigno e intento de prompt injection.
- Puntuación mediante margen de logits (`injection - benign`), adecuada para umbrales ajustables.
- Detección de instrucciones embebidas en datos que un LLM debe procesar (correos, documentos, contenido recuperado).
- Ejecución local en navegador mediante transformers.js con pesos ONNX int8 (~360 MB), sin enviar el texto a un servidor.
- Integración con la librería transformers (`AutoModelForSequenceClassification`) y con text-embeddings-inference según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés; el conjunto deepset incluye algunos textos en alemán y el modelo obtiene AUROC 0,980 en él, pero el soporte declarado es solo inglés.

## Casos de uso

- Filtrado de entrada en aplicaciones RAG: antes de insertar documentos recuperados en el contexto del LLM, se puntúa cada fragmento con el modelo y se descartan o marcan aquellos con margen superior al umbral configurado, reduciendo el riesgo de inyección indirecta.
- Moderación de prompts en atención al cliente automatizada: se evalúa cada mensaje del usuario antes de pasarlo al modelo generativo; con umbral > 2,8 se obtiene un 76% de recall con un 4,6% de falsos positivos en prompts largos de aplicación.
- Protección de agentes que procesan correo o web: se clasifican los cuerpos de correos y páginas antes de que el agente ejecute acciones derivadas de su contenido, como capa previa a un sistema de permisos.
- Evaluación por lotes de datasets de instrucciones: se puntúan grandes volúmenes de prompts para auditar corpus de entrenamiento o de evaluación en busca de inyecciones, aprovechando la inferencia rápida de un encoder de 355M.
- Demo y verificación en cliente: la versión ONNX int8 permite desplegar la comprobación en el navegador del usuario, útil para herramientas internas donde el texto no debe salir del dispositivo.
- Segunda opinión en un pipeline de guardrails: combinado con otros clasificadores, se usa como señal adicional de AUROC alto en prompts realistas de aplicación, aunque no debe ser la única capa por su debilidad frente a jailbreaks.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Evaluación sellada con margen de logits; umbral 0 equivale a p = 0,5.

PromptShield test, mitad B (11.744 prompts, 3.194 inyecciones):

| Modelo | AUROC [IC 95%] | TPR a 1% FPR | TPR a 0,1% FPR | recall / FPR / precision en umbral 0 |
|---|---|---|---|---|
| prompt-injection-guard-large (este modelo) | 0,947 [0,942-0,952] | 0,213 | 0,121 | 0,785 / 0,053 / 0,848 |
| protectai/deberta-v3-base-prompt-injection-v2 | 0,705 [0,694-0,714] | 0,024 | 0,000 | 0,037 / 0,017 / 0,453 |
| Horizon-Labs/prompt-injection-guard-base | 0,932 [0,925-0,939] | 0,657 | 0,387 | 0,759 / 0,027 / 0,914 |
| patronus-studio/wolf-defender-prompt-injection | 0,892 [0,887-0,898] | 0,302 | 0,160 | 0,308 / 0,011 / 0,914 |

Prompts cortos frescos (SalutefaceAAC/prompt-injection-classification test: 386 prompts, 241 inyecciones, mediana de 79 caracteres):

| Modelo | AUROC | recall en umbral 0 | FPR en umbral 0 |
|---|---|---|---|
| este modelo | 0,9975 | 0,967 | 0,000 |
| ProtectAI v2 | 0,9927 | 0,871 | 0,000 |
| Horizon-Labs | 0,9999 | 0,967 | 0,000 |
| wolf-defender | 0,9987 | 0,934 | 0,000 |

Conjuntos de desarrollo (no sellados), AUROC (TPR a 1% FPR entre paréntesis):

| Conjunto | este modelo | ProtectAI v2 | Horizon-Labs | wolf-defender |
|---|---|---|---|---|
| PromptShield test, mitad A | 0,945 (0,14) | 0,703 (0,005) | 0,931 (0,65) | 0,891 (0,28) |
| xTRam1/safe-guard test | 0,973 (0,59) | 0,992 (0,92) | 0,994 (0,90) | 0,999 (0,98) |
| deepset/prompt-injections test (116, parcialmente alemán) | 0,980 (0,88) | 0,902 (0,53) | 0,955 (0,77) | 0,960 (0,87) |
| neuralchemy test | 0,978 (0,51) | 0,976 (0,73) | 0,991 (0,84) | 0,971 (0,51) |
| jackhhao jailbreak test | 0,926 (0,37) | 0,979 (0,70) | 0,980 (0,71) | 0,995 (0,84) |

Umbrales calibrados en la mitad A y aplicados a la mitad B:

| FPR objetivo | Umbral de margen | FPR en mitad B | TPR en mitad B |
|---|---|---|---|
| ~5% | > 2,8 | 4,6% | 76% |
| ~2% | > 9,1 | 1,4% | 51% |
| ~1% | > 9,8 | 0,4% | 15% |

## Requisitos de hardware

- Inferencia en FP32: ~1,4 GB de VRAM (355M parámetros × 4 bytes), más memoria para activaciones; cabe en GPUs consumer con 4 GB o más.
- Inferencia ONNX int8: ~360 MB, ejecutable en CPU y en navegador mediante transformers.js.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; A100/H100 no son necesarias para un encoder de este tamaño.
- Cabe en GPU consumer y en CPU: sí, en ambos casos, incluso con cuantización int8 en dispositivos modestos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js, text-embeddings-inference (según tags); vLLM, llama.cpp, Ollama y TGI no están indicados en la información disponible para este modelo de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC PromptShield mitad B | TPR a 1% FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| prompt-injection-guard-large | 355M | 512 tokens | 0,947 | 0,213 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| Horizon-Labs/prompt-injection-guard-base | no disponible | no disponible | 0,932 | 0,657 | no disponible | Hugging Face |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible (DeBERTa-v3-base) | no disponible | 0,705 | 0,024 | no disponible | Hugging Face (367k descargas) |
| patronus-studio/wolf-defender-prompt-injection | no disponible | no disponible | 0,892 | 0,302 | no disponible | Hugging Face |

Lectura comparativa: este modelo lidera en AUROC sobre prompts realistas de aplicación, pero Horizon-Labs es claramente superior en el punto operativo de 1% FPR (0,657 frente a 0,213) y en falsos positivos con el umbral por defecto. Frente a jailbreaks, este modelo es el más débil de los cuatro.

## Limitaciones y advertencias

- Es una capa de defensa, no un sistema completo: el autor lo declara explícitamente insuficiente por sí solo.
- Más débil que otras alternativas abiertas frente a jailbreaks (AUROC 0,926 en jackhhao frente a 0,979-0,995 de los competidores).
- TPR bajo en el punto de 1% FPR (0,213) en prompts realistas; Horizon-Labs triplica ese valor.
- Los umbrales calibrados en prompts largos no transfieren a prompts cortos: con el umbral de 1,4% FPR solo se detecta el 16% de ataques en el conjunto corto.
- Los scores se saturan cerca de un margen de 10 (modelo sobreconfiado), lo que embota la cola de muy baja tasa de falsos positivos.
- Solo inglés declarado; el rendimiento en otros idiomas no está garantizado aunque el conjunto deepset incluya algo de alemán.
- Riesgo de alucinación no aplicable como tal (es un clasificador), pero sí de falsos negativos y falsos positivos según el umbral y el estilo del prompt.
- Sesgos específicos del corpus de entrenamiento (PromptShield) no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la versión es experimental (v0.1) y el autor no ofrece garantías de robustez en producción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-Bastion/prompt-injection-guard-large
- Demo en navegador (transformers.js, ONNX int8): https://huggingface.co/spaces/Project-Bastion/prompt-injection-guard-large-demo
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Conjunto de evaluación corto: https://huggingface.co/datasets/SalutefaceAAC/prompt-injection-classification
- Conjunto deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Modelo comparado protectai/deberta-v3-base-prompt-injection-v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Modelo comparado Horizon-Labs/prompt-injection-guard-base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Modelo comparado patronus-studio/wolf-defender-prompt-injection: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
