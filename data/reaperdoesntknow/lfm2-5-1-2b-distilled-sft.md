# reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT

## Resumen

LFM2.5-1.2B-Distilled-SFT es un modelo de lenguaje de 1.304.558.336 parámetros (1,2B) desarrollado por el usuario `reaperdoesntknow` bajo el paraguas de Convergent Intelligence LLC (Research Division). Se construye sobre `liquid/LFM2.5-1.2B-Instruct` de Liquid AI mediante un pipeline de dos etapas: destilación de conocimiento desde un profesor MoE híbrido de 24B (`liquid/LFM2-24B-A2B`) sobre datos de cadena de pensamiento STEM, seguida de un ajuste supervisado fino (SFT) en inferencia lógica formal. El modelo conserva la arquitectura híbrida SSM + atención de la familia LFM2.5, lo que le permite operar en CPU y dispositivos de borde con requisitos de memoria reducidos.

La relevancia del modelo radica en su enfoque: es la primera canalización publicada que combina destilación ponderada por prueba (proof-weighted distillation) con SFT sobre una arquitectura no transformer. El autor sostiene que los componentes SSM se alinean de forma natural con la propagación secuencial de estado que exige la inferencia lógica proposicional, y el SFT se emplea para activar explícitamente esa alineación. El resultado es un modelo pequeño orientado a razonamiento STEM estructurado e inferencia lógica formal, con licencia Apache 2.0 y pesos en safetensors.

