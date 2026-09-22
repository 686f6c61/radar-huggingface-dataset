# baerquants/OpenThinker3-7B

## Resumen

OpenThinker3-7B es un modelo de razonamiento de 7.000 millones de parámetros desarrollado por el equipo de Open Thoughts y publicado originalmente en el repositorio `open-thoughts/OpenThinker3-7B`. La ficha que se analiza aquí (`baerquants/OpenThinker3-7B`) es una réplica del mismo con licencia Apache 2.0. Se trata de un ajuste completo (full fine-tuning) por supervisión del modelo instructivo Qwen/Qwen2.5-7B-Instruct sobre el dataset abierto OpenThoughts3-1.2M.

El modelo resuelve el problema de disponer de un razonador de tamaño medio entrenado únicamente con datos abiertos y con SFT, sin necesidad de aprendizaje por refuerzo (RL). Según la model card, supera a DeepSeek-R1-Distill-Qwen-7B y a Llama-3.1-Nemotron-Nano-8B-v1 en varias pruebas de matemáticas y código, y mejora de forma clara a sus predecesores OpenThinker-7B y OpenThinker2-7B.

Su relevancia actual radica en dos factores: por un lado, demuestra que un pipeline de datos cuidadosamente diseñado (más de 1.000 experimentos de ablación) puede compensar la ausencia de RL; por otro, publica junto al modelo el paper arXiv:2506.04178, el dataset OpenThoughts3-1.2M y la herramienta de evaluación Evalchemy, lo que facilita la reproducibilidad completa de la receta de entrenamiento. La arquitectura es un transformer decoder-only de la familia Qwen2 (modelo denso, no MoE) con pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); modelo denso, ajuste supervisado completo |
| Parámetros totales | 7B nominales (heredados de Qwen2.5-7B-Instruct; el repositorio no publica el recuento exacto) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; se hereda la del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantización | no disponible; el repositorio publica únicamente pesos sin cuantizar. No se anuncian versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponibles (el campo de idiomas de la ficha está vacío) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, text-generation-inference y endpoints compatibles) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct (fine-tuning completo) |
| Dataset de entrenamiento | open-thoughts/OpenThoughts3-1.2M |
| Pipeline | text-generation |
| Framework de entrenamiento | Llama Factory; Transformers 4.46.1, PyTorch 2.3.0, Datasets 3.1.0, Tokenizers 0.20.3 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso con normalización RMSNorm, atención con sesgo de rotación posicional (RoPE) y proyecciones QKV con sesgo. No se han introducido cambios estructurales ni mecanismos de atención lineal, decodificación especulativa o arquitecturas híbridas en el ajuste; el trabajo del equipo se concentra íntegramente en los datos y en el procedimiento de ajuste supervisado.

El entrenamiento se realizó sobre OpenThoughts3-1.2M, un dataset de 1.200.000 ejemplos compuesto por 850.000 preguntas de matemáticas, 250.000 de código y 100.000 de ciencia. Las trazas de razonamiento del dataset fueron generadas con QwQ-32B. El ajuste fue un SFT completo, sin RL ni DPO, con los siguientes hiperparámetros: learning rate 8e-05, scheduler coseno con warmup ratio 0.1, 5 épocas, tamaño de batch total 512, optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), weight decay 0.0 y semilla 42. La model card indica el uso de 512 nodos A100 durante 48 horas (el campo `num_devices` de la configuración es 512). Según el autor, el rendimiento final procede de un pipeline de datos refinado mediante más de 1.000 experimentos de ablación, y no de técnicas de optimización por recompensa.

## Capacidades

