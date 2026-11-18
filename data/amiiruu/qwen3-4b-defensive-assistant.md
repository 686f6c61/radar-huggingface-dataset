# amiiruu/qwen3-4b-defensive-assistant

## Resumen

qwen3-4b-defensive-assistant es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario amiiruu y publicado en Hugging Face. Se trata de un asistente conversacional de 4.022 millones de parámetros (4B) orientado a tres áreas: conocimiento general con razonamiento paso a paso, escritura y explicación de código, y ciberseguridad defensiva (MITRE ATT&CK, OWASP, codificación segura, respuesta a incidentes y aprendizaje de CTF).

El modelo se ha entrenado con Unsloth y QLoRA sobre GPUs gratuitas de Kaggle, partiendo de la versión cuantizada en 4 bits del modelo base. El resultado se distribuye principalmente como un archivo GGUF con cuantización Q4_K_M, acompañado de un Modelfile para Ollama y un adaptador LoRA (lora_v2/). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en ofrecer un modelo compacto y desplegable en hardware de consumo, especializado en seguridad defensiva, una nicho poco cubierto por los modelos generalistas de este tamaño. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks, por lo que su rendimiento real no está validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en lora_v2/ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) + adaptador LoRA; safetensors (repo de 2.5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El ajuste fino se realizó con Unsloth y QLoRA (cuantización de 4 bits durante el entrenamiento) sobre la variante `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`. No se especifican en la información disponible detalles sobre la arquitectura interna del modelo base (número de capas, dimensiones, mecanismos de atención) ni la longitud de contexto nativa.

El conjunto de entrenamiento consta de 4.500 ejemplos filtrados provenientes de UltraChat 200k (licencia MIT), CodeAlpaca-20k (CC-BY-4.0), Magicoder-OSS-Instruct-75K (MIT) y Cybersecurity-Dataset-Fenrir-v2.1 (Apache 2.0). Además, se menciona una "refinación v2 de puntos débiles" con replay de datos. No se indica el número total de tokens de entrenamiento, la composición exacta por proporción ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el uso de Unsloth + QLoRA para entrenar en GPUs gratuitas de Kaggle, lo que abarata el proceso, y la distribución en formato GGUF lista para Ollama.

## Capacidades

- Generación de texto y razonamiento paso a paso para conocimiento general.
- Escritura, explicación y depuración de código en múltiples lenguajes (según los datasets de entrenamiento: CodeAlpaca y Magicoder).
- Ciberseguridad defensiva: marcos MITRE ATT&CK y OWASP, codificación segura, respuesta a incidentes, aprendizaje de CTF y guías para pruebas autorizadas.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente de codificación segura: el modelo puede revisar fragmentos de código y señalar vulnerabilidades comunes (inyección SQL, XSS, etc.) basándose en OWASP, gracias a su entrenamiento específico en codificación segura y su base en CodeAlpaca/Magicoder.
- Formación en ciberseguridad defensiva: útil para explicar tácticas y técnicas de MITRE ATT&CK, simular preguntas de CTF y guiar a analistas junior en laboratorios autorizados.
- Respuesta a incidentes en entornos controlados: puede generar borradores de runbooks, checklists de contención y preguntas de triaje, aunque requiere validación humana por su tamaño y riesgo de alucinación.
- Asistente de desarrollo general: al estar afinado sobre UltraChat, puede mantener conversaciones multi-turno para resolver dudas de programación y explicar conceptos técnicos en inglés.
- Despliegue local en estaciones de trabajo: al distribuirse como GGUF Q4_K_M, se puede ejecutar con Ollama en portátiles o equipos sin GPU dedicada, lo que facilita su uso en entornos con requisitos de privacidad.
- Generación de documentación técnica de seguridad: puede redactar políticas de codificación segura, guías de hardening y resúmenes de vulnerabilidades a partir de descripciones de texto.
- Prototipado de chatbots especializados: su compatibilidad con endpoints y el formato Ollama permiten integrarlo rápidamente en demos o pipelines internos de atención a desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 2,5 GB (tamaño del repo), por lo que se estima un uso de VRAM de entre 3 y 4 GB incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para el GGUF cuantizado; para el adaptador LoRA en precisión completa se requeriría más memoria (no especificada).
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en CPU mediante llama.cpp/Ollama.
- Opciones de despliegue: Ollama (`ollama run hf.co/amiiruu/qwen3-4b-defensive-assistant:Q4_K_M`), llama.cpp (formato GGUF), y potencialmente vLLM/TGI si se convierte a safetensors (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| qwen3-4b-defensive-assistant | 4B | no disponible | Apache 2.0 | GGUF + LoRA | Seguridad defensiva + código |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Apache 2.0 | safetensors | Generalista |
| Llama 3.2 3B Instruct | 3B | no disponible | Llama 3.2 Community | safetensors/GGUF | Generalista |
| Phi-3.5-mini | 3,8B | no disponible | MIT | safetensors/GGUF | Generalista + código |

La comparativa se limita a parámetros, licencia y formato, ya que no hay datos de rendimiento publicados para el modelo evaluado. Frente al Qwen3-4B-Instruct-2507 base, este ajuste añade especialización en seguridad defensiva a costa de posibles regresiones en conocimiento general. Frente a Llama 3.2 3B o Phi-3.5-mini, ofrece menor tamaño de comunidad y ausencia de benchmarks, pero una licencia Apache 2.0 más permisiva que la de Llama.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre UltraChat y datasets de código, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: alto en un modelo de 4B, especialmente en dominios técnicos como ciberseguridad, donde puede inventar CVEs, técnicas o comandos.
- Limitaciones de contexto e idioma: solo inglés (`language: en`); la longitud de contexto no está especificada y podría ser limitada en el GGUF.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat para producción: cero descargas y cero likes, sin benchmarks ni validación independiente; no se recomienda su uso en producción sin evaluación previa. El entrenamiento en GPUs gratuitas de Kaggle con solo 4.500 ejemplos sugiere un ajuste ligero que puede no superar al modelo base en tareas generales.
- Uso dual: aunque se orienta a seguridad defensiva, un modelo de este tipo podría generar contenido ofensivo si se le induce; se debe aplicar filtrado y supervisión.

## Enlaces

- Hugging Face: https://huggingface.co/amiiruu/qwen3-4b-defensive-assistant
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Unsloth: https://github.com/unslothai/unsloth
- UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Cybersecurity-Dataset-Fenrir-v2.1: no disponible (no se proporciona URL directa)
