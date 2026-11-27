# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general, una variante "abliterated" (sin censura) del Qwen2.5-Coder-7B-Instruct de Alibaba. El autor, richardyoung, aplica técnicas de "heretización" para eliminar los mecanismos de rechazo del modelo original, manteniendo las capacidades de generación de código y conversación del Qwen2.5-Coder-7B-Instruct. El resultado es un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a investigación sobre alineación y comportamiento de modelos.

La relevancia de esta ficha radica en que documenta una de las muchas variantes "uncensored" que circulan en el ecosistema open source, útiles para estudiar cómo las técnicas de abliteration afectan a las capacidades del modelo base y qué riesgos introduce su uso en producción. El modelo está disponible únicamente en inglés, con licencia Apache 2.0, y su acceso está restringido (gated) en Hugging Face, requiriendo aceptar condiciones adicionales.

Al estar basado en Qwen2.5-Coder-7B-Instruct, hereda la arquitectura transformer decoder-only del Qwen2.5 original, con un contexto nativo de 32.768 tokens (ampliable hasta 131.072 mediante RoPE scaling en el modelo base, aunque esta información no se confirma en la ficha del GGUF). La cuantización GGUF permite su despliegue en hardware consumer mediante llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion habituales en llama.cpp; niveles especificos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atención por ventanas deslizantes (sliding window attention) en algunas capas, normalización RMSNorm, activación SwiGLU y embeddings RoPE. El modelo base Qwen2.5-Coder-7B-Instruct fue entrenado por Alibaba con un corpus masivo que incluye código, texto técnico y datos de conversación, seguido de un proceso de instrucción (SFT) y optimización preferencial (DPO/RLHF) para alineamiento.

Sobre esta base, richardyoung aplica una técnica de "heretización" o "abliteration" que consiste en identificar y modificar las direcciones de activación asociadas a los rechazos de seguridad, eliminando la capacidad del modelo de negarse a responder. El resultado se cuantiza a GGUF mediante imatrix (importance matrix), una técnica que mejora la calidad de la cuantización preservando los pesos más relevantes. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento adicionales, la composición del dataset de heretización ni si se aplicó RLHF tras la modificación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Generación y explicación de código en múltiples lenguajes de programación (heredado de Qwen2.5-Coder).
- Razonamiento matemático y lógico de nivel medio.
- Respuestas sin rechazo a solicitudes que el modelo original rechazaría (comportamiento "uncensored").
- Soporte de formato conversacional (chat template de Qwen).
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles con OpenAI.
- No se confirma soporte de tool calling o function calling en esta variante.
- No se confirma soporte de agentes multi-paso ni modo "thinking".
- Capacidades multilingües limitadas al inglés según la ficha.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a las respuestas del modelo base en dominios sensibles, comparando comportamientos antes y después de la modificación.
- Análisis de sesgos y robustez: útil para auditar qué tipos de contenido genera un modelo sin salvaguardas y diseñar mejores filtros o políticas de despliegue.
- Generación de código en entornos controlados: al heredar las capacidades de Qwen2.5-Coder, puede asistir en tareas de programación dentro de pipelines internos donde no se requiere moderación automática.
- Despliegue local con Ollama o llama.cpp: la cuantización GGUF permite ejecutar el modelo en estaciones de trabajo con GPU consumer para pruebas y prototipado.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre distintos niveles GGUF y el efecto de imatrix en tareas de código y razonamiento.
- Fine-tuning posterior: al estar en formato GGUF y con licencia Apache 2.0, puede servir como base para experimentos de ajuste o destilación en investigación.
- Pruebas de red teaming: escenario controlado para generar respuestas adversarias y evaluar sistemas de moderación externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para cuantización Q4_K_M, 6-7 GB para Q5_K_M, 8-9 GB para Q8_0 y alrededor de 15 GB para FP16 (estimación basada en 7,6 mil millones de parámetros; los tamaños exactos de cada archivo GGUF no se detallan en la información proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 para FP16 y despliegues de mayor throughput.
- Cabe en GPU consumer: sí, en cuantizaciones Q4 y Q5 en GPUs con 8 GB o más de VRAM; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de OpenAI (endpoints_compatible según los tags). No se confirma soporte de vLLM o TGI para esta cuantización GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF | 7,6 B | No disponible | Apache 2.0 | GGUF | Variante abliterated, solo ingles, acceso gated |
| Qwen2.5-Coder-7B-Instruct (Alibaba) | 7,6 B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF | Modelo original alineado, multilingue, benchmarks publicos |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6 B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF | Modelo generalista alineado, multilingue |
| Otras variantes abliterated de Qwen2.5 (varios autores) | 7,6 B | Variable | Apache 2.0 | GGUF, safetensors | Comportamiento similar sin censura, calidad variable |

## Limitaciones y advertencias

- Modelo "abliterated": elimina los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado sin filtros. No apto para despliegues públicos sin moderación externa.
- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de Qwen2.5 y puede amplificarlos al no aplicar salvaguardas.
- Riesgo de alucinación: como todo modelo de 7 B, puede inventar información, especialmente en tareas de razonamiento complejo o datos factuales.
- Limitación de idioma: solo inglés según la ficha, a pesar de que el modelo base Qwen2.5-Coder es multilingüe; el proceso de heretización puede haber degradado capacidades en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) en Hugging Face y el usuario debe aceptar condiciones adicionales; además, el uso comercial de un modelo sin salvaguardas conlleva riesgos legales y reputacionales.
- Contexto: no se confirma la longitud de contexto efectiva en esta cuantización; el modelo base soporta 32.768 tokens, pero la cuantización y la heretización podrían afectar al rendimiento en contextos largos.
- Calidad de cuantización: al ser GGUF, existe degradación respecto a FP16; los niveles bajos (Q2, Q3) pueden afectar notablemente a tareas de código.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Fecha de creación y actualización en 2026: verificar que el modelo base y las dependencias (llama.cpp, Ollama) sean compatibles con la versión de GGUF utilizada.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general-GGUF
- Modelo base (no GGUF): https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general
- Qwen2.5-Coder-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5-coder/
