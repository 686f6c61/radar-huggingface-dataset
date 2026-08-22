# kelsbeans/qwen3-1.7b-digestive-coach-n1102-adapter

## Resumen

Este modelo es un adaptador de Qwen3-1.7B, desarrollado por kelsbeans, que ha sido fine-tuneado específicamente para actuar como un coach de salud digestiva. El nombre del repositorio, "digestive-coach", indica que el ajuste se ha orientado a responder consultas sobre nutrición, digestión y bienestar gastrointestinal. Se trata de un adaptador (no un modelo completo), entrenado sobre la versión cuantizada a 4 bits del Qwen3-1.7B de Unsloth, lo que reduce notablemente los requisitos de hardware para su despliegue.

El modelo base es Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros desarrollado por Alibaba Cloud, con capacidades multilingües y de razonamiento. El adaptador se ha entrenado con las librerías Unsloth y TRL, y el repositorio ocupa 0.1 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo. A pesar de ser un modelo pequeño, su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (Transformer decoder-only) |
| Parametros totales | 1.7B (modelo base) + pesos del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta hasta 32K tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | 4-bit (modelo base bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only de 1.7B parámetros con atención de ventana deslizante y capacidad multilingüe. El adaptador se ha entrenado sobre la versión cuantizada a 4 bits (bnb-4bit) de Unsloth, lo que permite un fine-tuning eficiente en cuanto a memoria y velocidad. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens ni si se utilizó RLHF o DPO. La única información disponible es que se usó la librería TRL de HuggingFace para el entrenamiento, junto con Unsloth para acelerar el proceso.

## Capacidades

- Generación de texto en inglés con foco en consejos de salud digestiva y nutrición.
- Razonamiento básico heredado del modelo base Qwen3-1.7B.
- Soporte de generación de código y matemáticas básicas gracias al modelo base, aunque no se ha validado en este adaptador.
- No se confirma soporte de tool calling, function calling, agentes o multi-step reasoning.
- No se confirma modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Consultas sobre salud digestiva: el modelo puede responder preguntas sobre síntomas, hábitos alimenticios y recomendaciones generales de bienestar digestivo, aunque se debe tratar como información orientativa y nunca como diagnóstico médico.
- Educación nutricional básica: puede explicar conceptos como fibra, probióticos, intolerancias y pautas alimentarias generales.
- Asistente de recordatorio de hábitos: puede ayudar a generar rutinas diarias de alimentación y ejercicio para mejorar la digestión.
- Soporte en aplicaciones de bienestar: puede integrarse en chatbots de aplicaciones móviles o web para ofrecer consejos generales sobre salud digestiva.
- Generación de contenido para blogs o redes sociales sobre temas de nutrición y salud digestiva.
- Prototipado rápido de aplicaciones de asesoramiento en salud: gracias a su tamaño reducido (1.7B) y licencia Apache 2.0, es adecuado para pruebas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros estándares para este adaptador específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit ocupa aproximadamente 1.2-1.5 GB en memoria. Con el adaptador, el total estará por debajo de 2 GB, por lo que puede ejecutarse en GPUs con 4 GB o más de VRAM.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, incluyendo RTX 3050, RTX 4060, RTX 4090, A100, H100, etc.
- Sí cabe en GPUs de consumo: sí, cualquier GPU con 4 GB o más de VRAM puede ejecutar el modelo.
- Opciones de despliegue: puede desplegarse con vLLM, llama.cpp, Ollama o Text Generation Inference (TGI), ya que el formato safetensors es compatible con la mayoría de los servidores de inferencia.
- Latencia y throughput estimados: no se dispone de datos concretos, pero para un modelo de 1.7B en 4-bit, se puede esperar una latencia de alrededor de 20-50 ms por token en una GPU moderna como RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kelsbeans/qwen3-1.7b-digestive-coach-n1102-adapter | 1.7B (base) + adapter | no disponible | Apache 2.0 | Hugging Face |
| kelsbeans/qwen3-1.7b-digestive-coach-n390-adapter | 1.7B (base) + adapter | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1.7B | 32K tokens | Apache 2.0 | Hugging Face |

El modelo es un adaptador del Qwen3-1.7B base, por lo que su rendimiento dependerá del fine-tuning. No se dispone de datos de benchmarks para comparar con otras alternativas en la misma categoría.

## Limitaciones y advertencias

- El modelo no es un sustituto de un profesional médico. Las respuestas sobre salud digestiva deben tratarse como información general y nunca como diagnóstico o tratamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o no verificada, especialmente en dominios especializados como la salud.
- Idioma limitado: solo se ha entrenado en inglés, por lo que no es adecuado para consultas en castellano u otros idiomas.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se ha confirmado la longitud de contexto efectiva en este adaptador.
- Sin datos de rendimiento: no se han publicado resultados de benchmarks, lo que dificulta evaluar su calidad en tareas específicas.
- Modelo en fase temprana: con 0 descargas y 0 likes, no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n1102-adapter
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Modelo base Unsloth: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Modelo similar n390: https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n390-adapter
