# liruiyangnb666/DeepSeek-R1-Distill-Qwen-7B

## Resumen

El modelo `liruiyangnb666/DeepSeek-R1-Distill-Qwen-7B` es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5 de 7B parámetros, publicada originalmente por DeepSeek AI y re-subida por el usuario liruiyangnb666. Este modelo forma parte de la familia de modelos de razonamiento de primera generación de DeepSeek, que emplea cadenas de pensamiento (chain-of-thought) para resolver problemas complejos de matemáticas, código y lógica. La destilación consiste en fine-tuning de un modelo denso más pequeño usando datos generados por el modelo R1 completo, logrando un rendimiento comparable a OpenAI-o1-mini en diversas tareas, pero con un tamaño mucho más reducido.

Con 7.615.616.512 parámetros, este modelo es adecuado para entornos con recursos limitados, permitiendo inferencia en GPUs de consumo medio. Su licencia MIT facilita su uso comercial y académico sin restricciones. Aunque la información proporcionada no detalla la longitud de contexto ni los idiomas soportados, al estar basado en Qwen2.5 se espera un contexto de 128K tokens y soporte multilingüe, aunque no está confirmado en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer densa de Qwen2.5, sin mezcla de expertos (MoE). El entrenamiento se realizó mediante destilación: se generaron datos de razonamiento (cadenas de pensamiento largas) a partir del modelo DeepSeek-R1 completo y se usaron para fine-tuning del modelo base Qwen2.5-7B. Este proceso se describe en el paper de DeepSeek-R1 (arXiv:2501.12948), donde se demuestra que los modelos destilados superan a los entrenados con RL puro en tamaños pequeños. No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset, pero se sabe que se emplearon datos de alta calidad centrados en razonamiento, matemáticas y código.

## Capacidades

- Razonamiento complejo con cadena de pensamiento explícita, incluyendo auto-verificación y reflexión.
- Generación de texto y respuesta a preguntas conversacionales.
- Resolución de problemas matemáticos avanzados (álgebra, cálculo, probabilidad).
- Generación y depuración de código en múltiples lenguajes de programación.
- Soporte multilingüe heredado de Qwen2.5, aunque no confirmado en esta versión.
- No se ha confirmado soporte para tool calling ni function calling en la información disponible.
- No se ha confirmado soporte para visión ni audio.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas de nivel universitario y explicar paso a paso el proceso, útil para plataformas educativas o tutores virtuales.
- Generación de código en entornos de desarrollo: integrable en editores o pipelines de CI/CD para generar fragmentos de código, documentar funciones o sugerir correcciones.
- Análisis de datos y lógica: puede procesar consultas complejas sobre datos estructurados, ayudando en tareas de extracción de información y razonamiento deductivo.
- Chatbot de soporte técnico: con su capacidad de razonamiento, puede manejar consultas multi-turno que requieren deducción y seguimiento de contexto.
- Investigación académica: útil para verificar demostraciones matemáticas, generar hipótesis o explorar soluciones a problemas de lógica.
- Automatización de tareas de razonamiento en backends: puede servir como motor de inferencia para sistemas que necesitan resolver problemas de planificación o toma de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de DeepSeek-R1 reporta métricas para los modelos destilados, pero no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 4-5 GB; con 8 bits, unos 8-9 GB; en precisión completa (fp16), alrededor de 15 GB.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100 (para fp16). En consumer, una RTX 3060 12GB puede ejecutar versiones cuantizadas a 4 bits.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y text-generation-inference (según los tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (este) | 7.6B | no disponible | MIT | Destilado de R1 sobre Qwen2.5 |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible | MIT | Versión más pequeña, menor rendimiento |
| DeepSeek-R1-Distill-Qwen-14B | 14B | no disponible | MIT | Versión más grande, mejor rendimiento |
| Qwen2.5-7B (base) | 7.6B | 128K | Apache 2.0 | Sin destilación, razonamiento general |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos potenciales heredados de los datos de entrenamiento de Qwen2.5 y de los datos generados por DeepSeek-R1; no se han evaluado específicamente.
- Riesgo de alucinación en tareas fuera de su dominio de razonamiento, especialmente en hechos factuales.
- Longitud de contexto no confirmada; aunque Qwen2.5 soporta 128K, esta versión podría tener limitaciones.
- Idiomas soportados no documentados; probablemente funcione mejor en inglés y chino, con menor rendimiento en otros idiomas.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los pesos sean legítimos y no contengan restricciones adicionales.
- Al ser una re-subida por un tercero, no hay garantía de que el modelo sea idéntico al oficial de DeepSeek.

## Enlaces

- HuggingFace: https://huggingface.co/liruiyangnb666/DeepSeek-R1-Distill-Qwen-7B
- Paper: https://arxiv.org/abs/2501.12948
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Modelo oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
