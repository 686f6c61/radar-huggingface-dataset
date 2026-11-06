# OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1-FP8

## Resumen

Luciole-8B-KD-Math-Thinking-1.1-FP8 es una versión cuantizada a FP8 del modelo Luciole-8B-KD-Math-Thinking-1.1, desarrollado por OpenLLM-France, un consorcio francés dedicado a la creación de modelos de lenguaje abiertos con especial énfasis en el idioma francés. El modelo base es un transformer de 8.360.209.920 parámetros (aproximadamente 8,36 mil millones) afinado específicamente para razonamiento matemático y modo "thinking", es decir, generación de cadenas de razonamiento explícitas antes de la respuesta final.

La relevancia de esta versión FP8 radica en su formato de cuantización: utiliza compressed-tensors, el formato nativo de vLLM, lo que permite servir el modelo con aceleración FP8 en GPUs con soporte nativo para este tipo de precisión (arquitecturas NVIDIA Hopper, Ada Lovelace y Blackwell). Esto reduce los requisitos de memoria y aumenta el throughput en producción sin necesidad de conversiones adicionales.

El modelo está orientado a generación de texto conversacional en francés e inglés, con licencia Apache 2.0, lo que facilita su uso comercial. Su especialización en matemáticas y razonamiento paso a paso lo posiciona como una opción interesante para aplicaciones educativas, asistentes técnicos y pipelines de resolución de problemas en entornos francófonos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Nemotron, según tags del repositorio) |
| Parámetros totales | 8.360.209.920 (~8,36 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización compressed-tensors (FP8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de aproximadamente 8,36 mil millones de parámetros, etiquetado en el repositorio con el tag "nemotron", lo que sugiere una base arquitectónica inspirada en la familia Nemotron de NVIDIA. El modelo base Luciole-8B-KD-Math-Thinking-1.1 incorpora un modo de razonamiento ("thinking") orientado a problemas matemáticos, probablemente mediante destilación de conocimiento (KD, knowledge distillation) desde un modelo mayor, tal como indica el sufijo "KD" en su nombre. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión FP8 se ha generado con LLM Compressor, la herramienta del ecosistema vLLM, y se distribuye en formato compressed-tensors. Esta cuantización reduce el peso de los pesos de ~16 GB (BF16) a aproximadamente 9,3 GB, manteniendo la compatibilidad directa con vLLM para inferencia acelerada en hardware con soporte FP8 nativo. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional en francés e inglés.
- Razonamiento matemático con modo "thinking": el modelo genera cadenas de razonamiento explícitas antes de emitir la respuesta final.
- Resolución de problemas paso a paso, adecuado para tareas que requieren descomposición lógica.
- Destilación de conocimiento (KD) desde un modelo mayor, orientada a mejorar el rendimiento en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito por el modo thinking, pero no documentado explícitamente.
- Capacidades multilingües limitadas a francés e inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones paso a paso de problemas matemáticos, lo que lo hace adecuado para plataformas educativas en francés que requieran mostrar el razonamiento intermedio al estudiante.
- Asistente técnico en francés: gracias a su entrenamiento específico en este idioma y su modo thinking, puede emplearse en atención al usuario para resolver consultas técnicas que impliquen cálculos o lógica.
- Generación de contenido educativo: creación de ejercicios resueltos, guías de estudio y material didáctico con razonamiento explícito, aprovechando la licencia Apache 2.0 para uso comercial.
- Integración en pipelines de vLLM: al estar en formato compressed-tensors FP8, se puede desplegar directamente con `vllm serve` para servir una API compatible con OpenAI en producción.
- Procesamiento de documentación técnica bilingüe: traducción y resumen de documentación entre francés e inglés con razonamiento sobre el contenido.
- Prototipado rápido de asistentes conversacionales: su tamaño de 8,36 B y su cuantización FP8 permiten desplegarlo en una sola GPU, facilitando iteración en entornos de desarrollo.
- Análisis de problemas con verificación de pasos: en entornos de investigación, puede utilizarse para generar trazas de razonamiento que luego se validan manualmente o con herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,3 GB solo para los pesos en FP8; con overhead de KV cache y activaciones, se recomienda un mínimo de 16 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA H100, H200, B200 (Blackwell) y GPUs Ada Lovelace como L40S o RTX 4090, que cuentan con soporte nativo FP8.
- Compatibilidad con consumer GPU: sí, en GPUs Ada Lovelace como la RTX 4090 (24 GB), siempre que se use vLLM con soporte FP8. En GPUs Ampere (RTX 3090, A100) el FP8 no tiene aceleración nativa y podría requerir fallback a BF16.
- Opciones de despliegue: vLLM es el método recomendado (`vllm serve OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1-FP8`). No se documenta soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Luciole-8B-KD-Math-Thinking-1.1-FP8 | ~8,36 B | No disponible | Apache 2.0 | safetensors FP8 (compressed-tensors) | fr, en |
| Luciole-8B-KD-Math-Thinking-1.1 (base) | ~8,36 B | No disponible | Apache 2.0 | safetensors (BF16 presumiblemente) | fr, en |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (8B especializados en matemáticas y francés) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo entrenado principalmente con datos en francés e inglés, puede presentar sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el modo thinking puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas matemáticos complejos.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar el rendimiento en conversaciones multi-turno largas o documentos extensos.
- Limitaciones de idioma: solo se declaran francés e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero requiere mantener el aviso de licencia y no ofrece garantías.
- Caveat de producción: la aceleración FP8 requiere hardware con soporte nativo (Hopper, Ada Lovelace, Blackwell); en GPUs Ampere o anteriores el rendimiento puede degradarse o requerir conversión a BF16.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto reciente y sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1-FP8
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
