# iamtatsuki05/Mistral-EN-0.5B-PT-stage1

## Resumen
Mistral-EN-0.5B-PT-stage1 es un modelo de lenguaje decoder-only con arquitectura Mistral, desarrollado por iamtatsuki05 dentro del proyecto MIREI, y entrenado desde inicialización aleatoria sobre el corpus HuggingFaceFW/fineweb-edu. Con 567.854.592 parámetros totales (aproximadamente 0,57B), constituye un checkpoint de preentrenamiento en inglés que sirve como base para tareas generativas posteriores y para experimentación controlada sobre arquitecturas.

El modelo observa aproximadamente 10.000 millones de tokens con ventanas de contexto de 1.024 tokens durante el preentrenamiento, si bien la longitud máxima de secuencia declarada es de 2.048 tokens. No se trata de un modelo alineado ni instruido: es la etapa 1 de un pipeline de preentrenamiento, por lo que su utilidad principal es como backbone para fine-tuning, investigación comparativa de arquitecturas y desarrollo de pipelines propios.

Su relevancia actual radica en que forma parte de una serie que replica exactamente la misma receta de entrenamiento sobre distintas arquitecturas (Mistral y Qwen2.5), lo que permite aislar el efecto de la arquitectura en el rendimiento final. La licencia MIT y el reducido tamaño del repositorio (1,1 GB) facilitan su uso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (decoder-only transformer, RoPE) |
| Parametros totales | 567.854.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en preentrenamiento; longitud máxima de secuencia 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura Mistral, un transformer decoder-only con codificación posicional rotatoria (RoPE), dimensión de embedding de 1.536 y un tokenizador Mistral con vocabulario de 32.000 tokens. Se entrena desde inicialización aleatoria (no es un fine-tuning de un modelo existente), lo que lo convierte en un punto de partida limpio para estudiar el comportamiento del preentrenamiento.

El corpus de entrenamiento es HuggingFaceFW/fineweb-edu, con aproximadamente 10.000 millones de tokens observados y ventanas de contexto de 1.024 tokens. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna etapa de alineación posterior; se trata exclusivamente de la etapa 1 de preentrenamiento. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto en inglés a partir de un prompt, en modo completado (no instruido).
- Modelo base para fine-tuning supervisado y ajuste con instrucciones en etapas posteriores.
- Backbone para experimentación comparativa de arquitecturas dentro de la serie MIREI.
- Soporte de tool calling / function calling: no disponible (modelo base sin alineación).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso
- Fine-tuning supervisado para clasificación o generación de texto en inglés: al ser un checkpoint de preentrenamiento limpio, se puede adaptar a dominios concretos sin arrastrar sesgos de alineación previa.
- Investigación comparativa de arquitecturas: junto con el checkpoint Qwen2.5 de la misma serie, permite aislar el efecto de la arquitectura bajo una receta de entrenamiento idéntica.
- Generación de texto en prototipos y demos: con 0,57B parámetros cabe en GPU de consumo y permite iterar rápidamente en tareas de completado de texto.
- Entrenamiento de modelos pequeños en pipelines de investigación: sirve como base para estudiar dinámicas de preentrenamiento, curvas de pérdida y escalado a pequeña escala.
- Generación de datos sintéticos controlada: puede emplearse como generador de bajo coste en pipelines de aumento de datos, con validación posterior.
- Despliegue en entornos con recursos limitados: su tamaño permite servir el modelo en una única GPU consumer o incluso en CPU con cuantización, para tareas de completado de baja latencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: transformers (versión >= 4.51.0), text-generation-inference (el modelo está etiquetado como endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Mistral-EN-0.5B-PT-stage1 | 567.854.592 | 1.024 (entrenamiento) / 2.048 (máx.) | inglés | MIT | Checkpoint de preentrenamiento, sin alineación |
| Qwen2.5-Scratch-EN-0.5B-PT-stage1 (iamtatsuki05) | no disponible en la información | 1.024 (misma receta) | inglés | no disponible en la información | Misma receta de entrenamiento, arquitectura Qwen2.5 |
| Mistral 7B (Mistral AI) | ~7.000 millones | 8.192 | multilingüe | Apache 2.0 | Modelo base oficial de Mistral AI, mucho mayor |
| SmolLM2-360M (HuggingFace) | ~360 millones | 8.192 | inglés | Apache 2.0 | Alternativa pequeña preentrenada y alineada |

## Limitaciones y advertencias
- Es un modelo exclusivamente de preentrenamiento: no sigue instrucciones ni mantiene diálogos de forma fiable sin fine-tuning posterior.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente en secuencias largas.
- Ventana de contexto efectiva reducida (1.024 tokens en entrenamiento), lo que limita tareas que requieran contexto extenso.
- Solo soporta inglés; el rendimiento en otros idiomas será deficiente.
- Sesgos heredados de fineweb-edu: el corpus filtrado por calidad educativa puede sobrerrepresentar ciertos dominios y estilos.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero no hay garantías de calidad ni soporte.
- No se documentan evaluaciones de seguridad, sesgo ni robustez; no recomendado para producción sin validación y alineación previas.
- Los requisitos de software (transformers >= 4.51.0, flash-attn >= 2.7.3) deben cumplirse para un funcionamiento óptimo.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/iamtatsuki05/Mistral-EN-0.5B-PT-stage1)
- [Colección MIREI en Hugging Face](https://huggingface.co/collections/iamtatsuki05/mirei)
- [Repositorio GitHub MIREI](https://github.com/iamtatsuki05/MIREI)
- [Dataset HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- [Checkpoint Qwen2.5 de la misma serie](https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage1)
- [Licencia MIT](https://opensource.org/license/mit/)
