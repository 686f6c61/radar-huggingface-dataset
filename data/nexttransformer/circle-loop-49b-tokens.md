# NextTransformer/Circle-Loop-49B-Tokens

## Resumen

Circle-Loop-49B-Tokens es un checkpoint de investigación publicado por NextTransformer (proyecto Interactive-Active-AI) dentro de un estudio comparativo de arquitecturas. Se trata de un modelo de lenguaje causal de tipo "looped" (con recirculación de bloques), con 927.992.523 parámetros totales y una ventana de contexto de 2.048 tokens. El sufijo "49B" del nombre hace referencia al número de tokens de entrenamiento (49.152 millones), no al tamaño del modelo, un detalle importante para no confundirlo con un modelo de escala 49B.

El modelo fue preentrenado sobre el dataset ClimbMix durante 46.875 pasos de actualización y se distribuye como el checkpoint final de la variante "Circle Loop" de dicha comparativa. Su relevancia es fundamentalmente metodológica: permite reproducir y auditar una arquitectura alternativa de recirculación de bloques frente a transformers convencionales, con métricas de validación publicadas (BPB 0,6912 y CORE-22×100 de 28,97).

No es un modelo orientado a producción: no hay información sobre licencia, idiomas soportados ni cuantizaciones, y requiere la implementación específica de NextTransformer (no es compatible directamente con transformers, vLLM o llama.cpp). Está pensado para investigadores que quieran estudiar el comportamiento de arquitecturas looped a escala de ~1B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NextTransformer, transformer causal con recirculación de bloques ("looped") |
| Parámetros totales | 927.992.523 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), configuración en model_config.json, tokenizer en tokenizer.tiktoken.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NextTransformer en su variante "Circle Loop". Según la model card, "después del primer circuito, cada bloque se convierte en una salida" ("after the first circuit, every block becomes an exit"), lo que sugiere un esquema de recirculación de bloques con puntos de salida múltiples tras la primera pasada. La implementación de referencia está publicada en el repositorio de GitHub de Interactive-Active-AI, con ficheros de configuración de arquitectura y de ejecución del experimento.

El preentrenamiento se realizó sobre el dataset ClimbMix durante 46.875 actualizaciones, con un total de 49.152 millones de tokens procesados (de ahí el "49B" del nombre). No se especifican en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO, ni innovaciones adicionales como decodificación especulativa o atención lineal. El tokenizer es de tipo tiktoken, con especificación serializada en JSON y token especial `<|bos|>`.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base preentrenado, sin ajuste por instrucciones ni alineación documentada.
- Tokenizer basado en tiktoken con soporte de tokens especiales (`<|bos|>`).
- No hay información disponible sobre soporte de tool calling, function calling ni uso como agente.
- No hay información disponible sobre capacidades multilingües específicas.
- No hay información disponible sobre modo "thinking", visión, audio ni otras modalidades.
- No hay información disponible sobre razonamiento multi-paso entrenado explícitamente.

## Casos de uso

- Investigación en arquitecturas looped: reproducir los experimentos de la comparativa NextTransformer cargando el checkpoint con la implementación oficial y comparando curvas de validación BPB frente a variantes convencionales.
- Estudio de eficiencia parámetro-rendimiento: analizar cómo un modelo de ~928M parámetros con recirculación de bloques se comporta en CORE-22 (28,97×100) frente a baselines de tamaño similar.
- Docencia y divulgación técnica: usar el checkpoint como ejemplo práctico de arquitectura alternativa a transformers estándar en cursos de arquitecturas de modelos de lenguaje.
- Experimentos de ablación: modificar la configuración (`model_config.json`) y reentrenar o evaluar variantes para estudiar el efecto del número de circuitos y puntos de salida.
- Evaluación de tokenizers tiktoken en pipelines de investigación: el formato serializado en JSON permite integrar el tokenizer en herramientas propias sin dependencia de la librería transformers.
- Reproducibilidad de resultados publicados: verificar las métricas de validación (BPB 0,6912, CORE-22 28,97) siguiendo el run record publicado en el repositorio.
- Prototipado de generación de texto a pequeña escala en CPU: el script de ejemplo de la model card carga el modelo en CPU, lo que permite pruebas rápidas sin GPU.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0,6912 |
| CORE-22 (×100) | 28,97 |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) ni tablas frente a modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,7 GB solo para pesos (927.992.523 parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: alrededor de 1,9 GB para pesos; requiere conversión manual, no documentada en la información disponible.
- El ejemplo oficial de la model card carga el modelo en CPU (`device="cpu"`), por lo que es viable sin GPU para pruebas puntuales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con ≥8 GB (RTX 3060, RTX 4060, RTX 4090) debería poder alojar los pesos en precisión reducida, aunque no está verificado.
- Opciones de despliegue: únicamente la implementación oficial de NextTransformer (`pip install "nexttransformer @ git+https://github.com/Interactive-Active-AI/NextTransformer.git@7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0"`) más `safetensors`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o tarea similar, y la arquitectura looped no es directamente equiparable a transformers convencionales de ~1B parámetros sin datos de evaluación comunes.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no es adecuado como asistente conversacional en producción.
- Contexto muy limitado (2.048 tokens), insuficiente para la mayoría de casos de uso modernos con documentos largos o conversaciones extensas.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue comercial.
- Idiomas soportados no documentados: el comportamiento multilingüe es desconocido y probablemente limitado por la composición de ClimbMix, no especificada.
- Riesgo de alucinación no evaluado: no hay métricas de fidelidad ni evaluaciones de seguridad publicadas.
- Sesgos desconocidos: sin información sobre composición del dataset ni análisis de sesgos.
- Compatibilidad restringida: requiere la implementación específica de NextTransformer; no funciona con el ecosistema estándar de transformers, lo que complica su integración en pipelines existentes.
- Sin soporte documentado de cuantización (GGUF, AWQ, GPTQ), lo que limita el despliegue eficiente en hardware consumer.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/Circle-Loop-49B-Tokens
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura (circle.json): https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/methods/circle.json
- Registro de ejecución (run record): https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/runs/circle.json