- Generación de texto conversacional en formato instruct, con soporte de plantilla de chat de Qwen2.5.
- Razonamiento matemático de varios pasos: AIME24 (69,0), AIME25 (53,3), AMC23 (93,5), MATH500 (90,0), HMMT O2/25 (42,7) y JEEBench (72,4) según la model card.
- Generación y razonamiento sobre código: LiveCodeBench 06/24-01/25 (51,7), CodeElo (31,0) y CodeForces (32,2).
- Preguntas de ciencia de nivel avanzado: GPQA-D (53,7).
- Razonamiento de cadena larga (long chain-of-thought), característico de los modelos destilados de razonadores.
- Capacidades multilingües: no disponibles; la ficha no declara idiomas y el dataset de entrenamiento está mayoritariamente en inglés.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no documentado en la información proporcionada (el modelo se presenta como razonador, no como agente con uso de herramientas).
- Capacidades de visión o audio: no disponibles; es un modelo exclusivamente de texto.
- Modo thinking explícito con etiquetas separadas: no documentado en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos competitivos: el modelo está optimizado para ejercicios tipo AIME/AMC con cadenas de razonamiento largas, por lo que encaja en entornos de evaluación automática y en asistentes de estudio que necesitan justificar cada paso.
- Tutoría personalizada de matemáticas y física: dado su rendimiento en MATH500 y GPQA-D, puede generar explicaciones paso a paso y detectar errores en resoluciones de estudiantes, desplegado con vLLM o TGI.
- Generación de código asistida en producción: con 51,7 en LiveCodeBench, es adecuado para autocompletado, refactorización y generación de tests dentro de un IDE o de un pipeline de CI/CD, siempre con revisión humana del resultado.
- Verificación y revisión de código en pull requests: puede analizar un diff y razonar sobre posibles fallos lógicos, integrándose como paso adicional en un flujo de CI antes del merge.
- Generación de datasets sintéticos de razonamiento: al compartir linaje con OpenThoughts, sirve para producir trazas de razonamiento de matemáticas y código con las que ajustar modelos más pequeños, un uso coherente con la propia receta del proyecto.
- Chatbot técnico especializado en ciencia e ingeniería: con 53,7 en GPQA-D, resulta viable como asistente de consulta interna para preguntas de nivel posgrado en física, química y biología, con verificación de fuentes.
- Investigación en destilación y pipelines de datos: el modelo es un punto de comparación reproducible (paper, dataset y Evalchemy públicos) para estudiar cuánto rendimiento aporta la curación de datos frente a RL.
- Evaluación comparativa interna: puede actuar como referencia de 7B en suites propias de razonamiento, dado que el proyecto publica su metodología de evaluación con errores estándar.

## Benchmarks y rendimiento

Resultados declarados en la model card, evaluados con la herramienta abierta Evalchemy. Los valores en negrita en la tabla original son los que quedan a menos de dos errores estándar del mejor de cada columna.

| Modelo | AIME24 | AIME25 | AMC23 | MATH500 | HMMT O2/25 | LCB 06/24-01/25 | CodeElo | CodeForces | GPQA-D | JEEBench |
|---|---|---|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 30,7 | 22,0 | 72,5 | 82,8 | 15,7 | 26,1 | 11,1 | 14,9 | 38,6 | 45,3 |
| OpenThinker2-7B | 60,7 | 38,7 | 89,8 | 87,6 | 24,7 | 40,6 | 22,8 | 26,6 | 47,0 | 65,1 |
| **OpenThinker3-7B** | **69,0** | **53,3** | **93,5** | **90,0** | **42,7** | **51,7** | 31,0 | **32,2** | 53,7 | **72,4** |
| DeepSeek-R1-Distill-Qwen-32B | 51,3 | 38,0 | 92,0 | 88,0 | 25,0 | 34,5 | 19,9 | 21,1 | 33,2 | 50,4 |
| OpenR1-Distill-7B | 57,7 | 39,7 | 87,0 | 88,0 | 25,7 | 30,7 | 30,1 | 29,3 | **58,9** | 68,7 |
| Llama-3.1-Nemotron-Nano-8B-v1 | 62,0 | 48,0 | **94,0** | 89,4 | 26,7 | **50,9** | 30,9 | **32,9** | 52,9 | 70,7 |
| AceReason-Nemotron-7B | **71,0** | 50,7 | **93,8** | 89,8 | 33,3 | 44,3 | **32,9** | **30,9** | 52,9 | 64,3 |

