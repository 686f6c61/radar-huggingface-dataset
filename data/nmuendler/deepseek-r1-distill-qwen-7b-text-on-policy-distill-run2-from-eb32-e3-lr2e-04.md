# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-on-policy-distill-run2-from-eb32-e3-lr2e-04

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` y publicado por el usuario de HuggingFace `nmuendler`. El artefacto ocupa 0,3 GB, está etiquetado con `peft`, `lora`, `safetensors` y `transformers`, y su pipeline declarado es `text-generation`. El identificador del repositorio ("text-on-policy-distill-run2-from-eb32-e3-lr2e-04") sugiere un experimento de destilación on-policy (segunda ejecución, época 3, tasa de aprendizaje 2e-04, partiendo de un checkpoint "eb32"), aunque no existe documentación que lo confirme.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 "likes", no declara licencia ni idiomas, y su model card es la plantilla genérica de HuggingFace con todos los campos marcados como "[More Information Needed]". No se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.

Por tanto, debe tratarse como un artefacto de investigación sin validar. Las especificaciones funcionales que se indican a continuación solo pueden inferirse del modelo base declarado y no han sido verificadas por el autor ni por evaluaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el modelo base declarado pertenece a la familia Qwen |
| Parámetros totales | No disponible para el adaptador (repositorio de 0,3 GB). El modelo base es `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, con tamaño nominal de 7B según su nombre |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; depende del modelo base y no se confirma en esta ficha |
| Tipos de cuantización | No disponible. Al ser un adaptador LoRA, la cuantización requiere fusionarlo previamente con el modelo base; no se documentan formatos soportados |
| Idiomas soportados | No disponible |
| Licencia | No disponible. Debe verificarse la licencia del modelo base antes de cualquier uso comercial |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT 0.19.1) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Librería declarada | peft (framework PEFT 0.19.1 según la model card) |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 17 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de pesos de adaptación de bajo rango (LoRA) que debe cargarse junto con el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` mediante la librería PEFT. El modelo base es un transformer decoder-only denso de aproximadamente 7B parámetros, resultado de destilar las trazas de razonamiento de DeepSeek-R1 en un modelo de la familia Qwen. No se dispone de información sobre el rango del adaptador, las capas objetivo ni el escalado alfa.

No hay ningún dato publicado sobre el procedimiento de entrenamiento: ni composición del dataset, ni número de tokens, ni si hubo RLHF o DPO, ni la función de pérdida empleada. El único indicio es el propio identificador del repositorio, que apunta a un experimento de destilación on-policy con tasa de aprendizaje 2e-04, época 3 y una segunda ejecución partiendo de un checkpoint identificado como "eb32". Se trata de una inferencia basada en el nombre, no de información confirmada por el autor. La model card no incluye ejemplos de uso, código de carga ni requisitos de reproducción.

## Capacidades

Se listan a continuación las capacidades esperables por herencia del modelo base, con la advertencia explícita de que no están verificadas para este adaptador y que el ajuste puede haberlas alterado:

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational`, por lo que se espera uso en diálogo multi-turno.
- Razonamiento con cadena de pensamiento: el modelo base es una destilación de DeepSeek-R1, orientada a producir trazas de razonamiento antes de la respuesta final.
- Resolución de problemas matemáticos y de código: capacidad esperable por el modelo base, no medida en este adaptador.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluación ni ejemplos que lo respalden.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.
- Integración técnica: al ser un adaptador PEFT, requiere cargarse sobre el modelo base con `transformers` + `peft`; no es desplegable de forma autónoma.

## Casos de uso

Todos los casos siguientes son hipótesis de uso condicionadas a una validación previa del adaptador, dado que no existe ninguna evaluación publicada:

- Reproducción de experimentos de destilación on-policy: el repositorio puede servir como punto de partida para comparar checkpoints intermedios de un mismo experimento de destilación, usando el sufijo del identificador para trazar la época y la tasa de aprendizaje.
- Investigación sobre ajuste fino eficiente: al ocupar solo 0,3 GB, permite estudiar el efecto de un adaptador LoRA sobre un modelo base de 7B sin necesidad de almacenar pesos completos duplicados.
- Generación de trazas de razonamiento para destilación posterior: si el ajuste conserva el comportamiento del modelo base, podría emplearse para generar cadenas de pensamiento que alimenten el entrenamiento de modelos más pequeños.
- Asistente de resolución de problemas matemáticos en entornos controlados: con validación previa, podría desplegarse sobre el modelo base para tareas de razonamiento cuantitativo.
- Análisis comparativo de degradación por ajuste: permite medir si el entrenamiento adicional provoca olvido catastrófico respecto al modelo base en tareas de código o matemáticas.
- Docencia y experimentación académica: útil en asignaturas de ajuste fino y PEFT por su tamaño reducido y su facilidad de carga con la librería `peft`.
- Base para pipelines de RAG experimental: el modelo base admite contexto largo, aunque la ventana efectiva tras el ajuste no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye sección de evaluación cumplimentada: la model card mantiene los campos "Testing Data", "Factors", "Metrics" y "Results" con el texto "[More Information Needed]". El modelo base sí dispone de evaluaciones publicadas por su autor (entre ellas AIME 2024, MATH-500, GPQA Diamond y LiveCodeBench), consultables en su propia ficha de HuggingFace, pero este adaptador no reproduce ni actualiza esas cifras. Cualquier número que se atribuya a este repositorio sin una ejecución propia sería una invención.

