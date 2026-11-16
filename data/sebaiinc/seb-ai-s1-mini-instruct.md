# sebaiinc/Seb-AI-S1-Mini-Instruct

## Resumen
Seb AI S1 Mini Instruct es un modelo de lenguaje de 409 millones de parámetros desarrollado por Seb AI Inc., entrenado desde cero (no es un fine-tune de un modelo existente) y ajustado por instrucciones. Utiliza una arquitectura de tipo Llama (`LlamaForCausalLM`) con una ventana de contexto de solo 512 tokens, lo que lo sitúa en la gama de modelos pequeños orientados a tareas acotadas y despliegue en hardware muy limitado.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial, modificación y redistribución sin restricciones adicionales. Está entrenado exclusivamente en inglés y su formato de prompt es un esquema simple `User: ... / Assistant:`, sin tokens especiales documentados.

Su relevancia es limitada en el panorama actual: con 409M de parámetros y 512 tokens de contexto queda por debajo de modelos pequeños como Qwen2.5-0.5B o SmolLM2-360M en capacidades generales, pero puede resultar útil como base para experimentación, fine-tuning ligero o despliegue en entornos con menos de 1 GB de VRAM en cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Llama (`LlamaForCausalLM`) |
| Parametros totales | 408.996.864 (~409M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en precisión original; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer causal densa con la implementación `LlamaForCausalLM` de Hugging Face, es decir, atención multi-cabeza estándar con normalización RMSNorm y activación SwiGLU, siguiendo el diseño de la familia Llama. No se especifican en la model card el número de capas, dimensión oculta, número de cabezas de atención ni el vocabulario utilizado.

El entrenamiento se realizó desde cero (preentrenamiento propio, no derivado de otro modelo) seguido de un ajuste por instrucciones de pesos completos sobre datasets conversacionales multi-turno, diálogo informal y datos de identidad personalizados por Seb AI Inc. No se documentan el número de tokens de preentrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se describen innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades
- Generación de texto en inglés con formato conversacional simple (`User:` / `Assistant:`).
- Diálogo multi-turno dentro de la ventana de 512 tokens.
- Respuestas de identidad personalizada (el modelo conoce su creador, Seb AI Inc.).
- Razonamiento básico y respuesta a instrucciones directas, limitado por su tamaño.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso
- Experimentación educativa: sirve como base para estudiar el ciclo completo de preentrenamiento y ajuste por instrucciones en un modelo de 409M, con un repo de 6,6 GB manejable en una estación de trabajo.
- Fine-tuning ligero en dominio: al estar entrenado desde cero y bajo Apache 2.0, puede ajustarse para tareas específicas de clasificación o generación corta en inglés con datasets pequeños.
- Despliegue en entornos con recursos mínimos: en cuantización de 4 bits ocupa aproximadamente 250 MB, por lo que puede ejecutarse en CPU o GPUs integradas para demos y prototipos.
- Chatbots de dominio acotado: útil para asistentes de FAQ o atención simple donde las respuestas caben en 512 tokens y el inglés es suficiente.
- Generación de texto corto: descripciones, resúmenes breves o respuestas plantilla en pipelines de bajo coste.
- Base para investigación sobre alineación: permite comparar técnicas de instruction tuning en un modelo pequeño y reproducible desde cero.
- Pruebas de integración con `transformers`: útil para validar pipelines de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: ~0,8 GB solo para pesos (409M × 2 bytes), más overhead de activaciones y KV cache; en la práctica ~1,5-2 GB.
- VRAM estimada en cuantización de 4 bits: ~0,25 GB para pesos; viable en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; también funciona en GPUs integradas y CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM en FP16 y en la mayoría en cuantización de 4 bits.
- Opciones de despliegue: `transformers` (nativo, formato safetensors), llama.cpp u Ollama si se generan cuantizaciones GGUF propias, vLLM y TGI son compatibles con la arquitectura Llama pero no se han publicado configuraciones oficiales.
- Latencia y throughput: no disponibles; con 512 tokens de contexto y 409M de parámetros se espera una latencia baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Seb AI S1 Mini Instruct | ~409M | 512 | Apache 2.0 | en | Entrenado desde cero, sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 | multilingüe | Benchmarks publicados, tool calling, contexto amplio |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Apache 2.0 | en (principalmente) | Benchmarks publicados, entrenado con corpus grande |
| TinyLlama-1.1B-Chat | ~1.1B | 2.048 | Apache 2.0 | en | Benchmarks publicados, mayor tamaño y contexto |

Seb AI S1 Mini Instruct queda por debajo de sus alternativas en contexto (512 frente a 2.048-32.768 tokens) y en documentación de rendimiento, aunque comparte licencia permisiva y un tamaño competitivo para despliegue mínimo.

## Limitaciones y advertencias
- Ventana de contexto muy reducida (512 tokens): no apta para documentos largos, conversaciones extensas ni RAG con contexto amplio.
- Solo inglés: no se garantiza calidad en castellano ni en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas del mismo tamaño.
- Riesgo elevado de alucinación y errores factuales por su tamaño y por la falta de documentación sobre datos de entrenamiento.
- Sesgos desconocidos: no se documenta la composición del corpus ni procesos de filtrado o mitigación de sesgos.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Formato de prompt propietario y simple (`User:` / `Assistant:`); no se documentan tokens de sistema ni de fin de turno, lo que puede complicar la integración en frameworks estándar.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- Repo de 6,6 GB para un modelo de 409M sugiere posibles artefactos de entrenamiento incluidos; conviene revisar el contenido antes de descargarlo en producción.

## Enlaces
- Hugging Face: https://huggingface.co/sebaiinc/Seb-AI-S1-Mini-Instruct
- Model card del autor: incluida en la página de Hugging Face arriba enlazada
- Paper, blog, repositorio o demo oficiales: no disponibles en la información proporcionada
