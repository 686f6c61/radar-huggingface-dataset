# Pranjalps1/Qwen3.5-2B-Code-Python-Base

## Resumen

El modelo **Pranjalps1/Qwen3.5-2B-Code-Python-Base** es un ajuste fino (fine-tune) del modelo base `Pranjalps1/Qwen3.5-2B-Code-Base`, desarrollado por el usuario Pranjalps1. Está orientado específicamente a la generación y comprensión de código en Python, partiendo de la arquitectura Qwen3.5 de 2.000 millones de parámetros. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permitió un proceso de ajuste más rápido que un entrenamiento convencional.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios. Aunque el pipeline declarado en Hugging Face es `image-text-to-text`, no se aportan evidencias de capacidades multimodales en la model card; todo apunta a que se trata de un modelo de texto puro especializado en código. Su tamaño compacto (2,27 mil millones de parámetros) lo hace adecuado para entornos con recursos limitados, como GPUs de consumo o inferencia en CPU.

La relevancia de este modelo radica en ofrecer una alternativa ligera y especializada en Python dentro de la familia Qwen3.5, que en su versión original ya destaca por su rendimiento en razonamiento y codificación. Al ser un fine-tune no oficial, conviene evaluar su comportamiento real antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, detalles exactos no disponibles) |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, una evolución de la serie Qwen que incorpora mejoras en razonamiento, codificación y capacidades multimodales según la documentación oficial de Qwen. Sin embargo, no se dispone de detalles específicos sobre la configuración interna (número de capas, cabezas de atención, tipo de atención) para este fine-tune concreto.

El entrenamiento consistió en un ajuste fino supervisado sobre el modelo base `Pranjalps1/Qwen3.5-2B-Code-Base`, utilizando la librería Unsloth para acelerar el proceso y la biblioteca TRL de Hugging Face para el pipeline de fine-tuning. No se especifica el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que se trata de un modelo ajustado para tareas de código, con énfasis en Python.

## Capacidades

- Generacion de codigo Python: el modelo está específicamente ajustado para producir código en Python, incluyendo funciones, scripts y fragmentos de programación.
- Razonamiento logico y matematico: heredado de la familia Qwen3.5, puede resolver problemas que requieren pasos de razonamiento.
- Comprension de contexto conversacional: el tag `conversational` sugiere que puede mantener diálogos multi-turno, aunque no se detalla su ventana de contexto.
- Soporte de tool calling: no confirmado en la documentación disponible; se requiere verificación empírica.
- Capacidades multimodales: a pesar del pipeline `image-text-to-text`, no hay evidencia de que este fine-tune procese imágenes; probablemente sea una etiqueta heredada del modelo base.

## Casos de uso

- Asistente de programacion en Python: puede integrarse en editores de código o IDEs para autocompletar, generar funciones boilerplate o explicar fragmentos de código.
- Generacion de scripts de automatizacion: útil para crear scripts de tareas repetitivas (procesamiento de archivos, scraping, etc.) a partir de descripciones en lenguaje natural.
- Educacion y aprendizaje: sirve como tutor de Python para estudiantes, generando ejemplos y resolviendo ejercicios de programación.
- Pruebas unitarias: puede generar casos de prueba básicos para funciones Python, ayudando a los desarrolladores a cubrir escenarios comunes.
- Documentacion de codigo: capaz de producir comentarios y docstrings a partir del código fuente, mejorando la mantenibilidad de proyectos.
- Chatbots de soporte tecnico: al mantener conversaciones y generar código, puede asistir en foros o sistemas de ticketing con respuestas que incluyen soluciones en Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune concreto. Se recomienda ejecutar pruebas propias en tareas de código Python antes de utilizarlo en entornos críticos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 (2 bytes por parámetro) se necesitan aproximadamente 4,6 GB de VRAM (2,27 B × 2 bytes). Con cuantización de 4 bits, la carga se reduce a unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (p. ej., RTX 2060, RTX 3060, T4). Para cuantización 4-bit, una GPU con 4 GB puede ser suficiente (p. ej., GTX 1650, RTX 3050).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: compatible con `transformers` (Python), `text-generation-inference`, `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama` (si se publica en su catálogo).
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU RTX 4090 se espera una latencia de decodificación inferior a 20 ms/token y un throughput de varios cientos de tokens por segundo, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Pranjalps1/Qwen3.5-2B-Code-Python-Base | 2,27 B | no disponible | Apache 2.0 | Python |
| Qwen2.5-Coder-1.5B | 1,54 B | 32 K | Apache 2.0 | Codigo (multi-lenguaje) |
| DeepSeek-Coder-1.3B | 1,3 B | 16 K | MIT | Codigo (multi-lenguaje) |

No se dispone de datos de rendimiento comparativo. El modelo base de este fine-tune (Qwen3.5-2B) pertenece a una generación más reciente que Qwen2.5, por lo que podría ofrecer mejor razonamiento, pero no hay benchmarks que lo confirmen para esta variante específica.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño (2,27 B), es propenso a generar código incorrecto o inventar APIs inexistentes. Verificar siempre la salida.
- Ventana de contexto desconocida: no se especifica la longitud máxima de entrada; podría ser corta (4K-8K), lo que limita su uso en proyectos grandes.
- Idioma limitado: solo entrenado en inglés; puede fallar con instrucciones en otros idiomas.
- Fine-tune no oficial: desarrollado por un tercero, no por el equipo de Qwen. No hay garantía de calidad ni soporte.
- Riesgo de seguridad: el código generado puede contener vulnerabilidades o ejecutar acciones peligrosas si se usa en automatización sin revisión.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni responsabilidad por daños.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Pranjalps1/Qwen3.5-2B-Code-Python-Base)
- [Modelo base: Pranjalps1/Qwen3.5-2B-Code-Base](https://huggingface.co/Pranjalps1/Qwen3.5-2B-Code-Base)
- [Qwen3.5 oficial en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio de Qwen3.5 en GitHub](https://github.com/ABDtmx/Qwen3.5)
- [Página de Qwen3.5:2b en Ollama](https://ollama.com/library/qwen3.5:2b)