## Requisitos de hardware

Las cifras de VRAM son estimaciones estándar para un modelo denso de ~7B parámetros y no proceden de la información proporcionada:

| Precisión | VRAM estimada (pesos) | Notas |
|---|---|---|
| FP16 / BF16 | ~15-16 GB | Requiere GPU de 24 GB o superior para contexto amplio |
| 8 bits | ~9 GB | Cabe en RTX 4090 y A100 40 GB |
| 4 bits (NF4/GPTQ/AWQ) | ~5-6 GB | Cabe en RTX 3060 12 GB, RTX 4070, Apple Silicon con memoria unificada |

- GPU recomendadas: A100 40/80 GB o H100 para servicio con lotes grandes y contexto largo; RTX 4090 / L40S para FP16 en uso individual; RTX 3060 12 GB o superior para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits y con modelos de 12 GB o más de VRAM. El adaptador en sí solo añade 0,3 GB.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI (previa fusión de los pesos), llama.cpp y Ollama (previa fusión y conversión a GGUF). No se documenta compatibilidad verificada con ninguna de ellas.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (nmuendler) | Adaptador sobre 7B (0,3 GB) | No disponible | No disponible | 0 descargas, 0 likes | Sin model card ni evaluación |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7B | 128K según su ficha (no verificado aquí) | No verificado en esta ficha | Modelo público con evaluaciones publicadas | Modelo base del adaptador |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | No disponible en esta ficha | No verificado en esta ficha | Público | Alternativa ligera de la misma familia |
| DeepSeek-R1-Distill-Qwen-14B | ~14B | No disponible en esta ficha | No verificado en esta ficha | Público | Alternativa de mayor tamaño de la misma familia |
| Qwen2.5-7B-Instruct | ~7B | No disponible en esta ficha | No verificado en esta ficha | Público | Alternativa generalista sin destilación de razonamiento |

La comparación relevante es siempre contra el modelo base sin adaptador: solo una evaluación A/B sobre las mismas tareas permitiría determinar si este LoRA aporta alguna mejora o introduce degradación.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (uso previsto, datos de entrenamiento, evaluación, sesgos) están sin cumplimentar, por lo que no existe ninguna garantía documental sobre el comportamiento del modelo.
- Licencia no disponible: sin licencia declarada no puede asumirse ningún derecho de uso comercial. Debe verificarse la licencia del modelo base y, en su caso, contactar con el autor.
- Cero validación externa: 0 descargas y 0 likes implican que no hay retroalimentación de la comunidad ni evidencia de que el adaptador funcione correctamente.
- Riesgo de olvido catastrófico: un ajuste LoRA sin documentar puede degradar las capacidades del modelo base en matemáticas, código o multilingüismo. No hay evaluación que lo descarte.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados de R1, que tienden a generar cadenas de pensamiento largas con alta confianza incluso cuando el contenido es incorrecto.
- Trazabilidad limitada: no se especifican datos de entrenamiento, por lo que no puede auditarse la presencia de contenido con derechos de autor, sesgos de género, raza o idioma.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Identificador poco descriptivo: el nombre del repositorio refleja hiperparámetros de un experimento, lo que complica el versionado y la selección del checkpoint adecuado en producción.
- Longitud de contexto no confirmada: aunque el modelo base soporte ventanas amplias, el ajuste puede haber sido entrenado con secuencias mucho más cortas, degradando el comportamiento en contexto largo.
- Uso en producción desaconsejado sin una batería de pruebas propia que cubra las tareas objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-on-policy-distill-run2-from-eb32-e3-lr2e-04
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper de DeepSeek-R1 (referencia del modelo base, no citado en el repositorio): https://arxiv.org/abs/2501.12948
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en machine learning: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
