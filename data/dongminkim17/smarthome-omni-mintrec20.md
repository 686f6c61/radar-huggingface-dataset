# dongminkim17/smarthome-omni-mintrec20

## Resumen

`dongminkim17/smarthome-omni-mintrec20` es un modelo multimodal derivado de Qwen2.5-Omni-3B, desarrollado por Dong Min Kim y colaboradores (Sung-Ju Lee, Ryuhaerang Choi, Hyungjun Yoon, Seohyeon Yoo) en el contexto de investigación sobre eficiencia de modelos para el hogar inteligente. No es un modelo generativo de propósito general: es un clasificador de intención de conjunto cerrado con 20 clases sobre el conjunto de datos MIntRec, que recibe audio, vídeo y la transcripción del enunciado como entradas.

El modelo se ha obtenido aplicando poda de canales FFN basada en activaciones sobre el backbone Qwen2.5-Omni-3B, reduciendo el ancho de las capas feed-forward de 11.008 a 4.352, seguida de dos etapas de recuperación mediante destilación de conocimiento con adaptadores LoRA fusionados en los pesos finales. Conserva las 36 capas del decodificador y los codificadores de audio y visión originales, con 3.231.263.744 parámetros en tiempo de ejecución.

Su relevancia es acotada pero concreta: demuestra que es posible comprimir un modelo omni-modal de 3B manteniendo un rendimiento de clasificación superior al de la cohorte de comparación publicada (78,65% de accuracy en el test oficial, primer puesto entre 19 modelos). Es un artefacto de investigación reproducible, no un modelo listo para despliegue general en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni Thinker) con poda FFN |
| Parámetros totales | 3.231.263.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Qwen Research License (qwen-research, uso no comercial) |
| Formato de pesos | safetensors (BF16) |

Desglose de parámetros en tiempo de ejecución: 1.924.902.912 en el cuerpo del modelo de lenguaje y cabeza de salida, 637.676.544 en la torre de audio y 668.684.288 en el codificador de visión.

## Arquitectura y entrenamiento

El modelo parte de la revisión `f75b40e3da2003cdd6e1829b1f420ca70797c34e` de Qwen/Qwen2.5-Omni-3B, un transformer multimodal con torres separadas de audio y visión y un decodificador de lenguaje de 36 capas. Sobre ese backbone se aplicó un proceso de compresión en varias fases: primero un SFT con teacher específico de la tarea durante cinco épocas usando LoRA de rango 16 y alpha 32 en las proyecciones query/value; después una calibración de activaciones solo para entrenamiento con 128 clips y semilla 42, seguida de la poda de canales FFN hasta anchura 4.352.

La recuperación se hizo en dos etapas. La primera, de cinco épocas, con LoRA de decodificador de rango 16/alpha 32 y una combinación de SFT y destilación de clases. La segunda, conjunta y final, de cinco épocas, con LoRA de decodificador y codificadores de rango 64/alpha 128, learning rate de 1e-4 para el LM y 1e-5 para los codificadores. Los pesos de la pérdida combinan SFT y destilación de clases en proporción 0,25/0,75 con temperatura 2, más destilación de características de audio y visión con peso 0,1 cada una. Se usó AdamW, scheduler coseno, 3% de warmup, batch efectivo de cuatro y semilla 42. El muestreo de vídeo es a 2 FPS, hasta ocho fotogramas y 50.176 píxeles por fotograma. Los adaptadores LoRA finales de lenguaje y codificadores están fusionados en los pesos publicados.

## Capacidades

