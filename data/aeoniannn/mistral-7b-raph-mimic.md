# aeoniannn/Mistral-7B-raph-Mimic

## Resumen

Mistral-7B-raph-Mimic es un ajuste fino (fine-tuning) del modelo Mistral 7B Instruct v0.3, desarrollado por el usuario aeoniannn y publicado en Hugging Face. Se trata de un modelo de generación de texto de 7.248 millones de parámetros (7,25 mil millones) derivado de la versión cuantizada en 4 bits de unsloth/mistral-7b-instruct-v0.3-bnb-4bit, sobre el que se ha aplicado un entrenamiento adicional utilizando la librería Unsloth y TRL de Hugging Face.

El modelo hereda la arquitectura transformer decoder-only de la familia Mistral, con una ventana de contexto de 32.768 tokens (característica de Mistral v0.3), aunque la model card no detalla los datos de entrenamiento ni el propósito específico del ajuste. El nombre "raph-Mimic" sugiere un fine-tuning orientado a imitar un estilo o comportamiento concreto, pero no se proporciona información al respecto.

Su relevancia es limitada en el ecosistema actual: con 44 descargas y 0 likes, es un experimento personal más que un modelo de producción. Resulta útil únicamente como ejemplo de fine-tuning ligero con Unsloth sobre una base Mistral, o para quien necesite reproducir el pipeline. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de ajuste es un riesgo importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral) |
| Parametros totales | 7.248.023.552 (7,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral v0.3; no confirmado en la model card) |
| Tipos de cuantizacion | El modelo base es bnb-4bit; los pesos publicados son safetensors (probablemente en precisión completa o 16 bits). No se listan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Mistral 7B, que emplea atención con ventana deslizante (sliding window attention), activación SwiGLU y normalización RMSNorm. La versión v0.3 de Mistral Instruct amplía el contexto a 32.768 tokens y añade un token de fin de secuencia (EOS) específico para tool calling. El modelo base sobre el que se ajustó es la versión cuantizada en 4 bits de unsloth/mistral-7b-instruct-v0.3-bnb-4bit, lo que implica que el fine-tuning se realizó sobre pesos ya cuantizados (QLoRA o similar).

El entrenamiento se llevó a cabo con Unsloth y TRL, según la model card, que indica que fue "2x faster" (el doble de rápido) gracias a Unsloth. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o supervisión directa. Tampoco se detalla ninguna innovación técnica más allá del uso de Unsloth para acelerar el ajuste. La información disponible es insuficiente para evaluar la calidad o el propósito del fine-tuning.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Mistral 7B Instruct v0.3.
- Razonamiento básico y respuesta a instrucciones, aunque el ajuste fino puede haber alterado el comportamiento original.
- Soporte de tool calling y function calling (heredado de Mistral v0.3, que incluye tokens especiales para ello).
- Capacidad de razonamiento multi-paso y uso como agente, en principio heredada, pero no verificada tras el fine-tuning.
- Multilingüe limitado: la model card solo declara inglés, aunque Mistral 7B base tiene cierto soporte para otros idiomas.
- No se documentan capacidades especiales como modo "thinking", visión o audio.

## Casos de uso

- Experimentación con fine-tuning ligero: sirve como ejemplo reproducible de ajuste con Unsloth sobre Mistral 7B cuantizado, útil para desarrolladores que quieran replicar el pipeline en sus propios datasets.
- Generación de texto creativo en inglés: el modelo puede producir narrativa o diálogo, aunque sin garantías de calidad por la falta de documentación del ajuste.
- Prototipado de asistentes conversacionales: con 32k de contexto, puede mantener conversaciones multi-turno largas en inglés, siempre que se valide su comportamiento.
- Pruebas de tool calling en entornos controlados: hereda los tokens de función de Mistral v0.3, por lo que puede integrarse en pipelines de agentes simples, aunque requiere verificación.
- Investigación sobre olvido catastrófico: al ser un fine-tuning sobre una base cuantizada, puede usarse para estudiar cómo el ajuste afecta a las capacidades originales.
- Despliegue en hardware de consumo: al ser un modelo de 7B, cabe en GPUs de 8-12 GB con cuantización, lo que permite probarlo localmente con Ollama o llama.cpp.
- Evaluación comparativa de fine-tunes: como baseline para comparar con otros ajustes de Mistral 7B en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14-15 GB en FP16 (tamaño del repo 14,5 GB); ~4-5 GB en cuantización 4-bit (GGUF Q4_K_M); ~8 GB en 8-bit.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para FP16; RTX 3090/4080 para 8-bit; RTX 3060/4060 Ti (12-16 GB) para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc., usando cuantización 4-bit.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama (requiere convertir a GGUF), Unsloth para inferencia acelerada.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización. En una RTX 4090 con 4-bit se puede esperar un throughput de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aeoniannn/Mistral-7B-raph-Mimic | 7,25 B | 32k (heredado) | Apache 2.0 | Hugging Face (44 descargas) | Fine-tuning no documentado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32k | Apache 2.0 | Hugging Face (muy popular) | Modelo oficial, documentado y con benchmarks |
| unsloth/mistral-7b-instruct-v0.3-bnb-4bit | 7,25 B | 32k | Apache 2.0 | Hugging Face | Versión cuantizada 4-bit, base de este fine-tuning |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128k | Llama 3.1 Community License | Hugging Face | Más contexto y rendimiento superior en benchmarks, pero licencia restrictiva |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; hereda los sesgos de Mistral 7B y los del dataset de ajuste, que se desconoce.
- Riesgo de alucinación: alto, como en todos los modelos de 7B, y agravado por la falta de evaluación del fine-tuning.
- Limitaciones de contexto o idioma: solo se declara inglés; el contexto de 32k es teórico y puede degradarse en la práctica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base es Mistral 7B (Apache 2.0) y el fine-tuning se hizo sobre una versión cuantizada de Unsloth, cuya licencia también es Apache 2.0. No hay restricciones adicionales conocidas.
- Caveats para producción: la model card no documenta el dataset, el número de pasos, la evaluación ni el propósito. No se recomienda su uso en producción sin una validación exhaustiva. El nombre "Mimic" sugiere imitación de estilo, lo que puede producir respuestas no deseadas. Además, el entrenamiento sobre pesos cuantizados en 4 bits puede introducir degradación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/aeoniannn/Mistral-7B-raph-Mimic
- Modelo base: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Mistral 7B Instruct v0.3 (modelo original): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
