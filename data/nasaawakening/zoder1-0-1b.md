# Nasaawakening/Zoder1.0-1B

## Resumen

Zoder1.0-1B es un modelo de lenguaje conversacional de 1.080 millones de parámetros creado por el desarrollador Nasaawakening (Komandan Nasa) mediante una fusión SLERP de dos variantes del modelo MiniCPM5-1B: openbmb/MiniCPM5-1B y GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking. El resultado es un asistente ligero optimizado para despliegue en entornos con recursos limitados, como dispositivos móviles con Termux, y compatible con el ecosistema Ollama y llama.cpp.

El modelo se distribuye en formato safetensors (float16, ~2 GB) y en cuantización GGUF Q4_K_M (~700 MB), lo que permite ejecutarlo en CPU o en GPUs de gama baja. Aunque la model card no detalla la arquitectura interna más allá de indicar 24 capas y el uso de etiquetas "llama", se presume que hereda la estructura de MiniCPM5, un transformer decoder estándar. Su relevancia radica en ofrecer una alternativa compacta y gratuita (licencia Apache 2.0) para tareas de conversación, razonamiento básico y generación de código, con un enfoque claro en la portabilidad.

No se han publicado benchmarks estándar (MMLU, HumanEval, etc.); el autor reporta un 100% de éxito en 8 pruebas propias (conversación, lógica, código, escritura, instrucciones, memoria, matemáticas y conocimiento de Termux), pero estos resultados no son comparables con evaluaciones externas. El modelo está pensado para usuarios que necesitan un asistente funcional en inglés sin requerir infraestructura de alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de MiniCPM5-1B, 24 capas; detalles no especificados) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (mencionado); otros formatos no confirmados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), GGUF |

## Arquitectura y entrenamiento

Zoder1.0-1B no ha sido entrenado desde cero, sino que es el resultado de una fusión SLERP (Spherical Linear Interpolation) entre dos modelos base: openbmb/MiniCPM5-1B y GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking. La fusión se realizó con mergekit, aplicando valores T específicos por capa: para self_attn se usaron [0, 0.5, 0.3, 0.7, 1] y para mlp [1, 0.5, 0.7, 0.3, 0], con un valor por defecto de 0.5. El peso resultante se guardó en float16 y consta de 24 capas.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que el modelo incluye un chat template y un system prompt configurados, lo que sugiere un ajuste fino orientado a conversación, pero no hay detalles técnicos adicionales. Al ser un merge, las capacidades del modelo dependen enteramente de los modelos base, y no se han documentado innovaciones arquitectónicas propias.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de system prompt y plantilla de chat.
- Razonamiento lógico básico, según las pruebas del autor (aunque no hay validación externa).
- Generación de código, específicamente en Python (probado en la benchmark propia).
- Escritura creativa y seguimiento de instrucciones.
- Memoria multi-turno en conversaciones, al menos en contextos cortos.
- Resolución de problemas matemáticos sencillos.
- Conocimiento específico sobre Termux y despliegue en entornos móviles.
- Compatibilidad con herramientas de inferencia estándar: Transformers, llama.cpp, Ollama y Gradio.
- No se menciona soporte explícito para tool calling, funciones, visión o audio.

## Casos de uso

- Asistente conversacional ligero: gracias a su tamaño reducido y la cuantización Q4_K_M (~700 MB), puede desplegarse en dispositivos móviles o Raspberry Pi para mantener conversaciones de soporte o consultas generales en inglés.
- Generación de código en entornos de desarrollo con recursos limitados: el modelo puede generar fragmentos de Python y otros lenguajes básicos, útil para editores de código embebidos o asistentes de terminal.
- Chatbot educativo para estudiantes de inglés: al estar entrenado en inglés y manejar conversación multi-turno, sirve como tutor de práctica idiomática sin requerir GPU dedicada.
- Automatización de tareas en Termux: el modelo incluye un script de instalación para Termux y es optimizado para ese entorno, permitiendo ejecutar un asistente local en Android.
- Prototipado rápido de aplicaciones de chat: al ser compatible con Gradio y Transformers, se puede integrar en un prototipo funcional en pocas líneas de código, ideal para pruebas de concepto.
- Despliegue en servidores de baja potencia: con llama-server y GGUF, puede servir respuestas en una CPU sin GPU, adecuado para intranets o entornos con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una tasa de éxito del 100% en 8 pruebas propias (conversación básica, razonamiento lógico, generación de código en Python, escritura creativa, seguimiento de instrucciones, memoria multi-turno, problemas matemáticos y conocimiento de Termux), pero estos tests no están normalizados ni comparados con otros modelos. Por tanto, no es posible evaluar el rendimiento relativo del modelo frente a alternativas de su categoría.

