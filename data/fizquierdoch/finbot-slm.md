# fizquierdoch/finbot-slm

## Resumen

finbot-slm es un adaptador LoRA publicado por fizquierdoch sobre el modelo base HuggingFaceTB/SmolLM2-135M-Instruct, desarrollado en el marco de un taller de destilación de conocimiento del programa MIA de la Universidad Adolfo Ibáñez (UAI, Chile). El objetivo es transferir, mediante destilación desde un modelo profesor accesible vía API de OpenAI, la capacidad de responder preguntas de un dominio acotado: IA generativa aplicada a empresas chilenas (ajuste fino, ingeniería de prompts, RAG, agentes y uso responsable de datos).

Se trata de un modelo de lenguaje de 135 millones de parámetros con arquitectura transformer decoder-only, adaptado mediante PEFT/LoRA y entrenado con solo 60 pares pregunta-respuesta generados por el profesor. El resultado es un artefacto fundamentalmente didáctico: la evaluación sobre un examen fijo de 12 preguntas muestra una mejora marginal (nota media de 1,00 a 1,08 sobre 10, con 0 % de aprobación en ambos casos) y una reducción de la pérdida de entrenamiento de 3,1456 a 2,3472.

Su relevancia es educativa y metodológica, no de producción: ilustra el flujo completo de destilación (generación de datos sintéticos, ajuste con LoRA, evaluación antes/después con un conjunto fijo) ejecutable en CPU en aproximadamente 10 minutos. No debe confundirse con un modelo especializado listo para uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) con adaptador LoRA |
| Parámetros totales | 135M en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (depende del modelo base SmolLM2-135M-Instruct) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del base SmolLM2-135M-Instruct, un transformer decoder-only de 135M de parámetros, sobre el que se aplica un adaptador LoRA entrenado con la librería PEFT. La model card menciona un rango de "135M–360M" sin especificar la configuración exacta del adaptador (rango, alpha, módulos objetivo), por lo que estos hiperparámetros no están disponibles.

El entrenamiento consistió en destilación de conocimiento: un modelo profesor (accesible mediante la API de OpenAI, no identificado en la información) generó 60 ejemplos de pares pregunta-respuesta del dominio. El estudiante se ajustó sobre esos ejemplos y se evaluó con un examen fijo de 12 preguntas, idéntico antes y después del ajuste. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni el número de tokens de entrenamiento más allá de los 60 ejemplos citados. La corrida completa se ejecutó en CPU en aproximadamente 10 minutos.

## Capacidades

- Generación de texto en español orientada a preguntas y respuestas de un dominio acotado (IA generativa para empresas chilenas).
- Respuesta a preguntas sobre ajuste fino, ingeniería de prompts, RAG, agentes y uso responsable de datos, dentro de los límites del material de entrenamiento.
- Capacidad conversacional básica heredada de SmolLM2-135M-Instruct (formato instruct).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al español según la model card, aunque el base puede conservar parte de su competencia original en inglés.

## Casos de uso

- Demostración didáctica de destilación de conocimiento: el adaptador sirve para ilustrar en un aula el flujo completo (generación de datos con profesor, ajuste LoRA, evaluación con examen fijo antes/después) con resultados reproducibles en CPU.
- Práctica de evaluación de modelos: el examen fijo de 12 preguntas y las cifras reportadas permiten a estudiantes comparar metodologías de evaluación y discutir por qué una mejora de pérdida no se traduce en mejora de nota.
- Prototipado de asistentes de dominio muy restringido: para experimentar con formatos de respuesta sobre temáticas de IA generativa empresarial, siempre con verificación humana.
- Ejercicio de despliegue ligero: al ejecutarse en CPU, es adecuado para prácticas de integración con `transformers` y `peft` en entornos sin GPU.
- Pruebas de concepto de adaptadores PEFT: sirve como plantilla para cargar un adaptador sobre un base pequeño y medir latencia y calidad en entornos con recursos mínimos.
- Material de comparación en cursos sobre limitaciones de SLM: útil para mostrar empíricamente el efecto de un dataset de entrenamiento insuficiente (60 ejemplos) sobre la calidad final.

## Benchmarks y rendimiento

Los únicos datos publicados son los del examen fijo de 12 preguntas del propio taller:

| Métrica | Antes (base) | Después (destilado) |
|---|---|---|
| Nota media (1–10) | 1,00 | 1,08 |
| Aprobación (≥ 7) | 0 % | 0 % |
| Pérdida de entrenamiento | 3,1456 | 2,3472 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 135M de parámetros del base (aproximadamente 540 MB de pesos) más el adaptador LoRA, que es de tamaño reducido.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, pero el caso de uso declarado es CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: `transformers` + `peft` según el ejemplo de la model card; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica que la corrida de entrenamiento completa duró aproximadamente 10 minutos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| finbot-slm | 135M (base) + adaptador LoRA | No disponible | Apache 2.0 | Adaptador LoRA didáctico sobre SmolLM2-135M-Instruct, dominio IA para empresas chilenas | HuggingFace, 23 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | No disponible en esta ficha | Apache 2.0 | Modelo base instruct generalista | HuggingFace |
| SmolLM2-360M-Instruct | 360M | No disponible en esta ficha | Apache 2.0 | Modelo base instruct de mayor tamaño de la misma familia | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo muy pequeño (135M en el base) entrenado con solo 60 ejemplos: puede equivocarse, inventar datos y repetirse, según advierte el propio autor.
- El autor indica explícitamente que no debe usarse para decisiones reales.
- La evaluación muestra 0 % de aprobación tanto antes como después del ajuste; la mejora es marginal y no demuestra utilidad práctica.
- Hereda los sesgos del modelo base SmolLM2-135M-Instruct y de los datos generados por el profesor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el autor recomienda verificar siempre las respuestas con una fuente fiable.
- La model card contiene una plantilla sin completar ("Mejora estas dos frases con tu caso concreto"), lo que sugiere documentación incompleta.
- No se documentan hiperparámetros de LoRA, composición exacta del dataset ni identidad del modelo profesor.
- El alcance idiomático declarado es solo español; el comportamiento en otros idiomas no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fizquierdoch/finbot-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
