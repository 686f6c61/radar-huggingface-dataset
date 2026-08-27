# manfye/PetInst-LLM-1B-GGUF

## Resumen

El modelo manfye/PetInst-LLM-1B-GGUF es una versión cuantizada en formato GGUF de un modelo de 1.000 millones de parámetros orientado a aplicaciones de asistente conversacional con capacidades de function calling y tool use. Desarrollado por el usuario manfye, se presenta como una solución ligera para entornos on-device, pensada especialmente para el ámbito de las mascotas virtuales (virtual pet) y otros escenarios con restricciones de recursos. Los tags indican que está basado en la familia Gemma-3, aunque no se especifica la arquitectura exacta ni el proceso de entrenamiento.

Esta ficha cubre la variante GGUF, que es la que permite ejecutar el modelo con llama.cpp y otros motores compatibles. El modelo base es manfye/PetInst-LLM-1B-MLX (formato MLX), del cual esta versión es una cuantización. El acceso está restringido en HuggingFace, por lo que hay que aceptar las condiciones de la licencia Gemma antes de descargarlo. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma-3 (arquitectura transformer, no se confirma el diseño exacto) |
| Parametros totales | 999.935.952 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes Q4_K, Q5_K, Q8_0, etc. no especificadas) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (licencia de Google Gemma, con condiciones de uso) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo. Los tags indican que pertenece a la familia Gemma-3, lo que sugiere un diseño transformer con atención multi-cabeza y posiblemente alguna variante de atención local, pero no se confirma en los metadatos. El modelo base MLX (manfye/PetInst-LLM-1B-MLX) probablemente fue entrenado mediante fine-tuning sobre un modelo Gemma-3 pre-entrenado, pero no hay datos sobre el dataset, número de tokens, ni si se aplicaron técnicas de RLHF o DPO. Esta versión GGUF es una cuantización del modelo MLX, realizada para permitir su ejecución en motores como llama.cpp, Ollama o vLLM con menor consumo de recursos.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como indica el tag "conversational".
- Function calling / tool use: los tags "function-calling" y "tool-use" confirman que el modelo ha sido entrenado para invocar herramientas externas, útil en agentes y asistentes.
- Optimizado para on-device: al ser de 1B y cuantizado, es apto para ejecutarse en móviles, Raspberry Pi o edge devices.
- Orientado a mascotas virtuales: el tag "virtual-pet" sugiere que fue afinado para interacciones de mascotas digitales, con respuestas emocionales y de juego.
- Multilingüe: no, solo se declara el inglés (en).
- No se especifican capacidades de visión, audio o razonamiento multi-paso más allá de lo indicado.

## Casos de uso

- Asistentes virtuales en dispositivos móviles: el modelo puede gestionar diálogos en tiempo real con función de llamada a herramientas (calendario, mensajes, etc.) sin depender de la nube, gracias a su tamaño reducido y su soporte de tool calling.
- Aplicaciones de mascota virtual: se puede integrar en un juego o aplicación de cuidado de mascotas donde el modelo simule el comportamiento de la mascota, respondiendo a comandos y manteniendo una conversación coherente, con bajo consumo de batería.
- Agentes de automatización en edge computing: en un dispositivo con recursos limitados (Raspberry Pi, teléfono), el modelo puede actuar como agente que ejecuta tareas locales (encender luces, consultar sensores) usando las funciones que se le han enseñado.
- Soporte técnico en entornos sin conexión: un bot de ayuda para un producto concreto, con preguntas frecuentes y capacidad de invocar una API de conocimiento, desplegado localmente para garantizar privacidad.
- Prototipos de investigación en función calling: por su tamaño y licencia, es útil para experimentar con técnicas de tool use en modelos pequeños antes de escalar a versiones mayores.
- Aplicaciones educativas interactivas: un tutor que puede llamar a una calculadora o a un diccionario externo para responder preguntas de matemáticas o idiomas, funcionando en un portátil básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen puntuaciones en MMLU, HumanEval, GSM8K u otros conjuntos de evaluación para este modelo ni para su versión base MLX.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M, el modelo ocupa aproximadamente 0,6-0,7 GB de memoria; con Q8_0 sube a unos 1,1 GB. Puede ejecutarse en GPUs de consumo (RTX 2060, GTX 1080) e incluso en CPU.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente para inferencia. Para despliegue en producción, una RTX 3060 o superior ofrece margen.
- En consumer GPU: sí, cabe en la mayoría de GPUs de portátiles y de escritorio de gama media.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, vLLM (con soporte GGUF), TGI (no recomendado para GGUF), y cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos, pero en una CPU moderna se esperan latencias de 20-50 ms por token y throughput de 10-20 tokens/s en GPU de gama media.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Sin embargo, se puede contextualizar con otros modelos de 1B de la familia Gemma:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PetInst-LLM-1B (este) | ~1B | no disponible | gemma | restringido |
| Gemma-2-2B (Google) | 2.6B | 8K | gemma | abierto |
| TinyLlama-1.1B | 1.1B | 2K | Apache 2.0 | abierto |
| Qwen2-1.5B | 1.5B | 32K | Apache 2.0 | abierto |

El modelo PetInst-LLM-1B es más pequeño que Gemma-2-2B y Qwen2-1.5B, pero su ventaja es su enfoque específico en function calling y on-device, además de estar cuantizado en GGUF. La licencia gemma permite uso comercial bajo condiciones (atribución, restricciones de uso militar, etc.).

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso internacional.
- Sin información sobre sesgos o alucinaciones: al ser un modelo pequeño y sin benchmarks, se desconoce su fiabilidad en tareas complejas; puede producir respuestas incorrectas o inventadas.
- Licencia gemma: requiere aceptación de términos de uso, incluyendo restricciones sobre uso militar, y obliga a incluir atribución.
- Acceso restringido: en HuggingFace es necesario aceptar condiciones y autenticarse, lo que puede dificultar su adopción en pipelines automáticos.
- Contexto limitado: no se conoce la longitud de contexto, pero por ser de 1B probablemente no exceda los 8K tokens, lo que puede ser insuficiente para diálogos muy largos.
- Sin documentación técnica: no hay paper ni descripción del entrenamiento, por lo que no se puede evaluar su robustez o sus límites.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/manfye/PetInst-LLM-1B-GGUF
- Modelo base MLX: https://huggingface.co/manfye/PetInst-LLM-1B-MLX
- Página de modelos GGUF de HuggingFace (para explorar otros): https://huggingface.co/models?library=gguf
- Repositorio de IBM para scripts de conversión GGUF: https://github.com/IBM/gguf
