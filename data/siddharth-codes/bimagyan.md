# siddharth-codes/bimagyan

## Resumen

Bimagyan es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario siddharth-codes en HuggingFace. Se trata de un modelo derivado de la versión cuantizada a 4 bits del Qwen2.5-1.5B-Instruct de Alibaba, que a su vez es un transformer decoder-only de 1.500 millones de parámetros con una ventana de contexto de 32.768 tokens. El ajuste se realizó empleando Unsloth, una librería de entrenamiento optimizada que reduce el uso de memoria y acelera el proceso de fine-tuning.

La model card es extremadamente escasa: no documenta el dataset de entrenamiento, el propósito del ajuste, los hiperparámetros utilizados ni los resultados obtenidos. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que los pesos publicados podrían estar en cuantización de 4 bits (coherente con el modelo base bnb-4bit), aunque no se especifica el formato exacto de los archivos más allá de la presencia de safetensors.

Por su relevancia, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica adicional. Resulta útil únicamente como ejemplo de fine-tuning ligero sobre Qwen2.5 con Unsloth, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (heredados del modelo base Qwen2.5-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el modelo base es bnb-4bit; el repo ocupa 0,1 GB) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas, aunque la model card de este fine-tuning no reproduce esos detalles.

El ajuste fino se realizó con Unsloth sobre la versión bnb-4bit del modelo base, lo que implica que el entrenamiento partió de pesos cuantizados a 4 bits. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicó LoRA/QLoRA, DPO, RLHF ni ninguna otra técnica de alineación adicional. La única innovación técnica documentada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster"), sin más detalles sobre hiperparámetros, epochs o tamaño del conjunto de datos.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste fino no documentado.
- Generación de código y matemáticas a nivel de modelo pequeño (1.5B), sin datos específicos de rendimiento.
- Soporte de tool calling y function calling: no confirmado en este fine-tuning; el modelo base Qwen2.5-Instruct sí lo soporta, pero la model card no lo garantiza tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 1.5B parámetros y 0,1 GB de pesos, puede desplegarse en entornos con recursos limitados para validar flujos de conversación antes de escalar a modelos mayores.
- Experimentación académica con fine-tuning sobre Qwen2.5: sirve como referencia de cómo Unsloth permite ajustar un modelo pequeño en una GPU de consumo, útil para cursos y talleres.
- Generación de texto en aplicaciones de baja latencia: su tamaño reducido permite inferencia en CPU o GPU modesta, adecuado para tareas de completado de texto o resumen breve en inglés.
- Base para nuevos fine-tunes: al estar bajo licencia Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para ajustes específicos de dominio.
- Evaluación comparativa de técnicas de cuantización: permite estudiar el impacto de entrenar sobre pesos bnb-4bit frente a entrenar en precisión completa.
- Despliegue en entornos de demostración o pruebas internas: su reducido tamaño facilita incluirlo en contenedores ligeros con TGI o transformers, aunque sin garantías de calidad por falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantización de 4 bits (coherente con el tamaño del repo de 0,1 GB), y alrededor de 3-4 GB en FP16 para los 1.500 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); para 4 bits, basta con 2 GB.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia en 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y vLLM (si los pesos son compatibles con safetensors en FP16/BF16).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1.5B, se espera una latencia baja (decenas de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bimagyan (este modelo) | 1.500 M | no disponible (base: 32.768) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama 3.2 1B Instruct | 1.200 M | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy usado |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | HuggingFace, usado en entornos ligeros |

El rendimiento comparado no puede establecerse porque bimagyan no publica benchmarks. Frente a sus alternativas, su principal desventaja es la ausencia de documentación y evaluación; su ventaja es la licencia Apache 2.0 y el tamaño reducido.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos introducidos por el ajuste fino.
- Riesgo elevado de alucinación, inherente a los modelos de 1.5B parámetros y agravado por la falta de evaluación.
- Idiomas soportados declarados: solo inglés; no se garantiza un buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no confirmada en la model card; se asume la del modelo base (32.768 tokens), pero el ajuste podría haberla alterado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere una evaluación propia.
- El modelo parte de pesos cuantizados a 4 bits, lo que puede degradar la calidad respecto al modelo base en precisión completa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- No se especifica si el fine-tuning preserva el soporte de tool calling del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/siddharth-codes/bimagyan
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
