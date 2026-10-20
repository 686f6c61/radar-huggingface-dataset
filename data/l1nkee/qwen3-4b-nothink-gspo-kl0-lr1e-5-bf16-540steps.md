# L1nkee/Qwen3-4B-NoThink-GSPO-KL0-LR1e-5-bf16-540steps

## Resumen

Qwen3-4B-NoThink-GSPO-KL0-LR1e-5-bf16-540steps es un ajuste fino por refuerzo del modelo denso Qwen/Qwen3-4B (4.022.468.096 parámetros reales según los safetensors), publicado por el usuario L1nkee. El entrenamiento aplica GSPO (una variante de PPO que aplica el recorte de la ratio de importancia a nivel de secuencia en lugar de token) sobre el dataset de matemáticas BytedTsinghua-SIA/DAPO-Math-17k, con la función de recompensa limitada a la corrección de la respuesta final verificada por Math-Verify (1/0). El resultado es una variante con el modo "thinking" desactivado: el modelo responde sin cadena de razonamiento explícita, buscando la respuesta directa.

El interés de esta ficha es doble. Por un lado, es un artefacto de investigación reproducible: el autor publica no solo el paso final (540) sino 54 ramas con cada checkpoint intermedio (`step-10` a `step-540`), lo que permite estudiar la curva de aprendizaje de RL en un modelo pequeño. Por otro, sirve como referencia de receta: tasa de aprendizaje constante de 1e-5 sin warmup, penalización KL y bonus de entropía a 0, weight decay 0.1 y agregación de pérdida seq-mean-token-mean.