- Clasificación de intención en conjunto cerrado de 20 clases sobre MIntRec: Complain, Praise, Apologise, Thank, Criticize, Agree, Taunt, Flaunt, Joke, Oppose, Comfort, Care, Inform, Advise, Arrange, Introduce, Leave, Prevent, Greet y Ask for help.
- Procesamiento multimodal conjunto de audio, vídeo y transcripción del enunciado.
- Evaluación mediante scoring de logits de la letra de respuesta y mediante generación greedy.
- Comprensión de lenguaje natural en inglés a través del decodificador heredado de Qwen2.5-Omni.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking en la información disponible.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Clasificación de intenciones en interacciones de hogar inteligente: el modelo recibe el audio del usuario, el vídeo de la escena y la transcripción, y devuelve una de las 20 etiquetas de intención. Es el uso evaluado y documentado por los autores.
- Investigación en compresión de modelos multimodales: sirve como referencia reproducible de poda FFN más destilación sobre un backbone omni-modal, con pesos, checksums y scripts de evaluación publicados.
- Análisis de emociones y actitud en diálogos: las etiquetas cubren categorías afectivas (Comfort, Care, Taunt, Praise, Criticize), lo que permite estudiar reconocimiento de actitud en conversaciones grabadas.
- Evaluación comparativa de eficiencia: al conservar 36 capas y reducir el FFN a 4.352, es útil para medir el impacto de la poda en accuracy frente al checkpoint original de Qwen2.5-Omni-3B.
- Reproducción de experimentos académicos: el repositorio incluye `task_config.json`, `evaluation.json` y `release.json` para replicar exactamente el pipeline de evaluación sobre el split oficial de test.
- Filtrado y anotación semiautomática de corpus MIntRec: puede usarse para preetiquetar clips con las 20 intenciones antes de revisión humana, siempre dentro del ámbito de investigación no comercial.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Tarea | MIntRec, 20 clases de intención |
| Split de test oficial | 445 muestras |
| Accuracy en test oficial | 78,65% |
| Posición en la cohorte de comparación publicada | 1 de 19 |
| Train / validation / test | 1.334 / 445 / 445 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas detalladas con los 18 modelos restantes de la cohorte. Las métricas agregadas y la comparación con el checkpoint fuente sin fusionar están en `evaluation.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 6,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y del procesador multimodal; se recomienda al menos 12-16 GB para margen.
- GPU recomendadas: A100, H100 o L40S para evaluación por lotes; una RTX 4090 (24 GB) es suficiente para inferencia en BF16 de una sola muestra.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y previsiblemente en GPUs de 16 GB con cuantización, aunque no se documentan pesos cuantizados oficiales.
- Opciones de despliegue: `transformers` con `Qwen2_5OmniThinkerForConditionalGeneration` y `attn_implementation="sdpa"`; el modelo está marcado como compatible con endpoints. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smarthome-omni-mintrec20 | 3,23 B (FFN podado) | No disponible | MIntRec 20 clases, 78,65% | Qwen Research (no comercial) | Hugging Face |
| Qwen/Qwen2.5-Omni-3B (base) | 3 B aprox. | No disponible en esta ficha | Omni-modal general | Qwen Research | Hugging Face |
| Cohortes MIntRec, ARL y Emotion-LLaMA | No disponible | No disponible | Clasificación de intención/emoción | No disponible | Referenciados en `docs/METHOD.md` |

La comparación numérica con los 18 modelos de la cohorte seleccionada no está desglosada en la información disponible; solo se indica que este modelo ocupa la primera posición.

## Limitaciones y advertencias

- Ámbito restringido: solo se ha evaluado la tarea de intención de conjunto cerrado descrita. El despliegue general en hogar inteligente, otros conjuntos de etiquetas o entradas con modalidades incompletas requieren evaluación propia.
- Licencia Qwen Research: uso no comercial y condiciones específicas de redistribución. No apto para producción comercial sin autorización.
- Solo inglés: no se documenta soporte de otros idiomas, lo que limita su uso en entornos hispanohablantes.
- Riesgo de alucinación y de clasificación errónea fuera de distribución: al ser un clasificador de conjunto cerrado, cualquier entrada ajena a las 20 clases puede forzar una etiqueta incorrecta.
- Sesgos: no se documentan análisis de sesgo por género, edad, acento o idioma de los hablantes.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o clips extensos.
- Repo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.
- Los pesos están en BF16 sin cuantizaciones publicadas; el despliegue en hardware limitado requiere cuantización manual no verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongminkim17/smarthome-omni-mintrec20
- Repositorio de código y método: https://github.com/dongminkim17/smarthome-model-efficiency
- Documentación del método: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/docs/METHOD.md
- Entorno de ejecución: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/environment.yml
- Instrucciones de preparación de datos: https://github.com/dongminkim17/smarthome-model-efficiency#setup
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Perfil del autor en GitHub: https://github.com/dongminkim17
