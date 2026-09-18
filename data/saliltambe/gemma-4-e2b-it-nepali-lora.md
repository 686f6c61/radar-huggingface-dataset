# saliltambe/gemma-4-E2B-it-nepali-lora

## Resumen

`saliltambe/gemma-4-E2B-it-nepali-lora` es un adaptador LoRA (PEFT) publicado por el usuario saliltambe sobre el modelo base `google/gemma-4-E2B-it`. Su objetivo es muy concreto: conseguir que el modelo responda en nepalí de forma incondicional, incluso cuando la petición se formula en inglés, sin necesidad de incluir un system prompt en cada llamada. Se trata, por tanto, de un artefacto de adaptación de comportamiento, no de un modelo nuevo entrenado desde cero.

La motivación declarada por el autor es la eficiencia en despliegue on-device: si el comportamiento "responde en nepalí" se destila en los pesos, se elimina el coste de prefill que supone enviar el system prompt en cada petición. El adaptador se entrenó con 468 pares de conversación de un solo turno, donde las entradas provienen de `OpenAssistant/oasst1` en inglés y las respuestas objetivo fueron generadas por el propio modelo base con el system prompt de idioma activado.

El resultado medido por el autor es un salto en la fracción media de caracteres en devanagari sobre 60 prompts de inglés reservados: de 0,000 en el modelo base a 0,814 con el adaptador, siempre sin system prompt. El repositorio ocupa 0,1 GB y se distribuye bajo licencia apache-2.0, con soporte declarado para nepalí e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-E2B-it`; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio del adaptador ocupa 0,1 GB) |
| Parametros activos | no aplicable (adaptador LoRA, no es un modelo MoE) |
| Longitud de contexto | no disponible; la longitud maxima de secuencia usada en entrenamiento fue 768 tokens |
| Tipos de cuantizacion | no disponible; entrenamiento en bf16 para el modelo base y fp32 para el adaptador LoRA |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | google/gemma-4-E2B-it |
| Rank / alpha / dropout | 16 / 32 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj (205 modulos, solo el decodificador de texto) |

## Arquitectura y entrenamiento

Tecnicamente se trata de un adaptador LoRA aplicado sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`) del decodificador de texto del modelo base, con un total de 205 módulos modificados. No se tocan módulos multimodales ni de otro tipo. La configuración de entrenamiento fue de rango 16, alpha 32 y dropout 0,05, con 3 épocas, tamaño de lote efectivo 16, tasa de aprendizaje 0,0002 y precisión mixta (bf16 para la base congelada, fp32 para el adaptador).

El proceso de creación es una destilación de system prompt, no un ajuste supervisado clásico sobre datos humanos. Las entradas son aperturas de conversación en inglés extraídas de `OpenAssistant/oasst1` (Apache-2.0, escritas por humanos), mientras que las salidas objetivo fueron generadas por `google/gemma-4-E2B-it` con el system prompt "You are a helpful AI assistant that answers in Nepali." Solo se conservaron 468 pares que superaron un filtro de calidad exigiendo una proporción de devanagari igual o superior a 0,7. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación; el interés técnico está en trasladar una instrucción de sistema al espacio de pesos para ahorrar tokens de prefill en inferencia.

## Capacidades

- Generación de texto conversacional en nepalí a partir de prompts en inglés, sin system prompt: es la capacidad central y la única validada de forma explícita por el autor.
- Cambio forzado de idioma de respuesta: sesga la salida hacia nepalí de forma incondicional en el escenario evaluado (fracción media de devanagari de 0,814 sobre 60 prompts reservados).
- Conservación de la capacidad del modelo base para responder en inglés cuando el adaptador no se activa o cuando se aplica una instrucción contraria lo bastante fuerte.
- Herencia del resto de capacidades del modelo base (razonamiento, código, matemáticas, etc.), aunque no se documentan ni evalúan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (dependería del modelo base).
- Soporte de agentes y razonamiento multi-paso: no evaluado; el entrenamiento se realizó solo con aperturas de conversación de un único turno.
- Capacidades multilingües: limitadas a nepalí e inglés según las etiquetas declaradas; no hay datos sobre otros idiomas.
- Capacidad especial: orientado a despliegue on-device mediante LiteRT-LM, según indica el propio autor.

## Casos de uso

- Asistentes de voz o chat en nepalí en dispositivos móviles: el adaptador elimina el system prompt de cada petición, lo que reduce el coste de prefill y encaja con despliegues LiteRT-LM donde los tokens de entrada se pagan en batería y latencia.
- Atención al cliente en nepalí para usuarios que escriben en inglés: al responder de forma incondicional en nepalí, se evita depender de que el prompt de sistema se propague correctamente en una cadena de middleware o gateway de API.
- Traducción implícita de consultas: un usuario anglófono puede formular la pregunta en inglés y recibir la respuesta en nepalí, útil en formularios de soporte o mesas de ayuda con personal nepalófono.
- Preprocesado en pipelines multilingües: como etapa de generación en nepalí dentro de un flujo mayor (resumen, clasificación posterior, traducción), usando el adaptador como componente especializado de idioma.
- Prototipado rápido de aplicaciones localizadas para el mercado nepalí: con 0,1 GB de adaptador y licencia apache-2.0, es viable experimentar sin reentrenar el modelo base completo.
- Investigación sobre destilación de system prompts: sirve como caso de estudio reproducible de cómo convertir una instrucción de sistema en pesos LoRA con solo 468 pares y medir el efecto con una métrica simple de script (proporción de devanagari).
- Despliegue en hardware con memoria limitada: al no requerir un modelo afinado completo adicional, el coste de almacenamiento es de 0,1 GB sobre el modelo base ya presente en el dispositivo.