El modelo declara 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, con un consumo de RAM inferior a 1 GB. Estas cifras, junto con su tamaño de 1,2B, lo sitúan en la categoría de modelos para despliegue en borde, IoT y dispositivos móviles. La longitud de contexto de entrenamiento es de 1024 tokens, un valor limitado que condiciona sus casos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrida SSM + atención) |
| Parametros totales | 1.304.558.336 (1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | GGUF disponible en repo separado; no se detallan los niveles concretos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repo secundario |
| Modelo base | liquid/LFM2.5-1.2B-Instruct |
| Modelo profesor | liquid/LFM2-24B-A2B |
| Precisión de entrenamiento | bf16 |
| Desarrollador | Reaperdoesntrun / Convergent Intelligence LLC (Research Division) |
| Tamaño del repo | 2,6 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura LFM2.5, una combinación híbrida de modelos de espacio de estados (SSM) y mecanismos de atención. Esta arquitectura sustituye parcialmente la atención cuadrática por capas recurrentes de estado, lo que reduce el coste computacional y de memoria en secuencias largas y permite inferencia eficiente en CPU. El modelo base es `liquid/LFM2.5-1.2B-Instruct`, y el profesor es `liquid/LFM2-24B-A2B`, un MoE híbrido de 24B con solo 2B de parámetros activos por token. Al compartir arquitectura, la divergencia KL entre profesor y estudiante transfiere patrones de razonamiento de forma más directa.

El entrenamiento se divide en dos etapas. La primera es una destilación de conocimiento sobre 2.802 muestras de cadena de pensamiento STEM de cinco dominios: álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matemáticas (576) y mecánica clásica (343), todas del usuario `0xZee`. La función de pérdida combina una entropía cruzada ponderada por prueba (55%, con peso 2,5 → 1,5 sobre tokens de derivación) y una divergencia KL de destilación (45%, T=2.0, escalada por T²). Se entrena 1 época con batch efectivo de 8, learning rate 1,5e-5 → 1e-6 con decaimiento coseno y precisión bf16. La segunda etapa es un SFT sobre `KK04/LogicInference_OA`, una reproducción del dataset LogicInference de Santiago Ontañón (Google Research) en formato de instrucción, con 5.491 problemas únicos de inferencia extendidos a ~54.607 pares instrucción-respuesta. Se entrena 1 época con batch efectivo de 8, learning rate 5e-6 (conservador para preservar el backbone), gradient checkpointing y bf16.

La innovación técnica declarada es la combinación de destilación ponderada por prueba con SFT sobre una arquitectura no transformer, además del uso de la alineación inductiva entre los componentes SSM y las cadenas de lógica proposicional. No se mencionan técnicas de decodificación especulativa ni atención lineal más allá de la propia arquitectura híbrida.

## Capacidades

- Generación de texto causal con plantilla de chat e instrucciones.
- Razonamiento STEM estructurado con derivaciones paso a paso en matemáticas, física y álgebra lineal.
- Cadena de pensamiento (chain-of-thought) explícita en formato `Problem / Proof / Final Answer`.
- Inferencia lógica formal en formato `### Instruction / ### Response`, con premisas y conclusión.
- Razonamiento multi-paso secuencial, apoyado en la propagación de estado de los componentes SSM.
- Capacidad conversacional básica heredada del modelo base Instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de razonamiento estructurado (thinking) implícito mediante cadenas de derivación; sin visión ni audio.

## Casos de uso

- Tutoría de matemáticas y física en dispositivo: el modelo puede generar derivaciones paso a paso de problemas de álgebra lineal, ecuaciones diferenciales o mecánica clásica directamente en un móvil o tableta, gracias a su consumo inferior a 1 GB de RAM y a sus 82 tok/s en NPU móvil.
- Asistente de lógica formal en entornos educativos: con el formato `### Instruction / ### Response` puede resolver problemas de inferencia proposicional a partir de premisas, útil para cursos de lógica o preparación de exámenes.
- Verificación de razonamiento en pipelines de CI: al ser determinista con `do_sample=False` y ligero, puede integrarse como comprobador de derivaciones matemáticas en flujos de revisión automatizada de contenido técnico.
- Despliegue en IoT y sistemas embebidos: su arquitectura híbrida SSM + atención y sus 239 tok/s en CPU AMD permiten ejecutar razonamiento STEM en gateways o dispositivos sin GPU dedicada.
- Generación de explicaciones técnicas en documentación: puede producir pasos intermedios de derivación para manuales de ingeniería o material docente, con la plantilla de prueba para mantener el formato estructurado.
- Prototipado rápido de asistentes STEM sin infraestructura GPU: al caber en menos de 1 GB de RAM y ofrecer versiones GGUF, se puede desplegar con llama.cpp u Ollama en portátiles convencionales para pruebas de concepto.
- Filtrado y clasificación de razonamiento lógico: el SFT en inferencia lógica permite usarlo como componente de verificación de cadenas de premisas en sistemas de reglas o motores de decisión simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de inferencia: 239 tok/s en CPU AMD, 82 tok/s en NPU móvil y consumo de RAM inferior a 1 GB. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros en bf16 el peso ronda los 2,4 GB, y en cuantizaciones GGUF de 4 bits podría situarse por debajo de 1 GB, en línea con la afirmación del autor de "sub-1GB RAM".
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y NPU, por lo que cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutarlo en bf16.
- ¿Cabe en GPU consumer? Sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; no se confirma con datos del autor.
- Opciones de despliegue: transformers (código de ejemplo en la model card), llama.cpp u Ollama mediante los GGUF del repo `reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF`. vLLM y TGI no se mencionan.
- Latencia y throughput: 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, según el autor. No se aportan latencias por token ni métricas de time-to-first-token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Distilled-SFT | 1,2B | 1024 | Híbrida SSM + atención | Apache 2.0 | Destilado de LFM2-24B-A2B, SFT en lógica |
| liquid/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | Híbrida SSM + atención | Apache 2.0 | Modelo Instruct original, sin destilación STEM específica |
| liquid/LFM2-24B-A2B (profesor) | 24B (2B activos) | no disponible | MoE híbrida SSM + atención | no disponible | Profesor de la destilación; mucho mayor y no apto para borde |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoría. La comparativa se limita a parámetros, arquitectura y licencia.

## Limitaciones y advertencias

- Contexto muy limitado: 1024 tokens de entrenamiento, insuficiente para conversaciones largas, documentos extensos o razonamientos con muchas premisas encadenadas.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en producción multilingüe requeriría evaluación adicional.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir derivaciones matemáticas plausibles pero incorrectas; no debe usarse sin verificación en contextos críticos.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre datasets académicos de `0xZee` y `KK04`, puede heredar sesgos de composición y estilo de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base y del profesor.
- Especialización estrecha: el SFT en lógica y la destilación STEM pueden degradar capacidades generales del modelo Instruct original; no se aportan evaluaciones que cuantifiquen esa posible regresión.
- Sin benchmarks publicados: la ausencia de métricas estándar impide validar las afirmaciones de rendimiento del autor más allá de las cifras de throughput.
- Modelo de nicho con pocas descargas (1.989) y 0 likes: comunidad reducida, lo que limita el soporte y la validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- Versión GGUF: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF
- Modelo base: https://huggingface.co/liquid/LFM2.5-1.2B-Instruct
- Modelo profesor: https://huggingface.co/liquid/LFM2-24B-A2B
- Dataset de inferencia lógica: https://huggingface.co/datasets/KK04/LogicInference_OA
- Paper de LogicInference (Santiago Ontañón): https://openreview.net/pdf?id=HAGeIS_Lcg9
- Perfil del autor de datasets STEM: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