## Requisitos de hardware

- VRAM estimada: el modelo float16 (~2 GB) requiere al menos 4 GB de VRAM para inferencia cómoda; la versión GGUF Q4_K_M (~700 MB) puede ejecutarse con 1-2 GB de VRAM o incluso solo en CPU.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para la versión completa; para la cuantizada basta una GPU integrada o CPU moderna.
- Compatibilidad con consumer GPU: sí, tanto la versión completa como la cuantizada caben en GPUs de consumo.
- Opciones de despliegue: Transformers (Python), llama.cpp (llama-server), Ollama (con Modelfile), Gradio (web UI) y Termux (entorno Android).
- Latencia y throughput: no se han publicado mediciones oficiales; en una CPU moderna se espera una velocidad de generación de 5-10 tokens/s con la cuantización Q4_K_M, y en GPU puede ser significativamente mayor, pero estos valores son estimaciones sin verificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|--------|------------|----------|----------|---------|-------|
| Zoder1.0-1B | 1.08B | no disponible | Apache 2.0 | safetensors, GGUF | Merge SLERP de MiniCPM5-1B; enfocado a conversación ligera |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo base generalista, sin ajuste conversacional específico |
| Qwen2.5-1.5B | 1.5B | 32768 | Apache 2.0 | safetensors, GGUF | Mayor contexto y capacidades multilingües, más parámetros |
| MiniCPM5-1B (base) | 1.0B | no disponible | Apache 2.0 | safetensors | Modelo original del que deriva Zoder; sin ajuste conversacional |

La comparativa se basa en características públicas; no hay datos de rendimiento estandarizado para Zoder. Qwen2.5-1.5B ofrece un contexto mucho mayor y soporte multilingüe, mientras que TinyLlama es un modelo base sin ajuste para chat. Zoder destaca por su integración con Termux y su naturaleza de merge específico para conversación.

## Limitaciones y advertencias

- Sesgos y calidad: al ser un merge de modelos base, puede heredar sesgos de los datos de entrenamiento de MiniCPM5; no se ha realizado una evaluación de sesgos ni de seguridad.
- Alucinaciones: no hay información sobre la tasa de alucinación; como modelo pequeño, es probable que genere respuestas inventadas en temas complejos.
- Idioma: solo soporta inglés; no es adecuado para tareas en español u otros idiomas.
- Contexto limitado: no se especifica la longitud de contexto; probablemente sea corta (alrededor de 2K-4K tokens), lo que limita conversaciones largas o documentos extensos.
- Benchmarks no verificados: las pruebas reportadas son del autor y no han sido replicadas; no hay garantía de rendimiento en entornos reales.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos base (MiniCPM5) pueden tener restricciones adicionales; se recomienda revisar la licencia de openbmb/MiniCPM5-1B.
- Producción: al ser un modelo pequeño y sin evaluación externa, no se recomienda para aplicaciones críticas o que requieran alta precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nasaawakening/Zoder1.0-1B
- Repositorio de modelos del autor: https://huggingface.co/Nasaawakening/zoder-minicpm-slerp
- GitHub del autor (Mymodels): https://github.com/nasaawakening/Mymodels
- Perfil del autor en Hugging Face: https://huggingface.co/Nasaawakening