## Benchmarks y rendimiento

El único resultado cuantitativo publicado por el autor es la fracción media de caracteres en devanagari sobre 60 prompts de inglés reservados, sin system prompt:

| Modelo | Fraccion media de devanagari |
|---|---|
| `google/gemma-4-E2B-it` (base) | 0,000 |
| base + este adaptador | 0,814 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica reportada mide la adherencia al idioma de salida, no la calidad factual ni la competencia lingüística en nepalí.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB; los requisitos reales de VRAM vienen determinados por el modelo base `google/gemma-4-E2B-it`, cuyas especificaciones no están disponibles en la información proporcionada.
- El nombre del modelo base (E2B) sugiere un tamaño efectivo del orden de 2.000 millones de parámetros, pero es una inferencia a partir de la nomenclatura y no un dato confirmado; los requisitos de VRAM deben calcularse a partir de la ficha oficial de Google.
- El adaptador en sí es despreciable en memoria (0,1 GB en disco, parámetros LoRA en fp32 durante el entrenamiento), por lo que no cambia la viabilidad del despliegue más allá del modelo base.
- GPU recomendadas: no disponibles para el modelo base en la información proporcionada; el propio autor orienta el caso de uso a despliegue on-device (LiteRT-LM), lo que implica hardware de móvil o edge más que GPU de centro de datos.
- Opciones de despliegue: `peft` + `transformers` con `PeftModel.from_pretrained` (patrón documentado por el autor), LiteRT-LM para on-device mediante el cuaderno de conversión que menciona el autor (no enlazado en la model card). Para vLLM, llama.cpp u Ollama habría que fusionar el adaptador en el modelo base y convertir el resultado; no está documentado en la información disponible.
- Latencia y throughput: no disponibles. El beneficio declarado es indirecto: al eliminar el system prompt de cada petición se ahorran los tokens de prefill correspondientes en cada llamada, de forma permanente.

## Comparativa con modelos similares

No hay datos de benchmarks ni de otros adaptadores comparables en la información disponible, por lo que la comparativa se limita al par base/adaptador:

| Modelo | Parametros | Contexto | Rendimiento (devanagari) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-E2B-it` | no disponible | no disponible | 0,000 | no disponible en la informacion | HuggingFace (modelo base) |
| base + `gemma-4-E2B-it-nepali-lora` | no disponible | no disponible | 0,814 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |

Frente a alternativas del mismo nicho (modelos afinados completos para nepalí u otros adaptadores LoRA de idioma), no se dispone de datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La calidad del nepalí es heredada del modelo base: el adaptador cambia qué idioma se usa, no cómo de bien se habla. No mejora la gramática, el vocabulario ni la corrección factual en nepalí.
- Los objetivos de entrenamiento fueron generados por el propio modelo base, por lo que cualquier error factual de la base quedó incorporado en los datos de ajuste.
- Un sesgo de idioma incondicional fuerte puede competir con una instrucción explícita en sentido contrario; el propio autor advierte de ello.
- El entrenamiento se hizo solo con aperturas de conversación de un único turno (468 pares), por lo que el comportamiento multi-turno largo no está probado y puede degradarse.
- Riesgo de alucinación: no cuantificado. Existe el riesgo habitual de los modelos generativos, agravado por el filtrado de datos generados por el modelo y no verificados por humanos.
- Sesgos conocidos: no documentados en la información disponible. Al derivar de `OpenAssistant/oasst1` y de salidas generadas por el modelo base, hereda los sesgos de ambas fuentes.
- Cobertura de idiomas limitada a nepalí e inglés; no hay evidencia de comportamiento correcto en otros idiomas, y el sesgo hacia nepalí puede degradar respuestas esperadas en inglés.
- Licencia apache-2.0 en el adaptador, pero el uso comercial del conjunto depende de los términos aplicables al modelo base `google/gemma-4-E2B-it`, que no se detallan en la información disponible y deben verificarse por separado.
- Madurez baja del artefacto: 0 descargas y 0 likes en el momento de la consulta, un único autor y una única métrica de evaluación. No hay validación independiente.
- La métrica de devanagari mide presencia de script, no precisión lingüística; un texto con muchos caracteres en devanagari puede seguir siendo incorrecto.
- La información de la búsqueda web realizada no contiene resultados relevantes sobre este modelo (los resultados obtenidos son páginas de soporte de Google y prensa de videojuegos en árabe, sin relación con el artefacto).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saliltambe/gemma-4-E2B-it-nepali-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de prompts: https://huggingface.co/datasets/OpenAssistant/oasst1
- Cuaderno de conversión para LiteRT-LM: mencionado en la model card, enlace no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
