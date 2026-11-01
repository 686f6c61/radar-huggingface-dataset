# mradermacher/torchlight-phi4-mini-GGUF

## Resumen

torchlight-phi4-mini-GGUF es la distribución en formato GGUF del modelo torchlight-phi4-mini, un ajuste fino (LoRA) del modelo base Phi-4-mini de Microsoft, desarrollado por el usuario samadpls y cuantizado por mradermacher. El modelo está especializado en tareas de código y depuración (debugging), y se ha entrenado sobre el dataset samadpls/torchlight-threads, que presumiblemente contiene hilos de conversación técnica orientados a la resolución de errores y análisis de código. La relevancia de esta ficha radica en que ofrece una alternativa compacta (3.836 millones de parámetros) y ligera para asistentes de programación locales, con licencia MIT y múltiples cuantizaciones que permiten su despliegue en hardware de consumo.

El modelo mantiene la arquitectura subyacente de Phi-4-mini (transformer denso, familia Phi-3/Phi-4), con un tamaño de contexto no especificado en la información disponible. Su principal atractivo es la combinación de un tamaño reducido, licencia permisiva y cuantizaciones estáticas que van desde 1,8 GB (Q2_K) hasta 7,8 GB (f16), lo que facilita su ejecución en GPUs consumer y en CPU mediante llama.cpp. No obstante, la información pública disponible es limitada: no se han publicado benchmarks ni detalles sobre el proceso de entrenamiento, y el modelo solo declara soporte para inglés.

Esta ficha se basa exclusivamente en los datos proporcionados por la model card y los metadatos de HuggingFace. Cualquier dato no confirmado se indica explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-4-mini, tag phi3) |
| Parámetros totales | 3.836.021.856 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (también existen pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre samadpls/torchlight-phi4-mini, que a su vez se basa en la arquitectura Phi-4-mini de Microsoft. Los tags indican "phi3" y "pytorch", lo que sugiere que la implementación sigue la familia Phi-3/Phi-4 con transformers. El tamaño de 3.836 millones de parámetros coincide con el de Phi-4-mini, un transformer denso con atención estándar (no se dispone de detalles sobre innovaciones como atención lineal o decodificación especulativa). No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset samadpls/torchlight-threads ni si se aplicaron técnicas de RLHF o DPO. La model card solo menciona el dataset y la naturaleza del ajuste (LoRA), sin especificar hiperparámetros ni metodología.

La cuantización ha sido realizada por mradermacher mediante su pipeline estático (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf). Se ofrecen cuantizaciones estáticas (no weighted/imatrix), y el autor indica que no hay planes inmediatos para cuantizaciones ponderadas. No se dispone de información sobre el proceso de conversión más allá de los metadatos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a interacciones de tipo chat (tag "conversational").
- Especialización en código y depuración (tags "code", "debugging"), probablemente entrenado para analizar errores, explicar trazas y proponer correcciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de HuggingFace.

## Casos de uso

- Asistencia en depuración de código en local: el modelo puede analizar fragmentos de código y mensajes de error en inglés, y sugerir causas y soluciones. Su tamaño reducido (2,4-2,6 GB en Q4_K_M) permite ejecutarlo en un portátil con GPU consumer, lo que facilita la privacidad y la ausencia de latencia de red.
- Revisión de código en pipelines de CI/CD: integrado mediante llama.cpp o servidores compatibles, puede generar comentarios automáticos sobre posibles bugs en pull requests, aunque su contexto limitado (no disponible) restringe el tamaño de los diffs.
- Chatbot técnico para documentación interna: al estar especializado en hilos de depuración, puede responder preguntas frecuentes sobre errores comunes en un stack tecnológico concreto, siempre que se le proporcione contexto en inglés.
- Generación de explicaciones de trazas de error: útil para desarrolladores que necesitan interpretar excepciones complejas; el modelo puede reformular el error en lenguaje natural y proponer pasos de diagnóstico.
- Prototipado rápido de asistentes de programación: gracias a la licencia MIT y a las cuantizaciones ligeras, se puede desplegar en entornos de desarrollo sin costes de licencia y con requisitos de hardware modestos.
- Educación y formación en programación: puede servir como tutor básico para estudiantes que practican debugging en inglés, con la ventaja de ejecutarse offline y sin dependencias de API externas.
- Investigación en ajuste fino eficiente: el modelo base (LoRA sobre Phi-4-mini) y sus cuantizaciones sirven como punto de partida para experimentos de adaptación a dominios específicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~1,8 GB
  - Q3_K_S: ~2,0 GB
  - Q3_K_M: ~2,2 GB
  - IQ4_XS: ~2,3 GB
  - Q3_K_L: ~2,4 GB
  - Q4_K_S: ~2,4 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_S: ~2,8 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,8 GB
- GPU recomendadas: no disponible. Por tamaño, cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) e incluso en GPUs con 4-8 GB para cuantizaciones bajas.
- ¿Cabe en consumer GPU? Sí, en la mayoría de GPUs modernas con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; las cuantizaciones Q2/Q3 caben en 2-3 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), servidores compatibles con GGUF (p. ej., llama-cpp-python), y potencialmente vLLM si se convierte a safetensors (no confirmado). El tag "endpoints_compatible" sugiere compatibilidad con la API de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| torchlight-phi4-mini-GGUF | 3.836 M | No disponible | MIT | GGUF | Especializado en código/debugging, solo inglés |
| Phi-4-mini (Microsoft) | 3.8 B | No disponible | MIT | Safetensors | Modelo base generalista, multilingüe |
| Qwen2.5-Coder-3B | 3.09 B | 32K (típico) | Apache 2.0 | Safetensors/GGUF | Especializado en código, multilingüe |
| Llama-3.2-3B-Instruct | 3.21 B | 128K | Llama 3.2 Community | Safetensors/GGUF | Generalista, multilingüe |

Nota: los datos de contexto y parámetros de los modelos comparativos provienen de conocimiento general y no de la información proporcionada; se incluyen solo como referencia orientativa. No se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un ajuste fino sobre Phi-4-mini con un dataset específico, puede heredar sesgos del modelo base y del dataset torchlight-threads.
- Riesgo de alucinación: presente en cualquier modelo generativo; en tareas de código puede inventar APIs o soluciones incorrectas, por lo que se recomienda validación humana.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto no está especificada, lo que impide garantizar el manejo de conversaciones o archivos largos.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución. No obstante, el modelo base Phi-4-mini también es MIT, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: no se han publicado benchmarks ni evaluaciones de calidad; el modelo tiene pocas descargas (396) y cero likes, lo que sugiere poca validación comunitaria. La cuantización es estática (no imatrix), lo que puede degradar la calidad en comparación con cuantizaciones ponderadas. No se garantiza soporte de tool calling ni de agentes. El repositorio ocupa 35,6 GB, pero cada archivo GGUF es independiente.
- El modelo está etiquetado como "conversational" pero no se especifica la plantilla de chat; se recomienda consultar el modelo base para el formato correcto.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/mradermacher/torchlight-phi4-mini-GGUF
- Modelo base (LoRA): https://huggingface.co/samadpls/torchlight-phi4-mini
- Dataset: https://huggingface.co/datasets/samadpls/torchlight-threads
- Página de resumen de cuantizaciones: https://hf.tst.eu/model#torchlight-phi4-mini-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