Se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, con licencia Apache 2.0 y pesos únicamente en bf16 safetensors. Su relevancia práctica está acotada a razonamiento matemático directo en un tamaño que cabe en GPU de consumo, no a uso generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (hereda la configuración de Qwen/Qwen3-4B); detalles de capas, cabezas y atención no disponibles en la información proporcionada |
| Parámetros totales | 4.022.468.096 (4,02 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó un máximo de 2.048 tokens de prompt y 8.192 de respuesta |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos bf16 en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (fusionados desde los checkpoints FSDP); tamaño del repositorio 434,4 GB por las 54 ramas de checkpoint |
| Modelo base | Qwen/Qwen3-4B |
| Modo de razonamiento | Desactivado ("NoThink"): sin cadena de pensamiento explícita |
| Pasos de entrenamiento | 540 (4 épocas sobre DAPO-Math-17k, 135 pasos por época) |

## Arquitectura y entrenamiento

La arquitectura de red es la del modelo base Qwen3-4B, un transformer decoder-only denso de 4.022 millones de parámetros; esta ficha no dispone del detalle de capas, dimensionalidad, tipos de atención ni tokenizador. Lo que sí diferencia a este checkpoint es el procedimiento de ajuste: RL con GSPO, que aplica el recorte estilo PPO sobre la ratio de importancia agregada a nivel de secuencia (clip range 3e-4 / 4e-4), con ventaja calculada sobre la línea base de grupo de GRPO normalizada por la desviación típica del grupo. La pérdida se agrega como seq-mean-token-mean y la recompensa es binaria, basada en la corrección de la respuesta matemática verificada con Math-Verify.

La configuración es deliberadamente simple y agresiva: learning rate constante de 1e-5 sin warmup, weight decay 0.1, penalización KL de 0 y bonus de entropía de 0. El lote es de 128 prompts con 8 rollouts cada uno a temperatura 1.0, mini-lote de 64 y una única época de actualización por paso; los pesos maestros se mantienen en bf16 con FSDP y el rollout se genera con vLLM en bf16. La semilla de actor y data-loader es 42. El dataset es DAPO-Math-17k, unas 17.000 preguntas de matemáticas con respuesta verificable, recorridas 4 veces en 540 pasos. No se documentan fases de SFT, RLHF con preferencias humanas ni DPO: el único aprendizaje por refuerzo es sobre corrección de respuesta.

## Capacidades

- Generación de texto en formato chat mediante `transformers` (`AutoModelForCausalLM`), con plantilla de chat heredada del modelo base.
- Resolución de problemas matemáticos de respuesta cerrada en modo directo, sin cadena de razonamiento visible: precisamente la habilidad optimizada por la recompensa.
- Razonamiento de un solo paso: al desactivar el modo thinking, el modelo no despliega CoT largo, lo que reduce latencia y tokens de salida a cambio de menor profundidad en problemas difíciles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el entrenamiento no incluye tareas de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento es de un único turno con recompensa terminal.
- Capacidades multilingües: no disponibles como dato verificado; el dataset de entrenamiento es de matemáticas y el idioma de los enunciados no se especifica.
- Capacidades especiales: selección de checkpoint por rama (`revision="step-N"`), útil para analizar la evolución del rendimiento durante el RL.
- Capacidades de visión o audio: no disponibles; el modelo base es solo texto.

## Casos de uso

- Evaluación de recetas de RL: al publicarse las 54 ramas de checkpoint, un equipo de investigación puede reproducir la curva de AIME 2024 paso a paso y comparar GSPO frente a GRPO con el mismo presupuesto de cómputo, sin reentrenar.
- Generación de datos sintéticos de matemáticas: el modelo produce soluciones cortas y respuestas finales verificables, adecuadas como corpus para destilar o para entrenar verificadores, filtrando por Math-Verify.
- Tutoría de matemáticas con respuesta inmediata: el modo NoThink evita el coste de tokens de razonamiento, lo que abarata servir respuestas a problemas de práctica en un chatbot educativo con latencia baja.
- Verificación y resolución por lotes en pipelines de corrección automática: al ser un modelo de 4B, se puede instanciar varias réplicas en una sola GPU para procesar miles de enunciados con throughput alto.
- Componente de un sistema de voto o auto-consistencia: con temperatura 1.0 y top-p 0.9, permite muestrear k respuestas por problema y agregar por mayoría, tal como se hizo en la evaluación Avg@16.
- Despliegue en hardware limitado o en el borde: 4B parámetros en bf16 ocupan del orden de 8 GB, de modo que cabe en GPUs de consumo de 12-24 GB para demostraciones o entornos de investigación sin clúster.
- Estudio de deriva de distribución sin anclaje KL: al tener KL = 0, es un banco de pruebas controlado para medir cuánto se degrada el comportamiento generalista al optimizar solo recompensa matemática.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| AIME 2024 (30 problemas) | Avg@16, temperatura 1.0, top-p 0.9 | 56,46 % en el paso 540 (mejor y final coinciden) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K, MATH ni comparaciones con el modelo base Qwen3-4B bajo el mismo protocolo. La única métrica reportada procede de 30 problemas con 16 muestras cada una, por lo que el intervalo de confianza es amplio y no debe interpretarse como una medida estable de capacidad matemática general.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 8 GB solo para pesos, más caché KV; presupuesto realista de 10-14 GB con contexto moderado (2-8K tokens).
- VRAM estimada con cuantización: no hay GGUF ni AWQ publicados; una conversión propia a 8 bits dejaría los pesos en ~4-5 GB y a 4 bits en ~2,5-3 GB, más caché KV.
- GPU de datacenter: A100 40/80 GB, H100, L40S; útiles para servir varias réplicas o contextos largos con vLLM.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y RTX 3060 12 GB en bf16 con contexto contenido; en GPUs de 8 GB sería necesaria cuantización.
- Opciones de despliegue: `transformers` (soporte nativo, con selección de rama por `revision`), vLLM (usado en el rollout del entrenamiento), TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requerirían convertir los safetensors bf16 a GGUF, paso no publicado por el autor.
- Latencia y throughput: no disponibles; el modo NoThink reduce los tokens de salida frente a un modelo con cadena de pensamiento, lo que en la práctica disminuye la latencia por petición.
- Almacenamiento: el repositorio completo ocupa 434,4 GB por las 54 ramas; conviene descargar solo `main` o la rama concreta que se vaya a evaluar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L1nkee/Qwen3-4B-NoThink-GSPO-KL0-LR1e-5-bf16-540steps | 4,02 B (denso) | No disponible | AIME 2024: 56,46 % (Avg@16, paso 540) | Apache 2.0 | Pesos bf16 safetensors, 54 ramas de checkpoint |
| Qwen/Qwen3-4B (base) | 4,02 B (denso) | No disponible en la información proporcionada | No disponible en la información proporcionada | Apache 2.0 | Pesos safetensors, ampliamente distribuido |
| Qwen2.5-Math-7B-Instruct | ~7,6 B (denso) | No disponible en la información proporcionada | No disponible en la información proporcionada | Apache 2.0 | Pesos safetensors y variantes cuantizadas de la comunidad |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B (denso) | No disponible en la información proporcionada | No disponible en la información proporcionada | MIT (según la información habitual del publicado; no verificada en esta búsqueda) | Pesos safetensors y GGUF de la comunidad |

La comparación cuantitativa no puede completarse: no se dispone de resultados de los modelos alternativos bajo el mismo protocolo (AIME 2024, Avg@16, temperatura 1.0). La diferencia objetiva frente al modelo base es el procedimiento de RL y el modo NoThink; frente a las alternativas de 7-8B, una menor huella de memoria a cambio de menor capacidad bruta.

## Limitaciones y advertencias

- Sin anclaje KL (KL = 0) ni bonus de entropía: el modelo puede derivar de la distribución del Qwen3-4B original, con riesgo de degradación de capacidades generales, formato de respuesta y coherencia fuera del dominio matemático.
- Entrenamiento restringido a DAPO-Math-17k con recompensa binaria de corrección: no hay evidencia de conservación de rendimiento en código, escritura, diálogo abierto ni instrucciones generales.
- Modo NoThink: la supresión de la cadena de razonamiento reduce la precisión en problemas de varios pasos, donde el CoT suele ser determinante.
- Riesgo de alucinación: el objetivo de recompensa solo premia la respuesta final correcta, no la validez del razonamiento intermedio ni la veracidad factual.
- Evaluación muy limitada: 30 problemas de AIME 2024 con 16 muestras; no hay resultados en otros benchmarks ni evaluación del modelo base en el mismo protocolo, por lo que la mejora atribuible al RL no está cuantificada en la información disponible.
- Sesgos: no documentados por el autor; al no haber evaluación de sesgo ni de idiomas, se desconoce el comportamiento fuera del inglés y del dominio matemático.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y el aviso de licencia del modelo base.
- Madurez: cero descargas y cero likes en el momento de la consulta, un único autor y ninguna revisión por pares; no es un artefacto recomendable para producción sin evaluación propia.
- El repositorio de 434,4 GB y sus 54 ramas complican la descarga y el versionado; conviene fijar la revisión exacta en cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L1nkee/Qwen3-4B-NoThink-GSPO-KL0-LR1e-5-bf16-540steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo contenido no relacionado); no se dispone de paper, blog, repositorio de código ni demo adicionales verificables.
