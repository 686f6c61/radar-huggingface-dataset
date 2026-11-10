# pranjalthakz/physics-tutor-lora

## Resumen

physics-tutor-lora es un ajuste fino (LoRA) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario pranjalthakz en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth, que acelera el proceso de fine-tuning. Su propósito declarado, a juzgar por el nombre, es actuar como tutor de física, aunque la model card no documenta el dataset de entrenamiento ni los objetivos concretos del ajuste.

Se trata de un modelo pequeño (1.500 millones de parámetros) orientado a generación de texto y declarado únicamente para inglés. La información publicada es mínima: no hay detalles sobre datos de entrenamiento, hiperparámetros, benchmarks ni evaluación. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es limitada y de carácter experimental: sirve como ejemplo de fine-tuning ligero con Unsloth sobre Qwen2.5 y como posible base para prototipos de tutoría educativa, pero carece de la documentación y validación necesarias para un uso en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 1.500 millones (modelo base Qwen2.5-1.5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantización | el modelo base está en bnb-4bit; el repositorio contiene safetensors (posiblemente adaptadores LoRA); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2. La técnica empleada es LoRA (Low-Rank Adaptation) mediante la librería Unsloth, que según la model card permite un entrenamiento "2x más rápido". El punto de partida es la versión del modelo base cuantizada a 4 bits con bitsandbytes, lo que reduce los requisitos de memoria durante el entrenamiento.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO adicionales, ni los hiperparámetros del ajuste. Tampoco se documenta ninguna innovación técnica más allá del uso de Unsloth para acelerar el fine-tuning. El nombre del modelo sugiere un corpus de contenido de física, pero esto no está confirmado en la documentación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas, presumiblemente orientado a temática de física por el ajuste, aunque no verificado.
- Soporte de conversación multi-turno propio de un modelo instruct.
- Tool calling y function calling: no documentado para este ajuste; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que se haya preservado tras el fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado de tutores educativos: el modelo puede emplearse como base para experimentar con respuestas a preguntas de física en inglés, aunque requiere evaluación previa de la calidad de las respuestas.
- Investigación sobre fine-tuning ligero: sirve como ejemplo reproducible de ajuste con Unsloth y LoRA sobre Qwen2.5-1.5B para estudiar técnicas de entrenamiento eficiente.
- Generación de explicaciones divulgativas: puede producir borradores de explicaciones de conceptos físicos en inglés que un humano revise antes de su publicación.
- Asistente de estudio en entornos controlados: adecuado para pruebas internas de conversación multi-turno sobre temario de física, sin exposición directa a usuarios finales.
- Base para ajustes posteriores: al ser un modelo pequeño con licencia Apache 2.0, puede servir como punto de partida para fine-tunings específicos en dominios educativos.
- Experimentación con despliegue en hardware modesto: su tamaño de 1.5B permite probar pipelines de inferencia en GPU de consumo, útil para validar infraestructura antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en cuantización de 4 bits y en torno a 3-4 GB en fp16 para un modelo de 1.5B (estimación basada en el tamaño de parámetros, no confirmada para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta declarada), llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| physics-tutor-lora | 1.5B | no disponible | Apache 2.0 | Hugging Face, sin descargas |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | Hugging Face |
| Phi-3.5-mini-instruct | 3.8B | 128.000 tokens | MIT | Hugging Face |

El modelo comparado más directo es su propio base, Qwen2.5-1.5B-Instruct, que cuenta con documentación completa, evaluación publicada y soporte multilingüe; physics-tutor-lora no aporta datos que permitan afirmar una mejora sobre él. SmolLM2-1.7B-Instruct y Phi-3.5-mini-instruct son alternativas de tamaño similar con documentación y benchmarks públicos.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos y calidad.
- Riesgo elevado de alucinación en contenido de física: no hay evaluación que garantice la corrección de las respuestas.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano.
- El modelo base está cuantizado a 4 bits, lo que puede degradar la calidad respecto al modelo original en precisión completa.
- No se confirma que las capacidades de tool calling del modelo base se hayan preservado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación hace desaconsejable su uso en producción sin una evaluación exhaustiva.
- Cero descargas y ausencia de comunidad: no hay evidencia de uso real ni informes de terceros.
- El nombre sugiere un dominio (física) que no está verificado en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/pranjalthakz/physics-tutor-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
