# 3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated

## Resumen

El modelo `3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated` es un ajuste fino del modelo Qwen2.5-0.5B-Instruct, concretamente de la variante ya "abliterated" de huihui-ai (`huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3`). Lo desarrolla el usuario independiente 3MPER0RR como trabajo de investigación y experimentación, y su rasgo definitorio es la aplicación de un proceso de abliteración en múltiples rondas, una técnica que elimina la dirección de rechazo en el espacio de activaciones del modelo para reducir sus negativas a responder determinadas peticiones.

Se trata de un modelo pequeño: 494.032.768 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de 0,5 mil millones de parámetros. Hereda la arquitectura Qwen2 del modelo original y la licencia Apache 2.0. El repositorio ocupa aproximadamente 1,0 GB y el pipeline declarado es text-generation con orientación conversacional.

Su relevancia es acotada y muy específica: sirve como banco de pruebas de bajo coste para estudiar los efectos de la abliteración sobre un modelo instructivo pequeño, y para ejecutar conversación y generación de texto en hardware muy modesto. No es un modelo de propósito general de alto rendimiento ni compite con modelos de mayor tamaño; su interés es experimental y de despliegue ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), heredada del modelo base |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors en precision original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 |
| Proceso | Abliteracion en multiples rondas |
| Tamano del repositorio | 1,0 GB |
| Tensores totales | 290 |
| Tensores modificados | 13 (4,48 %) |
| Tensores sin cambios | 277 (95,52 %) |
| Desajustes estructurales | 0 |
| Formas y tipos de datos coincidentes | 290/290 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only con atención completa estándar, heredada sin cambios estructurales del modelo base. El autor documenta un proceso de abliteración en múltiples rondas sobre `huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3`, que a su vez es una variante ya abliterated del Qwen2.5-0.5B-Instruct original. La abliteración consiste en identificar la dirección de rechazo en las activaciones internas y proyectarla fuera de los pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones.

La model card aporta una comparación de pesos entre el modelo base y el resultado: de 290 tensores comparados, 13 (4,48 %) fueron modificados y 277 (95,52 %) permanecen idénticos, sin desajustes estructurales y con coincidencia total de formas y tipos de datos (290/290). No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset, ni etapas de RLHF o DPO específicas de este ajuste; el autor describe el trabajo como investigación y experimentación. Tampoco se detallan innovaciones técnicas más allá del propio procedimiento de abliteración multi-ronda.

## Capacidades

- Generación de texto conversacional en formato instruct, heredado del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a instrucciones y diálogo multi-turno, con el formato de chat de Qwen2.
- Reducción de rechazos: la abliteración busca que el modelo no decline peticiones que el modelo original rechazaría.
- Generación de texto general y tareas básicas de razonamiento y redacción propias de un modelo de 0,5B.
- Capacidades multilingües: no declaradas en la model card; no disponible.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la capacidad del modelo base de 0,5B en este terreno es limitada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con técnicas de abliteración: el modelo sirve como caso de estudio reproducible de cómo la proyección de la dirección de rechazo afecta a 13 de 290 tensores y qué impacto tiene en el comportamiento conversacional, gracias a la comparación de pesos documentada.
- Despliegue en entornos con recursos mínimos: con 494 millones de parámetros y un repositorio de 1,0 GB, puede ejecutarse en CPU o en GPU de gama baja para prototipos de generación de texto y chat.
- Pruebas de seguridad y alineación: útil para evaluar hasta qué punto un modelo pequeño abliterated responde a peticiones que un modelo alineado rechazaría, en el contexto de investigación sobre robustez de salvaguardas.
- Generación de texto de bajo coste en pipelines locales: resúmenes breves, reformulación de frases o respuestas plantilla donde no se requiere alta calidad y prima la latencia y el coste.
- Chatbot de demostración y docencia: permite ilustrar el funcionamiento de un transformer instructivo y del formato de chat Qwen en talleres o entornos educativos sin infraestructura dedicada.
- Evaluación comparativa de fine-tunes: al derivar de una cadena conocida (Qwen2.5-0.5B-Instruct → abliterated-v3 → este modelo), sirve como punto de comparación en estudios sobre el efecto de ajustes sucesivos en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; cómodo en cualquier GPU con 2 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB de pesos, más overhead; en 4 bits, alrededor de 0,25-0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; también funciona en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer actuales e incluso en placas con poca memoria.
- Opciones de despliegue: Transformers con PyTorch, vLLM, llama.cpp y Ollama (requiere conversión a GGUF, no incluida en el repositorio), TGI. El repositorio solo distribuye safetensors, por lo que para llama.cpp/Ollama habría que convertir los pesos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera una latencia muy baja y un throughput alto en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated | 494 M | no disponible | Apache 2.0 | Abliteración multi-ronda; 13/290 tensores modificados |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | ~494 M | no disponible | Apache 2.0 (heredada de Qwen2.5) | Modelo base directo; abliteración previa |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Modelo instructivo original alineado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Alternativa de mayor tamaño y calidad, más exigente en recursos |

La comparación de rendimiento entre estos modelos no puede establecerse con datos: no se han publicado benchmarks para el modelo de 3MPER0RR ni para la variante de huihui-ai en la información disponible. La diferencia principal frente a sus antecesores es la modificación de pesos por abliteración; frente a Qwen2.5-1.5B-Instruct, la diferencia es de escala (tres veces más parámetros) y, previsiblemente, de calidad, a costa de mayores requisitos de memoria.

## Limitaciones y advertencias

- La abliteración elimina o reduce la dirección de rechazo, por lo que el modelo puede producir contenido que el modelo original habría declinado; no debe desplegarse en producción orientada al público sin filtros y salvaguardas externas.
- Riesgo de alucinación elevado: con 0,5B parámetros, la fiabilidad factual es limitada y las respuestas pueden ser incorrectas o incoherentes en tareas complejas.
- Idiomas soportados no declarados; el comportamiento multilingüe no está garantizado ni documentado.
- Longitud de contexto no confirmada para este fine-tune; no asumir los 32.768 tokens del modelo base sin verificación.
- No hay datos de benchmarks ni evaluaciones de calidad o seguridad publicadas; el autor lo presenta como trabajo de investigación y experimentación, no como modelo listo para producción.
- Licencia Apache 2.0 permite uso comercial, pero la modificación de alineación puede contravenir políticas de plataformas o requisitos regulatorios según el caso de uso; la responsabilidad recae en el desplegador.
- El repositorio solo incluye safetensors; no hay variantes cuantizadas publicadas, lo que exige conversión manual para despliegues con llama.cpp u Ollama.
- Solo 13 tensores modificados (4,48 %): el alcance real de la abliteración es limitado y su efecto puede ser parcial o inconsistente entre tipos de peticiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated
- Modelo base: https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Licencia del repositorio: https://huggingface.co/3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated/blob/main/License
- Aviso de investigación: https://huggingface.co/3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated/blob/main/Disclaimer.md
