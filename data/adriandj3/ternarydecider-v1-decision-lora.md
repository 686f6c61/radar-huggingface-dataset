# adriandj3/TernaryDecider-v1-Decision-LoRA

## Resumen

TernaryDecider v1 es un adaptador LoRA de 120.324.096 parámetros (rank 48, alpha 96, F16, 200 pares de tensores) que se monta sobre el modelo ternario prism-ml/Ternary-Bonsai-2-9B, un transformer de ~9.000 millones de parámetros cuantizado a 1,58 bits y vinculado a la familia Qwen3.5. No es un modelo de chat: convierte el modelo base en un clasificador de decisión que recibe estado, pregunta y un conjunto de opciones, y devuelve una probabilidad por opción leyendo el primer token de respuesta en un único forward pass. Lo desarrolla Adrian Ciprian Iancu (usuario adriandj3) y se publica bajo licencia Apache-2.0.

El problema que resuelve es concreto: los agentes locales necesitan decidir rápido y barato qué herramienta invocar, sobre qué elemento de la interfaz actuar o en qué estado está una página, y un modelo generativo grande falla y es caro para esa tarea. El adaptador se carga a escala 0 junto al modelo base y se activa solo en peticiones de decisión, de modo que el comportamiento conversacional no cambia. Según la model card, sube la precisión de decisión en inglés del 83,0 % al 96,0 % y en italiano del 72,0 % al 90,0 % en el conjunto System One, y del 78,8 % al 89,6 % en 13 conjuntos públicos de validación o test en cinco idiomas.

