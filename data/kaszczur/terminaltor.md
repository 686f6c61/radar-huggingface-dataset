# kaszczur/terminaltor

## Resumen

El modelo `kaszczur/terminaltor` es un fine-tune del modelo Qwen3.5-0.8B, convertido a formato GGUF mediante la librería Unsloth. Está diseñado para ejecutarse con llama.cpp y sus herramientas asociadas, tanto en modo texto puro (`llama-cli`) como en modo multimodal (`llama-mtmd-cli`), ya que incluye un proyector de visión (archivo `BF16-mmproj.gguf`). Con aproximadamente 772 millones de parámetros, se trata de un modelo compacto orientado a despliegues ligeros, inferencia en CPU o GPUs de baja capacidad, y aplicaciones conversacionales o de visión-lenguaje en entornos con recursos limitados.

El autor, `kaszczur`, ha publicado el modelo con etiquetas que indican compatibilidad con `llama.cpp`, soporte de cuantización con `imatrix`, y compatibilidad con endpoints (probablemente API estilo OpenAI). Aunque el repositorio no incluye información sobre licencia, idiomas o pipeline, el hecho de estar en GGUF y tener un proyector multimodal sugiere que puede procesar tanto texto como imágenes. Su relevancia actual radica en la tendencia de modelos pequeños y eficientes que pueden ejecutarse localmente, sin necesidad de infraestructura cloud, manteniendo capacidades básicas de razonamiento y conversación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Qwen3.5-0.8B), con proyector multimodal para visión |
| Parametros totales | 772.845.888 (~0,77 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (archivo principal), además de BF16 para el proyector multimodal |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (para llama.cpp), con archivo adicional BF16 para el proyector |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Por su nombre y tamaño, se infiere que sigue el diseño de los modelos Qwen3.5 de 0.8B: un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y embeddings rotatorios (RoPE) para posiciones. La inclusión de un archivo `mmproj` indica que el modelo ha sido adaptado para aceptar entradas visuales mediante un proyector que alinea características de imagen con el espacio de texto.

El entrenamiento se realizó mediante fine-tuning con la librería Unsloth, que optimiza el proceso de ajuste fino para modelos pequeños, logrando una velocidad de entrenamiento aproximadamente 2 veces superior a los métodos convencionales. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El modelo se convirtió a GGUF para su uso con llama.cpp, lo que permite cuantización y ejecución eficiente en CPU y GPU.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", por lo que puede mantener diálogos multi-turno.
- Procesamiento multimodal: gracias al archivo `mmproj`, puede recibir imágenes junto con texto y generar respuestas basadas en ellas (visión-lenguaje).
- Compatibilidad con llama.cpp: se puede ejecutar con `llama-cli` para texto y `llama-mtmd-cli` para multimodal, lo que facilita su integración en aplicaciones locales.
- Soporte de cuantización imatrix: el modelo incluye etiqueta `imatrix`, lo que sugiere que se ha optimizado la cuantización para mejorar la precisión en pesos cuantizados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servir a través de APIs compatibles con OpenAI, probablemente mediante servidores como llama.cpp server o vLLM.
- Inferencia eficiente: al ser un modelo de 0.8B, puede ejecutarse en hardware modesto, incluyendo CPUs modernas y GPUs con poca VRAM.

## Casos de uso

- Asistente conversacional en dispositivos edge: por su tamaño reducido y formato GGUF, puede desplegarse en Raspberry Pi, mini-PCs o portátiles antiguos para ofrecer un chat local sin conexión a internet.
- Análisis de imágenes en entornos sin GPU: gracias al proyector multimodal, puede describir o responder preguntas sobre imágenes usando solo CPU, útil en aplicaciones de accesibilidad o documentación.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden probar flujos de conversación o visión-lenguaje con un modelo pequeño antes de migrar a modelos más grandes.
- Chatbot de atención al cliente en intranets: al ser ligero, puede integrarse en servidores internos con recursos limitados para responder consultas frecuentes.
- Generación de descripciones de productos en e-commerce: puede procesar imágenes de productos y generar texto descriptivo, aunque con limitaciones propias de un modelo pequeño.
- Educación y experimentación: sirve para enseñar conceptos de fine-tuning, cuantización y despliegue de modelos multimodales en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.8B cuantizado a Q4_K_M, el archivo GGUF ocupa aproximadamente 0.7 GB. La VRAM necesaria para inferencia completa ronda los 1-2 GB, dependiendo del contexto y del proyector multimodal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o incluso iGPUs modernas. También puede ejecutarse en CPU con suficiente RAM (4 GB o más).
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales, incluidas las integradas de Intel o AMD.
- Opciones de despliegue: llama.cpp (cliente CLI o servidor), Ollama (si se importa el GGUF), vLLM (con adaptación), o cualquier servidor compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales, pero para un modelo de 0.8B en CPU se esperan decenas de tokens por segundo; en GPU, cientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `kaszczur/terminaltor` (Qwen3.5-0.8B) | 0,77B | No disponible | No disponible | GGUF | Multimodal, fine-tune con Unsloth |
| Qwen2.5-0.5B | 0,5B | 32K (típico) | Apache 2.0 | Safetensors, GGUF | Solo texto, base |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 license | Safetensors, GGUF | Solo texto, base |
| SmolLM2-360M | 0,36B | 2K | Apache 2.0 | Safetensors, GGUF | Solo texto, base |

No se dispone de datos de rendimiento comparativo entre estos modelos y `terminaltor`. La comparación se basa únicamente en tamaño y características generales.

## Limitaciones y advertencias

- Información insuficiente: no se conoce la licencia, los idiomas soportados, el contexto máximo ni los datos de entrenamiento. Esto dificulta su uso en producción sin validación previa.
- Riesgo de alucinación: al ser un modelo pequeño, es más propenso a generar respuestas inexactas o inventadas, especialmente en tareas complejas.
- Capacidad limitada de razonamiento: con solo 0,77B de parámetros, su rendimiento en matemáticas, código o razonamiento lógico será significativamente inferior a modelos de mayor tamaño.
- Sesgos potenciales: al no conocer el dataset de entrenamiento, no se puede evaluar la presencia de sesgos de género, raza o cultura.
- Soporte multimodal básico: el proyector de visión puede manejar imágenes simples, pero probablemente falla en tareas de detección fina o comprensión visual compleja.
- Sin garantía de soporte: el repositorio no muestra actividad reciente (cero descargas y likes), por lo que el mantenimiento y la documentación son mínimos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaszczur/terminaltor
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): https://github.com/ggerganov/llama.cpp
