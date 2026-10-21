# SecondLookResearch/Qwen2.5-72B-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep

## Resumen

`SecondLookResearch/Qwen2.5-72B-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep` no es un modelo completo, sino un adaptador LoRA de PEFT sobre `Qwen/Qwen2.5-72B`. Forma parte de "Teaching Qwen Why", una replicación sobre modelos de pesos abiertos del trabajo de Anthropic "Teaching Claude Why", desarrollada por Second Look Research (Anastasia Wei, Jack Thompson, Brandon Qi, Stewart Slocum). Su propósito no es ofrecer un asistente de producción, sino servir como artefacto de investigación en alineación: el adaptador se utiliza para estudiar si el entrenamiento en consejo difícil mejora el comportamiento del modelo en escenarios de desalineación agéntica.

El adaptador se entrena en dos etapas encadenadas. La primera es un mix de instrucciones de 13K conversaciones (2 épocas); la segunda, que corresponde a este repositorio, son 1.000 conversaciones de "consejo difícil" generadas por GPT-5.6 Terra (1 época), con la pérdida calculada únicamente sobre los turnos del asistente. Los adaptadores se fusionan secuencialmente en el modelo base antes de entrenar la etapa siguiente, por lo que este repositorio es el último eslabón de la cadena y debe servirse sobre el adaptador `Qwen2.5-72B-instruct-mix`.

