# Frost2o24/qwen2.5-coder-1.5b-mini-agent-b2

## Resumen

El modelo `Frost2o24/qwen2.5-coder-1.5b-mini-agent-b2` es un fine-tune del modelo base `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, desarrollado por Frost2o24. Se trata de una adaptación del conocido Qwen2.5-Coder de 1.5B de parámetros, orientada a tareas de agente (de ahí el sufijo "mini-agent"). El entrenamiento se realizó con las librerías Unsloth y TRL, lo que permitió un ajuste fino más rápido que el habitual. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto y código en inglés.

Su relevancia radica en ofrecer una versión compacta y cuantizada (4-bit) de un modelo de código, lo que facilita su despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en el borde. Al estar basado en Qwen2.5-Coder, hereda las capacidades de generación y comprensión de código de la familia Qwen, aunque con un tamaño reducido que prioriza la eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.5B (indicado en el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (base bnb-4bit) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El modelo original Qwen2.5-Coder incorpora tokens especiales para mejorar la comprensión del código, según el reporte técnico de Qwen2.5-Coder. El fine-tune se realizó sobre una versión cuantizada a 4-bit (bitsandbytes) del modelo instruct, utilizando Unsloth para acelerar el entrenamiento y TRL para el ajuste fino. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y código en inglés, heredadas del modelo base Qwen2.5-Coder.
- Comprensión de código fuente y asistencia en tareas de programación (autocompletado, explicación, depuración).
- Posible soporte para tareas de agente, dado el nombre "mini-agent", aunque no se documentan detalles específicos.
- No se confirma soporte de tool calling, function calling, visión o audio.

## Casos de uso

- Asistente de programación en entornos con recursos limitados: al ser un modelo de 1.5B cuantizado a 4-bit, puede ejecutarse en GPUs de consumo (p. ej., RTX 3060) o incluso en CPU con suficiente RAM, ofreciendo sugerencias de código en editores o IDEs ligeros.
- Generación de código en pipelines de CI/CD: su pequeño tamaño permite integrarlo en entornos de integración continua para generar tests, documentación o fragmentos de código sin necesidad de infraestructura pesada.
- Prototipado rápido de agentes conversacionales: el fine-tune orientado a agente podría utilizarse para construir asistentes que interactúen con APIs o ejecuten comandos, aunque no hay evidencia pública de tool calling.
- Educación y aprendizaje de programación: puede servir como tutor de código que explica fragmentos o propone soluciones, funcionando en portátiles sin GPU dedicada.
- Automatización de tareas de refactorización: el modelo puede sugerir cambios en código existente, aunque su tamaño limita la complejidad de las transformaciones.
- Inferencia en el borde: su bajo consumo de memoria lo hace apto para dispositivos embebidos o servidores de baja potencia donde se requiera generación de código básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de 1.5B en 4-bit, se estima que requiere menos de 2 GB de VRAM para inferencia (estimación basada en el tamaño, no confirmada por el autor).
- GPU recomendadas: no disponible. Por su tamaño, podría ejecutarse en GPUs consumer como RTX 3060 o superiores, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: al usar safetensors y ser compatible con transformers, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Frost2o24/qwen2.5-coder-1.5b-mini-agent-b2 | 1.5B | no disponible | Apache 2.0 | Fine-tune de Qwen2.5-Coder-1.5B para agente |
| Qwen/Qwen2.5-Coder-1.5B | 1.5B | 32k (según reporte técnico) | Apache 2.0 | Modelo base original, sin fine-tune específico |
| Qwen/Qwen2.5-Coder-7B | 7B | 32k | Apache 2.0 | Versión mayor, más capaz pero más pesada |

La comparativa se basa en información pública de la familia Qwen2.5-Coder. No se dispone de datos de rendimiento del modelo fine-tune frente al base.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente en inglés y código, puede tener un rendimiento limitado en otros idiomas.
- Riesgo de alucinación en generación de código: como todo LLM, puede producir código incorrecto o inventar APIs inexistentes.
- Contexto limitado: al no especificarse la longitud de contexto, se asume la del modelo base (32k), pero no está confirmado para este fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de las librerías utilizadas.
- El modelo no ha sido evaluado públicamente; no hay garantías de calidad para producción sin pruebas adicionales.

## Enlaces

- [HuggingFace - Frost2o24/qwen2.5-coder-1.5b-mini-agent-b2](https://huggingface.co/Frost2o24/qwen2.5-coder-1.5b-mini-agent-b2)
- [Qwen/Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B)
- [Colección Qwen2.5-Coder](https://huggingface.co/collections/Qwen/qwen25-coder)
- [Reporte técnico de Qwen2.5-Coder (arXiv)](https://arxiv.org/html/2409.12186v3)
- [Repositorio GitHub de Qwen2.5-Coder](https://github.com/huggingface/Qwen2.5-Coder)
