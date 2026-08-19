# hwting/SmolLM2-FT-MyDataset

## Resumen

SmolLM2-FT-MyDataset es un modelo de lenguaje pequeño (135 millones de parámetros) creado por el usuario hwting como resultado de un ejercicio de fine-tuning sobre el modelo base HuggingFaceTB/SmolLM2-135M. El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) mediante supervisión fina (SFT), y forma parte del curso "smol-course" en su módulo 1, orientado a enseñar técnicas de ajuste de modelos pequeños. El modelo está diseñado para generación de texto conversacional, como demuestra el ejemplo de uso incluido en su model card, donde se plantea una pregunta y se genera una respuesta.

Se trata de un modelo de demostración y aprendizaje, no de un sistema pensado para producción. Su relevancia radica en ilustrar el proceso completo de fine-tuning de un modelo pequeño con herramientas estándar del ecosistema Hugging Face, y en servir como punto de partida para experimentos educativos o prototipos de bajo coste. No se dispone de información pública sobre el dataset de entrenamiento, el número de pasos o las métricas de rendimiento, por lo que su evaluación objetiva es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base SmolLM2-135M soporta 8.192 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de SmolLM2-135M, un transformer decoder-only de la familia SmolLM2 desarrollada por Hugging Face. La arquitectura sigue el diseño típico de los modelos tipo Llama, con atención causal y normalización pre-RMSNorm, aunque no se detallan las capas específicas en la documentación pública. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL en su versión 1.10.0, con Transformers 5.15.0 y PyTorch 2.13.0. No se especifica el dataset empleado, el número de épocas, la tasa de aprendizaje ni el número de tokens de entrenamiento. Tampoco se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa. El proceso forma parte del módulo 1 del curso "smol-course", que introduce el fine-tuning de modelos pequeños con herramientas del ecosistema Hugging Face.

## Capacidades

- Generación de texto conversacional: el modelo puede responder a preguntas o mantener diálogos simples, como se muestra en el ejemplo de la model card.
- Soporte de chat: el pipeline de generación acepta mensajes con roles ("user", "assistant") y devuelve respuestas en formato texto.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, visión, audio u otras capacidades avanzadas.
- El modelo es monolingüe en la práctica, aunque no se especifican los idiomas soportados; dado que el modelo base SmolLM2 está entrenado principalmente en inglés, se espera un comportamiento razonable en ese idioma.

## Casos de uso

- Práctica educativa de fine-tuning: sirve como ejemplo de cómo ajustar un modelo pequeño con TRL, útil para estudiantes y desarrolladores que quieran aprender el flujo de trabajo de Hugging Face.
- Prototipado rápido de chatbots: para experimentos internos donde se necesite un generador de texto ligero y sin requisitos de alta calidad, puede integrarse en un entorno de desarrollo para probar ideas de conversación.
- Generación de texto en entornos con recursos muy limitados: al tener solo 135M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja, lo que permite desplegarlo en dispositivos embebidos o en pruebas locales sin coste de infraestructura.
- Base para experimentos de investigación: investigadores que estudien el comportamiento de modelos pequeños o técnicas de regularización pueden usar este fine-tune como punto de partida.
- Demostración de integración con Inference Endpoints: el modelo es compatible con text-generation-inference y endpoints de Hugging Face, por lo que puede servir para probar el despliegue en la nube.
- Generación de respuestas en aplicaciones de bajo riesgo: por ejemplo, un asistente de preguntas frecuentes en un entorno controlado donde las respuestas no requieran precisión crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se ofrecen comparativas con el modelo base o con otros fine-tunes similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 135M de parámetros, en FP16 ocupa aproximadamente 0,27 GB de memoria. Con cuantización a 8 bits o 4 bits, el consumo sería aún menor (menos de 0,2 GB). Estas cifras son estimaciones basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problema. También es viable ejecutarlo en CPU con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante Hugging Face Inference Endpoints. También es compatible con text-generation-inference.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna, la generación de 128 tokens debería completarse en menos de un segundo, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| hwting/SmolLM2-FT-MyDataset | 134,5M | No disponible | No disponible | Fine-tune de SmolLM2-135M con SFT |
| HuggingFaceTB/SmolLM2-135M | 135M | 8.192 tokens | Apache-2.0 | Modelo base original |
| hwliu/SmolLM2-FT-MyDataset | 134,5M (presumible) | No disponible | No disponible | Fine-tune similar, mismo nombre y procedencia |
| jsc012/SmolLM2-FT-MyDataset | 134,5M (presumible) | No disponible | No disponible | Fine-tune similar, mismo nombre y procedencia |

No se dispone de datos de rendimiento comparativos. Los modelos listados son variantes del mismo ejercicio de fine-tuning, por lo que sus capacidades son presumiblemente equivalentes, aunque no se puede confirmar sin evaluaciones.

## Limitaciones y advertencias

- Modelo muy pequeño (135M), con capacidad limitada para razonamiento complejo, conocimiento factual y coherencia en textos largos.
- Alto riesgo de alucinaciones y respuestas incoherentes, especialmente fuera de los temas vistos durante el entrenamiento.
- No se ha documentado el dataset de entrenamiento, por lo que se desconocen posibles sesgos o desequilibrios en los datos.
- La licencia no está claramente especificada; la model card indica "licence: license" sin detallar términos, lo que genera incertidumbre sobre su uso comercial.
- No se han publicado evaluaciones de seguridad, robustez o sesgos.
- El modelo no es adecuado para producción sin una validación exhaustiva y sin un sistema de supervisión humana.
- La longitud de contexto no está confirmada; aunque el modelo base soporta 8K, el fine-tune podría haber alterado este valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwting/SmolLM2-FT-MyDataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de TRL: https://github.com/huggingface/trl
- Resultados de búsqueda relacionados (no oficiales):
  - https://huggingface.co/hwliu/SmolLM2-FT-MyDataset
  - https://huggingface.co/jsc012/SmolLM2-FT-MyDataset
  - https://llm-explorer.com/model/Matelq-2%2FSmolLM2-FT-MyDataset,4fN59Z2y8tGlMC51NqRTne
  - https://llm-explorer.com/model/AlekseyElygin%2FSmolLM2-FT-MyDataset,2ckL9BsEHjBrR2jV1xns9T
  - https://friendli.ai/models/hwliu/SmolLM2-FT-MyDataset
