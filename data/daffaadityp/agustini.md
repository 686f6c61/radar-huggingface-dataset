# Daffaadityp/AgusTini

## Resumen
AgusTini es la edición cuantizada en formato GGUF del modelo AxonAI MX4 2.0, un modelo de lenguaje de 4.022 millones de parámetros (4B) desarrollado por AxonLabs (SMKN 26 Jakarta, Indonesia) y publicado en Hugging Face por el usuario Daffaadityp. Se trata de un ajuste fino mediante DoRA (Weight-Decomposed Low-Rank Adaptation) sobre la arquitectura Qwen3, entrenado para producir razonamiento explícito en formato Chain-of-Thought dentro de etiquetas `<think>` antes de cada respuesta final.

El repositorio contiene únicamente los pesos cuantizados (Q2_K, Q4_K_M y Q8_0) generados con el pipeline oficial de llama.cpp, con el objetivo de facilitar la inferencia local en hardware de consumo, portátiles, dispositivos edge e incluso Raspberry Pi, sin necesidad de GPU ni conexión a internet. El modelo base en precisión completa (FP16/BF16) se distribuye en el repositorio AxonAI-MX4-2.0.

Su relevancia radica en la combinación de un tamaño compacto (4B), licencia Apache 2.0 permisiva y soporte nativo de razonamiento estructurado, lo que lo sitúa como candidato para despliegues offline y entornos con recursos limitados. No obstante, la información pública disponible es escasa: no se documentan datos de entrenamiento, benchmarks ni límites de contexto del modelo base más allá de los parámetros de generación sugeridos en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3, ajustada con DoRA |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card sugiere `num_ctx 8192` en Ollama, pero no se especifica el máximo oficial) |
| Tipos de cuantizacion | Q2_K, Q4_K_M, Q8_0 |
| Idiomas soportados | inglés (en), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales FP16/BF16 en el repositorio base |

## Arquitectura y entrenamiento
El modelo se construye sobre la arquitectura Qwen3, un transformer decoder-only, y se ajusta mediante DoRA, una variante de LoRA que descompone los pesos en magnitud y dirección para mejorar la estabilidad y calidad del ajuste fino con bajo rango. El entrenamiento está orientado a producir razonamiento explícito en formato Chain-of-Thought: el modelo genera primero un bloque interno delimitado por `<think>...</think>` y después la respuesta final, lo que permite transparencia en el proceso de inferencia y facilita la depuración de errores lógicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La model card menciona que los archivos GGUF se generaron con el pipeline oficial de cuantización de llama.cpp, preservando la profundidad de razonamiento del modelo original. El contexto máximo nativo del modelo base no se especifica; la configuración de Ollama sugiere 8192 tokens como valor de trabajo.

## Capacidades
- Generación de texto conversacional con razonamiento paso a paso previo a la respuesta final.
- Modo de razonamiento nativo mediante etiquetas `<think>`, útil para tareas de lógica, matemáticas y análisis multi-paso.
- Generación de código y explicación de fragmentos de código (capacidad inferida de la arquitectura Qwen3, no documentada explícitamente en la model card).
- Soporte bilingüe inglés-indonesio.
- Compatibilidad con Ollama, llama.cpp, LM Studio y GPT4All para inferencia local.
- Ejecución offline sin dependencia de API ni conexión a internet.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: el razonamiento estructurado lo facilita, pero no se documenta un framework específico.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Asistente de razonamiento offline en portátiles: con la cuantización Q4_K_M (~2,7 GB) el modelo cabe en equipos con 6 GB de RAM, permitiendo un asistente local que razona paso a paso sin enviar datos a servicios externos.
- Atención al cliente en indonesio e inglés: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, adecuado para empresas indonesias que necesitan un chatbot desplegable en infraestructura propia.
- Educación y tutoría: el bloque `<think>` permite mostrar al estudiante el razonamiento intermedio, útil en plataformas de aprendizaje que quieren explicar la resolución de problemas matemáticos o lógicos.
- Prototipado en dispositivos edge: la cuantización Q2_K (~1,7 GB) permite ejecutarlo en Raspberry Pi o portátiles antiguos con 4 GB de RAM para tareas de clasificación, resumen o generación de texto sencilla.
- Desarrollo de aplicaciones con llama.cpp: integración en pipelines en C/C++ o Python mediante la API de llama.cpp para generación de texto embebida en aplicaciones de escritorio.
- Investigación en ajuste fino eficiente: al estar basado en DoRA sobre Qwen3, sirve como punto de partida para estudiar la transferencia de razonamiento en modelos pequeños y su comportamiento tras cuantización agresiva.
- Despliegue en entornos con restricciones de privacidad: sectores como salud o legal en Indonesia que requieren procesamiento local de datos sensibles sin salida a la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Cuantizacion | Tamano estimado | RAM minima | Calidad relativa |
|---|---|---|---|
| Q2_K | ~1,7 GB | 4 GB | Comprimida, apta para hardware muy limitado |
| Q4_K_M | ~2,7 GB | 6 GB | ~95% de la calidad FP16 segun la model card |
| Q8_0 | ~4,5 GB | 8 GB | Cercana a FP16 |

- VRAM estimada para inferencia: no requiere GPU; puede ejecutarse en CPU. Con GPU, la VRAM necesaria equivale aproximadamente al tamano del archivo mas el contexto (p. ej., Q4_K_M con 8K de contexto requiere en torno a 3-4 GB de VRAM).
- GPU recomendadas: no se especifican en la documentacion. Cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, etc.) puede alojar las cuantizaciones Q4_K_M y Q8_0.
- Cabe en GPU consumer: si, en modelos como RTX 3060/4060/4090 y en Apple Silicon (M1/M2/M3) mediante Metal.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp, LM Studio, GPT4All.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AgusTini (AxonAI MX4 2.0 GGUF) | 4B | no disponible (sugerido 8192) | Apache 2.0 | GGUF | Razonamiento CoT nativo, bilingue en/id |
| Qwen3-4B | 4B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base de referencia de la familia Qwen3 |
| Llama 3.2 3B Instruct | 3B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, sin modo de razonamiento explicito |
| Phi-3.5-mini Instruct | 3,8B | 128K (segun documentacion publica de Microsoft) | MIT | safetensors, GGUF | Orientado a razonamiento y codigo |

La comparativa se limita a datos de parametros y licencia, ya que no hay benchmarks publicados de AgusTini que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas de su tamano.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de conocimiento factual y matematicas complejas.
- La cuantizacion Q2_K puede degradar significativamente la coherencia del razonamiento; el autor recomienda Q4_K_M como equilibrio.
- Cobertura linguistica limitada a ingles e indonesio; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- El contexto maximo nativo no esta especificado; usar valores superiores a 8192 tokens puede provocar degradacion o errores.
- El modelo esta etiquetado como desarrollado en un centro educativo (SMKN 26 Jakarta); no hay evidencia de evaluaciones independientes ni de uso en produccion a escala.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de documentacion sobre el dataset de entrenamiento impide descartar problemas de procedencia de datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Daffaadityp/AgusTini
- Modelo base (pesos completos): https://huggingface.co/Daffaadityp/AxonAI-MX4-2.0
- llama.cpp (herramienta de cuantizacion e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- GPT4All: no disponible (no se enlaza en la model card)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor: https://github.com/Daffaadityp