Es relevante ahora porque la comunidad de alineación carece de replicaciones abiertas y reproducibles de las técnicas de entrenamiento de Anthropic sobre modelos de pesos abiertos, y porque incluye un parche de las filas del terminador ChatML del modelo base (`base_row_patch.safetensors`, el "graft") que documenta un defecto del modelo base no entrenado. El repositorio ocupa 3,4 GB y acumula 25 descargas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-72B; rango 64, alpha 128, aplicado a todas las capas lineales |
| Parametros totales | 72B en el modelo base; tamano del adaptador no disponible (repositorio de 3,4 GB) |
| Parametros activos | No aplica (no es MoE; el modelo base Qwen2.5-72B es denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen/Qwen2.5-72B) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar (requiere fusion con el base antes de cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | `other` con `license_name: qwen`; enlace a la licencia de Qwen: https://huggingface.co/Qwen/Qwen2.5-72B/blob/main/LICENSE |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + `base_row_patch.safetensors` (parche de filas del terminador ChatML) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-72B`, un transformer decoder-only denso de 72.000 millones de parámetros. El entrenamiento LoRA usa rango 64 y alpha 128 sobre todas las capas lineales, con tasa de aprendizaje 1e-4, schedule coseno y batch efectivo de 8 secuencias empaquetadas. Cada etapa entrena un adaptador independiente que se fusiona en el modelo antes de comenzar la siguiente, de modo que la cadena es acumulativa y no paralela: primero el mix de instrucciones de 13K conversaciones durante 2 épocas, después las 1.000 conversaciones de consejo difícil durante 1 época. En ambas etapas la pérdida se calcula solo sobre los turnos del asistente.

La innovación metodológica destacable es el "graft": antes de la etapa de instruction mix se reparan las filas del terminador ChatML del modelo base, que no fueron entrenadas. El parche se publica como artefacto separado (`base_row_patch.safetensors`) y su código de aplicación está en el repositorio GitHub del proyecto. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset, ni si hubo RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional multi-turno heredada del modelo base Qwen2.5-72B.
- Consejo matizado en situaciones difíciles: es la capacidad entrenada explícitamente en esta etapa, con 1.000 conversaciones etiquetadas por GPT-5.6 Terra.
- Razonamiento y conocimiento general: presumiblemente heredados del base, aunque no se publican evaluaciones que lo verifiquen en esta ficha.
- Soporte de tool calling / function calling: no documentado para el adaptador; depende del modelo base y de la plantilla ChatML.
- Uso en experimentos de desalineación agéntica: el autor lo emplea en el benchmark de misalineación agéntica (`evaluation/agentic_misalignment/serve_model.sh`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación en alineación: servir el adaptador sobre el base con el graft aplicado para reproducir las Figuras 1 y 13 del post de "Teaching Qwen Why" y medir el efecto del consejo difícil sobre la tasa de misalineación agéntica.
- Replicación de técnicas de Anthropic sobre pesos abiertos: usar la cadena completa de adaptadores como línea base reproducible frente a otros métodos de entrenamiento de comportamiento.
- Estudio de calidad de datos sintéticos: comparar este adaptador (1.000 conversaciones de GPT-5.6 Terra) con la variante `Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1` (3.000 conversaciones) para aislar el efecto del volumen de datos de consejo difícil.
- Evaluación de robustez conversacional: someter el modelo a peticiones ambiguas o potencialmente dañinas y analizar si el entrenamiento en consejo difícil produce respuestas más matizadas o, por el contrario, más evasivas.
- Auditoría del tokenizador y de la plantilla ChatML: el parche `base_row_patch.safetensors` documenta un fallo del terminador del modelo base y sirve como caso de estudio de artefactos de tokenización en modelos abiertos.
- Despliegue experimental de inference serving: el adaptador está pensado para servirse con vLLM sobre el base parcheado y fusionado, y aparece indexado en FriendliAI para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 3,4 GB en el repositorio, pero la inferencia requiere cargar el modelo base completo de 72B junto con los dos adaptadores de la cadena.
- VRAM estimada para pesos en precisión nativa (BF16/FP16): en torno a 145 GB solo para pesos, más overhead de activaciones y caché KV; se necesitan múltiples GPU o nodos con NVLink.
- VRAM estimada en cuantización de 8 bits: aproximadamente 75-80 GB (cabe en una H100 80 GB con margen ajustado, no verificado por el autor).
- VRAM estimada en cuantización de 4 bits: aproximadamente 40-45 GB, lo que permitiría una A100 80 GB o dos RTX 4090 de 24 GB; estas cifras son estimaciones aritméticas a partir del tamaño, no han sido publicadas ni verificadas para este adaptador.
- No cabe en una única GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en precisión completa.
- Despliegue recomendado por el autor: vLLM con `serve_model.sh` (repositorio de código), aplicando el graft, fusionando los adaptadores en orden y arrancando el servidor. Ejemplo: `RUN=model GRAFT=1 BASE_MODEL=Qwen/Qwen2.5-72B ADAPTERS="...instruct-mix ...terrain-1000-1ep"`.
- Alternativas no documentadas por el autor: llama.cpp u Ollama requerirían fusionar los adaptadores en el base y convertir a GGUF; TGI no está documentado para esta cadena.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (difficult-advice, 1.000 conv.) | 72B (base) + LoRA r64 | No disponible | No disponible | Qwen (`other`) | HuggingFace, 25 descargas |
| `Qwen2.5-72B-instruct-mix` (etapa 1 de la cadena) | 72B (base) + LoRA r64 | No disponible | No disponible | Qwen (`other`) | HuggingFace; endpoint en FriendliAI |
| `Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1` (3.000 conv., experimento cross-model) | 72B (base) + LoRA r64 | No disponible | No disponible | Qwen (`other`) | HuggingFace |
| `Qwen/Qwen2.5-72B-Instruct` (modelo base de referencia) | 72B | No disponible en la informacion proporcionada | Benchmarks del base no incluidos en esta ficha | Qwen | HuggingFace; ampliamente servido |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: el autor no publica evaluaciones de calidad, seguridad ni utilidad general para este adaptador.
- Debe servirse obligatoriamente en cadena sobre `Qwen2.5-72B-instruct-mix` y sobre el base parcheado con el graft; usarlo de forma aislada produce un comportamiento distinto al documentado.
- El dataset de la segunda etapa son solo 1.000 conversaciones generadas por GPT-5.6 Terra: riesgo alto de sobreajuste al estilo, formato y sesgos del generador, y de transferir sus patrones de respuesta.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en esta etapa.
- Licencia `other` con nombre `qwen`: es necesario revisar la licencia de Qwen2.5-72B antes de cualquier uso comercial; el adaptador hereda restricciones del base.
- Idioma y cobertura multilingüe no documentados; el entrenamiento se realizó sobre un mix de instrucciones cuya composición lingüística no se detalla.
- El parche `base_row_patch.safetensors` corrige filas del terminador ChatML del base: omitirlo puede degradar la parada de generación y la calidad de las respuestas.
- Ausencia total de benchmarks publicados impide comparar cuantitativamente su comportamiento frente al base o frente a otros adaptadores de alineación.
- Las estimaciones de VRAM de esta ficha son aritméticas a partir del tamaño de parámetros y no han sido verificadas experimentalmente por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-72B/blob/main/LICENSE
- Adaptador de la primera etapa: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-instruct-mix
- Variante de consejo difícil (3.000 conversaciones): https://huggingface.co/SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Repositorio de código (incluye `serve_model.sh`): https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/SecondLookResearch/Qwen2.5-72B-instruct-mix-difficult-advice-gpt-5.6-terra-1000-1ep
- Endpoint de la primera etapa en FriendliAI: https://friendli.ai/models/SecondLookResearch/Qwen2.5-72B-instruct-mix
- Ficha de benchmarks del base Qwen2.5-72B-Instruct: https://llm-stats.com/models/qwen-2.5-72b-instruct