Nota: el `model-index` del repositorio no contiene resultados estructurados (lista `results` vacía); todas las cifras anteriores proceden de la tabla de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones estándar para un modelo denso de 7B, no cifras publicadas por el autor): aproximadamente 15-16 GB en FP16/BF16, 8-9 GB en cuantización de 8 bits y 4,5-6 GB en cuantizaciones de 4 bits.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100, H200 y L40S. El entrenamiento reportado consumió 512 nodos A100 durante 48 horas, aunque la inferencia no requiere nada parecido.
- GPU de consumo: sí cabe. Con 4 bits funciona en RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 (24 GB) con margen para contexto largo. En FP16 necesita al menos 16 GB, por lo que encaja en RTX 4090, RTX 3090 y RTX 5090, pero no en tarjetas de 8-12 GB sin cuantizar.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta declarada), vLLM y SGLang para servido de alto rendimiento, y endpoints compatibles. Para llama.cpp, Ollama o LM Studio sería necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.
- Consideración operativa: las cadenas de razonamiento largas incrementan de forma notable el número de tokens de salida, lo que encarece la inferencia en producción frente a un modelo instruct convencional del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos abiertos | Disponibilidad |
|---|---|---|---|---|---|
| OpenThinker3-7B | 7B | no disponible (heredado de Qwen2.5-7B-Instruct) | apache-2.0 | Sí (OpenThoughts3-1.2M) | HuggingFace |
| OpenThinker2-7B | 7B | no disponible | no disponible | Sí | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | no disponible | No | HuggingFace |
| OpenR1-Distill-7B | 7B | no disponible | no disponible | Sí | HuggingFace |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | no disponible | no disponible | Sí | HuggingFace |
| AceReason-Nemotron-7B | 7B | no disponible | no disponible | Sí | HuggingFace |

En comparación directa, OpenThinker3-7B es el mejor de la tabla en AIME24, AIME25, AMC23, MATH500, HMMT O2/25, LiveCodeBench y JEEBench, y queda cerca del mejor en CodeElo y CodeForces. Destaca especialmente frente a DeepSeek-R1-Distill-Qwen-32B, que con más del cuádruple de parámetros obtiene resultados inferiores en casi todas las pruebas salvo AMC23. OpenR1-Distill-7B solo supera a OpenThinker3-7B en GPQA-D (58,9 frente a 53,7). Las licencias de los modelos comparados no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas de varios pasos y en dominios fuera de matemáticas, código y ciencia.
- Sesgos: no se documentan análisis de sesgo. El modelo hereda los sesgos del Qwen2.5-7B-Instruct base y de las trazas generadas por QwQ-32B, que no han sido auditadas en esta ficha.
- Sesgo de dominio en los datos: el dataset de entrenamiento está dominado por matemáticas (850.000 ejemplos frente a 250.000 de código y 100.000 de ciencia), por lo que el rendimiento fuera de esas áreas (humanidades, derecho, conversación general) puede ser inferior al de un instruct estándar del mismo tamaño.
- Idiomas: la ficha no declara idiomas soportados y el dataset es mayoritariamente en inglés; el rendimiento en castellano no está medido y debería validarse antes de usarlo en producción.
- Longitud de contexto: no se especifica en la información disponible; conviene verificar el límite real antes de diseñar flujos con documentos largos.
- Licencia: Apache 2.0, que permite uso comercial sin restricciones de pago, pero conviene revisar por separado las condiciones del dataset OpenThoughts3-1.2M si se va a redistribuir o reentrenar.
- Repositorio duplicado: `baerquants/OpenThinker3-7B` no es el repositorio del autor original (`open-thoughts/OpenThinker3-7B`). Tiene 0 descargas y 0 likes en el momento de la consulta, por lo que es recomendable verificar la integridad de los pesos y preferir el repositorio oficial como fuente.
- Validación pendiente: el `model-index` del repositorio no incluye resultados estructurados, de modo que las cifras de la tabla proceden de la model card y deberían reproducirse con Evalchemy antes de tomarlas como referencia interna.
- Coste de inferencia: el razonamiento de cadena larga multiplica los tokens generados y, con ello, la latencia y el coste por consulta.

## Enlaces

- Modelo en HuggingFace (réplica analizada): https://huggingface.co/baerquants/OpenThinker3-7B
- Modelo oficial del autor: https://huggingface.co/open-thoughts/OpenThinker3-7B
- Paper: https://arxiv.org/abs/2506.04178
- Blog post de OpenThoughts3: https://www.open-thoughts.ai/blog/ot3
- Repositorio GitHub: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelos predecesores: https://huggingface.co/open-thoughts/OpenThinker-7B y https://huggingface.co/open-thoughts/OpenThinker2-7B
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los enlaces recuperados corresponden a anuncios de caravanas y a tablas de neumáticos de vehículos, sin relación con OpenThinker3-7B, por lo que no se incluyen.