Su relevancia ahora es de despliegue: un adaptador de 241 MB en GGUF F16 que funciona con llama.cpp (fork de PrismML) sobre un modelo base ternario permite clasificación calibrada en hardware modesto y totalmente local, con la misma salida que la evaluación en PyTorch según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 48, alpha 96, F16, 200 pares de tensores) sobre transformer ternario de 1,58 bits de la familia Qwen3.5 |
| Parametros totales | 120.324.096 en el adaptador (safetensors); el modelo base Ternary-Bonsai-2-9B ronda los 9.000 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la hereda del modelo base; no se documenta en la model card) |
| Tipos de cuantizacion | Adaptador en F16 (GGUF); modelo base en ternario 1,58 bits |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA F16) y safetensors (adaptador); incluye calibration.json y directorios eval/ y training/ |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-gguf (relacion: adapter) |
| Tarea (pipeline) | text-classification (multiple-choice y si/no por lectura del primer token) |
| Calibracion | Temperatura softmax T = 1,25, ajustada en el conjunto de desarrollo |
| Tamano del repositorio | 0,2 GB (fichero LoRA GGUF de 241 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (rank 48, alpha 96) fusionado a partir de 3 semillas, con 200 pares de tensores en F16. Se aplica sobre Ternary-Bonsai-2-9B, un modelo base cuyos pesos operan en representación ternaria de 1,58 bits, lo que reduce drásticamente el coste de memoria del despliegue. La inferencia no genera texto libre: se formula la decisión como una pregunta de opción múltiple y se leen las probabilidades del primer token de respuesta, con una temperatura de softmax de 1,25 ajustada sobre el conjunto de desarrollo para calibrar la confianza. El autor indica que el recuento de aciertos del GGUF en llama.cpp coincide exactamente con su reevaluación en PyTorch en las 324 preguntas de agente comparadas.

El entrenamiento usa los splits de train de google/boolq, rajpurkar/squad_v2, google/civil_comments, mteb/amazon_massive_intent, qiaojin/PubMedQA, facebook/xnli, google-research-datasets/paws-x y google-research-datasets/paws-x, y la evaluación se hace siempre sobre los splits oficiales de validación o test. Los conjuntos propios de decisión de agente (System One, 100 preguntas por idioma, y 62 preguntas held-out) se excluyeron del entrenamiento por identificador y por redacción. No se documentan en la información disponible el volumen total de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; el pipeline es de ajuste supervisado sobre tareas de clasificación.

## Capacidades

- Clasificación por opción múltiple: devuelve una probabilidad calibrada por cada opción en un solo forward pass.
- Decisiones booleanas de tipo si/no (BoolQ, "¿es respondible esta pregunta?" en SQuAD 2.0).
- Enrutado de herramientas en agentes: elegir qué herramienta de solo lectura invocar en cada paso.
- Selección de elementos de interfaz y detección de estado de página web para agentes de navegador y de escritorio.
- Clasificación de intención de usuario con conjuntos de 8 etiquetas (MASSIVE), en inglés e italiano.
- Detección de toxicidad en comentarios (Civil Comments), con distribución balanceada tóxico/no tóxico.
- Equivalencia semántica y paráfrasis multilingüe (PAWS-X en de, en, es, fr; XNLI en el entrenamiento).
- Gradación y ranking de salidas de otros modelos mediante el mismo formato de opciones.
- Multilingüe en cinco idiomas: inglés, italiano, francés, español y alemán.
- No soporta tool calling generativo, agentes multi-paso por sí mismo ni modos de razonamiento extendido: es una capa de decisión, no un generador.

## Casos de uso

- Enrutado de herramientas en asistentes locales: el agente envía estado actual, pregunta y lista de herramientas disponibles, y el adaptador devuelve la probabilidad de cada una; con 40 preguntas de prueba en System One pasó de 25 a 36 aciertos en inglés y de 17 a 34 en italiano, lo que lo hace viable como primer filtro antes de invocar nada.
- Automatización de navegador y escritorio: decidir sobre qué elemento de la interfaz pulsar o en qué estado está la página (35 y 25 preguntas por conjunto en System One), integrándose en bucles de control donde la latencia de una generación completa sería prohibitiva.
- Moderación de comentarios: clasificación tóxico/no tóxico con etiquetas balanceadas, 91,3 % de precisión en el test de Civil Comments frente al 80,6 % del modelo base, adecuada como pre-filtro barato antes de una revisión humana o de un modelo mayor.
- Clasificación de intenciones en asistentes de voz o chatbots: 97,5 % en inglés y 96,7 % en italiano sobre 8 opciones del test de MASSIVE, suficiente para enrutar la petición al flujo conversacional correcto sin coste de API.
- Verificación previa en pipelines RAG: comprobar con BoolQ (89,8 %) si el contexto recuperado responde a la pregunta, o con SQuAD 2.0 (90,2 %) si la pregunta es respondible, antes de gastar una generación larga.
- Deduplicación y control de calidad de corpus multilingües: detección de paráfrasis con PAWS-X en alemán, español, francés e inglés, con ganancias de entre 14,6 y 16,7 puntos sobre el modelo base, útil para filtrar pares casi duplicados en pipelines de datos.
- Evaluación automática de respuestas de otros modelos: formular la comparación como opción múltiple y usar la probabilidad del primer token como puntuación de preferencia, con calibración fija (T = 1,25) para umbralizar decisiones.
- Despliegue en hardware antiguo: al apoyarse en un modelo base ternario de 1,58 bits y un adaptador de 241 MB, el conjunto es apto para entornos locales sin GPU de gama alta, que es el objetivo declarado del proyecto del autor (Vergilius).

## Benchmarks y rendimiento

Resultados declarados por el autor; "Base" es el adaptador cargado a escala 0 y "LoRA" a escala 1, con el mismo prompt y la misma lectura del primer token.

| Benchmark | Preguntas | Base | TernaryDecider v1 | Ganancia |
|---|---:|---:|---:|---:|
| System One, ingles | 100 | 83,0 % | 96,0 % | +13,0 |
| System One, italiano | 100 | 72,0 % | 90,0 % | +18,0 |
| Decisiones de agente held-out, ingles | 62 | 75,8 % | 93,5 % | +17,7 |
| Decisiones de agente held-out, italiano | 62 | 72,6 % | 88,7 % | +16,1 |
| 13 conjuntos publicos (validacion/test oficial) | 13.000 | 78,8 % | 89,6 % | +10,8 |

Desglose por conjunto público (1.000 preguntas por conjunto, semilla fija, leído con llama.cpp sobre el GGUF):

| Conjunto | Idioma | Base | TernaryDecider v1 | Ganancia |
|---|---|---:|---:|---:|
| BoolQ (validation) | en | 83,2 % | 89,8 % | +6,6 |
| Civil Comments, ¿toxico? (test) | en | 80,6 % | 91,3 % | +10,7 |
| MASSIVE intent, 8 opciones (test) | en | 91,2 % | 97,5 % | +6,3 |
| MASSIVE intent, 8 opciones (test) | it | 88,5 % | 96,7 % | +8,2 |
| PAWS-X (test) | de | 73,1 % | 89,8 % | +16,7 |
| PAWS-X (test) | en | 78,9 % | 93,5 % | +14,6 |
| PAWS-X (test) | es | 74,8 % | 89,6 % | +14,8 |
| PAWS-X (test) | fr | 73,4 % | 89,8 % | +16,4 |
| SQuAD 2.0, ¿respondible? (validation) | en | 83,1 % | 90,2 % | no disponible en el extracto |

En el desglose de System One por categoría, la mejora se concentra en la elección de herramienta (25/40 → 36/40 en inglés; 17/40 → 34/40 en italiano), mientras que la selección de elemento de interfaz en italiano retrocede ligeramente (32/35 → 31/35). El autor no publica resultados de PubMedQA ni de XNLI en el extracto disponible, pese a figurar como datasets de entrenamiento.

## Requisitos de hardware

- VRAM estimada para el modelo base: los 9.000 millones de parámetros en ternario de 1,58 bits implican del orden de 1,8 GB para los pesos (9e9 × 1,58 / 8), más embeddings y sobrecabecera de ejecución; una estimación de 2,5 a 3,5 GB en total es razonable, aunque el autor no publica cifras medidas.
- Adaptador: 241 MB en F16, cargado junto al modelo base; el coste adicional de VRAM es marginal.
- GPU recomendadas: no hay recomendaciones oficiales. Por el perfil del modelo base, cualquier GPU consumer con 6-8 GB o más debería poder alojarlo, y el adaptador no cambia ese requisito.
- CPU: el proyecto está pensado para ejecución local y hardware modesto mediante llama.cpp; el modelo ternario está diseñado para inferencia en CPU.
- Opciones de despliegue: llama.cpp con el fork de PrismML (soporte de pesos ternarios y de `--lora`); no se documenta soporte para vLLM, TGI, Ollama ni otros motores en la información disponible.
- Latencia y throughput: no disponibles como cifras medidas. Cualitativamente, la decisión se resuelve en un único forward pass y una lectura de token, sin decodificación autoregresiva.
- Verificación de paridad: en las 324 preguntas de agente evaluadas, el recuento de aciertos del GGUF en llama.cpp coincide con la reconstrucción en PyTorch (por ejemplo, held-out EN 47 → 58 y System One IT 72 → 90).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TernaryDecider v1 | 120 M (adaptador) sobre base de ~9 B | no disponible | Decisión por lectura del primer token, con calibración | Apache-2.0 | HuggingFace (adriandj3) |
| Ternary-Bonsai-2-9B (base, escala 0) | ~9 B | no disponible | Generación libre; sirve como línea base de decisión | no disponible en esta ficha (consultar el repo del modelo base) | HuggingFace (prism-ml) |
| TernaryPilot v1 | no disponible | no disponible | LoRA del mismo autor para uso de ordenador y navegador | no disponible | HuggingFace (adriandj3) |
| Microsoft-Decision-1 | no disponible | no disponible | Clasificación, enrutado, ranking, gradación y decisiones binarias, alojado | propietaria | Azure AI Foundry |

La comparación directa con modelos de clasificación dedicados (por ejemplo, encoder tipo DeBERTa o modelos de intención ligeros) no está disponible en la información proporcionada: no hay cifras de parámetros, latencia ni coste comparables publicadas por el autor.

## Limitaciones y advertencias

- No es un modelo de chat: solo responde en el formato de opción múltiple o si/no descrito, leyendo el primer token. Usarlo como generador produce resultados sin sentido.
- Depende de un motor específico: requiere el fork de llama.cpp de PrismML para pesos ternarios y carga de LoRA; no se documenta compatibilidad con vLLM, TGI u Ollama.
- La calibración (T = 1,25) está ajustada a un conjunto de desarrollo concreto; cambiar el formato del prompt o el orden de las opciones puede invalidar las probabilidades.
- Cobertura lingüística limitada a en, it, fr, es y de; no hay datos para portugués, neerlandés ni otras lenguas.
- El adaptador puede degradar categorías concretas: en selección de elemento de interfaz en italiano baja de 32/35 a 31/35 aciertos.
- Los conjuntos propios de evaluación son pequeños (100 y 62 preguntas), por lo que las ganancias de +13 a +18 puntos tienen intervalos de confianza amplios.
- Los conjuntos públicos se evalúan con 1.000 preguntas por set y semilla fija; no se publican intervalos de confianza ni varias semillas de evaluación.
- Riesgo de sesgo heredado de los datos: Civil Comments contiene sesgos demográficos conocidos en el etiquetado de toxicidad, y MASSIVE refleja la distribución de intenciones de un asistente virtual concreto.
- Riesgo de alucinación bajo en la tarea, pero la lectura de probabilidades puede producir confianza alta en decisiones erróneas si la pregunta se sale del formato esperado.
- Licencia Apache-2.0 para el adaptador; el uso comercial del conjunto depende también de la licencia del modelo base prism-ml/Ternary-Bonsai-2-9B, que no se detalla en la información disponible.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, ficha creada y actualizada el 28 de octubre de 2026.
- No se documentan el volumen de datos de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO, lo que dificulta reproducir el ajuste.

## Enlaces

- [Modelo en HuggingFace: adriandj3/TernaryDecider-v1-Decision-LoRA](https://huggingface.co/adriandj3/TernaryDecider-v1-Decision-LoRA)
- [Modelo base: prism-ml/Ternary-Bonsai-2-9B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf)
- [Perfil del autor en HuggingFace](https://huggingface.co/adriandj3)
- [GitHub del autor (ArtyomITA)](https://github.com/ArtyomITA)
- [Proyecto Vergilius, asistente local para el que se construyo el adaptador](https://github.com/ArtyomITA/vergilius)
- [Perfil de LinkedIn del autor](https://www.linkedin.com/in/adrian-ciprian-iancu-a2a477391)
- [TernaryPilot v1, LoRA del mismo autor para uso de ordenador y navegador](https://huggingface.co/adriandj3/TernaryPilot-v1-Computer-Browser-Use-LoRA)
- [Microsoft-Decision-1 en Azure AI Foundry, alternativa propietaria para tareas de decision](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-microsoft-decision)
- [Documentacion general de LoRA en Wikipedia](https://en.wikipedia.org/wiki/LoRA_(machine_learning))
