# InflexCZE/Ternary-Bonsai-2-27B-MLC

## Resumen

Ternary Bonsai 2 27B es un modelo de lenguaje causal derivado de Qwen3.8-27B, desarrollado originalmente por Prism ML y distribuido en este repositorio por InflexCZE en formato MLC (MLC-LLM) para inferencia en navegador mediante WebGPU. Su rasgo definitorio es la cuantización ternaria: todos los pesos del modelo de lenguaje se representan con valores {−1, 0, +1} en una base rotada fija, acompañados de una escala FP16 por cada grupo de 128 pesos. La arquitectura subyacente es la de Qwen3.8-27B, un transformer causal con atención híbrida, que se mantiene sin cambios respecto al modelo original.

El modelo resuelve el problema de ejecutar un LLM de 27B parámetros en entornos con recursos limitados, especialmente en el navegador, gracias a la drástica reducción de tamaño que permite la representación ternaria. Con 262K tokens de contexto y capacidad multimodal (acepta imágenes además de texto), se posiciona como una opción para aplicaciones conversacionales, agentes con tool calling y despliegues edge sin infraestructura GPU dedicada.

Este repositorio concreto es una conversión al formato MLC-LLM del modelo base en GGUF (`prism-ml/Ternary-Bonsai-2-27B-gguf`), orientada a WebGPU y a inferencia en navegador. La licencia es Apache 2.0 y el tamaño del repositorio es de 6,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (derivada de Qwen3.8-27B) |
| Parametros totales | 27B (según denominación del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | Ternaria ({−1, 0, +1} con escala FP16 por grupo de 128 pesos); empaquetado MLC y GGUF en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (este repo); GGUF en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con atención híbrida, heredada sin modificaciones de Qwen3.8-27B. La innovación principal no está en la arquitectura sino en la representación de pesos: cada peso del modelo de lenguaje se cuantiza a valores ternarios {−1, 0, +1} en una base rotada fija, con una escala FP16 compartida por cada grupo de 128 pesos. Esta representación reduce de forma muy agresiva el espacio de almacenamiento y el ancho de banda de memoria necesario para la inferencia, lo que habilita su ejecución en navegador vía WebGPU.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia atención híbrida del modelo base. El repositorio es una conversión de formato (GGUF a MLC) realizada por InflexCZE, no un reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes además de texto (modelo multimodal según la documentación de Prism ML).
- Tool calling / function calling para integración con herramientas externas.
- Razonamiento multi-paso y uso en flujos de agentes.
- Ventana de contexto de 262K tokens, adecuada para documentos largos y conversaciones extensas.
- Inferencia en navegador mediante WebGPU gracias al formato MLC-LLM.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: el modelo puede ejecutarse directamente en el navegador del usuario vía WebGPU, eliminando la necesidad de servidores de inferencia y reduciendo la latencia de red, gracias a su formato MLC y su tamaño de 6,2 GB.
- Análisis de documentos largos: con 262K tokens de contexto, permite resumir o consultar contratos, informes o bases de código extensas en una sola pasada sin fragmentación.
- Agentes con tool calling en entornos edge: su soporte de function calling y razonamiento multi-paso lo hace apto para automatizar tareas que requieran consultar APIs o ejecutar acciones encadenadas.
- Procesamiento de imágenes en aplicaciones de accesibilidad: al aceptar entradas visuales, puede describir imágenes o extraer información de capturas dentro de un flujo conversacional.
- Prototipado rápido sin infraestructura: investigadores pueden desplegar el modelo en local o en navegador para experimentar con cuantización ternaria y evaluar su calidad sin aprovisionar GPUs.
- Atención al cliente automatizada en productos con requisitos de privacidad: la inferencia local en el cliente evita enviar datos del usuario a servidores externos, lo que resulta relevante en sectores regulados.
- Educación y demos interactivas: su ejecución en navegador facilita publicar demos funcionales de un LLM de 27B sin costes de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,2 GB en formato MLC, por lo que la inferencia requiere del orden de 6-8 GB de memoria disponible en el dispositivo; no se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles de forma explícita; el formato MLC con WebGPU apunta a GPUs integradas y discretas accesibles desde navegador.
- Compatibilidad con GPU de consumo: por tamaño, es plausible en GPUs de consumo con al menos 8 GB de memoria, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: MLC-LLM (este repositorio), WebGPU en navegador; el modelo base está en GGUF, por lo que también sería desplegable con llama.cpp u Ollama a partir de aquel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B (este repo, MLC) | 27B | 262K | Ternaria + escala FP16 | Apache 2.0 | Hugging Face, MLC-LLM |
| Ternary Bonsai 2 27B (base, GGUF) | 27B | 262K | Ternaria, GGUF | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (modelo origen) | 27B | no disponible | FP16/BF16 original | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria introduce pérdida de precisión respecto al modelo original en FP16; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera de los idiomas del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de Qwen3.8-27B del que deriva.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria de su funcionamiento.
- La model card es prácticamente vacía; no hay instrucciones de uso, prompts recomendados ni notas de conversión.
- La inferencia en navegador depende de WebGPU, cuya disponibilidad y rendimiento varían según navegador y hardware del cliente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InflexCZE/Ternary-Bonsai-2-27B-MLC
- Modelo base en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Documentación de Prism ML sobre Ternary Bonsai 2 27B: https://docs.prismml.com/models/bonsai-2-27b
