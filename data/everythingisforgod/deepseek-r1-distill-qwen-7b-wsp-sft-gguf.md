# EverythingIsForGod/DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF es una edición afinada y cuantizada del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicada por el usuario EverythingIsForGod en Hugging Face. Se trata de un modelo de generación de texto de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) basado en la arquitectura Qwen2, que hereda la capacidad de razonamiento del linaje DeepSeek-R1 destilado sobre una base Qwen. El autor lo presenta como una versión con "Weight-Space Programming" (WSP) y un ajuste fino supervisado (SFT) mediante LoRA de extremo a extremo, orientado a dominios de ingeniería de software, diseño de sistemas distribuidos, ingeniería de redes y ciberseguridad defensiva y ofensiva ética.

El modelo se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M (4,36 GiB), lo que lo hace ejecutable en hardware de consumo mediante llama.cpp u Ollama. Según la model card, mantiene las 28 capas intactas (full-depth), sin poda de capas, y ha sido verificado para baja perplejidad y razonamiento coherente en las áreas citadas. El repositorio ocupa 4,7 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia radica en ofrecer una variante ligera y desplegable localmente de un modelo de razonamiento destilado, especializada en tareas técnicas de seguridad y arquitectura de software, con licencia MIT y compatibilidad con endpoints y herramientas de inferencia local. No obstante, la información pública disponible es muy limitada: no se detallan hiperparámetros de entrenamiento, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 (modelo destilado de DeepSeek-R1) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M (4,36 GiB); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-7B, un destilado de razonamiento de DeepSeek-R1 sobre la arquitectura Qwen2. Sobre esa base, el autor aplica un proceso que denomina Weight-Space Programming (WSP) seguido de un ajuste fino supervisado (SFT) mediante LoRA de extremo a extremo, preservando las 28 capas del modelo original sin poda. Posteriormente se cuantiza a GGUF Q4_K_M. La model card afirma que el resultado mantiene baja perplejidad y coherencia en razonamiento, pero no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales.

No se documentan innovaciones técnicas propias más allá del pipeline WSP + SFT + cuantización. Tampoco se detalla la metodología exacta del WSP ni los hiperparámetros del ajuste LoRA (rango, alpha, tasa de aprendizaje, épocas). Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento paso a paso, heredado de la destilación de DeepSeek-R1.
- Razonamiento sobre ingeniería de software y concurrencia, según la model card.
- Diseño de sistemas distribuidos.
- Ingeniería de redes y conceptos de seguridad CEH (Certified Ethical Hacker).
- Pentesting ético, bug bounty y remediación de seguridad web.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints y despliegue local vía llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible de forma explícita (el razonamiento destilado sugiere capacidad de cadena de pensamiento, pero no se documenta).
- Capacidades multilingües: limitadas a inglés según el campo `language`.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

- Asistencia en revisión de código y detección de problemas de concurrencia: el modelo puede analizar fragmentos de código y señalar condiciones de carrera o bloqueos, aprovechando su ajuste en ingeniería de software y concurrencia.
- Diseño de arquitecturas de sistemas distribuidos: útil para generar propuestas de descomposición de servicios, patrones de consistencia y tolerancia a fallos en fase de diseño.
- Formación y simulación en ciberseguridad ética: puede explicar conceptos CEH, vectores de ataque y contramedidas en un entorno controlado de laboratorio.
- Redacción de informes de bug bounty y remediación web: ayuda a estructurar hallazgos, severidad y recomendaciones de parcheo para equipos de seguridad defensiva.
- Asistente local de ingeniería de redes: resolución de dudas sobre configuración, segmentación y diagnóstico, ejecutable en portátil con GPU de consumo gracias a su cuantización Q4_K_M de 4,36 GiB.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp u Ollama sin conexión, encaja en organizaciones que no pueden enviar datos a la nube.
- Prototipado rápido de chatbots técnicos internos: integrable mediante endpoints compatibles para pruebas de concepto de soporte a desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M (4,36 GiB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 para mayor throughput, aunque el modelo es sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). También puede ejecutarse en CPU con llama.cpp, con mayor latencia.
- Opciones de despliegue: llama.cpp (binario `llama-cli` con `-ngl 99`), Ollama (`ollama create` / `ollama run`), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF (este) | 7,6 B | no disponible | MIT | GGUF Q4_K_M | Ajuste WSP + SFT en seguridad y software |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B | no disponible | MIT | safetensors | Modelo base de razonamiento destilado |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista con soporte multilingüe |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.1 Community License | safetensors, GGUF | Modelo generalista con contexto largo |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa. El rendimiento comparado no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un modelo entrenado mayoritariamente en inglés, puede presentar sesgos culturales y lingüísticos propios de esa distribución.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el ajuste en dominios técnicos no elimina la posibilidad de generar APIs, comandos o configuraciones incorrectas.
- Limitaciones de contexto o idioma: solo se declara inglés; la longitud de contexto no está especificada y el ejemplo usa 8192 tokens, por lo que no debe asumirse una ventana mayor.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; conviene verificar las obligaciones de la licencia del modelo base y de Qwen2.
- Caveat para producción: el repositorio no registra descargas ni validación comunitaria, y la model card no aporta benchmarks ni detalles de entrenamiento; se recomienda evaluación propia antes de desplegarlo en entornos críticos.
- Riesgo de uso indebido en ciberseguridad: aunque se orienta a pentesting ético, un modelo con conocimiento de vectores de ataque requiere controles de acceso y supervisión.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en safetensors; no se han publicado métricas de degradación.

## Enlaces

- Hugging Face: https://huggingface.co/EverythingIsForGod/DeepSeek-R1-Distill-Qwen-7B-WSP-SFT-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio DeepSeek-R1 (referencia del linaje): https://github.com/deepseek-ai/DeepSeek-R1
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
